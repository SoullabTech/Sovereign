# Decision Log — Why We Built It This Way

> Last updated: 2026-01-14

---

## DEC-001: Always return "success" on password reset

**Date:** 2026-01-14

**Decision:** Password reset endpoint always returns success message, regardless of whether email exists.

**Why:** Prevents email enumeration attacks. Bad actors can't probe which emails are registered.

**Trade-off:** Users don't get clear feedback when their email isn't in the system.

**Mitigation:** Smart reset now checks `gift_passkeys` and sends passkey reminder if user hasn't registered yet.

---

## DEC-002: Username-based sign-in (not email)

**Date:** 2026-01-XX

**Decision:** Users sign in with username + password, not email + password.

**Why:**
- Usernames are more personal/memorable for MAIA's context
- Separates identity (username) from contact (email)
- Allows email changes without affecting sign-in

**Trade-off:** Users must remember their username.

**Mitigation:** "Forgot passkey?" recovery sends both passkey AND username to email.

---

## DEC-003: Sanctuary sessions store no content

**Date:** 2026-01-XX

**Decision:** Sanctuary mode conversations are never stored, indexed, or used for patterns.

**Why:** Real honesty requires safety. People won't speak freely to a system that might later use their vulnerability.

**Trade-off:** No learning from sanctuary conversations.

**Mitigation:** This is intentional — the trade-off IS the feature.

---

## DEC-004: Smart password reset with passkey fallback

**Date:** 2026-01-14

**Decision:** If password reset email not found in `members` but found in `gift_passkeys`, send passkey reminder instead.

**Why:** 92% of beta testers haven't registered. They hit "reset password" thinking they have an account.

**Trade-off:** Slightly more complex reset logic.

**Mitigation:** Clean separation in code, clear UI states for each scenario.

---

## DEC-005: Fresh start from MAIA-PAI

**Date:** 2026-01-XX

**Decision:** No account migration from MAIA-PAI to MAIA-SOVEREIGN.

**Why:**
- Fundamentally different architectures
- Clean break enables better design decisions
- Existing user data in MAIA-PAI was minimal

**Trade-off:** Returning users must re-register.

**Mitigation:** Clear messaging about fresh start, passkeys already issued.

---

## Template for New Decisions

```markdown
## DEC-XXX: [Short title]

**Date:** YYYY-MM-DD

**Decision:** (What we decided)

**Why:** (The reasoning)

**Trade-off:** (What we gave up)

**Mitigation:** (How we addressed the trade-off)
```
