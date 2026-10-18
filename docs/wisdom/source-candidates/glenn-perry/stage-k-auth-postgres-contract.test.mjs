/**
 * Stage K code-level regression guards for real Soullab verified-session and
 * founder-gate dependency chain. These are STATIC source checks, not substitutes
 * for the separately witnessed Next.js 15 + real PostgreSQL + WebKit run.
 *
 * No secrets, real users, production DB, meeting or native client is contacted.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../../..');
const file=p=>readFileSync(resolve(root,p),'utf8');
const sessions=file('lib/auth/serverSessions.ts');
const founder=file('lib/founder/founderAuth.ts');
const route=file('app/wisdom-keepers/wisdom/gather-preview/page.tsx');
const verified=file('lib/auth/verifiedAccess.ts');
const matrix=file('config/accessMatrix.ts');
const postgres=file('lib/db/postgres.ts');
const wisdom=file('app/wisdom-keepers/wisdom/page.tsx');

test('actual session credential is the server-read HttpOnly maia_session cookie',()=>{
  assert.match(sessions,/SESSION_COOKIE_NAME = 'maia_session'/);
  assert.match(sessions,/const cookieStore = await cookies\(\)/);
  assert.match(sessions,/cookieStore\.get\(SESSION_COOKIE_NAME\)/);
  assert.match(sessions,/httpOnly: true/);
  assert.match(sessions,/secure: process\.env\.NODE_ENV === 'production'/);
});

test('current session obtains a validated PostgreSQL session rather than a client claim',()=>{
  assert.match(sessions,/export async function getCurrentSession\(\): Promise<Session \| null>/);
  assert.match(sessions,/const token = await getSessionFromCookie\(\)/);
  assert.match(sessions,/if \(!token\) return null/);
  assert.match(sessions,/return validateSession\(token\)/);
  assert.match(sessions,/FROM auth_sessions[\s\S]*?WHERE session_token = \$1[\s\S]*?AND revoked = FALSE[\s\S]*?AND expires_at > NOW\(\)/);
  assert.match(sessions,/UPDATE auth_sessions SET last_active_at = NOW\(\) WHERE id = \$1/);
});

test('database-backed session revocation changes the persisted row',()=>{
  assert.match(sessions,/export async function revokeSession\(/);
  assert.match(sessions,/SET revoked = TRUE, revoked_at = NOW\(\), revoked_reason = \$2/);
  assert.match(sessions,/WHERE id = \$1/);
  assert.match(sessions,/const result = await query\(/);
  assert.match(sessions,/return \(result\.rowCount \?\? 0\) > 0/);
});

test('founder decision depends on a verified member ID in the configured allowlist',()=>{
  assert.match(founder,/import \{ getCurrentSession \} from '@\/lib\/auth\/serverSessions'/);
  assert.match(founder,/process\.env\.FOUNDER_MEMBER_IDS \?\? ''/);
  assert.match(founder,/const session = await getCurrentSession\(\)/);
  assert.match(founder,/if \(!session\?\.memberId\)/);
  assert.match(founder,/if \(!FOUNDER_MEMBER_IDS\.has\(session\.memberId\)\)/);
  assert.doesNotMatch(founder,/isAdmin|isPractitioner|req\.headers|getMemberIdClaim/);
});

test('Gather Together is founder-gated on the server even if parent Wisdom is public',()=>{
  assert.match(matrix,/\{ prefix: '\/wisdom-keepers', public: true/);
  assert.match(route,/process\.env\.MAIA_WISDOM_GATHER_PREVIEW_ENABLED !== '1'/);
  assert.match(route,/const founder = await requireFounder\(\)/);
  assert.match(route,/if \(!founder\.ok\)/);
  assert.match(route,/notFound\(\)/);
  assert.match(route,/CAPACITOR_BUILD === '1'/);
  assert.match(route,/CAPACITOR_BUILD === 'true'/);
  assert.match(route,/export const dynamic = 'force-dynamic'/);
});

test('middleware-level identity claims are not a substitute for DB-backed access',()=>{
  assert.match(verified,/readSessionCredential\(req\)/);
  assert.match(verified,/FROM auth_sessions s[\s\S]*?JOIN members m ON m\.id = s\.member_id/);
  assert.match(verified,/s\.revoked = FALSE/);
  assert.match(verified,/s\.expires_at > NOW\(\)/);
  assert.match(verified,/if \(claimedMemberId && claimedMemberId !== row\.member_id\)/);
  assert.match(verified,/return denied\('claim_mismatch'\)/);
});

test('production postgres module is real and has a dangerous localhost default to guard in isolated staging',()=>{
  assert.match(postgres,/const \{ Pool: PgPool \} = require\('pg'\)/);
  assert.match(postgres,/process\.env\.DATABASE_URL \|\|/);
  assert.match(postgres,/new PgPool\(/);
  assert.match(postgres,/return result;/);
});

test('ordinary Wisdom UI remains without an active Gather Together link',()=>{
  assert.match(wisdom,/Canonical destination: \/wisdom-keepers\/wisdom/);
  assert.doesNotMatch(wisdom,/\/gather-preview/);
  assert.doesNotMatch(wisdom,/WisdomGatherFounderPreview/);
});
