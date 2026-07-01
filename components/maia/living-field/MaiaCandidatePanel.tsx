'use client'

export interface MaiaCandidate {
  candidate_expression: string
  rationale: string
  sources_used: string[]
}

interface Props {
  candidate: MaiaCandidate
  onAccept: (expression: string) => void
  onEdit: (expression: string) => void
  onDismiss: () => void
}

export function MaiaCandidatePanel({ candidate, onAccept, onEdit, onDismiss }: Props) {
  return (
    <div className="rounded-lg bg-stone-900 border border-amber-900/40 p-4 space-y-3">
      <p className="text-stone-500 text-xs uppercase tracking-widest">
        Based on what has gathered so far, here is a possible current expression.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed italic">
        "{candidate.candidate_expression}"
      </p>
      {candidate.rationale && (
        <p className="text-stone-500 text-xs">{candidate.rationale}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => onAccept(candidate.candidate_expression)}
          className="px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-amber-100 text-xs transition-colors"
        >
          Feels true — accept
        </button>
        <button
          onClick={() => onEdit(candidate.candidate_expression)}
          className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 transition-colors"
        >
          Edit this
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 rounded text-stone-500 hover:text-stone-400 text-xs transition-colors"
        >
          Not quite — dismiss
        </button>
      </div>
    </div>
  )
}
