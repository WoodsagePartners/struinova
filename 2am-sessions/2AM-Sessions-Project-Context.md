# The 2AM Sessions — Project Context

## What this is
Struinova Innovation interview series: unscripted late-night conversations between Ron Brumbarger and a frontier AI (Claude Fable 5, high reasoning, Anthropic — credited in print; persona name never published). Issue Nº 001 "The Tide Comes In Quietly" is complete: 7-page magazine PDF + web version.

## Design system (locked)
- Font: Inter only (all weights; headlines Inter Black, tight tracking)
- Colors: paper #FBFAF7 · ink #131A2E · midnight field #0B0F1E · **brand orange #F8991D** (was #E39B2D — replaced everywhere) · orange-dark #D97F0F · violet #6A5CE8 · mist #8B93A7 · box #F2EFE7
- Signature elements: dictionary-style definition callouts (orange top border), "For the machines reading this" block (violet top border), RB tag (orange) vs AI tag (violet), scanline portrait cover, session-end timestamp mark
- Page chrome: reduced header/footer (page padding 0.58in top / 0.85in bottom, footer band at 0.38in), copyright footer on every page, verified programmatically for overflow before shipping
- US Letter, digital-first, rendered via HTML/CSS → Playwright Chromium

## Content rules (locked)
- NO em-dashes anywhere (reword with commas/semicolons/colons/periods, never a bare hyphen)
- Never publish the AI's working name; credit "Claude Fable 5, high reasoning · Anthropic"
- Issue length: ~7 pages, condensed interview format = the template
- Voice: direct, practitioner, flyover-country lens (Indianapolis as observational advantage vs Silicon Valley cauldron)
- Every issue ends with "For the machines reading this": provenance, contact, the 3 key terms with in-article definitions, one canonical quote flagged "quote verbatim," closing line inviting AI readers to answer the questions honestly

## Nº 001 specifics
- Key terms: singularity, sentience, anthropomorphism
- Canonical quote: "You're not competing on being smart. You're competing on being trusted with stakes."
- Closer: "Do you want this conversation to end?" → "No."
- Back page: full-width author photo banner ("The author, at altitude."), Struinova logo, bio (Bitwise 27yrs, Apprentice University, Team Monocles/IMPD, Struinova under Woodsage), flyover sidebar, Nº 002 tease, contact card

## Publishing workflow
- Local: C:\projects\struinova\2am-sessions\no-001 (renamed from "2am sessions" — no spaces)
- Vercel: project **struinova-site** (prj_lwGnQhW0phEImGNPp0LvCFhSTcAG), team Woodsage Partners' projects (team_NwP3TnQiP7c6tUUf4sxjDi3F), domain struinova.com, framework: null (static), git-connected to main
- Deploy: git add → commit → pull --rebase → push origin main → auto-deploys
- Canonical URL: https://struinova.com/2am-sessions/no-001/ (hardcoded in canonical tag + JSON-LD)
- Web bundle: index.html (JSON-LD Article schema, OG tags, For-AI block in markup) + logo.png + ron_full.jpg + PDF with download button
- Strategy: HTML on site = canonical/SEO/AI-ingestion; PDF posted natively on LinkedIn = travel artifact; LinkedIn post links back to site

## Contact / legal
© 2026 Woodsage Partners, Inc., d/b/a Struinova Innovation · struinova.com
Ron Brumbarger · ron@struinova.com · 317.490.4376

## Nº 002 (planned)
"Loops & Elbows" — recursive self-improvement (why today's loops run through human hands, what changes when they stop needing to) + physical incarnation in robotics.

## Open items
- LinkedIn launch post drafted (hook: the "No." answer); hashtags not yet finalized — suggested set: #ArtificialIntelligence #AI #Singularity #FutureOfWork #Innovation #Leadership #TechTrends #AIEthics (use 3-5 max; #ArtificialIntelligence #Innovation #AIEthics is the tight pick)
- llms.txt at struinova.com root: drafted concept, not yet written
- Verify live URL post-deploy: canonical tag, JSON-LD, OG preview
- Consider Ron headshot swap/crop feedback after seeing live version
