/**
 * The canonical-structure digest, extracted for BUILD-07A: the pure function
 * must produce EXACTLY what `canonicalFingerprint` produced before the
 * extraction, or every `canonical_at_open` frozen into an ask thread would
 * read as moved.
 */

import { createHash } from 'crypto';
import { fingerprintStructureRows, type CanonicalMemberRow, type CanonicalUnitRow } from '../structureDigest';

const units: CanonicalUnitRow[] = [
  { id: 'b2', parent_id: null, position: 1, kind: 'chapter', title: 'Two', origin: 'member', adopted_from_id: null },
  { id: 'a1', parent_id: null, position: 0, kind: 'chapter', title: 'One', origin: 'member', adopted_from_id: null },
];
const members: CanonicalMemberRow[] = [
  { unit_id: 'b2', draft_section_id: 's3' },
  { unit_id: 'a1', draft_section_id: 's1' },
  { unit_id: 'a1', draft_section_id: 's0' },
];

/* The pre-extraction algorithm, verbatim: rows as the SQL ordered them. */
function legacy(): string {
  const u = [...units].sort((a, b) => a.id.localeCompare(b.id));
  const m = [...members].sort((a, b) =>
    a.unit_id.localeCompare(b.unit_id) || a.draft_section_id.localeCompare(b.draft_section_id));
  return createHash('sha256').update(JSON.stringify({ units: u, members: m })).digest('hex');
}

describe('fingerprintStructureRows', () => {
  it('equals the pre-extraction digest, whatever order rows arrive in', () => {
    expect(fingerprintStructureRows(units, members)).toBe(legacy());
    expect(fingerprintStructureRows([...units].reverse(), [...members].reverse())).toBe(legacy());
  });

  it('moves on a renamed unit, a moved boundary, and a reassigned section — never only on a count', () => {
    const base = fingerprintStructureRows(units, members);
    expect(fingerprintStructureRows(units.map((u) => (u.id === 'a1' ? { ...u, title: 'Uno' } : u)), members)).not.toBe(base);
    expect(fingerprintStructureRows(units.map((u) => (u.id === 'a1' ? { ...u, position: 5 } : u)), members)).not.toBe(base);
    expect(fingerprintStructureRows(units, members.map((m) => (m.draft_section_id === 's1' ? { ...m, unit_id: 'b2' } : m)))).not.toBe(base);
  });
});
