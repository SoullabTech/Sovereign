#!/usr/bin/env bash
set -euo pipefail

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
echo "✅ Git hooks enabled (core.hooksPath=.githooks)"
echo ""
echo "Committed hooks active:"
echo "  • pre-commit: Sovereignty audit (blocks cloud dependencies)"
echo ""
echo "To bypass temporarily (emergencies only):"
echo "  git commit --no-verify"
