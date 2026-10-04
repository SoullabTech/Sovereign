# WS-EDITORIAL-SCOPE-01 — Programme Closure / Final Standing

**Date:** 2026-09-21
**Closure branch base:** `65bcb76bb38d4f57e816253fdbec0ea036d6c166`
**Programme:** `WS-EDITORIAL-SCOPE-01`
**Act:** programme closure / final standing only

## I. Closure ruling

`WS-EDITORIAL-SCOPE-01` is **CLOSED**.

The programme has established the Writer's Studio editorial-scope authority boundary sufficiently for production standing.

No further implementation, model-coaxing, scope-law broadening, or additional proof attempt is authorized under this programme.

Any later Writer's Studio work must open as a **separate UX/editorial capability lane** with its own governing question, scope, falsifiers, and evidence.

This closure does **not** erase, upgrade, reinterpret, or relabel any earlier witness result.

## II. Final witness standing

| Gate | Final standing | What it established |
|---|---|---|
| W1 · discussion before proposal | **PASS** | At Touch with immediate wording off, MAIA answered before proposing and no proposal version was admitted. |
| W2 · sequence release | **PASS** | The per-Work immediate-wording release persisted and allowed wording on the first reply when explicitly enabled. |
| W3 · production Touch-size conversational witness | **NO EVIDENCE** | MAIA stayed discussion-only and did not emit an oversized proposal; the deterministic size judge was therefore not reached. |
| W3D · deterministic Touch-size judge witness | **PASS** | Direct running-production invocation proved a lawful small Touch edit passes, an oversized Touch proposal is refused, and the same oversized proposal passes at Open. |
| W4 · paragraph-removal independence and guidance | **PASS** | Paragraph deletion stayed refused while paragraph removal was off, and the writer was told which control to enable. |
| W5 · voice visibility | **PASS** | Voice-intrusion disclosure was visible beside an allowed proposal. |
| W6 · usable editor | **PASS** | Ordinary editorial work could produce, preview, and apply a bounded proposal without over-refusal. |
| Apply-only-locus | **EXACT PASS** | A permitted production revision changed exactly the agreed locus and nothing outside it. |
| Inline Undo | **PASS** | `Undo this change` was visibly available after Apply. |
| Exact restoration | **EXACT PASS** | Visible Undo restored both DOM and fresh server context exactly to the pre-apply manuscript baseline. |

## III. W3 / W3D standing is intentionally asymmetric

The original W3 result remains:

> **W3 — NO EVIDENCE**

That result is correct and must remain unchanged.

Repeated attempts to induce MAIA to violate Touch did not reach the deterministic scope judge because MAIA returned discussion-only behavior. A non-reached boundary is not a pass and not a failure.

W3D answered the separate enforcement question directly against the running production code.

The running production `Touch` law was witnessed as:

- maximum removed fraction: **8%**
- maximum contiguous removed words: **8**
- always-permitted small-edit floor: **8 removed words**

Three synthetic cases were executed against the production `judgeProposalScope()` implementation:

1. **1-word removal at Touch** → allowed.
2. **32-word contiguous removal from a 40-word passage at Touch** → refused as `scope_removes_contiguous_passage`.
3. **The exact same oversized replacement at Open (5)** → allowed.

The running editorial runtime was also witnessed to order the proposal path as:

`judgeProposalScope() → immediate return on refusal → voice checks → persistMaiaEditorialOutcome()`

Therefore an oversized Touch proposal cannot cross into proposal persistence.

The closure relation is:

`Touch + oversized proposal → deterministic refusal → persistence not reached → no proposal version admitted → no manuscript mutation`

This closes the **size-enforcement question** without retroactively converting W3 into a pass.

## IV. Production acceptance standing

The Writer's Studio release-critical behavior was witnessed on the production surface.

Production acceptance established:

- discussion before proposal;
- paragraph-removal authority and writer-facing control guidance;
- preview-before-apply;
- exact-locus application;
- visible inline undo;
- exact restoration in both the rendered manuscript and a fresh server read.

The Apply/Undo production witness ended with the manuscript text exactly restored to its original baseline.

Editorial thread/history records remain as the durable audit trail; no acceptance-witness manuscript text change remains.

## V. Canonical and deployment standing

PR #1427 admitted the Writer's Studio live-witness repair into canonical.

Canonical merge:
`0319940f9dc94a637e6f1b0e9f843c971f6fb0c2`

That exact Writer's Studio target was deployed and witnessed in production with:

- immutable image provenance verified;
- running container identity verified on both `printenv` and `Config.Env`;
- migration `20260921000001_epistemic_join_persistence.sql` applied;
- `/api/health` green;
- `/api/version` naming the deployed commit;
- `/api/ready` returning `ready: true` and `migrationsOk: true`;
- all built-in production smoke checks passing.

Later production/canonical advances were independently checked before subsequent Writer's Studio witnesses. The W3D running-production advance touched deployment-safety/JARVIS infrastructure and did not alter the Writer's Studio/editorial implementation under witness.

## VI. Frozen evidence set

The programme closure incorporates and freezes the standing established by:

- `docs/programme/WS-EDITORIAL-SCOPE-01_AUTHOR_LATITUDE_2026-09-20.md`
- `docs/programme/WS-EDITORIAL-SCOPE-01_LIVE_WITNESS_PROCEDURE_2026-09-20.md`
- `docs/programme/WS-EDITORIAL-SCOPE-01_LIVE_WITNESS_RESULTS_2026-09-21.md`
- PR #1427 canonical reconciliation, production deployment, production acceptance, W3, and W3D witness records
- the running-production deterministic scope-law witness

The evidence set is frozen as historical standing.

No later programme may rewrite these results merely because a new UX or editorial capability is desired.

## VII. Programme law preserved

The programme closes with these laws intact:

1. **The Work remains primary.**
2. **The writer declares editorial latitude; absence never broadens permission.**
3. **Paragraph removal is independently permissioned.**
4. **Discussion and proposal are distinct acts.**
5. **A proposal outside declared latitude is refused before persistence.**
6. **A permitted proposal may change only the agreed locus.**
7. **Apply must remain recoverable through visible Undo.**
8. **Undo must restore the original manuscript exactly.**
9. **A non-reached falsifier is recorded as NO EVIDENCE, never promoted by interpretation.**
10. **Model cooperation is not the enforcement boundary; deterministic law is.**

## VIII. What is not authorized by this closure

This closure does **not** authorize:

- another Writer's Studio scope-law implementation change;
- loosening Touch, Line, Passage, Shape, or Open thresholds;
- changing paragraph-removal semantics;
- replacing discussion-first behavior;
- changing proposal persistence authority;
- altering Undo semantics;
- reopening W3 to continue coaxing MAIA into an oversized proposal;
- folding future UX/editorial work back into `WS-EDITORIAL-SCOPE-01`.

## IX. Next-lane rule

Any further Writer's Studio work begins outside this programme.

A new lane may address, for example:

- editorial conversation UX;
- developmental guidance;
- manuscript navigation;
- proposal presentation;
- author-facing reasoning;
- version/history experience;
- reader-effect hypotheses;
- additional editorial capabilities.

But the new lane must treat `WS-EDITORIAL-SCOPE-01` as **closed inherited law**, not as unfinished implementation work.

## X. Final standing

> **WS-EDITORIAL-SCOPE-01 CLOSED**
> **W1 PASS · W2 PASS · W3 NO EVIDENCE · W3D PASS · W4 PASS · W5 PASS · W6 PASS**
> **APPLY-ONLY-LOCUS EXACT PASS · INLINE UNDO PASS · EXACT RESTORATION PASS**
> **SIZE-ENFORCEMENT QUESTION CLOSED**
> **NO FURTHER IMPLEMENTATION UNDER THIS PROGRAMME**
> **FUTURE WRITER'S STUDIO WORK MUST OPEN AS A SEPARATE UX/EDITORIAL CAPABILITY LANE**
