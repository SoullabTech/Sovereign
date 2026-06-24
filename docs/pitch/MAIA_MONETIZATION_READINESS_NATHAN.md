# MAIA Monetization Readiness — Brief for Nathan

*Date: 2026-06-05 · Status: internal explainer · Scope: personal-development MAIA (not Neuropod, not practitioner B2B)*

## The headline

The revenue capability for personal-development MAIA is **largely already built**. The gap between us and charging money is a **structure decision plus a wiring sprint** — not a ground-up build. The expensive, slow part (payment infrastructure, subscription lifecycle, the tier model, the access-control primitives) already exists in the codebase and is partly live.

So the conversation we need to have isn't "how do we build monetization." It's "what's the right tier structure, and let's finish connecting the paywalls to it."

## What we already have

**1. The product people would pay for** — built and live:
- MAIA conversation with persistent memory / continuity
- Astrology (birth chart + ongoing)
- Journal with pattern recognition
- Oracle, dream journal, Elder Council
- Voice

**2. The payment machinery** — built and wired to Stripe:
- Checkout flow (`app/api/stripe/membership/checkout/route.ts`)
- Webhook that handles the full subscription lifecycle — upgrade, renewal, cancellation, failed-payment grace period (`app/api/stripe/webhook/route.ts`)
- A `members.tier` field that updates automatically when someone pays or cancels
- A rendered pricing / membership page with monthly/annual toggle (`app/maia/membership`)

**3. The access-control machinery** — built, the "valve" that turns features on/off by tier:
- A tier-gating helper already exists: `requireTier()`, `requirePersonal()`, `requirePro()` (`lib/security/requireAccess.ts`)
- A usage-quota + rate-limit system (daily message limits, etc.) (`lib/usage.ts`, `lib/middleware/ApiMiddleware.ts`)
- A separate, more-complete **practitioner economy** where practitioners set their own client pricing (`lib/practitioner/*`) — a second revenue line already scaffolded

## What's actually left

Two things, and only two:

**1. Decide the structure (a product/pricing call — yours and Kelly's, not an engineering problem).**
The model that's *live in code today* is Free / Personal $12 / Pro $35. Other numbers have been floated in strategy docs and proposals (up to $22 / $44 / $88, plus a possible founding "Pioneer" tier). We need to pick the final shape and price points.

**2. Wire the paywalls (a focused engineering sprint, not a build).**
The gate function exists; it just isn't installed on every door yet. Concretely:
- Call the existing `requireTier()` gate at each premium feature boundary
- Set the per-tier quota values (what "free" actually limits)
- Turn off the beta override that currently sets **every** member to "personal" (i.e. nothing is gated today, by design, during beta)

## Why this matters

The distance to first revenue is **a decision and a wiring pass measured in days-to-weeks**, not a months-long build. We are not starting from zero on monetization — we're turning on and tuning a system that's already substantially in place.

## Honest caveats (so we don't oversell it)

- **Nothing is gated today.** Beta intentionally gives everyone full access, so "it's built" means the machinery exists, not that it's currently collecting money or restricting anyone.
- **Prices aren't final.** Live code says $12/$35; that's a placeholder pending the structure decision, not a committed price.
- This brief covers personal-development MAIA only. Neuropod (hardware) and the deeper practitioner B2B model are separate tracks.
