'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '@/lib/http/apiBase'

type CheckStatus = 'up' | 'down' | 'degraded'

interface ServiceWithStatus {
  id: string
  name: string
  display_name: string
  category: string
  current_status: CheckStatus | null
  last_checked_at: string | null
  response_ms: number | null
  uptime_bar: boolean[]
  uptime_pct_24h: number
  uptime_pct_7d: number
  open_incident: IncidentRow | null
}

interface IncidentRow {
  id: string
  service_id: string
  service_name: string
  started_at: string
  resolved_at: string | null
  downtime_seconds: number | null
  error: string | null
  downtime_formatted?: string
}

interface MonitoringPayload {
  services: ServiceWithStatus[]
  incidents: IncidentRow[]
  checkedAt: string
}

function statusDot(status: CheckStatus | null) {
  if (status === 'up') return <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
  if (status === 'down') return <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
  if (status === 'degraded') return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
  return <span className="inline-block w-3 h-3 rounded-full bg-zinc-600" />
}

function categoryBadge(category: string) {
  const map: Record<string, string> = {
    external: 'bg-blue-900 text-blue-300',
    service: 'bg-purple-900 text-purple-300',
    database: 'bg-amber-900 text-amber-300',
    worker: 'bg-zinc-700 text-zinc-300',
  }
  const cls = map[category] ?? 'bg-zinc-700 text-zinc-300'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${cls}`}>
      {category}
    </span>
  )
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function UptimeBar({ checks }: { checks: boolean[] }) {
  const padded = Array(90).fill(null).map((_, i) => {
    const offset = 90 - checks.length
    if (i < offset) return null
    return checks[i - offset]
  })

  return (
    <div className="flex gap-px items-end h-5">
      {padded.map((v, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm ${
            v === null
              ? 'bg-zinc-700 h-3'
              : v
              ? 'bg-green-500 h-5'
              : 'bg-red-500 h-5'
          }`}
        />
      ))}
    </div>
  )
}

function ServiceCard({ svc }: { svc: ServiceWithStatus }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {statusDot(svc.current_status)}
          <span className="font-medium text-zinc-100 truncate text-sm">{svc.display_name}</span>
        </div>
        {categoryBadge(svc.category)}
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <span>{svc.response_ms !== null ? `${svc.response_ms}ms` : '—'}</span>
        <span>{relativeTime(svc.last_checked_at)}</span>
      </div>

      <UptimeBar checks={svc.uptime_bar} />

      <div className="text-xs text-zinc-500">
        {svc.uptime_pct_24h}% uptime (24h)
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-zinc-700" />
        <div className="h-4 bg-zinc-700 rounded w-32" />
      </div>
      <div className="h-3 bg-zinc-700 rounded w-20" />
      <div className="flex gap-px h-5">
        {Array(90).fill(0).map((_, i) => (
          <div key={i} className="w-[3px] bg-zinc-700 rounded-sm h-3" />
        ))}
      </div>
      <div className="h-3 bg-zinc-700 rounded w-24" />
    </div>
  )
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/monitoring')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  async function handleRunChecks() {
    setRunning(true)
    try {
      const res = await apiFetch('/api/admin/monitoring/run-checks', { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Run checks failed')
    } finally {
      setRunning(false)
    }
  }

  const downCount = data?.services.filter((s) => s.current_status === 'down').length ?? 0
  const allUp = data !== null && downCount === 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">System Monitor</h1>
            {data && (
              <p className="text-xs text-zinc-500 mt-1">
                Last refreshed {relativeTime(data.checkedAt)}
              </p>
            )}
          </div>
          <button
            onClick={handleRunChecks}
            disabled={running}
            className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-100 rounded-md transition-colors"
          >
            {running ? 'Running...' : 'Run Checks'}
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && data && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium ${
              allUp
                ? 'bg-green-950 border border-green-800 text-green-300'
                : 'bg-red-950 border border-red-800 text-red-300'
            }`}
          >
            {allUp
              ? 'All Systems Operational'
              : `${downCount} service${downCount !== 1 ? 's' : ''} down`}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : data?.services.map((svc) => <ServiceCard key={svc.id} svc={svc} />)}
        </div>

        {!loading && data && data.incidents.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-zinc-200">Incidents</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                    <th className="text-left px-4 py-3 font-medium">Service</th>
                    <th className="text-left px-4 py-3 font-medium">Started</th>
                    <th className="text-left px-4 py-3 font-medium">Duration</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.incidents.map((inc) => (
                    <tr key={inc.id} className="border-b border-zinc-800 last:border-0">
                      <td className="px-4 py-3 text-zinc-200">{inc.service_name}</td>
                      <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                        {relativeTime(inc.started_at)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                        {(inc as IncidentRow & { downtime_formatted?: string }).downtime_formatted ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {inc.resolved_at ? (
                          <span className="text-xs bg-green-950 text-green-400 px-2 py-0.5 rounded-full">
                            Resolved
                          </span>
                        ) : (
                          <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-full">
                            Open
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
