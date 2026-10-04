# AIN Recursive Development — Current-State Audit

**Status:** Analysis / audit — **documentation only, no mutation.** Feeds `RECURSIVE_DEVELOPMENT_CANDIDATE_2026-07-26.md` (Cat-1 HELD). Produced 2026-07-26 (Kelly ↔ Claude). **Stops for Founder Ruling** — authorizes no code, schema, workflow, gate, or runtime change.

**Central constitutional rule (the frame):** *AIN may discover and formulate candidates for its own improvement, but it may never authorize, implement, merge, deploy, or ratify its own evolution.*

## Method & scope caveat

Evidence gathered by four read-only agents that **traced routes/callers and migrations — not filenames or comments.** Audited the working branch `chore/e2e-layout-invariants`; reconciled against `clean-main-no-secrets @ ec38a283c`. **One known branch delta:** `OPTIMIZATION_TOOLING_GOVERNANCE.md` + the constitutional-map addition to `PROVIDER_GOVERNANCE.md` are **live on `clean-main` (PR #754 merged)** though absent on the working branch — an agent correctly reported them "absent on branch." All other findings are branch-agnostic. Confidence is high where a caller/migration is cited; items marked *requires verification* were not traced to a conclusion.

## Headline

The central rule **is already canon**, and **most lifecycle objects already exist**. This is an inverse-drift correction to any "mostly conceptual" read: the honest gap is narrow and specific — a *connective lineage spine*, a *governance-practice-domain instance*, and *reconciliation of existing automated generators with the signals-not-patterns boundary.*

---

## PRESENT AND WORKING

**Constitutional anchor (the rule is already law — cite, don't re-derive):**
- **Invariant 15 — Authored Adaptation** (`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`): permits the human-directed *open* loop ("the engine never rewrites the Domain Definition — only practitioners can"); prohibits closed-loop runtime self-optimization. This *is* the central rule.
- **Constitutional Direction of Authority** initiation boundary (`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`): *"…may never arise from system initiative alone."* Invariant 8 (all layers suggest; only the Conductor decides), Invariant 16 (Recognition Integrity), Invariant 1 (Authority Return).

**Enforced governance gates (the reusable "system surfaces, human rules" primitives):**
- `.github/workflows/covenant-gates.yml` + `auto-labeler.yml` — live; constitutional validation only, explicitly disclaims merge authority (GitHub owns it).
- Provider guard: `scripts/check-no-openai*` + `scripts/provider-policy.json` (preflight + CI + pre-commit) — code pattern: the system cannot add a surface without a human policy edit.

**Lifecycle objects already persisted (separate tables — the good pattern):**
- **Observation Primitive** L1–L2 — `20260701000003_observation_primitive.sql`, `lib/observation/observationService.ts` (live signals→observations).
- **Studio Review Lens** — `20260314000002_pending_review_candidates.sql` (candidate→analyze→save, full loop wired) — closest working analog to *surface-candidate → human-review → human-save*.
- **Pattern Ledger + pattern_evidence** — `lib/patterns/*` (15 files; splits candidate from evidence).
- **Improvement Hypotheses** — `20260311000001_accumulating_hypotheses.sql` via `learningSystemOrchestrator`.
- **Decision Trace** — `20260113000002_decision_trace_clean.sql` ← `lib/sovereign/maiaService.ts`.
- **Founder review persistence** — `20260409000002_founder_pattern_reviews.sql`, `…signal_reviews.sql` (ruling-by-authorized-human analog).
- **System Research Ledger** — `system_research_ledger` (cron-driven findings/directives; retrospective analog).

**Evidence / provenance / monitoring instruments (content-free or member-marked):**
- **Substrate monitor** — `20260524000001_runtime_events.sql` ← `substrateObservability.recordRuntimeTurn`; admin surface `app/api/admin/maia/substrate/route.ts` (admin-gated, content-free).
- **Corpus Callosum** — `agent_runs` / `integration_passes` (live per turn).
- **Provenance chain** — `GIT_COMMIT` build-args (Dockerfile ← compose ← `deploy-production.sh`), `/api/version`, five S5 `*_provenance` migrations.
- **Episodic (member-marked)** — `app/api/sovereign/episodes/mark/route.ts` + "Keep this moment" gesture (wired; **zero rows**).
- **atoms `is_breakthrough`** — `20260524000002_…breakthrough.sql`, member-marked write path only.
- **Field Lab / tester gate** — surface visibility only; **never read in interpretation pipelines**.

**Deploy lane:** `deploy-production.sh`, `pre-deploy-gate.sh` (provenance / Co-Lab 31·31 / disk), `deploy-lock.sh`, `DEPLOY_LANE_TOKEN` tripwire, `deploy-tag.sh`.

**Human review ritual:** `docs/witness/MAIA_WITNESS_REVIEW_PROTOCOL.md` — weekly human review of "the platform's becoming" — *already performs the human-Signals function this lane proposes.*

## PRESENT BUT INCOMPLETE
- **Observation Primitive Layer 3 `recognitions`** — schema only, **0 writers** (authoring UI "later").
- **Interpretive Ledger** — `interpretiveLedger.ts`; member view/annotate live, but `promoteToLedger`/`loadLedgerForRouting` = **0 upstream callers** (promote path not wired into generation).
- **`hypothesis_test_runs`** — table exists, **0 callers** (a verification-run substrate, built-not-wired).
- **Episodic member-marked** — fully wired, **zero marked rows** ("wired, not surfacing").

## DOCUMENTED BUT NOT BUILT
- **Six-category typology** — process doc (`STATE_AND_ROADMAP_2026-05-24.md §8`); used in Witness Review Q7.
- **Developmental Publishing System** — candidate doc; quote-candidate substrate exists, but its **witness ledger has no table**.
- **Optimization Tooling Governance** — canon on `clean-main` (#754): governs future tooling; a doc, not code.
- **This lane's candidate** — `RECURSIVE_DEVELOPMENT_CANDIDATE_2026-07-26.md`.

## EXPERIMENTAL OR HELD
- **Recursive Development candidate** (Cat-1 HELD).
- **Relational Developmental Engine** (`…CANDIDATE_2026-07-04.md`, Cat-1) — *different thing*; source of the "engine" name collision.
- **Legacy `EpisodicMemoryService.storeEpisode`** — system-authored significance write, **0 callers** (dormant). Notably a *system-authored-write* pattern the new doctrine would forbid.

## ABSENT (must build, if authorized)
1. **Witness ledger** for Developmental Publishing — no table (memory's "MISSING" = confirmed true).
2. **A connective lineage spine** — no single object links Observation → Evidence → Signal → Pattern Candidate → Improvement Candidate → Review → Ruling → Workstream → Implementation Ref → Verification Run → Outcome. Each stage lives in a *different* table with **no shared lineage/FK**.
3. **A governance/architecture-practice domain instance** — every existing instance above is *member/relational-facing*. There is no corpus of the platform's own governance cycles (Provider Governance, Optimization Tooling Governance, etc.).

## CONSTITUTIONAL RISKS
1. ⭐ **Existing automated generators may already sit on the wrong side of "signals not patterns."** `ImprovementHypothesisGenerator`, `PatternDetectionService` (15 files), `accumulating_hypotheses`, legacy `detectBreakthrough` **generate patterns/hypotheses automatically.** The new doctrine says automation ends at signals; humans author patterns. **Requires verification + Founder ruling:** are these gated as non-authoritative *offers* (Invariant 8 — suggest only, Conductor decides), or do they feed generation as de-facto findings? The new doctrine may retroactively constrain live code. *(Not asserting a violation — flagging an unverified tension.)* **→ RESOLVED 2026-07-26:** investigated (`RECURSIVE_DEVELOPMENT_RISK1_SIGNALS_VS_PATTERNS_2026-07-26.md`) and ruled (*lex specialis*, `RECURSIVE_DEVELOPMENT_CANDIDATE_2026-07-26.md` §Constitutional Ruling). Service 1 = constitutionally ahead but **not defective** (documentation now, no retroactive judgment); Service 2 = **separate Recognition-Integrity lane** (this audit must not be used as evidence for/against the doctrine); Service 3 = clean exemplar. No implementation authorized.
2. **Legacy system-authored episodic write** (`storeEpisode`, 0 callers) — if ever wired, breaches the member-marked doctrine. Recommend: keep dormant; rule on retirement.
3. **Any new system-authored pattern/improvement collection = net-new silent evidence collection** unless it is *human-authored* or routes through the content-free, admin-gated `runtime_events`/`deriveStatus`. Member-marked episodic/breakthrough + tester "not in interpretation pipelines" boundaries must hold.
4. **Naming can smuggle authority** — e.g. "Constitutional Review" vs the covenant "Constitutional Gate" (see below).
5. ⚠️ **Incidental (non-constitutional, flagged not fixed):** duplicate `pattern_ledger` `CREATE TABLE` across `20260204100001` and `20260315120000` — migration-integrity concern; migrations force ≥ class-b.

## TERMINOLOGY COLLISIONS
| Proposed term | Already means | Verdict |
|---|---|---|
| **Engine** | Relational Developmental Engine | avoid (already flagged) |
| **Ledger / Candidate Ledger** | Release Ledger; Interpretive Ledger (`lib/types/interpretive-ledger.ts`) | overloaded — qualify or avoid |
| **Observation / Candidate** | `ObservationCandidate`/`NormalizedObservation` code types; "CANDIDATE" = doc-status label | overloaded |
| **Witness / Witness Room** | Witness Review Protocol — *already does the Signals function* | **reuse it; do not mint a rival** |
| **Room** | Session Room (canonical member-facing primitive) | do not overload |
| **Pattern / Pattern Room** | `PATTERN_PRIMITIVE.md` canon | overloaded |
| **Reflection** | member-facing `ReflectionForms.ts` | overloaded |
| **Constitutional Review** | covenant "Constitutional Gate" | rename to avoid authority confusion |
| **Evidence** | "Canon Freeze + Evidence Sprint"; Air Realm Evidence Model | established — reuse consistently |
| **Ruling** | Founder red-line rulings | safe |

## RECOMMENDED FIRST ARCHITECTURAL SLICE

Consistent with **Practice → Corpus → Assistance** and the reuse map — *not* an engine, *not* automated detection, *not* member data:

**A human-authored corpus of governance/architecture cycles** (the six seed cases), with these design choices deferred to your ruling:

- **Fork A (recommended): a standalone, human-authored governance-cycle record** in the governance domain. Lowest constitutional surface; no member-data entanglement; the corpus *is* the artifact. Reuse **Witness Review Protocol** as the human Signals ritual that feeds it, **covenant-gates / founder-review** as the Ruling gate, and the **provenance chain** as the Verification link.
- **Fork B (defer, likely never for member data): a connective lineage layer** threading the *existing* member/relational objects (observations, pattern_ledger, founder_pattern_reviews, runtime_events) into one traceable cycle. Higher risk — scope-creep + member-content entanglement — and would first require resolving Constitutional Risk #1.

Recommendation: **Fork A first.** The governance corpus is a different domain from the existing member-facing substrate, carries near-zero constitutional surface, and directly serves the "prove the practice exists" goal.

## Required Founder decisions (before any build)
1. **Reconcile existing auto-generators** (`ImprovementHypothesisGenerator`/`PatternDetectionService`) with signals-not-patterns — verify gating, then rule.
2. **First-slice fork:** A (standalone governance-cycle record) vs B (lineage over existing objects). *(Recommend A.)*
3. **Name** — avoid Engine / Room / Ledger / Witness-Room overload.
4. **Reuse Witness Review Protocol** as the Signals surface? (Recommended.)
5. **Duplicate `pattern_ledger` migration** — governed fix, or leave.
6. **Steward-phase gate** — genuine need vs builder reflex — settle affirmatively before any build.

**End of audit. No further action taken. Awaiting Founder Ruling.**
