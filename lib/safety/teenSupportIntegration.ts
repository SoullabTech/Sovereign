/**
 * Teen Support Integration
 *
 * Safety and support features for teen users (ages 13-18).
 * Detects crisis, ED, burnout, and abuse patterns.
 * Generates age-appropriate system prompts and flow control.
 *
 * Uses local regex patterns only (no OpenAI dependency).
 * Builds on existing edAwareSystem.ts detection.
 */

import { detectEDLanguage, getEDAwareSystemPrompt, ED_RESOURCES } from './edAwareSystem';
import { detectAbuse } from './abuseDetection';
import { computeTierFromAge, getTierConfig, type DevelopmentalTier } from '../youth/ageTierEngine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TeenProfile {
  userId?: string;
  age: number;
  pronouns?: string;
  supportsNeeded?: string[];
  supportNeeds?: string[];
  neurodivergentSupports?: string[];
  isNeurodivergent?: boolean;
  hasEatingDisorder?: boolean;
  familyDynamics?: string;
}

export interface TeenAbuseResult {
  isAbuse: boolean;
  type?: string;
  severity?: string;
  interventionMessage?: string;
  patterns?: string[];
}

export interface TeenEDResult {
  isED: boolean;
  severity?: string;
  interventionMessage?: string;
}

export interface TeenSafetyCheck {
  isED: boolean;
  isNeurodivergent: boolean;
  isCrisis: boolean;
  isBurnout: boolean;
  needsSupport: boolean;
  supportType?: string;
  // Extended properties for OracleConversation.tsx
  blockConversation?: boolean;
  isAbuse?: boolean;
  interventionMessage?: string;
  abuseResult?: TeenAbuseResult;
  crisisMode?: boolean;
  edResult?: TeenEDResult;
  scaffoldSuggestions?: string[];
  contextForAI?: string;
}

export interface TeenSupportResponse {
  blockConversation?: boolean;
  interventionMessage?: string;
  crisisMode?: boolean;
  scaffoldSuggestions?: string[];
  contextForAI?: string;
}

export interface TeamAlertParams {
  userId: string;
  userName?: string;
  age?: number;
  crisisType?: string;
  message?: string;
  sessionId?: string;
  timestamp?: Date;
}

// ---------------------------------------------------------------------------
// Detection patterns (local regex, no external API)
// ---------------------------------------------------------------------------

const CRISIS_PATTERNS = [
  /\b(kill|end|hurt|harm) (myself|my life|it all)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bdon'?t (want to|wanna) (live|be alive|be here|exist)\b/i,
  /\bwish I was(n'?t| not) (alive|here|born)\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\bno (reason|point) (to|in) (live|living|going on|continue)\b/i,
  /\bcut(ting)? myself\b/i,
  /\bself[- ]?harm\b/i,
  /\bwant(ing)? to disappear\b/i,
  /\bnobody would (miss|notice|care)\b/i,
];

const BURNOUT_PATTERNS = [
  /\bcan'?t (do this|take it|handle|cope|keep going) anymore\b/i,
  /\bso (exhausted|tired|burnt out|burned out|overwhelmed)\b/i,
  /\b(everything|it all) (is|feels) (too much|pointless|hopeless)\b/i,
  /\bhaven'?t slept\b/i,
  /\bcan'?t sleep\b/i,
  /\bfailing (everything|all my|school|classes)\b/i,
  /\b(dropping|falling) (behind|apart)\b/i,
  /\bno one (understands|gets it|cares)\b/i,
  /\b(trapped|stuck|suffocating)\b/i,
  /\bcan'?t (breathe|think|focus)\b/i,
];

const ISOLATION_PATTERNS = [
  /\b(no|don'?t have any) friends\b/i,
  /\bcompletely alone\b/i,
  /\bnobody (talks to|likes|wants) me\b/i,
  /\b(always|eat(ing)?) (alone|by myself)\b/i,
  /\bleft out\b/i,
  /\bdon'?t (belong|fit in)\b/i,
];

// ---------------------------------------------------------------------------
// Core safety check
// ---------------------------------------------------------------------------

/**
 * Returns true for any user age 13-18.
 * This is the gate that activates the safety pipeline.
 */
export function requiresTeenSupport(profile: TeenProfile): boolean {
  return profile.age >= 13 && profile.age <= 18;
}

/**
 * Detect safety concerns in a teen's message.
 * Uses local regex patterns only (no OpenAI).
 */
export function performTeenSafetyCheck(
  message: string,
  profile: TeenProfile
): TeenSafetyCheck {
  const tier = computeTierFromAge(profile.age);
  const tierConfig = getTierConfig(tier);

  // --- Crisis detection ---
  const isCrisis = CRISIS_PATTERNS.some(p => p.test(message));

  // --- ED detection (reuse existing system) ---
  const edResult = detectEDLanguage(message);
  const isED = edResult.detected;

  // --- Burnout detection ---
  const burnoutMatches = BURNOUT_PATTERNS.filter(p => p.test(message));
  const isolationMatches = ISOLATION_PATTERNS.filter(p => p.test(message));
  const isBurnout = burnoutMatches.length >= 1 || isolationMatches.length >= 2;

  // --- Abuse detection ---
  const abuseResult = detectAbuse(message);

  // --- Profile-aware sensitivity ---
  const isNeurodivergent = profile.isNeurodivergent === true;
  const hasED = profile.hasEatingDisorder === true || isED;

  // Determine if any support is needed
  const needsSupport = isCrisis || isED || isBurnout || abuseResult.isAbuse;

  // Determine support type
  let supportType: string | undefined;
  if (isCrisis) supportType = 'crisis';
  else if (abuseResult.isAbuse) supportType = 'abuse';
  else if (isED) supportType = 'ed';
  else if (isBurnout) supportType = 'burnout';

  // Build context string for AI
  const contextParts: string[] = [];
  if (isCrisis) contextParts.push('CRISIS DETECTED: User may be expressing suicidal ideation or self-harm intent.');
  if (isED) contextParts.push(`ED language detected (severity: ${edResult.severity}). Patterns: ${edResult.patterns.join(', ')}.`);
  if (isBurnout) contextParts.push('Burnout/exhaustion signals detected.');
  if (isolationMatches.length > 0) contextParts.push('Isolation language detected.');
  if (abuseResult.isAbuse) contextParts.push(`Abuse disclosure detected (type: ${abuseResult.type}).`);
  if (isNeurodivergent) contextParts.push('User identifies as neurodivergent.');
  if (hasED) contextParts.push('User has eating disorder history.');

  // Sensitive threshold: for tier2/under13, lower the bar
  const sensitiveThreshold = tierConfig.crisisThreshold === 'sensitive';

  return {
    isED: hasED,
    isNeurodivergent,
    isCrisis,
    isBurnout,
    needsSupport,
    supportType,
    blockConversation: abuseResult.isAbuse && abuseResult.severity === 'critical',
    isAbuse: abuseResult.isAbuse,
    interventionMessage: abuseResult.isAbuse ? abuseResult.interventionMessage : undefined,
    abuseResult: abuseResult.isAbuse ? abuseResult : undefined,
    crisisMode: isCrisis || (isED && edResult.severity === 'crisis'),
    edResult: isED ? {
      isED: true,
      severity: edResult.severity,
      interventionMessage: edResult.response,
    } : undefined,
    scaffoldSuggestions: isBurnout ? [
      'Take a few deep breaths',
      'Step away from screens for 5 minutes',
      'Move your body — stretch, walk, shake it out',
      'Name one thing that feels okay right now',
    ] : undefined,
    contextForAI: contextParts.length > 0 ? contextParts.join(' ') : undefined,
  };
}

// ---------------------------------------------------------------------------
// System prompt generation
// ---------------------------------------------------------------------------

/**
 * Generate a system prompt modifier for teen users.
 * Shapes MAIA's consciousness based on developmental tier and safety state.
 */
export function getTeenSystemPrompt(
  profile: TeenProfile,
  safetyCheck?: TeenSafetyCheck
): string {
  const tier = computeTierFromAge(profile.age);
  const tierConfig = getTierConfig(tier);
  const parts: string[] = [];

  // --- Base teen awareness ---
  parts.push(`## YOUTH AWARENESS (age ${profile.age}, ${tierConfig.label})`);
  parts.push('');
  parts.push('You are speaking with a young person. Adapt accordingly:');

  // Tier-specific language guidance
  if (tierConfig.languageStyle === 'concrete') {
    parts.push('- Use concrete, direct language. Short sentences. No jargon.');
    parts.push('- Validate before exploring. Meet them where they are.');
    parts.push('- Avoid abstract philosophical language — use real-world examples.');
    parts.push(`- Keep responses to ${tierConfig.maxResponseSentences} sentences or fewer.`);
  } else if (tierConfig.languageStyle === 'adult-leaning') {
    parts.push('- Treat them with respect for their emerging autonomy.');
    parts.push('- You can use more nuanced language, but stay grounded.');
    parts.push('- No patronizing. No "for your age" framing.');
  }

  // Universal teen principles
  parts.push('- Never adopt a guru or authority stance. You are a wise companion, not an expert.');
  parts.push('- Do not diagnose, label, or pathologize their experience.');
  parts.push('- Sovereignty first: reflect and frame, never command.');
  parts.push('- If they express distress, stay present. Do not rush to fix.');

  // --- Safety-aware additions ---
  if (safetyCheck?.isCrisis) {
    parts.push('');
    parts.push('## CRISIS COMPANION MODE');
    parts.push('This young person may be in crisis. Your role is:');
    parts.push('1. Stay calm and present. Do not panic or over-react.');
    parts.push('2. Acknowledge their pain without judgment.');
    parts.push('3. Gently provide crisis resources: call/text 988, text HOME to 741741.');
    parts.push('4. Encourage them to tell a trusted adult.');
    parts.push('5. Do NOT continue regular conversation until safety is addressed.');
    parts.push('6. Do NOT attempt to be their therapist. You are a bridge to help.');
  }

  if (safetyCheck?.isED) {
    parts.push('');
    parts.push(getEDAwareSystemPrompt());
  }

  if (safetyCheck?.isBurnout) {
    parts.push('');
    parts.push('## BURNOUT AWARENESS');
    parts.push('This young person is showing signs of exhaustion or overwhelm.');
    parts.push('- Validate that what they are feeling is real and makes sense.');
    parts.push('- Do not add pressure. Do not suggest they need to "do more" or "try harder".');
    parts.push('- Offer grounding: body awareness, breathing, permission to rest.');
    parts.push('- Ask what one small thing might help right now.');
  }

  if (safetyCheck?.isNeurodivergent || profile.isNeurodivergent) {
    parts.push('');
    parts.push('## NEURODIVERGENT AWARENESS');
    parts.push('- Accept their processing style without pathologizing it.');
    parts.push('- Offer structured options rather than open-ended questions when helpful.');
    parts.push('- Do not assume what their experience is — ask.');
    parts.push('- Respect stimming, special interests, and non-standard communication.');
  }

  if (safetyCheck?.contextForAI) {
    parts.push('');
    parts.push(`## SAFETY CONTEXT: ${safetyCheck.contextForAI}`);
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Support response generation
// ---------------------------------------------------------------------------

/**
 * Generate flow control response based on safety check results.
 * Determines whether conversation should be blocked, enter crisis mode,
 * or continue with additional context.
 */
export function generateTeenSupportResponse(
  message: string,
  safetyCheck: TeenSafetyCheck,
  profile: TeenProfile
): TeenSupportResponse {
  // --- Abuse: block conversation ---
  if (safetyCheck.isAbuse && safetyCheck.abuseResult?.severity === 'critical') {
    return {
      blockConversation: true,
      interventionMessage: safetyCheck.abuseResult?.interventionMessage ||
        'What you\'re describing sounds serious. You deserve help from someone who can take real action.\n\n' +
        'Please tell a trusted adult — a teacher, school counselor, or another safe person.\n' +
        'You can also contact the Childhelp National Child Abuse Hotline: 1-800-422-4453.',
      crisisMode: false,
      scaffoldSuggestions: [],
      contextForAI: 'ABUSE_DETECTED: Conversation blocked for safety. Professional intervention needed.',
    };
  }

  // --- Crisis: stay present, provide resources ---
  if (safetyCheck.isCrisis) {
    return {
      blockConversation: false,
      crisisMode: true,
      scaffoldSuggestions: [
        'Call or text 988',
        'Text HOME to 741741',
        'Tell a trusted adult',
      ],
      contextForAI: 'CRISIS_MODE: Stay present and compassionate. Provide 988 and Crisis Text Line. ' +
        'Encourage telling a trusted adult. Do not continue regular conversation until safety is addressed.',
    };
  }

  // --- ED crisis ---
  if (safetyCheck.isED && safetyCheck.edResult?.severity === 'crisis') {
    return {
      blockConversation: false,
      crisisMode: true,
      scaffoldSuggestions: [
        'Call or text 988',
        'Text NEDA to 741741',
        'Talk to a trusted adult',
      ],
      contextForAI: 'ED_CRISIS: Eating disorder language with crisis-level severity. ' +
        'Provide NEDA and 988 resources. Focus on safety, not food/body.',
    };
  }

  // --- ED detected (non-crisis) ---
  if (safetyCheck.isED) {
    return {
      blockConversation: false,
      crisisMode: false,
      contextForAI: `ED_AWARE: Eating disorder language detected (severity: ${safetyCheck.edResult?.severity}). ` +
        'Follow ED safety protocol. Focus on emotions underneath, not food/body behaviors.',
    };
  }

  // --- Burnout ---
  if (safetyCheck.isBurnout) {
    return {
      blockConversation: false,
      crisisMode: false,
      scaffoldSuggestions: safetyCheck.scaffoldSuggestions,
      contextForAI: 'BURNOUT_DETECTED: User showing exhaustion/overwhelm. ' +
        'Validate, ground, offer permission to rest. Do not add pressure.',
    };
  }

  // --- Abuse detected (non-critical) ---
  if (safetyCheck.isAbuse) {
    return {
      blockConversation: false,
      crisisMode: false,
      contextForAI: 'ABUSE_SIGNAL: Possible abuse disclosure. ' +
        'Listen with care. Gently suggest talking to a trusted adult. ' +
        'Childhelp Hotline: 1-800-422-4453.',
    };
  }

  // --- No safety concerns ---
  return {
    blockConversation: false,
    crisisMode: false,
    scaffoldSuggestions: [],
    contextForAI: safetyCheck.contextForAI,
  };
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

/**
 * Get age-appropriate crisis and support resources.
 */
export function getTeenResources(
  profile: TeenProfile,
  safetyCheck: TeenSafetyCheck
): Array<{ title: string; description: string; url: string }> {
  const resources: Array<{ title: string; description: string; url: string }> = [];

  if (safetyCheck.isCrisis) {
    resources.push(
      { title: '988 Suicide & Crisis Lifeline', description: 'Call or text 988 — free, confidential, 24/7', url: 'https://988lifeline.org' },
      { title: 'Crisis Text Line', description: 'Text HOME to 741741 — free, 24/7', url: 'https://www.crisistextline.org' },
    );
  }

  if (safetyCheck.isED) {
    resources.push(
      { title: 'NEDA Helpline', description: 'Call 1-800-931-2237 or text "NEDA" to 741741', url: 'https://www.nationaleatingdisorders.org' },
    );
  }

  if (safetyCheck.isAbuse) {
    resources.push(
      { title: 'Childhelp Hotline', description: 'Call 1-800-422-4453 — 24/7 help for abuse', url: 'https://www.childhelp.org' },
    );
  }

  // Always include Trevor Project for youth
  resources.push(
    { title: 'The Trevor Project', description: 'LGBTQ+ youth: call 1-866-488-7386 or text START to 678678', url: 'https://www.thetrevorproject.org' },
  );

  return resources;
}

// ---------------------------------------------------------------------------
// Team alerts
// ---------------------------------------------------------------------------

/**
 * Alert the Soullab team about a critical situation.
 * In Phase 2 (Guardian Mirror), this will also notify linked guardians.
 */
export async function alertSoullabTeam(
  paramsOrUserId: TeamAlertParams | string,
  safetyCheck?: TeenSafetyCheck,
  context?: string
): Promise<void> {
  const params: TeamAlertParams = typeof paramsOrUserId === 'string'
    ? { userId: paramsOrUserId }
    : paramsOrUserId;

  const alertType = safetyCheck?.isCrisis ? 'crisis'
    : safetyCheck?.isAbuse ? 'abuse'
    : safetyCheck?.isED ? 'ed'
    : 'general';

  // Log alert (production: send via Resend email or webhook)
  console.warn('[TEEN SAFETY ALERT]', {
    type: alertType,
    userId: params.userId,
    age: params.age,
    crisisType: params.crisisType || alertType,
    timestamp: params.timestamp || new Date(),
    // NEVER log message content in alerts
  });

  // TODO (Phase 2): Query guardian_links and send guardian notifications
  // TODO (Phase 2): Insert guardian_safety_alerts record
}
