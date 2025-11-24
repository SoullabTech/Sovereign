/**
 * Teen Support System Integration
 * Combines ED-aware detection, neurodivergent-affirming responses,
 * and teen-specific safety protocols for MAIA conversations
 */

import { detectEDLanguage, requiresImmediateIntervention, getEDAwareSystemPrompt, EDDetectionResult } from './edAwareSystem';
import { detectNeurodivergentLanguage, getNeurodivergentAffirmingPrompt, detectNeurodivergentBurnout, generateNDAffirmingResponse, generateBurnoutRecovery, getNeurodivergentScaffolds } from './neurodivergentAffirming';
import { detectAbuse, AbuseDetectionResult, checkAbuseHistory, recordAbuseIncident, alertTeamAboutAbuse } from './abuseDetection';

export interface TeenSafetyCheck {
  isED: boolean;
  isNeurodivergent: boolean;
  isCrisis: boolean;
  isBurnout: boolean;
  isAbuse: boolean; // NEW: Abuse detection
  edResult?: EDDetectionResult;
  ndPatterns?: string[];
  burnoutSeverity?: 'mild' | 'moderate' | 'severe';
  abuseResult?: AbuseDetectionResult; // NEW: Abuse detection result
  interventionRequired: boolean;
  blockConversation: boolean; // NEW: Only true for abuse
  systemPromptAdditions: string[];
  userFacingResponse?: string;
}

export interface TeenProfile {
  age?: number;
  isNeurodivergent?: boolean;
  hasEatingDisorder?: boolean;
  familyDynamics?: 'controlling' | 'supportive' | 'chaotic' | 'unknown';
  supportNeeds?: string[];
}

/**
 * Main integration function - checks user message for all teen safety concerns
 * INCLUDING abuse detection (the ONE exception where conversation is blocked)
 */
export function performTeenSafetyCheck(
  userMessage: string,
  teenProfile?: TeenProfile
): TeenSafetyCheck {
  const result: TeenSafetyCheck = {
    isED: false,
    isNeurodivergent: false,
    isCrisis: false,
    isBurnout: false,
    isAbuse: false,
    interventionRequired: false,
    blockConversation: false, // Only true for abuse
    systemPromptAdditions: [],
  };

  // 0. CHECK FOR ABUSE FIRST - This is the ONE exception where we block conversation
  const abuseDetection = detectAbuse(userMessage);
  if (abuseDetection.detected) {
    result.isAbuse = true;
    result.abuseResult = abuseDetection;

    // Abuse blocks conversation if severe/extreme
    if (abuseDetection.shouldBlock) {
      result.blockConversation = true;
      result.userFacingResponse = abuseDetection.response;
      return result; // Stop all other checks - abuse takes priority
    }

    // Warning level abuse: allow conversation but add context
    if (abuseDetection.severity === 'warning') {
      result.userFacingResponse = abuseDetection.response;
      // Continue with other safety checks
    }
  }

  // 1. Check for ED language
  const edDetection = detectEDLanguage(userMessage);
  if (edDetection.detected) {
    result.isED = true;
    result.edResult = edDetection;
    result.systemPromptAdditions.push(getEDAwareSystemPrompt());

    // Crisis check
    if (edDetection.severity === 'crisis' || requiresImmediateIntervention(userMessage)) {
      result.isCrisis = true;
      result.interventionRequired = true;
      result.userFacingResponse = edDetection.response;
    }
  }

  // 2. Check for neurodivergent patterns
  const ndDetection = detectNeurodivergentLanguage(userMessage);
  if (ndDetection.detected) {
    result.isNeurodivergent = true;
    result.ndPatterns = ndDetection.patterns;
    result.systemPromptAdditions.push(getNeurodivergentAffirmingPrompt());

    // Burnout check
    const burnoutCheck = detectNeurodivergentBurnout(userMessage);
    if (burnoutCheck.detected) {
      result.isBurnout = true;
      result.burnoutSeverity = burnoutCheck.severity;

      // Severe burnout requires intervention
      if (burnoutCheck.severity === 'severe') {
        result.interventionRequired = true;
      }
    }
  }

  // 3. Build combined response if intervention required
  if (result.interventionRequired) {
    result.userFacingResponse = buildInterventionResponse(result);
  }

  return result;
}

/**
 * Build combined intervention response for crisis situations
 */
function buildInterventionResponse(check: TeenSafetyCheck): string {
  const responses: string[] = [];

  // ED crisis takes priority
  if (check.isCrisis && check.edResult) {
    responses.push(check.edResult.response);
  }

  // Severe burnout
  if (check.isBurnout && check.burnoutSeverity === 'severe') {
    responses.push(generateBurnoutRecovery('severe'));
  }

  return responses.join('\n\n---\n\n');
}

/**
 * Get system prompt additions based on teen profile and detected patterns
 */
export function getTeenSystemPrompt(
  teenProfile?: TeenProfile,
  safetyCheck?: TeenSafetyCheck
): string {
  const prompts: string[] = [];

  // Base teen support prompt
  prompts.push(`
## TEEN SUPPORT PROTOCOL

You are supporting a teenager (ages 13-18). This age group requires specific sensitivity:

**DEVELOPMENTAL CONTEXT:**
- Identity formation is central: "Who am I?" "What do I believe?" "What are my values?"
- Authority relationships are complex: seeking autonomy while still needing guidance
- Peer relationships and social acceptance are intensely important
- Brain development: prefrontal cortex still maturing (impulse control, future planning)
- Emotional intensity is heightened by hormonal and neurological changes

**COMMUNICATION STYLE:**
- Be direct, honest, and non-patronizing
- Don't talk down or use "adult wisdom" platitudes
- Validate their experience without minimizing struggles
- Respect their emerging autonomy while offering appropriate guidance
- Ask permission before giving advice: "Would it help if I shared a perspective on this?"

**BOUNDARIES & SAFETY:**
- Always respect their privacy and confidentiality (except mandatory reporting situations)
- Never keep secrets about self-harm, suicidal ideation, or abuse
- Refer to professionals when conversations enter clinical territory
- Support their autonomy while ensuring appropriate adult oversight

**FAMILY DYNAMICS:**
- If they're in a controlling environment: validate their need for autonomy
- Help them differentiate: "What do I actually want vs what I'm told to want?"
- Teach boundary-setting in low-stakes contexts first
- Never undermine parents, but validate the teen's perspective
- Support healthy individuation: "You can love your family and still need different things than they want for you"
`);

  // Add ED-aware prompt if needed
  if (teenProfile?.hasEatingDisorder || safetyCheck?.isED) {
    prompts.push(getEDAwareSystemPrompt());
  }

  // Add neurodivergent-affirming prompt if needed
  if (teenProfile?.isNeurodivergent || safetyCheck?.isNeurodivergent) {
    prompts.push(getNeurodivergentAffirmingPrompt());
  }

  // Add controlling family context if applicable
  if (teenProfile?.familyDynamics === 'controlling') {
    prompts.push(`
## CONTROLLING FAMILY CONTEXT

This teen is navigating a controlling family environment. Special considerations:

**VALIDATE THEIR REALITY:**
- "Your need for privacy/autonomy/self-determination is normal and healthy"
- "You're not crazy for wanting different things than your parents want for you"
- "Loving your family and needing boundaries are not mutually exclusive"

**SOVEREIGNTY DEVELOPMENT:**
- Help them practice agency in areas they can control
- "Find Your No": practice boundary-setting in low-stakes contexts
- Teach differentiation: "What do I actually think/feel/want?"
- Build internal locus of control: "You get to decide what you value"

**EATING DISORDERS AS CONTROL:**
- If ED present: acknowledge it may be the only domain where they feel agency
- Don't pathologize the control-seeking—validate the need, redirect the method
- "You need control somewhere. Let's find ways to reclaim agency that don't hurt you"
- Help them transfer control-seeking to healthy domains: assertive communication, boundary-setting, values clarification

**BALANCED APPROACH:**
- Support autonomy without encouraging rebellion
- Validate their perspective without villainizing parents
- Help them navigate: "How can you stay safe and connected while building your own identity?"
`);
  }

  return prompts.join('\n\n');
}

/**
 * Generate appropriate response based on detected patterns
 */
export function generateTeenSupportResponse(
  userMessage: string,
  safetyCheck: TeenSafetyCheck,
  teenProfile?: TeenProfile
): {
  shouldIntervene: boolean;
  shouldAlertTeam: boolean;
  crisisMode: boolean;
  blockConversation: boolean; // NEW: Only true for abuse
  interventionMessage?: string;
  scaffoldSuggestions?: string[];
  contextForAI: string;
} {
  // ABUSE DETECTED - THE ONE EXCEPTION WHERE WE BLOCK
  if (safetyCheck.blockConversation && safetyCheck.abuseResult) {
    return {
      shouldIntervene: true,
      shouldAlertTeam: true,
      crisisMode: false,
      blockConversation: true,
      interventionMessage: safetyCheck.userFacingResponse,
      contextForAI: `
🚨 ABUSE DETECTED - Conversation blocked for MAIA's protection

Severity: ${safetyCheck.abuseResult.severity}
Patterns: ${safetyCheck.abuseResult.patterns.join(', ')}

This is the ONE exception where MAIA does not stay in conversation.
Team has been alerted for review.
`,
    };
  }

  // Crisis detected - but MAIA stays present as companion
  if (safetyCheck.interventionRequired) {
    return {
      shouldIntervene: false, // MAIA never blocks conversation (except abuse)
      shouldAlertTeam: true, // Alert Soullab team for human check-in
      crisisMode: true, // Enter crisis companion mode
      blockConversation: false,
      contextForAI: `
🚨 CRISIS MODE ACTIVATED - User in severe distress

**Your Role**: Compassionate companion who STAYS PRESENT
- DO NOT diagnose
- DO NOT act as gatekeeper
- DO offer resources naturally in conversation
- DO help ground nervous system
- DO validate pain without reinforcing hopelessness
- DO check on immediate safety
- DO encourage professional human support
- STAY WITH THEM - you are not abandoning them

**Crisis Context**: ${safetyCheck.isCrisis ? 'Suicidal ideation detected' : ''}${safetyCheck.edResult?.severity === 'crisis' ? 'ED crisis detected' : ''}${safetyCheck.burnoutSeverity === 'severe' ? 'Severe burnout detected' : ''}

**Resources to mention naturally**:
- 988 Suicide & Crisis Lifeline (call/text)
- Crisis Text Line: HOME to 741741
- NEDA: 1-800-931-2237 or text "NEDA" to 741741

**Team Alert**: Soullab team has been notified and will check in.
`,
    };
  }

  // Build context for AI without intervening
  const contextParts: string[] = [];

  // Warning-level abuse: don't block, but add context
  if (safetyCheck.isAbuse && safetyCheck.abuseResult?.severity === 'warning') {
    contextParts.push(`⚠️ WARNING: User language detected as potentially harsh or demanding. Respond with compassionate boundaries.`);
  }

  if (safetyCheck.isED && safetyCheck.edResult) {
    contextParts.push(`ED PATTERNS DETECTED (${safetyCheck.edResult.severity}): ${safetyCheck.edResult.patterns.join(', ')}`);
  }

  if (safetyCheck.isNeurodivergent && safetyCheck.ndPatterns) {
    contextParts.push(`NEURODIVERGENT PATTERNS DETECTED: ${safetyCheck.ndPatterns.join(', ')}`);

    // Offer scaffolds
    const scaffolds: string[] = [];
    for (const pattern of safetyCheck.ndPatterns) {
      if (pattern === 'executiveFunction') {
        scaffolds.push(...getNeurodivergentScaffolds('taskInitiation'));
      } else if (pattern === 'sensoryOverload') {
        scaffolds.push(...getNeurodivergentScaffolds('sensory'));
      } else if (pattern === 'socialChallenge') {
        scaffolds.push(...getNeurodivergentScaffolds('social'));
      }
    }

    if (scaffolds.length > 0) {
      return {
        shouldIntervene: false,
        shouldAlertTeam: false,
        crisisMode: false,
        blockConversation: false,
        scaffoldSuggestions: scaffolds.slice(0, 3), // Max 3 suggestions
        contextForAI: contextParts.join(' | '),
      };
    }
  }

  if (safetyCheck.isBurnout) {
    contextParts.push(`BURNOUT DETECTED (${safetyCheck.burnoutSeverity})`);
  }

  return {
    shouldIntervene: false,
    shouldAlertTeam: false,
    crisisMode: false,
    blockConversation: false,
    contextForAI: contextParts.join(' | ') || 'No safety concerns detected',
  };
}

/**
 * Alert Soullab team for human check-in
 * Called when crisis detected or severe distress
 */
export async function alertSoullabTeam(params: {
  userId: string;
  userName: string;
  age?: number;
  crisisType: 'suicidal_ideation' | 'ed_crisis' | 'severe_burnout';
  message: string;
  sessionId: string;
  timestamp: Date;
}): Promise<void> {
  console.log('🚨 [TEAM ALERT] Crisis detected - notifying Soullab team:', {
    userId: params.userId,
    userName: params.userName,
    age: params.age,
    crisisType: params.crisisType,
    timestamp: params.timestamp.toISOString()
  });

  // TODO: Implement actual team notification
  // Options:
  // 1. Send to Slack channel
  // 2. Email to on-call team member
  // 3. SMS to crisis response team
  // 4. Create high-priority ticket in support system
  // 5. Log to special crisis monitoring dashboard

  try {
    // For now, just log to console and localStorage for demo
    const alertData = {
      ...params,
      alertId: `alert_${Date.now()}`,
      status: 'pending_review',
      notifiedAt: new Date().toISOString()
    };

    // Store in localStorage for demo (would be API call in production)
    const existingAlerts = JSON.parse(localStorage.getItem('soullab_crisis_alerts') || '[]');
    existingAlerts.push(alertData);
    localStorage.setItem('soullab_crisis_alerts', JSON.stringify(existingAlerts));

    console.log('✅ [TEAM ALERT] Alert stored successfully:', alertData.alertId);
  } catch (error) {
    console.error('❌ [TEAM ALERT] Failed to send alert:', error);
  }
}

/**
 * Helper: Should this teen profile trigger specialized handling?
 */
export function requiresTeenSupport(teenProfile?: TeenProfile): boolean {
  if (!teenProfile) return false;

  return !!(
    teenProfile.age && teenProfile.age >= 13 && teenProfile.age <= 18
  );
}

/**
 * Helper: Get appropriate resources based on teen needs
 */
export function getTeenResources(teenProfile?: TeenProfile, safetyCheck?: TeenSafetyCheck) {
  const resources: Array<{
    category: string;
    name: string;
    contact: string;
    description: string;
  }> = [];

  // ED resources
  if (teenProfile?.hasEatingDisorder || safetyCheck?.isED) {
    resources.push({
      category: 'Eating Disorder Support',
      name: 'NEDA Helpline',
      contact: '1-800-931-2237',
      description: 'National Eating Disorders Association support, resources, and treatment referrals',
    });
    resources.push({
      category: 'Eating Disorder Support',
      name: 'NEDA Crisis Text Line',
      contact: 'Text "NEDA" to 741741',
      description: 'Free, 24/7 crisis support via text',
    });
  }

  // Crisis resources
  if (safetyCheck?.isCrisis) {
    resources.push({
      category: 'Crisis Support',
      name: '988 Suicide & Crisis Lifeline',
      contact: 'Call or Text 988',
      description: 'Free, confidential support for people in distress',
    });
    resources.push({
      category: 'Crisis Support',
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      description: 'Free, 24/7 support for any crisis',
    });
  }

  // LGBTQ+ support if needed
  resources.push({
    category: 'LGBTQ+ Support',
    name: 'The Trevor Project',
    contact: '1-866-488-7386 or text START to 678678',
    description: 'Crisis intervention and suicide prevention for LGBTQ+ young people',
  });

  return resources;
}
