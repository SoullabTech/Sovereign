#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Installing git hooks..."

mkdir -p .git/hooks

cat > .git/hooks/pre-push << 'HOOK'
#!/usr/bin/env bash
set -euo pipefail
scripts/check-no-secrets.sh
scripts/check-no-large-staged-files.sh
HOOK

chmod +x .git/hooks/pre-push

echo "✅ pre-push hook installed"
