# Product Truths — How MAIA Works Today

> Last updated: 2026-01-14

## Authentication Model

### Passkeys
- Format: `SOULLAB-FIRSTNAME` (e.g., `SOULLAB-JASON`)
- Stored in: `gift_passkeys` table (before registration)
- After registration: linked to `members` table via `redeemed_by_member_id`

### Registration Flow
1. User goes to `soullab.life/begin`
2. Enters passkey → validates against `gift_passkeys`
3. Creates username + password
4. Completes onboarding steps
5. `members` record created with `onboarded: true`

### Sign In
- Uses username + password (not email)
- Validates against `members` table
- Password hashed with SHA256 + salt

### Password Reset
- Requires email to be in `members` table
- If email in `gift_passkeys` but NOT `members` → sends passkey reminder instead
- Always returns "success" to prevent email enumeration

### Account Recovery
- "Forgot passkey?" → sends passkey + username to email
- Same smart logic: checks both `members` and `gift_passkeys`

## What Migrated / Didn't Migrate

### From MAIA-PAI
- **Nothing migrated** — MAIA-SOVEREIGN is a fresh start
- Old MAIA-PAI accounts don't exist here
- Users must register new accounts with their passkeys

### User Data
- Conversation history: stored per-user in PostgreSQL
- Sanctuary sessions: NOT stored (by design)
- Preferences: stored in `member_preferences` and `member_settings`

## Canonical Links

- Main app: `soullab.life/maia`
- Sign in: `soullab.life/signin`
- Begin registration: `soullab.life/begin`
- Password reset: `soullab.life/reset-password`

## Email System

- Provider: Resend (not SMTP)
- From addresses: `noreply@soullab.life`, `kelly@soullab.life`
- Domain: verified on `soullab.life`

## Beta Mode

- Currently: `BETA_MODE = true`
- During beta:
  - Email not required for registration
  - Email verification not enforced
  - Minimum 4-character password
  - Passkey validation optional
