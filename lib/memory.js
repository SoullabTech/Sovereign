"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memory = exports.MayaMemorySystem = void 0;
const mem0ai_1 = require("mem0ai");
class MayaMemorySystem {
    constructor(config = {}) {
        this.client = new mem0ai_1.MemoryClient({
            apiKey: config.apiKey || process.env.MEM0_API_KEY,
            orgId: config.orgId,
            projectId: config.projectId
        });
    }
    async addMemory(userId, message, metadata) {
        try {
            return await this.client.add(message, {
                userId,
                metadata
            });
        }
        catch (error) {
            console.error('Failed to add memory:', error);
            return null;
        }
    }
    async getHistory(userId, limit = 20) {
        try {
            const memories = await this.client.search(userId, {
                limit
            });
            return memories;
        }
        catch (error) {
            console.error('Failed to retrieve memories:', error);
            return [];
        }
    }
    async updateMemory(memoryId, newContent) {
        try {
            return await this.client.update(memoryId, newContent);
        }
        catch (error) {
            console.error('Failed to update memory:', error);
            return null;
        }
    }
    async deleteMemory(memoryId) {
        try {
            return await this.client.delete(memoryId);
        }
        catch (error) {
            console.error('Failed to delete memory:', error);
            return false;
        }
    }
    async searchMemories(userId, query, limit = 10) {
        try {
            return await this.client.search(query, {
                userId,
                limit
            });
        }
        catch (error) {
            console.error('Failed to search memories:', error);
            return [];
        }
    }
}
exports.MayaMemorySystem = MayaMemorySystem;
// Singleton instance
exports.memory = new MayaMemorySystem();
//# sourceMappingURL=memory.js.map