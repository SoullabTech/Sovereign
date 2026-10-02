import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const { CabinLocalStore } = await import('../../lib/cabin/localStore.ts');
const { TurnPosture } = await import('../../lib/sanctuary/turnPosture.ts');
const { readCabinMemorySource } = await import('../../lib/cabin/memorySource.ts');

function databasePath() {
  return path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'maia-cabin-source-')),
    'cabin.sqlite',
  );
}

test('Cabin memory source preserves canonical loader shapes', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();
  const posture = TurnPosture.resolve({});

  store.addExchangeTurn(posture, {
    memberId: member.id,
    sessionId: 'older',
    role: 'user',
    content: 'A prior member turn.',
    exchangeId: '11111111-1111-4111-8111-111111111111',
  });

  store.writeDevelopmentalMemory(member.id, {
    memoryType: 'pattern',
    contentText: 'orientation; moving toward integration; tone steady',
    significance: 0.7,
  });

  const source = readCabinMemorySource(store, member.id, 'current');

  assert.equal(source.recentTurns.length, 1);
  assert.equal(source.recentTurns[0].content, 'A prior member turn.');
  assert.equal(source.conversational.length, 1);
  assert.equal(source.conversational[0].session_id, 'older');
  assert.equal(source.conversational[0].role, 'user');
  assert.equal(source.developmental.length, 1);
  assert.equal(
    source.developmental[0].directional_cue,
    'orientation; moving toward integration; tone steady',
  );
  assert.deepEqual(source.health, {
    recentTurns: 'ok',
    conversational: 'ok',
    developmental: 'ok',
  });
  assert.deepEqual(source.localizedLayers, [
    'recentTurns',
    'conversational',
    'developmental',
  ]);

  store.close();
});

test('Cabin memory source never claims unlocalized layers', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();

  const source = readCabinMemorySource(store, member.id, null);

  assert.deepEqual(source.health, {
    recentTurns: 'empty',
    conversational: 'empty',
    developmental: 'empty',
  });
  assert.equal('semantic' in source.health, false);
  assert.equal('episodic' in source.health, false);
  assert.equal('relational' in source.health, false);

  store.close();
});
