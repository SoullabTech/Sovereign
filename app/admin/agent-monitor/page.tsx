'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/http/apiBase'
import AgentMonitorTable from '@/components/admin/AgentMonitorTable'

export default function AgentMonitorPage() {
  const [runs, setRuns] = useState([])
  const [counts, setCounts] = useState({ total: 0, flagged: 0, failed: 0, pending_review: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/admin/agent-monitor')
        if (res.ok) {
          const data = await res.json()
          setRuns(data.runs || [])
          setCounts(data.counts || { total: 0, flagged: 0, failed: 0, pending_review: 0 })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-light tracking-wide text-maia-ink-100">
            Agent Monitor
          </h1>
          <p className="text-maia-ink-60 text-sm mt-1">
            Observability for bounded agent execution.
          </p>
        </header>

        {loading ? (
          <p className="text-maia-ink-40 text-sm">Loading...</p>
        ) : (
          <AgentMonitorTable initialRuns={runs} initialCounts={counts} />
        )}
      </div>
    </div>
  )
}
