import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
/**
 * Generate ephemeral token for OpenAI Realtime API
 *
 * This route securely creates an ephemeral session token without exposing
 * the main API key to the client.
 *
 * Ephemeral keys:
 * - Start with "ek_" prefix
 * - Valid for ~60 seconds
 * - Required for browser-based WebRTC connections
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, element, conversationStyle } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log('🔑 Generating ephemeral client key for Realtime connection');

    // Generate ephemeral key via OpenAI API
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'shimmer',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to generate ephemeral key:', response.status, errorText);
      throw new Error(`Failed to generate ephemeral key: ${response.status}`);
    }

    const data = await response.json();

    // The ephemeral key is in data.client_secret.value
    const ephemeralKey = data.client_secret?.value;

    if (!ephemeralKey || !ephemeralKey.startsWith('ek_')) {
      console.error('❌ Invalid ephemeral key received:', data);
      throw new Error('Invalid ephemeral key format');
    }

    console.log('✅ Generated ephemeral client key');

    return NextResponse.json({
      token: ephemeralKey,
    });

  } catch (error) {
    console.error('❌ Error generating ephemeral key:', error);

    return NextResponse.json(
      { error: 'Failed to generate ephemeral key' },
      { status: 500 }
    );
  }
}
