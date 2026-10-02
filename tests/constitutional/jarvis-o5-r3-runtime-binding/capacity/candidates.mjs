import { CAP } from './falsifiers.mjs';

const real = (model, sample) => CAP.evaluateLocalCapacity(model, sample);
const pass = (runtime_model, sample) => ({
  ok: true, status: 'ADMITTED', reason: null, runtime_model, sample,
});
const held = (runtime_model, sample, reason) => ({
  ok: false, status: 'HELD_FOR_LOCAL_CAPACITY', reason, runtime_model, sample,
});

export const LC_CANDIDATES = Object.freeze({
  'DC-LC1': Object.freeze({
    name: 'capacity gate never opens',
    kills: 'LC-1',
    run: (model, sample) => held(model, sample, 'LOCAL_CAPACITY_ALWAYS_HELD'),
  }),
  'DC-LC2': Object.freeze({
    name: 'free-RAM headroom is ignored',
    kills: 'LC-2',
    run: (model, sample) => {
      const out = real(model, sample);
      return out.reason === 'LOCAL_CAPACITY_RAM_HEADROOM' ? pass(model, sample) : out;
    },
  }),  'DC-LC3': Object.freeze({
    name: 'physical host floor is ignored',
    kills: 'LC-3',
    run: (model, sample) => {
      const out = real(model, sample);
      return out.reason === 'LOCAL_CAPACITY_HOST_TOO_SMALL' ? pass(model, sample) : out;
    },
  }),
  'DC-LC4': Object.freeze({
    name: 'active swap exhaustion is ignored',
    kills: 'LC-4',
    run: (model, sample) => {
      const out = real(model, sample);
      return out.reason === 'LOCAL_CAPACITY_SWAP_HEADROOM' ? pass(model, sample) : out;
    },
  }),
  'DC-LC5': Object.freeze({
    name: 'swap must exist even with safe RAM headroom',
    kills: 'LC-5',
    run: (model, sample) => sample.swap_total_bytes === 0
      ? held(model, sample, 'LOCAL_CAPACITY_SWAP_REQUIRED')
      : real(model, sample),
  }),  'DC-LC6': Object.freeze({
    name: 'unknown model silently inherits Qwen profile',
    kills: 'LC-6',
    run: (model, sample) => model === 'unknown:model'
      ? real('jarvis-qwen3-coder:65k', sample)
      : real(model, sample),
  }),
  'DC-LC7': Object.freeze({
    name: 'unknown swap is treated as disabled swap',
    kills: 'LC-7',
    run: (model, sample) => sample.swap_free_bytes == null
      ? real(model, { ...sample, swap_total_bytes: 0, swap_free_bytes: 0 })
      : real(model, sample),
  }),
  'DC-LC8': Object.freeze({
    name: 'only Qwen has a capacity profile',
    kills: 'LC-8',
    run: (model, sample) => model === 'gpt-oss:20b'
      ? held(model, sample, 'LOCAL_CAPACITY_PROFILE_UNKNOWN')
      : real(model, sample),
  }),
});