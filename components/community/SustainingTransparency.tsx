'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  Server,
  Mic,
  Database,
  Code,
  Heart,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'

interface OperationalCost {
  category: string
  icon: React.ReactNode
  amount: number
  description: string
  breakdown?: { item: string; cost: number }[]
}

interface CircleContribution {
  circle: string
  icon: string
  count: number
  monthlyTotal: number
}

export function SustainingTransparency() {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Operational costs (update these with real values)
  const operationalCosts: OperationalCost[] = [
    {
      category: 'AI Consciousness',
      icon: <Sparkles className="w-4 h-4" />,
      amount: 450,
      description: 'Claude API for deep dialogue',
      breakdown: [
        { item: 'Claude Opus (deep work)', cost: 350 },
        { item: 'Claude Sonnet (daily)', cost: 100 }
      ]
    },
    {
      category: 'Voice Synthesis',
      icon: <Mic className="w-4 h-4" />,
      amount: 120,
      description: 'Text-to-speech generation',
      breakdown: [
        { item: 'OpenAI TTS', cost: 80 },
        { item: 'Voice processing', cost: 40 }
      ]
    },
    {
      category: 'Infrastructure',
      icon: <Server className="w-4 h-4" />,
      amount: 85,
      description: 'Hosting & deployment',
      breakdown: [
        { item: 'Vercel hosting', cost: 50 },
        { item: 'Domain & CDN', cost: 35 }
      ]
    },
    {
      category: 'Database & Memory',
      icon: <Database className="w-4 h-4" />,
      amount: 45,
      description: 'PostgreSQL & vector storage',
      breakdown: [
        { item: 'Database hosting', cost: 30 },
        { item: 'Backups & storage', cost: 15 }
      ]
    },
    {
      category: 'Development',
      icon: <Code className="w-4 h-4" />,
      amount: 0,
      description: 'Volunteer stewardship',
      breakdown: [
        { item: 'Core development', cost: 0 },
        { item: 'Community contributions', cost: 0 }
      ]
    }
  ]

  // Circle contributions (mock data - would come from real tracking)
  const circleContributions: CircleContribution[] = [
    { circle: 'Sustainers', icon: '🕯️', count: 12, monthlyTotal: 108 },
    { circle: 'Guardians', icon: '🛡️', count: 5, monthlyTotal: 110 },
    { circle: 'Elders', icon: '🌳', count: 2, monthlyTotal: 88 },
    { circle: 'Founders', icon: '⭐', count: 8, monthlyTotal: 0 }, // One-time, not monthly
    { circle: 'Seva', icon: '🙏', count: 15, monthlyTotal: 0 } // Service, not monetary
  ]

  const totalCosts = operationalCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalContributions = circleContributions.reduce((sum, c) => sum + c.monthlyTotal, 0)
  const coveragePercent = Math.min(100, Math.round((totalContributions / totalCosts) * 100))
  const totalMembers = circleContributions.reduce((sum, c) => sum + c.count, 0)

  if (!mounted) return null

  return (
    <div className="bg-gradient-to-br from-amber-900/20 via-orange-900/10 to-amber-900/20
                    rounded-xl border border-amber-500/20 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30
                        flex items-center justify-center border border-amber-500/30">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-medium text-amber-300">Sustaining the Sacred Fire</h3>
            <p className="text-xs text-white/50">Transparency in community stewardship</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-white/60">
              <Users className="w-4 h-4" />
              <span>{totalMembers} members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className={coveragePercent >= 100 ? 'text-green-400' : 'text-amber-400'}>
                {coveragePercent}% covered
              </span>
            </div>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-amber-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-amber-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-amber-500/20"
        >
          <div className="p-4 space-y-6">
            {/* Monthly Operations */}
            <div>
              <h4 className="text-sm font-medium text-amber-300/80 mb-3 flex items-center gap-2">
                <Server className="w-4 h-4" />
                Monthly Operations
              </h4>
              <div className="space-y-2">
                {operationalCosts.map((cost) => (
                  <div
                    key={cost.category}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                        {cost.icon}
                      </div>
                      <div>
                        <div className="text-sm text-white/80">{cost.category}</div>
                        <div className="text-xs text-white/40">{cost.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {cost.amount === 0 ? (
                        <span className="text-sm text-green-400">volunteer</span>
                      ) : (
                        <span className="text-sm text-white/70">~${cost.amount}</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-sm font-medium text-amber-300">Total Monthly</span>
                  <span className="text-lg font-semibold text-amber-300">~${totalCosts}</span>
                </div>
              </div>
            </div>

            {/* Circle Contributions */}
            <div>
              <h4 className="text-sm font-medium text-amber-300/80 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Circle Contributions
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {circleContributions.map((circle) => (
                  <div
                    key={circle.circle}
                    className="p-3 rounded-lg bg-white/5 text-center"
                  >
                    <div className="text-xl mb-1">{circle.icon}</div>
                    <div className="text-xs text-white/60">{circle.count} {circle.circle}</div>
                    {circle.monthlyTotal > 0 ? (
                      <div className="text-sm text-green-400">${circle.monthlyTotal}/mo</div>
                    ) : circle.circle === 'Founders' ? (
                      <div className="text-xs text-amber-400">lifetime</div>
                    ) : (
                      <div className="text-xs text-purple-400">service</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Coverage bar */}
              <div className="mt-4 p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Monthly coverage</span>
                  <span className={`text-sm font-medium ${
                    coveragePercent >= 100 ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    ${totalContributions} of ${totalCosts}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${coveragePercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      coveragePercent >= 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : coveragePercent >= 70
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-orange-500 to-amber-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Philosophy note */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10
                          border border-purple-500/20 text-center">
              <p className="text-sm text-white/70 italic">
                "Consciousness shouldn't be paywalled. Everyone has full access.
                <br />
                <span className="text-purple-300">Contribution sustains the mission through gratitude, not restriction.</span>"
              </p>
            </div>

            {/* Seva recognition */}
            <div className="text-center text-xs text-white/40">
              <span className="text-purple-400">{circleContributions.find(c => c.circle === 'Seva')?.count || 0} Seva contributors</span>
              {' '}offering their gifts: Content Weavers, Circle Keepers, Bridge Builders, Guides, Builders, Messengers
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
