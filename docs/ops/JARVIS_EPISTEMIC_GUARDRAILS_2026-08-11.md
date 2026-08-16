# JARVIS EPISTEMIC GUARDRAILS — enforcement unit (2026-08-11)

**Status:** built + proved locally. **NOT wired into any hook, gate, or CI path** — see §5.
**Doctrine source:** `feedback_jarvis_epistemology_learning_loop` (founder, 2026-08-11) ·
`project_maia_canonical_route_telemetry_correction` · `feedback_liveness_vocabulary_ruling` (2026-08-09) ·
`docs/architecture/JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md` §7 (taxonomy named, detection unbuilt).

**What changed:** the recognition rules were ratified and unenforced — every historical instance was
caught by a directed investigation, never by a running check. There is now an executable instrument
that **refuses** a claim whose evidence cannot carry the status requested.

**What did not change:** nothing ratifies itself. Correction → doctrine promotion is candidate-only,
by directive. The guard never decides whether an assertion is *true* — only whether the cited
evidence is of a class and completeness that can carry the *status requested*.

---

## 1. Artifacts

| File | Role |
|---|---|
| `scripts/builder/epistemic-guard.mjs` | the instrument — `adjudicate` · `transition` · `correction` · `scan` · `statuses` |
| `scripts/builder/__tests__/epistemic-guard-proof.mjs` | 49 assertions; the 2026-08-11 canonical-route mistake is the primary regression case |
| `.ain/epistemic-ledger.jsonl` (default, `--ledger` to override) | every status transition, **refusals included** |

```bash
node scripts/builder/__tests__/epistemic-guard-proof.mjs     # 49 passed · 0 failed
node scripts/builder/epistemic-guard.mjs adjudicate --claim claim.json
```

Exit codes: `0` permitted · `1` **refused (a verdict, not an error)** · `2` could not adjudicate.

## 2. Enforcement points

| Guard | Fires when | Refuses unless |
|---|---|---|
| **G1 CANONICAL-PATH** | claim declares `subject.kind: route\|path\|execution_path`, **or** asserts canonical/live/traffic *and names a concrete route* | a probative `runtime_route_trace{surface, request, runtime_route}` is cited. Comments, filenames, imports, architecture docs, project memory and worker claims are typed **WEAK** and can never carry it alone |
| **G2 EDGE-PROOF** | claim declares an `edge`, or says X governs/reaches/propagates-to Y | `edge_trace{from,to,mechanism,discriminating_observation}` whose endpoints **are** the claimed endpoints. Two `endpoint_proof`s explicitly do not suffice |
| **G3 TELEMETRY-PROVENANCE** | any `telemetry_label` evidence | `label_assignment_proof{call_sites_enumerated, sets_dimension_explicitly}`. If the dimension defaults at the site that matters, the aggregate describes the **default**, not the subject → NON_PROBATIVE |
| **G4 INDEX-LIVENESS** | retrieval/semantic/vector claim asserted operational | `indexed_row_coverage` with **non-zero** indexed rows **and** one `known_retrieval` |
| **G5 STATUS-PROMOTION** | every `transition` | target-status evidence requirements met; no rung skipped; **new evidence** vs. the prior ledger row (a status cannot rise on rereading); `STALE→PROVEN` re-derived at the current SHA; `SUPERSEDED` terminal |
| **G6 CORRECTION-ANATOMY** | `correction` | all seven rungs present; `ratified: true` refused |
| **G7 LIVENESS-SCOPE** | assertion says live/operational/in use | `liveness_scope` names `deployed_exercised` vs `in_use_by_members`; the latter needs a production observation of member rows |

Cross-cutting: evidence pinned to a **different SHA** than the one adjudicated is typed `STALE`, not passed.
`HYPOTHESIS` requires no evidence — the guard governs promotion, not thinking.

**Interruption behavior (§7 of the directive):** a refusal prints `⛔ Evidence insufficient to promote this
claim.`, then per-guard `why` + `required:` the discriminating test, and **exits 1**. A caller cannot proceed
by reading prose past a logged uncertainty.

## 3. False-positive / false-negative risks (measured where measurable)

**False positives**
- **`scan` is the weak instrument.** Measured on this repo: **128 findings across 58 of 298 files** in
  `docs/architecture` + `docs/ops`; inspection of the first sample shows most are prose ("should a ruling
  reach…", route inventory lines). It is therefore **advisory and non-blocking by default**; `--strict`
  exists but is not recommended as a gate. Treat it as triage that nominates claims for `adjudicate`.
- **G7 on quoted or historical text** — a document *reporting* an old unqualified "is live" is refused the
  same as one asserting it. Mitigation: adjudicate claims, not narrations.
- **SHA staleness** — evidence legitimately taken at the deployed SHA is flagged when adjudicated on a
  dev checkout. Mitigation: pass `--sha` explicitly for production claims.
- **G2's verb list** ("therefore", "feeds", "drives") over-triggers on undeclared claims; the cost is one
  explicit `subject.kind` or `edge` field.

**False negatives (the ones that matter more)**
- **G1 needs a route token in an undeclared claim.** "The oracle surface is canonical" (no `/api/…`,
  no "route"/"endpoint") is **not** guarded. This was a deliberate trade after the tightening pass —
  without it, every sentence containing "live" demanded a route trace. **A claim about path identity that
  names no path must declare `subject.kind`.**
- **The guard cannot see claims never written as claim records.** Nothing forces an agent to submit one;
  that is the wiring decision in §5, not a property of the instrument.
- **Evidence fields are self-declared.** `runtime_route_trace{surface, request, runtime_route}` is refused
  when *absent*, never when *fabricated*. This checks form and class, not veracity — a worker that invents
  a trace passes. Structural mitigation would be attaching `run-check.mjs` results as evidence.
- **G4 does not verify that the cited corpus is the one the live path reads.**

## 4. Regression coverage

The primary case is today's mistake, encoded verbatim in the proof:

| Assertion | Expected |
|---|---|
| the original claim (code comment + project memory + `agent_runs` aggregate) at `PROVEN` | **REFUSED**, G1 |
| the `agent_runs` aggregate without a label-assignment proof | **NON_PROBATIVE** |
| the same aggregate *with* proof that `originRoute` defaults at `maiaService.ts:3489` | still **NON_PROBATIVE**, reason names `:3489` |
| the corrected `/list` claim with a real `surface → request → runtime route` trace | **PERMITTED** |
| that same evidence adjudicated at a different SHA | **STALE** |

Plus: endpoints-are-not-an-edge (4 assertions), zero-row index (5), liveness scope (3), silent promotion
and rung-skipping (8), correction anatomy + candidate-only doctrine (7), interruption behavior (6), scan (4).

## 5. Founder decisions needed

1. **Wiring.** The instrument is inert until something calls it. Options: (a) leave it manual/JARVIS-invoked;
   (b) add an npm alias; (c) add a `Stop`/`PreToolUse` hook that adjudicates claim records; (d) make
   `scan --strict` a docs gate — **not recommended**, see the 128-finding measurement. *No wiring was done in
   this unit.* Nothing was added to `package.json` or `.claude/settings.json`.
2. **G7 LIVENESS-SCOPE is beyond the directive's seven behaviors.** It implements the 2026-08-09 founder
   ruling directly. Keep, or drop to reduce refusal volume?
3. **Ledger location and custody.** Default `.ain/epistemic-ledger.jsonl` is untracked and per-checkout —
   so claims adjudicated in one worktree are invisible to another, and G5's "new evidence" check cannot see
   history it does not hold. Committed, per-checkout, or shared?
4. **Doctrine ratification** stays refused (`--ratify` exits 1) until separately authorized, as directed.
5. **Memory.** No memory file was written for this unit. If the instrument should be discoverable to future
   sessions, the entry belongs in `index_method_and_evidence.md`, not the root.

*This record makes no claim that the guardrails are in use. Per the vocabulary ruling: **built + proved
locally, not wired, not exercised in any lane.***
