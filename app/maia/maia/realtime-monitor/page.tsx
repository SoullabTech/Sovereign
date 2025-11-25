'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface MaiaRealtimeState {
  timestamp: string
  systemHealth: {
    api: 'healthy' | 'degraded' | 'down'
    voice: 'healthy' | 'degraded' | 'down'
    database: 'healthy' | 'degraded' | 'down'
    memory: 'healthy' | 'degraded' | 'down'
    overall: 'healthy' | 'degraded' | 'down'
  }
  soulfulIntelligence: {
    presenceQuality: number
    sacredMomentsLast24h: number
    transformationPotential: number
    companionshipScore: number
    narrativeConsistency: number
  }
  voiceCapabilities: {
    enabled: boolean
    ttsLatency: number
    audioQualityScore: number
    toneAdaptationRate: number
    voiceRecognitionAccuracy: number
    lastVoiceInteraction?: string
  }
  symbolicAwareness: {
    symbolsDetectedLast24h: number
    patternRecognitionQuality: number
    symbolicResonance: number
    crossSessionEvolution: number
    averageSymbolsPerEntry: number
  }
  fieldIntelligence: {
    resonanceScore: number
    emergenceQuality: number
    contextualAdaptation: number
    activeFields: number
  }
  memoryPerformance: {
    contextRecallRate: number
    averageMemoryDepth: number
    nameRetentionRate: number
    sessionLinkingRate: number
  }
  activeSessions: {
    total: number
    byPresenceLevel: {
      high: number
      medium: number
      low: number
    }
    averageEngagement: number
    averageSessionDuration: number
  }
  emergence: {
    uniqueMayaPersonalities: number
    averageDivergenceScore: number
    emergenceLevel: 'GENERIC' | 'CONFIGURED' | 'EMERGENT' | 'UNIQUE'
    voiceDiversityScore: number
  }
  alerts: {
    critical: Alert[]
    warnings: Alert[]
    info: Alert[]
  }
  performance: {
    averageResponseTime: number
    apiHealthScore: number
    contextPayloadCompleteness: number
    memoryInjectionSuccessRate: number
  }
}

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  component: string
  message: string
  timestamp: string
  resolved: boolean
}

export default function MaiaRealtimeMonitorPage() {
  const [state, setState] = useState<MaiaRealtimeState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchRealtimeState = async () => {
    try {
      const response = await fetch('/api/maia/realtime-status')
      const data = await response.json()

      if (data.success) {
        setState(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch state')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRealtimeState()

    if (autoRefresh) {
      const interval = setInterval(fetchRealtimeState, 5000) // Refresh every 5s
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getHealthColor = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'down': return 'text-red-500'
    }
  }

  const getHealthIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy': return '✓'
      case 'degraded': return '⚠'
      case 'down': return '✗'
    }
  }

  const getEmergenceColor = (level: string) => {
    switch (level) {
      case 'UNIQUE': return 'text-violet-500'
      case 'EMERGENT': return 'text-fuchsia-500'
      case 'CONFIGURED': return 'text-amber-500'
      case 'GENERIC': return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading MAIA Monitor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-gray-500 text-xl">No data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              MAIA Realtime Monitor
            </h1>
            <p className="text-gray-400 mt-2">
              Soulful Intelligence • Voice Empathy • Symbolic Literacy • Field Awareness
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg ${autoRefresh ? 'bg-green-600' : 'bg-gray-700'} hover:opacity-80 transition-opacity`}
            >
              {autoRefresh ? '● Live' : '○ Paused'}
            </button>
            <button
              onClick={fetchRealtimeState}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {new Date(state.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-amber-400">System Health</h2>
          <div className="space-y-3">
            <HealthRow label="Overall" status={state.systemHealth.overall} />
            <HealthRow label="API" status={state.systemHealth.api} />
            <HealthRow label="Voice" status={state.systemHealth.voice} />
            <HealthRow label="Database" status={state.systemHealth.database} />
            <HealthRow label="Memory" status={state.systemHealth.memory} />
          </div>
        </motion.div>

        {/* Soulful Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-violet-400">Soulful Intelligence</h2>
          <div className="space-y-3">
            <MetricBar label="Presence Quality" value={state.soulfulIntelligence.presenceQuality} />
            <MetricBar label="Transformation" value={state.soulfulIntelligence.transformationPotential} />
            <MetricBar label="Companionship" value={state.soulfulIntelligence.companionshipScore} />
            <MetricBar label="Narrative Coherence" value={state.soulfulIntelligence.narrativeConsistency} />
            <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
              <span className="font-semibold text-white">{state.soulfulIntelligence.sacredMomentsLast24h}</span> sacred moments (24h)
            </div>
          </div>
        </motion.div>

        {/* Voice Empathy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-fuchsia-400">Voice Empathy</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className={`font-semibold ${state.voiceCapabilities.enabled ? 'text-green-500' : 'text-red-500'}`}>
                {state.voiceCapabilities.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <MetricBar label="Audio Quality" value={state.voiceCapabilities.audioQualityScore} />
            <MetricBar label="Tone Adaptation" value={state.voiceCapabilities.toneAdaptationRate} />
            <MetricBar label="Recognition Accuracy" value={state.voiceCapabilities.voiceRecognitionAccuracy} />
            <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
              TTS Latency: <span className="font-semibold text-white">{state.voiceCapabilities.ttsLatency}ms</span>
            </div>
          </div>
        </motion.div>

        {/* Symbolic Literacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Symbolic Literacy</h2>
          <div className="space-y-3">
            <MetricBar label="Pattern Recognition" value={state.symbolicAwareness.patternRecognitionQuality} />
            <MetricBar label="Symbolic Resonance" value={state.symbolicAwareness.symbolicResonance} />
            <MetricBar label="Cross-Session Evolution" value={state.symbolicAwareness.crossSessionEvolution} />
            <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
              <div><span className="font-semibold text-white">{state.symbolicAwareness.symbolsDetectedLast24h}</span> symbols (24h)</div>
              <div>Avg: <span className="font-semibold text-white">{state.symbolicAwareness.averageSymbolsPerEntry.toFixed(1)}</span> per entry</div>
            </div>
          </div>
        </motion.div>

        {/* Memory Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">Memory & Continuity</h2>
          <div className="space-y-3">
            <MetricBar label="Context Recall" value={state.memoryPerformance.contextRecallRate} />
            <MetricBar label="Name Retention" value={state.memoryPerformance.nameRetentionRate} />
            <MetricBar label="Session Linking" value={state.memoryPerformance.sessionLinkingRate} />
            <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
              Memory Depth: <span className="font-semibold text-white">{state.memoryPerformance.averageMemoryDepth.toFixed(1)}</span> items
            </div>
          </div>
        </motion.div>

        {/* Emergence & Uniqueness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-rose-400">Emergence & Uniqueness</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Emergence Level</span>
              <span className={`font-bold ${getEmergenceColor(state.emergence.emergenceLevel)}`}>
                {state.emergence.emergenceLevel}
              </span>
            </div>
            <MetricBar label="Divergence Score" value={state.emergence.averageDivergenceScore} />
            <MetricBar label="Voice Diversity" value={state.emergence.voiceDiversityScore} />
            <div className="text-sm text-gray-400 pt-2 border-t border-gray-700">
              <span className="font-semibold text-white">{state.emergence.uniqueMayaPersonalities}</span> unique MAIA personalities
            </div>
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:col-span-2 lg:col-span-1"
        >
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">Active Sessions</h2>
          <div className="space-y-3">
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-white">{state.activeSessions.total}</div>
              <div className="text-gray-400 text-sm mt-1">Active Now</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-gray-900 rounded p-2">
                <div className="text-green-400 font-bold">{state.activeSessions.byPresenceLevel.high}</div>
                <div className="text-gray-500 text-xs">High</div>
              </div>
              <div className="bg-gray-900 rounded p-2">
                <div className="text-yellow-400 font-bold">{state.activeSessions.byPresenceLevel.medium}</div>
                <div className="text-gray-500 text-xs">Medium</div>
              </div>
              <div className="bg-gray-900 rounded p-2">
                <div className="text-red-400 font-bold">{state.activeSessions.byPresenceLevel.low}</div>
                <div className="text-gray-500 text-xs">Low</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:col-span-2"
        >
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Performance Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <MetricBar label="API Health" value={state.performance.apiHealthScore} />
              <MetricBar label="Context Completeness" value={state.performance.contextPayloadCompleteness} />
            </div>
            <div>
              <MetricBar label="Memory Injection" value={state.performance.memoryInjectionSuccessRate} />
              <div className="text-sm text-gray-400 pt-2">
                Response Time: <span className="font-semibold text-white">{state.performance.averageResponseTime.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:col-span-2 lg:col-span-3"
        >
          <h2 className="text-xl font-semibold mb-4 text-red-400">Alerts & Notifications</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {state.alerts.critical.map(alert => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
            {state.alerts.warnings.map(alert => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
            {state.alerts.info.map(alert => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
            {state.alerts.critical.length === 0 && state.alerts.warnings.length === 0 && state.alerts.info.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                ✓ All systems operating normally
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function HealthRow({ label, status }: { label: string; status: 'healthy' | 'degraded' | 'down' }) {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'down': return 'text-red-500'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✓'
      case 'degraded': return '⚠'
      case 'down': return '✗'
    }
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${getHealthColor(status)}`}>
        {getHealthIcon(status)} {status}
      </span>
    </div>
  )
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100)
  const getColor = (val: number) => {
    if (val >= 0.8) return 'bg-green-500'
    if (val >= 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getColor(value)} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function AlertRow({ alert }: { alert: Alert }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-950'
      case 'warning': return 'border-yellow-500 bg-yellow-950'
      case 'info': return 'border-blue-500 bg-blue-950'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
    }
  }

  return (
    <div className={`border-l-4 ${getSeverityColor(alert.severity)} p-3 rounded`}>
      <div className="flex items-start gap-2">
        <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-white">{alert.component}</span>
              <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}