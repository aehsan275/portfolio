import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => localStorage.removeItem('portfolio-night'));
await fs.mkdir('.qa/current', { recursive: true });
async function claim(id = 2) {
  const before = await page.locator('.v-kite').evaluateAll((els) =>
    els.map((el) => ({
      id: el.dataset.kiteId,
      x: el.getBoundingClientRect().x,
      y: el.getBoundingClientRect().y,
    })),
  );
  await page.locator(`[data-kite-id="${id}"]`).focus();
  await page.keyboard.press('Enter');
  await page.locator('.v-game-hud').waitFor();
  assert.equal(await page.locator('[data-player="true"]').getAttribute('data-kite-id'), String(id));
  assert.equal(await page.locator('dialog').count(), 0);
  const after = await page.locator('.v-kite').evaluateAll((els) =>
    els.map((el) => ({
      id: el.dataset.kiteId,
      x: el.getBoundingClientRect().x,
      y: el.getBoundingClientRect().y,
    })),
  );
  assert(
    after.every(
      (k, i) => k.id === before[i].id && Math.hypot(k.x - before[i].x, k.y - before[i].y) < 35,
    ),
    'claim preserves positions and identities',
  );
}
try {
  for (const [width, height] of process.env.INTERACTIONS_ONLY
    ? []
    : [
        [1280, 720],
        [1366, 768],
        [1200, 700],
        [1270, 780],
        [1440, 900],
        [1525, 935],
        [1920, 1080],
      ]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + '?capture=1');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.v-kite').count(), 8);
    assert.equal(await page.locator('.v-rooftops text').count(), 0, 'no architectural lettering');
    assert.equal(await page.locator('.v-name-urdu').count(), 1, 'Urdu identity retained');
    assert((await page.locator('.v-traditional-balcony').count()) >= 8);
    assert((await page.locator('.v-rooftop-house, .v-back-house').count()) >= 30);
    assert(
      await page.locator('.v-rooftops').evaluate((el) => {
        const m = el.getScreenCTM();
        return Math.abs(m.a - m.d) < 0.001;
      }),
      'architecture scales without flattening',
    );
    assert.equal(await page.locator('.v-islamic-frame, .v-frame-left, .v-frame-right').count(), 0);
    assert(
      await page.evaluate(
        () =>
          Number(getComputedStyle(document.querySelector('.v-celestial-layer')).zIndex) >
          Number(getComputedStyle(document.querySelector('.v-topbar')).zIndex),
      ),
      'celestial layer is above the navigation bar',
    );
    for (const [label, id] of [
      ['home', 'home'],
      ['work', 'projects'],
      ['books', 'books'],
      ['experience', 'experience'],
      ['thoughts', 'thoughts'],
    ]) {
      await page.locator('.v-nav').getByRole('button', { name: label, exact: true }).click();
      await page.waitForTimeout(800);
      const metrics = await page.locator('#' + id).evaluate((el) => {
        const box = el.getBoundingClientRect();
        const header = document.querySelector('.v-topbar').getBoundingClientRect();
        const composition = el.querySelector('.v-composition').getBoundingClientRect();
        const minar = document.querySelector('.v-minar').getBoundingClientRect();
        const collisions = [...el.querySelectorAll('p,h1,h2,h3,.h-tags>span,.v-closing>span')]
          .filter((text) => {
            if (
              getComputedStyle(document.querySelector('.v-decorative-scene')).visibility ===
              'hidden'
            )
              return false;
            const r = text.getBoundingClientRect();
            if (!r.width || !r.height) return false;
            return (
              r.right > minar.left &&
              r.left < minar.right &&
              r.bottom > minar.top &&
              r.top < minar.bottom
            );
          })
          .map((text) => text.textContent);
        return {
          height: box.height,
          scrollHeight: el.scrollHeight,
          top: composition.top,
          bottom: composition.bottom,
          header: header.bottom,
          collisions,
        };
      });
      assert(
        Math.abs(metrics.height - height) < 2 && metrics.scrollHeight <= height + 1,
        `${width}x${height} ${id}: one viewport ${JSON.stringify(metrics)}`,
      );
      assert(
        metrics.top >= metrics.header + 7 && metrics.bottom <= height - 24,
        `${width}x${height} ${id}: content fits clear of header/footer ${JSON.stringify(metrics)}`,
      );
      assert.deepEqual(metrics.collisions, [], `${width}x${height} ${id}: Minar clears text`);
      assert.equal(
        await page.locator('.v-decorative-scene').evaluate((el) => getComputedStyle(el).visibility),
        id === 'home' ? 'visible' : 'hidden',
      );
      assert.equal(
        await page.locator('.v-celestial-layer').evaluate((el) => getComputedStyle(el).visibility),
        id === 'home' ? 'visible' : 'hidden',
      );
      assert(
        await page
          .locator('#' + id)
          .evaluate((el) =>
            [
              ...el.querySelectorAll(
                '.v-composition, .v-lede, .v-projects, .v-reading, .v-experience',
              ),
            ].every(
              (panel) =>
                getComputedStyle(panel).backgroundColor === 'rgba(0, 0, 0, 0)' &&
                getComputedStyle(panel).boxShadow === 'none',
            ),
          ),
        'content panels are transparent',
      );
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (id === 'projects') {
        const columns = await page
          .locator('.v-projects')
          .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        assert.equal(columns, 3);
        assert.equal(await page.locator('.v-projects>li').count(), 5);
      }
      if (width === 1280 || width === 1525)
        await page.screenshot({ path: `.qa/current/${id}-${width}-${height}.png` });
    }
    await page.locator('.v-nav').getByRole('button', { name: 'home', exact: true }).click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'switch to night mode' }).click();
    await page.waitForTimeout(1850);
    assert(
      await page.locator('.v-moon').evaluate((el) => {
        const orbit = new DOMMatrix(getComputedStyle(el.parentElement).transform);
        const moon = new DOMMatrix(getComputedStyle(el).transform);
        const direction = new DOMPoint(0.2, -0.15, 0, 0).matrixTransform(orbit.multiply(moon));
        const angle = (Math.atan2(direction.y, direction.x) * 180) / Math.PI;
        return angle > -43 && angle < -40;
      }),
      'crescent opens along the flag diagonal without changing its shape',
    );
    assert.equal(
      await page.locator('.v-sun').evaluate((el) => getComputedStyle(el).opacity),
      '0',
      'inactive sun stays below the horizon',
    );
    assert.equal(
      await page.locator('.v-moon').evaluate((el) => getComputedStyle(el).opacity),
      '0.85',
      'active moon remains visible above the header',
    );
    if (width === 1280 || width === 1525)
      await page.screenshot({ path: `.qa/current/night-${width}-${height}.png` });
    console.log(
      `PASS ${width}x${height}: every chapter fits one viewport, full content, Minar clearance, traditional balconies, lettering removal and night mode`,
    );
  }
  const drifting = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  drifting.on('pageerror', (e) => errors.push(e.message));
  await drifting.clock.install();
  await drifting.goto(base);
  await drifting.evaluate(() => {
    window.flightEvents = [];
    window.textFadeSeen = false;
    new MutationObserver((records) =>
      records.forEach((record) => {
        const phase = record.target.getAttribute('data-flight');
        if (phase && record.attributeName === 'data-flight') window.flightEvents.push(phase);
        if (
          record.attributeName === 'style' &&
          Math.abs(Number(record.target.style.opacity) - 0.16) < 0.00001
        )
          window.textFadeSeen = true;
      }),
    ).observe(document.querySelector('.v-kite-layer'), {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-flight', 'style'],
    });
  });
  const beforeDrift = await drifting.locator('.v-kite').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  await drifting.clock.runFor(1000);
  const afterDrift = await drifting.locator('.v-kite').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  const distances = afterDrift.map((p, i) =>
    Math.hypot(p.x - beforeDrift[i].x, p.y - beforeDrift[i].y),
  );
  assert(Math.max(...distances) > 0 && Math.max(...distances) < 80, 'ambient kites drift slowly');
  await drifting.clock.runFor(25000);
  const events = await drifting.evaluate(() => window.flightEvents);
  assert(
    await drifting.evaluate(() => window.textFadeSeen),
    'kites crossing text lower their opacity',
  );
  assert(
    events.includes('loop') && events.includes('falling'),
    'home sky visibly twirls and falls without starting a game',
  );
  await drifting.close();
  console.log('PASS slower natural drift and visible home-page twirls/falls');
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(base + '?capture=1');
  await page.mouse.move(900, 450);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.basant-page').getAttribute('data-chapter'), 'projects');
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.basant-page').getAttribute('data-chapter'), 'books');
  console.log('PASS wheel advances directly between complete chapters');
  await page.goto(base + '?capture=1');
  await claim();
  assert(await page.getByText('7 opponents left', { exact: true }).isVisible());
  assert((await page.locator('.v-game-help').textContent()).includes('last kite flying wins'));
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(250);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.down(' ');
  await page.waitForTimeout(500);
  await page.keyboard.up(' ');
  assert(Number(await page.getByLabel('line tension', { exact: true }).getAttribute('value')) > 20);
  await page.getByRole('button', { name: 'pause', exact: true }).click();
  const paused = await page
    .locator('.v-kite')
    .evaluateAll((els) => els.map((el) => el.style.cssText));
  await page.waitForTimeout(400);
  assert.deepEqual(
    await page.locator('.v-kite').evaluateAll((els) => els.map((el) => el.style.cssText)),
    paused,
    'pause freezes simulation',
  );
  await page.screenshot({ path: '.qa/current/elimination-controls.png' });
  await page.getByRole('button', { name: 'resume', exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.getByRole('button', { name: 'resume', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-player="true"]').count(), 0);
  await claim(4);
  await page.clock.install();
  await page.keyboard.down(' ');
  for (let i = 0; i < 20; i++) {
    if (await page.getByText('a fresh string?', { exact: true }).isVisible()) break;
    await page.clock.runFor(1000);
  }
  await page.keyboard.up(' ');
  assert(
    await page.getByText('a fresh string?', { exact: true }).isVisible(),
    'loss appears inline',
  );
  await page.getByRole('button', { name: 'fly again', exact: true }).click();
  assert.equal(await page.locator('[data-player="true"]').getAttribute('data-kite-id'), '4');
  assert(await page.getByText('7 opponents left', { exact: true }).isVisible());
  await page.getByRole('button', { name: 'leave kite game' }).click();
  console.log(
    'PASS elimination controls, keyboard input, pause, backgrounding, loss, replay ownership and exit',
  );
  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  const touch = await touchContext.newPage();
  touch.on('pageerror', (e) => errors.push(e.message));
  await touch.goto(base);
  assert.equal(await touch.locator('.v-kite').count(), 5);
  const box = await touch.locator('[data-kite-id="1"]').boundingBox();
  const cdp = await touchContext.newCDPSession(touch);
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x + 20, y: y - 10 }],
  });
  await touch.locator('.v-game-hud').waitFor();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.equal(await touch.locator('[data-player="true"]').getAttribute('data-kite-id'), '1');
  await touch.getByRole('button', { name: 'leave kite game' }).click();
  const positions = await touch
    .locator('.v-kite')
    .evaluateAll((els) => els.map((el) => el.style.cssText));
  await touch.waitForTimeout(350);
  assert.deepEqual(
    await touch.locator('.v-kite').evaluateAll((els) => els.map((el) => el.style.cssText)),
    positions,
    'reduced motion freezes ambient tricks',
  );
  await touchContext.close();
  assert.deepEqual(errors, []);
  console.log('PASS touch selection, reduced motion, retained mobile flow and no runtime errors');
} finally {
  await browser.close();
}
