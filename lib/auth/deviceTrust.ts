/**
 * Device Trust & Fingerprinting
 * Tracks trusted devices and creates device fingerprints
 */

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  platform: string;
  vendor: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  hardwareConcurrency: number;
  deviceMemory?: number;
  hash: string;
}

export interface TrustedDevice {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceType: string;
  location?: string;
  ipAddress?: string;
  trusted: boolean;
  lastSeen: string;
  createdAt: string;
  expiresAt: string;
}

class DeviceTrustService {
  /**
   * Generate device fingerprint
   */
  async generateFingerprint(): Promise<DeviceFingerprint> {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');

    const fingerprint = {
      id: crypto.randomUUID(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      hash: ''
    };

    // Create hash from all properties
    const fingerprintString = JSON.stringify(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprintString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    fingerprint.hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return fingerprint;
  }

  /**
   * Check if current device is trusted
   */
  async isTrustedDevice(userId: string): Promise<boolean> {
    try {
      const fingerprint = await this.generateFingerprint();
      const storedDeviceId = localStorage.getItem('device_id');

      const response = await fetch('/api/auth/device/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          deviceId: storedDeviceId,
          fingerprint: fingerprint.hash
        })
      });

      if (!response.ok) {
        return false;
      }

      const { trusted } = await response.json();
      return trusted;
    } catch (error) {
      console.error('Device trust check error:', error);
      return false;
    }
  }

  /**
   * Trust current device
   */
  async trustDevice(userId: string, deviceName?: string): Promise<{ success: boolean; deviceId?: string }> {
    try {
      const fingerprint = await this.generateFingerprint();
      const deviceInfo = this.getDeviceInfo();

      const response = await fetch('/api/auth/device/trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fingerprint: fingerprint.hash,
          deviceName: deviceName || deviceInfo.name,
          deviceType: deviceInfo.type,
          fullFingerprint: fingerprint
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trust device');
      }

      const { deviceId } = await response.json();

      // Store device ID locally
      localStorage.setItem('device_id', deviceId);

      return { success: true, deviceId };
    } catch (error) {
      console.error('Device trust error:', error);
      return { success: false };
    }
  }

  /**
   * Revoke device trust
   */
  async revokeDevice(deviceId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/device/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      if (!response.ok) {
        throw new Error('Failed to revoke device');
      }

      // Clear local storage if this is the current device
      if (localStorage.getItem('device_id') === deviceId) {
        localStorage.removeItem('device_id');
        localStorage.removeItem('session_token');
      }

      return true;
    } catch (error) {
      console.error('Device revoke error:', error);
      return false;
    }
  }

  /**
   * Get list of trusted devices for a user
   */
  async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    try {
      const response = await fetch(`/api/auth/device/list?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to get devices');
      }

      const { devices } = await response.json();
      return devices;
    } catch (error) {
      console.error('Get devices error:', error);
      return [];
    }
  }

  /**
   * Get device info for display
   */
  private getDeviceInfo(): { type: string; name: string; icon: string } {
    const ua = navigator.userAgent;

    if (/iPhone/.test(ua)) {
      return { type: 'iphone', name: 'iPhone', icon: '📱' };
    } else if (/iPad/.test(ua)) {
      return { type: 'ipad', name: 'iPad', icon: '📱' };
    } else if (/Android/.test(ua)) {
      if (/Mobile/.test(ua)) {
        return { type: 'android-phone', name: 'Android Phone', icon: '📱' };
      }
      return { type: 'android-tablet', name: 'Android Tablet', icon: '📱' };
    } else if (/Macintosh/.test(ua)) {
      return { type: 'mac', name: 'Mac', icon: '💻' };
    } else if (/Windows/.test(ua)) {
      return { type: 'windows', name: 'Windows PC', icon: '💻' };
    } else if (/Linux/.test(ua)) {
      return { type: 'linux', name: 'Linux', icon: '💻' };
    }

    return { type: 'unknown', name: 'Unknown Device', icon: '🔧' };
  }

  /**
   * Get current device ID
   */
  getCurrentDeviceId(): string | null {
    return localStorage.getItem('device_id');
  }
}

export const deviceTrust = new DeviceTrustService();