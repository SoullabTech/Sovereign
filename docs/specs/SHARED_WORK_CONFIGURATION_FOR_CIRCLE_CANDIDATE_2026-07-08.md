# Shared Work Configuration for Circle — SPEC

**Status:** CANDIDATE (spec only — not ratified, not built). Does **not** promote "Shared Work" to a primitive.
**Date:** 2026-07-08
**Author:** design pass under Architectural Integrity Mode
**Governs:** the smallest honest extension that lets a Circle gather around a shared work. Book Club is its first configuration.
**Grounds in canon:** `docs/canon/CIRCLE_FIELD_DOCTRINE.md` — Core Law *"The field is primary. Content is secondary."*
**Depends on evidence:** Circle implementation audit (2026-07-08) — Circle is canon and faithfully implemented at the service/DB layer; the only missing capability is a concept of a shared body of work. See memory `project_circle_place_book_club_specialization`.

---

## 0. The load-bearing sentence

> **The Circle is not typed. The thing it gathers around is configured.**

Everything in this spec exists to hold that line. A Circle remains a Circle, governed unchanged by the Circle Field Doctrine. What is new is a small, object-focused configuration describing *what the Circle gathers around* — never a new kind of Circle.

---

## 1. Purpose

Define the smallest honest extension that allows a Circle to gather around a shared work, with **Book Club as the first — and, for now, only — configuration**.

This is a *capability*, not a feature and not an ontology. "Book Club" is what you get when the capability is pointed at a book. The capability does not know or care that books are special.

---

## 2. Core decision

**Do not add `circle_type = book_club`.** Do not type the Circle.

Instead, add an **object-focused configuration** that describes the shared work:

- `focus_type` — the *kind* of shared work (v1: `book`)
- `focus_id` — a reference to the specific work (record / library reference)
- optional **ordered progression** — a simple sequence over the work (chapters / sections / meetings)

The Circle's identity, mechanics, membership, inquiry model, sharing model, and doctrine are untouched. The configuration is a thin association hanging off the Circle, describing its object.

---

## 3. Scope (v1)

**In scope:**
- Bind a Circle to a work-like object (`focus_type` + `focus_id`).
- Support ordered reading/progression over that object.
- Preserve existing Circle mechanics exactly (one inquiry at a time, one response per member, contribute-before-see, 2-member anonymity floor, no counts/scores/badges, manual/reversible sharing).
- Preserve existing Circle doctrine exactly.

**Explicitly NOT in scope (v1):**
- No new MAIA behavior.
- No new facilitator authority (use only the existing open/close-inquiry gate).
- No new interaction model.
- No passage-level anchoring of inquiries.

---

## 4. Book Club v1 (the first configuration)

- `focus_type = book`
- `focus_id` = book record / shared-library reference
- progression = chapters / sections / meetings

A Book Club is therefore *a Circle whose `focus_type` is `book`*. Nothing more is built. If the same association later points at a different kind of work and the structure holds, the abstraction begins to earn itself — but not before (see §7).

---

## 5. Explicitly deferred

Deferred until an **observed** need, never a hypothesized one:

- **Passage / portion anchoring** — anchoring inquiries or artifacts to a specific location within the work. This is where media-generality complexity creeps in; it waits.
- **Generic media registry** — any typed handling of work-kinds.
- **film / course / scripture / paper handling** — hypothesized second instances, not observed. Building for them now is naming-before-earning, one level up.
- **Facilitator constitutional behavior** — see §6 and §8.
- **MAIA summary / synthesis / question generation** — forbidden, not merely deferred (see §6).

---

## 6. Canon constraints (non-negotiable)

These are inherited from `CIRCLE_FIELD_DOCTRINE.md` §3, the Living Field Mirror Invariant, and the Constitutional Direction of Authority. This spec authorizes nothing that touches them.

- **MAIA is a steward of coherence only.** She reflects the field back to itself; she does not summarize, moderate, direct, generate content, or become the center of meaning. A Book Club is *not* MAIA facilitating a book discussion — it is a Circle whose shared object is a book, where MAIA safeguards coherence without generating meaning.
- **Recognition remains member-authored.** The system may store, organize, and return recognitions; it must never manufacture higher-order meaning, infer developmental themes, or synthesize the group into an interpretation.
- **`field_synthesis` remains human-written.** The running code already holds this — closing an inquiry writes a human-authored synthesis, never a MAIA-generated one. This spec preserves that invariant; it does not add a generative path.
- **Facilitator behavior remains founder-open.** The `member / helper / facilitator` role enum exists with no behavioral definition. That is an intentionally-unresolved constitutional question, not implementation debt. This spec does not resolve it.

---

## 7. Implementation principle

> **Name generically, build narrowly, canonize reluctantly.**

- **Name generically** — `focus_type` / `focus_id`, so nothing is book-specific. Naming costs nothing and forecloses nothing.
- **Build narrowly** — bind + ordered progression only. The smallest extension that makes a Book Club possible.
- **Canonize reluctantly** — "Shared Work" is not promoted to a primitive by this spec. It earns canonical standing only when a genuinely different second work-type ships and the same structure holds under it.

---

## 8. Falsifier

This candidate **fails** if Book Club, to work as intended, requires any of:

- a new interaction model (anything outside the existing `Feel → Contribute → Browse` Circle mechanics);
- MAIA-generated synthesis, summary, or question generation;
- facilitator-led meaning-making (facilitator behavior beyond the existing open/close gate);
- book-specific behavior that cannot remain a narrow, object-focused `focus_type`/`focus_id` configuration.

If any of these prove necessary, then Book Club is **not merely a Circle configuration**, the load-bearing sentence in §0 is false, and this spec must be withdrawn rather than stretched. The correct response to a failed falsifier is to stop and re-open the architecture — not to widen the spec until it fits.

---

## 9. Sequencing

1. **This spec** — candidate, reviewed for integrity, not built.
2. **Facilitator constitutional pass** — separate, founder-input, shapes *every* Circle. Explicitly not part of the schema work here.
3. **Build** — the narrow extension (§2–§3), only after (1) survives review and (2) is at least scoped, so the schema does not silently pre-answer the facilitator question.
4. **Book Club v1** — first configuration, observed under real use before any deferred capability in §5 is reconsidered.

---

_This spec is a candidate. It authorizes no build. It exists to hold one line: the Circle is not typed; the thing it gathers around is configured._
