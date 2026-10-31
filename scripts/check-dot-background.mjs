import assert from 'node:assert/strict';

export async function checkDotBackground(page, base) {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.clock.pauseAt(new Date('2030-01-01T00:01:00Z'));
  const canvas = page.locator('.ascii-sky');
  const image = () => canvas.evaluate((el) => el.toDataURL());
  const sample = () =>
    canvas.evaluate((el) => Array.from(el.getContext('2d').getImageData(0, 0, 8, 10).data));
  const resting = await image();
  assert(Number(await canvas.getAttribute('data-motifs')) >= 2);
  assert(
    Number(await canvas.getAttribute('data-motif-cells')) > 50,
    'static tilework contributes visible characters',
  );
  assert(
    (await sample()).some((value, i) => i % 4 === 3 && value > 0),
    'resting grid contains visible dots',
  );
  assert.equal(await canvas.getAttribute('data-running'), 'false', 'no idle animation loop');
  await page.evaluate(() => {
    window.__draws = [];
    window.__frames = 0;
    window.__reads = 0;
    window.__fillText = CanvasRenderingContext2D.prototype.fillText;
    window.__clearRect = CanvasRenderingContext2D.prototype.clearRect;
    window.__rect = Element.prototype.getBoundingClientRect;
    CanvasRenderingContext2D.prototype.fillText = function (glyph, x, y, ...args) {
      if (this.canvas.matches('.ascii-sky')) window.__draws.push({ glyph, x, y });
      return window.__fillText.call(this, glyph, x, y, ...args);
    };
    CanvasRenderingContext2D.prototype.clearRect = function (x, y, w, h) {
      if (this.canvas.matches('.ascii-sky') && w > 100) window.__frames++;
      return window.__clearRect.call(this, x, y, w, h);
    };
    Element.prototype.getBoundingClientRect = function () {
      if (this.matches('.ascii-sky,[data-reading]')) window.__reads++;
      return window.__rect.call(this);
    };
  });
  await page.mouse.move(160, 160);
  await page.clock.runFor(80);
  await page.mouse.move(320, 190);
  await page.clock.runFor(80);
  assert(Number(await canvas.getAttribute('data-ink-cells')) > 0, 'pointer emits ink cells');
  assert.notEqual(await image(), resting, 'trail changes resting dots');
  await page.screenshot({ path: '.qa/dots/trail-1440.png' });
  const draws = await page.evaluate(() => window.__draws);
  assert(
    draws.length > 0 &&
      draws.every((c) => ':+*'.includes(c.glyph) && c.x % 8 === 4 && c.y % 10 === 8),
    'trail stays on the fixed character lattice',
  );
  assert(
    draws.every((c) => c.y >= 148 && c.y <= 208),
    'ink follows the pointer segment without expanding circles',
  );
  await page.clock.runFor(900);
  assert.equal(await canvas.getAttribute('data-ink-cells'), '0');
  assert.equal(await canvas.getAttribute('data-running'), 'false');
  assert((await image()) === resting, 'expired trail restores the exact dot and tilework field');
  const idleFrames = await page.evaluate(() => window.__frames);
  await page.clock.runFor(1200);
  assert.equal(
    await page.evaluate(() => window.__frames),
    idleFrames,
    'stationary pointer does not restart animation',
  );
  await page.evaluate(() => {
    window.__frames = 0;
    window.__reads = 0;
  });
  await page.mouse.move(480, 240);
  await page.clock.runFor(80);
  assert(
    Number(await canvas.getAttribute('data-ink-cells')) > 0,
    'trail restarts after a long idle pause',
  );
  await page.clock.runFor(920);
  assert((await page.evaluate(() => window.__frames)) <= 31, 'trail renders at most 30fps');
  assert.equal(await page.evaluate(() => window.__reads), 0, 'trail performs no layout reads');
  await page.clock.runFor(500);
  await page.mouse.move(30, 450);
  await page.clock.runFor(400);
  const text = await page.locator('.intro-bio').boundingBox();
  await page.mouse.move(text.x + text.width / 2, text.y + text.height / 2);
  await page.clock.runFor(80);
  const enteringText = Number(await canvas.getAttribute('data-ink-opacity'));
  assert(enteringText > 0 && enteringText < 1, 'trail fades rather than snapping over text');
  await page.clock.runFor(350);
  assert(
    Number(await canvas.getAttribute('data-ink-opacity')) < 0.03,
    'trail fades out over reading areas',
  );
  await page.mouse.move(30, 450);
  await page.clock.runFor(80);
  const leavingText = Number(await canvas.getAttribute('data-ink-opacity'));
  assert(leavingText > 0.03 && leavingText < 0.95, 'trail returns progressively outside text');
  await page.clock.runFor(350);
  assert(
    Number(await canvas.getAttribute('data-ink-opacity')) > 0.97,
    'trail returns to full margin visibility',
  );
  await page.clock.runFor(1000);
  for (const [scope, name] of [
    ['nav', 'projects'],
    ['main', 'mm kinetics'],
    ['nav', 'thoughts'],
    ['nav', 'about'],
  ]) {
    const container =
      scope === 'nav'
        ? page.getByRole('navigation', { name: 'main navigation' })
        : page.locator('main');
    await container.getByRole('link', { name, exact: true }).click();
    await page.clock.runFor(150);
    await page.mouse.move(24, 420);
    await page.clock.runFor(80);
    assert(
      Number(await canvas.getAttribute('data-ink-cells')) > 0,
      'trail survives navigation to ' + name,
    );
    await page.clock.runFor(1200);
    await page.mouse.move(48, 440);
    await page.clock.runFor(80);
    assert(
      Number(await canvas.getAttribute('data-ink-cells')) > 0,
      'trail restarts after settling on ' + name,
    );
    await page.clock.runFor(1000);
  }
  await page
    .getByRole('navigation', { name: 'main navigation' })
    .getByRole('link', { name: 'projects', exact: true })
    .click();
  await page.locator('#project-kinetics').waitFor();
  await page
    .getByRole('navigation', { name: 'main navigation' })
    .getByRole('link', { name: 'thoughts', exact: true })
    .click();
  await page.locator('main').getByRole('link', { name: 'who are we?', exact: true }).click();
  await page.locator('.detail-content').waitFor();
  await page.clock.runFor(300);
  const beforeScroll = await sample();
  const beforeScrollImage = await image();
  assert.equal(await canvas.getAttribute('data-motif-variants'), '3');
  await page.evaluate(() => {
    document.querySelector('.detail-content p:last-child').scrollIntoView({ behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });
  const scroll = await page.evaluate(() => scrollY);
  assert(scroll > 0, 'test actually scrolls a long article');
  assert.equal((await canvas.boundingBox()).y, -scroll, 'background scrolls with the document');
  assert(
    (await canvas.boundingBox()).height >=
      (await page.evaluate(() => document.documentElement.scrollHeight - 1)),
    'background covers the full document',
  );
  assert((await image()) === beforeScrollImage, 'scrolling preserves the cached page artwork');
  await page.evaluate(() => {
    window.__draws = [];
  });
  await page.mouse.move(30, 250);
  await page.clock.runFor(80);
  const scrolledDraws = await page.evaluate(() => window.__draws);
  assert(
    scrolledDraws.some((c) => Math.abs(c.y - (scroll + 250)) < 20),
    'trail follows the pointer in document coordinates',
  );
  await page.clock.runFor(1000);
  const restoredSample = await sample();
  assert(
    restoredSample.every(
      (value, index) => index % 4 !== 3 || Math.abs(value - beforeScroll[index]) <= 1,
    ),
    'resting dot alpha/positions survive scroll and trail restoration (one alpha level of raster rounding allowed)',
  );
  await page.mouse.move(600, 250);
  await page.clock.runFor(80);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await image();
  await page.clock.runFor(1200);
  assert.equal(await image(), hidden, 'backgrounding stops animation');
  assert.equal(await canvas.getAttribute('data-running'), 'false');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page
    .getByRole('navigation', { name: 'main navigation' })
    .getByRole('link', { name: 'about', exact: true })
    .click();
  await page.locator('.name').waitFor();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.name[data-reduced="true"]').waitFor();
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });
  await page.clock.runFor(400);
  const reducedDraws = await page.evaluate(() => window.__draws.length);
  assert(
    Number(await canvas.getAttribute('data-motifs')) >= 2,
    'reduced motion retains static tilework',
  );
  await page.mouse.move(800, 250);
  await page.clock.runFor(1400);
  assert.equal(
    await page.evaluate(() => window.__draws.length),
    reducedDraws,
    'reduced motion emits no foreground trail glyphs',
  );
  assert.equal(
    await canvas.getAttribute('data-running'),
    'false',
    'reduced motion has no trail animation loop',
  );
  assert.equal(await canvas.getAttribute('data-ink-cells'), '0');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.clock.runFor(64);
  assert.equal(
    (await canvas.boundingBox()).width,
    await page.evaluate(() => document.body.clientWidth),
  );
  assert(
    (await sample()).some((v, i) => i % 4 === 3 && v > 0),
    'mobile retains quieter dot field',
  );
  assert.equal(await canvas.getAttribute('data-motifs'), '0', 'mobile omits tilework');
  assert.equal(await canvas.getAttribute('data-ink-cells'), '0', 'mobile omits ink');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.runFor(64);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
    CanvasRenderingContext2D.prototype.fillText = window.__fillText;
    CanvasRenderingContext2D.prototype.clearRect = window.__clearRect;
    Element.prototype.getBoundingClientRect = window.__rect;
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.name[data-reduced="false"]').waitFor();
  await page.clock.runFor(64);
  await page.clock.resume();
  console.log(
    'Dot grid: fixed cells, trail restoration, idle stop, frame cap, visibility, reduced motion and responsive behavior passed',
  );
}
