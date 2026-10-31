import { checkDotBackground } from './check-dot-background.mjs';
import { checkDotZoom } from './check-dot-zoom.mjs';
import { checkTheme } from './check-theme.mjs';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await fs.mkdir('.qa/pages', { recursive: true });
await fs.mkdir('.qa/dots', { recursive: true });
const routes = [
  ['/', 'about'],
  ['/what-ive-done', 'what i’ve done'],
  ['/projects', 'projects'],
  ['/thoughts', 'thoughts'],
  ['/projects/kinetics', 'projects'],
  ['/projects/scrabble', 'projects'],
  ['/projects/flashcards', 'projects'],
  ['/thoughts/2am-thoughts-before-a-midterm', 'thoughts'],
  ['/thoughts/the-more-you-know-the-less-you-do', 'thoughts'],
  ['/thoughts/who-are-we', 'thoughts'],
];
const nav = () => page.getByRole('navigation', { name: 'main navigation' });
const ready = async () => {
  await page.locator('main').waitFor();
  await page.evaluate(() => document.fonts.ready);
};
try {
  for (const [width, height] of [
    [1280, 720],
    [1440, 900],
    [1920, 1080],
    [390, 844],
    [320, 760],
  ]) {
    await page.setViewportSize({ width, height });
    let sharedHeader;
    for (const [path, label] of routes) {
      await page.goto(base + path);
      await ready();
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path}/${width}: no horizontal overflow`,
      );
      assert.equal(await page.locator('main').count(), 1);
      assert.equal(await page.locator('h1').count(), 1);
      await page.waitForFunction(() => {
        const slot = document.querySelector('.back-to-top-slot');
        const root = document.documentElement;
        const needsScroll = root.scrollHeight - slot.offsetHeight > root.clientHeight + 1;
        return !slot.hidden === needsScroll;
      });
      if (path === '/what-ive-done') {
        assert.equal(await page.locator('.education-entry').count(), 2);
        assert.equal(await page.locator('.role-description').count(), 2);
        await page.getByText('CPSC217', { exact: true }).waitFor();
        await page
          .getByText('took this purely for the love of the game, ended with 97%', { exact: true })
          .waitFor();
        await page
          .getByText('uni math is so different from high school.', { exact: true })
          .waitFor();
        const marks = await page.locator('.organization-mark').evaluateAll((nodes) =>
          nodes.map((el) => {
            const r = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return {
              height: r.height,
              cap: parseFloat(getComputedStyle(el.parentElement).fontSize),
              opacity: style.opacity,
              mask: style.maskImage,
            };
          }),
        );
        assert.equal(marks.length, 3, 'all three institutions have decorative marks');
        assert(
          marks.every((m) => m.opacity === '0.8' && m.mask !== 'none'),
          'shared monochrome mask treatment',
        );
        assert(
          Math.abs(marks[1].height - marks[2].height) < 0.1,
          'university marks share the same cap height',
        );
        await page.getByText('2026–2031', { exact: true }).waitFor();
        assert.equal(
          await page
            .getByText('university course taken while in high school.', { exact: true })
            .count(),
          0,
        );
        const weights = await page.locator('.entry-title, .role-description').evaluateAll((nodes) =>
          nodes.map((el) => ({
            title: el.classList.contains('entry-title'),
            weight: Number(getComputedStyle(el).fontWeight),
          })),
        );
        assert(
          weights.every((item) => (item.title ? item.weight === 600 : item.weight === 400)),
          'entry titles are differentiated from descriptions',
        );
      }
      assert.equal(
        await nav().getByRole('link', { name: label, exact: true }).getAttribute('aria-current'),
        path.slice(1).includes('/') ? 'location' : 'page',
      );
      assert.equal(await nav().locator('a').count(), 4);
      assert.equal(
        await page.locator('.site-footer').getByRole('link').count(),
        5,
        'all contacts at bottom',
      );
      const emailBox = await page.locator('.contact-email').boundingBox();
      const githubBox = await page
        .locator('.site-footer')
        .getByRole('link', { name: 'github', exact: true })
        .boundingBox();
      assert(
        githubBox.y >= emailBox.y + emailBox.height,
        'email is on its own row above social links',
      );
      const footerType = await page.locator('.site-footer a').evaluateAll((nodes) =>
        nodes.map((el) => {
          const style = getComputedStyle(el);
          return [style.fontSize, style.fontFamily, style.lineHeight].join('|');
        }),
      );
      assert.equal(new Set(footerType).size, 1, 'email and social links share typography');
      assert.equal(
        await page.locator('.contact-links').evaluate((el) => getComputedStyle(el).rowGap),
        '0px',
        'compact footer rows',
      );
      if (path === '/what-ive-done' || path === '/projects') {
        const headingType = await page.locator('.reading-section h2').evaluateAll((nodes) =>
          nodes.map((el) => {
            const style = getComputedStyle(el);
            return [style.fontSize, style.fontFamily, style.lineHeight].join('|');
          }),
        );
        assert.equal(new Set(headingType).size, 1, 'consistent section heading typography');
      }
      assert.equal(await page.locator('.intro .contact-links').count(), 0);
      assert.equal(await page.locator('.site-wordmark').count(), 0);
      const header = await page.locator('.site-header').boundingBox();
      const footer = await page.locator('.site-footer').boundingBox();
      if (!sharedHeader) sharedHeader = header;
      assert.equal(header.x, sharedHeader.x, 'shared header left edge');
      assert.equal(header.y, sharedHeader.y, 'shared header top edge');
      assert.equal(header.width, sharedHeader.width, 'shared header width');
      assert.equal(header.height, sharedHeader.height, 'shared navigation wrapping');
      assert.equal(footer.x, header.x, 'footer aligns with shared header');
      assert.equal(footer.width, header.width, 'footer matches shared header width');
      if (path !== '/') {
        const body = await page.locator('main').boundingBox();
        assert.equal(body.x, header.x, 'reading column aligns with navigation');
        assert(body.width <= 740, 'reading column stays readable');
      }
      const position = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        return {
          header: r('.site-header').bottom,
          main: r('main').top,
          end: r('main').bottom,
          footer: r('.site-footer').top,
        };
      });
      assert(position.main >= position.header - 1, 'navigation before content');
      assert(position.footer >= position.end, 'footer below content');
      assert(position.footer - position.end <= 50, 'no viewport-sized footer gap');
      assert.equal((await page.locator('.floral-border').boundingBox()).height, 48);
      const rail = await page.locator('.banner-inner').boundingBox();
      assert.equal(rail.x, header.x, 'banner frame aligns with shared header');
      assert.equal(rail.width, header.width, 'banner frame matches shared header width');
      assert.equal(
        await page.locator('.floral-border').getAttribute('data-motif'),
        'album-geometric-frame',
      );
      assert.equal(await page.locator('.ascii-sky').getAttribute('aria-hidden'), 'true');
      if (path === '/') {
        assert.equal(
          await page.locator('.project-entry').count(),
          0,
          'no detail sections on about',
        );
        assert.equal(await page.locator('.home-projects li').count(), 2);
        const sizes = await page
          .locator('.summary-link')
          .evaluateAll((nodes) => nodes.map((el) => getComputedStyle(el).fontSize));
        assert.equal(new Set(sizes).size, 1);
        const intro = await page.locator('.intro').boundingBox(),
          summary = await page.locator('.summary').boundingBox();
        if (width >= 1024) assert(intro.x + intro.width <= summary.x + 1, 'two-column about');
        else assert(summary.y >= intro.y + intro.height, 'stacked mobile about');
      } else {
        if (path === '/projects') assert.equal(await page.locator('.project-entry').count(), 3);
        if (path === '/what-ive-done')
          assert.equal(await page.locator('.experience-roles > div').count(), 2);
        if (path === '/thoughts') {
          assert.equal(await page.locator('.thought-entry').count(), 3);
          assert.deepEqual(await page.locator('.thought-entry h2').allTextContents(), [
            'why success feels average',
            'the more you know, the less you do',
            'who are we?',
          ]);
          assert.equal(
            await page.locator('.thought-entry p').count(),
            3,
            'thought summaries are present',
          );
        }
      }
      if (path.slice(1).includes('/')) {
        if (path === '/projects/kinetics') {
          assert.equal(await page.locator('.project-writeup').count(), 1);
          assert.equal(await page.locator('.writeup-section').count(), 5);
          assert.equal(await page.locator('.project-writeup img').count(), 5);
          assert.equal(await page.locator('.writeup-section h2').count(), 5);
          assert(
            (await page.locator('.detail-content').innerText()).includes(
              'starting with the reaction',
            ),
            'mm kinetics writeup is present',
          );
        } else if (path === '/projects/scrabble') {
          assert.equal(await page.locator('.writeup-section').count(), 5);
          assert.equal(await page.locator('.project-writeup img').count(), 1);
          assert.equal(await page.locator('.writeup-nav a').count(), 5);
        } else if (path === '/projects/flashcards') {
          assert.equal(await page.locator('.detail-content p').count(), 4);
        } else if (path.startsWith('/projects/'))
          assert.equal(
            await page.locator('.detail-content').innerText(),
            '',
            'project detail body is empty',
          );
        else if (path.endsWith('/who-are-we')) {
          assert.equal(await page.locator('.detail-content p').count(), 9);
          assert.equal(await page.locator('.detail-content strong').count(), 2);
          assert.equal(await page.locator('.detail-content h2').count(), 0);
        } else if (path.endsWith('/the-more-you-know-the-less-you-do')) {
          assert.equal(await page.locator('.detail-content p').count(), 7);
          assert.equal(await page.locator('.detail-content strong').count(), 1);
          assert(
            (await page.locator('.detail-content strong').innerText()).endsWith(
              "how much complexity you're still blind to.",
            ),
          );
        } else {
          assert.equal(await page.locator('.detail-content p').count(), 3);
          assert(
            (await page.locator('.detail-content p').last().innerText()).endsWith(
              "how far we've already come.",
            ),
          );
        }
        const back = page.getByRole('link', { name: '← back to ' + label, exact: true });
        assert.equal(await back.getAttribute('href'), '/' + label);
      }
      if ([1440, 390, 320].includes(width) || path === '/')
        await page.screenshot({
          path: `.qa/pages/${path === '/' ? 'about' : path.slice(1).replaceAll('/', '-')}-${width}.png`,
          fullPage: true,
        });
    }
    console.log(`Pages at ${width}×${height}: passed`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + '/thoughts');
  await ready();
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarGutter),
    'stable',
  );
  const shortHeader = await page.locator('.site-header').boundingBox();
  await page.evaluate(() => {
    document.documentElement.style.overflowY = 'scroll';
  });
  assert.deepEqual(
    await page.locator('.site-header').boundingBox(),
    shortHeader,
    'scrollbar appearance cannot shift header',
  );
  await page.evaluate(() => {
    document.documentElement.style.removeProperty('overflow-y');
  });
  for (const label of ['projects', 'thoughts', 'what i’ve done', 'about']) {
    await nav().getByRole('link', { name: label, exact: true }).click();
    await ready();
    assert.deepEqual(
      await page.locator('.site-header').boundingBox(),
      shortHeader,
      'header stays fixed during page navigation',
    );
  }
  await page.goto(base);
  await ready();
  for (const [path, label] of routes.slice(1, 4)) {
    await nav().getByRole('link', { name: label, exact: true }).click();
    await page.waitForURL(base + path);
    await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
    await page.reload();
    await ready();
    assert.equal(new URL(page.url()).pathname, path);
  }
  await page.goBack();
  await page.waitForURL(base + '/projects');
  await page.goBack();
  await page.waitForURL(base + '/what-ive-done');
  await page.goForward();
  await page.waitForURL(base + '/projects');
  await nav().getByRole('link', { name: 'about', exact: true }).click();
  for (const [name, path, hash] of [
    ['nexaquanta', '/what-ive-done', '#experience'],
    ['uwaterloo.', '/what-ive-done', '#education'],
    ['mm kinetics', '/projects/kinetics', ''],
    ['scrabble solver', '/projects/scrabble', ''],
    ['more projects', '/projects', ''],
  ]) {
    await page.goto(base);
    await ready();
    await page.getByRole('link', { name, exact: true }).click();
    await page.waitForURL(base + path + hash);
    await page.waitForFunction(
      (hash) =>
        document.activeElement ===
        (hash ? document.querySelector(hash) : document.querySelector('main h1')),
      hash,
    );
  }
  for (const [source, destination] of [
    ['/experience', '/what-ive-done#experience'],
    ['/education', '/what-ive-done#education'],
    ...['kinetics', 'scrabble', 'flashcards'].map((id) => ['/projects/' + id, '/projects/' + id]),
    ...['raytracer', 'http', 'rag'].map((id) => ['/projects/' + id, '/projects']),
    ['/#experience', '/what-ive-done#experience'],
    ['/#education', '/what-ive-done#education'],
    ['/#projects', '/projects'],
    ['/#project-kinetics', '/projects/kinetics'],
    ['/#project-scrabble', '/projects/scrabble'],
    ['/#project-flashcards', '/projects/flashcards'],
    ['/projects#project-kinetics', '/projects/kinetics'],
    ['/thoughts#2am-thoughts-before-a-midterm', '/thoughts/2am-thoughts-before-a-midterm'],
    ['/about', '/'],
  ]) {
    await page.goto(base + source);
    await ready();
    assert.equal(page.url(), base + destination);
    await page.reload();
    await ready();
    assert.equal(page.url(), base + destination);
    const hash = new URL(page.url()).hash;
    if (hash) await page.waitForFunction((id) => document.activeElement.id === id, hash.slice(1));
  }
  for (const [path, label] of routes.slice(4)) {
    const parent = '/' + label;
    await page.goto(base + parent);
    await ready();
    const indexHeader = await page.locator('.site-header').boundingBox();
    await page.locator('main a[href="' + path + '"]').click();
    await page.waitForURL(base + path);
    await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
    assert.equal(await page.title(), 'abdullah ehsan');
    assert.deepEqual(await page.locator('.site-header').boundingBox(), indexHeader);
    await page.reload();
    await ready();
    if (path === '/projects/kinetics')
      assert.equal(await page.locator('.project-writeup img').count(), 5);
    else if (path === '/projects/scrabble')
      assert.equal(await page.locator('.project-writeup img').count(), 1);
    else if (path === '/projects/flashcards')
      assert.equal(await page.locator('.detail-content p').count(), 4);
    else if (path.startsWith('/projects/'))
      assert.equal(await page.locator('.detail-content').innerText(), '');
    else
      assert.equal(
        await page.locator('.detail-content p').count(),
        path.endsWith('/who-are-we')
          ? 9
          : path.endsWith('/the-more-you-know-the-less-you-do')
            ? 7
            : 3,
      );
    await page.goBack();
    await page.waitForURL(base + parent);
    await page.goForward();
    await page.waitForURL(base + path);
    await page.getByRole('link', { name: '← back to ' + label, exact: true }).click();
    await page.waitForURL(base + parent);
  }
  for (const path of ['/not-a-page', '/projects/unknown', '/thoughts/unknown']) {
    await page.goto(base + path);
    await page.getByRole('heading', { name: 'page not found.' }).waitFor();
    await page.getByRole('link', { name: 'return to the homepage', exact: true }).click();
    await page.waitForURL(base + '/');
  }
  await page.goto(base + '/what-ive-done');
  await ready();
  await page.getByRole('button', { name: 'back to top' }).click();
  await page.waitForFunction(() => scrollY === 0);
  assert.equal(
    await page.evaluate(() => document.activeElement === document.querySelector('main h1')),
    true,
  );
  await page.goto(base);
  await ready();
  const footer = page.locator('.site-footer');
  for (const [name, url] of [
    ['a2ehsan [at] uwaterloo [dot] ca', 'mailto:a2ehsan@uwaterloo.ca'],
    ['github', 'https://github.com/aehsan275'],
    ['linkedin', 'https://www.linkedin.com/in/abdullah-ehsan-960425399/'],
    ['x', 'https://x.com/abdullahehsn'],
    ['cal', 'https://cal.com/abdullah-ehsan/30min'],
  ])
    assert.equal(await footer.getByRole('link', { name, exact: true }).getAttribute('href'), url);
  assert.equal(await footer.getByRole('link', { name: 'résumé', exact: true }).count(), 0);
  const resume = await page.request.get(base + '/resume.pdf');
  assert.equal(resume.status(), 200);
  assert((await resume.body()).subarray(0, 5).toString() === '%PDF-');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
  await page.keyboard.press('Tab');
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle),
    'solid',
  );
  await page.goto(base);
  await ready();
  await page.evaluate(() =>
    window.addEventListener(
      'click',
      (event) => {
        window.__modifiedPrevented = event.defaultPrevented;
      },
      { once: true },
    ),
  );
  await nav()
    .getByRole('link', { name: 'projects', exact: true })
    .dispatchEvent('click', { button: 0, ctrlKey: true, cancelable: true, bubbles: true });
  assert.equal(
    await page.evaluate(() => window.__modifiedPrevented),
    false,
    'modified click is not intercepted',
  );
  assert.equal(new URL(page.url()).pathname, '/');
  console.log(
    'Page navigation, legacy links, focus, history, contact URLs, PDF and modified clicks passed',
  );
  await page.goto(base);
  await ready();
  const before = await page.locator('.name').boundingBox();
  await checkDotBackground(page, base);
  await page.locator('.name span').evaluateAll((nodes) =>
    nodes.forEach((node) =>
      node.getAnimations().forEach((animation) => {
        animation.currentTime = 7000;
        animation.pause();
      }),
    ),
  );
  assert.equal(
    await page.locator('.name-urdu').evaluate((el) => getComputedStyle(el).opacity),
    '1',
  );
  const after = await page.locator('.name').boundingBox();
  assert.equal(before.height, after.height);
  assert.equal(before.width, after.width);
  await page.goto(base);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const marginCounts = [];
  for (const width of [1280, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForFunction(() => {
      const c = document.querySelector('.ascii-sky');
      return c.width === Math.round(c.getBoundingClientRect().width * devicePixelRatio);
    });
    marginCounts.push(Number(await page.locator('.ascii-sky').getAttribute('data-motifs')));
    const sizes = JSON.parse(await page.locator('.ascii-sky').getAttribute('data-motif-sizes'));
    assert(
      sizes.every((size) => size >= 32 && size <= 240),
      'motifs vary within fixed pixel bounds',
    );
    if (width >= 1920) assert(new Set(sizes).size > 1, 'roomy margins retain varied sizes');
    assert(
      Number(await page.locator('.ascii-sky').getAttribute('data-motifs')) <=
        (width === 1280 ? 2 : width === 1920 ? 4 : 8),
      'sparse margin artwork',
    );
    const geometry = await page.evaluate(() => {
      const c = document.querySelector('.ascii-sky'),
        b = c.getBoundingClientRect(),
        shell = document.querySelector('.site-shell').getBoundingClientRect();
      return {
        motifs: JSON.parse(c.dataset.motifLayout),
        width: b.width,
        height: b.height,
        left: shell.left - b.left,
        right: shell.right - b.left,
      };
    });
    for (const m of geometry.motifs) {
      assert(
        m.y - m.radius >= 24 && m.y + m.radius <= geometry.height - 20,
        'no top or bottom cropping',
      );
      if (m.edge)
        assert.equal(
          m.x,
          m.edge === 'left' ? 0 : geometry.width,
          'outer border bisects edge motif exactly',
        );
      else
        assert(
          m.x - m.radius >= 8 && m.x + m.radius <= geometry.width - 8,
          'interior motif stays whole',
        );
      assert(
        m.x + m.radius <= geometry.left - 16 || m.x - m.radius >= geometry.right + 16,
        'whole motif clears the text column',
      );
    }
    const restingArt = await page.locator('.ascii-sky').evaluate((c) => c.toDataURL());
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    assert(
      (await page.locator('.ascii-sky').evaluate((c) => c.toDataURL())) === restingArt,
      'layout refresh does not rerandomize artwork',
    );
    await page.screenshot({ path: '.qa/pages/about-wide-' + width + '.png', fullPage: true });
  }
  assert(
    marginCounts[1] >= marginCounts[0] && marginCounts[2] > marginCounts[0],
    'larger margins reveal more sparse motifs instead of stretching them',
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base);
  await ready();
  const readScene = () =>
    page
      .locator('.ascii-sky')
      .evaluate((c) => ({ seed: c.dataset.motifSeed, motifs: JSON.parse(c.dataset.motifLayout) }));
  const firstScene = await readScene();
  for (const label of ['what i’ve done', 'projects', 'thoughts']) {
    await nav().getByRole('link', { name: label, exact: true }).click();
    await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
    const next = await readScene();
    assert.equal(next.seed, firstScene.seed, 'one seed for the whole website view');
    for (const motif of firstScene.motifs)
      assert.deepEqual(
        next.motifs.find((m) => m.id === motif.id),
        motif,
        'existing motif attributes and document position stay unchanged across pages',
      );
  }
  await page.locator('main').getByRole('link', { name: 'who are we?', exact: true }).click();
  await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
  const longScene = await readScene();
  assert.equal(longScene.seed, firstScene.seed);
  for (const motif of firstScene.motifs)
    assert.deepEqual(
      longScene.motifs.find((m) => m.id === motif.id),
      motif,
      'long page reveals more artwork without moving existing motifs',
    );
  await page.goBack();
  await ready();
  assert.equal((await readScene()).seed, firstScene.seed, 'browser history preserves scene');
  await page.reload();
  await ready();
  const reloaded = await readScene();
  assert.notEqual(reloaded.seed, firstScene.seed, 'reload creates a fresh scene');
  assert.notDeepEqual(
    reloaded.motifs,
    firstScene.motifs,
    'reload changes sizes, positions, and palette choices',
  );
  await checkDotZoom(browser, base);
  await checkTheme(browser, base);
  assert.deepEqual(errors, [], 'no browser errors');
  console.log('All checks passed. Screenshots: .qa/pages/');
} finally {
  await browser.close();
}
