'use client';

/**
 * PendingAgreements
 * Shows agreements awaiting acceptance.
 * Simple count with view all link.
 */

interface PendingAgreementsProps {
  count: number;
  onViewAll?: () => void;
}

export function PendingAgreements({ count, onViewAll }: PendingAgreementsProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200/60 p-6">
      <h2 className="text-xs font-medium tracking-wider text-stone-400 uppercase mb-4">
        Hygiene · Agreements
      </h2>

      {count === 0 ? (
        <p className="text-sm text-stone-400 italic">All agreements signed</p>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-700">
            {count} agreement{count !== 1 ? 's' : ''} pending acceptance
          </span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              View all →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
