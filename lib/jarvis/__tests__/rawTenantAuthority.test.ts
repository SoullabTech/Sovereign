/**
 * BW-F5 — Work-scoped exports cannot regress to raw tenant authority (A1 + R1).
 *
 * THE LAW (R1, founder wording):
 *
 *     existing exception disappears   → PASS
 *     existing exception remains      → PASS
 *     new raw-`memberId` export       → FAIL
 *     new exception added             → explicit review required
 *
 * ⛔ WHY THE LIST EXISTS AT ALL. The census found 33 Work-scoped exports whose
 * authorization depends on a caller passing the correct `memberId: string`. A
 * guard that failed on all of them on day one would be deleted on day one. A
 * guard whose exception list could grow silently would be decorative. So the
 * baseline is named, dated and reasoned per entry — `{ symbol, path, admitted,
 * reason }`, never a bare path — and this file is the review.
 *
 * ⭐ THIS IS A BASELINE, NOT A PERMISSION SYSTEM. Every entry here is BP-3 still
 * open in one more place. Removing one is progress and needs no ceremony; adding
 * one is a decision and shows up in this diff.
 *
 * ⛔ This test does NOT claim the listed exports are unsafe today. They are
 * correct — by consistent authorship rather than by construction. That is the
 * distinction the whole lane exists to close.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const SCANNED = ['lib/manuscript', 'lib/writers-studio', 'lib/writersStudio'];

interface Exception {
  readonly symbol: string;
  readonly path: string;
  /** ISO date this entry entered the baseline. */
  readonly admitted: string;
  readonly reason: string;
}

/** THE BASELINE. Shrinks without review; never grows without one. */
const EXCEPTIONS: readonly Exception[] = [
  { symbol: 'authorStructureFromProposal',     path: 'lib/manuscript/structure/authorStructure.ts',       admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'captureEvidence',                 path: 'lib/manuscript/development/capture.ts',             admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'claimArrival',                    path: 'lib/manuscript/source/arrivals.ts',                 admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'convertDraftToSections',          path: 'lib/manuscript/sections/convertDraft.ts',           admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'createProposal',                  path: 'lib/manuscript/structure/proposalStore.ts',         admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'createUnit',                      path: 'lib/manuscript/structure/structureService.ts',      admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'currentStanding',                 path: 'lib/manuscript/standing/store.ts',                  admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'currentStandings',                path: 'lib/manuscript/standing/store.ts',                  admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'deleteUnit',                      path: 'lib/manuscript/structure/structureService.ts',      admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'eraseManuscript',                 path: 'lib/manuscript/source/eraseManuscript.ts',          admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'listProposals',                   path: 'lib/manuscript/structure/proposalStore.ts',         admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'listReadings',                    path: 'lib/manuscript/developmentalReading/store.ts',      admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'loadEditableSections',            path: 'lib/manuscript/sections/saveSection.ts',            admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'loadFrozenDevelopmentalReading',  path: 'lib/manuscript/ask/frozenDevelopmentalReading.ts',  admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'loadFrozenReading',               path: 'lib/manuscript/ask/frozenReading.ts',               admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'loadLiveWork',                    path: 'lib/manuscript/development/capture.ts',             admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'loadSectionHeads',                path: 'lib/manuscript/ask/frozenReading.ts',               admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'loadStructure',                   path: 'lib/manuscript/structure/structureService.ts',      admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'measureNow',                      path: 'lib/manuscript/ask/frozenReading.ts',               admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'memberOwnsWork',                  path: 'lib/manuscript/ask/frozenReading.ts',               admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'moveUnit',                        path: 'lib/manuscript/structure/structureService.ts',      admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'normalizeLegacyScaffoldForDraft', path: 'lib/manuscript/sections/normalizeLegacyScaffold.ts', admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'openThread',                      path: 'lib/manuscript/ask/threadStore.ts',                 admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'placeSections',                   path: 'lib/manuscript/structure/structureService.ts',      admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'readingIsAddressable',            path: 'lib/manuscript/standing/store.ts',                  admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'recordStanding',                  path: 'lib/manuscript/standing/store.ts',                  admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'renameUnit',                      path: 'lib/manuscript/structure/structureService.ts',      admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'resolveDevelopPreparation',       path: 'lib/manuscript/development/preparation.ts',         admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'resolveDraftWriteState',          path: 'lib/manuscript/sections/saveSection.ts',            admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'resolveSituatedWork',             path: 'lib/writersStudio/workSituation.ts',                admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'saveSection',                     path: 'lib/manuscript/sections/saveSection.ts',            admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'threadsOnAnchor',                 path: 'lib/manuscript/ask/threadStore.ts',                 admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
  { symbol: 'verifyCustody',                   path: 'lib/manuscript/source/arrivals.ts',                 admitted: '2026-09-13', reason: 'pre-A1 Work-scoped export; census BP-3' },
];

const WORK_ARG = /\b(manuscriptId|draftId|workRef|workId|readingId)\b/;
const RAW_MEMBER = /\bmemberId\s*:\s*string\b/;
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function workScopedRawExports(): { symbol: string; path: string }[] {
  const out: { symbol: string; path: string }[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir).sort()) {
      if (e === '__tests__') continue;
      const p = join(dir, e);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!e.endsWith('.ts')) continue;
      const code = stripComments(readFileSync(p, 'utf8'));
      const rel = p.slice(ROOT.length + 1);
      for (const m of code.matchAll(/export\s+(?:async\s+)?function\s+(\w+)\s*\(([\s\S]{0,600}?)\)\s*:/g)) {
        if (WORK_ARG.test(m[2]) && RAW_MEMBER.test(m[2])) out.push({ symbol: m[1], path: rel });
      }
    }
  };
  for (const d of SCANNED) walk(join(ROOT, d));
  return out;
}

const key = (e: { symbol: string; path: string }) => `${e.path}:${e.symbol}`;

describe('BW-F5 · Work-scoped exports cannot regress to raw tenant authority', () => {
  const admitted = new Set(EXCEPTIONS.map(key));

  it('no NEW Work-scoped export authorizes on a raw memberId string', () => {
    const novel = workScopedRawExports().map(key).filter((k) => !admitted.has(k)).sort();
    expect(novel).toEqual([]);
  });

  it('every baseline entry carries symbol, path, admitted date and reason', () => {
    for (const e of EXCEPTIONS) {
      expect(typeof e.symbol).toBe('string');
      expect(e.symbol.length).toBeGreaterThan(0);
      expect(e.path).toMatch(/^lib\//);
      expect(e.admitted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.reason.length).toBeGreaterThan(0);
    }
  });

  it('the baseline has no duplicate entries', () => {
    expect(new Set(EXCEPTIONS.map(key)).size).toBe(EXCEPTIONS.length);
  });

  /* ⭐ A stale entry is not a failure — it is the shape of progress, and the test
     reports it so the baseline can shrink deliberately rather than rot. */
  it('reports baseline entries that no longer exist (shrink candidates)', () => {
    const live = new Set(workScopedRawExports().map(key));
    const stale = EXCEPTIONS.map(key).filter((k) => !live.has(k));
    if (stale.length > 0) {
      console.info(`[BW-F5] ${stale.length} baseline entr${stale.length === 1 ? 'y' : 'ies'} may be removed:\n  ${stale.join('\n  ')}`);
    }
    expect(Array.isArray(stale)).toBe(true);
  });
});
