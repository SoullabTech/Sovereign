'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Force,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import {
  GROUP_BY_ID,
  GROUP_GEOMETRY,
  NODE_BY_ID,
  PHYSICS_GROUPS,
  PHYSICS_NODES,
  PHYSICS_RELATIONS,
  relatedNodeIds,
  relatedRelations,
  type PhysicsGroupKey,
  type PhysicsNodeDatum,
  type PhysicsRelation,
} from './physicsFieldData'

type AttentionPhase = 'idle' | 'glance' | 'attend' | 'dwell'

type SimNode = SimulationNodeDatum &
  PhysicsNodeDatum & {
    r: number
    anchorX: number
    anchorY: number
  }

type SimLink = SimulationLinkDatum<SimNode> & {
  relation: PhysicsRelation
}

type AttentionTrace = {
  nodeId: string
  at: number
}

type BridgeBundle = {
  key: string
  a: PhysicsGroupKey
  b: PhysicsGroupKey
  relations: PhysicsRelation[]
  strength: number
}

const WIDTH = 1000
const HEIGHT = 720
const TRACE_TTL = 10000

const WORLD_STYLE: Record<PhysicsGroupKey, { rgb: string; edge: string; glow: string }> = {
  fire: { rgb: '214,116,46', edge: '#d97732', glow: '#f2a45f' },
  water: { rgb: '52,124,147', edge: '#4e9fb5', glow: '#73bed0' },
  earth: { rgb: '126,125,77', edge: '#9a985f', glow: '#c2bd7a' },
  air: { rgb: '111,111,171', edge: '#8989c5', glow: '#b0afe2' },
  aether: { rgb: '143,89,132', edge: '#a06b96', glow: '#c99abb' },
}

function makeNodes(): SimNode[] {
  const groupCounts = new Map<string, number>()

  return PHYSICS_NODES.map((datum) => {
    const groupIndex = groupCounts.get(datum.group) ?? 0
    groupCounts.set(datum.group, groupIndex + 1)
    const group = GROUP_GEOMETRY[datum.group]
    const angle = (-Math.PI / 2) + groupIndex * (Math.PI * 2 / 4)
    const anchorDistance = 72

    return {
      ...datum,
      r: datum.label.length > 17 ? 30 : 27,
      x: group.x + Math.cos(angle) * anchorDistance,
      y: group.y + Math.sin(angle) * anchorDistance,
      anchorX: group.x + Math.cos(angle) * anchorDistance,
      anchorY: group.y + Math.sin(angle) * anchorDistance,
    }
  })
}

function makeLinks(): SimLink[] {
  return PHYSICS_RELATIONS.map((relation) => ({
    source: relation.source,
    target: relation.target,
    relation,
  }))
}

function endpointId(endpoint: string | number | SimNode) {
  return typeof endpoint === 'object' ? endpoint.id : String(endpoint)
}

function circularContainment(): Force<SimNode, undefined> {
  let nodes: SimNode[] = []

  const force = ((alpha: number) => {
    for (const node of nodes) {
      const group = GROUP_GEOMETRY[node.group]
      const dx = (node.x ?? group.x) - group.x
      const dy = (node.y ?? group.y) - group.y
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      const maxDistance = group.r - node.r - 11

      if (distance > maxDistance) {
        const overflow = distance - maxDistance
        const pull = overflow * 0.28 * alpha
        node.vx = (node.vx ?? 0) - (dx / distance) * pull
        node.vy = (node.vy ?? 0) - (dy / distance) * pull
      }
    }
  }) as Force<SimNode, undefined>

  force.initialize = (next: SimNode[]) => {
    nodes = next
  }

  return force
}

function pairKey(a: PhysicsGroupKey, b: PhysicsGroupKey) {
  return [a, b].sort().join('::')
}

function buildBridgeBundles(): BridgeBundle[] {
  const map = new Map<string, BridgeBundle>()

  for (const relation of PHYSICS_RELATIONS) {
    const source = NODE_BY_ID.get(relation.source)
    const target = NODE_BY_ID.get(relation.target)
    if (!source || !target || source.group === target.group) continue

    const key = pairKey(source.group, target.group)
    const existing = map.get(key)

    if (existing) {
      existing.relations.push(relation)
      existing.strength += relation.strength
    } else {
      const [a, b] = [source.group, target.group].sort() as [PhysicsGroupKey, PhysicsGroupKey]
      map.set(key, {
        key,
        a,
        b,
        relations: [relation],
        strength: relation.strength,
      })
    }
  }

  return [...map.values()]
}

function membranePoints(a: PhysicsGroupKey, b: PhysicsGroupKey) {
  const ga = GROUP_GEOMETRY[a]
  const gb = GROUP_GEOMETRY[b]
  const dx = gb.x - ga.x
  const dy = gb.y - ga.y
  const length = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / length
  const uy = dy / length

  const start = { x: ga.x + ux * ga.r, y: ga.y + uy * ga.r }
  const end = { x: gb.x - ux * gb.r, y: gb.y - uy * gb.r }
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
  const bend = (a.charCodeAt(0) + b.charCodeAt(0)) % 2 === 0 ? 22 : -22

  return {
    start,
    end,
    control: {
      x: mid.x - uy * bend,
      y: mid.y + ux * bend,
    },
  }
}

function bridgePath(a: PhysicsGroupKey, b: PhysicsGroupKey) {
  const points = membranePoints(a, b)
  return `M ${points.start.x} ${points.start.y} Q ${points.control.x} ${points.control.y} ${points.end.x} ${points.end.y}`
}

export function CellularLivingFieldPrototype() {
  const [nodes] = useState<SimNode[]>(() => makeNodes())
  const [links] = useState<SimLink[]>(() => makeLinks())
  const [, setFrame] = useState(0)

  const [focusGroup, setFocusGroup] = useState<PhysicsGroupKey | null>(null)
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [hoveredRelationId, setHoveredRelationId] = useState<string | null>(null)
  const [attentionPhase, setAttentionPhase] = useState<AttentionPhase>('idle')
  const [attentionTraces, setAttentionTraces] = useState<AttentionTrace[]>([])
  const [cameraView, setCameraView] = useState({ cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 })

  const svgRef = useRef<SVGSVGElement | null>(null)
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const draggingRef = useRef<string | null>(null)
  const attendTimerRef = useRef<number | null>(null)
  const dwellTimerRef = useRef<number | null>(null)
  const cameraAnimationRef = useRef<number | null>(null)
  const cameraRef = useRef({ cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 })

  const bridgeBundles = useMemo(() => buildBridgeBundles(), [])
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])

  const activeNodeId = hoveredNodeId ?? focusNodeId
  const activeNode = activeNodeId ? NODE_BY_ID.get(activeNodeId) ?? null : null
  const activeNeighborhood = activeNodeId ? relatedNodeIds(activeNodeId) : null
  const activeRelations = activeNodeId ? relatedRelations(activeNodeId) : []
  const hoveredRelation = hoveredRelationId
    ? PHYSICS_RELATIONS.find((relation) => relation.id === hoveredRelationId) ?? null
    : null

  const recentTraceByNode = useMemo(() => {
    const now = Date.now()
    const map = new Map<string, number>()
    for (const trace of attentionTraces) {
      map.set(trace.nodeId, Math.max(0, 1 - (now - trace.at) / TRACE_TTL))
    }
    return map
  }, [attentionTraces])

  useEffect(() => {
    const prune = window.setInterval(() => {
      const cutoff = Date.now() - TRACE_TTL
      setAttentionTraces((current) => current.filter((trace) => trace.at >= cutoff))
    }, 600)

    return () => window.clearInterval(prune)
  }, [])

  useEffect(() => {
    const simulation = forceSimulation<SimNode>(nodes)
      .alpha(0.88)
      .alphaDecay(0.036)
      .velocityDecay(0.29)
      .force('charge', forceManyBody<SimNode>().strength(-125).distanceMax(235))
      .force('collision', forceCollide<SimNode>().radius((node) => node.r + 9).strength(0.96).iterations(2))
      .force('anchor-x', forceX<SimNode>((node) => node.anchorX).strength(0.055))
      .force('anchor-y', forceY<SimNode>((node) => node.anchorY).strength(0.055))
      .force(
        'links',
        forceLink<SimNode, SimLink>(links)
          .id((node) => node.id)
          .distance((link) => link.relation.distance)
          .strength((link) => Math.min(0.2, 0.07 + link.relation.strength * 0.095)),
      )
      .force('containment', circularContainment())
      .on('tick', () => setFrame((frame) => frame + 1))

    simulationRef.current = simulation

    return () => {
      simulation.stop()
      simulationRef.current = null
    }
  }, [links, nodes])

  useEffect(() => {
    return () => {
      if (attendTimerRef.current !== null) window.clearTimeout(attendTimerRef.current)
      if (dwellTimerRef.current !== null) window.clearTimeout(dwellTimerRef.current)
      if (cameraAnimationRef.current !== null) cancelAnimationFrame(cameraAnimationRef.current)
    }
  }, [])

  const clearAttentionTimers = () => {
    if (attendTimerRef.current !== null) window.clearTimeout(attendTimerRef.current)
    if (dwellTimerRef.current !== null) window.clearTimeout(dwellTimerRef.current)
    attendTimerRef.current = null
    dwellTimerRef.current = null
  }

  const rememberAttention = (nodeId: string) => {
    const now = Date.now()
    setAttentionTraces((current) => {
      const withoutNode = current.filter((trace) => trace.nodeId !== nodeId)
      return [...withoutNode, { nodeId, at: now }].slice(-5)
    })
  }

  const beginAttention = (nodeId: string) => {
    clearAttentionTimers()
    setHoveredNodeId(nodeId)
    setAttentionPhase('glance')

    attendTimerRef.current = window.setTimeout(() => {
      setAttentionPhase('attend')
      simulationRef.current?.alpha(0.13).restart()
    }, 350)

    dwellTimerRef.current = window.setTimeout(() => {
      setAttentionPhase('dwell')
      rememberAttention(nodeId)
      simulationRef.current?.alphaTarget(0)
    }, 1200)
  }

  const endAttention = () => {
    clearAttentionTimers()
    setHoveredNodeId(null)
    setAttentionPhase(focusNodeId ? 'dwell' : 'idle')
  }

  const selectNode = (node: SimNode) => {
    clearAttentionTimers()
    setFocusNodeId(node.id)
    setFocusGroup(node.group)
    setAttentionPhase('dwell')
    rememberAttention(node.id)
    simulationRef.current?.alpha(0.18).restart()
  }

  const releaseNodeFocus = () => {
    setFocusNodeId(null)
    setHoveredNodeId(null)
    setAttentionPhase('idle')
  }

  const enterWorld = (group: PhysicsGroupKey) => {
    setFocusGroup(group)
    setFocusNodeId(null)
    setHoveredNodeId(null)
    setAttentionPhase('idle')
  }

  const widen = () => {
    if (focusNodeId) {
      releaseNodeFocus()
      return
    }

    setFocusGroup(null)
    setAttentionPhase('idle')
  }

  const pointFromPointer = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return null

    return {
      x: ((clientX - rect.left) / rect.width) * WIDTH,
      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    }
  }

  const dragStart = (node: SimNode, clientX: number, clientY: number) => {
    const point = pointFromPointer(clientX, clientY)
    if (!point) return

    draggingRef.current = node.id
    node.fx = point.x
    node.fy = point.y
    setFocusNodeId(node.id)
    setFocusGroup(node.group)
    setAttentionPhase('attend')
    simulationRef.current?.alphaTarget(0.24).restart()
  }

  const dragMove = (clientX: number, clientY: number) => {
    if (!draggingRef.current) return
    const node = nodeById.get(draggingRef.current)
    const point = pointFromPointer(clientX, clientY)
    if (!node || !point) return

    node.fx = point.x
    node.fy = point.y
  }

  const dragEnd = () => {
    if (!draggingRef.current) return
    const node = nodeById.get(draggingRef.current)

    if (node) {
      node.fx = null
      node.fy = null
      rememberAttention(node.id)
    }

    draggingRef.current = null
    setAttentionPhase('dwell')
    simulationRef.current?.alphaTarget(0)
  }

  const visibleNodeLabel = (node: SimNode) => {
    if (!focusGroup) return activeNeighborhood?.has(node.id) || !!recentTraceByNode.get(node.id)
    if (focusNodeId) return activeNeighborhood?.has(node.id)
    return node.group === focusGroup
  }

  const nodeOpacity = (node: SimNode) => {
    if (!focusGroup && !activeNeighborhood) return 0.68
    if (activeNeighborhood) return activeNeighborhood.has(node.id) ? 1 : 0.13
    if (focusGroup) return node.group === focusGroup ? 1 : 0.16
    return 1
  }

  const bridgeActivity = (bundle: BridgeBundle) => {
    let score = 0
    const activeIds = new Set(activeRelations.map((relation) => relation.id))

    for (const relation of bundle.relations) {
      if (activeIds.has(relation.id)) score = Math.max(score, 1)
      const sourceTrace = recentTraceByNode.get(relation.source) ?? 0
      const targetTrace = recentTraceByNode.get(relation.target) ?? 0
      score = Math.max(score, Math.max(sourceTrace, targetTrace) * 0.55)
    }

    if (focusGroup && (bundle.a === focusGroup || bundle.b === focusGroup)) score = Math.max(score, 0.28)
    if (bundle.relations.length >= 2) score = Math.max(score, 0.16)

    return score
  }

  const groupAttention = (groupId: PhysicsGroupKey) => {
    if (activeNode?.group === groupId) return 1
    if (focusGroup === groupId) return 0.75

    const bridgeScore = Math.max(
      0,
      ...bridgeBundles
        .filter((bundle) => bundle.a === groupId || bundle.b === groupId)
        .map((bundle) => bridgeActivity(bundle) * 0.6),
    )

    return bridgeScore
  }

  useEffect(() => {
    const target = focusNodeId
      ? {
          cx: nodeById.get(focusNodeId)?.x ?? GROUP_GEOMETRY[focusGroup ?? 'air'].x,
          cy: nodeById.get(focusNodeId)?.y ?? GROUP_GEOMETRY[focusGroup ?? 'air'].y,
          scale: 1.9,
        }
      : focusGroup
        ? {
            cx: GROUP_GEOMETRY[focusGroup].x,
            cy: GROUP_GEOMETRY[focusGroup].y,
            scale: 1.48,
          }
        : { cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 }

    if (cameraAnimationRef.current !== null) cancelAnimationFrame(cameraAnimationRef.current)

    const start = cameraRef.current
    const startTime = performance.now()
    const duration = 820

    const tick = (now: number) => {
      const raw = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - raw, 3)
      const next = {
        cx: start.cx + (target.cx - start.cx) * eased,
        cy: start.cy + (target.cy - start.cy) * eased,
        scale: start.scale + (target.scale - start.scale) * eased,
      }

      cameraRef.current = next
      setCameraView(next)

      if (raw < 1) cameraAnimationRef.current = requestAnimationFrame(tick)
      else cameraAnimationRef.current = null
    }

    cameraAnimationRef.current = requestAnimationFrame(tick)

    return () => {
      if (cameraAnimationRef.current !== null) {
        cancelAnimationFrame(cameraAnimationRef.current)
        cameraAnimationRef.current = null
      }
    }
  }, [focusGroup, focusNodeId, nodeById])

  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${cameraView.scale}) translate(${-cameraView.cx} ${-cameraView.cy})`

  return (
    <section className="overflow-hidden rounded-[30px] border border-stone-800 bg-[#090a0a]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800/80 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-700/80">Cellular Living Field · R1R6</p>
          <h2 className="mt-1 text-2xl font-light text-stone-100">Attention reveals the ecology.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            Hover to glance. Stay to attend. Dwell to reveal relation. Click a world to enter it; click a node to move closer.
          </p>
        </div>
        <button
          type="button"
          onClick={widen}
          disabled={!focusGroup && !focusNodeId}
          className="rounded-full border border-stone-800 px-4 py-2 text-sm text-stone-400 transition hover:border-stone-700 hover:text-stone-100 disabled:opacity-25"
        >
          ← Widen
        </button>
      </header>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full touch-none"
          onPointerMove={(event) => dragMove(event.clientX, event.clientY)}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
        >
          <defs>
            {PHYSICS_GROUPS.map((group) => {
              const style = WORLD_STYLE[group.id]
              return (
                <radialGradient key={group.id} id={`world-${group.id}`} cx="50%" cy="46%" r="60%">
                  <stop offset="0%" stopColor={`rgba(${style.rgb},0.19)`} />
                  <stop offset="58%" stopColor={`rgba(${style.rgb},0.075)`} />
                  <stop offset="100%" stopColor={`rgba(${style.rgb},0.018)`} />
                </radialGradient>
              )
            })}

            {bridgeBundles.map((bundle) => {
              const a = WORLD_STYLE[bundle.a]
              const b = WORLD_STYLE[bundle.b]
              return (
                <linearGradient key={bundle.key} id={`bridge-${bundle.key.replace('::', '-')}`} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={a.glow} />
                  <stop offset="50%" stopColor="#c8b29c" />
                  <stop offset="100%" stopColor={b.glow} />
                </linearGradient>
              )
            })}

            <filter id="soft-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={WIDTH} height={HEIGHT} fill="#090a0a" />

          <g
            data-field-stage="camera"
            data-camera-scale={cameraView.scale.toFixed(3)}
            transform={transform}
          >
            <circle cx="500" cy="360" r="345" fill="rgba(255,255,255,0.008)" stroke="rgba(121,108,96,0.26)" strokeWidth="1.2" />

            {bridgeBundles.map((bundle) => {
              const activity = bridgeActivity(bundle)
              if (activity < 0.12) return null

              const path = bridgePath(bundle.a, bundle.b)
              const gradientId = `bridge-${bundle.key.replace('::', '-')}`
              const points = membranePoints(bundle.a, bundle.b)
              const visible = Math.min(1, 0.16 + activity * 0.84)

              return (
                <g key={bundle.key} data-bridge-key={bundle.key} data-bridge-activity={activity.toFixed(3)} opacity={visible}>
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={8 + activity * 8}
                    strokeOpacity={0.08 + activity * 0.12}
                    filter="url(#soft-glow)"
                    pointerEvents="none"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={1.4 + activity * 1.8}
                    strokeOpacity={0.34 + activity * 0.56}
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                  <circle cx={points.start.x} cy={points.start.y} r={3.5 + activity * 3} fill={WORLD_STYLE[bundle.a].glow} opacity={0.35 + activity * 0.6} />
                  <circle cx={points.end.x} cy={points.end.y} r={3.5 + activity * 3} fill={WORLD_STYLE[bundle.b].glow} opacity={0.35 + activity * 0.6} />
                </g>
              )
            })}

            {PHYSICS_GROUPS.map((group) => {
              const geometry = GROUP_GEOMETRY[group.id]
              const attention = groupAttention(group.id)
              const style = WORLD_STYLE[group.id]
              const membraneR = geometry.r * (1 + attention * 0.025)

              return (
                <g key={group.id}>
                  <circle
                    cx={geometry.x}
                    cy={geometry.y}
                    r={membraneR + 10}
                    fill="none"
                    stroke={style.glow}
                    strokeWidth={attention > 0.4 ? 8 : 3}
                    strokeOpacity={0.025 + attention * 0.075}
                    filter={attention > 0.45 ? 'url(#soft-glow)' : undefined}
                    pointerEvents="none"
                  />
                  <circle
                    data-world-id={group.id}
                    data-world-attention={attention.toFixed(3)}
                    cx={geometry.x}
                    cy={geometry.y}
                    r={membraneR}
                    fill={`url(#world-${group.id})`}
                    stroke={style.edge}
                    strokeWidth={1.25 + attention * 1.5}
                    strokeOpacity={0.42 + attention * 0.48}
                    onClick={(event) => {
                      event.stopPropagation()
                      enterWorld(group.id)
                    }}
                    className="cursor-pointer"
                  />
                  <text
                    x={geometry.x}
                    y={geometry.y - geometry.r + 22}
                    textAnchor="middle"
                    fill={focusGroup === group.id || activeNode?.group === group.id ? style.glow : '#aaa29a'}
                    fontSize={15 + attention * 2}
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {group.label}
                  </text>
                </g>
              )
            })}

            {links.map((link) => {
              const relation = link.relation
              const source = nodeById.get(endpointId(link.source))
              const target = nodeById.get(endpointId(link.target))
              if (!source || !target) return null

              const active = activeRelations.some((candidate) => candidate.id === relation.id)
              const recent = Math.max(recentTraceByNode.get(relation.source) ?? 0, recentTraceByNode.get(relation.target) ?? 0)
              const sameFocusedWorld = focusGroup && source.group === focusGroup && target.group === focusGroup
              const show = active || recent > 0.18 || sameFocusedWorld
              if (!show) return null

              const opacity = active ? 0.92 : sameFocusedWorld ? 0.28 : recent * 0.32
              const sourceStyle = WORLD_STYLE[source.group]
              const targetStyle = WORLD_STYLE[target.group]

              return (
                <g key={relation.id} data-relation-id={relation.id}>
                  <defs>
                    <linearGradient id={`edge-${relation.id}`} gradientUnits="userSpaceOnUse" x1={source.x} y1={source.y} x2={target.x} y2={target.y}>
                      <stop offset="0%" stopColor={sourceStyle.glow} />
                      <stop offset="100%" stopColor={targetStyle.glow} />
                    </linearGradient>
                  </defs>
                  <line
                    x1={source.x ?? 0}
                    y1={source.y ?? 0}
                    x2={target.x ?? 0}
                    y2={target.y ?? 0}
                    stroke={`url(#edge-${relation.id})`}
                    strokeWidth={active ? 2.5 : 1.1}
                    opacity={opacity}
                    pointerEvents="none"
                  />
                  <line
                    x1={source.x ?? 0}
                    y1={source.y ?? 0}
                    x2={target.x ?? 0}
                    y2={target.y ?? 0}
                    stroke="transparent"
                    strokeWidth="14"
                    onPointerEnter={() => setHoveredRelationId(relation.id)}
                    onPointerLeave={() => setHoveredRelationId(null)}
                  />
                </g>
              )
            })}

            {nodes.map((node) => {
              const active = activeNodeId === node.id
              const trace = recentTraceByNode.get(node.id) ?? 0
              const labelVisible = visibleNodeLabel(node)
              const opacity = nodeOpacity(node)
              const style = WORLD_STYLE[node.group]
              const attentionScale =
                active && attentionPhase === 'dwell'
                  ? 1.13
                  : active && attentionPhase === 'attend'
                    ? 1.09
                    : active
                      ? 1.045
                      : 1

              return (
                <g
                  key={node.id}
                  data-node-id={node.id}
                  transform={`translate(${node.x ?? 0},${node.y ?? 0}) scale(${attentionScale})`}
                  opacity={opacity}
                  onPointerEnter={() => beginAttention(node.id)}
                  onPointerLeave={() => {
                    if (!draggingRef.current) endAttention()
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    selectNode(node)
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    dragStart(node, event.clientX, event.clientY)
                  }}
                  className="cursor-grab active:cursor-grabbing"
                  style={{ transition: 'opacity 280ms ease, transform 340ms ease' }}
                >
                  {trace > 0.02 && (
                    <circle
                      r={node.r + 7}
                      fill="none"
                      stroke={style.glow}
                      strokeWidth={1.8}
                      opacity={trace * 0.5}
                      pointerEvents="none"
                    />
                  )}
                  <circle
                    r={node.r}
                    fill={active ? `rgba(${style.rgb},0.32)` : `rgba(${style.rgb},0.12)`}
                    stroke={active ? style.glow : style.edge}
                    strokeWidth={active ? 2.3 : 1.25}
                    strokeOpacity={active ? 0.96 : 0.66}
                  />
                  {labelVisible && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={active ? '#fff7eb' : '#e7e5e4'}
                      fontSize={node.label.length > 17 ? 10.5 : 12}
                      fontWeight="600"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>

        <aside className="absolute right-4 top-4 w-[300px] rounded-2xl border border-stone-800/90 bg-stone-950/90 p-4 shadow-2xl backdrop-blur-md">
          {hoveredRelation ? (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80">Bridge detail</p>
              <p className="mt-2 text-base text-stone-100">
                {NODE_BY_ID.get(hoveredRelation.source)?.label}{' '}
                <span className="text-amber-500">{hoveredRelation.verb}</span>{' '}
                {NODE_BY_ID.get(hoveredRelation.target)?.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-400">{hoveredRelation.rationale}</p>
            </>
          ) : activeNode ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80">
                  {attentionPhase === 'glance' ? 'Glance' : attentionPhase === 'attend' ? 'Attend' : 'Dwell'}
                </p>
                <span className="text-xs" style={{ color: WORLD_STYLE[activeNode.group].glow }}>
                  {GROUP_BY_ID.get(activeNode.group)?.label}
                </span>
              </div>
              <h3 className="mt-2 text-xl text-stone-100">{activeNode.label}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">{activeNode.inquiry}</p>

              {(attentionPhase === 'attend' || attentionPhase === 'dwell') && (
                <>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{activeNode.essence}</p>
                  <div className="mt-4 border-t border-stone-800 pt-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-600">Nearby relations</p>
                    <div className="mt-2 space-y-2">
                      {activeRelations
                        .sort((a, b) => b.strength - a.strength)
                        .slice(0, attentionPhase === 'dwell' ? 5 : 3)
                        .map((relation) => {
                          const otherId = relation.source === activeNode.id ? relation.target : relation.source
                          return (
                            <div key={relation.id} className="text-sm text-stone-400">
                              <span className="text-stone-200">{NODE_BY_ID.get(otherId)?.label}</span>
                              <span className="mx-2 text-stone-700">·</span>
                              <span>{relation.verb}</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </>
              )}

              {attentionPhase === 'dwell' && (
                <p className="mt-4 text-xs leading-5 text-stone-600">
                  A faint trace will remain briefly after attention moves elsewhere.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Attention</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Hover a cell. Stay with it long enough and its neighborhood, bridges, and meaning become more visible.
              </p>
            </>
          )}
        </aside>

        <div className="absolute bottom-4 left-4 rounded-full border border-stone-800/80 bg-stone-950/75 px-4 py-2 text-xs text-stone-500 backdrop-blur-md">
          {focusNodeId
            ? `${GROUP_BY_ID.get(NODE_BY_ID.get(focusNodeId)?.group ?? 'air')?.label} / ${NODE_BY_ID.get(focusNodeId)?.label}`
            : focusGroup
              ? `${GROUP_BY_ID.get(focusGroup)?.label} · world focus`
              : 'Whole field'}
        </div>
      </div>
    </section>
  )
}
