/** Physical CHECK/UNIQUE witness for the EDITORIAL_OPENING shape. Opt-in, LOCAL test DB only:
 *  WS_OPENING_PG=maia_ws_local DATABASE_URL=postgresql://soullab@localhost:5432/maia_ws_local npx jest <this file> */
import { Client } from 'pg';
const active = process.env.WS_OPENING_PG === 'maia_ws_local';
const physical = active ? describe : describe.skip;
const REL = '00000000-0000-0000-0000-000000000001';
const T = (n: number) => `00000000-0000-0000-0000-0000000000a${n}`;
const C = '00000000-0000-0000-0000-0000000000b1';
let db: Client;
const ins = (seq: number, kind: string, thread: string, member: number | null, maia: number, gesture: string | null) =>
  db.query(
    `INSERT INTO writer_editorial_relationship_episodes
     (relationship_id, sequence, child_kind, manuscript_scope_requested, manuscript_scope_executed, temporal_posture,
      history_policy, continuation_authorized, authority_class, carry_policy, editorial_thread_id,
      editorial_proposal_chain_id, editorial_member_turn_index, editorial_maia_turn_index, editorial_opening_gesture)
     VALUES ($1,$2,$3,'passage','passage','CURRENT_FROZEN_LOCUS','CHILD_LOCAL_MULTI_TURN',true,'EDITORIAL_CHAIN','PRESENTATION_ONLY',$4,$5,$6,$7,$8)`,
    [REL, seq, kind, thread, C, member, maia, gesture]);

physical('EDITORIAL_OPENING shape on the local test database', () => {
  beforeAll(async () => {
    db = new Client({ connectionString: process.env.DATABASE_URL }); await db.connect();
    const id = await db.query('select current_database() d');
    if (id.rows[0].d !== 'maia_ws_local') throw new Error('REFUSE_WRONG_DATABASE');
  });
  afterAll(async () => { await db.end(); });
  beforeEach(async () => { await db.query('BEGIN'); await db.query('SET LOCAL session_replication_role = replica'); });
  afterEach(async () => { await db.query('ROLLBACK'); });

  test('an opening has a NULL member turn, maia index 0 and the exact gesture', async () => {
    await expect(ins(1, 'EDITORIAL_OPENING', T(1), null, 0, 'opened_conversation_on_passage')).resolves.toBeDefined();
  });
  test.each([
    ['claims a member turn index', () => ins(2, 'EDITORIAL_OPENING', T(2), 0, 1, 'opened_conversation_on_passage')],
    ['wrong gesture', () => ins(3, 'EDITORIAL_OPENING', T(3), null, 0, 'lets_look')],
    ['maia index not 0', () => ins(4, 'EDITORIAL_OPENING', T(4), null, 1, 'opened_conversation_on_passage')],
    ['EDITORIAL_TURN without a member turn (law not weakened)', () => ins(5, 'EDITORIAL_TURN', T(5), null, 1, null)],
    ['EDITORIAL_TURN carrying a gesture', () => ins(6, 'EDITORIAL_TURN', T(6), 0, 1, 'opened_conversation_on_passage')],
  ])('refused: %s', async (_n, run) => { await expect(run()).rejects.toThrow(/check constraint/); });
  test('one opening per thread', async () => {
    await ins(7, 'EDITORIAL_OPENING', T(7), null, 0, 'opened_conversation_on_passage');
    await expect(ins(8, 'EDITORIAL_OPENING', T(7), null, 0, 'opened_conversation_on_passage')).rejects.toThrow(/were_editorial_opening_once/);
  });
  test('an ordinary EDITORIAL_TURN is unchanged', async () => {
    await expect(ins(9, 'EDITORIAL_TURN', T(9), 0, 1, null)).resolves.toBeDefined();
  });
});
