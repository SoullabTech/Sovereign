# SECREM-001 — IMPLEMENTATION RECORD

**Verdict: IMPLEMENTED · T3 PASSED · design NOT falsified**

| | |
|---|---|
| Commit | `d740f44c0c7149e69f8bca51a0cc0151f39cfe2e` |
| Parent | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (canonical, exact) |
| Branch | `chore/secrem-001-impl` — isolated worktree from canonical |
| Scope | **1 file**, +16 / −107 · `lib/sovereign/maiaVoice.ts` |
| Blob | `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c` → `029c0cbf104bee6c61bf4936273eb785fa816f0b` |
| Deployment | **NOT pushed, NOT merged, NOT deployed** at time of record |

---

## Acceptance state

```
T3                              PASS
Security authority path         CLOSED BY IMPLEMENTATION
FAST/CORE canonical assembly    PRESERVED
DEEP regeneration               PRESERVED
DEEP addenda                    RESTORED
Provider routing                UNCHANGED
Production closure              NOT YET CLAIMED
```

The last line is load-bearing. Nothing in this record claims the production exposure is closed. That requires deployment and separate production proof.

---

## The change

Two client-controlled `depthConfig` guard blocks removed:

- `:542-568` — FAST/CORE, in `buildMaiaWisePrompt` (including the `maiaPaiConfig` / `conversationDepth` declarations at `:539-540`, which had no other use)
- `:958-1033` — DEEP repair, in `buildMaiaComprehensivePrompt`

Both guarded on `maiaPaiConfig && conversationDepth === 'opening' && maiaPaiConfig.maxTokens <= 50`. Replaced with provenance comments only.

**Adjudication check:** one textual occurrence of `maxTokens <= 50` survives at `:542` — inside the provenance comment. Zero executable guards on `maiaPaiConfig` remain; zero references of any kind; `depthGuidance` interpolation is absent from the file.

---

## T3 — the hard falsification gate

Harness: `secrem001T3.test.ts`, 156 assertions, all passing. Run in-repo, removed before commit.

### The premise was re-derived, not inherited

The design asserted "server minimum is 100." The executor enumerated the real producer, `ConversationContext.getDepthConfig`:

- adaptive: opening 200 · early 400 · deeper 800 · intimate → classic-default 200
- classic: 100 · 200 · 300 · 200

Distinct set `{100, 200, 300, 400, 800}` — but **classic/opening 100 is unreachable**: the sole caller (`maiaOrchestrator:256`) passes `'adaptive'`. **Reachable minimum is 200.** The predicate `maxTokens <= 50` is unsatisfiable for every value.

**Stronger finding: the server-produced set reaching those guards is empty.** `maiaOrchestrator` does not import `maiaVoice`; its `depthConfig` goes to response metadata and telemetry only. Every writer of `MaiaContext.conversationContext` (`maiaService.ts:1540`, `:2180`; `enhanced-maia-service.ts:294`, `:369`) passes through client `meta`, sourced from `...body` at `app/api/sovereign/app/maia/route.ts:97` and spread at `:292` with no server override.

### A delta appeared and was NOT rationalized

Differential across 70 configs × both builders initially showed `awarenessProfile.scaffoldingPrompt` differing.

**Attribution control run instead of an explanation:** BEFORE-vs-BEFORE, identical module and identical input, produced **3 distinct results across 60 calls.** Source: `Math.random()` at `lib/consciousness/bloomCognition.ts:398` — untouched by the diff, unreferenced by either removed block.

Pre-existing nondeterminism, not a change delta. With RNG pinned: prompts **byte-identical**, full analysis objects **deep-equal**, zero deltas.

> This is the methodology worth preserving for the future JARVIS remediation loop. The gate's value came from running a control rather than producing a plausible account of the difference. A weaker pass would have yielded either a false alarm or a false negative.

---

## The six proofs

| # | Claim | Evidence |
|---|---|---|
| 1 | client `depthGuidance` cannot acquire system-prompt authority | injected value present in BEFORE, **absent in AFTER**, both builders |
| 2 | client low `maxTokens` cannot suppress canonical assembly | AFTER(adversarial) ≡ AFTER(no `conversationContext`); prompt **695 → 23,512 chars** |
| 3 | FAST/CORE canonical assembly intact | AFTER ≡ BEFORE on clean contexts, 3 inputs; addenda intact |
| 4 | DEEP regeneration intact | prompt, keys, `finalVoiceLevel` identical; under adversarial payload DEEP now returns a real analysis matching the clean-context analysis, not the `minimal-opening` stub |
| 5 | DEEP addenda no longer bypassed | **5 addenda markers absent in BEFORE, present in AFTER** |
| 6 | provider/routing unchanged | `maiaVoice.ts` contains no provider/model/routing/network code; removed blocks contained none; only `.prompt` is consumed downstream (`maiaService:2231`); module export surface unchanged |

Proof 5 is the notable one: **removing the guard repaired the continuity path rather than damaging it.** The feared collision with DEEP's continuity-delivery mechanism did not occur — the guard *was* the suppression.

---

## Contradictions and baseline separation

- Design's "minimum 100" **refined** to reachable-minimum 200. Conclusion unaffected. Recorded, not smoothed.
- `presenceMode.test.ts` and `platformKnowledge.test.ts` each fail 1 test — **identical at canonical**, stash-verified. Pre-existing.
- Typecheck: **231 errors across 4,034 files, identical before and after.** Pre-existing.

None of these are caused by the change, and none are repaired by it.

---

## Founder product ruling — 2026-08-12

> **Client-controlled `body.conversationContext` is not an authorized mechanism for controlling MAIA's brevity.**
>
> Any loss of brevity behavior previously obtained through client-supplied `conversationContext` is **acceptable**. That path has no legitimate authority to control MAIA's system prompt or bypass canonical context assembly. If brevity remains a product requirement, it must be provided later through a **trusted, explicitly governed mechanism**.

**Do not add such a mechanism to SECREM-001.** Preserving the old behavior would mean preserving the security defect.

---

## Deliberately left in place

`MaiaContext.conversationContext.depthConfig` is now a dead read on this path. **Not cleaned up** — dead-field removal was out of scope and remains a separate act.

## Remaining before production closure

1. Resolve the current deployment/reconciliation target **freshly** — do not infer canonicality from prior session state.
2. Push and take through the governed merge/deployment path.
3. Bounded production proof: deployed artifact contains the intended change · production healthy · both executable guards absent · canonical FAST/CORE and DEEP assembly present. **No exploit payload.**

The three other referred defects remain unaddressed and out of scope.
