#!/bin/bash

# Capacitor Route Patcher
# Temporarily patches 'force-dynamic' routes to 'force-static' for static export builds
#
# Usage:
#   ./scripts/capacitor-patch-routes.sh patch    # Before build
#   ./scripts/capacitor-patch-routes.sh revert   # After build (or on failure)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_FILE="$PROJECT_ROOT/.capacitor-route-patches.json"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[PATCH]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

patch_routes() {
    log_info "Patching force-dynamic routes for Capacitor static export..."

    # Find all route files with force-dynamic
    local files=$(grep -rl "force-dynamic" "$PROJECT_ROOT/app/api" --include="*.ts" 2>/dev/null || true)

    if [ -z "$files" ]; then
        log_info "No force-dynamic routes found to patch"
        echo "[]" > "$BACKUP_FILE"
        return 0
    fi

    # Create backup JSON
    echo "[" > "$BACKUP_FILE"
    local first=true

    for file in $files; do
        # Get relative path for cleaner output
        local rel_path="${file#$PROJECT_ROOT/}"

        # Check if file actually contains force-dynamic (not just in comments)
        if grep -q "export const dynamic = ['\"]force-dynamic['\"]" "$file"; then
            log_info "  Patching: $rel_path"

            # Backup the original line
            local original_line=$(grep "export const dynamic = ['\"]force-dynamic['\"]" "$file")

            # Add to backup file
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> "$BACKUP_FILE"
            fi
            # Escape special characters for JSON
            local escaped_file=$(echo "$file" | sed 's/"/\\"/g')
            local escaped_line=$(echo "$original_line" | sed 's/"/\\"/g' | sed "s/'/\\\\'/g")
            echo "  {\"file\": \"$escaped_file\", \"original\": \"$escaped_line\"}" >> "$BACKUP_FILE"

            # Patch the file - replace force-dynamic with force-static
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS sed requires empty string for -i
                sed -i '' "s/export const dynamic = ['\"]force-dynamic['\"]/export const dynamic = 'force-static'/g" "$file"
            else
                # Linux sed
                sed -i "s/export const dynamic = ['\"]force-dynamic['\"]/export const dynamic = 'force-static'/g" "$file"
            fi
        fi
    done

    echo "]" >> "$BACKUP_FILE"

    local count=$(grep -c '"file"' "$BACKUP_FILE" 2>/dev/null || echo "0")
    log_info "Patched $count routes for static export"
}

revert_routes() {
    log_info "Reverting Capacitor route patches..."

    if [ ! -f "$BACKUP_FILE" ]; then
        log_warn "No backup file found at $BACKUP_FILE"
        return 0
    fi

    # Read backup and revert each file
    local files=$(grep -o '"file": "[^"]*"' "$BACKUP_FILE" | cut -d'"' -f4)

    if [ -z "$files" ]; then
        log_info "No patches to revert"
        rm -f "$BACKUP_FILE"
        return 0
    fi

    for file in $files; do
        if [ -f "$file" ]; then
            local rel_path="${file#$PROJECT_ROOT/}"
            log_info "  Reverting: $rel_path"

            # Revert force-static back to force-dynamic
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/export const dynamic = ['\"]force-static['\"]/export const dynamic = 'force-dynamic'/g" "$file"
            else
                sed -i "s/export const dynamic = ['\"]force-static['\"]/export const dynamic = 'force-dynamic'/g" "$file"
            fi
        else
            log_warn "  File not found: $file"
        fi
    done

    rm -f "$BACKUP_FILE"
    log_info "Route patches reverted"
}

# Main
case "${1:-}" in
    patch)
        patch_routes
        ;;
    revert)
        revert_routes
        ;;
    *)
        echo "Usage: $0 {patch|revert}"
        echo ""
        echo "Commands:"
        echo "  patch   - Replace force-dynamic with force-static for Capacitor builds"
        echo "  revert  - Restore original force-dynamic values after build"
        exit 1
        ;;
esac
