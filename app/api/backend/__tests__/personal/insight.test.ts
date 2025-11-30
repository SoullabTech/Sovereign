import handler from "@/api/oracle/personal/insight";
import { createMocks } from "node-mocks-http";

describe("Personal Oracle Insight API", () => {
  it("returns archetypal insight for Fire 1", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: { "x-user-id": "test-user" },
      body: {
        phase: "Fire 1",
        reflection: "I am sensing a new calling",
      },
    });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res._getStatusCode()).toBe(200);
    expect(data.archetype).toBeDefined();
    expect(data.message).toContain("🌀");
    expect(data.card).toMatch(/fire-card/);
  });

  it("returns mystery message for unknown phase", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: { "x-user-id": "test-user" },
      body: {
        phase: "Unknown Phase",
      },
    });

    await handler(req, res);
    const data = res._getJSONData();

    expect(data.message).toContain("mystery");
    expect(data.archetype).toBe("Unknown");
  });
});
