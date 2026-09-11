# INCIDENT — exposed member password, rotated

**2026-09-11T01:0xZ → 02:0xZ (2026-09-10 18:0x → 19:0x local).** CLOSED.

## What happened

A temporary password was set for a beta member to restore access after a lockout,
and the value was **written in plain text in an assistant conversation**. It was
therefore exposed to that transcript's storage and to anyone with access to it, and
was treated as compromised — **not because disclosure to a third party is known, but
because unknown disclosure cannot be excluded.**

## Resolution

Rotated by **replacing the credential with a high-entropy value generated inside the
production container**, so it never entered shell history, the `ssh` argv, or any
transcript. The generated value was suppressed from terminal output and **is held by
no one, including the operator.**

```
HEATHER ACCESS
identity              PRESERVED  (same members.id, same history)
previous password     INVALIDATED
replacement password  machine-generated · undisclosed · held by nobody
human password use    NONE REQUIRED
intended entry        email sign-in code
```

## ⚠️ Precision — what this did NOT do

**This did not remove password authentication.** It replaced one credential with
another the member will never use. **The legacy verifier is preserved**, and
`scripts/admin-reset.ts:43` writes it as a normal `bcrypt.hash(password, 12)` —
confirmed in source, not assumed.

> **Abolishing the password authenticator is an AUTH-DOOR-01 decision and must not
> be folded into an incident response.** An incident that quietly retires an
> authenticator has made an architectural ruling under operational cover.

Consistent with the 2026-09-11 password ruling: passwords are **legacy
authenticators retired per member, on evidence** — and this member now has a proven
alternative route (mail delivery to that address was witnessed three times the same
day), which is what makes the password path safely unusable rather than merely
unknown.

## What the member was told

> Go to soullab.life/signin, choose **"Email me a sign-in code instead"**, enter your
> email address, and type the 6-digit code.

**No username. No password.** The earlier instruction included both; it did not need
to.

## ⭐ Evidence carried to AUTH-DOOR-01 (not repaired here)

1. **The admin tool printed a username (`wbp` / `Wbp`) the intended door does not
   use.** The administrative workflow assumes the password/username model even when
   the member's actual path is email. **The legacy model leaks through operational
   surfaces, not only the front door.**
2. **`/signin` opens on the password form**, so every member routed to email codes
   needs an extra instruction — *"click Email me a sign-in code instead"*. **A small,
   repeated, measurable tax the open lane is charging.**

Neither is a defect in this member's account, and neither is repaired here.

## Standing

```
SECURITY INCIDENT   CLOSED — exposed credential invalidated
AUTH-DOOR-01        OPEN
ROTATION            do NOT repeat; the exposed value is dead
FIXTURE USE         the exposed value must never be reused as a test fixture
```

> **The durable architecture:** member identity persists → authenticators can be
> revoked or replaced → **no human-held password needs to be part of membership at
> all.**
