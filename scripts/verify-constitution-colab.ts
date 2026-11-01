/**
 * Co-Lab Boundary Verification Matrix — v2 (2026-10-30)
 *
 * Re-derived for the post-reboot topology (COLAB-REBOOT-20261021, #1800 comments
 * 6317117002 / 6318272474). The v1 gate assumed three principals each owning a
 * personal Co-Lab named after them. The reboot archived every old team as a
 * "[Legacy …]" anchor (rows kept for foreign keys, memberships removed) and
 * created the active topology: Team Soullab (admin workspace) and Soullab
 * Founding Circle, both owned by Kelly, plus Jondi's Co-Lab.
 *
 * EXIT CODES — the distinction matters:
 *   0  no check failed
 *   1  a boundary check FAILED (a verdict)
 *   3  PRECONDITION UNMET — the instrument could not render a verdict. This is
 *      NOT a pass and NOT a boundary failure; it is still non-zero so every
 *      deploy gate keeps refusing.
 *
 * DESIGN RULES (why v1's weak checks were replaced, not ported):
 *   - A check must be able to FAIL. v1's "people scoped" and "switching changes
 *     context" only ran a query and always passed; they are removed, not kept.
 *   - Negative invariants ("no row violates X") legitimately hold over an empty
 *     set and are kept in that form. POSITIVE claims ("X owns a Co-Lab") need a
 *     non-empty subject and are enforced as preconditions, never passed vacuously.
 *   - "Active" is derived from data (a team is a legacy anchor iff it is labelled
 *     so), never from a hard-coded name list.
 *   - Rows retained on legacy anchors are INFORMATION, not violations: a legacy
 *     anchor holds no memberships (asserted). Whether anything can still be read
 *     through it depends on runtime read paths this gate does not test.
 *
 * NOT ASSERTED (reported as information): non-owner memberships with a NULL
 * invited_by. Production held 4 at 2026-10-30; whether that is a hygiene question
 * or an access question is a founder decision, so the gate does not guess. (The
 * gate therefore reports green over an OPEN question; a new NULL-invited membership
 * does not change the verdict until that decision is made.)
 *
 * OWNERSHIP: any member may own a Co-Lab (every tester gets their own). The gate asserts structure — exactly one owner
 * per ACTIVE Co-Lab; the admin workspace holds only its declared owner — not who the owners are.
 *
 * DEPARTURE SEMANTICS (decision held): the scoped-data checks assert that the WRITER
 * of a colab-scope row is a member of its active Co-Lab. A member who leaves a Co-Lab
 * and leaves content behind will therefore FAIL the gate until the content is reviewed
 * or removed — deliberately conservative, because the data pattern is identical to an
 * unauthorised write into a Co-Lab the writer never belonged to.
 *
 * Rows retained on legacy anchors are reported as INFO only. Whether they are reachable depends on runtime
 * read paths this gate does not test (it is safe only if those paths gate on studio_team_members).
 *
 * Usage: DATABASE_URL=… npx tsx scripts/verify-constitution-colab.ts
 */

import { Pool } from 'pg';
import { requireDatabaseUrl } from '../lib/db/databaseUrl';

const DATABASE_URL = requireDatabaseUrl(process.env.DATABASE_URL);
const pool = new Pool({ connectionString: DATABASE_URL });

let passed = 0;
let failed = 0;
let warned = 0;

function pass(label: string, detail?: string) { console.log(`  ✅ PASS  ${label}${detail ? `  (${detail})` : ''}`); passed++; }
function fail(label: string, detail?: string) { console.log(`  ❌ FAIL  ${label}${detail ? `  → ${detail}` : ''}`); failed++; }
function info(label: string, detail?: string) { console.log(`  ℹ️  INFO  ${label}${detail ? `  (${detail})` : ''}`); }
function section(title: string) { console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`); }

async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await pool.query(sql, params)).rows as T[];
}
async function n(sql: string, params: unknown[] = []): Promise<number> {
  const rows = await q<{ n: number }>(sql, params);
  return rows[0]?.n ?? 0;
}

// A team is a legacy anchor iff the reboot labelled it so. Derived, not listed.
// Both markers are required (F7): an accidental or partial relabel does not hide a team from the leak checks.
const LEGACY = `(t.name LIKE '[Legacy%' AND COALESCE(t.description, '') LIKE 'Legacy anchor%')`;
const ACTIVE = `NOT ${LEGACY}`;

interface Principal { label: string; username: string; id: string; owned: { id: string; name: string }[] }

// Declared membership of the admin workspace (F1): owners are exactly these usernames, and NO other member may sit in it.
const ADMIN_WORKSPACE_OWNERS = ['Kelly'];

// Declared principals of the post-reboot topology. Changing this list is a governed change.
const PRINCIPALS = [
  { label: 'Kelly', username: 'Kelly' },
  { label: 'Jondi', username: 'Jondi' },
];

async function loadPrincipal(label: string, username: string): Promise<Principal | null> {
  const m = await q<{ id: string }>(`SELECT id FROM members WHERE username = $1`, [username]);
  if (!m[0]) return null;
  const owned = await q<{ id: string; name: string }>(
    `SELECT t.id, t.name FROM studio_team_members x JOIN studio_teams t ON t.id = x.team_id
     WHERE x.member_id = $1 AND x.role = 'owner' AND ${ACTIVE} ORDER BY t.name`, [m[0].id]);
  if (owned.length === 0) return null;
  return { label, username, id: m[0].id, owned };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        Co-Lab Boundary Verification Matrix — v2              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);

  // ── PRECONDITION: the declared principals each own at least one ACTIVE Co-Lab ──
  const loaded = await Promise.all(PRINCIPALS.map(p => loadPrincipal(p.label, p.username)));
  const missing = PRINCIPALS.filter((_, i) => !loaded[i]);
  if (missing.length > 0) {
    console.log('\n⛔ PRECONDITION UNMET — the instrument cannot render a verdict. This is NOT a pass.');
    for (const p of missing) console.log(`   ${p.label} (username "${p.username}"): missing, or owns no active Co-Lab`);
    await pool.end();
    process.exit(3);
  }
  const [kelly, jondi] = loaded as [Principal, Principal];
  console.log('\n  Principals loaded:');
  for (const p of [kelly, jondi]) console.log(`    ${p.label} (${p.username}) owns: ${p.owned.map(o => o.name).join(' · ')}`);

  // ── 1. Topology ──
  section('1. Topology — the reboot invariants');
  const adminRows = await q<{ name: string; owner_ok: boolean }>(
    `SELECT t.name, EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = t.id AND x.member_id = $1 AND x.role = 'owner') AS owner_ok
     FROM studio_teams t WHERE t.is_admin_workspace = true`, [kelly.id]);
  if (adminRows.length === 1) pass('Exactly one admin workspace is flagged', adminRows[0]!.name);
  else fail(`Expected exactly one admin workspace, found ${adminRows.length}`, adminRows.map(r => r.name).join(', ') || 'none');
  if (adminRows.length === 1 && adminRows[0]!.owner_ok) pass('The admin workspace is owned by Kelly');
  else fail('The admin workspace is not owned by Kelly');
  const adminIsLegacy = await n(`SELECT COUNT(*)::int AS n FROM studio_teams t WHERE t.is_admin_workspace = true AND ${LEGACY}`);
  if (adminIsLegacy === 0) pass('No legacy anchor is flagged as an admin workspace'); else fail(`${adminIsLegacy} legacy anchor(s) flagged as admin workspace`);
  const legacyWithMembers = await n(
    `SELECT COUNT(*)::int AS n FROM studio_teams t WHERE ${LEGACY} AND EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = t.id)`);
  if (legacyWithMembers === 0) pass('Legacy anchors hold zero memberships (other read paths are not tested by this gate)');
  else fail(`${legacyWithMembers} legacy anchor(s) hold memberships`, 'a retired Co-Lab has live members');
  const legacyAnchors = await n(`SELECT COUNT(*)::int AS n FROM studio_teams t WHERE ${LEGACY}`);
  info('Legacy anchors retained for foreign keys', String(legacyAnchors));

  // F1/F2 — v1's "new tester" check could fail (it failed when a Team Soullab member owned no Co-Lab). Its INTENT —
  // no one stranded in the commons — is ported as checks over the whole membership table, not just the two principals.
  const badRoles = await q<{ role: string }>(
    `SELECT DISTINCT x.role FROM studio_team_members x JOIN studio_teams t ON t.id = x.team_id WHERE ${ACTIVE} AND COALESCE(x.role, '') NOT IN ('owner','member')`);
  if (badRoles.length === 0) pass("Every membership on an active Co-Lab has role 'owner' or 'member' only");
  else fail('Unexpected or NULL membership role(s) on an active Co-Lab', badRoles.map(r => String(r.role)).join(', '));
  // N3/N4 — NOT "owners must be declared principals": every tester gets their own owned Co-Lab (ensureOwnCoLab), so any
  // member may legitimately own one. The invariant is structural: each ACTIVE Co-Lab has exactly one owner.
  const ownerCounts = await q<{ name: string; n: number }>(
    `SELECT t.name, COUNT(*) FILTER (WHERE x.role = 'owner')::int AS n FROM studio_teams t LEFT JOIN studio_team_members x ON x.team_id = t.id
     WHERE ${ACTIVE} GROUP BY t.id, t.name HAVING COUNT(*) FILTER (WHERE x.role = 'owner') <> 1`);
  if (ownerCounts.length === 0) pass('Every active Co-Lab has exactly one owner');
  else fail('Active Co-Lab(s) with zero or several owners', ownerCounts.map(r => `${r.name}:${r.n}`).join(', '));
  const adminMembers = await q<{ username: string; role: string }>(
    `SELECT m.username, x.role FROM studio_team_members x JOIN members m ON m.id = x.member_id JOIN studio_teams t ON t.id = x.team_id WHERE t.is_admin_workspace = true`);
  const intruders = adminMembers.filter(r => !(r.role === 'owner' && ADMIN_WORKSPACE_OWNERS.includes(r.username)));
  if (intruders.length === 0) pass('The admin workspace holds only its declared owner(s) — no one is stranded in the commons');
  else fail('Someone other than the declared owner(s) is in the admin workspace', intruders.map(r => `${r.username}[${r.role}]`).join(', '));

  // ── 2. Ownership isolation ──
  section('2. Ownership isolation between principals');
  const coOwned = await q<{ name: string }>(
    `SELECT t.name FROM studio_teams t WHERE ${ACTIVE}
       AND EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = t.id AND x.member_id = $1 AND x.role = 'owner')
       AND EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = t.id AND x.member_id = $2 AND x.role = 'owner')`, [kelly.id, jondi.id]);
  if (coOwned.length === 0) pass('No active Co-Lab is co-owned by Kelly and Jondi');
  else fail('A Co-Lab is co-owned by two principals', coOwned.map(r => r.name).join(', '));
  for (const [a, b] of [[kelly, jondi], [jondi, kelly]] as [Principal, Principal][]) {
    const roles = await q<{ name: string; role: string }>(
      `SELECT t.name, x.role FROM studio_team_members x JOIN studio_teams t ON t.id = x.team_id
       WHERE x.member_id = $1 AND t.id = ANY($2::uuid[])`, [a.id, b.owned.map(o => o.id)]);
    const notMember = roles.filter(r => r.role !== 'member');
    if (notMember.length === 0) pass(`${a.label} holds no role above 'member' in ${b.label}'s Co-Labs`);
    else fail(`${a.label} holds a non-member role in ${b.label}'s Co-Lab`, notMember.map(r => `${r.name}:${r.role}`).join(', '));
    if (roles.length) info(`${a.label}'s membership in ${b.label}'s Co-Labs`, roles.map(r => `${r.name}:${r.role}`).join(', '));
  }
  const uninvited = await n(`SELECT COUNT(*)::int AS n FROM studio_team_members WHERE role <> 'owner' AND invited_by IS NULL`);
  info('Non-owner memberships with no invited_by (NOT asserted — founder decision)', String(uninvited));

  // ── 3. Scoped data may only reach members of an ACTIVE Co-Lab ──
  section('3. Scoped data is reachable only by members of its active Co-Lab');
  const atomLeak = await n(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms a JOIN studio_teams t ON t.id = a.team_id
     WHERE a.memory_scope = 'colab' AND ${ACTIVE}
       AND NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = a.team_id AND x.member_id = a.member_id)`);
  if (atomLeak === 0) pass('Colab-scope memory atoms on active Co-Labs all belong to a member of that Co-Lab');
  else fail(`${atomLeak} colab-scope atom(s) sit on an active Co-Lab their member does not belong to`);
  const fileLeak = await n(
    `SELECT COUNT(*)::int AS n FROM practitioner_files f JOIN practitioners pr ON pr.id = f.practitioner_id
       JOIN studio_teams t ON t.id = f.team_id
     WHERE f.file_scope = 'colab' AND ${ACTIVE}
       AND NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = f.team_id AND x.member_id = pr.member_id)`);
  if (fileLeak === 0) pass('Colab-scope files on active Co-Labs all belong to a member of that Co-Lab');
  else fail(`${fileLeak} colab-scope file(s) sit on an active Co-Lab their owner does not belong to`);
  const sessLeak = await n(
    `SELECT COUNT(*)::int AS n FROM sessions s JOIN practitioners pr ON pr.id = s.practitioner_id JOIN studio_teams t ON t.id = s.team_id
     WHERE ${ACTIVE} AND NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = s.team_id AND x.member_id = pr.member_id)`);
  if (sessLeak === 0) pass('Sessions on active Co-Labs all belong to a practitioner who is a member of that Co-Lab');
  else fail(`${sessLeak} session(s) sit on an active Co-Lab their practitioner does not belong to`);
  const dmLeak = await n(
    `SELECT COUNT(*)::int AS n FROM team_dm_members dm JOIN team_dm_threads dt ON dt.id = dm.dm_thread_id JOIN studio_teams t ON t.id = dt.team_id
     WHERE ${ACTIVE} AND NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = dt.team_id AND x.member_id = dm.member_id)`);
  if (dmLeak === 0) pass('DM thread participants on active Co-Labs are all members of that Co-Lab');
  else fail(`${dmLeak} DM participant(s) are not members of the thread's Co-Lab`);
  const chLeak = await n(
    `SELECT COUNT(*)::int AS n FROM team_channel_members cm JOIN team_channels c ON c.id = cm.channel_id
     WHERE NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = c.team_id AND x.member_id = cm.member_id)`);
  if (chLeak === 0) pass('Channel members are all members of the channel’s Co-Lab');
  else fail(`${chLeak} channel member(s) are not members of the channel's Co-Lab`);
  const dmLegacy = await n(`SELECT COUNT(*)::int AS n FROM team_dm_threads d JOIN studio_teams t ON t.id = d.team_id WHERE ${LEGACY}`);
  if (dmLegacy === 0) pass('No DM thread hangs off a legacy anchor'); else fail(`${dmLegacy} DM thread(s) hang off a legacy anchor`);
  const chLegacy = await n(`SELECT COUNT(*)::int AS n FROM team_channels c JOIN studio_teams t ON t.id = c.team_id WHERE ${LEGACY}`);
  if (chLegacy === 0) pass('No live channel hangs off a legacy anchor'); else fail(`${chLegacy} channel(s) hang off a legacy anchor`);
  for (const [label, sql] of [
    ['colab atoms', `SELECT COUNT(*)::int AS n FROM member_memory_atoms a JOIN studio_teams t ON t.id = a.team_id WHERE a.memory_scope = 'colab' AND ${LEGACY}`],
    ['colab files', `SELECT COUNT(*)::int AS n FROM practitioner_files f JOIN studio_teams t ON t.id = f.team_id WHERE f.file_scope = 'colab' AND ${LEGACY}`],
    ['sessions', `SELECT COUNT(*)::int AS n FROM sessions s JOIN studio_teams t ON t.id = s.team_id WHERE ${LEGACY}`],
  ] as const) info(`Rows retained on legacy anchors (${label}) — retained; reachability is NOT tested by this gate`, String(await n(sql)));

  // ── 4. Personal scope stays personal ──
  section('4. Personal scope does not bleed into a Co-Lab');
  const pAtoms = await n(`SELECT COUNT(*)::int AS n FROM member_memory_atoms WHERE memory_scope = 'personal' AND team_id IS NOT NULL`);
  if (pAtoms === 0) pass('All personal-scope atoms have team_id = NULL'); else fail(`${pAtoms} personal atom(s) have team_id set`);
  const pFiles = await n(`SELECT COUNT(*)::int AS n FROM practitioner_files WHERE file_scope = 'personal' AND team_id IS NOT NULL`);
  if (pFiles === 0) pass('All personal-scope files have team_id = NULL'); else fail(`${pFiles} personal file(s) have team_id set`);

  // F4 — rows the inner joins above cannot see must not exist: unknown scope values, scoped rows with no team, orphans.
  const badAtomScope = await n(`SELECT COUNT(*)::int AS n FROM member_memory_atoms WHERE memory_scope IS NULL OR memory_scope NOT IN ('personal','colab')`);
  if (badAtomScope === 0) pass("Every memory atom has scope 'personal' or 'colab'"); else fail(`${badAtomScope} memory atom(s) have an unknown or NULL scope`);
  const badFileScope = await n(`SELECT COUNT(*)::int AS n FROM practitioner_files WHERE file_scope IS NULL OR file_scope NOT IN ('personal','colab')`);
  if (badFileScope === 0) pass("Every practitioner file has scope 'personal' or 'colab'"); else fail(`${badFileScope} file(s) have an unknown or NULL scope`);
  const colabNoTeam = await n(`SELECT COUNT(*)::int AS n FROM (
      SELECT 1 FROM member_memory_atoms WHERE memory_scope = 'colab' AND team_id IS NULL
      UNION ALL SELECT 1 FROM practitioner_files WHERE file_scope = 'colab' AND team_id IS NULL) z`);
  if (colabNoTeam === 0) pass('Every colab-scope atom and file names a Co-Lab'); else fail(`${colabNoTeam} colab-scope row(s) carry no team_id`);
  const dmNoTeam = await n(`SELECT COUNT(*)::int AS n FROM team_dm_threads WHERE team_id IS NULL`);
  if (dmNoTeam === 0) pass('Every DM thread names a Co-Lab'); else fail(`${dmNoTeam} DM thread(s) carry no team_id`);
  const danglingTeam = await n(`SELECT COUNT(*)::int AS n FROM (
      SELECT team_id FROM member_memory_atoms WHERE memory_scope = 'colab' AND team_id IS NOT NULL
      UNION ALL SELECT team_id FROM practitioner_files WHERE file_scope = 'colab' AND team_id IS NOT NULL
      UNION ALL SELECT team_id FROM team_dm_threads WHERE team_id IS NOT NULL
      UNION ALL SELECT team_id FROM sessions WHERE team_id IS NOT NULL) z
    WHERE NOT EXISTS (SELECT 1 FROM studio_teams t WHERE t.id = z.team_id)`);
  if (danglingTeam === 0) pass('Every scoped row names a Co-Lab that exists'); else fail(`${danglingTeam} scoped row(s) name a Co-Lab that does not exist`);
  const orphanFiles = await n(`SELECT COUNT(*)::int AS n FROM practitioner_files f WHERE f.file_scope = 'colab' AND NOT EXISTS (SELECT 1 FROM practitioners pr WHERE pr.id = f.practitioner_id)`);
  if (orphanFiles === 0) pass('Every colab-scope file resolves to a practitioner'); else fail(`${orphanFiles} colab-scope file(s) have no practitioner`);
  const orphanDm = await n(`SELECT COUNT(*)::int AS n FROM team_dm_members dm WHERE NOT EXISTS (SELECT 1 FROM team_dm_threads d WHERE d.id = dm.dm_thread_id)`);
  if (orphanDm === 0) pass('Every DM participant belongs to a thread that exists'); else fail(`${orphanDm} DM participant(s) belong to no thread`);
  const orphanSessions = await n(
    `SELECT COUNT(*)::int AS n FROM sessions s WHERE s.team_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM practitioners pr WHERE pr.id = s.practitioner_id)`);
  if (orphanSessions === 0) pass('Every team-scoped session resolves to a practitioner'); else fail(`${orphanSessions} team-scoped session(s) have no practitioner`);

  // ── 5. Practitioner client notes ──
  section('5. Practitioner client notes are owner-scoped and encrypted at rest');
  const crossOwned = await n(
    `SELECT COUNT(*)::int AS n FROM practitioner_client_notes nn JOIN practitioner_clients c ON c.id = nn.client_id WHERE nn.practitioner_id <> c.practitioner_id`);
  if (crossOwned === 0) pass('All client notes belong to the practitioner who owns the client');
  else fail(`${crossOwned} client note(s) are attached to another practitioner's client`);
  const unenc = await n(`SELECT COUNT(*)::int AS n FROM practitioner_client_notes WHERE content_enc IS NULL OR content_enc_meta IS NULL`);
  if (unenc === 0) pass('All client notes are stored encrypted'); else fail(`${unenc} client note(s) are missing ciphertext or encryption metadata`);

  // ── 6. Writer's Studio beta journey → Beta Co-Lab ──
  // SEMANTIC-FIELD-01: journey words reach Co-Lab only by the writer's own share,
  // under their name, into the one configured Co-Lab; a withdrawn answer leaves it.
  section('6. Beta journey shares stay with their author, in one Co-Lab');
  const journeyTable = await n(`SELECT (to_regclass('public.writer_studio_journey_answers') IS NOT NULL)::int AS n`);
  if (journeyTable === 0) {
    info('Beta journey table not present yet — nothing can be shared', 'migration 20261101000001 not applied');
  } else {
    const wrongAuthor = await n(
      `SELECT COUNT(*)::int AS n FROM writer_studio_journey_answers a
         JOIN team_messages tm ON tm.id = a.colab_message_id
        WHERE tm.sender_id <> a.member_id`);
    if (wrongAuthor === 0) pass('Every shared journey item is posted under its own author');
    else fail(`${wrongAuthor} shared journey item(s) are posted under someone else's name`);

    const teams = await q<{ team_id: string | null }>(
      `SELECT DISTINCT tc.team_id FROM writer_studio_journey_answers a
         JOIN team_messages tm ON tm.id = a.colab_message_id
         JOIN team_channels tc ON tc.id = tm.channel_id`);
    const configured = process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID?.trim();
    const configuredTeam = configured
      ? (await q<{ team_id: string | null }>(`SELECT team_id FROM team_channels WHERE id = $1`, [configured]))[0]?.team_id ?? null
      : null;
    if (teams.some((t) => t.team_id === null)) fail('A shared journey item sits in a channel with no Co-Lab');
    else if (teams.length > 1) fail(`Shared journey items appear in ${teams.length} different Co-Labs`);
    else if (teams.length === 1 && configuredTeam && teams[0]!.team_id !== configuredTeam) {
      fail('Shared journey items appear outside the configured Beta Co-Lab');
    } else pass('Shared journey items appear in at most one Co-Lab', teams.length === 0 ? 'none shared yet' : undefined);

    const withdrawnLive = await n(
      `SELECT COUNT(*)::int AS n FROM writer_studio_journey_answers a
         JOIN team_messages tm ON tm.id = a.colab_message_id AND tm.deleted_at IS NULL
        WHERE a.withdrawn_at IS NOT NULL`);
    if (withdrawnLive === 0) pass('No withdrawn journey answer is still visible in Co-Lab');
    else fail(`${withdrawnLive} withdrawn journey answer(s) are still visible in Co-Lab`);
  }

  const total = passed + failed + warned;
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed · ${failed} failed · ${warned} warned (${total} total)`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  await pool.end();
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error('Verification error:', err); process.exit(1); });
