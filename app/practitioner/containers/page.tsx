'use client';

/**
 * Containers List Page
 * View and filter relational commitments (not contacts).
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDevMemberId, withMemberHeader } from '@/lib/practitioner/memberClient';

type Participant = {
  id: string;
  personId: string;
  displayName: string;
  role: string;
};

type ContainerRow = {
  id: string;
  type: string;
  status: string;
  scope: string | null;
  participants: Participant[];
  nextSession: { id: string; scheduledStartAt: string } | null;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'closing', label: 'Closing' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
  { value: 'referred_out', label: 'Referred out' },
];

function getContainerTitle(container: ContainerRow): string {
  if (container.scope) return container.scope;
  if (container.participants.length > 0) {
    return container.participants.map(p => p.displayName).join(', ');
  }
  return '(Untitled container)';
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ContainersListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'active';

  const [memberId, setMemberId] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(initialStatus);
  const [q, setQ] = useState('');
  const [containers, setContainers] = useState<ContainerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getDevMemberId();
    if (!id) {
      router.push('/signin');
      return;
    }
    setMemberId(id);
  }, [router]);

  // Load practice
  useEffect(() => {
    if (!memberId) return;

    (async () => {
      const res = await fetch('/api/practitioner/practices', {
        headers: withMemberHeader(memberId),
      });
      const { practices } = await res.json();
      setPracticeId(practices?.[0]?.id ?? null);
    })();
  }, [memberId]);

  // Load containers
  useEffect(() => {
    if (!memberId || !practiceId) return;

    (async () => {
      setLoading(true);

      const url = new URL(
        `/api/practitioner/practices/${practiceId}/containers`,
        window.location.origin
      );
      if (status) url.searchParams.set('status', status);
      if (q) url.searchParams.set('q', q);

      const res = await fetch(url.toString(), {
        headers: withMemberHeader(memberId),
      });
      const data = await res.json();
      setContainers(data?.containers ?? []);
      setLoading(false);
    })();
  }, [memberId, practiceId, status, q]);

  // Update URL when status changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    router.push(`/practitioner/containers?status=${newStatus}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => router.push('/practitioner/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-300 mb-2"
            >
              ← Dashboard
            </button>
            <h1 className="text-2xl font-medium text-white">Containers</h1>
            <p className="text-sm text-gray-500">Relational commitments, not contacts.</p>
          </div>

          <button
            className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
            onClick={() => router.push('/practitioner/containers/new')}
          >
            + New container
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  status === opt.value
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name or scope..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700
                     text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Container List */}
        <div className="bg-[#111827] rounded-xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-500">Loading...</div>
          ) : containers.length === 0 ? (
            <div className="p-6 text-gray-500">
              No {status} containers found.
              {status !== 'inquiry' && (
                <button
                  onClick={() => handleStatusChange('inquiry')}
                  className="ml-2 text-amber-400 hover:underline"
                >
                  Check inquiries?
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {containers.map(container => (
                <button
                  key={container.id}
                  onClick={() => router.push(`/practitioner/containers/${container.id}`)}
                  className="w-full text-left p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate">
                        {getContainerTitle(container)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="capitalize">{container.type}</span>
                        {container.participants.length > 0 && (
                          <>
                            <span>·</span>
                            <span>
                              {container.participants.map(p => p.displayName).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {container.nextSession ? (
                        <div className="text-sm">
                          <div className="text-gray-400">Next session</div>
                          <div className="text-gray-500">
                            {formatRelativeDate(container.nextSession.scheduledStartAt)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 italic">
                          No session scheduled
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContainersListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-gray-500">Loading containers...</div>
        </div>
      </div>
    }>
      <ContainersListContent />
    </Suspense>
  );
}
