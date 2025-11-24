'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface VoiceEngineStatus {
  engine: 'sesame' | 'elevenlabs' | 'offline' | 'unknown'
  mode: 'local' | 'api' | 'fallback' | 'disabled'
  healthy: boolean
  responseTime?: number
  lastCheck: Date
}

export function VoiceEngineStatus() {
  const [status, setStatus] = useState<VoiceEngineStatus>({
    engine: 'unknown',
    mode: 'disabled',
    healthy: false,
    lastCheck: new Date()
  })
  const [testing, setTesting] = useState(false)
  const [lastTestAudio, setLastTestAudio] = useState<string | null>(null)

  // Check voice engine status
  const checkStatus = async () => {
    try {
      const response = await fetch('/api/voice/status')
      if (response.ok) {
        const data = await response.json()
        setStatus({
          engine: data.primaryEngine || 'unknown',
          mode: data.mode || 'disabled',
          healthy: data.healthy || false,
          responseTime: data.responseTime,
          lastCheck: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to check voice status:', error)
      setStatus(prev => ({ ...prev, healthy: false, lastCheck: new Date() }))
    }
  }

  // Test Sesame voice with confirmation phrase
  const testVoice = async () => {
    setTesting(true)
    try {
      const testPhrase = "✨ Sesame voice test successful. Maya&apos;s voice system is working perfectly."
      
      const response = await fetch('/api/voice/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testPhrase,
          voiceEngine: 'auto',
          fallbackEnabled: true,
          testMode: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update status based on test result
        setStatus(prev => ({
          ...prev,
          engine: data.engine || 'unknown',
          mode: data.fallbackUsed ? 'fallback' : 'local',
          healthy: data.success,
          responseTime: data.processingTimeMs,
          lastCheck: new Date()
        }))

        // Play the test audio
        if (data.audioData) {
          const audio = new Audio('data:audio/wav;base64,' + data.audioData)
          audio.play().catch(console.error)
          setLastTestAudio(data.audioData)
        } else if (data.audioUrl) {
          const audio = new Audio(data.audioUrl)
          audio.play().catch(console.error)
        }
      }
    } catch (error) {
      console.error('Voice test failed:', error)
      setStatus(prev => ({ ...prev, healthy: false }))
    } finally {
      setTesting(false)
    }
  }

  // Periodic status check
  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (!status.healthy) return 'bg-red-500'
    if (status.engine === 'sesame' && status.mode === 'local') return 'bg-green-500'
    if (status.engine === 'sesame' && status.mode === 'api') return 'bg-blue-500'
    if (status.engine === 'elevenlabs') return 'bg-orange-500'
    return 'bg-gray-500'
  }

  const getStatusText = () => {
    if (!status.healthy) return 'Offline'
    if (status.engine === 'sesame' && status.mode === 'local') return 'Sesame Local'
    if (status.engine === 'sesame' && status.mode === 'api') return 'Sesame API'
    if (status.engine === 'elevenlabs') return 'ElevenLabs'
    return 'Unknown'
  }

  const getStatusIcon = () => {
    if (!status.healthy) return <XCircle className="h-4 w-4" />
    if (status.engine === 'sesame') return <CheckCircle className="h-4 w-4" />
    if (status.engine === 'elevenlabs') return <AlertCircle className="h-4 w-4" />
    return <MicOff className="h-4 w-4" />
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Mic className="h-4 w-4" />
          Voice Engine Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`${getStatusColor()} text-white border-transparent`}
          >
            <span className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </Badge>
          {status.responseTime && (
            <span className="text-xs text-muted-foreground">
              {status.responseTime}ms
            </span>
          )}
        </div>

        {/* Engine Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Engine: {status.engine}</div>
          <div>Mode: {status.mode}</div>
          <div>Last check: {status.lastCheck.toLocaleTimeString()}</div>
        </div>

        {/* Test Button */}
        <div className="flex gap-2">
          <Button
            onClick={testVoice}
            disabled={testing}
            size="sm"
            variant={status.engine === 'sesame' ? 'default' : 'secondary'}
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Test Voice
              </>
            )}
          </Button>
          
          <Button
            onClick={checkStatus}
            size="sm"
            variant="outline"
          >
            Refresh
          </Button>
        </div>

        {/* Status Messages */}
        {status.engine === 'sesame' && status.mode === 'local' && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            🎉 Sesame is running locally - 100% offline voice!
          </div>
        )}
        
        {status.engine === 'elevenlabs' && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Using ElevenLabs fallback - Sesame may be offline
          </div>
        )}
        
        {!status.healthy && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            ❌ Voice system offline - check server status
          </div>
        )}
      </CardContent>
    </Card>
  )
}