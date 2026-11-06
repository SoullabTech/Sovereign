// LISTEN-01 · "Listen to someone" — the performer catalog gate and the playback policy.
// Every law below is paired with a defeat candidate: a plausible, WRONG implementation (the real rule
// list with exactly that one decision removed, or a policy function with one decision flipped). A
// law only counts if the conforming implementation passes it AND its candidate fails it.
// Fixtures are fictional on purpose: no real performer, member or recording appears in these tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PERFORMER_RULES, validatePerformerEntry, validateWith, visiblePerformers, performerClaimLint,
} from '../../lib/listening/performerCatalog.ts';
import { PERFORMER_CATALOG } from '../../lib/listening/performerCatalogData.ts';
import {
  decideOnBusMessage, decideOnFocusSource, decideOnInterruption, decideOnLifecycle, decideOnPlaying,
  decideOnRouteChange, holdsOutput,
} from '../../lib/listening/performerPlaybackPolicy.ts';

const NOW = new Date('2026-11-06T12:00:00Z');
const valid = () => ({
  id: 'fictional-performer-one',
  shelf: 'picks',
  name: 'Fictional Performer One',
  ownWords: 'Slow piano and low synth, recorded live in a room.',
  links: [
    { kind: 'youtube', url: 'https://www.youtube.com/watch?v=FICTIONAL01' },
    { kind: 'site', url: 'https://fictional-performer.example.org/music' },
  ],
  embed: { provider: 'youtube', ref: 'FICTIONAL01' },
  rights: {
    hosting: 'provider-hosted-pointer', embedPermitted: true,
    embedCheckedOn: '2026-11-06', nextCheckBy: '2027-02-06',
    signedOffBy: 'Fictional Signer', signedOffOn: '2026-11-06', lineageHeld: false,
  },
});
const mut = fn => { const e = valid(); fn(e); return e; };

// ------------------------------------------------------------------ the shipped catalog

test('S1 ships an EMPTY catalog: no performer is named before beta and a signer approves one', () => {
  assert.deepEqual([...PERFORMER_CATALOG], []);
  const report = visiblePerformers(PERFORMER_CATALOG, NOW);
  assert.deepEqual(report.visible, []);
  assert.deepEqual(report.rejected, []);
});

test('a fully signed fictional entry passes the reference gate', () => {
  const verdict = validatePerformerEntry(valid(), NOW);
  assert.equal(verdict.ok, true, JSON.stringify(verdict));
  assert.equal(visiblePerformers([valid()], NOW).visible.length, 1);
});

// ------------------------------------------------------------------ falsifiers, each naming its rule

// [ruleId, label, fixture, a reason the reference gate must report]
const FALSIFIERS = [
  ['shape', 'not an object', () => 'a string', 'not-an-object'],
  ['no-provider-metadata', 'a copied provider thumbnail', () => mut(e => { e.thumbnailUrl = 'https://i.ytimg.com/vi/x/hq.jpg'; }), 'unknown-field:thumbnailUrl'],
  ['no-provider-metadata', 'copied provider description inside rights', () => mut(e => { e.rights.description = 'copied'; }), 'unknown-field:rights.description'],
  ['id', 'a malformed id', () => mut(e => { e.id = 'Has Spaces'; }), 'id-invalid'],
  ['shelf', 'the Members shelf (a later slice)', () => mut(e => { e.shelf = 'members'; }), 'shelf-not-admitted'],
  ['credit-name', 'no credited name', () => mut(e => { e.name = '  '; }), 'name-invalid'],
  ['own-words', 'no words of our own', () => mut(e => { e.ownWords = ''; }), 'own-words-missing'],
  ['no-claims-in-our-voice', 'a healing claim in our voice', () => mut(e => { e.ownWords = 'Music that will heal your anxiety.'; }), 'own-words-claim:healing'],
  ['no-claims-in-our-voice', 'an endorsement claim', () => mut(e => { e.ownWords = 'Our official partner this season.'; }), 'own-words-claim:affiliation'],
  ['no-claims-in-our-voice', 'a ranking claim', () => mut(e => { e.ownWords = 'Our most popular artist.'; }), 'own-words-claim:ranking'],
  ['links', 'no links at all', () => mut(e => { e.links = []; }), 'links-missing'],
  ['links', 'a javascript: link', () => mut(e => { e.links[1].url = 'javascript:alert(1)'; }), 'link-invalid:site'],
  ['links', 'a YouTube link on the wrong host', () => mut(e => { e.links[0].url = 'https://evil.example.com/watch?v=x'; }), 'link-invalid:youtube'],
  ['links', 'credentials inside a link', () => mut(e => { e.links[1].url = 'https://user:pw@fictional-performer.example.org/'; }), 'link-invalid:site'],
  ['embed-shape', 'a malformed YouTube id', () => mut(e => { e.embed.ref = 'short'; }), 'embed-invalid'],
  ['rights-present', 'no rights record', () => mut(e => { delete e.rights; }), 'rights-missing'],
  ['pointer-only', 'Soullab-hosted media', () => mut(e => { e.rights.hosting = 'soullab-hosted'; }), 'hosting-not-pointer'],
  ['embed-needs-permission', 'an embed the platform did not permit', () => mut(e => { e.rights.embedPermitted = false; }), 'embed-not-permitted'],
  ['named-human-signer', 'an assistant as signer', () => mut(e => { e.rights.signedOffBy = 'Claude'; }), 'signer-not-a-named-human'],
  ['named-human-signer', 'a placeholder signer', () => mut(e => { e.rights.signedOffBy = 'TBD'; }), 'signer-not-a-named-human'],
  ['dates-valid', 'an impossible sign-off date', () => mut(e => { e.rights.signedOffOn = '2026-02-31'; }), 'signoff-date-invalid'],
  ['not-from-the-future', 'a sign-off dated in the future', () => mut(e => { e.rights.signedOffOn = '2027-01-01'; }), 'signoff-in-future'],
  ['check-not-overdue', 'an overdue next-check date (hidden until re-signed)', () => mut(e => { e.rights.embedCheckedOn = '2026-01-01'; e.rights.nextCheckBy = '2026-06-01'; }), 'check-overdue'],
  ['check-window', 'a next-check date years away', () => mut(e => { e.rights.nextCheckBy = '2030-01-01'; }), 'check-window-too-long'],
  ['lineage-needs-keepers', 'lineage-held music as a spotlight', () => mut(e => { e.rights.lineageHeld = true; }), 'lineage-held-needs-keepers'],
  ['tier-two-grant', 'a Tier 2 card with no grant date', () => mut(e => { e.tierTwo = { grantOnFile: '', ownIntroduction: 'Hello.' }; }), 'grant-date-invalid'],
  ['tier-two-grant', 'a Tier 2 card with no introduction', () => mut(e => { e.tierTwo = { grantOnFile: '2026-11-06', ownIntroduction: '' }; }), 'introduction-missing'],
];

test('the reference gate rejects every falsifier for its named reason', () => {
  for (const [rule, label, fixture, reason] of FALSIFIERS) {
    const verdict = validateWith(PERFORMER_RULES, fixture(), NOW);
    assert.equal(verdict.ok, false, `${rule}: ${label} must be refused`);
    assert.ok(verdict.reasons.includes(reason), `${rule}: ${label} — expected ${reason}, got ${verdict.reasons}`);
  }
});

test('every rule has at least one falsifier (no rule without a witness)', () => {
  const covered = new Set(FALSIFIERS.map(f => f[0]));
  for (const rule of PERFORMER_RULES) assert.ok(covered.has(rule.id), `rule ${rule.id} has no falsifier`);
});

test('LETHALITY: each defeat candidate (the gate minus one rule) is killed by its own falsifier', () => {
  for (const rule of PERFORMER_RULES) {
    const candidate = PERFORMER_RULES.filter(r => r.id !== rule.id);
    const killedBy = FALSIFIERS.filter(([id, , fixture, reason]) => {
      const v = validateWith(candidate, fixture(), NOW);
      // The candidate "survives" a falsifier when it no longer reports that falsifier's reason.
      return id === rule.id && !( !v.ok && v.reasons.includes(reason));
    });
    assert.ok(killedBy.length > 0, `candidate "gate without ${rule.id}" survived every falsifier of that rule`);
  }
});

test('a rule that throws refuses the entry instead of passing it (fail closed)', () => {
  const broken = [...PERFORMER_RULES, { id: 'boom', check: () => { throw new Error('x'); } }];
  const verdict = validateWith(broken, valid(), NOW);
  assert.equal(verdict.ok, false);
  assert.ok(verdict.reasons.includes('rule-error:boom'));
});

test('visiblePerformers hides failures, duplicates and a non-array catalog', () => {
  const overdue = mut(e => { e.id = 'overdue-one'; e.rights.embedCheckedOn = '2026-01-01'; e.rights.nextCheckBy = '2026-06-01'; });
  const dup = valid();
  const report = visiblePerformers([valid(), dup, overdue], NOW);
  assert.deepEqual(report.visible.map(e => e.id), ['fictional-performer-one']);
  assert.deepEqual(report.rejected.map(r => r.reasons[0]).sort(), ['check-overdue', 'duplicate-id']);
  assert.deepEqual(visiblePerformers('nope', NOW).visible, []);
  assert.deepEqual(visiblePerformers(null, NOW).visible, []);
});

test('an entry becomes hidden when its next-check date passes', () => {
  const e = valid();
  assert.equal(visiblePerformers([e], new Date('2027-02-06T12:00:00Z')).visible.length, 1);
  assert.equal(visiblePerformers([e], new Date('2027-02-07T12:00:00Z')).visible.length, 0);
});

test('the claim lint catches condition, treatment and affiliation words and lets plain description through', () => {
  assert.ok(performerClaimLint('Helps with insomnia').includes('condition'));
  assert.ok(performerClaimLint('A featured artist').includes('affiliation'));
  assert.deepEqual(performerClaimLint('Slow piano, recorded live.'), []);
});

// ------------------------------------------------------------------ playback policy + candidates

const POLICY_FALSIFIERS = [
  ['plays only with the lease and no MAIA speech', policy => policy.decideOnPlaying('granted', false) === 'keep'],
  ['pauses when the lease is refused (fail closed)', policy => policy.decideOnPlaying('refused', false) === 'pause'],
  ['pauses when MAIA is speaking even with a lease', policy => policy.decideOnPlaying('granted', true) === 'pause'],
  ['pauses on MAIA, Reader and music preflight from another tab', policy =>
    ['maia-speech-preflight', 'reader-narration-preflight', 'music-preflight']
      .every(type => policy.decideOnBusMessage({ type, tab: 'other' }, 'me') === 'pause')],
  ['ignores its own tab and unknown messages', policy =>
    policy.decideOnBusMessage({ type: 'music-preflight', tab: 'me' }, 'me') === 'ignore' &&
    policy.decideOnBusMessage({ type: 'something-else', tab: 'other' }, 'me') === 'ignore' &&
    policy.decideOnBusMessage(null, 'me') === 'ignore'],
  ['pauses for other sources, ignores its own room', policy =>
    policy.decideOnFocusSource('maia-voice') === 'pause' && policy.decideOnFocusSource('reader-narration') === 'pause' &&
    policy.decideOnFocusSource('writers-listen') === 'pause' && policy.decideOnFocusSource('external') === 'pause' &&
    policy.decideOnFocusSource('listening-room') === 'ignore' && policy.decideOnFocusSource(null) === 'ignore'],
  ['an interruption pauses and its end does nothing', policy =>
    policy.decideOnInterruption({ phase: 'began' }) === 'pause' &&
    policy.decideOnInterruption({ phase: 'ended', shouldResume: true }) === 'none'],
  ['losing the route pauses, a new route does nothing', policy =>
    policy.decideOnRouteChange({ reason: 'oldDeviceUnavailable' }) === 'pause' &&
    policy.decideOnRouteChange({ reason: 'newDeviceAvailable' }) === 'none'],
  ['locking and backgrounding pause, returning never resumes', policy =>
    policy.decideOnLifecycle('didEnterBackground') === 'pause' && policy.decideOnLifecycle('deviceLocking') === 'pause' &&
    policy.decideOnLifecycle('willResignActive') === 'pause' &&
    policy.decideOnLifecycle('didBecomeActive') === 'none' && policy.decideOnLifecycle('willEnterForeground') === 'none' &&
    policy.decideOnLifecycle('deviceUnlocked') === 'none'],
  ['the output lease is held only while playing', policy =>
    policy.holdsOutput('playing') === true &&
    ['unstarted', 'buffering', 'paused', 'ended', 'error', 'closed'].every(s => policy.holdsOutput(s) === false)],
];
const REFERENCE = { decideOnPlaying, decideOnBusMessage, decideOnFocusSource, decideOnInterruption, decideOnLifecycle, decideOnRouteChange, holdsOutput };
// One flipped decision each — "keeps playing without the lease", "ignores the bus", "resumes when an
// interruption ends", "treats coming back to the foreground as a cue to resume", "holds the lease while paused".
const CANDIDATES = {
  'keeps playing when the lease is refused': { ...REFERENCE, decideOnPlaying: () => 'keep' },
  'plays over MAIA when it holds a lease': { ...REFERENCE, decideOnPlaying: lease => (lease === 'granted' ? 'keep' : 'pause') },
  'ignores the preflight bus': { ...REFERENCE, decideOnBusMessage: () => 'ignore' },
  'pauses on its own tab\'s message (a self-pause loop)': { ...REFERENCE, decideOnBusMessage: m => (m && typeof m.type === 'string' && m.type.endsWith('preflight') ? 'pause' : 'ignore') },
  'ignores every focus request': { ...REFERENCE, decideOnFocusSource: () => 'ignore' },
  'resumes when an interruption ends': { ...REFERENCE, decideOnInterruption: e => (e.phase === 'ended' ? 'resume' : 'pause') },
  'starts when a new route appears': { ...REFERENCE, decideOnRouteChange: e => (e.reason === 'oldDeviceUnavailable' ? 'pause' : 'resume') },
  'does not pause on backgrounding': { ...REFERENCE, decideOnLifecycle: () => 'none' },
  'resumes on returning to the foreground': { ...REFERENCE, decideOnLifecycle: label => (label === 'didBecomeActive' ? 'resume' : REFERENCE.decideOnLifecycle(label)) },
  'holds the lease while paused': { ...REFERENCE, holdsOutput: s => s === 'playing' || s === 'paused' },
};

test('the reference policy satisfies every policy falsifier', () => {
  for (const [label, check] of POLICY_FALSIFIERS) assert.equal(check(REFERENCE), true, label);
});

test('LETHALITY: every flipped-decision candidate is killed by at least one policy falsifier', () => {
  for (const [name, candidate] of Object.entries(CANDIDATES)) {
    const killed = POLICY_FALSIFIERS.filter(([, check]) => check(candidate) === false);
    assert.ok(killed.length > 0, `candidate "${name}" survived every falsifier`);
  }
});
