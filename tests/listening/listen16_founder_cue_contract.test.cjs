'use strict';
/** LISTEN-16 private founder cue-sheet contract.
 * Pure metadata; cannot grant rights, upload audio, or start a player.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {
 BETWEEN_TIDES_FOUNDER_STUDY: score,
 chapterAt,isBetweenTidesFounderAudition:listeningFile,listeningTime
}=require('../../lib/listening/founderListeningJourney.ts');

test('five human-created cue transitions cover the 20-minute audition',()=>{
  assert.equal(score.durationSeconds,1200);
  assert.deepEqual(score.chapters.map(c=>c.startSeconds),[0,210,540,870,1110]);
  assert.deepEqual(score.chapters.map(c=>c.label),['Threshold','Velvet Current','Unfolding','Return','Dissolve']);
});

test('score is ONLY for the two known founder-local filename templates with genuine duration',()=>{
  for(const name of ['Between_the_Tides_Founder_Study_20min_AAC256.m4a','Between_the_Tides_Founder_Study_20min_24bit48k.flac']){
    assert.equal(listeningFile(name,1200),true);
    assert.equal(listeningFile(name,1199.98),true);
    assert.equal(listeningFile(name,1200.92),true);
    assert.equal(listeningFile(name,1195),false);
    assert.equal(listeningFile(name,1203),false);
    assert.equal(listeningFile(name,null),false);
    assert.equal(listeningFile(name,Number.NaN),false);
  }
});

test('music from another member or wrong title never inherits a founder study',()=>{
  assert.equal(listeningFile('member-private-story.mp3',1200),false);
  assert.equal(listeningFile('Listen_First_3min_Between_the_Tides.m4a',180),false);
  assert.equal(listeningFile('Between_the_Tides_Founder_Study_20min_AAC256.m4a.exe',1200),false);
  assert.equal(listeningFile('BETWEEN_THE_TIDES_FOUNDER_STUDY_20MIN_AAC256.M4A',1200),false);
  assert.equal(listeningFile('',1200),false);
});

test('chapter navigation is bounded to the intended musical passages',()=>{
  assert.equal(chapterAt(0).id,'threshold');
  assert.equal(chapterAt(209.999).id,'threshold');
  assert.equal(chapterAt(210).id,'velvet-current');
  assert.equal(chapterAt(539).id,'velvet-current');
  assert.equal(chapterAt(540).id,'unfolding');
  assert.equal(chapterAt(869).id,'unfolding');
  assert.equal(chapterAt(870).id,'return');
  assert.equal(chapterAt(1109).id,'return');
  assert.equal(chapterAt(1110).id,'dissolve');
  assert.equal(chapterAt(1200).id,'dissolve');
});

test('time formatter is readable and non-destructive',()=>{
  assert.equal(listeningTime(0),'0:00');
  assert.equal(listeningTime(209.4),'3:29');
  assert.equal(listeningTime(210),'3:30');
  assert.equal(listeningTime(540),'9:00');
  assert.equal(listeningTime(1110),'18:30');
  assert.equal(listeningTime(1200),'20:00');
  assert.equal(listeningTime(NaN),'0:00');
  assert.equal(listeningTime(-200),'0:00');
});

test('founder metadata never identifies a source as independently licensed',()=>{
  assert.match(score.status,/PRIVATE FOUNDER STUDY/);
  assert.match(score.status,/NOT RELEASED/);
});

test('cue-sheet module has no network, file ingest, media playback or storage API',()=>{
  const src=readFileSync(resolve(__dirname,'../../lib/listening/founderListeningJourney.ts'),'utf8');
  assert.doesNotMatch(src, /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|navigator\.mediaDevices|\.play\s*\(|AudioContext|BroadcastChannel/);
});

test('every cue describes listening, not a compulsory diagnosis',()=>{
  for(const item of score.chapters) {
    assert.ok(item.intention.length>20);
    assert.doesNotMatch(item.intention,/you are|diagnos|anxiety|trauma treatment/i);
  }
});
