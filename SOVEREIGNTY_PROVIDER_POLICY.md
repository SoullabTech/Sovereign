# MAIA Sovereignty Provider Policy

_This document is binding. It governs every production deployment of MAIA-SOVEREIGN._
_Last updated: 2026-03-12_

---

## 1. Production Doctrine

**OpenAI has zero runtime access in production.**

No API calls, no SDK instantiation, no key injection, no fallback paths, no "emergency" override.
This is not a performance preference. It is an ethical and architectural boundary.

Every OpenAI API call (TTS, STT, embeddings, chat, moderation, realtime) routes platform data —
including member voice, text, memory, and context — through infrastructure we do not control.
That is incompatible with what MAIA claims to be.

**Exception process:** Any exception requires explicit written approval from the project owner,
code review, and a documented sunset date. Exceptions are not granted at deploy time.

---

## 2. Approved Providers by Capability

| Capability | Approved Provider | Notes |
|---|---|---|
| Language / reasoning | Claude (Anthropic) via `ANTHROPIC_API_KEY` | Primary |
| Language fallback | Ollama (local DeepSeek) | When Claude unavailable |
| TTS | Kokoro (local) via `/api/voice/local-tts` | `ttsRouter.synthesize()` |
| STT | Browser Web Speech API (client-side) | No server-side STT |
| Embeddings | Ollama `nomic-embed-text` (local) | `generateLocalEmbedding()` |
| Vector search | pgvector (local PostgreSQL) | Self-hosted |
| Moderation | None required (Claude-native) | |
| Image generation | Not in production | Use local models offline |

**Explicitly prohibited:** OpenAI (all services), ElevenLabs, Azure OpenAI, Anthropic (for TTS/STT),
any cloud STT/TTS provider not listed above.

---

## 3. Enforcement Layers

### Code layer
- `scripts/check-no-openai-runtime.sh` — catches SDK imports, raw `api.openai.com` fetch, and
  `OPENAI_API_KEY` usage as a value in non-comment code
- Runs in `npm run preflight` and must pass before every commit
- All OpenAI-touching code is either tombstoned (`export {}`) or returns 503

### Environment layer
- `OPENAI_API_KEY` must not be present in any deployed environment
- `.env.production`, `.env.staging`, and Docker env must not contain the key
- Template files (`.env.docker.template`) should show the variable as explicitly disabled

### Network layer
- Production containers deny outbound connections to `api.openai.com`
- Egress is an allowlist, not a denylist
- See `docs/ops/zero-openai-deploy-checklist.md` for setup instructions

### Drift detection
- After every deploy: `grep` production logs for `openai` egress patterns
- Monthly: run `check:no-openai-runtime` against the deployed revision

---

## 4. Incident Response

If OpenAI egress is detected in production:

1. **Contain** — Remove `OPENAI_API_KEY` from all envs immediately
2. **Identify** — Trace which codepath triggered the call (logs, network traces)
3. **Patch** — Apply code fix in a new worktree branch; require review
4. **Redeploy** — Rebuild and push; verify zero egress in logs
5. **Record** — Add the drift pattern to `scripts/check-no-openai-runtime.sh`
   so it cannot recur without detection

Do not treat it as a minor misconfiguration. It is a sovereignty boundary breach.

---

## 5. Why This Matters

> Every OpenAI API call from a production MAIA session means a member's voice,
> reflection, or memory transits infrastructure we do not operate, under terms
> we do not fully control, for data practices we cannot audit.

MAIA's legitimacy as a sovereignty-first tool depends on the architecture
matching the claim. This policy exists to close the gap between what we say
and what we ship.

---

_See also:_
- `lib/ai/openaiPolicy.ts` — code-level doctrine
- `docs/ops/zero-openai-deploy-checklist.md` — deployment operations
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — relational constitution
