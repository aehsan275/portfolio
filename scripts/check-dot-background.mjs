import assert from 'node:assert/strict';

export async function checkDotBackground(page, base) {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('.ascii-sky')?.dataset.renderedTheme);
  await page.evaluate(() => document.fonts.ready);
  await page.clock.pauseAt(new Date('2030-01-01T00:01:00Z'));

  const canvas = page.locator('.ascii-sky');
  const alpha = (x, y, width, height) =>
    canvas.evaluate(
      (el, [x, y, width, height]) =>
        Array.from(el.getContext('2d').getImageData(x, y, width, height).data).filter(
          (_, index) => index % 4 === 3,
        ),
      [x, y, width, height],
    );

  const initial = await alpha(0, 90, 180, 220);
  const trailArea = () => alpha(48, 175, 48, 30);
  const restArea = await trailArea();
  const areaInk = async () => (await trailArea()).reduce((sum, value) => sum + value, 0);
  assert(
    initial.some((value) => value > 0),
    'resting grid contains visible dots',
  );
  assert.equal(await canvas.getAttribute('data-running'), 'false');
  const fade = await canvas.evaluate((el) => {
    const rect = document.querySelector('.intro').getBoundingClientRect();
    const y = Math.floor((rect.top + rect.height / 2) / 10) * 10;
    const context = el.getContext('2d');
    return [120, 55, 10, -26].map((offset) => {
      const x = Math.floor((rect.left - offset) / 8) * 8;
      const pixels = context.getImageData(x, y, 8, 10).data;
      return Math.max(...Array.from(pixels).filter((_, index) => index % 4 === 3));
    });
  });
  assert(
    fade.every((value, i) => !i || value <= fade[i - 1]) && fade[0] > fade.at(-1),
    'dots fade into reading areas',
  );

  await page.evaluate(() => {
    window.hoverDraws = [];
    const arc = CanvasRenderingContext2D.prototype.arc;
    CanvasRenderingContext2D.prototype.arc = function (x, y, size, ...args) {
      if (this.canvas.matches('.ascii-sky')) window.hoverDraws.push({ x, y, size });
      return arc.call(this, x, y, size, ...args);
    };
  });
  await page.mouse.move(70, 190);
  await page.clock.runFor(32);
  const draws = await page.evaluate(() => window.hoverDraws);
  assert(draws.length > 0);
  assert(draws.every(({ x, y }) => Math.hypot(x - 70, y - 190) < 96));
  assert(
    Math.max(
      ...draws.filter(({ x, y }) => Math.hypot(x - 70, y - 190) < 20).map(({ size }) => size),
    ) >
      Math.max(
        ...draws.filter(({ x, y }) => Math.hypot(x - 70, y - 190) > 65).map(({ size }) => size),
      ),
    'magnification tapers away from the pointer',
  );
  assert.notDeepEqual(await alpha(0, 90, 180, 220), initial);
  assert.equal(await canvas.getAttribute('data-running'), 'false');
  await page.clock.runFor(500);
  assert.equal(
    (await page.evaluate(() => window.hoverDraws)).length,
    draws.length,
    'stationary cursor does not redraw',
  );

  const restInk = restArea.reduce((sum, value) => sum + value, 0);
  const nearInk = await areaInk();
  await page.mouse.move(70, 315);
  await page.clock.runFor(32);
  const trailInk = await areaInk();
  await page.clock.runFor(100);
  const shrinkingInk = await areaInk();
  assert(
    nearInk > trailInk && trailInk > shrinkingInk && shrinkingInk > restInk,
    'passed dots shrink gently',
  );
  await page.clock.runFor(180);
  assert.deepEqual(await trailArea(), restArea, 'tail restores the resting dots');
  assert.equal(await canvas.getAttribute('data-running'), 'false');
  await page.mouse.move(710, 420);
  await page.clock.runFor(32);
  const fadedCount = Number(await canvas.getAttribute('data-hover-cells'));
  await page.mouse.move(70, 420);
  await page.clock.runFor(32);
  assert(
    Number(await canvas.getAttribute('data-hover-cells')) > fadedCount,
    'hover fades around text',
  );

  await page.evaluate(() => {
    window.hoverDraws = [];
    window.scrollTo({ top: 420, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });
  await page.clock.runFor(48);
  const scrolled = await page.evaluate(() => ({ y: scrollY, draws: window.hoverDraws }));
  assert(scrolled.y > 0 && scrolled.draws.some(({ y }) => Math.abs(y - scrolled.y - 420) < 10));
  await page.evaluate(() =>
    document.documentElement.dispatchEvent(new PointerEvent('pointerleave')),
  );
  assert.equal(await canvas.getAttribute('data-hover-cells'), '0');
  assert.equal(await canvas.getAttribute('data-running'), 'false');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.name[data-reduced="true"]').waitFor();
  await page.mouse.move(80, 180);
  await page.clock.runFor(48);
  assert.equal(
    await canvas.getAttribute('data-hover-cells'),
    '0',
    'reduced motion has no cursor magnification',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(48);
  assert(
    (await alpha(0, 0, 8, 10)).some((value) => value > 0),
    'mobile keeps the plain dot grid',
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.runFor(48);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.clock.runFor(48);
  console.log(
    'Dots: smooth text fade, growing and shrinking trail, resize, scroll and reduced motion passed',
  );
}
