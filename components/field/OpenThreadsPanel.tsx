import Link from 'next/link';
import type { FieldThread } from '@/lib/field/types';

interface OpenThreadsPanelProps {
  threads: FieldThread[];
}

/**
 * Unfinished threads — continuity across sessions.
 * Soft phrasing only. Never more certain than the signal warrants.
 */
export function OpenThreadsPanel({ threads }: OpenThreadsPanelProps) {
  if (threads.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-white/25 uppercase tracking-widest">
          Open Threads
        </h2>
        <p className="text-sm text-white/30">
          Nothing open right now. Begin from what is present.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium text-white/25 uppercase tracking-widest">
        Open Threads
      </h2>

      <div className="space-y-3">
        {threads.slice(0, 3).map((thread) => (
          <div
            key={thread.id}
            className="py-3 border-b border-white/5 last:border-0 space-y-2"
          >
            <p className="text-sm text-white/70 leading-relaxed">
              {thread.statement}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-white/25">
                {thread.whyNow && <span>{thread.whyNow}</span>}
                {thread.source === 'practitioner' && (
                  <span className="text-white/20">from practitioner</span>
                )}
              </div>

              <Link
                href={`/maia/chat?thread=${thread.id}`}
                className="text-xs text-[#D4B896]/60 hover:text-[#D4B896] transition-colors"
              >
                Explore this
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
