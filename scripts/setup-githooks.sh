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

# Vendor voice ban (no OpenAI/ElevenLabs names in UI)
npm run check:no-vendor-voices

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
