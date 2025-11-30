/**
 * Encounter Engine
 * Processes encounters and generates encounter signatures
 * Step 2 of Phase 2 Service Consolidation - Merges narrative services
 */

import { EventBus, daimonicEventBus } from '../core/EventBus.js';
import { UnifiedStorageService } from '../core/UnifiedStorageService.js';
import { TypeRegistry, BaseEntity } from '../core/TypeRegistry.js';

export interface EncounterSignature {
  id: string;
  timestamp: string;
  userId: string;
  irreducibility: number;    // 0-1: How much the encounter resists simple explanation
  resistance: number;        // 0-1: How much the encounter pushes back
  surprise: number;         // 0-1: How unexpected the encounter was
  coherence: number;        // 0-1: How well the encounter hangs together
  type: "conflict" | "opening" | "paradox" | "breakthrough" | "ordinary";
  safetyLevel: "green" | "yellow" | "red";
  
  // Extended metadata for full encounter context
  encounterContext?: {
    triggeringEvent?: string;
    durationSeconds?: number;
    intensityLevel?: number;
    emotionalTone?: string;
    bodySensations?: string[];
    thoughtPatterns?: string[];
    environmentalFactors?: string[];
  };
  
  // Integration tracking
  integrationAttempts?: IntegrationAttempt[];
  followUpEncounters?: string[]; // IDs of related encounters
}

export interface IntegrationAttempt {
  attemptId: string;
  timestamp: string;
  approach: string;         // How the user tried to integrate
  outcome: 'successful' | 'partial' | 'failed' | 'resistance';
  notes?: string;
  bodySensations?: string[];
  emotionalResponse?: string;
}

export interface LayeredResponse {
  phenomenological: string;  // Weather/body language description
  dialogical?: string;      // Conversational engagement layer
  architectural?: string;   // System/pattern layer
  
  // Response metadata
  layerUsed: 'phenomenological' | 'dialogical' | 'architectural' | 'mixed';
  adaptationReason?: string;
  safetyAdjustments?: string[];
}

export interface EncounterProcessingContext {
  userId: string;
  sessionId: string;
  userInput: string;
  conversationHistory?: string[];
  userCapacitySignals?: {
    trust: number;
    engagementDepth: number;
    integrationSkill: number;
    safetyFlag: boolean;
  };
  environmentalContext?: {
    timeOfDay: string;
    sessionDuration: number;
    userEnergyLevel?: number;
  };
}

export interface EncounterAnalysis {
  signature: EncounterSignature;
  response: LayeredResponse;
  processingNotes: string[];
  recommendedFollowUp?: string[];
  safetyFlags?: string[];
}

/**
 * EncounterEngine - Processes user encounters and generates appropriate responses
 * 
 * This is the consolidated encounter processing system that merges:
 * - Encounter signature generation
 * - Safety assessment
 * - Layered response generation
 * - Integration tracking
 */
export class EncounterEngine {
  private eventBus: EventBus;
  private storage: UnifiedStorageService;
  private typeRegistry: TypeRegistry;
  
  // Processing modules (to be implemented by devs)
  private irreducibilityAnalyzer: IrreducibilityAnalyzer;
  private resistanceDetector: ResistanceDetector;
  private surpriseCalculator: SurpriseCalculator;
  private coherenceEvaluator: CoherenceEvaluator;
  private safetyAssessor: SafetyAssessor;
  private responseGenerator: LayeredResponseGenerator;

  constructor(
    eventBus: EventBus = daimonicEventBus,
    storage: UnifiedStorageService,
    typeRegistry: TypeRegistry
  ) {
    this.eventBus = eventBus;
    this.storage = storage;
    this.typeRegistry = typeRegistry;
    
    // Initialize processing modules (stubs for now)
    this.irreducibilityAnalyzer = new IrreducibilityAnalyzer();
    this.resistanceDetector = new ResistanceDetector();
    this.surpriseCalculator = new SurpriseCalculator();
    this.coherenceEvaluator = new CoherenceEvaluator();
    this.safetyAssessor = new SafetyAssessor();
    this.responseGenerator = new LayeredResponseGenerator();
    
    this.setupEventHandlers();
  }

  /**
   * Main processing method: analyze encounter and generate layered response
   */
  async processEncounter(context: EncounterProcessingContext): Promise<EncounterAnalysis> {
    try {
      // Step 1: Generate encounter signature
      const signature = await this.generateEncounterSignature(context);
      
      // Step 2: Assess safety level
      await this.assessSafety(signature, context);
      
      // Step 3: Generate layered response based on signature and safety
      const response = await this.generateLayeredResponse(signature, context);
      
      // Step 4: Store encounter for tracking
      await this.storeEncounter(signature, context);
      
      // Step 5: Check for integration opportunities
      const processingNotes = await this.generateProcessingNotes(signature, response);
      
      // Step 6: Emit encounter event
      await this.eventBus.emit('encounter:processed', {
        signature,
        response,
        context,
        timestamp: new Date()
      });
      
      const analysis: EncounterAnalysis = {
        signature,
        response,
        processingNotes,
        recommendedFollowUp: await this.generateFollowUpSuggestions(signature),
        safetyFlags: this.extractSafetyFlags(signature)
      };
      
      return analysis;
      
    } catch (error) {
      console.error('Error processing encounter:', error);
      
      // Fallback to safe response
      return this.generateSafetyFallback(context);
    }
  }

  /**
   * Generate encounter signature from context
   */
  private async generateEncounterSignature(
    context: EncounterProcessingContext
  ): Promise<EncounterSignature> {
    
    const timestamp = new Date().toISOString();
    const encounterId = `encounter_${context.userId}_${Date.now()}`;
    
    // Calculate signature dimensions (dev implementation needed)
    const irreducibility = await this.irreducibilityAnalyzer.analyze(context);
    const resistance = await this.resistanceDetector.detect(context);
    const surprise = await this.surpriseCalculator.calculate(context);
    const coherence = await this.coherenceEvaluator.evaluate(context);
    
    // Determine encounter type based on signature
    const encounterType = this.classifyEncounterType(
      irreducibility, 
      resistance, 
      surprise, 
      coherence
    );
    
    const signature: EncounterSignature = {
      id: encounterId,
      timestamp,
      userId: context.userId,
      irreducibility,
      resistance,
      surprise,
      coherence,
      type: encounterType,
      safetyLevel: "green", // Will be updated by safety assessment
      encounterContext: {
        triggeringEvent: context.userInput,
        durationSeconds: context.environmentalContext?.sessionDuration || 0,
        intensityLevel: Math.max(resistance, surprise), // Simple heuristic
        environmentalFactors: this.extractEnvironmentalFactors(context)
      },
      integrationAttempts: [],
      followUpEncounters: []
    };
    
    return signature;
  }

  /**
   * Assess safety level and update signature
   */
  private async assessSafety(
    signature: EncounterSignature, 
    context: EncounterProcessingContext
  ): Promise<void> {
    
    const safetyLevel = await this.safetyAssessor.assess(signature, context);
    signature.safetyLevel = safetyLevel;
    
    // Emit safety event if needed
    if (safetyLevel === "red") {
      await this.eventBus.emit('encounter:safety_flag', {
        userId: context.userId,
        signature,
        reason: 'High-risk encounter signature detected',
        timestamp: new Date()
      });
    }
  }

  /**
   * Generate layered response based on encounter signature
   */
  private async generateLayeredResponse(
    signature: EncounterSignature,
    context: EncounterProcessingContext
  ): Promise<LayeredResponse> {
    
    return await this.responseGenerator.generate(signature, context);
  }

  /**
   * Store encounter for historical tracking
   */
  private async storeEncounter(
    signature: EncounterSignature,
    context: EncounterProcessingContext
  ): Promise<void> {
    
    const encounterEntity: BaseEntity & { signature: EncounterSignature; context: any } = {
      id: signature.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      signature,
      context: {
        userId: context.userId,
        sessionId: context.sessionId,
        userInput: context.userInput
      }
    };
    
    await this.storage.store('encounters', signature.id, encounterEntity);
    
    // Update user encounter history
    await this.updateUserEncounterHistory(context.userId, signature);
  }

  /**
   * Utility methods (stubs for dev implementation)
   */
  
  private classifyEncounterType(
    irreducibility: number,
    resistance: number,
    surprise: number,
    coherence: number
  ): EncounterSignature['type'] {
    
    // Simple classification heuristics (dev should enhance)
    if (resistance > 0.7 && coherence < 0.4) return "conflict";
    if (surprise > 0.8 && coherence > 0.6) return "breakthrough";
    if (irreducibility > 0.6 && resistance > 0.5) return "paradox";
    if (surprise < 0.3 && coherence > 0.7) return "ordinary";
    return "opening";
  }
  
  private extractEnvironmentalFactors(context: EncounterProcessingContext): string[] {
    const factors: string[] = [];
    
    if (context.environmentalContext?.timeOfDay) {
      factors.push(`time_${context.environmentalContext.timeOfDay}`);
    }
    
    if (context.userCapacitySignals?.safetyFlag) {
      factors.push('user_safety_flag_active');
    }
    
    return factors;
  }
  
  private async generateProcessingNotes(
    signature: EncounterSignature,
    response: LayeredResponse
  ): Promise<string[]> {
    
    const notes: string[] = [];
    
    notes.push(`Encounter type: ${signature.type}`);
    notes.push(`Safety level: ${signature.safetyLevel}`);
    notes.push(`Response layer: ${response.layerUsed}`);
    
    if (signature.irreducibility > 0.7) {
      notes.push('High irreducibility - resist oversimplification');
    }
    
    if (signature.resistance > 0.8) {
      notes.push('Strong resistance detected - allow pushback');
    }
    
    return notes;
  }
  
  private async generateFollowUpSuggestions(
    signature: EncounterSignature
  ): Promise<string[]> {
    
    const suggestions: string[] = [];
    
    switch (signature.type) {
      case 'conflict':
        suggestions.push('Allow time for integration');
        suggestions.push('Check for somatic responses');
        break;
      case 'breakthrough':
        suggestions.push('Consolidate insights');
        suggestions.push('Explore practical applications');
        break;
      case 'paradox':
        suggestions.push('Sit with contradiction');
        suggestions.push('Avoid premature resolution');
        break;
    }
    
    return suggestions;
  }
  
  private extractSafetyFlags(signature: EncounterSignature): string[] {
    const flags: string[] = [];
    
    if (signature.safetyLevel === 'red') {
      flags.push('immediate_fallback_required');
    }
    
    if (signature.safetyLevel === 'yellow') {
      flags.push('reduced_intensity_recommended');
    }
    
    return flags;
  }
  
  private async generateSafetyFallback(
    context: EncounterProcessingContext
  ): Promise<EncounterAnalysis> {
    
    const fallbackSignature: EncounterSignature = {
      id: `fallback_${context.userId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      irreducibility: 0.1,
      resistance: 0.1,
      surprise: 0.1,
      coherence: 0.9,
      type: "ordinary",
      safetyLevel: "green"
    };
    
    const fallbackResponse: LayeredResponse = {
      phenomenological: "I notice something unexpected in my processing. Let me take a gentler approach.",
      layerUsed: 'phenomenological'
    };
    
    return {
      signature: fallbackSignature,
      response: fallbackResponse,
      processingNotes: ['Error recovery fallback applied'],
      safetyFlags: ['processing_error']
    };
  }
  
  private async updateUserEncounterHistory(
    userId: string,
    signature: EncounterSignature
  ): Promise<void> {
    
    // Retrieve existing history
    const historyKey = `encounter_history_${userId}`;
    const existingHistory = await this.storage.retrieve('user_histories', historyKey) || [];
    
    // Add new encounter (keeping last 100 encounters)
    const updatedHistory = [signature, ...existingHistory].slice(0, 100);
    
    // Store updated history
    await this.storage.store('user_histories', historyKey, updatedHistory);
  }
  
  private setupEventHandlers(): void {
    // Listen for integration attempts
    this.eventBus.subscribe('integration:attempt', async (event) => {
      const { encounterId, attempt } = event.data;
      await this.trackIntegrationAttempt(encounterId, attempt);
    });
    
    // Listen for follow-up encounters
    this.eventBus.subscribe('encounter:follow_up', async (event) => {
      const { originalId, followUpId } = event.data;
      await this.linkFollowUpEncounter(originalId, followUpId);
    });
  }
  
  private async trackIntegrationAttempt(
    encounterId: string,
    attempt: IntegrationAttempt
  ): Promise<void> {
    
    const encounter = await this.storage.retrieve('encounters', encounterId);
    if (encounter && encounter.signature) {
      encounter.signature.integrationAttempts = encounter.signature.integrationAttempts || [];
      encounter.signature.integrationAttempts.push(attempt);
      
      await this.storage.store('encounters', encounterId, encounter);
    }
  }
  
  private async linkFollowUpEncounter(
    originalId: string,
    followUpId: string
  ): Promise<void> {
    
    const original = await this.storage.retrieve('encounters', originalId);
    if (original && original.signature) {
      original.signature.followUpEncounters = original.signature.followUpEncounters || [];
      original.signature.followUpEncounters.push(followUpId);
      
      await this.storage.store('encounters', originalId, original);
    }
  }

  /**
   * Public interface methods
   */
  
  async getEncounterHistory(userId: string, limit: number = 20): Promise<EncounterSignature[]> {
    const historyKey = `encounter_history_${userId}`;
    const history = await this.storage.retrieve('user_histories', historyKey) || [];
    return history.slice(0, limit);
  }
  
  async getEncounter(encounterId: string): Promise<EncounterSignature | null> {
    const encounter = await this.storage.retrieve('encounters', encounterId);
    return encounter?.signature || null;
  }
}

/**
 * Processing module interfaces (for dev implementation)
 */

interface IrreducibilityAnalyzer {
  analyze(context: EncounterProcessingContext): Promise<number>;
}

interface ResistanceDetector {
  detect(context: EncounterProcessingContext): Promise<number>;
}

interface SurpriseCalculator {
  calculate(context: EncounterProcessingContext): Promise<number>;
}

interface CoherenceEvaluator {
  evaluate(context: EncounterProcessingContext): Promise<number>;
}

interface SafetyAssessor {
  assess(signature: EncounterSignature, context: EncounterProcessingContext): Promise<"green" | "yellow" | "red">;
}

interface LayeredResponseGenerator {
  generate(signature: EncounterSignature, context: EncounterProcessingContext): Promise<LayeredResponse>;
}

/**
 * Stub implementations for processing modules
 * DEVS: Replace these with actual implementations
 */

class IrreducibilityAnalyzer implements IrreducibilityAnalyzer {
  async analyze(context: EncounterProcessingContext): Promise<number> {
    // Stub: Analyze how much the input resists simple explanation
    // Look for: paradoxes, contradictions, novel combinations, etc.
    return Math.random() * 0.5 + 0.2; // Placeholder
  }
}

class ResistanceDetector implements ResistanceDetector {
  async detect(context: EncounterProcessingContext): Promise<number> {
    // Stub: Detect how much the encounter pushes back
    // Look for: challenging questions, refusal to simplify, emotional intensity
    return Math.random() * 0.6 + 0.1; // Placeholder
  }
}

class SurpriseCalculator implements SurpriseCalculator {
  async calculate(context: EncounterProcessingContext): Promise<number> {
    // Stub: Calculate unexpectedness
    // Compare against user's typical patterns and conversation history
    return Math.random() * 0.4 + 0.3; // Placeholder
  }
}

class CoherenceEvaluator implements CoherenceEvaluator {
  async evaluate(context: EncounterProcessingContext): Promise<number> {
    // Stub: Evaluate how well the encounter hangs together
    // Look for: internal consistency, narrative coherence, meaning-making
    return Math.random() * 0.3 + 0.6; // Placeholder (generally coherent)
  }
}

class SafetyAssessor implements SafetyAssessor {
  async assess(signature: EncounterSignature, context: EncounterProcessingContext): Promise<"green" | "yellow" | "red"> {
    // Stub: Assess safety based on capacity signals and encounter intensity
    if (context.userCapacitySignals?.safetyFlag) return "red";
    if (signature.resistance > 0.8 && signature.surprise > 0.7) return "yellow";
    return "green";
  }
}

class LayeredResponseGenerator implements LayeredResponseGenerator {
  async generate(signature: EncounterSignature, context: EncounterProcessingContext): Promise<LayeredResponse> {
    // Stub: Generate appropriate response layer based on signature and safety
    
    const safetyLevel = signature.safetyLevel;
    const encounterType = signature.type;
    
    // Simple response generation logic (devs should enhance)
    if (safetyLevel === "red") {
      return {
        phenomenological: "I notice something intense is stirring. Let's breathe together for a moment.",
        layerUsed: 'phenomenological',
        safetyAdjustments: ['intensity_reduction', 'grounding_focus']
      };
    }
    
    if (encounterType === "paradox" && safetyLevel === "green") {
      return {
        phenomenological: "There's a tension here that doesn't want to resolve quickly.",
        dialogical: "What happens if we let this contradiction be exactly as it is?",
        layerUsed: 'mixed'
      };
    }
    
    // Default phenomenological response
    return {
      phenomenological: "I sense something moving beneath the surface of this conversation.",
      layerUsed: 'phenomenological'
    };
  }
}

export default EncounterEngine;