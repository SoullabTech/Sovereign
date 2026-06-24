/**
 * With-Me Session Completion — Governed Bridge Tests
 *
 * Verifies that only approved synthesis candidates are written to
 * member_memory_atoms, that idempotency is enforced via deterministic
 * source_ids, and that the route code contains the required governance logic.
 *
 * Constitutional intent: approved practitioner observations enter member memory
 * as "witnessed" — distinct from member-authored atoms. Provenance is preserved.
 * Rejected candidates are never written. Double-completion never duplicates atoms.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { candidateAtomSourceId } from '@/app/api/studio/with-me/sessions/[sessionId]/route';

const ROUTE_PATH = 'app/api/studio/with-me/sessions/[sessionId]/route.ts';

function readRoute(): string {
  return readFileSync(join(process.cwd(), ROUTE_PATH), 'utf-8');
}

// ─── Unit: deterministic source_id ────────────────────────────────────────────

describe('candidateAtomSourceId', () => {
  it('returns the same UUID for the same session + candidate', () => {
    const a = candidateAtomSourceId('session-1', 'c1');
    const b = candidateAtomSourceId('session-1', 'c1');
    expect(a).toBe(b);
  });

  it('returns different UUIDs for different candidates in the same session', () => {
    const a = candidateAtomSourceId('session-1', 'c1');
    const b = candidateAtomSourceId('session-1', 'c2');
    expect(a).not.toBe(b);
  });

  it('returns different UUIDs for the same candidate in different sessions', () => {
    const a = candidateAtomSourceId('session-1', 'c1');
    const b = candidateAtomSourceId('session-2', 'c1');
    expect(a).not.toBe(b);
  });

  it('returns a UUID-formatted string', () => {
    const id = candidateAtomSourceId('session-abc', 'c1');
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

// ─── Structural: governance rules in route source ─────────────────────────────

describe('with-me complete route governance', () => {
  let source: string;

  beforeAll(() => {
    source = readRoute();
  });

  it('filters candidates by approved_candidate_ids before writing', () => {
    expect(source).toMatch(/approved_candidate_ids/);
    expect(source).toMatch(/approvedIds\.has/);
  });

  it('uses ON CONFLICT DO NOTHING for idempotency', () => {
    expect(source).toMatch(/ON CONFLICT DO NOTHING/);
  });

  it('uses candidateAtomSourceId (deterministic) not gen_random_uuid()', () => {
    expect(source).toMatch(/candidateAtomSourceId/);
    expect(source).not.toMatch(/gen_random_uuid/);
  });

  it('writes only approved candidates — never all candidates', () => {
    // The variable `approved` is filtered; `candidates` is never directly iterated
    expect(source).toMatch(/const approved = candidates\.filter/);
    // Route must not iterate over unfiltered `candidates` for atom writes
    expect(source).not.toMatch(/for.*of candidates/);
  });

  it('includes provenance in the INSERT', () => {
    expect(source).toMatch(/provenance/);
    expect(source).toMatch(/session_id.*practitioner_id.*candidate_id/s);
  });

  it('returns created_atom_ids in the response', () => {
    expect(source).toMatch(/created_atom_ids/);
    expect(source).toMatch(/createdAtomIds/);
  });

  it('logs when no candidates are approved (nothing written)', () => {
    expect(source).toMatch(/no approved candidates — nothing written to memory/);
  });

  it('logs when session has no member_id (nothing written)', () => {
    expect(source).toMatch(/has no member_id — practitioner observations not written/);
  });

  it('uses epistemological_status: observed', () => {
    expect(source).toMatch(/'observed'/);
  });

  it('uses witnessed register and primary_register', () => {
    expect(source).toMatch(/'witnessed'/);
  });

  it('sets crossing_allowed to false', () => {
    // crossing_allowed and false appear in INSERT column/values lists on separate lines
    expect(source).toMatch(/crossing_allowed/);
    expect(source).toMatch(/false, \$7::jsonb/);
  });
});
