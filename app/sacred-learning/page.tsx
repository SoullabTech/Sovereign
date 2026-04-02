'use client';

/**
 * Sacred Study — Daily Encounter Page
 *
 * The primary surface for the Sacred Learning Domain.
 * Feature-flagged: sacredLearning must be true to render.
 *
 * Governed by docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md
 */

import React from 'react';
import { isFeatureEnabled } from '@/lib/utils/feature-flags';
import { DailyEncounter } from '@/components/sacred-learning/DailyEncounter';

export default function SacredLearningPage() {
  const enabled = isFeatureEnabled('sacredLearning');

  if (!enabled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="text-center max-w-sm p-8">
          <p className="text-stone-400 text-sm">
            Sacred Study is being prepared.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <DailyEncounter />
    </div>
  );
}
