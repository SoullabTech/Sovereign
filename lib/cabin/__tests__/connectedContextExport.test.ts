import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  exportConnectedCabinContextPackage,
  type ConnectedCabinContextExportDeps,
} from '../connectedContextExport';
import type {
  ConnectedCabinExportAssemblyDeps,
  ConnectedCabinExportSelection,
} from '../connectedExportAssembly';
import { parseCabinContextPackage } from '../contextPackage';

const MEMBER = '00000000-0000-4000-8000-000000000001';

function emptySelection(): ConnectedCabinExportSelection {
  return {
    workIds: [],
    relationshipIds: [],
    memoryIds: [],
  };
}

function tempPath(): string {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'maia-cabin-explicit-export-'),
  );
  return path.join(root, 'context-package.json');
}

function fakeAssemblyDeps(): ConnectedCabinExportAssemblyDeps {
  return {
    query: async () => ({ rows: [] }),
    loadRelationshipContext: async () => null,
  };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.5 Explicit Connected Export', () => {
  it('F1 uses H3.4 assembly and H3.3 writer as the only two operations', async () => {
    const calls: string[] = [];
    const packageValue = {
      schema: 'soullab.cabin.context-package.v1' as const,
      scope: 'member' as const,
      works: [],
      relationships: [],
      memories: [],
    };

    const deps: ConnectedCabinContextExportDeps = {
      assemble: async (memberId, selection) => {
        calls.push(`assemble:${memberId}:${JSON.stringify(selection)}`);
        return packageValue;
      },
      write: (packagePath, input) => {
        calls.push(`write:${packagePath}`);
        expect(input).toBe(packageValue);
        return {
          packagePath,
          bytes: 2,
          package: packageValue,
        };
      },
    };

    const packagePath = tempPath();
    const result = await exportConnectedCabinContextPackage(
      MEMBER,
      emptySelection(),
      packagePath,
      fakeAssemblyDeps(),
      deps,
    );

    expect(result.package).toBe(packageValue);
    expect(calls).toEqual([
      `assemble:${MEMBER}:${JSON.stringify(emptySelection())}`,
      `write:${packagePath}`,
    ]);
  });

  it('F2 never writes when H3.4 rejects the selection', async () => {
    let writerCalls = 0;
    const deps: ConnectedCabinContextExportDeps = {
      assemble: async () => {
        throw new Error('CABIN_EXPORT_SELECTION_INVALID:work:foreign');
      },
      write: () => {
        writerCalls += 1;
        throw new Error('writer must not run');
      },
    };

    await expect(
      exportConnectedCabinContextPackage(
        MEMBER,
        emptySelection(),
        tempPath(),
        fakeAssemblyDeps(),
        deps,
      ),
    ).rejects.toThrow('CABIN_EXPORT_SELECTION_INVALID:work:foreign');

    expect(writerCalls).toBe(0);
  });

  it('F3 an explicit empty selection produces a valid empty H2.4 package', async () => {
    const packagePath = tempPath();

    const result = await exportConnectedCabinContextPackage(
      MEMBER,
      emptySelection(),
      packagePath,
      fakeAssemblyDeps(),
    );

    const parsed = parseCabinContextPackage(
      fs.readFileSync(packagePath, 'utf8'),
    );

    expect(parsed).toEqual(result.package);
    expect(parsed?.works).toEqual([]);
    expect(parsed?.relationships).toEqual([]);
    expect(parsed?.memories).toEqual([]);
  });

  it('F4 the command has no direct filesystem, network, database, or automatic trigger seam', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'lib/cabin/connectedContextExport.ts'),
      'utf8',
    );

    expect(source).not.toMatch(
      /writeFile|writeFileSync|renameSync|appendFile|unlinkSync|rmSync/,
    );
    expect(source).not.toMatch(/DatabaseSync|INSERT|UPDATE|DELETE|UPSERT/);
    expect(source).not.toMatch(/fetch\(|https?:\/\//);
    expect(source).not.toMatch(/setTimeout|setInterval|watch\(/);
  });

  it('F5 preserves the H3.3 writer result as the observable export result', async () => {
    const packageValue = {
      schema: 'soullab.cabin.context-package.v1' as const,
      scope: 'member' as const,
      works: [],
      relationships: [],
      memories: [],
    };
    const expected = {
      packagePath: '/tmp/context-package.json',
      bytes: 123,
      package: packageValue,
    };

    const deps: ConnectedCabinContextExportDeps = {
      assemble: async () => packageValue,
      write: () => expected,
    };

    await expect(
      exportConnectedCabinContextPackage(
        MEMBER,
        emptySelection(),
        expected.packagePath,
        fakeAssemblyDeps(),
        deps,
      ),
    ).resolves.toBe(expected);
  });

  it('F6 performs a real H3.4-to-H3.3 round trip for an explicitly selected Work', async () => {
    const workId = '00000000-0000-4000-8000-000000000002';
    const packagePath = tempPath();

    const assemblyDeps: ConnectedCabinExportAssemblyDeps = {
      query: async <T>(sql: string) => {
        if (/FROM living_works/i.test(sql)) {
          return {
            rows: [{
              id: workId,
              member_id: MEMBER,
              title: 'Elemental Alchemy',
              purpose: 'Write the book',
              form: 'book',
              stage: 'writing',
              manuscript_state: 'existing-manuscript',
              created_at: '2026-09-30T12:00:00.000Z',
              updated_at: '2026-09-30T13:00:00.000Z',
              expression_row_id: '00000000-0000-4000-8000-000000000003',
              expression_type: 'manuscript',
              expression_id: 'manuscript-a',
              declared_at: '2026-09-30T12:01:00.000Z',
            }] as T[],
          };
        }
        return { rows: [] as T[] };
      },
      loadRelationshipContext: async () => null,
    };

    const result = await exportConnectedCabinContextPackage(
      MEMBER,
      { workIds: [workId], relationshipIds: [], memoryIds: [] },
      packagePath,
      assemblyDeps,
    );

    const parsed = parseCabinContextPackage(
      fs.readFileSync(packagePath, 'utf8'),
    );

    expect(parsed).toEqual(result.package);
    expect(parsed?.works).toHaveLength(1);
    expect(parsed?.works[0].work.expressions[0].expressionId).toBe('manuscript-a');
    expect(JSON.stringify(parsed)).not.toContain(MEMBER);
  });
});
