/**
 * Teen Support Integration - STUB (Implementation pending)
 * Safety and support features for teen users (ages 13-18)
 */

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

/**
 * Alert the Soullab team about a critical situation (stub)
 */
export async function alertSoullabTeam(
  paramsOrUserId: TeamAlertParams | string,
  safetyCheck?: TeenSafetyCheck,
  context?: string
): Promise<void> {
  if (typeof paramsOrUserId === 'object') {
    console.warn('[TEEN SAFETY] Alert triggered (stub):', paramsOrUserId);
  } else {
    console.warn('[TEEN SAFETY] Alert triggered (stub):', { userId: paramsOrUserId, safetyCheck, context });
  }
}

export function performTeenSafetyCheck(
  message: string,
  profile: TeenProfile
): TeenSafetyCheck {
  return {
    isED: false,
    isNeurodivergent: false,
    isCrisis: false,
    isBurnout: false,
    needsSupport: false
  };
}

export function getTeenSystemPrompt(
  profile: TeenProfile,
  safetyCheck?: TeenSafetyCheck
): string {
  return '';
}

export function generateTeenSupportResponse(
  message: string,
  safetyCheck: TeenSafetyCheck,
  profile: TeenProfile
): TeenSupportResponse {
  return {
    blockConversation: false,
    interventionMessage: undefined,
    crisisMode: false,
    scaffoldSuggestions: [],
    contextForAI: undefined
  };
}

export function requiresTeenSupport(profile: TeenProfile): boolean {
  return false;
}

export function getTeenResources(
  profile: TeenProfile,
  safetyCheck: TeenSafetyCheck
): Array<{title: string; description: string; url: string}> {
  return [];
}
