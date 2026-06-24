# LLM Dependency Boundary Audit — Slice: remaining `lib/` subdirs

Audit question: **if Claude disappeared tomorrow, what vanishes?**
Scope: all `lib/` subdirs NOT owned by other agents (excludes lib/sovereign, lib/ai, lib/maia, lib/consciousness, lib/memory, lib/oracle).
Date: 2026-06-02. Read-only classification — no canon proposed.

## Anchor verification (live path)

LIVE member path = `sovereign/app/maia/list/route.ts → lib/sovereign/maiaService.ts → lib/ai/modelService → lib/sovereign/claudeClient.ts`.

- `app/api/sovereign/app/maia/list/route.ts:96` imports `lib/services/maiaAstrologyContextService` — **but that file is pure-DB** (only `import { query } from '@/lib/db/postgres'`, no LLM call). So this slice contributes a DB context provider to the live path, NOT an LLM call site.
- `lib/sovereign/maiaService.ts:77` imports `lib/services/corpusCallosumService` (`logCorpusCallosumTrace`) — **pure-DB telemetry** (`import { query, queryOne } from '../db/postgres'`), writes `agent_runs`/`integration_passes` rows. NOT an LLM caller.
- `ClaudeService.ts` / `UnifiedInsightEngine.ts` are NOT imported by `maiaService.ts` or the live route (grep returned no usage).

**Conclusion: NO LLM call site in this slice sits on the live relational generation path.** Everything below is standalone feature / admin / practitioner-tool / dormant.

`lib/ai/modelService.generateText` (used by `lib/learning`, `lib/wisdom-engines`) defaults `MAIA_TEXT_PROVIDER='anthropic'` → Claude primary, local Ollama fallback (`lib/ai/modelService.ts:53,154,158,192`). Kimi/moonshot only when explicitly requested (`:126,139`).

## Classification table

| file:line | call-type + model | ROLE-CLASS | REACHABILITY | RECLAIM-JUDGMENT | why (≤12 words) |
|---|---|---|---|---|---|
| lib/services/ClaudeService.ts:57,152 (model :61 `claude-haiku-4-5`, :1205 `claude-sonnet-4-6`) | new Anthropic + messages.create | Rendering | secondary/feature (not imported by live route) | deliberate-delegation | Generic MAIA voice wrapper; phrasing, not classification |
| lib/services/conversationEssenceExtractor.ts:49,99 `claude-sonnet-4` | new Anthropic + messages.create | Intelligence-delegated | secondary/admin | reclaim-candidate | Essence extraction from conversation = summarization |
| lib/services/UnifiedInsightEngine.ts:149,180 + 352,404 `claude-sonnet-4` | new Anthropic + 2x messages.create | Intelligence-delegated | secondary/feature | reclaim-candidate | Insight/pattern synthesis; structured extraction |
| lib/services/FileIngestionService.ts:350 `gpt-4`; :272 `text-embedding-3-small` | openai.chat.completions.create + embeddings | Intelligence-delegated | secondary/feature | reclaim-candidate | **NON-CLAUDE (OpenAI)** file analysis + embeddings |
| lib/services/UnifiedVoiceRouter.ts:50,86,166 `tts-1`/`tts-1-hd` | new OpenAI (TTS) | Rendering (voice) | secondary/feature | deliberate-delegation | **NON-CLAUDE (OpenAI TTS)** primary, ElevenLabs fallback |
| lib/services/VoiceServiceWithFallback.ts:134 `tts-1-hd` | OpenAI TTS | Rendering (voice) | secondary/feature | deliberate-delegation | **NON-CLAUDE (OpenAI TTS)** voice synthesis |
| lib/services/SesameVoiceService.ts:427 `sesame-csm-1b`, :460,495 `tts-1-hd` | local Sesame + OpenAI TTS fallback | Rendering (voice) | secondary/feature | deliberate-delegation | Local TTS primary; **OpenAI TTS** fallback |
| lib/services/MaiaOrchestrator.ts:65 `claude-3-haiku-20240307` | (via client) messages | Boundary-case | dormant/orphaned (older orchestrator) | n/a | Legacy orchestrator; likely superseded by sovereign path |
| lib/services/conversation-analytics-service.ts:16 (`gpt-4o`/`gpt-5`/`claude` type) | type union only | Sovereign-substrate | secondary/admin | n/a | Type annotation, not a call site |
| lib/services/ConfigurationService.ts:154 `gpt-4` | config default string | Sovereign-substrate | secondary | n/a | Config default value, not a call |
| lib/learning/claude-teacher-service.ts:67,131 (via generateText) | modelService.generateText (Claude primary) | Intelligence-delegated | secondary/admin (training) | deliberate-delegation | Teacher-example generation for training pipeline |
| lib/learning/learning-orchestrator.ts:228,242,283 (Claude/deepseek) | modelService.generateText | Intelligence-delegated | secondary/admin (training) | deliberate-delegation | Training orchestration; claude-4 + deepseek engines |
| lib/learning/enhanced-maia-service.ts:267,299 (Claude/deepseek/local) | modelService.generateText | Boundary-case | dormant/orphaned (alt MAIA service) | n/a | Parallel MAIA service, not the live sovereign path |
| lib/learning/shadowModeRunner.ts:20 `deepseek-r1:8b` | local shadow engines | Intelligence-delegated | secondary (shadow eval) | deliberate-delegation | Local-only shadow comparison runner |
| lib/learning/maiaTrainingDataService.ts:206 `deepseek-r1:latest` | local engine ref | Intelligence-delegated | secondary/admin | deliberate-delegation | Training data gen via local engine |
| lib/rlm/CodebaseNavigator.ts:43,65 Ollama `/api/generate` | fetch localhost:11434 | Intelligence-delegated | secondary/dev-tool | deliberate-delegation | Local Ollama codebase nav (dev tool) |
| lib/rlm/security.ts:23 `api.anthropic.com` (allowlist) | allowlist string | Sovereign-substrate | n/a | n/a | Domain allowlist constant, not a call |
| lib/rlm/client.ts:308 `model:'unknown'` | metadata default | Sovereign-substrate | secondary | n/a | Default metadata string |
| lib/transcript-analysis/PatternExtractor.ts:47,200 `claude-3-5-sonnet-20241022` | new Anthropic + messages.create | Intelligence-delegated | secondary/admin | reclaim-candidate | Pattern extraction from transcripts |
| lib/transcript-analysis/TranscriptAnonymizer.ts:95,295,333 `claude-3-5-sonnet` | new Anthropic + 2x messages.create | Intelligence-delegated | secondary/admin | reclaim-candidate | PII anonymization via LLM (could be deterministic-er) |
| lib/content-pipeline/qualityFilter.ts:7,49 `claude-sonnet-4` | new Anthropic + messages.create | Intelligence-delegated | secondary/feature (content) | reclaim-candidate | Content quality classification/filtering |
| lib/content-pipeline/transformer.ts:7,46 `claude-sonnet-4` | new Anthropic + messages.create | Rendering | secondary/feature | deliberate-delegation | Content transformation/rewriting |
| lib/content-pipeline/extractor.ts:7,39 `claude-sonnet-4` | new Anthropic + messages.create | Intelligence-delegated | secondary/feature | reclaim-candidate | Content extraction |
| lib/content/transformer.ts:4,7 `claude-sonnet-4` | new Anthropic + messages.create | Rendering | secondary/feature | deliberate-delegation | Content transform (dup of content-pipeline) |
| lib/content/extractor.ts:4,11 `claude-sonnet-4` | new Anthropic + messages.create | Intelligence-delegated | secondary/feature | reclaim-candidate | Content extraction (dup) |
| lib/content/pipeline.ts:25 `claude-sonnet-4` | model metadata | Sovereign-substrate | secondary/feature | n/a | Records modelUsed; orchestration glue |
| lib/pipelines/document-analysis.ts:119,123 `claude-3-sonnet-20240229` | new Anthropic + messages.create | Intelligence-delegated | secondary/feature | reclaim-candidate | Document analysis/extraction |
| lib/patterns/generatePatternIntelligence.ts:140,173 (Claude) | new Anthropic + messages.create | Intelligence-delegated | secondary/admin | reclaim-candidate | Pattern intelligence synthesis from data |
| lib/secondbrain/secondBrainClassifier.ts:121,137 (Claude) | new Anthropic + messages.create | Intelligence-delegated | secondary/feature | reclaim-candidate | Note classification (classic reclaim candidate) |
| lib/dialectical-ai/core.ts:144,215 (Claude) | new Anthropic + messages.create | Boundary-case | dormant/orphaned (1-file dir) | n/a | Dialectical reasoning engine; verify any caller |
| lib/wisdom-engines/ai-intelligence-bridge.ts:304 (generateText) + :191,525 Ollama health | modelService.generateText + Ollama probe | Intelligence-delegated | secondary/feature | deliberate-delegation | Wisdom-engine bridge; Claude+local |
| lib/scribe/sovereignSummarizer.ts:156,161 `claude-haiku-4-5` | new Anthropic + messages.create | Intelligence-delegated | secondary/feature | reclaim-candidate | Session summarization |
| lib/scribe/sessionSummaryGenerator.ts:211,217 `claude-3-5-sonnet` | new Anthropic + messages.create | Intelligence-delegated | secondary/feature | reclaim-candidate | Session summary generation |
| lib/supervision/ClinicalSupervisionEngine.ts:171,189 `deepseek-r1:latest` (local) | local LLM only (HIPAA) | Intelligence-delegated | secondary/practitioner-tool | deliberate-delegation | **LOCAL-ONLY by design (HIPAA)**; clinical analysis |
| lib/supervision/SessionSynthesizer.ts:96,126 local LLM | local LLM (HIPAA) | Intelligence-delegated | secondary/practitioner-tool | deliberate-delegation | **LOCAL-ONLY (HIPAA)** essence synthesis |
| lib/caseload/CaseConsultationService.ts:13,219 `generateWithLocalModel` | local model client | Intelligence-delegated | secondary/practitioner-tool | deliberate-delegation | **LOCAL-ONLY** case consultation (sovereignty) |
| lib/caseload/CaseMemoryService.ts:12,145 `embedWithOllama` | local Ollama embeddings | Sovereign-substrate | secondary/practitioner-tool | deliberate-delegation | **LOCAL-ONLY** embeddings for case memory |
| lib/practice/InsightGenerator.ts:122 local model | local Ollama/DeepSeek (HIPAA) | Intelligence-delegated | secondary/practitioner-tool | deliberate-delegation | **LOCAL-ONLY (HIPAA)** insight generation |
| lib/team/maiaReflectService.ts:22,39 (Claude) | new Anthropic + messages.create | Intelligence-delegated | secondary/admin (team) | reclaim-candidate | Team reflection synthesis |
| lib/team/maiaThreadReflection.ts:187,196 (Claude) | new Anthropic + messages.create | Intelligence-delegated | secondary/admin (team) | reclaim-candidate | Thread reflection synthesis |
| lib/story/archetypalNarrativeService.ts:72,74 (Claude) | new Anthropic + messages.create | Rendering | secondary/feature | deliberate-delegation | Archetypal narrative generation (creative) |
| lib/media/processors.ts:369 Ollama `/api/generate` | fetch local Ollama | Intelligence-delegated | secondary/feature | deliberate-delegation | Local media processing |
| lib/astrology/spiralogicReportGenerator.ts:241,302 (Claude) | new Anthropic + messages.create | Rendering | secondary/feature | deliberate-delegation | Astrology report prose generation |
| lib/songwriter/seedInterpreter.ts:21,149 (Claude) | new Anthropic + messages.create | Rendering | secondary/feature | deliberate-delegation | Songwriting seed interpretation (creative) |
| lib/examples/maiaWithDevContext.ts:171 (Claude) | messages.create | Boundary-case | dormant/orphaned (example) | n/a | Example/demo file, not production |
| lib/alerting/real-time-alerts.ts:207 `twilioClient.messages.create` | **Twilio SMS** (NOT LLM) | Sovereign-substrate | secondary/ops | n/a | False positive — Twilio SMS send, not an LLM |

Dirs with NO LLM call site (DB/logic/types only): `lib/masters`, `lib/comms`, `lib/ethics`, `lib/community-library`, plus `lib/sovereignty` (only `driftAlarm.ts` references providers as a *type/string* `'anthropic'|'local_inference'|'ollama'` at :50 — telemetry, not a call), and most of `lib/services` (121 files; voice/config/analytics/DB).

## Notable findings

- **Live relational path: clean.** No LLM call in this slice is on it. The only two live-path imports — `maiaAstrologyContextService` (route.ts:96) and `corpusCallosumService` (maiaService.ts:77) — are both pure-DB (postgres `query`/`queryOne`), no `messages.create`. Generation stays in lib/sovereign + lib/ai.
- **Standalone features (Claude rendering, creative — keep delegated):** astrology report (`spiralogicReportGenerator`), songwriter (`seedInterpreter`), story (`archetypalNarrativeService`), content transformers. These vanish if Claude disappears, but they're non-core creative surfaces.
- **Reclaim candidates (classification/extraction/summarization — cheap+deterministic-ish):** `secondBrainClassifier`, `conversationEssenceExtractor`, scribe summarizers, `PatternExtractor`/`TranscriptAnonymizer`, content `extractor`/`qualityFilter`, `document-analysis`, `generatePatternIntelligence`, `UnifiedInsightEngine`. All secondary/admin reachability — none block live chat.
- **Practitioner tools are already sovereign (local-only by design):** `lib/supervision`, `lib/caseload`, `lib/practice` use Ollama/DeepSeek only with explicit HIPAA "never external APIs" comments. If Claude vanishes, these are unaffected.
- **SOVEREIGNTY FLAGS — non-Claude cloud providers (OpenAI):** `lib/services/UnifiedVoiceRouter.ts:8,50` (OpenAI TTS primary), `lib/services/VoiceServiceWithFallback.ts:134` + `lib/services/SesameVoiceService.ts:460,495` (OpenAI TTS fallback), and `lib/services/FileIngestionService.ts:350` (`gpt-4` analysis) + `:272` (`text-embedding-3-small`). These contradict the "Voice: local TTS/STT only" / "never OpenAI" canon lines — but all are voice/file-ingest features, NOT the relational text path. Reachability secondary/feature.
- **Dormant/orphaned to verify:** `lib/dialectical-ai/core.ts` (1-file dir), `lib/learning/enhanced-maia-service.ts` + `MaiaOrchestrator.ts` (parallel/legacy MAIA services not on sovereign path), `lib/examples/maiaWithDevContext.ts` (demo).
- **False positive:** `lib/alerting/real-time-alerts.ts:207` `messages.create` = Twilio SMS, not an LLM.
