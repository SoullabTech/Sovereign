'use client'

import { useEffect, useState } from 'react'
import type { FieldGathering, GatheredKeep } from './types'

// Translate a raw evidence_reason ("register:developmental, lens:fire, source_type:idea")
// into plain language the member can read. This is the selection warrant made legible.
const REGISTER_WORDS: Record<string, string> = {
  developmental: 'a developmental movement',
  threshold: 'a threshold you crossed',
  relational: 'a relational pattern',
  archetypal: 'a symbolic pattern',
  episodic: 'a lived moment',
  thematic: 'a recurring theme',
  witnessed: 'something witnessed with you',
}
const LENS_WORDS: Record<string, string> = {
  fire: 'fire (vision, will, creativity)',
  water: 'water (feeling, relationship)',
  earth: 'earth (body, practice, work)',
  air: 'air (thought, question)',
  aether: 'aether (meaning, spirit)',
}
const SOURCE_WORDS: Record<string, string> = {
  dream: 'a dream',
  journal: 'a journal entry',
  reflection: 'a reflection',
  idea: 'an idea',
  idea_block: 'an idea',
  decision: 'a decision',
  change: 'a change',
  session_excerpt: 'a conversation',
  spontaneous: 'a note you wrote',
}

function humanizeWarrant(reason: string): string[] {
  const parts: string[] = []
  for (const token of reason.split(',').map((t) => t.trim())) {
    const [kind, value] = token.split(':')
    if (kind === 'register' && REGISTER_WORDS[value]) parts.push(`kept as ${REGISTER_WORDS[value]}`)
    else if (kind === 'lens' && LENS_WORDS[value]) parts.push(`seen through ${LENS_WORDS[value]}`)
    else if (kind === 'source_type' && SOURCE_WORDS[value]) parts.push(`came from ${SOURCE_WORDS[value]}`)
  }
  return parts
}

interface Props {
  fieldKey: string
  fieldLabel: string
  memberId: string
}

export function LivingFieldGatheringPanel({ fieldKey, fieldLabel, memberId }: Props) {
  const [gathering, setGathering] = useState<FieldGathering | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let alive = true
    fetch(`/api/maia/living-field/${fieldKey}/gathering`, {
      headers: { 'x-member-id': memberId },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (alive) setGathering(data) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [fieldKey, memberId])

  if (loading) {
    return <p className="text-stone-600 text-xs">Looking at what has gathered…</p>
  }
  if (!gathering || gathering.gathered_count === 0) {
    return null
  }

  const { gathered, gathered_count, denominator, criterion } = gathering
  const shown: GatheredKeep[] = expanded ? gathered : gathered.slice(0, 5)

  return (
    <div className="space-y-3 border-t border-stone-800 pt-4">
      {/* Denominator — never hidden */}
      <div className="space-y-1">
        <h4 className="text-teal-300/80 text-xs uppercase tracking-widest">What has gathered here</h4>
        <p className="text-stone-300 text-sm">
          <span className="text-teal-200">{gathered_count}</span>
          <span className="text-stone-500"> of </span>
          <span className="text-stone-300">{denominator}</span>
          <span className="text-stone-500">
            {' '}Keep{denominator !== 1 ? 's' : ''} you have held gathered into <span className="text-stone-300">{fieldLabel}</span>.
          </span>
        </p>
        <p className="text-stone-600 text-xs leading-relaxed">{criterion}</p>
      </div>

      {/* Why these — per-item selection warrant */}
      <ul className="space-y-2">
        {shown.map((k) => {
          const warrant = humanizeWarrant(k.evidence_reason)
          return (
            <li key={k.atom_id} className="text-sm border-l border-stone-800 pl-3">
              <p className="text-stone-300">{k.title}</p>
              {warrant.length > 0 && (
                <p className="text-stone-600 text-xs">
                  Here because it was {warrant.join(', ')}.
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {/* Inspectability — traverse to the full set */}
      {gathered_count > 5 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-stone-500 hover:text-stone-300 text-xs"
        >
          {expanded ? 'Show fewer' : `View all ${gathered_count}`}
        </button>
      )}
    </div>
  )
}
