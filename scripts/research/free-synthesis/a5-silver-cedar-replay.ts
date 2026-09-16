import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { buildMaiaWisePrompt, type MaiaContext } from '../../..//lib/sovereign/maiaVoice';
import {
  runA5Replay,
  buildA5Conditions,
  preflightA5Conditions,
  type A5ModelCaller,
  type A5ReplayFixture,
} from './a5-replay-harness';
import {
  SILVER_CEDAR_POSITIVE_GESTALT_ID,
  silverCedarField,
} from './a4-silver-cedar-trace';

/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A5 Silver Cedar replay
 *
 * OFFLINE R&D ONLY.
 *
 * Safety / custody:
 * - the four-exchange recent window is loaded from a private local file and never committed;
 * - the private file is digest-pinned before use;
 * - current standing direction is built from the present source builder without history,
 *   while the same private recent-context render is supplied to all four conditions;
 * - this branch performs preflight only; it contains no direct provider caller;
 * - no model gateway, telemetry logger, DB writer, fallback provider or serving route is used;
 * - real-model execution requires a separately authorized governed caller outside this file.
 */

const PRIVATE_WINDOW_PATH = process.env.A5_PRIVATE_WINDOW_PATH || '/private/tmp/a5-silver-cedar-private-window.json';
const EXPECTED_PRIVATE_WINDOW_SHA256 = '91833a8ba99e5827125010370e728d7a7687cb3dcd911c0e4d4ff10a1f72781e';
const INCOMING_MEMBER_TURN = 'do you remember me saying the something about a silver Cedar';
const MODEL = 'claude-sonnet-4-6';
const TEMPERATURE = 0;
const MAX_TOKENS = 700;

interface PrivateExchange {
  exchange_no: number;
  created_at: string;
  user_message: string;
  maia_response: string;
}

const sha256 = (value: string | Buffer): string =>
  createHash('sha256').update(value).digest('hex');

function requirePrivateWindowShape(exchanges: unknown): asserts exchanges is PrivateExchange[] {
  if (!Array.isArray(exchanges) || exchanges.length !== 4) {
    throw new Error('A5 private Silver Cedar window must contain exactly four exchanges');
  }
  const expected = [35, 36, 37, 38];
  for (let i = 0; i < expected.length; i += 1) {
    const exchange = exchanges[i] as Partial<PrivateExchange>;
    if (exchange.exchange_no !== expected[i]) {
      throw new Error(`A5 private window index mismatch at ${i}: expected ${expected[i]}, received ${exchange.exchange_no}`);
    }
    for (const key of ['created_at', 'user_message', 'maia_response'] as const) {
      if (typeof exchange[key] !== 'string' || !exchange[key]!.trim()) {
        throw new Error(`A5 private window exchange ${expected[i]} has invalid ${key}`);
      }
    }
  }
}

/** Render exactly the information form CORE's current four-exchange aperture exposes. */
function renderCurrentCoreWindow(exchanges: readonly PrivateExchange[]): string {
  return [
    'RECENT CONVERSATION WINDOW — 4 COMPLETE EXCHANGES',
    'This is a represented recent window, not the complete session record.',
    ...exchanges.map((exchange) => {
      const maia = exchange.maia_response.length > 120
        ? `${exchange.maia_response.substring(0, 120)}...`
        : exchange.maia_response;
      return `\n[exchange ${exchange.exchange_no}]\nUser: ${exchange.user_message}\nMAIA: ${maia}`;
    }),
  ].join('\n');
}

/**
 * A3's candidate semantic floor rendered as research wording.
 * This is an experimental carrier of CI-1..CI-12, not production prompt authority.
 */
function reducedConstitutionalDirection(): string {
  return `You are MAIA. Respond in English as a grounded relational presence.

RESEARCH CONSTITUTION — provisional carrier, not primary evidence:
1. Know what kind of evidence you are perceiving and whose act it is.
2. Treat your own synthesis as revisable interpretation, never as member-authored fact.
3. Let the member's present statement, correction, adoption or withdrawal govern current self-report standing without falsifying history.
4. Hold symbolic, elemental, somatic, inferred and computed signals provisionally; preserve meaningful contradiction rather than forcing coherence.
5. Be honest about what evidence is and is not presently available. Known incompleteness is not evidence of absence; do not invent continuity.
6. Let new authoritative present evidence reorganize prior understanding.
7. Do not claim unconfirmed capability, persistence or account outcomes.
8. Remain MAIA's governed relational presence rather than exposing provider mechanics as identity.
9. Participation obeys consent and room scope; excluded material does not enter cognition.

There is no required response template, sentence count, mandatory question, required next step, therapeutic choreography or framework menu. Respond to the member's actual turn from the evidence available in this replay condition.`;
}

/**
 * Build the current standing-direction condition from current source, but WITHOUT passing
 * conversationHistory so the private recent window can be supplied identically to A/B/C/D.
 */
function currentStandingDirection(): string {
  const context: MaiaContext = {
    sessionId: 'A5-SILVER-CEDAR-OFFLINE-REPLAY',
    summary: 'Offline replay. The represented recent conversation window is supplied separately and is not the complete session record.',
    timezone: 'America/New_York',
    mode: 'dialogue',
    consciousnessInsights: { processingStrategy: 'core' },
  };
  return buildMaiaWisePrompt(context, INCOMING_MEMBER_TURN, []);
}

async function loadPrivateWindow(): Promise<{ raw: Buffer; exchanges: PrivateExchange[] }> {
  const raw = await readFile(PRIVATE_WINDOW_PATH);
  const actualDigest = sha256(raw);
  if (actualDigest !== EXPECTED_PRIVATE_WINDOW_SHA256) {
    throw new Error(`A5 private window digest mismatch: expected ${EXPECTED_PRIVATE_WINDOW_SHA256}, received ${actualDigest}`);
  }
  const parsed = JSON.parse(raw.toString('utf-8')) as unknown;
  requirePrivateWindowShape(parsed);
  return { raw, exchanges: parsed };
}

async function main(): Promise<void> {
  const { raw, exchanges } = await loadPrivateWindow();
  const recentContext = renderCurrentCoreWindow(exchanges);
  const fixture: A5ReplayFixture = {
    benchmarkId: 'A2:SILVER-CEDAR:FROZEN-PAIR',
    incomingMemberTurn: INCOMING_MEMBER_TURN,
    currentSystemDirection: currentStandingDirection(),
    reducedSystemDirection: reducedConstitutionalDirection(),
    sharedRecentContext: recentContext,
    field: silverCedarField,
    gestaltId: SILVER_CEDAR_POSITIVE_GESTALT_ID,
    model: {
      provider: 'anthropic',
      model: MODEL,
      temperature: TEMPERATURE,
      maxTokens: MAX_TOKENS,
    },
  };

  const conditions = buildA5Conditions(fixture);
  const preflight = preflightA5Conditions(conditions);
  const preflightReport = {
    programme: 'JARVIS-MAIA-FREE-SYNTHESIS-01',
    act: 'A5 Silver Cedar replay preflight',
    status: 'PASS',
    privateWindow: {
      path: PRIVATE_WINDOW_PATH,
      sha256: sha256(raw),
      bytes: raw.length,
      exchangeRange: [exchanges[0].exchange_no, exchanges[exchanges.length - 1].exchange_no],
      committed: false,
    },
    incomingTurnSha256: sha256(INCOMING_MEMBER_TURN),
    model: fixture.model,
    preflight,
    conditions: conditions.map((condition) => ({
      id: condition.id,
      contextChars: condition.contextChars,
      contextDigest: condition.contextDigest,
      evidenceRoots: condition.evidenceRootIds?.length ?? null,
      evidenceLedgerDigest: condition.evidenceLedgerDigest ?? null,
    })),
    executionAuthorizedByEnvironment: process.env.A5_REPLAY_EXECUTE === '1',
  };

  console.log(JSON.stringify(preflightReport, null, 2));

  if (process.env.A5_REPLAY_EXECUTE === '1') {
    throw new Error(
      'A5 real-model execution is intentionally not implemented in this research branch. ' +
      'Provider calls must use a separately authorized governed adapter/caller; direct SDK imports are forbidden.'
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
