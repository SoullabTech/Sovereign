/**
 * Service Tokens for Type-Safe Dependency Injection
 * These tokens replace the old string-based service keys
 */

import { createServiceToken } from './ServiceContainer';

// Core Domain Services
export const ServiceTokens = {
  // User Management
  UserService: createServiceToken<IUserService>('UserService'),
  
  // Oracle Core
  OracleService: createServiceToken<IOracleService>('OracleService'),
  
  // Narrative Generation  
  NarrativeService: createServiceToken<INarrativeService>('NarrativeService'),
  
  // Voice & Audio
  VoiceService: createServiceToken<IVoiceService>('VoiceService'),
  
  // Memory Management
  MemoryService: createServiceToken<IMemoryService>('MemoryService'),
  
  // Analytics & Insights
  AnalyticsService: createServiceToken<IAnalyticsService>('AnalyticsService'),
  
  // Collective Consciousness
  CollectiveService: createServiceToken<ICollectiveService>('CollectiveService'),
  
  // Daimonic Encounters
  DaimonicService: createServiceToken<IDaimonicService>('DaimonicService'),
  
  // User Onboarding
  OnboardingService: createServiceToken<IOnboardingService>('OnboardingService'),
  
  // External Integrations
  IntegrationService: createServiceToken<IIntegrationService>('IntegrationService'),
  
  // Configuration Management
  ConfigurationService: createServiceToken<IConfigurationService>('ConfigurationService'),
  
  // Event-Driven Communication
  EventBusService: createServiceToken<IEventBusService>('EventBusService'),
  
  // Caching Layer
  CacheService: createServiceToken<ICacheService>('CacheService'),
  
  // Database Access
  DatabaseService: createServiceToken<IDatabaseService>('DatabaseService')
} as const;

// Service Interfaces

export interface IUserService {
  getCurrentUser(userId?: string): Promise<User | null>;
  updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void>;
  getUserPreferences(userId: string): Promise<UserPreferences>;
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>;
  dispose?(): Promise<void>;
}

export interface IOracleService {
  processMessage(userId: string, message: string, context?: ConversationContext): Promise<OracleResponse>;
  getConversationHistory(userId: string, limit?: number): Promise<ConversationEntry[]>;
  generateInsights(userId: string, timeframe?: string): Promise<ArchetypeInsight[]>;
  dispose?(): Promise<void>;
}

export interface INarrativeService {
  generatePersonalNarrative(userId: string, data: PersonalStats): Promise<PersonalNarrative>;
  generateCollectiveNarrative(data: CollectiveStats): Promise<CollectiveNarrative>;
  generateDaimonicNarrative(encounter: DaimonicEncounter): Promise<DaimonicNarrative>;
  generateCrossNarrative(personal: PersonalStats, collective: CollectiveStats): Promise<CrossNarrative>;
  dispose?(): Promise<void>;
}

export interface IVoiceService {
  synthesizeSpeech(text: string, options?: VoiceSynthesisOptions): Promise<AudioBuffer>;
  transcribeAudio(audioData: ArrayBuffer): Promise<TranscriptionResult>;
  getAvailableVoices(): Promise<VoiceModel[]>;
  dispose?(): Promise<void>;
}

export interface IMemoryService {
  storeMemory(userId: string, memory: MemoryEntry): Promise<string>;
  retrieveMemories(userId: string, query: string, limit?: number): Promise<MemoryEntry[]>;
  getConversationContext(userId: string): Promise<ConversationContext>;
  dispose?(): Promise<void>;
}

export interface IAnalyticsService {
  trackEvent(userId: string, event: AnalyticsEvent): Promise<void>;
  getEmotionalAnalysis(userId: string, timeframe?: string): Promise<EmotionalAnalysis>;
  getArchetypeInsights(userId: string, timeframe?: string): Promise<ArchetypeInsight[]>;
  dispose?(): Promise<void>;
}

export interface ICollectiveService {
  getCollectiveStats(timeframe?: string): Promise<CollectiveStats>;
  getArchetypeDistribution(): Promise<Record<string, number>>;
  getUserContribution(userId: string): Promise<UserContribution>;
  dispose?(): Promise<void>;
}

export interface IDaimonicService {
  checkForEncounter(userId: string, content: string, emotionalState: EmotionalState): Promise<DaimonicEncounter | null>;
  processEncounterResponse(encounterId: string, response: string): Promise<DaimonicIntegration>;
  getEncounterHistory(userId: string): Promise<DaimonicEncounter[]>;
  dispose?(): Promise<void>;
}

export interface IOnboardingService {
  startOnboarding(userId: string): Promise<OnboardingSession>;
  processOnboardingStep(sessionId: string, step: OnboardingStep, data: any): Promise<OnboardingResult>;
  completeOnboarding(sessionId: string): Promise<UserProfile>;
  dispose?(): Promise<void>;
}

export interface IIntegrationService {
  syncExternalData(userId: string, platform: string): Promise<void>;
  exportUserData(userId: string, format: string): Promise<ExportResult>;
  importUserData(userId: string, data: any): Promise<ImportResult>;
  dispose?(): Promise<void>;
}

export interface IConfigurationService {
  getConfig<T>(key: string, defaultValue?: T): Promise<T>;
  setConfig(key: string, value: any): Promise<void>;
  getFeatureFlags(): Promise<Record<string, boolean>>;
  dispose?(): Promise<void>;
}

export interface IEventBusService {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): string;
  unsubscribe(subscriptionId: string): void;
  dispose?(): Promise<void>;
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  stats(): Promise<CacheStats>;
  dispose?(): Promise<void>;
}

export interface IDatabaseService {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
  dispose?(): Promise<void>;
}

// Domain Types

export interface User {
  id: string;
  email?: string;
  profile: UserProfile;
  preferences: UserPreferences;
  journey: JourneyState;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  displayName?: string;
  avatarUrl?: string;
  timezone?: string;
  oracle: OracleProfile;
  collective: CollectiveProfile;
  daimonic: DaimonicProfile;
}

export interface OracleProfile {
  preferredVoice?: string;
  conversationStyle?: string;
  archetypeFocus?: string[];
  integrationLevel: number;
}

export interface CollectiveProfile {
  participationLevel: 'observer' | 'participant' | 'contributor';
  anonymityPreference: boolean;
  contributionScore: number;
}

export interface DaimonicProfile {
  encounterHistory: DaimonicEncounter[];
  integrationScore: number;
  activeThemes: string[];
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  ui: UIPreferences;
}

export interface ConversationContext {
  userId: string;
  recentMessages: ConversationEntry[];
  emotionalState: EmotionalState;
  archetypeState: ArchetypeState;
  activeThemes: string[];
}

export interface OracleResponse {
  text: string;
  audioUrl?: string;
  emotionalResonance?: EmotionalAnalysis;
  archetypeInsights?: ArchetypeInsight[];
  daimonicEncounter?: DaimonicEncounter;
  suggestedActions?: string[];
}

export interface ConversationEntry {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface PersonalStats {
  userId: string;
  timeframe: string;
  totalSessions: number;
  archetypeGrowth: Record<string, number>;
  emotionalAverage: EmotionalState;
  insights: string[];
}

export interface CollectiveStats {
  timeframe: string;
  totalEncounters: number;
  archetypeDistribution: Record<string, number>;
  dominantArchetype: string;
  emergingTrends: string[];
}

export interface EmotionalState {
  valence: number;    // -1 to 1
  arousal: number;    // 0 to 1  
  dominance: number;  // 0 to 1
  confidence: number; // 0 to 1
}

export interface ArchetypeState {
  active: string[];
  dominant: string;
  scores: Record<string, number>;
}

export interface DaimonicEncounter {
  id: string;
  userId: string;
  archetype: string;
  title: string;
  description: string;
  guidance: string;
  triggerContext: string;
  createdAt: Date;
  integrationStatus: 'pending' | 'accepted' | 'integrated' | 'dismissed';
}

export interface AnalyticsEvent {
  type: string;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface DomainEvent {
  id: string;
  type: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void> | void;

// Utility Types
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
}

export interface DatabaseTransaction {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  daimonic: boolean;
}

export interface PrivacyPreferences {
  collectiveParticipation: boolean;
  dataSharing: boolean;
  analytics: boolean;
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  accessibility: Record<string, any>;
}

export interface VoiceSynthesisOptions {
  voiceId?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
}

export interface VoiceModel {
  id: string;
  name: string;
  language: string;
  gender?: string;
}

export interface MemoryEntry {
  id: string;
  userId: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface EmotionalAnalysis {
  current: EmotionalState;
  trend: 'improving' | 'stable' | 'concerning';
  insights: string[];
}

export interface ArchetypeInsight {
  archetype: string;
  strength: number;
  growth: number;
  themes: string[];
  guidance: string;
}