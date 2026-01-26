/**
 * Native Biometry Authentication
 *
 * Wrapper for @aparajita/capacitor-biometric-auth plugin
 * Provides real Face ID/Touch ID prompts on iOS native apps
 * (WebAuthn doesn't work in WKWebView)
 */

import { Capacitor } from '@capacitor/core';

export type BiometryType = 'face_id' | 'touch_id' | 'face' | 'fingerprint' | 'none';

export interface NativeBiometryAvailability {
  isAvailable: boolean;
  biometryType: BiometryType;
  reason?: string;
}

export interface NativeBiometryResult {
  success: boolean;
  error?: string;
}

/**
 * Check if native biometry is available
 */
export async function checkAvailability(): Promise<NativeBiometryAvailability> {
  // Only available on native platforms
  if (!Capacitor.isNativePlatform()) {
    return {
      isAvailable: false,
      biometryType: 'none',
      reason: 'Not a native platform'
    };
  }

  try {
    const { BiometricAuth, BiometryType: PluginBiometryType } = await import('@aparajita/capacitor-biometric-auth');

    const result = await BiometricAuth.checkBiometry();

    // Map plugin biometry types to our types
    let biometryType: BiometryType = 'none';
    switch (result.biometryType) {
      case PluginBiometryType.faceId:
        biometryType = 'face_id';
        break;
      case PluginBiometryType.touchId:
        biometryType = 'touch_id';
        break;
      case PluginBiometryType.faceAuthentication:
        biometryType = 'face';
        break;
      case PluginBiometryType.fingerprintAuthentication:
        biometryType = 'fingerprint';
        break;
      default:
        biometryType = 'none';
    }

    return {
      isAvailable: result.isAvailable,
      biometryType,
      reason: result.reason
    };
  } catch (error) {
    console.error('[NativeBiometry] checkAvailability error:', error);
    return {
      isAvailable: false,
      biometryType: 'none',
      reason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Prompt for biometric authentication
 */
export async function authenticate(reason: string = 'Verify your identity'): Promise<NativeBiometryResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      success: false,
      error: 'Not a native platform'
    };
  }

  try {
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');

    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'Cancel',
      allowDeviceCredential: true, // Allow passcode fallback
      iosFallbackTitle: 'Use Passcode',
      androidTitle: 'Biometric Login',
      androidSubtitle: 'Log in using your biometric credential',
      androidConfirmationRequired: false,
    });

    return { success: true };
  } catch (error) {
    console.error('[NativeBiometry] authenticate error:', error);

    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

    // User cancelled
    if (errorMessage.includes('cancel') || errorMessage.includes('Cancel')) {
      return {
        success: false,
        error: 'Authentication cancelled'
      };
    }

    // Biometry not available
    if (errorMessage.includes('not available') || errorMessage.includes('not enrolled')) {
      return {
        success: false,
        error: 'Biometric authentication not available'
      };
    }

    // Failed attempts
    if (errorMessage.includes('locked') || errorMessage.includes('too many')) {
      return {
        success: false,
        error: 'Too many failed attempts. Please try again later.'
      };
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get human-readable biometry name
 */
export function getBiometryName(type: BiometryType): string {
  switch (type) {
    case 'face_id':
      return 'Face ID';
    case 'touch_id':
      return 'Touch ID';
    case 'face':
      return 'Face Recognition';
    case 'fingerprint':
      return 'Fingerprint';
    default:
      return 'Biometric';
  }
}

/**
 * Combined check and name helper
 */
export async function getBiometryInfo(): Promise<{
  available: boolean;
  type: BiometryType;
  name: string;
}> {
  const availability = await checkAvailability();
  return {
    available: availability.isAvailable,
    type: availability.biometryType,
    name: getBiometryName(availability.biometryType)
  };
}
