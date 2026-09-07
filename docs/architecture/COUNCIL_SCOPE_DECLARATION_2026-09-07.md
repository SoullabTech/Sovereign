# Council Scope — Isolation Declared at the Boundary

**Date**: 2026-09-07
**Status**: Truth-in-UI correction. Shipped as copy only. No behavioral change.
**Occasion**: A beta tester in the decision portal asked whether the Council takes
into consideration all conversations with MAIA.

## Finding

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

> **Isolation by implementation should become isolation declared at the boundary.**

A boundary a member cannot see is not yet a boundary they can rely on.

## Change

`lib/studio/leadership/councilScope.ts` — single source, `COUNCIL_SCOPE_NOTICE`:

> The Council reads only this decision and what you add to it. It does not access your MAIA conversations.

Rendered adjacent to every `Consult Council` invocation point, visible **before** the
council is invoked:

- `components/maia/decisions/DecisionCreate.tsx` (member sheet, create + consult)
- `components/maia/decisions/DecisionCouncilView.tsx` (first consultation; continue form)
- `app/studio/decisions/new/page.tsx`
- `app/studio/decisions/[id]/page.tsx` (first consultation; continue form)

Single source so the declaration cannot drift between surfaces. **If the council's
inputs ever change, this string must change with them — a stale notice here is a false
statement made to a member.**

The wording is deliberately "this decision and what you add to it" rather than "this
decision only": it correctly includes notes, signals, observations, inquiry responses,
and prior rounds without implying anything broader.

## Explicitly not done

- MAIA memory is **not** wired into the council
- no context-import mechanism
- no preference, toggle, or setting
- consultation inputs unchanged
- no schema change
- no copy implying future cross-surface access

## Held, separate

The tester's question is a feature request in disguise: *"does it consider all my
conversations?"* usually means *"I would like it to."* Any such gesture — **"bring
selected MAIA context into this decision"** — is a **separate design problem and stays
separate**. Its only sovereign shape would be a member act, per decision, with visible
provenance on each surfaced item — never a default-on loader. Ambient recall into a
deliberation surface is exactly where memory becomes leverage. Nothing here authorizes it.

## Out of scope

The change council (`/studio/changes`, `lib/studio/changes/changeCouncil.ts`) has its own
`Consult Council` surfaces and was **not** audited or altered by this pass. Whether the
same declaration is owed there is an open question, not a finding.
