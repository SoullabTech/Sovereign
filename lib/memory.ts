// import { MemoryClient } from "mem0ai"; // TODO: Add to package.json
const MemoryClient: any = {}; // Temporary stub

export interface MemoryConfig {
  apiKey?: string;
  orgId?: string;
  projectId?: string;
}

export class MayaMemorySystem {
  private client: MemoryClient;

  constructor(config: MemoryConfig = {}) {
    this.client = new MemoryClient({
      apiKey: config.apiKey || process.env.MEM0_API_KEY!,
      orgId: config.orgId,
      projectId: config.projectId
    });
  }

  async addMemory(userId: string, message: string, metadata?: Record<string, any>) {
    try {
      return await this.client.add(message, {
        userId,
        metadata
      });
    } catch (error) {
      console.error('Failed to add memory:', error);
      return null;
    }
  }

  async getHistory(userId: string, limit: number = 20) {
    try {
      const memories = await this.client.search(userId, {
        limit
      });
      return memories;
    } catch (error) {
      console.error('Failed to retrieve memories:', error);
      return [];
    }
  }

  async updateMemory(memoryId: string, newContent: string) {
    try {
      return await this.client.update(memoryId, newContent);
    } catch (error) {
      console.error('Failed to update memory:', error);
      return null;
    }
  }

  async deleteMemory(memoryId: string) {
    try {
      return await this.client.delete(memoryId);
    } catch (error) {
      console.error('Failed to delete memory:', error);
      return false;
    }
  }

  async searchMemories(userId: string, query: string, limit: number = 10) {
    try {
      return await this.client.search(query, {
        userId,
        limit
      });
    } catch (error) {
      console.error('Failed to search memories:', error);
      return [];
    }
  }
}

// Singleton instance
export const memory = new MayaMemorySystem();