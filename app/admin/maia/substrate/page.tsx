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

type BoundaryAuditStatus = {
  hookPresent: boolean
  captureActive: boolean
  captureEnv: string
  packagesCaptured: number
  capturedThisProcess: number
  sanctuarySkippedThisProcess: number
  lastCaptured: { tier: string | null; provider: string | null; at: string | null } | null
  harness: 'dry-verified' | 'live-run'
  ablation: { run: boolean; summary: string }
  localReplay: 'not-run' | 'partial' | 'complete'
  earnedLocalTiers: string[]
  localModels: {
    endpoint: string
    reachable: boolean
    available: string[]
    replayTargets: { model: string; present: boolean }[]
  }
}

type ProviderCognition = {
  note: string
  warning: string
  currentProvider: string | null
  currentModel: string | null
  configuredProvider: string
  fallbackActive: boolean | null
  degraded: boolean
  window: { turns: number; cap: number }
  providerMix: ProviderMixEntry[]
  localTurns: { count: number; percent: number }
  claudeTurns: { count: number; percent: number }
  fallbacksInWindow: number
  lastObserved: string | null
}

type SubstratePayload = {
  generatedAt: string
  boundaryAudit?: BoundaryAuditStatus
  providerCognition?: ProviderCognition
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
            <ProviderCognitionSection pc={data.providerCognition} />
            <CapabilityClaimsSection claims={data.claims} />
            <ConsumptionMapSection
              active={data.consumption.active}
              activity={data.activity}
            />
            <BypassedSection
              bypassed={data.consumption.bypassed}
              impoverishedRoutes={data.consumption.impoverishedRoutes}
            />
            <BoundaryAuditSection status={data.boundaryAudit} />
          </>
        )}

        {!data && !loading && !error && (
          <div className="text-sm text-maia-ink-40">No data.</div>
        )}

        <StateOfTheUnionSection />
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

// ─── 1b. Provider / Sovereign Cognition ──────────────────────────────────────
//
// Cognition routing evidence — surfaced separately from memory-substrate health so
// the monitor never conflates "does memory load?" with "which model answered?".

function ProviderCognitionSection({ pc }: { pc?: ProviderCognition }) {
  if (!pc) return null
  return (
    <section className="space-y-3">
      <SectionHeader title="1b. Provider / Sovereign Cognition" subtitle={pc.note} />
      <p className="border-l-2 border-sky-400/40 pl-4 italic text-sm text-maia-ink-100">
        {pc.warning}
      </p>
      <div
        className={`rounded border p-4 space-y-3 ${
          pc.degraded ? 'border-amber-400/40 bg-amber-950/10' : 'border-sky-400/20 bg-maia-navy-900/40'
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Current provider" value={pc.currentProvider ?? '—'} accent={pc.degraded ? 'warn' : undefined} />
          <Stat label="Current model" value={pc.currentModel ?? 'unset'} />
          <Stat label="Configured provider" value={pc.configuredProvider} />
          <Stat label="Degraded" value={pc.degraded ? 'YES' : 'no'} accent={pc.degraded ? 'warn' : undefined} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat
            label="Fallback active (now)"
            value={pc.fallbackActive == null ? '—' : pc.fallbackActive ? 'yes' : 'no'}
            accent={pc.fallbackActive ? 'warn' : undefined}
          />
          <Stat label={`Local turns (of ${pc.window.turns})`} value={`${pc.localTurns.count} · ${pc.localTurns.percent}%`} />
          <Stat label={`Claude turns (of ${pc.window.turns})`} value={`${pc.claudeTurns.count} · ${pc.claudeTurns.percent}%`} />
          <Stat label="Last observed" value={pc.lastObserved ? formatTime(pc.lastObserved) : '—'} />
        </div>
        {pc.providerMix.length > 0 ? (
          <div className="pt-2 border-t border-maia-ink-40/10">
            <div className="text-xs text-maia-ink-40 uppercase tracking-wider mb-2">
              Provider mix · last {pc.window.turns} turns (cap {pc.window.cap})
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {pc.providerMix.map((m) => (
                <span
                  key={`${m.provider}/${m.model ?? '_'}`}
                  className="px-2 py-0.5 rounded border border-maia-ink-40/20 font-mono text-maia-ink-100"
                >
                  {m.provider}/{m.model ?? '—'} <span className="text-maia-ink-40">×{m.count}</span>
                </span>
              ))}
              {pc.fallbacksInWindow > 0 && (
                <span className="px-2 py-0.5 rounded border border-amber-400/30 text-amber-300">
                  fallbacks ×{pc.fallbacksInWindow}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-maia-ink-40">No provider turns observed yet on this process.</div>
        )}
      </div>
    </section>
  )
}

// ─── 2. Capability Claims ─────────────────────────────────────────────────────

function CapabilityClaimsSection({ claims }: { claims: Claim[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="2. Capability Claims" subtitle="Each capability has a single status. Prevents 'exists in repo' from being read as 'works in MAIA' — and 'unwired' from being read as 'nothing happening'." />
      <div className="rounded border border-maia-ink-40/15 bg-maia-navy-900/30 px-4 py-3 text-xs text-maia-ink-60 space-y-1">
        <div><span className="text-maia-ink-100">Status</span> — declared wiring state from the hand-maintained substrate map. Gated: it escalates to observed / live only once a consumer is declared <em>and</em> runtime evidence qualifies, so an unwired row reports declaration alone.</div>
        <div><span className="text-maia-ink-100">ok / empty / err</span> — raw per-turn evidence counts over the runtime ring buffer (counts, not percentages), reported regardless of wiring status.</div>
        <div><span className="text-maia-ink-100">0 / 100 / 0</span> with last observed <span className="text-maia-ink-100">—</span> means watched-every-turn-empty: evidence of absence, not unwatched.</div>
      </div>
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

// ─── 5. Boundary Audit Status ─────────────────────────────────────────────────
//
// Honest readout of the intelligence-sovereignty instrument + evidence state.
// Doctrine: capture readiness is NOT audit evidence; evidence begins only after live
// packages are replayed and ablated. Spec: docs/specs/BOUNDARY_AUDIT_PROTOCOL_2026-06-08.md

function BoundaryAuditSection({ status }: { status?: BoundaryAuditStatus }) {
  if (!status) {
    return (
      <section className="space-y-3">
        <SectionHeader title="5. Boundary Audit Status" subtitle="Intelligence-sovereignty instrument + evidence state." />
        <div className="text-sm text-maia-ink-40">Status unavailable.</div>
      </section>
    )
  }

  const banner =
    !status.captureActive && status.packagesCaptured === 0 && !status.ablation.run
      ? 'Instruments ready · evidence not yet collected · sovereignty verdict unknown.'
      : status.ablation.run
        ? `Audit verdict present · ${status.ablation.summary}.`
        : status.captureActive
          ? `Capture active · ${status.packagesCaptured} package(s) · evidence not yet collected.`
          : `${status.packagesCaptured} package(s) captured · evidence not yet collected.`

  const rows: Array<{ item: string; value: string; tone?: 'evidence' | 'pending' }> = [
    { item: 'Capture hook', value: status.hookPresent ? 'built · present in build' : '—' },
    {
      item: 'Capture',
      value: `${status.captureActive ? 'active' : 'inactive'} (MAIA_FIELD_CAPTURE=${status.captureEnv})`,
      tone: status.captureActive ? 'evidence' : 'pending',
    },
    {
      item: 'Packages captured',
      value: `${status.packagesCaptured}${status.capturedThisProcess ? ` (+${status.capturedThisProcess} this process)` : ''}`,
      tone: status.packagesCaptured > 0 ? 'evidence' : 'pending',
    },
    { item: 'Sanctuary skipped (this process)', value: String(status.sanctuarySkippedThisProcess) },
    { item: 'Last captured tier', value: status.lastCaptured?.tier ?? '—' },
    { item: 'Last provider', value: status.lastCaptured?.provider ?? '—' },
    { item: 'Audit harness', value: status.harness, tone: status.harness === 'live-run' ? 'evidence' : 'pending' },
    {
      item: 'Canon-guard ablation',
      value: status.ablation.run ? status.ablation.summary : 'not run',
      tone: status.ablation.run ? 'evidence' : 'pending',
    },
    { item: 'Local replay', value: status.localReplay, tone: status.localReplay === 'complete' ? 'evidence' : 'pending' },
    {
      item: 'Local models (ollama)',
      value: status.localModels.reachable
        ? `${status.localModels.available.length} available @ ${status.localModels.endpoint}`
        : `unreachable @ ${status.localModels.endpoint}`,
      tone: status.localModels.reachable ? 'evidence' : 'pending',
    },
    ...status.localModels.replayTargets.map((t) => ({
      item: `  replay target · ${t.model}`,
      value: t.present
        ? 'present'
        : status.localModels.reachable
          ? 'MISSING — pull before live run'
          : 'unknown (ollama unreachable)',
      tone: (t.present ? 'evidence' : 'pending') as 'evidence' | 'pending',
    })),
    { item: 'Earned local tiers', value: status.earnedLocalTiers.length ? status.earnedLocalTiers.join(', ') : 'none' },
  ]

  return (
    <section className="space-y-3">
      <SectionHeader
        title="5. Boundary Audit Status"
        subtitle="Intelligence-sovereignty instrument + evidence state. Storage sovereignty is a separate audit — a displayed setting is a claim until the path is traced."
      />
      <p className="border-l-2 border-amber-400/40 pl-4 italic text-sm text-maia-ink-100">
        Capture readiness is not audit evidence. Audit evidence begins only after live packages are replayed and ablated.
      </p>
      <div className="text-xs text-maia-ink-60">{banner}</div>
      <div className="overflow-x-auto rounded border border-maia-ink-40/20 bg-maia-navy-900/40">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.item} className="border-t border-maia-ink-40/10 first:border-t-0">
                <td className="px-4 py-2 text-maia-ink-60 w-72">{r.item}</td>
                <td
                  className={`px-4 py-2 font-mono text-xs ${
                    r.tone === 'evidence' ? 'text-emerald-300' : r.tone === 'pending' ? 'text-amber-300/80' : 'text-maia-ink-100'
                  }`}
                >
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── 6. State of the Union ────────────────────────────────────────────────────
//
// Editorial / strategic framing — NOT instrument output. It is intentionally
// placed below sections 1–4 so the live evidence is read first. The "what MAIA
// already is" list describes what is architecturally present and exercised in
// code; the live-vs-wired status of each line is what sections 1–4 actually
// adjudicate. Keep this discipline: this section may name direction, it must
// not be read as runtime status.

const SOU_DATE = 'June 2026'

const SOU_THESIS =
  'MAIA is much further along architecturally than it is operationally. That sounds obvious, but it is the defining fact of the system right now.'

const SOU_ALREADY_IS: string[] = [
  'Persistent memory architecture',
  'Session continuity',
  'Cross-session continuity',
  'Semantic memory',
  'Developmental memory',
  'Relational memory',
  'Consent architecture',
  'Sanctuary architecture',
  'Memory health instrumentation',
  'Memory orchestration',
  'Mobile deployment path',
  'Working member interactions',
]

const SOU_MATURE: { title: string; body: string; points?: string[] }[] = [
  {
    title: 'Governance',
    body: 'Possibly the strongest part of the project. Most AI systems bolt ethics on afterward; MAIA’s governance has become structural.',
    points: [
      'Observation before architecture',
      'Receipts before articulation',
      'Member authorship',
      'Sovereignty invariants',
      'Sanctuary boundaries',
      'Provenance discipline',
      'Continuity without possession',
    ],
  },
  {
    title: 'Continuity',
    body: 'The real differentiator — not personality, not intelligence, not elemental language. The ability to carry conversations, developmental themes, relationships, and member-authored moments through time. This is where MAIA is already unusual.',
  },
  {
    title: 'Instrumentation',
    body: 'The Substrate Monitor matters more than it appears — a way to distinguish exists / wired / observed / used. Most systems cannot. That discipline alone prevents years of confusion.',
  },
]

const SOU_NOT_MATURE: { title: string; body: string; callout?: string }[] = [
  {
    title: 'Episodic Memory',
    body: 'Extremely close. The architecture is there; the proof is not. Everything else is preparation.',
    callout: 'It is not live until a member taps.',
  },
  {
    title: 'Pattern / Recurrence',
    body: 'Where the next major breakthrough likely lives — not Morphic, not collective fields, not cross-member anything. The ability to honestly notice a return, and then stop. Close, and valuable without requiring any controversial ontology.',
    callout: 'This seems to keep returning.',
  },
  {
    title: 'Spiral Orientation',
    body: 'Pieces exist, but not yet a member experience. The developmental intelligence lives in fragments; it has not become a lived navigation system.',
  },
  {
    title: 'Daily Practice',
    body: 'Possibly the biggest gap. The platform is architected for continuity, but continuity becomes transformative when it participates in daily life. Daily Anchor may end up more important than many advanced features.',
  },
]

const SOU_SOVEREIGN: string[] = [
  'Memory',
  'Continuity',
  'Permissions',
  'Sanctuary',
  'Episodic ownership',
  'Semantic storage',
  'Developmental storage',
  'Relational storage',
  'Instrumentation',
  'Most orchestration',
]

const SOU_DEPENDENT: string[] = [
  'Symbolic interpretation',
  'Elemental voices',
  'Some classification',
  'Some routing',
  'Response generation',
  'Dream interpretation',
  'Archetypal synthesis',
]

const SOU_LOADBEARING: string[] = [
  'Remember this.',
  'This keeps returning.',
  'Today’s anchor.',
  'Development over time.',
  'Relationship continuity.',
]

const SOU_ROADMAP: { phase: string; title: string; items: string[]; note?: string }[] = [
  {
    phase: 'Phase 1',
    title: 'Reality Contact',
    items: ['Tap-verify episodic', 'Deploy episodic', 'Observe real usage', 'Learn what members actually mark'],
  },
  {
    phase: 'Phase 2',
    title: 'Recurrence',
    items: ['Theme Signals surface', '“This keeps returning”', 'Notice → Reflect → Ask → Wait'],
    note: 'No interpretation. No identity conclusions.',
  },
  {
    phase: 'Phase 3',
    title: 'Daily Continuity',
    items: ['Daily Anchor', 'Spiral Orientation', 'Developmental snapshots'],
  },
  {
    phase: 'Phase 4',
    title: 'Retrieval',
    items: ['Return to marked moments', 'Episodic browsing', 'Member-authored significance'],
  },
  {
    phase: 'Phase 5',
    title: 'Symbolic Governance',
    items: ['Astrology gate', 'Tarot gate', 'Dream-symbol gate', 'Decoy methodology'],
  },
  {
    phase: 'Phase 6',
    title: 'Collective Intelligence',
    items: ['Only after the previous phases produce real evidence — not before.'],
  },
]

const SOU_CLOSING =
  'The project is no longer trying to discover what it is. The center is becoming visible.'
const SOU_IDENTITY =
  'MAIA increasingly looks like a continuity-preserving relational intelligence platform whose primary gift is helping people notice themselves across time without surrendering authorship of meaning.'
const SOU_IDENTITY_TAIL =
  'A much clearer identity than the project had even six months ago — and one that can be tested in reality rather than merely described.'

function StateOfTheUnionSection() {
  return (
    <section className="space-y-5 border-t border-maia-ink-40/10 pt-8">
      <SectionHeader
        title="6. State of the Union"
        subtitle={`Strategic assessment · ${SOU_DATE}. Narrative framing, not runtime evidence — for what is actually live, read sections 1–4 above.`}
      />

      <SOUCallout>{SOU_THESIS}</SOUCallout>

      <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 p-4 space-y-3">
        <SOUHeading>What MAIA already is</SOUHeading>
        <p className="text-xs text-maia-ink-40">
          Architecturally present and exercised in code. The live-vs-wired status of each line is what sections 1–4 above adjudicate — this list is not a liveness claim.
        </p>
        <TagList items={SOU_ALREADY_IS} />
      </div>

      <div className="space-y-3">
        <SOUHeading>What is surprisingly mature</SOUHeading>
        <div className="grid gap-3 md:grid-cols-3">
          {SOU_MATURE.map((m) => (
            <div key={m.title} className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 p-4 space-y-2">
              <div className="text-sm text-maia-ink-100">{m.title}</div>
              <p className="text-xs text-maia-ink-60 leading-relaxed">{m.body}</p>
              {m.points && (
                <ul className="space-y-1 pt-1">
                  {m.points.map((p) => (
                    <li key={p} className="text-xs text-maia-ink-60 flex gap-2">
                      <span className="text-maia-ink-40">·</span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SOUHeading>What is not yet mature</SOUHeading>
        <div className="grid gap-3 md:grid-cols-2">
          {SOU_NOT_MATURE.map((m) => (
            <div key={m.title} className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 p-4 space-y-2">
              <div className="text-sm text-maia-ink-100">{m.title}</div>
              {m.callout && <SOUCallout small>{m.callout}</SOUCallout>}
              <p className="text-xs text-maia-ink-60 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SOUHeading>The LLM boundary question</SOUHeading>
        <p className="text-xs text-maia-ink-60 max-w-3xl leading-relaxed">
          The most important strategic audit ahead: which capabilities are MAIA’s own, and which are deliberate model dependencies versus accidents that need mapping.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border border-emerald-400/20 bg-maia-navy-900/40 p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-emerald-300/80">
              Already sovereign — not Claude, these are MAIA
            </div>
            <TagList items={SOU_SOVEREIGN} tone="sovereign" />
          </div>
          <div className="rounded border border-amber-400/20 bg-maia-navy-900/40 p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-amber-300/80">
              Probably Claude-dependent — needs mapping
            </div>
            <TagList items={SOU_DEPENDENT} tone="dependent" />
          </div>
        </div>
      </div>

      <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 p-4 space-y-3">
        <SOUHeading>The biggest strategic risk</SOUHeading>
        <p className="text-xs text-maia-ink-40">Not Claude. Not OpenAI. Not Anthropic. Not infrastructure.</p>
        <SOUCallout>Building ahead of lived member experience.</SOUCallout>
        <p className="text-xs text-maia-ink-60 max-w-3xl leading-relaxed">
          There is already enough architecture to support meaningful human transformation. The temptation is morphic layers, collective intelligence, advanced symbolic systems, more agents, more frameworks. But this year’s strongest signal points the opposite way — the things that matter most stay simple:
        </p>
        <TagList items={SOU_LOADBEARING} />
      </div>

      <div className="space-y-3">
        <SOUHeading>A conceivable roadmap</SOUHeading>
        <p className="text-xs text-maia-ink-40">Sequenced from today’s position — each phase earns the next with real evidence.</p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {SOU_ROADMAP.map((r) => (
            <div key={r.phase} className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 p-4 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wider text-maia-ink-40">{r.phase}</span>
                <span className="text-sm text-maia-ink-100">{r.title}</span>
              </div>
              <ul className="space-y-1">
                {r.items.map((it) => (
                  <li key={it} className="text-xs text-maia-ink-60 flex gap-2">
                    <span className="text-maia-ink-40">·</span>
                    {it}
                  </li>
                ))}
              </ul>
              {r.note && <p className="text-xs text-maia-ink-40 italic">{r.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-maia-ink-100">{SOU_CLOSING}</p>
        <SOUCallout>{SOU_IDENTITY}</SOUCallout>
        <p className="text-xs text-maia-ink-60 max-w-3xl leading-relaxed">{SOU_IDENTITY_TAIL}</p>
      </div>
    </section>
  )
}

function SOUHeading({ children }: { children: string }) {
  return <h3 className="text-sm font-medium tracking-wide text-maia-ink-100">{children}</h3>
}

function SOUCallout({ children, small }: { children: string; small?: boolean }) {
  return (
    <p className={`border-l-2 border-maia-ink-40/40 pl-4 italic text-maia-ink-100 ${small ? 'text-xs' : 'text-sm'}`}>
      {children}
    </p>
  )
}

function TagList({ items, tone }: { items: string[]; tone?: 'sovereign' | 'dependent' }) {
  const cls =
    tone === 'sovereign'
      ? 'border-emerald-400/25 text-emerald-200'
      : tone === 'dependent'
        ? 'border-amber-400/25 text-amber-200'
        : 'border-maia-ink-40/25 text-maia-ink-100'
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span key={it} className={`px-2.5 py-1 rounded border text-xs ${cls}`}>
          {it}
        </span>
      ))}
    </div>
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
