'use client';

/**
 * New Meeting Page
 * Schedule a business meeting
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Venture {
  id: string;
  name: string;
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

const LOCATIONS = [
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In Person' },
];

const DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '90 minutes' },
  { value: 120, label: '2 hours' },
];

function NewMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVentureId = searchParams.get('ventureId');
  const preselectedPersonId = searchParams.get('personId');

  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('other');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('video');
  const [locationDetails, setLocationDetails] = useState('');
  const [ventureId, setVentureId] = useState(preselectedVentureId || '');
  const [agenda, setAgenda] = useState('');

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

        // Load ventures for linking
        const venturesRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/labtools/ventures?status=active,planning`
        );
        if (venturesRes.ok) {
          const { ventures: ventureList } = await venturesRes.json();
          setVentures(ventureList);
        }

        // Set default date to today
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, preselectedVentureId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceId || !title.trim() || !date || !time) {
      setError('Title, date, and time are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const startAt = new Date(`${date}T${time}`);
      const endAt = new Date(startAt.getTime() + duration * 60000);

      const res = await apiFetch(`/api/practitioner/practices/${practiceId}/labtools/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          meetingType,
          scheduledStartAt: startAt.toISOString(),
          scheduledEndAt: endAt.toISOString(),
          location,
          locationDetails: locationDetails.trim() || null,
          ventureId: ventureId || null,
          agenda: agenda.trim() || null,
        }),
      });

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-800 rounded" />
            <div className="h-12 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-white">Schedule Meeting</h1>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's this meeting about?"
            required
            autoFocus
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Type & Venture */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              {MEETING_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Related Venture
            </label>
            <select
              value={ventureId}
              onChange={(e) => setVentureId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="">None</option>
              {ventures.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              {DURATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <div className="flex gap-3 mb-3">
            {LOCATIONS.map(l => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLocation(l.value)}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  location === l.value
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            placeholder={location === 'video' ? 'Zoom/Meet link' : location === 'in_person' ? 'Address' : 'Phone number'}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500"
          />
        </div>

        {/* Agenda */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Agenda
          </label>
          <textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="Topics to discuss..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !title.trim() || !date || !time}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700
                     disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            {isSaving ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewMeetingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-800 rounded" />
            <div className="h-12 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    }>
      <NewMeetingContent />
    </Suspense>
  );
}
