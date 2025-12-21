// backend

import { SExpr, asSymbol } from "./sexpr";
import { CompiledRule, RuleAction } from "./ruleCompiler";

export interface RuleFire {
  name: string;
  priority: number;
  matched: boolean;
  infer: Record<string, unknown>;
  actions: RuleAction[];
  debug?: Record<string, unknown>;
}

export type Facts = Record<string, unknown>;

function getPath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function truthy(v: unknown): boolean {
  return !!v;
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function evalAtom(expr: SExpr, facts: Facts): unknown {
  if (expr.type === "number") return expr.value;
  if (expr.type === "string") return expr.value;
  if (expr.type === "boolean") return expr.value;
  if (expr.type === "nil") return null;
  if (expr.type === "symbol") {
    // symbol resolves to facts path
    return getPath(facts, expr.value);
  }
  return expr; // list handled elsewhere
}

function evalList(expr: Extract<SExpr, { type: "list" }>, facts: Facts): unknown {
  const head = asSymbol(expr.items[0]);
  if (!head) return null;

  const args = expr.items.slice(1);

  if (head === "and") return args.every((a) => truthy(evalExpr(a, facts)));
  if (head === "or") return args.some((a) => truthy(evalExpr(a, facts)));
  if (head === "not") return !truthy(evalExpr(args[0]!, facts));

  if (head === "exists") {
    const v = evalExpr(args[0]!, facts);
    return v !== undefined && v !== null;
  }

  if (head === "==") return evalExpr(args[0]!, facts) === evalExpr(args[1]!, facts);
  if (head === "!=") return evalExpr(args[0]!, facts) !== evalExpr(args[1]!, facts);

  if (head === ">") {
    const a = toNumber(evalExpr(args[0]!, facts));
    const b = toNumber(evalExpr(args[1]!, facts));
    if (a == null || b == null) return false;
    return a > b;
  }
  if (head === "<") {
    const a = toNumber(evalExpr(args[0]!, facts));
    const b = toNumber(evalExpr(args[1]!, facts));
    if (a == null || b == null) return false;
    return a < b;
  }
  if (head === ">=") {
    const a = toNumber(evalExpr(args[0]!, facts));
    const b = toNumber(evalExpr(args[1]!, facts));
    if (a == null || b == null) return false;
    return a >= b;
  }
  if (head === "<=") {
    const a = toNumber(evalExpr(args[0]!, facts));
    const b = toNumber(evalExpr(args[1]!, facts));
    if (a == null || b == null) return false;
    return a <= b;
  }

  if (head === "in") {
    const val = evalExpr(args[0]!, facts);
    const listExpr = args[1];
    if (!listExpr || listExpr.type !== "list") return false;
    const listHead = asSymbol(listExpr.items[0]);
    const elems = (listHead === "list" ? listExpr.items.slice(1) : listExpr.items).map((x) => evalExpr(x, facts));
    return elems.some((x) => x === val);
  }

  if (head === "contains") {
    const hay = evalExpr(args[0]!, facts);
    const needle = evalExpr(args[1]!, facts);
    if (typeof hay === "string" && typeof needle === "string") return hay.toLowerCase().includes(needle.toLowerCase());
    if (Array.isArray(hay)) return hay.includes(needle);
    return false;
  }

  // default: unknown function => false
  return false;
}

export function evalExpr(expr: SExpr, facts: Facts): unknown {
  if (expr.type === "list") return evalList(expr, facts);
  return evalAtom(expr, facts);
}

export function runRuleEngine(rules: CompiledRule[], facts: Facts): RuleFire[] {
  const fired: RuleFire[] = [];

  for (const r of rules) {
    const matched = truthy(evalExpr(r.when, facts));
    fired.push({
      name: r.name,
      priority: r.priority,
      matched,
      infer: r.infer,
      actions: r.actions,
      debug: { when: r.when, factsKeys: Object.keys(facts).slice(0, 50) },
    });
  }

  fired.sort((a, b) => b.priority - a.priority);
  return fired;
}

export function pickRouting(fired: RuleFire[]): { route?: string; practices?: string[]; tags?: string[]; flags?: string[]; infer?: Record<string, unknown> } {
  const matched = fired.filter((f) => f.matched);

  const out: { route?: string; practices?: string[]; tags?: string[]; flags?: string[]; infer?: Record<string, unknown> } = {
    practices: [],
    tags: [],
    flags: [],
    infer: {},
  };

  if (!matched.length) return out;

  for (const f of matched) {
    // merge infer (higher priority first)
    for (const [k, v] of Object.entries(f.infer ?? {})) {
      if (out.infer && out.infer[k] === undefined) out.infer[k] = v;
    }
    for (const a of f.actions ?? []) {
      if (a.kind === "route" && !out.route) out.route = a.to;
      if (a.kind === "practice") out.practices!.push(a.text);
      if (a.kind === "tag") out.tags!.push(a.value);
      if (a.kind === "flag") out.flags!.push(a.value);
    }
  }

  return out;
}
