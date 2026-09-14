import pg from 'pg';
import { randomUUID, createHash } from 'crypto';

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

const memberId = randomUUID();
const workId   = randomUUID();
const draftId  = randomUUID();
const token    = 'witness-session-token-' + randomUUID();

/* Nine sections. The three body-required ones sit 2nd, 5th and 9th, and their
   ids are chosen so LEXICAL order (aa, mm, zz) disagrees with MANUSCRIPT order
   (zz 2nd, mm 5th, aa 9th) — F1 and F2 in one fixture. */
const ids = Array.from({ length: 9 }, () => randomUUID());
const B = 'zz-' + ids[1], E = 'mm-' + ids[4], I = 'aa-' + ids[8];
const topology = [ids[0], B, ids[2], ids[3], E, ids[5], ids[6], ids[7], I];
const required = [B, E, I];
const GHOST = 'ghost-never-in-topology';

const sections = Object.fromEntries(topology.map((id, i) => [id, {
  revisionNumber: 1, range: { start: i * 10, end: i * 10 + 9 }, digest: sha(id),
}]));
const coverage = { sections: Object.fromEntries(topology.map((id) => [id, 'body'])) };

const readState = (topo) => ({
  draftId, revisionNumber: 1, revisionDigest: sha('revision-1'),
  sectionTopology: topo, sections, inputFingerprint: sha('fingerprint'),
});

const observation = (refs) => ([{
  key: 'o1', lens: 'development',
  evidenceRefs: refs.map((sectionId) => ({ kind: 'section', sectionId })),
  observation: 'A witnessed observation resting on the named sections.',
  doesNotEstablish: ['outside-coverage'],
  structureDependency: { kind: 'independent' },
}]);

const readerProvenance = { provider: 'anthropic', model: 'witness-fixture', resolvedAt: new Date().toISOString() };

await c.query(
  `INSERT INTO members (id, passkey, username, password_hash, name, onboarded, studio_mode, astrology_consent, tester,
                        conversational_recall_enabled, episodic_recall_enabled, recurrence_recall_enabled,
                        attention_notifications_enabled)
   VALUES ($1,$2,$3,'x','Witness',TRUE,'standard','declined',TRUE,TRUE,TRUE,TRUE,TRUE)`,
  [memberId, 'WITNESS-' + memberId.slice(0, 8), 'witness-' + memberId.slice(0, 8)]);

await c.query(
  `INSERT INTO auth_sessions (id, member_id, session_token, expires_at, revoked, created_at)
   VALUES ($1,$2,$3, NOW() + INTERVAL '1 day', FALSE, NOW())`,
  [randomUUID(), memberId, token]);

await c.query(
  `INSERT INTO member_manuscripts (id, member_id, title, provenance, created_at, source_custody)
   VALUES ($1,$2,'Witness Work','member_written', NOW(), 'source_custodied')`, [workId, memberId]);

await c.query(
  `INSERT INTO manuscript_working_drafts
     (id, manuscript_id, member_id, content, base_source_hash, revision_count, created_at, updated_at, version)
   VALUES ($1,$2,$3,'body','h',1,NOW(),NOW(),1)`, [draftId, workId, memberId]);

const mkReading = async (topo, refs) => {
  const id = randomUUID();
  await c.query(
    `INSERT INTO developmental_readings
       (id, manuscript_id, member_id, draft_id, revision_number, commissioned_lens, scope, read_state,
        coverage, input_fingerprint, outcome, observations, reader_provenance,
        classifier_provenance, frozen_at)
     VALUES ($1,$2,$3,$4,1,'development',$5,$6,$7,$8,'reading',$9,$10,$11, NOW())`,
    [id, workId, memberId, draftId,
     JSON.stringify({ commissionedLens: 'development', bodyScope: topo, withStructure: false }),
     JSON.stringify(readState(topo)), JSON.stringify(coverage), sha('fingerprint'),
     JSON.stringify(observation(refs)), JSON.stringify(readerProvenance),
     JSON.stringify({ provider: 'anthropic', model: 'witness-fixture' })]);
  return id;
};

const orientable   = await mkReading(topology, required);
const unorientable = await mkReading(topology, [B, GHOST]);

await c.end();
console.log(JSON.stringify({
  memberId, workId, token, orientable, unorientable,
  required, expectedOrdinals: { [B]: 2, [E]: 5, [I]: 9 }, ghost: GHOST,
}, null, 2));
