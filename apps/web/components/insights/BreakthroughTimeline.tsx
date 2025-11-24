'use client'

/**
 * Breakthrough Timeline Component
 * Visualizes consciousness breakthrough moments in chronological order
 */

import { useEffect, useState } from 'react'
import { getBreakthroughs, type Breakthrough } from '@/lib/insights/UserDevelopmentalData'

interface BreakthroughTimelineProps {
  userId: string
  days?: number
}

const BREAKTHROUGH_COLORS = {
  insight: 'from-purple-500/20 to-purple-400/10 border-purple-400/30',
  synchronicity: 'from-cyan-500/20 to-cyan-400/10 border-cyan-400/30',
  download: 'from-yellow-500/20 to-yellow-400/10 border-yellow-400/30',
  integration: 'from-green-500/20 to-green-400/10 border-green-400/30',
  shift: 'from-orange-500/20 to-orange-400/10 border-orange-400/30'
}

const BREAKTHROUGH_ICONS = {
  insight: '💡',
  synchronicity: '✨',
  download: '⚡',
  integration: '🌀',
  shift: '🔄'
}

export default function BreakthroughTimeline({ userId, days = 90 }: BreakthroughTimelineProps) {
  const [breakthroughs, setBreakthroughs] = useState<Breakthrough[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBreakthroughs()
  }, [userId, days])

  async function loadBreakthroughs() {
    try {
      setLoading(true)
      const data = await getBreakthroughs(userId, days)

      // Sort by date descending (most recent first)
      const sorted = data.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setBreakthroughs(sorted)
    } catch (error) {
      console.error('[BreakthroughTimeline] Error loading:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date: Date): string {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function getColorClass(type: Breakthrough['type']): string {
    return BREAKTHROUGH_COLORS[type] || 'from-gray-500/20 to-gray-400/10 border-gray-400/30'
  }

  function getIcon(type: Breakthrough['type']): string {
    return BREAKTHROUGH_ICONS[type] || '⭐'
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-800/40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (breakthroughs.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gradient-to-br from-slate-800/40 to-slate-900/20 rounded-xl border border-slate-700/30">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">No Breakthroughs Yet</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Start tracking your breakthrough moments - insights, synchronicities, downloads, and consciousness shifts.
        </p>
        <button
          onClick={() => {/* TODO: Open breakthrough logging UI */}}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Log First Breakthrough
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-200">
          Breakthrough Timeline
        </h3>
        <div className="text-sm text-slate-400">
          {breakthroughs.length} {breakthroughs.length === 1 ? 'moment' : 'moments'} • Last {days} days
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-slate-700 via-slate-600 to-transparent" />

        {breakthroughs.map((breakthrough, index) => (
          <div key={breakthrough.id} className="relative pl-16 group">
            {/* Timeline dot */}
            <div className={`absolute left-3 top-3 w-6 h-6 rounded-full bg-gradient-to-br ${getColorClass(breakthrough.type)} border-2 flex items-center justify-center text-xs group-hover:scale-110 transition-transform`}>
              {getIcon(breakthrough.type)}
            </div>

            {/* Breakthrough card */}
            <div className={`bg-gradient-to-br ${getColorClass(breakthrough.type)} border rounded-xl p-4 hover:border-opacity-60 transition-all`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200 capitalize">
                    {breakthrough.type}
                  </span>
                  {breakthrough.tags && breakthrough.tags.length > 0 && (
                    <div className="flex gap-1">
                      {breakthrough.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-slate-900/40 text-slate-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {formatDate(breakthrough.timestamp)}
                </span>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed mb-2">
                {breakthrough.description}
              </p>

              {breakthrough.context && (
                <div className="mt-3 pt-3 border-t border-slate-700/30">
                  <p className="text-xs text-slate-400 italic">
                    {breakthrough.context}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="mt-6 p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Breakthrough Distribution</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(BREAKTHROUGH_ICONS).map(([type, icon]) => {
            const count = breakthroughs.filter(b => b.type === type).length
            const percentage = (count / breakthroughs.length) * 100

            return (
              <div key={type} className="text-center">
                <div className={`text-2xl mb-1 p-2 rounded-lg bg-gradient-to-br ${getColorClass(type as Breakthrough['type'])}`}>
                  {icon}
                </div>
                <div className="text-xs text-slate-400 capitalize">{type}</div>
                <div className="text-sm font-semibold text-slate-200">{count}</div>
                {count > 0 && (
                  <div className="text-xs text-slate-500">{percentage.toFixed(0)}%</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
