#!/usr/bin/env node
// JARVIS-STAB-07 (module half) — commit identity + the ingestion bracket.
//
// Two edges found by adversarial review of STAB-06:
//
//   1. Prefix matching promoted an abbreviation to an IDENTITY. Seven hex
//      characters are a presentation convenience; git lengthens abbreviations
//      as a repository grows precisely because they stop being unique.
//   2. A TOCTOU window between reading the head and finishing the write could
//      record a receipt as CURRENT for a base that stopped being current
//      DURING the operation recording it.
//
// Real git throughout, except the AMBIGUOUS path. Producing a genuine
// 4-character collision takes ~700 commits and ~40 seconds — reproducible, but
// not at suite speed — so that one case uses the resolver's injectable `exec`
// to reproduce git's own stderr. Stated rather than glossed: it is the one
// assertion here that does not touch a real repository.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const require = createRequire(import.meta.url);
const SHA = require(path.join(DESKTOP, 'src', 'sha-resolve.js'));
const RECEIPT = require(path.join(DESKTOP, 'src', 'evidence-receipt.js'));
const PS = require(path.join(DESKTOP, 'src', 'programme-state.js'));

let failures = 0;
const report = (n, ok, extra) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${extra && !ok ? `\n        ${extra}` : ''}`); };
const phase = (n) => console.log(`\n── ${n} ${'─'.repeat(Math.max(0, 60 - n.length))}`);

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-id-'));
const REPO = path.join(TMP, 'tree');
fs.mkdirSync(REPO, { recursive: true });
execFileSync('git', ['init', '-q', REPO]);
const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
git('config', 'user.email', 'proof@local'); git('config', 'user.name', 'proof');
git('commit', '-q', '--allow-empty', '-m', 'A');
const A_FULL = git('rev-parse', 'HEAD'); const A = git('rev-parse', '--short', 'HEAD');
git('commit', '-q', '--allow-empty', '-m', 'B');
const B_FULL = git('rev-parse', 'HEAD'); const B = git('rev-parse', '--short', 'HEAD');
const resolve = SHA.makeResolver(REPO);

phase('1  an abbreviation is not an identity');
report('a short SHA resolves to its canonical 40-char id', resolve(A).full === A_FULL, JSON.stringify(resolve(A)));
report('a full SHA resolves to itself', resolve(A_FULL).full === A_FULL);
report('short and full are the SAME commit', SHA.compareIdentity(A, A_FULL, resolve).verdict === 'SAME');
report('two real commits are DIFFERENT', SHA.compareIdentity(A, B, resolve).verdict === 'DIFFERENT');
report('the comparison is on full ids, not prefixes',
  SHA.compareIdentity(A, A_FULL, resolve).left.full === SHA.compareIdentity(A, A_FULL, resolve).right.full);

phase('2  refs and expressions are refused as bases');
for (const bad of ['main', 'HEAD', 'HEAD~2', 'v1.0', 'not a sha', '', 'abc']) {
  report(`refused as a base identity: ${JSON.stringify(bad)}`, resolve(bad).outcome === 'MALFORMED', resolve(bad).outcome);
}
report('a moving ref cannot silently re-point evidence',
  SHA.compareIdentity('main', A, resolve).verdict === 'UNKNOWN');

phase('3  unresolvable and ambiguous are UNKNOWN — never SAME');
report('an unknown commit is UNKNOWN', resolve('deadbeef').outcome === 'UNKNOWN');
report('no repository is NO_REPO, not a silent pass', SHA.makeResolver(null)(A).outcome === 'NO_REPO');
report('unknown never collapses to SAME', SHA.compareIdentity('deadbeef', A, resolve).verdict === 'UNKNOWN');
report('unknown never collapses to DIFFERENT either', SHA.compareIdentity('deadbeef', A, resolve).verdict !== 'DIFFERENT');
{
  // The one injected case — git's own ambiguity stderr, reproduced.
  const ambiguousExec = () => { const e = new Error('fatal: ambiguous argument'); e.stderr = "error: short object ID 258e is ambiguous\nfatal: ambiguous argument"; throw e; };
  const r = SHA.makeResolver(REPO, { exec: ambiguousExec })('258e');
  report('an AMBIGUOUS abbreviation is reported as ambiguous, not guessed', r.outcome === 'AMBIGUOUS', JSON.stringify(r));
  report('and it does not become an identity',
    SHA.compareIdentity('258e', A, SHA.makeResolver(REPO, { exec: ambiguousExec })).verdict === 'UNKNOWN');
}

phase('4  lineage: malformed is a defect, unresolvable is an unknown');
const run = { run_id: 'r-aaaaaaaaaa', handoff: { bases: { candidate_sha: A } } };
const R = (base) => RECEIPT.validateReceipt({ run_id: run.run_id, claim: 'c', non_claim: 'n', base_sha: base }, run, { resolve }).violations.map((v) => v.code);
report('a ref in base_sha is REFUSED as malformed', R('main').includes('BASE_SHA_MALFORMED'));
report('a different real commit is REFUSED as a mismatch', R(B).includes('BASE_MISMATCH'));
report('the correct base, abbreviated differently, is accepted', R(A_FULL).length === 0, R(A_FULL).join(','));
report('an unresolvable-but-well-formed base is NOT refused', R('deadbeef').length === 0, R('deadbeef').join(','));
report('…it becomes UNVERIFIED currency instead',
  RECEIPT.applyReceipt(run, { run_id: run.run_id, claim: 'c', non_claim: 'n', base_sha: 'deadbeef' }, { current_base: A, resolve })
    .run.evidence.currency === 'UNVERIFIED');

phase('5  the ingestion bracket');
const VALID = { run_id: run.run_id, claim: 'the work was done', non_claim: 'not observed in production', base_sha: A_FULL };
const provisional = RECEIPT.applyReceipt(run, VALID, { current_base: A, resolve });
report('classification starts UNCONFIRMED', provisional.run.evidence.currency_confirmed === false);
report('and DISPLAYS as UNCONFIRMED, not as its provisional value',
  provisional.run.evidence.currency === 'CURRENT' && RECEIPT.describeEvidence(provisional.run).currency === 'UNCONFIRMED');
report('an unconfirmed record blocks the programme',
  RECEIPT.reconciliationBlockers(provisional.run, PS)[0].id === 'evidence:currency_unconfirmed');

const still = RECEIPT.confirmCurrency(provisional.run, { base_before: A, base_after: A, resolve });
report('a stable head confirms CURRENT', still.evidence.currency === 'CURRENT' && still.evidence.currency_confirmed === true);
report('and clears the blocker', RECEIPT.reconciliationBlockers(still, PS).length === 0);

const raced = RECEIPT.confirmCurrency(provisional.run, { base_before: A, base_after: B, resolve });
report('a head that moved DURING ingestion denies current standing', raced.evidence.currency === 'UNVERIFIED', raced.evidence.currency);
report('the evidence itself is PRESERVED — the worker did nothing wrong',
  raced.evidence.claim === VALID.claim && raced.evidence.non_claim === VALID.non_claim);
report('the race is recorded with both heads',
  raced.evidence.ingestion_race.base_before === A && raced.evidence.ingestion_race.base_after === B);
report('and raises a concrete reconciliation blocker',
  RECEIPT.reconciliationBlockers(raced, PS)[0].id === 'evidence:ingestion_race'
  && PS.isConcreteCondition(RECEIPT.reconciliationBlockers(raced, PS)[0].condition));
report('the programme cannot advance on raced evidence',
  PS.deriveProgrammeState({ blockers: RECEIPT.reconciliationBlockers(raced, PS) }).state === 'HOLD');

phase('6  confirmation can only ever downgrade');
const hist = RECEIPT.applyReceipt(run, VALID, { current_base: B, resolve });
report('drift is HISTORICAL before confirmation', hist.run.evidence.currency === 'HISTORICAL');
report('a stable head does NOT upgrade it to CURRENT',
  RECEIPT.confirmCurrency(hist.run, { base_before: B, base_after: B, resolve }).evidence.currency === 'HISTORICAL');
report('a race does NOT upgrade it either',
  RECEIPT.confirmCurrency(hist.run, { base_before: B, base_after: A, resolve }).evidence.currency === 'HISTORICAL');
report('an unreadable head across the bracket is UNVERIFIED, not CURRENT',
  RECEIPT.confirmCurrency(provisional.run, { base_before: A, base_after: null, resolve }).evidence.currency === 'UNVERIFIED');
report('a run with no handoff is NOT_APPLICABLE, and confirms trivially',
  RECEIPT.confirmCurrency(
    RECEIPT.applyReceipt({ run_id: 'r-bbbbbbbbbb' }, { run_id: 'r-bbbbbbbbbb', claim: 'c', non_claim: 'n' }, { resolve }).run,
    { base_before: A, base_after: B, resolve }).evidence.currency === 'NOT_APPLICABLE');

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
