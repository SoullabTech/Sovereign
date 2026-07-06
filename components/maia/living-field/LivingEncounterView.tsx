'use client'

// LivingEncounterView — conversation-first entry into a Living Field dimension.
// Wave 2, Move 1 (docs/specs/LIVING_FIELD_IDEAL_BUILD_2026-07-05.md §5).
//
// Conversation ↔ Field; everything else is a projection. This view holds the
// turn-by-turn exchange with MAIA inside one dimension. Proposals surfaced in
// conversation carry zero authority until the member confirms them — this view
// renders plain dialogue; it does not yet render proposal chips (Move 2).

import { useEffect, useRef, useState } from 'react'
import { MaiaCapture, type CaptureSource } from '@/components/maia/MaiaCapture'

interface Props {
  fieldKey: string
  fieldLabel: string
  memberId: string
  onClose: () => void
}

interface Turn {
  role: 'member' | 'maia'
  text: string
}

type MarkKind = 'friction' | 'interruption' | 'novelty' | 'recovery'

const MARK_OPTIONS: { kind: MarkKind; label: string }[] = [
  { kind: 'friction', label: 'friction' },
  { kind: 'interruption', label: 'interrupted' },
  { kind: 'novelty', label: 'something new' },
  { kind: 'recovery', label: 'recovered' },
]

export function LivingEncounterView({ fieldKey, fieldLabel, memberId, onClose }: Props) {
  const [encounterId, setEncounterId] = useState<string | null>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [opening, setOpening] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markOpen, setMarkOpen] = useState(false)
  const [markSent, setMarkSent] = useState<string | null>(null)
  const [markError, setMarkError] = useState<MarkKind | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function open() {
      setOpening(true)
      setError(null)
      try {
        const res = await fetch(`/api/maia/living-field/${fieldKey}/encounter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
          body: JSON.stringify({ action: 'open' }),
        })
        const data = await res.json().catch(() => null)
        if (cancelled) return
        if (!res.ok || !data?.encounter_id) {
          setError('Could not open this encounter. Try again.')
          return
        }
        setEncounterId(data.encounter_id)
        setTurns([{ role: 'maia', text: data.greeting || `I'm here with you in ${fieldLabel}.` }])
      } catch {
        if (!cancelled) setError('Could not reach MAIA. Check your connection and try again.')
      } finally {
        if (!cancelled) setOpening(false)
      }
    }
    open()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldKey])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns])

  async function sendTurn(text: string) {
    const trimmed = text.trim()
    if (!trimmed || !encounterId || sending) return
    setTurns((prev) => [...prev, { role: 'member', text: trimmed }])
    setInput('')
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/maia/living-field/${fieldKey}/encounter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
        body: JSON.stringify({ action: 'turn', encounter_id: encounterId, text: trimmed }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data?.reply !== 'string') {
        setError('MAIA could not respond just now. Try again.')
        return
      }
      setTurns((prev) => [...prev, { role: 'maia', text: data.reply }])
    } catch {
      setError('Could not reach MAIA. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  async function handleCapture(text: string, _source: CaptureSource) {
    await sendTurn(text)
  }

  async function closeEncounter() {
    if (encounterId) {
      try {
        await fetch(`/api/maia/living-field/${fieldKey}/encounter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
          body: JSON.stringify({ action: 'close', encounter_id: encounterId }),
        })
      } catch {
        // closing is best-effort; the member leaving is what matters
      }
    }
    onClose()
  }

  async function mark(kind: MarkKind) {
    if (!encounterId) return
    setMarkError(null)
    try {
      const res = await fetch(`/api/maia/living-field/${fieldKey}/encounter`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
        body: JSON.stringify({ encounter_id: encounterId, mark: kind }),
      })
      if (!res.ok) {
        setMarkError(kind)
        return
      }
      setMarkOpen(false)
      setMarkSent(kind)
      setTimeout(() => setMarkSent(null), 2000)
    } catch {
      setMarkError(kind)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-stone-500 text-xs uppercase tracking-widest">
          In conversation with MAIA
        </span>
        <button
          onClick={closeEncounter}
          className="text-stone-500 hover:text-stone-300 text-xs"
        >
          Leave this conversation
        </button>
      </div>

      <div
        ref={scrollRef}
        className="max-h-80 overflow-y-auto space-y-3 rounded-lg bg-stone-900 border border-stone-800 px-4 py-4"
      >
        {opening && turns.length === 0 && (
          <p className="text-stone-500 text-sm italic">MAIA is arriving…</p>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === 'member' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={
                t.role === 'member'
                  ? 'max-w-[85%] rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 text-sm'
                  : 'max-w-[85%] rounded-lg bg-amber-950/30 border border-amber-900/40 px-3 py-2 text-amber-100 text-sm'
              }
            >
              {t.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-amber-950/20 border border-amber-900/30 px-3 py-2 text-amber-200/60 text-sm italic">
              MAIA is listening…
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-amber-600/80 text-xs">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendTurn(input)
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say what's here…"
          disabled={opening || !encounterId}
          className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm outline-none focus:border-amber-600 placeholder:text-stone-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={opening || sending || !input.trim() || !encounterId}
          className="px-4 py-2.5 rounded bg-amber-700 hover:bg-amber-600 text-stone-950 text-sm font-medium disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </form>

      <MaiaCapture onCapture={handleCapture} disabled={opening || sending || !encounterId} />

      {/* Quiet observation affordance — the member is the instrument. No explanation demanded. */}
      <div className="flex items-center gap-2 pt-1">
        {!markOpen ? (
          <button
            onClick={() => setMarkOpen(true)}
            disabled={!encounterId}
            className="text-stone-600 hover:text-stone-400 text-xs disabled:opacity-40"
          >
            Mark this moment
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {MARK_OPTIONS.map((opt) => (
              <button
                key={opt.kind}
                onClick={() => mark(opt.kind)}
                className={
                  markError === opt.kind
                    ? 'px-3 py-2 rounded bg-amber-950/30 hover:bg-amber-950/50 text-amber-400 text-xs border border-amber-900/50 transition-colors'
                    : 'px-3 py-2 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs border border-stone-800 transition-colors'
                }
              >
                {markError === opt.kind ? 'Could not mark — tap to retry' : opt.label}
              </button>
            ))}
            <button
              onClick={() => setMarkOpen(false)}
              className="text-stone-700 hover:text-stone-500 text-xs px-2 py-1.5"
            >
              never mind
            </button>
          </div>
        )}
        {markSent && <span className="text-stone-600 text-xs italic">marked.</span>}
      </div>
    </div>
  )
}
