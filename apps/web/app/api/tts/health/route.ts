/**
 * TTS Health Check Endpoint
 * Returns status of all TTS services
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET() {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    services: {
      sesame: {
        configured: false,
        available: false,
        url: null as string | null,
        lastError: null as string | null
      },
      elevenlabs: {
        configured: false,
        available: false,
        hasApiKey: false,
        lastError: null as string | null
      },
      mock: {
        available: true,
        enabled: process.env.TTS_MOCK_MODE === 'true'
      }
    },
    settings: {
      fallbackEnabled: process.env.TTS_ENABLE_FALLBACK !== 'false',
      cacheEnabled: process.env.TTS_ENABLE_CACHE !== 'false',
      debugMode: process.env.MAYA_DEBUG_VOICE === 'true'
    }
  };

  // Check Sesame configuration
  const sesameUrl = process.env.SESAME_TTS_URL || process.env.NORTHFLANK_SESAME_URL;
  if (sesameUrl) {
    healthStatus.services.sesame.configured = true;
    healthStatus.services.sesame.url = sesameUrl;
    
    // Try to ping Sesame
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${sesameUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      healthStatus.services.sesame.available = response.ok;
      
      if (!response.ok) {
        healthStatus.services.sesame.lastError = `HTTP ${response.status}`;
      }
    } catch (error: any) {
      healthStatus.services.sesame.available = false;
      healthStatus.services.sesame.lastError = error.message || 'Connection failed';
    }
  }

  // Check ElevenLabs configuration
  const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
  if (elevenlabsKey) {
    healthStatus.services.elevenlabs.configured = true;
    healthStatus.services.elevenlabs.hasApiKey = true;
    
    // Try to validate API key
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'xi-api-key': elevenlabsKey
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      healthStatus.services.elevenlabs.available = response.ok;
      
      if (!response.ok) {
        if (response.status === 401) {
          healthStatus.services.elevenlabs.lastError = 'Invalid API key';
        } else {
          healthStatus.services.elevenlabs.lastError = `HTTP ${response.status}`;
        }
      }
    } catch (error: any) {
      healthStatus.services.elevenlabs.available = false;
      healthStatus.services.elevenlabs.lastError = error.message || 'Connection failed';
    }
  }

  // Determine overall health
  const hasWorkingService = 
    healthStatus.services.sesame.available ||
    healthStatus.services.elevenlabs.available ||
    healthStatus.services.mock.enabled;

  const overallStatus = {
    healthy: hasWorkingService,
    message: hasWorkingService 
      ? 'At least one TTS service is available'
      : 'No TTS services available - voice will not work',
    recommendation: !hasWorkingService
      ? 'Enable mock mode (TTS_MOCK_MODE=true) or configure Sesame/ElevenLabs'
      : null
  };

  return NextResponse.json({
    ...healthStatus,
    overall: overallStatus
  }, {
    status: hasWorkingService ? 200 : 503
  });
}