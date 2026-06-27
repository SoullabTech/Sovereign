# CRON_SECRET Rotation Runbook — 2026-06-26

**Status:** PREPARED, not executed. No production change has been made. Run the
**Cutover** section only inside a deliberate maintenance window, after explicit go.

**Why:** the old `CRON_SECRET` was committed in plaintext at
`scripts/session-reminders-cron.sh:24` (now de-hardcoded on branch
`chore/rotate-cron-secret`). A committed secret must be treated as compromised
and rotated, then invalidated.

---

## Reference data (verified 2026-06-26, read-only audit)

| Item | Value |
|---|---|
| OLD secret fingerprint | `sha256[:12] = bde3a9738eba` |
| NEW secret fingerprint | `sha256[:12] = 321a27e7b969` |
| NEW secret staged at (local Mac, `600`, **not** in any git repo) | `/Users/soullab/maia-cron-secret.new` |
| Live source of truth | `~/MAIA-SOVEREIGN/.env.production` on `minisforum` (`600`) |

**The secret guards 3 routes**, all reading `process.env.CRON_SECRET`:
- `app/api/cron/session-reminders/route.ts`
- `app/api/cron/scheduled-sends/route.ts`
- `app/api/focus/process-reminders/route.ts`

**Compose wiring:** every service loads the secret via `env_file: .env.production`
(it is **not** `${CRON_SECRET}`-interpolated). Therefore a plain `up -d` may not
recreate containers on a file-content change — **`--force-recreate` is required**.

**The only validator that matters is the `maia` service** (the Next.js app); the
cron routes live there. `maia-api` / `maia-comms-worker` / `maia-embed-worker`
also carry the value via the shared env_file but do not validate these routes.

**Live callers already source from managed config — no script edits needed in prod:**
- `/home/soullab/maia-reminders-cron.sh` (cron `*/15`): runs the curl **inside**
  `maia-sovereign`, so its `$CRON_SECRET` IS the container env — caller and
  validator share one variable and can never mismatch. Immune to rotation.
- `/home/soullab/scheduled-sends-tick.sh` (cron `* * * * *`): greps
  `CRON_SECRET=` from `~/MAIA-SOVEREIGN/.env.production` fresh each run.

**Gap profile:** the `*/15` reminders cron has **no auth gap** (shared variable);
the only window is the few-seconds app restart, which yields a connection error
(not a 401), and the route is idempotent. The every-minute scheduled-sends could
see at most **one self-healing failed tick** during the restart; it recovers next
minute.

---

## Pre-flight (read-only — confirm green baseline)

```bash
ssh soullab@minisforum 'bash -s' <<"EOF"
echo "=== container started ==="; docker inspect maia-sovereign --format "{{.State.StartedAt}}"
echo "=== current secret fingerprint (expect bde3a9738eba == OLD) ==="
docker exec maia-sovereign printenv CRON_SECRET | tr -d "\n" | shasum -a 256 | cut -c1-12
echo "=== current .env.production CRON_SECRET line (masked) ==="
grep -nE "^CRON_SECRET=" ~/MAIA-SOVEREIGN/.env.production | sed -E "s/=.*/=<redacted>/"
echo "=== last reminder ticks ==="; tail -n 3 /home/soullab/maia-reminders.log
echo "=== last scheduled-sends ticks ==="; tail -n 3 /home/soullab/maia-scheduled-sends.log
EOF
```

Proceed only if the fingerprint is `bde3a9738eba` and the recent tick logs are healthy.

---

## Cutover (execute in the maintenance window)

### 1. Apply the new secret to `.env.production` (value passed via stdin, never argv)

```bash
# from the Mac:
cat /Users/soullab/maia-cron-secret.new | ssh soullab@minisforum 'bash -s' <<"EOF"
set -euo pipefail
NEWVAL="$(cat)"
f="$HOME/MAIA-SOVEREIGN/.env.production"
ts="$(date +%Y%m%d-%H%M%S)"
cp -p "$f" "$f.bak.$ts"
# canonical env_file format: unquoted KEY=VALUE (hex value, no special chars)
awk -v n="$NEWVAL" 'BEGIN{d=0} /^CRON_SECRET=/ && !d {print "CRON_SECRET=" n; d=1; next} {print}' "$f" > "$f.tmp"
mv "$f.tmp" "$f"; chmod 600 "$f"
echo "backup written: $f.bak.$ts"
echo -n "new .env.production fingerprint (expect 321a27e7b969): "
grep -E "^CRON_SECRET=" "$f" | head -1 | cut -d= -f2- | tr -d "\"'" | tr -d "\n" | shasum -a 256 | cut -c1-12
EOF
```

Confirm the printed fingerprint is `321a27e7b969` before continuing.

### 2. Recreate the app so it loads the new env (`--force-recreate` is mandatory)

```bash
# Required: recreate the validator (the maia app). env-only change → no --build.
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  docker compose -p maia-sovereign -f docker-compose.production.yml \
  --env-file .env.production up -d --force-recreate maia'

# Optional (thorough invalidation — also clears the old value from sibling
# containers that carry it via the shared env_file but do not validate it):
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && \
  docker compose -p maia-sovereign -f docker-compose.production.yml \
  --env-file .env.production up -d --force-recreate maia-api maia-comms-worker maia-embed-worker'
```

> Do **not** force-recreate `maia-postgres` / `maia-caddy` — they do not need the
> change and restarting them adds avoidable disruption.

---

## Verify

```bash
ssh soullab@minisforum 'bash -s' <<"EOF"
echo "=== app health ==="
docker exec maia-sovereign sh -c 'curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health'
echo "=== container fingerprint (expect 321a27e7b969 == NEW) ==="
docker exec maia-sovereign printenv CRON_SECRET | tr -d "\n" | shasum -a 256 | cut -c1-12
echo "=== positive auth, side-effect-free (type=none processes nothing) → expect 200 ==="
docker exec maia-sovereign sh -c 'curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/session-reminders?type=none"'
EOF
```

Then watch two real cron ticks land successfully (≤1 min for scheduled-sends, ≤15 min for reminders):

```bash
ssh soullab@minisforum 'tail -n 5 /home/soullab/maia-scheduled-sends.log; echo ---; tail -n 5 /home/soullab/maia-reminders.log'
```

### Optional explicit OLD→401 proof (old value derived from the backup, never typed here)

```bash
ssh soullab@minisforum 'bash -s' <<"EOF"
set -euo pipefail
bak="$(ls -t $HOME/MAIA-SOVEREIGN/.env.production.bak.* | head -1)"
OLDVAL="$(grep -E "^CRON_SECRET=" "$bak" | head -1 | cut -d= -f2- | tr -d "\"'" | tr -d "\n")"
echo -n "old bearer → expect 401: "
docker exec maia-sovereign sh -c "curl -s -o /dev/null -w '%{http_code}\n' -H \"Authorization: Bearer $OLDVAL\" 'http://localhost:3000/api/cron/session-reminders?type=none'"
EOF
```

A container fingerprint of `321a27e7b969` already proves the old value is gone
from the validator; this test is belt-and-suspenders.

---

## Rollback (if verify fails)

```bash
ssh soullab@minisforum 'bash -s' <<"EOF"
set -euo pipefail
f="$HOME/MAIA-SOVEREIGN/.env.production"
bak="$(ls -t $f.bak.* | head -1)"
cp -p "$bak" "$f"; chmod 600 "$f"
echo "restored from $bak"
EOF
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && docker compose -p maia-sovereign \
  -f docker-compose.production.yml --env-file .env.production up -d --force-recreate maia'
```

---

## Post-cutover

1. **Destroy the staged secret** once verified:
   `rm -P /Users/soullab/maia-cron-secret.new`
2. **Merge the script de-hardcode** (`chore/rotate-cron-secret`) into
   `clean-main-no-secrets` at your leisure. This is **repo hygiene only** — prod
   uses its own host scripts, so it is **not** part of this cutover.
3. **Remove stale `.bak` env files** from the prod host after a safe interval
   (they contain the old, now-invalid secret).

## Deferred / flagged for steward (not done here)

- **`.env.staging`** (`== OLD`, present locally and on the prod host) — if any
  staging stack is live, rotate it with **its own** fresh secret (repeat §1–2
  against `.env.staging` and its services); otherwise just overwrite the dead
  value for hygiene. **Decision pending.**
- **Git-history scrub** — the old value is committed in `clean-main-no-secrets`
  and ~all branch tips. Rewriting history across shared branches is disruptive
  (force-push, re-clones) and **needs explicit sign-off**. Recommended: **defer**
  — rotation + invalidation makes the committed value inert (it authenticates
  nowhere), so the scrub is optional hygiene, not a live security need.
  (Note: `git log -S/-G` pickaxe returned 0 for the value — a measurement quirk;
  the working-tree evidence via `git grep` is authoritative.)
