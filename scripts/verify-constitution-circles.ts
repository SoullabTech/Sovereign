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
 * PASS CONDITION — two parts, both required:
 *
 *     0 failed   AND   every required assertion still present
 *
 * `0 failed` alone is NOT sufficient. On 2026-09-07 an edit to C6 accidentally
 * deleted C9, C10, C11 and C13; the remaining assertions all passed and the
 * verifier reported `31 passed · 0 failed · exit 0`. It had become greener by
 * forgetting what it used to ask.
 *
 *     An instrument can satisfy all of its remaining questions by forgetting to
 *     ask the difficult ones.
 *
 * So REQUIRED_ASSERTIONS below is a NAMED COVERAGE FLOOR, not a frozen total.
 * A numeric total would be brittle — legitimate new assertions raise it. The
 * floor is deliberately by name:
 *
 *     required assertion missing  →  FAIL
 *     required assertion failed   →  FAIL
 *     new assertion added         →  allowed
 *     all required + new pass     →  PASS
 *
 * ⛔ Do not make the total authoritative. ⛔ Do not remove an ID from the floor
 * to make a run green — that is the exact failure this exists to catch. An ID
 * leaves the floor only by a founder act that retires the obligation itself.
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

/**
 * The coverage floor — every constitutional obligation this verifier is
 * required to still be asking. Named, never counted.
 */
const REQUIRED_ASSERTIONS: ReadonlySet<string> = new Set([
  // Group C — source and schema
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
  'C9', 'C10', 'C11', 'C12', 'C13', 'C14',
  // Group S — service layer against real principals
  'S1', 'S2', 'S3',
  // FR-03 / FR-11 constitution state
  'S4a', 'S4b', 'S4c', 'S4d', 'S4e',
  // Group T — data invariants and live semantics
  'T1', 'T2',
  'T3a', 'T3b', 'T3c', 'T3d', 'T3e', 'T3f', 'T3g', 'T3h', 'T3i',
  'T5', 'T6',
]);

/** Assertion IDs that actually executed this run, in any outcome. */
const executed = new Set<string>();

function note(label: string) {
  const id = label.split(/\s+/)[0];
  if (id) executed.add(id);
}

function pass(label: string, detail?: string) {
  note(label);
  console.log(`  ✅ PASS  ${label}${detail ? `  (${detail})` : ''}`);
  passed++;
}
function fail(label: string, detail?: string) {
  note(label);
  console.log(`  ❌ FAIL  ${label}${detail ? `  → ${detail}` : ''}`);
  failed++;
}
function warn(label: string, detail?: string) {
  note(label);
  console.log(`  ⚠️  WARN  ${label}${detail ? `  (${detail})` : ''}`);
  warned++;
}
function skip(label: string, detail?: string) {
  note(label);
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

  // C6 — FR-08.7: participation must not become a member-visible signal.
  //
  //      DESTINATION-AWARE BY DESIGN. This does NOT sweep Circle code for
  //      COUNT(*) — counting is legitimate wherever it is technically required:
  //      constitutional derivation (constitutionState.ts counts active
  //      memberships to derive FORMING/ACTIVE), authorization, integrity checks,
  //      verification, operations. FR-08.7 concerns Circle SOCIAL SURFACES and
  //      member-facing status mechanics, not arithmetic.
  //
  //      So it asks one question of two destinations: does the member-facing
  //      inquiry listing, or a Circle surface component, carry a participation
  //      quantity?
  {
    const SIGNALS = /\bresponse_count\b|\bresponseCount\b|\bparticipation_count\b|\bparticipationCount\b/;
    const offenders: string[] = [];

    // Destination 1 — the member-facing inquiry listing itself.
    if (inquiryService) {
      const i = inquiryService.indexOf('export async function listInquiries');
      if (i >= 0) {
        const rest = inquiryService.slice(i + 1);
        const nextExport = rest.indexOf('\nexport ');
        const body = nextExport >= 0 ? rest.slice(0, nextExport) : rest;
        // Strip comments: the site documents WHY the count was removed, and
        // that prose must not read as the defect returning.
        const code = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        if (SIGNALS.test(code)) offenders.push('inquiryService.listInquiries');
      } else {
        offenders.push('inquiryService.listInquiries (not found)');
      }
    }

    // Destination 2 — Circle surface components, where a count would be rendered.
    const compDir = join(ROOT, 'components/circles');
    if (existsSync(compDir)) {
      for (const f of readdirSync(compDir).filter((n) => n.endsWith('.tsx'))) {
        const body = readFileSync(join(compDir, f), 'utf8');
        const code = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        if (SIGNALS.test(code)) offenders.push(`components/circles/${f}`);
      }
    }

    offenders.length === 0
      ? pass('C6 FR-08.7 no participation quantity reaches a member-facing Circle surface')
      : fail('C6 FR-08.7 participation exposed as a member-facing signal', offenders.join(', '));
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

  // C14 — FR-11 vs FieldPhase: two different questions that share string values.
  //       CircleConstitutionState is structurally assignable to FieldPhase, so
  //       TypeScript cannot catch a mix-up. The separation is a discipline, and
  //       this is the only thing that can falsify a drift back together.
  {
    const cs = src('lib/circles/constitutionState.ts');
    const pulse2 = src('lib/circles/fieldPulseService.ts');
    if (!cs) {
      fail('C14 FR-11 constitution state module missing');
    } else if (/from '\.\/fieldPulseService'|FieldPhase/.test(cs.replace(/\/\*[\s\S]*?\*\//g, ''))) {
      fail('C14 FR-11 constitution state depends on FieldPhase', 'the two concepts must stay separate');
    } else if (pulse2 && /constitutionState|CircleConstitutionState/.test(pulse2)) {
      fail('C14 FR-11 field pulse depends on constitution state', 'activity heuristic must not carry plurality');
    } else {
      pass('C14 FR-11 constitution state and FieldPhase remain independent');
    }
  }

  // C14 — FR-11 vs FieldPhase: two different questions that share string values.
  //       CircleConstitutionState is structurally assignable to FieldPhase, so
  //       TypeScript cannot catch a mix-up. The separation is a discipline, and
  //       this is the only thing that can falsify a drift back together.
  {
    const cs = src('lib/circles/constitutionState.ts');
    const pulse2 = src('lib/circles/fieldPulseService.ts');
    if (!cs) {
      fail('C14 FR-11 constitution state module missing');
    } else if (/from '\.\/fieldPulseService'|FieldPhase/.test(cs.replace(/\/\*[\s\S]*?\*\//g, ''))) {
      fail('C14 FR-11 constitution state depends on FieldPhase', 'the two concepts must stay separate');
    } else if (pulse2 && /constitutionState|CircleConstitutionState/.test(pulse2)) {
      fail('C14 FR-11 field pulse depends on constitution state', 'activity heuristic must not carry plurality');
    } else {
      pass('C14 FR-11 constitution state and FieldPhase remain independent');
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
  section('GROUP S · service layer vs real principals (FR-01)');

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

  // ── FR-03 / FR-11 constitution state (CIRCLE-04 R3) ──────────────────────
  //
  // Derived, never stored. These walk ONE fixture Circle through the
  // transitions and assert the canonical derivation each time — deliberately
  // NOT reading the four historical production Circles, which could only
  // manufacture a pass. The derivation itself is what is under test.

  const { getCircleConstitutionState } = await import('../lib/circles/constitutionState');
  const csCircle = (
    await tx.query<{ id: string }>(
      `INSERT INTO circles (created_by, name) VALUES ($1, 'verifier constitution') RETURNING id`,
      [mA]
    )
  ).rows[0].id;
  const join = async (member: string) =>
    tx.query(
      `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
       VALUES ($1, $2, 'member', 'active', 'manual', NOW())`,
      [csCircle, member]
    );
  const stateNow = () => getCircleConstitutionState(csCircle, tx as any);

  // S4a — one active member. Intention, not yet plurality.
  await join(mA);
  (await stateNow()) === 'forming'
    ? pass('S4a FR-11 one active member derives FORMING')
    : fail('S4a FR-11 one active member did not derive FORMING');

  // S4b — two. Relationship, but dyadic geometry (FR-03). Still not a Circle.
  await join(mB);
  (await stateNow()) === 'forming'
    ? pass('S4b FR-11 two active members derive FORMING')
    : fail('S4b FR-11 two active members did not derive FORMING');

  // S4c — three. Plurality exists; the field is constituted.
  await join(mC);
  (await stateNow()) === 'active'
    ? pass('S4c FR-03 three active members derive ACTIVE')
    : fail('S4c FR-03 three active members did not derive ACTIVE');

  // S4d — re-formation. A Circle that falls below plurality is not a failure
  //       and has not returned to its beginning; it is simply not presently
  //       constituted as a plural field.
  await tx.query(
    `UPDATE circle_memberships SET status = 'left' WHERE circle_id = $1 AND member_id = $2`,
    [csCircle, mC]
  );
  (await stateNow()) === 'forming'
    ? pass('S4d FR-11 falling below plurality derives FORMING')
    : fail('S4d FR-11 an ACTIVE Circle below plurality still derived ACTIVE');

  // S4e — and back, with no administrator act and no timer.
  await tx.query(
    `UPDATE circle_memberships SET status = 'active' WHERE circle_id = $1 AND member_id = $2`,
    [csCircle, mC]
  );
  (await stateNow()) === 'active'
    ? pass('S4e FR-11 regaining plurality derives ACTIVE')
    : fail('S4e FR-11 regaining plurality did not derive ACTIVE');

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

  // ── Coverage floor ────────────────────────────────────────────────────────
  // Checked last, so a group that aborted mid-way still reports which
  // obligations went unasked rather than hiding behind the assertions that ran.
  section('COVERAGE');
  const missing = [...REQUIRED_ASSERTIONS].filter((id) => !executed.has(id));
  if (missing.length === 0) {
    console.log(`  ✅ all ${REQUIRED_ASSERTIONS.size} required assertions executed`);
  } else {
    for (const id of missing) {
      // Counts as a failure: a missing obligation is not a smaller test suite,
      // it is an unverified boundary.
      fail(`COVERAGE required assertion ${id} did not execute`, 'obligation unasked');
    }
  }

  section('RESULT');
  console.log(`  ${passed} passed · ${failed} failed · ${warned} warned · ${skipped} skipped`);
  console.log(`  coverage: ${REQUIRED_ASSERTIONS.size - missing.length}/${REQUIRED_ASSERTIONS.size} required assertions executed`);
  console.log(`  PASS = 0 failed AND no required assertion missing. The total is never the gate.\n`);

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await pool.end().catch(() => {});
  process.exit(1);
});
