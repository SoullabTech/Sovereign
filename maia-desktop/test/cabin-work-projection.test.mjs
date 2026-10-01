import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const { CabinLocalStore } = await import('../../lib/cabin/localStore.ts');
const { projectWorkForCabin, serializeCabinWorkProjection } = await import(
  '../../lib/cabin/workProjection.ts'
);

function databasePath() {
  return path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'maia-cabin-work-projection-')),
    'cabin.sqlite',
  );
}

test('H2.1 projects a real local Work with two manuscript declarations without choosing one', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();

  const work = store.createWork(member.id, {
    title: 'Elemental Alchemy',
    form: 'book',
    stage: 'writing',
    manuscriptState: 'existing-manuscript',
  });

  const first = store.createManuscript(member.id, {
    title: 'Chapter 10',
    provenance: 'member_written',
  });
  const second = store.createManuscript(member.id, {
    title: 'Revision',
    provenance: 'member_uploaded',
  });

  store.declareExpression(member.id, {
    workId: work.id,
    expressionType: 'manuscript',
    expressionId: first.id,
  });
  store.declareExpression(member.id, {
    workId: work.id,
    expressionType: 'manuscript',
    expressionId: second.id,
  });

  const source = store.getWork(member.id, work.id);
  assert.ok(source);

  const projection = projectWorkForCabin(source, member.id);
  assert.ok(projection);

  assert.deepEqual(
    projection.work.expressions.map((expression) => expression.expressionId).sort(),
    [first.id, second.id].sort(),
  );
  assert.equal(projection.work.expressions.length, 2);

  const portable = JSON.parse(serializeCabinWorkProjection(projection));
  assert.equal(portable.work.id, work.id);
  assert.equal('memberId' in portable, false);
  assert.equal('currentManuscript' in portable.work, false);

  store.close();
});
