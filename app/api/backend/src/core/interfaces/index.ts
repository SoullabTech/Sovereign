/**
 * 🌌 AIN Platform Core Interfaces
 * 
 * Defines the contracts for all major services in the consciousness platform.
 * These interfaces enable clean dependency injection, testing, and future
 * microservices decomposition.
 */

import type { AIResponse } from '../../types/ai';
import type { UserOracleSettings } from '../../services/OracleService';

// ============================================================================
// UNIFIED RESPONSE CONTRACT
// ============================================================================

export interface UnifiedResponse {
  id: string;
  text: string;
  voiceUrl?: string;
  tokens: {
    prompt: number;
    completion: number;
  };
  meta: {
    element?: 'air' | 'fire' | 'water' | 'earth' | 'aether';
    evolutionary_awareness_active?: boolean;
    latencyMs: number;
    model?: string;
    source?: string;
    processingTime?: number;
    consciousness_level?: number;
    sacred_mirror_active?: boolean;
  };
  sessionId?: string;
  userId?: string;
}

// ============================================================================
// REQUEST CONTRACTS
// ============================================================================

export interface QueryRequest {
  userId: string;
  text: string;
  element?: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  sessionId?: string;
  context?: {
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    personality?: string;
    phase?: string;
    preferences?: Partial<UserOracleSettings>;
  };
  metadata?: Record<string, unknown>;
}

export interface VoiceRequest {
  text: string;
  voiceId?: string;
  settings?: {
    stability?: number;
    style?: number;
    tone?: string;
    ceremonyPacing?: boolean;
  };
}

// ============================================================================
// CORE SERVICE INTERFACES
// ============================================================================

export interface IOrchestrator {
  /**
   * Process a user query through the consciousness system
   */
  process(request: QueryRequest): Promise<UnifiedResponse>;
  
  /**
   * Get orchestrator health status
   */
  getHealthStatus(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, unknown> }>;
}

export interface IMemory {
  /**
   * Get user's conversation session
   */
  getSession(userId: string, sessionId?: string): Promise<ConversationSession>;
  
  /**
   * Append a new turn to user's conversation
   */
  append(userId: string, turn: ConversationTurn): Promise<void>;
  
  /**
   * Get user's long-term memory patterns
   */
  getPatterns(userId: string): Promise<MemoryPattern[]>;
  
  /**
   * Update user's consciousness profile
   */
  updateConsciousnessProfile(userId: string, updates: Partial<ConsciousnessProfile>): Promise<void>;
}

export interface IVoice {
  /**
   * Generate voice audio for text
   */
  synthesize(request: VoiceRequest): Promise<string>; // Returns audio URL
  
  /**
   * Get available voice profiles
   */
  getAvailableVoices(): Promise<VoiceProfile[]>;
  
  /**
   * Clone or customize a voice
   */
  createCustomVoice(userId: string, settings: CustomVoiceSettings): Promise<VoiceProfile>;
}

export interface IAnalytics {
  /**
   * Emit an event for analytics tracking
   */
  emit(event: AnalyticsEvent): void;
  
  /**
   * Get user's usage metrics
   */
  getUserMetrics(userId: string, timeRange?: { start: Date; end: Date }): Promise<UserMetrics>;
  
  /**
   * Get system-wide metrics
   */
  getSystemMetrics(): Promise<SystemMetrics>;
}

export interface ICache {
  /**
   * Get cached value
   */
  get<T>(key: string): Promise<T | null>;
  
  /**
   * Set cached value with optional TTL
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  
  /**
   * Delete cached value
   */
  delete(key: string): Promise<void>;
  
  /**
   * Clear all cache
   */
  clear(): Promise<void>;
}

export interface IEventEmitter {
  /**
   * Emit a system event
   */
  emitSystemEvent(event: SystemEvent): boolean;
  
  /**
   * Subscribe to system events
   */
  onSystemEvent(eventType: string, handler: (event: SystemEvent) => void): void;
  
  /**
   * Unsubscribe from system events
   */
  offSystemEvent(eventType: string, handler: (event: SystemEvent) => void): void;
  
  /**
   * Subscribe to system events once
   */
  onceSystemEvent(eventType: string, handler: (event: SystemEvent) => void): void;
}

// ============================================================================
// AGENT INTERFACES
// ============================================================================

export interface IPersonalOracle {
  /**
   * Process a personal oracle query
   */
  process(request: QueryRequest): Promise<AIResponse>;
  
  /**
   * Update oracle's personality and preferences
   */
  updatePersonality(userId: string, settings: Partial<UserOracleSettings>): Promise<void>;
  
  /**
   * Get oracle's current consciousness state
   */
  getConsciousnessState(userId: string): Promise<ConsciousnessState>;
}

export interface IElementalAgent {
  /**
   * Process query through elemental lens
   */
  process(query: string, context: ElementalContext): Promise<ElementalResponse>;
  
  /**
   * Get elemental agent type
   */
  getElement(): 'fire' | 'water' | 'earth' | 'air' | 'aether';
  
  /**
   * Get current elemental state/energy level
   */
  getCurrentState(): Promise<ElementalState>;
}

// ============================================================================
// DATA TYPES
// ============================================================================

export interface ConversationSession {
  sessionId: string;
  userId: string;
  turns: ConversationTurn[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    element?: string;
    model?: string;
    tokens?: number;
    latency?: number;
  };
}

export interface MemoryPattern {
  id: string;
  userId: string;
  pattern: string;
  frequency: number;
  lastSeen: Date;
  category: 'personality' | 'interest' | 'goal' | 'challenge' | 'breakthrough';
}

export interface ConsciousnessProfile {
  userId: string;
  currentPhase: string;
  evolutionLevel: number;
  shamanic_abilities: string[];
  sacred_mirrors_completed: string[];
  breakthrough_moments: Array<{
    timestamp: Date;
    description: string;
    catalyst: string;
  }>;
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  settings: {
    stability: number;
    style: number;
    tone?: string;
  };
  isCustom: boolean;
}

export interface CustomVoiceSettings {
  name: string;
  description?: string;
  baseVoiceId: string;
  stability: number;
  style: number;
  tone?: string;
  ceremonyPacing?: boolean;
}

export interface AnalyticsEvent {
  type: string;
  userId?: string;
  timestamp?: Date;
  properties: Record<string, unknown>;
}

export interface UserMetrics {
  userId: string;
  totalSessions: number;
  totalQueries: number;
  averageSessionLength: number;
  favoriteElements: string[];
  consciousnessGrowth: number;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers24h: number;
  totalQueries: number;
  averageResponseTime: number;
  errorRate: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export interface SystemEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  payload: Record<string, unknown>;
  routing?: {
    target?: string;
    broadcast?: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
  };
}

export interface ElementalContext {
  userId: string;
  currentElement?: string;
  emotionalState?: string;
  consciousnessLevel?: number;
  recentPatterns?: string[];
}

export interface ElementalResponse {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  response: string;
  energyLevel: number;
  insights: string[];
  nextSuggestions?: string[];
}

export interface ElementalState {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  energyLevel: number; // 0-100
  isActive: boolean;
  lastActivation?: Date;
  currentFocus?: string;
}

export interface ConsciousnessState {
  phase: string;
  evolutionLevel: number;
  activeElements: string[];
  sacredMirrorState: {
    isActive: boolean;
    currentMirror?: string;
    depth: number;
  };
  breakthroughPotential: number; // 0-100
}