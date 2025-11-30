import type { Session, MemoryItem, SessionStats } from "../types";

export interface FlowResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface LearningFlowStart {
  session: Session;
  initialMemory: MemoryItem;
}

export interface LearningFlowInteraction {
  memory: MemoryItem;
  insights: string[];
}

export interface LearningFlowCompletion {
  sessionStats: SessionStats;
  finalInsights: string[];
}
