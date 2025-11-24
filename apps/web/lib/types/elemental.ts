// lib/types/elemental.ts
export enum ElementalArchetype {
  FIRE = "fire",
  WATER = "water",
  EARTH = "earth",
  AIR = "air",
}

export enum ContentComplexity {
  FOUNDATIONAL = "foundational",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  INTEGRATION_FOCUSED = "integration_focused",
}

export enum ContentType {
  INSIGHT = "insight",
  PRACTICE = "practice",
  REFLECTION = "reflection",
  INTEGRATION_EXERCISE = "integration_exercise",
  REALITY_CHECK = "reality_check",
  COMMUNITY_PROMPT = "community_prompt",
}

export interface ElementalState {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

export interface ElementalContent {
  id: string;
  archetype: ElementalArchetype;
  title: string;
  description: string;
  content: string;
  contentType: ContentType;
  complexity: ContentComplexity;
  metaphoricalFraming: string;
  realWorldApplications: string[];
  disclaimers: string[];
  integrationPeriod: number;
  estimatedEngagementTime: number;
}

export interface ContentRecommendation {
  content: ElementalContent;
  integrationReadiness: number;
  adaptationReason: string;
  recommendedApproach: string;
  realityGroundingPrompts: string[];
  pacingRecommendation: {
    waitTime?: number;
    reason?: string;
  };
}

export interface ContentDeliveryContext {
  userProfile: any;
  userState: string;
  recentActivity: any;
  integrationCapacity: number;
  bypassingRisk: number;
}

export interface ContentAdaptationSettings {
  emphasizeMetaphorical: boolean;
  includeDisclaimers: boolean;
  requireCommunityValidation: boolean;
  enableCrossDomainIntegration: boolean;
  preventConsumptionBehavior: boolean;
  minimumIntegrationGaps: number;
}

export interface UserElementalProfile {
  userId: string;
  currentState: ElementalState;
  integrationProgress: Record<string, number>;
  lastAssessment: Date;
}
