# MEMBER-ADULT-ACK-01: adults only, in each member's own words

**Date:** 2026-10-01
**Status:** BUILT on `claude/wonderful-newton-ddw3gx` · ⛔ NOT MERGED · ⛔ NOT DEPLOYED · ⛔ migration NOT APPLIED · ⛔ review-custody NOT YET RUN (runs on the final rebased SHA)

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

Tests: `lib/members/__tests__/adultAcknowledgment.test.ts` passed 17/17 in round one, and **34/34** after round two (cache, gate, guest and lint-shape cases; each cache rule was mutation-checked). A rule loosened on purpose (a truthy stand-in for confirmation, and no age floor) fails 3 of them. These ran under a Jest shim in this container, which has no project `node_modules`. An isolated strict `tsc` on the pure modules exits 0. ⚠️ The project `npm run typecheck` was **not** run here; the founder's run is the evidence of record.

## Second round (founder rulings, same day)

- **This branch is the single home for the 18+ work.** #1634 keeps only its profile-edit gate. #1636 records its disclosure acknowledgment in `member_acknowledgments`, not in separate storage.
- **The tone is launch scope, not clinical.** The founder chose the gates stay and only the wording changes. Copy now reads "Soullab is opening to adults first", with a younger members' space to follow "with its own entrance". "MAIA is not therapy or a substitute for professional care" belongs in #1636's disclosure.
- **Migration:** it opens with `BEGIN; SET LOCAL lock_timeout = '5s';` and #1622's lint passes on it.
- **Server enforcement at the MAIA conversation routes only** (`/api/sovereign/app/maia`, `/list`). A signed-in member's turn is refused (403 `ACKNOWLEDGMENT_REQUIRED`) until they hold every required acknowledgment. This closes the gap for OAuth, team-invite and Now What? members. An unreadable record refuses the turn (503); it never lets it through.
- **Cache:** acknowledgments are append-only, so "satisfied" is remembered per member and per required set. A database hiccup cannot take MAIA down for members already verified by the running process. Refusals and read failures are never cached. Adding a requirement re-checks everyone. ⚠️ A member not yet verified by the running process is still refused while the table is unreadable, for example right after a restart.
- **Client:** on that refusal, the chat says what happened, keeps the message for Resend, and re-opens the prompt. It never falls back to a canned reply in MAIA's name.
- **Guests:** they do not reach MAIA conversation. `/api/sovereign` requires a verified session at the proxy, and a test pins that no public rule shadows it. The routes' own guest branch is defensive only.
- **Dead forms:** `UnifiedAuthModal` (imported nowhere) and `/join/[token]` (account creation sends no passkey and fails; still linked from practice-field invite emails). The checkbox edits were reverted, and removal is logged as a separate item.
- **Teens:** path A (adults now, a teen entrance as its own later phase) is what is built. Path B (invite-only teens in this beta, with a guardian-consent kind, refused at the MAIA routes until #1633, and legal review) is ⛔ not started. It needs the founder's answer on cohort size and how the teens are known, plus the guardian-notification decision.

## What this does NOT cover, said plainly

- ~~Other ways to create an account do not ask at creation time.~~ Superseded by the MAIA-route enforcement above; the original text is kept below.
- **Other ways to create an account do not ask at creation time.** These are: Apple and Google OAuth (four routes), `register-email`, `register-local`, `members/enter`, team-invite register, `now-what/register`, and the cabin local store. Those members are asked by the sign-in prompt the first time they reach a member surface. The prompt is a **client-side ask, not server enforcement**: no API refuses a member who has not acknowledged. Server-side enforcement on member APIs would be a separate, larger change.
- `UnifiedAuthModal` and `/join/[token]` post to `/api/members/register` **without a passkey**, so they already fail admission today (400). ~~The checkbox keeps them honest.~~ The checkbox edits were reverted in round two; these are dead paths, logged separately.
- A member's birth date can still be set later (for example, through the BaZi profile). That never reopens youth onboarding, because routing checks the closed flag first.

## Deploy

This is a schema change. Under the 2026-09-07 finding, merging it to `clean-main-no-secrets` authorizes the next full deploy to apply it. Deploy requires the Review Custody migration gate and an explicit founder act.
