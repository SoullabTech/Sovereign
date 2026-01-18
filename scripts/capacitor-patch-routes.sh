#!/bin/bash

# Capacitor Route Patcher
# Temporarily patches routes for static export builds:
# 1. 'force-dynamic' routes → 'force-static'
# 2. Dynamic routes [param] → adds generateStaticParams()
#
# Usage:
#   ./scripts/capacitor-patch-routes.sh patch    # Before build
#   ./scripts/capacitor-patch-routes.sh revert   # After build (or on failure)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_FILE="$PROJECT_ROOT/.capacitor-route-patches.json"
DYNAMIC_BACKUP_FILE="$PROJECT_ROOT/.capacitor-dynamic-routes.txt"

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
    log_info "Patched $count force-dynamic routes"
}

patch_dynamic_routes() {
    log_info "Patching dynamic API routes with generateStaticParams..."

    # Find all route.ts files in paths with [param] segments
    local dynamic_routes=$(find "$PROJECT_ROOT/app/api" -path "*\[*\]*" -name "route.ts" 2>/dev/null || true)

    if [ -z "$dynamic_routes" ]; then
        log_info "No dynamic routes found to patch"
        echo "" > "$DYNAMIC_BACKUP_FILE"
        return 0
    fi

    # Clear backup file
    echo "" > "$DYNAMIC_BACKUP_FILE"
    local patched_count=0

    for file in $dynamic_routes; do
        # Skip if already has generateStaticParams
        if grep -q "generateStaticParams" "$file"; then
            continue
        fi

        local rel_path="${file#$PROJECT_ROOT/}"
        log_info "  Adding generateStaticParams: $rel_path"

        # Record this file for revert
        echo "$file" >> "$DYNAMIC_BACKUP_FILE"

        # Create temp file with the new content prepended
        local temp_file=$(mktemp)
        echo "// Added by capacitor-patch-routes.sh for static export" > "$temp_file"
        echo "export function generateStaticParams() { return []; }" >> "$temp_file"
        echo "" >> "$temp_file"
        cat "$file" >> "$temp_file"
        mv "$temp_file" "$file"

        patched_count=$((patched_count + 1))
    done

    log_info "Patched $patched_count dynamic routes with generateStaticParams"
}

revert_dynamic_routes() {
    log_info "Reverting generateStaticParams patches..."

    if [ ! -f "$DYNAMIC_BACKUP_FILE" ]; then
        log_info "No dynamic route backup file found"
        return 0
    fi

    local files=$(cat "$DYNAMIC_BACKUP_FILE" | grep -v "^$" || true)

    if [ -z "$files" ]; then
        log_info "No dynamic routes to revert"
        rm -f "$DYNAMIC_BACKUP_FILE"
        return 0
    fi

    for file in $files; do
        if [ -f "$file" ]; then
            local rel_path="${file#$PROJECT_ROOT/}"
            log_info "  Reverting: $rel_path"

            # Remove the first 3 lines (comment, export, blank line)
            # This is reliable because we know exactly what we prepended
            local temp_file=$(mktemp)
            tail -n +4 "$file" > "$temp_file"
            mv "$temp_file" "$file"
        else
            log_warn "  File not found: $file"
        fi
    done

    rm -f "$DYNAMIC_BACKUP_FILE"
    log_info "Dynamic route patches reverted"
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
        patch_dynamic_routes
        ;;
    revert)
        revert_routes
        revert_dynamic_routes
        ;;
    *)
        echo "Usage: $0 {patch|revert}"
        echo ""
        echo "Commands:"
        echo "  patch   - Patch routes for Capacitor static export builds"
        echo "           • Replace force-dynamic with force-static"
        echo "           • Add generateStaticParams to dynamic [param] routes"
        echo "  revert  - Restore original route configurations after build"
        exit 1
        ;;
esac
