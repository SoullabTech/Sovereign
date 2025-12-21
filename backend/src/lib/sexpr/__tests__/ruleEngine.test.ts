// backend

import { describe, expect, test } from "vitest";
import { compileRuleSExpr } from "../ruleCompiler";
import { runRuleEngine, pickRouting } from "../ruleEngine";

describe("sexpr rule engine", () => {
  test("routes when conditions match", () => {
    const program = `
      (rule demo
        (priority 10)
        (when (and (> biomarkers.hrv_drop 10)
                   (contains input.text "stuck")))
        (infer (facet water2) (mode shadow) (confidence 0.2))
        (do (route ShadowAgent) (tag "water2") (practice "do thing")))
    `;

    const rules = compileRuleSExpr(program);
    const facts = { input: { text: "I feel stuck today" }, biomarkers: { hrv_drop: 22 }, symbolic: {} };

    const fired = runRuleEngine(rules, facts);
    const picked = pickRouting(fired);

    expect(fired[0].matched).toBe(true);
    expect(picked.route).toBe("ShadowAgent");
    expect(picked.infer?.facet).toBe("water2");
  });

  test("does not route when conditions fail", () => {
    const program = `
      (rule demo (priority 10) (when (> biomarkers.hrv_drop 10)) (do (route ShadowAgent)))
    `;
    const rules = compileRuleSExpr(program);
    const facts = { biomarkers: { hrv_drop: 5 } };

    const fired = runRuleEngine(rules, facts);
    const picked = pickRouting(fired);

    expect(fired[0].matched).toBe(false);
    expect(picked.route).toBeUndefined();
  });
});
