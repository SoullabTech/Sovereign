// backend/__tests__/oracle-onboarding.test.ts

import request from "supertest";
import { app } from "../src/server";
import { supabase } from "../src/lib/supabase";

describe("Oracle Onboarding Flow", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const { data, error } = await supabase.auth.signUp({
      email: "test-oracle@example.com",
      password: "testpassword123",
    });

    if (error) throw error;

    authToken = data.session?.access_token || "";
    userId = data.user?.id || "";
  });

  afterAll(async () => {
    // Cleanup test data
    if (userId) {
      await supabase.from("oracle_preferences").delete().eq("user_id", userId);

      await supabase.from("memory_items").delete().eq("user_id", userId);
    }
  });

  describe("GET /api/voice/list", () => {
    it("should return available voices", async () => {
      const response = await request(app).get("/api/voice/list").expect(200);

      expect(response.body).toHaveProperty("voices");
      expect(Array.isArray(response.body.voices)).toBe(true);
      expect(response.body.voices.length).toBeGreaterThan(0);

      // Check voice structure
      const voice = response.body.voices[0];
      expect(voice).toHaveProperty("id");
      expect(voice).toHaveProperty("name");
      expect(voice).toHaveProperty("description");
      expect(voice).toHaveProperty("preview_url");
    });
  });

  describe("GET /api/voice/preview", () => {
    it("should handle voice preview request", async () => {
      const response = await request(app).get(
        "/api/voice/preview?voiceId=aunt-annie",
      );

      // In development mode, should return JSON
      if (process.env.NODE_ENV === "development") {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("voice_id", "aunt-annie");
      } else {
        // In production, would return audio stream or 404
        expect([200, 404]).toContain(response.status);
      }
    });

    it("should return 400 for invalid voice ID", async () => {
      await request(app)
        .get("/api/voice/preview?voiceId=invalid-voice")
        .expect(400);
    });
  });

  describe("Oracle Preferences API", () => {
    it("should return null for new user preferences", async () => {
      const response = await request(app)
        .get("/api/oracle/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("preferences", null);
    });

    it("should save Oracle preferences", async () => {
      const preferences = {
        oracle_name: "TestOracle",
        oracle_voice: "aunt-annie",
        insight: "This is a test insight about why I chose this configuration.",
      };

      const response = await request(app)
        .post("/api/oracle/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(preferences)
        .expect(201);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("preferences");
      expect(response.body.preferences).toHaveProperty(
        "oracle_name",
        "TestOracle",
      );
      expect(response.body.preferences).toHaveProperty(
        "oracle_voice",
        "aunt-annie",
      );
    });

    it("should retrieve saved preferences", async () => {
      const response = await request(app)
        .get("/api/oracle/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.preferences).toHaveProperty(
        "oracle_name",
        "TestOracle",
      );
      expect(response.body.preferences).toHaveProperty(
        "oracle_voice",
        "aunt-annie",
      );
    });

    it("should update existing preferences", async () => {
      const updatedPrefs = {
        oracle_name: "UpdatedOracle",
        oracle_voice: "deep-sage",
      };

      const response = await request(app)
        .put("/api/oracle/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedPrefs)
        .expect(200);

      expect(response.body.preferences).toHaveProperty(
        "oracle_name",
        "UpdatedOracle",
      );
      expect(response.body.preferences).toHaveProperty(
        "oracle_voice",
        "deep-sage",
      );
    });

    it("should validate Oracle name length", async () => {
      const invalidPrefs = {
        oracle_name: "A".repeat(41), // Too long
        oracle_voice: "aunt-annie",
      };

      await request(app)
        .post("/api/oracle/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidPrefs)
        .expect(400);
    });

    it("should validate voice selection", async () => {
      const invalidPrefs = {
        oracle_name: "ValidName",
        oracle_voice: "invalid-voice",
      };

      await request(app)
        .post("/api/oracle/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidPrefs)
        .expect(400);
    });

    it("should require authentication", async () => {
      await request(app).get("/api/oracle/preferences").expect(401);

      await request(app)
        .post("/api/oracle/preferences")
        .send({ oracle_name: "Test", oracle_voice: "aunt-annie" })
        .expect(401);
    });
  });

  describe("Memory Integration", () => {
    it("should create memory entry when insight is provided", async () => {
      // Reset preferences first
      await supabase.from("oracle_preferences").delete().eq("user_id", userId);

      const preferences = {
        oracle_name: "MemoryTestOracle",
        oracle_voice: "matrix-oracle",
        insight:
          "I chose this configuration because it resonates with my spiritual practice.",
      };

      await request(app)
        .post("/api/oracle/preferences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(preferences)
        .expect(201);

      // Check if memory item was created
      const { data: memoryItems } = await supabase
        .from("memory_items")
        .select("*")
        .eq("user_id", userId)
        .eq("category", "oracle_setup");

      expect(memoryItems).toBeTruthy();
      expect(memoryItems?.length).toBeGreaterThan(0);

      const memoryItem = memoryItems?.[0];
      expect(memoryItem?.title).toBe("Oracle Configuration");
      expect(memoryItem?.content).toContain("MemoryTestOracle");
      expect(memoryItem?.content).toContain("matrix-oracle");
      expect(memoryItem?.content).toContain("spiritual practice");
    });
  });
});
