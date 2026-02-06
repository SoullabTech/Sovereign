'use client';

/**
 * Venture Detail
 * View and manage a single venture
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  dueAt: string | null;
  status: string;
  createdAt: string;
}

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string;
}

interface Opportunity {
  id: string;
  title: string;
  stage: string;
  valueCents: number;
  expectedCloseAt: string | null;
}

interface Venture {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VentureData {
  venture: Venture;
  tasks: Task[];
  meetings: Meeting[];
  opportunities: Opportunity[];
}

const VENTURE_TYPE_LABELS: Record<string, string> = {
  maia_rd: 'MAIA R&D',
  soullab_rd: 'SoulLab R&D',
  marketing: 'Marketing',
  sales: 'Sales',
  partnerships: 'Partnerships',
  operations: 'Operations',
  content: 'Content',
  events: 'Events'
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost'
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export default function VentureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ventureId = params.ventureId as string;

  const [data, setData] = useState<VentureData | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadVenture() {
      try {
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);
        setMemberId(member.id);

        const practicesRes = await fetch('/api/practitioner/practices', {
          headers: { 'x-member-id': member.id }
        });

        if (!practicesRes.ok) throw new Error('Failed to load practices');

        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }

        const practice = practices[0];
        setPracticeId(practice.id);

        const ventureRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/ventures/${ventureId}`,
          { headers: { 'x-member-id': member.id } }
        );

        if (!ventureRes.ok) {
          if (ventureRes.status === 404) {
            throw new Error('Venture not found');
          }
          throw new Error('Failed to load venture');
        }

        const ventureData = await ventureRes.json();
        setData(ventureData);
        setEditName(ventureData.venture.name);
        setEditDescription(ventureData.venture.description || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load venture');
      } finally {
        setIsLoading(false);
      }
    }

    loadVenture();
  }, [router, ventureId]);

  const handleSaveEdit = async () => {
    if (!practiceId || !memberId || !data) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/ventures/${ventureId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            name: editName.trim(),
            description: editDescription.trim() || null
          })
        }
      );

      if (!res.ok) throw new Error('Failed to update venture');

      const { venture } = await res.json();
      setData({ ...data, venture });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!practiceId || !memberId || !data) return;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/ventures/${ventureId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            isActive: !data.venture.isActive
          })
        }
      );

      if (!res.ok) throw new Error('Failed to update venture');

      const { venture } = await res.json();
      setData({ ...data, venture });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!practiceId || !memberId) return;
    if (!confirm('Are you sure you want to delete this venture?')) return;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/ventures/${ventureId}`,
        {
          method: 'DELETE',
          headers: { 'x-member-id': memberId }
        }
      );

      if (!res.ok) throw new Error('Failed to delete venture');

      router.push('/practitioner/labtools/ventures');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="h-48 bg-gray-800 rounded mb-6" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error || 'Failed to load venture'}</p>
          </div>
          <Link
            href="/practitioner/labtools/ventures"
            className="text-sm text-gray-500 hover:text-gray-400 mt-4 block"
          >
            ← Back to Ventures
          </Link>
        </div>
      </div>
    );
  }

  const { venture, tasks, meetings, opportunities } = data;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/practitioner/labtools" className="hover:text-gray-400">
              Labtools
            </Link>
            <span>/</span>
            <Link href="/practitioner/labtools/ventures" className="hover:text-gray-400">
              Ventures
            </Link>
            <span>/</span>
            <span className="text-gray-400">{venture.name}</span>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-medium text-white bg-gray-900 border border-gray-700
                         rounded-lg px-4 py-2 w-full focus:outline-none focus:border-blue-500"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg
                         text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500
                         resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                           rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(venture.name);
                    setEditDescription(venture.description || '');
                  }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-medium text-white">{venture.name}</h1>
                  {!venture.isActive && (
                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {VENTURE_TYPE_LABELS[venture.type] || venture.type}
                </p>
                {venture.description && (
                  <p className="text-gray-400 mt-3">{venture.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white
                           border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleToggleActive}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white
                           border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {venture.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Tasks */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              Open Tasks ({tasks.length})
            </h2>
            <Link
              href={`/practitioner/tasks/new?ventureId=${ventureId}`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Add Task
            </Link>
          </div>
          <div className="bg-[#111827] rounded-xl border border-gray-700 divide-y divide-gray-700">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No open tasks
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between">
                  <span className="text-gray-300">{task.title}</span>
                  {task.dueAt && (
                    <span className="text-xs text-gray-500">
                      Due {formatShortDate(task.dueAt)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Meetings */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              Upcoming Meetings ({meetings.length})
            </h2>
            <Link
              href={`/practitioner/labtools/meetings/new?ventureId=${ventureId}`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Schedule Meeting
            </Link>
          </div>
          <div className="bg-[#111827] rounded-xl border border-gray-700 divide-y divide-gray-700">
            {meetings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No upcoming meetings
              </div>
            ) : (
              meetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/practitioner/labtools/meetings/${meeting.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors block"
                >
                  <div>
                    <span className="text-gray-300">{meeting.title}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {meeting.meetingType}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(meeting.scheduledStartAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Opportunities */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              Active Opportunities ({opportunities.length})
            </h2>
            <Link
              href={`/practitioner/labtools/pipeline/new?ventureId=${ventureId}`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Add Opportunity
            </Link>
          </div>
          <div className="bg-[#111827] rounded-xl border border-gray-700 divide-y divide-gray-700">
            {opportunities.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No active opportunities
              </div>
            ) : (
              opportunities.map((opp) => (
                <Link
                  key={opp.id}
                  href={`/practitioner/labtools/pipeline/${opp.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors block"
                >
                  <div>
                    <span className="text-gray-300">{opp.title}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded ml-2">
                      {STAGE_LABELS[opp.stage] || opp.stage}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 font-medium tabular-nums">
                    {formatCurrency(opp.valueCents)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-12 pt-6 border-t border-gray-800">
          <h2 className="text-xs font-medium tracking-wider text-red-400 uppercase mb-4">
            Danger Zone
          </h2>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-red-400 border border-red-400/30
                     rounded-lg hover:bg-red-400/10 transition-colors"
          >
            Delete Venture
          </button>
        </section>

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="/practitioner/labtools/ventures"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            ← Back to Ventures
          </Link>
        </div>
      </div>
    </div>
  );
}
