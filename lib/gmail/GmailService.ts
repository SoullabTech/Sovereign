/**
 * GMAIL SERVICE
 *
 * Send emails on behalf of the user via Gmail API.
 * Shares OAuth tokens with GoogleCalendarService.
 *
 * Philosophy: Help people say the things they've been avoiding.
 */

import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

// ============================================================================
// Types
// ============================================================================

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1';
const USERINFO_API = 'https://www.googleapis.com/oauth2/v2/userinfo';

// ============================================================================
// Email Formatting
// ============================================================================

/**
 * Create RFC 2822 formatted email message
 */
function createRawEmail(message: EmailMessage, fromEmail: string): string {
  const lines: string[] = [];

  // Headers
  lines.push(`From: ${fromEmail}`);
  lines.push(`To: ${message.to}`);
  if (message.cc) lines.push(`Cc: ${message.cc}`);
  if (message.bcc) lines.push(`Bcc: ${message.bcc}`);
  if (message.replyTo) lines.push(`Reply-To: ${message.replyTo}`);
  lines.push(`Subject: ${message.subject}`);
  lines.push('MIME-Version: 1.0');
  lines.push('Content-Type: text/plain; charset=utf-8');
  lines.push(''); // Empty line separates headers from body
  lines.push(message.body);

  return lines.join('\r\n');
}

/**
 * Base64url encode (Gmail API format)
 */
function base64urlEncode(str: string): string {
  const base64 = Buffer.from(str, 'utf-8').toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ============================================================================
// Gmail API Functions
// ============================================================================

/**
 * Get the user's Gmail address via OAuth userinfo endpoint
 * (Uses userinfo.email scope, not gmail.readonly)
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  const accessToken = await GoogleCalendarService.getValidAccessToken(userId);
  if (!accessToken) return null;

  try {
    // Use OAuth2 userinfo endpoint (works with userinfo.email scope)
    const response = await fetch(USERINFO_API, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error('[Gmail] Failed to get user info:', await response.text());
      return null;
    }

    const userInfo = await response.json();
    return userInfo.email;
  } catch (error) {
    console.error('[Gmail] Error getting user email:', error);
    return null;
  }
}

/**
 * Check if user has Gmail send permission
 */
export async function hasGmailPermission(userId: string): Promise<boolean> {
  const accessToken = await GoogleCalendarService.getValidAccessToken(userId);
  if (!accessToken) return false;

  // Try to get profile - this will fail if no gmail.send scope
  const email = await getUserEmail(userId);
  return !!email;
}

/**
 * Send an email via Gmail API
 */
export async function sendEmail(
  userId: string,
  message: EmailMessage
): Promise<SendResult> {
  const accessToken = await GoogleCalendarService.getValidAccessToken(userId);

  if (!accessToken) {
    return {
      success: false,
      error: 'Not connected to Google. Please reconnect with Gmail permissions.',
    };
  }

  // Get the user's email address for the From header
  const fromEmail = await getUserEmail(userId);
  if (!fromEmail) {
    return {
      success: false,
      error: 'Could not retrieve your Gmail address. Please reconnect.',
    };
  }

  try {
    // Create the raw email
    const rawEmail = createRawEmail(message, fromEmail);
    const encodedEmail = base64urlEncode(rawEmail);

    // Send via Gmail API
    const response = await fetch(`${GMAIL_API}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gmail] Send failed:', errorText);

      // Check for specific errors
      if (errorText.includes('insufficientPermissions')) {
        return {
          success: false,
          error: 'Gmail permission not granted. Please reconnect with "Send email" permission.',
        };
      }

      return {
        success: false,
        error: 'Failed to send email. Please try again.',
      };
    }

    const result = await response.json();
    console.log(`[Gmail] Email sent: ${result.id} to ${message.to}`);

    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
    };
  } catch (error) {
    console.error('[Gmail] Send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

/**
 * Create a draft (save without sending)
 */
export async function createDraft(
  userId: string,
  message: EmailMessage
): Promise<SendResult> {
  const accessToken = await GoogleCalendarService.getValidAccessToken(userId);

  if (!accessToken) {
    return {
      success: false,
      error: 'Not connected to Google.',
    };
  }

  const fromEmail = await getUserEmail(userId);
  if (!fromEmail) {
    return {
      success: false,
      error: 'Could not retrieve your Gmail address.',
    };
  }

  try {
    const rawEmail = createRawEmail(message, fromEmail);
    const encodedEmail = base64urlEncode(rawEmail);

    const response = await fetch(`${GMAIL_API}/users/me/drafts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: { raw: encodedEmail },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gmail] Draft creation failed:', errorText);
      return {
        success: false,
        error: 'Failed to create draft.',
      };
    }

    const result = await response.json();
    console.log(`[Gmail] Draft created: ${result.id}`);

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error('[Gmail] Draft error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Export as namespace-like object for consistency
// ============================================================================

export const GmailService = {
  getUserEmail,
  hasGmailPermission,
  sendEmail,
  createDraft,
};
