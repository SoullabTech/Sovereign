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
  /** First sentence of the passage. Always present (metadata). */
  openingLine: string;
  /**
   * The full self-contained passage body (~150–500 words). Paragraph breaks
   * preserved as `\n\n`. When present, rendered as the user-facing reading.
   * When absent, the UI falls back to `openingLine` and the experience is
   * thinner — extraction Phase 2 will close that gap.
   */
  body?: string;
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
    body: `I write these words as I sit down, welcomed by another stunning sunset and the dawn of night. It's good to be back in front of the fire after a long day of mundane tasks, sessions with clients, and the distractions of a busy schedule. My son, Augusten, and I have been camping every night for nearly two months. We both look forward to bonding around the fire. Our evenings have become a ritual of gathering kindle and wood, as well as preparing our food and tent for the evening. I've been looking forward to this moment all day, to sit around the fire, tune in to its wisdom, and share stories with my son.

It took a while to get the fire started because the wood was a bit damp from last night's rain. Still, it looks like it is once again taking hold and the flames are beginning to spread through the twigs and pine needles. The chopped wood is sizzling as it releases itself to the heat of the flames. The crackling of the fire brings my attention to the present moment, elevating my presence. The world slowly becomes increasingly quiet, still, and calm.

There is always anticipation of whether the fire will catch and spread. It takes planning, preparation, adjustments, and effort at first. Then comes a sense of comfort when it spreads enough that we simply need to maintain the fire by adding wood as needed. Initially, it blazes hot and bright but soon begins to settle, mature, and soften into a soulful glow. Everything is dark around me as I sit before the campfire, but the fire itself glows brightly.

This is the part I love most, when the embers grow and spread across the firepit, forming an undulating pattern of darkness and light that excites my imagination. Images and stories begin to rise from the ashes. Some stories bring back memories of past ceremonies and rituals. Some are fantasies of what might happen in the future. Surprising thoughts emerge reminding me of forgotten things, matters I need to attend to. Even unexplored topics rise from the imagination like sparks flying. Conversations with friends, memories of sitting fireside with teachers, friends, and loved ones all ignite my awareness, sparked by the fire and embers. The dark world around ebbs and flows in and out of the aura of light encircling the fire.

All awareness seems to return to this circle around the flames, smoke, smells, and embers. As the light and heat eventually soften, it draws me closer, spiraling deeper into a soulful trance state. My son too has shifted from dancing around the fire, poking at it while telling stories of his day and sharing his favorite games, to a more inward, contemplative gaze softened by the soft glow of the fire.`,
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
    body: `At the heart of most of the challenges I witness in my life as well as in sessions are issues associated with fire. Whatever my clients' session goals are, we always come back to tending their inner fire. With too little fire, life can seem cold, impersonal, and threatening. This includes the inner worlds of emotions, body, and mind. When a client is under emotional stress, it is the nature of their fire that can determine the outcome of their experience. Strengthening their fire of personal agency, spirit, and energy helps burn away the heaviness of emotional upset and offers them a vision for the path forward.

An example is when my client David came into a session grieving the loss of his youth and anxious about his future. This existential situation takes great personal power to manage. His inner fire was nearly extinguished — he had little awareness of his individuality or what lay ahead. His sense of self was drowning in uncertainty, regret, and despair.

Returning to tending the fire that reignited purpose and meaning helped David regain a vision for his life path's importance. Rekindling the fires of remembrance to full flame isn't always easy, but even a spark of reconnection with our true Self provides warmth and encouragement to manage life's most challenging periods.

Speaking for myself, it sometimes takes a while to get my own inner fires lit. Life has its ways of dampening the fires of my passion. My inner being can feel too damp from heavy emotions to sustain or reignite my will. If my spirit gets too fiery, I can't hold the intensity long enough to capture its brilliance. Or I can feel buried in apathy and exhaustion, like my inner fire has been reduced to smoldering embers and ashes. Even so, I take a deep breath and try to be fully present.`,
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
    body: `Many seek outer sources of light and inspiration; however, it is only when we fan the flames of our own true Self that we will find the answer to our life's journey. Every step of the way, it is important that we keep this fire safe and protected. It is this fire that fuels the potential for living a soulful life. We can turn our challenges into opportunities when we shine the right light on them.

For example, a young client who was lost in his teenage angst, bound to their bedroom playing video games nonstop, transformed his life by answering the call of his passion for video games. He applied to a game development company, became a game tester, and began learning how to create his own games.

There is genius in inspiration. Your secret fire's main motive is to guide you to your truth. For some it is a flicker, and for others it is a bonfire. Our task with fire is to manage it well. Too much or too little can either burn us out or extinguish our flame.`,
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
