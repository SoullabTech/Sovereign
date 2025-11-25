"use strict";
// File Memory Integration Service
// Handles file-based memory storage for development/testing
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileMemoryIntegration = void 0;
class FileMemoryIntegration {
    constructor() {
        this.memories = new Map();
        // Initialize file memory system
    }
    async storeMemory(userId, memory) {
        const userMemories = this.memories.get(userId) || [];
        userMemories.push({
            ...memory,
            timestamp: new Date().toISOString()
        });
        this.memories.set(userId, userMemories);
    }
    async getMemories(userId, limit = 10) {
        const userMemories = this.memories.get(userId) || [];
        return userMemories.slice(-limit);
    }
    async searchMemories(userId, query) {
        const userMemories = this.memories.get(userId) || [];
        return userMemories.filter(memory => JSON.stringify(memory).toLowerCase().includes(query.toLowerCase()));
    }
    async clearMemories(userId) {
        this.memories.delete(userId);
    }
}
exports.FileMemoryIntegration = FileMemoryIntegration;
//# sourceMappingURL=FileMemoryIntegration.js.map