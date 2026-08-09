# The Substrate Disposition Test — candidate review instrument

**Status: CANDIDATE.** ⛔ Not ratified. A **review discipline**, not a constitutional principle —
closer in kind to `MARKETING_CLAIM_DISCIPLINE.md` than to the Sovereignty Invariants.

Founder-specified 2026-08-06, generalizing the four implementation states discovered in the
practitioner-publishing reconciliation.

> ⭐⭐⭐ **PROVENANCE OF AUTHORITY — cite it this way, ⛔ never as a general principle.**
> *"This review method emerged from measured failures in the practitioner publishing lane
> (2026-08-06): drawing conclusions from declarations instead of deployed state, and nearly building
> on a substrate that was already governing."*
>
> ⛔ It was **not** derived from theory. Its authority is **earned by the worked examples below and
> extends no further than they do.** ⛔ Do not remove them to leave a tidy taxonomy — the four states
> are only credible because each one cost something. ⭐ **The origin is part of the authority.**

---

## The question

Before building on, reusing, or replacing any existing substrate, ask **not** *"reuse or build?"* but:

> ⭐⭐⭐ **Is this absent, compatible, incompatible, or already governing?**

| State | Meaning | Correct response |
|---|---|---|
| **Absent** | no substrate exists | design it |
| **Compatible** | exists and can satisfy the constitutional requirement — whether or not it is exercised | adopt; ⚠️ if unexercised, say so rather than calling it live |
| ⭐ **Incompatible** | exists, appears to fit, **cannot** satisfy the requirement | ⛔ do not adapt. Record the dependency and ⛔ never weaken the requirement to fit |
| ⭐ **Already governing** | exists **and is already exercising constitutional authority** — it decides something today | ⛔ do not re-decide it silently. Read its reasoning first; adopt, supersede explicitly, or leave it alone |

## Why "reuse vs. build" is the wrong question

It has only two answers, and the two most dangerous cases both hide inside "reuse."

⭐ **Absent things force design. Incompatible things tempt reuse.** A missing substrate announces
itself; an incompatible one looks like progress from a distance and is discovered only after it has
been built on. Many architectural failures begin exactly there — the substrate existed, appeared to
satisfy the requirement, and adopting it violated the model.

⭐ **Already-governing things are worse than incompatible ones**, because reusing them does not
merely fail — it **silently overturns a decision someone already made**, without anyone performing
the act of overturning it.

## Worked examples (from the practitioner-publishing lane)

| Substrate | State | What it cost to misread |
|---|---|---|
| PHI encryption (`k1` across 16,647 rows) | ⭐ **incompatible** | it works, it is correct, and it ⛔ cannot express per-subject erasure. Adapting it would have made erasure mean row deletion |
| 14 live `role` CHECK constraints | **incompatible** | "role" exists everywhere and ⛔ cannot carry a single authority meaning |
| `coach_client_shared_items` (Bring Forward) | ⭐ **already governing** | it decides how member material crosses into a relationship, encrypted, with verifiers. Adopting it for Placement would have overturned that decision by accident |
| `practitioner_file_shares` / `artifact_shares` | **incompatible** | possession-and-link grammar; `view_count` is telemetry pointed at a person |
| `practitioner_materials` (0 rows) | **absent in effect** | declared, never used — the honest state is *design it*, ⛔ not *migrate it* |
| `relationship_spaces` | **compatible, unexercised** | correct types and both gates; ⚠️ 0 rows. Compatible ≠ live |

## The discipline

1. **State the disposition before writing any code** that touches the substrate.
2. ⛔ **A column existing is not "compatible"** if production rows do not use it — say *compatible,
   unexercised*.
3. ⛔ **Never resolve "incompatible" by relaxing the requirement.** Record the dependency; the
   requirement outranks the substrate.
4. **For "already governing," read the reasoning first** — the decision is usually written in the
   migration comment, not in a document.
5. ⭐ **Absence claims must name their evidence scope.** "Not in the repository" is not a fact about
   the repository if it was measured on one branch. ⚠️ In this lane, local trunk was **402 commits
   behind origin**, and a real, shipped, verifier-backed substrate read as absent. **Measure against
   the deployed commit.**

## Relation to other instruments

- Answers *what may I build on?* — where
  [`AUTHORITY_IS_AUTHORED_OR_HELD`](AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md) answers *who may
  act?*
- ⭐ Complements the six-category artifact typology (Cat 1–6). The typology classifies **what we
  built and how live it is**; this classifies **what we may build on**. ⚠️ A Cat-3 built substrate
  can be *incompatible*, and a Cat-6 live one can be *already governing* — ⛔ the two axes are not
  the same, and collapsing them loses the case that misleads.
