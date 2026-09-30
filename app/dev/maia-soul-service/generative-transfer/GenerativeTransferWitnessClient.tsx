'use client'

import { useState } from 'react'
import {
  transferableCapacity,
  transferStateAfterReshaping,
  transferStateAfterSelection,
  type TransferState,
} from '@/lib/maia/life-loop/generativeTransfer'

const NOVEL_CONTEXT =
  'A 90-minute teaching sequence moves from an opening story into an embodied exercise, then pair reflection, then conceptual synthesis.'

const HISTORICAL_PATTERN =
  'Some chapter transitions create continuity friction even when the core idea is clear.'

export function GenerativeTransferWitnessClient() {
  const [state, setState] = useState<TransferState>('NOVEL_CONTEXT')
  const [showCapacityPalette, setShowCapacityPalette] = useState(false)
  const [capacity, setCapacity] = useState<ReturnType<typeof transferableCapacity> | null>(null)
  const [memberForm, setMemberForm] = useState(
    'Where does the thread get lost between experience and idea?',
  )
  const [historicalOpen, setHistoricalOpen] = useState(false)

  function selectContinuity() {
    setCapacity(transferableCapacity('inspect_continuity'))
    setState(transferStateAfterSelection())
    setShowCapacityPalette(false)
  }

  function reshape() {
    setState(transferStateAfterReshaping())
  }

  function reset() {
    setState('NOVEL_CONTEXT')
    setShowCapacityPalette(false)
    setCapacity(null)
    setMemberForm('Where does the thread get lost between experience and idea?')
    setHistoricalOpen(false)
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03G · Generative capacity transfer
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            The capacity travels. The old pattern stays behind.
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[32px] border border-[#74583f]/10 bg-white/28 p-6 md:p-8">
          <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
            Novel context · teaching sequence
          </p>
          <p className="mt-3 font-serif text-2xl leading-9">{NOVEL_CONTEXT}</p>

          {state === 'NOVEL_CONTEXT' && !showCapacityPalette && (
            <div className="mt-8">
              <p className="text-sm leading-7 text-[#5e5145]">
                No pattern or capacity has been applied automatically.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => setShowCapacityPalette(true)}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Use a capacity I already know
                </button>
                <span className="text-[#857362]">or simply stay with the context</span>
              </div>
            </div>
          )}

          {showCapacityPalette && !capacity && (
            <div className="mt-8 rounded-[24px] border border-[#74583f]/12 bg-white/32 p-5">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Member-opened capacity palette
              </p>
              <p className="mt-3 text-sm leading-7 text-[#5e5145]">
                Choose only if one of these ways of working is useful here.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={selectContinuity}
                  className="rounded-full border border-[#74583f]/15 bg-white/40 px-4 py-2 text-sm"
                >
                  Inspect continuity
                </button>
                <button
                  type="button"
                  onClick={() => setShowCapacityPalette(false)}
                  className="rounded-full border border-[#74583f]/15 bg-white/20 px-4 py-2 text-sm"
                >
                  None right now
                </button>
              </div>
            </div>
          )}

          {capacity && (
            <div className="mt-8 space-y-6">
              <div className="rounded-[24px] border border-[#74583f]/12 bg-white/32 p-5">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Transferred capacity · member selected
                </p>
                <p className="mt-2 font-serif text-xl">{capacity.label}</p>
                <p className="mt-3 text-sm leading-7 text-[#5e5145]">{capacity.question}</p>
                <p className="mt-4 text-[11px] leading-6 text-[#8a7965]">
                  Original manuscript context imported: no · retired pattern imported: no
                </p>
              </div>

              <div className="rounded-[24px] border border-[#74583f]/12 bg-white/32 p-5">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Make it your own in this context
                </p>
                <textarea
                  value={memberForm}
                  onChange={(e) => setMemberForm(e.target.value)}
                  className="mt-3 min-h-28 w-full rounded-[16px] border border-[#74583f]/12 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
                <button
                  type="button"
                  onClick={reshape}
                  className="mt-4 text-sm text-[#795230] underline underline-offset-4"
                >
                  Use my wording here
                </button>
              </div>

              {state === 'MEMBER_RESHAPED' && (
                <div className="border-l-2 border-[#27877a]/30 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Member-shaped capacity expression · current context
                  </p>
                  <p className="mt-2 font-serif text-2xl leading-9">{memberForm}</p>
                  <p className="mt-3 text-[11px] leading-6 text-[#8a7965]">
                    Functional lineage remains Inspect continuity. Your wording belongs to this
                    use, not to a global skill taxonomy.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 border-t border-[#74583f]/12 pt-6">
            <button
              type="button"
              onClick={() => setHistoricalOpen((v) => !v)}
              className="text-xs text-[#8b765f] underline decoration-[#c3ad8b] underline-offset-4"
            >
              {historicalOpen ? 'Hide original learning context' : 'Inspect original learning context'}
            </button>
            {historicalOpen && (
              <div className="mt-4 border-l-2 border-[#c69b5d]/45 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Historical only · retired pattern
                </p>
                <p className="mt-2 font-serif text-lg leading-7">{HISTORICAL_PATTERN}</p>
                <p className="mt-2 text-[11px] text-[#8a7965]">
                  This historical context was not used to interpret the teaching sequence.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">What transferred?</h2>
          <div className="mt-6 space-y-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">Capacity</p>
              <p>{capacity ? capacity.label : 'None selected yet'}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Original pattern
              </p>
              <p>Not imported · remains retired</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Original evidence
              </p>
              <p>Not imported</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Transfer state
              </p>
              <p>{state}</p>
            </div>
          </div>

          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Governing sentence
            </p>
            <p className="mt-2 font-serif text-lg leading-7">
              The capacity can travel farther than the pattern that once helped teach it.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
