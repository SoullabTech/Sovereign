/**
 * Audience Mode Mapper
 *
 * Maps user profile fields to audience modes for copy selection.
 * Bridges the gap between DB fields (consciousness_archetype, communication_style)
 * and the copy system's audience modes (mystic, pragmatic, product).
 */

export type AudienceMode = 'mystic' | 'pragmatic' | 'product';

type UserProfileLike = {
  consciousness_archetype?: string | null; // e.g. "mystic"
  communication_style?: string | null;     // e.g. "mystical"
};

/**
 * Map user profile to audience mode
 *
 * Handles variations like "mystic" vs "mystical" by checking includes().
 * Falls back to "pragmatic" as the neutral default.
 */
export function mapAudienceMode(profile?: UserProfileLike | null): AudienceMode {
  const archetype = (profile?.consciousness_archetype || '').toLowerCase();
  const style = (profile?.communication_style || '').toLowerCase();

  // Mystic: seekers, depth work, imaginal language
  if (archetype.includes('mystic') || style.includes('mystic')) {
    return 'mystic';
  }

  // Product: technical, investors, modern users
  if (
    archetype.includes('product') ||
    archetype.includes('technical') ||
    style.includes('product') ||
    style.includes('technical')
  ) {
    return 'product';
  }

  // Default: pragmatic (coaches, developers, decision-oriented)
  return 'pragmatic';
}

/**
 * Get audience mode from any object with profile-like fields
 * Useful for contexts where the full profile isn't available
 */
export function getAudienceModeFromContext(context: {
  archetype?: string;
  style?: string;
  mode?: AudienceMode;
}): AudienceMode {
  // If explicit mode provided, use it
  if (context.mode) return context.mode;

  // Otherwise map from profile fields
  return mapAudienceMode({
    consciousness_archetype: context.archetype,
    communication_style: context.style,
  });
}
