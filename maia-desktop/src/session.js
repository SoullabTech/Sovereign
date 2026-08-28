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

// ── DESKTOP-IDENTITY-CARRY-01 ───────────────────────────────────────────────
//
// WHAT THIS UNIT REPAIRS. `POST /api/members/signin` already returns
// `memberId`, `tier` and `roles` alongside the token — the census read the
// route and confirmed it. This module used to keep `{ name, username }` and
// drop the rest on the floor, so Desktop knew WHO was signed in and nothing
// about what they are entitled to. A shell cannot render entitlement-aware
// navigation from that, which is why the shell unit depends on this one.
//
// ⛔ THE PROJECTION IS PRESENTATION, NEVER AUTHORIZATION. `tier` and `roles`
// here decide what Desktop DRAWS. They decide nothing about what the member may
// reach: `middleware.ts` derives access from a validated `auth_sessions` row and
// treats every client-supplied tier/role assertion as untrusted (AUTH-BOUNDARY-01B).
// Desktop keeps that property by construction — it sends only `x-session-token`
// and never asserts a tier, a role, or a member id on the wire. A tampered
// session.bin therefore changes which doors Desktop paints, and no door opens.
//
// ⛔ `memberId` IS RETAINED IN MAIN AND IS NOT IN THE RENDERER PROJECTION.
// Nothing the renderer draws needs it, and the narrowest thing that works is
// the thing that crosses the bridge. Main reads it through `memberId()`.

const TIERS = ['free', 'personal', 'pro'];

/** A tier we can place on the ordered scale, or the least-privileged one. */
function safeTier(value) {
  return TIERS.includes(value) ? value : 'free';
}

/**
 * Roles, sanitized BY SHAPE rather than by an allow-list of known names.
 *
 * ⛔ Deliberately not `['admin','steward','curator','practitioner','partner','member']`.
 * An allow-list would silently drop a role the server adds later, and a dropped
 * role hides a door the member is actually entitled to — a failure that would
 * surface as "Desktop is missing a feature" long after the cause was forgotten.
 * Shape-sanitizing keeps a malformed or hostile payload from putting arbitrary
 * strings into the projection without pretending we know the full role set.
 */
function safeRoles(value) {
  if (!Array.isArray(value)) return ['member'];
  const roles = value
    .filter((r) => typeof r === 'string')
    .map((r) => r.trim().toLowerCase())
    .filter((r) => /^[a-z][a-z_-]{0,31}$/.test(r))
    .slice(0, 16);
  return roles.length ? Array.from(new Set(roles)) : ['member'];
}

/**
 * The member record main keeps, built from the CANONICAL sign-in response.
 *
 * ⛔ `username` comes from `data.member.username`, not from the string the
 * person typed into the form. They are usually equal and the difference is the
 * whole point: identity is what the server says it is, and taking the typed
 * value would make Desktop's notion of who is signed in an echo of its own
 * input rather than a reading of the server's answer.
 *
 * `typedUsername` survives only as the fallback for a response that omits the
 * field, so a sparse-but-successful sign-in still yields a usable record.
 */
function memberRecord(data, typedUsername) {
  const m = (data && data.member) || {};
  // Three spellings, one field. `data.memberId` and `member.id` are the live
  // route's two placements; `member.memberId` is OUR OWN stored shape, and
  // omitting it dropped the id on every restore — Desktop would relaunch and
  // quietly fall back to the login handle it had just stopped using.
  const id = (data && data.memberId) || m.id || m.memberId;
  return {
    memberId: typeof id === 'string' && id.length <= 64 ? id : null,
    username: (typeof m.username === 'string' && m.username.trim()) || typedUsername,
    name: (typeof m.name === 'string' && m.name.trim())
      || (typeof m.preferredName === 'string' && m.preferredName.trim())
      || typedUsername,
    tier: safeTier(m.tier),
    roles: safeRoles(m.roles),
  };
}

/**
 * Re-sanitize a record read off disk.
 *
 * A `session.bin` written before this unit carries `{ name, username }` and no
 * entitlement fields. Normalizing on restore means every consumer sees one
 * shape, so a restored session and a fresh sign-in are never subtly different —
 * and an upgraded install lands on `free`/`['member']` rather than `undefined`.
 */
function normalizeMember(member) {
  if (!member || typeof member !== 'object') return null;
  return memberRecord({ member }, typeof member.username === 'string' ? member.username : '');
}

function createSession({ app, safeStorage, fetchImpl, onSignedOut } = {}) {
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
      member = normalizeMember(parsed.member);
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
    member = memberRecord(data, username);
    persist();
    // ⛔ The caller gets the same projection the renderer gets — never the
    // record. `signIn` is invoked across the bridge, so its return value is
    // renderer-visible and is held to the same rule as `state()`.
    return { ok: true, member: projection() };
  }

  /**
   * Drop the session.
   *
   * ⭐ DESKTOP-SHELL-01 — `onSignedOut` exists because sign-out is not always
   * something the member did. `authedFetch` calls this itself on a 401, and
   * before this callback that expiry was invisible to main: the platform view
   * would keep an authenticated cookie and stay on screen for a member the
   * server had already stopped recognising. Both doors — the button and the
   * expiry — now run the same teardown.
   */
  function signOut() {
    const wasSignedIn = !!token;
    token = null; member = null; persist();
    if (wasSignedIn && typeof onSignedOut === 'function') {
      try { onSignedOut(); } catch { /* teardown must not break sign-out */ }
    }
  }

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

  /**
   * ⭐ DESKTOP-SHELL-01 — hand the EXISTING canonical session to an embedded
   * platform view, without handing anyone the token.
   *
   * The web surface authenticates by the `maia_session` cookie —
   * `readSessionCredential` reads it first, ahead of the `x-session-token`
   * header Desktop already uses, and both resolve through the same
   * `auth_sessions` row. So there is one credential and one identity here, not
   * two: this writes the token Desktop already holds into the platform
   * partition's cookie jar, and the embedded surface then behaves as an
   * already-signed-in member. No second login, no second session row, no
   * Desktop-only auth path.
   *
   * ⛔ THE MINT LIVES HERE, NOT IN THE SHELL. The shell needs an authenticated
   * view; it does not need the credential, and the difference is the whole
   * custody rule. `session.js` is the only module that has ever held the token
   * and it stays that way — the shell passes a cookie jar in and gets a
   * verdict out. A test asserts `shell.js` contains no token reference at all.
   *
   * ⛔ ONLY `maia_session` is written. Not `maia_member_id`, `maia_tier` or
   * `maia_roles`: those are identity and authority CLAIMS, the middleware
   * stopped trusting them in AUTH-BOUNDARY-01B, and `getMemberFromRequest`
   * rejects a member-id claim that disagrees with the session. Minting them
   * would be Desktop asserting who it is — exactly what `authedFetch` refuses
   * to do on the wire, for the same reason.
   *
   * ⛔ A SESSION COOKIE, with no expirationDate. It lives in an in-memory
   * partition and dies with the process; main re-mints from `session.bin` on
   * the next launch. The shell must not become a second place a credential
   * rests.
   *
   * @param cookies an Electron `Session.cookies` jar for the platform partition
   */
  async function mintWebSession(cookies) {
    if (!token) return { ok: false, error: 'not signed in' };
    try {
      await cookies.set({
        url: baseUrl,
        name: 'maia_session',
        value: token,
        httpOnly: true,          // unreadable from the embedded page's JS
        secure: baseUrl.startsWith('https://'),
        sameSite: 'lax',
        path: '/',
      });
      return { ok: true };
    } catch (e) {
      // Never carries the token — an error path is exactly where a credential
      // ends up in a log.
      return { ok: false, error: (e && e.message) || 'could not establish the web session' };
    }
  }

  /**
   * The renderer-visible projection: display name, the authenticated username,
   * and the entitlement fields a navigation surface needs to decide what to
   * draw.
   *
   * ⛔ No token. ⛔ No `memberId` — see the header note; the renderer draws
   * nothing from it, so it does not cross.
   */
  function projection() {
    if (!member) return null;
    return {
      username: member.username,
      name: member.name,
      tier: member.tier,
      roles: [...member.roles],
    };
  }

  restore();
  return {
    signIn, signOut, authedFetch, mintWebSession,
    baseUrl,
    // ⛔ The token itself is NEVER returned. Callers learn only that one exists,
    // who they are, and what they are entitled to SEE.
    state: () => ({ signedIn: !!token, member: projection() }),
    // Main-only. Not reachable from the renderer: no preload verb returns it.
    memberId: () => (member && member.memberId) || null,
  };
}

module.exports = { createSession, DEFAULT_BASE, TIERS, safeTier, safeRoles, memberRecord };
