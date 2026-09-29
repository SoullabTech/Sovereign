'use client'

import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

type GovernedFrame = {
  label: string
  dimension: string
  question: string
  description: string
  standing: 'MAIA_POSSIBLE_FRAME'
}

type FramePilotResponse = {
  source: string
  possibleFrame: GovernedFrame
  alternativeFrame: GovernedFrame
  scope: 'current_question'
  persistence: 'none'
  provider?: {
    kind?: string
    model?: string | null
  }
}

interface Props {
  source: string
}

type PilotState = 'idle' | 'loading' | 'first' | 'compare' | 'kept' | 'rejected' | 'unresolved' | 'abstained' | 'error'

function runViewTransition(update: () => void) {
  if (typeof document === 'undefined') {
    update()
    return
  }

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> }
  }

  if (reducedMotion || !doc.startViewTransition) {
    flushSync(update)
    return
  }

  doc.startViewTransition(() => {
    flushSync(update)
  })
}

export function SoulServiceAperturePilot({ source }: Props) {
  const [state, setState] = useState<PilotState>('idle')
  const [result, setResult] = useState<FramePilotResponse | null>(null)
  const [kept, setKept] = useState<GovernedFrame | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setState('idle')
    setResult(null)
    setKept(null)
    setMessage(null)
  }, [source])

  async function requestAperture() {
    setState('loading')
    setMessage(null)
    setResult(null)
    setKept(null)

    try {
      const response = await fetch('/api/maia/soul-service/frame-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const data = await response.json()

      if (!response.ok) {
        if (data?.abstained) {
          setMessage(data.reason || 'No bounded aperture was offered.')
          setState('abstained')
          return
        }
        throw new Error(data?.reason || data?.error || 'Perspective pilot failed')
      }

      runViewTransition(() => {
        setResult(data)
        setState('first')
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Perspective pilot failed')
      setState('error')
    }
  }

  function showComparison() {
    if (!result) return
    runViewTransition(() => setState('compare'))
  }

  function keepForVisit(frame: GovernedFrame) {
    runViewTransition(() => {
      setKept(frame)
      setState('kept')
    })
  }

  function reject() {
    runViewTransition(() => {
      setKept(null)
      setState('rejected')
    })
  }

  function leaveUnresolved() {
    runViewTransition(() => {
      setKept(null)
      setState('unresolved')
    })
  }

  function returnToSource() {
    runViewTransition(() => {
      setState('idle')
      setResult(null)
      setKept(null)
      setMessage(null)
    })
  }

  return (
    <div className="mt-12 max-w-3xl border-t border-[#c9b99f]/35 pt-6">
      {state === 'idle' && (
        <button
          type="button"
          onClick={requestAperture}
          className="text-sm text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
        >
          Another perspective
        </button>
      )}

      {state === 'loading' && (
        <p className="text-sm text-[#8a7965]">MAIA is choosing a bounded aperture…</p>
      )}

      {result && ['first', 'compare', 'kept'].includes(state) && (
        <div className="space-y-6">
          <div
            className="rounded-[26px] border border-[#bda98b]/30 bg-white/35 p-5 md:p-6"
            style={{ viewTransitionName: 'living-field-aperture-primary' }}
          >
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
              MAIA possible aperture · not yet yours
            </p>
            <h3 className="mt-2 font-serif text-2xl font-normal text-[#40372f]">
              {result.possibleFrame.label}
            </h3>
            <p className="mt-3 text-base leading-7 text-[#51463d]">
              {result.possibleFrame.question}
            </p>
            <p className="mt-2 text-[12px] leading-6 text-[#806f60]">
              {result.possibleFrame.description}
            </p>
          </div>

          {state === 'first' && (
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <button
                type="button"
                onClick={showComparison}
                className="text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Compare another perspective
              </button>
              <button
                type="button"
                onClick={() => keepForVisit(result.possibleFrame)}
                className="text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Keep this for this visit
              </button>
              <button
                type="button"
                onClick={reject}
                className="text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
              >
                That does not help
              </button>
              <button
                type="button"
                onClick={leaveUnresolved}
                className="text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Leave this unresolved
              </button>
            </div>
          )}

          {state === 'compare' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#bda98b]/25 bg-white/25 p-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    First aperture
                  </p>
                  <p className="mt-2 font-serif text-xl text-[#40372f]">
                    {result.possibleFrame.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#594d43]">
                    {result.possibleFrame.question}
                  </p>
                </div>
                <div
                  className="rounded-[22px] border border-[#bda98b]/25 bg-white/25 p-4"
                  style={{ viewTransitionName: 'living-field-aperture-alternative' }}
                >
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Another possible view · not ranked
                  </p>
                  <p className="mt-2 font-serif text-xl text-[#40372f]">
                    {result.alternativeFrame.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#594d43]">
                    {result.alternativeFrame.question}
                  </p>
                </div>
              </div>

              <p className="font-serif text-lg leading-7 text-[#51463d]">
                What becomes easier to see in one view that was harder to see in the other?
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => keepForVisit(result.possibleFrame)}
                  className="text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
                >
                  Keep {result.possibleFrame.label} for this visit
                </button>
                <button
                  type="button"
                  onClick={() => keepForVisit(result.alternativeFrame)}
                  className="text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
                >
                  Keep {result.alternativeFrame.label} for this visit
                </button>
                <button
                  type="button"
                  onClick={leaveUnresolved}
                  className="text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
                >
                  Keep neither
                </button>
              </div>
            </>
          )}

          {state === 'kept' && kept && (
            <div className="border-l-2 border-[#d85e36]/35 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Your current lens · this visit only
              </p>
              <p className="mt-2 font-serif text-xl text-[#40372f]">{kept.label}</p>
              <p className="mt-2 text-sm leading-6 text-[#594d43]">{kept.question}</p>
            </div>
          )}

          <button
            type="button"
            onClick={returnToSource}
            className="text-sm text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
          >
            ← Back to the source alone
          </button>
        </div>
      )}

      {state === 'rejected' && (
        <div className="border-l-2 border-[#27877a]/35 pl-4">
          <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">Member ruling</p>
          <p className="mt-2 font-serif text-xl text-[#40372f]">That does not help.</p>
          <p className="mt-2 text-[12px] leading-6 text-[#806f60]">
            Rejection does not become evidence about you.
          </p>
          <button
            type="button"
            onClick={returnToSource}
            className="mt-4 text-sm text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
          >
            ← Back to the source alone
          </button>
        </div>
      )}

      {state === 'unresolved' && (
        <div className="border-l-2 border-[#27877a]/35 pl-4">
          <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">Lawful outcome</p>
          <p className="mt-2 font-serif text-xl text-[#40372f]">Not yet resolved.</p>
          <button
            type="button"
            onClick={returnToSource}
            className="mt-4 text-sm text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
          >
            ← Back to the source alone
          </button>
        </div>
      )}

      {state === 'abstained' && (
        <div className="border-l-2 border-[#27877a]/35 pl-4">
          <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">MAIA abstained</p>
          <p className="mt-2 font-serif text-xl text-[#40372f]">
            The source is enough for now.
          </p>
          {message && <p className="mt-2 text-[12px] leading-6 text-[#806f60]">{message}</p>}
          <button
            type="button"
            onClick={returnToSource}
            className="mt-4 text-sm text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
          >
            ← Back to the source alone
          </button>
        </div>
      )}

      {state === 'error' && (
        <div>
          <p className="text-sm text-[#7d6d59]">
            Another perspective is unavailable right now.
          </p>
          <button
            type="button"
            onClick={returnToSource}
            className="mt-3 text-sm text-[#7a5c34] underline decoration-[#c3ad8b] underline-offset-4"
          >
            Return to the source
          </button>
        </div>
      )}
    </div>
  )
}
