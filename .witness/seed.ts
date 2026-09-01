/**
 * WS2 02c-2R successor runtime witness — fixture seeding ONLY.
 * Untracked harness. Creates a synthetic member, session, manuscript,
 * section-addressable draft and ONE structure proposal carrying the
 * adversarial reading (the one that has question marks and open tags),
 * so the real /writers-studio/review route can be opened in a real browser.
 * Writes nothing to any tracked file. Reads no real member's Work.
 */
import { createHash, randomBytes } from 'crypto';

async function main() {
  const { query, transaction } = await import('@/lib/db/postgres');
  const { createProposal } = await import('@/lib/manuscript/structure/proposalStore');
  const { gatherEvidence } = await import('@/lib/manuscript/structure/evidence');
  const { adversarialReading } = await import('@/lib/manuscript/structure/fixtures');

  const N = 14;
  const stamp = Date.now();
  const token = randomBytes(24).toString('hex');

  const fixture = await transaction(async (tx) => {
    const m = await tx.query<{ id: string }>(
      `INSERT INTO members (passkey, username, password_hash, name)
       VALUES ($1, $1, 'not-a-credential', 'WS2 02c-2R witness') RETURNING id`,
      [`ws2-02c-2r-${stamp}`]);
    const memberId = m.rows[0].id;

    await tx.query(
      `INSERT INTO auth_sessions (member_id, session_token, expires_at)
       VALUES ($1, $2, now() + interval '1 day')`, [memberId, token]);

    const man = await tx.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, `ws2-02c-2r-witness-${stamp}`]);
    const manuscriptId = man.rows[0].id;

    const bodies = Array.from({ length: N }, (_, i) => `SECTION-${i} filler.\n\n`);
    const content = bodies.join('');
    const d = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts
         (manuscript_id, member_id, content, base_source_hash, version)
       VALUES ($1,$2,$3,$4,1) RETURNING id`,
      [manuscriptId, memberId, content,
       createHash('sha256').update(content, 'utf8').digest('hex')]);
    for (let i = 0; i < N; i++) {
      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text) VALUES ($1,$2,$3)`,
        [d.rows[0].id, i, bodies[i]]);
    }
    await tx.query(
      `UPDATE manuscript_working_drafts SET section_addressable_at = now(),
              section_conversion_version = 1 WHERE id = $1`, [d.rows[0].id]);
    return { memberId, manuscriptId, draftId: d.rows[0].id };
  });

  const rows = await query<{ id: string; position: number }>(
    `SELECT id, position FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
    [fixture.draftId]);
  const sections = rows.rows.map((r) => ({
    id: r.id, position: r.position, heading: `HEADING ${r.position}`,
  }));

  const evidence = gatherEvidence(fixture.manuscriptId, sections);
  const interpretation = adversarialReading(sections as any);

  const created = await createProposal(fixture.manuscriptId, fixture.memberId, {
    evidence, interpretation, coverage: evidence.coverage,
    sectionTopologyHash: evidence.sectionTopologyHash,
    interpretationInputHash: 'ws2-02c-2r-witness',
  });
  if (created.status !== 'ok') {
    console.error('SEED_FAILED', JSON.stringify(created));
    process.exit(1);
  }
  console.log(JSON.stringify({
    memberId: fixture.memberId,
    manuscriptId: fixture.manuscriptId,
    proposalId: created.value.id,
    sessionToken: token,
    form: interpretation.form,
  }));
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
