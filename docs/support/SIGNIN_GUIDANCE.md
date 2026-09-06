# Sign-in guidance (member-facing)

**Use reactively.** Send this when a member asks how to sign in, or reports
trouble. Include it in a general tester sign-in communication if one is being
sent for an independent reason.

**Do not create a passkey-warning campaign.** As of 2026-08-28 a small number of
member accounts carry `has_webauthn = true` with zero credential rows in the
current store, so a biometric option can be offered where no credential backs
it. That is *exposure to a bad state, not observed harm*: nobody is locked out,
password and email-code both work, and — because there is no durable auth audit
substrate (`AUTH-AUDIT-01`) — we cannot tell whether anyone has attempted the
failing ceremony at all. Contacting those accounts specifically would name a
problem they may never have met, about a button whose unjustified offer simply
stops once AUTH-BIOMETRIC-01A repairs the derivation.

---

## Signing in to Soullab

**Email code** — enter your email, press Continue, and we'll send a 6-digit
code. Nothing to remember.

**Username and password** — choose "Sign in with username and password." If
you're unsure of either, reply and we'll help.

**Face ID / Touch ID** — biometric sign-in works only when a valid web passkey
has been set up for your account and is available on that browser/device. If it
isn't available, use email code or password instead.

If something doesn't behave the way this describes, tell us. That's useful
information, not a bother.

---

## Why it is worded this way

The third paragraph is deliberately conditional. An earlier draft opened with
"there are three ways in, and any of them works," which asserts availability
from the *presence of the option* rather than from an actual credential — the
same conflation AUTH-BIOMETRIC-01 exists to repair, reproduced in member-facing
copy. Availability of a button is not availability of a path.

The closing line is load-bearing. The defect that opened this whole thread
surfaced only because a tester eventually said something after months of
assuming the fault was hers. Members who believe a failure is their own mistake
do not report it, and unreported failures are indistinguishable from no
failures.

## Operator notes

- Biometric enrollment is **per device** and requires an existing signed-in
  session: sign in by another method, then Account → Security. A member cannot
  bootstrap it from a locked-out state.
- Native (iOS app) biometry and web passkeys are **separate credentials in
  separate stores**. Enrolling in the app does not enroll the browser. Until
  AUTH-BIOMETRIC-01A, that split is real and the honest answer to "but Face ID
  works in the app" is that the website uses a different credential.
- Email codes depend on the transactional email provider. If codes stop
  arriving, check provider capacity before treating it as an application fault
  — the 2026-08 outage was a billing quota, not code.
