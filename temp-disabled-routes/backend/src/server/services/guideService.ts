// src/services/guideService.ts

import { getUserProfile } from "./profileService";

export interface PersonalGuideSettings {
  name: string;
  voiceId?: string;
  gender?: "male" | "female" | "neutral";
  language?: string;
}

/**
 * Retrieves the guide settings for the user's personal guide.
 */
export async function getPersonalGuideSettings(
  userId: string,
): Promise<PersonalGuideSettings> {
  const profile = await getUserProfile(userId);
  return {
    name: profile.personal_guide_name || "Your Inner Guide",
    voiceId: profile.guide_voice_id || "LcfcDJNUP1GQjkzn1xUU", // Default to Emily
    gender: profile.guide_gender || "neutral",
    language: profile.guide_language || "en",
  };
}

/**
 * Returns the text-to-speech personalization block for ElevenLabs or other integrations.
 */
export function getVoiceSynthesisConfig(guide: PersonalGuideSettings) {
  return {
    voice_id: guide.voiceId,
    language: guide.language,
    metadata: {
      speaker: guide.name,
      gender: guide.gender,
    },
  };
}
