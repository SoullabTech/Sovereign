/**
 * MAIA-MAVEN-T1A · J5-2 — Personal Keeps disclosure vocabulary falsifiers.
 *
 * Four axes, four migrations. No migration may widen a neighboring axis.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const code = (p: string) => read(p)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/--.*$/gm, '');

const SOURCE = 'database/migrations/20260917161001_disclosure_source_keep.sql';
const BOUNDARY = 'database/migrations/20260917161002_disclosure_boundary_personal_keeps.sql';
const SCOPE = 'database/migrations/20260917161003_disclosure_scope_object.sql';
const GESTURE = 'database/migrations/20260917161004_disclosure_gesture_read_personal_keeps.sql';

const receipt = () => read('lib/disclosure/contextDisclosureReceipt.ts');

describe('TypeScript disclosure contract admits exactly the J5-2 vocabulary', () => {
  it('admits keep as a source class', () => {
    expect(receipt()).toMatch(/DisclosureSourceClass\s*=\s*'work'\s*\|\s*'keep'/);
  });
  it('admits the Personal Keeps cognition boundary', () => {
    expect(receipt()).toContain("'maia.personal_keeps_read->maia_cognition'");
  });
  it('admits object scope', () => {
    expect(receipt()).toMatch(/DisclosureScopeKind\s*=\s*'whole_work'\s*\|\s*'section'\s*\|\s*'passage'\s*\|\s*'object'/);
  });
  it('admits the read_personal_keeps gesture', () => {
    expect(receipt()).toContain("'read_personal_keeps'");
  });
});

describe('one governed migration per disclosure axis', () => {
  it('source-class migration widens only source_class', () => {
    const c = code(SOURCE);
    expect(c).toMatch(/DROP CONSTRAINT IF EXISTS context_disclosure_receipts_source_class_check/);
    expect(c).toMatch(/ADD CONSTRAINT context_disclosure_receipts_source_class_check/);
    expect(c).toMatch(/source_class IN \(\s*'work'\s*,\s*'keep'\s*\)/);
    expect(c).not.toMatch(/boundary_check|scope_kind_check|gesture_check/);
  });

  it('boundary migration widens only boundary', () => {
    const c = code(BOUNDARY);
    expect(c).toMatch(/DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check/);
    expect(c).toMatch(/ADD CONSTRAINT context_disclosure_receipts_boundary_check/);
    expect(c).toContain("'writers_studio.focus->maia_cognition'");
    expect(c).toContain("'writers_studio.developmental_ask->maia_cognition'");
    expect(c).toContain("'maia.personal_keeps_read->maia_cognition'");
    expect(c).not.toMatch(/source_class_check|scope_kind_check|gesture_check/);
  });

  it('scope migration widens only scope_kind', () => {
    const c = code(SCOPE);
    expect(c).toMatch(/DROP CONSTRAINT IF EXISTS context_disclosure_receipts_scope_kind_check/);
    expect(c).toMatch(/ADD CONSTRAINT context_disclosure_receipts_scope_kind_check/);
    expect(c).toMatch(/scope_kind IN \(\s*'whole_work'\s*,\s*'section'\s*,\s*'passage'\s*,\s*'object'\s*\)/);
    expect(c).not.toMatch(/source_class_check|boundary_check|gesture_check/);
  });

  it('gesture migration widens only gesture', () => {
    const c = code(GESTURE);
    expect(c).toMatch(/DROP CONSTRAINT IF EXISTS context_disclosure_receipts_gesture_check/);
    expect(c).toMatch(/ADD CONSTRAINT context_disclosure_receipts_gesture_check/);
    expect(c).toContain("'ask_maia'");
    expect(c).toContain("'work_with_this'");
    expect(c).toContain("'widen_focus'");
    expect(c).toContain("'authorize_sections'");
    expect(c).toContain("'read_personal_keeps'");
    expect(c).not.toMatch(/source_class_check|boundary_check|scope_kind_check/);
  });
});

describe('shared vocabulary does not widen Writer Focus authority', () => {
  it('Writer Focus explicitly excludes the new Keep-only scope and gesture', () => {
    const focus = read('lib/writers-studio/focusCrossing.ts');
    expect(focus).toMatch(/FocusDisclosureScopeKind = 'whole_work' \| 'section' \| 'passage'/);
    expect(focus).toMatch(/FocusDisclosureGesture = 'ask_maia' \| 'work_with_this' \| 'widen_focus' \| 'authorize_sections'/);
  });
});

describe('J5-2 does not invent a second disclosure substrate', () => {
  it.each([SOURCE, BOUNDARY, SCOPE, GESTURE])('%s alters the existing table only', (path) => {
    const c = code(path);
    expect(c).toMatch(/ALTER TABLE context_disclosure_receipts/);
    expect(c).not.toMatch(/CREATE TABLE/);
    expect(c).not.toMatch(/ADD COLUMN/);
  });
});
