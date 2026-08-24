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

# Portable crash injector. BSD sed (macOS) rejects `s/../../; 1a\` -- GNU-only --
# so the broken copies are built with python3, which behaves the same on both.
break_copy(){ # break_copy <src> <dst>
  python3 -c 'import sys
src, dst = sys.argv[1], sys.argv[2]
lines = open(src, encoding="utf-8").read().splitlines(True)
lines.insert(0, "raise RuntimeError(\"simulated implementation error\")\n")
open(dst, "w", encoding="utf-8").writelines(lines)' "$1" "$2"; }

echo "== fail-open boundary under guard IMPLEMENTATION ERROR =="
# A broken guard must degrade to ALLOW. It must never emit a deny and never exit 2
# (exit 2 is the block signal). This is the documented fail-open boundary.
BROKE="$LAB/broken-guard.py"
break_copy "$HOOKS/pretooluse-guard.py" "$BROKE"
BOUT="$(printf '%s' "$(bash_cmd 'rm -f ~/MAIA-SOVEREIGN/.deploy.lock')" | python3 "$BROKE" 2>/dev/null)"; BRC=$?
chk "crashed guard: exit is not 2 (block)"   "$([ "$BRC" -ne 2 ] && echo ok || echo "exit$BRC")" ok
chk "crashed guard: emits no deny"           "$(printf '%s' "$BOUT" | grep -c deny)" 0

# Unreadable rule file must not turn into a deny either.
NORULES="$LAB/norules"; mkdir -p "$NORULES"
cp "$HOOKS/pretooluse-guard.py" "$NORULES/"   # no image-tools.txt alongside it
chk "missing image-tools.txt -> allow"       "$(printf '%s' "$(tool_call 'chrome_screenshot' "$LAB/main.jsonl")" | python3 "$NORULES/pretooluse-guard.py" 2>/dev/null | grep -c deny)" 0

echo "== stop hook =="
# A crashed Stop hook must never block session termination (exit 2 would).
BROKESTOP="$LAB/broken-stop.py"
break_copy "$HOOKS/stop-close-out.py" "$BROKESTOP"
SOUT="$(printf '{"session_id":"x","cwd":"%s","stop_hook_active":false}' "$PWD" | python3 "$BROKESTOP" 2>/dev/null)"; SRC=$?
chk "crashed stop hook: exit is not 2"       "$([ "$SRC" -ne 2 ] && echo ok || echo "exit$SRC")" ok
chk "crashed stop hook: no block decision"   "$(printf '%s' "$SOUT" | grep -c '"decision"')" 0
S2="$(printf '{"session_id":"proof2-%s","cwd":"%s","stop_hook_active":false}' "$$" "$PWD" | python3 "$HOOKS/stop-close-out.py" | python3 -c 'import json,sys;print("block" if json.load(sys.stdin).get("decision")=="block" else "no-block")')"
chk "healthy stop hook never blocks"         "$S2" no-block
S1="$(printf '{"session_id":"proof-%s","cwd":"%s","stop_hook_active":true}' "$$" "$PWD" | python3 "$HOOKS/stop-close-out.py")"
chk "stop_hook_active -> silent (no loop)"    "${S1:-empty}" empty
chk "session-start emits valid JSON"          "$(bash "$HOOKS/session-start.sh" </dev/null | python3 -c 'import json,sys;print("ok" if json.load(sys.stdin)["hookSpecificOutput"]["hookEventName"]=="SessionStart" else "bad")')" ok

echo
printf "%d passed · %d failed\n" "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
