/**
 * Passage Blocks — Soul Mirror content layer
 *
 * Source-of-truth content layer for the Elemental Alchemy field.
 * 34 doorways extracted from Ch5-9 of the book.
 *
 * Each block is a self-contained experiential unit. Selection rule:
 * - stands alone
 * - produces internal shift
 * - requires no explanation before or after
 *
 * MVP: opening line only (full passage extraction is Phase 2).
 *
 * See: docs/book-studio/PASSAGE_BLOCKS_INDEX.md
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface PassageBlock {
  id: string;
  element: Element;
  title: string;
  source: string;
  feltState: readonly string[];
  readTime: string;
  openingLine: string;
  pairsWith?: string;
  isPolarity?: boolean;
  notes?: string;
}

export const PASSAGE_BLOCKS: readonly PassageBlock[] = [
  // ── Fire ────────────────────────────────────────────────────────────
  {
    id: 'FIRE-01',
    element: 'fire',
    title: 'The Campfire with Augusten',
    source: 'Chapter 5',
    feltState: ['kindling', 'gathering', 'presence', 'father-and-son', 'dusk'],
    readTime: '~3 min',
    pairsWith: 'FIRE-02',
    openingLine:
      'I write these words as I sit down, welcomed by another stunning sunset and the dawn of night.',
  },
  {
    id: 'FIRE-02',
    element: 'fire',
    title: 'The Glowing Embers',
    source: 'Chapter 5',
    feltState: ['stillness', 'imagination kindling', 'pareidolia', 'inward turning'],
    readTime: '~2 min',
    pairsWith: 'FIRE-01',
    openingLine:
      'When I add a new log to the campfire, it will eventually reach its peak as it burns hot and brightly.',
  },
  {
    id: 'FIRE-03',
    element: 'fire',
    title: 'Rekindling — David',
    source: 'Chapter 5',
    feltState: ['despair', 'spark returning', 'vision restored', 'companionship in the dark'],
    readTime: '~2 min',
    openingLine:
      'An example is when my client David came into a session grieving the loss of his youth and anxious about his future.',
  },
  {
    id: 'FIRE-04',
    element: 'fire',
    title: 'The Peyote Firekeeper',
    source: 'Chapter 5',
    feltState: ['lineage', 'sacred witnessing', 'being seen', 'awe'],
    readTime: '~2 min',
    openingLine:
      'I remember the first time I took part in a Peyote prayer meeting and witnessed the firekeeper maintaining the sacred fire throughout the night and into the early morning while the rituals flowed around the teepee circle.',
  },
  {
    id: 'FIRE-05',
    element: 'fire',
    title: 'Being Present with the Inner Fire',
    source: 'Chapter 5',
    feltState: ['tending', 'gentleness', 'ember-sized devotion', 'receiving'],
    readTime: '~2 min',
    openingLine:
      'Listening, watching, hearing, sensing, and feeling are the true essence of being present.',
  },
  {
    id: 'FIRE-06',
    element: 'fire',
    title: 'The Young Client and the Video Games',
    source: 'Chapter 5',
    feltState: ['calling answered', 'passion redeemed', 'lost-to-found'],
    readTime: '~1 min',
    openingLine:
      'For example, a young client who was lost in his teenage angst, bound to their bedroom playing video games nonstop, transformed his life by answering the call of his passion for video games.',
  },
  {
    id: 'FIRE-07',
    element: 'fire',
    title: 'When Fire Burns Too Hot',
    source: 'Chapter 5',
    feltState: ['excess', 'ego inflation', 'Icarus', 'burning out'],
    readTime: '~2 min',
    isPolarity: true,
    openingLine:
      'One of the most destructive facets of fire is its tendency to become manic, hypersensitive, or hypervigilant.',
    notes: 'Polarity — surface only on later encounters.',
  },

  // ── Water ───────────────────────────────────────────────────────────
  {
    id: 'WATER-01',
    element: 'water',
    title: 'The Sweat Lodge — Third Round',
    source: 'Chapter 6',
    feltState: ['dark night', 'threshold', 'surrender', 'returned to flow'],
    readTime: '~2 min',
    isPolarity: true,
    openingLine:
      'I experience these moments most starkly in ceremonies when everything seems most magical and mysterious, then boom!',
    notes: 'Polarity — surface only on later encounters.',
  },
  {
    id: 'WATER-02',
    element: 'water',
    title: 'Sophie and the Hot Chocolate',
    source: 'Chapter 6',
    feltState: ['seasonal turning', 'home', 'melancholy beauty', 'returning'],
    readTime: '~3 min',
    pairsWith: 'WATER-03',
    openingLine: 'Nothing stirs the emotions like changes in season.',
  },
  {
    id: 'WATER-03',
    element: 'water',
    title: 'Perfectly Imperfect at Home',
    source: 'Chapter 6',
    feltState: ['humility', 'family forgiveness', 'imperfect love', 'accountability'],
    readTime: '~2 min',
    pairsWith: 'WATER-02',
    openingLine: "Even so, I'm perfectly imperfect.",
  },
  {
    id: 'WATER-04',
    element: 'water',
    title: 'Letting Go of Control',
    source: 'Chapter 6',
    feltState: ['surrender', 'deeper source', 'welcoming the dark'],
    readTime: '~1 min',
    openingLine:
      'If we are lucky, we all have those inflection points where it feels like all is lost and there is no control.',
  },
  {
    id: 'WATER-05',
    element: 'water',
    title: 'New Clients in Tears',
    source: 'Chapter 6',
    feltState: ['arrival', 'falling apart as healing', 'spiral progress'],
    readTime: '~1 min',
    openingLine:
      'I see new clients often in this state where they can no longer hold it in or control things.',
  },
  {
    id: 'WATER-06',
    element: 'water',
    title: 'Misting the Bonsai',
    source: 'Chapter 6',
    feltState: ['quiet attunement', 'daily care', 'nourishing', 'feeling what is here'],
    readTime: '~1 min',
    openingLine:
      'This water way of knowing is sensuous, spacious, and life-nurturing.',
    notes: 'Soft entry — used for unsure routing.',
  },
  {
    id: 'WATER-07',
    element: 'water',
    title: 'When Helpers Forget Themselves',
    source: 'Chapter 6',
    feltState: ['caretaking', 'self-forgetting', "the helper's wound", 'returning attention inward'],
    readTime: '~2 min',
    openingLine:
      'While emotional depth is an important part of our humanity, it also comes with a cost.',
  },

  // ── Earth ───────────────────────────────────────────────────────────
  {
    id: 'EARTH-01',
    element: 'earth',
    title: 'Bill in the Garden',
    source: 'Chapter 7',
    feltState: ['elixir found', 'service as medicine', 'coming alive', 'embodied healing'],
    readTime: '~2 min',
    openingLine:
      'I have observed that my clients who are depressed often improve when invited to be in service to others.',
  },
  {
    id: 'EARTH-02',
    element: 'earth',
    title: 'Cajun-to-Connecticut Garden with Sophie',
    source: 'Chapter 7',
    feltState: ['adapting to place', 'intergenerational learning', 'being a beginner'],
    readTime: '~2 min',
    openingLine:
      'In the midst of stirring the roux for the gumbo (a lengthy process), Sophie asks me if I bought the seeds for this coming year\'s garden.',
  },
  {
    id: 'EARTH-03',
    element: 'earth',
    title: "The Father-Son Trip That Didn't Go to Plan",
    source: 'Chapter 7',
    feltState: ['improvisation', 'presence over plan', 'time-with-child', 'surrender to what is'],
    readTime: '~3 min',
    openingLine:
      'My son, Augusten, and I recently went on our annual father/son trip in early March.',
  },
  {
    id: 'EARTH-04',
    element: 'earth',
    title: 'Crows in the Snow',
    source: 'Chapter 7',
    feltState: ['resilience', "nature's witness", "season's turning", 'weathering'],
    readTime: '~2 min',
    openingLine: 'Fall is quickly fading to winter.',
  },
  {
    id: 'EARTH-05',
    element: 'earth',
    title: 'Forgetting to Eat',
    source: 'Chapter 7',
    feltState: ['ungrounded', 'body forgotten', 'returning to basics'],
    readTime: '~1 min',
    openingLine: 'There are many times during the day I forget to eat or drink water.',
  },
  {
    id: 'EARTH-06',
    element: 'earth',
    title: 'When the Body Cannot Settle',
    source: 'Chapter 7',
    feltState: ['scattered', 'alluring stimulation', 'groundlessness', 'seeking the middle'],
    readTime: '~1 min',
    isPolarity: true,
    openingLine:
      'Many of my clients with ADHD reflect, on a more elevated scale, the challenges of earth living.',
    notes: 'Polarity — surface only on later encounters.',
  },

  // ── Air ─────────────────────────────────────────────────────────────
  {
    id: 'AIR-01',
    element: 'air',
    title: 'Morning Tea with Massoud',
    source: 'Chapter 8',
    feltState: ['distance dissolved', 'friendship across miles', 'dawn light'],
    readTime: '~1 min',
    openingLine:
      'As the first rays of dawn light filtered through my study window, I sat in my favorite chair, wrapped in a blanket, sipping a steaming cup of tea.',
  },
  {
    id: 'AIR-02',
    element: 'air',
    title: 'Maestro Benito as a Dragonfly',
    source: 'Chapter 8',
    feltState: ['wordless transmission', 'spirit visit', 'slow understanding', 'presence over speech'],
    readTime: '~3 min',
    pairsWith: 'AETHER-01',
    openingLine:
      'The air realm reminds us that our relationship with reality transcends space and time.',
  },
  {
    id: 'AIR-03',
    element: 'air',
    title: 'Daughter and the Video Conferencing Class',
    source: 'Chapter 8',
    feltState: ['misunderstanding', 'repair through dialogue', 'vulnerable communication'],
    readTime: '~2 min',
    openingLine:
      'Recently, my daughter and I had a long talk about her struggles with video conferencing for her 6th-grade class.',
  },
  {
    id: 'AIR-04',
    element: 'air',
    title: "Couldn't Make Them See It",
    source: 'Chapter 8',
    feltState: ['humbling', 'having to live what you know', 'slow ripening'],
    readTime: '~3 min',
    openingLine:
      "I've been developing this model of the five elements of human experience for more than twenty years.",
  },
  {
    id: 'AIR-05',
    element: 'air',
    title: 'Reading About Death versus Living Through It',
    source: 'Chapter 8',
    feltState: ['lived knowing', 'stories over theories', 'embodied wisdom'],
    readTime: '~2 min',
    openingLine:
      'As an explorer and practitioner of metaphysical teachings, my fascination with elemental alchemy evolved into a devotion to its deeper mysteries.',
  },
  {
    id: 'AIR-06',
    element: 'air',
    title: 'Silence Before Creation',
    source: 'Chapter 8',
    feltState: ['stillness', 'primordial breath', 'clarity before thought', 'emergence'],
    readTime: '~2 min',
    openingLine:
      'In the beginning was the Word, the sound made intelligible, creating the symbol—the tools of Mercury to create reality.',
  },
  {
    id: 'AIR-07',
    element: 'air',
    title: 'When Thought Takes Over',
    source: 'Chapter 8',
    feltState: ['overthinking', 'fragmentation', 'cold logic', 'lost in thoughtland'],
    readTime: '~2 min',
    isPolarity: true,
    openingLine:
      'Air can exalt the soul and free the mind, but it also harbors a corrosive element: negative, reified thinking.',
    notes: 'Polarity — surface only on later encounters.',
  },

  // ── Aether ──────────────────────────────────────────────────────────
  {
    id: 'AETHER-01',
    element: 'aether',
    title: '3:33 — The Tibetan Dream and the Son with the Light',
    source: 'Chapter 9',
    feltState: ['threshold', 'dream-portal', 'synchronicity', 'son-as-companion'],
    readTime: '~2 min',
    pairsWith: 'AIR-02',
    openingLine:
      "It's 3:33 in the morning, and I'm awakened by a light descending our stairs.",
  },
  {
    id: 'AETHER-02',
    element: 'aether',
    title: 'Duende — The Dancer Becomes the Dance',
    source: 'Chapter 9',
    feltState: ['subject-object dissolved', 'art as channel', 'eternal moment', 'communion'],
    readTime: '~2 min',
    openingLine:
      'There is a flow-state, a mystical moment of duende, where the dividing line between subject and object, self and art, melts away.',
  },
  {
    id: 'AETHER-03',
    element: 'aether',
    title: 'The Aetheric Body',
    source: 'Chapter 9',
    feltState: ['stillness', 'expanding presence', 'transcendence', 'freedom'],
    readTime: '~2 min',
    openingLine:
      'This is our aetheric body—the focal point of all mystical traditions, a gateway to expanded perception and liberation from the conditioned limitations of life.',
  },
  {
    id: 'AETHER-04',
    element: 'aether',
    title: 'The Heart as Conductor',
    source: 'Chapter 9',
    feltState: ['coherence', 'intelligent body', 'all systems aligning', 'arriving home'],
    readTime: '~3 min',
    openingLine:
      'One of the considerations for good health and well-being that is increasingly becoming part of overall wellness talk is the matter of coherence.',
  },
  {
    id: 'AETHER-05',
    element: 'aether',
    title: 'Within the Elemental Quaternity',
    source: 'Chapter 9',
    feltState: ['returning to center', 'walking as meditation', 'wider seeing'],
    readTime: '~2 min',
    openingLine:
      'Our aetheric nature occupies a central position in our being, surrounded by the four elements of our perception and experience: the fire of our intuition, the water of our emotions, the earth of our senses, and the air of our intellect.',
    notes: 'Soft entry — used for unsure routing.',
  },
  {
    id: 'AETHER-06',
    element: 'aether',
    title: 'The Sanctuary of the Heart',
    source: 'Chapter 9',
    feltState: ['inner stillness', 'sacred space within', 'the eye that sees', 'centeredness'],
    readTime: '~2 min',
    openingLine:
      'In the sacred stillness within, whatever arises—be it an insight, a deep urge, a vision, or a profound idea—can be sculpted into reality through your deliberate choices.',
  },
  {
    id: 'AETHER-07',
    element: 'aether',
    title: 'When the Center Disengages',
    source: 'Chapter 9',
    feltState: ['spaced out', 'disengaged', 'floating away', 'unanchored'],
    readTime: '~1 min',
    isPolarity: true,
    openingLine:
      'Some of the symptoms of being too aetheric are being spaced out, out of touch, unaffected, uninvolved, unresponsive to life, unemotional, disembodied, motionless, disengaged with everyday life.',
    notes: 'Polarity — surface only on later encounters.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

export function blocksFor(
  element: Element,
  options: { includePolarity?: boolean } = {}
): readonly PassageBlock[] {
  const { includePolarity = false } = options;
  return PASSAGE_BLOCKS.filter(
    (b) => b.element === element && (includePolarity || !b.isPolarity)
  );
}

export function blockById(id: string): PassageBlock | undefined {
  return PASSAGE_BLOCKS.find((b) => b.id === id);
}
