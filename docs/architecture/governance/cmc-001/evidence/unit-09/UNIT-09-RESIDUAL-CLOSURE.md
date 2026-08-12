# CMC-001 · Unit 9 — Residual Closure

Referent: `origin/clean-main-no-secrets` = `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (resolved fresh, 2026-08-12)
Frozen mandate blob: `8374f1e942c8e4f8b41dab319eb75dabf609681b` — VERIFIED, matches launch authority.

## Blob identities (canonical, path + blob)

| Path | Blob |
|---|---|
| lib/consciousness/conversationContext.ts | ac6c116891c43773ca4255b60be5be061e897fd0 |
| lib/consciousness/maiaOrchestrator.ts | 806ad96775ae675f99d2ac74aea02ce2f3345e8d |
| lib/sovereign/maiaVoice.ts | 8ea2f62ab81131513d0ed75926d2850c0c1b3e3c |
| lib/sovereign/maiaService.ts | e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1 |
| app/api/sovereign/app/maia/route.ts | 06e30438c0bd81b0f6f0da7cf331c7db8e7887d8 |
| app/api/sovereign/app/maia/list/route.ts | 04b08a20df52bd71ae05074e095e81abe9661379 |
| middleware.ts | bb7d5fdb6272e5133444dbefa5c4c7c185fe265c |

## Q1 — getDepthConfig return set (OBSERVED)

Resolved: `ConversationContext.getDepthConfig(mode)` — conversationContext.ts:74 (blob `ac6c1168…`). Unit 8's pointer CONFIRMED.
Return type `ConversationDepthConfig { maxTokens: number; depthGuidance: string; responseStyle }` (:28-32).

Complete return set:
- adaptive/opening — 200 (:80-84)
- adaptive/early — 400 · adaptive/deeper — 800
- adaptive/default → delegates to classic (:98)
- classic/opening — 100 (:104-108)
- classic/early — 200 · classic/deeper — 300
- classic/default — 200, depthGuidance `''` (:122-126)

**Minimum over all branches = 100. Minimum for `'opening'` = 100. No branch yields `maxTokens <= 50`.**
No other server-side producer of a `{maxTokens, depthGuidance}` shape exists: `getDepthConfiguration` (lib/maya-masters-integrated-system.ts:255) returns `{maxWords, allowedSystems, responseStyle}` — no `maxTokens`, no `depthGuidance`, different shape, not written into any `conversationContext.depthConfig`.

### Writer sites for `depthConfig` into a context object
Exactly one: `lib/consciousness/maiaOrchestrator.ts:521` — `conversationContext: { depth, throughline, stakes, trustLevel, messageCount, depthConfig, contextPrompt }`, fed by `getDepthConfig('adaptive')` at :256 → always 200/400/800.
Reachability from the two in-scope routes: NOT reachable as a server-side feeder of `MaiaContext`. The two routes call `getMaiaResponse` (maiaService), never maiaOrchestrator (`git grep maiaOrchestrator` over both routes: zero hits; maiaService's only hit is a comment at :2401).

**Conclusion Q1: the `maxTokens <= 50` guard is DEAD for every server-produced value. It is satisfiable only by a value that did not come from `getDepthConfig()`.**

## Q2 — Route body validation (OBSERVED)

Both routes: `await req.json().catch(() => ({}))`, then a rest-spread destructure whose type is `{ ...known?; [key: string]: unknown }` — a TS index signature, erased at runtime, zero coercion.

- `app/api/sovereign/app/maia/route.ts:96-104` — `const { sessionId, message, includeAudio, voiceProfile, userId, ...meta } = body`; `...meta` spread into the `getMaiaResponse` meta literal at :292. Only `memoryInfluenceAddendum`/`forwardReadinessAddendum` are written after the spread. `conversationContext` is not among them.
- `app/api/sovereign/app/maia/list/route.ts:286-301` — same pattern, 8 keys destructured out; `...meta` spread at :1211; ~14 server addenda written after it. `conversationContext` is not among them.

`git grep conversationContext` over both route blobs: **zero hits** — neither route sets, overwrites, or strips the key.

### Exhaustiveness basis for absence
1. Regex sweep of both route blobs for `zod|yup|joi|ajv|superstruct|valibot|typebox|schema|safeParse|sanitize|allowlist|whitelist|pick(|omit(|stripUnknown|validate*(` — only hits are `ensureSchemaReady` (DB migration gate, list route :275) and `validatePlaceContext(body.place)` (list route :752), which allow-lists **only** `body.place` and returns a separate `placeAddendum`; it does not touch `meta`.
2. `middleware.ts` (blob `bb7d5fdb…`) matcher `'/((?!_next/static|_next/image|favicon.ico).*)'` DOES match both paths, but it is an access-matrix auth/policy gate: grep for `req.json|request.json|.text()|.arrayBuffer()` returns **0**. It never reads or rewrites the body.
3. Only two `middleware.*` files exist repo-wide; the other is `app/api/_backend/src/types/middleware.ts` (types, unrelated).
4. `next.config.js` rewrites/redirects: no entry for `/api/sovereign/app/maia*`.
5. Downstream in `getMaiaResponse` (maiaService.ts:2380) `meta` is destructured as-is; no `delete meta.*`, `sanitizeMeta`, `stripMeta`, `ALLOWED_META` anywhere in the file. `TurnPosture.resolve(meta)` (lib/sanctuary/turnPosture.ts:42) reads only.

Absence of a body validator on the meta channel is established exhaustively for the traced path.

## Consumer sites (both read the same client-controlled field)

- `maiaVoice.ts:539` `buildMaiaWisePrompt` — guard at :543, interpolation at :551. Fed by `MaiaContext.conversationContext = (meta as any).conversationContext` at maiaService.ts:1540; called at maiaService.ts:1592 (**primary FAST/CORE path**) and :1747 (repair).
  Note: a preceding `MAIA_SAFE_MODE === 'true'` early return (:532-536) short-circuits before the guard. Env-gated, not validation.
- `maiaVoice.ts:959` `buildMaiaComprehensivePrompt` — guard at :963, interpolation at :1011. Fed by maiaService.ts:2180, called at :2230 — **DEEP repair path only** (corroborated by docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md:43).

`MaiaContext.conversationContext.depthConfig` is typed optional with `maxTokens: number` (maiaVoice.ts:47-58) — a type annotation on an `as any` cast; no runtime check.

## CLASSIFICATION

**CLIENT_REACHABLE** — for both in-scope routes.

Driving evidence: (a) both routes rest-spread the unrecognized request body into `meta` with no validator, allow-list, coercion, or middleware body handling (exhaustive sweep above); (b) `meta.conversationContext` is assigned to `MaiaContext` via `as any` at maiaService.ts:1540 and :2180 with no intervening check; (c) the guard at maiaVoice.ts:543/:963 tests only `depthConfig` truthiness, `depth === 'opening'`, and `maxTokens <= 50` — all three plain reads of the client-supplied object; (d) `getDepthConfig()` cannot produce `maxTokens <= 50`, so the guard is unreachable via server-produced values and reachable *only* via the client channel.

Neither route is blocked. The `maia/route.ts` surface reaches the guard through the primary FAST/CORE `buildMaiaWisePrompt` call; `list/route.ts` likewise. The `buildMaiaComprehensivePrompt` variant additionally requires the DEEP repair path.

INFERRED (not observed): the exact tier/repair conditions under which each consumer executes for a given request were not traced — that is routing, not the branch-reachability surface, and Unit 9 is scoped to the latter.

## Corrections to Units 1–8
1. Unit 8 named maiaService.ts:2180 as "the feeder". It is *a* feeder, and the narrower one — DEEP repair only. The broader feeder is **maiaService.ts:1540**, on the primary FAST/CORE path feeding `buildMaiaWisePrompt` (guard :543, interpolation :551).
2. Unit 8's statement "static reachability supported, end-to-end exploitability NOT proven" is upgraded on the reachability axis: `getDepthConfig()` is now shown incapable of satisfying the guard, which removes the benign explanation and leaves the client channel as the only satisfying producer.
3. conversationContext.ts:74 pointer: CONFIRMED (was unverified).

## Unopened static surface on the traced path
- `buildSimpleMaiaPrompt` (maiaVoice.ts, SAFE_MODE early return) — not read; irrelevant unless `MAIA_SAFE_MODE=true`.
- Deployment-edge layers outside the repo (Caddy config referenced in middleware.ts:375) — outside static scope, cannot be closed statically.
- The precise tier-selection logic choosing FAST/CORE/DEEP in `getMaiaResponse` — deliberately not traced (routing, out of Unit 9 scope).

## Stop state
COMPLETE. Two questions answered, classification issued. No files modified. No remediation. No runtime witness. No new assembly site encountered.
