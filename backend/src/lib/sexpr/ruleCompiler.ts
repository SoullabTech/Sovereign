// backend

import { SExpr, SList, asSymbol, parseSExpr } from "./sexpr";

export type RuleAction =
  | { kind: "route"; to: string }
  | { kind: "practice"; text: string }
  | { kind: "tag"; value: string }
  | { kind: "flag"; value: string }
  | { kind: "set"; key: string; value: unknown };

export interface CompiledRule {
  name: string;
  priority: number;
  when: SExpr;
  infer: Record<string, unknown>;
  actions: RuleAction[];
  raw: string;
}

export class RuleCompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuleCompileError";
  }
}

function listItems(x: SExpr): SExpr[] {
  if (x.type !== "list") throw new RuleCompileError("Expected list form");
  return x.items;
}

function firstSymbol(x: SExpr): string {
  if (x.type !== "list") throw new RuleCompileError("Expected list");
  const head = x.items[0];
  const s = head ? asSymbol(head) : null;
  if (!s) throw new RuleCompileError("Expected head symbol");
  return s;
}

function atomToString(x: SExpr): string {
  if (x.type === "string") return x.value;
  if (x.type === "symbol") return x.value;
  if (x.type === "number") return String(x.value);
  if (x.type === "boolean") return x.value ? "true" : "false";
  if (x.type === "nil") return "nil";
  throw new RuleCompileError("Unsupported atom");
}

function parsePriorityForm(form: SExpr): number | null {
  if (form.type !== "list") return null;
  if (firstSymbol(form) !== "priority") return null;
  const n = form.items[1];
  if (!n || n.type !== "number") throw new RuleCompileError("(priority <number>) required");
  return n.value;
}

function parseInferForm(form: SExpr): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const items = listItems(form);
  // (infer (facet water2) (mode shadow) (confidence 0.2) ...)
  for (let i = 1; i < items.length; i++) {
    const pair = items[i];
    if (pair.type !== "list") continue;
    const k = asSymbol(pair.items[0]);
    if (!k) continue;
    const v = pair.items[1];
    if (!v) continue;
    out[k] = v.type === "list" ? pair.items.slice(1).map(atomToString) : (v.type === "number" ? v.value : atomToString(v));
  }
  return out;
}

function parseDoForm(form: SExpr): RuleAction[] {
  const items = listItems(form);
  const actions: RuleAction[] = [];

  for (let i = 1; i < items.length; i++) {
    const act = items[i];
    if (act.type !== "list") continue;
    const head = asSymbol(act.items[0]);
    if (!head) continue;

    if (head === "route") {
      const to = act.items[1];
      if (!to) throw new RuleCompileError("(route <agent>) required");
      actions.push({ kind: "route", to: atomToString(to) });
      continue;
    }

    if (head === "practice") {
      const text = act.items[1];
      if (!text) throw new RuleCompileError('(practice "text") required');
      actions.push({ kind: "practice", text: atomToString(text) });
      continue;
    }

    if (head === "tag") {
      const v = act.items[1];
      if (!v) throw new RuleCompileError("(tag <value>) required");
      actions.push({ kind: "tag", value: atomToString(v) });
      continue;
    }

    if (head === "flag") {
      const v = act.items[1];
      if (!v) throw new RuleCompileError("(flag <value>) required");
      actions.push({ kind: "flag", value: atomToString(v) });
      continue;
    }

    if (head === "set") {
      const key = act.items[1];
      const val = act.items[2];
      if (!key || !val) throw new RuleCompileError("(set <key> <value>) required");
      actions.push({ kind: "set", key: atomToString(key), value: val.type === "number" ? val.value : atomToString(val) });
      continue;
    }
  }

  return actions;
}

export function compileRuleSExpr(raw: string): CompiledRule[] {
  const exprs = parseSExpr(raw);

  const rules: CompiledRule[] = [];
  for (const expr of exprs) {
    if (expr.type !== "list") continue;
    const head = asSymbol(expr.items[0]);
    if (head !== "rule") continue;

    const nameAtom = expr.items[1];
    const name = nameAtom && nameAtom.type === "symbol" ? nameAtom.value : null;
    if (!name) throw new RuleCompileError("(rule <name> ...) requires a symbol name");

    let priority = 0;
    let whenExpr: SExpr | null = null;
    let infer: Record<string, unknown> = {};
    let actions: RuleAction[] = [];

    for (let i = 2; i < expr.items.length; i++) {
      const form = expr.items[i];
      if (form.type !== "list") continue;

      const p = parsePriorityForm(form);
      if (p !== null) {
        priority = p;
        continue;
      }

      const tag = firstSymbol(form);
      if (tag === "when") {
        const w = form.items[1];
        if (!w) throw new RuleCompileError("(when <expr>) required");
        whenExpr = w;
        continue;
      }
      if (tag === "infer") {
        infer = parseInferForm(form);
        continue;
      }
      if (tag === "do") {
        actions = parseDoForm(form);
        continue;
      }
    }

    if (!whenExpr) throw new RuleCompileError(`Rule "${name}" missing (when ...)`);

    rules.push({ name, priority, when: whenExpr, infer, actions, raw });
  }

  return rules;
}
