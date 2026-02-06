'use client';

/**
 * Ventures List
 * View and manage business ventures/initiatives
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Venture {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  openTasks: number;
  upcomingMeetings: number;
  activeOpportunities: number;
  pipelineValueCents: number;
  createdAt: string;
}

const VENTURE_TYPE_LABELS: Record<string, string> = {
  maia_rd: 'MAIA R&D',
  soullab_rd: 'SoulLab R&D',
  marketing: 'Marketing',
  sales: 'Sales',
  partnerships: 'Partnerships',
  operations: 'Operations',
  content: 'Content',
  events: 'Events'
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function VentureCard({ venture, onClick }: { venture: Venture; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#111827] rounded-xl border border-gray-700 p-5
                 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{venture.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {VENTURE_TYPE_LABELS[venture.type] || venture.type}
          </p>
        </div>
        {!venture.isActive && (
          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded">
            Inactive
          </span>
        )}
      </div>

      {venture.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {venture.description}
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="py-2 bg-gray-800/50 rounded">
          <div className="text-sm font-medium text-white tabular-nums">
            {venture.openTasks}
          </div>
          <div className="text-xs text-gray-500">Tasks</div>
        </div>
        <div className="py-2 bg-gray-800/50 rounded">
          <div className="text-sm font-medium text-white tabular-nums">
            {venture.upcomingMeetings}
          </div>
          <div className="text-xs text-gray-500">Meetings</div>
        </div>
        <div className="py-2 bg-gray-800/50 rounded">
          <div className="text-sm font-medium text-white tabular-nums">
            {venture.activeOpportunities}
          </div>
          <div className="text-xs text-gray-500">Opps</div>
        </div>
        <div className="py-2 bg-gray-800/50 rounded">
          <div className="text-sm font-medium text-white tabular-nums">
            {formatCurrency(venture.pipelineValueCents)}
          </div>
          <div className="text-xs text-gray-500">Pipeline</div>
        </div>
      </div>
    </button>
  );
}

export default function VenturesPage() {
  const router = useRouter();
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

  useEffect(() => {
    async function loadVentures() {
      try {
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);
        const memberId = member.id;

        // Get practice
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

        // Load ventures
        const isActiveParam = filter === 'all' ? '' : `?isActive=${filter === 'active'}`;
        const venturesRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/ventures${isActiveParam}`,
          { headers: { 'x-member-id': memberId } }
        );

        if (!venturesRes.ok) throw new Error('Failed to load ventures');

        const { ventures: venturesData } = await venturesRes.json();
        setVentures(venturesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ventures');
      } finally {
        setIsLoading(false);
      }
    }

    loadVentures();
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
            <span className="text-gray-400">Ventures</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-white">Ventures</h1>
            <Link
              href="/practitioner/labtools/ventures/new"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                       rounded-lg transition-colors"
            >
              + New Venture
            </Link>
          </div>
        </header>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['active', 'all', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Ventures Grid */}
        {ventures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === 'active'
                ? 'No active ventures yet'
                : filter === 'inactive'
                ? 'No inactive ventures'
                : 'No ventures yet'}
            </p>
            <Link
              href="/practitioner/labtools/ventures/new"
              className="text-blue-400 hover:text-blue-300"
            >
              Create your first venture
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ventures.map((venture) => (
              <VentureCard
                key={venture.id}
                venture={venture}
                onClick={() => router.push(`/practitioner/labtools/ventures/${venture.id}`)}
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
