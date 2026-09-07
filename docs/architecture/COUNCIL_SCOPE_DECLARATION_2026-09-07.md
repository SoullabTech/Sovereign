# Council Scope — Isolation Declared at the Boundary

**Date**: 2026-09-07
**Status**: Truth-in-UI correction. Shipped as copy only. No behavioral change.
**Occasion**: A beta tester in the decision portal asked whether the Council takes
into consideration all conversations with MAIA.
**Extension (same day)**: `/studio/changes` holds the same boundary and is covered here.

## Finding — DECISION-SCOPED INPUT

It does not — and did not before this change. Verified against the live path:

`DecisionCouncilView` → `POST /api/studio/decisions/[id]/consult` →
`consultDecisionCouncil()` → `lib/ain/consultation.ts`.

Everything the council receives is decision-scoped:

| Input | Scope |
|---|---|
| title · context · stakes · time pressure · emotional state · situation type | fields authored into that decision |
| client inquiry · field signals · practitioner observations | `WHERE decision_id = $1` |
| prior tensions · recommendation · insights · session notes | earlier iterations of the same decision |
| council charters (Navigator, Guardian, Regulator, Mythopoet, Skeptic, Integrator) | static files on disk |

Neither `lib/studio/leadership/decisionCouncil.ts` nor `lib/ain/consultation.ts`
imports conversational memory, memory atoms, semantic memory, or session history.
The MAIA Mentor panel on a decision is likewise decision-scoped
(`decision_experiences WHERE decision_id`, LIMIT 5). Field signals exist only where
someone explicitly POSTed them; nothing auto-derives them from a MAIA session.

## The actual defect

The boundary was **correct by implementation and invisible to the member**. Isolation
existed because no bridge was ever wired, not because a boundary was declared. A member
had no way to know whether a deliberative surface was quietly reading their private
history — so every member has to ask, and the honest answer arrives only if they do.

> **Isolation by implementation must be declared at the invocation boundary.**

A boundary a member cannot see is not yet a boundary they can rely on. Stated more
broadly — and the form that outlives Council:

> **A member should know what an intelligence is allowed to know before they invoke it.**

## Finding — CHANGE-SCOPED INPUT

`/studio/changes` holds the same consent boundary, by the same construction.
Verified path:

```
POST /api/studio/changes/[id]/consult
  → consultChangeCouncil()
  → buildChangeQuestion()
  → AIN consult()
```

Inputs are limited to the current Change and explicitly attached, Change-scoped
material:

| Input | Scope |
|---|---|
| title · description · change type · urgency · emotional state | fields authored into that change |
| optional I Ching context (hexagram, relating hexagram, changing lines) | cast against that change |
| client inquiry · field signals · practitioner observations | `WHERE change_id = $1` |
| prior iterations · session notes · existing notes | earlier rounds of the same change |
| optional protocol council bias | explicitly selected |
| static AIN framing material | files on disk |

`lib/studio/changes/changeCouncil.ts` imports only the AIN consult layer, its own
types, change-type config, and the I Ching hexagram lookup — no conversational
memory, memory atom, semantic memory, or ambient MAIA session loader appears
anywhere in the path, including the shared `lib/ain/consultation.ts` beneath both
councils.

## Change

`lib/studio/leadership/councilScope.ts` — one source, subject-aware:

```ts
councilScopeNotice('decision')
councilScopeNotice('change')
```

> The Council reads only this **decision** and material explicitly attached to it. It does not access your MAIA conversations.

> The Council reads only this **change** and material explicitly attached to it. It does not access your MAIA conversations.

Single source so the semantic rule stays centralized; subject-aware so the central
source is never semantically tied to one Studio object and never states of a Change
something true only of a Decision. **If either council's inputs ever change, this
sentence must change with them — a stale notice here is a false statement made to a
member.**

The phrase is *"material explicitly attached to it"*, not *"what you add to it"*: a
client inquiry response can be Council input on either object without the practitioner
having authored it. The wider phrase is the exact one, and still excludes everything
outside the object.

Rendered adjacent to every user-visible `Consult Council` invocation, visible **before**
the council is invoked.

**Decision invocation points (4 sites, 6 buttons):**

- `components/maia/decisions/DecisionCreate.tsx` — member sheet, create + consult
- `components/maia/decisions/DecisionCouncilView.tsx` — first consultation; continue round
- `app/studio/decisions/new/page.tsx` — create + consult
- `app/studio/decisions/[id]/page.tsx` — first consultation (draft only); continue round

**Change invocation points (2 files, 4 sites):**

- `app/studio/changes/new/page.tsx` — create + consult from Context; create + consult from I Ching
- `app/studio/changes/[id]/page.tsx` — first consultation (`status === 'naming'`); continue round

## Explicitly not done

- MAIA memory is **not** wired into either council
- no context-import mechanism
- no preference, toggle, or setting
- consultation inputs unchanged (Decision and Change alike)
- evidence bundle unchanged
- no schema change
- no copy implying future cross-surface access

## Held, separate

The tester's question is a feature request in disguise: *"does it consider all my
conversations?"* usually means *"I would like it to."* Any such gesture — **"bring
selected MAIA context into this decision"** — is a **separate design problem and stays
separate**. Its only sovereign shape would be a member act, per decision, with visible
provenance on each surfaced item — never a default-on loader. Ambient recall into a
deliberation surface is exactly where memory becomes leverage. Nothing here authorizes it.

## Remaining open

The change council's open question from the first pass is now closed: it was audited,
found to hold the same boundary, and now declares it. No other `Consult Council` surface
exists in the codebase.

Other surfaces that invoke an intelligence on a member's behalf have not been audited
against this law. That the law generalizes is not a claim that it has been applied.

**Lifted (2026-09-07, draft only):** the principle extracted here is drafted as a candidate
reusable instrument in
[`docs/canon/EPISTEMIC_SCOPE_TRANSPARENCY_CANDIDATE_2026-09-07.md`](../canon/EPISTEMIC_SCOPE_TRANSPARENCY_CANDIDATE_2026-09-07.md),
where this correction is **Specimen 01**. That document is **NOT RATIFIED** and governs nothing;
it awaits founder ruling. This record remains the account of the Council fix, not of the law.
