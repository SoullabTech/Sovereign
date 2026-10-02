#!/usr/bin/env bash
# Prepared-reader custody for the governed production deploy lane.
#
# Separates artifact preparation from live cutover while preserving exact commit
# identity, the current reader as rollback target, truthful role tags, and
# fail-closed refusal when production changes between prepare and cutover.
#
# Tag/identity custody only. Callers own the deploy lock, immutable-SHA
# materialization, migration gate, build, and container recreation.

MAIA_IMAGE_REPO="${MAIA_IMAGE_REPO:-maia-sovereign}"
MAIA_CONTAINER="${MAIA_CONTAINER:-maia-sovereign}"
DEPLOY_PREPARED_RECORD="${DEPLOY_PREPARED_RECORD:-${PROJECT_DIR:-.}/.deploy-prepared-maia}"

_reader_docker() { "${DEPLOY_DOCKER_BIN:-docker}" "$@"; }
_reader_block() { echo "[deploy-reader:BLOCK] $*" >&2; }
_reader_ok()    { echo "[deploy-reader:ok] $*" >&2; }
_reader_info()  { echo "[deploy-reader] $*" >&2; }

deploy_reader_image_id() {
    _reader_docker image inspect "$1" --format '{{.Id}}' 2>/dev/null || true
}

deploy_reader_live_image_id() {
    if [ -n "${DEPLOY_READER_LIVE_ID_CMD:-}" ]; then
        eval "$DEPLOY_READER_LIVE_ID_CMD"
    else
        _reader_docker inspect "$MAIA_CONTAINER" --format '{{.Image}}' 2>/dev/null || true
    fi
}

deploy_reader_live_sha() {
    if [ -n "${DEPLOY_READER_LIVE_SHA_CMD:-}" ]; then
        eval "$DEPLOY_READER_LIVE_SHA_CMD"
    else
        _reader_docker exec "$MAIA_CONTAINER" printenv GIT_COMMIT 2>/dev/null || true
    fi
}

deploy_reader_candidate_tag() {
    printf '%s:candidate-%s\n' "$MAIA_IMAGE_REPO" "$1"
}

deploy_reader_record_field() {
    local key="$1"
    [ -f "$DEPLOY_PREPARED_RECORD" ] || return 1
    sed -n "s/^${key}=//p" "$DEPLOY_PREPARED_RECORD" | head -1
}

deploy_reader_write_record() {
    local full_sha="$1" short_sha="$2" candidate_id="$3" live_id="$4" live_sha="$5"
    local tmp="${DEPLOY_PREPARED_RECORD}.tmp.$$"
    umask 077
    cat > "$tmp" <<RECORD
target_full_sha=$full_sha
target_short_sha=$short_sha
candidate_tag=$(deploy_reader_candidate_tag "$short_sha")
candidate_image_id=$candidate_id
baseline_live_image_id=$live_id
baseline_live_sha=$live_sha
prepared_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
RECORD
    mv "$tmp" "$DEPLOY_PREPARED_RECORD"
}

deploy_reader_capture_baseline() {
    local repo="$MAIA_IMAGE_REPO"
    local live_id live_sha current_id prod_id rollback_id

    live_id="$(deploy_reader_live_image_id)"
    live_sha="$(deploy_reader_live_sha | tr -d '\r\n')"
    current_id="$(deploy_reader_image_id "$repo:current")"
    prod_id="$(deploy_reader_image_id "$repo:prod")"

    if [ -z "$live_id" ] || [ -z "$live_sha" ]; then
        _reader_block "Cannot prove the currently running reader identity."
        return 1
    fi
    if [ -z "$current_id" ] || [ "$current_id" != "$live_id" ]; then
        _reader_block ":current does not identify the running production image."
        return 1
    fi
    if [ -z "$prod_id" ] || [ "$prod_id" != "$live_id" ]; then
        _reader_block ":prod does not identify the running production image before prepare."
        return 1
    fi

    rollback_id="$(deploy_reader_image_id "$repo:$live_sha")"
    if [ -z "$rollback_id" ] || [ "$rollback_id" != "$live_id" ]; then
        _reader_block "Exact rollback tag $repo:$live_sha is missing or does not match the running reader."
        return 1
    fi

    export DEPLOY_BASELINE_LIVE_ID="$live_id"
    export DEPLOY_BASELINE_LIVE_SHA="$live_sha"
    _reader_ok "Baseline frozen: live=$live_sha image=$live_id"
}

deploy_reader_stage_candidate() {
    local full_sha="$1" short_sha="$2"
    local repo="$MAIA_IMAGE_REPO"
    local live_id="${DEPLOY_BASELINE_LIVE_ID:-}" live_sha="${DEPLOY_BASELINE_LIVE_SHA:-}"
    local built_id candidate_tag restored_prod current_id running_id running_sha

    if [ -z "$live_id" ] || [ -z "$live_sha" ]; then
        _reader_block "Candidate staging requires deploy_reader_capture_baseline first."
        return 1
    fi

    built_id="$(deploy_reader_image_id "$repo:prod")"
    if [ -z "$built_id" ]; then
        _reader_block "Build produced no $repo:prod image."
        return 1
    fi

    candidate_tag="$(deploy_reader_candidate_tag "$short_sha")"
    _reader_docker tag "$repo:prod" "$candidate_tag"
    _reader_docker tag "$repo:prod" "$repo:$short_sha"

    # Compose build uses :prod; restore that role tag to the still-running reader.
    _reader_docker tag "$live_id" "$repo:prod"

    restored_prod="$(deploy_reader_image_id "$repo:prod")"
    current_id="$(deploy_reader_image_id "$repo:current")"
    running_id="$(deploy_reader_live_image_id)"
    running_sha="$(deploy_reader_live_sha | tr -d '\r\n')"

    if [ "$restored_prod" != "$live_id" ] || [ "$current_id" != "$live_id" ] \
       || [ "$running_id" != "$live_id" ] || [ "$running_sha" != "$live_sha" ]; then
        _reader_block "Prepare did not leave production role tags and running reader unchanged."
        return 1
    fi

    deploy_reader_write_record "$full_sha" "$short_sha" "$built_id" "$live_id" "$live_sha"
    _reader_ok "Candidate prepared without cutover: $candidate_tag image=$built_id"
    _reader_ok "Production remains: $live_sha image=$live_id"
}

deploy_reader_verify_prepared() {
    local full_sha="$1" short_sha="$2"
    local repo="$MAIA_IMAGE_REPO"
    local rec_full rec_short rec_tag rec_candidate_id rec_live_id rec_live_sha
    local candidate_id running_id running_sha current_id prod_id rollback_id

    if [ ! -f "$DEPLOY_PREPARED_RECORD" ]; then
        _reader_block "No prepared-reader record exists at $DEPLOY_PREPARED_RECORD."
        return 1
    fi

    rec_full="$(deploy_reader_record_field target_full_sha)"
    rec_short="$(deploy_reader_record_field target_short_sha)"
    rec_tag="$(deploy_reader_record_field candidate_tag)"
    rec_candidate_id="$(deploy_reader_record_field candidate_image_id)"
    rec_live_id="$(deploy_reader_record_field baseline_live_image_id)"
    rec_live_sha="$(deploy_reader_record_field baseline_live_sha)"

    if [ "$rec_full" != "$full_sha" ] || [ "$rec_short" != "$short_sha" ]; then
        _reader_block "Prepared record targets ${rec_short:-<empty>} (${rec_full:-<empty>}), not asserted $short_sha ($full_sha)."
        return 1
    fi
    if [ "$rec_tag" != "$(deploy_reader_candidate_tag "$short_sha")" ]; then
        _reader_block "Prepared candidate tag does not match the asserted SHA."
        return 1
    fi

    candidate_id="$(deploy_reader_image_id "$rec_tag")"
    running_id="$(deploy_reader_live_image_id)"
    running_sha="$(deploy_reader_live_sha | tr -d '\r\n')"
    current_id="$(deploy_reader_image_id "$repo:current")"
    prod_id="$(deploy_reader_image_id "$repo:prod")"
    rollback_id="$(deploy_reader_image_id "$repo:$rec_live_sha")"

    if [ -z "$candidate_id" ] || [ "$candidate_id" != "$rec_candidate_id" ]; then
        _reader_block "Prepared candidate artifact moved or disappeared."
        return 1
    fi
    if [ "$running_id" != "$rec_live_id" ] || [ "$running_sha" != "$rec_live_sha" ]; then
        _reader_block "Live production changed since prepare; cutover authorization is stale."
        return 1
    fi
    if [ "$current_id" != "$rec_live_id" ] || [ "$prod_id" != "$rec_live_id" ]; then
        _reader_block "Production role tags moved since prepare."
        return 1
    fi
    if [ -z "$rollback_id" ] || [ "$rollback_id" != "$rec_live_id" ]; then
        _reader_block "Exact rollback artifact $repo:$rec_live_sha is no longer restorable."
        return 1
    fi

    export DEPLOY_PREPARED_CANDIDATE_ID="$candidate_id"
    export DEPLOY_PREPARED_LIVE_ID="$rec_live_id"
    export DEPLOY_PREPARED_LIVE_SHA="$rec_live_sha"
    export DEPLOY_PREPARED_CANDIDATE_TAG="$rec_tag"
    _reader_ok "Prepared custody verified: candidate=$short_sha rollback=$rec_live_sha"
}

deploy_reader_promote_prepared() {
    local short_sha="$1"
    local repo="$MAIA_IMAGE_REPO"
    local candidate_id="${DEPLOY_PREPARED_CANDIDATE_ID:-}"
    local live_id="${DEPLOY_PREPARED_LIVE_ID:-}"
    local candidate_tag="${DEPLOY_PREPARED_CANDIDATE_TAG:-}"
    local prev_id current_id prod_id

    if [ -z "$candidate_id" ] || [ -z "$live_id" ] || [ -z "$candidate_tag" ]; then
        _reader_block "Promotion requires deploy_reader_verify_prepared in the same process."
        return 1
    fi

    _reader_info "Freezing previous production image and promoting prepared candidate role tags..."
    _reader_docker tag "$live_id" "$repo:previous"
    _reader_docker tag "$candidate_tag" "$repo:current"
    _reader_docker tag "$candidate_tag" "$repo:prod"
    _reader_docker tag "$candidate_tag" "$repo:$short_sha"

    prev_id="$(deploy_reader_image_id "$repo:previous")"
    current_id="$(deploy_reader_image_id "$repo:current")"
    prod_id="$(deploy_reader_image_id "$repo:prod")"

    if [ "$prev_id" != "$live_id" ] || [ "$current_id" != "$candidate_id" ] || [ "$prod_id" != "$candidate_id" ]; then
        _reader_block "Role-tag promotion did not produce the expected rollback/current identities."
        return 1
    fi
    _reader_ok "Role tags ready for cutover: previous=$live_id current=$candidate_id"
}
