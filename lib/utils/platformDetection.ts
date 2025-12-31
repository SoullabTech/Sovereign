/**
 * Platform Detection Utilities
 * Detect simulator/emulator environments and handle gracefully
 */

import { Capacitor } from '@capacitor/core';

export interface PlatformInfo {
  platform: 'web' | 'ios' | 'android';
  isNative: boolean;
  isSimulator: boolean;
  hasVoiceSupport: boolean;
  hasMicrophoneAccess: boolean;
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
 * Get comprehensive platform information
 */
export async function getPlatformInfo(): Promise<PlatformInfo> {
  const platform = Capacitor.getPlatform() as 'web' | 'ios' | 'android';
  const isNative = Capacitor.isNativePlatform();
  const isSimulator = isIOSSimulator() || isAndroidEmulator();

  // Native platforms use native speech plugin (doesn't need web mic access check)
  // Simulators may work with native speech but with limited functionality
  if (isNative) {
    return {
      platform,
      isNative,
      isSimulator,
      hasVoiceSupport: true, // Native speech plugin handles this
      hasMicrophoneAccess: true // Will be checked at runtime by native plugin
    };
  }

  // Web: Check microphone access
  const hasMicrophoneAccess = await checkMicrophoneAccess();

  // Voice support requires microphone
  const hasVoiceSupport = hasMicrophoneAccess;

  return {
    platform,
    isNative,
    isSimulator,
    hasVoiceSupport,
    hasMicrophoneAccess
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
