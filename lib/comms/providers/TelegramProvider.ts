/**
 * TELEGRAM PROVIDER
 *
 * Sends Telegram messages via Telegram Bot API
 *
 * Setup:
 * 1. Create a bot via @BotFather on Telegram
 * 2. Get the bot token
 * 3. Users must start a conversation with the bot first
 * 4. Get chat_id from /getUpdates or store when user messages bot
 *
 * Environment:
 * - TELEGRAM_BOT_TOKEN: Bot token from BotFather
 */

import type {
  CommsProvider,
  ProviderType,
  DeliveryChannel,
  DeliveryPayload,
  DeliveryResult,
  DeliveryStatusUpdate,
} from './types';

// Extended type for Telegram
export type TelegramProviderType = ProviderType | 'telegram';

export class TelegramProvider implements Omit<CommsProvider, 'provider'> {
  readonly provider: TelegramProviderType = 'telegram';
  readonly channel: DeliveryChannel = 'sms'; // Treat as messaging channel

  private baseUrl = 'https://api.telegram.org';

  async verifyCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { bot_token } = credentials;

    if (!bot_token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/bot${bot_token}/getMe`);
      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      console.error('[TelegramProvider] Credential verification failed:', error);
      return false;
    }
  }

  async send(
    payload: DeliveryPayload,
    credentials: Record<string, string>
  ): Promise<DeliveryResult> {
    const { bot_token } = credentials;

    if (!bot_token) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_CREDENTIALS',
        errorMessage: 'Telegram bot token not configured',
      };
    }

    // 'to' should be the chat_id for Telegram
    const chatId = payload.to;

    if (!chatId) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_CHAT_ID',
        errorMessage: 'Telegram chat_id required in "to" field',
      };
    }

    try {
      // Build message with optional formatting
      const messageBody: Record<string, unknown> = {
        chat_id: chatId,
        text: payload.bodyText,
        parse_mode: 'HTML', // Support basic HTML formatting
      };

      // Add reply markup if specified in tags
      if (payload.tags?.replyMarkup) {
        try {
          messageBody.reply_markup = JSON.parse(payload.tags.replyMarkup);
        } catch {
          // Ignore invalid JSON
        }
      }

      // Disable link previews if specified
      if (payload.tags?.disableLinkPreview === 'true') {
        messageBody.disable_web_page_preview = true;
      }

      const response = await fetch(
        `${this.baseUrl}/bot${bot_token}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageBody),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        return {
          success: false,
          status: 'failed',
          errorCode: data.error_code?.toString() || 'SEND_FAILED',
          errorMessage: data.description || 'Failed to send Telegram message',
          rawResponse: data,
        };
      }

      return {
        success: true,
        externalId: data.result.message_id.toString(),
        status: 'sent',
        rawResponse: data,
      };
    } catch (error) {
      console.error('[TelegramProvider] Send error:', error);
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a document/file via Telegram
   */
  async sendDocument(
    chatId: string,
    documentUrl: string,
    caption: string | undefined,
    credentials: Record<string, string>
  ): Promise<DeliveryResult> {
    const { bot_token } = credentials;

    if (!bot_token) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_CREDENTIALS',
        errorMessage: 'Telegram bot token not configured',
      };
    }

    try {
      const messageBody: Record<string, unknown> = {
        chat_id: chatId,
        document: documentUrl,
      };

      if (caption) {
        messageBody.caption = caption;
        messageBody.parse_mode = 'HTML';
      }

      const response = await fetch(
        `${this.baseUrl}/bot${bot_token}/sendDocument`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageBody),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        return {
          success: false,
          status: 'failed',
          errorCode: data.error_code?.toString() || 'SEND_FAILED',
          errorMessage: data.description || 'Failed to send document',
          rawResponse: data,
        };
      }

      return {
        success: true,
        externalId: data.result.message_id.toString(),
        status: 'sent',
        rawResponse: data,
      };
    } catch (error) {
      console.error('[TelegramProvider] SendDocument error:', error);
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  parseWebhook(payload: unknown): DeliveryStatusUpdate | null {
    // Telegram doesn't have delivery receipts like SMS/Email
    // Webhook updates are for incoming messages, not delivery status
    // Return null - status updates not supported
    return null;
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Telegram uses a secret_token for webhook verification
    // The token is set when configuring the webhook and sent in X-Telegram-Bot-Api-Secret-Token header
    return signature === secret;
  }

  /**
   * Get updates (for polling mode or getting chat_ids)
   */
  async getUpdates(
    credentials: Record<string, string>,
    offset?: number
  ): Promise<{ success: boolean; updates?: unknown[]; error?: string }> {
    const { bot_token } = credentials;

    if (!bot_token) {
      return { success: false, error: 'Bot token not configured' };
    }

    try {
      const params = new URLSearchParams();
      if (offset) {
        params.append('offset', offset.toString());
      }

      const response = await fetch(
        `${this.baseUrl}/bot${bot_token}/getUpdates?${params.toString()}`
      );

      const data = await response.json();

      if (!data.ok) {
        return { success: false, error: data.description };
      }

      return { success: true, updates: data.result };
    } catch (error) {
      console.error('[TelegramProvider] GetUpdates error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Set webhook URL for receiving updates
   */
  async setWebhook(
    webhookUrl: string,
    credentials: Record<string, string>,
    secretToken?: string
  ): Promise<{ success: boolean; error?: string }> {
    const { bot_token } = credentials;

    if (!bot_token) {
      return { success: false, error: 'Bot token not configured' };
    }

    try {
      const body: Record<string, unknown> = {
        url: webhookUrl,
      };

      if (secretToken) {
        body.secret_token = secretToken;
      }

      const response = await fetch(
        `${this.baseUrl}/bot${bot_token}/setWebhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        return { success: false, error: data.description };
      }

      return { success: true };
    } catch (error) {
      console.error('[TelegramProvider] SetWebhook error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
