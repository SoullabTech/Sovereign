'use client';

import { useQuery } from '@tanstack/react-query';

interface SummaryData {
  ok: boolean;
  summary: {
    overall: {
      total_traces: number;
      total_users: number;
      total_sessions: number;
      avg_latency: number;
      critical_safety_events: number;
      elevated_safety_events: number;
    };
    facets: {
      facet_count: number;
    };
    agents: {
      agent_count: number;
    };
    practices: {
      practice_count: number;
    };
  };
}

export default function SummaryCards() {
  const { data, isLoading, error } = useQuery<SummaryData>({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
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

  if (error || !data?.ok) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-800 dark:text-red-200">
        Failed to load summary data
      </div>
    );
  }

  const { overall, facets, agents, practices } = data.summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Traces */}
      <Card
        title="Total Traces"
        value={overall.total_traces.toLocaleString()}
        subtitle={`${overall.total_users} unique users`}
        color="blue"
      />

      {/* Active Facets */}
      <Card
        title="Active Facets"
        value={facets.facet_count}
        subtitle="Consciousness states"
        color="purple"
      />

      {/* Agents */}
      <Card
        title="Routing Agents"
        value={agents.agent_count}
        subtitle={`${Math.round(overall.avg_latency)}ms avg latency`}
        color="green"
      />

      {/* Practices */}
      <Card
        title="Practices"
        value={practices.practice_count}
        subtitle="Unique recommendations"
        color="amber"
      />

      {/* Safety Events */}
      {(overall.critical_safety_events > 0 || overall.elevated_safety_events > 0) && (
        <div className="md:col-span-2 lg:col-span-4">
          <Card
            title="Safety Events"
            value={overall.critical_safety_events + overall.elevated_safety_events}
            subtitle={`${overall.critical_safety_events} critical, ${overall.elevated_safety_events} elevated`}
            color="red"
          />
        </div>
      )}
    </div>
  );
}

interface CardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'purple' | 'green' | 'amber' | 'red';
}

function Card({ title, value, subtitle, color }: CardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
