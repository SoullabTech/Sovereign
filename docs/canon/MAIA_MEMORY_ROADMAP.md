# MAIA Memory System — Roadmap

> Single source of truth for the MAIA memory architecture build. Read by the weekly Monday governance review (cloud-scheduled trigger). Updated as the system evolves.

## Current state (as of 2026-04-09)

- **Phase**: 1.5 complete → observation cycle open
- **Live branch**: `feature/memory-orchestrator-phase1` deployed on minisForum (commit `76c9f1611`)
- **Production health**: orchestrator firing on every turn; `developmental_memory` selected at HIGH strength alongside `spiral_state`, `relationship_anamnesis`, `theme_signals`, `member_live_context`
- **Last verified**: 2026-04-09 production smoke test (T01 forward-readiness behavioral shift confirmed; T03 ambivalence held; T05 containment clean)
- **Posture**: observation, not building — listening to the system through real usage before adding more layers
- **Last roadmap update**: 2026-04-09

## Phase status

| Phase | Description | Status |
|---|---|---|
| **1** | Memory Orchestrator + Forward-Readiness | ✅ DEPLOYED |
| **1.5** | memoryLoaders + wire into `/oracle` + `/between/chat` + `maiaService` FAST path | ✅ DEPLOYED |
| **1.5 cleanup** | Contradiction regex (present participles) + spiralState closure bug at `app/api/oracle/conversation/route.ts:2042` | ⏳ Queued (cheap, ~5-min combined fix) |
| **1.5 wiring** | Orchestrator into `/sovereign/app/maia` and CORE/DEEP/repair/shadow/rewrite paths in `lib/sovereign/maiaService.ts` | ⏳ Queued |
| **2a** | Semantic memory (pgvector inspection, embedding generation, retrieval, orchestrator integration via `semanticCandidate`) | ⏳ Blocked on observation cycle |
| **2b** | Somatic memory (user-reported body-state detection, normalized cues, retrieval via `somaticCandidate`) | ⏳ Blocked on Phase 2a |
| **2c** | Morphic pattern detection (recurrence + archetypal language via `morphicCandidate`) | ⏳ Blocked on Phase 2b |
| **3a** | Reinforcement / consolidation memory (deepening detection, milestone candidates) | ⏳ Blocked on Phase 2 |
| **3b** | 7-stage consciousness evolution scaffolding (provisional stage inference) | ⏳ Blocked on Phase 3a |
| **Cross-session priming** | `lib/maia/historicalMemory.ts` distillation layer for `directional_cue` field | ⏳ Blocked on observation |
| **4** | Collective field intelligence (privacy-safe aggregation, threshold gating) | ⏳ Blocked on all lower layers |

## Architectural invariants (do not violate)

- **Memory biases interpretation, never determines response**
- **No raw transcript injection into prompts**
- **No explicit recall** ("last time you said..." style)
- **Sanctuary sessions never read or write memory**
- **Anonymous sessions never trigger orchestration** (anti-anon gate)
- **Forward-readiness has final priority** over memory bias in prompt assembly order
- **Containment**: cross-session memory must not bleed into unrelated topics
- **Collective layer rules**: must aggregate only from already-distilled artifacts, never raw user content; minimum distinct-member threshold; consent + privacy gates before aggregation

## Open issues (1.5 cleanup, non-blocking but worth fixing before next phase)

1. **Contradiction regex misses present participles** in `lib/maia/memoryOrchestrator.ts` `detectContradiction()`. Add `(ing)?` suffix to `\bsecond-?guess\b` and `\breconsider\b`. Two-line fix.
2. **`spiralState is not defined` ReferenceError** at `app/api/oracle/conversation/route.ts:2042` inside `generateSpiralogicResponseWithLLM`. Pre-existing closure bug — `spiralState` is defined in the outer POST handler and not in scope inside the function. Pass it (or `dominant_element`) as a parameter. Three-line fix.
3. **`/between/chat` smoke test pending real session auth** — production hard-blocks client-supplied userId without `MAIA_TRUST_BODY_ID_IN_PROD=1`. Smoke-tested via `/oracle/conversation` instead. End-to-end `/between` probe with Kelly's actual session cookie still pending.

## Production verification (when SSH access is available)

```bash
# Container health
ssh minisforum "docker ps --format '{{.Names}}\t{{.Status}}' | grep maia-sovereign"

# Last 5 deploys
ssh minisforum "cd ~/MAIA-SOVEREIGN && git log --oneline -5"

# Memory-plan log activity (last 1 hour)
ssh minisforum "docker logs maia-sovereign --since 1h 2>&1 | grep -A 11 'memory-plan' | head -100"

# Forward-readiness firing rate (last 1 hour)
ssh minisforum "docker logs maia-sovereign --since 1h 2>&1 | grep -c forward-readiness"

# developmental_memory selection rate
ssh minisforum "docker logs maia-sovereign --since 1h 2>&1 | grep -c developmental_memory"

# Kelly's actual DB state
ssh minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"SELECT COUNT(*) FROM developmental_memories WHERE user_id = 'ce284751-e457-42f6-89b6-bc07d0876682';\""
ssh minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"SELECT COUNT(*) FROM member_theme_signals WHERE member_id = 'ce284751-e457-42f6-89b6-bc07d0876682';\""

# Recent error patterns
ssh minisforum "docker logs maia-sovereign --since 1h 2>&1 | grep -iE 'error|fail|reject' | head -20"
```

> Note: the cloud Monday review trigger does NOT have SSH access. These commands are for human/local-session use only.

## What to watch (the four diagnostics for the observation cycle)

When observing the system through real usage (not logs):

1. **Does MAIA reopen settled ground less often?** Watch first-turn responses to messages with "what matters now is how" / "help me say" / "I'm clear" / "I just need the words". Forward-readiness should produce immediate practical movement.
2. **Does MAIA hold ambivalence cleanly?** "Part of me feels X, but part of me feels Y" should produce holding language, not collapse. (Note: contradiction flag has present-participle bug — fix if observation surfaces issues.)
3. **Does cross-session continuity feel present without being explicit?** Returning members should land in MAIA's tone faster, with less generic openings. No "as you said before" — but a felt sense of being already in the field.
4. **Does the system NOT bleed across topics?** When the user shifts to an unrelated domain, the memory plan should not push the prior thread's content into the new topic.

## Reference paths

- **Orchestrator**: `lib/maia/memoryOrchestrator.ts`, `lib/maia/types/memoryOrchestrator.ts`
- **Loaders**: `lib/maia/memoryLoaders.ts`
- **Forward-readiness**: `lib/maia/forwardReadiness.ts`
- **Oracle wiring**: `app/api/oracle/conversation/route.ts` (lines 74, 564–573, 851–870, 1828, 2059–2066, 2068–2086; repair path 891–915)
- **Between/chat wiring**: `app/api/between/chat/route.ts` (lines 37–39, 1842–1880)
- **maiaService consumption**: `lib/sovereign/maiaService.ts` (lines 1144–1158, 1181)
- **Production tracking branch**: `feature/memory-orchestrator-phase1` (NOT merged to `clean-main-no-secrets` yet — observation first)
- **GitHub default branch**: `clean-main-no-secrets`

## Update protocol

When a phase moves status:
1. Update the phase table above (set ✅ DEPLOYED or ⏳ Queued)
2. Update "Last verified" + "Last roadmap update" in the current state header
3. Move "Phase" pointer in the current state header
4. Add any new open issues to the Open Issues list
5. Commit: `docs(canon): roadmap update — <what changed>`

The weekly Monday review reads this file from the `clean-main-no-secrets` branch as ground truth. Keep it accurate.

## Decision gates (go/no-go criteria for phase transitions)

### Phase 1.5 → Phase 2a (semantic memory)
- ✅ Phase 1.5 deployed and verified (DONE)
- ⏳ Observation cycle complete (≥ 50 production turns processed by orchestrator with no regressions)
- ⏳ Open 1.5 cleanup issues fixed OR explicitly deferred
- ⏳ pgvector availability inspected (whether enabled in production DB)

### Phase 2a → Phase 2b (somatic)
- ⏳ Semantic retrieval producing 1–3 cues per relevant turn without prompt bloat
- ⏳ `semanticCandidate` flag firing on appropriate turns
- ⏳ No regression in containment or contradiction handling

### Phase 2b → Phase 2c (morphic)
- ⏳ Somatic detection working on user-reported body-state language
- ⏳ Normalization not over-claiming physiology

### Phase 3a → Phase 3b (stage)
- ⏳ Reinforcement detection distinguishing consolidation from novelty
- ⏳ No gamification creep

### Any phase → Phase 4 (collective)
- ⏳ ALL lower layers producing distilled artifacts
- ⏳ Privacy gates verified
- ⏳ Minimum distinct-member threshold defined and enforced
- ⏳ Aggregation utility tested in isolation
