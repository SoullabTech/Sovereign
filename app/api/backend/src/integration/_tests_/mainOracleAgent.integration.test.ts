// tests/mainoracleagent.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MainOracleAgent } from "../src/core/agents/mainOracleAgent";
import { supabase } from "../src/lib/supabaseClient";
import {
  storeMemoryItem,
  getRelevantMemories,
} from "../src/services/memoryService";

const testUserId = "integration-test-user";
let agent: MainOracleAgent;

beforeAll(async () => {
  // Clean up test user's memories
  await supabase.from("memories").delete().eq("userId", testUserId);
  agent = new MainOracleAgent();
});

afterAll(async () => {
  // Clean up any remaining test data
  await supabase.from("memories").delete().eq("userId", testUserId);
});

describe("MainOracleAgent Integration", () => {
  it("should process a simple query and return a valid response", async () => {
    const response = await agent.processQuery({
      input: "Hello",
      userId: testUserId,
      context: {},
    });
    expect(response).toBeDefinacleservice.integrationed();
    expect(typeof response).toBe("object");
    expect((response as any).answer).toBeDefined();
  });

  it("should store the input as a memory after processing", async () => {
    await agent.processQuery({
      input: "Remember this",
      userId: testUserId,
      context: {},
    });
    const memories = await getRelevantMemories(testUserId);
    expect(memories.length).toBeGreaterThanOrEqual(1);
    expect(memories.some((m) => m.content.includes("Remember this"))).toBe(
      true,
    );
  });
});
