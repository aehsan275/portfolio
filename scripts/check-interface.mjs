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
    await page.goto(base);
    await ready();
    await page.waitForFunction(() => {
      const heading = document.querySelector('main h1');
      const canvas = document.querySelector('.ascii-sky');
      return (
        getComputedStyle(heading).fontFamily === 'Inter' &&
        document.fonts.check('15px Inter') &&
        canvas.dataset.renderedTheme === document.documentElement.dataset.theme &&
        document.fonts.check('10px "Geist Mono"')
      );
    });
    assert.equal(await page.locator('header, .page-navigation').count(), 0);
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1);
    assert.deepEqual(
      await page.locator('.page-section > h2').evaluateAll((nodes) => nodes.map((node) => node.id)),
      ['experience', 'projects', 'thoughts'],
    );
    const projectLinks = page.locator('.project-entry h3 a');
    assert.deepEqual(await projectLinks.allTextContents(), [
      'gpt-2 in racket λ',
      'mm kinetics',
      'scrabble solver',
    ]);
    assert.equal(
      await projectLinks.first().getAttribute('href'),
      'https://gpt2-rkt.vercel.app/?from=abdullah',
    );
    assert.equal(await projectLinks.first().getAttribute('target'), null);
    assert.equal(await page.locator('.thought-entry h3 a').count(), 3);
    assert.equal(await page.locator('.project-writeup, .detail-content').count(), 0);
    assert.equal(await page.locator('.role-description').count(), 2);
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      'no horizontal overflow',
    );
    const footer = await page.locator('.site-footer').boundingBox();
    const contactRows = (scope) =>
      page.locator(`${scope} .contact-links :is(a, button)`).evaluateAll((links) => {
        const top = links[0].getBoundingClientRect().top;
        return links.map((link) => [
          link.textContent.trim(),
          Math.round(link.getBoundingClientRect().top - top),
        ]);
      });
    const footerLinks = await contactRows('.site-footer');
    assert.equal(footerLinks.length, 4);
    assert.deepEqual(footerLinks, await contactRows('.intro-links'));
    assert.equal(new Set(footerLinks.map(([, y]) => y)).size, width < 600 ? 2 : 1);
    await page.getByRole('heading', { name: 'projects', exact: true }).waitFor();
    const main = await page.locator('main').boundingBox();
    const banner = await page.locator('.banner-inner').boundingBox();
    assert.equal(banner.x, main.x);
    assert.equal(banner.width, main.width);
    assert.equal(banner.height, 48);
    assert.equal(main.x, footer.x);
    assert.equal(main.width, footer.width);
    assert(footer.y >= main.y + main.height);
    const intro = await page.locator('.intro').boundingBox();
    const summary = await page.locator('.summary').boundingBox();
    const introLinks = await page.locator('.home-composition .intro-links').boundingBox();
    const firstSection = await page.locator('.page-section').first().boundingBox();
    assert.equal(intro.x, main.x, 'introduction aligns with the page column');
    assert.equal(summary.x, main.x, 'summary aligns with the page column');
    assert.equal(firstSection.x, main.x, 'sections align with the page column');
    assert(summary.y >= intro.y + intro.height, 'summary follows the intro');
    assert(introLinks.y >= summary.y + summary.height, 'contacts follow the summary');
    assert(
      firstSection.y - (introLinks.y + introLinks.height) <= 28,
      'experience follows the intro contacts closely',
    );
    const centeredLeft = ((await page.evaluate(() => document.body.clientWidth)) - main.width) / 2;
    const leftShift = centeredLeft - main.x;
    if (width >= 1280) {
      assert.equal(main.width, 720, 'desktop column uses the wider measure');
      assert(leftShift >= 25 && leftShift <= 37, 'desktop column sits slightly left of center');
    } else {
      assert(Math.abs(leftShift) < 1, 'mobile column has even gutters');
    }
    await page.screenshot({ path: `.qa/pages/portfolio-${width}.png`, fullPage: true });
    console.log(`Portfolio at ${width}×${height}: passed`);
  }
  const touchPage = await browser.newPage({ isMobile: true, hasTouch: true });
  try {
    for (const width of [320, 390]) {
      await touchPage.setViewportSize({ width, height: 760 });
      await touchPage.goto(base);
      await touchPage.evaluate(() => document.fonts.ready);
      const footer = touchPage.locator('.site-footer');
      const copyright = await footer.locator('.footer-copyright').boundingBox();
      const webring = footer.getByRole('navigation', { name: 'Waterloo CS webring' });
      const controls = await webring.boundingBox();
      const email = await footer.getByRole('button', { name: /copy email address/i }).boundingBox();
      assert(copyright.height < 24, 'copyright fits on a single line at the default text size');
      assert.equal(copyright.y + copyright.height / 2, controls.y + controls.height / 2);
      assert(copyright.x + copyright.width < controls.x, 'copyright has room beside the webring');
      assert(controls.y + controls.height < email.y, 'webring tap targets clear the email button');
      for (const link of await webring.getByRole('link').all()) {
        const box = await link.boundingBox();
        assert(box.width >= 44 && box.height >= 44, 'webring links have 44px touch targets');
      }
    }
  } finally {
    await touchPage.close();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base);
  await ready();
  assert.equal(
    await page.locator('.summary').getByRole('link', { name: 'uwaterloo' }).getAttribute('href'),
    'https://uwaterloo.ca/',
  );
  for (const [name, id] of [
    ['nexaquanta', 'experience'],
    ['view projects', 'projects'],
  ]) {
    await page.locator('.summary').getByRole('link', { name, exact: true }).click();
    await page.waitForURL(base + '/#' + id);
    await page.waitForFunction((id) => document.activeElement.id === id && scrollY > 0, id);
  }
  for (const [source, destination] of [
    ['/about', '/'],
    ['/experience', '/#experience'],
    ['/what-ive-done', '/#experience'],
    ['/education', '/'],
    ['/experience#education', '/'],
    ['/#education', '/'],
    ['/projects', '/#projects'],
    ['/thoughts', '/#thoughts'],
    ['/projects/kinetics', '/projects/mm-kinetics'],
    ['/projects/scrabble', '/projects/scrabble-solver'],
    ['/projects/flashcards-app', '/#projects'],
    ['/projects/rag', '/#projects'],
    ['/projects#project-kinetics', '/projects/mm-kinetics'],
    ['/#project-scrabble', '/projects/scrabble-solver'],
    ['/#project-gpt2-rkt', '/#project-gpt2-rkt'],
    ['/projects#project-gpt2-rkt', '/#project-gpt2-rkt'],
    ['/thoughts#2am-thoughts-before-a-midterm', '/thoughts/why-success-feels-average'],
    ['/thoughts/2am-thoughts-before-a-midterm', '/thoughts/why-success-feels-average'],
  ]) {
    await page.goto(base + source);
    await page.waitForURL(base + destination);
    await ready();
    const hash = new URL(page.url()).hash;
    if (hash) await page.waitForFunction((id) => document.activeElement.id === id, hash.slice(1));
  }
  await page.goto(base + '/#projects');
  await ready();
  await page.waitForFunction(() => document.activeElement.id === 'projects');
  await page.evaluate(() => window.scrollBy({ top: -300, behavior: 'instant' }));
  const kinetics = page.getByRole('article', { name: 'mm kinetics', exact: true });
  await kinetics.getByRole('link', { name: 'mm kinetics', exact: true }).hover();
  assert.equal(await page.locator('.project-preview:visible').count(), 0);
  assert.equal(await kinetics.locator('.project-preview').count(), 0);

  for (const [name, image] of [
    ['gpt-2 in racket λ', '/projects/gpt2-rkt/recorded-run.png'],
    ['scrabble solver', '/projects/scrabble/solver.jpg'],
  ]) {
    const project = page.getByRole('article', { name, exact: true });
    const title = project.getByRole('link', { name, exact: true });
    const preview = project.locator('.project-preview');
    assert.equal(await preview.locator('img').getAttribute('src'), null);
    await project.locator('p').first().hover();
    await preview.waitFor({ state: 'hidden' });
    await title.hover({ position: { x: 5, y: 5 } });
    await preview.waitFor();
    const locked = await preview.boundingBox();
    const titleBox = await title.boundingBox();
    assert(locked.y + locked.height < titleBox.y);
    await title.hover({ position: { x: 30, y: 8 } });
    assert.deepEqual(await preview.boundingBox(), locked, 'preview stays locked within the title');
    assert.equal(await preview.locator('img').getAttribute('src'), image);
    await preview.locator('img').evaluate((img) => img.decode());
    await page.keyboard.press('Escape');
    await preview.waitFor({ state: 'hidden' });
    await title.hover({ position: { x: 5, y: 5 } });
    assert.equal(await preview.isVisible(), false, 'Escape dismisses the preview until re-entry');
  }
  for (const [collection, id, images, paragraphs] of [
    ['projects', 'mm-kinetics', 5, null],
    ['projects', 'scrabble-solver', 1, null],
    ['thoughts', 'why-success-feels-average', null, 3],
    ['thoughts', 'the-more-you-know-the-less-you-do', null, 7],
    ['thoughts', 'who-are-we', null, 9],
  ]) {
    const index = base + '/#' + collection;
    const path = '/' + collection + '/' + id;
    await page.goto(index);
    await ready();
    await page.locator(`.page-section h3 a[href="${path}"]`).click();
    await page.waitForURL(base + path);
    await page.waitForFunction(() => document.activeElement === document.querySelector('main h1'));
    assert.equal(await page.locator('header').count(), 0);
    if (images !== null) {
      assert.equal(await page.locator('.writeup-section').count(), 5);
      assert.equal(await page.locator('.writeup-section img').count(), images);
    } else {
      assert.equal(await page.locator('.detail-content p').count(), paragraphs);
    }
    await page.reload();
    await ready();
    await page.goBack();
    await page.waitForURL(index);
    await page.goForward();
    await page.waitForURL(base + path);
    const backLinks = page.locator('main').getByRole('link', { name: 'back', exact: true });
    if (images !== null) await backLinks.nth(1).waitFor();
    assert.equal(await backLinks.first().getAttribute('href'), '/#' + collection);
    assert.equal(await backLinks.last().getAttribute('href'), '/#' + collection);
    await backLinks.last().click();
    await page.waitForURL(index);
    await page.waitForFunction((id) => document.activeElement.id === id, collection);
  }
  await page.setViewportSize({ width: 832, height: 950 });
  await page.goto(base + '/thoughts/the-more-you-know-the-less-you-do');
  await ready();
  const articleBackLinks = page.locator('main').getByRole('link', { name: 'back', exact: true });
  const endBack = page.locator('.detail-back--end');
  await endBack.waitFor({ state: 'hidden' });
  assert.equal(await articleBackLinks.count(), 1);
  await page.setViewportSize({ width: 390, height: 540 });
  await endBack.waitFor();
  assert.equal(await articleBackLinks.count(), 2);
  assert(
    await articleBackLinks.evaluateAll(([top, bottom]) => {
      const height = window.visualViewport?.height ?? innerHeight;
      return bottom.getBoundingClientRect().top - top.getBoundingClientRect().bottom >= height;
    }),
    'back links never share the viewport',
  );
  await page.setViewportSize({ width: 832, height: 950 });
  await endBack.waitFor({ state: 'hidden' });
  assert.equal(await articleBackLinks.count(), 1);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + '/projects/mm-kinetics');
  await page.getByRole('button', { name: 'enlarge starting with the reaction chart' }).click();
  await page.getByRole('dialog', { name: 'Enlarged image' }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Enlarged image' }).waitFor({ state: 'hidden' });
  for (const path of [
    '/not-a-page',
    '/projects/unknown',
    '/projects/gpt2-rkt',
    '/thoughts/unknown',
  ]) {
    await page.goto(base + path);
    await page.getByRole('heading', { name: 'page not found', exact: true }).waitFor();
    await page.getByRole('link', { name: 'return to the homepage', exact: true }).click();
    await page.waitForURL(base + '/');
  }
  await page.goto(base);
  await ready();
  await page.getByRole('button', { name: 'back to top' }).click();
  await page.waitForFunction(
    () => scrollY === 0 && document.activeElement === document.querySelector('main h1'),
  );
  await page.goto(base);
  await ready();
  const footer = page.locator('.site-footer');
  const introContacts = page.locator('.home-composition .contact-links');
  for (const [name, url] of [
    ['github', 'https://github.com/aehsan275'],
    ['linkedin', 'https://www.linkedin.com/in/abdullah-ehsan-960425399/'],
    ['x', 'https://x.com/abdullahehsn'],
  ]) {
    assert.equal(await footer.getByRole('link', { name, exact: true }).getAttribute('href'), url);
    assert.equal(
      await introContacts.getByRole('link', { name, exact: true }).getAttribute('href'),
      url,
    );
  }
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: new URL(base).origin,
  });
  for (const scope of [introContacts, footer]) {
    assert.equal(await scope.locator('a[href*="cal.com"]').count(), 0);
    await scope.getByRole('button', { name: /copy email address/i }).click();
    await scope.getByText('email copied', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'a2ehsan@uwaterloo.ca');
  }
  assert.equal(await footer.getByRole('link', { name: 'résumé', exact: true }).count(), 0);
  const resume = await page.request.get(base + '/resume.pdf');
  assert.notEqual((await resume.body()).subarray(0, 5).toString(), '%PDF-');
  await page.goto(base);
  await ready();
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
  const before = await page.locator('.name').boundingBox();
  await checkDotBackground(page, base);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.name[data-reduced="false"]').waitFor();
  await page.waitForFunction(() => document.querySelector('.name-urdu').getAnimations().length > 0);
  await page.locator('.name span').evaluateAll((nodes) =>
    nodes.forEach((node) =>
      node.getAnimations().forEach((animation) => {
        animation.pause();
        animation.currentTime = (animation.effect?.getTiming().delay ?? 0) + 7000;
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
  await checkDotZoom(browser, base);
  await checkTheme(browser, base);
  assert.deepEqual(errors, [], 'no browser errors');
  console.log('All checks passed. Screenshots: .qa/pages/');
} finally {
  await browser.close();
}
