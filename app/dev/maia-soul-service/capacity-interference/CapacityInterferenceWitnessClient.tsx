'use client'

import { useState } from 'react'
import {
  CAPACITY_AFFORDANCES,
  type CapacityId,
} from '@/lib/maia/life-loop/capacityReorganization'
import {
  reportCapacityCoherence,
  type CapacityCoherenceReport,
} from '@/lib/maia/life-loop/capacityInterference'

type ViewState =
  | 'CHORD_ACTIVE'
  | 'REPORTED_CLEAR'
  | 'REPORTED_TENSION'
  | 'REPORTED_UNSURE'
  | 'SINGLE_FIRST'
  | 'SINGLE_SECOND'
  | 'SEQUENCED'
  | 'NO_SUPPORT'

const FIRST: CapacityId = 'compare_versions'
const SECOND: CapacityId = 'change_scale'

export function CapacityInterferenceWitnessClient() {
  const [view, setView] = useState<ViewState>('CHORD_ACTIVE')
  const [report, setReport] = useState<CapacityCoherenceReport | null>(null)
  const [memberReason, setMemberReason] = useState('')
  const [sequenceFirst, setSequenceFirst] = useState<CapacityId>(FIRST)

  const coherenceWitness = reportCapacityCoherence(
    FIRST,
    SECOND,
    report ?? 'UNSURE',
    memberReason.trim() || null,
  )
  const chord = coherenceWitness.chord

  const sequenceSecond = sequenceFirst === FIRST ? SECOND : FIRST

  function reset() {
    setView('CHORD_ACTIVE')
    setReport(null)
    setMemberReason('')
    setSequenceFirst(FIRST)
  }

  function chooseReport(next: CapacityCoherenceReport) {
    setReport(next)
    if (next === 'CLEAR_TOGETHER') setView('REPORTED_CLEAR')
    if (next === 'TENSION_PRESENT') setView('REPORTED_TENSION')
    if (next === 'UNSURE') setView('REPORTED_UNSURE')
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03J · Capacity interference
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            When two useful capacities become noisy together.
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[30px] border border-[#74583f]/10 bg-white/30 p-6 md:p-8">
          <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
            Current inquiry
          </p>
          <p className="mt-4 max-w-3xl font-serif text-2xl leading-[1.55] text-[#4b4037]">
            I am trying to understand whether a revision actually improved the chapter.
            Comparing versions helps me see what changed, but changing scale keeps pulling me
            between the paragraph, chapter, and whole argument.
          </p>

          {view !== 'NO_SUPPORT' && (
            <div className="mt-8">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Current capacities
              </p>

              {view === 'SEQUENCED' ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-7 text-[#5d5044]">
                    Use these one at a time. No order is inherently better.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[sequenceFirst, sequenceSecond].map((id, index) => (
                      <div
                        key={id}
                        data-sequenced-capacity={id}
                        className="rounded-[24px] border border-[#74583f]/12 bg-white/38 p-5"
                      >
                        <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                          Available separately {index + 1}
                        </p>
                        <h2 className="mt-2 font-serif text-2xl">
                          {CAPACITY_AFFORDANCES[id].label}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#5d5044]">
                          {CAPACITY_AFFORDANCES[id].question}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSequenceFirst(sequenceSecond)}
                    className="text-sm text-[#795230] underline underline-offset-4"
                  >
                    Reverse which one I use first
                  </button>
                </div>
              ) : view === 'SINGLE_FIRST' || view === 'SINGLE_SECOND' ? (
                <div className="mt-4 rounded-[24px] border border-[#74583f]/12 bg-white/38 p-5">
                  {(() => {
                    const id = view === 'SINGLE_FIRST' ? FIRST : SECOND
                    return (
                      <>
                        <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                          Single capacity · member selected
                        </p>
                        <h2 className="mt-2 font-serif text-2xl">
                          {CAPACITY_AFFORDANCES[id].label}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#5d5044]">
                          {CAPACITY_AFFORDANCES[id].question}
                        </p>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2" data-capacity-pair>
                  {chord.capacities.map((capacity, index) => (
                    <div
                      key={capacity.id}
                      data-active-capacity={capacity.id}
                      className="rounded-[24px] border border-[#74583f]/12 bg-white/38 p-5"
                    >
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                        Capacity {index + 1}
                      </p>
                      <h2 className="mt-2 font-serif text-2xl">{capacity.label}</h2>
                      <p className="mt-3 text-sm leading-7 text-[#5d5044]">
                        {capacity.question}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'CHORD_ACTIVE' && (
            <div className="mt-9">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Check the composition yourself
              </p>
              <div className="mt-4 space-y-3 font-serif text-lg leading-7 text-[#51463d]">
                <p>Can I still tell what each capacity is asking?</p>
                <p>Is each one revealing something distinct?</p>
                <p>Does holding both increase clarity—or split my attention?</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  data-coherence-report="clear"
                  onClick={() => chooseReport('CLEAR_TOGETHER')}
                  className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                >
                  Clear together
                </button>
                <button
                  type="button"
                  data-coherence-report="tension"
                  onClick={() => chooseReport('TENSION_PRESENT')}
                  className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                >
                  Tension present
                </button>
                <button
                  type="button"
                  data-coherence-report="unsure"
                  onClick={() => chooseReport('UNSURE')}
                  className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                >
                  I am not sure
                </button>
              </div>
            </div>
          )}

          {view === 'REPORTED_CLEAR' && (
            <div className="mt-9 border-l-2 border-[#27877a]/30 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Member report · current encounter
              </p>
              <p className="mt-2 font-serif text-xl">These are clear together right now.</p>
              <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
                This does not make the pair a preferred or reusable configuration.
              </p>
              <button
                type="button"
                onClick={() => setView('CHORD_ACTIVE')}
                className="mt-4 text-sm text-[#795230] underline underline-offset-4"
              >
                Reconsider
              </button>
            </div>
          )}

          {view === 'REPORTED_TENSION' && (
            <div className="mt-9 space-y-6">
              <div className="border-l-2 border-[#c69b5d]/45 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Member report · current encounter
                </p>
                <p className="mt-2 font-serif text-xl">
                  Holding both is splitting my attention right now.
                </p>
                <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
                  Both capacities remain valid. No capacity has been identified as the problem.
                </p>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Optional · say what the tension is
                </label>
                <textarea
                  value={memberReason}
                  onChange={(event) => setMemberReason(event.target.value)}
                  placeholder="For example: I keep switching levels before I can finish the comparison."
                  className="mt-3 min-h-24 w-full resize-y rounded-[18px] border border-[#74583f]/12 bg-white/45 p-4 text-sm leading-6 outline-none"
                />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                  What would help now?
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setView('REPORTED_CLEAR')}
                    className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                  >
                    Keep both
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('SINGLE_SECOND')}
                    className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                  >
                    Release Compare versions
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('SINGLE_FIRST')}
                    className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                  >
                    Release Change scale
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('SEQUENCED')}
                    className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                  >
                    Use one at a time
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('NO_SUPPORT')}
                    className="rounded-full border border-dashed border-[#74583f]/20 bg-white/20 px-4 py-2 text-sm"
                  >
                    Dissolve support
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === 'REPORTED_UNSURE' && (
            <div className="mt-9 border-l-2 border-[#27877a]/30 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Member report · current encounter
              </p>
              <p className="mt-2 font-serif text-xl">I am not sure whether these help together.</p>
              <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
                No decision is required. Uncertainty about the support itself is allowed.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setView('CHORD_ACTIVE')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Stay with both briefly
                </button>
                <button
                  type="button"
                  onClick={() => setView('SINGLE_FIRST')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Use one
                </button>
                <button
                  type="button"
                  onClick={() => setView('NO_SUPPORT')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Use neither
                </button>
              </div>
            </div>
          )}

          {(view === 'SINGLE_FIRST' || view === 'SINGLE_SECOND' || view === 'SEQUENCED') && (
            <div className="mt-8 flex flex-wrap gap-5 text-sm">
              <button
                type="button"
                onClick={() => setView('CHORD_ACTIVE')}
                className="text-[#795230] underline underline-offset-4"
              >
                Hold both together again
              </button>
              <button
                type="button"
                onClick={() => setView('NO_SUPPORT')}
                className="text-[#795230] underline underline-offset-4"
              >
                Return to no support
              </button>
            </div>
          )}

          {view === 'NO_SUPPORT' && (
            <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                No support
              </p>
              <p className="mt-2 font-serif text-xl">
                Simplicity can serve attention without meaning anything about capacity.
              </p>
              <button
                type="button"
                onClick={() => setView('CHORD_ACTIVE')}
                className="mt-4 text-sm text-[#795230] underline underline-offset-4"
              >
                Make both capacities available again
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Interference standing</h2>

          <dl className="mt-5 space-y-5 text-xs leading-6">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                report
              </dt>
              <dd>{report ?? 'NOT_ASKED'}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                standing
              </dt>
              <dd>{report ? 'MEMBER_REPORTED' : 'NONE'}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                compatibility score
              </dt>
              <dd>none</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                behavioral overload inference
              </dt>
              <dd>prohibited</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                persistence
              </dt>
              <dd>none</dd>
            </div>
          </dl>

          <p className="mt-7 border-t border-[#74583f]/12 pt-5 text-xs leading-6 text-[#6b5b4e]">
            Simplicity can serve attention without implying anything about the person's capability.
          </p>
        </aside>
      </div>
    </section>
  )
}
