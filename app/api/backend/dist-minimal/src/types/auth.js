"use strict";
// oracle-backend/src/types/auth.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refreshSession = refreshSession;
exports.logout = logout;
const supabaseClient_1 = require("../lib/supabaseClient"); // Use your existing supabase client path
/**
 * Handles user login and returns session tokens.
 */
async function login(authRequest) {
    const { email, password } = authRequest;
    const { data: { user, session }, error, } = await supabaseClient_1.supabase.auth.signInWithPassword({ email, password });
    if (error || !user || !session) {
        throw new Error(error?.message || "Authentication failed");
    }
    return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}
/**
 * Refreshes a user session using a refresh token.
 */
async function refreshSession(refreshToken) {
    const { data: { session }, error, } = await supabaseClient_1.supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !session || !session.user) {
        throw new Error(error?.message || "Invalid refresh token");
    }
    return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: {
            id: session.user.id,
            email: session.user.email || "",
        },
    };
}
/**
 * Signs out the current user.
 */
async function logout() {
    const { error } = await supabaseClient_1.supabase.auth.signOut();
    if (error) {
        throw new Error(error.message);
    }
}
