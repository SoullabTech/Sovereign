/**
 * D2 — THE RAIL TELLS THE TRUTH.
 *
 * A label that looks like navigation but cannot go anywhere is not harmless
 * decoration: it makes the Studio promise a room that does not exist. The
 * rebuilt Write room used to render five such rows and even attached literal
 * counts to two of them. Until those capabilities have real routes or real
 * in-room panels, the honest surface is the Work + its actual outline.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const src = (rel: string) => readFileSync(join(process.cwd(), 'app/writers-studio', rel), 'utf8');

describe('D2 — rebuilt rail honesty', () => {
  const rebuild = src('rebuild/RebuildStudioClient.tsx');

  it('does not render the old destination-looking placeholder array', () => {
    expect(rebuild).not.toContain("['Manuscript', 'Materials', 'Notes', 'Versions', 'Goals']");
  });

  it('does not hard-code member-facing rail counts', () => {
    expect(rebuild).not.toContain("x === 'Versions' ? '5'");
    expect(rebuild).not.toContain("x === 'Materials' ? '0'");
  });

  it('keeps the truthful navigation substrate: the Work and its outline', () => {
    expect(rebuild).toContain('‹ All Works');
    expect(rebuild).toContain('<span>OUTLINE</span>');
    expect(rebuild).toContain('<OutlineBranch');
  });
});
