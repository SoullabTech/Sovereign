// Native voice recording adapter for iOS/Android
// Uses capacitor-voice-recorder for reliable native mic access
// Bypasses WKWebView media stack issues on iOS

import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { VoiceController } from './AudioSessionManager';
import { getFeatureFlag } from '@/lib/features/flags';

// Diagnostic: Log platform info on module load
console.log('[NativeRecorder] Module loaded. Platform:', Capacitor.getPlatform(), 'isNative:', Capacitor.isNativePlatform());

/**
 * Normalize base64 string from native plugin
 * - Strips data URI prefix if present (e.g., "data:audio/wav;base64,")
 * - Fixes missing padding (some encoders omit trailing '=')
 */
function normalizeBase64(input: string): string {
  // Check for data URI prefix
  const hasPrefix = input.includes('base64,');
  if (hasPrefix) {
    console.log('[NativeRecorder] Stripping data URI prefix from base64');
  }

  // Strip data URI prefix if present
  const stripped = hasPrefix ? input.split('base64,').pop()! : input;

  // Remove whitespace/newlines that can creep in
  let b64 = stripped.replace(/\s/g, '');

  // Fix missing padding (common on some native encoders)
  const pad = b64.length % 4;
  if (pad === 2) {
    b64 += '==';
    console.log('[NativeRecorder] Added == padding to base64');
  } else if (pad === 3) {
    b64 += '=';
    console.log('[NativeRecorder] Added = padding to base64');
  }

  return b64;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const normalized = normalizeBase64(base64);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export type NativeVoiceStopResult = {
  blob: Blob;
  mimeType: string;
  durationMs?: number;
};

export type PermissionStatus = 'GRANTED' | 'DENIED' | 'NOT_DETERMINED' | 'DISABLED_BY_USER';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Check if native voice recording is available
 */
export async function canRecordNative(): Promise<{ available: boolean; status: PermissionStatus }> {
  try {
    const result = await VoiceRecorder.hasAudioRecordingPermission();
    return {
      available: result.value === true,
      status: result.value ? 'GRANTED' : 'DENIED'
    };
  } catch (error) {
    console.error('[NativeRecorder] hasAudioRecordingPermission error:', error);
    return { available: false, status: 'DENIED' };
  }
}

/**
 * Ensure microphone permission is granted
 * @throws Error with status code if permission denied
 */
export async function ensureNativeMicPermission(): Promise<void> {
  // Feature flag gate: IOS_VOICE_NATIVE must be enabled
  if (!getFeatureFlag('IOS_VOICE_NATIVE')) {
    console.log('[NativeRecorder] IOS_VOICE_NATIVE feature flag disabled');
    throw new Error('IOS_VOICE_NATIVE_DISABLED');
  }

  const permResult = await VoiceRecorder.hasAudioRecordingPermission();
  console.log('[NativeRecorder] Current permission status:', permResult.value);

  if (permResult.value === true) return;

  // Request permission
  console.log('[NativeRecorder] Requesting permission...');
  try {
    const req = await VoiceRecorder.requestAudioRecordingPermission();
    console.log('[NativeRecorder] Permission granted:', req.value);
    if (!req.value) {
      throw new Error('MIC_PERMISSION_DENIED');
    }
  } catch (err: any) {
    // Permission denied
    console.error('[NativeRecorder] Permission denied:', err);
    throw new Error(`MIC_PERMISSION_DENIED`);
  }
}

/**
 * Start native voice recording
 * @throws Error if permission denied or recording fails
 */
export async function startNativeRecording(): Promise<void> {
  // Feature flag gate: IOS_VOICE_NATIVE must be enabled
  if (!getFeatureFlag('IOS_VOICE_NATIVE')) {
    console.log('[NativeRecorder] IOS_VOICE_NATIVE feature flag disabled');
    throw new Error('IOS_VOICE_NATIVE_DISABLED');
  }

  console.log('[NativeRecorder] Starting recording...', {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform()
  });

  // Step 1: Prepare audio session for listening (iOS audio session gatekeeper)
  // This performs a full teardown of any TTS/playback before configuring for input
  if (VoiceController.isNativeIOS()) {
    console.log('[NativeRecorder] Preparing audio session for listening...');
    const prepared = await VoiceController.prepareForListening();
    if (!prepared) {
      console.error('[NativeRecorder] Failed to prepare audio session for listening');
      // Log diagnostics for debugging
      await VoiceController.logDiagnostics();
      throw new Error('AUDIO_SESSION_PREPARE_FAILED');
    }
    console.log('[NativeRecorder] Audio session ready for listening');
  }

  // Step 2: Ensure microphone permission
  await ensureNativeMicPermission();
  console.log('[NativeRecorder] Permission verified, calling startRecording()...');

  // Step 3: Start recording
  await VoiceRecorder.startRecording();
  console.log('[NativeRecorder] ✅ Recording started successfully');
}

/**
 * Stop native voice recording and get the audio blob
 * @returns Audio blob with mime type and duration
 */
export async function stopNativeRecording(): Promise<NativeVoiceStopResult> {
  console.log('[NativeRecorder] Stopping recording...');
  const result = await VoiceRecorder.stopRecording();

  // Return audio session to idle state after recording stops
  if (VoiceController.isNativeIOS()) {
    console.log('[NativeRecorder] Returning audio session to idle...');
    await VoiceController.stopAllAudio();
  }

  // New API: result.value contains { recordDataBase64, msDuration, mimeType }
  const recordData = result.value;
  const base64 = recordData.recordDataBase64 || '';
  const msDuration = recordData.msDuration || 0;
  const mimeType = recordData.mimeType || 'audio/wav';

  // DIAGNOSTIC: Log detailed info about captured audio
  const hasDataUriPrefix = base64.includes('base64,');
  console.log('[NativeRecorder] Raw result:', JSON.stringify({
    hasMsDuration: msDuration > 0,
    msDuration,
    hasBase64: base64.length > 0,
    base64Length: base64.length,
    hasDataUriPrefix,
    base64Preview: base64.substring(0, 50) || '(empty)',
    mimeType
  }));

  // Plugin returns base64 + msDuration
  const bytes = base64ToUint8Array(base64);
  // Cast to ArrayBuffer for Blob compatibility
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });

  console.log('[NativeRecorder] Audio captured:', {
    durationMs: msDuration,
    base64Chars: base64.length,
    blobBytes: blob.size,
    mimeType
  });

  return { blob, mimeType, durationMs: msDuration };
}

/**
 * Check if currently recording
 */
export async function isCurrentlyRecording(): Promise<boolean> {
  try {
    const status = await VoiceRecorder.getCurrentStatus();
    return status.status === 'RECORDING';
  } catch {
    return false;
  }
}

/**
 * Pause recording (if supported)
 */
export async function pauseNativeRecording(): Promise<void> {
  await VoiceRecorder.pauseRecording();
}

/**
 * Resume recording (if supported)
 */
export async function resumeNativeRecording(): Promise<void> {
  await VoiceRecorder.resumeRecording();
}

/**
 * Get user-friendly error message from permission status
 */
export function getPermissionErrorMessage(status: PermissionStatus): string {
  switch (status) {
    case 'DISABLED_BY_USER':
      return 'Microphone access was disabled. Please enable it in Settings → MAIA';
    case 'DENIED':
      return 'Microphone permission was denied. Please enable it in Settings → MAIA';
    case 'NOT_DETERMINED':
      return 'Microphone permission not yet requested';
    default:
      return 'Unable to access microphone';
  }
}
