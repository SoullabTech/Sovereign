'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface ActivityDataPoint {
  hour: string;
  trace_count: number;
  unique_users: number;
  avg_latency_ms: number;
  critical_events: number;
  elevated_events: number;
  facet_breakdown: Record<string, number>;
}

interface ActivityData {
  ok: boolean;
  data: ActivityDataPoint[];
  meta: {
    count: number;
    filters: {
      hoursAgo: number;
      limit: number;
    };
  };
}

export default function ActivityTimelineChart() {
  const { data, isLoading, error } = useQuery<ActivityData>({
    queryKey: ['analytics', 'activity'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/activity?limit=168&hoursAgo=168');
      if (!res.ok) throw new Error('Failed to fetch activity data');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Activity Timeline
        </h3>
        <div className="h-64 animate-pulse bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (error || !data?.ok) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Activity Timeline
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-800 dark:text-red-200">
          Failed to load activity timeline
        </div>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.data.map((point) => ({
    time: format(new Date(point.hour), 'MMM d, ha'),
    traces: point.trace_count,
    users: point.unique_users,
    latency: Math.round(point.avg_latency_ms),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Activity Timeline
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last {data.meta.filters.hoursAgo} hours
        </span>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.2}
            />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend
              wrapperStyle={{ color: '#9CA3AF' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="traces"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 3 }}
              name="Traces"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 3 }}
              name="Users"
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 3 }}
              name="Latency (ms)"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No activity data available yet
        </div>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Traces</p>
            <p className="text-xl font-semibold text-blue-500">
              {chartData.reduce((sum, p) => sum + p.traces, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Peak Users</p>
            <p className="text-xl font-semibold text-purple-500">
              {Math.max(...chartData.map((p) => p.users))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Latency</p>
            <p className="text-xl font-semibold text-green-500">
              {Math.round(
                chartData.reduce((sum, p) => sum + p.latency, 0) / chartData.length
              )}ms
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
