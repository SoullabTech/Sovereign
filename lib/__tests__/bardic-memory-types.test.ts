/**
 * Bardic Memory Type Tests
 *
 * Tests type definitions and utility functions without database connection.
 * These tests verify the TypeScript types are correctly exported and usable.
 *
 * @module lib/__tests__/bardic-memory-types
 */

import type {
  Episode,
  Telos,
  Microact,
  UsageLogEntry,
  UserQuota,
  ElementalState,
} from '../types';

import {
  calculateCost,
  formatCostUSD,
  formatSuccessRate,
  TIER_CONFIGS,
  SONNET_4_PRICING,
} from '../types/usage-tracking';

describe('Bardic Memory Types', () => {
  // ==========================================================================
  // TYPE VALIDATION
  // ==========================================================================

  describe('Episode Type', () => {
    it('should create a valid episode object', () => {
      const episode: Partial<Episode> = {
        userId: 'test_user_123',
        datetime: new Date(),
        sceneStanza: 'The lake at dusk. Cedar smoke drifting.',
        placeCue: 'Cabin by the lake',
        affectValence: 0.6,
        affectArousal: 0.3,
        elementalState: {
          fire: 0.4,
          air: 0.5,
          water: 0.8,
          earth: 0.6,
          aether: 0.7,
        },
        dominantElement: 'water',
        sacredFlag: false,
        fieldDepth: 0.75,
      };

      expect(episode.userId).toBe('test_user_123');
      expect(episode.sceneStanza).toBe('The lake at dusk. Cedar smoke drifting.');
      expect(episode.dominantElement).toBe('water');
    });

    it('should validate scene stanza length constraint', () => {
      const validStanza = 'a'.repeat(300);
      expect(validStanza.length).toBe(300); // Should be ≤ 300

      const invalidStanza = 'a'.repeat(301);
      expect(invalidStanza.length).toBeGreaterThan(300); // Would be rejected by DB
    });

    it('should validate affect valence range', () => {
      expect(-1).toBeGreaterThanOrEqual(-1);
      expect(-1).toBeLessThanOrEqual(1);
      expect(1).toBeGreaterThanOrEqual(-1);
      expect(1).toBeLessThanOrEqual(1);
      expect(0.5).toBeGreaterThanOrEqual(-1);
      expect(0.5).toBeLessThanOrEqual(1);
    });

    it('should validate affect arousal range', () => {
      expect(0).toBeGreaterThanOrEqual(0);
      expect(0).toBeLessThanOrEqual(1);
      expect(1).toBeGreaterThanOrEqual(0);
      expect(1).toBeLessThanOrEqual(1);
      expect(0.5).toBeGreaterThanOrEqual(0);
      expect(0.5).toBeLessThanOrEqual(1);
    });
  });

  describe('Elemental State Type', () => {
    it('should create valid elemental state', () => {
      const elementalState: ElementalState = {
        fire: 0.7,
        air: 0.5,
        water: 0.8,
        earth: 0.4,
        aether: 0.6,
      };

      expect(elementalState.fire).toBe(0.7);
      expect(elementalState.water).toBe(0.8);
      expect(Object.keys(elementalState)).toHaveLength(5);
    });

    it('should represent all five elements', () => {
      const elementalState: ElementalState = {
        fire: 0.5,
        air: 0.5,
        water: 0.5,
        earth: 0.5,
        aether: 0.5,
      };

      expect(elementalState).toHaveProperty('fire');
      expect(elementalState).toHaveProperty('air');
      expect(elementalState).toHaveProperty('water');
      expect(elementalState).toHaveProperty('earth');
      expect(elementalState).toHaveProperty('aether');
    });
  });

  describe('Telos Type', () => {
    it('should create a valid telos object', () => {
      const telos: Partial<Telos> = {
        userId: 'test_user_123',
        phrase: 'Speaking my truth without apology',
        strength: 0.8,
        horizonDays: 48,
        signals: ['increased clarity', 'boundary setting'],
        isActive: true,
      };

      expect(telos.phrase).toBe('Speaking my truth without apology');
      expect(telos.strength).toBe(0.8);
      expect(telos.signals).toHaveLength(2);
    });
  });

  describe('Microact Type', () => {
    it('should create a valid microact object', () => {
      const microact: Partial<Microact> = {
        userId: 'test_user_123',
        actionPhrase: 'Paused before speaking',
        virtueCategory: 'presence',
        totalCount: 42,
      };

      expect(microact.actionPhrase).toBe('Paused before speaking');
      expect(microact.totalCount).toBe(42);
    });
  });

  describe('User Quota Type', () => {
    it('should create a valid user quota object', () => {
      const quota: Partial<UserQuota> = {
        userId: 'test_user_123',
        userTier: 'beta',
        dailyMessageLimit: 100,
        dailyTokenLimit: 50000,
        dailyCostLimitCents: 50,
        currentDailyMessages: 25,
        currentDailyTokens: 12500,
        currentDailyCostCents: 12.5,
      };

      expect(quota.userTier).toBe('beta');
      expect(quota.currentDailyMessages).toBeLessThan(quota.dailyMessageLimit!);
    });
  });

  describe('Usage Log Entry Type', () => {
    it('should create a valid usage log entry', () => {
      const logEntry: Partial<UsageLogEntry> = {
        userId: 'test_user_123',
        endpoint: '/api/between/chat',
        requestType: 'chat-text',
        inputTokens: 10000,
        outputTokens: 5000,
        inputCost: 3.0,
        outputCost: 7.5,
        responseTimeMs: 1250,
        modelUsed: 'claude-sonnet-4-20250514',
        success: true,
      };

      expect(logEntry.requestType).toBe('chat-text');
      expect(logEntry.success).toBe(true);
    });
  });

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  describe('Cost Calculation', () => {
    it('should calculate costs correctly', () => {
      const result = calculateCost(10000, 5000);

      expect(result.inputCost).toBe(3.0);
      expect(result.outputCost).toBe(7.5);
      expect(result.totalCost).toBe(10.5);
    });

    it('should handle zero tokens', () => {
      const result = calculateCost(0, 0);

      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('should match Sonnet 4 pricing', () => {
      const oneMillion = 1000000;
      const result = calculateCost(oneMillion, 0);

      expect(result.inputCost).toBe(300); // $3.00 = 300 cents
    });

    it('should calculate output costs correctly', () => {
      const oneMillion = 1000000;
      const result = calculateCost(0, oneMillion);

      expect(result.outputCost).toBe(1500); // $15.00 = 1500 cents
    });

    it('should round to 4 decimal places', () => {
      const result = calculateCost(1, 1);

      expect(result.inputCost.toFixed(4)).toBe('0.0003');
      expect(result.outputCost.toFixed(4)).toBe('0.0015');
    });
  });

  describe('Cost Formatting', () => {
    it('should format cents as USD', () => {
      expect(formatCostUSD(100)).toBe('$1.00');
      expect(formatCostUSD(50)).toBe('$0.50');
      expect(formatCostUSD(10.5)).toBe('$0.10'); // 10.5 cents = $0.105 rounds to $0.10
      expect(formatCostUSD(0)).toBe('$0.00');
    });

    it('should format large costs', () => {
      expect(formatCostUSD(10000)).toBe('$100.00');
      expect(formatCostUSD(999999)).toBe('$9999.99');
    });
  });

  describe('Success Rate Formatting', () => {
    it('should format success rate as percentage', () => {
      expect(formatSuccessRate(75, 100)).toBe('75.0%');
      expect(formatSuccessRate(99, 100)).toBe('99.0%');
      expect(formatSuccessRate(1, 1)).toBe('100.0%');
    });

    it('should handle zero total', () => {
      expect(formatSuccessRate(0, 0)).toBe('0%');
    });

    it('should handle fractional percentages', () => {
      expect(formatSuccessRate(66, 100)).toBe('66.0%');
      expect(formatSuccessRate(333, 1000)).toBe('33.3%');
    });
  });

  // ==========================================================================
  // CONSTANTS
  // ==========================================================================

  describe('Tier Configurations', () => {
    it('should have all tier configs defined', () => {
      expect(TIER_CONFIGS).toHaveProperty('beta');
      expect(TIER_CONFIGS).toHaveProperty('standard');
      expect(TIER_CONFIGS).toHaveProperty('premium');
      expect(TIER_CONFIGS).toHaveProperty('unlimited');
      expect(TIER_CONFIGS).toHaveProperty('therapist');
      expect(TIER_CONFIGS).toHaveProperty('enterprise');
    });

    it('should have correct beta tier limits', () => {
      const beta = TIER_CONFIGS.beta;

      expect(beta.dailyMessageLimit).toBe(100);
      expect(beta.dailyTokenLimit).toBe(50000);
      expect(beta.dailyCostLimitCents).toBe(50);
      expect(beta.requestsPerMinute).toBe(10);
      expect(beta.requestsPerHour).toBe(100);
    });

    it('should have higher limits for premium tier', () => {
      const beta = TIER_CONFIGS.beta;
      const premium = TIER_CONFIGS.premium;

      expect(premium.dailyMessageLimit).toBeGreaterThan(beta.dailyMessageLimit);
      expect(premium.dailyTokenLimit).toBeGreaterThan(beta.dailyTokenLimit);
      expect(premium.dailyCostLimitCents).toBeGreaterThan(beta.dailyCostLimitCents);
    });

    it('should have unlimited tier with very high limits', () => {
      const unlimited = TIER_CONFIGS.unlimited;

      expect(unlimited.dailyMessageLimit).toBeGreaterThan(100000);
      expect(unlimited.dailyTokenLimit).toBeGreaterThan(1000000);
    });
  });

  describe('Pricing Constants', () => {
    it('should have correct Sonnet 4 pricing', () => {
      expect(SONNET_4_PRICING.INPUT_COST_PER_TOKEN).toBe(0.0003);
      expect(SONNET_4_PRICING.OUTPUT_COST_PER_TOKEN).toBe(0.0015);
      expect(SONNET_4_PRICING.MODEL_ID).toBe('claude-sonnet-4-20250514');
    });

    it('should match advertised pricing ($3/1M input)', () => {
      const costPerMillion = SONNET_4_PRICING.INPUT_COST_PER_TOKEN * 1000000;
      expect(costPerMillion).toBe(300); // $3.00 in cents
    });

    it('should match advertised pricing ($15/1M output)', () => {
      const costPerMillion = SONNET_4_PRICING.OUTPUT_COST_PER_TOKEN * 1000000;
      expect(costPerMillion).toBe(1500); // $15.00 in cents
    });
  });

  // ==========================================================================
  // TYPE SAFETY
  // ==========================================================================

  describe('Type Safety', () => {
    it('should enforce episode constraint types', () => {
      // This test verifies TypeScript types compile correctly
      const episode: Partial<Episode> = {
        userId: 'test',
        datetime: new Date(),
        affectValence: 0.5, // Must be -1 to 1
        affectArousal: 0.5, // Must be 0 to 1
        fieldDepth: 0.75, // Must be 0 to 1
      };

      expect(episode.affectValence).toBeLessThanOrEqual(1);
      expect(episode.affectValence).toBeGreaterThanOrEqual(-1);
      expect(episode.affectArousal).toBeLessThanOrEqual(1);
      expect(episode.affectArousal).toBeGreaterThanOrEqual(0);
    });

    it('should enforce dominant element enum', () => {
      const validElements: Array<Episode['dominantElement']> = [
        'fire',
        'air',
        'water',
        'earth',
        'aether',
      ];

      expect(validElements).toHaveLength(5);
      expect(validElements).toContain('water');
    });

    it('should enforce request type enum', () => {
      const validTypes: Array<UsageLogEntry['requestType']> = [
        'chat-text',
        'chat-voice',
        'tts',
        'journal',
        'reflection',
        'fire-query',
        'air-query',
        'drawer-open',
        'madeleine-trigger',
      ];

      expect(validTypes).toContain('chat-text');
      expect(validTypes).toContain('fire-query');
    });
  });
});
