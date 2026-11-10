/**
 * Walk defect 5 (founder walk 2026-11-09): in Sanctuary MAIA must be told she is in Sanctuary, so she is not given the Studio guide or the
 * offers (reading permission, plan, keeping …). Every route that builds a kind:'work' context must pass the posture through.
 * The Living Work route was missed by the first fix and found by an independent review; this guard keeps any work route from missing it.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const ROUTES = ['app/api/sovereign/manuscripts/[id]/ask/route.ts', 'app/api/sovereign/living-works/[id]/ask/route.ts'];

it.each(ROUTES)('%s passes the Sanctuary posture into its Work context', (route) => {
  const src = readFileSync(join(ROOT, route), 'utf8');
  expect(src).toMatch(/kind: 'work'/);
  expect(src).toMatch(/sanctuary: [a-zA-Z.]*sanctuary === true/);
});
