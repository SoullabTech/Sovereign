'use client'

import { useMemo, useState } from 'react'

type FieldNode = {
  key: string
  label: string
  inquiry: string
  essence: string
  parent?: string
  transition?: string
  children?: string[]
}

const NODES: Record<string, FieldNode> = {
  root: {
    key: 'root',
    label: 'Living Field',
    inquiry: 'What is calling from the field?',
    essence: 'A place to meet what is alive and follow where it leads.',
    children: ['fire', 'water', 'earth', 'air', 'aether'],
  },
  fire: {
    key: 'fire',
    label: 'Fire',
    inquiry: 'What wants to begin?',
    essence: 'Activation · vision · generativity',
    parent: 'root',
    transition: 'Attention shifts from the whole toward what feels alive enough to begin.',
    children: ['ignition', 'vision', 'possibility', 'creation'],
  },
  water: {
    key: 'water',
    label: 'Water',
    inquiry: 'What is ready to move, soften, or change form?',
    essence: 'Feeling · dissolution · receptivity',
    parent: 'root',
    transition: 'Attention turns toward what is moving, softening, and asking to be felt.',
    children: ['dissolution', 'grief', 'surrender', 'continuing'],
  },
  earth: {
    key: 'earth',
    label: 'Earth',
    inquiry: 'What wants enough form to become livable?',
    essence: 'Form · body · containment',
    parent: 'root',
    transition: 'Attention turns toward form, grounding, and embodiment.',
    children: ['vessel', 'boundary', 'embodiment', 'practice'],
  },
  air: {
    key: 'air',
    label: 'Air',
    inquiry: 'What wants to become clearer or more distinct?',
    essence: 'Perspective · distinction · articulation',
    parent: 'root',
    transition: 'Attention turns toward what is ready to be named, distinguished, and understood.',
    children: ['differentiation', 'reflection', 'identity', 'perspective'],
  },
  aether: {
    key: 'aether',
    label: 'Aether',
    inquiry: 'What new possibility is forming between distinct parts?',
    essence: 'Generative relation · emergence',
    parent: 'root',
    transition: 'Attention turns toward the possibilities emerging between distinct parts.',
    children: ['integration', 'emergence', 'relation', 'synthesis'],
  },
  ignition: { key: 'ignition', label: 'Ignition', inquiry: 'What has just become alive?', essence: 'First activation', parent: 'fire', transition: 'General vitality becomes a specific beginning.' },
  vision: { key: 'vision', label: 'Vision', inquiry: 'What is trying to become imaginable?', essence: 'Direction taking image', parent: 'fire', transition: 'Activation begins to take recognizable form.' },
  possibility: { key: 'possibility', label: 'Possibility', inquiry: 'What might exist?', essence: 'The open horizon', parent: 'fire', transition: 'Energy opens into a wider field of possibility.' },
  creation: { key: 'creation', label: 'Creation', inquiry: 'What wants to enter the world through making?', essence: 'Bringing forth', parent: 'fire', transition: 'Inner activation begins seeking worldly expression.' },
  dissolution: { key: 'dissolution', label: 'Dissolution', inquiry: 'What is changing form?', essence: 'Loosening form', parent: 'water', transition: 'Change becomes visible as an existing form begins to loosen and reshape.' },
  grief: { key: 'grief', label: 'Grief', inquiry: 'What mattered here, and how is the relationship changing now?', essence: 'Love meeting change', parent: 'water', transition: 'Change gathers around something deeply valued and the relationship taking a new form.' },
  surrender: { key: 'surrender', label: 'Surrender', inquiry: 'What becomes possible through release?', essence: 'A gentler way of carrying', parent: 'water', transition: 'Movement opens through release and a gentler way of carrying what matters.' },
  continuing: { key: 'continuing', label: 'Continuing Relation', inquiry: 'How is this relationship continuing in a new form?', essence: 'Relationship carried forward', parent: 'water', transition: 'Change opens into the ways relationship may continue through memory, influence, practice, or love.' },
  vessel: { key: 'vessel', label: 'Vessel', inquiry: 'What could hold this without suppressing it?', essence: 'Containing form', parent: 'earth', transition: 'Form becomes specifically capable of holding experience.' },
  boundary: { key: 'boundary', label: 'Boundary', inquiry: 'What kind of boundary helps this remain whole?', essence: 'Meaningful distinction', parent: 'earth', transition: 'Form becomes a question of the limits that support integrity.' },
  embodiment: { key: 'embodiment', label: 'Embodiment', inquiry: 'How does this become actual rather than conceptual?', essence: 'Lived expression', parent: 'earth', transition: 'Structure moves toward body, action, and lived reality.' },
  practice: { key: 'practice', label: 'Practice', inquiry: 'What becomes known only through doing?', essence: 'Repeated participation', parent: 'earth', transition: 'Form becomes something inhabited repeatedly rather than merely understood.' },
  differentiation: { key: 'differentiation', label: 'Differentiation', inquiry: 'What becomes clearer when these are seen separately?', essence: 'Discernment', parent: 'air', transition: 'Thought brings distinct things into clearer view.' },
  reflection: { key: 'reflection', label: 'Reflection', inquiry: 'What did experience reveal?', essence: 'Returning upon experience', parent: 'air', transition: 'Perspective turns back toward what has actually happened.' },
  identity: { key: 'identity', label: 'Identity', inquiry: 'What feels authentic here?', essence: 'Continuity and differentiation of self', parent: 'air', transition: 'Distinction turns toward what feels most deeply authentic.' },
  perspective: { key: 'perspective', label: 'Perspective', inquiry: 'What changes when this is seen from elsewhere?', essence: 'A different angle of regard', parent: 'air', transition: 'Clarity expands by changing the position from which the field is viewed.' },
  integration: { key: 'integration', label: 'Integration', inquiry: 'What can belong together while each remains distinct?', essence: 'Coherence among differences', parent: 'aether', transition: 'Relation begins producing coherence while difference remains alive.' },
  emergence: { key: 'emergence', label: 'Emergence', inquiry: 'What is appearing that none of the parts contained alone?', essence: 'Novelty through relation', parent: 'aether', transition: 'Coherence becomes generative rather than merely additive.' },
  relation: { key: 'relation', label: 'Relation', inquiry: 'What is happening in the between?', essence: 'The field between differentiated participants', parent: 'aether', transition: 'Attention moves from isolated parts toward the reality of their between.' },
  synthesis: { key: 'synthesis', label: 'Synthesis', inquiry: 'What new possibility becomes visible when these are held together?', essence: 'Generative joining', parent: 'aether', transition: 'Several differentiated realities are held together long enough for a new possibility to appear.' },
}

const POSITIONS_FIVE = [
  { left: 50, top: 18 },
  { left: 24, top: 43 },
  { left: 76, top: 43 },
  { left: 36, top: 73 },
  { left: 64, top: 73 },
]

const POSITIONS_FOUR = [
  { left: 50, top: 18 },
  { left: 24, top: 49 },
  { left: 76, top: 49 },
  { left: 50, top: 80 },
]

const REGION_INVITATION: Record<string, string> = {
  root: 'A live question can be seen from several directions. Each doorway opens another way of meeting it.',
  fire: 'Fire follows energy, desire, beginnings, courage, and what is asking to come alive.',
  water: 'Water follows feeling, relationship, change, release, and the forms life is taking now.',
  earth: 'Earth follows form, grounding, boundaries, embodiment, and what can become livable.',
  air: 'Air follows clarity, distinction, reflection, perspective, and the words that help something become visible.',
  aether: 'Aether follows relation, emergence, integration, and what becomes possible between distinct parts.',
}

const JOURNEY_LANGUAGE: Record<string, string> = {
  fire: 'what wants to begin',
  water: 'change, feeling, and what is moving',
  earth: 'form, grounding, and what can become livable',
  air: 'clarity, distinction, and a wider perspective',
  aether: 'what may be emerging between distinct parts',
  ignition: 'a beginning becoming tangible',
  vision: 'what is becoming imaginable',
  possibility: 'a wider field of possibility',
  creation: 'what wants to be brought into the world',
  dissolution: 'a form beginning to loosen and reshape',
  grief: 'what matters deeply as relationship changes',
  surrender: 'what opens through release',
  continuing: 'relationship continuing in a new form',
  vessel: 'a form capable of holding what matters',
  boundary: 'the limits that support integrity',
  embodiment: 'what becomes real through lived form',
  practice: 'what becomes known through doing',
  differentiation: 'what becomes clearer when things are seen distinctly',
  reflection: 'what experience is revealing',
  identity: 'what feels most deeply authentic',
  perspective: 'what changes through another angle of regard',
  integration: 'coherence that preserves difference',
  emergence: 'something new appearing through relation',
  relation: 'what is happening in the between',
  synthesis: 'a new possibility becoming visible through relation',
}

export function LivingFieldInstrument() {
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState('')
  const [focusKey, setFocusKey] = useState('root')
  const [path, setPath] = useState<string[]>(['root'])
  const [mode, setMode] = useState<'world' | 'path'>('world')

  const focus = NODES[focusKey]
  const children = useMemo(() => (focus.children ?? []).map((key) => NODES[key]), [focus])
  const parent = focus.parent ? NODES[focus.parent] : null
  const travelledNodes = path.filter((key) => key !== 'root').map((key) => NODES[key])
  const firstTravelled = travelledNodes[0] ?? null
  const deepestTravelled = travelledNodes[travelledNodes.length - 1] ?? null
  const deepestParent = deepestTravelled?.parent ? NODES[deepestTravelled.parent] : null

  const journeyMovement = (() => {
    if (!firstTravelled) return 'The field is open. The first crossing will begin to shape the journey.'
    if (!deepestTravelled || firstTravelled.key === deepestTravelled.key) {
      return `The journey opened into ${JOURNEY_LANGUAGE[firstTravelled.key] ?? firstTravelled.essence.toLowerCase()}.`
    }
    return `The journey moved from ${JOURNEY_LANGUAGE[firstTravelled.key] ?? firstTravelled.essence.toLowerCase()} toward ${JOURNEY_LANGUAGE[deepestTravelled.key] ?? deepestTravelled.essence.toLowerCase()}.`
  })()

  const enter = (node: FieldNode) => {
    setFocusKey(node.key)
    setPath((current) => [...current, node.key])
    setMode('world')
  }

  const widen = () => {
    if (!parent) return
    setFocusKey(parent.key)
    // Keep the travelled path intact: widening restores context without erasing
    // the distinction just encountered (the enriched-return contract).
    setMode('world')
  }

  const returnTo = (key: string) => {
    setFocusKey(key)
    setMode('world')
  }

  const reset = () => {
    setOpen(false)
    setFocusKey('root')
    setPath(['root'])
    setMode('world')
  }
  if (!open) {
    return (
      <section className="rounded-[32px] border border-stone-800/90 bg-stone-900/45 px-5 py-7 sm:px-8 sm:py-9 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Enter the living field</p>
        <div className="mt-3 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-light text-stone-100">Every journey begins with a doorway.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            A question, feeling, change, or possibility can be the entrance. Follow what feels alive and see where the field opens.
          </p>
        </div>
        <label className="mt-6 block">
          <span className="sr-only">What is stirring, changing, or calling?</span>
          <textarea
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            rows={3}
            placeholder="What is stirring, changing, or calling?"
            className="w-full resize-none rounded-2xl border border-stone-800 bg-stone-950/70 px-4 py-3 text-sm leading-6 text-stone-200 placeholder:text-stone-600 outline-none transition focus:border-amber-700/60"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-amber-700/50 bg-amber-950/20 px-5 py-2.5 text-sm text-amber-300 transition hover:border-amber-600 hover:bg-amber-950/35"
          >
            Step into the field →
          </button>
          <span className="text-xs text-stone-600">A first exploration, held within this visit.</span>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-stone-800 bg-[#11100f] shadow-[0_24px_90px_rgba(0,0,0,0.3)]">
      <header className="border-b border-stone-800/80 px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-600">Beginning point</p>
            <p className="mt-2 max-w-2xl text-base leading-6 text-stone-200 sm:text-lg">{origin.trim() || 'Open exploration'}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button type="button" onClick={() => setMode('world')} className={mode === 'world' ? 'rounded-full bg-stone-800 px-3 py-1.5 text-stone-100' : 'rounded-full px-3 py-1.5 text-stone-500 hover:text-stone-300'}>World</button>
            <button type="button" onClick={() => setMode('path')} className={mode === 'path' ? 'rounded-full bg-stone-800 px-3 py-1.5 text-stone-100' : 'rounded-full px-3 py-1.5 text-stone-500 hover:text-stone-300'}>Journey</button>
            <button type="button" onClick={reset} className="rounded-full px-3 py-1.5 text-stone-600 hover:text-stone-300">Close</button>
          </div>
        </div>
      </header>

      {mode === 'path' ? (
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Journey</p>

            <section className="mt-7 rounded-2xl border border-stone-800/80 bg-stone-950/35 px-5 py-5 sm:px-6">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Where this began</p>
              <p className="mt-3 text-lg leading-8 text-stone-100">{origin.trim() || 'Open exploration'}</p>
            </section>

            <section className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">What came into view</p>
              <p className="mt-4 text-2xl font-light leading-9 text-stone-100 sm:text-3xl sm:leading-[1.35]">{journeyMovement}</p>

              {travelledNodes.length > 0 && (
                <div className="mt-8 flex items-center gap-3 overflow-x-auto pb-2">
                  <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-stone-600">Beginning</span>
                  {travelledNodes.map((node, index) => (
                    <div key={node.key} className="flex shrink-0 items-center gap-3">
                      <span className="h-px w-8 bg-stone-800" />
                      <span className={index === travelledNodes.length - 1
                        ? 'rounded-full border border-amber-800/60 bg-amber-950/10 px-4 py-2 text-sm text-amber-300'
                        : 'rounded-full border border-stone-800 px-4 py-2 text-sm text-stone-300'
                      }>
                        {node.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {deepestTravelled ? (
              <section className="mt-9 border-t border-stone-800/80 pt-7">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Where from here</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => returnTo(deepestTravelled.key)}
                    className="rounded-2xl border border-stone-800 bg-stone-950/45 px-4 py-4 text-left transition hover:border-amber-800/50 hover:bg-stone-900/70"
                  >
                    <span className="block text-base text-stone-100">Stay here</span>
                    <span className="mt-2 block text-sm leading-6 text-stone-500">{deepestTravelled.label}</span>
                  </button>

                  {deepestParent && (
                    <button
                      type="button"
                      onClick={() => returnTo(deepestParent.key)}
                      className="rounded-2xl border border-stone-800 bg-stone-950/45 px-4 py-4 text-left transition hover:border-amber-800/50 hover:bg-stone-900/70"
                    >
                      <span className="block text-base text-stone-100">Return to {deepestParent.label}</span>
                      <span className="mt-2 block text-sm leading-6 text-stone-500">See this journey inside its wider field</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => returnTo('root')}
                    className="rounded-2xl border border-stone-800 bg-stone-950/45 px-4 py-4 text-left transition hover:border-amber-800/50 hover:bg-stone-900/70"
                  >
                    <span className="block text-base text-stone-100">Widen the view</span>
                    <span className="mt-2 block text-sm leading-6 text-stone-500">Return to the larger Living Field</span>
                  </button>
                </div>

                <p className="mt-8 text-base italic leading-7 text-stone-500">
                  What feels different from where the journey began?
                </p>
              </section>
            ) : (
              <p className="mt-7 text-sm text-stone-500">The first crossing will begin to shape the journey.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-7 sm:px-8 sm:py-9">
          <div className="mb-6 flex min-h-8 items-center justify-between gap-3">
            <button type="button" onClick={widen} disabled={!parent} className="text-base text-stone-400 transition hover:text-stone-100 disabled:invisible">
              ← Wider
            </button>
            <p className="text-center text-xs uppercase tracking-[0.22em] text-stone-500">
              {parent ? parent.label + ' · inside' : 'Current field'}
            </p>
            <button type="button" onClick={() => setMode('path')} className="text-base text-stone-400 transition hover:text-stone-100">
              Journey →
            </button>
          </div>

          <div className="mx-auto mb-7 max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-700/80">
              {focus.key === 'root' ? 'Why enter this field?' : focus.label + ' · a way of seeing'}
            </p>
            <p className="mt-3 text-base leading-7 text-stone-300 sm:text-lg">
              {REGION_INVITATION[focus.key] ?? ('This doorway brings the beginning question toward ' + (JOURNEY_LANGUAGE[focus.key] ?? focus.essence.toLowerCase()) + '.')}
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              {children.length > 0
                ? 'Choose the opening that feels closest to the question now.'
                : 'Stay with the question here, explore nearby openings, or widen the view.'}
            </p>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[760px] rounded-full border border-stone-700/70 bg-[radial-gradient(circle_at_50%_42%,rgba(120,100,70,0.12),rgba(30,28,26,0.18)_44%,rgba(10,10,10,0.6)_76%)] shadow-[inset_0_0_80px_rgba(255,255,255,0.025)]">
            {children.length > 0 && (
              <svg
                viewBox="0 0 100 100"
                className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
                aria-hidden="true"
              >
                {children.map((node, index) => {
                  if (!path.includes(node.key)) return null
                  const positions = children.length === 4 ? POSITIONS_FOUR : POSITIONS_FIVE
                  const position = positions[index] ?? positions[0]
                  return (
                    <line
                      key={'trace-' + node.key}
                      x1="50"
                      y1="50"
                      x2={position.left}
                      y2={position.top}
                      stroke="rgba(180,112,38,0.34)"
                      strokeWidth="0.38"
                      strokeDasharray="1.2 1.8"
                    />
                  )
                })}
              </svg>
            )}

            <div className={'absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center ' + (children.length === 0 ? 'w-[72%]' : 'w-[44%]')}>
              <p className="text-xs uppercase tracking-[0.26em] text-stone-500">{focus.key === 'root' ? 'Whole' : focus.essence}</p>
              <h2 className="mt-3 text-3xl font-light text-stone-50 sm:text-4xl">{focus.label}</h2>
              <p className="mx-auto mt-4 max-w-[360px] text-base leading-7 text-stone-300 sm:text-lg">{focus.inquiry}</p>

              {children.length === 0 && (
                <div className="mx-auto mt-7 max-w-[520px]">
                  <p className="text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
                    This doorway brings the beginning question toward {JOURNEY_LANGUAGE[focus.key] ?? focus.essence.toLowerCase()}.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {parent && (
                      <button
                        type="button"
                        onClick={() => returnTo(parent.key)}
                        className="rounded-full border border-stone-700 bg-stone-950/55 px-4 py-2.5 text-sm text-stone-200 transition hover:border-amber-800/50 hover:bg-stone-900"
                      >
                        Explore nearby openings
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMode('path')}
                      className="rounded-full border border-stone-700 bg-stone-950/55 px-4 py-2.5 text-sm text-stone-200 transition hover:border-amber-800/50 hover:bg-stone-900"
                    >
                      See the Journey
                    </button>
                    <button
                      type="button"
                      onClick={() => returnTo('root')}
                      className="rounded-full border border-stone-700 bg-stone-950/55 px-4 py-2.5 text-sm text-stone-200 transition hover:border-amber-800/50 hover:bg-stone-900"
                    >
                      Widen to the whole field
                    </button>
                  </div>
                </div>
              )}
            </div>

            {children.map((node, index) => {
              const positions = children.length === 4 ? POSITIONS_FOUR : POSITIONS_FIVE
              const position = positions[index] ?? positions[0]
              const visited = path.includes(node.key)
              return (
                <button
                  type="button"
                  key={node.key}
                  onClick={() => enter(node)}
                  style={{ left: position.left + '%', top: position.top + '%' }}
                  className={'absolute z-20 hidden aspect-square w-[25%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border bg-stone-900/88 px-3 text-center shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm transition duration-500 hover:scale-[1.04] hover:border-amber-700/55 hover:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700/60 sm:flex ' + (visited ? 'border-amber-800/60 shadow-[0_0_34px_rgba(146,92,34,0.09)]' : 'border-stone-700/80')}
                >
                  <span className="text-sm font-medium text-stone-100 sm:text-base">{node.label}</span>
                  <span className="mt-2 hidden max-w-[155px] text-xs leading-5 text-stone-400 sm:block">{node.inquiry}</span>
                </button>
              )
            })}

          </div>

          {children.length > 0 && (
            <div className="mx-auto mt-5 grid max-w-xl grid-cols-1 gap-3 sm:hidden">
              {children.map((node) => {
                const visited = path.includes(node.key)
                return (
                  <button
                    type="button"
                    key={'mobile-' + node.key}
                    onClick={() => enter(node)}
                    className={'rounded-2xl border px-5 py-4 text-left transition ' + (visited
                      ? 'border-amber-800/60 bg-amber-950/10'
                      : 'border-stone-800 bg-stone-950/45 hover:border-stone-700')}
                  >
                    <span className="block text-base font-medium text-stone-100">{node.label}</span>
                    <span className="mt-2 block text-sm leading-6 text-stone-400">{node.inquiry}</span>
                  </button>
                )
              })}
            </div>
          )}

          {focus.transition && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-stone-800/70 bg-stone-950/45 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600">Crossing</p>
              <p className="mt-1 text-sm leading-6 text-stone-400">{focus.transition}</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
