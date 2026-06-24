# Entitlements — Resource-Budget Spec (Canon-Safe Hybrid Paywall)

- **Date**: 2026-06-10
- **Status**: Spec / not built. No code or production change yet. Buildable artifact for the launch paywall.
- **Decision of record** (Kelly, 2026-06-10): **Canon-safe hybrid — gate RESOURCES, not features.** Never gate consciousness, depth, memory's *existence*, or the relationship. Gate only what costs real money to serve (capacity) and professional infrastructure.
- **Canon refs**: [MAIA Oath](../canon/MAIA_OATH.md); [Sovereignty Invariants](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md); [Marketing Claim Discipline](../canon/MARKETING_CLAIM_DISCIPLINE.md). The existing in-code principle — *"Consciousness shouldn't be paywalled"* (`lib/stripe/config.ts`, `lib/subscription/types.ts`) — is **preserved literally** by this design (see §1).
- **Companion memory**: `project_launch_paywall_state` (current code state + this decision).

> ⚠️ Substrate references below come from a code audit (4 search agents, 2026-06-10), not line-by-line personal verification of every signature. Treat exact column names / line numbers as **verify-at-implementation**, not gospel. The audit-level claims (what exists vs. net-new) are reliable.

---

## 0. Locked-answer table (pin these; do not let them drift)

| # | Question | Locked answer |
|---|----------|---------------|
| L1 | What is the gated axis? | **Capacity (resources) + professional infrastructure.** Never features, depth, or the relationship. |
| L2 | What happens at a free-tier capacity limit? | **DEGRADE the expensive substrate, never hard-refuse a conversation.** (§6) |
| L3 | Is memory's existence ever gated? | **No.** Free baseline = *real* continuity. Paid buys scale / retention / cross-device — never the existence of memory. (§7) |
| L4 | What is the billing/capacity source of truth? | **`members.tier`** (Stripe-synced: free / personal / pro). `member_settings.circle_tier` stays as the *patronage* axis only. (§3) |
| L5 | Does `TIER_FEATURES` change? | **No.** It stays all-features-free and remains literally true. Capacity is the metered axis, not features. (§1) |
| L6 | Is `config/accessMatrix.ts` deleted? | **No.** It is the correct tool for the **Practitioner / Org route+role boundary**. Member experience uses capacity-gates, not route gates. (§10) |
| L7 | Where are member capacity-gates enforced? | At the **consume-check layer** (resolver + API routes), **not** in route middleware. (§10) |
| L8 | Rollout discipline? | **Observability-first**: meter everything and log before enforcing anything. (§11) |
| L9 | Pricing numbers & baseline sizes? | **Kelly's call** — flagged as canon-sensitive objects, not engineering knobs. (§13) |
| L10 | Stripe live-vs-test mode at launch? | **Open — must be confirmed out-of-band before launch.** (§13) |

---

## 1. The reframe — gate resources, not consciousness

Every gate must be phrased:

> **"Can this member consume this resource?"** — not — *"Can this member access consciousness?"*

This is what makes the hybrid canon-safe rather than canon-flavored. Because we meter *capacity* and not *features*, the existing `TIER_FEATURES` map (every tier → `ALL_FEATURES_LIST`) stays **literally true**: every feature *is* available to every tier; what differs is how much capacity / continuity / professional tooling each tier carries. The "consciousness shouldn't be paywalled" code survives intact — we are not routing around it, we are honoring it on a different axis.

### 1.1 The stewardship test (governing rule for the free/paid line)

This is stewardship of the *conditions that let the relationship exist* — **not** entitlement to monetize the relationship itself. *"The relationship is never gated"* is the engineering form of that vow. Soullab/MAIA is held here as garden / sanctuary / commons, **not a product funnel**: the free floor is the commons; metered resources are the stewarded inputs that sustain it.

To decide what belongs in the free tier, apply one test (Kelly, 2026-06-10):

> **If every paying member disappeared tomorrow, what would we still feel ethically obligated to provide?** Whatever the answer is, that belongs in the free tier.

Everything beyond that line may become capacity, infrastructure, convenience, scale, or professional tooling.

**Financial-honesty corollary:** the test must hold *at zero revenue*. So the free-tier floor must be **servable on owned/local substrate** (local model, text, local storage) — which is exactly where the degrade ladder (§6) bottoms out. A free floor that secretly depends on paying members to fund it is not a floor; it is a teaser with a grace period. The commons runs on what we already own; paid capacity rents the expensive substrate on top.

Kelly's corollary (2026-06-10) makes the economic boundary explicit — *what we feel obligated to provide must be supportable on infrastructure we already own and control*, else the "free tier" is a subsidized preview whose existence depends on continuing revenue:

| Commons (owned) | Capacity (rented) |
|-----------------|-------------------|
| What we can sustain ourselves | What we purchase from others |
| Owned substrate — local inference, text, local storage, continuity floor, core relationship | Rented substrate — premium cloud inference, voice at scale, larger memory budgets, cross-device sync, professional infra |
| Relationship | Amplification |
| Floor | Expansion |

This is why the **degrade ladder (§6) serves three purposes at once** — rare, because they usually fight each other: (1) **UX** — conversations never abruptly stop; (2) **Economic** — expensive resources can be constrained; (3) **Stewardship** — the commons stays viable even under revenue stress. A floor that can't survive zero revenue is not a floor.

---

## 2. Tier structure

| Tier | Carries |
|------|---------|
| **Free** | MAIA conversations · baseline memory/continuity · elemental work · journal · personal growth tools · **the relationship itself** |
| **Supporting Member** | More monthly AI capacity · more voice minutes · priority / DEEP processing · cross-device continuity · larger memory & context budgets · advanced exports |
| **Practitioner** | Client tools · session tools · Studio · practice management · team collaboration · analytics · professional workflows |
| **Enterprise / Organization** | Teams · governance · reporting · org deployment · dedicated infrastructure |

Free + Supporting Member are **capacity-differentiated** (same product, more headroom). Practitioner + Org are **infrastructure-differentiated** (professional tooling). The two halves use different gate mechanisms (§10).

### 2.1 Two revenue models, not one (make this explicit)

Capacity and professional infrastructure are **two distinct revenue models**, not one tier ladder. Keep them mentally and operationally separate:

| Member Plans — *buy capacity* | Practitioner / Org Plans — *buy tools* |
|-------------------------------|----------------------------------------|
| More voice minutes | Client management |
| More memory scale | Session infrastructure |
| More context depth | Teams |
| More cloud sync | Analytics / reporting |
| → **resource metering** | → **software infrastructure** |

**They are orthogonal, not a single ladder — and the schema already reflects this.** `members.tier` (capacity) and `practitioner_tier` (tools) are **independent columns**. A person can be a Supporting Member *and* a Practitioner at once; a practitioner does not "upgrade past" membership to get tools, and buying more capacity does not make a member a practitioner. Two products, billed on two axes, composing on one account. This also maps to the **already-separate Stripe flows** the audit found (`/api/stripe/membership/checkout` for capacity vs. practitioner Stripe Connect for tools) — don't merge them.

### 2.2 Positioning (for marketing — Heather)

Plain-language articulation, easier to communicate than tiers/entitlements/budgets:

> **Everyone gets access to MAIA.**
> **Membership expands capacity.**
> **Practitioner plans support professional work.**

People immediately understand: MAIA is available · supporters get more capacity · professionals get professional tools. Keep outward copy at this altitude — tiers/budgets are implementation detail, not the message. (Governed by [Marketing Claim Discipline](../canon/MARKETING_CLAIM_DISCIPLINE.md).)

The deeper psychological contract beneath the copy (Kelly, 2026-06-10): not *"pay to access MAIA"*, nor even *"pay to support MAIA"*, but —

> **The foundation remains available. Membership expands what can be carried.**

---

## 3. Source-of-truth reconciliation (important — there are two tier columns today)

The codebase carries **two parallel tier axes**:

- `members.tier` — `free` / `personal` / `pro`. **Stripe-synced** by the webhook. → *billing & capacity.*
- `member_settings.circle_tier` — `explorer` / `sustainer` / `guardian` / `elder` / `pioneer`. → *patronage / gratitude (Sustaining Circle).*

**Today `lib/entitlements.ts` keys capacity decisions on `circle_tier` — the patronage axis — which is the wrong column for a capacity model.** This spec moves the resolver to key on `members.tier`. `circle_tier` remains, untouched, as a patronage/recognition badge that grants *no* access difference (consistent with the patronage model). Mapping `members.tier` → resource budgets is defined in §4.

---

## 4. The resolver spine — generalize `lib/entitlements.ts`

Generalize `getEntitlements(memberId)` from `circle_tier → feature-booleans` into `members.tier → resource-budgets`.

```ts
// Resource budget shape (numbers are PLACEHOLDERS — see §13 / L9)
interface ResourceBudgets {
  voice_seconds_monthly: number;   // metered; degrade to text at 0
  memory_budget: number;           // atoms/retention ceiling; free = real-continuity floor (§7)
  context_budget: 'fast' | 'core' | 'deep'; // max processing depth; degrade ladder (§6)
  cloud_sync: boolean;             // cross-device continuity
  exports: boolean;                // advanced/analytics export
  team_seats: number;              // 0 for non-team tiers
  practitioner_tools: boolean;     // gated by practitioner_tier, not members.tier
  organization_tools: boolean;     // enterprise only
}

function getEntitlements(memberId): Promise<ResourceBudgets>   // reads members.tier (L4)

// The one gate primitive every call-site uses:
function canConsume(
  memberId, resource, amount?
): Promise<{ allowed: boolean; remaining: number; degradeTo?: string }>
```

**One resolver, many call-sites.** No call-site asks "what tier are you?" — it asks `canConsume(...)` and honors `degradeTo`.

---

## 5. Per-resource gate table

| Resource | Substrate today | Behavior at limit | Where the check goes |
|----------|-----------------|-------------------|----------------------|
| `voice_seconds_monthly` | **Built** — `usage_voice_monthly` (limit ~1200s + boost), `usage_voice_demo` (180s lifetime) | **Degrade → text** | Before TTS/STT in voice route |
| `context_budget` (DEEP/priority) | **Net-new** — maps to FAST/CORE/DEEP | **Degrade DEEP→CORE→FAST** | Processing-path selection |
| `memory_budget` | **Partial** — atoms load per turn, no cap | Cap *new* retention; never drop the floor (§7) | Atom loader / write path |
| `cloud_sync` | **Partial** — `PremiumMemberStorage`, `cloudAudioUploads` | **Degrade → local-only** | Sync path |
| `exports` | **Built** — `analyticsExport` in entitlements.ts | Deny export action (not the data) | Export route |
| `team_seats` | **Partial** — `studio_teams` / `studio_team_members` | Block *new* seat, keep existing | Invite/add-member route |
| `practitioner_tools` | **Built** — `accessMatrix.ts` + `practitioner_tier` (earn/studio) + `getCurrentPractitioner` | Route+role gate (§10) | Middleware (practitioner routes) |
| `organization_tools` | **Net-new** | Route+role gate | Middleware (org routes) — post-launch |

---

## 6. Safeguard 1 — the degrade ladder (never refuse the conversation)

At a free-tier capacity limit, MAIA **degrades the expensive substrate, never the relationship**:

- DEEP → CORE → FAST (processing depth)
- cloud model → local model (Ollama)
- voice → text

A hard "you've hit your limit, come back next month" wall on *conversation* would recreate the rejected hard-paywall rupture by volume instead of by feature. **Forbidden.** The member can always keep talking to MAIA; what they buy is depth / speed / voice / continuity, not access.

> Note: `usage_daily.nudge_shown` / `nudge_type` already exist — the original engineer leaned **nudge, not wall**. This spec ratifies that instinct as canon.

**The bottom rung must cost ~nothing to serve.** The free floor degrades to local substrate (Ollama, local TTS/STT, local storage) so the stewardship test (§1.1) holds even at zero revenue: what we are ethically obligated to provide must be servable without paying members. This makes the degrade ladder a *requirement*, not a nicety.

---

## 7. Safeguard 2 — the memory floor (a canon object, not a pricing knob)

Free includes *baseline memory/continuity*. Therefore the free baseline size must be **large enough that continuity is real** — MAIA remembers a life unfolding — **not a teaser engineered to upsell.** Paid tiers buy *scale, retention window, and cross-device sync*; they never buy *the existence of memory*. This guards livingness (the guard with no natural constituency — see memory `project_two_guards_living_mirror`). The baseline number is set by Kelly and recorded as a canon decision (§13), so a future pricing pass cannot quietly shrink it.

---

## 8. Safeguard 3 — consent, transparency, sovereignty check

- **No stealth metering.** A member can see their own usage and budgets. Metering is visible, not hidden.
- **The relationship is never gated** — restate L1/L2 at every gate.
- **Sanctuary Mode is exempt from metering's memory effects** — Sanctuary sessions remain non-retained regardless of tier (no resource accounting that would create stealth retention).
- **Sovereignty Invariant check** (per CLAUDE.md, required for user-facing behavior): does this increase agency? push life outward? reduce the system's psychological centrality? → Capacity-gating with degrade-not-refuse keeps the relationship freely available; it does not manufacture dependency to upsell. Passes — but each gate's UX copy must be re-checked against the invariants when built.
- **No spiritual pressure in monetization copy** (the stewardship→paternalism drift, Kelly 2026-06-10). *"Support the field"* / *"here is what your support makes possible"* = stewardship, fine. *"Pay because we're preserving something sacred"* = spiritually-flavored coercion → **forbidden**. All paywall / upgrade / pricing copy routes through [Marketing Claim Discipline](../canon/MARKETING_CLAIM_DISCIPLINE.md).
- **Transparency triad** — every exchange states plainly: (1) here is what costs money, (2) here is what your support makes possible, (3) here is what remains available regardless. Legible exchange preserves sovereignty — no manufactured scarcity, no implied loss of the relationship.

---

## 9. Tier cache freshness (the cookie-staleness fix)

`members.tier` is the source of truth; the `maia_tier` cookie is a cache, refreshed only on login/`refresh-and-redirect`. A mid-session upgrade is therefore stale until re-auth. Fix: **refresh `maia_tier` (and re-resolve entitlements) immediately after a successful checkout** (`checkout.session.completed` → client refresh, or server-set cookie on the post-checkout redirect). The resolver should read DB-truth on capacity decisions where staleness would deny a paid member what they just bought.

---

## 10. Re-enabling enforcement safely

Two gate mechanisms, by design:

- **Member capacity-gates** → enforced at the **consume-check layer** (`canConsume` in resolver + API routes). **Not** in route middleware. Keep the `middleware.ts:286` tier-bypass in place for member routes — member access is never decided by route.
- **Practitioner / Org route gates** → `config/accessMatrix.ts` + role checks. Re-enable the `middleware.ts:286` bypass **only for practitioner/org route prefixes**, scoped, not globally.

This keeps "the relationship is available" structurally true: no member route can 403 on tier.

---

## 11. Phased rollout (observability-first)

| Phase | Scope | Gate? | Done when |
|-------|-------|-------|-----------|
| **Pre — Email audit** | Verify launch-critical email actually delivers — **auth (magic link / sign-in), recovery, Stripe receipts/billing** — from a **verified sender domain**, not the `onboarding@resend.dev` sandbox sender | n/a | Resend `delivered` to Gmail ✅ (2026-06-10, messageId `1328f9b9…`). **Exit gate = NOT Spam + NO auth warnings** (inbox/Promotions/Updates all pass — placement nuance ≠ blocker); needs mailbox-owner glance. **Caveat:** test used the production sender *address*+domain+Resend account via a standalone script, NOT the literal magic-link route+`sendEmail()` wrapper — deliverability fundamentals (domain SPF/DKIM/DMARC) transfer, but production-route execution is a separate functional check. Blocker only if Spam or auth-warning → fix = DMARC/domain-auth in Resend dashboard. |
| **P0 — Meter** | Generalize resolver (§3/§4); meter all resources; log only | **No** | Logs show real per-member consumption; zero behavior change |
| **P1 — Voice** | Wire `voice_seconds_monthly` deny-gate with **degrade-to-text** | Voice only | Free member past limit gets text seamlessly; log marker fires |
| **P2 — Rest** | context_budget (degrade), cloud_sync, exports; cookie-freshness (§9) | Per-resource | Each gate degrades-not-refuses; verified under auth load |
| **P3 — Pro/Org** | Re-scope accessMatrix for practitioner/org routes (§10) | Route+role | Practitioner routes gate; member routes never do |

**Email reliability comes first** (Kelly, 2026-06-10): a paywall launch lives or dies on deliverable auth + receipt emails, so the Pre-phase audit precedes any enforcement work. P0 then mirrors the project's conversational-memory discipline (Phase 1 observability before Phase 2 influence): **meter and log before enforcing.** *Built ≠ wired ≠ enforced ≠ verified.*

**Email reliability ranking (Kelly, 2026-06-10)** — *preserve the relationship first*; the pathways that create and maintain the relationship get the highest standard:

| Pathway | Risk |
|---------|------|
| Magic links / login | **Critical** |
| Invitations / onboarding | **Critical** |
| Payment confirmation / receipts | **Critical** |
| Session reminders | High |
| Team notifications | Medium |

A member forgives a missed notification; a member cannot sign in if a magic link silently fails, a new user never arrives if an invitation disappears, and a paying member who gets no confirmation is an immediate trust break. The dormant invite-sender landmine (§14) sits on a **Critical** row — fixed 2026-06-10 before the invite path goes live.

---

## 12. Verification gates / log markers

- P0: `[entitlements] resolved { memberIdPrefix, tier, budgets }` + `[usage] consume { resource, amount, remaining }` — no denials.
- P1: `[entitlements] degrade { resource: 'voice', from: 'voice', to: 'text', memberIdPrefix }`.
- Each phase verified under **authenticated load**, not just unit tests — surfacing ≠ verified.
- Ops diagnostic pattern (extend CLAUDE.md's): `grep -E "entitlements|usage consume|degrade"` on the container logs.

---

## 13. Open items (Kelly's call / out of scope here)

- **Pricing numbers** (the $ per tier) — Kelly. Not in this spec.
- **Baseline sizes** — free voice seconds, free memory floor (§7), context default — Kelly; recorded as canon objects.
- **Stripe live-vs-test mode** — confirm before launch (audit reported `sk_live_*` in `.env.production`; not read). (L10)
- **Org / Enterprise tier** — net-new, **post-launch**.
- **`upgrade_prompts` table** — exists; nudge UX wiring is a separate, later pass (consent-respecting, per §8).
- Whether to add this as a tracked thread in CLAUDE.md's *Current priority thread* — Kelly.

---

## 14. Risk register (operational, not conceptual)

The conceptual model is settled; remaining launch risk is **operational** (Kelly, 2026-06-10):

- **Launch reliability** — email deliverability (auth, recovery, **Stripe receipts**) on a verified sender domain. → Pre-phase audit (§11). **Audit 2026-06-10:** 3 critical paths CLEAN (`@soullab.life`; receipts are Stripe-side, nothing to build); team notifications fixed (`team@soullab.life`). **Dormant sandbox-sender landmine — RESOLVED 2026-06-10** via external sender-centralization (not this spec's author): email senders consolidated into `lib/email/sendEmail.ts` (`SENDERS` map, all `@soullab.life`, + `sendEmail()` wrapper with a `purpose` tag); `sendBetaInviteWithPasscode.ts:101` now uses `SENDERS.kelly`. Verified repo-wide — zero live `onboarding@resend.dev` senders remain (all occurrences are comments/warnings). Future drift is now structurally discouraged by the central map + an explicit "never use the sandbox sender" warning. **Code-clean ≠ deliverable:** `@soullab.life` SPF/DKIM/DNS verification in Resend + a real external-inbox test send remain operationally unverified — that, not code, is what closes the Pre-phase.
- **Observability** — meter before enforce; logs prove real consumption before any gate goes live. → P0 (§11).
- **Billing correctness** — webhook → `members.tier` sync is right; cancellations downgrade; no double-charge or wrong-tier writes. → verify against real Stripe events.
- **Entitlement freshness** — `maia_tier` cache must reflect a just-completed purchase, not the pre-purchase tier. → §9.
