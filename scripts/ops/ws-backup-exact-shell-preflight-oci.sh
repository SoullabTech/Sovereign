#!/usr/bin/env bash
# WS-BACKUP-OPS-02 — exact held-shell preflight in NO-NETWORK disposable OCI.
# PRE-REVIEW ENGINEERING FIXTURE ONLY. NO backup run, cron edit, NAS mount,
# member data, source vault, database, private key, or production change.
#
# The installed root writer has NO preflight mode and is NOT executed here.
# The independently held candidate is run with --preflight only, inside
# a container that has no Docker socket, no LAN, no host NAS/db mounts,
# and read-only access exclusively to a synthetic test script/bin folder.
#
# Non-goal: no real PostgreSQL dump or Source-vault recovery validation.
set -Eeuo pipefail
umask 077

[[ "$#" -eq 0 ]] || { echo "STOP: this probe accepts no arguments"; exit 2; }
readonly CANDIDATE=/home/soullab/maia-backup-hardened-20261011.sh
readonly LIVE=/usr/local/bin/maia-backup
readonly INSTALLER=/home/soullab/install-maia-backup-hardened-20261011.sh
readonly CANDIDATE_SHA=a43e6d0fd8ada224764f18bf661417d3a5836c6d9abeff6a81062ee04d2e002f
readonly LIVE_SHA=5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f
readonly INSTALLER_SHA=81da5d86c170fddd447c3d62ea13ebeba9c5534a6f4e7d39c4c123a27bb3d0f4
readonly IMAGE=node:22-slim

fail(){ echo "STOP: $*" >&2; exit 2; }
[[ "$(id -u)" != 0 ]] || fail "Do not launch as host root"
for f in "$CANDIDATE" "$LIVE" "$INSTALLER"; do [[ -f "$f" ]] || fail "Missing pinned source";done
[[ "$(sha256sum "$CANDIDATE" | awk '{print $1}')" = "$CANDIDATE_SHA" ]] || fail "Held candidate drift"
[[ "$(sha256sum "$LIVE" | awk '{print $1}')" = "$LIVE_SHA" ]] || fail "Live root writer drift"
[[ "$(sha256sum "$INSTALLER" | awk '{print $1}')" = "$INSTALLER_SHA" ]] || fail "Installer STOP R20 drift"
grep -q 'STOP R20:' "$INSTALLER" || fail "Installer has lost its STOP R20"
bash -n "$CANDIDATE"
bash -n "$INSTALLER"
command -v docker >/dev/null || fail "Docker unavailable"
docker image inspect "$IMAGE" >/dev/null 2>&1 || fail "Local OCI fixture image missing; refuse network pulls"

SCRATCH="$(mktemp -d /tmp/ws-exact-shell-guard.XXXXXXXX)"
cleanup() { rm -rf -- "$SCRATCH"; }
trap cleanup EXIT
mkdir -m 0700 -p "$SCRATCH/mock-bin"
cp -- "$CANDIDATE" "$SCRATCH/held-candidate.sh"
[[ "$(sha256sum "$SCRATCH/held-candidate.sh" | awk '{print $1}')" = "$CANDIDATE_SHA" ]] || fail "Fixture copy mismatch"
chmod 0600 "$SCRATCH/held-candidate.sh"

# Only these three fixture stubs are substituted. An actual Docker client,
# NAS share or PostgreSQL connection is entirely unavailable in-container.
cat > "$SCRATCH/mock-bin/docker" <<'SH'
#!/bin/sh
if [ "$1" = exec ] && [ "$2" = maia-postgres ] && [ "$3" = pg_isready ]; then
  [ "$WS_FIXTURE_CASE" != "pg_down" ] && exit 0
  exit 21
fi
echo "REFUSED: unexpected synthetic Docker invocation" >&2
exit 22
SH
cat > "$SCRATCH/mock-bin/findmnt" <<'SH'
#!/bin/sh
[ "$*" = "-rn -M /mnt/ds225 -t cifs -o SOURCE" ] || exit 23
if [ "$WS_FIXTURE_CASE" = wrong_source ]; then
  echo '//198.51.100.7/untrusted-synthetic'
else
  echo '//192.168.4.42/soullab-backups'
fi
SH
cat > "$SCRATCH/mock-bin/df" <<'SH'
#!/bin/sh
if [ "$*" = "-Pk /mnt/ds225" ]; then
  echo 'Filesystem 1024-blocks Used Available Capacity Mounted on'
  if [ "$WS_FIXTURE_CASE" = low_space ]; then
    echo 'synthetic 4096000 3000000 1096000 73% /mnt/ds225'
  else
    echo 'synthetic 30960000 1000000 29960000 4% /mnt/ds225'
  fi
  exit 0
fi
exec /usr/bin/df "$@"
SH
cat > "$SCRATCH/mock-bin/rsync" <<'SH'
#!/bin/sh
echo 'REFUSED: rsync must never run during preflight'
exit 24
SH
chmod 0700 "$SCRATCH/mock-bin/"*

case_count=0
for scenario in nominal pg_down wrong_source low_space missing_folder; do
  # This is the only location from the host mounted into the container:
  # a brand-new temp folder containing a copied shell source and fake tools.
  # NO bind-mounted host /mnt, /var/run/docker.sock, home or DB directory.
  set +e
  output="$(docker run --rm --pull never --network none --read-only \
    --cap-drop ALL --security-opt no-new-privileges \
    --pids-limit 64 --memory 512m --cpus 1 \
    --env WS_FIXTURE_CASE="$scenario" \
    --mount "type=bind,source=$SCRATCH,target=/fixture,readonly" \
    --mount "type=bind,source=$SCRATCH/mock-bin,target=/usr/local/bin,readonly" \
    --tmpfs /mnt/ds225:rw,nosuid,nodev,size=64m,mode=0700 \
    --tmpfs /tmp:rw,nosuid,nodev,size=32m,mode=01777 \
    "$IMAGE" /bin/bash -c '
      set -Eeuo pipefail
      [[ ! -S /var/run/docker.sock ]] || { echo "DANGER: real Docker socket visible"; exit 31; }
      [[ ! -e /app/data/vault ]] || { echo "DANGER: real vault path visible"; exit 31; }
      [[ "$WS_FIXTURE_CASE" = missing_folder ]] || mkdir -p \
          /mnt/ds225/maia-backups/{postgres,media,manifests}
      /bin/bash /fixture/held-candidate.sh --preflight
    ' 2>&1)"
  rc=$?
  set -e
  if [ "$scenario" = nominal ]; then
    [[ "$rc" -eq 0 && "$output" == *"PREFLIGHT ONLY: no backups or existing data modified"* ]] ||
      { echo "FAIL: nominal mock preflight unexpectedly refused (rc=$rc)"; exit 4; }
    echo "PASS fixture nominal: exact candidate preflight completes on mocks"
  else
    [[ "$rc" -ne 0 ]] || { echo "FAIL: case $scenario did not refuse"; exit 4; }
    echo "PASS fixture $scenario: exact candidate refused (rc=$rc)"
  fi
  case_count=$((case_count+1))
done

echo "EXACT HELD SHELL PREFLIGHT IN ISOLATED OCI: $case_count/$case_count PASS"
echo "Scope: mock SMB/pg, no actual backup, source, NAS, Docker or PostgreSQL read"
echo "CANDIDATE STILL HELD: STOP R20 remains in force; no install, merge or release."
