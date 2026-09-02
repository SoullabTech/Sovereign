# NW-D02 — Talk-Derivation Review

**Date:** 2026-09-02
**Subject:** Two founder-supplied analyses of Larry's Tiger 21 presentation, reviewed against the built system.
**Status:** ⚠️ REVIEW OF DERIVED MATERIAL — records no ratification, authorizes no change.
**Related:** [NW-D01 Larry doctrine reconciliation](./NW_D01_LARRY_DOCTRINE_RECONCILIATION.md) ·
[NW-D01.5 vocabulary convergence census](./NW_D01_5_FLOURISHING_VOCABULARY_CONVERGENCE_CENSUS.md) ·
[Attachment A instrument](../../../governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md) ·
[Source & custody sitting agenda](../../../governance/LARRY_SOURCE_AND_CUSTODY_SITTING_AGENDA_v1.md)

---

## 0. What the two documents are

Doc 1 — a product reading of the presentation ("the presentation in one sentence" → 14 sections → threshold onboarding proposal).
Doc 2 — a positioning argument ("relationship as operating system"; the AIN-vs-conventional-coaching table).

Both are **derived artifacts**. Neither is Larry's language, and neither cites a held source.

The custody agenda already names this failure mode as having occurred once:

> "An interview *was* conducted before; only speaker-labeled highlights survive […] treat every derived summary as derived — never as the source."

This review is therefore filed as a **reading of derived material**. It does not move any item toward ratification.

---

## 1. Vocabulary drift — the urgent finding

Three incompatible flourishing vocabularies are now in circulation, two of them produced within a single session:

| Source | Domain list |
|---|---|
| **Enforced** — `database/migrations/20260805200001_flourishing_dimension.sql`, mirrored by `lib/nowWhat/flourishingDomains.ts` | relationships · meaning · presence · health · contribution · **time** |
| Attachment A §0 (fuller names, same six) | Relationships · Meaning and Purpose · **Time Affluence** · Presence · **Health and Energy** · Contribution |
| **Doc 1** | relationships · meaning · presence · health · contribution · time · **leisure** |
| **Doc 2 §4** | relationships · health · meaning · presence · **money** · contribution · **leisure** (no time) |

Two derived documents producing two *different* seven-item lists is the signature of re-derivation from memory rather than from a source.

**Disposition:** neither list may touch the CHECK constraint, the constant, or the seed.
`lib/nowWhat/flourishingDomains.ts` exists precisely because this drift already happened, and its instruction is explicit — the domains "must be captured in Larry's own language at the custody sitting — never re-derived from our own documents."
`leisure` and `money` enter the record as **open gaps for the sitting** (Attachment A §4), not as candidate values.

Noted for the record: Doc 2 §4's own argument — *do not build the domains as siloed modules* — describes the system as it already is. `flourishing_dimension` is a tag on member-authored work. There are no domain modules.

---

## 2. Already live — read as description, not proposal

Both documents propose, in good faith, mechanisms the repository already carries. Recording the mapping so the analyses are not mistaken for a build backlog:

| Claim | Where it already lives | Note |
|---|---|---|
| Doc 2 §1 — relationship as a first-class object | `lib/coachField/bringForward.ts` | Stronger than described. The doc says "with permission"; the implementation makes permission a **third member-authored object** with opaque lineage — the source stays unreachable from any practitioner-scoped query. |
| Doc 2 §2 — continuity between sessions | `lib/nowWhat/carriedThread.ts`, `lib/nowWhat/livedRelation.ts` | "session → life → noticing → reflection → session" *is* the V1 return loop. |
| Doc 2 §5 — returning the person to themselves | `carriedThread.ts` | Stricter than described: `livedRelation.ts` forbids anything downstream reading the relation as progress. |
| Doc 2 §6 — peer stance, no expert hierarchy | `lib/nowWhat/roomGrammar.ts` | The person's own words are primary; the elemental lens is optional and last. |
| Doc 2 §7 — pattern without declared identity | `tests/constitutional/refusal-registry/refusal-24-cross-session-continuity-truthfulness.ts` | The observed-vs-asserted boundary is already a constitutional refusal. |
| Doc 1 §3, §5, §6, §8, §9, §13 | Five-room ontology (`lib/nowWhat/rooms.ts`), `roomGrammar.ts`, member-owned boundary | No score, no gamification, conversation as the room, Larry visible but not central, MAIA not Synthetic Larry. |

**Risk this section exists to manage:** both documents are coherent and persuasive. Their coherence should not trigger a redesign of settled surfaces. Where an analysis and the build agree, the build is the record.

---

## 3. Genuinely ahead of the build

Preserved as direction. Unbuilt, unauthorized, no schema implication.

- **Doc 2 §3 — relational field decomposition.** Decomposing a presenting problem into the relations that constitute it (`SELF ↔ WORK`, `SELF ↔ FATHER'S EXPECTATIONS`, `SELF ↔ FUTURE`). Nothing in the repository models relations *between* a member's relations. The most architecturally consequential idea in either document.
- **Doc 2 §8 — relationships as participants.** A spouse or friend brought into the work is a third party with no account, no consent, and no withdrawal path. This requires its own consent instrument before any design work; it is not an extension of `bringForward`.
- **Doc 2 §9 — "Now What?" across decades.** Argues the return anchor should survive across life chapters, not weeks. Cheap to reason about, and a real constraint on `carriedThread.ts`'s selection rule if pursued.
- **Doc 1 §4 — the threshold.** The last ten minutes of the talk as the first ten minutes of the product. There is currently no post-talk entry: `/now-what/welcome` has zero inbound links by design and `/now-what/arrive` is the auth door. The only place where software presently interrupts the continuity of the coaching relationship.
- **Doc 1 §10 — doorway ≠ method.** The method may generalize; the achievement-threshold story does not. Argues against hard-coding one entry narrative.

---

## 4. One contested claim

Doc 2 §1 illustrates relational intelligence with MAIA saying:

> "This decision touches something you've been exploring with Larry for several weeks."

This inverts `bringForward`. That channel is deliberately **one-directional — member → practitioner**. MAIA reading the coach field back into the member's conversation would make MAIA an observer of the coaching relationship rather than a participant in the member's own work.

The document's instruction to "stop there" does not resolve it: the sentence preceding the stop already asserts both a pattern *and* Larry's relevance to it. Two assertions, neither the member's.

**Disposition:** MAIA stays with the member's own kept acts. Larry remembers Larry.

---

## 5. Representation disposition

Doc 2's closing formulation — *"other coaching software manages clients; AIN helps sustain a developmental relationship"* — passes claim discipline **only with its Center of Gravity stated**:

| Register | Sections |
|---|---|
| **Live** | Doc 2 §1, §2, §5, §6, §7 |
| **Designed** | Doc 2 §3, §9 · Doc 1 §4, §10 |
| **Vision** | Doc 2 §8 |

Without that split the documents read as uniformly Live and fail the Failure Test. See `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`.

---

## 6. Open question, carried

**Does a raw recording or transcript of the presentation exist anywhere reachable?**

- **If yes** — preserving it under `00_PROVENANCE/` closes the "talk corpus NOT HELD" gap named in `lib/nowWhat/flourishingDomains.ts` and retires this whole drift class.
- **If no** — both documents are permanently derived, and the custody sitting is the critical path for every Larry-specific surface downstream.

Unanswered at the time of writing. Recorded rather than assumed.
