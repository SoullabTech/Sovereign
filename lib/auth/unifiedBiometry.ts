/**
 * Unified Biometry Service
 *
 * Bridges WebAuthn (web browsers) and Native Biometry (iOS/Android apps)
 * Auto-selects the right method based on platform:
 *
 * - Web browsers: WebAuthn passkeys (existing flow)
 * - iOS/Android native: Capacitor BiometricAuth plugin (real Face ID/Touch ID)
 *
 * On native platforms, authentication works via:
 * 1. Device must already be trusted (from previous password login)
 * 2. Native biometry prompt (Face ID/Touch ID) verifies user presence
 * 3. Server validates trusted device + creates session
 */

import { Capacitor } from '@capacitor/core';
import { biometricAuth, type BiometricAuthResult } from './biometricAuth';
import * as nativeBiometry from './nativeBiometry';
import { apiUrl, getValidMemberId } from '../http/apiBase';
import { deviceTrust } from './deviceTrust';

export interface UnifiedBiometryAvailability {
  available: boolean;
  method: 'webauthn' | 'native' | 'none';
  biometryType: string;
  biometryName: string;
}

export interface UnifiedAuthResult {
  success: boolean;
  error?: string;
  code?: string;
  member?: {
    id: string;
    username: string;
    name: string;
    preferredName: string;
    onboarded: boolean;
    hasWebauthn: boolean;
    preferredAuthMethod: string;
  };
  session?: {
    expiresAt: string;
  };
}

class UnifiedBiometryService {
  /**
   * Check if biometric authentication is available
   */
  async getAvailability(): Promise<UnifiedBiometryAvailability> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      // Use native biometry on iOS/Android
      const nativeInfo = await nativeBiometry.getBiometryInfo();

      if (nativeInfo.available) {
        return {
          available: true,
          method: 'native',
          biometryType: nativeInfo.type,
          biometryName: nativeInfo.name
        };
      }

      // Native platform but no biometry available
      return {
        available: false,
        method: 'none',
        biometryType: 'none',
        biometryName: 'Biometric'
      };
    }

    // Web browser - check WebAuthn
    const webAvailability = await biometricAuth.getAvailability();

    if (webAvailability.available && webAvailability.platformAvailable) {
      return {
        available: true,
        method: 'webauthn',
        biometryType: 'passkey',
        biometryName: biometricAuth.getBiometricName()
      };
    }

    return {
      available: false,
      method: 'none',
      biometryType: 'none',
      biometryName: 'Biometric'
    };
  }

  /**
   * Check if biometrics are available (simple boolean)
   */
  async isAvailable(): Promise<boolean> {
    const availability = await this.getAvailability();
    return availability.available;
  }

  /**
   * Get friendly biometric name based on platform
   */
  async getBiometricName(): Promise<string> {
    const availability = await this.getAvailability();
    return availability.biometryName;
  }

  /**
   * Authenticate using the appropriate method for the platform
   */
  async authenticate(username?: string): Promise<UnifiedAuthResult> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      return this.authenticateNative();
    }

    // Web browser - use WebAuthn
    return this.authenticateWebAuthn(username);
  }

  /**
   * Native biometry authentication flow:
   * 1. Check device is trusted
   * 2. Prompt Face ID/Touch ID
   * 3. Verify with server
   */
  private async authenticateNative(): Promise<UnifiedAuthResult> {
    try {
      // Check native biometry is available
      const availability = await nativeBiometry.checkAvailability();
      if (!availability.isAvailable) {
        return {
          success: false,
          error: `${nativeBiometry.getBiometryName(availability.biometryType)} not available`,
          code: 'BIOMETRY_NOT_AVAILABLE'
        };
      }

      // Get device ID - must be a trusted device
      const deviceId = deviceTrust.getCurrentDeviceId();
      if (!deviceId) {
        return {
          success: false,
          error: 'This device is not trusted. Sign in with password first, then enable biometric login.',
          code: 'DEVICE_NOT_TRUSTED'
        };
      }

      // Get member ID from local storage
      const memberId = getValidMemberId();
      if (!memberId) {
        return {
          success: false,
          error: 'No account found. Sign in with password first.',
          code: 'NO_MEMBER_ID'
        };
      }

      // Prompt Face ID / Touch ID
      const biometryName = nativeBiometry.getBiometryName(availability.biometryType);
      const authResult = await nativeBiometry.authenticate(`Use ${biometryName} to sign in to MAIA`);

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Biometric authentication failed',
          code: 'BIOMETRY_FAILED'
        };
      }

      // Biometry succeeded - verify with server
      const response = await fetch(apiUrl('/api/auth/native-biometry/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-member-id': memberId
        },
        credentials: 'include',
        body: JSON.stringify({
          deviceId,
          biometryType: availability.biometryType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error codes
        if (errorData.code === 'DEVICE_NOT_FOUND') {
          // Clear stale device ID
          localStorage.removeItem('device_id');
          return {
            success: false,
            error: 'Device trust expired. Sign in with password to re-enable biometrics.',
            code: 'DEVICE_NOT_FOUND'
          };
        }

        return {
          success: false,
          error: errorData.error || 'Server verification failed',
          code: errorData.code || 'SERVER_ERROR'
        };
      }

      const data = await response.json();

      return {
        success: true,
        member: data.member,
        session: data.session
      };

    } catch (error) {
      console.error('[UnifiedBiometry] Native auth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * WebAuthn authentication flow (existing behavior)
   */
  private async authenticateWebAuthn(username?: string): Promise<UnifiedAuthResult> {
    const result: BiometricAuthResult = await biometricAuth.authenticate(username);

    return {
      success: result.success,
      error: result.error,
      code: result.code,
      member: result.member,
      session: result.session
    };
  }

  /**
   * Register biometric credentials (WebAuthn only, requires session)
   */
  async register(deviceName?: string): Promise<{ success: boolean; error?: string }> {
    // Registration only makes sense for WebAuthn (creates passkey on device)
    // Native biometry just needs device trust + Face ID prompt
    if (Capacitor.isNativePlatform()) {
      // On native, "registration" means enabling biometry for this trusted device
      return this.enableNativeBiometry();
    }

    // Web - use WebAuthn registration
    const result = await biometricAuth.register(deviceName);
    return {
      success: result.success,
      error: result.error
    };
  }

  /**
   * Enable native biometry for the current trusted device
   */
  private async enableNativeBiometry(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check biometry is available
      const availability = await nativeBiometry.checkAvailability();
      if (!availability.isAvailable) {
        return {
          success: false,
          error: `${nativeBiometry.getBiometryName(availability.biometryType)} not available on this device`
        };
      }

      // Get device ID
      const deviceId = deviceTrust.getCurrentDeviceId();
      if (!deviceId) {
        return {
          success: false,
          error: 'Device not trusted. Sign in with password first.'
        };
      }

      // Prompt for biometry to confirm
      const biometryName = nativeBiometry.getBiometryName(availability.biometryType);
      const authResult = await nativeBiometry.authenticate(`Enable ${biometryName} for MAIA`);

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Biometric verification failed'
        };
      }

      // Update server - mark device as having native biometry enabled
      const memberId = getValidMemberId();
      if (!memberId) {
        return {
          success: false,
          error: 'No valid session'
        };
      }

      const response = await fetch(apiUrl('/api/auth/native-biometry/enable'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-member-id': memberId
        },
        credentials: 'include',
        body: JSON.stringify({
          deviceId,
          biometryType: availability.biometryType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || 'Failed to enable biometrics'
        };
      }

      return { success: true };

    } catch (error) {
      console.error('[UnifiedBiometry] Enable native biometry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable biometrics'
      };
    }
  }
}

export const unifiedBiometry = new UnifiedBiometryService();
