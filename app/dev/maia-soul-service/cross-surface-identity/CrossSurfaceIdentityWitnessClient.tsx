'use client'

import { flushSync } from 'react-dom'
import { useMemo, useState } from 'react'

type Surface = 'living_field' | 'grokker' | 'writers_studio' | 'maia'

type LivingObject = {
  livingObjectId: string
  title: string
  sourceVersion: string
  excerpt: string
}

type ReturnEnvelope = {
  livingObjectId: string
  sourceVersionWitnessed: string
  originSurface: Surface
  originLocus: string
  originView: string
  focusTarget: string
  movementIntent: string
  openedAt: string
  returnPolicy:
    | 'restore_orientation_reconcile_truth_clear_transient'
}

type ReturnDelta = {
  beforeVersion: string
  nowVersion: string
  beforeExcerpt: string
  nowExcerpt: string
}

const ORIGINAL: LivingObject = {
  livingObjectId: 'work:elemental-alchemy',
  title: 'Elemental Alchemy',
  sourceVersion: 'ea:v1',
  excerpt:
    'The work is becoming clearer, but I do not want to lose its soul while I make it more coherent.',
}

const REVISED =
  'The work is ready to enter the world in this form, while remaining open to what I learn from its release.'

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

const SURFACE_LABEL: Record<Surface, string> = {
  living_field: 'Living Field',
  grokker: 'Grokker',
  writers_studio: "Writer's Studio",
  maia: 'MAIA',
}

export function CrossSurfaceIdentityWitnessClient() {
  const [surface, setSurface] = useState<Surface>('living_field')
  const [object, setObject] = useState<LivingObject>(ORIGINAL)
  const [envelope, setEnvelope] = useState<ReturnEnvelope | null>(null)
  const [returnDelta, setReturnDelta] = useState<ReturnDelta | null>(null)
  const [writerDraft, setWriterDraft] = useState(ORIGINAL.excerpt)
  const [temporaryMaiaLens, setTemporaryMaiaLens] = useState<string | null>(null)

  const identityStyle = useMemo(
    () => ({ viewTransitionName: 'living-object-elemental-alchemy' } as React.CSSProperties),
    [],
  )

  function beginTraversal(destination: Surface, movementIntent: string) {
    const nextEnvelope: ReturnEnvelope =
      envelope ??
      {
        livingObjectId: object.livingObjectId,
        sourceVersionWitnessed: object.sourceVersion,
        originSurface: surface,
        originLocus: object.livingObjectId,
        originView: 'living-object-presence',
        focusTarget: 'living-object-elemental-alchemy',
        movementIntent,
        openedAt: '2026-09-29T16:15:00-04:00',
        returnPolicy: 'restore_orientation_reconcile_truth_clear_transient',
      }

    transition(() => {
      setEnvelope(nextEnvelope)
      setSurface(destination)
      setReturnDelta(null)
    })
  }

  function moveWithinTraversal(destination: Surface, movementIntent: string) {
    transition(() => {
      setSurface(destination)
      setTemporaryMaiaLens(null)
      if (envelope) {
        setEnvelope({ ...envelope, movementIntent })
      }
    })
  }

  function applyWriterEdit() {
    const next: LivingObject = {
      ...object,
      sourceVersion: 'ea:v2',
      excerpt: REVISED,
    }

    setWriterDraft(REVISED)
    setObject(next)
  }

  function returnHome() {
    const currentEnvelope = envelope
    const delta: ReturnDelta | null =
      currentEnvelope &&
      currentEnvelope.sourceVersionWitnessed !== object.sourceVersion
        ? {
            beforeVersion: currentEnvelope.sourceVersionWitnessed,
            nowVersion: object.sourceVersion,
            beforeExcerpt: ORIGINAL.excerpt,
            nowExcerpt: object.excerpt,
          }
        : null

    transition(() => {
      setSurface(currentEnvelope?.originSurface ?? 'living_field')
      setReturnDelta(delta)
      setEnvelope(null)
      setTemporaryMaiaLens(null)
    })
  }

  function resetWitness() {
    transition(() => {
      setSurface('living_field')
      setObject(ORIGINAL)
      setWriterDraft(ORIGINAL.excerpt)
      setEnvelope(null)
      setReturnDelta(null)
      setTemporaryMaiaLens(null)
    })
  }

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            MAIA-SOUL-SERVICE-02R3 · Cross-surface identity witness
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            One thing, many rooms.
          </h1>
        </div>
        <button
          type="button"
          onClick={resetWitness}
          className="text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
        >
          Reset witness
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(['living_field', 'grokker', 'writers_studio', 'maia'] as Surface[]).map(
          (name) => (
            <span
              key={name}
              className={[
                'rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]',
                surface === name
                  ? 'border-[#b46f48]/35 bg-white/45 text-[#6f492f]'
                  : 'border-[#8c745d]/15 bg-white/20 text-[#9b8875]',
              ].join(' ')}
            >
              {SURFACE_LABEL[name]}
            </span>
          ),
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.7fr]">
        <div className="min-h-[560px] rounded-[32px] border border-[#74583f]/10 bg-white/25 p-6 md:p-8">
          <div style={identityStyle} id="living-object-elemental-alchemy">
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
              Same governed identity
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#8a7965]">
              {object.livingObjectId}
            </p>
            <h2 className="mt-4 font-serif text-3xl md:text-[38px]">
              {object.title}
            </h2>
            <p className="mt-2 text-[10px] uppercase tracking-[0.13em] text-[#9a8972]">
              source version {object.sourceVersion}
            </p>
          </div>

          {surface === 'living_field' && (
            <div className="mt-10">
              <p className="max-w-3xl font-serif text-2xl leading-[1.5] text-[#4b4037]">
                {object.excerpt}
              </p>

              {returnDelta && (
                <details
                  open
                  className="mt-6 max-w-2xl border-l-2 border-[#c69b5d]/45 pl-4 text-sm text-[#6e5d4e]"
                >
                  <summary className="cursor-pointer list-none text-[#785b36]">
                    Changed while you were elsewhere
                  </summary>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#9a8972]">
                        Before · {returnDelta.beforeVersion}
                      </p>
                      <p className="mt-2 font-serif leading-6">
                        {returnDelta.beforeExcerpt}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#9a8972]">
                        Now · {returnDelta.nowVersion}
                      </p>
                      <p className="mt-2 font-serif leading-6">
                        {returnDelta.nowExcerpt}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-[#8a7965]">
                    Same work · current source reconciled · no meaning inferred.
                  </p>
                </details>
              )}

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <button
                  onClick={() => beginTraversal('grokker', 'see connections')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  See connections in Grokker
                </button>
                <button
                  onClick={() => beginTraversal('writers_studio', 'continue writing')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Continue writing
                </button>
                <button
                  onClick={() => beginTraversal('maia', 'discuss with MAIA')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Bring this to MAIA
                </button>
              </div>
            </div>
          )}

          {surface === 'grokker' && (
            <div className="mt-10">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Grokker projection · relational / spatial affordance
              </p>
              <div className="relative mt-6 min-h-[300px] rounded-[28px] border border-[#7e6752]/12 bg-white/20 p-6">
                <div className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b48b62]/25 bg-white/55 p-6 text-center">
                  <p className="font-serif text-xl">{object.title}</p>
                  <p className="mt-1 text-[9px] text-[#927b68]">{object.livingObjectId}</p>
                </div>
                <div className="absolute left-8 top-10 rounded-full border border-[#7e6752]/15 bg-white/45 px-4 py-2 text-xs">
                  Teaching
                </div>
                <div className="absolute right-8 top-16 rounded-full border border-[#7e6752]/15 bg-white/45 px-4 py-2 text-xs">
                  Soullab
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border border-dashed border-[#7e6752]/25 bg-white/35 px-4 py-2 text-xs">
                  possible relation · not yet yours
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-5 text-sm">
                <button
                  onClick={() => moveWithinTraversal('writers_studio', 'continue writing')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Continue in Writer
                </button>
                <button
                  onClick={returnHome}
                  className="text-[#795230] underline underline-offset-4"
                >
                  ← Return to Living Field
                </button>
              </div>
            </div>
          )}

          {surface === 'writers_studio' && (
            <div className="mt-10">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Writer projection · authorized source mutation
              </p>
              <textarea
                value={writerDraft}
                onChange={(event) => setWriterDraft(event.target.value)}
                className="mt-5 min-h-48 w-full resize-y rounded-[22px] border border-[#7e6752]/12 bg-white/45 p-5 font-serif text-xl leading-8 outline-none"
              />
              <div className="mt-5 flex flex-wrap gap-5 text-sm">
                <button
                  onClick={applyWriterEdit}
                  disabled={object.sourceVersion === 'ea:v2'}
                  className="text-[#795230] underline underline-offset-4 disabled:opacity-35"
                >
                  Apply witness edit → ea:v2
                </button>
                <button
                  onClick={() => moveWithinTraversal('maia', 'discuss current work')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Discuss this current version with MAIA
                </button>
                <button
                  onClick={returnHome}
                  className="text-[#795230] underline underline-offset-4"
                >
                  ← Return to Living Field
                </button>
              </div>
            </div>
          )}

          {surface === 'maia' && (
            <div className="mt-10">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                MAIA projection · dialogical affordance
              </p>
              <p className="mt-5 max-w-2xl font-serif text-2xl leading-9">
                I’m with the current {object.sourceVersion} source. I can help you look from
                another aperture without changing what the work is.
              </p>

              {!temporaryMaiaLens ? (
                <button
                  type="button"
                  onClick={() => setTemporaryMaiaLens('What does the evidence actually support?')}
                  className="mt-6 text-sm text-[#795230] underline underline-offset-4"
                >
                  Ask for a temporary aperture
                </button>
              ) : (
                <div className="mt-6 border-l-2 border-[#27877a]/35 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                    temporary MAIA aperture · not identity
                  </p>
                  <p className="mt-2 font-serif text-xl">{temporaryMaiaLens}</p>
                </div>
              )}

              <div className="mt-7 flex flex-wrap gap-5 text-sm">
                <button
                  onClick={() => moveWithinTraversal('grokker', 'see relations again')}
                  className="text-[#795230] underline underline-offset-4"
                >
                  See this in Grokker
                </button>
                <button
                  onClick={returnHome}
                  className="text-[#795230] underline underline-offset-4"
                >
                  ← Return to Living Field
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Continuity envelope</h2>
          {!envelope ? (
            <p className="mt-4 text-sm leading-7 text-[#6b5b4e]">
              No active traversal. The work is simply here in Living Field.
            </p>
          ) : (
            <dl className="mt-5 space-y-4 text-xs leading-6">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  living object
                </dt>
                <dd>{envelope.livingObjectId}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  witnessed source
                </dt>
                <dd>{envelope.sourceVersionWitnessed}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  origin
                </dt>
                <dd>{SURFACE_LABEL[envelope.originSurface]}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  movement chosen
                </dt>
                <dd>{envelope.movementIntent}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  return policy
                </dt>
                <dd>restore orientation → reconcile truth → clear transient</dd>
              </div>
            </dl>
          )}

          <div className="mt-7 border-t border-[#74583f]/12 pt-5">
            <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
              Current projection
            </p>
            <p className="mt-2 font-serif text-lg">{SURFACE_LABEL[surface]}</p>
            <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
              Surface changes what you can do with the object. It does not create a new object.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
