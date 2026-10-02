'use strict';

const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const path = require('node:path');

const MAX_SOURCE_FILES = 3;
const MAX_RANGES_PER_FILE = 2;
const MAX_TOTAL_CHARS = 42000;
const RANGE_RADIUS = 22;
const FALLBACK_LINES = 90;

const STOP = new Set([
  'about','after','again','against','being','blocking','build','change','could','from','have','into',
  'investigate','next','prepare','release','should','studio','that','their','there','these','this','what',
  'when','where','which','with','would','writer','writers','your',
]);

function normalizeField(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function objectiveTokens(value) {
  return [...new Set(String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9']+/g, ' ')
    .split(/\s+/)
    .map((x) => x.replace(/^'+|'+$/g, ''))
    .filter((x) => x.length >= 4 && !STOP.has(x)))];
}

function resolveProgrammeFromObjective(programmes, objective) {
  const objectiveNorm = normalizeField(objective);
  if (!objectiveNorm) return { status: 'NONE', programme: null, matches: [] };
  const rows = (Array.isArray(programmes) ? programmes : [])
    .map((programme) => {
      const names = [...new Set([programme?.id, programme?.name].filter(Boolean).map(normalizeField).filter((x) => x.length >= 8))];
      const best = names.filter((name) => objectiveNorm.includes(name)).sort((a,b) => b.length - a.length)[0];
      return best ? { programme, key: best } : null;
    })
    .filter(Boolean)
    .sort((a,b) => b.key.length - a.key.length);
  if (!rows.length) return { status: 'NONE', programme: null, matches: [] };
  const topLen = rows[0].key.length;
  const top = rows.filter((row) => row.key.length === topLen);
  if (top.length !== 1) return { status: 'AMBIGUOUS', programme: null, matches: top.map((x) => x.programme?.id).filter(Boolean) };
  return { status: 'MATCHED', programme: top[0].programme, matches: [top[0].programme?.id].filter(Boolean) };
}

function safeRepoPath(ref) {
  const raw = String(ref || '').split('#')[0];
  const m = raw.match(/^(.*?):(\d+)$/);
  const file = m ? m[1] : raw;
  const line = m ? Number(m[2]) : null;
  if (!file || path.isAbsolute(file) || file.includes('\0')) return null;
  const norm = path.posix.normalize(file.replaceAll('\\','/'));
  if (norm === '..' || norm.startsWith('../')) return null;
  return { file: norm, line };
}

function readGitObject(repo, sha, ref) {
  if (!/^[0-9a-f]{40}$/i.test(String(sha || ''))) throw new Error('PRECISION_CONTEXT_SHA_INVALID');
  const parsed = safeRepoPath(ref);
  if (!parsed) throw new Error('PRECISION_CONTEXT_REF_INVALID');
  execFileSync('git', ['-C', repo, 'cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' });
  const text = execFileSync('git', ['-C', repo, 'show', `${sha}:${parsed.file}`], {
    encoding: 'utf8', stdio: ['ignore','pipe','pipe'], maxBuffer: 2 * 1024 * 1024,
  });
  return { ...parsed, text };
}

function lineScore(line, tokens) {
  const s = String(line || '').toLowerCase();
  let score = 0;
  for (const token of tokens) if (s.includes(token)) score += 1;
  if (/^#{1,4}\s/.test(s)) score += 0.35;
  return score;
}

function selectRanges(text, objective, lineHint = null) {
  const lines = String(text || '').split('\n');
  if (!lines.length) return [];
  if (Number.isInteger(lineHint) && lineHint > 0) {
    const start = Math.max(1, lineHint - RANGE_RADIUS);
    const end = Math.min(lines.length, lineHint + RANGE_RADIUS * 2);
    return [{ start, end, reason: 'source-ref line vicinity' }];
  }
  const tokens = objectiveTokens(objective);
  const scored = lines.map((line, i) => ({ line: i + 1, score: lineScore(line, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a,b) => b.score - a.score || a.line - b.line);
  if (!scored.length) return [{ start: 1, end: Math.min(lines.length, FALLBACK_LINES), reason: 'document orientation' }];
  const chosen = [];
  for (const hit of scored) {
    if (chosen.some((x) => Math.abs(x.center - hit.line) < RANGE_RADIUS * 2)) continue;
    chosen.push({ center: hit.line, score: hit.score });
    if (chosen.length >= MAX_RANGES_PER_FILE) break;
  }
  return chosen.map((hit) => ({
    start: Math.max(1, hit.center - RANGE_RADIUS),
    end: Math.min(lines.length, hit.center + RANGE_RADIUS),
    reason: `objective-token match near line ${hit.center}`,
  }));
}

function refsForField(vm, explicitContext, objective) {
  const programmes = vm?.programme_state?.programmes || [];
  const work = vm?.work?.units || [];
  if (explicitContext?.kind === 'programme') {
    const row = programmes.find((p) => p.id === explicitContext.id);
    if (row) return { field: row, label: row.name || row.id, refs: row.sources || [], resolution: 'explicit-programme' };
  }
  if (explicitContext?.kind === 'work') {
    const row = work.find((u) => u.id === explicitContext.id);
    if (row) return { field: row, label: row.title || row.id, refs: row.file ? [row.file] : [], resolution: 'explicit-work' };
  }
  const matched = resolveProgrammeFromObjective(programmes, objective);
  if (matched.status === 'MATCHED' && matched.programme) {
    return { field: matched.programme, label: matched.programme.name || matched.programme.id, refs: matched.programme.sources || [], resolution: 'objective-exact-programme' };
  }
  return { field: null, label: explicitContext?.label || null, refs: [], resolution: matched.status === 'AMBIGUOUS' ? 'ambiguous' : 'none', matches: matched.matches };
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function buildPrecisionContext({ repo, vm, explicitContext = null, objective = '' }) {
  const canonicalSha = vm?.meta?.observed_against;
  const field = refsForField(vm, explicitContext, objective);
  if (!/^[0-9a-f]{40}$/i.test(String(canonicalSha || ''))) {
    return { status: 'REFUSED', reason: 'CANONICAL_SHA_UNAVAILABLE', canonical_sha: canonicalSha || null, field, fragments: [], refusals: [] };
  }
  const refs = [...new Set((field.refs || []).map(String))].slice(0, MAX_SOURCE_FILES);
  const fragments = [];
  const refusals = [];
  let totalChars = 0;

  for (const ref of refs) {
    let src;
    try { src = readGitObject(repo, canonicalSha, ref); }
    catch (e) {
      refusals.push({ ref, reason: String(e?.message || e).slice(0, 240) });
      continue;
    }
    const lines = src.text.split('\n');
    const ranges = selectRanges(src.text, objective, src.line);
    for (const range of ranges) {
      const content = lines.slice(range.start - 1, range.end).join('\n');
      if (!content) continue;
      if (totalChars + content.length > MAX_TOTAL_CHARS) break;
      totalChars += content.length;
      fragments.push({
        source_file: src.file,
        source_sha: canonicalSha,
        selector: { type: 'lines', start: range.start, end: range.end },
        start_line: range.start,
        end_line: range.end,
        extraction_method: 'canonical-git-object-range',
        content_hash: sha256(content),
        reason: `${field.resolution}: ${range.reason}`,
        content,
        est_tokens: Math.ceil(content.length / 3.5),
      });
    }
  }
  return {
    status: fragments.length ? (refusals.length ? 'PARTIAL' : 'READY') : (refs.length ? 'REFUSED' : 'NO_EVIDENCE'),
    reason: fragments.length ? null : (refs.length ? 'SOURCE_MATERIALIZATION_FAILED' : 'NO_EVIDENCE_REFS'),
    canonical_sha: canonicalSha,
    field: { id: field.field?.id || null, label: field.label, resolution: field.resolution, matches: field.matches || [] },
    fragments,
    refusals,
    total_chars: totalChars,
  };
}

module.exports = {
  MAX_SOURCE_FILES, MAX_RANGES_PER_FILE, MAX_TOTAL_CHARS,
  normalizeField, objectiveTokens, resolveProgrammeFromObjective, safeRepoPath,
  readGitObject, selectRanges, refsForField, buildPrecisionContext,
};
