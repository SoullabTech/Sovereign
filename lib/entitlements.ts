/**
 * Entitlements - Central source of truth for tier-based feature access
 *
 * Route access is controlled by middleware + accessMatrix.ts
 * Feature access within routes is controlled here.
 *
 * TODO: Replace getEntitlements() lookup with Stripe/membership table
 */

export type Tier = 'free' | 'personal' | 'pro';

export interface Entitlements {
  tier: Tier;
  features: {
    voiceTranscription: boolean;
    analyticsBasic: boolean;
    analyticsExport: boolean;
    longitudinalTrends: boolean;
  };
  limits: {
    // Voice
    voiceSecondsPerDay: number;
    maxRecordingSeconds: number;

    // Analytics
    analyticsLookbackDays: number;
  };
}

/**
 * Temporary tier resolution.
 * Replace later with Stripe / membership table lookup.
 */
export async function getEntitlements(userId: string): Promise<Entitlements> {
  // TODO: replace with real lookup from members table or Stripe
  // For now, default to 'personal' for all authenticated users
  // Using Tier cast to allow future tier lookup logic
  const tier = 'personal' as Tier;

  if (tier === 'pro') {
    return {
      tier,
      features: {
        voiceTranscription: true,
        analyticsBasic: true,
        analyticsExport: true,
        longitudinalTrends: true,
      },
      limits: {
        voiceSecondsPerDay: 60 * 30, // 30 min/day
        maxRecordingSeconds: 10 * 60, // 10 min per clip
        analyticsLookbackDays: 365,
      },
    };
  }

  if (tier === 'personal') {
    return {
      tier,
      features: {
        voiceTranscription: true,
        analyticsBasic: true,
        analyticsExport: false,
        longitudinalTrends: false,
      },
      limits: {
        voiceSecondsPerDay: 60 * 5, // 5 min/day
        maxRecordingSeconds: 120, // 2 min per clip
        analyticsLookbackDays: 7,
      },
    };
  }

  // free (future-proofing)
  return {
    tier,
    features: {
      voiceTranscription: false,
      analyticsBasic: false,
      analyticsExport: false,
      longitudinalTrends: false,
    },
    limits: {
      voiceSecondsPerDay: 0,
      maxRecordingSeconds: 0,
      analyticsLookbackDays: 0,
    },
  };
}
