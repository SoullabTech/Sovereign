#!/usr/bin/env bash
# Desktop voice lineage guard — docs/ops/DESKTOP_VOICE_CONVERGENCE_ORDER.md
#
# The witnessed STT lineage (1c2c59af9) was carried by CONTENT, not by
# cherry-picked commits, so a merge with any older voice branch conflicts on
# files whose content agrees. Resolving those by taking the older side silently
# reverts device-witnessed fixes and looks like an ordinary merge.
#
# Run this on any convergence result BEFORE committing it.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0
bad() { echo "  ⛔ $1"; fail=1; }

[ -f lib/voice/rollingPartialTranscription.ts ] || \
  bad "rollingPartialTranscription.ts is GONE — provisional hearing (INTERIM-01) was reverted"
[ -f lib/voice/desktopUtteranceLimits.ts ] || \
  bad "desktopUtteranceLimits.ts is GONE — Desktop is back on Android's 8s cap (UTTERANCE-LIMIT-01)"
[ -f lib/voice/transcribeResponse.ts ] || \
  bad "transcribeResponse.ts is GONE — transcripts will be read as blank again"

grep -q "if (facts.isDesktop) return facts.canRecordAudio ? 'sovereign-whisper'" \
  lib/utils/platformDetection.ts 2>/dev/null || \
  bad "selectVoiceTransport lost its Desktop branch — Desktop can reach web-speech again"
grep -q "isDesktop || !hasSpeechRecognitionAPI()" \
  components/voice/ContinuousConversation.tsx 2>/dev/null || \
  bad "ContinuousConversation no longer obeys the Desktop route"
grep -q "DESKTOP_MAX_UTTERANCE_MS" components/voice/ContinuousConversation.tsx 2>/dev/null || \
  bad "the Desktop utterance limit is no longer applied — turns will cut at 8s"
grep -qE "payload\?\.text \?\? payload\?\.transcript" lib/voice/androidVoiceFallback.ts 2>/dev/null && \
  bad "the OLD response reader is back — every transcription reads as blank"

# Containment: remote content must never get a bridge.
# ⛔ Comments STRIPPED first. shell-policy legitimately mentions preload in prose
# to say there is none; matching that was this guard's own first false positive,
# and a guard that cries wolf is a guard someone turns off.
if [ -f maia-desktop/src/shell-policy.js ]; then
  grep -vE '^[[:space:]]*(\*|//|/\*)' maia-desktop/src/shell-policy.js \
    | sed 's://.*::' | grep -qE "\bpreload[[:space:]]*:" && \
    bad "PLATFORM_WEB_PREFERENCES has a preload KEY — the platform surface must have NO bridge"
fi
[ -f maia-desktop/src/surfaces.js ] && \
  bad "surfaces.js appeared — companion/01a-voice-wall is SUPERSEDED and must not be merged"
[ -f maia-desktop/src/preload-platform.js ] && \
  bad "preload-platform.js appeared — a bridge on remote content breaks containment"

if [ "$fail" != "0" ]; then
  echo
  echo "REFUSED: this is not an ordinary conflict resolution. An older voice lineage is"
  echo "overwriting the witnessed one. See docs/ops/DESKTOP_VOICE_CONVERGENCE_ORDER.md"
  exit 1
fi
echo "voice lineage intact."
