'use client';

/**
 * Meetings Page
 * Business meetings list
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Meeting {
  id: string;
  title: string;
  meetingType: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  location: string;
  ventureName: string | null;
  opportunityTitle: string | null;
  attendeeCount: number;
}

const MEETING_TYPES = [
  { value: 'internal', label: 'Internal' },
  { value: 'partner', label: 'Partner' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_COLORS: Record<string, string> = {
  internal: 'bg-blue-500/20 text-blue-300',
  partner: 'bg-purple-500/20 text-purple-300',
  prospect: 'bg-amber-500/20 text-amber-300',
  vendor: 'bg-cyan-500/20 text-cyan-300',
  advisory: 'bg-green-500/20 text-green-300',
  presentation: 'bg-pink-500/20 text-pink-300',
  workshop: 'bg-orange-500/20 text-orange-300',
  other: 'bg-gray-500/20 text-gray-300',
};

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

function MeetingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || 'scheduled';

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        let url = `/api/practitioner/practices/${practices[0].id}/labtools/meetings`;
        const params = new URLSearchParams();
        if (typeFilter) params.set('type', typeFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (statusFilter === 'scheduled') params.set('upcoming', 'true');
        if (params.toString()) url += `?${params.toString()}`;

        const meetingsRes = await apiFetch(url);
        if (!meetingsRes.ok) throw new Error('Failed to load meetings');
        const { meetings: meetingList } = await meetingsRes.json();
        setMeetings(meetingList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, typeFilter, statusFilter]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/practitioner/labtools/meetings?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-12 bg-gray-800 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-white">Meetings</h1>
        <Link
          href="/practitioner/labtools/meetings/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-colors"
        >
          + Schedule Meeting
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status Pills */}
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => updateFilter('status', s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                statusFilter === s.value
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
        >
          <option value="">All Types</option>
          {MEETING_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500">No meetings found</p>
          <Link
            href="/practitioner/labtools/meetings/new"
            className="text-sm text-amber-400 hover:underline mt-2 inline-block"
          >
            Schedule your first meeting
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(meeting => (
            <Link
              key={meeting.id}
              href={`/practitioner/labtools/meetings/${meeting.id}`}
              className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{meeting.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${TYPE_COLORS[meeting.meetingType] || TYPE_COLORS.other}`}>
                      {meeting.meetingType}
                    </span>
                  </div>
                  <p className="text-sm text-amber-400 mt-1">
                    {formatDateTime(meeting.scheduledStartAt)}
                    <span className="text-gray-500 ml-2">
                      · {formatDuration(meeting.scheduledStartAt, meeting.scheduledEndAt)}
                    </span>
                  </p>
                  {(meeting.ventureName || meeting.opportunityTitle) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {meeting.ventureName && `Venture: ${meeting.ventureName}`}
                      {meeting.ventureName && meeting.opportunityTitle && ' · '}
                      {meeting.opportunityTitle && `Opp: ${meeting.opportunityTitle}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {meeting.attendeeCount > 0 && (
                    <span>{meeting.attendeeCount} attendees</span>
                  )}
                  <span className="capitalize">{meeting.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-12 bg-gray-800 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    }>
      <MeetingsContent />
    </Suspense>
  );
}
