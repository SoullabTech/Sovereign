# WS2-05B-8B-02c-0 · CANONICAL CONVERGENCE — closure record

**Status:** convergence complete. **No 02c implementation.**
**Base:** canonical `7ed38723ee3cbc02a10be57006136d21b4fce7d4` (unmodified).
**Source:** founder-witnessed `eeb452dcbc61f9e655004595f5103d6320f2a25a`.
**Gate Zero:** `afe1be08` — PASS.

The old 03b branch was **not** merged. Every file was taken by explicit path from
the witnessed source; nothing was recreated, rewritten or redesigned.

Terminology, per the founder's precision: "fast-forward" throughout means
**file-lineage forward evolution from the identical custody source**, not a Git
branch fast-forward. The branches remain divergent.

## Transferred set — 28 paths, all byte-identical to `eeb452dcb`

**Tier A · reader substrate + custodied-core deltas** (16)
```
NEW  lib/manuscript/structure/maiaReader.ts
NEW  lib/manuscript/structure/readScope.ts
NEW  lib/manuscript/structure/readerProvenance.ts
NEW  lib/manuscript/structure/canonicalFingerprint.ts
NEW  lib/manuscript/structure/__tests__/maiaReader.test.ts
NEW  lib/manuscript/structure/__tests__/fixtures.test.ts
NEW  database/migrations/20260831000001_structure_proposal_reader_provenance.sql
FF   lib/manuscript/structure/{interpret,review,evidence,fixtures,proposalStore}.ts
FF   lib/manuscript/structure/__tests__/{interpret,review,evidence,proposalGuard}.test.ts
```

**Tier B · the reading to talk from** (6)
```
NEW  app/writers-studio/studioTheme.ts
NEW  app/writers-studio/studio/StudioType.tsx
NEW  app/writers-studio/canvas/StructureReview.tsx
NEW  app/writers-studio/review/page.tsx
NEW  lib/writersStudio/reviewClient.ts
NEW  lib/writersStudio/outlineRows.ts
```

**02a witness harness** (6) — required by closure proof 3
```
NEW  scripts/ws2-05b-02a-legibility-witness.ts
NEW  scripts/ws2-05b-reader-run.ts
NEW  scripts/ws2-witness-browser.ts
FF   scripts/ws2-05{a-structure,b-proposal,b-review}-witness.ts   (+117 / −4, additive)
```

## Closure proofs

**1 · Source fidelity — PASS.** 28/28 transferred paths hash-equal to their
`eeb452dcb` blob. 0 mismatched.

**2 · Canonical preservation — PASS.** The 39-path negative gate (every
CANONICAL-AHEAD + CANONICAL-ONLY path from Gate Zero) ran **before and after**:
`39/39 intact, 0 regressed` both times. #1162 intact across all six of its files;
voice non-degradation, living-works, the concurrency witness and the
canonical-only CI gates all unchanged. The five forbidden files were verified
byte-identical to canonical at the end of the unit (`StudioConversation.tsx` was
never introduced at all).

**3 · Existing behavior green — PASS.**
`npx jest lib/manuscript/structure lib/writersStudio app/writers-studio app/press
__tests__/voice-non-degradation.test.ts` → **19 suites, 336 tests, all passing**,
including `maiaReader.test.ts`, the #1162 `workingDraftClient.test.ts`, and
`voice-non-degradation.test.ts`.
`npm run typecheck` → **no regressions** (231 errors vs baseline 239; 8 fixed;
137 new files entered the program). The baseline was **not** re-recorded.
The reader harness executes on the converged branch:
`CONTRACT_ONLY=1 npx tsx scripts/ws2-05b-reader-run.ts` emits the bounded
read-request contract and reports *"Nothing was sent. No database was opened."*

*Not run here, and not claimed:* the real-book runs
(`ws2-05b-02a-legibility-witness.ts`, the browser harness) require a live server,
production credentials and the real `e6cab…` proposal. This container has no
`DATABASE_URL` and no production data. **02a's real-row witness remains the
founder-witnessed run at `eeb452dcb`; it was not re-executed on this branch.**

**4 · No Ask MAIA capability — PASS.** No API route was added (the transferred
set contains no `app/api/**` path). No chat endpoint, no conversation
persistence, no adoption path. Every `conversation` / `chat` / `adopt` string in
the transferred code is documentation asserting *absence* — e.g. StructureReview:
*"`Ask MAIA about this` IS ABSENT, NOT DISABLED. It is 02c, it does not exist"*;
reviewClient: *"THERE IS NO ADOPTION CALL HERE. Not disabled, not commented out:
absent."* The one mutating call in the transferred set is the **pre-existing 05B
review gesture** (`previewGesture` / `applyGesture`) against the reviewed
proposal via the proposals route already custodied on canonical — not new
capability, and not a canonical write.

## Deferred, with cause: `StructuredOutline`

`StructuredOutline` was authorized in Tier B but is **not** in this unit.

Its import chain is `StructuredOutline → ManuscriptOutline → {canvasIdentity,
studioMap}`. Forwarding `studioMap.ts` (+431 / −40) is part of the **WS2-03B
shell restructure**, which is entangled with the forbidden `canvas/page.tsx`.
Probed empirically rather than assumed: with the chain applied,
`npx jest app/writers-studio` **failed 4 tests** in canonical's
`studioMap.test.ts` — the lane removes the `Writer Canvas` destination that
canonical's shell still declares. The chain was reverted and the shell restored
byte-identical to canonical.

This costs the unit nothing: `/writers-studio/review` — the witnessed 02a
surface — imports only `StructureReview`, `StudioType` and `studioTheme`. It does
**not** import `StructuredOutline`. The 02a surface is fully served.

Landing `StructuredOutline` requires converging the WS2-03B shell, which means
opening `canvas/page.tsx` and `Worktable.tsx` — the #1162 hazard. That is its own
authorized unit, not a side effect of this one.

## Standing hazards (unchanged from Gate Zero)

```
Worktable.tsx          canonical wins — #1162 expired-session repair
WritingSurface.tsx     canonical wins — canonical-ahead, lane sits at base
OracleConversation.tsx canonical wins — Deep-Intelligence Gate; lane's +18-line
                       workContext is re-appliable only under that gate
canvas/page.tsx        untouched — pulls Worktable + StudioConversation
studioMap/canvasIdentity  held at canonical — WS2-03B shell, see above
```

Next threshold: **02c-1 · Conversation Contract** — what a conversation is
anchored to, what MAIA may read, what persists, and what conversation can never
change.
