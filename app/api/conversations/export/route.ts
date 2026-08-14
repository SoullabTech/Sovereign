export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const revalidate = false;

// Skip during static export (Capacitor builds)
/**
 * Conversation Export API
 *
 * Exports the AUTHENTICATED member's own conversations in various formats:
 * - Markdown (.md) - Default, readable format
 * - JSON (.json) - Machine readable with full metadata
 * - Plain Text (.txt) - Simple text format
 *
 * ---------------------------------------------------------------------------
 * SECURITY PERIMETER (2026-08-14) — read before changing anything here.
 * ---------------------------------------------------------------------------
 * BEFORE: `userId` was taken from the query string / request body and used
 * directly in SQL with no session resolution and no ownership check. The route
 * had no `accessMatrix` rule, and `ACCESS_CONTROL_MODE` is unset in production
 * (permissive Mode A), so unmapped routes pass through the middleware. Any
 * unauthenticated caller could name any member as the export subject.
 *
 * AFTER: the export subject is the member on the VERIFIED session
 * (`getMemberIdFromRequest` → `auth_sessions`). A caller-supplied `userId` can
 * no longer choose whose history is exported — see EXPORT SUBJECT below.
 *
 * NOTE ON DEFENCE IN DEPTH: the `accessMatrix` rule added for this path is a
 * perimeter, NOT the authority. `middleware.ts:isAuthenticated()` accepts a
 * bare `x-member-id` header as "authenticated" without verifying it, so the
 * middleware alone would still admit a forged identity. The binding gate is
 * `getMemberIdFromRequest` in this handler, which resolves identity from an
 * `auth_sessions`-backed token and rejects a mismatching claim. Do not remove
 * the route-level check on the grounds that "middleware already covers it".
 *
 * ---------------------------------------------------------------------------
 * DATASOURCE IS DELIBERATELY LEFT BROKEN.
 * ---------------------------------------------------------------------------
 * `EXPORT_SOURCE_TABLE` below names a relation that DOES NOT EXIST in any
 * environment (verified against production 2026-08-14: `relation
 * "conversation_messages" does not exist`). An authenticated member exporting
 * their own history still fails at the query. That is the intended intermediate
 * state: a secure broken endpoint.
 *
 * DO NOT "fix" this by renaming the table to `conversation_turns`. That store
 * holds ~40k turns across ~212 members and carries NO Sanctuary column, so a
 * rename would silently ship an export path that cannot honour the Sanctuary
 * boundary. Binding a real source is a separate, governed unit that must first
 * produce a field map (subject column, session identity, role vocabulary, text
 * columns, `visibility`, Sanctuary/session mode, withheld material, permitted
 * metadata, ordering, session selection).
 *
 * `lib/auth/__tests__/conversationExportPerimeter.test.ts` fails if this
 * constant changes without that unit landing.
 */

/**
 * The relation this export path reads.
 *
 * Guarded: changing this value is a data-contract act, not a bug fix. See the
 * DATASOURCE block above and the accompanying perimeter test.
 */
export const EXPORT_SOURCE_TABLE = 'conversation_messages';

/**
 * Sanctuary exclusion predicate for the bound source.
 *
 * `null` means: this source has no established Sanctuary semantics, therefore
 * no Sanctuary material can be proven excluded from it. The current source is
 * non-existent and returns nothing, so the exclusion holds vacuously — that is
 * the ONLY reason `null` is tolerable today.
 *
 * Any source that can actually return rows MUST supply a real predicate here
 * before it is bound. "It is the member's own data" does not override the
 * Sanctuary boundary; Sanctuary content is categorically excluded from this
 * path absent a separate founder ruling establishing lawful export semantics
 * for it (MAIA Canon — Sanctuary Mode invariants 1, 6).
 *
 * FOUNDER TRIPWIRE (2026-08-14) — the governing sentence for this path:
 *
 *   "No successful conversation export may be enabled until a concrete
 *    Sanctuary classification source for exported conversation data has been
 *    identified and enforced. The present absence of returned data is not a
 *    durable Sanctuary control."
 */
export const EXPORT_SANCTUARY_EXCLUSION: string | null = null;

interface ExportOptions {
  format: 'markdown' | 'json' | 'txt';
  sessionId?: string;
  userId: string;
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ConversationMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'oracle';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Format conversation as Markdown
 */
function formatAsMarkdown(
  messages: ConversationMessage[],
  options: ExportOptions
): string {
  const sessions = groupMessagesBySession(messages);
  let markdown = '';

  // Header
  markdown += `# Conversation Export\n\n`;
  markdown += `**Export Date:** ${new Date().toISOString().split('T')[0]}\n`;
  markdown += `**User ID:** ${options.userId}\n`;
  markdown += `**Total Sessions:** ${Object.keys(sessions).length}\n`;
  markdown += `**Total Messages:** ${messages.length}\n\n`;

  markdown += `---\n\n`;

  // Process each session
  Object.entries(sessions).forEach(([sessionId, sessionMessages]) => {
    const firstMessage = sessionMessages[0];
    const lastMessage = sessionMessages[sessionMessages.length - 1];

    markdown += `## Session: ${sessionId}\n\n`;
    markdown += `**Started:** ${formatTimestamp(firstMessage.timestamp)}\n`;
    markdown += `**Last Message:** ${formatTimestamp(lastMessage.timestamp)}\n`;
    markdown += `**Message Count:** ${sessionMessages.length}\n\n`;

    // Messages
    sessionMessages.forEach((message, index) => {
      const speaker = message.role === 'user' ? 'You' : 'MAIA';
      const timestamp = formatTimestamp(message.timestamp);

      markdown += `### ${speaker} - ${timestamp}\n\n`;
      markdown += `${message.content}\n\n`;

      if (options.includeMetadata && message.metadata && Object.keys(message.metadata).length > 0) {
        markdown += `*Metadata: ${JSON.stringify(message.metadata, null, 2)}*\n\n`;
      }

      if (index < sessionMessages.length - 1) {
        markdown += `---\n\n`;
      }
    });

    markdown += `\n---\n\n`;
  });

  return markdown;
}

/**
 * Format conversation as JSON
 */
function formatAsJson(
  messages: ConversationMessage[],
  options: ExportOptions
): string {
  const sessions = groupMessagesBySession(messages);

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      userId: options.userId,
      totalSessions: Object.keys(sessions).length,
      totalMessages: messages.length,
      format: 'json'
    },
    sessions: Object.entries(sessions).map(([sessionId, sessionMessages]) => ({
      sessionId,
      startTime: sessionMessages[0].timestamp,
      endTime: sessionMessages[sessionMessages.length - 1].timestamp,
      messageCount: sessionMessages.length,
      messages: sessionMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata || {}
      }))
    }))
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Format conversation as plain text
 */
function formatAsText(
  messages: ConversationMessage[],
  options: ExportOptions
): string {
  const sessions = groupMessagesBySession(messages);
  let text = '';

  // Header
  text += `CONVERSATION EXPORT\n`;
  text += `==================\n\n`;
  text += `Export Date: ${new Date().toISOString().split('T')[0]}\n`;
  text += `User ID: ${options.userId}\n`;
  text += `Total Sessions: ${Object.keys(sessions).length}\n`;
  text += `Total Messages: ${messages.length}\n\n`;

  // Process each session
  Object.entries(sessions).forEach(([sessionId, sessionMessages]) => {
    const firstMessage = sessionMessages[0];
    const lastMessage = sessionMessages[sessionMessages.length - 1];

    text += `SESSION: ${sessionId}\n`;
    text += `-`.repeat(50) + '\n';
    text += `Started: ${formatTimestamp(firstMessage.timestamp)}\n`;
    text += `Last Message: ${formatTimestamp(lastMessage.timestamp)}\n`;
    text += `Message Count: ${sessionMessages.length}\n\n`;

    // Messages
    sessionMessages.forEach((message) => {
      const speaker = message.role === 'user' ? 'YOU' : 'MAIA';
      const timestamp = formatTimestamp(message.timestamp);

      text += `[${timestamp}] ${speaker}:\n`;
      text += `${message.content}\n\n`;
    });

    text += '\n' + '='.repeat(60) + '\n\n';
  });

  return text;
}

/**
 * Group messages by session
 */
function groupMessagesBySession(
  messages: ConversationMessage[]
): Record<string, ConversationMessage[]> {
  return messages.reduce((sessions, message) => {
    if (!sessions[message.session_id]) {
      sessions[message.session_id] = [];
    }
    sessions[message.session_id].push(message);
    return sessions;
  }, {} as Record<string, ConversationMessage[]>);
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Get file extension and MIME type
 */
function getFileInfo(format: string) {
  switch (format) {
    case 'json':
      return { extension: 'json', mimeType: 'application/json' };
    case 'txt':
      return { extension: 'txt', mimeType: 'text/plain' };
    case 'markdown':
    default:
      return { extension: 'md', mimeType: 'text/markdown' };
  }
}

/**
 * GET /api/conversations/export
 * Export conversations for a user
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    // -----------------------------------------------------------------
    // EXPORT SUBJECT — the verified member, and only ever the verified
    // member. Resolved BEFORE any conversation query is constructed.
    // -----------------------------------------------------------------
    const userId = await getMemberIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // A caller-supplied `userId` is accepted for backward compatibility but
    // carries NO authority: it cannot widen or redirect the subject. If it
    // names someone else, that is a subject-widening attempt — refuse rather
    // than silently exporting the caller's own data under another name.
    const claimedUserId = searchParams.get('userId');
    if (claimedUserId && claimedUserId !== userId) {
      console.warn(
        '[conversations/export] userId parameter does not match authenticated member — refusing (subject-widening attempt)'
      );
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only export your own conversations.' },
        { status: 403 }
      );
    }

    const sessionId = searchParams.get('sessionId');
    const format = (searchParams.get('format') || 'markdown') as 'markdown' | 'json' | 'txt';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query using local postgres (sovereignty-compliant)
    const { query: pgQuery } = await import('@/lib/db/postgres');

    // OWNERSHIP BY CONSTRUCTION: the subject predicate is the verified member
    // and is never caller-controlled. A supplied `sessionId` is ANDed with it,
    // so a guessed or foreign session simply matches nothing — it cannot be
    // used to probe for another member's sessions. See the uniform not-found
    // response below, which makes "not yours" and "does not exist"
    // indistinguishable.
    let sql = `SELECT * FROM ${EXPORT_SOURCE_TABLE} WHERE user_id = $1`;
    const params: any[] = [userId];
    let paramIndex = 2;

    // Add session filter if specified
    if (sessionId) {
      sql += ` AND session_id = $${paramIndex}`;
      params.push(sessionId);
      paramIndex++;
    }

    // Add date range filter if specified
    if (startDate) {
      sql += ` AND timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      sql += ` AND timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    sql += ' ORDER BY timestamp ASC';

    // Execute query
    let messages: ConversationMessage[];
    try {
      const result = await pgQuery<ConversationMessage>(sql, params);
      messages = result.rows;
    } catch (error: any) {
      console.error('Database error:', error);
      return NextResponse.json({
        error: 'Failed to retrieve conversations',
        details: error?.message || 'Unknown error'
      }, { status: 500 });
    }

    // Uniform not-found: a foreign/guessed sessionId and a genuinely empty
    // result are indistinguishable. Do not add a message that separates them.
    if (!messages || messages.length === 0) {
      return NextResponse.json({
        error: 'No conversations found for the specified criteria'
      }, { status: 404 });
    }

    // Format based on requested format
    const options: ExportOptions = {
      format,
      sessionId: sessionId || undefined,
      userId,
      includeMetadata,
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined
    };

    let formattedContent: string;
    switch (format) {
      case 'json':
        formattedContent = formatAsJson(messages, options);
        break;
      case 'txt':
        formattedContent = formatAsText(messages, options);
        break;
      case 'markdown':
      default:
        formattedContent = formatAsMarkdown(messages, options);
        break;
    }

    // Prepare file info
    const { extension, mimeType } = getFileInfo(format);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = sessionId
      ? `conversation-${sessionId}-${timestamp}.${extension}`
      : `conversations-${userId}-${timestamp}.${extension}`;

    // Return as downloadable file
    return new NextResponse(formattedContent, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/conversations/export
 * Export specific conversations with more complex filtering
 */
export async function POST(request: NextRequest) {
  try {
    // Same perimeter as GET — the subject is the verified member, resolved
    // before any conversation query is constructed.
    const userId = await getMemberIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId: claimedUserId,
      sessionIds = [],
      format = 'markdown',
      includeMetadata = false,
      dateRange,
      title
    } = body;

    // A body-supplied `userId` carries no authority (see GET).
    if (claimedUserId && claimedUserId !== userId) {
      console.warn(
        '[conversations/export] body userId does not match authenticated member — refusing (subject-widening attempt)'
      );
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only export your own conversations.' },
        { status: 403 }
      );
    }

    // Build query using local postgres (sovereignty-compliant)
    const { query: pgQuery } = await import('@/lib/db/postgres');

    // Ownership by construction — see GET.
    let sql = `SELECT * FROM ${EXPORT_SOURCE_TABLE} WHERE user_id = $1`;
    const params: any[] = [userId];
    let paramIndex = 2;

    // Add session filter if specified
    if (sessionIds.length > 0) {
      const placeholders = sessionIds.map((_: string, i: number) => `$${paramIndex + i}`).join(', ');
      sql += ` AND session_id IN (${placeholders})`;
      params.push(...sessionIds);
      paramIndex += sessionIds.length;
    }

    // Add date range filter if specified
    if (dateRange?.start) {
      sql += ` AND timestamp >= $${paramIndex}`;
      params.push(dateRange.start);
      paramIndex++;
    }
    if (dateRange?.end) {
      sql += ` AND timestamp <= $${paramIndex}`;
      params.push(dateRange.end);
      paramIndex++;
    }

    sql += ' ORDER BY timestamp ASC';

    let messages: ConversationMessage[];
    try {
      const result = await pgQuery<ConversationMessage>(sql, params);
      messages = result.rows;
    } catch (error: any) {
      return NextResponse.json({
        error: 'Failed to retrieve conversations',
        details: error?.message || 'Unknown error'
      }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        error: 'No conversations found'
      }, { status: 404 });
    }

    // Format content
    const options: ExportOptions = {
      format,
      userId,
      includeMetadata,
      dateRange
    };

    let formattedContent: string;
    switch (format) {
      case 'json':
        formattedContent = formatAsJson(messages, options);
        break;
      case 'txt':
        formattedContent = formatAsText(messages, options);
        break;
      case 'markdown':
      default:
        formattedContent = formatAsMarkdown(messages, options);
        break;
    }

    // Prepare response
    const { extension, mimeType } = getFileInfo(format);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = title
      ? `${title.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.${extension}`
      : `conversations-export-${timestamp}.${extension}`;

    return new NextResponse(formattedContent, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Export POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}