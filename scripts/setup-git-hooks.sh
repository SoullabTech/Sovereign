#!/usr/bin/env bash
#
# Setup Git Hooks for MAIA-SOVEREIGN
#
# This script configures git to use versioned hooks in .githooks/
# which enforce sovereignty and branch protection.
#
# Run once after cloning:
#   ./scripts/setup-git-hooks.sh
#

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "🔧 Configuring git hooks..."
git config core.hooksPath .githooks

echo "✅ Git hooksPath set to .githooks"
echo ""
echo "Active hooks:"
ls -1 .githooks/ | sed 's/^/  - /'
echo ""
echo "Pre-commit hook will enforce:"
echo "  - Branch guard (only approved branches)"
echo "  - Supabase violations check"
