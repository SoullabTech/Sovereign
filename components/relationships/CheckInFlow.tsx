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
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-jade-mineral/42">
              MAIA reflects
            </p>
            <p className="text-lg font-light leading-relaxed text-jade-jade/90">
              {result.maiaReflection}
            </p>
          </div>

          {possiblePattern && (
            <div className="border-l border-jade-sage/20 pl-4">
              <p className="mb-1.5 text-xs text-jade-mineral/45">Something MAIA is wondering</p>
              <p className="text-sm font-light leading-relaxed text-jade-mineral/76">
                {possiblePattern}
              </p>
            </div>
          )}

          {result.fieldToneSnapshot && result.fieldToneSnapshot !== 'unknown' && (
            <p className="text-sm font-light text-jade-mineral/58">
              The field feels{' '}
              <span className="text-jade-jade/78">
                {result.fieldToneSnapshot.replace(/_/g, ' ')}
              </span>
              {' '}right now.
            </p>
          )}

          <div className="border-t border-jade-sage/10 pt-5">
            <p className="mb-2 text-xs text-jade-mineral/42">Something to carry</p>
            <p className="text-sm font-light italic leading-relaxed text-jade-jade/82">
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
            className="text-xs text-jade-sage transition-colors hover:text-jade-jade"
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
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-jade-mineral/42">
              Sense before explaining
            </p>
            <h3 className="text-xl font-extralight leading-relaxed text-jade-jade">
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
                        ? 'border-jade-sage/45 bg-jade-forest/35 text-jade-jade'
                        : 'border-jade-sage/12 text-jade-mineral/60 hover:border-jade-sage/28 hover:text-jade-jade'
                    }`}
                  >
                    {signal}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-light text-jade-jade/82">
              What are you sensing but not fully saying?
            </label>
            <textarea
              value={freeText}
              onChange={(event) => setFreeText(event.target.value)}
              rows={4}
              placeholder="Whatever comes..."
              className="w-full resize-none border-0 border-b border-jade-sage/18 bg-transparent px-0 py-3 text-base font-light leading-relaxed text-jade-jade outline-none placeholder:text-jade-mineral/28 focus:border-jade-sage/45"
            />
          </div>

          {error && <p className="text-xs text-red-300/80">{error}</p>}

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selectedSignals.length === 0}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="rounded-full border border-jade-sage/25 bg-jade-forest/24 px-5 py-2.5 text-sm font-light text-jade-jade transition-colors hover:bg-jade-forest/38 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {submitting ? 'Listening for the shape of this…' : 'Reflect this with MAIA'}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
