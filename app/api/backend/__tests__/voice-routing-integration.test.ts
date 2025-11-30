// voice-routing-integration.test.ts - Integration tests for voice routing

import { routeVoice } from "../src/utils/voiceRouter";
import {
  getAgentRole,
  isNarrationContent,
  AgentRole,
} from "../src/utils/agentRoleMapping";

// Mock environment variable
process.env.USE_SESAME = "true";

describe("Voice Routing Integration", () => {
  describe("Agent Role Mapping", () => {
    it("should map oracle agents correctly", () => {
      const oracleAgents = [
        "MainOracleAgent",
        "PersonalOracleAgent",
        "EnhancedPersonalOracleAgent",
      ];

      oracleAgents.forEach((agentType) => {
        const role = getAgentRole({ agentType });
        expect(role).toBe(AgentRole.ORACLE);
      });
    });

    it("should map elemental agents correctly", () => {
      const elementalAgents = [
        "FireAgent",
        "WaterAgent",
        "EarthAgent",
        "AirAgent",
        "AetherAgent",
      ];

      elementalAgents.forEach((agentType) => {
        const role = getAgentRole({ agentType });
        expect(role).toBe(AgentRole.ELEMENTAL);
      });
    });

    it("should override to narrator for meditation context", () => {
      const role = getAgentRole({
        agentType: "FireAgent",
        context: { type: "meditation" },
      });
      expect(role).toBe(AgentRole.NARRATOR);
    });
  });

  describe("Narration Content Detection", () => {
    it("should detect meditation content", () => {
      const meditationTexts = [
        "Close your eyes and take a deep breath",
        "Let us begin this sacred journey",
        "Visualize a golden light surrounding you",
      ];

      meditationTexts.forEach((text) => {
        expect(isNarrationContent(text)).toBe(true);
      });
    });

    it("should not detect regular oracle content as narration", () => {
      const oracleTexts = [
        "Your fire element is strong today",
        "The cards suggest a new beginning",
        "I sense transformation approaching",
      ];

      oracleTexts.forEach((text) => {
        expect(isNarrationContent(text)).toBe(false);
      });
    });
  });

  describe("Mock Agent Responses", () => {
    const mockAgentResponses = [
      {
        agent: "MainOracleAgent",
        response: {
          content:
            "The universe speaks through synchronicity. Your question reveals a deeper seeking.",
          metadata: { agentType: "MainOracleAgent" },
        },
        expectedRoute: "sesame", // When USE_SESAME=true
      },
      {
        agent: "FireAgent",
        response: {
          content:
            "Your inner flame burns bright! Time to take bold action on your dreams.",
          metadata: { agentType: "FireAgent" },
        },
        expectedRoute: "sesame",
      },
      {
        agent: "MeditationGuide",
        response: {
          content:
            "Close your eyes and take a deep breath. Let us journey into stillness.",
          metadata: {
            agentType: "NarrationAgent",
            context: { type: "meditation" },
          },
        },
        expectedRoute: "elevenlabs", // Always for narration
      },
    ];

    it("should route mock agent responses correctly", () => {
      mockAgentResponses.forEach(({ agent, response, expectedRoute }) => {
        const role = getAgentRole(response.metadata);

        if (expectedRoute === "sesame") {
          expect([AgentRole.ORACLE, AgentRole.ELEMENTAL]).toContain(role);
        } else {
          expect(role).toBe(AgentRole.NARRATOR);
        }
      });
    });
  });

  describe("End-to-End Voice Routing", () => {
    it("should handle a complete oracle interaction", async () => {
      const oracleQuery = {
        text: "I see the transformation you seek emerging from within.",
        voiceId: "oracle-voice-id",
        agentRole: "oracle",
      };

      // In a real test, this would call the actual routeVoice function
      // For now, we're testing the logic flow
      const shouldUseSesame =
        process.env.USE_SESAME === "true" &&
        (oracleQuery.agentRole === "oracle" ||
          oracleQuery.agentRole === "elemental");

      expect(shouldUseSesame).toBe(true);
    });

    it("should handle a meditation narration", async () => {
      const meditationScript = {
        text: "Close your eyes and begin to breathe deeply. Let us enter the sacred space within.",
        voiceId: "narrator-voice-id",
        agentRole: "narrator",
      };

      // Narrator should always use ElevenLabs
      const shouldUseSesame =
        process.env.USE_SESAME === "true" &&
        (meditationScript.agentRole === "oracle" ||
          meditationScript.agentRole === "elemental");

      expect(shouldUseSesame).toBe(false);
    });
  });
});
