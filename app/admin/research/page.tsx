'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';
import { adminFetch, storeAdminPassword } from '@/lib/admin/adminFetch';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { SystemQualityPanel, LedgerRow } from '@/components/admin/research/SystemQualityPanel';
import { PopulationPatternsPanel } from '@/components/admin/research/PopulationPatternsPanel';
import { SystemHealthPanel } from '@/components/admin/research/SystemHealthPanel';
import { DirectivePanel, DirectiveRow } from '@/components/admin/research/DirectivePanel';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OverviewData {
  metrics: Record<string, LedgerRow[]>;
  generatedAt: string;
}

interface DirectivesData {
  directives: DirectiveRow[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SystemIntelligencePage() {
  const router = useRouter();

  // Auth
  const [authed, setAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Data
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [directivesData, setDirectivesData] = useState<DirectivesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Redirect if not logged in at all
  useEffect(() => {
    const user = betaSession.getUser();
    if (!user) {
      router.push('/signin');
    }
  }, [router]);

  // Auto-detect member admin access — skip password gate if member has is_admin = TRUE
  useEffect(() => {
    if (authed) return;
    apiFetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data: { isAdmin?: boolean }) => {
        if (data.isAdmin) {
          // Member session is admin — load data without a password
          loadAll('');
        }
      })
      .catch(() => {
        // Ignore — fall through to password gate
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Fetchers
  // ---------------------------------------------------------------------------

  const fetchOverview = useCallback(async (pwd: string): Promise<boolean> => {
    const res = await adminFetch('/api/admin/research/overview?days=30');
    if (res.status === 401) return false;
    if (!res.ok) throw new Error(`Overview API error: ${res.status}`);
    const data = await res.json();
    setOverview(data);
    return true;
  }, []);

  const fetchDirectives = useCallback(async (pwd: string) => {
    const res = await adminFetch('/api/admin/research/directives');
    if (!res.ok) throw new Error(`Directives API error: ${res.status}`);
    const data = await res.json();
    setDirectivesData(data);
  }, []);

  const loadAll = useCallback(async (pwd: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      const ok = await fetchOverview(pwd);
      if (!ok) {
        setAuthError('Incorrect admin password.');
        setAuthed(false);
        setLoading(false);
        return;
      }
      await fetchDirectives(pwd);
      setAuthed(true);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Fetch error');
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchDirectives]);

  // ---------------------------------------------------------------------------
  // Password gate submit
  // ---------------------------------------------------------------------------

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAdminPassword(passwordInput);
    storeAdminPassword(passwordInput);
    loadAll(passwordInput);
  }

  // ---------------------------------------------------------------------------
  // Directive mutation helpers
  // ---------------------------------------------------------------------------

  async function patchDirective(body: Record<string, unknown>) {
    const res = await adminFetch('/api/admin/research/directives', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error((j as { error?: string }).error ?? `PATCH failed: ${res.status}`);
    }
    return res.json();
  }

  function optimisticallyUpdate(id: string, patch: Partial<DirectiveRow>) {
    setDirectivesData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        directives: prev.directives.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      };
    });
  }

  async function handleAcknowledge(id: string, by: string) {
    optimisticallyUpdate(id, { status: 'acknowledged', acknowledged_by: by });
    try {
      await patchDirective({ id, status: 'acknowledged', acknowledged_by: by });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Update failed');
      // Reload to get server state
      loadAll(adminPassword);
    }
  }

  async function handleResolve(id: string, by: string, notes: string) {
    optimisticallyUpdate(id, { status: 'resolved', acknowledged_by: by, notes, resolved_at: new Date().toISOString() });
    try {
      await patchDirective({ id, status: 'resolved', acknowledged_by: by, notes });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Update failed');
      loadAll(adminPassword);
    }
  }

  async function handleDismiss(id: string) {
    optimisticallyUpdate(id, { status: 'dismissed' });
    try {
      await patchDirective({ id, status: 'dismissed' });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Update failed');
      loadAll(adminPassword);
    }
  }

  // ---------------------------------------------------------------------------
  // Render: password gate
  // ---------------------------------------------------------------------------

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-full max-w-sm bg-slate-800/80 border border-slate-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold text-slate-100">System Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Operational research panel — admin password required.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full text-sm bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              placeholder="Admin password"
              autoFocus
            />
            {authError && (
              <p className="text-xs text-red-400">{authError}</p>
            )}
            <button
              type="submit"
              disabled={!passwordInput || loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm rounded-lg disabled:opacity-40 transition-colors"
            >
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: main panel
  // ---------------------------------------------------------------------------

  const metrics = overview?.metrics ?? {};
  const directives = directivesData?.directives ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="text-slate-500 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-400" />
            <div>
              <h1 className="text-base font-semibold text-slate-100 leading-tight">System Intelligence</h1>
              <p className="text-xs text-slate-500">Operational research panel — aggregate signals, not member content</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-slate-600">
              {overview?.generatedAt ? `Updated ${new Date(overview.generatedAt).toLocaleTimeString()}` : ''}
            </span>
            <button
              onClick={() => loadAll(adminPassword)}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-40"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {fetchError && (
          <div className="mb-6 bg-red-900/30 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">
            {fetchError}
          </div>
        )}

        {loading && !overview && (
          <div className="text-slate-500 text-sm text-center py-12">Loading research data...</div>
        )}

        {/* 2-column grid on desktop, single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SystemQualityPanel metrics={metrics} />
          <PopulationPatternsPanel metrics={metrics} />
          <SystemHealthPanel metrics={metrics} />
          <DirectivePanel
            directives={directives}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
          />
        </div>
      </div>
    </div>
  );
}
