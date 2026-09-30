'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { LivingField, PersonalSpiral, PersonalState, SpiralState } from './types'
import { LivingFieldCard } from './LivingFieldCard'
import { SpiralSummaryCard } from './SpiralSummaryCard'
import { PhaseStatePanel } from './PhaseStatePanel'
import { LivingEncounterView } from './LivingEncounterView'
import { ReturnHome } from '@/components/navigation/ReturnHome'
import { LivingConstellationPanel } from '@/components/maia/living-constellation/LivingConstellationPanel'
import { LifeFacetFlowPanel } from './LifeFacetFlowPanel'
import { LivingFieldInstrument } from './LivingFieldInstrument'

const LivingFieldSpatialAperture = dynamic(
  () => import('./LivingFieldSpatialAperture').then((module) => module.LivingFieldSpatialAperture),
  { ssr: false },
)

const RELATIONAL_PHASE_LABELS: Record<number, string> = {
  1: 'Orientation',
  2: 'Capacity',
  3: 'Autonomy',
  4: 'Seasonal Return',
}

interface Props {
  fields: LivingField[]
  spiralState: SpiralState | null
  activeSpirals: PersonalSpiral[]
  recentStates: PersonalState[]
  memberId: string
  r2Presentation?: boolean
}

export function PersonalLivingFieldDashboard({
  fields,
  spiralState,
  activeSpirals,
  recentStates,
  memberId,
  r2Presentation = false,
}: Props) {
  const phase = spiralState?.relational_phase
  const phaseLabel = phase ? RELATIONAL_PHASE_LABELS[phase] : null

  // "Talk this through" stays IN the field — it opens the in-field encounter
  // (Current Questions: the dimension for what is alive right now), never a
  // navigation away to main MAIA. Closing returns to the constellation.
  const [talkOpen, setTalkOpen] = useState(false)
  const [spatialOpen, setSpatialOpen] = useState(false)
  const [r2ViewportReady, setR2ViewportReady] = useState(false)
  const encounterRef = useRef<HTMLDivElement>(null)
  const spatialRef = useRef<HTMLDivElement>(null)
  const spatialTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!r2Presentation) {
      setR2ViewportReady(false)
      setSpatialOpen(false)
      return
    }

    const query = window.matchMedia('(min-width: 901px)')
    const sync = () => {
      setR2ViewportReady(query.matches)
      if (!query.matches) setSpatialOpen(false)
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [r2Presentation])

  function beginMaiaExploration() {
    setTalkOpen(true)
    window.requestAnimationFrame(() => {
      encounterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function openSpatialField() {
    setSpatialOpen(true)
    window.requestAnimationFrame(() => {
      spatialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function returnFromSpatialField() {
    setSpatialOpen(false)
    window.requestAnimationFrame(() => spatialTriggerRef.current?.focus())
  }

  // Surface aliveness at the top level. A field is "alive" if the member has
  // authored it OR material has gathered into it. Order alive fields first so the
  // constellation never opens looking empty when it isn't.
  const rank = (f: LivingField) =>
    f.current_expression ? 0 : (f.gathered_count ?? 0) > 0 ? 1 : 2
  const orderedFields = [...fields].sort((a, b) => rank(a) - rank(b))
  const gatheringCount = fields.filter(
    (f) => !f.current_expression && (f.gathered_count ?? 0) > 0
  ).length
  const authoredCount = fields.filter((f) => f.current_expression).length

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* The way out. The House opens this room with
            `returnBehavior: 'back-to-home'`; until this link existed nothing in
            the page's whole component closure honoured that, so a member who
            entered had no route home. */}
        <ReturnHome className="text-stone-500 hover:text-stone-300 text-sm" />

        {/* Welcome header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-stone-100">Living Field</h1>
          <div className="max-w-2xl space-y-2">
            <p className="text-stone-300 text-base leading-relaxed">
              See the different parts of your life together.
            </p>
            <p className="text-stone-400 text-sm leading-relaxed">
              Each dimension is an area of life you may want to notice over time. Open one when
              something there feels alive, important, changing, or worth returning to.
            </p>
            <p className="text-stone-500 text-sm leading-relaxed">
              As the field grows, connections can begin to appear between different parts of your life.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <span className="text-stone-400 text-sm">Bring what feels alive.</span>
            <button
              type="button"
              onClick={beginMaiaExploration}
              className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
            >
              Explore with MAIA →
            </button>
          </div>
          {phaseLabel ? (
            <p className="text-stone-500 text-xs">
              Current life phase: <span className="text-stone-300">{phaseLabel}</span>
            </p>
          ) : (
            <p className="text-stone-600 text-xs">
              The spiral is beginning to take shape as patterns gather.
            </p>
          )}
          {(gatheringCount > 0 || authoredCount > 0) && (
            <p className="text-teal-300/70 text-xs">
              {authoredCount > 0 && (
                <span>{authoredCount} dimension{authoredCount !== 1 ? 's' : ''} taking shape</span>
              )}
              {authoredCount > 0 && gatheringCount > 0 && <span className="text-stone-600"> · </span>}
              {gatheringCount > 0 && (
                <span>{gatheringCount} gathering from saved reflections</span>
              )}
            </p>
          )}
        </div>

        {/* VFE-02R12 / RUNTIME-01: additive first witness. The existing Living Field
            remains below unchanged while recursive WORLD/PATH navigation is witnessed. */}
        <LivingFieldInstrument />

        {r2Presentation && r2ViewportReady ? (
          <div ref={spatialRef} className="scroll-mt-4">
            {!spatialOpen ? (
              <div className="flex justify-center">
                <button
                  ref={spatialTriggerRef}
                  type="button"
                  onClick={openSpatialField}
                  className="rounded-full border border-amber-200/15 bg-amber-100/[0.03] px-4 py-2 text-sm text-amber-200/80 transition hover:border-amber-200/30 hover:text-amber-100"
                >
                  See the wider field →
                </button>
              </div>
            ) : (
              <LivingFieldSpatialAperture onReturn={returnFromSpatialField} />
            )}
          </div>
        ) : null}

        {/* LC-02: same read-only constellation used across all three rooms. */}
        <LivingConstellationPanel focus="living" />

        {/* LOF-01: only member-explicit crossings. This is factual continuity,
            not an inferred psychological graph. It sits before developmental
            readings so authored movement remains primary evidence. */}
        <LifeFacetFlowPanel />

        {/* Active spirals */}
        {activeSpirals.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-stone-500 text-xs uppercase tracking-widest">
              Active Spirals
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {activeSpirals.map((s) => (
                <SpiralSummaryCard key={s.id} spiral={s} />
              ))}
            </div>
          </section>
        )}

        {/* Current state / emotional weather */}
        <section className="space-y-3">
          <h2 className="text-stone-500 text-xs uppercase tracking-widest">
            Emotional Weather
          </h2>
          <PhaseStatePanel
            spiralState={spiralState}
            recentStates={recentStates}
            memberId={memberId}
          />
        </section>

        {/* Living field constellation */}
        <section className="space-y-4">
          <div>
            <h2 className="text-stone-500 text-xs uppercase tracking-widest">
              Living Field Dimensions
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
              These are areas of life Soullab can help you notice over time — not forms you need to complete.
              Open a dimension to see what has gathered, write what feels true now, or explore it with MAIA.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orderedFields.map((field) => (
              <LivingFieldCard key={field.field_key} field={field} memberId={memberId} />
            ))}
          </div>
        </section>

        {/* Footer invite — stays in the field */}
        <div ref={encounterRef} className="border-t border-stone-800 pt-6 scroll-mt-6">
          {talkOpen ? (
            <LivingEncounterView
              fieldKey="current_questions"
              fieldLabel="Current Questions"
              memberId={memberId}
              onClose={() => setTalkOpen(false)}
            />
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setTalkOpen(true)}
                className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
              >
                Stay with this a little longer →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
