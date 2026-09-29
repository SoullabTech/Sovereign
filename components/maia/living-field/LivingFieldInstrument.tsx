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
export function LivingFieldInstrument() {
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState('')
  const [focusKey, setFocusKey] = useState('root')
  const [path, setPath] = useState<string[]>(['root'])
  const [mode, setMode] = useState<'world' | 'path'>('world')

  const focus = NODES[focusKey]
  const children = useMemo(() => (focus.children ?? []).map((key) => NODES[key]), [focus])
  const parent = focus.parent ? NODES[focus.parent] : null

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
      <header className="border-b border-stone-800/80 px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-600">Beginning point</p>
            <p className="mt-1 max-w-2xl text-sm text-stone-300">{origin.trim() || 'Open exploration'}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button type="button" onClick={() => setMode('world')} className={mode === 'world' ? 'rounded-full bg-stone-800 px-3 py-1.5 text-stone-100' : 'rounded-full px-3 py-1.5 text-stone-500 hover:text-stone-300'}>World</button>
            <button type="button" onClick={() => setMode('path')} className={mode === 'path' ? 'rounded-full bg-stone-800 px-3 py-1.5 text-stone-100' : 'rounded-full px-3 py-1.5 text-stone-500 hover:text-stone-300'}>Path</button>
            <button type="button" onClick={reset} className="rounded-full px-3 py-1.5 text-stone-600 hover:text-stone-300">Close</button>
          </div>
        </div>
      </header>

      {mode === 'path' ? (
        <div className="px-5 py-8 sm:px-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-600">The path so far</p>
          <div className="mx-auto mt-8 max-w-xl space-y-1">
            {path.map((key, index) => {
              const node = NODES[key]
              if (key === 'root') return null
              return (
                <div key={key} className="relative pl-8 pb-8 last:pb-0">
                  <span className="absolute left-[9px] top-2 h-full w-px bg-stone-800 last:hidden" />
                  <span className="absolute left-1 top-1.5 h-3 w-3 rounded-full border border-amber-700/60 bg-[#11100f]" />
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-500/75">{node.label}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-300">{node.transition}</p>
                  <p className="mt-2 text-sm italic text-stone-500">“{node.inquiry}”</p>
                  {index === path.length - 1 && <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-stone-600">Here now</p>}
                </div>
              )
            })}
            {path.length === 1 && <p className="text-sm text-stone-500">The first path is waiting to be discovered.</p>}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="mb-5 flex min-h-7 items-center justify-between gap-3">
            <button type="button" onClick={widen} disabled={!parent} className="text-sm text-stone-500 transition hover:text-stone-200 disabled:invisible">
              ← Wider
            </button>
            <p className="text-center text-[10px] uppercase tracking-[0.25em] text-stone-600">
              {parent ? parent.label + ' · inside' : 'Current field'}
            </p>
            <button type="button" onClick={() => setMode('path')} className="text-sm text-stone-500 transition hover:text-stone-200">
              Path →
            </button>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[650px] rounded-full border border-stone-700/70 bg-[radial-gradient(circle_at_50%_42%,rgba(120,100,70,0.12),rgba(30,28,26,0.18)_44%,rgba(10,10,10,0.6)_76%)] shadow-[inset_0_0_80px_rgba(255,255,255,0.025)]">
            <div className="absolute left-1/2 top-1/2 z-10 w-[42%] -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-600">{focus.key === 'root' ? 'Whole' : focus.essence}</p>
              <h2 className="mt-2 text-xl font-light text-stone-100 sm:text-3xl">{focus.label}</h2>
              <p className="mx-auto mt-3 max-w-[250px] text-xs leading-5 text-stone-400 sm:text-sm sm:leading-6">{focus.inquiry}</p>
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
                  className={'absolute z-20 flex aspect-square w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border bg-stone-900/88 px-2 text-center shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm transition duration-500 hover:scale-[1.04] hover:border-amber-700/55 hover:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700/60 sm:w-[24%] ' + (visited ? 'border-amber-800/60 shadow-[0_0_34px_rgba(146,92,34,0.09)]' : 'border-stone-700/80')}
                >
                  <span className="text-xs font-medium text-stone-200 sm:text-sm">{node.label}</span>
                  <span className="mt-1 hidden max-w-[120px] text-[10px] leading-4 text-stone-500 sm:block">{node.inquiry}</span>
                </button>
              )
            })}

            {children.length === 0 && (
              <div className="absolute inset-x-[14%] bottom-[15%] z-20 text-center">
                <p className="text-xs text-stone-500">This is also a place to linger.</p>
              </div>
            )}
          </div>

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
