/**
 * Teen Support Integration - STUB (Implementation pending)
 * Safety and support features for teen users (ages 13-18)
 */

export interface TeenProfile {
  userId: string;
  age: number;
  pronouns?: string;
  supportsNeeded: string[];
  neurodivergentSupports?: string[];
  // OracleConversation-expected properties
  isNeurodivergent?: boolean;
  hasEatingDisorder?: boolean;
  familyDynamics?: string;
  supportNeeds?: string[];
}

export interface AbuseResult {
  detected: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'crisis';
  supportResources?: string[];
  interventionNeeded?: boolean;
  patterns?: string[];
}

export interface EDResult {
  detected: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'crisis';
  supportResources?: string[];
  requiresProfessional?: boolean;
}

export interface TeenSafetyCheck {
  isED: boolean;
  isNeurodivergent: boolean;
  isCrisis: boolean;
  isBurnout: boolean;
  needsSupport: boolean;
  supportType?: string;
  // OracleConversation-expected properties
  blockConversation?: boolean;
  isAbuse?: boolean;
  interventionMessage?: string;
  abuseResult?: AbuseResult;
  crisisMode?: boolean;
  edResult?: EDResult;
  scaffoldSuggestions?: string[];
  contextForAI?: string;
}

export function performTeenSafetyCheck(
  message: string,
  profile: TeenProfile
): TeenSafetyCheck {
  return {
    isED: false,
    isNeurodivergent: profile.isNeurodivergent ?? false,
    isCrisis: false,
    isBurnout: false,
    needsSupport: false,
    blockConversation: false,
    isAbuse: false,
    crisisMode: false,
  };
}

export function getTeenSystemPrompt(
  profile: TeenProfile,
  safetyCheck?: TeenSafetyCheck
): string {
  return '';
}

export interface TeenSupportResponse {
  blockConversation?: boolean;
  interventionMessage?: string;
  crisisMode?: boolean;
  scaffoldSuggestions?: string[];
  contextForAI?: string;
}

export function generateTeenSupportResponse(
  message: string,
  safetyCheck: TeenSafetyCheck,
  profile: TeenProfile
): TeenSupportResponse {
  return {
    blockConversation: false,
    crisisMode: false,
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

/**
 * Alert Soullab team for critical teen safety situations (stub)
 */
export function alertSoullabTeam(params: {
  userId: string;
  userName?: string;
  profile?: TeenProfile;
  safetyCheck?: TeenSafetyCheck;
  message: string;
  // OracleConversation-expected properties
  age?: number;
  crisisType?: string;
  sessionId?: string;
  timestamp?: Date;
}): Promise<void> {
  console.warn('[TeenSupport] alertSoullabTeam called (stub)', params.userId);
  return Promise.resolve();
}
