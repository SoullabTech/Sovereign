import { divinationAgent } from "../core/agents/divinationAgent";
import { DivinationQuery } from "../types/divination";

describe("DivinationAgent", () => {
  describe("Tarot Readings", () => {
    test("performs basic tarot reading", async () => {
      const query: DivinationQuery = {
        method: "tarot",
        query: "What do I need to know about my career path?",
        depth: "basic",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.method).toBe("tarot");
      expect(result.title).toContain("Tarot");
      expect(result.insight).toBeTruthy();
      expect(result.guidance).toBeTruthy();
      expect(result.tarot).toBeDefined();
      expect(result.tarot?.cards).toBeDefined();
      expect(Array.isArray(result.tarot?.cards)).toBe(true);
      expect(result.symbols).toBeDefined();
      expect(Array.isArray(result.symbols)).toBe(true);
    });

    test("performs three-card tarot spread", async () => {
      const query: DivinationQuery = {
        method: "tarot",
        query: "How can I improve my relationships?",
        spread: "three-card",
        depth: "detailed",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.tarot?.spreadName).toBe("Three-Card Spread");
      expect(result.tarot?.cards.length).toBe(3);
      expect(result.tarot?.positions.length).toBe(3);
    });

    test("includes focus area in tarot guidance", async () => {
      const query: DivinationQuery = {
        method: "tarot",
        query: "What should I focus on?",
        focus: "spiritual growth",
        depth: "detailed",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.guidance).toContain("spiritual growth");
    });
  });

  describe("I Ching Readings", () => {
    test("performs I Ching hexagram reading", async () => {
      const query: DivinationQuery = {
        method: "iching",
        query: "What is the best timing for my new project?",
        depth: "detailed",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.method).toBe("iching");
      expect(result.title).toContain("I Ching");
      expect(result.hexagram).toBeDefined();
      expect(result.hexagram?.number).toBeGreaterThanOrEqual(1);
      expect(result.hexagram?.number).toBeLessThanOrEqual(64);
      expect(result.hexagram?.name).toBeTruthy();
      expect(result.hexagram?.lines).toBeDefined();
      expect(Array.isArray(result.hexagram?.lines)).toBe(true);
      expect(result.hexagram?.lines.length).toBe(6);
    });

    test("includes archetypal theme in I Ching reading", async () => {
      const query: DivinationQuery = {
        method: "iching",
        query: "How should I approach this challenge?",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.archetypalTheme).toBeTruthy();
      expect(result.sacredTiming).toBeTruthy();
    });

    test("handles comprehensive depth for I Ching", async () => {
      const query: DivinationQuery = {
        method: "iching",
        query: "Guide me through this transition",
        depth: "comprehensive",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.guidance).toContain(
        "relationships, career, spiritual practice, and personal growth",
      );
      expect(result.archetypalTheme).toContain("Deep Integration Phase");
    });
  });

  describe("Yi Jing Readings", () => {
    test("performs Yi Jing soul journey reading", async () => {
      const query: DivinationQuery = {
        method: "yijing",
        query: "What is my soul calling me to understand?",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.method).toBe("yijing");
      expect(result.title).toContain("Yi Jing");
      expect(result.subtitle).toContain("Traveler's Path");
      expect(result.insight).toContain("soul");
      expect(result.guidance).toContain("Soul Guidance");
      expect(result.energeticSignature).toBeTruthy();
      expect(result.keywords).toContain("soul");
    });

    test("enhances Yi Jing with birth data", async () => {
      const query: DivinationQuery = {
        method: "yijing",
        query: "What spiritual lesson am I learning?",
        birthData: {
          date: "1990-06-15",
        },
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.sacredTiming).toContain("1990-06-15");
    });
  });

  describe("Astrology Readings", () => {
    test("performs astrological oracle reading", async () => {
      const query: DivinationQuery = {
        method: "astro",
        query: "What cosmic energies are supporting me now?",
        birthData: {
          date: "1985-12-25",
        },
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.method).toBe("astro");
      expect(result.title).toContain("Astrological Oracle");
      expect(result.astrology).toBeDefined();
      expect(result.astrology?.archetype).toBeTruthy();
      expect(result.astrology?.moonPhase).toBeTruthy();
      expect(result.astrology?.timing).toBeTruthy();
      expect(result.astrology?.elementalBalance).toBeDefined();
      expect(typeof result.astrology?.elementalBalance).toBe("object");
    });

    test("adapts astrology reading to specific query", async () => {
      const specificQuery = "Should I move to a new city?";
      const query: DivinationQuery = {
        method: "astro",
        query: specificQuery,
        birthData: {
          date: "1992-03-10",
        },
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.insight).toContain(specificQuery);
    });

    test("handles astrology reading without birth data", async () => {
      const query: DivinationQuery = {
        method: "astro",
        query: "What universal energies are present?",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.method).toBe("astro");
      expect(result.astrology?.archetype).toBeTruthy();
    });
  });

  describe("Unified Readings", () => {
    test("performs unified multi-method reading", async () => {
      const query: DivinationQuery = {
        method: "unified",
        query: "How can I align with my highest purpose?",
        birthData: {
          date: "1988-09-22",
        },
        depth: "comprehensive",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.method).toBe("unified");
      expect(result.title).toContain("Unified");
      expect(result.synthesis).toBeTruthy();
      expect(result.guidance).toContain("Tarot");
      expect(result.guidance).toContain("Integration");
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.symbols?.length).toBeGreaterThan(0);
      expect(result.keywords?.length).toBeGreaterThan(0);
    });

    test("unified reading has higher confidence than individual methods", async () => {
      const unifiedQuery: DivinationQuery = {
        method: "unified",
        query: "What is my next step?",
      };

      const tarotQuery: DivinationQuery = {
        method: "tarot",
        query: "What is my next step?",
      };

      const unifiedResult =
        await divinationAgent.performDivination(unifiedQuery);
      const tarotResult = await divinationAgent.performDivination(tarotQuery);

      expect(unifiedResult.confidence).toBeGreaterThan(tarotResult.confidence);
    });
  });

  describe("Daily Divination", () => {
    test("provides daily divination guidance", async () => {
      const result = await divinationAgent.getDailyDivination();

      expect(result.method).toMatch(/tarot|iching|astro/);
      expect(result.title).toContain("Daily");
      expect(result.insight).toBeTruthy();
      expect(result.guidance).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    test("daily divination rotates methods based on day", async () => {
      const results: string[] = [];

      // Get multiple daily readings (simulating different days)
      for (let i = 0; i < 5; i++) {
        const result = await divinationAgent.getDailyDivination();
        results.push(result.method);
      }

      // Should have consistent method for same day
      const uniqueMethods = [...new Set(results)];
      expect(uniqueMethods.length).toBe(1); // Same day = same method
    });
  });

  describe("Error Handling", () => {
    test("handles invalid method gracefully", async () => {
      const query: DivinationQuery = {
        method: "invalid" as any,
        query: "Test question",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.title).toBe("Oracle Guidance");
      expect(result.insight).toContain("inner wisdom");
      expect(result.confidence).toBe(0.7);
    });

    test("provides graceful fallback for service errors", async () => {
      // Test with extremely long query that might cause issues
      const query: DivinationQuery = {
        method: "tarot",
        query: "x".repeat(10000), // Very long query
      };

      const result = await divinationAgent.performDivination(query);

      expect(result).toBeDefined();
      expect(result.insight).toBeTruthy();
    });
  });

  describe("Spiralogic Integration", () => {
    test("includes Spiralogic wisdom in all readings", async () => {
      const query: DivinationQuery = {
        method: "tarot",
        query: "Test integration",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.guidance).toContain("Spiralogic Integration");
      expect(result.guidance).toContain("Sacred Technology Oracle");
    });

    test("adds spiral wisdom to guidance", async () => {
      const query: DivinationQuery = {
        method: "iching",
        query: "How does wisdom spiral through consciousness?",
      };

      const result = await divinationAgent.performDivination(query);

      expect(result.guidance).toMatch(/spiral|consciousness|wisdom/i);
    });
  });

  describe("Response Structure Validation", () => {
    test("all readings include required fields", async () => {
      const methods: Array<DivinationQuery["method"]> = [
        "tarot",
        "iching",
        "yijing",
        "astro",
      ];

      for (const method of methods) {
        const query: DivinationQuery = {
          method,
          query: "Test query for validation",
        };

        const result = await divinationAgent.performDivination(query);

        // Required fields
        expect(result.method).toBe(method);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.insight).toBeTruthy();
        expect(result.guidance).toBeTruthy();
        expect(result.timestamp).toBeTruthy();
        expect(typeof result.confidence).toBe("number");
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);

        // Arrays should be arrays
        if (result.symbols) expect(Array.isArray(result.symbols)).toBe(true);
        if (result.keywords) expect(Array.isArray(result.keywords)).toBe(true);
      }
    });

    test("method-specific data is present", async () => {
      const tarotQuery: DivinationQuery = { method: "tarot", query: "Test" };
      const ichingQuery: DivinationQuery = { method: "iching", query: "Test" };
      const astroQuery: DivinationQuery = { method: "astro", query: "Test" };

      const tarotResult = await divinationAgent.performDivination(tarotQuery);
      const ichingResult = await divinationAgent.performDivination(ichingQuery);
      const astroResult = await divinationAgent.performDivination(astroQuery);

      expect(tarotResult.tarot).toBeDefined();
      expect(ichingResult.hexagram).toBeDefined();
      expect(astroResult.astrology).toBeDefined();
    });
  });

  describe("Performance", () => {
    test("readings complete within reasonable time", async () => {
      const startTime = Date.now();

      const query: DivinationQuery = {
        method: "unified",
        query: "Performance test query",
        depth: "comprehensive",
      };

      await divinationAgent.performDivination(query);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test("handles multiple concurrent readings", async () => {
      const queries = Array.from({ length: 5 }, (_, i) => ({
        method: "tarot" as const,
        query: `Concurrent test query ${i + 1}`,
      }));

      const promises = queries.map((query) =>
        divinationAgent.performDivination(query),
      );
      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach((result) => {
        expect(result.method).toBe("tarot");
        expect(result.insight).toBeTruthy();
      });
    });
  });
});
