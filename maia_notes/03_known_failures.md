# Known Failures — Symptoms → Cause → Fix

> Last updated: 2026-01-14

---

## AUTH-001: Password reset says "success" but no email arrives

- **Pattern:** User requests password reset, sees success message, never gets email
- **User phrasing:** "I tried to reset my password but it's not sending me the email"
- **Likely cause:** User has passkey but never completed registration (no `members` row)
- **Best response:** "It looks like you haven't completed registration yet. Check your email — we've sent your passkey so you can finish setting up your account at soullab.life/begin"
- **Product fix:** Reset endpoint now checks `gift_passkeys` and sends passkey reminder if unregistered
- **Status:** FIXED (2026-01-14)
- **Owner:** Claude Code

---

## AUTH-002: "Invalid username or password" for MAIA-PAI users

- **Pattern:** User who used MAIA-PAI tries to sign in with old credentials
- **User phrasing:** "It won't take my email and password"
- **Likely cause:** MAIA-SOVEREIGN is a new system; old accounts didn't migrate
- **Best response:** "This is our new MAIA system — your MAIA-PAI account didn't carry over. Use your passkey [SOULLAB-NAME] at soullab.life/begin to create your new account."
- **Product fix:** Consider adding "Were you a MAIA-PAI user?" link on signin page
- **Status:** MITIGATED (messaging fixed, UX enhancement pending)
- **Owner:** TBD

---

## AUTH-003: 92% of beta testers haven't completed registration

- **Pattern:** Passkeys issued, emails sent, but users don't finish onboarding
- **User phrasing:** N/A (they just don't show up)
- **Likely cause:** Friction in flow, unclear next steps, passkey confusion
- **Best response:** N/A
- **Product fix:**
  - Smart password reset (done)
  - Smart account recovery (done)
  - Consider: Single "Get Started" button that auto-detects status
- **Status:** OPEN
- **Owner:** TBD

---

## VOICE-001: Voice mode cuts out mid-sentence

- **Pattern:** MAIA stops speaking before completing response
- **User phrasing:** "MAIA keeps cutting off"
- **Likely cause:** Audio buffer issues, network latency, browser audio API limits
- **Best response:** "Try refreshing the page. If it continues, switching to text mode will ensure you get complete responses."
- **Product fix:** Investigating audio streaming improvements
- **Status:** OPEN
- **Owner:** TBD

---

## Template for New Entries

```markdown
## [CATEGORY]-[NUMBER]: [Short title]

- **Pattern:** (what keeps happening)
- **User phrasing:** (how they say it)
- **Likely cause:** (internal truth)
- **Best response:** (what MAIA/support should say)
- **Product fix:** (what we'll change in the system)
- **Status:** OPEN / MITIGATED / FIXED
- **Owner:** (who's responsible)
```
