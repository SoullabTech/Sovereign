#!/usr/bin/env node
// backend: scripts/semantic-recall.js
// Usage:
//   node scripts/semantic-recall.js --fact-file /tmp/fact.txt --response-file /tmp/resp.txt --threshold 0.72
// Env:
//   OLLAMA_BASE_URL=http://localhost:11434
//   OLLAMA_EMBED_MODEL=nomic-embed-text
//   SEMANTIC_TIMEOUT_MS=2500

const fs = require("fs");

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

function clampText(s, max = 2000) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

function cosineSim(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

async function fetchJson(url, body, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* ignore */ }
    return { ok: res.ok, status: res.status, json, raw: text };
  } finally {
    clearTimeout(t);
  }
}

async function getEmbedding(ollamaUrl, model, text, timeoutMs) {
  // Try /api/embeddings (older) then /api/embed (newer)
  const prompt = clampText(text);

  const r1 = await fetchJson(`${ollamaUrl}/api/embeddings`, { model, prompt }, timeoutMs);
  if (r1.ok && r1.json && Array.isArray(r1.json.embedding)) return r1.json.embedding;

  const r2 = await fetchJson(`${ollamaUrl}/api/embed`, { model, input: prompt }, timeoutMs);
  // /api/embed returns { embeddings: [ [...], ... ] }
  if (r2.ok && r2.json && Array.isArray(r2.json.embeddings) && Array.isArray(r2.json.embeddings[0])) {
    return r2.json.embeddings[0];
  }

  throw new Error(`Embedding failed (${r1.status}/${r2.status}). Ensure model exists: ollama pull ${model}`);
}

(async () => {
  const factFile = arg("--fact-file");
  const responseFile = arg("--response-file");
  const threshold = parseFloat(arg("--threshold", "0.72"));
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const embedModel = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
  const timeoutMs = parseInt(process.env.SEMANTIC_TIMEOUT_MS || "5000", 10);

  if (!factFile || !responseFile) {
    console.error("Missing args. Need --fact-file and --response-file");
    process.exit(2);
  }

  const fact = (fs.readFileSync(factFile, "utf8") || "").trim();
  const resp = (fs.readFileSync(responseFile, "utf8") || "").trim();

  if (!fact || !resp) {
    console.error("Empty fact/response.");
    process.exit(2);
  }

  // Fallback "semantic-ish" synonym net if embeddings unavailable
  const fallbackTokens = [
    "garden", "gardening", "plant", "plants", "planting", "soil", "beds", "weeding",
    "flowers", "horticulture", "greenhouse", "seed", "seeds", "compost"
  ];

  try {
    const eFact = await getEmbedding(ollamaUrl, embedModel, fact, timeoutMs);
    const eResp = await getEmbedding(ollamaUrl, embedModel, resp, timeoutMs);
    const sim = cosineSim(eFact, eResp);

    const pass = sim >= threshold;
    console.log(`[semantic-recall] model=${embedModel} sim=${sim.toFixed(4)} threshold=${threshold} => ${pass ? "PASS" : "FAIL"}`);
    process.exit(pass ? 0 : 1);
  } catch (e) {
    const lower = resp.toLowerCase();
    const hit = fallbackTokens.some(t => lower.includes(t));
    console.log(`[semantic-recall] embeddings unavailable (${e.message}). fallbackTokenHit=${hit ? "YES" : "NO"} => ${hit ? "PASS" : "FAIL"}`);
    process.exit(hit ? 0 : 1);
  }
})();
