'use client';

export interface TimelineEntry {
  id: string;
  kind: string;
  feltSignals: string[] | null;
  freeText: string | null;
  maiaReflection: string | null;
  patternHint: string | null;
  fieldToneSnapshot: string | null;
  suggestedMovement: string | null;
  content: string | null;
  /**
   * Set only on entries the OBSERVER wrote. Member-authored entries leave it
   * null — which makes it a reliable provenance marker, and the reason it is
   * now rendered rather than silently returned by the API and dropped.
   */
  confidence?: number | string | null;
  createdAt: string;
}

const KIND_LABELS: Record<string, string> = {
  checkin: 'Check-in',
  note: 'Note',
  reflection: 'Reflection',
  threshold: 'Threshold',
  rupture: 'Rupture',
  repair: 'Repair',
};

// Visual weight: border color + label styling per kind
const KIND_STYLES: Record<string, { border: string; label: string }> = {
  checkin:    { border: 'border-jade-sage/40',   label: 'text-jade-sage' },       // primary
  threshold:  { border: 'border-jade-copper/50', label: 'text-jade-copper' },     // emphasized
  rupture:    { border: 'border-red-400/40',     label: 'text-red-400/80' },      // accented
  repair:     { border: 'border-jade-malachite/40', label: 'text-jade-malachite' }, // accented (positive)
  reflection: { border: 'border-jade-jade/30',   label: 'text-jade-jade/70' },    // moderate
  note:       { border: 'border-jade-forest/30', label: 'text-jade-mineral' },    // quiet
};

/**
 * A date without a year is not a history.
 *
 * This used to fall through to `{ month: 'short', day: 'numeric' }` for
 * anything older than a week, so a 25-year relationship rendered as an
 * undated smear — "Mar 3" could be this year or two decades ago, and the
 * further back a relationship went, the less readable it became. Anything
 * beyond the last week now carries its year.
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Full date, always with year — for hover, so nothing is ever ambiguous. */
function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString([], {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

/** The year an entry belongs to, for era separators in a long history. */
function yearOf(dateStr: string): number {
  return new Date(dateStr).getFullYear();
}

export default function RelationshipTimeline({
  entries,
  total,
  onLoadEarlier,
  loadingEarlier,
}: {
  entries: TimelineEntry[];
  /** True total held for this relationship — may exceed what is rendered. */
  total?: number;
  onLoadEarlier?: () => void;
  loadingEarlier?: boolean;
}) {
  // No history means no room — the page does not render this component at all
  // when there is nothing. An empty-history placeholder assigning the member a
  // chore ("Check in or add a note to begin the timeline") is exactly the
  // scaffolding that made this surface feel like a form.
  if (entries.length === 0) return null;

  const remaining = typeof total === 'number' ? Math.max(0, total - entries.length) : 0;
  let lastYear: number | null = null;

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const style = KIND_STYLES[entry.kind] || KIND_STYLES.note;
        // Observer-written entries carry a confidence value; member-written
        // ones do not. Rendering it keeps machine observation visibly distinct
        // from what the member said themselves.
        const isObserved = entry.confidence !== null && entry.confidence !== undefined;
        const entryYear = yearOf(entry.createdAt);
        const showYearBreak = lastYear !== null && entryYear !== lastYear;
        lastYear = entryYear;
        return (
        <div key={entry.id}>
        {showYearBreak && (
          <div className="flex items-center gap-3 pt-4 pb-3">
            <span className="text-xs text-jade-mineral/50 font-light tabular-nums">{entryYear}</span>
            <span className="flex-1 h-px bg-jade-forest/25" />
          </div>
        )}
        <div className={`border-l-2 ${style.border} pl-4 py-1`}>
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <span className={`text-xs ${style.label} uppercase tracking-wider`}>
              {KIND_LABELS[entry.kind] || entry.kind}
            </span>
            <span className="text-xs text-jade-mineral/60" title={fullDate(entry.createdAt)}>
              {formatDate(entry.createdAt)}
            </span>
            {entry.fieldToneSnapshot && (
              <span className="text-xs text-jade-mineral/60 capitalize">
                — {entry.fieldToneSnapshot.replace(/_/g, ' ')}
              </span>
            )}
            {isObserved && (
              <span
                className="text-[10px] text-jade-mineral/45 font-light italic"
                title="MAIA noticed this in conversation and filed it here. It is an observation, not something you wrote."
              >
                noticed, not written
              </span>
            )}
          </div>

          {entry.kind === 'checkin' && (
            <div className="space-y-2">
              {entry.feltSignals && entry.feltSignals.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.feltSignals.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-jade-forest/20 border border-jade-sage/15 text-jade-mineral">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {entry.freeText && (
                <p className="text-sm text-jade-jade/80 font-light italic">&ldquo;{entry.freeText}&rdquo;</p>
              )}
              {entry.maiaReflection && (
                <p className="text-sm text-jade-mineral font-light">{entry.maiaReflection}</p>
              )}
              {entry.suggestedMovement && (
                <p className="text-xs text-jade-copper font-light mt-1">{entry.suggestedMovement}</p>
              )}
            </div>
          )}

          {entry.kind !== 'checkin' && entry.content && (
            <p className="text-sm text-jade-jade/80 font-light">{entry.content}</p>
          )}
        </div>
        </div>
        );
      })}

      {/* A record that quietly stops is worse than one that says where it
          stops. If there is more, say so plainly and offer to go get it. */}
      {remaining > 0 && (
        <div className="pt-3">
          <button
            onClick={onLoadEarlier}
            disabled={loadingEarlier}
            className="text-xs text-jade-mineral/70 hover:text-jade-sage transition-colors font-light disabled:opacity-40"
          >
            {loadingEarlier
              ? 'Going further back…'
              : `${remaining} earlier ${remaining === 1 ? 'moment' : 'moments'} — go further back`}
          </button>
        </div>
      )}
    </div>
  );
}
