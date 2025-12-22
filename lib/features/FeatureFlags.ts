/**
 * Feature Flags for MAIA Consciousness Computing
 *
 * Controls which features are enabled for beta testers and production users.
 */

export const FeatureFlags = {
  /** Kauffman Radical Emergence Tracking */
  EMERGENCE_TRACKING: process.env.NEXT_PUBLIC_EMERGENCE_ENABLED === 'true',

  /** Beta-only features (comma-separated list) */
  BETA_FEATURES: (process.env.NEXT_PUBLIC_BETA_FEATURES || '').split(',').filter(Boolean),

  /** Development mode */
  IS_DEV: process.env.NODE_ENV === 'development',

  /** Production mode */
  IS_PROD: process.env.NODE_ENV === 'production',
} as const;

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  // Special cases
  if (feature === 'emergence_tracking') {
    return FeatureFlags.EMERGENCE_TRACKING;
  }

  // Check beta features list
  return FeatureFlags.BETA_FEATURES.includes(feature);
}

/**
 * User interface for feature access control
 */
export interface User {
  id: string;
  email?: string;
  beta_tester?: boolean;
  roles?: string[];
}

/**
 * Check if user is a beta tester
 */
export function isBetaTester(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }

  // Explicit beta tester flag
  if (user.beta_tester === true) {
    return true;
  }

  // Soullab team members
  if (user.email?.endsWith('@soullab.ai')) {
    return true;
  }

  // Admins have beta access
  if (user.roles?.includes('admin')) {
    return true;
  }

  return false;
}

/**
 * Check if user can access emergence tracking
 */
export function canAccessEmergence(user: User | null | undefined): boolean {
  // Feature must be enabled globally
  if (!FeatureFlags.EMERGENCE_TRACKING) {
    return false;
  }

  // In development, everyone can access
  if (FeatureFlags.IS_DEV) {
    return true;
  }

  // In production, only beta testers
  return isBetaTester(user);
}

/**
 * Get all enabled features for a user
 */
export function getEnabledFeatures(user: User | null | undefined): string[] {
  const features: string[] = [];

  if (canAccessEmergence(user)) {
    features.push('emergence_tracking');
    features.push('o4_niche_detection');
  }

  // Add other beta features
  if (isBetaTester(user)) {
    features.push(...FeatureFlags.BETA_FEATURES);
  }

  return features;
}

/**
 * Feature flag hook for React components
 */
export function useFeatureFlag(feature: string, user?: User | null): boolean {
  if (feature === 'emergence_tracking') {
    return canAccessEmergence(user);
  }

  return isFeatureEnabled(feature);
}
