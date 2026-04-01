/**
 * BHAGAVAD GITA — Sacred Text Module
 *
 * The Gita speaks as direct dialogue — Krishna addressing Arjuna on the
 * battlefield of choice. Its mode is instruction through relationship:
 * duty, discernment, devotion, and the nature of action.
 *
 * It does not dissolve the question (like Tao) or orient toward the Divine
 * from below (like Qur'an). It meets you inside the tension of having to act.
 *
 * Translation: Eknath Easwaran (Nilgiri Press)
 * — chosen for clarity, devotional integrity, and accessibility.
 *
 * TODO: Verify each passage against the published Easwaran edition before shipping.
 */

import type { SacredPassageEntry, TraditionDisclaimer } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

export const GITA_DISCLAIMER: TraditionDisclaimer = {
  short: 'The Bhagavad Gita is a sacred text within Hinduism. These passages are offered for personal reflection, honoring their context as dialogue between Krishna and Arjuna on the nature of action, duty, and self.',
  extended: 'The Gita is part of the Mahabharata and holds deep significance across Hindu traditions. The translation used here is by Eknath Easwaran. If these passages resonate, we encourage study of the full text and engagement with teachers in the living tradition.',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRIES
//
// TODO: Verify each against published Easwaran translation before shipping.
// ═══════════════════════════════════════════════════════════════════════════════

export const GITA_ENTRIES: SacredPassageEntry[] = [
  // 1. ACTION WITHOUT ATTACHMENT (2:47) — instruction, fire
  {
    id: 'gita-action-01',
    sourceType: 'sacred',
    tradition: 'gita',
    title: 'Your Right Is to Action Alone',
    citation: 'Bhagavad Gita 2:47',
    translation: '[TODO: Verify Easwaran — "You have the right to work, but never to the fruit of work. You should never engage in action for the sake of reward, nor should you long for inaction."]',
    translator: 'Eknath Easwaran (Nilgiri Press)',
    _meta: {
      mode: 'instruction',
      element: 'fire',
      stateAffinity: ['strain', 'endurance'],
      intensity: 2,
      engagementStyle: 'direct',
    },
    contextualFraming: 'Krishna speaks to Arjuna about the nature of action — what belongs to you and what does not.',
    reflectionPrompts: [
      'Where are you acting for the outcome rather than the action itself?',
      'What changes when you separate effort from result?',
    ],
    integrationPractice: 'Choose one task today. Do it fully, without checking whether it worked.',
  },

  // 2. THE SELF BEYOND DESTRUCTION (2:20) — revelation, aether
  {
    id: 'gita-self-01',
    sourceType: 'sacred',
    tradition: 'gita',
    title: 'The Self Is Never Born',
    citation: 'Bhagavad Gita 2:20',
    translation: '[TODO: Verify Easwaran — "The Self is never born, nor does it die. It is not slain when the body is slain."]',
    translator: 'Eknath Easwaran (Nilgiri Press)',
    _meta: {
      mode: 'revelation',
      element: 'aether',
      stateAffinity: ['strain', 'remorse'],
      intensity: 3,
      engagementStyle: 'direct',
    },
    contextualFraming: 'Krishna speaks of what is indestructible — the Self that is not touched by change or loss.',
    reflectionPrompts: [
      'What in you feels unchanged despite everything that has happened?',
      'How do you respond to the idea that something in you cannot be harmed?',
    ],
    integrationPractice: 'Notice the part of you that is watching all of this. It has always been here.',
  },

  // 3. EQUANIMITY (2:48) — instruction, earth
  {
    id: 'gita-equanimity-01',
    sourceType: 'sacred',
    tradition: 'gita',
    title: 'Established in Being',
    citation: 'Bhagavad Gita 2:48',
    translation: '[TODO: Verify Easwaran — "Perform all work established in being, abandoning attachment, and balanced evenly in success and failure. Such equanimity is called yoga."]',
    translator: 'Eknath Easwaran (Nilgiri Press)',
    _meta: {
      mode: 'instruction',
      element: 'earth',
      stateAffinity: ['restlessness', 'strain'],
      intensity: 2,
      engagementStyle: 'direct',
    },
    contextualFraming: 'Krishna defines yoga not as practice but as a quality of engagement — evenness amid outcome.',
    reflectionPrompts: [
      'Where are you unbalanced between success and failure right now?',
      'What would it mean to act without being moved by the result?',
    ],
    integrationPractice: 'Do something today where the outcome does not matter to you. Notice the quality of that action.',
  },

  // 4. DEVOTION (9:22) — devotional, water
  {
    id: 'gita-devotion-01',
    sourceType: 'sacred',
    tradition: 'gita',
    title: 'I Carry What You Lack',
    citation: 'Bhagavad Gita 9:22',
    translation: '[TODO: Verify Easwaran — "Those who worship me with devotion, meditating on my transcendent form — to them I carry what they lack and preserve what they have."]',
    translator: 'Eknath Easwaran (Nilgiri Press)',
    _meta: {
      mode: 'revelation',
      element: 'water',
      stateAffinity: ['searching', 'endurance'],
      intensity: 2,
      engagementStyle: 'devotional',
    },
    contextualFraming: 'A passage where Krishna speaks of what is given to those who turn toward the divine — not as reward, but as provision.',
    reflectionPrompts: [
      'What do you feel you lack right now?',
      'How do you relate to the idea that something might carry what you cannot?',
    ],
    integrationPractice: 'Name one thing you need but cannot provide for yourself. Hold it without trying to solve it.',
  },

  // 5. DISCERNMENT (3:35) — instruction, fire
  {
    id: 'gita-dharma-01',
    sourceType: 'sacred',
    tradition: 'gita',
    title: 'Your Own Dharma',
    citation: 'Bhagavad Gita 3:35',
    translation: '[TODO: Verify Easwaran — "It is better to perform one\'s own dharma, however imperfectly, than to perform another\'s dharma perfectly."]',
    translator: 'Eknath Easwaran (Nilgiri Press)',
    _meta: {
      mode: 'instruction',
      element: 'fire',
      stateAffinity: ['searching', 'remorse'],
      intensity: 2,
      engagementStyle: 'direct',
    },
    contextualFraming: 'Krishna on the danger of living someone else\'s path — even if your own is rougher.',
    reflectionPrompts: [
      'Whose path are you walking right now — yours, or one you inherited?',
      'What would your own imperfect path look like if you trusted it?',
    ],
    integrationPractice: 'Name one thing that is genuinely yours — not borrowed, not expected. Start there.',
  },
];
