# Insight comparison repair — 2026-09-17

Founder screenshots show the deployed expanded canvas, but long stacked sections and absent markers obscure comparison. The screenshot alone does not establish that every cited passage is unchanged.

## Reproduced cause and repair

Development capture hashes stored section text including its heading. Rebuild context projects that text into heading and body. The canvas previously hashed only the body and interpreted stored-text offsets as body offsets. The headed-section witness reproduces this mismatch.

Context now returns the exact removed heading prefix from the existing lossless projection. The canvas verifies prefix plus body against the frozen digest, then translates Unicode codepoint ranges into body coordinates. Missing, changed, position-only, unavailable or out-of-body evidence remains unselected. No fuzzy matching or guessed heading reconstruction is used. Ownership checks and explicit adoption remain unchanged.

Related passages appear as compact comparison cards beside intention and reader-experience notes. Each has evidence status and an explicit full-section toggle. Unverified references show a labeled section opening, not a claimed evidence excerpt. Reading currency and passage verification are presented separately. Narrow screens stack the workspace without horizontal overflow.

## Verification

- Insight adapter: 14 tests passed, including Unicode heading/body offsets, missing and changed prefixes, and heading-overlapping ranges.
- TypeScript: 229 diagnostics against baseline 239; zero new diagnostics.
- Actual Write and Develop component witnesses: Chromium and WebKit pass exact headed highlights, side-by-side cards, full-section toggle, 390px layout, stale evidence controls, identity-preserving handoff, draft/scroll retention, explicit adoption and conflict preservation.
- Controlled API fixtures only; no production manuscript mutations or claim of authenticated production acceptance.

Reproduce with scripts/witness/insight-canvas/build.cjs then run.cjs. Screenshots and results are generated under /tmp/ws-insight-witness. Deployment and founder verification remain pending.
