import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  cabinContextSnapshot,
  clearCabinContextMount,
  currentCabinContextRuntime,
  initializeCabinContextMount,
  resolveCabinContextPackagePath,
} from '../contextRuntime';
import {
  buildCabinContextPackage,
  serializeCabinContextPackage,
} from '../contextPackage';

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'maia-cabin-context-runtime-'));
}

function validPackage() {
  return buildCabinContextPackage({
    works: [
      {
        schema: 'soullab.cabin.work-reference.v1',
        source: {
          kind: 'living_work',
          id: 'work-1',
          updatedAt: '2026-09-30T12:00:00.000Z',
        },
        permission: {
          scope: 'member',
          basis: 'member_owned',
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
      },
    ],
  })!;
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.2 Desktop Context Wiring', () => {
  afterEach(() => {
    clearCabinContextMount();
  });

  it('resolves the default package beside the Cabin data file', () => {
    const dataPath = '/tmp/cabin/cabin.sqlite';
    expect(resolveCabinContextPackagePath(dataPath)).toBe(
      '/tmp/cabin/context-package.json',
    );
  });

  it('accepts an explicit absolute package path and rejects a relative one', () => {
    expect(
      resolveCabinContextPackagePath(
        '/tmp/cabin/cabin.sqlite',
        '/tmp/hand-off/context-package.json',
      ),
    ).toBe('/tmp/hand-off/context-package.json');

    expect(() =>
      resolveCabinContextPackagePath(
        '/tmp/cabin/cabin.sqlite',
        'context-package.json',
      ),
    ).toThrow('CABIN_CONTEXT_PACKAGE_PATH_MUST_BE_ABSOLUTE');
  });

  it('F1 mounts an empty context truthfully when the package artifact is absent', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');

    expect(initializeCabinContextMount(dataPath)).toEqual({
      state: 'empty',
      packagePath: path.join(root, 'context-package.json'),
    });

    // Empty is a truthful health state; there is no mounted package to snapshot.
    clearCabinContextMount();
  });

  it('F2 rejects an invalid package before it can become mounted state', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');

    fs.writeFileSync(packagePath, '{"schema":"soullab.cabin.context-package.v999"}');

    expect(() => initializeCabinContextMount(dataPath)).toThrow(
      'CABIN_CONTEXT_PACKAGE_INVALID',
    );
    expect(() => cabinContextSnapshot(dataPath)).toThrow(
      'CABIN_CONTEXT_PACKAGE_INVALID',
    );
  });

  it('F4 reads valid context only through the strict package parser', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');
    const packageValue = validPackage();

    fs.writeFileSync(
      packagePath,
      serializeCabinContextPackage(packageValue),
      'utf8',
    );

    expect(initializeCabinContextMount(dataPath)).toEqual({
      state: 'mounted',
      packagePath,
    });
    expect(cabinContextSnapshot(dataPath)).toEqual(packageValue);
  });

  it('F5 never rewrites the package artifact or persists it into Cabin state', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');
    const serialized = serializeCabinContextPackage(validPackage());

    fs.writeFileSync(packagePath, serialized, 'utf8');
    const before = fs.readFileSync(packagePath, 'utf8');

    initializeCabinContextMount(dataPath);
    const snapshot = cabinContextSnapshot(dataPath);
    snapshot.works[0].work.title = 'Caller mutation';

    expect(fs.readFileSync(packagePath, 'utf8')).toBe(before);
    expect(cabinContextSnapshot(dataPath).works[0].work.title).toBe(
      'Elemental Alchemy',
    );
    expect(fs.existsSync(dataPath)).toBe(false);
  });

  it('F6 exposes only the governed package and never current-state or graph fields', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');

    fs.writeFileSync(
      packagePath,
      serializeCabinContextPackage(validPackage()),
      'utf8',
    );

    initializeCabinContextMount(dataPath);
    const context = cabinContextSnapshot(dataPath);

    expect(context).not.toHaveProperty('currentWork');
    expect(context).not.toHaveProperty('currentMemory');
    expect(context).not.toHaveProperty('currentRelationship');
    expect(context).not.toHaveProperty('questions');
    expect(context).not.toHaveProperty('transitions');
    expect(context).not.toHaveProperty('edges');
    expect(context).not.toHaveProperty('memberId');
    expect(context).not.toHaveProperty('sessionId');
  });
  it('F7 does not leak mounted state across a clear/fresh mount', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');

    fs.writeFileSync(
      packagePath,
      serializeCabinContextPackage(validPackage()),
      'utf8',
    );

    initializeCabinContextMount(dataPath);
    expect(cabinContextSnapshot(dataPath).works).toHaveLength(1);

    clearCabinContextMount();

    const secondRoot = tempRoot();
    const secondDataPath = path.join(secondRoot, 'cabin.sqlite');
    expect(initializeCabinContextMount(secondDataPath)).toEqual({
      state: 'empty',
      packagePath: path.join(secondRoot, 'context-package.json'),
    });
  });

  it('F8 keeps the runtime carrier process-global so independently bundled consumers share the mount', () => {
    const root = globalThis as typeof globalThis & {
      __SOULLAB_CABIN_CONTEXT_RUNTIME__?: unknown;
    };
    const before = root.__SOULLAB_CABIN_CONTEXT_RUNTIME__;

    const secondRoot = tempRoot();
    const secondDataPath = path.join(secondRoot, 'cabin.sqlite');
    fs.writeFileSync(
      path.join(secondRoot, 'context-package.json'),
      serializeCabinContextPackage(validPackage()),
      'utf8',
    );

    initializeCabinContextMount(secondDataPath);

    expect(root.__SOULLAB_CABIN_CONTEXT_RUNTIME__).toBeDefined();
    expect(currentCabinContextRuntime()?.state).toBe('mounted');

    clearCabinContextMount();
    expect(root.__SOULLAB_CABIN_CONTEXT_RUNTIME__).toBeDefined();
    expect(currentCabinContextRuntime()).toBeNull();

    root.__SOULLAB_CABIN_CONTEXT_RUNTIME__ = before;
  });

  it('F9 contains no network or write-to-store seam', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'lib/cabin/contextRuntime.ts'),
      'utf8',
    );

    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('http://');
    expect(source).not.toContain('https://');
    expect(source).not.toContain('writeFileSync');
    expect(source).not.toContain('appendFileSync');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
  });
});
