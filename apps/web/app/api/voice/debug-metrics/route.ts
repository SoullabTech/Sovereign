import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// In-memory storage for metrics (in production, use Redis or database)
let voiceMetrics = {
  engine: 'offline' as 'sesame' | 'elevenlabs' | 'offline',
  mode: 'local' as 'local' | 'api' | 'fallback',
  responseTime: 0,
  failureCount: 0,
  lastError: '',
  fallbackUsed: false,
  fallbackReason: '',
  uptime: 0,
  modelLoaded: false,
  startTime: Date.now()
}

let debugEvents: Array<{
  timestamp: Date,
  level: 'info' | 'warning' | 'error',
  source: 'sesame' | 'elevenlabs' | 'system',
  message: string,
  details?: any
}> = []

export async function GET(request: NextRequest) {
  try {
    // Check current Sesame status
    let currentEngine = 'offline'
    let currentMode = 'local'
    let responseTime = 0
    let modelLoaded = false
    let fallbackUsed = false
    let fallbackReason = ''

    // Test Sesame CSM
    try {
      const startTime = Date.now()
      const sesameResponse = await fetch('http://localhost:8000/health', {
        method: 'GET',
        timeout: 3000
      } as any)
      
      responseTime = Date.now() - startTime
      
      if (sesameResponse.ok) {
        const healthData = await sesameResponse.json()
        modelLoaded = healthData.model_loaded === true
        
        if (modelLoaded) {
          currentEngine = 'sesame'
          currentMode = process.env.SESAME_MODE === 'offline' ? 'local' : 'api'
        }
      }
    } catch (error) {
      // Sesame not available, check ElevenLabs fallback
      if (process.env.ELEVENLABS_API_KEY) {
        try {
          const startTime = Date.now()
          const elevenlabsResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            timeout: 3000
          } as any)
          
          responseTime = Date.now() - startTime
          
          if (elevenlabsResponse.ok) {
            currentEngine = 'elevenlabs'
            currentMode = 'fallback'
            fallbackUsed = true
            fallbackReason = 'Sesame CSM server not responding'
            
            // Log fallback event
            debugEvents.unshift({
              timestamp: new Date(),
              level: 'warning',
              source: 'system',
              message: 'Fallback to ElevenLabs - Sesame unavailable'
            })
            
            // Send fallback alert (non-blocking)
            fetch('/api/voice/alert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'fallback',
                engine: 'sesame',
                message: 'Sesame CSM server not responding, using ElevenLabs fallback',
                details: { responseTime, timestamp: new Date().toISOString() }
              })
            }).catch(err => console.error('Failed to send fallback alert:', err))
            
            // Keep only last 50 events
            debugEvents = debugEvents.slice(0, 50)
          }
        } catch (elevenlabsError) {
          fallbackReason = 'Both Sesame and ElevenLabs unavailable'
          
          debugEvents.unshift({
            timestamp: new Date(),
            level: 'error',
            source: 'system',
            message: 'All voice engines failed',
            details: { error: elevenlabsError }
          })
          
          // Send failure alert (non-blocking)
          fetch('/api/voice/alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'failure',
              engine: 'elevenlabs',
              message: 'Complete voice system failure - both Sesame and ElevenLabs unavailable',
              details: { 
                sesameError: 'Server not responding',
                elevenlabsError: elevenlabsError instanceof Error ? elevenlabsError.message : String(elevenlabsError),
                timestamp: new Date().toISOString()
              }
            })
          }).catch(err => console.error('Failed to send failure alert:', err))
          
          debugEvents = debugEvents.slice(0, 50)
        }
      } else {
        fallbackReason = 'Sesame unavailable, no ElevenLabs key configured'
        
        debugEvents.unshift({
          timestamp: new Date(),
          level: 'error',
          source: 'system',
          message: 'No fallback voice engine configured'
        })
        
        // Send configuration alert (non-blocking)
        fetch('/api/voice/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'failure',
            engine: 'sesame',
            message: 'Sesame CSM unavailable and no ElevenLabs fallback configured',
            details: { 
              issue: 'Missing ELEVENLABS_API_KEY environment variable',
              timestamp: new Date().toISOString()
            }
          })
        }).catch(err => console.error('Failed to send configuration alert:', err))
        
        debugEvents = debugEvents.slice(0, 50)
      }
    }

    // Update metrics
    const uptime = Math.floor((Date.now() - voiceMetrics.startTime) / 1000)
    
    voiceMetrics = {
      ...voiceMetrics,
      engine: currentEngine as any,
      mode: currentMode as any,
      responseTime,
      modelLoaded,
      fallbackUsed,
      fallbackReason,
      uptime
    }

    // Add success event if engine changed
    if (currentEngine === 'sesame' && !debugEvents.find(e => 
      e.message.includes('Sesame CSM online') && 
      Date.now() - e.timestamp.getTime() < 60000
    )) {
      // Check if we're recovering from a fallback
      const wasInFallback = voiceMetrics.fallbackUsed || voiceMetrics.engine !== 'sesame'
      
      debugEvents.unshift({
        timestamp: new Date(),
        level: 'info',
        source: 'sesame',
        message: 'Sesame CSM online and ready'
      })
      
      // Send recovery alert if we were previously in fallback mode
      if (wasInFallback) {
        fetch('/api/voice/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'recovery',
            engine: 'sesame',
            message: 'Sesame CSM has recovered and is now primary voice engine',
            details: { 
              responseTime: responseTime + 'ms',
              modelLoaded: modelLoaded,
              timestamp: new Date().toISOString()
            }
          })
        }).catch(err => console.error('Failed to send recovery alert:', err))
      }
      
      debugEvents = debugEvents.slice(0, 50)
    }

    return NextResponse.json({
      metrics: voiceMetrics,
      events: debugEvents.slice(0, 20) // Return last 20 events
    })

  } catch (error) {
    console.error('Debug metrics error:', error)
    
    return NextResponse.json({
      metrics: {
        ...voiceMetrics,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      },
      events: debugEvents.slice(0, 20)
    }, { status: 500 })
  }
}

// Endpoint to manually log debug events (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, source, message, details } = body

    if (!level || !source || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    debugEvents.unshift({
      timestamp: new Date(),
      level,
      source,
      message,
      details
    })
    
    debugEvents = debugEvents.slice(0, 50)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}