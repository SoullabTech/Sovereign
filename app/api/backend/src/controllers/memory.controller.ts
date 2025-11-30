// src/controllers/memory.controller.ts

import { Request, Response } from "express";
import { MemoryService } from "../services/memoryService";
import { memoryCreateSchema, sharedSpaceSchema } from "../schemas/memory";

const service = new MemoryService();

export async function storeMemory(req: Request, res: Response) {
  try {
    const parse = memoryCreateSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ error: "Invalid memory data", details: parse.error.format() });
    }

    const userId = (req as any).user?.id || "anonymous";
    const memoryData = {
      ...parse.data,
      userId,
      content: parse.data.content || "No content provided",
    };
    const memory = await service.storeMemory(memoryData);
    return res.status(200).json(memory);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to store memory", details: error });
  }
}

export async function getMemories(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const memories = await service.retrieveMemories(userId);
    return res.status(200).json(memories);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to retrieve memories", details: error });
  }
}

export async function createSharedSpace(req: Request, res: Response) {
  try {
    const parse = sharedSpaceSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({
          error: "Invalid shared space data",
          details: parse.error.format(),
        });
    }

    const userId = (req as any).user?.id || "anonymous";
    const space = await service.createSharedSpace(
      userId,
      parse.data.name,
      parse.data.participants,
    );
    return res.status(200).json(space);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to create shared space", details: error });
  }
}

export async function listSharedSpaces(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const spaces = await service.listSharedSpaces(userId);
    return res.status(200).json(spaces);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to list shared spaces", details: error });
  }
}
