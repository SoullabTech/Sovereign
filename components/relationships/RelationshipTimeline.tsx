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
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function RelationshipTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-jade-mineral font-light">No entries yet.</p>
        <p className="text-xs text-jade-mineral/60 mt-1">Check in or add a note to begin the timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const style = KIND_STYLES[entry.kind] || KIND_STYLES.note;
        return (
        <div key={entry.id} className={`border-l-2 ${style.border} pl-4 py-1`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs ${style.label} uppercase tracking-wider`}>
              {KIND_LABELS[entry.kind] || entry.kind}
            </span>
            <span className="text-xs text-jade-mineral/60">{formatDate(entry.createdAt)}</span>
            {entry.fieldToneSnapshot && (
              <span className="text-xs text-jade-mineral/60 capitalize">
                — {entry.fieldToneSnapshot.replace(/_/g, ' ')}
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
        );
      })}
    </div>
  );
}
