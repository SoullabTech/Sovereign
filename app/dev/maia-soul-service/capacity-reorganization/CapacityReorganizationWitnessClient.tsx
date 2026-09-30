'use client'

import { useState } from 'react'
import {
  CAPACITY_AFFORDANCES,
  capacityStateAfterMemberChoice,
  capacityStateAfterPatternRetirement,
  type CapacityId,
  type PatternInfluenceState,
} from '@/lib/maia/life-loop/capacityReorganization'

const PATTERN =
  'Some chapter transitions create continuity friction even when the core idea is clear.'

export function CapacityReorganizationWitnessClient() {
  const [retired, setRetired] = useState(false)
  const [state, setState] = useState<PatternInfluenceState>('PATTERN_GUIDED')
  const [selected, setSelected] = useState<CapacityId | null>(null)
  const [history, setHistory] = useState(false)

  function retirePattern() {
    setRetired(true)
    setState(capacityStateAfterPatternRetirement())
    setSelected(null)
  }

  function choose(id: CapacityId) {
    setSelected(id)
    setState(capacityStateAfterMemberChoice())
  }

  function reset() {
    setRetired(false)
    setState('PATTERN_GUIDED')
    setSelected(null)
    setHistory(false)
  }

  const capacity = selected ? CAPACITY_AFFORDANCES[selected] : null

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03F · Capacity reorganization
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            The pattern can leave. The capacity can stay.
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
            Current source · work:elemental-alchemy · ea:v2
          </p>
          <p className="mt-3 font-serif text-2xl leading-9">
            The revised chapter now moves directly from the clinical story into the conceptual
            synthesis, with the prior bridge removed.
          </p>

          {!retired ? (
            <div className="mt-8 rounded-[24px] border border-[#74583f]/12 bg-white/32 p-5">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Pattern-guided scaffold
              </p>
              <p className="mt-3 font-serif text-xl leading-8">{PATTERN}</p>
              <p className="mt-4 text-sm leading-7 text-[#5e5145]">
                While this pattern is active, attention can be organized around transition friction.
              </p>
              <button
                type="button"
                onClick={retirePattern}
                className="mt-6 text-sm text-[#795230] underline underline-offset-4"
              >
                Retire pattern from current use
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Pattern standing
                </p>
                <p className="mt-2 font-serif text-xl">Retired from current use.</p>
                <p className="mt-2 text-sm leading-7 text-[#5e5145]">
                  Historical evidence remains. The pattern no longer guides current attention.
                </p>
                <button
                  type="button"
                  onClick={() => setHistory((v) => !v)}
                  className="mt-4 text-sm text-[#795230] underline underline-offset-4"
                >
                  {history ? 'Hide historical pattern' : 'Inspect historical pattern'}
                </button>
              </div>

              {history && (
                <div className="mt-5 border-l-2 border-[#c69b5d]/45 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Historical pattern · no current prospective authority
                  </p>
                  <p className="mt-3 font-serif text-lg leading-7">{PATTERN}</p>
                </div>
              )}

              <div className="mt-10">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  General capacities remain available
                </p>
                <p className="mt-2 text-sm leading-7 text-[#5e5145]">
                  Nothing is selected automatically. Choose a way of working only if it helps now.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {Object.values(CAPACITY_AFFORDANCES).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => choose(item.id)}
                      className="rounded-[18px] border border-[#74583f]/12 bg-white/35 p-4 text-left"
                    >
                      <span className="font-serif text-lg">{item.label}</span>
                      <span className="mt-2 block text-xs leading-6 text-[#6a5a4c]">
                        {item.question}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {capacity ? (
                <div className="mt-8 rounded-[24px] border border-[#74583f]/12 bg-white/32 p-5">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Member-initiated capacity
                  </p>
                  <p className="mt-2 font-serif text-xl">{capacity.label}</p>
                  <p className="mt-3 text-sm leading-7 text-[#5e5145]">{capacity.question}</p>
                  <p className="mt-4 text-[11px] leading-6 text-[#8a7965]">
                    The retired pattern remains retired. This capacity does not search for or
                    reconfirm the old proposition.
                  </p>
                </div>
              ) : (
                <div className="mt-8 border-l-2 border-[#27877a]/25 pl-4">
                  <p className="font-serif text-lg">You can also use no tool at all.</p>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">What belongs to whom?</h2>
          <div className="mt-6 space-y-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">Pattern</p>
              <p>{retired ? 'Historical · retired from current use' : 'Current scaffold'}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Capacity state
              </p>
              <p>{state}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Human capacity
              </p>
              <p>Remains available to the member.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                MAIA / Soullab
              </p>
              <p>May scaffold practice. Does not own the capacity.</p>
            </div>
          </div>
          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Governing sentence
            </p>
            <p className="mt-2 font-serif text-lg leading-7">
              Patterns may organize learning for a time. Capacities should increasingly belong to
              the person.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
