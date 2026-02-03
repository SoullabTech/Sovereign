# Checklists — Operational Procedures

> Last updated: 2026-01-14

---

## Support Triage Checklist

When a user reports an issue:

- [ ] Identify the issue category (auth, voice, app, other)
- [ ] Check if this matches a known failure in `03_known_failures.md`
- [ ] If auth issue: determine registration status (registered vs passkey-only)
- [ ] Provide response from `06_copy_snippets.md` if applicable
- [ ] If new pattern: note for potential addition to `04_patterns_across_users.md`

---

## New Known Failure Checklist

When documenting a new failure:

- [ ] Assign category prefix (AUTH, VOICE, APP, etc.)
- [ ] Assign sequential number within category
- [ ] Document the pattern (what keeps happening)
- [ ] Capture user phrasing (how they describe it)
- [ ] Identify likely cause (internal truth)
- [ ] Draft best response (what to tell users)
- [ ] Propose product fix (what to change)
- [ ] Set status (OPEN / MITIGATED / FIXED)
- [ ] Assign owner (who's responsible)

---

## Password Reset Debug Checklist

When reset email isn't arriving:

- [ ] Confirm exact email address (case-insensitive)
- [ ] Check if email exists in `members` table
- [ ] Check if email exists in `gift_passkeys` table
- [ ] If in `gift_passkeys` only → user needs to register, not reset
- [ ] Check Resend dashboard for delivery status
- [ ] Check if email bounced or was blocked
- [ ] Have user check spam/junk folder

---

## Onboarding Drop-off Investigation

When investigating why users aren't completing registration:

- [ ] Check `gift_passkeys` for total passkeys issued
- [ ] Check `members` for total registered
- [ ] Calculate completion rate
- [ ] Review onboarding flow for friction points
- [ ] Check if passkey emails were delivered (Resend)
- [ ] Review any user feedback about the process

---

## Pre-Launch Checklist

Before any significant release:

- [ ] Run `npm run preflight` (sovereignty check)
- [ ] Run `npm run check:no-supabase`
- [ ] Test sign-in flow (new user)
- [ ] Test sign-in flow (returning user)
- [ ] Test password reset flow
- [ ] Test passkey recovery flow
- [ ] Verify voice mode basics
- [ ] Check error messages are helpful
- [ ] Review recent known failures for regressions

---

## Template for New Checklists

```markdown
## [Checklist Name]

When [situation]:

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
```
