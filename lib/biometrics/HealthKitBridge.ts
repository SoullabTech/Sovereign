/**
 * HealthKit Bridge for Native iOS App
 *
 * Provides real-time streaming of HealthKit data to MAIA
 * Only works in Capacitor iOS app (not web)
 */

import { Capacitor } from '@capacitor/core';
import { realtimeBiometricService } from './RealtimeBiometricService';

// Type definitions for capacitor-healthkit plugin
declare const HealthKit: any;

export interface HealthKitPermissions {
  read: string[];
  write: string[];
}

export class HealthKitBridge {
  private isAvailable = false;
  private isStreaming = false;
  private streamInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Check if running in native iOS app
    this.isAvailable = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }

  /**
   * Check if HealthKit is available
   */
  async checkAvailability(): Promise<boolean> {
    if (!this.isAvailable) {
      console.log('⚠️ HealthKit only available in native iOS app');
      return false;
    }

    try {
      // Check if HealthKit plugin is loaded
      if (typeof HealthKit !== 'undefined') {
        const available = await HealthKit.isAvailable();
        return available.available;
      }
      return false;
    } catch (error) {
      console.error('❌ HealthKit availability check failed:', error);
      return false;
    }
  }

  /**
   * Request HealthKit permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isAvailable) {
      console.log('⚠️ Not in native app, skipping HealthKit permissions');
      return false;
    }

    try {
      console.log('🔐 Requesting HealthKit permissions...');

      const permissions: HealthKitPermissions = {
        read: [
          'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
          'HKQuantityTypeIdentifierHeartRate',
          'HKQuantityTypeIdentifierRespiratoryRate',
          'HKQuantityTypeIdentifierRestingHeartRate'
        ],
        write: [] // We don't need to write data
      };

      await HealthKit.requestAuthorization(permissions);
      console.log('✅ HealthKit permissions granted');
      return true;

    } catch (error) {
      console.error('❌ HealthKit permission request failed:', error);
      return false;
    }
  }

  /**
   * Start live streaming of HealthKit data
   */
  async startLiveStreaming(intervalMs: number = 5000): Promise<void> {
    if (!this.isAvailable) {
      console.log('⚠️ HealthKit not available, cannot start streaming');
      return;
    }

    if (this.isStreaming) {
      console.log('⚠️ Already streaming HealthKit data');
      return;
    }

    // Request permissions first
    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      console.error('❌ Cannot stream without permissions');
      return;
    }

    console.log('🚀 Starting HealthKit live streaming');
    this.isStreaming = true;

    // Initial read
    await this.readAndBroadcast();

    // Poll for updates
    this.streamInterval = setInterval(async () => {
      await this.readAndBroadcast();
    }, intervalMs);
  }

  /**
   * Stop live streaming
   */
  stopLiveStreaming(): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
    this.isStreaming = false;
    console.log('🛑 Stopped HealthKit live streaming');
  }

  /**
   * Read latest HealthKit data and broadcast to biometric service
   */
  private async readAndBroadcast(): Promise<void> {
    try {
      // Get HRV (most important for coherence)
      const hrvData = await this.queryHealthData('HKQuantityTypeIdentifierHeartRateVariabilitySDNN', 1);

      // Get Heart Rate
      const hrData = await this.queryHealthData('HKQuantityTypeIdentifierHeartRate', 1);

      // Get Respiratory Rate (if available)
      const respData = await this.queryHealthData('HKQuantityTypeIdentifierRespiratoryRate', 1);

      // Extract values
      const hrv = hrvData.length > 0 ? hrvData[0].quantity : undefined;
      const heartRate = hrData.length > 0 ? hrData[0].quantity : undefined;
      const respiratoryRate = respData.length > 0 ? respData[0].quantity : undefined;

      // Only inject if we have new data
      if (hrv !== undefined || heartRate !== undefined) {
        console.log('💓 HealthKit update:', {
          hrv: hrv ? `${hrv.toFixed(1)}ms` : 'N/A',
          heartRate: heartRate ? `${heartRate.toFixed(0)} BPM` : 'N/A',
          respiratoryRate: respiratoryRate ? `${respiratoryRate.toFixed(0)} breaths/min` : 'N/A'
        });

        // Inject into realtime biometric service
        await realtimeBiometricService.injectUpdate({
          hrv,
          heartRate,
          respiratoryRate
        });
      }

    } catch (error) {
      console.error('❌ Error reading HealthKit data:', error);
    }
  }

  /**
   * Query HealthKit for specific data type
   */
  private async queryHealthData(sampleType: string, limit: number): Promise<any[]> {
    try {
      const result = await HealthKit.queryHKitSampleType({
        sampleType,
        limit,
        ascending: false // Most recent first
      });

      return result.resultData || [];
    } catch (error) {
      console.error(`❌ Failed to query ${sampleType}:`, error);
      return [];
    }
  }

  /**
   * Get most recent HRV reading
   */
  async getMostRecentHRV(): Promise<number | null> {
    if (!this.isAvailable) return null;

    try {
      const data = await this.queryHealthData('HKQuantityTypeIdentifierHeartRateVariabilitySDNN', 1);
      return data.length > 0 ? data[0].quantity : null;
    } catch (error) {
      console.error('❌ Failed to get HRV:', error);
      return null;
    }
  }

  /**
   * Get most recent heart rate
   */
  async getMostRecentHeartRate(): Promise<number | null> {
    if (!this.isAvailable) return null;

    try {
      const data = await this.queryHealthData('HKQuantityTypeIdentifierHeartRate', 1);
      return data.length > 0 ? data[0].quantity : null;
    } catch (error) {
      console.error('❌ Failed to get heart rate:', error);
      return null;
    }
  }

  /**
   * Check if currently streaming
   */
  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }
}

// Singleton instance
export const healthKitBridge = new HealthKitBridge();
