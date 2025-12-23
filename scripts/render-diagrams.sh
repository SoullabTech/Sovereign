#!/bin/bash
# scripts
# scripts/render-diagrams.sh
# Deterministic Mermaid rendering:
# - uses pinned local mmdc (devDependency)
# - always applies mermaid.css (+ optional mermaid.config)
# - uses puppeteer.json only when needed (CI/Linux or sandbox failure)

set -euo pipefail
cd "$(dirname "$0")/.."

CSS_FILE="docs/visuals/mermaid.css"
PUPPETEER_CFG="docs/visuals/puppeteer.json"
MERMAID_CFG="docs/visuals/mermaid.config.json"

# Use the locally installed CLI (deterministic). Fallback to npx install if missing.
MMDC=(npx --no-install mmdc)
if ! "${MMDC[@]}" --version >/dev/null 2>&1; then
  MMDC=(npx -y @mermaid-js/mermaid-cli)
fi

COMMON_ARGS=( -b transparent --cssFile "$CSS_FILE" )
if [[ -f "$MERMAID_CFG" ]]; then
  COMMON_ARGS+=( -c "$MERMAID_CFG" )
fi

# Decide if we should force puppeteer config up front (CI/Linux), otherwise retry-on-error.
NEED_PUPPETEER=0
if [[ "${CI:-}" == "true" ]] || [[ "$(uname -s)" == "Linux" ]]; then
  NEED_PUPPETEER=1
fi

render_one() {
  local input="$1"
  local output="$2"
  local tmp
  tmp="$(mktemp)"

  echo "[render-diagrams] Rendering $(basename "$output")..."
  local args=( -i "$input" -o "$output" "${COMMON_ARGS[@]}" )

  if [[ $NEED_PUPPETEER -eq 1 ]]; then
    args+=( -p "$PUPPETEER_CFG" )
    "${MMDC[@]}" "${args[@]}"
    rm -f "$tmp"
    return 0
  fi

  # First attempt without puppeteer config
  if "${MMDC[@]}" "${args[@]}" 2>"$tmp"; then
    rm -f "$tmp"
    return 0
  fi

  # Retry only for common sandbox/headless failures
  if grep -qiE "no usable sandbox|--no-sandbox|Failed to launch the browser process|sandbox" "$tmp"; then
    echo "[render-diagrams] Sandbox issue detected; retrying with puppeteer config..."
    "${MMDC[@]}" "${args[@]}" -p "$PUPPETEER_CFG"
    rm -f "$tmp"
    return 0
  fi

  cat "$tmp" >&2
  rm -f "$tmp"
  exit 1
}

# ---- diagrams ----
render_one "docs/JOURNEY_PAGE_FIVE_ELEMENT_ARCHITECTURE.mmd" "docs/visuals/JOURNEY_PAGE_FIVE_ELEMENT_ARCHITECTURE.svg"
render_one "docs/JOURNEY_PAGE_WIREFRAMES.mmd"              "docs/visuals/JOURNEY_PAGE_WIREFRAMES.svg"
render_one "docs/JOURNEY_PAGE_COMPONENT_TREE.mmd"          "docs/visuals/JOURNEY_PAGE_COMPONENT_TREE.svg"

echo "[render-diagrams] ✅ All diagrams rendered successfully"
