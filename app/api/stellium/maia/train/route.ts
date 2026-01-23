/**
 * STELLIUM MAIA TRAINING API
 *
 * Train MAIA to learn the practitioner's voice, framework, and boundaries
 * This is how MAIA becomes ensouled — native to the practice
 *
 * "Not generic AI — your apprentice"
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getPersonaById,
  updatePersona,
  recordTrainingSession,
  analyzeVoicePatterns,
} from '@/lib/stellium/personas';
import { VoicePatterns } from '@/lib/stellium/types';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

/**
 * POST /api/stellium/maia/train
 * Train MAIA with sample content
 *
 * Body:
 * - practitionerId: required
 * - personaId: required
 * - trainingType: 'voice' | 'framework' | 'boundaries' | 'conversation'
 * - content: the training material
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, personaId, trainingType, content } = body;

    if (!practitionerId || !personaId) {
      return NextResponse.json(
        { error: 'Practitioner ID and Persona ID required' },
        { status: 400 }
      );
    }

    if (!trainingType || !content) {
      return NextResponse.json(
        { error: 'Training type and content required' },
        { status: 400 }
      );
    }

    // Get current persona
    const persona = await getPersonaById(practitionerId, personaId);
    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    let trainingResult: {
      type: string;
      insights: string[];
      updates: Record<string, unknown>;
    };

    switch (trainingType) {
      case 'voice':
        trainingResult = await trainVoice(content, persona.voice_patterns as VoicePatterns);
        break;
      case 'framework':
        trainingResult = await trainFramework(content, persona.framework as unknown as Record<string, unknown>);
        break;
      case 'boundaries':
        trainingResult = await trainBoundaries(content, persona.boundaries as unknown as Record<string, unknown>);
        break;
      case 'conversation':
        trainingResult = await trainFromConversation(content, persona as unknown as Record<string, unknown>);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid training type' },
          { status: 400 }
        );
    }

    // Apply the updates
    if (Object.keys(trainingResult.updates).length > 0) {
      await updatePersona(practitionerId, personaId, trainingResult.updates);
    }

    // Record the training session
    await recordTrainingSession(practitionerId, personaId);

    // Get updated persona
    const updatedPersona = await getPersonaById(practitionerId, personaId);

    return NextResponse.json({
      success: true,
      trainingType,
      insights: trainingResult.insights,
      persona: updatedPersona,
    });
  } catch (error) {
    console.error('[Stellium MAIA Train API] Error:', error);
    return NextResponse.json(
      { error: 'Training failed' },
      { status: 500 }
    );
  }
}

/**
 * Train voice patterns from writing samples
 */
async function trainVoice(
  content: string,
  currentPatterns: VoicePatterns
): Promise<{ type: string; insights: string[]; updates: Record<string, unknown> }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are analyzing writing samples to extract voice patterns.
Return a JSON object with:
{
  "tone": "overall tone description",
  "style": "writing style description",
  "warmth_level": "distant" | "professional" | "warm" | "intimate",
  "formality": "formal" | "balanced" | "casual",
  "phrases": ["characteristic phrases they use"],
  "avoids": ["words or phrases they avoid"],
  "insights": ["observations about their communication style"]
}`,
    messages: [
      {
        role: 'user',
        content: `Analyze these writing samples to extract voice patterns:\n\n${content}`,
      },
    ],
  });

  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    // Extract JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Merge with existing patterns
    const mergedPatterns: VoicePatterns = {
      ...currentPatterns,
      tone: analysis.tone || currentPatterns.tone,
      style: analysis.style || currentPatterns.style,
      warmth_level: analysis.warmth_level || currentPatterns.warmth_level,
      formality: analysis.formality || currentPatterns.formality,
      phrases: [
        ...new Set([
          ...(currentPatterns.phrases || []),
          ...(analysis.phrases || []),
        ]),
      ].slice(0, 10),
      avoids: [
        ...new Set([
          ...(currentPatterns.avoids || []),
          ...(analysis.avoids || []),
        ]),
      ].slice(0, 10),
    };

    return {
      type: 'voice',
      insights: analysis.insights || [],
      updates: { voice_patterns: mergedPatterns },
    };
  } catch (e) {
    console.error('Failed to parse voice analysis:', e);
    return {
      type: 'voice',
      insights: ['Voice analysis completed but patterns could not be extracted'],
      updates: {},
    };
  }
}

/**
 * Train framework from theoretical content
 */
async function trainFramework(
  content: string,
  currentFramework: Record<string, unknown>
): Promise<{ type: string; insights: string[]; updates: Record<string, unknown> }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are analyzing content to understand a practitioner's theoretical framework.
Return a JSON object with:
{
  "primary": "primary approach or methodology",
  "secondary": "secondary approach if any",
  "authors": ["key authors or teachers who influence them"],
  "traditions": ["traditions or schools of thought"],
  "specialties": ["areas of specialty"],
  "insights": ["observations about their framework"]
}`,
    messages: [
      {
        role: 'user',
        content: `Analyze this content to understand the practitioner's framework:\n\n${content}`,
      },
    ],
  });

  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Merge with existing framework
    const mergedFramework = {
      ...currentFramework,
      primary: analysis.primary || currentFramework.primary,
      secondary: analysis.secondary || currentFramework.secondary,
      authors: [
        ...new Set([
          ...((currentFramework.authors as string[]) || []),
          ...(analysis.authors || []),
        ]),
      ],
      traditions: [
        ...new Set([
          ...((currentFramework.traditions as string[]) || []),
          ...(analysis.traditions || []),
        ]),
      ],
      specialties: [
        ...new Set([
          ...((currentFramework.specialties as string[]) || []),
          ...(analysis.specialties || []),
        ]),
      ],
    };

    return {
      type: 'framework',
      insights: analysis.insights || [],
      updates: { framework: mergedFramework },
    };
  } catch (e) {
    console.error('Failed to parse framework analysis:', e);
    return {
      type: 'framework',
      insights: ['Framework analysis completed but could not be extracted'],
      updates: {},
    };
  }
}

/**
 * Train boundaries from examples
 */
async function trainBoundaries(
  content: string,
  currentBoundaries: Record<string, unknown>
): Promise<{ type: string; insights: string[]; updates: Record<string, unknown> }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are analyzing content to understand a practitioner's boundaries.
Return a JSON object with:
{
  "custom_rules": ["specific boundary rules to add"],
  "insights": ["observations about their boundaries and ethics"]
}

Focus on:
- What they will and won't do
- How they handle sensitive topics
- When they refer out
- Ethical considerations`,
    messages: [
      {
        role: 'user',
        content: `Analyze this content to understand boundaries:\n\n${content}`,
      },
    ],
  });

  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Merge with existing boundaries
    const mergedBoundaries = {
      ...currentBoundaries,
      custom_rules: [
        ...new Set([
          ...((currentBoundaries.custom_rules as string[]) || []),
          ...(analysis.custom_rules || []),
        ]),
      ],
    };

    return {
      type: 'boundaries',
      insights: analysis.insights || [],
      updates: { boundaries: mergedBoundaries },
    };
  } catch (e) {
    console.error('Failed to parse boundaries analysis:', e);
    return {
      type: 'boundaries',
      insights: ['Boundaries analysis completed but could not be extracted'],
      updates: {},
    };
  }
}

/**
 * Train from a full conversation transcript
 * Extracts voice, framework, and handling patterns
 */
async function trainFromConversation(
  content: string,
  persona: Record<string, unknown>
): Promise<{ type: string; insights: string[]; updates: Record<string, unknown> }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `You are analyzing a conversation transcript to learn how a practitioner works.
Return a JSON object with:
{
  "voice_observations": {
    "phrases": ["characteristic phrases"],
    "tone": "observed tone",
    "style": "communication style"
  },
  "framework_observations": {
    "approaches_used": ["methodologies or frameworks referenced"],
    "key_concepts": ["important concepts they work with"]
  },
  "handling_patterns": {
    "how_they_reflect": "how they mirror back to clients",
    "how_they_redirect": "how they guide without prescribing",
    "how_they_close": "how they end interactions"
  },
  "insights": ["key learnings from this conversation"]
}`,
    messages: [
      {
        role: 'user',
        content: `Analyze this conversation to learn the practitioner's patterns:\n\n${content}`,
      },
    ],
  });

  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Build updates from observations
    const updates: Record<string, unknown> = {};

    // Update voice patterns
    if (analysis.voice_observations) {
      const currentVoice = (persona.voice_patterns as VoicePatterns) || {};
      updates.voice_patterns = {
        ...currentVoice,
        tone: analysis.voice_observations.tone || currentVoice.tone,
        style: analysis.voice_observations.style || currentVoice.style,
        phrases: [
          ...new Set([
            ...(currentVoice.phrases || []),
            ...(analysis.voice_observations.phrases || []),
          ]),
        ].slice(0, 10),
      };
    }

    return {
      type: 'conversation',
      insights: analysis.insights || [],
      updates,
    };
  } catch (e) {
    console.error('Failed to parse conversation analysis:', e);
    return {
      type: 'conversation',
      insights: ['Conversation analysis completed but patterns could not be extracted'],
      updates: {},
    };
  }
}
