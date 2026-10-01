/**
 * MAIL AUTHORITY CENSUS — the static half of EMAIL-IDENTITY-01.
 * ==============================================================
 *
 * Reads the repository as it actually is and reports every place source
 * disagrees with the registry in `./identity.ts`:
 *
 *   UNREGISTERED   — a `@soullab.life` address named in source that the
 *                    registry does not declare. New addresses are a decision.
 *   NOT_SENDABLE   — a sender literal for an address software may not send as
 *                    (a human or organizational mailbox used as `from`).
 *   UNGOVERNED     — a sender literal on another Soullab domain that is not in
 *                    the named-debt list. The debt may be paid; it may not grow.
 *   REGISTRY       — the registry contradicts its own class rules.
 *
 * Read-only. Used by `__tests__/identity-authority.test.ts` and by
 * `npm run census:mail-identity`.
 *
 * "Sender literal" is a heuristic: a line that names a Soullab address and also
 * carries a sender marker (`from`, `FROM`, `SENDER`). It is deliberately broad;
 * a false positive costs one review, a false negative costs a voice software
 * should never have spoken in.
 */
import { execFileSync } from 'child_process';
import {
  GOVERNED_MAIL_DOMAIN,
  MAIL_IDENTITIES,
  UNGOVERNED_SOULLAB_SENDERS,
  lookupIdentity,
} from './identity';

export interface CensusViolation {
  kind: 'UNREGISTERED' | 'NOT_SENDABLE' | 'UNGOVERNED' | 'REGISTRY';
  address: string;
  where: string;
  detail: string;
}

/** Source roots the census reads. Docs are prose about mail, not mail. */
const ROOTS = ['lib', 'app', 'components', 'scripts', 'config', 'hooks', 'middleware.ts'];

/** Test fixtures name arbitrary addresses by design; the registry is the subject. */
const EXCLUDED = [
  /(^|\/)__tests__\//,
  /\.test\.[cm]?[jt]sx?$/,
  /\.spec\.[cm]?[jt]sx?$/,
  /^lib\/email\/identity\.ts$/,
  /^lib\/email\/identityCensus\.ts$/,
  /\.md$/,
  /\.generated\./,
];

const ADDRESS = /[A-Za-z0-9._%+-]+@soullab\.(?:life|org|ai)\b/g;
const SENDER_MARKER = /\bfrom\s*:|\bFROM(?:_[A-Z]+)?\b|SENDER/;

interface Hit { file: string; line: number; text: string; }

function grep(repoRoot: string): Hit[] {
  let out = '';
  try {
    out = execFileSync(
      'git',
      ['grep', '--untracked', '-n', '-I', '-E', '@soullab\\.(life|org|ai)', '--', ...ROOTS],
      { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (err) {
    // git grep exits 1 on no matches — an empty result, not a failure.
    const e = err as { status?: number; stdout?: string };
    if (e.status === 1) return [];
    throw err;
  }
  const hits: Hit[] = [];
  for (const raw of out.split('\n')) {
    const m = raw.match(/^([^:]+):(\d+):(.*)$/);
    if (!m || m[1] === undefined || m[2] === undefined || m[3] === undefined) continue;
    const file = m[1], line = m[2], text = m[3];
    if (EXCLUDED.some((re) => re.test(file))) continue;
    hits.push({ file, line: Number(line), text });
  }
  return hits;
}

export function registryViolations(): CensusViolation[] {
  const v: CensusViolation[] = [];
  const seen = new Set<string>();
  for (const m of MAIL_IDENTITIES) {
    const where = 'lib/email/identity.ts';
    if (m.address !== m.address.toLowerCase()) v.push({ kind: 'REGISTRY', address: m.address, where, detail: 'address must be lowercase' });
    if (!m.address.endsWith(`@${GOVERNED_MAIL_DOMAIN}`)) v.push({ kind: 'REGISTRY', address: m.address, where, detail: 'registry governs soullab.life only' });
    if (seen.has(m.address)) v.push({ kind: 'REGISTRY', address: m.address, where, detail: 'declared twice' });
    seen.add(m.address);

    const lanes = m.appSendLanes;
    if ((m.class === 'ORGANIZATIONAL' || m.class === 'LEGACY') && lanes.length > 0) {
      v.push({ kind: 'REGISTRY', address: m.address, where, detail: `${m.class} mailboxes are Proton-owned; software may not send as them` });
    }
    if (m.class === 'TRANSACTIONAL' && (lanes.length !== 1 || lanes[0] !== 'resend')) {
      v.push({ kind: 'REGISTRY', address: m.address, where, detail: 'TRANSACTIONAL identities send on the resend lane only' });
    }
    if (m.class === 'ALERT_RELAY' && (lanes.length !== 1 || lanes[0] !== 'smtp')) {
      v.push({ kind: 'REGISTRY', address: m.address, where, detail: 'ALERT_RELAY identities send on the smtp lane only' });
    }
    if (m.class === 'HUMAN' && lanes.length > 0 && !m.openRuling) {
      v.push({ kind: 'REGISTRY', address: m.address, where, detail: 'a human mailbox software sends as must carry its open ruling' });
    }
  }
  return v;
}

export function censusMailIdentities(repoRoot: string): CensusViolation[] {
  const v = registryViolations();
  const ungoverned = new Set(UNGOVERNED_SOULLAB_SENDERS.map((u) => `${u.address}|${u.where}`));

  for (const hit of grep(repoRoot)) {
    const isSender = SENDER_MARKER.test(hit.text);
    const where = `${hit.file}:${hit.line}`;
    for (const match of hit.text.matchAll(ADDRESS)) {
      const address = match[0].toLowerCase();

      if (!address.endsWith(`@${GOVERNED_MAIL_DOMAIN}`)) {
        if (isSender && !ungoverned.has(`${address}|${hit.file}`)) {
          v.push({ kind: 'UNGOVERNED', address, where, detail: 'sender on a Soullab domain this authority does not govern, and not named debt' });
        }
        continue;
      }

      const identity = lookupIdentity(address);
      if (!identity) {
        v.push({ kind: 'UNREGISTERED', address, where, detail: 'declare it in lib/email/identity.ts (class, owner, lanes)' });
        continue;
      }
      if (isSender && identity.appSendLanes.length === 0) {
        v.push({ kind: 'NOT_SENDABLE', address, where, detail: `${identity.class} mailbox used as a sender; software may not send as it` });
      }
    }
  }
  return v;
}
