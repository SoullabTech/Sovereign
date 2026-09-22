#!/usr/bin/env bash
# JARVIS-KP-01 / I5-P0R2 — Founder-scope configuration remediation + property-bound
# readiness witness. Runs ON THE PRODUCTION HOST (minisforum).
#
# ⛔ UNSPENT. This script implements the DRAFT authorization at
#    docs/programme/JARVIS-KP-01_I5-P0R2_DRAFT_AUTHORIZATION_2026-09-22.md.
#    It refuses to run without --authorization naming an ISSUED record, and it
#    refuses to mutate anything without --apply. It cannot verify that the named
#    record is genuinely a founder act; it can only require that the operator
#    name it. That is a statement of its limit, not a claim of authority.
#
# WHAT IT NEVER DOES
#   ⛔ never sets any of the five shadow/H8/persistence flags to 1
#   ⛔ never executes a shadow model or calls Ollama /api/generate
#   ⛔ never writes to the database
#   ⛔ never runs a migration, builds an image, pulls code, or moves a tag
#   ⛔ never prints the raw Founder member identifier
#
# Usage (dry run, default):
#   scripts/witness/i5-p0r2-remediation.sh --authorization docs/programme/<record>.md
#     (add --instrument-dir <dir> when running from a copy outside the repo)
# Usage (mutate):
#   scripts/witness/i5-p0r2-remediation.sh --authorization <record> --apply [--reload compose-no-deps]

set -euo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Sibling instruments are resolved relative to THIS script, so the act runs from a
# copy (e.g. /tmp) on a host whose checkout does not carry them. Override only to
# point at a different materialization of the SAME authorized blobs.
INSTRUMENT_DIR="${I5_INSTRUMENT_DIR:-$SELF_DIR}"
GIT_WITNESS="$INSTRUMENT_DIR/seam-identity.mjs"
CONTAINER_WITNESS="$INSTRUMENT_DIR/seam-identity-container.mjs"
# Authorized blob hashes of the two sibling instruments. Verified before use, so
# the act cannot run against a tampered or stale instrument.
GIT_WITNESS_BLOB="b86a7e3982a0bf809022c2fdfe2b7f28c203d223"
CONTAINER_WITNESS_BLOB="85bdba16753cceb4d5991ca4c8c69b57f79f1585"

CONTAINER="${I5_CONTAINER:-maia-sovereign}"
PG_CONTAINER="${I5_PG_CONTAINER:-maia-postgres}"
ENV_FILE="${I5_ENV_FILE:-/home/soullab/MAIA-SOVEREIGN/.env.production}"
EXPECT_FULL="195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b"
EXPECT_IMAGE="a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51"
MODEL="qwen2.5:14b-instruct"
FLAGS=(MAIA_RELATIONAL_FIELD_SHADOW MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW
       AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED MAIA_RELATIONAL_FIELD_H8
       MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION)

AUTHORIZATION=""; APPLY=0; RELOAD="none"
while [ $# -gt 0 ]; do
  case "$1" in
    --authorization) AUTHORIZATION="${2:-}"; shift 2 ;;
    --apply) APPLY=1; shift ;;
    --reload) RELOAD="${2:-}"; shift 2 ;;
    --instrument-dir) INSTRUMENT_DIR="${2:-}"; GIT_WITNESS="$INSTRUMENT_DIR/seam-identity.mjs";
      CONTAINER_WITNESS="$INSTRUMENT_DIR/seam-identity-container.mjs"; shift 2 ;;
    *) echo "REFUSED UNKNOWN_ARGUMENT: $1" >&2; exit 2 ;;
  esac
done

# A ceiling breach is reported by dk() from inside a command substitution, which
# cannot terminate this shell — so the caller's generic handler would fire too and
# print a SECOND, vaguer reason. The marker keeps exactly one cause on the record.
CAUSE_MARKER="$(mktemp)"
trap 'rm -f "$CAUSE_MARKER"' EXIT
stop() {
  if [ -s "$CAUSE_MARKER" ]; then exit 1; fi   # the true cause was already named
  echo "STOP $1${2:+: $2}" >&2
  exit 1
}

# ⭐ Every external call carries a ceiling. Dry run 2 hung indefinitely inside
# `docker inspect`, which is a HOST CONTROL-PLANE condition — and an instrument
# that waits forever on it reports nothing, so the operator cannot tell a stalled
# management plane from a slow one. A timeout turns it into a named STOP.
: "${I5_CALL_TIMEOUT_S:=15}"
dk() { # docker, with a ceiling
  local rc=0
  timeout "$I5_CALL_TIMEOUT_S" docker "$@" || rc=$?
  if [ "$rc" = "124" ]; then
    # Print FIRST, then mark. Marking first would make stop() suppress the very
    # message the marker exists to preserve — which the ceiling test caught.
    echo "STOP DOCKER_CONTROL_PLANE_TIMEOUT: docker $1 exceeded ${I5_CALL_TIMEOUT_S}s — the Docker API did not answer. This says NOTHING about whether MAIA is serving traffic; diagnose with scripts/witness/i5-host-plane-probe.sh before touching anything." >&2
    printf 'docker %s\n' "$1" > "$CAUSE_MARKER"
    exit 1
  fi
  return "$rc"
}
refuse() { echo "REFUSED $1${2:+: $2}" >&2; exit 2; }

[ -n "$AUTHORIZATION" ] || refuse MISSING_AUTHORIZATION "name the issued founder record with --authorization"
[ -f "$AUTHORIZATION" ] || refuse AUTHORIZATION_NOT_FOUND "$AUTHORIZATION"
# The draft guard is ANCHORED TO A STANDING/STATUS LINE, not to free prose.
# A free-text grep would refuse a record precisely because it DISCUSSES the draft
# guard — the C21 defect this project already met once (an instrument failing a
# file because that file documented its own compliance). A record may talk about
# drafts; it may not DECLARE itself one.
if grep -qiE '^[[:space:]]*(\*\*)?(STATUS|STANDING)(\*\*)?[[:space:]]*:.*\bDRAFT\b' "$AUTHORIZATION"; then
  refuse AUTHORIZATION_IS_A_DRAFT "$AUTHORIZATION declares DRAFT on its status line"
fi
case "$RELOAD" in none|compose-no-deps) ;; *) refuse UNKNOWN_RELOAD_MODE "$RELOAD" ;; esac

# git's blob hash, computed without git so it works from /tmp outside a work tree.
blob_hash() { { printf 'blob %s\0' "$(wc -c < "$1" | tr -d ' ')"; cat "$1"; } | sha1sum | cut -d' ' -f1; }

for pair in "$GIT_WITNESS:$GIT_WITNESS_BLOB" "$CONTAINER_WITNESS:$CONTAINER_WITNESS_BLOB"; do
  f="${pair%:*}"; want="${pair##*:}"
  [ -f "$f" ] || refuse INSTRUMENT_MISSING "$f (use --instrument-dir to point at the authorized instruments)"
  got="$(blob_hash "$f")"
  [ "$got" = "$want" ] || refuse INSTRUMENT_BLOB_MISMATCH "$f is $got, authorized is $want"
done

say() { printf '%s\n' "$*"; }
hdr() { printf '\n── %s ─────────────────────────────────────────\n' "$*"; }

# ── PHASE 1 — bind the substrate ────────────────────────────────────────────
hdr "PHASE 1 · bind substrate"
# Each blocking call announces itself FIRST. A run that stops printing then names
# the exact call it stopped on, so a stall is never mistaken for a silent pass.
step() { printf '  … %s\n' "$*"; }
say "instrument_dir=$INSTRUMENT_DIR"
say "instrument blobs verified: seam-identity.mjs + seam-identity-container.mjs"
step "docker inspect $CONTAINER (image id)"
IMAGE_BEFORE="$(dk inspect "$CONTAINER" --format '{{.Image}}')" || stop CONTAINER_UNREADABLE
step "docker exec $CONTAINER printenv GIT_COMMIT"
RUNNING_SHA="$(dk exec "$CONTAINER" printenv GIT_COMMIT)" || stop GIT_COMMIT_UNREADABLE
[ "$RUNNING_SHA" != "unknown" ] || stop GIT_COMMIT_UNKNOWN "the running container asserts no provenance"
say "container=$CONTAINER"
say "image_before=$IMAGE_BEFORE"
say "running_sha=$RUNNING_SHA"

step "git fetch origin clean-main-no-secrets (ancestry input)"
# --no-tags keeps it small; a credential prompt would otherwise hang here unseen.
GIT_TERMINAL_PROMPT=0 git fetch --no-tags origin clean-main-no-secrets >/dev/null 2>&1 \
  || stop FETCH_FAILED "could not fetch canonical (credentials, or no network from this host)"
say ""
step "git-side binding check (ancestry + full-scope digest)"
node "$GIT_WITNESS" check \
  --production-sha "$RUNNING_SHA" \
  --canonical-rev origin/clean-main-no-secrets \
  --expect "$EXPECT_FULL" || stop SEAM_BINDING_REFUSED "see the refusal code above"

say ""
step "container-side seam witness, streamed in on stdin (36 of 37; the 37th is entailed)"
# ⭐ The instrument is STREAMED IN on stdin rather than read from /app/scripts.
# The running image was built before this instrument existed, and §VIII forbids a
# rebuild or deploy — so requiring the file inside the image would make the
# authorization's own §I.3 unsatisfiable. Nothing is written into the container;
# the bytes MEASURED are the container's own /app/lib and /app/database.
dk exec -i "$CONTAINER" node --input-type=module - --expect "$EXPECT_IMAGE" \
  < "$CONTAINER_WITNESS" || stop CONTAINER_SEAM_REFUSED

# ── PHASE 2 — every flag must be OFF ────────────────────────────────────────
hdr "PHASE 2 · flags"
step "reading the five activation flags"
for f in "${FLAGS[@]}"; do
  v="$(dk exec "$CONTAINER" printenv "$f" 2>/dev/null || true)"
  [ "$v" != "1" ] || stop FLAG_ENABLED "$f is literal 1 — this act may not run against a live shadow"
  say "$f = ${v:-<unset>}  (OFF)"
done

# ── PHASE 3 — row counts before ─────────────────────────────────────────────
hdr "PHASE 3 · row counts before"
q() { dk exec "$PG_CONTAINER" psql -X -At -U soullab maia_consciousness -c "$1"; }
step "row counts via $PG_CONTAINER"
RESEARCH_BEFORE="$(q 'SELECT count(*) FROM public.maia_relational_field_shadow_runs;')" || stop RESEARCH_COUNT_UNREADABLE
TELEMETRY_BEFORE="$(q 'SELECT count(*) FROM public.maia_epistemic_join_integration_shadow_runs;')" || stop TELEMETRY_COUNT_UNREADABLE
say "relational_field_shadow_runs = $RESEARCH_BEFORE"
say "epistemic_join_integration_shadow_runs = $TELEMETRY_BEFORE"

# ── PHASE 4 — Founder identity, never printed ───────────────────────────────
hdr "PHASE 4 · Founder scope"
step "resolving the unique admin_role = founder identity"
FOUNDER_COUNT="$(q "SELECT count(*) FROM members WHERE admin_role = 'founder';")"
[ "$FOUNDER_COUNT" = "1" ] || stop FOUNDER_NOT_UNIQUE "found $FOUNDER_COUNT accounts with admin_role = founder"
FOUNDER_ID="$(q "SELECT id::text FROM members WHERE admin_role = 'founder';")"
[ -n "$FOUNDER_ID" ] || stop FOUNDER_ID_EMPTY
fp() { printf '%s' "$1" | sha256sum | cut -c1-12; }
say "founder_count=1"
say "founder_fingerprint=$(fp "$FOUNDER_ID")"

CURRENT_IDS="$(dk exec "$CONTAINER" printenv MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS 2>/dev/null || true)"
CURRENT_COUNT="$(printf '%s' "$CURRENT_IDS" | tr ',' '\n' | sed '/^[[:space:]]*$/d' | wc -l | tr -d ' ')"
say "configured_allowlist_count=$CURRENT_COUNT"
if [ "$CURRENT_COUNT" = "1" ]; then
  say "configured_allowlist_fingerprint=$(fp "$(printf '%s' "$CURRENT_IDS" | tr -d '[:space:]')")"
  if [ "$(printf '%s' "$CURRENT_IDS" | tr -d '[:space:]')" = "$FOUNDER_ID" ]; then
    say "match=YES (already correct)"
  else
    say "match=NO (B1 present — remediation required)"
  fi
fi

# ── PHASE 5 — the configuration change ──────────────────────────────────────
hdr "PHASE 5 · configuration"
if [ "$APPLY" -ne 1 ]; then
  say "DRY RUN — no file written. Would set, in $ENV_FILE:"
  say "  MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS = <founder id, fingerprint $(fp "$FOUNDER_ID")>"
  say "  MAIA_RELATIONAL_FIELD_SHADOW_MODELS     = $MODEL"
  say ""
  say "Re-run with --apply to mutate. Nothing else in this act mutates anything."
  exit 0
fi

[ -f "$ENV_FILE" ] || stop ENV_FILE_MISSING "$ENV_FILE"
BACKUP="${ENV_FILE}.i5-p0r2.$(date -u +%Y%m%dT%H%M%SZ).bak"
cp -p "$ENV_FILE" "$BACKUP"
say "backup=$BACKUP"

set_key() { # set_key NAME VALUE — replace in place, or append; exactly one line results
  local name="$1" value="$2" tmp
  tmp="$(mktemp)"
  grep -v "^${name}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$name" "$value" >> "$tmp"
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
  local n; n="$(grep -c "^${name}=" "$ENV_FILE")"
  [ "$n" = "1" ] || stop ENV_KEY_NOT_SINGULAR "$name appears $n times"
}
set_key MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS "$FOUNDER_ID"
set_key MAIA_RELATIONAL_FIELD_SHADOW_MODELS "$MODEL"
say "written: allowlist (1 identity) + model set ($MODEL)"

# The five flags must not have been touched by this edit.
for f in "${FLAGS[@]}"; do
  if grep -qE "^${f}=1$" "$ENV_FILE"; then stop FLAG_WRITTEN_ON "$f was set to 1 in $ENV_FILE"; fi
done

# ── PHASE 6 — optional reload, same image only ──────────────────────────────
hdr "PHASE 6 · reload"
if [ "$RELOAD" = "none" ]; then
  say "no reload requested — the new configuration takes effect on the next recreation"
else
  say "recreating $CONTAINER from its CURRENT image, --no-deps, no build"
  timeout 300 docker compose -f docker-compose.production.yml up -d --no-deps --no-build maia \
    || stop RELOAD_FAILED
  IMAGE_AFTER="$(dk inspect "$CONTAINER" --format '{{.Image}}')"
  [ "$IMAGE_AFTER" = "$IMAGE_BEFORE" ] || stop IMAGE_CHANGED "$IMAGE_BEFORE -> $IMAGE_AFTER"
  say "image_after=$IMAGE_AFTER (unchanged)"
fi

# ── PHASE 7 — post-witness ──────────────────────────────────────────────────
hdr "PHASE 7 · post-witness"
IMAGE_NOW="$(dk inspect "$CONTAINER" --format '{{.Image}}')"
[ "$IMAGE_NOW" = "$IMAGE_BEFORE" ] || stop IMAGE_CHANGED "substrate moved under the act"

for f in "${FLAGS[@]}"; do
  v="$(dk exec "$CONTAINER" printenv "$f" 2>/dev/null || true)"
  [ "$v" != "1" ] || stop FLAG_ENABLED_AFTER "$f"
done
say "all five flags still OFF"

IDS_AFTER="$(dk exec "$CONTAINER" printenv MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS 2>/dev/null || true)"
COUNT_AFTER="$(printf '%s' "$IDS_AFTER" | tr ',' '\n' | sed '/^[[:space:]]*$/d' | wc -l | tr -d ' ')"
MODELS_AFTER="$(dk exec "$CONTAINER" printenv MAIA_RELATIONAL_FIELD_SHADOW_MODELS 2>/dev/null || true)"
MODEL_COUNT="$(printf '%s' "$MODELS_AFTER" | tr ',' '\n' | sed '/^[[:space:]]*$/d' | wc -l | tr -d ' ')"
say "allowlist_count=$COUNT_AFTER"
say "allowlist_match=$([ "$(printf '%s' "$IDS_AFTER" | tr -d '[:space:]')" = "$FOUNDER_ID" ] && echo YES || echo NO)"
say "model_count=$MODEL_COUNT  model=$MODELS_AFTER"
dk exec "$CONTAINER" sh -c "printenv MAIA_RELATIONAL_FIELD_SHADOW_MODELS" >/dev/null

RESEARCH_AFTER="$(q 'SELECT count(*) FROM public.maia_relational_field_shadow_runs;')"
TELEMETRY_AFTER="$(q 'SELECT count(*) FROM public.maia_epistemic_join_integration_shadow_runs;')"
[ "$RESEARCH_AFTER" = "$RESEARCH_BEFORE" ] || stop RESEARCH_ROWS_MOVED "$RESEARCH_BEFORE -> $RESEARCH_AFTER"
[ "$TELEMETRY_AFTER" = "$TELEMETRY_BEFORE" ] || stop TELEMETRY_ROWS_MOVED "$TELEMETRY_BEFORE -> $TELEMETRY_AFTER"
say "row counts unchanged ($RESEARCH_AFTER / $TELEMETRY_AFTER)"

say ""
say "re-binding the substrate after the act:"
node "$GIT_WITNESS" check \
  --production-sha "$RUNNING_SHA" --canonical-rev origin/clean-main-no-secrets \
  --expect "$EXPECT_FULL" || stop SEAM_BINDING_REFUSED_AFTER
dk exec -i "$CONTAINER" node --input-type=module - --expect "$EXPECT_IMAGE" \
  < "$CONTAINER_WITNESS" || stop CONTAINER_SEAM_REFUSED_AFTER

hdr "RESULT"
if [ "$COUNT_AFTER" = "1" ] \
  && [ "$(printf '%s' "$IDS_AFTER" | tr -d '[:space:]')" = "$FOUNDER_ID" ] \
  && [ "$MODEL_COUNT" = "1" ] && [ "$(printf '%s' "$MODELS_AFTER" | tr -d '[:space:]')" = "$MODEL" ]; then
  say "B1 and B2 remediated · substrate bound · all flags OFF · no rows written"
  say ""
  say "⛔ This establishes CONFIGURATION, not the runtime's effective view: while"
  say "   MAIA_RELATIONAL_FIELD_SHADOW is OFF the runtime helpers return [] by"
  say "   design, so 'the runtime would admit exactly one member' is owed to P1."
  say ""
  say "I5-P0 READY FOR FOUNDER P1 WITNESS"
  exit 0
fi
say "I5-P0 NOT READY — allowlist or model set did not reach the required state"
exit 1
