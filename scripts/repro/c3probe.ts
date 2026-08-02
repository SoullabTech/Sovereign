import { query } from '@/lib/db/postgres';
import { keepSource } from '@/lib/psyche/portfolio';
import { randomUUID } from 'crypto';

const M1 = randomUUID(), M2 = randomUUID();
const mk = async (draft: boolean, archived: boolean, pinned: boolean, owner: string) => {
  const r = await query<{id:string}>(
    `INSERT INTO reflection_capsules (user_id, source_type, source_id, title, draft, archived, pinned, summary)
     VALUES ($1,'conversation',$2,$3,$4,$5,$6,'probe summary') RETURNING id`,
    [owner, randomUUID(), 'probe', draft, archived, pinned]);
  return r.rows[0].id;
};
const ok = (b: boolean, s: string) => console.log(`${b ? 'PASS' : '** FAIL **'}  ${s}`);
const refuses = async (fn: () => Promise<unknown>, s: string) => {
  try { await fn(); ok(false, s + ' (no refusal)'); }
  catch (e) { ok(true, `${s} -> "${(e as Error).message}"`); }
};

(async () => {
  // Disposable members. Baseline is "these rows do not exist" — recorded by
  // construction, since the ids are minted here. Cleanup at the end is exact.
  for (const [id, u] of [[M1,'c3probe1'],[M2,'c3probe2']] as const) {
    const tag = id.slice(0, 8);
    await query(
      `INSERT INTO members (id, passkey, username, password_hash, name, onboarded)
       VALUES ($1,$2,$3,'x','C3 Probe',true)`, [id, `C3-${u}-${tag}`, `${u}-${tag}`]);
  }
  const eligible = await mk(false, false, false, M1);
  const draft    = await mk(true,  false, false, M1);
  const archived = await mk(false, true,  false, M1);
  const unpinned = await mk(false, false, false, M1);
  const others   = await mk(false, false, false, M2);
  const inp = (id: string) => ({ memberId: M1, sourceType: 'capsule' as const, sourceId: id, title: 'declared', body: null });

  const a1 = await keepSource(M1, inp(eligible));
  ok(!!a1.id, `1. first declaration creates one atom (${a1.id.slice(0,8)})`);

  const a2 = await keepSource(M1, inp(eligible));
  ok(a1.id === a2.id, `2. exact retry returns the SAME atom (${a2.id.slice(0,8)})`);

  const conc2 = await mk(false, false, false, M1);
  const conc = await Promise.allSettled([1,2,3,4,5].map(() => keepSource(M1, inp(conc2))));
  const fulfilled = conc.filter(r=>r.status==='fulfilled') as any[];
  const ids = new Set(fulfilled.map(r=>r.value.id));
  const created = fulfilled.filter(r=>r.value.wasCreated).length;
  const existing = fulfilled.filter(r=>!r.value.wasCreated).length;
  const rows = await query(`SELECT count(*) n FROM member_memory_atoms WHERE member_id=$1 AND source_type='capsule' AND source_id=$2`,[M1,conc2]);
  ok(ids.size===1 && (rows.rows[0] as any).n==='1', `3. concurrent x5 -> one atom (distinct ids=${ids.size}, rows=${(rows.rows[0] as any).n})`);
  ok(created===1 && existing===4, `3b. concurrent x5 -> exactly one 201, four 200 (created=${created}, existing=${existing})`);

  const rt = await keepSource(M1, inp(conc2));
  ok(rt.wasCreated===false && rt.id===[...ids][0], `3c. later retry reports EXISTING, same id`);

  await refuses(() => keepSource(M1, inp(others)),   '4. another member\'s capsule refused');
  await refuses(() => keepSource(M1, inp(draft)),    '5. draft capsule refused');
  await refuses(() => keepSource(M1, inp(archived)), '6. archived capsule refused');

  const a7 = await keepSource(M1, inp(unpinned));
  ok(!!a7.id, '7. eligible UNPINNED capsule allowed');

  const p = await query<any>(`SELECT source_type, source_id, generated_by FROM member_memory_atoms WHERE id=$1`,[a1.id]);
  ok(p.rows[0].source_type==='capsule' && p.rows[0].source_id===eligible && p.rows[0].generated_by==='member-gesture',
     `8. provenance: source_type=${p.rows[0].source_type} source_id preserved generated_by=${p.rows[0].generated_by}`);

  const s1 = await keepSource(M1, { memberId:M1, sourceType:'spontaneous', sourceId:null, title:'s', body:'b' });
  const s2 = await keepSource(M1, { memberId:M1, sourceType:'spontaneous', sourceId:null, title:'s', body:'b' });
  ok(s1.id!==s2.id, '9. spontaneous declarations UNAFFECTED (repeatable, two atoms)');

  const rid = randomUUID();
  const r1 = await keepSource(M1, { memberId:M1, sourceType:'reflection', sourceId:rid, title:'r', body:null });
  const r2 = await keepSource(M1, { memberId:M1, sourceType:'reflection', sourceId:rid, title:'r', body:null });
  ok(r1.id===r2.id, '10. reflection declarations unaffected in kind, now idempotent too');

  const shelf = await query(`SELECT count(*) n FROM member_memory_atoms WHERE member_id=$1 AND generated_by='member-gesture' AND status IN ('active','still_alive') AND source_type='capsule'`,[M1]);
  // Three declared capsules by now: the first, the concurrency subject, and the
  // unpinned one. Asserted against the set actually declared rather than a
  // hardcoded count, so adding a case above cannot silently break this.
  const declaredIds = new Set([eligible, conc2, unpinned]);
  const shelfIds = await query<{source_id:string}>(`SELECT source_id FROM member_memory_atoms WHERE member_id=$1 AND generated_by='member-gesture' AND status IN ('active','still_alive') AND source_type='capsule'`,[M1]);
  const seen = new Set(shelfIds.rows.map(r=>r.source_id));
  ok(seen.size===declaredIds.size && [...declaredIds].every(id=>seen.has(id)),
     `11. Shelf discriminator includes exactly the declared capsules (${seen.size}/${declaredIds.size})`);

  await query(`UPDATE reflection_capsules SET pinned=true, archived=true WHERE id=$1`,[eligible]);
  const survive = await query(`SELECT count(*) n FROM member_memory_atoms WHERE id=$1`,[a1.id]);
  ok((survive.rows[0] as any).n==='1', '12. source lifecycle change after declaration -> Field Object survives');

  const auto = await query(`SELECT count(*) n FROM member_memory_atoms WHERE source_type='capsule' AND member_id=$1`,[M2]);
  ok((auto.rows[0] as any).n==='0', '13. no automatic promotion for the other member\'s eligible capsule');

  await query(`DELETE FROM member_memory_atoms WHERE member_id = ANY($1)`,[[M1,M2]]);
  await query(`DELETE FROM reflection_capsules WHERE user_id = ANY($1)`,[[M1,M2]]);
  await query(`DELETE FROM members WHERE id = ANY($1)`,[[M1,M2]]);
  console.log('probe fixtures removed');
  process.exit(0);
})().catch(e => { console.error('PROBE ERROR', e); process.exit(1); });
