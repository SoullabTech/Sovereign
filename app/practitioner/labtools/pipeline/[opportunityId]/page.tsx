'use client';

/**
 * Opportunity Detail
 * View and manage a single opportunity/deal
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
  status: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  stage: string;
  valueCents: number;
  currency: string;
  expectedCloseAt: string | null;
  closedAt: string | null;
  ventureId: string | null;
  ventureName: string | null;
  personId: string | null;
  personName: string | null;
  personCompany: string | null;
  personEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OpportunityData {
  opportunity: Opportunity;
  tasks: Task[];
  meetings: Meeting[];
}

const STAGES = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Won' },
  { key: 'closed_lost', label: 'Lost' }
];

const ACTIVE_STAGES = ['lead', 'qualified', 'proposal', 'negotiation'];

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
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const opportunityId = params.opportunityId as string;

  const [data, setData] = useState<OpportunityData | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editValueDollars, setEditValueDollars] = useState('');
  const [editExpectedClose, setEditExpectedClose] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadOpportunity() {
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

        const oppRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/opportunities/${opportunityId}`,
          { headers: { 'x-member-id': member.id } }
        );

        if (!oppRes.ok) {
          if (oppRes.status === 404) {
            throw new Error('Opportunity not found');
          }
          throw new Error('Failed to load opportunity');
        }

        const oppData = await oppRes.json();
        setData(oppData);
        setEditTitle(oppData.opportunity.title);
        setEditDescription(oppData.opportunity.description || '');
        setEditValueDollars((oppData.opportunity.valueCents / 100).toString());
        setEditExpectedClose(oppData.opportunity.expectedCloseAt?.split('T')[0] || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load opportunity');
      } finally {
        setIsLoading(false);
      }
    }

    loadOpportunity();
  }, [router, opportunityId]);

  const handleStageChange = async (newStage: string) => {
    if (!practiceId || !memberId || !data) return;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/opportunities/${opportunityId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({ stage: newStage })
        }
      );

      if (!res.ok) throw new Error('Failed to update stage');

      const { opportunity } = await res.json();
      setData({ ...data, opportunity });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleSaveEdit = async () => {
    if (!practiceId || !memberId || !data) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/opportunities/${opportunityId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim() || null,
            valueCents: Math.round(parseFloat(editValueDollars || '0') * 100),
            expectedCloseAt: editExpectedClose || null
          })
        }
      );

      if (!res.ok) throw new Error('Failed to update opportunity');

      const { opportunity } = await res.json();
      setData({ ...data, opportunity });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!practiceId || !memberId) return;
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/opportunities/${opportunityId}`,
        {
          method: 'DELETE',
          headers: { 'x-member-id': memberId }
        }
      );

      if (!res.ok) throw new Error('Failed to delete opportunity');

      router.push('/practitioner/labtools/pipeline');
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
            <p className="text-red-400">{error || 'Failed to load opportunity'}</p>
          </div>
          <Link
            href="/practitioner/labtools/pipeline"
            className="text-sm text-gray-500 hover:text-gray-400 mt-4 block"
          >
            ← Back to Pipeline
          </Link>
        </div>
      </div>
    );
  }

  const { opportunity, tasks, meetings } = data;
  const isActive = ACTIVE_STAGES.includes(opportunity.stage);
  const currentStageIndex = STAGES.findIndex(s => s.key === opportunity.stage);

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
            <Link href="/practitioner/labtools/pipeline" className="hover:text-gray-400">
              Pipeline
            </Link>
            <span>/</span>
            <span className="text-gray-400">{opportunity.title}</span>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-medium text-white bg-gray-900 border border-gray-700
                         rounded-lg px-4 py-2 w-full focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Value ($)</label>
                  <input
                    type="number"
                    value={editValueDollars}
                    onChange={(e) => setEditValueDollars(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                             text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Expected Close</label>
                  <input
                    type="date"
                    value={editExpectedClose}
                    onChange={(e) => setEditExpectedClose(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                             text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
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
                    setEditTitle(opportunity.title);
                    setEditDescription(opportunity.description || '');
                    setEditValueDollars((opportunity.valueCents / 100).toString());
                    setEditExpectedClose(opportunity.expectedCloseAt?.split('T')[0] || '');
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
                  <h1 className="text-xl font-medium text-white">{opportunity.title}</h1>
                  <span className={`text-xs px-2 py-1 rounded ${
                    opportunity.stage === 'closed_won' ? 'bg-green-900/30 text-green-400' :
                    opportunity.stage === 'closed_lost' ? 'bg-gray-700 text-gray-400' :
                    'bg-blue-900/30 text-blue-400'
                  }`}>
                    {STAGES.find(s => s.key === opportunity.stage)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                  <span className="text-lg font-medium text-white">
                    {formatCurrency(opportunity.valueCents)}
                  </span>
                  {opportunity.expectedCloseAt && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span>Close: {formatDate(opportunity.expectedCloseAt)}</span>
                    </>
                  )}
                </div>
                {opportunity.description && (
                  <p className="text-gray-400 mt-3">{opportunity.description}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white
                         border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </header>

        {/* Stage Progress */}
        {isActive && (
          <section className="mb-8">
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Stage
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {STAGES.slice(0, 4).map((stage, index) => (
                  <button
                    key={stage.key}
                    onClick={() => handleStageChange(stage.key)}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                      index <= currentStageIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleStageChange('closed_won')}
                  className="px-6 py-2 text-sm bg-green-600 hover:bg-green-500 text-white
                           rounded-lg transition-colors"
                >
                  Mark Won
                </button>
                <button
                  onClick={() => handleStageChange('closed_lost')}
                  className="px-6 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300
                           rounded-lg transition-colors"
                >
                  Mark Lost
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Related Info */}
        <section className="mb-8 grid md:grid-cols-2 gap-6">
          {/* Contact */}
          {opportunity.personName && (
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
              <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
                Contact
              </h2>
              <div>
                <div className="text-white font-medium">{opportunity.personName}</div>
                {opportunity.personCompany && (
                  <div className="text-sm text-gray-400">{opportunity.personCompany}</div>
                )}
                {opportunity.personEmail && (
                  <a
                    href={`mailto:${opportunity.personEmail}`}
                    className="text-sm text-blue-400 hover:text-blue-300 mt-2 block"
                  >
                    {opportunity.personEmail}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Venture */}
          {opportunity.ventureName && (
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
              <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
                Venture
              </h2>
              <Link
                href={`/practitioner/labtools/ventures/${opportunity.ventureId}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {opportunity.ventureName}
              </Link>
            </div>
          )}
        </section>

        {/* Tasks */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              Open Tasks ({tasks.length})
            </h2>
            <Link
              href={`/practitioner/tasks/new?opportunityId=${opportunityId}`}
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
                      Due {formatDate(task.dueAt)}
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
              Meetings ({meetings.length})
            </h2>
            <Link
              href={`/practitioner/labtools/meetings/new?opportunityId=${opportunityId}`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Schedule Meeting
            </Link>
          </div>
          <div className="bg-[#111827] rounded-xl border border-gray-700 divide-y divide-gray-700">
            {meetings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No meetings
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
                    <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                      meeting.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                      meeting.status === 'scheduled' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {meeting.status}
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
            Delete Opportunity
          </button>
        </section>

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="/practitioner/labtools/pipeline"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            ← Back to Pipeline
          </Link>
        </div>
      </div>
    </div>
  );
}
