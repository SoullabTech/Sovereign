// backend/api/oracle/insightHistory.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service key for server-side use
);

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, phase, start_date, end_date } = req.query;

  let query = supabase
    .from("prompt_insight_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (user_id) query = query.eq("user_id", user_id);
  if (phase) query = query.eq("detected_phase", phase);
  if (start_date && end_date)
    query = query.gte("created_at", start_date).lte("created_at", end_date);

  const { data, error } = await query;

  if (error) return res.status(500).json({ error });

  return res.status(200).json({ insights: data });
}
