'use client'

import { useMemo, useState } from 'react'

type FieldNode = {
  key: string
  label: string
  inquiry: string
  essence: string
  parent?: string
  crossing?: string
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
    crossing: 'Attention gathers around what feels alive enough to begin.',
    children: ['ignition', 'vision', 'possibility', 'creation'],
  },
  water: {
    key: 'water',
    label: 'Water',
    inquiry: 'What is ready to move, soften, or change form?',
    essence: 'Feeling · dissolution · receptivity',
    parent: 'root',
    crossing: 'Attention turns toward what is moving, softening, and asking to be felt.',
    children: ['dissolution', 'grief', 'surrender', 'continuing'],
  },
  earth: {
    key: 'earth',
    label: 'Earth',
    inquiry: 'What wants enough form to become livable?',
    essence: 'Form · body · containment',
    parent: 'root',
    crossing: 'Attention turns toward form, grounding, and embodiment.',
    children: ['vessel', 'boundary', 'embodiment', 'practice'],
  },
  air: {
    key: 'air',
    label: 'Air',
    inquiry: 'What wants to become clearer or more distinct?',
    essence: 'Perspective · distinction · articulation',
    parent: 'root',
    crossing: 'Attention turns toward what is ready to be named, distinguished, and understood.',
    children: ['differentiation', 'reflection', 'identity', 'perspective'],
  },
  aether: {
    key: 'aether',
    label: 'Aether',
    inquiry: 'What new possibility is forming between distinct parts?',
    essence: 'Generative relation · emergence',
    parent: 'root',
    crossing: 'Attention turns toward the possibilities emerging between distinct parts.',
    children: ['integration', 'emergence', 'relation', 'synthesis'],
  },

  ignition: {
    key: 'ignition', label: 'Ignition', parent: 'fire',
    inquiry: 'What has just become alive?', essence: 'First activation',
    crossing: 'General vitality gathers into a specific beginning.',
  },
  vision: {
    key: 'vision', label: 'Vision', parent: 'fire',
    inquiry: 'What is becoming imaginable?', essence: 'Direction taking image',
    crossing: 'Activation begins to take recognizable form.',
  },
  possibility: {
    key: 'possibility', label: 'Possibility', parent: 'fire',
    inquiry: 'What might exist?', essence: 'The open horizon',
    crossing: 'Energy opens into a wider field of possibility.',
  },
  creation: {
    key: 'creation', label: 'Creation', parent: 'fire',
    inquiry: 'What wants to enter the world through making?', essence: 'Bringing forth',
    crossing: 'Inner activation begins seeking worldly expression.',
  },
  dissolution: {
    key: 'dissolution', label: 'Dissolution', parent: 'water',
    inquiry: 'What is changing form?', essence: 'Loosening form',
    crossing: 'Change becomes visible as an existing form begins to loosen and reshape.',
  },
  grief: {
    key: 'grief', label: 'Grief', parent: 'water',
    inquiry: 'What mattered here, and how is the relationship changing now?', essence: 'Love meeting change',
    crossing: 'Change gathers around something deeply valued and the relationship taking a new form.',
  },
  surrender: {
    key: 'surrender', label: 'Surrender', parent: 'water',
    inquiry: 'What becomes possible through release?', essence: 'A gentler way of carrying',
    crossing: 'Movement opens through release and a gentler way of carrying what matters.',
  },
  continuing: {
    key: 'continuing', label: 'Continuing Relation', parent: 'water',
    inquiry: 'How is this relationship continuing in a new form?', essence: 'Relationship carried forward',
    crossing: 'Change opens into relationship carried through memory, influence, practice, or love.',
  },
  vessel: {
    key: 'vessel', label: 'Vessel', parent: 'earth',
    inquiry: 'What kind of vessel could hold this with care?', essence: 'Containing form',
    crossing: 'Form becomes a container spacious enough for what is here.',
  },
  boundary: {
    key: 'boundary', label: 'Boundary', parent: 'earth',
    inquiry: 'What kind of boundary helps this remain whole?', essence: 'Meaningful distinction',
    crossing: 'Form becomes a question of the limits that support integrity.',
  },
  embodiment: {
    key: 'embodiment', label: 'Embodiment', parent: 'earth',
    inquiry: 'How does this become real in lived experience?', essence: 'Lived expression',
    crossing: 'Structure moves toward body, action, and lived reality.',
  },
  practice: {
    key: 'practice', label: 'Practice', parent: 'earth',
    inquiry: 'What becomes known through doing?', essence: 'Repeated participation',
    crossing: 'Form becomes something inhabited repeatedly and learned through experience.',
  },
  differentiation: {
    key: 'differentiation', label: 'Differentiation', parent: 'air',
    inquiry: 'What becomes clearer when these are seen separately?', essence: 'Discernment',
    crossing: 'Distinct things come into clearer view.',
  },
  reflection: {
    key: 'reflection', label: 'Reflection', parent: 'air',
    inquiry: 'What did experience reveal?', essence: 'Returning upon experience',
    crossing: 'Perspective turns back toward what experience has revealed.',
  },
  identity: {
    key: 'identity', label: 'Identity', parent: 'air',
    inquiry: 'What feels authentic here?', essence: 'Continuity and differentiation of self',
    crossing: 'Distinction turns toward what feels most deeply authentic.',
  },
  perspective: {
    key: 'perspective', label: 'Perspective', parent: 'air',
    inquiry: 'What changes when this is seen from elsewhere?', essence: 'A different angle of regard',
    crossing: 'Clarity expands as the field is viewed from another position.',
  },
  integration: {
    key: 'integration', label: 'Integration', parent: 'aether',
    inquiry: 'What can belong together while each remains distinct?', essence: 'Coherence among differences',
    crossing: 'Relation begins producing coherence while difference remains alive.',
  },
  emergence: {
    key: 'emergence', label: 'Emergence', parent: 'aether',
    inquiry: 'What is appearing between these parts?', essence: 'Novelty through relation',
    crossing: 'Coherence begins to reveal a possibility that arises through relation.',
  },
  relation: {
    key: 'relation', label: 'Relation', parent: 'aether',
    inquiry: 'What is happening in the between?', essence: 'The living between',
    crossing: 'Attention moves from separate parts toward the field of their relation.',
  },
  synthesis: {
    key: 'synthesis', label: 'Synthesis', parent: 'aether',
    inquiry: 'What new possibility becomes visible when these are held together?', essence: 'Generative joining',
    crossing: 'Several distinct realities are held together long enough for another possibility to appear.',
  },
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

  const focus = NODES[focusKey]
  const children = useMemo(
    () => (focus.children ?? []).map((key) => NODES[key]),
    [focus],
  )
  const parent = focus.parent ? NODES[focus.parent] : null

  function enter(node: FieldNode) {
    setFocusKey(node.key)
  }

  function widen() {
    if (parent) setFocusKey(parent.key)
  }

  function close() {
    setOpen(false)
    setFocusKey('root')
  }

  if (!open) {
    return (
      <section className="rounded-[32px] border border-stone-800/90 bg-stone-900/45 px-5 py-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] sm:px-8 sm:py-9">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
          Enter the living field
        </p>
        <div className="mt-3 max-w-2xl">
          <h2 className="text-2xl font-light text-stone-100 sm:text-3xl">
            Every journey begins with a doorway.
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            A question, feeling, change, or possibility can be the entrance.
            Follow what feels alive and see where the field opens.
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
          <span className="text-xs text-stone-600">
            A first exploration, held within this visit.
          </span>
        </div>
      </section>
    )
  }

  const positions = children.length === 4 ? POSITIONS_FOUR : POSITIONS_FIVE

  return (
    <section className="overflow-hidden rounded-[32px] border border-stone-800 bg-[#11100f] shadow-[0_24px_90px_rgba(0,0,0,0.3)]">
      <header className="border-b border-stone-800/80 px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-600">
              Beginning point
            </p>
            <p className="mt-1 max-w-2xl text-sm text-stone-300">
              {origin.trim() || 'Open exploration'}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full px-3 py-1.5 text-xs text-stone-600 transition hover:text-stone-300"
          >
            Close
          </button>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-5 flex min-h-7 items-center justify-between gap-3">
          <button
            type="button"
            onClick={widen}
            disabled={!parent}
            className="text-sm text-stone-500 transition hover:text-stone-200 disabled:invisible"
          >
            ← Wider
          </button>
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-stone-600">
            {parent ? parent.label + ' · inside' : 'Current field'}
          </p>
          <span className="w-12" aria-hidden="true" />
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[650px] rounded-full border border-stone-700/70 bg-[radial-gradient(circle_at_50%_42%,rgba(120,100,70,0.12),rgba(30,28,26,0.18)_44%,rgba(10,10,10,0.6)_76%)] shadow-[inset_0_0_80px_rgba(255,255,255,0.025)]">
          <div className="absolute left-1/2 top-1/2 z-10 w-[34%] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[42%]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-600">
              {focus.key === 'root' ? 'Whole' : focus.essence}
            </p>
            <h2 className="mt-2 text-lg font-light text-stone-100 sm:text-3xl">
              {focus.label}
            </h2>
            <p className="mx-auto mt-2 max-w-[250px] text-[10px] leading-4 text-stone-400 sm:mt-3 sm:text-sm sm:leading-6">
              {focus.inquiry}
            </p>
          </div>

          {children.map((node, index) => {
            const position = positions[index] ?? positions[0]
            return (
              <button
                type="button"
                key={node.key}
                onClick={() => enter(node)}
                style={{ left: position.left + '%', top: position.top + '%' }}
                className="absolute z-20 flex aspect-square w-[23%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-stone-700/80 bg-stone-900/88 px-2 text-center shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm transition duration-500 hover:scale-[1.04] hover:border-amber-700/55 hover:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700/60 sm:w-[24%]"
              >
                <span className="text-[11px] font-medium text-stone-200 sm:text-sm">
                  {node.label}
                </span>
                <span className="mt-1 hidden max-w-[120px] text-[10px] leading-4 text-stone-500 sm:block">
                  {node.inquiry}
                </span>
              </button>
            )
          })}

          {children.length === 0 && (
            <div className="absolute inset-x-[14%] bottom-[15%] z-20 text-center">
              <p className="text-xs text-stone-500">This is also a place to linger.</p>
            </div>
          )}
        </div>

        {focus.crossing && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-stone-800/70 bg-stone-950/45 px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600">
              Crossing
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-400">
              {focus.crossing}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
