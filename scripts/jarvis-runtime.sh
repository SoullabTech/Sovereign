#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# JARVIS Unit 11 — operator commands (§16)
# ═══════════════════════════════════════════════════════════════════════════════
# Success means starting JARVIS from an ordinary terminal, without opening
# Claude Code. Same conventions as scripts/ain-delegate.sh: no daemon manager, no
# service framework — a pid file next to the delegation substrate the rest of the
# Builder OS already writes to.
#
#   jarvis-runtime.sh start [--port 8787] [--host 127.0.0.1]
#   jarvis-runtime.sh status
#   jarvis-runtime.sh stop
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AIN_HOME="${AIN_DELEGATION_HOME:-$HOME/.claude/ain-delegation}"
RUNTIME_HOME="$AIN_HOME/runtime"
PID_FILE="$RUNTIME_HOME/jarvis-runtime.pid"
OUT_LOG="$RUNTIME_HOME/jarvis-runtime.out"
RUNTIME_JS="$PROJECT_DIR/scripts/builder/jarvis-runtime.mjs"

mkdir -p "$RUNTIME_HOME"

_running_pid() {
    [ -f "$PID_FILE" ] || return 1
    local pid; pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    [ -n "$pid" ] || return 1
    kill -0 "$pid" 2>/dev/null || return 1
    echo "$pid"
}

cmd_start() {
    if pid="$(_running_pid)"; then
        echo "🛑 JARVIS runtime already running (pid $pid). Use: $0 status" >&2
        exit 1
    fi
    # Detached, but not daemonised away from its evidence: stdout/stderr land in
    # $OUT_LOG and durable run history lives in $RUNTIME_HOME/runs.
    nohup node "$RUNTIME_JS" start "$@" >> "$OUT_LOG" 2>&1 &
    local pid=$!
    echo "$pid" > "$PID_FILE"
    # Give it long enough to bind or fail loudly (a non-loopback bind fails closed).
    for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
        sleep 0.4
        if ! kill -0 "$pid" 2>/dev/null; then
            echo "🛑 runtime exited during startup — last output:" >&2
            tail -20 "$OUT_LOG" >&2
            rm -f "$PID_FILE"
            exit 1
        fi
        if [ -f "$RUNTIME_HOME/runtime.json" ]; then break; fi
    done
    echo "[jarvis-runtime] started pid=$pid"
    node "$RUNTIME_JS" status || true
}

cmd_status() {
    if pid="$(_running_pid)"; then
        echo "[jarvis-runtime] pid $pid"
    else
        echo "[jarvis-runtime] no live pid file"
    fi
    node "$RUNTIME_JS" status
}

cmd_stop() {
    local pid
    if ! pid="$(_running_pid)"; then
        echo "[jarvis-runtime] not running (no live pid)" >&2
        rm -f "$PID_FILE"
        exit 1
    fi
    # SIGTERM triggers the runtime's own STOPPING → STOPPED path, which closes the
    # listener and clears the runtime record. Run history is never touched.
    kill -TERM "$pid"
    for _ in $(seq 1 25); do
        sleep 0.4
        kill -0 "$pid" 2>/dev/null || break
    done
    if kill -0 "$pid" 2>/dev/null; then
        echo "⚠️  runtime pid $pid did not exit on SIGTERM — inspect before escalating to SIGKILL" >&2
        exit 1
    fi
    rm -f "$PID_FILE"
    echo "[jarvis-runtime] stopped pid=$pid"
}

case "${1:-}" in
    start)  shift; cmd_start "$@" ;;
    status) shift; cmd_status "$@" ;;
    stop)   shift; cmd_stop "$@" ;;
    *)
        echo "usage: $0 {start|status|stop} [--host 127.0.0.1] [--port 8787]" >&2
        exit 2
        ;;
esac
