/**
 * TELEGRAM NOTIFICATION API
 *
 * Sends Telegram messages via Telegram Bot API
 *
 * Requires:
 * - Telegram Bot token from @BotFather
 * - User's chat_id (obtained when user messages the bot)
 * - Environment variables or practitioner integration config
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { TelegramProvider } from '@/lib/comms/providers/TelegramProvider';
import { resolveSendAuthority } from '@/lib/notifications/sendAuthority';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';
const telegramProvider = new TelegramProvider();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, message, practitionerId: claimedPractitionerId, disableLinkPreview } = body;

    // Authority to send is resolved from the verified session, never the body.
    // The caller may request a delivery; the server decides whose credentials
    // may perform it. Fails closed. See lib/notifications/sendAuthority.
    const auth = await resolveSendAuthority(request, claimedPractitionerId);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const practitionerId = auth.practitionerId;

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: chatId, message' },
        { status: 400 }
      );
    }

    // Dev bypass: log and return success
    if (isDev) {
      console.log('[Telegram Notifications] Dev mode - would send:');
      console.log('  Chat ID:', chatId);
      console.log('  Message:', message);
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'Telegram logged (dev mode)',
      });
    }

    // Get practitioner's Telegram credentials from database
    let credentials: {
      bot_token: string;
    } | null = null;

    if (practitionerId) {
      try {
        const result = await query(
          `SELECT config_encrypted
           FROM practitioner_integrations
           WHERE practitioner_id = $1
           AND integration_type = 'telegram'
           AND status = 'connected'`,
          [practitionerId]
        );

        if (result.rows.length > 0 && result.rows[0].config_encrypted) {
          const config = typeof result.rows[0].config_encrypted === 'string'
            ? JSON.parse(result.rows[0].config_encrypted)
            : result.rows[0].config_encrypted;
          if (config.bot_token) {
            credentials = config;
          }
        }
      } catch (error) {
        console.warn('[Telegram Notifications] Practitioner credential lookup failed, falling back to env vars:', error instanceof Error ? error.message : error);
      }
    }

    // Fallback to environment variables
    if (!credentials) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (botToken) {
        credentials = {
          bot_token: botToken,
        };
      }
    }

    if (!credentials) {
      return NextResponse.json(
        { error: 'Telegram not configured. Please set up Telegram Bot integration.' },
        { status: 503 }
      );
    }

    // Send via Telegram provider
    const result = await telegramProvider.send(
      {
        to: chatId,
        bodyText: message,
        messageId: `telegram-${Date.now()}`,
        practitionerId: practitionerId || 'system',
        tags: disableLinkPreview ? { disableLinkPreview: 'true' } : undefined,
      },
      credentials
    );

    if (!result.success) {
      console.error('[Telegram Notifications] Failed to send:', result.errorMessage);
      return NextResponse.json(
        { error: result.errorMessage || 'Failed to send Telegram message' },
        { status: 500 }
      );
    }

    console.log(`[Telegram Notifications] Message sent to chat ${chatId}`);

    return NextResponse.json({
      success: true,
      id: result.externalId,
    });
  } catch (error) {
    console.error('[Telegram Notifications] Error:', error);

    if (isDev) {
      console.log('[Telegram Notifications] Dev bypass: returning success');
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'Telegram logged (dev mode - error bypassed)',
      });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET - Get bot info or recent updates (for setup/debugging)
 */
export async function GET(request: NextRequest) {
  try {
    // Same authority as sending: `action=getUpdates` returns inbound Telegram
    // message content read with the platform bot token. That is not public data,
    // and reading it is a privileged operation even though nothing is sent.
    const auth = await resolveSendAuthority(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'info';

    // Get credentials
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { error: 'Telegram Bot not configured', configured: false },
        { status: 503 }
      );
    }

    const credentials = { bot_token: botToken };

    if (action === 'updates') {
      // Get recent updates (useful for getting chat_ids)
      const offset = searchParams.get('offset');
      const updates = await telegramProvider.getUpdates(
        credentials,
        offset ? parseInt(offset) : undefined
      );

      return NextResponse.json({
        configured: true,
        ...updates,
      });
    }

    // Default: verify bot is working
    const isValid = await telegramProvider.verifyCredentials(credentials);

    return NextResponse.json({
      configured: true,
      connected: isValid,
    });
  } catch (error) {
    console.error('[Telegram] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to check Telegram status' },
      { status: 500 }
    );
  }
}
