# WS-EDITORIAL-SCOPE-01 · PROGRAMME CLOSURE / FINAL STANDING · 2026-09-21

**Closure act only. No implementation change is authorized or carried here.**

## I. Programme purpose

`WS-EDITORIAL-SCOPE-01` was opened after a reproduced editorial-authority defect in which MAIA could offer a replacement that exceeded the writer's intended degree of editing.

The programme established and witnessed four bounded laws:

1. **Change-scope** — the writer's editing latitude bounds how much one proposal may remove or recast.
2. **Read-scope** — context MAIA may read is structurally distinct from the exact locus she may replace.
3. **Voice visibility** — vocabulary MAIA introduces from outside the nearby author sample is made visible while the writer is deciding.
4. **Sequence** — at Touch (1), discussion precedes wording unless the writer explicitly releases that order per Work.

A separate paragraph-removal permission remains independent of editing latitude.

## II. Canonical evidence frozen by this closure

The following programme records are frozen as the documentary basis:

- `docs/programme/WS-EDITORIAL-SCOPE-01_AUTHOR_LATITUDE_2026-09-20.md`
- `docs/programme/WS-EDITORIAL-SCOPE-01_LIVE_WITNESS_PROCEDURE_2026-09-20.md`
- `docs/programme/WS-EDITORIAL-SCOPE-01_LIVE_WITNESS_RESULTS_2026-09-21.md`

Implementation admitted through PR #1427 was merged to canonical and subsequently deployed to production.

The production acceptance witness established the release-critical behaviors on a real production manuscript, with the manuscript text restored exactly after the witness.

## III. Final witness standing

| Check | Final standing | Meaning |
|---|---|---|
| W1 · sequence | **PASS** | At Touch with immediate wording off, MAIA replied without proposing wording. |
| W2 · sequence release | **PASS** | The writer's override released the sequence gate and persisted per Work. |
| W3 · conversational Touch-size witness | **NO EVIDENCE** | MAIA stayed discussion-only; the deterministic size judge was not reached. |
| W3D · deterministic Touch-size judge | **PASS** | Direct production-code witness proved an oversized Touch proposal is refused before persistence. |
| W4 · paragraph independence | **PASS** | Maximum latitude did not imply paragraph-removal permission; MAIA named the disabled control and told the writer how to enable it. |
| W5 · voice visibility | **PASS** | Unfamiliar vocabulary was surfaced beside the proposal while the writer was deciding. |
| W6 · usable editor | **PASS** | A proportionate proposal could be previewed and applied. |
| Apply exact-locus | **EXACT PASS** | The applied section equalled independently computed `before[:start] + proposal + before[end:]`. |
| Inline Undo | **PASS** | The visible inline Undo control appeared and was usable. |
| Exact restoration | **EXACT PASS** | DOM and fresh server context both returned exactly to the saved pre-apply baseline. |

### W3 / W3D distinction

This closure deliberately preserves:

> **W3 = NO EVIDENCE**

W3 is not retroactively promoted to a pass. MAIA did not emit the oversized Touch proposal required to exercise the judge through the ordinary conversational path.

The separate W3D act established the enforcement question directly against the running production code:

- Touch (1) control: a one-word removal passed.
- A 32-word contiguous removal from a 40-word synthetic passage was refused as `scope_removes_contiguous_passage`.
- The identical oversized candidate passed at Open (5).
- Runtime ordering proved the scope-refusal return occurs before `persistMaiaEditorialOutcome()`.

Therefore:

`Touch (1) + oversized proposal → refused → persistence not reached → no proposal version admitted → no manuscript mutation`

The enforcement question is closed without claiming a conversational observation that did not occur.

## IV. Production standing frozen by this closure

The Writer's Studio target admitted through PR #1427 was deployed and independently verified in production.

Production evidence included:

- immutable running SHA verification through both `printenv GIT_COMMIT` and container `Config.Env`;
- successful application of the epistemic-join migration included in that deployment;
- `/api/health` green;
- `/api/version` identifying the deployed commit;
- `/api/ready` returning `ready: true` with migrations ready;
- all built-in post-deploy smoke checks passing;
- production W1, W4, Apply-only-locus, visible Undo, and exact restoration witnesses passing.

Production later advanced for unrelated deployment-safety / JARVIS work. The later delta did not alter Writer's Studio/editorial scope code used by the W3D witness.

## V. What this programme establishes

This programme may now conclude:

> The writer's declared editorial scope is enforced before proposal persistence; paragraph removal remains an independent writer-granted permission; Touch sequence order is writer-controlled; unfamiliar vocabulary is disclosed while deciding; permitted revisions apply only to the agreed locus; and an applied revision can be visibly undone to the exact prior manuscript text.

The programme also establishes that the deterministic Touch-size backstop holds even when MAIA itself declines to produce an oversized Touch proposal.

## VI. What this programme does not establish

Closure does **not** claim:

- that MAIA's suggestions are good;
- that vocabulary visibility is the same thing as preserving literary voice;
- that the numerical latitude thresholds are uniquely correct;
- that the whole Work should be the voice sample;
- that developmental observation is yet the primary unit of editorial work;
- that the separate observation-handoff defect is repaired;
- that collapsed teaching/explanation affordances are sufficient UX;
- that future editorial capabilities belong inside this scope programme.

Those are separate questions and require separate programme authority.

## VII. Closure ruling

> **WS-EDITORIAL-SCOPE-01 · CLOSED**

Freeze the evidence above.

Do not add further implementation, remediation, witness expansion, UX redesign, or new editorial capability under `WS-EDITORIAL-SCOPE-01`.

Any further Writer's Studio work must open under a separate UX/editorial capability lane with its own purpose, boundaries, falsifiers, and evidence.

**Final standing: SCOPE-AUTHORITY ESTABLISHED · PRODUCTION-WITNESSED · DETERMINISTIC TOUCH BACKSTOP PROVEN · ORIGINAL W3 PRESERVED AS NO EVIDENCE · PROGRAMME CLOSED.**
