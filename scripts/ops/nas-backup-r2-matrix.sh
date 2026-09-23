#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# NAS-BACKUP-01 / R2 — falsifier matrix (§V F1–F9)
# Runs the R2 candidate (scripts/ops/maia-backup-hardened.sh) against injected
# faults in a throwaway directory tree. No NAS, no production, no docker daemon
# needed for F1–F5, F7, F8, F9. Faults are injected ONLY by PATH shims that
# stand in for docker · gzip · mv · sync · cp · du — the candidate carries no
# test switches. F6 needs a docker daemon (restore witness) and is reported
# NOT RUN, never PASS, where one is absent.
#
# The R2 GATE (what "reject" means): a run that CLAIMS "PostgreSQL backup
# complete" is accepted only if the final artifact exists, passes gzip -t, and
# the manifest carries a SHA256 equal to the artifact's actual digest. A run
# that does not claim success is accepted as a proper failure only if it left
# NO final artifact, NO manifest and NO state update behind.
# F9's defeat candidate is the R1 script itself (scripts/ops/minisforum-
# maia-backup.sh, paths parametrized by sed, nothing else changed).
# ═══════════════════════════════════════════════════════════════════════════════
set -u
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
CAND="$REPO/scripts/ops/maia-backup-hardened.sh"
OLD="$REPO/scripts/ops/minisforum-maia-backup.sh"
HEALTH="$REPO/scripts/ops/backup-health.sh"
WITNESS="$REPO/scripts/ops/maia-restore-witness.sh"
REAL_GZIP=$(command -v gzip); REAL_MV=$(command -v mv); REAL_CP=$(command -v cp); REAL_DU=$(command -v du)
export REAL_GZIP REAL_MV REAL_CP REAL_DU
digest_of() { if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi; }

PASS=0; FAIL=0; NOTRUN=0; ROWS=()
row() { ROWS+=("$(printf '%-6s %-9s %s' "$1" "$2" "$3")"); case "$2" in PASS) PASS=$((PASS+1));; FAIL) FAIL=$((FAIL+1));; *) NOTRUN=$((NOTRUN+1));; esac; }

make_shims() {  # $1 shim dir
  local d="$1"; mkdir -p "$d"
  cat > "$d/docker" <<'S'
#!/bin/bash
# fake docker: serves pg_dump and the media-volume inspect; nothing else
if [ "$1" = "exec" ] && [[ "$*" == *pg_dump* ]]; then
  case "${FAKE_DOCKER_MODE:-ok}" in
    fail) echo "pg_dump: error: connection to server failed" >&2; exit 1;;
    incomplete) echo "--"; echo "-- PostgreSQL database dump"; for i in $(seq 1 3000); do echo "INSERT INTO t VALUES ($i, 'row $i');"; done; exit 0;;
    *) echo "--"; echo "-- PostgreSQL database dump"; echo "--"; for i in $(seq 1 3000); do echo "INSERT INTO t VALUES ($i, 'row $i');"; done; echo "--"; echo "-- PostgreSQL database dump complete"; echo "--"; echo; exit 0;;
  esac
fi
if [ "$1" = "inspect" ]; then exit 1; fi
exit 1
S
  cat > "$d/gzip" <<'S'
#!/bin/bash
# compress path truncated when FAKE_GZIP_TRUNCATE=1; decompress/test pass through
if [ "${FAKE_GZIP_TRUNCATE:-}" = "1" ] && [[ " $* " == *" -c "* ]] && [[ " $* " != *"-cd"* ]] && [[ " $* " != *" -d "* ]] && [[ " $* " != *" -t "* ]]; then
  "$REAL_GZIP" "$@" | head -c 600; exit 0
fi
exec "$REAL_GZIP" "$@"
S
  cat > "$d/mv" <<'S'
#!/bin/bash
if [ "${FAKE_MV_FAIL:-}" = "1" ] && [[ "${@: -2:1}" == *.part ]]; then echo "mv: cannot move: Input/output error" >&2; exit 1; fi
exec "$REAL_MV" "$@"
S
  cat > "$d/sync" <<'S'
#!/bin/bash
# post-finalization corruption: truncate the final daily artifact after rename
if [ "${FAKE_SYNC_TRUNCATE:-}" = "1" ]; then for f in "$BACKUP_ROOT"/postgres/maia_*.sql.gz; do [ -f "$f" ] && head -c 1000 "$f" > "$f.x" && "$REAL_MV" -f "$f.x" "$f"; done; fi
exit 0
S
  cat > "$d/cp" <<'S'
#!/bin/bash
"$REAL_CP" "$@"; rc=$?
if [ "${FAKE_CP_CORRUPT:-}" = "1" ] && [[ "${@: -1}" == *weekly_* || "${@: -1}" == *monthly_* ]]; then printf 'CORRUPT' >> "${@: -1}"; fi
exit $rc
S
  cat > "$d/du" <<'S'
#!/bin/bash
# the R1 defeat: measure the file, but the NAS-resident bytes are not what was measured
if [ "${FAKE_DU_TRUNCATE:-}" = "1" ] && [[ "${@: -1}" == *.sql.gz ]]; then f="${@: -1}"; head -c 1000 "$f" > "$f.x" && "$REAL_MV" -f "$f.x" "$f"; echo "333M	$f"; exit 0; fi
exec "$REAL_DU" "$@"
S
  chmod +x "$d"/*
}

run_case() {  # $1 label  $2 script  env… ; sets RC LOGTXT ROOT
  local label="$1" script="$2"; shift 2
  local T; T=$(mktemp -d); ROOT="$T/nas/maia-backups"; local LOG="$T/backup.log"; SHIM="$T/bin"; make_shims "$SHIM"
  mkdir -p "$ROOT/postgres/.incoming" "$ROOT/postgres/.failed" "$ROOT/manifests" "$ROOT/state" "$ROOT/media"
  ( export PATH="$SHIM:$PATH" BACKUP_ROOT="$ROOT" MOUNT_POINT="" LOG_FILE="$LOG" "$@"; bash "$script" >"$T/out" 2>&1 ); RC=$?
  LOGTXT=$(cat "$T/out" 2>/dev/null)
}
finals()   { find "$ROOT/postgres" -maxdepth 1 -name 'maia_*.sql.gz' 2>/dev/null; }
claimed()  { grep -q "PostgreSQL backup complete" <<<"$LOGTXT"; }
gate() {  # prints ACCEPT / REJECT:<why>
  local f m sha
  if claimed; then
    f=$(finals | head -1); [ -n "$f" ] || { echo "REJECT:claimed-but-no-final"; return; }
    "$REAL_GZIP" -t "$f" 2>/dev/null || { echo "REJECT:claimed-but-artifact-corrupt"; return; }
    m=$(ls "$ROOT"/manifests/*.txt 2>/dev/null | head -1); [ -n "$m" ] || { echo "REJECT:claimed-but-no-manifest"; return; }
    sha=$(sed -n 's/^  SHA256: //p' "$m"); [ -n "$sha" ] || { echo "REJECT:manifest-has-no-digest"; return; }
    [ "$sha" = "$(digest_of "$f")" ] && echo ACCEPT || echo "REJECT:manifest-digest-mismatch"
  else
    [ -z "$(finals)" ] && [ -z "$(ls "$ROOT"/manifests/*.txt 2>/dev/null)" ] && [ ! -f "$ROOT/state/last-verified-backup.env" ] \
      && echo "ACCEPT-FAILURE" || echo "REJECT:failure-left-canonical-residue"
  fi
}

# ── REF ────────────────────────────────────────────────────────────────────────
run_case REF "$CAND"; g=$(gate)
if [ $RC -eq 0 ] && [ "$g" = ACCEPT ] && [ -f "$(finals | head -1).sha256" ] && [ -f "$ROOT/state/last-verified-backup.env" ]; then row REF PASS "happy path: exit 0, claimed, gate $g, sidecar + state written"; else row REF FAIL "rc=$RC gate=$g"; fi
# ── F1 dump failure ────────────────────────────────────────────────────────────
run_case F1 "$CAND" FAKE_DOCKER_MODE=fail; g=$(gate)
[ $RC -ne 0 ] && ! claimed && [ "$g" = ACCEPT-FAILURE ] && row F1 PASS "pg_dump exit 1 → rc=$RC, no claim, no final/manifest/state" || row F1 FAIL "rc=$RC claimed=$(claimed && echo y || echo n) gate=$g"
# ── F2 gzip failure (a: incomplete stream, b: truncated gzip) ──────────────────
run_case F2a "$CAND" FAKE_DOCKER_MODE=incomplete; g=$(gate)
[ $RC -ne 0 ] && ! claimed && [ "$g" = ACCEPT-FAILURE ] && row F2a PASS "no closing marker → rc=$RC, no claim, no residue" || row F2a FAIL "rc=$RC gate=$g"
run_case F2b "$CAND" FAKE_GZIP_TRUNCATE=1; g=$(gate)
[ $RC -ne 0 ] && ! claimed && [ "$g" = ACCEPT-FAILURE ] && row F2b PASS "truncated gzip stream → rc=$RC, no claim, no residue" || row F2b FAIL "rc=$RC gate=$g"
# ── F3 finalization failure ────────────────────────────────────────────────────
run_case F3 "$CAND" FAKE_MV_FAIL=1; g=$(gate)
[ $RC -ne 0 ] && ! claimed && [ "$g" = ACCEPT-FAILURE ] && [ -z "$(ls "$ROOT/postgres/.incoming" 2>/dev/null)" ] && row F3 PASS "rename to final fails → rc=$RC, no claim, staging cleaned" || row F3 FAIL "rc=$RC gate=$g"
# ── F4 post-write corruption ───────────────────────────────────────────────────
run_case F4 "$CAND" FAKE_SYNC_TRUNCATE=1; g=$(gate)
q=$(ls "$ROOT/postgres/.failed"/maia_*.sql.gz 2>/dev/null | head -1)
[ $RC -ne 0 ] && ! claimed && [ "$g" = ACCEPT-FAILURE ] && [ -n "$q" ] && row F4 PASS "artifact truncated after rename → rc=$RC, no claim, quarantined to .failed/" || row F4 FAIL "rc=$RC gate=$g quarantined=${q:-none}"
# ── F5 promotion corruption ────────────────────────────────────────────────────
run_case F5 "$CAND" BACKUP_DOW=7 FAKE_CP_CORRUPT=1
w=$(ls "$ROOT"/postgres/weekly_*.sql.gz 2>/dev/null | head -1)
[ $RC -ne 0 ] && [ -z "$w" ] && grep -q "promotion copy" <<<"$LOGTXT" && [ -z "$(ls "$ROOT"/manifests/*.txt 2>/dev/null)" ] && row F5 PASS "corrupt weekly copy → rc=$RC, copy removed, no manifest, daily itself still verified" || row F5 FAIL "rc=$RC weekly=${w:-none}"
# ── F7 missing NAS ─────────────────────────────────────────────────────────────
T7=$(mktemp -d); mkdir -p "$T7/notamount"
( export MOUNT_POINT="$T7/notamount" BACKUP_ROOT="$T7/notamount/maia-backups" LOG_FILE="$T7/log"; bash "$CAND" >"$T7/out" 2>&1 ); rc7=$?
[ $rc7 -ne 0 ] && ! grep -q "backup complete" "$T7/out" && [ ! -d "$T7/notamount/maia-backups" ] && row F7 PASS "unmounted NAS → rc=$rc7 before any write; MAIA untouched by construction (script only exits)" || row F7 FAIL "rc=$rc7"
# ── F8 stale health state ──────────────────────────────────────────────────────
T8=$(mktemp -d); R8="$T8/maia-backups"; mkdir -p "$R8/state" "$R8/postgres"; : > "$R8/postgres/maia_x.sql.gz"
h() { ( export BACKUP_ROOT="$R8" MOUNT_POINT="$1"; bash "$HEALTH" ); }
now=$(date -u +%Y-%m-%dT%H:%M:%SZ); old=$(date -u -d '-48 hours' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-48H +%Y-%m-%dT%H:%M:%SZ)
r_missing=$(h ""); printf 'BACKUP_PATH=%s\nVERIFIED_AT=%s\n' "$R8/postgres/maia_x.sql.gz" "$now" > "$R8/state/last-verified-backup.env"; r_cur=$(h "")
printf 'BACKUP_PATH=%s\nVERIFIED_AT=%s\n' "$R8/postgres/maia_x.sql.gz" "$old" > "$R8/state/last-verified-backup.env"; r_stale=$(h "")
printf 'WITNESS_RESULT=FAIL\nWITNESS_AT=%s\n' "$now" > "$R8/state/last-restore-witness.env"; r_wfail=$(h "")
r_unreach=$(h "$T8")
if [[ "$r_missing" == *"BACKUP=missing"*"RESTORE_WITNESS=absent"* ]] && [[ "$r_cur" == *"BACKUP=verified-current"* ]] && [[ "$r_stale" == *"BACKUP=stale"* ]] && [[ "$r_wfail" == *"RESTORE_WITNESS=failed"* ]] && [[ "$r_unreach" == *"BACKUP=unreachable"* ]]; then
  row F8 PASS "missing · verified-current · stale (48 h) · witness failed · unreachable all distinguished"
else row F8 FAIL "missing=[$r_missing] cur=[$r_cur] stale=[$r_stale] wfail=[$r_wfail] unreach=[$r_unreach]"; fi
# ── F9 competent wrong implementation (the R1 script) ──────────────────────────
T9=$(mktemp -d); sed -e "s|^BACKUP_ROOT=.*|BACKUP_ROOT=\"\$BACKUP_ROOT\"|" -e "s|^LOG_FILE=.*|LOG_FILE=\"\$LOG_FILE\"|" -e 's|^if ! mountpoint -q /mnt/ds225; then|if false; then|' -e 's|df /mnt/ds225|df "$BACKUP_ROOT"|' -e 's|df -h /mnt/ds225|df -h "$BACKUP_ROOT"|' "$OLD" > "$T9/old.sh"
run_case F9 "$T9/old.sh" FAKE_DU_TRUNCATE=1; g=$(gate)
if claimed && [[ "$g" == REJECT:* ]]; then row F9 PASS "R1 script under post-write truncation: claims success (rc=$RC, logs '(333M)') — R2 gate $g"; else row F9 FAIL "rc=$RC claimed=$(claimed && echo y || echo n) gate=$g"; fi
# ── F6 restore failure (needs a docker daemon) ─────────────────────────────────
if docker info >/dev/null 2>&1 && [ -f "$REPO/scripts/restore-governed.sh" ]; then
  T6=$(mktemp -d); R6="$T6/maia-backups"; mkdir -p "$R6/postgres" "$R6/restore-reports" "$R6/state"
  { echo "-- PostgreSQL database dump"; for i in $(seq 1 2000); do echo "INSERT INTO t VALUES ($i);"; done; echo "-- PostgreSQL database dump complete"; } | "$REAL_GZIP" -c | head -c 900 > "$R6/postgres/maia_bad.sql.gz"
  ( export BACKUP_ROOT="$R6" MOUNT_POINT="" REPO_DIR="$REPO" LOG_FILE="$T6/log" WITNESS_DUMP="$R6/postgres/maia_bad.sql.gz"; bash "$WITNESS" >"$T6/out" 2>&1 ); rc6=$?
  rep=$(ls "$R6"/restore-reports/*.txt 2>/dev/null | head -1)
  if [ $rc6 -ne 0 ] && [ -n "$rep" ] && grep -q "verdict:        FAIL" "$rep" && grep -q "WITNESS_RESULT=FAIL" "$R6/state/last-restore-witness.env" && ! grep -q "verdict:        PASS" "$rep"; then row F6 PASS "truncated dump → witness rc=$rc6, report verdict FAIL, state FAIL, no PASS anywhere"; else row F6 FAIL "rc=$rc6 report=${rep:-none}"; fi
else
  row F6 NOT-RUN "no docker daemon here — ⛔ not a pass; founder runs: WITNESS_DUMP=<18 Sep artifact> scripts/ops/maia-restore-witness.sh must FAIL"
fi

echo "NAS-BACKUP-01 / R2 falsifier matrix — $(date -u +%Y-%m-%dT%H:%M:%SZ) on $(hostname) ($(uname -s))"
printf '%s\n' "${ROWS[@]}"
echo "PASS=$PASS FAIL=$FAIL NOT-RUN=$NOTRUN"
[ "$FAIL" -eq 0 ]
