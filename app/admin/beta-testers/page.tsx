'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';

type Tester = {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  tier: string;
  roles: string[];
  onboarded: boolean;
  signInMethods: string[];
  signInReady: boolean;
  earlyFieldAdmitted: boolean;
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
  lastSignIn: string | null;
  createdAt: string | null;
  preferredAuthMethod: string | null;
};

type Payload = {
  testers: Tester[];
  summary: {
    total: number;
    signInReady: number;
    needsReview: number;
    earlyField: number;
    onboarded: number;
  };
  authority: {
    betaCohort: string;
    platformAccess: string;
    subscriptionGatesOrdinaryPlatform: boolean;
    earlyFieldSeparate: boolean;
  };
};

function when(value: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function methodLabel(method: string): string {
  if (method === 'email-code') return 'Email code';
  if (method === 'password') return 'Password';
  if (method === 'passkey') return 'Passkey';
  return method;
}

export default function BetaTestersAdmin() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/beta-testers', { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        setError('Admin authorization is required to view the beta cohort.');
        return;
      }
      if (!res.ok) throw new Error(`Could not load beta testers (${res.status})`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load beta testers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.testers;
    return data.testers.filter((t) =>
      [t.name, t.username, t.email, t.tier, ...t.roles]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [data, search]);

  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-300/80">
              <ShieldCheck className="h-4 w-4" />
              Authoritative production roster
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Beta Testers</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              This view reads the production <code className="text-slate-300">members.tester</code> cohort.
              It does not use the old browser-local beta list.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
          <div className="flex gap-3">
            <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <h2 className="font-medium text-emerald-100">Beta access and Early Field are separate</h2>
              <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                Every authenticated member can enter the ordinary platform at the free tier or above.
                Subscription status is informational here and does not gate ordinary platform access.
                Early Field is a separate experimental cohort and does not replace beta access.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Reading the production beta cohort…
          </div>
        ) : data ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Beta testers', value: data.summary.total, icon: Users },
                { label: 'Sign-in ready', value: data.summary.signInReady, icon: KeyRound },
                { label: 'Early Field', value: data.summary.earlyField, icon: FlaskConical },
                { label: 'Onboarded', value: data.summary.onboarded, icon: CheckCircle2 },
                { label: 'Needs review', value: data.summary.needsReview, icon: AlertCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/55 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{label}</span>
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="border-b border-slate-800 p-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, username, email, tier…"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-slate-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-950/35 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Sign in</th>
                      <th className="px-4 py-3 font-medium">Platform</th>
                      <th className="px-4 py-3 font-medium">Early Field</th>
                      <th className="px-4 py-3 font-medium">Tier</th>
                      <th className="px-4 py-3 font-medium">Onboarding</th>
                      <th className="px-4 py-3 font-medium">Last sign-in</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filtered.map((tester) => (
                      <tr key={tester.id} className="align-top hover:bg-slate-800/20">
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{tester.name}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {tester.username ? `@${tester.username}` : tester.email || 'No username'}
                          </div>
                          {tester.email && <div className="mt-0.5 text-xs text-slate-600">{tester.email}</div>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {tester.signInMethods.length ? tester.signInMethods.map((method) => (
                              <span key={method} className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-1 text-xs text-slate-300">
                                {methodLabel(method)}
                              </span>
                            )) : (
                              <span className="text-xs text-rose-300">No known account-bound path</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {tester.signInReady ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-300">
                              <CheckCircle2 className="h-4 w-4" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-300">
                              <AlertCircle className="h-4 w-4" /> Review
                            </span>
                          )}
                          <div className="mt-1 text-xs text-slate-600">Subscription does not gate this</div>
                        </td>
                        <td className="px-4 py-4">
                          {tester.earlyFieldAdmitted ? (
                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-xs text-violet-200">
                              Early instrument
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Ordinary Living Field</span>
                          )}
                        </td>
                        <td className="px-4 py-4 capitalize text-slate-300">{tester.tier}</td>
                        <td className="px-4 py-4">
                          <span className={tester.onboarded ? 'text-emerald-300' : 'text-amber-300'}>
                            {tester.onboarded ? 'Complete' : 'Continues after sign-in'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-400">{when(tester.lastSignIn)}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                          No beta testers match this search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-3 text-xs text-slate-500 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
                <span className="text-slate-400">Beta authority:</span> {data.authority.betaCohort}
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
                <span className="text-slate-400">Ordinary platform:</span> {data.authority.platformAccess}
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
                <span className="text-slate-400">Early Field:</span> separate operational cohort
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
