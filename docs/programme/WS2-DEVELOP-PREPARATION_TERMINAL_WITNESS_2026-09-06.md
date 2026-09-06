# WS2 · DEVELOP PREPARATION — Terminal Witness Record

> **This record closes a chain, not a unit.** It freezes what was observed on production when the
> last preparatory obstruction between a real long Work and the developmental reader was removed.
> It authorizes nothing. It is written before any long-work design work so that later design cannot
> retroactively blur what was actually established here.

```text
CHAIN            DEVELOP PREPARATION — draft section reachability → partition custody → validator reach
SUBJECT          50302f5d9   (production runtime GIT_COMMIT, read before and after the run)
WORK             book-print-kdp-final
DATE             2026-09-06
OUTCOME          ceiling_exceeded — the reader refused a single whole-Work pass, as designed
ACCEPTANCE       13 checks · 0 failures
INSTRUMENT       scripts/witness/ws2-develop-preparation-witness.ts  (read-only; --after mode)
WITNESS WRITES   NONE
CLOSES           partition_not_recorded · revision_not_current
OPENS            nothing — BUILD-07G is opened by its own founder act, recorded separately
```

---

## 1 · The frozen result

```text
subject                  50302f5d9
Work                     book-print-kdp-final
pre digest               ddb2536fd3bdcf48
post digest              ddb2536fd3bdcf48
member text movement     NONE
draft version            3 → 4
new revision             #4
revision bytes           381077
current draft bytes      381077
partition                185 / 185 · exact order
partition_not_recorded   CLOSED
revision_not_current     CLOSED
validator reached        YES
validator verdict        ceiling_exceeded
acceptance               13 checks · 0 failures
witness writes           NONE
```

---

## 2 · The strongest fact in this record — the unchanged digest

**The draft digest is `ddb2536fd3bdcf48` on both sides of the member act.**

The gesture advanced the draft `version 3 → 4` and appended revision #4 to the append-only revision
store. Across that transition the member's text is byte-identical.

This is the direct empirical form of the promise the preparation copy makes — *not one character
moves*. It is not inferred from reading the code path and it is not a property asserted by a test
fixture. It is measured on the real Work, on both sides of the real act, on production.

**The member act changed the revision state without changing the Work.** That sentence is the whole
point of the chain, and it is now witnessed rather than argued.

---

## 3 · The load-bearing distinction: freeze, not restore

Before the gesture the two byte counts disagreed by exactly one character:

```text
current draft bytes      381077
revision #3 bytes        381076
```

That gap is real member work. A single-section autosave landed in the browser session **before** the
old checkpoint transport failed with the Next body-reconstruction error. It is not a defect this
chain repaired; it is the state the chain had to survive.

A checkpoint that **restored** revision #3 rather than **froze** the current server draft would have
silently discarded that character and still satisfied every partition assertion. Revision #4 records
**381077**. It froze the current server truth.

⛔ **This is the assertion that must never be dropped from this witness.** Partition custody can be
perfect over the wrong bytes. `revision bytes == current draft bytes` is what makes the partition a
statement about the member's Work rather than about a stale copy of it.

---

## 4 · Claim states — what is established, and by what

```text
partition custody 185/185, exact draft order
  → WITNESSED  (read-only query against production, --after mode)

revision #4 freezes 381077, the current server draft
  → WITNESSED

member text unchanged across the act (digest identical)
  → WITNESSED

capture reaches the validator; verdict ceiling_exceeded
  → WITNESSED

zero-body checkpoint transport
  → contract-established + transport-observed
    NOT payload-pane-witnessed
```

The zero-body property is established by the deployed #1233 client contract and its test
(`RequestInit.body` absent), together with the browser observation of
`POST /api/sovereign/manuscripts/<id>/draft/checkpoint`, Resource Timing
`initiatorType=fetch · responseStatus=200`, and the appearance of Version 4.

The DevTools Request Payload pane was **not** captured after the fact. This record does not claim a
visual payload witness and no conclusion here depends on one: a 381 KB `PUT /draft` could not have
produced a 200 on this production build at all — that transport is the exact failure #1233 repaired.

---

## 5 · Negative control — the DOM `.click()` no-op

A DOM-dispatched `.click()` on the Keep a version button was attempted first.

```text
observation      no checkpoint request; no state change
re-run witness   still revision #3, still the same five failing assertions
repeated         NO — the path was not retried
```

One focused keyboard activation in the authenticated browser then produced the sole revision
transition.

**What this establishes, stated at its actual width:**

> A DOM-dispatched `.click()` in that observed browser state produced no checkpoint request and no
> state change; one focused keyboard activation produced the sole revision transition.

⛔ **What this does NOT establish.** It is not a universal property of every possible browser
automation path, and this record does not canonize "Keep a version cannot be driven
programmatically" from one no-op invocation. That is a hypothesis this run is consistent with, not a
finding this run proves.

Its evidentiary value here is narrower and cleaner: it is a **negative control**. The state moved
exactly once, on exactly one real act. Nothing else in the session moved it.

---

## 6 · Pre-gesture state, for comparison

Captured read-only, bound to the same subject `50302f5d9`, before the act:

```text
draft sections             185
draft characters           381077
draft digest               ddb2536fd3bdcf48
draft version              3
newest kept revision       #3 — before section conversion
revision #3 characters     381076
partition entries          0
WRITES                     NONE

section-addressable                 PASS
185/185 Source sections represented PASS
Source provenance                   PASS
positions contiguous                PASS
sections flatten exactly to draft   PASS
capture not_readable                CLEARED

FAILING (5)
1  newest revision records partition       FAIL
2  newest revision bytes == current draft  FAIL   381076 vs 381077
3  partition covers all 185 sections        FAIL
4  partition preserves draft order          FAIL
5  whole-draft capture                      partition_not_recorded
```

All five closed on the single gesture.

---

## 7 · Chain provenance — how the obstruction was actually built and removed

Three distinct defects, discovered in order, each closed before the next was visible:

```text
1  not_readable
   DEVELOP capture reads the DRAFT partition, not the Source outline. Drafts created before
   2026-09-02 have no section-addressable partition, and the only wired conversion demanded byte
   equality against Source. A Work with 185 edited Source sections was therefore unreadable.
   Closed by the preparation resolver + split conversion authority (mechanical | member_confirmation).

2  partition_not_recorded
   Conversion wrote a revision carrying NO section_partition, so the newest revision — the one
   capture freezes from — was always partition-less. The room then told a prepared Work it was
   unprepared: a loop with no exit.
   Closed by PR #1228 (partition written from the minted sections inside the conversion transaction).

3  Keep a version 500
   PUT /draft sent all 185 sections (~381 KB) through a middleware-matched route; Next buffered the
   body, rebuilt the Request from a consumed stream, and threw at l.fromNodeNextRequest BEFORE any
   application code — including auth.
   Closed by PR #1233 (bodyless checkpoint; the server freezes the section rows it already holds).
   The /api/voice/transcribe-simple matcher-exclusion fix was NOT transferable: /api/sovereign
   carries a real access rule (config/accessMatrix.ts — minTier 'free'), so excluding the path would
   have removed policy that actually applies.
```

```text
SUBJECT LINEAGE
ccd1c50ce   #1228 merged           witness bound here, then superseded
66da58b4c   #1231                  witness correctly refused: INVALID, wrong subject
1116f7813   #1232
03e9d89a9   #1230 (WS2-08 BUILD-08A, heading depth at ingest)
d07f20a0    #1233 merged           the bodyless checkpoint enters canonical
50302f5d9   #1235                  DEPLOYED · this record's subject
```

⛔ **The witness refused twice rather than rebinding itself.** `--expect-sha` compares by exact
string and exits INVALID on drift. That is not a failed test and not a passed one: it is the
instrument declining to testify about a runtime it did not observe. Had it silently rebound, a claim
about `ccd1c50ce` would have been converted into a claim about a different program.

---

## 8 · What this chain did NOT do

```text
NOT DONE   no manual UPDATE of section_addressable_at
NOT DONE   no SQL population of manuscript_draft_sections
NOT DONE   no re-import of the Work
NOT DONE   no historical revision backfill
NOT DONE   no second Prepare
NOT DONE   no --apply run against production by any party but the founder
NOT DONE   no route-call or SQL substitute for the member gesture
```

The member act was performed by the member, in an authenticated browser, once. Every other party to
this chain — including the assistant that wrote the instrument — held read-only.

---

## 9 · Standing adjudication

```text
partition_not_recorded       CLOSED
revision_not_current         CLOSED
section reachability         PASS
partition custody            PASS · 185/185 · exact order
whole-work single pass       REFUSED AS DESIGNED
reason                       ceiling_exceeded
production subject           50302f5d9 · stable
```

**`ceiling_exceeded` is not a defect.** It is the developmental reader correctly refusing a single
pass over a Work that genuinely exceeds one pass, with every preparatory wall now gone from in front
of it. Before this chain, `book-print-kdp-final` was unreadable for reasons that were architectural
accidents. It is now unread for one honest reason:

```text
381,077 code points   the Work
 60,000 code points   DEVELOPMENTAL_READ_CEILING_CODE_POINTS  (lib/manuscript/developmentalReader/contract.ts:129)
```

That reason is the subject of the next unit. It is not repaired by raising the ceiling: the ceiling
is a **per-pass** bound, not a maximum acceptable Work size.

---

## 10 · Boundary this record sets on what follows

⛔ This record establishes **reachability**, not comprehension. Nothing here shows that MAIA has read
this book, can read this book, or would read it well. It shows the reader can now be reached by it
and correctly says the Work is larger than one pass.

⛔ This record does not authorize BUILD-07G. It removes 07G's precondition. Opening is a separate
founder act with its own dated entry in the lane.

⛔ Nothing from `WS2-DOCUMENT-TOPOLOGY-AND-INGEST-INTELLIGENCE-01` is unparked by this record. One
constraint crosses, and it was already recorded there before this chain closed:

```ts
scope_target =
  | { kind: 'structure_unit', unitId }
  | { kind: 'section_range', sectionIds[] }
  | { kind: 'whole_work' }
```

---

## 11 · Reproduction

```bash
# read the running subject first; do not assume short or full
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'

# bind the witness to exactly what it printed
docker exec -e EXPECT_SHA='<that exact string>' maia-sovereign \
  sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/witness/ws2-develop-preparation-witness.ts \
         --after --expect-sha "$EXPECT_SHA"'
```

Default mode is read-only preflight. `--apply` is announced and founder-only. Subject drift exits
`INVALID` (exit 3) — neither pass nor fail.
