#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Installing git hooks..."

mkdir -p .git/hooks

# ── Pre-commit: sovereignty guards ──────────────────────────────────────────
cat > .git/hooks/pre-commit << 'HOOK'
#!/usr/bin/env bash
set -euo pipefail

echo "🔒 Sovereignty pre-commit check..."

export GIT_PRE_COMMIT=1

# Supabase ban
npm run check:no-supabase

# Direct @anthropic-ai/sdk import ban (drift prevention — see
# docs/orientation/maia-sovereign-runtime-intelligence-audit.md)
npm run check:no-direct-anthropic

# Vendor voice ban (no OpenAI/ElevenLabs names in UI)
npm run check:no-vendor-voices

# Provider governance — no NEW OpenAI surfaces (docs/canon/PROVIDER_GOVERNANCE.md)
npm run check:no-openai

# Dark text opacity guard (prevents invisible text on dark panels)
bash scripts/check-dark-text-opacity.sh

echo "✅ Pre-commit checks passed"
HOOK

chmod +x .git/hooks/pre-commit

echo "✅ pre-commit hook installed"

# ── Pre-push: secrets + large files ─────────────────────────────────────────
cat > .git/hooks/pre-push << 'HOOK'
#!/usr/bin/env bash
set -euo pipefail
scripts/check-no-secrets.sh
scripts/check-no-large-staged-files.sh
HOOK

chmod +x .git/hooks/pre-push

echo "✅ pre-push hook installed"
