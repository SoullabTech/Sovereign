'use client';

/**
 * Meetings List
 * View and manage business meetings
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  location: string | null;
  ventureName: string | null;
  opportunityTitle: string | null;
  attendeeCount: number;
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
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatDuration(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function MeetingCard({ meeting, onClick }: { meeting: Meeting; onClick: () => void }) {
  const isUpcoming = meeting.status === 'scheduled' &&
    new Date(meeting.scheduledStartAt) > new Date();
  const isPast = meeting.status === 'scheduled' &&
    new Date(meeting.scheduledStartAt) <= new Date();

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#111827] rounded-xl border border-gray-700 p-5
                 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-medium">{meeting.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${
          meeting.status === 'completed' ? 'bg-green-900/30 text-green-400' :
          meeting.status === 'scheduled' && isUpcoming ? 'bg-blue-900/30 text-blue-400' :
          meeting.status === 'canceled' ? 'bg-gray-700 text-gray-400' :
          isPast ? 'bg-amber-900/30 text-amber-400' :
          'bg-gray-700 text-gray-400'
        }`}>
          {isPast && meeting.status === 'scheduled' ? 'Past Due' : STATUS_LABELS[meeting.status]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
        <span>{MEETING_TYPE_LABELS[meeting.meetingType]}</span>
        <span className="text-gray-600">•</span>
        <span>{formatDuration(meeting.scheduledStartAt, meeting.scheduledEndAt)}</span>
        {meeting.attendeeCount > 0 && (
          <>
            <span className="text-gray-600">•</span>
            <span>{meeting.attendeeCount} attendee{meeting.attendeeCount !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>

      <div className="text-sm text-gray-500">
        {formatDateTime(meeting.scheduledStartAt)}
      </div>

      {(meeting.ventureName || meeting.location) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
          {meeting.ventureName && (
            <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
              {meeting.ventureName}
            </span>
          )}
          {meeting.location && (
            <span className="text-xs text-gray-500 truncate">
              {meeting.location}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export default function MeetingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'all' | 'completed' | 'missing_notes'>(
    (searchParams.get('filter') as 'missing_notes') || 'upcoming'
  );

  useEffect(() => {
    async function loadMeetings() {
      try {
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);
        const memberId = member.id;

        const practicesRes = await fetch('/api/practitioner/practices', {
          headers: { 'x-member-id': memberId }
        });

        if (!practicesRes.ok) throw new Error('Failed to load practices');

        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }

        const practice = practices[0];
        setPracticeId(practice.id);

        let queryParams = '';
        if (filter === 'upcoming') {
          queryParams = '?upcoming=true';
        } else if (filter === 'completed') {
          queryParams = '?status=completed';
        } else if (filter === 'missing_notes') {
          queryParams = '?filter=missing_notes';
        }

        const meetingsRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/meetings${queryParams}`,
          { headers: { 'x-member-id': memberId } }
        );

        if (!meetingsRes.ok) throw new Error('Failed to load meetings');

        const { meetings: meetingsData } = await meetingsRes.json();
        setMeetings(meetingsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meetings');
      } finally {
        setIsLoading(false);
      }
    }

    loadMeetings();
  }, [router, filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-800 rounded" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-gray-400">Meetings</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-white">Meetings</h1>
            <Link
              href="/practitioner/labtools/meetings/new"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                       rounded-lg transition-colors"
            >
              + Schedule Meeting
            </Link>
          </div>
        </header>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'all', label: 'All' },
            { key: 'completed', label: 'Completed' },
            { key: 'missing_notes', label: 'Missing Notes' }
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === key
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Meetings List */}
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === 'upcoming' ? 'No upcoming meetings' :
               filter === 'completed' ? 'No completed meetings' :
               filter === 'missing_notes' ? 'No meetings missing notes' :
               'No meetings yet'}
            </p>
            <Link
              href="/practitioner/labtools/meetings/new"
              className="text-blue-400 hover:text-blue-300"
            >
              Schedule your first meeting
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => router.push(`/practitioner/labtools/meetings/${meeting.id}`)}
              />
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="/practitioner/labtools"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            ← Back to Labtools
          </Link>
        </div>
      </div>
    </div>
  );
}
