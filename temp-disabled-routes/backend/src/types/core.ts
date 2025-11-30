/**
 * Core System Type Definitions
 */

export interface CoreSystemState {
  initialized: boolean;
  activeAgents: string[];
  memoryConnected: boolean;
  voiceEnabled: boolean;
  timestamp: Date;
}

export interface CoreConfiguration {
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  features: {
    memory: boolean;
    voice: boolean;
    ai: boolean;
    astrology: boolean;
    divination: boolean;
  };
}

export interface CoreMetrics {
  uptime: number;
  requestsProcessed: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface CoreEvent {
  id: string;
  type: 'system' | 'user' | 'agent' | 'error';
  timestamp: Date;
  source: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface CoreError extends Error {
  code: string;
  context?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CoreAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  metadata?: Record<string, any>;
}

export interface CoreMemory {
  id: string;
  userId: string;
  type: string;
  content: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CoreSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  activities: CoreEvent[];
  state: Record<string, any>;
}

export interface CoreResponse<T = any> {
  success: boolean;
  data?: T;
  error?: CoreError;
  timestamp: Date;
  requestId: string;
}

export interface ElementalMetrics {
  fire: { presence: number; activation: number };
  water: { presence: number; activation: number };
  earth: { presence: number; activation: number };
  air: { presence: number; activation: number };
  aether: { presence: number; activation: number };
  void: { presence: number; activation: number };
}

export interface CollectiveState {
  participants: number;
  coherence: number;
  resonance: number;
  elementalBalance: ElementalMetrics;
  timestamp: Date;
}

export interface PatternData {
  id: string;
  type: 'archetypal' | 'temporal' | 'spatial' | 'behavioral';
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  metadata?: Record<string, any>;
}

export interface EvolutionState {
  phase: string;
  progress: number;
  milestones: string[];
  nextPhase?: string;
  estimatedCompletion?: Date;
}

export interface NeuralState {
  connections: number;
  activations: number;
  patterns: PatternData[];
  health: number;
  lastUpdate: Date;
}