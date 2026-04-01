/**
 * ZOHAR — Sacred Text Module
 *
 * The Zohar speaks in symbol, concealment, and layered meaning.
 * Its mode is neither directive nor dissolving nor action-oriented —
 * it trains the reader to see beneath surface appearance.
 *
 * Fourth mode: interpretive depth / hidden seeing.
 *
 * Translation: Daniel C. Matt (Pritzker Edition, Stanford University Press)
 * — the most scholarly modern translation, preserving Aramaic structure.
 *
 * TODO: Verify each passage against the published Matt edition before shipping.
 */

import type { SacredPassageEntry, TraditionDisclaimer } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

export const ZOHAR_DISCLAIMER: TraditionDisclaimer = {
  short: 'The Zohar is a foundational text of Jewish mysticism (Kabbalah). These passages are offered for contemplation, not as instruction in Kabbalistic practice. This text traditionally requires preparation and guidance.',
  extended: 'The Zohar is dense, symbolic, and multi-layered by design. It is traditionally studied with a teacher and within community. The translation used here is by Daniel C. Matt. If these passages resonate, we encourage study within the living Kabbalistic tradition.',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRIES
//
// TODO: Verify each against published Matt/Pritzker translation before shipping.
// ═══════════════════════════════════════════════════════════════════════════════

export const ZOHAR_ENTRIES: SacredPassageEntry[] = [
  // 1. HIDDEN LIGHT (1:31b) — paradox, aether
  {
    id: 'zohar-hidden-light-01',
    sourceType: 'sacred',
    tradition: 'zohar',
    title: 'The Hidden Light',
    citation: 'Zohar 1:31b',
    translation: '[TODO: Verify Matt translation — "When the Holy One created the world, He created a light that no creature could endure. He concealed it for the righteous in the world to come."]',
    translator: 'Daniel C. Matt (Pritzker Edition)',
    _meta: {
      mode: 'paradox',
      element: 'aether',
      stateAffinity: ['searching'],
      intensity: 2,
      engagementStyle: 'reflective',
    },
    contextualFraming: 'A passage on light that was too strong to be seen — and so was hidden, not destroyed.',
    reflectionPrompts: [
      'What in your life is present but concealed?',
      'How do you relate to the idea that something can be real precisely because it is hidden?',
    ],
    integrationPractice: 'Notice one thing today that you sense but cannot see directly.',
  },

  // 2. THE GARMENT OF TORAH (3:152a) — philosophical, air
  {
    id: 'zohar-garment-01',
    sourceType: 'sacred',
    tradition: 'zohar',
    title: 'The Garment and the Body',
    citation: 'Zohar 3:152a',
    translation: '[TODO: Verify Matt translation — "Woe to those who see the Torah as merely stories. The stories are the garment. Beneath the garment is the body. Beneath the body is the soul. And beneath the soul is the soul of the soul."]',
    translator: 'Daniel C. Matt (Pritzker Edition)',
    _meta: {
      mode: 'philosophical',
      element: 'air',
      stateAffinity: ['searching', 'restlessness'],
      intensity: 2,
      engagementStyle: 'disruptive',
    },
    contextualFraming: 'A passage that reframes how to read — not the surface, but the layers beneath it.',
    reflectionPrompts: [
      'Where in your life are you reading only the surface?',
      'What might be beneath the story you are currently telling yourself?',
    ],
    integrationPractice: 'Take one situation you think you understand. Ask: what is beneath this? And beneath that?',
  },

  // 3. SPARKS IN EXILE (2:128b) — revelation, fire
  {
    id: 'zohar-sparks-01',
    sourceType: 'sacred',
    tradition: 'zohar',
    title: 'Sparks of Holiness',
    citation: 'Zohar 2:128b',
    translation: '[TODO: Verify Matt translation — "Sparks of holiness are scattered throughout the world, hidden in all things. The task of the soul is to gather them and raise them."]',
    translator: 'Daniel C. Matt (Pritzker Edition)',
    _meta: {
      mode: 'revelation',
      element: 'fire',
      stateAffinity: ['strain', 'endurance'],
      intensity: 2,
      engagementStyle: 'direct',
    },
    contextualFraming: 'A passage on the idea that holiness is not above but scattered — embedded in ordinary reality, waiting to be recognized.',
    reflectionPrompts: [
      'Where in your difficulty might something sacred be hidden?',
      'What would it mean to treat your daily life as a gathering of sparks?',
    ],
    integrationPractice: 'Look for one moment of unexpected beauty or meaning in an ordinary part of your day.',
  },

  // 4. THE VOID BEFORE CREATION (1:15a) — paradox, water
  {
    id: 'zohar-void-01',
    sourceType: 'sacred',
    tradition: 'zohar',
    title: 'Before the Beginning',
    citation: 'Zohar 1:15a',
    translation: '[TODO: Verify Matt translation — "Before shape was given, there was neither beginning nor end. He engraved and carved within the supernal light a hidden, concealed point. Beyond knowing."]',
    translator: 'Daniel C. Matt (Pritzker Edition)',
    _meta: {
      mode: 'paradox',
      element: 'water',
      stateAffinity: ['restlessness', 'searching'],
      intensity: 3,
      engagementStyle: 'reflective',
    },
    contextualFraming: 'A passage on what existed before existence — a point beyond knowing.',
    reflectionPrompts: [
      'What does it feel like to sit with something that is beyond knowing?',
      'Is there comfort or discomfort in not being able to reach the origin?',
    ],
    integrationPractice: 'Sit with the question: what was here before I arrived? Do not answer it.',
    cautionNote: 'This passage points toward territory that traditionally requires preparation. Let it be encountered, not analyzed.',
  },
];
