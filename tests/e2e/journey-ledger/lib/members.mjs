/**
 * Fictional members for the throwaway database. Refuses anything that is not the harness's own local shadow.
 * A "freshly rostered" member is a member row plus the beta-roster marker the Writer's Studio pilot gate reads
 * (ops_contacts.metadata.writers_studio_beta), exactly as tests/e2e/writers-journey/seed-fictional-writers.cjs does.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export function assertThrowaway(url) {
  if (!/^postgres(ql)?:\/\/[^@]+@(127\.0\.0\.1|localhost)(:\d+)?\/jl_[a-z0-9_]+$/.test(url || '')) {
    throw new Error('REFUSED: DATABASE_URL must be a local throwaway database named jl_* on 127.0.0.1/localhost');
  }
}

export async function openMembers(url) {
  assertThrowaway(url);
  const { Client } = require('pg');
  const bcrypt = require('bcrypt');
  const client = new Client({ connectionString: url });
  await client.connect();
  let n = 0;
  const password = 'journey-ledger-pass-1';
  const hash = await bcrypt.hash(password, 4);   // cost 4: the member is fictional and the database is thrown away
  return {
    /** Insert one never-seen, rostered, fictional member with zero Works. */
    async fresh(tag = 'p1') {
      n += 1;
      const username = `jl_${tag}_${Date.now().toString(36)}_${n}`;
      const r = await client.query(
        `INSERT INTO members (passkey, username, password_hash, name, onboarded, onboarding_step)
         VALUES ($1,$2,$3,$4,true,'complete') RETURNING id`,
        [`JL-${username.toUpperCase()}`, username, hash, 'Fictional Writer']);
      await client.query(
        `INSERT INTO ops_contacts (name, member_id, contact_type, pipeline_stage, metadata)
         VALUES ($1,$2,'beta_tester','active',$3::jsonb)`,
        ['Fictional Writer', r.rows[0].id, JSON.stringify({ writers_studio_beta: true })]);
      return { id: r.rows[0].id, username, password };
    },
    async close() { await client.end(); },
  };
}
