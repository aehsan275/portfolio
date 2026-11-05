# Product

## Platform and purpose

Abdullah Ehsan’s web portfolio gives hiring engineers a quick overview of his identity, experience, education, and selected engineering work. Four pages separate the concise About overview, past work and education, selected projects, and future writing.

## Homepage

A centered introduction on the left alternates Abdullah’s English and Urdu names. The right column groups previously, studying, and projects. Nexaquanta, Waterloo, and project names share the same size and weight. MM Kinetics and Scrabble Solver are featured; “more projects” opens the separate Projects page. Contact links include the visible email address, GitHub, LinkedIn, X, and Cal.com. The intro explicitly seeks summer 2027 internships. Project summaries describe behavior rather than listing topics.

## Interaction

A page-anchored dot grid retains a fading desktop ink trail. Moving the pointer darkens cells along its path with colons, pluses, and stars; the trail fades back to the cached dots and tilework within 900ms. There are no kites or flight behavior. The 48px open album-margin banner uses a fine dotted gold rule, a central lozenge, and mirrored olive/gold geometric knots in place of flowers. The banner scrolls normally. Mobile keeps a quieter static dot grid. Reduced motion disables the ink trail and keeps the English name static. Backgrounding cancels active ink and stops animation. The decorative canvas never intercepts links or keyboard focus; no animation loop runs while idle. Additional Lahore-inspired details remain deferred.

## Navigation and content

Top navigation contains about (/), experience (/experience), projects (/projects), and thoughts (/thoughts). About keeps its two-column introduction. Other pages use a 740px reading column aligned with the navigation’s left edge. All pages share About’s header position and width and wide footer, without an extra wordmark. Every page has the visible email address, GitHub, LinkedIn, X, and Cal.com links in a normal-flow footer. Thoughts (/thoughts) lists the supplied essay title and opens its own blank detail page; the original three paragraphs remain saved in source data. Native URLs, History API navigation, direct loading, browser history, heading focus, and a not-found view are supported. The former /what-ive-done path redirects to /experience, and /education resolves to its section; homepage project fragments resolve to individual project pages. Project-detail paths render their individual pages; removed projects resolve to the projects index. No publication is included.

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, daisyUI 5, self-hosted fonts, and Playwright browser checks. No routing or animation dependency is added.

## Approved content

Use lowercase, casual writing. Include MM Kinetics and the school Scrabble Solver. NexaQuanta is past experience: Software Engineering Intern (August–September 2026) and Software Engineering Intern (May–August 2025), with a brief agents/RAG summary. See CONTENT.md for source notes.

Contact update: the footer displays a2ehsan [at] uwaterloo [dot] ca on a separate line above the social links, with a native mailto destination. The visible address is obfuscated; the mailto remains readable in the DOM. X and cal currently lead to https://x.com/ and https://cal.com/ as explicitly requested; they are not personal profile or booking URLs. Do not publish or link the résumé PDF.

Background update: the desktop fixed lattice includes six cropped 192px ASCII motifs alternating along the page margins at 16%, 32%, 49%, 65%, 82%, and 94% of document height, using rosettes, interlocking diamonds, and quatrefoil variations. Muted olive, clay, and slate reuse the banner palette; glyph opacity falls smoothly behind reading regions. Pointer motion leaves a bounded 900ms fading ink trail instead of circular ripples. The static field is cached, the shared loop stops at idle and is capped at 30fps, reduced motion retains static tilework, and widths below 1024px show only the quiet static dot field. The grid and motif cache rebuild at the actual device-pixel scale.

Detail-page update: Projects and Thoughts are clickable indexes. Each project has /projects/:projectId; each thought has /thoughts/:postId. Detail pages use the shared header, footer, 740px reading column, matching typography, and an explicit back link to their index. Detail bodies are empty until supplied; existing project details and the submitted essay remain preserved in the source data. Indexes show project summaries/technologies and thought titles. Section navigation stays active on child pages, titles update, and direct refresh/history work through the same History API routing. Old project fragments resolve to the new detail URLs; retired projects still resolve to the project index. No new dependencies or publication.

The thought “deeping it” now displays the original three supplied paragraphs on its individual page. Its URL stays /thoughts/2am-thoughts-before-a-midterm so existing links keep working. Project detail bodies remain empty.

The canvas is absolutely positioned inside the full portfolio rather than fixed to the viewport, so dots, motifs, and fading ink scroll with the page. Cached reading bounds and pointer coordinates use document-local positions. Scroll events do not rebuild the artwork; resize, font/content layout changes, and route changes refresh its cache. Static margin motifs retain their previous contrast, with six fragments in three geometric variations.

Margin ornament sizing: motifs stay 192 CSS pixels across, spaced 224px horizontally and 288px vertically, with staggered rows. Columns extend outward from the content edges to fill available whitespace; larger monitors reveal additional columns rather than scaling or stretching six fixed motifs. Rows continue down long pages at the same spacing. Variations are original ASCII interpretations of eight-pointed star ornament, interlaced jali-style lattice, and a Mughal-inspired flowering stem within a cusped arch. Existing faint palette, reading fade, document scrolling, mobile hiding, and cursor behavior are preserved. References: https://www.metmuseum.org/essays/geometric-patterns-in-islamic-art and https://www.metmuseum.org/art/collection/search/457020.

Sparse randomized ornament update: replace repeating rows/columns with seeded scattered margin placements at approximately one ornament per 200,000 square pixels of margin, plus one per side. Sizes vary from 128–240 CSS pixels, with at least 48px clearance between ornament bounds. A per-load seed keeps samples stable during navigation and layout refreshes. Each ornament mixes muted base/accent colors with a small stippled ASCII color splash. Larger whitespace admits additional sparse ornaments; motifs do not scale with the viewport. The existing scrolling, reading fade, mobile hiding, and cursor trail remain unchanged.

Selected banner: mockup 5, Mughal album margins, implemented without flowers. Interlaced geometric knots replace the floral corner elements; the open center, dotted gold rule, center lozenge, 48px height, and shared header alignment are retained.
