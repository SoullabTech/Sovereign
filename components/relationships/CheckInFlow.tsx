'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const SIGNALS = [
  'tension', 'closeness', 'distance', 'confusion', 'longing',
  'repair', 'avoidance', 'openness', 'grief', 'warmth',
  'pressure', 'gratitude', 'resentment', 'curiosity', 'stillness',
];

interface CheckInResult {
  maiaReflection: string;
  patternHint: string;
  fieldToneSnapshot: string;
  suggestedMovement: string;
}

interface CheckInFlowProps {
  relationshipId: string;
  relationshipName: string;
  onComplete: () => void;
}

export default function CheckInFlow({ relationshipId, relationshipName, onComplete }: CheckInFlowProps) {
  const reduceMotion = useReducedMotion();
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState('');

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  const toggleSignal = (signal: string) => {
    setSelectedSignals((previous) =>
      previous.includes(signal)
        ? previous.filter((item) => item !== signal)
        : [...previous, signal]
    );
  };

  const handleSubmit = async () => {
    if (selectedSignals.length === 0) {
      setError('Choose at least one quality that feels present.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/relationships/${relationshipId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feltSignals: selectedSignals,
          freeText: freeText.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.error || 'This check-in could not be completed.');
        return;
      }
      setResult({
        maiaReflection: data.entry.maiaReflection,
        patternHint: data.entry.patternHint,
        fieldToneSnapshot: data.entry.fieldToneSnapshot,
        suggestedMovement: data.entry.suggestedMovement,
      });
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const possiblePattern =
    result?.patternHint && result.patternHint !== 'Not enough history yet.'
      ? result.patternHint
      : null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {result ? (
        <motion.div
          key="reflection"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={transition}
          className="space-y-7 py-1"
        >
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#716d64]/42">
              MAIA reflects
            </p>
            <p className="text-lg font-light leading-relaxed text-[#3f5544]/90">
              {result.maiaReflection}
            </p>
          </div>

          {possiblePattern && (
            <div className="border-l border-[#9aaa8a]/20 pl-4">
              <p className="mb-1.5 text-xs text-[#716d64]/45">Something MAIA is wondering</p>
              <p className="text-sm font-light leading-relaxed text-[#716d64]/76">
                {possiblePattern}
              </p>
            </div>
          )}

          {result.fieldToneSnapshot && result.fieldToneSnapshot !== 'unknown' && (
            <p className="text-sm font-light text-[#716d64]/58">
              The field feels{' '}
              <span className="text-[#3f5544]/78">
                {result.fieldToneSnapshot.replace(/_/g, ' ')}
              </span>
              {' '}right now.
            </p>
          )}

          <div className="border-t border-[#9aaa8a]/10 pt-5">
            <p className="mb-2 text-xs text-[#716d64]/42">Something to carry</p>
            <p className="text-sm font-light italic leading-relaxed text-[#3f5544]/82">
              {result.suggestedMovement}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setResult(null);
              setSelectedSignals([]);
              setFreeText('');
              onComplete();
            }}
            className="text-xs text-[#5e745d] transition-colors hover:text-[#3f5544]"
          >
            Let this settle
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="sensing"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={transition}
          className="space-y-7 py-1"
        >
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#716d64]/42">
              Sense before explaining
            </p>
            <h3 className="text-xl font-extralight leading-relaxed text-[#3f5544]">
              What qualities feel present with {relationshipName}?
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {SIGNALS.map((signal) => {
                const active = selectedSignals.includes(signal);
                return (
                  <motion.button
                    key={signal}
                    type="button"
                    onClick={() => {
                      toggleSignal(signal);
                      if (error) setError('');
                    }}
                    whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-light transition-colors ${
                      active
                        ? 'border-[#9aaa8a]/45 bg-[#e4eadf]/35 text-[#3f5544]'
                        : 'border-[#9aaa8a]/12 text-[#716d64]/60 hover:border-[#9aaa8a]/28 hover:text-[#3f5544]'
                    }`}
                  >
                    {signal}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-[#3f5544]/82">
              What are you sensing but not fully saying?
            </label>
            <textarea
              value={freeText}
              onChange={(event) => setFreeText(event.target.value)}
              rows={4}
              placeholder="Whatever comes..."
              className="w-full resize-none border-0 border-b border-[#9aaa8a]/18 bg-transparent px-0 py-3 text-base font-light leading-relaxed text-[#3f5544] outline-none placeholder:text-[#716d64]/28 focus:border-[#9aaa8a]/45"
            />
          </div>

          {error && <p className="text-xs text-red-300/80">{error}</p>}

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selectedSignals.length === 0}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="rounded-full border border-[#95a687]/55 bg-[#e8efe2] px-5 py-2.5 text-sm font-light text-[#405642] transition-colors hover:bg-[#dce7d5] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {submitting ? 'Listening for the shape of this…' : 'Reflect this with MAIA'}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
