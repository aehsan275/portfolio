import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

export async function checkTheme(browser, base) {
  const context = await browser.newContext({
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const ready = async (theme) => {
    await page.waitForFunction((value) => {
      const canvas = document.querySelector('.ascii-sky');
      return (
        document.querySelector('.portfolio')?.dataset.theme === value &&
        canvas?.dataset.renderedTheme === value
      );
    }, theme);
    await page.evaluate(() => document.fonts.ready);
  };
  const raster = () =>
    page
      .locator('.ascii-sky')
      .evaluate((el) => Array.from(el.getContext('2d').getImageData(0, 0, 8, 10).data));
  const geometry = () => page.locator('.home-composition').boundingBox();
  try {
    await fs.mkdir('.qa/theme', { recursive: true });
    await page.goto(base);
    await ready('charcoal');
    const originalGeometry = await geometry();
    const darkRaster = await raster();
    assert.equal(
      await page.locator('html').getAttribute('data-theme'),
      'charcoal',
      'system dark default',
    );
    assert.equal(
      await page
        .getByRole('button', { name: 'Switch to light mode', exact: true })
        .getAttribute('aria-pressed'),
      'true',
    );
    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.portfolio'));
      return {
        background: style.backgroundColor,
        body: style.color,
        heading: getComputedStyle(document.querySelector('h1')).color,
        link: getComputedStyle(document.querySelector('.contact-links a')).color,
        grid: style.getPropertyValue('--grid-opacity').trim(),
        gridReading: style.getPropertyValue('--grid-reading-opacity').trim(),
      };
    });
    assert.equal(colors.background, 'rgb(32, 32, 31)');
    assert.equal(colors.body, 'rgb(213, 213, 213)');
    assert.equal(colors.heading, 'rgb(240, 240, 240)');
    assert.equal(colors.link, 'rgb(220, 220, 220)');
    assert.equal(Number(colors.grid), 0.14);
    assert.equal(Number(colors.gridReading), 0.08);
    await page.screenshot({ path: '.qa/theme/about-dark-1440.png', fullPage: true });

    await page.emulateMedia({ colorScheme: 'light' });
    await ready('paper');
    const lightRaster = await raster();
    assert.notDeepEqual(lightRaster, darkRaster, 'canvas dots are recolored');
    assert.deepEqual(await geometry(), originalGeometry, 'theme preserves intro geometry');
    await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
    await ready('charcoal');
    const restoredRaster = await raster();
    assert(
      restoredRaster.every((channel, index) => {
        if (index % 4 === 3) return channel === darkRaster[index];
        const alpha = darkRaster[index - (index % 4) + 3];
        // Unpremultiplying very faint pixels can magnify a one-level rounding difference.
        return (
          Math.abs(
            Math.round((channel * alpha) / 255) - Math.round((darkRaster[index] * alpha) / 255),
          ) <= 1
        );
      }),
      'returning to dark restores the dot raster within one premultiplied level',
    );
    assert.equal(await page.evaluate(() => localStorage.getItem('portfolio-theme')), 'charcoal');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    await ready('charcoal');
    await page.locator('.summary').getByRole('link', { name: 'nexaquanta' }).click();
    await ready('charcoal');
    await page.screenshot({ path: '.qa/theme/work-dark-1440.png', fullPage: true });
    await page.reload();
    await ready('charcoal');
    assert.equal(
      await page.locator('html').getAttribute('data-theme'),
      'charcoal',
      'manual choice survives refresh',
    );
    await page.goto(base + '/thoughts/who-are-we');
    await ready('charcoal');
    await page.screenshot({ path: '.qa/theme/thought-dark-1440.png', fullPage: true });
    await page.getByRole('button', { name: 'Switch to light mode', exact: true }).focus();
    await page.keyboard.press('Enter');
    await ready('paper');
    assert.equal(
      await page
        .getByRole('button', { name: 'Switch to dark mode', exact: true })
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page.keyboard.press('Space');
    await ready('charcoal');
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base);
      await ready('charcoal');
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${width}: no overflow`,
      );
      assert.equal(await page.locator('.ascii-sky').getAttribute('data-running'), 'false');
      await page.screenshot({ path: `.qa/theme/about-dark-${width}.png`, fullPage: true });
    }
    assert.deepEqual(errors, [], 'no theme browser errors');
  } finally {
    await context.close();
  }

  // Storage restrictions must not prevent first paint or an in-memory manual choice.
  const blocked = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
  try {
    await blocked.addInitScript(() => {
      Storage.prototype.getItem = Storage.prototype.setItem = () => {
        throw new DOMException('Blocked', 'SecurityError');
      };
    });
    const tab = await blocked.newPage();
    await tab.goto(base);
    await tab.waitForSelector('.portfolio[data-theme="charcoal"]');
    await tab.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
    await tab.waitForSelector('.portfolio[data-theme="paper"]');
  } finally {
    await blocked.close();
  }
  console.log(
    'Theme checks passed: system, persistence, keyboard, dot colors, mobile, storage fallback.',
  );
}
