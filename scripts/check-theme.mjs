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
        document.querySelector('.portfolio')?.dataset.theme === value && canvas?.dataset.motifSeed
      );
    }, theme);
    await page.evaluate(() => document.fonts.ready);
  };
  const scene = () =>
    page.locator('.ascii-sky').evaluate((el) => ({
      seed: el.dataset.motifSeed,
      motifs: JSON.parse(el.dataset.motifLayout),
    }));
  const raster = () =>
    page
      .locator('.ascii-sky')
      .evaluate((el) => Array.from(el.getContext('2d').getImageData(0, 0, 8, 10).data));
  const geometry = () => page.locator('.site-header').boundingBox();
  try {
    await fs.mkdir('.qa/theme', { recursive: true });
    await page.goto(base);
    await ready('charcoal');
    const original = await scene();
    const originalGeometry = await geometry();
    const darkRaster = await raster();
    assert.equal(
      await page.locator('html').getAttribute('data-theme'),
      'charcoal',
      'system dark default',
    );
    assert.equal(
      await page.getByRole('button', { name: 'dark', exact: true }).getAttribute('aria-pressed'),
      'true',
    );
    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.portfolio'));
      return {
        background: style.backgroundColor,
        body: style.color,
        heading: getComputedStyle(document.querySelector('h1')).color,
        link: getComputedStyle(document.querySelector('.contact-links a')).color,
        banner: getComputedStyle(document.querySelector('.banner-center')).fill,
        grid: style.getPropertyValue('--grid-opacity').trim(),
        gridReading: style.getPropertyValue('--grid-reading-opacity').trim(),
      };
    });
    assert.equal(colors.background, 'rgb(33, 31, 27)');
    assert.equal(colors.body, 'rgb(212, 205, 191)');
    assert.equal(colors.heading, 'rgb(238, 230, 214)');
    assert.equal(colors.link, 'rgb(213, 151, 121)');
    assert.equal(colors.banner, colors.background, 'banner cutouts match the dark surface');
    assert.equal(Number(colors.grid), 0.16);
    assert.equal(Number(colors.gridReading), 0.1);
    await page.screenshot({ path: '.qa/theme/about-dark-1440.png', fullPage: true });

    await page.emulateMedia({ colorScheme: 'light' });
    await ready('paper');
    assert.deepEqual(
      await scene(),
      original,
      'system theme change preserves motif choices and geometry',
    );
    const lightRaster = await raster();
    assert.notDeepEqual(lightRaster, darkRaster, 'canvas dots are recolored');
    assert.deepEqual(await geometry(), originalGeometry, 'theme preserves header geometry');
    await page.getByRole('button', { name: 'dark', exact: true }).click();
    await ready('charcoal');
    assert.deepEqual(await scene(), original, 'manual theme change preserves the entire scene');
    assert.deepEqual(await raster(), darkRaster, 'returning to dark restores the same dot raster');
    assert.equal(await page.evaluate(() => localStorage.getItem('portfolio-theme')), 'charcoal');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    await ready('charcoal');
    await page
      .getByRole('navigation', { name: 'main navigation' })
      .getByRole('link', { name: 'experience' })
      .click();
    await ready('charcoal');
    const workScene = await scene();
    assert.equal(workScene.seed, original.seed, 'navigation preserves scene seed');
    for (const motif of original.motifs) {
      assert.deepEqual(
        workScene.motifs.find((m) => m.id === motif.id),
        motif,
      );
    }
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
    await page.getByRole('button', { name: 'light', exact: true }).focus();
    await page.keyboard.press('Enter');
    await ready('paper');
    await page.keyboard.press('Tab');
    assert.equal(
      await page
        .getByRole('button', { name: 'dark', exact: true })
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
    await tab.getByRole('button', { name: 'light', exact: true }).click();
    await tab.waitForSelector('.portfolio[data-theme="paper"]');
  } finally {
    await blocked.close();
  }
  console.log(
    'Theme checks passed: system, persistence, keyboard, stable scene, mobile, storage fallback.',
  );
}
