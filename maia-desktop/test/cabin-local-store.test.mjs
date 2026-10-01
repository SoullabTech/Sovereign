import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const { CabinLocalStore } = await import('../../lib/cabin/localStore.ts');
const { TurnPosture } = await import('../../lib/sanctuary/turnPosture.ts');

function databasePath() {
  return path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'maia-cabin-data-')),
    'cabin.sqlite',
  );
}

test('local store creates one authoritative local member and a server-owned session', () => {
  const store = new CabinLocalStore(databasePath());

  const member = store.ensureLocalMember();
  const token = store.issueSession(member.id);

  assert.equal(store.resolveSession(token)?.id, member.id);
  assert.equal(store.resolveSession('browser-supplied-fake-token'), null);
  assert.equal(member.tier, 'free');
  assert.deepEqual(member.roles, ['member']);

  store.close();
});

test('Work ownership is structural, not a browser convention', () => {
  const store = new CabinLocalStore(databasePath());
  const alice = store.ensureLocalMember();
  const aliceWork = store.createWork(alice.id, { title: 'Alice Work' });

  assert.equal(store.getWork(alice.id, aliceWork.id)?.title, 'Alice Work');
  assert.equal(store.getWork('some-other-member-id', aliceWork.id), null);

  store.close();
});

test('a manuscript can be declared into multiple Works without silent selection', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();

  const first = store.createWork(member.id, { title: 'First Work' });
  const second = store.createWork(member.id, { title: 'Second Work' });
  const manuscript = store.createManuscript(member.id, {
    title: 'Chapter 10',
    provenance: 'member_written',
  });

  store.declareExpression(member.id, {
    workId: first.id,
    expressionType: 'manuscript',
    expressionId: manuscript.id,
  });

  store.declareExpression(member.id, {
    workId: second.id,
    expressionType: 'manuscript',
    expressionId: manuscript.id,
  });

  const works = store.worksForManuscript(member.id, manuscript.id);

  assert.deepEqual(
    works.map((work) => work.id).sort(),
    [first.id, second.id].sort(),
  );
  assert.equal(works.length, 2);

  store.close();
});

test('a member cannot declare another member-owned manuscript into their Work', () => {
  const store = new CabinLocalStore(databasePath());
  const owner = store.ensureLocalMember();

  const otherMemberId = '22222222-2222-4222-8222-222222222222';
  const timestamp = new Date().toISOString();
  store.db
    .prepare('INSERT INTO members (id, username, onboarded, onboarding_step, tier, roles_json, created_at, updated_at) VALUES (?, ?, 0, ?, ?, ?, ?, ?)')
    .run(
      otherMemberId,
      'other-member',
      'begin',
      'free',
      JSON.stringify(['member']),
      timestamp,
      timestamp,
    );

  const ownerWork = store.createWork(owner.id, { title: 'Owner Work' });
  const otherManuscript = store.createManuscript(otherMemberId, {
    title: 'Other Manuscript',
  });

  assert.equal(store.getWork(otherMemberId, ownerWork.id), null);
  assert.equal(store.getManuscript(owner.id, otherManuscript.id), null);

  assert.throws(
    () =>
      store.declareExpression(owner.id, {
        workId: ownerWork.id,
        expressionType: 'manuscript',
        expressionId: otherManuscript.id,
      }),
    /CABIN_EXPRESSION_NOT_OWNED/,
  );

  store.close();
});

test('Works and declarations survive a process restart', () => {
  const db = databasePath();

  const firstStore = new CabinLocalStore(db);
  const member = firstStore.ensureLocalMember();
  const work = firstStore.createWork(member.id, {
    title: 'Durable Work',
    form: 'Book',
    stage: 'writing',
    manuscriptState: 'existing-manuscript',
  });
  const manuscript = firstStore.createManuscript(member.id, {
    title: 'Durable Manuscript',
  });

  firstStore.declareExpression(member.id, {
    workId: work.id,
    expressionType: 'manuscript',
    expressionId: manuscript.id,
  });

  firstStore.appendMemory(member.id, {
    kind: 'conversation',
    content: 'A durable local memory',
    metadata: { source: 'test' },
  });

  firstStore.close();

  const secondStore = new CabinLocalStore(db);
  const restoredMember = secondStore.ensureLocalMember();
  const restoredWork = secondStore.getWork(restoredMember.id, work.id);
  const restoredManuscript = secondStore.getManuscript(
    restoredMember.id,
    manuscript.id,
  );

  assert.equal(restoredMember.id, member.id);
  assert.equal(restoredWork?.title, 'Durable Work');
  assert.equal(restoredWork?.expressions.length, 1);
  assert.equal(restoredManuscript?.title, 'Durable Manuscript');
  assert.equal(secondStore.listMemory(member.id).length, 1);

  secondStore.close();
});

test('House preferences preserve optimistic revision semantics locally', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();

  const first = store.saveHousePreferences(
    member.id,
    {
      center: ['writing'],
      shortcuts: ['journal'],
      passingThrough: 'shared',
    },
    null,
  );

  assert.equal(first.revision, 1);

  const second = store.saveHousePreferences(
    member.id,
    {
      center: ['writing', 'relationships'],
      shortcuts: ['journal', 'ideas'],
      passingThrough: 'quiet',
    },
    1,
  );

  assert.equal(second.revision, 2);

  assert.throws(
    () =>
      store.saveHousePreferences(
        member.id,
        {
          center: ['writing'],
          shortcuts: [],
          passingThrough: 'shared',
        },
        1,
      ),
    /CABIN_PREFERENCES_REVISION_CONFLICT/,
  );

  store.close();
});

test('accepted member turns survive restart and duplicate exchange writes do not multiply', () => {
  const db = databasePath();
  const first = new CabinLocalStore(db);
  const member = first.ensureLocalMember();
  const posture = TurnPosture.resolve({});
  const exchangeId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  const firstWrite = first.addExchangeTurn(posture, {
    memberId: member.id,
    sessionId: 'session-one',
    role: 'user',
    content: 'I am here.',
    exchangeId,
  });

  const retry = first.addExchangeTurn(posture, {
    memberId: member.id,
    sessionId: 'session-one',
    role: 'user',
    content: 'I am here.',
    exchangeId,
  });

  assert.equal(firstWrite?.id, retry?.id);
  assert.equal(first.countTurns(member.id), 1);
  first.close();

  const second = new CabinLocalStore(db);
  assert.equal(second.getSessionTurns(member.id, 'session-one').length, 1);
  assert.equal(second.getRecentTurns(member.id)[0]?.content, 'I am here.');
  second.close();
});

test('Sanctuary and unresolved posture cannot create local durable turns', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();

  const refusedMissing = store.addExchangeTurn(null, {
    memberId: member.id,
    sessionId: 'sanctuary-session',
    role: 'user',
    content: 'Protected material.',
    exchangeId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  });

  const refusedSanctuary = store.addExchangeTurn(
    TurnPosture.resolve({ sanctuary: true }),
    {
      memberId: member.id,
      sessionId: 'sanctuary-session',
      role: 'user',
      content: 'Protected material.',
      exchangeId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    },
  );

  assert.equal(refusedMissing, null);
  assert.equal(refusedSanctuary, null);
  assert.equal(store.countTurns(member.id), 0);
  store.close();
});

test('current-session and cross-session retrieval remain structurally distinct', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();
  const posture = TurnPosture.resolve({});

  store.addExchangeTurn(posture, {
    memberId: member.id,
    sessionId: 'older-session',
    role: 'user',
    content: 'Older turn.',
    exchangeId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  });

  store.addExchangeTurn(posture, {
    memberId: member.id,
    sessionId: 'current-session',
    role: 'user',
    content: 'Current turn.',
    exchangeId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  });

  assert.deepEqual(
    store.getSessionTurns(member.id, 'current-session').map((turn) => turn.content),
    ['Current turn.'],
  );
  assert.deepEqual(
    store
      .getPriorCrossSessionTurns(member.id, 'current-session')
      .map((turn) => turn.content),
    ['Older turn.'],
  );

  store.close();
});

test('developmental memory stores only the canonical bounded trajectory signal', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();

  const memory = store.writeDevelopmentalMemory(member.id, {
    memoryType: 'pattern',
    contentText: 'clarity; moving toward action; tone grounded',
    triggerEvent: {
      raw: {
        userMessage: 'a bounded original exchange',
        assistantResponse: 'a bounded response',
      },
    },
    significance: 0.8,
    sourceAinSessionId: 'session-memory',
  });

  assert.equal(memory.contentText, 'clarity; moving toward action; tone grounded');
  assert.deepEqual(memory.triggerEvent?.raw, {
    userMessage: 'a bounded original exchange',
    assistantResponse: 'a bounded response',
  });
  assert.equal(store.listDevelopmentalMemories(member.id).length, 1);

  assert.throws(
    () =>
      store.writeDevelopmentalMemory(member.id, {
        memoryType: 'pattern',
        contentText: 'raw transcript with no bounded trajectory shape',
      }),
    /CABIN_DEVELOPMENTAL_SIGNAL_INVALID/,
  );

  store.close();
});

test('turns and developmental memory share one local SQLite authority', () => {
  const store = new CabinLocalStore(databasePath());
  const member = store.ensureLocalMember();
  const tableNames = (
    store.db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('conversation_turns','developmental_memories') ORDER BY name",
      )
      .all() ?? []
  ).map((row) => row.name);

  assert.deepEqual(tableNames, ['conversation_turns', 'developmental_memories']);
  assert.equal(store.path.endsWith('cabin.sqlite'), true);
  store.close();
});

test('a version-one Cabin database migrates forward without replacing member state', () => {
  const db = databasePath();
  const store = new CabinLocalStore(db);
  const member = store.ensureLocalMember();
  const work = store.createWork(member.id, { title: 'Pre-memory Work' });

  store.db
    .prepare('UPDATE cabin_meta SET value = ? WHERE key = ?')
    .run('1', 'schema_version');
  store.close();

  const migrated = new CabinLocalStore(db);
  assert.equal(migrated.ensureLocalMember().id, member.id);
  assert.equal(migrated.getWork(member.id, work.id)?.title, 'Pre-memory Work');

  const version = migrated.db
    .prepare('SELECT value FROM cabin_meta WHERE key = ?')
    .get('schema_version');

  assert.equal(version.value, '2');
  migrated.close();
});

test('the Cabin store contains no PostgreSQL or browser-storage authority', () => {
  const repoRoot = path.basename(process.cwd()) === 'maia-desktop'
    ? path.join(process.cwd(), '..')
    : process.cwd();
  const source = fs.readFileSync(
    path.join(repoRoot, 'lib', 'cabin', 'localStore.ts'),
    'utf8',
  );

  assert.doesNotMatch(source, /DATABASE_URL|postgres|supabase/i);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
  assert.match(source, /node:sqlite/);
});
