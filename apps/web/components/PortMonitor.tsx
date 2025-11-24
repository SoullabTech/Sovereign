'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Server,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PortStats {
  totalRuns: number
  conflictCount: number
  conflictRate: string
  portUsage: Record<string, number>
  topBlockers: [string, number][]
  recentEntries: any[]
}

export function PortMonitor({ className = '' }: { className?: string }) {
  const [stats, setStats] = useState<PortStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPort, setSelectedPort] = useState<number | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/port/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch port stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getPortStatusColor = (conflictRate: string) => {
    const rate = parseFloat(conflictRate)
    if (rate === 0) return 'text-green-500'
    if (rate < 20) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getMostUsedPort = () => {
    if (!stats?.portUsage) return null
    const entries = Object.entries(stats.portUsage)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }

  if (!stats && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          No port usage data available yet
        </CardContent>
      </Card>
    )
  }

  const mostUsedPort = getMostUsedPort()
  const statusColor = getPortStatusColor(stats?.conflictRate || '0')

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Port Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStats}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{stats?.totalRuns || 0}</div>
            <div className="text-xs text-muted-foreground">Total Runs</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${statusColor}`}>
              {stats?.conflictRate || '0%'}
            </div>
            <div className="text-xs text-muted-foreground">Conflict Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {mostUsedPort ? mostUsedPort[0] : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Primary Port</div>
          </div>
        </div>

        {/* Port Usage */}
        {stats?.portUsage && Object.keys(stats.portUsage).length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Port Usage</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.portUsage).map(([port, count]) => (
                <Badge
                  key={port}
                  variant={port === '3002' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setSelectedPort(parseInt(port))}
                >
                  :{port} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Top Blockers */}
        {stats?.topBlockers && stats.topBlockers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Top Port Blockers
            </h4>
            <div className="space-y-1">
              {stats.topBlockers.map(([process, count], idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{process}</span>
                  <span className="text-muted-foreground">{count} times</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats?.recentEntries && stats.recentEntries.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {stats.recentEntries.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="text-xs p-2 bg-muted rounded">
                  <div className="flex items-center justify-between">
                    <span>
                      {entry.requested === entry.actual ? (
                        <CheckCircle className="h-3 w-3 text-green-500 inline mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-500 inline mr-1" />
                      )}
                      Port {entry.actual}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {entry.process && (
                    <div className="text-muted-foreground mt-1">
                      Blocked by: {entry.process}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {stats && parseFloat(stats.conflictRate) > 50 && mostUsedPort && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">Recommendation</span>
            </div>
            <div className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
              High conflict rate detected. Consider setting PORT={mostUsedPort[0]} in your .env.local
            </div>
          </div>
        )}

        {/* Selected Port Details */}
        {selectedPort && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium">Port {selectedPort} Details</div>
            <div className="text-xs mt-1">
              Used {stats?.portUsage[selectedPort] || 0} times
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}