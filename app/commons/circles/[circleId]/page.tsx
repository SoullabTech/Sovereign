'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { CircleConsentGate } from '@/components/circles/CircleConsentGate';
import { SharedFeed } from '@/components/circles/SharedFeed';
import { CircleMembers } from '@/components/circles/CircleMembers';
import { CircleSettings } from '@/components/circles/CircleSettings';

type Circle = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
};

type Membership = {
  id: string;
  member_id: string;
  role: string;
  status: string;
  consent_mode: 'manual' | 'not_now';
  consented_at: string | null;
};

type Tab = 'shared' | 'members' | 'settings';

export default function CircleDetailPage() {
  const params = useParams<{ circleId: string }>();
  const router = useRouter();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [tab, setTab] = useState<Tab>('shared');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const circleId = params.circleId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/circles/${circleId}`);
        const json = await res.json();

        if (!res.ok) {
          if (!cancelled) setError(json.error || 'Failed to load circle');
          return;
        }

        if (!cancelled) {
          setCircle(json.circle ?? null);
          setMembership(json.membership ?? null);
        }
      } catch {
        if (!cancelled) setError('Something went wrong.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [circleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-maia-spice-400" />
            <p className="mt-4 text-sm text-maia-ink-40">Loading circle...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !circle || !membership) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link
            href="/commons/circles"
            className="mb-6 inline-flex items-center gap-2 text-sm text-maia-ink-40 transition-colors hover:text-maia-ink-60"
          >
            <ArrowLeft className="h-4 w-4" /> Back to circles
          </Link>
          <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-8 text-center">
            <h2 className="text-lg font-semibold text-maia-ink-80">
              {error === 'Access denied' ? 'You are not a member of this circle' : 'Circle not found'}
            </h2>
            <p className="mt-2 text-sm text-maia-ink-40">
              {error || 'This circle may not exist or you may not have access.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'shared', label: 'Shared' },
    { key: 'members', label: 'Members' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/commons/circles"
            className="mb-6 inline-flex items-center gap-2 text-sm text-maia-ink-40 transition-colors hover:text-maia-ink-60"
          >
            <ArrowLeft className="h-4 w-4" /> Back to circles
          </Link>

          {/* Circle header */}
          <div className="mb-6 rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-maia-ink-100">{circle.name}</h1>
                {circle.description && (
                  <p className="mt-1 text-sm text-maia-ink-60">{circle.description}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-maia-ink-40">
                  <span className="rounded-md border border-maia-navy-700 bg-maia-navy-900 px-2 py-0.5">
                    {membership.role}
                  </span>
                  <span>
                    {membership.consent_mode === 'manual' ? 'Sharing enabled' : 'Sharing paused'}
                  </span>
                </div>
              </div>

              {/* Tab buttons */}
              <div className="flex gap-1.5">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      tab === t.key
                        ? 'bg-maia-spice-500/10 text-maia-spice-400 border border-maia-spice-500/30'
                        : 'text-maia-ink-40 hover:text-maia-ink-60 border border-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Consent gate — shown if consent is not 'manual' */}
          <CircleConsentGate
            circleId={circleId}
            consentMode={membership.consent_mode}
            onUpdated={(next) =>
              setMembership({
                ...membership,
                consent_mode: next,
                consented_at: new Date().toISOString(),
              })
            }
          />

          {/* Tab content */}
          {tab === 'shared' && <SharedFeed circleId={circleId} memberId={membership.member_id} />}
          {tab === 'members' && <CircleMembers circleId={circleId} />}
          {tab === 'settings' && (
            <CircleSettings
              circleId={circleId}
              onLeft={() => router.push('/commons/circles')}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
