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

function humanizeWarrant(reason: string): string {
  const regs: string[] = []
  const lenses: string[] = []
  const srcs: string[] = []
  for (const token of reason.split(',').map((t) => t.trim())) {
    const [kind, value] = token.split(':')
    if (kind === 'register' && REGISTER_WORDS[value]) regs.push(REGISTER_WORDS[value])
    else if (kind === 'lens' && LENS_WORDS[value]) lenses.push(LENS_WORDS[value])
    else if (kind === 'source_type' && SOURCE_WORDS[value]) srcs.push(SOURCE_WORDS[value])
  }
  const clauses: string[] = []
  if (regs.length) clauses.push(`kept as ${regs.join(' and ')}`)
  if (lenses.length) clauses.push(`seen through ${lenses.join(' and ')}`)
  if (srcs.length) clauses.push(`drawn from ${srcs.join(' and ')}`)
  return clauses.join(', ')
}

// A Keep gathered on a "broad" signal when only its source type placed it here —
// no register, no elemental lens. Broad signals route the same Keep into several
// dimensions, so disclosing this keeps the warrant honest about its own thinness.
function isBroadSignal(reason: string): boolean {
  return !/register:|lens:/.test(reason)
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

  // Honesty about the gathering's own precision: when most Keeps gathered on a
  // broad signal (source type only), say so — don't let a thin rationale read as
  // a rich one. This makes the mapping's coarseness inspectable, not hidden.
  const broadCount = gathered.filter((k) => isBroadSignal(k.evidence_reason)).length
  const broadDominant = gathered_count > 0 && broadCount / gathered_count > 0.6

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
        {broadDominant && (
          <p className="text-amber-700/80 text-xs leading-relaxed">
            Most of these gathered on a single broad signal — the <em>kind</em> of Keep, not a
            register or elemental lens. Broad signals route the same Keep into more than one
            dimension. Giving a Keep a register or lens would place it more precisely.
          </p>
        )}
      </div>

      {/* Why these — per-item selection warrant + match strength */}
      <ul className="space-y-2">
        {shown.map((k) => {
          const warrant = humanizeWarrant(k.evidence_reason)
          return (
            <li key={k.atom_id} className="text-sm border-l border-stone-800 pl-3">
              <p className="text-stone-300">{k.title}</p>
              <p className="text-stone-600 text-xs">
                {warrant && <>Here because it was {warrant}. </>}
                <span className="text-stone-700">match {k.affinity_score.toFixed(2)}</span>
              </p>
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
