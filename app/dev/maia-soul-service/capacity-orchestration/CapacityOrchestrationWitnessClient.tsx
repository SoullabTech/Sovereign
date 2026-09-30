'use client'

import { useState } from 'react'
import {
  SMALL_CAPACITY_OFFERS,
  limitCapacityOffers,
  orchestrationAfterMemberSelection,
  orchestrationAfterSecondMemberChoice,
  orchestrationWithoutSupport,
  type OrchestrationMode,
} from '@/lib/maia/life-loop/capacityOrchestration'
import { CAPACITY_AFFORDANCES, type CapacityId } from '@/lib/maia/life-loop/capacityReorganization'

const INQUIRY =
  'Two reader reports about the same revised passage disagree. One says the transition now works; the other still loses the thread. The author has not decided whether another revision is needed.'

export function CapacityOrchestrationWitnessClient() {
  const [mode, setMode] = useState<OrchestrationMode>('NO_SUPPORT')
  const [maiaOpen, setMaiaOpen] = useState(false)
  const [selected, setSelected] = useState<CapacityId[]>([])
  const [rejectedOffers, setRejectedOffers] = useState(false)

  const offers = limitCapacityOffers(SMALL_CAPACITY_OFFERS, 3)

  function choose(id: CapacityId) {
    setSelected((current) => {
      if (current.includes(id)) return current
      const next = [...current, id]
      setMode(
        next.length > 1
          ? orchestrationAfterSecondMemberChoice()
          : orchestrationAfterMemberSelection(),
      )
      return next
    })
    setMaiaOpen(false)
    setRejectedOffers(false)
  }

  function chooseNone() {
    setSelected([])
    setMode(orchestrationWithoutSupport())
    setMaiaOpen(false)
    setRejectedOffers(false)
  }

  function rejectMaiaSet() {
    setRejectedOffers(true)
    setMaiaOpen(false)
    setMode(orchestrationWithoutSupport())
  }

  function reset() {
    setMode('NO_SUPPORT')
    setMaiaOpen(false)
    setSelected([])
    setRejectedOffers(false)
  }

  const active = selected.map((id) => CAPACITY_AFFORDANCES[id])

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03H · Capacity orchestration
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Choose the support. Or choose none.
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
            Current inquiry
          </p>
          <p className="mt-3 font-serif text-2xl leading-9">{INQUIRY}</p>

          {selected.length === 0 && !maiaOpen && (
            <div className="mt-8 border-l-2 border-[#27877a]/25 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                No support active
              </p>
              <p className="mt-2 text-sm leading-7 text-[#5e5145]">
                You can stay with the inquiry as it is. Nothing needs to be activated.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <button
              type="button"
              onClick={() => choose('compare_versions')}
              className="text-[#795230] underline underline-offset-4"
            >
              Choose Compare versions directly
            </button>
            <button
              type="button"
              onClick={() => setMaiaOpen(true)}
              className="text-[#795230] underline underline-offset-4"
            >
              Ask MAIA what ways of working are available
            </button>
            <button
              type="button"
              onClick={chooseNone}
              className="text-[#795230] underline underline-offset-4"
            >
              Stay with this without a tool
            </button>
          </div>

          {maiaOpen && (
            <div className="mt-8 rounded-[24px] border border-[#74583f]/12 bg-white/34 p-5">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                MAIA · invited capacity menu · non-ranked
              </p>
              <p className="mt-3 text-sm leading-7 text-[#5e5145]">
                A few possible ways of working are available. None is the correct one.
              </p>
              <div className="mt-5 grid gap-3">
                {offers.map((offer) => (
                  <button
                    key={offer.id}
                    data-capacity-offer={offer.id}
                    type="button"
                    onClick={() => choose(offer.id)}
                    className="rounded-[16px] border border-[#74583f]/12 bg-white/40 p-4 text-left"
                  >
                    <span className="font-serif text-lg">{offer.label}</span>
                    <span className="mt-2 block text-xs leading-6 text-[#6a5a4c]">
                      Foregrounds {offer.foregrounds}.
                    </span>
                  </button>
                ))}
                <button
                  data-capacity-offer="none"
                  type="button"
                  onClick={rejectMaiaSet}
                  className="rounded-[16px] border border-dashed border-[#74583f]/18 bg-white/20 p-4 text-left"
                >
                  <span className="font-serif text-lg">None right now</span>
                  <span className="mt-2 block text-xs leading-6 text-[#6a5a4c]">
                    Keep the inquiry open without adding a scaffold.
                  </span>
                </button>
              </div>
            </div>
          )}

          {rejectedOffers && (
            <div className="mt-7 border-l-2 border-[#27877a]/30 pl-4">
              <p className="font-serif text-xl">No capacity selected.</p>
              <p className="mt-2 text-sm leading-7 text-[#5e5145]">
                MAIA's offered set has no standing after rejection.
              </p>
            </div>
          )}

          {active.length > 0 && (
            <div className="mt-8 space-y-5">
              {active.map((capacity, index) => (
                <div
                  key={capacity.id}
                  className="rounded-[22px] border border-[#74583f]/12 bg-white/32 p-5"
                >
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    {index === 0 ? 'Member-chosen capacity' : 'Later member-chosen capacity'}
                  </p>
                  <p className="mt-2 font-serif text-xl">{capacity.label}</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5145]">{capacity.question}</p>
                </div>
              ))}

              {selected.length === 1 && (
                <div className="border-t border-[#74583f]/12 pt-5">
                  <p className="text-sm leading-7 text-[#5e5145]">
                    If the inquiry changes, you may choose another capacity. There is no next step.
                  </p>
                  <button
                    type="button"
                    onClick={() => choose('seek_counterevidence')}
                    className="mt-3 text-sm text-[#795230] underline underline-offset-4"
                  >
                    The comparison raised a contradiction → look for counterevidence
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Who is orchestrating?</h2>
          <div className="mt-6 space-y-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Orchestration mode
              </p>
              <p>{mode}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Active capacities
              </p>
              <p>{active.length ? active.map((x) => x.label).join(' → ') : 'None'}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Hidden ranking
              </p>
              <p>None.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Developmental score
              </p>
              <p>None.</p>
            </div>
          </div>

          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Governing sentence
            </p>
            <p className="mt-2 font-serif text-lg leading-7">
              Good orchestration helps the person choose their support. Great orchestration
              increasingly lets them know when they need none.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
