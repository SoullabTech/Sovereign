# STUDIO-A-LA-CARTE-01 — Phase 1: studio entitlement design (DRAFT, 2026-11-12)

**Standing:** `PROPOSED` design. Docs only. ⛔ No migration, no code, no Stripe change, no flag change.
Implementing any part needs its own authorization (Class B: migration + auth).
**Code read at:** `origin/clean-main-no-secrets` @ `76c9558a40`.
**Parents:** R1 + R2 (`…_FOUNDER_RULING_R1_2026-11-12.md`), Phase 0 (`…_PHASE0_REGROUND_2026-11-12.md`).

## 1. Constraints this design must respect (all read on canonical)

1. **One decider.** Gates and executors check entitlements, never `tier`/`role` directly
   (`lib/auth/entitlements.ts:4-5`). Founder ruling 2026-11-11 retired the per-destination tier table from
   #2221 "so there is one place that decides this" (`lib/auth/wholeWorkEntitlement.ts:4-5`).
   → A purchase record may be a **source** the entitlement layer reads. It may never be a second decider.
2. **Capacity-shaped keys only** (Kelly directive, `entitlements.ts:14-16`): `writing.wholeWork` yes;
   `labs.fieldLab` / `can_use_labs` no. Founding Circle never appears as an entitlement.
3. **No one pays for depth.** "No one pays to be known. No one pays for depth. No one gets a lesser MAIA."
   (`docs/canon/MAIA_SANCTUARY_ECONOMY.md:15`). → A studio holding may unlock studio *tools*; it never
   changes MAIA's memory, depth or quality of reflection.
4. **Astrology Pro excludes purchase by design.** `lib/astrology/proAccess.ts:8-13`: "The tester flag, an
   allowlist, a tier claim or a subscription never admit anyone here"; the `tester-grant` phase "waits on
   the #1817 R20/privacy verdict". → This design adds **no** purchase source for Astrology Pro. See §5.
5. **Fail closed, loudly.** The `wholeWork` resolver throws on lookup failure so an outage is never read as
   "not Pro" (`wholeWorkEntitlement.ts:50-52`). Every new resolver does the same.
6. **Flag-off = today.** Every new key ships behind a gate whose off state reproduces current behaviour
   exactly (`WS_PRO_GATE_ENABLED` pattern).

## 2. Two layers

### Layer A — Holdings ledger (source; decides nothing)

An **append-only event log**, following the audited-grant pattern already in use
(`astro_pro_tester_grant_events`, `lib/astrology/proTesterGrants.ts`):

`studio_holding_events` (proposed name)

| column | meaning |
|---|---|
| `id` | uuid |
| `member_id` | the one identity (R1 §2.1) |
| `product` | a **product id**, e.g. `studio.writer.pro`, `studio.sound`, `studio.guide` — a catalogue name, *not* an entitlement key |
| `event` | `granted` · `renewed` · `lapsed` · `revoked` |
| `source` | `stripe` · `owner_comp` · `bundle` |
| `period_end` | when a paid period ends (null for comps) |
| `stripe_event_id` | unique; makes webhook writes idempotent |
| `actor` | who/what wrote it (webhook, named owner) |
| `created_at` | |

Current holding = latest event per `(member_id, product)`, active if `granted|renewed` and
`period_end` is null or in the future. Append-only keeps the history as evidence; nothing is updated in place.
No PHI, no content, no member writing.

### Layer B — Entitlement keys (the decider)

A **product → capacities** map, in code, translates holdings into capacity keys. The resolver adds a key
when any source grants it. Each key gets a pure `decide…()` function (testable without a DB) and a server
`resolve…()` that throws on failure — exactly the `wholeWork` shape.

Resolution order per key (same as `writing.wholeWork`):
1. Gate off → today's behaviour, nothing read.
2. Pilot / beta / founder witness → entitled (keeps billing records true).
3. Active holding whose product maps to this key → entitled.
4. Otherwise not entitled.

## 3. Per studio

| Studio | Key(s) | Today's source | Proposed added source | Gate |
|---|---|---|---|---|
| Writer's Studio | `writing.wholeWork` (exists) | gate off / pilot / `members.tier='pro'` | holding `studio.writer.pro` | `WS_PRO_GATE_ENABLED` (exists) |
| Sound Studio | ⚠️ name owed by owner lane (capacity-shaped) | env allowlist `SOULLAB_LISTEN_BETA_MEMBER_IDS` | holding `studio.sound` | new, default off |
| Guide Studio | ⚠️ name owed by owner lane (capacity-shaped) | Reflect env allowlist; intro passes `'absent'` | holding `studio.guide` | new, default off |
| Astrology Studio | — | `proAccess.ts` phases | ⛔ none (constraint 4) | — |

- Key names are **not** proposed here as final: they must name a capacity, and the capacity is the owner
  lane's to state.
- The Stripe Connect practitioner billing (`app/api/stripe/webhook/practitioner/route.ts`,
  `client_subscriptions`) is a practitioner charging *their* clients. It is a separate concern and is not touched.

## 4. Webhook (Phase 2 preview, not designed in full here)

Today the webhook ignores anything whose `metadata.type !== 'membership'`
(`app/api/stripe/webhook/route.ts:126,188,231`). Phase 2 would add `metadata.type = 'studio'` +
`metadata.product`, writing `studio_holding_events` idempotently by `stripe_event_id`. Membership handling
unchanged. Test mode only until separately authorized.

## 5. Open questions

**For owner lanes (implementation-level, not founder):**
- Sound Studio and Guide Studio: the capacity each purchase unlocks, and its key name.
- Whether admission (entry to the free studio) becomes open sign-up or stays beta — a launch decision per lane.

**Held for the founder (already outside R1, listed so they are not decided by accident):**
- **Bundles / Soullab Pro:** does `members.tier='pro'` keep granting `writing.wholeWork` once a standalone
  Writer's Pro exists? (Pricing and bundles are held under R1.) Default in this design: **yes, unchanged**.
- **Astrology Studio purchase:** opening a purchase path means reopening the ASTRO-PRO-04 access ruling and
  waits on #1817. This design does not ask for it.

## 6. Gates before implementation

Class B (migration + auth) · migration review · rollback = drop the empty table + revert · Co-Lab Release
Gate if admission/roles change · `npm run typecheck` no-regression · unit tests for every `decide…()` ·
Sanctuary-economy check (constraint 3) · no member-facing copy in this phase.

## 7. Done when (for a later implementation lane)

With every gate off, behaviour is byte-identical to today (tests prove it). With a test holding written
locally, the mapped key appears and nothing else changes. A lookup failure yields 503, never "not entitled".
