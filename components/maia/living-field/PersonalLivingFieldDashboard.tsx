'use client'

import Link from 'next/link'
import type { LivingField, PersonalSpiral, PersonalState, SpiralState } from './types'
import { LivingFieldCard } from './LivingFieldCard'
import { SpiralSummaryCard } from './SpiralSummaryCard'
import { PhaseStatePanel } from './PhaseStatePanel'

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
}

export function PersonalLivingFieldDashboard({
  fields,
  spiralState,
  activeSpirals,
  recentStates,
  memberId,
}: Props) {
  const phase = spiralState?.relational_phase
  const phaseLabel = phase ? RELATIONAL_PHASE_LABELS[phase] : null

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

        {/* Welcome header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-stone-100">Your Living Field</h1>
          <p className="text-stone-400 text-sm max-w-xl leading-relaxed">
            AIN does not ask people to fill in fields. It cultivates Living Fields that grow
            alongside a life. These dimensions are not a profile — they are a developmental mirror.
          </p>
          {phaseLabel ? (
            <p className="text-stone-500 text-xs">
              Current life phase: <span className="text-stone-300">{phaseLabel}</span>
            </p>
          ) : (
            <p className="text-stone-600 text-xs">
              Your spiral state is still forming — it will appear here as patterns emerge.
            </p>
          )}
          {(gatheringCount > 0 || authoredCount > 0) && (
            <p className="text-teal-300/70 text-xs">
              {authoredCount > 0 && (
                <span>{authoredCount} dimension{authoredCount !== 1 ? 's' : ''} you've begun to author</span>
              )}
              {authoredCount > 0 && gatheringCount > 0 && <span className="text-stone-600"> · </span>}
              {gatheringCount > 0 && (
                <span>{gatheringCount} already gathering from what you've kept</span>
              )}
            </p>
          )}
        </div>

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
          <h2 className="text-stone-500 text-xs uppercase tracking-widest">
            Living Field Dimensions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orderedFields.map((field) => (
              <LivingFieldCard key={field.field_key} field={field} memberId={memberId} />
            ))}
          </div>
        </section>

        {/* Footer invite */}
        <div className="border-t border-stone-800 pt-6 text-center">
          <Link
            href="/maia"
            className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
          >
            Talk this through with MAIA →
          </Link>
        </div>
      </div>
    </div>
  )
}
