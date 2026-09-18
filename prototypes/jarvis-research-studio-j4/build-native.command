#!/bin/zsh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="/private/tmp/JARVIS Research Studio Prototype.app"
CONTENTS="$OUT/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"
EXECUTABLE="JARVISResearchStudioPrototype"

rm -rf "$OUT"
mkdir -p "$MACOS" "$RESOURCES"

xcrun swiftc \
  "$HERE/native-wrapper.swift" \
  -o "$MACOS/$EXECUTABLE" \
  -framework AppKit \
  -framework WebKit

cp "$HERE/index.html" "$RESOURCES/index.html"
cp "$HERE/styles.css" "$RESOURCES/styles.css"
cp "$HERE/prototype.js" "$RESOURCES/prototype.js"

ICON="/Applications/JARVIS.app/Contents/Resources/icon.icns"
if [[ -f "$ICON" ]]; then
  cp "$ICON" "$RESOURCES/icon.icns"
  ICON_PLIST="<key>CFBundleIconFile</key><string>icon.icns</string>"
else
  ICON_PLIST=""
fi

cat > "$CONTENTS/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key><string>$EXECUTABLE</string>
  <key>CFBundleIdentifier</key><string>life.soullab.jarvis.research-studio-j4-prototype</string>
  <key>CFBundleName</key><string>JARVIS Research Studio Prototype</string>
  <key>CFBundleDisplayName</key><string>JARVIS Research Studio Prototype</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>0.0.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>NSHighResolutionCapable</key><true/>
  $ICON_PLIST
</dict>
</plist>
PLIST

plutil -lint "$CONTENTS/Info.plist"
codesign --force --deep --sign - "$OUT" >/dev/null
echo "$OUT"
