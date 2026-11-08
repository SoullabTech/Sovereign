'use client';

/**
 * Studio Settings → Admin. Owner-only surface (founder/cto) showing every
 * member's permissions in one place, with add/remove controls for the four this
 * view may edit: tier, roles, admin level and Writer's Studio access.
 *
 * Reads and writes /api/admin/members/permissions. The real authority gate is
 * server-side (signed-in owner only; shared password refused; every change
 * audit-logged); this UI is the presentation layer. Platform stewardship only —
 * no relationship or conversation data is read or written here.
 */

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, AlertCircle, Search, X } from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';

type AdminRole = 'founder' | 'cto' | 'practitioner_admin' | 'operations' | 'tester';

const ADMIN_OPTIONS: { value: AdminRole | ''; label: string }[] = [
  { value: '', label: 'No admin level' },
  { value: 'founder', label: 'Founder' },
  { value: 'cto', label: 'CTO' },
  { value: 'operations', label: 'Operations' },
  { value: 'practitioner_admin', label: 'Practitioner admin' },
  { value: 'tester', label: 'Tester' },
];

const TIER_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'personal', label: 'Personal' },
  { value: 'pro', label: 'Pro' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin (opens /admin)',
  steward: 'Steward',
  curator: 'Curator',
  practitioner: 'Practitioner',
  partner: 'Partner',
  member: 'Member',
  beta_tester: 'Beta tester (mobile: skips tier gates)',
};
const GRANTABLE_ROLES = Object.keys(ROLE_LABELS);

interface MemberRow {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  tier: string;
  roles: string[];
  adminLevel: AdminRole | null;
  writersStudio: { admitted: boolean; viaRoster: boolean; viaOwnerLevel: boolean; hasRosterRow: boolean };
  readOnly: { fieldLabTester: boolean; practitioner: boolean; teams: string[]; envAllowlists: string[] };
}

type Change =
  | { permission: 'tier'; value: string }
  | { permission: 'role'; role: string; grant: boolean }
  | { permission: 'admin_level'; value: AdminRole | null }
  | { permission: 'writers_studio'; grant: boolean };

function label(m: MemberRow): string {
  return m.name || m.username || m.email || m.id;
}

function describe(change: Change): string {
  switch (change.permission) {
    case 'tier':
      return `tier set to ${change.value}`;
    case 'role':
      return change.grant ? `role ${change.role} added` : `role ${change.role} removed`;
    case 'admin_level':
      return change.value ? `admin level set to ${change.value}` : 'admin level removed';
    case 'writers_studio':
      return change.grant ? "Writer's Studio access added" : "Writer's Studio access removed";
  }
}

async function loadMembers(): Promise<{ members?: MemberRow[]; error?: string }> {
  const res = await adminFetch('/api/admin/members/permissions');
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    return { error: data.error || 'You need to be signed in as an owner (founder or CTO) to manage permissions.' };
  }
  if (!res.ok) return { error: `Failed to load members (${res.status})` };
  const data = await res.json();
  return { members: data.members ?? [] };
}

export default function MemberPermissionsSection() {
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
        const r = await loadMembers();
        if (cancelled) return;
        if (r.error) setError(r.error);
        else setMembers(r.members ?? []);
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

  async function apply(member: MemberRow, change: Change) {
    setSavingId(member.id);
    setNotice(null);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/members/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id, ...change }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Update failed (${res.status})`);
        return;
      }
      // Re-read so derived values (Writer's Studio admission etc.) stay truthful.
      const r = await loadMembers();
      if (r.members) setMembers(r.members);
      setNotice(`${label(member)}: ${describe(change)}.`);
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

  const selectClass =
    'rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200 focus:border-teal-500/50 focus:outline-none disabled:opacity-50';

  function Card({ m }: { m: MemberRow }) {
    const busy = savingId === m.id;
    const addable = GRANTABLE_ROLES.filter((r) => !m.roles.includes(r));
    const ro = m.readOnly;
    const readOnlyBits = [
      ro.fieldLabTester && 'Field Lab tester (member’s own choice)',
      ro.practitioner && 'Practitioner',
      ...ro.teams.map((t) => `Team: ${t}`),
      ...ro.envAllowlists,
    ].filter(Boolean) as string[];

    return (
      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">{label(m)}</div>
            <div className="truncate text-xs text-slate-500">{m.username ? `@${m.username}` : m.email || m.id}</div>
          </div>
          {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-2 text-xs text-slate-400">
            Tier
            <select
              value={m.tier}
              disabled={busy}
              onChange={(e) => apply(m, { permission: 'tier', value: e.target.value })}
              className={selectClass}
            >
              {TIER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
              {!TIER_OPTIONS.some((o) => o.value === m.tier) && <option value={m.tier}>{m.tier}</option>}
            </select>
          </label>

          <label className="flex items-center justify-between gap-2 text-xs text-slate-400">
            Admin level
            <select
              value={m.adminLevel ?? ''}
              disabled={busy}
              onChange={(e) => {
                const v = e.target.value;
                apply(m, { permission: 'admin_level', value: v === '' ? null : (v as AdminRole) });
              }}
              className={selectClass}
            >
              {ADMIN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Roles</span>
          {m.roles.length === 0 && <span className="text-slate-600">none</span>}
          {m.roles.map((r) => (
            <span key={r} className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-200">
              {ROLE_LABELS[r] ?? r}
              <button
                type="button"
                disabled={busy}
                aria-label={`Remove role ${r}`}
                onClick={() => apply(m, { permission: 'role', role: r, grant: false })}
                className="text-slate-500 hover:text-rose-300 disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {addable.length > 0 && (
            <select
              value=""
              disabled={busy}
              onChange={(e) => e.target.value && apply(m, { permission: 'role', role: e.target.value, grant: true })}
              className={selectClass}
            >
              <option value="">Add role…</option>
              {addable.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          )}
        </div>

        <label className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={m.writersStudio.viaRoster}
            disabled={busy}
            onChange={(e) => apply(m, { permission: 'writers_studio', grant: e.target.checked })}
            className="h-4 w-4 accent-teal-500"
          />
          Writer&apos;s Studio pilot
          {m.writersStudio.viaOwnerLevel && (
            <span className="text-slate-500">(already admitted through founder/CTO admin level)</span>
          )}
        </label>

        {readOnlyBits.length > 0 && (
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">Read-only: </span>
            {readOnlyBits.join(' · ')}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <ShieldCheck className="h-5 w-5 text-teal-400" />
          Admin · Member permissions
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Every member&apos;s permissions in one place. Only owners (founder / CTO), signed in, can view or change
          them, and every change is recorded with who made it and what it was before and after.
        </p>
      </div>

      <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-3 text-xs text-slate-400">
        <p>
          <span className="text-slate-300">Tier</span> is recorded on the member, but commercial tier checks are
          currently waived during development, so changing it may not change what they can open.{' '}
          <span className="text-slate-300">Roles</span> are still enforced: role-gated pages need the role (/admin
          needs the Admin role; its Pro-tier requirement is among the waived checks).{' '}
          <span className="text-slate-300">Admin level</span> opens admin tools; it does not grant tier or roles.
        </p>
        <p>
          Read-only items are changed elsewhere: the Field Lab tester flag belongs to the member, and the env lists
          (including the founder console) are set in the production environment.
        </p>
        <p>
          None of this grants access to any member&apos;s relationship content, which stays governed by that
          relationship&apos;s own consent.
        </p>
      </div>

      {notice && (
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-300">{notice}</div>
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

          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Members ({filtered.length})</div>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-6 text-center text-sm text-slate-500">
              {q ? `No members match “${search}”.` : 'No members to show.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => (
                <Card key={m.id} m={m} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
