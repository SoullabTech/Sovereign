export interface NormalizedPattern {
  patternKey: string;
  patternLabel: string;
  patternType: 'pattern' | 'growth_edge';
}

// Canonical mappings: common phrasings -> stable key
const CANONICAL_MAPPINGS: Array<{ patterns: RegExp[]; key: string; label: string }> = [
  {
    patterns: [/conflict.*withdraw|withdraw.*conflict|pull.*back.*conflict|retreat.*conflict|avoid.*conflict/i],
    key: 'conflict_withdrawal',
    label: 'Withdraws under conflict',
  },
  {
    patterns: [/self.critic|inner critic|harsh.*self|judge.*self|self.attack|self.blame/i],
    key: 'self_criticism',
    label: 'Strong inner critic',
  },
  {
    patterns: [/people.pleas|approval.seek|need.*approval|fear.*disappoint/i],
    key: 'approval_seeking',
    label: 'Approval-seeking pattern',
  },
  {
    patterns: [/abandon|fear.*left|being left|being alone/i],
    key: 'abandonment_fear',
    label: 'Fear of abandonment',
  },
  {
    patterns: [/overwork|overfunction|can.*t.*rest|can't stop|compulsive.*work/i],
    key: 'overfunctioning',
    label: 'Overfunctioning / difficulty resting',
  },
  {
    patterns: [/perfecti[o]n|never.*enough|not.*good.*enough/i],
    key: 'perfectionism',
    label: 'Perfectionism pattern',
  },
  {
    patterns: [/intimacy|vulner|being seen|fear.*close|fear.*intimate/i],
    key: 'intimacy_avoidance',
    label: 'Avoids emotional intimacy',
  },
  {
    patterns: [/control|need.*certainty|intolera.*uncertain|unpredictabl/i],
    key: 'control_pattern',
    label: 'Difficulty with uncertainty',
  },
  {
    patterns: [/grief|loss|mourn|bereavement/i],
    key: 'grief_processing',
    label: 'Active grief / loss processing',
  },
  {
    patterns: [/identity|who.*am.*i|sense.*self|self.*defini/i],
    key: 'identity_questioning',
    label: 'Identity questioning',
  },
];

export function normalizePatternInsight(
  insightText: string,
  insightType: 'pattern' | 'growth_edge'
): NormalizedPattern {
  const text = insightText.trim();

  // Try canonical mappings first
  for (const mapping of CANONICAL_MAPPINGS) {
    if (mapping.patterns.some(re => re.test(text))) {
      return {
        patternKey: mapping.key,
        patternLabel: mapping.label,
        patternType: insightType,
      };
    }
  }

  // Fallback: derive key from text
  const key = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join('_');

  const label = text.length > 80 ? text.slice(0, 77) + '...' : text;

  return {
    patternKey: key || 'unknown_pattern',
    patternLabel: label,
    patternType: insightType,
  };
}
