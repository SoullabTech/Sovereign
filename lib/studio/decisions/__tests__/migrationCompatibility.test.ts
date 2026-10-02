import fs from 'node:fs';
import path from 'node:path';

const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');

const scopeMigration = read('database/migrations/20260925000004_decision_scope_membranes.sql');
const prefsMigration = read('database/migrations/20260925000001_house_member_preferences.sql');
const catalogMigration = read('database/migrations/20260925000003_house_shortcut_catalog.sql');
const colabCapture = read('app/api/team/channels/[channelId]/decisions/route.ts');

describe('3597 production migration compatibility', () => {
  it('keeps legacy Co-Lab inserts valid during migrate-before-swap', () => {
    expect(scopeMigration).toContain('CREATE OR REPLACE FUNCTION studio_decisions_scope_legacy_insert()');
    expect(scopeMigration).toContain("NEW.source_channel_id IS NOT NULL");
    expect(scopeMigration).toContain("NEW.decision_scope := 'team'");
    expect(scopeMigration).toContain('BEFORE INSERT ON studio_decisions');
  });

  it('makes the target Co-Lab writer explicit about team scope', () => {
    expect(colabCapture).toContain('source_channel_id, decision_scope, title');
    expect(colabCapture).toContain("VALUES ($1, $2, $3, $4, $5, 'team', $6, $7, 'draft')");
  });
  it('allows team decisions to survive source-channel deletion', () => {
    expect(scopeMigration).toMatch(
      /\(decision_scope = 'team'\s+AND personal_member_id IS NULL\)/
    );
    expect(scopeMigration).not.toMatch(
      /decision_scope = 'team'[\s\S]{0,120}source_channel_id IS NOT NULL/
    );
  });

  it('fails closed on unclassifiable legacy ownership', () => {
    expect(scopeMigration).toContain('practitioner_id IS NULL');
    expect(scopeMigration).toContain('source_channel_id IS NULL');
    expect(scopeMigration).toContain(
      "RAISE EXCEPTION 'studio_decisions contains legacy rows with no practitioner or channel ownership'"
    );
  });

  it('does not rewrite updated_at during ownership backfill', () => {
    expect(scopeMigration).toContain(
      'ALTER TABLE studio_decisions DISABLE TRIGGER tr_studio_decisions_updated_at'
    );
    expect(scopeMigration).toContain(
      'ALTER TABLE studio_decisions ENABLE TRIGGER tr_studio_decisions_updated_at'
    );
  });
  it('uses stable retry-safe House shortcut constraint identities', () => {
    expect(prefsMigration).toContain('CREATE TABLE IF NOT EXISTS house_member_preferences');
    expect(prefsMigration).toContain(
      'CONSTRAINT house_member_preferences_shortcut_ids_cardinality_check'
    );
    expect(prefsMigration).toContain(
      'CONSTRAINT house_member_preferences_shortcut_ids_catalog_check'
    );
    expect(catalogMigration).toContain(
      'DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_cardinality_check'
    );
    expect(catalogMigration).toContain(
      'DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_catalog_check'
    );
  });
});
