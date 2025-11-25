import { useState, useEffect } from "react";
import { FEATURE_FLAGS, hasPhase2Access } from "@/config/features";
import { useUser } from "@/lib/supabase";

/**
 * Hook to check if a feature flag is enabled
 * Handles both static flags and user-specific Phase 2 access
 */
export function useFeatureFlag(feature: keyof typeof FEATURE_FLAGS): boolean {
  const user = useUser();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check static flag first
    if (FEATURE_FLAGS[feature]) {
      setIsEnabled(true);
      return;
    }

    // Check user-specific Phase 2 access
    if (user?.id) {
      setIsEnabled(hasPhase2Access(user.id, feature));
    } else {
      setIsEnabled(false);
    }
  }, [feature, user?.id]);

  return isEnabled;
}

/**
 * Hook to get all enabled features for the current user
 */
export function useEnabledFeatures(): string[] {
  const user = useUser();
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    const enabled: string[] = [];

    Object.keys(FEATURE_FLAGS).forEach(feature => {
      const key = feature as keyof typeof FEATURE_FLAGS;
      if (FEATURE_FLAGS[key] || (user?.id && hasPhase2Access(user.id, key))) {
        enabled.push(feature);
      }
    });

    setFeatures(enabled);
  }, [user?.id]);

  return features;
}