import request from "supertest";
import app from "../../app"; // your express app instance

describe("Memory API Routes", () => {
  let token = "valid-jwt-token-for-test-user"; // Use a valid JWT or mock auth

  it("should require authentication", async () => {
    const res = await request(app).get("/api/memory");
    expect(res.statusCode).toBe(401);
  });

  it("should get memories", async () => {
    const res = await request(app)
      .get("/api/memory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.memories)).toBe(true);
  });

  it("should post a new memory", async () => {
    const res = await request(app)
      .post("/api/memory")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Test memory content" });

    expect(res.statusCode).toBe(200);
    expect(res.body.memory).toHaveProperty("content", "Test memory content");
  });

  // Additional tests for update, delete, etc. can be added similarly
});
