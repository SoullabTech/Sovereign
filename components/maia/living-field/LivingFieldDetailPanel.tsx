'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LivingField, FieldVersion, FieldSource, ParticipantConsent } from './types'
import { deriveConsentStatus } from './types'
import { LivingFieldSourceList } from './LivingFieldSourceList'
import { MaiaCandidatePanel, type MaiaCandidate } from './MaiaCandidatePanel'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface Props {
  field: LivingField
  versions: FieldVersion[]
  sources: FieldSource[]
  consents: ParticipantConsent[]
  memberId: string
  onClose: () => void
}

export function LivingFieldDetailPanel({
  field,
  versions,
  sources,
  consents,
  memberId,
  onClose,
}: Props) {
  const [expression, setExpression] = useState(field.current_expression ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [candidate, setCandidate] = useState<MaiaCandidate | null>(null)
  const [refining, setRefining] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const activeConsents = consents.filter((c) => deriveConsentStatus(c) === 'active')
  const revokedConsents = consents.filter((c) =>
    ['revoked', 'removed', 'paused', 'silenced'].includes(deriveConsentStatus(c))
  )

  async function save(expr: string) {
    if (!expr.trim()) return
    setSaving(true)
    try {
      await fetch(`/api/maia/living-field/${field.field_key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
        body: JSON.stringify({ expression: expr }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function refine() {
    setRefining(true)
    setCandidate(null)
    try {
      const res = await fetch(`/api/maia/living-field/${field.field_key}/refine`, {
        method: 'POST',
        headers: { 'x-member-id': memberId },
      })
      if (res.ok) {
        setCandidate(await res.json())
      }
    } finally {
      setRefining(false)
    }
  }

  function acceptCandidate(expr: string) {
    setExpression(expr)
    setCandidate(null)
    save(expr)
  }

  function editCandidate(expr: string) {
    setExpression(expr)
    setCandidate(null)
  }

  async function revokeConsent(consentId: string) {
    await fetch(`/api/maia/living-field/${field.field_key}/consent`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
      body: JSON.stringify({ consent_id: consentId }),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl bg-stone-950 border border-stone-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-stone-950 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-stone-100 font-semibold">{field.label}</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 text-sm">
            Close
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Current Expression */}
          <div className="space-y-2">
            <label className="text-stone-500 text-xs uppercase tracking-widest">
              Current Expression
            </label>
            <textarea
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              rows={4}
              placeholder="Write directly. What is true right now?"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 text-stone-100 text-sm resize-none outline-none focus:border-amber-600 placeholder:text-stone-600"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => save(expression)}
                disabled={saving || !expression.trim()}
                className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 disabled:opacity-40 transition-colors"
              >
                {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Candidate panel */}
          {candidate && (
            <MaiaCandidatePanel
              candidate={candidate}
              onAccept={acceptCandidate}
              onEdit={editCandidate}
              onDismiss={() => setCandidate(null)}
            />
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refine}
              disabled={refining}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs border border-stone-700 disabled:opacity-50 transition-colors"
            >
              {refining ? 'Gathering…' : 'Refine with MAIA'}
            </button>
            <Link
              href={`/maia?field=${field.field_key}`}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 transition-colors"
            >
              Talk with MAIA about this
            </Link>
            <button
              disabled
              title="Coming soon"
              className="px-3 py-1.5 rounded text-stone-600 text-xs border border-stone-800 cursor-not-allowed"
            >
              Add voice note
            </button>
          </div>

          {/* Sources */}
          {sources.length > 0 && <LivingFieldSourceList sources={sources} />}

          {/* Developmental history */}
          {versions.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setHistoryOpen((o) => !o)}
                className="text-stone-500 text-xs uppercase tracking-widest hover:text-stone-400 flex items-center gap-1"
              >
                Development History {historyOpen ? '▲' : '▼'}
              </button>
              {historyOpen && (
                <ul className="space-y-3 border-l border-stone-800 pl-4">
                  {versions.map((v) => (
                    <li key={v.id} className="space-y-0.5">
                      <p className="text-stone-500 text-xs">
                        {formatDate(v.created_at)} ·{' '}
                        {v.authored_by === 'maia_candidate' ? 'MAIA candidate, accepted' : 'Written by you'}
                      </p>
                      <p className="text-stone-300 text-sm leading-relaxed">{v.expression}</p>
                      {v.change_note && (
                        <p className="text-stone-600 text-xs italic">{v.change_note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Development partners — optional layer */}
          <div className="space-y-2 border-t border-stone-800 pt-4">
            <h4 className="text-stone-500 text-xs uppercase tracking-widest">Supported By</h4>
            {activeConsents.length === 0 && revokedConsents.length === 0 ? (
              <p className="text-stone-600 text-xs">
                Your Living Field is complete on its own. You can invite development partners to
                walk alongside specific dimensions of it.
              </p>
            ) : (
              <ul className="space-y-2">
                {activeConsents.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-300">
                      {c.participant_label ?? 'Development partner'}{' '}
                      <span className="text-stone-500 text-xs">· {c.participant_type}</span>
                    </span>
                    <button
                      onClick={() => revokeConsent(c.id)}
                      className="text-stone-600 hover:text-stone-400 text-xs"
                    >
                      Stop sharing this field
                    </button>
                  </li>
                ))}
                {revokedConsents.map((c) => (
                  <li key={c.id} className="text-stone-600 text-xs italic">
                    {c.participant_label ?? 'Development partner'} — previously invited
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
