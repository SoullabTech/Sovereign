import memoryModule from "../../core/utils/memoryModule";
import { supabase } from "../../lib/supabaseClient";

jest.mock("../../lib/supabaseClient");

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const testTag = {
  userId: "test-user",
  symbol: "dream",
  agent: "dream-agent",
  timestamp: new Date().toISOString(),
  metadata: { relevance: "high" },
};

describe("MemoryModule", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should store a symbolic tag", async () => {
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({ error: null }),
    } as any);

    await expect(memoryModule.storeTag(testTag)).resolves.toBeUndefined();
  });

  it("should retrieve all tags for a user", async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          order: jest
            .fn()
            .mockResolvedValueOnce({ data: [testTag], error: null }),
        }),
      }),
    } as any);

    const tags = await memoryModule.getAllSymbolicTags("test-user");
    expect(tags).toEqual([testTag]);
  });

  it("should retrieve entries by symbol", async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          ilike: jest
            .fn()
            .mockResolvedValueOnce({ data: [testTag], error: null }),
        }),
      }),
    } as any);

    const tags = await memoryModule.getEntriesBySymbol("test-user", "dream");
    expect(tags.length).toBe(1);
  });
});
