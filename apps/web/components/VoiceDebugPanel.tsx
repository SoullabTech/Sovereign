'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Clock, 
  Wifi, 
  WifiOff,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react'

interface VoiceEngineMetrics {
  engine: 'sesame' | 'elevenlabs' | 'offline'
  mode: 'local' | 'api' | 'fallback'
  responseTime: number
  failureCount: number
  lastError?: string
  fallbackUsed: boolean
  fallbackReason?: string
  uptime: number
  modelLoaded: boolean
}

interface DebugEvent {
  timestamp: Date
  level: 'info' | 'warning' | 'error'
  source: 'sesame' | 'elevenlabs' | 'system'
  message: string
  details?: any
}

export function VoiceDebugPanel({ className = '' }: { className?: string }) {
  const [metrics, setMetrics] = useState<VoiceEngineMetrics>({
    engine: 'offline',
    mode: 'local',
    responseTime: 0,
    failureCount: 0,
    fallbackUsed: false,
    uptime: 0,
    modelLoaded: false
  })
  
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current metrics
  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/voice/debug-metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics || metrics)
        if (data.events) {
          setEvents(data.events.slice(0, 20)) // Keep last 20 events
        }
      }
    } catch (error) {
      addEvent('error', 'system', 'Failed to fetch debug metrics', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add debug event
  const addEvent = (level: 'info' | 'warning' | 'error', source: string, message: string, details?: any) => {
    const event: DebugEvent = {
      timestamp: new Date(),
      level,
      source,
      message,
      details
    }
    setEvents(prev => [event, ...prev.slice(0, 19)])
  }

  // Periodic updates
  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000) // Update every 10s
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      case 'info': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getEngineIcon = () => {
    if (metrics.engine === 'sesame') return <Zap className="h-4 w-4 text-green-500" />
    if (metrics.engine === 'elevenlabs') return <Wifi className="h-4 w-4 text-orange-500" />
    return <WifiOff className="h-4 w-4 text-red-500" />
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (!isExpanded) {
    return (
      <Card className={`border-l-4 ${metrics.fallbackUsed ? 'border-l-yellow-500' : 'border-l-green-500'} ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getEngineIcon()}
              <div>
                <div className="text-sm font-medium">Voice System</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.engine} • {metrics.responseTime}ms
                </div>
              </div>
            </div>
            
            {metrics.fallbackUsed && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                ⚠️ Fallback Active
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          {metrics.fallbackUsed && metrics.fallbackReason && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
              <strong>Reason:</strong> {metrics.fallbackReason}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-l-4 ${metrics.fallbackUsed ? 'border-l-yellow-500' : 'border-l-green-500'} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Voice System Debug</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={isLoading}
              className="h-7 px-2"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-7 w-7 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Engine Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {getEngineIcon()}
              <span className="font-medium">Current Engine</span>
            </div>
            <div className="text-muted-foreground">
              {metrics.engine} ({metrics.mode})
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Response Time</span>
            </div>
            <div className="text-muted-foreground">
              {metrics.responseTime}ms avg
            </div>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            {metrics.modelLoaded ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Model Loaded</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {metrics.failureCount === 0 ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
            )}
            <span>{metrics.failureCount} Failures</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>{formatUptime(metrics.uptime)} Uptime</span>
          </div>
        </div>

        {/* Fallback Warning */}
        {metrics.fallbackUsed && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Fallback Engine Active</span>
            </div>
            <div className="text-xs text-yellow-700">
              <strong>Reason:</strong> {metrics.fallbackReason || 'Primary engine unavailable'}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Check Sesame server status or restart voice services
            </div>
          </div>
        )}

        {/* Last Error */}
        {metrics.lastError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Last Error</span>
            </div>
            <div className="text-xs text-red-700 font-mono">
              {metrics.lastError}
            </div>
          </div>
        )}

        {/* Recent Events */}
        <div>
          <div className="text-sm font-medium mb-2">Recent Events</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">No recent events</div>
            ) : (
              events.map((event, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${getStatusColor(event.level)}`}>
                      {event.source}
                    </span>
                    <span className="text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1">{event.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}