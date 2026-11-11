/** LISTEN-13 · isolated in-document MAIA audible-speech focus leases.
 * An active lease is a UX coordination fact, NOT authentication or turn authority.
 * Run with Node >=22, fictional test symbols only.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const focus = require('../../lib/listening/maiaSpeechFocus.ts');

test('speech focus begins idle and permits exactly one active owner', () => {
  assert.equal(focus.isMaiaSpeechActive(), false);
  const first = Symbol('fictional-a');
  focus.beginMaiaSpeechLease(first);
  assert.equal(focus.isMaiaSpeechActive(), true);
  focus.endMaiaSpeechLease(first);
  assert.equal(focus.isMaiaSpeechActive(), false);
});

test('repeated focus claim for same streaming owner is idempotent', () => {
  const owner = Symbol('fictional-repeat');
  focus.beginMaiaSpeechLease(owner);
  focus.beginMaiaSpeechLease(owner);
  assert.equal(focus.isMaiaSpeechActive(), true);
  focus.endMaiaSpeechLease(owner);
  assert.equal(focus.isMaiaSpeechActive(), false);
});

test('one streaming queue cannot clear another active MAIA queue', () => {
  const ownerA=Symbol('fictional-queue-a');
  const ownerB=Symbol('fictional-queue-b');
  focus.beginMaiaSpeechLease(ownerA);
  focus.beginMaiaSpeechLease(ownerB);
  focus.endMaiaSpeechLease(ownerA);
  assert.equal(focus.isMaiaSpeechActive(), true);
  focus.endMaiaSpeechLease(ownerA); // stale duplicate completion
  assert.equal(focus.isMaiaSpeechActive(), true);
  focus.endMaiaSpeechLease(ownerB);
  assert.equal(focus.isMaiaSpeechActive(), false);
});

test('malformed or absent source owner never creates a speech lease',()=>{
  assert.throws(()=>focus.beginMaiaSpeechLease(undefined),/local symbol/);
  assert.throws(()=>focus.beginMaiaSpeechLease('untrusted'),/local symbol/);
  assert.equal(focus.isMaiaSpeechActive(), false);
});

test('voice ownership state is memory-only, without transcript/member data',()=>{
  const source=fs.readFileSync(path.resolve(__dirname,'../../lib/listening/maiaSpeechFocus.ts'),'utf8');
  assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\(|XMLHttpRequest|BroadcastChannel/);
  assert.doesNotMatch(source,/memberId|transcript|utterance|recordingBytes|mediaURL/);
  assert.equal(focus.isMaiaSpeechActive(), false);
});
