# Relational Field Design Inquiry — Shared Invocation Brief

**Status:** PROPOSED — NOT RATIFIED. Design research only.
**Opened:** 2026-08-13. **Founder:** Kelly. **Steward:** JARVIS.

## Authority

Governing authorities, all verified to exist on this tree:

| # | Authority | Path |
|---|---|---|
| A1 | R3–R6 design | `docs/design/relational-field/RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md` |
| A2 | Provenance boundary | `docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md` |
| A3 | Crosswalk (retired labels) | A1 §"Crosswalk — retired labels" |
| A4 | Pending Relationship Room Constitution rulings | `docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md` §7 |
| A5 | Constitution itself | `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` |

**You may not alter their meaning, silently reconcile contradictions between them, or treat
agreement among invocations as authority.** Kelly retains founder design authority.

## Current state (asserted by founder, treat as given unless your evidence contradicts it)

- Production remains `22200f967`. **Building is closed.**
- The Relational Field doorway is live; functional Relational Field intelligence is **not built**.
- RF-R3 does not remove containment. It creates the truthful representational capacity under which
  containment can selectively open.
- A declaration is an **event, not a field**. Its standing arises only from an authenticated member
  gesture, preserving the member's exact wording, attached to a relationship at creation.

## Boundaries — absolute, apply to every invocation

Do **not**:

- implement code; change schemas or migrations; open or modify pull requests
- add a `declaration` value to `member_relational_signals.source`
- promote existing entries into declarations
- persist OBSERVED relational assertions in telemetry or metadata
- cache eligibility or currentness as authority
- treat imported language, model inference, observer output, or system classification as member declaration
- write conclusions into A1–A5 or any governing document

You may write **only** your own findings file under `docs/design/relational-field/inquiry/`.

## Evidence discipline

- **Label every statement**: `FACT` (verified, cite file:line or command output) ·
  `INFERENCE` (reasoned from facts, say from what) · `RECOMMENDATION` (proposal, not finding).
- If you cannot establish something, write **`NOT ESTABLISHED`**. That is a completion state, not a failure.
- **Names are not identity.** Verify a file/table/route exists before citing it. Absence from one
  grep is evidence about the grep. Re-derive absence by a second, structurally different method.
- **Representational completion check** before calling any capability real: does a *caller* exist ·
  does the producer *observe* anything · does the value *vary* with what was apprehended?
- If existing code contradicts A1–A5, **surface the contradiction. Do not reconcile it silently.**

## Required output shape

Write your findings to your assigned path. Structure:

1. `## Scope` — the question you were given, and what you did not examine
2. `## Evidence and existing infrastructure` — FACT-labelled, with paths
3. `## Proposed design` — RECOMMENDATION-labelled
4. `## Risks and falsification cases` — what would prove this wrong
5. `## Constitutional conflicts` — collisions with A1–A5 or MAIA canon, named not resolved
6. `## Reuse opportunities` — substrate that already exists and must not be duplicated
7. `## Unresolved founder decisions` — one line each, phrased as a question of principle carrying
   your recommended ruling. Never offer "hold / skip / decide later" as an option.
8. `## Dissent and uncertainty` — where you disagree with the design authority, or with yourself

Header every file: `**PROPOSED — NOT RATIFIED** · invocation <ID> · 2026-08-13`.

## Return to steward

Return **≤400 words**: your file path, your three most load-bearing findings, your unresolved founder
decisions, and anything you marked NOT ESTABLISHED. Do not paste the document back.
