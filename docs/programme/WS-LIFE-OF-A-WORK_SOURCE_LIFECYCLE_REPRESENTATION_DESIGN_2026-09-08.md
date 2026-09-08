# Source lifecycle representation — design

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §III–IV. Bounded DESIGN authorized.
**Status:** ⛔ DESIGN ONLY. **No schema change is authorized.** Tradeoffs returned first, as required.

> **Preferred invariant (§IV):** historical content remains historical; changes in currency or lifecycle
> state should not require rewriting the content whose history is being preserved.

---

## 1. §III first — creation is already a second route around custody

§III asks the design to distinguish *ability to mutate an existing Source* from *authority to create
something that becomes protected Source*. The distinction is not hypothetical here.

**In `app/api/sovereign/manuscripts/route.ts`, the Source Representation is written before, and is not
conditioned on, the Historical Source claim:**

```
line 232   INSERT INTO manuscript_sections …          ← the representation exists from here
line 257   if (await claimArrival(sourceArrivalId, …)) …
line 261   const arrival = await recordSuppliedArrival(…)
line 262   if (await claimArrival(arrival.id, …)) …    ← custody is attempted afterwards, and may fail
```

`claimArrival` returns a boolean the route checks rather than a failure it refuses on. So a Source
Representation can exist whose custody claim never succeeded — and the schema has a name for that
state already: `member_manuscripts.source_custody` **DEFAULTs to `legacy_interpreted_import`**, with
`source_custodied` written only when a claim lands. **The uncustodied representation is not an edge
case; it is the default a row receives when nothing says otherwise.**

> **Finding for §III:** unrestricted `INSERT` on the protected tiers is exactly the second route around
> Source custody the ruling anticipated. It permits manufacturing a Source Representation with no
> Historical Source behind it — not by attack, but by ordinary control flow.

**Smallest arrangement that preserves normal import and extraction without that route:**

| | Grant | Consequence |
|---|---|---|
| `manuscript_source_arrivals` | `INSERT` may stay with ordinary authority | An arrival is self-witnessing: it carries its own bytes, hashes and extractor. Creating one manufactures nothing it cannot prove. |
| `manuscript_sections` | ⛔ **`INSERT` moves behind the seam** | A representation is only meaningful *as derived from* an arrival. Only the seam can assert that derivation, because only the seam sees both sides in one transaction. |

The seam function takes `(arrival_id, member_id, cut)` and either writes the representation **and** the
custody claim atomically, or writes neither. That single change also closes the ordering defect above,
because the two facts stop being separate statements a route can interleave or ignore.

⚠️ **`member_written` manuscripts are unaffected and must stay so.** `app/api/sovereign/manuscripts/blank/route.ts`
creates a manuscript and a working draft with **no sections and no arrival** — a Work with no Source is
legitimate and common. The seam governs *derivation*, never *authorship from nothing*.

⛔ Exact grants remain a BUILD decision (§II) and are not authorized.

---

## 2. §IV — where currency belongs: four options, tradeoffs first

Requirement: express **re-extraction**, **replacement**, **withdrawal**, **erasure** without rewriting
preserved content. Four candidate homes, compared against the invariant.

### Option A — a flag on the protected row (`is_current`)

⛔ **Named only to be refused, as §IV instructs.**

Changing currency would `UPDATE` a protected row — writing to the tier the boundary exists to protect,
for a fact that is not the content's. It would require punching a column-level `UPDATE` grant through
the §II boundary whose only purpose is to move currency; every future currency-shaped need would argue
for widening it. **The invariant is violated in the mechanism itself.** Convenience is exactly why it
would be chosen, and exactly why it must not be.

### Option B — currency on the Work (`member_manuscripts`)

A pointer on the Work names which lineage and which representation are operative.

- **For:** the Work is not a protected tier, so currency moves without touching preserved content —
  the invariant is satisfied directly. **There is a precedent on this very table:** `source_custody`
  already holds a custody *state* about the Source **on the Work rather than on the Source**. One row
  per Work makes "what is operative now" a single cheap read.
- **Against:** one pointer holds one answer. It records the current state and **not how it got there** —
  a replacement would be indistinguishable from a re-extraction after the fact, and withdrawal
  (*"ceased to be operative without pretending it never existed"*) has nowhere to record *that it
  ceased*. Also loses ordering when two acts land close together.

### Option C — a Source-lineage relation

An explicit relation between a Work and its Historical Sources / representations, carrying role and
state per edge.

- **For:** models what is actually true — a Work may have several arrivals over time (⚠️ **already true
  today**: A4.2 in the falsifier claimed a second arrival onto the same manuscript, and `verifyCustody`
  silently resolves the ambiguity by taking the **earliest**). Makes replacement expressible as *a new
  edge becoming operative*, exactly §II's wording.
- **Against:** a new relational object to keep consistent, with an implicit uniqueness rule ("at most
  one operative lineage") that is itself enforcement surface. Edge state is mutable, so it re-opens a
  small version of the same question one tier down.

### Option D — an append-only lifecycle record ⭐

One insert-only table: `(work_id, act ∈ arrival|extraction|re_extraction|replacement|withdrawal|erasure,
subject_tier, subject_id, occurred_at, actor, …)`. Currency is **derived** — the latest act that names
a subject operative.

- **For:** ⭐ **the only option in which the invariant holds by construction** — nothing is ever
  rewritten anywhere, because lifecycle is expressed by *adding*. It is the only option that can
  distinguish withdrawal from replacement from erasure **after the fact**, which §II requires when it
  says erasure must be *unmistakably commissioned as erasure* and never a side effect: an act that had
  to be named to happen cannot be mistaken for another act later. It also composes with §V — an
  append-only act record is where attribution naturally lives.
  **Three precedents already in the architecture:** `working_draft_revisions` (append-only revision
  store); `manuscript_structure_proposals.adopted_at` + `manuscript_structure_units.adopted_from_proposal_id`
  (**currency by adoption — many proposals, one adopted, provenance retained**, which is precisely the
  re-extraction shape); and `vault_erasure_queue`, an instruction record deliberately carrying *minimal*
  provenance (errno only, ≤32 chars, never the path) — the existing model for §II's "minimal non-content
  evidence".
- **Against:** currency becomes a query, not a column — every read that needs "which representation is
  operative" pays for a derivation, and a wrong derivation is a silent correctness bug rather than a
  visible null. Needs care that the record itself never accumulates content (an erasure act must not
  preserve what erasure destroyed — the residue question §II reserves to privacy law).

### Recommendation, with its condition

> **D as the authority, B as a derived cache if reads demand it.**
>
> The lifecycle record is what *makes* an act true; any pointer on the Work is a materialisation of the
> latest act and never an independent source of truth. If B is ever written, it must be reconstructible
> from D, and a divergence must be a detectable fault rather than a tie-break.

⛔ Not ratified. C remains a live alternative if the founder judges that a Work↔Source relation deserves
first-class standing rather than being derived — and note the two are not exclusive: D can *populate* C.

### The four acts under the recommendation

| Act | Representation | Content rewritten |
|---|---|---|
| **Re-extraction** | `INSERT` a new representation (via §1's seam) + append `re_extraction` naming it operative | none — the earlier representation stays exactly as it was |
| **Replacement** | `INSERT` a new arrival + its representation + append `replacement` naming the new lineage operative | none — the former lineage remains historical |
| **Withdrawal** | append `withdrawal` naming a lineage no longer operative | none — *"ceasing to be operative without pretending it never existed"* is one row |
| **Erasure** | append `erasure`, then the seam destroys content and enqueues the vault artifact | content is destroyed **deliberately**; the act is named before it occurs, so it can never be a side effect |

---

## 3. What this design surfaces that was not previously visible

1. ⚠️ **Multiple arrivals per Work already exist and are already resolved silently.** `verifyCustody`
   takes the earliest arrival. That is a currency decision **made by an `ORDER BY` clause**. Any of B, C
   or D replaces an implicit rule with an explicit one — which is a reason to build the representation
   even apart from enforcement.
2. **`source_custody` is the shape of the answer, one size too small.** A two-value state on the Work
   already says something about the Source without touching it. The lifecycle representation is that
   idea extended from *custodied / not* to *which, and by what act*.
3. **§III's ordering defect is repairable inside the seam** rather than by a separate fix, so the
   enforcement build and the ordering repair are one change, not two.

## 4. Standing

⛔ No schema change, no migration, no grant, no seam, no build. `is_current` on a protected row is
recorded as **refused**, not deferred. Erasure residue remains reserved to privacy/custody law (§II) and
is not settled here. PT-3 enforcement BUILD remains held; Encounter remains held behind it.
