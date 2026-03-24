'use client';

/**
 * Labtools Hub
 * Business operations dashboard for ventures, network, meetings, and pipeline.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LabtoolsDashboardData {
  ventures: {
    active: number;
    total: number;
  };
  pipeline: {
    activeCount: number;
    activeValueCents: number;
    wonThisMonthCents: number;
  };
  meetings: {
    upcoming: number;
    nextMeeting: {
      id: string;
      title: string;
      scheduledStartAt: string;
    } | null;
  };
  attention: {
    overdueTasksCount: number;
    stalledOppsCount: number;
    meetingsWithoutNotesCount: number;
  };
}

interface Practice {
  id: string;
  name: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-800 rounded w-32 mb-8" />
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="h-48 bg-gray-800 rounded" />
        <div className="h-48 bg-gray-800 rounded" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-48 bg-gray-800 rounded" />
        <div className="h-48 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  count,
  icon
}: {
  title: string;
  description: string;
  href: string;
  count?: number;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="bg-[#111827] rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {count !== undefined && count > 0 && (
          <span className="text-xl font-medium text-white tabular-nums">{count}</span>
        )}
      </div>
      <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}

export default function LabtoolsHub() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [data, setData] = useState<LabtoolsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);
        const memberId = member.id;

        // Get practice
        const practicesRes = await fetch('/api/practitioner/practices', {
          headers: { 'x-member-id': memberId }
        });

        if (!practicesRes.ok) {
          throw new Error('Failed to load practices');
        }

        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }

        const currentPractice = practices[0];
        setPractice(currentPractice);

        // Load labtools dashboard data
        const dashboardRes = await fetch(
          `/api/practitioner/practices/${currentPractice.id}/labtools/dashboard`,
          { headers: { 'x-member-id': memberId } }
        );

        if (!dashboardRes.ok) {
          // If dashboard endpoint doesn't exist yet, use empty state
          if (dashboardRes.status === 404) {
            setData({
              ventures: { active: 0, total: 0 },
              pipeline: { activeCount: 0, activeValueCents: 0, wonThisMonthCents: 0 },
              meetings: { upcoming: 0, nextMeeting: null },
              attention: { overdueTasksCount: 0, stalledOppsCount: 0, meetingsWithoutNotesCount: 0 }
            });
          } else {
            throw new Error('Failed to load dashboard');
          }
        } else {
          const dashboardData = await dashboardRes.json();
          setData(dashboardData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error || 'Failed to load dashboard'}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalAttention = data ?
    data.attention.overdueTasksCount +
    data.attention.stalledOppsCount +
    data.attention.meetingsWithoutNotesCount : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/practitioner/dashboard" className="hover:text-gray-400">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-400">Labtools</span>
          </div>
          <h1 className="text-xl font-medium text-white">Labtools</h1>
          <p className="text-sm text-gray-500 mt-1">
            Business operations and venture management
          </p>
        </header>

        {/* Quick Stats */}
        {data && (
          <section className="mb-8">
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-medium text-white tabular-nums">
                    {data.ventures.active}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Active Ventures</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-white tabular-nums">
                    {formatCurrency(data.pipeline.activeValueCents)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Pipeline Value</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-white tabular-nums">
                    {data.meetings.upcoming}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Upcoming Meetings</div>
                </div>
                <div>
                  <div className={`text-2xl font-medium tabular-nums ${
                    totalAttention > 0 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {totalAttention}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Needs Attention</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <QuickActionCard
              title="Identity Audit"
              description="A one-time, high-resolution map of your structure"
              href="/audit"
              icon="🔍"
            />
            <QuickActionCard
              title="Ventures"
              description="Manage business initiatives and projects"
              href="/practitioner/labtools/ventures"
              count={data?.ventures.total}
              icon="🚀"
            />
            <QuickActionCard
              title="Pipeline"
              description="Track opportunities and deals"
              href="/practitioner/labtools/pipeline"
              count={data?.pipeline.activeCount}
              icon="📊"
            />
            <QuickActionCard
              title="Meetings"
              description="Schedule and track business meetings"
              href="/practitioner/labtools/meetings"
              count={data?.meetings.upcoming}
              icon="📅"
            />
            <QuickActionCard
              title="Network"
              description="People with business relationships"
              href="/practitioner/labtools/network"
              icon="🤝"
            />
          </div>
        </section>

        {/* Next Meeting */}
        {data?.meetings.nextMeeting && (
          <section className="mb-8">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
              Next Meeting
            </h2>
            <Link
              href={`/practitioner/labtools/meetings/${data.meetings.nextMeeting.id}`}
              className="block bg-[#111827] rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">
                    {data.meetings.nextMeeting.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatRelativeTime(data.meetings.nextMeeting.scheduledStartAt)}
                  </p>
                </div>
                <span className="text-gray-500">→</span>
              </div>
            </Link>
          </section>
        )}

        {/* Attention Needed */}
        {totalAttention > 0 && data && (
          <section>
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
              Attention Needed
            </h2>
            <div className="bg-[#111827] rounded-xl border border-amber-500/30 p-6">
              <div className="space-y-3">
                {data.attention.overdueTasksCount > 0 && (
                  <Link
                    href="/practitioner/labtools/ventures?filter=overdue_tasks"
                    className="flex items-center justify-between text-sm hover:text-amber-400 transition-colors"
                  >
                    <span className="text-gray-300">
                      {data.attention.overdueTasksCount} overdue task{data.attention.overdueTasksCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-500">→</span>
                  </Link>
                )}
                {data.attention.stalledOppsCount > 0 && (
                  <Link
                    href="/practitioner/labtools/pipeline?filter=stalled"
                    className="flex items-center justify-between text-sm hover:text-amber-400 transition-colors"
                  >
                    <span className="text-gray-300">
                      {data.attention.stalledOppsCount} stalled opportunit{data.attention.stalledOppsCount !== 1 ? 'ies' : 'y'}
                    </span>
                    <span className="text-gray-500">→</span>
                  </Link>
                )}
                {data.attention.meetingsWithoutNotesCount > 0 && (
                  <Link
                    href="/practitioner/labtools/meetings?filter=missing_notes"
                    className="flex items-center justify-between text-sm hover:text-amber-400 transition-colors"
                  >
                    <span className="text-gray-300">
                      {data.attention.meetingsWithoutNotesCount} meeting{data.attention.meetingsWithoutNotesCount !== 1 ? 's' : ''} without notes
                    </span>
                    <span className="text-gray-500">→</span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="/practitioner/dashboard"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            ← Back to Stewardship Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
