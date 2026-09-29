'use client'

import { useMemo, useState } from 'react'

type Phase =
  | 'orient'
  | 'prepared'
  | 'away'
  | 'returned'
  | 'compare'
  | 'revised'
  | 'rest'

type Revision =
  | 'keep'
  | 'weaken'
  | 'narrow'
  | 'revise'
  | 'abandon'
  | 'unknown'

const SOURCE =
  'I’m worried readers are losing the core idea in this chapter.'

const LIFE_MOVE =
  'Share the chapter with two readers and ask where they lose connection.'

const EXPECTATION =
  'I expect both readers to say the core argument is hard to follow.'

const SURPRISE =
  'I would be surprised if both readers understood the core idea but pointed to different local problems.'

const RETURN_ACTION =
  'I shared the same chapter with two readers and asked each where they lost connection.'

const RETURN_CONSEQUENCE =
  'Both readers said the core idea was clear. One lost the thread at the chapter transition; the other understood the transition but found the ending abrupt.'

const REVISION_COPY: Record<Revision, string> = {
  keep: 'The prior understanding still fits well enough for now.',
  weaken:
    'The broad concern that readers are losing the core idea should be weakened.',
  narrow:
    'The concern is better narrowed to local continuity and ending structure rather than the core idea.',
  revise:
    'I now see the problem less as conceptual clarity and more as where the chapter carries the reader from one movement to the next.',
  abandon:
    'The prior “core idea is unclear” frame no longer seems useful.',
  unknown:
    'I do not yet know what larger conclusion to draw from these two readers.',
}

export function EnactiveLifeLoopWitnessClient() {
  const [phase, setPhase] = useState<Phase>('orient')
  const [move, setMove] = useState(LIFE_MOVE)
  const [expectation, setExpectation] = useState(EXPECTATION)
  const [surprise, setSurprise] = useState(SURPRISE)
  const [actualAction, setActualAction] = useState('')
  const [consequence, setConsequence] = useState('')
  const [revision, setRevision] = useState<Revision | null>(null)
  const [memberRevision, setMemberRevision] = useState('')

  const capsuleActive = ['prepared', 'away', 'returned', 'compare'].includes(phase)

  const mismatch = useMemo(() => {
    if (!actualAction || !consequence) return null
    return {
      expected: expectation,
      happened: consequence,
      surprised: consequence.toLowerCase().includes('core idea was clear'),
    }
  }, [actualAction, consequence, expectation])

  function prepareMove() {
    setPhase('prepared')
  }

  function leaveSoullab() {
    setPhase('away')
  }

  function returnWithSyntheticLife() {
    setActualAction(RETURN_ACTION)
    setConsequence(RETURN_CONSEQUENCE)
    setPhase('returned')
  }

  function compare() {
    setPhase('compare')
  }

  function chooseRevision(next: Revision) {
    setRevision(next)
    setMemberRevision(REVISION_COPY[next])
    setPhase('revised')
  }

  function reset() {
    setPhase('orient')
    setMove(LIFE_MOVE)
    setExpectation(EXPECTATION)
    setSurprise(SURPRISE)
    setActualAction('')
    setConsequence('')
    setRevision(null)
    setMemberRevision('')
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[32px] border border-[#74583f]/10 bg-white/28 p-6 md:p-8">
          <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
            Source question
          </p>
          <p className="mt-3 max-w-3xl font-serif text-2xl leading-[1.5] md:text-[30px]">
            {SOURCE}
          </p>

          {phase === 'orient' && (
            <div className="mt-9">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                A possible movement into life
              </p>

              <label className="mt-4 block">
                <span className="text-[11px] text-[#7b6959]">What I choose to do</span>
                <textarea
                  value={move}
                  onChange={(event) => setMove(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-[18px] border border-[#806951]/15 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-[11px] text-[#7b6959]">What I currently expect</span>
                <textarea
                  value={expectation}
                  onChange={(event) => setExpectation(event.target.value)}
                  className="mt-2 min-h-20 w-full rounded-[18px] border border-[#806951]/15 bg-white/45 p-4 text-sm leading-6 outline-none"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-[11px] text-[#7b6959]">What would surprise me?</span>
                <textarea
                  value={surprise}
                  onChange={(event) => setSurprise(event.target.value)}
                  className="mt-2 min-h-20 w-full rounded-[18px] border border-[#806951]/15 bg-white/45 p-4 text-sm leading-6 outline-none"
                />
              </label>

              <div className="mt-7 flex flex-wrap gap-5 text-sm">
                <button
                  type="button"
                  onClick={prepareMove}
                  className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
                >
                  Prepare this Life Move
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('rest')}
                  className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
                >
                  Don’t turn this into a Life Move
                </button>
              </div>
            </div>
          )}

          {phase === 'prepared' && (
            <div className="mt-9 space-y-6">
              <div className="border-l-2 border-[#c69b5d]/45 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Member-chosen movement
                </p>
                <p className="mt-2 font-serif text-xl leading-8">{move}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Expected before action
                </p>
                <p className="mt-2 text-sm leading-6">{expectation}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Surprise remains possible
                </p>
                <p className="mt-2 text-sm leading-6">{surprise}</p>
              </div>

              <button
                type="button"
                onClick={leaveSoullab}
                className="text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Leave Soullab and live →
              </button>
            </div>
          )}

          {phase === 'away' && (
            <div className="mt-12 max-w-2xl border-l-2 border-[#27877a]/30 pl-5">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Outside Soullab
              </p>
              <p className="mt-3 font-serif text-2xl leading-9">
                Soullab is not watching.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#66584c]">
                No tracking. No compliance check. No interpretation while you are living.
                Return only if you want the experience to re-enter the field.
              </p>
              <button
                type="button"
                onClick={returnWithSyntheticLife}
                className="mt-7 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
              >
                Simulate return with lived consequence
              </button>
            </div>
          )}

          {phase === 'returned' && (
            <div className="mt-9 space-y-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  What I actually did · member report
                </p>
                <textarea
                  value={actualAction}
                  onChange={(event) => setActualAction(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-[18px] border border-[#806951]/15 bg-white/45 p-4 text-sm leading-6 outline-none"
                />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  What happened · member-reported lived evidence
                </p>
                <textarea
                  value={consequence}
                  onChange={(event) => setConsequence(event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-[18px] border border-[#806951]/15 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
              </div>

              <p className="text-[11px] leading-6 text-[#806f60]">
                Soullab has not yet explained why this happened or what it means.
              </p>

              <button
                type="button"
                onClick={compare}
                disabled={!actualAction.trim() || !consequence.trim()}
                className="text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4 disabled:opacity-35"
              >
                Compare expectation with consequence
              </button>
            </div>
          )}

          {phase === 'compare' && mismatch && (
            <div className="mt-9">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#74583f]/10 bg-white/35 p-5">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Expected before action
                  </p>
                  <p className="mt-3 font-serif text-lg leading-7">{mismatch.expected}</p>
                </div>

                <div className="rounded-[22px] border border-[#74583f]/10 bg-white/35 p-5">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    What happened
                  </p>
                  <p className="mt-3 font-serif text-lg leading-7">{mismatch.happened}</p>
                </div>
              </div>

              <div className="mt-6 border-l-2 border-[#c69b5d]/45 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Difference worth noticing
                </p>
                <p className="mt-2 text-sm leading-7">
                  The returned report does not support the broad expectation that both readers
                  would find the core argument hard to follow. It does contain two more local
                  points of friction.
                </p>
                {mismatch.surprised && (
                  <p className="mt-3 text-sm leading-7 text-[#66584c]">
                    This outcome matches what you named beforehand as potentially surprising.
                  </p>
                )}
                <p className="mt-2 text-[10px] leading-5 text-[#8a7965]">
                  This is a bounded comparison of expectation and reported consequence—not a
                  judgment about success, failure, growth, or motive.
                </p>
              </div>

              <div className="mt-8">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  What, if anything, should change in your understanding?
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                  {(
                    [
                      ['keep', 'Keep it'],
                      ['weaken', 'Weaken it'],
                      ['narrow', 'Narrow it'],
                      ['revise', 'Revise it'],
                      ['abandon', 'Abandon it'],
                      ['unknown', 'Leave it unresolved'],
                    ] as Array<[Revision, string]>
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => chooseRevision(value)}
                      className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === 'revised' && revision && (
            <div className="mt-9">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Member-shaped revision · {revision}
              </p>
              <textarea
                value={memberRevision}
                onChange={(event) => setMemberRevision(event.target.value)}
                className="mt-3 min-h-28 w-full rounded-[20px] border border-[#806951]/15 bg-white/45 p-5 font-serif text-xl leading-8 outline-none"
              />
              <p className="mt-4 text-[11px] leading-6 text-[#806f60]">
                The lived report did not become a general law. This revision receives standing
                only because the member chose and shaped it.
              </p>
            </div>
          )}

          {phase === 'rest' && (
            <div className="mt-12 border-l-2 border-[#27877a]/30 pl-5">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Lawful outcome
              </p>
              <p className="mt-3 font-serif text-2xl">
                This can remain reflection. Nothing has to be turned into an experiment.
              </p>
            </div>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Life Move Capsule</h2>

          {phase === 'revised' && revision ? (
            <div className="mt-5 space-y-5 text-xs leading-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Life Loop trace · capsule consumed
                </p>
                <p className="mt-2">No active Life Move remains.</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Expected before action
                </p>
                <p>{expectation}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Returned consequence
                </p>
                <p>{consequence}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Member-shaped revision
                </p>
                <p>{memberRevision}</p>
              </div>
            </div>
          ) : !capsuleActive ? (
            <p className="mt-4 text-sm leading-7 text-[#6b5b4e]">
              No active capsule. Life is not being tracked.
            </p>
          ) : (
            <div className="mt-5 space-y-5 text-xs leading-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Chosen by member
                </p>
                <p>{move}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Historical expectation
                </p>
                <p>{expectation}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  What could surprise me
                </p>
                <p>{surprise}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Tracking
                </p>
                <p>none</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Return required
                </p>
                <p>no</p>
              </div>
            </div>
          )}

          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Reality veto
            </p>
            <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
              If lived consequence conflicts with a prior frame, Soullab must be willing to
              weaken or abandon the frame rather than explain the discrepancy away.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
