# INVISIBLE-STANDING-SHADOW-02 — S2 witness and adjudication

Date: 2026-09-16

## Exact implemented boundary

The production-shaped change is intentionally small:

1. import `runInvisibleStandingShadowSafely` into `lib/writers-studio/writersStudioCognition.ts`;
2. wait for `getMaiaResponse()` to resolve its already-finalized `r.text`;
3. only when that Writer response exists;
4. only when `MAIA_INVISIBLE_STANDING_SHADOW === '1'`;
5. invoke synchronously and ignore the returned audit;
6. return the exact same captured `response` variable.

`lib/sovereign/maiaService.ts` has **no net change** in the final PR diff.

## Executable witness

Four suites, **36 / 36 tests PASS**:

- `invisibleStandingShadow.test.ts` — pure audit / incomplete-evidence / content-free telemetry / swallowed-failure laws;
- `invisibleStandingLiveWiring.test.ts` — finalized-service-result seam, feature gate, zero response authority, no I/O/provider surface, and no `maiaService` shadow wiring;
- `invisibleStandingS5Replay.test.ts` — all **10 / 10** human-preferred current responses from sealed S5 pass with zero findings;
- existing `focusHandoff.test.ts` — handoff/disclosure receipt law remains green.

## Type and repository checks

Canonical `npm run typecheck` result:

```text
TypeScript no-regression gate — tsconfig.ship.json
program files : 4324 (baseline 3965)
errors        : 229 (baseline 239)
✅ No TypeScript regressions.
```

`git diff --check`: PASS.
Forbidden surface scan of the shadow module: no `generateText`, model service, `fetch`, Postgres/query, TurnsStore, or conversation persistence dependency.

## What the first live shadow can say

It may report:

- `pass`;
- `observe` for exact direct-member quote attribution that is unverified or currently matches only non-member turn material;
- `would_refuse` only for the two already-substrate-provable parity classes: identity-authority and forbidden false memory-capability claims.

It may not say that a member *never* authored a quote because `CanonicalTurn` is not a complete lifetime evidence population.

## Privacy / Sanctuary

Telemetry contains no response text, quoted text, member id, or raw turn id. It records only the shadow tag, disposition, counts, rule ids, Sanctuary boolean, and a short hash of the turn id. Audit exceptions emit a fixed `audit_exception` code and do not expose exception messages.

## Pre-existing seam outside this lane

Conversation persistence and voice synthesis occur before some later final-text transformations in `maiaService`. Therefore SHADOW-02 proves the final returned-text audit seam, **not** persisted-text equivalence or audio/text equivalence.

## Adjudication

The implementation satisfies the bounded live-shadow contract and is ready for draft review.

It does **not** authorize:

- enabling the feature flag in production;
- deploying;
- blocking/refusing a live member response based on the shadow;
- adding the soft model sidecar to production;
- adding semantic entailment authority;
- merging this or any parent PR.

A production witness with the feature explicitly enabled remains a separate act after review/merge/deployment authority.
