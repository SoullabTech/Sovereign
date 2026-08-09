# AIN SYSTEM REHABILITATION MAP

**Created:** 2026-08-09 · **Populated:** 2026-08-09 (from two evidence sweeps over the 2026-07-16 → 2026-08-09 audit/ruling corpus) · **Status:** LIVING — the single coordination surface for the rehabilitation phase
**Authority:** NONE of its own. This map is coordination infrastructure under
`docs/governance/AIN_SYSTEM_REHABILITATION_DIRECTIVE_2026-08-09.md`. Every row
points at the ruling/audit that owns its reasoning. **A row that explains *why*
instead of citing *where the why lives* has failed review** (directive §9b).
**Never** treat a map entry as evidence; open the cited document. Dispositions
marked **(proposed)** require a founder act before they are dispositions at all.

---

## How to read this map

**Row shape** (directive §9b):
`CAPABILITY → canonical substrate → authoritative ruling/audit → current lifecycle state → defect/blocker → disposition → verification criterion`

**Lifecycle vocabulary** (never collapse):
`implemented ≠ available ≠ reachable ≠ selected ≠ exercised ≠ verified ≠ sustained`

**Proof ladder** (directive §6) — notation names the highest rung with evidence and where the capability stopped becoming real, e.g. `Exists ✓ · Connected ✗`:
`Exists → Correct → Secure → Connected → Reachable → Exercised → Observable → Sustained`

**Dispositions:** PRESERVE · RECONNECT · REPAIR · RECONCILE · CONSOLIDATE · COMPLETE · DEPRECATE · BUILD (last resort) · HOLD

**Ordering is binding** (directive §5): Layer 0 → 1 → 2 → 3 → 4 → 5. One bounded rehabilitation unit at a time; evidence returned before crossing a layer boundary.

## Standing constraints (read before touching any row)

- **Ruling 2 (practitioner publishing) is HELD** — recorded across four 2026-08-09 evidence docs (`docs/design/practitioner-portal/IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md`, `STUDIO_AUTHORITY_PROPAGATION_TRACE_2026-08-09.md` et al.). No row may presume it.
- **D9 is the only BLOCKING docket item** (client research recruitment authority; blocks Walk B) — `docs/governance/FOUNDER_DECISION_DOCKET_2026-07-29.md`, `PROJECT_ORIENTATION.md`.
- **D1 ruled → Option A**: calibrate on Now What? first; House Pass 2 does not open until then.
- Nearly every source document carries an explicit **no-implementation banner**. The map inherits every one of them; a disposition here never overrides a banner there.
- The North Star Hierarchy is **in effect but PROPOSED** for the constitution (`PROJECT_ORIENTATION.md`); its incorporation is a separate founder act.

---

## Layer 0 — Constitutional reconciliation

*Propagate rulings that already exist: ruling → documents → candidate architectures → implementation assumptions → tests → runtime.*

> ⭐⭐⭐ **LAYER 0 STATUS — reconciled 2026-08-09.** Propagation through **documents** is complete;
> propagation through **runtime** was never Layer 0's to do. Six rows were checked against their
> own evidence: **4 were stale** (recording work as outstanding that the founder had already
> closed, or that measurement showed was already true) and **1 was mis-dispositioned**.
>
> ⛔⛔ **The mis-disposition is the finding worth carrying.** Dual Authority sat at **RECONCILE** —
> a disposition that says *this lane can close it*. It cannot. It resolves into **7 open
> constitutional questions carried to the founder** (`AUTHORITY_SUBSTRATE_MAP_2026-08-09.md` §E).
> A coordination surface that dispositions a founder decision as reconciliation work will, given
> enough sessions, produce an implementation that answered it by building. ⭐ Corrected to **HOLD**.
>
> ⭐ This is the *ruled ≠ satisfied* distinction from
> [`RULING_1_PROPAGATION_COMPLETION_RECORD_2026-08-09.md`](../design/practitioner-portal/RULING_1_PROPAGATION_COMPLETION_RECORD_2026-08-09.md)
> §8a, appearing one level up — **in the map itself**. ⛔ Layer 0 closing does **not** mean the
> system conforms: `relationship_spaces` holds **0 rows**, **zero** routes consult it, and
> **11 routes remain unresolved** under the standing hold. ⛔ Layer 0 complete ≠ Layer 1 begun.

| Capability / ruling | Authority | Lifecycle | Defect / blocker | Disposition | Verification criterion |
|---|---|---|---|---|---|
| **Founder Ruling 1 — Commitment Authority** (practitioner-authored record confers no authority) | `docs/design/practitioner-portal/FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md` (RATIFIED; supersedes candidate `PRACTITIONER_PUBLISHING_CONSTITUTIONAL_RULINGS_2026-08-06.md` §Ruling 1) | Ruled ✓ · **Propagated ✓ — CLOSED by founder act 2026-08-09** (`RULING_1_PROPAGATION_COMPLETION_RECORD_2026-08-09.md` §8a #2; resweep of the 30-document corpus found zero remaining contradictions) | ⛔ **Document propagation is closed; the system does NOT thereby conform.** 17 routes still derive from `practitioner_clients`+`member_id`; **zero** consult `relationship_spaces`, which holds **0 rows**. Runtime conformance is Layer 1/4 work, not Layer 0 | **PRESERVE** (Layer 0 complete) · runtime conformance tracked in Layers 1 & 4 | ⭐ *Ruled ≠ satisfied.* Layer 0 criterion **met**: no live document instructs an act Ruling 1 prohibits. Runtime criterion (no route deriving relational authority from a practitioner-authored record) remains **unmet** and is not this row's to close |
| **Dual Authority** (ownership = "whose record"; authority = "what entitles me to act") | `FOUNDER_RULING_AUTHORED_MATERIAL_DUAL_AUTHORITY_2026-08-09.md` (RATIFIED) + `AUTHORITY_SUBSTRATE_MAP_2026-08-09.md` (evidence) | Ruled ✓ · Propagated ✗ — ⛔ **blocked on founder acts, not on work** | 10 `unresolved-rule` routes (§B) resolve into **7 open constitutional questions carried to the founder** (§E) — e.g. *what authorizes reading material the member owns* (`clients/[id]/patterns`), *is encounter participation an independent authority form*, *may a team surface aggregate person-bearing rows*. ⛔ No amount of reconciliation work closes these | **HOLD** (founder act required) — ⚠️ *was RECONCILE; corrected 2026-08-09, that disposition implied this lane could close it* | Founder rules the 7 §E questions; **only then** does every route in the substrate map carry a resolved substrate classification |
| **Identity-to-Authority Bridge** (practitioner profile = professional role of a governed member, not a separate identity) | `FOUNDER_RULING_IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md` (RATIFIED) | Ruled ✓ · **Classification closed ✓** (`STUDIO_AUTHORITY_PATH_CLASSIFICATION_COMPLETION_2026-08-09.md` §7) · Remedy ✗ | ✅ Inference gap closed: the **76-route** Studio authority surface is now classified **by reading, not by inference**. The founder's objection was upheld — of the 47, **at least 29** reach a person or governed member, invisible from route source alone. ⛔ Residue: **11 unresolved** routes joined to the standing hold; **still zero routes consult `relationship_spaces`**; Ruling 2 held | **PRESERVE** (classification complete) · remedy **HOLD** pending Ruling 2 + the §E questions above | Layer 0 criterion **met** — classification rests on join-aware evidence, not source-absence inference. ⛔ No repair was made or proposed |
| **R-Q1 rejected / R-Q1a ratified**; §8.4 = critical path, gates any My Coaching work | `docs/design/now-what/Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md` · `RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md` | Ruled ✓ | None — gate must simply be honored | **PRESERVE** | No My Coaching work lands before the §8.4 gate |
| **R-Q1e — enrollment** (separate governed relation between a constituted commitment and a practitioner program; practitioner offers, member's explicit act activates; consent stays granular) | `docs/design/now-what/Q1E_ENROLLMENT_DECISION_INSTRUMENT_2026-08-09.md` §6 (RULED 2026-08-09; ⛔ no implementation authorized) | Ruled ✓ · **Quarantine verified ✓** (measured 2026-08-09) | `academy_enrollments` (rooted in `practitioner_clients`) constitutionally nonconforming → **quarantine, do not migrate**. ⭐ **Measured:** the only references anywhere in the tree are inside its own defining migration `database/migrations/20260116000002_academy_paths.sql` (table + 4 indexes + 1 FK from `academy_progress` + a COMMENT). **Zero `.ts`/`.tsx` references. No service, no route, no loader reads or writes it** — it is inert substrate, not a live authority path | **PRESERVE** (quarantine holds by measurement) — ⚠️ *was RECONCILE; no reconciliation act was needed, the condition was already true* | ⭐ Criterion **met**: no code path treats `academy_enrollments` as an authority substrate. ⛔ Re-measure before any enrollment implementation; ⛔ the ruling forbids migrating it into the enrollment relation |
| **Superseded candidates surviving in documents/assumptions** | Directive §5 Layer 0; supersession chains named in the rulings above | **Marks present ✓** (verified 2026-08-09) | ✅ The 08-06 candidate set carries explicit supersession blocks: `PRACTITIONER_PUBLISHING_CONSTITUTIONAL_RULINGS_2026-08-06.md` (⛔ SUPERSEDED 2026-08-09 at §Ruling 1, the *"never becomes one by population"* phrase, and *"not ruled here"*); `THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md` (own supersession ledger); `AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md` correctly still reads **PROPOSED — not ratified**, per founder call #1 (⛔ a candidate may reference the ratified clause, never become a second canonical home for it) | **PRESERVE** — ⚠️ *was RECONCILE; the marks were already in place* | ⭐ Criterion **met** for the 08-06 set. ⛔ Standing obligation, not a one-time act: every new supersession must carry its pointer at the moment it is superseded |
| **Outcome-Neutral Construction** (construction constraint on design artifacts) | `docs/canon/OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md` (RATIFIED 08-09) + adversarial test (evidence) | Ruled ✓ | None | **PRESERVE** | Applied to every rehabilitation design artifact |
| **Memory Ecology & Completeness ruling** (governs Layer 2 assessment/recovery) | `docs/canon/MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md` (RATIFIED; notes the "Lost Capability Recovery Audit" it was issued against **does not exist**) | Ruled ✓ | Phantom-referent correction already recorded in the ruling | **PRESERVE** | Layer 2 rows below conform to its five liveness states |
| **Governance lifecycle chain** (L1 affirmed; L2 C1–C4 ruled, closed; L3 closed) | `docs/governance/LIFECYCLE_*_2026-07-29.md` set | Ruled ✓ · **Header repaired ✓** 2026-08-09 | ✅ Closed. C1's header read `OPEN — awaiting founder ruling` while the **same file** carried the ruling at §RULING — *NECESSARY PROPERTY, AFFIRMED by Kelly Nezat 2026-07-29T18:54:35Z*, durable `78d9fb388`, and its own *Standing state* table already said `AFFIRMED`. Header now agrees with the act recorded in the document; ⛔ nothing was decided by the edit | **PRESERVE** (repair applied) | ⭐ Criterion **met**: file headers match ruled state. C3 remains `OPEN — decision fork`, correctly |
| **North Star Hierarchy constitutionalization** | `PROJECT_ORIENTATION.md` (in effect; PROPOSED for Sovereignty Invariants) | Proposed | Ratification is a separate founder act | **HOLD** | Founder act recorded |
| **Open docket items D2–D8** | `docs/governance/FOUNDER_DECISION_DOCKET_2026-07-29.md` | Awaiting ruling | Founder queue; D6 explicitly forbids pre-ruling fixes | **HOLD** | Rulings recorded in the docket |

## Layer 1 — Security, identity, authority and consent

*Five axes: Identity · Ownership · Relationship/Participation · Consent · Confidentiality. Authority stays act-scoped (`Actor → Authority substrate → Subject → Act → Object → Recipient`). No generic mega-authorizer (directive §5).*

| Capability | Substrate | Authority | Lifecycle | Defect / blocker | Disposition | Verification criterion |
|---|---|---|---|---|---|---|
| **Self-scoped caller identity** (caller-controlled `clientId`/`memberId` routes) | `lib/auth/selfScopedIdentity.ts` (`requireSelfScopedMember`), 14 route files / 27 handlers | `docs/security/API_AUTHENTICATION_BOUNDARY_AUDIT_2026-08-09.md` (10 routes, anonymous-reachable) · `docs/security/STEP2_CALLER_IDENTITY_REPAIR_2026-08-09.md` | Exists ✓ · Correct ✓ (branch) · **Secure ✗ in production** — repair is branch-only | Production still vulnerable | **REPAIR** (complete: merge → deploy → verify) | Anonymous + cross-member requests against all audited routes rejected **in production**; pinned tests |
| **Session team scoping** (distinct from the above) | `lib/team/sessionTeamScope.ts` (#899) | Step-2 repair record (same doc distinguishes them) | Exists ✓ · deployed ✗ | Branch-only | **REPAIR** (complete) | Team-scope tests green in production |
| **Honest deletion** | `app/api/sovereignty/delete-my-memory/route.ts` | `docs/architecture/audits/AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md` (sharpest defect) | Exists ✓ · Correct ✗ | Returns `success: true` when backing service unavailable — false completion on a sovereignty endpoint | **REPAIR** | Unavailable service → explicit error; test pinned alongside the existing 23-test suite |
| **Act-scoped authority (Relationship/Participation axis)** | Six observed idioms + act vocabulary (`author-about · read-about · assign-to · disclose-to · send-to · act-on`) | `AUTHORITY_SUBSTRATE_MAP_2026-08-09.md` · `BOUNDARY_CROSSING_ACTS_TRACE_2026-08-09.md` (⛔ not five mandatory checks; universal `relationship_spaces` gate rejected as ontology-by-patch) | Designed ✓ · Implemented partially | **Ruling 2 HELD** | **COMPLETE** (proposed; sequenced after Ruling 2) | Every boundary-crossing act names its authority substrate; no mega-authorizer introduced |
| **Practitioner inference containment** | Read-path closures at `f5c5b7ab9` | `docs/architecture/PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md` (ruling EXECUTED; ⛔ not the authority model) | Exists ✓ · deployed ✗ | Not merged, not deployed | **REPAIR** (complete) | Containment verified against production |
| **Sanctuary-blind recording surfaces** (D6: 4 of 5) | — | Docket D6 (⛔ do not fix ahead of ruling) | Reported ✓ | Awaiting ruling | **HOLD** | D6 ruled, then re-mapped |
| **Credential exposure** | 9 live-format Anthropic keys, 8 in world-readable files | `docs/ops/CREDENTIAL_REMEDIATION_2026-08-09.md` | — | Keys rotated? (doc records exposure, not rotation) | **REPAIR** | All exposed keys rotated + files permission-fixed; verified |

## Layer 2 — Memory ecology

*Inventory → provenance repair → forgetting semantics → reader/composition architecture → activation. NOT new memory tables. Governed reader; no inference laundered into canonical memory. Governed by `docs/canon/MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md`.*

**Layer-level acceptance (binding, founder — directive §10):** Layer 2 completes only when the **relational continuity test** passes against production-equivalent paths: *met over many sessions → misunderstood → corrected → correction retained → deep with context intact → wisdom drawn appropriately → met again weeks later, without confusing old / inferred / private / external material with the member's current truth.* Per-row criteria below are necessary, not sufficient. Target is **felt continuity**, not recall quantity.

| Capability | Substrate | Authority | Lifecycle | Defect / blocker | Disposition | Verification criterion |
|---|---|---|---|---|---|---|
| **Relational memory links** | `memory_links` (`database/migrations/20251231_memory_architecture_enhancements.sql:67`) + `lib/memory/stores/MemoryLinksStore.ts`; intended readers `app/api/memory/patterns/[patternId]/evidence/route.ts`, `lib/consciousness/PatternReflectionService.ts` | `docs/architecture/audits/DEEP_MEMORY_RELATIONAL_CONTINUITY_AUDIT_2026-08-09.md` Finding #1 (**"Do not build it"**) | Exists ✓ · **Connected ✗** (0 importers, 0 rows) | No caller was ever wired | **RECONNECT** (proposed — audit is evidence-for-a-ruling) | First governed reader consumes rows written from a live path; row counts observable |
| **Relational history** | `member_relationships` + `relationship_entries` (1,157 entries / 43 relationships; rupture·repair·threshold first-class) | Same audit (live 4 months, never framed as memory — **inverse drift**) | Exists ✓ … Exercised ✓ · framed/composed ✗ | Not part of any memory composition; unnamed as memory | **PRESERVE + RECONNECT** (into governed reader) | Named in the memory inventory; readable by the governed reader without inference-laundering |
| **Memory-use spine** | `conversation_memory_uses` (72,168 production rows, live write path) | Same audit (misclassified as retrieval debug telemetry) | Exists ✓ … Observable ✓ · recognized ✗ | Misclassification | **RECONNECT** (reclassify + read) | Appears in the memory inventory as a first-class substrate with a defined reader |
| **COGOS interpretive ledger / corrigibility** | 4 tables (0 rows incl. `ledger_member_annotations`), typed modules, member routes | `AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md` · `CORRIGIBILITY_ACTIVATION_TRACE_2026-08-09.md` (built→wired→live→**deleted as undisclosed collateral** in `d7cea280d`) · `DURABLE_CORRIGIBILITY_DESIGN_BRIEF_2026-08-09.md` (⛔ design only — recurrence = evidence, only a member act confers authority) | Existed-live → deleted; substrate Exists ✓ · Connected ✗ | Implementation **not authorized**; live-route corrigibility = one prompt sentence | **RECONNECT — HOLD until founder authorizes the design brief** | Member correction supersedes historical evidence in routing; `cleared_by_member` path exercised end-to-end |
| **Memory selection policy** (`LIMIT 8` / hidden ORDER BY authority) | Active route `app/api/sovereign/app/maia/list/route.ts` | `docs/governance/MEMORY_SELECTION_PHILOSOPHY_RULING_INSTRUMENT_2026-08-04.md` (binding sequence: philosophy → observable → adjust) · `docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md` | Exists ✓ · Governed ✗ | Awaiting founder ruling on philosophy | **HOLD** (then COMPLETE per instrument) | Selection philosophy declared; selection observable; only then retrieval adjusted |
| **Memory drift detector** | `scripts/memory/audit-memory.py` (`npm run memory:audit`) | `BUILDER_OS_CONSOLIDATION_AND_FALSIFICATION_2026-08-09.md` (detects the dominant defect by name; **never run**) | Exists ✓ · **Exercised ✗** | Never executed | **RECONNECT** (run; then schedule) | First run recorded; recurring execution = a §7 guard (path to **Sustained**) |
| **Obsidian vault as memory substrate** | Export adapters, `ExportType` union | `docs/architecture/AIN_OBSIDIAN_ARCHITECTURE_AUDIT_2026-08-09.md` (file repository, not sovereign memory; wrong ontology in principle) | Exists ✓ · Correct ✗ (for the memory claim) | Adapters accumulating around wrong center of gravity | **DEPRECATE (proposed)** — as a memory-substrate claim, not as file export | No component treats the vault as a memory substrate; claim discipline applied |
| **Prompt-shaped convenience types leaking into projections** | `MemoryAtomSnapshot` (`lib/maia/memoryAtomsLoader.ts:126-151` — drops `memory_scope`, `source_id`, `updated_at`) | `docs/architecture/CONVENIENCE_REPRESENTATION_HAZARD_2026-08-09.md` (⛔ no remediation authorized) | Hazard named ✓ | Would have exported client-scope Keep as `private` | **HOLD** (guard candidate: projection inputs must not reuse prompt-shaped types) | Guard exists; hazard cannot recur silently |
| **Thin continuity substrate** | 142 atoms · 115 episodes · 7 member-marked · 87 members | `AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md` §continuity | Exists ✓ · Exercised (thin) | Volume, not architecture | **PRESERVE** | Tracked; no inflation of thin use into liveness claims |

## Layer 3 — House rehabilitation

*Immediate gestures · My world · Places to work. Steward entitlement at thresholds; no interior paywall maze. Gate: D1 (Now What? calibrates first).*

| Capability | Substrate | Authority | Lifecycle | Defect / blocker | Disposition | Verification criterion |
|---|---|---|---|---|---|---|
| **House itself** | `docs/canon/THE_HOUSE.md` (canon; rooms as enduring questions) · `lib/navigation/houseDestinations.ts` + test · **no `app/house` route** | `docs/product/AIN_OS_ENTRY_ARCHITECTURE_2026-08-03.md` (design, no build authority) · D1 ruling · `docs/design/INHABITABLE_ARCHITECTURE.md` | Canon ✓ · Implemented ✗ | D1 gate: Now What? first | **COMPLETE** (after gate) | Experiential floor plan agreed before components; acceptance visual per Inhabitable Architecture |
| **Relationships in House** ("My world") | `member_relationships`/`relationship_entries` (live, member-owned — see Layer 2) | Deep-memory audit; directive §5 Layer 3 ("can probably be surfaced quickly — canonical member route exists") | Exists ✓ · Exercised ✓ · **House-Reachable ✗** | No House doorway | **RECONNECT** | Member reaches their relationships from House without Studio detour |
| **Reflections / Decisions in House** | Traces already scoped (`docs/design/now-what/` 08-05 layer; Decisions/Changes split ruling) | Directive §5 Layer 3; `NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md` (ontology RATIFIED; consolidation ⛔ not authorized) | Scoped ✓ · Implemented ✗ | Consolidation implementation not authorized | **COMPLETE** (within ratified ontology; proposed) | Rooms conform to the 4-noun + 1-verb grammar |
| **MAIA presence across the House** | `MaiaPresenceContext` — designed, **never mounted** | `docs/architecture/MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md` (members leave MAIA to use every feature; four parallel "MAIAs") + **Ruling 2 (2026-07-17): only one MAIA** | Exists ✓ · **Connected ✗** | Never mounted; posture-channel prerequisite for room conversions (route-enforced memory-write suppression) | **RECONNECT** (posture channel first) | Mounted; one MAIA identity across rooms; no cross-context memory writes |
| **Studio threshold entitlement** (Steward → enter; others → offering + invitation) | Studio access runtime | `docs/architecture/STUDIO_ACCESS_AUDIT_2026-07-16.md` (**Ruling:** intentionally limited; authored language correct, **runtime behavior wrong**) | Ruled ✓ · Correct ✗ | Runtime contradicts ruling; directive forbids interior paywall maze | **REPAIR** | Runtime matches ruling: threshold entitlement, no interior paywalls |

## Layer 4 — Studio rehabilitation

*Only after House ownership is clear (Layer 3). Classify: instrument · House projection · obsolete · duplicate · orphaned · intentionally hidden. Expect deletion and consolidation.*

| Capability | Substrate | Authority | Lifecycle | Defect / blocker | Disposition | Verification criterion |
|---|---|---|---|---|---|---|
| **Studio surface inventory — the 42/17/32 drift** (directive said ~40; verified 42) | `app/studio/*` = **42 dirs** · `lib/navigation/studioNav.ts:46-70` = **17 entries** · `lib/studio/moduleDefinitions.ts` = **32 slugs** (backed by `20260208000001_studio_modules_and_consultant.sql`) | Directive §5 Layer 4 (origin of the triple — no prior audit produced it) | Drift measured ✓ | Three unreconciled registries; classification not yet performed | **RECONCILE → CONSOLIDATE** (gated on Layer 3) | One canonical registry; every directory classified; deletions recorded |
| **Living Work ontology propagation** | `living_works` (no runtime callers yet) | `LIVING_WORK_ONTOLOGY_RATIFICATION_INSTRUMENT_2026-07-31.md` (RATIFIED 08-01) · `ARTIFACT_FIRST_ONTOLOGY_INVENTORY_2026-08-01.md` (maps everywhere code still assumes manuscript = identity) · `DEPLOY_OBLIGATIONS_2026-08-01.md` (hard deploy gate before any Living Work route ships) | Ruled ✓ · Propagated ✗ | Inverse-assumption sites; deploy gate | **RECONCILE** | No site assumes manuscript = identity; deploy gate honored |
| **Stranded documents (281 on stale branch)** | 1006 vs 757 docs | `docs/ops/PRESERVATION_AUDIT_2026-08-01.md`; docket **D2** | Reported ✓ | D2 awaiting ruling (does "preserve as evidence" authorize a commit?) | **HOLD** | D2 ruled; then preservation executed per ruling |
| **Room→MAIA conversions (e.g. SessionReviewChat)** | Mentor surfaces | `MENTOR_SURFACE_RECONCILIATION_2026-07-17.md` under One-MAIA Ruling 2 | Designed ✓ | Prerequisite posture channel absent (see Layer 3) | **HOLD** (until posture channel) | Conversion cannot write a client transcript into a practitioner's memory |

## Layer 5 — Inference and development economics

*task → classification → cheapest competent model → verification → escalation. Metric: **Anthropic expenditure displaced without engineering quality loss.***

| Capability | Substrate | Authority | Lifecycle | Defect / blocker | Disposition | Verification criterion |
|---|---|---|---|---|---|---|
| **Local model lane** | Ollama v0.24.0 installed; `maia-coder`; `/Users/soullab/bin/maia-code` (7-line zsh wrapper) | `docs/ops/LOCAL_LANE_DISABLEMENT_TRACE_2026-08-09.md` (**never disabled — refactored to explicit opt-in, then never opted into**) · `LOCAL_MODEL_ROUTING_INVENTORY_2026-08-09.md` · `LOCAL_HARNESS_AB_PROTOCOL_2026-08-09.md` (founder-authorized, **dev harness only**; ⛔ MAIA runtime routing out of scope) | Exists ✓ · Available ✓ · **Selected ✗** | Never opted into | **RECONNECT** (via the authorized A/B protocol) | A/B evidence of displaced spend at equal quality, within the authorized scope |
| **Kimi as routing mechanism** | **None** — `kimi-cc` does not exist; only a pasted-header convention, tested 2 days via separate CLI, abandoned | `docs/ops/KIMI_INTEGRATION_HISTORICAL_TRACE_2026-08-09.md` (**never designed as a mechanism**) | Genuinely absent (directive §2 state 1 — proven) | No mechanism to reconnect | **BUILD (proposed — last resort, precondition met)** — only after local-lane A/B evidence | Equivalence proven before automatic routing; metric is displaced spend, not "works" |
| **Session cost mechanics** | `scripts/audit-session-context-cost.py` (re-runnable) | `SESSION_CONTEXT_BURDEN_AUDIT_2026-08-09.md` · `CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md` (**request density is the operational variable** — `r(cache_read, requests)=+0.955`, kernel size `r=−0.010`) · `CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md` | Measured ✓ | None | **PRESERVE** (evidence base for routing decisions) | Re-runs tracked; routing decisions cite it |
| **Week-1 latent-capability finding** | `docs/ops/context-experiment/CROSS_EPISODE_FINDING_LATENT_CAPABILITY.md` (under `WEEK1_CHARTER.md`) | Directive §4 explicitly declines to constitutionalize it | Provisional | Provisional status must be preserved | **PRESERVE** (as provisional) | Never cited as canon |

---

## Guards ledger (directive §7)

For each capability that reaches **Exercised**, record: the loss question (*what allowed this to disappear from lived operation without anything failing?*) and the smallest structural protection installed. A capability without a guard entry has not reached **Sustained**.

Loss-mode catalog already in evidence (candidate guards, none installed):
- **Undisclosed collateral deletion in unrelated refactors** (COGOS, `d7cea280d`) → guard candidate: wiring-removal detection on live-route imports.
- **Built, never connected** (`memory_links`, `MaiaPresenceContext`) → guard candidate: substrate-without-reader audit (instrument partially exists: `npm run memory:audit`, never run).
- **Available, never selected** (local model lane) → guard candidate: zero-traffic-despite-intended-routing observability warning.
- **Runtime contradicting a ruling** (Studio access) → guard candidate: conformance audit re-runs (Ruling 1 pattern).

> No guard is installed yet; nothing has completed rehabilitation.

## Change log

- **2026-08-09** — Map created (skeleton + row discipline).
- **2026-08-09 (provenance)** — ⛔ The entire 2026-08-09 corpus, **this map included**, was discovered **uncommitted** — untracked working-tree files on `feature/labtools-redesign`, itself diverged from trunk. The governing directive, five founder rulings, ratified canon and every audit were one `git clean -fd` from loss. Preserved in `c42cfe4a3` (194 docs) + `f79c0e92d` (the caller-identity helper, separately), branched from `origin/clean-main-no-secrets @ 46cdd47dd`.
- **2026-08-09 (Layer 0 reconciliation)** — Six Layer 0 rows checked against their own evidence. Ruling 1 → **closed** (founder act §8a #2). Identity-to-Authority Bridge → **classification closed** by reading, 76 routes. `academy_enrollments` → quarantine **verified by measurement** (zero code references outside its defining migration). Supersession marks → **already present**. Lifecycle C1 header → **repaired** (had contradicted the ruling inside its own file). Dual Authority → **re-dispositioned RECONCILE → HOLD**: 7 open founder questions, not reconciliation work.
- **2026-08-09 (later)** — All six layers populated from two evidence sweeps (audit/ruling inventory 2026-07-16→08-09; ten-referent location pass). Corrections vs. the directive's working text: drift triple is **42**/17/32; `kimi-cc` does not exist (never a mechanism); `lib/team/sessionTeamScope.ts` is the #899 team-scope repair, **not** the caller-identity repair (that is `lib/auth/selfScopedIdentity.ts`, branch-only).
