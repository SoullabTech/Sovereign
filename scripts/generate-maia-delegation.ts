#!/usr/bin/env npx ts-node
/**
 * scripts/generate-maia-delegation.ts
 *
 * OFFLINE TOOL — run this on an air-gapped machine (or after disconnecting network)
 * with the MAIA root private key.
 *
 * This script generates a NIP-26 delegation certificate that allows a hot
 * service key to sign Nostr events on behalf of the MAIA root identity.
 *
 * OUTPUT: SQL INSERT statement for maia_nostr_delegation_certs.
 * Pipe to a file, review, then run manually against production DB.
 *
 * SECURITY RULES:
 *   1. Run this script with MAIA_ROOT_NOSTR_NSEC set in your shell env
 *      ONLY while offline (no network connectivity).
 *   2. After running, immediately unset the env var:
 *        unset MAIA_ROOT_NOSTR_NSEC
 *   3. Never commit this script's output — it contains the delegation token.
 *      Copy the SQL manually to your DB.
 *   4. The root nsec NEVER enters the running application.
 *
 * USAGE:
 *   # Step 1: Generate service keys (do this once per role)
 *   node -e "
 *     const {generateSecretKey,getPublicKey} = require('nostr-tools');
 *     const {nsecEncode,npubEncode} = require('nostr-tools/nip19');
 *     const sk = generateSecretKey();
 *     const pk = getPublicKey(sk);
 *     const hex = (b) => Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');
 *     console.log('PRIVKEY (keep secret):', hex(sk));
 *     console.log('PUBKEY (register):', pk);
 *     console.log('NPUB:', npubEncode(pk));
 *     console.log('NSEC:', nsecEncode(sk));
 *   "
 *
 *   # Step 2 (offline): Generate delegation cert
 *   MAIA_ROOT_NOSTR_NSEC=nsec1... npx ts-node scripts/generate-maia-delegation.ts \
 *     --role oracle \
 *     --service-pubkey <64-char hex pubkey of oracle service key> \
 *     --kinds 1 \
 *     --days 90 \
 *     > /tmp/delegation.sql
 *
 *   # Step 3: Review /tmp/delegation.sql, then apply:
 *   psql -U soullab maia_consciousness < /tmp/delegation.sql
 *
 *   # Step 4: Clean up
 *   unset MAIA_ROOT_NOSTR_NSEC
 *   rm /tmp/delegation.sql
 *
 * ROTATION (every 90 days):
 *   Run again with the same or new service pubkey and new --days value.
 *   The INSERT uses ON CONFLICT to deactivate old certs for the same role.
 */

import { schnorr } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { getPublicKey } from 'nostr-tools';
import { decode as decodeNip19 } from 'nostr-tools/nip19';
import { buildConditions, createDelegationToken } from '../lib/nostr/nip26';

// ─── Parse args ───────────────────────────────────────────────────────────────

function parseArgs(): {
  role: string;
  servicePubkey: string;
  kinds: number[];
  days: number;
} {
  const args = process.argv.slice(2);
  const get = (flag: string): string | null => {
    const i = args.indexOf(flag);
    return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
  };

  const role = get('--role');
  const servicePubkey = get('--service-pubkey');
  const kindsStr = get('--kinds');
  const daysStr = get('--days');

  if (!role || !servicePubkey || !kindsStr || !daysStr) {
    console.error(`
Usage: npx ts-node scripts/generate-maia-delegation.ts \\
  --role <oracle|support|retreat|practitioner_bridge> \\
  --service-pubkey <64-char hex pubkey> \\
  --kinds <comma-separated kind numbers, e.g. 1 or 9,14> \\
  --days <validity days, e.g. 90>

Requires: MAIA_ROOT_NOSTR_NSEC env var set to root nsec (offline only).
`);
    process.exit(1);
  }

  const validRoles = ['oracle', 'support', 'retreat', 'practitioner_bridge'];
  if (!validRoles.includes(role)) {
    console.error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  if (!/^[0-9a-f]{64}$/.test(servicePubkey)) {
    console.error('Service pubkey must be 64 lowercase hex characters');
    process.exit(1);
  }

  const kinds = kindsStr.split(',').map(s => parseInt(s.trim(), 10));
  if (kinds.some(isNaN)) {
    console.error('Invalid --kinds value. Use comma-separated integers, e.g. 1 or 9,14');
    process.exit(1);
  }

  const days = parseInt(daysStr, 10);
  if (isNaN(days) || days < 1 || days > 365) {
    console.error('--days must be between 1 and 365');
    process.exit(1);
  }

  return { role, servicePubkey, kinds, days };
}

// ─── Load root key ────────────────────────────────────────────────────────────

function loadRootKey(): { privkeyBytes: Uint8Array; pubkeyHex: string } {
  const nsecRaw = process.env.MAIA_ROOT_NOSTR_NSEC;
  if (!nsecRaw) {
    console.error('MAIA_ROOT_NOSTR_NSEC env var is not set.');
    console.error('Set it to the root nsec before running this script (offline only).');
    process.exit(1);
  }

  let decoded: ReturnType<typeof decodeNip19>;
  try {
    decoded = decodeNip19(nsecRaw.trim());
  } catch {
    console.error('Failed to decode MAIA_ROOT_NOSTR_NSEC — must be a valid nsec1... bech32 string');
    process.exit(1);
  }

  if (decoded.type !== 'nsec') {
    console.error(`Expected nsec, got: ${decoded.type}`);
    process.exit(1);
  }

  const privkeyBytes = decoded.data as Uint8Array;
  const pubkeyHex = getPublicKey(privkeyBytes);
  return { privkeyBytes, pubkeyHex };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
  const { role, servicePubkey, kinds, days } = parseArgs();
  const { privkeyBytes, pubkeyHex: rootPubkeyHex } = loadRootKey();

  const now = Math.floor(Date.now() / 1000);
  const validSince = now;
  const validUntil = now + days * 86400;

  // NIP-26 only supports a single kind per condition string.
  // For multi-kind roles, we generate one cert per kind.
  const certs: Array<{
    conditions: string;
    token: string;
    kind: number;
  }> = [];

  for (const kind of kinds) {
    const conditions = buildConditions({ kinds: [kind], since: validSince, until: validUntil });
    const token = createDelegationToken(privkeyBytes, servicePubkey, conditions);
    certs.push({ conditions, token, kind });
  }

  // Output to stderr so only SQL goes to stdout
  process.stderr.write(`
╔══════════════════════════════════════════════════════════════════════════════╗
║           MAIA NIP-26 DELEGATION CERTIFICATE GENERATOR                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Role:          ${role.padEnd(60)}║
║  Root pubkey:   ${rootPubkeyHex.padEnd(60)}║
║  Service pubkey:${servicePubkey.padEnd(60)}║
║  Kinds:         ${kinds.join(', ').padEnd(60)}║
║  Valid from:    ${new Date(validSince * 1000).toISOString().padEnd(60)}║
║  Valid until:   ${new Date(validUntil * 1000).toISOString().padEnd(60)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SECURITY REMINDER:                                                         ║
║  1. Verify this output before applying to DB                                ║
║  2. Run: unset MAIA_ROOT_NOSTR_NSEC                                         ║
║  3. Do not commit the SQL output to git                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  // SQL output
  console.log(`-- MAIA NIP-26 Delegation Cert — generated ${new Date().toISOString()}`);
  console.log(`-- Role: ${role}, Root: ${rootPubkeyHex}, Service: ${servicePubkey}`);
  console.log(`-- Valid: ${new Date(validSince * 1000).toISOString()} → ${new Date(validUntil * 1000).toISOString()}`);
  console.log();

  // Register service key (idempotent)
  console.log(`-- Register service key (idempotent)`);
  console.log(`INSERT INTO maia_nostr_service_keys (service_role, pubkey_hex)`);
  console.log(`VALUES ('${role}', '${servicePubkey}')`);
  console.log(`ON CONFLICT (service_role) DO UPDATE SET pubkey_hex = EXCLUDED.pubkey_hex;`);
  console.log();

  // Deactivate old certs for this role
  console.log(`-- Deactivate existing certs for this role`);
  console.log(`UPDATE maia_nostr_delegation_certs SET active = false WHERE service_role = '${role}';`);
  console.log();

  // Insert new cert(s)
  for (const { conditions, token, kind } of certs) {
    console.log(`-- Delegation cert for kind ${kind}`);
    console.log(`INSERT INTO maia_nostr_delegation_certs`);
    console.log(`  (service_role, root_pubkey, service_pubkey, conditions, delegation_token, valid_since, valid_until, active)`);
    console.log(`VALUES`);
    console.log(`  ('${role}', '${rootPubkeyHex}', '${servicePubkey}',`);
    console.log(`   '${conditions}',`);
    console.log(`   '${token}',`);
    console.log(`   ${validSince}, ${validUntil}, true);`);
    console.log();
  }

  // Env var reminder
  console.log(`-- Add to Docker secrets / .env.production:`);
  console.log(`-- ${SERVICE_KEY_ENV_NAMES[role as keyof typeof SERVICE_KEY_ENV_NAMES]}=<service privkey hex>`);
  console.log(`-- MAIA_ROOT_NOSTR_PUBKEY=${rootPubkeyHex}`);
}

const SERVICE_KEY_ENV_NAMES = {
  oracle:               'MAIA_ORACLE_SERVICE_PRIVKEY',
  support:              'MAIA_SUPPORT_SERVICE_PRIVKEY',
  retreat:              'MAIA_RETREAT_SERVICE_PRIVKEY',
  practitioner_bridge:  'MAIA_PRACTITIONER_BRIDGE_SERVICE_PRIVKEY',
} as const;

main();
