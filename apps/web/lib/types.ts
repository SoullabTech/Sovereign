/**
 * Shared TypeScript type definitions for the SpiralogicOracleSystem
 */

// Re-export elemental types
export { ElementalArchetype } from './types/elemental';

// Analytics Types
export interface UserDevelopmentMetrics {
  userId: string;
  metrics: Record<string, any>;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  metrics: Record<string, any>;
}

export interface ResearchInsights {
  insights: string[];
  trends: Record<string, any>;
}

export interface AnalyticsData {
  userMetrics?: UserDevelopmentMetrics;
  platformAnalytics?: PlatformAnalytics;
  researchInsights?: ResearchInsights;
}

// Memory and Emotion Types
export interface EmotionData {
  valence?: number;      // -1 (negative) to +1 (positive)
  arousal?: number;      // 0 (calm) to 1 (excited)
  dominance?: number;    // 0 (submissive) to 1 (dominant)
  energySignature?: string;
}

export interface Memory {
  id?: string;
  userId: string;
  content?: string;
  emotion?: EmotionData;
  created_at: string;
  updated_at?: string;
  type?: 'text' | 'voice' | 'journal' | 'image';
  metadata?: Record<string, any>;
}

export interface EmotionalState {
  valence: number;
  arousal: number;
  dominance: number;
  timestamp: string;
  source: 'voice' | 'text' | 'journal';
  content_preview: string;
}

export interface EmotionalTrend {
  date: string;
  avg_valence: number;
  avg_arousal: number;
  avg_dominance: number;
  entry_count: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

// Session Types
export interface SessionUser {
  email: string;
  name?: string;
  image?: string;
}

// Oracle Types
export interface OracleResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface DaimonicAgent {
  agentId: string;
  response: {
    phenomenological: {
      primary: string;
      tone: string;
    };
    dialogical: {
      questions: string[];
      resistances: string[];
      reflections: string[];
    };
    architectural: {
      synaptic_gap: any;
    };
    system: {
      requires_pause: boolean;
      offers_practice: boolean;
    };
  };
  perspective_signature: string;
  resistance_focus: string;
  dialogical_bridge: string;
}

export interface CollectiveDynamics {
  diversity_score: number;
  productive_tension: number;
  synthetic_emergence_potential: number;
  requires_mediation: boolean;
}

// Collective Intelligence Types
export interface FieldState {
  coherence: number;
  participants: number;
  energy?: number;
  momentum?: number;
}

export interface Pattern {
  id: string;
  type: string;
  strength: number;
  description?: string;
  timestamp?: string;
}

export interface Contribution {
  userId: string;
  value: number;
  timestamp: string;
  type?: string;
}

// File Types
export interface FileMetadata {
  id: string;
  filename: string;
  userId: string;
  mimeType: string;
  size: number;
  embeddings?: number[][];
  created_at: string;
  updated_at?: string;
}