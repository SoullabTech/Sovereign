import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  FOCUS_CHANNEL_CANDIDATES,
  FOCUS_CHANNEL_CATALOG_FORMAT,
  FOCUS_CHANNEL_EVIDENCE_FORMAT,
  FOCUS_CHANNEL_EXCLUDED_USES,
  FOCUS_CHANNEL_IDS,
  FOCUS_CHANNEL_MEDIA_AUTHORITY,
  FOCUS_CHANNEL_PLAYBACK_STATE,
  FOCUS_CHANNEL_RIGHTS_RECEIPTS,
  FOCUS_CHANNEL_SESSION_ARCS,
  assessFocusChannelEvidence,
  emptyFocusChannelEvidence,
  focusChannelById,
} from '../../lib/listening/focusChannelCatalog.ts';
import {
  FOCUS_MUSICAL_WORLDS,
  FOCUS_NEEDS,
  FOCUS_STIMULATION_LEVELS,
  FOCUS_TASK_KINDS,
} from '../../lib/listening/focusFieldSession.ts';

const root = path.resolve(import.meta.dirname, '../..');
const source = fs.readFileSync(path.join(root, 'lib/listening/focusChannelCatalog.ts'), 'utf8');
const NOW = '2026-10-26T16:00:00.000Z';

function completeEvidence(channelId) {
  return {
    format: FOCUS_CHANNEL_EVIDENCE_FORMAT,
    channelId,
    media: {
      sha256: 'a'.repeat(64),
      bytes: 125_000_000,
      format: 'flac',
      sampleRateHz: 48000,
      bitDepth: 24,
      durationSeconds: 50 * 60,
    },
    receipts: FOCUS_CHANNEL_RIGHTS_RECEIPTS.map(kind => ({
      kind,
      state: 'verified',
      evidenceRef: `opaque:${channelId}:${kind}`,
      verifiedAt: '2026-10-26T15:00:00.000Z',
      expiresAt: '2027-10-26T15:00:00.000Z',
    })),
  };
}

test('the first production set contains exactly the eight founder-ratified channel identities', () => {
  assert.deepEqual([...FOCUS_CHANNEL_IDS], [
    'deep-classical',
    'piano-concentration',
    'ambient-stillness',
    'cinematic-momentum',
    'organic-attention',
    'downtempo-flow',
    'nature-current',
    'high-stimulation-focus',
  ]);
  assert.deepEqual(FOCUS_CHANNEL_CANDIDATES.map(channel => channel.title), [
    'Deep Classical',
    'Piano Concentration',
    'Ambient Stillness',
    'Cinematic Momentum',
    'Organic Attention',
    'Downtempo Flow',
    'Nature Current',
    'High-Stimulation Focus',
  ]);
  assert.equal(new Set(FOCUS_CHANNEL_CANDIDATES.map(channel => channel.id)).size, 8);
  assert.equal(new Set(FOCUS_CHANNEL_CANDIDATES.map(channel => channel.title)).size, 8);
});

test('the eight channels cover every admitted musical world while keeping focus need independent', () => {
  const worlds = new Set(FOCUS_CHANNEL_CANDIDATES.map(channel => channel.musicalWorld));
  assert.deepEqual([...FOCUS_MUSICAL_WORLDS].filter(world => !worlds.has(world)), []);
  for (const channel of FOCUS_CHANNEL_CANDIDATES) {
    assert.equal(channel.format, FOCUS_CHANNEL_CATALOG_FORMAT);
    assert.ok(channel.focusNeeds.length >= 2);
    assert.ok(channel.focusNeeds.every(need => FOCUS_NEEDS.includes(need)));
    assert.ok(channel.taskKinds.length >= 3);
    assert.ok(channel.taskKinds.every(task => FOCUS_TASK_KINDS.includes(task)));
    assert.ok(channel.stimulation.length >= 1);
    assert.ok(channel.stimulation.every(level => FOCUS_STIMULATION_LEVELS.includes(level)));
    assert.ok(channel.stimulation.includes(channel.defaultStimulation));
  }
  assert.deepEqual(focusChannelById('deep-classical').focusNeeds, ['deep', 'steady']);
  assert.deepEqual(focusChannelById('high-stimulation-focus').focusNeeds, ['activate', 'steady']);
});

test('every channel protects human authorship, quiet starts and artist-controlled variation', () => {
  for (const channel of FOCUS_CHANNEL_CANDIDATES) {
    assert.equal(channel.production.humanAuthoredRequired, true);
    assert.equal(channel.production.lexicalVocals, 'none');
    assert.equal(channel.production.suddenEvents, 'avoid');
    assert.equal(channel.production.startupBlast, 'prohibited');
    assert.equal(channel.production.loopPolicy, 'seamless-and-explicitly-authorized-only');
    assert.equal(channel.production.variationPolicy, 'artist-authorized-only');
    assert.deepEqual(channel.production.sessionArcsMinutes, FOCUS_CHANNEL_SESSION_ARCS);
    assert.equal(channel.production.untimedContinuation, true);
    assert.ok(channel.production.sonicBrief.length > 40);
    assert.ok(channel.production.attentionBrief.length > 40);
    assert.ok(channel.production.avoid.length >= 4);
  }
});

test('all eight initial packages are production briefs, carry no media and remain unplayable', () => {
  assert.equal(FOCUS_CHANNEL_MEDIA_AUTHORITY, 'none');
  assert.equal(FOCUS_CHANNEL_PLAYBACK_STATE, 'blocked');
  for (const channel of FOCUS_CHANNEL_CANDIDATES) {
    assert.equal(channel.admission, 'production-brief-only');
    assert.equal(channel.mediaFingerprint, null);
    assert.equal(channel.mediaUrl, null);
    assert.equal(channel.playable, false);
    assert.deepEqual(channel.requestedReceipts, FOCUS_CHANNEL_RIGHTS_RECEIPTS);
    assert.deepEqual(channel.excludedUses, FOCUS_CHANNEL_EXCLUDED_USES);
  }
});

test('the rights package names every receipt required for focus playback and revocation', () => {
  assert.deepEqual([...FOCUS_CHANNEL_RIGHTS_RECEIPTS], [
    'master', 'composition', 'performer', 'sample-status', 'territory',
    'license-term', 'private-on-demand', 'timed-focus-session',
    'cross-route-playback', 'background-playback', 'mobile-playback',
    'editing-looping', 'credits-attribution', 'withdrawal-revocation',
  ]);
  assert.deepEqual([...FOCUS_CHANNEL_EXCLUDED_USES], [
    'download', 'offline-cabin', 'public-broadcast', 'shared-session',
    'unbounded-remix', 'stem-isolation', 'ai-analysis', 'model-training',
    'voice-imitation',
  ]);
});

test('an empty package fails closed with media and every rights receipt missing', () => {
  const empty = emptyFocusChannelEvidence('ambient-stillness');
  assert.equal(empty.format, FOCUS_CHANNEL_EVIDENCE_FORMAT);
  assert.equal(empty.media, null);
  assert.equal(empty.receipts.length, FOCUS_CHANNEL_RIGHTS_RECEIPTS.length);
  assert.ok(empty.receipts.every(receipt => receipt.state === 'missing'));
  const readiness = assessFocusChannelEvidence(empty, NOW);
  assert.equal(readiness.structurallyReadyForIndependentAdmission, false);
  assert.equal(readiness.playable, false);
  assert.equal(readiness.mediaAuthority, 'none');
  assert.ok(readiness.reasons.includes('MEDIA_MISSING'));
  for (const kind of FOCUS_CHANNEL_RIGHTS_RECEIPTS)
    assert.ok(readiness.reasons.includes(`RIGHTS_RECEIPT_NOT_VERIFIED:${kind}`));
});

test('duplicate, expired, rejected and malformed evidence cannot become ready', () => {
  const bad = completeEvidence('deep-classical');
  bad.media.sha256 = 'not-a-hash';
  bad.receipts = [
    ...bad.receipts,
    { ...bad.receipts[0] },
  ];
  bad.receipts[1] = { ...bad.receipts[1], state: 'rejected' };
  bad.receipts[2] = { ...bad.receipts[2], expiresAt: '2026-10-26T15:30:00.000Z' };
  const readiness = assessFocusChannelEvidence(bad, NOW);
  assert.equal(readiness.structurallyReadyForIndependentAdmission, false);
  assert.equal(readiness.playable, false);
  assert.ok(readiness.reasons.includes('MEDIA_FINGERPRINT_INVALID'));
  assert.ok(readiness.reasons.includes('RIGHTS_RECEIPT_DUPLICATE:master'));
  assert.ok(readiness.reasons.includes('RIGHTS_RECEIPT_NOT_VERIFIED:composition'));
  assert.ok(readiness.reasons.includes('RIGHTS_RECEIPT_EXPIRED:performer'));
});

test('short studies and decorative loops cannot qualify as full focus channels', () => {
  const evidence = completeEvidence('downtempo-flow');
  evidence.media.durationSeconds = 48;
  const readiness = assessFocusChannelEvidence(evidence, NOW);
  assert.equal(readiness.structurallyReadyForIndependentAdmission, false);
  assert.ok(readiness.reasons.includes('MEDIA_DURATION_TOO_SHORT'));
});

test('even structurally complete receipts never authorize playback in this source model', () => {
  const readiness = assessFocusChannelEvidence(completeEvidence('cinematic-momentum'), NOW);
  assert.equal(readiness.structurallyReadyForIndependentAdmission, true);
  assert.equal(readiness.playable, false);
  assert.equal(readiness.mediaAuthority, 'none');
  assert.deepEqual(readiness.reasons, ['INDEPENDENT_MEDIA_AUTHORITY_REQUIRED']);
});

test('catalog source contains no URL, fetch, storage, player, provider, identity or clinical authority', () => {
  for (const forbidden of [
    /https?:\/\//,
    /\bfetch\s*\(/,
    /AudioContext|HTMLAudioElement|new Audio\s*\(/,
    /localStorage|sessionStorage|indexedDB/,
    /memberId|sessionToken|x-member-id|x-session-token/,
    /spotify|tidal|apple music|focus@will/i,
    /clinicalOutcome|diagnosisCode|treatmentPlan|productivityScore/,
  ]) assert.doesNotMatch(source, forbidden);
  assert.match(source, /ADHD treatment claims/);
  assert.match(source, /healing-frequency claims/);
  assert.match(source, /FOCUS_CHANNEL_MEDIA_AUTHORITY = 'none'/);
  assert.match(source, /playable: false/);
});
