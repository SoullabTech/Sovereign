// D-14R — independent, non-interactive verification of the two Test 1
// signatures already captured. No harness invocation, no presence attempt.
// Verifies: (1) each signature validates against the public key over the
// EXACT message actually signed; (2) an altered payload fails verification
// (confirms the check is discriminating, not vacuously true).

import { createVerify, createPublicKey } from 'node:crypto';
import { readFileSync } from 'node:fs';

const evidence = JSON.parse(readFileSync(new URL('./d14r-test1-evidence.json', import.meta.url)));

// P-256 uncompressed-point -> DER SubjectPublicKeyInfo wrapper (standard, fixed 26-byte prefix).
const SPKI_PREFIX_HEX = '3059301306072a8648ce3d020106082a8648ce3d030107034200';
const pointBytes = Buffer.from(evidence.public_key_b64, 'base64');
if (pointBytes.length !== 65 || pointBytes[0] !== 0x04) {
  console.error(`FAIL: public key is not a 65-byte uncompressed P-256 point (got ${pointBytes.length} bytes, leading byte 0x${pointBytes[0]?.toString(16)})`);
  process.exit(1);
}
const spkiDer = Buffer.concat([Buffer.from(SPKI_PREFIX_HEX, 'hex'), pointBytes]);
const publicKey = createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });

let allPass = true;

for (const sig of evidence.signatures) {
  const msgBytes = Buffer.from(sig.message, 'utf8');
  const sigBytes = Buffer.from(sig.signature_b64, 'base64');

  const v1 = createVerify('SHA256');
  v1.update(msgBytes);
  v1.end();
  const validOnExactPayload = v1.verify(publicKey, sigBytes);

  const v2 = createVerify('SHA256');
  v2.update(Buffer.concat([msgBytes, Buffer.from('X')])); // tamper: append one byte
  v2.end();
  const validOnTamperedPayload = v2.verify(publicKey, sigBytes);

  const pass = validOnExactPayload === true && validOnTamperedPayload === false;
  allPass = allPass && pass;

  console.log(JSON.stringify({
    label: sig.label,
    condition: sig.condition,
    verifies_against_exact_payload: validOnExactPayload,
    verifies_against_tampered_payload: validOnTamperedPayload,
    result: pass ? 'PASS (genuine signature, discriminating check)' : 'FAIL',
  }, null, 2));
}

console.log(`\nOVERALL: ${allPass ? 'BOTH SIGNATURES INDEPENDENTLY VERIFIED' : 'VERIFICATION FAILED'}`);
process.exit(allPass ? 0 : 1);
