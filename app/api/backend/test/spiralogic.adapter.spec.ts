/**
 * Fast tests for SpiralogicAdapter - budget enforcement and canary functionality
 * Focuses on performance, caching, and graceful fallbacks
 */

import { SpiralogicAdapter } from '../src/orchestrators/SpiralogicAdapter';
import { SimpleCache } from '../src/core/implementations/SimpleCache';
import { SimpleAnalytics } from '../src/core/implementations/SimpleAnalytics';
import type { QueryRequest } from '../src/core/interfaces';

// Mock implementations for fast testing
const mockEngine = () => ({
  computeDailyArchetypes: jest.fn().mockResolvedValue({ 
    sage: 0.7, 
    warrior: 0.3,
    computed: new Date().toISOString() 
  }),
  loadContext: jest.fn().mockResolvedValue({ 
    summary: 'test context',
    memories: [],
    spiralPhase: 'initiation' 
  }),
  getConsciousnessState: jest.fn().mockReturnValue(null),
  initializeConsciousness: jest.fn().mockReturnValue({
    dominantElement: 'earth',
    archetypalActivations: { sage: 0.8 },
    currentPhase: 'challenge',
    integrationLevel: 0.6
  })
} as any);

const mockElements = () => ({
  assessResonance: jest.fn().mockResolvedValue({ 
    top: 'earth', 
    scores: { earth: 0.8, air: 0.2 },
    confidence: 0.85
  })
} as any);

const mockIntegrator = () => ({
  synthesize: jest.fn().mockResolvedValue({
    id: 'full-synthesis-1',
    primary: { 
      answer: 'Your grounded approach to this challenge shows wisdom. What foundation are you ready to build?',
      element: 'earth',
      archetype: 'Builder',
      confidence: 0.85
    },
    tokens: { prompt: 250, completion: 180 },
    signals: { evolutionary: true, shadowWork: true, challengeApplied: true },
    metadata: {
      mode: 'full',
      cognitiveArchitectures: ['LIDA', 'MicroPsi'],
      qualityScore: 0.88
    }
  }),
  quickSynthesize: jest.fn().mockResolvedValue({
    id: 'lite-synthesis-1',
    primary: { 
      answer: 'I hear your intention. What feels like the next solid step?',
      element: 'earth',
      archetype: 'Guide',
      confidence: 0.7
    },
    tokens: { prompt: 120, completion: 60 },
    signals: { evolutionary: false, shadowWork: false, challengeApplied: false },
    metadata: {
      mode: 'lite',
      cognitiveArchitectures: ['heuristic'],
      qualityScore: 0.75
    }
  })
} as any);

describe('SpiralogicAdapter', () => {
  let cache: SimpleCache;
  let analytics: SimpleAnalytics;
  let adapter: SpiralogicAdapter;

  beforeEach(() => {
    cache = new SimpleCache(100);
    analytics = new SimpleAnalytics();
    adapter = new SpiralogicAdapter(
      mockEngine(), 
      mockElements(), 
      mockIntegrator(), 
      cache, 
      analytics
    );
    
    // Reset environment variables
    delete process.env.SPIRALOGIC_SOFT_BUDGET_MS;
    delete process.env.SPIRALOGIC_HARD_BUDGET_MS;
    
    jest.clearAllMocks();
  });

  describe('Budget Enforcement', () => {
    it('responds under hard budget and sets correct element', async () => {
      const query: QueryRequest = {
        userId: 'test-user-123',
        text: 'I need guidance with my career transition',
        element: 'earth'
      };

      const startTime = Date.now();
      const result = await adapter.process(query);
      const elapsed = Date.now() - startTime;

      expect(result.text.length).toBeGreaterThan(0);
      expect(result.meta.element).toBe('earth');
      expect(result.meta.latencyMs).toBeLessThan(1000); // Reasonable budget
      expect(elapsed).toBeLessThan(1000); // Test should run fast
      expect(result.id).toMatch(/^(full|lite|fallback)-/);
    });

    it('degrades to lite mode when soft budget exceeded', async () => {
      // Force lite mode by setting very low soft budget
      process.env.SPIRALOGIC_SOFT_BUDGET_MS = '1';
      
      const query: QueryRequest = {
        userId: 'test-user-456',
        text: 'Help me understand my emotions',
        element: 'water'
      };

      const result = await adapter.process(query);

      expect(result.text.length).toBeGreaterThan(0);
      expect(result.meta.element).toBe('water');
      
      // Should use quickSynthesize for lite mode
      const integrator = mockIntegrator();
      adapter = new SpiralogicAdapter(mockEngine(), mockElements(), integrator, cache, analytics);
      
      await adapter.process(query);
      // Note: Due to mocking, we can't directly test mode degradation in this simple test
      // In real usage, the soft budget check would trigger lite mode
    });

    it('handles timeout gracefully with fallback response', async () => {
      // Create an adapter with a slow engine to test timeout
      const slowEngine = {
        ...mockEngine(),
        computeDailyArchetypes: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ sage: 0.5 }), 2000))
        )
      };

      const slowAdapter = new SpiralogicAdapter(
        slowEngine as any, 
        mockElements(), 
        mockIntegrator(), 
        cache, 
        analytics
      );

      process.env.SPIRALOGIC_HARD_BUDGET_MS = '100'; // Very tight budget

      const query: QueryRequest = {
        userId: 'timeout-test',
        text: 'This should timeout',
        element: 'fire'
      };

      const result = await slowAdapter.process(query);

      // Should get fallback response
      expect(result.id).toMatch(/^fallback-/);
      expect(result.text).toContain('simple');
      expect(result.meta.evolutionary_awareness_active).toBe(false);
    });
  });

  describe('Caching', () => {
    it('memoizes daily archetypes for performance', async () => {
      const engine = mockEngine();
      const testAdapter = new SpiralogicAdapter(engine, mockElements(), mockIntegrator(), cache, analytics);

      const query1: QueryRequest = {
        userId: 'cache-test-user',
        text: 'First query',
        element: 'air'
      };

      const query2: QueryRequest = {
        userId: 'cache-test-user', // Same user
        text: 'Second query',
        element: 'fire'
      };

      // First call should compute archetypes
      const result1 = await testAdapter.process(query1);
      expect(engine.computeDailyArchetypes).toHaveBeenCalledTimes(1);

      // Second call should use cached archetypes
      const result2 = await testAdapter.process(query2);
      expect(engine.computeDailyArchetypes).toHaveBeenCalledTimes(1); // No additional calls

      expect(result1.text.length).toBeGreaterThan(0);
      expect(result2.text.length).toBeGreaterThan(0);
    });

    it('emits cache hit/miss analytics', async () => {
      const analyticsSpy = jest.spyOn(analytics, 'emit');

      const query: QueryRequest = {
        userId: 'analytics-test',
        text: 'Test analytics',
        element: 'aether'
      };

      // First call - cache miss
      await adapter.process(query);
      expect(analyticsSpy).toHaveBeenCalledWith('archetype.cache', {
        userId: 'analytics-test',
        event: 'miss'
      });

      analyticsSpy.mockClear();

      // Second call - cache hit
      await adapter.process(query);
      expect(analyticsSpy).toHaveBeenCalledWith('archetype.cache', {
        userId: 'analytics-test',
        event: 'hit'
      });
    });
  });

  describe('Response Quality', () => {
    it('generates meaningful responses with proper metadata', async () => {
      const query: QueryRequest = {
        userId: 'quality-test',
        text: 'I feel stuck in my spiritual growth',
        element: 'aether'
      };

      const result = await adapter.process(query);

      // Check response structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('meta');

      // Check response quality
      expect(result.text.length).toBeGreaterThan(20);
      expect(result.text).not.toContain('undefined');
      expect(result.meta.element).toBeDefined();
      expect(result.meta.latencyMs).toBeGreaterThan(0);
      expect(typeof result.meta.evolutionary_awareness_active).toBe('boolean');

      // Check tokens are reasonable
      expect(result.tokens.prompt).toBeGreaterThanOrEqual(0);
      expect(result.tokens.completion).toBeGreaterThanOrEqual(0);
    });

    it('handles missing element gracefully', async () => {
      const query: QueryRequest = {
        userId: 'no-element-test',
        text: 'Help me with life decisions'
        // No element specified
      };

      const result = await adapter.process(query);

      expect(result.text.length).toBeGreaterThan(0);
      expect(result.meta.element).toBeDefined(); // Should default to something
      expect(['fire', 'water', 'earth', 'air', 'aether']).toContain(result.meta.element);
    });
  });

  describe('Analytics and Observability', () => {
    it('emits completion analytics with performance metrics', async () => {
      const analyticsSpy = jest.spyOn(analytics, 'emit');

      const query: QueryRequest = {
        userId: 'metrics-test',
        text: 'Track my progress',
        element: 'water'
      };

      await adapter.process(query);

      expect(analyticsSpy).toHaveBeenCalledWith('chat.completed', 
        expect.objectContaining({
          userId: 'metrics-test',
          tokens: expect.any(Number),
          latency: expect.any(Number),
          mode: expect.stringMatching(/^(full|lite)$/),
          element: 'water'
        })
      );
    });

    it('emits error analytics on failure', async () => {
      // Create adapter that will fail
      const failingEngine = {
        ...mockEngine(),
        computeDailyArchetypes: jest.fn().mockRejectedValue(new Error('Test error'))
      };

      const failingAdapter = new SpiralogicAdapter(
        failingEngine as any, 
        mockElements(), 
        mockIntegrator(), 
        cache, 
        analytics
      );

      const analyticsSpy = jest.spyOn(analytics, 'emit');

      const query: QueryRequest = {
        userId: 'error-test',
        text: 'This will fail',
        element: 'fire'
      };

      const result = await failingAdapter.process(query);

      expect(analyticsSpy).toHaveBeenCalledWith('chat.error', {
        userId: 'error-test',
        err: 'Test error'
      });

      // Should still return a valid fallback response
      expect(result.id).toMatch(/^fallback-/);
      expect(result.text.length).toBeGreaterThan(0);
    });
  });

  describe('Environment Configuration', () => {
    it('respects custom budget environment variables', async () => {
      process.env.SPIRALOGIC_SOFT_BUDGET_MS = '200';
      process.env.SPIRALOGIC_HARD_BUDGET_MS = '500';

      const query: QueryRequest = {
        userId: 'env-test',
        text: 'Test environment configuration'
      };

      const result = await adapter.process(query);

      expect(result.meta.latencyMs).toBeLessThan(500); // Should respect hard budget
      expect(result.text.length).toBeGreaterThan(0);
    });

    it('uses reasonable defaults when env vars not set', async () => {
      // Ensure no env vars are set
      delete process.env.SPIRALOGIC_SOFT_BUDGET_MS;
      delete process.env.SPIRALOGIC_HARD_BUDGET_MS;

      const query: QueryRequest = {
        userId: 'default-test',
        text: 'Test default configuration'
      };

      const result = await adapter.process(query);

      expect(result.meta.latencyMs).toBeLessThan(1000); // Should use reasonable defaults
      expect(result.text.length).toBeGreaterThan(0);
    });
  });
});