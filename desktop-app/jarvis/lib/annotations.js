'use strict';
/**
 * JARVIS Unit 12 — Desktop objective annotations (§8, §15)
 *
 * WHY THIS EXISTS — and what it is emphatically not.
 *
 * §8 requires the run-detail surface to show OBJECTIVE. The Unit 11 runtime's
 * public run projection (publicRun in scripts/builder/jarvis-runtime.mjs) does
 * not include it: it returns run_id, work_unit_id, state, disposition, context,
 * worker, result, verification, audit and history — the packet's objective text
 * stays behind audit.packet_path. The Desktop will not read the runtime's store
 * files to get at it (§18), and it will not modify the Unit 11 runtime to
 * publish it (§1, §25) — the narrow fix belongs to a runtime unit.
 *
 * So the Desktop records the objective for runs IT submitted, and labels the
 * result as a Desktop annotation wherever it is shown. This store is:
 *
 *   NOT the run store          — states, dispositions, evidence, verification
 *                                and history are re-read from the runtime every
 *                                time, and this file is never consulted for any
 *                                of them.
 *   NOT authoritative          — if it disagrees with the runtime, the runtime
 *                                wins; nothing here can create, revive or alter
 *                                a run.
 *   NOT required for continuity — deleting it loses objective labels for past
 *                                runs and nothing else. Every run stays visible
 *                                with its full disposition (§15).
 */

const fs = require('node:fs');
const path = require('node:path');

const MAX_ENTRIES = 500;

function createAnnotations(dir) {
  const file = path.join(dir, 'desktop-objectives.json');
  let map = {};

  try {
    map = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!map || typeof map !== 'object' || Array.isArray(map)) map = {};
  } catch { map = {}; }   // a missing or corrupt annotation file is not an error

  const persist = () => {
    try {
      const keys = Object.keys(map);
      if (keys.length > MAX_ENTRIES) {
        for (const k of keys.slice(0, keys.length - MAX_ENTRIES)) delete map[k];
      }
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(map, null, 2));
    } catch { /* annotations are a label, never load-bearing */ }
  };

  return {
    file,
    all: () => ({ ...map }),
    get: (runId) => map[runId] ?? null,
    record(runId, objective) {
      if (!runId || !objective) return;
      map[runId] = String(objective);
      persist();
    },
  };
}

module.exports = { createAnnotations, MAX_ENTRIES };
