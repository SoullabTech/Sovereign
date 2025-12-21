'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface SafetyEvent {
  id: string;
  created_at: string;
  user_id: string;
  safety_level: 'critical' | 'elevated';
  facet: string;
  mode: string;
  agent: string;
  latency_ms: number;
  practices: Array<{
    kind: string;
    detail: string;
  }>;
  rationale: string[];
}

interface SafetyData {
  ok: boolean;
  data: SafetyEvent[];
  stats: {
    total_events: number;
    critical_count: number;
    elevated_count: number;
    affected_users: number;
  };
  meta: {
    count: number;
    filters: {
      level?: string;
      daysAgo: number;
      limit: number;
    };
  };
}

export default function SafetyEventLog() {
  const { data, isLoading, error } = useQuery<SafetyData>({
    queryKey: ['analytics', 'safety'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/safety?limit=100&daysAgo=30');
      if (!res.ok) throw new Error('Failed to fetch safety events');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds (more frequent for safety)
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Safety Events
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.ok) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Safety Events
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-800 dark:text-red-200">
          Failed to load safety events
        </div>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Safety Events
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last {data.meta.filters.daysAgo} days
        </span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total_events}
          </p>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.critical_count}
          </p>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Elevated</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.elevated_count}
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Users</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.affected_users}
          </p>
        </div>
      </div>

      {/* Event Log */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.data.length > 0 ? (
          data.data.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg border-l-4 ${
                event.safety_level === 'critical'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                  : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                      event.safety_level === 'critical'
                        ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
                        : 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}
                  >
                    {event.safety_level}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {event.facet} • {event.mode} • {event.agent}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(event.created_at), 'MMM d, h:mm a')}
                </span>
              </div>

              {/* Rationale */}
              {event.rationale && event.rationale.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Rationale:
                  </p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 pl-4">
                    {event.rationale.map((reason, idx) => (
                      <li key={idx} className="list-disc">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practices */}
              {event.practices && event.practices.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Recommended Practices:
                  </p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 pl-4">
                    {event.practices.map((practice, idx) => (
                      <li key={idx} className="list-disc">
                        <span className="font-medium">{practice.kind}:</span> {practice.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Latency */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Response time: {event.latency_ms}ms
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">No safety events detected</p>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              System is operating within normal parameters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
