// /api/rituals/progress.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId, ritualId, completed } = req.body;

  if (req.method === "POST") {
    if (!userId || !ritualId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("ritual_progress")
      .upsert(
        { user_id: userId, ritual_id: ritualId, completed },
        { onConflict: ["user_id", "ritual_id"] },
      );

    if (error) return res.status(500).json({ error });
    return res.status(200).json({ data });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
