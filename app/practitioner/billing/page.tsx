'use client';

/**
 * Billing Page
 * View financial summary and manage invoices
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Practice {
  id: string;
  name: string;
  timezone: string;
}

interface BillingRecord {
  id: string;
  containerId: string;
  containerScope: string | null;
  amountCents: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface BillingSummary {
  paidThisMonth: number;
  pendingTotal: number;
  overdueTotal: number;
  currency: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  paid: 'bg-green-500/20 text-green-300 border-green-500/30',
  overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
  cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

function formatCurrency(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const [practice, setPractice] = useState<Practice | null>(null);
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // For now, set mock data since billing API may not exist
        // In production, this would fetch from /api/practitioner/billing
        setSummary({
          paidThisMonth: 0,
          pendingTotal: 0,
          overdueTotal: 0,
          currency: 'USD'
        });
        setRecords([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="h-24 bg-gray-800 rounded" />
              <div className="h-24 bg-gray-800 rounded" />
              <div className="h-24 bg-gray-800 rounded" />
            </div>
            <div className="h-64 bg-gray-800 rounded" />
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
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/practitioner/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-white">Billing & Invoices</h1>
        </header>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-1">Paid This Month</p>
              <p className="text-2xl font-semibold text-green-400">
                {formatCurrency(summary.paidThisMonth, summary.currency)}
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-semibold text-yellow-400">
                {formatCurrency(summary.pendingTotal, summary.currency)}
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-1">Overdue</p>
              <p className="text-2xl font-semibold text-red-400">
                {formatCurrency(summary.overdueTotal, summary.currency)}
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'overdue', 'paid'].map(status => (
            <button
              key={status}
              onClick={() => router.push(`/practitioner/billing?status=${status}`)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
          {records.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No billing records yet</p>
              <p className="text-sm text-gray-600 mt-2">
                Invoices will appear here once you start tracking billing for your sessions.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {records.map(record => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/practitioner/containers/${record.containerId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">{record.containerScope || 'Session'}</p>
                      <p className="text-sm text-gray-500">
                        {record.status === 'paid' ? `Paid ${formatDate(record.paidAt)}` : `Due ${formatDate(record.dueAt)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-medium">
                        {formatCurrency(record.amountCents)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[record.status]}`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="h-24 bg-gray-800 rounded" />
              <div className="h-24 bg-gray-800 rounded" />
              <div className="h-24 bg-gray-800 rounded" />
            </div>
            <div className="h-64 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
