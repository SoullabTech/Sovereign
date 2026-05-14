'use client';

interface Work {
  id: string;
  title: string;
  year?: string | null;
  work_type: string;
  description?: string | null;
  external_url?: string | null;
  entry_point: boolean;
}

interface KeyWorksListProps {
  works: Work[];
}

const typeLabel: Record<string, string> = {
  book: 'Book',
  essay: 'Essay',
  lecture: 'Lecture',
  interview: 'Interview',
  other: 'Work',
};

export function KeyWorksList({ works }: KeyWorksListProps) {
  if (works.length === 0) return null;

  // Entry points first, then rest
  const sorted = [...works].sort((a, b) => (b.entry_point ? 1 : 0) - (a.entry_point ? 1 : 0));

  return (
    <div className="space-y-3">
      {sorted.map((work) => (
        <div
          key={work.id}
          className="rounded-xl border border-maia-navy-700 bg-maia-navy-850 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {work.entry_point && (
                  <span className="rounded-full bg-maia-spice-500/15 px-2 py-0.5 text-xs text-maia-spice-400">
                    Start here
                  </span>
                )}
                <span className="text-xs text-maia-ink-40 uppercase tracking-wide">
                  {typeLabel[work.work_type] ?? 'Work'}
                  {work.year ? ` · ${work.year}` : ''}
                </span>
              </div>
              <h4 className="mt-1.5 font-medium text-maia-ink-100">{work.title}</h4>
              {work.description && (
                <p className="mt-2 text-sm text-maia-ink-60 leading-relaxed">{work.description}</p>
              )}
            </div>
          </div>
          {work.external_url && (
            <a
              href={work.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-maia-spice-400 hover:text-maia-spice-300 transition-colors"
            >
              Find it →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
