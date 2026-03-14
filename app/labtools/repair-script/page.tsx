'use client';

/**
 * Repair Script — Build a clean repair message.
 *
 * Four-part structure: Impact → Ownership → Request → Invitation.
 * Three tones: Gentle / Neutral / Direct.
 * No AI. No advice. Just a scaffold for saying what's true.
 *
 * Relational domain. Act mode. Completes the first triad:
 * - Regulation Minute: shift your state
 * - Parts Check-In: see what's active
 * - Repair Script: speak from that place
 *
 * Layout: SectionEditor sub-component, grid overview on setup,
 * step 3 combines Request + Invitation, preview + copy at end.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHapticPulse } from '@/lib/haptics';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type ToneKey = 'gentle' | 'neutral' | 'direct';

/** Completion record for future tracking */
interface RepairRecord {
  tone: ToneKey;
  impact: string;
  ownership: string;
  request: string;
  invitation: string;
  completedAt: string; // ISO 8601
}

// ─────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────

const TONES: { key: ToneKey; label: string; hint: string }[] = [
  { key: 'gentle', label: 'Gentle', hint: 'Soft edges, warm landing.' },
  { key: 'neutral', label: 'Neutral', hint: 'Clear, steady, simple.' },
  { key: 'direct', label: 'Direct', hint: 'Short, firm, respectful.' },
];

const STARTERS: Record<
  ToneKey,
  { impact: string; ownership: string; request: string; invitation: string }
> = {
  gentle: {
    impact: 'When that happened, I felt\u2026',
    ownership: 'I see that I\u2026 / I take responsibility for\u2026',
    request: 'What I\u2019m asking for is\u2026',
    invitation: 'Are you open to\u2026 / Would you be willing to\u2026',
  },
  neutral: {
    impact: 'When that happened,\u2026',
    ownership: 'I own that I\u2026',
    request: 'I\u2019m requesting\u2026',
    invitation: 'Can we\u2026 / Are you open to\u2026',
  },
  direct: {
    impact: 'That impacted me because\u2026',
    ownership: 'My part was\u2026',
    request: 'I need\u2026',
    invitation: 'Let\u2019s\u2026 / Can you\u2026',
  },
};

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

function nowISO() {
  return new Date().toISOString();
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ─────────────────────────────────────────────────────
// SUB-COMPONENT: Section Editor
// ─────────────────────────────────────────────────────

function SectionEditor({
  title,
  subtitle,
  value,
  onChange,
  onNext,
  onBack,
  nextLabel = 'Next',
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-1 text-xs text-white/45">{subtitle}</div>
      </div>

      <textarea
        className="
          w-full rounded-xl border border-white/10 bg-black/20
          px-3 py-2 text-sm text-white/90 placeholder:text-white/25
          focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30
        "
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={subtitle}
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="
            rounded-xl border border-white/10 bg-white/5
            px-3 py-2 text-xs text-white/70
            hover:bg-white/10 transition
          "
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="
            rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80
            hover:bg-white/15 transition
          "
          onClick={onNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────

export default function RepairScriptPage() {
  const [tone, setTone] = useState<ToneKey>('neutral');

  const [impact, setImpact] = useState('');
  const [ownership, setOwnership] = useState('');
  const [request, setRequest] = useState('');
  const [invitation, setInvitation] = useState('');

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [record, setRecord] = useState<RepairRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Soft haptic on step transitions
  useEffect(() => {
    triggerHapticPulse('soft');
  }, [step]);

  const starters = STARTERS[tone];

  const preview = useMemo(() => {
    const lines = [
      impact.trim(),
      ownership.trim(),
      request.trim(),
      invitation.trim(),
    ].filter(Boolean);
    return lines.join('\n\n');
  }, [impact, ownership, request, invitation]);

  const canComplete =
    impact.trim().length > 0 ||
    ownership.trim().length > 0 ||
    request.trim().length > 0 ||
    invitation.trim().length > 0;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(preview || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
      triggerHapticPulse('soft');
    } catch {
      // silent
    }
  }

  function onReset() {
    setTone('neutral');
    setImpact('');
    setOwnership('');
    setRequest('');
    setInvitation('');
    setRecord(null);
    setStep(0);
  }

  function onComplete() {
    setRecord({
      tone,
      impact: impact.trim(),
      ownership: ownership.trim(),
      request: request.trim(),
      invitation: invitation.trim(),
      completedAt: nowISO(),
    });
    setStep(4);
    triggerHapticPulse('medium');
  }

  const completedTime =
    record?.completedAt ? formatTime(new Date(record.completedAt)) : null;

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/labtools"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Lab
          </Link>

          {step !== 0 && step !== 4 ? (
            <button
              type="button"
              className="
                inline-flex items-center gap-2
                rounded-xl border border-white/10 bg-white/5
                px-3 py-2 text-xs text-white/70
                hover:bg-white/10 transition
              "
              onClick={() => setStep(0)}
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* ── Title ── */}
        <div className="mb-2">
          <h1 className="text-2xl font-semibold">Repair Script</h1>
          <p className="mt-1 text-sm text-white/50">
            Structure only. Impact &rarr; Ownership &rarr; Request &rarr; Invitation.
          </p>
        </div>

        {/* ── Step indicator ── */}
        <div className="mb-6 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-10 rounded-full ${
                i === step ? 'bg-[#D4B896]/70' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* ── Content area ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          {/* ══════════ STEP 0: OVERVIEW + TONE ══════════ */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium mb-2">Tone</div>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`
                        rounded-xl border px-3 py-2 text-sm transition
                        ${tone === t.key
                          ? 'border-white/20 bg-white/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }
                      `}
                      onClick={() => setTone(t.key)}
                    >
                      {t.label}
                      <span className="ml-2 text-xs text-white/40">{t.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section grid */}
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition"
                  onClick={() => setStep(1)}
                >
                  <div className="text-sm font-medium">1) Impact</div>
                  <div className="mt-1 text-xs text-white/45">
                    {starters.impact}
                  </div>
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition"
                  onClick={() => setStep(2)}
                >
                  <div className="text-sm font-medium">2) Ownership</div>
                  <div className="mt-1 text-xs text-white/45">
                    {starters.ownership}
                  </div>
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition"
                  onClick={() => setStep(3)}
                >
                  <div className="text-sm font-medium">3) Request</div>
                  <div className="mt-1 text-xs text-white/45">
                    {starters.request}
                  </div>
                </button>

                <div
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-sm font-medium">4) Invitation</div>
                  <div className="mt-1 text-xs text-white/35">
                    Complete after writing
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs text-white/35">
                  Fill what you need. Empty sections are omitted.
                </div>
              </div>
            </div>
          )}

          {/* ══════════ STEP 1: IMPACT ══════════ */}
          {step === 1 && (
            <SectionEditor
              title="Impact"
              subtitle={starters.impact}
              value={impact}
              onChange={setImpact}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}

          {/* ══════════ STEP 2: OWNERSHIP ══════════ */}
          {step === 2 && (
            <SectionEditor
              title="Ownership"
              subtitle={starters.ownership}
              value={ownership}
              onChange={setOwnership}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {/* ══════════ STEP 3: REQUEST + INVITATION (combined) ══════════ */}
          {step === 3 && (
            <div className="space-y-4">
              <SectionEditor
                title="Request"
                subtitle={starters.request}
                value={request}
                onChange={setRequest}
                onNext={() => {}}
                onBack={() => setStep(2)}
                nextLabel="Invitation"
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-sm font-medium">Invitation</div>
                <div className="mt-1 text-xs text-white/45">
                  {starters.invitation}
                </div>

                <textarea
                  className="
                    mt-3 w-full rounded-xl border border-white/10 bg-black/20
                    px-3 py-2 text-sm text-white/90 placeholder:text-white/25
                    focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30
                  "
                  rows={3}
                  value={invitation}
                  onChange={(e) => setInvitation(e.target.value)}
                  placeholder={starters.invitation}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    className="
                      rounded-xl border border-white/10 bg-white/5
                      px-3 py-2 text-xs text-white/70
                      hover:bg-white/10 transition
                    "
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="
                        inline-flex items-center gap-2
                        rounded-xl border border-white/10 bg-white/5
                        px-3 py-2 text-xs text-white/70
                        hover:bg-white/10 transition
                        disabled:opacity-40
                      "
                      onClick={onCopy}
                      disabled={!preview}
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied' : 'Copy'}
                    </button>

                    <button
                      type="button"
                      className="
                        rounded-xl bg-[#D4B896]/20 px-3 py-2
                        text-xs text-[#D4B896]
                        hover:bg-[#D4B896]/25 transition
                        disabled:opacity-40
                      "
                      onClick={onComplete}
                      disabled={!canComplete}
                    >
                      Complete
                    </button>
                  </div>
                </div>

                {/* Live preview */}
                <div className="mt-4">
                  <div className="text-xs text-white/35 mb-2">Preview</div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/85">
                    {preview || '\u2026'}
                  </pre>
                </div>
              </motion.div>
            </div>
          )}

          {/* ══════════ STEP 4: COMPLETION RECORD ══════════ */}
          {step === 4 && record && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Record</div>
                  <div className="text-xs text-white/40">{completedTime}</div>
                </div>

                <div className="mt-2 text-xs text-white/45">
                  Tone:{' '}
                  <span className="text-white/70">
                    {TONES.find((t) => t.key === record.tone)?.label}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-white/35 mb-2">Script</div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/85">
                    {preview || '\u2026'}
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="
                    rounded-xl border border-white/10 bg-white/5
                    px-4 py-2 text-sm text-white/75
                    hover:bg-white/10 transition
                  "
                  onClick={onReset}
                >
                  Again
                </button>
                <Link
                  href="/labtools"
                  className="
                    rounded-xl bg-white/10 px-4 py-2
                    text-sm text-white/80
                    hover:bg-white/15 transition
                  "
                >
                  Done
                </Link>
              </div>

              {/* Terminal action — no bridge out yet */}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
