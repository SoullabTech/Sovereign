'use client'

import { useState } from 'react'

type RealityRelation =
  | 'supports'
  | 'complicates'
  | 'contradicts'
  | 'insufficient'

type Comparison = {
  relation: RealityRelation
  label: string
  statement: string
  implication: string
  standing: 'MAIA_EVIDENCE_COMPARISON'
}

type ResponseBody = {
  comparison: Comparison
  expectationStanding: 'HISTORICAL_MEMBER_EXPECTATION'
  consequenceStanding: 'MEMBER_REPORTED_LIVED_EVIDENCE'
  persistence: 'none'
  provider?: {
    kind?: string
    model?: string | null
  }
}

type Revision =
  | 'keep'
  | 'weaken'
  | 'narrow'
  | 'revise'
  | 'abandon'
  | 'unknown'

const EXPECTATION =
  'I expect both readers to say the core argument is hard to follow.'

const CONSEQUENCE =
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
    'I do not yet know what larger conclusion to draw from these two reader reports.',
}

export function RealityVetoRuntimeWitnessClient() {
  const [expectation, setExpectation] = useState(EXPECTATION)
  const [consequence, setConsequence] = useState(CONSEQUENCE)
  const [result, setResult] = useState<ResponseBody | null>(null)
  const [loading, setLoading] = useState(false)
  const [abstention, setAbstention] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState<Revision | null>(null)
  const [memberRevision, setMemberRevision] = useState('')

  async function compareWithMaia() {
    setLoading(true)
    setResult(null)
    setAbstention(null)
    setError(null)
    setRevision(null)
    setMemberRevision('')

    try {
      const response = await fetch('/api/maia/soul-service/reality-veto-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectation, consequence }),
      })
      const data = await response.json()

      if (!response.ok) {
        if (data?.abstained) {
          setAbstention(
            data.reason ||
              'MAIA could not compare this evidence within the permitted boundary.',
          )
          return
        }
        throw new Error(data?.reason || data?.error || 'Comparison unavailable')
      }

      setResult(data)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Comparison unavailable',
      )
    } finally {
      setLoading(false)
    }
  }

  function chooseRevision(next: Revision) {
    setRevision(next)
    setMemberRevision(REVISION_COPY[next])
  }

  function reset() {
    setExpectation(EXPECTATION)
    setConsequence(CONSEQUENCE)
    setResult(null)
    setAbstention(null)
    setError(null)
    setRevision(null)
    setMemberRevision('')
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03B · Reality-veto runtime
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Can MAIA let reality contradict it?
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
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Historical member expectation
              </span>
              <textarea
                value={expectation}
                onChange={(event) => setExpectation(event.target.value)}
                className="mt-3 min-h-36 w-full rounded-[20px] border border-[#806951]/15 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
              />
            </label>

            <label>
              <span className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Member-reported lived consequence
              </span>
              <textarea
                value={consequence}
                onChange={(event) => setConsequence(event.target.value)}
                className="mt-3 min-h-36 w-full rounded-[20px] border border-[#806951]/15 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
              />
            </label>
          </div>

          {!result && !abstention && (
            <button
              type="button"
              onClick={compareWithMaia}
              disabled={loading || !expectation.trim() || !consequence.trim()}
              className="mt-7 text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4 disabled:opacity-35"
            >
              {loading
                ? 'MAIA is comparing the evidence…'
                : 'Ask MAIA only: how do these relate?'}
            </button>
          )}

          {result && (
            <div className="mt-9">
              <div className="border-l-2 border-[#c69b5d]/45 pl-4">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  MAIA evidence comparison · governed language
                </p>
                <h2 className="mt-2 font-serif text-2xl">
                  {result.comparison.label}
                </h2>
                <p className="mt-3 text-base leading-7 text-[#51463d]">
                  {result.comparison.statement}
                </p>
                <p className="mt-2 text-[11px] leading-6 text-[#806f60]">
                  {result.comparison.implication}
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
                      type="button"
                      onClick={() => chooseRevision(value)}
                      className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {revision && (
                <div className="mt-8">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    Member-shaped revision · {revision}
                  </p>
                  <textarea
                    value={memberRevision}
                    onChange={(event) => setMemberRevision(event.target.value)}
                    className="mt-3 min-h-28 w-full rounded-[20px] border border-[#806951]/15 bg-white/45 p-5 font-serif text-xl leading-8 outline-none"
                  />
                  <p className="mt-3 text-[11px] leading-6 text-[#806f60]">
                    MAIA classified the evidence relation. You decided what the relation changes.
                  </p>
                </div>
              )}
            </div>
          )}

          {abstention && (
            <div className="mt-9 border-l-2 border-[#27877a]/30 pl-4">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                MAIA abstained
              </p>
              <p className="mt-2 font-serif text-xl">
                No bounded evidence comparison offered.
              </p>
              <p className="mt-2 text-xs leading-6 text-[#806f60]">{abstention}</p>
            </div>
          )}

          {error && (
            <p className="mt-8 text-sm text-[#8a4f42]">{error}</p>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Authority boundary</h2>

          <div className="mt-6 space-y-6 text-xs leading-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                MAIA may
              </p>
              <p>choose one governed evidence relation.</p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                MAIA may not
              </p>
              <p>
                explain why the outcome happened, infer motive, score success, rescue a contradicted
                theory, or decide what you should now believe.
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                Member retains
              </p>
              <p>authority over revision, meaning, and next movement.</p>
            </div>
          </div>

          {result?.provider && (
            <details className="mt-7 border-t border-[#74583f]/12 pt-5 text-xs leading-6 text-[#6b5b4e]">
              <summary className="cursor-pointer">Runtime witness</summary>
              <p className="mt-3">provider: {result.provider.kind}</p>
              <p>model: {result.provider.model ?? 'unknown'}</p>
              <p>persistence: {result.persistence}</p>
              <p>model output authority: enum only</p>
            </details>
          )}

          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Reality veto
            </p>
            <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
              A model is not protected from contradiction merely because it produced the earlier
              frame.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
