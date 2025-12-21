// backend

import crypto from "crypto";
import { query } from "../../../lib/db/postgres";
import type { ConsciousnessTrace, SafetyLevel, TraceEvent } from "../types/consciousnessTrace";

function isoNow() {
  return new Date().toISOString();
}

export function newTraceId(): string {
  // uuid v4 compatible
  return crypto.randomUUID();
}

export function createTraceSkeleton(args: {
  userId: string;
  sessionId?: string;
  requestId?: string;
  agent?: string;
  model?: string;
  input: ConsciousnessTrace["input"];
}): ConsciousnessTrace {
  const startMs = Date.now();

  const trace: ConsciousnessTrace = {
    id: newTraceId(),
    createdAt: isoNow(),
    userId: args.userId,
    sessionId: args.sessionId,
    requestId: args.requestId,
    agent: args.agent,
    model: args.model,
    input: args.input,
    safety: { level: "none" },
    events: [
      {
        ts: isoNow(),
        kind: "input_received",
        ms_since_start: 0,
      },
    ],
    timings: { startMs },
  };

  return trace;
}

export function pushTraceEvent(trace: ConsciousnessTrace, event: Omit<TraceEvent, "ts" | "ms_since_start">) {
  const startMs = trace.timings?.startMs ?? Date.now();
  const ms = Date.now() - startMs;
  trace.events.push({ ts: isoNow(), ms_since_start: ms, ...event });
}

export function setSafety(trace: ConsciousnessTrace, level: SafetyLevel, flags: string[] = [], notes: string[] = []) {
  trace.safety = { level, flags, notes };
}

export function finalizeTrace(trace: ConsciousnessTrace) {
  const startMs = trace.timings?.startMs ?? Date.now();
  const endMs = Date.now();
  trace.timings = {
    ...trace.timings,
    endMs,
    latencyMs: endMs - startMs,
  };
}

export async function persistTrace(args: {
  trace: ConsciousnessTrace;
}) {
  const { trace } = args;

  const facet = trace.inference?.facet ?? null;
  const mode = trace.inference?.mode ?? null;
  const confidence = trace.inference?.confidence ?? null;
  const safety_level = trace.safety?.level ?? "none";
  const latency_ms = trace.timings?.latencyMs ?? null;

  const memory_ids = trace.memory?.referencedIds?.length ? trace.memory.referencedIds : null;

  const sql = `
    INSERT INTO consciousness_traces (
      id, user_id, session_id, request_id, agent, model,
      facet, mode, confidence, safety_level, latency_ms, memory_ids, trace
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;

  await query(sql, [
    trace.id,
    trace.userId,
    trace.sessionId ?? null,
    trace.requestId ?? null,
    trace.agent ?? null,
    trace.model ?? null,
    facet,
    mode,
    confidence,
    safety_level,
    latency_ms,
    memory_ids,
    JSON.stringify(trace),
  ]);
}
