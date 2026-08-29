#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Self-test for WITNESS-INSTRUMENT-V1
# ═══════════════════════════════════════════════════════════════════════════════
# Proves the instrument's refusals against throwaway fixtures — no docker daemon,
# no network, no production anything. What it asserts:
#
#   A. Candidate naming     — unnamed and bogus candidates are refused; a dirty
#                             tree is refused unconditionally, with no bypass
#                             token anywhere in the instrument.
#   B. Candidate immutability — the snapshot is the COMMIT's tree, not HEAD's;
#                             mutation of tree or snapshot is caught; a run
#                             cannot be re-pointed at a different SHA.
#   C. Production isolation — non-witness project / compose file / container
#                             names, the production DB, protected hosts,
#                             external networks, non-loopback and reserved
#                             ports, and writes inside a protected project dir
#                             are each refused.
#   D. Artifact assertion   — absent, universal, too-short, false-of-candidate,
#                             and non-discriminating assertions are refused.
#   E. Runtime provenance   — with no runtime, provenance is UNPROVEN and verify
#                             FAILS (exit 3). Health is never accepted as proof.
#   F. Evidence classes     — a run with no client capture is QUALIFIED
#                             (exit 4, EVIDENCE_COMPLETE=false), never complete.
#   H. Runtime attribution — the 2026-08-29 device-qualification defects:
#                             a run may not adopt another run's runtime, and
#                             collect may not qualify evidence from a runtime
#                             whose provenance is unproven. Driven against a
#                             FAKE daemon (WITNESS_DOCKER_CMD) so the guards
#                             that decide attribution are themselves tested.
#
#   J. Run selection    — a verb must never infer which run it belongs to.
#                         Reproduces the 2026-08-29 pointer-drift observation:
#                         a second prepare moved shared state between two of the
#                         operator's verbs, silently changing their subject.
#
#   G. Self-consistency     — the instrument's own compose file and env sample
#                             pass the guards they are subject to.
#
# Run anywhere git + bash are available:
#   scripts/witness/verify-witness-instrument.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(mktemp -d "${TMPDIR:-/tmp}/witness-selftest.XXXXXX")"
REPO="$ROOT/repo"
FIX="$ROOT/fixtures"
mkdir -p "$FIX"

cleanup() { rm -rf "$ROOT"; }
trap cleanup EXIT

PASS=0; FAIL=0
ok()   { echo "  ok:   $1"; PASS=$((PASS + 1)); }
bad()  { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }
sect() { echo; echo "── $1 ─────────────────────────────────────────────"; }

# Run the driver with a hermetic environment.
# drv [NAME=VALUE ...] <verb> [args...]  — leading assignments become env.
drv() {
    local envs=()
    while [ $# -gt 0 ]; do
        case "$1" in
            *=*) envs+=("$1"); shift ;;
            *)   break ;;
        esac
    done
    env -i PATH="$PATH" HOME="$ROOT/home" TMPDIR="$ROOT/tmp" \
        WITNESS_RUN_ROOT="$ROOT/witness" \
        WITNESS_SOURCE_REPO="$REPO" \
        WITNESS_ENV_FILE="$FIX/env.good" \
        WITNESS_ASSUME_NO_DOCKER=1 \
        ${envs[@]+"${envs[@]}"} \
        "$SCRIPT_DIR/witness.sh" "$@"
}
mkdir -p "$ROOT/home" "$ROOT/tmp"

# ═══════════════════════════════════════════════════════════════════════════════
# Fixtures
# ═══════════════════════════════════════════════════════════════════════════════
git init -q "$REPO"
gitr() { git -C "$REPO" -c user.email=selftest@maia -c user.name=selftest "$@"; }

cat > "$REPO/Dockerfile" <<'DF'
FROM scratch
DF
mkdir -p "$REPO/lib"
echo "export const CEILING = 'BASELINE_UTTERANCE_CEILING_MARKER';" > "$REPO/lib/capture.ts"
gitr add -A >/dev/null; gitr commit -qm "baseline" >/dev/null
BASE_SHA="$(gitr rev-parse HEAD)"

echo "export const CEILING = 'CANDIDATE_UTTERANCE_CEILING_MARKER';" > "$REPO/lib/capture.ts"
gitr add -A >/dev/null; gitr commit -qm "candidate: lift the utterance ceiling" >/dev/null
CAND_SHA="$(gitr rev-parse HEAD)"
CAND_SHORT="$(gitr rev-parse --short HEAD)"

# A good witness env file.
cat > "$FIX/env.good" <<'E'
DATABASE_URL=postgresql://witness:witness@maia-witness-postgres:5432/maia_witness
WEBAUTHN_RP_ID=localhost
E
# Bad env files, one failure mode each.
echo 'DATABASE_URL=postgresql://soullab@maia-postgres:5432/maia_consciousness' > "$FIX/env.proddb"
echo 'DATABASE_URL=postgresql://witness:witness@minisforum:5432/maia_witness'  > "$FIX/env.prodhost"
printf 'DATABASE_URL=postgresql://witness:witness@maia-witness-postgres:5432/maia_witness\nNEXT_PUBLIC_APP_URL=https://soullab.life\n' > "$FIX/env.prodname"
# Whole-token matching: a witness host whose NAME CONTAINS a protected name.
# 'maia-postgres-witness-1' contains 'maia-postgres'; it is a different referent.
echo 'DATABASE_URL=postgresql://witness:witness@maia-postgres-witness-1:5432/maia_witness' > "$FIX/env.suffixhost"
printf 'DATABASE_URL=postgresql://witness:witness@maia-witness-postgres:5432/maia_witness\nWITNESS_NOTE=minisforum-witness-sandbox\n' > "$FIX/env.suffixnote"
echo 'WEBAUTHN_RP_ID=localhost' > "$FIX/env.nodburl"

# Compose fixtures.
cat > "$FIX/docker-compose.witness.yml" <<'C'
services:
  witness-app:
    container_name: maia-witness-app
    ports:
      - "127.0.0.1:${WITNESS_HTTP_PORT:-3999}:3000"
    networks:
      - witness-internal
networks:
  witness-internal:
    driver: bridge
C
cat > "$FIX/prodname.yml" <<'C'
services:
  app:
    container_name: maia-sovereign
C
cat > "$FIX/external.yml" <<'C'
services:
  app:
    container_name: maia-witness-app
networks:
  maia-internal:
    external: true
C
cat > "$FIX/badport.yml" <<'C'
services:
  app:
    container_name: maia-witness-app
    ports:
      - "0.0.0.0:3000:3000"
    networks:
      - x
C
cat > "$FIX/reservedport.yml" <<'C'
services:
  app:
    container_name: maia-witness-app
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - x
C
# Fixture compose files need a witness basename for guard_compose_project.
cp "$FIX/prodname.yml"     "$FIX/prodname/docker-compose.witness.yml"     2>/dev/null || { mkdir -p "$FIX/prodname"     && cp "$FIX/prodname.yml"     "$FIX/prodname/docker-compose.witness.yml"; }
mkdir -p "$FIX/external" "$FIX/badport" "$FIX/reserved" "$FIX/longok" "$FIX/longbad" "$FIX/longres"
# Long-form ports, as `docker compose config` RENDERS them. The V1 parser read
# only `- ` lines and saw "mode: ingress", refusing a correctly bound port on
# the first real docker host. Fixtures pin all three cases.
cat > "$FIX/longok/docker-compose.witness.yml" <<'C'
services:
  witness-app:
    container_name: maia-witness-app
    ports:
      - mode: ingress
        target: 3000
        published: "3999"
        host_ip: 127.0.0.1
        protocol: tcp
networks:
  witness-internal:
    driver: bridge
C
cat > "$FIX/longbad/docker-compose.witness.yml" <<'C'
services:
  witness-app:
    container_name: maia-witness-app
    ports:
      - mode: ingress
        target: 3000
        published: "3999"
        protocol: tcp
networks:
  witness-internal:
    driver: bridge
C
cat > "$FIX/longres/docker-compose.witness.yml" <<'C'
services:
  witness-app:
    container_name: maia-witness-app
    ports:
      - mode: ingress
        target: 5432
        published: "5432"
        host_ip: 127.0.0.1
        protocol: tcp
networks:
  witness-internal:
    driver: bridge
C
cp "$FIX/external.yml"     "$FIX/external/docker-compose.witness.yml"
cp "$FIX/badport.yml"      "$FIX/badport/docker-compose.witness.yml"
cp "$FIX/reservedport.yml" "$FIX/reserved/docker-compose.witness.yml"

FAKE_BIN="$ROOT/fakebin"; mkdir -p "$FAKE_BIN"
cat > "$FAKE_BIN/docker" <<'FAKE'
#!/usr/bin/env bash
# Minimal docker stand-in. Answers only what the witness guards ask, from
# FAKE_* environment variables, so runtime provenance can be exercised on a
# host with no daemon.
case "$1" in
  info) exit 0 ;;
  compose)
    for a in "$@"; do
      if [ "$a" = "witness-migrate" ] && [ "${FAKE_MIGRATE_FAIL:-0}" = "1" ]; then
        echo "psql:/app/database/migrations/20251231_x.sql:123: ERROR:  relation \"developmental_memories\" does not exist"
        echo "Migration failed: 20251231_x.sql"
        exit 1
      fi
      [ "$a" = "witness-app" ] && [ -n "${FAKE_STATE_DIR:-}" ] && \
        printf '%s\n' "$*" | grep -q 'up -d' && : > "$FAKE_STATE_DIR/app-started"
    done
    exit 0 ;;
  logs) echo "fake container log line"; exit 0 ;;
  inspect)
    shift
    if [ "$1" = "--format" ]; then
      fmt="$2"; shift 2
      case "$fmt" in
        *witness.run_id*) printf '%s\n' "${FAKE_RUN_LABEL:-<no value>}" ;;
        *State.Running*)  printf '%s\n' "${FAKE_RUNNING:-true}" ;;
        *.Image*)         printf '%s\n' "${FAKE_IMAGE_ID:-sha256:aaaa}" ;;
        *compose.project*) printf '%s\n' "${FAKE_PROJECT:-}" ;;
        *) printf '\n' ;;
      esac
      exit 0
    fi
    [ "${FAKE_CONTAINER_EXISTS:-1}" = "1" ] || exit 1
    echo "{}"; exit 0 ;;
  exec)
    shift; shift
    if [ "$1" = "printenv" ]; then
      case "$2" in
        GIT_COMMIT) printf '%s\n' "${FAKE_GIT_COMMIT:-}" ;;
        DEPLOY_LANE) printf '%s\n' "${FAKE_DEPLOY_LANE:-witness-lane}" ;;
      esac
      exit 0
    fi
    printf '%s\n' "${FAKE_PROBE_OUT:-WITNESS_ARTIFACT_FOUND}"; exit 0 ;;
esac
exit 0
FAKE
chmod +x "$FAKE_BIN/docker"

# ═══════════════════════════════════════════════════════════════════════════════
# A. Candidate naming
# ═══════════════════════════════════════════════════════════════════════════════
sect "A. candidate naming"

ASSERT_ENV=(WITNESS_ARTIFACT_SOURCE_PATH=lib/capture.ts
            WITNESS_ARTIFACT_PATTERN=CANDIDATE_UTTERANCE_CEILING_MARKER
            WITNESS_ARTIFACT_NEGATIVE_REF="$BASE_SHA")

drv "${ASSERT_ENV[@]}" prepare >/dev/null 2>&1
[ $? -eq 1 ] && ok "unnamed candidate refused (exit 1)" || bad "unnamed candidate not refused"

drv "${ASSERT_ENV[@]}" prepare deadbeefdeadbeef >/dev/null 2>&1
[ $? -eq 1 ] && ok "bogus ref refused" || bad "bogus ref not refused"

echo "uncommitted edit" >> "$REPO/lib/capture.ts"
DIRTY_OUT="$(drv "${ASSERT_ENV[@]}" prepare "$CAND_SHA" 2>&1)"
[ $? -eq 1 ] && ok "dirty tree refused" || bad "dirty tree not refused"
printf '%s' "$DIRTY_OUT" | grep -q "DIRTY_TREE=REFUSED" \
    && ok "refusal states DIRTY_TREE=REFUSED" || bad "dirty-tree refusal does not state the contract"

# The dirty-tree refusal is NON-BYPASSABLE. Setting the flag that used to
# unlock it must change nothing. (Token assembled from parts so the
# bypass-absence grep below cannot match this file.)
ACK_VAR="WITNESS_ACK""_DIRTY_TREE"
drv "${ASSERT_ENV[@]}" "${ACK_VAR}=1" prepare "$CAND_SHA" >/dev/null 2>&1
[ $? -eq 1 ] && ok "dirty tree still refused with the old ack flag set" || bad "an ack flag still unlocks a dirty tree"

if grep -rqE "(^|[^A-Z_])${ACK_VAR}([^A-Z_]|$)" "$SCRIPT_DIR"/witness.sh "$SCRIPT_DIR"/lib/*.sh 2>/dev/null; then
    bad "a dirty-tree bypass token survives in the instrument"
else
    ok "dirty-tree bypass ABSENT from the instrument source"
fi
gitr checkout -- lib/capture.ts

# ═══════════════════════════════════════════════════════════════════════════════
# D. Artifact assertion (before the good prepare, so refusals are isolated)
# ═══════════════════════════════════════════════════════════════════════════════
sect "D. artifact assertion"

drv prepare "$CAND_SHA" >/dev/null 2>&1
[ $? -eq 1 ] && ok "missing artifact assertion refused" || bad "missing assertion not refused"

drv WITNESS_ARTIFACT_SOURCE_PATH=lib/capture.ts WITNESS_ARTIFACT_PATTERN='.*' prepare "$CAND_SHA" >/dev/null 2>&1
[ $? -eq 1 ] && ok "universal assertion pattern refused" || bad "universal pattern not refused"

drv WITNESS_ARTIFACT_SOURCE_PATH=lib/capture.ts WITNESS_ARTIFACT_PATTERN='short' prepare "$CAND_SHA" >/dev/null 2>&1
[ $? -eq 1 ] && ok "too-short assertion pattern refused" || bad "short pattern not refused"

drv WITNESS_ARTIFACT_SOURCE_PATH=lib/capture.ts WITNESS_ARTIFACT_PATTERN='NOT_IN_THIS_COMMIT_AT_ALL' prepare "$CAND_SHA" >/dev/null 2>&1
[ $? -eq 1 ] && ok "assertion false of the candidate refused" || bad "false-of-candidate assertion not refused"

drv WITNESS_ARTIFACT_SOURCE_PATH=lib/capture.ts WITNESS_ARTIFACT_PATTERN='export const CEILING' \
    WITNESS_ARTIFACT_NEGATIVE_REF="$BASE_SHA" prepare "$CAND_SHA" >/dev/null 2>&1
[ $? -eq 1 ] && ok "non-discriminating assertion refused (also true at negative ref)" || bad "non-discriminating assertion not refused"

# ═══════════════════════════════════════════════════════════════════════════════
# B. The good prepare + candidate immutability
# ═══════════════════════════════════════════════════════════════════════════════
sect "B. candidate immutability"

RUN_ID="$(drv "${ASSERT_ENV[@]}" prepare "$CAND_SHA" 2>/dev/null)"
RUN_DIR="$ROOT/witness/runs/$RUN_ID"
if [ -n "$RUN_ID" ] && [ -d "$RUN_DIR" ]; then ok "prepare PASS → run $RUN_ID"; else bad "prepare did not produce a run dir"; fi

# Load the run's manifest the way the guards do.
WITNESS_SCRIPT_DIR="$SCRIPT_DIR"
export WITNESS_SCRIPT_DIR WITNESS_RUN_ROOT="$ROOT/witness" WITNESS_SOURCE_REPO="$REPO"
export WITNESS_ENV_FILE="$FIX/env.good" WITNESS_ASSUME_NO_DOCKER=1
. "$SCRIPT_DIR/lib/witness-common.sh"
. "$SCRIPT_DIR/lib/witness-guards.sh"
. "$SCRIPT_DIR/lib/witness-evidence.sh"
WITNESS_RUN_DIR="$RUN_DIR"

SNAP="$(wm_get SNAPSHOT_DIR)"
if grep -q CANDIDATE_UTTERANCE_CEILING_MARKER "$SNAP/lib/capture.ts" 2>/dev/null; then
    ok "snapshot carries the candidate's tree"
else bad "snapshot does not carry the candidate's tree"; fi

# The snapshot must be the COMMIT, not whatever the working tree becomes next.
gitr checkout -q -b other "$BASE_SHA"
if grep -q CANDIDATE_UTTERANCE_CEILING_MARKER "$SNAP/lib/capture.ts" 2>/dev/null; then
    ok "snapshot unaffected by a concurrent checkout of another commit"
else bad "snapshot changed when the working tree moved"; fi
gitr checkout -q -

if guard_candidate_immutable >/dev/null 2>&1; then ok "immutability holds on an untouched run"; else bad "immutability failed on an untouched run"; fi

( WITNESS_EXPECT_SHA="$BASE_SHA"; guard_candidate_immutable >/dev/null 2>&1 ) \
    && bad "SHA mismatch not caught" || ok "SHA mismatch refused (run re-pointed at another commit)"

echo "tampered" >> "$SNAP/lib/capture.ts"
guard_candidate_immutable >/dev/null 2>&1 && bad "snapshot mutation not caught" || ok "snapshot mutation refused"
gitr archive --format=tar "$CAND_SHA" | tar -xf - -C "$SNAP" 2>/dev/null   # restore

# ═══════════════════════════════════════════════════════════════════════════════
# C. Production isolation
# ═══════════════════════════════════════════════════════════════════════════════
sect "C. production isolation"

guard_compose_project "maia-sovereign" "$SCRIPT_DIR/docker-compose.witness.yml" >/dev/null 2>&1 \
    && bad "non-witness project accepted" || ok "non-witness compose project refused"
guard_compose_project "maia-witness-x" "/home/user/Sovereign/docker-compose.production.yml" >/dev/null 2>&1 \
    && bad "production compose file accepted" || ok "non-witness compose file refused"

guard_container_names "$FIX/prodname/docker-compose.witness.yml" "maia-witness-x" >/dev/null 2>&1 \
    && bad "production container name accepted" || ok "production container name refused"

guard_database_target "$FIX/env.proddb"   >/dev/null 2>&1 && bad "production DB accepted"        || ok "production database refused"
guard_database_target "$FIX/env.prodhost" >/dev/null 2>&1 && bad "protected DB host accepted"    || ok "protected database host refused"
guard_database_target "$FIX/env.nodburl"  >/dev/null 2>&1 && bad "missing DATABASE_URL accepted" || ok "missing DATABASE_URL refused"
guard_database_target "$FIX/env.good"     >/dev/null 2>&1 && ok "witness database accepted"      || bad "witness database wrongly refused"

# ⛔ Whole-token, not substring. Both of these CONTAIN a protected name and are
# nonetheless different referents. A guard that refuses correct work is how
# guards get switched off — so the false-refusal direction is asserted too.
# NOTE on scope: guard_database_target additionally PINS the host to
# ${WITNESS_PREFIX}-postgres, so no other host can be accepted by it whatever the
# token matching does — its whole-token fix is defence in depth and is not
# observable through this function's accept path. The behaviour IS observable in
# guard_network_target, which greps the env file with no such pin, so that is
# where the substring hazard is asserted.
guard_network_target "$FIX/docker-compose.witness.yml" "$FIX/env.suffixnote" >/dev/null 2>&1 \
    && ok "protected-name substring in env accepted (minisforum-witness-sandbox)" \
    || bad "witness env wrongly refused for containing a protected name as substring"
guard_network_target "$FIX/docker-compose.witness.yml" "$FIX/env.prodname" >/dev/null 2>&1 \
    && bad "exact protected host in env still accepted" \
    || ok "exact protected host in env still refused after token fix"

guard_network_target "$FIX/external/docker-compose.witness.yml" "$FIX/env.good" >/dev/null 2>&1 \
    && bad "external network accepted" || ok "external network refused"
guard_network_target "$FIX/badport/docker-compose.witness.yml" "$FIX/env.good" >/dev/null 2>&1 \
    && bad "non-loopback port accepted" || ok "non-loopback published port refused"
guard_network_target "$FIX/reserved/docker-compose.witness.yml" "$FIX/env.good" >/dev/null 2>&1 \
    && bad "reserved port accepted" || ok "reserved production port refused"
guard_network_target "$FIX/docker-compose.witness.yml" "$FIX/env.prodname" >/dev/null 2>&1 \
    && bad "production hostname in env accepted" || ok "production hostname in env refused"

# Rendered long-form ports — the 2026-08-29 device-qualification defect.
guard_network_target "$FIX/longok/docker-compose.witness.yml" "$FIX/env.good" >/dev/null 2>&1 \
    && ok "rendered long-form loopback port accepted" || bad "long-form loopback port falsely refused"
guard_network_target "$FIX/longbad/docker-compose.witness.yml" "$FIX/env.good" >/dev/null 2>&1 \
    && bad "long-form port with no host_ip accepted" || ok "long-form port with no host_ip refused"
guard_network_target "$FIX/longres/docker-compose.witness.yml" "$FIX/env.good" >/dev/null 2>&1 \
    && bad "long-form reserved port accepted" || ok "long-form reserved port refused"

( WITNESS_RUN_ROOT="/Users/soullab/MAIA-SOVEREIGN/.witness"; guard_no_protected_writes >/dev/null 2>&1 ) \
    && bad "writes inside a protected project dir accepted" || ok "writes inside a protected project dir refused"

# ═══════════════════════════════════════════════════════════════════════════════
# E. Runtime provenance
# ═══════════════════════════════════════════════════════════════════════════════
sect "E. runtime provenance"

guard_runtime_provenance >/dev/null 2>&1
[ $? -eq 3 ] && ok "no runtime → exit 3 (UNPROVEN)" || bad "missing runtime did not yield UNPROVEN/3"
[ "$(wm_get RUNTIME_PROVENANCE)" = "UNPROVEN" ] && ok "manifest records RUNTIME_PROVENANCE=UNPROVEN" || bad "manifest did not record UNPROVEN"

drv verify "$RUN_ID" >/dev/null 2>&1
[ $? -eq 3 ] && ok "verify before provision FAILS with exit 3, never a pass" || bad "verify before provision did not fail as UNPROVEN"
[ "$(wm_get WITNESS_READY)" = "false" ] && ok "WITNESS_READY stays false while unproven" || bad "WITNESS_READY not false while unproven"

# ═══════════════════════════════════════════════════════════════════════════════
# F. Evidence classes
# ═══════════════════════════════════════════════════════════════════════════════
sect "F. evidence classes"

# A run with NO proven runtime cannot be "qualified" — it is unattributable.
# Qualification is about which evidence CLASSES are present; attribution is a
# precondition of the whole roll-up.
drv collect "$RUN_ID" >/dev/null 2>&1
[ $? -eq 3 ] && ok "collect with no runtime is NOT ATTRIBUTABLE (exit 3)" || bad "collect without a runtime did not refuse attribution"
[ "$(wm_get EVIDENCE_COMPLETE)" = "false" ] && ok "EVIDENCE_COMPLETE=false with no runtime" || bad "EVIDENCE_COMPLETE wrongly true"

# With a PROVEN runtime and no client capture: qualified, exit 4.
ev_collect() {
    env WITNESS_RUN_ROOT="$ROOT/witness" WITNESS_SOURCE_REPO="$REPO" WITNESS_ENV_FILE="$FIX/env.good" \
        WITNESS_DOCKER_CMD="$FAKE_BIN/docker" WITNESS_ASSUME_NO_DOCKER=0 \
        FAKE_RUN_LABEL="$(wm_get RUN_ID)" FAKE_GIT_COMMIT="$CAND_SHORT" FAKE_IMAGE_ID=sha256:candidate \
        HOME="$ROOT/home" ${1:+WITNESS_CLIENT_CONSOLE_LOG="$1"} \
        "$SCRIPT_DIR/witness.sh" collect "$RUN_ID" >/dev/null 2>&1
}
wm_set RUNTIME_IMAGE_ID ""
ev_collect
[ $? -eq 4 ] && ok "proven runtime, no client capture is QUALIFIED (exit 4)" || bad "qualified path broken"
[ "$(wm_get SERVER_EVIDENCE)" = "COMPLETE" ] && ok "SERVER_EVIDENCE=COMPLETE on a proven runtime" || bad "server class not complete: $(wm_get SERVER_EVIDENCE)"
[ "$(wm_get CLIENT_CONSOLE_CAPTURE)" = "UNAVAILABLE" ] && ok "CLIENT_CONSOLE_CAPTURE=UNAVAILABLE recorded" || bad "client class flag not recorded"
[ "$(wm_get EVIDENCE_COMPLETE)" = "false" ] && ok "server evidence alone is not complete" || bad "server-only run wrongly complete"
[ -f "$RUN_DIR/evidence/client/README.txt" ] && ok "client class explains why it is empty" || bad "client README missing"
[ -f "$RUN_DIR/evidence/EVIDENCE.md" ] && ok "evidence index written" || bad "evidence index missing"

# Both classes present on a proven runtime: complete, exit 0.
echo "[voice] fake client console line" > "$ROOT/console.log"
ev_collect "$ROOT/console.log"
[ $? -eq 0 ] && ok "both classes on a proven runtime is COMPLETE (exit 0)" || bad "complete path broken"
[ "$(wm_get CLIENT_CONSOLE_CAPTURE)" = "CAPTURED" ] && ok "client console adopted when supplied" || bad "client console not adopted"
[ "$(wm_get EVIDENCE_COMPLETE)" = "true" ] && ok "EVIDENCE_COMPLETE=true only with attribution + both classes" || bad "complete not reached"

# ═══════════════════════════════════════════════════════════════════════════════
# H. Runtime attribution (fake daemon)
# ═══════════════════════════════════════════════════════════════════════════════
sect "H. runtime attribution"


export WITNESS_DOCKER_CMD="$FAKE_BIN/docker"
export WITNESS_ASSUME_NO_DOCKER=0
export FAKE_GIT_COMMIT="$CAND_SHORT"
export FAKE_IMAGE_ID="sha256:candidate"

# H1 — a container belonging to ANOTHER run must never be adopted. This is the
# exact shape of the qualification failure: same candidate, different run,
# every other property true.
export FAKE_RUN_LABEL="20260101T000000Z-otherrun"
wm_set RUNTIME_IMAGE_ID ""
guard_runtime_provenance >/dev/null 2>&1
[ $? -eq 3 ] && ok "another run's container is NOT adopted (exit 3)" || bad "foreign runtime was adopted"
[ "$(wm_get RUNTIME_PROVENANCE)" = "UNPROVEN" ] && ok "foreign runtime records UNPROVEN" || bad "foreign runtime not recorded UNPROVEN"

# H2 — an unlabelled container (not created by this instrument) is refused.
export FAKE_RUN_LABEL="<no value>"
guard_runtime_provenance >/dev/null 2>&1
[ $? -eq 3 ] && ok "unlabelled container refused" || bad "unlabelled container accepted"

# H3 — this run's own container proves.
export FAKE_RUN_LABEL="$(wm_get RUN_ID)"
wm_set RUNTIME_IMAGE_ID ""
guard_runtime_provenance >/dev/null 2>&1
[ $? -eq 0 ] && ok "this run's own container PROVES" || bad "own container failed to prove"
[ "$(wm_get RUNTIME_PROVENANCE)" = "PROVEN" ] && ok "own container records PROVEN" || bad "own container not recorded PROVEN"

# H4 — the digest guard is preserved: same run, image swapped underneath.
export FAKE_IMAGE_ID="sha256:swapped"
guard_runtime_provenance >/dev/null 2>&1
[ $? -eq 3 ] && ok "image digest guard still fires on a swapped image" || bad "digest guard lost"
export FAKE_IMAGE_ID="sha256:candidate"

# H5 — collect must NOT produce attributable evidence from an unproven runtime.
export FAKE_RUN_LABEL="20260101T000000Z-otherrun"
wm_set RUNTIME_IMAGE_ID ""
# Clear the attributable tree first: the assertion below is that a diagnostic
# collect never CREATES evidence/server, not that the directory happens to be
# absent (section F legitimately populated it from a proven runtime).
rm -rf "$RUN_DIR/evidence/server"
env WITNESS_RUN_ROOT="$ROOT/witness" WITNESS_SOURCE_REPO="$REPO" WITNESS_ENV_FILE="$FIX/env.good" \
    WITNESS_DOCKER_CMD="$FAKE_BIN/docker" WITNESS_ASSUME_NO_DOCKER=0 \
    FAKE_RUN_LABEL="$FAKE_RUN_LABEL" FAKE_GIT_COMMIT="$CAND_SHORT" FAKE_IMAGE_ID=sha256:candidate \
    HOME="$ROOT/home" "$SCRIPT_DIR/witness.sh" collect "$RUN_ID" >/dev/null 2>&1
[ $? -eq 3 ] && ok "collect on an unproven runtime exits 3 (NOT ATTRIBUTABLE)" || bad "collect qualified an unproven runtime"
[ "$(wm_get SERVER_EVIDENCE)" = "NOT_ATTRIBUTABLE" ] && ok "SERVER_EVIDENCE=NOT_ATTRIBUTABLE" || bad "server evidence wrongly classed: $(wm_get SERVER_EVIDENCE)"
[ "$(wm_get EVIDENCE_CLASS)" = "DIAGNOSTIC_ONLY" ] && ok "EVIDENCE_CLASS=DIAGNOSTIC_ONLY" || bad "evidence class not diagnostic"
[ "$(wm_get EVIDENCE_COMPLETE)" = "false" ] && ok "unproven runtime can never be EVIDENCE_COMPLETE" || bad "unproven runtime marked complete"
[ -f "$RUN_DIR/evidence/diagnostic/NOT_ATTRIBUTABLE.txt" ] && ok "diagnostic capture is labelled not-attributable" || bad "diagnostic header missing"
[ ! -d "$RUN_DIR/evidence/server" ] && ok "a diagnostic collect never creates evidence/server" || bad "diagnostic collect wrote into evidence/server"

unset WITNESS_DOCKER_CMD FAKE_RUN_LABEL FAKE_GIT_COMMIT FAKE_IMAGE_ID
export WITNESS_ASSUME_NO_DOCKER=1

# I — a broken substrate must not be able to look successful.
# The first device qualification produced a HEALTHY app over a schema whose
# migrations had failed. provision must now stop before the app is started.
sect "I. substrate integrity"

FAKE_STATE="$ROOT/fakestate"; mkdir -p "$FAKE_STATE"
MIG_RUN_ID="$(env WITNESS_RUN_ROOT="$ROOT/witness" WITNESS_SOURCE_REPO="$REPO" WITNESS_ENV_FILE="$FIX/env.good" \
    WITNESS_ASSUME_NO_DOCKER=1 HOME="$ROOT/home" \
    WITNESS_ARTIFACT_SOURCE_PATH=lib/capture.ts \
    WITNESS_ARTIFACT_PATTERN=CANDIDATE_UTTERANCE_CEILING_MARKER \
    "$SCRIPT_DIR/witness.sh" prepare "$CAND_SHA" 2>/dev/null)"

env WITNESS_RUN_ROOT="$ROOT/witness" WITNESS_SOURCE_REPO="$REPO" WITNESS_ENV_FILE="$FIX/env.good" \
    WITNESS_DOCKER_CMD="$FAKE_BIN/docker" WITNESS_ASSUME_NO_DOCKER=0 \
    FAKE_MIGRATE_FAIL=1 FAKE_STATE_DIR="$FAKE_STATE" FAKE_GIT_COMMIT="$CAND_SHORT" \
    HOME="$ROOT/home" "$SCRIPT_DIR/witness.sh" provision "$MIG_RUN_ID" >/dev/null 2>&1
[ $? -ne 0 ] && ok "migration failure fails provision (non-zero)" || bad "provision succeeded despite failed migrations"

MIG_DIR="$ROOT/witness/runs/$MIG_RUN_ID"
[ ! -f "$FAKE_STATE/app-started" ] && ok "the app is never started after a migration failure" || bad "app was started over a broken schema"
( WITNESS_RUN_DIR="$MIG_DIR"; [ "$(wm_get MIGRATIONS)" = "FAILED" ] ) && ok "MIGRATIONS=FAILED recorded" || bad "migration failure not recorded"
( WITNESS_RUN_DIR="$MIG_DIR"; [ "$(wm_get WITNESS_READY)" = "false" ] ) && ok "WITNESS_READY=false after a migration failure" || bad "run marked ready over a broken schema"
( WITNESS_RUN_DIR="$MIG_DIR"; [ -n "$(wm_get PRODUCTION_ISOLATION)" ] ) && ok "production isolation still witnessed on an aborted run" || bad "isolation check skipped by the abort"
[ -f "$MIG_DIR/evidence/diagnostic/MIGRATIONS_FAILED.txt" ] && ok "migration output preserved as diagnostic" || bad "migration diagnostic missing"
[ ! -d "$MIG_DIR/evidence/server" ] && ok "an aborted run produces no attributable evidence" || bad "aborted run wrote attributable evidence"

# J — run selection is explicit, never inferred.
sect "J. run selection"

drv status >/dev/null 2>&1
[ $? -eq 2 ] && ok "a verb with no run named refuses (exit 2)" || bad "verb inferred a run from shared state"

drv WITNESS_RUN="$RUN_ID" status >/dev/null 2>&1
[ $? -eq 0 ] && ok "WITNESS_RUN pins the run for a shell" || bad "WITNESS_RUN not honoured"

drv status "$RUN_ID" >/dev/null 2>&1
[ $? -eq 0 ] && ok "an explicit run argument works" || bad "explicit run argument rejected"

drv WITNESS_RUN="$MIG_RUN_ID" status "$RUN_ID" >/dev/null 2>&1
[ $? -eq 2 ] && ok "argument disagreeing with WITNESS_RUN is refused, not ranked" || bad "ambiguous run silently resolved"

# The observed defect: another lane prepares a run, moving the shared pointer,
# between two of the operator's verbs. A pinned verb must not notice.
echo "$MIG_RUN_ID" > "$ROOT/witness/latest"
echo "$MIG_RUN_ID" > "$ROOT/witness/current"
PINNED_OUT="$(drv WITNESS_RUN="$RUN_ID" status 2>/dev/null | awk '$1=="run"{print $2; exit}')"
[ "$PINNED_OUT" = "$RUN_ID" ] && ok "a pinned verb is unaffected by another lane moving the pointer" || bad "pointer drift changed a pinned verb's subject"

# ═══════════════════════════════════════════════════════════════════════════════
# G. Self-consistency — the instrument's own artifacts pass their own guards
# ═══════════════════════════════════════════════════════════════════════════════
sect "G. self-consistency"

guard_compose_project "maia-witness-${CAND_SHORT}" "$SCRIPT_DIR/docker-compose.witness.yml" >/dev/null 2>&1 \
    && ok "shipped witness compose accepted as a witness project" || bad "shipped witness compose refused"
guard_container_names "$SCRIPT_DIR/docker-compose.witness.yml" "$(wm_get COMPOSE_PROJECT)" >/dev/null 2>&1 \
    && ok "shipped compose: every container is run-token scoped" || bad "shipped compose container not run-scoped"
guard_container_names "$FIX/docker-compose.witness.yml" "$(wm_get COMPOSE_PROJECT)" >/dev/null 2>&1 \
    && bad "candidate-scoped container name accepted" || ok "candidate-scoped container name refused"
guard_network_target "$SCRIPT_DIR/docker-compose.witness.yml" "$SCRIPT_DIR/.env.witness.sample" >/dev/null 2>&1 \
    && ok "shipped compose + env sample: loopback-only, no external network" || bad "shipped compose/env failed the network guard"
guard_database_target "$SCRIPT_DIR/.env.witness.sample" >/dev/null 2>&1 \
    && ok "shipped env sample points at the witness database" || bad "shipped env sample failed the database guard"

# ── the two corrections that came back from the discovery branch (3d4193ba) ──
grep -q 'RUNTIME_IMAGE_ID' "$SCRIPT_DIR/lib/witness-guards.sh" \
    && grep -q 'image identity moved' "$SCRIPT_DIR/lib/witness-guards.sh" \
    && ok "runtime provenance binds the image DIGEST, not the tag" \
    || bad "an image swapped under a stable tag would not be caught"

_num_out="$(guard_artifact_assertion_declared 'maxMs:120000' 'lib/x.ts' '/nonexistent-snap' 2>&1 || true)"
case "$_num_out" in
    *"numeric literal"*) ok "numeric-literal assertion warns about minifier rewriting (120000 -> 12e4)" ;;
    *)                   bad "an unstable numeric-literal discriminator passes without warning" ;;
esac

_id_out="$(guard_artifact_assertion_declared 'DESKTOP_MAX_UTTERANCE_MS' 'lib/x.ts' '/nonexistent-snap' 2>&1 || true)"
case "$_id_out" in
    *"numeric literal"*) bad "identifier assertion wrongly warned" ;;
    *)                   ok "identifier assertion accepted without a stability warning" ;;
esac

grep -q 'launch_desktop_authenticated' "$SCRIPT_DIR/witness.sh" \
    && ! grep -qE '^\s*launch_desktop_authenticated\)' "$SCRIPT_DIR/witness.sh" \
    && ok "launch_desktop_authenticated named as out-of-scope, not implemented" \
    || bad "V1 scope boundary on the Desktop launcher is unclear"

# ═══════════════════════════════════════════════════════════════════════════════
echo
echo "═══════════════════════════════════════════════════════════"
echo "  $PASS passed · $FAIL failed"
echo "═══════════════════════════════════════════════════════════"
[ "$FAIL" -eq 0 ]
