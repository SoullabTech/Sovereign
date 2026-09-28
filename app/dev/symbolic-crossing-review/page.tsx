'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type EpistemicClass =
  | 'source_fact'
  | 'symbolic_tradition'
  | 'system_synthesis'
  | 'possible_expression'
  | 'member_meaning';

type SourceField = {
  epistemicClass: EpistemicClass;
  label: string;
  value: string;
  authoredBy: 'member' | 'system' | 'tradition' | 'record';
};

type SourcePacket = {
  sourceFacet: 'divination';
  sourceRefId: string;
  kind: 'iching' | 'tarot' | 'runes';
  label: string;
  returnHref: string;
  fields: SourceField[];
};

const CLASS_LABEL: Record<EpistemicClass, string> = {
  source_fact: 'SOURCE FACT',
  symbolic_tradition: 'SYMBOLIC TRADITION',
  system_synthesis: 'SYSTEM SYNTHESIS',
  possible_expression: 'POSSIBLE EXPRESSION',
  member_meaning: 'YOUR MEANING',
};

export default function SymbolicCrossingReviewPage() {
  const searchParams = useSearchParams();
  const sourceRefId = searchParams?.get('sourceRefId') || '';
  const [source, setSource] = useState<SourcePacket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [journalDraft, setJournalDraft] = useState('');
  const [anchorDraft, setAnchorDraft] = useState('');
  useEffect(() => {
    if (!sourceRefId) return;
    const params = new URLSearchParams({
      sourceFacet: 'divination',
      sourceRefId,
    });

    void fetch('/api/house/symbolic-source?' + params.toString(), {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('source');
        return response.json();
      })
      .then((data) => setSource(data.source || null))
      .catch(() => setError('This symbolic source could not be opened.'));
  }, [sourceRefId]);

  const grouped = useMemo(() => {
    const groups = new Map<EpistemicClass, SourceField[]>();
    for (const field of source?.fields || []) {
      const current = groups.get(field.epistemicClass) || [];
      current.push(field);
      groups.set(field.epistemicClass, current);
    }
    return groups;
  }, [source]);

  if (!sourceRefId) {
    return (
      <main className="min-h-screen bg-[#0a0b10] text-stone-200 p-10">
        <p className="text-sm text-stone-500">FACET-FLOW-04 · prototype only</p>
        <h1 className="mt-4 text-3xl font-serif">Choose a saved Divination reading to inspect.</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0b10] text-stone-200 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-amber-900/30 pb-7">
          <p className="text-[11px] tracking-[0.24em] text-amber-300/55">FACET-FLOW-04 · READ-ONLY PROTOTYPE</p>
          <h1 className="mt-3 font-serif text-4xl text-stone-100">Carry the source without carrying its authority.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">
            Nothing on this page is saved. The two receiving fields begin empty. The purpose is to prove that symbolic evidence and interpretation can remain visibly different.
          </p>
        </header>
        {error ? <p className="mt-8 text-rose-300">{error}</p> : null}
        {!source && !error ? <p className="mt-8 text-stone-500">Opening the saved reading…</p> : null}

        {source ? (
          <>
            <section className="mt-8 rounded-[28px] border border-amber-900/30 bg-[#111218]/90 p-7 shadow-2xl">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.22em] text-amber-300/55">CAME WITH YOU FROM DIVINATION</p>
                  <h2 className="mt-2 font-serif text-2xl text-stone-100">{source.label}</h2>
                </div>
                <a className="text-xs text-amber-300/70 hover:text-amber-200" href={source.returnHref}>
                  Return to exact reading →
                </a>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {(['source_fact', 'symbolic_tradition', 'system_synthesis', 'possible_expression', 'member_meaning'] as EpistemicClass[]).map((kind) => {
                  const fields = grouped.get(kind);
                  if (!fields?.length) return null;
                  const secondary = kind === 'system_synthesis' || kind === 'possible_expression';
                  return (
                    <section
                      key={kind}
                      className={`rounded-2xl border p-5 ${secondary ? 'border-violet-900/30 bg-violet-950/10' : 'border-stone-800/80 bg-black/15'}`}
                    >
                      <p className={`text-[10px] tracking-[0.2em] ${secondary ? 'text-violet-300/65' : 'text-amber-300/60'}`}>
                        {CLASS_LABEL[kind]}
                      </p>
                      {fields.map((field, index) => (
                        <div key={field.label + index} className="mt-4 first:mt-3">
                          <p className="text-xs text-stone-500">{field.label}</p>
                          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-300">{field.value}</p>
                        </div>
                      ))}
                    </section>
                  );
                })}
              </div>
            </section>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Receiver
                eyebrow="JOURNAL"
                title="Write with this in view"
                note="The reading remains beside the page. It does not become your writing."
                value={journalDraft}
                onChange={setJournalDraft}
                placeholder="Begin in your own words…"
              />
              <Receiver
                eyebrow="DAILY ANCHOR"
                title="What do you want to stay connected to today?"
                note="The reading may be context. It does not decide what today should mean."
                value={anchorDraft}
                onChange={setAnchorDraft}
                placeholder="A few words are enough."
              />
            </div>

            <p className="mt-8 text-center text-xs text-stone-600">
              Prototype only · no crossing row · no memory write · no persistence
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Receiver({
  eyebrow,
  title,
  note,
  value,
  onChange,
  placeholder,
}: {
  eyebrow: string;
  title: string;
  note: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <section className="rounded-[28px] border border-stone-800 bg-[#111116] p-7">
      <p className="text-[10px] tracking-[0.22em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-2xl text-stone-100">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-stone-500">{note}</p>
      <textarea
        aria-label={eyebrow + ' prototype writing field'}
        className="mt-7 min-h-44 w-full resize-none border-0 border-b border-stone-700 bg-transparent px-0 py-3 text-base leading-7 text-stone-200 outline-none placeholder:text-stone-700"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <p className="mt-4 text-[11px] text-stone-600">Local prototype text only. Nothing is saved.</p>
    </section>
  );
}
