// MAIA-D01 — the hard prohibition, enforced structurally.
//
// The founder's ruling: the D01 capture path may not use SpeechRecognition,
// webkitSpeechRecognition, the Web Speech API, or a browser-owned recognition
// lifecycle — and a proof must FAIL if such a dependency enters.
//
// This is the guard. It reads every file in the capture path and refuses the
// whole family of names, including the ways they are usually reached indirectly
// (window['SpeechRecognition'], a destructured alias, a dynamic lookup).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'src');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(js|html)$/.test(name)) out.push(p);
  }
  return out;
}

// Comments are stripped: this file's own prose names the forbidden APIs in order
// to forbid them, and a naive substring match would fail on documentation
// quality rather than on the property under test.
function stripped(file) {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');
}

const FORBIDDEN = [
  /\bwebkitSpeechRecognition\b/,
  /\bSpeechRecognition\b/,
  /\bSpeechGrammarList\b/,
  /\bwebkitSpeechGrammarList\b/,
  /\bSpeechRecognitionEvent\b/,
  /\bspeechSynthesis\b/,
  // Indirect reaches — the usual way a banned global comes back.
  /window\s*\[\s*['"`]webkitSpeechRecognition['"`]\s*\]/,
  /window\s*\[\s*['"`]SpeechRecognition['"`]\s*\]/,
  /globalThis\s*\[\s*['"`]\w*SpeechRecognition['"`]\s*\]/,
];

const files = walk(srcDir);

test('the capture path contains no Web Speech API dependency', () => {
  assert.ok(files.length >= 6, `expected the capture path to have files; found ${files.length}`);
  const hits = [];
  for (const f of files) {
    const body = stripped(f);
    for (const rx of FORBIDDEN) {
      if (rx.test(body)) hits.push(`${path.relative(srcDir, f)} :: ${rx}`);
    }
  }
  assert.deepEqual(hits, [], `Web Speech dependency entered the D01 capture path:\n${hits.join('\n')}`);
});

test('the capture path holds no recognition object lifecycle', () => {
  // The lifecycle, not just the constructor: onresult/onspeechend/onnomatch are
  // the recognition-object callbacks. Their absence is what makes "there is no
  // recognition lifecycle to lose control of" a checkable claim.
  const LIFECYCLE = [/\.onresult\b/, /\.onnomatch\b/, /\.onspeechend\b/, /\.onaudioend\b/, /\.interimResults\b/, /\.continuous\s*=/];
  const hits = [];
  for (const f of files) {
    const body = stripped(f);
    for (const rx of LIFECYCLE) if (rx.test(body)) hits.push(`${path.relative(srcDir, f)} :: ${rx}`);
  }
  assert.deepEqual(hits, [], `a browser recognition lifecycle entered the capture path:\n${hits.join('\n')}`);
});

test('the renderer acquires audio frames, not recognition results', () => {
  const renderer = stripped(path.join(srcDir, 'renderer.js'));
  assert.ok(renderer.includes('getUserMedia'), 'renderer must acquire a MediaStream');
  assert.ok(renderer.includes('audioWorklet'), 'renderer must read owned frames via an AudioWorklet');
  assert.ok(renderer.includes('window.maia.voiceFrame'), 'renderer must forward frames across the bridge');
});

test('transcription targets our own route, not a cloud recognition service', () => {
  const t = stripped(path.join(srcDir, 'voice', 'transcription.js'));
  assert.ok(t.includes('/api/voice/transcribe-simple'), 'must use the existing self-hosted whisper route');
  for (const banned of ['openai.com', 'googleapis.com', 'speech.googleapis', 'azure', 'deepgram', 'assemblyai']) {
    assert.ok(!t.toLowerCase().includes(banned), `third-party recognition service referenced: ${banned}`);
  }
});
