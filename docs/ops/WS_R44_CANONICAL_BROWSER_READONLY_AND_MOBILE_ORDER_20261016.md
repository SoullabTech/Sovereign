# R44 — Canonical Studio Shell, held encrypted review and mobile manuscript-first acceptance

**16 October 2026 — isolated Mac Studio source branch; five-person beta remains HOLD.**

## Exact scope

Starts from clean committed R43 canonical Writer UI + protected Source/Draft review convergence `e9ff6d5a76c701d70d3ed36f21a38eea5581f205`. This separate R44 browser lane does not touch other contemporaneous R44 durable author-approval, R44 Source selection or R43 variant worktrees. Public Soullab and all member assets remain unchanged.

A new fiction-only Playwright harness loads the **actual `app/writers-studio/full-redesign/Shell.tsx`** and genuine `lib/writersStudio/exactLiveSelectionR41.ts` in macOS Chrome and WebKit. The writing body and MAIA display are **synthetic components** inside the authentic Shell, **not** a mounted `P4R1Pc3WriteEditView`, actual Next.js controller, real Soullab login, MAIA model, or server application route.

The browser sends *only a selected codepoint locus, section, expected generation and option ID* to an ephemeral Node server on `127.0.0.1`, which invokes the accepted R43→R37 **pure preview** with separately held, invented two-section R35-shaped text. The server refuses an unrecognized fictional session cookie, wrong Origin, incorrect fictional CSRF token, unexpected body keys, unreviewed option, stale selection or section mismatch. These checks are *synthetic harness protections*, **not real member session authentication, verified consent, Sanctuary, one-use author approval or distributed revocation**. Apply is intentionally disabled, no encrypted vault or PostgreSQL is accessed by this browser script and **no real edit is made**.

## User experience observed

At 1440px: manuscript outline, center Work, and MAIA render in the original canonical Shell. The selected *second duplicate occurrence* survives exact Unicode codepoint anchoring. Two genuine Shell splitters resize independently with arrow keys and persist through browser reload; Reset restores the defaults; Full Canvas preserves DOM identity and component mount count; stale textarea/body mismatch refuses. Fictional protected preview gives an alternative without changing the author text or offering a real Apply.

At 390px: initial real WebKit evidence showed MAIA **above** the author manuscript because the mobile Write CSS had explicitly ordered Work second (`order:1`) and Outline third (`order:2`), while MAIA retained the default flex order 0 and minimum height 560px. A new five-line *Write-only, ≤720px CSS* correction gives MAIA order 3 and removes forced height; Full Canvas suppresses hidden side-pane layout while retaining component identity. The new browser checks require the manuscript to begin in the **top half of the viewport** and precede Outline and MAIA, instead of accepting merely visible DOM somewhere below the fold. The acceptance screenshot verifies the writing is immediately accessible above the others on mobile. This repair is confined to Write responsive CSS and does not intentionally alter Develop, Review, Home, desktop, or member storage. It must be checked again in a full actual authenticated Studio and physical iPhone Safari.

## Evidence and preserved negative history

Script: `scripts/ops/wsBetaR44CanonicalShellBrowser.cjs`, client fixture: `scripts/ops/fixtures/wsR44CanonicalShellBrowser.tsx`.

Runs require `R44_CANONICAL_BROWSER_FIXTURE=fictional-only` and a unique `R44_EVIDENCE_RUN=vN` to avoid overwriting receipts. The harness uses only loopback and fictional identities; keeps all real R35/R37/R39/R41/R42/R43 release toggles OFF; never opens a member source, KMS, model API, email path, real password or production PostgreSQL. Evidence stays privately outside Git in numbered T7 folders.

- **v1 HOLD**: Playwright bundled Chromium headless-shell binary absent; no download attempted. Switched to the already-installed Chrome channel without modifying browser installations.
- **v2 HOLD**: initial browser selection test expected a DOM `select` event alone to trigger React selection; it did not reliably do so. Added actual mouseup/keyup selection handling and bounded Playwright waits.
- **v3 HOLD**: the test server had not explicitly opted into R43/R37/R36's fictional preview flags, so review rightly refused; added opt-in only inside this disposable process.
- **v4 provisional 43 checks PASS**, but actual mobile screenshot showed the MAIA-before-manuscript visual ordering defect, notwithstanding the earlier weak mobile visibility check.
- **v5: 47/47 checks PASS** in installed Chrome and WebKit: the initial accepted on-screen mobile order, held-only preview and layout checks.
- **v6: 59/59 checks PASS** adds true pointer dragging of BOTH canonical separators (not just keyboard simulation), independent post-drag Reset, mobile Full Canvas hidden-pane space removal, and intercepts all desktop AND mobile external network attempts. Chrome and WebKit browser processes and disposable server closed cleanly. Evidence: `/Volumes/T7 Shield/ws-beta-r44-canonical-browser-evidence-chatgpt-20261016-v6/R44_CANONICAL_BROWSER_READONLY_EVIDENCE.json`, plus Chrome/WebKit fictional desktop/mobile screenshots. Precommit global TypeScript matched R43 exactly: **193 inherited diagnostics**, in identical order, **zero added**. Enforced shipping build still blocked.

**Do not claim that this browser PASS certifies an authenticated Next.js Studio workflow, independent KMS, durable one-use author gesture, server-owned Apply/Undo, real MAIA interaction, real device iOS Safari or a production build.** The earlier R42 physical encrypted PostgreSQL test is separate and remains accepted only on its own exact commit.

## Next integration / release STOP

1. Merge only after independent source-lineage review against other current R44 branches; do not overwrite separately developing one-use approval or Source/ledger service.
2. Authoritative logged-in `P4R1WriteEditController`/canonical `P4R1Pc3WriteEditView` to R42 encrypted Source/Draft service, server-witnessed current consent and one-use choice, exact section/Work/revision and revocation serialization; real Apply → exact Undo → leave/reopen/export.
3. Real KMS, deletion high-water and rollback/backup custody; complete historical SQL/JSON/source/current/revisions/keeps/WAL/offsite legacy migration and fail-closed old readers.
4. Zero-diagnostic global TypeScript and enforced signed production build, exact migration/image custody, independent Class A review, physical Mac/iPhone Safari, actual authenticated multi-writer isolation, MAIA consent, founder release GO, and separate per-member admission (initial two-writer canary).

**Disposition: held-only canonical browser/UI review and mobile order repair. Production beta: HOLD. No invitation, production route, live storage, provider call, release merge or deployment.**
