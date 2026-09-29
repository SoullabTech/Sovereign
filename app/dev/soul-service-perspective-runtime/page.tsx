'use client';

import { useMemo, useState } from 'react';

type Perspective =
  | 'Time'
  | 'Scale'
  | 'Evidence'
  | 'Relation'
  | 'Agency'
  | 'Possibility';

type PerspectiveResult = {
  source: string;
  currentFrame: string | null;
  response: {
    perspective: Perspective;
    foreground: string;
    question: string;
    boundary: string;
  };
  standing: {
    perspective: 'member_selected';
    currentFrame: 'member_current_turn' | 'none';
    generatedContent: 'maia_hypothesis';
  };
  validation: {
    accepted: boolean;
    reasons: string[];
    disposition: 'offered' | 'abstained';
  };
  persistence: 'none';
  currentTurnOnly: true;
};

const PERSPECTIVES: Perspective[] = [
  'Time',
  'Scale',
  'Evidence',
  'Relation',
  'Agency',
  'Possibility',
];

const DEFAULT_SOURCE =
  'I keep asking whether to keep refining this project or finally release it.';

export default function SoulServicePerspectiveRuntimePage() {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [frameStanding, setFrameStanding] = useState<'none' | 'carried' | 'rejected'>('none');
  const [currentFrame, setCurrentFrame] = useState('refine or release');
  const [results, setResults] = useState<Partial<Record<Perspective, PerspectiveResult>>>({});
  const [selected, setSelected] = useState<Perspective | null>(null);
  const [compareWith, setCompareWith] = useState<Perspective | null>(null);
  const [loading, setLoading] = useState<Perspective | null>(null);
  const [error, setError] = useState('');

  const selectedResult = selected ? results[selected] ?? null : null;
  const comparisonResult = compareWith ? results[compareWith] ?? null : null;

  const carriedFrame = frameStanding === 'carried' ? currentFrame.trim() : null;

  const localStandingText = useMemo(() => {
    if (frameStanding === 'carried') return `Carried for this turn: ${currentFrame || '(empty)'}`;
    if (frameStanding === 'rejected') return 'Prior frame rejected · deliberately not sent to MAIA';
    return 'No frame carried into this perspective move';
  }, [frameStanding, currentFrame]);

  async function requestPerspective(perspective: Perspective) {
    setLoading(perspective);
    setError('');
    try {
      const res = await fetch('/api/maia/soul-service-perspective-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          perspective,
          ...(carriedFrame ? { currentFrame: carriedFrame } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Perspective runtime failed.');
      setResults((prev) => ({ ...prev, [perspective]: data }));
      setSelected((prev) => {
        if (prev && prev !== perspective && results[prev]) setCompareWith(prev);
        return perspective;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Perspective runtime failed.');
    } finally {
      setLoading(null);
    }
  }

  function resetPerspectives() {
    setResults({});
    setSelected(null);
    setCompareWith(null);
    setError('');
  }

  return (
    <main className="min-h-screen bg-[#e8dccb] px-3 py-5 text-[#302923] md:px-8 md:py-8">
      <section className="relative mx-auto min-h-[900px] max-w-[1240px] overflow-hidden rounded-[42px] bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_55%,#efe0d2)] px-6 py-8 shadow-[0_30px_90px_rgba(65,43,29,.12)] md:px-11 md:py-10">
        <div className="pointer-events-none absolute -left-[15%] -top-[10%] h-[58%] w-[56%] rounded-full bg-[radial-gradient(circle,rgba(216,94,54,.42),rgba(216,94,54,.08)_46%,transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute -right-[14%] top-[4%] h-[55%] w-[52%] rounded-full bg-[radial-gradient(circle,rgba(39,135,122,.34),rgba(39,135,122,.07)_48%,transparent_74%)] blur-3xl" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[.17em] text-[#846f5e]">
            MAIA Soul-Service · Runtime 02
          </p>
          <p className="hidden text-[10px] uppercase tracking-[.12em] text-[#998675] md:block">
            member-selected perspective · no persistence
          </p>
        </div>

        <div className="relative z-10 mt-8 grid gap-7 lg:grid-cols-[1.4fr_.74fr]">
          <section className="rounded-[32px] border border-[#5b4331]/10 bg-white/35 p-6 md:p-8">
            <p className="text-[9px] uppercase tracking-[.14em] text-[#917b68]">
              Anchor · unchanged source
            </p>
            <textarea
              aria-label="Source statement"
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                resetPerspectives();
              }}
              className="mt-4 min-h-[130px] w-full resize-y rounded-[22px] border border-[#5b4331]/15 bg-white/60 p-5 font-serif text-[25px] leading-[1.45] outline-none focus:border-[#d85e36]/40 md:text-[30px]"
            />

            <div className="mt-7 rounded-[22px] border border-[#5b4331]/12 bg-white/40 p-5">
              <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                Current frame standing · browser-local
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {[
                  ['none', 'Carry no frame'],
                  ['carried', 'Carry a frame I chose'],
                  ['rejected', 'Prior frame was rejected'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFrameStanding(key as 'none' | 'carried' | 'rejected');
                      resetPerspectives();
                    }}
                    className={`rounded-xl border px-3 py-2 ${
                      frameStanding === key
                        ? 'border-[#d85e36]/35 bg-white/75'
                        : 'border-[#5b4331]/12 bg-white/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {frameStanding === 'carried' && (
                <input
                  aria-label="Current frame"
                  value={currentFrame}
                  onChange={(e) => {
                    setCurrentFrame(e.target.value);
                    resetPerspectives();
                  }}
                  className="mt-4 w-full rounded-xl border border-[#5b4331]/15 bg-white/60 px-3 py-3 text-sm outline-none"
                />
              )}

              <p className="mt-3 text-[11px] leading-5 text-[#776657]">{localStandingText}</p>
            </div>

            <div className="mt-8">
              <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                Choose the aperture yourself
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {PERSPECTIVES.map((perspective) => (
                  <button
                    key={perspective}
                    onClick={() => requestPerspective(perspective)}
                    disabled={loading !== null}
                    className={`rounded-[20px] border p-4 text-left transition ${
                      selected === perspective
                        ? 'border-[#d85e36]/35 bg-white/80 shadow-sm'
                        : 'border-[#5b4331]/12 bg-white/45'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-[.12em] text-[#917b68]">
                      member-selected perspective
                    </span>
                    <strong className="mt-1 block font-serif text-lg font-normal">
                      {loading === perspective ? 'Opening…' : perspective}
                    </strong>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mt-5 text-sm text-[#8c442f]">{error}</p>}

            {selectedResult && (
              <div className="mt-8 rounded-[26px] border border-[#d85e36]/22 bg-white/60 p-5">
                <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                  {selectedResult.response.perspective} · MAIA hypothesis inside your chosen aperture
                </p>
                <p className="mt-3 font-serif text-xl leading-8">
                  {selectedResult.response.foreground}
                </p>
                <p className="mt-4 text-sm leading-6 text-[#66574a]">
                  {selectedResult.response.question}
                </p>
                <div className="mt-4 border-t border-[#5b4331]/12 pt-4">
                  <p className="text-[9px] uppercase tracking-[.12em] text-[#917b68]">
                    Epistemic boundary
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#776657]">
                    {selectedResult.response.boundary}
                  </p>
                </div>
              </div>
            )}

            {selectedResult && (
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <button
                  onClick={() => {
                    const others = PERSPECTIVES.filter(
                      (p) => p !== selected && results[p],
                    );
                    setCompareWith(others[0] ?? null);
                  }}
                  className="underline underline-offset-4"
                >
                  Compare with another opened perspective
                </button>
                <button
                  onClick={() => {
                    setSelected(null);
                    setCompareWith(null);
                  }}
                  className="underline underline-offset-4"
                >
                  Return to source
                </button>
              </div>
            )}

            {selectedResult && comparisonResult && compareWith !== selected && (
              <div className="mt-7 border-l-2 border-[#27877a]/35 pl-5">
                <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                  Same source · two member-chosen apertures
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[selectedResult, comparisonResult].map((entry) => (
                    <div
                      key={entry.response.perspective}
                      className="rounded-[20px] border border-[#5b4331]/12 bg-white/45 p-4"
                    >
                      <strong className="font-serif text-lg font-normal">
                        {entry.response.perspective}
                      </strong>
                      <p className="mt-2 text-xs leading-5 text-[#6f6053]">
                        {entry.response.foreground}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-serif text-lg">
                  What becomes visible when these two apertures are held together?
                </p>
              </div>
            )}
          </section>

          <aside className="rounded-[30px] border border-[#5b4331]/11 bg-white/65 p-6">
            <h1 className="font-serif text-2xl">The member chooses where to look from</h1>
            <p className="mt-4 text-sm leading-7 text-[#594d43]">
              MAIA may work inside a chosen perspective. MAIA may not silently select a
              preferred lens or convert it into a durable view of the member.
            </p>

            <div className="mt-6 border-l-2 border-[#27877a]/35 pl-4">
              <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                Runtime 02 contract
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#6f6053]">
                <li>source remains fixed</li>
                <li>perspective chosen by member</li>
                <li>rejected frames are not forwarded</li>
                <li>optional carried frame is current-turn only</li>
                <li>relation perspective cannot mind-read</li>
                <li>possibility cannot predict</li>
                <li>output validated before display</li>
              </ul>
            </div>

            {selectedResult && (
              <div className="mt-7 border-t border-[#5b4331]/15 pt-5 text-[11px] leading-6 text-[#79695b]">
                <p>Perspective standing: {selectedResult.standing.perspective}</p>
                <p>Frame standing: {selectedResult.standing.currentFrame}</p>
                <p>Generated standing: {selectedResult.standing.generatedContent}</p>
                <p>Validation: {selectedResult.validation.disposition}</p>
                <p>Persistence: {selectedResult.persistence}</p>
              </div>
            )}
          </aside>
        </div>

        <p className="relative z-10 mt-6 text-[10px] leading-5 text-[#927f6f]">
          Runtime 02 remains an isolated local pilot. No perspective state, frame state,
          member identity, session context, or memory is persisted.
        </p>
      </section>
    </main>
  );
}
