'use client'

import { useMemo, useState } from 'react'

type Frame = {
  label: string
  dimension: string
  question: string
  description: string
  standing: 'MAIA_POSSIBLE_FRAME'
}

type FrameResponse = {
  source: string
  possibleFrame: Frame
  alternativeFrame: Frame
  scope: 'current_question'
  persistence: 'none'
  provider?: { kind?: string; model?: string | null }
}

const DEFAULT_SOURCE = 'I keep asking whether to keep refining this project or finally release it.'

export default function SoulServiceFramePilotPage() {
  const [source, setSource] = useState(DEFAULT_SOURCE)
  const [result, setResult] = useState<FrameResponse | null>(null)
  const [selected, setSelected] = useState<'first' | 'alternative' | null>(null)
  const [rejected, setRejected] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [unresolved, setUnresolved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abstention, setAbstention] = useState<string | null>(null)

  const chosen = useMemo(() => {
    if (!result || !selected) return null
    return selected === 'first' ? result.possibleFrame : result.alternativeFrame
  }, [result, selected])

  async function detect() {
    setLoading(true)
    setError(null)
    setAbstention(null)
    setResult(null)
    setSelected(null)
    setRejected(false)
    setComparing(false)
    setUnresolved(false)
    try {
      const res = await fetch('/api/maia/soul-service/frame-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.abstained) {
          setAbstention(data.reason || 'MAIA did not offer a frame for this source.')
          return
        }
        throw new Error(data?.reason || data?.error || 'Frame pilot failed')
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Frame pilot failed')
    } finally {
      setLoading(false)
    }
  }

  function returnToSource() {
    setSelected(null)
    setRejected(false)
    setComparing(false)
    setUnresolved(false)
  }

  return (
    <main className="min-h-screen bg-[#e8dccb] px-4 py-8 text-[#302923]">
      <section className="relative mx-auto min-h-[780px] max-w-6xl overflow-hidden rounded-[42px] bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 shadow-[0_28px_90px_rgba(65,43,29,0.12)] md:px-12 md:py-11">
        <div aria-hidden className="pointer-events-none absolute -left-[15%] -top-[12%] h-[58%] w-[58%] rounded-full bg-[radial-gradient(circle,rgba(216,94,54,0.23),rgba(216,94,54,0.05)_46%,transparent_72%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-[15%] top-[8%] h-[56%] w-[56%] rounded-full bg-[radial-gradient(circle,rgba(39,135,122,0.20),rgba(39,135,122,0.05)_46%,transparent_72%)] blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#846f5e]">Living Field Architecture · Soul-Service Runtime Pilot</p>
            <p className="text-[10px] uppercase tracking-[0.13em] text-[#998675]">dev only · no persistence</p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
            <div className="rounded-[34px] border border-[#6d513b]/10 bg-white/25 p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#927b68]">Anchor · current source only</p>
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-4 min-h-32 w-full resize-y border-0 bg-transparent font-serif text-3xl leading-[1.4] text-[#382f29] outline-none md:text-[38px]"
              />
              <p className="mt-3 text-[11px] text-[#867361]">This source is sent only to the stateless local pilot route. It is not written to conversation or memory stores.</p>

              {!result && !rejected && (
                <button
                  type="button"
                  onClick={detect}
                  disabled={loading || !source.trim()}
                  className="mt-8 rounded-full border border-[#b86d45]/30 bg-white/30 px-5 py-2.5 text-sm text-[#74462c] disabled:opacity-40"
                >
                  {loading ? 'MAIA is considering the aperture…' : 'Ask MAIA for a possible frame'}
                </button>
              )}

              {result && !rejected && (
                <div className="mt-10 space-y-6">
                  <button
                    type="button"
                    onClick={() => { setSelected('first'); setComparing(false); setUnresolved(false) }}
                    className="block max-w-xl rounded-[24px] border border-[#6d513b]/15 bg-white/45 p-5 text-left"
                  >
                    <span className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">MAIA possible frame · not yet yours</span>
                    <strong className="mt-2 block font-serif text-2xl font-normal">{result.possibleFrame.label}</strong>
                    <span className="mt-2 block text-sm leading-6 text-[#594d43]">{result.possibleFrame.question}</span>
                    <span className="mt-2 block text-[11px] leading-5 text-[#806f60]">{result.possibleFrame.description}</span>
                  </button>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <button type="button" onClick={() => setComparing(true)} className="underline decoration-[#b89d7c] underline-offset-4">Show another perspective</button>
                    <button type="button" onClick={() => { setRejected(true); setSelected(null); setComparing(false) }} className="underline decoration-[#b89d7c] underline-offset-4">That frame does not fit</button>
                    <button type="button" onClick={() => setUnresolved(true)} className="underline decoration-[#b89d7c] underline-offset-4">Leave this unresolved</button>
                  </div>

                  {comparing && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[22px] border border-[#6d513b]/12 bg-white/32 p-4">
                        <p className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">Possible current frame</p>
                        <p className="mt-2 font-serif text-xl">{result.possibleFrame.label}</p>
                        <p className="mt-2 text-sm leading-6 text-[#594d43]">{result.possibleFrame.question}</p>
                        <p className="mt-2 text-[11px] leading-5 text-[#806f60]">{result.possibleFrame.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelected('alternative')}
                        className="rounded-[22px] border border-[#6d513b]/12 bg-white/32 p-4 text-left"
                      >
                        <p className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">Another possible view · not ranked</p>
                        <p className="mt-2 font-serif text-xl">{result.alternativeFrame.label}</p>
                        <p className="mt-2 text-sm leading-6 text-[#594d43]">{result.alternativeFrame.question}</p>
                        <p className="mt-2 text-[11px] leading-5 text-[#806f60]">{result.alternativeFrame.description}</p>
                      </button>
                    </div>
                  )}

                  {chosen && (
                    <div className="border-l-2 border-[#d85e36]/40 pl-4">
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">Your current selection · this visit only</p>
                      <p className="mt-2 font-serif text-xl">{chosen.label}</p>
                      <p className="mt-2 text-xs leading-6 text-[#746254]">{chosen.question}</p>
                    </div>
                  )}

                  {unresolved && (
                    <div className="border-l-2 border-[#27877a]/35 pl-4">
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">Lawful outcome</p>
                      <p className="mt-2 font-serif text-xl">Not yet resolved.</p>
                    </div>
                  )}
                </div>
              )}

              {rejected && (
                <div className="mt-10 max-w-xl border-l-2 border-[#27877a]/35 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">Member ruling</p>
                  <p className="mt-2 font-serif text-xl">That frame does not fit.</p>
                  <p className="mt-2 text-xs leading-6 text-[#746254]">The pilot does not treat rejection as hidden resistance or incomplete insight.</p>
                </div>
              )}

              {(result || rejected) && (
                <button type="button" onClick={returnToSource} className="mt-10 text-sm text-[#795230] underline underline-offset-4">← Return to the unchanged source</button>
              )}

              {abstention && (
                <div className="mt-10 max-w-xl border-l-2 border-[#27877a]/35 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">MAIA abstained</p>
                  <p className="mt-2 font-serif text-xl">No bounded frame offered. The source remains enough.</p>
                  <p className="mt-2 text-xs leading-6 text-[#746254]">{abstention}</p>
                </div>
              )}

              {error && <p className="mt-6 text-sm text-rose-800">{error}</p>}
            </div>

            <aside className="rounded-[30px] border border-[#6d513b]/10 bg-white/45 p-6">
              <h1 className="font-serif text-2xl">See more without being told what it means</h1>
              <p className="mt-4 text-sm leading-7 text-[#594d43]">This first runtime-capable slice asks MAIA which governed aperture might be useful, not what the source means. The source stays primary and every frame remains current-turn-only.</p>

              <div className="mt-6 border-l-2 border-[#d85e36]/40 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#917b68]">Safeguards</p>
                <ul className="mt-3 space-y-2 text-xs leading-6 text-[#6b5b4e]">
                  <li>local model only</li>
                  <li>no conversation persistence</li>
                  <li>no member memory</li>
                  <li>no relation learning</li>
                  <li>no durable frames</li>
                  <li>rejection is final for this interaction</li>
                  <li>unknown remains valid</li>
                </ul>
              </div>

              {result?.provider && (
                <details className="mt-7 border-t border-[#6d513b]/15 pt-4 text-xs text-[#806f60]">
                  <summary className="cursor-pointer">Runtime witness</summary>
                  <p className="mt-3">provider: {result.provider.kind}</p>
                  <p>model: {result.provider.model ?? 'unknown'}</p>
                  <p>persistence: none</p>
                </details>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
