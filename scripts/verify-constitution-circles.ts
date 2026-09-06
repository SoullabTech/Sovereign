/**
 * Circle Boundary Verification Matrix
 *
 * Proves that the Circle constitutional boundaries ratified on 2026-09-06
 * (FR-01 … FR-11, docs/programme/JARVIS-CIRCLES-01_FOUNDER_RULINGS_2026-09-06.md)
 * are STRUCTURALLY enforced — not merely intended.
 *
 * Usage:
 *   npx tsx scripts/verify-constitution-circles.ts
 *   DATABASE_URL=postgres://... npx tsx scripts/verify-constitution-circles.ts
 *
 * Consequence contract:
 *   - Read-only in consequence. Every fixture is created inside a transaction
 *     that is ALWAYS rolled back, including on throw.
 *   - Exits non-zero on any failure. The pass condition is `0 failed`, never
 *     the total — a total moves whenever checks are added.
 *
 * IMPORTANT — where the boundary actually lives:
 *   This codebase has no row-level security (by design: plain self-hosted
 *   Postgres, never Supabase RLS). Circle scoping is enforced in TypeScript by
 *   getCircleWithMembership() in lib/circles/circleService.ts. A SQL-only
 *   verifier would therefore prove nothing about the real boundary, and a
 *   service-only verifier cannot see rolled-back fixtures (services hold their
 *   own pool). This script uses three groups accordingly:
 *
 *     GROUP S  service layer, against REAL existing principals, pure read
 *     GROUP T  data invariants, on fixtures inside a rolled-back transaction
 *     GROUP C  source assertions, for constitutional properties that live in code
 *
 * Canon: docs/canon/VERIFICATION_STATES.md
 */

import { Pool, PoolClient } from 'pg';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://soullab@localhost:5432/maia_consciousness';

const pool = new Pool({ connectionString: DATABASE_URL });
const ROOT = join(__dirname, '..');

let passed = 0;
let failed = 0;
let warned = 0;
let skipped = 0;

function pass(label: string, detail?: string) {
  console.log(`  ✅ PASS  ${label}${detail ? `  (${detail})` : ''}`);
  passed++;
}
function fail(label: string, detail?: string) {
  console.log(`  ❌ FAIL  ${label}${detail ? `  → ${detail}` : ''}`);
  failed++;
}
function warn(label: string, detail?: string) {
  console.log(`  ⚠️  WARN  ${label}${detail ? `  (${detail})` : ''}`);
  warned++;
}
function skip(label: string, detail?: string) {
  console.log(`  ⏭️  SKIP  ${label}${detail ? `  (${detail})` : ''}`);
  skipped++;
}
function section(title: string) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 64 - title.length))}`);
}

function src(rel: string): string | null {
  const p = join(ROOT, rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP C · Source assertions (no database)
// Constitutional properties enforced in TypeScript, not in SQL.
// ─────────────────────────────────────────────────────────────────────────────

async function groupC() {
  section('GROUP C · source assertions (B-01, FR-04, FR-06, FR-08)');

  const circleService = src('lib/circles/circleService.ts');
  const inquiryService = src('lib/circles/inquiryService.ts');
  const sharingService = src('lib/circles/sharingService.ts');
  const membership = src('lib/circles/membershipService.ts');
  const consent = src('lib/circles/consentService.ts');
  const pulse = src('lib/circles/fieldPulseService.ts');

  // C1 — every read path is membership-gated in the service layer.
  if (circleService && inquiryService && sharingService) {
    const gated = [
      ['listCircleMembers', circleService],
      ['listFeed', sharingService],
      ['shareArtifact', sharingService],
      ['createInquiry', inquiryService],
      ['respondToInquiry', inquiryService],
      ['listInquiries', inquiryService],
      ['getInquiryWithResponses', inquiryService],
    ] as const;
    const ungated = gated.filter(([fn, body]) => {
      const i = body.indexOf(`export async function ${fn}`);
      if (i < 0) return true;
      const scope = body.slice(i, i + 2200);
      return !scope.includes('getCircleWithMembership');
    });
    ungated.length === 0
      ? pass('C1 every Circle read/write path calls getCircleWithMembership')
      : fail('C1 ungated service path', ungated.map(([f]) => f).join(', '));
  } else {
    fail('C1 service sources unreadable');
  }

  // C2 — FR-04: contribute-before-see is enforced server-side for INQUIRY.
  if (inquiryService) {
    const i = inquiryService.indexOf('export async function getInquiryWithResponses');
    const scope = i >= 0 ? inquiryService.slice(i) : '';
    scope.includes('hasResponded') && /responses\s*=\s*\[\]|responses:\s*\(/.test(scope)
      ? pass('C2 FR-04 inquiry withholds responses until the member has contributed')
      : fail('C2 FR-04 inquiry contribute-before-see not evident server-side');
  }

  // C3 — FR-04: the LIVING FIELD must NOT require contribution.
  //      Ratified: quiet presence is legitimate. A precondition here is a violation.
  if (sharingService) {
    const i = sharingService.indexOf('export async function listFeed');
    const scope = i >= 0 ? sharingService.slice(i) : '';
    /hasResponded|hasContributed|hasShared|mustContribute/.test(scope)
      ? fail('C3 FR-04 listFeed imposes a contribution precondition on ordinary witnessing')
      : pass('C3 FR-04 ordinary witnessing requires no contribution');
  }

  // C4 — FR-08.2: inferred material must not reach a shared field.
  if (pulse) {
    /from\s+member_theme_signals|JOIN\s+member_theme_signals/i.test(pulse)
      ? fail('C4 FR-08.2 field pulse reads member_theme_signals')
      : pass('C4 FR-08.2 field pulse does not read inferred theme signals');
  }

  // C5 — FR-08.3: no ambient MAIA-content path into a Circle.
  //      Explicit member-authored Offer remains constitutionally allowed.
  {
    const offenders: string[] = [];
    for (const rel of [
      'lib/circles/sharingService.ts',
      'lib/circles/fieldPulseService.ts',
      'lib/circles/circleService.ts',
      'lib/circles/inquiryService.ts',
    ]) {
      const body = src(rel);
      if (body && /conversation_messages|semantic_memory|memory_atoms|daily_anchors|maia_turns/i.test(body)) {
        offenders.push(rel);
      }
    }
    offenders.length === 0
      ? pass('C5 FR-08.3 no Circle service reads MAIA conversation / memory sources')
      : fail('C5 FR-08.3 ambient MAIA-content read path', offenders.join(', '));
  }

  // C6 — FR-08.7: no counts / scores rendered into Circle surfaces.
  if (inquiryService) {
    /response_count/.test(inquiryService)
      ? fail('C6 FR-08.7 response_count is returned to the client', 'inquiryService.listInquiries')
      : pass('C6 FR-08.7 no participation counts returned');
  }

  // C9 — FR-06: discovery reads declared interests only.
  {
    const hasDiscovery = ['listAllCircles', 'discoverCircles', 'searchCircles'].some((fn) =>
      (src('lib/circles/circleService.ts') || '').includes(fn)
    );
    hasDiscovery
      ? warn('C9 FR-06 a discovery path exists — assert its inputs explicitly')
      : pass('C9 FR-06 no discovery surface exists yet; nothing can read forbidden sources');
  }

  // C10 — FR-07: collective release must not exist before its mechanism does.
  {
    const anyRelease = ['lib/circles', 'app/api/circles'].some((d) => {
      const b = src(join(d, 'sharingService.ts')) || '';
      return /constellation|releaseToCommons|commons_release/i.test(b);
    });
    anyRelease
      ? fail('C10 FR-07 a Circle→Constellation/Commons release path exists without a ratified mechanism')
      : pass('C10 FR-07 no collective release path exists; collective material does not cross');
  }

  // C11 — FR-01/FR-08.8: a crossing is representational, not a live pointer.
  if (sharingService) {
    const i = sharingService.indexOf('export async function listFeed');
    const scope = i >= 0 ? sharingService.slice(i) : '';
    /JOIN\s+(?!members)/i.test(scope)
      ? fail('C11 FR-08.8 feed dereferences the source object', 'live pointer')
      : pass('C11 FR-08.8 feed serves the stored representation only');
  }

  // C13 — B-01 / CIRCLE-04 R1: the declared release posture must be the ENFORCED
  //       one. A Next.js layout does not run for route handlers, so the page
  //       gate in app/commons/circles/layout.tsx cannot close the API. Every
  //       /api/circles route must go through requireCircleAccess(), and none may
  //       resolve identity directly — a direct getMemberIdFromRequest() call is
  //       exactly how the gap existed before R1.
  {
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const e of readdirSync(dir)) {
        const full = join(dir, e);
        out.push(...(statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : []));
      }
      return out;
    };
    const apiDir = join(ROOT, 'app/api/circles');
    const routes = existsSync(apiDir) ? walk(apiDir) : [];
    const ungated = routes.filter((f) => {
      const body = readFileSync(f, 'utf8');
      return body.includes('getMemberIdFromRequest') || !body.includes('requireCircleAccess');
    });
    if (routes.length === 0) {
      fail('C13 B-01 no Circle API routes found to check');
    } else if (ungated.length === 0) {
      pass('C13 B-01 every Circle API route is gated by requireCircleAccess', `${routes.length} routes`);
    } else {
      fail(
        'C13 B-01 Circle API route bypasses the release-posture gate',
        ungated.map((f) => f.replace(ROOT + '/', '')).join(', ')
      );
    }
  }

  // C12 — FR-05/FR-01: revocation must never touch the source item.
  if (sharingService && membership && consent) {
    const deletesSource = [sharingService, membership, consent].some((b) =>
      /DELETE\s+FROM\s+(?!shared_artifacts)/i.test(b)
    );
    deletesSource
      ? fail('C12 FR-01 a revocation path deletes from a non-share table')
      : pass('C12 FR-01 revocation sets revoked_at only; source untouched');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP S · Service layer, real principals, pure read
// ─────────────────────────────────────────────────────────────────────────────

async function groupS() {
  section('GROUP S · service layer vs real principals (FR-01, FR-03, FR-11)');

  const rows = (
    await pool.query<{ member_id: string; circle_id: string }>(
      `SELECT member_id, circle_id FROM circle_memberships WHERE status = 'active' ORDER BY created_at`
    )
  ).rows;

  const byMember = new Map<string, string[]>();
  for (const r of rows) {
    byMember.set(r.member_id, [...(byMember.get(r.member_id) ?? []), r.circle_id]);
  }

  // S1 — cross-circle isolation, using two real members in different Circles.
  const members = [...byMember.keys()];
  let a: string | null = null;
  let bCircle: string | null = null;
  outer: for (const m of members) {
    for (const other of members) {
      if (other === m) continue;
      const foreign = (byMember.get(other) ?? []).find((c) => !(byMember.get(m) ?? []).includes(c));
      if (foreign) {
        a = m;
        bCircle = foreign;
        break outer;
      }
    }
  }

  if (!a || !bCircle) {
    skip('S1 cross-circle isolation', 'no two members in disjoint Circles');
  } else {
    const { getCircleWithMembership } = await import('../lib/circles/circleService');
    try {
      await getCircleWithMembership(bCircle, a);
      fail('S1 FR-01 member A read Circle B', `${a.slice(0, 8)} → ${bCircle.slice(0, 8)}`);
    } catch (e: any) {
      e?.message === 'FORBIDDEN'
        ? pass('S1 FR-01 member A cannot read Circle B')
        : fail('S1 FR-01 unexpected error', e?.message);
    }

    const { listFeed } = await import('../lib/circles/sharingService');
    try {
      await listFeed(bCircle, a);
      fail('S2 FR-01 member A read Circle B feed');
    } catch (e: any) {
      e?.message === 'FORBIDDEN'
        ? pass('S2 FR-01 member A cannot read Circle B feed')
        : fail('S2 FR-01 unexpected error', e?.message);
    }

    const { shareArtifact } = await import('../lib/circles/sharingService');
    try {
      await shareArtifact({
        circleId: bCircle,
        memberId: a,
        artifactType: 'verifier-probe',
        artifactRef: 'probe',
        contentMode: 'summary_only',
        sharedTitle: null,
        sharedSummary: null,
        sharedText: null,
      });
      fail('S3 FR-01 member A shared into Circle B — WRITE LEAK');
    } catch (e: any) {
      e?.message === 'FORBIDDEN'
        ? pass('S3 FR-01 member A cannot share into Circle B')
        : fail('S3 FR-01 unexpected error', e?.message);
    }
  }

  // S4 — FR-03 + FR-11: plurality is a property of an ACTIVE Circle, not of every
  //      stored Circle row. A Circle may exist administratively before it is
  //      relationally constituted:
  //
  //        FORMING   1–2 persons, not yet a plural relational field
  //        ACTIVE    3+ persons, may exercise active-Circle semantics
  //
  //      "Creation is not constitution." So this assertion does NOT test
  //      `every circle has >= 3 members`. It tests whether the substrate can
  //      REPRESENT the boundary at all — because an unrepresentable boundary is
  //      unenforceable, and an unenforceable constitutional rule is a description.
  //
  //      ⛔ Never repair this with CHECK(member_count >= 3). Membership count is
  //      dynamic; relational state is not a row constraint.
  const lifecycleCol = (
    await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'circles' AND column_name IN ('lifecycle', 'lifecycle_state', 'state')`
    )
  ).rows;

  if (lifecycleCol.length === 0) {
    fail(
      'S4 FR-03/FR-11 lifecycle/plurality boundary is not representable',
      'circles has no FORMING|ACTIVE lifecycle column, so FR-03 cannot be enforced at the lifecycle boundary'
    );
  } else {
    const col = lifecycleCol[0].column_name;

    // S4a — an ACTIVE Circle must have plurality.
    const activeSubPlural = (
      await pool.query<{ id: string }>(
        `SELECT c.id FROM circles c
         WHERE c."${col}" = 'active'
           AND (SELECT COUNT(*) FROM circle_memberships m
                WHERE m.circle_id = c.id AND m.status = 'active') < 3`
      )
    ).rows;
    activeSubPlural.length === 0
      ? pass('S4a FR-03 every ACTIVE Circle has three or more active members')
      : fail('S4a FR-03 ACTIVE Circle without plurality', `${activeSubPlural.length} circle(s)`);

    // S4b — a sub-plural Circle must not present itself as ACTIVE.
    const misrepresented = (
      await pool.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM circles c
         WHERE (SELECT COUNT(*) FROM circle_memberships m
                WHERE m.circle_id = c.id AND m.status = 'active') < 3
           AND c."${col}" <> 'forming'`
      )
    ).rows[0];
    misrepresented?.n === '0'
      ? pass('S4b FR-11 sub-plural Circles are represented as FORMING, never ACTIVE')
      : fail('S4b FR-11 sub-plural Circle not represented as FORMING', `${misrepresented?.n} circle(s)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP T · Data invariants on rolled-back fixtures
// ─────────────────────────────────────────────────────────────────────────────

async function groupT(tx: PoolClient) {
  section('GROUP T · live semantics on rolled-back fixtures (FR-01, FR-05, FR-08)');

  const mk = async (name: string) =>
    (
      await tx.query<{ id: string }>(
        `INSERT INTO members (passkey, username, password_hash, name)
         VALUES ($1, $1, 'verifier', $2) RETURNING id`,
        [`VERIFY-${name}-${Date.now()}`, `verifier-${name}`]
      )
    ).rows[0].id;

  const mA = await mk('a');
  const mB = await mk('b');

  const circle = (
    await tx.query<{ id: string }>(
      `INSERT INTO circles (created_by, name) VALUES ($1, 'verifier fixture') RETURNING id`,
      [mA]
    )
  ).rows[0].id;

  for (const [m, role] of [
    [mA, 'facilitator'],
    [mB, 'member'],
  ] as const) {
    await tx.query(
      `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
       VALUES ($1, $2, $3, 'active', 'manual', NOW())`,
      [circle, m, role]
    );
  }

  const art = (
    await tx.query<{ id: string }>(
      `INSERT INTO shared_artifacts (circle_id, shared_by, artifact_type, artifact_ref, content_mode, shared_title)
       VALUES ($1, $2, 'note', 'src-1', 'summary_only', 'fixture') RETURNING id`,
      [circle, mB]
    )
  ).rows[0].id;

  // T1 — FR-01: revocation removes the share from the field.
  await tx.query(`UPDATE shared_artifacts SET revoked_at = NOW() WHERE id = $1`, [art]);
  const visible = (
    await tx.query(`SELECT 1 FROM shared_artifacts WHERE id = $1 AND revoked_at IS NULL`, [art])
  ).rowCount;
  visible === 0
    ? pass('T1 FR-01 revoked material leaves the field')
    : fail('T1 FR-01 revoked material still visible');

  // T2 — FR-01: the source is untouched by revocation.
  const ref = (
    await tx.query<{ artifact_ref: string }>(`SELECT artifact_ref FROM shared_artifacts WHERE id = $1`, [art])
  ).rows[0];
  ref?.artifact_ref === 'src-1'
    ? pass('T2 FR-01 source reference intact after revocation')
    : fail('T2 FR-01 revocation mutated the source reference');

  // ── FR-05 removal contract (CIRCLE-04 R2) ────────────────────────────────
  //
  // C7 and C8 moved into this group deliberately. As source-token checks they
  // could only report that some string existed; here they interrogate the live
  // schema. T3 then drives the REAL removal path — removeMemberWithClient() on
  // this rolled-back client — so the assertions test semantics, not spelling.

  // C7 — the append-only removal record exists with the fields FR-05 requires.
  const removalCols = (
    await tx.query<{ column_name: string; is_nullable: string }>(
      `SELECT column_name, is_nullable FROM information_schema.columns
       WHERE table_name = 'circle_membership_removals'`
    )
  ).rows;
  const colNames = new Set(removalCols.map((r) => r.column_name));
  const required = ['circle_id', 'removed_member_id', 'removed_by', 'grounds', 'resulting_status', 'created_at'];
  const missing = required.filter((c) => !colNames.has(c));
  if (removalCols.length === 0) {
    fail('C7 FR-05 no removal record table', 'circle_membership_removals does not exist');
  } else if (missing.length) {
    fail('C7 FR-05 removal record incomplete', `missing: ${missing.join(', ')}`);
  } else {
    pass('C7 FR-05 removal record exists with circle, member, actor, grounds, state, time');
  }

  // C8 — the record is append-only and grounds cannot be empty.
  {
    const groundsNullable = removalCols.find((r) => r.column_name === 'grounds')?.is_nullable;
    const hasUpdatedAt = colNames.has('updated_at');
    const checks = (
      await tx.query<{ conname: string }>(
        `SELECT conname FROM pg_constraint
         WHERE conrelid = to_regclass('circle_membership_removals') AND contype = 'c'`
      )
    ).rows.map((r) => r.conname);
    const hasBlankGuard = checks.some((c) => c.includes('grounds_not_blank'));
    const hasSelfGuard = checks.some((c) => c.includes('not_self'));
    if (removalCols.length === 0) {
      fail('C8 FR-05 removal grounds/actor cannot be recorded', 'no removal record table');
    } else if (groundsNullable !== 'NO' || !hasBlankGuard) {
      fail('C8 FR-05 grounds are not required', 'an unexplained removal would be recordable');
    } else if (!hasSelfGuard) {
      fail('C8 FR-05 self-removal is recordable as a removal', 'missing not_self constraint');
    } else if (hasUpdatedAt) {
      fail('C8 FR-05 removal record is not append-only', 'updated_at present');
    } else {
      pass('C8 FR-05 removal record is append-only with required, non-blank grounds');
    }
  }

  // Fixtures for the semantic family: a facilitator, an ordinary member, a
  // second ordinary member, and a SECOND Circle to prove scoping.
  const mC = await mk('c');
  await tx.query(
    `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
     VALUES ($1, $2, 'member', 'active', 'manual', NOW())`,
    [circle, mC]
  );
  const otherCircle = (
    await tx.query<{ id: string }>(
      `INSERT INTO circles (created_by, name) VALUES ($1, 'verifier other') RETURNING id`,
      [mC]
    )
  ).rows[0].id;
  await tx.query(
    `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
     VALUES ($1, $2, 'member', 'active', 'manual', NOW())`,
    [otherCircle, mB]
  );
  const shareB = (
    await tx.query<{ id: string }>(
      `INSERT INTO shared_artifacts (circle_id, shared_by, artifact_type, artifact_ref, content_mode)
       VALUES ($1, $2, 'note', 'src-removal', 'summary_only') RETURNING id`,
      [circle, mB]
    )
  ).rows[0].id;

  const { removeMemberWithClient } = await import('../lib/circles/removalService');
  const attempt = async (input: Parameters<typeof removeMemberWithClient>[1]) => {
    try {
      await removeMemberWithClient(tx as any, input);
      return null;
    } catch (e: any) {
      return e?.message ?? 'UNKNOWN';
    }
  };

  // T3a — an ordinary member cannot remove another member.
  const asOrdinary = await attempt({
    circleId: circle, actingMemberId: mC, targetMemberId: mB, grounds: 'probe',
  });
  asOrdinary === 'ROLE_INSUFFICIENT'
    ? pass('T3a FR-05 an ordinary member cannot remove another member')
    : fail('T3a FR-05 ordinary-member removal was not refused', String(asOrdinary));

  // T3b — a facilitator cannot remove themselves; that is leaving.
  const asSelf = await attempt({
    circleId: circle, actingMemberId: mA, targetMemberId: mA, grounds: 'probe',
  });
  asSelf === 'SELF_REMOVAL'
    ? pass('T3b FR-05 self-removal is refused; leaving is a different act')
    : fail('T3b FR-05 self-removal was not refused', String(asSelf));

  // T3c — grounds are required. An unexplained removal is the interpretive
  //       judgment FR-05 forbids.
  const noGrounds = await attempt({
    circleId: circle, actingMemberId: mA, targetMemberId: mB, grounds: '   ',
  });
  noGrounds === 'GROUNDS_REQUIRED'
    ? pass('T3c FR-05 removal without grounds is refused')
    : fail('T3c FR-05 groundless removal was not refused', String(noGrounds));

  // T3d — an authorized facilitator can enact removal.
  let record: any = null;
  try {
    record = await removeMemberWithClient(tx as any, {
      circleId: circle,
      actingMemberId: mA,
      targetMemberId: mB,
      grounds: 'explicit boundary breach, verifier fixture',
    });
    pass('T3d FR-05 an authorized facilitator can enact removal');
  } catch (e: any) {
    fail('T3d FR-05 facilitator removal failed', e?.message);
  }

  // T3e — the act records WHO and WHY.
  record && record.removed_by === mA && record.grounds.includes('boundary breach')
    ? pass('T3e FR-05 removal records the acting facilitator and the grounds')
    : fail('T3e FR-05 removal did not record actor and grounds');

  // T3f — removal cuts access.
  const stillActive = (
    await tx.query(
      `SELECT 1 FROM circle_memberships WHERE circle_id = $1 AND member_id = $2 AND status = 'active'`,
      [circle, mB]
    )
  ).rowCount;
  stillActive === 0
    ? pass('T3f FR-05 removal cuts active membership')
    : fail('T3f FR-05 removal did not cut membership');

  // T3g — removal revokes the removed member's shares, exactly as leaving does.
  const liveShare = (
    await tx.query(`SELECT 1 FROM shared_artifacts WHERE id = $1 AND revoked_at IS NULL`, [shareB])
  ).rowCount;
  liveShare === 0
    ? pass('T3g FR-05 removal revokes the removed member\'s Circle shares')
    : fail('T3g FR-05 removed member\'s material is still in the field');

  // T3h — the source is untouched. Only the Circle-side representation is revoked.
  const srcRef = (
    await tx.query<{ artifact_ref: string }>(
      `SELECT artifact_ref FROM shared_artifacts WHERE id = $1`,
      [shareB]
    )
  ).rows[0];
  srcRef?.artifact_ref === 'src-removal'
    ? pass('T3h FR-05 removal leaves the original source material untouched')
    : fail('T3h FR-05 removal mutated the source reference');

  // T3i — removal is scoped to one field. Other Circles are not affected.
  const elsewhere = (
    await tx.query(
      `SELECT 1 FROM circle_memberships
       WHERE circle_id = $1 AND member_id = $2 AND status = 'active'`,
      [otherCircle, mB]
    )
  ).rowCount;
  elsewhere === 1
    ? pass('T3i FR-05 removal does not affect memberships in any other Circle')
    : fail('T3i FR-05 removal leaked across Circles');

  // T5 — FR-08.5: membership never arrives as a side effect of a crossing.
  const before = (
    await tx.query(`SELECT COUNT(*)::int AS n FROM circle_memberships WHERE circle_id = $1`, [circle])
  ).rows[0].n;
  await tx.query(
    `INSERT INTO shared_artifacts (circle_id, shared_by, artifact_type, artifact_ref, content_mode)
     VALUES ($1, $2, 'note', 'src-3', 'summary_only')`,
    [circle, mA]
  );
  const after = (
    await tx.query(`SELECT COUNT(*)::int AS n FROM circle_memberships WHERE circle_id = $1`, [circle])
  ).rows[0].n;
  before === after
    ? pass('T5 FR-08.5 a crossing creates no membership')
    : fail('T5 FR-08.5 a crossing altered membership');

  // T6 — FR-04: one response per member per inquiry (independent perception).
  const inq = (
    await tx.query<{ id: string }>(
      `INSERT INTO circle_inquiries (circle_id, opened_by, question)
       VALUES ($1, $2, 'verifier fixture question') RETURNING id`,
      [circle, mA]
    )
  ).rows[0].id;
  await tx.query(
    `INSERT INTO circle_inquiry_responses (inquiry_id, member_id, response_text) VALUES ($1, $2, 'first')`,
    [inq, mA]
  );
  try {
    await tx.query(
      `INSERT INTO circle_inquiry_responses (inquiry_id, member_id, response_text) VALUES ($1, $2, 'second')`,
      [inq, mA]
    );
    fail('T6 FR-04 a member responded twice to one inquiry');
  } catch {
    pass('T6 FR-04 one response per member per inquiry is enforced by the database');
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n════ Circle Boundary Verification Matrix ════');
  console.log(`   ratified minimum: FR-01 … FR-10 (2026-09-06)`);
  console.log(`   database: ${DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);

  await groupC();

  try {
    await groupS();
  } catch (e: any) {
    fail('GROUP S aborted', e?.message);
  }

  const tx = await pool.connect();
  try {
    await tx.query('BEGIN');
    await groupT(tx);
  } catch (e: any) {
    fail('GROUP T aborted', e?.message);
  } finally {
    await tx.query('ROLLBACK').catch(() => {});
    tx.release();
  }

  section('RESULT');
  console.log(`  ${passed} passed · ${failed} failed · ${warned} warned · ${skipped} skipped`);
  console.log(`  pass condition is "0 failed", never the total.\n`);

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await pool.end().catch(() => {});
  process.exit(1);
});
