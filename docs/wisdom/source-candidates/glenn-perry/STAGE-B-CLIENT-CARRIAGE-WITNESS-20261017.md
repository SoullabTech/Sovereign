# Glenn Perry × MAIA — Stage B client carriage and gesture-time Sanctuary witness

**Date:** 2026-10-17  
**Branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Source commit tested:** `d064e29a1e11b67cc111b710e4b91a51d307d2ed`  
**Standing:** Perry-only *unwired client preparation* verified. **Not a UI integration, source admission, live Sanctuary fix, full Next.js app build, merge, or release.**

## Actual current web/iPhone conversation call site

Inspected `components/OracleConversation.tsx` from the **pinned Perry review branch**. The main `/api/sovereign/app/maia/list` submission passes `sanctuary: effectiveSanctuary`, which is computed from the current authored mode-command decision if applicable, otherwise from `isSanctuary` React state. This is more precise than a claim that all sends use `isSanctuary` directly. The state initializes to false if `localStorage["maia_settings"]` is missing, invalid or unavailable. Therefore a missing setting can appear to the route as explicit ordinary unless a current mode command corrects it.

The existing dedicated `lib/sanctuary/currentClientPosture.ts` is narrower and safer for optional source selection: it reads the live `maia_settings.sanctuary` at each gesture and returns UNRESOLVED for any non-boolean, absent, or inaccessible value. This helper already belongs to MAIA's established Sanctuary design and is not modified here. Streaming voice has a separate required-boolean Sanctuary parameter, and a separate chat hook exists; this witness is **not** an audit of every caller.

## Narrow isolated addition

- `lib/maia/knowledge/perryClientPostureGate.ts` (new, **not yet called by the main UI**) offers a future optional source-selection request fragment containing only `perrySourceLens:'glenn-perry-astropsychology'` and `sanctuary:false` when all of the following are true:
  1. An exact Perry lens choice was made (no generic astrology inference or ambient selection).
  2. The current-turn mode-command parser explicitly reports whether the member is **entering Sanctuary in this very turn**; this is a required boolean argument, not a default.
  3. That current turn is not entering Sanctuary.
  4. The existing live settings reader reports a resolved current posture of ordinary (`sanctuary:false`).

- No choice, missing current-turn command disposition, unreadable live settings, a stored Sanctuary choice or a same-turn Sanctuary command produce a *refusal*, not source selection.
- A hypothetical UI component must call this helper *at send time*, after command parsing. No UI has been changed or connected in Stage B.
- This source request is **not source authority**. The existing server helper still requires verified session identity, current-turn source choice, real `TurnPosture`, explicit posture, founder exact-source authority record, global Library path/hash admission, safe source frontmatter, and an operational flag. Its `APPROVED_PERRY_EDITORIAL_SOURCE` remains `null`.
- The new client helper deliberately does not import the server-only Perry module or the global Library / filesystem code into browser bundles.

## Exact verification

The same isolated Mac Studio environment used in Stage B fetched the pinned source in disposable directories and used genuine offline Next.js 15.5.11 request objects for the earlier serving-route tests.

At commit `d064e29a1e11b67cc111b710e4b91a51d307d2ed`, **71 of 71 checks passed**:

| Suite | Passing tests |
| --- | ---: |
| Source/claim/rights integrity | 9 |
| Admission and global Library exclusion | 5 |
| Existing 12-domain knowledge-field rehearsal | 12 |
| Perry helper and fictional HTTP request cases | 14 |
| Physical fictional source/corpus admission | 11 |
| Genuine Next.js 15.5.11 serving route to intercepted inference seam | 8 |
| NEW client current-turn posture carriage | 12 |
| **Total** | **71** |

Additional checks: source syntaxes passed `node --check`. A targeted **strict TypeScript noEmit** check passed for the new Perry client helper and `currentClientPosture.ts` with the existing `@/` alias mapped in a disposable tsconfig; this is **not a full repository-wide typecheck**.

A hostile test independently replaced the live `readCurrentSanctuaryPosture(storage)` call with a fabricated always-ordinary value in a disposable copy only. **7 of the 12 client checks failed as expected** (including current Sanctuary, absent posture, stale state, account-default substitution and gesture-time reread). The mutation was never written to GitHub, the real Mac Studio worktree, or any app installation.

## Important limits and release gates

1. This is *source integration and fictional behavior*, not a working Perry option in the web or iPhone UI; no caller currently passes `perrySourceLens`.
2. A current device setting and a mode-command parse do not constitute independent server-owned Sanctuary proof. The serving MAIA route's general `isSanctuary=(meta as any)?.sanctuary===true` treatment of missing/malformed current posture remains outside this lane and **release-blocking** for broader privacy integrity.
3. No edit to `components/OracleConversation.tsx`, Quick Settings, streaming voice, `lib/sanctuary/turnPosture.ts`, or account/privacy settings was made.
4. Neither Glenn Perry's books nor his essay bodies have been ingested, embedded, or licensed. Kelly is contacting Perry personally; the draft remains unsent.
5. Soullab's original Perry-informed teaching is awaiting independent founder editorial approval and exact-source corpus authority evidence. Until then the Perry server lens is null and disabled.
6. A future bounded client activation requires a founder-approved member gesture, correct per-turn dispatch/cancel semantics, real WebKit/Next.js tests with fictional identity, and a separate route-wide Sanctuary authority decision.

**Disposition:** Perry client current-posture helper PREPARED AND TESTED, **unwired**; 71/71 stage-B tests pass. Release remains closed.
