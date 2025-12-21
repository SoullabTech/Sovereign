/**
 * ANALYTICS DASHBOARD PAGE
 * Phase 4.4-B: Consciousness Analytics Visualization
 *
 * Displays the Spiral Map visualization of facet analytics.
 */

import SpiralMap from '../components/SpiralMap';

export const metadata = {
  title: 'Consciousness Analytics | MAIA',
  description: 'Visualize consciousness trace patterns across the 15-facet Spiralogic ontology',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Consciousness Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time visualization of consciousness trace patterns across the 15-facet Spiralogic ontology
        </p>
      </div>

      {/* Spiral Map Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Facet Distribution Map
        </h2>
        <SpiralMap />
      </div>

      {/* Info Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What is this?
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Each circle represents a facet in the Spiralogic ontology. Size indicates trace count,
            color shows element (Fire, Water, Earth, Air, Aether), and opacity reflects routing confidence.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            How to read it
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Facets are arranged in a spiral from F1 (center) to Æ3 (outer edge), following the
            developmental sequence. Hover over circles to see detailed stats.
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            What it reveals
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Patterns in the map show which consciousness states are most active, routing confidence levels,
            and system performance metrics (avg latency per facet).
          </p>
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
            <strong>Aggregation:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">facet_trace_summary</code> PostgreSQL view
          </p>
          <p>
            <strong>Update Frequency:</strong> Real-time (fetches on page load, cached for 60s)
          </p>
          <p>
            <strong>Facets Tracked:</strong> 15 total (F1-F3, W1-W3, E1-E3, A1-A3, Æ1-Æ3)
          </p>
          <p>
            <strong>Metrics:</strong> Trace count, avg confidence, avg latency, first/last trace timestamps
          </p>
        </div>
      </details>
    </div>
  );
}
