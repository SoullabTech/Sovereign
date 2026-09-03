# Productizing the coaching platform

**Date:** 2026-09-02 · **Status:** assessment — authorizes no change
**Question:** what stands between the Now What? build and a coaching platform sellable to other practitioners?

---

## 0. The finding

**The platform is already multi-practitioner. Larry is a tenant, not the architecture.**

| Evidence | |
|---|---|
| Tenancy seam | `fieldContext` across **52 files**; `practice_fields`; practitioner portal / caseload / settings / themes migrations |
| Relational core | `lib/coachField/*`, `lib/relationship/scope.ts` — practitioner⇄client identity is already generic |
| Larry coupling | 22 runtime files mention him; **nearly all are comments**. His soul portrait is already commented out of `lib/soulPortrait/registry.ts` |

⛔ **Do not fork.** A fork rots within two releases and doubles the governance surface. Larry becomes the first configured field of one product.

---

## 1. What you are actually selling

Not a flourishing framework. **Relational infrastructure that a practitioner brings their own method to.**

The differentiated assets, all built and live:

| Asset | Where | Why it is hard to copy |
|---|---|---|
| Member-authored sharing | `lib/coachField/bringForward.ts` | Permission is a third object with opaque lineage — the source stays unreachable from any practitioner-scoped query. Not a flag on a row. |
| Return continuity | `lib/nowWhat/carriedThread.ts` | One act, labelled by what it is. What the member sees and what the room is told are the same by construction. |
| Non-inference | `lib/nowWhat/livedRelation.ts` | A relation exists only because the member walked back through the door. Nothing downstream may read it as progress. |
| Response grammar | `lib/nowWhat/roomGrammar.ts` | Every turn must be impossible to send unchanged to another person. |
| Suppressible symbolic register | same | The register can be withheld where it is contraindicated. |

**Positioning:** *other coaching software manages clients; this sustains a developmental relationship.*

---

## 2. The one thing you cannot sell

⛔ **The flourishing taxonomy.**

The six domains are Larry-derived, **unratified**, and **unlicensed** — the Materials Agreement is unsigned and Attachment A §3 is empty. They may not ship to another practitioner in any form: not as defaults, not as an onboarding suggestion, not as seed data.

**This constraint improves the product.** A generic platform with a fixed taxonomy is a framework competing with its buyer's method. A platform with **no** taxonomy, where each practitioner declares their own vocabulary, is infrastructure the buyer's method runs on.

> **The practitioner brings the method. The platform brings the relationship.**

Required: make `flourishing_dimension` per-field configuration rather than a global CHECK constraint. That is the single largest technical item, and it is what makes the product sellable rather than what makes it late.

---

## 3. Work to package

| # | Item | Size |
|---|---|---|
| 1 | Replace hardcoded practitioner strings with field config (`NowWhatRoom.tsx:988` and siblings) | small |
| 2 | Per-field flourishing vocabulary; retire the global constraint | **largest — §2** |
| 3 | Product name distinct from *Now What?*, which is Larry's (provenance class unestablished) | small, blocking on naming |
| 4 | Field provisioning: create a practitioner field without a migration | medium |
| 5 | Neutralise Larry-named comments in shared modules | trivial, do last |
| 6 | Extend the Co-Lab release gate to multi-field boundary checks | medium |

Items 1 and 3–5 are packaging. Item 2 is the product decision. Item 6 is the safety floor.

---

## 4. Sequence

1. **Freeze nothing tonight.** Tomorrow's encounter is evidence for this decision too — watch whether Larry values the *method* or the *relational infrastructure*. His answer sizes the market.
2. Name the generic product.
3. Per-field vocabulary (§2) — everything else waits on it.
4. Field provisioning, then string extraction.
5. Extend the release gate before any second field goes live.

---

## 5. What this does not change

Attachment A §3 stays empty. The taxonomy stays unratified. Transcript custody stays unresolved. **Selling the platform to others does not require any of Larry's material — and must not include it.**
