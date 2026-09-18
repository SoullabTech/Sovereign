#!/usr/bin/env bash
set -euo pipefail

provider="${2:-}"
command_name="${1:-status}"

usage() {
  echo "usage: jarvis-keychain.sh {store|status|delete} {nvidia|tinker}" >&2
  exit 2
}

[ -n "$provider" ] || usage

case "$provider" in
  nvidia)
    service="ai.soullab.jarvis.nvidia-api-key"
    env_name="NVIDIA_API_KEY"
    label="NVIDIA"
    ;;
  tinker)
    service="ai.soullab.jarvis.tinker-api-key"
    env_name="TINKER_API_KEY"
    label="Tinker"
    ;;
  *) usage ;;
esac

account="${USER:-soullab}"

case "$command_name" in
  status)
    if security find-generic-password -a "$account" -s "$service" >/dev/null 2>&1; then
      echo "$label key: PRESENT"
    else
      echo "$label key: ABSENT"
      exit 1
    fi
    ;;
  store)
    secret="$(printenv "$env_name" 2>/dev/null || true)"
    if [ -z "$secret" ]; then
      read -r -s -p "Paste $label API key: " secret
      echo
    fi
    [ -n "$secret" ] || { echo "No key supplied." >&2; exit 1; }
    security add-generic-password -U -a "$account" -s "$service" -w "$secret" >/dev/null
    unset secret
    echo "$label key stored in macOS Keychain."
    ;;

  delete)
    security delete-generic-password -a "$account" -s "$service" >/dev/null 2>&1 || true
    echo "$label key removed from macOS Keychain."
    ;;
  *)
    usage
    ;;
esac
