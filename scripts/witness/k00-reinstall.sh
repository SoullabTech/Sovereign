#!/usr/bin/env bash
# DRIVER-01 — Stage-B boundary: reinstall the EXACT harness product and write the three identity
# artefacts the orchestrator requires before any post-reinstall sample may run.
#   usage: scripts/witness/k00-reinstall.sh <ledger-dir> [app-path]
#   env:   K00_EXPECT_UUID=<dylib UUID>  — Stage-C custody gate (founder ruling 2026-09-13): the product's
#          VoiceKernelHarness.debug.dylib UUID is read BEFORE install and must equal this value exactly;
#          on any other reading the script writes a REFUSED artefact and exits 3 with NOTHING installed.
#          A rebuild is never a substitute for the historical binary — it is a new subject needing its own ruling.
#          K00_EXPECT_DYLIB_SHA=<sha256>       — PHASE-A-REPRO-01 R1 custody (founder ruling 2026-09-13): the signed
#          K00_EXPECT_MANIFEST=<manifest.sha256>  dylib SHA-256 and the per-file manifest recorded at build time must
#          verify unchanged against the product BEFORE install; any mismatch → REFUSED artefact, exit 3, nothing installed.
#          K00_SUBJECT=p5b0|phase-a|vpio-01|vpio-02 (default p5b0) — VPIO-01B (founder ruling 2026-09-14). For vpio-01 the identity is
#          PINNED below (bundle id · dylib UUID · dylib SHA-256 · executable SHA-256 · 7-file manifest SHA-256); every field must
#          match, a supplied K00_EXPECT_* that conflicts with the pin is itself a refusal, the manifest must match both hashes
#          and file set, and the FIRST-INSTALL precondition is read just-in-time: the installed-app state is listed, the VPIO
#          bundle must be ABSENT (present → STOP, NO uninstall, NO overwrite, NO sample; unreadable → STOP), and the install
#          transaction itself requires K00_EXEC_AUTHORITY at invocation (never read from the repo). Historical p5b0/phase-a
#          reinstall behaviour is unchanged. Rebuilding 85e5e7154 and calling the result this artifact is not authorized.
#          VPIO-02B (founder ruling 2026-09-14): vpio-02 carries its OWN pinned identity (VPIO02_* below — the VPIO-01 pins are
#          never overwritten), selected into PIN_* by the declared subject; the same fail-closed transaction applies (custody
#          MATCH × all fields → just-in-time .vpio02 ABSENT → K00_EXEC_AUTHORITY at invocation → one install). The .vpio01
#          artifact is outside this path's write jurisdiction: never uninstalled, never overwritten. If the exact signed
#          VPIO-02 artifact no longer exists, STOP — a rebuild of ac12dedf4 is not silently the same artifact.
set -euo pipefail
LEDGER="${1:?ledger dir}"; mkdir -p "$LEDGER"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
SUBJECT="${K00_SUBJECT:-p5b0}"
# VPIO-01 artifact identity — MAC-COMPILE-02 GREEN on 85e5e7154 (record KERNEL-00_VPIO-01_MAC-COMPILE-02_2026-09-14.md)
VPIO_BID="life.soullab.voicekernel.vpio01"
VPIO_UUID="E8074AD1-D179-3267-A15C-142D033A9665"
VPIO_DYLIB_SHA="6efe33b1b25fdb4dc4376abfb248e6c530e59f492ebc876314619fd1bef64b3d"
VPIO_EXEC_SHA="e43dec667e1e8ba727d7253f39199be3a34333c804c220b41233945d42a1a4ac"
VPIO_MANIFEST_SHA="4710d9a68f5b6bb9de8ef64b143f8dd9b688476b3a7f3ee0257b3922b7a60bed"
VPIO_MANIFEST_FILES=7
# VPIO-02 artifact identity — VPIO-02 MAC-COMPILE-01 GREEN on ac12dedf4 (record KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.md)
VPIO02_BID="life.soullab.voicekernel.vpio02"
VPIO02_UUID="B346F448-A2A8-30DB-9683-B732A80D7899"
VPIO02_DYLIB_SHA="e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec"
VPIO02_EXEC_SHA="9fe56504131e0b023162c62a6bd60541053b14262c9d3075a15a08dbe6c7805a"
VPIO02_MANIFEST_SHA="1459283c175e243c90459b2724c2be7362cf6dd4c95c191bd15c443ec8b98410"
VPIO02_MANIFEST_FILES=7
# SOURCE-ID-02 (founder ruling 2026-09-15): the SID subject's identity is recorded ONLY by its own MAC-COMPILE act; until then every
# pin below is empty and the subject is refused BEFORE any device verb (pins-unrecorded). The bundle id is the one fact known now.
VPIO02SID_BID="life.soullab.voicekernel.vpio02sid"
VPIO02SID_UUID=""
VPIO02SID_DYLIB_SHA=""
VPIO02SID_EXEC_SHA=""
VPIO02SID_MANIFEST_SHA=""
VPIO02SID_MANIFEST_FILES=""
# PIN_* = the pinned identity of the declared VPIO subject (empty for the historical engine subjects, which carry no pin).
PIN_BID=""; PIN_UUID=""; PIN_DYLIB_SHA=""; PIN_EXEC_SHA=""; PIN_MANIFEST_SHA=""; PIN_MANIFEST_FILES=""
case "$SUBJECT" in
  p5b0|phase-a) BID="life.soullab.voicekernel.k00";;
  vpio-01)      BID="$VPIO_BID";   PIN_BID="$VPIO_BID";   PIN_UUID="$VPIO_UUID";   PIN_DYLIB_SHA="$VPIO_DYLIB_SHA";   PIN_EXEC_SHA="$VPIO_EXEC_SHA";   PIN_MANIFEST_SHA="$VPIO_MANIFEST_SHA";   PIN_MANIFEST_FILES="$VPIO_MANIFEST_FILES";;
  vpio-02)      BID="$VPIO02_BID"; PIN_BID="$VPIO02_BID"; PIN_UUID="$VPIO02_UUID"; PIN_DYLIB_SHA="$VPIO02_DYLIB_SHA"; PIN_EXEC_SHA="$VPIO02_EXEC_SHA"; PIN_MANIFEST_SHA="$VPIO02_MANIFEST_SHA"; PIN_MANIFEST_FILES="$VPIO02_MANIFEST_FILES";;
  vpio-02-sid)  BID="$VPIO02SID_BID"; PIN_BID="$VPIO02SID_BID"; PIN_UUID="$VPIO02SID_UUID"; PIN_DYLIB_SHA="$VPIO02SID_DYLIB_SHA"; PIN_EXEC_SHA="$VPIO02SID_EXEC_SHA"; PIN_MANIFEST_SHA="$VPIO02SID_MANIFEST_SHA"; PIN_MANIFEST_FILES="$VPIO02SID_MANIFEST_FILES";;
  *) echo "unknown subject '$SUBJECT' (p5b0|phase-a|vpio-01|vpio-02|vpio-02-sid); no default bundle — refusing" >&2; exit 2;;
esac
APP="${2:-$HOME/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-afqjfcjktctgkjbejscivlpbxqtc/Build/Products/Debug-iphoneos/VoiceKernelHarness.app}"
EXPECT="${K00_EXPECT_UUID:-}"
EXPECT_SHA="${K00_EXPECT_DYLIB_SHA:-}"
EXPECT_MAN="${K00_EXPECT_MANIFEST:-}"
[ -d "$APP" ] || { echo "app product not found: $APP" >&2; exit 2; }
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DYL="$APP/VoiceKernelHarness.debug.dylib"
UUID_LINE="$(dwarfdump --uuid "$DYL" 2>&1)"
UUID="$(awk '/UUID:/{print $2; exit}' <<<"$UUID_LINE")"
DYL_SHA="$(shasum -a 256 "$DYL" 2>/dev/null | cut -d' ' -f1 || true)"
EXEC_SHA="$(shasum -a 256 "$APP/VoiceKernelHarness" 2>/dev/null | cut -d' ' -f1 || true)"
PRODUCT_BID="$(python3 -c 'import plistlib,sys; print(plistlib.load(open(sys.argv[1],"rb")).get("CFBundleIdentifier",""))' "$APP/Info.plist" 2>/dev/null || true)"
PIN_REFUSE=""
if [ -n "$PIN_BID" ]; then
  # SOURCE-ID-02: a pinned subject whose identity has not been recorded yet can never be installed (fail closed, before any read of the device).
  { [ -n "$PIN_UUID" ] && [ -n "$PIN_DYLIB_SHA" ] && [ -n "$PIN_EXEC_SHA" ] && [ -n "$PIN_MANIFEST_SHA" ] && [ -n "$PIN_MANIFEST_FILES" ]; } || PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}pins-unrecorded"
  # Pinned identity (the declared VPIO subject's own pin): a supplied expectation that disagrees with the pin is a refusal, not an override.
  [ -n "$EXPECT" ]     && [ "$EXPECT" != "$PIN_UUID" ]          && PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}uuid-expectation-conflicts-with-pin"
  [ -n "$EXPECT_SHA" ] && [ "$EXPECT_SHA" != "$PIN_DYLIB_SHA" ] && PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}dylib-sha-expectation-conflicts-with-pin"
  EXPECT="$PIN_UUID"; EXPECT_SHA="$PIN_DYLIB_SHA"
  [ -n "$EXPECT_MAN" ] || PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}manifest-file-required"
  if [ -n "$EXPECT_MAN" ] && [ -f "$EXPECT_MAN" ]; then
    MAN_SELF_SHA="$(shasum -a 256 "$EXPECT_MAN" | cut -d' ' -f1)"
    [ "$MAN_SELF_SHA" = "$PIN_MANIFEST_SHA" ] || PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}manifest-sha"
    [ "$(wc -l < "$EXPECT_MAN" | tr -d ' ')" = "$PIN_MANIFEST_FILES" ] || PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}manifest-file-count"
  fi
  [ "$EXEC_SHA" = "$PIN_EXEC_SHA" ] || PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}executable-sha"
  [ "$PRODUCT_BID" = "$PIN_BID" ]  || PIN_REFUSE="${PIN_REFUSE:+$PIN_REFUSE,}bundle-id"
fi
MAN_RESULT=""; MAN_FILES=""
if [ -n "$EXPECT_MAN" ]; then
  if [ ! -f "$EXPECT_MAN" ]; then MAN_RESULT="MANIFEST FILE MISSING: $EXPECT_MAN"
  else
    MAN_FILES="$(wc -l < "$EXPECT_MAN" | tr -d ' ')"
    # every listed file must hash identically AND the product must contain no file the manifest does not list
    MAN_CHECK="$(cd "$APP" && LC_ALL=C shasum -a 256 -c "$EXPECT_MAN" 2>&1 || true)"
    LIVE_LIST="$(cd "$APP" && find . -type f | LC_ALL=C sort)"
    MAN_LIST="$(awk '{print $2}' "$EXPECT_MAN" | LC_ALL=C sort)"
    if grep -qvE ': OK$' <<<"$MAN_CHECK"; then MAN_RESULT="MANIFEST MISMATCH"$'\n'"$MAN_CHECK"
    elif [ "$LIVE_LIST" != "$MAN_LIST" ]; then MAN_RESULT="MANIFEST FILE-SET MISMATCH"$'\n'"$(diff <(echo "$MAN_LIST") <(echo "$LIVE_LIST") || true)"
    else MAN_RESULT="OK"; fi
  fi
fi
REFUSE="$PIN_REFUSE"
[ -n "$EXPECT" ] && [ "$UUID" != "$EXPECT" ] && REFUSE="${REFUSE:+$REFUSE,}uuid"
[ -n "$EXPECT_SHA" ] && [ "$DYL_SHA" != "$EXPECT_SHA" ] && REFUSE="${REFUSE:+$REFUSE,}dylib-sha"
[ -n "$EXPECT_MAN" ] && [ "$MAN_RESULT" != "OK" ] && REFUSE="${REFUSE:+$REFUSE,}manifest"
if [ -n "$REFUSE" ]; then
  {
    echo "# reinstall $STAMP — REFUSED (custody gate: $REFUSE)"
    echo "expected dylib UUID: ${EXPECT:-<not required>}"
    echo "product dylib UUID:  ${UUID:-<unreadable>}"
    echo "expected dylib SHA-256: ${EXPECT_SHA:-<not required>}"
    echo "product dylib SHA-256:  ${DYL_SHA:-<unreadable>}"
    echo "manifest: ${EXPECT_MAN:-<not required>} → ${MAN_RESULT:-<not checked>}"
    echo "subject: $SUBJECT · bundle: $BID · product CFBundleIdentifier: ${PRODUCT_BID:-<unreadable>} · executable SHA-256: ${EXEC_SHA:-<unreadable>}"
    echo "product: $APP"
    echo "$UUID_LINE"
    echo "verdict: the product at this path is NOT the expected binary; nothing was installed; the device is untouched."
    echo "rule (founder, 2026-09-13): if that exact binary no longer exists, STOP. Do not rebuild and call the result the historical subject."
  } | tee "$LEDGER/reinstall-$STAMP.REFUSED.txt"
  exit 3
fi
if [ -n "$PIN_BID" ]; then
  # VPIO-01B §6 / VPIO-02B — the first-install precondition is JUST-IN-TIME: read the installed-app state now, not earlier.
  # ABSENT is the only reading that admits an install. PRESENT → STOP: no uninstall, no overwrite, no sample, return for ruling.
  # An unreadable listing establishes nothing → STOP. The historical .k00 bundle is never addressed here; the other VPIO
  # subject's bundle is never addressed either (each subject reads and installs only its own pinned bundle id).
  APPS_RC=0; APPS="$(xcrun devicectl device info apps --device "$DEV" 2>&1)" || APPS_RC=$?   # never let set -e turn an unreadable listing into a silent exit
  ABSENCE=""
  if [ $APPS_RC -ne 0 ]; then ABSENCE="UNREADABLE (devicectl apps listing rc=$APPS_RC) — absence NOT established"
  elif grep -q "$PIN_BID" <<<"$APPS"; then ABSENCE="PRESENT — $PIN_BID is already installed"
  else ABSENCE="ABSENT"; fi
  if [ "$ABSENCE" != "ABSENT" ]; then
    {
      echo "# reinstall $STAMP — REFUSED (first-install precondition: $PIN_BID $ABSENCE)"
      echo "custody gate: MATCH × all fields (uuid · dylib sha · executable sha · manifest sha · file set · bundle id)"
      echo "installed-app state read at $(date -u +%Y-%m-%dT%H:%M:%SZ): $ABSENCE"
      echo "verdict: NO install · NO uninstall · NO overwrite · NO sample · the device is untouched · return for ruling"
    } | tee "$LEDGER/reinstall-$STAMP.REFUSED.txt"
    exit 4
  fi
  if [ -z "${K00_EXEC_AUTHORITY:-}" ]; then
    {
      echo "# reinstall $STAMP — HELD (first-install authority not supplied at invocation)"
      echo "custody gate: MATCH × all fields · installed-app state: ABSENT"
      echo "the VPIO first-install transaction requires K00_EXEC_AUTHORITY at invocation (AUTH-3: authority is an input, never read from the repo); nothing was installed"
    } | tee "$LEDGER/reinstall-$STAMP.HELD.txt"
    exit 4
  fi
fi
{
  echo "# reinstall $STAMP"
  echo "## subject: $SUBJECT · bundle: $BID"
  [ -n "$PIN_BID" ] && echo "## custody gate: bundle id $PRODUCT_BID · executable SHA-256 $EXEC_SHA · manifest self SHA-256 $PIN_MANIFEST_SHA ($PIN_MANIFEST_FILES files) — MATCH; installed-app state at first install: ABSENT; authority supplied at invocation: yes"
  [ -n "$EXPECT" ] && echo "## custody gate: expected $EXPECT — product reads $UUID — MATCH"
  [ -n "$EXPECT_SHA" ] && echo "## custody gate: dylib SHA-256 expected $EXPECT_SHA — product reads $DYL_SHA — MATCH"
  [ -n "$EXPECT_MAN" ] && echo "## custody gate: manifest $EXPECT_MAN ($MAN_FILES files) — every file hashes identically, file set identical — MATCH"
  echo "## dylib uuid (local product, BEFORE install)"
  echo "$UUID_LINE"
  echo "## codesign"
  codesign -dv "$APP" 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority' || true
  echo "## install"
  xcrun devicectl device install app --device "$DEV" "$APP" 2>&1
  echo "## post-install processes (harness must be absent)"
  xcrun devicectl device info processes --device "$DEV" 2>&1 | grep -i VoiceKernelHarness || echo "(no VoiceKernelHarness process)"
} | tee "$LEDGER/reinstall-$STAMP.txt"
echo "$STAMP" > "$LEDGER/.last-reinstall"
echo "reinstall artefacts written: $LEDGER/reinstall-$STAMP.txt"
