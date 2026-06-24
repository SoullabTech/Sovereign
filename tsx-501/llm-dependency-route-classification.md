# LLM Dependency Boundary Audit — `app/api/` route slice

Audit question: **if Claude disappeared tomorrow, what vanishes?**
Scope: all `app/api/` route handlers that invoke an LLM (text-gen), incl. `app/api/_backend/`.
Method: REACHABILITY-first. A route's LLM dependency only matters if members hit it.

## Sovereignty mechanics (the spine that determines "what vanishes")

Three text-gen entry points feed the entire live surface — none is pure-Claude:

1. **`getMaiaResponse`** (`lib/sovereign/maiaService.ts:2229`) → `generateText` (`lib/ai/modelService.ts:75`).
   - `modelService` is Claude-primary, **local Ollama/deepseek-r1 fallback** (`:51-53,153-192`). OpenAI **hard-blocked** as sovereignty violation (`:89-90`).
   - Billing/auth errors fail fast, do NOT fall back (`:166-168`).
   - → If Claude vanishes: live conversation **degrades to local models**, does not die.
2. **`getLLMProvider().generateSimple()`** (`lib/consciousness/LLMProvider.ts:34`) — provider ∈ {`anthropic`, `ollama`}; Claude primary, Ollama (qwen2.5 / deepseek-r1 / qwen3:32b) fallback (`:16-22`).
3. **`generateWithClaude`** (`lib/ai/claudeClient.ts:4`) — **pure Claude** (Opus reasoning / Sonnet voice, `:12-13`). No fallback. → vanishes with Claude.

Direct `new Anthropic()` in a route = pure-Claude, no fallback = vanishes with Claude.

---

## LIVE — member-reachable conversational path

| route file:line | call-type + model | ROLE-CLASS | REACHABILITY | RECLAIM-JUDGMENT | why |
|---|---|---|---|---|---|
| `app/api/sovereign/app/maia/list/route.ts:82,938` | `getMaiaResponse` → `generateText` (Claude-primary / local fallback) | Sovereign-substrate | live-member-path | deliberate-delegation | THE live MAIA conversation route; already local-fallback |
| `app/api/sovereign/app/maia/route.ts:22,278,410` | `getMaiaResponse` (same engine) | Sovereign-substrate | live-member-path | deliberate-delegation | sibling of list/ (non-list POST + emergency path) |
| `app/api/between/chat/route.ts:1268-1269,1432,2238` | local `qwen2.5:7b` primary; `claude-sonnet-4` conditional | Sovereign-substrate | live-member-path | deliberate-delegation | OracleConversation default endpoint; local-first |

Reachability proof: both `sovereign/app/maia*` and `between/chat` are fetched by `components/OracleConversation.tsx`, `app/maia/page.tsx`, `app/field/talk/page.tsx`, `app/companion/page.tsx`, `lib/hooks/useMaiaChat.ts`. (OracleConversation const default = `between/chat` at :565; canonical MAIA fetch overridden to `sovereign/app/maia/list` at :753.)

---

## SECONDARY — admin / feature / tool routes (member- or staff-reachable, peripheral)

| route file:line | call-type + model | ROLE-CLASS | REACHABILITY | RECLAIM-JUDGMENT | why |
|---|---|---|---|---|---|
| `app/api/ask/route.ts:153` | `getLLMProvider().generateSimple` (Claude/Ollama) | Rendering | secondary/feature | deliberate-delegation | landing "Ask" widget; sovereign fallback exists |
| `app/api/ask-maia/ask/route.ts:82` | `getLLMProvider().generateSimple` | Rendering | secondary/feature | deliberate-delegation | `/ask-maia` page card Q&A |
| `app/api/guidance/insight/route.ts:197` | `getLLMProvider().generateSimple` | Rendering | secondary/feature | deliberate-delegation | InsightTrigger whisper component |
| `app/api/spiralogic-report/route.ts:699` | `getLLMProvider().generateSimple` | Rendering | secondary/feature | deliberate-delegation | report narrative gen; dashboard/journey/practitioner pages |
| `app/api/studio/session-followup/generate/route.ts:86,98,126` | `generateText` (Claude/local) | Rendering | secondary/feature | deliberate-delegation | studio note follow-up; has local fallback |
| `app/api/maia/relational-navigation/route.ts:46,243` | `new Anthropic()`, `claude-opus-4-7` (PURE Claude) | Intelligence-delegated | secondary/feature | reclaim-candidate | Flows.tsx; pure-Claude, no fallback |
| `app/api/portal/[slug]/chat/route.ts:32,136,274` | `new Anthropic()`, `claude-sonnet-4` (PURE Claude, tool_use) | Intelligence-delegated | secondary/feature | deliberate-delegation | booking portal; needs Anthropic tool_use (LLMProvider.ts:27 documents intentional) |
| `app/api/changes/[id]/interpret/route.ts:155` | `claude-haiku-4-5` (PURE Claude) | Intelligence-delegated | secondary/feature | reclaim-candidate | change interpretation tool |
| `app/api/studio/changes/[id]/interpret/route.ts:167` | `claude-haiku-4-5` (PURE Claude) | Intelligence-delegated | secondary/feature | reclaim-candidate | studio change interpretation |
| `app/api/studio/changes/[id]/mentor/route.ts:202` | `claude-haiku-4-5` (PURE Claude) | Intelligence-delegated | secondary/feature | reclaim-candidate | studio mentor commentary |
| `app/api/studio/decisions/[id]/mentor/route.ts:176` | `claude-haiku-4-5` (PURE Claude) | Intelligence-delegated | secondary/feature | reclaim-candidate | studio decision mentor |
| `app/api/studio/scribe/live-prompts/route.ts:149` | `claude-haiku-4-5` (PURE Claude) | Intelligence-delegated | secondary/feature | reclaim-candidate | scribe live prompts |
| `app/api/labtools/explainer-script/route.ts:5` | `generateWithClaude` (PURE Claude) | Intelligence-delegated | secondary/feature | reclaim-candidate | labtools explainer; pure-Claude |

### Boundary cases (probes / health / not text-gen)
| route file:line | call-type + model | ROLE-CLASS | REACHABILITY | RECLAIM-JUDGMENT | why |
|---|---|---|---|---|---|
| `app/api/anthropic/ping/route.ts:14` | `messages.create` `claude-sonnet-4`, 32 tok | Boundary-case | secondary/admin | deliberate-delegation | connectivity probe, not conversation |
| `app/api/ai/health/route.ts:10,21` | provider config report (ollama url + claude key) | Boundary-case | secondary/admin | n/a | health/smoke status, no LLM call |
| `app/api/admin/security/route.ts:245` | `!!ANTHROPIC_API_KEY` boolean only | Boundary-case | secondary/admin | n/a | FALSE POSITIVE — no LLM invocation |
| `app/api/build/alert/route.ts:92` | `twilio.messages.create` (commented) | Boundary-case | secondary/admin | n/a | FALSE POSITIVE — twilio SMS comment |
| `app/api/voice/stream-conversation/route.ts:31,174,245` | TTS routing (Kokoro/OpenAI/PersonaPlex) | Boundary-case | live-member-path | reclaim-candidate (OpenAI TTS) | TTS only, not text-gen; **OpenAI TTS fallback = sovereignty flag** |

Other "non-Claude" grep hits in Next routes (`maia/field`, `maia/log-turn`, `maia/metacognition`, `field/status`, `consciousness/*`, `voice/openai-tts`, `voice/transcribe*`, `community/*`, etc.) are TTS/STT provider strings, status reporters, or `getLLMProvider` indirection already covered — not independent text-LLM call sites.

---

## DORMANT / ORPHANED — `app/api/_backend/` (Express-shaped, NOT consumed by live Next path)

`app/api/_backend/` is the orphaned Express backend ("Bypassed Substrate" per substrate monitor). It is **not a Next.js App Router surface** (no `route.ts` handlers; `.routes.ts`, `server.ts`, services, agents). ~44 files invoke an LLM (Claude, OpenAI, deepseek, Llama). None has a verified live Next consumer.

| representative file:line | call-type + model | ROLE-CLASS | REACHABILITY | RECLAIM-JUDGMENT | why |
|---|---|---|---|---|---|
| `app/api/_backend/src/services/claude.service.ts` | Anthropic client wrapper | Sovereign-substrate | dormant/orphaned | n/a | orphaned Express Claude service |
| `app/api/_backend/src/services/ConversationalPipeline.ts` | `messages.create` Claude | Sovereign-substrate | dormant/orphaned | n/a | old conversation pipeline, bypassed |
| `app/api/_backend/src/core/UnifiedOracleCore.ts` | Anthropic | Sovereign-substrate | dormant/orphaned | n/a | superseded by maiaService |
| `app/api/_backend/src/services/SoulLabOrchestrator.ts` | Anthropic | Sovereign-substrate | dormant/orphaned | n/a | orphaned orchestrator |
| `app/api/_backend/src/services/ElementalIntelligenceRouter.ts` | Anthropic | Sovereign-substrate | dormant/orphaned | n/a | orphaned router |
| `app/api/_backend/src/agents/PersonalOracleAgent.ts` | Anthropic + maiaService import | Sovereign-substrate | dormant/orphaned | n/a | orphaned agent |
| `app/api/_backend/src/agents/EnhancedAirAgent.ts` | Anthropic | Sovereign-substrate | dormant/orphaned | n/a | orphaned elemental agent |
| `app/api/_backend/src/core/SoulLabFoundation.ts` | Anthropic | Sovereign-substrate | dormant/orphaned | n/a | orphaned foundation |
| `app/api/_backend/src/core/orchestration/ConversationFlowManager.ts` | Anthropic | Sovereign-substrate | dormant/orphaned | n/a | orphaned flow mgr |
| `app/api/_backend/src/soullab/ConsciousnessResearchEngine.ts` | Anthropic + maiaService | Sovereign-substrate | dormant/orphaned | n/a | orphaned research engine |
| `app/api/_backend/src/routes/conversational.routes.ts` | Express route, Claude | Sovereign-substrate | dormant/orphaned | n/a | Express route, not Next |
| `app/api/_backend/src/deepseek/DeepSeekService.ts` | deepseek | Sovereign-substrate | dormant/orphaned | n/a | local deepseek service (orphaned) |
| `app/api/_backend/src/integrations/cloud/openaiClient.ts` + `src/lib/openaiClient.ts` | **OpenAI** | Boundary-case | dormant/orphaned | reclaim-candidate (sovereignty) | OpenAI clients — would violate sovereignty if revived |
| `app/api/_backend/src/services/ElementalOracleGPTService.ts` | **GPT** | Boundary-case | dormant/orphaned | reclaim-candidate (sovereignty) | GPT service, orphaned |
| `app/api/_backend/src/services/memory/LlamaService.ts` | Llama | Sovereign-substrate | dormant/orphaned | n/a | local Llama memory svc |
| `app/api/_backend/src/services/decentralized/SingularityNETAgent.ts` | external | Boundary-case | dormant/orphaned | n/a | speculative integration |
| `app/api/_backend/supabase/functions/oracle-ritual-response.ts` | OpenAI + Supabase | Boundary-case | dormant/orphaned | reclaim-candidate (double violation) | Supabase + OpenAI — both forbidden by canon |
| (+ ~27 more `_backend` agents/services/tests/prompts referencing Claude/OpenAI/deepseek) | mixed | mixed | dormant/orphaned | n/a | entire bypassed Express substrate |

`oracle/conversation/route.ts` (`:1292,1914` `claude-opus-4-5`): built, Next App Router, but **operationally null** (≈zero live traffic, confirmed). Callers are admin/labtools/onboarding-prelude pages + `substrateMap.ts`, not the live conversational loop. Classify: Sovereign-substrate / **dormant/orphaned** (built-not-live) / n/a.
