/**
 * Gold-Standard Decision Council Runner
 *
 * Parallel to run-council-gold-standard.ts but targets the Decisions surface:
 *   lib/studio/leadership/decisionCouncil.ts :: consultDecisionCouncil
 *
 * Reuses the same fixture and evaluator — the gold-standard behavioral rules
 * (plurality, missing-data naming, robust-move framing, no convergence
 * rhetoric) apply equally to Changes and Decisions synthesis.
 *
 * Not wired into CI. Run manually:
 *   ANTHROPIC_API_KEY=... npx tsx tests/council/run-decision-gold-standard.ts
 */
import { consultDecisionCouncil } from '@/lib/studio/leadership/decisionCouncil';
import type { DecisionContext } from '@/lib/studio/leadership/types';
import { evaluateCouncilSynthesis, loadGoldStandardFixture } from './council-synthesis.evaluator';

const FIXTURE_NAME = 'gold-standard-support-network-synthesis';

/**
 * DecisionContext reconstructed from the fixture's Input section.
 * Same scenario as the Changes runner — keeps cross-surface results comparable.
 * Keep in sync with tests/fixtures/council/gold-standard-support-network-synthesis.md
 */
const SUPPORT_NETWORK_DECISION: DecisionContext = {
  title:
    'To begin bringing in support for the platform: developing a support team and/or network around the emergent platform',
  context:
    'I am at the point where it is increasingly important to find and garner true support for the roll out of this platform from the personal/collective development to practitioner field to AIN engine integrations/development.',
  stakes: 'A logical, intuitive, organic, and generative roll out or a mess.',
  timePressure: 'medium',
  emotionalState: 'curious',
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[gold-standard/decision] ANTHROPIC_API_KEY required to run real synthesis.');
    process.exit(2);
  }

  const fixture = loadGoldStandardFixture(FIXTURE_NAME);
  console.log(`[gold-standard/decision] loaded fixture: ${fixture.name}`);

  const startedAt = new Date().toISOString();
  console.log(`[gold-standard/decision] source: fresh Anthropic call`);
  console.log(`[gold-standard/decision]   - no iterationContext (first consultation)`);
  console.log(`[gold-standard/decision]   - no inputBundle (sparse-evidence path)`);
  console.log(`[gold-standard/decision]   - no councilBias (no protocol)`);
  console.log(`[gold-standard/decision]   - started: ${startedAt}`);

  const t0 = Date.now();
  const result = await consultDecisionCouncil(
    SUPPORT_NETWORK_DECISION,
    undefined,
    undefined,
    undefined,
  );
  const latencyMs = Date.now() - t0;
  const completedAt = new Date().toISOString();
  console.log(`[gold-standard/decision]   - completed: ${completedAt} (latency ${latencyMs}ms)`);

  console.log(`[gold-standard/decision] received result. Scoring ...`);
  const report = evaluateCouncilSynthesis(result, fixture);

  console.log('---');
  console.log(report.summary);
  console.log('---');

  if (!report.pass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[gold-standard/decision] runner failed:', err);
  process.exit(1);
});
