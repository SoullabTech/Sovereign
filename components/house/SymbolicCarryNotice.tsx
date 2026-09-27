'use client';

import { useEffect, useRef, useState } from 'react';
import { readability } from '@/lib/house/readability';

type EpistemicClass =
  | 'source_fact'
  | 'symbolic_tradition'
  | 'system_synthesis'
  | 'possible_expression'
  | 'member_meaning';

type SymbolicField = {
  epistemicClass: EpistemicClass;
  label: string;
  value: string;
  authoredBy: 'member' | 'system' | 'tradition' | 'record';
};

type SymbolicPacket = {
  sourceFacet: 'divination';
  sourceRefId: string;
  kind: 'iching' | 'tarot' | 'runes';
  label: string;
  returnHref: string;
  fields: SymbolicField[];
};

const CLASS_LABEL: Record<EpistemicClass, string> = {
  source_fact: 'What happened',
  symbolic_tradition: 'Symbolic tradition',
  system_synthesis: "System's reading",
  possible_expression: 'Possible expression',
  member_meaning: 'Your meaning',
};
export function SymbolicCarryNotice({
  sourceRefId,
  onResolved,
  mode = 'carry',
}: {
  sourceRefId: string;
  onResolved?: (source: SymbolicPacket | null) => void;
  mode?: 'carry' | 'origin';
}) {
  const [source, setSource] = useState<SymbolicPacket | null>(null);
  const [failed, setFailed] = useState(false);
  const onResolvedRef = useRef(onResolved);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    let live = true;
    const params = new URLSearchParams({
      sourceFacet: 'divination',
      sourceRefId,
    });

    void fetch('/api/house/symbolic-source?' + params.toString(), {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('symbolic source unavailable');
        return response.json();
      })
      .then((data) => {
        if (!live) return;
        const next = data?.source ?? null;
        setSource(next);
        setFailed(!next);
        onResolvedRef.current?.(next);
      })
      .catch(() => {
        if (!live) return;
        setSource(null);
        setFailed(true);
        onResolvedRef.current?.(null);
      });

    return () => {
      live = false;
    };
  }, [sourceRefId]);
  if (failed) {
    return (
      <div className="border-l border-stone-400/35 pl-4 py-1">
        <p className={`${readability.marker} text-stone-500`}>Source unavailable</p>
        <p className={`${readability.body} mt-1 text-stone-500`}>Nothing has crossed. Return to the saved reading and try again.</p>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="border-l border-stone-300/35 pl-4 py-1" aria-label="Loading symbolic source">
        <p className={`${readability.body} text-stone-500`}>Bringing the saved reading into view…</p>
      </div>
    );
  }

  const ordered: EpistemicClass[] = [
    'source_fact',
    'symbolic_tradition',
    'system_synthesis',
    'possible_expression',
    'member_meaning',
  ];

  return (
    <aside className="border-l border-[#b9aa8f]/45 pl-4 py-1" aria-label="Symbolic source">
      <p className={`${readability.marker} text-[#8d7350]`}>
        {mode === 'carry' ? 'Came with you from Divination' : 'Divination'}
      </p>
      <p className={`${readability.itemTitle} mt-1 text-[#4f493f]`}>{source.label}</p>

      <div className="mt-4 space-y-3">
        {ordered.map((kind) => {
          const fields = source.fields.filter((field) => field.epistemicClass === kind);
          if (fields.length === 0) return null;

          const content = (
            <div className="mt-2 space-y-3">
              {fields.map((field, index) => (
                <div key={field.label + index}>
                  <p className={`${readability.metadata} text-[#8b8173]`}>{field.label}</p>
                  <p className={`${readability.reading} mt-0.5 whitespace-pre-line text-[#625a4f]`}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          );

          if (kind === 'source_fact') {
            return (
              <section key={kind}>
                <p className={`${readability.marker} text-[#8d7350]/80`}>
                  {CLASS_LABEL[kind]}
                </p>
                {content}
              </section>
            );
          }

          return (
            <details
              key={kind}
              className="group border-t border-[#b9aa8f]/25 pt-3"
            >
              <summary
                className={`${readability.metadata} flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-[#7c6d5c] marker:content-none`}
              >
                <span>{CLASS_LABEL[kind]}</span>
                <span
                  aria-hidden="true"
                  className="text-[#9a856b] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              {content}
            </details>
          );
        })}
      </div>
      <a
        href={source.returnHref}
        className={`${readability.action} mt-4 inline-flex min-h-11 items-center text-[#8d7350] hover:text-[#6f5638]`}
      >
        Return to exact reading →
      </a>

      {mode === 'carry' ? (
        <p className={`${readability.metadata} mt-3 text-[#8b8173]`}>
          The reading stays where it is. These are different kinds of context; your writing remains yours.
        </p>
      ) : null}
    </aside>
  );
}
