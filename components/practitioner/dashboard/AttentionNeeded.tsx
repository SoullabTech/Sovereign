'use client';

/**
 * AttentionNeeded
 * Surfaces containers that may need practitioner review.
 * Informational, not alarming. Reasons are descriptive, not judgmental.
 */

interface AttentionItem {
  containerId: string;
  containerScope: string | null;
  reason: 'closing_no_next_session' | 'no_recent_session';
}

interface AttentionNeededProps {
  items: AttentionItem[];
  onContainerClick?: (containerId: string) => void;
}

function formatReason(reason: string): string {
  const labels: Record<string, string> = {
    closing_no_next_session: 'no closing session scheduled',
    no_recent_session: 'no session in 30+ days'
  };
  return labels[reason] || reason;
}

export function AttentionNeeded({ items, onContainerClick }: AttentionNeededProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200/60 p-6">
      <h2 className="text-xs font-medium tracking-wider text-stone-400 uppercase mb-4">
        Hygiene · Containers
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-stone-400 italic">All containers look good</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <button
              key={item.containerId}
              onClick={() => onContainerClick?.(item.containerId)}
              className="w-full text-left flex items-start gap-3 py-2 px-3 rounded
                       hover:bg-stone-50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-stone-300 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-stone-700">
                  {item.containerScope || 'Unnamed container'}
                </span>
                <span className="mx-2 text-stone-300">—</span>
                <span className="text-sm text-stone-500">
                  {formatReason(item.reason)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
