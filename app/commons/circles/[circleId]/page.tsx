'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { FieldPresence } from '@/components/circles/FieldPresence';
import { CircleConsentGate } from '@/components/circles/CircleConsentGate';
import { CircleInquiry } from '@/components/circles/CircleInquiry';
import { SharedFeed } from '@/components/circles/SharedFeed';
import { FieldMemory } from '@/components/circles/FieldMemory';
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

type Mode = 'alive' | 'offerings' | 'journey';

const MODE_LABELS: { key: Mode; label: string }[] = [
  { key: 'alive', label: "What's alive" },
  { key: 'offerings', label: 'Offerings' },
  { key: 'journey', label: 'The journey' },
];

export default function CircleDetailPage() {
  const params = useParams<{ circleId: string }>();
  const router = useRouter();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [mode, setMode] = useState<Mode>('alive');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Active inquiry state (loaded from pulse)
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);

  // Inquiry creation state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [creatingInquiry, setCreatingInquiry] = useState(false);

  const circleId = params.circleId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [circleRes, pulseRes] = await Promise.all([
          apiFetch(`/api/circles/${circleId}`),
          apiFetch(`/api/circles/${circleId}/pulse`),
        ]);

        if (!circleRes.ok) {
          const json = await circleRes.json();
          if (!cancelled) setError(json.error || 'Failed to load circle');
          return;
        }

        const circleJson = await circleRes.json();
        if (!cancelled) {
          setCircle(circleJson.circle ?? null);
          setMembership(circleJson.membership ?? null);
        }

        if (pulseRes.ok) {
          const pulseJson = await pulseRes.json();
          if (!cancelled && pulseJson.pulse?.activeInquiryId) {
            setActiveInquiryId(pulseJson.pulse.activeInquiryId);
          }
        }
      } catch {
        if (!cancelled) setError('Something went wrong.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [circleId]);

  const handleCreateInquiry = async () => {
    if (!inquiryQuestion.trim() || creatingInquiry) return;
    setCreatingInquiry(true);
    try {
      const res = await apiFetch(`/api/circles/${circleId}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inquiryQuestion.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        setActiveInquiryId(json.inquiry.id);
        setShowInquiryForm(false);
        setInquiryQuestion('');
      }
    } catch {
      // handled by UI
    } finally {
      setCreatingInquiry(false);
    }
  };

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

  const canOpenInquiry = membership.role === 'helper' || membership.role === 'facilitator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back link */}
          <Link
            href="/commons/circles"
            className="mb-6 inline-flex items-center gap-2 text-sm text-maia-ink-40 transition-colors hover:text-maia-ink-60"
          >
            <ArrowLeft className="h-4 w-4" /> Back to circles
          </Link>

          {/* FieldPresence — always visible, atmospheric */}
          <FieldPresence
            circleId={circleId}
            circleName={circle.name}
            circleDescription={circle.description}
          />

          {/* Consent gate */}
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

          {/* Mode selector + settings gear */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {MODE_LABELS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === m.key
                      ? 'bg-maia-spice-500/10 text-maia-spice-400 border border-maia-spice-500/30'
                      : 'text-maia-ink-40 hover:text-maia-ink-60 border border-transparent'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg p-2 text-maia-ink-30 transition-colors hover:text-maia-ink-50 hover:bg-maia-navy-800"
              title="Circle settings & members"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Mode content */}
          <AnimatePresence mode="wait">
            {mode === 'alive' && (
              <motion.div
                key="alive"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {activeInquiryId ? (
                  <CircleInquiry
                    circleId={circleId}
                    inquiryId={activeInquiryId}
                    memberId={membership.member_id}
                    memberRole={membership.role}
                  />
                ) : (
                  <div className="py-8 text-center">
                    {canOpenInquiry ? (
                      <>
                        {!showInquiryForm ? (
                          <div>
                            <p className="text-sm text-maia-ink-40 mb-4">
                              No inquiry is open. The field awaits a question.
                            </p>
                            <button
                              onClick={() => setShowInquiryForm(true)}
                              className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20"
                            >
                              Open an inquiry into the field
                            </button>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-auto max-w-lg text-left"
                          >
                            <p className="text-xs text-maia-ink-30 uppercase tracking-widest mb-3">
                              What are you bringing into the field?
                            </p>
                            <textarea
                              value={inquiryQuestion}
                              onChange={(e) => setInquiryQuestion(e.target.value)}
                              placeholder="A question for the circle to hold..."
                              className="w-full resize-none rounded-lg border border-maia-navy-700 bg-maia-navy-850 px-4 py-3 text-sm text-maia-ink-80 placeholder-maia-ink-20 focus:border-maia-spice-500/30 focus:outline-none"
                              rows={3}
                              maxLength={500}
                            />
                            <div className="mt-3 flex justify-between">
                              <button
                                onClick={() => { setShowInquiryForm(false); setInquiryQuestion(''); }}
                                className="text-xs text-maia-ink-30 hover:text-maia-ink-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCreateInquiry}
                                disabled={inquiryQuestion.trim().length < 10 || creatingInquiry}
                                className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {creatingInquiry ? 'Opening...' : 'Open inquiry'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-maia-ink-30">
                        The field is quiet. Inquiries are opened by helpers and facilitators.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {mode === 'offerings' && (
              <motion.div
                key="offerings"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <SharedFeed circleId={circleId} memberId={membership.member_id} />
              </motion.div>
            )}

            {mode === 'journey' && (
              <motion.div
                key="journey"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <FieldMemory circleId={circleId} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings/Members drawer */}
          <AnimatePresence>
            {showSettings && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowSettings(false)}
                />
                {/* Drawer */}
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto bg-maia-navy-900 border-l border-maia-navy-700 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-maia-ink-80">Circle settings</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="rounded-lg p-2 text-maia-ink-30 hover:text-maia-ink-50"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Role + consent badges */}
                  <div className="mb-6 flex items-center gap-3 text-xs text-maia-ink-40">
                    <span className="rounded-md border border-maia-navy-700 bg-maia-navy-850 px-2 py-0.5">
                      {membership.role}
                    </span>
                    <span>
                      {membership.consent_mode === 'manual' ? 'Sharing enabled' : 'Sharing paused'}
                    </span>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-maia-ink-60 mb-3">Members</h3>
                    <CircleMembers circleId={circleId} />
                  </div>

                  <CircleSettings
                    circleId={circleId}
                    onLeft={() => router.push('/commons/circles')}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
