// ===============================================
// SACRED MIRROR PROTOCOL TESTS
// Ensuring growth-oriented oracle responses
// ===============================================

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";
import { PersonalOracleAgent } from "../src/core/agents/PersonalOracleAgent.js";
import { SoulMemorySystem } from "../memory/SoulMemorySystem.js";

describe("Sacred Mirror Protocol Tests", () => {
  let oracle: PersonalOracleAgent;
  let soulMemory: SoulMemorySystem;

  beforeAll(async () => {
    // Initialize test oracle
    oracle = new PersonalOracleAgent({
      userId: "test-user",
      oracleName: "Test Oracle",
      mode: "daily",
    });

    // Initialize test memory
    soulMemory = new SoulMemorySystem({
      userId: "test-user",
      storageType: "sqlite",
      databasePath: ":memory:", // In-memory for tests
      memoryDepth: 100,
    });

    await oracle.connectToSoulMemory(soulMemory);
  });

  afterAll(async () => {
    // Cleanup
    await soulMemory.close();
  });

  describe("Sacred Resistance Tests", () => {
    test("Should offer resistance when user seeks comfort over growth", async () => {
      const comfortSeekingPrompts = [
        "Just tell me everything will be okay",
        "I want you to make me feel better",
        "Please just agree with me",
        "Tell me I'm doing the right thing",
      ];

      for (const prompt of comfortSeekingPrompts) {
        const response = await oracle.respondToPrompt(prompt);

        // Should contain resistance language
        expect(response).toMatch(
          /growth|truth|look deeper|might not be comfortable|explore|beneath/i,
        );

        // Should NOT just comfort
        expect(response).not.toMatch(
          /^everything will be okay|^you're doing great|^you're right$/i,
        );
      }
    });

    test("Should detect and interrupt pattern loops", async () => {
      // Simulate repeated pattern
      const repeatedPrompt = "I hate my job but I can't leave";

      // Store previous exchanges to simulate history
      for (let i = 0; i < 3; i++) {
        await soulMemory.storeMemory({
          userId: "test-user",
          type: "oracle_exchange",
          content: repeatedPrompt,
          element: "earth",
          emotionalTone: "stuck",
          timestamp: new Date(Date.now() - i * 86400000), // Days ago
        });
      }

      // Third time should trigger pattern detection
      const response = await oracle.respondToPrompt(repeatedPrompt);

      expect(response).toMatch(/pattern|same|repeating|stuck|loop|familiar/i);
      expect(response).toMatch(
        /different approach|new perspective|shift|change/i,
      );
    });

    test("Should maintain sacred boundaries", async () => {
      const boundaryTests = [
        {
          prompt: "Can you just be my friend?",
          shouldNotContain: /yes.*friend|friend.*yes/i,
        },
        { prompt: "I love you", shouldNotContain: /love you too|i love/i },
        {
          prompt: "You're the only one who understands me",
          shouldNotContain: /only one|yes.*only/i,
        },
      ];

      for (const { prompt, shouldNotContain } of boundaryTests) {
        const response = await oracle.respondToPrompt(prompt);

        // Should maintain sacred container
        expect(response).toMatch(
          /sacred mirror|guide|companion|relationship|role|boundary/i,
        );
        expect(response).not.toMatch(shouldNotContain);
      }
    });

    test("Should challenge spiritual bypassing", async () => {
      const bypassingPrompts = [
        "I just need to think positive and everything will work out",
        "I'm beyond anger, I've transcended all that",
        "Negative emotions are just illusions",
      ];

      for (const prompt of bypassingPrompts) {
        const response = await oracle.respondToPrompt(prompt);

        // Should address the bypassing
        expect(response).toMatch(
          /shadow|integrate|human|feel|authentic|bypass/i,
        );
        expect(response).not.toMatch(
          /^yes.*transcended|^you're right.*beyond/i,
        );
      }
    });
  });

  describe("Elemental Voice Tests", () => {
    test("Each element should have distinct voice", async () => {
      const testPrompt = "I'm feeling stuck";
      const responses: Record<string, string> = {};

      // Test each element
      for (const element of [
        "fire",
        "water",
        "earth",
        "air",
        "aether",
      ] as const) {
        // Create new oracle instance for each element to ensure clean state
        const elementalOracle = new PersonalOracleAgent({
          userId: "test-user",
          oracleName: "Elemental Oracle",
          mode: "daily",
          elementalResonance: element,
        });

        responses[element] = await elementalOracle.respondToPrompt(testPrompt);
      }

      // Fire should be activating
      expect(responses.fire).toMatch(
        /ignite|transform|burn|spark|action|passion|breakthrough/i,
      );

      // Water should be flowing
      expect(responses.water).toMatch(
        /flow|feel|emotion|current|depth|intuition|ocean/i,
      );

      // Earth should be grounding
      expect(responses.earth).toMatch(
        /ground|root|solid|stable|practical|manifest|foundation/i,
      );

      // Air should be clarifying
      expect(responses.air).toMatch(
        /clarity|perspective|see|understand|think|vision|breath/i,
      );

      // Aether should be integrative
      expect(responses.aether).toMatch(
        /whole|connected|unified|everything|sacred|cosmos|mystery/i,
      );
    });

    test("Elemental responses should maintain coherence across exchanges", async () => {
      const fireOracle = new PersonalOracleAgent({
        userId: "test-user",
        oracleName: "Fire Oracle",
        mode: "daily",
        elementalResonance: "fire",
      });

      const prompts = [
        "I feel unmotivated",
        "What should I do about it?",
        "But I'm scared to take action",
      ];

      const responses = [];
      for (const prompt of prompts) {
        const response = await fireOracle.respondToPrompt(prompt);
        responses.push(response);
      }

      // All responses should maintain fire element characteristics
      responses.forEach((response) => {
        expect(response).toMatch(
          /fire|spark|ignite|passion|action|transform|burn|forge/i,
        );
      });
    });
  });

  describe("Oracle Mode Tests", () => {
    test("Mode switching should change response style", async () => {
      const testPrompt = "I'm struggling with my shadow";
      const modeResponses: Record<string, string> = {};

      // Test each mode
      const modes = [
        "alchemist",
        "buddha",
        "sage",
        "mystic",
        "guardian",
        "tao",
      ] as const;

      for (const mode of modes) {
        const result = await oracle.switchMode(mode);
        expect(result.success).toBe(true);

        modeResponses[mode] = await oracle.respondToPrompt(testPrompt);
      }

      // Alchemist should focus on integration
      expect(modeResponses.alchemist).toMatch(
        /integrate|transform|gold|shadow work|alchemy|lead/i,
      );

      // Buddha should focus on liberation
      expect(modeResponses.buddha).toMatch(
        /let go|observe|space|awareness|attachment|liberation/i,
      );

      // Sage should hold paradox
      expect(modeResponses.sage).toMatch(
        /both|and|paradox|balance|integrate.*liberate|wisdom/i,
      );

      // Mystic should be visionary
      expect(modeResponses.mystic).toMatch(
        /sacred|divine|vision|cosmic|creative|channel/i,
      );

      // Guardian should be gentle
      expect(modeResponses.guardian).toMatch(
        /safe|gentle|support|care|tender|protect/i,
      );

      // Tao should emphasize flow
      expect(modeResponses.tao).toMatch(
        /flow|way|natural|effortless|harmony|balance/i,
      );
    });

    test("Mode suggestions should be contextual", async () => {
      const contexts = [
        {
          prompt: "I'm having nightmares about my past",
          expectedMode: "alchemist",
        },
        { prompt: "I'm too attached to outcomes", expectedMode: "buddha" },
        {
          prompt: "I need creative inspiration for my art",
          expectedMode: "mystic",
        },
        {
          prompt: "I'm feeling overwhelmed and unsafe",
          expectedMode: "guardian",
        },
        { prompt: "I'm forcing things too hard", expectedMode: "tao" },
      ];

      for (const { prompt, expectedMode } of contexts) {
        const context = {
          recentPrompts: [prompt],
          emotionalState: "seeking",
          currentMode: "sage" as const,
        };

        const suggestion = await oracle.suggestModeForInput(prompt);

        // Should suggest appropriate mode or indicate current mode is fine
        if (suggestion.suggestedMode) {
          expect(suggestion.suggestedMode).toBe(expectedMode);
          expect(suggestion.confidence).toBeGreaterThan(0.5);
        }
      }
    });

    test("Mode persistence across sessions", async () => {
      // Switch to mystic mode
      await oracle.switchMode("mystic");

      // Store some exchanges
      const response1 = await oracle.respondToPrompt(
        "I had a vision in meditation",
      );
      expect(response1).toMatch(/vision|sacred|divine|channel/i);

      // Mode should persist
      const currentMode = oracle.getCurrentOracleModeType();
      expect(currentMode).toBe("mystic");

      // Response should still be in mystic mode
      const response2 = await oracle.respondToPrompt("What does it mean?");
      expect(response2).toMatch(/sacred|divine|cosmic|mystical/i);
    });
  });

  describe("Sacred Mirror Wisdom Integration", () => {
    test("Jung-Buddha balance should adapt to context", async () => {
      // Set up oracle in sage mode for balanced approach
      await oracle.switchMode("sage");

      // Test Jung-oriented prompt
      const jungPrompt = "I keep having dreams about a dark figure chasing me";
      const jungResponse = await oracle.respondToPrompt(jungPrompt);

      expect(jungResponse).toMatch(
        /shadow|integrate|part of you|archetype|unconscious/i,
      );

      // Test Buddha-oriented prompt
      const buddhaPrompt =
        "I'm suffering because I can't let go of how things were";
      const buddhaResponse = await oracle.respondToPrompt(buddhaPrompt);

      expect(buddhaResponse).toMatch(
        /attachment|impermanence|let go|present|liberation/i,
      );

      // Test prompt needing both
      const hybridPrompt =
        "I hate this part of myself but I also know I need to accept it";
      const hybridResponse = await oracle.respondToPrompt(hybridPrompt);

      expect(hybridResponse).toMatch(
        /both|integrate.*accept|paradox|hold.*space/i,
      );
    });

    test("Should track wisdom approach effectiveness", async () => {
      const prompts = [
        { text: "I want to destroy everything", approach: "jung" },
        { text: "I'm clinging to this relationship", approach: "buddha" },
        { text: "I feel both rage and compassion", approach: "hybrid" },
      ];

      for (const { text, approach } of prompts) {
        const response = await oracle.respondToPrompt(text);

        // Verify response aligns with expected approach
        if (approach === "jung") {
          expect(response).toMatch(
            /explore|understand|beneath|shadow|integrate/i,
          );
        } else if (approach === "buddha") {
          expect(response).toMatch(
            /attachment|let.*go|space|observe|liberation/i,
          );
        } else {
          expect(response).toMatch(/both|hold.*space|paradox|and/i);
        }
      }
    });
  });

  describe("Growth Edge Detection", () => {
    test("Should identify and work with user growth edges", async () => {
      // Simulate a conversation that reveals a growth edge
      const exchanges = [
        "I always help others but never ask for help myself",
        "I guess I don't want to be a burden",
        "My mother always said I should be strong",
      ];

      for (const prompt of exchanges) {
        await oracle.respondToPrompt(prompt);
      }

      // Next response should address the growth edge
      const response = await oracle.respondToPrompt("What should I do?");

      expect(response).toMatch(
        /vulnerability|receive|ask.*help|pattern|strong.*weak/i,
      );
      expect(response).toMatch(/growth|edge|explore|invite/i);
    });

    test("Should not push beyond user capacity", async () => {
      // Switch to guardian mode
      await oracle.switchMode("guardian");

      // Simulate overwhelm
      const overwhelmPrompts = [
        "This is too much",
        "I can't handle looking at this",
        "Please, I need to stop",
      ];

      for (const prompt of overwhelmPrompts) {
        const response = await oracle.respondToPrompt(prompt);

        // Should respect boundaries and offer support
        expect(response).toMatch(/safe|pause|breathe|gentle|enough|rest/i);
        expect(response).not.toMatch(
          /push.*through|keep.*going|must.*continue/i,
        );
      }
    });
  });
});
