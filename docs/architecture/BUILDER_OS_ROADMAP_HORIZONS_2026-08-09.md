# Builder OS (JARVIS) — Five-Horizon Roadmap

**Date**: 2026-08-09 · **Status**: founder-authored synthesis, recorded verbatim in substance.
Percentages are **synthesis, not measured repository metrics**. This document authorizes nothing;
each horizon's work items carry their own rulings.

**Audit chain**: `audits/BUILDER_OS_DISCOVERY_AUDIT_2026-08-09.md` →
`audits/BUILDER_OS_MEMORY_MECHANISM_MAP_2026-08-09.md` →
`audits/BUILDER_OS_CONSOLIDATION_AND_FALSIFICATION_2026-08-09.md` →
`audits/BUILDER_OS_INSTRUMENT_RECONCILIATION_2026-08-09.md`

---

## The permanent outcome test (founder, 2026-08-09 — governs ALL Builder OS work)

> **Does this work increase our ability to build, maintain, improve, or safely extend
> member-facing capability?**
>
> If not, it needs a very strong reason to exist.

Builder OS is **the internal stewardship intelligence of AIN's development ecosystem** — not
developer tooling, and never an architecture project that consumes its own reason for existing.
The guarded failure mode: *"AIN is perfectly governed, but nobody is shipping MAIA improvements."*
The target is not an impressive Builder OS; it is **a larger, more capable AIN ecosystem with less
fragility, less cognitive burden, lower cost, and greater continuity** — with the founder operating
at product direction, human experience, and founder judgment while JARVIS maintains technical and
epistemic continuity beneath.

## Governing correction from the audits

> **JARVIS doesn't primarily need more stuff. It needs closure around the sophisticated stuff it
> already has.**

## The six layers

1. **Orientation** — *Where am I?* (checkout/SHA/trunk relation/dirty state/governance/workspace
   provenance/what changed since last handoff)
2. **Context** — *What do I need to know now?* — durable memory → resolver → retrieval → selective
   context. **Context circulation, not context starvation** (starting context barely predicts
   burden; request accumulation does).
3. **Continuity** — *What has happened before?* — identity → routing → lifecycle → supersession →
   retrieval → provenance → re-witnessing.
4. **Epistemology** — *What may I believe?* — Measurement ⊥ Governance ⊥ Implementation + the
   Witness Jurisdiction Corollary (`docs/canon/WITNESS_JURISDICTION_COROLLARY_2026-08-09.md`).
5. **Governance** — *What may I do?* — principles (canon) → enforced behavior (hooks) →
   verification (instruments) → evidence (records). The 12× enforcement-over-prose law.
6. **Capability continuity** — *Does the whole organism still possess what its parts possess?* —
   the Guard as an immune system for architectural capability, protecting sophistication, never
   normalizing toward the lowest common denominator.

## The five horizons

### Horizon I — Make JARVIS epistemically trustworthy *(CLOSED 2026-08-09)*

| item | state |
|---|---|
| Witness Jurisdiction Corollary | ✅ ratified — `docs/canon/WITNESS_JURISDICTION_COROLLARY_2026-08-09.md` |
| Canonical memory-resolution contract | ✅ ruled + **landed** — `scripts/memory/RESOLUTION_CONTRACT.md`, root routing line, audit docstring; verified no regression (`unresolved` 100→100, `ambiguous` 0) |
| Residual-102 classification (not mass rewrite) | ✅ triaged at producing mechanisms — `audits/MEMORY_RESIDUAL_REFERENCE_TRIAGE_2026-08-09.md` |
| Instrument Registry | ✅ v1 — `docs/ops/INSTRUMENT_REGISTRY_2026-08-09.md` (**23/38 dormant**) |
| Dormant Instrument Failure classification | ✅ recorded as canonical failure mode |
| Workspace-provenance discipline | ✅ `docs/ops/WORKSPACE_PROVENANCE_DISCIPLINE_2026-08-09.md` |
| Generated evidence ⊥ governance records | ✅ audit reports live outside repo + corpus, hash-bound |

**Exit condition met**: JARVIS can now name the workspace, checkout, cache, configuration and
deployed referent behind a reading; knows which instruments exist and which are actually invoked;
and shares one resolution contract across writer, reader and instrument.

⛔ **Horizon I is closed. Do not add further Horizon-I work unless it blocks Closed Loop 1.**
Deferred to their own lanes: residual-102 remediation (A→B→C sequence, unauthorized) · per-instrument
boundary decisions (entry point to Horizon IV) · `.githooks/pre-commit` reconciliation
(security-adjacent, spawned separately).

### Horizon II — Orientation + Continuation
`/orient` (where am I → what governs → what is current → what evidence to trust → what is
unresolved) **without creating a fourth stale current-state document**; `/continue` via the
already-designed `AIN_HANDOFF_RECORD_CONTRACT` (≤3,000-token packet, verify-before-trust).
**Exit**: *a fresh session enters an active project and correctly continues it without manual
reconstruction.*

### Horizon III — Context-control OS
The authorized week-one experiment (`docs/ops/CCA_WEEK_ONE_AUTHORIZATION_2026-08-09.md`) → move
stable behavioral requirements from prose to hooks where evidence warrants → purposeful local-model
routing. **Exit**: *JARVIS actively manages its own context and model expenditure without
sacrificing reasoning quality.*

**Units delivered under Horizon III**

| Unit | Record | State |
|---|---|---|
| Claude concurrency governance + worktree isolation | `docs/architecture/BUILDER_OS_CONCURRENCY_GOVERNANCE_2026-08-09.md` | built + proven (54/54), **not yet exercised under real multi-lane load** |
| Request-rate axis + closed-loop integration | `docs/architecture/BUILDER_OS_RATE_AXIS_AND_LOOP_INTEGRATION_2026-08-09.md` | built + proven (184/184 across 6 suites), **not yet exercised under real multi-lane load** |
| Non-Claude closed-loop proving case (Kimi) | `docs/ops/AIN_DELEGATION_PROVING_CASE_2026-08-09.md` | `NON_CLAUDE_CLOSED_LOOP: PROVEN` — Kimi executed, JARVIS independently verified and integrated (commit `837f20bcf`) |
| Canonical Work Unit reconciliation | `docs/architecture/BUILDER_OS_CANONICAL_WORK_UNIT_2026-08-09.md` | built + proven (37/37; 256/256 full regression) — packet file is now the canonical Work Unit; `ain-delegate.sh`/`session.mjs` unmodified |
| Claude adapter (Claude as governed worker) | `docs/architecture/BUILDER_OS_CLAUDE_ADAPTER_2026-08-09.md` | `CLAUDE_AS_JARVIS_WORKER: PROVEN` (30/30; 286/286 full regression) — Claude executed a real proving case (`multiply.js`, commit `f2218f3da`), JARVIS independently verified and integrated |

**MVJ (Minimum Viable JARVIS) sequence status:** Units 1–6 complete and proven. Both
non-Claude and Claude closed loops are demonstrated end to end — governed packet,
isolated mutation, independent verification, JARVIS-controlled integration, durable
result, release. Conversational Founder Input Resolution — the natural next MVJ step,
now that both worker types are proven — has not been authorized or started.

The concurrency unit was authorized in response to
`docs/ops/CLAUDE_CODE_RAPID_ALLOTMENT_EXHAUSTION_AUDIT_2026-08-09.md`. It governs *how much
Claude runs at once and who owns which worktree*. It deliberately stops **before** model
delegation/routing policy — that remains the next Horizon III step and is **not authorized by
this unit**.

#### Horizon III has TWO independent control dimensions (evidence-forced, 2026-08-09)

The horizon was originally framed around **context weight** alone. That framing is now known
to be incomplete, and the correction is evidence-forced rather than theoretical:

| dimension | question | measured on 2026-08-09 | instrument |
|---|---|---|---|
| **Context weight** | how heavy is each request? | 0.88× baseline cache-read/request — *already controlled* | week-one experiment (`CCA_WEEK_ONE_AUTHORIZATION_2026-08-09.md`) |
| **Request rate / concurrency** | how many requests, from how many lanes, how fast? | **~11.8× baseline**, peak 18 lanes — *uncontrolled* | `scripts/builder/rate.mjs` + `session.mjs` |

`docs/ops/CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md` established that the acute
exhaustion was **rate, not weight**: every per-request metric sat at or below baseline while
request rate and lane count did not. The two dimensions moved in opposite directions on the
same day, so **neither substitutes for the other** and a green reading on one must never be
reported as calm on the other.

⚠️ The earlier context-cost audit is **not superseded** — context re-ingestion remains the
dominant *long-run* cost (86% of 30-day spend). It simply was not the cause of the acute
incident. Both remain live Horizon III work.

### Horizon IV — Capability Continuity Guard *(⛔ design not yet authorized)*
Detect: capability-with-vanished-caller · uninvoked instruments · ungoverned routes ·
provenance-stripped tables · writer-died-reader-survived · semantics-in-one-subsystem-only ·
unreachable features · high-level capability silently degraded to a lower-level substitute.
**Charter constraint (ruled)**: *ensure the complete semantics required by a high-level capability
survive everywhere that capability operates.*

### Horizon V — Self-governing Builder OS *(not rushed)*
orient → retrieve → reason → plan → act → verify → compare against governance → record evidence →
detect degradation → handoff → continue. Graduated autonomy: mechanical corrections may become
automatic; architectural decisions stay reviewable; constitutional changes stay explicitly
governed; ambiguity escalates rather than improvises.

## Next milestone

**Not "JARVIS v1."**

> **JARVIS Closed Loop 1: `/orient → work → verify → record → /continue`** — once that loop works
> reliably across fresh sessions, Builder OS is *operational*, not merely architected.

## The platform-ecology payoff (why this is worth it)

Without Builder OS, each new platform (practitioner environments, member communities, client
platforms, Studio surfaces) adds complexity by **accumulation**. With it, growth moves to
**inheritance**: AIN OS → shared sovereignty / identity / continuity / memory primitives /
governance / verification / MAIA intelligence → per-platform UX, vocabulary, capabilities, and
relationships. "Create a new platform for this community" then decomposes into: which capabilities
apply · what stays hidden · which sovereignty rules follow automatically · what continuity means
there · what must be verified before deploy · what is reused vs genuinely new · and whether the
result has accidentally lost anything important.

## Current state snapshot (synthesis, 2026-08-09)

| dimension | ~ |
|---|---|
| Discovery | ~90% |
| Architecture | ~80% |
| Instrumentation | ~70% |
| Context control | ~50% |
| Orientation/handoff | ~40% |
| Capability continuity | ~30% |
| Self-governance | ~20% |

The intellectual architecture is considerably further along than the operational integration — the
remaining work is **bringing existing pieces under a coherent operating contract**, not invention.
