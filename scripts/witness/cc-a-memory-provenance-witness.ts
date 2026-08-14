/**
 * CC-A / W-1 — runtime witness for per-turn memory provenance.
 *
 * Drives the REAL `getMaiaResponse` FAST path (not a mock, not a reimplementation) and
 * captures the `[MAIA/memprov]` records it emits, so the memory fork is observed rather
 * than reasoned about.
 *
 * WHAT THIS WITNESSES
 *   That a served turn's memory provenance is observable, and that the absent /
 *   present-but-empty / suppressed conditions are distinguishable at runtime.
 *
 * WHAT THIS DOES NOT WITNESS
 *   Memory correctness. Continuity correctness. Containment. Relational safety.
 *   Equivalence across MAIA surfaces. Production behavior — this runs against the LOCAL
 *   dev database and the worktree build, NOT against the deployed production SHA.
 *
 * DATA
 *   Uses a synthetic member UUID generated per run. No real member, clinical, or PHI data.
 *
 * Run:  npx tsx scripts/witness/cc-a-memory-provenance-witness.ts
 */

import { randomUUID } from 'crypto';
import { MEMORY_PROVENANCE_MARKER } from '../../lib/memory/provenance/turnMemoryProvenance';

type Case = {
  id: string;
  label: string;
  expect: string;
  memoryContext: string | undefined;
  withIdentity: boolean;
  sanctuary?: boolean;
};

const SYNTHETIC_MEMBER = randomUUID();

const CASES: Case[] = [
  {
    id: 'A',
    label: 'canonical bundle supplied and used',
    expect: 'bundleState=present_nonempty fallbackInvoked=false contextOrigin=canonical_bundle',
    memoryContext: 'Relationship: 3 prior encounters. Recent theme: returning to a stalled project.',
    withIdentity: true,
  },
  {
    id: 'B',
    label: 'canonical bundle ABSENT — fallback path',
    expect: 'bundleState=absent fallbackInvoked=true memoryOrchestratorDirect=true',
    memoryContext: undefined,
    withIdentity: true,
  },
  {
    id: "B'",
    label: 'canonical bundle PRESENT BUT EMPTY — the decisive distinction',
    expect: 'bundleState=present_empty fallbackInvoked=true reason=bundle_present_empty',
    memoryContext: '',
    withIdentity: true,
  },
  {
    id: 'C',
    label: 'canonical bundle absent AND no fallback (no member identity)',
    expect: 'bundleState=absent fallbackInvoked=false reason=no_member_identity',
    memoryContext: undefined,
    withIdentity: false,
  },
  {
    id: 'D',
    label: 'sanctuary — memory suppressed by consent, not by failure',
    expect: 'bundleState=suppressed_sanctuary fallbackInvoked=false',
    memoryContext: 'this must be ignored under sanctuary',
    withIdentity: true,
    sanctuary: true,
  },
];

async function main() {
  const { getMaiaResponse } = await import('../../lib/sovereign/maiaService');

  const captured: Array<{ caseId: string; record: any }> = [];
  const realLog = console.log.bind(console);
  let currentCase = '';

  console.log = (...args: unknown[]) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (first.startsWith(MEMORY_PROVENANCE_MARKER)) {
      try {
        captured.push({
          caseId: currentCase,
          record: JSON.parse(first.slice(MEMORY_PROVENANCE_MARKER.length).trim()),
        });
      } catch {
        /* keep going — a malformed record is itself a finding, surfaced by absence below */
      }
    }
    realLog(...args);
  };

  for (const c of CASES) {
    currentCase = c.id;
    const meta: Record<string, unknown> = {
      sanctuary: c.sanctuary === true,
      originRoute: 'witness/cc-a',
    };
    if (c.memoryContext !== undefined) meta.memoryContext = c.memoryContext;
    if (c.withIdentity) meta.userId = SYNTHETIC_MEMBER;

    try {
      await getMaiaResponse({
        sessionId: `cc-a-witness-${c.id}-${randomUUID().slice(0, 8)}`,
        input: 'hello',
        meta,
        processingProfileOverride: 'FAST',
      } as any);
    } catch (err) {
      realLog(`\n[witness] case ${c.id} threw: ${(err as Error)?.message}`);
    }
  }

  console.log = realLog;

  realLog('\n\n================ CC-A / W-1 WITNESS RESULT ================');
  realLog(`synthetic member: ${SYNTHETIC_MEMBER}`);
  realLog(`build sha (GIT_COMMIT): ${process.env.GIT_COMMIT ?? 'unknown (local worktree run)'}\n`);

  for (const c of CASES) {
    const rec = captured.find((r) => r.caseId === c.id && r.record?.tier === 'FAST')?.record;
    realLog(`--- case ${c.id}: ${c.label}`);
    realLog(`    expected : ${c.expect}`);
    if (!rec) {
      realLog('    OBSERVED : (no provenance record emitted) ❌\n');
      continue;
    }
    realLog(
      `    observed : bundleState=${rec.bundleState} bundleConsulted=${rec.bundleConsulted} ` +
        `fallbackInvoked=${rec.fallbackInvoked} reason=${rec.fallbackReason} ` +
        `orchestratorDirect=${rec.memoryOrchestratorDirect} origin=${rec.contextOrigin} ` +
        `chars=${rec.contextChars} digest=${rec.contextDigest ?? '-'} id=${rec.provenanceId}`
    );
    realLog('');
  }

  const states = new Set(captured.filter((r) => r.record?.tier === 'FAST').map((r) => r.record.bundleState));
  realLog(`distinct bundle states observed: ${[...states].join(', ') || '(none)'}`);
  realLog(
    states.has('absent') && states.has('present_empty')
      ? '✅ absent and present_empty are distinguishable at runtime.'
      : '❌ absent / present_empty were NOT both observed.'
  );
  realLog('===========================================================\n');
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
