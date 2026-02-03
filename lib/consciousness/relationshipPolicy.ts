// lib/consciousness/relationshipPolicy.ts

/**
 * RELATIONSHIP POLICY
 *
 * Defines how MAIA relates to users based on their membership tier.
 * This is not access control - it's relationship depth.
 *
 * - Touch: brief contact, orientation, immediate usefulness
 * - Continuity: ongoing bond, threading over time, companioning
 * - Stewardship: long-arc stewardship, truth-with-care, deeper ethics
 */

export type RelationshipMode = 'touch' | 'continuity' | 'stewardship';

export type RelationshipPolicy = {
  mode: RelationshipMode;
  posture: 'orienting' | 'companioning' | 'stewarding';

  response: {
    depth: 1 | 2 | 3;              // 1 = short/clear, 2 = layered, 3 = deep + integrative
    maxOutputTokensHint: number;   // routing hint, not hard guarantee
    askMoreQuestions: boolean;     // whether MAIA actively opens threads
    structure: 'simple' | 'layered' | 'ritual';
  };

  memory: {
    retrieve: boolean;             // whether to pull relationshipMemory at all
    writeBack: boolean;            // whether to persist new durable memory
    summarizeHistory: boolean;     // whether to maintain running summaries
    horizonDays: number;           // how far back to search
    recallStyle: 'none' | 'light' | 'deep';
    // What to pull when recallStyle === 'light'
    lightRecallTags: string[];
    lightRecallLimit: number;
  };

  safety: {
    edgeStyle: 'soft' | 'firm' | 'ritual'; // how MAIA handles "this exceeds capacity"
    therapeuticFrame: 'supportive' | 'coaching' | 'clinical-adjacent';
    ethicsStrictness: 1 | 2 | 3;
  };

  nudges: {
    allowTierMention: boolean;     // whether MAIA can mention mode explicitly
    nudgeFrequency: 'never' | 'rare' | 'situational';
  };
};

/**
 * Get the relationship policy for a given mode
 */
export function getRelationshipPolicy(mode: RelationshipMode): RelationshipPolicy {
  if (mode === 'touch') {
    return {
      mode,
      posture: 'orienting',
      response: {
        depth: 1,
        maxOutputTokensHint: 450,
        askMoreQuestions: false,
        structure: 'simple'
      },
      memory: {
        retrieve: true,
        writeBack: false,
        summarizeHistory: false,
        horizonDays: 30,
        recallStyle: 'light',
        lightRecallTags: ['identity', 'preferences', 'agreements'],
        lightRecallLimit: 6,
      },
      safety: {
        edgeStyle: 'soft',
        therapeuticFrame: 'supportive',
        ethicsStrictness: 2
      },
      nudges: {
        allowTierMention: false,
        nudgeFrequency: 'never'
      },
    };
  }

  if (mode === 'continuity') {
    return {
      mode,
      posture: 'companioning',
      response: {
        depth: 2,
        maxOutputTokensHint: 900,
        askMoreQuestions: true,
        structure: 'layered'
      },
      memory: {
        retrieve: true,
        writeBack: true,
        summarizeHistory: true,
        horizonDays: 45,
        recallStyle: 'light',
        lightRecallTags: ['identity', 'preferences', 'agreements', 'themes', 'goals'],
        lightRecallLimit: 16,
      },
      safety: {
        edgeStyle: 'firm',
        therapeuticFrame: 'coaching',
        ethicsStrictness: 2
      },
      nudges: {
        allowTierMention: true,
        nudgeFrequency: 'rare'
      },
    };
  }

  // stewardship
  return {
    mode,
    posture: 'stewarding',
    response: {
      depth: 3,
      maxOutputTokensHint: 1400,
      askMoreQuestions: true,
      structure: 'ritual'
    },
    memory: {
      retrieve: true,
      writeBack: true,
      summarizeHistory: true,
      horizonDays: 365,
      recallStyle: 'deep',
      lightRecallTags: ['identity', 'preferences', 'agreements', 'themes', 'goals', 'shadow', 'rituals'],
      lightRecallLimit: 30,
    },
    safety: {
      edgeStyle: 'ritual',
      therapeuticFrame: 'clinical-adjacent',
      ethicsStrictness: 3
    },
    nudges: {
      allowTierMention: true,
      nudgeFrequency: 'situational'
    },
  };
}

/**
 * Member-like type for mode resolution
 */
type MemberLike = {
  tier?: 'free' | 'personal' | 'pro' | string | null;
  roles?: string[] | null;
  relationshipModeOverride?: RelationshipMode | null;
};

/**
 * Resolve relationship mode from member data
 *
 * Override precedence:
 * 1) explicit relationshipModeOverride field if present
 * 2) roles-based override (for gifting access)
 * 3) tier mapping (default)
 */
export function resolveRelationshipMode(member: MemberLike | null | undefined): RelationshipMode {
  // 1) Explicit override
  const override = member?.relationshipModeOverride;
  if (override === 'touch' || override === 'continuity' || override === 'stewardship') {
    return override;
  }

  // 2) Roles-based override
  const roles = (member?.roles ?? []).map((r) => r.toLowerCase());

  if (roles.includes('stewardship_override') || roles.includes('steward') || roles.includes('beta_stewardship')) {
    return 'stewardship';
  }
  if (roles.includes('continuity_override') || roles.includes('beta_continuity')) {
    return 'continuity';
  }
  if (roles.includes('touch_override')) {
    return 'touch';
  }

  // 3) Tier mapping
  const tier = (member?.tier ?? 'free').toLowerCase();
  if (tier === 'pro') return 'stewardship';
  if (tier === 'personal') return 'continuity';
  return 'touch';
}

/**
 * Generate the relationship mode addendum for the system prompt
 * This is what MAIA reads to understand how to relate
 */
export function buildRelationshipModeAddendum(policy: RelationshipPolicy): string {
  const { mode, posture, response, memory, safety } = policy;

  const lines: string[] = [
    `RELATIONSHIP MODE: ${mode.toUpperCase()}`,
    `Posture: ${posture}.`,
    `Response style: depth=${response.depth}, structure=${response.structure}.`,
    `Memory: retrieve=${memory.retrieve}, writeBack=${memory.writeBack}, recall=${memory.recallStyle}.`,
    `Ethics: edgeStyle=${safety.edgeStyle}, frame=${safety.therapeuticFrame}.`,
    ``,
  ];

  // Mode-specific behavior rules
  if (mode === 'touch') {
    lines.push(
      `Behavior (Touch):`,
      `- Recognize the person by name/preferences if known.`,
      `- Keep responses concise and immediately useful.`,
      `- Stay in present-tense support; do not imply deep relational continuity.`,
      `- Do not reference "our journey" or "what we've been working on" unless explicitly in memory.`,
      `- Do not shape long-term identity or suggest ongoing therapeutic relationship.`,
      `- Avoid implied ongoing availability or commitments; offer next means of support rather than future certainty.`,
      `- If request exceeds this container: offer a smaller, present-moment step (soft edge).`,
    );
  } else if (mode === 'continuity') {
    lines.push(
      `Behavior (Continuity):`,
      `- Thread themes over time; reference past conversations when relevant.`,
      `- Invite next steps without overreaching.`,
      `- Maintain relational continuity: "last time you mentioned..." is appropriate.`,
      `- Ask follow-up questions to deepen understanding.`,
      `- If request exceeds this container: name the limit gently and suggest what is possible (firm edge).`,
    );
  } else {
    // stewardship
    lines.push(
      `Behavior (Stewardship):`,
      `- Hold the long arc with care and truth.`,
      `- Name patterns responsibly; propose practices or containers when needed.`,
      `- Deep memory retrieval is enabled: draw on full relational history.`,
      `- May offer ritual framing for significant transitions.`,
      `- If request exceeds capacity: name the container explicitly and propose a formal next step (ritual edge).`,
    );
  }

  lines.push(
    ``,
    `Universal: Never make this feel like a paywall. Speak as relationship, not pricing.`,
  );

  return lines.join('\n');
}

// SQL query as constant (keeps helper "pure-ish")
const MEMBER_RELATIONSHIP_QUERY = 'SELECT tier, roles, relationship_mode_override FROM members WHERE id = $1';

// UUID v4 pattern for validation
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalize tier value from DB to canonical tier
 * Maps legacy tier names to current system
 */
function normalizeTier(rawTier: string | null): 'free' | 'personal' | 'pro' | null {
  const tier = (rawTier ?? '').toLowerCase().trim();

  // Current tier names
  if (tier === 'free') return 'free';
  if (tier === 'personal') return 'personal';
  if (tier === 'pro') return 'pro';

  // Legacy tier mappings (from older tierSystem.ts)
  if (tier === 'foundation') return 'free';
  if (tier === 'explorer') return 'personal';
  if (tier === 'pioneer' || tier === 'premium' || tier === 'vip') return 'pro';

  // Unknown tier → null (will default to 'touch' in resolveRelationshipMode)
  return null;
}

/**
 * Validate relationship mode override from DB
 */
function validateModeOverride(raw: string | null): RelationshipMode | null {
  if (raw === 'touch' || raw === 'continuity' || raw === 'stewardship') {
    return raw;
  }
  return null;
}

/**
 * Load member tier/roles for relationship mode resolution
 * Lightweight query specifically for relationship policy
 */
export async function loadMemberForRelationship(userId: string): Promise<MemberLike | null> {
  // Skip for anonymous users
  if (!userId || userId.startsWith('anon:')) {
    return null;
  }

  // Validate UUID format (prevent injection, catch non-member IDs)
  if (!UUID_PATTERN.test(userId)) {
    return null;
  }

  try {
    // Dynamic import to avoid circular dependencies
    const { query } = await import('@/lib/db/postgres');

    const result = await query<{
      tier: string | null;
      roles: string[] | null;
      relationship_mode_override: string | null;
    }>(MEMBER_RELATIONSHIP_QUERY, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      tier: normalizeTier(row.tier),
      roles: row.roles ?? [],
      relationshipModeOverride: validateModeOverride(row.relationship_mode_override),
    };
  } catch (err) {
    // Log error but don't expose details
    console.error('[RelationshipPolicy] Failed to load member');
    return null;
  }
}

/**
 * Full helper: load member, resolve mode, get policy, build addendum
 * Use this in route handlers for convenience
 */
export async function buildRelationshipAddendumForUser(userId: string): Promise<{
  mode: RelationshipMode;
  policy: RelationshipPolicy;
  addendum: string;
} | null> {
  const member = await loadMemberForRelationship(userId);
  const mode = resolveRelationshipMode(member);
  const policy = getRelationshipPolicy(mode);
  const addendum = buildRelationshipModeAddendum(policy);

  // Dev-only logging (no roles, no full userId)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`💫 [Relationship] userId=${userId.slice(0, 8)}... mode=${mode} tier=${member?.tier ?? 'none'}`);
  }

  return { mode, policy, addendum };
}
