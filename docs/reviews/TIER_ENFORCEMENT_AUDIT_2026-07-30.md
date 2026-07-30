# Tier Enforcement — Bounded Audit Record

**Opened 2026-07-30 · Status: QUESTION OPEN, no fix authorized · Class: platform-wide**

> **This is not part of the Author's Studio experience lane.** It is referenced from Layers 1–2
> as an enforcement caveat only. It decides nothing about experience architecture.

## The verified fact

`middleware.ts:304-308`

```
case 'insufficient-tier':
  // For now, just allow access - tier gates disabled during development
  // TODO: Re-enable tier gating when membership page is ready
  return NextResponse.next();
```

Every `minTier: 'free' | 'personal' | 'pro'` declaration in `config/accessMatrix.ts` is policy
that middleware does **not** enforce. Authentication (`no-session-cookie` → redirect) and roles
(`missing-role` → 403) **are** enforced. Production runs `ACCESS_CONTROL_MODE` unset →
**permissive** (`config/accessMatrix.ts:599-601`), verified on minisforum 2026-07-30, so
unmapped routes also pass through (`:641`).

This is explicit and commented — a deliberate development posture, **not a defect discovered**.

## The question this audit asks

> **Are paid-tier distinctions enforced anywhere downstream, and what would break if middleware
> tier enforcement were restored?**

## Scope to inspect

- page and layout guards
- API route authorization
- server actions
- entitlement checks
- Stripe / customer-state resolution
- practitioner and Pro Studio access
- features whose UI is hidden but whose backend remains callable
- routes relying solely on `minTier`

## Explicitly NOT authorized

⛔ **Do not remove the bypass.** The comment indicates it may be compensating for incomplete
membership behavior. Restoring enforcement blindly could lock out legitimate members or surface
stale tier-data problems. The audit answers the question; it does not change behavior.

## Status

- [ ] downstream enforcement inventory
- [ ] restoration impact assessment
- [ ] founder ruling

Nothing here is ruled. Nothing here is scheduled.
