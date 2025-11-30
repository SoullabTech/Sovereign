import request from "supertest";
import express from "express";
import ichingRouter from "../routes/iching.routes";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/iching", ichingRouter);

describe("I Ching API Routes", () => {
  describe("GET /api/iching/astro", () => {
    test("returns I Ching profile for valid birth date query param", async () => {
      const response = await request(app)
        .get("/api/iching/astro")
        .query({ birthDate: "1990-06-15" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("profile");
      expect(response.body).toHaveProperty("birthArchetype");
      expect(response.body).toHaveProperty("currentArchetype");

      // Verify profile structure
      const { profile } = response.body;
      expect(profile).toHaveProperty("baseNumber");
      expect(profile).toHaveProperty("birthTrigram");
      expect(profile).toHaveProperty("birthElement");
      expect(profile).toHaveProperty("currentTrigramCycle");
      expect(profile).toHaveProperty("hexagramMapping");
      expect(profile).toHaveProperty("yearlyGuidance");

      expect(typeof profile.baseNumber).toBe("number");
      expect(profile.baseNumber).toBeGreaterThanOrEqual(1);
      expect(profile.baseNumber).toBeLessThanOrEqual(9);
      expect(Array.isArray(profile.hexagramMapping)).toBe(true);
    });

    test("handles missing birth date parameter", async () => {
      const response = await request(app).get("/api/iching/astro");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Birth date is required");
    });

    test("handles invalid birth date format", async () => {
      const response = await request(app)
        .get("/api/iching/astro")
        .query({ birthDate: "invalid-date" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("accepts ISO datetime format", async () => {
      const response = await request(app)
        .get("/api/iching/astro")
        .query({ birthDate: "1985-12-25T14:30:00Z" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/iching/astro", () => {
    test("returns I Ching profile for valid birth date in body", async () => {
      const response = await request(app)
        .post("/api/iching/astro")
        .send({ birthDate: "1975-03-15" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("profile");
      expect(response.body).toHaveProperty("birthArchetype");
      expect(response.body).toHaveProperty("currentArchetype");
      expect(response.body).toHaveProperty("selfCompatibility");

      // Verify self-compatibility calculation
      const { selfCompatibility } = response.body;
      expect(selfCompatibility).toHaveProperty("compatibility");
      expect(selfCompatibility).toHaveProperty("description");
      expect(typeof selfCompatibility.compatibility).toBe("number");
      expect(selfCompatibility.compatibility).toBeGreaterThanOrEqual(0);
      expect(selfCompatibility.compatibility).toBeLessThanOrEqual(100);
    });

    test("handles missing birth date in body", async () => {
      const response = await request(app).post("/api/iching/astro").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid request data");
    });

    test("handles invalid birth date in body", async () => {
      const response = await request(app)
        .post("/api/iching/astro")
        .send({ birthDate: "not-a-date" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/iching/compatibility", () => {
    test("calculates compatibility between valid trigrams", async () => {
      const response = await request(app)
        .post("/api/iching/compatibility")
        .send({
          trigram1: "Thunder",
          trigram2: "Wind",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("trigram1");
      expect(response.body).toHaveProperty("trigram2");
      expect(response.body).toHaveProperty("compatibility");

      // Verify trigram details
      expect(response.body.trigram1.name).toBe("Thunder");
      expect(response.body.trigram2.name).toBe("Wind");

      // Verify compatibility calculation
      const { compatibility } = response.body;
      expect(compatibility).toHaveProperty("compatibility");
      expect(compatibility).toHaveProperty("description");
      expect(typeof compatibility.compatibility).toBe("number");
    });

    test("handles invalid trigram names", async () => {
      const response = await request(app)
        .post("/api/iching/compatibility")
        .send({
          trigram1: "Invalid",
          trigram2: "Thunder",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid trigram names");
    });

    test("handles missing trigram parameters", async () => {
      const response = await request(app)
        .post("/api/iching/compatibility")
        .send({ trigram1: "Thunder" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid request data");
    });

    test("calculates same trigram compatibility", async () => {
      const response = await request(app)
        .post("/api/iching/compatibility")
        .send({
          trigram1: "Heaven",
          trigram2: "Heaven",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.compatibility.compatibility).toBeGreaterThan(80);
    });
  });

  describe("GET /api/iching/trigrams", () => {
    test("returns all trigram archetypes", async () => {
      const response = await request(app).get("/api/iching/trigrams");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("trigrams");
      expect(response.body).toHaveProperty("count");
      expect(Array.isArray(response.body.trigrams)).toBe(true);

      // Should have 8 unique trigrams (Thunder appears twice but archetype is same)
      expect(response.body.trigrams.length).toBeGreaterThan(0);
      expect(response.body.count).toBe(response.body.trigrams.length);

      // Verify trigram structure
      const trigram = response.body.trigrams[0];
      expect(trigram).toHaveProperty("name");
      expect(trigram).toHaveProperty("symbol");
      expect(trigram).toHaveProperty("element");
      expect(trigram).toHaveProperty("direction");
      expect(trigram).toHaveProperty("archetype");
      expect(trigram).toHaveProperty("description");
      expect(trigram).toHaveProperty("keywords");
      expect(Array.isArray(trigram.keywords)).toBe(true);
    });
  });

  describe("GET /api/iching/yearly-guidance", () => {
    test("returns guidance for current year by default", async () => {
      const response = await request(app).get("/api/iching/yearly-guidance");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("year");
      expect(response.body).toHaveProperty("trigram");
      expect(response.body).toHaveProperty("guidance");
      expect(response.body).toHaveProperty("fractalPhase");
      expect(response.body).toHaveProperty("cyclePosition");

      expect(response.body.year).toBe(new Date().getFullYear());
      expect(typeof response.body.guidance).toBe("string");
      expect(response.body.guidance.length).toBeGreaterThan(10);
    });

    test("returns guidance for specific year", async () => {
      const testYear = 2000;
      const response = await request(app)
        .get("/api/iching/yearly-guidance")
        .query({ year: testYear });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.year).toBe(testYear);
    });

    test("handles invalid year parameter", async () => {
      const response = await request(app)
        .get("/api/iching/yearly-guidance")
        .query({ year: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Invalid year");
    });

    test("handles year out of range", async () => {
      const response = await request(app)
        .get("/api/iching/yearly-guidance")
        .query({ year: 1800 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("between 1900-2100");
    });

    test("handles future year", async () => {
      const response = await request(app)
        .get("/api/iching/yearly-guidance")
        .query({ year: 2050 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.year).toBe(2050);
    });
  });

  describe("Error handling", () => {
    test("handles server errors gracefully", async () => {
      // Test routes exist and don't return 404
      const routes = [
        "/api/iching/astro?birthDate=2000-01-01",
        "/api/iching/trigrams",
        "/api/iching/yearly-guidance",
      ];

      for (const route of routes) {
        const response = await request(app).get(route);
        expect(response.status).not.toBe(404);
      }
    });
  });

  describe("Response format validation", () => {
    test("all successful responses include success field", async () => {
      const routes = [
        {
          method: "get",
          path: "/api/iching/astro",
          query: { birthDate: "1990-01-01" },
        },
        { method: "get", path: "/api/iching/trigrams" },
        { method: "get", path: "/api/iching/yearly-guidance" },
        {
          method: "post",
          path: "/api/iching/astro",
          body: { birthDate: "1990-01-01" },
        },
        {
          method: "post",
          path: "/api/iching/compatibility",
          body: { trigram1: "Thunder", trigram2: "Fire" },
        },
      ];

      for (const route of routes) {
        const req = request(app)[route.method](route.path);

        if (route.query) req.query(route.query);
        if (route.body) req.send(route.body);

        const response = await req;

        if (response.status === 200) {
          expect(response.body).toHaveProperty("success");
          expect(response.body.success).toBe(true);
        }
      }
    });

    test("all error responses include success and error fields", async () => {
      const errorRoutes = [
        { method: "get", path: "/api/iching/astro" }, // Missing birthDate
        { method: "post", path: "/api/iching/astro", body: {} }, // Missing birthDate
        {
          method: "post",
          path: "/api/iching/compatibility",
          body: { trigram1: "Invalid" },
        }, // Invalid trigram
        {
          method: "get",
          path: "/api/iching/yearly-guidance",
          query: { year: "invalid" },
        }, // Invalid year
      ];

      for (const route of errorRoutes) {
        const req = request(app)[route.method](route.path);

        if (route.query) req.query(route.query);
        if (route.body) req.send(route.body);

        const response = await req;

        if (response.status >= 400) {
          expect(response.body).toHaveProperty("success");
          expect(response.body.success).toBe(false);
          expect(response.body).toHaveProperty("error");
          expect(typeof response.body.error).toBe("string");
        }
      }
    });
  });
});
