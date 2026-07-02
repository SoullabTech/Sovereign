'use client'

import { useState } from 'react'
import type { LivingField, FieldVersion, FieldSource, ParticipantConsent } from './types'
import { LivingFieldDetailPanel } from './LivingFieldDetailPanel'

const STATUS_DOT: Record<string, string> = {
  gathering: 'bg-stone-600',
  active: 'bg-amber-500',
  resting: 'bg-teal-700',
}

function formatRelativeDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface DetailData {
  versions: FieldVersion[]
  sources: FieldSource[]
  consents: ParticipantConsent[]
}

interface Props {
  field: LivingField
  memberId: string
}

export function LivingFieldCard({ field, memberId }: Props) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(false)

  async function openDetail() {
    if (!detail) {
      setLoading(true)
      try {
        const res = await fetch(`/api/maia/living-field/${field.field_key}`, {
          headers: { 'x-member-id': memberId },
        })
        if (res.ok) {
          const data = await res.json()
          setDetail({ versions: data.versions, sources: data.sources, consents: data.consents })
        }
      } finally {
        setLoading(false)
      }
    }
    setOpen(true)
  }

  const hasExpression = Boolean(field.current_expression)
  const gathered = field.gathered_count ?? 0
  // A field is truly empty only when nothing has gathered AND nothing is authored.
  const isGatheringWithoutExpression = !hasExpression && gathered > 0
  // A field holding gathered material but no authored expression is "gathering",
  // never "empty" — the dot reflects that the field is alive with material.
  const dotClass = hasExpression
    ? (STATUS_DOT[field.status] ?? 'bg-stone-700')
    : isGatheringWithoutExpression
      ? 'bg-teal-600'
      : 'bg-stone-700'

  return (
    <>
      <div className="group relative rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 p-4 transition-colors cursor-pointer"
           onClick={openDetail}>
        {/* Status dot */}
        <span
          className={`absolute top-3 right-3 w-2 h-2 rounded-full ${dotClass}`}
          title={hasExpression ? field.status : isGatheringWithoutExpression ? 'gathering' : 'quiet'}
        />

        <h3 className="text-stone-200 text-sm font-medium mb-2 pr-4">{field.label}</h3>

        {hasExpression ? (
          <p className="text-stone-400 text-sm leading-relaxed line-clamp-3">
            {field.current_expression}
          </p>
        ) : isGatheringWithoutExpression ? (
          <p className="text-teal-200/70 text-sm leading-relaxed">
            {gathered} {gathered === 1 ? 'reflection has' : 'reflections have'} gathered here.
            <span className="block text-stone-500 text-xs mt-1">
              Nothing written yet — draft with MAIA when you're ready.
            </span>
          </p>
        ) : (
          <p className="text-stone-600 text-sm italic">
            Not enough has gathered yet. We can begin.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {field.updated_at && (
              <span className="text-stone-600 text-xs">{formatRelativeDate(field.updated_at)}</span>
            )}
            {field.sources_count > 0 && (
              <span className="text-stone-600 text-xs">{field.sources_count} source{field.sources_count !== 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Hover actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); openDetail() }}
              disabled={loading}
              className="text-stone-400 hover:text-stone-200 text-xs"
            >
              {loading ? '…' : 'Open'}
            </button>
          </div>
        </div>
      </div>

      {open && detail && (
        <LivingFieldDetailPanel
          field={field}
          versions={detail.versions}
          sources={detail.sources}
          consents={detail.consents}
          memberId={memberId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
