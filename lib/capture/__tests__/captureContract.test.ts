/**
 * Capture domain contract — vocabulary pinned to the SQL CHECK constraints.
 *
 * Every value below is duplicated in
 * database/migrations/20260825000001_session_captures.sql. A drift between the
 * TS union and the CHECK constraint fails closed at INSERT time in production
 * but silently type-checks here, so the migration text is asserted directly
 * rather than trusted.
 *
 * Mirrors the pattern in lib/anchor/__tests__/surfacePreference.test.ts.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CAPTURE_SOURCES,
  CAPTURE_MODALITIES,
  CAPTURE_KINDS,
  ELEMENTAL_LENSES,
} from '../sessionCapture';

const MIGRATION = readFileSync(
  join(__dirname, '../../../database/migrations/20260825000001_session_captures.sql'),
  'utf8'
);

const ATOMS_CAPTURE_MIGRATION = readFileSync(
  join(__dirname, '../../../database/migrations/20260825000002_memory_atoms_capture_source.sql'),
  'utf8'
);

describe('Capture contract — TS vocabulary matches the SQL CHECK constraints', () => {
  it.each(CAPTURE_SOURCES)('source %s is permitted by the source CHECK', (value) => {
    expect(MIGRATION).toContain(`'${value}'`);
  });

  it.each(CAPTURE_MODALITIES)('modality %s is permitted by the modality CHECK', (value) => {
    expect(MIGRATION).toContain(`'${value}'`);
  });

  it.each(CAPTURE_KINDS)('kind %s is permitted by the capture_kind CHECK', (value) => {
    expect(MIGRATION).toContain(`'${value}'`);
  });

  it.each(ELEMENTAL_LENSES)('lens %s is permitted by the lens CHECK', (value) => {
    expect(MIGRATION).toContain(`'${value}'`);
  });
});

describe('Capture contract — structural refusals are present in the schema', () => {
  it('pins captured_by to member so MAIA can never author a capture (L3 != L1)', () => {
    expect(MIGRATION).toMatch(/captured_by[\s\S]*?CHECK \(captured_by = 'member'\)/);
  });

  it('carries no plaintext content column, and refuses one at migration time', () => {
    expect(MIGRATION).toContain('content_enc');
    expect(MIGRATION).not.toMatch(/^\s*raw_content\s+TEXT/m);
    // The post-create shape check that enforces this on every apply.
    expect(MIGRATION).toContain("must not carry a plaintext content column");
  });

  it('makes raw capture immutable via a BEFORE UPDATE trigger', () => {
    expect(MIGRATION).toContain('session_captures_protect_raw');
    expect(MIGRATION).toContain('BEFORE UPDATE ON session_captures');
  });

  it('keys idempotent ingestion on (member_id, client_capture_id)', () => {
    expect(MIGRATION).toMatch(
      /CREATE UNIQUE INDEX[\s\S]*?session_captures \(member_id, client_capture_id\)/
    );
  });

  it('allows an unbound capture — session_id must NOT be NOT NULL', () => {
    // The personal capture inbox depends on this. A future NOT NULL here would
    // silently delete the solo-member half of the product.
    expect(MIGRATION).not.toMatch(/session_id\s+UUID\s+NOT NULL/);
  });
});

describe('Promotion contract — registry pointer, never plaintext duplication', () => {
  it('adds capture as a source_type without dropping any existing type', () => {
    for (const t of [
      'idea', 'idea_block', 'journal', 'dream', 'reflection', 'decision',
      'change', 'session_excerpt', 'spontaneous', 'practitioner_observation',
      'capture',
    ]) {
      expect(ATOMS_CAPTURE_MIGRATION).toContain(`'${t}'`);
    }
  });

  it('documents a rollback', () => {
    expect(ATOMS_CAPTURE_MIGRATION).toContain('ROLLBACK');
  });

  it('rewrites no historical row', () => {
    // A widening migration must never UPDATE or DELETE existing atoms.
    expect(ATOMS_CAPTURE_MIGRATION).not.toMatch(/^\s*UPDATE member_memory_atoms/m);
    expect(ATOMS_CAPTURE_MIGRATION).not.toMatch(/^\s*DELETE FROM member_memory_atoms/m);
  });
});
