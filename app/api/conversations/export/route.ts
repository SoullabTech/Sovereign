import { NextRequest, NextResponse } from 'next/server';
/**
 * Conversation Export API
 *
 * Exports user conversations in various formats:
 * - Markdown (.md) - Default, readable format
 * - JSON (.json) - Machine readable with full metadata
 * - Plain Text (.txt) - Simple text format
 */

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
  try {
    const { searchParams } = new URL(request.url);

    // Parse parameters
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const format = (searchParams.get('format') || 'markdown') as 'markdown' | 'json' | 'txt';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate required parameters
    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required',
        usage: 'GET /api/conversations/export?userId=<userId>&format=markdown|json|txt&sessionId=<optional>&includeMetadata=true|false&startDate=<ISO>&endDate=<ISO>'
      }, { status: 400 });
    }

    // Sovereignty mode: Export API disabled (Supabase removed)
    // Conversations are stored in localStorage only
    return NextResponse.json({
      error: 'Export unavailable in sovereignty mode',
      message: 'Conversations are stored locally in your browser. Use localStorage to access them.',
      suggestion: 'Manually copy conversations from the UI or localStorage'
    }, { status: 501 });

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
    const body = await request.json();
    const {
      userId,
      sessionIds = [],
      format = 'markdown',
      includeMetadata = false,
      dateRange,
      title
    } = body;

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Sovereignty mode: Bulk export API disabled (Supabase removed)
    return NextResponse.json({
      error: 'Bulk export unavailable in sovereignty mode',
      message: 'Conversations are stored locally in your browser. Use localStorage to access them.',
      suggestion: 'Manually copy conversations from the UI or localStorage'
    }, { status: 501 });

  } catch (error) {
    console.error('Export POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}