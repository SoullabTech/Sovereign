/**
 * Device Trust & Fingerprinting
 * Tracks trusted devices and creates device fingerprints
 *
 * Connects to /api/auth/device/* endpoints for server-side trust management
 */

import { generateUUID } from '@/lib/utils/uuid';

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
  memberId: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceType: string;
  trustLevel: 'standard' | 'high' | 'temporary';
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface DeviceTrustResult {
  success: boolean;
  deviceId?: string;
  error?: string;
}

class DeviceTrustService {
  private fingerprintCache: DeviceFingerprint | null = null;

  /**
   * Generate device fingerprint
   * Uses browser APIs to create a unique device identifier
   */
  async generateFingerprint(): Promise<DeviceFingerprint> {
    // Return cached fingerprint if available (fingerprint doesn't change during session)
    if (this.fingerprintCache) {
      return this.fingerprintCache;
    }

    const fingerprint = {
      id: generateUUID(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      hash: ''
    };

    // Create hash from all properties (excluding hash itself)
    const dataToHash = {
      userAgent: fingerprint.userAgent,
      platform: fingerprint.platform,
      vendor: fingerprint.vendor,
      language: fingerprint.language,
      timezone: fingerprint.timezone,
      screenResolution: fingerprint.screenResolution,
      colorDepth: fingerprint.colorDepth,
      hardwareConcurrency: fingerprint.hardwareConcurrency,
      deviceMemory: fingerprint.deviceMemory
    };

    const fingerprintString = JSON.stringify(dataToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprintString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    fingerprint.hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    this.fingerprintCache = fingerprint;
    return fingerprint;
  }

  /**
   * Check if current device is trusted
   * Requires authenticated session
   */
  async isTrustedDevice(): Promise<boolean> {
    try {
      const devices = await this.getTrustedDevices();
      const currentFingerprint = await this.generateFingerprint();

      // Check if any trusted device matches current fingerprint
      return devices.some(device =>
        device.deviceFingerprint === currentFingerprint.hash &&
        new Date(device.expiresAt) > new Date()
      );
    } catch (error) {
      console.error('[DeviceTrust] Check failed:', error);
      return false;
    }
  }

  /**
   * Trust current device
   * Requires authenticated session
   */
  async trustDevice(
    deviceName?: string,
    trustLevel: 'standard' | 'high' | 'temporary' = 'standard'
  ): Promise<DeviceTrustResult> {
    try {
      const fingerprint = await this.generateFingerprint();
      const deviceInfo = this.getDeviceInfo();

      const response = await fetch('/api/auth/device/trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fingerprint: fingerprint.hash,
          deviceName: deviceName || deviceInfo.name,
          deviceType: deviceInfo.type,
          trustLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to trust device');
      }

      const { deviceId } = await response.json();

      // Store device ID locally for quick reference
      localStorage.setItem('device_id', deviceId);

      return { success: true, deviceId };
    } catch (error) {
      console.error('[DeviceTrust] Trust error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trust device'
      };
    }
  }

  /**
   * Revoke device trust
   * Requires authenticated session
   */
  async revokeDevice(deviceId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/device/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deviceId })
      });

      if (!response.ok) {
        throw new Error('Failed to revoke device');
      }

      // Clear local storage if this is the current device
      if (localStorage.getItem('device_id') === deviceId) {
        localStorage.removeItem('device_id');
      }

      return true;
    } catch (error) {
      console.error('[DeviceTrust] Revoke error:', error);
      return false;
    }
  }

  /**
   * Get list of trusted devices for current user
   * Requires authenticated session
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    try {
      const response = await fetch('/api/auth/device/list', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get devices');
      }

      const { devices } = await response.json();
      return devices || [];
    } catch (error) {
      console.error('[DeviceTrust] Get devices error:', error);
      return [];
    }
  }

  /**
   * Get device info for display
   */
  getDeviceInfo(): { type: string; name: string; icon: string } {
    const ua = navigator.userAgent;

    if (/iPhone/.test(ua)) {
      return { type: 'iphone', name: 'iPhone', icon: '📱' };
    } else if (/iPad/.test(ua)) {
      return { type: 'ipad', name: 'iPad', icon: '📱' };
    } else if (/Android/.test(ua)) {
      // Try to get device model
      const match = ua.match(/Android.*?;\s*([^;)]+)/);
      const model = match ? match[1].trim() : null;

      if (/Mobile/.test(ua)) {
        return { type: 'android-phone', name: model || 'Android Phone', icon: '📱' };
      }
      return { type: 'android-tablet', name: model || 'Android Tablet', icon: '📱' };
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
   * Get current device ID from local storage
   */
  getCurrentDeviceId(): string | null {
    return localStorage.getItem('device_id');
  }

  /**
   * Check if this is likely the same device based on fingerprint
   * Useful for detecting when a user returns on a trusted device
   */
  async isKnownDevice(): Promise<boolean> {
    const storedId = this.getCurrentDeviceId();
    if (!storedId) {
      return false;
    }

    try {
      const devices = await this.getTrustedDevices();
      return devices.some(d => d.id === storedId);
    } catch {
      return false;
    }
  }

  /**
   * Clear cached fingerprint (useful for testing)
   */
  clearCache(): void {
    this.fingerprintCache = null;
  }
}

export const deviceTrust = new DeviceTrustService();
