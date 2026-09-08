/**
 * WS-DELETE-01 · S4 (repaired) — negative controls.
 *
 * Founder review 2026-09-08: evidence + locality accepted as the standard, the
 * first implementation refused as its expression. These are NC-12…NC-18 plus the
 * controls that survived, and every one asserts that NOTHING WAS ENQUEUED rather
 * than merely that an error was raised.
 *
 * What these controls can and cannot prove is stated where it matters: they run
 * against a recording transaction client, so they prove the seam's decisions and
 * its statement ordering. They do not prove PostgreSQL's rollback, which is the
 * database's guarantee and is relied upon here rather than re-tested — the point
 * of the repair is that there is no object able to outlive a transaction, which
 * is a structural fact these tests can and do check.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import * as seam from '../erasureAuthority';
import {
  canonicalVaultRef,
  eraseWorkVisualBytes,
  relinquishManuscriptSource,
  ErasureRefused,
  SOURCE_NAMESPACE,
  WORK_VISUAL_NAMESPACE,
} from '../erasureAuthority';

const REPO = join(__dirname, '../../..');

const SOURCE_A = `${SOURCE_NAMESPACE}/aaa-1111.docx`;
const SOURCE_B = `${SOURCE_NAMESPACE}/bbb-2222.docx`;
const VISUAL = `${WORK_VISUAL_NAMESPACE}/cover-1.png`;

/** Records every statement, and answers reads per the scenario given. */
function fakeTx(opts: { arrivals?: string[]; deletes?: boolean; locks?: boolean } = {}) {
  const seen: { sql: string; params: any[] }[] = [];
  const client = {
    query: async (sql: string, params: any[] = []) => {
      seen.push({ sql, params });
      if (/FOR UPDATE/.test(sql)) {
        return { rows: opts.locks === false ? [] : [{ id: 'm-1' }] } as any;
      }
      if (/FROM manuscript_source_arrivals/.test(sql)) {
        return { rows: (opts.arrivals ?? []).map((artifact_ref) => ({ artifact_ref })) } as any;
      }
      if (/DELETE FROM member_manuscripts/.test(sql)) {
        return { rows: opts.deletes ? [{ id: 'm-1' }] : [] } as any;
      }
      return { rows: [] } as any;
    },
  };
  return {
    client,
    seen,
    inserts: () => seen.filter((s) => /INSERT INTO vault_erasure_queue/.test(s.sql)),
    queued: () => seen.filter((s) => /INSERT INTO vault_erasure_queue/.test(s.sql)).flatMap((s) => s.params[0] as string[]),
  };
}

describe('NC-17 · canonical namespace, not a textual prefix', () => {
  it('⛔ traversal that resolves into Source is refused under Work-visual authority', async () => {
    /* The defect the founder found: `namespaceOf()` read the first segment while
       destruction resolves the path, so this string was "work-visuals" to the
       authority and `manuscript-sources` to the filesystem. */
    const tx = fakeTx();
    await expect(
      eraseWorkVisualBytes(tx.client, [`${WORK_VISUAL_NAMESPACE}/../${SOURCE_NAMESPACE}/x.docx`], 'nc17'),
    ).rejects.toBeInstanceOf(ErasureRefused);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('refuses every shape whose meaning could change under resolution', () => {
    for (const bad of [
      `${WORK_VISUAL_NAMESPACE}/../${SOURCE_NAMESPACE}/x.docx`,
      `${WORK_VISUAL_NAMESPACE}/./x.png`,
      `${WORK_VISUAL_NAMESPACE}//x.png`,
      `/${WORK_VISUAL_NAMESPACE}/x.png`,
      `C:\\${WORK_VISUAL_NAMESPACE}\\x.png`,
      `${WORK_VISUAL_NAMESPACE}\\x.png`,
      'loose.png',
      '',
      `${WORK_VISUAL_NAMESPACE}/x\0.png`,
    ]) {
      expect(canonicalVaultRef(bad)).toBeNull();
    }
    expect(canonicalVaultRef(VISUAL)).toEqual({ ref: VISUAL, namespace: WORK_VISUAL_NAMESPACE });
  });

  it('⛔ content work handed a plainly canonical Source path is still refused', async () => {
    const tx = fakeTx();
    await expect(eraseWorkVisualBytes(tx.client, [SOURCE_A], 'nc-content')).rejects.toBeInstanceOf(ErasureRefused);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('refuses the whole batch when any single path is ungoverned', async () => {
    const tx = fakeTx();
    await expect(eraseWorkVisualBytes(tx.client, [VISUAL, SOURCE_A], 'nc-batch')).rejects.toBeInstanceOf(ErasureRefused);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('a governed Work-visual path is enqueued, canonically', async () => {
    const tx = fakeTx();
    expect(await eraseWorkVisualBytes(tx.client, [VISUAL], 'ok')).toBe(1);
    expect(tx.queued()).toEqual([VISUAL]);
  });
});

describe('NC-12 / NC-13 · the transition, not the state', () => {
  it('⛔ NC-12 a nonexistent manuscript relinquishes nothing and enqueues nothing', async () => {
    /* The first implementation minted authority here, because both rows were
       absent. Absence proves a state; only DELETE … RETURNING proves the act. */
    const tx = fakeTx({ arrivals: [], deletes: false });
    const out = await relinquishManuscriptSource(tx.client, 'ghost', 'mem-1', 'nc12');
    expect(out.deleted).toBe(false);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('⛔ NC-13 a manuscript outside the member scope relinquishes nothing', async () => {
    /* Member-scoped in the DELETE predicate, so another member's id returns no
       row: no transition, no authority, nothing enqueued — and the caller is
       never told whether the manuscript exists. */
    const tx = fakeTx({ arrivals: [SOURCE_A], deletes: false });
    const out = await relinquishManuscriptSource(tx.client, 'm-1', 'not-the-owner', 'nc13');
    expect(out.deleted).toBe(false);
    expect(out.refs).toEqual([]);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('the whole order holds: lock → capture → transition → enqueue', async () => {
    /* Every step is load-bearing. The lock first, so the inventory cannot grow
       behind the act's back (NC-19). The capture before the delete, because the
       cascade destroys the rows carrying the refs. The enqueue only after a
       returned row, because a state observed is not a transition performed. */
    const tx = fakeTx({ arrivals: [SOURCE_A], deletes: true });
    await relinquishManuscriptSource(tx.client, 'm-1', 'mem-1', 'order');
    const lockAt = tx.seen.findIndex((s) => /FOR UPDATE/.test(s.sql));
    const readAt = tx.seen.findIndex((s) => /FROM manuscript_source_arrivals/.test(s.sql));
    const deleteAt = tx.seen.findIndex((s) => /DELETE FROM member_manuscripts/.test(s.sql));
    const enqueueAt = tx.seen.findIndex((s) => /INSERT INTO vault_erasure_queue/.test(s.sql));
    expect(lockAt).toBe(0);
    expect(lockAt).toBeLessThan(readAt);
    expect(readAt).toBeLessThan(deleteAt);
    expect(deleteAt).toBeLessThan(enqueueAt);
  });

  it('⛔ NC-19 an unlockable subject stops the act before any inventory', async () => {
    /* The lock is also the existence and ownership test: no row to lock means no
       lifecycle subject, so nothing is inventoried and nothing is deleted. */
    const tx = fakeTx({ arrivals: [SOURCE_A], deletes: true, locks: false });
    const out = await relinquishManuscriptSource(tx.client, 'm-1', 'not-mine', 'nc19-scope');
    expect(out.deleted).toBe(false);
    expect(tx.seen.filter((s) => /DELETE FROM member_manuscripts/.test(s.sql))).toHaveLength(0);
    expect(tx.inserts()).toHaveLength(0);
  });

  it('⛔ NC-19 static: the lock cannot drift below the snapshot', () => {
    /* The database witness proves the lock works; this proves it stays where it
       works. A future edit moving FOR UPDATE beneath the capture would leave
       every single-threaded control green and silently reopen the race. */
    const src = readFileSync(join(REPO, 'lib/storage/erasureAuthority.ts'), 'utf8');
    const body = src.slice(src.indexOf('export async function relinquishManuscriptSource'));
    const lockAt = body.indexOf('FOR UPDATE');
    const captureAt = body.indexOf('FROM manuscript_source_arrivals');
    const deleteAt = body.indexOf('DELETE FROM member_manuscripts');
    const enqueueAt = body.indexOf('enqueue(tx, SOURCE_NAMESPACE');
    expect(lockAt).toBeGreaterThan(-1);
    expect(lockAt).toBeLessThan(captureAt);
    expect(captureAt).toBeLessThan(deleteAt);
    expect(deleteAt).toBeLessThan(enqueueAt);
  });

  it('P9 · a real relinquishment still completes fully', async () => {
    /* Custody that cannot be ended is capture, not custody. */
    const tx = fakeTx({ arrivals: [SOURCE_A, SOURCE_B], deletes: true });
    const out = await relinquishManuscriptSource(tx.client, 'm-1', 'mem-1', 'p9');
    expect(out.deleted).toBe(true);
    expect(out.queued).toBe(2);
    expect(tx.queued()).toEqual([SOURCE_A, SOURCE_B]);
  });
});

describe('NC-14 / NC-15 / NC-16 / NC-18 · nothing to widen, forge, or carry away', () => {
  it('⛔ NC-14 one act cannot reach another manuscript’s Source', async () => {
    /* Only the refs THIS call captured are enqueued. Manuscript B's Source is
       not reachable from A's erasure by any argument, because there is no
       argument — the binding is the query, not a parameter. */
    const tx = fakeTx({ arrivals: [SOURCE_A], deletes: true });
    const out = await relinquishManuscriptSource(tx.client, 'm-A', 'mem-1', 'nc14');
    expect(tx.queued()).toEqual([SOURCE_A]);
    expect(tx.queued()).not.toContain(SOURCE_B);
    expect(out.refs).toEqual([SOURCE_A]);
  });

  it('⛔ NC-15 / NC-16 there is no authority object to fabricate or repurpose', () => {
    /* The repair's whole shape. A capability that does not exist cannot be
       cast into being, mutated from a content authority, or handed to a
       generic enqueue — so these controls are structural rather than
       behavioural, and that is stronger, not weaker. */
    const exported = Object.keys(seam).sort();
    expect(exported).toEqual([
      'ErasureRefused',
      'SOURCE_NAMESPACE',
      'WORK_VISUAL_NAMESPACE',
      'canonicalVaultRef',
      'eraseWorkVisualBytes',
      'relinquishManuscriptSource',
    ]);
    /* No generic enqueue, no mint, no authority type in the runtime surface. */
    expect(exported).not.toContain('enqueueVaultErasure');
    expect(exported.some((k) => /mint|authority/i.test(k) && k !== 'ErasureRefused')).toBe(false);
  });

  it('⛔ NC-18 the outcome is data, and carries no power into another transaction', async () => {
    /* Nothing returned by the operation is accepted by anything as authority:
       the only exported functions take a transaction client, and there is no
       parameter anywhere of an authority type. So an outcome that survives a
       rollback authorizes nothing — there is no second call it could be used
       for. PostgreSQL's rollback of the rows is the database's guarantee and is
       not re-tested here. */
    const tx = fakeTx({ arrivals: [SOURCE_A], deletes: true });
    const out = await relinquishManuscriptSource(tx.client, 'm-1', 'mem-1', 'nc18');
    expect(Object.isFrozen(Object.freeze(out))).toBe(true);
    const src = readFileSync(join(REPO, 'lib/storage/erasureAuthority.ts'), 'utf8');
    expect(src).not.toMatch(/export\s+(async\s+)?function\s+\w+\([^)]*authority/i);
  });
});

describe('one governed seam', () => {
  const strip = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

  const PRODUCERS = [
    'lib/manuscript/source/eraseManuscript.ts',
    'app/api/sovereign/living-works/[id]/route.ts',
    'app/api/sovereign/living-works/[id]/visual/route.ts',
  ];

  it('every producer goes through the seam, with none grandfathered', () => {
    for (const rel of PRODUCERS) {
      const src = strip(readFileSync(join(REPO, rel), 'utf8'));
      expect(src).toMatch(/eraseWorkVisualBytes\(|relinquishManuscriptSource\(/);
      expect(src).not.toContain('INSERT INTO vault_erasure_queue');
    }
  });

  it('⛔ the seam is the only writer of the queue in the whole runtime', () => {
    /* Comment-stripped for the ratified C21 reason: this file and the seam both
       name the statement in prose, and a scan that reads prose as behaviour
       fails on exactly the files documenting their own compliance. */
    const offenders = walk(join(REPO, 'lib'))
      .concat(walk(join(REPO, 'app')))
      .filter((f) => !f.endsWith('lib/storage/erasureAuthority.ts'))
      .filter((f) => !/__tests__/.test(f))
      .filter((f) => /INSERT INTO vault_erasure_queue/.test(strip(readFileSync(f, 'utf8'))));
    expect(offenders).toEqual([]);
  });

  it('⛔ the destructive manuscript transition lives only in the seam', () => {
    /* P7's locality half, asserted here because S4 created the seam that makes
       it true. Reachability — who may CALL it — is PT-3's P7 and is not
       claimed by this test. */
    const offenders = walk(join(REPO, 'lib'))
      .concat(walk(join(REPO, 'app')))
      .filter((f) => !f.endsWith('lib/storage/erasureAuthority.ts'))
      .filter((f) => !/__tests__/.test(f))
      .filter((f) => /DELETE FROM member_manuscripts/.test(strip(readFileSync(f, 'utf8'))));
    expect(offenders).toEqual([]);
  });
});

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}
