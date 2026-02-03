"use strict";
// oracle-backend/src/types/session.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSession = startSession;
exports.endSession = endSession;
exports.getSessionStats = getSessionStats;
const supabaseClient_1 = require("../lib/supabaseClient");
/**
 * Starts a new session for a user and stores session details.
 */
async function startSession(clientId, metadata) {
    const { data, error } = await supabaseClient_1.supabase
        .from("sessions")
        .insert([
        {
            clientId,
            startTime: new Date().toISOString(),
            meta: metadata,
            status: "active",
        },
    ])
        .select()
        .single();
    if (error || !data) {
        throw new Error(error?.message || "Failed to start session");
    }
    return {
        id: data.id,
        clientId,
        startTime: data.startTime,
        meta: data.meta,
        status: data.status,
    };
}
/**
 * Ends an active session for a user and updates session status.
 */
async function endSession(sessionId) {
    const { data, error } = await supabaseClient_1.supabase
        .from("sessions")
        .update({ status: "completed", endTime: new Date().toISOString() })
        .eq("id", sessionId)
        .select()
        .single();
    if (error || !data) {
        throw new Error(error?.message || "Failed to end session");
    }
    return {
        id: data.id,
        clientId: data.clientId,
        startTime: data.startTime,
        meta: data.meta,
        status: data.status,
        endTime: data.endTime,
    };
}
/**
 * Retrieves session statistics, such as total active/completed sessions.
 */
async function getSessionStats(clientId) {
    const { data, error } = await supabaseClient_1.supabase
        .from("sessions")
        .select("*")
        .eq("clientId", clientId);
    if (error) {
        throw new Error(error?.message || "Failed to retrieve session stats");
    }
    const totalSessions = data.length;
    const activeSessions = data.filter((session) => session.status === "active").length;
    const completedSessions = totalSessions - activeSessions;
    const lastSessionTime = data[totalSessions - 1]?.startTime || "";
    return {
        totalSessions,
        activeSessions,
        completedSessions,
        lastSessionTime,
        clientId,
    };
}
