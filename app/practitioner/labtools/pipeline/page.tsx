'use client';

/**
 * Pipeline Page
 * View and manage opportunities/deals
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  stage: string;
  valueCents: number;
  currency: string;
  expectedCloseAt: string | null;
  ventureName: string | null;
  personName: string | null;
  personCompany: string | null;
  updatedAt: string;
}

const STAGES = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' }
];

const ACTIVE_STAGES = ['lead', 'qualified', 'proposal', 'negotiation'];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function OpportunityCard({
  opportunity,
  onClick,
  onStageChange
}: {
  opportunity: Opportunity;
  onClick: () => void;
  onStageChange: (stage: string) => void;
}) {
  const isActive = ACTIVE_STAGES.includes(opportunity.stage);
  const isStalled = isActive &&
    new Date(opportunity.updatedAt) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  return (
    <div
      className={`bg-[#111827] rounded-xl border p-4 transition-colors ${
        isStalled ? 'border-amber-500/30' : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-medium">{opportunity.title}</h3>
          <span className="text-sm font-medium text-white tabular-nums">
            {formatCurrency(opportunity.valueCents)}
          </span>
        </div>

        {(opportunity.personName || opportunity.personCompany) && (
          <p className="text-sm text-gray-400 mb-2">
            {opportunity.personName}
            {opportunity.personCompany && (
              <span className="text-gray-500"> • {opportunity.personCompany}</span>
            )}
          </p>
        )}

        {opportunity.ventureName && (
          <span className="inline-block text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded mb-2">
            {opportunity.ventureName}
          </span>
        )}

        {isStalled && (
          <div className="text-xs text-amber-400 mt-2">
            Stalled - no updates in 14+ days
          </div>
        )}
      </button>

      {/* Quick stage change */}
      {isActive && (
        <div className="flex gap-1 mt-3 pt-3 border-t border-gray-700">
          {STAGES.filter(s => s.key !== opportunity.stage && ACTIVE_STAGES.includes(s.key)).slice(0, 2).map(s => (
            <button
              key={s.key}
              onClick={(e) => {
                e.stopPropagation();
                onStageChange(s.key);
              }}
              className="text-xs px-2 py-1 text-gray-500 hover:text-white hover:bg-gray-700
                       rounded transition-colors"
            >
              → {s.label}
            </button>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStageChange('won');
            }}
            className="text-xs px-2 py-1 text-green-500 hover:text-green-400 hover:bg-green-900/20
                     rounded transition-colors"
          >
            Won
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStageChange('lost');
            }}
            className="text-xs px-2 py-1 text-gray-500 hover:text-gray-400 hover:bg-gray-700
                     rounded transition-colors"
          >
            Lost
          </button>
        </div>
      )}
    </div>
  );
}

function PipelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('list');
  const [filter, setFilter] = useState<'active' | 'all' | 'won' | 'lost' | 'stalled'>(
    (searchParams.get('filter') as 'stalled') || 'active'
  );

  useEffect(() => {
    async function loadPipeline() {
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

        let queryParams = '';
        if (filter === 'active') queryParams = '?active=true';
        else if (filter === 'won') queryParams = '?stage=won';
        else if (filter === 'lost') queryParams = '?stage=lost';
        else if (filter === 'stalled') queryParams = '?filter=stalled';

        const oppsRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/opportunities${queryParams}`,
          { headers: { 'x-member-id': member.id } }
        );

        if (!oppsRes.ok) throw new Error('Failed to load pipeline');

        const { opportunities: oppsData } = await oppsRes.json();
        setOpportunities(oppsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pipeline');
      } finally {
        setIsLoading(false);
      }
    }

    loadPipeline();
  }, [router, filter]);

  const handleStageChange = async (opportunityId: string, newStage: string) => {
    if (!practiceId || !memberId) return;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/opportunities/${opportunityId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({ stage: newStage })
        }
      );

      if (!res.ok) throw new Error('Failed to update stage');

      // Update local state
      setOpportunities(prev =>
        prev.map(o =>
          o.id === opportunityId ? { ...o, stage: newStage, updatedAt: new Date().toISOString() } : o
        ).filter(o =>
          filter === 'all' ||
          (filter === 'active' && ACTIVE_STAGES.includes(o.stage)) ||
          (filter === 'won' && o.stage === 'won') ||
          (filter === 'lost' && o.stage === 'lost')
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const totalValue = opportunities
    .filter(o => ACTIVE_STAGES.includes(o.stage))
    .reduce((sum, o) => sum + o.valueCents, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Group by stage for kanban view
  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage.key] = opportunities.filter(o => o.stage === stage.key);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/practitioner/labtools" className="hover:text-gray-400">
              Labtools
            </Link>
            <span>/</span>
            <span className="text-gray-400">Pipeline</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-white">Pipeline</h1>
              <p className="text-sm text-gray-500 mt-1">
                {opportunities.length} opportunities • {formatCurrency(totalValue)} active value
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1 text-sm rounded ${
                    view === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1 text-sm rounded ${
                    view === 'kanban' ? 'bg-gray-700 text-white' : 'text-gray-400'
                  }`}
                >
                  Kanban
                </button>
              </div>
              <Link
                href="/practitioner/labtools/pipeline/new"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                         rounded-lg transition-colors"
              >
                + Add Opportunity
              </Link>
            </div>
          </div>
        </header>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'active', label: 'Active' },
            { key: 'all', label: 'All' },
            { key: 'won', label: 'Won' },
            { key: 'lost', label: 'Lost' },
            { key: 'stalled', label: 'Stalled' }
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

        {/* Content */}
        {opportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === 'active' ? 'No active opportunities' :
               filter === 'won' ? 'No won deals yet' :
               filter === 'lost' ? 'No lost deals' :
               filter === 'stalled' ? 'No stalled opportunities' :
               'No opportunities yet'}
            </p>
            <Link
              href="/practitioner/labtools/pipeline/new"
              className="text-blue-400 hover:text-blue-300"
            >
              Create your first opportunity
            </Link>
          </div>
        ) : view === 'kanban' ? (
          /* Kanban View */
          <div className="grid grid-cols-4 gap-4 overflow-x-auto">
            {STAGES.filter(s => filter === 'all' || ACTIVE_STAGES.includes(s.key) || s.key === `closed_${filter}`).slice(0, 4).map(stage => (
              <div key={stage.key} className="min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-400">{stage.label}</h3>
                  <span className="text-xs text-gray-500">{byStage[stage.key]?.length || 0}</span>
                </div>
                <div className="space-y-3">
                  {byStage[stage.key]?.map(opp => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onClick={() => router.push(`/practitioner/labtools/pipeline/${opp.id}`)}
                      onStageChange={(s) => handleStageChange(opp.id, s)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {opportunities.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onClick={() => router.push(`/practitioner/labtools/pipeline/${opp.id}`)}
                onStageChange={(s) => handleStageChange(opp.id, s)}
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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-800 rounded" />
          <div className="h-24 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PipelineContent />
    </Suspense>
  );
}
