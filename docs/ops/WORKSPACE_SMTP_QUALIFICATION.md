# Google Workspace SMTP — Qualification Runbook

**Goal: transport plurality, not transport migration.** At the end of this,
Resend remains live primary and Workspace SMTP is a *proven* standby. Resend
stops being the only way MAIA can deliver an identity email.

This is deliberately not the MTA. Building sovereign transport under pressure is
how you get a rushed IP with no warmup delivering sign-in codes into spam.

## Why the relay, not smtp.gmail.com

`smtp-relay.gmail.com` is Workspace's application-sending path (≈10,000
recipients/day). `smtp.gmail.com` works but requires an **app password**, which
depends on 2-Step Verification and can be disabled outright by Workspace
security policy. Putting P0 identity mail behind a control an admin setting can
withdraw is a fragile foundation.

Either is enormous relative to Soullab's ~10 sends/week. Capacity is not the
point; independence is.

## Phase 0 · DNS facts — verify, never inherit

```bash
dig +short MX soullab.life
dig +short TXT soullab.life | grep -i spf
dig +short TXT _dmarc.soullab.life
for s in google default s1 k1 selector1 resend; do
  printf '%-11s %s\n' "$s" "$(dig +short TXT "${s}._domainkey.soullab.life" | head -c 90)"
done
```

| Record | Needed | If missing |
|---|---|---|
| MX → `aspmx.l.google.com` | domain is Workspace-hosted | relay is not available; stop |
| SPF contains `include:_spf.google.com` | Google authorised to send as the domain | **relay mail fails SPF and lands in spam** — the most likely failure of this whole exercise |
| `_dmarc` present | policy published | add before qualifying; DMARC failures are silent |
| `google._domainkey` | DKIM signing enabled | enable in Admin console → Apps → Gmail → Authenticate email |

An SPF record that already lists Resend must **add** Google, not replace it —
Resend stays primary throughout.

## Phase 1 · Qualify the path, without touching production

```bash
SMTP_HOST=smtp-relay.gmail.com SMTP_PORT=587 \
SMTP_USER=<sending identity> SMTP_PASSWORD=<relay secret> \
npx tsx scripts/witness/smtp-qualify.ts <from-address> <to-address>
```

Constructs `SmtpProvider` directly. It never reads or changes
`EMAIL_PROVIDER`, so production keeps sending through Resend while this runs —
qualification cannot cause an identity-mail outage.

Then confirm by eye, and be strict about it:

- [ ] arrived
- [ ] in the **inbox**, not spam
- [ ] headers show `spf=pass` `dkim=pass` `dmarc=pass` (Gmail → "Show original")

**A message that arrives in spam has NOT qualified.** Putting sign-in codes on
that path would lock members out more quietly than an outage would.

## Phase 2 · Prove the integrated path

Phase 1 bypasses `sendEmail` policy, lane resolution and the ledger by design.
Only a bounded production switch shows the whole path working.

1. Add the `SMTP_*` variables to `.env.production`, leaving `RESEND_API_KEY`.
2. Set `EMAIL_PROVIDER=smtp`.
3. Restart: `docker compose -f docker-compose.production.yml up -d --no-deps maia`
4. Trigger one P0 send (recovery to the test member).
5. Prove the ledger recorded the new transport:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT created_at, purpose, lane, provider, state FROM email_delivery_attempts
      ORDER BY created_at DESC LIMIT 3;\""
```

`provider = 'smtp'` and `state = 'accepted'` is the evidence. Confirm delivery
to the inbox as well.

6. **Switch back**: `EMAIL_PROVIDER=resend`, restart, confirm a send is
   `accepted` with `provider = 'resend'`.

Step 6 is not optional. This is qualification, not cutover — Workspace has no
warmed reputation as a Soullab sending path yet, and the standby's value is that
it is *proven*, not that it is *in use*.

## Result

```
Application
    ↓
Soullab provider boundary
    ├── Resend             ← live primary
    └── Workspace SMTP     ← qualified standby, one env var away
```

## Then: MAIL-04

Transport plurality removes a single point of failure. It does not answer *who
may cause Soullab to send mail* — the deeper boundary, and the one the incident
actually exposed. Qualification must not be allowed to postpone it.
