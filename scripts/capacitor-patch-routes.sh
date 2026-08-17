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
MOBILE_BACKUP_DIR="$PROJECT_ROOT/.capacitor-mobile-backup"
MOBILE_BACKUP_MANIFEST="$PROJECT_ROOT/.capacitor-mobile.manifest"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[PATCH]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_patch() { echo -e "${GREEN}[MOBILE]${NC} $1"; }

# ── Mobile Mode Allowlist ─────────────────────────────────────────────────────
# When MOBILE_MODE=1, only these routes are included in the build.
# All others are moved to .capacitor-mobile-backup/ before npm run build.

MOBILE_TOP_LEVEL=(
  "enter" "open-web" "signin" "begin" "test-elemental" "faq" "onboarding"
  "intro" "welcome-back" "capture" "journal" "field" "settings"
  "oauth-success" "magic-link-success" "reset-password" "soul-gateway"
  "maia" "labtools" "account"
  "styles"  # CSS assets imported by globals.css — must stay in build
)

# labtools sub-dirs to KEEP (everything else in labtools/ gets excluded)
MOBILE_LABTOOLS_KEEP=("journal" "settings" "reflections")

# account sub-dirs to KEEP
MOBILE_ACCOUNT_KEEP=("settings")

# maia sub-dirs to KEEP (empty = keep root page only, exclude all sub-dirs)
MOBILE_MAIA_KEEP=()

# ── helper: is_in_array name array[@] ────────────────────────────────────────
is_in_array() {
  local needle="$1"; shift
  local element
  for element in "$@"; do
    [ "$element" = "$needle" ] && return 0
  done
  return 1
}

# Move all app/ dirs not in the allowlist to backup, tracking in a manifest
hide_non_mobile_routes() {
  log_patch "Mobile Mode active — enforcing route allowlist"

  if [ -d "$MOBILE_BACKUP_DIR" ]; then
    log_warn "Mobile backup already exists, removing stale backup..."
    rm -rf "$MOBILE_BACKUP_DIR"
  fi
  mkdir -p "$MOBILE_BACKUP_DIR"
  : > "$MOBILE_BACKUP_MANIFEST"

  # ── Phase 1: Top-level dirs not in MOBILE_TOP_LEVEL ──────────────────────
  for dir in "$PROJECT_ROOT/app"/*/; do
    [ -d "$dir" ] || continue
    name=$(basename "$dir")

    if ! is_in_array "$name" "${MOBILE_TOP_LEVEL[@]}"; then
      mv "$PROJECT_ROOT/app/$name" "$MOBILE_BACKUP_DIR/$name"
      echo "app/$name" >> "$MOBILE_BACKUP_MANIFEST"
      log_patch "  Excluded top-level: app/$name/"
    fi
  done

  # ── Phase 2: labtools — exclude sub-dirs not in MOBILE_LABTOOLS_KEEP ─────
  if [ -d "$PROJECT_ROOT/app/labtools" ]; then
    for subdir in "$PROJECT_ROOT/app/labtools"/*/; do
      [ -d "$subdir" ] || continue
      name=$(basename "$subdir")
      if ! is_in_array "$name" "${MOBILE_LABTOOLS_KEEP[@]}"; then
        mkdir -p "$MOBILE_BACKUP_DIR/labtools"
        mv "$PROJECT_ROOT/app/labtools/$name" "$MOBILE_BACKUP_DIR/labtools/$name"
        echo "app/labtools/$name" >> "$MOBILE_BACKUP_MANIFEST"
        log_patch "  Excluded labtools sub-dir: app/labtools/$name/"
      fi
    done
  fi

  # ── Phase 3: maia — exclude all sub-dirs (keep root page only) ───────────
  if [ -d "$PROJECT_ROOT/app/maia" ]; then
    for subdir in "$PROJECT_ROOT/app/maia"/*/; do
      [ -d "$subdir" ] || continue
      name=$(basename "$subdir")
      if ! is_in_array "$name" "${MOBILE_MAIA_KEEP[@]}"; then
        mkdir -p "$MOBILE_BACKUP_DIR/maia"
        mv "$PROJECT_ROOT/app/maia/$name" "$MOBILE_BACKUP_DIR/maia/$name"
        echo "app/maia/$name" >> "$MOBILE_BACKUP_MANIFEST"
        log_patch "  Excluded maia sub-dir: app/maia/$name/"
      fi
    done
  fi

  # ── Phase 4: account — exclude sub-dirs not in MOBILE_ACCOUNT_KEEP ───────
  if [ -d "$PROJECT_ROOT/app/account" ]; then
    for subdir in "$PROJECT_ROOT/app/account"/*/; do
      [ -d "$subdir" ] || continue
      name=$(basename "$subdir")
      if ! is_in_array "$name" "${MOBILE_ACCOUNT_KEEP[@]}"; then
        mkdir -p "$MOBILE_BACKUP_DIR/account"
        mv "$PROJECT_ROOT/app/account/$name" "$MOBILE_BACKUP_DIR/account/$name"
        echo "app/account/$name" >> "$MOBILE_BACKUP_MANIFEST"
        log_patch "  Excluded account sub-dir: app/account/$name/"
      fi
    done
  fi

  local count
  count=$(wc -l < "$MOBILE_BACKUP_MANIFEST" | tr -d ' ')
  log_patch "Mobile Mode: moved $count route directories to backup"
}

# Restore all mobile-excluded routes from backup
restore_non_mobile_routes() {
  [ -f "$MOBILE_BACKUP_MANIFEST" ] || return 0

  log_patch "Restoring mobile-excluded routes..."
  local count=0

  while IFS= read -r original_path; do
    [ -z "$original_path" ] && continue
    rel="${original_path#app/}"
    src="$MOBILE_BACKUP_DIR/$rel"
    dst="$PROJECT_ROOT/app/$rel"
    if [ -d "$src" ]; then
      mkdir -p "$(dirname "$dst")"
      mv "$src" "$dst"
      count=$((count + 1))
    fi
  done < "$MOBILE_BACKUP_MANIFEST"

  rm -f "$MOBILE_BACKUP_MANIFEST"
  rm -rf "$MOBILE_BACKUP_DIR"
  log_patch "Restored $count mobile-excluded route directories"
}

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

    # Safety: abort if backup already exists (indicates a previous patch was never reverted).
    if [ -d "$DYNAMIC_PAGES_BACKUP" ]; then
        log_error "Dynamic pages backup already exists at $DYNAMIC_PAGES_BACKUP"
        log_error "Run './scripts/capacitor-patch-routes.sh revert' before patching again."
        exit 1
    fi
    mkdir -p "$DYNAMIC_PAGES_BACKUP"

    # Temp file for collecting exclusions (format: page_dir|page_rel_dir)
    local exclusion_file="$PROJECT_ROOT/.capacitor-exclusions.tmp"
    > "$exclusion_file"

    # Phase 1: Scan all dynamic page.tsx files
    log_info "Phase 1: Identifying incompatible pages..."

    find "$PROJECT_ROOT/app" -name "page.tsx" -type f 2>/dev/null | while IFS= read -r file; do
        local rel_path="${file#$PROJECT_ROOT/}"
        local page_dir="$(dirname "$file")"
        local page_rel_dir="$(dirname "$rel_path")"

        # Step 1: Scan EVERY route (flat + dynamic-segment) for the flags
        # that disqualify static export. `dynamic = 'force-dynamic'`,
        # `cookies()`, and `headers()` make a page unrenderable at build
        # time regardless of route shape.
        #
        # Surfaced 2026-05-15 when /begin (a flat route, not [param]) was
        # deprecated via force-dynamic for runtime redirect (PR #352).
        # The previous scan only checked [param] routes, so flat
        # force-dynamic pages slipped through and crashed the static export.
        # PR #342 had fixed the [param] variant of this bug; this fixes
        # the flat-route variant.
        if grep -qE "(cookies\(|headers\(|export const dynamic.*=.*['\"]force-dynamic['\"])" "$file" 2>/dev/null; then
            log_warn "  Will exclude (dynamic API): $rel_path"
            echo "$page_dir|$page_rel_dir" >> "$exclusion_file"
            continue
        fi

        # Step 2: Dynamic-segment-only checks. Routes containing [param]
        # need either generateStaticParams (so Next.js knows which paths to
        # pre-render) or must be excluded. Flat routes don't need this.
        case "$rel_path" in
            *\[*\]*)
                # Already has generateStaticParams (and no force-dynamic)? Compatible.
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

# Mobile Route Allowlist Exclusions
#
# Mirrors WEB_ONLY_PREFIXES in lib/mobile/mobileAllowlist.ts — keep in sync.
#
# These are top-level app directories that are NEVER shipped in the iOS build.
# They redirect to /open-in-web at runtime; here we move them out entirely so
# they don't inflate the static export or cause build errors.
#
# Format: app-relative path from project root (no leading slash)
MOBILE_EXCLUDED_DIRS=(
    # Studio web-only sections
    "app/studio/marketing"
    "app/studio/media"
    "app/studio/metrics"
    "app/studio/agents"
    "app/studio/code"
    "app/studio/review"
    "app/studio/vault"
    "app/studio/tools"
    "app/studio/field"
    "app/studio/groups"
    "app/studio/create"
    "app/studio/case-studies"
    "app/studio/decisions"
    "app/studio/changes"
    "app/studio/camera"
    "app/studio/threshold"
    "app/studio/session-room"
    "app/studio/maia"
    "app/studio/tasks"
    "app/studio/teams"
    "app/studio/services"
    # Studio fields (P10A drift reconciliation). WEB_ONLY_PREFIXES in
    # lib/mobile/mobileAllowlist.ts already declares the whole '/studio/' family
    # web-only; this list enumerates subtrees individually and had drifted from
    # that authority. Note "app/studio/field" (singular) above is a DIFFERENT
    # directory — the near-identical name is how the plural was missed.
    "app/studio/fields"
    # Admin (web-only always)
    "app/admin"
    # Book Studio (desktop authoring environment, web-only)
    "app/book-studio"
    # Team (desktop practitioner collaboration; layout.tsx uses cookies())
    "app/team"
    # Go (public web short-link redirect: /go/[handle] -> /signin). Web-only by
    # nature — nothing in the native bundle resolves inbound short links, and the
    # destination is a web route. This is a NATIVE BOUNDARY entry, not a fix:
    # /go/[handle] fails static export with 'missing generateStaticParams()'
    # even when that export is verifiably present on disk. Three hypotheses were
    # falsified by experiment (patch-lifecycle revert; stale .next cache; the
    # injected sync-vs-async form). The Next.js behaviour remains UNATTRIBUTED —
    # do not read this entry as having explained or fixed it, and do not cite it
    # as evidence about the other patched dynamic routes. Founder ruling
    # 2026-08-16 (P6).
    "app/go"
    # Session join (client-facing consent gate for an invite token). Carrying out
    # the instruction already written in app/session/join/[token]/page.tsx:
    # "NOTE (capacitor): this dynamic route is web-only — exclude it from the iOS
    # static export." The token is a runtime invite identifier, so no truthful
    # build-time parameter set exists for it. (P10A)
    "app/session/join"
    # Master fields (P11). NATIVE_UNREACHABLE is established: absent from the
    # native allowlist, no appUrlOpen/universal-link handler exists anywhere in
    # the app, and all 18 cross-tree references are components/masters/* plus the
    # field definitions themselves — zero from any native-allowed surface.
    # This is bundle hygiene, NOT a workaround for the export failure: the
    # segment is already correctly configured. app/fields/[field]/layout.tsx
    # exports a truthful generateStaticParams() over getAllActiveSlugs(), and it
    # MUST NOT be altered — it is correct for the web application. Excluding the
    # tree avoids shipping 3 slugs x 14 surfaces = 42 unreachable static pages
    # into the native bundle. Their WEB_ONLY status is unresolved and is not
    # claimed here; only native unreachability is.
    "app/fields"
    # The Beginning (P11). NATIVE_UNREACHABLE established on the same evidence:
    # allowlist absent, no deep-link entry, zero references outside its own tree.
    # WEB_ONLY is deliberately NOT claimed — this says nothing about its web
    # lifecycle, only that no native surface can reach it.
    "app/the-beginning"
    # Commons (practitioner circles; apiFetch reads cookies during prerender)
    "app/commons"
    # Commons sub-routes — listed explicitly because the parent "app/commons"
    # entry above is silently being skipped during hide_web_only_routes
    # (root cause not yet diagnosed). The list-page `app/commons/circles/page.tsx`
    # is a client component that imports apiFetch, which reads cookies during
    # prerender, so `dynamic = "error"` static export fails. The auto-detection
    # in hide_incompatible_pages only catches direct `cookies()`/`headers()`/
    # `force-dynamic` literals, not transitive cookie reads through helpers.
    "app/commons/circles"
    "app/commons/join"
    # MAIA advanced tools (web-only)
    "app/maia/labtools"
    "app/maia/prototype"
    "app/maia/community"
    "app/maia/realtime-monitor"
    "app/maia/soul-consciousness"
    "app/maia/training"
    "app/maia/stewardship"
    "app/maia/field-dashboard"
    # Research / ops / advanced tools
    "app/consciousness-lab"
    "app/consciousness-monitor"
    "app/pfi-monitor"
    "app/model-studio"
    "app/labtools"
    "app/patterns"
    "app/research"
    "app/ain-evolution"
    "app/ain-demo"
)

MOBILE_EXCLUDED_DIRS_BACKUP="$PROJECT_ROOT/.capacitor-mobile-excluded-backup"
MOBILE_EXCLUDED_DIRS_MANIFEST="$PROJECT_ROOT/.capacitor-mobile-excluded.manifest"

# Move web-only directories out of the build before static export
hide_web_only_routes() {
    log_info "Moving web-only routes out of mobile build (mirrors mobileAllowlist.ts)..."

    # Safety: abort if backup already exists (indicates a previous patch was never reverted).
    # Deleting a live backup would permanently lose the web-only route trees.
    if [ -d "$MOBILE_EXCLUDED_DIRS_BACKUP" ]; then
        log_error "Mobile exclusions backup already exists at $MOBILE_EXCLUDED_DIRS_BACKUP"
        log_error "Run './scripts/capacitor-patch-routes.sh revert' before patching again."
        exit 1
    fi
    mkdir -p "$MOBILE_EXCLUDED_DIRS_BACKUP"

    > "$MOBILE_EXCLUDED_DIRS_MANIFEST"
    local count=0

    for rel_dir in "${MOBILE_EXCLUDED_DIRS[@]}"; do
        local full_path="$PROJECT_ROOT/$rel_dir"
        if [ -d "$full_path" ]; then
            local backup_path="$MOBILE_EXCLUDED_DIRS_BACKUP/$rel_dir"
            mkdir -p "$(dirname "$backup_path")"
            mv "$full_path" "$backup_path"
            echo "$rel_dir" >> "$MOBILE_EXCLUDED_DIRS_MANIFEST"
            log_info "  Excluded (web-only): $rel_dir"
            count=$((count + 1))
        fi
    done

    log_info "Excluded $count web-only directories from mobile build"
}

# Restore web-only directories after build
restore_web_only_routes() {
    log_info "Restoring web-only routes from backup..."

    if [ ! -f "$MOBILE_EXCLUDED_DIRS_MANIFEST" ]; then
        log_warn "No mobile exclusions manifest found"
        return 0
    fi

    local count=0
    while IFS= read -r rel_dir; do
        [ -z "$rel_dir" ] && continue
        local backup_path="$MOBILE_EXCLUDED_DIRS_BACKUP/$rel_dir"
        local restore_path="$PROJECT_ROOT/$rel_dir"
        if [ -d "$backup_path" ]; then
            mkdir -p "$(dirname "$restore_path")"
            [ -d "$restore_path" ] && rm -rf "$restore_path"
            mv "$backup_path" "$restore_path"
            log_info "  Restored: $rel_dir"
            count=$((count + 1))
        fi
    done < "$MOBILE_EXCLUDED_DIRS_MANIFEST"

    rm -rf "$MOBILE_EXCLUDED_DIRS_BACKUP"
    rm -f "$MOBILE_EXCLUDED_DIRS_MANIFEST"
    log_info "Restored $count web-only directories"
}

# Main
case "${1:-}" in
    patch)
        if [ "${MOBILE_MODE:-}" = "1" ]; then
            hide_non_mobile_routes
        fi
        hide_api_routes
        hide_middleware
        hide_pages_dir
        hide_web_only_routes
        hide_incompatible_pages
        patch_remaining_dynamic_pages
        ;;
    revert)
        restore_api_routes
        restore_middleware
        restore_pages_dir
        restore_web_only_routes
        restore_incompatible_pages
        revert_patched_pages
        restore_non_mobile_routes
        ;;
    *)
        echo "Usage: $0 {patch|revert}"
        echo ""
        echo "Commands:"
        echo "  patch   - Prepare for Capacitor static export builds"
        echo "           - Move app/api out of the way (iOS uses production API)"
        echo "           - Move middleware.ts out of the way (not compatible with static export)"
        echo "           - Move web-only routes out (mirrors lib/mobile/mobileAllowlist.ts)"
        echo "           - Exclude remaining incompatible dynamic pages"
        echo "           - Add generateStaticParams to remaining dynamic pages"
        echo "  revert  - Restore original state after build"
        exit 1
        ;;
esac
