# Member self-serve recovery: scoping note (DRAFT, 8 Nov 2026)

**Status:** read-only scope. Nothing here is authorized, built or deployed. Source read at `origin/clean-main-no-secrets`.
**Goal (founder):** *this runs effortlessly for members.* A member who cannot sign in should get back in without waiting for the founder.

## 1. What is true today (SOURCE reads unless marked)

| Fact | Where |
|---|---|
| The sign-in page's "forgot password" door goes to `/reset-password`, whose request form posts the member's email to `POST /api/members/reset-password`. | `components/auth/UnifiedAuth.tsx`, `app/reset-password/page.tsx` |
| That route creates a token, then sends mail with purpose `auth:password-reset`. | `app/api/members/reset-password/route.ts` |
| The deployed mail boundary admits **only** purpose `auth:email-code`, from `noreply@soullab.life`, to one address, bound to a pending row in `auth_email_challenges`, within a global budget of 30 a minute and 500 a day. Every other purpose is refused as `smtp_scope_refused`. | `lib/email/senderCapacity.ts` (`reserveManagedAuthSend`) |
| So **the forgot-password door is dead for every member.** A member who asks gets "Failed to send reset email ... contact support". Magic links (`auth:magic-link`) and passkey recovery are refused the same way. | the two sources above |
| **The email-code sign-in works** (witnessed 2026-11-05: ledger `smtp`/`accepted`, code received). | RUNTIME, founder confirmation |
| `POST /api/members/change-password` needs a signed-in session **and the current password**. A member who signed in by email code and never saw their generated password cannot use it. | `app/api/members/change-password/route.ts` |
| 12 of 94 members have no email on file (11 are test or system accounts, 1 is a real member); one email address is shared by two accounts. | RUNTIME counts, 2026-11-06 |

## 2. Two defects in the dead door itself (found while reading)

1. **It answers differently for members and non-members.** For an unknown address it returns 200 "If an account exists..."; for a real member whose mail is refused it returns **502** "Failed to send reset email...". Anyone can therefore tell whether an email belongs to a member. The comment above it ("always return success to prevent email enumeration") is not true on the refusal branch. This should be confirmed by a test against the route before it is called established.
2. **It logs the address.** The success path logs `Password reset email sent to: <email>`. Other auth routes redact addresses.

## 3. Options

**A. Make the email code the recovery door (recommended).**
- The "forgot password" link opens the existing email-code flow. No change to the mail boundary, which is the reviewed, rate-limited, hashed and expiring mechanism that already works.
- Keep `/reset-password?token=...` as the landing page for **founder-issued** reset links (it is what that route links to).
- Replace the reset request form with a pointer to the code flow, and make `POST /api/members/reset-password` answer identically whether or not the account exists, never log the address, and stop minting tokens it cannot send.
- Optional second step: let a member who has just signed in **by email code** set a new password without the old one (a short "recent email-code sign-in" window), so people who want a password can have one. Without it, such a member simply uses codes, which is how those accounts were designed.
- Not helped: members with no email on file, and the shared-email pair (they use username, or are fixed by hand).

**B. Widen the mail boundary to allow reset and magic-link mail.**
- Requires changing `reserveManagedAuthSend`, which is hard-wired to one purpose and to the `auth_email_challenges` table, plus an equivalent reservation and budget for reset tokens. Larger, riskier, and unnecessary if A is done. Also revisits the older "forgot passkey" route, which **emails the plaintext passkey** and should be retired in any case.

## 4. Recommended sequence (each step a separate approval)
1. **Fix the dead door (A).** One PR: link and copy change, the generic-response and no-address-logging fix to the reset POST, and tests that fail against today's code.
2. **Set a new password after an email-code sign-in.** One PR, with a short freshness window and a test that an older session cannot do it.
3. **A daily sign-in canary and a post-deploy check**, so a break is seen by us first.
4. **Retire the plaintext-passkey recovery route.**
5. Repair the 10 red sign-in and email-code test suites so these changes have a safety net.

## 5. Decisions needed from the founder
- Option A or B (A recommended).
- Whether members may set a password after an email-code sign-in (step 2), or whether codes alone are the intended design.
- Whether to retire the plaintext-passkey recovery route.

## 6. Not in this note
No code, no change to the mail boundary, no production change, no change to any member's account.
