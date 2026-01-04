/**
 * Soul Vocabulary - Glossary of terms used in MAIA conversations
 *
 * These terms are automatically highlighted with tooltips for newcomers.
 */

export interface VocabularyTerm {
  term: string;
  aliases?: string[];  // Alternative spellings/forms
  definition: string;
  category: 'alchemy' | 'psychology' | 'elemental' | 'archetype' | 'spiritual' | 'somatic';
  depth: 'beginner' | 'intermediate' | 'advanced';
  relatedTerms?: string[];
  emoji?: string;
}

export const soulVocabulary: VocabularyTerm[] = [
  // Alchemy
  {
    term: 'nigredo',
    aliases: ['blackening', 'dark night'],
    definition: 'The first stage of transformation — a necessary descent into darkness where old patterns dissolve. Often feels like breakdown before breakthrough.',
    category: 'alchemy',
    depth: 'intermediate',
    relatedTerms: ['albedo', 'rubedo', 'shadow'],
    emoji: '🌑'
  },
  {
    term: 'albedo',
    aliases: ['whitening', 'purification'],
    definition: 'The second stage of transformation — washing away impurities, gaining clarity. A time of reflection and understanding what was revealed in nigredo.',
    category: 'alchemy',
    depth: 'intermediate',
    relatedTerms: ['nigredo', 'rubedo'],
    emoji: '🌕'
  },
  {
    term: 'rubedo',
    aliases: ['reddening', 'integration'],
    definition: 'The final stage of transformation — integration and embodiment. The wisdom gained becomes part of who you are.',
    category: 'alchemy',
    depth: 'intermediate',
    relatedTerms: ['nigredo', 'albedo'],
    emoji: '🔴'
  },
  {
    term: 'prima materia',
    definition: 'The raw material of transformation — often the very thing we resist or reject about ourselves. Contains hidden gold.',
    category: 'alchemy',
    depth: 'advanced',
    emoji: '⚗️'
  },
  {
    term: 'opus',
    aliases: ['the work', 'great work'],
    definition: 'The ongoing work of self-transformation. Not a destination but a continuous process of becoming.',
    category: 'alchemy',
    depth: 'intermediate',
    emoji: '🔥'
  },

  // Psychology (Jungian)
  {
    term: 'shadow',
    aliases: ['shadow self', 'shadow work'],
    definition: 'The parts of ourselves we\'ve hidden, denied, or rejected. Contains both our wounds and our unlived potential. Integration, not elimination, is the goal.',
    category: 'psychology',
    depth: 'beginner',
    relatedTerms: ['projection', 'integration'],
    emoji: '🌘'
  },
  {
    term: 'projection',
    definition: 'When we see in others what we can\'t yet see in ourselves — both positive and negative qualities. Often triggers strong emotional reactions.',
    category: 'psychology',
    depth: 'beginner',
    relatedTerms: ['shadow', 'mirror'],
    emoji: '🪞'
  },
  {
    term: 'anima',
    definition: 'The feminine aspect within masculine-identified people. Carries intuition, feeling, and connection to the unconscious.',
    category: 'psychology',
    depth: 'intermediate',
    relatedTerms: ['animus', 'integration'],
    emoji: '🌙'
  },
  {
    term: 'animus',
    definition: 'The masculine aspect within feminine-identified people. Carries assertion, logic, and the capacity for focused action.',
    category: 'psychology',
    depth: 'intermediate',
    relatedTerms: ['anima', 'integration'],
    emoji: '☀️'
  },
  {
    term: 'individuation',
    definition: 'The lifelong process of becoming who you truly are — integrating all parts of yourself into a coherent whole.',
    category: 'psychology',
    depth: 'intermediate',
    relatedTerms: ['shadow', 'Self'],
    emoji: '🌀'
  },
  {
    term: 'complex',
    definition: 'A cluster of emotions, memories, and patterns that operate somewhat autonomously. "We don\'t have complexes; they have us."',
    category: 'psychology',
    depth: 'intermediate',
    emoji: '🔗'
  },
  {
    term: 'Self',
    aliases: ['the Self', 'higher self'],
    definition: 'The organizing center of the psyche — your deepest nature that guides individuation. Different from ego (the "I" you know).',
    category: 'psychology',
    depth: 'intermediate',
    relatedTerms: ['ego', 'individuation'],
    emoji: '✨'
  },
  {
    term: 'ego',
    definition: 'The conscious "I" — the part of you that navigates daily life. Necessary but not the whole story.',
    category: 'psychology',
    depth: 'beginner',
    relatedTerms: ['Self', 'persona'],
    emoji: '👤'
  },
  {
    term: 'persona',
    definition: 'The social mask we wear — how we present ourselves to the world. Useful but can become a trap if we forget it\'s not who we really are.',
    category: 'psychology',
    depth: 'beginner',
    relatedTerms: ['ego', 'shadow'],
    emoji: '🎭'
  },

  // Elemental
  {
    term: 'fire element',
    aliases: ['fire', 'fire energy'],
    definition: 'The energy of transformation, passion, will, and purpose. Associated with action, creativity, and the drive to become.',
    category: 'elemental',
    depth: 'beginner',
    emoji: '🔥'
  },
  {
    term: 'water element',
    aliases: ['water', 'water energy'],
    definition: 'The energy of emotion, intuition, and flow. Associated with feeling, receptivity, and the wisdom of letting go.',
    category: 'elemental',
    depth: 'beginner',
    emoji: '💧'
  },
  {
    term: 'earth element',
    aliases: ['earth', 'earth energy'],
    definition: 'The energy of grounding, stability, and embodiment. Associated with the body, practical action, and material reality.',
    category: 'elemental',
    depth: 'beginner',
    emoji: '🌿'
  },
  {
    term: 'air element',
    aliases: ['air', 'air energy'],
    definition: 'The energy of mind, communication, and clarity. Associated with thought, perspective, and the breath of inspiration.',
    category: 'elemental',
    depth: 'beginner',
    emoji: '💨'
  },
  {
    term: 'aether',
    aliases: ['ether', 'quintessence', 'spirit element'],
    definition: 'The fifth element — spirit, consciousness, the space that holds all others. Associated with meaning, connection, and transcendence.',
    category: 'elemental',
    depth: 'intermediate',
    emoji: '✨'
  },

  // Archetypes
  {
    term: 'archetype',
    definition: 'Universal patterns of human experience that live in the collective unconscious. They shape our stories, dreams, and ways of being.',
    category: 'archetype',
    depth: 'beginner',
    emoji: '🎴'
  },
  {
    term: 'the Sage',
    aliases: ['sage', 'wise old man', 'crone'],
    definition: 'The archetype of wisdom, guidance, and deep knowing. Appears when we need perspective beyond our current understanding.',
    category: 'archetype',
    depth: 'beginner',
    emoji: '🦉'
  },
  {
    term: 'the Lover',
    aliases: ['lover archetype'],
    definition: 'The archetype of passion, connection, and appreciation of beauty. Teaches us to fully engage with life and others.',
    category: 'archetype',
    depth: 'beginner',
    emoji: '❤️'
  },
  {
    term: 'the Warrior',
    aliases: ['warrior archetype'],
    definition: 'The archetype of courage, discipline, and protection. Teaches us to stand for what matters and face challenges directly.',
    category: 'archetype',
    depth: 'beginner',
    emoji: '⚔️'
  },
  {
    term: 'the Magician',
    aliases: ['magician archetype', 'alchemist'],
    definition: 'The archetype of transformation and manifestation. Understands the laws of change and can work with them consciously.',
    category: 'archetype',
    depth: 'intermediate',
    emoji: '🔮'
  },
  {
    term: 'the Sovereign',
    aliases: ['king', 'queen', 'sovereign archetype'],
    definition: 'The archetype of wholeness, blessing, and right order. Represents mature leadership of one\'s own life and domain.',
    category: 'archetype',
    depth: 'intermediate',
    emoji: '👑'
  },

  // Spiritual
  {
    term: 'presence',
    definition: 'The quality of being fully here, now — aware and awake to this moment without being lost in thought about past or future.',
    category: 'spiritual',
    depth: 'beginner',
    emoji: '🧘'
  },
  {
    term: 'witness',
    aliases: ['witnessing', 'observer'],
    definition: 'The part of consciousness that can observe experience without being completely identified with it. Creates space for choice.',
    category: 'spiritual',
    depth: 'intermediate',
    emoji: '👁️'
  },
  {
    term: 'integration',
    definition: 'The process of bringing separated parts back into wholeness. Not about fixing, but about including and embracing.',
    category: 'spiritual',
    depth: 'beginner',
    relatedTerms: ['shadow', 'individuation'],
    emoji: '🌀'
  },
  {
    term: 'liminal',
    aliases: ['liminal space', 'threshold'],
    definition: 'The in-between space — neither here nor there. A place of transformation where old structures dissolve before new ones form.',
    category: 'spiritual',
    depth: 'intermediate',
    emoji: '🚪'
  },

  // Somatic
  {
    term: 'somatic',
    aliases: ['soma', 'body-based'],
    definition: 'Relating to the body and its wisdom. The body often knows things before the mind catches up.',
    category: 'somatic',
    depth: 'beginner',
    emoji: '🫀'
  },
  {
    term: 'felt sense',
    definition: 'The body\'s way of knowing — a felt, embodied experience that carries meaning. Often hard to put into words but deeply informative.',
    category: 'somatic',
    depth: 'intermediate',
    emoji: '✋'
  },
  {
    term: 'grounding',
    definition: 'Practices that help you feel connected to your body and the earth. Useful when feeling scattered, anxious, or overwhelmed.',
    category: 'somatic',
    depth: 'beginner',
    emoji: '🌳'
  },
  {
    term: 'regulation',
    aliases: ['self-regulation', 'nervous system regulation'],
    definition: 'The ability to return to a balanced state after activation. Can be learned and strengthened through practice.',
    category: 'somatic',
    depth: 'beginner',
    emoji: '🌊'
  },
];

// Create a map for quick lookup
export const vocabularyMap = new Map<string, VocabularyTerm>();

soulVocabulary.forEach(term => {
  vocabularyMap.set(term.term.toLowerCase(), term);
  term.aliases?.forEach(alias => {
    vocabularyMap.set(alias.toLowerCase(), term);
  });
});

/**
 * Find vocabulary terms in a text string
 */
export function findTermsInText(text: string): { term: VocabularyTerm; start: number; end: number }[] {
  const found: { term: VocabularyTerm; start: number; end: number }[] = [];
  const lowerText = text.toLowerCase();

  soulVocabulary.forEach(vocabTerm => {
    const termsToSearch = [vocabTerm.term, ...(vocabTerm.aliases || [])];

    termsToSearch.forEach(searchTerm => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      let index = lowerText.indexOf(lowerSearchTerm);

      while (index !== -1) {
        // Check word boundaries
        const before = index === 0 ? ' ' : lowerText[index - 1];
        const after = index + lowerSearchTerm.length >= lowerText.length
          ? ' '
          : lowerText[index + lowerSearchTerm.length];

        if (!/[a-z]/.test(before) && !/[a-z]/.test(after)) {
          found.push({
            term: vocabTerm,
            start: index,
            end: index + searchTerm.length
          });
        }

        index = lowerText.indexOf(lowerSearchTerm, index + 1);
      }
    });
  });

  // Sort by position and remove overlaps
  found.sort((a, b) => a.start - b.start);

  const deduped: typeof found = [];
  for (const item of found) {
    const last = deduped[deduped.length - 1];
    if (!last || item.start >= last.end) {
      deduped.push(item);
    }
  }

  return deduped;
}

/**
 * Get terms by category
 */
export function getTermsByCategory(category: VocabularyTerm['category']): VocabularyTerm[] {
  return soulVocabulary.filter(t => t.category === category);
}

/**
 * Get terms by depth level
 */
export function getTermsByDepth(depth: VocabularyTerm['depth']): VocabularyTerm[] {
  return soulVocabulary.filter(t => t.depth === depth);
}

export default soulVocabulary;
