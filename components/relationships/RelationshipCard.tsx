'use client';

import FieldToneIndicator from './FieldToneIndicator';

export interface RelationshipSummary {
  id: string;
  name: string;
  realm: 'outer' | 'inner' | 'transpersonal';
  bondType: string | null;
  fieldTone: string | null;
  activeSignals: string[] | null;
  lastCheckinAt: string | null;
  createdAt: string;
  /** Row provenance. 'system' rows are containers, not people. */
  origin?: 'member' | 'system';
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function RelationshipCard({
  relationship,
  onClick,
}: {
  relationship: RelationshipSummary;
  onClick: () => void;
}) {
  const realmIcon = {
    outer: null,
    inner: <span className="text-xs text-jade-copper">inner</span>,
    transpersonal: <span className="text-xs text-jade-copper">transpersonal</span>,
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-lg border border-jade-sage/20 bg-jade-forest/10 hover:bg-jade-forest/20 hover:border-jade-sage/30 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-jade-jade font-light truncate">{relationship.name}</span>
            {realmIcon[relationship.realm]}
          </div>
          <div className="flex items-center gap-3 text-xs text-jade-mineral">
            {relationship.bondType && (
              <span className="capitalize">{relationship.bondType.replace(/_/g, ' ')}</span>
            )}
            {relationship.lastCheckinAt && (
              <span>checked in {formatRelativeTime(relationship.lastCheckinAt)}</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 pt-1 text-right">
          <FieldToneIndicator tone={relationship.fieldTone} />
          {relationship.activeSignals && relationship.activeSignals.length > 0 && (
            <div className="mt-1 text-[10px] text-jade-mineral/60">
              {relationship.activeSignals.slice(0, 3).join(' + ')}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
