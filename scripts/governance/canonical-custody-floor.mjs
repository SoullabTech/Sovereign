#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const CUSTODIAN_PATH = 'docs/canon/CANONICAL_ADMISSION_CUSTODIANS.json';
export const FOUNDER_LOGIN = 'Soullab';

const SACRED_PREFIXES = [
  'lib/safety/',
  'lib/memory/',
  'lib/consciousness/',
  'lib/session/',
  'app/api/session/',
];
const INTRINSIC_CLASS_A = new Set([
  'docs/canon/CANONICAL_ADMISSION_CLASSIFICATION_CONTRACT.json',
  'docs/canon/CANONICAL_ADMISSION_CUSTODIANS.json',
]);

const DECLARATIONS = [
  ['class-a', /-\s*\[[xX]\]\s*\*\*Class A\b/],
  ['class-b', /-\s*\[[xX]\]\s*\*\*Class B\b/],
  ['class-c', /-\s*\[[xX]\]\s*\*\*Class C\b/],
  ['frontier-dependent', /-\s*\[[xX]\]\s*\*\*Frontier-Dependent\b/],
];

export function classAFloor({ body = '', changedPaths = [] }) {
  const selected = DECLARATIONS.filter(([, re]) => re.test(body)).map(([name]) => name);
  const pathRequiresA = changedPaths.some(
    p => INTRINSIC_CLASS_A.has(p) || SACRED_PREFIXES.some(prefix => p.startsWith(prefix))
  );

  if (selected.length > 1) {
    return { required: pathRequiresA || selected.includes('class-a'), refusal: 'CLASS_DECLARATION_CONFLICT', selected };
  }

  const declared = selected[0] || null;
  if (pathRequiresA && !declared) {
    return { required: true, refusal: 'CLASS_DECLARATION_MISSING', selected };
  }
  if (pathRequiresA && declared !== 'class-a') {
    return { required: true, refusal: 'DECLARED_BELOW_PATH_MINIMUM', selected };
  }
  if (declared === 'class-a') return { required: true, refusal: null, selected };

  // Interim floor: non-Class-A legacy PRs are not fully reclassified here.
  // Labels are intentionally ignored as admission authority.
  return { required: false, refusal: null, selected };
}

function isIsoDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function activeCustodians(doc, now = new Date()) {
  if (doc == null) {
    return { error: 'CUSTODIAN_RECORD_ABSENT', records: [] };
  }
  if (doc.schema_version !== '1' || !Array.isArray(doc.records)) {
    return { error: 'CUSTODIAN_RECORD_MALFORMED', records: [] };
  }

  const records = doc.records.filter(r =>
    r &&
    r.status === 'active' &&
    r.role === 'canonical_class_a_custodian' &&
    Array.isArray(r.scope) &&
    r.scope.includes('canonical_class_a')
  );

  const seenIds = new Set();
  const seenLogins = new Set();
  for (const r of records) {
    if (
      typeof r.record_id !== 'string' || !r.record_id ||
      typeof r.custodian_human_name !== 'string' || !r.custodian_human_name ||
      typeof r.github_login !== 'string' || !r.github_login ||
      !Number.isInteger(r.github_user_id) || r.github_user_id <= 0 ||
      r.github_actor_type !== 'User' ||
      r.distinct_from_founder_assertion !== true ||
      typeof r.exclusive_control_assertion !== 'string' || !r.exclusive_control_assertion ||
      !isIsoDate(r.effective_at) ||
      Date.parse(r.effective_at) > now.getTime() ||
      typeof r.authorized_by_founder_act !== 'string' || !r.authorized_by_founder_act
    ) {
      return { error: 'CUSTODIAN_RECORD_MALFORMED', records: [] };
    }

    const login = r.github_login.toLowerCase();
    if (seenIds.has(r.github_user_id) || seenLogins.has(login)) {
      return { error: 'CUSTODIAN_RECORD_CONTRADICTORY', records: [] };
    }
    seenIds.add(r.github_user_id);
    seenLogins.add(login);
  }

  if (!records.length) return { error: 'CUSTODIAN_RECORD_ABSENT', records: [] };
  return { error: null, records };
}

function latestExactHeadReview(reviews, custodianId, headSha) {
  return reviews
    .filter(r =>
      r?.user?.id === custodianId &&
      r.commit_id === headSha &&
      typeof r.state === 'string'
    )
    .sort((a, b) => Date.parse(a.submitted_at || 0) - Date.parse(b.submitted_at || 0))
    .at(-1) || null;
}

function commitParticipantIds(commits) {
  const ids = new Set();
  for (const c of commits) {
    if (Number.isInteger(c?.author?.id)) ids.add(c.author.id);
    if (Number.isInteger(c?.committer?.id)) ids.add(c.committer.id);
  }
  return ids;
}

function custodianAppearsInCoauthorMetadata(record, commits) {
  const needles = [
    record.github_login,
    record.custodian_human_name,
    ...(Array.isArray(record.governed_aliases) ? record.governed_aliases : []),
  ].filter(Boolean).map(v => String(v).toLowerCase());

  for (const c of commits) {
    const message = String(c?.commit?.message || '');
    const trailers = message.split('\n').filter(line => /^co-authored-by:/i.test(line));
    for (const trailer of trailers) {
      const lower = trailer.toLowerCase();
      if (needles.some(n => lower.includes(n))) return true;
    }
  }
  return false;
}

export function evaluateCanonicalCustody({
  body = '',
  changedPaths = [],
  pr,
  reviews = [],
  commits = [],
  custodianDoc,
  resolvedUsers = {},
  founderUser = null,
  now = new Date(),
}) {
  const floor = classAFloor({ body, changedPaths });

  if (!floor.required) {
    return { ok: true, code: 'NON_CLASS_A_FLOOR_NOT_TRIGGERED', floor };
  }
  if (floor.refusal) {
    return { ok: false, kind: 'REFUSAL', code: floor.refusal, floor };
  }

  const active = activeCustodians(custodianDoc, now);
  if (active.error) {
    return { ok: false, kind: active.error.includes('MALFORMED') || active.error.includes('CONTRADICTORY') ? 'INSTRUMENT_ERROR' : 'REFUSAL', code: active.error, floor };
  }

  const participantIds = commitParticipantIds(commits);
  const prAuthorId = pr?.user?.id;
  const headSha = pr?.head?.sha;
  if (!Number.isInteger(prAuthorId) || typeof headSha !== 'string' || !headSha) {
    return { ok: false, kind: 'INSTRUMENT_ERROR', code: 'CURRENT_PR_STATE_UNAVAILABLE', floor };
  }

  let eligibleRecordSeen = false;
  for (const record of active.records) {
    const resolved = resolvedUsers[record.github_login.toLowerCase()];
    if (!resolved) {
      return { ok: false, kind: 'INSTRUMENT_ERROR', code: 'CUSTODIAN_IDENTITY_UNRESOLVED', floor };
    }
    if (
      resolved.type !== 'User' ||
      resolved.id !== record.github_user_id ||
      String(resolved.login).toLowerCase() !== record.github_login.toLowerCase()
    ) {
      return { ok: false, kind: 'REFUSAL', code: 'CUSTODIAN_ID_MISMATCH', floor };
    }

    if (
      record.github_login.toLowerCase() === FOUNDER_LOGIN.toLowerCase() ||
      (founderUser && resolved.id === founderUser.id)
    ) {
      return { ok: false, kind: 'REFUSAL', code: 'CUSTODIAN_IS_FOUNDER', floor };
    }
    if (resolved.id === prAuthorId) {
      return { ok: false, kind: 'REFUSAL', code: 'CUSTODIAN_IS_PR_AUTHOR', floor };
    }
    if (participantIds.has(resolved.id) || custodianAppearsInCoauthorMetadata(record, commits)) {
      return { ok: false, kind: 'REFUSAL', code: 'CUSTODIAN_IS_COMMIT_PARTICIPANT', floor };
    }

    eligibleRecordSeen = true;
    const review = latestExactHeadReview(reviews, resolved.id, headSha);
    if (!review) continue;
    if (review?.user?.type !== 'User') {
      return { ok: false, kind: 'REFUSAL', code: 'REVIEWER_NOT_HUMAN_USER', floor };
    }
    if (review.state !== 'APPROVED') continue;

    return {
      ok: true,
      code: 'CLASS_A_CUSTODY_SATISFIED',
      floor,
      custodian: { login: record.github_login, id: record.github_user_id, record_id: record.record_id },
    };
  }

  return {
    ok: false,
    kind: 'REFUSAL',
    code: eligibleRecordSeen ? 'CUSTODIAN_APPROVAL_MISSING_OR_STALE' : 'CUSTODIAN_RECORD_ABSENT',
    floor,
  };
}

function readBaseCustodianDoc(baseSha) {
  try {
    const raw = execFileSync('git', ['show', `${baseSha}:${CUSTODIAN_PATH}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    try {
      return JSON.parse(raw);
    } catch {
      return { schema_version: '__invalid__', records: null };
    }
  } catch {
    return null;
  }
}

async function githubJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'soullab-canonical-custody-floor',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${url}`);
  }
  return response.json();
}

async function githubPages(apiBase, path, token) {
  const out = [];
  for (let page = 1; page <= 100; page++) {
    const join = path.includes('?') ? '&' : '?';
    const items = await githubJson(`${apiBase}${path}${join}per_page=100&page=${page}`, token);
    if (!Array.isArray(items)) throw new Error(`Expected array from ${path}`);
    out.push(...items);
    if (items.length < 100) return out;
  }
  throw new Error(`Pagination exceeded safety bound for ${path}`);
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function runCli() {
  const eventName = process.env.GITHUB_EVENT_NAME || '';
  if (!['pull_request', 'pull_request_review'].includes(eventName)) {
    console.log('PASS · canonical custody floor not applicable to non-PR event');
    return;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!eventPath || !token || !repository) {
    throw new Error('Required GitHub workflow environment is unavailable');
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const prNumber = event?.pull_request?.number;
  if (!Number.isInteger(prNumber)) throw new Error('Current PR number unavailable');

  const [owner, repo] = repository.split('/');
  if (!owner || !repo) throw new Error('GITHUB_REPOSITORY malformed');

  const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';
  const root = `/repos/${owner}/${repo}`;
  const pr = await githubJson(`${apiBase}${root}/pulls/${prNumber}`, token);

  if (!['clean-main-no-secrets', 'main'].includes(pr?.base?.ref)) {
    console.log(`PASS · target branch ${pr?.base?.ref || '<unknown>'} is outside canonical custody scope`);
    return;
  }

  const files = await githubPages(apiBase, `${root}/pulls/${prNumber}/files`, token);
  const changedPaths = files.map(f => f.filename).filter(Boolean);
  const floor = classAFloor({ body: pr.body || '', changedPaths });

  if (!floor.required) {
    console.log('PASS · NON_CLASS_A_FLOOR_NOT_TRIGGERED');
    return;
  }

  if (floor.refusal) {
    console.error(`::error title=Canonical custody refused::REFUSAL · ${floor.refusal}`);
    process.exitCode = 1;
    return;
  }

  const baseSha = argValue('--base') || pr?.base?.sha;
  if (!baseSha) throw new Error('Canonical base SHA unavailable');

  const custodianDoc = readBaseCustodianDoc(baseSha);
  const active = activeCustodians(custodianDoc);
  if (active.error) {
    const kind = active.error.includes('MALFORMED') || active.error.includes('CONTRADICTORY')
      ? 'INSTRUMENT_ERROR'
      : 'REFUSAL';
    console.error(`::error title=Canonical custody ${kind.toLowerCase()}::${kind} · ${active.error}`);
    process.exitCode = 1;
    return;
  }

  const reviews = await githubPages(apiBase, `${root}/pulls/${prNumber}/reviews`, token);
  const commits = await githubPages(apiBase, `${root}/pulls/${prNumber}/commits`, token);

  const resolvedUsers = {};
  for (const record of active.records) {
    const user = await githubJson(`${apiBase}/users/${encodeURIComponent(record.github_login)}`, token);
    resolvedUsers[record.github_login.toLowerCase()] = user;
  }
  const founderUser = await githubJson(`${apiBase}/users/${FOUNDER_LOGIN}`, token);

  const result = evaluateCanonicalCustody({
    body: pr.body || '',
    changedPaths,
    pr,
    reviews,
    commits,
    custodianDoc,
    resolvedUsers,
    founderUser,
  });

  if (!result.ok) {
    console.error(`::error title=Canonical custody ${result.kind.toLowerCase()}::${result.kind} · ${result.code}`);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS · ${result.code}`);
  if (result.custodian) {
    console.log(`custodian=${result.custodian.login} id=${result.custodian.id} record=${result.custodian.record_id}`);
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  runCli().catch(error => {
    console.error(`::error title=Canonical custody instrument error::INSTRUMENT_ERROR · ${error.message}`);
    process.exitCode = 1;
  });
}
