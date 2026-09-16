#!/usr/bin/env npx tsx
/** TURN-03 A2 local DualTurn runtime witness. Shadow research only. */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { spawn, spawnSync } from 'child_process';
import { createInterface } from 'readline';
import { performance } from 'perf_hooks';
import { StreamingPcm16Resampler } from '../../lib/voice/predictors/pcm16Resampler';

const MODEL = '/private/tmp/dualturn-shadow-candidate/stream_tick.onnx';
const MODEL_SHA = '6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f';
const MODEL_VERSION = 'c3860ed71210fe0144af35af340fd7a4dec3d2d3';
const PYTHON = '/private/tmp/turn03-a2-venv/bin/python';
const SIDECAR = 'scripts/voice/dualturn-shadow-sidecar.py';
const SOURCE_RATE = 16000;
const MODEL_RATE = 24000;
const FRAME_SAMPLES = 1920;
const FRAME_MS = 80;
const SHORT_SOURCE_SAMPLES = 194561; // 152 full model ticks + 1 buffered 24k sample
const LONG_SOURCE_SAMPLES = 512001;  // 400 full model ticks + 1 buffered 24k sample (~32 s)
const DEFAULT_EVIDENCE = '/private/tmp/turn03-a2-dualturn-evidence.json';

function sha256Bytes(data: Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}
function sha256File(path: string): string { return sha256Bytes(readFileSync(path)); }
function pcmBytes(pcm: Int16Array): Buffer {
  const out = Buffer.allocUnsafe(pcm.length * 2);
  for (let i = 0; i < pcm.length; i++) out.writeInt16LE(pcm[i], i * 2);
  return out;
}
function concatPcm(parts: Int16Array[]): Int16Array {
  const n = parts.reduce((s, x) => s + x.length, 0);
  const out = new Int16Array(n); let at = 0;
  for (const x of parts) { out.set(x, at); at += x.length; }
  return out;
}
function fixture16k(sampleCount: number): Float32Array {
  const out = new Float32Array(sampleCount);
  for (let i = 0; i < out.length; i++) {
    const t = i / SOURCE_RATE;
    const phase = t % 10;
    const active = (phase < 2.0) || (phase >= 5.0 && phase < 9.1600625);
    if (!active) continue;
    const local = phase < 2.0 ? phase : phase - 5.0;
    const envelope = 0.11 + 0.07 * Math.pow(Math.sin(Math.PI * 3.1 * local), 2);
    const f0 = 165 + 18 * Math.sin(2 * Math.PI * 0.73 * local);
    out[i] = envelope * (
      0.68 * Math.sin(2 * Math.PI * f0 * local) +
      0.22 * Math.sin(2 * Math.PI * 2 * f0 * local) +
      0.10 * Math.sin(2 * Math.PI * 3 * f0 * local)
    );
  }
  return out;
}
function resample(source: Float32Array, chunked: boolean): Int16Array {
  const r = new StreamingPcm16Resampler(SOURCE_RATE, MODEL_RATE);
  if (!chunked) return r.push(source);
  const sizes = [257, 991, 320, 2048, 511, 777, 1600, 113, 4096];
  const parts: Int16Array[] = []; let offset = 0; let k = 0;
  while (offset < source.length) {
    const end = Math.min(source.length, offset + sizes[k++ % sizes.length]);
    parts.push(r.push(source.subarray(offset, end))); offset = end;
  }
  return concatPcm(parts);
}
function percentile(xs: number[], q: number): number {
  const s = [...xs].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.max(0, Math.ceil(q * s.length) - 1));
  return s[i];
}
function processSample(pid: number): { cpuPct: number; rssKb: number } | null {
  const r = spawnSync('ps', ['-o', '%cpu=,rss=', '-p', String(pid)], { encoding: 'utf8' });
  const m = r.stdout.trim().match(/^([0-9.]+)\s+(\d+)/);
  return m ? { cpuPct: Number(m[1]), rssKb: Number(m[2]) } : null;
}
function networkLines(pid: number): string[] {
  const r = spawnSync('lsof', ['-nP', '-a', '-p', String(pid), '-i'], { encoding: 'utf8' });
  return r.stdout.trim() ? r.stdout.trim().split(/\r?\n/).slice(1) : [];
}
function freeze(): string[] {
  const r = spawnSync(PYTHON, ['-m', 'pip', 'freeze'], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`pip freeze failed: ${r.stderr}`);
  return r.stdout.trim().split(/\r?\n/).filter(Boolean).sort();
}

async function main() {
  const evidencePath = process.argv[2] || DEFAULT_EVIDENCE;
  const paced = process.argv.includes('--paced');
  const longRun = process.argv.includes('--long');
  const sourceSamples = longRun ? LONG_SOURCE_SAMPLES : SHORT_SOURCE_SAMPLES;
  const expectedFrames = longRun ? 400 : 152;
  if (sha256File(MODEL) !== MODEL_SHA) throw new Error('model SHA custody failed');
  const source = fixture16k(sourceSamples);
  const whole = resample(source, false);
  const streamed = resample(source, true);
  const wholeHash = sha256Bytes(pcmBytes(whole));
  const streamHash = sha256Bytes(pcmBytes(streamed));
  if (whole.length !== streamed.length || wholeHash !== streamHash) throw new Error('resampler chunk continuity failed');
  const fullFrames = Math.floor(streamed.length / FRAME_SAMPLES);
  const tailSamples = streamed.length - fullFrames * FRAME_SAMPLES;
  if (fullFrames !== expectedFrames) throw new Error(`expected ${expectedFrames} frames, got ${fullFrames}`);

  const args = [SIDECAR, '--model-path', MODEL, '--expected-sha256', MODEL_SHA, '--model-version', MODEL_VERSION, '--threads', '4'];
  const start = performance.now();
  const child = spawn(PYTHON, args, { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });
  let stderr = ''; child.stderr.setEncoding('utf8'); child.stderr.on('data', (d) => { stderr += d; });
  const rl = createInterface({ input: child.stdout });
  const iter = rl[Symbol.asyncIterator]();
  const first = await iter.next();
  if (first.done) throw new Error(`sidecar exited before hello: ${stderr}`);
  const hello = JSON.parse(first.value);
  const startupMs = performance.now() - start;
  if (hello.type !== 'hello' || hello.protocol !== 'maia.turn-predictor.v2' || hello.sampleRateHz !== MODEL_RATE || hello.frameSamples !== FRAME_SAMPLES) throw new Error('sidecar hello contract mismatch');
  if (hello.model?.modelVersion !== MODEL_VERSION || hello.model?.provider !== 'dualturn') throw new Error('model provenance mismatch');

  const networkAtStartup = networkLines(child.pid!);
  const streamWallStart = performance.now();
  const sendTimes: number[] = [];
  const latencies: number[] = []; const resources: Array<{ frame: number; cpuPct: number; rssKb: number }> = [];
  const predictions: Array<{ seq: number; atMs: number; acousticContinue: number; acousticYield: number; vad: number }> = [];
  for (let i = 0; i < fullFrames; i++) {
    if (paced) {
      const due = streamWallStart + i * FRAME_MS;
      const wait = due - performance.now();
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    }
    sendTimes.push(performance.now());
    const frame = streamed.subarray(i * FRAME_SAMPLES, (i + 1) * FRAME_SAMPLES);
    const msg = { type: 'audio', seq: i, atMs: i * FRAME_MS, pcm16leBase64: pcmBytes(frame).toString('base64') };
    const t0 = performance.now(); child.stdin.write(JSON.stringify(msg) + '\n');
    const next = await iter.next(); const t1 = performance.now();
    if (next.done) throw new Error(`sidecar ended at frame ${i}: ${stderr}`);
    const p = JSON.parse(next.value);
    if (p.type !== 'prediction' || p.seq !== i || p.atMs !== i * FRAME_MS) throw new Error(`prediction sequence mismatch at ${i}`);
    for (const key of ['acousticContinue', 'acousticYield', 'vad']) if (!(Number.isFinite(p[key]) && p[key] >= 0 && p[key] <= 1)) throw new Error(`${key} invalid at ${i}`);
    latencies.push(t1 - t0); predictions.push(p);
    if (i % 8 === 0 || i === fullFrames - 1) { const s = processSample(child.pid!); if (s) resources.push({ frame: i, ...s }); }
  }
  const networkAfterRun = networkLines(child.pid!);
  const finalProc = processSample(child.pid!); if (finalProc) resources.push({ frame: fullFrames, ...finalProc });
  child.stdin.end();
  const exitCode: number = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', (code) => resolve(code ?? -1)); });
  if (exitCode !== 0) throw new Error(`sidecar exit ${exitCode}: ${stderr}`);

  const predDigest = sha256Bytes(Buffer.from(JSON.stringify(predictions)));
  const evidence = {
    schemaVersion: 1,
    lane: 'TURN-03', act: 'A2_LOCAL_SHADOW_RUNTIME', shadowOnly: true,
    generatedAt: new Date().toISOString(),
    model: { path: MODEL, sha256: MODEL_SHA, version: MODEL_VERSION, provider: 'dualturn', license: hello.model.weightLicense },
    runtime: { python: spawnSync(PYTHON, ['-c', 'import sys; print(sys.version.split()[0])'], { encoding: 'utf8' }).stdout.trim(), packages: freeze(), provider: 'CPUExecutionProvider', threads: 4, sidecarSha256: sha256File(SIDECAR) },
    ingress: { sourceRateHz: SOURCE_RATE, modelRateHz: MODEL_RATE, channelsFromMember: 1, secondMicrophone: false, modelSecondChannel: 'synthetic zeros inside sidecar', externalResampler: 'StreamingPcm16Resampler', resamplerSha256: sha256File('lib/voice/predictors/pcm16Resampler.ts') },
    fixture: { id: 'deterministic_prosodic_fixture_v1', sourceSamples: source.length, sourcePcmFloat32Sha256: sha256Bytes(new Uint8Array(source.buffer)), durationMs: source.length / SOURCE_RATE * 1000, pattern: '10s cycle: active 0-2s and 5-9.1600625s; silent otherwise', longRun },
    continuity: { oneShotSamples24k: whole.length, chunkedSamples24k: streamed.length, oneShotSha256: wholeHash, chunkedSha256: streamHash, byteIdentical: wholeHash === streamHash, fullFrames, frameSamples: FRAME_SAMPLES, frameMs: FRAME_MS, bufferedTailSamples: tailSamples, predictions: predictions.length, sequenceContinuous: predictions.every((p, i) => p.seq === i && p.atMs === i * FRAME_MS) },
    timingMs: { pacing: paced ? 'realtime' : 'burst', modelStartupToHello: startupMs, medianSendInterval: sendTimes.length > 1 ? percentile(sendTimes.slice(1).map((v, i) => v - sendTimes[i]), 0.5) : null, p95SendInterval: sendTimes.length > 1 ? percentile(sendTimes.slice(1).map((v, i) => v - sendTimes[i]), 0.95) : null, medianRoundTrip: percentile(latencies, 0.5), p95RoundTrip: percentile(latencies, 0.95), maxRoundTrip: Math.max(...latencies), minRoundTrip: Math.min(...latencies) },
    resources: { samples: resources, maxRssKb: Math.max(...resources.map((x) => x.rssKb)), maxCpuPctObserved: Math.max(...resources.map((x) => x.cpuPct)) },
    network: { openSocketsAfterHello: networkAtStartup, openSocketsAfterFrames: networkAfterRun, noOpenSocketsObserved: networkAtStartup.length === 0 && networkAfterRun.length === 0 },
    predictions: { count: predictions.length, sha256: predDigest, acousticContinueRange: [Math.min(...predictions.map((p) => p.acousticContinue)), Math.max(...predictions.map((p) => p.acousticContinue))], acousticYieldRange: [Math.min(...predictions.map((p) => p.acousticYield)), Math.max(...predictions.map((p) => p.acousticYield))], vadRange: [Math.min(...predictions.map((p) => p.vad)), Math.max(...predictions.map((p) => p.vad))] },
    authority: { canCommitTranscript: false, canDispatchCognition: false, canStartTts: false, canAlterEndpointing: false },
  };
  writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ evidencePath, modelStartupMs: startupMs, frames: fullFrames, tailSamples, latency: evidence.timingMs, maxRssKb: evidence.resources.maxRssKb, maxCpuPctObserved: evidence.resources.maxCpuPctObserved, noOpenSocketsObserved: evidence.network.noOpenSocketsObserved, predictionDigest: predDigest }, null, 2));
}
main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
