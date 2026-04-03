'use client';

import { useState } from 'react';

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
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState('');

  const toggleSignal = (signal: string) => {
    setSelectedSignals(prev =>
      prev.includes(signal) ? prev.filter(s => s !== signal) : [...prev, signal]
    );
  };

  const handleSubmit = async () => {
    if (selectedSignals.length === 0) {
      setError('Select at least one signal.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/relationships/${relationshipId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feltSignals: selectedSignals,
          freeText: freeText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Check-in could not be completed.');
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

  if (result) {
    return (
      <div className="space-y-5 py-2">
        <div>
          <div className="text-xs text-jade-sage uppercase tracking-wider mb-2">Reflection</div>
          <p className="text-sm text-jade-jade font-light leading-relaxed">{result.maiaReflection}</p>
        </div>

        <div>
          <div className="text-xs text-jade-sage uppercase tracking-wider mb-2">Pattern</div>
          <p className="text-sm text-jade-mineral font-light">{result.patternHint}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-jade-sage uppercase tracking-wider">Field tone</div>
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-jade-forest/30 border border-jade-sage/20 text-jade-jade capitalize">
            {result.fieldToneSnapshot?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="border-t border-jade-sage/15 pt-4">
          <div className="text-xs text-jade-sage uppercase tracking-wider mb-2">Next movement</div>
          <p className="text-sm text-jade-jade font-light italic">{result.suggestedMovement}</p>
        </div>

        <button
          onClick={() => {
            setResult(null);
            setSelectedSignals([]);
            setFreeText('');
            onComplete();
          }}
          className="text-xs text-jade-mineral hover:text-jade-sage transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-2">
      <div>
        <div className="text-sm text-jade-jade font-light mb-3">
          What is alive in your relationship with {relationshipName} right now?
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SIGNALS.map((signal) => (
            <button
              key={signal}
              onClick={() => toggleSignal(signal)}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                selectedSignals.includes(signal)
                  ? 'bg-jade-forest/40 text-jade-jade border border-jade-sage/40'
                  : 'bg-jade-shadow/40 text-jade-mineral border border-jade-forest/30 hover:border-jade-sage/30'
              }`}
            >
              {signal}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-jade-jade font-light mb-2">
          What are you sensing but not fully saying?
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          rows={3}
          placeholder="Optional — whatever comes..."
          className="w-full px-3 py-2 rounded-lg bg-jade-shadow border border-jade-sage/20 text-jade-jade placeholder:text-jade-mineral/40 focus:outline-none focus:border-jade-sage/50 text-sm resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || selectedSignals.length === 0}
        className="px-5 py-2 rounded-lg bg-jade-forest/40 border border-jade-sage/30 text-jade-jade text-sm font-light hover:bg-jade-forest/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Reflecting...' : 'Check in'}
      </button>
    </div>
  );
}
