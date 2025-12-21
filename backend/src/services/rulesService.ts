// backend

import { query } from "../../../lib/db/postgres";

interface ConsciousnessRule {
  sexpr: string;
  priority: number;
  name: string;
}

export async function fetchEnabledRulesSexpr(): Promise<string | null> {
  const sql = `
    SELECT sexpr, priority, name
    FROM consciousness_rules
    WHERE enabled = true
    ORDER BY priority DESC, updated_at DESC
  `;

  const result = await query<ConsciousnessRule>(sql);

  if (!result.rows.length) return null;

  return result.rows.map((r) => r.sexpr).join("\n\n");
}
