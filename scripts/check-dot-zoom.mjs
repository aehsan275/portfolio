import assert from 'node:assert/strict';

export async function checkDotZoom(browser, base) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const session = await context.newCDPSession(page);
    for (const changeLayout of [false, true]) {
      for (const zoom of [0.67, 0.8, 0.9, 1.1, 1.25, 1.5, 2, 2.5, 3, 1]) {
        const width = changeLayout ? Math.round(1440 / zoom) : 1440;
        const height = changeLayout ? Math.round(900 / zoom) : 900;
        await session.send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: zoom,
          mobile: false,
        });
        // CDP changes DPR without emitting the native resize/media notifications.
        // Supply the resize event that desktop zoom and display changes produce.
        await page.evaluate(() => window.dispatchEvent(new Event('resize')));
        await page.waitForFunction(() => {
          const c = document.querySelector('.ascii-sky'),
            r = c.getBoundingClientRect(),
            dpr = devicePixelRatio;
          return (
            c.width === Math.round(r.width * dpr) &&
            c.height === Math.round(r.height * dpr) &&
            Math.abs(Number(c.dataset.cellWidth) * dpr - Math.round(8 * dpr)) < 0.001
          );
        });
        await page.waitForFunction(() => {
          const slot = document.querySelector('.back-to-top-slot');
          const root = document.documentElement;
          return !slot.hidden === root.scrollHeight - slot.offsetHeight > root.clientHeight + 1;
        });
        if (await page.getByRole('button', { name: 'back to top' }).isVisible()) {
          await page.getByRole('button', { name: 'back to top' }).click();
          await page.waitForFunction(() => scrollY === 0);
        }
        const headerDots = await page.locator('.ascii-sky').evaluate((c) => {
          const d = JSON.parse(c.dataset.headerDots),
            context = c.getContext('2d');
          return {
            ...d,
            alpha: context.getImageData(Math.floor(d.x + 10 * d.cellWidth), Math.floor(d.y), 1, 1)
              .data[3],
          };
        });
        assert(
          Math.abs(
            (headerDots.x - headerDots.dotCenterX) / headerDots.cellWidth -
              Math.round((headerDots.x - headerDots.dotCenterX) / headerDots.cellWidth),
          ) < 0.0001,
          'header dots align horizontally with grid ink',
        );
        assert(
          Math.abs(
            (headerDots.y - headerDots.dotCenterY) / headerDots.cellHeight -
              Math.round((headerDots.y - headerDots.dotCenterY) / headerDots.cellHeight),
          ) < 0.0001,
          'header dots align vertically with grid ink',
        );
        assert(
          headerDots.alpha > 160,
          'header dots are more visible than resting dots at each zoom',
        );

        const ornamentCenters = await page.evaluate(() => {
          const c = document.querySelector('.ascii-sky').getBoundingClientRect();
          return [...document.querySelectorAll('.banner-knot, .banner-center')].map((el) => {
            const r = el.getBoundingClientRect();
            return {
              x: (r.left + r.width / 2 - c.left) * devicePixelRatio,
              y: (r.top + r.height / 2 - c.top) * devicePixelRatio,
            };
          });
        });
        assert(
          ornamentCenters.every((point) => Math.abs(point.y - headerDots.y) < 0.05),
          'all header ornaments center on the grid-aligned dot row',
        );
        assert(
          Math.abs(
            ornamentCenters[2].x -
              (headerDots.x + ((headerDots.count - 1) * headerDots.cellWidth) / 2),
          ) < 0.05,
          'central diamond is centered on the dot span',
        );
        const result = await page.locator('.ascii-sky').evaluate((c) => {
          const dpr = devicePixelRatio,
            w = Math.round(8 * dpr),
            h = Math.round(10 * dpr),
            ctx = c.getContext('2d');
          const tiles = Array.from({ length: 12 }, (_, i) =>
            Array.from(ctx.getImageData((i + 3) * w, 0, w, h).data).filter((_, i) => i % 4 === 3),
          );
          const transform = ctx.getTransform();
          return {
            unique: new Set(tiles.map((tile) => tile.join(','))).size,
            visible: tiles.every((tile) => tile.some((a) => a > 0)),
            running: c.dataset.running,
            scale: transform.a,
          };
        });
        assert.equal(result.unique, 1, `${zoom}: every resting dot has identical pixel weight`);
        assert(result.visible, `${zoom}: grid remains visible`);
        assert.equal(result.scale, 1, 'cached bitmaps are copied without fractional resampling');
        assert.equal(result.running, 'false', 'zoom does not create an idle animation loop');
        if (changeLayout) {
          const gap = await page.evaluate(() => {
            const opening = document.querySelector('.home-composition').getBoundingClientRect();
            return (
              document.querySelector('.site-footer').getBoundingClientRect().top - opening.bottom
            );
          });
          assert(gap >= 40 && gap <= 110, `${zoom}: bounded content-to-footer gap (${gap})`);
        }
        if (changeLayout && [0.8, 1.25, 2].includes(zoom))
          await page.evaluate(
            () =>
              new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
        if (changeLayout && [0.8, 1.25, 2].includes(zoom))
          await page.screenshot({ path: `.qa/dots/zoom-${Math.round(zoom * 100)}.png` });
      }
    }
    console.log(
      'Zoom: uniform dots at 67–300%, density-only changes, responsive zoom and reset passed',
    );
  } finally {
    await context.close();
  }
}
