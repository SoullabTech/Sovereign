'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const {assertWitnessDatabaseIdentity} = require('./ws-cohort-witness-db-guard-20261012.cjs');

const good = Object.freeze({
  name: 'maia_ws_beta_witness_20261007',
  address: '127.0.0.1',
  port: 5432,
});
test('accept exact local witness database and IPv4 loopback', () => {
  assert.doesNotThrow(() => assertWitnessDatabaseIdentity(good));
});
test('accept exact local witness database over literal IPv6 loopback', () => {
  assert.doesNotThrow(() => assertWitnessDatabaseIdentity({...good,address:'::1'}));
});
test('reject non-local, unmapped and CIDR-formatted server addresses', () => {
  for (const address of [
    '0.0.0.0', 'localhost', '127.0.0.2', '127.0.0.1/32',
    '::ffff:127.0.0.1', '::1/128', '10.0.0.1', '192.168.4.38',
    '169.254.169.254', '', null, undefined,
  ]) {
    assert.throws(() => assertWitnessDatabaseIdentity({...good,address}),
      /REFUSE/, String(address));
  }
});
test('reject real database names, changed port, and absent database identity', () => {
  for (const row of [
    {...good,name:'maia_consciousness'},
    {...good,name:'maia_consciousness_test'},
    {...good,name:'maia_ws_beta_witness_20261007_other'},
    {...good,port:5433},
    {...good,port:null},
    null,
  ]) {
    assert.throws(() => assertWitnessDatabaseIdentity(row), /REFUSE/);
  }
});
test('runtime query deliberately strips inet mask and calls strict guard before test inserts', () => {
  const source=readFileSync(path.join(__dirname,'ws-rolling-cohort-ten-writer-20261012.cjs'),'utf8');
  assert.match(source, /host\(inet_server_addr\(\)\) AS address/);
  assert.match(source, /assertWitnessDatabaseIdentity\(witness\)/);
  const guard=source.indexOf('assertWitnessDatabaseIdentity(witness)');
  const insert=source.indexOf('await db.query(\'BEGIN\')');
  assert(guard >= 0 && insert > guard, 'DB gate must precede synthetic writes');
  assert.match(source, /WS_COHORT_SYNTHETIC_ONLY !== ALLOW/);
  assert.match(source, /redirect: 'manual'/);
});
