/**
 * Sanctuary honored-proof (Rung 1 — Capture). The OUT-bound mirror of the recall
 * honored-proof (Rung 2 — Remember): Sanctuary ⇒ nothing enters persistence.
 *
 * These pin the boundary-enforced guards as pure decisions. The summary guard is wired
 * into SessionSummaryStore (boundary-enforced); the SQL-level guards (worker-update
 * cannot touch a sanctuary row; retrieval excludes sanctuary rows) are proven against
 * the real table in scripts/repro/sanctuary_summary_db_proof.sql.
 *
 * Constitutional anchor: CLAUDE.md → Sanctuary Mode §1, §6.
 */
import { sanctuarySafeSummary, shouldPersistTurn, shouldPersistKeep } from '../sanctuaryGuards';

describe('Sanctuary guards — nothing from a Sanctuary session enters persistence', () => {
  describe('sanctuarySafeSummary (summary write — boundary-enforced)', () => {
    it('HONORED: Sanctuary forces summary to null even when content is supplied', () => {
      expect(sanctuarySafeSummary(true, 'something the member said in confidence')).toBeNull();
    });

    it('Sanctuary forces null regardless of caller input shape', () => {
      expect(sanctuarySafeSummary(true, '')).toBeNull();
      expect(sanctuarySafeSummary(true, undefined)).toBeNull();
      expect(sanctuarySafeSummary(true, null)).toBeNull();
    });

    it('continuity preserves the summary (capture works when allowed)', () => {
      expect(sanctuarySafeSummary(false, 'a continuity summary')).toBe('a continuity summary');
    });

    it('continuity with no summary yields null (not undefined)', () => {
      expect(sanctuarySafeSummary(false, undefined)).toBeNull();
    });
  });

  describe('shouldPersistTurn (turn write)', () => {
    it('HONORED: Sanctuary ⇒ do not persist the turn', () => {
      expect(shouldPersistTurn(true)).toBe(false);
    });

    it('continuity ⇒ persist normally', () => {
      expect(shouldPersistTurn(false)).toBe(true);
    });
  });

  describe('shouldPersistKeep (library keep write)', () => {
    it('HONORED: Sanctuary ⇒ do not persist a kept library item (0 rows)', () => {
      expect(shouldPersistKeep(true)).toBe(false);
    });

    it('continuity ⇒ a kept library item persists normally', () => {
      expect(shouldPersistKeep(false)).toBe(true);
    });
  });
});
