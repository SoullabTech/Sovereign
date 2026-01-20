'use client';

/**
 * Container Transition Page
 * Move container through the state machine.
 *
 * Valid transitions:
 * - inquiry → active, declined, referred_out
 * - active → paused, closing
 * - paused → active, closing
 * - closing → completed, referred_out
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDevMemberId, withMemberHeader } from '@/lib/practitioner/memberClient';

const TRANSITIONS: Record<string, { label: string; to: string; description: string }[]> = {
  inquiry: [
    { label: 'Accept', to: 'active', description: 'Begin working with this person' },
    { label: 'Decline', to: 'declined', description: 'Not a fit at this time' },
    { label: 'Refer out', to: 'referred_out', description: 'Better served elsewhere' },
  ],
  active: [
    { label: 'Pause', to: 'paused', description: 'Temporary break in the work' },
    { label: 'Begin closing', to: 'closing', description: 'Start the ending process' },
  ],
  paused: [
    { label: 'Resume', to: 'active', description: 'Continue the work' },
    { label: 'Begin closing', to: 'closing', description: 'End the engagement' },
  ],
  closing: [
    { label: 'Complete', to: 'completed', description: 'Work is finished' },
    { label: 'Refer out', to: 'referred_out', description: 'Transitioning to another provider' },
  ],
};

export default function ContainerTransitionPage() {
  const router = useRouter();
  const params = useParams<{ containerId: string }>();
  const containerId = params.containerId;

  const [memberId, setMemberId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [containerScope, setContainerScope] = useState<string>('Container');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getDevMemberId();
    if (!id) {
      router.push('/signin');
      return;
    }
    setMemberId(id);
  }, [router]);

  // Load current container status
  useEffect(() => {
    if (!memberId) return;

    (async () => {
      const res = await fetch(`/api/practitioner/containers/${containerId}`, {
        headers: withMemberHeader(memberId),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentStatus(data.container?.status);
        setContainerScope(data.container?.scope || 'Container');
      }
    })();
  }, [memberId, containerId]);

  const handleTransition = async (toStatus: string) => {
    if (!memberId) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/practitioner/containers/${containerId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...withMemberHeader(memberId),
        },
        body: JSON.stringify({ toStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Transition failed');
      }

      router.push(`/practitioner/containers/${containerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transition failed');
    } finally {
      setSaving(false);
    }
  };

  const availableTransitions = currentStatus ? TRANSITIONS[currentStatus] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-stone-500 hover:text-stone-700 mb-4"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-light text-stone-800 mb-2">Transition Status</h1>
        <p className="text-stone-500 mb-6">{containerScope}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {currentStatus && (
          <div className="mb-6">
            <div className="text-sm text-stone-500 mb-2">Current status</div>
            <div className="inline-block px-3 py-1 rounded-full bg-stone-200 text-stone-700 font-medium capitalize">
              {currentStatus}
            </div>
          </div>
        )}

        {availableTransitions.length === 0 ? (
          <div className="bg-white rounded-lg border border-stone-200/60 p-5">
            <p className="text-stone-500">
              {currentStatus === 'completed' || currentStatus === 'declined' || currentStatus === 'referred_out'
                ? 'This container has reached a terminal state.'
                : 'No transitions available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableTransitions.map(transition => (
              <button
                key={transition.to}
                onClick={() => handleTransition(transition.to)}
                disabled={saving}
                className="w-full text-left p-4 bg-white rounded-lg border border-stone-200/60
                         hover:border-stone-300 hover:bg-stone-50 transition-colors
                         disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-stone-800">{transition.label}</div>
                    <div className="text-sm text-stone-500">{transition.description}</div>
                  </div>
                  <div className="text-sm text-stone-400">
                    → {transition.to}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md border border-stone-200 text-stone-600
                     hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
