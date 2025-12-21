// backend

import type { FacetCode } from "../../../lib/consciousness/spiralogic-facet-mapping";

export type SafetyLevel = "none" | "mild" | "elevated" | "high";
export type TraceEventKind =
  | "input_received"
  | "cue_extraction"
  | "evidence_assembly"
  | "state_inference"
  | "rule_eval"
  | "routing_decision"
  | "response_plan"
  | "model_call"
  | "output_sent"
  | "error";

export interface TraceEvent {
  ts: string; // ISO
  kind: TraceEventKind;
  label?: string;
  data?: Record<string, unknown>;
  ms_since_start?: number;
}

export interface TraceInput {
  text?: string;
  voice?: {
    transcript?: string;
    audioUrl?: string;
    confidence?: number;
  };
  raw?: Record<string, unknown>;
}

export interface TraceEvidence {
  biomarkers?: Record<string, unknown>;
  symbolic?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface TraceInference {
  facet?: FacetCode; // Typed facet code (F1-F3, W1-W3, E1-E3, A1-A3, Æ1-Æ3)
  mode?: string;
  arousal?: "low" | "mid" | "high";
  valence?: "negative" | "mixed" | "positive";
  confidence?: number; // 0..1
  competing?: Array<{ facet: FacetCode; mode?: string; confidence?: number }>;
  rationale?: string[];
}

export interface TraceRoutingDecision {
  route?: string; // agent id/name
  reason?: string[];
  alternatives?: Array<{ route: string; reason?: string[] }>;
}

export interface TraceResponsePlan {
  steps: Array<{
    kind: "reflect" | "inquire" | "reframe" | "practice" | "ritual" | "education" | "safety";
    detail?: string;
    payload?: Record<string, unknown>;
  }>;
}

export interface ConsciousnessTrace {
  id: string; // uuid (client-side placeholder ok)
  createdAt: string; // ISO
  userId: string;
  sessionId?: string;
  requestId?: string;

  agent?: string;
  model?: string;

  input: TraceInput;
  evidence?: TraceEvidence;
  inference?: TraceInference;
  routing?: TraceRoutingDecision;
  plan?: TraceResponsePlan;

  safety?: {
    level: SafetyLevel;
    flags?: string[];
    notes?: string[];
  };

  memory?: {
    referencedIds?: string[];
    notes?: string[];
  };

  rules?: {
    fired?: Array<{
      name: string;
      priority?: number;
      matched: boolean;
      actions?: Record<string, unknown>;
      inferred?: Record<string, unknown>;
      debug?: Record<string, unknown>;
    }>;
  };

  timings?: {
    startMs?: number;
    endMs?: number;
    latencyMs?: number;
  };

  events: TraceEvent[];
}
