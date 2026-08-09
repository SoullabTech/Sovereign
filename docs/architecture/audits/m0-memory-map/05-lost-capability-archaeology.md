# M0 Lane 05 — Lost-Capability Archaeology (git history)

**Date**: 2026-08-09 · **Method**: read-only git archaeology (`--diff-filter=D`, `git log -S`, per-commit import diffs, current import-graph checks). No code modified.
**Scope**: memory ecology only. This workpaper is an *input* to the Lost Capability Recovery Audit that `docs/canon/MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md` scopes — per that ruling's own correction, no such audit existed before 2026-08-09, and this document makes no retroactive claim.

---

## 1. The proven failure mode (COGOS episode — cited, not duplicated)

Established by `docs/architecture/audits/CORRIGIBILITY_ACTIVATION_TRACE_2026-08-09.md` and `docs/architecture/audits/AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md`:

- **Wired**: `4f73d66b0` (2026-03-12) — *"feat: interpretive ledger + hypothesis accumulation pipeline"* into `app/api/oracle/conversation/route.ts`.
- **Severed 7 days later**: `d7cea280d` (2026-03-19) — *"feat(spiralogic): add report evolution delta and context injection"*. Route went 3,635 → 2,041 lines (+353/−1,947 there). **The commit message does not mention removing anything.**
- Result today: COGOS fully designed, migrated, typed, 0 runtime callers, 0 production rows.

This lane independently reproduced that finding and asked the wider question the directive poses: **what else did that commit — and other commits — amputate?**

## 2. Headline new finding: `d7cea280d` amputated 34 modules, not just COGOS

Net import diff on `app/api/oracle/conversation/route.ts` in `d7cea280d` (removed and NOT re-added in the same commit — verified by ± import comparison): **35 removed, 1 re-added** (`spiralStatePersistence`, which was re-added only as a smaller usage). This matches and explains the trace doc's "34-absent" import-graph count for that route.

Memory-ecology modules severed in that single silent commit:

| Severed capability | Module(s) |
|---|---|
| Bridge D spiral state (load **and upsert**) | `lib/consciousness/spiralStatePersistence` |
| Turn history in prompt | `lib/memory/stores/TurnsStore` |
| Journal entries in prompt | `lib/memory/stores/JournalStore` |
| Recent capsules in prompt | `lib/capsules/capsuleService` |
| Session remembrances | `lib/scribe/sovereignSummarizer` |
| Pattern memory in prompt | `lib/patterns/getTopPatterns`, `getTopHypotheses`, `PatternDetectionService`, `PatternOfferingService` |
| Participatory themes / recurrence | `lib/consciousness/participatoryReality(Helper)`, `participatoryRealityPrompt` |
| Active-thread continuity + repair | `lib/consciousness/activeThread`, `responseThreadCheck` |
| Correction detection | `lib/consciousness/correctionDetection` |
| Conversation-state hint | `lib/conversation/conversationStateResolver` |
| COGOS corrigibility chain | `interpretiveLedger`, `hypothesisBuffer`, `gateEvaluator`, `observationExtractor`, `types/interpretive-ledger` |
| (adjacent, non-memory) | `modelRouter`, `councilTelemetry`, `ainShapeTelemetry`, symbolic-telemetry trio, `patternInquiryProtocol`, `pfiResponder`, `promptIngressGovernance`, `identityGuard`, `wisdomGraphService`, `LibraryService`, `dynamicRange`, `ainResponseShape` |

**Severance type: silent amputation.** One commit, feature-framed message, no ruling, no doc.

## 3. What happened after — recovery, retirement, and what is still severed

The live conversational path is now `app/api/sovereign/app/maia/list/route.ts` → `lib/sovereign/maiaService.ts` (+ `lib/memory/MemberLiveContext.ts`). Disposition of each amputated capability **relative to today's live path**:

### 3a. Recovered (re-wired or rebuilt into the live path)

| Capability | Recovery vehicle | Evidence |
|---|---|---|
| Spiral state **read** | `MemberLiveContext.ts:319,390` (`loadSpiralState`) called from live route (`list/route.ts:99,656`) | `f222f206a` (2026-03-01) canonical assembly; live wiring |
| Session summaries | `MemberLiveContext` → `getRecentSummaries` | same |
| Active pattern context | `MemberLiveContext` → `getActivePatternContext` | same |
| Theme recurrence | `MemberLiveContext` + `lib/sovereign/maiaService.ts` import `participatoryRealityHelper` | current import graph |
| Correction handling | rebuilt as `lib/maia/correctionRepair.ts` (uses `correctionDetection`), wired at `list/route.ts:121` | current import graph |
| Atoms / conversational / episodic recall | **rebuilt fresh**, not restored: `93b42d092` (2026-05-22, *"Cut 1 continuity substrate restoration"* — commit message explicitly frames itself as *"Not feature expansion. Coherence restoration."*), Phase 2 chain (`987b3ff28`→`f74ab4204`→`3ca80a78d`), episodic marks (`28545d2f9`, `40b0bb55c`, R17 `9752db4f2`/`f82cd4cd0`) | commit messages; CLAUDE.md priority thread |

Note: recovery was **rebuild-under-governance**, not reversal of `d7cea280d`. The rebuilt layer is consent-gated and provenance-bound; the amputated one was not. Rehabilitation must not "restore" the pre-March wiring on top of this.

### 3b. Still severed today (genuinely lost from the live path)

| Capability | Current state | Severance type |
|---|---|---|
| **Spiral state WRITE** (`upsertSpiralState`) | Not called from the live conversational path; only importers are `app/api/members/spiral-state/route.ts`, `app/api/spiralogic-report/route.ts`, and the dead oracle lane. If nothing in the live turn loop writes, `member_spiral_state` goes stale — read-side surfaces frozen state. **Needs runtime verification (M1).** | Silent (`d7cea280d`) |
| Conversation-state hint (`conversationStateResolver`) | **0 importers** repo-wide | Silent (`d7cea280d`) |
| Journal entries in prompt (`JournalStore`) | **0 importers** repo-wide | Silent (`d7cea280d`) |
| Recent capsules in prompt (`getRecentCapsules`) | `capsuleService` imported only by a journal listing route + index + test — not by any prompt path | Silent (`d7cea280d`) |
| Pattern hypotheses in prompt (`getTopHypotheses`/`getTopPatterns`) | `getTopPatterns` reachable only via `PatternMemoryStore` ← `ConsciousnessMemoryLattice` (no live-route caller found) | Silent (`d7cea280d`) |
| Active-thread continuity (`activeThread`, `responseThreadCheck`) | 18 importers, **all under `app/api/_backend/`**, which is excluded from `tsconfig.json:56`, `tsconfig.ship.json:32`, and the Next build (`next.config.js:46`) — dead code | Silent (`d7cea280d`) |
| COGOS runtime chain | `observationExtractor` **0 importers**; ledger readable via `app/api/members/ledger/*` but no writer in any live lane | Silent (`d7cea280d`) — already ruled on in the 2026-08-09 corrigibility audits; disposition is a founder decision, not a re-wire |
| `modelRouter` | 0 importers | Silent (`d7cea280d`) |

### 3c. Deliberately retired (with ruling — not "lost")

- **The entire oracle conversation lane**: `0515523f8` (2026-07-17) — hard **410 refusal** (Sanctuary S2, ruling K4; refusal R19 in the constitutional registry). Everything the 3,081-line file still imports (77 imports incl. `MemoryOrchestrator`, `LibraryService`, `SessionMemoryServicePostgres`, `spiralStatePersistence`) is **zombie wiring below a refusal guard** — present in the import graph, unreachable at runtime. Any liveness census must exclude this file's imports.
- `lib/maia/spiralOrientation.ts` Path B: `57438d75f` (2026-05-23) — removal *with recorded canonical Path A decision*; the sovereign route keeps a commented-out import (`list/route.ts:138`) as a visible scar.
- Supabase-era journal service (`lib/services/journalService.ts`): `62e6b001c` (2025-12-20) — removed under the no-Supabase sovereignty ruling.
- Legacy Express backend memory stack (`SoulMemorySystem`, `soulMemoryService`, `SemanticJournalingService`, `VoiceJournalingService`, `memory.controller`, `SymbolicMemory`, `FlowMemory`, etc.): bulk-deleted `c99d6e5f2` (2025-11-29) and `c695b5d3e` (2026-01-21, *"chore(security): remove deprecated app/api/backend folder"*). Deliberate cleanup of a stack that was never in the Next.js runtime traffic path. **Caveat**: voice/semantic *journaling* as a member capability disappeared with it and was never re-expressed in the live architecture — a candidate for the Recovery Audit's "should this exist" question, not a restore-the-code item.

### 3d. Never-actually-wired (aspirational — must NOT be presented as lost)

Confirmed by pickaxe (creation in the `686bcc9f5` 2025-12-14 platform dump; only later touch is the substrate monitor `fffb9559f` reading their status) and by `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` / CLAUDE.md Cat 3–4: `QuantumFieldMemory` (0 persistence), `SomaticMemoryService`, `MorphicPatternService`, `MAIAMemoryArchitecture` (2,351 LOC), duplicate `SemanticMemoryService`s, `lib/consciousness` `EpisodicMemoryService` (service + migration, 0 live callers; the *live* episodic capability is the separate `lib/maia/episodicRecallBlock` + marks pathway). `CoherenceFieldService` is Cat 3 under explicit freeze (`COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C).

## 4. A second instance of the failure class: null wiring

`987b3ff28` (2026-05-24) wired conversational Phase 2 into the oracle route **after** its traffic had already gone to ~zero — "the wire was operationally null" (CLAUDE.md priority thread; corrected by `f74ab4204`). The class is therefore two-sided: (a) removing wiring silently, and (b) **adding** wiring to a lane that is already dead. Both produce the same symptom: code that looks connected and does nothing. The import graph alone cannot distinguish them; lane-liveness (traffic/log evidence) is required.

## 5. Documentation drift produced by the amputation

- **CLAUDE.md "Bridge D" section is stale**: it documents wire points at `app/api/oracle/conversation/route.ts` (~415/~1049/~1067) that were severed 2026-03-19 and sit behind a 410 since 2026-07-17. The surviving truth is: read via `MemberLiveContext`; write-side unverified (see 3b). `docs/bridge-d-verification.md` presumably inherits the same drift.
- The oracle route's 77 remaining imports overstate connectivity for any future import-graph audit; recommend the M1 liveness census treat `app/api/oracle/conversation/route.ts` and `app/api/_backend/**` as excluded-by-ruling zones.

## 6. Reconciliation with prior audits

| Prior artifact | Relationship |
|---|---|
| `CORRIGIBILITY_ACTIVATION_TRACE_2026-08-09.md` | Confirms its two-commit COGOS lifecycle; **extends** it: the same commit severed 34 modules, of which ~10 memory-ecology capabilities remain severed today (3b). |
| `MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md` | This lane is scoped by it. Its standard (completeness for continuity/relationship/development/authority, not "restore useful things") governs disposition of every 3b row. Phantom-referent correction respected — this workpaper is dated 2026-08-09 and is not the audit it anticipated. |
| `AIN_SYSTEM_REHABILITATION_MAP.md` Layer 2 | 3b rows are candidate Layer-2 inventory entries with severance provenance attached; 3d rows must stay out of "lost" framing there. |
| `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` + CLAUDE.md | Source for the null-wire episode (§4) and the DEEP-tier prompt gap (later closed `3933f73d6`). |
| `docs/engineering/cogos-changelog.md`, `cogos-status.md` | COGOS design/execution record; not re-litigated here. |

## 7. Recommendations to the M0 synthesis (no action taken — discovery only)

1. **Verify spiral-state write liveness** (3b row 1) before any continuity claim that cites Bridge D: does `member_spiral_state` receive writes under current production traffic?
2. Correct the CLAUDE.md Bridge D section (doc repair, not code).
3. Each still-severed capability in 3b needs a disposition under the Completeness ruling: *recover under governance* / *retire with ruling* / *confirm dead*. None should be re-wired by default — the recovered layer (3a) was deliberately rebuilt with consent gates the amputated one lacked.
4. Adopt the standing lesson as an invariant candidate: **a wiring change (add or remove) on a conversational lane must name the lane's liveness in the commit message** — the COGOS commit and the null-wire commit are the two proofs it is needed.
