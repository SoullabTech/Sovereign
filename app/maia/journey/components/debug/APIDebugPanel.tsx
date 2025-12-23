/**
 * API Debug Panel - Journey Page Phase 2
 *
 * Debug overlay for testing and verifying API integration.
 * Accessible via ?debug=true query parameter.
 *
 * Phase: 4.4-C Phase 2 (API Integration)
 * Created: December 23, 2024
 */

'use client';

import { useState } from 'react';
import { useThreads } from '../../hooks/useThreads';
import { useInsights } from '../../hooks/useInsights';
import { useSymbols } from '../../hooks/useSymbols';
import { useSynthesis } from '../../hooks/useSynthesis';
import { useCollective } from '../../hooks/useCollective';

export function APIDebugPanel() {
  const [visible, setVisible] = useState(false);
  const [selectedThreads, setSelectedThreads] = useState<number[]>([1, 2, 3]);

  // Fetch data from all hooks
  const threads = useThreads({ count: 5 });
  const insights = useInsights({ count: 5 });
  const symbols = useSymbols({ count: 5 });
  const synthesis = useSynthesis({ threadIds: selectedThreads });
  const collective = useCollective();

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2
                   rounded-full shadow-lg z-50 text-sm font-medium hover:bg-purple-700
                   transition-colors"
      >
        API Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              API Integration Debug Panel
            </h2>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Threads Endpoint */}
            <EndpointSection
              title="GET /api/bardic/threads"
              isLoading={threads.isLoading}
              isError={threads.isError}
              error={threads.error}
              data={{
                count: threads.count,
                sampleData: threads.threads.slice(0, 2),
              }}
              onRefetch={threads.refetch}
            />

            {/* Insights Endpoint */}
            <EndpointSection
              title="GET /api/bardic/insights"
              isLoading={insights.isLoading}
              isError={insights.isError}
              error={insights.error}
              data={{
                count: insights.count,
                sampleData: insights.insights.slice(0, 2),
              }}
              onRefetch={insights.refetch}
            />

            {/* Symbols Endpoint */}
            <EndpointSection
              title="GET /api/bardic/symbols"
              isLoading={symbols.isLoading}
              isError={symbols.isError}
              error={symbols.error}
              data={{
                count: symbols.count,
                sampleData: symbols.symbols.slice(0, 2),
              }}
              onRefetch={symbols.refetch}
            />

            {/* Synthesis Endpoint */}
            <EndpointSection
              title="GET /api/bardic/synthesis"
              isLoading={synthesis.isLoading}
              isError={synthesis.isError}
              error={synthesis.error}
              data={{
                threadIds: selectedThreads,
                motifCount: synthesis.report?.motifs.length || 0,
                cycleCount: synthesis.report?.cycles.length || 0,
              }}
              onRefetch={synthesis.refetch}
            />

            {/* Collective Coherence Endpoint */}
            <EndpointSection
              title="GET /api/collective/coherence"
              isLoading={collective.isLoading}
              isError={collective.isError}
              error={collective.error}
              data={{
                coherence: collective.coherence?.groupCoherence,
                participants: collective.coherence?.participantCount,
                trend: collective.coherence?.trend,
              }}
              onRefetch={collective.refetch}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-sm text-gray-600">
              Phase 2 API Integration • All endpoints using mock data
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Phase 3 will replace mock generators with real database queries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Endpoint Section Component
// ============================================================================

interface EndpointSectionProps {
  title: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: any;
  onRefetch: () => void;
}

function EndpointSection({
  title,
  isLoading,
  isError,
  error,
  data,
  onRefetch,
}: EndpointSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <StatusIndicator isLoading={isLoading} isError={isError} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-mono text-gray-700 hover:text-gray-900"
          >
            {title}
          </button>
        </div>
        <button
          onClick={onRefetch}
          className="text-xs px-3 py-1 bg-blue-500 text-white rounded
                     hover:bg-blue-600 transition-colors"
        >
          Refetch
        </button>
      </div>

      {/* Collapsed State */}
      {!expanded && (
        <div className="p-4 text-sm text-gray-600">
          {isLoading && 'Loading...'}
          {isError && (
            <span className="text-red-600">Error: {error?.message}</span>
          )}
          {!isLoading && !isError && (
            <span className="text-green-600">✓ Success</span>
          )}
        </div>
      )}

      {/* Expanded State */}
      {expanded && (
        <div className="p-4 bg-white">
          {isLoading && (
            <div className="text-sm text-gray-500">Loading data...</div>
          )}
          {isError && (
            <div className="text-sm text-red-600">
              <div className="font-semibold">Error:</div>
              <pre className="mt-2 p-2 bg-red-50 rounded overflow-x-auto">
                {error?.message}
              </pre>
            </div>
          )}
          {!isLoading && !isError && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">
                Response Data:
              </div>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Status Indicator Component
// ============================================================================

function StatusIndicator({
  isLoading,
  isError,
}: {
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
    );
  }

  if (isError) {
    return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
  }

  return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
}
