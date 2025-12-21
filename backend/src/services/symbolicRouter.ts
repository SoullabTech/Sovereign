// backend

import type { ConsciousnessTrace } from "../types/consciousnessTrace";
import { compileRuleSExpr } from "../lib/sexpr/ruleCompiler";
import { pickRouting, runRuleEngine } from "../lib/sexpr/ruleEngine";
import { DEFAULT_CONSCIOUSNESS_RULES } from "../rules/consciousnessRules";
import { pushTraceEvent } from "./traceService";

export interface SymbolicRoutingResult {
  route?: string;
  infer?: Record<string, unknown>;
  practices?: string[];
  tags?: string[];
  flags?: string[];
  fired?: Array<{ name: string; priority: number; matched: boolean }>;
}

export function buildFacts(args: {
  inputText?: string;
  biomarkers?: Record<string, unknown>;
  symbolic?: Record<string, unknown>;
  context?: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    input: { text: args.inputText ?? "" },
    biomarkers: args.biomarkers ?? {},
    symbolic: args.symbolic ?? {},
    context: args.context ?? {},
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

  return {
    route: picked.route,
    infer: picked.infer,
    practices: picked.practices,
    tags: picked.tags,
    flags: picked.flags,
    fired: fired.map((f) => ({ name: f.name, priority: f.priority, matched: f.matched })),
  };
}
