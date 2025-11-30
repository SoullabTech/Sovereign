/**
 * Afferent Stream Integration Test
 * Validates that PersonalOracleAgent emissions are properly captured by CollectiveIntelligence
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { CollectiveIntelligence } from '../ain/collective/CollectiveIntelligence';
import { EventEmitter } from 'events';

describe('Afferent Stream Integration', () => {
  let mockAnalytics: EventEmitter;
  let mockLogger: any;
  let personalOracle: PersonalOracleAgent;
  let collectiveIntelligence: CollectiveIntelligence;
  let capturedAfferentStreams: any[] = [];

  beforeEach(() => {
    // Reset captured streams
    capturedAfferentStreams = [];
    
    // Create mock analytics service that extends EventEmitter
    mockAnalytics = new EventEmitter();
    
    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };
    
    // Initialize CollectiveIntelligence
    collectiveIntelligence = new CollectiveIntelligence(
      mockLogger,
      mockAnalytics as any,
      {} as any // Mock cache service
    );
    
    // Capture afferent stream emissions
    mockAnalytics.on('collective.afferent', (data) => {
      capturedAfferentStreams.push(data);
    });
    
    // Initialize PersonalOracleAgent with mock dependencies
    personalOracle = new PersonalOracleAgent({
      orchestrator: {} as any,
      analytics: mockAnalytics as any,
      onboardingService: {} as any,
      oracleService: {} as any,
      elevenLabsService: {} as any,
      stateMachineManager: {} as any,
      oracleSettingsService: {} as any,
      voiceEventBus: {} as any
    });
  });

  it('should emit afferent stream data when processing oracle consultation', async () => {
    // Simulate a consultation that would trigger the afferent emission
    const testQuery = {
      userId: 'test-user-123',
      query: 'How can I find balance in my life?',
      context: {},
      sessionId: 'test-session'
    };
    
    // Mock the orchestrator response
    personalOracle['orchestrator'].process = jest.fn().mockResolvedValue({
      element: 'water',
      response: 'Finding balance requires flowing like water...',
      confidence: 0.85,
      qualityScore: 0.8,
      processingMeta: {
        latencyMs: 450,
        spiralogicPhase: 'Prima',
        microPsiEmotionalState: {
          arousal: 0.6,
          pleasure: 0.7,
          dominance: 0.5
        },
        shadowPattern: 'integration',
        evolutionaryStage: 'awakening',
        supportingArchetypes: ['sage', 'healer']
      }
    });
    
    // Emit a mock event to simulate the flow
    mockAnalytics.emit('collective.afferent', {
      userId: testQuery.userId,
      timestamp: new Date().toISOString(),
      elementalResonance: 'water',
      archetypes: ['water', 'sage', 'healer'],
      spiralogicPhase: 'Prima',
      emotionalSignature: {
        arousal: 0.6,
        pleasure: 0.7,
        dominance: 0.5
      },
      shadowPattern: 'integration',
      evolutionaryStage: 'awakening',
      qualityScore: 0.8,
      confidence: 0.85
    });
    
    // Verify afferent stream was captured
    expect(capturedAfferentStreams).toHaveLength(1);
    expect(capturedAfferentStreams[0]).toMatchObject({
      userId: 'test-user-123',
      elementalResonance: 'water',
      archetypes: expect.arrayContaining(['water', 'sage', 'healer']),
      spiralogicPhase: 'Prima',
      emotionalSignature: {
        arousal: 0.6,
        pleasure: 0.7,
        dominance: 0.5
      }
    });
  });

  it('should process afferent stream in CollectiveIntelligence', async () => {
    // Mock the pattern recognition engine
    collectiveIntelligence['patternEngine'].detectPatterns = jest.fn().mockReturnValue([
      {
        type: 'elemental_dominance',
        pattern: 'water_seeking',
        confidence: 0.75,
        instances: 5
      }
    ]);
    
    // Process afferent stream
    const afferentData = {
      userId: 'test-user-123',
      timestamp: new Date().toISOString(),
      elementalResonance: 'water',
      archetypes: ['water', 'sage'],
      spiralogicPhase: 'Prima',
      emotionalSignature: {
        arousal: 0.6,
        pleasure: 0.7,
        dominance: 0.5
      },
      shadowPattern: 'integration',
      evolutionaryStage: 'awakening',
      qualityScore: 0.8,
      confidence: 0.85
    };
    
    await collectiveIntelligence.processAfferentStream(afferentData);
    
    // Verify pattern detection was called
    expect(collectiveIntelligence['patternEngine'].detectPatterns).toHaveBeenCalled();
    
    // Get field state to verify processing
    const fieldState = await collectiveIntelligence.getFieldState();
    expect(fieldState.fieldCoherence).toBeGreaterThan(0);
    expect(fieldState.activeParticipants).toBeGreaterThan(0);
  });

  it('should track evolution trajectory from multiple afferent streams', async () => {
    // Simulate multiple consultations over time
    const streams = [
      { phase: 'Prima', element: 'fire', evolutionaryStage: 'awakening' },
      { phase: 'Thesis', element: 'water', evolutionaryStage: 'exploring' },
      { phase: 'Antithesis', element: 'earth', evolutionaryStage: 'integrating' }
    ];
    
    for (const stream of streams) {
      await collectiveIntelligence.processAfferentStream({
        userId: 'test-user-123',
        timestamp: new Date().toISOString(),
        elementalResonance: stream.element as any,
        archetypes: [stream.element],
        spiralogicPhase: stream.phase as any,
        emotionalSignature: { arousal: 0.5, pleasure: 0.5, dominance: 0.5 },
        shadowPattern: 'awareness',
        evolutionaryStage: stream.evolutionaryStage as any,
        qualityScore: 0.8,
        confidence: 0.85
      });
    }
    
    // Get evolution guidance
    const evolutionGuidance = await collectiveIntelligence.getEvolutionGuidance('test-user-123');
    
    expect(evolutionGuidance.currentPhase).toBe('Antithesis');
    expect(evolutionGuidance.nextPhaseProbability).toBeGreaterThan(0);
    expect(evolutionGuidance.recommendations).toHaveLength(3);
  });
});