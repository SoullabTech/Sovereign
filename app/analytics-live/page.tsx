/**
 * LIVE BIOSIGNAL ANALYTICS PAGE
 * Phase 4.4-C: Neuropod Bridge — Real-Time Dashboard
 *
 * Displays the Live Spiral Map with real-time biosignal overlays.
 * Connects to WebSocket server on ws://localhost:8765 for live data.
 */

import SpiralMapLive from '../components/SpiralMapLive';

export const metadata = {
  title: 'Live Biosignal Analytics | MAIA',
  description: 'Real-time consciousness trace visualization with biosignal overlay (EEG, HRV, GSR, Breath)',
};

export default function AnalyticsLivePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Live Biosignal Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time consciousness trace patterns with live EEG, HRV, GSR, and breath data
        </p>
      </div>

      {/* Live Spiral Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Live Facet-Biomarker Correlation
        </h2>
        <SpiralMapLive />
      </div>

      {/* Info Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Real-Time Updates
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Biosignal data streams via WebSocket at 10Hz. Pulse overlays indicate active signals.
            Green status = live feed, red = disconnected.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Biosignal Types
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            EEG (alpha waves), HRV (heart rate variability), GSR (galvanic skin response),
            and Breath (respiratory rate) — all local, no cloud sync.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Facet Correlation
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Biomarker patterns correlate with facet transitions: Low HRV → W1 (Safety),
            High EEG → F2 (Challenge), Stable alpha → A1 (Awareness).
          </p>
        </div>
      </div>

      {/* Setup Instructions */}
      <details className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <summary className="cursor-pointer text-lg font-semibold text-gray-800 dark:text-gray-200">
          Setup Instructions
        </summary>
        <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Step 1:</strong> Start the Neuropod Bridge WebSocket server:
          </p>
          <pre className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded overflow-x-auto">
            npx tsx backend/src/scripts/start-neuropod-bridge.ts
          </pre>

          <p>
            <strong>Step 2:</strong> Connect a Neuropod device OR run the simulator:
          </p>
          <pre className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded overflow-x-auto">
            npx tsx backend/src/scripts/test-neuropod-simulator.ts
          </pre>

          <p>
            <strong>Step 3:</strong> This page will auto-connect to{' '}
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">ws://localhost:8765</code>
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            All biosignal data stays local. No cloud sync, no external analytics.
          </p>
        </div>
      </details>
    </div>
  );
}
