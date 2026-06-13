'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/http/apiBase'
import { betaSession } from '@/lib/auth/betaSession'
import {
  Activity, Database, Cpu, Server, AlertTriangle, CheckCircle,
  ArrowLeft, ExternalLink, RefreshCw, GitBranch, Clock, Shield,
  Users, FileText, BarChart2, Layers, Zap, Eye, Radio, Inbox,
  HardDrive, Network, FlaskConical, ChevronRight,
} from 'lucide-react'

// --- Types ---

interface ComponentHealth {
  status: string
  latencyMs?: number
  error?: string
  details?: Record<string, unknown>
}

interface HealthResponse {
  health: 'ok' | 'degraded' | 'down'
  uptime: number
  version: string
  safeMode: boolean
  timestamp: string
  components: {
    database: ComponentHealth
    tables: ComponentHealth
    memory: ComponentHealth & { details?: { heapPercent: number; heapUsedMB: number; rssMB: number } }
  }
}

interface ServiceWithStatus {
  id: string
  name: string
  display_name: string
  category: string
  current_status: 'up' | 'down' | 'degraded' | null
  last_checked_at: string | null
  response_ms: number | null
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

interface MonitoringData {
  services: ServiceWithStatus[]
  incidents: IncidentRow[]
  checkedAt: string
}

// --- Helpers ---

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h < 48) return `${h}h ${m}m`
  const d = Math.floor(h / 24)
  return `${d}d ${h % 24}h`
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function statusColor(status: string | null) {
  if (status === 'ok' || status === 'up') return 'text-green-400'
  if (status === 'degraded') return 'text-yellow-400'
  return 'text-red-400'
}

function statusDotClass(status: string | null) {
  if (status === 'ok' || status === 'up') return 'bg-green-500'
  if (status === 'degraded') return 'bg-yellow-400'
  if (status === 'down') return 'bg-red-500'
  return 'bg-zinc-600'
}

function StatusDot({ status }: { status: string | null }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDotClass(status)}`} />
}

// --- Quick Launch config ---

const QUICK_LAUNCH = [
  { label: 'System Monitor', href: '/admin/monitoring', icon: Activity, desc: 'Uptime & service health' },
  { label: 'Platform Overview', href: '/admin/platform-overview', icon: Network, desc: 'APIs, data flows, tables' },
  { label: 'MAIA Substrate', href: '/admin/maia/substrate', icon: Layers, desc: 'Memory & runtime state' },
  { label: 'Agent Monitor', href: '/admin/agent-monitor', icon: Radio, desc: 'Corpus callosum & runs' },
  { label: 'Feedback Inbox', href: '/admin/feedback-inbox', icon: Inbox, desc: 'Member signals' },
  { label: 'Activity Feed', href: '/admin/activity-feed', icon: Zap, desc: 'Platform pulse' },
  { label: 'Analytics', href: '/admin/consciousness-analytics', icon: BarChart2, desc: 'Usage & patterns' },
  { label: 'Beta Testers', href: '/admin/beta-testers', icon: Users, desc: 'Member management' },
  { label: 'Security', href: '/admin/security', icon: Shield, desc: 'Auth & access audit' },
  { label: 'Content Pipeline', href: '/admin/content-pipeline', icon: FileText, desc: 'Manuscript → distribution' },
  { label: 'Opus Pulse', href: '/admin/opus-pulse', icon: Eye, desc: 'Model usage & cost' },
  { label: 'User Management', href: '/admin', icon: HardDrive, desc: 'Members & credentials' },
] as const

// --- Main Page ---

export default function OpsPage() {
  const router = useRouter()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    const user = betaSession.getUser()
    if (!user) router.push('/signin')
  }, [router])

  const load = useCallback(async () => {
    try {
      const [healthRes, monRes] = await Promise.all([
        fetch('/api/health'),
        apiFetch('/api/admin/monitoring'),
      ])

      if (healthRes.ok) setHealth(await healthRes.json())
      if (monRes.ok) setMonitoring(await monRes.json())

      setError(null)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
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

  const downServices = monitoring?.services.filter(s => s.current_status === 'down') ?? []
  const openIncidents = monitoring?.incidents.filter(i => !i.resolved_at) ?? []
  const totalServices = monitoring?.services.length ?? 0
  const healthOverall = health?.health ?? null
  const dbLatency = health?.components.database.latencyMs
  const memPercent = (health?.components.memory as ComponentHealth & { details?: { heapPercent: number } })?.details?.heapPercent ?? null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Back to Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">Operations</h1>
              <p className="text-xs text-zinc-500">CTO cockpit — soullab.life</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-zinc-600 hidden sm:block">
                {relativeTime(lastRefresh.toISOString())}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleRunChecks}
              disabled={running}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-md transition-colors"
            >
              {running ? 'Running...' : 'Run Checks'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Status Banner */}
        {!loading && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            downServices.length === 0 && healthOverall !== 'down'
              ? 'bg-green-950 border border-green-800 text-green-300'
              : 'bg-red-950 border border-red-800 text-red-300'
          }`}>
            {downServices.length === 0 && healthOverall !== 'down'
              ? <><CheckCircle className="w-4 h-4" /> All Systems Operational</>
              : <><AlertTriangle className="w-4 h-4" /> {downServices.length} service{downServices.length !== 1 ? 's' : ''} down — {openIncidents.length} open incident{openIncidents.length !== 1 ? 's' : ''}</>
            }
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Deploy & Health */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-zinc-300">Deploy &amp; Health</h2>
              {health && (
                <span className={`ml-auto text-xs font-mono ${statusColor(health.health)}`}>
                  {health.health.toUpperCase()}
                </span>
              )}
            </div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-zinc-800 rounded w-3/4" />)}
              </div>
            ) : health ? (
              <div className="space-y-2 text-sm">
                <Row icon={<Clock className="w-3.5 h-3.5" />} label="Uptime" value={formatUptime(health.uptime)} />
                <Row
                  icon={<GitBranch className="w-3.5 h-3.5" />}
                  label="Version"
                  value={health.version === 'unknown' ? <span className="text-zinc-500">unknown</span> : <span className="font-mono text-xs">{health.version.slice(0, 8)}</span>}
                />
                <Row
                  icon={<Database className="w-3.5 h-3.5" />}
                  label="Database"
                  value={
                    <span className={statusColor(health.components.database.status)}>
                      {health.components.database.status}
                      {dbLatency !== undefined && ` · ${dbLatency}ms`}
                    </span>
                  }
                />
                <Row
                  icon={<Cpu className="w-3.5 h-3.5" />}
                  label="Memory"
                  value={
                    memPercent !== null
                      ? <span className={memPercent > 85 ? 'text-yellow-400' : 'text-zinc-300'}>{memPercent}% heap</span>
                      : <span className="text-zinc-500">—</span>
                  }
                />
                {health.safeMode && (
                  <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Safe mode active
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">No data</p>
            )}
          </div>

          {/* Service Overview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-zinc-300">Services</h2>
              {!loading && monitoring && (
                <span className="ml-auto text-xs text-zinc-500">
                  {totalServices - downServices.length}/{totalServices} up
                </span>
              )}
            </div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-zinc-800 rounded" />)}
              </div>
            ) : monitoring ? (
              <div className="space-y-1.5">
                {monitoring.services.slice(0, 8).map(svc => (
                  <div key={svc.id} className="flex items-center gap-2 text-xs">
                    <StatusDot status={svc.current_status} />
                    <span className="text-zinc-300 truncate flex-1">{svc.display_name}</span>
                    <span className="text-zinc-600 flex-shrink-0">{svc.uptime_pct_24h}%</span>
                  </div>
                ))}
                {monitoring.services.length > 8 && (
                  <button
                    onClick={() => router.push('/admin/monitoring')}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 mt-1"
                  >
                    +{monitoring.services.length - 8} more <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">No data</p>
            )}
          </div>

          {/* Incidents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-zinc-300">Incidents</h2>
              {!loading && monitoring && (
                <span className={`ml-auto text-xs font-medium ${openIncidents.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {openIncidents.length} open
                </span>
              )}
            </div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-4 bg-zinc-800 rounded" />)}
              </div>
            ) : monitoring ? (
              monitoring.incidents.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-green-500">
                  <CheckCircle className="w-3.5 h-3.5" /> No incidents recorded
                </div>
              ) : (
                <div className="space-y-2">
                  {monitoring.incidents.slice(0, 5).map(inc => (
                    <div key={inc.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${inc.resolved_at ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-zinc-300 truncate">{inc.service_name}</span>
                        <span className="text-zinc-600 flex-shrink-0 ml-auto">{relativeTime(inc.started_at)}</span>
                      </div>
                      {!inc.resolved_at && inc.error && (
                        <p className="text-zinc-600 pl-3.5 truncate mt-0.5">{inc.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-xs text-zinc-600">No data</p>
            )}
          </div>
        </div>

        {/* Open Incidents Detail */}
        {openIncidents.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Open Incidents
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                    <th className="text-left px-4 py-3 font-medium">Service</th>
                    <th className="text-left px-4 py-3 font-medium">Started</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Error</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {openIncidents.map(inc => (
                    <tr key={inc.id} className="border-b border-zinc-800 last:border-0">
                      <td className="px-4 py-3 text-zinc-200">{inc.service_name}</td>
                      <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{relativeTime(inc.started_at)}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs truncate max-w-xs hidden sm:table-cell">
                        {inc.error ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-full">Open</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Launch */}
        <div>
          <h2 className="text-sm font-medium text-zinc-500 mb-3">Quick Launch</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {QUICK_LAUNCH.map(({ label, href, icon: Icon, desc }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 rounded-lg p-4 text-left transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>
                <p className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors leading-snug">
                  {label}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5 leading-snug">{desc}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// Row helper for Deploy card
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-600 flex-shrink-0">{icon}</span>
      <span className="text-zinc-500 flex-shrink-0 w-16">{label}</span>
      <span className="text-zinc-300 ml-auto text-right">{value}</span>
    </div>
  )
}
