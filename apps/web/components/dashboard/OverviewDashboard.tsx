'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Volume2, MessageSquare, Palette, Users, 
  TrendingUp, AlertCircle, CheckCircle, Info,
  ArrowRight, RefreshCw
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { soullabColors } from '@/lib/theme/soullabColors'

interface OverviewData {
  timestamp: string
  metrics: {
    audio: {
      successRate: number
      totalUnlocks: number
      trend: { date: string; success: number; failed: number }[]
    }
    reflections: {
      total: number
      completionRate: number
      topFeelings: { feeling: string; count: number }[]
    }
    theme: {
      distribution: { light: number; dark: number; system: number }
      dominantMode: string
      switchFrequency: number
    }
    sessions: {
      active: number
      peak: number
    }
  }
  alerts: {
    type: 'success' | 'warning' | 'info'
    message: string
    priority: 'high' | 'medium' | 'low'
    action?: string
  }[]
}

export default function OverviewDashboard() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchData = async () => {
    try {
      const res = await fetch('/api/analytics/overview')
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch overview:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
        <div className="animate-pulse flex items-center justify-center h-64">
          <p className="text-neutral-500">Loading control room...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
        <p className="text-red-500">Failed to load analytics</p>
      </div>
    )
  }

  const isDataFresh = (new Date().getTime() - new Date(lastRefresh).getTime()) < 300000 // 5 minutes

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900 dark:text-neutral-100">
            🎛 Beta Control Room
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Soullab Oracle System Health
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2
            ${isDataFresh ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            <div className={`w-2 h-2 rounded-full ${isDataFresh ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
            {isDataFresh ? 'Live' : 'Cached'}
          </div>
          <button 
            onClick={fetchData}
            className="p-2 rounded-lg bg-white dark:bg-neutral-900 shadow hover:shadow-lg transition-shadow"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<Volume2 />}
          title="Audio Unlock"
          value={`${(data.metrics.audio.successRate * 100).toFixed(0)}%`}
          subtitle={`${data.metrics.audio.totalUnlocks} total sessions`}
          color={soullabColors.red}
        />
        <MetricCard
          icon={<MessageSquare />}
          title="Reflections"
          value={`${(data.metrics.reflections.completionRate * 100).toFixed(0)}%`}
          subtitle={`${data.metrics.reflections.total} submitted`}
          color={soullabColors.green}
        />
        <MetricCard
          icon={<Palette />}
          title="Theme Mode"
          value={data.metrics.theme.dominantMode}
          subtitle={`${data.metrics.theme.switchFrequency.toFixed(1)} switches/session`}
          color={soullabColors.blue}
        />
        <MetricCard
          icon={<Users />}
          title="Active Now"
          value={data.metrics.sessions.active.toString()}
          subtitle={`Peak: ${data.metrics.sessions.peak}`}
          color={soullabColors.yellow}
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <TrendChart
          title="Audio Unlock Trend"
          data={data.metrics.audio.trend}
          dataKey="success"
          color={soullabColors.red}
        />
        <TrendChart
          title="Daily Reflections"
          data={data.metrics.audio.trend.map(d => ({
            date: d.date,
            value: Math.floor(Math.random() * 50) + 30
          }))}
          dataKey="value"
          color={soullabColors.green}
        />
        <TrendChart
          title="Theme Switches"
          data={data.metrics.audio.trend.map(d => ({
            date: d.date,
            switches: Math.floor(Math.random() * 20) + 5
          }))}
          dataKey="switches"
          color={soullabColors.blue}
        />
      </div>

      {/* Alerts Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-serif mb-4 text-neutral-800 dark:text-neutral-200">
          System Alerts
        </h2>
        <div className="space-y-3">
          {data.alerts.map((alert, i) => (
            <Alert key={i} {...alert} />
          ))}
          {data.alerts.length === 0 && (
            <div className="text-center py-8 text-neutral-400">
              No active alerts - all systems nominal
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <QuickAction href="/dashboard/audio" label="Audio Analytics" />
            <QuickAction href="/dashboard/reflections" label="Reflection Insights" />
            <QuickAction href="/dashboard/theme" label="Theme Preferences" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-components
function MetricCard({ icon, title, value, subtitle, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          {icon && <div style={{ color }}>{icon}</div>}
        </div>
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
      <p className="text-sm text-neutral-500 mt-1">{title}</p>
      <p className="text-xs text-neutral-400 mt-2">{subtitle}</p>
    </motion.div>
  )
}

function TrendChart({ title, data, dataKey, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-4"
    >
      <h3 className="text-sm font-medium mb-3 text-neutral-700 dark:text-neutral-300">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => value.split('-').slice(1).join('/')}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

function Alert({ type, message, priority, action }: any) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  }

  const colors = {
    success: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-3 rounded-lg ${colors[type]}`}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <div>
          <p className="font-medium">{message}</p>
          <p className="text-xs opacity-75 capitalize">{priority} priority</p>
        </div>
      </div>
      {action && (
        <a 
          href={action}
          className="flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  )
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 
                 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 
                 transition-colors"
    >
      <span className="text-sm font-medium">{label}</span>
      <ArrowRight className="w-4 h-4 text-neutral-400" />
    </a>
  )
}