# Incident: Resend key outage, 2026-09-29 → 2026-10-01

**Status:** ⛔ OPEN. The fix runbook is below; resolution is proved only by a new `accepted` ledger row.
**Severity:** P0. Email sign-in (codes, magic links, recovery) failed for every member for ~2.5 days.

## Timeline (UTC, from production evidence)

| When | Evidence |
|---|---|
| 2026-09-29 00:40:17 | Last `accepted` row in `email_delivery_attempts` (6 accepted in the 7-day window) |
| 2026-09-29 → 10-01 | 10 rows `refused · provider_auth`; the latest is the governed live proof at 2026-10-01 20:53:13 |
| 2026-10-01 | Founder runs the Resend `/domains` call from inside `maia-sovereign` and gets `400 API key is invalid` |
| 2026-10-01 | Key shape checked without printing the key: 36 chars, `re_` prefix, no padding, no quotes. So the key is not mis-edited; the key itself is dead |
| 2026-10-01 20:53:13 | Fresh POST to the live `/api/members/email-code` route for the founder's previously verified sign-in address returns `502 email_provider_refused`; ledger records a new `refused · provider_auth · auth:email-code` row. Incident remains OPEN. |

## Why the key died (cause investigation)

Two families of cause, with very different consequences:

- **Benign:** the key was revoked or regenerated in the Resend dashboard (possibly during the Proton setup). Rotating it closes the incident.
- **Exposure:** Resend participates in GitHub secret scanning and revokes keys found in **public** content. If that happened, the key leaked somewhere, and whatever else was there leaked with it.

**What this session established:**

1. ⚠️ **`SoullabTech/Sovereign` is a PUBLIC repository** (GitHub API: `visibility: public`). The automatic-revocation path is therefore live for anything pushed to it.
2. **No Resend key appears anywhere in the repository's git history**, across all fetched branches. The scan pattern was the real key shape (`re_` + 8 + `_` + 24) plus a broader mixed-case 30–40-char sweep, on a full (non-shallow) clone. Only locations and fingerprints were printed, never values. Every `.env*` file in history is a template (`.env.example` and the like); no `.env.production` was ever committed.
3. **Not covered by the git-history scan:** issue and PR bodies and comments, Actions logs, gists, force-pushed-away commits, and anything published outside GitHub. GitHub's native secret-scanning API reports that secret scanning is **disabled** on this repository, so there is no native alert ledger to consult. GitGuardian is scanning PRs separately.
4. **Gmail was searched from 2026-09-27 onward.** No Resend revocation/exposure notice and no GitHub secret-revocation notice was found. One GitGuardian email dated 2026-09-30 reported a `Generic Password` in PR #1533, commit `a292493c...`, `tests/constitutional/house-studio-crossing/walk/walk.cjs`. The flagged value is a hard-coded test-login password, not a Resend credential. It post-dates the start of the outage and does not explain the 2026-09-29 provider-auth failure.

**Still owed from the founder (decisive):**
- Resend dashboard → **API Keys**. Is the old key shown as deleted or revoked, and when? If Resend records a revocation source or timestamp, add it here.

**If any of these shows exposure:** rotating the Resend key is not enough. Find the exposing content, rotate every secret that lived alongside it, and record it here.

## Exposure census of the public repo (what IS exposed)

The same history scan covered Anthropic, GitHub, AWS, Twilio, Slack, Google and Stripe key shapes, Postgres URLs with passwords, and PEM private keys:

| Finding | Where | Severity | Action |
|---|---|---|---|
| **Let's Encrypt ACME account private key** (RSA, acct `2838776756`, created on the Mac Studio 2025-11-30) | `ssl/letsencrypt/config/accounts/…/private_key.json`, **on canonical today** | HIGH: anyone can act as this ACME account, e.g. to revoke certificates issued under it | 1) Deactivate on the Mac Studio: `certbot unregister --config-dir ~/MAIA-SOVEREIGN/ssl/letsencrypt/config` (with matching `--work-dir`/`--logs-dir` if it complains). 2) Commit `e95e578f6` untracks `ssl/`. Pull it AFTER deactivating, because the pull deletes the local copy. Production TLS is Caddy's own ACME account and is unaffected. |
| Self-signed `soullab.life` key + cert (expires 2026-11-30) | `ssl/privkey.pem`, history only (added `c99d6e5f2`, removed `1fd5db05f`) | LOW: self-signed, not served by Caddy | None beyond the history decision below |
| `sk-ant-…` strings | two test files | NONE: fixtures (`sk-ant-SECRETKEYVALUE-must-never-be-logged`, 27 chars; real keys are ~100) | None |

**Founder decision owed:** whether the repository should be public at all. Beyond secrets, it carries production witnesses, member-adjacent records and the whole programme record. Scrubbing history (BFG / `git filter-repo`) is a separate, destructive act. It also breaks every existing SHA cited across the docs, so it is not proposed here.

## Fix runbook

⚠️ `scripts/pre-deploy-gate.sh deploy-maia` is **retired** on canonical (DEPLOY-LANE-PREPARE-CUTOVER-SPLIT-01) and refuses to run. An earlier message in this session gave that command; it is withdrawn. A changed env var takes effect only when the container is recreated. A bare `docker compose up` would recreate it without the lane lock or a provenance check. So the governed path is:

```bash
# 0. New key in Resend (sending access, domain soullab.life is enough).
# 1. On minisforum: edit ~/MAIA-SOVEREIGN/.env.production → RESEND_API_KEY=re_…   (no quotes)
# 2. Prepare the commit that is ALREADY LIVE (no code change rides along):
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && SHA=$(docker exec maia-sovereign printenv GIT_COMMIT) && echo "live=$SHA" && scripts/pre-deploy-gate.sh prepare-maia "$SHA"'
# 3. Cut over (recreates maia with --force-recreate; reads .env.production from the runtime root):
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && SHA=$(docker exec maia-sovereign printenv GIT_COMMIT) && scripts/pre-deploy-gate.sh cutover-maia "$SHA"'
```

Why this path: `prepare-maia` and `cutover-maia` both take the deploy-lane lock. `cutover-maia` re-verifies the prepared candidate and provenance, recreates the container, and refuses to finish unless the running `GIT_COMMIT` equals the SHA. The quick lane refuses on pending migrations; if it does, **stop**. That means the live SHA and canonical have drifted, and redeploying the live SHA is still right, but the refusal must be read first.

## Proof of resolution (the only acceptable proof)

A successful API call is not proof that mail flows. After cutover:
1. Request a sign-in code for yourself at `/signin`.
2. Run:
   ```bash
   ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"SELECT state, failure_class, purpose, created_at FROM email_delivery_attempts ORDER BY created_at DESC LIMIT 3;\""
   ```
   The newest row must be `accepted`, with your sign-in purpose.
3. Confirm the code actually arrived in your inbox.

Then: members who tried to sign in between 09-29 and 10-01 received nothing. Consider a short note to the ~9 affected attempts' members via the ledger's `member_ref` (operators can correlate it; it is not an address).

## Why it went unseen, and the repair

The code announced the outage on every refused send (`[MAIA/email] TRANSPORT_DOWN`), into a log nobody reads. Every other alarm path travelled by email. The repair is **`scripts/ops/sentinel.sh`**: one independent channel (Twilio SMS) and two vantage points. Install steps are below.

- `primary` (minisforum cron, 15 min) checks four things: **email** (ledger refusals of class auth/quota/config), **backup** freshness, **replication** (`pg_stat_replication`, lag), and **disk**. It then commits one empty transaction as a heartbeat.
- `standby` (Hetzner standby cron, 15 min) is the **dead-man's switch**. If no commit has replayed from the primary within 45 minutes, it pages. That covers the primary down, the primary's sentinel stopped, or replication broken: three failures the primary cannot report itself.
- Pages are edge-triggered (once on red, once on recovery). A check that cannot run is RED. An undelivered page is retried on the next run.
- `scripts/ops/verify-sentinel.sh` passes **13/13** against stubs, including this incident's exact shape (0 accepted, 9 `provider_auth`). It is proven lethal: a sentinel that never pages fails it 10/13, and one that treats an unreadable ledger as green fails it 1/13.

**Install (founder act; not done by this session):**
```bash
# minisforum — check the channel exists (prints SET/UNSET only)
ssh soullab@minisforum 'docker exec maia-sovereign sh -c "for v in TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_FROM_NUMBER; do [ -n \"\$(printenv \$v)\" ] && echo \$v SET || echo \$v UNSET; done"'
# prove the channel, then schedule it
ssh soullab@minisforum 'SENTINEL_ALERT_PHONE=+1XXXXXXXXXX ~/MAIA-SOVEREIGN/scripts/ops/sentinel.sh test-alert'
# crontab -e on minisforum:
# */15 * * * * SENTINEL_ALERT_PHONE=+1XXXXXXXXXX $HOME/MAIA-SOVEREIGN/scripts/ops/sentinel.sh primary >> $HOME/.sentinel/log 2>&1
# crontab on the Hetzner standby (needs its own TWILIO_* env and a local psql that can read the standby):
# */15 * * * * . $HOME/.sentinel.env; $HOME/sentinel.sh standby >> $HOME/.sentinel/log 2>&1
```
Assumptions to confirm at install: backups land in `~/MAIA-SOVEREIGN/database/backups/maia_backup_*` (override with `SENTINEL_BACKUP_GLOB`). The standby's `psql -U postgres` reaches its local server (override with `SENTINEL_PSQL_STANDBY`).
