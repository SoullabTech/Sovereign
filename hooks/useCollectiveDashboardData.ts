import useSWR, { SWRConfiguration, useSWRConfig } from 'swr'
import { z } from 'zod'

/**
 * useCollectiveDashboardData
 * ------------------------------------------------------------
 * Production-ready data hook for the Collective Dashboard.
 * - Phenomenology-first response types
 * - Zod runtime validation with safe fallbacks
 * - SWR caching (default: 60s) + stale-while-revalidate
 * - Optional SSE live updates (set `useSSE: true`)
 * - Supports expertMode flag (reveals internal tags when true)
 *
 * Usage:
 *   const { data, isLoading, error, mutate } = useCollectiveDashboardData({ userId, expertMode: false })
 */

// ---------- Types & Schemas ---------- //

const ThemeChip = z.object({
  id: z.string(),
  label: z.string(), // e.g., "steady focus", "clean starts"
  momentum: z.number().min(0).max(1).default(0.5),
  // visible only when expertMode=true
  _internal: z
    .object({
      code: z.string().optional(), // e.g., archetype tag
      score: z.number().optional(),
    })
    .optional(),
})

const EmergingShift = z.object({
  id: z.string(),
  label: z.string(), // e.g., "courage rising"
  description: z.string().optional(),
  momentum: z.number().min(0).max(1),
  // internal tags for expert mode
  _internal: z
    .object({
      archetypes: z.array(z.string()).optional(),
      elements: z.array(z.string()).optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
    .optional(),
})

const ShadowSuggestion = z.object({
  id: z.string(),
  title: z.string(), // e.g., "Name one small truth"
  prompt: z.string(),
  practice: z.string(), // one tiny action
  // expert-only diagnostics
  _internal: z
    .object({
      pattern: z.string().optional(), // internal code
      intensity: z.number().min(0).max(1).optional(),
    })
    .optional(),
})

const FavorableWindow = z.object({
  id: z.string(),
  label: z.string(), // e.g., "Honest conversations"
  start: z.string(), // ISO timestamp
  end: z.string(),
  note: z.string().optional(),
  _internal: z
    .object({
      windowScore: z.number().min(0).max(1).optional(),
    })
    .optional(),
})

const PracticeTile = z.object({
  id: z.string(),
  label: z.string(), // e.g., "5-minute grounding"
  description: z.string(),
  durationMin: z.number().int().positive().optional(),
  link: z.string().url().optional(),
  _internal: z
    .object({
      source: z.string().optional(),
    })
    .optional(),
})

const CollectiveSummarySchema = z.object({
  coherence: z
    .object({
      score: z.number().min(0).max(100), // 0-100 gauge
      tone: z.string(), // Maya-style header line
    })
    .default({ score: 50, tone: 'Today feels balanced.' }),
  themes: z.array(ThemeChip).default([]),
  emerging: z.array(EmergingShift).default([]),
  shadowWeather: z.array(ShadowSuggestion).default([]),
  windows: z.array(FavorableWindow).default([]),
  practices: z.array(PracticeTile).default([]),
  // set by server if caller is expert; client can also request via query string
  expert: z.boolean().optional(),
})

export type CollectiveSummary = z.infer<typeof CollectiveSummarySchema>

// ---------- Hook Options ---------- //

export type UseCollectiveDashboardOptions = {
  userId?: string
  /** When true, server may include `_internal` fields. */
  expertMode?: boolean
  /** Polling interval in ms (default: 60s). */
  refreshInterval?: number
  /** Use SSE to push updates (default: false). */
  useSSE?: boolean
  /** Base URL override for SSR or edge. */
  baseUrl?: string
  /** SWR overrides. */
  swr?: SWRConfiguration
}

// ---------- Fetcher ---------- //

async function fetchSummary(url: string): Promise<CollectiveSummary> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) {
    // Graceful fallback with helpful defaults
    const text = await res.text().catch(() => '')
    throw new Error(`Collective summary failed (${res.status}) ${text}`)
  }
  const json = await res.json()
  const parsed = CollectiveSummarySchema.safeParse(json)
  if (!parsed.success) {
    console.warn('Collective summary schema mismatch:', parsed.error)
    // Attempt graceful fallback: pick safe subset
    return {
      coherence: { score: 50, tone: 'Today feels steady.' },
      themes: [],
      emerging: [],
      shadowWeather: [],
      windows: [],
      practices: [],
      expert: false,
    }
  }
  return parsed.data
}

// ---------- SSE Helper (optional) ---------- //

type OnEvent = (evt: MessageEvent) => void

function attachSSE(url: string, onMessage: OnEvent) {
  const es = new EventSource(url)
  es.addEventListener('message', onMessage)
  return () => {
    es.removeEventListener('message', onMessage)
    es.close()
  }
}

// ---------- Main Hook ---------- //

export function useCollectiveDashboardData({
  userId,
  expertMode = false,
  refreshInterval = 60_000,
  useSSE = false,
  baseUrl,
  swr,
}: UseCollectiveDashboardOptions = {}) {
  const endpoint = `${baseUrl ?? ''}/api/collective/summary${buildQuery({ userId, expert: expertMode })}`

  const { mutate } = useSWRConfig()
  const { data, error, isLoading } = useSWR<CollectiveSummary>(
    endpoint,
    fetchSummary,
    {
      refreshInterval,
      revalidateOnFocus: true,
      keepPreviousData: true,
      ...swr,
    }
  )

  // Optional SSE live updates
  ReactUseEffectSSE(useSSE ? endpoint.replace('/summary', '/events') : null, () => {
    // When a message arrives, ask SWR to refetch the summary
    mutate(endpoint)
  })

  return {
    data,
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}

// ---------- Small Utilities ---------- //

function buildQuery(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  if (entries.length === 0) return ''
  const usp = new URLSearchParams()
  for (const [k, v] of entries) usp.set(k, String(v))
  return `?${usp.toString()}`
}

// Tiny wrapper to avoid importing React just for an effect
function ReactUseEffectSSE(url: string | null, onMessage: () => void) {
  // This function expects to run in a React environment.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react') as typeof import('react')
  const { useEffect } = React
  useEffect(() => {
    if (!url) return
    const cleanup = attachSSE(url, onMessage)
    return () => cleanup()
  }, [url])
}

// ---------- Example Integration (optional) ---------- //
//
// import { CollectiveDashboard } from './CollectiveDashboard'
//
// export function CollectiveDashboardScreen({ userId }: { userId: string }) {
//   const { data, isLoading, error } = useCollectiveDashboardData({ userId, expertMode: false, useSSE: true })
//   if (error) return <div className="text-red-600">{error.message}</div>
//   return (
//     <CollectiveDashboard
//       loading={isLoading}
//       coherence={data?.coherence}
//       themes={data?.themes}
//       emerging={data?.emerging}
//       shadowWeather={data?.shadowWeather}
//       windows={data?.windows}
//       practices={data?.practices}
//       expertMode={data?.expert}
//     />
//   )
// }