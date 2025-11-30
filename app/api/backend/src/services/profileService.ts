import { supabase } from "../lib/supabaseClient";

export interface UserProfile {
  personal_guide_name: string;
  guide_gender: string;
  voice_id: string;
  guide_language: string;
  // Add other profile fields as needed
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("personal_guide_name, guide_gender, voice_id, guide_language")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }

  return (
    data || {
      personal_guide_name: "Oracle",
      guide_gender: "neutral",
      voice_id: "default",
      guide_language: "en",
    }
  );
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return data;
}
