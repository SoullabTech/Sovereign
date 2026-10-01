'use strict';

const crypto = require('node:crypto');
const path = require('node:path');

const REQUEST_VERSION = 'jarvis.cabin-export-request.v1';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function absolutePath(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || !path.isAbsolute(raw)) return null;
  return raw;
}

function canonicalIds(values, field) {
  if (!Array.isArray(values)) {
    throw new Error(`CABIN_EXPORT_REQUEST_INVALID:${field}`);
  }

  const unique = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
      throw new Error(`CABIN_EXPORT_REQUEST_INVALID:${field}`);
    }
    unique.add(value.toLowerCase());
  }

  return [...unique].sort();
}

function canonicalSelection(selection) {
  if (!selection || typeof selection !== 'object' || Array.isArray(selection)) {
    throw new Error('CABIN_EXPORT_REQUEST_INVALID:selection');
  }

  const allowed = new Set(['workIds', 'relationshipIds', 'memoryIds']);
  for (const key of Object.keys(selection)) {
    if (!allowed.has(key)) {
      throw new Error(`CABIN_EXPORT_REQUEST_INVALID:selection_field:${key}`);
    }
  }

  return {
    workIds: canonicalIds(selection.workIds ?? [], 'workIds'),
    relationshipIds: canonicalIds(selection.relationshipIds ?? [], 'relationshipIds'),
    memoryIds: canonicalIds(selection.memoryIds ?? [], 'memoryIds'),
  };
}

function hostActorId(username) {
  const raw = typeof username === 'string' ? username.trim() : '';
  if (!raw) throw new Error('CABIN_EXPORT_REQUEST_ACTOR_REQUIRED');
  const safe = raw.replace(/[^a-zA-Z0-9._-]/g, '-');
  if (!safe) throw new Error('CABIN_EXPORT_REQUEST_ACTOR_INVALID');
  return `human:jarvis-desktop:${safe}`;
}

function canonicalPayload({ actorId, packagePath, selection }) {
  return {
    request_version: REQUEST_VERSION,
    actor_id: actorId,
    package_path: packagePath,
    selection,
  };
}

function digestPayload(payload) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payload), 'utf8')
    .digest('hex');
}

/**
 * Prepare an explicit Cabin export request.
 *
 * This function has no filesystem, network, Cabin source, or writer dependency.
 * It creates an immutable request envelope only. Execution is deliberately a
 * later boundary.
 */
function prepareCabinExportRequest({ actorId, packagePath, selection }) {
  if (typeof actorId !== 'string' || !actorId.startsWith('human:jarvis-desktop:')) {
    throw new Error('CABIN_EXPORT_REQUEST_ACTOR_INVALID');
  }

  const target = absolutePath(packagePath);
  if (!target) throw new Error('CABIN_EXPORT_REQUEST_PATH_MUST_BE_ABSOLUTE');

  const canonical = canonicalSelection(selection);
  const payload = canonicalPayload({
    actorId,
    packagePath: target,
    selection: canonical,
  });

  const request = {
    ...payload,
    request_digest: digestPayload(payload),
    standing: 'PREPARED_NOT_EXECUTED',
  };

  return Object.freeze({
    ...request,
    selection: Object.freeze({
      workIds: Object.freeze([...canonical.workIds]),
      relationshipIds: Object.freeze([...canonical.relationshipIds]),
      memoryIds: Object.freeze([...canonical.memoryIds]),
    }),
  });
}

function confirmCabinExportRequest(request, expectedDigest) {
  if (!request || request.request_version !== REQUEST_VERSION) {
    return { ok: false, status: 'REFUSED', reason: 'CABIN_EXPORT_REQUEST_VERSION_INVALID' };
  }

  if (
    typeof request.request_digest !== 'string' ||
    !/^[0-9a-f]{64}$/.test(request.request_digest)
  ) {
    return { ok: false, status: 'REFUSED', reason: 'CABIN_EXPORT_REQUEST_DIGEST_INVALID' };
  }

  if (typeof expectedDigest !== 'string' || expectedDigest !== request.request_digest) {
    return { ok: false, status: 'REFUSED', reason: 'CABIN_EXPORT_REQUEST_DIGEST_MISMATCH' };
  }

  const payload = canonicalPayload({
    actorId: request.actor_id,
    packagePath: request.package_path,
    selection: canonicalSelection(request.selection),
  });

  const recomputed = digestPayload(payload);
  if (recomputed !== request.request_digest) {
    return { ok: false, status: 'REFUSED', reason: 'CABIN_EXPORT_REQUEST_DRIFTED' };
  }

  return {
    ok: true,
    status: 'READY_FOR_SEPARATE_EXECUTION',
    request_digest: request.request_digest,
    actor_id: request.actor_id,
    package_path: request.package_path,
    selection: request.selection,
  };
}

module.exports = {
  REQUEST_VERSION,
  absolutePath,
  canonicalSelection,
  hostActorId,
  prepareCabinExportRequest,
  confirmCabinExportRequest,
};
