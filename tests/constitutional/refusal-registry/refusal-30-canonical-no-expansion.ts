import type { RefusalCheck } from './harness';

/**
 * Refusal 30 — G9 — No expansion of the authorized field by migration (CMT-01).
 *
 * pp-1's admission per (producer × room) equals the seed table the founder adjudicated.
 * Changing a cell requires a policy-version bump. The seed snapshot lives beside this
 * check; the registry `rooms` lists + POLICY_OVERRIDES are compared against it.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REG = 'lib/maia/canonical-turn/producerRegistry.ts';
const POL = 'lib/maia/canonical-turn/policy.ts';
const SNAPSHOT = 'tests/constitutional/refusal-registry/fixtures/cmt-01-pp-1-admission.json';

export const check: RefusalCheck = {
  id: 'R30',
  refusal: 'Migration cannot expand the authorized intelligence field — pp-1 admission equals the adjudicated seed; a cell change is a policy-version bump',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/policy.ts (POLICY_OVERRIDES + PARTICIPATION_POLICY_VERSION) against fixtures/cmt-01-pp-1-admission.json',
  evidence: 'registry rooms lists transcribe the census §5 table; POLICY_OVERRIDES is empty in pp-1',
  violationAttempted: 'find a producer admitted to a room the seed does not admit it to, without a version bump',
  passingAuthorizes: 'the v1 field is exactly the seed — no levelling-up between /list and between/chat',
  passingDoesNotAuthorize: 'that the seed itself is correct — it was adjudicated, and Decision 1 cells are recorded in it',
  hostileForkMustChange: 'add a room to a producer or an override cell without bumping PARTICIPATION_POLICY_VERSION and the snapshot — visible diff',

  run(io) {
    if (!io.exists(REG) || !io.exists(POL)) { io.fail('registry/policy absent'); return; }
    const snapPath = join(process.cwd(), SNAPSHOT);
    if (!existsSync(snapPath)) { io.fail('seed snapshot absent', SNAPSHOT); return; }
    const snap = JSON.parse(readFileSync(snapPath, 'utf8')) as { policyVersion: string; admission: Record<string, string[]> };

    const pol = io.read(POL);
    const ver = pol.match(/PARTICIPATION_POLICY_VERSION = '([^']+)'/)?.[1];
    if (ver === snap.policyVersion) io.pass('policy version matches snapshot', ver);
    else { io.fail('policy version differs from snapshot', `${ver} vs ${snap.policyVersion} — re-adjudicate and re-snapshot together`); return; }

    if (/POLICY_OVERRIDES[^=]*=\s*\{\s*\};/.test(pol)) io.pass('pp-1 carries no overrides');
    else io.warn('pp-1 has overrides', 'each must be an adjudicated cell');

    // Parse registry rooms per producer (source-level, no import).
    const reg = io.read(REG);
    const entryRe = /^\s{2}'([a-z_.]+)':\s*\{([\s\S]*?)\n\s{2}\},/gm;
    const actual: Record<string, string[]> = {};
    let m: RegExpExecArray | null;
    while ((m = entryRe.exec(reg))) {
      const rooms = m[2].match(/rooms:\s*(\[[^\]]*\]|ALL_ROOMS)/)?.[1] ?? '';
      actual[m[1]] = rooms === 'ALL_ROOMS'
        ? ['sovereign_chat', 'between', 'now_what', 'vision_studio', 'living_field', 'relational_navigation']
        : (rooms.match(/'([a-z_]+)'/g) ?? []).map((s) => s.replace(/'/g, ''));
    }
    const expanded: string[] = [];
    const missing: string[] = [];
    for (const [id, rooms] of Object.entries(actual)) {
      const seed = snap.admission[id];
      if (!seed) { expanded.push(`${id} (not in seed)`); continue; }
      for (const r of rooms) if (!seed.includes(r)) expanded.push(`${id}@${r}`);
    }
    for (const id of Object.keys(snap.admission)) if (!actual[id]) missing.push(id);
    if (expanded.length === 0) io.pass('no producer admitted beyond the seed', `${Object.keys(actual).length} producers`);
    else io.fail('admission expanded beyond seed', expanded.join(', '));
    if (missing.length === 0) io.pass('no seed producer missing from registry');
    else io.warn('seed producer missing from registry (contraction)', missing.join(', '));
  },
};
