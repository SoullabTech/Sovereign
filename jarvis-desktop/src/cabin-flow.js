'use strict';

// Founder-directed Cabin flow, 2026-10-14. MAIN owns every destination.
// Readiness means the runtime answered; it does not certify cognition or recovery.
const CABIN_ORIGIN = 'http://127.0.0.1:43121';
const CABIN_URL = CABIN_ORIGIN + '/cabin';
const MODEL_URL = 'http://127.0.0.1:11434/api/tags';

async function inspectCabin({ fetchImpl = fetch } = {}) {
  const observedAt = new Date().toISOString();
  async function read(url) {
    try {
      const response = await fetchImpl(url, {
        redirect: 'error', signal: AbortSignal.timeout(1500),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch { return null; }
  }
  const [health, inventory] = await Promise.all([
    read(CABIN_ORIGIN + '/api/cabin/health'), read(MODEL_URL),
  ]);
  const runtimeReady = health?.status === 'ready' && health?.mode === 'offline'
    && typeof health?.build === 'string' && health.build !== 'UNSTAMPED'
    && ['empty', 'mounted'].includes(health?.context);
  const modelsAvailable = Array.isArray(inventory?.models)
    && inventory.models.some(m => typeof m.name === 'string' && m.name.length
      && Array.isArray(m.capabilities) && m.capabilities.includes('completion'));
  return {
    observedAt, runtime: runtimeReady ? 'READY' : 'NEEDS_SETUP',
    models: modelsAvailable ? 'AVAILABLE' : 'UNVERIFIED',
    canOpen: runtimeReady,
    conversation: 'UNVERIFIED', writing: 'UNVERIFIED',
    voice: 'UNVERIFIED', recovery: 'UNVERIFIED', resume: 'UNVERIFIED',
    message: runtimeReady
      ? 'Cabin is running locally. Conversation and writing acceptance remain to be verified.'
      : 'Start the isolated Cabin runtime first. Your installed applications can stay open.',
  };
}

async function openCabin({ fetchImpl = fetch, openView } = {}) {
  const readiness = await inspectCabin({ fetchImpl });
  if (!readiness.canOpen) return { opened: false, readiness };
  if (typeof openView !== 'function') throw new Error('CABIN_OPEN_UNAVAILABLE');
  await openView(CABIN_URL);
  return { opened: true, readiness };
}
module.exports = { inspectCabin, openCabin, CABIN_URL };
