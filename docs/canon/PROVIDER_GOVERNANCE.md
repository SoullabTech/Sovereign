# Provider Governance

**Status:** Canon (ratified 2026-07-07). Machine-readable policy: [`scripts/provider-policy.json`](../../scripts/provider-policy.json). Enforcement: [`scripts/check-provider-governance.ts`](../../scripts/check-provider-governance.ts) (`npm run check:no-openai`).

## Principle

> Providers are **replaceable, governable infrastructure beneath MAIA's identity — never the identity itself.**

The point is not "remove OpenAI." The point is that *no* provider is load-bearing for who MAIA is. Substrate inference (chat, embedding, TTS, STT) is one conditional manifestation pathway, swappable at will, governed by policy. `check:no-openai` is the first *implementation* of that policy, not the policy itself — the same guard generalizes to any provider we later need to constrain.

**Companion document:** [`OPTIMIZATION_TOOLING_GOVERNANCE.md`](./OPTIMIZATION_TOOLING_GOVERNANCE.md) governs *what kinds of optimization are legitimate, and where their constitutional boundaries lie* — a different question from this document's *who may enter the runtime, and under what conditions*. The two complement rather than overlap; neither grants runtime standing the other withholds. See the constitutional map at the end of this document.

## The policy

Every provider sits in exactly one tier, and each tier grants explicit capabilities. **A provider may only receive the data classes its tier authorizes.**

| Tier | May run in prod? | May receive member data / audio? | Providers |
|---|---|---|---|
| **Production** | yes | yes (per capability) | Anthropic (chat, via sovereignRouter) · Ollama (chat + embedding) · Kokoro (TTS) · Sesame (TTS) · faster-whisper (STT) · PersonaPlex (TTS, *pending qualification*) |
| **Lab** | **no** (never a default) | **no** (only inside an explicit, gated evaluation) | **OpenAI** (benchmark only, *removal in progress*) |
| **Forbidden** | — | — | *rules, not providers* (below) |

**Capabilities** are the real unit of governance: `member_data`, `member_audio`, `chat`, `embedding`, `tts`, `stt`, `benchmark`. A production provider without `member_data` may still not receive it.

### Forbidden rules (target: zero, never allowlisted)

- **Browser API keys** — `NEXT_PUBLIC_*OPENAI*` or any provider secret reaching the client bundle.
- **Direct provider calls for cognition** that bypass `lib/ai/sovereignRouter`.
- **Provider-specific UI** — vendor voice/model names surfaced to members.

## How the guard works

`check-provider-governance.ts` scans tracked source for OpenAI clients/imports (`openai`, `@langchain/openai`, `new OpenAI(`), the OpenAI REST endpoint, and browser keys. A match in a file **not** on the policy allowlist **fails** (exit 1). The allowlist in `provider-policy.json` is the **enumerated migration debt** — it can only shrink. New surfaces cannot enter; existing ones are burned down.

Wired into: **preflight**, **CI**, and the **pre-commit** hook (`scripts/setup-githooks.sh`).

### Adding / changing a provider

Editing tiers or the allowlist is a governance act, reviewed in PR. Adding a file to `pending_migration` is *migration debt* and should draw pushback. Adding to `quarantine_browser_keys` is not allowed — remove the client-side key instead.

## OpenAI removal — burn order

The allowlist is retired in this sequence (each step verified before the next):

1. **Browser keys** (`quarantine_browser_keys`) — sharpest risk; delete the client-side key exposure.
2. **TTS** — flip `ttsRouter`/`voiceArchetypes` defaults to Kokoro; keep OpenAI reachable only inside the admin **Voice Lab** behind a qualification gate; then delete `openaiTts.ts`.
3. **Voice Lab** — stand up blind comparison / scenario / longitudinal evaluation with provenance + scoring across production + lab providers.
4. **`_backend`** — de-OpenAI the reachable `ElementalIntelligenceRouter` fallback (or retire the 6 importing routes), then delete the legacy tree.
5. **Other embedders / LangChain / deps** — migrate, then drop `openai` + `@langchain/openai` from `package.json`.
6. **`OPENAI_API_KEY`** — final closure: remove from prod env, Dockerfile, and CI secrets once nothing references it.

**Already closed:** STT (local faster-whisper, `dfde99697`) · episodic embeddings (local `nomic-embed-text`, `acd6cbd74`).

When the allowlist reaches zero, OpenAI drops out of the policy entirely and the tier structure remains as standing constitutional infrastructure for whatever providers come next.

---

## See also — constitutional map

The governing layer reads as a set of complementary questions, not independent documents:

- **[Provider Governance](./PROVIDER_GOVERNANCE.md)** *(canon)* — *who* may enter the runtime, and under what conditions.
- **[Optimization Tooling Governance](./OPTIMIZATION_TOOLING_GOVERNANCE.md)** *(canon)* — *what* optimization authority is legitimate, and where its boundaries lie.
- **[Attention-Salience Principle](../ux/ATTENTION_SALIENCE_PRINCIPLE_CANDIDATE_2026-07-26.md)** *(candidate — not yet ratified)* — *how* interaction should present decisions.
- **Voice Interaction Architecture** *(Cat-1 candidate, sealed — not yet ratified)* — the technical architecture implementing these principles.
- **[Multi-Model Session Mode](../ai/MULTI_MODEL_SESSION_MODE.md)** — the development lane within which these tools operate.
