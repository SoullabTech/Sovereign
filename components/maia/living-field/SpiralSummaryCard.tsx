'use client'

import type { PersonalSpiral } from './types'

const PHASE_LABELS: Record<string, string> = {
  beginning: 'Beginning',
  disruption: 'Disruption',
  exploration: 'Exploration',
  integration: 'Integration',
  embodiment: 'Embodiment',
  transition: 'Transition',
  renewal: 'Renewal',
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-amber-500',
  integrating: 'bg-teal-600',
  complete: 'bg-stone-500',
  dormant: 'bg-stone-700',
}

export function SpiralSummaryCard({ spiral }: { spiral: PersonalSpiral }) {
  return (
    <div className="rounded-lg bg-stone-800 border border-stone-700 px-4 py-3 flex items-start gap-3">
      <span
        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLOR[spiral.status] ?? 'bg-stone-600'}`}
      />
      <div>
        <p className="text-stone-100 text-sm font-medium">{spiral.title}</p>
        {spiral.phase && (
          <p className="text-stone-400 text-xs mt-0.5">
            {PHASE_LABELS[spiral.phase] ?? spiral.phase}
          </p>
        )}
        {spiral.description && (
          <p className="text-stone-400 text-xs mt-1 line-clamp-2">{spiral.description}</p>
        )}
      </div>
    </div>
  )
}
