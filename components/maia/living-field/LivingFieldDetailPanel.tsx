'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LivingField, FieldVersion, FieldSource, ParticipantConsent } from './types'
import { deriveConsentStatus } from './types'
import { LivingFieldSourceList } from './LivingFieldSourceList'
import { LivingFieldGatheringPanel } from './LivingFieldGatheringPanel'
import { MaiaCandidatePanel, type MaiaCandidate } from './MaiaCandidatePanel'
import { LivingEncounterView } from './LivingEncounterView'
import { MaiaCapture, type CaptureSource } from '@/components/maia/MaiaCapture'

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
  const [captured, setCaptured] = useState<string | null>(null)
  const [refineNote, setRefineNote] = useState<string | null>(null)
  // Conversation-first: opening a dimension lands the member IN the encounter.
  // The expression form, gathering panel, and history are below — projections,
  // not the primary surface.
  const [encounterOpen, setEncounterOpen] = useState(true)

  async function handleCapture(text: string, source: CaptureSource) {
    // Store as a source (evidence that feeds Refine and provenance) …
    await fetch(`/api/maia/living-field/${field.field_key}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
      body: JSON.stringify({ source_type: source, source_excerpt: text }),
    })
    // … and drop the material into the expression so the member isn't retyping it.
    setExpression((prev) => (prev ? `${prev}\n\n${text}` : text))
    setCaptured(source === 'voice_note' ? 'Transcribed and added below.' : 'Added below.')
    setTimeout(() => setCaptured(null), 3000)
  }

  const activeConsents = consents.filter((c) => deriveConsentStatus(c) === 'active')
  const revokedConsents = consents.filter((c) =>
    ['revoked', 'removed', 'paused', 'silenced'].includes(deriveConsentStatus(c))
  )

  async function save(expr: string | null | undefined) {
    if (!expr || !expr.trim()) return
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
    setRefineNote(null)
    try {
      const res = await fetch(`/api/maia/living-field/${field.field_key}/refine`, {
        method: 'POST',
        headers: { 'x-member-id': memberId },
      })
      const drafted = res.ok ? await res.json().catch(() => null) : null
      // A draft is only actionable when MAIA actually returned text. When
      // candidate_expression is null/empty, never open the accept/edit panel —
      // accepting a null draft crashed the app (null.trim()). Surface a neutral
      // note instead; do not claim "nothing gathered" when Keeps have gathered.
      if (drafted && typeof drafted.candidate_expression === 'string' && drafted.candidate_expression.trim()) {
        setCandidate(drafted)
      } else {
        setRefineNote('MAIA could not draft a candidate just now. You can write directly, or try again in a moment.')
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
          {/* Primary action — enter the conversation. Conversation ↔ Field;
              everything else here is a projection / secondary path. */}
          {!encounterOpen ? (
            <button
              onClick={() => setEncounterOpen(true)}
              className="w-full px-4 py-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-stone-950 text-sm font-semibold transition-colors"
            >
              Enter this dimension with MAIA
            </button>
          ) : (
            <LivingEncounterView
              fieldKey={field.field_key}
              fieldLabel={field.label}
              memberId={memberId}
              onClose={() => setEncounterOpen(false)}
            />
          )}

          {/* Current Expression — secondary, quiet path */}
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

          {/* What has gathered — inspectability before Recognition. The member sees
              the denominator, the criterion, and the per-Keep warrant BEFORE asking
              MAIA to draft from it. Recognition is gated behind inspectability. */}
          <LivingFieldGatheringPanel
            fieldKey={field.field_key}
            fieldLabel={field.label}
            memberId={memberId}
          />

          {/* Candidate panel */}
          {candidate && (
            <MaiaCandidatePanel
              candidate={candidate}
              onAccept={acceptCandidate}
              onEdit={editCandidate}
              onDismiss={() => setCandidate(null)}
            />
          )}

          {/* No actionable draft — neutral note, no crash, no false "nothing gathered" */}
          {refineNote && (
            <p className="text-stone-500 text-xs rounded-lg bg-stone-900 border border-stone-800 px-4 py-3">
              {refineNote}
            </p>
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
          </div>

          {/* Bring material in by voice or upload — not only by typing. */}
          <div className="space-y-1">
            <MaiaCapture onCapture={handleCapture} />
            {captured && <p className="text-teal-400/80 text-xs">{captured}</p>}
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
