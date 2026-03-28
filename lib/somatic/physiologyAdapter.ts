/**
 * Physiology Adapter — Thin normalization layer for biometric data
 *
 * Decouples somatic tools from the specific device bridge.
 * Currently reads from RealtimeBiometricService (which gets data
 * from HealthKitBridge on iOS or manual injection).
 *
 * No interpretation. No scoring. No inference.
 * Just: what does the body say right now?
 */

import { realtimeBiometricService } from '@/lib/biometrics/RealtimeBiometricService';

// =============================================================================
// TYPES
// =============================================================================

export interface PhysiologicalSnapshot {
  heartRate?: number;
  hrv?: number;
  respiratoryRate?: number;
  coherenceLevel?: number;
  timestamp?: string;
  source: 'apple-watch' | 'manual' | 'unknown';
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get the most recent physiological snapshot.
 * Returns null if no device is connected or no data available.
 * Never throws — always safe to call.
 */
export function getPhysiologySnapshot(): PhysiologicalSnapshot | null {
  try {
    const latest = realtimeBiometricService.getLatest();

    if (!latest) return null;

    // Only return if we have at least one meaningful metric
    if (latest.hrv === undefined && latest.heartRate === undefined) return null;

    return {
      heartRate: latest.heartRate,
      hrv: latest.hrv,
      respiratoryRate: latest.respiratoryRate,
      coherenceLevel: latest.coherenceLevel,
      timestamp: latest.timestamp.toISOString(),
      source: 'apple-watch',
    };
  } catch {
    return null;
  }
}

/**
 * Check if any physiological data source is available.
 * Does not require data to exist — just checks if the service is running.
 */
export function isPhysiologyAvailable(): boolean {
  try {
    return realtimeBiometricService.getLatest() !== null;
  } catch {
    return false;
  }
}

/**
 * Format a snapshot for minimal display (completion screen).
 * Returns null if nothing worth showing.
 */
export function formatSnapshotForDisplay(snapshot: PhysiologicalSnapshot | null): {
  heartRate?: string;
  hrv?: string;
} | null {
  if (!snapshot) return null;

  const result: { heartRate?: string; hrv?: string } = {};

  if (snapshot.heartRate !== undefined) {
    result.heartRate = `${Math.round(snapshot.heartRate)} bpm`;
  }
  if (snapshot.hrv !== undefined) {
    result.hrv = `${Math.round(snapshot.hrv)} ms`;
  }

  if (!result.heartRate && !result.hrv) return null;
  return result;
}
