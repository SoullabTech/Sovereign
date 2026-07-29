# Ecosystem Experiential Review — Charter (CANDIDATE)

**Date**: 2026-07-29 · **Status**: Candidate — awaits founder ruling · **Class**: no-build, doc-only

## Purpose

Review each product/studio twice over: (1) does this experience make sense on its own,
(2) does it belong coherently within the House. Standard deliverables per field so
cross-product comparison becomes possible. The goal is the **design grammar of AIN** —
not a series of UX audits.

Full program as authored by Kelly (2026-07-29) is reproduced in §3–§6 below.

---

## 1. The correction this charter proposes

**This ground is not clean.** The House alone has been reviewed at least four times:

| Existing artifact | Date |
|---|---|
| `docs/architecture/MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md` | 07-17 |
| `docs/ux/SOULLAB_HOUSE_COHERENCE_AUDIT_2026-07-22.md` | 07-22 |
| `docs/ux/HOUSE_DESTINATION_COHERENCE_AUDIT_2026-07-22.md` | 07-22 |
| `docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md` | 07-27 |

Adjacent fields are also pre-covered:
`STUDIO_ACCESS_AUDIT_2026-07-16` · `EXPERIENTIAL_DESIGN_BRIEF_2026-07-16` ·
`RELATIONAL_INTELLIGENCE_AUDIT_AND_PLAN_2026-07-16` ·
`NOW_WHAT_ROOMS_COMPLETION_AUDIT_2026-07-13` ·
`SOULLAB_PRESS_CURRENT_STATE_AUDIT_2026-07-22` ·
`MOBILE_CHAT_INTERACTION_AUDIT_2026-07-21` · `RENDERING_STATUS_AUDIT_2026-07-20`.

And the navigation lane has **three open PRs awaiting Kelly**: #801 (preserve 07-27
audit + supersession note), #803 (make the drift guard enforce), #804 (route surface
five-state classification).

A clean-room Review 1 would be the **fifth** House audit and would manufacture rulings
that contradict the four already on the record. That is the duplicate-implementation
trap (`#792 built twice`) at governance scale.

**Proposed amendment to Phase I:**

> Review 1 (House) runs as **reconciliation**, not fresh discovery. Pass 1 reads the
> four existing House audits + the three open PRs and produces a single **standing
> record**: what has already been found, what was ruled, what was superseded, what
> remains open. Only what survives that pass gets walked fresh.

Every subsequent review opens the same way: **standing rulings first, fresh walk second.**
The review is additive to the record or it is not run.

## 2. Sequence (as authored, with amendment)

```
House (reconcile) → Now What? → Author's Studio → Practitioner Portal →
MAIA → Journal → Vision Studio → Publishing → Book Studio → ecosystem synthesis
```

House runs **first and last** — first as provisional lens, last as revision.

## 3. Standard deliverables

### 00 — Standing Record *(first-class; everything else begins here)*

Produced by Pass 1, before any observation. Contains only:

- prior audits · prior rulings · merged findings · superseded findings ·
  unresolved questions · open PRs · candidate constitutional questions

No review may begin its walk until its Standing Record exists.

### 01 — Evidence Delta *(guards against restatement)*

After reconciliation, the walk reports **only what is absent from the Standing Record**:

```
New observations:
  •
  •
```

If an observation already appears in the Standing Record, it is not a new observation —
it is a Pass 3 verdict (Confirmed / Drifted) against an existing item. This keeps every
review additive rather than competing with its predecessors.

### 1–20 — Per-product deliverables

Purpose as implemented · first-arrival journey · returning journey ·
creator/practitioner/founder journey · complexity–confusion matrix · primary
relationship map · role and agency map · visibility and consent map · temporal
continuity map · ten highest-leverage frictions · visible-that-should-be-carried ·
hidden-that-must-be-revealed · strengths not to redesign away · structural causes ·
three future grammars · obvious corrections · prototype candidates · structural
questions · founder ruling queue · House implications.

### Required tags on every finding

Beyond the nine-way classification (§5), each finding carries two further tags:

**Scope** — prevents constitutional ideas from emerging by accident:

| Tag | Meaning |
|---|---|
| Local | belongs to this product alone |
| Shared Pattern | recurs across products; candidate for shared grammar |
| Constitutional Candidate | would bind every product; escalates to canon process |

**Confidence** — experience review inevitably contains interpretation; say which is which:

| Tag | Meaning |
|---|---|
| Observed | seen in the running system |
| Inferred | derived from code or structure, not witnessed |
| Hypothesis | a reading that would need testing to hold |

A **Constitutional Candidate** tagged **Hypothesis** may not enter the canon process.
Constitutional escalation requires Observed or Inferred standing.

**Provenance** — orthogonal to evidence class, added 2026-07-29 after a live failure:

| Tag | Meaning |
|---|---|
| Command-verified | a re-runnable command established it; the command is recorded |
| Reconciliation output | produced by extraction or merge; awaiting independent confirmation |
| Retracted | previously reported at too high an evidence class; explicitly withdrawn |

### Why both axes are required

They answer different questions and do not substitute for each other:

| Dimension | Question |
|---|---|
| **Evidence class** | What *kind* of claim is this? (Observed · Inferred · Hypothesis) |
| **Provenance** | *Who* established it, and *how*? (Command-verified · Reconciliation output · Retracted) |

A claim can be Observed in nature yet merely Reconciliation output in provenance — that
is exactly the combination that inflated the "eight cited-but-nonexistent documents"
count in Pass 1. One axis alone cannot catch it.

> **An agent-produced count is Reconciliation output until a command re-establishes it.
> The reviewer's summary does not upgrade a finding's evidence class.**

Confidence must not accrue through retelling. See `HOUSE_00_PROVENANCE.md` for the
worked example.

## 4. Four passes per product

1. **Evidence** — code, routes, states, data objects, copy. No recommendations.
2. **Experience** — walk defined human perspectives. Record confusion, complexity,
   relational meaning, continuity.
3. **Structural tracing** — connect experience to components, routing, domain model,
   persistence, permissions, copy, visual hierarchy, product history.
4. **Futures** — competing alternatives + ruling queue. No implementation until ruled.

## 5. Discipline

- No production code edited. No founder-level product decision settled.
- Observations, interpretations, and recommendations kept explicitly separate.
- Concepts are **not** silently unified across products. Name both reuse opportunities
  and the reasons distinctions must remain.
- Complexity and confusion assessed independently.
- Findings classified: presentation · language · interaction · information architecture ·
  domain model · relational architecture · temporal continuity · consent or visibility ·
  constitutional conflict.

## 6. Founder ruling queue (this charter) — RULED 2026-07-29

- **R-C1** — *Reconciliation first.* Not a clean-room walk. Rationale (Kelly): the House
  already has accumulated evidence, rulings, and unresolved PRs; a clean-room walk
  "would risk rediscovering old questions and then treating contradiction as insight."
- **R-C2** — *Do not rule the open PRs first.* Ruling them ahead of the review "would
  make architectural decisions before the review has assembled the full record."
  #801/#803/#804 surface as unresolved questions in the final founder ruling queue.
- **R-C3** — *A sitting, not a lane.* A lane implies an ongoing implementation
  workstream with authority to mutate something. This is bounded · no-build ·
  evidence-producing · ruling-preparatory. **Complete when the reconciliation package
  and founder queue are delivered.** Any approved correction or prototype arising
  afterward becomes its own lane.

---

## 7. Review 1 — the three passes (RULED)

### Pass 1 — Constitutional reconciliation

Read the four House audits, PRs #801/#803/#804, and standing House/navigation rulings.
Produce **one ledger**, containing only:

| Category | Meaning |
|---|---|
| Ruled and still active | decision made, nothing marks it changed |
| Ruled but superseded | replaced by a later decision |
| Implemented but never ruled | shipped without a recorded founder decision |
| Proposed and still open | candidate awaiting decision |
| Contradictory accounts | sources disagree about the same surface |
| Unverified claims | asserted; evidence is intention, not observation |
| Questions the record cannot answer | named but unresolved |

**No new recommendations in Pass 1.**

### Pass 2 — Fresh experiential walk

Walk the current House as though encountering it now. The walk is **not constrained
into defending the old record.** It asks:

- Does the current experience embody the standing rulings?
- Has implementation revealed something the earlier audits could not see?
- Are there new contradictions?
- Does the House orient a member without turning into a product menu?
- Can members reach the different studios once they need to navigate?
- Does the center remain the work while the wider geography stays intelligible?

### Pass 3 — Reconciliation of record and reality

Every finding receives exactly one verdict:

| Verdict | Meaning |
|---|---|
| **Confirmed** | current experience supports the standing record |
| **Drifted** | implementation no longer embodies the ruling |
| **Revealed** | the walk exposes a genuinely new issue |
| **Reopened** | new evidence makes an earlier ruling insufficient |

> *"A review should not casually overturn rulings, but neither should rulings become
> immune to lived evidence."* — Kelly, 2026-07-29

**Reopened** is the load-bearing category. It is the only path by which lived evidence
may reach a standing ruling, and it produces a founder question — never a reversal.

---

## 8. Final synthesis — *AIN Design Grammar*

After all products are reviewed, one artifact summarizes **the ecosystem**, not the
studios. It does not recapitulate the nine reviews.

```
AIN Design Grammar
  Recurring patterns
  Repeated friction
  Shared primitives
  Contradictions
  Emergent constitutional candidates
  Open founder rulings
```

Its inputs are every finding tagged **Shared Pattern** or **Constitutional Candidate**.
Without it, "nine excellent reviews remain nine separate documents instead of becoming
a coherent understanding of the platform." (Kelly, 2026-07-29)

The sequence therefore closes where it opened:

```
House (reconcile) → Now What? → Author → Practitioner → MAIA → Journal →
Vision → Publishing → Book → House (revisit) → AIN Design Grammar
```

Beginning and ending with the House lets the House grammar evolve from everything
learned, rather than being frozen before the ecosystem is understood.

---

## 9. OPEN — a tension between R-C3 and §8

R-C3 ruled: **a sitting, not a lane** — bounded, complete when the reconciliation
package and founder queue are delivered.

§8 requires an artifact that can only exist **after ten reviews**, drawing on tags
accumulated across all of them. That is institutional memory, which is lane-shaped.

Proposed reconciliation (not yet ruled):

> **The sitting is the unit of work; the program is the ledger.**
> Each of the ten reviews is a bounded no-build sitting that completes and closes.
> The *program* containing them keeps a running tag register (Shared Pattern /
> Constitutional Candidate) across sittings — but holds **no authority to mutate
> anything**, which was the property R-C3 refused when it declined "lane."

If that is right, R-C3 stands unchanged and §8 is compatible. If the intent was that
the program itself be resumable *and* authorized to act, R-C3 needs revisiting.

**This is a live founder question, not a settled amendment.**

---

*Charter is candidate. Nothing in it authorizes a build.*
