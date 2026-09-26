import { randomUUID } from 'crypto';
import { query, queryWithExpectedRefusal, transaction, closePool } from '@/lib/db/postgres';
import {
  createEditorialRelationshipCustody,
  readEditorialRelationshipCustody,
  prepareRelationshipForAppendWithClient,
  appendEditorialEpisodeWithClient,
  appendReviewDiscussEpisodeWithClient,
  RelationshipCustodyRefused,
} from '@/lib/writers-studio/relationshipCustody';

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];
function check(name: string, pass: boolean, detail = '') {
  checks.push({ name, pass, detail });
  console.log((pass ? 'PASS' : 'FAIL') + '  ' + name + (detail ? ' — ' + detail : ''));
  if (!pass) process.exitCode = 1;
}

async function makeMember() {
  const suffix = randomUUID();
  const r = await query<{id:string}>("INSERT INTO members (passkey,username,password_hash) VALUES ($1,$2,'x') RETURNING id", ['a2-4-witness-' + suffix, 'a24_' + suffix.replace(/-/g,'').slice(0,20)]);
  return r.rows[0]!.id;
}

async function makeWorkManuscript(memberId: string, label: string) {
  const work = (await query<{id:string}>(
    "INSERT INTO living_works (member_id,title) VALUES ($1,$2) RETURNING id",
    [memberId,label],
  )).rows[0]!.id;
  const manuscript = (await query<{id:string}>(
    "INSERT INTO member_manuscripts (member_id,title) VALUES ($1,$2) RETURNING id",
    [memberId,label],
  )).rows[0]!.id;
  const expression = (await query<{id:string}>(
    "INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3) RETURNING id",
    [work,manuscript,memberId],
  )).rows[0]!.id;
  return { work, manuscript, expression };
}
async function seedEditorialChild(
  memberId: string, manuscriptId: string, withTurns = true,
  locusScopeKind: 'section' | 'passage' = 'passage',
) {
  const chain = randomUUID();
  const thread = randomUUID();
  await query(
    "INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text,locus_scope_kind) VALUES ($1,$2,$3,$4,0,$5,'Witness text',$6)",
    [chain,memberId,manuscriptId,randomUUID(),randomUUID(),locusScopeKind],
  );
  await query(
    "INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id) VALUES ($1,$2,$3,NULL,NULL,'witness:0','author',$4)",
    [thread,manuscriptId,memberId,chain],
  );
  if (withTurns) {
    await query(
      "INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Question','{}'::jsonb,NULL),($1,1,'maia','Answer','{}'::jsonb,'{}'::jsonb)",
      [thread],
    );
  }
  return { chain, thread, memberTurnIndex: 0, maiaTurnIndex: 1, locusScopeKind };
}

async function seedReviewChild(memberId: string, manuscriptId: string) {
  const reading = randomUUID();
  const thread = randomUUID();
  const authorization = randomUUID();
  const observationKey = 'obs-witness';
  const identity = {
    kind: 'review_discuss_r2_1',
    readingId: reading,
    observationKey,
    draftId: randomUUID(),
    revisionNumber: 1,
    inputFingerprint: 'fp',
    commissionedLens: 'development',
    readerProvenance: null,
  };
  await query(
    "INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,'witness:0','author',NULL)",
    [thread,manuscriptId,memberId,
      JSON.stringify({on:'observation',readingId:reading,observationKey}),
      JSON.stringify(identity)],
  );
  await query(
    "INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Question','{}'::jsonb,NULL),($1,1,'maia','Review answer','{}'::jsonb,'{}'::jsonb)",
    [thread],
  );
  await query(
    "INSERT INTO ask_authorization_acts (id,member_id,manuscript_id,thread_id,reading_id,observation_key,expires_at) VALUES ($1,$2,$3,$4,$5,$6,now()+interval '1 hour')",
    [authorization,memberId,manuscriptId,thread,reading,observationKey],
  );
  await query(
    "INSERT INTO ask_authorization_consumptions (act_id,completed_at,completion_ref,claim_request_ref) VALUES ($1,now(),$2,$3)",
    [authorization,thread + ':1',randomUUID()],
  );
  return { reading, thread, authorization, observationKey, maiaTurnIndex: 1 };
}

async function attachEditorial(
  relationshipId: string,
  memberId: string,
  child: Awaited<ReturnType<typeof seedEditorialChild>>,
) {
  return transaction(async tx => {
    const prepared = await prepareRelationshipForAppendWithClient(
      tx, { memberId, relationshipId },
    );
    return appendEditorialEpisodeWithClient(tx, prepared, {
      threadId: child.thread,
      proposalChainId: child.chain,
      memberTurnIndex: child.memberTurnIndex,
      maiaTurnIndex: child.maiaTurnIndex,
      manuscriptLocusScope: child.locusScopeKind,
    });
  });
}

async function attachReview(
  relationshipId: string,
  memberId: string,
  child: Awaited<ReturnType<typeof seedReviewChild>>,
) {
  return transaction(async tx => {
    const prepared = await prepareRelationshipForAppendWithClient(
      tx, { memberId, relationshipId },
    );
    return appendReviewDiscussEpisodeWithClient(tx, prepared, {
      threadId: child.thread,
      maiaTurnIndex: child.maiaTurnIndex,
      authorizationId: child.authorization,
      readingId: child.reading,
      observationKey: child.observationKey,
    });
  });
}
async function main() {
  const member = await makeMember();
  const base = await makeWorkManuscript(member, 'A2-4 Witness');

  const r1 = await createEditorialRelationshipCustody({
    memberId: member, livingWorkId: base.work, manuscriptId: base.manuscript,
  });
  const r2 = await createEditorialRelationshipCustody({
    memberId: member, livingWorkId: base.work, manuscriptId: base.manuscript,
  });
  if (!r1.ok || !r2.ok) throw new Error('relationship creation failed');

  check('plural relationships for same Work/manuscript',
    r1.relationship.id !== r2.relationship.id);

  const empty = await readEditorialRelationshipCustody(member, r1.relationship.id);
  check('new parent read is content-free and empty',
    !!empty && empty.episodes.length === 0 && !('body' in (empty.relationship as any)));

  const editorial = await seedEditorialChild(member, base.manuscript);
  const first = await attachEditorial(r1.relationship.id, member, editorial);
  check('editorial child admitted at sequence 1', first.sequence === 1 && !first.existing);

  const retry = await attachEditorial(r1.relationship.id, member, editorial);
  check('same editorial child retry is idempotent',
    retry.id === first.id && retry.sequence === first.sequence && retry.existing);

  let foreignRefused = false;
  try {
    await attachEditorial(r2.relationship.id, member, editorial);
  } catch (e) {
    foreignRefused = e instanceof RelationshipCustodyRefused
      && e.reason === 'child_already_attached_elsewhere';
  }
  check('same child cannot attach to another relationship', foreignRefused);

  const foreignWork = await makeWorkManuscript(member, 'Foreign manuscript child');
  const foreignWorkChild = await seedEditorialChild(member, foreignWork.manuscript);
  let foreignWorkRefused = false;
  try {
    await attachEditorial(r1.relationship.id, member, foreignWorkChild);
  } catch (e) {
    foreignWorkRefused = e instanceof RelationshipCustodyRefused
      && e.reason === 'editorial_child_invalid';
  }
  check('child from another manuscript/Work is refused', foreignWorkRefused);

  const otherMember = await makeMember();
  const foreignMemberWork = await makeWorkManuscript(otherMember, 'Foreign member child');
  const foreignMemberChild = await seedEditorialChild(otherMember, foreignMemberWork.manuscript);
  let foreignMemberRefused = false;
  try {
    await attachEditorial(r1.relationship.id, member, foreignMemberChild);
  } catch (e) {
    foreignMemberRefused = e instanceof RelationshipCustodyRefused
      && e.reason === 'editorial_child_invalid';
  }
  check('child from another member is refused', foreignMemberRefused);

  const review = await seedReviewChild(member, base.manuscript);
  const rev = await attachReview(r1.relationship.id, member, review);
  check('Review child admitted after editorial', rev.sequence === 2 && !rev.existing);

  const read = await readEditorialRelationshipCustody(member, r1.relationship.id);
  check('ordered content-free read returns both child kinds',
    !!read && read.episodes.length === 2
      && read.episodes[0]?.childKind === 'EDITORIAL_TURN'
      && read.episodes[1]?.childKind === 'REVIEW_DISCUSS');
  const parentUpdate = await queryWithExpectedRefusal(
    'UPDATE writer_editorial_relationships SET manuscript_id = manuscript_id WHERE id = $1',
    [r1.relationship.id],
    { fragment: 'writer editorial custody row is immutable', why: 'parent immutable' },
  );
  check('parent UPDATE refused', parentUpdate.refused);

  const episodeUpdate = await queryWithExpectedRefusal(
    'UPDATE writer_editorial_relationship_episodes SET sequence = sequence WHERE id = $1',
    [first.id],
    { fragment: 'writer editorial custody row is immutable', why: 'episode immutable' },
  );
  check('episode UPDATE refused', episodeUpdate.refused);

  const rollbackChild = await seedEditorialChild(member, base.manuscript, false);
  try {
    await transaction(async tx => {
      const prepared = await prepareRelationshipForAppendWithClient(
        tx, { memberId: member, relationshipId: r1.relationship.id },
      );
      await tx.query(
        "INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Rollback Q','{}'::jsonb,NULL),($1,1,'maia','Rollback A','{}'::jsonb,'{}'::jsonb)",
        [rollbackChild.thread],
      );
      await appendEditorialEpisodeWithClient(tx, prepared, {
        threadId: rollbackChild.thread,
        proposalChainId: rollbackChild.chain,
        memberTurnIndex: 0,
        maiaTurnIndex: 1,
        manuscriptLocusScope: rollbackChild.locusScopeKind,
      });
      throw new Error('A2_WITNESS_FORCE_ROLLBACK');
    });
  } catch (e) {
    if (!(e instanceof Error) || e.message !== 'A2_WITNESS_FORCE_ROLLBACK') throw e;
  }

  const rolledTurns = await query<{n:string}>(
    'SELECT count(*)::text AS n FROM ask_turns WHERE thread_id = $1',
    [rollbackChild.thread],
  );
  const rolledEpisode = await query<{n:string}>(
    'SELECT count(*)::text AS n FROM writer_editorial_relationship_episodes WHERE editorial_thread_id = $1',
    [rollbackChild.thread],
  );
  check('forced rollback removes child completion and A2 episode together',
    rolledTurns.rows[0]!.n === '0' && rolledEpisode.rows[0]!.n === '0');
  const committed = await transaction(async tx => {
    const prepared = await prepareRelationshipForAppendWithClient(
      tx, { memberId: member, relationshipId: r1.relationship.id },
    );
    await tx.query(
      "INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Commit Q','{}'::jsonb,NULL),($1,1,'maia','Commit A','{}'::jsonb,'{}'::jsonb)",
      [rollbackChild.thread],
    );
    return appendEditorialEpisodeWithClient(tx, prepared, {
      threadId: rollbackChild.thread,
      proposalChainId: rollbackChild.chain,
      memberTurnIndex: 0,
      maiaTurnIndex: 1,
      manuscriptLocusScope: rollbackChild.locusScopeKind,
    });
  });
  const committedTurns = await query<{n:string}>(
    'SELECT count(*)::text AS n FROM ask_turns WHERE thread_id = $1',
    [rollbackChild.thread],
  );
  check('child completion and A2 episode commit together',
    committedTurns.rows[0]!.n === '2' && committed.sequence === 3);

  const c1 = await seedEditorialChild(member, base.manuscript);
  const c2 = await seedEditorialChild(member, base.manuscript);
  const pair = await Promise.all([
    attachEditorial(r1.relationship.id, member, c1),
    attachEditorial(r1.relationship.id, member, c2),
  ]);
  const seqs = pair.map(x => x.sequence).sort((a,b)=>a-b);
  check('concurrent appends serialize to distinct parent sequence',
    seqs.length === 2 && seqs[0] !== seqs[1] && seqs[1] === seqs[0]! + 1,
    'sequences=' + seqs.join(','));
  const declarationCase = await makeWorkManuscript(member, 'Declaration removal');
  const dr = await createEditorialRelationshipCustody({
    memberId: member,
    livingWorkId: declarationCase.work,
    manuscriptId: declarationCase.manuscript,
  });
  if (!dr.ok) throw new Error('declaration relationship create failed');
  await query('DELETE FROM living_work_expressions WHERE id = $1', [declarationCase.expression]);
  const drRead = await readEditorialRelationshipCustody(member, dr.relationship.id);
  let declarationRefused = false;
  try {
    await transaction(async tx => {
      await prepareRelationshipForAppendWithClient(
        tx, { memberId: member, relationshipId: dr.relationship.id },
      );
    });
  } catch (e) {
    declarationRefused = e instanceof RelationshipCustodyRefused
      && e.reason === 'current_declaration_unavailable';
  }
  check('declaration removal keeps history but blocks new append',
    !!drRead && declarationRefused);

  const deleteCase = await makeWorkManuscript(member, 'Parent delete');
  const pd = await createEditorialRelationshipCustody({
    memberId: member,
    livingWorkId: deleteCase.work,
    manuscriptId: deleteCase.manuscript,
  });
  if (!pd.ok) throw new Error('parent delete relationship create failed');
  const pdChild = await seedEditorialChild(member, deleteCase.manuscript);
  await attachEditorial(pd.relationship.id, member, pdChild);
  await query('DELETE FROM writer_editorial_relationships WHERE id = $1', [pd.relationship.id]);

  const pdEpisode = await query<{n:string}>(
    'SELECT count(*)::text AS n FROM writer_editorial_relationship_episodes WHERE relationship_id = $1',
    [pd.relationship.id],
  );
  const pdThread = await query<{n:string}>(
    'SELECT count(*)::text AS n FROM ask_threads WHERE id = $1', [pdChild.thread],
  );
  const pdChain = await query<{n:string}>(
    'SELECT count(*)::text AS n FROM proposal_chains WHERE id = $1', [pdChild.chain],
  );
  check('parent delete cascades A2 episodes but not child objects',
    pdEpisode.rows[0]!.n === '0' && pdThread.rows[0]!.n === '1' && pdChain.rows[0]!.n === '1');
  const workDelete = await makeWorkManuscript(member, 'Work delete');
  const wd = await createEditorialRelationshipCustody({
    memberId: member,
    livingWorkId: workDelete.work,
    manuscriptId: workDelete.manuscript,
  });
  if (!wd.ok) throw new Error('work delete relationship create failed');
  await query('DELETE FROM living_works WHERE id = $1', [workDelete.work]);
  check('Living Work deletion removes A2 parent',
    (await readEditorialRelationshipCustody(member, wd.relationship.id)) === null);

  const manuscriptDelete = await makeWorkManuscript(member, 'Manuscript delete');
  const md = await createEditorialRelationshipCustody({
    memberId: member,
    livingWorkId: manuscriptDelete.work,
    manuscriptId: manuscriptDelete.manuscript,
  });
  if (!md.ok) throw new Error('manuscript delete relationship create failed');
  await query('DELETE FROM member_manuscripts WHERE id = $1', [manuscriptDelete.manuscript]);
  check('manuscript deletion removes A2 parent',
    (await readEditorialRelationshipCustody(member, md.relationship.id)) === null);

  const focusColumns = await query<{column_name:string}>(
    "SELECT column_name FROM information_schema.columns WHERE table_name='writer_editorial_relationship_episodes' AND column_name ILIKE '%focus%'",
  );
  const childConstraints = await query<{def:string}>(
    "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid='writer_editorial_relationship_episodes'::regclass",
  );
  const childDef = childConstraints.rows.map(r => r.def).join(' ');
  check('Focus absent from v1 schema',
    focusColumns.rows.length === 0
      && childDef.includes('EDITORIAL_TURN')
      && childDef.includes('REVIEW_DISCUSS')
      && !childDef.includes('FOCUS_ACT'));

  const failures = checks.filter(c => !c.pass);
  console.log('');
  console.log('A2-4 DB WITNESS ' + (checks.length - failures.length) + '/' + checks.length);
  if (failures.length) process.exitCode = 1;
}

main()
  .catch(err => { console.error(err); process.exitCode = 1; })
  .finally(async () => { await closePool(); });
