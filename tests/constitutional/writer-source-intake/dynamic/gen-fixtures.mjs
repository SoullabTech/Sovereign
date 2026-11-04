// Writes the fictional fixture set and a manifest.json (name, path, mime, expectedStatus, ...) into the given directory.
// Usage: node gen-fixtures.mjs <outDir>   Fictional data only; the canary is random per run and printed nowhere.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { generateFixtures, makeCanary } from '../fixtures.mjs';

const out = process.argv[2];
if (!out) { console.error('usage: node gen-fixtures.mjs <outDir>'); process.exit(64); }
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const manifest = await generateFixtures(out, { canary: makeCanary(crypto.randomBytes(8).toString('hex')), includeLarge: false });
fs.writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest.map((e) => ({
  name: e.name, path: e.path, mime: e.mime ?? null, expectedParse: e.expectedParse,
  expectedStatusClass: e.expectedStatusClass, expectedStatus: e.expectedStatus, basis: e.basis,
})), null, 1));
console.log(`fixtures: ${manifest.length} written, manifest.json included`);
