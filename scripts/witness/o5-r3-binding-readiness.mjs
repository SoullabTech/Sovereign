/** O5-R3 RB-A3 — read-only readiness classifier for the live walk. */
export function classifyBindingReadiness({ record, live, expectedRoot, expectedHead }) {
  if (!record || typeof record !== 'object') {
    return { ready: false, reason: 'NO_RECORD' };
  }
  if (live !== 'LIVE') {
    return { ready: false, reason: `NOT_LIVE:${live}` };
  }
  if (record?.app?.mode !== 'development' || record?.binding?.selectionSource !== 'dev-walk') {
    return { ready: false, reason: 'NOT_DEV_WALK' };
  }
  if (record?.app?.sourceRoot !== expectedRoot || record?.binding?.repoRoot !== expectedRoot) {
    return { ready: false, reason: 'OTHER_ROOT' };
  }
  if (record?.binding?.head !== expectedHead) {
    return { ready: false, reason: 'OTHER_HEAD' };
  }
  if (record?.binding?.clean !== true) {
    return {
      ready: false,
      reason: record?.binding?.clean === false ? 'DIRTY' : 'CLEAN_INDETERMINATE',
    };
  }
  return { ready: true, reason: 'READY' };
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
