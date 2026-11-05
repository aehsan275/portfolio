import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  const { pagePaths, pageMetadata, siteUrl } = await vite.ssrLoadModule('/src/metadata.ts');
  const template = await fs.readFile('dist/index.html', 'utf8');
  const escape = (value) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  for (const route of [...pagePaths, '/404']) {
    const metadata = pageMetadata(route);
    const markup = renderToString(React.createElement(App, { initialPath: route }));
    const html = template
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
      .replace(/<title>.*?<\/title>/, `<title>${escape(metadata.title)}</title>`)
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,
        `$1${escape(metadata.description)}$2`,
      )
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(metadata.title)}`)
      .replace(
        /(<meta property="og:description" content=")[^"]*/,
        `$1${escape(metadata.description)}`,
      )
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${escape(metadata.url)}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${escape(metadata.url)}`);
    const output =
      route === '/'
        ? 'dist/index.html'
        : route === '/404'
          ? 'dist/404.html'
          : path.join('dist', route.slice(1), 'index.html');
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, html);
  }
  const urls = pagePaths.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n');
  await fs.writeFile(
    'dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  await fs.writeFile(
    'dist/robots.txt',
    `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
  );
} finally {
  await vite.close();
}
