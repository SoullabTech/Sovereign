'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { hierarchy, pack, type HierarchyCircularNode } from 'd3-hierarchy'
import { interpolateZoom } from 'd3-interpolate'

import { FIELD_TREE, type FieldDatum } from './livingFieldHierarchy'

type View = [number, number, number]

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
          {/* app/icon-fix.css globally makes SVGs click-through for Safari icons.
              This SVG is the instrument itself, so opting back into pointer events is
              load-bearing: without it Fire/Water/Earth/Air/Aether cannot be entered. */}
          <svg
            viewBox={`0 0 ${WIDTH} ${WIDTH}`}
            className="pointer-events-auto block h-auto w-full rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(110,78,43,0.12),rgba(17,16,15,0.2)_46%,rgba(7,7,7,0.85)_80%)]"
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
              // Progressive disclosure is load-bearing for legibility: the whole field
              // names only its five elemental regions; once one is entered, only that
              // region's immediate children are named. The focused node itself is spoken
              // once by the large center overlay rather than duplicated inside its circle.
              const visibleLabel =
                radius > 25 &&
                node.parent?.data.key === focus.data.key
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
