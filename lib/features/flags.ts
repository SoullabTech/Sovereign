/**
 * Feature Flags System
 *
 * Simple, reliable flags for Next.js App Router + Capacitor.
 * Client-safe via NEXT_PUBLIC_* env vars.
 *
 * Usage:
 *   import { ff } from '@/lib/features/flags';
 *   const enabled = ff('VOICE_V2');
 *
 *   // Or use full name:
 *   import { getFeatureFlag } from '@/lib/features/flags';
 *   const enabled = getFeatureFlag('VOICE_V2');
 */

import { apiBaseUrl } from '@/lib/http/apiBase';

export const FEATURES = {
  // Auth
  NATIVE_OAUTH: false,        // Native Google/Apple buttons on iOS
  PASSKEY_ENROLLMENT: true,   // Already working, keep on unless hard-disable needed
  QR_LOGIN: false,            // QR code sign-in (desktop only)
  NATIVE_BIOMETRY: false,     // Capacitor native Face ID/Touch ID (vs WebAuthn)

  // Voice
  VOICE_V2: false,            // New permission + recording flow
  IOS_VOICE_NATIVE: true,     // Capacitor native mic/recorder paths (enabled for iOS)
} as const;

export type FeatureKey = keyof typeof FEATURES;

function parseBool(v: string | undefined): boolean | null {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'off'].includes(s)) return false;
  return null;
}

/**
 * Check if running in Capacitor native build
 */
export function isCapacitorBuild(): boolean {
  return process.env.NEXT_PUBLIC_CAPACITOR_BUILD === '1' || process.env.CAPACITOR_BUILD === '1';
}

/**
 * Get a feature flag value with env override support
 *
 * Priority:
 * 1. NEXT_PUBLIC_FEATURE_<KEY> (client-safe override)
 * 2. FEATURE_<KEY> (server-only override)
 * 3. Default from FEATURES object
 */
export function getFeatureFlag(key: FeatureKey): boolean {
  // Client override: NEXT_PUBLIC_FEATURE_<KEY>
  const clientOverride = parseBool(process.env[`NEXT_PUBLIC_FEATURE_${key}`]);
  if (clientOverride !== null) return clientOverride;

  // Server-only override: FEATURE_<KEY>
  const serverOverride = parseBool(process.env[`FEATURE_${key}`]);
  if (serverOverride !== null) return serverOverride;

  // Default
  return FEATURES[key];
}

/** Alias for getFeatureFlag - shorter callsites */
export function ff(key: FeatureKey): boolean {
  return getFeatureFlag(key);
}

/**
 * Get all feature flags as a record (useful for debugging/admin)
 */
export function getAllFeatureFlags(): Record<FeatureKey, boolean> {
  const keys = Object.keys(FEATURES) as FeatureKey[];
  return keys.reduce((acc, k) => {
    acc[k] = getFeatureFlag(k);
    return acc;
  }, {} as Record<FeatureKey, boolean>);
}

/**
 * Log all feature flags to console (useful for TestFlight debugging)
 * Call this on app startup to verify env vars are in the binary
 */
export function logFeatureFlags(): void {
  console.log('[flags]', getAllFeatureFlags(), { apiBaseUrl: apiBaseUrl() });
}
