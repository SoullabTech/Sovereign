# Support Playbook — Decision Trees

> Last updated: 2026-01-14

---

## "I can't sign in"

### Triage Questions
1. Have you completed registration (created username + password)?
2. Are you using your username (not email) to sign in?
3. Did you use MAIA before (MAIA-PAI)?

### Decision Tree

```
User can't sign in
├── Never completed registration
│   └── "Go to soullab.life/begin and use your passkey to register"
│       └── Don't know passkey? → Use "Forgot passkey?" with email
│
├── Used MAIA-PAI before
│   └── "MAIA-SOVEREIGN is a new system. Your old account didn't migrate.
│        Use your new passkey at soullab.life/begin to create your account."
│
├── Forgot password
│   └── "Go to soullab.life/reset-password and enter your email"
│       └── No email received? See "Reset email not arriving"
│
└── Forgot username
    └── Use "Forgot passkey?" → sends passkey + username to email
```

---

## "Reset email not arriving"

### Check First
1. Is the email in spam/junk folder?
2. Is the email address correct (exact match)?

### Decision Tree

```
Reset email not arriving
├── User never registered (has passkey but no account)
│   └── System now sends passkey reminder automatically
│       └── User should go to soullab.life/begin with passkey
│
├── User registered but email typo
│   └── Admin: check members table for similar emails
│       └── Can manually update email if confirmed owner
│
├── Email in spam
│   └── Check spam folder, add noreply@soullab.life to contacts
│
└── Resend issue
    └── Check Resend dashboard for delivery status
        └── Bounced? → Email doesn't exist
        └── Blocked? → Domain issue
```

---

## "I used MAIA before / MAIA-PAI"

### The Truth
MAIA-SOVEREIGN is a completely new system. MAIA-PAI accounts did not migrate.

### Response Template
> "This is our new MAIA system — it's a fresh start with new features. Your previous MAIA-PAI account didn't carry over (different system entirely). The good news: you already have a passkey ready! Go to soullab.life/begin and use [THEIR_PASSKEY] to create your new account."

---

## "What's my passkey?"

### Lookup Steps
1. Check `gift_passkeys` table by email
2. Passkey format: `SOULLAB-FIRSTNAME`

### Response
If found: Tell them their passkey directly
If not found: "I don't see a passkey for that email. Were you invited to the beta?"

---

## "The app isn't working"

### Triage
1. Web or iOS app?
2. What specifically isn't working?
3. Any error messages?

### Common Issues
- **Voice not working** → Check microphone permissions
- **Page not loading** → Clear cache, try incognito
- **Can't hear MAIA** → Check volume, try different browser
- **Stuck on loading** → Refresh, check internet connection

---

## Internal Actions (What to do in the system)

### Check if user exists
```sql
SELECT * FROM members WHERE email ILIKE '%search%' OR username ILIKE '%search%';
```

### Check if passkey exists
```sql
SELECT * FROM gift_passkeys WHERE recipient_email ILIKE '%search%';
```

### Check registration status
```sql
SELECT
  gp.recipient_name,
  gp.recipient_email,
  gp.passkey,
  gp.redeemed_at IS NOT NULL as registered
FROM gift_passkeys gp
WHERE gp.recipient_email ILIKE '%search%';
```
