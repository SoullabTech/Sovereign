jest.mock('server-only', () => ({}), { virtual: true });

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { AinVaultReadError, AinVaultReadService } from '../AinVaultReadService';
import type { AinVaultAlias, AinVaultScopeDefinition } from '../types';

function scope(
  alias: AinVaultAlias,
  rootPath: string,
  authorityKind: AinVaultScopeDefinition['authorityKind'],
): AinVaultScopeDefinition {
  return {
    alias,
    displayName: alias,
    description: 'test scope',
    rootPath,
    authorityKind,
    readEligible: true,
    writeEligible: false,
    allowedExtensions: ['.md', '.txt', '.canvas'],
    deniedPrefixes: ['.obsidian', 'Denied'],
  };
}
describe('AinVaultReadService', () => {
  let root: string;
  let service: AinVaultReadService;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'ain-vault-'));
    fs.mkdirSync(path.join(root, 'Subdir'), { recursive: true });
    fs.mkdirSync(path.join(root, 'Denied'), { recursive: true });
    fs.mkdirSync(path.join(root, '.obsidian'), { recursive: true });

    fs.writeFileSync(
      path.join(root, 'A.md'),
      '# Alpha\n\nSpiralogic field intelligence lives here.\n\n[[B#Beta|B alias]]\n',
    );
    fs.writeFileSync(
      path.join(root, 'B.md'),
      '# Beta\n\nThis note points back to [[A]].\n',
    );
    fs.writeFileSync(path.join(root, 'Subdir', 'C.md'), '# Gamma\n\nOther material.\n');
    fs.writeFileSync(path.join(root, 'Denied', 'Secret.md'), 'Spiralogic secret\n');
    fs.writeFileSync(path.join(root, '.obsidian', 'config.md'), 'hidden\n');

    const scopes = {
      AIN_ACTIVE: scope('AIN_ACTIVE', root, 'founder_personal_development_archive'),
      AIN_FOUNDATIONAL: scope('AIN_FOUNDATIONAL', root, 'founder_architectural_corpus'),
      MAIA_CONSCIOUSNESS: scope('MAIA_CONSCIOUSNESS', root, 'curated_source_synthesis'),
    } as const;

    service = new AinVaultReadService(scopes);
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });
  it('lists the admitted root without exposing denied folders', async () => {
    const entries = await service.list('AIN_FOUNDATIONAL', '');
    const names = entries.map((entry) => entry.name);
    expect(names).toContain('A.md');
    expect(names).toContain('B.md');
    expect(names).toContain('Subdir');
    expect(names).not.toContain('Denied');
    expect(names).not.toContain('.obsidian');
    expect(entries.every((entry) => !('content' in entry))).toBe(true);
  });

  it('returns exact heading content with source hashes and line provenance', async () => {
    const result = await service.read('AIN_FOUNDATIONAL', 'A.md', 'Alpha');
    expect(result.content).toContain('Spiralogic field intelligence lives here.');
    expect(result.provenance.heading).toBe('Alpha');
    expect(result.provenance.lineStart).toBe(1);
    expect(result.provenance.lineEnd).toBeGreaterThanOrEqual(3);
    expect(result.provenance.fileSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.provenance.contentSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.provenance.authorityKind).toBe('founder_architectural_corpus');
  });
  it('searches admitted text and excludes denied subtrees', async () => {
    const results = await service.search('AIN_FOUNDATIONAL', 'Spiralogic field');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].relativePath).toBe('A.md');
    expect(results.some((result) => result.relativePath.includes('Denied'))).toBe(false);
    expect(results[0].matches[0].line).toBeGreaterThan(0);
  });

  it('returns outbound wikilinks and bounded backlinks', async () => {
    const result = await service.links('AIN_FOUNDATIONAL', 'A.md');
    expect(result.outbound).toContainEqual({
      target: 'B',
      heading: 'Beta',
      aliasText: 'B alias',
    });
    expect(result.backlinks.some((link) => link.relativePath === 'B.md')).toBe(true);
  });

  it('rejects traversal, denied paths, and symlink escape', async () => {
    await expect(service.read('AIN_FOUNDATIONAL', '../escape.md')).rejects.toMatchObject({
      code: 'DENIED_PATH',
    });
    await expect(service.read('AIN_FOUNDATIONAL', 'Denied/Secret.md')).rejects.toMatchObject({
      code: 'DENIED_PATH',
    });

    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ain-vault-outside-'));
    const outsideFile = path.join(outside, 'Outside.md');
    fs.writeFileSync(outsideFile, 'outside material\n');
    fs.symlinkSync(outsideFile, path.join(root, 'Escape.md'));
    try {
      await expect(service.read('AIN_FOUNDATIONAL', 'Escape.md')).rejects.toMatchObject({
        code: 'DENIED_PATH',
      });
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
  it('resolves explicit context sources without mutating them', async () => {
    const before = fs.readFileSync(path.join(root, 'A.md'), 'utf8');
    const sources = await service.resolveContextSources([
      { vaultAlias: 'AIN_FOUNDATIONAL', relativePath: 'A.md', heading: 'Alpha' },
    ]);
    expect(sources).toHaveLength(1);
    expect(sources[0].provenance.relativePath).toBe('A.md');
    expect(fs.readFileSync(path.join(root, 'A.md'), 'utf8')).toBe(before);
  });

  it('fails closed when a heading is absent', async () => {
    await expect(service.read('AIN_FOUNDATIONAL', 'A.md', 'Does Not Exist')).rejects.toBeInstanceOf(
      AinVaultReadError,
    );
  });
});
