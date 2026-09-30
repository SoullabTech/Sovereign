'use client'

import { useState } from 'react'
import {
  PROVISIONAL_PATTERN,
  governedProspectiveRelation,
  type ProspectiveEvidence,
} from '@/lib/maia/life-loop/prospectivePattern'

type AttentionMode = 'open' | 'explicit_test'

const REPORTS: ProspectiveEvidence[] = [
  {
    id: 'report-a',
    report:
      'The core idea was clear, but I lost the thread at the transition into the final section.',
    relation: 'supports',
  },
  {
    id: 'report-b',
    report: 'The core idea was clear and the chapter transitions were easy to follow.',
    relation: 'contradicts',
  },
  {
    id: 'report-c',
    report: 'The transitions were clear, but the example in the middle was confusing.',
    relation: 'outside_scope',
  },
  {
    id: 'report-d',
    report: 'I liked the chapter.',
    relation: 'insufficient',
  },
]

export function NonconfirmatoryAttentionWitnessClient() {
  const [mode, setMode] = useState<AttentionMode>('open')
  const [captured, setCaptured] = useState<ProspectiveEvidence | null>(null)

  const relation = captured ? governedProspectiveRelation(captured.relation) : null

  function reset(modeTo: AttentionMode = 'open') {
    setMode(modeTo)
    setCaptured(null)
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03D · Non-confirmatory attention
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Can a pattern guide inquiry without deciding what we see?
          </h1>
        </div>
        <button
          type="button"
          onClick={() => reset('open')}
          className="text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
        >
          Reset witness
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset('open')}
          className={[
            'rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.12em]',
            mode === 'open'
              ? 'border-[#b46f48]/35 bg-white/50 text-[#6f492f]'
              : 'border-[#8c745d]/15 bg-white/20 text-[#9b8875]',
          ].join(' ')}
        >
          Open encounter · default
        </button>
        <button
          type="button"
          onClick={() => reset('explicit_test')}
          className={[
            'rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.12em]',
            mode === 'explicit_test'
              ? 'border-[#b46f48]/35 bg-white/50 text-[#6f492f]'
              : 'border-[#8c745d]/15 bg-white/20 text-[#9b8875]',
          ].join(' ')}
        >
          Deliberate pattern test
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[32px] border border-[#74583f]/10 bg-white/28 p-6 md:p-8">
          {!captured ? (
            <>
              {mode === 'open' ? (
                <div data-open-capture>
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Open encounter
                  </p>
                  <p className="mt-4 font-serif text-3xl">What happened?</p>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5e5145]">
                    A provisional pattern exists in the wider evidence field, but it is not used
                    to lead this report. Capture the event first.
                  </p>
                </div>
              ) : (
                <div data-explicit-test>
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Explicit member-chosen pattern test
                  </p>
                  <p className="mt-4 font-serif text-2xl leading-9">{PROVISIONAL_PATTERN}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[18px] border border-[#74583f]/10 bg-white/30 p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                        Would support
                      </p>
                      <p className="mt-2 text-xs leading-6">
                        Repeated difficulty specifically at chapter transitions while the core idea
                        remains clear.
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[#74583f]/10 bg-white/30 p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                        Would count against
                      </p>
                      <p className="mt-2 text-xs leading-6">
                        Clear comprehension through the chapter transitions in relevant reading
                        contexts.
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[#74583f]/10 bg-white/30 p-4">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                        Could be outside scope
                      </p>
                      <p className="mt-2 text-xs leading-6">
                        A different comprehension problem that does not involve transition
                        continuity.
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 border-l-2 border-[#27877a]/30 pl-4 text-sm leading-7 text-[#5e5145]">
                    Observe whether transitions are clear or unclear, and record anything else that
                    materially affects comprehension.
                  </p>
                </div>
              )}

              <div className="mt-9">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Synthetic returned reports
                </p>
                <div className="mt-4 grid gap-3">
                  {REPORTS.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      data-report-choice={item.id}
                      onClick={() => setCaptured(item)}
                      className="rounded-[18px] border border-[#74583f]/12 bg-white/35 p-4 text-left"
                    >
                      <span className="text-[10px] uppercase tracking-[0.12em] text-[#8a7965]">
                        Receive report {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Returned lived report · captured before comparison
              </p>
              <p className="mt-4 font-serif text-2xl leading-9">“{captured.report}”</p>

              <div className="mt-8 border-t border-[#74583f]/12 pt-6" data-pattern-comparison>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Compare only after capture
                </p>
                <p className="mt-3 font-serif text-xl leading-8">{PROVISIONAL_PATTERN}</p>

                <div className="mt-5 border-l-2 border-[#c69b5d]/45 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    {relation?.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5145]">{relation?.statement}</p>
                  <p className="mt-2 text-[11px] leading-6 text-[#8a7965]">{relation?.effect}</p>
                </div>

                <p className="mt-6 text-[11px] leading-6 text-[#806f60]">
                  This comparison changes evidentiary standing only. It does not decide what the
                  event means about the writer or automatically promote the pattern.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCaptured(null)}
                className="mt-8 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                ← Capture another report
              </button>
            </>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Pattern influence on attention</h2>

          {mode === 'open' && !captured ? (
            <div className="mt-6" data-pattern-recessed>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Default posture
              </p>
              <p className="mt-2 text-sm leading-7">
                A provisional pattern is deliberately recessed until the lived report has been
                captured.
              </p>
            </div>
          ) : mode === 'explicit_test' && !captured ? (
            <div className="mt-6">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Transparent influence
              </p>
              <p className="mt-2 text-sm leading-7">
                You explicitly chose to let the pattern shape attention for this encounter.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Pattern comparison is now lawful
              </p>
              <p className="mt-2 text-sm leading-7">
                The returned report already exists. The pattern can no longer rewrite what was
                captured.
              </p>
            </div>
          )}

          <div className="mt-7 space-y-6 border-t border-[#74583f]/12 pt-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Hidden reranking
              </p>
              <p>Not allowed.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Outside-scope evidence
              </p>
              <p>May remain important without being forced into the active pattern.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Support
              </p>
              <p>Joins the evidence field. It does not automatically promote the pattern.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Governing sentence
              </p>
              <p className="font-serif text-lg leading-7">
                A pattern may help us know where to look. It may not decide what we are allowed to
                see.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
