/**
 * F1m / F1n - DATABASE-BACKED ACCEPTANCE.
 *
 * The jest falsifiers mock `@/lib/db/postgres`, so nothing there has ever
 * executed a CHECK constraint. These two laws cannot be proved that way:
 * F1m is about what the schema will and will not persist, and F1n is about what
 * the durable substrate does with a repeated identity.
 *
 *   DATABASE_URL=postgres://.../<disposable> npx tsx scripts/witness/f1mn-disclosure-acceptance.ts
 *
 * LOCAL OR DISPOSABLE ONLY. It writes real rows and deletes exactly its own.
 */

import { query } from '../../lib/db/postgres';
import { establishDisclosureBoundary, mayCrossBoundary } from '../../lib/disclosure/disclosureBoundary';
import { isMintedAuthority } from '../../lib/disclosure/disclosureAuthority';
import { actIdentifiers } from '../../lib/disclosure/actIdentity';
import { TurnPosture } from '../../lib/sanctuary/turnPosture';

/**
 * ⭐ ONE RUN, ONE SET OF ACTS. The first draft used fixed ids and could not be
 * re-run: its rows survived (the governed-delete trigger rightly refuses an
 * ungoverned cleanup), so a second run replayed act ids that already existed and
 * five assertions failed for the harness's reason rather than the system's.
 * A witness that cannot distinguish its own residue from a real violation is not
 * measuring the system.
 */
const RUN = process.env.F1MN_RUN ?? Math.random().toString(36).slice(2, 10);
const MEMBER = `f1mn-member-${RUN}`;
const WORK = `f1mn-work-${RUN}`;
let pass = 0, fail = 0;

const ok = (name: string, cond: boolean, detail = '') => {
  if (cond) { pass += 1; console.log(`  PASS  ${name}`); }
  else { fail += 1; console.log(`  FAIL  ${name}${detail ? ' :: ' + detail : ''}`); }
};

/** A direct INSERT the schema must refuse. Returns the constraint that fired. */
async function refusedInsert(name: string, cols: Record<string, unknown>): Promise<void> {
  const base: Record<string, unknown> = {
    disclosure_id: `d-${Math.random().toString(36).slice(2)}`,
    member_id: MEMBER, request_ref: 'REQ-FIXED', boundary: 'manuscript_prose->maia_cognition',
    source_class: 'work', participation_basis: 'member_invoked', source_ref: WORK,
    authorized_by: 'member', gesture: 'commission_reading',
    policy_version: 'context-disclosure-v1', state: 'attempted', ...cols,
  };
  const keys = Object.keys(base);
  const sql = `INSERT INTO context_disclosure_receipts (${keys.join(', ')})
               VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')})`;
  try {
    await query(sql, keys.map((k) => base[k]));
    ok(name, false, 'the database ACCEPTED it');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    ok(name, /violates check constraint/.test(msg), msg.slice(0, 90));
  }
}

const boundaryFor = (actId: string, locus: any, gesture: any = 'commission_reading') => {
  const { requestId, disclosureId } = actIdentifiers(actId);
  return establishDisclosureBoundary({
    requestId, posture: TurnPosture.resolve({ userId: MEMBER }), memberId: MEMBER,
    sessionId: null, disclosureId, boundary: 'manuscript_prose->maia_cognition',
    sourceClass: 'work', participationBasis: 'member_invoked',
    workRef: WORK, locus, gesture,
  });
};

const rowFor = (disclosureId: string) => query<Record<string, string | null>>(
  `SELECT scope_kind, section_ref, unit_ref, range_from_ref, range_to_ref, state
     FROM context_disclosure_receipts WHERE disclosure_id = $1`, [disclosureId]);

async function main() {
  console.log('\n=== F1m - TRUTHFUL SCOPE PERSISTENCE ===\n');

  // --- UNIT: one commissioned division spanning several sections -------------
  const unitAct = `f1mn-act-unit-a-${RUN}`;
  const unitOut = await boundaryFor(unitAct, {
    scopeKind: 'unit', unitRef: 'part-two', sectionRefs: ['s1', 's2', 's3', 's4', 's5'],
  });
  ok('unit - the boundary authorizes', mayCrossBoundary(unitOut));
  const unitId = actIdentifiers(unitAct).disclosureId;
  const u = (await rowFor(unitId)).rows[0];
  ok('unit - scope_kind is unit, never whole_work', u?.scope_kind === 'unit', String(u?.scope_kind));
  ok('unit - unit_ref names the commissioned division', u?.unit_ref === 'part-two', String(u?.unit_ref));
  ok('unit - section_ref is NULL', u?.section_ref === null);
  ok('unit - range endpoints are NULL', u?.range_from_ref === null && u?.range_to_ref === null);

  const unitCount = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM context_disclosure_receipts
      WHERE source_ref = $1 AND member_id = $2 AND scope_kind = 'unit'`, [WORK, MEMBER]);
  ok('unit - FIVE sections produced ONE receipt, not five', unitCount.rows[0].n === '1', unitCount.rows[0].n);

  // --- RANGE: one bounded contiguous run -------------------------------------
  const rangeAct = `f1mn-act-range-${RUN}`;
  const rangeOut = await boundaryFor(rangeAct, {
    scopeKind: 'range', fromSectionRef: 's2', toSectionRef: 's6', sectionRefs: ['s2', 's3', 's4', 's5', 's6'],
  });
  ok('range - the boundary authorizes', mayCrossBoundary(rangeOut));
  const rangeId = actIdentifiers(rangeAct).disclosureId;
  const r = (await rowFor(rangeId)).rows[0];
  ok('range - scope_kind is range, never whole_work', r?.scope_kind === 'range', String(r?.scope_kind));
  ok('range - both bounds are recorded exactly', r?.range_from_ref === 's2' && r?.range_to_ref === 's6');
  ok('range - unit_ref and section_ref are NULL', r?.unit_ref === null && r?.section_ref === null);

  const rangeCount = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM context_disclosure_receipts
      WHERE source_ref = $1 AND member_id = $2 AND scope_kind = 'range'`, [WORK, MEMBER]);
  ok('range - FIVE sections produced ONE receipt, not five', rangeCount.rows[0].n === '1', rangeCount.rows[0].n);

  // --- THE CONSTRAINTS THEMSELVES -------------------------------------------
  // A violating INSERT the database refuses IS behavioral evidence: it is the
  // schema, not an assertion about the schema.
  console.log('\n--- the locator combinations the schema refuses ---');
  await refusedInsert('unit + section_ref refused', { scope_kind: 'unit', unit_ref: 'p1', section_ref: 's1' });
  await refusedInsert('unit + a range endpoint refused', { scope_kind: 'unit', unit_ref: 'p1', range_from_ref: 's1', range_to_ref: 's2' });
  await refusedInsert('unit WITHOUT unit_ref refused', { scope_kind: 'unit' });
  await refusedInsert('range missing the upper bound refused', { scope_kind: 'range', range_from_ref: 's1' });
  await refusedInsert('range missing the lower bound refused', { scope_kind: 'range', range_to_ref: 's4' });
  await refusedInsert('range + unit_ref refused', { scope_kind: 'range', range_from_ref: 's1', range_to_ref: 's4', unit_ref: 'p1' });
  await refusedInsert('range + section_ref refused', { scope_kind: 'range', range_from_ref: 's1', range_to_ref: 's4', section_ref: 's1' });
  await refusedInsert('whole_work carrying a unit_ref refused - a unit cannot be laundered as whole_work',
    { scope_kind: 'whole_work', unit_ref: 'p1' });
  await refusedInsert('passage carrying its containing section refused', { scope_kind: 'passage', section_ref: 's1' });
  await refusedInsert('evidence_set carrying any locator refused', { scope_kind: 'evidence_set', section_ref: 's1' });

  console.log('\n=== F1n - ACT IDENTITY IS PAYLOAD-BOUND ===\n');

  // --- SAME act, SAME payload: idempotent, and NOT fresh authority ------------
  const replay = await boundaryFor(unitAct, {
    scopeKind: 'unit', unitRef: 'part-two', sectionRefs: ['s1', 's2', 's3', 's4', 's5'],
  });
  ok('replay - the SAME act does NOT yield fresh authority', !mayCrossBoundary(replay),
    replay.kind);
  ok('replay - and it is reported as an existing act, not a mismatch',
    replay.kind === 'receipt_refused' && (replay as any).outcome.kind === 'existing',
    replay.kind === 'receipt_refused' ? (replay as any).outcome.kind : replay.kind);

  const dupRows = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM context_disclosure_receipts WHERE disclosure_id = $1`, [unitId]);
  ok('replay - no duplicate durable receipt', dupRows.rows[0].n === '1', dupRows.rows[0].n);
  const dupConsent = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM runtime_consent_state WHERE request_id = $1`,
    [actIdentifiers(unitAct).requestId]);
  ok('replay - no duplicate consent act', dupConsent.rows[0].n === '1', dupConsent.rows[0].n);

  // --- SAME act, DIFFERENT payload: refused, and nothing fresh ---------------
  const changed = await boundaryFor(unitAct, {
    scopeKind: 'unit', unitRef: 'part-THREE', sectionRefs: ['s7'],
  });
  ok('changed payload - refused', !mayCrossBoundary(changed), changed.kind);
  ok('changed payload - reported as identity_mismatch, not idempotent replay',
    changed.kind === 'receipt_refused' && (changed as any).outcome.kind === 'identity_mismatch',
    changed.kind === 'receipt_refused' ? (changed as any).outcome.kind : changed.kind);
  const unchanged = (await rowFor(unitId)).rows[0];
  ok('changed payload - the prior receipt is untouched', unchanged?.unit_ref === 'part-two');
  const noPartThree = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM context_disclosure_receipts
      WHERE unit_ref = 'part-THREE' AND member_id = $1`, [MEMBER]);
  ok('changed payload - no fresh receipt was written', noPartThree.rows[0].n === '0');

  // --- NEW act, SAME payload: genuinely a second act -------------------------
  const secondAct = `f1mn-act-unit-b-${RUN}`;
  const second = await boundaryFor(secondAct, {
    scopeKind: 'unit', unitRef: 'part-two', sectionRefs: ['s1', 's2', 's3', 's4', 's5'],
  });
  ok('new act - a deliberate second act of the same shape IS authorized', mayCrossBoundary(second), second.kind);
  ok('new act - and it carries a fresh capability',
    mayCrossBoundary(second) && isMintedAuthority((second as any).authority));
  const ids = actIdentifiers(secondAct);
  ok('new act - fresh requestId and fresh disclosure_id',
    ids.requestId !== actIdentifiers(unitAct).requestId && ids.disclosureId !== unitId);
  const twoUnits = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM context_disclosure_receipts
      WHERE unit_ref = 'part-two' AND member_id = $1`, [MEMBER]);
  ok('new act - idempotency did not swallow a genuine second act', twoUnits.rows[0].n === '2', twoUnits.rows[0].n);

  // --- cleanup ---------------------------------------------------------------
  // NOT by deleting rows. The first draft tried, and the substrate refused:
  // `context_disclosure_receipt_governed_delete()` demands a named manifest, so
  // an ordinary cleanup cannot quietly erase disclosure evidence. That refusal is
  // the custody law working, so it is asserted rather than worked around - and
  // the disposable DATABASE is destroyed by the caller instead.
  try {
    await query(`DELETE FROM context_disclosure_receipts WHERE member_id = $1`, [MEMBER]);
    ok('custody - an ungoverned DELETE of a receipt is refused', false, 'the delete SUCCEEDED');
  } catch (e) {
    ok('custody - an ungoverned DELETE of a receipt is refused',
      /governed custody act naming its manifest/.test(e instanceof Error ? e.message : String(e)));
  }

  console.log(`\n=== ${pass} passed / ${fail} failed ===\n`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
