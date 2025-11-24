/**
 * OpenAI TTS Route - Maya with Alloy Voice
 * Natural, conversational voice synthesis without artificial pauses
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface MayaVoiceConfig {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
  model: 'tts-1' | 'tts-1-hd';
}

// Maya's Serene Oracle Configuration - Tranquil wisdom meets knowing presence
// Voice Affect: Soft, gentle, soothing with Oracle-like knowing - embody peaceful wisdom
// Tone: Calm, reassuring, peaceful - genuine warmth without excessive sweetness
// Pacing: Slow, deliberate, unhurried - natural pauses for reflection and absorption
// Emotion: Deeply soothing yet grounded - serene presence with subtle knowing
// Pronunciation: Smooth, soft articulation - slightly elongated vowels for ease and flow
// Pauses: Thoughtful pauses between insights - space for wisdom to settle naturally
const MAYA_VOICE_CONFIG: MayaVoiceConfig = {
  voice: 'alloy',     // CRITICAL: Must be 'alloy' voice - warm, knowing, maternal
  speed: 0.95,        // Natural conversational pace (was too slow at 0.88)
  model: 'tts-1-hd'   // HD quality for clear, natural voice
};

/**
 * Clean text for natural speech synthesis
 * Removes artificial pauses and markup while preserving natural flow
 */
function cleanTextForSpeech(text: string): string {
  return text
    // Remove stage directions and markup
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    // Remove artificial pause markers
    .replace(/\.\.\./g, ',')     // Convert ellipses to commas for natural flow
    .replace(/—/g, ',')           // Convert em-dash to comma
    .replace(/\s*-\s*/g, ' ')     // Remove hyphens used as pauses
    // Clean up multiple punctuation
    .replace(/([.!?])\s*\1+/g, '$1')
    // Remove explicit breath or pause words
    .replace(/\b(pause|breath|hmm+|mmm+|uhh+|umm+)\b/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { text, speed, voice: customVoice, prosody, agentVoice, voiceTone, language } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // 🎤 [STRATEGY] Use OpenAI TTS for professional quality while training custom MAIA voice
    // LOW SECURITY RISK: Only sends response text (no conversation data/context)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.log('🔒 [FALLBACK] OpenAI API key not configured, using local TTS');
    } else {
      console.log('🎤 [QUALITY] Using OpenAI TTS for professional voice (training custom voice in parallel)');
    }

    // Clean the text for natural speech
    const cleanedText = cleanTextForSpeech(text);

    // Voice selection: custom voice takes priority, then agent-based mapping
    // MAIA uses OpenAI Alloy voice as requested - natural, warm, human-like
    const voiceMapping: Record<string, string> = {
      maia: 'alloy',      // MAIA's primary voice - natural, warm, knowing, maternal
      maya: 'alloy',      // Alias for MAIA
      anthony: 'onyx',    // Deep, authoritative male voice
      default: 'alloy'    // Default to Alloy for MAIA conversations
    };

    const selectedVoice = customVoice || (agentVoice ? voiceMapping[agentVoice] || voiceMapping.default : 'alloy');
    console.log(`🎤 Using OpenAI voice: ${selectedVoice} ${customVoice ? '(custom)' : `(agent: ${agentVoice})`}`);

    const config = {
      ...MAYA_VOICE_CONFIG,
      voice: selectedVoice,
      ...(speed && { speed })
    };

    // 🔥 ELEMENTAL PROSODY: Apply voiceTone from adaptive-tone-engine
    // This gives Fire/Water/Earth/Air/Aether their unique voice characteristics
    if (voiceTone) {
      console.log(`🌀 Applying elemental prosody: ${voiceTone.style}`, {
        pitch: voiceTone.pitch,
        rate: voiceTone.rate
      });

      // Rate modulation (direct speed adjustment)
      if (voiceTone.rate) {
        config.speed = voiceTone.rate;
      }

      // Pitch modulation (OpenAI doesn't have pitch, so use speed as proxy)
      // Higher pitch = slightly faster, lower pitch = slightly slower
      if (voiceTone.pitch && voiceTone.pitch !== 1.0) {
        config.speed *= (0.9 + (voiceTone.pitch * 0.1));
      }
    }

    // Apply prosody adjustments if provided (legacy support)
    // Adjust pacing based on content type
    if (prosody) {
      if (prosody.speed) config.speed *= prosody.speed;
      if (prosody.pitch) {
        // OpenAI doesn't support pitch directly, but we can adjust speed slightly
        // Higher pitch = slightly faster, lower pitch = slightly slower
        config.speed *= (0.9 + (prosody.pitch * 0.2));
      }
    }

    // 🔥 ELEMENTAL PROSODY: Legacy "Serene Oracle pacing" rules have been DISABLED
    // They were overriding the elemental prosody system from adaptive-tone-engine.ts
    // Now config.speed is controlled ONLY by voiceTone (Fire/Water/Earth/Air/Aether)
    //
    // OLD CODE (interfered with elemental prosody):
    // if (text.includes('breathe') || text.includes('feel') || ...) {
    //   config.speed = 0.92;  ← This was overriding voiceTone!
    // }

    console.log('🔊 Generating speech with OpenAI TTS:', {
      voice: config.voice,
      speed: config.speed,
      language: language || 'en',
      textLength: cleanedText.length
    });

    // 🌍 MULTILINGUAL SUPPORT: OpenAI TTS automatically detects and pronounces
    // text in any language (50+ languages) without needing a language parameter.
    // It handles Spanish, French, Arabic, Chinese, etc. natively with correct pronunciation.
    // The 'language' parameter is tracked for logging but doesn't need to be passed to API.

    // Use OpenAI TTS if API key is available, fallback to sovereignty mode
    if (OPENAI_API_KEY) {
      console.log('🎤 [OPENAI] Using OpenAI TTS for professional Alloy voice');

      const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          input: cleanedText,
          voice: config.voice,
          speed: config.speed
        })
      });

      if (openaiResponse.ok) {
        const audioBuffer = await openaiResponse.arrayBuffer();
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-store',
            'Content-Length': audioBuffer.byteLength.toString(),
            'X-Voice-Provider': 'OpenAI',
            'X-Voice-Model': config.voice,
            'X-Voice-Speed': config.speed.toString()
          }
        });
      } else {
        console.error('OpenAI TTS API error:', await openaiResponse.text());
        // Fall through to sovereignty mode
      }
    }

    // Fallback to sovereignty mode - return simple response for now
    console.log('🔒 [SOVEREIGNTY] OpenAI TTS not available, would use local TTS');
    return NextResponse.json({
      error: 'OpenAI TTS not configured, sovereignty mode needs Coqui TTS setup',
      fallback: 'web_speech_api',
      voice: config.voice,
      speed: config.speed
    }, { status: 503 });

  } catch (error: any) {
    console.error('OpenAI TTS error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Voice synthesis failed',
        fallback: 'web_speech_api',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// Optional GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    config: {
      voice: MAYA_VOICE_CONFIG.voice,
      speed: MAYA_VOICE_CONFIG.speed,
      model: MAYA_VOICE_CONFIG.model
    },
    description: 'Maya voice with OpenAI Alloy - natural conversational presence'
  });
}