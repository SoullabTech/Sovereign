#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Self-test for the deploy-lane lock RECORD (scripts/deploy-lock.sh)
# ═══════════════════════════════════════════════════════════════════════════════
# On 2026-09-03 a `pre-deploy-gate.sh deploy-maia eeb3fbb` was refused by the
# lane lock while `deploy-production.sh deploy <SHA>` was in flight. The refusal
# printed `git_commit=5370b42a3` — the SHARED CHECKOUT's stale HEAD (286 commits
# behind), not the SHA the in-flight deploy had been given. It read as "someone
# is deploying a nine-day-old commit"; the container that deploy produced was
# stamped with the asserted tip. The record fell back to `git rev-parse HEAD`
# because the lock was taken before GIT_COMMIT was exported from the argument.
#
# This test reproduces that shape against a THROWAWAY repo (no docker, no
# network) and asserts:
#
#   1. Refusal shows the ASSERTED target — a deploy holding the lock with
#      target <SHA-B> while the checkout sits on <SHA-A> writes
#      `target_sha=<B>`; the refusal a second deploy sees prints <B>; the stale
#      checkout HEAD appears only as an explicitly labelled `checkout_head=`.
#   2. No `git_commit=` line — the ambiguous field is gone.
#   3. Equal target/HEAD — `checkout_head=` is NOT printed (nothing to disambiguate).
#   4. DEPLOY_ALLOW_HEAD=1 with no SHA — the record says the checkout tip is the
#      target BY ACKNOWLEDGEMENT, and names it.
#   5. No SHA, no ack — `target=none`, `target_sha=n/a`.
#   6. A ref that is not a commit — recorded verbatim, `target_sha=n/a (...)`.
#   7. deploy_lock_record_target — re-writes the target fields (update's
#      pull-then-name flow) with the same pid/entry.
#   8. Lock semantics untouched — a second acquirer is refused while the holder
#      lives (exit 1) and succeeds once the holder exits; the "never delete the
#      lockfile" guidance is still printed.
#
# Run anywhere git + flock are available:  scripts/verify-deploy-lock-record.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(mktemp -d "${TMPDIR:-/tmp}/deploy-lock-selftest.XXXXXX")"
REPO="$ROOT/repo"
export PROJECT_DIR="$REPO"
export DEPLOY_LOCK_FILE="$ROOT/.deploy.lock"
unset DEPLOY_ALLOW_HEAD GIT_COMMIT DEPLOY_SOURCE_REPO || true

cleanup() { rm -rf "$ROOT"; }
trap cleanup EXIT

PASS=0; FAIL=0
ok()   { echo "  ok:   $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }
assert_grep()     { if grep -qE -- "$2" "$1"; then ok "$3"; else fail "$3 — expected /$2/ in:"; sed 's/^/        | /' "$1"; fi; }
assert_not_grep() { if grep -qE -- "$2" "$1"; then fail "$3 — must NOT match /$2/:"; sed 's/^/        | /' "$1"; else ok "$3"; fi; }

git_repo() { git -C "$REPO" -c user.email=selftest@maia -c user.name=selftest "$@"; }

# ── Setup: stale checkout (A) vs. newer target (B) ─────────────────────────────
echo "[selftest] throwaway repo: A (stale checkout HEAD) → B (the SHA a deploy names)"
mkdir -p "$REPO"; git -C "$REPO" init -q
echo one > "$REPO/f"; git_repo add f; git_repo commit -qm "A: stale checkout"
SHA_A="$(git -C "$REPO" rev-parse --short HEAD)"
echo two > "$REPO/f"; git_repo add f; git_repo commit -qm "B: deploy target"
SHA_B="$(git -C "$REPO" rev-parse --short HEAD)"
git -C "$REPO" checkout -q "$SHA_A"        # the shared checkout is BEHIND the target
[ "$(git -C "$REPO" rev-parse --short HEAD)" = "$SHA_A" ] || { echo "setup failed"; exit 1; }

# A "holder" that takes the lock with the given label/target, signals readiness,
# then sleeps until told to exit — exactly a long build holding fd 9.
HOLDER_SCRIPT="$ROOT/holder.sh"
cat > "$HOLDER_SCRIPT" <<HOLD
#!/usr/bin/env bash
set -euo pipefail
export PROJECT_DIR="$REPO" DEPLOY_LOCK_FILE="$DEPLOY_LOCK_FILE"
source "$SCRIPT_DIR/deploy-lock.sh"
acquire_deploy_lock "\$1" "\${2:-}"
touch "$ROOT/holder.ready"
while [ ! -f "$ROOT/holder.release" ]; do sleep 0.1; done
HOLD
chmod +x "$HOLDER_SCRIPT"

start_holder() {
    rm -f "$ROOT/holder.ready" "$ROOT/holder.release"
    "$HOLDER_SCRIPT" "$@" 2>"$ROOT/holder.err" &
    HOLDER_PID=$!
    for _ in $(seq 1 50); do [ -f "$ROOT/holder.ready" ] && return 0; sleep 0.1; done
    echo "holder did not start:"; cat "$ROOT/holder.err"; exit 1
}
stop_holder() { touch "$ROOT/holder.release"; wait "$HOLDER_PID" 2>/dev/null || true; }

# A second acquirer: returns its exit status, captures stderr.
try_acquire() {
    ( export PROJECT_DIR="$REPO" DEPLOY_LOCK_FILE="$DEPLOY_LOCK_FILE"
      source "$SCRIPT_DIR/deploy-lock.sh"
      acquire_deploy_lock "$1" "${2:-}" ) >/dev/null 2>"$ROOT/second.err"
}

# ── 1–2. The 2026-09-03 shape: holder deploys B while the checkout sits on A ───
echo "[selftest] 1–2. refusal names the asserted SHA, not the stale checkout"
start_holder "deploy-production.sh deploy" "$SHA_B"
assert_grep "$DEPLOY_LOCK_FILE" "^entry=deploy-production.sh deploy$" "record: entry label"
assert_grep "$DEPLOY_LOCK_FILE" "^target=$SHA_B$"                     "record: target= is the command-line argument verbatim"
assert_grep "$DEPLOY_LOCK_FILE" "^target_sha=$SHA_B$"                 "record: target_sha= is the ASSERTED SHA ($SHA_B), not HEAD ($SHA_A)"
assert_grep "$DEPLOY_LOCK_FILE" "^checkout_head=$SHA_A .*NOT the deploy target" "record: stale checkout HEAD is labelled informational"
assert_not_grep "$DEPLOY_LOCK_FILE" "^git_commit="                    "record: ambiguous git_commit= field is gone"
if try_acquire "pre-deploy-gate.sh deploy-maia" "$SHA_B"; then fail "second deploy was NOT refused while holder alive"; else ok "second deploy refused (exit 1) while holder alive"; fi
assert_grep "$ROOT/second.err" "DEPLOY REFUSED"                       "refusal: existing refusal text intact"
assert_grep "$ROOT/second.err" "target_sha=$SHA_B"                    "refusal: prints the holder's asserted SHA"
assert_grep "$ROOT/second.err" "checkout_head=$SHA_A"                 "refusal: prints the checkout HEAD only as labelled context"
assert_grep "$ROOT/second.err" "Do NOT delete the lockfile"           "refusal: never-delete-the-lockfile guidance intact"
assert_grep "$ROOT/second.err" "pid $HOLDER_PID is ALIVE"             "refusal: holder pid reported alive"
stop_holder

# ── 3. Target equals HEAD → no checkout_head line ──────────────────────────────
echo "[selftest] 3. target == checkout HEAD → nothing to disambiguate"
start_holder "deploy-production.sh deploy" "$SHA_A"
assert_grep     "$DEPLOY_LOCK_FILE" "^target_sha=$SHA_A$" "record: target_sha = HEAD"
assert_not_grep "$DEPLOY_LOCK_FILE" "^checkout_head="     "record: checkout_head= omitted when equal"
stop_holder

# ── 4. DEPLOY_ALLOW_HEAD=1, no SHA → acknowledged checkout tip ────────────────
echo "[selftest] 4. DEPLOY_ALLOW_HEAD=1 with no SHA"
DEPLOY_ALLOW_HEAD=1 start_holder "pre-deploy-gate.sh deploy-maia" ""
assert_grep     "$DEPLOY_LOCK_FILE" "^target=HEAD .*DEPLOY_ALLOW_HEAD=1.*acknowledged" "record: says the checkout tip is the target by ack"
assert_grep     "$DEPLOY_LOCK_FILE" "^target_sha=$SHA_A$"                            "record: names the acknowledged tip"
assert_not_grep "$DEPLOY_LOCK_FILE" "^checkout_head="                                "record: no checkout_head (it IS the target)"
stop_holder

# ── 5. No SHA, no ack ──────────────────────────────────────────────────────────
echo "[selftest] 5. no SHA, no ack"
start_holder "deploy-production.sh deploy" ""
assert_grep "$DEPLOY_LOCK_FILE" "^target=none \(no SHA named" "record: target=none"
assert_grep "$DEPLOY_LOCK_FILE" "^target_sha=n/a$"            "record: target_sha=n/a"
stop_holder

# ── 6. Not a commit ────────────────────────────────────────────────────────────
echo "[selftest] 6. a target that is not a commit (rollback / bogus ref)"
start_holder "deploy-production.sh rollback" "maia-sovereign:previous (image tag swap; no commit is built)"
assert_grep "$DEPLOY_LOCK_FILE" "^target=maia-sovereign:previous" "record: target recorded verbatim"
assert_grep "$DEPLOY_LOCK_FILE" "^target_sha=n/a \(not a commit"  "record: target_sha=n/a, labelled"
stop_holder

# ── 7. deploy_lock_record_target (update's pull-then-name flow) ───────────────
echo "[selftest] 7. record re-written once the target is known"
( export PROJECT_DIR="$REPO" DEPLOY_LOCK_FILE="$DEPLOY_LOCK_FILE"
  source "$SCRIPT_DIR/deploy-lock.sh"
  acquire_deploy_lock "deploy-production.sh update" "pending (tip pulled by git pull)" 2>/dev/null
  cp "$DEPLOY_LOCK_FILE" "$ROOT/before"
  deploy_lock_record_target "$SHA_B" 2>/dev/null
  cp "$DEPLOY_LOCK_FILE" "$ROOT/after" )
assert_grep "$ROOT/before" "^target=pending"     "before: pending target recorded"
assert_grep "$ROOT/before" "^target_sha=n/a"     "before: unresolved"
assert_grep "$ROOT/after"  "^target_sha=$SHA_B$" "after: target_sha re-written to the named SHA"
if [ "$(sed -n 's/^pid=//p' "$ROOT/before")" = "$(sed -n 's/^pid=//p' "$ROOT/after")" ] \
   && [ "$(sed -n 's/^started=//p' "$ROOT/before")" = "$(sed -n 's/^started=//p' "$ROOT/after")" ]; then
    ok "after: pid/started preserved across re-write"; else fail "after: pid/started changed"; fi

# ── 8. Lock semantics unchanged: released once the holder tree exits ──────────
echo "[selftest] 8. lane free again after the holder exits"
if try_acquire "pre-deploy-gate.sh deploy-maia" "$SHA_B"; then ok "acquire succeeds once the holder has exited (auto-release)"; else fail "lane still locked after holder exit"; cat "$ROOT/second.err"; fi

echo ""
echo "[selftest] $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
