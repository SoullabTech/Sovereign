'use client';

/**
 * Pipeline Page
 * Kanban-style view of opportunities
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  opportunityType: string;
  stage: string;
  estimatedValueCents: number | null;
  probability: number;
  expectedCloseDate: string | null;
  personId: string | null;
  personName: string | null;
  ventureId: string | null;
  ventureName: string | null;
  stageChangedAt: string;
  createdAt: string;
}

interface PipelineStats {
  activeCount: number;
  totalValue: number | null;
  weightedValue: number | null;
}

const STAGES = [
  { value: 'lead', label: 'Lead', color: 'border-gray-500' },
  { value: 'qualified', label: 'Qualified', color: 'border-blue-500' },
  { value: 'proposal', label: 'Proposal', color: 'border-purple-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'border-amber-500' },
  { value: 'won', label: 'Won', color: 'border-green-500' },
  { value: 'lost', label: 'Lost', color: 'border-red-500' },
  { value: 'nurturing', label: 'Nurturing', color: 'border-cyan-500' },
];

const TYPE_LABELS: Record<string, string> = {
  sale: 'Sale',
  partnership: 'Partnership',
  investment: 'Investment',
  referral: 'Referral',
  collaboration: 'Collaboration',
};

function formatCurrency(cents: number | null) {
  if (!cents) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function PipelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get('view') || 'kanban';
  const typeFilter = searchParams.get('type') || 'all';

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
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

        const typeParam = typeFilter !== 'all' ? `&type=${typeFilter}` : '';
        const pipelineRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/labtools/pipeline?${typeParam}`
        );
        if (!pipelineRes.ok) throw new Error('Failed to load pipeline');
        const { opportunities: opps, stats: s } = await pipelineRes.json();
        setOpportunities(opps);
        setStats(s);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, typeFilter]);

  const handleStageChange = async (oppId: string, newStage: string) => {
    if (!practiceId) return;

    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/pipeline/${oppId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: newStage }),
        }
      );

      if (!res.ok) throw new Error('Failed to update');

      setOpportunities(prev =>
        prev.map(o => (o.id === oppId ? { ...o, stage: newStage } : o))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // Group opportunities by stage
  const opportunitiesByStage = STAGES.reduce((acc, stage) => {
    acc[stage.value] = opportunities.filter(o => o.stage === stage.value);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-white">Pipeline</h2>
          {stats && (
            <p className="text-sm text-gray-500 mt-1">
              {stats.activeCount} active · {formatCurrency(stats.weightedValue)} weighted value
            </p>
          )}
        </div>
        <Link
          href="/practitioner/labtools/pipeline/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm"
        >
          + New Opportunity
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          {['kanban', 'list'].map(mode => (
            <button
              key={mode}
              onClick={() => router.push(`/practitioner/labtools/pipeline?view=${mode}&type=${typeFilter}`)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                viewMode === mode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => router.push(`/practitioner/labtools/pipeline?view=${viewMode}&type=${e.target.value}`)}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
        >
          <option value="all">All Types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {opportunities.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">No opportunities yet</p>
          <Link
            href="/practitioner/labtools/pipeline/new"
            className="inline-block mt-4 text-amber-400 hover:text-amber-300"
          >
            Create your first opportunity →
          </Link>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-7 gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <div key={stage.value} className="min-w-[200px]">
              <div className={`border-t-2 ${stage.color} bg-gray-800/50 rounded-lg`}>
                <div className="p-3 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-white">{stage.label}</h3>
                  <p className="text-xs text-gray-500">{opportunitiesByStage[stage.value].length}</p>
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {opportunitiesByStage[stage.value].map(opp => (
                    <Link
                      key={opp.id}
                      href={`/practitioner/labtools/pipeline/${opp.id}`}
                      className="block bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-amber-500/50 transition-colors"
                    >
                      <p className="text-sm text-white font-medium truncate">{opp.title}</p>
                      {opp.personName && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{opp.personName}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-green-400">
                          {formatCurrency(opp.estimatedValueCents)}
                        </span>
                        {opp.expectedCloseDate && (
                          <span className="text-xs text-gray-500">{formatDate(opp.expectedCloseDate)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Opportunity</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Stage</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Value</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Close Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {opportunities.map(opp => (
                <tr
                  key={opp.id}
                  onClick={() => router.push(`/practitioner/labtools/pipeline/${opp.id}`)}
                  className="hover:bg-gray-700/30 cursor-pointer"
                >
                  <td className="p-4">
                    <p className="text-white">{opp.title}</p>
                    <p className="text-xs text-gray-500">{TYPE_LABELS[opp.opportunityType]}</p>
                  </td>
                  <td className="p-4 text-gray-400">{opp.personName || '-'}</td>
                  <td className="p-4">
                    <select
                      value={opp.stage}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStageChange(opp.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                    >
                      {STAGES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right text-green-400">{formatCurrency(opp.estimatedValueCents)}</td>
                  <td className="p-4 text-right text-gray-400">{formatDate(opp.expectedCloseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    }>
      <PipelineContent />
    </Suspense>
  );
}
