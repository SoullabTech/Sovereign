// scripts/supervision-demo-stream.mjs
// Run: node scripts/supervision-demo-stream.mjs
//
// Simulates live transcript streaming to test the cockpit feel
// without needing BlackHole or actual audio capture.

const base = process.env.MAIA_BASE_URL || "http://localhost:3000";

async function post(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`${path} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // 1) Start session
  console.log("Starting session...");
  const started = await post("/api/supervision/session/start", {
    title: "Live Stream Demo",
    sessionType: "consultation",
  });

  const sessionId = started?.session?.id;
  if (!sessionId) throw new Error("No sessionId returned from start()");
  console.log("Session:", sessionId);
  console.log("\n🎙️  Open /supervision in browser, click Live mode");
  console.log("    You should see transcript appear in ~1 second\n");

  // 2) Stream segments
  let t = 0;
  for (let i = 1; i <= 25; i++) {
    const speaker = i % 2 === 0 ? "client" : "supervisor";
    const text =
      speaker === "client"
        ? `I'm noticing something shift as we talk… (${i})`
        : `Stay with that. Where do you feel it? (${i})`;

    await post("/api/supervision/transcript", {
      sessionId,
      speaker,
      startMs: t,
      endMs: t + 900,
      text,
      isFinal: true,
      language: "en",
      transcriptionConfidence: 0.92,
    });

    console.log(`  [${formatTime(t)}] ${speaker}: ${text.substring(0, 40)}...`);
    t += 1000;
    await sleep(900);
  }

  // 3) Stop session (no analysis)
  await post("/api/supervision/session/stop", {
    sessionId,
    triggerAnalysis: false,
  });

  console.log("\n✅ Session stopped:", sessionId);
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
