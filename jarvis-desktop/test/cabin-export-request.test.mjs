import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  REQUEST_VERSION,
  canonicalSelection,
  confirmCabinExportRequest,
  hostActorId,
  prepareCabinExportRequest,
} from '../src/cabin-export-request.js';

const WORK = '00000000-0000-4000-8000-000000000001';
const WORK_2 = '00000000-0000-4000-8000-000000000002';
const RELATIONSHIP = '00000000-0000-4000-8000-000000000003';
const MEMORY = '00000000-0000-4000-8000-000000000004';

const ACTOR = hostActorId('kelly');
const TARGET = '/Users/soullab/Library/Application Support/MAIA/context-package.json';

function selection(overrides = {}) {
  return {
    workIds: [],
    relationshipIds: [],
    memoryIds: [],
    ...overrides,
  };
}

test('H3.7 derives a host-bound operator actor id', () => {
  assert.equal(ACTOR, 'human:jarvis-desktop:kelly');
  assert.throws(() => hostActorId(''), /ACTOR_REQUIRED/);
});

test('H3.7 canonicalizes explicit selections without inventing content', () => {
  const result = canonicalSelection({
    workIds: [WORK_2, WORK, WORK],
    relationshipIds: [RELATIONSHIP],
    memoryIds: [MEMORY],
  });

  assert.deepEqual(result, {
    workIds: [WORK, WORK_2],
    relationshipIds: [RELATIONSHIP],
    memoryIds: [MEMORY],
  });
});

test('H3.7 requires an absolute target and exact selection fields', () => {
  assert.throws(
    () =>
      prepareCabinExportRequest({
        actorId: ACTOR,
        packagePath: 'context-package.json',
        selection: selection(),
      }),
    /PATH_MUST_BE_ABSOLUTE/,
  );

  assert.throws(
    () =>
      prepareCabinExportRequest({
        actorId: ACTOR,
        packagePath: TARGET,
        selection: { ...selection(), currentWork: WORK },
      }),
    /selection_field:currentWork/,
  );
});

test('H3.7 produces an immutable content-free request envelope', () => {
  const request = prepareCabinExportRequest({
    actorId: ACTOR,
    packagePath: TARGET,
    selection: selection({
      workIds: [WORK],
      relationshipIds: [RELATIONSHIP],
      memoryIds: [MEMORY],
    }),
  });

  assert.equal(request.request_version, REQUEST_VERSION);
  assert.equal(request.standing, 'PREPARED_NOT_EXECUTED');
  assert.match(request.request_digest, /^[0-9a-f]{64}$/);
  assert.equal(request.actor_id, ACTOR);
  assert.equal(request.package_path, TARGET);
  assert.deepEqual(request.selection, {
    workIds: [WORK],
    relationshipIds: [RELATIONSHIP],
    memoryIds: [MEMORY],
  });

  const serialized = JSON.stringify(request);
  assert.doesNotMatch(serialized, /Elemental Alchemy|manuscript|memberId|sessionId|body|title/);

  assert.throws(() => {
    request.package_path = '/tmp/other.json';
  }, TypeError);
  assert.equal(request.package_path, TARGET);
});

test('H3.7 digest is stable for the same explicit act', () => {
  const a = prepareCabinExportRequest({
    actorId: ACTOR,
    packagePath: TARGET,
    selection: selection({ workIds: [WORK, WORK_2] }),
  });
  const b = prepareCabinExportRequest({
    actorId: ACTOR,
    packagePath: TARGET,
    selection: selection({ workIds: [WORK_2, WORK] }),
  });

  assert.equal(a.request_digest, b.request_digest);
});

test('H3.7 confirmation admits only the exact prepared request', () => {
  const request = prepareCabinExportRequest({
    actorId: ACTOR,
    packagePath: TARGET,
    selection: selection({ workIds: [WORK] }),
  });

  const ready = confirmCabinExportRequest(request, request.request_digest);

  assert.equal(ready.ok, true);
  assert.equal(ready.status, 'READY_FOR_SEPARATE_EXECUTION');
  assert.equal(ready.request_digest, request.request_digest);
  assert.deepEqual(ready.selection, request.selection);
});

test('H3.7 changed selection cannot reuse the old confirmation digest', () => {
  const request = prepareCabinExportRequest({
    actorId: ACTOR,
    packagePath: TARGET,
    selection: selection({ workIds: [WORK] }),
  });

  const changed = {
    ...request,
    selection: {
      workIds: [WORK_2],
      relationshipIds: [],
      memoryIds: [],
    },
  };

  const result = confirmCabinExportRequest(changed, request.request_digest);

  assert.deepEqual(result, {
    ok: false,
    status: 'REFUSED',
    reason: 'CABIN_EXPORT_REQUEST_DRIFTED',
  });
});

test('H3.7 wrong confirmation digest is refused', () => {
  const request = prepareCabinExportRequest({
    actorId: ACTOR,
    packagePath: TARGET,
    selection: selection(),
  });

  assert.deepEqual(
    confirmCabinExportRequest(request, '0'.repeat(64)),
    {
      ok: false,
      status: 'REFUSED',
      reason: 'CABIN_EXPORT_REQUEST_DIGEST_MISMATCH',
    },
  );
});

test('H3.7 prepared request performs no filesystem, network, watcher, or writer action', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src', 'cabin-export-request.js'),
    'utf8',
  );

  assert.doesNotMatch(source, /writeFile|rename|appendFile|unlink|rmSync/);
  assert.doesNotMatch(source, /fetch\(|https?:\/\//);
  assert.doesNotMatch(source, /watch\(|setInterval|setTimeout/);
  assert.doesNotMatch(source, /contextPackageWriter|connectedContextExport|connectedExportAssembly/);
  assert.doesNotMatch(source, /ipcMain|ipcRenderer|contextBridge/);
});

test('H3.7 request carries no new authority grant', () => {
  const request = prepareCabinExportRequest({
    actorId: ACTOR,
    packagePath: TARGET,
    selection: selection({ memoryIds: [MEMORY] }),
  });

  const serialized = JSON.stringify(request);

  for (const forbidden of [
    'authorized_acts',
    'authority_grant',
    'repo.write',
    'production.write',
    'sync',
    'remount',
    'cognition',
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
