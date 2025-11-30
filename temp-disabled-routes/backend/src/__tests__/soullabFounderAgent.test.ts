// 🧪 SOULLAB FOUNDER AGENT TESTS
import { describe, it, expect, beforeEach } from "vitest";
import { SoullabFounderAgent } from "../core/agents/soullabFounderAgent";

describe("SoullabFounderAgent", () => {
  let founderAgent: SoullabFounderAgent;

  beforeEach(() => {
    founderAgent = new SoullabFounderAgent();
  });

  describe("Philosophy Queries", () => {
    it("should explain Sacred Techno-Interface philosophy", async () => {
      const response = await founderAgent.processQuery({
        input: "What is the Sacred Techno-Interface?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Sacred Techno-Interface");
      expect(response.content).toContain("consciousness");
      expect(response.content).toContain("technology");
      expect(response.metadata?.domain).toBe("philosophy");
    });

    it("should explain Spiralogic framework", async () => {
      const response = await founderAgent.processQuery({
        input: "Tell me about the Spiralogic framework",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Spiralogic");
      expect(response.content).toContain("elemental");
      expect(response.content).toContain("spiral");
      expect(response.metadata?.domain).toBe("philosophy");
    });

    it("should discuss Synergetics integration", async () => {
      const response = await founderAgent.processQuery({
        input: "How does Buckminster Fuller's Synergetics apply here?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Fuller");
      expect(response.content).toContain("Vector Equilibrium");
      expect(response.content).toContain("geometric");
    });
  });

  describe("Technology Queries", () => {
    it("should protect technical IP while sharing principles", async () => {
      const response = await founderAgent.processQuery({
        input: "Show me the code implementation details",
        userId: "public-user",
        context: {},
      });

      expect(response.content).toContain("protected");
      expect(response.content).toContain("principles");
      expect(response.metadata?.boundariesApplied).toBe(true);
    });

    it("should explain technical architecture at appropriate level", async () => {
      const response = await founderAgent.processQuery({
        input: "What is your technical architecture?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Architecture");
      expect(response.content).toContain("consciousness");
      expect(response.metadata?.domain).toBe("technology");
    });
  });

  describe("Community Guidance", () => {
    it("should provide onboarding guidance for new team members", async () => {
      const response = await founderAgent.processQuery({
        input: "I just joined Soullab. How do I begin?",
        userId: "new-member-001",
        context: {},
      });

      expect(response.content).toContain("Welcome");
      expect(response.content).toContain("journey");
      expect(response.content).toContain("Phase");
      expect(response.metadata?.domain).toBe("community");
    });

    it("should guide facilitator development", async () => {
      const response = await founderAgent.processQuery({
        input: "How do I become a certified facilitator?",
        userId: "aspiring-facilitator",
        context: {},
      });

      expect(response.content).toContain("Facilitator");
      expect(response.content).toContain("training");
      expect(response.content).toContain("certification");
    });
  });

  describe("Business Vision", () => {
    it("should share appropriate business vision based on access", async () => {
      const response = await founderAgent.processQuery({
        input: "What is your business model?",
        userId: "public-user",
        context: {},
      });

      expect(response.content).toContain("consciousness-first");
      expect(response.content).toContain("sustainable");
      expect(response.metadata?.domain).toBe("business");
    });
  });

  describe("Vision Coherence", () => {
    it("should check alignment of new initiatives", async () => {
      const result = await founderAgent.checkVisionCoherence({
        name: "AI Chatbot Feature",
        description: "A simple chatbot for customer service",
        alignment: ["technology", "service"],
      });

      expect(result.coherent).toBeDefined();
      expect(result.alignmentScore).toBeGreaterThanOrEqual(0);
      expect(result.alignmentScore).toBeLessThanOrEqual(1);
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it("should provide suggestions for better alignment", async () => {
      const result = await founderAgent.checkVisionCoherence({
        name: "Ad Revenue System",
        description: "Maximize ad revenue through user attention",
        alignment: ["business"],
      });

      expect(result.coherent).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain("consciousness");
    });
  });

  describe("Access Control", () => {
    it("should respect depth boundaries for public users", async () => {
      const response = await founderAgent.processQuery({
        input: "Tell me about your esoteric initiation mysteries",
        userId: "public-user",
        context: {},
      });

      expect(response.content).toContain("appropriate");
      expect(response.metadata?.accessLevel).toBe("public");
    });
  });

  describe("Identity and Voice", () => {
    it("should maintain authentic founder voice", async () => {
      const response = await founderAgent.processQuery({
        input: "Who are you?",
        userId: "test-user",
        context: {},
      });

      expect(response.content).toContain("Soullab");
      expect(response.content).toContain("vision");
      expect(response.provider).toBe("soullab-founder");
    });
  });
});

/**
 * 🧪 TEST COVERAGE
 *
 * These tests verify that the SoullabFounderAgent:
 * - Shares philosophy appropriately
 * - Protects technical IP while being helpful
 * - Guides community members effectively
 * - Maintains vision coherence
 * - Respects access boundaries
 * - Speaks with authentic organizational voice
 *
 * Additional tests would include:
 * - Knowledge document upload processing
 * - Long-term vision articulation
 * - Cross-domain query handling
 * - Evolution of responses over time
 */
