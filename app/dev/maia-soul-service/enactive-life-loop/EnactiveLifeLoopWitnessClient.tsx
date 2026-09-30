'use client'

import { flushSync } from 'react-dom'
import { useMemo, useState } from 'react'

type Stage = 'orient' | 'prepare' | 'outside' | 'return' | 'revise'
type OutcomeKind = 'confirming' | 'disconfirming' | 'ambiguous'

type GovernedFrame = {
  label: string
  dimension: string
  question: string
  description: string
  standing: 'MAIA_POSSIBLE_FRAME'
}

type FrameResponse = {
  source: string
  possibleFrame: GovernedFrame
  alternativeFrame: GovernedFrame
  scope: 'current_question'
  persistence: 'none'
}

const SOURCE =
  'I keep holding the work back because I think one more round of refinement will make release feel safe.'

const OUTCOMES: Record<
  OutcomeKind,
  {
    label: string
    report: string
    status: string
    revision: string
    remains: string
  }
> = {
  confirming: {
    label: 'A · Some expectation confirmed',
    report:
      'The reader identified several concrete problems that I agree would improve clarity before wider release.',
    status: 'Current frame still plausible',
    revision:
      'The returned evidence supports some further refinement, but it does not establish that release must wait until the work feels completely safe.',
    remains:
      'How much refinement is enough, and whether the remaining changes are blocking or optional.',
  },
  disconfirming: {
    label: 'B · Materially disconfirming',
    report:
      'The reader said the work was clear and that the remaining changes felt optional rather than blocking.',
    status: 'Prior frame weakened',
    revision:
      'The expectation that another revision was required before sharing is weakened by what actually happened. The question may now be less “Is it ready enough?” and more “What risk am I willing to accept in releasing a living work?”',
    remains:
      'One reader cannot establish how every reader will respond, and the member still decides what release means.',
  },
  ambiguous: {
    label: 'C · Mixed / ambiguous',
    report:
      'The reader liked the work but did not respond to the part I was most uncertain about.',
    status: 'Not enough evidence',
    revision:
      'The return does not meaningfully confirm or disconfirm the readiness frame. The central uncertainty remains open.',
    remains:
      'The evidence needed to evaluate the central uncertainty has not yet arrived.',
  },
}

function transition(update: () => void) {
  if (typeof document === 'undefined') {
    update()
    return
  }

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown
  }

  if (reduced || !doc.startViewTransition) {
    flushSync(update)
    return
  }

  doc.startViewTransition(() => flushSync(update))
}

export function EnactiveLifeLoopWitnessClient() {
  const [stage, setStage] = useState<Stage>('orient')
  const [frame, setFrame] = useState<GovernedFrame | null>(null)
  const [loadingFrame, setLoadingFrame] = useState(false)
  const [action, setAction] = useState(
    'Send the current version to one trusted reader without making another revision first.',
  )
  const [expectation, setExpectation] = useState(
    'I expect the feedback will mostly reveal problems I should have fixed before sharing.',
  )
  const [challenge, setChallenge] = useState(
    'If the reader experiences the work as clear and the remaining changes as optional, I will reconsider whether more refinement is actually required before sharing.',
  )
  const [outcomeKind, setOutcomeKind] = useState<OutcomeKind | null>(null)
  const [memberRevision, setMemberRevision] = useState('')

  const outcome = useMemo(
    () => (outcomeKind ? OUTCOMES[outcomeKind] : null),
    [outcomeKind],
  )

  async function askForAperture() {
    setLoadingFrame(true)
    try {
      const response = await fetch('/api/maia/soul-service/frame-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: SOURCE }),
      })
      const data = await response.json()
      if (response.ok && data?.possibleFrame) {
        setFrame(data.possibleFrame)
      }
    } finally {
      setLoadingFrame(false)
    }
  }

  function move(next: Stage) {
    transition(() => setStage(next))
  }

  function chooseOutcome(kind: OutcomeKind) {
    transition(() => {
      setOutcomeKind(kind)
      setStage('return')
      setMemberRevision('')
    })
  }

  function reset() {
    transition(() => {
      setStage('orient')
      setFrame(null)
      setAction(
        'Send the current version to one trusted reader without making another revision first.',
      )
      setExpectation(
        'I expect the feedback will mostly reveal problems I should have fixed before sharing.',
      )
      setChallenge(
        'If the reader experiences the work as clear and the remaining changes as optional, I will reconsider whether more refinement is actually required before sharing.',
      )
      setOutcomeKind(null)
      setMemberRevision('')
    })
  }

  return (
    <section className="overflow-hidden rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03 · Enactive Life Loop
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Let life answer back.
          </h1>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
        >
          Reset witness
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ['orient', 'Perceive'],
          ['prepare', 'Choose'],
          ['outside', 'Act in life'],
          ['return', 'Return'],
          ['revise', 'Revise'],
        ].map(([key, label]) => (
          <span
            key={key}
            className={[
              'rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]',
              stage === key
                ? 'border-[#b46f48]/35 bg-white/45 text-[#6f492f]'
                : 'border-[#8c745d]/15 bg-white/20 text-[#9b8875]',
            ].join(' ')}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-h-[640px] rounded-[32px] border border-[#74583f]/10 bg-white/25 p-6 md:p-8">
          {stage === 'orient' && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Current source
              </p>
              <p className="mt-4 max-w-3xl font-serif text-3xl leading-[1.45] text-[#4b4037]">
                “{SOURCE}”
              </p>

              {!frame ? (
                <button
                  type="button"
                  onClick={askForAperture}
                  disabled={loadingFrame}
                  className="mt-8 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4 disabled:opacity-40"
                >
                  {loadingFrame ? 'MAIA is choosing an aperture…' : 'Ask MAIA for one bounded aperture'}
                </button>
              ) : (
                <div className="mt-8 max-w-2xl border-l-2 border-[#27877a]/35 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    MAIA possible aperture · not yet yours
                  </p>
                  <p className="mt-2 font-serif text-2xl">{frame.label}</p>
                  <p className="mt-2 text-base leading-7 text-[#594d43]">{frame.question}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => move('prepare')}
                className="mt-10 block text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Shape a bounded real-world experiment →
              </button>
            </>
          )}

          {stage === 'prepare' && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Member-authored action
              </p>
              <h2 className="mt-2 font-serif text-3xl">What will you actually try?</h2>

              <label className="mt-7 block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#927b68]">
                  My action
                </span>
                <textarea
                  value={action}
                  onChange={(event) => setAction(event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-[20px] border border-[#74583f]/12 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
              </label>

              <label className="mt-6 block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#927b68]">
                  What I expect
                </span>
                <textarea
                  value={expectation}
                  onChange={(event) => setExpectation(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-[20px] border border-[#74583f]/12 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
              </label>

              <label className="mt-6 block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#927b68]">
                  What would make me reconsider?
                </span>
                <textarea
                  value={challenge}
                  onChange={(event) => setChallenge(event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-[20px] border border-[#74583f]/12 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
              </label>

              <p className="mt-5 text-xs leading-6 text-[#756557]">
                The action is yours. MAIA may help clarify an experiment; it does not become the author of what you do.
              </p>

              <button
                type="button"
                onClick={() => move('outside')}
                className="mt-7 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                This is my experiment → leave Soullab
              </button>
            </>
          )}

          {stage === 'outside' && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Outside Soullab
              </p>
              <h2 className="mt-3 font-serif text-3xl">Now life gets a turn.</h2>

              <div className="mt-7 space-y-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                    Member-authored experiment
                  </p>
                  <p className="mt-2 font-serif text-xl leading-8">{action}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                    Expected
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5146]">{expectation}</p>
                </div>
              </div>

              <p className="mt-8 max-w-2xl text-sm leading-7 text-[#6b5b4e]">
                The prototype cannot observe the world. When you return, the consequence enters as a member report unless separately verified by a governed source.
              </p>

              <div className="mt-8">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#927b68]">
                  Simulate what actually happened
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {(Object.keys(OUTCOMES) as OutcomeKind[]).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => chooseOutcome(kind)}
                      className="rounded-[18px] border border-[#74583f]/12 bg-white/35 px-4 py-3 text-left text-sm hover:bg-white/55"
                    >
                      {OUTCOMES[kind].label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {stage === 'return' && outcome && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Member-reported consequence
              </p>
              <h2 className="mt-3 font-serif text-3xl">What actually happened?</h2>
              <p className="mt-6 font-serif text-2xl leading-[1.5] text-[#4b4037]">
                {outcome.report}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#74583f]/10 bg-white/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                    Expected
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#5e5146]">{expectation}</p>
                </div>
                <div className="rounded-[22px] border border-[#74583f]/10 bg-white/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                    Observed
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#5e5146]">{outcome.report}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => move('revise')}
                className="mt-8 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Let reality revise the map →
              </button>
            </>
          )}

          {stage === 'revise' && outcome && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Revision under reality
              </p>
              <h2 className="mt-3 font-serif text-3xl">{outcome.status}</h2>

              <div className="mt-7 border-l-2 border-[#c69b5d]/45 pl-4">
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                  What the return changes
                </p>
                <p className="mt-2 text-base leading-7 text-[#51463d]">{outcome.revision}</p>
              </div>

              <div className="mt-7 border-l-2 border-[#27877a]/30 pl-4">
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">
                  What remains unknown
                </p>
                <p className="mt-2 text-sm leading-7 text-[#5e5146]">{outcome.remains}</p>
              </div>

              <label className="mt-8 block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#927b68]">
                  My revised question or meaning · optional
                </span>
                <textarea
                  value={memberRevision}
                  onChange={(event) => setMemberRevision(event.target.value)}
                  placeholder="Leave this blank if the meaning is not ready yet."
                  className="mt-2 min-h-28 w-full rounded-[20px] border border-[#74583f]/12 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
              </label>

              <p className="mt-8 font-serif text-xl leading-8">
                Life has standing to change the map. The member still has authority over what the change means.
              </p>
            </>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Epistemic ledger</h2>

          <div className="mt-6 space-y-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Source
              </p>
              <p>{SOURCE}</p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Action authorship
              </p>
              <p>member-authored</p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Expectation standing
              </p>
              <p>member expectation · not prediction</p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Returned consequence
              </p>
              <p>{outcome ? 'member report · new evidence' : 'not yet returned'}</p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Current map status
              </p>
              <p>{outcome ? outcome.status : 'open'}</p>
            </div>
          </div>

          <p className="mt-8 border-t border-[#74583f]/12 pt-5 text-xs leading-6 text-[#6b5b4e]">
            No outcome is automatically called growth, success, healing, or progress. A failed or ambiguous experiment remains evidence.
          </p>
        </aside>
      </div>
    </section>
  )
}
