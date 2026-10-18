# The 2AM Sessions — print PDF template

This is the working pipeline that produced the Nº 002 "Loops & Elbows" magazine PDF.
Reuse it for every future issue instead of rebuilding from scratch.

## Why this exists

The first pass at a print PDF (Nº 002, first attempt) hand-built one fixed-height
`.page` div per section ("Part I", "Part II", etc.) and forced a page break at
every section boundary. That produced pages as empty as 50% whitespace whenever
a section ran short, because content could never spill from one page to the next.

This template fixes that by using real **CSS Paged Media** (the [paged.js](https://pagedjs.org)
polyfill), the same class of tooling used for actual book/magazine typesetting.
Content flows continuously through a two-column layout and only breaks to a new
page or column when the current one is actually full. Topics spill across pages
exactly like a real magazine — which is the desired behavior, confirmed with Ron.

## Files

- `print-template.html` — the full issue, using Nº 002 as a worked example.
  Copy this file, then replace the content inside `<div class="flow">...</div>`
  with the new issue's Q&A/cards/etc. Keep the CSS and the cover/backmatter
  markup structure as-is; they're the locked design system.
- `paged.polyfill.js` — the pagination engine. Do not edit. Reference it with
  `<script src="paged.polyfill.js"></script>` at the end of `<body>`.
- `fonts/` — Inter woff2 files (weights 300/400/400-italic/600/700/800/900),
  referenced by the `@font-face` rules at the top of the HTML.
- `render.js` — Node script that drives Playwright's Chromium to load the HTML,
  wait for paged.js to finish paginating, and print to PDF.

## How to build a new issue's PDF

1. Copy `print-template.html`, `paged.polyfill.js`, `fonts/`, and `render.js`
   into a working folder alongside the issue's `logo.png` and photo/portrait.
2. Generate new cover art (the scanline SVG loop-arrow) or reuse the existing
   `.art` SVG block — swap the `SVGART` placeholder pattern if regenerating.
3. Edit the cover block: title, deck copy, keyword pills, issue number.
4. Replace the content inside `.flow`: each Part is `.kicker` + `h2.head` +
   paragraphs. Available reusable card classes:
   - `.q` / `.tag` (RB) / `.a-tag` (AI) — the interview exchange styling
   - `.pull` / `.pull.amber` — pull quotes (violet or amber left border)
   - `.defbox` — dictionary-style definition callout (amber top border)
   - `figure.chart` — SVG chart box
   - `.signals` — numbered signal list (single column at this width)
   - `.meta-signal` — dark callout box
   - `.exchange` — the dramatic one-word-answer closer card (dark, with `.no-word`)
   - `.for-ai` — "For the machines reading this" block (violet top border)
   - `.secmark` with `string-set` — sets the running header text per section
   - `.lastq-start` — forces "The Last Question" onto a fresh page, above its
     answer card, rather than letting it split across a page boundary
5. Update the `.backmatter` section: bio stays mostly static; swap the Nº 00X+1
   tease card and any photo/logo paths.
6. Run: `node render.js print-template.html The-2AM-Sessions-No0XX.pdf`
7. QA checklist before shipping:
   - Zero em-dashes: `grep -c '—' print-template.html` should print `0`
   - Visual check: rasterize with `pdftoppm -png -r 65 file.pdf pg` and read
     each page image, watching for orphaned headers, split cards, or a page
     that's mostly white space (a sign a `break-before` rule is needed)
   - Word count sanity: `pdftotext file.pdf - | wc -w` should roughly match
     the source content's word count (catches paged.js silently dropping content)

## Design system reference (locked, do not change without asking Ron)

- Colors: paper #FBFAF7 · ink #131A2E · midnight field #0B0F1E · brand orange
  #F8991D · orange-dark #D97F0F · violet #6A5CE8 · mist #8B93A7 · box #F2EFE7
- Font: Inter only
- Page: US Letter, margins 0.66in top / 0.85in sides / 0.62in bottom (adjusted
  slightly from the original 0.58/0.85/0.85 spec to leave room for the paged.js
  running header/footer margin boxes)
- Running header: series name (top-left, amber) + current section via
  `string-set` (top-right, mist, uppercase)
- Running footer: copyright (bottom-left) + page number (bottom-right)
- Cover: full-bleed dark page, no header/footer (`@page :first`), scanline
  loop-arrow SVG art in amber/violet dashes
- Back page: forced fresh page (`.backmatter { break-before: page; }`), author
  photo banner, bio, flyover-country sidebar, next-issue tease, contact card

## Known gotcha

Inline `style="break-before:page"` attributes are **not** reliably honored by
paged.js — always define break rules as CSS classes in the stylesheet instead
(see `.lastq-start` for the working pattern).
