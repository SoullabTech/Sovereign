import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import {
  LEDGER_FORMAT, HEAD_FORMAT, seal, digest, admitSignedDeletionAuthority,
} from '../../../lib/recovery/r20-r2/signedLedger.mjs';

const keys = generateKeyPairSync('ed25519');
const independentKeys = generateKeyPairSync('ed25519');

function fixture(overrides = {}) {
  const ledger = {
    schema: LEDGER_FORMAT,
    sequence: 2,
    events: [
      { sequence: 1, manifest: 'synthetic-01',
        tombstones: [{ table: 'member_manuscripts', id: 'synthetic-work-01' }], scopes: [] },
      { sequence: 2, manifest: 'synthetic-02',
        tombstones: [], scopes: [{ table: 'conversation_turns', memberId: 'synthetic-member-01' }] },
    ],
    ...overrides,
  };
  const head = {
    schema: HEAD_FORMAT,
    sequence: ledger.sequence,
    ledgerDigest: digest(ledger),
    issuedBy: 'SYNTHETIC_OFFLINE_WITNESS',
  };
  return {
    sealedLedger: seal(ledger, keys.privateKey, keys.publicKey),
    sealedHead: seal(head, independentKeys.privateKey, independentKeys.publicKey),
    ledgerPublicKey: keys.publicKey,
    headPublicKey: independentKeys.publicKey,
    independentlyPinnedMinimumSequence: 2,
    independentlyPinnedHeadDigest: digest(head),
  };
}

test('admit complete independently signed synthetic deletion authority', () => {
  const result = admitSignedDeletionAuthority(fixture());
  assert.equal(result.latestSequence, 2);
  assert.equal(result.tombstoneCount, 1);
  assert.equal(result.scopeCount, 1);
});

const refusal = (name, mutate) => test(name, () => {
  const input = fixture();
  mutate(input);
  assert.throws(() => admitSignedDeletionAuthority(input), /R20 recovery refused/);
});

refusal('refuse missing external high-water', x => { delete x.independentlyPinnedMinimumSequence; });
refusal('refuse bogus external digest', x => { x.independentlyPinnedHeadDigest = '0'.repeat(64); });
refusal('refuse missing ledger', x => { x.sealedLedger = null; });
refusal('refuse tampered signed ledger after signing', x => {
  x.sealedLedger.payload.events[0].tombstones[0].id = 'rewritten';
});
refusal('refuse missing ledger signer key', x => { x.ledgerPublicKey = independentKeys.publicKey; });
refusal('refuse missing independent head', x => { x.sealedHead = undefined; });
refusal('refuse forged head', x => {
  x.sealedHead.payload.ledgerDigest = '0'.repeat(64);
});
refusal('refuse rollback with a valid older signed head', x => {
  x.independentlyPinnedMinimumSequence = 3;
});
refusal('refuse unknown content lane even with valid signature', x => {
  const v = fixture({ events: [
    { sequence: 1, manifest: 'synthetic-01', tombstones: [{ table: 'other_private_table', id: '1' }], scopes: [] },
    { sequence: 2, manifest: 'synthetic-02', tombstones: [{ table: 'living_works', id: '2' }], scopes: [] },
  ] });
  Object.assign(x, v);
});
refusal('refuse event sequence gap even with valid signature', x => {
  const v = fixture({ events: [
    { sequence: 1, manifest: 'synthetic-01', tombstones: [{ table: 'living_works', id: '1' }], scopes: [] },
    { sequence: 3, manifest: 'synthetic-02', tombstones: [{ table: 'living_works', id: '2' }], scopes: [] },
  ] });
  Object.assign(x, v);
});
refusal('refuse unscoped scope even with valid signature', x => {
  const v = fixture({ events: [
    { sequence: 1, manifest: 'synthetic-01', tombstones: [{ table: 'living_works', id: '1' }], scopes: [] },
    { sequence: 2, manifest: 'synthetic-02', tombstones: [], scopes: [{ table: 'conversation_turns' }] },
  ] });
  Object.assign(x, v);
});

refusal('refuse source-text contamination in a validly signed tombstone', x => {
  const v = fixture({ events: [
    { sequence: 1, manifest: 'synthetic-01',
      tombstones: [{ table: 'member_manuscripts', id: 'one', sourceText: 'FORBIDDEN' }], scopes: [] },
    { sequence: 2, manifest: 'synthetic-02',
      tombstones: [{ table: 'living_works', id: 'two' }], scopes: [] },
  ] });
  Object.assign(x, v);
});

refusal('refuse malformed time window even with a valid signature', x => {
  const v = fixture({ events: [
    { sequence: 1, manifest: 'synthetic-01',
      tombstones: [{ table: 'member_manuscripts', id: 'one' }], scopes: [] },
    { sequence: 2, manifest: 'synthetic-02',
      tombstones: [], scopes: [{
        table: 'conversation_turns',
        sessionId: 'session-a',
        windowStart: 'not-a-time',
      }] },
  ] });
  Object.assign(x, v);
});

refusal('refuse a private PEM supplied as the verification trust anchor', x => {
  x.ledgerPublicKey = keys.privateKey.export({ type: 'pkcs8', format: 'pem' });
});

test('integration_passes is an admitted table only with a valid signed object', () => {
  const v = fixture({ events: [
    { sequence: 1, manifest: 'synthetic-01',
      tombstones: [{ table: 'integration_passes', id: 'synthetic-pass-01' }], scopes: [] },
    { sequence: 2, manifest: 'synthetic-02',
      tombstones: [{ table: 'living_works', id: 'synthetic-work-01' }], scopes: [] },
  ] });
  const result = admitSignedDeletionAuthority(v);
  assert.equal(result.latestSequence, 2);
});
