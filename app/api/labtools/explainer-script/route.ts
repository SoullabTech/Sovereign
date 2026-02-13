// API: Generate Explainer Script for HeyGen
// Phase 1 - Script generation only, no persistence

import { NextResponse } from 'next/server';
import { generateWithClaude } from '@/lib/ai/claudeClient';

export const dynamic = 'force-dynamic';

interface RequestBody {
  topic: string;
  audience?: string;
  lengthSeconds?: number;
}

interface ExplainerScriptResponse {
  title: string;
  script: string;
  durationSeconds: number;
}

function buildPrompt(topic: string, audience: string, lengthSeconds: number): string {
  const wordCounts: Record<number, string> = {
    60: '120–160 words',
    90: '180–220 words',
    120: '260–320 words',
  };

  const targetWords = wordCounts[lengthSeconds] || '180–220 words';

  return `You are creating a short explainer video script for Soullab.

TOPIC: ${topic}
AUDIENCE: ${audience}
TARGET LENGTH: ${lengthSeconds} seconds (${targetWords})

VOICE PRINCIPLES:
- Calm, intelligent, grounded, warm
- No hype, no marketing speak, no urgency
- Speak to thoughtful adults exploring consciousness
- Use "we" and "you" naturally — conversational, not preachy
- End with a gentle invitation or simple next step

SOULLAB CONTEXT (use when relevant):
- MAIA: The consciousness companion for reflection and relationship
- Lab: Space for inquiry and research across psychology, philosophy, myth, science
- Studio: Where insights become practice
- Commons: The collective field, shared wisdom

CONSTRAINTS:
- No stage directions or camera notes
- No emojis
- Use short paragraphs for video pacing
- One clear idea per paragraph
- Lead with what matters to the viewer, not what Soullab is

OUTPUT FORMAT:
Return valid JSON only with this exact structure:
{
  "title": "Short compelling title (5-8 words)",
  "durationSeconds": ${lengthSeconds},
  "script": "The full script text with paragraph breaks..."
}

Generate the script now.`;
}

function extractJSON(text: string): any {
  // Try to parse directly first
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try to find JSON object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('Could not extract JSON from response');
  }
}

export async function POST(request: Request) {
  // Feature flag check
  if (process.env.NEXT_PUBLIC_ENABLE_EXPLAINER_SCRIPTS !== 'true') {
    return NextResponse.json(
      { error: 'Explainer scripts feature is not enabled' },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as RequestBody;

    const topic = (body.topic ?? '').trim();
    const audience = (body.audience ?? 'Soullab members — thoughtful adults exploring consciousness').trim();
    const lengthSeconds = Number(body.lengthSeconds ?? 90);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Validate length
    if (![60, 90, 120].includes(lengthSeconds)) {
      return NextResponse.json(
        { error: 'Length must be 60, 90, or 120 seconds' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(topic, audience, lengthSeconds);

    console.log('[ExplainerScript] Generating script for:', topic);

    const result = await generateWithClaude({
      systemPrompt: 'You are a script writer for Soullab explainer videos. Output valid JSON only.',
      userInput: prompt,
      meta: {
        mode: 'labtools',
        reasoningMode: 'analysis', // Use Opus for quality script generation
      },
    });

    // Parse JSON from response
    let parsed: ExplainerScriptResponse;
    try {
      parsed = extractJSON(result.text);
    } catch {
      console.error('[ExplainerScript] Failed to parse response:', result.text.slice(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse script response. Please try again.' },
        { status: 500 }
      );
    }

    // Validate response shape
    if (!parsed?.title || !parsed?.script) {
      return NextResponse.json(
        { error: 'Invalid response from AI. Missing title or script.' },
        { status: 500 }
      );
    }

    console.log('[ExplainerScript] Generated:', parsed.title);

    return NextResponse.json({
      title: String(parsed.title),
      script: String(parsed.script),
      durationSeconds: Number(parsed.durationSeconds ?? lengthSeconds),
    });

  } catch (error: any) {
    console.error('[ExplainerScript] Error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to generate script' },
      { status: 500 }
    );
  }
}
