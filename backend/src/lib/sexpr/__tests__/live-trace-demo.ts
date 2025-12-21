// backend - Live demonstration of consciousness trace creation

import { createTraceSkeleton, finalizeTrace, persistTrace, pushTraceEvent } from "../../../services/traceService";
import { buildFacts, runSymbolicRouter } from "../../../services/symbolicRouter";
import { fetchEnabledRulesSexpr } from "../../../services/rulesService";
import { query, closePool } from "../../../../../lib/db/postgres";

async function demonstrateSymbolicRouter() {
  console.log("\n🧭 SYMBOLIC ROUTER LIVE DEMONSTRATION\n");
  console.log("=" .repeat(60));

  // Scenario 1: Water2 Shadow Work
  console.log("\n📍 Scenario 1: Deep Emotional Processing (Water2)\n");

  const trace1 = createTraceSkeleton({
    userId: "demo_user_1",
    sessionId: "demo_session_1",
    requestId: "req_water2_demo",
    agent: "MainOracleAgent",
    model: "deepseek",
    input: { text: "I feel stuck and betrayed by someone I trusted" },
  });

  pushTraceEvent(trace1, { kind: "cue_extraction", label: "demo_started" });

  const facts1 = buildFacts({
    inputText: "I feel stuck and betrayed by someone I trusted",
    biomarkers: {
      hrv_drop: 22,
      sentiment_score: -0.7,
      energy_level: "low",
      emotion: "overwhelmed",
    },
    symbolic: {
      theme: "betrayal",
      needs: ["validation", "grounding"],
    },
    context: {
      tone: "gentle",
      needsSupport: true,
    },
  });

  const routing1 = runSymbolicRouter({ trace: trace1, facts: facts1 });

  console.log("Input:", trace1.input.text);
  console.log("\nBiomarkers:");
  console.log("  - HRV drop:", facts1.biomarkers.hrv_drop);
  console.log("  - Sentiment:", facts1.biomarkers.sentiment_score);
  console.log("  - Emotion:", facts1.biomarkers.emotion);
  console.log("\nSymbolic Cues:");
  console.log("  - Theme:", facts1.symbolic.theme);
  console.log("  - Needs:", facts1.symbolic.needs);

  console.log("\n🎯 Routing Decision:");
  console.log("  → Route:", routing1.route || "none");
  console.log("  → Facet:", routing1.infer?.facet || "none");
  console.log("  → Mode:", routing1.infer?.mode || "none");
  console.log("  → Confidence:", routing1.infer?.confidence || 0);
  console.log("  → Practices:", routing1.practices?.length || 0);

  if (routing1.practices && routing1.practices.length > 0) {
    console.log("\n💎 Recommended Practice:");
    console.log("  ", routing1.practices[0]);
  }

  // Apply inference and finalize
  if (routing1.infer) {
    trace1.inference = {
      facet: routing1.infer.facet as string,
      mode: routing1.infer.mode as string,
      confidence: routing1.infer.confidence as number,
      rationale: routing1.flags || [],
    };
  }

  if (routing1.practices) {
    trace1.plan = {
      steps: routing1.practices.map((p) => ({ kind: "practice" as const, detail: p })),
    };
  }

  finalizeTrace(trace1);

  console.log("\n⏱️  Latency:", trace1.timings?.latencyMs, "ms");

  // Persist to database
  await persistTrace({ trace: trace1 });
  console.log("✅ Trace persisted to database (ID:", trace1.id + ")");

  // Scenario 2: Fire3 Vision Grounding
  console.log("\n" + "=".repeat(60));
  console.log("\n📍 Scenario 2: Vision Overheat (Fire3)\n");

  const trace2 = createTraceSkeleton({
    userId: "demo_user_2",
    sessionId: "demo_session_2",
    requestId: "req_fire3_demo",
    agent: "MainOracleAgent",
    model: "deepseek",
    input: { text: "I have this big vision for transforming education" },
  });

  const facts2 = buildFacts({
    inputText: "I have this big vision for transforming education",
    biomarkers: {
      arousal_score: 0.85,
      resting_hr: 18,
      energy_level: "high",
    },
    symbolic: {
      theme: "vision",
    },
    context: {},
  });

  const routing2 = runSymbolicRouter({ trace: trace2, facts: facts2 });

  console.log("Input:", trace2.input.text);
  console.log("\nBiomarkers:");
  console.log("  - Arousal score:", facts2.biomarkers.arousal_score);
  console.log("  - Resting HR +:", facts2.biomarkers.resting_hr);
  console.log("  - Energy:", facts2.biomarkers.energy_level);

  console.log("\n🎯 Routing Decision:");
  console.log("  → Route:", routing2.route || "none");
  console.log("  → Facet:", routing2.infer?.facet || "none");
  console.log("  → Mode:", routing2.infer?.mode || "none");

  if (routing2.practices && routing2.practices.length > 0) {
    console.log("\n💎 Recommended Practice:");
    console.log("  ", routing2.practices[0]);
  }

  if (routing2.infer) {
    trace2.inference = {
      facet: routing2.infer.facet as string,
      mode: routing2.infer.mode as string,
      confidence: routing2.infer.confidence as number,
      rationale: routing2.flags || [],
    };
  }

  if (routing2.practices) {
    trace2.plan = {
      steps: routing2.practices.map((p) => ({ kind: "practice" as const, detail: p })),
    };
  }

  finalizeTrace(trace2);
  await persistTrace({ trace: trace2 });
  console.log("✅ Trace persisted to database (ID:", trace2.id + ")");

  // Query database to show traces
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 DATABASE TRACES\n");

  const result = await query(`
    SELECT
      id,
      request_id,
      agent,
      facet,
      mode,
      confidence,
      latency_ms,
      trace->'plan'->'steps' as practices
    FROM consciousness_traces
    WHERE request_id LIKE 'req_%_demo'
    ORDER BY created_at DESC
  `);

  console.log(`Found ${result.rows.length} traces:\n`);

  result.rows.forEach((row: any, i: number) => {
    console.log(`${i + 1}. Trace ID: ${row.id}`);
    console.log(`   Request: ${row.request_id}`);
    console.log(`   Facet: ${row.facet}, Mode: ${row.mode}, Confidence: ${row.confidence}`);
    console.log(`   Latency: ${row.latency_ms}ms`);
    const practicesCount = row.practices ? (Array.isArray(row.practices) ? row.practices.length : 1) : 0;
    console.log(`   Practices: ${practicesCount}`);
    console.log("");
  });

  console.log("=".repeat(60));
  console.log("\n✨ DEMONSTRATION COMPLETE\n");
  console.log("🎯 Symbolic routing is LIVE and operational!");
  console.log("📊 Traces are being persisted to PostgreSQL");
  console.log("💎 Practices are being recommended based on rules\n");

  await closePool();
}

// Run the demonstration
demonstrateSymbolicRouter()
  .then(() => {
    console.log("✅ Demo completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  });
