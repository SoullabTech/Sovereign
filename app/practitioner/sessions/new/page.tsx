'use client';

/**
 * New Session Page
 * Create a new session for a container
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Container {
  id: string;
  scope: string | null;
  type: string;
  participants: Array<{ displayName: string }>;
}

interface Practice {
  id: string;
  name: string;
  timezone: string;
}

const SESSION_TYPES = [
  { value: 'session', label: 'Regular Session' },
  { value: 'intake', label: 'Intake' },
  { value: 'closing', label: 'Closing Session' },
  { value: 'check_in', label: 'Check-in' },
];

const LOCATIONS = [
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In Person' },
];

const DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 50, label: '50 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 75, label: '75 minutes' },
  { value: 90, label: '90 minutes' },
];

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContainerId = searchParams.get('containerId');

  const [practice, setPractice] = useState<Practice | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [containerId, setContainerId] = useState(preselectedContainerId || '');
  const [sessionType, setSessionType] = useState('session');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(50);
  const [location, setLocation] = useState('video');

  useEffect(() => {
    async function loadData() {
      try {
        // Get practice
        const practicesRes = await apiFetch('/api/practitioner/practices');
        if (!practicesRes.ok) throw new Error('Failed to load practice');
        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPractice(practices[0]);

        // Get containers (active ones)
        const containersRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/containers?status=active,inquiry`
        );
        if (!containersRes.ok) throw new Error('Failed to load containers');
        const { containers: containerList } = await containersRes.json();
        setContainers(containerList);

        // Default to today
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setTime('10:00');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerId || !date || !time) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const startAt = new Date(`${date}T${time}`);
      const endAt = new Date(startAt.getTime() + duration * 60000);

      const res = await apiFetch(`/api/practitioner/containers/${containerId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType,
          scheduledStartAt: startAt.toISOString(),
          scheduledEndAt: endAt.toISOString(),
          location
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const { session } = await res.json();
      router.push(`/practitioner/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsSaving(false);
    }
  };

  const getContainerLabel = (c: Container) => {
    if (c.scope) return c.scope;
    if (c.participants.length > 0) {
      return c.participants.map(p => p.displayName).join(', ');
    }
    return `${c.type} container`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-800 rounded" />
              <div className="h-12 bg-gray-800 rounded" />
              <div className="h-12 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-white">Schedule Session</h1>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Container Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Container *
            </label>
            <select
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              <option value="">Select a container...</option>
              {containers.map(c => (
                <option key={c.id} value={c.id}>
                  {getContainerLabel(c)}
                </option>
              ))}
            </select>
            {containers.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No active containers. <a href="/practitioner/containers/new" className="text-amber-500 hover:underline">Create one</a> first.
              </p>
            )}
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              {SESSION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                         text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                         text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              {DURATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <div className="flex gap-3">
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
              disabled={isSaving || !containerId}
              className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700
                       disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              {isSaving ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
