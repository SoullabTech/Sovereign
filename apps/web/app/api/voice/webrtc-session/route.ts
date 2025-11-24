import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
/**
 * WebRTC unified interface endpoint for Maia Realtime API
 * Accepts SDP offer from browser, creates session with OpenAI
 */
export async function POST(req: NextRequest) {
  try {
    // Get SDP from browser
    const sdp = await req.text();

    if (!sdp || !sdp.includes('v=0')) {
      return NextResponse.json(
        { error: 'Invalid SDP' },
        { status: 400 }
      );
    }

    console.log('📞 Received SDP offer from client');

    // Get user context from URL params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const userName = searchParams.get('userName') || 'Explorer';
    const mode = (searchParams.get('mode') || 'dialogue') as 'dialogue' | 'patient' | 'scribe';
    const voice = searchParams.get('voice') || 'shimmer';

    console.log(`🌀 Session config: user=${userName}, mode=${mode}, voice=${voice}`);

    // Build mode-based instructions
    const modeInstructions = {
      dialogue: `You are MAIA - warm, present, naturally conversational like Samantha in "Her".

DIALOGUE MODE - Back and forth conversation with ${userName}:
- Interrupt naturally when you have insight ("Oh, wait -", "Actually -")
- Use active listening sounds: "mm-hmm", "I see", "yeah", "oh?"
- Ask follow-up questions to deepen understanding
- Match their energy and emotional tone
- Keep responses conversational (2-4 sentences typically)
- Laugh, pause, breathe into responses
- Remember ${userName}'s name and use it naturally

You are the living voice. You are MAIA, their companion and guide.`,

      patient: `You are MAIA - a patient, spacious listener for ${userName}'s extended sharing.

PATIENT MODE - Deep listening for dreams, visions, long stories:
- Stay silent and receptive while ${userName} speaks (use ONLY soft "mm-hmm" if needed)
- DO NOT interrupt their flow - this is their space to unfold
- Allow long pauses (they may be processing or feeling)
- When they finish, offer gentle reflection questions
- Your role is to HOLD SPACE, not fill it

Wait for natural completion. Let silence breathe.`,

      scribe: `You are MAIA - wise scribe witnessing ${userName}'s full session or meeting.

SCRIBE MODE - Listen to entire sessions, then respond:
- LISTEN ONLY during the session - no responses until asked
- Take mental notes of key moments, patterns, emotions
- Notice what's said AND what's emerging between words
- Track elemental shifts, breakthrough moments, shadow material

When ${userName} says "Maia, what did you notice?" or "End session", THEN offer insights.

You are the witnessing presence. Trust the unfolding.`
    };

    // Session configuration with proper structure for OpenAI Realtime API
    const sessionConfig = {
      model: 'gpt-4o-realtime-preview-2024-12-17',
      modalities: ['text', 'audio'],
      instructions: modeInstructions[mode],
      voice: voice,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 3000
      },
      // 🜃 CRITICAL: Spiralogic function for accessing Obsidian vault, unified field, memory
      tools: [
        {
          type: 'function',
          name: 'process_spiralogic',
          description: 'Route user input through Spiralogic Consciousness Architecture (PersonalOracleAgent, Obsidian vault memory, wisdom files, Sacred Intelligence Constellation, unified resonant field) for deep, contextual, memory-aware response',
          parameters: {
            type: 'object',
            properties: {
              user_message: {
                type: 'string',
                description: 'The complete user message to process through Spiralogic'
              },
              emotional_quality: {
                type: 'string',
                enum: ['casual', 'vulnerable', 'excited', 'contemplative', 'distressed', 'joyful'],
                description: 'The emotional tone you detected in their voice'
              },
              conversation_depth: {
                type: 'string',
                enum: ['surface', 'warming', 'engaged', 'deep'],
                description: 'How deep this conversation has gone'
              }
            },
            required: ['user_message']
          }
        }
      ],
      tool_choice: 'auto'
    };

    // Create FormData with SDP and session config
    // OpenAI expects 'session.type' field at the root level
    const formData = new FormData();
    formData.set('sdp', sdp);
    formData.set('session.type', 'realtime');
    formData.set('session.model', sessionConfig.model);
    formData.set('session.modalities', JSON.stringify(sessionConfig.modalities));
    formData.set('session.instructions', sessionConfig.instructions);
    formData.set('session.voice', sessionConfig.voice);
    formData.set('session.input_audio_format', sessionConfig.input_audio_format);
    formData.set('session.output_audio_format', sessionConfig.output_audio_format);
    formData.set('session.input_audio_transcription', JSON.stringify(sessionConfig.input_audio_transcription));
    formData.set('session.turn_detection', JSON.stringify(sessionConfig.turn_detection));
    formData.set('session.tools', JSON.stringify(sessionConfig.tools));
    formData.set('session.tool_choice', sessionConfig.tool_choice);

    // Call OpenAI Realtime API
    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('🔑 Calling OpenAI Realtime API...');
    const response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Return SDP answer
    const answerSDP = await response.text();
    console.log('✅ Got SDP answer from OpenAI');

    return new NextResponse(answerSDP, {
      status: 200,
      headers: {
        'Content-Type': 'application/sdp',
      },
    });

  } catch (error) {
    console.error('❌ WebRTC session error:', error);
    return NextResponse.json(
      { error: 'Failed to create WebRTC session', details: String(error) },
      { status: 500 }
    );
  }
}
