// backend

import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
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
  supabase: SupabaseClient;
  trace: ConsciousnessTrace;
}) {
  const { supabase, trace } = args;

  const facet = trace.inference?.facet ?? null;
  const mode = trace.inference?.mode ?? null;
  const confidence = trace.inference?.confidence ?? null;
  const safety_level = trace.safety?.level ?? "none";
  const latency_ms = trace.timings?.latencyMs ?? null;

  const memory_ids = trace.memory?.referencedIds?.length ? trace.memory.referencedIds : null;

  const row = {
    id: trace.id,
    user_id: trace.userId,
    session_id: trace.sessionId ?? null,
    request_id: trace.requestId ?? null,
    agent: trace.agent ?? null,
    model: trace.model ?? null,
    facet,
    mode,
    confidence,
    safety_level,
    latency_ms,
    memory_ids,
    trace,
  };

  const { error } = await supabase.from("consciousness_traces").insert(row);
  if (error) throw error;
}
