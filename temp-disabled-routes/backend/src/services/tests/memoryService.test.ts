import { memoryService } from "../memoryService";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase");

describe("memoryService", () => {
  const userId = "test-user-id";
  const memoryId = "test-memory-id";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should store a new memory", async () => {
    const mockInsert = jest
      .fn()
      .mockResolvedValue({
        data: { id: memoryId, content: "test" },
        error: null,
      });
    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
      single: jest
        .fn()
        .mockResolvedValue({
          data: { id: memoryId, content: "test" },
          error: null,
        }),
    });

    const memory = await memoryService.store(userId, "test");
    expect(memory).toEqual({ id: memoryId, content: "test" });
    expect(mockInsert).toHaveBeenCalled();
  });

  it("should return null if store fails", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest
        .fn()
        .mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: null, error: { message: "fail" } }),
        }),
    });

    const memory = await memoryService.store(userId, "test");
    expect(memory).toBeNull();
  });

  it("should recall memories", async () => {
    const memories = [{ id: memoryId, content: "memory1" }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: memories, error: null }),
    });

    const result = await memoryService.recall(userId);
    expect(result).toEqual(memories);
  });

  it("should return empty array if recall fails", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "fail" } }),
    });

    const result = await memoryService.recall(userId);
    expect(result).toEqual([]);
  });

  it("should update memory successfully", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest
        .fn()
        .mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    const success = await memoryService.update(memoryId, "new content");
    expect(success).toBe(true);
  });

  it("should return false if update fails", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest
        .fn()
        .mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
        }),
    });

    const success = await memoryService.update(memoryId, "new content");
    expect(success).toBe(false);
  });

  it("should delete memory successfully", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest
        .fn()
        .mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    });

    const success = await memoryService.delete(memoryId);
    expect(success).toBe(true);
  });

  it("should return false if delete fails", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest
        .fn()
        .mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
        }),
    });

    const success = await memoryService.delete(memoryId);
    expect(success).toBe(false);
  });
});
