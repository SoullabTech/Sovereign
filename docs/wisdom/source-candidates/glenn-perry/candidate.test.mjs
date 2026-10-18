/**
 * Offline, deterministic integrity checks for the Glenn Perry wisdom candidate.
 *
 * Invocation (from repo root):
 *   node --test docs/wisdom/source-candidates/glenn-perry/candidate.test.mjs
 *
 * No network, member records, model invocations, embeddings or production writes.
 * These checks do NOT certify author rights or scholarly accuracy; the review
 * and authorization gates remain separate.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const current = dirname(fileURLToPath(import.meta.url));
const root = resolve(current, '../../../..');
const read = (name) => readFileSync(join(current, name), 'utf8');
const parsed = (name) => JSON.parse(read(name));

test('file-level frontmatter refuses retrieval and declares human review', () => {
  for (const file of ['README.md', 'editorial-reading-guide.md', 'soullab-original-teaching-candidate.md']) {
    const text = read(file);
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, file + ' missing YAML frontmatter');
    assert.match(frontmatter[1], /^status: review$/m, file);
    assert.match(frontmatter[1], /^safe_for_retrieval: false$/m, file);
    assert.match(frontmatter[1], /^authority: derivative$/m, file);
    assert.doesNotMatch(frontmatter[1], /^safe_for_retrieval: true$/m, file);
  }
});

test('manifest is a denied source registry, not an ingestion permission', () => {
  const manifest = parsed('sources.json');
  assert.equal(manifest.status, 'review_only_not_admitted');
  for (const key of ['safe_for_retrieval', 'admitted_to_corpus', 'embedding_allowed',
    'training_allowed', 'auto_ingest_allowed', 'production_retrieval_enabled']) {
    assert.equal(manifest.flags[key], false, key + ' must fail closed');
  }
  assert.equal(manifest.books_read_or_processed, false);
  assert.equal(manifest.source_texts_reproduced, false);
  assert.equal(manifest.proposed_corpus_frontmatter.safe_for_retrieval, false);
  assert.equal(manifest.proposed_corpus_frontmatter.status, 'review');
});

test('exactly two book metadata records and nine author essay links', () => {
  const manifest = parsed('sources.json');
  assert.equal(manifest.references.length, 11);
  assert.equal(manifest.references.filter((r) => r.type === 'book').length, 2);
  assert.equal(manifest.references.filter((r) => r.type === 'author_essay').length, 9);
  const ids = new Set(), urls = new Set();
  for (const ref of manifest.references) {
    assert.ok(ref.id && ref.title && ref.author === 'Glenn Perry, Ph.D.');
    assert.equal(new URL(ref.url).hostname, 'aaperry.com');
    assert.ok(!ids.has(ref.id), 'duplicate reference id ' + ref.id);
    assert.ok(!urls.has(ref.url), 'duplicate source URL ' + ref.url);
    ids.add(ref.id);
    urls.add(ref.url);
    for (const flag of ['full_text_stored', 'excerpt_stored', 'embedding_allowed',
      'model_training_allowed', 'full_text_retrieval_allowed']) {
      assert.equal(ref[flag], false, ref.id + ': ' + flag);
    }
    assert.equal(ref.rights_for_text_processing, 'unverified_requires_permission');
    assert.ok(!Object.hasOwn(ref, 'full_text'), 'accidental copyrighted body in reference');
  }
});

test('edition metadata holds conflicting book listings open for physical confirmation', () => {
  const manifest = parsed('sources.json');
  const editions = manifest.edition_custody;
  assert.equal(editions.status, 'unresolved_exact_edition_not_claimed');
  assert.ok(editions.instruction.includes('owned copies'));
  const countFor = (id) => editions.book_variants.filter((r) => r.id === id).length;
  assert.ok(countFor('perry-intro-book') >= 2);
  assert.ok(countFor('perry-depth-book') >= 2);
  assert.ok(editions.book_variants.some((r) => r.id === 'perry-intro-book' && r.page_count === 376));
  assert.ok(editions.book_variants.some((r) => r.id === 'perry-intro-book' && r.page_count === 386));
});

test('claim-level custody distinguishes Perry proposals from Soullab choices', () => {
  const ledger = parsed('claims.json');
  const allowed = new Set(['perry_proposition', 'soullab_editorial_choice']);
  const sources = new Set(parsed('sources.json').references.map((r) => r.id));
  assert.equal(ledger.status, 'review_only_not_admitted');
  assert.ok(ledger.claims.length >= 12);
  const ids = new Set();
  for (const claim of ledger.claims) {
    assert.ok(allowed.has(claim.claim_origin), claim.id);
    assert.ok(claim.epistemic_kind && claim.safe_example && claim.unsafe_example);
    assert.ok(claim.summary && !ids.has(claim.id));
    ids.add(claim.id);
    for (const id of claim.reference_ids) assert.ok(sources.has(id), 'unknown reference ' + id);
    assert.equal(claim.source_text_stored, false);
    assert.equal(claim.member_data_stored, false);
    assert.equal(claim.ready_for_member_retrieval, false);
    assert.equal(claim.requires_founder_review, true);
  }
  assert.ok(ledger.claims.some((c) => c.id === 'life_story'
    && c.claim_origin === 'perry_proposition'
    && c.epistemic_kind.includes('teleological')));
  assert.ok(ledger.claims.some((c) => c.id === 'no_fate_claim'
    && c.claim_origin === 'soullab_editorial_choice'));
});

test('original Soullab teaching remains optional, attributed, and unpublished', () => {
  const teaching = read('soullab-original-teaching-candidate.md');
  assert.match(teaching, /^safe_for_retrieval: false$/m);
  assert.match(teaching, /^status: review$/m);
  assert.ok(teaching.includes("pending Kelly's approval"));
  for (let n=1; n<=7; n++) assert.ok(teaching.includes('### ' + n + '.'));
  assert.equal((teaching.match(/## Fictional demonstration:/g) || []).length, 3);
  assert.ok(teaching.includes('not established causal scientific facts'));
  assert.ok(teaching.includes("Soullab's member-centered adaptation"));
  assert.ok(teaching.includes('No chart may be used') || teaching.includes('cannot diagnose psychiatric disorders'));
  const registry = parsed('sources.json');
  const knownUrls = new Set([
    ...registry.references.map((r) => r.url),
    ...registry.wisdom_keeper_discovery.resources.map((r) => r.url),
  ]);
  const urls = new Set(teaching.match(/https:\/\/(?:aaperry\.com|astropsychology\.org)\/[^)\s]+/g) || []);
  assert.ok(urls.size >= 8);
  for (const url of urls) assert.ok(knownUrls.has(url), 'undeclared linked source: ' + url);
  assert.ok(teaching.includes('Read and study with the original author'));
  assert.ok(teaching.includes('no affiliation, endorsement, text-embedding permission'));
});

test('fictional acceptance prompts cover positive and fail-closed behavior', () => {
  const scenarios = parsed('acceptance-cases.json');
  assert.equal(scenarios.status, 'fictional_only_review_never_automatically_forward_to_model');
  assert.equal(scenarios.requires_external_model_calls, false);
  assert.ok(scenarios.tests.length >= 12);
  const ids = new Set(scenarios.tests.map((t) => t.id));
  assert.equal(ids.size, scenarios.tests.length);
  const sourceIds = new Set(parsed('sources.json').references.map((s) => s.id));
  for (const c of scenarios.tests) {
    assert.ok(c.fictional_prompt && c.required_behaviors.length >= 1);
    assert.ok(c.prohibited_behaviors.length >= 1);
    assert.equal(c.kind, 'human_review_criteria_not_autogenerated_response');
    for (const ref of c.reference_ids) assert.ok(sourceIds.has(ref), 'unknown source ' + ref);
  }
  assert.ok(scenarios.tests.some((c) => c.prohibited_behaviors.includes('diagnose_from_chart')));
  assert.ok(scenarios.tests.some((c) => c.prohibited_behaviors.includes('bulk_ingest_copyrighted_books')));
  assert.ok(scenarios.tests.some((c) => c.prohibited_behaviors.includes('store_member_story')));
});

test('governed AIN admission declaration does not admit a staged Perry candidate', () => {
  const declaration = JSON.parse(readFileSync(join(root, 'data/ain/corpus-admission.json'), 'utf8'));
  for (const rel of [
    'docs/wisdom/source-candidates/glenn-perry/README.md',
    'docs/wisdom/source-candidates/glenn-perry/editorial-reading-guide.md',
  ]) {
    const rule = declaration.rules.find((rule) => {
      const prefix = rule.prefix.replace(/\\/g, '/').replace(/\/+$/, '');
      return rel === prefix || rel.startsWith(prefix + '/');
    });
    assert.equal(rule, undefined, rel + ' unexpectedly admitted by corpus declaration');
  }
});

test('the editorial guide explicitly preserves interpretation, privacy, and rights boundaries', () => {
  const guide = read('editorial-reading-guide.md');
  for (const expected of ['Calculated facts', 'Named symbolic tradition',
    'Whole-chart synthesis', 'Possible human expression',
    'Present activation', 'Member meaning', 'not an established causal',
    'not admit', 'No primary book or essay body']) {
    assert.ok(guide.toLowerCase().includes(expected.toLowerCase()), 'missing guard phrase: ' + expected);
  }
});
