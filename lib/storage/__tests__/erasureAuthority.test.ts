/**
 * WS-DELETE-01 · S4 — negative controls for the governed erasure authority seam.
 *
 * Founder ruling 2026-09-08. These are the evidence the ruling asks to be
 * returned with the seam. Each one is a refusal: the seam is only worth
 * anything if it says NO to the acts PT-3 forbids, so every control here
 * asserts that nothing was enqueued, not merely that an error was thrown.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  enqueueVaultErasure,
  mintSourceErasureAuthority,
  workVisualErasureAuthority,
  namespaceOf,
  ErasureAuthorityRefused,
  SOURCE_NAMESPACE,
  WORK_VISUAL_NAMESPACE,
} from '../erasureAuthority';

const REPO = join(__dirname, '../../..');

/** A transaction client that records what it was asked to run. */
function fakeTx(rows: (sql: string) => any[] = () => []) {
  const seen: { sql: string; params: any[] }[] = [];
  return {
    seen,
    client: {
      query: async (sql: string, params: any[] = []) => {
        seen.push({ sql, params });
        return { rows: rows(sql), rowCount: rows(sql).length } as any;
      },
    },
    inserts: () => seen.filter((s) => /INSERT INTO vault_erasure_queue/.test(s.sql)),
  };
}

const SOURCE_PATH = `${SOURCE_NAMESPACE}/abc123-deadbeef.docx`;
const VISUAL_PATH = `${WORK_VISUAL_NAMESPACE}/1111-2222.png`;

describe('namespace is the boundary, not the caller', () => {
  it('reads the namespace segment, and refuses a path that has none', () => {
    expect(namespaceOf(SOURCE_PATH)).toBe(SOURCE_NAMESPACE);
    expect(namespaceOf('loose-file.docx')).toBeNull();
    expect(namespaceOf('/leading-slash.docx')).toBeNull();
  });

  it('⛔ CONTENT WORK CANNOT DESTROY SOURCE — a work-visual authority handed a Source path is refused', async () => {
    /* This is P8. The Work-cover route is an ordinary content-working path and
       keeps its own artifact's authority; presented with an entrusted Source
       artifact it must refuse, whatever it intended. */
    const tx = fakeTx();
    await expect(
      enqueueVaultErasure(tx.client, workVisualErasureAuthority('test:content'), [SOURCE_PATH]),
    ).rejects.toBeInstanceOf(ErasureAuthorityRefused);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('⛔ authority over one class is not authority over another — Source authority is refused a Work visual', async () => {
    const tx = fakeTx(() => []); // nothing exists → the act completed
    const authority = await mintSourceErasureAuthority(tx.client, 'm-1', 'mem-1', 'test:lifecycle');
    expect(authority).not.toBeNull();
    await expect(
      enqueueVaultErasure(tx.client, authority!, [VISUAL_PATH]),
    ).rejects.toBeInstanceOf(ErasureAuthorityRefused);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('⛔ a namespaceless path is refused rather than destroyed', async () => {
    const tx = fakeTx();
    await expect(
      enqueueVaultErasure(tx.client, workVisualErasureAuthority('test'), ['orphan.png']),
    ).rejects.toBeInstanceOf(ErasureAuthorityRefused);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('refuses the whole batch when any path is outside the authority', async () => {
    /* Partial enqueue would destroy the governed half and silently drop the
       rest — a refusal that half-succeeded is not a refusal. */
    const tx = fakeTx();
    await expect(
      enqueueVaultErasure(tx.client, workVisualErasureAuthority('test'), [VISUAL_PATH, SOURCE_PATH]),
    ).rejects.toBeInstanceOf(ErasureAuthorityRefused);
    expect(tx.inserts()).toHaveLength(0);
  });
});

describe('Source lifecycle authority is evidence, never a request', () => {
  it('⛔ REFUSES while the manuscript still exists — the act has not happened', async () => {
    /* The masquerade this forbids: a content-working path that wants Source
       destruction power without performing the member-directed erasure. */
    const tx = fakeTx((sql) => (/FROM member_manuscripts/.test(sql) ? [{ id: 'm-1' }] : []));
    expect(await mintSourceErasureAuthority(tx.client, 'm-1', 'mem-1', 'test')).toBeNull();
  });

  it('⛔ REFUSES while any arrival row survives — a half-done erasure confers nothing', async () => {
    const tx = fakeTx((sql) =>
      /FROM manuscript_source_arrivals/.test(sql) ? [{ id: 'a-1' }] : [],
    );
    expect(await mintSourceErasureAuthority(tx.client, 'm-1', 'mem-1', 'test')).toBeNull();
  });

  it('grants only after the member-directed deletion has taken both, and then enqueues', async () => {
    /* P9's half: custody that cannot be relinquished is capture, not custody.
       The lifecycle act must still be able to finish. */
    const tx = fakeTx(() => []);
    const authority = await mintSourceErasureAuthority(tx.client, 'm-1', 'mem-1', 'test');
    expect(authority).not.toBeNull();
    const n = await enqueueVaultErasure(tx.client, authority!, [SOURCE_PATH]);
    expect(n).toBe(1);
    expect(tx.inserts()).toHaveLength(1);
    expect(tx.inserts()[0].params[0]).toEqual([SOURCE_PATH]);
  });

  it('enqueues nothing, and touches the database not at all, for an empty batch', async () => {
    const tx = fakeTx(() => []);
    const authority = await mintSourceErasureAuthority(tx.client, 'm-1', 'mem-1', 'test');
    expect(await enqueueVaultErasure(tx.client, authority!, [])).toBe(0);
    expect(tx.inserts()).toHaveLength(0);
  });
});

describe('one governed seam — no runtime path writes the queue directly', () => {
  /* Property A of the ruling, asserted rather than intended. Comment-stripped
     for the ratified C21 reason: a file that DOCUMENTS the banned statement
     must not read as the banned statement returning — this test file and the
     seam itself both name it in prose. */
  const strip = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

  const PRODUCERS = [
    'lib/manuscript/source/eraseManuscript.ts',
    'app/api/sovereign/living-works/[id]/route.ts',
    'app/api/sovereign/living-works/[id]/visual/route.ts',
  ];

  it('every discovered producer goes through the seam, with none grandfathered', () => {
    /* Property E: reconcile all three, do not leave existing direct producers
       as exceptions while new code uses the helper. */
    for (const rel of PRODUCERS) {
      const src = strip(readFileSync(join(REPO, rel), 'utf8'));
      expect(src).toContain('enqueueVaultErasure(');
      expect(src).not.toContain('INSERT INTO vault_erasure_queue');
    }
  });

  it('⛔ the seam is the only writer of the queue in the whole runtime', () => {
    /* The sweep still DELETEs and UPDATEs rows it is finishing; only insertion
       is the authority act, so only insertion is pinned here. */
    const offenders = walk(join(REPO, 'lib')).concat(walk(join(REPO, 'app')))
      .filter((f) => !f.endsWith('lib/storage/erasureAuthority.ts'))
      .filter((f) => !/__tests__/.test(f))
      .filter((f) => /INSERT INTO vault_erasure_queue/.test(strip(readFileSync(f, 'utf8'))));
    expect(offenders).toEqual([]);
  });
});

function walk(dir: string): string[] {
  const { readdirSync, statSync } = require('fs');
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}
