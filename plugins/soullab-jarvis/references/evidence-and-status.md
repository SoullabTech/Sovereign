# Evidence and status rungs

## The four rungs — never synonyms

```
built       code + schema exist. Zero live callers is still "built".
wired       reachable from a live route/UI path.
surfacing   observed producing rows or output under real traffic.
verified    observed repeatedly, under authenticated member load, with the
            production evidence recorded.
```

*Declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*
Claiming a higher rung than the evidence carries is the characteristic drift of this project.

**The symmetric failure is under-reporting.** Dormant scaffolds get narrative placement while
live infrastructure stays invisible until someone measures it. Any substrate generating
production rows must be named explicitly. Name the *mechanism* (parallel epistemic emission),
not the mythology (emergent consciousness architecture) — metaphor after measurement.

## The instrument that refuses

`scripts/builder/epistemic-guard.mjs` adjudicates whether cited evidence is of a class and
completeness that can carry the *status requested*. It never decides whether a claim is true.

```bash
node scripts/builder/__tests__/epistemic-guard-proof.mjs   # 49 assertions
node scripts/builder/epistemic-guard.mjs adjudicate --claim claim.json
# exit 0 permitted · 1 REFUSED (a verdict, not an error) · 2 could not adjudicate
```

Guards: **G1** canonical-path (a route claim needs a `runtime_route_trace`; comments,
filenames, imports and project memory are typed WEAK and can never carry it) · **G2** edge-proof
(two endpoint proofs do not make an edge) · **G3** telemetry-provenance · **G4** index-liveness ·
**G5** status-promotion (no rung skipped; a status cannot rise on rereading) · **G6**
correction-anatomy · **G7** liveness-scope (`deployed_exercised` vs `in_use_by_members`).

Evidence pinned to a different SHA than the one adjudicated is typed `STALE`, not passed.
`HYPOTHESIS` requires no evidence — the guard governs promotion, not thinking.

Full spec: `docs/ops/JARVIS_EPISTEMIC_GUARDRAILS_2026-08-11.md`.

## Validation commands, and what each actually proves

| Command | Proves | Does NOT prove |
|---|---|---|
| `npm run typecheck` | nothing got **worse** vs `typecheck-baseline.json` | that the codebase typechecks |
| `npm run typecheck:full` | the absolute current diagnostic inventory | — |
| `npm run check:no-supabase` | no Supabase imports/policies introduced | — |
| `npm run preflight` | full sovereignty check + compose config validation | production state |
| `npm run smoke` | the smoke suite passes locally | production state |
| `scripts/pre-deploy-gate.sh colab` | Co-Lab boundaries hold **31/31 · 0 failed · 0 warned** | anything outside those boundaries |

Re-baselining typecheck is a **governed act**: `npm run typecheck:baseline` is a dry run and
refuses to write; recording requires the explicit `-- --accept-current`. Use it to lock in
fixes, never to absorb a new error.
