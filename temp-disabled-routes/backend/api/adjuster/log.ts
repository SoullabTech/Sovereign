// oracle-backend/api/adjuster/log.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../src/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, message, phase } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const { data, error } = await supabase
    .from("adjuster_logs")
    .insert([{ user_id, message, phase, created_at: new Date() }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, data });
}
