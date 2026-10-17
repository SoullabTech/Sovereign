/**
 * Unified Biometry Service Stub
 * Placeholder for cross-platform biometric authentication
 */

interface BiometryAvailability {
  available: boolean;
  biometryType?: 'face' | 'fingerprint' | 'none';
  reason?: string;
}

interface BiometryResult {
  success: boolean;
  error?: string;
  credential?: any;
}

class UnifiedBiometry {
  async getAvailability(): Promise<BiometryAvailability> {
    // Check if we're on a native platform with biometry
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
      // On native, defer to the existing biometricAuth
      const { biometricAuth } = await import('./biometricAuth');
      const result = await biometricAuth.getAvailability();
      // The verified WebAuthn adapter cannot infer Face ID vs fingerprint.
      // Require a platform authenticator rather than claiming native availability.
      return {
        available: result.available && result.platformAvailable,
        biometryType: 'none',
        reason: result.platformAvailable ? undefined : 'Platform authenticator unavailable'
      };
    }

    // Web platform - check WebAuthn availability
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      return { available: true, biometryType: 'none' };
    }

    return { available: false, reason: 'Biometry not supported on this platform' };
  }

  async authenticate(username?: string): Promise<BiometryResult> {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
      // On native, use existing biometricAuth
      const { biometricAuth } = await import('./biometricAuth');
      const result = await biometricAuth.authenticate(username);
      return {
        success: result.success,
        error: result.error
      };
    }

    // Web platform - stub
    return { success: false, error: 'WebAuthn not implemented in stub' };
  }
}

export const unifiedBiometry = new UnifiedBiometry();
