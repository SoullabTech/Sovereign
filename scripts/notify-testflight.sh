#!/bin/bash
# Notify all TestFlight beta testers of a new build
# Uses App Store Connect API

set -e

# Configuration
ISSUER_ID="${APPSTORE_ISSUER_ID:-2f3ea491-8e65-4769-b503-3c50172f10ab}"
KEY_ID="RZJ852Y4NZ"
KEY_PATH="$HOME/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8"
BUNDLE_ID="life.soullab.maia"

# Check for API key
if [ ! -f "$KEY_PATH" ]; then
  echo "❌ API key not found at $KEY_PATH"
  exit 1
fi

echo "🔔 Notifying TestFlight testers..."

# Generate JWT token for App Store Connect API
generate_jwt() {
  local header='{"alg":"ES256","kid":"'"$KEY_ID"'","typ":"JWT"}'
  local header_b64=$(printf '%s' "$header" | openssl base64 -e | tr -d '\n=' | tr '+/' '-_')

  local now=$(date +%s)
  local exp=$((now + 1200))  # 20 minutes
  local payload='{"iss":"'"$ISSUER_ID"'","iat":'"$now"',"exp":'"$exp"',"aud":"appstoreconnect-v1"}'
  local payload_b64=$(printf '%s' "$payload" | openssl base64 -e | tr -d '\n=' | tr '+/' '-_')

  local unsigned="${header_b64}.${payload_b64}"
  local signature=$(printf '%s' "$unsigned" | openssl dgst -sha256 -sign "$KEY_PATH" -binary | openssl base64 -e | tr -d '\n=' | tr '+/' '-_')

  echo "${unsigned}.${signature}"
}

JWT=$(generate_jwt)

# Get the app ID
echo "📱 Finding app..."
APP_RESPONSE=$(curl -s -X GET "https://api.appstoreconnect.apple.com/v1/apps?filter%5BbundleId%5D=$BUNDLE_ID" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json")

APP_ID=$(echo "$APP_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') else '')" 2>/dev/null)

if [ -z "$APP_ID" ]; then
  echo "❌ Could not find app with bundle ID: $BUNDLE_ID"
  echo "$APP_RESPONSE"
  exit 1
fi

echo "✅ Found app ID: $APP_ID"

# Get the latest build
echo "📦 Finding latest build..."
BUILDS_RESPONSE=$(curl -s -X GET "https://api.appstoreconnect.apple.com/v1/builds?filter%5Bapp%5D=$APP_ID&sort=-uploadedDate&limit=1" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json")

BUILD_ID=$(echo "$BUILDS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') else '')" 2>/dev/null)
BUILD_VERSION=$(echo "$BUILDS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['attributes']['version'] if data.get('data') else '')" 2>/dev/null)

if [ -z "$BUILD_ID" ]; then
  echo "❌ Could not find any builds"
  echo "$BUILDS_RESPONSE"
  exit 1
fi

echo "✅ Found build: $BUILD_VERSION (ID: $BUILD_ID)"

# Get beta groups
echo "👥 Finding beta groups..."
GROUPS_RESPONSE=$(curl -s -X GET "https://api.appstoreconnect.apple.com/v1/apps/$APP_ID/betaGroups" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json")

GROUP_IDS=$(echo "$GROUPS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(' '.join([g['id'] for g in data.get('data', [])]))" 2>/dev/null)

if [ -z "$GROUP_IDS" ]; then
  echo "⚠️  No beta groups found. Testers will see update in TestFlight app."
  exit 0
fi

echo "✅ Found beta groups"

# Add build to each beta group (this triggers notifications)
for GROUP_ID in $GROUP_IDS; do
  echo "📨 Adding build to group $GROUP_ID..."

  NOTIFY_RESPONSE=$(curl -s -X POST "https://api.appstoreconnect.apple.com/v1/betaGroups/$GROUP_ID/relationships/builds" \
    -H "Authorization: Bearer $JWT" \
    -H "Content-Type: application/json" \
    -d '{
      "data": [
        {
          "type": "builds",
          "id": "'"$BUILD_ID"'"
        }
      ]
    }')

  # Check for errors (204 No Content is success)
  if echo "$NOTIFY_RESPONSE" | grep -q "errors"; then
    echo "⚠️  Group $GROUP_ID: $(echo "$NOTIFY_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['errors'][0]['detail'] if data.get('errors') else 'Unknown error')" 2>/dev/null)"
  else
    echo "✅ Notified group $GROUP_ID"
  fi
done

echo ""
echo "🎉 TestFlight notifications sent!"
echo "   Build: $BUILD_VERSION"
echo "   Testers will receive push notifications."
