# R70 — Exact nullable I Ching lookup shipping correction

**October 17, 2026 | Mac Studio | isolated source-only TypeScript repair | production beta HOLD**

## Source and issue

Parent source: R69 `9e76248250cf2af4e472a05895c99d188c98d5ba`.
Isolated branch: `fix/ws-beta-r70-shipping-hexagram-null-types-20261017`.
Worktree: `/Volumes/T7 Shield/ws-beta-r70-shipping-hexagram-null-types-20261017`.

Six member/practitioner I Ching casting, interpretation and mentor routes initialized
`let relatingHexagram = null`, and in two cases `let hexagram = null`.
The shared `getHexagram(number)` already returns `Hexagram | null`, so strict
TypeScript inferred a **null-only** variable and rendered subsequent valid
hexagram branches unreachable (`never`).

The exact repair uses `ReturnType<typeof getHexagram>` for the eight affected
local variables. Nothing alters casts, provider selection, stored interpretations,
member authorization, SQL, models, returned API schemas or hexagram lookup data.

## Test evidence

- Focused `lib/iching/__tests__/hexagramNullableLookupR70.test.ts`: 3/3 PASS.
  Actual King Wen 1, 2, 11 and 64 lookups retain data; nonexistent 0 and 65
  remain null. All six routes preserve nullable lookup without nonnull assertion.
- Unsuppressed `tsconfig.ship.json`, precommit source:
  previous R69 **151**, R70 **128** diagnostics; **23 resolved, 0 new**.
  All R69 I Ching lookup errors for these six routes were removed.
- No compiled rule weakened, no TypeScript ignore, `as any`, route deletion,
  model call, SQL write or protected source change.
- R70 still has 128 inherited shipping errors and no passing whole-app build.
- Exact commit and independent postcommit acceptance remain to be established;
  precommit results are NOT transferable to a subsequent source change.

The separate R69 real Next.js Review return and held editorial fixture
may be reconciled later without deploying or activating provider/writer routes.
The ordinary-writer beta uses independently verified conventional security first;
the sovereign KMS upgrade remains separate.

**Release: HOLD. No production, real member data, paid providers, GitHub push,
PR, merge to protected, deployment or invitation.**
