// Two disposable Cabins, one selected section, mutual TLS, separate received inbox.
// Fictional integration pilot; not member enrollment, federation, radio, or production.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createServer, request } from 'node:https';
import { randomUUID, X509Certificate } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { CabinLocalStore } from '../lib/cabin/localStore.ts';

const directory = mkdtempSync(join(tmpdir(), 'cabin-two-peer-fictional-'));
const file = name => join(directory, name);
const bytes = name => readFileSync(file(name));
const openssl = args => execFileSync('openssl', args, { cwd: directory, stdio: 'ignore' });
const stores = [];
let server, inbox;
try {
  // A disposable shared test CA represents pre-verified enrollment, not real onboarding.
  openssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
    '-subj', '/CN=Fictional Cabin Pilot CA', '-keyout', 'ca.key', '-out', 'ca.crt']);
  let serial = 2;
  for (const name of ['alice', 'bob', 'unknown']) {
    openssl(['req', '-new', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=' + name,
      '-keyout', name + '.key', '-out', name + '.csr']);
    writeFileSync(file(name + '.ext'), name === 'bob'
      ? 'basicConstraints=CA:FALSE\nsubjectAltName=IP:127.0.0.1\nextendedKeyUsage=serverAuth\n'
      : 'basicConstraints=CA:FALSE\nextendedKeyUsage=clientAuth\n');
    openssl(['x509', '-req', '-in', name + '.csr', '-CA', 'ca.crt', '-CAkey', 'ca.key',
      '-set_serial', String(serial++), '-days', '1', '-extfile', name + '.ext', '-out', name + '.crt']);
  }
  const alicePin = new X509Certificate(bytes('alice.crt')).fingerprint256;
  const bobPin = new X509Certificate(bytes('bob.crt')).fingerprint256;
  const alice = new CabinLocalStore(file('alice.sqlite')); stores.push(alice);
  const bob = new CabinLocalStore(file('bob.sqlite')); stores.push(bob);
  const aliceMember = alice.ensureLocalMember();
  const bobMember = bob.ensureLocalMember();
  const token = alice.issueSession(aliceMember.id);
  const source = alice.createManuscript(aliceMember.id, { title: 'Fictional source' });
  alice.addManuscriptSections(aliceMember.id, source.id, [
    { position: 0, body: 'SELECTED: We will meet beside the garden.' },
    { position: 1, body: 'PRIVATE-ALICE: This section stays in my Cabin.' },
  ]);
  bob.appendMemory(bobMember.id, { kind: 'note', content: 'PRIVATE-BOB: Local only.' });
  const selected = alice.listManuscriptSections(aliceMember.id, source.id)[0];

  function prepareShare(sessionToken, selection, manualConsent) {
    const owner = alice.resolveSession(sessionToken);
    if (!owner || manualConsent !== true) throw new Error('CONSENT_OR_SESSION_REQUIRED');
    if (!alice.getManuscript(owner.id, selection.manuscriptId)) throw new Error('SOURCE_NOT_OWNED');
    const section = alice.listManuscriptSections(owner.id, selection.manuscriptId)
      .find(item => item.id === selection.sectionId);
    if (!section) throw new Error('SECTION_NOT_SELECTED');
    return {
      schema: 'soullab.cabin.peer-pilot.v1', id: randomUUID(),
      recipient: bobPin, body: section.body,
      permission: { receive: true, maiaRecall: false, execute: false, reshare: false },
    };
  }
  const selection = { manuscriptId: source.id, sectionId: selected.id };
  assert.throws(() => prepareShare(token, selection, false), /CONSENT/);
  assert.throws(() => prepareShare('forged', selection, true), /SESSION/);
  assert.throws(() => prepareShare(token, { ...selection, manuscriptId: 'not-owned' }, true), /NOT_OWNED/);
  const outgoing = prepareShare(token, selection, true);
  const payload = JSON.stringify(outgoing);
  assert.ok(!payload.includes('PRIVATE-ALICE'));
  assert.ok(!payload.includes('PRIVATE-BOB'));

  // The received copy has its own durable authority, never a MAIA memory writer.
  const inboxPath = file('bob-inbox.sqlite');
  function openInbox() {
    inbox = new DatabaseSync(inboxPath);
    inbox.exec('CREATE TABLE IF NOT EXISTS inbox (id TEXT PRIMARY KEY, sender_pin TEXT NOT NULL, body TEXT NOT NULL, permission_json TEXT NOT NULL)');
  }
  openInbox();
  server = createServer({
    key: bytes('bob.key'), cert: bytes('bob.crt'), ca: bytes('ca.crt'),
    requestCert: true, rejectUnauthorized: true, minVersion: 'TLSv1.3',
  }, (req, res) => {
    const pin = req.socket.getPeerCertificate().fingerprint256;
    if (!req.socket.authorized || pin !== alicePin) { res.writeHead(403).end(); return; }
    if (req.method !== 'POST' || req.url !== '/inbox') { res.writeHead(404).end(); return; }
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 16384) req.destroy(); });
    req.on('end', () => {
      try {
        const item = JSON.parse(body);
        assert.deepEqual(Object.keys(item).sort(), ['schema', 'id', 'recipient', 'body', 'permission'].sort());
        assert.equal(item.schema, 'soullab.cabin.peer-pilot.v1');
        assert.match(item.id, /^[0-9a-f-]{36}$/);
        assert.equal(item.recipient, bobPin);
        assert.equal(typeof item.body, 'string');
        assert.deepEqual(item.permission, { receive: true, maiaRecall: false, execute: false, reshare: false });
        if (inbox.prepare('SELECT id FROM inbox WHERE id=?').get(item.id)) { res.writeHead(409).end(); return; }
        inbox.prepare('INSERT INTO inbox VALUES (?, ?, ?, ?)').run(item.id, pin, item.body, JSON.stringify(item.permission));
        res.writeHead(201).end();
      } catch { res.writeHead(400).end(); }
    });
  });
  server.on('tlsClientError', () => {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  async function send(value, identity = 'alice', trust = bytes('ca.crt')) {
    return new Promise((resolve, reject) => {
      const req = request({
        hostname: '127.0.0.1', port, path: '/inbox', method: 'POST',
        ca: trust, key: bytes(identity + '.key'), cert: bytes(identity + '.crt'),
        rejectUnauthorized: true, minVersion: 'TLSv1.3', agent: false,
        headers: { 'Content-Type': 'application/json' },
      }, res => {
        const serverIdentity = res.socket.getPeerCertificate().fingerprint256;
        assert.equal(serverIdentity, bobPin);
        res.resume(); res.on('end', () => resolve(res.statusCode));
      });
      req.setTimeout(3000, () => req.destroy(new Error('PILOT_TIMEOUT')));
      req.on('error', reject); req.end(JSON.stringify(value));
    });
  }
  assert.equal(await send(outgoing), 201);
  assert.equal(await send({ ...outgoing, id: randomUUID() }, 'unknown'), 403);
  await assert.rejects(send(outgoing, 'alice', bytes('alice.crt')));
  assert.equal(await send({ ...outgoing, id: randomUUID(), permission: { ...outgoing.permission, execute: true } }), 400);
  inbox.close(); openInbox();
  assert.equal(await send(outgoing), 409);
  assert.equal(inbox.prepare('SELECT COUNT(*) AS n FROM inbox').get().n, 1);
  assert.equal(inbox.prepare('SELECT body FROM inbox').get().body, selected.body);
  assert.equal(bob.countTurns(bobMember.id), 0);
  assert.equal(bob.db.prepare('SELECT COUNT(*) AS n FROM cabin_memory_items').get().n, 1);
  assert.equal(bob.db.prepare('SELECT COUNT(*) AS n FROM developmental_memories').get().n, 0);
  assert.equal(bob.listManuscriptSections(bobMember.id, source.id).length, 0);
  assert.equal(alice.listManuscriptSections(aliceMember.id, source.id).length, 2);
  console.log(JSON.stringify({
    twoDisposableCabins: 'PASS', selectedSectionOnly: 'PASS',
    manualConsentRequired: 'PASS', mutualTLS13: 'PASS',
    unapprovedIdentityDenied: 'PASS', untrustedServerDenied: 'PASS',
    permissionEscalationDenied: 'PASS', durableReplayRejection: 'PASS',
    sourceUnchanged: 'PASS', automaticMaiaMemory: 'NONE',
    realMemberEnrollment: 'NOT_IMPLEMENTED', meshRadio: 'NOT_TESTED',
    separatePhysicalDevices: 'NOT_TESTED',
  }));
} finally {
  if (server?.listening) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
  inbox?.close();
  for (const store of stores) store.close();
  rmSync(directory, { recursive: true, force: true });
}
