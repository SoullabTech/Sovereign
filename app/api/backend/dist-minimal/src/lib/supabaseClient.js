"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.saveJournalEntry = saveJournalEntry;
exports.getJournalEntries = getJournalEntries;
exports.getSymbolThreads = getSymbolThreads;
exports.semanticSearch = semanticSearch;
var supabase_1 = require("./supabase");
Object.defineProperty(exports, "supabase", { enumerable: true, get: function () { return supabase_1.supabase; } });
const supabase_2 = require("./supabase");
const logger_1 = require("@/utils/logger");
// Create error helper - simplified for build fix
function createError(message, status) {
    const error = new Error(message);
    error.statusCode = status;
    return error;
}
async function saveJournalEntry(entry) {
    const payload = {
        user_id: entry.userId,
        content: entry.content,
        type: entry.type,
        symbols: entry.symbols,
        timestamp: entry.timestamp,
        elemental_tag: entry.elementalTag,
        archetype_tag: entry.archetypeTag,
        metadata: entry.petalSnapshot
            ? { petalSnapshot: entry.petalSnapshot }
            : null,
    };
    const { data, error } = await supabase_2.supabase
        .from("journal_entries")
        .insert([payload]);
    if (error) {
        logger_1.logger.error(`Failed to save journal entry: ${error.message}`);
        throw createError("Failed to save journal entry", 500);
    }
    return data;
}
async function getJournalEntries(userId) {
    const { data, error } = await supabase_2.supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });
    if (error) {
        logger_1.logger.error(`Failed to fetch journal entries: ${error.message}`);
        throw createError("Failed to fetch journal entries", 500);
    }
    return data;
}
async function getSymbolThreads(userId) {
    const { data, error } = await supabase_2.supabase
        .from("oracle_memories")
        .select("*")
        .eq("userId", userId)
        .order("timestamp", { ascending: false });
    if (error) {
        logger_1.logger.error(`Failed to fetch memory threads: ${error.message}`);
        throw createError("Failed to fetch memory threads", 500);
    }
    return data;
}
async function semanticSearch(userId, query) {
    const { data, error } = await supabase_2.supabase.rpc("semantic_memory_search", {
        user_id: userId,
        query_text: query,
    });
    if (error) {
        logger_1.logger.error(`Semantic search failed: ${error.message}`);
        throw createError("Semantic search failed", 500);
    }
    return data;
}
