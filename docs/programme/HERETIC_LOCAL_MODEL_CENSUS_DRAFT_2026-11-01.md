# Heretic (p-e-w/heretic) — local-model census (READ-ONLY) — DRAFT 2026-11-01

**State:** `DISCOVERED`. ⛔ Nothing installed, nothing wired, no model modified, no policy edited.
**Mandate:** census of where local models are used by JARVIS and by MAIA's runtime, so a boundary rule can later be proposed. Authority for any change is NOT held.
**Evidence class:** code-read + one local `ollama list` / env probe. Code-read establishes what the code says, not what runtime does.

## 1. What Heretic is (from heretic-project.org + the GitHub README; ⛔ repo source not read)
- Training-free model modification: an Optuna (TPE) optimizer tunes a modifier (default Arbitrary-Rank Ablation; also classic abliteration) against scorers (default: refusal rate + KL divergence from the original).
- Shipped configs: default (suppress refusals), `noslop`, `nohumor`, `nosyco` (reduce sycophancy), `emotions` (alter emotional alignment); custom scorer plugins.
- Licence AGPL-3.0. Optional 4-bit via bitsandbytes.
- "Benchmarks favorably" is a community claim (MMLU/GSM8K); ⛔ not evidence about crisis handling or manipulation.

## 2. Mac Studio probe
- 48 GiB unified memory. Python 3.12.12. `torch` NOT installed; `heretic` NOT installed.
- ⚠️ UNVERIFIED: whether Heretic runs on Apple Silicon (MPS). No statement found in what was read; bitsandbytes 4-bit is CUDA-oriented.
- `ollama list`: gpt-oss:20b · jarvis-qwen3-coder:65k · llama3.1:8b · qwen2.5:7b · nomic-embed-text · maia-content · maia-coder · qwen3:32b · qwen3-coder:30b · deepseek-r1(:8b) · x/z-image-turbo.

## 3. JARVIS local-model wiring (code-read)
- `scripts/ain-delegate.sh`: lane `local` → `maia-coder:latest`; `local-native` → runs through `claude -p` with a model override; `kimi` lane exists; model otherwise explicit.
- `scripts/builder/jarvis-local-worker.mjs`, `opencode-provider.mjs`, `jarvis-native-patch-admission.mjs`, `jarvis-runtime-pipeline.mjs`, `work-unit-*` and `jarvis-desktop/src/{main,builder-mechanism,work-unit-control}.js` reference local/Ollama lanes.
- Model identity is chosen by lane/work-unit, so a substituted model would enter by changing a model name, not by changing a gate. ⚠️ Not yet traced: whether any admission gate pins model identity or digest.

## 4. MAIA runtime local-model paths (code-read) — the member-facing risk surface
- `lib/consciousness/LLMProvider.ts`: chain Claude → Ollama fallback; `MAIA_STRICT_503=true` returns 503 instead of falling back; `LOCAL_TIER_ENABLED` routes levels 1–2 to local Ollama.
- `lib/ai/modelService.ts` ("Fallback: local Ollama/DeepSeek"), `lib/ai/localModelClient.ts` (fails closed), `lib/maia/assertProviderAvailable.ts` (`OLLAMA_BASE_URL` + `OLLAMA_MODEL` enable fallback).
- Model names are env-driven: `OLLAMA_MODEL`, `OLLAMA_MODEL_GENERAL/FAST/DEEP`, `OLLAMA_EMBED_MODEL`. Nothing in the greps shows the model digest being pinned or checked.
- ~50 further files reference Ollama (soulPortrait, corpusCallosum, relational-field-shadow, practice, caseload, supervision, media, etc.).
- `docs/canon/PROVIDER_GOVERNANCE.md` lists Ollama (chat + embedding) as production-admitted per capability.
- ~~⚠️ Not verified: the production minisforum Ollama model list and env values.~~ **Witnessed 2026-11-01 (read-only ssh, runtime `d49dbc98d`):**
  - `ollama list` on minisforum: `nomic-embed-text:latest` (0a109f422b47) · `qwen2.5:7b` (845dbda0ea48) · `qwen2.5:14b-instruct` (7cdf5a0187d5). All three are on the gate's allowlist. No modified model is present.
  - `maia-sovereign` env: `OLLAMA_MODEL=qwen2.5:7b` · `OLLAMA_MODEL_GENERAL=qwen2.5:7b` · `OLLAMA_MODEL_FAST=qwen2.5:7b` · `OLLAMA_MODEL_DEEP=qwen2.5:14b-instruct` · `LOCAL_TIER_ENABLED=true` · `MAIA_STRICT_503=1`.
  - `MAIA_STRICT_503=1` is parsed as on (`LLMProvider.ts:180` accepts `'1'`), so a Claude failure returns 503 rather than falling back to Ollama in that path. ⚠️ But `LOCAL_TIER_ENABLED=true`, so levels 1–2 are routed to local `qwen2.5:7b` by design: **local models do serve members in production today.** That is why the rule matters.
  - The 2026-11-01 Ollama digests above are the reference if digest pinning is ever authorized.

## 5. Findings (report only; none authorized as work)
1. Ollama is a real member-facing path (fallback, local tier, and ~50 feature modules), so a refusal-removed model would reach members if its name were set in env.
2. No evidence found that model digest/identity is pinned at the Ollama boundary. The serving-identity header (`X-MAIA-Provider`) names the provider, not the weights.
3. Existing governance scopes by provider and capability; it has no class for "weights modified after publication" (same shape as the dev-lane gap in the 2026-09-20 finding).
4. JARVIS lanes select models by name, with no digest pinning observed.
5. `nosyco`/`noslop` are potentially aligned with MAIA vows, but are still behavior steering on weights and would need our own evaluation.

## 6. Not authorized / not done
Install Heretic · run it on any model · pull third-party weights · edit env/Ollama config · edit PROVIDER_GOVERNANCE · add a gate · touch minisforum.

## 7. Boundary rule — RULED by founder 2026-11-01 (in chat: "Yes, adopt rule")
**Rule:** Heretic-modified weights are a dev-lane tool only. They may not be named in any member-facing config (`OLLAMA_MODEL*`, `LOCAL_TIER_*`, the Ollama fallback).
**Scope of the ruling:** the rule is adopted. ⛔ The ruling does NOT by itself authorize: the enforcing gate (a bar does not authorize the mechanism that would enforce it), installing Heretic, running it on any model, or editing PROVIDER_GOVERNANCE. Each remains `PROPOSED` until separately authorized.
**Gate drafted 2026-11-01 (founder: "Yes, draft gate") — ⛔ DRAFT, UNWIRED:** `scripts/check-member-facing-models.mjs` + `.test.mjs` + `config/member-facing-ollama-models.json`. Fails closed on: modification marker · name not in allowlist · allowlist missing/malformed/carrying a marker · scan finding zero assignments. Evidence: 13/13 falsifier cases pass (9 defeat candidates incl. rename-evasion and compose `:-` defaults); gate passes on the repo (15 assignments / 5531 files) and fails on an injected `qwen2.5-heretic:7b` compose default. The first run also surfaced `llama3.1:8b` in `lib/ai/localModelClient.ts:22`, missed by the census greps, and a parser false positive on `${KEY:-x}` that was fixed. **Limits:** name-level only — cannot see digests, so a modified model re-created under an allowlisted name (`ollama create qwen2.5:7b`) is NOT caught; untracked env (minisforum `.env.production`) not covered unless `--local` is run there; allowlist inclusion is current state, not a vetting claim. **Wired 2026-11-01 (founder: "Yes, wire it"), uncommitted:** `npm run check:member-facing-models` added to `package.json`, to `ci:sovereignty` (which `.github/workflows/sovereignty-gate.yml` runs on every PR and on pushes to `clean-main-no-secrets`, so CI is covered), to `preflight`, and to `.githooks/pre-commit`. Verified: passes via npm; fails closed (exit 1) with the allowlist removed; hook syntax valid. ⚠️ Not witnessed: an actual CI run or an actual commit through the hook (needs a pushed branch / commit). **Not done / not authorized:** digest pinning, minisforum check, committing.

**Still open (not ruled):** whether any modified model may ever serve a member path, and under what evaluation. Until ruled, the answer is no, by the rule above.

## 8. Owed before any trial
Apple Silicon feasibility check · trial design with our own scorers (sycophancy, crisis-handling, non-manipulation) · AGPL boundary note (standalone tool only) · minisforum Ollama census.
