# House Review — Founder Queue

**Pass 1 complete. Pass 2 not begun.** Four decisions, independent, not to be bundled.

Both sides stated at equal force. No recommendation. Per the Field Study method's own
rule — *"a study that recommends is quietly legislating"* — and the charter's *futures,
no implementation until rulings are made*.

---

## Q1 — Instrument selection *(gating; blocks Pass 2)*

Two candidate instruments, materially different, neither ratified. Once the comparison
established they are not equivalent, selection became a governed decision rather than an
implementation detail.

### Option A — Preserve the environmental method's calibration rule

- First calibration: **Now What?**
- House review **waits** until calibration completes
- House then benefits from a calibrated instrument

*Optimizes for:* confidence in the instrument before broad application.
*Costs:* the House review pauses at exactly the point Pass 1 made it tractable; the
Standing Record ages against a tree already 427 commits behind.

### Option B — Treat the House charter as an independent review program

- House proceeds under **its own charter**
- The environmental method calibrates separately on **Now What?**
- The two instruments are compared again after calibration

*Optimizes for:* momentum, and a second independent calibration data point.
*Costs:* accepts that the House review is **not** conducted under the candidate
environmental method — so its findings carry none of the guarantees in §2a–§2e
(no confabulation guard, no study-ethics constraint, no build pinning, no class E).

**Not a blend.** Blending is what step 2 of the process ruling forbids.

### ✅ RULED — 2026-07-29, Kelly Nezat — **Q1 selects Option A**

> **Q1 selects Option A.** The environmental method will first be calibrated on the pinned
> merged artifact for **Now What?** before being applied to the House review. This ruling is
> based on the now-satisfied calibration precondition and the observed consequences of unpinned
> observations. **It does not diminish the stated costs of Option A, which remain accepted
> tradeoffs rather than resolved concerns.**

**The reasoning, and its stated limit** — verbatim: *"This is not because Option A became
intrinsically better today. Today's work removed the strongest practical objection to Option A —
its calibration dependency — without weakening the reasons it existed."*

**Precondition discharged before ruling.** The two artifacts named as prerequisites were read
into this queue's context first. What each established:

- **The #810 calibration ruling** — *calibrate against the merged SHA, never an evolving
  working-tree copy; "one sitting, one build" applies to the instrument too*, with three
  identities kept distinct (content fingerprint for equivalence · `b5faaf622` for review
  provenance · `ea39fe3b0` for merged artifact). Effect: Option A's calibration now has a
  **satisfiable** precondition — a pinned instrument exists on trunk as of 2026-07-29. This
  changed A's *feasibility*, not its merits.
- **Representation bound to referent** (ratified 2026-07-29) — sharpened one line in **each**
  option's cost column, symmetrically. B's "no build pinning" moved from asserted to *observed*
  (an unpinned repository trace was corrupted in a third of its findings the same day). A's
  "Standing Record ages against a stale tree" was sharpened by the same evidence; that tree
  measured **430** commits behind trunk on 2026-07-29 (this document's earlier figure, 427, is
  the same measurement taken earlier).

#### ⛔ Three exclusions — part of the ruling's meaning, not commentary

1. ⛔ Do **not** cite the mark→resurfacing trace as proof that Option A is correct.
2. ⛔ Do **not** elevate "430 commits behind" from a *measured cost* into an *argument*.
3. ⛔ Do **not** treat the improved evidence for **both** cost columns as favoring either side.
   The precondition read moved neither above the other. Costs remain deliberately accepted or
   rejected — never resolved.

**Consequence.** House review **Pass 2 does not open.** Order is now: calibrate the environmental
method on Now What? against the pinned instrument → *then* apply it to the House. Option A's
accepted cost is exactly that the House review pauses at the point Pass 1 made it tractable while
the Standing Record ages.

**Not affected by this ruling:** Q2, Q3, Q4 remain independent and unruled. Selection of the
instrument is **not** ratification of it — ratification remains earned by repeated use
(docket D8).

---

## Q2 — Preservation *(currently blocks step 1 of the process ruling)*

**Command-verified**, this working tree, 2026-07-29:

| File | On disk | Tracked | Commits on any ref |
|---|---|---|---|
| `docs/canon/THE_HOUSE.md` | yes | **no** | **0** |
| `SOULLAB_HOUSE_COHERENCE_AUDIT_2026-07-22.md` | yes | **no** | **0** |
| `HOUSE_DESTINATION_COHERENCE_AUDIT_2026-07-22.md` | yes | **no** | **0** |
| `HOUSE_NAVIGATION_AUDIT_2026-07-27.md` | yes | **no** | 1 (PR #801 branch only) |

Working tree is **427 commits behind** `origin/clean-main-no-secrets`.

### Preservation is not durability *(Kelly, 2026-07-29 — refinement, not a change)*

"Preserve" carries two readings, and only one of them is in force:

| Reading | Meaning | Status |
|---|---|---|
| **Preserve as evidence** | do not edit, merge, or silently reconcile either candidate instrument | ✅ **in force now** — satisfied |
| **Preserve as durable repository artifact** | ensure both exist in version control before selection | ⬜ **a precondition for Q1**, not an implicit authorization |

| Instrument | Preservation | Durability |
|---|---|---|
| Field Study method | ✅ | ✅ tracked, PR #810 |
| House charter + Pass 1 artifacts | ✅ | ✅ tracked, merge `d531974e2` (PR #814) |

> **Preserve both candidate instruments in their current form. If either lacks
> repository durability, record that as a precondition for instrument selection rather
> than satisfying it implicitly.**

### Three statements that are easy to collapse

> **Instrument selection presumes durable candidates.** One candidate satisfies that
> precondition; one does not.

| # | Statement | Status |
|---|---|---|
| 1 | The charter **exists** | **True** — in this working tree |
| 2 | The charter is **durably preserved** | **Not yet established** |
| 3 | The charter should **therefore be committed now** | **Does not follow** |

(3) is not implied by (1) and (2). Committing requires its own authorization. Until that
exists, *"candidate lacks repository durability"* is simply an unresolved governance fact
sitting in this queue — visible, not actionable.

"Preserve" does **not** implicitly authorize a commit. The durability gap is therefore
**recorded as a Q1 precondition**, not treated as a blocked action requiring resolution
today.

Options when Q1 is taken up: authorize a Class C docs-only commit · fold into #801 ·
rule that it waits.

---

## Q3 — #801 / #803 / #804, after the premise correction

Per R-C2 these were held as pending evidence, not ruled. One premise has since been
**command-verified as false**:

- Trunk **is** protected — required `["build","check-diagrams"]`, strict, `enforce_admins:false`
- The prior "no branch protection" finding was a **wrong-repo 404** (`SoullabTech/MAIA-SOVEREIGN` vs the real `SoullabTech/Sovereign`)
- Issue **#807** is framed entirely on the falsified premise
- Part of **#803**'s rationale inherits it, and per extraction the premise is baked into shipped source

Unchanged by the correction: `deploy.yml`/`mobile-deploy.yml` trigger on `branches: [main]`
while trunk is `clean-main-no-secrets`, so they never fire.

**Not ruled here.** Flagged only so the PRs are not reviewed against a premise now known false.

---

## Q4 — Charter §9: sitting vs. lane

R-C3 ruled **a sitting** — bounded, no authority to mutate, complete on delivery of the
reconciliation package and founder queue.

Charter §8 requires an artifact (*AIN Design Grammar*) that can only exist after **ten**
reviews, built from tags accumulated across all of them. That is institutional memory,
which is lane-shaped.

Proposed reconciliation, **unruled**: *the sitting is the unit of work; the program is
the ledger* — each review a bounded no-build sitting that closes; the program keeping a
running tag register across sittings but holding **no authority to mutate anything**,
which is the property R-C3 actually refused.

If that is right, R-C3 stands and §8 is compatible. If the program should be resumable
**and** authorized to act, R-C3 needs revisiting.

---

## Status

| | |
|---|---|
| Pass 1 | **complete** — `HOUSE_00_STANDING_RECORD.md` (1,221 lines, 202 rows, 350 IDs verified) |
| Provenance | `HOUSE_00_PROVENANCE.md` — 7 Observed · rest Reported · 1 Retracted |
| Comparison | `HOUSE_00_INSTRUMENT_COMPARISON.md` — evidence, not merger |
| Pass 2 | **not begun** — blocked on Q1 |
| Charter defects §2a–2e | **recorded, unrepaired** — repair would constitute the forbidden merger |

---

## The sitting's durable observation

Three compartments, kept separate — evidence, interpretation, constitutional
significance:

**OBSERVED** — independent governance artifacts emerged before a governance relationship
between them had been established. True at **both** levels:

- *the review program* — two candidate instruments authored the same day by different
  lanes, neither aware of the other, both unratified
- *the House review corpus* — 41 shipped behaviours citing no founder decision, 34 of
  them exercising constitutional authority

**HYPOTHESIS** — that the same structural dynamic exists **across governance levels**.

**CONCLUSION** — **deferred pending additional sittings.** One sitting cannot distinguish
recurrence from coincidence. Per the charter's own rule, a Constitutional Candidate
tagged *Hypothesis* may not enter the canon process.

> *"The discipline is strongest when it lets that remain unresolved until more evidence
> exists."* — Kelly, 2026-07-29

Recorded at its own evidence class. Not promoted.

---

## What this queue has, and has not, taken in

> **A ratified rule elsewhere is not automatically part of this queue.** Its relevance is
> an observation until this queue deliberately reads and adopts it — otherwise the queue
> inherits decisions **by proximity rather than by an explicit act.**

**Existence · relevance · adoption are distinct.**

| Category | Contents |
|---|---|
| **Established within this sitting** | the observation · the hypothesis · the deferred conclusion · open Q1–Q4 |
| **Known to exist elsewhere** | the #810 calibration ruling (*Now What? calibrates against #810's **merged SHA**, not a working-tree copy*) · the ratified methodology entry *representation bound to referent* |
| **NOT yet incorporated** | both of the above — **not read, not evaluated in this queue's context** |

⚠️ A principle this sitting arrived at independently — *a summary does not upgrade a
finding's evidence class* — appears to have been ratified elsewhere the same day under
different words. **Independent convergence is informative; it does not substitute for
reading the governing artifact.**

**If Q1 is opened, consult those artifacts first.** Do not treat this sitting's
formulation as current until that reading has happened.

---

## Closing

The sitting had **two products** — one stated, one not:

| | |
|---|---|
| **Explicit** | the House reconciliation |
| **Implicit** | a discipline for governing **synthesis itself** |

The second acquired its own structure by the end: observation and synthesis became
separate evidence-bearing acts · provenance and evidence class became orthogonal ·
representation was repeatedly rebound to its referent · synthesis acquired review points
rather than being treated as a transparent conduit.

> **This sitting completed its stated work. In doing so, it also produced a candidate
> discipline for governing synthesis. Whether that discipline becomes foundational is a
> question for future evidence, not this record.**
> — Kelly, 2026-07-29

---

*Nothing in this queue authorizes a build, selects an instrument, or rules a PR.*
*No additional act follows from today's observations alone.*
*Any continuation begins as a new governed act, not an implicit extension of this one.*
