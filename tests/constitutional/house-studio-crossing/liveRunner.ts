/**
 * H1-R1 G5 — the REAL intake through the suite that was proven lethal before
 * it existed. The falsifiers are imported unchanged; if the real intake fails
 * one, the intake is repaired, never the falsifier.
 *
 * `npm run verify:house-studio-crossing`
 */
import { FALSIFIERS } from './falsifiers';
import type { IntakeResolver } from './contract';
import { resolveWorkIntake } from '../../../app/writers-studio/workIntake';
import { runGuards } from './guards';
import { A_FALSIFIERS } from './amendment/falsifiers';
import type { CtxResolver } from './amendment/contract';
import { resolveWorkContext } from '../../../app/writers-studio/workContext';
import type { LivingWork } from '../../../app/writers-studio/useLivingWorks';

/* The real WS2-03B resolver takes full LivingWork rows; the laws only need identity and
   declarations. Fill the rest with honest nulls and map the answer back by identity. */
const realCtx: CtxResolver = (phase, works, manuscriptId, explicitWorkId) => {
  const full: LivingWork[] = works.map((w) => ({
    id: w.id, title: null, purpose: null, form: null, stage: null, manuscriptState: null,
    createdAt: '', updatedAt: '', materials: [],
    expressions: w.expressions.map((e) => ({ ...e, declaredAt: '' })),
  }));
  const byId = new Map(works.map((w) => [w.id, w]));
  const out = resolveWorkContext(phase, full, manuscriptId, explicitWorkId ?? null);
  if (out.kind === 'work') return { kind: 'work', work: byId.get(out.work.id)! };
  if (out.kind === 'ambiguous') return { kind: 'ambiguous', works: out.works.map((w) => byId.get(w.id)!) };
  return out;
};

// Structural conformance: the real intake must satisfy the contract's type.
const real: IntakeResolver = resolveWorkIntake;

let failed = false;
for (const f of FALSIFIERS) {
  const reason = f.check(real);
  console.log(`real  ${f.id}  ${reason === null ? 'PASS' : 'FAIL — ' + reason}`);
  if (reason !== null) failed = true;
}

for (const f of A_FALSIFIERS) {
  const reason = f.check(realCtx);
  console.log(`real  ${f.id}  ${reason === null ? 'PASS' : 'FAIL — ' + reason}`);
  if (reason !== null) failed = true;
}

const guards = runGuards();
for (const g of guards) {
  console.log(`guard ${g.id}  ${g.reason === null ? 'PASS' : 'FAIL — ' + g.reason}`);
  if (g.reason !== null) failed = true;
}

console.log(failed ? '\nH1-R1 VERIFY: FAIL' : `\nH1-R1 VERIFY: PASS · intake ${FALSIFIERS.length}/${FALSIFIERS.length} · WS2-03B amendment ${A_FALSIFIERS.length}/${A_FALSIFIERS.length} · guards ${guards.length}/${guards.length}`);
process.exit(failed ? 1 : 0);
