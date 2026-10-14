import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CabinLocalStore } from '../../lib/cabin/localStore.ts';
import { TurnPosture } from '../../lib/sanctuary/turnPosture.ts';

function fixture(run) {
  const directory = mkdtempSync(join(tmpdir(), 'cabin-atomic-'));
  const store = new CabinLocalStore(join(directory, 'cabin.sqlite'));
  const member = store.ensureLocalMember();
  const input = { memberId: member.id, sessionId: 'session-a', exchangeId: 'exchange-a',
    userContent: 'A fictional question.', assistantContent: 'A fictional answer.' };
  try { run(store, input); } finally {
    store.close(); rmSync(directory, { recursive: true, force: true });
  }
}
const normal = () => TurnPosture.resolve({ sanctuary: false });

test('a completed exchange commits both turns and exact retries reuse their identities', () => fixture((store, input) => {
  const first = store.addExchange(normal(), input);
  assert.equal(first.replayed, false);
  const retry = store.addExchange(normal(), input);
  assert.equal(retry.replayed, true);
  assert.equal(retry.user.id, first.user.id);
  assert.equal(retry.assistant.id, first.assistant.id);
  assert.equal(store.countTurns(input.memberId), 2);
}));

test('assistant insert failure rolls back the user half', () => fixture((store, input) => {
  store.db.exec("CREATE TRIGGER reject_assistant BEFORE INSERT ON conversation_turns WHEN NEW.role = 'assistant' BEGIN SELECT RAISE(ABORT, 'fictional failure'); END");
  assert.throws(() => store.addExchange(normal(), input), /fictional failure/);
  assert.equal(store.countTurns(input.memberId), 0);
  store.db.exec('DROP TRIGGER reject_assistant');
  assert.ok(store.addExchange(normal(), input));
}));

test('changed content or conversation cannot reuse an exchange identifier', () => fixture((store, input) => {
  store.addExchange(normal(), input);
  for (const patch of [{ userContent: 'Changed' }, { assistantContent: 'Changed' }, { sessionId: 'session-b' }]) {
    assert.throws(() => store.addExchange(normal(), { ...input, ...patch }), /CABIN_EXCHANGE_CONFLICT/);
  }
  assert.equal(store.countTurns(input.memberId), 2);
}));

test('an existing incomplete legacy exchange is withheld rather than completed silently', () => fixture((store, input) => {
  store.addExchangeTurn(normal(), { ...input, role: 'user', content: input.userContent });
  assert.throws(() => store.addExchange(normal(), input), /CABIN_EXCHANGE_CONFLICT/);
  assert.equal(store.countTurns(input.memberId), 1);
}));

test('Sanctuary, unresolved, and forged postures cannot persist either half', () => fixture((store, input) => {
  for (const posture of [TurnPosture.resolve({ sanctuary: true }), undefined, { sanctuary: false }]) {
    assert.equal(store.addExchange(posture, input), null);
  }
  assert.equal(store.countTurns(input.memberId), 0);
}));

test('empty responses, empty session identifiers, and unknown owners are refused', () => fixture((store, input) => {
  for (const patch of [{ assistantContent: ' ' }, { userContent: ' ' }, { sessionId: '' }, { exchangeId: '' }]) {
    assert.throws(() => store.addExchange(normal(), { ...input, ...patch }), /CABIN_EXCHANGE_INVALID/);
  }
  assert.throws(() => store.addExchange(normal(), { ...input, memberId: 'unknown' }), /CABIN_MEMBER_NOT_FOUND/);
  assert.equal(store.countTurns(input.memberId), 0);
}));

test('a replay with a different owner fails without exposing or modifying saved content', () => fixture((store, input) => {
  store.addExchange(normal(), input);
  const otherId = 'other-local-member';
  store.db.prepare("INSERT INTO members (id, username, roles_json, created_at, updated_at) VALUES (?, ?, '[]', ?, ?)")
    .run(otherId, otherId, new Date().toISOString(), new Date().toISOString());
  assert.throws(() => store.addExchange(normal(), { ...input, memberId: otherId }), /CABIN_EXCHANGE_CONFLICT/);
  assert.equal(store.countTurns(otherId), 0);
  assert.equal(store.countTurns(input.memberId), 2);
}));
