#!/usr/bin/env bash
# Library: unprivileged, read-only TAR stream of a named Docker volume.
# No network, credentials, plaintext destination, or file modifications.
# Called by backup-manuscript-vault.sh and exercised with a synthetic volume.
vault_emit_readonly_docker_tar(){
  local volume="$1"
  case "$volume" in
    ''|*[!a-zA-Z0-9_.-]*) return 2 ;;
  esac
  docker volume inspect "$volume" >/dev/null 2>&1 || return 3
  docker run --rm --network none --read-only \
    --user 1000:1000 --cap-drop ALL --security-opt no-new-privileges \
    --pids-limit 80 --cpus=2 --memory=512m \
    --mount "type=volume,source=$volume,target=/source,readonly" \
    --entrypoint tar node:22-slim \
    --format=posix --sort=name --numeric-owner --one-file-system \
    -C /source -cf - .
}
