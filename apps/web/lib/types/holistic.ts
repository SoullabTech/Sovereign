// lib/types/holistic.ts
export enum HolisticDomain {
  MIND = "mind",
  BODY = "body",
  SPIRIT = "spirit",
  EMOTIONS = "emotions",
}

export enum DevelopmentStage {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum UserState {
  STRESSED = "stressed",
  SEEKING_CLARITY = "seeking_clarity",
  DISCONNECTED = "disconnected",
  PHYSICAL_CONCERNS = "physical_concerns",
  BALANCED = "balanced",
  ENERGIZED = "energized",
  REFLECTIVE = "reflective",
}

export interface HolisticState {
  mind: number;
  body: number;
  spirit: number;
  emotions: number;
}

export interface DomainProfile {
  domain: HolisticDomain;
  currentLevel: number;
  developmentStage: DevelopmentStage;
  strengths: string[];
  growthEdges: string[];
  practicesEngaged: string[];
  lastAssessment: Date;
}

export interface IntegrationGate {
  id: string;
  name: string;
  requiredDomains: HolisticDomain[];
  minimumScore: number;
  integrationPeriod: number; // days
  completed: boolean;
  requirements: any[];
}

export interface DevelopmentProfile {
  userId: string;
  currentState: HolisticState;
  userState: UserState;
  domains: DomainProfile[];
  completedGates: string[];
  integrationJourney: IntegrationJourney[];
  bypassingPatterns: BypassingPattern[];
}

export interface IntegrationJourney {
  id: string;
  insight: string;
  domain: HolisticDomain;
  realWorldApplication: string;
  communityValidation: boolean;
  integrationDate: Date;
}

export interface BypassingPattern {
  id: string;
  pattern: string;
  frequency: number;
  interventions: string[];
  resolved: boolean;
}

export interface UserHolisticProfile {
  userId: string;
  domains: DomainProfile[];
  currentState: UserState;
  stressLevel: number;
  energyLevel: number;
  developmentGoals: DevelopmentGoal[];
  lastUpdated: Date;
}

export interface DevelopmentGoal {
  id: string;
  domain: HolisticDomain;
  description: string;
  targetDate?: Date;
  milestones: Milestone[];
  priority: "high" | "medium" | "low";
}

export interface Milestone {
  id: string;
  description: string;
  completed: boolean;
  completedDate?: Date;
}
