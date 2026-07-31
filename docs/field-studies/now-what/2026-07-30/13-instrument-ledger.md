# Instrument Ledger — Now What? calibration — 2026-07-30

**Purpose:** evidence for Q1 / docket D1 (review-instrument selection). This ledger records
what the *instrument* enabled, obscured, or failed to capture. It is deliberately kept
separate from the product ledger and the governance ledger.

⛔ **This ledger does not amend `FIELD_STUDY_METHOD_CANDIDATE_2026-07-29.md`.** Per the
standing ruling, revisions are grounded in observed failure and recorded in the calibration
report, never pre-emptively written back into the method document.

---

## I-1 · No field for the merged-artifact identity

*Known gap, reproduced under use.* The declaration scaffold represents instrument
fingerprint and instrument last-commit, but has no field for the **merged artifact**
(`ea39fe3b0`) that carries authority on trunk.

**Severity:** moderate — produces incompleteness.

## I-2 · Instrument SHA auto-stamped to superseded provenance

Scaffold stamped `Instrument last commit: 5a1e7e396` — a commit that was **rebased away**
and is recorded as *superseded provenance, never a declaration target*. Correct review
provenance is `b5faaf622`.

⭐ **Simultaneously, the fingerprint `84dde085c5d8` was correct** — verified byte-identical
at `b5faaf622`, at `ea39fe3b0`, and in the working tree. A live demonstration of the durable
rule: *the fingerprint establishes instrument equivalence; the SHA establishes review
provenance.* The fingerprint held while the SHA misreported.

## I-3 · The three-identities problem recurs on the observed-build side

Not instrument-specific. The **observed build** also carries three identities:

| Object | Establishes |
|---|---|
| Deployed instance | What members can actually encounter |
| Clean checkout | What code produced that instance |
| Content fingerprint | Whether the examined artifact is equivalent |

The scaffold represents only the last two, and collapses the first into the second. This
generalizes I-1 from a one-off omission into a **structural property of the declaration
schema**.

## I-4 · ⭐⭐ Defect class: false completeness, not incompleteness

The scaffold did not leave the observed build blank. It **auto-stamped a wrong value**:
`6f0e6d6c8` on a dirty feature branch, **987 lines behind production across 6 files**,
missing `lib/nowWhat/invitation.ts`, `lib/nowWhat/rooms.ts`, `app/now-what/arrive/page.tsx`,
and 431 lines of tests — with `app/now-what/arrive/` present only as an untracked local
draft.

> **A missing field produces incompleteness. An incorrect automatic value produces false
> completeness.** The latter carries higher severity, because a conscientious observer may
> trust it *precisely because it looks resolved.*

**Severity:** high — this defect alone would have invalidated the sitting, in the same class
as the `soullab-landing` invalidation. It was caught by the method's own
*"'fixed on trunk' is not 'live in production'"* clause, not by the harness.

## I-5 · ⭐⭐⭐ The method has no instrument for locating governing rationale

**The strongest finding of the sitting.** Two independent product hypotheses were formed
from rendered-surface observation and **both inverted** once the governing rationale was
located in source:

| Hypothesis from the walk | Rationale found in implementation | Standing of that rationale | Outcome |
|---|---|---|---|
| `/arrive` greets a stranger as a returner | `lib/nowWhat/invitation.ts:71–85` — non-disclosure; *"the copy must not become a probe for which contexts are authorized"* | ✅ **Established** — cites *Kelly ruling 2026-07-29, F1 Option A*; ruling brief exists: `docs/fields/larry/NOW_WHAT_F1_GATE_BOUNDARY_RULING_BRIEF_2026-07-29.md` | **Inverted on rationale** |
| The newcomer landing exists but nothing routes to it | `lib/nowWhat/rooms.ts:28` — *"zero inbound links by design"*; *"2026-07-08 room-as-entry decision"* | ❌ **NOT established** — no founder ruling artifact locatable for the 07-08 decision | **Rationale insufficient** |

This environment **carries its constitutional rationale in source comments at the site of
implementation.** The method's instruments (§V) are walk- and structure-based; none of them
is *"locate the governing rationale before classifying a finding"* — and, critically, none
establishes whether located rationale has **standing**.

## I-5b · ⭐⭐⭐ The standing test falsified one of the two inversions

Applying Kelly's *Rationale insufficient* category (proposed 2026-07-30) to this ledger's own
conclusions **immediately reclassified inversion 2**.

`/now-what/welcome`'s orphaning is a real and deliberate implementation decision. But
**"by design" is not "by ruling."** No founder ruling artifact governs the 2026-07-08
room-as-entry decision. The source comment explains intent while carrying no standing, and
this ledger initially accepted it as governing authority.

⭐ **The failure mode the category was invented to catch had already occurred in the ledger
that discovered the need for the category.** Recorded, not smoothed.

⭐⭐ **Cross-instrument convergence:** the prior Larry experience audit reached the same place
by a different instrument —
`docs/fields/larry/experience-audit-2026-07-28/02_SURFACE_AND_NAVIGATION.md:468`:
*"Q6 appears never to have been ruled. The 07-08 room-as-entry decision predates…"*

Per §VII-b, cross-instrument convergence is **strong** evidence where single-instrument
recurrence is weak. Two instruments, independently, found an unruled decision governing the
default arrival path. This finding is **not novel to this sitting** and must not be reported
as such.

**Disposition:** the newcomer-routing observation does **not** invert. It converges with an
existing open founder question (Q6) and is carried to the founder-question queue, not the
correction queue.

**Consequence for instrument selection:** an instrument that walks without reading will
manufacture corrections at a high rate, and each false correction proposes reopening a
decision a founder already ruled. In this codebase that failure mode is not rare — it was
the *default* outcome on both attempts.

**Proposed revision (recorded, NOT applied):** a rationale-location step preceding
classification, and a finding status of *"inverted on rationale"* distinct from *confirmed*
and *retracted*.

## I-6 · "Unknown — requires a human walk" is three results wearing one label

Contributed by Kelly, 2026-07-30. The method treats it as a single result type. It is three:

- a gap in the **product**,
- a gap in the **instrument**,
- a **correctly-drawn evidence boundary** (governance).

Only the third is a success. The method currently cannot distinguish them, so a
correctly-preserved authorization boundary reads identically to a coverage failure.

⭐ **Corollary (Kelly):** *Unavailable due to an appropriately preserved authorization
boundary is not a product defect.* It belongs in the governance ledger — and becomes a
product observation only if the environment fails to explain the boundary honestly.

## I-7 · Falsification capacity — a positive result

The instrument **overturned its own first impressions twice**, on located evidence, before
any of it reached a report. Recorded as evidence *for* the method: an instrument that can
falsify its own hypotheses mid-sitting is doing constitutional work. I-5 is the cost of that
capacity; I-7 is the capacity itself. They are the same property observed from two sides.

---

## I-9 · No procedure for paged surfaces

`/pitch` is a slideshow; `innerText` rendered 120 words — one slide. The visual-gravity
instrument assumes a static page. A single measurement of a paged surface is one frame, and
nothing in the method says so.

## I-10 · `--verify` cannot parse a hand-corrected declaration

Close report returned `declared : / tree ` — **empty**. The verifier greps the auto-stamped
`Commit:` / `Working-tree fingerprint:` fields; correcting them (which I-4 made *mandatory*)
breaks it.

> **The integrity check only works if you accept the auto-stamped values it got wrong.**

## I-11 · ⭐⭐⭐ `--verify` cannot detect divergence of a production referent

**The most consequential instrument finding of the sitting.**

The close report said *"DIVERGED — the product changed during the sitting."* That verdict was
**right by accident and wrong in substance**: it fingerprinted the **local checkout**, which
was never the observed build.

Meanwhile the actual observed instance **did** move — production went `db245336d` →
`f723f2e93` mid-sitting — and the harness has **no concept of it**. Had my working tree been
clean, `--verify` would have reported **INTACT** while the studied instance was replaced
underneath the study.

> **For a production field study, the method's central immutability guarantee does not hold.**
> `--verify` measures the observer's checkout, not the observed environment.

This is the same defect family as I-3/I-4 (the three identities of the observed build),
now demonstrated at the *close* of the sitting rather than the open — and it is the point at
which the defect becomes **silent**. Detected here only because the referent was re-queried
by hand.

## I-12 · Whole-repo fingerprint vs. bounded surface

Divergence was real at the repo level and **absent at the studied surface**: between
`db245336d` and `f723f2e93` the only Now What?-scoped change is a **comment** in
`config/accessMatrix.ts` citing `/now-what/room` as precedent for an unrelated policy. No
now-what rule, route, component, or lib changed.

**Build divergence ≠ surface divergence.** The method's rule — *observations before and after
a divergence belong to different builds and may not be compared* — is correct in general and
**over-broad for a scoped study**. As written it would invalidate this sitting's evidence for
a change that did not touch the field.

**Proposed revision (recorded, NOT applied) — Kelly's formulation, 2026-07-30:**

> **A detected build divergence invalidates only observations whose governing implementation
> may have changed.**

⭐ This is sharper than a scoped-fingerprint fix. It preserves the original safety principle
while avoiding unnecessary evidence loss when the studied surface is demonstrably unchanged —
**the method becomes more discriminating rather than merely more permissive.** The
implementation consequence (fingerprint the declared surface scope alongside the repo; report
*repo diverged / surface intact* distinctly from *surface diverged*) follows from the rule
rather than standing in for it.

## Closeout disposition

- **Instrument:** ✅ `84dde085c5d8` INTACT — the method did not move under the sitting.
- **Observed build:** ⚠️ **DIVERGED at the repo level, INTACT at the studied surface.**
  Observations stand for the Now What? public surface.
- ⚠️ **Governance note, reported not judged:** the mid-sitting deploy carried #833
  (`c8e38c5a7`, previously under a do-not-deploy hold) together with #837/#838/#840, which
  include the Author Studio access reconciliation. Whether the gate order was satisfied is a
  founder determination, not this study's.

---

## ⭐⭐ Synthesis — the twelve findings form three coherent layers

Founder observation, 2026-07-30. The sitting produced **methodological refinement in three
layers**, not isolated defects:

| Layer | Findings | Question |
|---|---|---|
| **1. Evidence acquisition** | standing determination · prior-evidence check · convergence classes | How is evidence gathered? |
| **2. Classification** | governing-rationale check · five-result outcome table · mechanism ⟂ assertion · selection ⟂ adequacy | How is evidence classified? |
| **3. Integrity over time** | production build identity (I-3) · production build pinning (I-11) · scoped divergence (I-12) · verifier referent correctness (I-10) | How is evidence integrity maintained? |

> **Why the review kept correcting itself:** each layer was strengthened independently, and
> each then exposed weaknesses in the next.

⚠️ **Do not collapse this with the three-layer *evidence* model** (experienced / governed /
historical, in `feedback_three_layers_of_review_evidence`). That model describes **where
evidence lives**; this one describes **which part of the method was refined**. Two distinct
three-layer structures produced in one sitting — naming them apart is deliberate.

## ⭐⭐⭐ The enduring contribution — four distinctions

Likely to outlast every product finding here, and to apply to the House and the wider
ecosystem regardless of which instrument is selected:

| Distinction | Guards against |
|---|---|
| **Mechanism ⟂ assertion** | Verifying how a thing works and treating that as verifying what it claims |
| **Rationale ⟂ standing** | An implementation comment masquerading as constitutional authority |
| **Selection ⟂ adequacy** | A shared defect in all candidates silently deciding the choice between them |
| **Implementation divergence ⟂ observation divergence** | Discarding valid evidence over a change that did not touch the field |

## Standing

Twelve instrument findings; the product ledger has five.

⭐ **I-11 is classified as evidence about instrument *adequacy*, not as an implementation
defect.** The method declares *"the observed build is pinned"*; the harness measures *"the
local checkout has not changed."* **Different referents.** Because build pinning was named as
one of the candidate method's distinguishing capabilities, this is no longer a theoretical
comparison between instruments — **it has been empirically tested, and the capability was
declared but not delivered for production referents.** It belongs to D1. This is
the method's predicted shape — *first rounds reveal more about the measuring instrument than
the world being measured* — and is recorded as expected, not as delay.
