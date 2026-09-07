# JARVIS — Writer's Studio Launch Flow

**Status:** PROPOSED · authorizes nothing · every gate begins with a founder act
**Drafted:** 2026-09-07

## The governing question

Stop asking *"what features are missing?"* and ask:

> **What claim is the interface making right now, under this exact state, and
> is that claim true?**

That question sorts every case cleanly, where a feature inventory does not:

```text
grey + not applicable      → truthful
grey + not built           → truthful, if explicit
bright + works             → truthful
bright + doesn't work      → LAUNCH DEFECT
```

## The doctrine above the flow

> **Make Write true before making Develop broad.**

One complete room beats two half-complete rooms. A writer who hits a dead end
in either concludes the product is not ready.

---

## GATE 0 · PRODUCTION TRUTH

```text
source ≠ canonical ≠ production ≠ member experience

canonical    3027ceaff
production   e535e6246

credential
  replacement on disk       YES
  container StartedAt       12:57:23 UTC
  .env.production mtime     13:35:42 UTC   ← 38 min AFTER
  replacement loaded        NO
  Act 1 required            YES

deploy custody
  COHORT PRE-WITNESS HOLD   still live
  never delete .deploy.lock
  owner release             PREFERRED
  founder-authorized break  = PREEMPTION, recorded as such
```

The mechanical note that goes with a break: the flock lives on minisforum,
held by the remote process and any children it spawned. Terminating the local
end can orphan the remote holder and leave the lock held with no visible owner
— a worse state than now. Verify release by `fuser` on minisforum showing
**nothing** holding the file, not by a PID being gone.

## GATE 1 · RESTORE VOICE — security/service only

```text
target: exact e535e6246

owning lane releases hold  OR  Kelly authorizes preemption
  → recreate through the normal deploy gate
  → StartedAt MUST change            ← the only signal that works here
  → GIT_COMMIT MUST remain e535e6246
  → credential-only TTS smoke MUST succeed
  → only then: delete ~/Downloads/openai-api-key.txt
```

**The verification trap, stated because it is easy to miss.** Deploying
`e535e6246` onto a production already running `e535e6246` means `GIT_COMMIT`
matches whether or not the container was actually recreated. It cannot
distinguish success from a no-op. `StartedAt` moving off `12:57:23` is the
signal; the TTS smoke is the only proof the new credential is in memory.

```text
PASS means          the replacement credential is live
PASS DOES NOT mean  voice routing is sovereign or correct
```

## GATE 2 · LAUNCH CENSUS — DISCOVER only

**No repairs during the census.** A census that fixes things is no longer a
census, and its map can no longer be trusted as a picture of what was.

Inspect **both** Write and Develop. Classify every visible affordance:

```text
A  LIVE                       implemented · applicable · actually works
B  CONTEXTUALLY INAPPLICABLE  implemented, dimmed because no Work/state permits it
C  HONESTLY UNAVAILABLE       explicit available:false, or a truthful "not yet"
D  CLAIM FAILURE              looks available, or advertises state/count,
                              but does not complete the promised behaviour
```

**This gate exists because grey ≠ unavailable. Grey may mean context.**
Observed 2026-09-07: `Materials`, `Structure`, `Versions` and `Conversations`
render bright with a Work open and dim without one. A launch scope chosen from
screenshots is chosen from a misreading — an earlier pass in this session made
exactly that error and had to withdraw it.

Census output, per affordance:

```text
function · room · visible state · contextual prerequisites
         · implementation location · available flag
         · click/route behaviour · persistence/backend
         · classification A/B/C/D · launch consequence
```

**Why D is the whole point.** A greyed button announces itself; a broken one
does not. This repo has now found four instances of the same shape —
`{ convert: true }` with no caller, `beginDraft()` with no callback, a
member-scoped DELETE route with no UI, and a Versions panel reading `reading…`
beneath a rail displaying a count. **The command exists, the door doesn't.**
Every one was found by accident. The census is the method that replaces luck.

**Precedent that this ordering pays.** SEGMENTATION-TOC was characterized
before a repair opened, and the characterization disconfirmed it: 40-100
predicted false sections turned out to be four, and the proposed mechanism was
wrong. A lane opened on the first framing would have been wasted work.

## GATE 3 · WRITE LAUNCH SCOPE

```text
default doctrine
  WRITE    → the launch room
  DEVELOP  → closed / honestly unavailable, unless the census overturns it

highest-priority Write question
  FIND

  a 383,083-character / 175-section manuscript without search is not
  realistically navigable. Scrolling 175 sections is not a workaround.

  Find     launch-critical
  Replace  can wait — Find alone carries nearly all the value

Versions
  census decides
  functional      → finish it
  not functional  → make it honestly unavailable
  never leave "reading…" standing as an apparent capability
```

## GATE 4 · MINIMAL REPAIR PROGRAMME

Only Class-D launch failures, or explicitly authorized launch essentials, move.

```text
likely ordering, subject to census
  FIND
  → Versions truthfulness/function
  → any other discovered claim failures

DO NOT "fill out the rail."
```

Notes · Goals · Discover · Insights · Suggestions · Replace · Statistics ·
Timeline · Word Web · Threads **may all remain unavailable if they tell the
truth.** The existing `available: false` flags and the Goals copy already do
this well:

> *"A goal is yours to set. There is no way to declare one here yet, so
> nothing is measured."*

That sentence says exactly what is and is not true. Nothing there needs fixing.

## GATE 5 · WRITE COHORT ACCEPTANCE

The member loop must close:

```text
import real manuscript → navigate → find → write → preserve/version → export
```

Acceptance uses **cross-surface invariants** where possible — a distinctive
value observable in both the member surface and the authoritative backend
record:

```text
PDF-CLEAN pattern    UI 175 sections
                     log 175 sections
                     persisted 175 sections
```

That is why PDF-CLEAN closed on its own evidence while INGEST-TRANSPORT and
NAV-03 needed an operator attestation — nothing bound their screenshots to the
object.

**The limit, so it is not over-applied:** an invariant settles *object identity
and persistence*. It does not settle *experiential predicates* — "no reload
happened", "I clicked rather than navigated". Those leave no artifact and still
require a named operator. Method note:
`docs/programme/WITNESS_METHOD_CROSS_SURFACE_INVARIANT_2026-09-07.md`

Standing pre-invite gate, not superseded by anything here:

```bash
docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'
```

Pass condition is `0 failed` — the failed column, never the total.

## GATE 6 · PRODUCTION CATCH-UP — a separate release act

Only after credential restoration is independently closed.

```text
target   3027ceaff, or a later specifically adjudicated canonical SHA
ships    #1258 I0.5 · #1259 WS-DELETE-01 · other canonical state only if
         explicitly accepted
```

**Only HERE does "WS-DELETE-01 merged" become "Kelly can delete Works in
production."** Built ≠ wired ≠ surfacing ≠ verified. The first is true today;
the second is not.

## GATE 7 · DEVELOP

Not a parallel launch-completion programme. After Write proves the complete
member loop: census Develop, decide its actual purpose, open only the smallest
coherent loop.

---

## Separate / parked

```text
PDF-CLEAN          CLOSED · class R
INGEST-TRANSPORT   CLOSED · class R
NAV-03             CLOSED
SEGMENTATION-TOC   CLOSED · characterized · no repair needed
PDF-OCR            HOLD
VOICE-SOVEREIGNTY  unopened · two findings banked
                   (choice-path bypass · failure-path non-recovery)
PR #1260           docs-only · open · no clock
workbench PDF      parked parallel surface
```

## Cockpit

```text
NOW
  VOICE RESTORE    blocked on the custody decision
  WRITE CENSUS     authorized only when Kelly says DISCOVER
  PROD CATCH-UP    queued after voice restore
  DEVELOP          hold
```

The census is the correct next *product* act. It should wait behind the
time-sensitive voice restoration unless they are deliberately run as two
independent lanes — a census taken against `e535e6246` describes a production
about to change, and the map would be stale before Gate 3 read it.

## What this document does not do

It does not authorize the census. It does not rank affordances — the ordering
in Gates 3 and 4 is input to a founder decision, not the decision. It does not
commit to Find, to closing Develop, or to any repair.
