import { describe, it, expect, vi, beforeAll } from "vitest";
import { getOracleResponse } from "@/services/oracleService";
import * as aiService from "@/services/aiService";

vi.mock("@/services/aiService");

describe("oracleService integration", () => {
  beforeAll(() => {
    vi.mocked(aiService.getAIResponse).mockResolvedValue({
      content: "Integrated response",
      provider: "openai",
      model: "gpt-4",
      confidence: 0.88,
      metadata: { tokens: 120 },
    });
  });

  it("should return a well-formed oracle response", async () => {
    const input = "Tell me something wise";
    const userId = "test-user";

    const response = await getOracleResponse(input, userId);

    expect(response.content).toMatch(/Integrated/);
    expect(response.provider).toBe("openai");
    expect(response.metadata.tokens).toBeGreaterThan(0);
    expect(aiService.getAIResponse).toHaveBeenCalled();
  });
});
