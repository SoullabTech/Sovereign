import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  buildCabinContextPackage,
  parseCabinContextPackage,
  serializeCabinContextPackage,
} from '../contextPackage';
import { writeCabinContextPackage } from '../contextPackageWriter';
import {
  cabinContextSnapshot,
  clearCabinContextMount,
  initializeCabinContextMount,
} from '../contextRuntime';

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'maia-cabin-context-export-'));
}

function validWork() {
  return {
    schema: 'soullab.cabin.work-reference.v1' as const,
    source: {
      kind: 'living_work' as const,
      id: 'work-1',
      updatedAt: '2026-09-30T12:00:00.000Z',
    },
    permission: {
      scope: 'member' as const,
      basis: 'member_owned' as const,
    },
    work: {
      id: 'work-1',
      title: 'Elemental Alchemy',
      purpose: 'Write the book',
      form: 'book',
      stage: 'writing',
      manuscriptState: 'existing-manuscript',
      expressions: [],
    },
  };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.3 Explicit Context Package Export', () => {
  afterEach(() => {
    clearCabinContextMount();
  });

  it('F1 requires one absolute artifact path', () => {
    expect(() =>
      writeCabinContextPackage('context-package.json', {}),
    ).toThrow('CABIN_CONTEXT_PACKAGE_PATH_MUST_BE_ABSOLUTE');
  });

  it('writes a valid package through H2.4 composition', () => {
    const root = tempRoot();
    const packagePath = path.join(root, 'context-package.json');

    const result = writeCabinContextPackage(packagePath, {
      works: [validWork()],
    });

    expect(result.packagePath).toBe(packagePath);
    expect(result.bytes).toBe(
      Buffer.byteLength(serializeCabinContextPackage(result.package), 'utf8'),
    );
    expect(parseCabinContextPackage(fs.readFileSync(packagePath, 'utf8'))).toEqual(
      result.package,
    );
  });

  it('the exported artifact is consumable by the H3.2 runtime mount', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');

    const expected = writeCabinContextPackage(packagePath, {
      works: [validWork()],
    }).package;

    expect(initializeCabinContextMount(dataPath)).toEqual({
      state: 'mounted',
      packagePath,
    });
    expect(cabinContextSnapshot(dataPath)).toEqual(expected);
  });

  it('F2 rejects invalid projections before replacing an existing artifact', () => {
    const root = tempRoot();
    const packagePath = path.join(root, 'context-package.json');
    const existing = JSON.stringify({ preserved: true });

    fs.writeFileSync(packagePath, existing, 'utf8');

    expect(() =>
      writeCabinContextPackage(packagePath, {
        works: [{ invalid: true } as never],
      }),
    ).toThrow('CABIN_CONTEXT_PACKAGE_INVALID');

    expect(fs.readFileSync(packagePath, 'utf8')).toBe(existing);
  });

  it('F3 carries no member/session/browser identity', () => {
    const root = tempRoot();
    const packagePath = path.join(root, 'context-package.json');

    writeCabinContextPackage(packagePath, {
      works: [validWork()],
    });

    const serialized = fs.readFileSync(packagePath, 'utf8');
    expect(serialized).not.toContain('memberId');
    expect(serialized).not.toContain('sessionId');
    expect(serialized).not.toContain('userId');
    expect(serialized).not.toContain('localStorage');
  });

  it('F4 is deterministic for identical projections', () => {
    const root = tempRoot();
    const firstPath = path.join(root, 'first.json');
    const secondPath = path.join(root, 'second.json');

    const input = { works: [validWork()] };

    writeCabinContextPackage(firstPath, input);
    writeCabinContextPackage(secondPath, input);

    expect(fs.readFileSync(firstPath, 'utf8')).toBe(
      fs.readFileSync(secondPath, 'utf8'),
    );
  });

  it('F5 leaves the target intact when the atomic rename cannot complete', () => {
    const root = tempRoot();
    const targetDirectory = path.join(root, 'context-package.json');
    fs.mkdirSync(targetDirectory);

    expect(() =>
      writeCabinContextPackage(targetDirectory, {
        works: [validWork()],
      }),
    ).toThrow();

    expect(fs.statSync(targetDirectory).isDirectory()).toBe(true);
    expect(
      fs.readdirSync(root).filter((entry) => entry.includes('.context-package.')),
    ).toEqual([]);
  });

  it('F6 cannot create a Work, Relationship, or Memory authority of its own', () => {
    const root = tempRoot();
    const packagePath = path.join(root, 'context-package.json');

    const result = writeCabinContextPackage(packagePath, {});

    expect(result.package.works).toEqual([]);
    expect(result.package.relationships).toEqual([]);
    expect(result.package.memories).toEqual([]);
    expect(result.package).not.toHaveProperty('memberId');
    expect(result.package).not.toHaveProperty('currentWork');
  });

  it('F7 has no database or browser persistence seam', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'lib/cabin/contextPackageWriter.ts'),
      'utf8',
    );

    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('http://');
    expect(source).not.toContain('https://');
    expect(source).not.toContain('CabinLocalStore');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('DatabaseSync');
  });

  it('F8 is explicit: there is no watcher, timer, or runtime remount', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'lib/cabin/contextPackageWriter.ts'),
      'utf8',
    );

    expect(source).not.toContain('watch(');
    expect(source).not.toContain('setInterval');
    expect(source).not.toContain('setTimeout');
    expect(source).not.toContain('initializeCabinContextMount');
  });

  it('writes owner-readable package artifacts', () => {
    const root = tempRoot();
    const packagePath = path.join(root, 'context-package.json');

    writeCabinContextPackage(packagePath, {});

    const mode = fs.statSync(packagePath).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('permits an explicitly empty package', () => {
    const root = tempRoot();
    const packagePath = path.join(root, 'context-package.json');

    const result = writeCabinContextPackage(packagePath, {});

    expect(result.package).toEqual(buildCabinContextPackage());
    expect(parseCabinContextPackage(fs.readFileSync(packagePath, 'utf8'))).toEqual(
      buildCabinContextPackage(),
    );
  });
});
