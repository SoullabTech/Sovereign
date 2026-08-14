# Relationship Room Constitution — Incorporation Diff Report

**Act:** Gate 1 — Constitutional Incorporation. 2026-08-14.
**Nature of the act:** mechanically boring incorporation. ⛔ No redesign. ⛔ No synthesis.
⛔ No code, schema, migration, UI, deploy, or relational data touched. Docs only.

---

## 1. Ref binding

| Item | Value |
|---|---|
| Base ref (trunk) | `origin/clean-main-no-secrets` = **`17bf9d4f30202712d2eef9ddac25a6dc4164f4d8`** |
| Worktree | `/Users/soullab/MAIA-SOVEREIGN-worktrees/const` (detached from base ref) |
| Branch | `docs/constitution-incorporation-2026-08-14` |
| Target file | `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` |
| **Pre-incorporation blob sha** | **`c1f5dfa4a1c199aaa276fc534e632698ff543d49`** (14,522 bytes) |
| **Post-incorporation blob sha** | **`3070517539d7ced02b03d5e0c062bbea6f9105eb`** (27,585 bytes) |
| Diffstat | 1 file changed, **204 insertions, 3 deletions** |

**The three deleted lines are the header `Status:` block only.** Their substantive sentence
(*"Recording is not a state change. Ratification occurs only through an explicit act of the
designated authority…"*) is **preserved verbatim** in the replacement header, reflowed. ⛔ No
Article text was deleted, reworded, or renumbered. All incorporation is **additive**, marked
inline with `⚖️ INCORPORATED — founder ratification 2026-08-13`.

---

## 2. Sources of authority (all read; all confirmed to exist)

| Source | Custody at time of act |
|---|---|
| `docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md` | ✅ on trunk |
| `docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md` | ✅ on trunk — **RATIFIED** |
| `docs/design/relational-field/RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md` | ✅ on trunk |
| `docs/architecture/audits/relational-field-reconciliation/00-PROGRAM-SEQUENCE-AND-STANDING-CAUTIONS.md` | ⚠️ **UNTRACKED** in the main checkout; not on trunk, not in any ref |
| `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION_PRE_RATIFICATION_RECONCILIATION_2026-08-10.md` | ⚠️ **UNTRACKED** in the main checkout; a copy exists on branch `docs/relationship-room-governance-custody` (`3ac8fe829`), which is **not an ancestor of trunk** |

⚠️ **Recorded, not fixed:** two of the five named sources are not reachable from trunk. This
is the exact exposure founder ruling ⑥ addresses. Landing them is Gate 2's business, not
this act's.

---

## 3. Ruling → change mapping

**Every** constitutional text change below traces to a named ratified ruling. Nothing else
was changed.

| # | Ratified ruling | Article touched | Change |
|---|---|---|---|
| **①** | Scope of "that room" + where Sanctuary attaches — ⚠️ ruled **NARROWLY**, *diverging from the brief's recommendation to scope broadly*; founder ruling governs | **IV** (append) | Defines a Relationship Room as the member-owned, relationship-specific experiential space keyed to a durable relationship identity. States Sanctuary attaches to relational **persistence, inference, recall and surfacing** — not merely navigation into the room. States it protects the member's relational interiority and does **not** pretend the absent other person consented to or authored the member's private experience. Divergence from the brief is stated on the face of the text. |
| **②** | Article VIII does not pre-authorize MAIA-authored outreach | **VIII** (append) | Preserves MAIA helping someone discern what they feel/mean/need/want to communicate. Encodes the distinction: *"help me discover what I want to say"* belongs; *"write what I should say to this person"* crosses into synthetic participation. States `docs/RELATIONAL_LEDGER_ANTI_FEATURES.md` §7 (no AI-written outreach) **remains controlling until explicitly revisited**. Carries the founder's sentence: *"MAIA witnesses and illuminates the field; it does not become one of its human participants."* |
| **③** | Article IV belonging rule — ratify the principle in precise language | **IV** (append) | When explicit relationship context exists, relational material **must preserve that belonging through persistence and recall**. When belonging is ambiguous, **preserve the ambiguity — never guess merely to achieve attachment.** Marked as an obligation of the article, not a present system property. |
| **④** | The unnumbered Promise is **held out** of ratification (claim discipline) | **Promise** (annotated; ⛔ text unchanged) | Header block above the Promise marks it held out, non-constitutional, proposed member-facing copy. Cites `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`. States unsourced claims must not acquire constitutional authority by proximity. ⛔ The Promise's own 9 lines are byte-unchanged. |
| **⑤** | Extend `RELATIONSHIP_MEMORY_V1.md` §8 portability to Relationship Rooms | **IV** (append) | Member may **carry, inspect, correct, withdraw and where appropriate delete their relational memory**. ⛔ Explicit rider: confers no ownership over the other person's identity or independent data. Placed as a clause under IV (brief ⑤ recommendation) rather than a new article, to avoid renumbering. |
| **⑥** | Trunk reachability is a precondition of the ratifying act | **Header** (replaced) | Status changed from `PROPOSED` to `RULINGS INCORPORATED 2026-08-14 — pending effective ratification on trunk binding`. States explicitly that effective ratification is recorded only *after* trunk placement and commit binding — a separate act. ⛔ Does **not** declare the document ratified or effective. |
| **Founder's note** | ATTUNE → ILLUMINATE → **INVITE** is not a contradiction of "no relationship owes the software a next step" | **V** (append) | An invitation may be *stay here · notice this · say nothing yet · let this remain unresolved · return when something changes.* Principle carried: **MAIA may offer possibility; it must not manufacture obligation.** |
| **RF-R3** | The ratified provenance boundary, in full | **XIII** (new, appended) | Declaration is an **event, not a field** · standing only from an authenticated member gesture · immutable `declared_text` · `relationship_id` required at creation · server-side gesture witness · **promotion structurally unavailable** · **eligibility computed, never cached as authority** (cache permitted as performance only, non-authoritative, reconciled before use) · the four settled rulings (18 entries not retro-eligible and never backdated; `retrieval_consent` FALSE when unanswered, silence creates no consent; OBSERVED in-turn only until RF-R6; dedicated table) · ⛔ no declaration value added to `member_relational_signals.source` · **Release ≠ retraction** · Affirm/Correct/Supersede/Withdraw/Release distinct and never inferred · provenance carried in the utterance. |
| **Required** | Six distinctions preserved as constitutional text, separable and not merged | **II** (append) | Enumerates: member declaration · MAIA observation · inference · unknown/unresolved · permission to retain or retrieve · permission to share or speak. States none may be derived from another; holding ≠ permission to retrieve; retrieve ≠ permission to speak; not knowing ≠ having nothing. |
| **Required** | The general invariant, verbatim in substance | **XIII** | *"No representation of the system may acquire more authority simply by being copied into a more durable or more convenient store."* Scoped explicitly to memory summaries, derived profiles, caches, indexes, embeddings, prompts, reports, database projections, and MAIA's accumulated understanding of a person. |
| **Required** | Anti-laundering stated as a **test**, not a table-name ban | **XIII** | *"If a store permits the assertion to be recovered later as knowledge about the relationship, it is persistence — regardless of whether the implementation calls it telemetry, metadata, analytics, agent state, or memory."* |

---

## 4. Placement decisions (and why they are not redesign)

- **⛔ No renumbering.** Articles I–XII keep their numbers. The ratification brief's own
  reasoning (③) records that shipped code (`enforceArticleIIIConversational`) and three
  governance documents cite articles by number. RF-R3 is therefore **appended as Article
  XIII**, not inserted.
- **Rulings ①, ③, ⑤ all land in Article IV** because each is expressly an Article IV matter
  (①: scope of "that room" in IV; ③: IV's belonging rule; ⑤: brief ⑤ recommends "a clause
  under Article IV rather than a new article").
- **Article XII's soul test** states it tested *"every article above"*. That statement is
  **left untouched and is factually true of I–XII**; Article XIII records on its face that
  XII's test is not restated as having been applied to it. ⚠️ Resolving this differently
  would require either renumbering (rejected above) or new text not traceable to any ratified
  ruling. Recorded, not resolved.

---

## 5. What was deliberately NOT done

| Item | Why not |
|---|---|
| **PR-1, PR-3, PR-5** (pre-ratification reconciliation redlines) | ⛔ Proposed, not ratified. Not among the six rulings. **PR-3 in particular** concerns the severed read seam (FSA RU-4) — the founder's ruling ② as delivered is about **outreach**, not RU-4. RU-4 stays open. |
| **PR-5** — the "29 of 44" vs "29 of 43" discrepancy in Article X | ⛔ Editorial (brief D6). Not traceable to a ratified ruling. Article X untouched. |
| **D7** — the header's claim that II–IV/VIII/IX are "verified accurate" against R3–R7, which the reconciliation overstates | ⛔ Not a ratified ruling. The original sentence is **preserved verbatim**. |
| **Sanctuary as a new numbered Article (PR-4)** | ⛔ The founder ruled ① narrowly and attached Sanctuary to relational persistence/inference/recall/surfacing. Incorporated as an Article IV clause; ⛔ no new numbered article, no renumbering. |
| **The header's citation of `docs/design/reviews/RELATIONSHIP_PAGE_RELATIONAL_EXPERIENCE_AUDIT_2026-08-10.md`**, which is **not on trunk** | ⚠️ Pre-existing text, preserved verbatim. Correcting or removing it is not traceable to a ratified ruling. Recorded here; it is Gate 2's concern (ruling ⑥). |
| **Editing the Promise's own text** | ⛔ Ruling ④ holds it out; it does not authorize rewriting it. Its 9 lines are byte-unchanged. |

---

## 6. Referent verification

Every path newly cited in the Constitution was confirmed to exist at base ref `17bf9d4f3`:

- ✅ `docs/RELATIONAL_LEDGER_ANTI_FEATURES.md`
- ✅ `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`
- ✅ `docs/canon/RATIFICATION_BOUNDARY_PRECEDENT_2026-07-26.md`
- ✅ `docs/specs/RELATIONSHIP_MEMORY_V1.md`
- ✅ `docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md`
- ✅ `docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md`

⚠️ Pre-existing citation **not** on trunk (preserved, not introduced by this act):
`docs/design/reviews/RELATIONSHIP_PAGE_RELATIONAL_EXPERIENCE_AUDIT_2026-08-10.md`.

---

## 7. Authority state after this act

```
DESIGN RULINGS ........................ RATIFIED       (unchanged)
PROVENANCE BOUNDARY ................... RATIFIED       (unchanged)
CROSSWALK ............................. RECORDED       (unchanged)

CONSTITUTIONAL INCORPORATION .......... DONE (this act, on a branch)
CONSTITUTION ON TRUNK ................. PENDING        (Gate 2 — NOT closed here)
TRAFFIC CONTAINMENT WITNESS ........... PENDING        (independent — NOT closed here)

BUILD AUTHORITY ....................... CLOSED         (unchanged)
```

⛔⛔ The three PENDING states are independent and may never collapse into one another. This
act closes **incorporation only**. ⛔ It does not place the Constitution on trunk, does not
satisfy the traffic witness, and does not open build authority.

⛔ **No new founder ruling was required, invented, or implied by this incorporation.**
