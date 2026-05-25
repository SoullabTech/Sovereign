'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/http/apiBase'

type CapabilityStatus =
  | 'not-built'
  | 'built-unwired'
  | 'wired-unobserved'
  | 'observed-runtime'
  | 'live-member-use'

type LayerStatus = 'ok' | 'empty' | 'error'

type LayerObservation = {
  lastSeen: string | null
  okCount: number
  emptyCount: number
  errorCount: number
  observedUnderAuthMember: boolean
}

type RecordedTurn = {
  builtAt: string
  routeId: string
  routeKnown: boolean
  registryStatus: string | null
  member: { idPrefix: string | null; isSanctuary: boolean }
  provider: { provider: string; model?: string; configured: boolean; fallbackActive: boolean }
  promptBlock: { chars: number; layers: Record<string, boolean> }
  memoryHealth: { continuityConfidence: string; layers: Record<string, LayerStatus> }
}

type Claim = {
  name: string
  layer?: string
  modules: string[]
  consumers: string[]
  evidenceKey?: string
  status: CapabilityStatus
  lastObserved: string | null
  observation: LayerObservation | null
  note: string
}

type SubstrateEntry = {
  module: string
  category: string
  note: string
  consumers?: string[]
  evidenceKey?: string
}

type ImpoverishedRoute = { route: string; note: string }

type ProviderMixEntry = {
  provider: string
  model: string | null
  count: number
}

type SubstratePayload = {
  generatedAt: string
  runtime: {
    summary: {
      totalRecorded: number
      bufferCapacity: number
      windowStart: string | null
      windowEnd: string | null
      routesObserved: string[]
      fallbacksActive: number
      sanctuaryTurns: number
      unknownRouteTurns: number
      providerMix: ProviderMixEntry[]
    }
    recentTurns: RecordedTurn[]
  }
  activity: Record<string, LayerObservation>
  consumption: {
    active: SubstrateEntry[]
    bypassed: SubstrateEntry[]
    impoverishedRoutes: ImpoverishedRoute[]
  }
  claims: Claim[]
}

const STATUS_COLOR: Record<CapabilityStatus, string> = {
  'not-built': 'text-maia-ink-40 border-maia-ink-40/20',
  'built-unwired': 'text-amber-300 border-amber-400/30',
  'wired-unobserved': 'text-sky-300 border-sky-400/30',
  'observed-runtime': 'text-emerald-300 border-emerald-400/30',
  'live-member-use': 'text-emerald-200 border-emerald-300/50',
}

const STATUS_LABEL: Record<CapabilityStatus, string> = {
  'not-built': 'Not built',
  'built-unwired': 'Built, unwired',
  'wired-unobserved': 'Wired, unobserved',
  'observed-runtime': 'Observed in runtime',
  'live-member-use': 'Live under member use',
}

const LAYER_COLOR: Record<LayerStatus, string> = {
  ok: 'text-emerald-300',
  empty: 'text-maia-ink-40',
  error: 'text-rose-300',
}

export default function AdminSubstratePage() {
  const [data, setData] = useState<SubstratePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/admin/maia/substrate')
      if (!res.ok) {
        setError(`Request failed: ${res.status}`)
        return
      }
      const json = (await res.json()) as SubstratePayload
      setData(json)
      setRefreshedAt(new Date())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-light tracking-wide text-maia-ink-100">
              Substrate Monitor
            </h1>
            <p className="text-maia-ink-60 text-sm mt-1 max-w-2xl">
              Truth about which MAIA capabilities are actually live. Static
              inventory from the divergence map, correlated against in-process
              runtime evidence. Restart-ephemeral; no DB writes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {refreshedAt && (
              <span className="text-xs text-maia-ink-40">
                refreshed {refreshedAt.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded border border-maia-ink-40/30 text-maia-ink-60 hover:text-maia-ink-100 hover:border-maia-ink-40/60 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded border border-rose-400/40 bg-rose-950/30 text-rose-200 p-4 text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            <LiveRuntimeSection data={data} />
            <CapabilityClaimsSection claims={data.claims} />
            <ConsumptionMapSection
              active={data.consumption.active}
              activity={data.activity}
            />
            <BypassedSection
              bypassed={data.consumption.bypassed}
              impoverishedRoutes={data.consumption.impoverishedRoutes}
            />
          </>
        )}

        {!data && !loading && !error && (
          <div className="text-sm text-maia-ink-40">No data.</div>
        )}
      </div>
    </div>
  )
}

// ─── 1. Live MAIA Runtime ─────────────────────────────────────────────────────

function LiveRuntimeSection({ data }: { data: SubstratePayload }) {
  const { summary, recentTurns } = data.runtime
  const last = recentTurns[0]

  return (
    <section className="space-y-3">
      <SectionHeader title="1. Live MAIA Runtime" subtitle="In-process ring buffer of recent turns." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Recorded turns" value={`${summary.totalRecorded} / ${summary.bufferCapacity}`} />
        <Stat label="Routes observed" value={String(summary.routesObserved.length)} />
        <Stat label="Fallback active" value={String(summary.fallbacksActive)} accent={summary.fallbacksActive > 0 ? 'warn' : undefined} />
        <Stat label="Sanctuary turns" value={String(summary.sanctuaryTurns)} />
      </div>
      {summary.unknownRouteTurns > 0 && (
        <div className="text-xs text-amber-300">
          {summary.unknownRouteTurns} turn(s) used an unregistered routeId — see registry in maiaRuntimeContext.ts.
        </div>
      )}

      {summary.providerMix.length > 0 && (
        <div className="text-xs text-maia-ink-60 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="uppercase tracking-wider text-maia-ink-40">Provider mix</span>
          {summary.providerMix.map((m, i) => (
            <span key={`${m.provider}/${m.model ?? '_'}`}>
              {i > 0 && <span className="text-maia-ink-40">·</span>}{' '}
              <span className="font-mono">{m.provider}/{m.model ?? '—'}</span>
              <span className="text-maia-ink-40"> ×{m.count}</span>
            </span>
          ))}
          {summary.fallbacksActive > 0 && summary.totalRecorded > 0 && (
            <span className="text-maia-ink-40">
              (fallback {summary.fallbacksActive}/{summary.totalRecorded})
            </span>
          )}
        </div>
      )}

      {last ? (
        <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900/60 p-4 space-y-3">
          <div className="text-xs text-maia-ink-40 uppercase tracking-wider">Most recent turn</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <Field label="Route" value={`${last.routeId}${last.routeKnown ? '' : ' (UNREGISTERED)'}`} />
            <Field label="Registry status" value={last.registryStatus ?? '—'} />
            <Field label="Built at" value={formatTime(last.builtAt)} />
            <Field label="Member" value={last.member.isSanctuary ? 'sanctuary' : last.member.idPrefix ? `${last.member.idPrefix}…` : 'anonymous'} />
            <Field label="Provider" value={`${last.provider.provider}${last.provider.fallbackActive ? ' (fallback)' : ''}`} />
            <Field label="Model" value={last.provider.model ?? 'unset'} />
            <Field label="Memory confidence" value={last.memoryHealth.continuityConfidence} />
            <Field label="Prompt block chars" value={String(last.promptBlock.chars)} />
            <Field label="Atoms loaded" value={last.promptBlock.layers.atoms ? 'yes' : 'no'} />
          </div>
          <div className="pt-2 border-t border-maia-ink-40/10">
            <div className="text-xs text-maia-ink-40 uppercase tracking-wider mb-2">Memory layers</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(last.memoryHealth.layers).map(([layer, status]) => (
                <span key={layer} className={`px-2 py-0.5 rounded border border-maia-ink-40/20 ${LAYER_COLOR[status]}`}>
                  {layer}: {status}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900/60 p-4 text-sm text-maia-ink-40">
          No turns recorded yet. The ring buffer fills as MAIA serves traffic
          on this process.
        </div>
      )}

      {recentTurns.length > 1 && (
        <details className="rounded border border-maia-ink-40/10 bg-maia-navy-900/40">
          <summary className="cursor-pointer px-3 py-2 text-xs text-maia-ink-60 hover:text-maia-ink-100">
            Show last {recentTurns.length} turns
          </summary>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-maia-ink-40 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-3 py-2">Time</th>
                  <th className="text-left px-3 py-2">Route</th>
                  <th className="text-left px-3 py-2">Member</th>
                  <th className="text-left px-3 py-2">Provider</th>
                  <th className="text-left px-3 py-2">Confidence</th>
                  <th className="text-right px-3 py-2">Chars</th>
                </tr>
              </thead>
              <tbody>
                {recentTurns.map((t, i) => (
                  <tr key={i} className="border-t border-maia-ink-40/10">
                    <td className="px-3 py-1.5 text-maia-ink-60">{formatTime(t.builtAt)}</td>
                    <td className="px-3 py-1.5">{t.routeId}{!t.routeKnown && <span className="text-amber-300"> *</span>}</td>
                    <td className="px-3 py-1.5 text-maia-ink-60">{t.member.isSanctuary ? 'sanctuary' : t.member.idPrefix ?? 'anon'}</td>
                    <td className="px-3 py-1.5 text-maia-ink-60">{t.provider.provider}{t.provider.fallbackActive ? ' (fb)' : ''}</td>
                    <td className="px-3 py-1.5">{t.memoryHealth.continuityConfidence}</td>
                    <td className="px-3 py-1.5 text-right text-maia-ink-60">{t.promptBlock.chars}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  )
}

// ─── 2. Capability Claims ─────────────────────────────────────────────────────

function CapabilityClaimsSection({ claims }: { claims: Claim[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="2. Capability Claims" subtitle="Each capability has a single status. Prevents 'exists in repo' from being read as 'works in MAIA'." />
      <div className="overflow-x-auto rounded border border-maia-ink-40/20 bg-maia-navy-900/40">
        <table className="w-full text-sm">
          <thead className="text-maia-ink-40 uppercase tracking-wider text-xs">
            <tr>
              <th className="text-left px-4 py-2">Capability</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Last observed</th>
              <th className="text-right px-4 py-2">ok / empty / err</th>
              <th className="text-left px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.name} className="border-t border-maia-ink-40/10">
                <td className="px-4 py-2">
                  <div className="text-maia-ink-100">{c.name}</div>
                  {c.layer && <div className="text-xs text-maia-ink-40">layer: {c.layer}</div>}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded border text-xs ${STATUS_COLOR[c.status]}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-maia-ink-60">
                  {c.lastObserved ? formatTime(c.lastObserved) : '—'}
                </td>
                <td className="px-4 py-2 text-right text-xs text-maia-ink-60">
                  {c.observation
                    ? `${c.observation.okCount} / ${c.observation.emptyCount} / ${c.observation.errorCount}`
                    : '—'}
                </td>
                <td className="px-4 py-2 text-xs text-maia-ink-60 max-w-md">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── 3. Substrate Consumption Map ─────────────────────────────────────────────

function ConsumptionMapSection({
  active,
  activity,
}: {
  active: SubstrateEntry[]
  activity: Record<string, LayerObservation>
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="3. Substrate Consumption Map"
        subtitle="What's wired into live routes today."
      />
      <div className="overflow-x-auto rounded border border-maia-ink-40/20 bg-maia-navy-900/40">
        <table className="w-full text-sm">
          <thead className="text-maia-ink-40 uppercase tracking-wider text-xs">
            <tr>
              <th className="text-left px-4 py-2">Module</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Consumers</th>
              <th className="text-left px-4 py-2">Last observed</th>
            </tr>
          </thead>
          <tbody>
            {active.map((entry) => {
              const obs = entry.evidenceKey ? activity[entry.evidenceKey] : null
              return (
                <tr key={entry.module} className="border-t border-maia-ink-40/10">
                  <td className="px-4 py-2 font-mono text-xs">{entry.module}</td>
                  <td className="px-4 py-2 text-xs text-maia-ink-60">{entry.category}</td>
                  <td className="px-4 py-2 text-xs text-maia-ink-60">
                    {entry.consumers && entry.consumers.length > 0 ? (
                      <ul className="space-y-0.5">
                        {entry.consumers.map((c) => (
                          <li key={c} className="font-mono">{c}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-maia-ink-40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-maia-ink-60">
                    {obs?.lastSeen ? formatTime(obs.lastSeen) : entry.evidenceKey ? <span className="text-maia-ink-40">unobserved</span> : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── 4. Bypassed Substrate ────────────────────────────────────────────────────

function BypassedSection({
  bypassed,
  impoverishedRoutes,
}: {
  bypassed: SubstrateEntry[]
  impoverishedRoutes: ImpoverishedRoute[]
}) {
  const grouped = groupBy(bypassed, (e) => e.category)
  const categoryLabels: Record<string, string> = {
    'orphaned-backend': 'Backend service layer (orphaned)',
    'underutilized-consciousness': 'Consciousness memory services (underutilized)',
    'legacy': 'Legacy / test phase',
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="4. Bypassed Substrate"
        subtitle="Preserved in repo, not consumed by any live route."
      />
      {Object.entries(grouped).map(([category, entries]) => (
        <div key={category} className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40">
          <div className="px-4 py-2 text-xs uppercase tracking-wider text-maia-ink-40 border-b border-maia-ink-40/10">
            {categoryLabels[category] ?? category}
          </div>
          <ul className="divide-y divide-maia-ink-40/10">
            {entries.map((e) => (
              <li key={e.module} className="px-4 py-2 flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-xs text-maia-ink-100">{e.module}</span>
                <span className="text-xs text-maia-ink-60">{e.note}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-maia-ink-40 border-b border-maia-ink-40/10">
          Memory-named routes (impoverished)
        </div>
        <ul className="divide-y divide-maia-ink-40/10">
          {impoverishedRoutes.map((r) => (
            <li key={r.route} className="px-4 py-2 flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-maia-ink-100">{r.route}</span>
              <span className="text-xs text-amber-300">{r.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-light tracking-wide text-maia-ink-100">{title}</h2>
      <p className="text-xs text-maia-ink-40">{subtitle}</p>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'warn' }) {
  return (
    <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 p-3">
      <div className="text-xs uppercase tracking-wider text-maia-ink-40">{label}</div>
      <div className={`text-lg font-light mt-1 ${accent === 'warn' ? 'text-amber-300' : 'text-maia-ink-100'}`}>
        {value}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-maia-ink-40">{label}</div>
      <div className="text-sm text-maia-ink-100 break-words">{value}</div>
    </div>
  )
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

function groupBy<T>(items: T[], keyFn: (t: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {}
  for (const item of items) {
    const k = keyFn(item)
    out[k] = out[k] ?? []
    out[k].push(item)
  }
  return out
}
