'use client'

import { useState } from 'react'
import {
  APPLICABILITY_GRAMMAR,
  applicabilityAfterRevalidation,
  applicabilityAfterSourceChange,
  type PatternApplicabilityState,
  type RevalidationRelation,
} from '@/lib/maia/life-loop/patternAging'

const PATTERN =
  'Some chapter transitions create continuity friction even when the core idea is clear.'

const V1 =
  'The work is becoming clearer, but I do not want to lose its soul while I make it more coherent.'

const V2 =
  'The chapter transitions have been substantially revised for the next release version.'

export function PatternAgingWitnessClient() {
  const [sourceVersion, setSourceVersion] = useState<'ea:v1' | 'ea:v2'>('ea:v1')
  const [applicability, setApplicability] =
    useState<PatternApplicabilityState>('CURRENT_PROVISIONAL')
  const [showHistorical, setShowHistorical] = useState(false)
  const [testing, setTesting] = useState(false)
  const [lastRelation, setLastRelation] = useState<RevalidationRelation | null>(null)

  function advanceToV2() {
    const next = applicabilityAfterSourceChange({
      patternSourceVersion: 'ea:v1',
      currentSourceVersion: 'ea:v2',
      implicatedRegionChanged: true,
    })
    setSourceVersion('ea:v2')
    setApplicability(next)
    setTesting(false)
    setLastRelation(null)
  }

  function revalidate(relation: RevalidationRelation) {
    setLastRelation(relation)
    setApplicability(applicabilityAfterRevalidation(relation))
    setTesting(false)
  }

  function reset() {
    setSourceVersion('ea:v1')
    setApplicability('CURRENT_PROVISIONAL')
    setShowHistorical(false)
    setTesting(false)
    setLastRelation(null)
  }

  const grammar = APPLICABILITY_GRAMMAR[applicability]

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03E · Pattern aging / revalidation
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Can the work remain the same while the pattern stops being current?
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
            Same living-object identity
          </p>
          <p className="mt-2 font-mono text-[11px] text-[#8a7965]">
            work:elemental-alchemy · {sourceVersion}
          </p>
          <h2 className="mt-4 font-serif text-3xl">Elemental Alchemy</h2>

          <div className="mt-8">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Current source truth
            </p>
            <p className="mt-3 font-serif text-2xl leading-9">
              {sourceVersion === 'ea:v1' ? V1 : V2}
            </p>
          </div>

          <div className="mt-8 rounded-[24px] border border-[#74583f]/12 bg-white/32 p-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Historical proposition · earned on ea:v1
            </p>
            <p className="mt-3 font-serif text-xl leading-8">{PATTERN}</p>

            <div className="mt-5 border-l-2 border-[#c69b5d]/45 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                {grammar.label}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#5e5145]">{grammar.statement}</p>
            </div>

            {lastRelation && (
              <p className="mt-4 text-[11px] text-[#8a7965]">
                Latest current-context evidence relationship: {lastRelation}
              </p>
            )}
          </div>

          {sourceVersion === 'ea:v1' && (
            <button
              type="button"
              onClick={advanceToV2}
              className="mt-8 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
            >
              Simulate transition rewrite → ea:v2
            </button>
          )}

          {sourceVersion === 'ea:v2' && applicability === 'REVALIDATION_REQUIRED' && !testing && (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <button
                type="button"
                onClick={() => setTesting(true)}
                className="text-[#795230] underline underline-offset-4"
              >
                Re-test on current version
              </button>
              <button
                type="button"
                onClick={() => setShowHistorical(true)}
                className="text-[#795230] underline underline-offset-4"
              >
                Inspect v1 evidence
              </button>
              <button
                type="button"
                onClick={() => setApplicability('DORMANT')}
                className="text-[#795230] underline underline-offset-4"
              >
                Let this pattern rest
              </button>
              <button
                type="button"
                onClick={() => setApplicability('RETIRED_FROM_CURRENT_USE')}
                className="text-[#795230] underline underline-offset-4"
              >
                Retire from current use
              </button>
            </div>
          )}

          {testing && (
            <div className="mt-8 rounded-[22px] border border-[#74583f]/12 bg-white/35 p-5">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Revalidation test · current ea:v2 only
              </p>
              <p className="mt-3 text-sm leading-7">
                Does transition friction still appear in the revised manuscript?
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => revalidate('supports')}
                  className="rounded-[16px] border border-[#74583f]/12 bg-white/40 p-4 text-left text-sm"
                >
                  Returned report: transitions are still hard to follow
                </button>
                <button
                  type="button"
                  onClick={() => revalidate('contradicts')}
                  className="rounded-[16px] border border-[#74583f]/12 bg-white/40 p-4 text-left text-sm"
                >
                  Returned report: revised transitions are clear
                </button>
                <button
                  type="button"
                  onClick={() => revalidate('outside_scope')}
                  className="rounded-[16px] border border-[#74583f]/12 bg-white/40 p-4 text-left text-sm"
                >
                  Returned report: transitions are clear; one example is confusing
                </button>
              </div>
            </div>
          )}

          {showHistorical && (
            <details open className="mt-8 border-l-2 border-[#c69b5d]/45 pl-4">
              <summary className="cursor-pointer list-none text-sm text-[#795230]">
                Historical v1 evidence remains inspectable
              </summary>
              <p className="mt-3 text-sm leading-7 text-[#5e5145]">
                Multiple readers reported transition continuity friction in ea:v1, with known
                counterevidence. That evidence remains historical; it is not silently promoted to
                ea:v2.
              </p>
            </details>
          )}

          {applicability === 'DORMANT' && (
            <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
              <p className="font-serif text-xl">The pattern is resting.</p>
              <p className="mt-2 text-sm leading-7 text-[#5e5145]">
                Historical evidence remains. The pattern is not currently guiding attention.
              </p>
            </div>
          )}

          {applicability === 'RETIRED_FROM_CURRENT_USE' && (
            <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
              <p className="font-serif text-xl">Retired from current use.</p>
              <p className="mt-2 text-sm leading-7 text-[#5e5145]">
                Prospective influence has ended. Historical evidence and provenance remain.
              </p>
            </div>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">What changed?</h2>

          <div className="mt-6 space-y-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Identity
              </p>
              <p>Still work:elemental-alchemy.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Source
              </p>
              <p>{sourceVersion === 'ea:v1' ? 'ea:v1' : 'ea:v2 · implicated transitions revised'}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Historical evidence
              </p>
              <p>Preserved.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Current applicability
              </p>
              <p>{grammar.label}</p>
            </div>
          </div>

          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Governing sentence
            </p>
            <p className="mt-2 font-serif text-lg leading-7">
              Memory may preserve that a pattern once fit. The present must decide whether it still
              does.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
