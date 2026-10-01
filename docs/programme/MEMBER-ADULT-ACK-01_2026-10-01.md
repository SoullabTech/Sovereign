# MEMBER-ADULT-ACK-01: adults only, in each member's own words

**Date:** 2026-10-01
**Status:** BUILT on `claude/wonderful-newton-ddw3gx` · ⛔ NOT MERGED · ⛔ NOT DEPLOYED · ⛔ migration NOT APPLIED

## Founder rulings

- **Youth is closed for now.** Every registration must confirm 18+. The youth path stays in code but is unreachable until it is deliberately reopened.
- **Each member's own record.** The founder's "all members are adults" attestation becomes each member's own record. Members confirm at registration. Existing members confirm once, at their next visit to a member surface.
- **The 18+ check applies to invitations now.**
- The "MAIA is not monitored" disclosure may share the prompt. Its kind is reserved; its copy is not yet written, so nothing records it.

⛔ This settles who may be a member. It does **not** settle crisis readiness. Typed turns still have no crisis coverage until #1633 and the disclosure ship, and crisis readiness is not recorded as satisfied.

## What changed

| Piece | Effect |
|---|---|
| `database/migrations/20261001000001_member_acknowledgments.sql` | Append-only `member_acknowledgments` (`adult_18_plus` · reserved `maia_not_monitored`; source `registration` or `sign_in_prompt`). UPDATE, direct DELETE and TRUNCATE are refused by triggers. The member row's own deletion cascades, so erasure is never blocked. **No backfill**: a member with no row has not acknowledged. |
| `lib/members/adultConfirmation.ts` | Pure rule. Only a literal `true` counts as confirmation. A birth date can only make the rule stricter: an under-18 date refuses even when the box is ticked, and an adult date never replaces the box. An unreadable date is refused, not ignored. |
| `app/api/members/register/route.ts` | Refuses without the confirmation (400, with `code`). This runs **before** invite admission, so a refused attempt spends no invite. The acknowledgment is recorded after the member row exists. |
| `app/api/members/acknowledgments/route.ts` | GET: what this member still owes. POST: records `adult_18_plus`. The member's identity comes from the verified session only. |
| `components/members/AdultAcknowledgmentGate.tsx` (mounted in `app/layout.tsx`) | One-time prompt on member surfaces (`/maia`, the studios, `/commons`, `/onboarding`). It never appears on public or sign-in pages. If the check cannot be made, it shows nothing and asks next time. |
| Registration forms | Checkbox with the exact words "I confirm I'm 18 or older." in `SacredSoulInduction`, `UnifiedAuthModal` and `/join/[token]`. |
| `lib/youth/youthAvailability.ts` + `/onboarding`, `/onboarding/youth` | `YOUTH_PATH_OPEN = false`. Any youth-tier member goes to the holding page. The youth page redirects even when opened by direct URL. |

Tests: `lib/members/__tests__/adultAcknowledgment.test.ts` passes 17/17. A rule loosened on purpose (a truthy stand-in for confirmation, and no age floor) fails 3 of them. These ran under a Jest shim in this container, which has no project `node_modules`. An isolated strict `tsc` on the pure modules exits 0. ⚠️ The project `npm run typecheck` was **not** run here; the founder's run is the evidence of record.

## What this does NOT cover, said plainly

- **Other ways to create an account do not ask at creation time.** These are: Apple and Google OAuth (four routes), `register-email`, `register-local`, `members/enter`, team-invite register, `now-what/register`, and the cabin local store. Those members are asked by the sign-in prompt the first time they reach a member surface. The prompt is a **client-side ask, not server enforcement**: no API refuses a member who has not acknowledged. Server-side enforcement on member APIs would be a separate, larger change.
- `UnifiedAuthModal` and `/join/[token]` post to `/api/members/register` **without a passkey**, so they already fail admission today (400). The checkbox keeps them honest. It does not make them work.
- A member's birth date can still be set later (for example, through the BaZi profile). That never reopens youth onboarding, because routing checks the closed flag first.

## Deploy

This is a schema change. Under the 2026-09-07 finding, merging it to `clean-main-no-secrets` authorizes the next full deploy to apply it. Deploy requires the Review Custody migration gate and an explicit founder act.
