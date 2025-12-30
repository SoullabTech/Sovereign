"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleLogger = void 0;
exports.logOracleInsight = logOracleInsight;
exports.getInsightHistory = getInsightHistory;
exports.getInsightStats = getInsightStats;
const supabaseClient_1 = require("../lib/supabaseClient");
const logger_1 = __importDefault(require("./logger"));
// 🧠 1. Log an insight
async function logOracleInsight(entry) {
    try {
        const { data, error } = await supabaseClient_1.supabase
            .from("insight_history")
            .insert({
            anon_id: entry.anon_id,
            archetype: entry.archetype,
            element: entry.element,
            content: entry.insight.message,
            metadata: {
                raw_input: entry.insight.raw_input,
                emotion: entry.emotion,
                phase: entry.phase,
                context: entry.context || [],
            },
        })
            .select("id")
            .single();
        if (error || !data)
            throw error || new Error("No data returned");
        logger_1.default.info("[OracleLog] Insight logged", { id: data.id, ...entry });
        return { id: data.id };
    }
    catch (err) {
        logger_1.default.error("Failed to log Oracle insight:", {
            error: err.message || err,
        });
        throw err;
    }
}
// 📜 2. Retrieve insight history for user
async function getInsightHistory(userId, { type, limit = 50, offset = 0, }) {
    try {
        const query = supabaseClient_1.supabase
            .from("insight_history")
            .select("*")
            .eq("anon_id", userId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);
        if (type) {
            query.eq("metadata->>phase", type);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data || [];
    }
    catch (err) {
        logger_1.default.error("Failed to retrieve insight history", {
            error: err.message || err,
        });
        throw err;
    }
}
// 📊 3. Aggregate stats (insights per element or phase)
async function getInsightStats(userId) {
    try {
        const { data, error } = await supabaseClient_1.supabase
            .from("insight_history")
            .select("element, metadata->>phase")
            .eq("anon_id", userId);
        if (error)
            throw error;
        const stats = {
            total: data.length,
            byElement: {},
            byPhase: {},
        };
        for (const row of data) {
            const el = row.element;
            const phase = row["metadata->>phase"];
            stats.byElement[el] = (stats.byElement[el] || 0) + 1;
            stats.byPhase[phase] = (stats.byPhase[phase] || 0) + 1;
        }
        return stats;
    }
    catch (err) {
        logger_1.default.error("Failed to get insight stats", { error: err.message || err });
        throw err;
    }
}
// 📦 Export all in a grouped object if preferred
exports.oracleLogger = {
    logInsight: logOracleInsight,
    getInsightHistory,
    getInsightStats,
};
