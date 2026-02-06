'use client';

/**
 * Meeting Detail Page
 * View and manage a specific meeting
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
  location: string;
  locationDetails: string | null;
  ventureId: string | null;
  ventureName: string | null;
  opportunityId: string | null;
  opportunityTitle: string | null;
  agenda: string | null;
  notes: string | null;
  actionItems: string | null;
  attendees: Array<{
    id: string;
    personId: string | null;
    externalName: string | null;
    personName: string | null;
    personEmail: string | null;
    isOrganizer: boolean;
    rsvpStatus: string | null;
  }>;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  internal: 'Internal',
  partner: 'Partner',
  prospect: 'Prospect',
  vendor: 'Vendor',
  advisory: 'Advisory',
  presentation: 'Presentation',
  workshop: 'Workshop',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  rescheduled: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins < 60) return `${mins} minutes`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.meetingId as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editActionItems, setEditActionItems] = useState('');

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

        const meetingRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/labtools/meetings/${meetingId}`
        );
        if (!meetingRes.ok) throw new Error('Failed to load meeting');
        const { meeting: m } = await meetingRes.json();
        setMeeting(m);
        setEditNotes(m.notes || '');
        setEditActionItems(m.actionItems || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, meetingId]);

  const handleSaveNotes = async () => {
    if (!practiceId || !meeting) return;

    setIsSaving(true);
    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/meetings/${meeting.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: editNotes || null,
            actionItems: editActionItems || null,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to save');

      setMeeting(prev => prev ? {
        ...prev,
        notes: editNotes || null,
        actionItems: editActionItems || null,
      } : null);
      setIsEditingNotes(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!practiceId || !meeting) return;

    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/meetings/${meeting.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        }
      );

      if (!res.ok) throw new Error('Failed to update');

      setMeeting(prev => prev ? { ...prev, status: 'completed' } : null);
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
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error || 'Meeting not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/practitioner/labtools/meetings')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-medium text-white">{meeting.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {TYPE_LABELS[meeting.meetingType]} · {formatDuration(meeting.scheduledStartAt, meeting.scheduledEndAt)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm border ${STATUS_COLORS[meeting.status]}`}>
          {meeting.status}
        </span>
      </header>

      {/* Time & Location */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">When</span>
            <p className="text-white">{formatDateTime(meeting.scheduledStartAt)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Where</span>
            <p className="text-white capitalize">{meeting.location}</p>
            {meeting.locationDetails && (
              <p className="text-sm text-amber-400">{meeting.locationDetails}</p>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      {(meeting.ventureName || meeting.opportunityTitle) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {meeting.ventureName && meeting.ventureId && (
            <Link
              href={`/practitioner/labtools/ventures/${meeting.ventureId}`}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-amber-500/50"
            >
              Venture: {meeting.ventureName}
            </Link>
          )}
          {meeting.opportunityTitle && meeting.opportunityId && (
            <Link
              href={`/practitioner/labtools/pipeline/${meeting.opportunityId}`}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-amber-500/50"
            >
              Opportunity: {meeting.opportunityTitle}
            </Link>
          )}
        </div>
      )}

      {/* Agenda */}
      {meeting.agenda && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Agenda</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{meeting.agenda}</p>
        </div>
      )}

      {/* Notes */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-400">Notes</h2>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingNotes ? (
          <div className="space-y-4">
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Meeting notes..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            />
            <div>
              <label className="block text-sm text-gray-400 mb-1">Action Items</label>
              <textarea
                value={editActionItems}
                onChange={(e) => setEditActionItems(e.target.value)}
                placeholder="- Action item 1&#10;- Action item 2"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingNotes(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 whitespace-pre-wrap">{meeting.notes || 'No notes yet'}</p>
            {meeting.actionItems && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Action Items</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{meeting.actionItems}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Attendees */}
      {meeting.attendees.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Attendees</h2>
          <div className="space-y-2">
            {meeting.attendees.map(attendee => (
              <div key={attendee.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white">
                    {attendee.personName || attendee.externalName}
                    {attendee.isOrganizer && (
                      <span className="text-xs text-amber-400 ml-2">Organizer</span>
                    )}
                  </p>
                  {attendee.personEmail && (
                    <p className="text-xs text-gray-500">{attendee.personEmail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {meeting.status === 'scheduled' && (
        <div className="flex gap-3">
          <button
            onClick={handleMarkComplete}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm"
          >
            Mark Complete
          </button>
          <Link
            href={`/practitioner/tasks/new?meetingId=${meeting.id}`}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
          >
            + Add Task
          </Link>
        </div>
      )}
    </div>
  );
}
