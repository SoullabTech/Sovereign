/** Pure fail-closed DB identity guard for the synthetic writer-cohort witness.
 * Query with host(inet_server_addr()), not inet_server_addr()::text:
 * the latter renders as 127.0.0.1/32 and masks a valid local IPv4 session.
 * Only exact local endpoint + exact dedicated witness DB are authorized.
 */
'use strict';
const assert = require('node:assert/strict');

const EXPECTED_DB = 'maia_ws_beta_witness_20261007';
const EXPECTED_PORT = 5432;
const LOOPBACK_ADDRESSES = Object.freeze(['127.0.0.1', '::1']);

function assertWitnessDatabaseIdentity(row) {
  assert.equal(row?.name, EXPECTED_DB, 'REFUSE: not exact dedicated witness DB');
  assert.equal(typeof row?.address, 'string', 'REFUSE: no server address');
  assert(LOOPBACK_ADDRESSES.includes(row.address),
    'REFUSE: database address not exact loopback');
  assert.equal(row?.port, EXPECTED_PORT, 'REFUSE: database port not exact witness port');
}

module.exports = { assertWitnessDatabaseIdentity };
