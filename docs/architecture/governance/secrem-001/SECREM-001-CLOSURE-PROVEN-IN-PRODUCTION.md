# SECREM-001 — CLOSURE

## Status: **PROVEN IN PRODUCTION**

Founder classification, 2026-08-12.

| | |
|---|---|
| **Deployed SHA** | `3d1e2734829626e29873a655ee189c9a091d1247` |
| **Parent** | `e5f2c5fa2ba6b1d4518e90e43945c7f67fe2033d` — the commit production was running |
| **Image** | `sha256:7a2289024d2d62be15938678dd3e83e26e0e857225f704beeca3fbb9b89032d6` (was `sha256:32ccf1ea…`) |
| **Host** | `minisforum` (192.168.0.104) — the actual `soullab.life` server |
| **Deploy window** | 2026-08-12 17:36:13 → 17:42:40 EDT · `EXIT=0` · **no rollback required** |
| **Scope** | one file, `lib/sovereign/maiaVoice.ts`, +16 / −107 · blob `8ea2f62a…` → `029c0cbf…` |

---

## What was closed

Two client-controlled guard blocks in prompt assembly, at `maiaVoice.ts:542-568` (FAST/CORE, `buildMaiaWisePrompt`) and `:958-1033` (DEEP repair, `buildMaiaComprehensivePrompt`), both predicated on `maiaPaiConfig && conversationDepth === 'opening' && maiaPaiConfig.maxTokens <= 50`.

Because no server-produced value could satisfy that predicate, the branch was **unreachable by the server and reachable only from the request body.** When taken, it interpolated client-supplied `depthGuidance` into the system prompt and displaced canonical context assembly entirely.

> **The client-controlled path by which arbitrary request-body content could acquire system-prompt authority and suppress canonical context assembly no longer exists in production.**

**And the same change restored continuity.** The DEEP guard was what intercepted regeneration before `appendAllContextAddenda`. Removing it took DEEP addenda from **0/24 to 24/24**. The feared collision with DEEP's continuity-delivery mechanism did not occur — the guard *was* the suppression.

---

## The five production proofs

1. **Running commit** — `GIT_COMMIT=3d1e27348` in container env and in-process. The lane's own fail-closed assert concurred: *"Running container provenance verified: GIT_COMMIT=3d1e27348 == asserted 3d1e27348."*
2. **Artifact identity** — new image `sha256:7a228902…`, created 21:42:29Z, started 21:42:40Z, **0 restarts**. `/api/version` self-reports `"commit":"3d1e2734"`.
3. **Health** — `maia-sovereign` healthy; all app services healthy. **Recreate correctly scoped**: `maia-caddy` (4 weeks), `maia-postgres` (4 weeks), `maia-whisper` (7 weeks) untouched.
4. **Scoped invariants** — `"MAIA-PAI OVERRIDE"` and `"MAIA-PAI COMPREHENSIVE OVERRIDE"` each appear in **0 files** under `.next/server` of the running container. Source in the image: **0 executable `maiaPaiConfig` guards**, 2 `SECREM-001` provenance markers. **Verified by artifact inspection — no payload constructed or sent.**
5. **Serving** — HTTPS 200 across three checks (53 / 10 / 12 ms); HTTP 308 redirect correct.

Migrations were the predicted no-op: *"No pending migrations (491 already applied, 446 total)."* All smoke tests passed, including constitutional verification.

**Rollback rail intact and unused.** `maia-sovereign:previous` → `sha256:32ccf1ea…` (the `e5f2c5fa2` image). Pre-authorized to that target only; never invoked.

---

## Why this was deployed from the production parent, not canonical

Production ran `e5f2c5fa2`, **11 commits behind** canonical. Founder ruling: a deployment candidate must be evaluated **relative to its actual production parent**, not merely relative to canonical — production plus one proven change, rather than production plus twelve.

`maiaVoice.ts` proved byte-identical at both commits (blob `8ea2f62a…`), so the repair applied unchanged and the diff body was identical. **T3 was still re-run at the production parent**, because the surrounding tree differed by 16 files and ~3,458 insertions. Of those, exactly one production-code file differed (`lib/maia/maiaRuntimeContext.ts`, purely additive) and `maiaVoice.ts` does not import it — established by the executor, not assumed.

## T3 at the production parent

**NOT FALSIFIED.** The producible set was re-derived by driving the real `updateConversationDepth`, not read from a table: reachable `maxTokens` = **{200, 400, 800}**; full range across all modes = **{100, 200, 300, 400, 800}**. The guard was satisfied by **zero of 16 producible configurations**. Zero delta across 18 server-produced cases on both builders; the executor's own BEFORE≡BEFORE control found full determinism.

Baseline separated: 546 pre-existing `tsconfig.core` errors, identical sets before and after, **zero in `maiaVoice.ts`**; 32/32 tests pass in both states.

---

## Known defect in the committed comment — NOT reopened

The provenance comment states the producer *"is consumed solely by maiaOrchestrator, which does not import this module."* That is **false as a transitive claim**: `maiaOrchestrator.ts:22 → maiaService.ts:4 → maiaVoice`.

A related inference — that the server-produced value therefore reaches the guard — is **not established**; the lines cited in support (`maiaService.ts:1540`, `:2180`) read `(meta as any).conversationContext`, the client channel, not the orchestrator's value.

**The repair does not depend on that rationale.** It stands on unsatisfiability, independently verified. Per founder ruling, the comment is corrected in a **separate non-behavioural commit** and the proven repair is not reopened. The canonical-parented commit `d740f44c0` carries the same comment and needs the same correction if it is ever merged to canonical.

---

## Founder product ruling, carried forward

> Client-controlled `body.conversationContext` is not an authorized mechanism for controlling MAIA's brevity. Any loss of that behavior is acceptable. If brevity remains a product requirement, it must be provided later through a **trusted, server-governed mechanism** — and must not be added to SECREM-001.

## Out of scope, still open

`MaiaContext.conversationContext.depthConfig` is now a dead read; dead-field cleanup deliberately not performed. The three earlier referred defects, plus production-edge source custody and backup recoverability, remain `AUTHORED / UNASSIGNED`.

---

## Significance

This is the **first complete REMEDIATION loop** demonstrated end to end:

`proven finding → bounded design → authority → implementation → falsification gate → production proof`

with a real referent under it — `soullab.life → minisforum → maia-sovereign → 3d1e2734 → maia_consciousness`.
