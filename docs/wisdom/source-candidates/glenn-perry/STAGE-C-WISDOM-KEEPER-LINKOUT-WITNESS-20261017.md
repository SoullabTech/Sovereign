# Glenn Perry × MAIA — Wisdom-Keeper Attribution and Discovery Witness

**Date:** 2026-10-17  
**Branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Exact source code revision verified:** `c17e094bea78769a3128c493f57271319104f01a`  
**Status:** **96/96 isolated verification PASS**. Research-branch founder preview and original Soullab commentary updated. **Nothing published, live-enabled, corpus-admitted, merged, deployed, or licensed.**

## Founder direction

Represent and support original wisdom keepers rather than absorbing their contributions into MAIA as anonymous intellectual material. For Glenn Perry, include links to his own website(s) and works, maintaining accurate distinction between his AstroPsychology propositions and Soullab's normative adaptation. The founder will contact Perry personally; **do not send the prepared permission email**.

## Verified direct source-navigation links

The reference links below were checked against Glenn Perry's own personal site and the Academy's site on 2026-10-17:

| Resource | Official outbound destination | Purpose |
| --- | --- | --- |
| Glenn Perry’s website | https://aaperry.com/ | Original books, essays, lectures, consultations |
| Academy of AstroPsychology | https://astropsychology.org/ | His school's education and training |
| *An Introduction to AstroPsychology* | https://aaperry.com/product/an-introduction-to-astropsychology/ | Direct listing for the founder-owned book |
| *Depth Analysis of the Natal Chart* | https://aaperry.com/product/depth-analysis-of-the-natal-chart-advanced-therapeutic-astrology/ | Direct listing for the second founder-owned book |
| Books by Glenn Perry | https://aaperry.com/astrology-books/ | Explore his wider catalogue |
| Concepts and Theory | https://aaperry.com/concepts-and-theory/ | Direct index of Perry's authored essays |

The Academy's own articles index describes its links as directing readers to Glenn's personal site, confirming the relationship of `astropsychology.org` and `aaperry.com`.

**Nothing in these links implies an agreement, endorsement, sponsorship, affiliate relationship, text-extraction licence, permission to embed the books, or support for claims of clinical astrological diagnosis.**

## Exact integration

1. `docs/wisdom/source-candidates/glenn-perry/sources.json` — retains the original two book + nine essay source records (11), rights flags all disabled, and adds a `wisdom_keeper_discovery` section for six verified, controlled external links, the two official domains, a reciprocity rationale, and explicit no-endorsement/no-text-rights caveats.
2. `lib/maia/knowledge/perryWisdomKeeperLinks.ts` — a browser-safe static module carrying the same six outbound source destinations with human-readable names and descriptions. It has **no network requests, secrets, storage, embeddings, source excerpts, model instructions, or member data**.
3. `components/maia/knowledge/PerryLensFounderPreview.tsx` — adds an “Explore Glenn Perry’s original work” section. The six links are ordinary, keyboard-focusable `<a>` elements with `target="_blank" rel="noopener noreferrer"`. Users choose whether to open any link. No automatic requests are made to Glenn's websites.
4. `docs/wisdom/source-candidates/glenn-perry/soullab-original-teaching-candidate.md` — adds “Read and study with the original author,” naming his personal site, Academy, two books, and author index while distinguishing intellectual lineages and experimental evidence.
5. `WISDOM-KEEPER-RECIPROCITY-CANDIDATE-20261017.md` — proposes a broader approach to crediting and sending interested readers to original writers/teachers; remains Tier 4, status review and retrieval-disabled, not ratified canon.
6. `stage-c-wisdom-keeper-links.test.mjs` plus existing updated integrity and WebKit suites ensure code/metadata links match and carry no unauthorized source content.

## Isolated technical witnesses

All checks executed against exact downloaded branch files in disposable locations on Kelly's authorized Mac Studio. The final combined run at `c17e094bea78769a3128c493f57271319104f01a` passed **96/96**, including:
- 88 previously accepted Stage A–C source/permission/Sanctuary/current-client-posture/founder preview/Next.js handler/WebKit checks, updated to the current source;
- one new WebKit source navigation check, verifying the six exact links, external destination handling, accessible focus, mobile styling, and no unsolicited network;
- seven new source link metadata and reciprocity checks ensuring all six sites match the registry and all links remain HTTPS and on the author's own domains.

A first WebKit link-focus assertion assumed pressing Tab necessarily visits every anchor; that assumption depends on Safari platform keyboard-navigation preferences. The check was correctly narrowed to **natural tab eligibility and actual programmatic focus** for the first two anchors rather than altering application code or pretending that a CI Tab proves platform configuration. The complete suite then passed.

Node type-stripped syntax checks passed for route and new pure modules; targeted strict TypeScript noEmit passed for the UI, client gate, link module, and Sanctuary reader. These do not constitute a full product TypeScript compile or a production build.

## What remains separate

- This is **not an active MAIA reading** or a working new source selector. The founder-only preview is default-off and not connected to the main conversation UI or navigation.
- The server-side Perry source approval constant remains `null`. Original Soullab teaching remains review-only and not admitted.
- No full text from the books or essays has been copied, indexed, embedded, or used for model training. Ownership of physical copies does not grant those permissions. The founder will handle outreach to Perry; no email was sent.
- The optional Perry source gate is stricter about Sanctuary than the currently deployed general MAIA route. The cross-feature current-turn privacy authority remains a separate release blocker.
- Before any member-facing rollout, founder editorial approval, source-rights and admission evidence, privacy posture review, actual browser-to-serving-app proof, and separate release authorization are required.
- No product build, TestFlight, protected branch, production environment, server, database, existing site account or member has been modified during this linkout integration.

**Disposition:** Wisdom-keeper attribution and direct discovery are now tangible in the isolated Perry founder preview and original Soullab teaching candidate. **Review only; release closed.**
