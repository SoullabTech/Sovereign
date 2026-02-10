/**
 * Abuse Detection
 *
 * Detects potential abuse disclosure in user messages.
 * Uses local regex patterns only (no external API).
 *
 * This is not a diagnostic tool. It flags language that suggests
 * a young person may be experiencing harm, so MAIA can respond
 * with appropriate resources and care.
 *
 * Severity levels:
 *   signal   — language that warrants gentle follow-up
 *   elevated — patterns suggesting active harm
 *   critical — explicit disclosure requiring immediate intervention
 */

import type { TeenAbuseResult } from './teenSupportIntegration';

// ---------------------------------------------------------------------------
// Detection patterns
// ---------------------------------------------------------------------------

const PHYSICAL_ABUSE_PATTERNS = [
  /\b(hits|slaps|punches|kicks|beats|hurts) me\b/i,
  /\b(my )?(dad|mom|parent|step-?dad|step-?mom|uncle|aunt|guardian|coach|teacher) (hits|slaps|punches|hurts|beats) me\b/i,
  /\b(bruise|mark|scar|burn)s? (from|because|where) (he|she|they|my)\b/i,
  /\bhe (threw|pushes|pushed|grabbed|choked|strangled) me\b/i,
  /\bshe (threw|pushes|pushed|grabbed|choked|strangled) me\b/i,
  /\bthey (threw|push|pushed|grabbed|choked|strangled) me\b/i,
  /\bafraid (to go|of going) home\b/i,
  /\b(locked|shut) (me )?(in|out)\b/i,
];

const EMOTIONAL_ABUSE_PATTERNS = [
  /\b(always|constantly) (yell(s|ing)|scream(s|ing)) at me\b/i,
  /\btells? me I'?m (worthless|stupid|useless|nothing|a mistake)\b/i,
  /\b(threatens? to|said they'?d) (leave|abandon|kick .* out|send .* away)\b/i,
  /\bmakes? me feel (scared|terrified|worthless|horrible) (all the time|every day|constantly)\b/i,
  /\bnever (allowed|let) (to|me) (go out|have friends|see anyone)\b/i,
  /\b(controls?|monitors?|checks?) everything I (do|say|wear|eat)\b/i,
  /\b(isolate[sd]?|cut.* off) from (friends|family|everyone)\b/i,
];

const SEXUAL_ABUSE_PATTERNS = [
  /\b(touch(es|ed|ing) me|makes? me touch) (where|in .* (way|place))\b/i,
  /\bmakes? me (do|watch) (things|stuff) I don'?t want\b/i,
  /\b(inappropriate|uncomfortable) (touching|contact|things)\b/i,
  /\b(secret|private) (thing|stuff) (with|between) (us|me and)\b/i,
  /\btold me not to tell\b/i,
  /\bif (I|you) tell anyone\b/i,
  /\bno one will believe\b/i,
];

const NEGLECT_PATTERNS = [
  /\b(never|don'?t) (feed|give .* food|have food|have enough to eat)\b/i,
  /\b(no one|nobody) (takes care|looks after|feeds|helps) me\b/i,
  /\b(left|home) alone (for days|all night|all the time)\b/i,
  /\b(never|don'?t) take me to (the doctor|school|hospital)\b/i,
  /\bdon'?t have (clean clothes|a bed|my own)\b/i,
];

// ---------------------------------------------------------------------------
// Detection engine
// ---------------------------------------------------------------------------

/**
 * Detect potential abuse disclosure in a message.
 * Returns structured result with severity and type.
 */
export function detectAbuse(message: string): TeenAbuseResult {
  const matchedPatterns: string[] = [];
  let type: string | undefined;
  let maxSeverity: 'signal' | 'elevated' | 'critical' = 'signal';

  // Sexual abuse is always critical severity
  for (const pattern of SEXUAL_ABUSE_PATTERNS) {
    if (pattern.test(message)) {
      matchedPatterns.push('sexual');
      type = 'sexual';
      maxSeverity = 'critical';
      break;
    }
  }

  // Physical abuse
  for (const pattern of PHYSICAL_ABUSE_PATTERNS) {
    if (pattern.test(message)) {
      matchedPatterns.push('physical');
      if (!type) type = 'physical';
      if (maxSeverity !== 'critical') maxSeverity = 'elevated';
      break;
    }
  }

  // Emotional abuse
  for (const pattern of EMOTIONAL_ABUSE_PATTERNS) {
    if (pattern.test(message)) {
      matchedPatterns.push('emotional');
      if (!type) type = 'emotional';
      if (maxSeverity === 'signal') maxSeverity = 'elevated';
      break;
    }
  }

  // Neglect
  for (const pattern of NEGLECT_PATTERNS) {
    if (pattern.test(message)) {
      matchedPatterns.push('neglect');
      if (!type) type = 'neglect';
      if (maxSeverity === 'signal') maxSeverity = 'elevated';
      break;
    }
  }

  if (matchedPatterns.length === 0) {
    return { isAbuse: false };
  }

  // Multiple categories = higher severity
  if (matchedPatterns.length >= 2 && maxSeverity !== 'critical') {
    maxSeverity = 'critical';
  }

  return {
    isAbuse: true,
    type,
    severity: maxSeverity,
    interventionMessage: generateInterventionMessage(type!, maxSeverity),
    patterns: matchedPatterns,
  };
}

// ---------------------------------------------------------------------------
// Intervention messages
// ---------------------------------------------------------------------------

function generateInterventionMessage(type: string, severity: string): string {
  if (severity === 'critical') {
    return (
      'What you\'re describing is serious, and it is not okay. You deserve to be safe.\n\n' +
      'Please reach out to someone who can help:\n' +
      '- **Childhelp National Child Abuse Hotline**: 1-800-422-4453 (24/7)\n' +
      '- **Crisis Text Line**: Text HOME to 741741\n' +
      '- Tell a **trusted adult** — a teacher, school counselor, doctor, or another safe person\n\n' +
      'You don\'t have to handle this alone. Help is available right now.'
    );
  }

  return (
    'I hear you, and what you\'re describing sounds really hard. No one deserves to be treated that way.\n\n' +
    'If you ever feel unsafe, there are people who can help:\n' +
    '- **Childhelp Hotline**: 1-800-422-4453 (24/7)\n' +
    '- **Crisis Text Line**: Text HOME to 741741\n' +
    '- A **trusted adult** — someone who will listen and take action\n\n' +
    'You matter, and your safety matters.'
  );
}

/**
 * Alert the team about abuse detection (logs for now, Phase 2: email + guardian).
 */
export async function alertTeamAboutAbuse(details: {
  userId?: string;
  type?: string;
  severity?: string;
  timestamp?: Date;
}): Promise<void> {
  console.warn('[ABUSE ALERT]', {
    ...details,
    timestamp: details.timestamp || new Date(),
    // NEVER log message content
  });
}

/**
 * Record abuse incident for safety tracking (logs for now, Phase 2: database).
 */
export async function recordAbuseIncident(details: {
  userId?: string;
  type?: string;
  severity?: string;
  timestamp?: Date;
}): Promise<void> {
  console.warn('[ABUSE RECORD]', {
    ...details,
    timestamp: details.timestamp || new Date(),
    // NEVER store message content
  });
}
