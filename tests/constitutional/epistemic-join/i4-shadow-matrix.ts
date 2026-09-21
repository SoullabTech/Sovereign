/**
 * JARVIS-KP-01 / I4 — integration-shadow falsification matrix.
 *
 * Run:
 *   npx tsx tests/constitutional/epistemic-join/i4-shadow-matrix.ts
 *
 * Synthetic inputs only. No production data, database, network, provider, or
 * persistence execution.
 */

import { readFileSync } from 'node:fs';
import { evaluateJoin } from '../../../lib/ain/epistemic-join/evaluate';
import { epistemicJoinPersistenceEnabled } from '../../../lib/ain/epistemic-join/persistence/feature';
import {
  EPISTEMIC_JOIN_INTEGRATION_SHADOW_FLAG,
  epistemicJoinIntegrationShadowEnabled,
} from '../../../lib/ain/epistemic-join/shadow/feature';
import {
  runNowWhatCellShadow,
  translateNowWhatCellCandidate,
  type ShadowCellCandidate,
} from '../../../lib/ain/epistemic-join/shadow/nowWhatCell';

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const candidate: ShadowCellCandidate = {
  element: 'Air',
  phase: 2,
  confidence: 0.7,
  source: 'system_inferred',
};

const enabledEnv = {
  [EPISTEMIC_JOIN_INTEGRATION_SHADOW_FLAG]: '1',
} as NodeJS.ProcessEnv;

const memberScope = 'synthetic-member-i4';

async function evaluated() {
  return runNowWhatCellShadow({
    memberScope,
    jurisdiction: 'maia_conversational_inquiry',
    candidate,
    env: enabledEnv,
  });
}

const shadowSource = readFileSync(
  'lib/ain/epistemic-join/shadow/nowWhatCell.ts',
  'utf8',
);
const routeSource = readFileSync('app/api/now-what/interview/route.ts', 'utf8');

const cases: Array<{ name: string; run: () => void | Promise<void> }> = [
  {
    name: 'F01 shadow flag absent means OFF',
    run: () => {
      invariant(!epistemicJoinIntegrationShadowEnabled({}), 'absence must be OFF');
    },
  },
  {
    name: 'F02 false-like values remain OFF',
    run: () => {
      for (const value of ['', '0', 'false', 'true', 'yes']) {
        invariant(
          !epistemicJoinIntegrationShadowEnabled({
            [EPISTEMIC_JOIN_INTEGRATION_SHADOW_FLAG]: value,
          }),
          `value ${JSON.stringify(value)} must remain OFF`,
        );
      }
    },
  },
  {
    name: 'F03 enabled real shadow reaches canonical I2 evaluation',
    run: async () => {
      const event = await evaluated();
      invariant(event.status === 'evaluated', 'enabled shadow must evaluate');
      invariant(
        event.admittedStanding === 'CANDIDATE_UNESTABLISHED',
        'unwarranted system inference must remain candidate',
      );
    },
  },
  {
    name: 'F04 route discards shadow result and preserves response shape',
    run: () => {
      invariant(
        routeSource.includes('await runNowWhatCellShadow({'),
        'real route must invoke the shadow',
      );
      invariant(
        !/const\s+\w*shadow\w*\s*=\s*await\s+runNowWhatCellShadow/i.test(routeSource),
        'route must not retain a shadow verdict for response logic',
      );
      invariant(
        routeSource.includes('reply: raw,\n        cellCandidate,\n        served:'),
        'active response fields must remain reply/cellCandidate/served',
      );
    },
  },
  {
    name: 'F05 shadow has no routing handle',
    run: () => {
      invariant(!/from ['"][^'"]*(router|routing)[^'"]*['"]/.test(shadowSource), 'no router import allowed');
      invariant(!shadowSource.includes('routeDecision'), 'no route decision authority allowed');
    },
  },
  {
    name: 'F06 shadow has no provider or model-selection handle',
    run: () => {
      invariant(!/from ['"][^'"]*(LLMProvider|provider)[^'"]*['"]/.test(shadowSource), 'no provider import allowed');
      invariant(!shadowSource.includes('forceClaude'), 'no provider selection authority allowed');
    },
  },
  {
    name: 'F07 shadow cannot write Member Memory',
    run: () => {
      invariant(!/from ['"][^'"]*(memory|member-memory)[^'"]*['"]/.test(shadowSource), 'no memory import allowed');
    },
  },
  {
    name: 'F08 shadow cannot write Wisdom Graph',
    run: () => {
      invariant(!/from ['"][^'"]*wisdom[^'"]*['"]/.test(shadowSource), 'no Wisdom Graph import allowed');
    },
  },
  {
    name: 'F09 shadow cannot write Living Constellation',
    run: () => {
      invariant(!/from ['"][^'"]*living-constellation[^'"]*['"]/.test(shadowSource), 'no Living Constellation import allowed');
    },
  },
  {
    name: 'F10 shadow cannot write Relational Practice Ledger',
    run: () => {
      invariant(!/from ['"][^'"]*(relational-ledger|practice-ledger)[^'"]*['"]/.test(shadowSource), 'no relational ledger import allowed');
    },
  },
  {
    name: 'F11 shadow does not import or invoke the I3 store',
    run: () => {
      invariant(!shadowSource.includes('persistence/store'), 'I3 store import forbidden');
      invariant(!/persist[A-Z_a-z]*\s*\(/.test(shadowSource), 'persistence call forbidden');
    },
  },
  {
    name: 'F12 malformed translation is behaviorally inert',
    run: async () => {
      const malformed = new Proxy(candidate, {
        get(target, prop, receiver) {
          if (prop === 'element') throw new Error('synthetic translation fault');
          return Reflect.get(target, prop, receiver);
        },
      });
      const event = await runNowWhatCellShadow({
        memberScope,
        jurisdiction: 'maia_conversational_inquiry',
        candidate: malformed,
        env: enabledEnv,
      });
      invariant(event.status === 'evaluation_error', 'translation exception must be contained');
      invariant(event.downstreamRepresentationAuthorized === false, 'failure must not open representation');
    },
  },
  {
    name: 'F13 missing warrant fails closed above candidate standing',
    run: () => {
      const translated = translateNowWhatCellCandidate({
        memberScope,
        jurisdiction: 'maia_conversational_inquiry',
        candidate,
      });
      invariant(translated.ok, 'control translation must succeed');
      const verdict = evaluateJoin({
        ...translated.request,
        requestedStanding: 'WARRANTED',
      });
      invariant(
        verdict.refusals.some((item) => item.code === 'no_warrant_offered'),
        'warrantless elevation must be refused',
      );
      invariant(
        verdict.admittedStanding !== 'WARRANTED' && verdict.admittedStanding !== 'PROMOTED',
        'warrantless elevation must not receive warranted or promoted standing',
      );
      invariant(
        verdict.lowerStandingRepresentationPermitted,
        'failed elevation must preserve lower-standing hypothesis representation',
      );
    },
  },
  {
    name: 'F14 missing jurisdiction fails closed before evaluation',
    run: () => {
      const translated = translateNowWhatCellCandidate({
        memberScope,
        jurisdiction: null,
        candidate,
      });
      invariant(!translated.ok, 'missing jurisdiction must refuse translation');
      if (!translated.ok) {
        invariant(translated.reason === 'missing_jurisdiction', 'refusal must name missing jurisdiction');
      }
    },
  },
  {
    name: 'F15 member confirmation is never fabricated',
    run: () => {
      const translated = translateNowWhatCellCandidate({
        memberScope,
        jurisdiction: 'maia_conversational_inquiry',
        candidate,
      });
      invariant(translated.ok, 'control translation must succeed');
      if (!translated.ok) return;
      invariant(translated.request.adoptionActs.length === 0, 'no adoption act may be synthesized');
      invariant(
        translated.request.envelope.authorship.authorClass === 'MAIA_PROPOSED',
        'system inference must remain MAIA-proposed',
      );
    },
  },
  {
    name: 'F16 reference and reliance remain explicit and disjoint',
    run: () => {
      const translated = translateNowWhatCellCandidate({
        memberScope,
        jurisdiction: 'maia_conversational_inquiry',
        candidate,
      });
      invariant(translated.ok, 'control translation must succeed');
      if (!translated.ok) return;
      const relied = new Set(translated.request.envelope.provenance.reliedUponRefs);
      const referenceOnly = new Set(translated.request.envelope.provenance.referenceOnlyRefs);
      invariant(referenceOnly.size === 0, 'adapter must not silently create reference-only support');
      invariant(
        translated.request.envelope.endpoints.every(
          (endpoint) => endpoint.mode === 'reliance' && relied.has(endpoint.endpointId),
        ),
        'every relied endpoint must be explicitly declared as reliance',
      );
    },
  },
  {
    name: 'F17 observability sink exceptions cannot fail shadow execution',
    run: async () => {
      const event = await runNowWhatCellShadow({
        memberScope,
        jurisdiction: 'maia_conversational_inquiry',
        candidate,
        env: enabledEnv,
        emit: () => {
          throw new Error('synthetic telemetry sink failure');
        },
      });
      invariant(event.status === 'evaluated', 'sink failure must not affect evaluation result');
    },
  },
  {
    name: 'F18 structural telemetry contains no member/proposition content',
    run: async () => {
      const secretMember = 'member-secret-do-not-log';
      let captured = '';
      await runNowWhatCellShadow({
        memberScope: secretMember,
        jurisdiction: 'maia_conversational_inquiry',
        candidate,
        env: enabledEnv,
        emit: (event) => {
          captured = JSON.stringify(event);
        },
      });
      invariant(!captured.includes(secretMember), 'telemetry must not contain member scope');
      invariant(!captured.includes('proposition'), 'telemetry must not contain proposition fields');
      invariant(!captured.includes(candidate.element), 'telemetry must not contain inferred content label');
    },
  },
  {
    name: 'F19 downstream representation authority remains literally false',
    run: async () => {
      const event = await evaluated();
      invariant(event.downstreamRepresentationAuthorized === false, 'shadow must never authorize representation');
      const translated = translateNowWhatCellCandidate({
        memberScope,
        jurisdiction: 'maia_conversational_inquiry',
        candidate,
      });
      invariant(translated.ok, 'control translation must succeed');
      if (!translated.ok) return;
      invariant(
        evaluateJoin(translated.request).downstreamRepresentationAuthorized === false,
        'canonical I2 must remain closed',
      );
    },
  },
  {
    name: 'F20 I4 flag cannot activate the independent I3 persistence flag',
    run: () => {
      invariant(
        epistemicJoinIntegrationShadowEnabled(enabledEnv),
        'shadow control flag should be ON',
      );
      invariant(
        !epistemicJoinPersistenceEnabled(enabledEnv),
        'shadow flag must not imply persistence enablement',
      );
    },
  },
];

async function main(): Promise<void> {
  let failures = 0;
  console.log('JARVIS-KP-01 / I4 — EPISTEMIC JOIN INTEGRATION SHADOW MATRIX\n');

  for (const testCase of cases) {
    try {
      await testCase.run();
      console.log(`PASS  ${testCase.name}`);
    } catch (error) {
      failures += 1;
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`FAIL  ${testCase.name}\n      ${detail}`);
    }
  }

  console.log(`\nRESULT: ${cases.length - failures}/${cases.length} PASS`);
  console.log('SHADOW AUTHORITY: OBSERVATION ONLY');
  console.log('I3 PERSISTENCE: NOT ACTIVATED');
  console.log('DOWNSTREAM REPRESENTATION: CLOSED');

  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
