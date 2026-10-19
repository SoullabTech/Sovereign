/**
 * FWE01 test-only server transport fuse; never bundled into product runtime.
 * Refuses Node TCP/Unix outbound sockets except the one ephemeral Next
 * loopback test listener and the exact private fictional PostgreSQL socket.
 *
 * This is defense-in-depth for this supervised source acceptance. It is NOT
 * an OS network namespace, not a general sandbox, and not a production guard.
 */
'use strict';
const net = require('node:net');
const socketDir = process.env.FWE01_PG_SOCKET || '';
const port = Number(process.env.FWE01_NEXT_PORT || '');
if (!/^\/private\/tmp\/soullab-fwe01-routepg-20261019\.[A-Za-z0-9]+\/socket$/.test(socketDir) ||
    !Number.isInteger(port) || port !== 38791 ||
    process.env.DATABASE_URL?.includes('maia_consciousness')) {
  throw new Error('FWE01 isolated transport guard refused unsafe configuration');
}

const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function fwe01GuardConnect(...args) {
  const first = args[0];
  let host = 'localhost';
  let requestPort = null;
  let path = null;
  if (first && typeof first === 'object') {
    host = first.host || first.hostname || first.address || 'localhost';
    requestPort = first.port;
    path = first.path;
  } else if (typeof first === 'string') {
    path = first;
  } else if (typeof first === 'number') {
    requestPort = first;
    if (typeof args[1] === 'string') host = args[1];
  }
  const postgresSocket = typeof path === 'string' &&
    path === socketDir + '/.s.PGSQL.55489';
  const nextLoopback = requestPort !== null &&
    Number(requestPort) === port &&
    ['127.0.0.1','::1','localhost'].includes(String(host));
  if (!postgresSocket && !nextLoopback) {
    throw new Error('FWE01 outbound socket refused (non-allowlisted destination)');
  }
  return originalConnect.apply(this, args);
};