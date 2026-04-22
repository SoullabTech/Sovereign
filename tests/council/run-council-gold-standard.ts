/**
 * Gold-Standard Council Runner
 *
 * Calls the real production synthesis entrypoint against the gold-standard
 * fixture input and scores the result against the evaluator harness.
 *
 * Targets the narrowest callable unit that still reflects real behavior:
 *   - lib/studio/changes/changeCouncil.ts :: consultChangeCouncil
 *   - lib/studio/leadership/decisionCouncil.ts :: consultDecisionCouncil (optional)
 *
 * Not wired into CI. Run manually:
 *   ANTHROPIC_API_KEY=... npx tsx tests/council/run-council-gold-standard.ts
 *
 * Why not a snapshot? Synthesis output is probabilistic. Snapshots go stale
 * on every model shift. Assertion-based scoring is the durable shape.
 */
import { consultChangeCouncil } from '@/lib/studio/changes/changeCouncil';
import type { ChangeContext } from '@/lib/studio/changes/types';
import { evaluateCouncilSynthesis, loadGoldStandardFixture } from './council-synthesis.evaluator';

const FIXTURE_NAME = 'gold-standard-support-network-synthesis';

/**
 * ChangeContext reconstructed from the fixture's Input section.
 * Keep in sync with tests/fixtures/council/gold-standard-support-network-synthesis.md
 */
const SUPPORT_NETWORK_CHANGE: ChangeContext = {
  title:
    'To begin bringing in support for the platform: developing a support team and/or network around the emergent platform',
  description:
    'I am at the point where it is increasingly important to find and garner true support for the roll out of this platform from the personal/collective development to practitioner field to AIN engine integrations/development.',
  changeType: 'strategic',
  urgency: 'medium',
  emotionalState: 'curious',
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[gold-standard] ANTHROPIC_API_KEY required to run real synthesis.');
    process.exit(2);
  }

  const fixture = loadGoldStandardFixture(FIXTURE_NAME);
  console.log(`[gold-standard] loaded fixture: ${fixture.name}`);

  // Provenance — explicit, so later observation doesn't get muddied
  const startedAt = new Date().toISOString();
  console.log(`[gold-standard] source: fresh Anthropic call`);
  console.log(`[gold-standard]   - no cache layer in consultChangeCouncil (verified)`);
  console.log(`[gold-standard]   - no iterationContext (first consultation)`);
  console.log(`[gold-standard]   - no inputBundle (fixture tests sparse-evidence path)`);
  console.log(`[gold-standard]   - no councilBias (no protocol)`);
  console.log(`[gold-standard]   - started: ${startedAt}`);

  // Evidence bundle intentionally undefined — fixture's "What Is Missing" block
  // is the point: the synthesis must perform well with limited field data.
  const t0 = Date.now();
  const result = await consultChangeCouncil(SUPPORT_NETWORK_CHANGE, undefined, undefined, undefined);
  const latencyMs = Date.now() - t0;
  const completedAt = new Date().toISOString();
  console.log(`[gold-standard]   - completed: ${completedAt} (latency ${latencyMs}ms)`);

  console.log(`[gold-standard] received result. Scoring ...`);
  const report = evaluateCouncilSynthesis(result, fixture);

  console.log('---');
  console.log(report.summary);
  console.log('---');

  if (!report.pass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[gold-standard] runner failed:', err);
  process.exit(1);
});
