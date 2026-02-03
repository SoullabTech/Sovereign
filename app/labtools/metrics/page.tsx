// @ts-nocheck
/**
 * 🔍 PERSONAL METRICS PAGE
 *
 * Sacred Lab drawer page for Inner Diagnostics.
 * Provides clean, member-facing metrics mirror for direct insights.
 */

'use client';

import React, { useState } from 'react';
import { PersonalMetricsDashboard } from '@/components/sacred-lab/PersonalMetricsDashboard';

export default function PersonalMetricsPage() {
  const [viewMode, setViewMode] = useState<'gentle' | 'detailed' | 'facilitator'>('gentle');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PersonalMetricsDashboard
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  );
}