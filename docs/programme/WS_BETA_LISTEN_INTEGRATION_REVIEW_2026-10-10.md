# Writer's Studio / Listen — isolated integration verification (2026-10-10)

## Disposition: ENGINEERING REVIEW ONLY — NOT A BETA RELEASE

- Review branch: `chore/ws-beta-listen-integration-review-20261010`
- Last committed Listen baseline: `4d996f2c41c9b08a80418e006a0bb2b50f062d9d`
- Independently validated section-return repair: `39722486d50070834005e95da77ac8bb20400c91`
- Section-return integration commit in this branch: `0d67de53b326d50f72cd17e4adabd2c0f6e3f727`
- Separate active Listen worktree: `/Users/soullab/ws-studio-kelly-integration-20261008` — not modified by this integration review
- Isolated private preview: `http://localhost:3762/writers-studio` on the Mac Studio, local test DB only
- Neither canonical nor production was merged, migrated, or deployed.

## Verified on the Mac Studio, using project dependencies

- `vitest`: 4 Listen files, **16/16 passed**, including full Preface, browser format, mono routing, and the level-meter calculation suite. Synthetic samples, not real Scarlett audio.
- `jest`: 8 Studio files, **46/46 passed**: section-return, place URL, opening navigation, chapter model, Materials safety hold, Studio host, and Prose view. Jest emitted a pre-existing duplicate-package haste warning; all declared tests finished passing.
- Browser, at **the combined review branch** and port **3762**, with authenticated local Kelly test database:
  - Listen opened from **Write / Develop / Review**, retaining the exact Work and section URL.
  - Round-trips back to all three modes passed after waiting for the final URL to settle.
  - Selecting Conclusion from Chapter 10 moved the actual canvas and changed the URL; refresh reopened Conclusion.
  - Existing Materials door visible and source POST returned HTTP **423**; source file input absent.
  - No browser page errors in the declared checks.
- Pre-existing local Studio on port 3756 was left running and untouched. The local test did not issue a provider inference, request microphone permission, save a source, or change manuscript text.

## Required before anyone can call Listen finished

1. Physical Mac Studio + Scarlett acceptance: select correct input, witness live RMS/peak response, confirm centered mono playback and headphones, low-noise floor and no clipping at performance volume.
2. Stop/keep a complete take; play back, download, verify the downloaded file on the Mac, and confirm playback, pause, resume, duration, and the expected audio channel mapping.
3. Test safe departure during/after recording. Takes are retained **in this browser session only**, not server-side. Download before leaving; verify the unsaved-take warning and that recording doesn't alter manuscript prose.
4. User review of the actual reading field (legibility, scrolling, long Preface, changing section and modes) on desktop and mobile Safari. Test microphone permissions and available devices separately.
5. Freeze one exact candidate hash and rerun the full relevant test matrix against **that hash**, including browser checks with its own dependencies. The active Listen lane may be ahead of this review baseline.

## Deployment and governance remains blocked

- Confirmed production reader at review time: `c9e4f7f7e`.
- Exactly four new SQL migrations are present between production and this candidate:
  - `20261002000002_writer_studio_chapter_overview_lens.sql`
  - `20261005000001_writer_studio_work_directives.sql`
  - `20261006000001_writer_studio_completion_checks.sql`
  - `20261007000001_craft_version_choices.sql`
- None of these was recorded in the production ledger in the read-only check. The quick `prepare-maia` / `cutover-maia` lane rejects pending migrations. A separately reviewed **migration-before-swap**, reader-compatibility/rollback and release rehearsal is required before cutover.
- Beta account authorization and one non-founder walkthrough remain unverified for this candidate.
- New member source uploads, reviewed-source writes and deletion remain on hold until Sanctuary authority and crash-safe custody are separately certified; do not bypass source-write gates.
- No inference grant, deployment authorization, migration approval, beta exposure or release ratification is conveyed by this evidence.

## Next handoff

The separate Listen owner finishes the real hardware/experience acceptance and commits a frozen candidate; the release owner then reconciles it with `0d67de53b3`, reruns evidence at the final SHA, and reviews pending migrations and non-founder access. Stop before any live production changes.
