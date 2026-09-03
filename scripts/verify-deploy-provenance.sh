#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Falsification harness — deploy PROVENANCE gate (scripts/deploy-context.sh)
# ═══════════════════════════════════════════════════════════════════════════════
# Certifies the 2026-09-03 deploy-chain repair by the constitutional method:
# every hostile mutation is applied (to a throwaway copy), the gate is shown to go
# RED, the innocent control is shown GREEN, and the real tree is proven untouched
# (sha256 before == after). No docker, no network — reader seams inject fakes.
#
#   M1  Compose runtime override reintroduced   (GIT_COMMIT under services:)  → refused
#   M2  .env.production defines GIT_COMMIT=unknown                            → refused
#   M3  Compose structure not from the authorized snapshot                     → refused
#   M4  Built image stamp ≠ requested SHA                                      → refused pre-swap
#   M5  Running container stamp ≠ image / requested SHA (either channel)       → deploy fails
#
# Run:  scripts/verify-deploy-provenance.sh        (npm run verify:deploy-provenance)
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REAL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REAL_COMPOSE="$REAL_ROOT/docker-compose.production.yml"

ROOT="$(mktemp -d "${TMPDIR:-/tmp}/deploy-prov-selftest.XXXXXX")"
REPO="$ROOT/repo"; PROJ="$ROOT/project"
export DEPLOY_CONTEXT_DIR="$ROOT/ctx"
export DEPLOY_SOURCE_REPO="$REPO"
export PROJECT_DIR="$PROJ"
export DEPLOY_VERIFY_RETRIES=1
mkdir -p "$REPO" "$PROJ" "$DEPLOY_CONTEXT_DIR"
cleanup() { rm -rf "$ROOT"; }
trap cleanup EXIT

PASS=0; FAIL=0
ok()   { echo "  ok:   $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }
expect_red()   { if "$@" >/dev/null 2>&1; then fail "$LABEL — gate stayed GREEN under hostile mutation"; else ok "$LABEL — gate RED"; fi; }
expect_green() { if "$@" >/dev/null 2>&1; then ok "$LABEL — gate GREEN (innocent)"; else fail "$LABEL — gate RED on innocent input"; fi; }

# Real-tree digest, to prove restoration at the end.
BEFORE="$( (cat "$REAL_COMPOSE" "$SCRIPT_DIR/deploy-context.sh" "$SCRIPT_DIR/pre-deploy-gate.sh" "$SCRIPT_DIR/deploy-production.sh") | sha256sum | cut -c1-16)"

# shellcheck source=deploy-context.sh
source "$SCRIPT_DIR/deploy-context.sh"

git_repo() { git -C "$REPO" -c user.email=selftest@maia -c user.name=selftest "$@"; }
commit_repo() { git_repo add -A >/dev/null; git_repo commit -q -m "$1"; git -C "$REPO" rev-parse --short HEAD; }

# ── Throwaway repo: Dockerfile + the REAL repaired compose file ────────────────
git -C "$REPO" init -q
printf 'FROM scratch\n' > "$REPO/Dockerfile"
cp "$REAL_COMPOSE" "$REPO/docker-compose.production.yml"
SHA_CLEAN="$(commit_repo "clean: real repaired compose")"

echo "[deploy-provenance] M1 — compose runtime override"
LABEL="M1 innocent: real compose has no runtime override"
expect_green deploy_ctx_refuse_compose_runtime_override "$REAL_COMPOSE"
MUT="$ROOT/compose-m1.yml"
# Reintroduce exactly the incident line under the maia service's environment:
awk '{print} /NEXT_TELEMETRY_DISABLED: "1"/ && !done {print "      GIT_COMMIT: ${GIT_COMMIT:-unknown}"; done=1}' "$REAL_COMPOSE" > "$MUT"
grep -q 'GIT_COMMIT: ${GIT_COMMIT:-unknown}' "$MUT" || fail "M1 mutation did not apply"
LABEL="M1 hostile: override reintroduced under services:"
expect_red deploy_ctx_refuse_compose_runtime_override "$MUT"
# …and through the full materialize path (the gate, not just the predicate):
cp "$MUT" "$REPO/docker-compose.production.yml"; SHA_M1="$(commit_repo "hostile: override reintroduced")"
LABEL="M1 hostile: materialize refuses the mutated commit"
expect_red deploy_ctx_assert_and_materialize "$SHA_M1"
LABEL="M1 restored: materialize accepts the clean commit"
expect_green deploy_ctx_assert_and_materialize "$SHA_CLEAN"
# A second hostile shape — the override under a DIFFERENT service — is also refused:
awk '{print} /^  migrate:/ && !d {print "    environment:"; print "      GIT_COMMIT: ${GIT_COMMIT:-unknown}"; d=1}' "$REAL_COMPOSE" > "$ROOT/compose-m1b.yml"
LABEL="M1 hostile (other service)"
expect_red deploy_ctx_refuse_compose_runtime_override "$ROOT/compose-m1b.yml"

echo "[deploy-provenance] M2 — env-file collision"
printf 'DATABASE_URL=postgres://x\n' > "$PROJ/.env.production"
LABEL="M2 innocent: env file without GIT_COMMIT"
expect_green deploy_ctx_assert_and_materialize "$SHA_CLEAN"
printf 'DATABASE_URL=postgres://x\nGIT_COMMIT=unknown\n' > "$PROJ/.env.production"
LABEL="M2 hostile: env file defines GIT_COMMIT=unknown"
expect_red deploy_ctx_assert_and_materialize "$SHA_CLEAN"
printf 'DATABASE_URL=postgres://x\nexport GIT_COMMIT=deadbeef\n' > "$PROJ/.env.production"
LABEL="M2 hostile: env file exports GIT_COMMIT"
expect_red deploy_ctx_assert_and_materialize "$SHA_CLEAN"
printf 'DATABASE_URL=postgres://x\n' > "$PROJ/.env.production"
LABEL="M2 restored"
expect_green deploy_ctx_assert_and_materialize "$SHA_CLEAN"

echo "[deploy-provenance] M3 — deployment structure must come from the snapshot"
# Fake docker records its argv; deploy_ctx_compose must point -f INSIDE the snapshot
# and --project-directory at the project dir.
FAKE="$ROOT/bin"; mkdir -p "$FAKE"
cat > "$FAKE/docker" <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$FAKE_ARGV_OUT"
SH
chmod +x "$FAKE/docker"
export DEPLOY_DOCKER_BIN="$FAKE/docker" FAKE_ARGV_OUT="$ROOT/argv.txt"
deploy_ctx_assert_and_materialize "$SHA_CLEAN" >/dev/null 2>&1
deploy_ctx_compose build maia >/dev/null 2>&1
F_PATH="$(awk 'p{print;exit} $0=="-f"{p=1}' "$ROOT/argv.txt")"
PD_PATH="$(awk 'p{print;exit} $0=="--project-directory"{p=1}' "$ROOT/argv.txt")"
case "$F_PATH" in "$MAIA_BUILD_CONTEXT"/docker-compose.production.yml) ok "M3 innocent: compose -f is the SNAPSHOT's ($F_PATH)";; *) fail "M3: compose -f is not the snapshot's: '$F_PATH'";; esac
[ "$PD_PATH" = "$PROJ" ] && ok "M3 innocent: --project-directory is the project dir (runtime files)" || fail "M3: --project-directory wrong: '$PD_PATH'"
LABEL="M3 hostile: compose file pointed outside the snapshot"
DEPLOY_COMPOSE_FILE="$REAL_COMPOSE" expect_red deploy_ctx_compose build maia
LABEL="M3 hostile: compose invoked before materialize"
( unset DEPLOY_COMPOSE_FILE; deploy_ctx_compose build maia >/dev/null 2>&1 ) && fail "$LABEL — GREEN" || ok "$LABEL — gate RED"
# Static: the drivers' deploy/update/deploy-maia paths no longer read the checkout compose.
if grep -nE 'docker compose .*-f "\$PROJECT_DIR/docker-compose.production.yml"' "$SCRIPT_DIR/pre-deploy-gate.sh" >/dev/null; then fail "M3 static: pre-deploy-gate still reads the checkout compose"; else ok "M3 static: pre-deploy-gate builds/swaps via deploy_ctx_compose only"; fi
DEPLOY_FN="$(awk '/^cmd_deploy\(\)/,/^}/' "$SCRIPT_DIR/deploy-production.sh"; awk '/^cmd_update\(\)/,/^}/' "$SCRIPT_DIR/deploy-production.sh")"
if printf '%s' "$DEPLOY_FN" | grep -qE 'docker compose -f "\$COMPOSE_FILE" (build|up|--profile migrate)'; then fail "M3 static: deploy/update still build/swap with the checkout compose"; else ok "M3 static: deploy/update build/swap/migrate via deploy_ctx_compose"; fi
unset DEPLOY_DOCKER_BIN

echo "[deploy-provenance] M4 — pre-swap image stamp"
LABEL="M4 innocent: image stamp == SHA"
DEPLOY_VERIFY_IMAGE_CMD="printf '%s' '$SHA_CLEAN'" expect_green deploy_ctx_verify_image "$SHA_CLEAN"
LABEL="M4 hostile: image stamp 'unknown'"
DEPLOY_VERIFY_IMAGE_CMD="printf '%s' 'unknown'" expect_red deploy_ctx_verify_image "$SHA_CLEAN"
LABEL="M4 hostile: image stamp is a different SHA"
DEPLOY_VERIFY_IMAGE_CMD="printf '%s' 'deadbeef1'" expect_red deploy_ctx_verify_image "$SHA_CLEAN"
LABEL="M4 hostile: image stamp empty"
DEPLOY_VERIFY_IMAGE_CMD="printf ''" expect_red deploy_ctx_verify_image "$SHA_CLEAN"
# Static: both drivers call the pre-swap verify BEFORE tagging/swapping.
for f in pre-deploy-gate.sh deploy-production.sh; do
  v="$(grep -n 'deploy_ctx_verify_image' "$SCRIPT_DIR/$f" | head -1 | cut -d: -f1)"; t="$(grep -n 'tag_images_for_rollback "\$GIT_COMMIT"' "$SCRIPT_DIR/$f" | head -1 | cut -d: -f1)"
  if [ -n "$v" ] && [ -n "$t" ] && [ "$v" -lt "$t" ]; then ok "M4 static: $f verifies the image before tagging/swapping"; else fail "M4 static: $f does not verify the image pre-swap (verify@${v:-none} tag@${t:-none})"; fi
done

echo "[deploy-provenance] M5 — post-swap running container (both channels)"
LABEL="M5 innocent: printenv == Config.Env == SHA"
DEPLOY_VERIFY_PRINTENV_CMD="printf '%s' '$SHA_CLEAN'" DEPLOY_VERIFY_INSPECT_CMD="printf '%s' '$SHA_CLEAN'" expect_green deploy_ctx_verify_running "$SHA_CLEAN" c
LABEL="M5 hostile: THE INCIDENT — image stamped, container Config.Env=unknown"
DEPLOY_VERIFY_PRINTENV_CMD="printf '%s' 'unknown'" DEPLOY_VERIFY_INSPECT_CMD="printf '%s' 'unknown'" expect_red deploy_ctx_verify_running "$SHA_CLEAN" c
LABEL="M5 hostile: printenv matches but Config.Env disagrees"
DEPLOY_VERIFY_PRINTENV_CMD="printf '%s' '$SHA_CLEAN'" DEPLOY_VERIFY_INSPECT_CMD="printf '%s' 'unknown'" expect_red deploy_ctx_verify_running "$SHA_CLEAN" c
LABEL="M5 hostile: Config.Env matches but printenv disagrees"
DEPLOY_VERIFY_PRINTENV_CMD="printf '%s' 'unknown'" DEPLOY_VERIFY_INSPECT_CMD="printf '%s' '$SHA_CLEAN'" expect_red deploy_ctx_verify_running "$SHA_CLEAN" c
LABEL="M5 hostile: both channels agree on the WRONG SHA"
DEPLOY_VERIFY_PRINTENV_CMD="printf '%s' 'deadbeef1'" DEPLOY_VERIFY_INSPECT_CMD="printf '%s' 'deadbeef1'" expect_red deploy_ctx_verify_running "$SHA_CLEAN" c

echo "[deploy-provenance] restoration"
AFTER="$( (cat "$REAL_COMPOSE" "$SCRIPT_DIR/deploy-context.sh" "$SCRIPT_DIR/pre-deploy-gate.sh" "$SCRIPT_DIR/deploy-production.sh") | sha256sum | cut -c1-16)"
[ "$BEFORE" = "$AFTER" ] && ok "real tree untouched by the harness (sha256 $BEFORE)" || fail "real tree CHANGED during the harness ($BEFORE → $AFTER)"

echo
echo "[deploy-provenance] $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
