// backend: lib/consciousness/maiaOrchestrator.ts

/**
 * MAIA CONSCIOUSNESS ORCHESTRATOR
 *
 * Central fail-soft consciousness coordination system that combines:
 * - Safe Gebser analysis (consciousness structure detection)
 * - Safe elemental field analysis
 * - Conversational elemental intelligence (phase-based tracking)
 * - Local MAIA response generation
 *
 * This orchestrator ensures MAIA always responds even if individual
 * consciousness layers fail. Each layer is wrapped in safe interfaces
 * that return null on error instead of throwing.
 */

import { safeGebserAnalysis } from '@/lib/consciousness/safe-gebser';
import { safeElementalFieldState, safeElementalFieldSummary } from '@/lib/consciousness/safe-elemental-field';
import { ConversationalElementalIntelligence } from '@/lib/consciousness/conversational-elemental-intelligence';
import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { getConversationContext, ConversationContext } from '@/lib/consciousness/conversationContext';
import { claudeDevOrchestration, type DevModeContext, type ClaudeDevAnalysis } from '@/lib/development/claude-dev-orchestration';
import { MemoryBundleService, type MemoryBundle } from '@/lib/memory/MemoryBundle';
import { MemoryWritebackService, type MemoryMode } from '@/lib/memory/MemoryWriteback';
import { resolveMemoryMode, logMemoryGateDenial } from '@/lib/memory/MemoryGate';
import { containsSensitiveData } from '@/lib/memory/sensitivePatterns';

// ─── Recall Quality Helpers ───────────────────────────────────────────────────
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Content-free scalar (0-100) measuring recall health.
 * Weights: crossShare 45%, semanticRate 30%, bundleScore 20%, breakthroughs 5%
 */
function computeRecallQuality(stats: {
  turnsRetrieved: number;
  turnsCrossSession?: number;
  semanticHits: number;
  breakthroughsFound: number;
}, bundleChars: number): number {
  const turns = Math.max(1, stats.turnsRetrieved || 0);

  // how much recall came from prior sessions
  const crossShare = clamp01((stats.turnsCrossSession ?? 0) / turns);

  // how "semantic" the recall was (vector hits per turn retrieved)
  const semanticRate = clamp01((stats.semanticHits ?? 0) / turns);

  // saturate around ~1200 chars
  const bundleScore = clamp01(bundleChars / 1200);

  const breakthroughScore = clamp01((stats.breakthroughsFound ?? 0) / 3);

  // 0..100
  const score01 =
    0.45 * crossShare +
    0.30 * semanticRate +
    0.20 * bundleScore +
    0.05 * breakthroughScore;

  return Math.round(score01 * 100);
}

export interface MaiaConsciousnessInput {
  message: string;
  userId: string;
  sessionId: string;
  conversationHistory?: any[];
  meta?: { explorerId?: string; userId?: string; sessionId?: string; [key: string]: any };
  context?: any;
}

export interface ConsciousnessAnalysis {
  gebserStructure?: any;
  elementalField?: any;
  elementalFieldSummary?: any;
  conversationalElemental?: {
    context: any;
    phaseInfo: any;
  };
  analysisMetadata: {
    layersSuccessful: string[];
    layersFailed: string[];
    totalLayers: number;
    successRate: number;
  };
}

export interface MaiaConsciousnessResponse {
  message: string;
  consciousness: ConsciousnessAnalysis;
  route: {
    endpoint: string;
    type: string;
    operational: boolean;
    mode: string;
    safeMode: boolean;
  };
  session: {
    id: string;
  };
  metadata: any;
}

/**
 * Initialize conversational elemental intelligence (singleton)
 */
let conversationalElementalIntelligence: ConversationalElementalIntelligence | null = null;

function getConversationalElementalIntelligence(): ConversationalElementalIntelligence {
  if (!conversationalElementalIntelligence) {
    conversationalElementalIntelligence = new ConversationalElementalIntelligence();
  }
  return conversationalElementalIntelligence;
}

/**
 * Generate MAIA response with full consciousness analysis
 *
 * This is the main function that orchestrates all consciousness layers
 * and generates MAIA's response. Each layer is fail-safe.
 */
/**
 * Adaptive complexity analysis - determines which consciousness layers are needed
 */
function analyzeMessageComplexity(message: string, conversationHistory: any[] = []): {
  level: 'simple' | 'moderate' | 'complex' | 'profound';
  requiredLayers: string[];
  reasoning: string;
} {
  const msgLower = message.toLowerCase();
  const msgWords = message.split(/\s+/).length;

  // Simple greetings and basic interactions
  const simplePatterns = [
    /^(hi|hello|hey|thanks|thank you|yes|no|ok|okay)\.?$/i,
    /^(good morning|good evening|good night)\.?$/i,
    /^(how are you|what's up)(\?)?$/i
  ];

  // Moderate complexity - questions requiring thoughtful responses
  const moderatePatterns = [
    /\b(how|what|why|when|where|explain|help me understand)\b/i,
    /\b(question|problem|issue|challenge)\b/i
  ];

  // Complex - deep personal, philosophical, or technical topics
  const complexPatterns = [
    /\b(meaning|purpose|consciousness|spiritual|philosophy|existence|soul)\b/i,
    /\b(anxiety|depression|trauma|healing|growth|transformation)\b/i,
    /\b(relationship|love|family|career|life direction)\b/i
  ];

  // Profound - existential, mystical, or highly technical queries
  const profoundPatterns = [
    /\b(reality|truth|awakening|enlightenment|transcendence|wisdom)\b/i,
    /\b(quantum|consciousness field|elemental|sacred)\b/i,
    /\b(paradox|mystery|divine|cosmos|universe)\b/i
  ];

  // Check patterns and word count
  if (msgWords <= 5 && simplePatterns.some(pattern => pattern.test(message))) {
    return {
      level: 'simple',
      requiredLayers: ['maia-core'], // Only core MAIA response
      reasoning: 'Simple greeting or basic interaction - minimal processing needed'
    };
  }

  if (profoundPatterns.some(pattern => pattern.test(msgLower)) || msgWords > 50) {
    return {
      level: 'profound',
      requiredLayers: ['maia-core', 'gebser-analysis', 'elemental-field', 'elemental-field-summary', 'conversational-elemental'],
      reasoning: 'Deep philosophical/spiritual topic - full consciousness analysis beneficial'
    };
  }

  if (complexPatterns.some(pattern => pattern.test(msgLower)) || msgWords > 25) {
    return {
      level: 'complex',
      requiredLayers: ['maia-core', 'gebser-analysis', 'elemental-field'],
      reasoning: 'Personal/complex topic - consciousness awareness helpful'
    };
  }

  if (moderatePatterns.some(pattern => pattern.test(msgLower)) || msgWords > 10) {
    return {
      level: 'moderate',
      requiredLayers: ['maia-core', 'gebser-analysis'],
      reasoning: 'Thoughtful question - light consciousness analysis valuable'
    };
  }

  return {
    level: 'simple',
    requiredLayers: ['maia-core'],
    reasoning: 'Default to simple processing for efficiency'
  };
}

export async function generateMaiaTurn(input: MaiaConsciousnessInput): Promise<MaiaConsciousnessResponse> {
  const { message, userId, sessionId, conversationHistory = [], meta = {}, context = {} } = input;

  // 🧠 MAIA-PAI CONVERSATIONAL KERNEL: Initialize conversation context
  const conversationContext = getConversationContext(sessionId);
  conversationContext.updateConversationDepth(message);

  // Get MAIA-PAI depth configuration for this conversation
  const depthConfig = conversationContext.getDepthConfig('adaptive');

  console.log(`🌀 MAIA-PAI Context: ${conversationContext.getSpine().conversationDepth} depth | Turn ${conversationContext.getSpine().messageCount} | Trust: ${(conversationContext.getSpine().trustLevel * 100).toFixed(0)}%`);
  console.log(`🎭 Response config: ${depthConfig.maxTokens} tokens max | Style: ${depthConfig.responseStyle}`);

  // 🎯 PERFORMANCE PROFILING: Track each major stage for optimization
  const performanceProfile = {
    totalDuration: 0,
    stages: {
      initialization: 0,
      complexityAnalysis: 0,
      maiaPaiKernel: 0,
      maiaCore: 0,
      gebserAnalysis: 0,
      elementalField: 0,
      elementalSummary: 0,
      conversationalElemental: 0,
      compilation: 0
    }
  };

  // 🧠 ADAPTIVE INTELLIGENCE: Analyze message complexity first
  const complexityStartTime = Date.now();
  const complexityAnalysis = analyzeMessageComplexity(message, conversationHistory);
  performanceProfile.stages.complexityAnalysis = Date.now() - complexityStartTime;
  console.log(`🎯 Message complexity: ${complexityAnalysis.level} | Required layers: ${complexityAnalysis.requiredLayers.join(', ')}`);
  console.log(`💭 Reasoning: ${complexityAnalysis.reasoning}`);

  // 🚀 CLAUDE DEVELOPMENT MODE: Initialize development analysis context
  const devModeContext: DevModeContext = {
    sessionId,
    currentInput: message,
    conversationHistory,
    orchestrationConfig: {
      type: 'primary', // Will be determined by MAIA's orchestrator
      engines: [], // Will be populated by multi-engine orchestra
      layer: 'consciousness' // Default layer for orchestration
    },
    maiaState: {
      awarenessLevel: 'everyday', // Will be detected by awareness adapter
      elementalResonance: 'balanced', // Will be determined by elemental analysis
      foreplayPhase: Math.min(conversationHistory.length + 1, 4),
      relationshipDepth: conversationContext.getSpine().trustLevel
    }
  };

  // 🔍 DEVELOPMENT MODE ANALYSIS (only in development with flag enabled)
  let claudeDevAnalysis: ClaudeDevAnalysis | null = null;
  if (process.env.NODE_ENV === 'development' && process.env.CLAUDE_DEV_ORCHESTRATION === 'true') {
    try {
      claudeDevAnalysis = await claudeDevOrchestration.performCompleteAnalysis(devModeContext);
      if (claudeDevAnalysis) {
        console.log('🔬 Claude Dev Analysis Active:');
        console.log(`   Orchestration: ${claudeDevAnalysis.orchestrationOptimization.currentPattern} (confidence: ${claudeDevAnalysis.orchestrationOptimization.confidenceScore})`);
        console.log(`   Voice: ${claudeDevAnalysis.promptEnhancement.voiceCalibration}`);
        console.log(`   Flow: Phase ${claudeDevAnalysis.conversationFlow.maiaPreForeplayPhase}, ${claudeDevAnalysis.conversationFlow.questionQuality} questions`);
      }
    } catch (error) {
      console.warn('Claude dev analysis failed, continuing normally:', error);
    }
  }

  // Track which layers succeed/fail for diagnostics + performance timing
  const layersSuccessful: string[] = [];
  const layersFailed: string[] = [];
  const layerTimings: { [key: string]: number } = {};
  const orchestrationStartTime = Date.now();

  // 🌀 MAIA-PAI THROUGHLINE REFLEX: Pre-response analysis
  const maiaPaiStartTime = Date.now();
  const throughline = conversationContext.calculateThroughline();
  const stakes = conversationContext.assessStakes();
  const contextPrompt = conversationContext.generateContextPrompt();
  performanceProfile.stages.maiaPaiKernel = Date.now() - maiaPaiStartTime;

  console.log(`🎯 THROUGHLINE REFLEX: "${throughline}"`);
  console.log(`🔥 STAKES ASSESSMENT: "${stakes}"`);

  // 🧠 MEMORY BUNDLE: Retrieve ranked context from multiple buckets
  // Server-side allowlist guard: client can request, but server decides
  const modeResolution = resolveMemoryMode(userId, (meta as any)?.memoryMode);
  const memoryMode = modeResolution.effective;

  console.log('🧠 [MemoryGate] modes', {
    userId,
    requestedMode: modeResolution.requested,
    memoryMode: modeResolution.effective,
    allowLongterm: modeResolution.allowLongterm,
  });

  logMemoryGateDenial('Orchestrator', userId, modeResolution);

  let memoryBundle: MemoryBundle | null = null;
  let memoryContext = '';

  if (memoryMode !== 'ephemeral') {
    try {
      const memoryBundleStartTime = Date.now();
      memoryBundle = await MemoryBundleService.build({
        userId,
        currentInput: message,
        sessionId,
        scope: memoryMode === 'continuity' ? 'cross_session' : 'all',
        maxBullets: 5,
      });

      if (memoryBundle) {
        memoryContext = MemoryBundleService.formatForPrompt(memoryBundle);
        console.log(`📦 [MemoryBundle] Retrieved: ${memoryBundle.retrievalStats.totalCandidates} candidates → ${memoryBundle.memoryBullets.length} bullets`);
        console.log(`📦 [MemoryBundle] Relationship: ${memoryBundle.relationshipSnapshot.encounterCount} encounters, ${memoryBundle.relationshipSnapshot.breakthroughCount} breakthroughs`);
      }

      layerTimings['memory-bundle'] = Date.now() - memoryBundleStartTime;
      layersSuccessful.push('memory-bundle');
    } catch (error) {
      console.warn('[MemoryBundle] Retrieval failed (continuing without):', error);
      layersFailed.push('memory-bundle');
    }
  } else {
    console.log('📦 [MemoryBundle] Skipped - ephemeral mode');
  }

  // 1️⃣ ALWAYS: Get base MAIA response first (core functionality) with conversation context
  let maiaResult;
  try {
    const maiaStartTime = Date.now();
    maiaResult = await getMaiaResponse({
      sessionId,
      input: message,
      meta: {
        ...meta,     // ✅ Include explorerId/userId from normalized meta
        ...context,
        userId,      // 🔑 Explicitly include userId for TurnsStore cross-session persistence
        memoryMode,  // 🧠 Permission gate for memory operations
        // 🧠 MEMORY BUNDLE: Inject compressed context from multi-bucket retrieval
        memoryContext: memoryContext || undefined,
        memoryBundle: memoryBundle ? {
          bulletCount: memoryBundle.memoryBullets.length,
          encounterCount: memoryBundle.relationshipSnapshot.encounterCount,
          breakthroughCount: memoryBundle.relationshipSnapshot.breakthroughCount,
        } : undefined,
        // MAIA-PAI conversational kernel context
        conversationContext: {
          depth: conversationContext.getSpine().conversationDepth,
          throughline,
          stakes,
          trustLevel: conversationContext.getSpine().trustLevel,
          messageCount: conversationContext.getSpine().messageCount,
          depthConfig: depthConfig,
          contextPrompt: contextPrompt
        }
      },
    });
    const maiaCoreTime = Date.now() - maiaPaiStartTime;
    layerTimings['maia-core'] = maiaCoreTime;
    performanceProfile.stages.maiaCore = maiaCoreTime;
    layersSuccessful.push('maia-core');
  } catch (error) {
    console.error('CRITICAL: Core MAIA response failed:', error);
    // Fallback response if core MAIA fails
    maiaResult = {
      text: "I'm experiencing some difficulty processing right now, but I'm here with you. Could you try again?",
      consciousness: null,
      metadata: { error: true }
    };
    const maiaCoreTime = Date.now() - maiaPaiStartTime;
    layerTimings['maia-core'] = maiaCoreTime;
    performanceProfile.stages.maiaCore = maiaCoreTime;
    layersFailed.push('maia-core');
  }

  // 2️⃣ CONSCIOUSNESS LAYER 1: Gebser Structure Analysis (ADAPTIVE)
  let gebserStructure = null;
  if (complexityAnalysis.requiredLayers.includes('gebser-analysis')) {
    const gebserStartTime = Date.now();
    try {
      gebserStructure = await safeGebserAnalysis({
        message,
        userId,
        sessionId,
        conversationHistory
      });
      const gebserTime = Date.now() - gebserStartTime;
      layerTimings['gebser-analysis'] = gebserTime;
      performanceProfile.stages.gebserAnalysis = gebserTime;
      if (gebserStructure) {
        layersSuccessful.push('gebser-analysis');
      } else {
        layersFailed.push('gebser-analysis');
      }
    } catch (error) {
      console.warn('Gebser analysis layer failed:', error);
      const gebserTime = Date.now() - gebserStartTime;
      layerTimings['gebser-analysis'] = gebserTime;
      performanceProfile.stages.gebserAnalysis = gebserTime;
      layersFailed.push('gebser-analysis');
    }
  } else {
    console.log('🚀 Skipping Gebser analysis - not needed for this complexity level');
  }

  // 3️⃣ CONSCIOUSNESS LAYER 2: Elemental Field Analysis (ADAPTIVE)
  let elementalField = null;
  if (complexityAnalysis.requiredLayers.includes('elemental-field')) {
    const elementalStartTime = Date.now();
    try {
      elementalField = await safeElementalFieldState({
        message,
        gebserAnalysis: gebserStructure,
        conversationHistory,
        elementalPhaseContext: context.elementalPhaseContext
      });
      const elementalTime = Date.now() - elementalStartTime;
      layerTimings['elemental-field'] = elementalTime;
      performanceProfile.stages.elementalField = elementalTime;
      if (elementalField) {
        layersSuccessful.push('elemental-field');
      } else {
        layersFailed.push('elemental-field');
      }
    } catch (error) {
      console.warn('Elemental field layer failed:', error);
      const elementalTime = Date.now() - elementalStartTime;
      layerTimings['elemental-field'] = elementalTime;
      performanceProfile.stages.elementalField = elementalTime;
      layersFailed.push('elemental-field');
    }
  } else {
    console.log('🚀 Skipping elemental field analysis - not needed for this complexity level');
  }

  // 4️⃣ CONSCIOUSNESS LAYER 3: Elemental Field Summary (ADAPTIVE)
  let elementalFieldSummary = null;
  if (complexityAnalysis.requiredLayers.includes('elemental-field-summary')) {
    const summaryStartTime = Date.now();
    try {
      elementalFieldSummary = await safeElementalFieldSummary(userId);
      const summaryTime = Date.now() - summaryStartTime;
      layerTimings['elemental-field-summary'] = summaryTime;
      performanceProfile.stages.elementalSummary = summaryTime;
      if (elementalFieldSummary) {
        layersSuccessful.push('elemental-field-summary');
      } else {
        layersFailed.push('elemental-field-summary');
      }
    } catch (error) {
      console.warn('Elemental field summary layer failed:', error);
      const summaryTime = Date.now() - summaryStartTime;
      layerTimings['elemental-field-summary'] = summaryTime;
      performanceProfile.stages.elementalSummary = summaryTime;
      layersFailed.push('elemental-field-summary');
    }
  } else {
    console.log('🚀 Skipping elemental field summary - not needed for this complexity level');
  }

  // 5️⃣ CONSCIOUSNESS LAYER 4: Conversational Elemental Intelligence (ADAPTIVE)
  let conversationalElemental = null;
  if (complexityAnalysis.requiredLayers.includes('conversational-elemental')) {
    const conversationalStartTime = Date.now();
    try {
      const cei = getConversationalElementalIntelligence();
      const elementalContext = await cei.getConversationalElementalContext(
        userId,
        sessionId,
        message,
        conversationHistory
      );
      const conversationalTime = Date.now() - conversationalStartTime;
      layerTimings['conversational-elemental'] = conversationalTime;
      performanceProfile.stages.conversationalElemental = conversationalTime;
      if (elementalContext) {
        conversationalElemental = elementalContext;
        layersSuccessful.push('conversational-elemental');
      } else {
        layersFailed.push('conversational-elemental');
      }
    } catch (error) {
      console.warn('Conversational elemental intelligence layer failed:', error);
      const conversationalTime = Date.now() - conversationalStartTime;
      layerTimings['conversational-elemental'] = conversationalTime;
      performanceProfile.stages.conversationalElemental = conversationalTime;
      layersFailed.push('conversational-elemental');
    }
  } else {
    console.log('🚀 Skipping conversational elemental intelligence - not needed for this complexity level');
  }

  // 6️⃣ COMPILE CONSCIOUSNESS ANALYSIS
  const totalLayers = 5; // maia-core, gebser, elemental-field, elemental-field-summary, conversational-elemental
  const consciousnessAnalysis: ConsciousnessAnalysis = {
    gebserStructure,
    elementalField,
    elementalFieldSummary,
    conversationalElemental,
    analysisMetadata: {
      layersSuccessful,
      layersFailed,
      totalLayers,
      successRate: layersSuccessful.length / totalLayers
    }
  };

  // 🌀 MAIA-PAI CONVERSATIONAL KERNEL: Track this interaction
  const significance = layersFailed.length === 0 ? 'connection' :
                      throughline.includes('purpose') || throughline.includes('meaning') ? 'insight' :
                      stakes.includes('High stakes') ? 'breakthrough' : 'routine';

  conversationContext.addMoment(message, maiaResult.text, significance);
  console.log(`💫 Conversation moment tracked: ${significance} | Spine updated`);

  // 🧠 MEMORY WRITEBACK: Promote to long-term memory if conditions met
  let writebackResult: { wrote: boolean; memoryId?: string; reason?: string } = { wrote: false, reason: 'skipped' };
  if (memoryMode === 'longterm') {
    try {
      const writebackStartTime = Date.now();
      // Extract elemental info (cast to any to avoid strict type issues with null assignments)
      const elementField = elementalField as any;
      const convElemental = conversationalElemental as any;

      writebackResult = await MemoryWritebackService.writeBack({
        userId,
        sessionId,
        userMessage: message,
        assistantResponse: maiaResult.text,
        facetCode: elementField?.dominantElement || convElemental?.context?.dominantElement,
        element: elementField?.dominantElement,
        memoryMode,
        route: (maiaResult as any).metadata?.route || 'unknown',
        timestamp: new Date(),
      });

      layerTimings['memory-writeback'] = Date.now() - writebackStartTime;

      if (writebackResult.wrote) {
        console.log(`✅ [MemoryWriteback] Promoted to long-term memory: ${writebackResult.memoryId}`);
        layersSuccessful.push('memory-writeback');
      } else {
        console.log(`📝 [MemoryWriteback] Skipped: ${writebackResult.reason}`);
      }
    } catch (error) {
      console.warn('[MemoryWriteback] Failed (continuing without):', error);
      layersFailed.push('memory-writeback');
    }
  } else {
    console.log(`📝 [MemoryWriteback] Skipped - ${memoryMode} mode`);
  }

  // 7️⃣ COMPILE FINAL RESPONSE
  const compilationStartTime = Date.now();
  performanceProfile.totalDuration = Date.now() - orchestrationStartTime;

  const response: MaiaConsciousnessResponse = {
    message: maiaResult.text,
    consciousness: consciousnessAnalysis,
    route: {
      endpoint: '/api/consciousness/orchestrator',
      type: 'MAIA Consciousness Turn',
      operational: layersSuccessful.includes('maia-core'),
      mode: 'fail-soft-orchestration',
      safeMode: process.env.MAIA_SAFE_MODE === 'true'
    },
    session: {
      id: sessionId
    },
    metadata: {
      ...maiaResult.metadata,
      consciousnessLayers: {
        successful: layersSuccessful,
        failed: layersFailed,
        successRate: `${Math.round((layersSuccessful.length / totalLayers) * 100)}%`
      },
      // MAIA-PAI conversational kernel metadata
      maiaPaiKernel: {
        conversationDepth: conversationContext.getSpine().conversationDepth,
        trustLevel: conversationContext.getSpine().trustLevel,
        messageCount: conversationContext.getSpine().messageCount,
        throughline,
        stakes,
        significance,
        maxTokens: depthConfig.maxTokens,
        responseStyle: depthConfig.responseStyle
      },
      // Claude development mode analysis (only in development)
      claudeDevAnalysis: process.env.NODE_ENV === 'development' ? claudeDevAnalysis : null,
      // 🔒 SECURITY: Signal to UI when input contained sensitive data (not stored)
      sensitiveInput: containsSensitiveData(message),
      // 🧠 MEMORY PIPELINE DATA (full details in dev, minimal in prod)
      memoryPipeline: (() => {
        const bundleChars = memoryContext.length;
        const recallQuality = memoryBundle
          ? computeRecallQuality(
              {
                turnsRetrieved: memoryBundle.retrievalStats.turnsRetrieved,
                turnsCrossSession: memoryBundle.retrievalStats.turnsCrossSession,
                semanticHits: memoryBundle.retrievalStats.semanticHits,
                breakthroughsFound: memoryBundle.retrievalStats.breakthroughsFound,
              },
              bundleChars
            )
          : 0;

        if (process.env.NODE_ENV === 'development' || meta.debugMemory) {
          return {
            mode: memoryMode,
            retrieval: memoryBundle ? {
              turnsRetrieved: memoryBundle.retrievalStats.turnsRetrieved,
              turnsSameSession: memoryBundle.retrievalStats.turnsSameSession,
              turnsCrossSession: memoryBundle.retrievalStats.turnsCrossSession,
              semanticHits: memoryBundle.retrievalStats.semanticHits,
              breakthroughsFound: memoryBundle.retrievalStats.breakthroughsFound,
              bulletsInjected: memoryBundle.memoryBullets.length,
            } : null,
            bundleChars,
            recallQuality,
            writeback: writebackResult,
            relationshipSnapshot: memoryBundle?.relationshipSnapshot || null,
          };
        }
        return {
          mode: memoryMode,
          wrote: writebackResult?.wrote || false,
          bundleChars,
          recallQuality,
        };
      })(),
      // 🎯 PERFORMANCE PROFILING DATA
      performanceProfile: {
        totalDuration: performanceProfile.totalDuration,
        stages: performanceProfile.stages,
        complexityLevel: complexityAnalysis.level,
        layersExecuted: complexityAnalysis.requiredLayers,
        bottlenecks: Object.entries(performanceProfile.stages)
          .filter(([_, time]) => time > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([stage, time]) => ({ stage, timeMs: time }))
      },
      failSoftMode: true,
      timestamp: new Date().toISOString()
    }
  };

  performanceProfile.stages.compilation = Date.now() - compilationStartTime;

  // 8️⃣ LOG CONSCIOUSNESS DIAGNOSTICS
  if (layersFailed.length > 0) {
    console.warn(`🧠 Consciousness layers failed: ${layersFailed.join(', ')}`);
  }
  if (layersSuccessful.length > 0) {
    console.log(`🌟 Consciousness layers successful: ${layersSuccessful.join(', ')}`);
  }
  console.log(`🎯 Consciousness success rate: ${Math.round((layersSuccessful.length / totalLayers) * 100)}%`);

  // 🎯 PERFORMANCE DIAGNOSTICS
  console.log(`⏱️ Total orchestration time: ${performanceProfile.totalDuration}ms`);
  console.log(`📊 Stage breakdown:`);
  Object.entries(performanceProfile.stages).forEach(([stage, time]) => {
    if (time > 0) {
      const percentage = ((time / performanceProfile.totalDuration) * 100).toFixed(1);
      console.log(`   ${stage}: ${time}ms (${percentage}%)`);
    }
  });

  // 🚨 BOTTLENECK WARNINGS
  const bottlenecks = Object.entries(performanceProfile.stages)
    .filter(([_, time]) => time > 0)
    .sort((a, b) => b[1] - a[1]);

  if (bottlenecks.length > 0) {
    const slowest = bottlenecks[0];
    if (slowest[1] > 3000) { // Warn if any stage takes over 3 seconds
      console.warn(`🚨 PERFORMANCE WARNING: ${slowest[0]} took ${slowest[1]}ms (${((slowest[1] / performanceProfile.totalDuration) * 100).toFixed(1)}% of total time)`);
    }
  }

  if (performanceProfile.totalDuration > 8000) { // Warn if approaching timeout
    console.warn(`🚨 TIMEOUT RISK: Total orchestration (${performanceProfile.totalDuration}ms) approaching 12-second timeout threshold`);
  }

  return response;
}

/**
 * Simplified interface for basic MAIA responses without full consciousness analysis
 * Useful for simple interactions that don't need the full consciousness pipeline
 */
export async function generateSimpleMaiaResponse(
  message: string,
  sessionId: string,
  context: any = {}
): Promise<{ message: string; metadata: any }> {
  try {
    // Extract normalized meta if provided, otherwise use context directly
    const { meta: normalizedMeta, ...restContext } = context;
    const mergedMeta = normalizedMeta
      ? { ...normalizedMeta, ...restContext }
      : context;

    const maiaResult = await getMaiaResponse({
      sessionId,
      input: message,
      meta: mergedMeta,
    });

    return {
      message: maiaResult.text,
      metadata: {
        ...maiaResult.metadata,
        mode: 'simple-response',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Simple MAIA response failed:', error);
    return {
      message: "I'm here, though I'm having some difficulty right now. What's on your mind?",
      metadata: {
        error: true,
        mode: 'fallback-response',
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Get consciousness analysis without generating response
 * Useful for consciousness diagnostics and analysis
 */
export async function analyzeConsciousnessOnly(input: MaiaConsciousnessInput): Promise<ConsciousnessAnalysis> {
  const { message, userId, sessionId, conversationHistory = [], context = {} } = input;

  const layersSuccessful: string[] = [];
  const layersFailed: string[] = [];

  // Gebser analysis
  let gebserStructure = null;
  try {
    gebserStructure = await safeGebserAnalysis({
      message,
      userId,
      sessionId,
      conversationHistory
    });
    gebserStructure ? layersSuccessful.push('gebser') : layersFailed.push('gebser');
  } catch {
    layersFailed.push('gebser');
  }

  // Elemental field analysis
  let elementalField = null;
  try {
    elementalField = await safeElementalFieldState({
      message,
      gebserAnalysis: gebserStructure,
      conversationHistory
    });
    elementalField ? layersSuccessful.push('elemental-field') : layersFailed.push('elemental-field');
  } catch {
    layersFailed.push('elemental-field');
  }

  // Elemental field summary
  let elementalFieldSummary = null;
  try {
    elementalFieldSummary = await safeElementalFieldSummary(userId);
    elementalFieldSummary ? layersSuccessful.push('elemental-field-summary') : layersFailed.push('elemental-field-summary');
  } catch {
    layersFailed.push('elemental-field-summary');
  }

  // Conversational elemental intelligence
  let conversationalElemental = null;
  try {
    const cei = getConversationalElementalIntelligence();
    const elementalContext = await cei.getConversationalElementalContext(
      userId,
      sessionId,
      message,
      conversationHistory
    );
    if (elementalContext) {
      conversationalElemental = elementalContext;
      layersSuccessful.push('conversational-elemental');
    } else {
      layersFailed.push('conversational-elemental');
    }
  } catch {
    layersFailed.push('conversational-elemental');
  }

  const totalLayers = 4; // gebser, elemental-field, elemental-field-summary, conversational-elemental

  return {
    gebserStructure,
    elementalField,
    elementalFieldSummary,
    conversationalElemental,
    analysisMetadata: {
      layersSuccessful,
      layersFailed,
      totalLayers,
      successRate: layersSuccessful.length / totalLayers
    }
  };
}

/**
 * Health check for consciousness orchestrator
 * Returns status of all consciousness layers
 */
export async function consciousnessHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  layers: { [key: string]: 'ok' | 'error' | 'unknown' };
  successRate: number;
}> {
  const testMessage = "Test message for health check";
  const testUserId = "health-check-user";
  const testSessionId = `health-check-${Date.now()}`;

  const layers: { [key: string]: 'ok' | 'error' | 'unknown' } = {
    'maia-core': 'unknown',
    'gebser': 'unknown',
    'elemental-field': 'unknown',
    'elemental-field-summary': 'unknown',
    'conversational-elemental': 'unknown'
  };

  // Test core MAIA
  try {
    await getMaiaResponse({
      sessionId: testSessionId,
      input: testMessage,
      meta: {},
    });
    layers['maia-core'] = 'ok';
  } catch {
    layers['maia-core'] = 'error';
  }

  // Test Gebser
  try {
    const result = await safeGebserAnalysis(testMessage);
    layers['gebser'] = result !== null ? 'ok' : 'error';
  } catch {
    layers['gebser'] = 'error';
  }

  // Test elemental field
  try {
    const result = await safeElementalFieldState({
      message: testMessage,
      gebserAnalysis: null
    });
    layers['elemental-field'] = result !== null ? 'ok' : 'error';
  } catch {
    layers['elemental-field'] = 'error';
  }

  // Test elemental field summary
  try {
    const result = await safeElementalFieldSummary(testUserId);
    layers['elemental-field-summary'] = result !== null ? 'ok' : 'error';
  } catch {
    layers['elemental-field-summary'] = 'error';
  }

  // Test conversational elemental
  try {
    const cei = getConversationalElementalIntelligence();
    const result = await cei.getConversationalElementalContext(
      testUserId,
      testSessionId,
      testMessage,
      []
    );
    layers['conversational-elemental'] = result ? 'ok' : 'error';
  } catch {
    layers['conversational-elemental'] = 'error';
  }

  const okCount = Object.values(layers).filter(status => status === 'ok').length;
  const totalCount = Object.keys(layers).length;
  const successRate = okCount / totalCount;

  let status: 'healthy' | 'degraded' | 'critical';
  if (successRate >= 0.8) {
    status = 'healthy';
  } else if (successRate >= 0.5) {
    status = 'degraded';
  } else {
    status = 'critical';
  }

  return {
    status,
    layers,
    successRate
  };
}