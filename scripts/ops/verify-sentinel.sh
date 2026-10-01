#!/usr/bin/env bash
# Proves scripts/ops/sentinel.sh pages on each failure it claims to catch,
# pages ONCE per transition, treats an unreadable check as RED, and retries a
# page the channel failed to deliver. Stubs psql and SMS; touches no database.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
pass=0; fail=0
ok(){ pass=$((pass+1)); echo "  ✓ $1"; }
no(){ fail=$((fail+1)); echo "  ✗ $1"; }

# stub psql: answers from $T/db.<kind>; exits 1 if the file says FAIL
cat > "$T/psql" <<'S'
#!/usr/bin/env bash
q="${@: -1}"; d="$(dirname "$0")"
case "$q" in
  *email_delivery_attempts*) f=email ;; *pg_stat_replication*) f=repl ;;
  *txid_current*) f=hb ;; *pg_last_xact_replay_timestamp*) f=deadman ;; *) f=other ;;
esac
v="$(cat "$d/db.$f" 2>/dev/null || echo FAIL)"; [ "$v" = FAIL ] && exit 1; echo "$v"
S
cat > "$T/sms" <<'S'
#!/usr/bin/env bash
d="$(dirname "$0")"; [ -f "$d/sms.broken" ] && exit 1; echo "$1" >> "$d/sms.log"
S
chmod +x "$T/psql" "$T/sms"
mkdir -p "$T/bk"; echo data > "$T/bk/maia_backup_1.sql.gz"
export SENTINEL_STATE_DIR="$T/state" SENTINEL_PSQL_PRIMARY="$T/psql" SENTINEL_PSQL_STANDBY="$T/psql" \
       SENTINEL_SMS_CMD="$T/sms" SENTINEL_BACKUP_GLOB="$T/bk/maia_backup_*" SENTINEL_DISK_PATHS="$T" \
       SENTINEL_DISK_MAX_PCT=100 SENTINEL_HOST_LABEL=test
green(){ echo "6|0" > "$T/db.email"; echo "1|3" > "$T/db.repl"; echo 1 > "$T/db.hb"; echo 60 > "$T/db.deadman"; }
run(){ : > "$T/sms.log"; bash "$HERE/sentinel.sh" "$1" >/dev/null 2>&1; echo $?; }
sms(){ [ -f "$T/sms.log" ] && wc -l < "$T/sms.log" | tr -d " " || echo 0; }

echo "sentinel verification"
green; [ "$(run primary)" = 0 ] && [ "$(sms)" = 0 ] && ok "all green: exit 0, no page" || no "all green"

echo "0|9" > "$T/db.email"
[ "$(run primary)" = 1 ] && grep -q "RED email" "$T/sms.log" && ok "2026-09-29 outage shape (0 accepted, 9 provider_auth) pages" || no "outage pages"
run primary >/dev/null; [ "$(sms)" = 0 ] && ok "still red: no repeat page" || no "repeat suppression"
green; run primary >/dev/null; grep -q "recovered email" "$T/sms.log" && ok "recovery pages once" || no "recovery page"

rm "$T/db.email"; run primary >/dev/null; grep -q "RED email: ledger unreadable" "$T/sms.log" && ok "unreadable ledger is RED, not green" || no "unknown is red"; green; run primary >/dev/null

echo "0|0" > "$T/db.repl"; run primary >/dev/null; grep -q "RED replication: no streaming standby" "$T/sms.log" && ok "no standby pages" || no "replication"
echo "1|900" > "$T/db.repl"; rm -rf "$T/state"; run primary >/dev/null; grep -q "replay lag 900s" "$T/sms.log" && ok "replication lag pages" || no "lag"; green; rm -rf "$T/state"

node -e 'const fs=require("fs"); const p=process.argv[1]; const t=(Date.now()-3*86400000)/1000; fs.utimesSync(p,t,t)' "$T/bk/maia_backup_1.sql.gz"; run primary >/dev/null; grep -q "RED backup" "$T/sms.log" && ok "stale backup pages" || no "backup age"
: > "$T/bk/maia_backup_1.sql.gz"; touch "$T/bk/maia_backup_1.sql.gz"; rm -rf "$T/state"; run primary >/dev/null; grep -q "backup is empty" "$T/sms.log" && ok "empty backup pages" || no "empty backup"
echo data > "$T/bk/maia_backup_1.sql.gz"; rm -rf "$T/state"

SENTINEL_DISK_MAX_PCT=0 bash "$HERE/sentinel.sh" primary >/dev/null 2>&1; grep -q "RED disk" "$T/sms.log" && ok "disk threshold pages" || no "disk"; rm -rf "$T/state"

echo 9000 > "$T/db.deadman"; [ "$(run standby)" = 1 ] && grep -q "no heartbeat from primary" "$T/sms.log" && ok "dead-man: stale primary heartbeat pages from the standby" || no "deadman"
rm "$T/db.deadman"; rm -rf "$T/state"; run standby >/dev/null; grep -q "standby postgres unreadable" "$T/sms.log" && ok "dead-man unreadable is RED" || no "deadman unknown"
green; rm -rf "$T/state"

echo "0|9" > "$T/db.email"; touch "$T/sms.broken"; run primary >/dev/null; rm "$T/sms.broken"
run primary >/dev/null; grep -q "RED email" "$T/sms.log" && ok "undelivered page is retried next run (state not advanced)" || no "retry after channel failure"

echo "$pass passed, $fail failed"; [ "$fail" -eq 0 ]
