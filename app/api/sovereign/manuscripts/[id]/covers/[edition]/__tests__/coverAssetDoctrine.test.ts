import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (...parts: string[]) => readFileSync(join(__dirname, '..', ...parts), 'utf8');
const ROUTE = read('route.ts');
const BYTES = read('bytes', 'route.ts');
const REPO = join(__dirname, '..', '..', '..', '..', '..', '..', '..', '..');
const MIGRATION = readFileSync(
  join(REPO, 'database/migrations/20260916000006_manuscript_cover_assets.sql'),
  'utf8',
);
const ERASE = readFileSync(join(REPO, 'lib/manuscript/source/eraseManuscript.ts'), 'utf8');

describe('HPB-05 cover asset custody', () => {
  it('keeps paperback and hardcover as distinct edition identities', () => {
    expect(MIGRATION).toContain("edition IN ('paperback', 'hardcover')");
    expect(MIGRATION).toContain('UNIQUE (manuscript_id, edition)');
    expect(ROUTE).toContain('isCoverEdition(edition)');
  });

  it('proves manuscript ownership before accepting upload bytes', () => {
    const ownedAt = ROUTE.indexOf('ownedManuscript(id, memberId)');
    const formAt = ROUTE.indexOf('request.formData()');
    expect(ownedAt).toBeGreaterThan(-1);
    expect(formAt).toBeGreaterThan(ownedAt);
  });

  it('bounds size before buffering and lets server PDF inspection establish type', () => {
    expect(ROUTE).toContain('file.size > MAX_BYTES');
    expect(ROUTE.indexOf('file.size > MAX_BYTES')).toBeLessThan(ROUTE.indexOf('file.arrayBuffer()'));
    expect(ROUTE).toContain('inspectCoverPdf');
    expect(ROUTE).not.toMatch(/file\.type\s*!==\s*['"]application\/pdf/);
  });

  it('records exact-byte hash and measured page geometry', () => {
    expect(ROUTE).toContain("createHash('sha256')");
    expect(ROUTE).toContain('inspection.widthPt');
    expect(ROUTE).toContain('inspection.heightPt');
    expect(MIGRATION).toContain('sha256 text NOT NULL');
    expect(MIGRATION).toContain('page_width_pt numeric NOT NULL');
    expect(MIGRATION).toContain('page_height_pt numeric NOT NULL');
  });

  it('replacement and removal both owe byte destruction', () => {
    expect(ROUTE.match(/INSERT INTO vault_erasure_queue/g)?.length).toBeGreaterThanOrEqual(2);
    expect(ROUTE).toContain('sweepVaultErasureQueue');
    expect(ROUTE).toMatch(/DELETE FROM manuscript_cover_assets[\s\S]{0,180}RETURNING storage_path/);
  });

  it('queues both cover editions before whole-manuscript deletion can cascade metadata', () => {
    const coverReadAt = ERASE.indexOf('SELECT storage_path FROM manuscript_cover_assets');
    const manuscriptDeleteAt = ERASE.indexOf('DELETE FROM member_manuscripts');
    expect(coverReadAt).toBeGreaterThan(-1);
    expect(manuscriptDeleteAt).toBeGreaterThan(coverReadAt);
    expect(ERASE).toContain('...covers.rows.map((r) => r.storage_path)');
    expect(ERASE).toContain('INSERT INTO vault_erasure_queue');
  });

  it('serves bytes only through authenticated owner-scoped private reads', () => {
    expect(BYTES).toContain('getMemberIdFromRequest');
    expect(BYTES).toContain('member_id = $2');
    expect(BYTES).toContain("'Cache-Control': 'private, no-cache, must-revalidate'");
    expect(BYTES).not.toMatch(/signedUrl|publicUrl|cdn/i);
  });

  it('does not mistake upload custody for print certification', () => {
    expect(ROUTE).toContain("printGeometryStatus: 'not_yet_certified'");
    expect(MIGRATION).not.toMatch(/print_ready|certified/i);
  });
});
