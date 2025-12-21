#!/usr/bin/env tsx
// backend - Seed consciousness rules into PostgreSQL

import { query, closePool } from "../lib/db/postgres";
import { DEFAULT_CONSCIOUSNESS_RULES } from "../backend/src/rules/consciousnessRules";

interface RuleData {
  name: string;
  sexpr: string;
  priority: number;
  enabled: boolean;
  metadata: Record<string, any>;
}

/**
 * Parse S-expression rules string into individual rule objects
 */
function parseRules(sexprString: string): RuleData[] {
  const rules: RuleData[] = [];

  // Split into rule blocks by finding (rule ...) patterns
  // Strategy: split by newlines and find rule start/end boundaries
  const lines = sexprString.split("\n");
  let currentRule: string[] = [];
  let inRule = false;
  let parenDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Start of a new rule
    if (trimmed.startsWith("(rule ")) {
      inRule = true;
      currentRule = [line];
      parenDepth = 0;
    } else if (inRule) {
      currentRule.push(line);
    }

    // Track paren depth while in rule
    if (inRule) {
      for (const char of line) {
        if (char === "(") parenDepth++;
        if (char === ")") parenDepth--;
      }

      // End of rule when parens balance
      if (parenDepth === 0 && currentRule.length > 0) {
        const fullSexpr = currentRule.join("\n");
        const nameMatch = fullSexpr.match(/\(rule\s+([^\s\)]+)/);
        const name = nameMatch ? nameMatch[1] : `unknown_${rules.length}`;

        // Extract priority
        const priorityMatch = fullSexpr.match(/\(priority\s+(\d+)\)/);
        const priority = priorityMatch ? parseInt(priorityMatch[1], 10) : 0;

        // Extract facet
        const facetMatch = fullSexpr.match(/\(facet\s+([^\)]+)\)/);
        const facet = facetMatch ? facetMatch[1] : null;

        // Extract mode
        const modeMatch = fullSexpr.match(/\(mode\s+([^\)]+)\)/);
        const mode = modeMatch ? modeMatch[1].replace(/"/g, "") : null;

        const metadata: Record<string, any> = {};
        if (facet) metadata.facet = facet;
        if (mode) metadata.mode = mode;

        rules.push({
          name,
          sexpr: fullSexpr,
          priority,
          enabled: true,
          metadata,
        });

        inRule = false;
        currentRule = [];
      }
    }
  }

  return rules;
}

async function seedRules() {
  console.log("🌱 Seeding consciousness rules...\n");

  const rules = parseRules(DEFAULT_CONSCIOUSNESS_RULES);

  console.log(`Found ${rules.length} rules to seed:\n`);

  const sql = `
    INSERT INTO consciousness_rules (name, sexpr, enabled, priority, metadata)
    VALUES ($1, $2, $3, $4, $5::jsonb)
    ON CONFLICT (name) DO UPDATE SET
      sexpr = EXCLUDED.sexpr,
      enabled = EXCLUDED.enabled,
      priority = EXCLUDED.priority,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
  `;

  for (const rule of rules) {
    console.log(`  - ${rule.name} (priority ${rule.priority})`);
    await query(sql, [
      rule.name,
      rule.sexpr,
      rule.enabled,
      rule.priority,
      JSON.stringify(rule.metadata),
    ]);
  }

  console.log("\n✅ Seeded consciousness rules successfully");
}

seedRules()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await closePool();
    process.exit(1);
  });
