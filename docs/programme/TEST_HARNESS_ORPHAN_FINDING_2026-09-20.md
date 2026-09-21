# ⚠️ FINDING · SEVEN ORPHANED SUITES, ONE MISSING MODULE, AND WHY THE OBVIOUS FIX IS THE DANGEROUS ONE

**Found 2026-09-20 while reviewing a proposed `jest.config.js` change during the
`WS-EDITORIAL-SCOPE-01` host verification. ⛔ Outside that lane. ⛔ No lane
opened. ⛔ Nothing repaired.**

⭐ **None of the 46 failing suites belongs to `WS-EDITORIAL-SCOPE-01`.** Its 62
falsifiers pass (founder-run targeted suite: `183 passed`).

---

## 1 · ⭐⭐ THE ORPHANS — and why excluding them is worse than leaving them red

**18 files import from `vitest`.** Ten sit under `app/api/_backend/` or
`tests/__legacy__/`, which `jest.config.js` already ignores as *legacy backend
prototype* and *quarantined legacy tests*. **Eight are live and visible to
Jest**, where they fail loudly with *"Vitest cannot be imported in a CommonJS
module"*:

```
__tests__/trust/checkAccess.test.ts
__tests__/trust/classifyInference.test.ts
__tests__/trust/getDisclosureText.test.ts
__tests__/trust/getExpressionProfile.test.ts
__tests__/trust/getMeaningExpansionLevel.test.ts
lib/soulPortrait/generator/__tests__/parseModelJson.test.ts
tests/ai/flowTelemetry.test.ts
tests/ai/ainResponseShape.test.ts        ← the ONLY one with another runner
```

⛔ **There is no `vitest.config.*` anywhere in the repository**, and exactly ONE
vitest invocation in all of `package.json`:

```
"check:ain": "... npx vitest run tests/ai/ainResponseShape.test.ts"
```

One file, named explicitly.

⭐⭐ **So adding the other seven to `testPathIgnorePatterns` does not move them
to a different runner. It stops them running at all** — while the suite goes
green. **A loud failure becomes a silent absence, and the silence looks like
success.**

> ⛔ **The current red state is BETTER than the proposed green one.** A failing
> suite is visible. An excluded one is not.

### ⚠️ And of all the suites to drop silently, these are the wrong ones

`__tests__/trust/**` is the **unified trust middleware**: `checkAccess`
orchestration over `getSessionPrivacy`, `getDisclosureText` and
`isDisclosureRequired`, inference classification, expression profile, meaning
expansion level. ⭐ **That is consent-and-disclosure surface.** Dropping its
coverage to turn a test run green is the exact trade this project exists to
refuse.

**The honest repair is two halves of one act**: wire a vitest project and an
`npm run test:vitest`, THEN exclude from Jest. ⛔ Doing only the second half is
the dangerous half, and it is the half that makes the output look fixed.

---

## 2 · ⭐ ONE GENUINELY BROKEN TEST, misdiagnosed as a config bug

`tests/symbolic/composeFieldAwareSystemPrompt.test.ts` fails with

```
Could not locate module @/lib/symbolic/presence/astrologicalMaia
  mapped as /Users/soullab/MAIA-SOVEREIGN/$1
```

⚠️ **The mapper is not malformed.** `jest.config.js:16` already reads
`'^@/(.*)$': '<rootDir>/$1'`, which is the standard form — Jest simply *prints*
the resolved `rootDir` in its diagnostic, and that printed `$1` reads like a
broken regex when it is a rendering artefact.

⭐ **The real cause is that the module does not exist.** `lib/symbolic/presence/`
contains `birthDataResolver.ts`, `buildDeterministicResponse.ts` and
`composeFieldAwareSystemPrompt.ts` — and **no `astrologicalMaia`**.

⛔ Rewriting the mapper would have changed a correct line, left the import
unresolved, and buried a missing module under a config edit.

⚠️ **UNANSWERED, and not answered here**: was `astrologicalMaia` deleted, renamed,
or never written? The test is either stale or guarding something that went
missing, and those need different repairs.

---

## 3 · ⭐ THE ONE NARROW EXCLUSION THAT IS CORRECT

`scripts/witness/whole-manuscript/falsifier.spec.ts` is a **Playwright** spec
that Jest's `testMatch` picks up. Of the repository's 8 `.spec.ts` files, the
existing ignores for `<rootDir>/e2e/` and `<rootDir>/app/api/_backend/` already
cover 7 — so ⛔ a blanket `\.spec\.ts$` rule is unnecessary breadth. One path
suffices:

```js
'<rootDir>/scripts/witness/whole-manuscript/',
```

⭐ That exclusion moves nothing into silence: the file has a real runner
(`playwright.config.ts` and `run.sh` sit beside it).

---

## 4 · ⭐⭐ THE PATTERN, NAMED — three times in one session

| | proposed remedy | what it would actually do |
|---|---|---|
| phantom diagnostics | `null` → `undefined` in two components | change runtime behaviour to satisfy a string comparison |
| phantom diagnostics | `typecheck:baseline --accept-current` | absorb two REAL regressions along with the phantoms |
| 46 failing suites | broad `testPathIgnorePatterns` | stop seven consent-surface suites from running |

Each was locally reasonable and each would have made a true signal quieter
rather than finding out what it was saying. ⭐ **The pressure is systemic, not
three coincidences** — a red instrument is expensive to read and cheap to
silence, and the silencing always looks like progress.

⭐ A standing rule would answer all three: **an instrument may be made quieter
only by a change that leaves the thing it was watching still watched — and the
change must say where the watching moved to.**

**Standing: 7 ORPHANED SUITES ✅ ESTABLISHED (no runner, consent surface) ·
MISSING MODULE ✅ ESTABLISHED, PROVENANCE ⚠️ UNANSWERED · NARROW PLAYWRIGHT
EXCLUSION ⭐ ENDORSED · ⛔ `jest.config.js` NOT EDITED · ⛔ NO SUITE EXCLUDED ·
⛔ NO LANE OPENED.**
