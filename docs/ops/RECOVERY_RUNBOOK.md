# MAIA Recovery Runbook — Restore From Zero

**Audience:** anyone who has to bring MAIA back when Kelly is unreachable — written for Nathan. No prior ops expertise assumed. Follow it top to bottom; every command is copy-pasteable.

**Stage 0 principle (INFRA_STAGING_FOUR_TRIGGERS_2026-07-11.md):** buy reliability, not capacity. The risk we're covering is **data loss in a solo-operated self-hosted stack** — members' most intimate material lives in one PostgreSQL container on one small machine.

**Status (2026-07-11):** the full pipeline below was executed end-to-end and verified — encrypted backup created on minisforum, pulled to Mac Studio, restored into a scratch container, row counts matched exactly (members=82, member_memory_atoms=142, quick_journal_entries=5, user_tables=587).

---

## 1. The map — what exists and where

| Thing | Where | What it is |
|---|---|---|
| Production database | minisforum, Docker container `maia-postgres` | PostgreSQL 16 + pgvector; DB `maia_consciousness` (~1 GB). **The thing we protect.** |
| Nightly local backup | minisforum `~/MAIA-SOVEREIGN/database/backups/` | Unencrypted `.sql.gz`, 02:00 UTC cron, 30-day retention. Survives a bad migration, **not** a dead machine. |
| Encrypted offsite artifact | minisforum `~/backups/offsite/` → pulled to Mac Studio `~/MAIA-BACKUPS/offsite/` (→ optionally cloud via rclone) | `maia_<UTC>.dump.gpg` + `maia_<UTC>.manifest.txt`. GPG-encrypted **before** leaving the box. This is what you restore from. |
| Backup private key | Mac Studio `~/.maia-backup/` (keyring `gnupg/`, export `maia-backup-private.asc`, passphrase `passphrase.txt`) **+ Kelly's password manager (must exist — see §2)** | Decrypts backups. Never on minisforum. |
| Public key | repo: `scripts/ops/maia-backup-public.asc` | Safe to publish; encrypts backups on minisforum. |
| Scripts | repo: `scripts/ops/backup-offsite.sh`, `pull-offsite-copy.sh`, `restore-verify.sh`, `monitor-stack.sh` | The whole pipeline. Each has a header comment explaining itself. |

**Mental model:** minisforum encrypts with the *public* key and ships ciphertext. Only the *private* key (Mac Studio / password manager) can read it. So a stolen or dead minisforum, or a compromised cloud bucket, exposes nothing — and no unencrypted member data ever leaves owned hardware.

## 2. Key custody — read this before you need it

**Losing the private key = losing every offsite backup.** It is the single point of failure in this design, on purpose (that's what encryption means).

Must be true at all times:
1. Private key + passphrase live on Mac Studio at `~/.maia-backup/` (`chmod 600/700`).
2. A copy of `maia-backup-private.asc` **and** the contents of `passphrase.txt` are in Kelly's password manager (or printed + stored physically). **Kelly: if you haven't done this yet, do it today.**
3. The private key is **never** copied to minisforum or any cloud destination.

To re-import the key on a fresh machine:
```bash
mkdir -p ~/.maia-backup/gnupg && chmod 700 ~/.maia-backup ~/.maia-backup/gnupg
export GNUPGHOME=~/.maia-backup/gnupg
gpg --import maia-backup-private.asc     # will ask for the passphrase
```

## 3. Routine operations

### 3a. Take an encrypted backup now (on minisforum, safe anytime — read-only)
```bash
ssh soullab@minisforum 'bash ~/maia-ops/backup-offsite.sh'
```
Success looks like one `OK artifact=... members=N atoms=N ...` line. It dumps, encrypts, deletes the plaintext, writes a manifest, prunes old local artifacts.

### 3b. Pull the encrypted copy to Mac Studio
```bash
bash scripts/ops/pull-offsite-copy.sh
```
Rsyncs new artifacts to `~/MAIA-BACKUPS/offsite/` and verifies the sha256 against the manifest. If `RCLONE_REMOTE` is configured (see §6), it also relays to cloud from here — cloud credentials stay off the production host.

### 3c. Restore drill (do this QUARTERLY — a backup that has never been restored is a hope)
```bash
bash scripts/ops/restore-verify.sh ~/MAIA-BACKUPS/offsite/maia_<latest>.dump.gpg
```
Spins up a throwaway postgres on port 55432, decrypts, restores, compares row counts to the manifest, prints `RESULT: PASS` or `FAIL`, destroys the scratch container. Touches nothing else. If it says FAIL, treat it as a production incident: the backup chain is broken.

### 3d. Check stack health (on minisforum)
```bash
ssh soullab@minisforum 'bash ~/maia-ops/monitor-stack.sh'
```
Checks core containers, postgres liveness, disk (alert ≥90%), and that both backup kinds are fresher than 26h. Exit 0 = green.

## 4. FULL RESTORE FROM ZERO — minisforum is dead

Scenario: fire, theft, dead SSD. You have: a machine (the replacement, or temporarily Mac Studio), the repo on GitHub, an encrypted backup (Mac Studio vault or cloud), and the private key (§2).

**Step 0 — Breathe.** The data is safe in the encrypted artifact. Nothing below can make things worse; you are building a new copy, not touching the old one.

**Step 1 — Get a Linux box with Docker.** Ubuntu 22.04+; install Docker Engine + compose plugin (`https://docs.docker.com/engine/install/ubuntu/`). Create user `soullab`, add to `docker` group.

**Step 2 — Clone the repo.**
```bash
git clone git@github.com:SoullabTech/MAIA-SOVEREIGN.git ~/MAIA-SOVEREIGN
cd ~/MAIA-SOVEREIGN && git checkout clean-main-no-secrets
```

**Step 3 — Secrets.** The repo deliberately contains no secrets. Restore `.env.production` (and any Caddy secrets) from Kelly's password manager. Without this file the app containers will not start — stop and find it; do not improvise values.

**Step 4 — Start ONLY postgres, restore the data, then verify — BEFORE starting the app.**
```bash
docker compose -f docker-compose.production.yml up -d postgres   # service name for maia-postgres
# wait until ready:
docker exec maia-postgres pg_isready -U soullab -d maia_consciousness

# bring key + artifact to this machine, then:
export GNUPGHOME=~/.maia-backup/gnupg   # after §2 re-import
gpg --pinentry-mode loopback --passphrase-file ~/.maia-backup/passphrase.txt \
    -o /tmp/restore.dump --decrypt maia_<TIMESTAMP>.dump.gpg
docker exec -i maia-postgres pg_restore -U soullab -d maia_consciousness \
    --no-owner --no-privileges < /tmp/restore.dump
rm /tmp/restore.dump

# verify counts against the manifest file that travels with the artifact:
docker exec maia-postgres psql -U soullab -d maia_consciousness -c \
 "SELECT (SELECT count(*) FROM members) members, (SELECT count(*) FROM member_memory_atoms) atoms, (SELECT count(*) FROM quick_journal_entries) journal"
```
Numbers must match the manifest's `count_*` lines. If the fresh DB already has schema (migrations ran on boot), restore into a clean DB instead: `docker exec maia-postgres psql -U soullab -d postgres -c 'DROP DATABASE maia_consciousness' -c 'CREATE DATABASE maia_consciousness OWNER soullab'` first — only on the NEW machine.

**Step 5 — Start the rest of the stack.**
```bash
bash scripts/deploy-production.sh    # canonical full deploy: builds, tags, migrates
curl -k https://localhost/api/health # then externally once DNS is back
```

**Step 6 — Point the world at the new box.** Router: forward ports 80/443 to the new machine's LAN IP; set a DHCP reservation (the old trap: forward rule hard-coded to `192.168.0.104`). DNS for `soullab.life` is at eNom — it points at the LAN's public IP; only change it if the new box is at a different site. Caddy re-issues TLS certificates automatically once traffic arrives.

**Step 7 — Re-arm protection on the new host.** `scp` `scripts/ops/backup-offsite.sh`, `monitor-stack.sh`, and `maia-backup-public.asc` to `~/maia-ops/`, `gpg --import` the public key, run one backup, run one restore-verify from another machine, then reinstall the cron lines (§5). **You are not done until the new machine is itself backed up.**

**Time estimate:** 2–4 hours, dominated by machine setup and the app image build.

**What is lost:** everything since the newest artifact — up to 24h with the proposed schedule. Sanctuary sessions are never in backups by design (they are never stored at all).

## 5. Scheduling & alerting (PROPOSED — Kelly gates all cron changes on minisforum)

Proposed crontab additions on **minisforum** (`crontab -e`), keeping the existing 02:00 plain backup:
```cron
# Encrypted offsite artifact, nightly at 02:30 UTC (after the local backup)
30 2 * * * bash /home/soullab/maia-ops/backup-offsite.sh >> /home/soullab/maia-ops/backup-offsite.log 2>&1
# Stack monitor, hourly
0 * * * * bash /home/soullab/maia-ops/monitor-stack.sh >> /home/soullab/maia-ops/monitor.log 2>&1
```
On **Mac Studio** (pull + quarterly-drill reminder), e.g. via `crontab -e`:
```cron
# Pull encrypted artifacts every morning at 07:00 local
0 7 * * * bash /Users/soullab/MAIA-SOVEREIGN/scripts/ops/pull-offsite-copy.sh >> /Users/soullab/MAIA-BACKUPS/pull.log 2>&1
```

**Dead-man switch (recommended, ~5 min setup):** create three free checks at healthchecks.io (or self-hosted equivalent) — `maia-backup-offsite` (period 1 day, grace 6h), `maia-monitor` (period 1h, grace 30m), `maia-pull` (period 1 day, grace 12h) — with email/phone alerts to Kelly + Nathan. Put the ping URLs in `~/.maia-backup.env` on the respective machines:
```bash
# minisforum ~/.maia-backup.env
HEARTBEAT_URL=https://hc-ping.com/<uuid-backup>
HEARTBEAT_MONITOR_URL=https://hc-ping.com/<uuid-monitor>
# Mac Studio env for pull-offsite-copy.sh
HEARTBEAT_URL=https://hc-ping.com/<uuid-pull>
```
The scripts already ping these when set (and `<url>/fail` on failure). If a job silently stops running, the *absence* of pings raises the alert — no monitoring infra to maintain on our side. Sovereignty note: only timestamps leave the box, never content. Self-hosted alternative when ready: Healthchecks is open-source and can run in Docker on any second machine.

## 6. Offsite destination & retention policy

**Retention (policy of record):**
| Copy | Where | Keep |
|---|---|---|
| Nightly plain `.sql.gz` | minisforum (same disk) | 30 days (existing) |
| Encrypted artifact | minisforum staging | last 7 |
| Encrypted artifact | Mac Studio vault | indefinite until reviewed; prune manually below 100 GB |
| Encrypted artifact | cloud (when enabled) | 30 days rolling (`RCLONE_MIN_AGE_PRUNE=30d`) |
| Restore drill | quarterly | log the PASS date at the bottom of this file |

**Current state:** two physical machines, one site. **Gap to close: a true second location.** The pipeline is provider-agnostic by construction — everything ships ciphertext, so the destination needs zero trust. Options, in sovereignty order: (a) a Raspberry Pi / small box at a second physical site on Tailscale, pull model, zero third parties; (b) any rclone-supported object storage (Backblaze B2, Wasabi, Hetzner, S3) — set `RCLONE_REMOTE` in `~/.maia-backup.env` on Mac Studio (preferred: credentials stay off prod) or minisforum, install rclone, done. Swapping providers is a one-line change; nothing about the artifact format is provider-specific.

## 7. Drill log

| Date | Artifact | Result | Notes |
|---|---|---|---|
| 2026-07-11 | `maia_20260711T193337Z.dump.gpg` | **PASS** | First end-to-end proof: minisforum → Mac Studio → scratch pgvector:pg16; 82/142/5/587 exact match; spot check 82 non-empty passkeys. |
