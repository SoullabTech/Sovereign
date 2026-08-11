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
  /**
   * WHICH ACTOR authored this — the only thing that may decide whether a row
   * speaks in the member's voice. `confidence` used to stand in for this and
   * could not carry it: it distinguishes observer-written from everything
   * else and says nothing about who was at the keyboard.
   */
  provenance?: string | null;
  createdAt: string;
}

/**
 * Plain words, quietly set. These were uppercase, letter-spaced and coloured —
 * visually louder than both the dates and the member's own content — so
 * twenty-five years of a life read as a taxonomy of event types rather than as
 * a life. The label is now the smallest, dimmest thing in the row; the words
 * win.
 */
const KIND_LABELS: Record<string, string> = {
  checkin: 'checked in',
  note: 'wrote',
  reflection: 'noticed',
  threshold: 'marked a change',
  rupture: 'marked something broken',
  repair: 'marked something mended',
};

/**
 * What a NON-member row says it is. Each class names its own actor plainly, so
 * nothing can quietly borrow the member's voice — least of all an automated
 * walk that inherited a live session.
 */
const PROVENANCE_LABELS: Record<string, string> = {
  observer_derived: 'MAIA noticed',
  maia_authored: 'MAIA wrote',
  system_generated: 'added by the system',
  test_fixture: 'not yours — written during testing',
};

/**
 * Visual weight lives in the LEFT RULE, not in the label. Turning points the
 * member marked themselves (something broke / mended / changed) carry a warmer
 * rule; ordinary moments stay quiet. Every label itself is the same dim stone,
 * so no kind shouts over another person's life.
 */
const KIND_STYLES: Record<string, { border: string; label: string }> = {
  checkin:    { border: 'border-stone-600/40',  label: 'text-stone-500' },
  threshold:  { border: 'border-amber-700/50',  label: 'text-stone-500' },
  rupture:    { border: 'border-amber-800/70',  label: 'text-stone-500' },
  repair:     { border: 'border-amber-500/50',  label: 'text-stone-500' },
  reflection: { border: 'border-stone-700/40',  label: 'text-stone-500' },
  note:       { border: 'border-stone-800/60',  label: 'text-stone-500' },
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

/**
 * Whose voice this is. Deliberately the quietest thing in its block — the
 * attribution has to be unmissable when looked for and invisible when not,
 * so a life does not read as a transcript of labelled speakers.
 */
function Voice({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] text-stone-600 font-light mb-0.5 tracking-wide">
      {children}
    </span>
  );
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
        // Only a row an actual member authored may speak as "you". Everything
        // else — observer, MAIA, system, agent walk — says what it is. Rows
        // predating the provenance column fall back to the old evidence
        // (`confidence` was set exclusively by the observer) rather than
        // being promoted into the member's voice by default.
        const isMemberVoice = entry.provenance
          ? entry.provenance === 'member_authored'
          : entry.confidence === null || entry.confidence === undefined;
        const isObserved = !isMemberVoice;
        const entryYear = yearOf(entry.createdAt);
        const showYearBreak = lastYear !== null && entryYear !== lastYear;
        lastYear = entryYear;
        return (
        <div key={entry.id}>
        {showYearBreak && (
          <div className="flex items-center gap-3 pt-4 pb-3">
            <span className="text-xs text-stone-400/50 font-light tabular-nums">{entryYear}</span>
            <span className="flex-1 h-px bg-stone-900/25" />
          </div>
        )}
        <div className={`border-l-2 ${style.border} pl-4 py-1`}>
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <span className={`text-[11px] ${style.label} font-light`}>
              {isMemberVoice
                ? `you ${KIND_LABELS[entry.kind] || entry.kind}`
                : PROVENANCE_LABELS[entry.provenance || 'observer_derived'] || 'MAIA noticed'}
            </span>
            <span className="text-[11px] text-stone-600" title={fullDate(entry.createdAt)}>
              {formatDate(entry.createdAt)}
            </span>
            {entry.fieldToneSnapshot && (
              <span className="text-[11px] text-stone-600 lowercase">
                — {entry.fieldToneSnapshot.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* ── NESTED AUTHORSHIP ──────────────────────────────────────────
              A check-in row is not one voice. It stacks three epistemically
              different objects, and only the first belongs to the member:
              their own sensing, MAIA's reflection, and MAIA's suggested
              movement. They used to sit unlabelled under a single heading of
              "you checked in", so MAIA's reading — and, worse, MAIA's
              directives — inherited the member's voice.

              Observation and suggestion are also NOT the same act. Noticing
              describes; suggesting proposes movement, and the member is
              entitled to see which one they are receiving. Each keeps its own
              attribution, in the same plain quiet language used at row level. */}
          {entry.kind === 'checkin' && (
            <div className="space-y-3">
              {entry.feltSignals && entry.feltSignals.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.feltSignals.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-stone-900/30 border border-stone-700/30 text-stone-400">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {entry.freeText && (
                <div>
                  <Voice>you</Voice>
                  <p
                    className="text-[15px] text-[#ece0d2] font-light leading-relaxed"
                    style={{ fontFamily: 'Spectral, Georgia, serif' }}
                  >
                    {entry.freeText}
                  </p>
                </div>
              )}
              {entry.maiaReflection && (
                <div>
                  <Voice>MAIA noticed</Voice>
                  <p className="text-sm text-stone-400 font-light leading-relaxed">
                    {entry.maiaReflection}
                  </p>
                </div>
              )}
              {entry.suggestedMovement && (
                <div>
                  <Voice>MAIA suggested</Voice>
                  <p className="text-sm text-amber-200/55 font-light leading-relaxed">
                    {entry.suggestedMovement}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* The member's own words, warm and brighter than every label
              around them. Machine-noticed content stays visibly cooler and
              dimmer, so observation never wears the member's voice. */}
          {entry.kind !== 'checkin' && entry.content && (
            <p
              className={
                isObserved
                  ? 'text-sm text-stone-400 font-light'
                  : 'text-[15px] text-[#ece0d2] font-light leading-relaxed'
              }
              style={isObserved ? undefined : { fontFamily: 'Spectral, Georgia, serif' }}
            >
              {entry.content}
            </p>
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
            type="button"
            onClick={onLoadEarlier}
            disabled={loadingEarlier}
            className="text-xs text-stone-400/70 hover:text-stone-300 transition-colors font-light disabled:opacity-40"
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
