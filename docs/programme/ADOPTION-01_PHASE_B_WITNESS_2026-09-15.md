# ADOPTION-01 · PHASE B — THE FIVE WITNESSES, SPENT

**Candidate** `claude/adoption-01-integration` — new canonical `212f417da`
(carrying `EDITORIAL-WRITE-CARRY-COMPLETION-01`) **+** Phase B `439ff475f`.

⛔ No merge · ⛔ no deploy · ⛔ no migration · ⛔ no schema change.

> **The acceptance law under test:** Adoption means the member explicitly names
> a version and permits it to change the Work. The server determines where that
> change belongs and whether it is still safe to execute. The surface reports
> the result without collapsing permission, execution, or refusal into one false
> story.

---

## 0 · RESULT

```
behavioural witness   56 passed · 0 failed     A · B · C · D · E1 · E2
source obligations    25 passed · 0 failed
instrument falsified  4 mutants, 4 dead        ⭐ including the head-resolution one
ship typecheck gate   229 vs baseline 239 · 0 regressions
ship program          ⭐ now contains all five revisionAuthorization files
                         AND sections/saveSection.ts
```

⚠️ **AND ONE OBSERVATION THAT IS NOT A PASS.** Leg F establishes that adoption
is currently **impossible for any section that carries a heading**, and that the
member would be told a falsehood about her own writing. §4. ⛔ Reported, not
repaired.

---

## 1 · THE WITNESS IS REAL, AND THE RACES ARE REAL

Real Next server · real PostgreSQL 16 on a disposable cluster (database name
contains `witness`; 451 of 487 canonical migrations applied, 36 refused on
absent extensions/predecessors) · every leg driven through the **actual HTTP
route**. ⛔ No mocked substrate, ⛔ no stubbed fit, ⛔ no direct call standing in
for the gesture.

⭐⭐ **Legs C and E2 need the Work — or a competing execution — to move BETWEEN
the authorizing act and the executing act, which is a window inside one HTTP
request.** They are made deterministic by holding the authorization row's lock
on a separate connection, because `executeAuthorization` locks
authorization → draft in that order while `authorizeVersion` reads the
authorization row **without** `FOR UPDATE`. An adoption request therefore passes
authorization and parks exactly at the execution boundary.

⛔ **No sleep is used as evidence.** The witness waits on `pg_stat_activity`
until the expected number of backends is actually blocked on a lock.

---

## 2 · THE FIVE LEGS

### A · EXACT-VERSION AUTHORITY — 6/6

Lineage `v1 MAIA · v2 MAIA · v3 Kelly · v4 Kelly (head)`. The member names **v2**.

```
A1 the gesture is applied
A2 ⭐ the manuscript carries the CHOSEN version
A3 ⛔ the HEAD version did not land
A4 ⛔ no other version landed either
A5 the durable permission names the chosen version
A6 ⛔ no permission was minted for the head
```

### B · SUCCESSFUL ADOPTION — 15/15

⭐⭐ **B5 is the discriminator, and the fixture was built to make it one.** The
chain's historical base is `revision_count = 1`; the Work's version is `41`.
Equal values would have hidden the difference — which is the exact trap the
contract's own header names.

```
B1  the chain was DERIVED from the owned thread (never sent)
B4  the chain's historical base is 1
B5  ⭐⭐ the binding's base was MINTED from the Work it read, not copied  → 41
B6  the expected text is the writer's own wording, server-read
B8  the receipt is whole · resultingVersion 42
B9  the receipt is whole · acceptedAt present
B10 the manuscript advanced exactly once
B11 ⛔ the other section was not touched
B12 the compatibility content was DERIVED
B13 the response reports the permission as established
B14 the response says THIS gesture performed the write
B15 the status code does not disguise the outcome
```

### C · WORK MOVED — 11/11

A permission is pre-established (said out loud in the source: the witness needs
a row it can lock **before** the gesture runs; the gesture itself still goes
through the route). The request parks at the execution boundary; a **legitimate
save through the ordinary section writer** moves the Work by editing the *other*
section, so the target's wording is untouched; the lock releases.

```
C1  the gesture passed authorization and parked at the execution boundary
C2  the Work legitimately moved
C3  ⭐⭐ the outcome is a MANUSCRIPT fact, not a system failure   → work_moved
C4  the reason is the stale base
C5  ⭐ the permission still exists and says so
C6  the target passage was NOT changed
C7  the draft moved only by the writer's own save
C8  ⛔ work_moved is not reported as an error                     → 200
C9  ⭐ the gesture RECOVERED the existing permission — one row, not two
C10 and it is the same durable permission
C11 the permission is unspent
```

### D · RECOVERY / NATURAL IDENTITY — 11/11

⭐ **The contract, not the sketch.** Same legitimate base → recover. New
legitimate base → mint for the newly read state, and the stale permission may
not dominate it.

```
D1  same legitimate base → the existing permission is recovered   (C9–C11)
D3  ⭐ a second permission exists, for the newly read Work
D4  the bases are the two Work states that were read              → 41,42
D5  ⛔ the stale permission did not dominate — it is still unspent
D6  the new permission is the one that was spent
D7  the identities are different
D9  ⛔ a caller idempotency token is REFUSED                       → 400
D10 and it is NAMED rather than ignored
D11 ⛔ a caller baseVersion is REFUSED and named
```

### E1 · SYSTEM REFUSAL — 6/6

A draft that is not section-addressable. `authorizeVersion` does not ask — the
section writer does — so **authorization succeeds and execution refuses**, which
is precisely the authorize-then-refuse shape.

```
E1a ⛔ SYSTEM language, not a claim about the book   → system_refusal
E1b the reason is the writer refusing, named exactly → write_refused
E1c ⭐ the permission WAS established and says so
E1d the manuscript is unchanged
E1e the draft did not advance
E1f a system refusal is visible to operations        → 409
```

### E2 · ALREADY APPLIED — 7/7

⭐⭐ **Two real gestures**, both recovering the same permission, both parked at
the execution boundary, released together.

```
E2a both gestures parked at the execution boundary
E2b both gestures report APPLIED — the version IS in the manuscript
E2c ⭐⭐ exactly ONE says it performed the write      → false,true
E2d the manuscript advanced exactly once
E2e the manuscript carries the chosen version
E2f one permission, spent once
E2g ⛔ nothing was written twice
```

⭐ The member-facing sentence for the loser is *"This version was already
adopted into …"* — ⛔ never *"Adopted"* alone and ⛔ never *"Nothing was
changed"*, because in this outcome the second is false and the first is
misleading.

---

## 3 · ⭐ THE INSTRUMENTS ARE FALSIFIED

⛔ An instrument that passes on everything proves nothing. Four mutants, each
restored **byte-identical** afterwards (copy-aside, never `git checkout --`).

| mutant | what it does | dies on |
|---|---|---|
| **MU-A** | the seam resolves the succession **head** instead of the named version | ⭐⭐ **behavioural A2 · A3 · A4 · A5 · A6** — and statically on S1 · S2 |
| MU-S1 | the route accepts a caller `idempotencyKey` | S5 |
| MU-S2 | a catch-all `default:` in a classification table | S14 |
| MU-S3 | the gesture sends `view.headVersionId` | S15 · S16 |

⭐⭐ **MU-A discharges the ruling's sharpest requirement in the ruling's own
words:** *"Any implementation that silently resolves v4 because it is newest
should die under the witness."* It does — five assertions, behaviourally, on a
real manuscript.

**Source obligations — 25/25**, every scan **stripping comments first**. The
subjects document their own prohibitions in prose, and a raw-source scanner
fails a file precisely because it states its compliance — the C21 class, met
eight times in this programme.

```
S1–S4   ⛔ no ORDER BY · no LIMIT · no head/latest/newest, in seam or route
S5–S6   the body is CLOSED to exactly threadId + versionId; ⛔ no baseVersion,
        expectedText, idempotencyKey, range or authorizationId is ever read
S7–S8   ⛔ no caller chainId — derived in SQL from an owned thread
S9–S12  ⛔ the seam writes nothing, re-implements no fit, calls the two acts in
        order, and never retries
S13–S14 ⛔⛔ both classification tables are exhaustive with NO `default:`
S15–S19 the gesture sends two ids from the FROZEN target; ⛔ the browser never
        searches the manuscript and never constructs a range
S20–S21 the receipt is still whole-or-absent BY TYPE; ChangeLocator is still
        server-derived with a required coordinate space
```

### ⭐ The carry incident's new obligation, discharged

`tsc -p tsconfig.ship.json --listFiles` on this candidate contains:

```
lib/manuscript/sections/saveSection.ts
lib/manuscript/revisionAuthorization/contract.ts
lib/manuscript/revisionAuthorization/store.ts
lib/manuscript/revisionAuthorization/executionFit.ts
lib/manuscript/revisionAuthorization/execute.ts
lib/manuscript/revisionAuthorization/status.ts
```

⭐ The primary gate now compiles the substrate Adoption invokes. ⚠️ The
`tsconfig.ship.json` manuscript **exclusion** remains a separate unrepaired
finding — this candidate covers the path because its route reaches it, ⛔ not
because the config was changed.

---

## 4 · ⚠️⚠️ LEG F — ADOPTION IS IMPOSSIBLE ON A HEADED SECTION

⛔ **NOT A PASS AND NOT A REPAIR.** Every leg above used a heading-less section.
A witness that only tests the easy shape reports on itself, so leg F opens a
relationship on a section that carries a heading and observes what canonical
does.

```
OBSERVED  kind=work_moved  reason=expected_text_absent  permission=false  status=200
OBSERVED  section text unchanged: true
OBSERVED  chain expected_text starts with the heading: true
```

### The mechanism

`openEditorialRelationship` freezes the chain's `expectedText` from
`manuscript_draft_sections.text` — the **STORED** representation, heading prefix
included. Every fit check — `resolveGuard`, `evaluateExecutionFit`,
`applyExactlyOnce` — compares against `splitStoredSection(...).body`, the
**PROJECTED** body with the prefix removed.

```
chain.expectedText   "Chapter Ten\n\nThe spiral is not a circle, …"
body at the target   "The spiral is not a circle, …"
occurrences(body, expectedText) = 0   →   expected_text_absent
```

With `heading = NULL` the two coincide, which is why every other leg works.

### ⭐⭐ Why this is worse than a blocked feature

The refusal is classified **`work_moved`**, so the member-facing sentence is:

> *You've written here since this version was made. Nothing was changed.*

**That is false.** She wrote nothing. The one outcome family whose whole purpose
is to state a true fact about her manuscript would be stating an untruth about
her own writing — and it would do so for every headed section, which is most of
a real manuscript, Chapter 10 included.

⛔ **Not repaired here.** The defect is in `openEditorialRelationship`
(WS-EDITORIAL-UI-01 territory) and fixing it changes what a chain's locus
*means* — historical provenance of a passage. That is not ADOPTION-01's to
decide, and the classification question it raises (`expected_text_absent` is not
always a manuscript fact) belongs with it.

⚠️ **Consequence for this candidate:** legs A–E are sound and the contract
behaves correctly on the sections they use, but **ADOPTION-01 is not usable on
Kelly's real manuscript until leg F's defect is ruled on.**

---

## 5 · TWO THINGS THE SUBSTRATE CAUGHT, RECORDED

Both from the carry act's probe and re-met here; in each case the substrate was
right and the fixture was wrong.

- **The draft↔section round-trip trigger is IMMEDIATE, not deferred.** ⛔ Not
  weakened — the fixture assembles the draft non-addressable, DERIVES `content`
  with `string_agg`, and declares addressability last.
- **`TRUNCATE members CASCADE` is refused by the S3 guard.** Each run brings its
  own identities instead of clearing the database.

---

## 7 · ⚠️ THREE RED ASSERTIONS — A SUPERSEDED LAW, ⛔ NOT EDITED

The suites separate cleanly. Same command, same set:

```
canonical 212f417da   4 suites failed · 16 tests failed
candidate             5 suites failed · 19 tests failed
```

⭐ **Phase B adds exactly one suite and three assertions**, all in
`app/writers-studio/__tests__/canvasEditorialMount.test.ts`. The four suites red
on canonical — `evidenceCannotAct` · `draft/route` · `draft/revisions/route` ·
`readings/route` — are **pre-existing and untouched**.

All three encode the UI-02 / UI-03 prohibition on adoption, which the Phase B
ruling **explicitly retired**: *"the ruled flow is COMPARE → ADOPT."*

| assertion | what breaks | what still holds |
|---|---|---|
| `⛔ offers no adoption, and says so` | `not.toMatch(/\bAdopt\b/)` — the gesture says "Adopt this version" | ⭐ the standing sentence *"Nothing changes until you explicitly adopt a version."* is STILL in the panel and still true; `Keep Original\|Revise` are still absent |
| `⛔ adds no server seam, and fetches no current Work` | the adopt POST lives in the compare block, and the confirmation prose contains the word *manuscript* | ⭐ comparison itself still reads only what is on screen; the gesture fetches ⛔ no manuscript, draft or sections endpoint |
| `⛔ offers no decision at all` | its headline is the retired law | ⭐ `Keep Original\|Accept\|Revise\|Apply\|Use this` are still absent; `Done comparing` is still present |

### ⭐ AMENDED, BY FOUNDER RULING

> *"UI-02/UI-03 originally prohibited adoption because adoption did not yet
> exist. `ADOPTION-01` was explicitly authorized to retire that prohibition.
> Therefore assertions whose only law is 'no adoption decision/control may exist
> here' are now stale law, not product regressions."*

⛔ **The record says plainly that the LAW CHANGED BY FOUNDER RULING** — ⛔ it
does not pretend those assertions were always wrong. Each was right for the law
that existed. Each is narrowed in place, with its supersession written into the
file beside it, and every surviving clause kept:

```
1  ⭐ offers adoption as ONE explicit gesture, and nothing else
   kept: the standing sentence (still TRUE) · ⛔ Keep Original · Revise · Use this
2  ⛔ fetches no current Work — and the gesture asks only the adoption route
   kept: the comparison JSX issues no request at all
   ⭐ stronger: the gesture makes EXACTLY ONE request, to the adoption route,
      carrying exactly { threadId, versionId } · ⛔ never a manuscript endpoint
   ⚠️ the retired clause was a VOCABULARY scan that fired on the confirmation's
      prose (*"the location the manuscript identifies"*), not on a behaviour
3  ⛔ offers exactly one decision, and it is adoption
   kept: the retired vocabulary · "Done comparing" remains dismissal
   ⭐ added: the decision acts on the FROZEN comparison target, ⛔ never the head
```

**Falsified — 3 mutants, 3 dead, panel restored byte-identical:**

```
MU-T1  the adopt gesture removed        → assertions 1 and 3 die
MU-T2  the gesture also fetches the Work → assertion 2 dies
MU-T3  the decision follows the head     → assertion 3 dies
```

⭐⭐ **AND THE SUITES NOW MATCH CANONICAL EXACTLY:**

```
canonical 212f417da   4 suites failed · 16 tests failed
candidate             4 suites failed · 16 tests failed
```

⛔ The four remaining reds are pre-existing and untouched. ⛔ No unrelated guard
was weakened to reach that number.

---

⛔⛔ **THE STANDING RULE, UNCHANGED FOR EVERYTHING ELSE.**
*Implementation fails suite → repair the implementation* is lawful;
*→ reinterpret the contract → weaken the test* is not. The one legitimate ground
for moving a guard is that the LAW moved, which is what happened here — and that
is a founder call, not this lane's.

⭐ **Proposed narrowing, for ruling — each keeps every clause that survives:**

```
1  adoption IS offered, as ONE explicit gesture
   ⛔ Keep Original · Revise · Accept · Apply · Use this remain closed
   ⭐ the standing sentence remains

2  the compare block makes EXACTLY ONE fetch, to the adoption route,
   with a body of exactly { threadId, versionId: adoptionTarget.versionId }
   ⛔ never a manuscript / draft / sections endpoint

3  the decision that exists is adoption and nothing else
   ⛔ the retired vocabulary stays absent · "Done comparing" stays present
```

---

## 6 · STANDING

```
ADOPTION-01 Phase A            ✅ CLOSED
ADOPTION-01 Phase B build      ✅ BUILT
A · exact version              ✅ 6/6      ⭐ MU-A dies here
B · success                    ✅ 15/15
C · work moved                 ✅ 11/11
D · recovery                   ✅ 11/11
E1 · system refusal            ✅ 6/6
E2 · already applied           ✅ 7/7
source obligations             ✅ 25/25
instruments falsified          ✅ 4 mutants, 4 dead
ship typecheck                 ✅ 0 regressions
WS + manuscript suites         ✅ 4/16 red — IDENTICAL to canonical, §7
obsolete prohibition           ✅ AMENDED by ruling · 3 mutants killed

leg F · headed sections        ⚠️⚠️ OPEN DEFECT · ⛔ NOT REPAIRED · ruling owed
tsconfig.ship exclusion        ⚠️ separate finding · ⛔ not repaired
production schema              ⚠️ authorization table presence UNVERIFIED

merge                          ⛔ NOT AUTHORIZED
deploy                         ⛔ NOT AUTHORIZED
production                     UNTOUCHED
```
