/**
 * KEEP-LEGACY-SURFACE-01-R1 — residue guard.
 *
 * The retired Phase 1.5B KeepAffordance architecture must not remain wired into
 * OracleConversation after the legacy respond authority is tombstoned.
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');

describe('KEEP-LEGACY-SURFACE-01-R1 — dead legacy UI residue removed', () => {
  it('OracleConversation carries no legacy KeepAffordance wiring or runtime refs', () => {
    const src = readFileSync(path.join(repoRoot, 'components/OracleConversation.tsx'), 'utf8');

    for (const forbidden of [
      'KeepAffordance',
      'NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED',
      'sessionOfferCountRef',
      'lastOfferTurnRef',
      'conversationTurnRef',
      'keepIntent?: KeepIntent',
    ]) {
      expect(src).not.toContain(forbidden);
    }
  });

  it('the orphaned KeepAffordance component is absent', () => {
    expect(existsSync(path.join(repoRoot, 'components/psyche/KeepAffordance.tsx'))).toBe(false);
  });
});
