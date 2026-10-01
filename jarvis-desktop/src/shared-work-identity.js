// JARVIS EXECUTION CONVERGENCE EC1-R6 — one Work identity, minted once above representations.
'use strict';

const SAFE_WORK_ID = /^[a-z0-9][a-z0-9-]{2,63}$/;

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 34) || 'work';
}

function makeSharedWorkId(objective, nowMs) {
  const suffix = Number(nowMs).toString(36).slice(-8);
  return (`work-${slug(objective)}-${suffix}`).slice(0, 63).replace(/-+$/g, '');
}

function isSafeSharedWorkId(value) {
  return SAFE_WORK_ID.test(String(value || ''));
}

module.exports = { SAFE_WORK_ID, makeSharedWorkId, isSafeSharedWorkId };
