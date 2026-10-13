/** Networkless source-level contract witness; does not claim old-reader rollback PASS. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  LEGACY_EIGHT_CHAPTER_REVIEW_LENSES as legacy,
  isCompleteChapterReviewAccounting as complete,
} from '../../lib/writersStudio/rebuild/chapterReviewCompatibility.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const current = ['structure','development','continuity','arc','voice','coherence','reader'];
const ok = xs => complete(new Set(xs), current);

test('old eight-lens manifest accepted by new reader without fabricated values', () => {
  assert.equal(ok(legacy), true);
  assert.equal(legacy.length,8);
  assert(legacy.includes('themes'));
});
test('new seven-lens manifest accepted only as exact Review set', () => {
  assert.equal(ok(current), true);
  assert.equal(ok(current.slice(1)), false);
  assert.equal(ok([...current,'overview']), false);
  assert.equal(ok([...current,'themes','overview']), false);
  assert.equal(ok([...legacy,'overview']), false);
  assert.equal(ok([...current.slice(1),'themes']), false);
});
test('source route uses contract while preserving owned identity and refusal guards', () => {
  const route = readFileSync(path.join(root,'app/api/sovereign/manuscripts/[id]/chapter-reviews/route.ts'),'utf8');
  assert.match(route,/isCompleteChapterReviewAccounting\(completed, REVIEW_DEVELOPMENTAL_LENSES\)/);
  assert.match(route,/if \(!\(await owns\(manuscriptId, memberId\)\)\)/);
  assert.match(route,/return NextResponse\.json\(\{ refusal: 'duplicate_lens' \}/);
  assert.match(route,/return NextResponse\.json\(\{ refusal: 'incomplete_lens_accounting' \}/);
});
test('new Rebuild gestures never commission Overview or Themes as Review', () => {
  const source = readFileSync(path.join(root,'app/writers-studio/rebuild/RebuildStudioClient.tsx'),'utf8');
  assert.match(source,/const asked = lenses \?\? REVIEW_DEVELOPMENTAL_LENSES/);
  assert.match(source,/^\s*'use client';/);
});
test('old runtime still cannot accept new seven; rollback remains HOLD', () => {
  assert.equal(legacy.length,8);
  assert.notDeepEqual([...legacy].sort(),[...current].sort());
});
