'use client';

/**
 * New Session Page
 * Create a session with optional note.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDevMemberId, withMemberHeader } from '@/lib/practitioner/memberClient';

export default function NewSessionPage() {
  const router = useRouter();
  const params = useParams<{ containerId: string }>();
  const containerId = params.containerId;

  const [memberId, setMemberId] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState<string>('');
  const [durationMin, setDurationMin] = useState<number>(60);
  const [sessionType, setSessionType] = useState<string>('session');
  const [location, setLocation] = useState<string>('video');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getDevMemberId();
    if (!id) {
      router.push('/signin');
      return;
    }
    setMemberId(id);

    // Default to now + 1 hour, rounded to nearest 15 min
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    setStartsAt(now.toISOString().slice(0, 16));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !startsAt) return;

    setSaving(true);
    setError(null);

    try {
      const startDate = new Date(startsAt);
      const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);

      const res = await fetch(`/api/practitioner/containers/${containerId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...withMemberHeader(memberId),
        },
        body: JSON.stringify({
          scheduledStartAt: startDate.toISOString(),
          scheduledEndAt: endDate.toISOString(),
          sessionType,
          location,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create session');
      }

      router.push(`/practitioner/containers/${containerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-300 mb-4"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-medium text-white mb-6">New Session</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111827] rounded-xl border border-gray-700 p-5 space-y-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start time
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900
                         text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={durationMin}
                onChange={e => setDurationMin(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900
                         text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={75}>75 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session type
              </label>
              <select
                value={sessionType}
                onChange={e => setSessionType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900
                         text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="session">Regular session</option>
                <option value="intake">Intake / Discovery</option>
                <option value="closing">Closing session</option>
                <option value="check_in">Check-in</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900
                         text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="video">Video call</option>
                <option value="in_person">In-person</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300
                       hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !startsAt}
              className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium
                       hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
