#!/usr/bin/env node
/**
 * Canonical Work Unit creation seam.
 *
 * Creates the packet file only after the same packet-shape validation and
 * answer-leakage lint used by the runtime. It never claims a worktree, launches
 * a worker, widens authority, or overwrites an existing Work Unit.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { validatePacket } from './jarvis-runtime-pipeline.mjs';
import { lintLeakage } from './jarvis-packet-guard.mjs';

const homeOf = (home) => home || process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
export const packetFile = (id, home) => path.join(homeOf(home), 'packets', `${id}.json`);

function arrayField(packet, key, errors) {
  if (packet[key] != null && !Array.isArray(packet[key])) errors.push(`${key}: must be an array when present`);
}

export function validateWorkUnitCreation(packet) {
  const base = validatePacket(packet);
  const errors = [...(base.errors || [])];
  for (const k of ['authorized_acts', 'not_authorized_acts', 'dependencies', 'blockers']) arrayField(packet, k, errors);
  const lint = lintLeakage(packet);
  if (!lint.ok) errors.push(`PACKET_ANSWER_LEAKAGE: ${JSON.stringify(lint.violations).slice(0, 500)}`);
  return { ok: errors.length === 0, errors, lint };
}

export function createWorkUnit(packet, opts = {}) {
  const checked = validateWorkUnitCreation(packet);
  if (!checked.ok) return { ok: false, code: 'WORK_UNIT_INVALID', errors: checked.errors, path: null };
  const file = packetFile(packet.work_unit_id, opts.home);
  if (existsSync(file)) {
    return { ok: false, code: 'WORK_UNIT_ID_IN_USE', errors: [`packet already exists at ${file}`], path: file };
  }
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(packet, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  return { ok: true, code: 'CREATED', errors: [], path: file, work_unit_id: packet.work_unit_id };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, input] = process.argv.slice(2);
  if (command !== 'create' || !input) {
    console.error('usage: work-unit-create.mjs create <packet.json>');
    process.exit(2);
  }
  const packet = JSON.parse(readFileSync(input, 'utf8'));
  const out = createWorkUnit(packet);
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.ok ? 0 : 1);
}
