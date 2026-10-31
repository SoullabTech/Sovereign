// Seeds FICTIONAL writers (two admitted, two refused) into a THROWAWAY database. Refuses anything that does not look disposable.
// Passwords go through the app's own bcrypt entrypoint semantics (bcrypt, cost 10 here for speed).
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const url = process.env.DATABASE_URL || '';
if (!/^postgres(ql)?:\/\/[^@]+@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) {
  console.error('REFUSED: DATABASE_URL must point at a local throwaway database (127.0.0.1 / localhost).'); process.exit(2);
}
const WRITERS = [
  { username: 'journey_alice', name: 'Alice Fictional', passkey: 'WJ-JOURNEY-ALICE', password: 'journey-alice-pass-1' },
  { username: 'journey_bob',   name: 'Bob Fictional',   passkey: 'WJ-JOURNEY-BOB',   password: 'journey-bob-pass-1' },
  // Negative control: a member who is NOT on the beta roster. The invitation gate must refuse her.
  { username: 'journey_carol', name: 'Carol Fictional', passkey: 'WJ-JOURNEY-CAROL', password: 'journey-carol-pass-1', roster: false },
  // Negative control: an ACTIVE beta tester for some other lane, NOT marked for the Writer's Studio pilot. Must be refused.
  { username: 'journey_dave', name: 'Dave Fictional', passkey: 'WJ-JOURNEY-DAVE', password: 'journey-dave-pass-1', writerMarker: false },
];
(async () => {
  const c = new Client({ connectionString: url }); await c.connect();
  const ids = {};
  for (const w of WRITERS) {
    const hash = await bcrypt.hash(w.password, 10);
    const r = await c.query(
      `INSERT INTO members (passkey, username, password_hash, name, onboarded, onboarding_step)
       VALUES ($1,$2,$3,$4,true,'complete')
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id`,
      [w.passkey, w.username, hash, w.name]);
    ids[w.username] = r.rows[0].id;
    // The beta roster is how real writers are admitted (lib/writersStudio/betaAccessServer.ts). Carol is deliberately absent.
    if (w.roster !== false) {
      await c.query(`DELETE FROM ops_contacts WHERE member_id = $1`, [ids[w.username]]);
      await c.query(
        `INSERT INTO ops_contacts (name, member_id, contact_type, pipeline_stage, metadata) VALUES ($1,$2,'beta_tester','active',$3::jsonb)`,
        [w.name, ids[w.username], JSON.stringify(w.writerMarker === false ? {} : { writers_studio_beta: true })]);
    }
  }
  console.log(JSON.stringify(ids));
  await c.end();
})().catch(e => { console.error('SEED FAILED:', e.message); process.exit(1); });
