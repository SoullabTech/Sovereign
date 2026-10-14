// Component pilot only: no application endpoint, cloud fallback, or real member data.
// Run with tsx. The only network destination is a literal IPv4 loopback address.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CabinLocalStore } from '../lib/cabin/localStore.ts';
import { TurnPosture } from '../lib/sanctuary/turnPosture.ts';

if (process.argv[2] === '--verify') {
  const [, , , database, memberId, sessionId, manuscriptId] = process.argv;
  const store = new CabinLocalStore(database);
  try {
    const turns = store.getSessionTurns(memberId, sessionId);
    assert.equal(turns.length, 2);
    assert.equal(turns[0].role, 'user');
    assert.equal(turns[1].role, 'assistant');
    assert.ok(turns[1].content.trim());
    assert.equal(store.listManuscriptSections(memberId, manuscriptId)[0].body,
      'The quiet room held the morning light.');
    assert.deepEqual(store.listManuscriptSections('another-member', manuscriptId), []);
    console.log(JSON.stringify({ freshProcessRecovery: 'PASS', turns: 2,
      manuscriptSource: 'PASS', otherMemberAccess: 'DENIED' }));
  } finally { store.close(); }
} else {
  const root = mkdtempSync(join(tmpdir(), 'cabin-scenario-fictional-'));
  const database = join(root, 'cabin.sqlite');
  let store;
  try {
    const start = Date.now();
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(60000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b', stream: false, keep_alive: 0,
        options: { num_ctx: 2048, num_predict: 100, temperature: 0 },
        messages: [
          { role: 'system', content: 'This is a fictional offline component test, not a full MAIA session. Preserve the writer\'s meaning. Offer one small optional refinement with a brief reason. Do not claim memory or personal knowledge.' },
          { role: 'user', content: 'Consider this fictional sentence: The quiet room held the morning light.' },
        ],
      }),
    });
    assert.equal(response.ok, true, 'Local inference must succeed; no fallback');
    const answer = await response.json();
    assert.equal(answer.done, true);
    assert.ok(typeof answer.message?.content === 'string' && answer.message.content.trim());
    store = new CabinLocalStore(database);
    const member = store.ensureLocalMember();
    const token = store.issueSession(member.id);
    assert.equal(store.resolveSession(token)?.id, member.id);
    const sessionId = randomUUID();
    const exchangeId = randomUUID();
    const posture = TurnPosture.resolve({ sanctuary: false });
    const exchange = store.addExchange(posture, {
      memberId: member.id, sessionId, exchangeId,
      userContent: 'Consider this fictional sentence: The quiet room held the morning light.',
      assistantContent: answer.message.content,
    });
    assert.ok(exchange && !exchange.replayed);
    const manuscript = store.createManuscript(member.id, { title: 'Fictional Cabin pilot' });
    store.addManuscriptSections(member.id, manuscript.id, [{
      position: 0, heading: 'Pilot', body: 'The quiet room held the morning light.',
    }]);
    store.close(); store = null;
    const child = spawnSync(process.execPath, [
      ...process.execArgv, fileURLToPath(import.meta.url), '--verify',
      database, member.id, sessionId, manuscript.id,
    ], { encoding: 'utf8', timeout: 15000 });
    assert.equal(child.status, 0, child.stderr);
    process.stdout.write(child.stdout);
    console.log(JSON.stringify({
      localInference: 'PASS', model: 'qwen2.5:7b', durationMs: Date.now() - start,
      externalNetworkIsolation: 'NOT_TESTED', applicationIntegration: 'NOT_TESTED',
      applyUndo: 'NOT_IMPLEMENTED_BY_THIS_PILOT', maiaRelationalQuality: 'NOT_EVALUATED',
    }));
  } finally {
    store?.close();
    rmSync(root, { recursive: true, force: true });
  }
}
