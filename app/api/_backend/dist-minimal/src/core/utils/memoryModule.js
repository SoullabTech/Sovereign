"use strict";
// src/utils/memoryModule.ts
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("../lib/supabaseClient");
class MemoryModule {
    /**
     * Stores a symbolic tag in Supabase.
     */
    async storeTag(tag) {
        const { error } = await supabaseClient_1.supabase.from("symbolic_tags").insert({
            user_id: tag.userId,
            symbol: tag.symbol,
            agent: tag.agent,
            timestamp: tag.timestamp ?? new Date().toISOString(),
            metadata: tag.metadata ?? {},
            ai_response: tag.aiResponse ?? null,
        });
        if (error) {
            console.error("❌ Failed to store symbolic tag:", error);
            throw error;
        }
    }
    /**
     * Retrieves all symbolic tags for a user.
     */
    async getAllSymbolicTags(userId) {
        const { data, error } = await supabaseClient_1.supabase
            .from("symbolic_tags")
            .select("*")
            .eq("user_id", userId)
            .order("timestamp", { ascending: false });
        if (error) {
            console.error("❌ Failed to fetch all symbolic tags:", error);
            throw error;
        }
        return (data ?? []);
    }
    /**
     * Filters tags by symbol name.
     */
    async getEntriesBySymbol(userId, symbol) {
        const { data, error } = await supabaseClient_1.supabase
            .from("symbolic_tags")
            .select("*")
            .eq("user_id", userId)
            .ilike("symbol", symbol);
        if (error) {
            console.error("❌ Error fetching entries by symbol:", error);
            throw error;
        }
        return data;
    }
    /**
     * Filters tags by agent name.
     */
    async getEntriesByAgent(userId, agent) {
        const { data, error } = await supabaseClient_1.supabase
            .from("symbolic_tags")
            .select("*")
            .eq("user_id", userId)
            .ilike("agent", agent);
        if (error) {
            console.error("❌ Error fetching entries by agent:", error);
            throw error;
        }
        return data;
    }
    /**
     * Filters tags after a specific timestamp.
     */
    async getEntriesSince(userId, dateISO) {
        const { data, error } = await supabaseClient_1.supabase
            .from("symbolic_tags")
            .select("*")
            .eq("user_id", userId)
            .gte("timestamp", dateISO);
        if (error) {
            console.error("❌ Error fetching entries since:", error);
            throw error;
        }
        return data;
    }
}
const memoryModule = new MemoryModule();
exports.default = memoryModule;
