#!/usr/bin/env bash
#
# Install / refresh the MAIA Route 53 DDNS updater on minisforum.
#
# Run with sudo, ON minisforum, from the repo checkout:
#   sudo bash scripts/ops/route53-ddns/install.sh
#
# One-time prerequisites this script does NOT do for you:
#   1) AWS CLI v2 installed (confirmed here via `sudo snap install aws-cli
#      --classic` -> aws-cli/2.34.57). Verify with:  aws --version  # expect 2.x
#   2) Credentials file present at /etc/maia-ddns/credentials (mode 600, root):
#        AWS_ACCESS_KEY_ID=AKIA...
#        AWS_SECRET_ACCESS_KEY=...
#        AWS_DEFAULT_REGION=us-east-1
#        ROUTE53_HOSTED_ZONE_ID=Z...
#
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo: sudo bash $0"; exit 1; }

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

install -m 0755 "$SRC_DIR/maia-route53-ddns.sh"      /usr/local/bin/maia-route53-ddns.sh
install -m 0644 "$SRC_DIR/maia-route53-ddns.service" /etc/systemd/system/maia-route53-ddns.service
install -m 0644 "$SRC_DIR/maia-route53-ddns.timer"   /etc/systemd/system/maia-route53-ddns.timer

if [[ ! -r /etc/maia-ddns/credentials ]]; then
  echo "WARNING: /etc/maia-ddns/credentials not found."
  echo "         Create it (mode 600, root-owned) before the timer can do anything."
fi

systemctl daemon-reload
systemctl enable --now maia-route53-ddns.timer

echo
echo "Installed. Next:"
echo "  - Dry run once:   sudo systemctl start maia-route53-ddns.service"
echo "  - Read the log:   journalctl -u maia-route53-ddns.service -n 20 --no-pager"
echo "  - Timer schedule: systemctl list-timers maia-route53-ddns.timer --no-pager"
