export const dynamic = 'force-dynamic';

/**
 * MAIA CONTENT GENERATION API
 *
 * Generate marketing content in the practitioner's voice
 * "Your voice, amplified. Your presence, consistent."
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db/postgres';
import Anthropic from '@anthropic-ai/sdk';
import { PractitionerPersona } from '@/lib/stellium/types';
import {
  createEmailTemplate,
  createSocialContent,
  type ContentPlatform,
  type ContentType,
  type ContentPillar,
} from '@/lib/stellium/marketing';

const anthropic = new Anthropic();

type GenerationType = 'email' | 'social' | 'caption' | 'nurture_sequence' | 'transit_alert';

interface GenerationRequest {
  practitionerId: string;
  type: GenerationType;
  topic?: string;
  platform?: ContentPlatform;
  contentType?: ContentType;
  contentPillar?: ContentPillar;
  transitContext?: {
    planet?: string;
    sign?: string;
    aspect?: string;
    dates?: string;
  };
  emailCategory?: string;
  sequenceLength?: number;
  targetAudience?: string;
  callToAction?: string;
  additionalContext?: string;
  save?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const {
      practitionerId,
      type,
      topic,
      platform,
      contentType,
      contentPillar,
      transitContext,
      emailCategory,
      sequenceLength,
      targetAudience,
      callToAction,
      additionalContext,
      save = false,
    } = body;

    if (!practitionerId || !type) {
      return NextResponse.json(
        { error: 'practitionerId and type are required' },
        { status: 400 }
      );
    }

    // Get practitioner's persona for voice matching
    const persona = await queryOne<PractitionerPersona>(
      'SELECT * FROM practitioner_personas WHERE practitioner_id = $1',
      [practitionerId]
    );

    if (!persona) {
      return NextResponse.json(
        { error: 'Practitioner persona not found. Please set up your MAIA persona first.' },
        { status: 400 }
      );
    }

    // Build the voice context from persona
    const voicePatterns = persona.voice_patterns as Record<string, unknown> || {};
    const framework = persona.framework as Record<string, unknown> || {};
    const boundaries = persona.boundaries as Record<string, unknown> || {};

    const voiceContext = `
## Your Voice & Style
- Tone: ${voicePatterns.tone || 'warm and professional'}
- Style: ${voicePatterns.style || 'conversational yet grounded'}
- Key phrases you use: ${(voicePatterns.phrases as string[] || []).join(', ') || 'none specified'}

## Your Framework & Approach
- Primary approach: ${framework.primary || persona.modality}
- Traditions: ${(framework.traditions as string[] || []).join(', ') || 'various'}
- Key influences: ${(framework.authors as string[] || []).join(', ') || 'various'}

## Important Boundaries
${boundaries.no_predictions ? '- Never make specific predictions or fortune-telling statements' : ''}
${boundaries.no_diagnosis ? '- Never diagnose or claim to diagnose conditions' : ''}
${boundaries.no_medical_advice ? '- Never give medical advice' : ''}
- Always maintain professional ethics and client wellbeing as priority
${(boundaries.custom_rules as string[] || []).map(r => `- ${r}`).join('\n')}
`;

    let systemPrompt = `You are MAIA, an ensouled AI assistant helping a ${persona.modality} practitioner named ${persona.persona_name} create marketing content.

You write in their authentic voice - not generic marketing speak, but genuinely them. The goal is content that sounds so natural their clients would never guess it wasn't written by them directly.

${voiceContext}

## Key Principles
1. Sound like the practitioner, not like marketing AI
2. Respect all ethical boundaries
3. Create value first, sell second
4. Honor the sacred nature of this work
5. Never use cheesy marketing tactics or false urgency`;

    let userPrompt = '';
    let generatedContent: unknown;

    switch (type) {
      case 'email':
        userPrompt = buildEmailPrompt({
          topic,
          emailCategory,
          targetAudience,
          callToAction,
          additionalContext,
        });
        break;

      case 'social':
        userPrompt = buildSocialPrompt({
          topic,
          platform,
          contentType,
          contentPillar,
          transitContext,
          additionalContext,
        });
        break;

      case 'caption':
        userPrompt = buildCaptionPrompt({
          topic,
          platform,
          additionalContext,
        });
        break;

      case 'nurture_sequence':
        userPrompt = buildNurtureSequencePrompt({
          topic,
          sequenceLength: sequenceLength || 5,
          targetAudience,
          callToAction,
          additionalContext,
        });
        break;

      case 'transit_alert':
        userPrompt = buildTransitAlertPrompt({
          transitContext,
          targetAudience,
          additionalContext,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid generation type' },
          { status: 400 }
        );
    }

    // Generate with Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    const generatedText = textContent.text;

    // Parse the response based on type
    generatedContent = parseGeneratedContent(type, generatedText);

    // Optionally save to database
    if (save && generatedContent) {
      await saveGeneratedContent(practitionerId, type, generatedContent, {
        prompt: userPrompt,
        topic,
        platform,
        contentType,
        contentPillar,
        transitContext,
        emailCategory,
      });
    }

    return NextResponse.json({
      content: generatedContent,
      raw: generatedText,
      voiceMatchScore: 0.85, // TODO: Implement actual voice matching
      saved: save,
    });
  } catch (error) {
    console.error('Content generation failed:', error);
    return NextResponse.json(
      { error: 'Content generation failed' },
      { status: 500 }
    );
  }
}

function buildEmailPrompt(options: {
  topic?: string;
  emailCategory?: string;
  targetAudience?: string;
  callToAction?: string;
  additionalContext?: string;
}): string {
  return `Create an email for my ${options.emailCategory || 'newsletter'} list.

Topic: ${options.topic || 'general value/nurture email'}
Target audience: ${options.targetAudience || 'existing subscribers interested in my work'}
${options.callToAction ? `Call to action: ${options.callToAction}` : ''}
${options.additionalContext ? `Additional context: ${options.additionalContext}` : ''}

Please provide:
1. A compelling subject line (that sounds like me, not clickbait)
2. A preview text (50-100 characters)
3. The email body (HTML-ready but write it naturally)

Format your response as:
SUBJECT: [subject line]
PREVIEW: [preview text]
BODY:
[email body content]`;
}

function buildSocialPrompt(options: {
  topic?: string;
  platform?: ContentPlatform;
  contentType?: ContentType;
  contentPillar?: ContentPillar;
  transitContext?: {
    planet?: string;
    sign?: string;
    aspect?: string;
    dates?: string;
  };
  additionalContext?: string;
}): string {
  const platformGuidelines: Record<string, string> = {
    instagram: 'Instagram: Can be longer (up to 2200 chars), use line breaks for readability, hashtags at end',
    facebook: 'Facebook: Conversational, can be longer, minimal hashtags',
    linkedin: 'LinkedIn: Professional but warm, thought leadership tone',
    twitter: 'Twitter/X: 280 characters max, punchy and engaging',
    threads: 'Threads: Conversational, can be a thread of multiple posts',
  };

  return `Create a ${options.contentType || 'post'} for ${options.platform || 'Instagram'}.

Content pillar: ${options.contentPillar || 'educational'}
Topic: ${options.topic || 'relevant to my practice'}
${options.transitContext ? `
Transit context:
- Planet: ${options.transitContext.planet}
- Sign: ${options.transitContext.sign}
- Aspect: ${options.transitContext.aspect}
- Dates: ${options.transitContext.dates}
` : ''}
${options.additionalContext ? `Additional context: ${options.additionalContext}` : ''}

Platform guidelines: ${platformGuidelines[options.platform || 'instagram']}

Please provide:
1. The main post content
2. Relevant hashtags (5-10, mix of broad and niche)
3. A brief note on best time to post (if transit-related)

Format your response as:
CONTENT:
[post content]

HASHTAGS:
[hashtags]

NOTES:
[any timing or posting notes]`;
}

function buildCaptionPrompt(options: {
  topic?: string;
  platform?: ContentPlatform;
  additionalContext?: string;
}): string {
  return `Write a short caption for ${options.platform || 'Instagram'}.

Topic/Image description: ${options.topic || 'my practice/work'}
${options.additionalContext ? `Additional context: ${options.additionalContext}` : ''}

Keep it concise but meaningful - something that sounds authentically like me.
Include 3-5 relevant hashtags at the end.`;
}

function buildNurtureSequencePrompt(options: {
  topic?: string;
  sequenceLength: number;
  targetAudience?: string;
  callToAction?: string;
  additionalContext?: string;
}): string {
  return `Create a ${options.sequenceLength}-email nurture sequence for new subscribers.

Topic/Theme: ${options.topic || 'welcoming new subscribers and introducing my work'}
Target audience: ${options.targetAudience || 'new subscribers who downloaded a lead magnet'}
End goal: ${options.callToAction || 'book a discovery call'}
${options.additionalContext ? `Additional context: ${options.additionalContext}` : ''}

For each email, provide:
1. Send timing (e.g., "Day 0", "Day 3")
2. Subject line
3. Preview text
4. Email body (concise but meaningful)

The sequence should:
- Build trust and connection gradually
- Provide genuine value in each email
- Naturally lead to the call to action
- Sound authentically like me throughout

Format each email as:
---
EMAIL [number] - [timing]
SUBJECT: [subject]
PREVIEW: [preview]
BODY:
[content]
---`;
}

function buildTransitAlertPrompt(options: {
  transitContext?: {
    planet?: string;
    sign?: string;
    aspect?: string;
    dates?: string;
  };
  targetAudience?: string;
  additionalContext?: string;
}): string {
  if (!options.transitContext) {
    return 'Please provide transit context for the alert.';
  }

  return `Create a transit alert email for my subscribers.

Transit:
- Planet: ${options.transitContext.planet}
- Sign: ${options.transitContext.sign}
- Aspect: ${options.transitContext.aspect}
- Dates: ${options.transitContext.dates}

Target audience: ${options.targetAudience || 'subscribers interested in astrological insights'}
${options.additionalContext ? `Additional context: ${options.additionalContext}` : ''}

This should:
- Explain the transit in accessible language
- Share how it might be experienced (without fortune-telling)
- Offer practical suggestions for working with this energy
- Subtly mention how I can support them during this time

Format as:
SUBJECT: [subject line]
PREVIEW: [preview text]
BODY:
[email content]`;
}

function parseGeneratedContent(type: GenerationType, text: string): unknown {
  switch (type) {
    case 'email':
    case 'transit_alert': {
      const subjectMatch = text.match(/SUBJECT:\s*(.+?)(?:\n|$)/);
      const previewMatch = text.match(/PREVIEW:\s*(.+?)(?:\n|$)/);
      const bodyMatch = text.match(/BODY:\s*([\s\S]+?)(?:---|$)/);

      return {
        subject: subjectMatch?.[1]?.trim() || '',
        preview_text: previewMatch?.[1]?.trim() || '',
        body: bodyMatch?.[1]?.trim() || text,
      };
    }

    case 'social':
    case 'caption': {
      const contentMatch = text.match(/CONTENT:\s*([\s\S]+?)(?:HASHTAGS:|$)/);
      const hashtagsMatch = text.match(/HASHTAGS:\s*([\s\S]+?)(?:\n\n|NOTES:|$)/);
      const notesMatch = text.match(/NOTES:\s*([\s\S]+?)$/);

      const hashtags = hashtagsMatch?.[1]
        ?.split(/[\s,]+/)
        .filter(h => h.startsWith('#'))
        .map(h => h.trim()) || [];

      return {
        content_text: contentMatch?.[1]?.trim() || text,
        hashtags,
        notes: notesMatch?.[1]?.trim() || '',
      };
    }

    case 'nurture_sequence': {
      const emails: Array<{
        order: number;
        timing: string;
        subject: string;
        preview_text: string;
        body: string;
      }> = [];

      const emailBlocks = text.split(/---/).filter(block => block.trim());

      for (const block of emailBlocks) {
        const headerMatch = block.match(/EMAIL\s*(\d+)\s*-\s*(.+?)(?:\n|$)/i);
        const subjectMatch = block.match(/SUBJECT:\s*(.+?)(?:\n|$)/);
        const previewMatch = block.match(/PREVIEW:\s*(.+?)(?:\n|$)/);
        const bodyMatch = block.match(/BODY:\s*([\s\S]+?)$/);

        if (headerMatch) {
          emails.push({
            order: parseInt(headerMatch[1]),
            timing: headerMatch[2].trim(),
            subject: subjectMatch?.[1]?.trim() || '',
            preview_text: previewMatch?.[1]?.trim() || '',
            body: bodyMatch?.[1]?.trim() || '',
          });
        }
      }

      return { emails };
    }

    default:
      return { raw: text };
  }
}

async function saveGeneratedContent(
  practitionerId: string,
  type: GenerationType,
  content: unknown,
  metadata: Record<string, unknown>
): Promise<void> {
  switch (type) {
    case 'email':
    case 'transit_alert': {
      const emailContent = content as {
        subject: string;
        preview_text: string;
        body: string;
      };

      await createEmailTemplate(practitionerId, {
        name: `Generated: ${metadata.topic || 'Untitled'}`,
        category: (metadata.emailCategory as string) || 'generated',
        subject: emailContent.subject,
        preview_text: emailContent.preview_text,
        body_html: emailContent.body,
        generated_by_maia: true,
        maia_prompt: metadata.prompt as string,
        voice_match_score: 0.85,
      });
      break;
    }

    case 'social':
    case 'caption': {
      const socialContent = content as {
        content_text: string;
        hashtags: string[];
      };

      await createSocialContent(practitionerId, {
        platform: metadata.platform as ContentPlatform,
        content_type: (metadata.contentType as ContentType) || 'post',
        content_text: socialContent.content_text,
        hashtags: socialContent.hashtags,
        generated_by_maia: true,
        maia_prompt: metadata.prompt as string,
        voice_match_score: 0.85,
        topic: metadata.topic as string,
        content_pillar: metadata.contentPillar as ContentPillar,
        transit_context: metadata.transitContext as Record<string, unknown>,
      });
      break;
    }
  }
}
