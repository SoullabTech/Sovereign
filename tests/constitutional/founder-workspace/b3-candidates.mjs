// @ts-check
/** Defeat candidates for the instrument registry (B3). Each embodies one wrong belief. */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from '../../../scripts/builder/founder-workspace/instrument-registry.mjs';

/** DC-M1: "a script we wrote ourselves is read-only because we say so" (admission by name, no scan) */
export function admitByName(/** @type {any} */ e) { return { id: e.id, admitted: existsSync(path.join(REPO_ROOT, e.script || '')), proof: { kind: 'trusted-by-name' } }; }
/** DC-M2: "pinning a hash is bureaucracy; the script is the script" */
export function observeWithoutPin(/** @type {any} */ entry, /** @type {string} */ file) { return { state: existsSync(file) ? 'current' : 'unavailable', pinned: false, changed_ignored: true, instrument_id: entry.id }; }
/** DC-M3: "a URL is a URL; the registry should not care which host" */
export function admitAnyUrl(/** @type {any} */ e) { return { id: e.id, admitted: /^https?:\/\//.test(e.url || ''), proof: { kind: 'any-url' } }; }
/** DC-M4: "if the probe throws, the last known state is probably still right" */
export function observeOptimistic(/** @type {any} */ entry, /** @type {() => any} */ probe) { try { return { instrument_id: entry.id, state: 'current', result: probe() }; } catch { return { instrument_id: entry.id, state: 'current', result: { assumed: true } }; } }
/** DC-M5: "one health score makes the Monitor readable" */
export function registryWithScore(/** @type {any} */ reg) { const n = reg.entries.filter((/** @type {any} */ e) => e.admitted).length; return { ...reg, health_score: n / reg.entries.length }; }
/** DC-M6: "an observation from yesterday is still current if nothing changed" */
export function freshnessAlwaysCurrent() { return 'current'; }
