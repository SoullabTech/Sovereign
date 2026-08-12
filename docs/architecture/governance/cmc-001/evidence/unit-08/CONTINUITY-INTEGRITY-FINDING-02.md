# CMC-001 · CONTINUITY-INTEGRITY FINDING 02

**A client-influenced branch can suppress every context addendum on the DEEP repair path.**

Ruled to remain inside CMC-001 by founder act 2026-08-12: addenda suppression is directly relevant to the census. The security half — client-controlled text reaching the system prompt — is referred out separately. **That referral is additive and withdraws nothing from this finding.**

**Referent**: `refs/heads/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc` · `lib/sovereign/maiaVoice.ts` blob `8ea2f62ab81131513d0ed75926d2850c0c1b3e3c`

---

## The finding, stated narrowly

> A client-controlled path **appears capable** of injecting `depthGuidance` into the DEEP repair system prompt and, under the `maxTokens <= 50` branch, suppressing the normal context addenda. **Static reachability is supported, but end-to-end exploitability is not yet proven.**

That phrasing is deliberate and must not be strengthened until the residuals below are closed.

## Established

**The branch.** `maiaVoice.ts:963` — `if (maiaPaiConfig && conversationDepth === 'opening' && maiaPaiConfig.maxTokens <= 50)`. A guarded early return inside `buildMaiaComprehensivePrompt` (`:953`), spanning `:963–:1033`.

**What it displaces.** Not a value substitution — a **route displacement**. `buildComprehensiveVoicePrompt` and `appendAllContextAddenda` never run. The resulting prompt is the literal at `:1007–:1027`, carrying only the date, `depthGuidance`, and `context.summary` — which on this path is the synthetic string `` `Repair attempt for: ${input}` ``.

**Continuity consequence.** Segment C5 is **absent, not empty-appended**, and every addendum is lost with it. On the one DEEP path that Unit 6 established *does* carry accumulated continuity — the regeneration path — this branch removes it.

**Sole caller.** `maiaService.ts:2230`, the DEEP repair path. `enhanced-maia-service.ts:20` imports the symbol and never calls it.

**Feeder.** `(meta as any).conversationContext` (`maiaService.ts:2180`) — not server-derived. Both in-scope routes spread the unrecognized request body into `meta` (`list/route.ts:287`, `route.ts:97`).

## Why this belongs to the census

Units 5–7 established that DEEP's normal path sheds continuity and that regeneration is the only mechanism restoring it. This finding shows that **the restoring mechanism itself has a branch that removes the restoration** — and that the branch condition is not server-controlled.

It is therefore a statement about the continuity architecture, not only about a security boundary: the single delivery path for accumulated relationship on DEEP has a bypass reachable from outside the server's own state.

## Residuals — the finding is not closed

Two facts must be established before this can be stated more strongly than above:

1. **What `getDepthConfig()` can actually return in live code.** Unit 8 reports 200 (adaptive) / 100 (classic) for `'opening'`, i.e. no server producer can satisfy `≤ 50`. **Not independently verified.**
2. **Whether either route validates or sanitizes the request body** before `conversationContext.depthConfig` can reach this branch. Unit 8 explicitly listed the body-validation layer as an **unopened surface** and stated client-reachability *given the observed spread*, not as proof no validator exists.

Until both are resolved, classify the surface as **`UNRESOLVED`**, not `CLIENT_REACHABLE`.

## Also recorded, not repaired

`maiaVoice.ts:1011` and `:551` interpolate `maiaPaiConfig.depthGuidance` directly into prompt text.

## No repair

None authorized, none proposed. §XIX applies. Note also the standing sequencing constraint: on DEEP, regeneration is currently the only continuity delivery mechanism, so changes in this area must restore normal-path continuity **first**.
