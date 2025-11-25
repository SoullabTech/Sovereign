/**
 * 🌸 Offering Sessions Types
 * TypeScript types for the Holoflower offering system
 */

export type OfferingStatus = 'rest' | 'offering' | 'bloom' | 'transcendent';

export interface OfferingSession {
  id: string;
  user_id: string;
  session_date: string; // ISO date string
  status: OfferingStatus;
  petal_scores?: number[]; // Array of 8 petal strength scores [0-10]
  selected_petals?: string[]; // Array of selected petal elements
  oracle_reflection?: string;
  journal_prompt?: string;
  session_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OfferingTimelineItem {
  id: string;
  user_id: string;
  session_date: string;
  status: OfferingStatus;
  icon: '🌱' | '🌸' | '✨';
  petal_scores?: number[];
  selected_petals?: string[];
  oracle_reflection?: string;
  journal_prompt?: string;
  created_at: string;
}

export interface OfferingStats {
  user_id: string;
  total_sessions: number;
  rest_days: number;
  offering_days: number;
  offering_percentage: number;
  last_session: string;
  first_session: string;
}

export interface CreateOfferingSessionParams {
  user_id: string;
  date?: string;
  status: OfferingStatus;
  petal_scores?: number[];
  selected_petals?: string[];
  oracle_reflection?: string;
  journal_prompt?: string;
  session_metadata?: Record<string, any>;
}

export interface OfferingSessionService {
  createSession(params: CreateOfferingSessionParams): Promise<OfferingSession>;
  getSession(userId: string, date: string): Promise<OfferingSession | null>;
  getUserTimeline(userId: string, limit?: number): Promise<OfferingTimelineItem[]>;
  getUserStats(userId: string): Promise<OfferingStats | null>;
  getOfferingStreak(userId: string): Promise<number>;
}

// Petal element types for validation
export const PETAL_ELEMENTS = [
  'fire', 'water', 'earth', 'air', 
  'aether', 'shadow', 'light', 'void'
] as const;

export type PetalElement = typeof PETAL_ELEMENTS[number];