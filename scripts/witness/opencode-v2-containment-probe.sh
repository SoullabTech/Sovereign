#!/usr/bin/env bash
# JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R1-D1 §1 — HOST IDENTITY & CONFIG PROVENANCE PROBE
#
# READ ONLY. This script does not write, move, delete or create any file, does
# not start an OpenCode server, does not invoke a model, does not mint or spend
# an execution grant, and does not touch production.
#
# VALUE DISCIPLINE. Configuration files in scope may contain credentials. This
# probe prints PATHS, PRESENCE and KEY NAMES only. It never prints a config
# value. If a section below would require a value to answer, it reports the
# question as UNANSWERED instead of answering it.
#
# Usage:  bash scripts/witness/opencode-v2-containment-probe.sh
# Record the complete output verbatim into the E3R1-D1 record, §1.

set -u

line() { printf '\n== %s ==\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

printf 'probe: opencode-v2-containment\n'
printf 'date_utc: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf 'host: %s\n' "$(hostname 2>/dev/null || echo unknown)"

line 'A1 — BINARY IDENTITY'
if have opencode; then
  printf 'resolved_path: %s\n' "$(command -v opencode)"
  printf 'version_output: '
  opencode --version 2>&1 | head -3
else
  printf 'opencode: NOT ON PATH — STOP, probe cannot continue\n'
  exit 2
fi

line 'A2 — RUN COMMAND SURFACE'
# If this hangs, abort with Ctrl-C and report it: a help invocation must not
# start a server. Do not let a probe create the ambient service it is testing for.
opencode run --help 2>&1 | head -60

line 'A3 — DEAD FLAG PRESENCE (expect: absent)'
if opencode run --help 2>&1 | grep -q -- '--pure'; then
  printf 'pure_flag: PRESENT — STOP: INSTRUMENT / INSTALLED-ARTIFACT DIVERGENCE\n'
else
  printf 'pure_flag: ABSENT (expected)\n'
fi
if opencode run --help 2>&1 | grep -q -- '--standalone'; then
  printf 'standalone_flag: PRESENT (expected)\n'
else
  printf 'standalone_flag: ABSENT — STOP: R-B cannot be satisfied as ruled\n'
fi

line 'B1 — AMBIENT SERVICE PRESENCE (observational; do not start one)'
pgrep -fl 'opencode' 2>/dev/null | sed 's/[[:space:]]\{1,\}/ /g' | head -10 || true
printf '(empty above means no opencode process was running at probe time)\n'

line 'B2 — CONFIG ROOTS IN EFFECT'
printf 'HOME: %s\n' "${HOME:-<unset>}"
for v in XDG_CONFIG_HOME XDG_DATA_HOME XDG_CACHE_HOME XDG_STATE_HOME \
         OPENCODE_CONFIG_DIR OPENCODE_CONFIG OPENCODE_CONFIG_CONTENT \
         OPENCODE_TEST_HOME OPENCODE_DISABLE_PROJECT_CONFIG OPENCODE_CONFIG_PROJECT_DISABLE; do
  printf '%s: %s\n' "$v" "$(printenv "$v" 2>/dev/null || echo '<unset>')"
done

line 'B3 — CONFIG SOURCE PRESENCE (paths and presence only)'
CFG="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
for p in "$CFG/opencode.json" "$CFG/opencode.jsonc" "$CFG/plugin" "$CFG/agent" "$CFG/agents" \
         "$HOME/.claude" "$HOME/.agents" "$HOME/.claude/agents"; do
  if [ -e "$p" ]; then printf 'PRESENT  %s\n' "$p"; else printf 'absent   %s\n' "$p"; fi
done

line 'B4 — GLOBAL CONFIG KEY NAMES ONLY (no values)'
if [ -f "$CFG/opencode.json" ] && have node; then
  node -e '
    const fs=require("fs");
    const raw=fs.readFileSync(process.argv[1],"utf8");
    let c; try{c=JSON.parse(raw)}catch(e){console.log("parse_error: "+e.message);process.exit(0)}
    console.log("top_level_keys: "+Object.keys(c).join(", "));
    console.log("provider_ids: "+Object.keys(c.provider||{}).join(", "));
    for(const [id,p] of Object.entries(c.provider||{})){
      console.log("  provider "+id+" models: "+Object.keys(p.models||{}).join(", "));
    }
    console.log("plugin_entries: "+JSON.stringify([...(c.plugin||[]),...(c.plugins||[])].map(v=>typeof v==="string"?v:(v&&v.package)||"<object>")));
    console.log("agent_keys: "+Object.keys(c.agent||c.agents||{}).join(", "));
  ' "$CFG/opencode.json"
else
  printf 'global opencode.json: absent or node unavailable — key listing UNANSWERED\n'
fi

line 'B5 — AGENT DEFINITION PROVENANCE (filenames only)'
for d in "$CFG/agent" "$CFG/agents" "$HOME/.claude/agents" "$HOME/.agents"; do
  if [ -d "$d" ]; then printf '%s:\n' "$d"; ls -1 "$d" 2>/dev/null | head -20 | sed 's/^/  /'; fi
done

line 'B6 — DOES jarvis-readonly EXIST OUTSIDE THE REPO?'
for d in "$CFG/agent" "$CFG/agents" "$HOME/.claude/agents" "$HOME/.agents"; do
  [ -d "$d" ] && find "$d" -maxdepth 2 -name 'jarvis-readonly*' 2>/dev/null | sed 's/^/  found: /'
done
printf '(no "found:" lines means the agent reaches a run only from the materialized sandbox)\n'

line 'C1 — NETWORK-CAPABLE SURFACES (presence of controls only; nothing contacted)'
for v in OPENCODE_DISABLE_MODELS_FETCH OPENCODE_MODELS_URL OPENCODE_MODELS_PATH \
         OPENCODE_DISABLE_AUTOUPDATE OTEL_EXPORTER_OTLP_ENDPOINT OTEL_EXPORTER_OTLP_HEADERS \
         HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY; do
  printf '%s: %s\n' "$v" "$(printenv "$v" >/dev/null 2>&1 && echo SET || echo '<unset>')"
done
printf '(SET/unset only — proxy and OTEL values may carry credentials)\n'

line 'C2 — SECOND INLINE CONFIG CHANNEL + AMBIENT PROVIDER CREDENTIALS (presence only)'
for v in OPENCODE_CLI_CONFIG_CONTENT OPENCODE_CONFIG_CONTENT OPENCODE_API_KEY OPENCODE_DB \
         OPENCODE_SERVER_PASSWORD OPENCODE_PASSWORD OPENCODE_LOG_LEVEL OPENCODE_PRINT_LOGS; do
  printf '%s: %s\n' "$v" "$(printenv "$v" >/dev/null 2>&1 && echo SET || echo '<unset>')"
done
for v in AWS_BEARER_TOKEN_BEDROCK AWS_REGION AZURE_RESOURCE_NAME GOOGLE_VERTEX_API_KEY \
         GOOGLE_CLOUD_PROJECT CLOUDFLARE_ACCOUNT_ID SNOWFLAKE_CORTEX_PAT GITLAB_TOKEN \
         MODAL_PROXY_TOKEN AICORE_SERVICE_KEY; do
  printf '%s: %s\n' "$v" "$(printenv "$v" >/dev/null 2>&1 && echo SET || echo '<unset>')"
done
printf '(presence only — no value is printed; these can authorize NON-authorized providers)\n'

line 'C3 — WELLKNOWN ORIGIN STORE + PROVIDER PACKAGE ROOT (presence only)'
for p in "$CFG/auth.json" "${XDG_DATA_HOME:-$HOME/.local/share}/opencode" \
         "${XDG_DATA_HOME:-$HOME/.local/share}/opencode/node_modules" \
         "${XDG_CACHE_HOME:-$HOME/.cache}/opencode"; do
  if [ -e "$p" ]; then printf 'PRESENT  %s\n' "$p"; else printf 'absent   %s\n' "$p"; fi
done

line 'C4 — ANCESTOR CONFIG ON THE SANDBOX WALK (TMPDIR to /)'
d="$(cd "${TMPDIR:-/tmp}" && pwd -P)"
while :; do
  for n in opencode.json opencode.jsonc .opencode .claude .agents AGENTS.md; do
    [ -e "$d/$n" ] && printf 'PRESENT  %s/%s\n' "$d" "$n"
  done
  parent="$(dirname "$d")"; [ "$parent" = "$d" ] && break; d="$parent"
done
printf '(any line above is an ambient source reachable by the unbounded config walk)\n'

line 'PROBE COMPLETE — read-only, nothing written'
