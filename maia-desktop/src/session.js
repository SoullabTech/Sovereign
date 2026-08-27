// MAIA Desktop — member session.
//
// DESKTOP-CONVERSATION-01. ⛔ Reuses the EXISTING contract. No Desktop-only
// identity is invented, and no server auth is weakened to make Desktop work.
//
// The census (MAIA-D00 §5.1) established the whole path already exists:
//   POST /api/members/signin  →  { token: session.sessionToken }
//   every request  →  x-session-token: <token>
//   getMemberFromRequest resolves identity from auth_sessions ONLY
//
// So Desktop is one more header-auth client, exactly like Safari/iOS when ITP
// blocks cookies. Nothing here can make the server trust an identity it did not
// verify — `x-member-id` is deliberately never sent, because the server treats
// it as a claim that must MATCH the session or the request is rejected.
//
// ⛔ TOKEN CUSTODY. The token lives in main, in Electron's encrypted storage
// where the OS provides it. It is never exposed across the bridge — the renderer
// can ask whether a session exists and who it belongs to, never what the token
// is. A renderer that could read the token could exfiltrate it.

'use strict';

const path = require('node:path');
const fs = require('node:fs');

const DEFAULT_BASE = 'https://soullab.life';

function createSession({ app, safeStorage, fetchImpl } = {}) {
  const doFetch = fetchImpl || ((...a) => fetch(...a));
  const baseUrl = (process.env.MAIA_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
  const file = () => path.join(app.getPath('userData'), 'session.bin');

  let token = null;
  let member = null;

  function persist() {
    try {
      if (!token) { fs.rmSync(file(), { force: true }); return; }
      const payload = JSON.stringify({ token, member });
      const canEncrypt = safeStorage && safeStorage.isEncryptionAvailable();
      // The marker records WHICH form is on disk, so a plaintext fallback can
      // never be silently mistaken for an encrypted one.
      const blob = canEncrypt
        ? Buffer.concat([Buffer.from('E1'), safeStorage.encryptString(payload)])
        : Buffer.concat([Buffer.from('P1'), Buffer.from(payload, 'utf8')]);
      fs.mkdirSync(path.dirname(file()), { recursive: true });
      fs.writeFileSync(file(), blob, { mode: 0o600 });
    } catch { /* a session that fails to persist still works this run */ }
  }

  function restore() {
    try {
      const blob = fs.readFileSync(file());
      const marker = blob.subarray(0, 2).toString();
      const body = blob.subarray(2);
      const payload = marker === 'E1'
        ? safeStorage.decryptString(body)
        : marker === 'P1' ? body.toString('utf8') : null;
      if (!payload) return;
      const parsed = JSON.parse(payload);
      token = parsed.token || null;
      member = parsed.member || null;
    } catch { token = null; member = null; }
  }

  async function signIn(username, password) {
    const res = await doFetch(`${baseUrl}/api/members/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON error body */ }

    if (!res.ok || !data || data.success === false) {
      return { ok: false, error: (data && data.error) || `sign-in failed (${res.status})` };
    }
    // The token may sit at the top level or inside the member envelope depending
    // on the route's shape; take whichever is present rather than assuming.
    const t = data.token || (data.member && data.member.token) || (data.session && data.session.token);
    if (!t) return { ok: false, error: 'sign-in succeeded but returned no session token' };

    token = t;
    member = {
      name: (data.member && (data.member.name || data.member.preferred_name)) || username,
      username,
    };
    persist();
    return { ok: true, member };
  }

  function signOut() { token = null; member = null; persist(); }

  /** Authenticated fetch. Adds the session header and nothing else. */
  async function authedFetch(pathname, init = {}) {
    if (!token) return { ok: false, status: 401, error: 'not signed in' };
    const headers = { ...(init.headers || {}), 'x-session-token': token };
    const res = await doFetch(`${baseUrl}${pathname}`, { ...init, headers });
    if (res.status === 401) {
      // ⭐ REFUSE, never degrade. `/api/between/chat` falls back to `anon:` for an
      // unauthenticated request; for a companion that is the wrong failure — the
      // member would keep talking while MAIA quietly became a stranger. Desktop
      // drops the session and says so. (Founder decision pending; this is the
      // safer default and is easy to overturn.)
      signOut();
      return { ok: false, status: 401, error: 'session expired — please sign in again' };
    }
    return { ok: res.ok, status: res.status, res };
  }

  restore();
  return {
    signIn, signOut, authedFetch,
    baseUrl,
    // ⛔ The token itself is NEVER returned. Callers learn only that one exists.
    state: () => ({ signedIn: !!token, member }),
  };
}

module.exports = { createSession, DEFAULT_BASE };
