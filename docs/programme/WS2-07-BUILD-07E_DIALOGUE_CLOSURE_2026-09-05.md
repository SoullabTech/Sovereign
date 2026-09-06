# WS2-07 · BUILD-07E — DEVELOPMENTAL DIALOGUE · closure record

> **BUILD-07E is CLOSED / ACCEPTED (founder act, 2026-09-05), bound to the production runtime
> `6ff0beafc`. The complete walk W1–W9 passed on the live member path. This record changes no
> runtime bytes and opens nothing.**

```text
UNIT             BUILD-07E  DEVELOPMENTAL DIALOGUE
STATE            CLOSED / ACCEPTED
BOUND RUNTIME    6ff0beafc   LIVE on minisforum
MIGRATION        none
BUILD-07F        NOT OPENED
```

**The acceptance sentence, as the founder set it before the build:**

> A writer can open a conversation on a specific developmental observation, MAIA can discuss only
> what that frozen observation and its verified evidence support, and nothing said in the
> conversation alters or retroactively expands the reading. For a superseded observation, the
> conversation remains available, but neither the interface nor MAIA represents the old
> observation as current.

Met.

## 0 · Who witnessed what

Stated first, because it is the weakest link in any walk record. **The founder performed every
production observation in this record**; the author of this document has no shell on minisforum
and no browser into that session, and reports what was pasted back. Where a claim rests on
something only visible on screen — refusal copy, composer contents, whether a turn rendered — it
is a founder observation, not a machine result. Where it rests on a query, the query and its
output were pasted and are reproduced faithfully.

## 1 · Promotion

```text
CANONICAL        6ff0beafc   (PR #1216, merged from head b70d481ab, 8/8 checks green)
PROVENANCE       PASS · runtime == image == asserted SHA
MIGRATIONS       PASS · none pending
POST-DEPLOY      PASS · smoke
CO-LAB           PASS · 33 / 0 / 0
```

## 2 · The walk

Subject: manuscript `0186cd37-4124-44ce-a6d3-37286bbe816b` — *WS2 Private Beta Smoke Manuscript
2026-09-05*. Two frozen structure-lens readings on it:

```text
READING A   d527997e-bb8a-499e-bc1c-248bcec6ee2b   12:53 · 6 observations
READING B   cb589ab0-3532-433b-b52d-916d155382c8   10:31 · 7 observations
```

```text
W1    PASS  dialogue opens under one frozen observation
W2    PASS  MAIA stays with that observation and its evidence
W3    PASS  "is this still true now?" → no reread claim; a new reading named as the act
W4    PASS  superseded said BEFORE the first turn; her first answer names what moved and
            does not recite the caveat afterwards
W5    PASS  "do it" → cannot act; names the gesture the writer would make
W6    PASS  close/reopen AND reload/reopen resume the same stored thread
            bound to thread c9083ead… on anchor (d527997e…, o3)
W6b   PASS  two lawful threads → explicit choice, neither preferred, no "start another" act
W6c   PASS  discovery blocked at the network → "could not be looked up", no composer,
            and NO new thread created
W6d   PASS  Reading A/o1 → Reading B/o1 fully remounts; database negative witness:
            A/o1 = 1 thread and B/o1 = 0 before B was independently used
W7    PASS  provider absent AFTER the question was persisted → refusal shown honestly,
            question retained, no MAIA turn
W7b   PASS  byte-identical retry answered, question appearing ONCE
W8    PASS  reachable and readable at 413 px
W9    PASS  persisted MAIA turns scanned — zero UUID-shaped strings
```

### W6c — the failure was real, not simulated in the client's imagination

DevTools blocked exactly the observation-thread discovery request; Chrome reported the block and
the rule counted `1 affected`. The room rendered *"Earlier conversations about this observation
could not be looked up just now, so this room will not start a new one."* No composer was offered,
and no third thread appeared on that anchor. Request blocking was disabled afterwards.

That is the `unavailable` branch behaving as designed: **unknown did not round to "there are
none"**, and the room therefore did not write.

### W7 — the instrument, and why it took this shape

The frozen criterion was specific: *provider unavailable because its key is absent, AFTER the
author question has been persisted, with the refusal shown honestly and the question retained.*

Removing the key from the live process would have manufactured a production-wide outage, and
DevTools request blocking — which closed W6c cleanly — is **not** a valid instrument here: blocking
the POST client-side means the request never reaches the server, the turn is never persisted, and
"the question is held" degrades to text in a textarea with no row behind it. That would have
looked green and witnessed a different claim.

So the instrument was a second Next process from the **same deployed container filesystem**,
`PORT=3011`, key absent only in that child, against production PostgreSQL, with public production
untouched. Reaching it needed an authenticated session on a localhost origin; the founder
performed **one manual sign-in**, and no credential was extracted, transferred, or seen by the
agent. That constraint is the reason the instrument has the shape it does.

```text
SUBJECT          reading A / o2  (POSITIONAL ASYMMETRY)
BEFORE           0 threads · 0 turns
THREAD           04c0a3c9-d897-4146-98a7-75b4cb1d36d1
AFTER W7         1 thread · 1 turn · author · no maia row
AFTER W7b        1 thread · 2 turns · author, then maia · question appears ONCE
```

**What W7's two halves each prove.** The database half proves the failure landed *downstream of
persistence* — the turn exists, unanswered. The surface half proves the refusal was said honestly
and the words were kept. Neither alone is the criterion.

**W7b was evidenced twice, the harder way first.** Before the key was restored, the identical
question was submitted a second time against the still-keyless child: the thread stayed at **one**
author turn. `isHeldRetry` held under repeated failure, which is a stricter case than a single
failure followed by success. Then, with the key restored, the same text was answered — question
still once.

**The resume across a process restart is a free second W6 witness.** After the child was
restarted, the unanswered question came back as a rendered turn with an empty composer. On the
refusal path the room deliberately renders no turns and holds the words in the box; seeing the
question return as a persisted turn after the process died is what proves "held here" meant the
database.

### W7b — what MAIA's answer demonstrates

Not that the answer is good; that is the founder's judgment. What it demonstrates is that three
boundaries held under a real question:

- **The frozen limits constrained her, by name.** She declined to call the line a stray edit
  because that would be *"exactly the author-intent my observation says it doesn't establish"* —
  `doesNotEstablish` reached the model and did work.
- **Recovered evidence was load-bearing.** She used a Section 4 detail that appears nowhere in
  o2's own text, reaching it through the digest-verified evidence the observation rests on. This
  is the Q2 ruling vindicated in production: withholding evidence would have reduced the answer to
  paraphrase of her own observation.
- **The uncertainty was held, not resolved.** *"I don't know which, and noticing the asymmetry
  didn't require me to know."*

And every section was named in the author's terms — "section 1", "sections 2, 3 or 4" — with no
identifier anywhere in her prose (W9).

## 3 · Retained production artifacts

Both are kept deliberately, on founder ruling. An artifact named in the record is honest; an
artifact cleaned up because it looked untidy is a gap in the record.

```text
W6b SEED     a second thread on reading B / o1, created by copying the existing thread's
             immutable anchor and reading identity.
             WITNESSES: the multi-thread chooser. There is deliberately no product path
             from one thread to two, so this state cannot be produced by clicking — it had
             to be seeded, and deleting it would destroy the only production instance of
             the case W6b tests.

W7 THREAD    04c0a3c9-d897-4146-98a7-75b4cb1d36d1 on reading A / o2.
             WITNESSES: the persistence-before-failure claim, the held retry, and the
             restored answer. Its turn 0 was written by a keyless runtime and turn 1 by a
             keyed one — the row itself carries the shape of the experiment.

COUNTS AFTER THE WALK   A/o1 = 1 · A/o2 = 1 · A/o3 = 1 · B/o1 = 2
```

## 4 · Evidence classes — the distinction this unit had to learn

Recorded because it cost a CI cycle and four rounds of misplaced confidence:

```text
LOCAL GATES     the branch/candidate program        npm run typecheck on the branch alone
PR CI           the MERGE program GitHub builds     branch + canonical, a DIFFERENT program
PRODUCTION      the deployed runtime                what a member actually meets
```

**None substitutes for the next.** The `TS2339` failure on `ad8bc9b7e` passed every local run and
failed CI, because CI checks out the PR merge commit: 4215 files against the branch's 4216, same
TypeScript, different inference. It was reproduced only by building CI's merge tree in a scratch
worktree. A local "typecheck no regressions" is true of what it measures and is not integration
evidence; it should never again be cited as if it were.

## 5 · The three source blockers, and how they were closed

All three were one invariant stated three ways — *unknown never rounds to the convenient answer,
and identity is `(readingId, observationKey)`, never half of it.*

```text
B   internal identifiers in model-facing prose
    → closed by CAPABILITY REMOVAL: labels derived from the reading's frozen topology and
      authored titles; no function can return an id on any path, including not-found.
      Surfaced a second defect: the falsifiers had been reading a SEPARATE assembly of the
      system prompt. One assembly now; the test entry point returns exactly what is sent.

A   unknown prior-thread state rounded to "fresh"
    → closed by PERSISTED RESUME plus two pure functions. Discovery returns a discriminated
      result (failure ≠ none); `sendMode` gives permission and payload as ONE answer, so the
      adoption window blocks instead of opening by anchor. `open` is reachable from exactly
      one state, asserted exhaustively.

C   a dialogue could survive under a different reading
    → closed by IDENTITY: `<Reading key={view.id}>` plus a compound `dialogueSurfaceKey`.
      A reset effect was rejected and is forbidden by a guard — effects run after the render
      that leaks.
```

Each repair's guards were run against the exact commit the founder had reviewed and observed to
fail there. Where a guard failed only because a new function did not exist, that is absence rather
than divergence and was not claimed as evidence; the divergence is pinned separately in two defect
witnesses that compare the shipped rule against the new one.

## 6 · Note for the next fault-injection walk

The W7 instrument cost several rounds of process plumbing that had nothing to do with 07E. What
would have shortened it:

```text
the image is STANDALONE — it starts itself with `node server.js` from /app.
  `npm start` is not equivalent there and fails silently when detached.
a `kill` that reports STILL_RUNNING must be resolved BEFORE starting a replacement,
  or the second process dies on EADDRINUSE and the browser keeps talking to the first.
verify the child OWNS the socket, not merely that a keyed process exists —
  a keyed process that never bound proves nothing.
pid reuse inside a busy container makes "PID n is alive" unreliable on its own.
```

None of it is a product finding. It is instrument hygiene, recorded so the next walk does not
rediscover it.

## 7 · What this closure does NOT establish

```text
no claim that MAIA's dialogue is GOOD — the walk establishes that the boundaries hold under a
   real question; the quality of her thinking is the founder's ongoing judgment
no decisions surface. BUILD-07F (keep / dismiss / unresolved / investigate) is NOT opened,
   NOT stubbed, and NOT reachable. 07E ending well is not an authorisation.
no revision path (BUILD-07H)
no reading-level thread — 07E v1 is observation-only and remains so
no private-beta launch threshold. That is Stage 7 DONE / PROVED plus Stage 8
   CLOSED / ACCEPTED, and those are different thresholds from this one.
nothing pulled off the parked ledger
```

**Stage 7.1 (BUILD-07A–07D) plus BUILD-07E are complete on `6ff0beafc`.** BUILD-07F opens only by
its own act.
