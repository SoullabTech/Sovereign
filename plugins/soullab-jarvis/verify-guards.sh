#!/usr/bin/env bash
# Proof harness for the soullab-jarvis hooks. Touches no real repository state
# except a throwaway temp dir. Run it before trusting any claim that these
# guards work.
#
#   ./plugins/soullab-jarvis/verify-guards.sh
set -uo pipefail
HOOKS="$(cd "$(dirname "${BASH_SOURCE[0]}")/hooks" && pwd)"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); printf "  PASS  %s\n" "$1"; }
no(){ FAIL=$((FAIL+1)); printf "  FAIL  %s\n        expected [%s] got [%s]\n" "$1" "$2" "$3"; }

decide() { # decide <json-payload>  -> permissionDecision or "allow(silent)"
  printf '%s' "$1" | python3 "$HOOKS/pretooluse-guard.py" 2>/dev/null \
    | python3 -c 'import json,sys
raw=sys.stdin.read().strip()
if not raw: print("allow(silent)"); raise SystemExit
try: print(json.loads(raw)["hookSpecificOutput"]["permissionDecision"])
except Exception: print("allow(silent)")'
}
chk(){ if [ "$2" = "$3" ]; then ok "$1"; else no "$1" "$3" "$2"; fi; }

bash_cmd(){ python3 -c 'import json,sys;print(json.dumps({"tool_name":"Bash","tool_input":{"command":sys.argv[1]},"transcript_path":""}))' "$1"; }
tool_call(){ python3 -c 'import json,sys;print(json.dumps({"tool_name":sys.argv[1],"tool_input":{},"transcript_path":sys.argv[2]}))' "$1" "${2:-}"; }

echo "== named-trap denials =="
chk "deletes .deploy.lock -> deny"            "$(decide "$(bash_cmd 'rm -f ~/MAIA-SOVEREIGN/.deploy.lock')")" deny
chk "bare production compose build -> deny"   "$(decide "$(bash_cmd 'docker compose -f docker-compose.production.yml up -d --build maia')")" deny
chk "sanctioned deploy lane -> allow"         "$(decide "$(bash_cmd 'scripts/pre-deploy-gate.sh deploy-maia abc1234')")" "allow(silent)"
chk "npm install @supabase -> deny"           "$(decide "$(bash_cmd 'npm install @supabase/supabase-js')")" deny
chk "force-push clean-main-no-secrets -> deny" "$(decide "$(bash_cmd 'git push --force origin clean-main-no-secrets')")" deny
chk "normal feature-branch push -> allow"     "$(decide "$(bash_cmd 'git push -u origin claude/my-feature')")" "allow(silent)"
chk "rm -rf \$HOME -> deny"                    "$(decide "$(bash_cmd 'rm -rf $HOME')")" deny
chk "ordinary rm -rf node_modules -> allow"   "$(decide "$(bash_cmd 'rm -rf node_modules')")" "allow(silent)"
chk "fuser inspection of lock -> allow"       "$(decide "$(bash_cmd 'fuser -v ~/MAIA-SOVEREIGN/.deploy.lock')")" "allow(silent)"

echo "== image isolation =="
LAB="$(mktemp -d "${TMPDIR:-/tmp}/jarvisguard.XXXXXX")"
trap 'rm -rf "$LAB"' EXIT
printf '%s\n' '{"isSidechain":false,"type":"assistant"}' > "$LAB/main.jsonl"
printf '%s\n' '{"isSidechain":true,"type":"assistant"}'  > "$LAB/side.jsonl"

chk "simulator control in main loop -> deny"  "$(decide "$(tool_call 'mcp__ios-simulator__control' "$LAB/main.jsonl")")" deny
chk "same tool inside subagent -> allow"      "$(decide "$(tool_call 'mcp__ios-simulator__control' "$LAB/side.jsonl")")" "allow(silent)"
chk "screenshot in main loop -> deny"         "$(decide "$(tool_call 'chrome_screenshot' "$LAB/main.jsonl")")" deny
chk "Read is never an image tool"             "$(decide "$(tool_call 'Read' "$LAB/main.jsonl")")" "allow(silent)"
chk "Grep is never an image tool"             "$(decide "$(tool_call 'Grep' "$LAB/main.jsonl")")" "allow(silent)"
chk "unknown transcript -> fail-open allow"   "$(decide "$(tool_call 'computer_batch' '/nonexistent/path.jsonl')")" "allow(silent)"
chk "JARVIS_IMAGE_ISOLATION=off -> allow"     "$(JARVIS_IMAGE_ISOLATION=off decide "$(tool_call 'computer_batch' "$LAB/main.jsonl")")" "allow(silent)"

echo "== fail-open =="
chk "malformed stdin -> allow"                "$(decide 'not json at all')" "allow(silent)"
chk "empty stdin -> allow"                    "$(decide '')" "allow(silent)"

echo "== stop hook =="
S1="$(printf '{"session_id":"proof-%s","cwd":"%s","stop_hook_active":true}' "$$" "$PWD" | python3 "$HOOKS/stop-close-out.py")"
chk "stop_hook_active -> silent (no loop)"    "${S1:-empty}" empty
chk "session-start emits valid JSON"          "$(bash "$HOOKS/session-start.sh" </dev/null | python3 -c 'import json,sys;print("ok" if json.load(sys.stdin)["hookSpecificOutput"]["hookEventName"]=="SessionStart" else "bad")')" ok

echo
printf "%d passed · %d failed\n" "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
