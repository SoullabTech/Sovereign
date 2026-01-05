// Native voice recording adapter for iOS/Android
// Uses @lgicc/capacitor-voice-recorder for reliable native mic access
// Bypasses WKWebView media stack issues on iOS

import { Capacitor } from '@capacitor/core';
import { CapacitorVoiceRecorder } from '@lgicc/capacitor-voice-recorder';

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
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
    const result = await CapacitorVoiceRecorder.canRecord();
    return {
      available: result.status === 'GRANTED',
      status: result.status as PermissionStatus
    };
  } catch (error) {
    console.error('[NativeRecorder] canRecord error:', error);
    return { available: false, status: 'DENIED' };
  }
}

/**
 * Ensure microphone permission is granted
 * @throws Error with status code if permission denied
 */
export async function ensureNativeMicPermission(): Promise<void> {
  const { status } = await CapacitorVoiceRecorder.canRecord();
  console.log('[NativeRecorder] Current permission status:', status);

  if (status === 'GRANTED') return;

  // Request permission (no options in this plugin version)
  console.log('[NativeRecorder] Requesting permission...');
  try {
    const req = await CapacitorVoiceRecorder.requestPermission();
    // If we get here, permission was granted (returns { isGranted: true })
    console.log('[NativeRecorder] Permission granted:', req.isGranted);
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
  console.log('[NativeRecorder] Starting recording...');
  await ensureNativeMicPermission();
  await CapacitorVoiceRecorder.startRecording();
  console.log('[NativeRecorder] Recording started');
}

/**
 * Stop native voice recording and get the audio blob
 * @returns Audio blob with mime type and duration
 */
export async function stopNativeRecording(): Promise<NativeVoiceStopResult> {
  console.log('[NativeRecorder] Stopping recording...');
  const result = await CapacitorVoiceRecorder.stopRecording();
  console.log('[NativeRecorder] Recording stopped, duration:', result.msDuration, 'ms');

  // Plugin returns base64 + msDuration + size (wav by default)
  const bytes = base64ToUint8Array(result.base64);
  const mimeType = 'audio/wav';
  // Cast to ArrayBuffer for Blob compatibility
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });

  return { blob, mimeType, durationMs: result.msDuration };
}

/**
 * Check if currently recording
 */
export async function isCurrentlyRecording(): Promise<boolean> {
  try {
    const status = await CapacitorVoiceRecorder.getCurrentStatus();
    return status.status === 'RECORDING';
  } catch {
    return false;
  }
}

/**
 * Pause recording (if supported)
 */
export async function pauseNativeRecording(): Promise<void> {
  await CapacitorVoiceRecorder.pauseRecording();
}

/**
 * Resume recording (if supported)
 */
export async function resumeNativeRecording(): Promise<void> {
  await CapacitorVoiceRecorder.resumeRecording();
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
