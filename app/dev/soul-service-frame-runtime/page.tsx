'use client';

import { useState } from 'react';

type Proposal = {
  possibleFrame: string;
  possibleRationale: string;
  alternativeFrame: string;
  alternativeRationale: string;
};

type ApiResult = {
  source: string;
  proposal: Proposal;
  standing: {
    possibleFrame: 'maia_hypothesis';
    alternativeFrame: 'maia_hypothesis';
  };
  validation: {
    accepted: boolean;
    reasons: string[];
    disposition: 'offered' | 'abstained';
  };
  persistence: 'none';
  currentTurnOnly: true;
  provider?: {
    provider?: string;
    model?: string | null;
    mode?: string | null;
  };
};

const DEFAULT_SOURCE =
  'I keep asking whether to keep refining this project or finally release it.';

export default function SoulServiceFrameRuntimePage() {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<'possible' | 'alternative' | null>(null);
  const [ruling, setRuling] = useState('');
  const [compare, setCompare] = useState(false);

  async function askMaia() {
    setStatus('loading');
    setError('');
    setResult(null);
    setSelected(null);
    setRuling('');
    setCompare(false);

    try {
      const res = await fetch('/api/maia/soul-service-frame-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Runtime pilot failed.');
      setResult(data);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Runtime pilot failed.');
    }
  }

  function returnToSource() {
    setResult(null);
    setSelected(null);
    setRuling('');
    setCompare(false);
    setError('');
  }

  const frame = selected && result
    ? selected === 'possible'
      ? result.proposal.possibleFrame
      : result.proposal.alternativeFrame
    : null;

  return (
    <main className="min-h-screen bg-[#e8dccb] px-3 py-5 text-[#302923] md:px-8 md:py-8">
      <section className="relative mx-auto min-h-[880px] max-w-[1240px] overflow-hidden rounded-[42px] bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_55%,#efe0d2)] px-6 py-8 shadow-[0_30px_90px_rgba(65,43,29,.12)] md:px-11 md:py-10">
        <div className="pointer-events-none absolute -left-[16%] -top-[10%] h-[58%] w-[56%] rounded-full bg-[radial-gradient(circle,rgba(216,94,54,.42),rgba(216,94,54,.08)_46%,transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute -right-[14%] top-[4%] h-[55%] w-[52%] rounded-full bg-[radial-gradient(circle,rgba(39,135,122,.34),rgba(39,135,122,.07)_48%,transparent_74%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-22%] left-[23%] h-[52%] w-[52%] rounded-full bg-[radial-gradient(circle,rgba(225,161,41,.34),rgba(225,161,41,.07)_46%,transparent_74%)] blur-3xl" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[.17em] text-[#846f5e]">
            MAIA Soul-Service · Runtime 01
          </p>
          <p className="hidden text-[10px] uppercase tracking-[.12em] text-[#998675] md:block">
            current-turn only · no persistence
          </p>
        </div>

        <div className="relative z-10 mt-8 grid gap-7 lg:grid-cols-[1.42fr_.72fr]">
          <section className="rounded-[32px] border border-[#5b4331]/10 bg-white/35 p-6 md:p-8">
            <p className="text-[9px] uppercase tracking-[.14em] text-[#917b68]">
              Anchor · source stays primary
            </p>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-4 min-h-[140px] w-full resize-y rounded-[22px] border border-[#5b4331]/15 bg-white/60 p-5 font-serif text-[26px] leading-[1.45] outline-none focus:border-[#d85e36]/40 md:text-[31px]"
              aria-label="Source statement"
            />

            {!result ? (
              <div className="mt-7">
                <p className="max-w-2xl text-sm leading-7 text-[#6b5b4d]">
                  MAIA receives only this source statement. No session, memory, member identity,
                  or prior conversation enters this pilot.
                </p>
                <button
                  onClick={askMaia}
                  disabled={status === 'loading'}
                  className="mt-5 rounded-2xl border border-[#d85e36]/25 bg-[#d85e36]/8 px-4 py-3 text-left text-sm font-medium disabled:opacity-50"
                >
                  {status === 'loading' ? 'MAIA is looking from this source…' : 'Ask MAIA for possible apertures'}
                </button>
                {error && <p className="mt-4 text-sm text-[#8c442f]">{error}</p>}
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <button
                  onClick={() => setSelected('possible')}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    selected === 'possible'
                      ? 'border-[#d85e36]/35 bg-white/80 shadow-sm'
                      : 'border-[#5b4331]/14 bg-white/55'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                    MAIA possible frame · not yet yours
                  </span>
                  <strong className="mt-2 block font-serif text-xl font-normal">
                    {result.proposal.possibleFrame}
                  </strong>
                  <span className="mt-2 block text-[11px] leading-5 text-[#776657]">
                    {result.proposal.possibleRationale}
                  </span>
                </button>

                <button
                  onClick={() => setSelected('alternative')}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    selected === 'alternative'
                      ? 'border-[#27877a]/35 bg-white/80 shadow-sm'
                      : 'border-[#5b4331]/14 bg-white/55'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                    another possible view · not ranked above the first
                  </span>
                  <strong className="mt-2 block font-serif text-xl font-normal">
                    {result.proposal.alternativeFrame}
                  </strong>
                  <span className="mt-2 block text-[11px] leading-5 text-[#776657]">
                    {result.proposal.alternativeRationale}
                  </span>
                </button>
              </div>
            )}

            {result && (
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                <button onClick={() => setCompare(true)} className="underline underline-offset-4">
                  Compare both
                </button>
                <button
                  onClick={() => {
                    setSelected(null);
                    setRuling('Neither frame has standing. The question remains open.');
                  }}
                  className="underline underline-offset-4"
                >
                  Reject both
                </button>
                <button
                  onClick={() => setRuling('Not yet resolved. No frame needs to be chosen.')}
                  className="underline underline-offset-4"
                >
                  Leave unresolved
                </button>
                <button onClick={returnToSource} className="underline underline-offset-4">
                  Return to source
                </button>
              </div>
            )}

            {compare && result && (
              <div className="mt-8 border-l-2 border-[#d85e36]/35 pl-5">
                <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                  Same source · two apertures
                </p>
                <p className="mt-2 font-serif text-xl leading-8">
                  What becomes visible in one view that was harder to see in the other?
                </p>
                <p className="mt-3 text-xs leading-6 text-[#776657]">
                  Neither frame wins. Comparison changes the foreground, not the source.
                </p>
              </div>
            )}

            {frame && (
              <div className="mt-8 rounded-[22px] border border-[#5b4331]/12 bg-white/45 p-5">
                <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                  Member ruling · browser-local only
                </p>
                <p className="mt-2 font-serif text-xl">{frame}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <button
                    onClick={() => setRuling(`Accepted for this moment: ${frame}`)}
                    className="underline underline-offset-4"
                  >
                    This fits for now
                  </button>
                  <button
                    onClick={() => {
                      setSelected(null);
                      setRuling('Frame rejected. It has no standing.');
                    }}
                    className="underline underline-offset-4"
                  >
                    This does not fit
                  </button>
                </div>
              </div>
            )}

            {ruling && (
              <div className="mt-7 border-t border-[#5b4331]/15 pt-5">
                <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                  Your current ruling
                </p>
                <p className="mt-2 font-serif text-lg leading-7">{ruling}</p>
              </div>
            )}
          </section>

          <aside className="rounded-[30px] border border-[#5b4331]/11 bg-white/65 p-6">
            <h1 className="font-serif text-2xl">Live MAIA, narrow authority</h1>
            <p className="mt-4 text-sm leading-7 text-[#594d43]">
              This pilot calls the governed model gateway, but it does not use MAIA’s session,
              memory, member identity, or persistence machinery.
            </p>

            <div className="mt-6 border-l-2 border-[#27877a]/35 pl-4">
              <p className="text-[9px] uppercase tracking-[.13em] text-[#917b68]">
                Runtime contract
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#6f6053]">
                <li>current source only</li>
                <li>two situational apertures</li>
                <li>no diagnosis or identity claim</li>
                <li>no ranked “better” perspective</li>
                <li>fail-closed to an abstention frame</li>
                <li>member ruling stays local</li>
              </ul>
            </div>

            {result && (
              <div className="mt-7 border-t border-[#5b4331]/15 pt-5 text-[11px] leading-6 text-[#79695b]">
                <p>
                  Validation: <strong>{result.validation.disposition}</strong>
                </p>
                <p>Persistence: {result.persistence}</p>
                <p>Current-turn-only: {String(result.currentTurnOnly)}</p>
                <p className="mt-2">
                  Model output is accepted only after the Soul-Service validator passes.
                  Invalid output is never shown; the route substitutes a bounded abstention.
                </p>
              </div>
            )}
          </aside>
        </div>

        <p className="relative z-10 mt-6 text-[10px] leading-5 text-[#927f6f]">
          Runtime 01 is an isolated local pilot. No merge, deployment, durable frame storage,
          memory mutation, or automatic scaffold fading is authorized.
        </p>
      </section>
    </main>
  );
}
