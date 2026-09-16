/**
 * TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 · I5 shadow witness
 *
 * Read-only production witness. It imports the candidate SQL strings directly,
 * compares baseline ↔ observed LIVE rows under one repeatable-read snapshot per
 * member, and measures database execution time with EXPLAIN ANALYZE.
 *
 * No member prose is selected or printed. Full member ids remain internal to
 * this process; output uses the repository's derived memberRef only.
 */
import { execFileSync } from 'child_process';
import { memberRef } from '../../lib/privacy/memberRef';
import {
  CUT1_BASELINE_NONVECTOR_SQL,
  CUT1_OBSERVED_NONVECTOR_SQL,
} from '../../lib/memory/cut1Trace';

const SSH_TARGET = process.env.MAIA_PROD_SSH || 'soullab@minisforum';
const PSQL = 'docker exec -i maia-postgres psql -U soullab maia_consciousness -v ON_ERROR_STOP=1 -tA -q';

function psql(sql: string): string {
  return execFileSync('ssh', [SSH_TARGET, PSQL], {
    input: sql,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 8 * 1024 * 1024,
  }).trim();
}

function bindUser(sql: string, userId: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error('unexpected user id shape');
  return sql.replace(/\$1\b/g, `'${userId}'`).trim().replace(/;\s*$/, '');
}

function digestSql(querySql: string, label: string): string {
  return `
    WITH q AS MATERIALIZED (${querySql})
    SELECT '${label}|' || json_build_object(
      'count', COUNT(*),
      'set_digest', md5(COALESCE(string_agg(id::text || ':' || score::text, '|' ORDER BY id::text), '')),
      'order_digest', md5(COALESCE(string_agg(id::text || ':' || score::text, '|' ORDER BY score DESC, id::text), '')),
      'tie_groups', (
        SELECT COUNT(*) FROM (
          SELECT score FROM q GROUP BY score HAVING COUNT(*) > 1
        ) tied
      )
    )::text
    FROM q;
  `;
}

type Digest = { count: number; set_digest: string; order_digest: string; tie_groups: number };

function compareOne(userId: string): { base: Digest; observed: Digest } {
  const baseline = bindUser(CUT1_BASELINE_NONVECTOR_SQL, userId);
  const observed = bindUser(CUT1_OBSERVED_NONVECTOR_SQL, userId);
  const out = psql(`
    BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
    ${digestSql(baseline, 'BASE')}
    ${digestSql(observed, 'OBS')}
    ROLLBACK;
  `);
  const lines = out.split(/\r?\n/).filter(Boolean);
  const baseLine = lines.find((line) => line.startsWith('BASE|'));
  const obsLine = lines.find((line) => line.startsWith('OBS|'));
  if (!baseLine || !obsLine) throw new Error('missing digest output');
  return {
    base: JSON.parse(baseLine.slice(5)),
    observed: JSON.parse(obsLine.slice(4)),
  };
}

function executionTimeMs(querySql: string): number {
  const raw = psql(`EXPLAIN (ANALYZE, FORMAT JSON) ${querySql};`);
  const parsed = JSON.parse(raw);
  return Number(parsed[0]['Execution Time']);
}

const membersRaw = psql(`
  SELECT user_id::text || '|' || COUNT(*)::text
  FROM developmental_memories
  WHERE content_text IS NOT NULL
    AND (valid_to IS NULL OR valid_to > NOW())
  GROUP BY user_id
  HAVING COUNT(*) > 12
  ORDER BY COUNT(*) DESC, user_id;
`);

const members = membersRaw.split(/\r?\n/).filter(Boolean).map((line) => {
  const [userId, count] = line.split('|');
  return { userId, pool: Number(count) };
});

if (members.length === 0) throw new Error('no production pool exceeds Cut 1');

let equivalent = 0;
let tieMembers = 0;
for (const member of members) {
  const { base, observed } = compareOne(member.userId);
  const same = base.count === observed.count
    && base.set_digest === observed.set_digest
    && base.order_digest === observed.order_digest;
  if (!same) {
    console.log(`EQUIV_FAIL member=${memberRef(member.userId)} pool=${member.pool} base=${JSON.stringify(base)} observed=${JSON.stringify(observed)}`);
    process.exitCode = 2;
  } else {
    equivalent += 1;
  }
  if (base.tie_groups > 0 || observed.tie_groups > 0) tieMembers += 1;
}

const reps = [members[0], members[Math.floor(members.length / 2)], members[members.length - 1]]
  .filter((m, i, arr) => arr.findIndex((x) => x.userId === m.userId) === i);

console.log('TEMPORAL_CUT1_SHADOW');
console.log(`cutoff_pools=${members.length}`);
console.log(`equivalent=${equivalent}/${members.length}`);
console.log(`members_with_top12_score_ties=${tieMembers}`);

for (const rep of reps) {
  const baseline = bindUser(CUT1_BASELINE_NONVECTOR_SQL, rep.userId);
  const observed = bindUser(CUT1_OBSERVED_NONVECTOR_SQL, rep.userId);
  const baseTimes: number[] = [];
  const obsTimes: number[] = [];
  for (let i = 0; i < 3; i += 1) {
    baseTimes.push(executionTimeMs(baseline));
    obsTimes.push(executionTimeMs(observed));
  }
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  console.log(
    `TIMING member=${memberRef(rep.userId)} pool=${rep.pool} ` +
    `baseline_ms=${baseTimes.map((n) => n.toFixed(3)).join(',')} ` +
    `observed_ms=${obsTimes.map((n) => n.toFixed(3)).join(',')} ` +
    `baseline_avg=${avg(baseTimes).toFixed(3)} observed_avg=${avg(obsTimes).toFixed(3)}`,
  );
}
