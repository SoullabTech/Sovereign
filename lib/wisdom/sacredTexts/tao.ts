/**
 * TAO TE CHING — Sacred Text Module
 *
 * The Tao Te Ching speaks in paradox, indirection, and spaciousness.
 * It does not instruct — it dissolves the frame that makes instruction necessary.
 *
 * Translation: Gia-Fu Feng & Jane English (Vintage Books, 1972)
 * — chosen for fidelity and restraint over interpretive readability.
 *
 * TODO: Verify each passage against the published Feng/English edition before shipping.
 */

import type { SacredPassageEntry, TraditionDisclaimer } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

export const TAO_DISCLAIMER: TraditionDisclaimer = {
  short: 'The Tao Te Ching is a foundational text of Taoist philosophy. These passages are offered for contemplation, not as instruction in Taoist practice.',
  extended: 'The Tao Te Ching resists summary and interpretation by design. The translation used here is by Gia-Fu Feng and Jane English. If these passages resonate, we encourage exploration of the full text and the living tradition it belongs to.',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRIES
//
// TODO: Verify each against published Feng/English translation before shipping.
// ═══════════════════════════════════════════════════════════════════════════════

export const TAO_ENTRIES: SacredPassageEntry[] = [
  // 1. THE WAY (Chapter 1) — paradox, aether
  {
    id: 'tao-way-01',
    sourceType: 'sacred',
    tradition: 'tao',
    title: 'The Way',
    citation: 'Tao Te Ching, Chapter 1',
    translation: '[TODO: Verify Feng/English translation of Chapter 1 — "The Tao that can be told is not the eternal Tao..."]',
    translator: 'Gia-Fu Feng & Jane English (Vintage Books, 1972)',
    _meta: {
      mode: 'paradox',
      element: 'aether',
      stateAffinity: ['searching'],
      intensity: 2,
      engagementStyle: 'reflective',
    },
    contextualFraming: 'The opening of the Tao Te Ching. It begins by unsaying itself.',
    reflectionPrompts: [
      'What do you notice when you read something that resists being grasped?',
      'Where in your life are you trying to name something that might not want naming?',
    ],
    integrationPractice: 'Sit with something you cannot explain today. Do not try to resolve it.',
  },

  // 2. WATER (Chapter 8) — philosophical, water
  {
    id: 'tao-water-01',
    sourceType: 'sacred',
    tradition: 'tao',
    title: 'The Highest Good',
    citation: 'Tao Te Ching, Chapter 8',
    translation: '[TODO: Verify Feng/English translation of Chapter 8 — "The highest good is like water. Water gives life to the ten thousand things and does not strive..."]',
    translator: 'Gia-Fu Feng & Jane English (Vintage Books, 1972)',
    _meta: {
      mode: 'philosophical',
      element: 'water',
      stateAffinity: ['strain', 'endurance'],
      intensity: 1,
      engagementStyle: 'reflective',
    },
    contextualFraming: 'A passage on the nature of water — yielding, nourishing, and without ambition.',
    reflectionPrompts: [
      'Where are you striving right now? What would it feel like to stop?',
      'How do you relate to the idea that what is lowest can also be what is most useful?',
    ],
    integrationPractice: 'Notice where you are pushing today. Let one thing flow instead.',
  },

  // 3. FLEXIBILITY (Chapter 76) — philosophical, air
  {
    id: 'tao-flexible-01',
    sourceType: 'sacred',
    tradition: 'tao',
    title: 'Soft and Yielding',
    citation: 'Tao Te Ching, Chapter 76',
    translation: '[TODO: Verify Feng/English translation of Chapter 76 — "A man is born gentle and weak. At his death he is hard and stiff..."]',
    translator: 'Gia-Fu Feng & Jane English (Vintage Books, 1972)',
    _meta: {
      mode: 'philosophical',
      element: 'air',
      stateAffinity: ['strain', 'endurance'],
      intensity: 2,
      engagementStyle: 'reflective',
    },
    contextualFraming: 'A passage that equates rigidity with death and softness with life.',
    reflectionPrompts: [
      'Where have you become rigid? What would softening look like there?',
      'How do you respond to the idea that strength and hardness are not the same thing?',
    ],
    integrationPractice: 'Find one place in your body that is tense right now. Soften it without trying to fix it.',
  },

  // 4. NON-CONTENTION (Chapter 22) — paradox, earth
  {
    id: 'tao-yield-01',
    sourceType: 'sacred',
    tradition: 'tao',
    title: 'Yield and Overcome',
    citation: 'Tao Te Ching, Chapter 22',
    translation: '[TODO: Verify Feng/English translation of Chapter 22 — "Yield and overcome; Bend and be straight; Empty and be full; Wear out and be new..."]',
    translator: 'Gia-Fu Feng & Jane English (Vintage Books, 1972)',
    _meta: {
      mode: 'paradox',
      element: 'earth',
      stateAffinity: ['strain', 'restlessness'],
      intensity: 1,
      engagementStyle: 'disruptive',
    },
    contextualFraming: 'A passage built entirely on reversal — where giving up is gaining.',
    reflectionPrompts: [
      'Which of these reversals catches your attention? Why that one?',
      'Is there something you are holding onto that might release if you yielded?',
    ],
    integrationPractice: 'Choose one thing you are resisting today. Try yielding to it — not agreeing, just yielding.',
  },

  // 5. STILLNESS (Chapter 16) — philosophical, aether
  {
    id: 'tao-stillness-01',
    sourceType: 'sacred',
    tradition: 'tao',
    title: 'Returning to the Root',
    citation: 'Tao Te Ching, Chapter 16',
    translation: '[TODO: Verify Feng/English translation of Chapter 16 — "Empty yourself of everything. Let the mind rest at peace. The ten thousand things rise and fall while the Self watches their return..."]',
    translator: 'Gia-Fu Feng & Jane English (Vintage Books, 1972)',
    _meta: {
      mode: 'philosophical',
      element: 'aether',
      stateAffinity: ['restlessness', 'searching'],
      intensity: 2,
      engagementStyle: 'reflective',
    },
    contextualFraming: 'A passage on stillness as the ground of all movement.',
    reflectionPrompts: [
      'What does emptying feel like — relief, or loss?',
      'Can you watch your thoughts rise and fall without following them?',
    ],
    integrationPractice: 'Sit still for two minutes. Watch what arises. Let it pass.',
  },
];
