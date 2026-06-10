/**
 * Stewardship usage ledger — substrate verification against the LOCAL dev DB.
 *
 * Proves: cost-to-provide math, fire-and-forget recording, the Sanctuary
 * aggregate-anonymous guarantee (incl. the DB CHECK constraint), rollups, and the
 * unified usage_ledger view. Does NOT exercise a live Claude turn — that is the
 * next gate (authenticated curl under real traffic).
 *
 * Run: npx tsx scripts/repro/stewardship-ledger-verify.ts
 */
import { computeCostMicros } from '@/lib/stewardship/rateCard';
import {
  recordUsageEvent,
  getMemberUsageSummary,
  getSystemUsageSummary,
} from '@/lib/stewardship/usageLedger';
import { query, pool } from '@/lib/db/postgres';

const TEST_MEMBER = 'test-stewardship-verify-member';
const TEST_ROUTE = 'test:stewardship-verify';

async function main() {
  console.log('== 1. computeCostMicros (cost-to-provide, micro-USD) ==');
  const cases: Array<{ label: string; expect: number; args: Parameters<typeof computeCostMicros>[0] }> = [
    { label: 'sonnet 1000in/500out', expect: 10500, args: { provider: 'anthropic', model: 'claude-sonnet-4-6', inputTokens: 1000, outputTokens: 500 } },
    { label: 'opus 1000in/1000out', expect: 30000, args: { provider: 'anthropic', model: 'claude-opus-4-6', inputTokens: 1000, outputTokens: 1000 } },
    { label: 'haiku 2000in + 10000 cacheRead', expect: 3000, args: { provider: 'anthropic', model: 'claude-haiku-4-5', inputTokens: 2000, outputTokens: 0, cacheReadTokens: 10000 } },
    { label: 'local (deepseek)', expect: 0, args: { provider: 'local', model: 'deepseek-r1:8b', inputTokens: 9999, outputTokens: 9999 } },
  ];
  for (const c of cases) {
    const got = computeCostMicros(c.args);
    console.log(`  ${got === c.expect ? '✅' : '❌'} ${c.label}: ${got} (expect ${c.expect})`);
  }

  await query(`DELETE FROM usage_events WHERE route = $1 OR member_id = $2`, [TEST_ROUTE, TEST_MEMBER]);

  console.log('\n== 2. recordUsageEvent: member LLM event ==');
  recordUsageEvent({
    kind: 'llm', provider: 'anthropic', model: 'claude-sonnet-4-6',
    usage: { input_tokens: 1200, output_tokens: 800, cache_read_input_tokens: 5000 },
    meta: { userId: TEST_MEMBER, sessionId: 'sess-abc', processingProfile: 'CORE', route: TEST_ROUTE, tier: 'personal' },
    latencyMs: 1234,
  });

  console.log('== 3. recordUsageEvent: SANCTUARY event (must be anonymous) ==');
  recordUsageEvent({
    kind: 'llm', provider: 'anthropic', model: 'claude-sonnet-4-6',
    usage: { input_tokens: 999, output_tokens: 111 },
    meta: { userId: 'SHOULD-BE-DROPPED', sessionId: 'SHOULD-DROP', sanctuary: true, route: TEST_ROUTE, processingProfile: 'FAST' },
    latencyMs: 500,
  });

  await new Promise((r) => setTimeout(r, 1000)); // let fire-and-forget INSERTs land

  console.log('\n== 4. Rows written ==');
  const rows = await query(
    `SELECT member_id, is_sanctuary, kind, provider, model, processing_profile,
            input_tokens, output_tokens, cache_read_tokens, cost_micros, meta
     FROM usage_events WHERE route = $1 ORDER BY id`, [TEST_ROUTE]);
  for (const r of rows.rows) console.log('  ', JSON.stringify(r));

  const member = rows.rows.find((r: any) => r.is_sanctuary === false);
  const sanct = rows.rows.find((r: any) => r.is_sanctuary === true);
  const check = (cond: boolean, msg: string) => console.log(`  ${cond ? '✅' : '❌'} ${msg}`);

  console.log('\n== 5. Assertions ==');
  check(member?.member_id === TEST_MEMBER, `member row attributed to ${TEST_MEMBER}`);
  check(Number(member?.cost_micros) === 17100, `member cost_micros = 17100 (1200*3 + 800*15 + 5000*0.3) — got ${member?.cost_micros}`);
  check(sanct?.member_id === null, `sanctuary row member_id is NULL (anonymous) — got ${JSON.stringify(sanct?.member_id)}`);
  check(JSON.stringify(sanct?.meta) === '{}', `sanctuary meta carries NO session linkage — got ${JSON.stringify(sanct?.meta)}`);

  console.log('\n== 6. CHECK constraint: sanctuary + member_id must be rejected ==');
  try {
    await query(
      `INSERT INTO usage_events (member_id, is_sanctuary, kind, provider, route) VALUES ($1, true, 'llm', 'anthropic', $2)`,
      [TEST_MEMBER, TEST_ROUTE]);
    console.log('  ❌ FAIL: insert succeeded — constraint NOT enforced');
  } catch (e: any) {
    console.log('  ✅ rejected by DB:', String(e.message).split('\n')[0]);
  }

  console.log('\n== 7. Rollups ==');
  console.log('  member summary:', JSON.stringify(await getMemberUsageSummary(TEST_MEMBER)));
  console.log('  system by provider:', JSON.stringify(await getSystemUsageSummary({ groupBy: 'provider' })));

  console.log('\n== 8. usage_ledger view (usage_events ∪ audio_usage_events) ==');
  try {
    const v = await query(`SELECT source, count(*)::int AS n FROM usage_ledger GROUP BY source ORDER BY source`);
    console.log('  view rows by source:', JSON.stringify(v.rows));
  } catch (e: any) {
    console.log('  view error:', String(e.message).split('\n')[0]);
  }

  await query(`DELETE FROM usage_events WHERE route = $1 OR member_id = $2`, [TEST_ROUTE, TEST_MEMBER]);
  console.log('\n(cleaned up test rows)');
  await pool?.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
