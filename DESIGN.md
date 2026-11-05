# Warm paper and type

## Direction

A handcrafted, minimal, warm personal homepage. The desktop composition is two columns: centered identity on the left, a short labeled overview on the right, separated by a fine rule. Experience leads in reading order without giving the company name an oversized heading. Project links remain on the right. No cards, project images, skyline, celestial scene, game, chapter scrolling, or large navigation bar.

## Color and material

Warm ivory (#faf7ef), dark olive-brown ink (#34382b), and warm brick-red links (#95533f). The 48px album-margin SVG banner has an open ivory center, a fine dotted gold rule, a central lozenge, and mirrored interlaced geometric corner ornaments. The frame aligns exactly with the navigation column and scrolls with the page. A separate page-anchored canvas supplies an 8×10px monospace dot lattice. The nominal 8×10px cells snap to whole device pixels at the current zoom/display density. One cached dot stamp repeats without fractional bitmap resampling; resize and resolution changes rebuild the stamp and canvas. Dots use 22% opacity outside reading regions and 14% behind them; mobile uses 14% and 10%. There are no opaque reading masks or moving objects.

Organization names carry small monochrome marks: the official Waterloo shield and NexaQuanta monogram. Local PNG transparency masks inherit the surrounding text/link ink at 80% opacity, without badges or animation. Decorative marks are hidden from assistive technology; the adjacent names retain their accessible labels. Sources are recorded in public/logos/README.md.

## Light and dark themes

Light keeps the existing ivory palette. Dark uses charcoal #211f1b, heading cream #eee6d6, body #d4cdbf, secondary #a89f8d, peach-clay links #d59779, gold #bfa267, sage #9baa87, dusty blue #88a6b2, and rules #484337. Selection, scrollbar, browser color scheme, SVG backing fills, and native focus treatments share the active theme. Logos continue to inherit the adjacent text color. Dark dots use 16% opacity outside reading regions and 10% behind them; mobile uses 10% and 7%.

A compact light / dark button group sits at the right edge of the shared header, beside navigation on desktop and wrapping beneath it on narrow screens. Pressed states and keyboard focus indicate the active choice. Initial rendering follows the OS preference unless a valid manual choice is stored. A small head script applies that choice before the application paints. Storage failures retain working controls for the current visit. System changes apply until a manual choice is made, and storage changes synchronize open tabs.

Both themes share the same layout, type, glyph lattice, and seeded motif descriptors. The canvas resolves semantic paint tokens when the theme changes and rebuilds only its cached pixels; it does not regenerate the scene. Banner geometry and enlarged grid-aligned dots retain their exact positioning. The pointer trail keeps its existing reduced-motion, text-fade, and idle behavior.

## Typography and hierarchy

Self-hosted Literata gives the name and linked names their character; Manrope handles descriptions and group labels. Noto Nastaliq Urdu supports the alternating name. Only Abdullah’s name is display-sized. Nexaquanta, Waterloo, and project names use the shared 24px serif summary-link style. Body text remains at least 16px; project descriptors use the same 16px body size; navigation and all footer contacts use 17px serif type. Links have fine brick-red underlines, clear hover feedback, and visible keyboard outlines.

## Layout

All routes share top navigation and a contact footer. About keeps the wide two-column introduction; other pages use a 740px reading column aligned with the navigation’s left edge. The root reserves a stable scrollbar gutter so short and long pages cannot shift the header horizontally. Every page shares About’s header position and width, with no inner-page wordmark, and the same wide footer. Navigation wraps naturally and provides 44px targets and visible focus. The active page has a brick underline.

Spacing follows content, without viewport-height sections or a fixed footer. Main content begins 48px below navigation (32px on mobile); the footer follows content by 48px and separates the visible email address, GitHub, LinkedIn, X, and Cal.com with a fine rule. Contacts appear only in this footer. The two-column breakpoint is 1024px. Below it, identity and overview stack with a horizontal rule. Page gutters shrink for small screens without reducing reading text.

## Motion

The name crossfades between English and Urdu over 12 seconds with stable dimensions. Its accessible identity remains Abdullah Ehsan. Reduced motion keeps the English name static.

Desktop pointer movement darkens fixed cells along its recent path with colons, pluses, and stars. The bounded trail fades within 900ms, restoring the cached dots and tilework. Reading-region proximity smoothly reduces decorative glyph opacity. One demand-driven loop renders at most 30fps and stops entirely once the trail settles. There are no continuous idle frames, per-frame layout reads, or React state updates. Reading bounds and the cache refresh on layout changes and scroll.

Below 1024px the quieter dot field is static. Reduced motion disables the ink trail. Hidden tabs cancel active ink and stop the loop; the decorative canvas cannot receive pointer or keyboard input. All kite rendering, flight logic, and excursion scheduling have been removed. Tilework section separators, extra Urdu annotations, name flourishes, and footer ornaments remain deferred.

## Content and routing

Keep the approved lowercase copy and supplied descriptions, details, and technologies. About is concise. Experience contains both past NexaQuanta internships followed by education. Projects contains all three selected projects in full. Thoughts lists the supplied essay title, linking to its blank detail page, and appears in navigation. Section headings share 24px Literata with project titles, and organization subheadings use 22px. Body copy uses 16px Manrope at 1.75 line-height across pages. Desktop reading sections use 32px spacing; mobile project sections use 28px/32px padding.

Real anchors use lightweight History API navigation without a routing dependency. Page titles, active navigation, heading focus, direct loads, refreshes, and back/forward navigation are supported. The former /what-ive-done path redirects to /experience, and /education resolves to its section there; project detail URLs render individual pages, and retired projects resolve to the index. Old homepage fragments resolve to their matching pages. Unknown paths show a recovery link. External links and modified clicks remain native. Background reading bounds refresh when the page changes, on resizing, and on scroll.

Contact update: the footer displays a2ehsan [at] uwaterloo [dot] ca on a separate line above the social links, with a native mailto destination. The visible address is obfuscated; the mailto remains readable in the DOM. X and cal currently lead to https://x.com/ and https://cal.com/ as explicitly requested; they are not personal profile or booking URLs. Do not publish or link the résumé PDF.

Footer contacts share 17px Literata and 1.5 line-height, including the obfuscated email on its own first row. Rows have no additional gap; links retain 44px mobile targets and use 36px desktop targets. The large bilingual name remains the display exception.

Education lists Waterloo (2026–2031) followed by a University of Calgary computer science course (summer 2025), explicitly labeled as taken while in high school. A normal-flow back-to-top button appears beneath footer contacts only when content overflows the layout viewport. Its own height is excluded from overflow detection to prevent visibility feedback. ResizeObserver, window/visualViewport resize, page changes, and font readiness refresh the check; reduced motion returns immediately to the top.

Role descriptions sit directly beneath their title/date row, using shared body type. Education entries include the supplied personal notes. Calgary uses an official shield in the same cap-height, monochrome mask treatment as Waterloo and NexaQuanta; dates and high-school-course context retain secondary styling.

Entry hierarchy: role titles and education program/course labels use 600-weight 16px Manrope; descriptions use 400-weight body text, dates stay smaller and muted, and organization names retain serif headings. The Calgary high-school-context line is no longer displayed. Education heading rows have an 8px gap before their program label, followed by an 8px gap to the personal note.

Background update: the desktop fixed lattice includes six cropped 192px ASCII motifs alternating along the page margins at 16%, 32%, 49%, 65%, 82%, and 94% of document height, using rosettes, interlocking diamonds, and quatrefoil variations. Muted olive, clay, and slate reuse the banner palette; glyph opacity falls smoothly behind reading regions. Pointer motion leaves a bounded 900ms fading ink trail instead of circular ripples. The static field is cached, the shared loop stops at idle and is capped at 30fps, reduced motion retains static tilework, and widths below 1024px show only the quiet static dot field. The grid and motif cache rebuild at the actual device-pixel scale.

Detail-page update: Projects and Thoughts are clickable indexes. Each project has /projects/:projectId; each thought has /thoughts/:postId. Detail pages use the shared header, footer, 740px reading column, matching typography, and an explicit back link to their index. Detail bodies are empty until supplied; existing project details and the submitted essay remain preserved in the source data. Indexes show project summaries/technologies and thought titles. Section navigation stays active on child pages, titles update, and direct refresh/history work through the same History API routing. Old project fragments resolve to the new detail URLs; retired projects still resolve to the project index. No new dependencies or publication.

The thought “deeping it” now displays the original three supplied paragraphs on its individual page. Its URL stays /thoughts/2am-thoughts-before-a-midterm so existing links keep working. Project detail bodies remain empty.

Trail correction: pointer distance is measured from the last actual position even after an idle pause; the 120ms threshold only prevents connecting distant path segments. Trail opacity eases toward reading-area proximity over a 100ms time constant and reaches zero over text regions, with a 48px spatial transition back into margins. Reduced motion, idle stopping, and hidden-tab clearing remain in effect.

The canvas is absolutely positioned inside the full portfolio rather than fixed to the viewport, so dots, motifs, and fading ink scroll with the page. Cached reading bounds and pointer coordinates use document-local positions. Scroll events do not rebuild the artwork; resize, font/content layout changes, and route changes refresh its cache. Static margin motifs retain their previous contrast, with six fragments in three geometric variations.

Margin ornament sizing: motifs stay 192 CSS pixels across, spaced 224px horizontally and 288px vertically, with staggered rows. Columns extend outward from the content edges to fill available whitespace; larger monitors reveal additional columns rather than scaling or stretching six fixed motifs. Rows continue down long pages at the same spacing. Variations are original ASCII interpretations of eight-pointed star ornament, interlaced jali-style lattice, and a Mughal-inspired flowering stem within a cusped arch. Existing faint palette, reading fade, document scrolling, mobile hiding, and cursor behavior are preserved. References: https://www.metmuseum.org/essays/geometric-patterns-in-islamic-art and https://www.metmuseum.org/art/collection/search/457020.

Sparse randomized ornament update: replace repeating rows/columns with seeded scattered margin placements at approximately one ornament per 200,000 square pixels of margin, plus one per side. Sizes vary from 128–240 CSS pixels, with at least 48px clearance between ornament bounds. A per-load seed keeps samples stable during navigation and layout refreshes. Each ornament mixes muted base/accent colors with a small stippled ASCII color splash. Larger whitespace admits additional sparse ornaments; motifs do not scale with the viewport. The existing scrolling, reading fade, mobile hiding, and cursor trail remain unchanged.

Motif fit rule: shrink each motif to its available margin before placement, reserving 20px on the content side. Interior motifs remain fully inside the page. Deliberately cropped motifs are centered exactly on the left or right page edge so the cut is halfway. All motifs clear the top and bottom page boundaries. Since motifs now sit entirely outside the content column, their outlines retain uniform opacity instead of partially fading against text; cursor-trail reading fades are unchanged.

Selected banner: mockup 5, Mughal album margins, implemented without flowers. Interlaced geometric knots replace the floral corner elements; the open center, dotted gold rule, center lozenge, 48px height, and shared header alignment are retained.

The banner’s dotted rule is drawn over the cached ASCII dots in the same canvas. Larger gold circles share the actual glyph ink centroids on the device-pixel lattice, computed from the dot stamp at each zoom density. This replaces the independent SVG dash pattern, keeping the header row aligned with the background on desktop and mobile. Geometric SVG corners and the central lozenge remain above the canvas.

Banner alignment: the geometric knots and center lozenge share the enlarged dot row’s exact vertical center. The artwork translates to the row’s calculated center after device-pixel snapping; shared page/header widths and navigation alignment remain unchanged. This correction recalculates with zoom and resizing.

Scene lifetime correction: generate one immutable, seeded catalogue of motif descriptors per browser document view. Shape, desired size, fit ratio, document-space y position, horizontal preference, and base/accent colors are sampled once and retained in a ref. Route changes reveal the relevant document-length subset without recalculating y from page height. Resizing adapts only the fit to margin constraints; returning to the same dimensions restores the same geometry. Reload creates a new catalogue. First visible base colors are distinct, and varied fit ratios avoid uniformly sized motifs in narrow margins.
