import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const migration = fs.readFileSync(path.join(ROOT,
  'database/migrations/20261025000001_r20_writer_editorial_constitutional_erasure.sql'), 'utf8');
const erasure = fs.readFileSync(path.join(ROOT,
  'lib/manuscript/source/eraseManuscript.ts'), 'utf8');
const originMigration = fs.readFileSync(path.join(ROOT,
  'database/migrations/20261020000001_writer_editorial_thread_origins.sql'), 'utf8');

describe('R20 Writer editorial constitutional erasure source law', () => {
  it('atomically replaces the production INTEGER predecessor before creating the JSONB receipt', () => {
    const drop = migration.indexOf(
      'DROP FUNCTION IF EXISTS public.r20_erase_writer_editorial_history(UUID, UUID, UUID)',
    );
    const create = migration.indexOf(
      'CREATE OR REPLACE FUNCTION public.r20_erase_writer_editorial_history(',
    );
    expect(drop).toBeGreaterThan(migration.indexOf('BEGIN;'));
    expect(create).toBeGreaterThan(drop);
    expect(migration).toContain(') RETURNS JSONB');
  });

  it('requires exact same-transaction deletion authority before authored-history erasure', () => {
    expect(migration).toContain("reason_class = 'member_deletion'");
    expect(migration).toContain("t.object_kind = 'member_manuscripts'");
    expect(migration).toContain('t.object_id = p_manuscript_id::TEXT');
    expect(migration).toContain('r20_writer_editorial_manuscript_still_present');
    expect(migration).toContain('r20_writer_editorial_foreign_chain_refused');
    expect(migration).toContain('r20_writer_editorial_live_thread_refused');
  });

  it('keeps foreign-key enforcement active and narrows ordinary-trigger suspension', () => {
    expect(migration).not.toMatch(/session_replication_role/i);
    expect(migration).not.toMatch(/DISABLE\s+TRIGGER\s+(ALL|USER)/i);
    const disabled = [...migration.matchAll(/DISABLE TRIGGER ([a-z0-9_]+)/g)].map(m => m[1]);
    const enabled = [...migration.matchAll(/ENABLE TRIGGER ([a-z0-9_]+)/g)].map(m => m[1]);
    expect(disabled).toEqual([
      'application_recovery_immutable', 'mra_identity_immutable',
      'proposal_chain_insights_no_delete', 'proposal_chain_directions_no_delete',
      'proposal_versions_immutable', 'proposal_chains_immutable', 'weco_preserve',
    ]);
    expect(enabled.sort()).toEqual([...disabled].sort());
    expect(migration).toContain('EXCEPTION WHEN OTHERS THEN');
  });

  it('deletes the complete admitted retained lineage in dependency order', () => {
    const ordered = [
      'DELETE FROM public.writer_editorial_save_receipts',
      'DELETE FROM public.editorial_turn_bindings',
      'DELETE FROM public.writer_editorial_thread_origins',
      'DELETE FROM public.manuscript_application_recovery',
      'DELETE FROM public.manuscript_revision_authorizations',
      'DELETE FROM public.proposal_chain_insights',
      'DELETE FROM public.proposal_chain_directions',
      'DELETE FROM public.writer_editorial_chain_origins',
      'DELETE FROM public.proposal_versions',
      'DELETE FROM public.proposal_chains',
    ];
    let cursor = -1;
    for (const phrase of ordered) {
      const next = migration.indexOf(phrase);
      expect(next).toBeGreaterThan(cursor);
      cursor = next;
    }
    expect(migration).toContain('successor.supersedes = v.id');
    expect(migration).toContain('r20_writer_editorial_postcondition_failed');
  });

  it('is security-definer, content-free, and not public execution authority', () => {
    expect(migration).toContain('SECURITY DEFINER');
    expect(migration).toContain('SET search_path = pg_catalog, public');
    expect(migration).toContain('REVOKE ALL ON FUNCTION public.r20_erase_writer_editorial_history');
    expect(migration).toContain("rolname = 'maia'");
    expect(migration).toContain("rolname = 'maia_app'");
    expect(migration).toContain('jsonb_build_object(');
    expect(migration).not.toContain('expected_text');
    expect(migration).not.toContain('formulation');
  });

  it('preserves the actual erasure call order and sources Save provenance schema', () => {
    const manuscriptDelete = erasure.indexOf('DELETE FROM member_manuscripts');
    const tombstone = erasure.indexOf('INSERT INTO provenance_tombstones');
    const historyErase = erasure.indexOf('SELECT r20_erase_writer_editorial_history');
    const queue = erasure.indexOf('INSERT INTO vault_erasure_queue');
    expect(manuscriptDelete).toBeGreaterThanOrEqual(0);
    expect(tombstone).toBeGreaterThan(manuscriptDelete);
    expect(historyErase).toBeGreaterThan(tombstone);
    expect(queue).toBeGreaterThan(historyErase);
    expect(originMigration).toContain('CREATE TABLE writer_editorial_chain_origins');
    expect(originMigration).toContain('CREATE TABLE writer_editorial_thread_origins');
    expect(originMigration).toContain('CREATE TABLE writer_editorial_save_receipts');
  });
});
