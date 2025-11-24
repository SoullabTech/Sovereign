import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { 
      text, 
      chunkId,
      element = 'aether',
      voiceEngine = 'auto',
      useCSM = true,
      fallbackEnabled = true
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // Determine voice engine priority
    let engineToUse = voiceEngine;
    if (voiceEngine === 'auto') {
      engineToUse = useCSM ? 'sesame' : 'elevenlabs';
    }


    let audioData = null;
    let audioUrl = null;
    let engine = engineToUse;
    let duration = 0;

    // Try primary engine
    if (engineToUse === 'sesame' && useCSM) {
      try {
        const sesameResult = await generateSesameAudio(text, element);
        if (sesameResult.success) {
          audioData = sesameResult.audioData;
          audioUrl = await saveAudioChunk(audioData, chunkId);
          duration = sesameResult.duration || 0;
        } else if (fallbackEnabled) {
          engineToUse = 'elevenlabs';
        }
      } catch (error) {
        console.error('Sesame generation failed:', error);
        if (fallbackEnabled) {
          engineToUse = 'elevenlabs';
        }
      }
    }

    // Try ElevenLabs as primary or fallback
    if (engineToUse === 'elevenlabs' && !audioData) {
      try {
        const elevenLabsResult = await generateElevenLabsAudio(text);
        if (elevenLabsResult.success) {
          audioData = elevenLabsResult.audioData;
          audioUrl = await saveAudioChunk(audioData, chunkId);
          duration = elevenLabsResult.duration || 0;
          engine = 'elevenlabs';
        }
      } catch (error) {
        console.error('ElevenLabs generation failed:', error);
      }
    }

    if (audioUrl || audioData) {
      return NextResponse.json({
        success: true,
        chunkId,
        audioUrl,
        audioData: audioData ? Buffer.from(audioData).toString('base64') : null,
        engine,
        duration,
        text: text.slice(0, 100) // Return first 100 chars for reference
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate audio',
        chunkId
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Stream chunk error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Audio generation failed'
    }, { status: 500 });
  }
}

// Sesame audio generation
async function generateSesameAudio(text: string, element: string) {
  try {
    const sesameUrl = process.env.SESAME_API_URL || 'http://localhost:5000';
    const response = await fetch(`${sesameUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tts-1-hd',
        voice: getElementVoice(element),
        input: text,
        response_format: 'mp3',
        speed: 0.95
      })
    });

    if (!response.ok) {
      throw new Error(`Sesame responded with ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return {
      success: true,
      audioData: new Uint8Array(audioBuffer),
      duration: estimateAudioDuration(text)
    };
  } catch (error) {
    console.error('Sesame generation error:', error);
    return { success: false, error };
  }
}

// ElevenLabs audio generation
async function generateElevenLabsAudio(text: string) {
  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam voice
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.85,
            style: 0.4,
            use_speaker_boost: true
          },
          optimize_streaming_latency: 3, // Optimize for low latency
          output_format: 'mp3_44100_128'
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs responded with ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return {
      success: true,
      audioData: new Uint8Array(audioBuffer),
      duration: estimateAudioDuration(text)
    };
  } catch (error) {
    console.error('ElevenLabs generation error:', error);
    return { success: false, error };
  }
}

// Save audio chunk to disk
async function saveAudioChunk(audioData: Uint8Array, chunkId: string): Promise<string> {
  try {
    // Create audio directory if it doesn&apos;t exist
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'chunks');
    await fs.mkdir(audioDir, { recursive: true });

    // Save audio file
    const filename = `${chunkId}.mp3`;
    const filepath = path.join(audioDir, filename);
    await fs.writeFile(filepath, audioData);

    // Return public URL
    return `/audio/chunks/${filename}`;
  } catch (error) {
    console.error('Error saving audio chunk:', error);
    throw error;
  }
}

// Get voice based on element
function getElementVoice(element: string): string {
  const voiceMap: Record<string, string> = {
    air: 'nova',
    fire: 'alloy',
    water: 'shimmer',
    earth: 'onyx',
    aether: 'nova'
  };
  return voiceMap[element.toLowerCase()] || 'nova';
}

// Estimate audio duration based on text length
function estimateAudioDuration(text: string): number {
  // Rough estimate: ~150 words per minute
  const words = text.split(/\s+/).length;
  return (words / 150) * 60;
}