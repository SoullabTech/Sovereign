# WS-EDITORIAL-SCOPE-01 — Programme Closure / Final Standing

**Status:** CLOSED  
**Closure date:** 2026-09-21  
**Closure base:** `bcd4debfed1285d2ff14829db7f117ffaff05f11`

## Closure ruling

`WS-EDITORIAL-SCOPE-01` is closed.

This programme established and witnessed the author-controlled editorial-scope law for Writer's Studio:

- discussion precedes proposal unless the writer explicitly releases that sequence;
- editing latitude is author-declared and defaults protective;
- whole-paragraph removal requires its own explicit permission;
- proposal size is measured deterministically against the frozen author locus;
- oversized proposals are refused before persistence;
- a permitted revision changes only the agreed locus;
- applied revisions remain visibly and durably undoable;
- undo restores the author's prior manuscript text exactly.

No further Writer's Studio implementation change is authorized under `WS-EDITORIAL-SCOPE-01`.

Any later Writer's Studio UX, pedagogy, editorial capability, presentation, navigation, or model-behavior work must open under a separately named programme/lane. This closure programme may be cited as authority; it must not be silently reopened.

## Frozen evidence set

Canonical programme procedure:

- `docs/programme/WS-EDITORIAL-SCOPE-01_LIVE_WITNESS_PROCEDURE_2026-09-20.md`

Canonical live-witness result record:

- `docs/programme/WS-EDITORIAL-SCOPE-01_LIVE_WITNESS_RESULTS_2026-09-21.md`

Canonical implementation/admission lineage:

- PR #1427 — Writer's Studio editorial live-witness closure
- merged Writer's Studio target: `0319940f9dc94a637e6f1b0e9f843c971f6fb0c2`

Production acceptance subsequently witnessed the deployed Writer's Studio behavior on the exact production surface. Later production advanced to `8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14`; the intervening delta touched deployment-safety/JARVIS infrastructure and did not alter Writer's Studio/editorial-scope code. W3 and W3D therefore exercised the same admitted editorial-scope implementation.

## Final witness standing

| Witness | Final standing | Evidence meaning |
|---|---|---|
| W1 · discussion before proposal | **PASS** | Production fresh passage at Touch with immediate wording OFF returned a MAIA reply and no proposal. |
| W2 · sequence release | **PASS** | Live manuscript witness showed the per-Work release persists and permits first-reply wording. |
| W3 · conversational Touch-size backstop | **NO EVIDENCE** | Production MAIA stayed discussion-only even when explicitly asked for an oversized replacement; the deterministic size judge was not reached. |
| W3D · deterministic Touch-size judge | **PASS** | Running production code directly refused an oversized Touch proposal while allowing a one-word Touch edit and the same oversized replacement at Open. |
| W4 · paragraph independence | **PASS** | Production refused paragraph deletion with paragraph removal OFF, named the control, and told the writer how to enable it. |
| W5 · voice notice | **PASS** | Live manuscript witness rendered unfamiliar-word disclosure beside an allowed proposal. |
| W6 · usable editor | **PASS** | Live manuscript witness produced a proportionate proposal at broader latitude; production corroborated the complete preview/apply/undo path. |
| Apply scope | **EXACT PASS** | Production resulting section exactly equaled the independently constructed baseline-with-only-selected-locus-replaced body. |
| Inline Undo | **PASS** | Production displayed an enabled `Undo this change` control after Apply. |
| Undo restoration | **EXACT PASS** | Visible Undo restored both DOM and fresh server context exactly to the saved baseline. |

## W3 / W3D interpretation

The original W3 standing remains **NO EVIDENCE** and is not retroactively promoted to a pass.

That is intentional.

W3 asked whether a real MAIA turn would emit an oversized proposal that could exercise the Touch backstop. MAIA did not: she stayed discussion-only.

W3D separately answered the actual enforcement question without asking MAIA to violate her instructions.

Directly against the running production implementation:

- Touch allows a maximum contiguous removal of 8 words;
- a one-word edit passed;
- a synthetic 32-word contiguous cut in a 40-word locus was refused as `scope_removes_contiguous_passage`;
- the identical oversized replacement passed at Open (5);
- the runtime returns immediately on a failed scope verdict before `persistMaiaEditorialOutcome()`.

Therefore:

`Touch + oversized proposal -> deterministic refusal -> persistence not reached -> no proposal version admitted -> no manuscript mutation`

The enforcement question is closed even though the conversational falsifier remained unspent.

## Production closure evidence

Writer's Studio production deployment for the admitted target was completed and independently witnessed:

- running identity verified through both container `printenv` and `Config.Env`;
- database migration `20260921000001_epistemic_join_persistence.sql` applied;
- `/api/health` green;
- `/api/version` identified the deployed target;
- `/api/ready` returned `ready: true`;
- built-in production smoke suite passed.

Production Writer's Studio acceptance then established:

- W1 production PASS;
- W4 production PASS;
- exact-locus Apply PASS;
- visible inline Undo PASS;
- exact DOM restoration PASS;
- exact fresh-server restoration PASS.

The production acceptance witness left no manuscript-text change behind. Durable editorial/history records remain as the audit trail.

## Frozen laws

The following are standing programme law at closure:

1. **The Work remains primary.**
2. **Discussion is not proposal authority.** Proposal authority is separately released by the writer.
3. **Absence of permission is never permission.**
4. **Paragraph removal is independently governed.**
5. **Editorial latitude is deterministic law, not prompt courtesy.**
6. **Rejected proposal wording is not partially salvaged or persisted.**
7. **A permitted application changes only the agreed locus.**
8. **Apply must remain reversibly witnessed.**
9. **Undo restores the prior author text exactly.**
10. **A model's good behavior does not substitute for deterministic enforcement.**

## Programme boundary after closure

This programme is not the container for future Writer's Studio improvements.

Future work such as:

- manuscript-first layout refinement;
- developmental/editorial pedagogy;
- richer MAIA reasoning display;
- dialectical discussion;
- version-history UX;
- voice-note workflows;
- reader-effect hypotheses;
- broader developmental lenses;
- navigation or visual redesign;
- new model behavior beyond the admitted scope law;

must open in a separately named programme with its own authority, falsifiers, witness procedure, and closure.

`WS-EDITORIAL-SCOPE-01` may be referenced as a dependency. It is not to be reopened by incremental feature work.

## Final standing

> **WS-EDITORIAL-SCOPE-01 — CLOSED**  
> **AUTHOR SCOPE AUTHORITY ESTABLISHED**  
> **PRODUCTION WITNESSED**  
> **SIZE BACKSTOP DETERMINISTICALLY PROVEN**  
> **APPLY / UNDO EXACTLY WITNESSED**  
> **NO FURTHER IMPLEMENTATION AUTHORIZED UNDER THIS PROGRAMME**
