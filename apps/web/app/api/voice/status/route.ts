import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // Check Sesame CSM server status
    let sesamePrimary = false
    let sesameHealthy = false
    let sesameResponseTime = 0
    
    try {
      const startTime = Date.now()
      const sesameResponse = await fetch('http://localhost:8000/health', {
        method: 'GET',
        timeout: 5000
      } as any)
      
      sesameResponseTime = Date.now() - startTime
      
      if (sesameResponse.ok) {
        const healthData = await sesameResponse.json()
        sesameHealthy = healthData.model_loaded === true
        sesamePrimary = true
      }
    } catch (error) {
    }

    // Check ElevenLabs availability (fallback)
    let elevenlabsAvailable = false
    let elevenlabsResponseTime = 0
    
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const startTime = Date.now()
        const elevenlabsResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          timeout: 3000
        } as any)
        
        elevenlabsResponseTime = Date.now() - startTime
        elevenlabsAvailable = elevenlabsResponse.ok
      } catch (error) {
      }
    }

    // Determine primary engine and overall health
    let primaryEngine: string = 'offline'
    let mode: string = 'disabled'
    let healthy = false
    let responseTime = 0

    if (sesameHealthy && sesamePrimary) {
      primaryEngine = 'sesame'
      mode = 'local'  // Assuming local when health check passes
      healthy = true
      responseTime = sesameResponseTime
    } else if (elevenlabsAvailable) {
      primaryEngine = 'elevenlabs'
      mode = 'fallback'
      healthy = true
      responseTime = elevenlabsResponseTime
    }

    // Check if Sesame is in offline mode
    const isOfflineMode = process.env.SESAME_MODE === 'offline'
    if (sesameHealthy && isOfflineMode) {
      mode = 'local'
    } else if (sesameHealthy && !isOfflineMode) {
      mode = 'api'
    }

    return NextResponse.json({
      primaryEngine,
      mode,
      healthy,
      responseTime,
      engines: {
        sesame: {
          available: sesameHealthy,
          responseTime: sesameResponseTime,
          mode: isOfflineMode ? 'local' : 'api'
        },
        elevenlabs: {
          available: elevenlabsAvailable,
          responseTime: elevenlabsResponseTime,
          mode: 'api'
        }
      },
      lastCheck: new Date().toISOString()
    })

  } catch (error) {
    console.error('Voice status check failed:', error)
    
    return NextResponse.json({
      primaryEngine: 'offline',
      mode: 'disabled',
      healthy: false,
      responseTime: 0,
      engines: {
        sesame: { available: false, responseTime: 0, mode: 'unknown' },
        elevenlabs: { available: false, responseTime: 0, mode: 'api' }
      },
      error: 'Status check failed',
      lastCheck: new Date().toISOString()
    }, { status: 500 })
  }
}