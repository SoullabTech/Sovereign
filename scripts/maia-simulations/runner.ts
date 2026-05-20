/**
 * MAIA SIMULATION RUNNER
 *
 * Runs scenarios from scenarios.json against the conversation route.
 * Captures responses for human evaluation against pass/fail criteria.
 *
 * INVARIANTS:
 *   1. This is mechanism testing, NOT validation. The runner tells you whether
 *      the wiring is correct; it does NOT tell you whether members feel served.
 *      Member experience requires lived contact, not simulation.
 *
 *   2. Runs against a dedicated test member account so synthetic turns do not
 *      pollute real member histories. Default: simulation_test_001.
 *
 *   3. Daily Anchor reconnection cut is not yet built. Running these scenarios
 *      against current MAIA produces BASELINE responses (no anchor in context).
 *      Real scenario testing happens after the cut is wired.
 *
 *   4. Scenario design with bi-polar failure modes (over-restraint AND possession)
 *      is the bi-polar discipline applied at the test layer. Every scenario
 *      specifies how the system fails in BOTH directions, not just one.
 *
 * USAGE (run inside the maia-sovereign docker container):
 *   docker exec -it maia-sovereign npx tsx scripts/maia-simulations/runner.ts
 *   docker exec -it maia-sovereign npx tsx scripts/maia-simulations/runner.ts --scenario S1
 *   docker exec -it maia-sovereign npx tsx scripts/maia-simulations/runner.ts --all
 */

import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const TEST_MEMBER_ID = process.env.SIM_TEST_MEMBER_ID || '26ed1765-d38f-4920-ac56-cfae176b09f3';
const BASE_URL = process.env.SIM_BASE_URL || 'http://localhost:3000';
const SCENARIOS_PATH = join(__dirname, 'scenarios.json');

interface FailMode {
  name: string;
  signature: string;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  yesterdayAnchor: string | null;
  currentInput: string;
  evaluation: {
    isMonoPolar: boolean;
    pass: string[];
    failModes: FailMode[];
  };
}

interface ScenarioPack {
  scenarios: Scenario[];
  metadata: Record<string, any>;
}

interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  sessionId: string;
  success: boolean;
  response: string | null;
  fullResponseJson: any;
  durationMs: number;
  error: string | null;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://soullab@maia-postgres:5432/maia_consciousness',
});

async function setupAnchor(memberId: string, anchorContent: string): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const anchorDate = yesterday.toISOString().slice(0, 10);

  await pool.query(
    `INSERT INTO member_daily_anchors (member_id, anchor_date, prompt_shown, response)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (member_id, anchor_date)
     DO UPDATE SET response = EXCLUDED.response, updated_at = NOW()`,
    [memberId, anchorDate, 'What are you sitting with today?', anchorContent]
  );
}

async function clearAnchor(memberId: string): Promise<void> {
  await pool.query(`DELETE FROM member_daily_anchors WHERE member_id = $1`, [memberId]);
}

async function runConversation(
  memberId: string,
  message: string
): Promise<{ response: any; durationMs: number; error: string | null }> {
  const sessionId = randomUUID();
  const start = Date.now();

  try {
    const res = await fetch(`${BASE_URL}/api/oracle/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: memberId,
        sessionId,
        message,
        conversationHistory: [],
      }),
    });

    const data = await res.json();
    return { response: { ...data, sessionId }, durationMs: Date.now() - start, error: null };
  } catch (err: any) {
    return { response: null, durationMs: Date.now() - start, error: err?.message || String(err) };
  }
}

/**
 * Reference-detection telemetry for diagnostic classification.
 *
 * Identifies four signal classes in MAIA's response relative to the anchor:
 *   - verbatim_match: phrases ≥3 words from anchor appearing in response
 *   - keyword_echo: significant content words from anchor in response
 *   - meta_recognition: language suggesting awareness of prior context
 *     ("you wrote", "I notice", "welcome back", etc.) without actual reference
 *   - response_length: baseline shape comparison
 *
 * Used to classify failure modes:
 *   - attention failure: no signals at all, response indistinguishable from
 *     no-anchor baseline
 *   - policy suppression: meta_recognition present, but no verbatim/keyword
 *     reference (LLM aware of context but suppressing reference)
 *   - semantic failure: keyword_echo present (topic engaged) but no
 *     verbatim_match or meta_recognition (no awareness of thread)
 *   - generation failure: verbatim_match present but awkward/forced
 *     (would require human read; flagged for review)
 */
function detectAnchorSignals(
  anchorContent: string,
  responseText: string,
): {
  verbatimMatches: string[];
  keywordEchoes: string[];
  metaRecognition: string[];
  responseLength: number;
} {
  const responseLower = responseText.toLowerCase();
  const anchorLower = anchorContent.toLowerCase();
  const anchorWords = anchorLower.split(/\s+/).filter((w) => w.length > 0);

  // Verbatim: phrases of 3+ contiguous anchor words appearing in response
  const verbatimMatches: string[] = [];
  for (let len = Math.min(6, anchorWords.length); len >= 3; len--) {
    for (let i = 0; i <= anchorWords.length - len; i++) {
      const phrase = anchorWords
        .slice(i, i + len)
        .join(' ')
        .replace(/[.,!?;:"']/g, '');
      if (phrase.length > 12 && responseLower.includes(phrase)) {
        if (!verbatimMatches.some((m) => m.includes(phrase) || phrase.includes(m))) {
          verbatimMatches.push(phrase);
        }
      }
    }
  }

  // Keyword echoes: significant content words from anchor appearing in response
  const stopWords = new Set([
    'the', 'a', 'an', 'i', 'me', 'my', 'this', 'that', 'is', 'are', 'was', 'were',
    'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'about', 'as', 'so', 'if', 'when', 'where', 'what',
    'just', 'only', 'too', 'also', 'still', 'yet', 'one', 'now', 'then', 'here',
    'there', 'don', 'not', 'no', 'yes', 'it', 'its', 'them', 'they', 'we', 'us',
    'you', 'your', 'all', 'any', 'some', 'into', 'out', 'up', 'down',
  ]);
  const significantAnchorWords = Array.from(
    new Set(
      anchorWords
        .map((w) => w.replace(/[^a-z]/g, ''))
        .filter((w) => w.length > 3 && !stopWords.has(w)),
    ),
  );
  const keywordEchoes = significantAnchorWords.filter((w) =>
    new RegExp(`\\b${w}\\b`).test(responseLower),
  );

  // Meta-recognition: phrases suggesting MAIA perceived prior context
  // (even if she didn't actually reference the anchor's content)
  const metaPhrases = [
    'something in me recognizes',
    'i notice',
    'i hear you',
    'welcome back',
    'good to be here',
    'good to have you here',
    'you mentioned',
    'you said',
    'you wrote',
    'you named',
    "you've been",
    'when you',
    'as you',
    'recently',
    'lately',
    'last time',
    'previously',
    'before',
    'still',
    'again',
    'returning',
    'coming back',
    'continuing',
    'thread',
  ];
  const metaRecognition = metaPhrases.filter((p) => responseLower.includes(p));

  return {
    verbatimMatches,
    keywordEchoes,
    metaRecognition,
    responseLength: responseText.length,
  };
}

async function runScenario(scenario: Scenario, memberId: string): Promise<ScenarioResult> {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`SCENARIO ${scenario.id}: ${scenario.name}`);
  console.log('='.repeat(72));
  console.log(`Description: ${scenario.description}\n`);

  if (scenario.yesterdayAnchor) {
    console.log(`Yesterday's anchor (inserted into member_daily_anchors):`);
    console.log(`  "${scenario.yesterdayAnchor}"\n`);
    await setupAnchor(memberId, scenario.yesterdayAnchor);
  } else {
    await clearAnchor(memberId);
  }

  console.log(`Current input:`);
  console.log(`  "${scenario.currentInput}"\n`);

  console.log(`Pass criteria:`);
  scenario.evaluation.pass.forEach((p) => console.log(`  • ${p}`));
  console.log();

  console.log(`Fail modes (${scenario.evaluation.isMonoPolar ? 'mono-polar' : 'bi-polar'}):`);
  scenario.evaluation.failModes.forEach((f) => {
    console.log(`  ✗ ${f.name}: ${f.signature}`);
  });
  console.log();

  console.log(`Running...`);
  const { response, durationMs, error } = await runConversation(memberId, scenario.currentInput);

  if (error) {
    console.log(`\n❌ ERROR: ${error}`);
    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      sessionId: response?.sessionId || '',
      success: false,
      response: null,
      fullResponseJson: null,
      durationMs,
      error,
    };
  }

  const responseText = response?.response || response?.message || JSON.stringify(response).slice(0, 200);
  console.log(`\n📨 MAIA response (${durationMs}ms):`);
  console.log(`---`);
  console.log(responseText);
  console.log(`---\n`);

  // TELEMETRY: reference detection for failure-mode classification
  if (scenario.yesterdayAnchor) {
    const signals = detectAnchorSignals(scenario.yesterdayAnchor, responseText);
    const expectedReference = scenario.evaluation.pass.some((p) =>
      /referenc|recogniz|using.*language|continuit/i.test(p),
    );
    console.log(`🔍 telemetry:`);
    console.log(`  expected_reference: ${expectedReference}`);
    console.log(`  verbatim_matches:   ${signals.verbatimMatches.length === 0 ? 'none' : JSON.stringify(signals.verbatimMatches)}`);
    console.log(`  keyword_echoes:     ${signals.keywordEchoes.length === 0 ? 'none' : JSON.stringify(signals.keywordEchoes)}`);
    console.log(`  meta_recognition:   ${signals.metaRecognition.length === 0 ? 'none' : JSON.stringify(signals.metaRecognition)}`);
    console.log(`  response_length:    ${signals.responseLength} chars`);
    // Heuristic provisional classification (manual review recommended)
    let provisional: string;
    if (signals.verbatimMatches.length > 0) {
      provisional = expectedReference ? 'reference (likely pass)' : 'reference (possible over-fire)';
    } else if (signals.metaRecognition.length > 0 && signals.keywordEchoes.length === 0) {
      provisional = 'meta-awareness without reference → POLICY SUPPRESSION candidate';
    } else if (signals.keywordEchoes.length >= 2 && signals.metaRecognition.length === 0) {
      provisional = 'topic engaged without thread recognition → SEMANTIC FAILURE candidate';
    } else if (signals.keywordEchoes.length === 0 && signals.metaRecognition.length === 0) {
      provisional = expectedReference ? 'no signal at all → ATTENTION FAILURE candidate' : 'no signal (correct for this scenario)';
    } else {
      provisional = 'mixed signals → manual review';
    }
    console.log(`  provisional_class:  ${provisional}`);
    console.log();
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    sessionId: response?.sessionId || '',
    success: true,
    response: responseText,
    fullResponseJson: response,
    durationMs,
    error: null,
  };
}

function printSummary(results: ScenarioResult[]): void {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`SUMMARY`);
  console.log('='.repeat(72));
  console.log(`Total scenarios: ${results.length}`);
  console.log(`Successful runs: ${results.filter((r) => r.success).length}`);
  console.log(`Errors: ${results.filter((r) => !r.success).length}`);
  console.log(`\nNote: "Successful run" means the route responded without error.`);
  console.log(`It does NOT mean the response passed evaluation criteria.`);
  console.log(`Pass/fail evaluation is human review against the criteria above.\n`);
  console.log(`Baseline note: Daily Anchor is currently orphaned from the conversation`);
  console.log(`route. These responses are baseline (anchor in DB, NOT loaded into context).`);
  console.log(`Real scenario tests happen after the Daily Anchor reconnection cut.\n`);

  results.forEach((r) => {
    const status = r.success ? '✓ ran' : '✗ error';
    console.log(`  ${status}  ${r.scenarioId} (${r.scenarioName})${r.error ? ' — ' + r.error : ''}`);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const scenarioId = args.includes('--scenario') ? args[args.indexOf('--scenario') + 1] : null;
  const all = args.includes('--all');

  const pack: ScenarioPack = JSON.parse(readFileSync(SCENARIOS_PATH, 'utf-8'));

  let toRun: Scenario[];
  if (scenarioId) {
    const s = pack.scenarios.find((s) => s.id === scenarioId);
    if (!s) {
      console.error(`Scenario ${scenarioId} not found`);
      process.exit(1);
    }
    toRun = [s];
  } else if (all) {
    toRun = pack.scenarios;
  } else {
    toRun = [pack.scenarios[0]];
  }

  console.log(`\n${'#'.repeat(72)}`);
  console.log(`# MAIA SIMULATION RUNNER`);
  console.log(`#`);
  console.log(`# Target: ${BASE_URL}`);
  console.log(`# Test member: ${TEST_MEMBER_ID}`);
  console.log(`# Scenarios: ${toRun.map((s) => s.id).join(', ')}`);
  console.log(`# Discipline: mechanism test, NOT validation`);
  console.log(`${'#'.repeat(72)}\n`);

  const results: ScenarioResult[] = [];
  for (const scenario of toRun) {
    try {
      const result = await runScenario(scenario, TEST_MEMBER_ID);
      results.push(result);
    } catch (err: any) {
      console.error(`Scenario ${scenario.id} threw:`, err);
      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        sessionId: '',
        success: false,
        response: null,
        fullResponseJson: null,
        durationMs: 0,
        error: err?.message || String(err),
      });
    }
  }

  printSummary(results);

  await pool.end();
}

main().catch((err) => {
  console.error('Fatal:', err);
  pool.end().catch(() => {});
  process.exit(1);
});
