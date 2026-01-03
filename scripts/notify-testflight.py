#!/usr/bin/env python3
"""
Notify all TestFlight beta testers of a new build.
Uses App Store Connect API.
"""

import jwt
import time
import json
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system(f"{sys.executable} -m pip install requests -q")
    import requests

# Configuration
ISSUER_ID = os.environ.get("APPSTORE_ISSUER_ID", "2f3ea491-8e65-4769-b503-3c50172f10ab")
KEY_ID = "RZJ852Y4NZ"
KEY_PATH = Path.home() / ".appstoreconnect" / "private_keys" / f"AuthKey_{KEY_ID}.p8"
BUNDLE_ID = "life.soullab.maia"
BASE_URL = "https://api.appstoreconnect.apple.com/v1"


def generate_token():
    """Generate JWT for App Store Connect API."""
    with open(KEY_PATH, "r") as f:
        private_key = f.read()

    now = int(time.time())
    payload = {
        "iss": ISSUER_ID,
        "iat": now,
        "exp": now + 1200,  # 20 minutes
        "aud": "appstoreconnect-v1"
    }

    return jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": KEY_ID})


def api_request(method, endpoint, token, data=None):
    """Make API request to App Store Connect."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    url = f"{BASE_URL}{endpoint}"

    if method == "GET":
        response = requests.get(url, headers=headers)
    elif method == "POST":
        response = requests.post(url, headers=headers, json=data)

    return response.json() if response.text else {}


def main():
    print("🔔 Notifying TestFlight testers...")

    # Check for API key
    if not KEY_PATH.exists():
        print(f"❌ API key not found at {KEY_PATH}")
        sys.exit(1)

    # Check for PyJWT
    try:
        import jwt
    except ImportError:
        print("Installing PyJWT...")
        os.system(f"{sys.executable} -m pip install PyJWT -q")
        import jwt

    token = generate_token()

    # Get app ID
    print("📱 Finding app...")
    apps = api_request("GET", f"/apps?filter[bundleId]={BUNDLE_ID}", token)

    if "errors" in apps:
        print(f"❌ API Error: {apps['errors'][0]['detail']}")
        sys.exit(1)

    if not apps.get("data"):
        print(f"❌ Could not find app with bundle ID: {BUNDLE_ID}")
        sys.exit(1)

    app_id = apps["data"][0]["id"]
    print(f"✅ Found app ID: {app_id}")

    # Get latest build
    print("📦 Finding latest build...")
    builds = api_request("GET", f"/builds?filter[app]={app_id}&sort=-uploadedDate&limit=1", token)

    if not builds.get("data"):
        print("❌ Could not find any builds")
        sys.exit(1)

    build = builds["data"][0]
    build_id = build["id"]
    build_version = build["attributes"]["version"]
    print(f"✅ Found build: {build_version} (ID: {build_id})")

    # Get beta groups
    print("👥 Finding beta groups...")
    groups = api_request("GET", f"/apps/{app_id}/betaGroups", token)

    if not groups.get("data"):
        print("⚠️  No beta groups found. Testers will see update in TestFlight app.")
        sys.exit(0)

    print(f"✅ Found {len(groups['data'])} beta group(s)")

    # Add build to each beta group
    for group in groups["data"]:
        group_id = group["id"]
        group_name = group["attributes"].get("name", "Unknown")
        print(f"📨 Adding build to group '{group_name}'...")

        data = {
            "data": [{"type": "builds", "id": build_id}]
        }

        result = api_request("POST", f"/betaGroups/{group_id}/relationships/builds", token, data)

        if "errors" in result:
            error = result["errors"][0]
            if error.get("code") == "ENTITY_ERROR.RELATIONSHIP.INVALID":
                print(f"   ✓ Build already in group '{group_name}'")
            else:
                print(f"   ⚠️  {error.get('detail', 'Unknown error')}")
        else:
            print(f"   ✅ Notified group '{group_name}'")

    print("")
    print("🎉 TestFlight notifications sent!")
    print(f"   Build: {build_version}")
    print("   Testers will receive push notifications.")


if __name__ == "__main__":
    main()
