/**
 * Biometric Authentication using WebAuthn
 * Supports Face ID, Touch ID, Windows Hello, Android biometrics
 *
 * Uses @simplewebauthn/browser for client-side credential handling
 * and connects to /api/auth/webauthn/* endpoints for server verification
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser';

export interface BiometricCredential {
  id: string;
  publicKey: string;
  counter: number;
  deviceName: string;
  deviceType: string;
  createdAt: string;
  lastUsedAt: string;
  revoked: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  credentialId?: string;
  error?: string;
  memberId?: string;
  member?: {
    id: string;
    username: string;
    name: string;
    preferredName: string;
    onboarded: boolean;
    onboardingStep: string;
    hasWebauthn: boolean;
    preferredAuthMethod: string;
  };
  session?: {
    expiresAt: string;
  };
}

export interface BiometricAvailability {
  available: boolean;
  platformAvailable: boolean;
  autofillSupported: boolean;
}

class BiometricAuthService {
  private challengeKey: string | null = null;

  /**
   * Check if biometric authentication is available on this device
   */
  async isAvailable(): Promise<boolean> {
    if (!browserSupportsWebAuthn()) {
      return false;
    }

    try {
      return await platformAuthenticatorIsAvailable();
    } catch (error) {
      console.error('[BiometricAuth] Availability check failed:', error);
      return false;
    }
  }

  /**
   * Get detailed availability information
   */
  async getAvailability(): Promise<BiometricAvailability> {
    const basic = browserSupportsWebAuthn();

    if (!basic) {
      return {
        available: false,
        platformAvailable: false,
        autofillSupported: false
      };
    }

    const [platformAvailable, autofillSupported] = await Promise.all([
      platformAuthenticatorIsAvailable().catch(() => false),
      browserSupportsWebAuthnAutofill().catch(() => false)
    ]);

    return {
      available: basic,
      platformAvailable,
      autofillSupported
    };
  }

  /**
   * Get device type and name for display
   */
  getDeviceInfo(): { type: string; name: string } {
    const ua = navigator.userAgent;

    if (/iPhone/.test(ua)) {
      return { type: 'iphone', name: 'iPhone (Face ID / Touch ID)' };
    } else if (/iPad/.test(ua)) {
      return { type: 'ipad', name: 'iPad (Face ID / Touch ID)' };
    } else if (/Android/.test(ua)) {
      const match = ua.match(/Android.*?;\s*([^;)]+)/);
      const model = match ? match[1].trim() : 'Android Device';
      return { type: 'android', name: model };
    } else if (/Macintosh/.test(ua)) {
      return { type: 'mac', name: 'Mac (Touch ID)' };
    } else if (/Windows/.test(ua)) {
      return { type: 'windows', name: 'Windows (Hello)' };
    } else if (/Linux/.test(ua)) {
      return { type: 'linux', name: 'Linux Device' };
    }

    return { type: 'unknown', name: 'Unknown Device' };
  }

  /**
   * Get friendly biometric name based on device
   */
  getBiometricName(): string {
    const deviceInfo = this.getDeviceInfo();

    switch (deviceInfo.type) {
      case 'iphone':
      case 'ipad':
      case 'mac':
        return 'Face ID or Touch ID';
      case 'android':
        return 'Fingerprint or Face';
      case 'windows':
        return 'Windows Hello';
      default:
        return 'Biometric';
    }
  }

  /**
   * Register biometric credentials for the current authenticated user
   * Requires an active session (user must be signed in)
   */
  async register(deviceName?: string): Promise<BiometricAuthResult> {
    try {
      // Check availability
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device'
        };
      }

      // Get registration options from server (requires session)
      const optionsResponse = await fetch('/api/auth/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get registration options');
      }

      const options = await optionsResponse.json() as PublicKeyCredentialCreationOptionsJSON;

      // Start registration with WebAuthn
      const registrationResponse = await startRegistration({ optionsJSON: options });

      // Use provided device name or generate one
      const finalDeviceName = deviceName || this.getDeviceInfo().name;

      // Verify registration with server
      const verifyResponse = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          response: registrationResponse,
          deviceName: finalDeviceName
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to verify registration');
      }

      const result = await verifyResponse.json();

      return {
        success: true,
        credentialId: result.credentialId
      };

    } catch (error) {
      console.error('[BiometricAuth] Registration error:', error);

      // Handle specific WebAuthn errors
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          return {
            success: false,
            error: 'Registration was cancelled or not allowed'
          };
        }
        if (error.name === 'InvalidStateError') {
          return {
            success: false,
            error: 'This device already has a passkey registered'
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Authenticate using biometric credentials
   * Returns member info and creates session on success
   */
  async authenticate(username?: string): Promise<BiometricAuthResult> {
    try {
      // Check availability
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication not available'
        };
      }

      // Get authentication options from server
      const optionsResponse = await fetch('/api/auth/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get authentication options');
      }

      const optionsData = await optionsResponse.json();
      const { challengeKey, ...options } = optionsData;

      // Store challenge key for verification
      this.challengeKey = challengeKey;

      // Start authentication with WebAuthn
      const authResponse = await startAuthentication({
        optionsJSON: options as PublicKeyCredentialRequestOptionsJSON
      });

      // Verify authentication with server
      const verifyResponse = await fetch('/api/auth/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          response: authResponse,
          challengeKey: this.challengeKey
        })
      });

      this.challengeKey = null;

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication failed');
      }

      const result = await verifyResponse.json();

      return {
        success: true,
        credentialId: authResponse.id,
        memberId: result.member?.id,
        member: result.member,
        session: result.session
      };

    } catch (error) {
      console.error('[BiometricAuth] Authentication error:', error);

      // Handle specific WebAuthn errors
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          return {
            success: false,
            error: 'Authentication was cancelled or not allowed'
          };
        }
        if (error.name === 'NotFoundError') {
          return {
            success: false,
            error: 'No matching passkey found on this device'
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Check if a user has biometric credentials registered
   */
  async hasCredentials(username: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      // If discoverable is false, it means we found credentials for this user
      return !data.discoverable;
    } catch (error) {
      console.error('[BiometricAuth] Check credentials error:', error);
      return false;
    }
  }

  /**
   * Get list of registered passkeys for current user
   */
  async getRegisteredCredentials(): Promise<BiometricCredential[]> {
    try {
      const response = await fetch('/api/auth/passkeys', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.credentials || [];
    } catch (error) {
      console.error('[BiometricAuth] Get credentials error:', error);
      return [];
    }
  }

  /**
   * Revoke (delete) a registered passkey
   */
  async revokeCredential(credentialId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/passkeys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credentialId })
      });

      return response.ok;
    } catch (error) {
      console.error('[BiometricAuth] Revoke credential error:', error);
      return false;
    }
  }
}

export const biometricAuth = new BiometricAuthService();
