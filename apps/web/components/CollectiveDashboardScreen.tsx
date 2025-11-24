import React from 'react';
import CollectiveDashboard from './CollectiveDashboard';
import { useCollectiveDashboardData } from '../hooks/useCollectiveDashboardData';

/**
 * CollectiveDashboardScreen
 * 
 * Full-page implementation of the Collective Dashboard using the data hook.
 * Includes loading states, error handling, and expert mode toggle.
 */

interface CollectiveDashboardScreenProps {
  userId?: string;
  initialExpertMode?: boolean;
}

export default function CollectiveDashboardScreen({ 
  userId, 
  initialExpertMode = false 
}: CollectiveDashboardScreenProps) {
  const [expertMode, setExpertMode] = React.useState(initialExpertMode);
  
  const { data, isLoading, error } = useCollectiveDashboardData({
    userId,
    expertMode,
    useSSE: true, // Enable live updates
    refreshInterval: 60_000 // 60 second refresh
  });

  // Transform API response to dashboard format
  const dashboardData = React.useMemo(() => {
    if (!data) return undefined;
    
    return {
      header: {
        coherenceScore: data.coherence.score,
        level: Math.floor(data.coherence.score / 25) as 0 | 1 | 2 | 3,
        phrase: data.coherence.tone,
        themes: data.themes.map(t => ({
          label: t.label,
          momentum: t.momentum
        }))
      },
      emerging: data.emerging.map(e => ({
        id: e.id,
        title: e.label,
        description: e.description,
        momentum: Math.round(e.momentum * 3) as 0 | 1 | 2 | 3,
        when: 'near-term',
        _technical: e._internal
      })),
      shadow: data.shadowWeather.map(s => ({
        id: s.id,
        observation: s.prompt,
        invitation: s.practice,
        severity: Math.round((s._internal?.intensity || 0.5) * 3) as 0 | 1 | 2 | 3,
        _technical: {
          tag: s._internal?.pattern,
          code: s._internal?.pattern
        }
      })),
      windows: data.windows.map(w => ({
        id: w.id,
        label: w.label,
        timeframe: formatTimeframe(w.start, w.end),
        note: w.note,
        _technical: {
          windowScore: w._internal?.windowScore
        }
      })),
      practices: data.practices.map(p => ({
        id: p.id,
        title: p.label,
        duration: `${p.durationMin || 1} min`,
        instruction: p.description,
        tags: [] // Could extract from description
      }))
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Collective Dashboard</h1>
          <button
            onClick={() => setExpertMode(!expertMode)}
            className="text-sm px-3 py-1 rounded-full border hover:bg-gray-50 transition-colors"
          >
            {expertMode ? 'Exit Expert Mode' : 'Expert Mode'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {error && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-800">Unable to load collective data. Please try again.</p>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
        )}

        <CollectiveDashboard 
          data={dashboardData} 
          expertMode={expertMode} 
          loading={isLoading} 
        />
        
        {/* Live update indicator */}
        {!isLoading && !error && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
            <div className="text-center text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live updates enabled
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function to format timeframe
function formatTimeframe(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();
  
  const daysUntilStart = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilStart <= 0 && daysUntilEnd > 0) {
    return `next ${daysUntilEnd} days`;
  } else if (daysUntilStart > 0) {
    return `in ${daysUntilStart} days`;
  } else {
    return 'recently passed';
  }
}