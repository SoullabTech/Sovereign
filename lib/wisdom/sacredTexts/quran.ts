/**
 * QUR'ANIC WISDOM — Sacred Text Module
 *
 * Verses are never paraphrased. Sacred text, framing, reflection, and integration
 * are structurally separated. MAIA does not interpret doctrine or speak on behalf
 * of Islam. Internal routing metadata is never exposed to UI.
 *
 * Translation: M.A.S. Abdel Haleem (Oxford University Press, 2004)
 * Arabic: Uthmani script via quran.com API (verified 2026-04-01)
 */

import type { SacredPassageEntry, TraditionDisclaimer } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

export const QURAN_DISCLAIMER: TraditionDisclaimer = {
  short: 'The Qur\'an is a sacred text within Islam. This space offers selected passages for personal reflection while honoring their original context and tradition. MAIA does not interpret doctrine or speak on behalf of Islam.',
  extended: 'These passages are offered as invitations to reflection, not as theological instruction. The translations used are by respected scholars but no translation fully captures the Arabic original. If you are drawn to explore further, we encourage you to seek guidance from knowledgeable teachers within the Islamic tradition.',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRIES
// ═══════════════════════════════════════════════════════════════════════════════

export const QURAN_ENTRIES: SacredPassageEntry[] = [
  // 1. HARDSHIP AND EASE
  {
    id: 'quran-ease-01',
    sourceType: 'sacred',
    tradition: 'quran',
    title: 'With Hardship Comes Ease',
    citation: '94:5-6',
    originalScript: '\u0641\u064E\u0625\u0650\u0646\u0651\u064E \u0645\u064E\u0639\u064E \u0671\u0644\u0652\u0639\u064F\u0633\u0652\u0631\u0650 \u064A\u064F\u0633\u0652\u0631\u064B\u0627 \u06DD \u0625\u0650\u0646\u0651\u064E \u0645\u064E\u0639\u064E \u0671\u0644\u0652\u0639\u064F\u0633\u0652\u0631\u0650 \u064A\u064F\u0633\u0652\u0631\u064B\u0627',
    translation: 'So truly where there is hardship there is also ease; truly where there is hardship there is also ease.',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _meta: {
      mode: 'revelation',
      element: 'earth',
      stateAffinity: ['strain'],
      intensity: 2,
      engagementStyle: 'direct',
    },
    contextualFraming: 'A passage that places hardship and ease side by side, without separating them.',
    reflectionPrompts: [
      'Where do you experience hardship right now?',
      'Is there any sense of ease present at the same time?',
      'How do you respond to the idea that they might coexist?',
    ],
    integrationPractice: 'Notice one moment today where both are present.',
  },

  // 2. REMEMBRANCE
  {
    id: 'quran-remembrance-01',
    sourceType: 'sacred',
    tradition: 'quran',
    title: 'Hearts at Rest',
    citation: '13:28',
    originalScript: '\u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u06DF \u0648\u064E\u062A\u064E\u0637\u0652\u0645\u064E\u0626\u0650\u0646\u0651\u064F \u0642\u064F\u0644\u064F\u0648\u0628\u064F\u0647\u064F\u0645 \u0628\u0650\u0630\u0650\u0643\u0652\u0631\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u06D7 \u0623\u064E\u0644\u064E\u0627 \u0628\u0650\u0630\u0650\u0643\u0652\u0631\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u062A\u064E\u0637\u0652\u0645\u064E\u0626\u0650\u0646\u0651\u064F \u0671\u0644\u0652\u0642\u064F\u0644\u064F\u0648\u0628\u064F',
    translation: 'those who have faith and whose hearts find peace in the remembrance of God- truly it is in the remembrance of God that hearts find peace-',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _meta: {
      mode: 'revelation',
      element: 'water',
      stateAffinity: ['restlessness'],
      intensity: 2,
      engagementStyle: 'devotional',
    },
    contextualFraming: 'A passage that speaks of the heart and remembrance.',
    reflectionPrompts: [
      'What do you notice in yourself when you read this?',
      'How do you relate to the idea of the heart finding rest?',
      'Does this feel close to your experience, or distant from it?',
    ],
    integrationPractice: 'Notice how your state shifts \u2014 or doesn\'t \u2014 as you sit with this.',
  },

  // 3. MERCY
  {
    id: 'quran-mercy-01',
    sourceType: 'sacred',
    tradition: 'quran',
    title: 'Mercy After Error',
    citation: '6:54',
    originalScript: '\u0648\u064E\u0625\u0650\u0630\u064E\u0627 \u062C\u064E\u0622\u0621\u064E\u0643\u064E \u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u064A\u064F\u0624\u0652\u0645\u0650\u0646\u064F\u0648\u0646\u064E \u0628\u0650\u0640\u064E\u0627\u064A\u064E\u0640\u0670\u062A\u0650\u0646\u064E\u0627 \u0641\u064E\u0642\u064F\u0644\u0652 \u0633\u064E\u0644\u064E\u0640\u0670\u0645\u064C \u0639\u064E\u0644\u064E\u064A\u0652\u0643\u064F\u0645\u0652 \u06D6 \u0643\u064E\u062A\u064E\u0628\u064E \u0631\u064E\u0628\u0651\u064F\u0643\u064F\u0645\u0652 \u0639\u064E\u0644\u064E\u0649\u0670 \u0646\u064E\u0641\u0652\u0633\u0650\u0647\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0629\u064E \u06D6 \u0623\u064E\u0646\u0651\u064E\u0647\u064F\u06E5 \u0645\u064E\u0646\u0652 \u0639\u064E\u0645\u0650\u0644\u064E \u0645\u0650\u0646\u0643\u064F\u0645\u0652 \u0633\u064F\u0648\u0653\u0621\u064B\u06E2\u0627 \u0628\u0650\u062C\u064E\u0647\u064E\u0640\u0670\u0644\u064E\u0629\u064D \u062B\u064F\u0645\u0651\u064E \u062A\u064E\u0627\u0628\u064E \u0645\u0650\u0646\u06E2 \u0628\u064E\u0639\u0652\u062F\u0650\u0647\u0650\u06E6 \u0648\u064E\u0623\u064E\u0635\u0652\u0644\u064E\u062D\u064E \u0641\u064E\u0623\u064E\u0646\u0651\u064E\u0647\u064F\u06E5 \u063A\u064E\u0641\u064F\u0648\u0631\u064C \u0631\u0651\u064E\u062D\u0650\u064A\u0645\u064C',
    translation: 'When those who believe in Our revelations come to you [Prophet], say, \'Peace be upon you. Your Lord has taken it on Himself to be merciful: if any of you has foolishly done a bad deed, and afterwards repented and mended his ways, God is most forgiving and most merciful.\'',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _meta: {
      mode: 'instruction',
      element: 'water',
      stateAffinity: ['remorse'],
      intensity: 2,
      engagementStyle: 'direct',
    },
    contextualFraming: 'A passage often read in the context of return and mercy.',
    reflectionPrompts: [
      'What does this bring up for you?',
      'How do you relate to the idea of returning after a mistake?',
    ],
    integrationPractice: 'Notice how you respond to the idea of beginning again.',
  },

  // 4. GUIDANCE
  {
    id: 'quran-guidance-01',
    sourceType: 'sacred',
    tradition: 'quran',
    title: 'The Opening Prayer',
    citation: '1:6',
    originalScript: '\u0671\u0647\u0652\u062F\u0650\u0646\u064E\u0627 \u0671\u0644\u0635\u0651\u0650\u0631\u064E\u0670\u0637\u064E \u0671\u0644\u0652\u0645\u064F\u0633\u0652\u062A\u064E\u0642\u0650\u064A\u0645\u064E',
    translation: 'Guide us to the straight path:',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _meta: {
      mode: 'revelation',
      element: 'air',
      stateAffinity: ['searching'],
      intensity: 1,
      engagementStyle: 'devotional',
    },
    contextualFraming: 'Al-Fatihah is the opening surah of the Qur\'an, recited in every unit of the Muslim daily prayer. This verse is a request \u2014 not a statement of arrival, but a continual asking for direction.',
    reflectionPrompts: [
      'What does it feel like to ask for guidance without needing to already know the answer?',
      'This is a prayer of orientation, not destination. Where are you oriented right now?',
    ],
    integrationPractice: 'Begin your day tomorrow with a simple, sincere request for guidance \u2014 in whatever form feels authentic to you. Do not specify the answer. Just ask, and then go about your day with attention.',
  },

  // 5. PATIENCE
  {
    id: 'quran-patience-01',
    sourceType: 'sacred',
    tradition: 'quran',
    title: 'Patience and Prayer',
    citation: '2:153',
    originalScript: '\u064A\u064E\u0640\u0670\u0653\u0623\u064E\u064A\u0651\u064F\u0647\u064E\u0627 \u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u06DF \u0671\u0633\u0652\u062A\u064E\u0639\u0650\u064A\u0646\u064F\u0648\u0627\u06DF \u0628\u0650\u0671\u0644\u0635\u0651\u064E\u0628\u0652\u0631\u0650 \u0648\u064E\u0671\u0644\u0635\u0651\u064E\u0644\u064E\u0648\u0670\u0629\u0650 \u06DA \u0625\u0650\u0646\u0651\u064E \u0671\u0644\u0644\u0651\u064E\u0647\u064E \u0645\u064E\u0639\u064E \u0671\u0644\u0635\u0651\u064E\u0640\u0670\u0628\u0650\u0631\u0650\u064A\u0646\u064E',
    translation: 'You who believe, seek help through steadfastness and prayer, for God is with the steadfast.',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _meta: {
      mode: 'instruction',
      element: 'earth',
      stateAffinity: ['endurance'],
      intensity: 2,
      engagementStyle: 'direct',
    },
    contextualFraming: 'A passage that speaks in the form of instruction.',
    reflectionPrompts: [
      'How do you respond to being given this kind of instruction?',
      'What does patience mean to you here \u2014 if anything?',
      'How do you relate to the idea of seeking help in this way?',
    ],
    integrationPractice: 'Notice your reaction to this \u2014 whether it draws you in or not.',
  },
];
