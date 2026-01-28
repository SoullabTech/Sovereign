#!/bin/bash

# Capacitor Route Patcher
# For static export builds (iOS/Capacitor):
# 1. Temporarily moves app/api directory out of the way
# 2. Moves incompatible dynamic pages out of the build
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
PAGES_BACKUP_DIR="$PROJECT_ROOT/.capacitor-pages-backup"
DYNAMIC_PAGES_BACKUP="$PROJECT_ROOT/.capacitor-dynamic-pages-backup"
DYNAMIC_PAGES_MANIFEST="$PROJECT_ROOT/.capacitor-dynamic-pages.manifest"
PATCHED_PAGES_FILE="$PROJECT_ROOT/.capacitor-patched-pages.txt"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[PATCH]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# API routes - must be moved out for static export
# Routes with `force-dynamic` cause build failures during static export
hide_api_routes() {
    log_info "Moving app/api routes out of the build for static export..."

    if [ -d "$PROJECT_ROOT/app/api" ]; then
        if [ -d "$API_BACKUP_DIR" ]; then
            log_warn "API backup already exists, removing stale backup..."
            rm -rf "$API_BACKUP_DIR"
        fi
        local count=$(find "$PROJECT_ROOT/app/api" -name "route.ts" | wc -l | tr -d ' ')
        mv "$PROJECT_ROOT/app/api" "$API_BACKUP_DIR"
        log_info "Moved $count API routes to .capacitor-api-backup"
    else
        log_warn "No app/api directory found"
    fi
}

# Restore API routes after static export build
restore_api_routes() {
    log_info "Restoring app/api routes from backup..."

    if [ -d "$API_BACKUP_DIR" ]; then
        [ -d "$PROJECT_ROOT/app/api" ] && rm -rf "$PROJECT_ROOT/app/api"
        mv "$API_BACKUP_DIR" "$PROJECT_ROOT/app/api"
        log_info "Restored API routes from backup"
    else
        log_warn "No API backup found at $API_BACKUP_DIR"
    fi
}

# Replace middleware with a stub for static export
# Moving it causes webpack trace errors - stub is safer
hide_middleware() {
    log_info "Replacing middleware.ts with static-export stub..."

    if [ -f "$PROJECT_ROOT/middleware.ts" ]; then
        if [ -f "$MIDDLEWARE_BACKUP" ]; then
            log_warn "Middleware backup already exists, removing stale backup..."
            rm -f "$MIDDLEWARE_BACKUP"
        fi
        # Backup original
        cp "$PROJECT_ROOT/middleware.ts" "$MIDDLEWARE_BACKUP"

        # Create stub middleware that does nothing
        cat > "$PROJECT_ROOT/middleware.ts" << 'STUBEOF'
/**
 * Stub middleware for Capacitor static export builds.
 * Real middleware is incompatible with output: 'export'.
 * This file is auto-generated - do not edit.
 */
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

// Empty matcher = middleware never runs
export const config = {
  matcher: [],
};
STUBEOF
        log_info "Created middleware stub (original backed up)"
    else
        log_warn "No middleware.ts found"
    fi
}

# Restore original middleware from backup
restore_middleware() {
    log_info "Restoring original middleware.ts from backup..."

    if [ -f "$MIDDLEWARE_BACKUP" ]; then
        # Replace stub with original
        mv "$MIDDLEWARE_BACKUP" "$PROJECT_ROOT/middleware.ts"
        log_info "Restored middleware.ts from backup"
    else
        log_warn "No middleware backup found at $MIDDLEWARE_BACKUP"
    fi
}

# Move pages/ directory out of build
# Even without getInitialProps, pages/ directory conflicts with App Router static export
# Next.js 15 with output:'export' expects .next/server/pages-manifest.json which isn't created
hide_pages_dir() {
    log_info "Moving pages/ out of the build (conflicts with App Router static export)..."

    if [ -d "$PROJECT_ROOT/pages" ]; then
        if [ -d "$PAGES_BACKUP_DIR" ]; then
            log_warn "Pages backup already exists, removing stale backup..."
            rm -rf "$PAGES_BACKUP_DIR"
        fi
        mv "$PROJECT_ROOT/pages" "$PAGES_BACKUP_DIR"
        log_info "Moved pages/ -> .capacitor-pages-backup"
    else
        log_warn "No pages/ directory found"
    fi
}

# Restore pages/ directory after build
restore_pages_dir() {
    log_info "Restoring pages/ from backup..."

    if [ -d "$PAGES_BACKUP_DIR" ]; then
        [ -d "$PROJECT_ROOT/pages" ] && rm -rf "$PROJECT_ROOT/pages"
        mv "$PAGES_BACKUP_DIR" "$PROJECT_ROOT/pages"
        log_info "Restored pages/ from backup"
    else
        log_warn "No pages backup found at $PAGES_BACKUP_DIR"
    fi
}

# Two-phase exclusion of incompatible dynamic pages
# Phase 1: Scan all pages and collect directories to exclude
# Phase 2: Move all collected directories
hide_incompatible_pages() {
    log_info "Scanning for pages incompatible with static export..."

    # Clean up any stale backup
    if [ -d "$DYNAMIC_PAGES_BACKUP" ]; then
        log_warn "Backup already exists, removing stale backup..."
        rm -rf "$DYNAMIC_PAGES_BACKUP"
    fi
    mkdir -p "$DYNAMIC_PAGES_BACKUP"

    # Temp file for collecting exclusions (format: page_dir|page_rel_dir)
    local exclusion_file="$PROJECT_ROOT/.capacitor-exclusions.tmp"
    > "$exclusion_file"

    # Phase 1: Scan all dynamic page.tsx files
    log_info "Phase 1: Identifying incompatible pages..."

    find "$PROJECT_ROOT/app" -name "page.tsx" -type f 2>/dev/null | while IFS= read -r file; do
        local rel_path="${file#$PROJECT_ROOT/}"

        # Only care about dynamic routes (paths with [param])
        case "$rel_path" in
            *\[*\]*)
                local page_dir="$(dirname "$file")"
                local page_rel_dir="$(dirname "$rel_path")"

                # Already has generateStaticParams? Skip - it's compatible
                if grep -q "generateStaticParams" "$file" 2>/dev/null; then
                    continue
                fi

                # Check if it's a Client Component
                if head -5 "$file" 2>/dev/null | grep -qE "^['\"]use client['\"];?\s*$"; then
                    # Client Component with dynamic params can't have generateStaticParams
                    # Must exclude it
                    log_warn "  Will exclude (client + dynamic): $rel_path"
                    echo "$page_dir|$page_rel_dir" >> "$exclusion_file"
                    continue
                fi

                # Check if it uses cookies(), headers(), or force-dynamic
                if grep -qE "(cookies\(|headers\(|export const dynamic.*=.*['\"]force-dynamic['\"])" "$file" 2>/dev/null; then
                    log_warn "  Will exclude (dynamic API): $rel_path"
                    echo "$page_dir|$page_rel_dir" >> "$exclusion_file"
                    continue
                fi

                # Server Component without generateStaticParams - will be patched later
                ;;
        esac
    done

    # Deduplicate: sort by path and keep unique (longer paths come after shorter)
    local unique_file="$PROJECT_ROOT/.capacitor-unique.tmp"
    sort -t'|' -k1,1 -u "$exclusion_file" > "$unique_file" 2>/dev/null || true

    # Clear manifest
    > "$DYNAMIC_PAGES_MANIFEST"

    # Phase 2: Move all collected directories
    log_info "Phase 2: Moving incompatible pages out of build..."
    local count=0

    while IFS='|' read -r page_dir page_rel_dir; do
        [ -z "$page_dir" ] && continue

        # Skip if already moved (child of previously moved parent)
        [ ! -d "$page_dir" ] && continue

        local backup_path="$DYNAMIC_PAGES_BACKUP/$page_rel_dir"
        mkdir -p "$(dirname "$backup_path")"
        mv "$page_dir" "$backup_path"
        echo "$page_rel_dir" >> "$DYNAMIC_PAGES_MANIFEST"
        log_info "  Moved: $page_rel_dir"
        count=$((count + 1))
    done < "$unique_file"

    # Cleanup temp files
    rm -f "$exclusion_file" "$unique_file"
    log_info "Excluded $count incompatible page directories"
}

# Restore excluded pages after build
restore_incompatible_pages() {
    log_info "Restoring excluded pages..."

    if [ ! -f "$DYNAMIC_PAGES_MANIFEST" ]; then
        log_warn "No pages manifest found"
        return 0
    fi

    local count=0
    while IFS= read -r page_rel_dir; do
        [ -z "$page_rel_dir" ] && continue

        local backup_path="$DYNAMIC_PAGES_BACKUP/$page_rel_dir"
        local restore_path="$PROJECT_ROOT/$page_rel_dir"

        if [ -d "$backup_path" ]; then
            mkdir -p "$(dirname "$restore_path")"
            [ -d "$restore_path" ] && rm -rf "$restore_path"
            mv "$backup_path" "$restore_path"
            log_info "  Restored: $page_rel_dir"
            count=$((count + 1))
        fi
    done < "$DYNAMIC_PAGES_MANIFEST"

    # Cleanup
    rm -rf "$DYNAMIC_PAGES_BACKUP"
    rm -f "$DYNAMIC_PAGES_MANIFEST"
    log_info "Restored $count page directories"
}

# Patch server components with generateStaticParams (those not excluded)
patch_remaining_dynamic_pages() {
    log_info "Patching remaining dynamic pages with generateStaticParams..."

    > "$PATCHED_PAGES_FILE"
    local patched_count=0

    find "$PROJECT_ROOT/app" -name "page.tsx" -type f 2>/dev/null | while IFS= read -r file; do
        local rel_path="${file#$PROJECT_ROOT/}"

        # Only care about dynamic routes
        case "$rel_path" in
            *\[*\]*)
                # Already has generateStaticParams? Skip
                if grep -q "generateStaticParams" "$file" 2>/dev/null; then
                    continue
                fi

                # Is Client Component? Should have been excluded, but skip just in case
                if head -5 "$file" 2>/dev/null | grep -qE "^['\"]use client['\"];?\s*$"; then
                    continue
                fi

                # Server Component - add generateStaticParams
                log_info "  Adding generateStaticParams: $rel_path"
                echo "$file" >> "$PATCHED_PAGES_FILE"

                local temp_file=$(mktemp)
                echo "// Added by capacitor-patch-routes.sh for static export" > "$temp_file"
                echo "export function generateStaticParams() { return []; }" >> "$temp_file"
                echo "" >> "$temp_file"
                cat "$file" >> "$temp_file"
                mv "$temp_file" "$file"
                ;;
        esac
    done

    local count=$(wc -l < "$PATCHED_PAGES_FILE" 2>/dev/null | tr -d ' ' || echo "0")
    log_info "Patched $count dynamic pages with generateStaticParams"
}

# Revert generateStaticParams patches
revert_patched_pages() {
    log_info "Reverting generateStaticParams patches..."

    if [ ! -f "$PATCHED_PAGES_FILE" ]; then
        log_info "No patched pages file found"
        return 0
    fi

    local count=0
    while IFS= read -r file; do
        [ -z "$file" ] && continue

        if [ -f "$file" ]; then
            local rel_path="${file#$PROJECT_ROOT/}"
            log_info "  Reverting: $rel_path"

            local temp_file=$(mktemp)
            grep -v "^// Added by capacitor-patch-routes.sh for static export$" "$file" | \
            grep -v "^export function generateStaticParams() { return \[\]; }$" > "$temp_file" || true
            mv "$temp_file" "$file"
            count=$((count + 1))
        fi
    done < "$PATCHED_PAGES_FILE"

    rm -f "$PATCHED_PAGES_FILE"
    log_info "Reverted $count patched pages"
}

# Main
case "${1:-}" in
    patch)
        hide_api_routes
        hide_middleware
        hide_pages_dir
        hide_incompatible_pages
        patch_remaining_dynamic_pages
        ;;
    revert)
        restore_api_routes
        restore_middleware
        restore_pages_dir
        restore_incompatible_pages
        revert_patched_pages
        ;;
    *)
        echo "Usage: $0 {patch|revert}"
        echo ""
        echo "Commands:"
        echo "  patch   - Prepare for Capacitor static export builds"
        echo "           - Move app/api out of the way (iOS uses production API)"
        echo "           - Move middleware.ts out of the way (not compatible with static export)"
        echo "           - Exclude incompatible dynamic pages from the build"
        echo "           - Add generateStaticParams to remaining dynamic pages"
        echo "  revert  - Restore original state after build"
        exit 1
        ;;
esac
