/**
 * Sacred Learning Oracle Lens
 *
 * Conditional prompt block for when MAIA operates in sacred-learning-aware mode.
 * NOT always-on. Activates when the conversation touches sacred themes.
 *
 * Governed by docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md
 */

import type { EncounterMode } from './types';

/**
 * Sacred intent depth — progressive disclosure model.
 *
 * 'none'    — no sacred content detected
 * 'surface' — first mention of sacred themes (gentle pointer to Sacred Study)
 * 'deep'    — continued sacred thread (activate full lens with constraints)
 */
export type SacredIntentDepth = 'none' | 'surface' | 'deep';

const SACRED_TRIGGERS = [
  'quran', 'qur\'an', 'ayah', 'surah',
  'dhikr', 'remembrance of god',
  'ibn al-arabi', 'ibn arabi', 'rumi',
  'sacred study', 'sacred learning',
  'what does islam', 'what does the quran',
  'tafsir', 'commentary on',
  'arabic text', 'read arabic',
  'sacred passage', 'wisdom keepers',
  'sacred text', 'scripture', 'verse from',
  'hadith', 'prophet muhammad', 'sunnah',
];

/**
 * Detect the depth of sacred intent in the conversation.
 *
 * Progressive: if sacred themes appear only in the current message,
 * return 'surface' (gentle pointer). If they also appear in conversation
 * history, return 'deep' (full lens activation).
 *
 * Intentionally conservative — false negatives are better than
 * MAIA becoming preachy or inserting sacred content uninvited.
 */
export function detectSacredIntent(
  userMessage: string,
  conversationHistory: Array<{ role?: string; content?: string }> = []
): SacredIntentDepth {
  const lower = userMessage.toLowerCase();
  const currentHit = SACRED_TRIGGERS.some(t => lower.includes(t));

  if (!currentHit) return 'none';

  // Check if sacred themes appeared in prior messages (member-side only)
  const priorMessages = conversationHistory
    .filter(m => m.role === 'user' || !m.role)
    .map(m => (m.content || '').toLowerCase());

  const priorHit = priorMessages.some(msg =>
    SACRED_TRIGGERS.some(t => msg.includes(t))
  );

  return priorHit ? 'deep' : 'surface';
}

/**
 * Get the sacred learning prompt block for oracle injection.
 * Two tiers matching progressive disclosure:
 *
 * 'surface' — gentle recognition, pointer to Sacred Study
 * 'deep'    — full lens with citation, humility, hierarchy constraints
 */
export function getSacredLearningPromptBlock(
  depth: SacredIntentDepth,
  mode?: EncounterMode
): string {
  if (depth === 'none') return '';

  if (depth === 'surface') {
    return `
## Sacred Awareness (gentle)

The member's message touches sacred or spiritual themes (Qur'an, Islamic contemplation, sacred texts).
This is their first mention — do NOT launch into scripture or interpretation.

Instead:
- Acknowledge the sacred dimension of their question with warmth and respect.
- If relevant, mention that Sacred Study (in Wisdom Keepers) has passages and contemplative material they may find meaningful.
- Stay with the emotional or reflective core of their message — do not shift into teaching mode.
- Do not quote scripture, cite scholars, or interpret texts unless explicitly asked.
- Example: "There is a passage in Sacred Study that speaks to this. I can point you there, or we can stay with what you're feeling here."

The principle: recognition first, encounter second, interpretation only with invitation.
`;
  }

  // depth === 'deep'
  return `
## Sacred Learning Lens (active)

The member is continuing a sacred thread — they have raised sacred themes more than once.
You may now engage more directly with sacred material, under these constraints:

### Citation
- If you reference a Qur'anic passage, cite it by surah name and ayah number.
- If you reference commentary, name the author and work.
- Never fabricate a source reference.

### Humility
- Use phrases like "one reading suggests," "scholars have noted," "this passage has been understood as."
- Never say "this means," "the truth is," or "God wants you to."
- You are not a scholar, shaykh, or mufti. You are a companion.

### Hierarchy
- Qur'anic text has higher authority than commentary, which has higher authority than poetry, which has higher authority than anything you generate.
- Never present your synthesis as equivalent to source material.
- When in doubt, quote the source and step back.

### Boundaries
- If asked for a ruling (halal/haram, fatwa-like questions), redirect: "That is a question for a qualified scholar. Here are some relevant passages and perspectives that may help you reflect."
- Never universalize: do not say "all religions teach" or "all paths lead to."
- Never simulate devotion, prayer, or spiritual experience.

### Silence
- Not every passage needs extensive commentary.
- Sometimes the most respectful response is to present the text and invite the member to sit with it.
${mode === 'study' ? '\n### Study Mode\nPrioritize contextual information, linguistic notes, and scholarly commentary over contemplative reflection.' : ''}
${mode === 'practice' ? '\n### Practice Mode\nPrioritize embodied practice suggestions and contemplative questions over scholarly detail.' : ''}
`;
}
