/**
 * Health Data Importer
 *
 * Imports Apple Health export data (XML format) into MAIA
 *
 * User workflow:
 * 1. iPhone Health app → Profile → Export All Health Data
 * 2. Extracts zip file → upload.xml to MAIA
 * 3. We parse HRV, heart rate, sleep, respiratory rate
 * 4. Store locally (IndexedDB) for privacy
 * 5. Use during sessions for coherence detection
 */

export interface HealthRecord {
  type: string;
  value: string;
  unit: string;
  sourceName: string;
  sourceVersion?: string;
  device?: string;
  creationDate: Date;
  startDate: Date;
  endDate: Date;
  metadata?: Record<string, any>;
}

export interface HRVReading {
  value: number; // RMSSD in milliseconds
  startDate: Date;
  endDate: Date;
  sourceName: string; // e.g., "Kelly's Apple Watch"
}

export interface HeartRateReading {
  value: number; // BPM
  startDate: Date;
  endDate: Date;
  context?: 'resting' | 'active' | 'workout' | 'recovery';
}

export interface SleepSession {
  startDate: Date;
  endDate: Date;
  durationHours: number;
  stages?: {
    rem?: number;
    core?: number;
    deep?: number;
    awake?: number;
  };
}

export interface RespiratoryReading {
  value: number; // Breaths per minute
  startDate: Date;
  endDate: Date;
}

export interface ParsedHealthData {
  hrv: HRVReading[];
  heartRate: HeartRateReading[];
  sleep: SleepSession[];
  respiratory: RespiratoryReading[];
  rawRecords: HealthRecord[];
}

/**
 * Parse Apple Health export XML
 *
 * Apple Health exports as XML with structure:
 * <HealthData>
 *   <Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"
 *           value="45.2"
 *           unit="ms"
 *           sourceName="Apple Watch"
 *           startDate="2025-01-15 08:30:00 -0800"
 *           endDate="2025-01-15 08:30:00 -0800" />
 *   ...
 * </HealthData>
 */
export class HealthDataImporter {
  /**
   * Parse Apple Health XML export
   * Optimized for large files - only extracts relevant data types
   */
  async parseHealthXML(xmlContent: string): Promise<ParsedHealthData> {
    console.log('📊 File size:', (xmlContent.length / (1024 * 1024)).toFixed(2), 'MB');
    console.log('🚀 Using optimized regex-based extraction (skipping full XML parse)');

    // For massive files, don't parse the entire XML - use regex to extract only what we need
    const hrv = this.extractHRVFast(xmlContent);
    const heartRate = this.extractHeartRateFast(xmlContent);
    const sleep = this.extractSleepFast(xmlContent);
    const respiratory = this.extractRespiratoryFast(xmlContent);

    console.log(`💓 Extracted metrics:`, {
      hrv: hrv.length,
      heartRate: heartRate.length,
      sleep: sleep.length,
      respiratory: respiratory.length
    });

    // Return parsed data without storing all raw records
    return {
      hrv,
      heartRate,
      sleep,
      respiratory,
      rawRecords: [] // Don't store raw records to save memory
    };
  }

  /**
   * Fast HRV extraction using regex (doesn't parse full XML)
   */
  private extractHRVFast(xmlContent: string): HRVReading[] {
    // Match HRV records - attribute order doesn't matter
    const hrvPattern = /<Record\s+type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"[^>]*>/g;

    const readings: HRVReading[] = [];
    let match;
    let count = 0;
    const MAX_READINGS = 1000; // Limit to most recent 1000 readings

    while ((match = hrvPattern.exec(xmlContent)) !== null && count < MAX_READINGS) {
      const recordStr = match[0];

      // Extract attributes from the matched record
      const valueMatch = recordStr.match(/value="([^"]+)"/);
      const sourceMatch = recordStr.match(/sourceName="([^"]+)"/);
      const startMatch = recordStr.match(/startDate="([^"]+)"/);
      const endMatch = recordStr.match(/endDate="([^"]+)"/);

      if (valueMatch && startMatch && endMatch) {
        const value = parseFloat(valueMatch[1]);
        const sourceName = sourceMatch ? sourceMatch[1] : 'Unknown';
        const startDate = new Date(startMatch[1]);
        const endDate = new Date(endMatch[1]);

        if (!isNaN(value)) {
          readings.push({ value, sourceName, startDate, endDate });
          count++;
        }
      }
    }

    console.log(`💓 Extracted ${readings.length} HRV readings`);

    // Sort by most recent first
    return readings.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Fast Heart Rate extraction using regex
   */
  private extractHeartRateFast(xmlContent: string): HeartRateReading[] {
    const hrPattern = /<Record\s+type="HKQuantityTypeIdentifierHeartRate"[^>]*value="([^"]+)"[^>]*startDate="([^"]+)"[^>]*endDate="([^"]+)"[^>]*>/g;

    const readings: HeartRateReading[] = [];
    let match;
    let count = 0;
    const MAX_READINGS = 1000;

    while ((match = hrPattern.exec(xmlContent)) !== null && count < MAX_READINGS) {
      const value = parseFloat(match[1]);
      const startDate = new Date(match[2]);
      const endDate = new Date(match[3]);

      if (!isNaN(value)) {
        readings.push({ value, startDate, endDate });
        count++;
      }
    }

    return readings.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Fast Sleep extraction using regex
   */
  private extractSleepFast(xmlContent: string): SleepSession[] {
    const sleepPattern = /<Record\s+type="HKCategoryTypeIdentifierSleepAnalysis"[^>]*startDate="([^"]+)"[^>]*endDate="([^"]+)"[^>]*\/>/g;

    const sessions: SleepSession[] = [];
    let match;
    let count = 0;
    const MAX_SESSIONS = 100;

    while ((match = sleepPattern.exec(xmlContent)) !== null && count < MAX_SESSIONS) {
      const startDate = new Date(match[1]);
      const endDate = new Date(match[2]);
      const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

      sessions.push({ startDate, endDate, durationHours });
      count++;
    }

    return sessions.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Fast Respiratory Rate extraction using regex
   */
  private extractRespiratoryFast(xmlContent: string): RespiratoryReading[] {
    const respPattern = /<Record\s+type="HKQuantityTypeIdentifierRespiratoryRate"[^>]*value="([^"]+)"[^>]*startDate="([^"]+)"[^>]*endDate="([^"]+)"[^>]*\/>/g;

    const readings: RespiratoryReading[] = [];
    let match;
    let count = 0;
    const MAX_READINGS = 500;

    while ((match = respPattern.exec(xmlContent)) !== null && count < MAX_READINGS) {
      const value = parseFloat(match[1]);
      const startDate = new Date(match[2]);
      const endDate = new Date(match[3]);

      if (!isNaN(value)) {
        readings.push({ value, startDate, endDate });
        count++;
      }
    }

    return readings.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * OLD METHOD - kept for reference but not used
   * Parse entire XML (too slow for large files)
   */
  private async parseHealthXMLFull(xmlContent: string): Promise<ParsedHealthData> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    const records: HealthRecord[] = [];
    const recordElements = doc.querySelectorAll('Record');

    console.log(`📊 Found ${recordElements.length} health records in export`);

    if (recordElements.length === 0) {
      throw new Error('No health records found. Make sure you uploaded the complete export.xml file.');
    }

    // Track unique record types for debugging
    const recordTypes = new Set<string>();

    recordElements.forEach(record => {
      const type = record.getAttribute('type') || '';
      recordTypes.add(type);

      const value = record.getAttribute('value') || '';
      const unit = record.getAttribute('unit') || '';
      const sourceName = record.getAttribute('sourceName') || '';
      const sourceVersion = record.getAttribute('sourceVersion') || undefined;
      const device = record.getAttribute('device') || undefined;
      const creationDate = this.parseAppleDate(record.getAttribute('creationDate') || '');
      const startDate = this.parseAppleDate(record.getAttribute('startDate') || '');
      const endDate = this.parseAppleDate(record.getAttribute('endDate') || '');

      // Parse metadata (optional)
      const metadata: Record<string, any> = {};
      const metadataElements = record.querySelectorAll('MetadataEntry');
      metadataElements.forEach(meta => {
        const key = meta.getAttribute('key') || '';
        const metaValue = meta.getAttribute('value') || '';
        if (key) metadata[key] = metaValue;
      });

      records.push({
        type,
        value,
        unit,
        sourceName,
        sourceVersion,
        device,
        creationDate,
        startDate,
        endDate,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined
      });
    });

    console.log(`📋 Found ${recordTypes.size} unique record types:`, Array.from(recordTypes).slice(0, 10));

    // Extract specific metrics
    const hrv = this.extractHRV(records);
    const heartRate = this.extractHeartRate(records);
    const sleep = this.extractSleep(records);
    const respiratory = this.extractRespiratory(records);

    console.log(`💓 Extracted metrics:`, {
      hrv: hrv.length,
      heartRate: heartRate.length,
      sleep: sleep.length,
      respiratory: respiratory.length
    });

    return {
      hrv,
      heartRate,
      sleep,
      respiratory,
      rawRecords: records
    };
  }

  /**
   * Extract HRV readings
   * Apple Health uses "HKQuantityTypeIdentifierHeartRateVariabilitySDNN"
   */
  private extractHRV(records: HealthRecord[]): HRVReading[] {
    return records
      .filter(r => r.type === 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN')
      .map(r => ({
        value: parseFloat(r.value),
        startDate: r.startDate,
        endDate: r.endDate,
        sourceName: r.sourceName
      }))
      .filter(r => !isNaN(r.value))
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // Most recent first
  }

  /**
   * Extract heart rate readings
   */
  private extractHeartRate(records: HealthRecord[]): HeartRateReading[] {
    return records
      .filter(r => r.type === 'HKQuantityTypeIdentifierHeartRate')
      .map(r => {
        // Determine context from metadata
        let context: 'resting' | 'active' | 'workout' | 'recovery' | undefined;
        if (r.metadata?.['HKMetadataKeyHeartRateMotionContext'] === 'HKHeartRateMotionContextNotSet') {
          context = 'resting';
        }

        return {
          value: parseFloat(r.value),
          startDate: r.startDate,
          endDate: r.endDate,
          context
        };
      })
      .filter(r => !isNaN(r.value))
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Extract sleep sessions
   */
  private extractSleep(records: HealthRecord[]): SleepSession[] {
    const sleepRecords = records.filter(r =>
      r.type === 'HKCategoryTypeIdentifierSleepAnalysis'
    );

    // Group by night (sessions within 12 hours of each other)
    const sessions: SleepSession[] = [];
    let currentSession: SleepSession | null = null;

    sleepRecords.forEach(record => {
      const duration = (record.endDate.getTime() - record.startDate.getTime()) / (1000 * 60 * 60);

      if (!currentSession ||
          (record.startDate.getTime() - currentSession.endDate.getTime()) > 12 * 60 * 60 * 1000) {
        // New session
        currentSession = {
          startDate: record.startDate,
          endDate: record.endDate,
          durationHours: duration,
          stages: {}
        };
        sessions.push(currentSession);
      } else {
        // Extend current session
        currentSession.endDate = record.endDate;
        currentSession.durationHours += duration;
      }

      // Track sleep stages if available (watchOS 9+)
      const stageValue = record.value;
      if (stageValue === 'HKCategoryValueSleepAnalysisAsleepREM') {
        currentSession.stages!.rem = (currentSession.stages!.rem || 0) + duration;
      } else if (stageValue === 'HKCategoryValueSleepAnalysisAsleepCore') {
        currentSession.stages!.core = (currentSession.stages!.core || 0) + duration;
      } else if (stageValue === 'HKCategoryValueSleepAnalysisAsleepDeep') {
        currentSession.stages!.deep = (currentSession.stages!.deep || 0) + duration;
      } else if (stageValue === 'HKCategoryValueSleepAnalysisAwake') {
        currentSession.stages!.awake = (currentSession.stages!.awake || 0) + duration;
      }
    });

    return sessions.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Extract respiratory rate
   */
  private extractRespiratory(records: HealthRecord[]): RespiratoryReading[] {
    return records
      .filter(r => r.type === 'HKQuantityTypeIdentifierRespiratoryRate')
      .map(r => ({
        value: parseFloat(r.value),
        startDate: r.startDate,
        endDate: r.endDate
      }))
      .filter(r => !isNaN(r.value))
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Parse Apple Health date format
   * Example: "2025-01-15 08:30:00 -0800"
   */
  private parseAppleDate(dateString: string): Date {
    if (!dateString) return new Date();

    // Apple Health uses format: "YYYY-MM-DD HH:MM:SS ±HHMM"
    // JavaScript Date can parse this directly
    return new Date(dateString);
  }

  /**
   * Get most recent HRV reading
   */
  getMostRecentHRV(data: ParsedHealthData): HRVReading | null {
    return data.hrv[0] || null;
  }

  /**
   * Get HRV readings within time window
   */
  getHRVInWindow(
    data: ParsedHealthData,
    startTime: Date,
    endTime: Date
  ): HRVReading[] {
    return data.hrv.filter(
      r => r.startDate >= startTime && r.startDate <= endTime
    );
  }

  /**
   * Get average HRV for a time period
   */
  getAverageHRV(
    data: ParsedHealthData,
    startTime: Date,
    endTime: Date
  ): number | null {
    const readings = this.getHRVInWindow(data, startTime, endTime);
    if (readings.length === 0) return null;

    const sum = readings.reduce((acc, r) => acc + r.value, 0);
    return sum / readings.length;
  }

  /**
   * Get last night's sleep quality
   */
  getLastNightSleep(data: ParsedHealthData): SleepSession | null {
    return data.sleep[0] || null;
  }

  /**
   * Calculate readiness score (0-100)
   * Based on: HRV + sleep quality + resting heart rate
   */
  calculateReadiness(data: ParsedHealthData): number {
    const recentHRV = this.getMostRecentHRV(data);
    const lastSleep = this.getLastNightSleep(data);
    const recentHeartRate = data.heartRate.find(r => r.context === 'resting');

    let score = 50; // Baseline

    // HRV component (0-40 points)
    if (recentHRV) {
      if (recentHRV.value > 60) score += 40;
      else if (recentHRV.value > 40) score += 30;
      else if (recentHRV.value > 25) score += 20;
      else score += 10;
    }

    // Sleep component (0-30 points)
    if (lastSleep) {
      if (lastSleep.durationHours > 7) score += 20;
      else if (lastSleep.durationHours > 6) score += 15;
      else score += 5;

      // Bonus for deep sleep
      if (lastSleep.stages?.deep && lastSleep.stages.deep > 1.5) {
        score += 10;
      }
    }

    // Resting heart rate component (0-20 points)
    if (recentHeartRate) {
      if (recentHeartRate.value < 55) score += 20;
      else if (recentHeartRate.value < 65) score += 15;
      else if (recentHeartRate.value < 75) score += 10;
      else score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }
}

// Singleton instance
export const healthDataImporter = new HealthDataImporter();
