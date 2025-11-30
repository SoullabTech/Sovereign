// 🧪 ELEMENTAL ALCHEMY KNOWLEDGE TESTS
import { describe, it, expect, beforeEach } from "vitest";
import { SoullabFounderAgent } from "../core/agents/soullabFounderAgent";

describe("Elemental Alchemy Knowledge Integration", () => {
  let founderAgent: SoullabFounderAgent;

  beforeEach(() => {
    founderAgent = new SoullabFounderAgent();
  });

  describe("Book Knowledge Queries", () => {
    it("should explain Elemental Alchemy philosophy", async () => {
      const response = await founderAgent.processQuery({
        input: "What is Elemental Alchemy?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Elemental Alchemy");
      expect(response.content).toContain("Kelly Nezat");
      expect(response.content).toContain(
        "ancient art of living a phenomenal life",
      );
      expect(response.content).toContain("elemental balance");
      expect(response.metadata?.domain).toBe("philosophy");
    });

    it("should describe all five elements", async () => {
      const response = await founderAgent.processQuery({
        input: "Tell me about the elements in Elemental Alchemy",
        userId: "test-user-001",
        context: {},
      });

      // Check all elements are mentioned
      expect(response.content).toContain("Fire");
      expect(response.content).toContain("Water");
      expect(response.content).toContain("Earth");
      expect(response.content).toContain("Air");
      expect(response.content).toContain("Aether");

      // Check key concepts
      expect(response.content).toContain("transformation");
      expect(response.content).toContain("emotional intelligence");
      expect(response.content).toContain("embodiment");
      expect(response.content).toContain("clarity");
      expect(response.content).toContain("unity");
    });

    it("should explain the Torus of Change", async () => {
      const response = await founderAgent.processQuery({
        input: "What is the Torus of Change in Elemental Alchemy?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Torus of Change");
      expect(response.content).toContain("dynamic flow pattern");
      expect(response.content).toContain("cycles of transformation");
    });

    it("should discuss shadow aspects of elements", async () => {
      const response = await founderAgent.processQuery({
        input: "What are the shadow aspects in Elemental Alchemy?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("shadow");
      expect(response.content).toContain("integration");
      // Check specific shadow aspects
      expect(response.content.toLowerCase()).toMatch(
        /burnout|overwhelm|rigidity|overthinking|dissociation/,
      );
    });
  });

  describe("Integration with Spiralogic", () => {
    it("should connect Elemental Alchemy to Spiralogic", async () => {
      const response = await founderAgent.processQuery({
        input: "How does Elemental Alchemy relate to Spiralogic?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Elemental Alchemy");
      expect(response.content).toContain("Spiralogic");
      expect(response.content).toContain("elements");
      expect(response.content).toContain("transformation");
    });
  });

  describe("Practical Applications", () => {
    it("should provide practical guidance", async () => {
      const response = await founderAgent.processQuery({
        input: "How can I apply Elemental Alchemy in my life?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("practical");
      expect(response.content).toMatch(/balance|harmony|practice|integration/i);
    });

    it("should discuss living phenomenally", async () => {
      const response = await founderAgent.processQuery({
        input: "What does it mean to live phenomenally?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("phenomenal");
      expect(response.content).toContain("authentic");
      expect(response.content).toContain("elemental balance");
    });
  });

  describe("Author Attribution", () => {
    it("should properly attribute Kelly Nezat", async () => {
      const response = await founderAgent.processQuery({
        input: "Who is Kelly Nezat?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("Kelly Nezat");
      expect(response.content).toContain("founder");
      expect(response.content).toContain("Elemental Alchemy");
    });
  });

  describe("Healing Applications", () => {
    it("should discuss elemental healing", async () => {
      const response = await founderAgent.processQuery({
        input: "How does Elemental Alchemy approach healing?",
        userId: "test-user-001",
        context: {},
      });

      expect(response.content).toContain("healing");
      expect(response.content).toContain("balance");
      expect(response.content).toMatch(/restore|transform|integrate/i);
    });
  });
});

/**
 * 🧪 ELEMENTAL ALCHEMY KNOWLEDGE TESTS
 *
 * These tests verify that the Founder Agent has successfully integrated
 * the Elemental Alchemy book knowledge and can:
 *
 * - Explain the core philosophy and teachings
 * - Describe all five elements and their qualities
 * - Discuss shadow aspects and integration
 * - Connect to the Spiralogic framework
 * - Provide practical applications
 * - Properly attribute the author
 * - Share healing wisdom
 *
 * The tests ensure the book knowledge is accessible and accurately
 * represented in the agent's responses.
 */
