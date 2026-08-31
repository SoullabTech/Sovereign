/**
 * Platform Detection Utilities
 * Detect simulator/emulator environments and handle gracefully
 */

import { Capacitor } from '@capacitor/core';

export interface PlatformInfo {
  platform: 'web' | 'ios' | 'android' | 'desktop';
  isNative: boolean;
  /** DESKTOP-SOVEREIGN-STT-01 — the MAIA Desktop shell, a category of its own. */
  isDesktop: boolean;
  isSimulator: boolean;
  hasVoiceSupport: boolean;
  hasMicrophoneAccess: boolean;
}

/**
 * DESKTOP-SOVEREIGN-STT-01 — Desktop is a FIRST-CLASS PLATFORM, not a browser.
 *
 * ⛔ THE DEFECT THIS EXISTS FOR (VOICE-PATH-SELECTION-01). The taxonomy had two
 * categories — Capacitor-native and web — and asked exactly one question to
 * choose between them: `Capacitor.isNativePlatform()`. A BrowserView has no
 * native bridge, so MAIA Desktop answered "web" and took the browser
 * `SpeechRecognition` path: member audio handed to a browser-managed, network-
 * dependent recognition service, contrary to D01 §XII.
 *
 * The sovereign path already existed (`/api/voice/transcribe-simple` → local
 * Faster-Whisper) and was reachable only from `isAndroidWebChrome()` recovery
 * or from browsers with no Web Speech API at all. Desktop could not reach it
 * by construction.
 *
 * ⛔ WHY A UA MARKER AND NOT A BRIDGE. Classification is not authority. Adding
 * a preload or an IPC channel to answer "which platform am I" would widen the
 * Desktop attack surface to settle a routing question. The Electron shell
 * already announces itself in the user agent (`maia-desktop/<version>`, derived
 * from the app's own package name), and that string reaches the page without
 * any privileged channel. Whether `/maia` may open a microphone at all remains
 * governed where it was: the main-process permission gate, scoped to the exact
 * `/maia` surface.
 *
 * The marker is pinned to the package name by
 * `lib/utils/__tests__/voiceTransportSelection.test.ts`, which reads
 * `maia-desktop/package.json` and asserts the token it yields is still
 * accepted — so a rename breaks a test rather than silently reclassifying
 * Desktop as an ordinary browser.
 *
 * ⛔ WHAT THIS PREDICATE DOES NOT ANSWER (route census, 2026-08-31). It answers
 * exactly one question: *is this web page being hosted by an Electron shell
 * whose product token is `maia-desktop/`?* It is a SHELL classifier. It is NOT
 * an architecture classifier, and `isDesktopShell() === true` must never be
 * read as "the sovereign D01 pipeline is in play".
 *
 * The reason is a verified name collision: `maia-desktop/` (the D01 client) and
 * `desktop-app/` (an Electron host that wraps the web app) BOTH declare
 * `"name": "maia-desktop"` in package.json. They are materially different
 * architectures — `maia-desktop/src/main.js` does `loadFile(src/index.html)`
 * and carries its own capture → VAD → Whisper → MAIA → TTS pipeline, and never
 * loads this code at all; `desktop-app/src/main.js` does `loadURL(...)` and
 * mounts the real web surfaces, where this code does run. So the two possible
 * inferences fail in opposite directions: inside `desktop-app/` the predicate
 * could be true while the D01 pipeline is entirely absent, and inside
 * `maia-desktop/` the D01 pipeline is present while this predicate is never
 * consulted.
 *
 * ⚠️ UNRESOLVED, held rather than assumed. Whether `desktop-app/` actually
 * emits the marker at runtime is NOT established. It calls
 * `app.setName('Soullab AIN')` before window creation and appends
 * ` MAIADesktop/<version>` to the UA — neither of which matches this regex — so
 * it may well classify as an ordinary browser. That is a runtime claim and
 * needs a runtime witness; no Electron is installed in this tree to produce
 * one. Do not resolve it by reading either main.js. Two other shells load web
 * routes and are worth the same check before relying on this predicate:
 * `compact-companion/` (`/maia/compact`) and `electron/main.js`
 * (`/maia/labtools`).
 *
 * If a caller ever needs an architecture-level predicate — "am I inside the
 * D01 client?" — do not widen this one. Establish the runtime facts first,
 * give the two packages distinct names so the UA can separate them, and add a
 * predicate that a real caller asked for.
 */
const DESKTOP_SHELL_UA_MARKER = /\bmaia-desktop\//i;

/**
 * Is this web page hosted by a `maia-desktop`-named Electron shell?
 *
 * ⛔ NOT "is this the sovereign D01 client" — see the collision note above.
 */
export function isDesktopShell(userAgent?: string): boolean {
  // Capacitor wins: a native build is native, whatever its UA says.
  if (Capacitor.isNativePlatform()) return false;
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return DESKTOP_SHELL_UA_MARKER.test(ua);
}

/**
 * Which transcription transport a surface must use.
 *
 *   native-speech      Capacitor iOS/Android — the native speech plugin
 *   sovereign-whisper  getUserMedia → MediaRecorder → /api/voice/transcribe-simple
 *                      → local Faster-Whisper. Audio stays first-party.
 *   web-speech         the browser's own SpeechRecognition
 *   none               no usable transport; the caller must say so plainly
 */
export type VoiceTransport = 'native-speech' | 'sovereign-whisper' | 'web-speech' | 'none';

export interface VoiceTransportFacts {
  isNative: boolean;
  isDesktop: boolean;
  hasSpeechRecognition: boolean;
  canRecordAudio: boolean;
}

/**
 * Choose the transport. PURE — every input is a parameter, so the rule can be
 * exercised for platforms the test runner will never actually be.
 *
 * ⛔ THE LOAD-BEARING CLAUSE: Desktop NEVER resolves to `web-speech`, and the
 * check does not consult `hasSpeechRecognition` at all on that branch. Chromium
 * ships `SpeechRecognition`, so a rule of the form "use Whisper when Web Speech
 * is missing" would silently return Desktop to the browser service — which is
 * precisely how this defect existed. A Desktop that cannot record returns
 * `none`, an honest failure, rather than degrading to the path canon forbids.
 */
export function selectVoiceTransport(facts: VoiceTransportFacts): VoiceTransport {
  if (facts.isNative) return 'native-speech';
  if (facts.isDesktop) return facts.canRecordAudio ? 'sovereign-whisper' : 'none';
  if (!facts.hasSpeechRecognition) return facts.canRecordAudio ? 'sovereign-whisper' : 'none';
  return 'web-speech';
}

/** Can this surface record audio for server-side transcription? */
export function canRecordAudioForWhisper(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

/** The transport for the surface we are actually running on. */
export function currentVoiceTransport(): VoiceTransport {
  return selectVoiceTransport({
    isNative: Capacitor.isNativePlatform(),
    isDesktop: isDesktopShell(),
    hasSpeechRecognition: hasSpeechRecognitionAPI(),
    canRecordAudio: canRecordAudioForWhisper(),
  });
}

/**
 * Detect if running in iOS Simulator
 */
export function isIOSSimulator(): boolean {
  if (typeof window === 'undefined') return false;

  const platform = Capacitor.getPlatform();
  if (platform !== 'ios') return false;

  // Check user agent for simulator indicators
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.includes('simulator') || ua.includes('x86_64') || ua.includes('i386');
}

/**
 * Detect Android Chrome running in a browser tab (NOT the Capacitor native app).
 *
 * This is the path where webkitSpeechRecognition lives — and where the
 * "recognition starts but no transcript returns" failure mode reported by
 * testers occurs. Used to scope Android-specific restart protections and
 * timeout fallback UX without touching desktop, iOS Safari, or native paths.
 *
 * Returns true only when:
 *   - UA matches /Android/
 *   - UA matches /Chrome|CriOS/ (Chrome family browsers)
 *   - NOT running inside Capacitor (`Capacitor.isNativePlatform() === false`)
 *
 * Returns false for: any iOS, desktop Chrome, Firefox, Safari, Capacitor
 * builds, or SSR.
 */
export function isAndroidWebChrome(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return false;

  const ua = navigator.userAgent;
  const isAndroid = /Android/.test(ua);
  const isChrome = /Chrome|CriOS/.test(ua);
  return isAndroid && isChrome;
}

/**
 * Detect if running in Android Emulator
 */
export function isAndroidEmulator(): boolean {
  if (typeof window === 'undefined') return false;

  const platform = Capacitor.getPlatform();
  if (platform !== 'android') return false;

  // Android emulators can be detected by checking device properties
  // This is a heuristic - may need refinement
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.includes('emulator') || ua.includes('sdk_gphone') || ua.includes('generic');
}

/**
 * Check if microphone access is available
 */
export async function checkMicrophoneAccess(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return false;
  }

  try {
    // Try to enumerate devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasMicrophone = devices.some(device => device.kind === 'audioinput');

    if (!hasMicrophone) {
      return false;
    }

    // Try to get user media (will trigger permission prompt if not yet granted)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Clean up the stream immediately
    stream.getTracks().forEach(track => track.stop());

    return true;
  } catch (error) {
    console.warn('Microphone access check failed:', error);
    return false;
  }
}

/**
 * Check if Web Speech API is available (without testing mic access)
 */
export function hasSpeechRecognitionAPI(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Get comprehensive platform information
 * NOTE: For web, we check if Speech API exists, NOT if mic permission is granted.
 * Mic permission will be requested when user actually clicks to start voice.
 */
export async function getPlatformInfo(): Promise<PlatformInfo> {
  const isDesktop = isDesktopShell();
  const platform = (isDesktop ? 'desktop' : Capacitor.getPlatform()) as PlatformInfo['platform'];
  const isNative = Capacitor.isNativePlatform();
  const isSimulator = isIOSSimulator() || isAndroidEmulator();

  // Native platforms use native speech plugin (doesn't need web mic access check)
  // Simulators may work with native speech but with limited functionality
  if (isNative) {
    return {
      platform,
      isNative,
      isDesktop,
      isSimulator,
      hasVoiceSupport: true, // Native speech plugin handles this
      hasMicrophoneAccess: true // Will be checked at runtime by native plugin
    };
  }

  // Web: Check if Speech Recognition API exists (don't pre-test mic - it needs user gesture)
  // We're permissive here - actual mic access will be checked when user clicks to start voice
  const hasSpeechAPI = hasSpeechRecognitionAPI();
  const hasMicDevice = typeof navigator !== 'undefined' && !!navigator.mediaDevices;

  // 🦊 Firefox / Zen ship NO Web Speech API but DO support MediaRecorder +
  // getUserMedia, which routes to one-shot local Whisper capture (see
  // androidVoiceFallback.ts + the web-whisper branch in ContinuousConversation).
  // Count that as voice support so the mic affordance matches real capability
  // instead of gating on Web Speech alone — otherwise the button shows a
  // permanent "unavailable" state on a browser that can actually do voice.
  const canRecordForWhisper =
    typeof MediaRecorder !== 'undefined' &&
    !!navigator?.mediaDevices?.getUserMedia;

  // Voice support = a mic device exists AND we can either run Web Speech OR
  // record audio for server-side transcription. Don't call getUserMedia here —
  // it needs a user gesture and will fail if called too early.
  // ⛔ DESKTOP-SOVEREIGN-STT-01. On Desktop, voice support is the ability to
  // RECORD, never the presence of Web Speech. Chromium ships SpeechRecognition,
  // so counting it here would advertise a capability Desktop is forbidden to use.
  const hasVoiceSupport = hasMicDevice && (isDesktop
    ? canRecordForWhisper
    : (hasSpeechAPI || canRecordForWhisper));

  console.log('[platformDetection] voice check:', {
    platform,
    isDesktop,
    hasSpeechAPI,
    hasMicDevice,
    canRecordForWhisper,
    transport: selectVoiceTransport({
      isNative, isDesktop, hasSpeechRecognition: hasSpeechAPI, canRecordAudio: canRecordForWhisper,
    }),
    hasVoiceSupport
  });

  return {
    platform,
    isNative,
    isDesktop,
    isSimulator,
    hasVoiceSupport,
    hasMicrophoneAccess: hasMicDevice // Actual access will be requested at runtime
  };
}

/**
 * Get user-friendly message for voice unavailability
 */
export function getVoiceUnavailableMessage(platformInfo: PlatformInfo): string {
  if (platformInfo.isSimulator) {
    return 'Voice is unavailable in simulator. Use text input or test on a physical device.';
  }

  if (!platformInfo.hasMicrophoneAccess) {
    return 'Microphone access denied. Check your browser/device permissions.';
  }

  return 'Voice is currently unavailable. Please use text input.';
}

/**
 * Log platform detection for debugging
 */
export function logPlatformInfo(platformInfo: PlatformInfo): void {
  console.log('🔍 Platform Detection:');
  console.log(`  Platform: ${platformInfo.platform}`);
  console.log(`  Native: ${platformInfo.isNative}`);
  console.log(`  Simulator: ${platformInfo.isSimulator}`);
  console.log(`  Voice Support: ${platformInfo.hasVoiceSupport}`);
  console.log(`  Microphone Access: ${platformInfo.hasMicrophoneAccess}`);

  if (platformInfo.isSimulator) {
    console.warn('⚠️ Running in simulator - voice features disabled');
  }
}
