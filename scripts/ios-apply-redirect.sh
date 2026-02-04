#!/bin/bash
# iOS Redirect Fix Script
# CRITICAL: Must be run after 'npx cap sync ios' or 'npx cap copy ios'
#
# Problem: Capacitor copies the Next.js index.html which loads React and causes
#          redirect loops from competing navigation scripts.
#
# Solution: Replace index.html with a minimal redirect-only script that:
#           1. Does NOT load React or Next.js
#           2. Checks localStorage for auth state
#           3. Redirects to /signin.html or /maia.html
#
# The React pages at those routes work correctly when loaded directly.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
IOS_PUBLIC="$PROJECT_ROOT/ios/App/App/public"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[iOS-REDIRECT]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[iOS-REDIRECT]${NC} $1"; }
log_error() { echo -e "${RED}[iOS-REDIRECT]${NC} $1"; }

# Verify iOS public directory exists
if [ ! -d "$IOS_PUBLIC" ]; then
    log_error "iOS public directory not found: $IOS_PUBLIC"
    log_error "Run 'npx cap sync ios' first"
    exit 1
fi

# Backup existing index.html
if [ -f "$IOS_PUBLIC/index.html" ]; then
    cp "$IOS_PUBLIC/index.html" "$IOS_PUBLIC/index.html.nextjs-backup"
    log_info "Backed up Next.js index.html"
fi

# Create minimal redirect index.html
log_info "Creating minimal redirect index.html..."

cat > "$IOS_PUBLIC/index.html" << 'REDIRECTEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Soullab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .loader {
      text-align: center;
      color: #D4B896;
    }
    .loader-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      opacity: 0.8;
    }
    .loader-text {
      font-size: 14px;
      opacity: 0.7;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    .pulse { animation: pulse 1.5s ease-in-out infinite; }
  </style>
  <script>
    // MAIA iOS Native Redirect Script
    // Single source of truth for native app routing
    // This script runs BEFORE React loads to prevent redirect conflicts
    (function() {
      'use strict';

      var DEBUG = true;
      function log(msg) { if (DEBUG) console.log('[iOS-REDIRECT] ' + msg); }

      log('Starting redirect check...');

      // Only handle root path - other paths should load normally
      var path = window.location.pathname || '/';
      if (path !== '/' && path !== '/index.html') {
        log('Not root path (' + path + '), allowing normal load');
        return;
      }

      // Prevent infinite redirect loops with session guard
      var GUARD_KEY = '__maia_ios_redirect_guard__';
      var guardValue = sessionStorage.getItem(GUARD_KEY);
      var now = Date.now();

      // Guard expires after 5 seconds (allows retry after app restart)
      if (guardValue) {
        var guardTime = parseInt(guardValue, 10);
        if (now - guardTime < 5000) {
          log('Redirect guard active, preventing loop');
          return;
        }
      }

      // Check authentication state from localStorage
      var betaUser = null;
      var hasValidAuth = false;

      try {
        var betaUserStr = localStorage.getItem('beta_user');
        if (betaUserStr) {
          betaUser = JSON.parse(betaUserStr);
          // Valid auth requires: id exists and is not a guest/local fallback
          if (betaUser && betaUser.id) {
            var id = betaUser.id;
            hasValidAuth = id &&
                          !id.startsWith('guest') &&
                          !id.startsWith('local_') &&
                          id !== 'anonymous';
          }
        }
        log('Auth check: betaUser=' + (betaUser ? 'present' : 'null') + ', valid=' + hasValidAuth);
      } catch (e) {
        log('Error checking auth: ' + e.message);
        hasValidAuth = false;
      }

      // Determine redirect target
      var target = hasValidAuth ? '/maia.html' : '/signin.html';
      log('Redirecting to: ' + target);

      // Set guard before redirect
      sessionStorage.setItem(GUARD_KEY, String(now));

      // Use replace to avoid back-button loops
      window.location.replace(target);
    })();
  </script>
</head>
<body>
  <div class="loader">
    <svg class="loader-icon pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#D4B896" stroke-width="2" opacity="0.3"/>
      <circle cx="50" cy="50" r="30" stroke="#D4B896" stroke-width="2" opacity="0.5"/>
      <circle cx="50" cy="50" r="15" fill="#D4B896" opacity="0.7"/>
    </svg>
    <p class="loader-text">Loading Soullab...</p>
  </div>
</body>
</html>
REDIRECTEOF

log_info "Created minimal redirect index.html"

# Verify the file was created correctly
if [ -f "$IOS_PUBLIC/index.html" ]; then
    SIZE=$(wc -c < "$IOS_PUBLIC/index.html" | tr -d ' ')
    if [ "$SIZE" -lt 1000 ]; then
        log_error "index.html seems too small ($SIZE bytes), something went wrong"
        exit 1
    fi
    log_info "Verified: index.html is $SIZE bytes"
else
    log_error "Failed to create index.html"
    exit 1
fi

log_info "iOS redirect fix applied successfully!"
log_info ""
log_info "Flow: / -> checks auth -> /signin.html or /maia.html"
log_info "React pages load correctly when accessed directly"
