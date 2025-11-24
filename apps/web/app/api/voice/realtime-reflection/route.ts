import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

interface RealtimeReflectionRequest {
  userId: string;
  mode: string;
  element: string;
  content: string;
  enableVoiceResponse: boolean;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

const ELEMENT_QUALITIES: Record<string, string> = {
  fire: 'passionate, transformative, and energizing',
  water: 'flowing, emotional, and intuitive',
  earth: 'grounded, stable, and nurturing',
  air: 'clear, intellectual, and liberating',
  aether: 'transcendent, mystical, and integrative',
};

export async function POST(req: NextRequest) {
  try {
    const body: RealtimeReflectionRequest = await req.json();
    const { userId, mode, element, content, enableVoiceResponse, voice } = body;

    if (!content || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'Content too short for reflection' },
        { status: 400 }
      );
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      return NextResponse.json(
        { text: 'I hear you. Continue exploring...', symbols: [] },
        { status: 200 }
      );
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const elementQuality = ELEMENT_QUALITIES[element] || 'balanced';

    const prompt = `You are MAIA, an AI voice companion for journaling. The user is speaking in ${mode} mode, channeling ${element} energy (${elementQuality}).

Their words: "${content}"

Provide a brief, warm reflection (1-2 sentences) that:
1. Acknowledges what they shared
2. Offers gentle insight or a question to deepen
3. Matches the ${element} energy

Keep it conversational and supportive. This is spoken dialogue, not written text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: prompt
      }],
    });

    const reflectionText = message.content[0].type === 'text'
      ? message.content[0].text
      : 'I hear you...';

    const response: any = {
      text: reflectionText,
      symbols: [],
    };

    if (enableVoiceResponse) {
      const openaiKey = process.env.OPENAI_API_KEY;

      if (openaiKey) {
        try {
          const openai = new OpenAI({ apiKey: openaiKey });

          const mp3Response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: voice || 'shimmer',
            input: reflectionText,
            speed: 0.95,
          });

          const buffer = Buffer.from(await mp3Response.arrayBuffer());
          const base64Audio = buffer.toString('base64');
          response.audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        } catch (error) {
          console.error('TTS generation failed:', error);
        }
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Realtime reflection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate reflection' },
      { status: 500 }
    );
  }
}