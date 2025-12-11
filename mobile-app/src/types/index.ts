/**
 * types/index.ts
 * TypeScript type definitions for MAIA Consciousness Mobile
 *
 * Created: December 8, 2025
 * Purpose: Shared types for mobile consciousness computing
 */

// Core consciousness types
export interface ConsciousnessState {
  currentElement: Element;
  currentArchetype: Archetype;
  fci: number;
  timestamp: string;
  isSessionActive: boolean;
  sessionDuration: number;
}

export interface FieldState {
  collectiveFCI: number;
  activeRituals: number;
  connectedUsers: number;
  elementalBalance: ElementalBalance;
  recentActivity: FieldActivity[];
  timestamp: string;
}

export interface NavigatorState {
  currentPath: string;
  culturalContext: CulturalContext;
  personalGuidance: string;
  availableActions: NavigatorAction[];
  progressData: ProgressData;
}

// Element and archetype definitions
export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type Archetype =
  | 'healer'
  | 'sage'
  | 'warrior'
  | 'mystic'
  | 'builder'
  | 'visionary'
  | 'guide';

export interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

// Session and ritual types
export interface ConsciousnessSession {
  id: string;
  type: SessionType;
  element: Element;
  archetype: Archetype;
  duration: number;
  startTime: string;
  endTime?: string;
  fciBefore: number;
  fciAfter?: number;
  notes?: string;
  effectiveness?: number;
}

export type SessionType =
  | 'personal_alchemy'
  | 'elemental_attunement'
  | 'archetype_activation'
  | 'field_coherence'
  | 'guided_meditation'
  | 'free_flow';

export interface RitualData {
  id: string;
  name: string;
  element: Element;
  archetype: Archetype;
  participants: number;
  startedAt: string;
  fciBefore: number;
  fciCurrent?: number;
  status: 'active' | 'completed' | 'paused';
}

// WebSocket message types
export interface WebSocketMessage {
  type: WebSocketMessageType;
  timestamp: string;
  data: any;
}

export type WebSocketMessageType =
  | 'FCI_UPDATE'
  | 'RITUAL_STARTED'
  | 'RITUAL_COMPLETED'
  | 'MAIA_WHISPER'
  | 'SYSTEM_STATUS'
  | 'INITIAL_STATE'
  | 'ARCHETYPE_SHIFT'
  | 'CONNECTION_STATUS'
  | 'PING'
  | 'PONG'
  | 'SUBSCRIBE_FCI'
  | 'SUBSCRIBE_RITUALS'
  | 'LOG_RITUAL_EVENT';

export interface WhisperMessage {
  type: 'MAIA_WHISPER';
  timestamp: string;
  data: {
    text: string;
    context: WhisperContext;
    isSymbolic: boolean;
    disclaimer: string;
  };
}

export interface WhisperContext {
  source: 'field_coherence' | 'ritual_event' | 'archetype_evolution' | 'connection_welcome';
  element?: Element;
  archetype?: Archetype;
  fci?: number;
  ritual?: string;
}

// Navigator and cultural context
export interface CulturalContext {
  primaryTradition: string;
  secondaryInfluences: string[];
  languagePreference: string;
  symbolicFramework: string;
  guidanceStyle: 'direct' | 'metaphorical' | 'poetic' | 'practical';
}

export interface NavigatorAction {
  id: string;
  title: string;
  description: string;
  element: Element;
  archetype: Archetype;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  culturalContext?: string[];
}

export interface ProgressData {
  totalSessions: number;
  elementalMastery: ElementalBalance;
  archetypeActivations: Record<Archetype, number>;
  avgFCIImprovement: number;
  longestStreak: number;
  currentStreak: number;
  insights: string[];
}

// Field activity and analytics
export interface FieldActivity {
  id: string;
  type: 'ritual_start' | 'ritual_complete' | 'fci_change' | 'user_join' | 'user_leave';
  timestamp: string;
  description: string;
  impact: number;
  participants?: number;
}

export interface AnalyticsData {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  fciTrend: DataPoint[];
  elementalEffectiveness: ElementEffectiveness[];
  sessionSuccess: number;
  ritualParticipation: number;
  personalGrowth: GrowthMetrics;
}

export interface DataPoint {
  timestamp: string;
  value: number;
}

export interface ElementEffectiveness {
  element: Element;
  avgDelta: number;
  sessions: number;
  lastUpdated: string;
}

export interface GrowthMetrics {
  weeklyProgress: number;
  consistencyScore: number;
  balanceImprovement: number;
  insightGeneration: number;
}

// User preferences and settings
export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  consciousness: ConsciousnessSettings;
  display: DisplaySettings;
  cultural: CulturalSettings;
}

export interface NotificationSettings {
  fieldUpdates: boolean;
  ritualInvitations: boolean;
  personalReminders: boolean;
  whisperFeed: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface PrivacySettings {
  shareProgress: boolean;
  allowRitualInvites: boolean;
  publicProfile: boolean;
  dataCollection: 'minimal' | 'standard' | 'enhanced';
}

export interface ConsciousnessSettings {
  defaultElement: Element;
  preferredArchetype: Archetype;
  sessionReminders: boolean;
  autoSessionEnd: boolean;
  guidanceLevel: 'minimal' | 'moderate' | 'comprehensive';
}

export interface DisplaySettings {
  theme: 'dark' | 'light' | 'auto';
  animations: boolean;
  hapticFeedback: boolean;
  textSize: 'small' | 'medium' | 'large';
  colorBlindness: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

export interface CulturalSettings {
  primaryTradition: string;
  secondaryInfluences: string[];
  languagePreference: string;
  symbolicFramework: string;
  guidanceStyle: 'direct' | 'metaphorical' | 'poetic' | 'practical';
}

// API and service types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ConnectionStatus {
  websocket: 'connected' | 'connecting' | 'disconnected' | 'error';
  api: 'connected' | 'connecting' | 'disconnected' | 'error';
  fieldStream: 'active' | 'inactive' | 'limited';
  lastHeartbeat: string;
}

// Error handling
export interface AppError {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  recoverable: boolean;
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredExcept<T, K extends keyof T> = T & Required<Omit<T, K>>;