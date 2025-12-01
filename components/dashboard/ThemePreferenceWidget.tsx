'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Sun, Moon, Monitor, TrendingUp, Users, ToggleLeft } from 'lucide-react'
import { soullabColors } from '@/lib/theme/soullabColors'

interface ThemeData {
  total: number
  distribution: {
    light: number
    dark: number
    system: number
  }
  percentages: {
    light: number
    dark: number
    system: number
  }
  daily: Array<{
    date: string
    light: number
    dark: number
    system: number
  }>
  switches: {
    total?: number
    averagePerSession: number
    mostCommonSwitch: string
    breakdown?: Record<string, number>
  }
}

export default function ThemePreferenceWidget() {
  const [data, setData] = useState<ThemeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7)

  useEffect(() => {
    fetchThemeData()
  }, [timeRange])

  const fetchThemeData = async () => {
    try {
      const response = await fetch(`/api/analytics/theme?days=${timeRange}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch theme data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <p className="text-gray-500">No theme data available</p>
      </div>
    )
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Light', value: data.distribution.light, icon: '☀️' },
    { name: 'Dark', value: data.distribution.dark, icon: '🌙' },
    { name: 'System', value: data.distribution.system, icon: '💻' }
  ].filter(item => item.value > 0)

  const pieColors = {
    Light: soullabColors.yellow,
    Dark: soullabColors.blue,
    System: soullabColors.gray
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-xs text-gray-500">
            {data.value} users ({data.payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Find most popular theme
  const mostPopular = Object.entries(data.distribution)
    .sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif text-gray-900 dark:text-gray-100">
            Theme Preferences
          </h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-2xl mb-1">
              {mostPopular[0] === 'light' ? '☀️' : mostPopular[0] === 'dark' ? '🌙' : '💻'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Most Popular</p>
            <p className="text-sm font-medium capitalize">{mostPopular[0]}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-2xl mb-1">
              <Users className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-sm font-medium">{data.total}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-2xl mb-1">
              <ToggleLeft className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Switches</p>
            <p className="text-sm font-medium">{data.switches.averagePerSession}/session</p>
          </motion.div>
        </div>

        {/* PIE CHART DISABLED - USER REQUEST TO REMOVE PERMANENTLY */}
        {false && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.map(item => ({
                    ...item,
                    percentage: data.percentages[item.name.toLowerCase() as keyof typeof data.percentages]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[entry.name as keyof typeof pieColors]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Trend */}
        {data.daily.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Daily Theme Usage
            </h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily.map(d => ({ ...d, date: formatDate(d.date) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={soullabColors.opacity.gray10} />
                  <XAxis dataKey="date" stroke={soullabColors.gray} fontSize={10} />
                  <YAxis stroke={soullabColors.gray} fontSize={10} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="light" 
                    stroke={soullabColors.yellow} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dark" 
                    stroke={soullabColors.blue} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="system" 
                    stroke={soullabColors.gray} 
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Switch Patterns */}
        {data.switches.mostCommonSwitch !== 'none' && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Most common switch: {' '}
              <span className="font-medium">
                {data.switches.mostCommonSwitch.replace(/_/g, ' → ')}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for embedding in other dashboards
 */
export function ThemePreferenceCompact() {
  const [data, setData] = useState<ThemeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/theme?days=7')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
        <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Theme Distribution
      </h4>
      <div className="flex items-center justify-around">
        <div className="text-center">
          <Sun className="w-5 h-5 mx-auto mb-1" style={{ color: soullabColors.yellow }} />
          <p className="text-xs text-gray-500">{data.percentages.light}%</p>
        </div>
        <div className="text-center">
          <Moon className="w-5 h-5 mx-auto mb-1" style={{ color: soullabColors.blue }} />
          <p className="text-xs text-gray-500">{data.percentages.dark}%</p>
        </div>
        <div className="text-center">
          <Monitor className="w-5 h-5 mx-auto mb-1" style={{ color: soullabColors.gray }} />
          <p className="text-xs text-gray-500">{data.percentages.system}%</p>
        </div>
      </div>
    </div>
  )
}