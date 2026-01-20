'use client';

/**
 * CommitmentCards
 * Shows current relational commitments at a glance.
 * Neutral tones - no colors that imply good/bad.
 */

interface CommitmentCardsProps {
  active: number;
  paused: number;
  closing: number;
  inquiry: number;
  onFilterClick?: (status: string) => void;
}

export function CommitmentCards({
  active,
  paused,
  closing,
  inquiry,
  onFilterClick
}: CommitmentCardsProps) {
  const cards = [
    { label: 'Active', count: active, status: 'active' },
    { label: 'Paused', count: paused, status: 'paused' },
    { label: 'Closing', count: closing, status: 'closing' },
    { label: 'Inquiry', count: inquiry, status: 'inquiry' }
  ];

  return (
    <div className="bg-white rounded-lg border border-stone-200/60 p-6">
      <h2 className="text-xs font-medium tracking-wider text-stone-400 uppercase mb-4">
        Commitments
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {cards.map(({ label, count, status }) => (
          <button
            key={status}
            onClick={() => onFilterClick?.(status)}
            className="text-center p-3 rounded-md hover:bg-stone-50 transition-colors"
          >
            <div className="text-2xl font-light text-stone-800 tabular-nums">
              {count}
            </div>
            <div className="text-xs text-stone-500 mt-1">{label}</div>
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-stone-300"
                />
              ))}
              {count > 5 && (
                <span className="text-xs text-stone-400">+{count - 5}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
