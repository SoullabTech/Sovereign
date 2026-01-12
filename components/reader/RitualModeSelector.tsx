'use client'

import { RitualMode } from './types'

interface RitualModeSelectorProps {
  mode: RitualMode
  onChange: (mode: RitualMode) => void
}

const modes: { key: RitualMode; label: string; color: string; description: string }[] = [
  { key: 'earth', label: 'Earth', color: 'bg-amber-600', description: 'Grounded presence' },
  { key: 'water', label: 'Water', color: 'bg-blue-500', description: 'Emotional flow' },
  { key: 'fire', label: 'Fire', color: 'bg-orange-500', description: 'Transformative action' },
  { key: 'air', label: 'Air', color: 'bg-cyan-400', description: 'Mental clarity' },
  { key: 'aether', label: 'Aether', color: 'bg-violet-500', description: 'Transcendent wisdom' }
]

export function RitualModeSelector({ mode, onChange }: RitualModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-stone-900/50 rounded-lg">
      <span className="text-xs text-stone-400 mr-2">Ritual Mode:</span>
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`
            w-8 h-8 rounded-full transition-all
            ${m.color}
            ${mode === m.key ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-900 scale-110' : 'opacity-50 hover:opacity-75'}
          `}
          title={`${m.label}: ${m.description}`}
        />
      ))}
    </div>
  )
}
