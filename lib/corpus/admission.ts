/**
 * SOURCE-CUSTODY-PII-01 · ACT 4 §C — CORPUS ADMISSION.
 *
 * ⛔ THE DEFECT THIS CLOSES: a filesystem location conferred knowledge-corpus
 * authority. `scripts/build-ain-corpus.ts` and `scripts/embed-ain-knowledge.ts`
 * walked `data/ain/source/` recursively and ingested EVERY `.md` and `.txt`.
 * Three beta-tester contact lists sat in that directory, so 21 people's names
 * and addresses were eligible to become material MAIA could retrieve and speak.
 * Nobody decided that. The directory decided it.
 *
 * ⭐ THE LAW, STATED SO IT CAN BE CHECKED:
 *
 *     Membership must be DECLARED and CHECKED,
 *     never INHERITED from where a thing happens to sit.
 *
 * Three independent proofs of the same shape preceded this one: a worktree did
 * not mean disclosure-bounded; `--sandbox read-only` did not mean
 * privacy-bounded; a source directory did not mean knowledge-authorized. In
 * each case a container was trusted for its name rather than for what it
 * actually admits.
 *
 * ── HOW IT WORKS ───────────────────────────────────────────────────────────
 *
 * Admission is a DECLARATION file, not a path convention. A file enters the
 * corpus only if some rule in `data/ain/corpus-admission.json` names it.
 *
 *     declared + classification + authority     ->  ADMITTED
 *     not declared by any rule                  ->  EXCLUDED  (the default)
 *     admitting class without authority basis  ->  EXCLUDED
 *     declared but carrying human-record signal ->  REFUSED   (overrides)
 *
 * ⛔ THE DEFAULT IS EXCLUSION, AND THAT IS THE WHOLE POINT. An undeclared file
 * is not "probably fine" — it is unclassified, and unclassified material has no
 * established authority to become something MAIA says. A guard whose default is
 * admission is the defect wearing a manifest.
 *
 * ⛔ THE DETECTOR IS DEFENCE IN DEPTH AND MUST NEVER BE READ AS THE BOUNDARY.
 * `REFUSED` catches a declaration that is wrong — someone admitting a directory
 * that turns out to hold a contact list. It will have false negatives: this
 * lane already watched a consumer-domain email regex miss a record that carried
 * a name and no address. The boundary is the declaration. The detector only
 * stops a declaration from being catastrophically wrong.
 *
 * ⚠️ EXPECT THE FIRST RUN AFTER THIS LANDS TO ADMIT NOTHING. The declaration
 * ships listing the existing corpus as `unclassified_legacy`, which does NOT
 * permit corpus membership. That is fail-closed working as designed, not a
 * regression: 736 files have never been classified, and auto-admitting them to
 * keep the build green would reproduce the exact defect — bulk admission
 * because classification was inconvenient. Classify, then admit.
 */
import * as fs from 'fs';
import * as path from 'path';

export type Classification =
  /** Published, authored knowledge intended for MAIA to draw on. */
  | 'published_knowledge'
  /** Third-party published text held under an explicit basis. */
  | 'third_party_published'
  /** Soullab's own governed public material. */
  | 'organizational_public'
  /** Present in the tree, never classified. Does NOT permit corpus membership. */
  | 'unclassified_legacy'
  /** Known to carry human records. Never admissible. */
  | 'operational_human_record';

/** The only classifications that admit. Everything else excludes. */
const ADMITTING: ReadonlySet<Classification> = new Set<Classification>([
  'published_knowledge',
  'third_party_published',
  'organizational_public',
]);

const GOVERNED_AUTHORITY_RECORD_ROOT = 'docs/corpus-authority';

const AUTHORITY_BY_CLASS: Readonly<Record<string, ReadonlySet<CorpusAuthorityKind>>> = {
  published_knowledge: new Set<CorpusAuthorityKind>(['soullab_owned']),
  organizational_public: new Set<CorpusAuthorityKind>(['soullab_owned']),
  third_party_published: new Set<CorpusAuthorityKind>(['public_domain', 'license', 'permission']),
};

export type CorpusAuthorityKind =
  | 'soullab_owned'
  | 'public_domain'
  | 'license'
  | 'permission';

export type CorpusAuthorityEvidence =
  | { source: 'in_file'; marker: string }
  | { source: 'governed_record'; ref: string; marker: string };

export interface CorpusAuthorityBasis {
  kind: CorpusAuthorityKind;
  /** Evidence must be mechanically locatable; a free-text assertion is not evidence. */
  evidence: CorpusAuthorityEvidence;
}

export interface AdmissionRule {
  /** Path prefix, relative to the repo root. */
  prefix: string;
  classification: Classification;
  /** Why this rule exists. Required: an unexplained admission is not a decision. */
  reason: string;
  /** Required for every admitting classification. Absence never inherits authority from classification or location. */
  authority?: CorpusAuthorityBasis;
}

export interface AdmissionDeclaration {
  rules: AdmissionRule[];
}

export interface AdmissionVerdict {
  admitted: string[];
  excluded: Array<{ file: string; reason: string }>;
  refused: Array<{ file: string; reason: string }>;
}

/**
 * Signals that a file carries operational human records. Deliberately crude and
 * deliberately secondary — see the note above about what this is and is not.
 */
const HUMAN_RECORD_SIGNALS: Array<{ name: string; test: (text: string) => boolean }> = [
  {
    name: 'consumer email addresses (3+)',
    test: (t) =>
      new Set(
        t.match(
          /[A-Za-z0-9._%+-]+@(gmail|yahoo|aol|hotmail|icloud|outlook|live|msn|comcast|protonmail|proton)\.(com|net|co\.uk)/g,
        ) ?? [],
      ).size >= 3,
  },
  {
    name: 'credential-shaped field',
    test: (t) => /\b(passcode|passkey|password|api[_-]?key|secret)\s*[:=]/i.test(t),
  },
  {
    name: 'contact-roster shape',
    test: (t) => /\b(beta[_ -]?tester|contact list|mailing list|invit(e|ation) list)\b/i.test(t),
  },
];

export function loadDeclaration(repoRoot: string): AdmissionDeclaration {
  const file = path.join(repoRoot, 'data/ain/corpus-admission.json');
  if (!fs.existsSync(file)) {
    /* ⛔ A missing declaration admits NOTHING. It must never read as "no
       restriction applies" — that is the failure mode this file exists to end,
       and the same one lib/db/postgres.ts records for its own question. */
    return { rules: [] };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as AdmissionDeclaration;
}

/**
 * The longest matching declared path wins, so a specific rule can narrow a broad
 * one. Matching is segment-bounded: `data/ain/source` may govern descendants of
 * that directory, but must never silently govern `data/ain/source-private` just
 * because the characters share a prefix.
 */
function ruleFor(relPath: string, declaration: AdmissionDeclaration): AdmissionRule | null {
  const candidate = relPath.split(path.sep).join('/');
  let best: AdmissionRule | null = null;
  for (const rule of declaration.rules) {
    const prefix = rule.prefix.replace(/\\/g, '/').replace(/\/+$/, '');
    const matches = candidate === prefix || candidate.startsWith(`${prefix}/`);
    if (!matches) continue;
    if (!best || prefix.length > best.prefix.replace(/\\/g, '/').replace(/\/+$/, '').length) {
      best = rule;
    }
  }
  return best;
}

/**
 * Decide admission for candidate files. Pure apart from reading each file's
 * text, so it is testable without a corpus.
 */
export function decideAdmission(
  repoRoot: string,
  files: string[],
  declaration: AdmissionDeclaration,
  readFile: (absPath: string) => string = (p) => fs.readFileSync(p, 'utf8'),
): AdmissionVerdict {
  const verdict: AdmissionVerdict = { admitted: [], excluded: [], refused: [] };

  for (const file of files) {
    const rel = path.relative(repoRoot, path.resolve(repoRoot, file));
    const rule = ruleFor(rel, declaration);

    if (!rule) {
      verdict.excluded.push({ file: rel, reason: 'no admission rule declares this path' });
      continue;
    }
    if (!ADMITTING.has(rule.classification)) {
      verdict.excluded.push({
        file: rel,
        reason: `classification '${rule.classification}' does not permit corpus membership`,
      });
      continue;
    }

    // ⛔ Exclusion/hold rules may govern a directory. Admission authority may not.
    // An authority claim binds exactly one corpus item; otherwise location would
    // confer authority on descendants — the same inheritance defect this module closes.
    const normalizedRulePath = rule.prefix.replace(/\\/g, '/').replace(/\/+$/, '');
    const normalizedCandidate = rel.split(path.sep).join('/');
    if (normalizedRulePath !== normalizedCandidate) {
      verdict.excluded.push({
        file: rel,
        reason: `admitting authority must bind the exact item path; '${normalizedRulePath}' cannot confer authority on descendants`,
      });
      continue;
    }

    const authority = rule.authority as CorpusAuthorityBasis | undefined;
    const permittedAuthority = AUTHORITY_BY_CLASS[rule.classification];
    if (!authority || !authority.evidence || typeof authority.evidence !== 'object') {
      verdict.excluded.push({
        file: rel,
        reason: `classification '${rule.classification}' requires a structured corpus authority basis`,
      });
      continue;
    }
    if (!permittedAuthority?.has(authority.kind)) {
      verdict.excluded.push({
        file: rel,
        reason: `authority '${String(authority.kind)}' is incompatible with classification '${rule.classification}'`,
      });
      continue;
    }

    let text = '';
    try {
      text = readFile(path.resolve(repoRoot, file));
    } catch {
      verdict.excluded.push({ file: rel, reason: 'unreadable' });
      continue;
    }

    const evidence = authority.evidence as CorpusAuthorityEvidence;
    if (evidence.source === 'in_file') {
      if (typeof evidence.marker !== 'string' || !evidence.marker.trim()) {
        verdict.excluded.push({ file: rel, reason: 'authority evidence marker is missing' });
        continue;
      }
      if (!text.includes(evidence.marker)) {
        verdict.excluded.push({ file: rel, reason: 'declared in-file authority evidence was not found' });
        continue;
      }
    } else if (evidence.source === 'governed_record') {
      if (typeof evidence.ref !== 'string' || !evidence.ref.trim() ||
          typeof evidence.marker !== 'string' || !evidence.marker.trim()) {
        verdict.excluded.push({ file: rel, reason: 'governed authority evidence is incomplete' });
        continue;
      }
      const evidenceAbs = path.resolve(repoRoot, evidence.ref);
      const evidenceRel = path.relative(repoRoot, evidenceAbs);
      if (evidenceRel.startsWith('..') || path.isAbsolute(evidenceRel)) {
        verdict.excluded.push({ file: rel, reason: 'governed authority evidence escapes repository custody' });
        continue;
      }
      const normalizedEvidenceRel = evidenceRel.split(path.sep).join('/');
      if (normalizedEvidenceRel !== GOVERNED_AUTHORITY_RECORD_ROOT &&
          !normalizedEvidenceRel.startsWith(`${GOVERNED_AUTHORITY_RECORD_ROOT}/`)) {
        verdict.excluded.push({ file: rel, reason: 'authority record is outside the governed corpus-authority namespace' });
        continue;
      }
      try {
        const record = readFile(evidenceAbs);
        if (!record.includes(evidence.marker)) {
          verdict.excluded.push({ file: rel, reason: 'governed authority evidence marker was not found' });
          continue;
        }
      } catch {
        verdict.excluded.push({ file: rel, reason: 'governed authority evidence record is unreadable' });
        continue;
      }
    } else {
      verdict.excluded.push({ file: rel, reason: 'authority evidence source is unsupported' });
      continue;
    }

    const signal = HUMAN_RECORD_SIGNALS.find((s) => s.test(text));
    if (signal) {
      /* A declaration said yes and the content disagrees. The content wins. */
      verdict.refused.push({ file: rel, reason: `human-record signal: ${signal.name}` });
      continue;
    }

    verdict.admitted.push(rel);
  }

  return verdict;
}

/** Human-readable summary for an ingest script. Paths and counts only. */
export function formatVerdict(v: AdmissionVerdict): string {
  const lines = [
    `corpus admission: ${v.admitted.length} admitted · ${v.excluded.length} excluded · ${v.refused.length} REFUSED`,
  ];
  if (v.refused.length) {
    lines.push('  ⛔ refused (declared, but content carries a human-record signal):');
    for (const r of v.refused.slice(0, 20)) lines.push(`     ${r.file} — ${r.reason}`);
  }
  if (v.excluded.length) {
    const byReason = new Map<string, number>();
    for (const e of v.excluded) byReason.set(e.reason, (byReason.get(e.reason) ?? 0) + 1);
    lines.push('  excluded:');
    for (const [reason, n] of byReason) lines.push(`     ${n} × ${reason}`);
  }
  return lines.join('\n');
}
