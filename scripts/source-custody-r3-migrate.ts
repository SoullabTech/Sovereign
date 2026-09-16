import { ganeshaContacts } from '../lib/ganesha/contacts';
import { betaTesters } from '../lib/data/betaTesters';
import { closePool, query } from '../lib/db/postgres';

type SafeContact = {
  name: string;
  email: string;
  status: string;
  contribution: string | null;
  key: string;
  groups: string[];
  tags: string[];
  joinDate: string | null;
  legacySource: string;
};

async function main() {
const byEmail = new Map<string, SafeContact>();
for (const c of ganeshaContacts) {
  const email = c.email.trim().toLowerCase();
  byEmail.set(email, {
    name: c.name,
    email,
    status: c.status,
    contribution: c.metadata.contribution ?? null,
    key: `ganesha:${c.id}`,
    groups: c.groups,
    tags: c.tags,
    joinDate: c.joinDate ?? null,
    legacySource: 'lib/ganesha/contacts.ts',
  });
}

for (let i = 0; i < betaTesters.length; i++) {
  const c = betaTesters[i];
  const email = c.email.trim().toLowerCase();
  if (byEmail.has(email)) continue;
  byEmail.set(email, {
    name: c.name,
    email,
    status: c.status,
    contribution: c.contribution ?? null,
    key: `betaTesters:${i + 1}`,
    groups: ['beta-testers'],
    tags: c.tags,
    joinDate: c.joinDate ?? null,
    legacySource: 'lib/data/betaTesters.ts',
  });
}

if (process.env.SOURCE_CUSTODY_R3_DRY_RUN === '1') {
  console.log(JSON.stringify({ dry_run: true, source_union: byEmail.size }));
  await closePool();
  process.exit(0);
}

const table = await query("SELECT to_regclass('public.ops_contacts') AS name");
if (!table.rows[0]?.name) {
  console.log(JSON.stringify({ skipped: 'ops_contacts_absent' }));
  await closePool();
  process.exit(0);
}

let inserted = 0;
let unique = 0;
let ambiguous = 0;
let unmatched = 0;
for (const c of byEmail.values()) {
  const members = await query(
    'SELECT id FROM members WHERE lower(btrim(email)) = $1',
    [c.email],
  );
  const reconciliation =
    members.rows.length === 1
      ? 'unique_member_match'
      : members.rows.length === 0
        ? 'no_member_match'
        : 'ambiguous_member_match';

  if (reconciliation === 'unique_member_match') unique++;
  else if (reconciliation === 'ambiguous_member_match') ambiguous++;
  else unmatched++;

  const exists = await query(
    "SELECT id FROM ops_contacts WHERE metadata->>'source_custody_key' = $1 AND deleted_at IS NULL",
    [c.key],
  );
  if (exists.rows.length) continue;

  const pipelineStage =
    c.status === 'active' ? 'active' :
    c.status === 'inactive' ? 'churned' : 'exploring';
  const contactType = c.groups.includes('beta-testers') ? 'beta_tester' : 'other';

  await query(
    `INSERT INTO ops_contacts
      (name,email,contact_type,pipeline_stage,source,member_id,notes,metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)`,
    [
      c.name,
      c.email,
      contactType,
      pipelineStage,
      'source-custody-migration',
      members.rows.length === 1 ? members.rows[0].id : null,
      c.contribution,
      JSON.stringify({
        source_custody_key: c.key,
        legacy_source: c.legacySource,
        join_date: c.joinDate,
        groups: c.groups,
        tags: c.tags,
        reconciliation_state: reconciliation,
      }),
    ],
  );
  inserted++;
}

const total = await query(
  "SELECT count(*)::int n FROM ops_contacts WHERE source='source-custody-migration' AND deleted_at IS NULL",
);

console.log(JSON.stringify({
  source_union: byEmail.size,
  inserted,
  total: total.rows[0].n,
  unique_member_match: unique,
  ambiguous_member_match: ambiguous,
  no_member_match: unmatched,
}));

await closePool();
}

main().catch(async (error: any) => {
  console.error('[SOURCE-CUSTODY-R3] migration failed', { name: error?.name ?? 'Error', code: error?.code ?? 'unknown' });
  try { await closePool(); } catch {}
  process.exit(1);
});
