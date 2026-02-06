'use client';

/**
 * New Meeting
 * Schedule a new business meeting
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Venture {
  id: string;
  name: string;
}

interface Opportunity {
  id: string;
  title: string;
}

const MEETING_TYPES = [
  { value: 'internal', label: 'Internal', description: 'Team/internal meeting' },
  { value: 'partner', label: 'Partner', description: 'Partner meeting' },
  { value: 'prospect', label: 'Prospect', description: 'Prospect meeting' },
  { value: 'vendor', label: 'Vendor', description: 'Vendor meeting' },
  { value: 'advisory', label: 'Advisory', description: 'Advisory call' },
  { value: 'presentation', label: 'Presentation', description: 'Presentation' },
  { value: 'workshop', label: 'Workshop', description: 'Workshop session' },
  { value: 'other', label: 'Other', description: 'Other meeting' }
];

function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function NewMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVentureId = searchParams.get('ventureId');
  const preselectedOpportunityId = searchParams.get('opportunityId');

  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ventures, setVentures] = useState<Venture[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('other');
  const [scheduledStartAt, setScheduledStartAt] = useState('');
  const [scheduledEndAt, setScheduledEndAt] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [ventureId, setVentureId] = useState(preselectedVentureId || '');
  const [opportunityId, setOpportunityId] = useState(preselectedOpportunityId || '');

  useEffect(() => {
    async function init() {
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

        // Load ventures
        const venturesRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/ventures?isActive=true`,
          { headers: { 'x-member-id': member.id } }
        );
        if (venturesRes.ok) {
          const { ventures: v } = await venturesRes.json();
          setVentures(v);
        }

        // Load opportunities
        const oppsRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/opportunities`,
          { headers: { 'x-member-id': member.id } }
        );
        if (oppsRes.ok) {
          const { opportunities: o } = await oppsRes.json();
          setOpportunities(o);
        }

        // Set default times (next hour, 1 hour duration)
        const now = new Date();
        now.setMinutes(0, 0, 0);
        now.setHours(now.getHours() + 1);
        const end = new Date(now);
        end.setHours(end.getHours() + 1);

        setScheduledStartAt(formatDateTimeLocal(now));
        setScheduledEndAt(formatDateTimeLocal(end));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router, preselectedVentureId, preselectedOpportunityId]);

  const handleStartTimeChange = (newStart: string) => {
    setScheduledStartAt(newStart);
    // Auto-adjust end time to maintain 1 hour duration if end is before start
    const start = new Date(newStart);
    const end = new Date(scheduledEndAt);
    if (end <= start) {
      const newEnd = new Date(start);
      newEnd.setHours(newEnd.getHours() + 1);
      setScheduledEndAt(formatDateTimeLocal(newEnd));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!practiceId || !memberId) return;
    if (!title.trim() || !scheduledStartAt || !scheduledEndAt) {
      setError('Title and schedule times are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/meetings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            title: title.trim(),
            meetingType,
            scheduledStartAt: new Date(scheduledStartAt).toISOString(),
            scheduledEndAt: new Date(scheduledEndAt).toISOString(),
            location: location.trim() || null,
            agenda: agenda.trim() || null,
            ventureId: ventureId || null,
            opportunityId: opportunityId || null
          })
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create meeting');
      }

      const { meeting } = await res.json();
      router.push(`/practitioner/labtools/meetings/${meeting.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="h-96 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
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
            <span className="text-gray-400">New</span>
          </div>
          <h1 className="text-xl font-medium text-white">Schedule Meeting</h1>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-[#111827] rounded-xl border border-gray-700 p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Product Review with Team"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Meeting Type */}
            <div>
              <label htmlFor="meetingType" className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                id="meetingType"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white focus:outline-none focus:border-blue-500"
                required
              >
                {MEETING_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label} - {mt.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">
                  Start *
                </label>
                <input
                  id="startTime"
                  type="datetime-local"
                  value={scheduledStartAt}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">
                  End *
                </label>
                <input
                  id="endTime"
                  type="datetime-local"
                  value={scheduledEndAt}
                  onChange={(e) => setScheduledEndAt(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location / Link
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Zoom link or office address"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Agenda */}
            <div>
              <label htmlFor="agenda" className="block text-sm font-medium text-gray-300 mb-2">
                Agenda
              </label>
              <textarea
                id="agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Meeting topics and objectives..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                         resize-none"
              />
            </div>

            {/* Link to Venture */}
            {ventures.length > 0 && (
              <div>
                <label htmlFor="venture" className="block text-sm font-medium text-gray-300 mb-2">
                  Link to Venture
                </label>
                <select
                  id="venture"
                  value={ventureId}
                  onChange={(e) => setVentureId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  {ventures.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Link to Opportunity */}
            {opportunities.length > 0 && (
              <div>
                <label htmlFor="opportunity" className="block text-sm font-medium text-gray-300 mb-2">
                  Link to Opportunity
                </label>
                <select
                  id="opportunity"
                  value={opportunityId}
                  onChange={(e) => setOpportunityId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/practitioner/labtools/meetings"
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                       rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
        <div className="h-96 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export default function NewMeetingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewMeetingContent />
    </Suspense>
  );
}
