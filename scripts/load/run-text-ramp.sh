#!/usr/bin/env bash
# run-text-ramp.sh — unattended, self-cleaning text concurrency ramp (runs ON minisforum).
# Creates a labeled load-test member, ramps 1->5->10->25->50 sanctuary turns in-container,
# samples DB conns + app CPU/mem throughout, scrapes Claude-only latency from logs,
# then PURGES the member + this run's sanctuary rows (cleanup runs even on failure).
#
# Installed as a self-removing cron one-shot by schedule step. Result -> $DIR/result-*.md
set -uo pipefail

# cron runs with a minimal PATH — make docker/crontab/etc resolvable
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SELF_MARK="MAIA-LOADTEST-ONESHOT"
DIR=/home/soullab/text-ramp
TS=$(date -u +%Y%m%d-%H%M%S)
START_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
RESULT="$DIR/result-$TS.md"
SAMPLES="$DIR/samples-$TS.csv"
MEMBER_ID="a0adf00d-0000-4000-8000-000000000001"
PGT="docker exec maia-postgres psql -U soullab maia_consciousness -tA"
PGC="docker exec maia-postgres psql -U soullab maia_consciousness -c"
SAMPLER_PID=""

mkdir -p "$DIR"

# --preflight: validate auth+route+reachability with NO Claude spend, then exit (no cron touch, no ramp)
if [ "${1:-}" = "--preflight" ]; then
  $PGC "INSERT INTO members (id,passkey,username,password_hash,name,onboarded) VALUES ('$MEMBER_ID','ZZZ-PREFLIGHT','zzz_preflight','x','ZZZ PREFLIGHT',true) ON CONFLICT (id) DO NOTHING;"
  docker cp "$DIR/text-ramp.cjs" maia-sovereign:/tmp/text-ramp.cjs >/dev/null
  docker exec -e PREFLIGHT=1 -e MEMBER_ID="$MEMBER_ID" maia-sovereign node /tmp/text-ramp.cjs
  $PGC "DELETE FROM members WHERE id='$MEMBER_ID';" >/dev/null
  exit 0
fi

# one-shot: remove our own cron entry immediately
( crontab -l 2>/dev/null | grep -v "$SELF_MARK" ) | crontab - 2>/dev/null || true

cleanup() {
  [ -n "$SAMPLER_PID" ] && kill "$SAMPLER_PID" 2>/dev/null || true
  {
    echo ""
    echo "## Cleanup"
    $PGC "DELETE FROM runtime_events WHERE member_id_prefix IS NULL AND created_at >= '$START_ISO';"
    $PGC "DELETE FROM members WHERE id = '$MEMBER_ID';"
  } >>"$RESULT" 2>&1 || true
}
trap cleanup EXIT

echo "# Text ramp result — $START_ISO" >"$RESULT"

# labeled load-test member (sanctuary turns never sign in; x-member-id only checks existence)
$PGC "INSERT INTO members (id,passkey,username,password_hash,name,onboarded) VALUES ('$MEMBER_ID','ZZZ-LOADTEST-$TS','zzz_loadtest_$TS','x','ZZZ LOAD TEST DELETE ME',true) ON CONFLICT (id) DO NOTHING;" >>"$RESULT" 2>&1

# background resource sampler (every 2s): epoch, db_conns, app cpu%, app mem
echo "epoch,db_conns,cpu_pct,mem" >"$SAMPLES"
( while true; do
    EP=$(date +%s)
    DB=$($PGT -c "select count(*) from pg_stat_activity" 2>/dev/null | tr -d '[:space:]')
    ST=$(docker stats maia-sovereign --no-stream --format '{{.CPUPerc}},{{.MemUsage}}' 2>/dev/null | tr -d ' ')
    echo "$EP,$DB,$ST" >>"$SAMPLES"
    sleep 2
  done ) &
SAMPLER_PID=$!

# run the ramp inside the app container
docker cp "$DIR/text-ramp.cjs" maia-sovereign:/tmp/text-ramp.cjs >>"$RESULT" 2>&1
echo "" >>"$RESULT"; echo "## Ramp" >>"$RESULT"
docker exec -e MEMBER_ID="$MEMBER_ID" -e LEVELS="1,5,10,25,50" maia-sovereign node /tmp/text-ramp.cjs >>"$RESULT" 2>&1

kill "$SAMPLER_PID" 2>/dev/null || true; SAMPLER_PID=""

# Claude-only latency from app logs (best-effort pattern)
{
  echo ""
  echo "## Claude log lines since $START_ISO"
  docker logs maia-sovereign --since "$START_ISO" 2>&1 | grep -iE "claude" | grep -iE "[0-9]+ ?ms" | tail -120
} >>"$RESULT" 2>&1 || true

# resource peaks
{
  echo ""
  echo "## Resource peaks"
  echo "max db_conns: $(tail -n +2 "$SAMPLES" | cut -d, -f2 | grep -E '^[0-9]+$' | sort -n | tail -1)"
  echo "peak app cpu%: $(tail -n +2 "$SAMPLES" | cut -d, -f3 | tr -d '%' | grep -E '^[0-9.]+$' | sort -n | tail -1)"
  echo "samples: $SAMPLES"
} >>"$RESULT" 2>&1 || true

echo "" >>"$RESULT"; echo "RESULT_READY $RESULT" >>"$RESULT"
echo "DONE $RESULT"
