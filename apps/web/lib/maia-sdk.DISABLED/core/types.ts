/**
 * MAIA SDK Core Types
 *
 * Foundational type definitions for the MAIA sovereign voice/AI SDK.
 * These types define the contract that all providers must implement.
 */

export type ProviderCapability = 'realtime' | 'tts' | 'stt' | 'llm' | 'streaming';

export interface ProviderMetadata {
  id: string;
  name: string;
  capabilities: ProviderCapability[];
  costPer1kTokens: number; // Cost in dollars
  latencyMs: number; // Average response latency
  reliability: number; // 0-1 score based on uptime
  maxConcurrent: number; // Max concurrent connections
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  encoding: 'pcm16' | 'opus' | 'mp3';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  conversationHistory: Message[];
  userPreferences: {
    voice: string;
    speed: number;
    conversationMode: string;
  };
  metadata?: Record<string, any>;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  voice?: string;
  temperature?: number;
  [key: string]: any;
}

export interface Connection {
  id: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  provider: string;
  connectedAt?: Date;
  metadata?: Record<string, any>;
}

export type ProviderEvent =
  | { type: 'transcription'; text: string; timestamp: Date }
  | { type: 'response'; text: string; audio?: ArrayBuffer; timestamp: Date }
  | { type: 'audio_delta'; audioData: ArrayBuffer }
  | { type: 'text_delta'; textDelta: string }
  | { type: 'error'; error: Error }
  | { type: 'status'; status: Connection['status'] };

export interface RoutingDecision {
  provider: string;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
}

export type RoutingStrategy = 'cost' | 'quality' | 'speed' | 'balanced';

export interface CostThreshold {
  daily: number;
  monthly: number;
  perSession: number;
}

export interface ProviderStats {
  provider: string;
  totalRequests: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
  lastUsed: Date;
}

export interface AnalyticsReport {
  period: { start: Date; end: Date };
  totalCost: number;
  totalRequests: number;
  providerBreakdown: ProviderStats[];
  costSavings: number; // Compared to using only most expensive provider
}
