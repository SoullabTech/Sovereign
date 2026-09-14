# P1-03 · NORMALIZED CAPABILITY REGISTER — DOMAINS G · H · I

```text
STEP        P1-03 · COMMON EVIDENCE SCHEMA
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — restatement of three CLOSED P1-02 domain records
SOURCES     P1-02/G_orchestration.md · P1-02/H_sensory_voice.md · P1-02/I_member_practitioner.md
BOUND BY    P1-03 instrument §2 (INF-1…INF-5) · §3 (the normalized row) · §3 prohibitions · §4
```

> ⭐ **P1-03 restates. It does not decide.** Where a source record did not determine a field,
> this file writes **`NOT DETERMINED BY SOURCE RECORD`**. ⛔ It does not fill the gap.

⛔ **No source code was read for this step.** Every claim below is a restatement of a P1-02 record.
⛔ No status upgraded · no contradiction reconciled · no row merged or split to tidy a status ·
no capability added. ⛔ **The separately-owned authorization/exposure question raised by domain I is
neither cited, awaited, answered, rated, nor repaired here** (P1-03 instrument §3, §4). Domain I's
own discipline — *record only; open nothing* — is held exactly.

⚠️ **CONTENT DISCIPLINE** (inherited from domain I): paths, field names, column names, route
shapes and authorization predicates only. No member content, no excerpt from any member-authored
object, no credential or token value, no identifier of any real person.

### Reading conventions used in this file

**COVERAGE vocabulary.** The three source records do not enumerate the organism's cognition
families — domain A owns the topology. COVERAGE below therefore uses the *source records' own
descriptions* of the path a capability sits on:

```text
CONVERSATIONAL TEXT FAMILY   the getMaiaResponse() path reached from
                             app/api/sovereign/app/maia/list/route.ts, the FAST/CORE/DEEP
                             generateText call sites in lib/sovereign/maiaService.ts, and the
                             seven further non-test importers of generateText named in G-01
STRUCTURED-READING FAMILY    the five Writer's-Studio runStructured callers named in G-04
VOICE FAMILY                 per Amendment 1 §1: voice contains its OWN cognition family, not
                             merely transport above and below a shared convergence. Domain H's
                             rows name it where the record establishes it
```

⛔ These are descriptions, not a ratified family list, and ⛔ no row claims the set is complete.
Per **INF-5**, a capability on one family is not organism-wide.

**LADDER rule applied here.** ⛔ The three P1-02 records never use the ladder vocabulary. LADDER is
therefore written **only** where the record's own words establish a position — in practice only
`EXISTS`, and only where the record verified the artifact present at the subject **and** recorded
zero consumers / no reachable call path. Every other row reads
`NOT DETERMINED BY SOURCE RECORD`.

---

## DOMAIN G — MODEL / PROVIDER / ORCHESTRATION

### P3-G-01 · Plain-text inference dispatch
- **DOMAIN** G
- **NAMED OBJECT** `generateText(req: TextRequest)` — the declared *"main gateway for ALL text generation in MAIA"*
- **ARTIFACT** `lib/ai/modelService.ts:71-76` (declared), `:83-193` (branching), `:10,52-58` (module-load config)
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (`MAIA_INFERENCE_MODE`, `TEXT_MODEL_PROVIDER`, `MAIA_ORCHESTRATION_TYPE`, `ENABLE_MULTI_ENGINE`, read at module load; per INF-3 this authorizes nothing)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY. ⛔ Does not cover the STRUCTURED-READING FAMILY (separate seam, P3-G-04) and ⛔ does not cover the 60 direct-SDK files of P3-G-10. Coverage beyond that NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND at runtime — one inline string check (`:89-91`, throws if `TEXT_MODEL_PROVIDER === 'openai'`) is the only runtime provider refusal in the file; `scripts/provider-policy.json` is read by no runtime code
- **GOVERNING SOURCE** NONE LOCATED (G §4 U-1, U-6)
- **SOURCE RECORD** G_orchestration.md §1 G-01; §4 U-1/U-6; §5 Q1/Q4

### P3-G-02 · Sovereign routing seam — the DEGRADING failure disposition
- **DOMAIN** G
- **NAMED OBJECT** `generateTextWithSovereignty` / `degradedResult()` / `DEGRADED_TEXT`
- **ARTIFACT** `lib/ai/sovereignRouter.ts:134-140`, `:15-17`, `:50-61`; exits `:77`, `:85`, `:117`, `:125`; reached from `lib/ai/modelService.ts:83-85`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (reached **only** when `MAIA_INFERENCE_MODE` is non-empty; an unrecognized mode is treated as unreachable and also returns `degradedResult`)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY only. ⛔ Not the STRUCTURED-READING FAMILY, which refuses (P3-G-04). Coverage over the VOICE FAMILY NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND — the mode string is passed through unvalidated
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** G_orchestration.md §1 G-02 (+ its four structural observations); §3 C-1, C-5; §5 Q2
- **CARRIED FINDING, AS RATIFIED** ⭐ *The emitting seam makes a persistence claim it does not itself discharge; end-to-end truth of that claim is caller-dependent and presently unresolved.* ⛔ **NOT** *"MAIA lies about saving."* Three of the four degraded exits emit no drift event; the one `emitDriftEvent('silent_fallback', …)` at `:105` is on none of them

### P3-G-03 · Anthropic plain-text adapter and model selection
- **DOMAIN** G
- **NAMED OBJECT** `generateWithClaude` / `selectClaudeModel`
- **ARTIFACT** `lib/ai/claudeClient.ts:114`, `:50-86`, `:13-16` (model + ceiling defaults), `:176-186` (`logVoiceTierTelemetry`)
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (`CLAUDE_REASONING_MODEL`, `CLAUDE_VOICE_MODEL`, `CLAUDE_MAX_TOKENS`, `CLAUDE_TEMPERATURE`; plus an unvalidated per-request `meta` bag carrying `forceOpus` / `forceSonnet` / `reasoningMode`)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY. ⛔ Coverage over other families NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND — `meta` is `Record<string, unknown>` with no provenance check on who set the force flags
- **GOVERNING SOURCE** NONE LOCATED. `docs/adr/001-seven-level-awareness-source-of-truth.md` (Status: Accepted, 2024-12-30) names this file and prescribes a rule the code no longer implements; ⛔ no superseding document located (C-4)
- **SOURCE RECORD** G_orchestration.md §1 G-03; §3 C-4; §4 U-1

### P3-G-04 · Structured inference seam — the REFUSING failure disposition
- **DOMAIN** G
- **NAMED OBJECT** `runStructured` + `resolveStructuredMode()` + `EXTERNAL_AUTHORIZED`
- **ARTIFACT** `lib/ai/structured/router.ts:65-73`, `:45`, `:53`, `:93-105`, `:116-131`; `lib/ai/structured/policy.ts:38-52`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (refuses outside `primary`; enforced by absence of a second export) · CONFIG-SELECTED (`MAIA_INFERENCE_MODE`; invalid value → refusal `invalid_inference_mode`, never a default)
- **COVERAGE** STRUCTURED-READING FAMILY only — the five callers `maiaReader.ts` · `askReader.ts` · `developmentalAskReader.ts` · `developmentalReader/read.ts` · `developmentalReading/classify.ts`. ⛔ Explicitly not the conversational path
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⭐ PRESENT — *the only structural runtime provider gate found in domain G* (altitude RUNTIME-GATED)
- **GOVERNING SOURCE** NONE LOCATED (the rule is stated in the module: `router.ts:4`, `:30-31`, `:121-124`)
- **SOURCE RECORD** G_orchestration.md §1 G-04; §3 C-1; §5 Q4

### P3-G-05 · Local inference client (`maia-local-inference`)
- **DOMAIN** G
- **NAMED OBJECT** `isLocalHealthy` / `callLocalInference`
- **ARTIFACT** `lib/ai/localInferenceClient.ts:34`, `:51`, `:10-13`, `:16-26` (45 s process-local circuit breaker), `:60` (system+user concatenated into one field), `:80`; `docker-compose.production.yml:886-896` (`profiles: ["sovereign"]`)
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (compose profile + `LOCAL_INFERENCE_BASE_URL`)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY (reached from `sovereignRouter.ts:80,120`). ⛔ Beyond that NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** G_orchestration.md §1 G-05

### P3-G-06 · Legacy local model client — the LOCAL-FALLBACK failure disposition
- **DOMAIN** G
- **NAMED OBJECT** `localModelClient` (Ollama / DeepSeek), reached at the unconditional terminal branch `modelService.ts:187`
- **ARTIFACT** `lib/ai/localModelClient.ts:9,12,21-22,56`; `lib/ai/modelService.ts:180-193`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (reached when `MAIA_INFERENCE_MODE` is unset and Claude throws with `SMOKE_NO_FALLBACK` unset, **and** whenever `TEXT_MODEL_PROVIDER` holds an unrecognized value)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY only. ⛔ Not the STRUCTURED-READING FAMILY
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** G_orchestration.md §1 G-06; §3 C-1 (third behaviour); §5 Q2
- **CARRIED FINDING** under the `consciousness_engine` provider this path returns `model: 'template-engine'` — *a fourth answer-producing path that is not a model at all*; no drift event is emitted on this fallback

### P3-G-07 · Moonshot / Kimi — a cloud provider in no tier
- **DOMAIN** G
- **NAMED OBJECT** `kimiClient` + its two triggers
- **ARTIFACT** `lib/ai/kimiClient.ts:11-13,68,96`; `lib/ai/modelService.ts:126-151`; `lib/ai/types.ts:16`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (`TEXT_MODEL_PROVIDER === 'moonshot'` **or** a per-request `req.meta?.useKimi` flag from any caller; per INF-3 neither authorizes)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY (reachable from the main text gateway). ⛔ Beyond that NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND, at any layer — absent from every tier of `scripts/provider-policy.json` and matched by no guard pattern
- **GOVERNING SOURCE** NONE LOCATED (G §4 U-4)
- **SOURCE RECORD** G_orchestration.md §1 G-07; §3 C-2 (second limb), C-6; §4 U-4

### P3-G-08 · Multi-engine orchestration
- **DOMAIN** G
- **NAMED OBJECT** `generateWithMultipleEngines` / `OrchestrationType`
- **ARTIFACT** `lib/ai/multiEngineOrchestrator.ts`; gate + result shape at `lib/ai/modelService.ts:58,94-123` (`model: \`orchestration:${type}\``)
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (`MAIA_ENABLE_MULTI_ENGINE` **and** either `TEXT_MODEL_PROVIDER === 'multi_engine'` or a per-request `meta.useMultiEngine`)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY. Six further files import the *type* only. ⛔ Beyond that NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** G_orchestration.md §1 G-08; §4 U-5

### P3-G-09 · Model registry — consciousness-aware model selection
- **DOMAIN** G
- **NAMED OBJECT** `MODEL_REGISTRY` / `selectOptimalModel` / `getModelFallbackChain`; field `minimumBloomLevel?`
- **ARTIFACT** `lib/ai/modelRegistry.ts:1` (`// @ts-nocheck`), `:6`, `:31`, `:40`, `:202`, `:254`
- **STATUS** DORMANT
- **ALTITUDE** EXISTS
- **COVERAGE** NONE — the record found no importer outside the file (one prose comment in `lib/types/interpretive-ledger.ts:25`), so it holds for no MAIA-claiming family at the subject
- **LADDER** EXISTS (record: artifact verified present, ⛔ no importer exists)
- **GOVERNANCE GATE** NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** G_orchestration.md §1 G-09; §6; §7 Q8
- **CARRIED, UNRESOLVED** whether `minimumBloomLevel` — *a model gate keyed to a developmental attribute of a person*, declared as a type field — was ever evaluated anywhere. Not traced

### P3-G-10 · Direct-SDK dispatch population
- **DOMAIN** G
- **NAMED OBJECT** `scripts/anthropic-import-allowlist.json` and the 60 files it enumerates (2 approved · 1 operational · 57 grandfathered)
- **ARTIFACT** `scripts/anthropic-import-allowlist.json` (incl. note `_batch_2026-07-27`); `.githooks/pre-commit:43`
- **STATUS** WIRED-BUT-UNOBSERVED (the routes); the allowlist itself is wired into the pre-commit hook
- **ALTITUDE** EXISTS · WIRED · CI-GATED (commit-time)
- **COVERAGE** 57 grandfathered *"legacy cognitive surfaces that bypass sovereignRouter"*, including 7 member-facing HTTP route handlers that pin their own models. ⛔ Which MAIA-claiming cognition families these constitute is NOT DETERMINED BY SOURCE RECORD — domain A owns the topology
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** Build/commit-time only (P3-G-13). ⛔ **NONE FOUND at runtime** — nothing prevents these files executing
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** G_orchestration.md §1 G-10; §3 C-3; §5 Q1; §7 Q10
- **CARRIED FINDING** the allowlist's own note records seven surfaces that *"shipped AFTER this guard landed (2026-05-20) without being allowlisted — their lanes did not exercise preflight/pre-commit, so the guard never fired"* — ⭐ a declared gate that was **absent rather than satisfied**

### P3-G-11 · OpenAI in the live tree
- **DOMAIN** G
- **NAMED OBJECT** the OpenAI SDK / `api.openai.com` surface in `lib/` + `app/` (excluding `app/api/_backend/`)
- **ARTIFACT** `scripts/provider-policy.json` (`tiers.lab.providers.openai`, `status: "removal_in_progress"`, 3 + 29 + 2 enumerated files, `legacy_backend` prefix); verified grep at subject = **30 files**; `lib/ai/types.ts:15`; `Dockerfile:56-57`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CI-GATED (commit/CI-time, P3-G-12)
- **COVERAGE** NOT DETERMINED BY SOURCE RECORD — the record enumerates files (*"various, incl. TTS/STT"*) and does not map them to cognition families
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** Commit/CI-time only (P3-G-12). ⛔ **NONE FOUND at runtime**
- **GOVERNING SOURCE** `scripts/provider-policy.json` (tiering) — ⚠️ and `docs/canon/PROVIDER_GOVERNANCE.md` is **named but NOT READ**; `docs/adr/012-openai-tts-production-status.md` is Status **Open / Deferred**
- **SOURCE RECORD** G_orchestration.md §1 G-11; §3 C-2; §6

### P3-G-12 · Provider-governance guard (`check:no-openai`)
- **DOMAIN** G
- **NAMED OBJECT** `scripts/check-provider-governance.ts` + `scripts/provider-policy.json`
- **ARTIFACT** `check-provider-governance.ts:32,34-40,42-43,48,111`; `package.json:45,109,111`; `.githooks/pre-commit:39`
- **STATUS** WIRED-BUT-UNOBSERVED as a gate (no run record read at the subject)
- **ALTITUDE** EXISTS · WIRED · CI-GATED. ⛔ **Per INF-2, CI-GATED ↛ runtime governed** — the record: *"BUILD-TIME, NOT RUNTIME. It prevents new source surfaces. It has no effect on a running container."*
- **COVERAGE** NOT APPLICABLE — a commit/CI-time instrument over tracked source, not a per-family runtime capability
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD (the record states the guard's scope, not a gate over the guard itself)
- **GOVERNING SOURCE** `scripts/provider-policy.json`; ⚠️ `docs/canon/PROVIDER_GOVERNANCE.md` named by the policy file's `_doc` key and **NOT READ** at the subject
- **SOURCE RECORD** G_orchestration.md §1 G-12; §6
- **CARRIED FINDING** it matches no pattern for Moonshot, Google, Mistral, Cohere or any other non-Anthropic cloud provider: ⛔ *"or other cloud AI providers" has no mechanical expression anywhere in the repository*

### P3-G-13 · Direct-Anthropic guard (`check:no-direct-anthropic`)
- **DOMAIN** G
- **NAMED OBJECT** `scripts/check-no-direct-anthropic.ts` (199 lines)
- **ARTIFACT** `:32-34` (self-declared authority), `:69,76,79-90,125,129,142-153,196`; `package.json:42,111`; `.githooks/pre-commit:43`; ⛔ **absent from `ci:sovereignty`** (`package.json:109`)
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CI-GATED (INF-2 applies)
- **COVERAGE** NOT APPLICABLE — a commit-time instrument over tracked source
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND — *"It cites no canon document, and no canon document names it"*
- **GOVERNING SOURCE** NONE LOCATED (G §4 U-2). It cites `CLAUDE.md` and two `docs/orientation/` files that were **NOT READ** in that census
- **SOURCE RECORD** G_orchestration.md §1 G-13; §4 U-2; §6

### P3-G-14 · Drift alarm — the only provider-transition signal
- **DOMAIN** G
- **NAMED OBJECT** `emitDriftEvent` / `DriftEventType` (incl. `'silent_fallback'`)
- **ARTIFACT** `lib/sovereignty/driftAlarm.ts:39-45,79,113,115,120-138`; call sites `lib/ai/sovereignRouter.ts:105` and `lib/maia/fieldContextAdapter.ts:101,118,127`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (Telegram leg requires `TELEGRAM_BOT_TOKEN` + `PRACTITIONER_TELEGRAM_CHAT_ID` and a per-type throttle; the `console.warn` is unconditional)
- **COVERAGE** CONVERSATIONAL TEXT FAMILY at one call site (`sovereignRouter.ts:105`) plus three field call sites belonging to a different domain. ⛔ Coverage over the other three degraded exits is **nil by construction** (they emit nothing); coverage over other families NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** G_orchestration.md §1 G-14; §5 Q3; §7 Q3
- **CARRIED FINDING** ⭐ audience is **operator/practitioner, never the member** — stated by the label at `:79` and by the call-site comment `sovereignRouter.ts:103-104` (*"The member doesn't see this transition"*)

### P3-G-15 · Reader provenance
- **DOMAIN** G
- **NAMED OBJECT** `ReaderProvenance` / `ReaderIdentity` / `readerIdentity(model)`
- **ARTIFACT** `lib/manuscript/structure/readerProvenance.ts:12-21,24`; `lib/manuscript/developmentalReader/read.ts:104-106`; `lib/manuscript/structure/proposalStore.ts:179-180,206`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED
- **COVERAGE** STRUCTURED-READING FAMILY only — *Writer's-Studio manuscript reading*. ⛔ The record states it does **not** cover `getMaiaResponse`, voice, or any conversational turn
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD
- **GOVERNING SOURCE** NONE LOCATED (G §4 U-3)
- **SOURCE RECORD** G_orchestration.md §1 G-15; §5 Q3
- **CARRIED FINDING, AS RATIFIED (Amendment 1 §4b)** ⭐ *No implementation-level invariant was located that proves identity continuity across provider substitution.* ⛔ That is **not** an establishment of identity discontinuity. `provider` is the string-literal type `'anthropic'`, so a different provider is not representable in this record

### P3-G-16 · Deploy-lane lock
- **DOMAIN** G
- **NAMED OBJECT** `scripts/deploy-lock.sh` (`acquire_deploy_lock()`), which also exports `DEPLOY_LANE_TOKEN`
- **ARTIFACT** `deploy-lock.sh:67,88-121,142-147,152,185`; entry points `deploy-production.sh:452,555,640,746`; `pre-deploy-gate.sh:234`
- **STATUS** WIRED-BUT-UNOBSERVED (*read only; not executed*)
- **ALTITUDE** EXISTS · WIRED · CI-GATED (build/deploy-time refusal; ⛔ not a request-time gate)
- **COVERAGE** NOT APPLICABLE — a deploy-lane instrument, not a per-family runtime capability
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD
- **GOVERNING SOURCE** NONE LOCATED; `docs/ops/DEPLOY_LANE_TOKEN.md` is **named but NOT READ**
- **SOURCE RECORD** G_orchestration.md §1 G-16; §5 Q5; §6

### P3-G-17 · Deploy provenance and the build tripwire
- **DOMAIN** G
- **NAMED OBJECT** `Dockerfile` deploy-lane tripwire + `deploy_ctx_materialize` / `deploy_ctx_verify_image` / `deploy_ctx_verify_running` / `deploy_ctx_refuse_compose_runtime_override` / `deploy_ctx_refuse_env_collision`
- **ARTIFACT** `Dockerfile:20-21,23-42,86-90`; `docker-compose.production.yml:536-537`; `scripts/deploy-context.sh:26,63-64,190,210,238-239,249,324,357,375-389,400-423`; `scripts/pre-deploy-gate.sh:85-97,110-123,192,228-265`; `scripts/deploy-tag.sh:33`
- **STATUS** WIRED-BUT-UNOBSERVED (*read only; not executed*)
- **ALTITUDE** EXISTS · WIRED · CI-GATED (build/deploy-time)
- **COVERAGE** NOT APPLICABLE — a deploy instrument, not a per-family runtime capability
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD
- **GOVERNING SOURCE** NONE LOCATED; `docs/ops/IMMUTABLE_SHA_DEPLOY.md` and `docs/ops/COLAB_RELEASE_GATE.md` are **named but NOT READ**
- **SOURCE RECORD** G_orchestration.md §1 G-17; §5 Q5; §6
- **CARRIED, IN THE FILE'S OWN WORDS** the token is *"a tripwire against the QUIET bypass, not a forgery-proof credential"*

### P3-G-18 · Migration execution
- **DOMAIN** G
- **NAMED OBJECT** `run_migrations_or_abort` / `cmd_migrate` / the compose `migrate` service
- **ARTIFACT** `scripts/deploy-production.sh:61,73-78,82-118,448-546,538,552-633,626,639-648`; `docker-compose.production.yml:529-537`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CI-GATED (deploy-time; fail-closed on migration failure)
- **COVERAGE** NOT APPLICABLE — deployment/schema execution, not a per-family runtime capability
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⭐⭐ **NONE FOUND** for a migration *separately from a deploy*. `cmd_migrate` takes the deploy-lane lock but accepts **no SHA, no migration selection, no per-migration authorization**, and runs against the shared checkout rather than an immutable snapshot
- **GOVERNING SOURCE** DEPLOYMENT-SAFETY-01, founder ruling 2026-09-14 — ⚠️ attributed **in-file** (`deploy-production.sh:61`) for the fail-closed behaviour only; ⛔ no located ruling supplies a migration-selection authority (G §4 U-7)
- **SOURCE RECORD** G_orchestration.md §1 G-18; §4 U-7; §5 Q5
- **CARRIED, PER AMENDMENT 1 §5** migration execution participates in deployment but is OUTSIDE snapshot-specific selection authority; ⛔ corroborates the 2026-09-07 deployment-custody finding, ⛔ does not repair or reopen it. ⛔ No repair proposed

---

## DOMAIN H — SENSORY / VOICE

⭐ **Amendment 1 §1 applied throughout**: voice is recorded as containing **its own cognition
family**, not merely transport above and below a shared convergence. Rows below name the VOICE
FAMILY wherever the source record establishes that the behaviour is voice-local.

### P3-H-01 · Voice capture / transport selection
- **DOMAIN** H
- **NAMED OBJECT** `selectVoiceTransport(facts)` — four transports `native-speech` · `sovereign-whisper` (×2 conditions) · `web-speech` · `none`
- **ARTIFACT** `lib/utils/platformDetection.ts:125-130,125-149`; `components/voice/ContinuousConversation.tsx:3370-3420` (dispatch condition at `:3408`; the resolved transport is LOGGED at `:3406`, not dispatched on)
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED
- **COVERAGE** VOICE FAMILY only — capture/admission above the convergence seam. NOT APPLICABLE to any other family
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND for provider egress. *The ear is selected by CAPABILITY, not by POLICY*
- **GOVERNING SOURCE** NONE LOCATED — comments cite `DESKTOP-SOVEREIGN-STT-01 · S1/S4` and `D01 §XII`; ⛔ neither document located (H §9 U2, U3)
- **SOURCE RECORD** H_sensory_voice.md §2, §5 H-1, §6, §9

### P3-H-02 · STT · first-party Whisper (T2 / T3)
- **DOMAIN** H
- **NAMED OBJECT** `app/api/voice/transcribe-simple/route.ts` · `app/api/voice/transcribe/route.ts`
- **ARTIFACT** `transcribe-simple:11-14,31-33,116-149`; `transcribe:27,42-44,93,116,189-219,234,246`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (auth on both; entitlements + daily quota on one)
- **COVERAGE** VOICE FAMILY only (ear side, two of four transports)
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** auth (E-1, E-2) · entitlements (E-3) · daily quota (E-4) — ⭐ *identity and commercial gates*. ⛔ **NONE FOUND** for provider qualification or consent; `transcribe-simple` has auth only
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §4 (STT), §5 H-2, §6

### P3-H-03 · STT · browser / OS recognizers (T1 / T4)
- **DOMAIN** H
- **NAMED OBJECT** `webkitSpeechRecognition` session + `@capacitor-community/speech-recognition`; `lib/voice/webSpeechLifecycle.ts`
- **ARTIFACT** `components/voice/ContinuousConversation.tsx:9,695,711,715-725,848,885-920`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED
- **COVERAGE** VOICE FAMILY only — the **default** ear for ordinary Chrome and Safari members
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND. Desktop is refused Web Speech **by shell classification** at `:711` — *the ONLY place in the corpus where an STT provider is refused, and it is refused for Desktop only, never by a policy module*
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §2, §4, §5 H-3, §8 C4

### P3-H-04 · Voice admission guards — the twelve exits
- **DOMAIN** H
- **NAMED OBJECT** `handleVoiceTranscript` guard set N1–N12 (incl. the 21-string ghost-phrase filter and the `t.length < 50` standalone-command heuristic)
- **ARTIFACT** `components/OracleConversation.tsx:6780-7428`; exits `:6786,6803,6819,7157,7212,7226,7258,7265,7282,7292,7299,7341`; ghost list `:7233-7251`; heuristic `:7155`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (the guards refuse an utterance at request time) · CI-GATED (the closed-set pin, `__tests__/voice-non-degradation.test.ts` RATIFIED_EXITS/RATIFIED_CALLS/RATIFIED_COGNITION_TAIL)
- **COVERAGE** VOICE FAMILY only — these decide whether a spoken utterance becomes a member turn; ⛔ the typed path does not pass them
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** CI-GATED non-degradation pin only — ⛔ **no authorization ruling found for any individual guard**. Per INF-2 the pin is not a runtime governance gate, and the test says so itself: *"FROZEN IS NOT BLESSED"*
- **GOVERNING SOURCE** NONE LOCATED for the guards (H §9 U8, U9)
- **SOURCE RECORD** H_sensory_voice.md §2 (N1–N12), §5 H-4, §6, §9 U8/U9
- **CARRIED** N4 and N5 are exits **on which MAIA SPEAKS AND NO COGNITION RAN**; a refused utterance is silently dropped and nothing is surfaced to the member

### P3-H-05 · Canonical convergence
- **DOMAIN** H
- **NAMED OBJECT** `await handleTextMessage(cleanedText)` — the sole canonical cognition call inside `handleVoiceTranscript`
- **ARTIFACT** `components/OracleConversation.tsx:7397` (canon pins the same OPERATION at a stale `:7268`)
- **STATUS** WIRED-BUT-UNOBSERVED (structurally pinned; no runtime witness in-repo)
- **ALTITUDE** EXISTS · WIRED · CI-GATED (`__tests__/voice-non-degradation.test.ts`, 523 ln / 15 cases, incl. the AST walk at `:501-514` proving the retired streaming exit cannot return)
- **COVERAGE** the seam **between** the VOICE FAMILY and the shared cognition path owned by domain A. ⛔ Domain H does not re-census what lies below it
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⭐ `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` + the closed-set CI gate — *the strongest gate in this domain*. Per INF-2, CI-GATED ↛ runtime governed
- **GOVERNING SOURCE** `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` (named in `CLAUDE.md` as a hard acceptance gate on all voice/transport work)
- **SOURCE RECORD** H_sensory_voice.md §1, §5 H-5, §6, §8 C3/C6

### P3-H-06 · MAIA turn commit seam
- **DOMAIN** H
- **NAMED OBJECT** `commitOracleTurn(reason)` — one idempotent seam, six terminal reasons
- **ARTIFACT** `components/OracleConversation.tsx:6371-6376,6380-6395`; reasons at `:6400,6461,6500,6529,6535,6634`; `VOICE_TRANSCRIPT_WATCHDOG_MS` `:341`; `clearTimeout` `:6539`
- **STATUS** WIRED-BUT-UNOBSERVED (under the LIVE calibration — H §7)
- **ALTITUDE** EXISTS · WIRED · CI-GATED (`__tests__/voice-transcript-commit.test.ts`, 95 ln / 6 cases — ⚠️ every assertion is a **source-shape** assertion over stripped text; it does not execute the component)
- **COVERAGE** VOICE FAMILY **and** the chat path within the same canonical response block (reason `'chat'` at `:6400`). ⛔ Does not cover the pre-cognition/failure paths X1–X6 (P3-H-12)
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** CI-GATED source-shape test only — ⛔ **no ruling document found naming modality-independence as law**
- **GOVERNING SOURCE** NONE LOCATED — the 2026-08-13 **MODALITY INDEPENDENCE** founder ruling is cited twice in code comments (`:6347`, `:6447`) and located in no document (H §9 U1)
- **SOURCE RECORD** H_sensory_voice.md §3, §5 H-6, §6, §7, §9 U1

### P3-H-07 · TTS egress
- **DOMAIN** H
- **NAMED OBJECT** `maiaSpeak` · `handleSpeakMessage` · `app/api/voice/openai-tts/route.ts` · `lib/tts/ttsRouter.ts` · `lib/tts/cloudVoicePolicy.ts` · `lib/voice/voiceArchetypes.ts`
- **ARTIFACT** `OracleConversation.tsx:1955,2034,2130,7499,7517`; route `:43,77,110,115,121,127,128-131,181,202-203,256-277`; `ttsRouter.ts:62-67,75-79,97-104`; `voiceArchetypes.ts:58-59,67,88,92`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (G-T3/G-T4/G-T5 on the branches that reach them) · CONFIG-SELECTED (`MAIA_VOICE_OVERRIDE`, `MAIA_TTS_PROVIDER`, `MAIA_LOCAL_VOICE_ENABLED`, `MAIA_ALLOW_CLOUD_VOICE`, `MAIA_DEPLOYMENT_CONTEXT`; per INF-3 none of these authorizes)
- **COVERAGE** VOICE FAMILY only (mouth side); three TTS call paths onto one route
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** G-T1 `assertProviderQualified` (R15 allowlist, fail-closed) · G-T2 `cloudVoicePolicy` · G-T3 `checkCloudConsent` · G-T4 auth + usage · G-T5 length — ⛔ **G-T1, G-T2 and G-T3 are NOT REACHED on the archetype branch**, which runs first and returns
- **GOVERNING SOURCE** ⚠️ `VOICE-SOVEREIGNTY-01 · "Founder canon ruling, 2026-08-27"` exists **only as a doctrine block inside the module it governs** (`lib/tts/cloudVoicePolicy.ts:1-19`); no separate canon document located (H §9 U6). Refusal **R15** and `docs/adr/012` are named-but-unverified (U4, U5)
- **SOURCE RECORD** H_sensory_voice.md §4 (TTS), §5 H-7, §6, §8 C1

### P3-H-08 · Re-listen / continuation consent
- **DOMAIN** H
- **NAMED OBJECT** `lastSendWasVoiceRef` + `lib/voice/restartAuthority.ts` + `attemptMicRestart`
- **ARTIFACT** `OracleConversation.tsx:1618` (init **true**), `:4917-4919`, `:6827`, `:6560-6620`; read at seven restart sites `:2678,2781,2850,2998,5758,6580,6597`; `lib/voice/restartAuthority.ts:1-24`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (the ref gates seven restart sites)
- **COVERAGE** VOICE FAMILY only
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⚠️ PARTIAL — `restartAuthority.ts` documents a P0 and encodes the policy in one place; the consent rule itself is enforced only by the ref and is **not traced to a ruling document at the subject**
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §5 H-8, §6, §11 Q9
- **CARRIED** ⚠️ `lastSendWasVoiceRef` **initialises true** — before the member has spoken once, the system's default posture is *"voice was the last modality."* ⭐ MEMBER AUTHORITY here is real: the modality of the member's last send decides whether the mic re-arms

### P3-H-09 · Class C · spoken-without-cognition
- **DOMAIN** H
- **NAMED OBJECT** the **eleven** Class C `await maiaSpeak(` sites (of twelve total; one is canonical)
- **ARTIFACT** `components/OracleConversation.tsx:6854` (crisis script, `:6852-6857`, deliberately non-returning), `:7039,7044,7053,7058,7079,7097,7099` (astrology / scribe data-API text), `:7120` (paused-response replay), `:7143` (command ack), `:7209` (confirmation); canonical site `:6514`
- **STATUS** WIRED-BUT-UNOBSERVED · UNRULED
- **ALTITUDE** EXISTS · WIRED · CI-GATED in part (several are pinned by the non-degradation test *"so they cannot grow"*)
- **COVERAGE** VOICE FAMILY only, and **voice-local utterance authority rather than model cognition**: the record states ⛔ *NO MODEL IN THE PATH — these are not an alternate MAIA mind*, while also recording that they are member-facing first-person utterances that bypass canonical egress finalization entirely
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND — the classification is *"Proposed … for founder ruling"* and *"C should be recorded and deferred"*; ⚠️ *"FROZEN IS NOT BLESSED: pinning stops them growing, it does not certify them"*
- **GOVERNING SOURCE** NONE LOCATED (H §9 U7 — the Class C ruling has been deferred through at least two units)
- **SOURCE RECORD** H_sensory_voice.md §2 (N4/N5 + crisis), §5 H-9, §6, §9 U7, §11 Q5

### P3-H-10 · Voice-path conversation-memory write
- **DOMAIN** H
- **NAMED OBJECT** the four `saveConversationMemory` call sites
- **ARTIFACT** `components/OracleConversation.tsx:5120` (text turn), `:6382` and `:6428` (response, voice and chat), `:7325` (member voice utterance, `sourceType:'voice'`, `role:'user'`); definition `lib/services/memoryService.ts:28`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED
- **COVERAGE** VOICE FAMILY **and** the typed path alike — the record: *"This is MODALITY-SYMMETRIC — the typed path is identical"*, therefore ⛔ not a voice-versus-typed divergence and ⛔ not a non-degradation breach
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND — none of the four sites is gated on `isSanctuary`, and `lib/services/memoryService.ts` contains no occurrence of `'sanctuary'` in any case
- **GOVERNING SOURCE** NONE LOCATED in this domain; the record routes the question to whichever domain owns Sanctuary (`CLAUDE.md` Sanctuary invariants 1 and 6 are the opposing text — see C5)
- **SOURCE RECORD** H_sensory_voice.md §6 (H-10), §8 C5

### P3-H-11 · Streaming voice path — the historical second mind
- **DOMAIN** H
- **NAMED OBJECT** `sendStreamingMessage` / `useStreamingVoice` / `app/api/voice/stream-conversation/route.ts` (1,600+ lines, **its own Claude service**)
- **ARTIFACT** `hooks/useStreamingVoice.ts:633`; `app/api/voice/stream-conversation/route.ts`; `components/OracleConversation.tsx:2609`; negative pin `__tests__/voice-non-degradation.test.ts:501-514`
- **STATUS** SUPERSEDED (preserved as evidence, unreachable from the voice handler)
- **ALTITUDE** EXISTS · WIRED (the hook is still called) · CI-GATED (the AST walk asserts neither identifier appears inside `handleVoiceTranscript`)
- **COVERAGE** a **second cognition family** carrying its own Claude service — ⛔ unreachable from the voice handler at the subject. Its coverage of any current MAIA-claiming path: NOT DETERMINED BY SOURCE RECORD (it is also the only caller of `resolveVoicePreference` outside the preview route)
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** CI-GATED negative assertion only
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §2, §4, §7

### P3-H-12 · Locally-authored non-cognition response paths X1–X6
- **DOMAIN** H
- **NAMED OBJECT** X1 offline fallback · X2 network-error fallback · X3 server-error fallback · X4 API catch block · X5 teen abuse block · X6 voice-flow catch — recorded by the source record as one named table; ⛔ **not merged to tidy a status**, and ⛔ not split
- **ARTIFACT** `components/OracleConversation.tsx:5386-5397`, `:5550-5561`, `:5630-5641`, `:6643ff`, `:5169-5210`, `:7404-7416`; second TTS entry `handleSpeakMessage` `:7499` → `apiFetch('/api/voice/openai-tts')` `:7517`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED
- **COVERAGE** VOICE FAMILY and the typed path (these are pre-cognition or failure paths in the shared response flow); ⛔ **no model authored X1–X3's words**. They do not reach the commit seam (P3-H-06), which is not yet in scope at X1–X3/X5, and X6 is a different function
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §3 (X1–X6 table and its scoping note)

### P3-H-13 · `BetaMinimalMirror` transcript consumer
- **DOMAIN** H · **NAMED OBJECT** `handleTranscript` (body is a single comment) · **ARTIFACT** `components/chat/BetaMinimalMirror.tsx:133`
- **STATUS** DORMANT · **ALTITUDE** EXISTS
- **COVERAGE** NONE — grep finds no mount of the component anywhere in `app/` or `components/`
- **LADDER** EXISTS (record: artifact present, no mount found) · **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD · **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §2, §7

### P3-H-14 · `app/oracle/page.broken.tsx`
- **DOMAIN** H · **NAMED OBJECT** its own `handleVoiceTranscript` binding · **ARTIFACT** `app/oracle/page.broken.tsx:1072,1122`
- **STATUS** ORPHANED · **ALTITUDE** EXISTS
- **COVERAGE** NONE — *"Filename `.broken.tsx` is not a Next route"*
- **LADDER** EXISTS (record: present, not routable) · **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD · **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §2, §7

### P3-H-15 · `lib/voice/*.DISABLED`
- **DOMAIN** H · **NAMED OBJECT** `MaiaRealtimeWebRTC` · `RealtimeSpiralogicBraid` · `RealtimeVoiceService` (3 files) · **ARTIFACT** `lib/voice/` (119 entries total)
- **STATUS** DORMANT by filename · **ALTITUDE** EXISTS
- **COVERAGE** NONE at the subject
- **LADDER** EXISTS · **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD · **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §7, §10
- **CARRIED** ⚠️ the remaining `lib/voice/` surface (`aethericOrchestrator`, `moshi/`, `personaplex/`, `MaiaRealtimeClient*`, `ElementalVoiceOrchestrator`, `UnifiedVoiceOrchestrator`, `MayaHybridVoiceSystem`, …) was **NOT TRACED** — flagged for P1-04, ⛔ not guessed at

### P3-H-16 · `VoiceWithNotes` transcript consumer
- **DOMAIN** H · **NAMED OBJECT** `VoiceWithNotes` · **ARTIFACT** `components/voice/VoiceWithNotes.tsx:75,179` → `POST /api/notes`
- **STATUS** NOT DETERMINED BY SOURCE RECORD (the record gives a disposition, not a status) · **ALTITUDE** EXISTS · WIRED
- **COVERAGE** NONE — *"Never reaches cognition — a capture surface, not a conversation"*
- **LADDER** NOT DETERMINED BY SOURCE RECORD · **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD · **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §2

### P3-H-17 · `MorningDreamCaptureInterface` transcript consumer
- **DOMAIN** H · **NAMED OBJECT** `onTranscript={(t) => setDreamContent(t)}` · **ARTIFACT** `components/dreams/MorningDreamCaptureInterface.tsx:242`
- **STATUS** NOT DETERMINED BY SOURCE RECORD · **ALTITUDE** EXISTS · WIRED
- **COVERAGE** NONE — fills a form field; no cognition
- **LADDER** NOT DETERMINED BY SOURCE RECORD · **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD · **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §2

### P3-H-18 · labtools scribe transcript consumer
- **DOMAIN** H · **NAMED OBJECT** `onTranscript: (result: TranscriptResult) => …` · **ARTIFACT** `app/labtools/scribe/page.tsx:78`
- **STATUS** NOT DETERMINED BY SOURCE RECORD · **ALTITUDE** EXISTS · WIRED
- **COVERAGE** NONE — *"labtools scribe surface, separate from the MAIA conversation"*
- **LADDER** NOT DETERMINED BY SOURCE RECORD · **GOVERNANCE GATE** NOT DETERMINED BY SOURCE RECORD · **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** H_sensory_voice.md §2

---

## DOMAIN I — MEMBER / PRACTITIONER

⛔ **Restated only.** Domain I's discipline was *record only; open nothing*, and it is held here.
⛔ No exploitability assessed, no severity rated, no repair or mitigation proposed, and ⛔ the
lane that now owns the authorization/exposure question is neither cited nor awaited.

### P3-I-01 · Practitioner reads a member's Living Field threads
- **DOMAIN** I
- **NAMED OBJECT** `GET /studio/fields/<memberId>` + the consent column `member_field_note_threads.can_be_shown_to_practitioner`
- **ARTIFACT** `app/studio/fields/[memberId]/page.tsx:9-11,63-77,79-85,94,104-107,109,117,134-205`; `config/accessMatrix.ts:485`; `database/migrations/20260626000001_member_field_note_threads.sql:8,40,96`; `app/api/maia/vision-studio/field-note/route.ts:11-15,36,107-130`; `app/api/now-what/field-note/[id]/route.ts:107-139`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (session present; caller holds an `active` row in `practitioners`; SQL predicate `can_be_shown_to_practitioner = TRUE AND released_at IS NULL`)
- **COVERAGE** NOT APPLICABLE — no MAIA cognition on this path (record: *MAIA AUTHORITY — none here*)
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED — P1-01 §2 established no ruled access model; the one artifact shaped like one self-disclaims (`NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md:141-142`)
- **SOURCE RECORD** I_member_practitioner.md CAP-I-01; Q1 row 1; Q2 row 1; C-I-1, C-I-2
- **CARRIED FINDING, VERBATIM IN KIND** ⭐⭐ the gate asks *"is the viewer an active practitioner?"*, never *"is this practitioner this member's practitioner?"*; `memberId` is a free URL segment; the consent column limits *which threads*, never *which practitioner*. Member authority: per-thread boolean, **DEFAULT `false`**, with a withdrawal path that is ownership-enforced inside the mutation, idempotent and ledgered

### P3-I-02 · Supervision sessions and clinical transcripts
- **DOMAIN** I
- **NAMED OBJECT** `GET /api/supervision/sessions` · `GET /api/supervision/transcript/list` (+9 sibling routes)
- **ARTIFACT** `app/api/supervision/sessions/route.ts:1-45` (`:5`, `:22-23`, `:26-31`); `app/api/supervision/transcript/list/route.ts:1-45` (`:7`, `:34-45`); `config/accessMatrix.ts:578`; `lib/supervision/SupervisionStore.ts`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (middleware matrix rule `:578`: tier `free`, ⛔ no `rolesAnyOf`; ⛔ **no handler-level authorization** — neither file imports any auth helper)
- **COVERAGE** NOT APPLICABLE — no MAIA cognition on this path
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED — P1-01 recorded supervision-stream governance **UNLOCATED**
- **SOURCE RECORD** I_member_practitioner.md CAP-I-02; Q1 row 2; Q2; C-I-5
- **CARRIED** ⚠️ both route headers assert *"HIPAA compliant"* — recorded verbatim as a **source-comment claim about storage location**; ⛔ not adjudicated. ⚠️ **SCOPE HONESTY**: four of eleven supervision routes were read in full; the remaining seven are **UNKNOWN**, not *"the same"*

### P3-I-03 · Caseload
- **DOMAIN** I
- **NAMED OBJECT** `GET /api/caseload/*` (9 routes) — practitioner identity taken from `memberId` in the query string
- **ARTIFACT** `app/api/caseload/list/route.ts:20-70` (`:22`, `:36`, `:45`, `:46-51`, `:61-64`); `app/api/caseload/[caseId]/memories/list/route.ts:36`; `app/api/caseload/[caseId]/notes/route.ts:47`; `config/accessMatrix.ts:470,727-729`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · CONFIG-SELECTED (`ACCESS_CONTROL_MODE`; the route family is **unmapped** in the matrix and the unmapped default is permissive — production value **UNKNOWN**) · RUNTIME-GATED (handler `CaseStore.isPractitioner(memberId)` → 403 when false)
- **COVERAGE** NOT APPLICABLE — no MAIA cognition on this path
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-03; Q1 row 3; C-I-4
- **CARRIED FINDING** ⭐⭐ the check is *is the member named in the URL a practitioner*, not *is the caller that member*; ⛔ no failure mode exists for *"caller is not the member named"* — that question is never asked

### P3-I-04 · Becoming a practitioner
- **DOMAIN** I
- **NAMED OBJECT** `POST /api/practitioners/create` — writes a `practitioners` row and sets `members.is_practitioner = true`
- **ARTIFACT** `app/api/practitioners/create/route.ts:13-27,43-60,144-165` (`:156-158` names the Studio gate it feeds); `lib/auth/getCurrentPractitioner.ts:36-48`; `config/accessMatrix.ts:534`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (middleware `minTier: 'pro'`, ⛔ no role; ⛔ the handler performs no authentication and no authorization — the `memberId` written is the one supplied in the body)
- **COVERAGE** NOT APPLICABLE — no MAIA cognition on this path
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-04; Q1 row 6; Q2 last row
- **CARRIED** the row created is exactly the row read by `getCurrentPractitioner()` and by P3-I-01's inline gate — **this capability is upstream of P3-I-01's only check**. ⚠️ `app/api/practitioners/verify-passcode/route.ts` was **NOT TRACED**; whether any client flow requires it before `create` is **UNKNOWN** — the `create` route does not

### P3-I-05 · Practitioner ⇄ client messaging, digest and prep
- **DOMAIN** I
- **NAMED OBJECT** `app/api/practitioner/clients/[clientId]/{messages,digest,prep,emergency,policy,spiralogic-report}/route.ts`
- **ARTIFACT** `digest/route.ts:15,30`; `messages/route.ts:15`; `spiralogic-report/route.ts:16,28,31-35`; `lib/practitioner/{messages,sessionPrep}.ts`; `20260802000002_practitioner_client_relationship.sql:26-39,45-52,150-154,265,333-347`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (`requireMemberId()`)
- **COVERAGE** NOT APPLICABLE — no MAIA cognition on this path
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-05; Q1 row 4; C-I-7
- **CARRIED, PER THE VOCABULARY RULE** ⚠️ `practitioner_id` references `practitioners(id)` in some tables and `members(id)` in others — *"Same column name, different referent"* — and the schema itself records three competing definitions and that *"the declared shape in this repository is therefore NOT authoritative."* Whether `requireMemberId()`'s value is the correct referent at each call site **could not be settled from the tree** and is recorded **UNKNOWN**, ⛔ not as a defect. Member link `practitioner_clients.member_id` is **write-once** (trigger refuses re-pointing and unlinking)

### P3-I-06 · Studio CRM surface (≈76 routes)
- **DOMAIN** I
- **NAMED OBJECT** `app/api/studio/**` with `getCurrentPractitioner(request)` at each handler
- **ARTIFACT** `lib/auth/getCurrentPractitioner.ts:27-66`; e.g. `app/api/studio/clients/route.ts:27-32`; tables `practitioner_clients`, `studio_practitioner_observations`, `studio_inquiry_responses`, `pattern_ledger`, encounters/moments/transcripts
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (identity server-derived and used in the `WHERE` clause; ⭐ *the best-behaved practitioner surface in the tree: identity is never accepted from the caller*)
- **COVERAGE** NOT APPLICABLE — no MAIA cognition on this path
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-06; Q1 row 5; Q2
- **CARRIED FINDING** ⭐⭐ across the practitioner-facing API and page trees, the **only** file selecting from a member-owned table is `app/studio/fields/[memberId]/page.tsx` (P3-I-01). *The Studio does not read the member's MAIA life; it reads the practitioner's own record of a professional relationship.* That boundary is **structural (no join exists), not permissioned.** ⚠️ Most of the ≈76 routes were classified by their shared authorization import rather than read individually

### P3-I-07 · Derived / inferred visibility (D-1 … D-8)
- **DOMAIN** I
- **NAMED OBJECT** the eight derived-visibility channels enumerated by the source record
- **ARTIFACT** `app/studio/fields/[memberId]/page.tsx:70-72,79-85,117,132,142,148-149,157-160,165-168,177,183-184,199`; `app/api/now-what/field-note/[id]/route.ts:132-139`; `20260730000002_practitioner_visibility_withdrawn_event.sql`; `app/api/sovereign/app/maia/list/route.ts:800-820`; `app/api/member/portal/route.ts:19-42`; `app/api/practitioner/programs/route.ts:11-15,19-24`
- **STATUS** WIRED-BUT-UNOBSERVED for D-1…D-6 (the record states `OBSERVATION-ONLY` is **not** used, because these are live render paths, not instrumentation)
- **ALTITUDE** EXISTS · WIRED
- **COVERAGE** NOT APPLICABLE for D-1…D-6 and D-8 (render paths, no MAIA cognition). D-7 concerns the cognition served by `app/api/sovereign/app/maia/list` — the record names the **route**, ⛔ not a family; coverage across MAIA-claiming families NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND for all of D-1…D-8
- **GOVERNING SOURCE** NONE LOCATED — P1-01 slice 08 §3: *"No document read in this slice addresses whether a practitioner could infer the existence of member-private material through metadata, counts, ordering, timestamps, notifications, suggested actions, or latency."*
- **SOURCE RECORD** I_member_practitioner.md CAP-I-07 (D-1…D-8); Q3
- ⛔ **Recorded only.** No repair proposed, no mechanism designed, no programme opened. Full inventory restated in the final section of this file

### P3-I-08 · `lib/relationship/scope.ts` — an explicit access model that nothing calls
- **DOMAIN** I
- **NAMED OBJECT** `ReadScope` · `resolveReadScope` · `canRead` · `practitionerMay` · `admitsToCommitment` · `maySystemDraw` · `wisdomMayCiteMemberMaterial` (returns `never`) · `ScopeViolation` · `Unruled`
- **ARTIFACT** `lib/relationship/scope.ts:50-420` (`:336-344`, `:345-362`, `:350`, `:369-412`); sole consumer `lib/relationship/__tests__/scope.test.ts`
- **STATUS** ORPHANED (the record is explicit: ⛔ **not** `DORMANT`, because P3-I-01 performs the very act this module models, and does so without it)
- **ALTITUDE** EXISTS
- **COVERAGE** NONE — it governs no live read; every hit outside the module is in its own test file
- **LADDER** EXISTS (record: present at the subject, no consumer outside its test)
- **GOVERNANCE GATE** ⛔ NONE FOUND — *a source file is not a ruled source, and no located ruling cites it*
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-08; C-I-3

### P3-I-09 · `lib/coachField/*` — the second access model that nothing calls
- **DOMAIN** I
- **NAMED OBJECT** `identity.ts` (incl. `authorizePractitionerClientRelationship()`) · `practitionerProjection.ts` · `bringForward.ts` · `invitation.ts`
- **ARTIFACT** `practitionerProjection.ts:57-73,64-67,109,201`; `bringForward.ts:5-8,14-24,98,151,167,180,209`; consumers `scripts/verify-practitioner-projection.ts:23-24`, `scripts/verify-bring-forward.ts:26`
- **STATUS** DORMANT (verification-script-reachable only)
- **ALTITUDE** EXISTS
- **COVERAGE** NONE — no route imports it. The `practitioner_clients` substrate it reads **is** live (P3-I-05/06); the projection over it is not
- **LADDER** EXISTS (record: present, zero importers in `app/` or `lib/`)
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-09; Q1 row 8; C-I-3
- **CARRIED FINDING** ⭐⭐ `bringForward` is, by its own header, *"the only place a member decides"* that anything crosses to a practitioner — and **no member-facing route reaches it.** The forbidden-table roster protecting the projection is held in the verify script so the module never names them — ⭐ a genuine discipline, ⚠️ protecting a projection no route calls. ⚠️ `updateOffering` also exists in `lib/offerings/offeringService.ts:79` — a **different** function; vocabulary collision recorded

### P3-I-10 · Practitioner observation atoms inside member memory
- **DOMAIN** I
- **NAMED OBJECT** `member_memory_atoms.source_type = 'practitioner_observation'` + `.facilitator_id` + `.epistemological_status`
- **ARTIFACT** `20260624000001_practitioner_observation_provenance.sql:5-9,11-14,17-26,21,28,45`; `lib/maia/memoryAtomsLoader.ts:171,186,202,296-311,442-447`; `lib/workbench/sources/keep.ts:86`; `lib/bookStudio/mirrorSources.ts:160-161`; `lib/psyche/portfolio.ts:385-392,718-780`
- **STATUS** ORPHANED — schema, read guards, loader projection, refusal path and member-side disposal all exist; ⛔ **the declared producer does not**
- **ALTITUDE** EXISTS · WIRED (read side) · RUNTIME-GATED (`PRACTITIONER_ATTRIBUTION_GUARD`; `keepSource()` throws for this source type)
- **COVERAGE** the atoms are projected into a MAIA prompt section (`# PRACTITIONER OBSERVATIONS`, split from `# MEMBER-PLACED PORTFOLIO`) — ⛔ **which MAIA-claiming cognition family consumes `memoryAtomsLoader` is NOT DETERMINED BY SOURCE RECORD**
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND — a migration header asserting *"Constitutional intent"* is implementation evidence under D-P1-06, not a ruled source
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-10; Q2; Q4(2); §6
- **CARRIED** ⭐ the direction is **practitioner → member**, inverse of every other capability in this domain. ⛔ **NO WRITER WAS LOCATED**; the named *"facilitated With-Me path (which sets facilitator_id)"* is **named-but-unverified**. ⛔ No member consent gate on creation was found — there is no creation path to gate

### P3-I-11 · Relationship spaces
- **DOMAIN** I
- **NAMED OBJECT** `relationship_spaces` (`invite_token`, `participant_member_id`, `status`, `consent_status`, `practitioner_display_name`, `practice_display_name`, `relationship_type`, `created_from`)
- **ARTIFACT** created `app/api/practitioner/practice-field/invite/route.ts:72-100`; consumed `app/api/join/[token]/route.ts:29`, `…/accept/route.ts:26,50`, `app/api/relationship-spaces/[spaceId]/{consent:27,52 · threshold:25}/route.ts`; member-facing `app/api/member/portal/route.ts:19-42`, `app/maia/portal/page.tsx:26,86,142`; MAIA-facing `app/api/sovereign/app/maia/list/route.ts:800-820`
- **STATUS** WIRED-BUT-UNOBSERVED
- **ALTITUDE** EXISTS · WIRED · RUNTIME-GATED (prompt injection gated on `status='active' AND consent_status='accepted'` and suppressed under `isSanctuary`)
- **COVERAGE** the cognition served by `app/api/sovereign/app/maia/list` — the record names the **route**, ⛔ not a family; coverage across other MAIA-claiming families NOT DETERMINED BY SOURCE RECORD
- **LADDER** NOT DETERMINED BY SOURCE RECORD
- **GOVERNANCE GATE** ⛔ NONE FOUND, **and specifically so** — P1-01 slice 08 §5 D-3 records that `relationship_spaces` is **excluded** from the Relationship Room Constitution's jurisdiction by a non-deciding instrument, and that **no read document claims it**
- **GOVERNING SOURCE** NONE LOCATED. ⭐ One **adjacent** founder ruling exists (2026-08-09, containment attribution, cited at `practice-field/[id]/containment/route.ts:9-14`) and it governs the practitioner's **own** material — ⛔ not practitioner visibility of member material
- **SOURCE RECORD** I_member_practitioner.md CAP-I-11; Q2; Q5
- **CARRIED** ⭐ member consent gesture **PRESENT and NAMED** (`consent_status`, moved by the member's accept). ⚠️ Its **schema default was not read** — the DDL was not located at the subject; **UNKNOWN**, not assumed. ⛔ What the consent authorizes is practitioner material flowing **toward** MAIA/member; it authorizes no practitioner read of member material

### P3-I-12 · `app/api/_backend/**` — vendored legacy backend
- **DOMAIN** I
- **NAMED OBJECT** `src/routes/facilitatorDashboard.routes.ts` + `src/services/{calendarIntegration,retreatSupport}Service.ts`, keyed on `facilitator_id`
- **ARTIFACT** `facilitatorDashboard.routes.ts:15,54,63` (Supabase query builders); `find app/api/_backend -name route.ts` → no results
- **STATUS** SUPERSEDED (Supabase-based; no Next route surface)
- **ALTITUDE** EXISTS
- **COVERAGE** NONE at the subject — the directory is `_`-prefixed and contains no Next route module, so it is not routable by the App Router
- **LADDER** EXISTS (record: present, not routable)
- **GOVERNANCE GATE** ⛔ NONE FOUND
- **GOVERNING SOURCE** NONE LOCATED
- **SOURCE RECORD** I_member_practitioner.md CAP-I-12
- **CARRIED** ⚠️ its Dockerfiles and `package.json` mean it may be built and run as a **separate service**; whether any deployment does so is **UNKNOWN** from the tree

---

## Contradictions carried forward (verbatim, both sides, unreconciled)

⛔ **Twenty contradictions. None is reconciled here, and neither side of any is dropped.**

**C-1 (G) · PROVIDER FAILURE: THE ORGANISM DOES BOTH, IN CODE.**
*Side A — DEGRADE*: `lib/ai/sovereignRouter.ts:15-17,50-61` returns `DEGRADED_TEXT` as an ordinary
`TextResult` on four failure branches; documented position `CLAUDE.md` — *"Fallback: Local Ollama
(DeepSeek models) when API unavailable."*
*Side B — REFUSE*: `lib/ai/structured/router.ts:116-131` returns
`{ ok:false, refusal:'provider_unavailable' }`, with *"THE FAILURE STOPS HERE. No second provider,
no local text path, no degraded template."*; documented position `router.ts:4` — *"STRUCTURED
INFERENCE v1 IS NON-FALLBACKABLE."*
⭐ *This is not a document-versus-code conflict. Both behaviours are implemented, on different
seams, at the same subject.* A **third** behaviour exists as well: with `MAIA_INFERENCE_MODE`
unset, `modelService.ts:180-193` falls back to a local Ollama text model with no drift event.

**C-2 (G) · `CLAUDE.md` versus the tree on cloud providers.** *Side A*: *"Never use OpenAI or other
cloud AI providers."* *Side B*: `provider-policy.json` tiers OpenAI as `lab` /
`removal_in_progress` with a 32-file allowlist; 30 live-tree files import the SDK or call
`api.openai.com`; `Dockerfile:57` sets `OPENAI_API_KEY=dummy-build-key`; `docs/adr/012` is Open /
Deferred. **Second limb**: *"or other cloud AI providers"* is contradicted by Moonshot, in the tree,
reachable by a per-request `meta` flag, in no tier and no guard.

**C-3 (G) · "Main gateway for ALL text generation" versus 60 allowlisted SDK importers.**
`lib/ai/modelService.ts:71-73` versus `scripts/anthropic-import-allowlist.json` (2 + 1 + 57).
Both are the project's own text.

**C-4 (G) · ADR-001 (Accepted) versus `selectClaudeModel` as it stands.** ADR-001 prescribes
7-level awareness → Opus/Sonnet routing *in `lib/ai/claudeClient.ts`* and says all routing
decisions MUST follow it; `claudeClient.ts:50-86` routes on `reasoningMode` and force flags and
defaults to Sonnet, awareness level surviving only in a log string. The code claims a *"NEW
PHILOSOPHY (Jan 2026)"*. No superseding ADR or ruling was located.

**C-5 (G) · The degraded string's claim versus the seam's behaviour.** `sovereignRouter.ts:16`
says *"I've saved your message."* The router performs no persistence. Whether a caller persists
the turn is caller-dependent and is not resolved.

**C-6 (G) · Declared scope of Kimi versus its trigger.** `modelService.ts:126` *"Never used for
live chat - only when explicitly requested"* versus `:127` `req.meta?.useKimi`, where `meta` is
`Record<string, unknown>` with no validation and no provenance.

**C1 (H) · MAIA'S DEFAULT VOICE PROVIDER.** *Side A* — `lib/tts/cloudVoicePolicy.ts:1-40`
(VOICE-SOVEREIGNTY-01, *"Founder canon ruling, 2026-08-27"*): *"⛔ THE DEFAULT IS THE CANON. Cloud
voice is forbidden unless `MAIA_ALLOW_CLOUD_VOICE=1` is set explicitly. An unset variable, a fresh
environment, a new deployment — all sovereign."* plus `ttsRouter.ts:62-67` and
`docker-compose.production.yml:176` (`MAIA_TTS_PROVIDER: "kokoro"  # Sovereign TTS — zero-OpenAI
doctrine`). *Side B* — `app/api/voice/openai-tts/route.ts:115,128-131`: *"MAIA vow: default voice
is always maia_core (OpenAI Alloy)"*, *"If archetype routes to OpenAI (MAIA feminine voices), skip
Kokoro entirely"*, with `voiceArchetypes.ts:59,88,92` making unset **or** unknown archetype resolve
to OpenAI, and `MAIA_VOICE_OVERRIDE` **absent** from the production compose file.
⭐ Both sides call themselves the vow; the archetype branch returns before the qualification, canon
and consent gates are reached.

**C2 (H) · STT/TTS latitude.** *Side A* — `CLAUDE.md`: *"STT/TTS are sensory infrastructure and may
change freely; the mind may not be substituted."* *Side B* —
`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md:87`: *"the ear may be improved
freely; the mind may not be substituted"* — latitude to the **ear only**. ⭐ *The code gates the
mouth and does not gate the ear — the exact inverse of the latitude `CLAUDE.md` grants.*

**C3 (H) · The non-degradation gate reads green on a system that never speaks.** *Side A*: the
gate asserts convergence — one cognition call, reached once. *Side B*: convergence says nothing
about **egress**; the 2026-09-07 defect left the gate green throughout. ⭐ The repair exists and
the gap is structurally closed — ⭐ but by a **second, separate** gate, and the non-degradation
gate is still green independently of it. Both halves recorded.

**C4 (H) · Sovereignty of the ear.** *Side A*: `transcribe-simple/route.ts:11-14` and
`transcribe/route.ts:27` — *"inbound member audio never leaves the host"*, *"never OpenAI cloud"*.
*Side B*: the **default** transport for Chrome and Safari members is `web-speech`, where
recognition is performed by the browser vendor off-device; Desktop alone is refused Web Speech, by
shell classification. Both sentences are true of different transports; neither is qualified in the
other's presence.

**C5 (H) · Sanctuary and the voice path.** *Found*: four `saveConversationMemory` call sites, none
gated on `isSanctuary`; `lib/services/memoryService.ts` contains no occurrence of `'sanctuary'` in
any case. *Against*: `CLAUDE.md` Sanctuary invariant 1 (*"No content retention"*) and invariant 6
(*"Absolute boundary"*). ⚠️ MODALITY-SYMMETRIC — the typed path is identical; routed out, not
repaired.

**C6 (H) · Citation coordinates.** Canon names the convergence at `:7268`; it is at `:7397`. The
exit map and the test header both name the crisis script at `:6712`; it is at `:6854`. The stale
comment the canon flags at `:7266` is still present at `:7395`, still reading `Browser STT →
/api/between/chat → Browser TTS`.

**C-I-1 (I) · "Deferred, held FALSE, no path" vs. a live path.**
`20260626000001_member_field_note_threads.sql:8,40,96` states the capability is **DEFERRED** and
the column *"held FALSE, no path"*; `app/api/maia/vision-studio/field-note/route.ts:107-130` binds
it to a client-supplied value and `app/studio/fields/[memberId]/page.tsx:69` reads it.

**C-I-2 (I) · "The consented facilitator view" vs. a role-only gate.**
`page.tsx:9-11` asserts consent; `:104-107` checks only that the viewer is *some* active
practitioner, and `:79-85` applies no predicate at all to `members.name` / `members.username`.

**C-I-3 (I) · Two written access models vs. the wired one.** `lib/relationship/scope.ts` and
`lib/coachField/*` encode member/practitioner read scopes, crossing rules and verb limits;
`app/studio/fields/[memberId]/page.tsx` performs a practitioner read of member material and
imports neither.

**C-I-4 (I) · `/caseload` declared with a role; `/api/caseload` matched by nothing.**
`config/accessMatrix.ts:470` declares `{prefix:'/caseload', minTier:'pro',
rolesAnyOf:['practitioner']}`; the API family lives at `/api/caseload/*`, which that prefix does
not match and no other rule matches; the unmapped default is permissive. ⚠️ Production
`ACCESS_CONTROL_MODE` is **UNKNOWN**.

**C-I-5 (I) · `/api/supervision` declared free-tier, no role; content is clinical.**
`config/accessMatrix.ts:578` vs. the routes' *"HIPAA compliant"* headers and their absent handler
authorization.

**C-I-6 (I) · Facilitator and practitioner: one actor, two vocabularies.**
`member_memory_atoms.facilitator_id` attributing `source_type='practitioner_observation'` vs.
`CircleRole`, where `facilitator` is a distinct enforced role unrelated to `practitioners`.

**C-I-7 (I) · `practitioner_id` refers to two different tables.** Recorded by the schema itself
(`20260802000002…:45-52`), with three competing table definitions at `:26-39` and the explicit
warning that *"the declared shape in this repository is therefore NOT authoritative."* ⛔ Per the
vocabulary rule no finding attaches to the token.

**C-I-8 (I) · The matrix's own DECLARED-vs-ENFORCED divergences.**
`config/accessMatrix.ts:288,299,392-404,531` — four cases the file records itself, one labelled
*"Unreconciled"* in its own note.

---

## Fields NOT DETERMINED BY SOURCE RECORD

**Row count normalized: 48** — G **18** · H **18** · I **12**. Each row carries all eleven fields.

| Field | Rows reading NOT DETERMINED BY SOURCE RECORD | Note |
|---|---|---|
| **LADDER** | **41 of 48** | ⛔ The three P1-02 records never use the ladder vocabulary. `EXISTS` is written on the **7** rows where the record verified the artifact present **and** recorded zero consumers / no reachable call path: P3-G-09, P3-H-13, P3-H-14, P3-H-15, P3-I-08, P3-I-09, P3-I-12 |
| **GOVERNANCE GATE** | **11** — P3-G-12, P3-G-15, P3-G-16, P3-G-17, P3-H-12, P3-H-13, P3-H-14, P3-H-15, P3-H-16, P3-H-17, P3-H-18 | the records state scope or disposition, not a gate over the object itself |
| **COVERAGE** | **1 wholly** — P3-G-11. **12 further rows** determine coverage for a named family and mark coverage *beyond* it NOT DETERMINED: P3-G-01, P3-G-02, P3-G-03, P3-G-05, P3-G-07, P3-G-08, P3-G-10, P3-G-14, P3-H-11, P3-I-07, P3-I-10, P3-I-11 | INF-5 forbids a row without a coverage value; these say plainly how far the record determined one |
| **STATUS** | **3** — P3-H-16, P3-H-17, P3-H-18 | the record gave a disposition (*"never reaches cognition"*), ⛔ not a status |
| **ALTITUDE · ARTIFACT · NAMED OBJECT · DOMAIN · ROW ID · SOURCE RECORD** | 0 | determined for every row |

**Other values carried forward as explicitly UNKNOWN by the source records** (⛔ not normalized
away): production value of `MAIA_INFERENCE_MODE` · production value of `ACCESS_CONTROL_MODE` ·
values of `FOUNDER_MEMBER_IDS` / `LAB_ACCESS_MEMBER_IDS` / `CIRCLE_ACCESS_MEMBER_IDS` ·
the `relationship_spaces` DDL and its `consent_status` default · whether `minimumBloomLevel` was
ever evaluated · whether any deployment runs `app/api/_backend/**` · the status of seven of eleven
supervision routes · reachability of the remaining `lib/voice/` surface (119 entries).

---

## Rows where GOVERNANCE GATE is NONE FOUND

**26 of 48 rows carry `NONE FOUND` with no qualification.**

```text
G (10)   P3-G-02  P3-G-03  P3-G-05  P3-G-06  P3-G-07  P3-G-08  P3-G-09
         P3-G-13  P3-G-14  P3-G-18   (P3-G-18: NONE FOUND for a migration gate
                                      separate from a deploy)
H  (4)   P3-H-01  P3-H-03  P3-H-09  P3-H-10
I (12)   P3-I-01  P3-I-02  P3-I-03  P3-I-04  P3-I-05  P3-I-06  P3-I-07  P3-I-08
         P3-I-09  P3-I-10  P3-I-11  P3-I-12
```

⭐ **Domain I is twelve of twelve.** Restated from the source record without softening: *"Twelve
capabilities, twelve `NONE FOUND`. Per constraint 6 this is what **P1-GOV-ACCESS-01** looks like
from the implementation side: the absence is weakened by none of it. The one located founder
ruling touching a practitioner surface governs the practitioner's **own** material, in the
opposite direction."*

**A further 6 rows carry NONE FOUND for a named aspect while something else is present** — ⛔ listed
separately so neither half is lost:

```text
P3-G-01  one inline string refusal (modelService.ts:89-91)  ·  NONE FOUND at runtime otherwise
P3-G-10  CI-GATED commit-time allowlist present  ·  NONE FOUND at runtime
P3-G-11  CI-GATED commit/CI-time guard present   ·  NONE FOUND at runtime
P3-H-02  auth · entitlements · daily quota       ·  NONE FOUND for provider egress or consent
P3-H-04  CI-GATED closed-set pin                 ·  no authorization ruling found for any guard
P3-H-07  five named TTS gates exist              ·  three of them NOT REACHED on the archetype branch
```

**Rows with a gate recorded as present (5):** P3-G-04 (the only structural runtime provider gate in
domain G) · P3-H-05 (canon + closed-set gate) · P3-H-06 (source-shape CI gate, ⛔ no ruling) ·
P3-H-08 (PARTIAL, ⛔ no ruling document located) · P3-H-11 (CI-GATED negative assertion only).
**11 rows read NOT DETERMINED BY SOURCE RECORD.** 26 + 6 + 5 + 11 = 48. Per **INF-2** and
**INF-4**, none of the CI-GATED entries is thereby runtime-governed, and finding the code does not
make the behaviour governed.

---

## Provider-failure semantics — the three implemented dispositions, separately

⭐ **Restated, ⛔ not resolved.** Per Amendment 1 §4: *provider failure semantics are PLURAL in the
implemented organism*, and ⛔ **no synthesis may simplify this to "MAIA falls back" or "MAIA
refuses."** The three are carried as three rows with their own coverage, and are **not** merged
into any row called *"provider fallback."*

**DISPOSITION 1 · LOCAL FALLBACK — row P3-G-06.**
`lib/ai/modelService.ts:180-193` → `lib/ai/localModelClient.ts`. Reached when `MAIA_INFERENCE_MODE`
is **unset** and Claude throws with `SMOKE_NO_FALLBACK` unset, and whenever `TEXT_MODEL_PROVIDER`
holds an unrecognized value. Falls back to a local Ollama text model. ⛔ **No drift event is
emitted at all.** Under the `consciousness_engine` provider this branch returns
`model: 'template-engine'` — *a fourth answer-producing path that is not a model at all*.
COVERAGE: CONVERSATIONAL TEXT FAMILY only.

**DISPOSITION 2 · DEGRADED FIRST-PERSON OUTPUT — row P3-G-02.**
`lib/ai/sovereignRouter.ts:15-17,50-61`; four exits `:77`, `:85`, `:117`, `:125`. Reached **only**
when `MAIA_INFERENCE_MODE` is non-empty; an unrecognized mode is treated as unreachable and also
returns `degradedResult`. The string is returned as `TextResult.text` with `provider:'unknown'`,
`model:'degraded'`, `mode:'fallback'`, `reason:'all_providers_unavailable'` — **indistinguishable
in type from a generated answer**, and `lib/sovereign/maiaService.ts:1561` destructures and
proceeds. Three of the four exits emit no drift event; the one `emitDriftEvent('silent_fallback',…)`
at `:105` is on none of them.
⭐ **THE FINDING, EXACTLY AS RATIFIED:** *The emitting seam makes a persistence claim it does not
itself discharge; end-to-end truth of that claim is caller-dependent and presently unresolved.*
⛔ **NOT** *"MAIA lies about saving."* **That stronger statement has not been earned.** If domain B
later traces the relevant callers it may resolve **individual paths**; ⛔ it must not retroactively
generalize across every degraded-response caller unless every caller is inspected.
COVERAGE: CONVERSATIONAL TEXT FAMILY only.

**DISPOSITION 3 · HARD REFUSAL — row P3-G-04.**
`lib/ai/structured/router.ts:116-131` → `{ ok:false, refusal:'provider_unavailable', detail }`;
adapter-load failure → `refusal:'not_configured'`; in-file rule at `:121-124`: *"THE FAILURE STOPS
HERE. No second provider, no local text path, no degraded template."* Reached from the five
Writer's-Studio reader callers, **always**. `resolveStructuredMode()` refuses an invalid
`MAIA_INFERENCE_MODE` with `invalid_inference_mode`, **never a default**.
COVERAGE: STRUCTURED-READING FAMILY only.

**Carried across all three, ⛔ unresolved:**
- ⭐ **Which behaviour governs production is UNKNOWN from repository evidence alone.**
  `MAIA_INFERENCE_MODE` appears in no tracked deployment config — only in test/gate scripts and as
  a prose comment in `docker-compose.production.yml:886`.
- ⛔ **INF-3**: an environment variable selecting the disposition **authorizes nothing**.
- ⚠️ The billing/auth fail-fast branch (`sovereignRouter.ts:101`, `modelService.ts:167`) checks
  `err?.noFallback || err?.code === 'ANTHROPIC_BILLING_ERROR'` — properties **no code sets** — and
  `claudeClient.ts:199-205` re-wraps every error so it cannot carry them. *The billing/auth
  no-fallback guard is, as read, unreachable from the Anthropic client.*
  `REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.

---

## Derived-visibility inventory (from domain I, restated verbatim in kind)

⛔ **Not extended. Not assessed. Not rated.** Recorded only, per the source record's own
discipline (F9 / D-P1-08). All eight belong to row **P3-I-07**; **GOVERNANCE GATE for all of
D-1…D-8: ⛔ NONE FOUND.**

**D-1 · Member existence and real name — no consent predicate, no relationship.**
`app/studio/fields/[memberId]/page.tsx:79-85` runs `SELECT id, name, username FROM members WHERE
id = $1`. Name renders at `:142,159,166,199`. Supplying an id reveals that it resolves to a real
member, and that member's name.

**D-2 · An existence oracle over the *absence* of shared material.** Three distinguishable
outcomes: unknown id → `notFound()` (`:117`); known id + zero shared threads → the member's name
plus *"has not yet carried anything from a Vision Studio session"* (`:165-168`); known id + ≥1
thread → the threads. *"Exists and has shared nothing"* is readable, and distinct from *"no such
member"*.

**D-3 · Counts, phase counts, ordering.** `totalThreads` (`:132,148`), `orderedPhases.length` as
*"N phases active"* (`:149`), per-phase count badge (`:177`), ordering `created_at ASC` within
phase (`:70-72`). The counted set is consent-filtered — ⚠️ but the practitioner cannot see its
complement, and the counts move on withdrawal (D-4).

**D-4 · Withdrawal is silent, hence inferable by difference.** The PATCH flips the flag
(`app/api/now-what/field-note/[id]/route.ts:132-139`); **no practitioner notification writer was
found**. The thread leaves the result set; a practitioner who saw the page before and after
observes a count decrease and a missing title. The act is recorded in `member_field_note_events`
— a **member-side** ledger; no practitioner read of it was found.

**D-5 · Authorship class disclosed per thread.** `t.authorship` renders `member-authored` vs
`member-confirmed` (`:183`) — whether the member wrote it or MAIA proposed and the member kept it.
Dates at `:184`.

**D-6 · A truncated member identifier is echoed to the practitioner.** `:157-160` renders
`/maia/vision-studio?fieldContext=` plus the first 8 characters of the member's uuid.

**D-7 · Relationship-space state flows member-ward only.**
`app/api/sovereign/app/maia/list/route.ts:800-820` injects practice-field context into **MAIA's**
prompt for the member, gated on `status='active' AND consent_status='accepted'` (`:806`) and
`!isSanctuary` (`:801`); `app/api/member/portal/route.ts:19-42` shows the member their own spaces.
⭐ **No reverse path was found.** Recorded as an absence found by search, ⛔ not a proof of absence.

**D-8 · Program positions are structurally unreadable by the practitioner.**
`app/api/practitioner/programs/route.ts:11-15`: *"This surface writes the CURRICULUM only. Member
positions are a different jurisdiction entirely: no route here reads, counts, or aggregates them,
and none may be added (catalog spec §8 — the absence is the feature)."* Verified: it imports only
`getAuthoredField`, `listPrograms`, `createProgram` (`:19-24`) and never touches
`programPositionService`. ⭐ The one **enforced-by-construction** non-visibility here. ⛔ Still
**GOVERNANCE GATE: NONE FOUND** — *"catalog spec §8"* is a spec reference and P1-01 located no
ruling binding it.

**Not found** (restated from Q3): practitioner-facing notification of member activity — all hits
concern the practitioner's own schedule/booking/Stripe. No practitioner-facing latency or presence
surface. No reverse read of `relationship_spaces` consent state. No practitioner read of program
positions.

⛔ **No model designed, no mechanism proposed, no threshold invented, and no k-anonymity rule
imported from any adjacent doctrine.**

---

```text
P1-03 · DOMAINS G · H · I · NORMALIZED
AUTHORITY EXERCISED   READ (three P1-02 records) · RESTATE
⛔ NO SOURCE CODE READ · ⛔ NO STATUS UPGRADED · ⛔ NO LADDER POSITION INVENTED
⛔ NO CONTRADICTION RECONCILED · ⛔ NO ROW MERGED OR SPLIT TO TIDY A STATUS
⛔ NO CAPABILITY ADDED · ⛔ NO REPAIR PROPOSED · ⛔ NO LANE OPENED
⛔ NO FILE EDITED EXCEPT THIS ONE
```
