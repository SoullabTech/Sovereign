import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  buildCabinContextPackage,
  serializeCabinContextPackage,
} from '../contextPackage';
import {
  clearCabinContextMount,
  initializeCabinContextMount,
} from '../contextRuntime';
import { readCabinExperienceContext } from '../experienceContext';

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'maia-cabin-experience-context-'));
}

function validPackage() {
  return buildCabinContextPackage({
    works: [
      {
        schema: 'soullab.cabin.work-reference.v1',
        source: {
          kind: 'living_work',
          id: '00000000-0000-4000-8000-000000000001',
          updatedAt: '2026-10-01T00:00:00.000Z',
        },
        permission: {
          scope: 'member',
          basis: 'member_owned',
        },
        work: {
          id: '00000000-0000-4000-8000-000000000001',
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

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.10 Mounted Experience Context', () => {
  afterEach(() => {
    clearCabinContextMount();
  });

  it('F1 reports unavailable when no runtime mount exists', () => {
    const context = readCabinExperienceContext();

    expect(context.state).toBe('unavailable');
    expect(context.work).toEqual([]);
    expect(context.relationships).toEqual([]);
    expect(context.memories).toEqual([]);
  });

  it('F2 does not initialize or mount an artifact as a side effect of reading', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');

    fs.writeFileSync(packagePath, serializeCabinContextPackage(validPackage()));

    const before = fs.readFileSync(packagePath, 'utf8');
    const context = readCabinExperienceContext();

    expect(context.state).toBe('unavailable');
    expect(fs.readFileSync(packagePath, 'utf8')).toBe(before);
    expect(fs.existsSync(dataPath)).toBe(false);
  });

  it('F3 preserves truthful empty mounted context', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');

    fs.writeFileSync(
      path.join(root, 'context-package.json'),
      serializeCabinContextPackage(buildCabinContextPackage()!),
    );

    expect(initializeCabinContextMount(dataPath).state).toBe('mounted');

    const context = readCabinExperienceContext();

    expect(context.state).toBe('mounted');
    expect(context.availability).toEqual({
      work: 'empty',
      relationship: 'empty',
      memory: 'empty',
    });
  });

  it('F4 exposes only the already mounted governed references', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packageValue = validPackage();

    fs.writeFileSync(
      path.join(root, 'context-package.json'),
      serializeCabinContextPackage(packageValue),
    );
    initializeCabinContextMount(dataPath);

    const context = readCabinExperienceContext();

    expect(context.state).toBe('mounted');
    expect(context.work).toEqual(packageValue.works);
    expect(context.relationships).toEqual([]);
    expect(context.memories).toEqual([]);
    expect(context.availability.work).toBe('present');
  });

  it('F5 does not add relevance, current, ranking, synthesis, or cognition fields', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');

    fs.writeFileSync(
      path.join(root, 'context-package.json'),
      serializeCabinContextPackage(validPackage()),
    );
    initializeCabinContextMount(dataPath);

    const serialized = JSON.stringify(readCabinExperienceContext());

    for (const forbidden of [
      'relevance',
      'score',
      'rank',
      'currentWork',
      'currentMemory',
      'synthesis',
      'question',
      'transition',
      'cognition',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('F6 is a pure mounted-state read with no network, database, or filesystem seam', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'lib/cabin/experienceContext.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/fetch\(|https?:\/\//);
    expect(source).not.toMatch(/DatabaseSync|CabinLocalStore|postgres|query\(/);
    expect(source).not.toMatch(/writeFile|renameSync|appendFile|unlink|rmSync/);
    expect(source).not.toMatch(/initializeCabinContextMount|clearCabinContextMount/);
  });

  it('F7 returns a detached experience shape that cannot mutate the mounted snapshot', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');

    fs.writeFileSync(
      path.join(root, 'context-package.json'),
      serializeCabinContextPackage(validPackage()),
    );
    initializeCabinContextMount(dataPath);

    const context = readCabinExperienceContext();
    context.work[0].work.title = 'Experience mutation';

    const again = readCabinExperienceContext();

    expect(again.work[0].work.title).toBe('Elemental Alchemy');
  });

  it('F8 excludes member and session identity from the experience bridge', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');

    fs.writeFileSync(
      path.join(root, 'context-package.json'),
      serializeCabinContextPackage(validPackage()),
    );
    initializeCabinContextMount(dataPath);

    const serialized = JSON.stringify(readCabinExperienceContext());

    expect(serialized).not.toContain('memberId');
    expect(serialized).not.toContain('sessionId');
    expect(serialized).not.toContain('local-member');
  });

  it('F9 remains bound to the current ephemeral mount after the artifact changes', () => {
    const root = tempRoot();
    const dataPath = path.join(root, 'cabin.sqlite');
    const packagePath = path.join(root, 'context-package.json');

    fs.writeFileSync(
      packagePath,
      serializeCabinContextPackage(validPackage()),
    );
    initializeCabinContextMount(dataPath);

    fs.writeFileSync(
      packagePath,
      serializeCabinContextPackage(buildCabinContextPackage()!),
    );

    const context = readCabinExperienceContext();

    expect(context.state).toBe('mounted');
    expect(context.work).toHaveLength(1);
    expect(context.work[0].work.title).toBe('Elemental Alchemy');
  });
});
