# Studio Access Audit — 2026-07-16

**Ruling (Kelly, 2026-07-16):** Studio is intentionally limited to paying Steward members and certain practitioner accounts. The authored language is correct; runtime behavior is wrong.
**Status:** AUDIT ONLY — no implementation until this document is reviewed. Scope confined to Studio; no other areas altered.
**Convergence note:** two independent lanes (this one via MCP testing; the runtime-reconciliation lane via `PLATFORM_KNOWLEDGE_AUDIT_2026-07-16.md`) found the same mismatch on the same day — per repo law, independent convergence ratifies the finding.

## Intended policy

`/studio` (and `/api/studio`) accessible only to: paying Steward members · designated practitioner accounts · founder/admin. Everyone else: graceful explanation + optional Steward-membership information, **no error state implying malfunction**. Hidden navigation alone is not sufficient.

## Actual runtime behavior (verified)

Any authenticated member — free tier, no roles — receives full Studio content at `/studio` by direct URL (runtime-verified in local dev with a free-tier fixture; production redirects *anonymous* traffic to signin, but an authenticated free member passes the same code path). The rail icon being founder-scoped hides the door without locking it.

## Exact causes — the defect is three layers deep

**Layer 1 — the rule itself declares openness.** `config/accessMatrix.ts:370`:
```ts
{ prefix: '/studio', minTier: 'free', notes: 'Studio - open to all authenticated users' }
```
(`config/accessMatrix.ts:436` — same for `/api/studio`.) The access matrix codifies the opposite of the ruling. Even perfect enforcement would change nothing.

**Layer 2 — tier enforcement is globally disabled.** `middleware.ts:304–308`:
```ts
case 'insufficient-tier':
  // For now, just allow access - tier gates disabled during development
  // TODO: Re-enable tier gating when membership page is ready
  return NextResponse.next();
```
Unconditional — not wrapped in a dev check. Every `minTier` in the matrix (30 rules carry `personal`/`pro`) is currently advisory, production included. Re-enabling this switch globally is **not** the Studio fix — it would newly block members on 30 surfaces at once (out of scope per the ruling's "do not alter other platform areas").

**Layer 3 — role checks enforce, but trust the client.** `missing-role` → 403 *is* enforced (`middleware.ts:310+`), and `steward` already exists in the matrix's Role vocabulary (`accessMatrix.ts:290,344`). But roles are resolved from a client-controlled `maia_roles` cookie / `x-maia-roles` header (`middleware.ts:50–69`; same in `lib/security/requireAccess.ts:66–71`). A user can set their own cookie. Edge-middleware role gating is UX, not security. **Additionally, no member row in the database currently carries a `steward` role** (`members.roles` distinct values today: team_admin, admin, beta_tester, member) — gating on that role today would lock out everyone including legitimate future Stewards until a grant path exists.

## Recommended correction (for review — not implemented)

Two layers, mirroring the proven in-repo pattern (`app/labtools/layout.tsx` + `requireFounder()` — server-side, DB-truth, already protects labtools correctly):

1. **Authoritative gate — server layout.** Add `app/studio/layout.tsx` with a `requireStudioAccess()` server check against database truth (member's entitlement/role, not cookies): allow founder/admin · practitioner accounts (via the practitioner-program tables, not the roles cookie) · Steward entitlement (mapping below). On refusal, render a graceful **StudioGateScreen** (FounderGateScreen analog): what Studio is, that it's available to Steward members, optional membership info, a warm return path — a page, not an error.
2. **Matrix honesty — fix the rule.** `accessMatrix.ts:370/436` change `minTier: 'free'` + "open to all" note to the restricted declaration, so the matrix stops codifying the wrong policy even while tier enforcement stays globally disabled. (Middleware redirect-to-`/soullab-studio`-landing is optional polish; the layout gate is the authority.)
3. **API parity.** `/api/studio/*` routes enforce the same server-side check — a locked page with an open API is a leak, not a gate.
4. **Regression tests (four personas):** anonymous → signin/landing · free member → StudioGateScreen (200, graceful, no Studio data) · Steward-entitled member → full access · practitioner account → full access. Plus: API parity for all four, and labtools/other areas unchanged.

**Open mapping question for Kelly (blocks implementation):** what is "paying Steward" in data? Candidates: an entitlements tier (`lib/entitlements.ts` knows `explorer|sustainer|guardian|elder|pioneer`; Stripe is wired per launch-paywall state), an explicit `steward` role grant on `members.roles`, or a subscription flag. The matrix's `free|personal|pro` vocabulary is a *third* tier language — the Studio gate should bind to whichever source Stripe actually writes, and the tier-vocabulary reconciliation should be noted as separate debt, not solved here.

## Side effects & regression risks

- **Lock-out risk:** until the Steward mapping + grant path exists, the gate admits only founder/admin/practitioner — correct per ruling, but verify Kelly's and Larry-lane accounts pass before merging (Larry's Studio work must not break; check which account the practitioner-field admin flows use).
- **Client-trust debt (flagged, not fixed here):** the `maia_roles` cookie mechanism remains spoofable for *other* role-gated matrix rules. Out of scope, but this audit is the evidence for a future hardening pass.
- **Parallel-lane coordination:** `platformKnowledge.ts` (runtime-reconciliation lane) currently describes Studio *without* tier claims pending this ruling (R-A). Once the gate ships, that file's Studio entry can state the restriction confidently — same-motion update per the stale-block rule.
- **Do-not-touch list honored:** no changes to the global `insufficient-tier` switch, other matrix rules, Studio's internals, or navigation visibility.

## Canonical Meaning of Paying Steward (Phases 1–5, verified 2026-07-16)

**Ruling applied:** *A paying Steward is a member with a currently active paid Soullab membership entitlement*, determined from server-side database truth derived from Stripe. "Steward" stays the member-facing name; authorization binds to the payment fact beneath it. No new role or tier is created.

### 1–2. Exact source of truth (traced, not inferred)

Stripe's webhook (`app/api/stripe/webhook/route.ts`) writes ONLY to **`members`**: `tier ∈ {'personal','pro'}` on checkout (`'free'` on subscription deletion), `subscription_active` (true while Stripe status ∈ {active, trialing}), `subscription_expires_at`, `stripe_customer_id`, `stripe_subscription_id` (schema: migration `20260120000001_add_member_tier_stripe.sql`). **This is the only Stripe-derived truth in the database.**

### 3. The mapping — and a falsified assumption

**Counsel's presumed mapping (`sustainer+` = paid) is FALSIFIED by evidence.** The `explorer|sustainer|guardian|elder|pioneer` vocabulary lives in `member_settings.circle_tier` — which **Stripe never writes**. Its only writer is a self-serve settings PATCH (`app/api/members/settings/route.ts:194`) with **no payment verification**: any member can set their own `circle_tier` to guardian. It is a contribution/display vocabulary, not a billing fact, and is **rejected as an authorization source**. (Production reality: 16 rows, all `explorer` — the hole exists but is unexploited. Flagged separately below.)

**The canonical paid check:**
```
paidSteward(member) =
  members.subscription_active = true
  OR (members.subscription_expires_at IS NOT NULL AND members.subscription_expires_at > now())
```
The second clause is the **grace recommendation**: honor the paid-through date. Cancel-at-period-end keeps Stripe status `active` (→ flag stays true) until period end — natural grace. `invoice.payment_failed` flips `subscription_active` false immediately while the paid period may still be running; honoring `subscription_expires_at` prevents punishing a card hiccup mid-period. The `tier` *label* (personal/pro) is deliberately NOT load-bearing — payment state is.

### 4. Practitioner mapping (verified robust)

An active row in the **`practitioners`** table (`member_id`, `status='active'`), read server-side by `getCurrentPractitioner()`/`requirePractitioner()` (`lib/auth/getCurrentPractitioner.ts`) against the session-validated member id. Not client-spoofable. Mirror flag `members.is_practitioner` exists but the table is authoritative.

### 5. Founder/admin

`FOUNDER_MEMBER_IDS` env allowlist (2 ids), compared to the session-validated member id (`lib/founder/founderAuth.ts`). Not spoofable, but **not data** — the DB cannot recognize a founder. Recorded as vocabulary debt, not changed in this pass.

### 6–7. `canAccessStudio()` (proposed, not implemented)

```
authenticated (session-validated, never x-member-id/localStorage)
AND ( paidSteward(member)                      → allowed-paid-steward
   OR active practitioners row                 → allowed-practitioner
   OR memberId ∈ FOUNDER_MEMBER_IDS            → allowed-internal )
ELSE → unauthenticated | no-paid-entitlement | inactive-subscription
```
One shared server-side function; the layout gate renders hospitality, the same function guards `/api/studio/*`, server actions, and any future entry point. Never reads `maia_roles` cookies, `x-maia-roles` headers, `circle_tier`, or the legacy matrix tier.

### 8. Account outcomes (production data, 2026-07-16, redacted)

| Account class | Data basis | Outcome |
|---|---|---|
| Kelly (founder) | In FOUNDER_MEMBER_IDS ✓ (verified) + active practitioner row ✓ | allowed-internal |
| **Larry (practitioner)** | **NO practitioners row exists** (15 active rows incl. Jondi, Kelly, Nathan; Larry absent) | ⚠️ **would be locked out — create his practitioner row before/at implementation** (the grant path already exists; this is data entry, not code) |
| Anonymous | no session | signin/arrival path (unchanged) |
| Ordinary free member | tier='free', no sub | no-paid-entitlement → StudioGateScreen |
| Active paid member | subscription_active=true | allowed-paid-steward — **currently zero members in production** |
| Canceled, within paid period | Stripe status stays active until period end; else expires_at clause | allowed until paid-through date |
| Expired | subscription.deleted → free/false | no-paid-entitlement |
| Approved practitioner | active practitioners row | allowed-practitioner (15 today) |
| Forged role cookie | function never reads cookies | denied (reason per state above) |

**The dispossession check passes trivially:** production has **0 members with `subscription_active=true`**, while 44 members carry `personal`/`pro` *labels* (written by dev-login defaults and legacy paths, not payment — 0 active subscriptions proves it). Gating Studio removes URL access from members who never paid for it; no paying member loses anything, because none exist yet. The gate ships *before* the first real Steward pays — the correct order.

### 9. Vocabulary debt register (named, not solved here)

1. `config/accessMatrix.ts` Tier (`free|personal|pro`) — same words as `members.tier` but resolved from client-controlled cookies in middleware.
2. `member_settings.circle_tier` (5 names) — display/contribution vocabulary; **self-serve PATCH can set it without payment while `lib/entitlements.ts` grants paid features (voice transcription, analytics) from it — a billing-integrity hole beyond Studio's scope, unexploited today, needs its own hardening pass.**
3. `lib/auth/entitlements.ts` — third resolver (labs.preview from members.tester); reconciliation self-documented as deferred.
4. `hooks/useSubscription` — client display only; `hasFeature()` hardcoded `true`.
5. Founder = env config, invisible to the DB.

## MAIA's spoken line (ready once the gate is real)

> "Studio is a workspace for developing ideas, writing, and projects. It is currently available to Steward members and certain practitioner accounts and is not generally open to all members. I can still help you explore or develop a project here in conversation."

## Completion criterion

The task is complete when runtime behavior matches the constitutional product rule — *Studio is for paying Stewards (and designated practitioners)* — proven by the four-persona regression tests, not by the door merely being hidden.
