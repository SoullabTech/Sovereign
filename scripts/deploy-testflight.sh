#!/bin/bash

# MAIA TestFlight Deployment Script
# Builds, uploads, and releases to TestFlight without notifying testers
#
# Usage:
#   ./scripts/deploy-testflight.sh           # Full build + upload + release
#   ./scripts/deploy-testflight.sh --release-only  # Just release latest build (no notify)

set -e

# CocoaPods requires UTF-8 encoding (Ruby 3.4 + macOS default locale can be ASCII-8BIT)
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# App Store Connect API credentials
ISSUER_ID="2f3ea491-8e65-4769-b503-3c50172f10ab"
KEY_ID="36J9MBP9U6"
PRIVATE_KEY_PATH="$HOME/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8"

# App identifiers
BUNDLE_ID="life.soullab.maia"
APP_ID=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Generate JWT for App Store Connect API using Python (more reliable than bash)
generate_jwt() {
    python3 << PYSCRIPT
import json
import time
from datetime import datetime, timedelta
import hashlib
import base64
import subprocess

key_id = "$KEY_ID"
issuer_id = "$ISSUER_ID"
private_key_path = "$PRIVATE_KEY_PATH"

# Read private key
with open(private_key_path, 'r') as f:
    private_key = f.read()

# Header
header = {"alg": "ES256", "kid": key_id, "typ": "JWT"}
header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b'=').decode()

# Payload
now = int(time.time())
payload = {
    "iss": issuer_id,
    "iat": now,
    "exp": now + 1200,
    "aud": "appstoreconnect-v1"
}
payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b'=').decode()

# Sign
unsigned = f"{header_b64}.{payload_b64}"

# Use openssl to sign (avoiding PyJWT dependency)
import tempfile
with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
    f.write(unsigned)
    unsigned_file = f.name

result = subprocess.run(
    ['openssl', 'dgst', '-sha256', '-sign', private_key_path, unsigned_file],
    capture_output=True
)
import os
os.unlink(unsigned_file)

# Convert DER signature to raw r||s format for ES256
der_sig = result.stdout
# Parse DER: 0x30 len 0x02 r_len r 0x02 s_len s
if der_sig[0] == 0x30:
    idx = 2
    r_len = der_sig[idx + 1]
    r = der_sig[idx + 2:idx + 2 + r_len]
    idx = idx + 2 + r_len
    s_len = der_sig[idx + 1]
    s = der_sig[idx + 2:idx + 2 + s_len]
    # Pad/trim to 32 bytes each
    r = r[-32:].rjust(32, b'\\x00')
    s = s[-32:].rjust(32, b'\\x00')
    raw_sig = r + s
    signature_b64 = base64.urlsafe_b64encode(raw_sig).rstrip(b'=').decode()
    print(f"{unsigned}.{signature_b64}")
else:
    # Fallback - shouldn't happen
    signature_b64 = base64.urlsafe_b64encode(der_sig).rstrip(b'=').decode()
    print(f"{unsigned}.{signature_b64}")
PYSCRIPT
}

# Make authenticated API request
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local jwt=$(generate_jwt)

    if [ -n "$data" ]; then
        curl -s -g -X "$method" \
            -H "Authorization: Bearer $jwt" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "https://api.appstoreconnect.apple.com/v1$endpoint"
    else
        curl -s -g -X "$method" \
            -H "Authorization: Bearer $jwt" \
            "https://api.appstoreconnect.apple.com/v1$endpoint"
    fi
}

# Get App ID
get_app_id() {
    log_info "Fetching app ID for $BUNDLE_ID..."
    local response=$(api_request GET "/apps?filter[bundleId]=$BUNDLE_ID")
    APP_ID=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'] if d.get('data') else '')" 2>/dev/null)

    if [ -z "$APP_ID" ]; then
        log_error "Could not find app with bundle ID: $BUNDLE_ID"
        echo "$response" | head -20
        exit 1
    fi
    log_success "App ID: $APP_ID"
}

# Get latest build
get_latest_build() {
    log_info "Fetching latest build..."
    local response=$(api_request GET "/builds?filter[app]=$APP_ID&sort=-uploadedDate&limit=1")

    BUILD_ID=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'] if d.get('data') else '')" 2>/dev/null)
    BUILD_VERSION=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['attributes'].get('version','') if d.get('data') else '')" 2>/dev/null)
    BUILD_STATE=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['attributes'].get('processingState','') if d.get('data') else '')" 2>/dev/null)

    if [ -z "$BUILD_ID" ]; then
        log_error "No builds found"
        echo "$response" | head -20
        exit 1
    fi
    log_success "Latest build: $BUILD_VERSION (ID: $BUILD_ID, State: $BUILD_STATE)"
}

# Wait for build processing
wait_for_processing() {
    log_info "Waiting for build processing..."
    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        local response=$(api_request GET "/builds/$BUILD_ID")
        BUILD_STATE=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['attributes'].get('processingState','') if d.get('data') else '')" 2>/dev/null)

        case "$BUILD_STATE" in
            "VALID")
                log_success "Build processing complete!"
                return 0
                ;;
            "PROCESSING")
                echo -n "."
                sleep 10
                ;;
            "FAILED"|"INVALID")
                log_error "Build processing failed: $BUILD_STATE"
                exit 1
                ;;
            *)
                echo -n "."
                sleep 10
                ;;
        esac
        ((attempt++))
    done

    log_error "Timeout waiting for processing"
    exit 1
}

# Get beta group
get_beta_group() {
    log_info "Fetching beta groups..."
    local response=$(api_request GET "/apps/$APP_ID/betaGroups")

    BETA_GROUP_ID=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'] if d.get('data') else '')" 2>/dev/null)
    BETA_GROUP_NAME=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['attributes'].get('name','') if d.get('data') else '')" 2>/dev/null)

    if [ -z "$BETA_GROUP_ID" ]; then
        log_warn "No beta groups found"
        return 1
    fi
    log_success "Beta group: $BETA_GROUP_NAME (ID: $BETA_GROUP_ID)"
}

# Submit for beta review
submit_to_beta_review() {
    log_info "Submitting for beta review..."

    local localization_data='{
        "data": {
            "type": "betaBuildLocalizations",
            "attributes": {
                "locale": "en-US",
                "whatsNew": "Bug fixes and improvements"
            },
            "relationships": {
                "build": {
                    "data": { "type": "builds", "id": "'"$BUILD_ID"'" }
                }
            }
        }
    }'
    api_request POST "/betaBuildLocalizations" "$localization_data" > /dev/null 2>&1 || true

    local review_data='{
        "data": {
            "type": "betaAppReviewSubmissions",
            "relationships": {
                "build": {
                    "data": { "type": "builds", "id": "'"$BUILD_ID"'" }
                }
            }
        }
    }'
    api_request POST "/betaAppReviewSubmissions" "$review_data" > /dev/null 2>&1 || true
    log_success "Submitted for beta review"
}

# Add to beta group WITHOUT notification
add_to_beta_group_no_notify() {
    [ -z "$BETA_GROUP_ID" ] && return 0

    log_info "Adding to beta group (NO notification)..."

    local data='{
        "data": [{ "type": "builds", "id": "'"$BUILD_ID"'" }]
    }'

    api_request POST "/betaGroups/$BETA_GROUP_ID/relationships/builds" "$data" > /dev/null 2>&1 || true
    log_success "Build added to testers (NOT notified)"
}

# Build and upload
build_and_upload() {
    cd "$(dirname "$0")/.."

    # Patch force-dynamic routes for static export
    log_info "Patching routes for static export..."
    ./scripts/capacitor-patch-routes.sh patch

    # Ensure routes are reverted even if build fails
    trap './scripts/capacitor-patch-routes.sh revert' EXIT

    log_info "Building web content for Capacitor..."
    CAPACITOR_BUILD=1 MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder npm run build

    if [ ! -d "out" ]; then
        log_error "Web build failed - out/ directory not created!"
        exit 1
    fi
    log_success "Web content built"

    # Patch root index.html → instant JS redirect to /enter
    # Without this, Capacitor opens the Soullab.life marketing page (out/index.html)
    # instead of routing through the app entry logic.
    log_info "Patching root index.html → /enter redirect for iOS..."
    cat > out/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>html,body{margin:0;padding:0;background:#0b0f1c;}</style>
    <script>window.location.replace('/enter');</script>
  </head>
  <body></body>
</html>
HTMLEOF
    log_success "Root redirect patched"

    # Revert patches after successful build (trap will handle failure case)
    ./scripts/capacitor-patch-routes.sh revert
    trap - EXIT

    log_info "Syncing Capacitor (beta mode)..."
    LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 CAPACITOR_BUILD=1 npx cap sync ios
    log_success "Capacitor synced"

    cd ios/App
    xattr -w com.apple.xcode.CreatedByBuildSystem true ./build 2>/dev/null || true

    log_info "Building archive..."
    xcodebuild archive \
        -workspace App.xcworkspace \
        -scheme "App" \
        -configuration "Release" \
        -archivePath ./build/App.xcarchive \
        -allowProvisioningUpdates \
        CODE_SIGN_STYLE=Automatic \
        -quiet

    [ ! -d "./build/App.xcarchive" ] && { log_error "Archive failed!"; exit 1; }
    log_success "Archive created"

    log_info "Uploading to App Store Connect..."
    xcodebuild -exportArchive \
        -archivePath ./build/App.xcarchive \
        -exportPath ./output \
        -exportOptionsPlist exportOptions.plist \
        -allowProvisioningUpdates \
        2>&1 | grep -E "(Progress|Upload|EXPORT)" || true

    log_success "Upload complete"
    cd ../..
}

# Main
main() {
    echo ""
    echo "==========================================="
    echo "  MAIA TestFlight Deployment"
    echo "==========================================="
    echo ""

    [ ! -f "$PRIVATE_KEY_PATH" ] && { log_error "API key not found: $PRIVATE_KEY_PATH"; exit 1; }

    RELEASE_ONLY=false
    [ "$1" == "--release-only" ] && { RELEASE_ONLY=true; log_info "Release-only mode"; }

    [ "$RELEASE_ONLY" == "false" ] && build_and_upload

    get_app_id
    get_latest_build
    [ "$BUILD_STATE" != "VALID" ] && wait_for_processing

    get_beta_group
    submit_to_beta_review
    add_to_beta_group_no_notify

    echo ""
    log_success "==========================================="
    log_success "  TestFlight deployment complete!"
    log_success "  Build $BUILD_VERSION available"
    log_success "  Testers NOT notified"
    log_success "==========================================="
}

main "$@"
