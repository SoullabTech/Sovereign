#!/usr/bin/env bash
# Run once after cloning to enable repo-level git hooks
set -euo pipefail

git config core.hooksPath .githooks
echo "✓ Git hooks configured (.githooks/)"
