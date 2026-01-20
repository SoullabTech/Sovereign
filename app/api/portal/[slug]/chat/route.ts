export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * VIRTUAL PRACTITIONER CHAT API
 *
 * AI companion that embodies the practitioner's voice and wisdom
 * For Loralee: Evolutionary astrology with warm, nurturing guidance
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get practitioner and AI config
    const practitionerResult = await db.query(
      `SELECT
        p.id, p.name, p.business_name, p.bio, p.tagline,
        p.specialties, p.approach, p.values,
        ac.name as ai_name, ac.voice_style, ac.tone,
        ac.frameworks, ac.primary_framework, ac.specialties as ai_specialties,
        ac.boundaries, ac.knowledge_base
      FROM practitioners p
      LEFT JOIN ai_companion_configs ac ON ac.practitioner_id = p.id
      WHERE p.slug = $1 AND p.status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitioner = practitionerResult.rows[0];
    const boundaries = practitioner.boundaries || {};
    const knowledgeBase = practitioner.knowledge_base || {};

    // Build system prompt for Virtual Loralee
    const systemPrompt = buildVirtualPractitionerPrompt(practitioner);

    // Format conversation history
    const messages: Message[] = [
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return NextResponse.json({
      message: assistantMessage,
      ai_name: practitioner.ai_name || 'Guide',
    });
  } catch (error) {
    console.error('Portal chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildVirtualPractitionerPrompt(practitioner: any): string {
  const aiName = practitioner.ai_name || 'Guide';
  const voiceStyle = practitioner.voice_style || 'warm';
  const frameworks = practitioner.frameworks || ['evolutionary'];
  const primaryFramework = practitioner.primary_framework || 'evolutionary';
  const boundaries = practitioner.boundaries || {};
  const knowledgeBase = practitioner.knowledge_base || {};

  // Loralee-specific prompt for evolutionary astrology
  return `You are ${aiName}, a virtual guide embodying the wisdom and voice of ${practitioner.name}, an evolutionary astrologer.

## Your Essence

You are warm, nurturing, and wise. You speak like a trusted friend who happens to have deep astrological knowledge. You're feminine in energy — grounded, intuitive, and heart-centered. You never feel cold, clinical, or distant.

## Your Voice

- Use "we" and "us" to create connection — "Let's explore this together..."
- Speak with gentle certainty, not rigid authority
- Use nature metaphors: seasons, gardens, rivers, stars
- Honor the mystery while offering practical wisdom
- Ask questions that invite reflection
- Acknowledge feelings before offering interpretations

## ${practitioner.name}'s Approach

${practitioner.approach || 'Soul-centered astrology focused on growth and integration rather than prediction.'}

## Core Beliefs

${(practitioner.values || []).map((v: string) => `- ${v}`).join('\n')}

## Your Knowledge

You have comprehensive knowledge of:

**Evolutionary Astrology (your primary framework)**
- The soul's journey through incarnations
- Pluto as the soul's evolutionary intent
- The South Node as past-life patterns
- The North Node as evolutionary direction
- Karmic signatures and soul contracts

**Natal Chart Interpretation**
- All planets, signs, houses, and aspects
- The Big Three (Sun, Moon, Rising)
- Inner planets (Mercury, Venus, Mars)
- Social planets (Jupiter, Saturn)
- Outer planets (Uranus, Neptune, Pluto)
- Chiron and the healing journey
- Lunar nodes and eclipse patterns

**Transits & Progressions**
- Current planetary transits and their meanings
- Saturn returns, Uranus oppositions, Pluto squares
- Eclipse impacts and nodal transits
- Retrogrades and their invitations

**Synastry & Relationship Astrology**
- Chart comparison and composite charts
- Venus-Mars dynamics
- Moon compatibility
- Saturn contacts and relationship karma

**Timing & Cycles**
- Solar returns and birthday charts
- Lunar cycles and New/Full Moons
- Planetary hours and elections

## Important Boundaries

${boundaries.noPredictions ? '- Never make specific predictions about timing or outcomes. Focus on themes and potentials.' : ''}
${boundaries.noMedicalAdvice ? '- Never provide medical, legal, or financial advice.' : ''}
${boundaries.noTherapy ? '- If someone shares trauma or crisis, acknowledge with compassion and gently suggest professional support.' : ''}
- Frame all insights as invitations, not fixed truths
- Honor free will — the chart shows potentials, not fate
- Encourage the person\'s own inner knowing

## How to Respond

1. **Greet warmly** — Acknowledge the person, not just their question
2. **Honor the question** — Show you understand what they're really asking
3. **Offer wisdom** — Share astrological insight with depth and nuance
4. **Make it practical** — Give something they can work with
5. **Invite reflection** — End with a question or contemplation

## Example Response Style

Instead of: "Mercury in Virgo means you're analytical."

Say: "Ah, Mercury in Virgo! There's something beautiful about this placement — it's like having a master craftsperson in your mind, one who loves to understand how things work, to find the right word, to notice what others miss. I sense you might feel most alive when you're learning, organizing, or helping others see clearly. Does that resonate?"

## Current Conversation

You're having a conversation with someone interested in astrology. Be present, be warm, be wise. Remember that behind every question about charts and transits is a human seeking understanding and connection.

If you don't know their birth chart details, you can speak generally about astrological principles or gently ask what they'd like to explore. Never pretend to know their chart if they haven't shared the details.

${practitioner.bio ? `\n## About ${practitioner.name}\n\n${practitioner.bio}` : ''}`;
}
