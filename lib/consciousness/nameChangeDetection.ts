/**
 * Detect when a user wants to change what MAIA calls them
 * Phrases like "Call me X", "My name is X", "I prefer to be called X"
 */

import { query } from '@/lib/db/postgres';

// Patterns that indicate a name change request
const NAME_CHANGE_PATTERNS = [
  /\bcall me\s+([a-z][a-z'-]*(?:\s+[a-z][a-z'-]*)?)\b/i,
  /\bmy name is\s+([a-z][a-z'-]*(?:\s+[a-z][a-z'-]*)?)\b/i,
  /\bi(?:'m| am)\s+([a-z][a-z'-]*)\b/i,
  /\bi prefer\s+(?:to be called\s+)?([a-z][a-z'-]*)\b/i,
  /\bplease call me\s+([a-z][a-z'-]*)\b/i,
  /\bjust call me\s+([a-z][a-z'-]*)\b/i,
  /\byou can call me\s+([a-z][a-z'-]*)\b/i,
];

// Words that shouldn't be treated as names
const EXCLUDED_WORDS = new Set([
  'back', 'later', 'tomorrow', 'soon', 'now', 'here', 'there',
  'crazy', 'silly', 'stupid', 'weird', 'anxious', 'sad', 'happy',
  'doctor', 'maia', 'friend', 'buddy', 'pal',
  'if', 'when', 'maybe', 'probably', 'definitely',
  'anything', 'something', 'nothing', 'everything',
]);

export interface NameChangeResult {
  detected: boolean;
  newName?: string;
  updated?: boolean;
  error?: string;
}

/**
 * Detect if the user wants to change their preferred name
 */
export function detectNameChangeIntent(message: string): { detected: boolean; newName?: string } {
  const trimmedMessage = message.trim();

  for (const pattern of NAME_CHANGE_PATTERNS) {
    const match = trimmedMessage.match(pattern);
    if (match && match[1]) {
      const potentialName = match[1].trim();

      // Skip if it's in the excluded list
      if (EXCLUDED_WORDS.has(potentialName.toLowerCase())) {
        continue;
      }

      // Skip if it's too short or too long
      if (potentialName.length < 2 || potentialName.length > 30) {
        continue;
      }

      // Capitalize first letter
      const formattedName = potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();

      return { detected: true, newName: formattedName };
    }
  }

  return { detected: false };
}

/**
 * Update user's preferred name in the database
 */
export async function updatePreferredName(userId: string, newName: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Skip for anonymous users
    if (userId.startsWith('anon:')) {
      return { success: false, error: 'Cannot update name for anonymous user' };
    }

    const result = await query(
      `UPDATE members SET preferred_name = $1 WHERE id = $2
       RETURNING id, preferred_name`,
      [newName, userId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Member not found' };
    }

    console.log(`[NAME_CHANGE] Updated preferred_name to "${newName}" for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[NAME_CHANGE] Error updating preferred name:', error);
    return { success: false, error: 'Database error' };
  }
}

/**
 * Process a message for name change intent and update if detected
 */
export async function processNameChangeIfDetected(
  message: string,
  userId: string
): Promise<NameChangeResult> {
  const detection = detectNameChangeIntent(message);

  if (!detection.detected || !detection.newName) {
    return { detected: false };
  }

  const updateResult = await updatePreferredName(userId, detection.newName);

  return {
    detected: true,
    newName: detection.newName,
    updated: updateResult.success,
    error: updateResult.error,
  };
}
