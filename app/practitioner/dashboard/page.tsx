'use client';

/**
 * Stewardship Dashboard
 * This is a Stewardship Dashboard, not a Business Dashboard.
 *
 * Everything is framed as:
 * - Clarity (what's true right now)
 * - Responsibility (what needs attention)
 * - Closure (what's ending well)
 * - Capacity (what you can hold)
 * - Sustainability (what keeps you going)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommitmentCards,
  UpcomingSessions,
  UpcomingTasks,
  CapacityIndicator,
  FinancialSummary,
  AttentionNeeded,
  PendingAgreements
} from '@/components/practitioner/dashboard';

interface DashboardData {
  commitments: {
    active: number;
    paused: number;
    closing: number;
    inquiry: number;
  };
  careHorizon: {
    sessions: Array<{
      id: string;
      scheduledStartAt: string;
      sessionType: string;
      containerId: string;
      containerScope: string | null;
    }>;
    tasks: Array<{
      id: string;
      title: string;
      dueAt: string | null;
      containerId: string | null;
      containerScope: string | null;
    }>;
  };
  capacity: {
    sessionsThisWeek: number;
    maxSessionsPerWeek: number | null;
    bufferIntegrity: 'ok' | 'tight' | 'none';
    recoveryBlocksPresent: boolean;
  };
  sustainability: {
    paidThisMonthCents: number;
    pendingCents: number;
    outstandingInvoices: number;
    currency: string;
  };
  hygiene: {
    containersNeedingAttention: Array<{
      containerId: string;
      containerScope: string | null;
      reason: 'closing_no_next_session' | 'no_recent_session';
    }>;
    agreementsPending: number;
  };
}

interface Practice {
  id: string;
  name: string;
  timezone: string;
}

function formatDate(date: Date, timezone: string): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone
  });
}

function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-8 bg-stone-200 rounded w-48 mb-2" />
      <div className="h-4 bg-stone-100 rounded w-32 mb-8" />
      <div className="h-32 bg-stone-100 rounded mb-8" />
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="h-64 bg-stone-100 rounded" />
        <div className="h-64 bg-stone-100 rounded" />
      </div>
    </div>
  );
}

export default function StewardshipDashboard() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Get member ID from localStorage
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);
        const memberId = member.id;

        // First, get or create practice
        const practicesRes = await fetch('/api/practitioner/practices', {
          headers: { 'x-member-id': memberId }
        });

        if (!practicesRes.ok) {
          throw new Error('Failed to load practices');
        }

        const { practices } = await practicesRes.json();

        let currentPractice: Practice;

        if (practices.length === 0) {
          // Create default practice
          const createRes = await fetch('/api/practitioner/practices', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-member-id': memberId
            },
            body: JSON.stringify({
              name: `${member.name || member.username}'s Practice`,
              modes: ['coaching'],
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          });

          if (!createRes.ok) {
            throw new Error('Failed to create practice');
          }

          const { practice: newPractice } = await createRes.json();
          currentPractice = newPractice;
        } else {
          currentPractice = practices[0];
        }

        setPractice(currentPractice);

        // Load dashboard data
        const dashboardRes = await fetch(
          `/api/practitioner/practices/${currentPractice.id}/dashboard`,
          { headers: { 'x-member-id': memberId } }
        );

        if (!dashboardRes.ok) {
          throw new Error('Failed to load dashboard');
        }

        const dashboardData = await dashboardRes.json();
        setData(dashboardData);
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

  if (error || !data || !practice) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    );
  }

  const handleFilterClick = (status: string) => {
    router.push(`/practitioner/containers?status=${status}`);
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/practitioner/sessions/${sessionId}`);
  };

  const handleTaskClick = (taskId: string) => {
    // TODO: Implement task detail view
    console.log('Task clicked:', taskId);
  };

  const handleTaskComplete = async (taskId: string) => {
    // TODO: Implement task completion
    console.log('Complete task:', taskId);
  };

  const handleContainerClick = (containerId: string) => {
    router.push(`/practitioner/containers/${containerId}`);
  };

  const handleOutstandingClick = () => {
    router.push('/practitioner/billing?status=outstanding');
  };

  const handleViewAgreements = () => {
    router.push('/practitioner/agreements?status=pending');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-light text-stone-800">{practice.name}</h1>
            <p className="text-sm text-stone-500">
              {formatDate(new Date(), practice.timezone)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/practitioner/sessions/new')}
              className="px-3 py-2 text-sm bg-white border border-stone-200 rounded-md
                       hover:bg-stone-50 transition-colors flex items-center gap-2"
            >
              <span>+ Session</span>
            </button>
            <button
              onClick={() => router.push('/practitioner/tasks/new')}
              className="px-3 py-2 text-sm bg-white border border-stone-200 rounded-md
                       hover:bg-stone-50 transition-colors flex items-center gap-2"
            >
              <span>+ Task</span>
            </button>
          </div>
        </header>

        {/* Commitments */}
        <section className="mb-8">
          <CommitmentCards
            {...data.commitments}
            onFilterClick={handleFilterClick}
          />
        </section>

        {/* Care Horizon */}
        <section className="mb-8 grid md:grid-cols-2 gap-6">
          <UpcomingSessions
            sessions={data.careHorizon.sessions}
            onSessionClick={handleSessionClick}
          />
          <UpcomingTasks
            tasks={data.careHorizon.tasks}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
          />
        </section>

        {/* Capacity + Sustainability */}
        <section className="mb-8 grid md:grid-cols-2 gap-6">
          <CapacityIndicator {...data.capacity} />
          <FinancialSummary
            {...data.sustainability}
            onOutstandingClick={handleOutstandingClick}
          />
        </section>

        {/* Hygiene */}
        <section className="grid md:grid-cols-2 gap-6">
          <AttentionNeeded
            items={data.hygiene.containersNeedingAttention}
            onContainerClick={handleContainerClick}
          />
          <PendingAgreements
            count={data.hygiene.agreementsPending}
            onViewAll={handleViewAgreements}
          />
        </section>
      </div>
    </div>
  );
}
