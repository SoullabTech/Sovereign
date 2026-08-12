# RUNTIME CONTINUITY WITNESS — PHASE A (observation only)
Executed 2026-08-12, read-only SSH to soullab@192.168.0.104. No writes, no traffic, no member content.

## 1. REFERENT RE-VERIFICATION — CONFIRMED
- container `maia-sovereign`, image `sha256:7a2289024d2d62be15938678dd3e83e26e0e857225f704beeca3fbb9b89032d6`
- StartedAt `2026-08-12T21:42:40.639Z`, RestartCount 0, Running true, healthy
- `GIT_COMMIT=3d1e27348` (prefix of 3d1e2734829626e29873a655ee189c9a091d1247), `BUILD_DATE=2026-08-12T21:36:15Z`, `APP_VERSION=1.2.0`
- `DATABASE_URL=postgresql://soullab:REDACTED@maia-postgres:5432/maia_consciousness`; psql confirms current_database=maia_consciousness
- compose project file `/home/soullab/MAIA-SOVEREIGN/docker-compose.production.yml`, service `maia`
- Not re-verified this run: DNS soullab.life -> host, and caddy->:3000 upstream mapping (caddy config not read).

Relevant observed env (non-secret): NODE_ENV=production, DISABLE_CLAUDE=false, ALLOW_ANTHROPIC_CHAT=true,
ALLOW_ANTHROPIC_CONSCIOUSNESS=**false**, ALLOW_OPENAI_CHAT=false, CLAUDE_MODEL=claude-opus-4-5-20251101,
OLLAMA_MODEL=qwen2.5:7b, OLLAMA_MODEL_FAST=qwen2.5:7b, OLLAMA_MODEL_DEEP=qwen2.5:14b-instruct,
LOCAL_TIER_ENABLED=true, MAIA_SHADOW_MODE=1, AIN_SHAPE_TELEMETRY=1, **AIN_SHAPE_REWRITE absent**.

## 2. OBSERVABILITY THAT ACTUALLY EXISTS — and its limits

| surface | rows | window | limit |
|---|---|---|---|
| maia_turns | 173,370 | 2026-01-23 → 08-12 17:39:45Z | 167,529 of these are a Jan 24–30 bulk (84,290 on 01-27 alone). Real usage Feb–Aug ≈ 5,841 |
| maia_sessions.conversation_history | 550 sessions / 4,225 exchanges | 2026-01-23 → 08-12 | only surface the RCN early-return writes to |
| agent_runs | 34,770 | 2026-01-24 → 08-12 | has origin_route + processing_profile |
| ain_shape_telemetry | 7,268 | 2026-01-23 → 08-12 | model column NULL for the maiaService path |
| socratic_validator_events | 4,205 | 2026-01-23 → 08-12 | has regenerated + regeneration_attempt |
| runtime_events | 1,638 | 2026-05-24 → 08-12 | **route_id is `sovereign/app/maia/list` on 100% of rows — not the chat generation route** |
| conversation_memory_uses | 74,519 | 2026-01-24 → 08-12 | |
| memory_transition_records | 1,092 | 2026-08-05 → 08-12 only | injected_count NULL on all rows |
| field_orchestrator_telemetry | 3,666 | 2026-02-16 → 08-12 | |
| consciousness_traces / opus_axiom_turns | 115 each | stop 2026-06-25 | dead surfaces |

**Application logs: effectively zero.** json-file driver, max-size 10m x 3 files, but the container restarted at
deploy: `docker logs maia-sovereign` = 82 lines, 21:42:40Z → 21:45:01Z, boot only. All pre-deploy application
log evidence is destroyed. maia-api/workers likewise restarted.

**Caddy is not a request log.** 34,326 lines, 2026-07-23 → 08-12 (survives the deploy), but census of `logger`
shows only `http.log.error.*`, `tls.*`, `reverse_proxy`. No successful-request access log exists. The only
`uri` values are 404s from internet scanners. There is **no HTTP-level record of member requests at all.**

## 3. PROFILE DISTRIBUTION

maia_turns.processing_profile, all time: CORE 172,356 / FAST 1,006 / DEEP 8 (DEEP only 2026-04-11 → 06-04).
Last 30 days (n=622): CORE 453 (72.8%) / FAST 169 (27.2%) / DEEP 0.
agent_runs last 30d (n=4,101): CORE 2,709 / FAST 1,380 / BETWEEN 9 (route /api/between/chat).
Independent corroboration — session history meta.processingProfile (n=4,225): CORE 2,986 / FAST 1,200 / DEEP 8 / absent 31.
field_orchestrator_telemetry path (n=3,666): CORE 2,708 / FAST 958.

**RCN — label semantics established, then tested.** Deployed source `/app/lib/sovereign/maiaService.ts`
(3,737 lines) line 2860 persists `processingProfile: 'RCN'` via `addConversationExchange`, line 2870 returns
`'DEEP'` to the client "for client compatibility" — the CMC-001 hazard is real in the running image.
`logMaiaTurn` is called **only** at line 3352, i.e. after the RCN early-return, so an RCN turn can never
appear in maia_turns by construction. The one surface it *does* write is maia_sessions.conversation_history,
and that surface shows **zero RCN across 4,225 exchanges**, and zero `rcnIntent`/`rcnConfidence` keys.
=> RCN early-return: **NOT_OBSERVED_WITH_COMPLETE_INSTRUMENTATION** for the write-path that would record it,
within 2026-01-23 → 08-12. Corollary: the 8 DEEP rows are genuine DEEP, not disguised RCN.

## 4. PROVIDER / MODEL

maia_turns last 30d (n=622): primary_engine `deepseek-r1` 487 (used_claude_consult=false) /
`claude-3-sonnet` 135 (used_claude_consult=true). All time post-bulk: deepseek-r1 3,774, claude-3-sonnet 1,083.
Monthly, `claude_primary` count equals `used_claude_consult` count exactly in all 7 months — the two are the
same event.

Label-semantics checks:
- write site `/app/lib/learning/maiaTrainingDataService.ts:206` defaults to `'deepseek-r1:latest'`. Zero rows
  carry that string, so the default never fired and the values are caller-supplied. Label is **load-bearing**.
- BUT `claude-3-sonnet` matches no configured model (env says claude-opus-4-5-20251101; runtime_events say
  claude-sonnet-4-5). The string is a hardcoded literal. It is reliable as "Claude was consulted",
  **unreliable as model identity**.
- `deepseek-r1` matches no OLLAMA_MODEL_* value either (all qwen2.5). So primary_engine does not name the
  model that actually ran on the local tier.
- runtime_events (provider=anthropic, provider_model=claude-sonnet-4-5, provider_configured=t,
  **provider_fallback_active=t on 100% of 1,638 rows**) describes only route `sovereign/app/maia/list`.
  It is **not** evidence about member-visible chat generation.
- ain_shape_telemetry.model is NULL for every CORE/FAST maiaService row; `consciousness-wrapper` appears on
  exactly 8 rows, same 2026-04-11 → 06-04 window as the 8 DEEP turns — corroborating the CMC-001 finding
  that the DEEP path records a non-model provider string.

=> The static claim "Phase-2 consciousness path hardwired to Ollama, modelService unreachable" is **consistent
with** the local-tier majority but **not proven**, because no field records the actual local model name.

## 5. VALIDATOR-TRIGGERED REGENERATION — OBSERVED, rare, and never on DEEP

socratic_validator_events, all 4,205 rows: regenerated=true on **10** rows, all regeneration_attempt=1,
decision=REGENERATE, route=`core`, 2026-03-25 → 2026-07-02. Base rate 0.24%. One further row decision=REGENERATE
with regenerated=false (route fast, 2026-04-04). **Zero in the last 30 days.**
Route `deep`: 8 events, all decision=ALLOW, regenerated=false. So across every DEEP turn production has ever
run, failure-triggered regeneration fired **zero** times (n=8).
Last-30d validator health (n=487): passes=true 485, passes=false 2 (2 critical). 467 gold with zero ruptures.

## 6. POST-PERSISTENCE AIN REWRITE — gate is closed by configuration

`/app/lib/sovereign/maiaService.ts` ~3599:
`rewriteEnabled = process.env.AIN_SHAPE_REWRITE === '1' || process.env.NODE_ENV !== 'production'`.
Observed container env: NODE_ENV=production and AIN_SHAPE_REWRITE **not set**. Gate evaluates false
deterministically. The rewrite site sits at ~3612, i.e. **after** logMaiaTurn (3352) — so if it ever did fire,
persisted and displayed text would indeed diverge; the founder's concern is structurally correct.
The trigger condition itself is common: ain_shape_telemetry.menu_mode=true on **569 of 7,268** rows (7.8%),
so this gate is suppressing a rewrite that would otherwise fire regularly.
Its only trace would be the stdout line `[AIN SHAPE REWRITE] Menu mode response rewritten` — and no
application logs survive. **Negative established from config, not from telemetry.**

## 7. CONTINUITY REACHING GENERATION (metadata only)

- runtime_events.memory_continuity_confidence (n=1,638, **/list route only**): low 1,009 (avg prompt_block
  7,674 chars, min 0), medium 538 (avg 12,049), high 91 (avg 13,631; first appears 2026-07-23).
  memory_layers is a fully-populated 12-key object on all rows (relational, somatic, developmental, meta,
  session, conversational, semantic, pattern, breakthrough, recentTurns, episodic, field).
  prompt_block_layers keys: studio/wuxing/knowledgeGate/memberWeb/astrology/atoms/forwardReadiness/
  memoryInfluence on all 1,638; conversational 1,622; episodic only 486.
- memory_transition_records (n=1,092, 2026-08-05 → 08-12 only): per source_type 273 rows each.
  member_memory_atoms available 5,056 / retrieved 306 / eligible 4,866 / offered 306; conversational
  retrieved 1,542 / offered 1,464; episodic 156/156; developmental 795/795.
  **injected_count is NULL on every row** — the offered→injected step is not instrumented.
- conversation_memory_uses last 30d: context/developmental_memories 5,636; context/conversation_turns 3,089;
  breakthrough/breakthrough_moments 1,899; breakthrough/conversation_turns 1,076.
- maia_turns.observer_insights: `retrievalContextActive` and `useFrame` **absent on all 1,008 rows** in the
  last 60 days — the field exists in the write path but is never populated.
- field_orchestrator_telemetry: CORE avg 529 chars, FAST avg 384 chars, truncated=0 on all 3,666 rows, avg ms 0.

=> Retrieval and offering are well instrumented. **Injection into the actual generation prompt is not
instrumented on the chat path at all.** Everything above is upstream of the prompt.

## 8. BEFORE / AFTER TODAY'S DEPLOY

Deploy boundary 2026-08-12T21:42:40Z. **Latest row in every telemetry table is 2026-08-12 17:39:45Z** — four
hours *before* the deploy. Caddy post-deploy traffic: 25 requests, all ACME challenges + one robots.txt.
**Production has served zero member turns since the new image started.** No before/after comparison is
possible for any question. Every finding in this document describes the *previous* image's behaviour.

## 9. CMC-001 STATIC FINDINGS vs LIVED EVIDENCE

CONFIRMED AS LIVED
- RCN early-return persists 'RCN' but reports 'DEEP' — literal present at lines 2860/2870 of the deployed image.
- DEEP path records a non-model provider string — `consciousness-wrapper` on exactly the 8 DEEP turns.
- Client-reported profile is unreliable — additionally, RCN cannot reach maia_turns at all (logMaiaTurn 3352
  is downstream of the 2857 early return).
- Post-persistence AIN rewrite is genuinely post-persistence (3612 > 3352).

CONTRADICTED / NARROWED
- "DEEP regeneration is the only mechanism delivering accumulated continuity": DEEP has run 8 times ever,
  none since 2026-06-04, and regeneration fired on none of them. The mechanism has never delivered in production.
- Regeneration is not a DEEP phenomenon at all in practice — all 10 real regenerations were route=`core`.

STILL UNRESOLVED
- Whether the Ollama hardwire / modelService-unreachable claim holds at runtime: no field records the local
  model name, and primary_engine values match neither the Ollama nor the Claude configuration.
- Whether RCN was ever *attempted* and rejected (rcnDecision.used=false) — only the taken branch writes anything.

## 10. REQUIRES_CONTROLLED_ENCOUNTER

1. **Actual local model identity per turn** — reason: no distinguishing field. primary_engine is a literal
   (`deepseek-r1`) matching no configured model; ain_shape_telemetry.model is NULL on the maiaService path.
2. **Which provider generates member-visible chat text** — reason: runtime_events, the only provider-bearing
   surface, covers only `sovereign/app/maia/list`. The generation route emits no provider record.
3. **Whether the RCN branch is ever entered and declined** — reason: absent instrumentation on the not-used branch.
4. **Whether the post-persistence AIN rewrite fires when enabled** — reason: absent instrumentation (stdout only)
   plus zero log retention. Currently gate-closed, so a positive can only be produced deliberately.
5. **Whether persisted text and displayed text diverge** — reason: cannot be answered without reading member
   content; out of scope by construction.
6. **Continuity actually injected into the generation prompt** — reason: memory_transition_records.injected_count
   is NULL on 100% of rows and observer_insights.retrievalContextActive is never populated.
7. **Any behaviour of the new image (commit 3d1e273)** — reason: insufficient data; zero member turns since deploy.
8. **DEEP path behaviour generally** — reason: n=8, all >2 months stale, none post-dating several deploys.
9. **Regeneration under the new build** — reason: last real regeneration 2026-07-02; behaviour after today's
   guard removal is entirely unobserved.
10. **Pre-deploy application-log evidence** — reason: insufficient retention; destroyed by the restart.
    Any future witness needs a log sink that survives container recreation.

## 11. STOP STATE
Read-only throughout: SSH reads, `docker inspect`/`logs`, `psql` inside `BEGIN READ ONLY` transactions,
`docker exec ... sh -c grep/sed` reads of the deployed image. No INSERT/UPDATE/DELETE/DDL, no container
lifecycle action, no file created or modified on either remote host, no HTTP request to MAIA, no synthetic
identity, no member content read. Nothing to clean up. One local temp file `/tmp/caddy.log` on the Mac Studio.
