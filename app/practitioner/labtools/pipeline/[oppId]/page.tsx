'use client';

/**
 * Opportunity Detail Page
 * View and manage a specific opportunity
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  opportunityType: string;
  stage: string;
  estimatedValueCents: number | null;
  currency: string;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  source: string | null;
  personId: string | null;
  personName: string | null;
  personEmail: string | null;
  personCompany: string | null;
  ventureId: string | null;
  ventureName: string | null;
  lostReason: string | null;
  notes: string | null;
  stageChangedAt: string;
  createdAt: string;
  updatedAt: string;
  meetings: Array<{
    id: string;
    title: string;
    meetingType: string;
    status: string;
    scheduledStartAt: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
  }>;
}

const STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  { value: 'qualified', label: 'Qualified', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'proposal', label: 'Proposal', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'won', label: 'Won', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { value: 'nurturing', label: 'Nurturing', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
];

const TYPE_LABELS: Record<string, string> = {
  sale: 'Sale',
  partnership: 'Partnership',
  investment: 'Investment',
  referral: 'Referral',
  collaboration: 'Collaboration',
};

function formatCurrency(cents: number | null, currency = 'USD') {
  if (!cents) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const oppId = params.oppId as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editProbability, setEditProbability] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLostReason, setEditLostReason] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const practicesRes = await apiFetch('/api/practitioner/practices');
        if (!practicesRes.ok) throw new Error('Failed to load practice');
        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPracticeId(practices[0].id);

        const oppRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/labtools/pipeline/${oppId}`
        );
        if (!oppRes.ok) throw new Error('Failed to load opportunity');
        const { opportunity: o } = await oppRes.json();
        setOpportunity(o);
        setEditTitle(o.title);
        setEditStage(o.stage);
        setEditProbability(String(o.probability));
        setEditNotes(o.notes || '');
        setEditLostReason(o.lostReason || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, oppId]);

  const handleSave = async () => {
    if (!practiceId || !opportunity) return;

    setIsSaving(true);
    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/pipeline/${opportunity.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editTitle,
            stage: editStage,
            probability: parseInt(editProbability),
            notes: editNotes || null,
            lostReason: editStage === 'lost' ? editLostReason || null : null,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to update');

      setOpportunity(prev => prev ? {
        ...prev,
        title: editTitle,
        stage: editStage,
        probability: parseInt(editProbability),
        notes: editNotes || null,
        lostReason: editStage === 'lost' ? editLostReason || null : null,
      } : null);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!practiceId || !opportunity) return;
    if (!confirm('Delete this opportunity? This cannot be undone.')) return;

    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/pipeline/${opportunity.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/practitioner/labtools/pipeline');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (!practiceId || !opportunity) return;

    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/pipeline/${opportunity.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: newStage }),
        }
      );

      if (!res.ok) throw new Error('Failed to update');

      setOpportunity(prev => prev ? { ...prev, stage: newStage } : null);
      setEditStage(newStage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64" />
          <div className="h-32 bg-gray-800 rounded-lg" />
          <div className="h-48 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error || 'Opportunity not found'}</p>
        </div>
      </div>
    );
  }

  const stageInfo = STAGES.find(s => s.value === opportunity.stage) || STAGES[0];
  const weightedValue = opportunity.estimatedValueCents
    ? Math.round(opportunity.estimatedValueCents * opportunity.probability / 100)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/practitioner/labtools/pipeline')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-medium text-white bg-gray-800 border border-gray-700 rounded px-2 py-1"
              />
            ) : (
              <h1 className="text-xl font-medium text-white">{opportunity.title}</h1>
            )}
            <p className="text-sm text-gray-500 mt-0.5">
              {TYPE_LABELS[opportunity.opportunityType]} · {opportunity.probability}% probability
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </header>

      {/* Stage */}
      <div className="mb-6">
        {isEditing ? (
          <select
            value={editStage}
            onChange={(e) => setEditStage(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            {STAGES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        ) : (
          <div className="flex gap-2">
            {STAGES.filter(s => !['won', 'lost'].includes(s.value) || opportunity.stage === s.value).map(s => (
              <button
                key={s.value}
                onClick={() => handleStageChange(s.value)}
                className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                  opportunity.stage === s.value
                    ? s.color
                    : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Value Card */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Estimated Value</p>
            <p className="text-xl font-semibold text-green-400">
              {formatCurrency(opportunity.estimatedValueCents, opportunity.currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Probability</p>
            <p className="text-xl font-semibold text-white">
              {isEditing ? (
                <input
                  type="number"
                  value={editProbability}
                  onChange={(e) => setEditProbability(e.target.value)}
                  min="0"
                  max="100"
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
                />
              ) : (
                `${opportunity.probability}%`
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Weighted Value</p>
            <p className="text-xl font-semibold text-amber-400">
              {formatCurrency(weightedValue, opportunity.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Timeline</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Expected Close</span>
            <p className="text-white">{formatDate(opportunity.expectedCloseDate)}</p>
          </div>
          <div>
            <span className="text-gray-500">Source</span>
            <p className="text-white capitalize">{opportunity.source?.replace('_', ' ') || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Created</span>
            <p className="text-white">{formatDate(opportunity.createdAt)}</p>
          </div>
          <div>
            <span className="text-gray-500">Stage Changed</span>
            <p className="text-white">{formatDate(opportunity.stageChangedAt)}</p>
          </div>
        </div>
      </div>

      {/* Links */}
      {(opportunity.personName || opportunity.ventureName) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {opportunity.personName && opportunity.personId && (
            <Link
              href={`/practitioner/labtools/network/${opportunity.personId}`}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-amber-500/50"
            >
              Contact: {opportunity.personName}
              {opportunity.personCompany && ` (${opportunity.personCompany})`}
            </Link>
          )}
          {opportunity.ventureName && opportunity.ventureId && (
            <Link
              href={`/practitioner/labtools/ventures/${opportunity.ventureId}`}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-amber-500/50"
            >
              Venture: {opportunity.ventureName}
            </Link>
          )}
        </div>
      )}

      {/* Description */}
      {opportunity.description && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Description</h2>
          <p className="text-gray-300">{opportunity.description}</p>
        </div>
      )}

      {/* Notes */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-2">Notes</h2>
        {isEditing ? (
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            placeholder="Next steps, context, history..."
          />
        ) : (
          <p className="text-gray-300 whitespace-pre-wrap">{opportunity.notes || 'No notes'}</p>
        )}
      </div>

      {/* Lost Reason (if editing and stage is lost) */}
      {isEditing && editStage === 'lost' && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-red-400 mb-2">Lost Reason</h2>
          <textarea
            value={editLostReason}
            onChange={(e) => setEditLostReason(e.target.value)}
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            placeholder="Why was this opportunity lost?"
          />
        </div>
      )}

      {/* Lost Reason Display */}
      {!isEditing && opportunity.stage === 'lost' && opportunity.lostReason && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-red-400 mb-2">Lost Reason</h2>
          <p className="text-gray-300">{opportunity.lostReason}</p>
        </div>
      )}

      {/* Related Meetings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Meetings</h2>
          <Link
            href={`/practitioner/labtools/meetings/new?opportunityId=${opportunity.id}`}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            + Schedule
          </Link>
        </div>
        {opportunity.meetings.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No meetings yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {opportunity.meetings.map(meeting => (
              <Link
                key={meeting.id}
                href={`/practitioner/labtools/meetings/${meeting.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-700/30"
              >
                <div>
                  <p className="text-white">{meeting.title}</p>
                  <p className="text-xs text-gray-500">{meeting.meetingType}</p>
                </div>
                <span className="text-sm text-gray-400">{formatDate(meeting.scheduledStartAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Related Tasks */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Tasks</h2>
          <Link
            href={`/practitioner/tasks/new?opportunityId=${opportunity.id}`}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            + Add
          </Link>
        </div>
        {opportunity.tasks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No tasks yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {opportunity.tasks.map(task => (
              <Link
                key={task.id}
                href={`/practitioner/tasks/${task.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-700/30"
              >
                <div>
                  <p className="text-white">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.status}</p>
                </div>
                {task.dueDate && (
                  <span className="text-sm text-gray-400">{formatDate(task.dueDate)}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/practitioner/labtools/meetings/new?opportunityId=${opportunity.id}`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          + Schedule Meeting
        </Link>
        <Link
          href={`/practitioner/tasks/new?opportunityId=${opportunity.id}`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          + Add Task
        </Link>
      </div>
    </div>
  );
}
