#!/bin/bash
# Safe Delete Script - Checks critical files protection before deletion

TARGET_PATH="$1"

if [ -z "$TARGET_PATH" ]; then
    echo "Usage: ./scripts/safe-delete.sh <path-to-delete>"
    exit 1
fi

echo "🛡️  SAFE DELETE PROTOCOL ACTIVATED"
echo "📂 Target path: $TARGET_PATH"

# Check against critical files
if [ -f "CRITICAL_FILES_PROTECTION.md" ]; then
    echo "📋 Checking against CRITICAL_FILES_PROTECTION.md..."

    # Critical paths that should never be deleted
    CRITICAL_PATHS=(
        "app/maia"
        "lib/constants/dev-mode.ts"
        "lib/config/voiceSettings.ts"
        "docker-compose.sovereign.yml"
        "cloudflared-config.yml"
    )

    for critical_path in "${CRITICAL_PATHS[@]}"; do
        if [[ "$TARGET_PATH" == *"$critical_path"* ]]; then
            echo "🚨 CRITICAL FILE DETECTED: $critical_path"
            echo "❌ This file is protected and should not be deleted"
            echo "📖 See CRITICAL_FILES_PROTECTION.md for details"
            exit 1
        fi
    done
fi

# Create backup tag
BACKUP_TAG="backup-before-delete-$(date +%Y%m%d-%H%M%S)"
echo "💾 Creating backup tag: $BACKUP_TAG"
git tag -a "$BACKUP_TAG" -m "Backup before deleting $TARGET_PATH"

echo "⚠️  About to delete: $TARGET_PATH"
echo "❓ Are you absolutely sure? This cannot be undone easily. (yes/no)"
read -r confirmation

if [[ $confirmation == "yes" ]]; then
    echo "🗑️  Proceeding with deletion..."
    rm -rf "$TARGET_PATH"
    echo "✅ Deleted: $TARGET_PATH"
    echo "💾 Recovery possible via: git checkout $BACKUP_TAG -- $TARGET_PATH"
else
    echo "🚫 Deletion cancelled"
    git tag -d "$BACKUP_TAG"  # Remove the backup tag since we didn't delete
fi