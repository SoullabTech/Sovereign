/**
 * COUNCIL EXISTENCE RUN — measurement-only, throwaway.
 *
 * Experiment A (Existence): the first-ever observation of five real elemental
 * outputs. Generates Fire / Water / Earth / Air / Aether as real prose
 * (fastMode:false), preserves the raw pre-synthesis outputs.
 *
 * SEQUENTIAL: each voice gets its own single-element bridge and runs alone, so a
 * single local Ollama instance serves one generation at a time. (The parallel
 * fan-out inside processAll starved 4/5 voices into a 30s engine timeout on the
 * first run — that was a concurrency artifact, not a result about the voices.)
 *
 * NOT Experiment B: no destyle, no ablate, no scorer.
 * No writes to agent_runs or any production table. Raw JSON goes to /tmp.
 *
 * Run: node --env-file=.env.local --import tsx scripts/council-existence-run.ts
 */

const QUESTION =
  "Lately I feel like I'm watching my own life from a slight distance — present but not quite in it. I don't know if something's wrong or if this is just what getting older feels like.";

const VOICES = ['fire', 'water', 'earth', 'air', 'aether'];
const ACTIVATE_TIMEOUT_MS = 60_000;
const PER_VOICE_TIMEOUT_MS = 120_000;
const FAILURE_SENTINEL = 'Multi-engine processing failed';

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT[${label}] after ${ms}ms`)), ms),
    ),
  ]);
}

// Fidelity verdict. The first run's latency<50ms heuristic gave a FALSE PASS:
// four 30000ms timeout-fallbacks all cleared the >50ms bar. The honest tells are
// the failure sentinel, a tiny char count, and identical text across voices.
function classify(agent: any): 'real' | 'failed' | 'suspect' {
  const wisdom = (agent?.wisdom || '').trim();
  if (agent?.status !== 'ok') return 'failed';
  if (!wisdom || wisdom === FAILURE_SENTINEL) return 'failed';
  if (wisdom.length < 80) return 'suspect';
  if ((agent?.latencyMs ?? 0) < 50) return 'suspect';
  return 'real';
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log('=== COUNCIL EXISTENCE RUN (Experiment A, SEQUENTIAL) ===');
  console.log('startedAt:', startedAt);
  console.log('question :', QUESTION);
  console.log('voices   :', VOICES.join(', '), '(shadow excluded)');
  console.log('mode     : fastMode=false (real generation) | sequential | no scorer | no prod writes');
  console.log('');

  // Dynamic import so the .env.local values are present before the module graph loads.
  const { ElementalOracleBridge } = await import('../lib/bridges/elemental-oracle-bridge');

  const collected: any[] = [];

  for (const voice of VOICES) {
    const t0 = Date.now();
    console.log(`\n--- ${voice.toUpperCase()} ---`);
    let agent: any = null;
    try {
      // Fresh single-element bridge per voice = full isolation, one Ollama call at a time.
      const bridge = new ElementalOracleBridge({ enabledElements: [voice] });
      await withTimeout(bridge.activate(), ACTIVATE_TIMEOUT_MS, `activate:${voice}`);
      const result = await withTimeout(
        bridge.processAll({ input: QUESTION, includeAll: true, fastMode: false }),
        PER_VOICE_TIMEOUT_MS,
        `processAll:${voice}`,
      );
      const agents = result?.traceData?.elementalAgents ?? [];
      agent = agents.find((a: any) => a.element === voice) ?? agents[0] ?? null;
    } catch (err: any) {
      console.log(`  !! ${voice} threw: ${err?.message || err}`);
      agent = {
        element: voice,
        wisdom: `THREW: ${err?.message || err}`,
        status: 'error',
        latencyMs: Date.now() - t0,
      };
    }

    if (agent) {
      const verdict = classify(agent);
      const chars = (agent.wisdom || '').length;
      console.log(
        `  status=${agent.status} latencyMs=${agent.latencyMs ?? Date.now() - t0} chars=${chars} verdict=${verdict}`,
      );
      console.log(`  preview: ${(agent.wisdom || '').slice(0, 180).replace(/\s+/g, ' ')}`);
      collected.push({ ...agent, verdict });
    } else {
      console.log('  !! no agent returned');
      collected.push({
        element: voice,
        wisdom: '',
        status: 'missing',
        latencyMs: Date.now() - t0,
        verdict: 'failed',
      });
    }
  }

  console.log('\n=== SUMMARY ===');
  const table = collected.map((a: any) => ({
    element: a.element,
    verdict: a.verdict,
    status: a.status,
    latencyMs: a.latencyMs,
    chars: (a.wisdom || '').length,
  }));
  // eslint-disable-next-line no-console
  console.table(table);

  const real = collected.filter((a) => a.verdict === 'real');
  console.log(
    `\nreal voices: ${real.length}/${VOICES.length} (${real.map((a) => a.element).join(', ') || 'none'})`,
  );

  // Identical-text check: a council of one wearing five hats would repeat itself.
  const texts = real.map((a) => (a.wisdom || '').trim());
  if (real.length >= 2 && new Set(texts).size < real.length) {
    console.log('!! FIDELITY WARNING: two or more "real" voices returned identical text — not differentiated.');
  }

  const out = {
    experiment: 'A-existence-sequential',
    startedAt,
    finishedAt: new Date().toISOString(),
    question: QUESTION,
    voicesRequested: VOICES,
    realCount: real.length,
    rawAgents: collected, // full per-voice wisdom + meta + verdict, pre-synthesis
  };

  const fs = await import('fs');
  const outfile = `/tmp/maia-council-existence-seq-${Date.now()}.json`;
  fs.writeFileSync(outfile, JSON.stringify(out, null, 2), 'utf8');
  console.log(`\nraw outputs written to: ${outfile}`);
  console.log('OUTFILE=' + outfile);
}

main().catch((err) => {
  console.error('\nEXISTENCE RUN FAILED:', err?.stack || err);
  process.exit(1);
});
