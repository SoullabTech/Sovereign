# Portal Tier Naming — Two-Layer Model

**Date:** 2026-06-12
**Status:** Active constraint — governs Track A and all Portal access gates
**Origin:** Probe finding before member_tier migration (2026-06-12)

---

## The two layers

### Stored commercial tier (`members.tier`)

```
free | personal | pro
```

- Live in production as of 2026-06-12: 69 members (`free: 25`, `personal: 39`, `pro: 5`)
- Stripe scaffolding wired: `stripe_customer_id`, `stripe_subscription_id`, `subscription_active`, `subscription_expires_at`, `tier_started_at`
- **Do not rename without a deliberate billing migration.** Code may reference these values. Renaming requires coordinated update of constraints, code references, and Stripe webhook handlers.

### Portal access language (`PortalTier`)

```
explorer | companion | practitioner
```

- The product language for the Personal Portal, Track A, and all downstream surfaces
- Defined in `lib/portal/tier.ts`
- **Never stored in the database directly** (until billing migration is planned and executed)

---

## The mapping

```
free        →  explorer
personal    →  companion
pro         →  practitioner
```

This is the only translation point. All Portal access logic goes through `lib/portal/tier.ts`:

```ts
import { toPortalTier, hasPortalAccess } from '@/lib/portal/tier';

// Translate for display
const tier = toPortalTier(member.tier); // 'explorer' | 'companion' | 'practitioner'

// Gate access
if (!hasPortalAccess(member.tier, 'companion')) {
  return <ExplorerFloor />;
}
```

---

## Why the adapter exists

The probe before Track A build found 69 live members on the existing tier model. Renaming in-place would have required:
- Updating 69 member rows
- Updating the CHECK constraint
- Auditing all code references to `'free'`, `'personal'`, `'pro'`
- Coordinating with Stripe webhook handlers

The adapter achieves the same Track A outcome — Portal gates speak `explorer | companion | practitioner` — without touching live data.

---

## When to remove the adapter

When a deliberate billing migration is planned:

1. Audit all code references to `StoredTier` values (`'free'`, `'personal'`, `'pro'`)
2. Update the CHECK constraint on `members.tier`
3. Run `UPDATE members SET tier = 'explorer' WHERE tier = 'free'` etc. in a transaction
4. Update Stripe webhook handlers to write new values
5. Delete `lib/portal/tier.ts` and replace adapter calls with direct `members.tier` reads
6. Delete this doc

Until that migration happens, **`lib/portal/tier.ts` is the single translation point.** No component should hardcode `'free'` or `'personal'` as Portal gates.

---

## Doctrine relationship

The `explorer | companion | practitioner` model is the Portal access model described in:
- `docs/architecture/ORIENTATION_CONTINUITY_MEANING_2026-06-12.md` — empty-state doctrine
- Track A build spec (forthcoming)

The `free | personal | pro` model is the commercial tier stored in the database. These are the same concept at different stages of naming evolution. The adapter bridges them during the transition.
