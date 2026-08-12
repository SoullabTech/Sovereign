# Runtime Witness A0 — Corrections to Static Findings

**The static findings survive. Their interpretation changes.** This record appends runtime evidence; it does not rewrite what static analysis established or why it was believed.

**Referent**: production `minisforum` · image `sha256:7a2289024d2d…` · `GIT_COMMIT=3d1e27348` · DB `maia_consciousness`
**Method**: read-only, `BEGIN READ ONLY` transactions, no traffic generated, no member content, nothing created.

---

## The central reframing

Production, last 30 days, n=622 (`maia_turns.processing_profile`):

| Profile | Count | Share |
|---|---|---|
| **CORE** | 453 | **72.8%** |
| **FAST** | 169 | **27.2%** |
| **DEEP** | **0** | **0%** |

All-time DEEP: **8 rows**, last **2026-06-04**. Corroborated independently by session history (n=4,225) and field_orchestrator (n=3,666).

> **CMC-001 Units 3–6 found real defects in real code, on a path production essentially never traverses.** The rehabilitation must not be organized around DEEP.

---

## C-R1 · The DEEP repair-sequencing constraint — **CONTRADICTED**

**What static analysis established, and why it was believed:** Units 5–7 proved that on DEEP the normal path carries no accumulated continuity, and that failure-triggered regeneration was the only mechanism reaching the model with addenda. The inference — *do not fix the validator first, or you remove MAIA's only continuity delivery on DEEP* — followed correctly from that evidence.

**Runtime evidence:** regeneration has occurred **10 times ever** (0.24%), **all with route `core`**, **none in the last 30 days**, and **zero on DEEP**. Against 8 DEEP executions ever, there are zero DEEP regenerations.

**Corrected claim:** the mechanism exists in code and has **never delivered continuity in production.** The sequencing constraint was true of canonical and false of the running system. It should no longer gate repair ordering.

*The reasoning was sound; the referent was source. This is the runtime-witness loop working as designed.*

## C-R2 · Persisted ≠ spoken ≠ displayed (AIN rewrite) — **DOES NOT OCCUR IN PRODUCTION**

The gate is `AIN_SHAPE_REWRITE === '1' || NODE_ENV !== 'production'`. Verified in the running container: `NODE_ENV=production`, `AIN_SHAPE_REWRITE` unset. **Closed by configuration, not by absence of evidence** — the distinction the three-way classification exists for.

The rewrite sits genuinely post-persistence (~`:3612`) and its trigger would fire often were it open (`menu_mode` true on 7.8% of 7,268 rows). `CONTINUITY-INTEGRITY-FINDING-01` remains valid as a source finding and as a latent risk if that env var is ever set.

## C-R3 · RCN mislabels itself `'DEEP'` — **REAL IN SOURCE, NOT CONTAMINATING DATA**

The hazard is confirmed in the deployed source: `:2860` persists `'RCN'`, `:2870` returns `'DEEP'` for client compatibility. **But `logMaiaTurn` is at `:3352`, downstream of the `:2857` early return** — so an RCN turn can never reach `maia_turns` at all.

Its one write surface, session history, shows **zero RCN across 4,225 exchanges** → `NOT_OBSERVED_WITH_COMPLETE_INSTRUMENTATION`.

**Corollary: the 8 historical DEEP rows are genuine DEEP executions**, not mislabelled RCN.

## C-R4 · Provider identity — **UNRESOLVED, labels untrustworthy**

`deepseek-r1` matches **no configured Ollama model** (all are qwen2.5). `claude-3-sonnet` matches **no configured Claude model**. The only provider-bearing table (`runtime_events`, `fallback_active` on 100% of rows) covers the **route** `sovereign/app/maia/list`, not generation.

Usable only as "Claude was consulted" (135/622 in 30 days). **The Ollama-hardwire claim from Unit 5 is neither confirmed nor refuted.** A label is not evidence of the thing it names until what writes it is established.

---

## The observability map — where production cannot speak

```
stored      → observable
retrieved   → observable
offered     → observable
─────────────────────────── instrumentation ends here
admitted    → NOT OBSERVABLE
assembled   → NOT OBSERVABLE
sent to model → NOT OBSERVABLE
provider    → UNRELIABLE
```

- `injected_count` is **NULL on 100%** of memory transition records.
- `retrievalContextActive` is **absent on all 1,008** recent turns.
- Application logs **did not survive container recreation** — 82 boot lines, nothing prior.
- Caddy logs **errors only**; there is **no successful-request access log anywhere**.

> **Production retrieves and offers continuity, and cannot prove what reaches the model.** That is the same seam CMC-001 circled from Unit 1 — now located on the paths members actually use.

## Post-deploy coverage

Latest row in **every** telemetry table is 2026-08-12 **17:39:45Z**, four hours before the 21:42:40Z deploy. **Zero member turns on the new image.** Every observation above describes the *previous* image. Whether today's SECREM-001 change altered runtime behaviour is **unobserved**, and cannot be observed without traffic.

---

## What this fixes about the roadmap

Not *"fix DEEP and continuity may return."*

> **CORE and FAST are MAIA. Determine what reaches their speaking boundary.**

The next question is precise and unanswered: **when CORE or FAST MAIA speaks, what memory and context was actually in front of the model that generated the response?**
