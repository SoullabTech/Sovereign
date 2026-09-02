/**
 * BUILD-07A — FALSIFIER 4, against real structure rows.
 *
 * ONE QUESTION:
 *
 *     Can a proposal-local key masquerade as authored structural identity?
 *
 * ⛔ WHY THIS NEEDS A DATABASE. A proposal id is a `uuid`, exactly like a unit
 * id. A structural reference carrying one is indistinguishable BY SHAPE from a
 * legitimate reference — no type can tell them apart, and a unit test supplying
 * its own "canonical set" proves only that the function reads the set it was
 * handed. Only membership in the real authored set separates them.
 *
 * This is FIND's F2 answered at the custody boundary: the reading must reason
 * about what the MEMBER declared the Work to be, not about MAIA's own earlier
 * perception of it.
 *
 * No member prose is printed. Synthetic fixture, deleted by this run's own ids.
 *
 *   DATABASE_URL=... npx tsx scripts/ws2-07-build-07a-f4-witness.ts
 */
import { randomUUID } from 'crypto';
import { memberRef } from '@/lib/privacy/memberRef';

let failures = 0;
const check = (name: string, pass: boolean, detail = '') => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) failures += 1;
};

async function main() {
  const { query } = await import('@/lib/db/postgres');
  const { loadCanonicalUnitIds } =
    await import('@/lib/manuscript/developmental/frozenStateStore');
  const { checkStructuralReference } =
    await import('@/lib/manuscript/developmental/frozenState');

  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1,$2,'x','F4 witness') RETURNING id`, [`F4-${tag}`, `f4-${tag}`]);
  const memberId = member.rows[0].id;
  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,'F4 fixture') RETURNING id`,
    [memberId]);
  const manuscriptId = ms.rows[0].id;
  /* A second manuscript, to prove the set is scoped and not merely non-empty. */
  const other = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,'F4 other') RETURNING id`,
    [memberId]);

  try {
    console.log('\n1 · the fixture — what the member authored, and what MAIA proposed');
    const authored = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_units (manuscript_id, position, kind, title, origin)
       VALUES ($1, 0, 'Part', 'The member''s own division', 'member') RETURNING id`,
      [manuscriptId]);
    const imported = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_units (manuscript_id, position, kind, title, origin)
       VALUES ($1, 1, 'Part', 'Proved at ingest', 'imported') RETURNING id`, [manuscriptId]);

    const proposal = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_proposals
         (manuscript_id, evidence, interpretation, coverage,
          section_topology_hash, interpretation_input_hash, reviewed)
       VALUES ($1, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'h1', 'h2', '{}'::jsonb)
       RETURNING id`, [manuscriptId]);
    const proposalId = proposal.rows[0].id;

    /* A unit the member AUTHORED from that reviewed reading. Canonical, with
       provenance — not a proposal. */
    const adopted = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_units
         (manuscript_id, position, kind, title, origin,
          adopted_from_proposal_id, adopted_from_review_unit_key)
       VALUES ($1, 2, 'Part', 'Authored from a reading', 'member', $2, 'p1')
       RETURNING id`, [manuscriptId, proposalId]);

    const elsewhere = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_units (manuscript_id, position, kind, title, origin)
       VALUES ($1, 0, 'Part', 'A different Work', 'member') RETURNING id`, [other.rows[0].id]);

    check('a proposal id is a uuid — indistinguishable by shape from a unit id',
      /^[0-9a-f-]{36}$/.test(proposalId));

    console.log('\n2 · the authored set, loaded from the database');
    const canonical = await loadCanonicalUnitIds(manuscriptId, memberId);
    check('holds exactly the three divisions of THIS Work', canonical.size === 3,
      `${canonical.size}`);
    check('and does not leak the other manuscript\'s division',
      !canonical.has(elsewhere.rows[0].id));

    console.log('\n3 · falsifier 4 — what may name authored structure');
    check('the member\'s own division is admissible',
      checkStructuralReference({ scope: 'unit', unitId: authored.rows[0].id }, canonical).ok);
    check('a division proved at ingest is admissible',
      checkStructuralReference({ scope: 'unit', unitId: imported.rows[0].id }, canonical).ok);
    check('a division the member AUTHORED FROM a reading is admissible — provenance does not demote it',
      checkStructuralReference({ scope: 'unit', unitId: adopted.rows[0].id }, canonical).ok);

    const byProposal = checkStructuralReference({ scope: 'unit', unitId: proposalId }, canonical);
    check('⛔ a PROPOSAL ID is REFUSED, though it is a uuid like any other',
      !byProposal.ok && byProposal.refusal === 'not_a_canonical_unit');

    const byKey = checkStructuralReference({ scope: 'unit', unitId: 'p1' }, canonical);
    check('⛔ a reviewed unit key is REFUSED',
      !byKey.ok && byKey.refusal === 'not_a_canonical_unit');

    const mixed = checkStructuralReference(
      { scope: 'units', unitIds: [authored.rows[0].id, proposalId] }, canonical);
    check('⛔ and a proposal id hidden BESIDE canonical ids is still refused',
      !mixed.ok && mixed.refusal === 'not_a_canonical_unit');

    const foreign = checkStructuralReference(
      { scope: 'unit', unitId: elsewhere.rows[0].id }, canonical);
    check('another Work\'s division is refused — the set is scoped, not merely non-empty',
      !foreign.ok && foreign.refusal === 'not_a_canonical_unit');

    console.log('\n4 · the relation\'s own shape');
    check('a genuine relationship among two authored divisions is admissible',
      checkStructuralReference(
        { scope: 'units', unitIds: [authored.rows[0].id, imported.rows[0].id] }, canonical).ok);
    check('a "relationship" of one is refused',
      !checkStructuralReference(
        { scope: 'units', unitIds: [authored.rows[0].id] }, canonical).ok);
    check('a division in relation to itself is refused',
      !checkStructuralReference(
        { scope: 'units', unitIds: [authored.rows[0].id, authored.rows[0].id] }, canonical).ok);
    check('the authored topology needs no unit membership',
      checkStructuralReference({ scope: 'topology' }, canonical).ok);

    console.log('\n5 · a Work with no authored structure');
    const bare = await loadCanonicalUnitIds(other.rows[0].id, randomUUID());
    check('another member\'s Work loads as empty — not found, never forbidden', bare.size === 0);
    check('and every unit reference against an empty set is refused',
      !checkStructuralReference({ scope: 'unit', unitId: authored.rows[0].id }, bare).ok);

    console.log(`\n${failures === 0 ? 'WITNESSED' : 'FAILED'} — ${failures} failing check(s)\n`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    if (process.env.KEEP_FIXTURE === '1') {
      console.log(`  fixture kept: username f4-${tag} · ref ${memberRef(memberId)}`);
    } else {
      await query(`DELETE FROM manuscript_structure_units WHERE manuscript_id IN
                     (SELECT id FROM member_manuscripts WHERE member_id = $1)`, [memberId]);
      await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
      await query(`DELETE FROM members WHERE id = $1`, [memberId]);
      console.log('  fixture removed');
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
