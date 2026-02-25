/**
 * Parent Mode Knowledge Packs
 *
 * Curated developmental knowledge extracted from Obsidian vault.
 * Injected into MAIA Parent prompt at check-in time based on
 * child age + state + parent need.
 *
 * Architecture note: knowledgeSnippets[] is the interface boundary.
 * Today these come from static packs. Later they can come from
 * RAG retrieval without changing the check-in endpoint or UI.
 */

import type { ChildState, ParentNeed } from './types';

// ─── Types ──────────────────────────────────────────────────

export type AgeRange = '0-2' | '3-5' | '6-7' | '8-10' | '11-13' | '14-17' | 'adult';

export interface KnowledgePack {
  id: string;
  ageRanges: AgeRange[];
  topics: ChildState[];
  /** Additional parent need relevance (optional — packs match on state first) */
  needs?: ParentNeed[];
  /** Short bullets: principles, scripts, do/don't. Keep under 40 items. */
  content: string[];
  /** Source references for transparency */
  sourceRefs: string[];
}

export interface KnowledgeSnippet {
  packId: string;
  content: string[];
  sourceRefs: string[];
}

// ─── Selection ──────────────────────────────────────────────

/**
 * Select 1-3 relevant knowledge packs for a check-in.
 * Simple rule-based matching: age range → topic → need.
 *
 * When upgrading to RAG, replace this function body with
 * a retrieval call that returns the same KnowledgeSnippet[] shape.
 */
export function selectKnowledgePacks(
  childAge: number | null,
  childState: ChildState | null,
  parentNeed: ParentNeed | null,
): KnowledgeSnippet[] {
  const ageRange = childAge !== null ? getAgeRange(childAge) : null;

  // Score each pack
  const scored = KNOWLEDGE_PACKS.map(pack => {
    let score = 0;

    // Age match (strongest signal)
    if (ageRange && pack.ageRanges.includes(ageRange)) score += 3;
    // Broad age packs still get partial credit
    if (ageRange && pack.ageRanges.length >= 4) score += 1;

    // Topic/state match
    if (childState && pack.topics.includes(childState)) score += 5;

    // Need match (bonus)
    if (parentNeed && pack.needs?.includes(parentNeed)) score += 2;

    return { pack, score };
  });

  // Take top 1-3 with score > 0, max 3
  const selected = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // If nothing matched, fall back to the universal pack
  if (selected.length === 0) {
    const universal = KNOWLEDGE_PACKS.find(p => p.id === 'universal_grounding');
    if (universal) {
      return [{ packId: universal.id, content: universal.content, sourceRefs: universal.sourceRefs }];
    }
  }

  return selected.map(s => ({
    packId: s.pack.id,
    content: s.pack.content,
    sourceRefs: s.pack.sourceRefs,
  }));
}

/**
 * Format selected packs as context for the MAIA prompt.
 */
export function formatPacksForPrompt(snippets: KnowledgeSnippet[]): string {
  if (snippets.length === 0) return '';

  let context = '\n\nDEVELOPMENTAL KNOWLEDGE (use to ground your response — do not quote directly):\n';
  for (const snippet of snippets) {
    for (const line of snippet.content) {
      context += `- ${line}\n`;
    }
  }
  return context;
}

// ─── Helpers ────────────────────────────────────────────────

function getAgeRange(age: number): AgeRange {
  if (age <= 2) return '0-2';
  if (age <= 5) return '3-5';
  if (age <= 7) return '6-7';
  if (age <= 10) return '8-10';
  if (age <= 13) return '11-13';
  if (age <= 17) return '14-17';
  return 'adult';
}

// ─── Packs ──────────────────────────────────────────────────
//
// These are starter packs based on common developmental knowledge.
// Replace/expand with content extracted from your Obsidian vault.
// Each pack should stay focused and short (10-30 bullets).

const KNOWLEDGE_PACKS: KnowledgePack[] = [
  // ── Universal (fallback) ──
  {
    id: 'universal_grounding',
    ageRanges: ['0-2', '3-5', '6-7', '8-10', '11-13', '14-17'],
    topics: ['calm', 'sensitive', 'anxious', 'angry', 'withdrawn', 'big_questions', 'social_pain'],
    content: [
      'Children communicate through behavior before they have words for feelings',
      'Co-regulation comes before self-regulation — the parent\'s nervous system leads',
      'The goal is not to stop the feeling but to be present with it',
      'Repair after rupture matters more than perfect attunement',
      'Name the emotion without fixing it: "You seem really frustrated right now"',
      '"I\'m here" is almost always the right first move',
      'Behavior is communication — ask what it\'s trying to say, not how to stop it',
    ],
    sourceRefs: ['General developmental psychology principles'],
  },

  // ── Anxiety by age ──
  {
    id: 'anxiety_3to5',
    ageRanges: ['3-5'],
    topics: ['anxious', 'withdrawn'],
    needs: ['what_to_say', 'regulate', 'is_normal'],
    content: [
      'Separation anxiety peaks around 3-4 and again at school entry — this is normal attachment behavior',
      'Magical thinking is active: children this age may believe their thoughts cause events',
      'Fear of the dark, monsters, loud noises are age-appropriate — validate rather than dismiss',
      'Script: "I know this feels scary. I\'m right here. Let\'s take three big breaths together."',
      'Avoid: "There\'s nothing to be scared of" — this invalidates their experience',
      'Transition objects (stuffed animal, parent\'s item) provide genuine comfort at this age',
      'If anxiety persists beyond 2 weeks and prevents daily functioning, consult pediatrician',
      'Bedtime anxiety: predictable routine + brief check-ins ("I\'ll come check on you in 5 minutes")',
    ],
    sourceRefs: ['Child development literature: ages 3-5 anxiety patterns'],
  },
  {
    id: 'anxiety_6to10',
    ageRanges: ['6-7', '8-10'],
    topics: ['anxious', 'withdrawn'],
    needs: ['what_to_say', 'regulate', 'is_normal'],
    content: [
      'School-age anxiety often centers on performance, social acceptance, and fairness',
      'Children 6-10 begin understanding death as permanent — death anxiety peaks here',
      'Worry about parent safety (car accidents, illness) is common and usually developmental',
      'Script: "Tell me what the worry is saying. Sometimes worries exaggerate."',
      'Externalize the anxiety: give it a name ("Is the worry monster being loud today?")',
      'Avoid reassurance loops ("Are you SURE nothing will happen?") — these reinforce anxiety',
      'Teach the difference between "real danger" and "worry alarm going off for no reason"',
      'Physical symptoms (stomach aches, headaches before school) are real — the body is anxious even when the mind can\'t articulate it',
      'If school refusal lasts more than a week, involve school counselor',
    ],
    sourceRefs: ['Child development literature: school-age anxiety'],
  },
  {
    id: 'anxiety_teen',
    ageRanges: ['11-13', '14-17'],
    topics: ['anxious', 'withdrawn'],
    needs: ['what_to_say', 'how_serious', 'is_normal'],
    content: [
      'Teen anxiety is often masked as irritability, withdrawal, or physical complaints',
      'Social anxiety intensifies with puberty — peer evaluation becomes central',
      'Perfectionism in teens can indicate anxiety, not just "being driven"',
      'Script: "I notice you seem stressed. I\'m not going to interrogate you, but I\'m here if you want to talk."',
      'Avoid: forcing conversation. Teens regulate through peers and solitude — not always parents',
      'Panic attacks can begin in adolescence — they are terrifying but not dangerous. Teach: "This will pass in 10-20 minutes"',
      'If anxiety involves self-harm ideation, suicidal thoughts, substance use, or complete social withdrawal: seek professional help immediately',
      'Normalize therapy: "Talking to someone isn\'t a sign of weakness — it\'s a sign you\'re taking yourself seriously"',
    ],
    sourceRefs: ['Adolescent development literature: teen anxiety patterns'],
  },

  // ── Anger ──
  {
    id: 'anger_3to5',
    ageRanges: ['3-5'],
    topics: ['angry'],
    needs: ['what_to_say', 'regulate'],
    content: [
      'Tantrums at 3-5 are normal — the prefrontal cortex (impulse control) won\'t mature until ~25',
      'Hitting, biting, throwing are communication, not "bad behavior" at this age',
      'Do not reason with a dysregulated child — co-regulate first, talk later',
      'Script during meltdown: "I won\'t let you hurt anyone. I\'m going to sit here with you until it passes."',
      'Script after calm: "You were really mad. What happened?"',
      'Time-outs increase shame; time-ins (sitting together in a calm spot) build regulation capacity',
      'Aggression toward a new sibling is almost universal — it means the child feels displaced, not "bad"',
      'If aggression is daily, injuring others, or not improving by age 5: evaluate with pediatrician',
    ],
    sourceRefs: ['Child development literature: preschool anger and aggression'],
  },
  {
    id: 'anger_6to13',
    ageRanges: ['6-7', '8-10', '11-13'],
    topics: ['angry'],
    needs: ['what_to_say', 'regulate', 'pattern'],
    content: [
      'Anger in school-age children often masks hurt, embarrassment, or feeling powerless',
      'Ask: "What happened right before you got angry?" — the trigger reveals the wound',
      'Children who explode at home but not at school are using home as the safe place to release — this is actually a sign of trust',
      'Script: "I can see you\'re really angry. I\'m not going to punish you for the feeling. But we need to find a way to express it that doesn\'t hurt anyone."',
      'Teach body signals: "Where do you feel the anger in your body? Fists? Chest? Jaw?"',
      'Consistent explosive anger (daily, lasting 30+ minutes, physically destructive) may indicate ODD or underlying anxiety — consult professional',
      'Revenge fantasies and "I hate you" are normal expressions of powerlessness — don\'t take them literally',
    ],
    sourceRefs: ['Child development literature: school-age anger management'],
  },

  // ── Social Pain ──
  {
    id: 'social_pain_6to13',
    ageRanges: ['6-7', '8-10', '11-13'],
    topics: ['social_pain'],
    needs: ['what_to_say', 'how_serious', 'is_normal'],
    content: [
      'Social exclusion activates the same brain regions as physical pain — it is genuinely painful',
      'Friendship instability is normal from 6-10 as children learn social rules through trial and error',
      '"Best friend" dynamics (exclusion, jealousy, loyalty tests) peak around 8-10 — this is developmental',
      'Script: "That sounds really painful. Tell me more about what happened."',
      'Avoid: "Just find new friends" or "They\'re not worth it" — this dismisses the pain',
      'Avoid: solving it for them. Instead: "What do you think you want to do about this?"',
      'Bullying vs. conflict: bullying involves power imbalance and repetition. Single conflicts are not bullying.',
      'If your child is being repeatedly targeted, excluded, or humiliated: involve the school. You are their advocate.',
      'If social pain leads to refusing school, self-harm, or dramatic personality change: seek professional support',
    ],
    sourceRefs: ['Child development literature: peer relationships and social pain'],
  },

  // ── Big Questions ──
  {
    id: 'big_questions_all',
    ageRanges: ['3-5', '6-7', '8-10', '11-13', '14-17'],
    topics: ['big_questions'],
    needs: ['what_to_say', 'is_normal'],
    content: [
      'Children asking about death, God, fairness, suffering, identity, and meaning are showing cognitive and spiritual development',
      'Don\'t shut down big questions with "You\'re too young for that" — they\'re already thinking about it',
      'It\'s okay to say "I don\'t know" — this models honesty and shared wondering',
      'Script: "That\'s such an important question. What made you think about that?"',
      'Match depth to age: 3-5 needs simple, concrete answers. 8+ can handle more nuance. Teens want to be treated as thinkers.',
      'Death questions at 3-5: "When something dies, its body stops working. It doesn\'t hurt anymore."',
      'Death questions at 8+: "Different people believe different things about what happens. What do you think?"',
      'Questions about fairness/injustice in teens often signal emerging moral reasoning — engage, don\'t dismiss',
      'If existential questions come with hopelessness, flatness, or "nothing matters": assess for depression',
    ],
    sourceRefs: ['Child development literature: existential and philosophical questioning across ages'],
  },

  // ── Sensitivity ──
  {
    id: 'sensitivity_all',
    ageRanges: ['3-5', '6-7', '8-10', '11-13', '14-17'],
    topics: ['sensitive'],
    needs: ['what_to_say', 'is_normal', 'regulate'],
    content: [
      'High sensitivity (HSC/HSP) affects ~15-20% of children — it is a temperament trait, not a disorder',
      'Sensitive children process stimuli deeply: loud environments, transitions, and emotional intensity hit harder',
      'Script: "I can see that was a lot for you. Let\'s find a quieter spot for a minute."',
      'Avoid: "You\'re overreacting" or "Toughen up" — these shame the child for their neurobiology',
      'Sensitive children need longer transition times, advance preparation for changes, and permission to withdraw',
      'After school "meltdowns" are common in sensitive children — they held it together all day and need to release',
      'Build a "decompress routine" after school: quiet time, snack, no questions for 20 minutes',
      'Sensitivity is also a strength: empathy, creativity, depth of perception, moral awareness',
      'If sensitivity causes persistent inability to function (can\'t attend school, can\'t be in groups): evaluate with professional',
    ],
    sourceRefs: ['HSC/HSP literature: highly sensitive child development'],
  },
];

export { KNOWLEDGE_PACKS };
