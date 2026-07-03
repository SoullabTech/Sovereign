'use client';

/**
 * Admin — Member Management
 *
 * Lifecycle console for members: Disable / Archive / Restore, with confirmation.
 * Hard Delete is intentionally deferred to Phase 2 (the affordance is shown but
 * disabled). See docs/specs/MEMBER_LIFECYCLE_2026-06-10.md.
 *
 * Auth: the admin secret (LABTOOLS_SECRET / LABTOOLS_ADMIN_PASSWORD) is entered
 * once, stored in localStorage('soullab_admin_secret') — shared with the other
 * /admin tools — and sent as the `x-admin-secret` header. The server
 * (requireAdmin) is the real gate; entering a wrong secret yields a 401 here.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type MemberStatus = 'active' | 'disabled' | 'archived';

interface Member {
  id: string;
  name: string | null;
  preferredName: string | null;
  username: string;
  email: string | null;
  onboarded: boolean;
  tier: string;
  status: MemberStatus;
  statusChangedAt: string | null;
  statusReason: string | null;
  createdAt: string | null;
  lastSignIn: string | null;
}

const ADMIN_SECRET_KEY = 'soullab_admin_secret';

const STATUS_STYLE: Record<MemberStatus, string> = {
  active: 'bg-green-900/30 text-green-300 border border-green-700/40',
  disabled: 'bg-amber-900/30 text-amber-300 border border-amber-700/40',
  archived: 'bg-gray-700/40 text-gray-400 border border-gray-600/40',
};

// What each target status means for the confirmation dialog.
const ACTION_COPY: Record<MemberStatus, { verb: string; consequence: string }> = {
  disabled: {
    verb: 'Disable',
    consequence:
      'Blocks sign-in immediately and revokes any active sessions. Stays visible in rosters. Data is preserved. Reversible.',
  },
  archived: {
    verb: 'Archive',
    consequence:
      'Blocks sign-in, revokes active sessions, and hides them from active rosters. Data is preserved. Reversible.',
  },
  active: {
    verb: 'Restore',
    consequence: 'Restores sign-in access and returns them to active rosters.',
  },
};

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [adminSecret, setAdminSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Confirmation modal state
  const [pending, setPending] = useState<{ member: Member; action: MemberStatus } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (secret: string, q = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/members${q ? `?q=${encodeURIComponent(q)}` : ''}`;
      const res = await fetch(url, { headers: { 'x-admin-secret': secret } });
      if (res.status === 401) {
        setAuthenticated(false);
        setAuthError('Invalid admin secret.');
        localStorage.removeItem(ADMIN_SECRET_KEY);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to load members (${res.status})`);
      }
      const data = await res.json();
      setMembers(data.members || []);
      setAuthenticated(true);
      setAuthError(null);
      localStorage.setItem(ADMIN_SECRET_KEY, secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_SECRET_KEY);
    if (stored) {
      setAdminSecret(stored);
      load(stored);
    }
  }, [load]);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!adminSecret.trim()) {
      setAuthError('Admin secret required.');
      return;
    }
    load(adminSecret.trim());
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(adminSecret, search.trim());
  }

  function requestAction(member: Member, action: MemberStatus) {
    setPending({ member, action });
    setReason('');
    setError(null);
    setNotice(null);
  }

  async function confirmAction() {
    if (!pending) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/members/${pending.member.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify({ status: pending.action, reason: reason.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Action failed');
      const who = pending.member.username || pending.member.id.slice(0, 8);
      const revoked = data.revokedSessions ? ` · ${data.revokedSessions} session(s) revoked` : '';
      setNotice(`${who} → ${pending.action}${revoked}`);
      setPending(null);
      await load(adminSecret, search.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Member Management</h1>
            <p className="text-gray-400">Enter the admin secret to manage members.</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Secret</label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin secret"
                autoFocus
              />
            </div>
            {authError && (
              <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">{authError}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Console ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            ← Admin
          </button>
          <h1 className="text-2xl font-bold text-white">Member Management</h1>
          <button
            onClick={() => load(adminSecret, search.trim())}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username, or email…"
            className="flex-1 px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {notice && (
          <div className="text-green-400 text-sm p-3 bg-green-900/20 rounded-lg mb-3">{notice}</div>
        )}
        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg mb-3">{error}</div>
        )}

        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-700 text-sm text-gray-400">
            {loading ? 'Loading…' : `${members.length} member(s)`}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Tier</th>
                  <th className="px-5 py-3 font-medium">Last sign-in</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="px-5 py-3">
                      <div className="text-white font-medium">
                        {m.preferredName || m.name || m.username}
                      </div>
                      <div className="text-gray-400 text-xs">
                        @{m.username}
                        {m.email ? ` · ${m.email}` : ''}
                      </div>
                      {m.statusReason && m.status !== 'active' && (
                        <div className="text-gray-500 text-xs mt-1 italic">“{m.statusReason}”</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{m.tier}</td>
                    <td className="px-5 py-3 text-gray-400">{fmtDate(m.lastSignIn)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end flex-wrap">
                        {m.status !== 'active' && (
                          <button
                            onClick={() => requestAction(m, 'active')}
                            className="px-3 py-1 rounded-lg bg-green-700/40 hover:bg-green-700/60 text-green-200 text-xs transition-colors"
                          >
                            Restore
                          </button>
                        )}
                        {m.status !== 'disabled' && m.status !== 'archived' && (
                          <button
                            onClick={() => requestAction(m, 'disabled')}
                            className="px-3 py-1 rounded-lg bg-amber-700/40 hover:bg-amber-700/60 text-amber-200 text-xs transition-colors"
                          >
                            Disable
                          </button>
                        )}
                        {m.status !== 'archived' && (
                          <button
                            onClick={() => requestAction(m, 'archived')}
                            className="px-3 py-1 rounded-lg bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 text-xs transition-colors"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          disabled
                          title="Hard delete arrives in Phase 2 (irreversible erasure with manifest preview)"
                          className="px-3 py-1 rounded-lg bg-red-900/20 text-red-400/40 text-xs cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && members.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-4">
          Disable / Archive are reversible and preserve all data. Hard delete (irreversible) is a
          separate Phase 2 action, gated behind a typed confirmation and a preview of exactly what
          will be removed.
        </p>
      </div>

      {/* ── Confirmation modal ── */}
      {pending && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">
              {ACTION_COPY[pending.action].verb}{' '}
              <span className="text-blue-300">
                {pending.member.preferredName || pending.member.name || pending.member.username}
              </span>
              ?
            </h2>
            <p className="text-gray-400 text-sm mb-4">{ACTION_COPY[pending.action].consequence}</p>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason <span className="text-gray-500">(optional, recorded in the audit log)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="e.g. test account, left the cohort…"
              autoFocus
            />
            {error && <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg mb-3">{error}</div>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPending(null)}
                disabled={busy}
                className="px-4 py-2 rounded-xl text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={busy}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                {busy ? 'Working…' : ACTION_COPY[pending.action].verb}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
