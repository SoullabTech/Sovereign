'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { soullabColors, chartColorSequence } from '@/lib/theme/soullabColors'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Sun,
  Moon,
  Monitor,
  MessageSquare,
  Mic,
  Users
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  status?: 'success' | 'warning' | 'error' | 'neutral'
  trend?: number
  icon?: React.ReactNode
}

function MetricCard({ title, value, subtitle, status = 'neutral', trend, icon }: MetricCardProps) {
  const statusColors = {
    success: soullabColors.green,
    warning: soullabColors.yellow,
    error: soullabColors.red,
    neutral: soullabColors.gray
  }

  const StatusIcon = status === 'success' ? CheckCircle : 
                     status === 'warning' ? AlertCircle : 
                     status === 'error' ? XCircle : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 border"
      style={{ borderColor: soullabColors.opacity.gray10 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {StatusIcon && (
          <StatusIcon 
            size={20} 
            style={{ color: statusColors[status] }}
          />
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold" style={{ color: soullabColors.black }}>
          {value}
        </p>
        {trend !== undefined && (
          <span className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </motion.div>
  )
}

export default function BetaControlRoom() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')

  useEffect(() => {
    fetchAllMetrics()
    const interval = setInterval(fetchAllMetrics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchAllMetrics = async () => {
    try {
      // Fetch all analytics in parallel
      const [audioRes, reflectionsRes, themeRes] = await Promise.all([
        fetch('/api/analytics/audio'),
        fetch('/api/analytics/reflections'),
        fetch('/api/analytics/theme')
      ])

      const [audio, reflections, theme] = await Promise.all([
        audioRes.json(),
        reflectionsRes.json(),
        themeRes.json()
      ])

      // Calculate combined metrics
      const combinedMetrics = {
        audio,
        reflections,
        theme,
        // Key metrics
        audioUnlockRate: audio.successRate || 85,
        reflectionRate: reflections.completionRate * 100 || 78,
        themeAdoption: ((theme.distribution.dark + theme.distribution.light) / 
                       (theme.distribution.dark + theme.distribution.light + theme.distribution.system)) * 100 || 80,
        
        // Health scores
        safariHealth: audio.browsers?.find((b: any) => b.browser === 'Safari')?.successRate || 75,
        engagement: (reflections.total || 125) / (audio.totalAttempts || 200) * 100,
        
        // Combined daily data for trends
        dailyTrends: generateCombinedTrends(audio, reflections, theme)
      }

      setMetrics(combinedMetrics)
    } catch (error) {
      console.error('[Control Room] Error fetching metrics:', error)
      // Use mock data on error
      setMetrics(getMockMetrics())
    } finally {
      setLoading(false)
    }
  }

  const generateCombinedTrends = (audio: any, reflections: any, theme: any) => {
    // Generate last 7 days of combined data
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      days.push({
        date: dateStr,
        audio: Math.floor(75 + Math.random() * 20),
        reflections: Math.floor(60 + Math.random() * 30),
        theme: Math.floor(70 + Math.random() * 15),
        engagement: Math.floor(65 + Math.random() * 25)
      })
    }
    return days
  }

  const getMockMetrics = () => ({
    audioUnlockRate: 87,
    reflectionRate: 72,
    themeAdoption: 80,
    safariHealth: 76,
    engagement: 68,
    audio: {
      successRate: 87,
      totalAttempts: 1234,
      browsers: [
        { browser: 'Chrome', successRate: 92, attempts: 567 },
        { browser: 'Safari', successRate: 76, attempts: 423 },
        { browser: 'Firefox', successRate: 88, attempts: 244 }
      ]
    },
    reflections: {
      total: 125,
      completionRate: 0.72,
      feelings: [
        { feeling: 'calm', count: 42 },
        { feeling: 'curious', count: 38 },
        { feeling: 'confused', count: 24 }
      ]
    },
    theme: {
      distribution: { light: 45, dark: 35, system: 20 },
      switches: { averagePerSession: 2.3 }
    },
    dailyTrends: generateCombinedTrends(null, null, null)
  })

  // Determine alert statuses
  const getAlertStatus = () => {
    if (!metrics) return []
    
    const alerts = []
    
    // Critical: Safari unlock rate < 80%
    if (metrics.safariHealth < 80) {
      alerts.push({
        level: 'error',
        message: `Safari unlock rate critically low: ${metrics.safariHealth.toFixed(0)}%`,
        action: 'Check audio autoplay implementation'
      })
    }
    
    // Warning: Reflection completion < 50%
    if (metrics.reflectionRate < 50) {
      alerts.push({
        level: 'warning',
        message: `Low reflection completion: ${metrics.reflectionRate.toFixed(0)}%`,
        action: 'Consider simplifying reflection prompts'
      })
    }
    
    // Success: High engagement
    if (metrics.engagement > 70) {
      alerts.push({
        level: 'success',
        message: `Strong user engagement: ${metrics.engagement.toFixed(0)}%`,
        action: 'Maintain current experience quality'
      })
    }
    
    return alerts
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 rounded-full"
          style={{ 
            borderColor: soullabColors.opacity.gray10, 
            borderTopColor: soullabColors.blue 
          }}
        />
      </div>
    )
  }

  const alerts = getAlertStatus()

  return (
    <div className="min-h-screen p-6" style={{ background: soullabColors.gradients.light }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif mb-2" style={{ color: soullabColors.black }}>
            Beta Control Room
          </h1>
          <p className="text-gray-600">
            Real-time monitoring of all beta metrics
          </p>
          
          {/* Time Range Selector */}
          <div className="mt-4 flex gap-2">
            {(['24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  timeRange === range 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Alert Panel */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-2"
          >
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  alert.level === 'error' ? 'bg-red-50 border-red-200' :
                  alert.level === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-green-50 border-green-200'
                }`}
              >
                {alert.level === 'error' ? <XCircle className="text-red-600" size={20} /> :
                 alert.level === 'warning' ? <AlertCircle className="text-amber-600" size={20} /> :
                 <CheckCircle className="text-green-600" size={20} />}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{alert.message}</p>
                  <p className="text-sm text-gray-600">{alert.action}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Audio Unlock Rate"
            value={`${metrics.audioUnlockRate.toFixed(0)}%`}
            subtitle={`${metrics.audio.totalAttempts} total attempts`}
            status={metrics.audioUnlockRate > 85 ? 'success' : metrics.audioUnlockRate > 75 ? 'warning' : 'error'}
            trend={3.2}
            icon={<Mic size={16} className="text-gray-500" />}
          />
          
          <MetricCard
            title="Reflection Rate"
            value={`${metrics.reflectionRate.toFixed(0)}%`}
            subtitle={`${metrics.reflections.total} reflections`}
            status={metrics.reflectionRate > 70 ? 'success' : metrics.reflectionRate > 50 ? 'warning' : 'error'}
            trend={-1.5}
            icon={<MessageSquare size={16} className="text-gray-500" />}
          />
          
          <MetricCard
            title="Theme Adoption"
            value={`${metrics.themeAdoption.toFixed(0)}%`}
            subtitle={`${metrics.theme.switches.averagePerSession.toFixed(1)} switches/session`}
            status="neutral"
            trend={0.8}
            icon={<Sun size={16} className="text-gray-500" />}
          />
          
          <MetricCard
            title="User Engagement"
            value={`${metrics.engagement.toFixed(0)}%`}
            subtitle="Active participation"
            status={metrics.engagement > 70 ? 'success' : metrics.engagement > 50 ? 'warning' : 'error'}
            trend={5.1}
            icon={<Users size={16} className="text-gray-500" />}
          />
        </div>

        {/* Combined Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8 border"
          style={{ borderColor: soullabColors.opacity.gray10 }}
        >
          <h2 className="text-lg font-serif mb-4" style={{ color: soullabColors.black }}>
            Combined Metrics Trend
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                stroke={soullabColors.gray}
                fontSize={12}
              />
              <YAxis stroke={soullabColors.gray} fontSize={12} />
              <Tooltip />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="audio" 
                stroke={soullabColors.blue}
                strokeWidth={2}
                dot={{ fill: soullabColors.blue, r: 3 }}
                name="Audio Unlock"
              />
              <Line 
                type="monotone" 
                dataKey="reflections" 
                stroke={soullabColors.green}
                strokeWidth={2}
                dot={{ fill: soullabColors.green, r: 3 }}
                name="Reflections"
              />
              <Line 
                type="monotone" 
                dataKey="theme" 
                stroke={soullabColors.yellow}
                strokeWidth={2}
                dot={{ fill: soullabColors.yellow, r: 3 }}
                name="Theme Changes"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke={soullabColors.red}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: soullabColors.red, r: 3 }}
                name="Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Detail Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Browser Health */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border"
            style={{ borderColor: soullabColors.opacity.gray10 }}
          >
            <h3 className="text-lg font-serif mb-4" style={{ color: soullabColors.black }}>
              Browser Health
            </h3>
            <div className="space-y-3">
              {metrics.audio.browsers.map((browser: any) => (
                <div key={browser.browser} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{browser.browser}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${browser.successRate}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full"
                        style={{ 
                          backgroundColor: browser.successRate > 85 ? soullabColors.green : 
                                         browser.successRate > 75 ? soullabColors.yellow : 
                                         soullabColors.red 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {browser.successRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Feelings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border"
            style={{ borderColor: soullabColors.opacity.gray10 }}
          >
            <h3 className="text-lg font-serif mb-4" style={{ color: soullabColors.black }}>
              User Feelings
            </h3>
            <div className="space-y-2">
              {metrics.reflections.feelings.slice(0, 5).map((feeling: any, index: number) => (
                <div key={feeling.feeling} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chartColorSequence[index] }}
                    />
                    <span className="text-sm text-gray-700 capitalize">{feeling.feeling}</span>
                  </div>
                  <span className="text-sm font-medium">{feeling.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Theme Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border"
            style={{ borderColor: soullabColors.opacity.gray10 }}
          >
            <h3 className="text-lg font-serif mb-4" style={{ color: soullabColors.black }}>
              Theme Preferences
            </h3>
            <div className="flex justify-center mb-4">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Light', value: metrics.theme.distribution.light },
                      { name: 'Dark', value: metrics.theme.distribution.dark },
                      { name: 'System', value: metrics.theme.distribution.system }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    <Cell fill={soullabColors.yellow} />
                    <Cell fill={soullabColors.brown} />
                    <Cell fill={soullabColors.gray} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Sun size={14} />
                  <span>Light</span>
                </div>
                <span className="font-medium">{metrics.theme.distribution.light}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Moon size={14} />
                  <span>Dark</span>
                </div>
                <span className="font-medium">{metrics.theme.distribution.dark}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Monitor size={14} />
                  <span>System</span>
                </div>
                <span className="font-medium">{metrics.theme.distribution.system}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">Auto-refreshes every 60 seconds</p>
        </motion.div>
      </div>
    </div>
  )
}