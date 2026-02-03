/**
 * Native Biometry Service
 *
 * Uses Capacitor native biometric plugin for Face ID / Touch ID on iOS.
 * Stores credentials securely in the iOS Keychain.
 *
 * Flow:
 * 1. User signs in with password/OAuth -> storeCredentials() saves to Keychain
 * 2. Next visit -> authenticate() unlocks Keychain with Face ID/Touch ID
 * 3. Retrieved credentials used for automatic signin
 */

import { Capacitor } from '@capacitor/core';

// Dynamic import to avoid SSR issues
let NativeBiometric: typeof import('capacitor-native-biometric').NativeBiometric | null = null;

async function getNativeBiometric() {
  if (!NativeBiometric) {
    const mod = await import('capacitor-native-biometric');
    NativeBiometric = mod.NativeBiometric;
  }
  return NativeBiometric;
}

export type BiometryType = 'face' | 'fingerprint' | 'iris' | 'none';

export interface NativeBiometryAvailability {
  available: boolean;
  biometryType: BiometryType;
  reason?: string;
}

export interface StoredCredentials {
  memberId: string;
  username: string;
  sessionToken?: string;
  name?: string;
  preferredName?: string;
}

export interface NativeBiometryResult {
  success: boolean;
  credentials?: StoredCredentials;
  error?: string;
  code?: string;
}

const CREDENTIALS_SERVER = 'life.soullab.maia';

class NativeBiometryService {
  private cachedAvailability: NativeBiometryAvailability | null = null;

  /**
   * Check if native biometry is available on this device
   */
  async checkAvailability(): Promise<NativeBiometryAvailability> {
    // Return cached result if available
    if (this.cachedAvailability) {
      return this.cachedAvailability;
    }

    // Not available on web
    if (!Capacitor.isNativePlatform()) {
      return {
        available: false,
        biometryType: 'none',
        reason: 'Not running on native platform',
      };
    }

    try {
      const biometric = await getNativeBiometric();
      const result = await biometric.isAvailable();

      let biometryType: BiometryType = 'none';
      if (result.biometryType === 1) biometryType = 'fingerprint';
      else if (result.biometryType === 2) biometryType = 'face';
      else if (result.biometryType === 3) biometryType = 'iris';

      this.cachedAvailability = {
        available: result.isAvailable,
        biometryType,
        reason: result.isAvailable ? undefined : result.errorCode?.toString(),
      };

      return this.cachedAvailability;
    } catch (error) {
      console.error('[NativeBiometry] Availability check failed:', error);
      return {
        available: false,
        biometryType: 'none',
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get friendly name for the biometry type
   */
  async getBiometryName(): Promise<string> {
    const avail = await this.checkAvailability();
    switch (avail.biometryType) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Touch ID';
      case 'iris':
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  /**
   * Check if we have stored credentials for biometric signin
   */
  async hasStoredCredentials(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const biometric = await getNativeBiometric();
      const credentials = await biometric.getCredentials({
        server: CREDENTIALS_SERVER,
      });
      return !!credentials?.username;
    } catch {
      // No credentials stored
      return false;
    }
  }

  /**
   * Store credentials securely in Keychain after successful signin
   * Call this after password/OAuth signin succeeds
   */
  async storeCredentials(credentials: StoredCredentials): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('[NativeBiometry] Cannot store credentials on web');
      return false;
    }

    const avail = await this.checkAvailability();
    if (!avail.available) {
      console.warn('[NativeBiometry] Biometry not available, cannot store credentials');
      return false;
    }

    try {
      const biometric = await getNativeBiometric();

      // Store credentials with member data as password (JSON encoded)
      const credentialData = JSON.stringify({
        memberId: credentials.memberId,
        sessionToken: credentials.sessionToken,
        name: credentials.name,
        preferredName: credentials.preferredName,
      });

      await biometric.setCredentials({
        server: CREDENTIALS_SERVER,
        username: credentials.username,
        password: credentialData,
      });

      console.log('[NativeBiometry] Credentials stored for:', credentials.username);
      return true;
    } catch (error) {
      console.error('[NativeBiometry] Failed to store credentials:', error);
      return false;
    }
  }

  /**
   * Authenticate with Face ID / Touch ID and retrieve stored credentials
   */
  async authenticate(): Promise<NativeBiometryResult> {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: false,
        error: 'Not running on native platform',
        code: 'NOT_NATIVE',
      };
    }

    const avail = await this.checkAvailability();
    if (!avail.available) {
      return {
        success: false,
        error: 'Biometric authentication not available',
        code: 'NOT_AVAILABLE',
      };
    }

    try {
      const biometric = await getNativeBiometric();
      const biometryName = await this.getBiometryName();

      // Verify with biometrics first
      await biometric.verifyIdentity({
        reason: `Sign in with ${biometryName}`,
        title: 'Sign in to Soullab',
        subtitle: `Use ${biometryName} to access your account`,
        description: '',
        useFallback: true,
        fallbackTitle: 'Use Passcode',
        maxAttempts: 3,
      });

      // Get stored credentials after successful biometric verification
      const credentials = await biometric.getCredentials({
        server: CREDENTIALS_SERVER,
      });

      if (!credentials?.username || !credentials?.password) {
        return {
          success: false,
          error: 'No stored credentials found. Sign in with password first.',
          code: 'NO_CREDENTIALS',
        };
      }

      // Parse the stored credential data
      try {
        const parsed = JSON.parse(credentials.password);
        return {
          success: true,
          credentials: {
            memberId: parsed.memberId,
            username: credentials.username,
            sessionToken: parsed.sessionToken,
            name: parsed.name,
            preferredName: parsed.preferredName,
          },
        };
      } catch {
        // Legacy format - password is the memberId
        return {
          success: true,
          credentials: {
            memberId: credentials.password,
            username: credentials.username,
          },
        };
      }
    } catch (error) {
      console.error('[NativeBiometry] Authentication failed:', error);

      // Handle specific error cases
      const errMsg = error instanceof Error ? error.message : String(error);

      if (errMsg.includes('cancel') || errMsg.includes('Cancel')) {
        return {
          success: false,
          error: 'Authentication cancelled',
          code: 'USER_CANCELLED',
        };
      }

      if (errMsg.includes('lockout') || errMsg.includes('Lockout')) {
        return {
          success: false,
          error: 'Too many failed attempts. Use passcode to unlock.',
          code: 'LOCKOUT',
        };
      }

      if (errMsg.includes('not available') || errMsg.includes('Not Available')) {
        return {
          success: false,
          error: 'Biometric authentication not available',
          code: 'NOT_AVAILABLE',
        };
      }

      return {
        success: false,
        error: errMsg,
        code: 'BIOMETRY_FAILED',
      };
    }
  }

  /**
   * Delete stored credentials (for logout or re-enrollment)
   */
  async deleteCredentials(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const biometric = await getNativeBiometric();
      await biometric.deleteCredentials({
        server: CREDENTIALS_SERVER,
      });
      console.log('[NativeBiometry] Credentials deleted');
      return true;
    } catch (error) {
      console.error('[NativeBiometry] Failed to delete credentials:', error);
      return false;
    }
  }
}

export const nativeBiometry = new NativeBiometryService();
