/**
 * JARVIS-JEV-LABEL-01 — execution matrix. Evidence only if ALL hold:
 *   REFERENCE        STRICT passes every falsifier
 *   LETHALITY        every candidate fails its NAMED falsifier
 *   DISCRIMINATION   every OTHER falsifier a candidate fails is a declared, reasoned collateral
 *   STALE-COLLATERAL a declared collateral that stops firing fails the matrix
 *   SURVIVOR LAW     a survivor means NOT EVIDENCE: repair the SUITE, never the candidate
 *   J1 UNTOUCHED     the J1R4 contract + host membrane blobs equal their pins; vocabulary parity holds
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { EvaluationRefused, STRICT, QUESTION_IDS, HOST_FAILURE_REASONS, MODEL_ABSTAIN_REASONS, evaluate, type Decisions } from './core';
import { CFG, build } from './fixtures';
import { FALSIFIERS, type FalsifierResult } from './falsifiers';
import { CANDIDATES } from './candidates';

const out = (s: string): void => void process.stdout.write(`${s}\n`);
const REPO = resolve(__dirname, '../../..');

const PINS = [
  { what: 'J1R4 contract', path: 'docs/programme/JARVIS-JEV-01_J1R4_JUDGMENT_CONTRACT_2026-09-22.md', blob: '98eb6cf16223b83b4768e46e1ae253e7881ae5f5' },
  { what: 'Jev host membrane', path: 'scripts/builder/jev-judgment-host-v1.mjs', blob: '8138beeb387b1264ce386163ea7468108f2d7451' },
] as const;

function blobOf(path: string): string {
  return execFileSync('git', ['hash-object', path], { cwd: REPO, encoding: 'utf8' }).trim();
}

function runAll(d: Decisions): Record<string, FalsifierResult> {
  const res: Record<string, FalsifierResult> = {};
  for (const f of FALSIFIERS) {
    try {
      res[f.id] = f.run(d);
    } catch (e) {
      res[f.id] = { pass: false, detail: `threw: ${e instanceof Error ? e.message : String(e)}` };
    }
  }
  return res;
}

async function main(): Promise<number> {
  let failures = 0;
  const fail = (m: string): void => {
    failures += 1;
    out(`  ✗ ${m}`);
  };

  out('J1 UNTOUCHED');
  for (const p of PINS) {
    const got = blobOf(p.path);
    if (got === p.blob) out(`  ✓ ${p.what} blob ${got.slice(0, 8)}`);
    else fail(`${p.what}: blob ${got} != pinned ${p.blob} — J1 must stay untouched by this lane`);
  }
  const hostUrl = pathToFileURL(resolve(REPO, 'scripts/builder/jev-judgment-host-v1.mjs')).href;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const host: any = await import(hostUrl);
  const same = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((x, i) => x === b[i]);
  const parity: Array<[string, boolean]> = [
    ['QUESTION_IDS', same(QUESTION_IDS, host.QUESTION_IDS)],
    ['HOST_FAILURE_REASONS', same(HOST_FAILURE_REASONS, host.HOST_FAILURE_REASONS)],
    ['MODEL_ABSTAIN_REASONS', same(MODEL_ABSTAIN_REASONS, host.MODEL_ABSTAIN_REASONS)],
  ];
  for (const [name, okk] of parity) {
    if (okk) out(`  ✓ vocabulary parity: ${name}`);
    else fail(`vocabulary drift: ${name} differs from the J1 host`);
  }

  out('\nREFERENCE (STRICT must pass every falsifier)');
  const ref = runAll(STRICT);
  for (const f of FALSIFIERS) {
    const r = ref[f.id]!;
    if (r.pass) out(`  ✓ ${f.id}  ${f.title}`);
    else fail(`${f.id} failed on STRICT: ${r.detail}`);
  }

  out('\nLETHALITY + DISCRIMINATION');
  for (const c of CANDIDATES) {
    const res = runAll(c.decisions);
    const killed = FALSIFIERS.filter((f) => !res[f.id]!.pass).map((f) => f.id);
    const named = killed.includes(c.named);
    const others = killed.filter((id) => id !== c.named);
    const unclassified = others.filter((id) => !(id in c.collateral));
    const stale = Object.keys(c.collateral).filter((id) => !killed.includes(id));
    const status = !named ? 'SURVIVED' : unclassified.length || stale.length ? 'UNCLASSIFIED' : 'DEAD';
    out(`  ${status === 'DEAD' ? '✓' : '✗'} ${c.id.padEnd(28)} ${status.padEnd(12)} named=${c.named} killed=[${killed.join(',')}]`);
    out(`      error:  ${c.error}`);
    if (named) out(`      reason: ${res[c.named]!.detail}`);
    for (const id of others) out(`      collateral ${id}${id in c.collateral ? `: ${c.collateral[id]}` : '  ⛔ UNCLASSIFIED'}`);
    if (!named) fail(`${c.id} SURVIVED ${c.named}: NOT EVIDENCE — repair the suite, not the candidate`);
    for (const id of unclassified) fail(`${c.id}: unclassified collateral ${id}`);
    for (const id of stale) fail(`${c.id}: declared collateral ${id} no longer fires (stale)`);
  }


  out('\nGUARDS (structural refusals with no decision seam — NOT lethality evidence)');
  const refuses = (fn: () => unknown, code: string): boolean => {
    try {
      fn();
      return false;
    } catch (e) {
      return e instanceof EvaluationRefused && e.code === code;
    }
  };
  const small = build([{ n: 30, A: 'C', B: 'C', jev: { kind: 'yn', ans: 'C', conf: 0.9 } }]);
  const guards: Array<[string, boolean]> = [
    ['no defaults: a missing founder-set floor is refused', refuses(() => evaluate({ ...small.input, config: { ...CFG, kappa_floor: Number.NaN } }), 'CONFIG_NOT_FROZEN')],
    ['no defaults: an absent config member is refused', refuses(() => evaluate({ ...small.input, config: { ...CFG, min_positives: undefined as unknown as number } }), 'CONFIG_NOT_FROZEN')],
    [
      'a Score outside [0,1] is refused, never clamped',
      refuses(
        () =>
          evaluate({
            ...small.input,
            judgments: [{ unit_id: 'u00001', received_seq: 9999, judgment: { kind: 'score', question_id: 'Q_DEPTH', score: 1.2, confidence: 0.5 } }],
          }),
        'INVALID_INPUT',
      ),
    ],
    [
      'a duplicate label is refused',
      refuses(() => evaluate({ ...small.input, labels: [...small.input.labels, small.input.labels[0]!] }), 'DUPLICATE_LABEL'),
    ],
    ['a verdict licenses nothing', evaluate(small.input).licenses === 'NOTHING' && evaluate(small.input).evidence_class === 'SYNTHETIC'],
  ];
  for (const [name, okk] of guards) {
    if (okk) out(`  ✓ ${name}`);
    else fail(`guard failed: ${name}`);
  }

  const lethal = failures === 0;
  out(`\n${lethal ? 'MATRIX LETHAL + DISCRIMINATING' : 'MATRIX NOT EVIDENCE'} — ${CANDIDATES.length} candidates · ${FALSIFIERS.length} falsifiers · ${failures} defect(s)`);
  return lethal ? 0 : 1;
}

main().then(
  (c) => process.exit(c),
  (e) => {
    process.stderr.write(`${e instanceof Error ? e.stack : String(e)}\n`);
    process.exit(2);
  },
);
