'use client'

import { useState } from 'react'
import type { SpiralState, PersonalState } from './types'

const RELATIONAL_PHASE_LABELS: Record<number, string> = {
  1: 'Orientation',
  2: 'Capacity',
  3: 'Autonomy',
  4: 'Seasonal Return',
}

const ELEMENT_COLOR: Record<string, string> = {
  fire: 'text-orange-400',
  water: 'text-blue-400',
  earth: 'text-green-600',
  air: 'text-sky-300',
  aether: 'text-violet-400',
}

interface Props {
  spiralState: SpiralState | null
  recentStates: PersonalState[]
  memberId: string
}

export function PhaseStatePanel({ spiralState, recentStates, memberId }: Props) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [localStates, setLocalStates] = useState<PersonalState[]>(recentStates)

  const phase = spiralState?.relational_phase
  const element = spiralState?.dominant_element

  async function addState() {
    if (!label.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/maia/living-field/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
        body: JSON.stringify({ state_key: 'emotional_weather', label: label.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setLocalStates((prev) => [data.state, ...prev])
        setLabel('')
        setAdding(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg bg-stone-900 border border-stone-800 p-4 space-y-3">
      <div className="flex items-center gap-4 flex-wrap">
        {element && (
          <span className={`text-sm font-medium capitalize ${ELEMENT_COLOR[element] ?? 'text-stone-300'}`}>
            {element}
          </span>
        )}
        {phase && RELATIONAL_PHASE_LABELS[phase] && (
          <span className="text-stone-400 text-sm">{RELATIONAL_PHASE_LABELS[phase]}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {localStates.map((s) => (
          <span
            key={s.id}
            className="px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-xs"
          >
            {s.label}
          </span>
        ))}

        {adding ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addState()}
              placeholder="e.g. grounded, uncertain..."
              className="bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-100 outline-none focus:border-amber-500 w-40"
            />
            <button
              onClick={addState}
              disabled={saving}
              className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50"
            >
              Add
            </button>
            <button onClick={() => setAdding(false)} className="text-xs text-stone-500">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="px-2.5 py-1 rounded-full border border-dashed border-stone-700 text-stone-500 text-xs hover:border-stone-500 hover:text-stone-400 transition-colors"
          >
            + Add current state
          </button>
        )}
      </div>
    </div>
  )
}
