# Desktop reconciliation census — 2026-08-27

Census before replay. The Desktop programme branch has diverged from canonical
for long enough that "rebase the commits" is not a safe instruction: at least
one of them is already on canonical under a different SHA, and a blind replay
cannot tell a duplicate from unlanded work.

This document classifies every commit so the landing can be mechanical.

```
branch      claude/maia-desktop-companion-roadmap-c4i9v5   acc8e5237
canonical   clean-main-no-secrets                          f972bf1fc
merge-base                                                 0c4638a7a
commits ahead                                              36
```

## Headline

**Canonical carries zero files under `maia-desktop/`.** The entire Desktop app
is unlanded. That single fact collapses most of the apparent risk: 56 of the 93
file-touches on this branch are in a directory canonical has never seen, so they
cannot conflict with anything.

**Exactly two files collide.** Everything else is either untouched by canonical
since the merge base, or a file canonical does not have.

## Classification

### A. Clean — `maia-desktop/` only · 11 commits

```
468b52e42  MAIA-D01 device closure
885482f30  DESKTOP-CONVERSATION-01
2dac71cec  Desktop: make the 500 explain itself
2c6518758  Desktop: the frame path was dropping most of your voice
16970d714  Desktop: retract the size ceiling
2769097f9  Desktop: send the audio with a Content-Length
77c645005  Desktop: three attempts
2eb99222e  D04: Desktop joins the member's thread
17c9c8af7  D02: do not hand MAIA twenty seconds of room tone
5ff4969ba  D02: retune the silence gate, reject invisible transcripts
8cd9377fb  Make the invisible-transcript guard bite on the real path
```

Zero collision risk. Canonical has no `maia-desktop/` tree at all.

### B. Clean — files canonical has never touched since the merge base · 20 commits

Includes every `docs/ops/MAIA-D0*`, the roadmap, `PRODUCTION_LOG_FINDINGS`,
`desktop-app/STATUS.md`, `electron/STATUS.md`, `jarvis-desktop/src/preload.js`,
and the two `scripts/builder/__tests__/` proofs.

Verified per file: canonical's blob is byte-identical to the merge base for all
of them, so the branch is the only side that moved. Replay is additive.

⚠️ Four of these belong to a different programme and are only sitting here by
accident of branch:

```
441b48ff8  WS2-00: reconcile the design source against Writer's Studio custody
1f6814b76  WS2-00 founder ruling
fb7821ec8  WS2-00: record the data-custody ruling
ae00ce6e6  workbench custody census
```

Under the 2026-08-27 lane boundary, Writer's Studio is **out of the Companion
Desktop lane**. They still land cleanly (canonical never touched
`WRITERS_STUDIO_PROGRAMME_BOARD.md`), but they should be landed as that lane's
work, not carried in as Desktop work.

### C. ALREADY LANDED — do not replay · 1 commit

```
ceb01b27d  Exclude /api/voice/transcribe-simple from the middleware matcher
```

Reached canonical through PR #1111 as a **different SHA**, which is why patch-id
comparison still lists it as "ahead" and why a naive rebase conflicts.

Proof, not inference:

```
canonical middleware.ts:486
  '/((?!_next/static|_next/image|favicon.ico|api/voice/transcribe-simple).*)',
branch    middleware.ts:400
  '/((?!_next/static|_next/image|favicon.ico|api/voice/transcribe-simple).*)',

__tests__/middleware-transcribe-exclusion.test.ts   IDENTICAL blob on both sides
```

Canonical has moved **226+/109−** on `middleware.ts` since the merge base; the
branch has moved **32+/1−**. The branch is behind on that file, not ahead.
**Take canonical's `middleware.ts` wholesale. Discard the branch's version.**

### D. Genuine add/add — the only real conflict · 3 commits touch it

```
docs/ops/TRANSCRIBE_BODY_DISTURBED_2026-08-27.md
```

Created independently on both sides after the merge base — on canonical via
#1111, on the branch via `84654da6b`. Both then grew:

```
84654da6b  Finding: the transcription 500s are a Next request-construction bug   (creates it)
ceb01b27d  Exclude /api/voice/transcribe-simple from the middleware matcher      (extends it)
2324f4df1  Device witness: nine consecutive spoken turns, zero failures          (extends it)
```

This is the file that broke the first rebase attempt with `CONFLICT (add/add)`.
It needs a content merge, not a side-picked resolution: the branch carries the
§7 runtime witness table (9 turns, 914816 B / 28.6 s), §7.1 near-silence
hallucination, §7.2 clipping and §7.3 the retry-removal condition, which the
canonical copy does not have.

## Landing plan

Not a rebase. A merge, with two named resolutions:

```
1. merge canonical into the Desktop branch (never rebase — 36 commits of
   history, and a merge commit keeps any existing checkout valid)

2. middleware.ts                → take CANONICAL wholesale (branch change
                                  already landed via #1111; canonical is ahead)

3. TRANSCRIBE_BODY_DISTURBED    → content merge; keep canonical's base and
                                  append the branch's §7 / §7.1 / §7.2 / §7.3

4. everything else              → clean, no resolution needed

5. land Writer's Studio's four WS2-00 commits as that lane's work, not this one
```

## What this census changes

The instruction "rebase 33 commits" would have produced either a duplicate
middleware change or a hand-resolved conflict in a file whose two halves both
matter. The actual work is two resolutions in two files, and one commit that
must **not** be replayed.

Everything else — the whole Desktop application — lands additively, because
canonical has never seen it.
