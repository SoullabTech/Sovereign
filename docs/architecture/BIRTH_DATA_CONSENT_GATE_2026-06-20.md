# Birth-Data Consent Gate — Generation Layer (2026-06-20)

**Status:** Gate implemented at the chokepoint (`getAstrologyContextForUser`) on
branch `feature/rapport-pilot-v1`; committed on its own, separate from the in-flight
rapport-pilot working tree; not yet deployed/verified. Route leg-2 future-proofing
deferred (§6).
**Scope:** The natal/BaZi *birth-data prior* injected into the MAIA prompt. Nothing else.

---

## 1. The finding (confirmed in code)

A member's birth data shaped MAIA's responses on **every turn**, before the member
said anything, with **no consent check at the generation layer**.

- `lib/sovereign/maiaService.ts:2287-2324` — "IDENTITY-LAYER CONTEXT (always-on
  continuity)" backfills `astrologyAddendum` via `buildMaiaContext`.
- `lib/maia/context/buildMaiaContext.ts:84-100` — sets `astrologyAddendum` from
  `getAstrologyContextForUser(...)`.
- `app/api/sovereign/app/maia/list/route.ts:618-623` (leg 3) — loads the natal
  context; `:650-662` builds `astrologyAddendum`; `:1056` passes it into the prompt
  context (FAST/CORE).
- `lib/sovereign/maiaVoice.ts` `appendAllContextAddenda` — appends the
  `astrologicalContextAddendum` **unconditionally** to FAST/CORE (and the DEEP
  builder that extracts addenda).

**Consent was collected but never honored.** Onboarding `BirthDataStep`
(`components/onboarding/BirthDataStep.tsx`) writes `members.astrology_consent`
(`unknown` | `opted_in` | `declined`; migration
`database/migrations/20260301000001_member_astrology_consent.sql`,
default `'unknown'`). A grep of the entire injection path found **zero** reads of
`astrology_consent` before injection. So `BirthDataStep` gated *collection* only;
*use/generation* was always-on regardless of the member's stored preference.

This is a "representation before relationship" surface, in tension with the consent
gates, the Sovereignty Invariants ("don't impose identity / increase agency"), and
the Soul Portrait constitution's *"you are not the authority on who they are."*

### What was NOT a live birth prior (verified)

- **BaZi constitution** — `member_bazi_profile` has 0 rows and a schema mismatch;
  the constitution is passed as `null`. Dark.
- **`westernBirthData`** (route leg 2) — assigned at `:581`, **never read again**.
  Dead.
- **Wu Xing addendum** — moment-only (`computeWuXingMoment(new Date(), tz)`), i.e.
  "today's field," same for everyone. **Not** birth-derived; intentionally left
  ungated.

So the only **live** birth-data prior funneled through one function:
`getAstrologyContextForUser`.

---

## 2. Decision

**Gate the birth-data prior on `astrology_consent === 'opted_in'`, at the data-load
chokepoint.** Both `declined` and `unknown` mean **withhold**.

| consent     | behavior  | rationale                                                        |
|-------------|-----------|------------------------------------------------------------------|
| `opted_in`  | inject    | the member explicitly authorized the natal lens at collection    |
| `declined`  | withhold  | explicit no                                                      |
| `unknown`   | withhold  | never asked / skipped — absence of a yes is not a yes            |

### Why this option (vs. the alternatives in the task)

- **vs. "document always-on as intended":** rejected. Always-on injection without
  per-member consent fails the Sovereignty Invariant Check (it imposes identity and
  does not increase agency) and contradicts existing canon. There is no honest way
  to document it as consented when the consent column is ignored.
- **vs. "explicit-invocation only":** not chosen *now*. `opted_in` already *is* the
  member authorizing an always-on astrological lens; overriding even explicit
  consent would reduce agency for members who want the weave. Explicit-invocation
  can be layered later as a stricter refinement if field evidence calls for it.
- **Strict `unknown` = withhold (not grandfathered):** the canonically correct
  conservative default. `unknown` is the column default — it covers members who
  onboarded before the consent step existed or who skipped it. Treating "we never
  got a yes" as a yes would be exactly the imposition this gate removes.

### Properties

- **Reversible** — a member opting in (any time) resumes the lens. The gate
  *preserves a permission* rather than imposing an obligation.
- **Fail-closed** — the gate sits inside the `try` whose `catch` returns `null`.
  If the `astrology_consent` column is ever missing (migration lag) the query
  throws → `null` → no injection. Errors withhold, never leak.
- **Tier- and route-agnostic** — one chokepoint covers FAST/CORE/DEEP and all three
  callers.

---

## 3. What changed

This commit contains the **load-bearing gate** plus this doc — and nothing else, so
the birth-data consent change keeps its own clean history, separate from the
in-flight rapport-pilot working tree.

1. **`lib/services/maiaAstrologyContextService.ts`** — `getAstrologyContextForUser`
   now SELECTs `astrology_consent` and returns `null` unless `=== 'opted_in'`.
   This is the single live chokepoint; it gates all three callers at once:
   - `app/api/sovereign/app/maia/list/route.ts:619` (live sovereign route, leg 3)
   - `lib/maia/context/buildMaiaContext.ts:85` (identity backfill →
     `maiaService.ts:2302`)
   - `app/api/oracle/conversation/route.ts:922` (dormant route)

   Because every live natal-prior path funnels through this one function, the gate
   is complete on its own — no route-layer change is required to stop the injection.

2. **Deferred — `app/api/sovereign/app/maia/list/route.ts` (leg 2) structural
   future-proofing.** Optional, and *not* in this commit. `maia/list/route.ts` is
   part of the in-flight rapport-pilot working tree (it carries unrelated
   uncommitted changes, and parts of leg 2 are themselves uncommitted), so adding
   leg-2 guards here would have bundled unrelated work into this history. The leg-2
   paths are inert today (`westernBirthData` is dead; the BaZi constitution is
   `null`), so deferring loses nothing live. See §6.

## 4. Explicitly left untouched

Per task scope — the relationship-derived memory surfaces are **not** affected:
atoms, memberWeb, spiral state, conversational recall, display name, pronouns, and
the moment-only Wu Xing ("today's field"). This change is *only* about the
birth-data prior.

---

## 5. Observability

New runtime marker when injection is withheld:

```
🛡️ [AstrologyContext] Birth-data injection withheld — astrology_consent="<state>" (need "opted_in") for <id8>...
```

Existing marker (`🌟 [Astrology] Birth data available...`) now fires **only** for
opted-in members.

### Verification after deploy

```bash
# Withheld path (unknown/declined members) — should appear for most members:
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep "Birth-data injection withheld"'

# DB sanity — consent distribution:
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT astrology_consent, count(*) FROM members GROUP BY 1;\""
```

Expected: members with `astrology_consent != 'opted_in'` no longer receive natal
context in the prompt; opted-in members are unchanged.

---

## 6. Open follow-ons (not in this change)

- **Route leg-2 structural future-proofing** — gate the (currently inert)
  `westernBirthData` fetch and the BaZi-constitution path in
  `app/api/sovereign/app/maia/list/route.ts` on `astrology_consent === 'opted_in'`,
  to land with the in-flight rapport-pilot route work. Keep pronouns + the
  moment-only Wu Xing ("today's field") ungated.
- **Member-facing use toggle** — a `use my birth data` opt-out/in surface that flips
  `astrology_consent` post-onboarding (parallels the `conversational_recall_enabled`
  consent surface). The column already supports it; only UI is missing.
- **Explicit-invocation mode** — if field use suggests even opted-in members prefer
  the natal lens on-request rather than always-on.
- **BaZi constitution** — if/when wired, route through the same gate.
