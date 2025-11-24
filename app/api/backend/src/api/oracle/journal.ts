import { Request, Response } from "express";
import { supabase } from "../../lib/supabase";

export async function saveJournal(req: Request, res: Response) {
  try {
    const { text, tags = [], element, phase, retroactive = false, userId } = req.body;

    // auto-detect tags if empty
    const autoTags: string[] = [];
    if (!tags.length && text) {
      if (text.toLowerCase().includes("work")) autoTags.push("work");
      if (text.toLowerCase().includes("dream")) autoTags.push("dream");
      if (text.toLowerCase().includes("stress")) autoTags.push("stress");
      if (text.toLowerCase().includes("relationship")) autoTags.push("relationship");
      if (text.toLowerCase().includes("insight")) autoTags.push("insight");
    }

    const entry = {
      user_id: userId,
      text,
      tags: [...tags, ...autoTags],
      element,
      phase,
      retroactive,
      created_at: new Date().toISOString(),
    };

    // Supabase insert
    const { data, error } = await supabase.from("journal_entries").insert([entry]).select();
    if (error) {
      console.error("[JOURNAL] Supabase insert failed:", error);
      return res.status(500).json({ error: "Failed to save journal entry" });
    }

    console.log(
      `[JOURNAL] Saved entry with tags=${entry.tags.join(", ")} element=${element} phase=${phase}`
    );

    res.json({ success: true, entry: data?.[0] || entry });
  } catch (err) {
    console.error("[JOURNAL] Error saving entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getJournalEntries(req: Request, res: Response) {
  try {
    const { userId, tags, element, phase, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (element) {
      query = query.eq("element", element);
    }

    if (phase) {
      query = query.eq("phase", phase);
    }

    if (tags && Array.isArray(tags)) {
      query = query.contains("tags", tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[JOURNAL] Failed to fetch entries:", error);
      return res.status(500).json({ error: "Failed to fetch journal entries" });
    }

    res.json({ success: true, entries: data || [] });
  } catch (err) {
    console.error("[JOURNAL] Error fetching entries:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function searchJournalEntries(req: Request, res: Response) {
  try {
    const { userId, searchText, limit = 20 } = req.query;

    if (!searchText) {
      return res.status(400).json({ error: "Search text is required" });
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .textSearch("text", String(searchText))
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error("[JOURNAL] Search failed:", error);
      return res.status(500).json({ error: "Failed to search journal entries" });
    }

    res.json({ success: true, entries: data || [] });
  } catch (err) {
    console.error("[JOURNAL] Error searching entries:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}