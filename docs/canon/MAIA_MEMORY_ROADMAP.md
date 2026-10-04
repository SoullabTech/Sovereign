---
level: architecture
---

# MAIA Memory System — Roadmap

> Single source of truth for the MAIA memory architecture build. Read by the weekly Monday governance review (cloud-scheduled trigger). Updated as the system evolves.

## Current state (as of 2026-05-04)

- **Phase**: 1.5 deployed → observation cycle starting (now actually measurable)
- **Live branch**: `clean-main-no-secrets` deployed on minisForum
  - **Activation commit** (merge): `919e7e855` — `feature/memory-orchestrator-phase1` merged into `clean-main-no-secrets` with both bodies of work preserved (orchestrator wiring + clean-main UX/content)
  - **Stabilization commit**: `ea10ffa8a` — `fix(build): resolve MaiaShell duplicate parameter error` (post-merge webpack/build unblock)
- **Production health**: orchestrator files present in running container (`/app/lib/maia/memoryOrchestrator.ts`, `memoryLoaders.ts`, `forwardReadiness.ts`, `types/memoryOrchestrator.ts`); container rebuilt cleanly; ready to fire on first turn
- **Last verified**: 2026-05-04 — minisForum HEAD `ea10ffa8a`; orchestrator files confirmed inside running container via `docker exec`; all four services (sovereign, postgres, whisper, caddy) healthy
- **Posture**: observation, not building. Important correction: the previous ~25 days were observing `clean-main-no-secrets` *without* the orchestrator, because the production branch had silently diverged. The observation cycle for memory-governed MAIA behavior begins now.
- **Last roadmap update**: 2026-05-04

## Phase status

| Phase | Description | Status |
|---|---|---|
| **1** | Memory Orchestrator + Forward-Readiness | ✅ DEPLOYED |
| **1.5** | memoryLoaders + wire into `/oracle` + `/between/chat` + `maiaService` FAST path | ✅ DEPLOYED |
| **1.5 cleanup** | Contradiction regex (present participles) + spiralState closure bug | ✅ DEPLOYED (commit `534b187ed`, merged via `919e7e855`) |
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

## Open issues

1. ~~Contradiction regex misses present participles~~ — ✅ resolved in `534b187ed`: regex now matches `second-?guess(?:ing)?` and `reconsider(?:ing)?`.
2. ~~`spiralState is not defined` ReferenceError~~ — ✅ resolved in `534b187ed`: `dominantElement?: string | null` parameter added to `generateSpiralogicResponseWithLLM`, threaded from outer POST-handler call site.
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
- **Production tracking branch**: `clean-main-no-secrets` (orchestrator merged from `feature/memory-orchestrator-phase1` via `919e7e855` on 2026-05-04; stabilized at `ea10ffa8a`). Note: line numbers in the wiring entries above were captured pre-merge and may have shifted; trust the file contents over the line numbers.
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
