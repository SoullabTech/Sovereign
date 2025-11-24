import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { SesameVoiceService } from '@/lib/services/SesameVoiceService';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { maiaRealtimeMonitor } from '@/lib/monitoring/MaiaRealtimeMonitor';

const voiceService = new SesameVoiceService({
  apiUrl: process.env.SESAME_API_URL || 'http://localhost:8000',
  apiKey: process.env.SESAME_API_KEY,
  defaultVoice: 'nova',
  enableCloning: true,
  cacheEnabled: true
});

/**
 * Oracle Voice API - Generate voice responses with character selection
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const {
      text,
      characterId = 'maya-default',
      element,
      mood,
      jungianPhase,
      enableProsody = true,
      format = 'mp3',
      userId,
      usePersonalizedModulation = false
    } = await request.json();

    const requestUserId = userId || 'demo-user';

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get voice profile
    const voiceProfile = voiceService.getVoiceProfile(characterId);
    if (!voiceProfile) {
      return NextResponse.json({
        error: `Voice profile ${characterId} not found`
      }, { status: 404 });
    }

    // If user wants personalized modulation, use their agent state
    let personalizedModulation;
    if (usePersonalizedModulation && userId) {
      try {
        const agent = await PersonalOracleAgent.loadAgent(userId);
        personalizedModulation = agent.getVoiceModulation();
      } catch (error) {
        console.log('Could not load personalized modulation, using defaults');
      }
    }

    // Apply personalized modulation if available
    if (personalizedModulation) {
      voiceProfile.parameters = {
        ...voiceProfile.parameters,
        ...personalizedModulation
      };
    }

    // Generate voice
    const result = await voiceService.generateSpeech({
      text,
      voiceProfile,
      element,
      emotionalContext: mood || jungianPhase ? {
        mood,
        intensity: 0.7,
        jungianPhase
      } : undefined,
      prosodyHints: enableProsody ? {
        emphasis: [],
        pauses: [],
        intonation: text.endsWith('?') ? 'questioning' : 'neutral'
      } : undefined,
      format
    });

    if (result.audioData) {
      // 📊 Track successful voice generation
      maiaRealtimeMonitor.trackVoiceInteraction({
        sessionId,
        userId: requestUserId,
        timestamp: new Date(),
        ttsLatencyMs: Date.now() - startTime,
        audioGenerated: true,
        audioQuality: result.duration && result.duration > 0 ? 'good' : 'poor',
        voiceProfile: characterId,
        element: element || 'aether'
      });

      // Return audio as base64
      return NextResponse.json({
        success: true,
        audioData: result.audioData.toString('base64'),
        format,
        characterId,
        duration: result.duration,
        metadata: result.metadata
      });
    } else {
      // 📊 Track voice generation failure
      maiaRealtimeMonitor.trackVoiceInteraction({
        sessionId,
        userId: requestUserId,
        timestamp: new Date(),
        ttsLatencyMs: Date.now() - startTime,
        audioGenerated: false,
        audioQuality: 'failed',
        voiceProfile: characterId,
        element: element || 'aether'
      });

      return NextResponse.json({
        error: 'Failed to generate audio'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Oracle Voice API error:', error);

    // 📊 Track voice generation error
    const requestUserId = userId || 'demo-user';
    maiaRealtimeMonitor.trackVoiceInteraction({
      sessionId,
      userId: requestUserId,
      timestamp: new Date(),
      ttsLatencyMs: Date.now() - startTime,
      audioGenerated: false,
      audioQuality: 'failed',
      voiceProfile: characterId || 'unknown',
      element: 'aether'
    });

    return NextResponse.json({
      error: 'Voice generation failed',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Get available voice profiles
 */
export async function GET(request: NextRequest) {
  try {
    const menu = voiceService.getVoiceMenu();

    return NextResponse.json({
      success: true,
      voices: menu,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Voice menu error:', error);
    return NextResponse.json({
      error: 'Failed to get voice menu',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Clone a voice from audio
 */
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const name = formData.get('name') as string;
    const baseVoice = formData.get('baseVoice') as string || 'nova';

    if (!audioFile || !name) {
      return NextResponse.json({
        error: 'Audio file and name are required'
      }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Clone voice
    const profile = await voiceService.cloneVoice({
      sourceFile: buffer,
      name,
      baseVoice: baseVoice as any
    });

    return NextResponse.json({
      success: true,
      profile,
      message: 'Voice cloned successfully'
    });

  } catch (error: any) {
    console.error('Voice cloning error:', error);
    return NextResponse.json({
      error: 'Voice cloning failed',
      details: error.message
    }, { status: 500 });
  }
}