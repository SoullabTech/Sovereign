#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Witness Instrument — evidence collection, in two named classes
# ═══════════════════════════════════════════════════════════════════════════════
# The failure this file exists to prevent: server logs collected cleanly, the
# browser/Electron side never captured, and the run written up as "evidence
# complete". Voice, capture lifecycle, turn-taking and re-entry behaviour live
# almost entirely on the CLIENT. Server evidence alone cannot witness them.
#
# So evidence is collected into two explicitly separate classes, and the run is
# only ever called complete when both are present:
#
#   evidence/server/   container + database + image provenance
#   evidence/client/   browser / Electron console + client-side capture
#
# V1 has no authenticated Desktop launcher (deliberately — that remains
# investigation-only), so the client class is supplied by the operator. When it
# is absent the run is QUALIFIED, never complete, and says so in the manifest.
# ═══════════════════════════════════════════════════════════════════════════════

[ -n "${_WITNESS_EVIDENCE_SOURCED:-}" ] && return 0
_WITNESS_EVIDENCE_SOURCED=1

_ev_dir()        { echo "$WITNESS_RUN_DIR/evidence"; }
_ev_server_dir() { echo "$WITNESS_RUN_DIR/evidence/server"; }
_ev_client_dir() { echo "$WITNESS_RUN_DIR/evidence/client"; }
# Deliberately a SEPARATE tree from evidence/server. Artifacts captured from a
# runtime this run cannot prove is the candidate must never sit in the same
# directory as artifacts that are attributable — a reader who finds app.log
# under evidence/server/ is entitled to assume it came from the candidate.
_ev_diag_dir()   { echo "$WITNESS_RUN_DIR/evidence/diagnostic"; }

# capture <file> <label> <cmd...> — best effort, always leaves a file that says
# what happened, so a missing artifact is never mistaken for an empty one.
_ev_capture() {
    local out="$1" label="$2"; shift 2
    if "$@" > "$out" 2>"$out.err"; then
        w_dim "captured: $label"
        rm -f "$out.err"
        return 0
    fi
    {
        echo "CAPTURE_FAILED: $label"
        echo "command: $*"
        echo "--- stderr ---"
        cat "$out.err" 2>/dev/null
    } >> "$out"
    rm -f "$out.err"
    w_warn "capture failed: $label"
    return 1
}

# ── Server / container class ──────────────────────────────────────────────────
witness_collect_server() {
    local sd; sd="$(_ev_server_dir)"; mkdir -p "$sd"
    local container project file
    container="$(wm_get MAIA_CONTAINER)"
    project="$(wm_get COMPOSE_PROJECT)"
    file="$(wm_get COMPOSE_FILE)"
    local failures=0

    if ! w_have_docker; then
        echo "SERVER_EVIDENCE_UNAVAILABLE: no docker daemon reachable at $(w_utc)" > "$sd/UNAVAILABLE.txt"
        wm_set SERVER_EVIDENCE "UNAVAILABLE"
        w_warn "Server evidence UNAVAILABLE — no docker daemon."
        return 1
    fi

    _ev_capture "$sd/compose-ps.txt"      "compose ps"        _w_docker compose -p "$project" -f "$file" ps || failures=$((failures+1))
    _ev_capture "$sd/container-inspect.json" "inspect"        _w_docker inspect "$container" || failures=$((failures+1))
    _ev_capture "$sd/app.log"             "container logs"    _w_docker logs "$container" || failures=$((failures+1))
    _ev_capture "$sd/provenance.txt"      "runtime provenance" _w_docker exec "$container" sh -c 'echo "GIT_COMMIT=$GIT_COMMIT"; echo "DEPLOY_LANE=$DEPLOY_LANE"; echo "NODE_ENV=$NODE_ENV"' || failures=$((failures+1))

    # Image identity — which image is actually running, by id and digest.
    _ev_capture "$sd/image.txt" "image identity" \
        _w_docker inspect --format '{{.Image}} {{.Config.Image}}' "$container" || failures=$((failures+1))

    # Database identity — proves the run spoke to the witness DB, not production.
    local pg="$(wm_get PG_CONTAINER)"
    if [ -n "$pg" ] && _w_docker inspect "$pg" >/dev/null 2>&1; then
        _ev_capture "$sd/database.txt" "witness database identity" \
            _w_docker exec "$pg" psql -U witness -d maia_witness -tAc \
            "select current_database()||' tables='||count(*) from information_schema.tables where table_schema='public'" \
            || failures=$((failures+1))
    else
        echo "PG_CONTAINER absent — witness database identity not captured" > "$sd/database.txt"
        failures=$((failures+1))
    fi

    # The artifact assertion output, re-captured as standalone evidence.
    local pattern probe
    pattern="$(wm_get ARTIFACT_PATTERN)"
    probe="$(wm_get ARTIFACT_RUNTIME_PROBE)"
    probe="${probe:-grep -R -F -l -- '$pattern' /app --exclude-dir=node_modules --exclude-dir=.git | head -20}"
    _ev_capture "$sd/artifact-assertion.txt" "artifact assertion in container" \
        _w_docker exec "$container" sh -c "$probe" || failures=$((failures+1))

    if [ "$failures" -eq 0 ]; then
        wm_set SERVER_EVIDENCE "COMPLETE"
        return 0
    fi
    wm_set SERVER_EVIDENCE "PARTIAL"
    wm_set SERVER_EVIDENCE_FAILURES "$failures"
    return 1
}

# ── Client / browser / Electron class ─────────────────────────────────────────
# Adopted from WITNESS_CLIENT_CONSOLE_LOG, or from anything the operator has
# already dropped into evidence/client/. Nothing is synthesised.
witness_collect_client() {
    local cd; cd="$(_ev_client_dir)"; mkdir -p "$cd"

    if [ -n "${WITNESS_CLIENT_CONSOLE_LOG:-}" ]; then
        if [ -f "$WITNESS_CLIENT_CONSOLE_LOG" ]; then
            cp "$WITNESS_CLIENT_CONSOLE_LOG" "$cd/console.log"
            w_dim "captured: client console ($WITNESS_CLIENT_CONSOLE_LOG)"
        else
            w_warn "WITNESS_CLIENT_CONSOLE_LOG set but not found: $WITNESS_CLIENT_CONSOLE_LOG"
        fi
    fi

    local have
    have="$(find "$cd" -type f ! -name 'README*' 2>/dev/null | head -1)"
    if [ -n "$have" ]; then
        wm_set CLIENT_CONSOLE_CAPTURE "CAPTURED"
        wm_set CLIENT_EVIDENCE_FILES "$(find "$cd" -type f ! -name 'README*' | wc -l | tr -d ' ')"
        return 0
    fi

    cat > "$cd/README.txt" <<'CLIENT_README'
CLIENT_CONSOLE_CAPTURE=UNAVAILABLE

No browser / Electron console evidence was captured for this run.

WITNESS-INSTRUMENT-V1 has no authenticated Desktop launcher: targeting and auth
lifecycle for the Desktop surface are not yet understood, and launching blind
would produce confident-looking evidence about the wrong session. That verb
(launch_desktop_authenticated) is deliberately NOT in V1.

Until it exists, client evidence is supplied by hand:

  WITNESS_CLIENT_CONSOLE_LOG=/path/to/console.log \
    scripts/witness/witness.sh collect

or by dropping files directly into this directory before running collect.

Server logs are not a substitute. Capture lifecycle, turn boundaries, voice
re-entry and provisional-transcript behaviour are client-side events; a run
without client evidence cannot witness them, and this instrument will not
pretend otherwise.
CLIENT_README

    wm_set CLIENT_CONSOLE_CAPTURE "UNAVAILABLE"
    return 1
}

# ── Diagnostic capture (unproven runtime) ─────────────────────────────────────
# Same artifacts, different tree, and a header on every run directory saying
# what they are not. A failed run is exactly when logs matter most; the rule is
# that they may inform the next repair, never a claim about the candidate.
witness_collect_diagnostic() {
    local dd; dd="$(_ev_diag_dir)"; mkdir -p "$dd"
    local container project file
    container="$(wm_get MAIA_CONTAINER)"; project="$(wm_get COMPOSE_PROJECT)"; file="$(wm_get COMPOSE_FILE)"

    cat > "$dd/NOT_ATTRIBUTABLE.txt" <<DIAG_HEADER
NOT ATTRIBUTABLE EVIDENCE

RUNTIME_PROVENANCE = $(wm_get RUNTIME_PROVENANCE)
run                = $(wm_get RUN_ID)
candidate          = $(wm_get CANDIDATE_SHORT_SHA)
captured           = $(w_utc)

The runtime these artifacts came from could not be proven to be this run's
build of the candidate. They are kept for DIAGNOSIS of the instrument or the
run — never as evidence about $(wm_get CANDIDATE_SHORT_SHA).

Do not move these files into evidence/server/. If you need attributable
evidence, prepare a new run and provision it successfully first.
DIAG_HEADER

    if ! w_have_docker; then
        echo "no docker daemon reachable at $(w_utc)" >> "$dd/NOT_ATTRIBUTABLE.txt"
        wm_set SERVER_EVIDENCE "NOT_ATTRIBUTABLE"
        return 1
    fi
    _ev_capture "$dd/compose-ps.txt" "compose ps (diagnostic)"   _w_docker compose -p "$project" -f "$file" ps || true
    _ev_capture "$dd/app.log"        "container logs (diagnostic)" _w_docker logs "$container" || true
    _ev_capture "$dd/inspect.json"   "inspect (diagnostic)"      _w_docker inspect "$container" || true
    wm_set SERVER_EVIDENCE "NOT_ATTRIBUTABLE"
    return 0
}

# ── Roll-up ───────────────────────────────────────────────────────────────────
witness_evidence_rollup() {
    local server client
    server="$(wm_get SERVER_EVIDENCE)"
    client="$(wm_get CLIENT_CONSOLE_CAPTURE)"

    # Attribution is a precondition of completeness, not a component of it.
    # No combination of captured classes can make evidence from an unproven
    # runtime complete.
    if [ "$(wm_get RUNTIME_PROVENANCE)" != "PROVEN" ] || [ "$server" = "NOT_ATTRIBUTABLE" ]; then
        wm_set EVIDENCE_COMPLETE "false"
        wm_set EVIDENCE_CLASS "DIAGNOSTIC_ONLY"
    elif [ "$server" = "COMPLETE" ] && [ "$client" = "CAPTURED" ]; then
        wm_set EVIDENCE_COMPLETE "true"
    else
        wm_set EVIDENCE_COMPLETE "false"
    fi

    cat > "$(_ev_dir)/EVIDENCE.md" <<EVIDENCE_INDEX
# Witness evidence — run $(wm_get RUN_ID)

| field | value |
|---|---|
| candidate | \`$(wm_get CANDIDATE_SHORT_SHA)\` ($(wm_get CANDIDATE_FULL_SHA)) |
| tree state at prepare | $(wm_get CANDIDATE_TREE_STATE) |
| runtime provenance | **$(wm_get RUNTIME_PROVENANCE)** |
| artifact assertion | \`$(wm_get ARTIFACT_PATTERN)\` in \`$(wm_get ARTIFACT_SOURCE_PATH)\` |
| assertion discriminating | $(wm_get ARTIFACT_ASSERTION_DISCRIMINATING) |
| EVIDENCE_CLASS | **$(wm_get EVIDENCE_CLASS)** |
| SERVER_EVIDENCE | **$server** |
| CLIENT_CONSOLE_CAPTURE | **$client** |
| EVIDENCE_COMPLETE | **$(wm_get EVIDENCE_COMPLETE)** |
| collected | $(w_utc) |

## Classes

- \`server/\` — container, image, database and provenance evidence.
- \`client/\` — browser / Electron console evidence.

Server evidence alone does not witness client-side conversational behaviour
(capture lifecycle, turn boundaries, voice re-entry, provisional transcript).
When \`CLIENT_CONSOLE_CAPTURE=UNAVAILABLE\`, this run is **qualified, not
complete**, and must not be cited as a device pass.

When \`EVIDENCE_CLASS=DIAGNOSTIC_ONLY\`, the runtime could not be proven to be
this run's build of the candidate. Nothing here is evidence *about the
candidate* — see \`diagnostic/NOT_ATTRIBUTABLE.txt\`.
EVIDENCE_INDEX

    [ "$(wm_get EVIDENCE_COMPLETE)" = "true" ]
}
