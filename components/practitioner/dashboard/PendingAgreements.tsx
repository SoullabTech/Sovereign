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
    <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
        Pending Agreements
      </h2>

      {count === 0 ? (
        <p className="text-sm text-gray-500 italic">All agreements signed</p>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            {count} agreement{count !== 1 ? 's' : ''} pending acceptance
          </span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              View all →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
