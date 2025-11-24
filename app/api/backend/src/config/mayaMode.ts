/**
 * Maya Mode Configuration
 * Controls whether Maya operates in beta (simplified) or full (archetypal) mode
 */

export type MayaMode = "beta" | "full";

// Default to beta mode for initial testing
export const MAYA_MODE: MayaMode = (process.env.MAYA_MODE as MayaMode) || "beta";

// User-level override (can be stored in user profile later)
export function getMayaMode(userProfile?: { mayaMode?: MayaMode }): MayaMode {
  // User preference overrides global setting
  if (userProfile?.mayaMode) {
    return userProfile.mayaMode;
  }
  return MAYA_MODE;
}

// Feature flags for progressive unlocking
export const MAYA_FEATURES = {
  elementalPerspectives: MAYA_MODE === "full",
  crossAgentReferencing: false, // Always off in beta
  shadowWork: MAYA_MODE === "full",
  advancedMemory: MAYA_MODE === "full",
  voiceModulation: true // Available in both modes
};

export default {
  MAYA_MODE,
  getMayaMode,
  MAYA_FEATURES
};