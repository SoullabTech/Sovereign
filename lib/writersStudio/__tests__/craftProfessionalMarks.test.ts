import { professionalMarkFor } from '../craftProfessionalMarks';
import type { CraftWorkingEdit } from '../craftWorkingCopy';

const edit = (
  id: number,
  start: number,
  end: number,
  from: string,
  to: string,
): CraftWorkingEdit => ({
  id, start, end, from, to, protectedSpan: false,
});

describe('Craftsman Table professional proofing marks', () => {
  it('keeps plain edit semantics available as professional marks', () => {
    expect(professionalMarkFor(edit(1, 0, 4, 'very', ''), [])).toMatchObject({
      kind: 'delete', symbol: 'DEL',
    });
    expect(professionalMarkFor(edit(2, 4, 4, '', 'felt '), [])).toMatchObject({
      kind: 'insert', symbol: 'INS',
    });
    expect(professionalMarkFor(edit(3, 0, 4, 'very', 'deeply'), [])).toMatchObject({
      kind: 'replace', symbol: 'REP',
    });
  });

  it('renders keeping the author original as STET', () => {
    expect(professionalMarkFor(
      edit(1, 0, 4, 'very', 'deeply'),
      [],
      { mode: 'original' },
    )).toMatchObject({ kind: 'stet', symbol: 'STET' });
  });

  it('detects a transposition pair without treating it as two unrelated edits', () => {
    const from = edit(1, 0, 4, 'Fire', '');
    const to = edit(2, 18, 18, '', 'Fire');
    const edits = [from, to];
    expect(professionalMarkFor(from, edits).kind).toBe('transpose-from');
    expect(professionalMarkFor(to, edits).kind).toBe('transpose-to');
  });

  it('recognizes paragraph and case conventions when the diff supports them', () => {
    expect(professionalMarkFor(edit(1, 3, 3, '', '\n\n'), []).symbol).toBe('¶');
    expect(professionalMarkFor(edit(2, 0, 4, 'fire', 'FIRE'), []).symbol).toBe('CAPS');
    expect(professionalMarkFor(edit(3, 0, 4, 'FIRE', 'fire'), []).symbol).toBe('lc');
  });
});
