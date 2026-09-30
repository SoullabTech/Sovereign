'use client'

import { useMemo, useState } from 'react'
import {
  derivePatternMaturity,
  type EvidenceRelation,
  type MaturityState,
} from '@/lib/maia/life-loop/patternMaturity'

type EvidenceEvent = {
  id: string
  label: string
  sourceStanding: string
  context: string
  contextGroup: string
  independenceKey: string
  relations: EvidenceRelation[]
  report: string
}

const BROAD = 'Readers lose the core idea when the chapter becomes difficult.'
const NARROW = 'Some chapter transitions create continuity friction even when the core idea is clear.'

const EVENTS: EvidenceEvent[] = [
  {
    id: 'event-1',
    label: 'Reader 1',
    sourceStanding: 'member-reported reader feedback',
    context: 'Chapter A · difficult section',
    contextGroup: 'chapter-a',
    independenceKey: 'reader-1',
    relations: ['supports_broad'],
    report: 'I had trouble following the core idea once the chapter became difficult.',
  },
  {
    id: 'event-2',
    label: 'Reader 2',
    sourceStanding: 'member-reported reader feedback',
    context: 'Chapter A · transition 1',
    contextGroup: 'chapter-a',
    independenceKey: 'reader-2',
    relations: ['contradicts_broad', 'supports_narrow'],
    report: 'The core idea was clear, but I lost the thread at the transition.',
  },
  {
    id: 'event-3',
    label: 'Reader 3',
    sourceStanding: 'member-reported reader feedback',
    context: 'Chapter A · transition 2',
    contextGroup: 'chapter-a',
    independenceKey: 'reader-3',
    relations: ['supports_narrow'],
    report: 'The core idea was clear. A different transition was hard to follow.',
  },
  {
    id: 'event-4',
    label: 'Reader 4',
    sourceStanding: 'member-reported reader feedback',
    context: 'Chapter A · same reading task',
    contextGroup: 'chapter-a',
    independenceKey: 'reader-4',
    relations: ['counterexample_narrow'],
    report: 'I did not have difficulty with either the core idea or the transitions.',
  },
  {
    id: 'event-5',
    label: 'Reader 5',
    sourceStanding: 'member-reported reader feedback',
    context: 'Chapter B · transition',
    contextGroup: 'chapter-b',
    independenceKey: 'reader-5',
    relations: ['supports_narrow'],
    report: 'The core idea was clear, but one chapter transition was hard to follow.',
  },
]

function stateLabel(state: MaturityState) {
  return state.replaceAll('_', ' ')
}

function evidenceRelationLabel(event: EvidenceEvent): string {
  const labels: string[] = []

  if (event.relations.includes('supports_broad')) {
    labels.push('bears on broad proposition')
  }
  if (event.relations.includes('contradicts_broad')) {
    labels.push('contradicts broad proposition as stated')
  }
  if (event.relations.includes('supports_narrow')) {
    labels.push('supports narrower transition proposition')
  }
  if (event.relations.includes('counterexample_narrow')) {
    labels.push('counterexample to narrower recurrence')
  }

  return labels.join(' · ')
}

export function PatternMaturityWitnessClient() {
  const [step, setStep] = useState(0)
  const [declined, setDeclined] = useState(false)
  const [unresolved, setUnresolved] = useState(false)

  const visibleEvents = useMemo(() => EVENTS.slice(0, step + 1), [step])
  const maturity = useMemo(() => derivePatternMaturity(visibleEvents), [visibleEvents])
  const current = {
    ...maturity,
    proposition: maturity.propositionKind === 'narrow' ? NARROW : BROAD,
  }

  function advance() {
    if (step < EVENTS.length - 1) {
      setStep((value) => value + 1)
      setDeclined(false)
      setUnresolved(false)
    }
  }

  function reset() {
    setStep(0)
    setDeclined(false)
    setUnresolved(false)
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03C · Lived-evidence maturity
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            When does evidence deserve a pattern?
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
          <div>
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Current evidence proposition
            </p>
            <p className="mt-3 font-serif text-2xl leading-9">{current.proposition}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#9a8067]/20 bg-white/45 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#795f48]">
                {stateLabel(current.state)}
              </span>
              <span className="text-[11px] text-[#806f60]">
                proposition state · not a member level
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#5e5145]">
              {current.broadStanding}
            </p>
            <p className="mt-2 text-[11px] leading-6 text-[#8a7965]">{current.note}</p>
          </div>

          <div className="mt-9">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Lived evidence field
              </p>
              <p className="text-[10px] text-[#9a8972]">
                {visibleEvents.length} event{visibleEvents.length === 1 ? '' : 's'} visible
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {visibleEvents.map((event, index) => (
                <article
                  key={event.id}
                  data-evidence-event={event.id}
                  className={[
                    'rounded-[22px] border p-4',
                    event.relations.includes('counterexample_narrow') || event.relations.includes('contradicts_broad')
                      ? 'border-[#8a725b]/20 bg-[#f6eee4]'
                      : 'border-[#8a725b]/12 bg-white/35',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                        Event {index + 1} · {event.label}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8a7965]">{event.context}</p>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[#795f48]">
                      {event.sourceStanding}
                    </span>
                  </div>
                  <p className="mt-3 font-serif text-lg leading-7 text-[#4b4037]">
                    “{event.report}”
                  </p>
                  <p className="mt-3 text-[10px] text-[#8a7965]">
                    {evidenceRelationLabel(event)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {declined ? (
            <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Member ruling
              </p>
              <p className="mt-2 font-serif text-xl">
                Do not keep this as a pattern for me.
              </p>
              <p className="mt-2 text-[11px] leading-6 text-[#806f60]">
                The events remain evidence. The proposed pattern does not gain personal standing.
              </p>
            </div>
          ) : unresolved ? (
            <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Lawful outcome
              </p>
              <p className="mt-2 font-serif text-xl">Leave the larger pattern unresolved.</p>
              <p className="mt-2 text-[11px] leading-6 text-[#806f60]">
                Evidence can remain accumulated without being forced into a broader claim.
              </p>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {step < EVENTS.length - 1 && (
                <button
                  type="button"
                  onClick={advance}
                  className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
                >
                  Add next lived event
                </button>
              )}
              <button
                type="button"
                onClick={() => setUnresolved(true)}
                className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Leave unresolved
              </button>
              <button
                type="button"
                onClick={() => setDeclined(true)}
                className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Decline this pattern
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">What may mature?</h2>

          <div className="mt-6 space-y-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                The proposition
              </p>
              <p>Its evidence standing may strengthen, weaken, narrow, split, or remain unresolved.</p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Never automatically
              </p>
              <p>
                The member’s identity, personality, diagnosis, worth, progress, or developmental rank.
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                No magic count
              </p>
              <p>
                Event count is visible, but no number promotes evidence automatically. Context,
                independence, contradiction, and scope still matter.
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Counterevidence
              </p>
              <p>
                Event 4 remains visible even after a provisional narrower pattern appears.
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Governing sentence
            </p>
            <p className="mt-2 font-serif text-lg leading-7">
              Evidence may accumulate. Meaning must remain proportionate to what actually accumulated.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
