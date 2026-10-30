# HOUSE-ENTRANCE-01 — Pro Studio learn-and-try page: design brief

**Status:** DESIGN CANDIDATE for founder review. ⛔ Not build authorization. No page, route, schema or entitlement is created by this document.
**Occasion:** PR #2002 founder routing decision (2026-10-30) — signed-in members without a verified paid Pro Studio entitlement get "a useful limited Pro Studio learn-and-try entry with no forced practitioner enrollment." Resolver landed at `cdc7c3077` (`lib/house/entrance.ts`); it returns the *kind* `limited_try` and no href, because this page does not exist yet.
**Governs:** `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` (Live/Designed/Vision), Invariant 14 (no imposed vocabulary), ADR-010 and Ganesha #1807 (Pro Studio and Personal Portal are separate offerings), Pro Reflect #1816 hold.

## 1. What the page is for

The human activity: **understand what Pro Studio is, and decide whether it is for me** — without being enrolled, sold to, or made into a practitioner by clicking.

It is a threshold, not a funnel. Success is a member who can say *what it is, what it is not, and what I can do today* — not a conversion.

## 2. Route and states

- New route **`/pro-studio`** (server component), a **sibling** of `/pro-studio/reflect`. It does not inherit `/studio`'s practitioner-only layout. `/pro-studio/reflect` is untouched and stays default-closed; this page must not link to it, mention it as available, or share its beta flag.
- One page, two states driven by `resolveProStudioEntrance()`:
  - `signed_out_intro` — same explanatory content, plus a sign-in door. Reads no member data.
  - `limited_try` — same content, plus the today-actions below.
  - `full_workspace` is **not rendered here**: that member is sent to the studio itself (destination mapping owed; depends on a verified entitlement source that does not exist).

## 3. Content (every claim classified)

| Section | Content | Claim state | Source of truth |
|---|---|---|---|
| What Pro Studio is | The practitioner offering: people, sessions, continuity. Separate from Personal Portal. One account, separate personal and professional boundaries. | LIVE (for practitioners) / DESIGNED (boundary language) | ADR-010; #1807 |
| What the full studio holds | The module list, rendered **from `MODULE_DEFINITIONS`** (label + description) so it cannot drift from the product. | LIVE for practitioners; not claimed as available to this member | `lib/studio/moduleDefinitions.ts` |
| What you can do today | See §4. | LIVE only | — |
| What is not decided | "How access works, and what it includes at each level, has not been set." No price, no tier names, no dates. | — (honest silence) | stewardship model undecided |

**Failure test:** remove every unbuilt layer — the page must still be true. If a sentence only holds after paid tiers, Reflect, or a sample studio exist, it does not ship.

## 4. "A few things to try" — the open product question

Today, for a member with no practitioner record and no entitlement, the only thing that is real and available is the **existing free MAIA encounter** (`/maia`). So the honest "today" action is:

> *Talk with MAIA about your practice.* (opens the free encounter; stores nothing new; imports nothing into any professional field)

That is thin on purpose. Candidates that would make it richer, each with its dependency — **founder to choose, none assumed**:

| Candidate | State | Dependency |
|---|---|---|
| Talk with MAIA about your practice | LIVE | none |
| Reflect-first arrival (`/pro-studio/reflect`) | **HELD** (#1816, beta flag) | founder lifts hold — ⛔ this page must not silently unlock it |
| Read-only sample studio on fictional data | NOT BUILT | design + fictional-data fixtures + no member data |
| Limited real studio (a few modules, no clients) | NOT BUILT | tier limits undecided; practitioner-row provisioning is the legacy G2-held path |

### 4a. Founder direction (2026-10-30): both, staged

- **Stage 1 — now:** "Talk with MAIA about your practice" is the only try-action. Nothing new is needed beyond the page and its Experience Contract.
- **Stage 2 — later, separate design:** a read-only sample studio on fictional data, so a member can see the shape of the studio without a practitioner record. ⛔ Not part of Stage 1; the page must not mention it until it exists (failure test).
- Reflect-first stays HELD. A real limited studio stays undecided with the tier limits.

## 5. Hard prohibitions

No enrollment button · no practitioner creation (`/api/studio/personal/enter` is never called) · no form, waitlist or interest capture (collecting a sovereign act needs its own consent design) · no price, tier name, trial length or feature-limit claim · no upsell pressure or lock-screen framing · no fake preview data · no use of practitioner row, `studioMode` or any subscription claim as authority · no change to free MAIA continuity or Sanctuary behaviour.

## 6. Acceptance (each with a defeat candidate)

1. Signed-out render reads no member data — *defeat:* a version that calls the session loader for signed-out visitors.
2. The page issues no write and never calls practitioner provisioning — *defeat:* a CTA wired to `personal/enter`.
3. Module list is derived from `MODULE_DEFINITIONS` — *defeat:* a hand-copied list.
4. No unbuilt capability is stated as available — *defeat:* copy mentioning tiers, Reflect, or a sample studio.
5. Renders correctly at desktop and mobile widths with the Experience Contract (`docs/design/contracts/`) committed — the design-canon gate requires this for any member-facing surface.
6. Founder/member **experiential witness** of the limited-try state — mechanism tests cannot substitute for how it feels.

## 7. Not decided here

What "limited" includes · the entitlement source and key (`resolveEntitlements` knows only `labs.preview`) · the destination mapping for `full_workspace` · Personal Portal's separate Home door and its entry (G1/G2 hold) · naming. Stewardship model governs the first three.

## 8. Owed before build

Founder choice in §4 · Experience Contract · a verified route for `full_workspace` or an explicit "not yet" · rendered evidence (not produced in this session — no page exists).

## 9. Founder ruling (2026-10-30) and entitlement provenance finding

**Ruling.** The free learn-and-try Pro Studio is an **exploration path, not a fifth professional membership category**; the four canon paths (paid, scholarship, Practice Exchange, apprenticeship) are intact. It does **not** count toward the 20–30% supported-seat cap. Initial release uses only capabilities that have passed their existing acceptance/release gates — a launch boundary, not a permanent limit. Reflect beta stays closed. Personal Portal stays independent with full foundational MAIA depth and continuity. Pricing and final capability allocations: separate decision.

**Provenance finding (read-only, source at this branch):**
- `members.tier` is server-derived (`lib/auth/verifiedAccess.ts`; values `free|personal|pro`) and the Stripe webhook (`app/api/stripe/webhook/route.ts`) verifies its signature and writes `tier`, `subscription_active`, `subscription_expires_at`. Cancellation downgrades to `free`.
- ⚠️ But `tier = 'pro'` is **not proof of current payment or professional authorization**: (1) the checkout handler takes `tier` and `memberId` from session metadata; (2) `subscription_expires_at` is a **fallback estimate** (now + 1 month/year), not the Stripe period end; (3) `subscription_active` has no reader outside the webhook and an admin list; (4) a hand-set `tier` is indistinguishable from a paid one.
- ⚠️ **Scholarship, Practice Exchange and apprenticeship have no representation** in schema or source. A member receiving full professional access through those paths could only be given `tier='pro'` — identical to a paying member. So a single `tier` value cannot be the entitlement.
- Legacy prices in `lib/auth/tierAccess.ts` ($9 Personal, $35 Pro) differ from the Sanctuary Economy structure and must not silently become stewardship prices.

**Consequence for the resolver:** `proStudioEntitlement: 'verified'` must come from a **dedicated, provenance-bearing grant** (path: paid | scholarship | exchange | apprenticeship; current; revocable; who granted), not from `members.tier`. That grant does not exist yet. Until it does, production callers pass `'absent'` and every signed-in member gets the limited entry. Also: an entitlement to the workspace confers no client-data or Co-lab permission.
