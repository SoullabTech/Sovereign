'use client';

/**
 * Meeting Detail
 * View and manage a single meeting with notes and action items
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Attendee {
  id: string;
  personId: string;
  displayName: string;
  email: string | null;
  company: string | null;
  role: string | null;
  isOrganizer: boolean;
  attendanceStatus: string;
}

interface ActionItem {
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
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  location: string | null;
  agenda: string | null;
  notes: string | null;
  outcomes: string | null;
  ventureId: string | null;
  ventureName: string | null;
  opportunityId: string | null;
  opportunityTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MeetingData {
  meeting: Meeting;
  attendees: Attendee[];
  actionItems: ActionItem[];
}

const MEETING_TYPE_LABELS: Record<string, string> = {
  internal: 'Internal',
  external: 'External',
  discovery: 'Discovery',
  followup: 'Follow-up',
  review: 'Review'
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  canceled: 'Canceled',
  no_show: 'No Show'
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatDuration(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours !== 1 ? 's' : ''}`;
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.meetingId as string;

  const [data, setData] = useState<MeetingData | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editOutcomes, setEditOutcomes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [newActionItem, setNewActionItem] = useState('');
  const [isAddingActionItem, setIsAddingActionItem] = useState(false);

  useEffect(() => {
    async function loadMeeting() {
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

        const meetingRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/meetings/${meetingId}`,
          { headers: { 'x-member-id': member.id } }
        );

        if (!meetingRes.ok) {
          if (meetingRes.status === 404) {
            throw new Error('Meeting not found');
          }
          throw new Error('Failed to load meeting');
        }

        const meetingData = await meetingRes.json();
        setData(meetingData);
        setEditNotes(meetingData.meeting.notes || '');
        setEditOutcomes(meetingData.meeting.outcomes || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meeting');
      } finally {
        setIsLoading(false);
      }
    }

    loadMeeting();
  }, [router, meetingId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!practiceId || !memberId || !data) return;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/meetings/${meetingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!res.ok) throw new Error('Failed to update status');

      const { meeting } = await res.json();
      setData({ ...data, meeting });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!practiceId || !memberId || !data) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/meetings/${meetingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            notes: editNotes.trim() || null,
            outcomes: editOutcomes.trim() || null
          })
        }
      );

      if (!res.ok) throw new Error('Failed to save notes');

      const { meeting } = await res.json();
      setData({ ...data, meeting });
      setIsEditingNotes(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddActionItem = async () => {
    if (!practiceId || !memberId || !newActionItem.trim()) return;

    setIsAddingActionItem(true);
    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/meetings/${meetingId}/action-items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            items: [{ title: newActionItem.trim() }]
          })
        }
      );

      if (!res.ok) throw new Error('Failed to add action item');

      const { tasks } = await res.json();
      if (data) {
        setData({
          ...data,
          actionItems: [...data.actionItems, ...tasks]
        });
      }
      setNewActionItem('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add action item');
    } finally {
      setIsAddingActionItem(false);
    }
  };

  const handleDelete = async () => {
    if (!practiceId || !memberId) return;
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/meetings/${meetingId}`,
        {
          method: 'DELETE',
          headers: { 'x-member-id': memberId }
        }
      );

      if (!res.ok) throw new Error('Failed to delete meeting');

      router.push('/practitioner/labtools/meetings');
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
            <p className="text-red-400">{error || 'Failed to load meeting'}</p>
          </div>
          <Link
            href="/practitioner/labtools/meetings"
            className="text-sm text-gray-500 hover:text-gray-400 mt-4 block"
          >
            ← Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  const { meeting, attendees, actionItems } = data;
  const isPast = new Date(meeting.scheduledStartAt) <= new Date();

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
            <Link href="/practitioner/labtools/meetings" className="hover:text-gray-400">
              Meetings
            </Link>
            <span>/</span>
            <span className="text-gray-400">{meeting.title}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-medium text-white mb-2">{meeting.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{MEETING_TYPE_LABELS[meeting.meetingType]}</span>
                <span className="text-gray-600">•</span>
                <span>{formatDuration(meeting.scheduledStartAt, meeting.scheduledEndAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {meeting.status === 'scheduled' && isPast && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white
                           rounded-lg transition-colors"
                >
                  Mark Completed
                </button>
              )}
              <select
                value={meeting.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg
                         text-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>
        </header>

        {/* Meeting Details */}
        <section className="mb-8">
          <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">When</div>
                <div className="text-gray-300">{formatDateTime(meeting.scheduledStartAt)}</div>
              </div>

              {meeting.location && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
                  <div className="text-gray-300">{meeting.location}</div>
                </div>
              )}

              {meeting.ventureName && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Venture</div>
                  <Link
                    href={`/practitioner/labtools/ventures/${meeting.ventureId}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {meeting.ventureName}
                  </Link>
                </div>
              )}

              {meeting.opportunityTitle && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Opportunity</div>
                  <Link
                    href={`/practitioner/labtools/pipeline/${meeting.opportunityId}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {meeting.opportunityTitle}
                  </Link>
                </div>
              )}

              {meeting.agenda && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Agenda</div>
                  <div className="text-gray-300 whitespace-pre-wrap">{meeting.agenda}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Notes & Outcomes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              Notes & Outcomes
            </h2>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {meeting.notes ? 'Edit' : '+ Add Notes'}
              </button>
            )}
          </div>

          <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
            {isEditingNotes ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Meeting notes..."
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                             text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                             resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Outcomes</label>
                  <textarea
                    value={editOutcomes}
                    onChange={(e) => setEditOutcomes(e.target.value)}
                    placeholder="Key outcomes and decisions..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                             text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                             resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                             rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNotes(false);
                      setEditNotes(meeting.notes || '');
                      setEditOutcomes(meeting.outcomes || '');
                    }}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {meeting.notes ? (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Notes</div>
                    <div className="text-gray-300 whitespace-pre-wrap">{meeting.notes}</div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No notes yet</p>
                )}
                {meeting.outcomes && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">Outcomes</div>
                    <div className="text-gray-300 whitespace-pre-wrap">{meeting.outcomes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Action Items */}
        <section className="mb-8">
          <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
            Action Items ({actionItems.length})
          </h2>

          <div className="bg-[#111827] rounded-xl border border-gray-700 divide-y divide-gray-700">
            {actionItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No action items yet
              </div>
            ) : (
              actionItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      item.status === 'done' ? 'bg-green-400' : 'bg-gray-500'
                    }`} />
                    <span className={item.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-300'}>
                      {item.title}
                    </span>
                  </div>
                  {item.dueAt && (
                    <span className="text-xs text-gray-500">
                      Due {new Date(item.dueAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))
            )}

            {/* Add Action Item */}
            <div className="p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  placeholder="Add action item..."
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                           text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                           text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newActionItem.trim()) {
                      handleAddActionItem();
                    }
                  }}
                />
                <button
                  onClick={handleAddActionItem}
                  disabled={isAddingActionItem || !newActionItem.trim()}
                  className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white
                           rounded-lg transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Attendees */}
        {attendees.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
              Attendees ({attendees.length})
            </h2>
            <div className="bg-[#111827] rounded-xl border border-gray-700 divide-y divide-gray-700">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-gray-300">{attendee.displayName}</span>
                    {attendee.company && (
                      <span className="text-gray-500 text-sm ml-2">
                        {attendee.company}
                      </span>
                    )}
                    {attendee.isOrganizer && (
                      <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded ml-2">
                        Organizer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
            Delete Meeting
          </button>
        </section>

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="/practitioner/labtools/meetings"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            ← Back to Meetings
          </Link>
        </div>
      </div>
    </div>
  );
}
