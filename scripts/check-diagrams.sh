#!/bin/bash
# scripts
# scripts/check-diagrams.sh
# Deterministic diagram check: render, then fail if SVGs change.

set -euo pipefail
echo "[check-diagrams] Rendering diagrams and verifying no diffs..."
cd "$(dirname "$0")/.."

# Render in-place (so diffs are real + easy to commit)
bash scripts/render-diagrams.sh

# If rendering changed tracked SVGs, fail (CI/pre-commit)
git diff --exit-code -- docs/visuals/*.svg >/dev/null || {
  echo ""
  echo "[check-diagrams] ❌ Diagrams are out of sync with source .mmd files."
  echo "[check-diagrams] Run: npm run render:diagrams"
  echo ""
  git diff -- docs/visuals/*.svg | sed -n '1,120p'
  exit 1
}

echo "[check-diagrams] ✅ Diagrams are up to date."
