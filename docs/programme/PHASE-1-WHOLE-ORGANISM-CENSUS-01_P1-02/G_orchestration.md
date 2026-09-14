# P1-02 · DOMAIN G — MODEL / PROVIDER / ORCHESTRATION

```text
STEP        P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN      G — provider ≠ model ≠ cognition ≠ MAIA identity ≠ authority
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — evidence, never rulings
AUTHORITY   READ / TRACE / CLASSIFY
```

> **P1-02 asks what the organism does. It does not infer from doing that the organism is
> authorized to do it.**

## 0 · Census conditions

- **Subject verification.** `git cat-file -t 1a5554300e855d3581085849301a39cbb10ab385` → `commit`;
  `1a555430 Merge pull request #1295 from SoullabTech/claude/ws-disclosure-orientation-transport-01`.
  Working tree HEAD is `f0279c5b`. `git diff --stat 1a555430 f0279c5b` touches **14 files, all
  under `docs/programme/`** (the P1-00/P1-01/P1-02 census records themselves). **No `lib/`, `app/`,
  `scripts/`, `Dockerfile` or compose file differs between the subject and the read tree**, so every
  `file:line` below is a reading at the subject.
- **No runtime, no database, no production access.** Per the instrument's LIVE calibration, nothing
  in this domain is recorded `LIVE` on traced code alone. The honest default here is
  `WIRED-BUT-UNOBSERVED`.
- **Vocabulary rule applied.** `provider` collides across at least four referents in this domain:
  a *tiered admission category* (`scripts/provider-policy.json`), a *`ProviderName` union member*
  (`lib/ai/types.ts:11-19`), a *`StructuredProvider` execution interface*
  (`lib/ai/structured/types.ts`), and a *TTS/STT vendor* (voice guards). Findings below attach to
  files, not to the word.

---

## 1 · Capability records

### G-01 · Plain-text inference dispatch (`generateText`)

| Field | Reading |
|---|---|
| **CAPABILITY** | The declared "main gateway for ALL text generation in MAIA" (`lib/ai/modelService.ts:71-76`). |
| **DECLARED WHERE** | `lib/ai/modelService.ts:76` `export async function generateText(req: TextRequest)`. |
| **COMPUTED WHERE** | Branching in `modelService.ts:83-193`. |
| **PERSISTED WHERE** | Nothing persisted at this seam. Token-usage lines are `console.info` only (`modelService.ts:45`). |
| **LOADED WHERE** | Config read at **module load**, not per call: `MAIA_INFERENCE_MODE` (`:10`), `TEXT_MODEL_PROVIDER` (`:52-53`), `MAIA_ORCHESTRATION_TYPE` (`:56-57`), `ENABLE_MULTI_ENGINE` (`:58`). |
| **SURFACED WHERE** | `ProviderMeta` returned to callers; surfaced to the operator as `console.log` in `lib/sovereign/maiaService.ts:1575` (FAST) and `:2002` (CORE). |
| **UPDATED WHERE** | Not updated at runtime — a process restart is required to change mode. |
| **CANONICAL CALL PATH** | `app/api/sovereign/app/maia/list/route.ts:89,1364-1365` → `getMaiaResponse()` (`lib/sovereign/maiaService.ts`) → `generateText()` at `maiaService.ts:1561` (FAST), `:1988` / `:2027` (CORE), `:2554` (DEEP-adjacent), `:3380` (canonical generation). |
| **UPSTREAM DEPENDENCIES** | `localModelClient`, `claudeClient`, `kimiClient`, `multiEngineOrchestrator`, `sovereignRouter` (`modelService.ts:2-6`). |
| **DOWNSTREAM CONSUMERS** | 8 non-test importers: `lib/sovereign/maiaService.ts:6`, `lib/consciousness/claudeConsciousnessService.ts:4`, `lib/wisdom-engines/ai-intelligence-bridge.ts:17`, `lib/sovereign/wisdomTranslation.ts:9`, `lib/learning/learning-orchestrator.ts:12`, `lib/learning/claude-teacher-service.ts:12`, `lib/learning/enhanced-maia-service.ts:21`, `app/api/studio/session-followup/generate/route.ts:11`. |
| **MEMBER AUTHORITY** | NONE FOUND. No member-reachable control over provider, model or mode was traced. |
| **MAIA AUTHORITY** | NONE FOUND at this seam. `generateText` neither consults nor asserts a MAIA identity object. |
| **PRACTITIONER AUTHORITY** | NONE FOUND. |
| **SYSTEM AUTHORITY** | Total, via process environment. `TEXT_MODEL_PROVIDER` is read straight from `MAIA_TEXT_PROVIDER` with no validation (`:52-53`); an unrecognized value falls through every branch to the local Ollama call at `:187`. |
| **GOVERNANCE GATE** | **NONE FOUND at runtime.** One inline string check exists — `modelService.ts:89-91` throws if `TEXT_MODEL_PROVIDER === 'openai'` — and it is the *only* runtime provider refusal traced in this file. `scripts/provider-policy.json` is **not read by any runtime code**; it is loaded only by `scripts/check-provider-governance.ts:32` (see G-12). |
| **FAILURE MODE** | Depends on a branch not determinable from the repository — see G-02 / Contradiction C-1. |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` |
| **SOURCE EVIDENCE** | `lib/ai/modelService.ts:1-244`. |
| **UNRESOLVED** | Whether `MAIA_INFERENCE_MODE` is set in production. The variable appears in **no tracked deployment config** — only in test/gate scripts and `docker-compose.production.yml:886` as a prose comment describing a `sovereign` compose profile. Production value is `UNKNOWN`. |

---

### G-02 · Sovereign routing seam — the degrading failure path

| Field | Reading |
|---|---|
| **CAPABILITY** | Routes a plain-text request under an explicit inference mode and decides what happens when a provider fails. |
| **DECLARED WHERE** | `lib/ai/sovereignRouter.ts:134-140` `generateTextWithSovereignty`. |
| **COMPUTED WHERE** | `sovereignRouter.ts:64-131`. |
| **PERSISTED WHERE** | Nothing. |
| **CANONICAL CALL PATH** | `modelService.ts:83-85` → `generateTextWithSovereignty(req, MAIA_INFERENCE_MODE, t0)`. Reached **only** when `MAIA_INFERENCE_MODE` is non-empty. |
| **MEMBER AUTHORITY** | NONE FOUND. |
| **MAIA AUTHORITY** | See FAILURE MODE — the seam emits text **in MAIA's first person** without any MAIA cognition having run. |
| **SYSTEM AUTHORITY** | Mode selection is environment-only. |
| **GOVERNANCE GATE** | NONE FOUND. The mode string is passed through from `modelService.ts:10` unvalidated; `sovereignRouter.ts:129-130` treats an unrecognized mode as "unreachable" and returns `degradedResult`. |
| **FAILURE MODE** | ⭐ **DEGRADES WITH A FABRICATED FIRST-PERSON MAIA UTTERANCE.** `sovereignRouter.ts:15-17` defines `DEGRADED_TEXT = "MAIA is here. I've saved your message. My local voice is temporarily limited; I'll return with a fuller response as soon as capacity is back."` `degradedResult()` (`:50-61`) returns it as `TextResult.text` with `provider: 'unknown'`, `model: 'degraded'`, `mode: 'fallback'`, `reason: 'all_providers_unavailable'`. Four branches return it: `:77` (sovereign/local_only, local unhealthy), `:85` (sovereign/local_only, local threw), `:117` (primary, local also unhealthy), `:125` (primary, local fallback threw). |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` |
| **SOURCE EVIDENCE** | `lib/ai/sovereignRouter.ts:1-140`. |

**Four structural observations, recorded without repair:**

1. **The degraded string is returned as MAIA's turn, not as an error.** It is a `TextResult`
   indistinguishable in type from a generated answer; callers receive `text` and a `ProviderMeta`.
   `lib/sovereign/maiaService.ts:1561` destructures `{ text: response, provider }` and proceeds.
2. **The string asserts an act — *"I've saved your message"* — that this seam does not perform.**
   `sovereignRouter.ts` contains no persistence call of any kind. Whether the caller persists the
   turn is caller-dependent and **is not resolved here**.
3. **Three of the four degraded exits emit no drift event.** `emitDriftEvent('silent_fallback', …)`
   is called at `sovereignRouter.ts:105` **only** on the Anthropic→local transition inside
   `mode=primary` — i.e. only when a fallback *succeeds or is attempted*, never when the degraded
   text is actually returned at `:77`, `:85`, `:117`, `:125`.
4. **The fail-fast branch cannot fire from `claudeClient`.** `sovereignRouter.ts:101` and
   `modelService.ts:167` both check `err?.noFallback || err?.code === 'ANTHROPIC_BILLING_ERROR'`.
   A repository-wide grep finds **no site that sets either property** (`ANTHROPIC_BILLING_ERROR`
   appears only at those two read sites; `noFallback` additionally only at
   `app/api/ai/health/route.ts:27`, an unrelated health field). `claudeClient.ts:199-205` catches
   every error and re-throws `new Error(\`Claude generation failed: ${errMsg}\`)`, which carries
   neither property. **The billing/auth no-fallback guard is, as read, unreachable from the
   Anthropic client.** `REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.

---

### G-03 · Anthropic plain-text adapter and model selection

| Field | Reading |
|---|---|
| **CAPABILITY** | Sends a plain-text turn to Anthropic and chooses which Claude model serves it. |
| **DECLARED WHERE** | `lib/ai/claudeClient.ts:114` `generateWithClaude`; model policy at `:50-86` `selectClaudeModel`. |
| **COMPUTED WHERE** | `claudeClient.ts:50-86` (selection), `:149-157` (`client.messages.create`). |
| **PERSISTED WHERE** | `logVoiceTierTelemetry({ tier, reason, model, userId, … })` at `:176-186` — the only provider/model fact this domain writes to a store. Failures swallowed (`.catch(() => {})`, `:186`). |
| **SURFACED WHERE** | Operator only: `MODEL_ROUTING` JSON log (`:60-66`), `🎭 Voice selection` (`:140`), `ProviderMeta.tier`/`.reason` (`:188-198`). |
| **MODELS NAMED** | `OPUS_MODEL = process.env.CLAUDE_REASONING_MODEL \|\| 'claude-opus-4-6'` (`:13`); `SONNET_MODEL = process.env.CLAUDE_VOICE_MODEL \|\| 'claude-sonnet-4-6'` (`:14`). Ceiling `CLAUDE_MAX_TOKENS` default `2048` (`:15`); `CLAUDE_TEMPERATURE` default `0.65` (`:16`). |
| **SELECTION RULE, AS READ** | `forceOpus` → Opus (`:70-72`); `forceSonnet` → Sonnet (`:73-75`); `meta.reasoningMode ∈ {ain_deliberation, consultation, analysis, deep_reasoning}` → Opus (`:19`, `:78-80`); **everything else → Sonnet** (`:85`). |
| **MEMBER AUTHORITY** | NONE FOUND. |
| **MAIA AUTHORITY** | Declared in comments only — `:11-12` *"MAIA's mind is the consciousness system … Claude is the MOUTH"*. No object, check or assertion enforces it at this file. |
| **GOVERNANCE GATE** | **NONE FOUND.** `meta` is an untyped `Record<string, unknown>` (`:91`); `forceOpus` / `forceSonnet` / `reasoningMode` are read straight from it with no provenance check on who set them. |
| **FAILURE MODE** | Throws (`:122` no key; `:161` unexpected block type; `:166` empty text; `:204` wrapped API error). Never degrades here. |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` |

⭐ **ADR-001 names this file and the code no longer implements it.**
`docs/adr/001-seven-level-awareness-source-of-truth.md` (**Status: Accepted, 2024-12-30**) tabulates
`| Opus/Sonnet Routing | 7 levels | lib/ai/claudeClient.ts |` (`:15`) and prescribes
`L1 … Always Opus`, `L2 … Always Opus`, `L5–L7 … Opus for depth, Sonnet for casual` (`:37-43`), with
*"All model routing decisions MUST …"* at `:138`. At the subject, `selectClaudeModel()` **never
reads an awareness level.** The awareness level appears in this file exclusively inside a **log
string** — `consciousnessPolicy?.awarenessLevel` → `awarenessLog` (`claudeClient.ts:136-140`) — and
the code states a different rule in its own comment: *"NEW PHILOSOPHY (Jan 2026)"* (`:33`).
**Both sides preserved; no document recording the supersession was located.** See Contradiction C-4.

---

### G-04 · Structured inference seam — the refusing failure path

| Field | Reading |
|---|---|
| **CAPABILITY** | Executes a pinned-model, tool-contract request and **refuses** rather than substituting a provider. |
| **DECLARED WHERE** | `lib/ai/structured/router.ts:65-73` `runStructured` (the only exported routing path); policy at `lib/ai/structured/policy.ts:38-52`. |
| **COMPUTED WHERE** | `router.ts:89-114` (`route`, private), `:116-131` (`execute`). |
| **PERSISTED WHERE** | `ReaderProvenance` written by `lib/manuscript/structure/proposalStore.ts:179-180` (`frozenAt` stamped at write). |
| **CANONICAL CALL PATH** | 5 non-test callers: `lib/manuscript/structure/maiaReader.ts:51,738` · `lib/manuscript/ask/askReader.ts:22,232` · `lib/manuscript/ask/developmentalAskReader.ts:33,206` · `lib/manuscript/developmentalReader/read.ts:26,123` · `lib/manuscript/developmentalReading/classify.ts:23,209`. |
| **MODELS NAMED** | `'claude-opus-5'` as the default in all four pinning callers: `maiaReader.ts:118` (`MAIA_STRUCTURE_READER_MODEL`), `askReader.ts:31` (`MAIA_ASK_MODEL`), `developmentalAskReader.ts:40` (`MAIA_ASK_MODEL`), `developmentalReader/read.ts:50` (`MAIA_DEVELOPMENTAL_READER_MODEL`). |
| **MEMBER AUTHORITY** | NONE FOUND. |
| **MAIA AUTHORITY** | The caller pins model, system, messages, tools and token ceiling; the platform owns whether the provider is authorized (`policy.ts:9-13`). `router.ts:30-31`: *"NO MODEL POLICY RUNS HERE. `selectClaudeModel` is unreachable."* |
| **SYSTEM AUTHORITY** | `resolveStructuredMode()` reads `MAIA_INFERENCE_MODE`; unset → `primary` (`policy.ts:43`); an invalid value → refusal `invalid_inference_mode`, **never a default** (`policy.ts:47-51`). |
| **GOVERNANCE GATE** | ⭐ **PRESENT, and it is the only structural runtime provider gate found in Domain G.** `EXTERNAL_AUTHORIZED = ['primary']` (`router.ts:45`); `LOCAL_STRUCTURED_PROVIDER = null` (`:53`); under `sovereign`/`local_only` the seam returns `{ ok:false, refusal:'structured_inference_unavailable' }` (`:98-102`) rather than reaching past the mode. The boundary is enforced by **absence of a second export** (`:75-88`), not by naming convention. |
| **FAILURE MODE** | ⭐ **REFUSES.** `execute()` catch → `{ ok:false, refusal:'provider_unavailable', detail }` (`router.ts:125-129`), with the in-file rule at `:121-124`: *"THE FAILURE STOPS HERE. No second provider, no local text path, no degraded template."* Adapter-load failure → `refusal:'not_configured'` (`:111`). |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` |
| **SOURCE EVIDENCE** | `lib/ai/structured/{router,policy,types,anthropicStructuredAdapter}.ts`. |

**This is one half of Contradiction C-1.** The same repository, at the same subject, contains a
seam that degrades in MAIA's voice (G-02) and a seam that refuses (G-04). Both are live code on
reachable paths. Neither is a document.

---

### G-05 · Local inference client (`maia-local-inference`)

- **DECLARED** `lib/ai/localInferenceClient.ts:34` `isLocalHealthy`, `:51` `callLocalInference`.
- **ENDPOINT** `LOCAL_INFERENCE_BASE_URL` default `http://maia-local-inference:8080` (`:10`);
  `/health` (`:12`), `/v1/generate` (`:13`); timeout floor 1000 ms, default 15 000 (`:11`).
- **CIRCUIT BREAKER** 45 s in-process (`:16-26`), tripped on health failure (`:45`) and on generate
  failure (`:91`). **Process-local, not shared** — no cross-instance state was traced.
- **MODEL** Not selected by MAIA. The adapter reports back whatever the service says, defaulting to
  the literal `'local'` (`:80`). ⭐ **No model is named on the sovereign text path.**
- **PROMPT SHAPE** `prompt: \`${req.systemPrompt}\n\n${req.userInput}\`` (`:60`) — system and user are
  **concatenated into one field**, losing the role separation the Anthropic path preserves
  (`claudeClient.ts:153-156`).
- **INFRA** `docker-compose.production.yml:895-896` `maia-local-inference`, `profiles: ["sovereign"]`
  — the service **only starts** when the sovereign compose profile is selected (`:886-888`).
- **GOVERNANCE GATE** NONE FOUND. **CURRENT STATUS** `WIRED-BUT-UNOBSERVED`.

---

### G-06 · Legacy local model client (Ollama / DeepSeek)

- **DECLARED** `lib/ai/localModelClient.ts:9` `LOCAL_PROVIDER` (`'ollama' | 'consciousness_engine'`),
  `:12` `OLLAMA_BASE_URL \|\| DEEPSEEK_BASE_URL \|\| 'http://localhost:11434'`,
  `:21-22` `OLLAMA_MODEL \|\| DEEPSEEK_MODEL \|\| 'llama3.1:8b'`.
- **CALL PATH** `modelService.ts:187` — the **unconditional terminal branch** of the legacy path.
  Reached when Claude throws and `SMOKE_NO_FALLBACK` is unset (`modelService.ts:180-181`), and also
  whenever `TEXT_MODEL_PROVIDER` holds an unrecognized value.
- **TEMPLATE ENGINE** `localModelClient.ts:56` returns `model: 'template-engine'` under the
  `consciousness_engine` provider — a **fourth answer-producing path that is not a model at all**.
- **GOVERNANCE GATE** NONE FOUND. **CURRENT STATUS** `WIRED-BUT-UNOBSERVED`.

---

### G-07 · Moonshot / Kimi — a cloud provider in no tier

| Field | Reading |
|---|---|
| **DECLARED WHERE** | `lib/ai/kimiClient.ts:11` `MOONSHOT_BASE_URL \|\| 'https://api.moonshot.ai/v1'`; `:12` `MOONSHOT_MODEL \|\| 'kimi-k2.5'`; `:13` max tokens 4096; `:68` availability = presence of `MOONSHOT_API_KEY`. |
| **CALL PATH** | `modelService.ts:127-151`. Two independent triggers: `TEXT_MODEL_PROVIDER === 'moonshot'` **or** `req.meta?.useKimi` — i.e. **a per-request `meta` flag from any caller selects a third-party cloud provider**. Per-request model override at `kimiClient.ts:96` (`meta?.model`). |
| **DECLARED SCOPE** | Comment at `modelService.ts:126`: *"Never used for live chat - only when explicitly requested."* **No code enforces that scope** — `meta` is unvalidated (`modelService.ts:68`). |
| **MEMBER AUTHORITY** | NONE FOUND. **MAIA AUTHORITY** NONE FOUND. |
| **GOVERNANCE GATE** | **NONE FOUND, at any layer.** `moonshot` appears in **no tier** of `scripts/provider-policy.json` (neither `production`, `lab`, nor `forbidden`). `scripts/check-provider-governance.ts:34-40` matches only OpenAI patterns, so it cannot see Moonshot. `scripts/check-no-direct-anthropic.ts` matches only `@anthropic-ai/sdk`. It is nevertheless a first-class member of the sovereignty-auditing type: `ProviderName` includes `'moonshot'` (`lib/ai/types.ts:16`). |
| **FAILURE MODE** | If explicitly selected as `TEXT_MODEL_PROVIDER`, rethrows (`modelService.ts:144-146`); if selected by `meta.useKimi`, falls through to Claude (`:148`). |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` |

---

### G-08 · Multi-engine orchestration

- **DECLARED** `lib/ai/multiEngineOrchestrator.ts` (`generateWithMultipleEngines`, `OrchestrationType`).
- **CALL PATH** `modelService.ts:94-123`, gated by `ENABLE_MULTI_ENGINE` (`MAIA_ENABLE_MULTI_ENGINE === 'true'`, `:58`) **AND** (`TEXT_MODEL_PROVIDER === 'multi_engine'` **OR** `req.meta?.useMultiEngine`).
- **RESULT SHAPE** `text: consensus || primaryResponse` (`:113`), `model: \`orchestration:${type}\`` (`:116`) — ⭐ **the model field records an orchestration label, not a model.**
- **CONSUMERS of the type only** `lib/consciousness/response-cache.ts:11`, `orchestration-optimizer.ts:11`, `consciousness-layer-wrapper.ts:6`, `lib/development/claude-dev-orchestration.ts:13`, `lib/wisdom-engines/ai-intelligence-bridge.ts:22`, `lib/conversation/safe-strategy-plan.ts:13`.
- **GOVERNANCE GATE** NONE FOUND. **CURRENT STATUS** `WIRED-BUT-UNOBSERVED` (a `meta` flag alone can select it).

---

### G-09 · Model registry — consciousness-aware model selection

- **DECLARED** `lib/ai/modelRegistry.ts:40` `MODEL_REGISTRY`: 9 profiles (`deepseek-r1`,
  `deepseek-r1-distill-qwen-32b`, `ministral-3b/8b/14b`, `devstral-24b`, `mistral-large-3`,
  `llama-3.3-70b`, `llama-3.1-8b`), providers `'ollama' | 'llamacpp' | 'mlx'` (`:6`).
- Carries `consciousnessDepth`, `elementalAffinity`, and `minimumBloomLevel?` — *"Developmental gate
  (if applicable)"* (`:31`) — i.e. a **model gate keyed to a developmental attribute of a person**,
  declared as a type field.
- Exports `selectOptimalModel` (`:202`) and `getModelFallbackChain` (`:254`).
- ⭐ **No importer exists.** A tree-wide grep for `modelRegistry` outside the file itself returns one
  hit, a prose comment in `lib/types/interpretive-ledger.ts:25`. File opens `// @ts-nocheck` (`:1`).
- **GOVERNANCE GATE** NONE FOUND. **CURRENT STATUS** `DORMANT`.
- **UNRESOLVED** Whether `minimumBloomLevel` was ever evaluated anywhere. Not traced.

---

### G-10 · Direct-SDK dispatch population — the answer to "one point or several"

| Field | Reading |
|---|---|
| **CAPABILITY** | Files that call Anthropic directly, bypassing `sovereignRouter` and `selectClaudeModel`. |
| **DECLARED WHERE** | `scripts/anthropic-import-allowlist.json`, three tiers. |
| **COUNTS, AS WRITTEN** | `approved` **2** (`lib/ai/claudeClient.ts`, `lib/ai/structured/anthropicStructuredAdapter.ts`) · `operational` **1** (`app/api/anthropic/ping/route.ts`) · `grandfathered` **57**. |
| **WHAT GRANDFATHERED MEANS, AS WRITTEN** | *"Legacy cognitive surfaces that bypass sovereignRouter. Each one is an intelligence layer that currently delegates its reasoning to substrate instead of executing its own logic."* |
| **MEMBER-FACING ENTRIES** | Includes 7 HTTP route handlers, e.g. `app/api/maia/living-field/[fieldKey]/encounter/route.ts` (*"Cognitive surface, pins Sonnet"*), `.../refine/route.ts` (*"pins Haiku"*), `app/api/maia/relational-navigation/route.ts`, `app/api/portal/[slug]/chat/route.ts`, `app/api/practitioner/practice-field/draft/route.ts` (*"pins Haiku"*), `app/api/studio/with-me/sessions/[sessionId]/synthesize/route.ts` (*"pins Sonnet"*). |
| **RECORDED GUARD GAP** | The allowlist's own note `_batch_2026-07-27`: seven entries *"shipped AFTER this guard landed (2026-05-20) without being allowlisted — their lanes did not exercise preflight/pre-commit, so the guard never fired."* ⭐ Same family as the branch-policy finding: **a declared gate that was absent rather than satisfied.** |
| **GOVERNANCE GATE** | Build/commit-time only (G-13). **NONE FOUND at runtime** — nothing prevents these files executing. |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` for the routes; the allowlist itself is `LIVE` as a commit gate only in the sense that it is wired into `.githooks/pre-commit:43`. |

⭐ **ANSWER TO "single dispatch point or several": SEVERAL, and enumerated.** By the project's own
allowlist there are **60 files** holding a direct vendor SDK import, of which **2** are the declared
adapter layer. `lib/ai/modelService.ts:71-73` calls itself *"Main gateway for ALL text generation"*;
the allowlist is the repository's own record that it is not.

---

### G-11 · OpenAI in the live tree

| Field | Reading |
|---|---|
| **DECLARED WHERE** | `scripts/provider-policy.json` → `tiers.lab.providers.openai` = `{ capabilities: ["benchmark"], status: "removal_in_progress" }`; `tiers.forbidden.rules` bans `NEXT_PUBLIC_*OPENAI*` browser keys. |
| **ENUMERATED DEBT** | `quarantine_browser_keys` **3 files** (`lib/voice/PersonalizedVoiceService.ts`, `lib/services/VoiceServiceWithFallback.ts`, `lib/utils/modelService.ts`); `pending_migration` **29 files**; `governance_scripts` **2**; `legacy_backend` path-prefix `app/api/_backend/`. |
| **VERIFIED AT SUBJECT** | A grep for `from 'openai'` / `new OpenAI(` / `api.openai.com` across `lib/` and `app/`, **excluding `_backend/`**, returns **30 files**, matching the enumerated live-tree debt in kind. |
| **TYPE-LEVEL** | `'openai'` is a member of `ProviderName` (`lib/ai/types.ts:15`). |
| **BUILD-LEVEL** | `Dockerfile:57` `ENV OPENAI_API_KEY=dummy-build-key` — *"Build-time placeholders for Next.js static generation"* (`:56`). The build expects the variable to exist. |
| **GOVERNANCE GATE** | Commit/CI-time only (G-12). **NONE FOUND at runtime.** |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` (code present and reachable; no runtime witness in-repo). |
| **CONTRADICTION** | See C-2 — `CLAUDE.md` states *"Never use OpenAI or other cloud AI providers"*. |

---

### G-12 · Provider-governance guard (`check:no-openai`)

- **DECLARED** `scripts/check-provider-governance.ts`; policy at `scripts/provider-policy.json:32`.
- **WHAT IT ENFORCES, AS READ** — four regexes (`:34-40`): `from 'openai'` / `require('openai')` /
  `new OpenAI(`; `from '@langchain/openai`; `api.openai.com`; and the FORBIDDEN
  `NEXT_PUBLIC_[A-Za-z0-9_]*OPENAI`. Scans **tracked files only**, extensions `.ts .tsx .js .jsx
  .mjs .cjs` (`:42`), ignoring `node_modules/ .next/ dist/ build/ coverage/ artifacts/ backups/
  ios/ android/ .DISABLED/ .md .mdx` (`:43`). Exit 1 on any hit outside the allowlist (`:111`);
  exit 2 if the policy file is missing (`:48`).
- **WHAT IT DOES NOT ENFORCE** — it matches **no** pattern for Moonshot, Google, Mistral, Cohere or
  any other non-Anthropic cloud provider. **`"or other cloud AI providers"` has no mechanical
  expression anywhere in the repository.** It also cannot see `.md` files, `_backend/` (allowlisted
  by prefix), or anything untracked.
- **WIRING** `package.json:45` `check:no-openai`; run by `preflight` (`:111`), `ci:sovereignty`
  (`:109`), and `.githooks/pre-commit:39`.
- **CURRENT STATUS** `WIRED-BUT-UNOBSERVED` as a gate (no run record read at the subject); its
  **scope** is `LIVE` in the sense that the script and its allowlist both exist and agree.
- ⚠️ **BUILD-TIME, NOT RUNTIME.** It prevents new *source* surfaces. It has no effect on a running
  container.

---

### G-13 · Direct-Anthropic guard (`check:no-direct-anthropic`) — named in no canon document

- **EXISTENCE VERIFIED** `scripts/check-no-direct-anthropic.ts`, 199 lines, at the subject.
- **WHAT IT ENFORCES, AS READ** — finds tracked files importing `@anthropic-ai/sdk` via `from`,
  `require(`, or dynamic `import(` with a quoted specifier (`:79-90`: bare mentions in comments
  deliberately do **not** match). Any importer not in `approved ∪ operational ∪ grandfathered`
  fails with exit 1 (`:125`, `:196`). Missing or unparseable allowlist → exit 2 (`:69`, `:76`).
  Stale allowlist entries are **reported, never failed** (`:129`, `:142-153`).
- **WHAT IT DOES NOT ENFORCE** — it does not distinguish a cognitive surface from an operational
  one beyond which list a human put it in; it does not check models, prompts, or fallback; it
  cannot see untracked files.
- **SELF-DECLARED AUTHORITY** `:32-34` cites `CLAUDE.md — MAIA Sovereignty section` and two
  `docs/orientation/` documents. **It cites no canon document, and no canon document names it.**
- **WIRING** `package.json:42`; `preflight` (`:111`); `.githooks/pre-commit:43`. ⛔ Note it is **not**
  in `ci:sovereignty` (`package.json:109`), which runs `check:no-openai` but not this guard.
- **CURRENT STATUS** `WIRED-BUT-UNOBSERVED`. **GOVERNANCE GATE for itself: NONE FOUND** — see
  Unlocated governance U-2.

---

### G-14 · Drift alarm — the only provider-transition signal

- **DECLARED** `lib/sovereignty/driftAlarm.ts:39-45` `DriftEventType` (includes `'silent_fallback'`),
  `:115` `emitDriftEvent`.
- **BEHAVIOUR** Always writes `console.warn` with `{ kind:'drift_alarm', type, …payload, host, commit,
  at }` (`:120-128`); then, if `TELEGRAM_BOT_TOKEN` and `PRACTITIONER_TELEGRAM_CHAT_ID` are set and
  the per-type throttle allows (`:130`, `:135-138`), fires a Telegram message. *"Never throws. Never
  blocks."* (`:113`).
- **AUDIENCE** ⭐ **Operator/practitioner, never the member.** Nothing in this path reaches a member
  surface. The `silent_fallback` label (`:79` *"⚠️ Provider silent fallback"*) and the call-site
  comment (`sovereignRouter.ts:103-104`: *"The member doesn't see this transition"*) both state this
  explicitly.
- **CALL SITES** `sovereignRouter.ts:105` (provider), `lib/maia/fieldContextAdapter.ts:101,118,127`
  (field — a different domain).
- **GOVERNANCE GATE** NONE FOUND. **CURRENT STATUS** `WIRED-BUT-UNOBSERVED`.

---

### G-15 · Reader provenance — the nearest thing to identity-under-provider

| Field | Reading |
|---|---|
| **DECLARED WHERE** | `lib/manuscript/structure/readerProvenance.ts:12-21` `ReaderProvenance { provider:'anthropic'; model; promptHash; readerVersion; frozenAt }`; `:24` `ReaderIdentity = Omit<…,'frozenAt'>`. |
| **COMPUTED WHERE** | `lib/manuscript/developmentalReader/read.ts:104-106` `readerIdentity(model)` → `{ provider:'anthropic', model, promptHash: promptContractHash(), readerVersion: READER_VERSION }`. |
| **PERSISTED WHERE** | `lib/manuscript/structure/proposalStore.ts:179-180` stamps `frozenAt` at the write; read back at `:206` from `row.reader_provenance`. |
| **WHAT IT IS** | ⭐ An identity of **the reading**, not of MAIA: provider + model + a SHA-256 over system prompt and tool contract together + a reader version. It is the only object traced in this domain that binds *who read* to *what was produced*. |
| **WHAT IT IS NOT** | ⭐⭐ `provider` is the **string literal type `'anthropic'`** (`readerProvenance.ts:13`). A different provider is **not representable** in this record. It therefore cannot express, and does not survive, a provider change — it forecloses one at the type level rather than preserving identity across one. |
| **SCOPE** | Writer's-Studio manuscript reading only. It does **not** cover `getMaiaResponse`, voice, or any conversational turn. |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` |

---

### G-16 · Deploy-lane lock (`scripts/deploy-lock.sh`)

*Read only. Not executed.*

- **WHAT IT ENFORCES, AS READ** — exclusive **non-blocking** `flock -n` on fd 9 against
  `$PROJECT_DIR/.deploy.lock` (`:142-147`); never queues, refuses with exit 1 and prints the
  holder's `pid= started= user= entry= target= target_sha=` (`:88-119`). `checkout_head=` is printed
  **only when it differs** from `target_sha`, explicitly labelled *"informational, NOT the deploy
  target"* (`:120-121`). On hosts without `flock`, a PID-file fallback with loud warning (`:152`).
  Refusal text instructs never to delete the lockfile to force entry (`:67`).
- ⭐ **It also exports `DEPLOY_LANE_TOKEN="deploy-lane"` (`:185`)** — the single mechanism that makes
  the Dockerfile tripwire (G-17) satisfiable. Acquiring the lock *is* the grant of build authority.
- **ENTRY POINTS THAT TAKE IT** `deploy-production.sh` `deploy` (`:452`), `update` (`:555`),
  `migrate` (`:640`), `rollback` (`:746`); `pre-deploy-gate.sh deploy-maia` (`:234`).
- **CURRENT STATUS** `WIRED-BUT-UNOBSERVED` in this container.

---

### G-17 · Deploy provenance and the build tripwire

*Read only. Not executed.*

- **TRIPWIRE** `Dockerfile:23-42` — `ARG DEPLOY_LANE_TOKEN=""`; a build with it empty prints
  `🛑 OUT-OF-LANE BUILD REFUSED` and `exit 1`. `docker-compose.production.yml:536-537` passes
  `DEPLOY_LANE_TOKEN: ${DEPLOY_LANE_TOKEN:-}` **with no default**, so only a lock-holding shell can
  build. The token is baked as `ENV DEPLOY_LANE` (`Dockerfile:86-90`) and the file states its own
  limit: *"a tripwire against the QUIET bypass, not a forgery-proof credential"* (`:20-21`).
- **IMMUTABLE SHA** `scripts/deploy-context.sh:190` `deploy_ctx_materialize` uses `git archive <SHA>`
  into an isolated context (`:26`, `:210`), exporting `MAIA_BUILD_CONTEXT` and `GIT_COMMIT` (`:238-239`).
  `deploy_ctx_assert_and_materialize` (`:249`) is the named-commit entry.
- **VERIFICATION, THREE POINTS** pre-swap image check `deploy_ctx_verify_image` (`:375-389`,
  blocks on mismatch); post-swap **dual-channel** `deploy_ctx_verify_running` comparing `printenv`
  against `Config.Env` against the asserted SHA (`:400-423`); plus
  `deploy_ctx_refuse_compose_runtime_override` (`:324`) and `deploy_ctx_refuse_env_collision` (`:357`),
  which exist because *"the image carried `GIT_COMMIT=2fafaa4c4` … while the running container
  reported `GIT_COMMIT=unknown`"* (`:63-64`).
- **PRE-DEPLOY GATE** `scripts/pre-deploy-gate.sh` — Gate 1 provenance refuses empty/`unknown`
  (`:85-97`); Gate `colab` runs `verify-constitution-colab.ts` **inside the running container**
  (`:116`) and blocks if the container is not running (`:123`); disk gate (`:192`);
  `deploy-maia` sequence at `:228-265`: lock → materialize → gates → build → verify image →
  `tag_images_for_rollback` (`scripts/deploy-tag.sh:33`) → swap → verify running.
- **CURRENT STATUS** `WIRED-BUT-UNOBSERVED` in this container.

---

### G-18 · Migration execution — what gates schema separately from code

*Read only. Not executed.*

| Field | Reading |
|---|---|
| **DECLARED WHERE** | `scripts/deploy-production.sh:82-118` `run_migrations_or_abort`; `:639-648` `cmd_migrate`; `docker-compose.production.yml:529-537` the `migrate` service (`target: builder`, same Dockerfile, same lane token). |
| **ORDER, AS READ** | `deploy` (`:448-546`): lock → materialize → build → swap → provenance verify → **migrate** (`:538`) → success (`:540`) → smoke (`:546`). `update` (`:552-633`) mirrors it (`:626`). |
| **FAIL-CLOSED** | Migration failure now **aborts** — `run_migrations_or_abort` prints `⛔ DATABASE MIGRATIONS FAILED — DEPLOYMENT ABORTED` and `exit 1` (`:93`, `:117`), skipping smoke deliberately (`:98-99`). Attributed in-file to **DEPLOYMENT-SAFETY-01, founder ruling 2026-09-14** (`:61`). |
| **WHAT THE SCRIPT SAYS IT CANNOT DO** | `:73-78`, verbatim: *"Migrations run AFTER the container swap … by the time a failure is visible the reader is already live. Propagation makes the deploy fail closed and routes the operator to rollback; it cannot retroactively prevent the swap. Whether migrate should precede the swap is a deploy-ORDERING question … deliberately NOT decided here."* |
| **SEPARATE MIGRATION GATE** | ⭐⭐ **NONE FOUND.** `cmd_migrate` (`:639-648`) takes the deploy-lane lock with the label `"migrations only (no image is built)"`, then runs `docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate` — **no SHA argument, no migration selection, no per-migration authorization, and, unlike `deploy`/`update`, not through `deploy_ctx_compose`** (so it runs against the shared checkout at `$PROJECT_DIR` rather than an immutable snapshot). It applies whatever migration files are present, in bulk. |
| **CONSEQUENCE, AS READ** | There is no mechanism in any of these scripts by which a *particular* migration is selected, authorized, or refused independently of the code deploy that carries it. This is the mechanical shape of the 2026-09-07 merge-to-canonical finding, **observed as code**. ⛔ No repair proposed. |
| **CURRENT STATUS** | `WIRED-BUT-UNOBSERVED` |

---

## 2 · Every provider and model named in code

**Providers named as first-class values** — `lib/ai/types.ts:11-19` `ProviderName`:
`'ollama'` · `'consciousness_engine'` · `'anthropic'` · `'openai'` · `'moonshot'` · `'multi_engine'`
· `'local_inference'` · `'unknown'`. Plus `lib/ai/modelRegistry.ts:6` `ModelProvider`:
`'ollama' | 'llamacpp' | 'mlx'`.

| Provider | Endpoint / SDK | Selected at | Tier in `provider-policy.json` |
|---|---|---|---|
| Anthropic | `@anthropic-ai/sdk` | `claudeClient.ts:149`; `anthropicStructuredAdapter.ts:20` | `production` |
| Ollama (legacy) | `OLLAMA_BASE_URL` → `localhost:11434` (`localModelClient.ts:12`) | `modelService.ts:187` | `production` |
| `maia-local-inference` | `http://maia-local-inference:8080` (`localInferenceClient.ts:10`) | `sovereignRouter.ts:80,120` | not named as a tier entry (fronts `ollama`) |
| Moonshot / Kimi | `https://api.moonshot.ai/v1` (`kimiClient.ts:11`) | `modelService.ts:133` | ⛔ **absent from every tier** |
| OpenAI | `openai` SDK / `api.openai.com` — 30 live-tree files | various, incl. TTS/STT | `lab` (`removal_in_progress`) |
| `multi_engine` | orchestration label, not a vendor | `modelService.ts:100` | n/a |
| `consciousness_engine` / `template-engine` | no model at all (`localModelClient.ts:56`) | `modelService.ts:187` | n/a |

**Claude model identifiers present in code** (`lib/` + `app/`, excluding `app/api/_backend/`) —
**23 distinct strings**, by occurrence count:

```
claude-sonnet-5 (25) · claude-sonnet-4-6 (18) · claude-opus-5 (18) · claude-3-opus (15)
claude-haiku-4-5-20251001 (13) · claude-sonnet-4-20250514 (8) · claude-3-5-sonnet-20241022 (7)
claude-opus-4-5-20251101 (5) · claude-3-haiku-20240307 (5) · claude-opus-4-6 (4)
claude-3-sonnet-20240229 (4) · claude-3-opus-20240229 (3) · claude-sonnet-4 (2)
claude-opus-4-1-20250805 (2) · claude-haiku-4-5 (2) · claude-3-5-sonnet (2)
claude-sonnet-4-5 · claude-sonnet · claude-opus-4-8 · claude-opus-4-7 · claude-3-sonnet
claude-3-5-haiku-20241022   (plus 2 test-only "…-pinned" sentinels)
```

**The two that decide a conversational turn**: `claudeClient.ts:13-14` — Opus default
`claude-opus-4-6`, Sonnet default `claude-sonnet-4-6`, each overridable by an env var.
**The one that decides a structured reading**: `'claude-opus-5'`, defaulted identically in four
callers (G-04). **Local default**: `llama3.1:8b` (`localModelClient.ts:22`). **Moonshot default**:
`kimi-k2.5` (`kimiClient.ts:12`).

⛔ **No version-pin mechanism was found.** Every model string is either a literal or an env override;
nothing validates a model name against a registry, a policy file, or an approved set at any layer.

---

## 3 · Contradictions — both sides, unreconciled

### C-1 ⭐⭐ PROVIDER FAILURE: THE ORGANISM DOES BOTH, IN CODE

| Side A — DEGRADE | Side B — REFUSE |
|---|---|
| `lib/ai/sovereignRouter.ts:15-17, 50-61` returns `DEGRADED_TEXT` — a first-person MAIA utterance — as an ordinary `TextResult` on four failure branches (`:77, :85, :117, :125`). | `lib/ai/structured/router.ts:116-131` returns `{ ok:false, refusal:'provider_unavailable' }`, with `:121-124` *"THE FAILURE STOPS HERE. No second provider, no local text path, no degraded template."* |
| Reached from the conversational path (`maiaService.ts` → `generateText` → `modelService.ts:83-85`), **only when `MAIA_INFERENCE_MODE` is set**. | Reached from the five Writer's-Studio reader callers, **always**. |
| Documented position: `CLAUDE.md` — *"Fallback: Local Ollama (DeepSeek models) when API unavailable."* | Documented position: `router.ts:4` — *"STRUCTURED INFERENCE v1 IS NON-FALLBACKABLE."* |

⭐ **This is not a document-versus-code conflict. Both behaviours are implemented, on different
seams, at the same subject.** They are not reconciled by any artifact located in this census.
A third behaviour exists as well: with `MAIA_INFERENCE_MODE` unset, `modelService.ts:180-193`
**falls back to a local Ollama text model** without emitting any drift event at all. ⛔ Not reconciled.

### C-2 ⭐ `CLAUDE.md` versus the tree on cloud providers (D-P1-06 — PRESERVE + REPORT)

- **`CLAUDE.md`, MAIA Sovereignty section:** *"Never use OpenAI or other cloud AI providers."*
- **`scripts/provider-policy.json`:** OpenAI is a **`lab` tier provider**, `status:
  "removal_in_progress"`, with a 32-file enumerated allowlist — i.e. a *governed migration debt*,
  not a prohibition.
- **The tree:** 30 live-tree files (excluding `_backend/`) import the OpenAI SDK or call
  `api.openai.com`; `Dockerfile:57` sets `OPENAI_API_KEY=dummy-build-key` for the build.
- **`docs/adr/012-openai-tts-production-status.md` (Status: Open / Deferred, 2026-07-07):** *"The
  archetype→OpenAI default remains an open governance question, not a settled policy"* (`:36`) and
  *"must be revisited before any claim that OpenAI is absent from production"* (`:48-49`).
- **And a second limb:** *"or other cloud AI providers"* is contradicted by **Moonshot** (G-07),
  which is in the tree, reachable by a per-request `meta` flag, and **in no tier of the policy file
  and no guard pattern at all**.

⛔ Not reconciled. The anchor is not permitted to amend the policy file; the policy file is not
recorded here as amending the anchor.

### C-3 · "Main gateway for ALL text generation" versus 60 allowlisted SDK importers

`lib/ai/modelService.ts:71-73` versus `scripts/anthropic-import-allowlist.json` (2 approved + 1
operational + 57 grandfathered). Both are the project's own text. ⛔ Not reconciled.

### C-4 · ADR-001 (Accepted) versus `selectClaudeModel` as it stands

ADR-001 (`:15`, `:37-43`, `:138`) prescribes 7-level awareness → Opus/Sonnet routing **in
`lib/ai/claudeClient.ts`** and says all routing decisions MUST follow it. `claudeClient.ts:50-86`
routes on `reasoningMode` and force flags and defaults to Sonnet; awareness level survives only in a
log string (`:136-140`). The code's own comment claims a *"NEW PHILOSOPHY (Jan 2026)"* (`:33`).
**No superseding ADR or ruling was located.** ⛔ Not reconciled.

### C-5 · The degraded string's claim versus the seam's behaviour

`sovereignRouter.ts:16` says *"I've saved your message."* The router performs no persistence.
Whether a caller persists the turn is caller-dependent and is **not resolved here**. ⛔ Not reconciled.

### C-6 · Declared scope of Kimi versus its trigger

`modelService.ts:126` *"Never used for live chat - only when explicitly requested"* versus
`modelService.ts:127` `req.meta?.useKimi`, where `meta` is `Record<string, unknown>` with no
validation and no provenance. ⛔ Not reconciled.

---

## 4 · Unlocated governance

- **U-1 · Model governance.** No ratified document governs model selection, pinning, versioning, or
  behaviour on model unavailability. The only artifact is ADR-001 (2024-12-30), which no provider
  document references and which the code no longer implements (C-4). 23 Claude model strings exist
  in the tree with no registry, no approved set, and no version-pin mechanism.
  **GOVERNANCE GATE: NONE FOUND.**
- **U-2 · The direct-Anthropic guard's own authority.** `scripts/check-no-direct-anthropic.ts` cites
  `CLAUDE.md` and two `docs/orientation/` files (`:32-34`). No canon document names the guard, and
  the guard is absent from `ci:sovereignty` (`package.json:109`). **Verified to exist; its governing
  source is UNLOCATED.**
- **U-3 · MAIA identity under provider change.** See §5 Q3 — no artifact.
- **U-4 · Moonshot admission.** A cloud provider reachable from the main text gateway appears in no
  tier of the policy that governs admission, and in no guard. **GOVERNANCE GATE: NONE FOUND.**
- **U-5 · `meta` as an authority channel.** `TextRequest.meta?: Record<string, unknown>`
  (`modelService.ts:68`) selects the provider (`useKimi`, `:127`), the orchestration mode
  (`useMultiEngine`, `:94`; `orchestrationType`, `:97`), and the model tier
  (`forceOpus`/`forceSonnet`, `claudeClient.ts:55-56`). Nothing validates it or records who set it.
- **U-6 · Runtime provider admission.** `scripts/provider-policy.json` is read by exactly one file,
  `scripts/check-provider-governance.ts:32`. **No runtime code reads it.** Provider admission as
  declared in that file has **no runtime expression**; the only runtime refusal traced is the single
  string comparison at `modelService.ts:89-91`.
- **U-7 · Migration authorization.** No mechanism authorizes a migration independently of a deploy
  (G-18). ⛔ No repair proposed.

---

## 5 · The five required answers

**Q1 — Every provider and model named in code; one dispatch point or several?**
See §2. **SEVERAL.** `lib/ai/modelService.ts:76` calls itself the gateway for all text generation,
but `scripts/anthropic-import-allowlist.json` records **60 files** holding a direct vendor SDK
import — 2 approved adapters, 1 operational probe, **57 grandfathered cognitive surfaces**, seven of
them member-facing HTTP routes that pin their own models. Add `lib/ai/structured/router.ts` as a
second, deliberately separate, governed seam. Models: **23 distinct Claude strings**, plus
`llama3.1:8b`, `kimi-k2.5`, 9 registry profiles, and a `template-engine` that is not a model.

**Q2 — What happens on provider failure? Refuse, degrade, fall back, or something else?**
⭐ **All three, at different seams, and which one runs depends on an environment variable whose
production value is not determinable from this repository.**
- `MAIA_INFERENCE_MODE` unset → `lib/ai/modelService.ts:180-193`: **falls back** to local Ollama, no
  drift event.
- `MAIA_INFERENCE_MODE` set → `lib/ai/sovereignRouter.ts:50-61`: **degrades** to a fabricated
  first-person MAIA sentence at `:77`, `:85`, `:117`, `:125`; the one drift event fires at `:105`,
  which is **not** any of those four exits.
- Structured path → `lib/ai/structured/router.ts:125-129`: **refuses**, `refusal:'provider_unavailable'`.
- The billing/auth fail-fast branch (`sovereignRouter.ts:101`, `modelService.ts:167`) checks
  properties **no code sets**, and `claudeClient.ts:204` re-wraps errors so they cannot carry them.

**Q3 — Any code that preserves or asserts MAIA's identity across a provider change?**
⭐ **NONE FOUND.** The nearest artifact is `ReaderProvenance`
(`lib/manuscript/structure/readerProvenance.ts:12-21`), and it is identity **of a reading**, not of
MAIA — and its `provider` field is the literal type `'anthropic'`, so **a different provider is not
representable in it**. `lib/sovereignty/driftAlarm.ts` announces a provider transition to the
**operator** and explicitly not to the member (`sovereignRouter.ts:103-104`). `claudeClient.ts:11-12`
*asserts* the mind/mouth distinction in a comment; nothing enforces it. The degraded path does the
opposite of preserving identity: it **emits MAIA's first person when no MAIA cognition ran**
(`sovereignRouter.ts:15-17`).

**Q4 — What governance actually gates a provider call at runtime?**
⭐⭐ **GOVERNANCE GATE: NONE FOUND — with one exception.** The exception is
`lib/ai/structured/router.ts:45,53,93-105`, which refuses external structured inference outside
`primary` mode and has no second export to bypass it. Everywhere else: `provider-policy.json` is
read only by a **commit/CI-time** script; `check:no-openai` and `check:no-direct-anthropic` run in
`preflight` and `.githooks/pre-commit` and have **no effect on a running container**; the only
runtime refusal in the main gateway is the string comparison at `modelService.ts:89-91`. Provider,
model and orchestration selection at runtime is governed by **unvalidated environment variables and
an unvalidated `meta` bag** (U-5).

**Q5 — Deploy/provenance: what do the scripts enforce, and is a MIGRATION gated separately from a DEPLOY?**
Enforced, as read: one deploy at a time (`deploy-lock.sh:142-147`, non-blocking flock, never queues,
holder identity printed); build refusal outside the lane (`Dockerfile:23-42` + compose arg with no
default — the lock is what grants the token, `deploy-lock.sh:185`); an **immutable `git archive`
snapshot** of a named SHA as the build context (`deploy-context.sh:190-239`); provenance verified
pre-swap on the image and post-swap on the container across **two channels**
(`deploy-context.sh:375-423`); rollback tags refreshed before the swap (`deploy-tag.sh:33`); the
Co-Lab constitutional verifier run inside the live container before a quick deploy
(`pre-deploy-gate.sh:110-123`); migration failure now **aborts the deploy**
(`deploy-production.sh:82-118`, DEPLOYMENT-SAFETY-01).
⭐⭐ **A migration is NOT gated separately from a deploy. NONE FOUND.** `deploy` and `update` run the
`migrate` profile as an unconditional post-swap phase over whatever files the snapshot carries
(`:538`, `:626`); `cmd_migrate` (`:639-648`) takes the lane lock but accepts **no SHA, no migration
selection, no per-migration authorization**, and runs against the shared checkout rather than an
immutable snapshot. The script states its own residual limit at `:73-78`: migrations run **after**
the swap, so abortion routes to rollback and *"cannot retroactively prevent the swap."*
⛔ Proposed nothing.

---

## 6 · Named-but-unverified artifacts

| Named in | Artifact | Verified at subject |
|---|---|---|
| `check-no-direct-anthropic.ts:33` | `docs/orientation/maia-sovereign-runtime-intelligence-audit.md` | **NOT READ** in this census — referenced, existence unverified. |
| `check-no-direct-anthropic.ts:34` | `docs/orientation/maia-intelligence-architecture-synthesis.md` | **NOT READ** — referenced, existence unverified. |
| `provider-policy.json:_doc` | `docs/canon/PROVIDER_GOVERNANCE.md` | **NOT READ** in this census. Named as the human policy + rationale; its content, status and ratification are **UNKNOWN** here. |
| `Dockerfile:22`, deploy scripts | `docs/ops/DEPLOY_LANE_TOKEN.md`, `docs/ops/IMMUTABLE_SHA_DEPLOY.md`, `docs/ops/COLAB_RELEASE_GATE.md` | **NOT READ** — named only. |
| `provider-policy.json` | `personaplex` TTS, `status: "pending_qualification"` | No qualification record located. |
| `modelRegistry.ts:31` | `minimumBloomLevel` developmental model gate | Declared as a type field; **no evaluator and no importer found** (G-09). |
| ADR-001 `:145` | commit `ccedad788` ("Initial 7-level → Opus/Sonnet wiring") | **NOT VERIFIED** — E-1 holds; history claims beyond the shallow evidence remain `UNKNOWN`. |

---

## 7 · Open questions for P1-04

1. **Which failure behaviour is MAIA's?** C-1 is not a documentation gap — it is two implemented,
   simultaneously-reachable answers. Which seam's law is the organism's law is not answerable from
   code. `REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.
2. **Is a fabricated first-person utterance a MAIA turn?** `DEGRADED_TEXT` is typed, returned and
   consumed identically to a generated answer, and asserts an act the seam does not perform. What
   MAIA may say when MAIA did not think is a governance question with no located artifact.
3. **May a provider transition be invisible to the member?** `driftAlarm` tells the operator and
   explicitly not the member — and, at three of four degraded exits, tells no one.
4. **What governs a model, and what governs 23 of them?** U-1. Includes: does an unavailable or
   retired model id have a defined behaviour? (None found.)
5. **Is `meta` an authority channel?** U-5. It currently selects provider, orchestration and model
   tier with no validation and no provenance.
6. **Moonshot.** A cloud provider in the main gateway, in no tier and no guard (U-4, C-2 limb 2).
7. **Does the commit-time guard family have runtime standing?** All provider guards are build-time.
   Whether provider admission requires a runtime expression is undecided (U-6).
8. **`minimumBloomLevel`** — a declared model gate keyed to a developmental attribute of a person,
   in a dormant file. Domain I may want this: it is an access-shaped artifact under
   `P1-GOV-ACCESS-01` that no evaluator reads.
9. **Migration authorization.** G-18 / U-7: the mechanism by which a migration becomes deployable is
   still *becoming part of a snapshot a deploy carries*. ⛔ Nothing proposed.
10. **Guard absence versus guard satisfaction.** The allowlist's `_batch_2026-07-27` note records
    seven surfaces that shipped because *the guard never fired*. Same family as the branch-policy
    finding. Whether provider guards are authoritative in every execution environment is unanswered.
