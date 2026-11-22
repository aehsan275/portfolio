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
        const result = await page.locator('.ascii-sky').evaluate((c) => {
          const dpr = devicePixelRatio,
            w = Math.round(8 * dpr),
            h = Math.round(10 * dpr),
            ctx = c.getContext('2d');
          const tiles = Array.from({ length: 12 }, (_, i) =>
            Array.from(ctx.getImageData((i + 3) * w, 0, w, h).data).filter((_, i) => i % 4 === 3),
          );
          const centers = tiles.map((tile) => {
            const mass = tile.reduce((sum, value) => sum + value, 0);
            return tile.reduce(
              ([x, y], alpha, i) => [
                x + ((i % w) * alpha) / mass,
                y + (Math.floor(i / w) * alpha) / mass,
              ],
              [0, 0],
            );
          });
          const transform = ctx.getTransform();
          return {
            unique: new Set(tiles.map((tile) => tile.join(','))).size,
            visible: tiles.every((tile) => tile.some((a) => a > 0)),
            aligned: centers.every(
              ([x, y]) => Math.hypot(x - centers[0][0], y - centers[0][1]) < 0.5,
            ),
            running: c.dataset.running,
            scale: transform.a,
          };
        });
        if (width >= 1024)
          assert.equal(result.unique, 1, `${zoom}: margin dots have identical pixel weight`);
        assert(
          result.aligned,
          `${zoom}: dot centers align even where reading fades affect opacity`,
        );
        assert(result.visible, `${zoom}: grid remains visible`);
        assert.equal(result.scale, 1, 'cached bitmaps are copied without fractional resampling');
        assert.equal(result.running, 'false', 'zoom does not create an idle animation loop');
        if (changeLayout) {
          const gap = await page.evaluate(() => {
            const opening = document.querySelector('main').getBoundingClientRect();
            return (
              document.querySelector('.site-footer').getBoundingClientRect().top - opening.bottom
            );
          });
          assert(gap >= 0 && gap <= 50, `${zoom}: bounded content-to-footer gap (${gap})`);
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
