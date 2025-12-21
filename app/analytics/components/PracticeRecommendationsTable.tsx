'use client';

import { useQuery } from '@tanstack/react-query';

interface PracticeRecommendation {
  practice: string;
  recommendation_count: number;
  unique_users: number;
  associated_facets: string[];
  avg_confidence_when_recommended: number;
  first_recommended: string;
  last_recommended: string;
}

interface PracticeData {
  ok: boolean;
  data: PracticeRecommendation[];
  meta: {
    count: number;
    filters: {
      minRecommendations: number;
      limit: number;
    };
  };
}

// Facet color mapping (elemental colors)
const facetColors: Record<string, string> = {
  // Water
  water1: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  water2: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  water3: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  // Fire
  fire1: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  fire2: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  fire3: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  // Earth
  earth1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  earth2: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  earth3: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  // Air
  air1: 'bg-slate-100 text-slate-800 dark:bg-slate-700/30 dark:text-slate-300',
  air2: 'bg-slate-100 text-slate-800 dark:bg-slate-700/30 dark:text-slate-300',
  air3: 'bg-slate-100 text-slate-800 dark:bg-slate-700/30 dark:text-slate-300',
  // Aether
  aether1: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  aether2: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  aether3: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
};

export default function PracticeRecommendationsTable() {
  const { data, isLoading, error } = useQuery<PracticeData>({
    queryKey: ['analytics', 'practices'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/practices?limit=50&minRecommendations=1');
      if (!res.ok) throw new Error('Failed to fetch practice recommendations');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Practice Recommendations
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.ok) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Practice Recommendations
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-800 dark:text-red-200">
          Failed to load practice recommendations
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Practice Recommendations
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data.meta.count} practice{data.meta.count !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.data.map((practice, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            {/* Practice text */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
              {practice.practice}
            </p>

            {/* Metadata row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Facet tags */}
              <div className="flex gap-2 flex-wrap">
                {practice.associated_facets.map((facet) => (
                  <span
                    key={facet}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      facetColors[facet] || 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {facet}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">
                  {practice.recommendation_count}x recommended
                </span>
                <span>
                  {practice.unique_users} user{practice.unique_users !== 1 ? 's' : ''}
                </span>
                <span>
                  {Math.round(practice.avg_confidence_when_recommended * 100)}% confidence
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.meta.count === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No practice recommendations available yet
        </div>
      )}
    </div>
  );
}
