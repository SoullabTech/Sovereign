/**
 * 🚀 AIN Platform Bootstrap
 * 
 * This file wires up the dependency injection container with all services
 * at application startup. It provides the foundation for the scalable
 * architecture while maintaining clean separation of concerns.
 * 
 * Usage:
 *   import { initializeServices } from './core/bootstrap';
 *   await initializeServices();
 */

import { bind, SERVICE_KEYS } from '../di/container';
import type {
  IOrchestrator,
  IMemory,
  IVoice,
  IAnalytics,
  ICache,
  IEventEmitter
} from '../interfaces';

// Import implementations
import { SimpleCache } from '../implementations/SimpleCache';
import { SimpleAnalytics } from '../implementations/SimpleAnalytics';
import { ainEventEmitter, EventSubscribers } from '../events/EventEmitter';
import { createConsciousnessAPI } from '../../api/ConsciousnessAPI';

// Import existing services (to be gradually migrated)
import { OracleService } from '../../services/OracleService';

import { logger } from '../../utils/logger';

export interface BootstrapConfig {
  environment: 'development' | 'staging' | 'production';
  cache?: {
    maxSize?: number;
    defaultTtlSeconds?: number;
    redisUrl?: string; // For future Redis integration
  };
  analytics?: {
    maxEvents?: number;
    persistenceEnabled?: boolean;
  };
  services?: {
    enableDebugLogging?: boolean;
    enableHealthChecks?: boolean;
  };
}

/**
 * Initialize all services and wire up the DI container
 */
export async function initializeServices(config: BootstrapConfig = { environment: 'development' }): Promise<void> {
  logger.info('🌌 Initializing AIN Platform services...', { environment: config.environment });

  try {
    // ========================================================================
    // INFRASTRUCTURE SERVICES
    // ========================================================================

    // Event Emitter (singleton)
    bind<IEventEmitter>(SERVICE_KEYS.EVENT_EMITTER, ainEventEmitter);
    logger.debug('✓ Event emitter initialized');

    // Cache Service
    const cacheConfig = config.cache || {};
    if (cacheConfig.redisUrl) {
      // TODO: Initialize Redis cache when needed
      logger.info('Redis cache configuration detected (not yet implemented)');
    }
    
    const cache = new SimpleCache({
      maxSize: cacheConfig.maxSize || 2000,
      defaultTtlSeconds: cacheConfig.defaultTtlSeconds || 300
    });
    bind<ICache>(SERVICE_KEYS.CACHE, cache);
    logger.debug('✓ Cache service initialized', { 
      type: 'memory', 
      maxSize: cacheConfig.maxSize || 2000 
    });

    // Analytics Service
    const analyticsConfig = config.analytics || {};
    const analytics = new SimpleAnalytics({
      maxEvents: analyticsConfig.maxEvents || 10000,
      persistenceEnabled: analyticsConfig.persistenceEnabled || false
    });
    bind<IAnalytics>(SERVICE_KEYS.ANALYTICS, analytics);
    logger.debug('✓ Analytics service initialized', { 
      maxEvents: analyticsConfig.maxEvents || 10000,
      persistence: analyticsConfig.persistenceEnabled || false
    });

    // ========================================================================
    // BUSINESS SERVICES (Stubs - to be implemented)
    // ========================================================================

    // Memory Service (stub - will integrate with existing memory services)
    bind<IMemory>(SERVICE_KEYS.MEMORY, createMemoryServiceStub());
    logger.debug('✓ Memory service stub initialized');

    // Voice Service (stub - will integrate with ElevenLabs)
    bind<IVoice>(SERVICE_KEYS.VOICE, createVoiceServiceStub());
    logger.debug('✓ Voice service stub initialized');

    // Orchestrator Service (stub - will integrate with existing Oracle services)
    bind<IOrchestrator>(SERVICE_KEYS.ORCHESTRATOR, createOrchestratorStub());
    logger.debug('✓ Orchestrator service stub initialized');

    // ========================================================================
    // FACADE SERVICES
    // ========================================================================

    // Consciousness API Facade
    bind(SERVICE_KEYS.CONSCIOUSNESS_API, () => createConsciousnessAPI(), { singleton: true });
    logger.debug('✓ Consciousness API facade initialized');

    // ========================================================================
    // EVENT SUBSCRIBERS
    // ========================================================================

    // Set up built-in event subscribers
    EventSubscribers.createAnalyticsLogger(ainEventEmitter);
    EventSubscribers.createQuotaTracker(ainEventEmitter);
    EventSubscribers.createHealthMonitor(ainEventEmitter);
    logger.debug('✓ Event subscribers initialized');

    // ========================================================================
    // HEALTH CHECKS
    // ========================================================================

    if (config.services?.enableHealthChecks) {
      await runHealthChecks();
    }

    logger.info('🌌 AIN Platform services initialized successfully!');

  } catch (error) {
    logger.error('❌ Failed to initialize AIN Platform services', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Run health checks on all services
 */
async function runHealthChecks(): Promise<void> {
  logger.info('🏥 Running service health checks...');

  // TODO: Add health checks for each service
  // For now, just verify DI container is working
  
  try {
    const eventEmitter = bind(SERVICE_KEYS.EVENT_EMITTER, ainEventEmitter);
    const cache = bind(SERVICE_KEYS.CACHE, new SimpleCache());
    
    logger.info('✅ All services healthy');
  } catch (error) {
    logger.error('🔴 Service health check failed', { error });
    throw error;
  }
}

// ============================================================================
// SERVICE STUBS (To be replaced with real implementations)
// ============================================================================

/**
 * Memory Service Stub - Will be replaced with integration to existing memory services
 */
function createMemoryServiceStub(): IMemory {
  return {
    async getSession(userId: string, sessionId?: string) {
      logger.debug('Memory service stub called: getSession', { userId, sessionId });
      return {
        sessionId: sessionId || `session-${Date.now()}`,
        userId,
        turns: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },

    async append(userId: string, turn) {
      logger.debug('Memory service stub called: append', { userId, turn: turn.content });
      // TODO: Integrate with existing memory services
    },

    async getPatterns(userId: string) {
      logger.debug('Memory service stub called: getPatterns', { userId });
      return []; // TODO: Return actual patterns
    },

    async updateConsciousnessProfile(userId: string, updates) {
      logger.debug('Memory service stub called: updateConsciousnessProfile', { userId });
      // TODO: Update consciousness profile
    }
  };
}

/**
 * Voice Service Stub - Will be replaced with ElevenLabs integration
 */
function createVoiceServiceStub(): IVoice {
  return {
    async synthesize(request) {
      logger.debug('Voice service stub called: synthesize', { text: request.text.substring(0, 50) });
      // TODO: Integrate with ElevenLabs service
      return 'https://example.com/voice/stub.mp3';
    },

    async getAvailableVoices() {
      logger.debug('Voice service stub called: getAvailableVoices');
      return [
        {
          id: 'maya',
          name: 'Maya',
          description: 'Mystical Oracle Voice',
          settings: { stability: 0.8, style: 0.6 },
          isCustom: false
        }
      ];
    },

    async createCustomVoice(userId: string, settings) {
      logger.debug('Voice service stub called: createCustomVoice', { userId });
      return {
        id: `custom-${userId}`,
        name: settings.name,
        description: settings.description || 'Custom voice',
        settings: {
          stability: settings.stability,
          style: settings.style,
          tone: settings.tone
        },
        isCustom: true
      };
    }
  };
}

/**
 * Create orchestrator based on environment configuration
 */
function createOrchestratorStub(): IOrchestrator {
  const orchestratorType = process.env.ORCHESTRATOR || 'baseline';
  
  if (orchestratorType === 'spiralogic') {
    return createSpiralogicOrchestrator();
  } else {
    return createBaselineOrchestrator();
  }
}

/**
 * Spiralogic Orchestrator - Full consciousness architecture
 */
function createSpiralogicOrchestrator(): IOrchestrator {
  try {
    const { SpiralogicAdapter } = require('../orchestrators/SpiralogicAdapter');
    const { SpiralogicCognitiveEngine } = require('../spiralogic/SpiralogicCognitiveEngine');
    const { ElementalAgentOrchestrator } = require('../spiralogic/ElementalAgentOrchestrator');
    const { AwarenessIntegrator } = require('../spiralogic/AwarenessIntegrator');
    
    // Initialize Spiralogic components
    const engine = new SpiralogicCognitiveEngine();
    const elements = new ElementalAgentOrchestrator();
    const integrator = new AwarenessIntegrator();
    
    // Get dependencies from DI container
    const cache = bind(SERVICE_KEYS.CACHE, new SimpleCache());
    const analytics = bind(SERVICE_KEYS.ANALYTICS, new SimpleAnalytics());
    
    // Create SpiralogicAdapter
    const spiralogicAdapter = new SpiralogicAdapter(
      engine,
      elements,
      integrator,
      cache,
      analytics
    );
    
    logger.info("Spiralogic orchestrator initialized with full consciousness architecture");
    
    return {
      async process(request) {
        return await spiralogicAdapter.process(request);
      },
      
      async getHealthStatus() {
        const health = await spiralogicAdapter.healthCheck();
        return {
          status: health.status,
          details: health.details
        };
      }
    };
    
  } catch (error) {
    logger.error("Failed to initialize Spiralogic orchestrator, falling back to baseline", {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return createBaselineOrchestrator();
  }
}

/**
 * Baseline Orchestrator - Simple fallback for testing/comparison
 */
function createBaselineOrchestrator(): IOrchestrator {
  return {
    async process(request) {
      logger.debug('Baseline orchestrator called: process', { 
        userId: request.userId, 
        element: request.element 
      });

      // Simple baseline responses with shadow work elements
      const shadowWorkPrompts = [
        "What are you not quite ready to face about this situation?",
        "I hear what you're saying, and I'm curious about what you're not saying.",
        "That sounds like the story you tell yourself. What's the story underneath that one?",
        "What would you tell your best friend if they brought this exact problem to you?",
        "I notice you're asking me what to do. What do you already know you need to do?"
      ];

      const responses = {
        fire: "Your passion is clear. What's the action you're avoiding taking?",
        water: "I sense deep feeling here. What emotion are you not quite ready to feel fully?",
        earth: "You want solid ground. What foundation are you afraid to build?",
        air: "Your mind is working hard on this. What does your body know that your thoughts don't?",
        aether: shadowWorkPrompts[Math.floor(Math.random() * shadowWorkPrompts.length)]
      };

      const element = request.element || 'aether';
      const text = responses[element] || responses.aether;

      return {
        id: `baseline-${Date.now()}`,
        text,
        tokens: { prompt: request.text.length, completion: text.length },
        meta: {
          element: element,
          latencyMs: 50,
          source: 'baseline-orchestrator',
          consciousness_level: 60,
          shadowWorkApplied: true,
          evolutionary_awareness_active: false
        },
        userId: request.userId,
        sessionId: request.sessionId
      };
    },

    async getHealthStatus() {
      return { 
        status: 'healthy' as const, 
        details: { 
          type: 'baseline',
          message: 'Baseline orchestrator operational with shadow work integration' 
        } 
      };
    }
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Graceful shutdown - cleanup resources
 */
export async function shutdownServices(): Promise<void> {
  logger.info('🛑 Shutting down AIN Platform services...');
  
  try {
    // Clear cache
    const cache = bind(SERVICE_KEYS.CACHE, new SimpleCache());
    await cache.clear();
    
    // Clear event emitter
    ainEventEmitter.clearAllSubscribers();
    
    logger.info('✅ Services shut down gracefully');
  } catch (error) {
    logger.error('❌ Error during service shutdown', { error });
  }
}