'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const CABIN_CONTEXT_PACKAGE_SCHEMA = 'soullab.cabin.context-package.v1';
const ENV_KEY = 'JARVIS_CABIN_CONTEXT_PACKAGE_PATH';

function absolutePath(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return null;
  return path.isAbsolute(raw) ? raw : null;
}

/**
 * Read-only artifact posture. This intentionally does not validate the full
 * Cabin package contract; H2.5 remains the Cabin runtime's custody authority.
 */
function inspectCabinContextArtifact({
  env = process.env,
  exists = fs.existsSync,
  stat = fs.statSync,
  readFile = fs.readFileSync,
  sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex'),
} = {}) {
  const configured = absolutePath(env?.[ENV_KEY]);

  if (!configured) {
    return {
      state: 'NOT_CONFIGURED',
      path: null,
      bytes: null,
      modified_at: null,
      sha256: null,
      schema: null,
      custody_authority: 'Cabin H2.5 strict parser',
    };
  }

  if (!exists(configured)) {
    return {
      state: 'MISSING',
      path: configured,
      bytes: null,
      modified_at: null,
      sha256: null,
      schema: null,
      custody_authority: 'Cabin H2.5 strict parser',
    };
  }

  try {
    const metadata = stat(configured);
    const bytes = readFile(configured);
    const digest = sha256(bytes);

    let schema = null;
    let state = 'PRESENT_UNVERIFIED';
    try {
      const parsed = JSON.parse(Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes));
      schema = parsed && typeof parsed === 'object' ? parsed.schema || null : null;
      if (schema !== CABIN_CONTEXT_PACKAGE_SCHEMA) state = 'WRONG_SCHEMA';
    } catch {
      state = 'MALFORMED_JSON';
    }

    return {
      state,
      path: configured,
      bytes: metadata.size,
      modified_at: metadata.mtime.toISOString(),
      sha256: digest,
      schema,
      custody_authority: 'Cabin H2.5 strict parser',
    };
  } catch (error) {
    return {
      state: 'PRESENT_UNVERIFIED',
      path: configured,
      bytes: null,
      modified_at: null,
      sha256: null,
      schema: null,
      custody_authority: 'Cabin H2.5 strict parser',
      observation_error: String(error?.message || error).slice(0, 200),
    };
  }
}

module.exports = {
  CABIN_CONTEXT_PACKAGE_SCHEMA,
  ENV_KEY,
  absolutePath,
  inspectCabinContextArtifact,
};
