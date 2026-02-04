#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "[sparse] core.sparseCheckout = $(git config --get core.sparseCheckout || echo "<unset>")"

# If git thinks sparseCheckout is on anywhere, disable and re-materialize tree
if [[ "$(git config --get core.sparseCheckout || echo false)" == "true" ]]; then
  echo "[sparse] disabling sparse-checkout + re-reading tree..."
  git sparse-checkout disable || true
  git config core.sparseCheckout false || true
  git read-tree -mu HEAD
  echo "[sparse] done."
else
  # Still sometimes the index gets weird; re-materialize without changing config
  echo "[sparse] re-reading tree (safe no-op if healthy)..."
  git read-tree -mu HEAD
  echo "[sparse] done."
fi

git status --short
