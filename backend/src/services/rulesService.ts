// backend

import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchEnabledRulesSexpr(args: { supabase: SupabaseClient }): Promise<string | null> {
  const { supabase } = args;
  const { data, error } = await supabase
    .from("consciousness_rules")
    .select("sexpr, priority, name")
    .eq("enabled", true)
    .order("priority", { ascending: false });

  if (error) throw error;
  if (!data?.length) return null;

  return data.map((r: any) => r.sexpr).join("\n\n");
}
