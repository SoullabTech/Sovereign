# Soullab Experience Language — Recovery & Reconciliation

**Date:** 2026-08-10 · **Status:** ⛔ **EVIDENCE. NOT CANON. NOT A CHARTER.**
Read-only recovery pass against the founder mandate of 2026-08-10 ("derive the minimum
canonical Soullab Experience Language"). No code, no schema, no UI, no ratification.

> **This document authors nothing.** It reports what the mandate asked to be created that
> **already exists**, what genuinely **does not**, and two **collisions** that require a
> founder decision before the mandate can be executed as written. It is the input to that
> decision, not the decision.

**Method:** filesystem + source inspection of `docs/canon/`, `docs/design/`, `docs/specs/`,
`tailwind.config.js`, `package.json`, and the shipped Journal and Relationship surfaces.
Every claim below names its artifact. Standing project law honored: *declaration is not
liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*

---

## 1. Headline

The mandate's premise is that Soullab lacks an experience language and each coding session
therefore invents its own aesthetics. **The first half of that premise is false; the second
half is true.** The language exists. Nothing enforces it, nothing remembers approvals, and
no room-level register was ever written. The gap is **enforcement and memory, not
authorship.**

Executing the mandate as written would author a fifth overlapping charter and re-derive a
token layer that already exists in canonical, role-based form.

---

## 2. What the mandate asks for that ALREADY EXISTS

### 2.1 The Experience Charter (mandate §5) — exists four times over

| Artifact | Status | Carries |
|---|---|---|
| `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md` | **ratified canon** (2026-08-05) | the governing law |
| `docs/design/INHABITABLE_ARCHITECTURE.md` | working companion | floor-plan protocol, sovereignty rider, doorway law, **visual-grammar law** |
| `docs/specs/AIN_OS_EXPERIENCE_CONSTITUTION_DRAFT_2026-08-03.md` | ⛔ draft, not operative | 7 principles + Article 8 (conflict/yield) + Article 9 (provenance) |
| `docs/canon/MEMBER_EXPERIENCE_DESIGN_CONSTITUTION_CANDIDATE_2026-07-31.md` | candidate | member-surface principles |
| `docs/canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT.md` | draft | cross-layer |

The mandate's ten proposed principles (I–X) map almost entirely onto material already
written:

| Proposed | Already carried by |
|---|---|
| I. rooms around activities, not entities | Inhabitable Architecture — *"objects do not equal rooms"* |
| II. human expression outranks chrome | visual-grammar law, layer 4 — *"the user's OWN words"* |
| III. complexity available, not imposed | AIN OS Constitution §2.1 — **ruled a consequence of orientation, not a principle** |
| IV. MAIA enters per room purpose | MAIA Oath (no guru stance) + `MAIA_ASK_LAYER.md` |
| V. white space is experience | SOULLAB_THEME "containment before stimulation" |
| VI. controls speak human language | `NOMENCLATURE_AND_WORLD_ALIGNMENT_PRINCIPLE_2026-08-05.md` |
| VII. provenance visible, not administrative | AIN OS Article 9; *"presence has provenance"* |
| VIII. history supports present | — **genuinely new** |
| IX. rooms share materials, not layouts | SOULLAB_THEME §4 *"variation by function, not identity"* |
| X. member knows which room without being told | — **genuinely new** (the inverse brand test) |

**Eight of ten already have a canonical home. Two are new.** Note §III was *explicitly ruled*
to be a consequence rather than a principle — re-listing it as principle III would reopen a
closed decision.

⚠️ Precedent: `AIN_OS_DESIGN_CONSTITUTION_DRAFT_2026-08-03.md` was **deleted the day it was
written**, "to avoid two overlapping drafts." A new charter would be the fifth.

### 2.2 The semantic token layer (mandate §3) — exists, and is already role-based

`docs/canon/SOULLAB_THEME.md` is canonical and defines exactly the structure the mandate
asks to be created — semantic roles, not `beige-200`:

```
Void    → field-void / canvas-deep   cosmic depth, page edges
Field   → field-base / canvas        the room you're in
Surface → surface / elevated         cards, panels, interaction layer
Signal  → accent-primary             meaning, activation, emphasis
```

Backed by `--sl-*` CSS custom properties and a `soullab.*` Tailwind namespace
(`tailwind.config.js`). It already carries the mandate's house/room split:

- *"Domain variance changes the **signal layer** and subtle tinting. **The field stays
  continuous.**"* — this is mandate §3's "same roles, different room interpretation."
- `data-layer="inner"` / `data-layer="outer"` — *"softer surface for MAIA, journal,
  reflection"* vs *"sharper for admin, tools, community."* This is room-level modulation,
  already specified.
- *"Accent color is never decorative."* — this is the mandate's `ember` gesture role.

**Assessment:** the mandate's proposed token list is a rename of an existing canonical
system, not a new one. Introducing `house-ivory` / `house-ink` alongside `--sl-*` would
create a second token vocabulary — the exact fragmentation the mandate exists to prevent.

---

## 3. ⚠️ The derivation base is not what the mandate assumes

The mandate says: *derive tokens from Journal, which has proven the grammar.* The shipped
Journal does not contain that grammar.

**`app/journal/page.tsx`** is 25 lines — a thin wrapper. The room is
**`components/journal/UnifiedJournalView.tsx`** (1,587 lines). Its complete color inventory:

```
2 text-amber-700     2 text-[#A55A22]     2 border-amber-200
2 bg-amber-50        1 text-amber-600     1 text-[#8C4A1B]
1 text-[#6A6154]     1 border-[#A55A22]   1 bg-[#A55A22]
```

Nine usages. **No ivory field. No serif stack. No `--sl-*` tokens.** The only human-facing
copy recoverable is `"Journal"`, `"Find in my journal"`, `"Clear search"`. There is no
*"What is here today?"* arrival line in this file.

The literary ivory/serif surfaces the mandate describes are the **Author Studio phase-b
studies** — `docs/design/author-studio/phase-b/*.html` — which do use `var(--serif)`, an
off-white field (`#FCFCFA`), ember (`#D9705C` / `#A33B2A`) and gold (`#C9A059`).

> **Consequence:** "derive from experientially approved Journal" currently resolves to
> **static HTML design studies for a different room**, not to shipped member-facing code.
> This does not invalidate the mandate — it means the approved reference must be **named
> explicitly** before derivation, or the language will be derived from a mockup and then
> asserted as proven. That is the inflation drift the project already refuses.

**Required from the founder:** name the exact surface(s) that carry the approval. Candidates
are the phase-b studies, an unmerged branch, or a rendered state not in this tree.

---

## 4. ⛔ Collision — the Relationship half of the mandate is gated

Mandate §10 instructs: *apply it first to Journal ↔ Relationships and run both brand tests.*
Three standing artifacts block the Relationships side:

1. **Founder ruling, 2026-08-10**, in `docs/design/reviews/RELATIONSHIP_PAGE_RELATIONAL_EXPERIENCE_AUDIT_2026-08-10.md`:
   > *"I wouldn't start another visual redesign. First repair the relational substrate."*

   With the reason: *"A page cannot be made to feel like a relationship while six layers
   underneath it are describing six different things."*

2. **`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md`** — status **PROPOSED, awaiting founder
   ratification**, and explicitly *"law about what a Relationship Room is, written before
   design resumes."*

3. **`…RELATIONSHIP_ROOM_CONSTITUTION_PRE_RATIFICATION_RECONCILIATION_2026-08-10.md`** —
   classifies ratification as **`R3`: FOUNDER RULING REQUIRED**, blocked on exactly **one**
   narrow scoping decision (§7 D-1, Sanctuary).

**The Relationship Room is one founder decision away from having its constitution.** Running
a brand test on it before that ratification would derive house grammar from a room whose
own law is unsettled.

The **Journal** side carries no such gate and is unblocked.

---

## 5. What the mandate asks for that GENUINELY DOES NOT EXIST

This is the real work, and it is narrower and sharper than the mandate assumed.

| # | Missing | Evidence of absence |
|---|---|---|
| **M1** | **Enforcement of the design canon** | `package.json` carries 20+ `check:*` gates — sovereignty, Supabase, providers, PHI, refusals, inline names. **Zero** enforce SOULLAB_THEME or Inhabitable Architecture. The only design-adjacent gate is `check:dark-text-opacity`. |
| **M2** | **Room character register** | SOULLAB_THEME says variance is "by function" but never enumerates the rooms or their registers. The mandate's §2 table is genuinely new and genuinely needed. |
| **M3** | **Shared interaction primitives** | No `<RoomArrival>`, `<PrimaryGesture>`, `<ProvenanceLabel>`, `<Disclosure>` exist. Arrival/gesture/disclosure/provenance are described in prose across five documents and implemented ad hoc per surface. |
| **M4** | **Golden screenshot registry** | `tests/golden` holds *conversation transcripts*, not screenshots. `golden-states` exists only inside `.claude/worktrees/*`. No visual reference registry exists. |
| **M5** | **Experience Contract in work packets** | No template; no automatic attachment to UI work units. |
| **M6** | **Approval-evidence capture** | Nothing records *"yes, this feels right"* as reusable evidence, nor rejections. Design judgment is re-elicited every session. |

**M1 is the root cause the mandate is actually reaching for.** The canon exists and is good;
it is simply not in the enforcement path, so a session that never reads it ships anyway.
Principles I–X would join the same unenforced shelf.

---

## 6. The corrected shape of the work

Ordered, with gates named:

1. **Founder names the approved reference surfaces** (§3). Blocking — everything downstream
   derives from it.
2. **M2 room register** — authored as an *extension of* `SOULLAB_THEME.md`, not a new token
   vocabulary. Unblocked for Journal, MAIA, Author Studio. **Relationships deferred** to §4.
3. **M1 enforcement gate** — `check:design-canon` in the `check:*` family. This is the
   highest-leverage item and is fully unblocked today.
4. **M3 primitives** — built only from patterns proven in **two** rooms, per the mandate's
   own constraint. Requires (1) and (2) first.
5. **M4/M5/M6** — the JARVIS memory layer. Unblocked, independent of the canon question.
6. **Principles VIII and X** — the two genuinely new ones — proposed as amendments to the
   existing Inhabitable Architecture standard, not as a new charter.
7. **Relationships brand test** — after `RELATIONSHIP_ROOM_CONSTITUTION.md` ratifies.

---

## 7. What this document hands to the founder

Three decisions, none of which this document makes:

- **D-1.** Which surfaces carry the Journal approval? (§3 — blocking)
- **D-2.** Does the Experience Language extend `SOULLAB_THEME.md` + Inhabitable Architecture,
  or supersede them? Extension is recommended; supersession requires retiring four artifacts.
- **D-3.** Does the Relationships brand test wait for constitutional ratification (§4), or
  does the founder override the 2026-08-10 no-redesign ruling for this narrow purpose?

---

*Recovery pass only. No artifact modified. No status advanced.*
