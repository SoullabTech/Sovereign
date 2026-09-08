/**
 * WS-WORK-VISUAL-01 — custody doctrine.
 *
 * Founder ruling 2026-09-07: the image belongs to the Living Work, is chosen by
 * the writer, is never generated or selected by MAIA, is private to the Studio,
 * and goes when the Work goes — record AND bytes. A database cascade alone is
 * not enough if the blob survives elsewhere.
 *
 * ⚠️ Comments stripped before scanning (Circles C21): these files document
 * their own prohibitions, so a raw scan finds the banned word inside the
 * sentence banning it.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const read = (...p: string[]) => readFileSync(join(__dirname, '..', ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const MUTATE_RAW = read('route.ts');
const BYTES_RAW = read('bytes', 'route.ts');
const MUTATE = strip(MUTATE_RAW);
const BYTES = strip(BYTES_RAW);
/* Anchored at the repo root rather than counted in '..' segments — a path
   built by hop-counting breaks silently the first time a route moves, and a
   doctrine test that cannot open its subject reports nothing. */
const REPO = join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const ERASE = strip(readFileSync(join(REPO, 'lib/manuscript/source/eraseManuscript.ts'), 'utf8'));
const WITHDRAW = strip(readFileSync(join(__dirname, '..', '..', 'route.ts'), 'utf8'));

describe('ownership is checked against the Work before every mutation', () => {
  it('derives the member from the credential, never the payload', () => {
    expect(MUTATE).toContain('getMemberIdFromRequest');
    expect(MUTATE).not.toMatch(/form\.get\(\s*['"](memberId|member_id|userId)['"]\s*\)/);
    expect(MUTATE).not.toMatch(/searchParams\.get\(\s*['"](memberId|member_id|userId)['"]\s*\)/);
  });

  it('POST proves the Work is this member’s before accepting any bytes', () => {
    /* And BEFORE reading the upload: an unauthorized caller must not be able to
       make the server buffer 8 MB on their behalf. */
    const ownedAt = MUTATE.indexOf('ownedWork(');
    const formAt = MUTATE.indexOf('request.formData()');
    expect(ownedAt).toBeGreaterThan(-1);
    expect(ownedAt).toBeLessThan(formAt);
  });

  it('every statement is member-scoped in its WHERE clause', () => {
    const selects = MUTATE.match(/FROM living_work_visuals[\s\S]{0,160}/g) ?? [];
    expect(selects.length).toBeGreaterThan(0);
    for (const s of selects) expect(s).toContain('member_id = $2');
    expect(BYTES).toContain('member_id = $2');
  });

  it('answers 404, not 403 — a member learns nothing about another’s Work', () => {
    expect(MUTATE).toMatch(/'Not found'[\s\S]{0,60}404/);
    expect(BYTES).toMatch(/'Not found'[\s\S]{0,60}404/);
  });
});

describe('the writer chooses; nothing infers', () => {
  it('⛔ refuses an upload with no kind rather than defaulting one', () => {
    expect(MUTATE).toContain('isKind(kind)');
    expect(MUTATE).toMatch(/if \(!isKind\(kind\)\)[\s\S]{0,240}400/);
    /* No default anywhere: a cover and an inspiration image are different
       claims about the same file. */
    expect(MUTATE).not.toMatch(/kind\s*(\?\?|\|\|)\s*['"]cover['"]/);
    expect(MUTATE).not.toMatch(/kind\s*=\s*['"](cover|inspiration)['"]/);
  });

  it('⛔ nothing generates, suggests or selects an image', () => {
    for (const banned of ['generate', 'suggest', 'maia', 'prompt', 'dall', 'diffusion', 'auto']) {
      expect(MUTATE.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });

  it('⛔ nothing is inferred from the file itself', () => {
    /* Dimensions, aspect ratio and filename are all tempting ways to decide
       "this looks like a cover". None of them is the writer saying so. */
    for (const banned of ['aspect', 'width', 'height', 'dimension', 'sharp(']) {
      expect(MUTATE.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });
});

describe('file safety', () => {
  it('bounds size before buffering the upload', () => {
    expect(MUTATE).toContain('MAX_BYTES');
    expect(MUTATE).toMatch(/file\.size > MAX_BYTES[\s\S]{0,200}413/);
    const sizeAt = MUTATE.indexOf('file.size > MAX_BYTES');
    const bufferAt = MUTATE.indexOf('file.arrayBuffer()');
    expect(sizeAt).toBeLessThan(bufferAt);
  });

  it('accepts only vetted image types, by mime and not by extension', () => {
    expect(MUTATE).toContain('imageExtFromMime(file.type)');
    expect(MUTATE).toMatch(/if \(!ext\)[\s\S]{0,200}415/);
    /* The filename never decides what a file is. */
    expect(MUTATE).not.toMatch(/file\.name[\s\S]{0,40}\.(split|endsWith|match)/);
  });
});

describe('bytes go when the record goes', () => {
  it('replacement enqueues the superseded path INSIDE the transaction', () => {
    /* Outside it, a rollback would owe destruction of an image the Work still
       displays; enqueueing before the commit ties the obligation to the fact. */
    const txAt = MUTATE.indexOf('await transaction(');
    /* WS-DELETE-01 · S4: the raw INSERT moved behind the one governed erasure
       seam. The doctrine is unchanged — the obligation is still tied to the
       commit — so this pins the seam call where it used to pin the SQL. */
    const enqueueAt = MUTATE.indexOf('eraseWorkVisualBytes(');
    expect(txAt).toBeGreaterThan(-1);
    expect(enqueueAt).toBeGreaterThan(txAt);
    expect(MUTATE).toContain('sweepVaultErasureQueue');
  });

  it('removal deletes the row and owes the bytes in one transaction', () => {
    expect(MUTATE).toMatch(/DELETE FROM living_work_visuals[\s\S]{0,200}RETURNING storage_path/);
  });

  it('⛔ deleting a Work does not rely on the cascade to remove bytes', () => {
    /* The cascade takes the ROW. Bytes need the queue, and the path has to be
       read while the row still exists — after the cascade nothing in the
       database knows the file was ever ours. */
    for (const source of [ERASE, WITHDRAW]) {
      expect(source).toContain('living_work_visuals');
      expect(source).toContain('eraseWorkVisualBytes(');
      const readAt = source.indexOf('SELECT storage_path FROM living_work_visuals');
      const deleteAt = source.indexOf('DELETE FROM living_works');
      expect(readAt).toBeGreaterThan(-1);
      expect(deleteAt).toBeGreaterThan(-1);
      expect(readAt).toBeLessThan(deleteAt);
    }
  });

  it('a Work that SURVIVES keeps its image', () => {
    /* eraseManuscript may leave the Work alive when other expressions remain.
       Owing destruction of bytes a live Work still displays would be worse
       than not owing them at all. */
    expect(ERASE).toMatch(/workGone\.rows\.length > 0 && path/);
  });

  it('bytes written for a row that never committed are cleaned up', () => {
    expect(MUTATE).toMatch(/if \(written\) await deleteVaultBytes\(written\)/);
  });
});

describe('private Studio only, in this release', () => {
  it('⛔ mints no public URL and claims no sharing', () => {
    /* ⚠️ CORRECTED. This banned the bare substrings 'public' and 'export',
       which every route file contains as JavaScript keywords — the scanner
       would have failed these files for being routes. The same crude-matching
       failure as C21, wearing different clothes: an over-broad guard is not a
       stricter guard, it is one that has to be weakened or ignored, and the
       weakening is where the real prohibition gets lost.

       So the ban names the ACTUAL mechanisms by which an image would leave the
       member's authenticated session, and only those. */
    const forbidden = [
      /public[A-Za-z]*Url/i,
      /share[A-Za-z]*(Url|Link|Token)/i,
      /signedUrl/i,
      /presign/i,
      /\bcdn\b/i,
      /Cache-Control[^'"`]*public/i,
      /export[A-Za-z]*(Url|Image|Visual)/i,
      /Content-Disposition/i,
    ];
    for (const pattern of forbidden) {
      expect({ pattern: String(pattern), inBytes: pattern.test(BYTES) }).toEqual({
        pattern: String(pattern),
        inBytes: false,
      });
      expect({ pattern: String(pattern), inMutate: pattern.test(MUTATE) }).toEqual({
        pattern: String(pattern),
        inMutate: false,
      });
    }
  });

  it('serves bytes only to the authenticated owner, uncached by shared caches', () => {
    expect(BYTES).toContain('getMemberIdFromRequest');
    expect(BYTES).toMatch(/Cache-Control[\s\S]{0,40}private/);
  });

  it('the comment strip is load-bearing, not decorative', () => {
    /* Proven rather than assumed: these files name their own prohibitions, so
       a raw scan would fail them for documenting compliance. */
    expect(MUTATE_RAW.toLowerCase()).toContain('generated');
    expect(MUTATE.toLowerCase()).not.toContain('generate');
    expect(BYTES_RAW.toLowerCase()).toContain('no public url is ever minted');
    expect(BYTES.toLowerCase()).not.toContain('no public url is ever minted');
  });
});
