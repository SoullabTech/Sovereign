// lib/types/integration.ts
export type IntegrationStage =
  | "initial_insight"
  | "reflection_gap"
  | "reality_application"
  | "daily_integration"
  | "embodied_wisdom"
  | "spiral_revisit";

export interface SpiralProgressPoint {
  id: string;
  theme: string;
  phase: string;
  depth: number;
  realWorldApplication: string[];
  communityValidation: boolean;
  bypassingRisk: number;
  integrationQuality: number;
  createdAt: Date;
}

export interface IntegrationArchitecture {
  userId: string;
  currentStage: IntegrationStage;
  spiralProgress: SpiralProgressPoint[];
  embodiedWisdom: EmbodiedWisdom;
  gatesCompleted: string[];
  bypassingDetections: BypassingDetection[];
  integrationGaps: IntegrationGap[];
  communityConnections: CommunityConnection[];
}

export interface EmbodiedWisdom {
  livedExperiences: LivedExperience[];
  mistakesAndStruggles: MistakeReflection[];
  ordinaryMomentAwareness: OrdinaryMoment[];
  consistencyMetrics: ConsistencyMetric[];
}

export interface LivedExperience {
  id: string;
  insight: string;
  experience: string;
  integration: string;
  embodimentQuality: number;
  realWorldImpact: string;
  timestamp: Date;
}

export interface MistakeReflection {
  id: string;
  mistake: string;
  learning: string;
  growthEdge: string;
  preventionStrategy: string;
  wisdomGained: string;
  timestamp: Date;
}

export interface OrdinaryMoment {
  id: string;
  moment: string;
  awareness: string;
  integration: string;
  qualityOfPresence: number;
  timestamp: Date;
}

export interface ConsistencyMetric {
  id: string;
  practice: string;
  frequency: number;
  quality: number;
  duration: number;
  realWorldApplication: string;
  period: string;
}

export interface BypassingDetection {
  id: string;
  pattern: string;
  severity: "low" | "medium" | "high";
  intervention: string;
  resolved: boolean;
  timestamp: Date;
}

export interface IntegrationGap {
  id: string;
  content: string;
  gapType: "reflection" | "application" | "community" | "embodiment";
  status: "pending" | "processing" | "completed";
  requirements: string[];
  dueDate: Date;
}

export interface CommunityConnection {
  id: string;
  type: "reality_check" | "support" | "accountability" | "wisdom_share";
  participants: string[];
  status: "active" | "completed" | "paused";
  lastActivity: Date;
}
