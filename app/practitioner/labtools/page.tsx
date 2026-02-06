'use client';

/**
 * Labtools Dashboard
 * Overview of business operations
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface DashboardData {
  ventures: {
    active: number;
    planning: number;
    total: number;
  };
  meetings: {
    upcoming: number;
    thisWeek: number;
  };
  pipeline: {
    active: number;
    totalValue: number;
    weightedValue: number;
  };
  network: {
    total: number;
    recent: number;
  };
  recentVentures: Array<{
    id: string;
    name: string;
    ventureType: string;
    status: string;
  }>;
  upcomingMeetings: Array<{
    id: string;
    title: string;
    scheduledStartAt: string;
    meetingType: string;
  }>;
}

const VENTURE_TYPE_LABELS: Record<string, string> = {
  maia_rd: 'MAIA R&D',
  soullab_rd: 'Soullab R&D',
  marketing: 'Marketing',
  sales: 'Sales',
  partnership: 'Partnership',
  operations: 'Operations',
  content: 'Content',
  events: 'Events',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-300',
  planning: 'bg-blue-500/20 text-blue-300',
  idea: 'bg-gray-500/20 text-gray-300',
  on_hold: 'bg-yellow-500/20 text-yellow-300',
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays === 0) {
    if (diffHours < 1) return 'Soon';
    return `In ${diffHours}h`;
  }
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LabtoolsDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Get practice
        const practicesRes = await apiFetch('/api/practitioner/practices');
        if (!practicesRes.ok) throw new Error('Failed to load practice');
        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        const practice = practices[0];
        setPracticeId(practice.id);

        // Get labtools dashboard data
        const dashRes = await apiFetch(`/api/practitioner/practices/${practice.id}/labtools/dashboard`);
        if (!dashRes.ok) throw new Error('Failed to load dashboard');
        const dashData = await dashRes.json();
        setData(dashData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-800 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-800 rounded-lg" />
            <div className="h-64 bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error || 'Failed to load data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Business Operations</h1>
          <p className="text-gray-500 mt-1">Track ventures, meetings, network, and pipeline</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Ventures */}
        <Link
          href="/practitioner/labtools/ventures"
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
        >
          <p className="text-sm text-gray-500 mb-1">Ventures</p>
          <p className="text-2xl font-semibold text-white">{data.ventures.active}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.ventures.planning} planning · {data.ventures.total} total
          </p>
        </Link>

        {/* Meetings */}
        <Link
          href="/practitioner/labtools/meetings"
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
        >
          <p className="text-sm text-gray-500 mb-1">Upcoming Meetings</p>
          <p className="text-2xl font-semibold text-white">{data.meetings.upcoming}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.meetings.thisWeek} this week
          </p>
        </Link>

        {/* Pipeline */}
        <Link
          href="/practitioner/labtools/pipeline"
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
        >
          <p className="text-sm text-gray-500 mb-1">Pipeline</p>
          <p className="text-2xl font-semibold text-white">{data.pipeline.active}</p>
          <p className="text-xs text-green-400 mt-1">
            {formatCurrency(data.pipeline.weightedValue)} weighted
          </p>
        </Link>

        {/* Network */}
        <Link
          href="/practitioner/labtools/network"
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
        >
          <p className="text-sm text-gray-500 mb-1">Network</p>
          <p className="text-2xl font-semibold text-white">{data.network.total}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.network.recent} added recently
          </p>
        </Link>
      </div>

      {/* Two Column Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Ventures */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Active Ventures
            </h2>
            <Link
              href="/practitioner/labtools/ventures/new"
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              + New
            </Link>
          </div>
          {data.recentVentures.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No active ventures</p>
              <Link
                href="/practitioner/labtools/ventures/new"
                className="text-sm text-amber-400 hover:underline mt-2 inline-block"
              >
                Create your first venture
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {data.recentVentures.map(venture => (
                <Link
                  key={venture.id}
                  href={`/practitioner/labtools/ventures/${venture.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
                >
                  <div>
                    <p className="text-white">{venture.name}</p>
                    <p className="text-xs text-gray-500">
                      {VENTURE_TYPE_LABELS[venture.ventureType] || venture.ventureType}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[venture.status] || 'bg-gray-500/20 text-gray-300'}`}>
                    {venture.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Upcoming Meetings
            </h2>
            <Link
              href="/practitioner/labtools/meetings/new"
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              + Schedule
            </Link>
          </div>
          {data.upcomingMeetings.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No upcoming meetings</p>
              <Link
                href="/practitioner/labtools/meetings/new"
                className="text-sm text-amber-400 hover:underline mt-2 inline-block"
              >
                Schedule a meeting
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {data.upcomingMeetings.map(meeting => (
                <Link
                  key={meeting.id}
                  href={`/practitioner/labtools/meetings/${meeting.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
                >
                  <div>
                    <p className="text-white">{meeting.title}</p>
                    <p className="text-xs text-gray-500">{meeting.meetingType}</p>
                  </div>
                  <span className="text-sm text-amber-400">
                    {formatRelativeTime(meeting.scheduledStartAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/practitioner/labtools/ventures/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-colors"
        >
          + New Venture
        </Link>
        <Link
          href="/practitioner/labtools/meetings/new"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          + Schedule Meeting
        </Link>
        <Link
          href="/practitioner/labtools/network/new"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          + Add Contact
        </Link>
        <Link
          href="/practitioner/labtools/pipeline/new"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          + New Opportunity
        </Link>
      </div>
    </div>
  );
}
