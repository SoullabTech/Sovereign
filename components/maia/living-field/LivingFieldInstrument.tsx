'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { hierarchy, pack, type HierarchyCircularNode } from 'd3-hierarchy'
import { interpolateZoom } from 'd3-interpolate'

type FieldDatum = {
  key: string
  label: string
  inquiry: string
  essence?: string
  children?: FieldDatum[]
}

type View = [number, number, number]

const FIELD_TREE: FieldDatum = {
  key: 'root',
  label: 'Living Field',
  inquiry: 'What is calling from the field?',
  essence: 'A living field of questions, processes, relationships, and possibility.',
  children: [
    {
      key: 'fire',
      label: 'Fire',
      inquiry: 'What wants to begin?',
      essence: 'activation · desire · vision · creation',
      children: [
        {
          key: 'fire-beginning',
          label: 'Beginning',
          inquiry: 'What is becoming alive enough to begin?',
          children: [
            { key: 'ignition', label: 'Ignition', inquiry: 'What has just become alive?' },
            { key: 'courage', label: 'Courage', inquiry: 'What asks to be met directly?' },
            { key: 'desire', label: 'Desire', inquiry: 'What draws life forward?' },
          ],
        },
        {
          key: 'fire-vision',
          label: 'Vision',
          inquiry: 'What is becoming imaginable?',
          children: [
            { key: 'possibility', label: 'Possibility', inquiry: 'What might exist?' },
            { key: 'direction', label: 'Direction', inquiry: 'What gives the energy a direction?' },
            { key: 'image', label: 'Image', inquiry: 'What form can already be sensed?' },
          ],
        },
        {
          key: 'fire-creation',
          label: 'Creation',
          inquiry: 'What wants to enter the world?',
          children: [
            { key: 'prototype', label: 'Prototype', inquiry: 'What small form could teach something?' },
            { key: 'expression', label: 'Expression', inquiry: 'What wants a voice or form?' },
            { key: 'experiment', label: 'Experiment', inquiry: 'What can experience reveal?' },
          ],
        },
      ],
    },
    {
      key: 'water',
      label: 'Water',
      inquiry: 'What is moving, softening, or changing form?',
      essence: 'feeling · relationship · change · release',
      children: [
        {
          key: 'water-feeling',
          label: 'Feeling',
          inquiry: 'What wants to be felt more fully?',
          children: [
            { key: 'longing', label: 'Longing', inquiry: 'What continues to call?' },
            { key: 'tenderness', label: 'Tenderness', inquiry: 'What becomes gentle when approached closely?' },
            { key: 'joy', label: 'Joy', inquiry: 'What is quietly alive here?' },
          ],
        },
        {
          key: 'water-change',
          label: 'Change',
          inquiry: 'What is taking another form?',
          children: [
            { key: 'dissolution', label: 'Dissolution', inquiry: 'What is loosening its former shape?' },
            { key: 'surrender', label: 'Surrender', inquiry: 'What opens through release?' },
            { key: 'threshold', label: 'Threshold', inquiry: 'What is being crossed?' },
          ],
        },
        {
          key: 'water-relationship',
          label: 'Relationship',
          inquiry: 'What is happening in the bond?',
          children: [
            {
              key: 'grief',
              label: 'Grief',
              inquiry: 'What mattered here, and how is relationship changing?',
              children: [
                { key: 'continuing-relation', label: 'Continuing Relation', inquiry: 'How is relationship continuing in a new form?' },
                { key: 'remembrance', label: 'Remembrance', inquiry: 'What is being carried forward?' },
                { key: 'ritual', label: 'Ritual', inquiry: 'What wants form, witness, or honoring?' },
              ],
            },
            { key: 'belonging', label: 'Belonging', inquiry: 'Where is connection felt?' },
            { key: 'intimacy', label: 'Intimacy', inquiry: 'What becomes possible through closeness?' },
          ],
        },
      ],
    },
    {
      key: 'earth',
      label: 'Earth',
      inquiry: 'What wants enough form to become livable?',
      essence: 'form · body · boundary · practice',
      children: [
        {
          key: 'earth-form',
          label: 'Form',
          inquiry: 'What shape could hold this?',
          children: [
            { key: 'vessel', label: 'Vessel', inquiry: 'What can hold this well?' },
            { key: 'structure', label: 'Structure', inquiry: 'What arrangement supports it?' },
            { key: 'boundary', label: 'Boundary', inquiry: 'What limit supports integrity?' },
          ],
        },
        {
          key: 'earth-body',
          label: 'Body',
          inquiry: 'How is this lived physically?',
          children: [
            { key: 'embodiment', label: 'Embodiment', inquiry: 'How does this become lived?' },
            { key: 'rhythm', label: 'Rhythm', inquiry: 'What cadence supports life here?' },
            { key: 'rest', label: 'Rest', inquiry: 'What restores capacity?' },
          ],
        },
        {
          key: 'earth-practice',
          label: 'Practice',
          inquiry: 'What becomes known through doing?',
          children: [
            { key: 'repetition', label: 'Repetition', inquiry: 'What becomes trustworthy through return?' },
            { key: 'craft', label: 'Craft', inquiry: 'What wants careful making?' },
            { key: 'stewardship', label: 'Stewardship', inquiry: 'What asks to be tended over time?' },
          ],
        },
      ],
    },
    {
      key: 'air',
      label: 'Air',
      inquiry: 'What wants to become clearer or more distinct?',
      essence: 'clarity · language · perspective · distinction',
      children: [
        {
          key: 'air-clarity',
          label: 'Clarity',
          inquiry: 'What wants clearer distinction?',
          children: [
            { key: 'differentiation', label: 'Differentiation', inquiry: 'What becomes clearer when seen separately?' },
            { key: 'naming', label: 'Naming', inquiry: 'What changes when it can be named?' },
            { key: 'discernment', label: 'Discernment', inquiry: 'What matters among the possibilities?' },
          ],
        },
        {
          key: 'air-perspective',
          label: 'Perspective',
          inquiry: 'What changes when seen from elsewhere?',
          children: [
            { key: 'reflection', label: 'Reflection', inquiry: 'What did experience reveal?' },
            {
              key: 'identity',
              label: 'Identity',
              inquiry: 'What feels authentic here?',
              children: [
                { key: 'calling', label: 'Calling', inquiry: 'What asks for wholehearted participation?' },
                { key: 'integrity', label: 'Integrity', inquiry: 'What needs to remain aligned?' },
                { key: 'role', label: 'Role', inquiry: 'What role is being inhabited or outgrown?' },
              ],
            },
            { key: 'reframing', label: 'Reframing', inquiry: 'What changes through another frame?' },
          ],
        },
        {
          key: 'air-meaning',
          label: 'Meaning',
          inquiry: 'What becomes intelligible here?',
          children: [
            { key: 'story', label: 'Story', inquiry: 'How is this being narrated?' },
            { key: 'language', label: 'Language', inquiry: 'What words make this more precise?' },
            { key: 'values', label: 'Values', inquiry: 'What matters enough to orient around?' },
          ],
        },
      ],
    },
    {
      key: 'aether',
      label: 'Aether',
      inquiry: 'What is becoming possible between distinct parts?',
      essence: 'relation · integration · emergence · whole',
      children: [
        {
          key: 'aether-relation',
          label: 'Relation',
          inquiry: 'What is happening in the between?',
          children: [
            { key: 'reciprocity', label: 'Reciprocity', inquiry: 'What is moving both ways?' },
            { key: 'participation', label: 'Participation', inquiry: 'How are the parts shaping one another?' },
            { key: 'coherence', label: 'Coherence', inquiry: 'What is beginning to belong together?' },
          ],
        },
        {
          key: 'aether-emergence',
          label: 'Emergence',
          inquiry: 'What is appearing that was not present before?',
          children: [
            { key: 'integration', label: 'Integration', inquiry: 'What can belong together while remaining distinct?' },
            { key: 'synthesis', label: 'Synthesis', inquiry: 'What new possibility is becoming visible?' },
            { key: 'novelty', label: 'Novelty', inquiry: 'What genuinely new form is appearing?' },
          ],
        },
        {
          key: 'aether-whole',
          label: 'Whole',
          inquiry: 'What changes when the larger field is perceived?',
          children: [
            { key: 'pattern', label: 'Pattern', inquiry: 'What repeats across different places?' },
            { key: 'field', label: 'Field', inquiry: 'What becomes visible between the parts?' },
            { key: 'mystery', label: 'Mystery', inquiry: 'What remains open beyond naming?' },
          ],
        },
      ],
    },
  ],
}

const WIDTH = 1000

function nodeView(node: HierarchyCircularNode<FieldDatum>): View {
  const multiplier = node.children ? 2.12 : 4.8
  return [node.x, node.y, Math.max(node.r * multiplier, 42)]
}

function isAncestor(ancestor: HierarchyCircularNode<FieldDatum>, node: HierarchyCircularNode<FieldDatum>) {
  return node.ancestors().some((candidate) => candidate.data.key === ancestor.data.key)
}

export function LivingFieldInstrument() {
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState('')
  const [focusKey, setFocusKey] = useState('root')
  const [selectedLeafKey, setSelectedLeafKey] = useState<string | null>(null)

  const layout = useMemo(() => {
    const root = hierarchy(FIELD_TREE)
      .sum((datum) => (datum.children?.length ? 0 : 1))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    return pack<FieldDatum>()
      .size([WIDTH, WIDTH])
      .padding(7)(root)
  }, [])

  const nodeByKey = useMemo(() => {
    const map = new Map<string, HierarchyCircularNode<FieldDatum>>()
    layout.descendants().forEach((node) => map.set(node.data.key, node))
    return map
  }, [layout])

  const [view, setView] = useState<View>(() => nodeView(layout))
  const viewRef = useRef<View>(nodeView(layout))
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const focus = nodeByKey.get(focusKey) ?? layout
  const selectedLeaf = selectedLeafKey ? nodeByKey.get(selectedLeafKey) ?? null : null
  const breadcrumb = focus.ancestors().reverse()

  const animateTo = (target: View) => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      viewRef.current = target
      setView(target)
      return
    }

    const interpolate = interpolateZoom(viewRef.current, target)
    const duration = Math.min(1150, Math.max(520, interpolate.duration * 0.72))
    const start = performance.now()

    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - raw, 3)
      const next = interpolate(eased) as View
      viewRef.current = next
      setView(next)

      if (raw < 1) animationRef.current = requestAnimationFrame(tick)
      else animationRef.current = null
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  const enterNode = (node: HierarchyCircularNode<FieldDatum>) => {
    setSelectedLeafKey(node.children ? null : node.data.key)
    setFocusKey(node.data.key)
    animateTo(nodeView(node))
  }

  const widen = () => {
    const current = nodeByKey.get(focusKey) ?? layout
    const target = current.parent ?? layout
    setSelectedLeafKey(null)
    setFocusKey(target.data.key)
    animateTo(nodeView(target))
  }

  const resetField = () => {
    setSelectedLeafKey(null)
    setFocusKey('root')
    animateTo(nodeView(layout))
  }

  const close = () => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    setOpen(false)
    setOrigin('')
    setFocusKey('root')
    setSelectedLeafKey(null)
    const rootView = nodeView(layout)
    viewRef.current = rootView
    setView(rootView)
  }

  if (!open) {
    return (
      <section className="rounded-[32px] border border-stone-800/90 bg-stone-900/45 px-5 py-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] sm:px-8 sm:py-9">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Enter the living field</p>
        <div className="mt-3 max-w-2xl">
          <h2 className="text-3xl font-light text-stone-100 sm:text-4xl">Every journey begins with a doorway.</h2>
          <p className="mt-4 text-base leading-7 text-stone-400">
            Bring a live question, then move through the field by entering the regions that draw attention.
          </p>
        </div>
        <label className="mt-6 block">
          <span className="sr-only">What is stirring, changing, or calling?</span>
          <textarea
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            rows={3}
            placeholder="What is stirring, changing, or calling?"
            className="w-full resize-none rounded-2xl border border-stone-800 bg-stone-950/70 px-5 py-4 text-base leading-7 text-stone-200 placeholder:text-stone-600 outline-none transition focus:border-amber-700/60"
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-full border border-amber-700/50 bg-amber-950/20 px-5 py-2.5 text-base text-amber-300 transition hover:border-amber-600 hover:bg-amber-950/35"
        >
          Enter the field →
        </button>
      </section>
    )
  }

  const scale = WIDTH / view[2]
  const screenRadius = (node: HierarchyCircularNode<FieldDatum>) => node.r * scale
  const screenX = (node: HierarchyCircularNode<FieldDatum>) => (node.x - view[0]) * scale + WIDTH / 2
  const screenY = (node: HierarchyCircularNode<FieldDatum>) => (node.y - view[1]) * scale + WIDTH / 2

  return (
    <section className="overflow-hidden rounded-[32px] border border-stone-800 bg-[#11100f] shadow-[0_24px_90px_rgba(0,0,0,0.3)]">
      <header className="border-b border-stone-800/80 px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-600">Question in the field</p>
            <p className="mt-2 max-w-3xl text-base leading-7 text-stone-100 sm:text-lg">
              {origin.trim() || 'Open exploration'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button type="button" onClick={resetField} className="text-stone-400 transition hover:text-stone-100">
              Whole field
            </button>
            <button type="button" onClick={close} className="text-stone-600 transition hover:text-stone-300">
              Close
            </button>
          </div>
        </div>
      </header>

      <div className="px-3 py-5 sm:px-7 sm:py-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={widen}
            disabled={!focus.parent}
            className="text-base text-stone-400 transition hover:text-stone-100 disabled:invisible"
          >
            ← Wider
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-600">
            {breadcrumb.map((node, index) => (
              <span key={node.data.key} className="flex items-center gap-2">
                {index > 0 && <span className="text-stone-800">/</span>}
                <span className={index === breadcrumb.length - 1 ? 'text-amber-700/90' : ''}>{node.data.label}</span>
              </span>
            ))}
          </div>

          <p className="text-sm text-stone-600">Enter a circle · surrounding field widens</p>
        </div>

        <div className="relative mx-auto max-w-[980px]">
          <svg
            viewBox={`0 0 ${WIDTH} ${WIDTH}`}
            className="block h-auto w-full rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(110,78,43,0.12),rgba(17,16,15,0.2)_46%,rgba(7,7,7,0.85)_80%)]"
            onClick={widen}
            role="img"
            aria-label="Recursive Living Field"
          >
            {layout.descendants().map((node) => {
              const radius = screenRadius(node)
              if (radius < 1.5) return null

              const x = screenX(node)
              const y = screenY(node)
              const focused = node.data.key === focusKey
              const selected = node.data.key === selectedLeafKey
              const inFocusLineage = isAncestor(node, focus) || isAncestor(focus, node)
              const visibleLabel = radius > 25
              const depthOpacity = Math.max(0.18, 0.72 - node.depth * 0.09)
              const fillOpacity = node.depth === 0 ? 0.04 : Math.max(0.025, 0.09 - node.depth * 0.012)

              return (
                <g
                  key={node.data.key}
                  transform={`translate(${x},${y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={node.children ? `Enter ${node.data.label}` : `Open ${node.data.label}`}
                  data-field-key={node.data.key}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      event.stopPropagation()
                      enterNode(node)
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <circle
                    r={radius}
                    fill={`rgba(38,34,30,${fillOpacity})`}
                    stroke={focused || selected ? 'rgba(202,124,39,0.92)' : inFocusLineage ? 'rgba(130,103,75,0.58)' : `rgba(112,103,94,${depthOpacity})`}
                    strokeWidth={focused || selected ? 2.2 : Math.max(0.7, 1.35 - node.depth * 0.13)}
                    vectorEffect="non-scaling-stroke"
                    onClick={(event) => {
                      event.stopPropagation()
                      enterNode(node)
                    }}
                  />

                  {visibleLabel && node.depth > 0 && (
                    <>
                      <text
                        textAnchor="middle"
                        y={radius < 55 ? 4 : -2}
                        fill={focused || selected ? '#f4d6ad' : '#e7e5e4'}
                        fontSize={Math.max(11, Math.min(22, radius / 4.8))}
                        fontWeight={node.depth <= 1 ? 600 : 500}
                        pointerEvents="none"
                      >
                        {node.data.label}
                      </text>
                      {radius > 90 && (
                        <text
                          textAnchor="middle"
                          y={22}
                          fill="#8d8781"
                          fontSize={Math.max(9, Math.min(14, radius / 9))}
                          pointerEvents="none"
                        >
                          {node.children ? 'enter' : 'open'}
                        </text>
                      )}
                    </>
                  )}
                </g>
              )
            })}
          </svg>

          <div className="pointer-events-none absolute inset-x-[12%] top-1/2 z-20 -translate-y-1/2 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              {focus.data.essence ?? (focus.parent?.data.label ? `inside ${focus.parent.data.label}` : 'whole field')}
            </p>
            <h2 className="mt-2 text-3xl font-light text-stone-50 sm:text-5xl">{focus.data.label}</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-stone-300 sm:text-xl sm:leading-8">
              {focus.data.inquiry}
            </p>
          </div>
        </div>

        {selectedLeaf && (
          <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-stone-800 bg-stone-950/45 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700/80">In view</p>
                <h3 className="mt-2 text-xl text-stone-100">{selectedLeaf.data.label}</h3>
                <p className="mt-2 text-base leading-7 text-stone-400">{selectedLeaf.data.inquiry}</p>
              </div>
              <button
                type="button"
                onClick={widen}
                className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-amber-800/50 hover:text-stone-100"
              >
                Back into {selectedLeaf.parent?.data.label ?? 'the field'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
