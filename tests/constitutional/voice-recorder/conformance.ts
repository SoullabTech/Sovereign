import fs from 'node:fs';
import path from 'node:path';

function eq(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));

eq(pkg.dependencies['capacitor-voice-recorder'], '^7.0.6', 'recorder declaration');
eq(lock.packages['node_modules/capacitor-voice-recorder'].version, '7.0.6', 'recorder lock');
eq(lock.packages['node_modules/get-blob-duration'].version, '1.2.0', 'blob duration lock');
eq(pkg.overrides['get-blob-duration']['@babel/runtime'], '7.28.6', 'nested babel override');
eq(lock.packages['node_modules/get-blob-duration/node_modules/@babel/runtime'].version, '7.28.6', 'nested babel lock');
const pod = fs.readFileSync(path.join(root, 'ios/App/Podfile.lock'), 'utf8');
if (!pod.includes('CapacitorVoiceRecorder (7.0.6)')) throw new Error('iOS recorder pin drift');
const android = fs.readFileSync(path.join(root, 'android/capacitor.settings.gradle'), 'utf8');
if (!android.includes("include ':capacitor-voice-recorder'")) throw new Error('Android recorder bridge missing');
console.log('VOICE-RECORDER CONFORMANCE: PASS');
