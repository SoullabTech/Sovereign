'use client'

import type { FieldSource } from './types'

const SOURCE_TYPE_LABEL: Record<string, string> = {
  field_record: 'Field Record',
  conversation: 'Conversation',
  voice_note: 'Voice Note',
  upload: 'Upload',
  encounter: 'Encounter',
  reflection: 'Reflection',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function LivingFieldSourceList({ sources }: { sources: FieldSource[] }) {
  if (!sources.length) return null

  return (
    <div className="space-y-2">
      <h4 className="text-stone-500 text-xs uppercase tracking-widest">What nourished this field</h4>
      <ul className="space-y-2">
        {sources.map((s) => (
          <li key={s.id} className="flex gap-3 items-start">
            <span className="mt-0.5 text-stone-500 text-xs pt-0.5 flex-shrink-0">
              {SOURCE_TYPE_LABEL[s.source_type] ?? s.source_type}
            </span>
            {s.source_excerpt && (
              <p className="text-stone-400 text-xs line-clamp-2 italic">"{s.source_excerpt}"</p>
            )}
            <span className="ml-auto text-stone-600 text-xs flex-shrink-0">{formatDate(s.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
