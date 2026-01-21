'use client';

/**
 * Container Detail Page
 * The "run the relationship" screen.
 *
 * Truth (what exists) → Next (what needs doing) → Closure (what's ending)
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDevMemberId, withMemberHeader } from '@/lib/practitioner/memberClient';

type Participant = {
  id: string;
  personId: string;
  displayName: string;
  email: string | null;
  role: string;
  createdAt: string;
};

type Session = {
  id: string;
  sessionType: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string;
  location: string;
};

type Agreement = {
  id: string;
  kind: string;
  status: string;
  version: number;
  acceptedAt: string | null;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  dueAt: string | null;
  status: string;
};

type ContainerDetail = {
  id: string;
  practiceId: string;
  practiceName: string;
  type: string;
  status: string;
  scope: string | null;
  startAt: string | null;
  endAt: string | null;
  visibility: string;
  riskFlags: string[];
  createdAt: string;
  updatedAt: string;
};

type ContainerData = {
  container: ContainerDetail;
  participants: Participant[];
  recentSessions: Session[];
  agreements: Agreement[];
};

const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  closing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  declined: 'bg-red-500/20 text-red-400 border-red-500/30',
  referred_out: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return 'Not set';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ContainerDetailPage() {
  const router = useRouter();
  const params = useParams<{ containerId: string }>();
  const containerId = params.containerId;

  const [memberId, setMemberId] = useState<string | null>(null);
  const [data, setData] = useState<ContainerData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getDevMemberId();
    if (!id) {
      router.push('/signin');
      return;
    }
    setMemberId(id);
  }, [router]);

  // Load container data
  useEffect(() => {
    if (!memberId) return;

    (async () => {
      setLoading(true);
      try {
        // Fetch container details
        const res = await fetch(`/api/practitioner/containers/${containerId}`, {
          headers: withMemberHeader(memberId),
        });

        if (!res.ok) {
          throw new Error('Container not found');
        }

        const containerData = await res.json();
        setData(containerData);

        // Fetch tasks for this container
        const practiceId = containerData.container.practiceId;
        const tasksRes = await fetch(
          `/api/practitioner/practices/${practiceId}/tasks?containerId=${containerId}`,
          { headers: withMemberHeader(memberId) }
        );

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData.tasks || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load container');
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId, containerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-700 rounded w-64 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-64 bg-gray-800 rounded" />
              <div className="h-64 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error || 'Container not found'}</p>
            <button
              onClick={() => router.push('/practitioner/containers')}
              className="mt-2 text-sm text-red-400 hover:underline"
            >
              Back to containers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { container, participants, recentSessions, agreements } = data;
  const upcomingSessions = recentSessions.filter(s => s.status === 'scheduled');
  const pastSessions = recentSessions.filter(s => s.status !== 'scheduled');
  const openTasks = tasks.filter(t => t.status === 'open');
  const pendingAgreements = agreements.filter(a => ['draft', 'sent'].includes(a.status));

  const containerTitle = container.scope ||
    (participants.length > 0 ? participants.map(p => p.displayName).join(', ') : 'Container');

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => router.push('/practitioner/containers')}
              className="text-sm text-gray-500 hover:text-gray-300 mb-2"
            >
              ← Containers
            </button>
            <h1 className="text-2xl font-medium text-white">{containerTitle}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_COLORS[container.status] || 'bg-gray-500/20 text-gray-400'}`}>
                {container.status}
              </span>
              <span className="text-sm text-gray-500 capitalize">{container.type}</span>
              {container.startAt && (
                <span className="text-sm text-gray-600">
                  Since {formatShortDate(container.startAt)}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/practitioner/containers/${containerId}/session/new`)}
              className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
            >
              + Session
            </button>
            <button
              onClick={() => router.push(`/practitioner/containers/${containerId}/transition`)}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Transition
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sessions & Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Upcoming Sessions
                </h2>
                <button
                  onClick={() => router.push(`/practitioner/containers/${containerId}/session/new`)}
                  className="text-sm text-gray-500 hover:text-amber-400"
                >
                  + Add
                </button>
              </div>

              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No sessions scheduled</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-300">
                          {formatDate(session.scheduledStartAt)}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {session.location} · {session.sessionType}
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/practitioner/sessions/${session.id}`)}
                        className="text-sm text-gray-500 hover:text-amber-400"
                      >
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Sessions */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-5">
              <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
                Recent Sessions
              </h2>

              {pastSessions.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No sessions yet</p>
              ) : (
                <div className="space-y-2">
                  {pastSessions.slice(0, 5).map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
                    >
                      <div className="text-sm text-gray-400">
                        {formatShortDate(session.scheduledStartAt)}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {session.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Tasks
                </h2>
                <button
                  onClick={() => router.push(`/practitioner/tasks/new?containerId=${containerId}`)}
                  className="text-sm text-gray-500 hover:text-amber-400"
                >
                  + Add
                </button>
              </div>

              {openTasks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No open tasks</p>
              ) : (
                <div className="space-y-2">
                  {openTasks.map(task => {
                    const isOverdue = task.dueAt && new Date(task.dueAt) < new Date();
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
                      >
                        <div className="text-sm text-gray-300">{task.title}</div>
                        <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                          {task.dueAt ? formatShortDate(task.dueAt) : 'No due date'}
                          {isOverdue && ' (overdue)'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Participants, Agreements, Billing */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Participants
                </h2>
                <button
                  onClick={() => router.push(`/practitioner/containers/${containerId}/participants/add`)}
                  className="text-sm text-gray-500 hover:text-amber-400"
                >
                  + Add
                </button>
              </div>

              {participants.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No participants yet</p>
              ) : (
                <div className="space-y-3">
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-300">
                          {p.displayName}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{p.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agreements */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-5">
              <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
                Agreements
              </h2>

              {agreements.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No agreements</p>
              ) : (
                <div className="space-y-2">
                  {agreements.map(a => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
                    >
                      <div className="text-sm text-gray-400 capitalize">
                        {a.kind.replace(/_/g, ' ')}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        a.status === 'accepted'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {pendingAgreements.length > 0 && (
                <p className="text-xs text-amber-400 mt-3">
                  {pendingAgreements.length} agreement{pendingAgreements.length !== 1 ? 's' : ''} pending
                </p>
              )}
            </div>

            {/* Container Info */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-5">
              <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
                Container Info
              </h2>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-300">{formatShortDate(container.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-gray-300 capitalize">{container.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Visibility</dt>
                  <dd className="text-gray-300 capitalize">{container.visibility}</dd>
                </div>
                {container.riskFlags && container.riskFlags.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Risk flags</dt>
                    <dd className="text-amber-400">{container.riskFlags.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
