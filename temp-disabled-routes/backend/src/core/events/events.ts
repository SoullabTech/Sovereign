// Standardized event shapes for voice synthesis pipeline and collective intelligence

import { RetreatAfferent } from '../../types/retreat';

export interface VoiceQueuedEvent {
  type: 'voice.queued';
  userId: string;
  taskId: string;
  textLen: number;
  provider: 'elevenlabs' | 'stub';
  voiceId?: string;
  element?: string;
  personality?: string;
  createdAt: string;
}

export interface VoiceProcessingEvent {
  type: 'voice.processing';
  userId: string;
  taskId: string;
  provider: 'elevenlabs' | 'stub';
  timestamp: string;
}

export interface VoiceReadyEvent {
  type: 'voice.ready';
  userId: string;
  taskId: string;
  url: string;
  bytes: number;
  latencyMs: number;
  provider: 'elevenlabs' | 'stub';
  cached?: boolean;
  storage?: 'local' | 's3' | 'cdn';
  voiceId?: string;
  timestamp: string;
}

export interface VoiceFailedEvent {
  type: 'voice.failed';
  userId: string;
  taskId: string;
  error: string;
  provider: 'elevenlabs' | 'stub';
  timestamp: string;
}

export interface VoiceCacheHitEvent {
  type: 'voice.cache_hit';
  userId: string;
  cacheKey: string;
  savedMs: number;
  savedCredits: number;
  timestamp: string;
}

export interface VoiceQuotaWarningEvent {
  type: 'voice.quota_warning';
  charactersRemaining: number;
  characterLimit: number;
  percentUsed: number;
  timestamp: string;
}

export type VoiceEvent = 
  | VoiceQueuedEvent
  | VoiceProcessingEvent
  | VoiceReadyEvent
  | VoiceFailedEvent
  | VoiceCacheHitEvent
  | VoiceQuotaWarningEvent;

// ============================================================================
// COLLECTIVE INTELLIGENCE / RETREAT EVENTS
// ============================================================================

export interface CollectiveRetreatIngestEvent {
  type: 'collective.retreat.ingest';
  afferent: RetreatAfferent;
}

export interface CollectiveRetreatPatternEvent {
  type: 'collective.retreat.pattern';
  groupId: string;
  pattern: string;
  confidence: number;
  window: '5m' | '1h' | '24h';
  payload?: any;
}

export interface CollectiveRetreatCoherenceEvent {
  type: 'collective.retreat.coherence.updated';
  groupId: string;
  coherence: number;
  ts: string;
}

export type CollectiveEvent = 
  | CollectiveRetreatIngestEvent
  | CollectiveRetreatPatternEvent
  | CollectiveRetreatCoherenceEvent;

export type Event = VoiceEvent | CollectiveEvent;

// Helper to create consistent timestamps
export function createTimestamp(): string {
  return new Date().toISOString();
}