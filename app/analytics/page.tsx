/**
 * ANALYTICS DASHBOARD PAGE
 * Phase 4.4C: Comprehensive Consciousness Analytics Dashboard
 *
 * Displays:
 * - Spiral Map visualization of facet analytics
 * - Overview metrics and KPIs
 * - Agent performance tracking
 * - Temporal activity patterns
 * - Practice recommendations
 * - Safety event monitoring
 */

'use client';

import { Suspense } from 'react';
import SpiralMap from '../components/SpiralMap';
import SummaryCards from './components/SummaryCards';
import AgentPerformanceTable from './components/AgentPerformanceTable';
import ActivityTimelineChart from './components/ActivityTimelineChart';
import PracticeRecommendationsTable from './components/PracticeRecommendationsTable';
import SafetyEventLog from './components/SafetyEventLog';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Consciousness Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time insights into MAIA&apos;s symbolic routing system and consciousness trace patterns
        </p>
      </div>

      {/* Overview Metrics */}
      <Suspense fallback={<LoadingCards />}>
        <SummaryCards />
      </Suspense>

      {/* Spiral Map Visualization */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Facet Distribution Map
        </h2>
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />}>
          <SpiralMap />
        </Suspense>
      </div>

      {/* Analytics Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <Suspense fallback={<LoadingCard title="Agent Performance" />}>
          <AgentPerformanceTable />
        </Suspense>

        {/* Practice Recommendations */}
        <Suspense fallback={<LoadingCard title="Practice Recommendations" />}>
          <PracticeRecommendationsTable />
        </Suspense>

        {/* Activity Timeline - Full Width */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingCard title="Activity Timeline" />}>
            <ActivityTimelineChart />
          </Suspense>
        </div>

        {/* Safety Events */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingCard title="Safety Events" />}>
            <SafetyEventLog />
          </Suspense>
        </div>
      </div>

      {/* Technical Details */}
      <details className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <summary className="cursor-pointer text-lg font-semibold text-gray-800 dark:text-gray-200">
          Technical Details
        </summary>
        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Data Source:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">consciousness_traces</code> table
          </p>
          <p>
            <strong>Materialized Views:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">analytics_facet_distribution</code>,{' '}
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">analytics_agent_metrics</code>,{' '}
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">analytics_hourly_activity</code>
          </p>
          <p>
            <strong>Update Frequency:</strong> On-demand refresh (POST /api/analytics/refresh)
          </p>
          <p>
            <strong>Facets Tracked:</strong> All Spiralogic facets (water2, fire3, earth1, etc.)
          </p>
          <p>
            <strong>Metrics:</strong> Trace count, confidence, latency, agent routing, practice recommendations, safety events
          </p>
        </div>
      </details>
    </div>
  );
}

// Loading States
function LoadingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}

function LoadingCard({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
