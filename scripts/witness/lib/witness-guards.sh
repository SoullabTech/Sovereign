#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Witness Instrument — the refusal set
# ═══════════════════════════════════════════════════════════════════════════════
# Every guard here answers one question: "is there any path by which this witness
# attempt could touch production, or attach evidence to something other than the
# named candidate?" A guard returns 0 (proven safe) or non-zero (refuse). No
# guard warns-and-continues; a guard that cannot prove its claim refuses.
#
# Two properties are load-bearing:
#
#   PRODUCTION ISOLATION   — the witness stack cannot name, reach, or write any
#                            production container, database, volume, or host.
#   CANDIDATE IMMUTABILITY — evidence is bound to one commit's tree, proven by
#                            digest, re-checked on every verb.
#
# Neither is a promise. Both are re-proven mechanically, every time.
# ═══════════════════════════════════════════════════════════════════════════════

[ -n "${_WITNESS_GUARDS_SOURCED:-}" ] && return 0
_WITNESS_GUARDS_SOURCED=1

# ── Protected identities — never touched, never named as a witness target ─────
# maia-postgres and maia-sovereign are called out explicitly in the V1
# authorization; the rest of the production container set is protected on the
# same grounds.
WITNESS_PROTECTED_CONTAINERS="${WITNESS_PROTECTED_CONTAINERS:-maia-postgres maia-sovereign maia-caddy maia-api maia-comms-worker maia-embed-worker maia-summary-worker maia-media-worker maia-whisper maia-rlm maia-kokoro maia-staging maia-mythic-atlas}"
WITNESS_PROTECTED_DIRS="${WITNESS_PROTECTED_DIRS:-/Users/soullab/MAIA-SOVEREIGN /home/soullab/MAIA-SOVEREIGN}"
WITNESS_PROTECTED_DATABASES="${WITNESS_PROTECTED_DATABASES:-maia_consciousness}"
WITNESS_PROTECTED_HOSTS="${WITNESS_PROTECTED_HOSTS:-soullab.life api.soullab.life staging.soullab.life oldhead.soullab.life minisforum 192.168.0.104}"
WITNESS_PROTECTED_VOLUMES="${WITNESS_PROTECTED_VOLUMES:-postgres_data caddy_data vault_data audit_data media_data}"

# Everything the witness lane creates carries this prefix. It is the single
# string that separates "ours, disposable" from "theirs, protected".
WITNESS_PREFIX="maia-witness"
WITNESS_LANE_TOKEN="witness-lane"

# Host ports the witness stack may never bind (production/staging/dev surfaces).
WITNESS_FORBIDDEN_PORTS="${WITNESS_FORBIDDEN_PORTS:-80 443 3000 3001 3002 5432 8000 8090}"

# ───────────────────────────────────────────────────────────────────────────────
# G1 — candidate named. A witness attaches evidence to a commit. There is no
# HEAD-ack escape here (unlike the deploy lane): an unnamed candidate makes the
# evidence unciteable, which is the whole failure mode this instrument exists
# to prevent.
# ───────────────────────────────────────────────────────────────────────────────
guard_candidate_named() {
    local ref="${1:-}" repo="${2:-$(w_source_repo)}"
    if [ -z "$ref" ]; then
        w_block "No candidate commit named."
        w_dim "A witness binds evidence to ONE commit. Name it:"
        w_dim "  scripts/witness/witness.sh prepare <SHA>"
        w_dim "There is deliberately no DEPLOY_ALLOW_HEAD equivalent in this lane."
        return 1
    fi
    local full
    full="$(git -C "$repo" rev-parse --verify --quiet "${ref}^{commit}" 2>/dev/null || true)"
    if [ -z "$full" ]; then
        w_block "'$ref' does not resolve to a commit in $repo."
        w_dim "If the candidate is unpushed on another machine, witness it there —"
        w_dim "do not witness a lookalike commit and call it the candidate."
        return 1
    fi
    WITNESS_CANDIDATE_FULL="$full"
    WITNESS_CANDIDATE_SHORT="$(git -C "$repo" rev-parse --short "$full")"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# G2 — candidate clean. `git archive` already makes uncommitted work physically
# unable to enter the snapshot. The risk is therefore not contamination but
# BELIEF: an operator witnessing a dirty tree may think their edits are under
# test when they are not.
#
# That is precisely why this refusal is NON-BYPASSABLE. An acknowledgement flag
# would not correct the belief; it would only record it, and a flag that exists
# gets set under time pressure — which is when witnesses actually get run.
# A future instrument may distinguish a disposable materialization tree from an
# unrelated dirty operator checkout. V1 does not need that complexity.
# ───────────────────────────────────────────────────────────────────────────────
guard_candidate_clean() {
    local repo="${1:-$(w_source_repo)}" dirty
    dirty="$(git -C "$repo" status --porcelain --untracked-files=no 2>/dev/null || true)"
    if [ -z "$dirty" ]; then
        WITNESS_TREE_STATE="clean"
        return 0
    fi
    WITNESS_TREE_STATE="dirty"
    w_block "DIRTY_TREE=REFUSED — the source tree has uncommitted tracked changes."
    echo "$dirty" | sed 's/^/      /' >&2
    w_dim "The snapshot is taken from the COMMIT, so these edits are silently absent"
    w_dim "from what you would witness. There is no override: an operator who believes"
    w_dim "their edits are under test, when they are not, is exactly the failure this"
    w_dim "guard exists to prevent, and an acknowledgement flag does not remove that"
    w_dim "belief — it only records it after the fact."
    w_dim "Commit the changes, or stash them, then prepare again."
    return 1
}

# ───────────────────────────────────────────────────────────────────────────────
# G3 — candidate immutability. The snapshot digest recorded at prepare must
# still be reproducible from the named SHA. Catches: history rewrite, a moved
# ref, a mutated snapshot dir, and the "same run, different commit" mixup.
# ───────────────────────────────────────────────────────────────────────────────
w_candidate_digest() {
    local full="$1" repo="${2:-$(w_source_repo)}"
    # Deterministic across machines: fixed mtime/uid/gid, no compression.
    git -C "$repo" archive --format=tar "$full" 2>/dev/null | _w_sha256
}

_w_sha256() {
    if command -v sha256sum >/dev/null 2>&1; then sha256sum | awk '{print $1}'
    elif command -v shasum   >/dev/null 2>&1; then shasum -a 256 | awk '{print $1}'
    else echo "NO_SHA256_TOOL"; fi
}

guard_candidate_immutable() {
    local repo="${1:-$(w_source_repo)}"
    local recorded_sha recorded_digest now_digest
    recorded_sha="$(wm_get CANDIDATE_FULL_SHA)"
    recorded_digest="$(wm_get CANDIDATE_TREE_DIGEST)"

    if [ -z "$recorded_sha" ] || [ -z "$recorded_digest" ]; then
        w_block "Run manifest carries no candidate digest — this run was never prepared."
        return 1
    fi
    if [ -n "${WITNESS_EXPECT_SHA:-}" ]; then
        local expect_full
        expect_full="$(git -C "$repo" rev-parse --verify --quiet "${WITNESS_EXPECT_SHA}^{commit}" 2>/dev/null || true)"
        if [ "$expect_full" != "$recorded_sha" ]; then
            w_block "SHA mismatch: this run was prepared for ${recorded_sha}"
            w_dim "but you asked about ${WITNESS_EXPECT_SHA} (${expect_full:-unresolvable})."
            w_dim "One run witnesses one candidate. Prepare a new run."
            return 1
        fi
    fi
    if ! git -C "$repo" cat-file -e "${recorded_sha}^{commit}" 2>/dev/null; then
        w_block "Candidate mutation: ${recorded_sha} no longer exists in $repo."
        return 1
    fi
    now_digest="$(w_candidate_digest "$recorded_sha" "$repo")"
    if [ "$now_digest" = "NO_SHA256_TOOL" ]; then
        w_block "No sha256 tool available — candidate immutability cannot be proven."
        return 1
    fi
    if [ "$now_digest" != "$recorded_digest" ]; then
        w_block "Candidate mutation: the tree of ${recorded_sha} no longer digests to"
        w_dim "the value recorded at prepare."
        w_dim "  recorded: $recorded_digest"
        w_dim "  now:      $now_digest"
        w_dim "Evidence from this run can no longer be attributed. Prepare a new run."
        return 1
    fi

    # The materialized snapshot must still match the digest it was taken from.
    local snap; snap="$(wm_get SNAPSHOT_DIR)"
    if [ -n "$snap" ] && [ -d "$snap" ]; then
        local snap_digest
        snap_digest="$( (cd "$snap" && find . -type f -print0 2>/dev/null | LC_ALL=C sort -z | xargs -0 cat 2>/dev/null) | _w_sha256 )"
        local recorded_snap; recorded_snap="$(wm_get SNAPSHOT_CONTENT_DIGEST)"
        if [ -n "$recorded_snap" ] && [ "$snap_digest" != "$recorded_snap" ]; then
            w_block "Candidate mutation: the materialized snapshot at $snap has changed"
            w_dim "since prepare. The witness stack may be running code that is not the candidate."
            return 1
        fi
    fi
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# G4 — witness compose project. Refuses any project name or compose file that is
# not unmistakably ours. This is what makes `teardown` safe to run at all: a
# `_w_docker compose down -v` can only ever address a project named maia-witness-*.
# ───────────────────────────────────────────────────────────────────────────────
guard_compose_project() {
    local project="${1:-$(wm_get COMPOSE_PROJECT)}" file="${2:-$(wm_get COMPOSE_FILE)}"
    case "$project" in
        "${WITNESS_PREFIX}-"*) : ;;
        *)
            w_block "Non-witness compose project: '${project:-<empty>}'"
            w_dim "The witness lane may only address projects named ${WITNESS_PREFIX}-*."
            return 1 ;;
    esac
    if [ -z "$file" ] || [ "$(basename "$file")" != "docker-compose.witness.yml" ]; then
        w_block "Non-witness compose file: '${file:-<empty>}'"
        w_dim "The witness lane builds only from scripts/witness/docker-compose.witness.yml."
        return 1
    fi
    if [ ! -f "$file" ]; then
        w_block "Witness compose file not found at $file"
        return 1
    fi
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# G5 — container names. Every container the witness stack would create must
# carry the witness prefix, and none may collide with a protected production
# name. Proven against the RESOLVED compose config when docker is available
# (catches interpolation), statically otherwise.
# ───────────────────────────────────────────────────────────────────────────────
guard_container_names() {
    local file="${1:-$(wm_get COMPOSE_FILE)}" project="${2:-$(wm_get COMPOSE_PROJECT)}"
    local names rendered=""

    if w_have_docker; then
        rendered="$(_w_docker compose -p "$project" -f "$file" ${WITNESS_ENV_FILE:+--env-file "$WITNESS_ENV_FILE"} config 2>/dev/null || true)"
    fi
    if [ -n "$rendered" ]; then
        names="$(printf '%s\n' "$rendered" | sed -n 's/^ *container_name: *"\{0,1\}\([^"]*\)"\{0,1\} *$/\1/p')"
    else
        names="$(sed -n 's/^ *container_name: *"\{0,1\}\([^"]*\)"\{0,1\} *$/\1/p' "$file")"
        WITNESS_NAMES_SOURCE="static"
    fi

    if [ -z "$names" ]; then
        w_block "Could not read any container_name from $file — refusing to guess."
        return 1
    fi

    # Names are interpolated from THIS RUN's token, so a statically parsed
    # compose file resolves the same way a rendered one does.
    local token run_id
    token="$(wm_get RUN_TOKEN)"; run_id="$(wm_get RUN_ID)"
    export WITNESS_RUN_TOKEN="$token" WITNESS_RUN_ID="$run_id"

    if [ -z "$token" ]; then
        w_block "Run manifest carries no RUN_TOKEN — this run predates run-scoped runtime identity."
        w_dim "Prepare a new run; a run without a token cannot own its containers."
        return 1
    fi

    local n p bad=0 expanded=""
    while IFS= read -r n; do
        [ -n "$n" ] || continue
        n="$(_w_expand_env_str "$n")"
        expanded="$expanded$n
"
        for p in $WITNESS_PROTECTED_CONTAINERS; do
            if [ "$n" = "$p" ]; then
                w_block "Production container named in the witness stack: '$n'"
                bad=1
            fi
        done
        case "$n" in
            "${WITNESS_PREFIX}-${token}-"*) : ;;
            "${WITNESS_PREFIX}-"*)
                w_block "Candidate-scoped container in the witness stack: '$n'"
                w_dim "Runtime objects must carry THIS RUN's token (${WITNESS_PREFIX}-${token}-*)."
                w_dim "A name scoped only to the candidate lets one run adopt another run's runtime."
                bad=1 ;;
            *) w_block "Unprefixed container in the witness stack: '$n' (must be ${WITNESS_PREFIX}-${token}-*)"; bad=1 ;;
        esac
    done <<EOF
$names
EOF
    [ "$bad" -eq 0 ] || return 1

    # A witness container name must not already be taken by something running
    # that we did not create — refuse rather than adopt a stranger's container.
    if w_have_docker; then
        while IFS= read -r n; do
            [ -n "$n" ] || continue
            local owner
            owner="$(_w_docker inspect --format '{{ index .Config.Labels "com.docker.compose.project" }}' "$n" 2>/dev/null || true)"
            if [ -n "$owner" ] && [ "$owner" != "$project" ]; then
                w_block "Container '$n' already exists and belongs to project '$owner', not '$project'."
                return 1
            fi
        done <<EOF
$expanded
EOF
    fi
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# G6 — database target. The witness stack must speak only to its own throwaway
# database. Any reference to a protected database name, or to a protected host,
# is a refusal — including via DATABASE_URL in the witness env file.
# ───────────────────────────────────────────────────────────────────────────────
guard_database_target() {
    local env_file="${1:-${WITNESS_ENV_FILE:-}}"
    if [ -z "$env_file" ] || [ ! -f "$env_file" ]; then
        w_block "No witness env file. Copy the sample and edit it:"
        w_dim "  cp scripts/witness/.env.witness.sample scripts/witness/.env.witness"
        return 1
    fi

    local url db
    url="$(sed -n 's/^DATABASE_URL=//p' "$env_file" | tail -1 | tr -d '"'"'"'')"
    if [ -z "$url" ]; then
        w_block "Witness env file declares no DATABASE_URL — refusing to let it default."
        return 1
    fi

    for db in $WITNESS_PROTECTED_DATABASES; do
        case "$url" in
            *"/$db"|*"/$db?"*)
                w_block "Witness DATABASE_URL points at the PRODUCTION database '$db'."
                w_dim "  $url"
                return 1 ;;
        esac
    done

    # ⛔ WHOLE-TOKEN, NOT SUBSTRING. `*"@$host"*` matches '@maia-postgres' inside
    # '@maia-postgres-witness-x:5432' — refusing a witness container because its
    # name CONTAINS a protected name. Names are not identity: a protected name
    # with a suffix is a different referent. Found by exercise (2026-08-29,
    # discovery branch 3d4193ba); the failure direction is the dangerous one,
    # because a guard that refuses correct work is how guards get switched off.
    # A host token ends at ':', '/', '?' or end-of-string.
    local host
    for host in $WITNESS_PROTECTED_HOSTS; do
        case "$url" in
            *"@$host"|*"@$host:"*|*"@$host/"*|*"@$host?"*)
                w_block "Witness DATABASE_URL points at a protected host '$host'."
                w_dim "  $url"
                return 1 ;;
        esac
    done

    case "$url" in
        *"@${WITNESS_PREFIX}-postgres:"*) : ;;
        *)
            w_block "Witness DATABASE_URL must address the witness postgres container"
            w_dim "(${WITNESS_PREFIX}-postgres). Got: $url"
            return 1 ;;
    esac
    case "$url" in
        *"/maia_witness"*) : ;;
        *)
            w_block "Witness DATABASE_URL must name a maia_witness* database. Got: $url"
            return 1 ;;
    esac
    return 0
}

# Safe expansion of ${NAME} and ${NAME:-default} only. No eval, no command
# substitution — a compose file is data, not code we are willing to run.
_w_expand_env_str() {
    local s="$1" out="" name def val
    while [[ "$s" =~ ^([^\$]*)\$\{([A-Za-z_][A-Za-z0-9_]*)(:([-?])([^}]*))?\}(.*)$ ]]; do
        out="$out${BASH_REMATCH[1]}"
        name="${BASH_REMATCH[2]}"
        # ${VAR:-default} supplies a default; ${VAR:?message} supplies none —
        # the message is an error string, never a value.
        if [ "${BASH_REMATCH[4]}" = "-" ]; then def="${BASH_REMATCH[5]}"; else def=""; fi
        s="${BASH_REMATCH[6]}"
        eval "val=\${$name:-}"
        [ -n "$val" ] || val="$def"
        out="$out$val"
    done
    printf '%s' "$out$s"
}

# Normalize a compose ports section into `host_ip:published:target` lines.
# Handles BOTH forms, because they are not interchangeable in practice:
#
#   short  (what we author)          - "127.0.0.1:3999:3000"
#   long   (what `_w_docker compose     - mode: ingress
#          config` renders)            target: 3000
#                                       published: "3999"
#                                       host_ip: 127.0.0.1
#
# Found on the first real docker host (2026-08-29 Mac Studio qualification): the
# original parser read only `- ` lines, so a rendered long-form entry yielded the
# single token "mode: ingress" and G7 refused a port that was in fact correctly
# loopback-bound. It failed CLOSED, which is the right direction for a guard —
# but a false refusal still blocks a legitimate witness, so it is a defect.
#
# A long-form entry with no host_ip is emitted as 0.0.0.0:… so it is refused
# rather than silently treated as loopback — absence of a bind is not a bind.
_w_ports_specs() {
    awk '
    function flush() {
        if (have) {
            if (hip == "") hip = "0.0.0.0"
            print hip ":" pub ":" tgt
            have = 0; hip = ""; pub = ""; tgt = ""
        }
    }
    function setkv(k, v) {
        if (k == "host_ip")        hip = v
        else if (k == "published") pub = v
        else if (k == "target")    tgt = v
    }
    /^[[:space:]]*ports:[[:space:]]*$/ { flush(); inp = 1; pind = match($0, /[^ ]/); next }
    inp {
        if ($0 ~ /^[[:space:]]*$/) next
        ind = match($0, /[^ ]/)
        if (ind <= pind && $0 !~ /^[[:space:]]*-/) { flush(); inp = 0; next }

        line = $0
        gsub(/\r/, "", line)
        gsub(/"/, "", line)
        gsub(/\047/, "", line)

        if (line ~ /^[[:space:]]*-[[:space:]]*/) {
            flush()
            item = line; sub(/^[[:space:]]*-[[:space:]]*/, "", item)
            if (item ~ /^[a-z_]+:[[:space:]]/) {          # long form, first key
                have = 1
                k = item; sub(/:.*$/, "", k)
                v = item; sub(/^[a-z_]+:[[:space:]]*/, "", v)
                setkv(k, v)
            } else if (item != "") {
                print item                                  # short form, verbatim
            }
            next
        }
        if (have && line ~ /^[[:space:]]*[a-z_]+:/) {        # long form, later keys
            item = line; sub(/^[[:space:]]*/, "", item)
            k = item; sub(/:.*$/, "", k)
            v = item; sub(/^[a-z_]+:[[:space:]]*/, "", v)
            setkv(k, v)
        }
    }
    END { flush() }'
}

# ───────────────────────────────────────────────────────────────────────────────
# G7 — network target. The witness stack must not join an external/production
# network, must not publish on a production port, and must not carry a
# production hostname anywhere in its env.
# ───────────────────────────────────────────────────────────────────────────────
guard_network_target() {
    local file="${1:-$(wm_get COMPOSE_FILE)}" env_file="${2:-${WITNESS_ENV_FILE:-}}"
    local bad=0

    if grep -qE '^\s+external:\s*true' "$file"; then
        w_block "Witness compose joins an EXTERNAL network — refusing."
        w_dim "External networks are how a witness container reaches production services."
        bad=1
    fi

    # Published host ports: everything must be loopback-bound and out of the
    # production/staging/dev port set. Prefer the RESOLVED compose config (docker
    # expands interpolation for us); fall back to safe manual expansion of
    # ${VAR} / ${VAR:-default} so the guard still works with no daemon.
    local port_specs=""
    if w_have_docker; then
        port_specs="$(_w_docker compose -p "$(wm_get COMPOSE_PROJECT)" -f "$file" ${env_file:+--env-file "$env_file"} config 2>/dev/null | _w_ports_specs)"
    fi
    if [ -z "$port_specs" ]; then
        port_specs="$(_w_ports_specs < "$file")"
    fi

    local spec hostport
    while IFS= read -r spec; do
        [ -n "$spec" ] || continue
        spec="$(_w_expand_env_str "$(printf '%s' "$spec" | tr -d ' "'"'"'')")"
        case "$spec" in
            127.0.0.1:*|localhost:*) hostport="$(printf '%s' "$spec" | cut -d: -f2)" ;;
            *)
                w_block "Witness publishes a port without a loopback bind: $spec"
                w_dim "Every witness port must be bound to 127.0.0.1 — a witness surface is"
                w_dim "never reachable from the LAN."
                bad=1; continue ;;
        esac
        local fp
        for fp in $WITNESS_FORBIDDEN_PORTS; do
            if [ "$hostport" = "$fp" ]; then
                w_block "Witness would bind host port $hostport, reserved by a production/dev surface."
                bad=1
            fi
        done
        case "$hostport" in
            ''|*[!0-9]*) w_block "Witness port spec did not resolve to a number: '$spec'"; bad=1 ;;
        esac
    done <<EOF
$port_specs
EOF

    if [ -n "$env_file" ] && [ -f "$env_file" ]; then
        # ⛔ WHOLE-TOKEN (see the note in guard_database_target). A bare grep for
        # 'maia-postgres' also matches 'maia-postgres-witness-x'. The token must
        # not be flanked by a name character, '-' or '.' — so 'minisforum' is
        # caught and 'minisforum-witness' is not.
        local host
        for host in $WITNESS_PROTECTED_HOSTS; do
            if grep -qE "(^|[^A-Za-z0-9_.-])$(printf '%s' "$host" | sed 's/[.[\*^$()+?{}|\\]/\\&/g')([^A-Za-z0-9_.-]|$)" "$env_file"; then
                w_block "Witness env file references protected host '$host'."
                grep -nE "(^|[^A-Za-z0-9_.-])$(printf '%s' "$host" | sed 's/[.[\*^$()+?{}|\\]/\\&/g')([^A-Za-z0-9_.-]|$)" "$env_file" | sed 's/^/      /' >&2
                bad=1
            fi
        done
    fi
    [ "$bad" -eq 0 ]
}

# ───────────────────────────────────────────────────────────────────────────────
# G8 — no protected writes. Run dirs, snapshots and evidence must live outside
# every protected project dir, so no witness verb can ever write into (or clean
# up inside) the real checkout.
# ───────────────────────────────────────────────────────────────────────────────
guard_no_protected_writes() {
    local d p
    for d in "$(w_run_root)" "${WITNESS_RUN_DIR:-}" "$(wm_get SNAPSHOT_DIR)"; do
        [ -n "$d" ] || continue
        for p in $WITNESS_PROTECTED_DIRS; do
            case "$d" in
                "$p"|"$p"/*)
                    w_block "Witness would write inside a protected project dir:"
                    w_dim "  $d  (protected: $p)"
                    w_dim "Set WITNESS_RUN_ROOT to a disposable location."
                    return 1 ;;
            esac
        done
    done
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# G9 — artifact assertion declared. Container health is not candidate proof: a
# healthy container proves something is running, not that the CANDIDATE is
# running. So the operator must declare, per run, a candidate-specific artifact
# assertion — a string that exists in this commit's tree and can be looked for
# inside the running container.
#
# Mechanically enforced: declared, non-trivial, present in the candidate's own
# snapshot. Optionally (and recorded either way) discriminating: absent at a
# named negative reference.
# ───────────────────────────────────────────────────────────────────────────────
guard_artifact_assertion_declared() {
    local pattern="${1:-$(wm_get ARTIFACT_PATTERN)}"
    local src="${2:-$(wm_get ARTIFACT_SOURCE_PATH)}"
    local snap="${3:-$(wm_get SNAPSHOT_DIR)}"

    if [ -z "$pattern" ] || [ -z "$src" ]; then
        w_block "No candidate-specific artifact assertion declared."
        w_dim "Container health is not candidate proof. Declare what makes THIS commit"
        w_dim "recognisable inside the running container:"
        w_dim "  WITNESS_ARTIFACT_SOURCE_PATH=lib/voice/foo.ts \\"
        w_dim "  WITNESS_ARTIFACT_PATTERN='DESKTOP_STT_UTTERANCE_CEILING_MS' \\"
        w_dim "    scripts/witness/witness.sh prepare <SHA>"
        return 1
    fi
    # Non-trivial: a pattern that matches everything proves nothing.
    case "$pattern" in
        ""|"."|".*"|"^"|"$"|"*") w_block "Artifact assertion pattern is universal ('$pattern') — proves nothing."; return 1 ;;
    esac
    if [ "${#pattern}" -lt 8 ]; then
        w_block "Artifact assertion pattern too short to be candidate-specific: '$pattern' (need >= 8 chars)."
        return 1
    fi
    # ⛔ DISCRIMINATING IS NOT ENOUGH — IT MUST ALSO BE STABLE UNDER THE BUILD.
    #
    # The assertion is validated here against the candidate's SOURCE, and proven
    # later inside the BUILT container. Anything the bundler rewrites between
    # those two points is a correct-looking assertion that fails on a correct
    # build. Found by exercise (2026-08-29): `maxMs:120000` in source is emitted
    # as `maxMs:12e4` by the minifier, so a true assertion about the right commit
    # refused the right image.
    #
    # A warning, not a refusal: a numeric literal in a file the bundler never
    # touches is legitimate, and this guard cannot tell which file that is.
    # Identifiers and object keys survive minification; numeric literals do not.
    case "$pattern" in
        *[0-9][0-9][0-9]*)
            w_warn "Assertion contains a numeric literal — bundlers rewrite these (120000 -> 12e4)."
            w_dim  "Prefer an identifier or object key, which survives minification." ;;
    esac
    if [ -n "$snap" ] && [ -d "$snap" ]; then
        if [ ! -f "$snap/$src" ]; then
            w_block "Artifact assertion names $src, which does not exist in the candidate's tree."
            return 1
        fi
        if ! grep -qF -- "$pattern" "$snap/$src"; then
            w_block "Artifact assertion pattern is NOT present in the candidate's own $src."
            w_dim "An assertion that is false of the candidate can never prove the candidate is running."
            return 1
        fi
    fi
    return 0
}

# Optional discriminator: prove the assertion is FALSE at a named negative ref,
# so a match inside the container distinguishes the candidate from that baseline.
guard_artifact_assertion_discriminating() {
    local neg="${1:-$(wm_get ARTIFACT_NEGATIVE_REF)}"
    local pattern="${2:-$(wm_get ARTIFACT_PATTERN)}"
    local src="${3:-$(wm_get ARTIFACT_SOURCE_PATH)}"
    local repo="${4:-$(w_source_repo)}"

    if [ -z "$neg" ]; then
        wm_set ARTIFACT_ASSERTION_DISCRIMINATING "unproven"
        return 0
    fi
    local blob
    blob="$(git -C "$repo" show "${neg}:${src}" 2>/dev/null || true)"
    if [ -z "$blob" ]; then
        wm_set ARTIFACT_ASSERTION_DISCRIMINATING "unproven"
        w_warn "Negative ref '$neg' has no $src — discrimination left unproven (not a refusal)."
        return 0
    fi
    if printf '%s' "$blob" | grep -qF -- "$pattern"; then
        w_block "Artifact assertion is ALSO true at the negative ref '$neg' — it does not"
        w_dim "distinguish the candidate from that baseline. Pick a discriminating string."
        wm_set ARTIFACT_ASSERTION_DISCRIMINATING "false"
        return 1
    fi
    wm_set ARTIFACT_ASSERTION_DISCRIMINATING "true"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# G10 — runtime provenance. The running witness container must report the
# candidate SHA, must have been built in the witness lane, and must physically
# contain the declared artifact. Anything less is UNPROVEN, and UNPROVEN fails.
# ───────────────────────────────────────────────────────────────────────────────
guard_runtime_provenance() {
    local container="${1:-$(wm_get MAIA_CONTAINER)}"
    local expect_short; expect_short="$(wm_get CANDIDATE_SHORT_SHA)"
    local pattern; pattern="$(wm_get ARTIFACT_PATTERN)"
    local probe; probe="$(wm_get ARTIFACT_RUNTIME_PROBE)"

    _unproven() {
        wm_set RUNTIME_PROVENANCE "UNPROVEN"
        w_fail "RUNTIME_PROVENANCE=UNPROVEN — $1"
        return "$W_EXIT_UNPROVEN"
    }

    if ! w_have_docker; then
        _unproven "no docker daemon reachable from this host"; return $?
    fi
    if [ -z "$container" ]; then
        _unproven "run manifest names no witness container"; return $?
    fi
    if ! _w_docker inspect "$container" >/dev/null 2>&1; then
        _unproven "witness container '$container' does not exist (expected before provision)"; return $?
    fi

    # ⛔ BIND THE RUNTIME TO THIS RUN, BEFORE ANY OTHER PROPERTY IS READ.
    #
    # Found by device qualification (2026-08-29, run 20260829T202516Z-01374f51b):
    # a FRESH run returned RUNTIME_PROVENANCE=PROVEN and exit 0 from its
    # PRE-provision verify — which must be impossible, since that run had built
    # nothing. Runtime identity was scoped to the candidate, not the run: the
    # compose project was maia-witness-<sha> and the container names were fixed,
    # so a second run of the same candidate silently adopted the FIRST run's
    # container, bound its image digest, and then correctly exploded when
    # provision replaced it.
    #
    # Every property below — GIT_COMMIT, DEPLOY_LANE, the artifact probe, the
    # image digest — was TRUE of that container. All of them can be true of a
    # runtime this run did not create. Only the run label answers "is this mine".
    local got_run
    got_run="$(_w_docker inspect --format '{{ index .Config.Labels "ai.soullab.witness.run_id" }}' "$container" 2>/dev/null | tr -d '\r\n' || true)"
    if [ -z "$got_run" ] || [ "$got_run" = "<no value>" ]; then
        _unproven "container '$container' carries no witness run label — it was not created by this instrument"
        return $?
    fi
    if [ "$got_run" != "$(wm_get RUN_ID)" ]; then
        _unproven "container '$container' belongs to run '$got_run', not '$(wm_get RUN_ID)'.
   A run may never adopt another run's runtime, even for the same candidate.
   Evidence from a runtime this run did not create is not attributable to it."
        return $?
    fi
    local running
    running="$(_w_docker inspect --format '{{.State.Running}}' "$container" 2>/dev/null || echo false)"
    if [ "$running" != "true" ]; then
        _unproven "witness container '$container' is not running"; return $?
    fi

    local got_sha got_lane
    got_sha="$(_w_docker exec "$container" printenv GIT_COMMIT 2>/dev/null | tr -d '\r\n' || true)"
    got_lane="$(_w_docker exec "$container" printenv DEPLOY_LANE 2>/dev/null | tr -d '\r\n' || true)"

    if [ "$got_sha" != "$expect_short" ]; then
        _unproven "container reports GIT_COMMIT='${got_sha:-<unset>}', candidate is '$expect_short'"; return $?
    fi
    if [ "$got_lane" != "$WITNESS_LANE_TOKEN" ]; then
        _unproven "container reports DEPLOY_LANE='${got_lane:-<unset>}', expected '$WITNESS_LANE_TOKEN'"; return $?
    fi

    # The artifact assertion, proven INSIDE the running container.
    local probe_cmd
    probe_cmd="${probe:-grep -R -F -q -- '$pattern' /app --exclude-dir=node_modules --exclude-dir=.git && echo WITNESS_ARTIFACT_FOUND}"
    local probe_out
    probe_out="$(_w_docker exec "$container" sh -c "$probe_cmd" 2>/dev/null || true)"
    if [ -z "$probe_out" ]; then
        _unproven "declared artifact assertion did NOT hold inside '$container'"
        return $?
    fi

    # ⛔ BIND THE IMAGE IDENTITY, NOT THE TAG.
    #
    # Found by exercise (2026-08-29, discovery branch 3d4193ba): a witness image
    # tag was rebuilt by another lane 48 minutes after the candidate build, under
    # the same compose project and the same tag. The tag still resolved — to
    # different software. GIT_COMMIT and the artifact probe both catch a
    # DIFFERENT-COMMIT image, but neither catches a same-tag image swapped for
    # one rebuilt from the same commit with a different context or base layer.
    # A tag is a name; the digest is the identity.
    #
    # First proof records the digest. Every later verify must find the same one,
    # or the run is UNPROVEN — evidence collected before and after an image swap
    # cannot be attributed to one thing.
    local img_id recorded_img
    img_id="$(_w_docker inspect --format '{{.Image}}' "$container" 2>/dev/null | tr -d '\r\n' || true)"
    recorded_img="$(wm_get RUNTIME_IMAGE_ID)"
    if [ -z "$img_id" ]; then
        _unproven "could not read the image digest of '$container'"; return $?
    fi
    if [ -n "$recorded_img" ] && [ "$recorded_img" != "$img_id" ]; then
        _unproven "image identity moved: recorded ${recorded_img%%[!a-z0-9:]*}, now ${img_id}
   The container was re-created from a different image under the same tag.
   Another lane may share this project. Prepare a new run."
        return $?
    fi

    wm_set RUNTIME_PROVENANCE "PROVEN"
    wm_set RUNTIME_RUN_LABEL "$got_run"
    wm_set RUNTIME_GIT_COMMIT "$got_sha"
    wm_set RUNTIME_DEPLOY_LANE "$got_lane"
    wm_set RUNTIME_IMAGE_ID "$img_id"
    wm_set RUNTIME_ARTIFACT_PROBE_OUTPUT "$(printf '%s' "$probe_out" | head -c 200)"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# Aggregate: the static refusal set. Everything provable without a runtime.
# Run before ANY docker verb, and again as part of verify.
# ───────────────────────────────────────────────────────────────────────────────
witness_static_gates() {
    local rc=0
    guard_no_protected_writes                || rc=1
    guard_candidate_immutable                || rc=1
    guard_compose_project                    || rc=1
    guard_container_names                    || rc=1
    guard_database_target                    || rc=1
    guard_network_target                     || rc=1
    guard_artifact_assertion_declared        || rc=1
    guard_artifact_assertion_discriminating  || rc=1
    return $rc
}
