import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const CAP = require('../../../../jarvis-desktop/src/e1-local-capacity.js');
export const GiB = CAP.GIB;

export const HEALTHY = Object.freeze({
  version: CAP.SAMPLE_VERSION,
  platform: 'darwin',
  total_ram_bytes: 48 * GiB,
  free_ram_bytes: 32 * GiB,
  swap_total_bytes: 8 * GiB,
  swap_free_bytes: 8 * GiB,
});

const qwen = 'jarvis-qwen3-coder:65k';
const gpt = 'gpt-oss:20b';

export const LC_FALSIFIERS = Object.freeze({
  'LC-1': Object.freeze({
    name: 'healthy Qwen 65K launch headroom passes',
    model: qwen, sample: HEALTHY, ok: true, reason: null,
  }),  'LC-2': Object.freeze({
    name: 'witnessed panic-window resource shape is held',
    model: qwen,
    sample: { ...HEALTHY, free_ram_bytes: 5.5 * GiB, swap_free_bytes: 0 },
    ok: false, reason: 'LOCAL_CAPACITY_RAM_HEADROOM',
  }),
  'LC-3': Object.freeze({
    name: 'host below physical-RAM floor is held',
    model: qwen,
    sample: { ...HEALTHY, total_ram_bytes: 32 * GiB, free_ram_bytes: 30 * GiB },
    ok: false, reason: 'LOCAL_CAPACITY_HOST_TOO_SMALL',
  }),
  'LC-4': Object.freeze({
    name: 'exhausted active swap is held even when RAM floor passes',
    model: qwen,
    sample: { ...HEALTHY, swap_free_bytes: 512 * 1024 ** 2 },
    ok: false, reason: 'LOCAL_CAPACITY_SWAP_HEADROOM',
  }),
  'LC-5': Object.freeze({
    name: 'swap need not exist when RAM headroom is safe',
    model: qwen,
    sample: { ...HEALTHY, swap_total_bytes: 0, swap_free_bytes: 0 },
    ok: true, reason: null,
  }),  'LC-6': Object.freeze({
    name: 'unknown runtime realization fails closed',
    model: 'unknown:model', sample: HEALTHY,
    ok: false, reason: 'LOCAL_CAPACITY_PROFILE_UNKNOWN',
  }),
  'LC-7': Object.freeze({
    name: 'unknown swap standing fails closed',
    model: qwen,
    sample: { ...HEALTHY, swap_free_bytes: null },
    ok: false, reason: 'LOCAL_CAPACITY_SWAP_UNKNOWN',
  }),
  'LC-8': Object.freeze({
    name: 'healthy GPT-OSS local realization has its own admitted profile',
    model: gpt, sample: HEALTHY, ok: true, reason: null,
  }),
});

export const REAL_CAPACITY = (model, sample) =>
  CAP.evaluateLocalCapacity(model, sample);