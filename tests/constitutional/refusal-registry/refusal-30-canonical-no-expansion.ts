import type { RefusalCheck } from './harness';

/**
 * Refusal 30 — G9 — No expansion of the authorized field by migration (CMT-01).
 *
 * The CURRENT policy version's admission per (producer × room) equals the table the founder
 * adjudicated for that version. Changing a cell requires a policy-version bump. Snapshots
 * live beside this check, one per version (pp-1 is the preserved historical seed; pp-2 was
 * adjudicated 2026-09-06 after this check detected four producers beyond the seed). The
 * registry `rooms` lists, POLICY_OVERRIDES, and pp-2's RESTRAINT_RULES cells are compared
 * against the snapshot named by PARTICIPATION_POLICY_VERSION.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REG = 'lib/maia/canonical-turn/producerRegistry.ts';
const POL = 'lib/maia/canonical-turn/policy.ts';
const SNAPSHOT_DIR = 'tests/constitutional/refusal-registry/fixtures';

export const check: RefusalCheck = {
  id: 'R30',
  refusal: 'Migration cannot expand the authorized intelligence field — the current policy version\'s admission equals its adjudicated snapshot; a cell change is a policy-version bump with a new snapshot',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/policy.ts (POLICY_OVERRIDES + RESTRAINT_RULES + PARTICIPATION_POLICY_VERSION) against fixtures/cmt-01-<version>-admission.json',
  evidence: 'registry rooms lists ⊆ snapshot admission; POLICY_OVERRIDES equals snapshot overrides; RESTRAINT_RULES cells equal snapshot restraints',
  violationAttempted: 'find a producer admitted to a room the seed does not admit it to, without a version bump',
  passingAuthorizes: 'the v1 field is exactly the seed — no levelling-up between /list and between/chat',
  passingDoesNotAuthorize: 'that the seed itself is correct — it was adjudicated, and Decision 1 cells are recorded in it',
  hostileForkMustChange: 'add a room to a producer or an override cell without bumping PARTICIPATION_POLICY_VERSION and the snapshot — visible diff',

  run(io) {
    if (!io.exists(REG) || !io.exists(POL)) { io.fail('registry/policy absent'); return; }
    const pol = io.read(POL);
    const ver = pol.match(/PARTICIPATION_POLICY_VERSION = '([^']+)'/)?.[1];
    if (!ver) { io.fail('policy version not found'); return; }
    const snapPath = join(process.cwd(), SNAPSHOT_DIR, `cmt-01-${ver}-admission.json`);
    if (!existsSync(snapPath)) { io.fail('no snapshot for the current policy version', `${ver} — adjudicate and snapshot together`); return; }
    const snap = JSON.parse(readFileSync(snapPath, 'utf8')) as {
      policyVersion: string; admission: Record<string, string[]>;
      restraints?: { requireContinuity: string[]; ambientHold: Record<string, string> }; overrides?: Record<string, Record<string, string>>;
    };
    if (ver === snap.policyVersion) io.pass('policy version matches its snapshot', ver);
    else { io.fail('policy version differs from snapshot', `${ver} vs ${snap.policyVersion}`); return; }

    if (/POLICY_OVERRIDES[^=]*=\s*\{\s*\};/.test(pol)) {
      if (!snap.overrides || Object.keys(snap.overrides).length === 0) io.pass(`${ver} carries no room overrides (snapshot agrees)`);
      else io.fail('snapshot lists overrides the policy does not carry');
    } else io.warn(`${ver} has room overrides`, 'each must be an adjudicated cell in the snapshot');

    // pp-2+: restraint cells must equal the snapshot's adjudicated restraints (source-level parse).
    if (snap.restraints) {
      const rc = (pol.match(/requireContinuity:\s*\[([^\]]*)\]/)?.[1].match(/'([a-z_.]+)'/g) ?? []).map((x) => x.replace(/'/g, '')).sort();
      const ahBlock = pol.match(/ambientHold:\s*\{([\s\S]*?)\n\s*\},/)?.[1] ?? '';
      const ah: Record<string, string> = {};
      for (const m of ahBlock.matchAll(/'([a-z_.]+)':\s*\{\s*rule:\s*'([a-z0-9_]+)'/g)) ah[m[1]] = m[2];
      const snapRc = [...snap.restraints.requireContinuity].sort();
      if (JSON.stringify(rc) === JSON.stringify(snapRc)) io.pass('requireContinuity cells equal the snapshot', rc.join(', '));
      else io.fail('requireContinuity cells differ from the snapshot', `${rc.join(',')} vs ${snapRc.join(',')}`);
      const ahKeys = Object.keys(ah).sort(), snapKeys = Object.keys(snap.restraints.ambientHold).sort();
      const same = JSON.stringify(ahKeys) === JSON.stringify(snapKeys) && ahKeys.every((k) => ah[k] === snap.restraints!.ambientHold[k]);
      if (same) io.pass('ambientHold cells equal the snapshot', ahKeys.map((k) => `${k}→${ah[k]}`).join(', '));
      else io.fail('ambientHold cells differ from the snapshot', JSON.stringify(ah));
    }

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
