/**
 * Biometric Authentication using WebAuthn
 * Supports Face ID, Touch ID, Windows Hello, Android biometrics
 */

export interface BiometricCredential {
  id: string;
  publicKey: string;
  counter: number;
  deviceName: string;
  createdAt: string;
  lastUsed: string;
}

export interface BiometricAuthResult {
  success: boolean;
  credentialId?: string;
  error?: string;
  userId?: string;
}

class BiometricAuthService {
  /**
   * Check if biometric authentication is available on this device
   */
  async isAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      return false;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  /**
   * Get device type and name for display
   */
  private getDeviceInfo(): { type: string; name: string } {
    const ua = navigator.userAgent;

    if (/iPhone|iPad|iPod/.test(ua)) {
      return { type: 'ios', name: 'iPhone/iPad' };
    } else if (/Android/.test(ua)) {
      return { type: 'android', name: 'Android Device' };
    } else if (/Macintosh/.test(ua)) {
      return { type: 'macos', name: 'Mac' };
    } else if (/Windows/.test(ua)) {
      return { type: 'windows', name: 'Windows PC' };
    }

    return { type: 'unknown', name: 'Unknown Device' };
  }

  /**
   * Register biometric credentials for a user
   */
  async register(userId: string, userName: string, userEmail: string): Promise<BiometricAuthResult> {
    try {
      // Check availability
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device'
        };
      }

      // Get registration challenge from server
      const challengeResponse = await fetch('/api/auth/biometric/register-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, userEmail })
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to get registration challenge');
      }

      const { challenge, user } = await challengeResponse.json();

      // Convert challenge from base64
      const challengeBuffer = this.base64ToBuffer(challenge);

      // Create credentials
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: {
            name: 'Soullab',
            id: window.location.hostname
          },
          user: {
            id: this.stringToBuffer(user.id),
            name: user.email,
            displayName: user.name
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'none'
        }
      }) as PublicKeyCredential;

      if (!credential) {
        return {
          success: false,
          error: 'Credential creation cancelled'
        };
      }

      // Get device info
      const deviceInfo = this.getDeviceInfo();

      // Send credential to server
      const verifyResponse = await fetch('/api/auth/biometric/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          credentialId: credential.id,
          response: {
            clientDataJSON: this.bufferToBase64((credential.response as AuthenticatorAttestationResponse).clientDataJSON),
            attestationObject: this.bufferToBase64((credential.response as AuthenticatorAttestationResponse).attestationObject)
          },
          deviceType: deviceInfo.type,
          deviceName: deviceInfo.name
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify registration');
      }

      return {
        success: true,
        credentialId: credential.id,
        userId
      };

    } catch (error) {
      console.error('Biometric registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Authenticate using biometric credentials
   */
  async authenticate(email?: string): Promise<BiometricAuthResult> {
    try {
      // Check availability
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication not available'
        };
      }

      // Get authentication challenge from server
      const challengeResponse = await fetch('/api/auth/biometric/auth-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to get authentication challenge');
      }

      const { challenge, allowCredentials } = await challengeResponse.json();

      // Convert challenge from base64
      const challengeBuffer = this.base64ToBuffer(challenge);

      // Get credentials
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          allowCredentials: allowCredentials?.map((cred: any) => ({
            id: this.base64ToBuffer(cred.id),
            type: 'public-key'
          })) || [],
          userVerification: 'required',
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (!assertion) {
        return {
          success: false,
          error: 'Authentication cancelled'
        };
      }

      // Verify with server
      const verifyResponse = await fetch('/api/auth/biometric/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: assertion.id,
          response: {
            clientDataJSON: this.bufferToBase64((assertion.response as AuthenticatorAssertionResponse).clientDataJSON),
            authenticatorData: this.bufferToBase64((assertion.response as AuthenticatorAssertionResponse).authenticatorData),
            signature: this.bufferToBase64((assertion.response as AuthenticatorAssertionResponse).signature),
            userHandle: (assertion.response as AuthenticatorAssertionResponse).userHandle
              ? this.bufferToBase64((assertion.response as AuthenticatorAssertionResponse).userHandle!)
              : null
          }
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Authentication verification failed');
      }

      const { userId, sessionToken } = await verifyResponse.json();

      // Store session token
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('user_id', userId);

      return {
        success: true,
        credentialId: assertion.id,
        userId
      };

    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Check if user has biometric credentials registered
   */
  async hasCredentials(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/biometric/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        return false;
      }

      const { hasCredentials } = await response.json();
      return hasCredentials;
    } catch (error) {
      console.error('Check credentials error:', error);
      return false;
    }
  }

  /**
   * Helper: Convert base64 to ArrayBuffer
   */
  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Helper: Convert ArrayBuffer to base64
   */
  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Helper: Convert string to ArrayBuffer
   */
  private stringToBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }
}

export const biometricAuth = new BiometricAuthService();