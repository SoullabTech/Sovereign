/**
 * Conversation Storage Service - Stub implementation
 * Provides conversation storage functions for compatibility
 */

export async function saveMessages(
  messages: Array<{ role: string; content: string }>,
  sessionId?: string
): Promise<void> {
  // Stub implementation - store in localStorage for now
  console.log('Saving messages to localStorage:', messages.length, 'messages');
  localStorage.setItem('maia_messages', JSON.stringify(messages));
}

export async function getMessagesBySession(sessionId: string): Promise<Array<{ role: string; content: string }>> {
  // Stub implementation - get from localStorage for now
  const stored = localStorage.getItem('maia_messages');
  return stored ? JSON.parse(stored) : [];
}