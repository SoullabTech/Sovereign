import { supabase } from "@/lib/supabase";

export async function saveJournalEntry(
  userId: string,
  petals: Record<string, number>,
  text: string,
) {
  const { data, error } = await supabase
    .from("journal_entries")
    .insert([{ user_id: userId, petal_data: petals, journal_text: text }]);

  if (error) throw error;
  return data;
}
