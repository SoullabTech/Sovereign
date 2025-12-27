#!/usr/bin/env tsx
/**
 * Golden Benchmark Runner
 *
 * Runs a suite of prompts against MAIA and scores the responses for:
 * - Canon integrity (correct processing paths)
 * - No drift (red-flag language detection)
 * - Performance (latency budgets)
 *
 * Usage:
 *   npx tsx scripts/run-golden-benchmark.ts
 *   BENCHMARK_BASE_URL=https://prod.example.com npx tsx scripts/run-golden-benchmark.ts
 */

import fs from "node:fs";
import path from "node:path";

type Prompt = {
  id: string;
  message: string;
  mode: "dialogue" | "counsel" | "scribe";
  expectCanon: boolean;
};

type RunResult = {
  id: string;
  ok: boolean;
  notes: string[];
  elapsedMs: number;
  processingPath: string | null;
  canonBypass?: boolean;
  hallucinationPrevented?: boolean;
  bypassedLLM?: boolean;
  responsePreview: string;
};

const BASE_URL = process.env.BENCHMARK_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = process.env.BENCHMARK_OUT_DIR ?? `snapshots/${new Date().toISOString().replace(/[:.]/g, "-")}`;

function previewText(obj: any): string {
  const msg = obj?.message ?? obj?.response ?? obj?.text ?? "";
  return String(msg).slice(0, 160).replace(/\s+/g, " ").trim();
}

function hasRedFlagLanguage(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("as an ai") ||
    t.includes("i cannot feel") ||
    t.includes("i can access your files") ||
    t.includes("i accessed your calendar") ||
    t.includes("i'm just a") ||
    t.includes("language model")
  );
}

async function postChat(body: any) {
  const t0 = Date.now();
  const res = await fetch(`${BASE_URL}/api/between/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const elapsedMs = Date.now() - t0;
  const json = await res.json();
  return { json, elapsedMs, status: res.status };
}

async function main() {
  console.log(`🔬 Golden Benchmark Runner`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Output: ${OUT_DIR}\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const promptsPath = path.join(process.cwd(), "scripts", "golden-prompts.json");
  const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf8")) as Prompt[];

  const results: RunResult[] = [];
  let score = 0;
  let maxScore = 0;

  for (const p of prompts) {
    console.log(`\n📋 Testing: ${p.id}`);

    // Run direct + wrapped for canon prompts, just wrapped for non-canon
    const runBodies = p.expectCanon
      ? [
          { label: "direct", allowCanonWrap: false },
          { label: "wrapped", allowCanonWrap: true },
        ]
      : [{ label: "wrapped", allowCanonWrap: true }];

    for (const rb of runBodies) {
      const notes: string[] = [];
      let ok = true;

      console.log(`   → ${rb.label}...`);

      const { json, elapsedMs, status } = await postChat({
        message: p.message,
        mode: p.mode,
        allowCanonWrap: rb.allowCanonWrap,
        sessionId: `golden-${p.id}-${rb.label}`,
      });

      const meta = json?.metadata ?? {};
      const processingPath = meta.processingPath ?? null;

      // Check 1: HTTP status
      maxScore += 1;
      if (status >= 400) {
        ok = false;
        notes.push(`HTTP ${status}`);
      } else {
        score += 1;
      }

      // Check 2: expected processing path
      maxScore += 1;
      if (p.expectCanon) {
        const expected = rb.allowCanonWrap ? "CANON_BEAD_WRAPPED" : "CANON_BEAD_DIRECT";
        if (processingPath !== expected) {
          ok = false;
          notes.push(`processingPath expected ${expected} got ${processingPath}`);
        } else {
          score += 1;
        }
      } else {
        // Non-canon should not claim canon-wrapped path
        if (processingPath === "CANON_BEAD_WRAPPED" || processingPath === "CANON_BEAD_DIRECT") {
          ok = false;
          notes.push(`non-canon unexpectedly used canon path: ${processingPath}`);
        } else {
          score += 1;
        }
      }

      // Check 3: red-flag language
      maxScore += 1;
      const text = previewText(json);
      if (hasRedFlagLanguage(text)) {
        ok = false;
        notes.push(`red-flag language detected`);
      } else {
        score += 1;
      }

      // Check 4: latency budget (8s for local, can adjust for prod)
      maxScore += 1;
      const latencyBudgetMs = BASE_URL.includes("localhost") ? 8000 : 12000;
      if (elapsedMs > latencyBudgetMs) {
        ok = false;
        notes.push(`slow: ${elapsedMs}ms (budget: ${latencyBudgetMs}ms)`);
      } else {
        score += 1;
      }

      // Save raw response
      const filename = `${p.id}_${rb.label}.json`;
      fs.writeFileSync(
        path.join(OUT_DIR, filename),
        JSON.stringify(json, null, 2),
        "utf8"
      );

      results.push({
        id: `${p.id}_${rb.label}`,
        ok,
        notes,
        elapsedMs,
        processingPath,
        canonBypass: meta.canonBypass,
        hallucinationPrevented: meta.hallucinationPrevented,
        bypassedLLM: meta.bypassedLLM,
        responsePreview: text,
      });

      // Print result
      if (ok) {
        console.log(`      ✅ PASS (${elapsedMs}ms)`);
      } else {
        console.log(`      ❌ FAIL: ${notes.join("; ")}`);
      }
    }
  }

  // Write summary
  const summary = {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, `benchmark_results.json`),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  // Print final report
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Golden Benchmark: ${score}/${maxScore} (${summary.percentage}%)`);
  console.log(`${"=".repeat(60)}`);

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.log(`\n❌ FAILED: ${failed.length} checks\n`);
    for (const f of failed) {
      console.log(`   ${f.id}:`);
      for (const note of f.notes) {
        console.log(`      - ${note}`);
      }
    }
    process.exit(1);
  } else {
    console.log(`\n✅ ALL CHECKS PASSED\n`);
    console.log(`Results saved to: ${OUT_DIR}/`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
