#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# AIN Builder OS — Delegation Control Plane primitive
# ═══════════════════════════════════════════════════════════════════════════════
# Founder-authorized 2026-08-09: DESIGN + BOUNDED IMPLEMENTATION.
# See docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md for the architecture,
# docs/ops/AIN_WORK_PACKET_CONTRACT.md / AIN_RESULT_CONTRACT.md for the schemas.
#
# This wraps the EXISTING lanes — it does not replace or redesign them:
#   local  -> ~/bin/maia-code        (Ollama maia-coder:latest / qwen3-coder)
#   kimi   -> ~/.local/bin/kimi-cc   (Moonshot Kimi K2.7-code / K3)
#   claude -> plain `claude`         (Unit 6, 2026-08-09 — Claude as a governed worker,
#                                     not the orchestrator; no wrapper binary needed —
#                                     the governance is in the flags + the worktree)
# local/kimi are thin wrappers that exec `claude "$@"` with a lane-specific env; the
# claude lane invokes the real binary directly. All three share one path: claim an
# isolated worktree, build a bounded prompt from a work packet, run the worker inside
# that worktree, then independently verify (never trust the delegate's self-report) and
# write a compact result contract. The founder's *interactive* `claude` session is never
# touched by any of this — this only ever launches a separate, governed subprocess.
#
# Usage:
#   ain-delegate.sh new      <work_unit_id>
#   ain-delegate.sh claim    <work_unit_id>
#   ain-delegate.sh local    <work_unit_id>
#   ain-delegate.sh kimi     <work_unit_id>
#   ain-delegate.sh claude   <work_unit_id> [model]   # model default: sonnet, explicit not implicit
#   ain-delegate.sh result   <work_unit_id>
#   ain-delegate.sh review   <work_unit_id>
#   ain-delegate.sh escalate <work_unit_id> "<reason>"
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AIN_HOME="${AIN_DELEGATION_HOME:-$HOME/.claude/ain-delegation}"
PACKETS_DIR="$AIN_HOME/packets"
RESULTS_DIR="$AIN_HOME/results"
LOGS_DIR="$AIN_HOME/logs"
LEDGER="$AIN_HOME/episodes.jsonl"
CLAIM_SCRIPT="$PROJECT_DIR/scripts/ain-worktree-claim.sh"
SESSION_SCRIPT="$PROJECT_DIR/scripts/builder/session.mjs"
WORK_UNIT_SCRIPT="$PROJECT_DIR/scripts/builder/work-unit.mjs"

mkdir -p "$PACKETS_DIR" "$RESULTS_DIR" "$LOGS_DIR"

_packet_file() { echo "$PACKETS_DIR/$1.json"; }
_result_file() { echo "$RESULTS_DIR/$1.json"; }
_log_file()    { echo "$LOGS_DIR/$1.log"; }

_require_packet() {
    local f
    f="$(_packet_file "$1")"
    if [ ! -f "$f" ]; then
        echo "🛑 no packet for work unit '$1' — run: ain-delegate.sh new $1" >&2
        exit 1
    fi
    echo "$f"
}

cmd_new() {
    local work_unit_id="${1:?work_unit_id required}"
    local f
    f="$(_packet_file "$work_unit_id")"
    if [ -f "$f" ]; then
        echo "🛑 packet already exists: $f (edit it directly, or pick a new work_unit_id)" >&2
        exit 1
    fi
    local base_sha
    base_sha="$(git -C "$PROJECT_DIR" rev-parse --short HEAD)"
    jq -n \
        --arg id "$work_unit_id" \
        --arg sha "$base_sha" \
        '{
            work_unit_id: $id,
            title: "FILL IN",
            objective: "FILL IN — conclusion-level, not exploratory",
            execution_lane: "local",
            canonical_sha: $sha,
            branch: ("chore/ain-delegate-" + $id),
            worktree: null,
            governing_authority: "none — mechanical task",
            established_facts: [],
            allowed_files: [],
            prohibited_files_actions: [],
            acceptance_criteria: [],
            verification_commands: [],
            escalation_conditions: [],
            max_attempts: 2,
            expected_output: "FILL IN"
        }' > "$f"
    echo "[ain-delegate] scaffolded packet: $f" >&2
    echo "  edit it, then: ain-delegate.sh claim $work_unit_id && ain-delegate.sh <local|kimi> $work_unit_id" >&2
    echo "$f"
}

cmd_claim() {
    local work_unit_id="${1:?work_unit_id required}"
    local f branch sha worktree_path
    f="$(_require_packet "$work_unit_id")"
    branch="$(jq -r '.branch' "$f")"
    sha="$(jq -r '.canonical_sha' "$f")"
    worktree_path="$("$CLAIM_SCRIPT" claim "$work_unit_id" "$branch" "$sha")"
    jq --arg wt "$worktree_path" '.worktree = $wt' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
    echo "$worktree_path"
}

# ─── Unit 6 (2026-08-09): derive the Claude harness's --permission-mode from the
# canonical Work Unit's authority, not hard-code it. Unlike local/kimi (fixed with a
# blanket bypassPermissions in Unit 2, before this derivation function existed -- left
# unretrofitted, out of this unit's scope), this is the first real consumer of
# work-unit.mjs's derivePermissionEnvelope(). The translation is provider-specific
# (Claude Code's actual flag name) and therefore belongs HERE, in the adapter -- never
# in the canonical Work Unit itself (directive §6).
_claude_permission_mode() {
    local work_unit_id="$1" envelope scope
    envelope="$(node "$WORK_UNIT_SCRIPT" permission-envelope "$work_unit_id" 2>/dev/null)" \
        || { echo "🛑 could not derive a permission envelope for '$work_unit_id' — refusing to guess a mode." >&2; return 1; }
    scope="$(echo "$envelope" | jq -r '.repo_write_scope')"
    if [ "$scope" = "worktree" ]; then
        # Bounded, not broad: the same envelope that authorizes worktree-scoped writes
        # is what the isolated worktree (Unit 3) and independent re-verification
        # (never trust self-report) already structurally contain.
        echo "bypassPermissions"
    elif [ "$scope" = "none" ]; then
        echo "plan"   # read/reason only -- the envelope did not authorize mutation
    else
        echo "🛑 unrecognized repo_write_scope '$scope' — refusing to guess a permission mode." >&2
        return 1
    fi
}

_build_prompt() {
    local f="$1"
    # Unit 8 precision context router: if the packet declares context_selectors,
    # JARVIS materializes the exact source ranges itself (with provenance) and
    # injects them, so the worker never opens whole files. Additive: a packet
    # without context_selectors produces an empty block and behaves as before.
    # Fails CLOSED on budget overflow — exit 5 = CONTEXT_BUDGET_EXCEEDED.
    local frags=""
    if [ "$(jq -r '(.context_selectors // []) | length' "$f")" -gt 0 ]; then
        frags="$(node "$PROJECT_DIR/scripts/builder/jarvis-context.mjs" materialize "$f" --repo "$(jq -r '.worktree' "$f")")" || {
            echo "🛑 [ain-delegate] CONTEXT_BUDGET_EXCEEDED or selector error — worker NOT invoked." >&2
            exit 5
        }
    fi
    jq -r --arg frags "$frags" '
        "You are executing ONE bounded AIN Builder OS work unit. Do not exceed its scope.\n\n" +
        "OBJECTIVE:\n" + .objective + "\n\n" +
        "GOVERNING AUTHORITY: " + .governing_authority + "\n\n" +
        "ESTABLISHED FACTS (do not re-derive or re-litigate):\n" +
        (if (.established_facts | length) > 0 then ([.established_facts[] | ("- " + .)] | join("\n")) else "(none)" end) + "\n\n" +
        "ALLOWED FILES:\n" +
        (if (.allowed_files | length) > 0 then ([.allowed_files[] | ("- " + .)] | join("\n")) else "(unrestricted — but stay minimal)" end) + "\n\n" +
        "PROHIBITED FILES/ACTIONS:\n" +
        (if (.prohibited_files_actions | length) > 0 then ([.prohibited_files_actions[] | ("- " + .)] | join("\n")) else "(none declared)" end) + "\n\n" +
        "ACCEPTANCE CRITERIA:\n" +
        (if (.acceptance_criteria | length) > 0 then ([.acceptance_criteria[] | ("- " + .)] | join("\n")) else "(none declared)" end) + "\n\n" +
        "VERIFICATION COMMANDS (will be re-run independently after you finish):\n" +
        (if (.verification_commands | length) > 0 then ([.verification_commands[] | ("- " + .)] | join("\n")) else "(none declared)" end) + "\n\n" +
        "ESCALATION CONDITIONS — if any apply, STOP and print a line starting with exactly `ESCALATE_TO_CLAUDE:` followed by the exact ambiguity. Do not guess:\n" +
        (if (.escalation_conditions | length) > 0 then ([.escalation_conditions[] | ("- " + .)] | join("\n")) else "(none declared beyond the standing authority firewall)" end) + "\n\n" +
        "STANDING AUTHORITY FIREWALL (always in force): you may execute settled decisions. You may NOT silently establish constitutional architecture, member authority, consent semantics, confidentiality semantics, provenance semantics, epistemic authority, destructive migration policy, security boundaries, founder rulings, ontology, or deprecation of important capability. Hitting one of these is an ESCALATE_TO_CLAUDE, not a judgment call.\n\n" +
        (if ($frags | length) > 0 then $frags + "\n\n" else "" end) +
        "EXPECTED OUTPUT: " + .expected_output + "\n\n" +
        "When done, commit your changes with `git add -A && git commit -m \"...\"` in this worktree. Keep the diff minimal and inside ALLOWED FILES."
    ' "$f"
}

_run_lane() {
    local lane="$1" work_unit_id="$2" model_override="${3:-}"
    local f wt starting_sha exit_code log ending_sha prompt cmd branch model
    f="$(_require_packet "$work_unit_id")"
    wt="$(jq -r '.worktree // empty' "$f")"
    if [ -z "$wt" ] || [ ! -d "$wt" ]; then
        wt="$(cmd_claim "$work_unit_id")"
    fi
    branch="$(jq -r '.branch' "$f")"
    if [ "$lane" = "local" ]; then model="maia-coder:latest"
    elif [ "$lane" = "kimi" ]; then model="kimi-k2.7-code"
    elif [ "$lane" = "claude" ]; then
        # Unit 6 (2026-08-09): EXPLICIT default, never an implicit Opus-because-Claude
        # default. "sonnet" is a deliberate, documented, cheap-tier choice -- not a
        # discovered Builder policy (none existed to discover; recorded as this unit's
        # own choice in docs/architecture/BUILDER_OS_CLAUDE_ADAPTER_2026-08-09.md).
        model="${model_override:-sonnet}"
    else model="UNKNOWN"; fi

    # ─── Unit 3 convergence (2026-08-09): physical worktree existing is not the
    # same fact as Builder WRITE ownership existing. Register the claim HERE,
    # after the physical worktree is confirmed and before any worker touches it.
    # A REFUSAL (another writer already owns this branch/worktree, or Claude
    # capacity is unrelated but the worktree slot is taken) must STOP delegation,
    # not merely be logged — an unverified writer is not a writer.
    local sid
    sid="$(jq -r '.builder_session_id // empty' "$f")"
    if [ -n "$sid" ]; then
        local check_out check_code
        set +e
        check_out="$(node "$SESSION_SCRIPT" check --session "$sid" 2>&1)"
        check_code=$?
        set -e
        if [ "$check_code" -eq 2 ]; then
            # COLLISION, not staleness — the session is active but the artifact moved
            # underneath it. This is the exact "contended -> STOP" invariant, not a
            # cue to silently reclaim. Do not continue generating evidence.
            echo "🛑 [ain-delegate] CONTENDED — Builder claim $sid for '$work_unit_id' has an active collision:" >&2
            echo "$check_out" >&2
            echo "   Resolve via: node $SESSION_SCRIPT sync --session $sid --reason \"<why>\", or close/recover explicitly." >&2
            exit 2
        elif [ "$check_code" -ne 0 ]; then
            sid=""   # not active (closed/handed-off) or record gone — safe to reclaim below
        fi
    fi
    if [ -z "$sid" ]; then
        local open_out open_code
        set +e
        open_out="$(node "$SESSION_SCRIPT" open --unit "$work_unit_id" --branch "$branch" \
            --worktree "$wt" --model "$model" 2>&1)"
        open_code=$?
        set -e
        if [ "$open_code" -ne 0 ]; then
            echo "🛑 [ain-delegate] Builder WRITE ownership REFUSED for '$work_unit_id':" >&2
            echo "$open_out" >&2
            echo "   Delegation stopped before invoking any worker — an unowned worktree is not a governed workspace." >&2
            exit 1
        fi
        # session.mjs writes its diagnostics to stderr and the bare session id to stdout
        # LAST — merged via 2>&1 above so failures stay fully visible, so the id itself
        # is exactly the final line, not the whole diagnostic blob.
        sid="$(printf '%s\n' "$open_out" | tail -1)"
        jq --arg sid "$sid" '.builder_session_id = $sid' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
        echo "[ain-delegate] Builder WRITE ownership registered: $sid" >&2
    else
        echo "[ain-delegate] reusing existing Builder WRITE claim: $sid" >&2
    fi

    log="$(_log_file "$work_unit_id")"
    starting_sha="$(git -C "$wt" rev-parse --short HEAD)"
    prompt="$(_build_prompt "$f")"

    local t0 t1
    t0="$(date +%s)"
    set +e
    # Harness fix found by MVJ Kimi proving-case run (2026-08-09): neither lane wrapper
    # passes a permission mode, and no settings.json permission allow-list exists (checked:
    # neither ~/.claude/settings.json nor a project .claude/settings.json define one). In
    # headless -p mode that makes every Write/Bash call require an interactive approval
    # that can never come — BOTH lanes independently asked for/claimed missing permission
    # (Kimi: "Could you approve the Write tool?"; local: "cannot use Bash tool due to
    # permission restrictions") for what is functionally the same root cause, not two
    # unrelated worker defects. --permission-mode bypassPermissions is the documented flag
    # for exactly this case. The actual safety boundary here is structural, not the
    # interactive prompt: the worker runs inside an isolated git worktree (Unit 3) it
    # cannot escape, and every claim is independently re-verified afterward regardless of
    # what the worker did (never trust self-report — AIN_RESULT_CONTRACT.md).
    if [ "$lane" = "local-native" ]; then
        # Unit 9: native transport. No Claude Code CLI, therefore no system prompt,
        # no tool schemas, no MCP definitions, no auto-loaded CLAUDE.md — the model
        # sees EXACTLY the packet prompt. Viable only because Unit 8 materializes the
        # source fragments: a toolless worker needs its evidence handed to it.
        local pf; pf="$(mktemp -t jarvis-prompt)"
        printf '%s' "$prompt" > "$pf"
        ( cd "$wt" && node "$PROJECT_DIR/scripts/builder/jarvis-local-worker.mjs" \
            run --prompt-file "$pf" ) > "$log" 2>&1
        exit_code=$?
        rm -f "$pf"
    elif [ "$lane" = "local" ]; then
        ( cd "$wt" && maia-code -p "$prompt" --permission-mode bypassPermissions ) > "$log" 2>&1
        exit_code=$?
    elif [ "$lane" = "kimi" ]; then
        local class why
        class="$(jq -r '.execution_lane' "$f")"
        why="$(jq -r '.objective' "$f" | cut -c1-100)"
        ( cd "$wt" && kimi-cc --class "$class" --why "$why" -p "$prompt" --permission-mode bypassPermissions ) > "$log" 2>&1
        exit_code=$?
    elif [ "$lane" = "claude" ]; then
        # Unit 6: Claude as a governed worker, not the orchestrator. Plain `claude` --
        # no wrapper binary needed the way local/kimi needed provider redirection; the
        # governance is entirely in the flags and the worktree it runs inside.
        local perm_mode
        perm_mode="$(_claude_permission_mode "$work_unit_id")" || exit 1
        ( cd "$wt" && claude -p "$prompt" --model "$model" --permission-mode "$perm_mode" ) > "$log" 2>&1
        exit_code=$?
    else
        echo "🛑 unknown lane: $lane" >&2
        exit 2
    fi
    set -e
    t1="$(date +%s)"

    ending_sha="$(git -C "$wt" rev-parse --short HEAD)"
    [ "$ending_sha" = "$starting_sha" ] && ending_sha=""

    # Bug found by AIN Builder OS MVJ Unit 2 (2026-08-09): `head -n -1` is a GNU coreutils
    # extension. macOS/BSD `head` rejects it outright ("illegal line count -- -1"), which
    # corrupted files_changed_json on every prior run on this machine and cascaded into
    # `jq: invalid JSON text passed to --argjson` — silently preventing ANY local-lane
    # result from ever being persisted, regardless of what the worker did. `--name-only`
    # gives the file list directly; no stat-line parsing to break in the first place.
    local files_changed_json
    files_changed_json="$(git -C "$wt" diff --name-only "$starting_sha" 2>/dev/null | jq -R . | jq -s . 2>/dev/null || echo '[]')"

    local escalation_required=false unresolved_questions_json='[]'
    if grep -q '^ESCALATE_TO_CLAUDE:' "$log" 2>/dev/null; then
        escalation_required=true
        unresolved_questions_json="$(grep '^ESCALATE_TO_CLAUDE:' "$log" | sed 's/^ESCALATE_TO_CLAUDE: *//' | jq -R . | jq -s .)"
    fi

    local test_results="not_run"
    local verification_evidence=""
    local vcount
    vcount="$(jq '.verification_commands | length' "$f")"
    if [ "$vcount" -gt 0 ]; then
        local all_pass=true
        while IFS= read -r vcmd; do
            [ -z "$vcmd" ] && continue
            if ( cd "$wt" && eval "$vcmd" ) >> "$log.verify" 2>&1; then
                verification_evidence="${verification_evidence}PASS: $vcmd\n"
            else
                verification_evidence="${verification_evidence}FAIL: $vcmd\n"
                all_pass=false
            fi
        done < <(jq -r '.verification_commands[]' "$f")
        if $all_pass; then test_results="pass"; else test_results="fail"; fi
    fi

    local recommended="review-diff"
    if $escalation_required; then
        recommended="escalate"
    elif [ "$exit_code" -ne 0 ]; then
        recommended="reject"
    elif [ "$test_results" = "pass" ] || [ "$test_results" = "not_run" ]; then
        recommended="review-diff"
    else
        recommended="reject"
    fi

    # model already resolved above, before Builder ownership registration.

    jq -n \
        --arg wid "$work_unit_id" \
        --arg lane "$lane" \
        --arg model "$model" \
        --arg starting_sha "$starting_sha" \
        --arg ending_sha "$ending_sha" \
        --argjson files_changed "$files_changed_json" \
        --arg test_results "$test_results" \
        --arg evidence "$verification_evidence" \
        --argjson escalation_required "$escalation_required" \
        --argjson unresolved_questions "$unresolved_questions_json" \
        --arg recommended "$recommended" \
        --arg log_path "$log" \
        --argjson duration_s "$((t1 - t0))" \
        --argjson exit_code "$exit_code" \
        '{
            work_unit_id: $wid,
            lane: $lane,
            model: $model,
            starting_sha: $starting_sha,
            ending_sha: (if $ending_sha == "" then null else $ending_sha end),
            files_changed: $files_changed,
            summary: ("delegate exited " + ($exit_code|tostring) + "; see log_path for transcript"),
            tests_run: [],
            test_results: $test_results,
            typecheck_result: "not_run",
            build_result: "not_run",
            evidence: $evidence,
            uncertainties: [],
            scope_deviations: [],
            escalation_required: $escalation_required,
            unresolved_questions: $unresolved_questions,
            recommended_next_action: $recommended,
            log_path: $log_path,
            duration_s: $duration_s,
            attempts: 1
        }' > "$(_result_file "$work_unit_id")"

    # Observability ledger — one line per delegated run.
    jq -n \
        --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg wid "$work_unit_id" \
        --arg lane "$lane" \
        --argjson escalation_required "$escalation_required" \
        --arg test_results "$test_results" \
        --argjson exit_code "$exit_code" \
        --argjson duration_s "$((t1 - t0))" \
        '{ts: $ts, work_unit_id: $wid, lane: $lane, escalation_required: $escalation_required, test_results: $test_results, exit_code: $exit_code, duration_s: $duration_s}' \
        >> "$LEDGER"

    echo "[ain-delegate] $lane run complete for '$work_unit_id' — exit=$exit_code tests=$test_results escalate=$escalation_required" >&2
    cat "$(_result_file "$work_unit_id")"
}

cmd_local()  { _run_lane "local" "$1"; }
cmd_kimi()   { _run_lane "kimi" "$1"; }
cmd_claude() { _run_lane "claude" "$1" "${2:-}"; }   # optional model, e.g. `claude <id> opus`

cmd_result() {
    local f
    f="$(_result_file "$1")"
    [ -f "$f" ] || { echo "🛑 no result yet for '$1'" >&2; exit 1; }
    jq . "$f"
}

cmd_review() {
    local work_unit_id="$1"
    local pf wt
    pf="$(_require_packet "$work_unit_id")"
    wt="$(jq -r '.worktree // empty' "$pf")"
    echo "=== packet: $pf ==="
    jq '{title, objective, execution_lane, acceptance_criteria}' "$pf"
    if [ -n "$wt" ] && [ -d "$wt" ]; then
        echo "=== diff in $wt (vs canonical_sha) ==="
        git -C "$wt" diff --stat "$(jq -r '.canonical_sha' "$pf")" || true
    fi
    echo "=== result ==="
    cmd_result "$work_unit_id" || echo "(no result yet)"
}

cmd_escalate() {
    local work_unit_id="${1:?work_unit_id required}"
    local reason="${2:?reason required}"
    jq -n \
        --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg wid "$work_unit_id" \
        --arg reason "$reason" \
        '{ts: $ts, work_unit_id: $wid, lane: "manual-escalation", escalation_required: true, reason: $reason}' \
        >> "$LEDGER"
    echo "[ain-delegate] escalated '$work_unit_id': $reason" >&2
}

# ─── Unit 3 convergence: release BOTH halves of the workspace, not just one.
# Releasing only the physical worktree (ain-worktree-claim.sh alone) would leave
# a phantom Builder WRITE claim nothing can ever clear except manual recovery.
# Releasing only the Builder claim would leave the physical worktree lock held.
# `state` follows session.mjs's own vocabulary (completed|handed-off|paused|abandoned).
cmd_release() {
    local work_unit_id="${1:?work_unit_id required}"
    local state="${2:-completed}"
    local f sid
    f="$(_require_packet "$work_unit_id")"
    sid="$(jq -r '.builder_session_id // empty' "$f")"
    if [ -n "$sid" ]; then
        node "$SESSION_SCRIPT" close --session "$sid" --state "$state" >&2 \
            || echo "⚠️  [ain-delegate] Builder claim release reported an issue for $sid — inspect: node $SESSION_SCRIPT status" >&2
        jq 'del(.builder_session_id)' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
    else
        echo "[ain-delegate] no live Builder claim recorded for '$work_unit_id' — nothing to release there" >&2
    fi
    "$CLAIM_SCRIPT" release "$work_unit_id" >&2
    echo "[ain-delegate] released '$work_unit_id' (state=$state) — worktree left in place, ownership cleared" >&2
}

case "${1:-}" in
    new)      shift; cmd_new "$@" ;;
    claim)    shift; cmd_claim "$@" ;;
    local)    shift; cmd_local "$@" ;;
    local-native) shift; _run_lane "local-native" "$@" ;;
    kimi)     shift; cmd_kimi "$@" ;;
    claude)   shift; cmd_claude "$@" ;;
    result)   shift; cmd_result "$@" ;;
    review)   shift; cmd_review "$@" ;;
    escalate) shift; cmd_escalate "$@" ;;
    release)  shift; cmd_release "$@" ;;
    *)
        echo "usage: $0 {new|claim|local|local-native|kimi|claude|result|review|escalate|release} <work_unit_id> [args...]" >&2
        exit 2
        ;;
esac
