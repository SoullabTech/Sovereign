'use client';

/**
 * Parts Check-In — Which part is up right now?
 *
 * A structured noticing lens, not therapy. IFS-inspired without clinical framing.
 * Three steps: Notice → Name → Need.
 * No advice, no interpretation, no coaching. Just a record.
 *
 * Psychological domain. Notice mode. Complements Regulation Minute:
 * - Somatic shifts the body-state
 * - Parts Check-In reveals what's up in the psyche after the shift
 */

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type SessionPhase = 'notice' | 'name' | 'need' | 'complete';

/** The quality/energy of the part that showed up */
type PartQuality =
  | 'protective'   // guarding, controlling, managing
  | 'reactive'     // angry, panicked, impulsive
  | 'young'        // small, scared, sad, needy
  | 'critical'     // judging, shaming, comparing
  | 'numb'         // checked out, frozen, distant
  | 'wise'         // calm, clear, compassionate (Self energy)
  | 'other';       // something else

interface QualityOption {
  key: PartQuality;
  label: string;
  description: string;
  emoji: string;
}

/** Completion record — structured for future tracking */
interface CheckInRecord {
  bodyLocation: string | null;
  quality: PartQuality;
  qualityLabel: string;
  partName: string;
  need: string;
  completedAt: string; // ISO 8601
}

// ─────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────

const QUALITIES: QualityOption[] = [
  { key: 'protective', label: 'Protective',  description: 'Guarding, controlling, managing',       emoji: '\u{1F6E1}\u{FE0F}' },
  { key: 'reactive',   label: 'Reactive',    description: 'Angry, panicked, urgent',               emoji: '\u{26A1}' },
  { key: 'young',      label: 'Young',       description: 'Small, scared, sad, needy',             emoji: '\u{1F331}' },
  { key: 'critical',   label: 'Critical',    description: 'Judging, shaming, comparing',           emoji: '\u{1F5E1}\u{FE0F}' },
  { key: 'numb',       label: 'Numb',        description: 'Checked out, frozen, distant',          emoji: '\u{1F9CA}' },
  { key: 'wise',       label: 'Calm / Clear', description: 'Steady, present, compassionate',          emoji: '\u{2728}' },
  { key: 'other',      label: 'Other',       description: 'Something not listed here',             emoji: '\u{2754}' },
];

const BODY_LOCATIONS = [
  'Head', 'Throat', 'Chest', 'Stomach', 'Gut',
  'Shoulders', 'Hands', 'Back', 'Everywhere', 'Nowhere specific',
];

const COMMON_NEEDS = [
  'Safety', 'Rest', 'To be heard', 'Space', 'Connection',
  'Control', 'Permission', 'Nothing right now',
];

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function PartsCheckInPage() {
  const router = useRouter();

  // ── Session state ──
  const [phase, setPhase] = useState<SessionPhase>('notice');

  // ── Step 1: Notice ──
  const [bodyLocation, setBodyLocation] = useState<string | null>(null);

  // ── Step 2: Name ──
  const [selectedQuality, setSelectedQuality] = useState<PartQuality | null>(null);
  const [partName, setPartName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ── Step 3: Need ──
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [customNeed, setCustomNeed] = useState('');

  // ── Completion ──
  const [record, setRecord] = useState<CheckInRecord | null>(null);

  // ─────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────

  const goToName = useCallback(() => {
    setPhase('name');
    triggerHapticPulse('soft');
    // Focus name input after animation
    setTimeout(() => nameInputRef.current?.focus(), 400);
  }, []);

  const goToNeed = useCallback(() => {
    if (!selectedQuality) return;
    setPhase('need');
    triggerHapticPulse('soft');
  }, [selectedQuality]);

  const complete = useCallback(() => {
    const need = customNeed.trim() || selectedNeed || '';
    const qualityOption = QUALITIES.find((q) => q.key === selectedQuality);

    const rec: CheckInRecord = {
      bodyLocation,
      quality: selectedQuality || 'other',
      qualityLabel: qualityOption?.label || 'Other',
      partName: partName.trim() || qualityOption?.label || 'unnamed',
      need,
      completedAt: new Date().toISOString(),
    };

    setRecord(rec);
    setPhase('complete');
    triggerHapticPulse('medium');
  }, [bodyLocation, selectedQuality, partName, selectedNeed, customNeed]);

  const reset = useCallback(() => {
    setPhase('notice');
    setBodyLocation(null);
    setSelectedQuality(null);
    setPartName('');
    setSelectedNeed(null);
    setCustomNeed('');
    setRecord(null);
  }, []);

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => router.push('/labtools')}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{1F3AD}'}</span>
          <h1 className="text-base font-medium text-white/80">Parts Check-In</h1>
        </div>

        {/* Step indicator */}
        {phase !== 'complete' && (
          <div className="ml-auto flex items-center gap-1.5">
            {(['notice', 'name', 'need'] as const).map((step, i) => (
              <div
                key={step}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  step === phase
                    ? 'bg-[#D4B896]/60 w-4'
                    : i < ['notice', 'name', 'need'].indexOf(phase)
                      ? 'bg-[#D4B896]/30'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">

          {/* ══════════ STEP 1: NOTICE ══════════ */}
          {phase === 'notice' && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              {/* Prompt */}
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">
                  Pause. Notice your body.
                </p>
                <p className="text-white/30 text-xs">
                  Where do you feel something right now?
                </p>
              </div>

              {/* Body location chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {BODY_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setBodyLocation(bodyLocation === loc ? null : loc)}
                    className={`
                      px-3 py-2 rounded-xl text-xs font-medium
                      transition-all duration-200
                      ${bodyLocation === loc
                        ? 'bg-white/10 text-white/80 border border-white/20'
                        : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* Next */}
              <motion.button
                onClick={goToName}
                whileTap={{ scale: 0.96 }}
                className="
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08
                  border border-[#D4B896]/15 text-[#D4B896]/70
                  hover:from-[#D4B896]/25 hover:to-[#D4B896]/15
                  transition-all duration-200
                "
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              <p className="text-center text-[10px] text-white/15">
                Body location is optional. You can skip ahead.
              </p>
            </motion.div>
          )}

          {/* ══════════ STEP 2: NAME ══════════ */}
          {phase === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              {/* Prompt */}
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">
                  What kind of energy is it?
                </p>
                <p className="text-white/30 text-xs">
                  Pick the closest match. No wrong answer.
                </p>
              </div>

              {/* Quality selection */}
              <div className="space-y-2">
                {QUALITIES.map((q) => (
                  <button
                    key={q.key}
                    onClick={() => setSelectedQuality(q.key)}
                    className={`
                      w-full flex items-center gap-3.5 px-4 py-3 rounded-xl
                      transition-all duration-200 text-left
                      ${selectedQuality === q.key
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    <span className="text-xl flex-shrink-0">{q.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/80">{q.label}</div>
                      <div className="text-[11px] text-white/35 mt-0.5">{q.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Optional name */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/25 uppercase tracking-wider block">
                  Give it a name (optional)
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g. The Manager, Little One, Inner Critic..."
                  maxLength={60}
                  className="
                    w-full px-4 py-3 rounded-xl text-sm
                    bg-white/[0.03] border border-white/[0.08]
                    text-white/70 placeholder:text-white/20
                    focus:outline-none focus:border-white/15
                    transition-colors
                  "
                />
              </div>

              {/* Next */}
              <motion.button
                onClick={goToNeed}
                disabled={!selectedQuality}
                whileTap={{ scale: 0.96 }}
                className={`
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${selectedQuality
                    ? 'bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/70 hover:from-[#D4B896]/25'
                    : 'bg-white/[0.02] border border-white/[0.04] text-white/20 cursor-not-allowed'
                  }
                `}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 3: NEED ══════════ */}
          {phase === 'need' && (
            <motion.div
              key="need"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              {/* Prompt */}
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">
                  What does this part need?
                </p>
                <p className="text-white/30 text-xs">
                  Not what you think it should need. What it actually wants.
                </p>
              </div>

              {/* Common needs */}
              <div className="flex flex-wrap gap-2 justify-center">
                {COMMON_NEEDS.map((need) => (
                  <button
                    key={need}
                    onClick={() => {
                      setSelectedNeed(selectedNeed === need ? null : need);
                      setCustomNeed('');
                    }}
                    className={`
                      px-3 py-2 rounded-xl text-xs font-medium
                      transition-all duration-200
                      ${selectedNeed === need
                        ? 'bg-white/10 text-white/80 border border-white/20'
                        : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    {need}
                  </button>
                ))}
              </div>

              {/* Custom need */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/25 uppercase tracking-wider block">
                  Or in your own words
                </label>
                <input
                  type="text"
                  value={customNeed}
                  onChange={(e) => {
                    setCustomNeed(e.target.value);
                    if (e.target.value.trim()) setSelectedNeed(null);
                  }}
                  placeholder="It needs..."
                  maxLength={120}
                  className="
                    w-full px-4 py-3 rounded-xl text-sm
                    bg-white/[0.03] border border-white/[0.08]
                    text-white/70 placeholder:text-white/20
                    focus:outline-none focus:border-white/15
                    transition-colors
                  "
                />
              </div>

              {/* Complete */}
              <motion.button
                onClick={complete}
                whileTap={{ scale: 0.96 }}
                className="
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08
                  border border-[#D4B896]/15 text-[#D4B896]/70
                  hover:from-[#D4B896]/25 hover:to-[#D4B896]/15
                  transition-all duration-200
                "
              >
                Finish
              </motion.button>

              <p className="text-center text-[10px] text-white/15">
                You can finish without selecting a need.
              </p>
            </motion.div>
          )}

          {/* ══════════ COMPLETE ══════════ */}
          {phase === 'complete' && record && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm"
            >
              {/* Summary card */}
              <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
                {/* Part identity */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {QUALITIES.find((q) => q.key === record.quality)?.emoji || '\u{1F3AD}'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/70">
                      {record.partName}
                    </p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {record.qualityLabel} energy
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 pl-9">
                  {record.bodyLocation && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/20 uppercase tracking-wider w-12">Where</span>
                      <span className="text-xs text-white/40">{record.bodyLocation}</span>
                    </div>
                  )}
                  {record.need && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/20 uppercase tracking-wider w-12">Needs</span>
                      <span className="text-xs text-white/40">{record.need}</span>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="pt-2 border-t border-white/[0.05]">
                  <p className="text-[10px] text-white/15 font-mono">
                    {new Date(record.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <motion.button
                  onClick={reset}
                  whileTap={{ scale: 0.96 }}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    py-3.5 rounded-xl font-medium text-sm
                    bg-white/[0.03] border border-white/[0.08]
                    text-white/50 hover:bg-white/[0.06]
                    transition-all duration-200
                  "
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Again
                </motion.button>

                <motion.button
                  onClick={() => router.push('/labtools')}
                  whileTap={{ scale: 0.96 }}
                  className="
                    flex-1 py-3.5 rounded-xl font-medium text-sm
                    bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08
                    border border-[#D4B896]/15 text-[#D4B896]/80
                    hover:from-[#D4B896]/25 hover:to-[#D4B896]/15
                    transition-all duration-200
                  "
                >
                  Done
                </motion.button>
              </div>

              {/* Notice → Act corridor */}
              <ToolBridge
                text="If something needs repair, you can speak from this clarity."
                href="/labtools/repair-script"
                className="mt-3"
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
