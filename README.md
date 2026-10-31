# Abdullah’s portfolio

A warm, typographic personal portfolio with a bilingual name, a 48px open geometric frame banner, and a fixed dot background with a fading mouse ink trail. The opening introduction sits on the left with a short overview on the right. Top navigation opens separate pages for past work and education, and projects. Thoughts is included in navigation and links to a separate draft page for “deeping it”. Contact links sit beneath each page’s content. The kite artwork and flight engine have been removed.

## Run

The header includes right-aligned light / dark controls, wrapping below navigation on narrow screens. The first visit follows the system color scheme; a manual choice is saved locally and takes precedence on later visits. Dark mode uses warm charcoal, cream text, peach-clay links, and muted gold, sage, and blue ornament. Switching themes recolors the existing motif arrangement without generating a new scene. No runtime dependency was added.

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Verify

With the development or preview server running on port 5173:

```sh
npm run qa
```

Alternatively set PORTFOLIO_URL to the preview address. Browser checks use installed Google Chrome through Playwright. They cover all four pages at 1280×720, 1440×900, and 1920×1080; mobile at 390px and 320px; equal linked-name sizing; banner height and repetition; fixed dot continuity and ink-trail restoration; uniform dot weight from 67–300% zoom, density changes, and reset; idle-loop stopping, a 30fps cap, reduced motion, backgrounding, and resizing; section navigation, legacy URLs, history, refreshes, contact URLs, and keyboard focus. Page screenshots are written to .qa/pages/ and background/zoom screenshots to .qa/dots/ (Git-ignored).

## Pages and legacy URLs

- / — concise two-column About overview
- /what-ive-done — both past internships and Waterloo education
- /projects — MM Kinetics, Scrabble Solver, and Flashcards App in full
- /thoughts — personal writing, beginning with “deeping it”
- /experience and /education resolve to matching sections on /what-ive-done
- /projects/:projectId opens the selected project detail page; retired projects resolve to the index
- Old homepage fragments resolve to their corresponding page sections
- Other addresses show a not-found page with a recovery link

For eventual static hosting, configure an SPA fallback to index.html for non-asset paths so direct links and refreshes work. Vite development and preview servers provide this locally. No deployment has been performed.

## Structure

- src/App.tsx — page rendering, History API navigation, section anchors, legacy URL normalization, and not-found recovery
- src/data.ts — retained factual project and experience content
- src/components/FloralBorder.tsx — 48px open geometric album-margin banner
- src/components/DotBackground.tsx — cached fixed dot canvas and demand-driven pointer trail
- src/styles.css and src/styles/daisy.css — responsive layout and shared paper/charcoal theme tokens
- src/useTheme.ts — system preference, remembered manual choice, and cross-tab synchronization

Theme browser checks also cover system changes, manual overrides across refreshes, keyboard operation, unavailable browser storage, canvas recoloring without motif reshuffling, and mobile overflow. Dark-mode screenshots are written to .qa/theme/.

Fonts are local and their license files remain in public/fonts. No new runtime dependency, external API, or animation library was added. Ripples respect reduced motion, stop when hidden, and leave no animation loop running when idle. Mobile uses a quieter static dot grid. Contact links use a2ehsan@uwaterloo.ca and github.com/aehsan275. Additional cultural details remain deferred; no publication is included.

Personal copy, project data, and contact destinations live in src/data.ts. Only MM Kinetics has a public project repository link; no Scrabble repository URL is invented. public/resume.pdf is the supplied October résumé, which has working LinkedIn/GitHub links and no summer availability line. Current winter 2027 availability follows the user’s newer instruction. See CONTENT.md for provenance.

Contact update: the footer displays a2ehsan [at] uwaterloo [dot] ca on a separate line above the social links, with a native mailto destination. The visible address is obfuscated; the mailto remains readable in the DOM. X and cal currently lead to https://x.com/ and https://cal.com/ as explicitly requested; they are not personal profile or booking URLs. The résumé link is removed; the existing PDF is retained as an asset.

Background update: the desktop fixed lattice includes six cropped 192px ASCII motifs alternating along the page margins at 16%, 32%, 49%, 65%, 82%, and 94% of document height, using rosettes, interlocking diamonds, and quatrefoil variations. Muted olive, clay, and slate reuse the banner palette; glyph opacity falls smoothly behind reading regions. Pointer motion leaves a bounded 900ms fading ink trail instead of circular ripples. The static field is cached, the shared loop stops at idle and is capped at 30fps, reduced motion retains static tilework, and widths below 1024px show only the quiet static dot field. The grid and motif cache rebuild at the actual device-pixel scale.

Detail-page update: Projects and Thoughts are clickable indexes. Each project has /projects/:projectId; each thought has /thoughts/:postId. Detail pages use the shared header, footer, 740px reading column, matching typography, and an explicit back link to their index. Detail bodies are empty until supplied; existing project details and the submitted essay remain preserved in the source data. Indexes show project summaries/technologies and thought titles. Section navigation stays active on child pages, titles update, and direct refresh/history work through the same History API routing. Old project fragments resolve to the new detail URLs; retired projects still resolve to the project index. No new dependencies or publication.

The thought “deeping it” now displays the original three supplied paragraphs on its individual page. Its URL stays /thoughts/2am-thoughts-before-a-midterm so existing links keep working. Project detail bodies remain empty.

The canvas is absolutely positioned inside the full portfolio rather than fixed to the viewport, so dots, motifs, and fading ink scroll with the page. Cached reading bounds and pointer coordinates use document-local positions. Scroll events do not rebuild the artwork; resize, font/content layout changes, and route changes refresh its cache. Static margin motifs retain their previous contrast, with six fragments in three geometric variations.

Margin ornament sizing: motifs stay 192 CSS pixels across, spaced 224px horizontally and 288px vertically, with staggered rows. Columns extend outward from the content edges to fill available whitespace; larger monitors reveal additional columns rather than scaling or stretching six fixed motifs. Rows continue down long pages at the same spacing. Variations are original ASCII interpretations of eight-pointed star ornament, interlaced jali-style lattice, and a Mughal-inspired flowering stem within a cusped arch. Existing faint palette, reading fade, document scrolling, mobile hiding, and cursor behavior are preserved. References: https://www.metmuseum.org/essays/geometric-patterns-in-islamic-art and https://www.metmuseum.org/art/collection/search/457020.

Sparse randomized ornament update: replace repeating rows/columns with seeded scattered margin placements at approximately one ornament per 200,000 square pixels of margin, plus one per side. Sizes vary from 128–240 CSS pixels, with at least 48px clearance between ornament bounds. A per-load seed keeps samples stable during navigation and layout refreshes. Each ornament mixes muted base/accent colors with a small stippled ASCII color splash. Larger whitespace admits additional sparse ornaments; motifs do not scale with the viewport. The existing scrolling, reading fade, mobile hiding, and cursor trail remain unchanged.

Selected banner: mockup 5, Mughal album margins, implemented without flowers. Interlaced geometric knots replace the floral corner elements; the open center, dotted gold rule, center lozenge, 48px height, and shared header alignment are retained.
