'use client'

/** One surfaced Keep the draft drew from, with its selection warrant. */
export interface SurfacedKeep {
  atom_id: string
  title: string
  affinity_score: number
  why_qualified: string[]
}

/** Refine-draft provenance — the denominator the draft drew from (never hidden). */
export interface DraftGathering {
  selection_criterion: string
  denominator: number
  surfaced_count: number
  surfaced: SurfacedKeep[]
}

export interface MaiaCandidate {
  candidate_expression: string
  rationale: string
  sources_used: string[]
  gathering?: DraftGathering | null
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

      {/* Refine-draft provenance — the draft may not present a truncated subset as
          the whole. The full set is inspectable in "What has gathered here" above. */}
      {candidate.gathering && candidate.gathering.denominator > 0 && (
        <p className="text-stone-500 text-xs border-t border-stone-800/70 pt-2">
          Drafted from {candidate.gathering.surfaced_count} of{' '}
          {candidate.gathering.denominator} Keep
          {candidate.gathering.denominator !== 1 ? 's' : ''} gathered in this dimension.
          {candidate.gathering.denominator > candidate.gathering.surfaced_count && (
            <span className="text-stone-600">
              {' '}See <span className="italic">What has gathered here</span> above to inspect all{' '}
              {candidate.gathering.denominator}.
            </span>
          )}
        </p>
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
