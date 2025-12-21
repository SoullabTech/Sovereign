// backend - Integration test for symbolic router with database rules

import { fetchEnabledRulesSexpr } from "../../../services/rulesService";
import { compileRuleSExpr } from "../ruleCompiler";
import { runRuleEngine, pickRouting } from "../ruleEngine";
import { closePool } from "../../../../../lib/db/postgres";

describe("symbolic router integration", () => {
  afterAll(async () => {
    await closePool();
  });

  test("loads rules from database and routes correctly", async () => {
    // Fetch rules from database
    const rulesSexpr = await fetchEnabledRulesSexpr();

    expect(rulesSexpr).toBeTruthy();
    expect(rulesSexpr).toContain("water2-shadow-gate");
    expect(rulesSexpr).toContain("fire3-vision-overheat");
    expect(rulesSexpr).toContain("air2-rumination-loop");

    // Compile rules
    const rules = compileRuleSExpr(rulesSexpr!);
    expect(rules.length).toBe(3);

    // Test water2-shadow-gate rule
    const facts1 = {
      input: { text: "I feel stuck and betrayed" },
      biomarkers: { hrv_drop: 20 },
      symbolic: { theme: "betrayal" },
    };

    const fired1 = runRuleEngine(rules, facts1);
    const routing1 = pickRouting(fired1);

    expect(routing1.route).toBe("ShadowAgent");
    expect(routing1.infer?.facet).toBe("water2");
    expect(routing1.infer?.mode).toBe("shadow");
    expect(routing1.practices?.length).toBeGreaterThan(0);
    expect(routing1.practices?.[0]).toContain("Containment");

    // Test fire3-vision-overheat rule
    const facts2 = {
      input: { text: "I have this big vision for my startup" },
      biomarkers: { arousal_score: 0.8 },
      symbolic: {},
    };

    const fired2 = runRuleEngine(rules, facts2);
    const routing2 = pickRouting(fired2);

    expect(routing2.route).toBe("GuideAgent");
    expect(routing2.infer?.facet).toBe("fire3");
    expect(routing2.practices?.[0]).toContain("Ground the vision");

    // Test air2-rumination-loop rule
    const facts3 = {
      input: { text: "What if I keep replaying this mistake?" },
      biomarkers: {},
      symbolic: {},
    };

    const fired3 = runRuleEngine(rules, facts3);
    const routing3 = pickRouting(fired3);

    expect(routing3.route).toBe("CBTAgent");
    expect(routing3.infer?.facet).toBe("air2");
    expect(routing3.practices?.[0]).toContain("Thought label");
  });

  test("handles case when no rules match", async () => {
    const rulesSexpr = await fetchEnabledRulesSexpr();
    const rules = compileRuleSExpr(rulesSexpr!);

    const facts = {
      input: { text: "Hello, how are you?" },
      biomarkers: {},
      symbolic: {},
    };

    const fired = runRuleEngine(rules, facts);
    const routing = pickRouting(fired);

    // When no rules match, routing should be empty
    expect(routing.route).toBeUndefined();
    expect(routing.practices || []).toEqual([]);
  });
});
