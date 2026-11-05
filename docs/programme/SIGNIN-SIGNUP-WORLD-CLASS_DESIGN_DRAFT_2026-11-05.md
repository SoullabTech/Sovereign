# Sign-in and sign-up: a design draft (DRAFT, 5 Nov 2026)

**Status:** design draft. **Section 6 principle RULED YES by the founder, 5 Nov 2026** (a member can recover without email, via passkeys and recovery codes, with the owner link as the human backstop). The ruling authorizes the principle only; every phase below still needs its own approval. Nothing here is authorized, built or deployed. It sits in the auth/mail lane
(AUTH-RETURN-01, MAIL-*); it is not a new lane and opens none.
**Occasion:** a beta tester (Cece) was locked out on 2 Nov. Cause: forgotten password with no working recovery.

## 1. Evidence (labelled by class)
| Fact | Class |
|---|---|
| Cece's account was healthy (role, bcrypt hash, no flags). Her last 4 attempts, 2 Nov, all failed `Invalid password`. Last success 25 Mar. No reset token had ever been requested. | runtime read (production, auth columns only) |
| Resend refuses every send (`provider_auth`, newest 29 Oct). No `smtp` attempt has ever existed. So self-serve reset email cannot be delivered. | runtime read |
| 94 members: 12 hold a passkey, 12 have no email on file, 6 signed in within 30 days, 55 never signed in. Among 49 beta testers: 1 has no email, 28 never signed in. | runtime read (aggregates) |
| The sign-in screen already offers email lookup, email code, password, Google and Apple (`components/auth/UnifiedAuth.tsx`). | code read (endpoints only; the component was not read end to end) |
| Your Proton SMTP plan restores **email-code sign-in only**. `auth:password-reset` and `auth:passkey-recovery` are probably outside its send boundary. | draft plan, unconfirmed |

Not established: why 55 members never signed in (invited and never returned, or blocked at the door?). That needs its own read before any claim.

## 2. What went wrong, in one line
Every recovery route ends in email, email has been down five weeks, and the password is the only credential most members hold.
The member did nothing wrong; the system had a single point of failure and no path to a human.

## 3. Principles (proposed)
1. **No single point of failure.** Every member always has at least two independent ways in, and a way to a human.
2. **One front door.** One field (email or username); the screen then offers only the methods this member actually has.
3. **Passkey first, password optional.** Passkeys cannot be forgotten, phished or reset-looped. The password remains as a fallback, never the only door.
4. **Recovery is a first-class flow, not an error message.** "Forgot" never dead-ends; failure names the next step honestly.
5. **A person can always be reached.** If automatic recovery is down, the screen says so plainly and offers a way to ask for help that does not need the thing that is broken.
6. **Sign-up is a threshold, not a form.** It collects the minimum, chooses a durable credential (passkey) at once, and verifies a recovery channel before the first session ends.
7. **Honest state.** The screen never says "link sent" if sending failed (the reset route already does this correctly; keep it).
8. **Sovereignty.** No third party in the trust path we cannot replace; email and OAuth are conveniences, not the only root of identity.

## 4. Target shape
- **Sign in:** identifier, then (a) passkey prompt if one exists, else (b) email code, with password as a visible secondary choice. Google/Apple remain for those who linked them.
- **Sign up:** invite/passkey-of-admission (existing `/begin` flow) -> name and email -> **create a passkey on this device** -> verify the email code -> add a second recovery route (second device, or recovery code shown once) -> done.
- **Recovery ladder:** passkey on another device -> email code -> one-time recovery codes -> owner-issued link (built, see 6) -> a named human. No rung requires a rung above it.
- **Recovery codes:** generated once at sign-up, hashed at rest, single use. This is the rung that survives a mail outage without staff.
- **Health surface:** an owner view of who has fewer than two working routes (no passkey, no verified email, no recovery code). This turns the Cece case into a list before it becomes a lockout.

## 5. Phases (each a separate approval, smallest reversible unit first)
| # | Unit | Depends on | Notes |
|---|---|---|---|
| 0 | Owner reset link (`POST /api/admin/members/reset-link`) | merge + deploy | Built, tested, unmerged. Stopgap for any lockout today. |
| 1 | Restore mail: Proton SMTP per the 31 Oct plan; **rule on `auth:password-reset` and `auth:passkey-recovery`** | founder credential + deploy | Without a ruling, forgot-password stays dead after the plan lands. |
| 2 | Honest recovery screen: when mail is refused, say so and show the human route | none | Copy and one branch; small. |
| 3 | Route-health report for owners (read-only) | none | Counts only, no content. Answers the 55-never-signed-in question too. |
| 4 | Recovery codes | schema migration (governed) | Needs its own deploy act; do not bundle. |
| 5 | Passkey at sign-up, passkey prompt at sign-in | WebAuthn already present (12 holders) | Raise passkey adoption from 12 of 94. |
| 6 | One-field front door consolidation | 2, 5 | Last, once routes are healthy; UI change, design-canon gate applies. |

## 6. Decision (RULED YES, 5 Nov 2026)
**Should a member be able to recover their own access without email?** Recommended ruling: **yes, via recovery codes and passkeys (phases 4 and 5),
with the owner link as the human backstop.** This is the one choice that decides whether a future mail outage can lock anyone out again.

## 7. Not authorized by this draft
Any schema change, any change to mail identity or senders, any production env change, any member-visible UI, any deploy, any read of member
conversations. Phase 0 is built but unmerged. All numbers above are a single read on 5 Nov 2026 and will drift.
