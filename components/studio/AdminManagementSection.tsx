'use client';

/**
 * Studio Settings → Admin. Owner-only surface (founder/cto) to grant/revoke
 * platform admin_role. Reads /api/admin/members and writes via
 * /api/admin/members/admin-role. The real authority gate is server-side on both
 * endpoints (owners only); this UI is the presentation layer. Platform
 * stewardship only — no relationship data is read or written here.
 */

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, AlertCircle, Search } from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';

type AdminRole = 'founder' | 'cto' | 'practitioner_admin' | 'operations' | 'tester';

const ROLE_OPTIONS: { value: AdminRole | ''; label: string }[] = [
  { value: '', label: 'No admin' },
  { value: 'founder', label: 'Founder' },
  { value: 'cto', label: 'CTO' },
  { value: 'operations', label: 'Operations' },
  { value: 'practitioner_admin', label: 'Practitioner Admin' },
  { value: 'tester', label: 'Tester' },
];

interface MemberRow {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  admin_role: AdminRole | null;
}

function label(m: MemberRow): string {
  return m.name || m.username || m.email || m.id;
}

export default function AdminManagementSection() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch('/api/admin/members');
        if (res.status === 401 || res.status === 403) {
          if (!cancelled) setError('You do not have owner access to manage admins.');
          return;
        }
        if (!res.ok) throw new Error(`Failed to load members (${res.status})`);
        const data = await res.json();
        if (!cancelled) setMembers(data.members ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load members');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function setRole(member: MemberRow, role: AdminRole | null) {
    setSavingId(member.id);
    setNotice(null);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/members/admin-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Update failed (${res.status})`);
        return;
      }
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, admin_role: role } : m)));
      setNotice(role ? `Granted ${role} to ${label(member)}.` : `Revoked admin from ${label(member)}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = members.filter((m) =>
    !q ? true : [m.name, m.username, m.email].some((f) => f?.toLowerCase().includes(q)),
  );
  const admins = filtered.filter((m) => m.admin_role);
  const others = filtered.filter((m) => !m.admin_role);

  function Row({ m }: { m: MemberRow }) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white">{label(m)}</div>
          <div className="truncate text-xs text-slate-500">
            {m.username ? `@${m.username}` : m.email || m.id}
          </div>
        </div>
        <select
          value={m.admin_role ?? ''}
          disabled={savingId === m.id}
          onChange={(e) => {
            const v = e.target.value;
            setRole(m, v === '' ? null : (v as AdminRole));
          }}
          className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 focus:border-teal-500/50 focus:outline-none disabled:opacity-50"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <ShieldCheck className="h-5 w-5 text-teal-400" />
          Admin
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Grant or revoke platform admin access. Only owners (founder / CTO) can manage admins.
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-3 text-xs text-slate-400">
        Admin governs platform stewardship — monitoring, bug reports, diagnostics, member management.
        It does <span className="text-slate-300">not</span> grant access to any member&apos;s
        relationship content, which stays governed by that relationship&apos;s own consent.
      </div>

      {notice && (
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-300">
          {notice}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 p-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          <span className="text-slate-400">Loading members…</span>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 focus:border-teal-500/50 focus:outline-none"
            />
          </div>

          {admins.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current admins ({admins.length})
              </div>
              {admins.map((m) => (
                <Row key={m.id} m={m} />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Members {q ? `(${others.length})` : `(${others.length})`}
            </div>
            {others.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-6 text-center text-sm text-slate-500">
                No members match “{search}”.
              </div>
            ) : (
              others.map((m) => <Row key={m.id} m={m} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
