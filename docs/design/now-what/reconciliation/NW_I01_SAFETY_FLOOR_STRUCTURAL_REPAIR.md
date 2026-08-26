# NW-I01 — Safety Floor: Structural Repair

**Unit**: NW-I01 · **Date**: 2026-08-26 · **Authorized**: founder, 2026-08-26
**Governing rule**: *"NW-I01 may make the safety floor structurally reliable, but it must not
invent or broaden the floor's substantive clinical meaning."* — fix the plumbing, don't write
medicine into it.

**Scope honored**: `MAIA_RUNTIME_PROMPT` was **not edited**. No safety, crisis, referral or
scope content was authored. No detection, no trigger, no disclosure path, no member data, no
schema, no migration. The floor still lacks safety content, and that remains blocked on qualified
clinical review — this unit only guarantees that whatever the floor says, it is actually said.

## What changed

**Repair 1 — bypass 1 (mode), the unconditional one.**
`app/api/now-what/interview/route.ts` guarded composition with `if (mode === 'turn')`, so the
`propose` path ran on `PROPOSE_SYSTEM` alone with no floor at all. `propose` now composes the
floor via a new `composeConstitutionalFloor()`. It deliberately does **not** take the full turn
composition (presence, field, position, lesson) — it is a thin JSON extractor and widening what
it sees is not this unit's business. Floor first, `PROPOSE_SYSTEM` last, so its closing
*"Return ONLY valid JSON"* keeps the final word.

**Repair 2 — bypass 2 (feature flag).**
`lib/maia/roomComposition.ts` returned the room prompt alone when
`NOW_WHAT_MAIA_PRESENCE_ENABLED !== '1'` and no field resolved. That early return is gone.
`presenceEnabled` now gates **presence and nothing else**; the two were conflated. Worst case is
now `[floor, roomPrompt]`, never `roomPrompt` alone.

**Repair 3 — suppressible symbolic register (mechanism only).**
The elemental/Spiralogic touch is now a suppressible clause rather than a fixed one, because
NW-S01 risk class G records the register as contraindicated there. Suppression also drops the
Spiralogic phase lens — the lens *is* the register held underneath, and suppressing the surface
while keeping the source would be theatre. **Nothing calls it with `true`.** Deciding *when* to
suppress is clinical meaning and is blocked on review; writing that trigger here would be exactly
what the ruling forbids. A test fails if any caller starts passing `true`.

**Repair 4 — witness tests.** `__tests__/now-what-safety-floor-composition.test.ts`, 11 tests:
floor present and ordered first; never the room prompt alone (bypass 1 + 2 regression guard);
default variant unchanged; suppressed variant strips the register but keeps steps 1–3, the
understanding-repair override, and the this-person-only test; both variants well-formed; snapshots
pinning exact text; and the no-trigger guard.

**Incidental**: the grammar moved to `lib/nowWhat/roomGrammar.ts`. A Next.js App Router
`route.ts` may only export route handlers and framework config, so the builder could not be
exported from there for tests. Content unchanged — proven, see below.

## Verification

- **Byte-identity of the default turn proved** against the pre-change file: `buildResponseGrammar()`
  equals the original `RESPONSE_GRAMMAR` constant exactly. A safety switch that quietly altered
  every ordinary conversation would be a worse defect than the one repaired. Carried forward as
  snapshots.
- `npx jest` — 11/11 new, 10/10 existing now-what test still green.
- `npm run typecheck` — **no regressions** (173 errors vs. 239 baseline).
- `npm run check:no-supabase` — clean.

## Not verified, and needing a real deploy

**The `propose` path now carries a large prompt before its JSON instruction.** Instruction-following
for strict JSON output is not provable by unit test. **Before this reaches members, exercise
`mode: 'propose'` against the real model and confirm the response still parses.** If it degrades,
the fix is ordering or a restated JSON instruction — not removing the floor.

Bypass 3 (model routing) is **not repaired** — the prompt travels with any provider, but
instruction-following does not. Mitigation belongs with the floor's content, which is blocked on
review.

## Still open (unchanged by this unit)

Floor safety content · imminent-danger exception · **locale** (988/911 are US-only and the product
has no locale signal; founder's preferred default is to withhold US-specific resources unless the
member is known to be in the US) · **trust-copy release gate** (*no safety exception may ship
before the member-facing trust language accurately describes it*) · private-reflection frontier
(**held — no automatic practitioner disclosure**).
