/**
 * QUR'ANIC WISDOM — Sacred Text Module
 *
 * This module treats the Qur'an as a sacred source — not content, not a "voice,"
 * not a facet or framework. It exists as a distinct class: sourceType "sacred".
 *
 * Design principles:
 * - Verses are never paraphrased or rewritten
 * - Sacred text, contextual framing, reflection, and integration are structurally separated
 * - MAIA does not interpret doctrine or speak on behalf of Islam
 * - Internal tags exist for system routing only — never surfaced to users
 * - Translations are always attributed
 * - This does NOT plug into WisdomFacets, WisdomQuotes, or ElderCouncilService
 * - It has its own rendering path (SacredPassageBlock)
 *
 * Boundary statement:
 * "The Qur'an is a sacred text within Islam. This space offers selected passages
 * for personal reflection while honoring their original context and tradition.
 * MAIA does not interpret doctrine or speak on behalf of Islam."
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuranEntry {
  /** Unique identifier */
  id: string;
  /** Always 'sacred' — distinguishes from quotes, facets, articles */
  sourceType: 'sacred';
  /** The tradition this belongs to */
  tradition: 'islam';
  /** A brief, reverent title for this passage */
  title: string;
  /** Surah (chapter) number */
  surah: number;
  /** Ayah (verse) number or range as string */
  ayah: string;
  /** Standard citation format: e.g. "94:6" */
  citation: string;
  /** English translation of the passage */
  translation: string;
  /** Attribution for the translation used */
  translator: string;
  /** Original Arabic text (optional — include only when verified) */
  arabic?: string;

  // --- System-internal fields (NEVER expose to UI) ---

  /** Internal thematic tags for routing/recommendation */
  _themes?: string[];
  /** Internal elemental tags for system use only */
  _internalTags?: string[];

  // --- Presentation fields ---

  /** Brief contextual framing — situates, does not interpret */
  contextualFraming?: string;
  /** Reflection prompts — invitations to sit with the passage */
  reflectionPrompts?: string[];
  /** A gentle integration practice */
  integrationPractice?: string;
  /** Optional caution or sensitivity note */
  cautionNote?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SACRED SOURCE DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

export const QURAN_DISCLAIMER = {
  short: 'The Qur\'an is a sacred text within Islam. This space offers selected passages for personal reflection while honoring their original context and tradition. MAIA does not interpret doctrine or speak on behalf of Islam.',
  extended: 'These passages are offered as invitations to reflection, not as theological instruction. The translations used are by respected scholars but no translation fully captures the Arabic original. If you are drawn to explore further, we encourage you to seek guidance from knowledgeable teachers within the Islamic tradition.',
  translationNote: 'All translations are attributed to their translator. The Qur\'an in Arabic is considered the primary text within Islam; translations are interpretive renderings.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA — 5 ENTRIES
//
// Translation source: M.A.S. Abdel Haleem (Oxford University Press, 2004)
// Arabic source: Uthmani script via quran.com API (verified 2026-04-01)
// English source: Abdel Haleem translation via quran.com resource_id=85 (verified 2026-04-01)
//
// All entries are full ayat unless explicitly marked as excerpts.
// 7:156 is a full ayah — it is a long verse containing multiple clauses.
// ═══════════════════════════════════════════════════════════════════════════════

export const QURAN_ENTRIES: QuranEntry[] = [
  // 1. HARDSHIP AND EASE
  {
    id: 'quran-ease-01',
    sourceType: 'sacred',
    tradition: 'islam',
    title: 'With Hardship Comes Ease',
    surah: 94,
    ayah: '5-6',
    citation: '94:5-6',
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translation: 'So truly where there is hardship there is also ease; truly where there is hardship there is also ease.',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _themes: ['hardship', 'ease', 'resilience', 'hope'],
    _internalTags: ['earth', 'fire'],
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
    tradition: 'islam',
    title: 'Hearts at Rest',
    surah: 13,
    ayah: '28',
    citation: '13:28',
    arabic: 'ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translation: 'those who have faith and whose hearts find peace in the remembrance of God- truly it is in the remembrance of God that hearts find peace-',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _themes: ['remembrance', 'peace', 'inner stillness', 'presence'],
    _internalTags: ['water', 'aether'],
    contextualFraming: 'A passage that speaks of the heart and remembrance.',
    reflectionPrompts: [
      'What do you notice in yourself when you read this?',
      'How do you relate to the idea of the heart finding rest?',
      'Does this feel close to your experience, or distant from it?',
    ],
    integrationPractice: 'Notice how your state shifts — or doesn\'t — as you sit with this.',
  },

  // 3. MERCY
  {
    id: 'quran-mercy-01',
    sourceType: 'sacred',
    tradition: 'islam',
    title: 'Mercy After Error',
    surah: 6,
    ayah: '54',
    citation: '6:54',
    arabic: 'وَإِذَا جَآءَكَ ٱلَّذِينَ يُؤْمِنُونَ بِـَٔايَـٰتِنَا فَقُلْ سَلَـٰمٌ عَلَيْكُمْ ۖ كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ ٱلرَّحْمَةَ ۖ أَنَّهُۥ مَنْ عَمِلَ مِنكُمْ سُوٓءًۢا بِجَهَـٰلَةٍ ثُمَّ تَابَ مِنۢ بَعْدِهِۦ وَأَصْلَحَ فَأَنَّهُۥ غَفُورٌ رَّحِيمٌ',
    translation: 'When those who believe in Our revelations come to you [Prophet], say, \'Peace be upon you. Your Lord has taken it on Himself to be merciful: if any of you has foolishly done a bad deed, and afterwards repented and mended his ways, God is most forgiving and most merciful.\'',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _themes: ['mercy', 'repentance', 'forgiveness', 'repair', 'compassion'],
    _internalTags: ['water', 'aether'],
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
    tradition: 'islam',
    title: 'The Opening Prayer',
    surah: 1,
    ayah: '6',
    citation: '1:6',
    arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    translation: 'Guide us to the straight path:',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _themes: ['guidance', 'direction', 'prayer', 'seeking'],
    _internalTags: ['air', 'aether'],
    contextualFraming: 'Al-Fatihah is the opening surah of the Qur\'an, recited in every unit of the Muslim daily prayer. This verse is a request — not a statement of arrival, but a continual asking for direction.',
    reflectionPrompts: [
      'What does it feel like to ask for guidance without needing to already know the answer?',
      'This is a prayer of orientation, not destination. Where are you oriented right now?',
    ],
    integrationPractice: 'Begin your day tomorrow with a simple, sincere request for guidance — in whatever form feels authentic to you. Do not specify the answer. Just ask, and then go about your day with attention.',
  },

  // 5. PATIENCE
  {
    id: 'quran-patience-01',
    sourceType: 'sacred',
    tradition: 'islam',
    title: 'Patience and Prayer',
    surah: 2,
    ayah: '153',
    citation: '2:153',
    arabic: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ',
    translation: 'You who believe, seek help through steadfastness and prayer, for God is with the steadfast.',
    translator: 'M.A.S. Abdel Haleem (Oxford University Press, 2004)',
    _themes: ['patience', 'prayer', 'perseverance', 'divine presence'],
    _internalTags: ['earth', 'water'],
    contextualFraming: 'A passage that speaks in the form of instruction.',
    reflectionPrompts: [
      'How do you respond to being given this kind of instruction?',
      'What does patience mean to you here — if anything?',
      'How do you relate to the idea of seeking help in this way?',
    ],
    integrationPractice: 'Notice your reaction to this — whether it draws you in or not.',
  },
];
