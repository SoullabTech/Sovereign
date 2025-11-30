import request from "supertest";
import express from "express";
import fourPillarsRouter from "../routes/astrology/fourPillars.routes";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/astrology/four-pillars", fourPillarsRouter);

describe("Four Pillars API Routes", () => {
  describe("POST /api/astrology/four-pillars", () => {
    test("returns Four Pillars profile for valid birth date", async () => {
      const response = await request(app)
        .post("/api/astrology/four-pillars")
        .send({
          birth: "2000-01-01T12:00:00Z",
          tzOffsetMinutes: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("profile");
      expect(response.body).toHaveProperty("rituals");
      expect(response.body).toHaveProperty("insights");

      // Verify profile structure
      const { profile } = response.body;
      expect(profile).toHaveProperty("year");
      expect(profile).toHaveProperty("month");
      expect(profile).toHaveProperty("day");
      expect(profile).toHaveProperty("hour");
      expect(profile).toHaveProperty("elementTally");
      expect(profile).toHaveProperty("dominant");
      expect(profile).toHaveProperty("deficient");
      expect(profile).toHaveProperty("hexagram");

      // Verify insights structure
      const { insights } = response.body;
      expect(insights).toHaveProperty("balanceScore");
      expect(insights).toHaveProperty("personality");
      expect(insights).toHaveProperty("affirmations");
      expect(insights).toHaveProperty("dailyRitual");
      expect(insights).toHaveProperty("seasonalRitual");

      // Verify rituals is an array
      expect(Array.isArray(response.body.rituals)).toBe(true);
    });

    test("handles missing birth date", async () => {
      const response = await request(app)
        .post("/api/astrology/four-pillars")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid request data");
    });

    test("handles invalid birth date format", async () => {
      const response = await request(app)
        .post("/api/astrology/four-pillars")
        .send({
          birth: "invalid-date",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("uses default timezone offset when not provided", async () => {
      const response = await request(app)
        .post("/api/astrology/four-pillars")
        .send({
          birth: "1990-06-15T14:30:00Z",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("handles different timezone offsets", async () => {
      const response1 = await request(app)
        .post("/api/astrology/four-pillars")
        .send({
          birth: "1990-06-15T14:30:00Z",
          tzOffsetMinutes: 0,
        });

      const response2 = await request(app)
        .post("/api/astrology/four-pillars")
        .send({
          birth: "1990-06-15T14:30:00Z",
          tzOffsetMinutes: 480, // +8 hours
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Profiles should potentially be different due to timezone
      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });
  });

  describe("POST /api/astrology/four-pillars/ritual-sequence", () => {
    test("generates ritual sequence for valid input", async () => {
      const response = await request(app)
        .post("/api/astrology/four-pillars/ritual-sequence")
        .send({
          birth: "1985-09-22T08:15:00Z",
          duration: 30,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("sequence");
      expect(response.body).toHaveProperty("totalDuration");
      expect(response.body).toHaveProperty("profile");

      expect(Array.isArray(response.body.sequence)).toBe(true);
      expect(typeof response.body.totalDuration).toBe("number");
      expect(response.body.totalDuration).toBeLessThanOrEqual(30);
    });

    test("handles missing birth date in ritual sequence", async () => {
      const response = await request(app)
        .post("/api/astrology/four-pillars/ritual-sequence")
        .send({
          duration: 20,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Birth date is required");
    });

    test("uses default duration when not provided", async () => {
      const response = await request(app)
        .post("/api/astrology/four-pillars/ritual-sequence")
        .send({
          birth: "1992-12-03T16:45:00Z",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.totalDuration).toBeLessThanOrEqual(30); // Default duration
    });
  });

  describe("GET /api/astrology/four-pillars/daily", () => {
    test("returns daily guidance for valid birth date", async () => {
      const response = await request(app)
        .get("/api/astrology/four-pillars/daily")
        .query({
          birth: "1988-04-10T11:30:00Z",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("dailyGuidance");
      expect(response.body).toHaveProperty("profile");

      const { dailyGuidance } = response.body;
      expect(dailyGuidance).toHaveProperty("dailyRitual");
      expect(dailyGuidance).toHaveProperty("seasonalRitual");
      expect(dailyGuidance).toHaveProperty("organClock");
      expect(dailyGuidance).toHaveProperty("elementFocus");
      expect(dailyGuidance).toHaveProperty("affirmation");
    });

    test("handles missing birth date in daily guidance", async () => {
      const response = await request(app).get(
        "/api/astrology/four-pillars/daily",
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Birth date is required");
    });

    test("handles timezone offset in daily guidance", async () => {
      const response = await request(app)
        .get("/api/astrology/four-pillars/daily")
        .query({
          birth: "1993-07-25T20:00:00Z",
          tzOffsetMinutes: -300, // -5 hours
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/astrology/four-pillars/elements", () => {
    test("returns element information", async () => {
      const response = await request(app).get(
        "/api/astrology/four-pillars/elements",
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("elements");
      expect(response.body).toHaveProperty("cycles");

      const { elements } = response.body;
      const expectedElements = ["Wood", "Fire", "Earth", "Metal", "Water"];

      expectedElements.forEach((element) => {
        expect(elements).toHaveProperty(element);
        expect(elements[element]).toHaveProperty("season");
        expect(elements[element]).toHaveProperty("direction");
        expect(elements[element]).toHaveProperty("emotion");
        expect(elements[element]).toHaveProperty("organ");
        expect(elements[element]).toHaveProperty("qualities");
        expect(elements[element]).toHaveProperty("color");
        expect(elements[element]).toHaveProperty("sound");
      });

      expect(response.body.cycles).toHaveProperty("generation");
      expect(response.body.cycles).toHaveProperty("destruction");
    });
  });

  describe("Error handling", () => {
    test("handles server errors gracefully", async () => {
      // This test would need to mock a service failure
      // For now, just verify the route exists
      const response = await request(app)
        .post("/api/astrology/four-pillars")
        .send({
          birth: "2000-01-01T12:00:00Z",
        });

      expect(response.status).not.toBe(404);
    });
  });
});
