// backend

import type { ConsciousnessTrace } from "../types/consciousnessTrace";
import { compileRuleSExpr } from "../lib/sexpr/ruleCompiler";
import { pickRouting, runRuleEngine } from "../lib/sexpr/ruleEngine";
import { DEFAULT_CONSCIOUSNESS_RULES } from "../rules/consciousnessRules";
import { pushTraceEvent } from "./traceService";

// Depth routing imports (feature-flagged)
import { DepthScoreService, type DepthScoreResult } from "../../../app/api/_backend/src/services/DepthScoreService";
import { mapToMaiaNativeIntent, classifyIntent } from "../../../app/api/_backend/src/personas/intent";

const DEPTH_ROUTING_ENABLED = process.env.MAIA_DEPTH_ROUTING === '1';

export interface SymbolicRoutingResult {
  route?: string;
  infer?: Record<string, unknown>;
  practices?: string[];
  tags?: string[];
  flags?: string[];
  fired?: Array<{ name: string; priority: number; matched: boolean }>;
  // Depth routing (when MAIA_DEPTH_ROUTING=1)
  depth?: DepthScoreResult;
  modelTier?: 'fast' | 'standard' | 'deep';
  retrievalProfile?: 'swift' | 'guided' | 'deep' | 'precision';
}

export function buildFacts(args: {
  inputText?: string;
  biomarkers?: Record<string, unknown>;
  symbolic?: Record<string, unknown>;
  context?: Record<string, unknown>;
  // Depth routing inputs (optional)
  numTurns?: number;
  memoryHitsCount?: number;
  retrievedSourceTypes?: string[];
}): Record<string, unknown> {
  return {
    input: { text: args.inputText ?? "" },
    biomarkers: args.biomarkers ?? {},
    symbolic: args.symbolic ?? {},
    context: args.context ?? {},
    // Pass through for depth routing
    _depthInputs: {
      numTurns: args.numTurns,
      memoryHitsCount: args.memoryHitsCount,
      retrievedSourceTypes: args.retrievedSourceTypes,
    },
  };
}

export function runSymbolicRouter(args: {
  trace?: ConsciousnessTrace;
  rulesSexpr?: string;
  facts: Record<string, unknown>;
}): SymbolicRoutingResult {
  const rules = compileRuleSExpr(args.rulesSexpr ?? DEFAULT_CONSCIOUSNESS_RULES);

  if (args.trace) pushTraceEvent(args.trace, { kind: "rule_eval", label: "compiled_rules", data: { count: rules.length } });

  const fired = runRuleEngine(rules, args.facts);

  if (args.trace) {
    args.trace.rules = {
      fired: fired.map((f) => ({
        name: f.name,
        priority: f.priority,
        matched: f.matched,
        actions: { actions: f.actions },
        inferred: f.infer,
        debug: f.debug,
      })),
    };
  }

  const picked = pickRouting(fired);

  if (args.trace) {
    pushTraceEvent(args.trace, {
      kind: "routing_decision",
      label: "symbolic_router",
      data: { route: picked.route, infer: picked.infer, tags: picked.tags, flags: picked.flags },
    });
  }

  // Depth routing (feature-flagged)
  let depthResult: DepthScoreResult | undefined;
  let modelTier: 'fast' | 'standard' | 'deep' | undefined;
  let retrievalProfile: 'swift' | 'guided' | 'deep' | 'precision' | undefined;

  if (DEPTH_ROUTING_ENABLED) {
    const inputText = (args.facts.input as { text?: string })?.text ?? '';
    const depthInputs = args.facts._depthInputs as {
      numTurns?: number;
      memoryHitsCount?: number;
      retrievedSourceTypes?: string[];
    } | undefined;

    // Classify intent using existing system, then map to MAIA-native
    const existingIntent = classifyIntent(inputText);
    const maiaNativeIntent = mapToMaiaNativeIntent(existingIntent, inputText);

    depthResult = DepthScoreService.compute({
      query: inputText,
      intent: maiaNativeIntent,
      numTurns: depthInputs?.numTurns ?? 0,
      memoryHitsCount: depthInputs?.memoryHitsCount ?? 0,
      retrievedSourceTypes: depthInputs?.retrievedSourceTypes ?? [],
    });

    // Determine model tier and retrieval profile based on depth band
    if (depthResult.band === 'DEEP') {
      modelTier = 'deep';
      retrievalProfile = 'deep';
    } else if (depthResult.band === 'GUIDED') {
      modelTier = 'standard';
      retrievalProfile = depthResult.flags.precisionMode ? 'precision' : 'guided';
    } else {
      modelTier = 'fast';
      retrievalProfile = depthResult.flags.precisionMode ? 'precision' : 'swift';
    }

    if (args.trace) {
      pushTraceEvent(args.trace, {
        kind: "depth_routing",
        label: "depth_score",
        data: {
          score: depthResult.score,
          band: depthResult.band,
          modelTier,
          retrievalProfile,
          components: depthResult.components,
          flags: depthResult.flags,
        },
      });
    }
  }

  return {
    route: picked.route,
    infer: picked.infer,
    practices: picked.practices,
    tags: picked.tags,
    flags: picked.flags,
    fired: fired.map((f) => ({ name: f.name, priority: f.priority, matched: f.matched })),
    // Depth routing results (only present when MAIA_DEPTH_ROUTING=1)
    depth: depthResult,
    modelTier,
    retrievalProfile,
  };
}
