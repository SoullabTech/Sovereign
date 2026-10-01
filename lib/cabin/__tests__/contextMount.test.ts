import {
  buildCabinContextPackage,
  serializeCabinContextPackage,
} from '../contextPackage';
import { createCabinContextMount } from '../contextMount';

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

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.1 Cabin Context Mount', () => {
  it('mounts only a package accepted by the H2.5 custody parser', () => {
    const mount = createCabinContextMount();
    const packageValue = validPackage();

    expect(
      mount.mountSerialized(serializeCabinContextPackage(packageValue)),
    ).toBe(true);
    expect(mount.snapshot()).toEqual(packageValue);
  });

  it('F1 refuses malformed or schema-invalid packages', () => {
    const mount = createCabinContextMount();

    expect(mount.mountSerialized('{not json')).toBe(false);
    expect(mount.snapshot()).toBeNull();

    const parsed = JSON.parse(
      serializeCabinContextPackage(buildCabinContextPackage()!),
    );
    parsed.schema = 'soullab.cabin.context-package.v999';

    expect(mount.mountSerialized(JSON.stringify(parsed))).toBe(false);
    expect(mount.snapshot()).toBeNull();
  });

  it('F2 is source-read-only and does not touch CabinLocalStore', () => {
    const source = validPackage();
    const mount = createCabinContextMount();

    expect(
      mount.mountSerialized(serializeCabinContextPackage(source)),
    ).toBe(true);

    expect(mount.snapshot()).toEqual(source);
    expect(mount.snapshot()).not.toHaveProperty('localStore');
    expect(mount.snapshot()).not.toHaveProperty('database');
  });

  it('F3 contains no browser persistence seam', () => {
    const source = String(
      require('node:fs').readFileSync(
        require('node:path').join(
          process.cwd(),
          'lib/cabin/contextMount.ts',
        ),
        'utf8',
      ),
    );

    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
  });

  it('F4 contains no network seam', () => {
    const source = String(
      require('node:fs').readFileSync(
        require('node:path').join(
          process.cwd(),
          'lib/cabin/contextMount.ts',
        ),
        'utf8',
      ),
    );

    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('http://');
    expect(source).not.toContain('https://');
    expect(source).not.toContain('URL(');
  });

  it('F5 does not create current Work, memory, relationship, question, transition, or graph state', () => {
    const mount = createCabinContextMount();
    expect(
      mount.mountSerialized(
        serializeCabinContextPackage(validPackage()),
      ),
    ).toBe(true);

    const snapshot = mount.snapshot()!;
    expect(snapshot).not.toHaveProperty('currentWork');
    expect(snapshot).not.toHaveProperty('currentMemory');
    expect(snapshot).not.toHaveProperty('currentRelationship');
    expect(snapshot).not.toHaveProperty('questions');
    expect(snapshot).not.toHaveProperty('transitions');
    expect(snapshot).not.toHaveProperty('edges');
  });

  it('F6 returns defensive copies so caller mutation cannot alter mounted state', () => {
    const mount = createCabinContextMount();
    expect(
      mount.mountSerialized(
        serializeCabinContextPackage(validPackage()),
      ),
    ).toBe(true);

    const first = mount.snapshot()!;
    first.works[0].work.title = 'Mutated caller copy';

    const second = mount.snapshot()!;
    expect(second.works[0].work.title).toBe('Elemental Alchemy');
  });

  it('F7 has no lifecycle persistence across mount instances', () => {
    const first = createCabinContextMount();
    expect(
      first.mountSerialized(
        serializeCabinContextPackage(validPackage()),
      ),
    ).toBe(true);

    const second = createCabinContextMount();

    expect(first.snapshot()).not.toBeNull();
    expect(second.snapshot()).toBeNull();
  });

  it('clear releases the mounted package', () => {
    const mount = createCabinContextMount();
    expect(
      mount.mountSerialized(
        serializeCabinContextPackage(validPackage()),
      ),
    ).toBe(true);

    mount.clear();

    expect(mount.snapshot()).toBeNull();
  });

  it('an empty package is a valid mounted state', () => {
    const mount = createCabinContextMount();
    const empty = buildCabinContextPackage()!;

    expect(
      mount.mountSerialized(
        serializeCabinContextPackage(empty),
      ),
    ).toBe(true);
    expect(mount.snapshot()).toEqual(empty);
  });
});
