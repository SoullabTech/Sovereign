'use client'

import { useState } from 'react'

type ReturnMode = 'reorient' | 'resume' | 'revisit' | 'inspect' | 'rest'

const DEPARTURE = {
  livingObjectId: 'work:elemental-alchemy',
  title: 'Elemental Alchemy',
  sourceVersion: 'ea:v1',
  excerpt:
    'The work is becoming clearer, but I do not want to lose its soul while I make it more coherent.',
  witnessedAt: 'Sep 29, 2026',
  keptMarker: 'Return to the Chapter 10 ending before the next release pass.',
  priorTemporaryLens: 'What does the evidence actually support?',
  priorUnsavedNextStep: 'Keep editing until it feels finished.',
}

const CURRENT = {
  livingObjectId: 'work:elemental-alchemy',
  title: 'Elemental Alchemy',
  sourceVersion: 'ea:v2',
  excerpt:
    'The work is ready to enter the world in this form, while remaining open to what I learn from its release.',
  returnedAt: 'Oct 29, 2026',
}

export function LongitudinalReturnWitnessClient() {
  const [later, setLater] = useState(false)
  const [mode, setMode] = useState<ReturnMode>('reorient')

  function reset() {
    setLater(false)
    setMode('reorient')
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            MAIA-SOUL-SERVICE-02R5 · Longitudinal return witness
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Return after time has passed.
          </h1>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
        >
          Reset witness
        </button>
      </div>

      {!later ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-[#74583f]/10 bg-white/30 p-6 md:p-8">
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
              Departure state · {DEPARTURE.witnessedAt}
            </p>
            <p className="mt-2 font-mono text-[11px] text-[#8a7965]">
              {DEPARTURE.livingObjectId} · {DEPARTURE.sourceVersion}
            </p>
            <h2 className="mt-4 font-serif text-3xl">{DEPARTURE.title}</h2>
            <p className="mt-6 font-serif text-2xl leading-[1.55] text-[#4b4037]">
              {DEPARTURE.excerpt}
            </p>

            <div className="mt-8 border-l-2 border-[#c69b5d]/45 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                You deliberately kept
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5d5044]">
                {DEPARTURE.keptMarker}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLater(true)}
              className="mt-10 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
            >
              Simulate return 30 days later →
            </button>
          </div>

          <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
            <h2 className="font-serif text-2xl">What exists at departure?</h2>
            <dl className="mt-5 space-y-5 text-xs leading-6">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Durable identity
                </dt>
                <dd>{DEPARTURE.livingObjectId}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Source lineage
                </dt>
                <dd>{DEPARTURE.sourceVersion}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Explicitly kept
                </dt>
                <dd>one return marker</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Temporary only
                </dt>
                <dd>MAIA lens · session salience · unsaved next-step suggestion</dd>
              </div>
            </dl>
          </aside>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[30px] border border-[#74583f]/10 bg-white/30 p-6 md:p-8">
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
              Return state · {CURRENT.returnedAt}
            </p>
            <p className="mt-2 font-mono text-[11px] text-[#8a7965]">
              {CURRENT.livingObjectId} · {CURRENT.sourceVersion}
            </p>
            <h2 className="mt-4 font-serif text-3xl">{CURRENT.title}</h2>

            {mode === 'reorient' && (
              <>
                <div className="mt-8 space-y-7">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                      Recognize
                    </p>
                    <p className="mt-2 font-serif text-xl">
                      This is the same continuing work.
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                      Current source
                    </p>
                    <p className="mt-2 font-serif text-2xl leading-[1.5] text-[#4b4037]">
                      {CURRENT.excerpt}
                    </p>
                  </div>

                  <details className="border-l-2 border-[#c69b5d]/45 pl-4" open>
                    <summary className="cursor-pointer list-none text-sm text-[#785b36]">
                      What changed since your last visit
                    </summary>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                          Then · {DEPARTURE.sourceVersion}
                        </p>
                        <p className="mt-2 font-serif leading-6">{DEPARTURE.excerpt}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                          Now · {CURRENT.sourceVersion}
                        </p>
                        <p className="mt-2 font-serif leading-6">{CURRENT.excerpt}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] text-[#8a7965]">
                      Factual source change only · no developmental story inferred.
                    </p>
                  </details>

                  <div className="border-l-2 border-[#27877a]/30 pl-4">
                    <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                      You deliberately kept
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#5d5044]">
                      {DEPARTURE.keptMarker}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                      Ask the present
                    </p>
                    <p className="mt-2 font-serif text-2xl">
                      What is your relationship to this now?
                    </p>
                  </div>
                </div>

                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                  <button
                    onClick={() => setMode('resume')}
                    className="text-[#795230] underline underline-offset-4"
                  >
                    Resume from what I kept
                  </button>
                  <button
                    onClick={() => setMode('revisit')}
                    className="text-[#795230] underline underline-offset-4"
                  >
                    Revisit the earlier state
                  </button>
                  <button
                    onClick={() => setMode('inspect')}
                    className="text-[#795230] underline underline-offset-4"
                  >
                    Inspect the change
                  </button>
                  <button
                    onClick={() => setMode('rest')}
                    className="text-[#795230] underline underline-offset-4"
                  >
                    Let it rest
                  </button>
                </div>
              </>
            )}

            {mode === 'resume' && (
              <div className="mt-8">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Resume · member-kept locus only
                </p>
                <p className="mt-3 font-serif text-2xl leading-9">
                  {DEPARTURE.keptMarker}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#6b5b4e]">
                  The old unsaved “keep editing” momentum was not restored.
                </p>
              </div>
            )}

            {mode === 'revisit' && (
              <div className="mt-8">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Revisit · historical state
                </p>
                <p className="mt-3 font-serif text-2xl leading-9">{DEPARTURE.excerpt}</p>
                <p className="mt-4 text-sm text-[#6b5b4e]">
                  Historical source · not treated as current.
                </p>
              </div>
            )}

            {mode === 'inspect' && (
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-[20px] border border-[#74583f]/10 bg-white/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Then · {DEPARTURE.sourceVersion}
                  </p>
                  <p className="mt-2 font-serif leading-6">{DEPARTURE.excerpt}</p>
                </div>
                <div className="rounded-[20px] border border-[#74583f]/10 bg-white/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Now · {CURRENT.sourceVersion}
                  </p>
                  <p className="mt-2 font-serif leading-6">{CURRENT.excerpt}</p>
                </div>
              </div>
            )}

            {mode === 'rest' && (
              <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Lawful outcome
                </p>
                <p className="mt-2 font-serif text-2xl">Nothing needs to continue right now.</p>
              </div>
            )}

            {mode !== 'reorient' && (
              <button
                onClick={() => setMode('reorient')}
                className="mt-8 text-sm text-[#795230] underline underline-offset-4"
              >
                ← Back to reorientation
              </button>
            )}
          </div>

          <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
            <h2 className="font-serif text-2xl">What survived 30 days?</h2>

            <div className="mt-6 space-y-6 text-xs leading-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Preserved
                </p>
                <ul className="mt-2 space-y-1">
                  <li>living-object identity</li>
                  <li>source lineage</li>
                  <li>historical provenance</li>
                  <li>explicit member-kept marker</li>
                </ul>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Reconstructed fresh
                </p>
                <ul className="mt-2 space-y-1">
                  <li>current source truth</li>
                  <li>current relevance</li>
                  <li>current field ordering</li>
                  <li>what might matter now</li>
                </ul>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Not carried forward
                </p>
                <ul className="mt-2 space-y-1">
                  <li>{DEPARTURE.priorTemporaryLens}</li>
                  <li>{DEPARTURE.priorUnsavedNextStep}</li>
                  <li>old urgency</li>
                  <li>old salience</li>
                </ul>
              </div>
            </div>

            <p className="mt-7 border-t border-[#74583f]/12 pt-5 text-xs leading-6 text-[#6b5b4e]">
              Time is new evidence. The member returns to a relationship, not to a frozen session.
            </p>
          </aside>
        </div>
      )}
    </section>
  )
}
