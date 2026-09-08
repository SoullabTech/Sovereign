/**
 * PT-3 — Source Custody falsifier. Structural half (P6, P7, P8, P11).
 *
 * Founder ruling 2026-09-08 authorizing Step 4. The behavioral half lives in
 * `scripts/witness/pt3-source-custody-witness.ts` and proves the Studio does not
 * violate the law today. THIS half is the prospective one — the reason PT-3
 * exists at all:
 *
 *   Make it difficult for Writer's Studio to become capable of violating Source
 *   custody tomorrow without visibly breaking the law.
 *
 * ⚠ THE FOUR POWERS ARE KEPT SEPARATE, AS RULED. Do not merge these into one
 * allowlist. A green P8 does not prove P11; a green P11 does not prove P7. The
 * separation is the law:
 *
 *   S4  queue / destruction mechanism  one governed enqueue boundary
 *   P7  lifecycle reachability         content work cannot ENTER the manuscript
 *                                      destructive lifecycle boundary
 *   P8  destruction reachability       content work cannot acquire, counterfeit,
 *                                      repurpose or pathname-cross into Source
 *                                      destruction
 *   P11 write reachability             content work cannot create, overwrite or
 *                                      truncate historical Source through
 *                                      generic vault-writing power
 *
 * P11 FALSIFIED on 2026-09-08 and was returned, not repaired here: the
 * missing write-side boundary belonged to WS-01, which built it
 * (`lib/manuscript/source/sourceArtifact.ts`, and the Source namespace reserved
 * from generic writing in `lib/storage/fileVault.ts`). These assertions were
 * written to the ruled law BEFORE that repair existed and were not weakened to
 * accommodate it — a falsifier weakened to fit the thing it exists to catch is
 * not a falsifier.
 */
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const REPO = join(__dirname, '../../../..');

/** Comments stripped — the ratified C21 discipline. This file names every banned
 *  construct in prose, and a scan reading prose as behaviour fails on exactly the
 *  files that document their own compliance. */
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

function runtimeFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === '.next') continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.tsx?$/.test(name) && !/__tests__/.test(full)) out.push(full);
    }
  };
  walk(join(REPO, 'lib'));
  walk(join(REPO, 'app'));
  return out;
}

const rel = (f: string) => f.slice(REPO.length + 1);
const find = (pattern: RegExp, except: string[] = []) =>
  runtimeFiles()
    .filter((f) => !except.includes(rel(f)))
    .filter((f) => pattern.test(strip(readFileSync(f, 'utf8'))))
    .map(rel);

/* `scripts/` is EXCLUDED from every allowlist below and pinned here instead.
   Witness fixtures legitimately write Source; without naming that exclusion,
   `scripts/` becomes the smuggling route the scans exist to close. */
const SCRIPT_SOURCE_WRITERS = [
  'scripts/verify-ws01-source-custody.ts',
  'scripts/witness/ws-delete-01-erasure-witness.ts',
  'scripts/witness/ws-delete-01-s4-concurrency-witness.ts',
  'scripts/witness/pt3-source-custody-witness.ts',
];

describe('P6 · Source-write locality', () => {
  it('only the Source-arrival module writes manuscript_source_arrivals', () => {
    expect(
      find(/(INSERT INTO|UPDATE|DELETE FROM)\s+manuscript_source_arrivals/, [
        'lib/manuscript/source/arrivals.ts',
      ]),
    ).toEqual([]);
  });

  it('the scripts/ exclusion is named, not assumed', () => {
    const writers = readdirSync(join(REPO, 'scripts'), { recursive: true } as any) as string[];
    const found = writers
      .filter((f) => typeof f === 'string' && /\.ts$/.test(f))
      .map((f) => join('scripts', f))
      .filter((f) => {
        try {
          return /(INSERT INTO|UPDATE|DELETE FROM)\s+manuscript_source_arrivals/
            .test(strip(readFileSync(join(REPO, f), 'utf8')));
        } catch { return false; }
      });
    /* If a new script writes Source, this fails until someone names it here —
       which is the visible, reviewable act the law asks for. */
    expect(found.sort()).toEqual([...SCRIPT_SOURCE_WRITERS].sort());
  });
});

describe('P7 · lifecycle reachability — content work cannot ENTER the destructive boundary', () => {
  it('(a) locality: the cascade-triggering transition exists only in the seam', () => {
    expect(find(/DELETE FROM member_manuscripts/, ['lib/storage/erasureAuthority.ts'])).toEqual([]);
  });

  it('(b) reachability: only the sanctioned lifecycle act may invoke the seam operation', () => {
    /* Locality alone was the defect the founder found in the first P7: it proves
       WHERE the destructive SQL lives and says nothing about WHO can reach it. A
       content-working route calling the sanctioned helper leaves an SQL
       allowlist perfectly green. */
    expect(
      find(/relinquishManuscriptSource/, [
        'lib/storage/erasureAuthority.ts',
        'lib/manuscript/source/eraseManuscript.ts',
      ]),
    ).toEqual([]);
  });

  it('(b) reachability: only the manuscript DELETE route may invoke the erasure act', () => {
    expect(
      find(/\beraseManuscript\b\s*[(,]|import\s*\{[^}]*\beraseManuscript\b/, [
        'lib/manuscript/source/eraseManuscript.ts',
        'app/api/sovereign/manuscripts/[id]/route.ts',
      ]),
    ).toEqual([]);
  });

  it('(b) negative control: a content-working caller obtaining deletion authority is structurally unreachable', () => {
    /* There is no argument, flag or exported helper by which a content path can
       obtain the transition. It must import one of two allowlisted symbols, and
       the two tests above fail the moment anything else does. */
    const seam = strip(readFileSync(join(REPO, 'lib/storage/erasureAuthority.ts'), 'utf8'));
    expect(seam).not.toMatch(/export\s+(async\s+)?function\s+\w*[Dd]elete\w*Manuscript/);
    expect(seam).toMatch(/FOR UPDATE/);
  });
});

describe('P8 · Source-destruction reachability', () => {
  it('content work cannot ACQUIRE Source-erasure power — there is no such export', () => {
    const seam = require('@/lib/storage/erasureAuthority');
    expect(Object.keys(seam).sort()).toEqual([
      'ErasureRefused',
      'SOURCE_NAMESPACE',
      'WORK_VISUAL_NAMESPACE',
      'canonicalVaultRef',
      'eraseWorkVisualBytes',
      'relinquishManuscriptSource',
    ]);
  });

  it('content work cannot COUNTERFEIT it — no authority object exists to fabricate', () => {
    const seam = strip(readFileSync(join(REPO, 'lib/storage/erasureAuthority.ts'), 'utf8'));
    expect(seam).not.toMatch(/export\s+(interface|type|class)\s+\w*Authority\b/);
    expect(seam).not.toMatch(/export\s+(async\s+)?function\s+\w+\([^)]*authority/i);
  });

  it('content work cannot REPURPOSE another authority — the queue has one writer', () => {
    expect(find(/INSERT INTO vault_erasure_queue/, ['lib/storage/erasureAuthority.ts'])).toEqual([]);
  });

  it('content work cannot PATHNAME-CROSS into Source — canonical refusal holds', () => {
    const { canonicalVaultRef, SOURCE_NAMESPACE, WORK_VISUAL_NAMESPACE } =
      require('@/lib/storage/erasureAuthority');
    expect(canonicalVaultRef(`${WORK_VISUAL_NAMESPACE}/../${SOURCE_NAMESPACE}/x.docx`)).toBeNull();
    expect(canonicalVaultRef(`/${SOURCE_NAMESPACE}/x.docx`)).toBeNull();
  });
});

describe('P11 · Source-write reachability', () => {
  /* Written to the ruled law, not to the implementation. P11 falsified on
     2026-09-08 and WS-01 repaired it; these now enforce the repair.

     Historical Source must be immutable BY MECHANISM, not by the improbability
     of a timestamp-plus-hash filename collision. */
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pt3-vault-'));
    process.env.FILE_STORAGE_PATH = dir;
  });

  const vault = () => require('@/lib/storage/fileVault');
  const source = () => require('@/lib/manuscript/source/sourceArtifact');

  it('(i) generic vault writing cannot produce a canonical destination inside Source', async () => {
    /* The property is the CANONICAL DESTINATION, not the spelling of the
       namespace argument. Banning the literal string would repeat S4's textual
       mistake in write form: both `namespace` and `fileId` are caller-influenced
       and either can carry a traversal. */
    const { writeVaultBytes } = vault();
    const bytes = Buffer.from('not the book');
    const attempts: [string, string][] = [
      ['manuscript-sources', 'forged'],
      ['work-visuals/../manuscript-sources', 'forged'],
      ['./manuscript-sources', 'forged'],
      ['ordinary', '../manuscript-sources/x'],
      ['../manuscript-sources', 'forged'],
      ['manuscript-sources/nested', 'forged'],
    ];
    for (const [ns, fileId] of attempts) {
      await expect(writeVaultBytes(ns, fileId, 'docx', bytes)).rejects.toThrow();
    }
    /* Refused BEFORE bytes are written: nothing reached the Source namespace,
       and no directory was created for it either. */
    expect(existsSync(join(dir, 'manuscript-sources'))).toBe(false);
  });

  it('(i) ordinary namespaces still write, so the refusal is Source-specific', async () => {
    const { writeVaultBytes } = vault();
    const at = await writeVaultBytes('work-visuals', 'cover', 'png', Buffer.from('img'));
    expect(at).toBe('work-visuals/cover.png');
  });

  it('(ii) Source create-only — a duplicate create is refused and the bytes do not change', async () => {
    const { createSourceArtifact, SourceArtifactExists } = source();
    const original = Buffer.from('the book as it arrived');
    const at = await createSourceArtifact('same-id', 'docx', original, { allowRetry: false });

    await expect(
      createSourceArtifact('same-id', 'docx', Buffer.from('THE BOOK IS GONE'), { allowRetry: false }),
    ).rejects.toBeInstanceOf(SourceArtifactExists);

    /* The assertion is not that an error occurred. It is that what the writer
       entrusted is still there, byte for byte. */
    expect(readFileSync(join(dir, at))).toEqual(original);
  });

  it('(ii) a collision resolves to a NEW artifact, never a replacement', async () => {
    /* EEXIST must never become overwrite. Retry establishes a genuinely new
       artifact; it is deliberately not deduplication — identical bytes arriving
       twice are two entrustments. */
    const { createSourceArtifact } = source();
    const first = await createSourceArtifact('dup', 'docx', Buffer.from('A'));
    const second = await createSourceArtifact('dup', 'docx', Buffer.from('B'));
    expect(second).not.toBe(first);
    expect(readFileSync(join(dir, first))).toEqual(Buffer.from('A'));
    expect(readFileSync(join(dir, second))).toEqual(Buffer.from('B'));
  });

  it('⛔ reachability — only WS-01 Source arrival may establish Source bytes', () => {
    /* Kept separate from P6 on purpose. P6 asks who may mutate the Source
       relational RECORD; P11 asks who may create or alter the Source BYTES.
       They are different constitutional powers and must not share an allowlist. */
    expect(
      find(/createSourceArtifact/, [
        'lib/manuscript/source/sourceArtifact.ts',
        'lib/manuscript/source/arrivals.ts',
      ]),
    ).toEqual([]);
  });

  it('⛔ reachability — nothing outside the Source operation names the reserved namespace as a write target', () => {
    const offenders = find(/writeVaultBytes\(\s*['"`]manuscript-sources/, []);
    expect(offenders).toEqual([]);
  });

  /* ── P11(iii) · DIRECT VAULT-WRITE REACHABILITY ─────────────────────────────
   *
   * Founder review 2026-09-08. The two assertions above prove that nobody else
   * calls `createSourceArtifact()` and nobody names the reserved namespace at
   * `writeVaultBytes()`. That is not the whole property, and the gap is the
   * write-side form of the P7 lesson:
   *
   *   Pinning who calls the sanctioned operation is not sufficient if another
   *   route can reach the protected resource without that operation.
   *
   * The repo already contains four routes that write beneath the vault root
   * through Node's filesystem API directly, never touching either helper. None
   * of them can presently resolve into Source. But a helper-only scan would stay
   * green if one of them — or a new one — later could.
   *
   * So the required property is about the RESOURCE, not the helper:
   *
   *   Every runtime path capable of writing beneath the vault root either is the
   *   WS-01 Source-create boundary, or is structurally bounded away from the
   *   canonical Source destination.
   *
   * This is deliberately NOT "every vault writer must use writeVaultBytes()" —
   * that would be an unrelated storage refactor. Independently bounded writers
   * may stay independent. What must be impossible is a new direct vault-writing
   * route quietly acquiring Source reachability while this suite stays green. */
  describe('P11(iii) · every direct vault writer is enumerated and bounded', () => {
    const WRITE_CALL = /writeFile|writeFileSync|appendFile|appendFileSync|createWriteStream|copyFile|\.rename\(|flag:\s*['"`][wa]/;
    const VAULT_ROOT = /FILE_STORAGE_PATH|resolveVaultRoot/;

    /** Pure, so the bypass class can be demonstrated on a synthetic file. */
    const vaultWriters = (files: { rel: string; src: string }[]) =>
      files
        .filter(({ src }) => VAULT_ROOT.test(src) && WRITE_CALL.test(src))
        .map(({ rel }) => rel)
        .sort();

    /** Every entry names WHY it cannot resolve into the Source namespace.
     *  Adding a writer means editing this list — a visible, reviewable act. */
    const BOUNDED_VAULT_WRITERS: Record<string, string> = {
      'lib/manuscript/source/sourceArtifact.ts':
        'THE WS-01 SOURCE BOUNDARY ITSELF. Owns the namespace; create-only via wx.',
      'lib/storage/fileVault.ts':
        'The generic writer. Refuses a canonical Source destination — P11(i).',
      'app/api/studio/files/route.ts':
        'First segment is a server-derived practitioner UUID; the only caller-influenced '
        + 'component is path.extname(file.name), which cannot contain a separator.',
      'app/api/studio/sessions/[sessionId]/voice-notes/route.ts':
        'Server-derived practitioner UUID, then the literal "voice-notes", then a '
        + 'randomUUID note id with an extension chosen from a fixed literal set.',
      'app/api/practitioner/materials/route.ts':
        'Server-derived practitioner UUID, then the literal "materials", then a '
        + 'randomUUID file id; the extension comes from path.extname and cannot contain a separator.',
      'app/api/open/threshold/[token]/stream/[streamId]/route.ts':
        'Literal "encounters" segment, then encounter and stream ids read from uuid '
        + 'columns on a row the token owns — never from the request path.',
    };

    it('the census matches the allowlist exactly — no UNKNOWN writer', () => {
      /* UNKNOWN is not green. A new direct writer fails here until someone
         states, in the allowlist, why it cannot reach Source. */
      const found = vaultWriters(
        runtimeFiles().map((f) => ({ rel: rel(f), src: strip(readFileSync(f, 'utf8')) })),
      );
      expect(found).toEqual(Object.keys(BOUNDED_VAULT_WRITERS).sort());
    });

    it('every allowlisted writer states the reason it cannot reach Source', () => {
      for (const [file, reason] of Object.entries(BOUNDED_VAULT_WRITERS)) {
        expect(reason.length).toBeGreaterThan(40);
        expect(existsSync(join(REPO, file))).toBe(true);
      }
    });

    it('⛔ NEGATIVE CONTROL — the helper-only scan misses the bypass class, and this one catches it', () => {
      /* A synthetic route representing the class: it writes beneath the vault
         root through Node directly, into Source, without ever calling either
         helper P11(i)/(ii) scan for. No production code is modified. */
      const rogue = {
        rel: 'app/api/rogue/route.ts',
        src: `
          import { writeFile } from 'fs/promises';
          import path from 'path';
          const BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';
          export async function POST(req) {
            await writeFile(path.join(BASE, 'manuscript-sources', 'x.docx'), Buffer.from('rewritten'));
          }
        `,
      };

      /* What the helper-only assertions see: nothing. This is the false green. */
      expect(/createSourceArtifact/.test(rogue.src)).toBe(false);
      expect(/writeVaultBytes\(\s*['"`]manuscript-sources/.test(rogue.src)).toBe(false);

      /* What P11(iii) sees. */
      const found = vaultWriters([rogue]);
      expect(found).toEqual(['app/api/rogue/route.ts']);
      expect(Object.keys(BOUNDED_VAULT_WRITERS)).not.toContain('app/api/rogue/route.ts');
    });
  });
});
