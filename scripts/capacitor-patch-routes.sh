#!/bin/bash

# Capacitor Route Patcher
# For static export builds (iOS/Capacitor):
# 1. Temporarily moves app/api directory out of the way
# 2. Patches dynamic pages with generateStaticParams
#
# The iOS app doesn't need API routes - it calls the production server at soullab.life
#
# Usage:
#   ./scripts/capacitor-patch-routes.sh patch    # Before build
#   ./scripts/capacitor-patch-routes.sh revert   # After build (or on failure)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_BACKUP_DIR="$PROJECT_ROOT/.capacitor-api-backup"
MIDDLEWARE_BACKUP="$PROJECT_ROOT/.capacitor-middleware-backup"
DYNAMIC_PAGES_FILE="$PROJECT_ROOT/.capacitor-dynamic-pages.txt"
DYNAMIC_ROUTES_BACKUP="$PROJECT_ROOT/.capacitor-dynamic-routes-backup"

# Dynamic routes to exclude from static export (incompatible with output: export)
# These are either:
# - Client Components with dynamic params (can't have generateStaticParams)
# - Server-rendered pages that need data from the server
EXCLUDED_DYNAMIC_ROUTES=(
    "app/ask-maia/[cardId]"
    "app/practitioner/containers"
    "app/portal/[slug]"
    "app/practitioner/[slug]"
    "app/partner/[slug]"
    "app/admin/partners/prelude/[id]"
    "app/maia/community/content/[...slug]"
    "app/maia/community/territory/[slug]"
    "app/community/commons/[id]"
    "app/caseload"
    "app/stellium"
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[PATCH]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Move excluded dynamic routes out of the way
hide_dynamic_routes() {
    log_info "Moving excluded dynamic routes out of the build..."

    if [ -d "$DYNAMIC_ROUTES_BACKUP" ]; then
        log_warn "Dynamic routes backup already exists, removing stale backup..."
        rm -rf "$DYNAMIC_ROUTES_BACKUP"
    fi
    mkdir -p "$DYNAMIC_ROUTES_BACKUP"

    for route in "${EXCLUDED_DYNAMIC_ROUTES[@]}"; do
        local full_path="$PROJECT_ROOT/$route"
        if [ -d "$full_path" ]; then
            local backup_dir="$DYNAMIC_ROUTES_BACKUP/$route"
            mkdir -p "$(dirname "$backup_dir")"
            mv "$full_path" "$backup_dir"
            log_info "  Moved $route → .capacitor-dynamic-routes-backup/"
        else
            log_warn "  Route not found: $route"
        fi
    done
}

# Restore excluded dynamic routes after build
restore_dynamic_routes() {
    log_info "Restoring excluded dynamic routes..."

    if [ ! -d "$DYNAMIC_ROUTES_BACKUP" ]; then
        log_warn "No dynamic routes backup found"
        return 0
    fi

    for route in "${EXCLUDED_DYNAMIC_ROUTES[@]}"; do
        local backup_path="$DYNAMIC_ROUTES_BACKUP/$route"
        local restore_path="$PROJECT_ROOT/$route"
        if [ -d "$backup_path" ]; then
            if [ -d "$restore_path" ]; then
                log_warn "  $route already exists, removing first..."
                rm -rf "$restore_path"
            fi
            mkdir -p "$(dirname "$restore_path")"
            mv "$backup_path" "$restore_path"
            log_info "  Restored $route"
        fi
    done

    rm -rf "$DYNAMIC_ROUTES_BACKUP"
}

# Move API routes out of the way - they can't work in static export anyway
hide_api_routes() {
    log_info "Moving app/api out of the build (iOS uses production API)..."

    if [ -d "$PROJECT_ROOT/app/api" ]; then
        if [ -d "$API_BACKUP_DIR" ]; then
            log_warn "Backup already exists, removing stale backup..."
            rm -rf "$API_BACKUP_DIR"
        fi
        mv "$PROJECT_ROOT/app/api" "$API_BACKUP_DIR"
        log_info "Moved app/api → .capacitor-api-backup"
    else
        log_warn "No app/api directory found"
    fi
}

# Restore API routes after build
restore_api_routes() {
    log_info "Restoring app/api from backup..."

    if [ -d "$API_BACKUP_DIR" ]; then
        if [ -d "$PROJECT_ROOT/app/api" ]; then
            log_warn "app/api already exists, removing it first..."
            rm -rf "$PROJECT_ROOT/app/api"
        fi
        mv "$API_BACKUP_DIR" "$PROJECT_ROOT/app/api"
        log_info "Restored app/api from backup"
    else
        log_warn "No backup found at $API_BACKUP_DIR"
    fi
}

# Move middleware out of the way - not compatible with static export
hide_middleware() {
    log_info "Moving middleware.ts out of the build (not compatible with static export)..."

    if [ -f "$PROJECT_ROOT/middleware.ts" ]; then
        if [ -f "$MIDDLEWARE_BACKUP" ]; then
            log_warn "Middleware backup already exists, removing stale backup..."
            rm -f "$MIDDLEWARE_BACKUP"
        fi
        mv "$PROJECT_ROOT/middleware.ts" "$MIDDLEWARE_BACKUP"
        log_info "Moved middleware.ts → .capacitor-middleware-backup"
    else
        log_warn "No middleware.ts found"
    fi
}

# Restore middleware after build
restore_middleware() {
    log_info "Restoring middleware.ts from backup..."

    if [ -f "$MIDDLEWARE_BACKUP" ]; then
        if [ -f "$PROJECT_ROOT/middleware.ts" ]; then
            log_warn "middleware.ts already exists, removing it first..."
            rm -f "$PROJECT_ROOT/middleware.ts"
        fi
        mv "$MIDDLEWARE_BACKUP" "$PROJECT_ROOT/middleware.ts"
        log_info "Restored middleware.ts from backup"
    else
        log_warn "No middleware backup found at $MIDDLEWARE_BACKUP"
    fi
}

# Add generateStaticParams to dynamic pages that don't have it
patch_dynamic_pages() {
    log_info "Patching dynamic pages with generateStaticParams..."

    # Find all page.tsx files in paths with [param] segments (excluding api which is now moved)
    local dynamic_pages=$(find "$PROJECT_ROOT/app" -path "*\[*\]*" -name "page.tsx" 2>/dev/null || true)

    if [ -z "$dynamic_pages" ]; then
        log_info "No dynamic pages found to patch"
        echo "" > "$DYNAMIC_PAGES_FILE"
        return 0
    fi

    # Clear backup file
    echo "" > "$DYNAMIC_PAGES_FILE"
    local patched_count=0

    for file in $dynamic_pages; do
        # Skip if already has generateStaticParams
        if grep -q "generateStaticParams" "$file"; then
            continue
        fi

        # Skip Client Components - they can't have generateStaticParams
        if head -5 "$file" | grep -qE "^['\"]use client['\"];?\s*$"; then
            local rel_path="${file#$PROJECT_ROOT/}"
            log_warn "  Skipping Client Component: $rel_path"
            continue
        fi

        local rel_path="${file#$PROJECT_ROOT/}"
        log_info "  Adding generateStaticParams: $rel_path"

        # Record this file for revert
        echo "$file" >> "$DYNAMIC_PAGES_FILE"

        # No 'use client' - prepend generateStaticParams
        local temp_file=$(mktemp)
        echo "// Added by capacitor-patch-routes.sh for static export" > "$temp_file"
        echo "export function generateStaticParams() { return []; }" >> "$temp_file"
        echo "" >> "$temp_file"
        cat "$file" >> "$temp_file"
        mv "$temp_file" "$file"

        patched_count=$((patched_count + 1))
    done

    log_info "Patched $patched_count dynamic pages with generateStaticParams"
}

# Revert generateStaticParams patches
revert_dynamic_pages() {
    log_info "Reverting generateStaticParams patches..."

    if [ ! -f "$DYNAMIC_PAGES_FILE" ]; then
        log_info "No dynamic pages backup file found"
        return 0
    fi

    local files=$(cat "$DYNAMIC_PAGES_FILE" | grep -v "^$" || true)

    if [ -z "$files" ]; then
        log_info "No dynamic pages to revert"
        rm -f "$DYNAMIC_PAGES_FILE"
        return 0
    fi

    for file in $files; do
        if [ -f "$file" ]; then
            local rel_path="${file#$PROJECT_ROOT/}"
            log_info "  Reverting: $rel_path"

            # Remove the comment line and the export function line
            # They could be at different positions depending on 'use client'
            local temp_file=$(mktemp)
            grep -v "^// Added by capacitor-patch-routes.sh for static export$" "$file" | \
            grep -v "^export function generateStaticParams() { return \[\]; }$" > "$temp_file"
            mv "$temp_file" "$file"
        else
            log_warn "  File not found: $file"
        fi
    done

    rm -f "$DYNAMIC_PAGES_FILE"
    log_info "Dynamic page patches reverted"
}

# Main
case "${1:-}" in
    patch)
        hide_api_routes
        hide_middleware
        hide_dynamic_routes
        patch_dynamic_pages
        ;;
    revert)
        restore_api_routes
        restore_middleware
        restore_dynamic_routes
        revert_dynamic_pages
        ;;
    *)
        echo "Usage: $0 {patch|revert}"
        echo ""
        echo "Commands:"
        echo "  patch   - Prepare for Capacitor static export builds"
        echo "           • Move app/api out of the way (iOS uses production API)"
        echo "           • Move middleware.ts out of the way (not compatible with static export)"
        echo "           • Add generateStaticParams to dynamic pages"
        echo "  revert  - Restore original state after build"
        exit 1
        ;;
esac
