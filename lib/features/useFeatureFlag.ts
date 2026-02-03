'use client';

/**
 * Client-side feature flag hook
 *
 * Usage:
 *   const voiceV2 = useFeatureFlag('VOICE_V2');
 *   if (voiceV2) { ... new flow ... }
 */

import { useMemo } from 'react';
import { getFeatureFlag, type FeatureKey } from './flags';

export function useFeatureFlag(key: FeatureKey): boolean {
  // Stable per render, reads env/defaults.
  // If you later want live-toggling, swap to a provider.
  return useMemo(() => getFeatureFlag(key), [key]);
}
