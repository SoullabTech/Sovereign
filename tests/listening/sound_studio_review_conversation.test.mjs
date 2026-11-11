// LISTEN-01 phase 1: the Sound Studio review conversation. The guide is not MAIA, saves nothing until the
// reviewer confirms, keeps the transcript only on opt-in, and is reachable only by the named beta.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MAX_LINES, MAX_MESSAGES, PAUSE_TOKEN, REVIEW_CONSENT_VERSION, REVIEWABLE_WORKS, SUPPORT_MESSAGE,
  guideSystemPrompt, guideUserInput, isReviewableWork, isUuid, openingQuestion, parseGuideReply, parseSummary,
  summarySystemPrompt, validateLines, validateSaveRequest, validateTranscript,
} from '../../lib/listening/soundStudioReview.ts';
import { buildSynthesisInputs, parseThemes, synthesisUserInput } from '../../lib/listening/soundStudioReviewSynthesis.ts';
import { checkAccess, matchRule } from '../../config/accessMatrix.ts';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const code = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const G = t => ({ role: 'guide', text: t });
const R = t => ({ role: 'reviewer', text: t });

test('reviewable works are exactly the five manifests', () => {
  const ids = fs.readdirSync(path.join(root, 'lib/listening/manifests')).filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(read(`lib/listening/manifests/${f}`)).experienceId).sort();
  assert.deepEqual(Object.keys(REVIEWABLE_WORKS).sort(), ids);
  assert.equal(isReviewableWork('open-ground-432-v1'), true);
  assert.equal(isReviewableWork('constructor'), false);
  assert.equal(isReviewableWork('__proto__'), false);
  assert.match(openingQuestion('open-ground-432-v1'), /Open Ground/);
});

test('transcripts must alternate guide/reviewer, start with the guide, end where expected, and stay in bounds', () => {
  assert.deepEqual(validateTranscript([G('q'), R('a')], 'reviewer'), [G('q'), R('a')]);
  assert.equal(validateTranscript([G('q'), R('a')], 'guide'), null);
  assert.equal(validateTranscript([R('a')], 'reviewer'), null);
  assert.equal(validateTranscript([G('q'), G('q2')], 'guide'), null);
  assert.equal(validateTranscript([G('q'), { role: 'reviewer', text: 'a', extra: 1 }], 'reviewer'), null);
  assert.equal(validateTranscript([G('q'), R('   ')], 'reviewer'), null);
  assert.equal(validateTranscript([G('q'), R('x'.repeat(2001))], 'reviewer'), null);
  const long = Array.from({ length: MAX_MESSAGES + 2 }, (_, i) => (i % 2 ? R('a') : G('q')));
  assert.equal(validateTranscript(long, 'reviewer'), null);
  assert.equal(validateTranscript('nope', 'reviewer'), null);
});

test('the guide prompt names itself, refuses to be MAIA, avoids health claims and carries the pause rule', () => {
  const p = guideSystemPrompt('open-ground-432-v1', 'An original composition.');
  assert.match(p, /NOT MAIA/);
  assert.match(p, /ONE short, open, non-leading question/);
  assert.match(p, /Never ask about health, healing, therapy, brainwaves/);
  assert.ok(p.includes(PAUSE_TOKEN));
  assert.match(guideUserInput([G('q'), R('a')]), /REVIEWER: a/);
  assert.match(summarySystemPrompt(), /Use ONLY what the REVIEWER said/);
});

test('guide replies: the pause token always becomes the fixed support message; markup is stripped', () => {
  assert.deepEqual(parseGuideReply(`ok ${PAUSE_TOKEN}`), { kind: 'paused', text: SUPPORT_MESSAGE });
  assert.equal(parseGuideReply('What about the ending? [[X]]').text, 'What about the ending?');
  assert.equal(parseGuideReply('').kind, 'question');
  assert.ok(parseGuideReply('x'.repeat(2000)).text.length <= 600);
  assert.match(SUPPORT_MESSAGE, /Nothing from this conversation has been saved/);
});

test('summary parsing and line validation fail closed', () => {
  assert.deepEqual(parseSummary('{"lines":[{"kind":"suggestion","text":"Lower the drone"}]}'), [{ kind: 'suggestion', text: 'Lower the drone' }]);
  assert.deepEqual(parseSummary('garbage'), []);
  assert.deepEqual(parseSummary('{"lines":[{"kind":"diagnosis","text":"x"}]}'), []);
  assert.equal(validateLines([]), null);
  assert.equal(validateLines(Array.from({ length: MAX_LINES + 1 }, () => ({ kind: 'observation', text: 'a' }))), null);
  assert.equal(validateLines([{ kind: 'observation', text: 'a', who: 'x' }]), null);
});

test('saving requires the current consent, a reviewable work and confirmed lines; transcript only on opt-in', () => {
  const base = { workId: 'open-ground-432-v1', lines: [{ kind: 'observation', text: 'Warm low end' }], consentVersion: REVIEW_CONSENT_VERSION };
  const ok = validateSaveRequest(base);
  assert.equal(ok.transcript, null);
  assert.equal(validateSaveRequest({ ...base, consentVersion: 'old' }), null);
  assert.equal(validateSaveRequest({ ...base, workId: 'unknown' }), null);
  assert.equal(validateSaveRequest({ ...base, memberId: 'x' }), null, 'no identity claims from the client');
  assert.equal(validateSaveRequest({ ...base, origin: 'maia_bridge' }), null, 'phase 1 never writes the bridge origin');
  assert.equal(validateSaveRequest({ ...base, transcript: [G('q'), R('a')] }).transcript, null, 'transcript ignored without opt-in');
  assert.deepEqual(validateSaveRequest({ ...base, keepTranscript: true, transcript: [G('q'), R('a')] }).transcript, [G('q'), R('a')]);
  assert.equal(validateSaveRequest({ ...base, keepTranscript: true }), null);
  assert.equal(validateSaveRequest({ ...base, keepTranscript: 'yes' }), null);
  assert.equal(validateSaveRequest({ ...base, elapsedMs: -1 }), null);
  assert.equal(isUuid('5b4c7c1e-1d2f-4a3b-9c8d-7e6f5a4b3c2d'), true);
  assert.equal(isUuid("1' OR '1'='1"), false);
});

test('synthesis sends only lines under anonymous refs, and drops themes citing unknown refs', () => {
  const inputs = buildSynthesisInputs([{ workTitle: 'Open Ground', lines: [{ kind: 'experience', text: 'Calm' }] }]);
  assert.deepEqual(inputs.map(i => i.ref), ['L1']);
  assert.equal(synthesisUserInput(inputs), 'L1 [Open Ground · experience] Calm');
  const themes = parseThemes('{"themes":[{"title":"Calm","summary":"s","refs":["L1","L9"]},{"title":"Ghost","summary":"s","refs":["L7"]}]}', inputs);
  assert.deepEqual(themes, [{ title: 'Calm', summary: 's', refs: ['L1'] }]);
  const route = code(read('app/api/admin/monitor/sound-studio-reviews/route.ts'));
  assert.doesNotMatch(route, /SELECT[^;]*r\.transcript\b(?!\s+IS NOT NULL)/, 'transcripts are never selected for the panel');
  assert.ok(route.indexOf('checkAdminAuth') < route.indexOf('loadReviews(null)'));
});

test('every review route gates on flag + session + named beta before anything else, and touches no MAIA memory', () => {
  const routes = ['app/api/listen/review/route.ts', 'app/api/listen/review/turn/route.ts',
    'app/api/listen/review/summary/route.ts', 'app/api/listen/review/[id]/route.ts'];
  for (const file of routes) {
    const src = code(read(file));
    const gate = src.indexOf('await requireListenReviewer()');
    assert.ok(gate > 0, `${file} gates`);
    for (const later of ['request.json', 'query(', 'generateWithClaude(', 'context.params']) {
      const at = src.indexOf(later);
      if (at >= 0) assert.ok(at > gate, `${file}: ${later} after the gate`);
    }
    assert.doesNotMatch(src, /lib\/memory|MemoryBundle|developmental|spiralState|maiaService|sovereign\/app\/maia/i, `${file} has no MAIA memory or cognition path`);
  }
  const gateSrc = code(read('lib/listening/listenReviewerGate.ts'));
  assert.ok(gateSrc.indexOf('soundStudioMediaEnabled') < gateSrc.indexOf('requireMemberId()'));
  assert.ok(gateSrc.indexOf('requireMemberId()') < gateSrc.indexOf('hasListenBetaAccess(memberId)'));
  const list = code(read('app/api/listen/review/route.ts'));
  assert.match(list, /WHERE member_id = \$1/);
  assert.match(list, /'review_guide'/);
  assert.doesNotMatch(list, /maia_bridge/);
  assert.match(code(read('app/api/listen/review/[id]/route.ts')), /WHERE id = \$1 AND member_id = \$2/);
});

test('the table holds confirmed lines only, transcript nullable, member-deletable, additive', () => {
  const sql = read('database/migrations/20261109000001_sound_studio_reviews.sql');
  assert.match(sql, /SET LOCAL lock_timeout/);
  assert.match(sql, /REFERENCES members\(id\) ON DELETE CASCADE/);
  assert.match(sql, /transcript\s+JSONB CHECK \(transcript IS NULL OR/);
  assert.match(sql, /jsonb_array_length\(lines\) BETWEEN 1 AND 12/);
  assert.doesNotMatch(sql.replace(/ON DELETE CASCADE/g, ''), /\b(DROP|ALTER TABLE|UPDATE|DELETE)\b/);
  // Scan executable SQL only: the header comment documents the absence of telemetry and must not read as its presence.
  const executable = sql.replace(/--.*$/gm, '').replace(/COMMENT ON[\s\S]*?;/g, '');
  assert.doesNotMatch(executable, /listen(ed|ing)_(seconds|events|duration)|dwell|skip/i, 'no listening telemetry columns');
});

test('review API routes are mapped for members only; the panel discloses the model and the guide is labelled not MAIA', () => {
  for (const p of ['/api/listen/review', '/api/listen/review/turn', '/api/listen/review/summary', '/api/listen/review/5b4c7c1e-1d2f-4a3b-9c8d-7e6f5a4b3c2d']) {
    assert.ok(matchRule(p), p);
    assert.equal(checkAccess(p, 'free', [], false).allowed, false, p);
  }
  assert.equal(matchRule('/api/listen/reviewer'), null);
  const ui = read('app/listen/SoundStudioReview.tsx');
  assert.match(ui, /NOT MAIA/);
  assert.match(ui, /sent to Claude \(Anthropic\)/);
  assert.match(ui, /only the summary lines you check and confirm/);
});
