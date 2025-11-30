// ===============================================
// SOUL MEMORY INTEGRATION TEST
// Tests the complete integration between PersonalOracleAgent and SoulMemorySystem
// ===============================================

import { PersonalOracleAgent } from "../core/agents/PersonalOracleAgent";
import { SoulMemorySystem } from "../../memory/SoulMemorySystem";
import { logger } from "../utils/logger";

async function testSoulMemoryIntegration() {
  console.log("🌀 Starting Soul Memory Integration Test...\n");

  // 1. Initialize Soul Memory System
  console.log("1️⃣ Initializing Soul Memory System...");
  const soulMemory = new SoulMemorySystem({
    userId: "test_user_123",
    storageType: "sqlite",
    databasePath: "./test_soul_memory.db",
    memoryDepth: 100,
  });
  console.log("✅ Soul Memory System initialized\n");

  // 2. Create Personal Oracle Agent
  console.log("2️⃣ Creating Personal Oracle Agent...");
  const oracle = new PersonalOracleAgent({
    userId: "test_user_123",
    oracleName: "Aria",
    elementalResonance: "water",
    oracleMode: "sage",
  });
  console.log("✅ Oracle Agent created\n");

  // 3. Connect Oracle to Soul Memory
  console.log("3️⃣ Connecting Oracle to Soul Memory...");
  await oracle.connectToSoulMemory(soulMemory);
  console.log("✅ Oracle connected to Soul Memory\n");

  // 4. Test Oracle Exchange with Memory Storage
  console.log("4️⃣ Testing Oracle Exchange...");
  const testMessage = "I'm feeling overwhelmed by all these changes in my life";
  console.log(`User: "${testMessage}"`);

  const oracleResponse = await oracle.respondToPrompt(testMessage);
  console.log(`Oracle: "${oracleResponse}"\n`);

  // 5. Verify Memory Storage
  console.log("5️⃣ Verifying memory was stored...");
  const recentMemories = await soulMemory.retrieveMemories("test_user_123", {
    limit: 1,
  });

  if (recentMemories.length > 0) {
    const latestMemory = recentMemories[0];
    console.log("✅ Memory stored successfully!");
    console.log("Memory details:", {
      id: latestMemory.id,
      type: latestMemory.type,
      content: latestMemory.content.substring(0, 50) + "...",
      element: latestMemory.element,
      emotionalTone: latestMemory.emotionalTone,
      oracleResponse: latestMemory.oracleResponse?.substring(0, 50) + "...",
      timestamp: latestMemory.timestamp,
    });
  } else {
    console.log("❌ No memory found - storage may have failed");
  }
  console.log("");

  // 6. Test Semantic Search
  console.log("6️⃣ Testing semantic search...");
  const searchResults = await soulMemory.semanticSearch(
    "test_user_123",
    "overwhelmed changes",
    { topK: 3 },
  );
  console.log(`Found ${searchResults.length} semantically related memories\n`);

  // 7. Test Pattern Detection with Multiple Exchanges
  console.log("7️⃣ Testing pattern detection...");

  // Store a few more related exchanges
  const testExchanges = [
    "I keep feeling like I'm not making progress",
    "Why do I always feel stuck in the same patterns?",
    "I notice I'm avoiding making decisions again",
  ];

  for (const message of testExchanges) {
    console.log(`User: "${message}"`);
    const response = await oracle.respondToPrompt(message);
    console.log(`Oracle: "${response.substring(0, 100)}..."\n`);

    // Small delay to ensure sequential timestamps
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // 8. Test Ritual Moment Recording
  console.log("8️⃣ Testing ritual moment recording...");
  const ritualMemory = await soulMemory.recordRitualMoment(
    "test_user_123",
    "morning_intention",
    "Setting intention to embrace change with grace",
    "water",
    await oracle.generateRitualGuidance("morning_intention"),
  );
  console.log("✅ Ritual moment recorded:", {
    id: ritualMemory.id,
    type: ritualMemory.type,
    sacredMoment: ritualMemory.sacredMoment,
  });
  console.log("");

  // 9. Test Sacred Moments Retrieval
  console.log("9️⃣ Testing sacred moments retrieval...");
  const sacredMoments = await soulMemory.getSacredMoments("test_user_123", 5);
  console.log(`Found ${sacredMoments.length} sacred moments\n`);

  // 10. Test Archetypal Pattern Detection
  console.log("🔟 Testing archetypal patterns...");

  // Store memory with archetype
  await soulMemory.storeMemory({
    userId: "test_user_123",
    type: "archetypal_emergence",
    content: "Feeling the Seeker archetype strongly today",
    element: "air",
    archetype: "Seeker",
    metadata: { test: true },
  });

  const activeArchetypes =
    await soulMemory.getActiveArchetypes("test_user_123");
  console.log(
    "Active archetypes:",
    activeArchetypes.map((a) => a.archetype),
  );
  console.log("");

  // 11. Test Memory Thread Creation
  console.log("1️⃣1️⃣ Testing memory threads...");
  const thread = await soulMemory.createMemoryThread(
    "test_user_123",
    "Integration Journey",
    "integration",
  );
  console.log("✅ Memory thread created:", {
    id: thread.id,
    threadName: thread.threadName,
    threadType: thread.threadType,
  });
  console.log("");

  // 12. Test Journal Reflection with Memory
  console.log("1️⃣2️⃣ Testing journal reflection...");
  const journalEntry =
    "Today I realized that my fear of change comes from not trusting myself. I see how this pattern has been holding me back.";
  const reflection = await oracle.reflectOnJournal(journalEntry);
  console.log("Journal entry:", journalEntry);
  console.log("Oracle reflection:", reflection);
  console.log("");

  // 13. Final Memory Summary
  console.log("📊 Final Memory Summary:");
  const allMemories = await soulMemory.retrieveMemories("test_user_123");
  const summary = {
    totalMemories: allMemories.length,
    memoryTypes: [...new Set(allMemories.map((m) => m.type))],
    elements: [...new Set(allMemories.map((m) => m.element))],
    sacredMoments: allMemories.filter((m) => m.sacredMoment).length,
    transformations: allMemories.filter((m) => m.transformationMarker).length,
  };
  console.log(summary);

  // Cleanup
  console.log("\n🧹 Cleaning up test data...");
  await soulMemory.closeDatabase();
  console.log("✅ Test complete!");
}

// Run the test
testSoulMemoryIntegration().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
