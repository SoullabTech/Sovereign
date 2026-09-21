#!/usr/bin/env node
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { derivePermissionEnvelope } from './work-unit.mjs';

const MAX_OUTPUT_BYTES = 256 * 1024;
const MAX_EDITS = 8;
const digest = (s) => 'sha256:' + createHash('sha256').update(String(s), 'utf8').digest('hex');
const now = () => new Date().toISOString();
const home = () => process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const safeId = (s) => String(s || 'unknown').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
const refuse = (code, detail = null) => ({ ok: false, status: 'REFUSED', code, detail });
const normalizePath = (value) => String(value ?? '').trim().replaceAll('\\','/');
function globRegex(pattern) {
  let p = normalizePath(pattern);
  if (p.endsWith('/')) p += '**';
  let out = '^';
  const special = '\\^$.*+?()[]{}|';
  for (let i = 0; i < p.length; i += 1) {
    const ch = p[i];
    if (ch === '*') {
      if (p[i + 1] === '*') { i += 1; if (p[i + 1] === '/') { i += 1; out += '(?:.*/)?'; } else out += '.*'; }
      else out += '[^/]*';
    } else if (ch === '?') out += '[^/]';
    else if (special.includes(ch)) out += '\\' + ch;
    else out += ch;
  }
  return new RegExp(out + '$');
}
function pathAllowed(file, allowedFiles = []) {
  const p = normalizePath(file);
  return Array.isArray(allowedFiles) && allowedFiles.some((pattern) => globRegex(pattern).test(p));
}

function ledger(workUnitId, event) {
  const p = path.join(home(), 'native-edit-admission', safeId(workUnitId) + '.jsonl');
  mkdirSync(path.dirname(p), { recursive: true });
  appendFileSync(p, JSON.stringify(event) + '\n');
  return p;
}
function git(wt, args) {
  return execFileSync('git', ['-C', wt, ...args], { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
}
function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let n = 0, i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) { n += 1; i += needle.length; }
  return n;
}
function parseOutput(text) {
  const raw = String(text ?? '').trim();
  if (!raw.startsWith('EDIT_JSON:')) return refuse('EDIT_JSON_REQUIRED');
  if (raw.indexOf('\n') !== -1) return refuse('EDIT_JSON_MUST_BE_ONE_LINE');
  let body;
  try { body = JSON.parse(raw.slice('EDIT_JSON:'.length).trim()); }
  catch { return refuse('EDIT_JSON_INVALID'); }
  if (!body || typeof body !== 'object' || !Array.isArray(body.edits)) return refuse('EDIT_LIST_REQUIRED');
  if (body.edits.length < 1 || body.edits.length > MAX_EDITS) return refuse('EDIT_COUNT_INVALID');
  return { ok: true, body, output_digest: digest(raw) };
}

export function applyNativeEdits({ packet, outputText, worktree } = {}) {
  const wid = String(packet?.work_unit_id || '');
  const parsed = parseOutput(outputText);
  const eventBase = { event_version:'NEA1.v1', event_id:'nea-'+randomBytes(8).toString('hex'), at:now(), work_unit_id:wid, output_digest: parsed.output_digest || digest(outputText || '') };
  const recordRefusal = (code, detail = null) => {
    const event = { ...eventBase, event:'REFUSED', code, detail, applied:false };
    return { ...refuse(code, detail), evidence_path: ledger(wid, event), event };
  };
  if (!wid) return recordRefusal('WORK_UNIT_ID_REQUIRED');
  if (!worktree || !existsSync(worktree)) return recordRefusal('WORKTREE_NOT_FOUND');
  if (Buffer.byteLength(String(outputText || ''), 'utf8') > MAX_OUTPUT_BYTES) return recordRefusal('EDIT_OUTPUT_TOO_LARGE');
  if (!parsed.ok) return recordRefusal(parsed.code, parsed.detail);
  const env = derivePermissionEnvelope(packet);
  if (env.repo_write_scope !== 'worktree') return recordRefusal('WORKTREE_WRITE_AUTHORITY_REQUIRED');
  if (env.production_read || env.production_write || env.deploy || env.authority_change || env.external_network || env.external_repo_disclosure || env.provider_spend) return recordRefusal('EDIT_AUTHORITY_TOO_BROAD');
  if (String(git(worktree, ['status','--porcelain','--untracked-files=all'])).trim()) return recordRefusal('WORKTREE_NOT_CLEAN');

  const originals = new Map();
  const finals = new Map();
  const expected = new Set();
  for (const [idx, edit] of parsed.body.edits.entries()) {
    if (!edit || typeof edit !== 'object') return recordRefusal('EDIT_INVALID', { index: idx });
    const rel = String(edit.path || '').replaceAll('\\','/');
    if (!rel || path.isAbsolute(rel) || rel.split('/').includes('..') || !pathAllowed(rel, packet.allowed_files || [])) return recordRefusal('EDIT_PATH_NOT_AUTHORIZED', { index: idx, path: rel });
    if (typeof edit.old_text !== 'string' || !edit.old_text.length || typeof edit.new_text !== 'string') return recordRefusal('EDIT_TEXT_INVALID', { index: idx });
    const abs = path.join(worktree, rel);
    if (!existsSync(abs)) return recordRefusal('EDIT_TARGET_NOT_FOUND', { index: idx, path: rel });
    if (!originals.has(rel)) { const s = readFileSync(abs, 'utf8'); originals.set(rel, s); finals.set(rel, s); }
    const current = finals.get(rel);
    const count = countOccurrences(current, edit.old_text);
    if (count !== 1) return recordRefusal('OLD_TEXT_NOT_UNIQUE', { index: idx, path: rel, occurrences: count });
    finals.set(rel, current.replace(edit.old_text, edit.new_text));
    expected.add(rel);
  }
  for (const rel of expected) writeFileSync(path.join(worktree, rel), finals.get(rel), 'utf8');
  const changed = String(git(worktree, ['diff','--name-only','HEAD','--'])).split('\n').map(s=>s.trim()).filter(Boolean).sort();
  const unexpected = changed.filter(p => !expected.has(p) || !pathAllowed(p, packet.allowed_files || []));
  if (unexpected.length) {
    for (const [rel, content] of originals) writeFileSync(path.join(worktree, rel), content, 'utf8');
    return recordRefusal('POST_EDIT_SCOPE_VIOLATION', { changed, unexpected });
  }
  const event = { ...eventBase, event:'APPLIED', code:'EDIT_APPLIED', applied:true, changed_paths:changed };
  const evidence_path = ledger(wid, event);
  return { ok:true, status:'APPLIED', code:'EDIT_APPLIED', changed_paths:changed, evidence_path, event };
}

const argv = process.argv.slice(2);
if (argv[0] === 'apply') {
  const [packetPath, worktree, outputFile] = argv.slice(1);
  if (!packetPath || !worktree || !outputFile) { console.error('usage: jarvis-native-edit-admission.mjs apply <packet.json> <worktree> <output-file>'); process.exit(4); }
  const result = applyNativeEdits({ packet: JSON.parse(readFileSync(packetPath,'utf8')), outputText: readFileSync(outputFile,'utf8'), worktree });
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.exit(result.ok ? 0 : 9);
}
