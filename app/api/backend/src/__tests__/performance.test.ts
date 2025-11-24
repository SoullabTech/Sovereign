// Performance Tests for Pre-Deployment Verification
import request from "supertest";
import app from "../app";

describe("Performance Tests", () => {
  const API_TIMEOUT = 5000; // 5 second timeout

  beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = "test";
  });

  describe("API Response Times", () => {
    test("Health check should respond within 200ms", async () => {
      const start = Date.now();
      const response = await request(app)
        .get("/api/v1/health")
        .timeout(API_TIMEOUT);

      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(200);
      expect(response.body.success).toBe(true);
    }, 10000);

    test("AIN Engine status should respond within 500ms", async () => {
      const start = Date.now();
      const response = await request(app)
        .get("/api/v1/ain-engine/system-status")
        .set("X-API-Key", "demo_key_123")
        .timeout(API_TIMEOUT);

      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500);
      expect(response.body.success).toBe(true);
    }, 10000);
  });

  describe("Concurrent Load Test", () => {
    test("Should handle 10 concurrent health checks", async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app).get("/api/v1/health").timeout(API_TIMEOUT),
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    }, 15000);

    test("Should handle concurrent AIN Engine requests", async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .get("/api/v1/ain-engine/system-status")
          .set("X-API-Key", "demo_key_123")
          .timeout(API_TIMEOUT),
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    }, 15000);
  });

  describe("Memory and Resource Usage", () => {
    test("Memory usage should be reasonable after requests", async () => {
      const initialMemory = process.memoryUsage();

      // Make several requests
      for (let i = 0; i < 20; i++) {
        await request(app).get("/api/v1/health").timeout(API_TIMEOUT);
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease =
        (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024; // MB

      // Memory increase should be less than 50MB for 20 requests
      expect(memoryIncrease).toBeLessThan(50);
    }, 20000);
  });

  describe("Error Response Performance", () => {
    test("Error responses should be fast", async () => {
      const start = Date.now();
      const response = await request(app)
        .get("/api/v1/nonexistent")
        .timeout(API_TIMEOUT);

      const responseTime = Date.now() - start;

      expect(response.status).toBe(404);
      expect(responseTime).toBeLessThan(100);
    }, 5000);
  });
});
