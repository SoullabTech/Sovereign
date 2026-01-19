export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { searchCards } from '@/lib/askMaia/cardService';
import type { AskMaiaCard } from '@/lib/askMaia/types';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are MAIA, a wise guide for consciousness exploration, psychology, and spiritual growth. You draw from a rich library of knowledge cards covering:
- Jungian psychology (shadow work, archetypes, individuation)
- Somatic and nervous system wisdom
- Spiritual traditions and practices
- Mythological and archetypal patterns
- Consciousness exploration techniques

When answering questions:
1. Be warm, grounded, and insightful - not clinical or detached
2. Draw connections between concepts when relevant
3. Offer both understanding and practical application
4. Honor the depth of the inquiry while remaining accessible
5. If you reference concepts from the knowledge cards provided, mention them naturally

Keep responses focused and meaningful - typically 2-4 paragraphs unless the question warrants more depth.`;

function formatCardsAsContext(cards: AskMaiaCard[]): string {
  if (cards.length === 0) return '';

  return cards
    .map((card, i) => {
      return `--- Card ${i + 1}: ${card.title} (${card.cardType}) ---
${card.subtitle ? `Subtitle: ${card.subtitle}\n` : ''}
${card.content}
${card.tags?.length ? `Tags: ${card.tags.join(', ')}` : ''}`;
    })
    .join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, conversationHistory } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Search for relevant cards
    const relevantCards = await searchCards(question, 5);

    // Format conversation history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Build the user message with context
    let userMessage = question;
    if (relevantCards.length > 0) {
      const cardsContext = formatCardsAsContext(relevantCards);
      userMessage = `Here are some relevant knowledge cards that may help inform your response:

${cardsContext}

---

User's question: ${question}`;
    }

    messages.push({ role: 'user', content: userMessage });

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    const answerText = textContent ? textContent.text : '';

    return NextResponse.json({
      success: true,
      answer: answerText,
      sourceCards: relevantCards.map((card) => ({
        id: card.id,
        title: card.title,
        cardType: card.cardType,
        tags: card.tags,
      })),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error('Ask MAIA ask POST error:', error);

    // Handle specific error types
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'API authentication failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to process question',
      },
      { status: 500 }
    );
  }
}
