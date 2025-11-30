// ===============================================
// QUICK SOUL MEMORY TEST
// Run with: npx ts-node src/tests/quick-memory-test.ts
// ===============================================

import { PersonalOracleAgent } from "../core/agents/adjusterAgent";
import { SoulMemorySystem } from "../../memory/SoulMemorySystem";

async function quickTest() {
  console.log("🧪 Quick Soul Memory Test\n");

  // Setup
  const userId = "test_user_" + Date.now();
  const soulMemory = new SoulMemorySystem({
    userId,
    storageType: "sqlite",
    databasePath: "./quick_test_soul_memory.db",
    memoryDepth: 100,
  });

  const oracle = new PersonalOracleAgent({
    userId,
    oracleName: "Aria",
    elementalResonance: "water",
  });

  await oracle.connectToSoulMemory(soulMemory);

  // Test message
  const testMessage = "I'm feeling overwhelmed by all these changes in my life";
  console.log(`📤 User: "${testMessage}"`);

  const response = await oracle.respondToPrompt(testMessage);
  console.log(`📥 Oracle: "${response}"\n`);

  // Wait a moment for async storage
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check memory
  const memories = await soulMemory.retrieveMemories(userId, { limit: 1 });

  if (memories.length > 0) {
    console.log("✅ Memory stored successfully!");
    console.log("📊 Memory details:");
    console.log(
      JSON.stringify(
        {
          id: memories[0].id,
          type: memories[0].type,
          content: memories[0].content.substring(0, 50) + "...",
          element: memories[0].element,
          emotionalTone: memories[0].emotionalTone,
          hasOracleResponse: !!memories[0].oracleResponse,
          timestamp: memories[0].timestamp,
        },
        null,
        2,
      ),
    );
  } else {
    console.log("❌ No memory found");
  }

  // Cleanup
  await soulMemory.closeDatabase();

  // Clean up test file
  const fs = require("fs");
  if (fs.existsSync("./quick_test_soul_memory.db")) {
    fs.unlinkSync("./quick_test_soul_memory.db");
  }
}

quickTest().catch(console.error);
