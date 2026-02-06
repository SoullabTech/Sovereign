'use client';

/**
 * Agreements Page
 * View and manage client agreements
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Practice {
  id: string;
  name: string;
}

interface Agreement {
  id: string;
  containerId: string;
  containerScope: string | null;
  type: string;
  status: 'pending' | 'signed' | 'expired' | 'declined';
  sentAt: string | null;
  signedAt: string | null;
  expiresAt: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  signed: 'bg-green-500/20 text-green-300 border-green-500/30',
  expired: 'bg-red-500/20 text-red-300 border-red-500/30',
  declined: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  informed_consent: 'Informed Consent',
  service_agreement: 'Service Agreement',
  privacy_notice: 'Privacy Notice',
  telehealth_consent: 'Telehealth Consent',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function AgreementsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const [practice, setPractice] = useState<Practice | null>(null);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
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

        // For now, set empty data since agreements API may not exist
        // In production, this would fetch from /api/practitioner/agreements
        setAgreements([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, statusFilter]);

  const pendingCount = agreements.filter(a => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
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
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/practitioner/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-medium text-white">Agreements</h1>
              {pendingCount > 0 && (
                <p className="text-sm text-yellow-400">{pendingCount} pending signature{pendingCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'signed', 'expired'].map(status => (
            <button
              key={status}
              onClick={() => router.push(`/practitioner/agreements?status=${status}`)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-yellow-500/30 rounded text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Agreements List */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
          {agreements.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No agreements yet</p>
              <p className="text-sm text-gray-600 mt-2">
                Agreements will appear here once you set up your practice documents and send them to clients.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {agreements.map(agreement => (
                <div
                  key={agreement.id}
                  className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/practitioner/containers/${agreement.containerId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">{agreement.containerScope || 'Client'}</p>
                      <p className="text-sm text-gray-500">
                        {TYPE_LABELS[agreement.type] || agreement.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        {agreement.status === 'signed' ? (
                          <span className="text-green-400">Signed {formatDate(agreement.signedAt)}</span>
                        ) : agreement.status === 'pending' ? (
                          <span className="text-yellow-400">Sent {formatDate(agreement.sentAt)}</span>
                        ) : agreement.status === 'expired' ? (
                          <span className="text-red-400">Expired {formatDate(agreement.expiresAt)}</span>
                        ) : (
                          <span className="text-gray-400">Declined</span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[agreement.status]}`}>
                        {agreement.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">About Agreements</h3>
          <p className="text-sm text-gray-500">
            Agreements help you maintain proper documentation with your clients. You can send informed consent forms,
            service agreements, and other documents for digital signature. Agreements are automatically tracked and
            you&apos;ll be notified when they expire or need renewal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AgreementsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="h-64 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    }>
      <AgreementsContent />
    </Suspense>
  );
}
