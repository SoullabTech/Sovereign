/**
 * voice-ramp.cjs — Whisper STT concurrency load test.
 *
 * Whisper (whisper:8000) is only reachable on the maia-internal docker network,
 * so this runs INSIDE a container that's on that network:
 *
 *   scp scripts/load/voice-ramp.cjs scripts/load/fixtures/*.wav soullab@minisforum:/tmp/
 *   ssh soullab@minisforum 'docker cp /tmp/voice-ramp.cjs maia-sovereign:/tmp/ \
 *     && docker cp /tmp/sample-8s.wav maia-sovereign:/tmp/ \
 *     && docker exec -e FIXTURE=/tmp/sample-8s.wav maia-sovereign node /tmp/voice-ramp.cjs'
 *
 * Zero API spend, stateless, no member data. Measures the real CPU base.en ceiling.
 */
const fs = require('fs');

const WHISPER = process.env.WHISPER_URL || 'http://whisper:8000';
const FIXTURE = process.env.FIXTURE || '/tmp/sample-8s.wav';
const MODEL = process.env.MODEL || 'base.en';
const LEVELS = (process.env.LEVELS || '1,3,5,10,20').split(',').map(Number);

const audio = fs.readFileSync(FIXTURE);

function pct(arr, p) {
  if (!arr.length) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

async function oneRequest() {
  const fd = new FormData();
  fd.append('file', new Blob([audio], { type: 'audio/wav' }), 'audio.wav');
  fd.append('model', MODEL);
  const t0 = performance.now();
  try {
    const r = await fetch(`${WHISPER}/v1/audio/transcriptions`, { method: 'POST', body: fd });
    const txt = await r.text();
    return { ok: r.ok, status: r.status, ms: performance.now() - t0, len: txt.length };
  } catch (e) {
    return { ok: false, status: 0, ms: performance.now() - t0, err: String(e).slice(0, 80) };
  }
}

(async () => {
  console.log(`whisper=${WHISPER} model=${MODEL} fixture=${FIXTURE} bytes=${audio.length}`);
  const warm = await oneRequest();
  console.log(`warmup: ok=${warm.ok} status=${warm.status} ${warm.ms.toFixed(0)}ms (transcript ${warm.len} chars)`);
  console.log('conc |  ok err |    p50     p95     max |   wall  throughput');
  for (const c of LEVELS) {
    const t0 = performance.now();
    const res = await Promise.all(Array.from({ length: c }, oneRequest));
    const wall = performance.now() - t0;
    const oks = res.filter((r) => r.ok);
    const lat = oks.map((r) => r.ms);
    const errs = res.length - oks.length;
    console.log(
      `${String(c).padStart(4)} | ${String(oks.length).padStart(3)} ${String(errs).padStart(3)} | ` +
      `${pct(lat, 50).toFixed(0).padStart(6)}ms ${pct(lat, 95).toFixed(0).padStart(5)}ms ${Math.max(0, ...lat).toFixed(0).padStart(5)}ms | ` +
      `${wall.toFixed(0).padStart(6)}ms ${(oks.length / (wall / 1000)).toFixed(1)}/s`
    );
  }
})();
