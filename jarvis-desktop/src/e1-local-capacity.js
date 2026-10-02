'use strict';

const fs = require('node:fs');
const os = require('node:os');
const { execFileSync: realExecFileSync } = require('node:child_process');

const GIB = 1024 ** 3;
const SAMPLE_VERSION = 'E1LC-SAMPLE.v1';
const ADMISSION_VERSION = 'E1LC.v1';

const LOCAL_CAPACITY_PROFILES = Object.freeze({
  'jarvis-qwen3-coder:65k': Object.freeze({
    runtime_model: 'jarvis-qwen3-coder:65k',
    governed_model_id: 'qwen3-coder:30b',
    model_bytes: 18556688736,
    context_tokens: 65536,
    min_total_ram_bytes: 40 * GIB,
    reserve_bytes: 8 * GIB,
    min_free_swap_bytes: 1 * GIB,
  }),
  'gpt-oss:20b': Object.freeze({
    runtime_model: 'gpt-oss:20b',
    governed_model_id: 'gpt-oss:20b',
    model_bytes: 13793422144,
    context_tokens: 65536,
    min_total_ram_bytes: 32 * GIB,
    reserve_bytes: 8 * GIB,
    min_free_swap_bytes: 1 * GIB,
  }),
});
function unitBytes(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const u = String(unit || 'B').toUpperCase();
  if (u === 'K' || u === 'KB') return n * 1024;
  if (u === 'M' || u === 'MB') return n * 1024 ** 2;
  if (u === 'G' || u === 'GB') return n * 1024 ** 3;
  if (u === 'T' || u === 'TB') return n * 1024 ** 4;
  return n;
}

function parseDarwinSwap(text) {
  const s = String(text || '');
  const read = (name) => {
    const m = new RegExp(name + '\\s*=\\s*([0-9.]+)([KMGT]?)', 'i').exec(s);
    return m ? unitBytes(m[1], m[2]) : null;
  };
  const total = read('total');
  const used = read('used');
  const free = read('free');
  return Number.isFinite(total) && Number.isFinite(free)
    ? { total, used: Number.isFinite(used) ? used : Math.max(0, total - free), free }
    : null;
}

function parseLinuxMeminfo(text) {
  const values = {};
  for (const line of String(text || '').split('\n')) {
    const m = /^([A-Za-z_()]+):\s+([0-9]+)\s+kB$/.exec(line.trim());
    if (m) values[m[1]] = Number(m[2]) * 1024;
  }
  return values;
}
function sampleLocalCapacity(deps = {}) {
  const platform = deps.platform || process.platform;
  const totalmem = deps.totalmem || os.totalmem;
  const freemem = deps.freemem || os.freemem;
  const execFileSync = deps.execFileSync || realExecFileSync;
  const readFileSync = deps.readFileSync || fs.readFileSync;

  let totalRam = Number(totalmem());
  let freeRam = Number(freemem());
  let swapTotal = null;
  let swapFree = null;

  if (platform === 'darwin') {
    try {
      const swap = parseDarwinSwap(execFileSync('/usr/sbin/sysctl', ['-n', 'vm.swapusage'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000,
      }));
      if (swap) {
        swapTotal = swap.total;
        swapFree = swap.free;
      }
    } catch { /* unknown stays unknown */ }
  } else if (platform === 'linux') {
    try {
      const mem = parseLinuxMeminfo(readFileSync('/proc/meminfo', 'utf8'));
      if (Number.isFinite(mem.MemTotal)) totalRam = mem.MemTotal;
      if (Number.isFinite(mem.MemAvailable)) freeRam = mem.MemAvailable;
      if (Number.isFinite(mem.SwapTotal)) swapTotal = mem.SwapTotal;
      if (Number.isFinite(mem.SwapFree)) swapFree = mem.SwapFree;
    } catch { /* fall back to os totals; swap remains unknown */ }
  }

  return Object.freeze({
    version: SAMPLE_VERSION,
    platform,
    total_ram_bytes: Number.isFinite(totalRam) ? totalRam : null,
    free_ram_bytes: Number.isFinite(freeRam) ? freeRam : null,
    swap_total_bytes: Number.isFinite(swapTotal) ? swapTotal : null,
    swap_free_bytes: Number.isFinite(swapFree) ? swapFree : null,
  });
}
function held(reason, runtimeModel, profile, sample, detail) {
  return Object.freeze({
    ok: false,
    status: 'HELD_FOR_LOCAL_CAPACITY',
    reason,
    detail,
    admission_version: ADMISSION_VERSION,
    runtime_model: runtimeModel || null,
    profile: profile || null,
    sample: sample || null,
  });
}

function evaluateLocalCapacity(runtimeModel, sample) {
  const profile = LOCAL_CAPACITY_PROFILES[runtimeModel];
  if (!profile) {
    return held('LOCAL_CAPACITY_PROFILE_UNKNOWN', runtimeModel, null, sample,
      'No admitted local-capacity profile exists for this exact runtime model.');
  }
  const total = sample?.total_ram_bytes;
  const free = sample?.free_ram_bytes;
  if (!Number.isFinite(total) || !Number.isFinite(free)) {
    return held('LOCAL_CAPACITY_SAMPLE_UNKNOWN', runtimeModel, profile, sample,
      'Host RAM standing could not be established.');
  }
  if (total < profile.min_total_ram_bytes) {
    return held('LOCAL_CAPACITY_HOST_TOO_SMALL', runtimeModel, profile, sample,
      'Physical RAM is below the admitted host floor for this runtime realization.');
  }

  const requiredFree = profile.model_bytes + profile.reserve_bytes;
  if (free < requiredFree) {
    return held('LOCAL_CAPACITY_RAM_HEADROOM', runtimeModel, profile, sample,
      'Free RAM is below model bytes plus the protected 8 GiB system reserve.');
  }
  const swapTotal = sample?.swap_total_bytes;
  const swapFree = sample?.swap_free_bytes;
  if (!Number.isFinite(swapTotal) || !Number.isFinite(swapFree)) {
    return held('LOCAL_CAPACITY_SWAP_UNKNOWN', runtimeModel, profile, sample,
      'Swap standing could not be established.');
  }
  if (swapTotal > 0 && swapFree < profile.min_free_swap_bytes) {
    return held('LOCAL_CAPACITY_SWAP_HEADROOM', runtimeModel, profile, sample,
      'Active swap has less than the protected 1 GiB free reserve.');
  }

  return Object.freeze({
    ok: true,
    status: 'ADMITTED',
    reason: null,
    detail: 'Exact runtime realization has the conservative launch headroom required by E1LC.v1.',
    admission_version: ADMISSION_VERSION,
    runtime_model: runtimeModel,
    profile,
    sample,
    required_free_ram_bytes: requiredFree,
  });
}

module.exports = {
  GIB,
  SAMPLE_VERSION,
  ADMISSION_VERSION,
  LOCAL_CAPACITY_PROFILES,
  parseDarwinSwap,
  parseLinuxMeminfo,
  sampleLocalCapacity,
  evaluateLocalCapacity,
};