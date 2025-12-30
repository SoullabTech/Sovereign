// Ensure this file is treated as a module
export {};

// ===============================================
// JEST TEST SETUP  
// Global test configuration and utilities
// ===============================================

// Import Jest globals to ensure they are available
import { expect, beforeAll, beforeEach, afterEach, afterAll, jest } from '@jest/globals';

// Make Jest globals available globally
declare global {
  var expect: typeof import('@jest/globals').expect;
  var beforeAll: typeof import('@jest/globals').beforeAll;
  var beforeEach: typeof import('@jest/globals').beforeEach;
  var afterEach: typeof import('@jest/globals').afterEach;
  var afterAll: typeof import('@jest/globals').afterAll;
  var jest: typeof import('@jest/globals').jest;
}

// Assign to global
(globalThis as any).expect = expect;
(globalThis as any).beforeAll = beforeAll;
(globalThis as any).beforeEach = beforeEach;
(globalThis as any).afterEach = afterEach;
(globalThis as any).afterAll = afterAll;
(globalThis as any).jest = jest;

// Custom matchers for Sacred Technology Platform testing
expect.extend({
  toBeBetween(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be between ${min} and ${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be between ${min} and ${max}`,
        pass: false,
      };
    }
  },

  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      message: () =>
        pass
          ? `expected ${received} not to be within range ${min}-${max}`
          : `expected ${received} to be within range ${min}-${max}`,
      pass,
    };
  },

  toContainSacredLanguage(received: string) {
    const sacredWords = [
      "sacred",
      "divine",
      "holy",
      "blessed",
      "spiritual",
      "transcendent",
      "transformation",
      "awakening",
      "consciousness",
      "wisdom",
      "truth",
      "mirror",
      "reflection",
      "journey",
      "path",
      "growth",
      "healing",
    ];

    const lowerReceived = received.toLowerCase();
    const containsSacred = sacredWords.some((word) =>
      lowerReceived.includes(word),
    );

    return {
      message: () =>
        containsSacred
          ? `expected "${received}" not to contain sacred language`
          : `expected "${received}" to contain sacred language (${sacredWords.join(", ")})`,
      pass: containsSacred,
    };
  },

  toBeValidOracleResponse(received: any) {
    const pass =
      received &&
      typeof received.content === "string" &&
      typeof received.provider === "string" &&
      typeof received.model === "string";

    return {
      pass,
      message: () =>
        pass
          ? "expected response NOT to be a valid AIResponse"
          : `expected a valid AIResponse shape, got: ${JSON.stringify(received)}`,
    };
  },
});

// Global test configuration
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "error"; // Reduce log noise during tests

  // Configure timeouts for different test types
  if (expect.getState().testPath?.includes("performance")) {
    jest.setTimeout(120000); // 2 minutes for performance tests
  } else if (expect.getState().testPath?.includes("integration")) {
    jest.setTimeout(60000); // 1 minute for integration tests
  } else {
    jest.setTimeout(30000); // 30 seconds for unit tests
  }
});

beforeEach(() => {
  // Clear all timers before each test
  jest.clearAllTimers();

  // Reset console spies
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any test artifacts
  jest.restoreAllMocks();
});

afterAll(async () => {
  // Global cleanup
  await new Promise((resolve) => setTimeout(resolve, 100)); // Allow async cleanup
});

// Console spy for testing log output
export const consoleSpy = {
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
  warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
  info: jest.spyOn(console, "info").mockImplementation(() => {}),
};

// Utility functions for tests
export const testUtils = {
  // Create test user ID
  createTestUserId: (prefix = "test-user") =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Wait for async operations
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Create test memory data
  createTestMemory: (overrides = {}) => ({
    userId: testUtils.createTestUserId(),
    type: "journal_entry" as const,
    content: "Test memory content",
    element: "air" as const,
    timestamp: new Date(),
    ...overrides,
  }),

  // Validate oracle response structure
  validateOracleResponse: (response: any) => {
    expect(response).toBeDefined();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(10);
    // Check oracle response structure manually since custom matcher may not be available yet
    if (response && typeof response.content === "string" && typeof response.provider === "string" && typeof response.model === "string") {
      // Valid oracle response structure
    } else {
      throw new Error(`Expected valid oracle response structure, got: ${JSON.stringify(response)}`);
    }
  },

  // Create test conversation flow
  createConversationFlow: (
    exchanges: Array<{ prompt: string; expectedKeywords?: string[] }>,
  ) => {
    return exchanges.map((exchange) => ({
      ...exchange,
      expectedKeywords: exchange.expectedKeywords || [],
    }));
  },

  // Performance measurement utility
  measurePerformance: async <T>(
    operation: () => Promise<T>,
    label: string,
  ): Promise<{ result: T; duration: number }> => {
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;

    console.log(`[PERF] ${label}: ${duration}ms`);

    return { result, duration };
  },

  // Typed mock helper to avoid 'never' assignment errors
  mock: <T extends (...args: any[]) => any = (...args: any[]) => any>() => 
    (jest.fn() as unknown) as jest.MockedFunction<T>,

  // Mock implementation helpers
  createMockSoulMemory: () => ({
    initialize: testUtils.mock<() => Promise<void>>().mockResolvedValue(undefined),
    close: testUtils.mock<() => Promise<void>>().mockResolvedValue(undefined),
    storeMemory: testUtils.mock<() => Promise<any>>()
      .mockResolvedValue({ id: "mock-id", timestamp: new Date() }),
    retrieveMemories: testUtils.mock<() => Promise<any[]>>().mockResolvedValue([]),
    semanticSearch: testUtils.mock<() => Promise<any[]>>().mockResolvedValue([]),
    getSacredMoments: testUtils.mock<() => Promise<any[]>>().mockResolvedValue([]),
    getActiveArchetypes: testUtils.mock<() => Promise<any[]>>().mockResolvedValue([]),
    getTransformationJourney: testUtils.mock<() => Promise<any>>().mockResolvedValue({
      milestones: [],
      currentPhase: "initiation",
      nextSpiralSuggestion: "Continue your journey",
    }),
    createMemoryThread: testUtils.mock<() => Promise<any>>()
      .mockResolvedValue({ id: "thread-id", memories: [] }),
    getMemoryThreads: testUtils.mock<() => Promise<any[]>>().mockResolvedValue([]),
  }),

  createMockWisdomEngine: () => ({
    detectPattern: testUtils.mock<() => Promise<any>>().mockResolvedValue({ strength: 0.8, frequency: 3 }),
    selectWisdomApproach: testUtils.mock<() => Promise<any>>()
      .mockResolvedValue({ primary: "jung", confidence: 0.9 }),
    generateElementalWisdom: testUtils.mock<() => Promise<string>>()
      .mockResolvedValue("Mock elemental wisdom"),
    analyzeConversationFlow: testUtils.mock<() => Promise<any>>()
      .mockResolvedValue({ patterns: [], stuckPoints: [] }),
    identifyGrowthEdge: testUtils.mock<() => Promise<any>>()
      .mockResolvedValue({ edge: "vulnerability", readiness: 0.7 }),
    getArchetypalActivation: testUtils.mock<() => Promise<any>>().mockResolvedValue({
      dominantArchetype: "Shadow",
      emergingArchetype: "Warrior",
      balanceScore: 0.6,
    }),
  }),
};

// Test data constants
export const testConstants = {
  ELEMENTS: ["fire", "water", "earth", "air", "aether"] as const,
  ORACLE_MODES: [
    "alchemist",
    "buddha",
    "sage",
    "mystic",
    "guardian",
    "tao",
  ] as const,
  MEMORY_TYPES: [
    "oracle_exchange",
    "journal_entry",
    "breakthrough",
    "sacred_moment",
    "shadow_work",
  ] as const,
  EMOTIONAL_TONES: [
    "peaceful",
    "curious",
    "excited",
    "anxious",
    "grateful",
    "angry",
    "sad",
    "joyful",
  ] as const,
  SPIRAL_PHASES: ["initiation", "descent", "revelation", "return"] as const,

  // Sample test prompts for different scenarios
  SAMPLE_PROMPTS: {
    simple: ["How are you?", "I need guidance", "Help me understand"],
    shadow: [
      "I hate this part of myself",
      "I'm struggling with my dark side",
      "I want to work with my shadow",
    ],
    spiritual_bypassing: [
      "I only focus on love and light",
      "Negative emotions are illusions",
      "I've transcended anger",
    ],
    attachment: [
      "I can't let go of the past",
      "I'm clinging to how things were",
      "I'm attached to the outcome",
    ],
    boundaries: [
      "Can we be friends?",
      "I love you",
      "Just make me feel better",
    ],
  },
};

// Global error handling for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:", reason);
  // Don't exit in tests, just log
});

// Global error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't exit in tests, just log
});
