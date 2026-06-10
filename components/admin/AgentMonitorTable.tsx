'use client'

import { adminFetch } from '@/lib/admin/adminFetch';
import { useState, useCallback } from 'react'

interface AgentRun {
  id: string
  agent_name: string
  source_type: string
  source_id: string
  source_title: string | null
  status: string
  attempt_count: number
  retry_count: number
  duration_ms: number | null
  model_used: string | null
  output_summary: Record<string, unknown>
  flags: string[]
  is_flagged: boolean
  human_review_status: string
  human_review_notes: string | null
  error_text: string | null
  started_at: string
  completed_at: string | null
}

interface AgentRunEvent {
  id: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

interface SummaryCounts {
  total: number
  flagged: number
  failed: number
  pending_review: number
}

interface Props {
  initialRuns: AgentRun[]
  initialCounts: SummaryCounts
}

const STATUS_COLORS: Record<string, string> = {
  started: 'text-blue-400',
  completed: 'text-emerald-400',
  partial: 'text-amber-400',
  failed: 'text-red-400',
}

const REVIEW_COLORS: Record<string, string> = {
  pending: 'text-maia-ink-40',
  approved: 'text-emerald-400',
  revised: 'text-amber-400',
  rejected: 'text-red-400',
}

export default function AgentMonitorTable({ initialRuns, initialCounts }: Props) {
  const [runs, setRuns] = useState<AgentRun[]>(initialRuns)
  const [counts, setCounts] = useState<SummaryCounts>(initialCounts)
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null)
  const [events, setEvents] = useState<AgentRunEvent[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [reviewSaving, setReviewSaving] = useState(false)

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFlagged, setFilterFlagged] = useState(false)
  const [filterReview, setFilterReview] = useState('')

  const fetchRuns = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterFlagged) params.set('flaggedOnly', 'true')
    if (filterReview) params.set('humanReviewStatus', filterReview)

    const res = await adminFetch(`/api/admin/agent-monitor?${params}`)
    if (res.ok) {
      const data = await res.json()
      setRuns(data.runs)
      setCounts(data.counts)
    }
  }, [filterStatus, filterFlagged, filterReview])

  const openDetail = useCallback(async (run: AgentRun) => {
    setSelectedRun(run)
    setLoadingDetail(true)
    try {
      const res = await adminFetch(`/api/admin/agent-monitor?id=${run.id}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  const submitReview = useCallback(async (status: string) => {
    if (!selectedRun) return
    setReviewSaving(true)
    try {
      const res = await adminFetch('/api/admin/agent-monitor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRunId: selectedRun.id,
          humanReviewStatus: status,
        }),
      })
      if (res.ok) {
        setSelectedRun({ ...selectedRun, human_review_status: status })
        fetchRuns()
      }
    } finally {
      setReviewSaving(false)
    }
  }, [selectedRun, fetchRuns])

  const formatDuration = (ms: number | null) => {
    if (!ms) return '—'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total runs', value: counts.total, color: 'text-maia-ink-100' },
          { label: 'Flagged', value: counts.flagged, color: 'text-amber-400' },
          { label: 'Failed', value: counts.failed, color: 'text-red-400' },
          { label: 'Pending review', value: counts.pending_review, color: 'text-maia-spice-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-maia-navy-900 border border-maia-navy-700 rounded-lg p-4">
            <div className={`text-2xl font-light ${color}`}>{value}</div>
            <div className="text-xs text-maia-ink-40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setTimeout(fetchRuns, 0) }}
          className="bg-maia-navy-850 border border-maia-navy-700 rounded px-3 py-1.5 text-sm text-maia-ink-100"
        >
          <option value="">All statuses</option>
          <option value="started">Started</option>
          <option value="completed">Completed</option>
          <option value="partial">Partial</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={filterReview}
          onChange={(e) => { setFilterReview(e.target.value); setTimeout(fetchRuns, 0) }}
          className="bg-maia-navy-850 border border-maia-navy-700 rounded px-3 py-1.5 text-sm text-maia-ink-100"
        >
          <option value="">All reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="revised">Revised</option>
          <option value="rejected">Rejected</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-maia-ink-60">
          <input
            type="checkbox"
            checked={filterFlagged}
            onChange={(e) => { setFilterFlagged(e.target.checked); setTimeout(fetchRuns, 0) }}
            className="rounded"
          />
          Flagged only
        </label>
      </div>

      {/* Table */}
      <div className="bg-maia-navy-900 border border-maia-navy-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-maia-navy-700 text-maia-ink-40 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Started</th>
              <th className="text-left px-4 py-3">Agent</th>
              <th className="text-left px-4 py-3">Source</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Attempts</th>
              <th className="text-left px-4 py-3">Duration</th>
              <th className="text-left px-4 py-3">Flags</th>
              <th className="text-left px-4 py-3">Review</th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-maia-ink-40">
                  No agent runs yet.
                </td>
              </tr>
            )}
            {runs.map((run) => (
              <tr
                key={run.id}
                onClick={() => openDetail(run)}
                className={`border-b border-maia-navy-800 cursor-pointer transition-colors hover:bg-maia-navy-850 ${
                  run.is_flagged ? 'border-l-2 border-l-amber-500' : ''
                } ${run.status === 'failed' ? 'bg-red-950/10' : ''}`}
              >
                <td className="px-4 py-3 text-maia-ink-60">{formatTime(run.started_at)}</td>
                <td className="px-4 py-3 text-maia-ink-80 font-mono text-xs">{run.agent_name}</td>
                <td className="px-4 py-3 text-maia-ink-80">{run.source_title || run.source_id}</td>
                <td className={`px-4 py-3 ${STATUS_COLORS[run.status] || 'text-maia-ink-60'}`}>
                  {run.status}
                </td>
                <td className="px-4 py-3 text-maia-ink-60">
                  {run.attempt_count}{run.retry_count > 0 ? ` (${run.retry_count} retry)` : ''}
                </td>
                <td className="px-4 py-3 text-maia-ink-60">{formatDuration(run.duration_ms)}</td>
                <td className="px-4 py-3">
                  {run.flags.length > 0 ? (
                    <span className="text-amber-400 text-xs">{run.flags.length} flag{run.flags.length !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-maia-ink-40">—</span>
                  )}
                </td>
                <td className={`px-4 py-3 text-xs ${REVIEW_COLORS[run.human_review_status] || ''}`}>
                  {run.human_review_status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedRun && (
        <div className="bg-maia-navy-900 border border-maia-navy-700 rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg text-maia-ink-100 font-light">
                {selectedRun.source_title || selectedRun.source_id}
              </h3>
              <p className="text-xs text-maia-ink-40 mt-1">
                {selectedRun.agent_name} &middot; {formatTime(selectedRun.started_at)}
              </p>
            </div>
            <button
              onClick={() => setSelectedRun(null)}
              className="text-maia-ink-40 hover:text-maia-ink-80 text-sm"
            >
              Close
            </button>
          </div>

          {/* Run metadata */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-maia-ink-40">Status: </span>
              <span className={STATUS_COLORS[selectedRun.status]}>{selectedRun.status}</span>
            </div>
            <div>
              <span className="text-maia-ink-40">Attempts: </span>
              <span className="text-maia-ink-80">{selectedRun.attempt_count} / retries: {selectedRun.retry_count}</span>
            </div>
            <div>
              <span className="text-maia-ink-40">Duration: </span>
              <span className="text-maia-ink-80">{formatDuration(selectedRun.duration_ms)}</span>
            </div>
          </div>

          {/* Output summary */}
          {Object.keys(selectedRun.output_summary).length > 0 && (
            <div>
              <h4 className="text-xs text-maia-ink-40 uppercase tracking-wider mb-2">Output Summary</h4>
              <pre className="text-xs text-maia-ink-60 bg-maia-navy-850 rounded p-3 overflow-auto">
                {JSON.stringify(selectedRun.output_summary, null, 2)}
              </pre>
            </div>
          )}

          {/* Flags */}
          {selectedRun.flags.length > 0 && (
            <div>
              <h4 className="text-xs text-maia-ink-40 uppercase tracking-wider mb-2">Flags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRun.flags.map((flag) => (
                  <span key={flag} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-1">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {selectedRun.error_text && (
            <div>
              <h4 className="text-xs text-red-400 uppercase tracking-wider mb-2">Error</h4>
              <pre className="text-xs text-red-300 bg-red-950/20 rounded p-3 overflow-auto">
                {selectedRun.error_text}
              </pre>
            </div>
          )}

          {/* Event timeline */}
          <div>
            <h4 className="text-xs text-maia-ink-40 uppercase tracking-wider mb-2">Event Timeline</h4>
            {loadingDetail ? (
              <p className="text-xs text-maia-ink-40">Loading...</p>
            ) : events.length === 0 ? (
              <p className="text-xs text-maia-ink-40">No events recorded.</p>
            ) : (
              <div className="space-y-2">
                {events.map((evt) => (
                  <div key={evt.id} className="flex gap-3 text-xs">
                    <span className="text-maia-ink-40 whitespace-nowrap">
                      {new Date(evt.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-maia-ink-80 font-mono">{evt.event_type}</span>
                    {Object.keys(evt.payload).length > 0 && (
                      <span className="text-maia-ink-40 truncate">
                        {JSON.stringify(evt.payload)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Human review controls */}
          <div className="border-t border-maia-navy-700 pt-4">
            <h4 className="text-xs text-maia-ink-40 uppercase tracking-wider mb-3">Human Review</h4>
            <div className="flex gap-2">
              {(['approved', 'revised', 'rejected'] as const).map((status) => {
                const isActive = selectedRun.human_review_status === status
                const colors: Record<string, string> = {
                  approved: isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-maia-navy-850 text-maia-ink-60 border-maia-navy-700 hover:text-emerald-400',
                  revised: isActive ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-maia-navy-850 text-maia-ink-60 border-maia-navy-700 hover:text-amber-400',
                  rejected: isActive ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-maia-navy-850 text-maia-ink-60 border-maia-navy-700 hover:text-red-400',
                }
                return (
                  <button
                    key={status}
                    onClick={() => submitReview(status)}
                    disabled={reviewSaving || isActive}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${colors[status]}`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
