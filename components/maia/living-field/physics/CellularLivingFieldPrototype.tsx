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
  type PhysicsGroupKey,
  type PhysicsNodeDatum,
  type PhysicsRelation,
} from './physicsFieldData'
import {
  LOD_LABELS,
  PORTAL_BY_NODE,
  nodeLabelStanding,
  resolveSemanticLod,
} from './livingFieldLod'
import {
  R2C_RELATIONS,
  r2cRelatedNodeIds,
  r2cRelatedRelations,
  relationDash,
  relationKindLabel,
  relationResolution,
} from './livingFieldRelationResolution'

type AttentionPhase = 'idle' | 'proximity' | 'glance' | 'attend' | 'dwell'

type SimNode = SimulationNodeDatum &
  PhysicsNodeDatum & {
    r: number
    anchorX: number
    anchorY: number
    homeX: number
    homeY: number
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

type CameraView = {
  cx: number
  cy: number
  scale: number
}

type PanGesture = {
  pointerId: number
  startClientX: number
  startClientY: number
  startCamera: CameraView
}

type PinchGesture = {
  startDistance: number
  startScale: number
  anchorWorldX: number
  anchorWorldY: number
}

const WIDTH = 1000
const HEIGHT = 720
const TRACE_TTL = 10000
const CAMERA_MIN_SCALE = 0.86
const CAMERA_MAX_SCALE = 3.4
const CAMERA_WORLD_BOUNDS = {
  minX: -80,
  maxX: 1080,
  minY: -80,
  maxY: 800,
}

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

    const homeX = group.x + Math.cos(angle) * anchorDistance
    const homeY = group.y + Math.sin(angle) * anchorDistance

    return {
      ...datum,
      r: datum.label.length > 17 ? 30 : 27,
      x: homeX,
      y: homeY,
      anchorX: homeX,
      anchorY: homeY,
      homeX,
      homeY,
    }
  })
}

function makeLinks(): SimLink[] {
  return R2C_RELATIONS.map((relation) => ({
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

  for (const relation of R2C_RELATIONS) {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function clampCameraView(view: CameraView): CameraView {
  const scale = clamp(view.scale, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
  const halfWidth = WIDTH / (2 * scale)
  const halfHeight = HEIGHT / (2 * scale)

  const minCx = CAMERA_WORLD_BOUNDS.minX + halfWidth
  const maxCx = CAMERA_WORLD_BOUNDS.maxX - halfWidth
  const minCy = CAMERA_WORLD_BOUNDS.minY + halfHeight
  const maxCy = CAMERA_WORLD_BOUNDS.maxY - halfHeight

  return {
    cx: minCx <= maxCx ? clamp(view.cx, minCx, maxCx) : WIDTH / 2,
    cy: minCy <= maxCy ? clamp(view.cy, minCy, maxCy) : HEIGHT / 2,
    scale,
  }
}

export function CellularLivingFieldPrototype() {
  const [nodes] = useState<SimNode[]>(() => makeNodes())
  const [links] = useState<SimLink[]>(() => makeLinks())
  const [, setFrame] = useState(0)

  const [focusGroup, setFocusGroup] = useState<PhysicsGroupKey | null>(null)
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [proximityNodeId, setProximityNodeId] = useState<string | null>(null)
  const [hoveredRelationId, setHoveredRelationId] = useState<string | null>(null)
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null)
  const [attentionPhase, setAttentionPhase] = useState<AttentionPhase>('idle')
  const [attentionTraces, setAttentionTraces] = useState<AttentionTrace[]>([])
  const [metabolicTime, setMetabolicTime] = useState(0)
  const [cameraView, setCameraView] = useState({ cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 })

  const svgRef = useRef<SVGSVGElement | null>(null)
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const draggingRef = useRef<string | null>(null)
  const attendTimerRef = useRef<number | null>(null)
  const dwellTimerRef = useRef<number | null>(null)
  const cameraAnimationRef = useRef<number | null>(null)
  const cameraRef = useRef<CameraView>({ cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 })
  const panGestureRef = useRef<PanGesture | null>(null)
  const touchPointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map())
  const pinchGestureRef = useRef<PinchGesture | null>(null)

  const bridgeBundles = useMemo(() => buildBridgeBundles(), [])
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])

  const activeNodeId = hoveredNodeId ?? proximityNodeId ?? focusNodeId
  const activeNode = activeNodeId ? NODE_BY_ID.get(activeNodeId) ?? null : null
  const activeNeighborhood = activeNodeId ? r2cRelatedNodeIds(activeNodeId) : null
  const activeRelations = activeNodeId ? r2cRelatedRelations(activeNodeId) : []
  const inspectedRelationId = hoveredRelationId ?? selectedRelationId
  const hoveredRelation = inspectedRelationId
    ? R2C_RELATIONS.find((relation) => relation.id === inspectedRelationId) ?? null
    : null
  const inspectedRelationMeta = hoveredRelation ? relationResolution(hoveredRelation) : null
  const semanticLod = resolveSemanticLod(
    cameraView.scale,
    !!focusGroup,
    !!focusNodeId,
    !!selectedRelationId,
  )
  const portalCue = activeNodeId ? PORTAL_BY_NODE.get(activeNodeId) ?? null : null
  const maiaLocusVisible =
    !!activeNodeId &&
    semanticLod >= 3 &&
    (attentionPhase === 'attend' || attentionPhase === 'dwell' || focusNodeId === activeNodeId)
  const portalCueVisible =
    !!portalCue &&
    semanticLod >= 4 &&
    (attentionPhase === 'dwell' || focusNodeId === activeNodeId)

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
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    setMetabolicTime(performance.now())
    const clock = window.setInterval(() => setMetabolicTime(performance.now()), 160)

    return () => window.clearInterval(clock)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    let pulse = 0
    const metabolism = window.setInterval(() => {
      if (draggingRef.current || attentionPhase === 'attend' || attentionPhase === 'dwell') return

      pulse += 1
      nodes.forEach((node, index) => {
        const phase = pulse * 0.73 + index * 1.618
        node.anchorX = node.homeX + Math.cos(phase) * 2.4
        node.anchorY = node.homeY + Math.sin(phase * 0.91) * 2.4
      })

      simulationRef.current?.alpha(0.036).restart()
    }, 4200)

    return () => window.clearInterval(metabolism)
  }, [attentionPhase, nodes])

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
    setAttentionPhase(proximityNodeId ? 'proximity' : focusNodeId ? 'dwell' : 'idle')
  }

  const selectNode = (node: SimNode) => {
    clearAttentionTimers()
    setSelectedRelationId(null)
    setFocusNodeId(node.id)
    setFocusGroup(node.group)
    setAttentionPhase('dwell')
    rememberAttention(node.id)
    simulationRef.current?.alpha(0.18).restart()
    animateCameraTo({
      cx: node.x ?? GROUP_GEOMETRY[node.group].x,
      cy: node.y ?? GROUP_GEOMETRY[node.group].y,
      scale: 1.9,
    })
  }

  const releaseNodeFocus = () => {
    setSelectedRelationId(null)
    setFocusNodeId(null)
    setHoveredNodeId(null)
    setProximityNodeId(null)
    setAttentionPhase('idle')

    if (focusGroup) {
      animateCameraTo({
        cx: GROUP_GEOMETRY[focusGroup].x,
        cy: GROUP_GEOMETRY[focusGroup].y,
        scale: 1.48,
      })
    } else {
      animateCameraTo({ cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 })
    }
  }

  const enterWorld = (group: PhysicsGroupKey) => {
    setSelectedRelationId(null)
    setFocusGroup(group)
    setFocusNodeId(null)
    setHoveredNodeId(null)
    setProximityNodeId(null)
    setAttentionPhase('idle')
    animateCameraTo({
      cx: GROUP_GEOMETRY[group].x,
      cy: GROUP_GEOMETRY[group].y,
      scale: 1.48,
    })
  }

  const selectRelation = (relation: PhysicsRelation) => {
    const source = nodeById.get(relation.source)
    const target = nodeById.get(relation.target)
    if (!source || !target) return

    const wasSelected = selectedRelationId === relation.id
    setSelectedRelationId(wasSelected ? null : relation.id)

    if (wasSelected) return

    const sourceX = source.x ?? GROUP_GEOMETRY[source.group].x
    const sourceY = source.y ?? GROUP_GEOMETRY[source.group].y
    const targetX = target.x ?? GROUP_GEOMETRY[target.group].x
    const targetY = target.y ?? GROUP_GEOMETRY[target.group].y
    const spanX = Math.abs(targetX - sourceX)
    const spanY = Math.abs(targetY - sourceY)
    const relationMeta = relationResolution(relation)
    const maxScale = relationMeta.kind === 'tension' ? 1.82 : 2.22
    const fitScale = Math.min(
      WIDTH / (spanX + 260),
      HEIGHT / (spanY + 220),
      maxScale,
    )

    animateCameraTo({
      cx: (sourceX + targetX) / 2,
      cy: (sourceY + targetY) / 2,
      scale: clamp(fitScale, 1.28, maxScale),
    }, 680)
  }

  const widen = () => {
    if (selectedRelationId) {
      setSelectedRelationId(null)

      if (focusNodeId) {
        const node = nodeById.get(focusNodeId)
        if (node) {
          animateCameraTo({
            cx: node.x ?? GROUP_GEOMETRY[node.group].x,
            cy: node.y ?? GROUP_GEOMETRY[node.group].y,
            scale: 1.9,
          }, 520)
          return
        }
      }

      if (focusGroup) {
        animateCameraTo({
          cx: GROUP_GEOMETRY[focusGroup].x,
          cy: GROUP_GEOMETRY[focusGroup].y,
          scale: 1.48,
        }, 520)
        return
      }
    }

    if (focusNodeId) {
      releaseNodeFocus()
      return
    }

    setFocusGroup(null)
    setAttentionPhase('idle')
    animateCameraTo({ cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 })
  }

  const clientToViewBox = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return null

    return {
      x: ((clientX - rect.left) / rect.width) * WIDTH,
      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    }
  }

  const applyCameraView = (view: CameraView) => {
    if (cameraAnimationRef.current !== null) {
      cancelAnimationFrame(cameraAnimationRef.current)
      cameraAnimationRef.current = null
    }

    const next = clampCameraView(view)
    cameraRef.current = next
    setCameraView(next)
    return next
  }

  const animateCameraTo = (targetView: CameraView, requestedDuration = 820) => {
    if (cameraAnimationRef.current !== null) cancelAnimationFrame(cameraAnimationRef.current)

    const target = clampCameraView(targetView)
    const start = cameraRef.current
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const duration = reducedMotion ? 0 : requestedDuration

    if (duration === 0) {
      cameraRef.current = target
      setCameraView(target)
      cameraAnimationRef.current = null
      return
    }

    const startTime = performance.now()

    const tick = (now: number) => {
      const raw = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - raw, 3)
      const next = clampCameraView({
        cx: start.cx + (target.cx - start.cx) * eased,
        cy: start.cy + (target.cy - start.cy) * eased,
        scale: start.scale + (target.scale - start.scale) * eased,
      })

      cameraRef.current = next
      setCameraView(next)

      if (raw < 1) cameraAnimationRef.current = requestAnimationFrame(tick)
      else cameraAnimationRef.current = null
    }

    cameraAnimationRef.current = requestAnimationFrame(tick)
  }

  const pointFromPointer = (clientX: number, clientY: number) => {
    const screen = clientToViewBox(clientX, clientY)
    if (!screen) return null

    const camera = cameraRef.current

    return {
      x: (screen.x - WIDTH / 2) / camera.scale + camera.cx,
      y: (screen.y - HEIGHT / 2) / camera.scale + camera.cy,
    }
  }

  const zoomAtClientPoint = (clientX: number, clientY: number, scaleFactor: number) => {
    const screen = clientToViewBox(clientX, clientY)
    if (!screen) return null

    const current = cameraRef.current
    const anchorWorldX = (screen.x - WIDTH / 2) / current.scale + current.cx
    const anchorWorldY = (screen.y - HEIGHT / 2) / current.scale + current.cy
    const nextScale = clamp(current.scale * scaleFactor, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)

    return applyCameraView({
      scale: nextScale,
      cx: anchorWorldX - (screen.x - WIDTH / 2) / nextScale,
      cy: anchorWorldY - (screen.y - HEIGHT / 2) / nextScale,
    })
  }

  const zoomFromCenter = (scaleFactor: number) => {
    const current = cameraRef.current
    animateCameraTo({
      ...current,
      scale: clamp(current.scale * scaleFactor, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE),
    }, 320)
  }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const sensitivity = event.ctrlKey ? 0.006 : 0.0018
      const factor = clamp(Math.exp(-event.deltaY * sensitivity), 0.78, 1.28)
      zoomAtClientPoint(event.clientX, event.clientY, factor)
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [])

  const beginCameraPan = (pointerId: number, clientX: number, clientY: number) => {
    if (pinchGestureRef.current) return
    panGestureRef.current = {
      pointerId,
      startClientX: clientX,
      startClientY: clientY,
      startCamera: cameraRef.current,
    }
    svgRef.current?.setPointerCapture?.(pointerId)
  }

  const updateCameraPan = (clientX: number, clientY: number) => {
    const pan = panGestureRef.current
    const rect = svgRef.current?.getBoundingClientRect()
    if (!pan || !rect) return false

    const dx = ((clientX - pan.startClientX) / rect.width) * WIDTH
    const dy = ((clientY - pan.startClientY) / rect.height) * HEIGHT

    applyCameraView({
      cx: pan.startCamera.cx - dx / pan.startCamera.scale,
      cy: pan.startCamera.cy - dy / pan.startCamera.scale,
      scale: pan.startCamera.scale,
    })

    return true
  }

  const endCameraPan = (pointerId?: number) => {
    if (pointerId !== undefined && panGestureRef.current?.pointerId !== pointerId) return
    panGestureRef.current = null
  }

  const registerTouchPointer = (pointerId: number, clientX: number, clientY: number) => {
    touchPointersRef.current.set(pointerId, { clientX, clientY })

    if (touchPointersRef.current.size !== 2) return

    const [first, second] = [...touchPointersRef.current.values()]
    const dx = second.clientX - first.clientX
    const dy = second.clientY - first.clientY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const centerX = (first.clientX + second.clientX) / 2
    const centerY = (first.clientY + second.clientY) / 2
    const anchor = pointFromPointer(centerX, centerY)

    if (!anchor || distance <= 0) return

    pinchGestureRef.current = {
      startDistance: distance,
      startScale: cameraRef.current.scale,
      anchorWorldX: anchor.x,
      anchorWorldY: anchor.y,
    }
    panGestureRef.current = null
  }

  const updateTouchPointer = (pointerId: number, clientX: number, clientY: number) => {
    if (!touchPointersRef.current.has(pointerId)) return false

    touchPointersRef.current.set(pointerId, { clientX, clientY })
    const pinch = pinchGestureRef.current

    if (!pinch || touchPointersRef.current.size < 2) return false

    const [first, second] = [...touchPointersRef.current.values()]
    const dx = second.clientX - first.clientX
    const dy = second.clientY - first.clientY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const centerX = (first.clientX + second.clientX) / 2
    const centerY = (first.clientY + second.clientY) / 2
    const screen = clientToViewBox(centerX, centerY)

    if (!screen || distance <= 0) return false

    const nextScale = clamp(
      pinch.startScale * (distance / pinch.startDistance),
      CAMERA_MIN_SCALE,
      CAMERA_MAX_SCALE,
    )

    applyCameraView({
      scale: nextScale,
      cx: pinch.anchorWorldX - (screen.x - WIDTH / 2) / nextScale,
      cy: pinch.anchorWorldY - (screen.y - HEIGHT / 2) / nextScale,
    })

    return true
  }

  const releaseTouchPointer = (pointerId: number) => {
    touchPointersRef.current.delete(pointerId)
    if (touchPointersRef.current.size < 2) pinchGestureRef.current = null
  }

  const goWhole = () => {
    clearAttentionTimers()
    setFocusNodeId(null)
    setFocusGroup(null)
    setHoveredNodeId(null)
    setProximityNodeId(null)
    setHoveredRelationId(null)
    setSelectedRelationId(null)
    setAttentionPhase('idle')
    animateCameraTo({ cx: WIDTH / 2, cy: HEIGHT / 2, scale: 1 })
  }

  const updatePointerAttention = (clientX: number, clientY: number) => {
    if (draggingRef.current) return
    const point = pointFromPointer(clientX, clientY)
    if (!point) return

    let nearest: SimNode | null = null
    let nearestDistance = Number.POSITIVE_INFINITY

    for (const node of nodes) {
      const dx = (node.x ?? 0) - point.x
      const dy = (node.y ?? 0) - point.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < nearestDistance) {
        nearest = node
        nearestDistance = distance
      }
    }

    if (nearest && nearestDistance <= nearest.r + 4) {
      setProximityNodeId(null)
      if (hoveredNodeId !== nearest.id) beginAttention(nearest.id)
      return
    }

    if (hoveredNodeId) {
      clearAttentionTimers()
      setHoveredNodeId(null)
    }

    const threshold = 74 / cameraRef.current.scale
    const next = nearest && nearestDistance <= threshold ? nearest.id : null
    setProximityNodeId(next)
    setAttentionPhase(focusNodeId ? 'dwell' : next ? 'proximity' : 'idle')
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

  const nodeLabelOpacity = (node: SimNode) => {
    if (focusNodeId && activeNeighborhood && !activeNeighborhood.has(node.id)) return 0
    return nodeLabelStanding(
      node,
      semanticLod,
      activeNodeId === node.id,
      focusGroup === node.group,
    )
  }

  const visibleNodeLabel = (node: SimNode) => nodeLabelOpacity(node) > 0.02

  const nodeOpacity = (node: SimNode) => {
    if (!focusGroup && !activeNeighborhood) return 0.72
    if (activeNeighborhood) {
      if (attentionPhase === 'proximity') return activeNeighborhood.has(node.id) ? 0.92 : 0.38
      if (selectedRelationId) return activeNeighborhood.has(node.id) ? 1 : 0.2
      if (focusNodeId) return activeNeighborhood.has(node.id) ? 1 : 0.17
      return activeNeighborhood.has(node.id) ? 1 : 0.13
    }
    if (focusGroup) return node.group === focusGroup ? 1 : 0.16
    return 1
  }

  const bridgeActivity = (bundle: BridgeBundle) => {
    let score = 0
    const activeIds = new Set(activeRelations.map((relation) => relation.id))

    const attentionStrength =
      attentionPhase === 'proximity' ? 0.34 : attentionPhase === 'glance' ? 0.55 : 1

    for (const relation of bundle.relations) {
      if (activeIds.has(relation.id)) score = Math.max(score, attentionStrength)
      const sourceTrace = recentTraceByNode.get(relation.source) ?? 0
      const targetTrace = recentTraceByNode.get(relation.target) ?? 0
      score = Math.max(score, Math.max(sourceTrace, targetTrace) * 0.55)
    }

    if (focusGroup && (bundle.a === focusGroup || bundle.b === focusGroup)) score = Math.max(score, 0.28)
    if (bundle.relations.length >= 2) score = Math.max(score, 0.16)

    return score
  }

  const groupAttention = (groupId: PhysicsGroupKey) => {
    if (activeNode?.group === groupId) return attentionPhase === 'proximity' ? 0.34 : 1
    if (focusGroup === groupId) return 0.75

    const bridgeScore = Math.max(
      0,
      ...bridgeBundles
        .filter((bundle) => bundle.a === groupId || bundle.b === groupId)
        .map((bundle) => bridgeActivity(bundle) * 0.6),
    )

    return bridgeScore
  }

  const showContextEchoes = semanticLod >= 3 && (!!focusNodeId || !!selectedRelationId)
  const contextEchoes = showContextEchoes
    ? PHYSICS_GROUPS.flatMap((group) => {
        const geometry = GROUP_GEOMETRY[group.id]
        const projectedX = WIDTH / 2 + (geometry.x - cameraView.cx) * cameraView.scale
        const projectedY = HEIGHT / 2 + (geometry.y - cameraView.cy) * cameraView.scale
        const centerVisible =
          projectedX >= 42 &&
          projectedX <= WIDTH - 42 &&
          projectedY >= 42 &&
          projectedY <= HEIGHT - 42

        if (centerVisible) return []

        const x = clamp(projectedX, 46, WIDTH - 46)
        const y = clamp(projectedY, 46, HEIGHT - 46)

        return [{
          ...group,
          x,
          y,
          projectedX,
          projectedY,
        }]
      })
    : []

  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${cameraView.scale}) translate(${-cameraView.cx} ${-cameraView.cy})`

  return (
    <section
      data-semantic-lod={semanticLod}
      data-semantic-lod-label={LOD_LABELS[semanticLod]}
      data-focus-mode={selectedRelationId ? 'relation' : focusNodeId ? 'node' : focusGroup ? 'world' : 'whole'}
      className="overflow-hidden rounded-[30px] border border-stone-800 bg-[#090a0a]"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800/80 px-5 py-4 sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-700/80">Living Field · R2D</p>
            <span className="rounded-full border border-stone-800 bg-stone-950/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-stone-600">
              LOD{semanticLod} · {LOD_LABELS[semanticLod]}
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-light text-stone-100">Go deep without losing the whole.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            Focus intensifies the foreground. Context remains at the edges. Relations frame both poles and preserve the space between them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={widen}
            disabled={!focusGroup && !focusNodeId}
            className="rounded-full border border-stone-800 px-4 py-2 text-sm text-stone-400 transition hover:border-stone-700 hover:text-stone-100 disabled:opacity-25"
          >
            ← Widen
          </button>
          <div className="flex items-center rounded-full border border-stone-800 bg-stone-950/70 p-1">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => zoomFromCenter(1 / 1.22)}
              className="h-8 w-8 rounded-full text-lg text-stone-500 transition hover:bg-stone-900 hover:text-stone-100"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => zoomFromCenter(1.22)}
              className="h-8 w-8 rounded-full text-lg text-stone-500 transition hover:bg-stone-900 hover:text-stone-100"
            >
              +
            </button>
            <button
              type="button"
              onClick={goWhole}
              className="rounded-full px-3 py-1.5 text-xs text-stone-500 transition hover:bg-stone-900 hover:text-stone-100"
            >
              Whole
            </button>
          </div>
        </div>
      </header>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full touch-none outline-none"
          style={{ pointerEvents: 'auto' }}
          tabIndex={0}
          role="img"
          aria-label="Living Field. Zoom with wheel or trackpad, drag open space to pan, click a world or cell to enter."
          onKeyDown={(event) => {
            if (event.key === '+' || event.key === '=') {
              event.preventDefault()
              zoomFromCenter(1.22)
            } else if (event.key === '-') {
              event.preventDefault()
              zoomFromCenter(1 / 1.22)
            } else if (event.key === '0' || event.key === 'Home') {
              event.preventDefault()
              goWhole()
            } else if (event.key === 'Escape' && (focusNodeId || focusGroup)) {
              event.preventDefault()
              widen()
            }
          }}
          onPointerDownCapture={(event) => {
            if (event.pointerType === 'touch') {
              registerTouchPointer(event.pointerId, event.clientX, event.clientY)
            }
          }}
          onPointerMove={(event) => {
            if (event.pointerType === 'touch' && updateTouchPointer(event.pointerId, event.clientX, event.clientY)) {
              return
            }
            if (updateCameraPan(event.clientX, event.clientY)) return

            dragMove(event.clientX, event.clientY)
            const target = event.target as Element
            if (!target.closest('[data-relation-id]')) {
              updatePointerAttention(event.clientX, event.clientY)
            }
          }}
          onPointerLeave={() => {
            if (panGestureRef.current || pinchGestureRef.current) return
            if (!draggingRef.current) {
              clearAttentionTimers()
              setHoveredNodeId(null)
              setProximityNodeId(null)
              setAttentionPhase(focusNodeId ? 'dwell' : 'idle')
            }
          }}
          onPointerUp={(event) => {
            releaseTouchPointer(event.pointerId)
            endCameraPan(event.pointerId)
            dragEnd()
          }}
          onPointerCancel={(event) => {
            releaseTouchPointer(event.pointerId)
            endCameraPan(event.pointerId)
            dragEnd()
          }}
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

          <rect
            data-camera-pan-surface="true"
            width={WIDTH}
            height={HEIGHT}
            fill="#090a0a"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              if (event.button !== 0) return
              beginCameraPan(event.pointerId, event.clientX, event.clientY)
            }}
          />

          <g
            data-field-stage="camera"
            data-camera-scale={cameraView.scale.toFixed(3)}
            data-camera-cx={cameraView.cx.toFixed(3)}
            data-camera-cy={cameraView.cy.toFixed(3)}
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
              const flowOffset = -((metabolicTime / 95) % 18)

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
                    strokeDasharray={activity < 0.4 ? '2 11' : undefined}
                    strokeDashoffset={activity < 0.4 ? flowOffset : 0}
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
              const groupIndex = PHYSICS_GROUPS.findIndex((candidate) => candidate.id === group.id)
              const breath = Math.sin(metabolicTime / (2150 + groupIndex * 260) + groupIndex * 1.31) * 0.007
              const membraneR = geometry.r * (1 + breath + attention * 0.025)

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
                    data-world-breath={breath.toFixed(4)}
                    cx={geometry.x}
                    cy={geometry.y}
                    r={membraneR}
                    fill={`url(#world-${group.id})`}
                    stroke={style.edge}
                    strokeWidth={1.25 + attention * 1.5}
                    strokeOpacity={0.42 + attention * 0.48}
                    pointerEvents="all"
                    onClick={(event) => {
                      event.stopPropagation()
                      enterWorld(group.id)
                    }}
                    className="cursor-pointer"
                  />
                  <text
                    data-world-label={group.id}
                    x={geometry.x}
                    y={geometry.y - geometry.r + 22}
                    textAnchor="middle"
                    fill={focusGroup === group.id || activeNode?.group === group.id ? style.glow : '#aaa29a'}
                    fontSize={15 + attention * 2}
                    fontWeight="600"
                    pointerEvents="all"
                    className="cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation()
                      enterWorld(group.id)
                    }}
                  >
                    {group.label}
                  </text>
                  {semanticLod >= 1 && (focusGroup === group.id || activeNode?.group === group.id) && (
                    <text
                      x={geometry.x}
                      y={geometry.y - geometry.r + 40}
                      textAnchor="middle"
                      fill="#a8a29e"
                      fillOpacity={semanticLod >= 2 ? 0.72 : 0.44}
                      fontSize="8.5"
                      letterSpacing="0.03em"
                      pointerEvents="none"
                    >
                      {group.essence}
                    </text>
                  )}
                </g>
              )
            })}

            {links.map((link) => {
              const relation = link.relation
              const source = nodeById.get(endpointId(link.source))
              const target = nodeById.get(endpointId(link.target))
              if (!source || !target) return null

              const relationMeta = relationResolution(relation)
              const inspected = inspectedRelationId === relation.id
              const active = activeRelations.some((candidate) => candidate.id === relation.id) || inspected
              const recent = Math.max(recentTraceByNode.get(relation.source) ?? 0, recentTraceByNode.get(relation.target) ?? 0)
              const sameFocusedWorld = focusGroup && source.group === focusGroup && target.group === focusGroup
              const show =
                (semanticLod >= 3 && active) ||
                (semanticLod >= 2 && !!sameFocusedWorld) ||
                (semanticLod >= 3 && recent > 0.18)
              if (!show) return null

              const opacity = inspected ? 1 : active ? 0.92 : sameFocusedWorld ? 0.28 : recent * 0.32
              const sourceStyle = WORLD_STYLE[source.group]
              const targetStyle = WORLD_STYLE[target.group]
              const sourceX = source.x ?? 0
              const sourceY = source.y ?? 0
              const targetX = target.x ?? 0
              const targetY = target.y ?? 0
              const midX = (sourceX + targetX) / 2
              const midY = (sourceY + targetY) / 2
              const kindDash = relationDash(relationMeta.kind)
              const dx = targetX - sourceX
              const dy = targetY - sourceY
              const lineLength = Math.sqrt(dx * dx + dy * dy) || 1
              const ux = dx / lineLength
              const uy = dy / lineLength
              const px = -uy
              const py = ux
              const flowX = sourceX + dx * 0.64
              const flowY = sourceY + dy * 0.64
              const arrowTipX = flowX + ux * 7
              const arrowTipY = flowY + uy * 7
              const arrowLeftX = flowX - ux * 4 + px * 4
              const arrowLeftY = flowY - uy * 4 + py * 4
              const arrowRightX = flowX - ux * 4 - px * 4
              const arrowRightY = flowY - uy * 4 - py * 4
              const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)

              return (
                <g
                  key={relation.id}
                  data-relation-id={relation.id}
                  data-relation-kind={relationMeta.kind}
                  data-relation-inspected={inspected ? 'true' : 'false'}
                >
                  <defs>
                    <linearGradient id={`edge-${relation.id}`} gradientUnits="userSpaceOnUse" x1={source.x} y1={source.y} x2={target.x} y2={target.y}>
                      <stop offset="0%" stopColor={sourceStyle.glow} />
                      <stop offset="100%" stopColor={targetStyle.glow} />
                    </linearGradient>
                  </defs>
                  {relationMeta.kind === 'tension' && inspected && (
                    <g data-held-tension={relation.id} pointerEvents="none">
                      <ellipse
                        cx={midX}
                        cy={midY}
                        rx={lineLength / 2 + 32}
                        ry="38"
                        transform={`rotate(${angleDeg} ${midX} ${midY})`}
                        fill="rgba(214,173,105,0.025)"
                        stroke="#d6ad69"
                        strokeOpacity="0.26"
                        strokeWidth="1.2"
                        strokeDasharray="3 7"
                      />
                      <circle
                        data-tension-pole={relation.source}
                        cx={sourceX}
                        cy={sourceY}
                        r={source.r + 13}
                        fill="none"
                        stroke={sourceStyle.glow}
                        strokeOpacity="0.5"
                        strokeWidth="2.2"
                      />
                      <circle
                        data-tension-pole={relation.target}
                        cx={targetX}
                        cy={targetY}
                        r={target.r + 13}
                        fill="none"
                        stroke={targetStyle.glow}
                        strokeOpacity="0.5"
                        strokeWidth="2.2"
                      />
                      <circle
                        data-tension-midpoint-empty="true"
                        cx={midX}
                        cy={midY}
                        r="16"
                        fill="rgba(9,10,10,0.32)"
                        stroke="none"
                      />
                    </g>
                  )}
                  {relationMeta.kind === 'resonance' && active && (
                    <line
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      stroke={`url(#edge-${relation.id})`}
                      strokeWidth={8}
                      opacity={0.12}
                      filter="url(#soft-glow)"
                      pointerEvents="none"
                    />
                  )}
                  {relationMeta.kind === 'tension' && active && (
                    <>
                      <line
                        x1={sourceX + px * 2.5}
                        y1={sourceY + py * 2.5}
                        x2={targetX + px * 2.5}
                        y2={targetY + py * 2.5}
                        stroke={`url(#edge-${relation.id})`}
                        strokeWidth={1}
                        opacity={0.44}
                        pointerEvents="none"
                      />
                      <line
                        x1={sourceX - px * 2.5}
                        y1={sourceY - py * 2.5}
                        x2={targetX - px * 2.5}
                        y2={targetY - py * 2.5}
                        stroke={`url(#edge-${relation.id})`}
                        strokeWidth={1}
                        opacity={0.44}
                        pointerEvents="none"
                      />
                    </>
                  )}
                  <line
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetX}
                    y2={targetY}
                    stroke={`url(#edge-${relation.id})`}
                    strokeWidth={inspected ? 3.2 : relationMeta.kind === 'tension' ? 2.4 : active ? 2.5 : 1.1}
                    strokeDasharray={kindDash}
                    opacity={opacity}
                    pointerEvents="none"
                  />
                  {relationMeta.kind === 'transformation' && semanticLod >= 4 && active && (
                    <polygon
                      points={`${arrowTipX},${arrowTipY} ${arrowLeftX},${arrowLeftY} ${arrowRightX},${arrowRightY}`}
                      fill={targetStyle.glow}
                      opacity={0.78}
                      pointerEvents="none"
                    />
                  )}
                  <line
                    x1={source.x ?? 0}
                    y1={source.y ?? 0}
                    x2={target.x ?? 0}
                    y2={target.y ?? 0}
                    stroke="transparent"
                    strokeWidth="14"
                    pointerEvents="stroke"
                    className="cursor-pointer"
                    onPointerOver={() => setHoveredRelationId(relation.id)}
                    onPointerOut={() => setHoveredRelationId(null)}
                    onClick={(event) => {
                      event.stopPropagation()
                      selectRelation(relation)
                    }}
                  />
                  {semanticLod >= 4 && active && (
                    <g pointerEvents="none">
                      <rect
                        x={midX - 42}
                        y={midY - 10}
                        width="84"
                        height="20"
                        rx="10"
                        fill="rgba(9,10,10,0.88)"
                        stroke="rgba(168,162,158,0.24)"
                      />
                      <text
                        x={midX}
                        y={midY + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#d6d3d1"
                        fontSize="9.2"
                        fontWeight="600"
                      >
                        {relation.verb}
                      </text>
                    </g>
                  )}
                  {semanticLod >= 4 && inspected && relationMeta.sharedMeaning && (
                    <g
                      data-shared-meaning={relation.id}
                      transform={`translate(${midX}, ${midY + 34})`}
                      pointerEvents="none"
                    >
                      <circle
                        r="26"
                        fill="rgba(214,173,105,0.08)"
                        stroke="#d6ad69"
                        strokeOpacity="0.5"
                      />
                      <text
                        x="0"
                        y="-3"
                        textAnchor="middle"
                        fill="#e7e5e4"
                        fontSize="7.2"
                        fontWeight="600"
                      >
                        {relationMeta.sharedMeaning.label}
                      </text>
                      <text
                        x="0"
                        y="8"
                        textAnchor="middle"
                        fill="#78716c"
                        fontSize="5.8"
                      >
                        candidate meaning
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {nodes.map((node) => {
              const active = activeNodeId === node.id
              const trace = recentTraceByNode.get(node.id) ?? 0
              const labelVisible = visibleNodeLabel(node)
              const opacity = nodeOpacity(node)
              const style = WORLD_STYLE[node.group]
              const proximity = proximityNodeId === node.id && hoveredNodeId !== node.id
              const attentionScale =
                active && attentionPhase === 'dwell'
                  ? 1.16
                  : active && attentionPhase === 'attend'
                    ? 1.12
                    : hoveredNodeId === node.id
                      ? 1.085
                      : proximity
                        ? 1.055
                        : 1

              return (
                <g
                  key={node.id}
                  data-node-id={node.id}
                  data-attention-state={
                    hoveredNodeId === node.id
                      ? attentionPhase
                      : proximity
                        ? 'proximity'
                        : 'idle'
                  }
                  transform={`translate(${node.x ?? 0},${node.y ?? 0}) scale(${attentionScale})`}
                  opacity={opacity}
                  onClick={(event) => {
                    event.stopPropagation()
                    selectNode(node)
                  }}
                  onPointerDown={(event) => {
                    if (event.pointerType === 'touch') return
                    event.preventDefault()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    dragStart(node, event.clientX, event.clientY)
                  }}
                  className="cursor-pointer active:cursor-grabbing"
                  style={{
                    pointerEvents: activeNeighborhood && !activeNeighborhood.has(node.id) ? 'none' : 'all',
                    transition: 'opacity 220ms ease, transform 260ms ease',
                  }}
                >
                  <circle
                    r={node.r + 25}
                    fill="transparent"
                    stroke="transparent"
                    pointerEvents="all"
                    onPointerOver={() => {
                      if (!hoveredNodeId) {
                        setProximityNodeId(node.id)
                        if (!focusNodeId) setAttentionPhase('proximity')
                      }
                    }}
                    onPointerOut={(event) => {
                      if (event.relatedTarget && event.currentTarget.parentElement?.contains(event.relatedTarget as Node)) return
                      if (proximityNodeId === node.id && hoveredNodeId !== node.id) {
                        setProximityNodeId(null)
                        if (!focusNodeId) setAttentionPhase('idle')
                      }
                    }}
                  />
                  {(proximity || hoveredNodeId === node.id) && (
                    <circle
                      r={node.r + (hoveredNodeId === node.id ? 13 : 10)}
                      fill="none"
                      stroke={style.glow}
                      strokeWidth={hoveredNodeId === node.id ? 3 : 2}
                      opacity={hoveredNodeId === node.id ? 0.62 : 0.36}
                      filter="url(#soft-glow)"
                      pointerEvents="none"
                    />
                  )}
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
                    fill={
                      hoveredNodeId === node.id
                        ? `rgba(${style.rgb},0.48)`
                        : proximity
                          ? `rgba(${style.rgb},0.30)`
                          : active
                            ? `rgba(${style.rgb},0.32)`
                            : `rgba(${style.rgb},0.12)`
                    }
                    stroke={active ? style.glow : style.edge}
                    strokeWidth={hoveredNodeId === node.id ? 3 : proximity ? 2.2 : active ? 2.3 : 1.25}
                    strokeOpacity={hoveredNodeId === node.id ? 1 : proximity ? 0.92 : active ? 0.96 : 0.66}
                    onPointerOver={() => {
                      setProximityNodeId(node.id)
                      beginAttention(node.id)
                    }}
                    onPointerOut={(event) => {
                      if (event.relatedTarget && event.currentTarget.parentElement?.contains(event.relatedTarget as Node)) return
                      endAttention()
                    }}
                  />
                  {labelVisible && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={active ? '#fff7eb' : '#e7e5e4'}
                      fillOpacity={nodeLabelOpacity(node)}
                      fontSize={node.label.length > 17 ? 10.5 : 12}
                      fontWeight="600"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  )}
                  {active && maiaLocusVisible && (
                    <g
                      data-maia-locus={node.id}
                      transform={`translate(${-node.r - 13}, ${-node.r - 15})`}
                      pointerEvents="none"
                    >
                      <circle r="8" fill="rgba(231,229,228,0.08)" stroke={style.glow} strokeOpacity="0.72" />
                      <text
                        x="0"
                        y="0.5"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={style.glow}
                        fontSize="6.8"
                        fontWeight="700"
                      >
                        M
                      </text>
                    </g>
                  )}
                  {active && portalCueVisible && portalCue?.nodeId === node.id && (
                    <g
                      data-portal-cue={portalCue.roomId}
                      data-portal-standing={portalCue.standing}
                      transform={`translate(${node.r + 24}, ${-node.r - 8})`}
                      pointerEvents="none"
                    >
                      <path
                        d="M -8 8 A 10 10 0 0 1 12 -2"
                        fill="none"
                        stroke={style.glow}
                        strokeWidth="1.8"
                        strokeOpacity="0.72"
                      />
                      <circle cx="12" cy="-2" r="2.8" fill={style.glow} opacity="0.78" />
                      <text x="18" y="1" fill="#d6d3d1" fontSize="7.5" fontWeight="600">
                        {portalCue.roomLabel}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {contextEchoes.map((echo) => {
            const style = WORLD_STYLE[echo.id]
            const isCurrent = focusGroup === echo.id

            return (
              <g
                key={`context-echo-${echo.id}`}
                data-context-echo={echo.id}
                data-context-current={isCurrent ? 'true' : 'false'}
                transform={`translate(${echo.x}, ${echo.y})`}
                opacity={isCurrent ? 0.82 : 0.46}
                pointerEvents="none"
              >
                <circle
                  r={isCurrent ? 5.2 : 4}
                  fill={`rgba(${style.rgb},0.22)`}
                  stroke={style.glow}
                  strokeOpacity={isCurrent ? 0.8 : 0.48}
                  strokeWidth={isCurrent ? 1.6 : 1}
                />
                <text
                  x="0"
                  y="-10"
                  textAnchor="middle"
                  fill={isCurrent ? style.glow : '#78716c'}
                  fontSize={isCurrent ? 9 : 7.5}
                  fontWeight={isCurrent ? 600 : 500}
                >
                  {echo.label}
                </text>
              </g>
            )
          })}
        </svg>

        <aside
          data-depth-lens="true"
          className="pointer-events-none absolute right-4 top-4 w-[300px] rounded-2xl border border-stone-800/90 bg-stone-950/90 p-4 shadow-2xl backdrop-blur-md"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-700">
              LOD{semanticLod}
            </p>
            <span className="text-[10px] text-stone-600">{LOD_LABELS[semanticLod]}</span>
          </div>

          {hoveredRelation && inspectedRelationMeta ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80">Relation</p>
                <span className="text-[10px] uppercase tracking-[0.14em] text-stone-600">
                  {relationKindLabel(inspectedRelationMeta.kind)}
                </span>
              </div>
              <p className="mt-2 text-base text-stone-100">
                {NODE_BY_ID.get(hoveredRelation.source)?.label}{' '}
                <span className="text-amber-500">{hoveredRelation.verb}</span>{' '}
                {NODE_BY_ID.get(hoveredRelation.target)?.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-400">{hoveredRelation.rationale}</p>

              {inspectedRelationMeta.kind === 'tension' && (
                <div className="mt-4 rounded-xl border border-amber-900/30 bg-amber-950/10 px-3 py-2 text-xs leading-5 text-stone-500">
                  This relation is being held as tension. Connection does not imply resolution.
                </div>
              )}

              {semanticLod >= 4 && inspectedRelationMeta.sharedMeaning && (
                <div data-shared-meaning-lens={hoveredRelation.id} className="mt-4 border-t border-stone-800 pt-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Candidate shared meaning</p>
                  <p className="mt-2 text-sm text-stone-200">{inspectedRelationMeta.sharedMeaning.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-600">
                    {inspectedRelationMeta.sharedMeaning.rationale}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-700">Candidate only · not persisted · not member-recognized.</p>
                </div>
              )}

              {semanticLod >= 5 && (
                <div data-relation-trust={hoveredRelation.id} className="mt-4 border-t border-stone-800 pt-3 text-xs leading-5 text-stone-600">
                  <p>Standing · {hoveredRelation.standing}</p>
                  <p>Context · {inspectedRelationMeta.context}</p>
                  <p>Temporal standing · {inspectedRelationMeta.temporalStanding}</p>
                  <p>Revisability · {inspectedRelationMeta.revisability}</p>
                  <p className="mt-2">Provenance · {inspectedRelationMeta.provenance}</p>
                  {inspectedRelationMeta.counterevidence && (
                    <p className="mt-2 text-stone-500">Qualification · {inspectedRelationMeta.counterevidence}</p>
                  )}
                </div>
              )}
            </>
          ) : activeNode ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80">
                  {attentionPhase === 'proximity'
                    ? 'Nearby'
                    : attentionPhase === 'glance'
                      ? 'Glance'
                      : attentionPhase === 'attend'
                        ? 'Attend'
                        : 'Dwell'}
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
                        .slice(0, semanticLod >= 4 ? 5 : 3)
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

              {maiaLocusVisible && (
                <div data-maia-context-slot={activeNode.id} className="mt-4 border-t border-stone-800 pt-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">MAIA inquiry locus</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">
                    Insight · Connections · Counterview · History · Teach me · Why here?
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-stone-700">
                    Context slot only · live interpretation remains unopened.
                  </p>
                </div>
              )}

              {portalCueVisible && portalCue && (
                <div
                  data-portal-rationale={portalCue.roomId}
                  className="mt-4 border-t border-stone-800 pt-3"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-amber-700/80">
                    Threshold forming · {portalCue.roomLabel}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">{portalCue.rationale}</p>
                  <p className="mt-1 text-[11px] text-stone-700">
                    Prototype relevance · crossing remains unopened.
                  </p>
                </div>
              )}

              {semanticLod >= 5 && (
                <div className="mt-4 border-t border-stone-800 pt-3 text-[11px] leading-5 text-stone-700">
                  Evidence / provenance layer · controlled prototype corpus
                </div>
              )}

              {attentionPhase === 'dwell' && (
                <p className="mt-4 text-xs leading-5 text-stone-600">
                  A faint trace will remain briefly after attention moves elsewhere.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-600">{LOD_LABELS[semanticLod]}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {semanticLod <= 1
                  ? 'Stay with the whole. Worlds and broad crossings remain primary.'
                  : semanticLod === 2
                    ? 'Regional cells can now become legible without losing their containing world.'
                    : semanticLod === 3
                      ? 'Local neighborhoods can reveal specific relationships and an inquiry locus.'
                      : semanticLod === 4
                        ? 'Relational meaning, verbs, and earned thresholds can become perceptible.'
                        : 'Evidence, standing, provenance, and revision history belong at this depth.'}
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
