// Anthropic API Route for MAIA Oracle
// Handles communication with Claude for consciousness-adaptive responses

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const { messages, model, max_tokens } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-sonnet-20240229',
        max_tokens: max_tokens || 1500,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API Error:', error);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}