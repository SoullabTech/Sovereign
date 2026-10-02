/**
 * R2-1 lethality matrix.
 * Suite-first known-bad: contract.ts is absent.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  runR21Laws,
  DIR,
  type LawResult,
  type Subject,
  type ContractRuntime,
} from './laws';

import {
  DEFEAT_CANDIDATES,
  NAMED_KILL,
  CLASSIFIED,
} from './candidates/index';

const line = (s: string) =>
  process.stdout.write(s + '\n');

let exit = 0;

const failed = (rs: LawResult[]) =>
  rs.filter((r) => !r.ok);

const ROOT = process.cwd();

function load(
  rel: string
): ContractRuntime | undefined {
  if (!existsSync(join(ROOT, rel)))
    return undefined;

  try {
    return require(
      join(ROOT, rel)
    ) as ContractRuntime;
  } catch {
    return undefined;
  }
}

async function main() {
  line('');
  line(
    '── FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-1 · PURE REVIEW DISCUSS ACT CONTRACT ──'
  );
  line('');

  const contractFile =
    `${DIR}/contract.ts`;

  const REFERENCE: Subject = {
    name: 'REFERENCE',
    contractFile,
    runtime: load(contractFile),
  };

  const ref =
    await runR21Laws(REFERENCE);

  for (const r of ref) {
    line(
      `  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  — ${r.detail}`
    );
  }

  if (failed(ref).length) {
    exit = 1;
    line(
      '  ⛔ THE REFERENCE MUST PASS EVERY LAW'
    );
  }

  line('');

  let dead = 0;
  let skipped = 0;

  for (const c of DEFEAT_CANDIDATES) {
    const file =
      `${DIR}/candidates/${c.file}`;

    const runtime =
      load(file);

    if (!runtime) {
      skipped += 1;
      exit = 1;

      line(
        `  SKIPPED     ${c.name.padEnd(48)} (candidate cannot load — no contract to be wrong about)`
      );

      continue;
    }

    const named =
      NAMED_KILL[c.name];

    const dl =
      failed(
        await runR21Laws({
          name: c.name,
          contractFile: file,
          runtime,
        })
      ).map((r) => r.id);

    if (!named || !dl.includes(named)) {
      exit = 1;

      line(
        `  ⛔ SURVIVED   ${c.name} → ${named} · failed: ${dl.join(', ') || 'nothing'}`
      );

      continue;
    }

    dead += 1;

    const collateral =
      dl
        .filter((id) => id !== named)
        .filter(
          (id) =>
            !failed(ref).some(
              (r) => r.id === id
            )
        );

    const allowed =
      CLASSIFIED[c.name] ?? [];

    const un =
      collateral.filter(
        (id) => !allowed.includes(id)
      );

    const stale =
      allowed.filter(
        (id) => !collateral.includes(id)
      );

    line(
      `  DEAD        ${c.name.padEnd(48)} → ${named}` +
      (
        collateral.length
          ? `   collateral: ${collateral.join(', ')}` +
            (
              un.length
                ? ' ⛔ UNCLASSIFIED'
                : ' (classified)'
            )
          : ''
      )
    );

    if (un.length || stale.length)
      exit = 1;

    if (stale.length) {
      line(
        `              ⚠️ stale classification: ${stale.join(', ')}`
      );
    }
  }

  line('');
  line(
    '── VERDICT ──────────────────────────────────────────────────────────'
  );

  line(
    `  reference            ${ref.length - failed(ref).length}/${ref.length}`
  );

  line(
    `  candidates dead      ${dead}/${DEFEAT_CANDIDATES.length}` +
    (
      skipped
        ? ` (${skipped} skipped)`
        : ''
    )
  );

  line(
    `  matrix               ${
      exit === 0
        ? 'LETHAL + DISCRIMINATING'
        : '⛔ NOT LETHAL'
    }`
  );

  line('');
  line(
    '  R2-1 defines ONE persisted, history-empty AS_READ cognition act.'
  );
  line(
    '  ⛔ No runtime · no provider call · no DB/schema change · no UI · no R2-2 authority.'
  );
  line('');

  process.exit(exit);
}

void main();
