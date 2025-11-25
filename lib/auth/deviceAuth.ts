/**
 * Device Authentication Service
 * Handles "Remember Me" functionality with secure device storage
 */

interface DeviceAuthData {
  userId: string;
  email: string;
  deviceFingerprint: string;
  lastAccess: string;
  rememberUntil: string;
}

export class DeviceAuthService {
  private static STORAGE_KEY = 'maia_device_auth';
  private static REMEMBER_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Generate a basic device fingerprint
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas.toDataURL()
    ].join('|');

    return btoa(fingerprint).slice(0, 32);
  }

  /**
   * Save device authentication data
   */
  saveDeviceAuth(userId: string, email: string): void {
    try {
      const deviceAuth: DeviceAuthData = {
        userId,
        email,
        deviceFingerprint: this.generateDeviceFingerprint(),
        lastAccess: new Date().toISOString(),
        rememberUntil: new Date(Date.now() + DeviceAuthService.REMEMBER_DURATION).toISOString()
      };

      localStorage.setItem(DeviceAuthService.STORAGE_KEY, JSON.stringify(deviceAuth));
      console.log('Device auth saved for consciousness keeper:', email);
    } catch (error) {
      console.warn('Failed to save device auth:', error);
    }
  }

  /**
   * Get saved device authentication data
   */
  getDeviceAuth(): DeviceAuthData | null {
    try {
      const stored = localStorage.getItem(DeviceAuthService.STORAGE_KEY);
      if (!stored) return null;

      const deviceAuth: DeviceAuthData = JSON.parse(stored);

      // Check if remember period has expired
      if (new Date() > new Date(deviceAuth.rememberUntil)) {
        this.clearDeviceAuth();
        return null;
      }

      // Verify device fingerprint matches (basic security)
      const currentFingerprint = this.generateDeviceFingerprint();
      if (deviceAuth.deviceFingerprint !== currentFingerprint) {
        console.warn('Device fingerprint mismatch - clearing stored auth');
        this.clearDeviceAuth();
        return null;
      }

      // Update last access time
      deviceAuth.lastAccess = new Date().toISOString();
      localStorage.setItem(DeviceAuthService.STORAGE_KEY, JSON.stringify(deviceAuth));

      return deviceAuth;
    } catch (error) {
      console.warn('Failed to get device auth:', error);
      return null;
    }
  }

  /**
   * Clear device authentication data
   */
  clearDeviceAuth(): void {
    try {
      localStorage.removeItem(DeviceAuthService.STORAGE_KEY);
      console.log('Device auth cleared');
    } catch (error) {
      console.warn('Failed to clear device auth:', error);
    }
  }

  /**
   * Check if user should be auto-signed in
   */
  shouldAutoSignIn(): { email: string; userId: string } | null {
    const deviceAuth = this.getDeviceAuth();
    if (!deviceAuth) return null;

    return {
      email: deviceAuth.email,
      userId: deviceAuth.userId
    };
  }

  /**
   * Update device auth with extended remember period
   */
  extendRememberPeriod(email: string): void {
    const deviceAuth = this.getDeviceAuth();
    if (deviceAuth && deviceAuth.email === email) {
      deviceAuth.rememberUntil = new Date(Date.now() + DeviceAuthService.REMEMBER_DURATION).toISOString();
      localStorage.setItem(DeviceAuthService.STORAGE_KEY, JSON.stringify(deviceAuth));
    }
  }

  /**
   * Get days remaining until device auth expires
   */
  getDaysUntilExpiry(): number | null {
    const deviceAuth = this.getDeviceAuth();
    if (!deviceAuth) return null;

    const expiry = new Date(deviceAuth.rememberUntil);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
}

export const deviceAuthService = new DeviceAuthService();