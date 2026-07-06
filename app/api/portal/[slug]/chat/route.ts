export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * VIRTUAL PRACTITIONER CHAT API
 *
 * AI companion that embodies the practitioner's voice and wisdom
 * For Loralee: Evolutionary astrology with warm, nurturing guidance
 *
 * When conversational booking is enabled (premium feature), the AI can:
 * - List available services
 * - Check appointment availability
 * - Create bookings
 * - Submit inquiries
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import Anthropic from '@anthropic-ai/sdk';
import { getPractitionerFeaturesById } from '@/lib/practitioner/features';
import {
  BOOKING_TOOLS,
  executeTool,
  type ToolContext,
} from '@/lib/portal/bookingTools';
import {
  sendBookingConfirmation,
  sendBookingNotificationToPractitioner,
  sendInquiryNotification,
} from '@/lib/portal/notifications';

const anthropic = new Anthropic();

interface Message {
  role: 'user' | 'assistant';
  content: string | Anthropic.ContentBlock[];
}

/**
 * Retry Anthropic calls on transient 500/529 errors
 */
async function anthropicCreateWithRetry<T>(createFn: () => Promise<T>): Promise<T> {
  try {
    return await createFn();
  } catch (err: any) {
    const status = err?.status;
    if (status === 500 || status === 529) {
      // Single immediate retry for transient server errors
      console.log('[Portal Chat] Retrying after transient error:', status);
      return await createFn();
    }
    throw err;
  }
}

/**
 * Normalize message content to ensure it's valid for Anthropic
 */
function normalizeMessageContent(content: any): string | Anthropic.ContentBlock[] {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content;
  return String(content ?? '');
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
        p.id, p.member_id, p.name, p.email, p.business_name, p.bio, p.tagline,
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
    const practitionerId = practitioner.id;

    // Get practitioner features (premium feature flags)
    const features = await getPractitionerFeaturesById(practitionerId);
    const bookingEnabled = features.conversationalBookingEnabled;
    const emailsEnabled = features.bookingConfirmationEmailsEnabled;

    // Build system prompt
    const systemPrompt = buildVirtualPractitionerPrompt(practitioner, bookingEnabled);

    // Format conversation history for Claude API
    const claudeMessages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((m: Message) => ({
        role: m.role as 'user' | 'assistant',
        content: normalizeMessageContent(m.content),
      })),
      { role: 'user' as const, content: message },
    ];

    // Prepare tool context
    const toolContext: ToolContext = {
      portalSlug: slug,
      practitionerId,
      memberId: practitioner.member_id,
    };

    // Call Claude with optional tools
    let response: Anthropic.Message;
    try {
      // Log request summary for debugging
      console.log('[Portal Chat] Anthropic request', {
        slug,
        model: 'claude-sonnet-5',
        messagesCount: claudeMessages.length,
        toolsEnabled: bookingEnabled,
        toolsCount: bookingEnabled ? BOOKING_TOOLS.length : 0,
      });

      response = await anthropicCreateWithRetry(() =>
        anthropic.messages.create({
          model: 'claude-sonnet-5',
          max_tokens: 1024,
          // Sonnet 5 defaults to adaptive thinking; disable so the budget stays
          // text. Cast: installed @anthropic-ai/sdk types predate `thinking`.
          thinking: { type: 'disabled' },
          system: systemPrompt,
          messages: claudeMessages,
          ...(bookingEnabled ? { tools: BOOKING_TOOLS } : {}),
        } as any)
      );
    } catch (err: any) {
      console.error('[Portal Chat] Anthropic error', {
        slug,
        name: err?.name,
        status: err?.status,
        message: err?.message,
        request_id: err?.request_id,
        type: err?.type,
        error: err?.error,
      });
      throw err;
    }

    // Handle tool use loop (max 5 iterations for safety)
    let iterations = 0;
    const maxIterations = 5;

    while (response.stop_reason === 'tool_use' && iterations < maxIterations) {
      iterations++;

      // Find tool use blocks
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      // Execute tools and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          toolContext
        );

        // Send notifications for successful bookings/inquiries
        if (result.success && toolUse.name === 'create_booking' && emailsEnabled) {
          const bookingData = result.data as {
            service_name: string;
            date: string;
            time: string;
            duration_minutes: number;
            client_name: string;
            client_email: string;
          };

          const practitionerInfo = {
            name: practitioner.name,
            email: practitioner.email,
            portalSlug: slug,
            businessName: practitioner.business_name,
          };

          const bookingDetails = {
            clientName: bookingData.client_name,
            clientEmail: bookingData.client_email,
            sessionType: bookingData.service_name,
            dateTime: new Date(`${bookingData.date}T${bookingData.time}`),
            duration: bookingData.duration_minutes,
            timezone: 'America/Chicago', // TODO: Get from client
          };

          // Send emails async (don't block response)
          Promise.all([
            sendBookingConfirmation(bookingDetails, practitionerInfo),
            sendBookingNotificationToPractitioner(bookingDetails, practitionerInfo),
          ]).catch((err) => console.error('[Portal Chat] Email send error:', err));
        }

        if (result.success && toolUse.name === 'submit_inquiry') {
          const inquiryData = result.data as {
            inquiry_id: string;
            confirmation_message: string;
          };

          // Get inquiry details for notification
          const input = toolUse.input as {
            name?: string;
            email?: string;
            phone?: string;
            topic?: string;
            message: string;
          };

          const practitionerInfo = {
            name: practitioner.name,
            email: practitioner.email,
            portalSlug: slug,
            businessName: practitioner.business_name,
          };

          // Send inquiry notification async
          sendInquiryNotification(
            {
              name: input.name,
              email: input.email,
              phone: input.phone,
              topic: input.topic,
              message: input.message,
              source: 'portal_chat',
            },
            practitionerInfo
          ).catch((err) => console.error('[Portal Chat] Inquiry notification error:', err));
        }

        // Cap tool result size to prevent oversized payloads
        const resultJson = JSON.stringify(result);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: resultJson.length > 8000 ? resultJson.slice(0, 8000) + '...(truncated)' : resultJson,
          is_error: !result.success,
        });
      }

      // Continue conversation with tool results
      claudeMessages.push({
        role: 'assistant',
        content: response.content,
      });

      claudeMessages.push({
        role: 'user',
        content: toolResults,
      });

      // Get next response
      try {
        response = await anthropicCreateWithRetry(() =>
          anthropic.messages.create({
            model: 'claude-sonnet-5',
            max_tokens: 1024,
            thinking: { type: 'disabled' },
            system: systemPrompt,
            messages: claudeMessages,
            ...(bookingEnabled ? { tools: BOOKING_TOOLS } : {}),
          } as any)
        );
      } catch (err: any) {
        console.error('[Portal Chat] Anthropic error (tool loop)', {
          slug,
          iteration: iterations,
          status: err?.status,
          message: err?.message,
          request_id: err?.request_id,
        });
        throw err;
      }
    }

    // Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    const assistantMessage = textBlocks.map((b) => b.text).join('\n') || '';

    return NextResponse.json({
      message: assistantMessage,
      ai_name: practitioner.ai_name || 'Guide',
      features_enabled: {
        booking: bookingEnabled,
        inquiry: features.inquiryFormEnabled,
      },
    });
  } catch (error: any) {
    console.error('Portal chat error:', error);

    // Check if this is an Anthropic API error
    const status = error?.status;
    const isAnthropicError = status === 500 || status === 529 || status === 401 || status === 403 || status === 429;

    if (isAnthropicError) {
      // Return graceful degradation message instead of crashing
      const degradedMessage =
        status === 429
          ? "I'm receiving a lot of messages right now and need a moment to catch up. Please try again in a minute or two."
          : "I'm having a little trouble connecting right now. If you'd like to book a session or have a question, feel free to use the inquiry form, or try again in a moment.";

      return NextResponse.json({
        message: degradedMessage,
        ai_name: 'Guide',
        degraded: true,
        features_enabled: {
          booking: false,
          inquiry: true,
        },
      });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildVirtualPractitionerPrompt(
  practitioner: any,
  bookingEnabled: boolean = false
): string {
  const aiName = practitioner.ai_name || 'Guide';
  const boundaries = practitioner.boundaries || {};

  // Loralee-specific prompt for evolutionary astrology
  let prompt = `You are ${aiName}, a virtual guide embodying the wisdom and voice of ${practitioner.name}, an evolutionary astrologer.

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

  // Add booking capabilities when enabled
  if (bookingEnabled) {
    prompt += `

## Booking & Scheduling Capabilities

You have access to tools that allow you to help people book sessions:

1. **list_services** — Use when someone asks about available sessions, services, or pricing
2. **check_availability** — Use when someone wants to see available times for a specific date
3. **create_booking** — Use when you have all the required information to book a session
4. **submit_inquiry** — Use when someone has questions that need ${practitioner.name}'s personal attention

### Booking Guidelines

- Always warmly acknowledge someone's interest in booking before checking availability
- When someone wants to book, first ask what type of session they're interested in
- Once they choose a service, ask what date works for them
- Present available times in a friendly, readable format
- Before creating a booking, confirm ALL details with the person:
  - Service type
  - Date and time
  - Their name
  - Their email (required for confirmation)
  - Their phone (optional but helpful)
- After a successful booking, express genuine warmth about looking forward to the session
- If someone has questions beyond scheduling, use submit_inquiry to send their message directly to ${practitioner.name}

### Never

- Create a booking without explicit confirmation of all details
- Make up availability — always use check_availability
- Skip the warm, personal touch even when handling logistics`;
  }

  return prompt;
}
