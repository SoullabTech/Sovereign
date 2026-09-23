#!/bin/bash
# NAS-BACKUP-01/R2 — installer for the minisforum. ⛔ DO NOT RUN before founder review of the
# candidate. Run as soullab with sudo; every step is idempotent and prints what it does.
# It never deletes a backup, never touches maia-postgres, never edits /etc/fstab.
set -euo pipefail
[ "${R2_INSTALL_AUTHORIZED:-}" = "1" ] || { echo "refusing: set R2_INSTALL_AUTHORIZED=1 (founder act)"; exit 1; }
REPO="${REPO_DIR:-/home/soullab/MAIA-SOVEREIGN}"
cd "$REPO"
SHA=$(git rev-parse --short HEAD)
echo "== preserving the R1 authority"
sudo cp -n /usr/local/bin/maia-backup "/usr/local/bin/maia-backup.r1-$(date +%Y%m%d)" && echo "  kept /usr/local/bin/maia-backup.r1-$(date +%Y%m%d)"
echo "== installing R2 authority from repo @ $SHA"
sudo install -m 0755 scripts/ops/maia-backup-hardened.sh /usr/local/bin/maia-backup
sudo install -m 0755 scripts/ops/maia-restore-witness.sh /usr/local/bin/maia-restore-witness
sudo install -m 0644 scripts/ops/r2-deploy/cron.d/maia-backup /etc/cron.d/maia-backup
sudo install -m 0644 scripts/ops/r2-deploy/cron.d/maia-restore-witness /etc/cron.d/maia-restore-witness
echo "== forensic hold + state dir on the NAS"
mkdir -p /mnt/ds225/maia-backups/state /mnt/ds225/maia-backups/postgres/.incoming /mnt/ds225/maia-backups/postgres/.failed
cp -n scripts/ops/r2-deploy/HOLD /mnt/ds225/maia-backups/HOLD && cat /mnt/ds225/maia-backups/HOLD
echo "== user crontab: apply scripts/ops/r2-deploy/user-crontab.diff by hand (crontab -e)"
echo "== installed. Next: the R2 success witness (record §6)."
