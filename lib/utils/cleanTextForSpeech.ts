// lib/utils/cleanTextForSpeech.ts
// Clean text for voice synthesis - remove asterisks, stage directions, etc.

/**
 * Clean text for speech synthesis
 * Removes asterisks, stage directions, and other non-spoken elements
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Remove asterisk actions like *nods*, *smiles*, etc.
  cleaned = cleaned.replace(/\*[^*]+\*/g, '');

  // Remove single asterisks at the beginning of lines
  cleaned = cleaned.replace(/^\*/gm, '');

  // Remove stage directions in parentheses
  cleaned = cleaned.replace(/\([^)]*\)/g, '');

  // Remove markdown formatting
  cleaned = cleaned.replace(/[*_~`]/g, '');

  // REDUCE BREATHING PAUSES: Simplify punctuation
  // Replace ellipsis with single period (reduces dramatic pauses)
  cleaned = cleaned.replace(/\.{3,}/g, '.');

  // Replace multiple commas with single comma
  cleaned = cleaned.replace(/,+/g, ',');

  // Replace semicolons with commas (softer pause)
  cleaned = cleaned.replace(/;/g, ',');

  // Replace em-dashes with commas (less dramatic)
  cleaned = cleaned.replace(/—|--/g, ',');

  // Remove unnecessary periods from common abbreviations
  cleaned = cleaned.replace(/\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr)\./g, '$1');

  // Reduce multiple exclamation/question marks to single
  cleaned = cleaned.replace(/!+/g, '!');
  cleaned = cleaned.replace(/\?+/g, '?');

  // Remove periods before conjunctions (smoother flow)
  cleaned = cleaned.replace(/\.\s+(and|but|or|so|yet)\b/gi, ', $1');

  // Remove multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Extract only the spoken dialogue from text
 * Preserves the main content while removing meta-text
 */
export function extractSpokenText(text: string): string {
  if (!text) return '';

  // Split by line to process each separately
  const lines = text.split('\n');
  const spokenLines = [];

  for (const line of lines) {
    // Skip lines that are entirely stage directions
    if (line.trim().startsWith('*') && line.trim().endsWith('*')) {
      continue;
    }

    // Skip lines that are entirely in parentheses
    if (line.trim().startsWith('(') && line.trim().endsWith(')')) {
      continue;
    }

    // Clean the line and add if it has content
    const cleaned = cleanTextForSpeech(line);
    if (cleaned.length > 0) {
      spokenLines.push(cleaned);
    }
  }

  return spokenLines.join(' ');
}