# WS2-07 · BUILD-07F — production acceptance walk · SPEC

> **The W1–W12 claims were fixed BEFORE deployment, and that is the point of the document: a walk
> whose claims are written while it is being walked can only confirm what it finds. This revision
> does not restate them — it retargets custody and evidence after a promotion that has already
> occurred (runbook §0). The walk itself has NOT started, and W3 onward is gated on the founder's
> prospective act (runbook §2.2).**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
FROZEN EXECUTABLE ANCHOR   66da58b4c4a4979240db460c045dd9daf1cd47d3
OBSERVED RUNTIME SHA       50302f5d9 — read from the deployed container 2026-09-06, FIXED for
                           the walk's duration (§2.1)
CUSTODY (§2.1)             SATISFIED 2026-09-06, founder-run ON THE DEPLOY HOST:
                             ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN &&
                               git merge-base --is-ancestor 66da58b4c 50302f5d9;
                               printf "ancestor_exit=%s\n" "$?"'
                             → ancestor_exit=0
                           The host-side run is what the rule requires: merge-base resolved both
                           commits in minisforum's OWN checkout, so the frozen anchor and the
                           observed runtime lie in one lineage on the machine that runs the
                           program. An equivalent exit 0 computed elsewhere is a true statement
                           about the commit graph and was NOT accepted as closing this part.
07F MIGRATION    APPLIED 2026-09-06 11:36:34+00 — before its consent checkpoint (runbook §0)
STANDING EVENTS  0 at the time of writing — the boundary this walk crosses at W3
GATED ON         the founder's prospective act, runbook §2.2 — GIVEN 2026-09-06
RUNS AFTER       #1228's own witness (runbook §6.2) — a separate record, not a step of this walk
STATE            W1 CLOSED — all parts evidenced on production 2026-09-06. §2.2 act GIVEN.
                 W2 is the next step; W3 is the first irreversible one.
                   W1(a) custody    PASS — deploy-host ancestor_exit=0 (see CUSTODY above)
                   pre-walk count   developmental_observation_standing_events = 0
                   W1(b) schema     PASS — migration filename present; events table with its
                                    UNIQUE quad (member_id, reading_id, observation_key,
                                    event_index) and both triggers (dose_no_update_check,
                                    dose_no_single_delete_check); developmental_readings carrying
                                    BOTH developmental_readings_immutable_check AND
                                    developmental_readings_no_orphan_delete_check (a third,
                                    developmental_readings_observations, is 07C's observation
                                    validator — expected, not a finding).
                                    FKs: reading_id → developmental_readings ON DELETE CASCADE
                                    (paired with no_orphan_delete_check — the integrity path §4
                                    forbids "cleaning up"); member_id → members ON DELETE RESTRICT.
                   W2               PASS 2026-09-06 — both planes (see SUBJECT READING below)
                   W3               FAIL on the ORIGINAL wording · PASS on the CORRECTED
                                    criterion (see W3 INSTRUMENT CORRECTION below)
                   W4               PASS 2026-09-06 — survived a genuine hard reload
                   W5               PASS 2026-09-06 — the first act is unchanged, the second
                                    appended (see W4/W5 EVIDENCE below)
                   W6               PASS 2026-09-06 — the repeat wrote nothing
                   W7               NOT EXERCISED CLEANLY — attempt 1 INCONCLUSIVE, retry NOT
                                    EXECUTED (the "stale" window was on the wrong reading).
                                    CONCURRENCY GUARD UNPROVEN, NOT FAILED. STOPPED 2026-09-06.
                   FINDING F-CTX    Develop reading-context ambiguity — a member can make a
                                    durable standing act on a different reading than intended.
                                    PRODUCT FINDING, not operator error. Gates the standing
                                    surface out of the pilot boundary.
                 W3 is the first irreversible step. W1 and W2 no longer gate it; the founder's own
                 gesture in an authenticated browser is what performs it.

SUBJECT READING  R = cb589ab0-3532-433b-b52d-916d155382c8   — FIXED for W2–W12
                 manuscript   0186cd37-4124-44ce-a6d3-37286bbe816b
                              "WS2 Private Beta Smoke Manuscript 2026-09-05"
                 outcome      reading · lens structure · 7 observations (o1…o7)
                 frozen_at    2026-09-05 14:31:29.082311+00
                 reader       DEVELOPMENTAL-READER-04 · claude-opus-5
                 classifier   DEVELOPMENTAL-PHENOMENON-04
                 coverage     4 of 4 sections read in full · draft version 2
                 ⚠ SUPERSEDED AT WALK TIME — the room shows "This is what MAIA noticed then. The
                   work has moved since: the text of Section 1 · 'Arrival' has changed." This is
                   07A's three-state locate behaving correctly, NOT a defect found mid-walk, and it
                   does NOT disqualify R: expectation.canAct derives only from view.state
                   (unknown | unset | taken) and never from supersession. It STRENGTHENS W10 — a
                   superseded, standing-bearing observation must still render verbatim with its
                   "Rests on" and "Does not establish" lists intact.
                 The second existing reading d527997e-bb8a-499e-bc1c-248bcec6ee2b (6 observations)
                 is NOT W9's subject: W9 requires a reading COMMISSIONED during the walk, which
                 needs the model seam live. W1–W8 are walkable with the seam refusing.

W2 EVIDENCE      UI plane, read-only DOM inspection on the authenticated room at
                 /writers-studio/develop?m=0186cd37…&r=cb589ab0… — seven entries, each
                 data-standing-state="unset", sentence "No standing taken.", and all three
                 controls (Keep · Dismiss · Unresolved) enabled:
                   1 o1 unset "No standing taken." true,true,true
                   2 o2 unset "No standing taken." true,true,true
                   3 o3 unset "No standing taken." true,true,true
                   4 o4 unset "No standing taken." true,true,true
                   5 o5 unset "No standing taken." true,true,true
                   6 o6 unset "No standing taken." true,true,true
                   7 o7 unset "No standing taken." true,true,true
                 DB plane, read-only:
                   SELECT count(*) … WHERE reading_id = 'cb589ab0-…' → 0
                 The two planes agree, which is what W2 requires. Recorded separately because a
                 sentence reading "No standing taken." while the controls are disabled is the W2
                 contradiction; disabled controls with state="unknown" would be honest lookup
                 uncertainty and NOT a failure.

W3 INSTRUMENT CORRECTION — founder ruling, 2026-09-06. THE ORIGINAL FAILURE IS NOT ERASED.

                 WHAT HAPPENED. Two events existed for R when W3 was checked:
                   17:20:21+00   o7   keep   event_index 0
                   17:21:42+00   o1   keep   event_index 0
                 The o7 act was an incidental member click on a different observation's control
                 before the walk's o1 gesture. It is VALID, DURABLE and PRESERVED.

                 ADJUDICATION
                   PRODUCT BEHAVIOUR        PASS
                   o7 act                   VALID · DURABLE · PRESERVED
                   o1 act                   VALID · DURABLE · PRESERVED
                   W3 · original wording    FAIL — two rows exist for R
                   INSTRUMENT DEFECT        CONFIRMED — the reading-wide row count was an invalid
                                            proxy for one observation's event stream
                   CORRECTION               RATIFIED — W3/W5/W6/W7 arithmetic is scoped to
                                            reading_id = R AND observation_key = 'o1'
                   W3 · corrected criterion PASS — o1 has exactly one event:
                                            index 0 · keep · authenticated member · server stamp

                 WHY THIS IS A CORRECTION, NOT A RELAXATION. The storage model already names the
                 unit of history: the UNIQUE key is (member_id, reading_id, observation_key,
                 event_index), and each observation owns an independent sequence beginning at 0.
                 So `keep → dismiss → unresolved` at indices 0,1,2 can only coherently describe ONE
                 observation's stream. Counting every event for the whole reading was using R as a
                 proxy for that stream; the stray o7 act revealed the proxy assumption. The product
                 requirement is unchanged and unweakened.

                 OPERATIVE PREDICATE for W3/W5/W6/W7:
                   WHERE reading_id = 'cb589ab0-3532-433b-b52d-916d155382c8'
                     AND observation_key = 'o1'

                 NOT DONE, AND RULED OUT
                   ✗ deleting the o7 row — dose_no_single_delete_check refuses single-row deletes
                     by design, and the runbook forbids dropping recorded member acts to tidy up.
                     o7 is now part of the witness.
                   ✗ restarting on a fresh reading to manufacture the original arithmetic — the
                     production-wide zero-event state was legitimately spent and cannot be
                     recreated without destroying real member history, which would violate the very
                     property 07F tests. A cleaner-looking walk at the cost of a falsified history.

                 STANDING STATE AFTER W3
                   R total events    2
                   o1 stream         1 event — index 0 · keep     ← the W3 subject
                   o7 stream         1 event — index 0 · keep     ← valid incidental member act
                   member            ce284751-e457-42f6-89b6-bc07d0876682 on both rows, matching
                                     the session's [Identity] explorerId — not a client-supplied id

                 CARRIED FORWARD TO W10. The walk now has TWO independently standing-bearing
                 observations. W10's claim — that the observation is untouched by the standing —
                 is tested harder: o1 and o7 must both render verbatim and unfaded, in place, with
                 their "Rests on" and "Does not establish" lists intact and no standing history,
                 count or timestamp exposed anywhere.

W4 / W5 EVIDENCE — production, subject 50302f5d9, 2026-09-06

W4  IT SURVIVES THE RELOAD — PASS
    A genuine hard reload was performed, not a re-read of live DOM. Confirmed by a fresh
    page-load block in the console preceding the read ([apiFetch] GET …/manuscripts, MAIA
    Aetheric core activation, [Identity] explorerId ce284751…), and by a new execution
    context. The standing therefore came back FROM THE SERVER, not from React state.
      1 o1 taken "You marked this keep."      ← survived
      2 o2 unset "No standing taken."
      3 o3 unset "No standing taken."
      4 o4 unset "No standing taken."
      5 o5 unset "No standing taken."
      6 o6 unset "No standing taken."
      7 o7 taken "You marked this keep."      ← the incidental act, also durable
    Absence still renders as "No standing taken." on the five untouched observations, which is
    what W4 requires; o7 reading `taken` is correct and expected, not a regression.

W5  CHANGING A STANDING DOES NOT REWRITE THE FIRST ACT — PASS
    A BASELINE was captured BEFORE the second gesture, so "unchanged" is provable rather than
    asserted after the fact:
      baseline   id cdcf9631-c99b-4d91-96a3-322822a304e2 · index 0 · keep
                 recorded_at 2026-09-06 17:21:42.823886+00
    The member then chose Dismiss on the same o1. Result on the pinned o1 stream:
      0  keep     cdcf9631-c99b-4d91-96a3-322822a304e2  17:21:42.823886+00   IDENTICAL to baseline
      1  dismiss  51026b48-73a8-4f3f-bf4d-6ca05fd8c9f4  17:44:23.724811+00   APPENDED
    Row 0 is unchanged in id, index, standing and timestamp — not edited, not replaced.
    Current standing is the greatest index. dose_no_update_check is what makes an in-place
    rewrite impossible; W5 proves it on the deployed database rather than assuming it.
    THE PROPERTY THIS ESTABLISHES: a member changed their mind and their first act survived
    intact. That is what 07F exists to protect, and it is now witnessed on production.
```

**The subject moved twice** — `cb557b8fb` → `ccd1c50ce` when the founder adjudicated one combined
promotion, then to `66da58b4c`, which is what production actually runs. The claims below are
unchanged by either move: they were fixed before any of those SHAs was the subject. #1228's only
overlap with this unit is refusal copy for a different refusal, and the intervening
Journal/Reflections delta touches no 07F file. What changed is which runtime they will be walked
against.

> ⛔ **W3 MAY NOT BE RUN BEFORE THE §2.2 ACT.** W1 is read-only and may be run to establish state.
> W3 creates the first durable member standing act in production, and `standing_events = 0` is the
> boundary that keeps reversal available without destroying a member act. That boundary is the
> founder's to cross, and crossing it is the walk's first irreversible step — not a formality
> inside it.

---

## 1 · Evidence classes — what each witness can and cannot establish

07E's lesson, carried: local gates measure the branch program, PR CI measures the merge program, the
walk measures the deployed runtime, and **none substitutes for the next**. 07F adds a fourth:

```text
L  ephemeral laboratory   deliberately deficient variants, destructive paths, race interleavings
M  merge program (CI)     8/8 on exact head 54776ed5d
S  deployed program       07F's own gates rerun statically at 66da58b4c: 254 · 15 · 14 · typecheck
R  deployed RUNTIME       this walk — the running container, which none of the above touches
```

`S` is not `R`. The same program passing its gates on a checkout says nothing about the container
serving members; that gap is the whole reason this walk exists.

Every claim below is labelled with the class that establishes it. A claim carried by **L** is not
weaker for being carried there — it is carried there because reproducing it in **R** would require
destroying a member's Work.

Two witness kinds inside **R**, kept apart because they fail differently:

```text
[B]  BROWSER / MEMBER   what a signed-in writer sees and does in the Develop room
[D]  DATABASE / PROVENANCE   what the row, the trigger and the container report
```

A `[B]` observation is never accepted as proof of persistence, and a `[D]` row is never accepted as
proof that the member was shown the truth. Where both matter, the claim names both.

---

## 2 · Preconditions

```text
the runbook's §0 is established — migration applied, guard live, consent checkpoint crossed
the runbook's §3 reads pass on the CURRENT container — its GIT_COMMIT satisfies the §2.1
  subject-identity rule against the frozen anchor 66da58b4c, and the migration is recorded with
  the table and all three developmental_readings triggers present
standing_events re-read immediately before starting, and its value recorded whatever it is
the founder's §2.2 act GIVEN — without it, W1 only
#1228's own witness (runbook §6.2) has been run and recorded SEPARATELY, if it was not already
  completed in its own lane — it clears an obstruction this walk needs for W9, and its result is
  never counted as a 07F witness
one authenticated founder member session in a browser
at least one existing frozen developmental reading with ≥ 2 observations
  (or one commissioned during W0 — a commissioning act, not a standing act)
```

No credential is handled by the agent. Every authenticated act is performed by the founder.

---

## 2.1 · Subject identity — a CUSTODY rule, not acceptance logic

**Why this exists.** The walk was frozen against `66da58b4c`. A documentation-only merge then became
canonical and was deployed, so the container reports a different commit while running the same
program. W1 halted on that, correctly: it could not tell "the subject moved" from "the program
changed". This section gives it a way to tell — and only that.

**What it does NOT do.** The W1–W12 claims and their pass/fail criteria are unchanged by this
amendment. Nothing here makes a witness easier to pass, admits a runtime difference, or adds a
condition to any claim. It defines executable-program equivalence for **custody** only, and it can
never admit a runtime change, because **any non-document byte difference halts the walk.**

### The rule

```text
FROZEN EXECUTABLE ANCHOR   66da58b4c4a4979240db460c045dd9daf1cd47d3
OBSERVED RUNTIME SHA       whatever the container reports at W1

PASS subject identity when:
  1. runtime SHA == frozen anchor
       OR
  2. frozen anchor is an ANCESTOR of runtime SHA
       AND
     the diff across every NON-doc path is EMPTY

otherwise: HALT
```

### The proof — executable, and retained with the walk's evidence

```bash
RUNTIME_SHA=<what the container reported at W1>

git merge-base --is-ancestor 66da58b4c4a4979240db460c045dd9daf1cd47d3 "$RUNTIME_SHA"
#   exit 0 required — a runtime that does not descend from the anchor is not this subject

git diff --name-only 66da58b4c4a4979240db460c045dd9daf1cd47d3 "$RUNTIME_SHA" -- . ':(exclude)docs/**'
#   MUST print nothing
```

Both commands and their output are pasted into the walk's record. A rule whose satisfaction is
asserted rather than shown is not a rule.

**There is no allowlist beyond `docs/**`.** A single byte under `app/`, `lib/`, `database/`,
`scripts/`, configuration, package metadata, compose files, workflows, or anywhere else is a
different program and stops the walk. "It was only a comment" and "it was only a test" are not
exceptions — the filter is the path, not a judgment about the change.

*A consequence worth naming: this amendment is itself docs-only for exactly this reason. Adding even
a helper script under `scripts/` to run the proof would put a non-doc byte between the anchor and any
runtime built from it, and would halt the very walk it was meant to serve. The proof stays inline.*

### Safeguard — the subject is bound ONCE, at W1

```text
W1 passes  →  record the OBSERVED RUNTIME SHA in the walk's record
              from that point it is FIXED for the walk's duration
```

Any later deployment — **including a documentation-only one** — halts the active walk rather than
being absorbed midstream. The equivalence rule binds a subject; it does not license a moving one. A
walk whose runtime changed between W5 and W9 witnessed two programs and can speak for neither.

### The already-observed transition

```text
66da58b4c → 1116f7813        non-doc diff: EMPTY (4 files, all under docs/)
```

So `1116f7813` is **eligible** to become the observed runtime subject at W1. That is not W1 passing:
the provenance, schema and count reads still have to be run against the live container at the time,
and eligibility of a commit says nothing about the state of a database.

---

## 3 · The walk

### W1 · provenance and schema `[D]`

The runbook's §3 production-state reads, re-stated here as the walk's first witness so the walk
stands alone. Two parts, in this order:

**a · Subject identity.** Read the container's `GIT_COMMIT`, then satisfy §2.1's rule against the
frozen anchor `66da58b4c` and retain both commands' output. Record the observed runtime SHA; it is
the walk's subject from here on.

**b · Schema.** `schema_migrations` carries the 07F filename; the events table exists with its UNIQUE
quad and two triggers; `developmental_readings` carries **both**
`developmental_readings_immutable_check` and `developmental_readings_no_orphan_delete_check`.

**Fails if:** §2.1's rule is not satisfied, or any object is missing, or 07C's immutability trigger
is gone. A failure of (a) is a CUSTODY halt — the walk is retargeted or the program is different,
and which one it is has been made decidable. A failure of (b) is a finding about production.

**W1 also records the pre-walk count.** `SELECT count(*) FROM developmental_observation_standing_events`
was **0** when this spec was retargeted. If it is non-zero when the walk begins, STOP and classify
before W2: a member act exists that this lane did not author, and the walk's own arithmetic (W3's
"exactly one row", W5's "two rows", W7's "three rows") assumes it starts from zero.

### W2 · UNSET is what a writer sees before they act `[B]` + `[D]`

Open a reading whose observations have no standing. Each shows **"No standing taken."** and three
enabled controls.

`[D]` `SELECT count(*) … WHERE reading_id = R` → **0**.

**Fails if:** any observation shows a value, or the row count is non-zero, or the controls are
disabled while the lookup succeeded.

### W3 · a standing is taken, and it is an append `[B]` + `[D]`

Choose **Keep** on `o1`. The row reads *"You marked this keep."*

`[D]` exactly one event: `event_index = 0`, `standing = 'keep'`, `member_id` = the founder's id,
`reading_id` = R, `observation_key = 'o1'`, `recorded_at` server-stamped.

**Fails if:** more than one row, an index other than 0, or a `member_id` the request could have supplied.

### W4 · it survives the reload `[B]`

Hard-reload the room. `o1` still reads *keep*; every other observation still reads *No standing taken.*

**Fails if:** the standing is lost, or absence is rendered as anything other than "No standing taken."

### W5 · changing a standing does not rewrite the first act `[B]` + `[D]`

Choose **Dismiss** on the same `o1`. The row reads *dismiss*.

`[D]` **two** rows: `event_index 0 = keep` **unchanged, same `id`, same `recorded_at`**, and
`event_index 1 = dismiss`. Current is the greatest index.

**Fails if:** the first row changed in any field, or was replaced, or the count is still one.

### W6 · repeating a standing writes nothing `[B]` + `[D]`

Choose **Dismiss** again. The row still reads *dismiss*; `[D]` the count is **still two**.

**Fails if:** a third row appears — the no-op is not a no-op.

### W7 · a stale act is refused, and nothing is overwritten `[B]` + `[D]`

Two browser tabs, same member, same reading — no credential leaves the founder's hands and no token
is extracted by the agent:

```text
tab A  loads the room (holds the token for event 1)
tab B  loads the room, chooses Unresolved   → event 2 written
tab A  without reloading, chooses Keep      → REFUSED
```

Tab A must say *"This standing changed elsewhere while you were looking. Nothing was overwritten —
here it is as it now stands."* and then show **unresolved**, not keep.

`[D]` exactly **three** rows; no row with `standing = 'keep'` at index 2; the stream is
`keep → dismiss → unresolved`.

**Fails if:** tab A's write is accepted, or the row count reaches four, or tab A claims to show
current state while the refresh has not landed.

### W8 · unknown is not UNSET `[B]`

With DevTools, block **only** the `GET …/standings` request, then reload the room.

The row must read *"Your standing could not be reached. Nothing has been changed."* and **the three
controls must be disabled.** It must NOT read "No standing taken."

**Fails if:** a failed lookup renders as UNSET, or a control remains clickable while the current
standing is unknown. *(Blocking the GET is a read-path fault only; it writes nothing.)*

### W9 · a new reading starts UNSET, and the old one keeps its standing `[B]` + `[D]`

Commission a second reading of the same Work. In the **new** reading, `o1` reads *No standing taken.*
Return to the first reading: `o1` still reads *unresolved*.

`[D]` all rows still carry the **first** reading's `reading_id`; none was copied, cleared or
re-pointed.

**Fails if:** the standing appears under the new reading, or the old reading's standing changed.

### W10 · the observation is untouched by the standing `[B]`

With `o1` standing at **unresolved** — the state W7 leaves and W9 confirms — MAIA's text is verbatim
and unfaded, its position in the list is unchanged, no
strike-through, its "Rests on" and "Does not establish" lists are intact, and no history, count or
timestamp of standings is rendered anywhere.

**Fails if:** any standing-driven change to the observation, or any exposure of the stream. The
invariant is value-independent: it would fail identically for `keep`, `dismiss` or `unresolved`, and
the value is named only so the instrument is executable as written.

### W11 · MAIA does not see it `[B]`

Open the dialogue on `o1` — standing at **unresolved** — and ask a question about the observation.
Her answer must carry no awareness of the standing: no acknowledgement that it was ruled on at all,
no adjustment of tone toward it. Then ask her directly what the writer decided about it.

**Fails if:** any answer reflects the standing. *(D5 is structural — the module-graph and table-name
gates in `M`/`L` — and this witness is corroboration of the running system, not the primary proof.)*

### W12a · ownership, in the rows `[D]`

`SELECT DISTINCT member_id FROM developmental_observation_standing_events` → exactly the founder's
member id, and every row for reading R carries it.

**Fails if:** any row carries an unexpected member.

### W12b · another member cannot address this resource `[B]` · CONDITIONAL

Run **only if a second real member account already exists** — this walk does not manufacture one.

Signed in as that member, request reading R's standing resource. The correct outcome is the
existing **not-found / unauthorized** posture: a reading that is not yours is indistinguishable from
one that does not exist, and the room never renders R's observations for them at all.

> **What would be a FAILURE, not a pass:** that member being shown reading R with *"No standing
> taken."* Not-addressable and UNSET are different claims — one says *you may not ask about this*,
> the other says *you have never ruled on this* — and collapsing them is the precise confusion 07F
> exists to prevent. A second member seeing UNSET here would mean the resource answered a question
> it should have refused.

**Fails if:** any standing of the founder's is visible, **or** the refusal is rendered as UNSET.

**If no second account exists:** record W12b as NOT RUN with that reason. Member scope is carried
meanwhile by `L` (`read-is-member-scoped`, `write-is-member-scoped`, each observed RED against its
deficient variant) and by W12a. An unrun witness is recorded as unrun, never as a pass.

---

## 4 · NOT REPRODUCED IN PRODUCTION — bound to the laboratory

These claims are accepted on **L** and will **not** be walked in **R**. Reproducing them requires
destroying a member's real Work or deliberately deficient code in front of real data. Manufacturing
a production deletion witness would be the opposite of what 07F protects.

| claim | where it is established | probe |
|---|---|---|
| deleting one standing event is refused while the Work exists | **L** — ephemeral PG16 | `single-delete-refused` |
| deleting a reading is refused while its manuscript exists | **L** | `reading-delete-refused` |
| deleting the Work cascades reading → standing away | **L** | `work-cascade-permitted` (two-hop, `DELETE FROM member_manuscripts`) |
| UPDATE of a recorded event is refused at the row | **L** | `update-refused` |
| two simultaneous writers cannot both be accepted | **L** | `simultaneous-write-refused` (deterministic race) |
| `unset` / NULL cannot be stored | **L** | `standing-values-closed`, `null-standing-refused` |
| every deficient variant observed RED before its repair | **L** | 8 persistence + 6 write-boundary variants |

`15 checks · 0 failures` (persistence) and `14 checks · 0 failures` (write boundary), on the tree
that became `54776ed5d`, recorded in the implementation witness.

**W1 is what carries these into production**: the same triggers, verified present on the deployed
database by name. The laboratory establishes *what the guards do*; W1 establishes *that these guards
are there*. Neither alone is the claim.

An offer this spec explicitly declines: creating a throwaway manuscript in production to delete it.
It would witness the cascade on a Work that was never a writer's, in a database that holds writers'
work, for a claim already established where deficient variants are safe.

---

## 5 · Stop rule

Any observation that does not conform **halts the walk for classification** — runtime defect,
instrument defect, or a claim written wrongly here. Nothing is repaired mid-walk, and no later
witness is run to "see if it also fails": the walk's value is that its claims were fixed in advance,
and a walk that edits itself while running has forfeited that.

A halted walk is reported with the exact observation, the class it belongs to, and nothing else
decided.

---

## 6 · What completing this walk does and does not authorize

```text
DOES        establish that the deployed runtime behaves as the accepted design says
DOES NOT    close BUILD-07F — closure is a founder act, taken after the walk, not by it
DOES NOT    authorize BUILD-07G or 07H
DOES NOT    licence any claim beyond what the witnesses above actually observed
```

---

## Reconciliation — 2026-09-06, read-only, after a cross-session state claim

A state description reaching the walk asserted `standing_events = 0`, `§2.2 still ungiven`, and
`W3 unauthorized / unrun`, and proposed a custody re-freeze onto canonical `69f6fb7c8` with a prior
bind of `c1b0470e2`. **None of that describes this walk.** Two read-only production reads settle it:

```text
docker exec maia-sovereign printenv GIT_COMMIT     → 50302f5d9

SELECT reading_id, observation_key, event_index, standing, recorded_at
  FROM developmental_observation_standing_events ORDER BY recorded_at;

 cb589ab0-…  o7  0  keep      2026-09-06 17:20:21.218476+00
 cb589ab0-…  o1  0  keep      2026-09-06 17:21:42.823886+00
 cb589ab0-…  o1  1  dismiss   2026-09-06 17:44:23.724811+00
(3 rows)
```

**Findings.**

```text
standing_events = 0          FALSE on production — three durable acts exist, exactly as recorded
§2.2 ungiven                 FALSE — given 2026-09-06, recorded verbatim in the runbook
W3 unrun                     FALSE — exercised; original criterion FAILED, corrected criterion PASSED
prior bind c1b0470e2         NOT THIS WALK — W1 bound to 50302f5d9 by deploy-host ancestor_exit=0
nothing deleted              CONFIRMED — baseline ids and timestamps survive unchanged
```

**Ruling on the proposed re-freeze: NOT NOW, and not as described.**

`69f6fb7c8` and `c1b0470e2` are real canonical commits, but **canonical has moved without a deploy.**
Production still runs `50302f5d9`, which is what this walk is bound to, so custody is INTACT and there
is no break to repair. Rebinding the walk to a commit production is not running would break precisely
what the custody rule protects — the walk measures the DEPLOYED RUNTIME, not the branch tip. That is
the same source/runtime distinction the Develop-preparation chain was disciplined around, and it does
not weaken here because the proposal arrived as a rebind.

A re-freeze onto `69f6fb7c8` becomes correct **only once `69f6fb7c8` is deployed**. At that point the
subject genuinely moves, W1 custody is re-run against the new runtime, and continuation requires the
founder's subject-bound reaffirmation for the new subject.

**WITHDRAWN by the founder, 2026-09-06.** The re-freeze instruction was for this session and is
withdrawn: it rested on the false premise that 07F was parked with `standing_events = 0` and had
never been exercised, which the production reconciliation above disproves.

```text
production runtime    50302f5d9
walk subject          50302f5d9
custody               INTACT
canonical             69f6fb7c8
canonical deployed?   NO
re-freeze             NOT APPLICABLE
```

**Canonical advancing without production advancing does not move the acceptance subject.** The walk
follows the deployed runtime. A new freeze/rebind becomes appropriate only when production itself
changes runtime, and it then binds to the SHA ACTUALLY DEPLOYED — never prospectively to whichever
commit happens to be canonical.

No second active 07F walk is known against `c1b0470e2` or this production database, and the
withdrawn authorization is not an instruction to any other session. Should one exist, it must stop
writing standing events: this walk is in progress here, and concurrent writers would corrupt both
records' arithmetic the same way the incidental `o7` act did.

**A note on reversibility, corrected.** Every standing act in this walk — including the `unresolved`
W7 requires — is a PERMANENT member event. Lawful and intended, but not reversible. No event is to
be created merely to make a witness look cleaner.

**Repository state cannot overwrite an in-session founder act.** Canonical lagging the §2.2 act is
expected; it does not un-give it.

## W6 EVIDENCE — production, subject 50302f5d9, 2026-09-06

W6  REPEATING A STANDING WRITES NOTHING — PASS
    The member chose Dismiss on o1 a second time. The row still reads "You marked this dismiss."
    and the pinned o1 stream is still exactly two rows, both unchanged:
      0  keep     cdcf9631-c99b-4d91-96a3-322822a304e2  17:21:42.823886+00
      1  dismiss  51026b48-73a8-4f3f-bf4d-6ca05fd8c9f4  17:44:23.724811+00
    No third row. The no-op is genuinely a no-op: re-affirming a standing already held does not
    inflate a member's history with acts they did not intend.

## W7 — ATTEMPT 1 INCONCLUSIVE · one-event re-attempt authorized

```text
W7 ATTEMPT 1     INCONCLUSIVE
product defect   NOT ESTABLISHED
product pass     NOT ESTABLISHED
reason           browser-context custody cannot be reconstructed
```

**What happened.** A second context wrote `unresolved` at index 2 (17:55:04), and 44 seconds later a
`keep` was ACCEPTED at index 3 (17:55:48) on the same reading and the same observation. W7's stated
failure conditions read literally on that (write accepted, count reached four), but the finding
cannot be attributed, because two incompatible explanations fit the same evidence:

```text
(a) the keep came from a second, UNTOUCHED window   → the guard failed. A real concurrency defect.
(b) it came from the same context (or one that had
    already adopted event 2)                        → its token was current, the write was lawful,
                                                      and W7 was never actually exercised.
```

**Why it cannot be settled from the record.** The server guard is correct BY INSPECTION —
`lib/manuscript/standing/store.ts:167-192` makes the INSERT conditional on
`(SELECT id FROM cur) IS NOT DISTINCT FROM $4::uuid`, so a stale token writes zero rows and returns
`stale_expectation`. The client cannot refresh passively: the standings lookup effect depends only on
`[manuscriptId, selectedId]` — no focus listener, no visibilitychange, no polling. But NOTHING LOGS
THE TOKEN: neither the standings route nor the store emits any `console.*`, so `expectedCurrentEventId`
was never recorded anywhere. The row's existence proves only that the write was accepted, and the UI
showed acceptance rather than the conflict sentence — which is true under BOTH branches.

A cross-reading explanation was raised and ELIMINATED by the timeline: the `d527997e / o1 / keep`
event is at 17:58:48, three minutes AFTER the disputed write, and is a separate incidental member act
(like `o7`) that stays outside W7 entirely.

**RULING (founder, 2026-09-06): not certain → run the one-event re-attempt.** Neither a product
defect nor a product pass is established by attempt 1.

**RE-ATTEMPT — arithmetic amended, invariant unchanged.**

The original concrete arithmetic `keep → dismiss → unresolved` at indices 0,1,2 became UNUSABLE
because attempt 1 added legitimate history. That history is not removable and is not to be removed.
**The invariant under test has not changed:** *a writer holding an old event token may not append
over a newer standing.* Only the concrete standings differ.

```text
R / o1 at re-attempt        0 keep · 1 dismiss · 2 unresolved · 3 keep  ← current

window 1   open R, select o1, verify it reads keep, then LEAVE IT UNTOUCHED (token = event 3)
window 2   a separate NORMAL window (not a tab; NOT Incognito — different auth context),
           same R / o1, click Dismiss once → writes index 4. ONE permanent event.
window 1   without reload, navigation or any intervening interaction, click Unresolved once
           → MUST BE REFUSED, then show dismiss as current

CLASSIFICATION
  index 4 dismiss + stale Unresolved refused   → W7 PASS
  index 5 unresolved appears                   → W7 FAIL · real concurrency defect
```

Refusals write nothing, so the whole test costs exactly ONE permanent event. Starting fresh on `o2`
would have cost three before the test began, and would have moved off the pinned observation.

**Consequence if (a) proves true.** 07F is not closed with a known stale-writer acceptance defect.
The standing/decision feature would need fixing first or would sit outside any pilot boundary: the
defect would live exactly where two browser contexts can silently disagree about a writer's explicit
decision, which is the one thing this unit exists to prevent.

---

## W7 STOPPED · FINDING F-CTX — Develop reading-context ambiguity

**Founder ruling, 2026-09-06: stop W7. No further standing button is to be clicked; every Develop
window closed; the database preserved exactly as it stands.**

```text
W7 ATTEMPT 1       INCONCLUSIVE — browser-context identity not proven
W7 RETRY           NOT EXECUTED — the "stale" window was on the wrong reading
CONCURRENCY GUARD  UNPROVEN, not failed
W7 concurrency defect   NOT ESTABLISHED
W7 pass                 NOT ESTABLISHED
```

```text
R / o1 stream as it stands — PRESERVED, not to be altered
  0  keep        17:21:42.823886+00
  1  dismiss     17:44:23.724811+00
  2  unresolved  17:55:04.385572+00
  3  keep        17:55:48.794477+00
  4  dismiss     18:03:38.138045+00   ← current
```

**Wrong-reading acts are REAL, DURABLE, and PRESERVED.** During the walk, standing acts were made on
`d527997e-bb8a-499e-bc1c-248bcec6ee2b` — a different reading of the same Work — while the operator
believed they were acting on `R`. Confirmed: `d527997e / o1 / 0 / keep / 17:58:48.616471+00`. Further
acts on that reading were observed in the surface after that census and are not yet enumerated; a
read-only census of the full table is OUTSTANDING and should be taken before this record is closed.
None of these are to be deleted.

### The finding, stated at product level

> **A member can make a permanent authorial decision on a different reading than the one they believe
> they are looking at.**

Mechanism, as observed:

```text
· the Work has two readings whose list entries are visually near-identical
· selecting one rewrites ?r= IN PLACE via history.replaceState — silent, no navigation
· the standing controls are identical on both, and both render the same three buttons
· nothing in the standing block names which reading it belongs to
```

The two readings are distinguishable only by details a member has no reason to be tracking:

```text
R                  Sep 5, 10:31 AM · 7 observations · o1 = MOVEMENT   · Superseded
NOT R (d527997e)   Sep 5, 12:53 PM · 6 observations · o1 = RECURRENCE · Current
```

⛔ **This is NOT test-operator confusion, and must not be recorded as such.** The walk's operator was
attending closely, had the identity in hand, and still made durable acts on the wrong reading more
than once. A writer with less context would fare worse. **It is a human-factors hazard on the exact
surface where a permanent authorial decision is recorded** — which is the one place this unit exists
to make trustworthy.

### Consequence for the pilot boundary

```text
STANDING / DECISION SURFACE   NOT EXPOSED to testers until the context problem is fixed or made
                              unmistakable
REST OF WRITER'S STUDIO       may still be piloted on its own merits
```

The rest of the room's behaviour was not implicated: W1–W6 passed, the append-only guarantees held on
production, and the observation content was never touched. What is gated is the standing interaction
specifically.

### Instrument change required BEFORE W7 resumes

The retry procedure used here was unsound, and the record should say why rather than blame its
execution: **it relied on "the untouched window" — an assumption about operator memory — instead of
requiring a positive identity proof inside each window before every irreversible click.** A test whose
validity depends on recalling which window is which is not an instrument.

When W7 resumes, each window must independently prove, on screen, before any click:

```text
READING   Sep 5 10:31 AM
          7 observations
O1        MOVEMENT
          SUPERSEDED
R =       cb589ab0-3532-433b-b52d-916d155382c8
```

and no irreversible click until BOTH windows have shown it. Close every Develop window first.

### Entry point for the next session — founder framing, 2026-09-06

**Do NOT restart from W7.** Restart from the launch question — SHARPENED by the founder in the same
exchange, and it is the sharpened form that governs:

> *Can a NON-FOUNDER writer safely complete the bounded pilot journey on production?*

```text
signup → identity → Work → Write → save → return → Structure → Develop → dialogue
                                                              standing UNAVAILABLE
```

⛔ **"Non-founder" is the load-bearing word.** The founder can complete the journey with an account
that already exists, a passkey they know, and browser state warm for months. A tester starts at
`/begin` with none of that. The onboarding chain
(`/begin → /intro-maia → /intro-daimon → /test-elemental → /faq → /onboarding → /maia`) has never
been walked on `50302f5d9` by anyone else, and it is the leg where a failure ends the pilot before
Writer's Studio is reached at all.

A clean pass gives a credible go/no-go decision rather than another development loop.

```text
07F runtime            50302f5d9
W1–W6                  PASS
W7                     NOT CLEANLY EXERCISED
concurrency guard      UNPROVEN
F-CTX                  OPEN product finding
BUILD-07F              NOT CLOSED

standing / decisions   EXCLUDED from pilot
remaining Studio       ELIGIBLE for bounded pilot preflight
database               PRESERVE AS-IS
standing-table census  bookkeeping / evidence recovery — NOT a prerequisite to having stopped safely
```

This keeps tonight's finding from swallowing the whole Writer's Studio beta while still respecting
what it actually told us: one surface has a demonstrated human-factors hazard; the rest of the room
was not implicated and its guarantees held on production.
