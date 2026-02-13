/**
 * The 64 Hexagrams of the I Ching
 *
 * Each hexagram built from two trigrams (lower + upper),
 * with judgment, image, and six line texts.
 *
 * Interpretations are original paraphrased readings
 * inspired by the traditional wisdom, not copied from
 * any specific translation.
 */

import type { Hexagram } from './types';

export const HEXAGRAMS: Record<number, Hexagram> = {
  1: {
    number: 1,
    name: "Ch'ien",
    english: "The Creative",
    character: "䷀",
    upperTrigram: 1,
    lowerTrigram: 1,
    judgment: "Pure creative force moves through all things. Success comes through perseverance aligned with natural law. The time favors bold action rooted in integrity.",
    image: "Heaven's movement is strong and ceaseless. The sage embodies this tireless strength, renewing their commitment each day.",
    lines: [
      { position: 1, isYang: true, text: "Dragon lies hidden below.", meaning: "Not yet time to act; gather strength in concealment." },
      { position: 2, isYang: true, text: "Dragon appears in the field.", meaning: "Emerge to meet those who recognize your worth." },
      { position: 3, isYang: true, text: "Active throughout the day, vigilant at night.", meaning: "Sustained effort without exhaustion; remain alert." },
      { position: 4, isYang: true, text: "Dragon tests the depths.", meaning: "Experiment with new forms; no harm in exploration." },
      { position: 5, isYang: true, text: "Dragon soars in heaven.", meaning: "Full realization of potential; perfect timing." },
      { position: 6, isYang: true, text: "Arrogant dragon brings regret.", meaning: "Overreach invites reversal; know when to rest." }
    ],
    element: "fire",
    changeType: "emergence",
    keywords: ["creative", "initiation", "yang", "heaven", "power"]
  },

  2: {
    number: 2,
    name: "K'un",
    english: "The Receptive",
    character: "䷁",
    upperTrigram: 2,
    lowerTrigram: 2,
    judgment: "Pure receptive power yields and nourishes. Success through devoted service and patient allowing. The mare's perseverance brings fortune.",
    image: "Earth's capacity is boundless. The sage carries all beings with generous breadth.",
    lines: [
      { position: 1, isYang: false, text: "Frost underfoot signals winter's approach.", meaning: "Early signs warn of what approaches; prepare quietly." },
      { position: 2, isYang: false, text: "Straight, square, and great.", meaning: "Natural integrity requires no strain; be yourself." },
      { position: 3, isYang: false, text: "Hidden excellence bears fruit in time.", meaning: "Do your work without seeking recognition." },
      { position: 4, isYang: false, text: "Sealed sack; no blame, no praise.", meaning: "Discretion in dangerous times protects you." },
      { position: 5, isYang: false, text: "Yellow skirt brings supreme fortune.", meaning: "Inner nobility radiates outward; quiet excellence." },
      { position: 6, isYang: false, text: "Dragons battle in the wilderness.", meaning: "Opposing forces clash; withdraw from the conflict." }
    ],
    element: "earth",
    changeType: "integration",
    keywords: ["receptive", "yielding", "earth", "devotion", "nurture"]
  },

  3: {
    number: 3,
    name: "Chun",
    english: "Difficulty at Beginning",
    character: "䷂",
    upperTrigram: 4,
    lowerTrigram: 3,
    judgment: "Birth is difficult, yet new life emerges. Appoint helpers and build structure; do not venture forth alone. Perseverance through chaos brings eventual order.",
    image: "Thunder and rain gather; the sage weaves threads into fabric.",
    lines: [
      { position: 1, isYang: true, text: "Hesitation at the threshold.", meaning: "Pause to establish foundation before proceeding." },
      { position: 2, isYang: false, text: "Difficulties pile up; help is offered.", meaning: "Accept assistance; do not insist on solitary struggle." },
      { position: 3, isYang: false, text: "Chasing deer without a guide.", meaning: "Aimless pursuit leads to forest entanglement." },
      { position: 4, isYang: false, text: "Seeking union too eagerly.", meaning: "Let relationship develop naturally; forcing creates distance." },
      { position: 5, isYang: true, text: "Small gifts build trust slowly.", meaning: "Generosity in small things accumulates goodwill." },
      { position: 6, isYang: false, text: "Riding without direction, tears and blood.", meaning: "Movement without vision exhausts and wounds." }
    ],
    element: "water",
    changeType: "emergence",
    keywords: ["beginning", "difficulty", "chaos", "birth", "foundation"]
  },

  4: {
    number: 4,
    name: "Meng",
    english: "Youthful Folly",
    character: "䷃",
    upperTrigram: 5,
    lowerTrigram: 4,
    judgment: "The young fool seeks the teacher, not the reverse. The first asking is answered; repeated pestering is not. Instruction succeeds through discipline and clarity.",
    image: "Spring flows at the mountain's base; the sage cultivates character through consistent action.",
    lines: [
      { position: 1, isYang: false, text: "Discipline clarifies folly.", meaning: "Structure liberates rather than constrains the learner." },
      { position: 2, isYang: true, text: "Bearing with fools develops patience.", meaning: "Teaching others deepens your own understanding." },
      { position: 3, isYang: false, text: "Do not marry someone dazzled by wealth.", meaning: "Superficial attraction lacks lasting foundation." },
      { position: 4, isYang: false, text: "Entangled in fantasy brings difficulty.", meaning: "Delusion compounds when left unchallenged." },
      { position: 5, isYang: false, text: "Childlike innocence is blessed.", meaning: "Genuine not-knowing opens doors that cleverness closes." },
      { position: 6, isYang: true, text: "Strike the fool, not to harm but to wake.", meaning: "Sometimes shock is the only medicine that works." }
    ],
    element: "water",
    changeType: "emergence",
    keywords: ["inexperience", "learning", "teaching", "discipline", "growth"]
  },

  5: {
    number: 5,
    name: "Hsu",
    english: "Waiting",
    character: "䷄",
    upperTrigram: 4,
    lowerTrigram: 1,
    judgment: "Nourishment and confidence sustain you while waiting. Do not force the crossing; the right moment reveals itself. Sincerity brings success.",
    image: "Clouds rise toward heaven; the sage feasts and rests in good spirits.",
    lines: [
      { position: 1, isYang: true, text: "Waiting in the meadow.", meaning: "Patience in the open; danger has not yet arrived." },
      { position: 2, isYang: true, text: "Waiting on the sand; small criticisms arise.", meaning: "Minor obstacles appear; maintain equilibrium." },
      { position: 3, isYang: true, text: "Waiting in mud invites danger.", meaning: "Poor positioning makes you vulnerable; adjust now." },
      { position: 4, isYang: false, text: "Waiting in blood; accept the situation.", meaning: "Already wounded; cease struggle and tend injuries." },
      { position: 5, isYang: true, text: "Waiting at the feast.", meaning: "Nourish yourself while circumstances develop; enjoy the pause." },
      { position: 6, isYang: false, text: "Unexpected guests arrive; honor them.", meaning: "What arrives uninvited may bring unexpected gifts." }
    ],
    element: "water",
    changeType: "threshold",
    keywords: ["waiting", "patience", "timing", "nourishment", "trust"]
  },

  6: {
    number: 6,
    name: "Sung",
    english: "Conflict",
    character: "䷅",
    upperTrigram: 1,
    lowerTrigram: 4,
    judgment: "Opposition blocked; seek the wise mediator. Beginning is cautious; the middle path finds resolution. Forcing through to the end brings misfortune.",
    image: "Heaven and water move apart; the sage carefully considers beginnings to prevent disputes.",
    lines: [
      { position: 1, isYang: false, text: "Do not perpetuate the quarrel.", meaning: "Brief difficulty resolves; do not make it a pattern." },
      { position: 2, isYang: true, text: "Cannot win the fight; return home.", meaning: "Recognize when you are outmatched; retreat preserves dignity." },
      { position: 3, isYang: false, text: "Live on old virtue; dangerous but stable.", meaning: "Past merit sustains you; do not reach for more now." },
      { position: 4, isYang: true, text: "Cannot win; accept fate and find peace.", meaning: "Submission to reality brings unexpected relief." },
      { position: 5, isYang: true, text: "Arbitration brings supreme fortune.", meaning: "Third party resolution satisfies all involved." },
      { position: 6, isYang: true, text: "Victory by leather belt; soon stripped away.", meaning: "Forced triumph is temporary and hollow." }
    ],
    element: "air",
    changeType: "upheaval",
    keywords: ["conflict", "opposition", "mediation", "resolution", "restraint"]
  },

  7: {
    number: 7,
    name: "Shih",
    english: "The Army",
    character: "䷆",
    upperTrigram: 2,
    lowerTrigram: 4,
    judgment: "Organized force under wise leadership succeeds. Discipline and clear purpose allow collective action. The leader must be worthy of authority.",
    image: "Water under the earth; the sage nourishes the people and gathers the multitude.",
    lines: [
      { position: 1, isYang: false, text: "The army moves with discipline.", meaning: "Order and law at the foundation ensure success." },
      { position: 2, isYang: true, text: "In the center of the army, blessed.", meaning: "Right relationship with authority brings honor." },
      { position: 3, isYang: false, text: "The army carries corpses; misfortune.", meaning: "Poor leadership creates unnecessary casualties." },
      { position: 4, isYang: false, text: "The army retreats; no blame.", meaning: "Strategic withdrawal preserves forces for another day." },
      { position: 5, isYang: false, text: "Field has game; captured without error.", meaning: "Clear objective achieved through proper means." },
      { position: 6, isYang: false, text: "Great leader receives mandate; small people unfit.", meaning: "Authority must match capacity; misplaced power corrupts." }
    ],
    element: "water",
    changeType: "integration",
    keywords: ["organization", "discipline", "leadership", "collective", "strategy"]
  },

  8: {
    number: 8,
    name: "Pi",
    english: "Holding Together",
    character: "䷇",
    upperTrigram: 4,
    lowerTrigram: 2,
    judgment: "Union brings fortune. Examine yourself: are you sincere and constant? Late arrivals meet closed doors. Relationship requires mutual commitment.",
    image: "Water upon the earth; ancient kings established alliance with all peoples.",
    lines: [
      { position: 1, isYang: false, text: "Hold together with sincerity.", meaning: "Authentic connection attracts further relationships." },
      { position: 2, isYang: false, text: "Hold together from within.", meaning: "Inner integrity precedes external bonds." },
      { position: 3, isYang: false, text: "Holding together with the wrong people.", meaning: "Association with the misaligned corrupts your direction." },
      { position: 4, isYang: false, text: "Hold together outwardly as well.", meaning: "Public alignment strengthens private commitment." },
      { position: 5, isYang: true, text: "Manifest union; the king hunts on three sides only.", meaning: "Leave space for the willing to join voluntarily." },
      { position: 6, isYang: false, text: "No head for union; misfortune.", meaning: "Connection without direction dissipates energy." }
    ],
    element: "water",
    changeType: "integration",
    keywords: ["union", "alliance", "relationship", "commitment", "belonging"]
  },

  9: {
    number: 9,
    name: "Hsiao Ch'u",
    english: "Small Taming",
    character: "䷈",
    upperTrigram: 6,
    lowerTrigram: 1,
    judgment: "Gentle influence accumulates small gains. Dense clouds but no rain yet. Progress from the west brings success through patient cultivation.",
    image: "Wind blows across heaven; the sage refines outward expression and cultivates virtue.",
    lines: [
      { position: 1, isYang: true, text: "Return to the path; how could this be wrong?", meaning: "Course correction early prevents major deviation." },
      { position: 2, isYang: true, text: "Drawn back by connection; fortune.", meaning: "Relationship calls you homeward; honor the bond." },
      { position: 3, isYang: true, text: "Wagon loses a wheel; strife with spouse.", meaning: "Small breakdown in partnership requires attention." },
      { position: 4, isYang: false, text: "Sincerity dissolves fear and danger.", meaning: "Truthfulness creates safety even in difficulty." },
      { position: 5, isYang: true, text: "Sincere and bound to others; wealth shared.", meaning: "Genuine connection naturally distributes resources." },
      { position: 6, isYang: true, text: "Rain falls at last; danger in fullness.", meaning: "Completion achieved; now rest rather than push further." }
    ],
    element: "air",
    changeType: "ripening",
    keywords: ["restraint", "accumulation", "patience", "refinement", "subtle"]
  },

  10: {
    number: 10,
    name: "Lu",
    english: "Treading",
    character: "䷉",
    upperTrigram: 1,
    lowerTrigram: 8,
    judgment: "Tread on the tiger's tail without being bitten. Conduct yourself with clarity and joy even in danger. Respectful boldness brings success.",
    image: "Heaven above, lake below; the sage distinguishes high from low and settles the people's hearts.",
    lines: [
      { position: 1, isYang: true, text: "Simple conduct; proceed without error.", meaning: "Straightforward behavior navigates complexity safely." },
      { position: 2, isYang: true, text: "Treading a smooth path in solitude.", meaning: "Inner practice away from others' eyes; fortune in simplicity." },
      { position: 3, isYang: false, text: "One-eyed person can see; lame person can walk.", meaning: "Even partial capacity suffices if you do not overreach." },
      { position: 4, isYang: true, text: "Treading on the tiger's tail with caution.", meaning: "Awareness of danger allows you to proceed successfully." },
      { position: 5, isYang: true, text: "Resolute treading in a perilous position.", meaning: "Commitment without recklessness; conscious of risk." },
      { position: 6, isYang: true, text: "Examine your treading; observe the omens.", meaning: "Review your path; patterns reveal coming fortune." }
    ],
    element: "air",
    changeType: "threshold",
    keywords: ["conduct", "danger", "propriety", "boldness", "respect"]
  },

  11: {
    number: 11,
    name: "T'ai",
    english: "Peace",
    character: "䷊",
    upperTrigram: 2,
    lowerTrigram: 1,
    judgment: "Heaven and earth unite; great flow and harmony. The small departs, the great arrives. Leaders connect with ordinary people in mutual flourishing.",
    image: "Earth above, heaven below; the sovereign distributes nature's gifts to complete earth's work.",
    lines: [
      { position: 1, isYang: true, text: "Pull up grass and others come with it.", meaning: "One aligned action draws others into harmony." },
      { position: 2, isYang: true, text: "Bear with the uncultured graciously.", meaning: "Include the rough-edged; their strength has value." },
      { position: 3, isYang: true, text: "No plain without slope, no going without return.", meaning: "Cycles turn; maintain integrity through change." },
      { position: 4, isYang: false, text: "Fluttering down without boasting of wealth.", meaning: "Humility in fortune prevents arrogance." },
      { position: 5, isYang: false, text: "The sovereign gives daughter in marriage; blessing.", meaning: "Generous gesture creates lasting alliance." },
      { position: 6, isYang: false, text: "The wall falls back into the moat.", meaning: "Peak reverses; prepare for the natural decline ahead." }
    ],
    element: "earth",
    changeType: "integration",
    keywords: ["peace", "harmony", "prosperity", "union", "flourishing"]
  },

  12: {
    number: 12,
    name: "P'i",
    english: "Standstill",
    character: "䷋",
    upperTrigram: 1,
    lowerTrigram: 2,
    judgment: "Heaven and earth do not meet; stagnation and obstruction. The great departs, the small approaches. Not a time for advancement; preserve yourself quietly.",
    image: "Heaven and earth separated; the sage withdraws into inner worth, avoiding honors.",
    lines: [
      { position: 1, isYang: false, text: "Pull up grass, roots and all.", meaning: "Remove problems completely; half-measures fail." },
      { position: 2, isYang: false, text: "Bear with obstruction; small people rise.", meaning: "Endurance in adverse conditions; do not collaborate with decay." },
      { position: 3, isYang: false, text: "They bear shame.", meaning: "Those complicit with wrongdoing will eventually feel it." },
      { position: 4, isYang: true, text: "One who acts on the mandate remains blameless.", meaning: "Following true calling protects you in dark times." },
      { position: 5, isYang: true, text: "Standstill ends; fortune for the great person.", meaning: "Those of integrity persevere and eventually prevail." },
      { position: 6, isYang: true, text: "Standstill overturned; first misery, then joy.", meaning: "Crisis reaches peak and naturally transforms." }
    ],
    element: "air",
    changeType: "dissolution",
    keywords: ["obstruction", "standstill", "withdrawal", "preservation", "adversity"]
  },

  13: {
    number: 13,
    name: "T'ung Jen",
    english: "Fellowship",
    character: "䷌",
    upperTrigram: 1,
    lowerTrigram: 7,
    judgment: "Fellowship in the open succeeds. Crossing the great water favors those united. The wise person organizes clans and distinguishes things.",
    image: "Heaven together with fire; the sage distinguishes things by kind while honoring unity.",
    lines: [
      { position: 1, isYang: true, text: "Fellowship at the gate; no blame.", meaning: "Open-hearted gathering without exclusion or agenda." },
      { position: 2, isYang: false, text: "Fellowship only with one's clan; humiliation.", meaning: "Tribalism and exclusion diminish everyone." },
      { position: 3, isYang: true, text: "Hide weapons in the thicket; suspicion prevents union.", meaning: "Hidden agendas poison potential fellowship." },
      { position: 4, isYang: true, text: "Climb the wall but cannot attack; fortune.", meaning: "Recognize limit of opposition; choose peace instead." },
      { position: 5, isYang: true, text: "True fellows first wail, then laugh together.", meaning: "Honesty includes difficulty; real bond transcends it." },
      { position: 6, isYang: true, text: "Fellowship in the meadow; no regret.", meaning: "Meeting in neutral ground, without full union, has value." }
    ],
    element: "fire",
    changeType: "integration",
    keywords: ["fellowship", "community", "unity", "alliance", "common cause"]
  },

  14: {
    number: 14,
    name: "Ta Yu",
    english: "Great Possession",
    character: "䷍",
    upperTrigram: 7,
    lowerTrigram: 1,
    judgment: "Great success through alignment with heaven. Fire above heaven illuminates all. Strength combined with clarity brings supreme fortune.",
    image: "Fire above heaven; the sage suppresses evil and furthers good, obeying heaven's will.",
    lines: [
      { position: 1, isYang: true, text: "No relationship with harm; blameless.", meaning: "Avoid entanglement with destructive forces; stay clear." },
      { position: 2, isYang: true, text: "Large wagon for loading; undertakings succeed.", meaning: "Capacity matches opportunity; you can carry the weight." },
      { position: 3, isYang: true, text: "A prince offers gifts to the sovereign.", meaning: "Generosity upward and outward circulates abundance." },
      { position: 4, isYang: true, text: "Makes distinction between self and neighbor; no blame.", meaning: "Healthy boundaries preserve relationship and resources." },
      { position: 5, isYang: false, text: "Truth reciprocated; dignity with grace.", meaning: "Mutual recognition creates dignified connection." },
      { position: 6, isYang: true, text: "Blessing from heaven; nothing that does not further.", meaning: "Aligned with natural order; all action prospers." }
    ],
    element: "fire",
    changeType: "emergence",
    keywords: ["abundance", "prosperity", "wealth", "blessing", "clarity"]
  },

  15: {
    number: 15,
    name: "Ch'ien",
    english: "Modesty",
    character: "䷎",
    upperTrigram: 2,
    lowerTrigram: 5,
    judgment: "Modesty creates success. The wise person carries things through to completion. Heaven diminishes the full and augments the modest.",
    image: "Mountain within the earth; the sage reduces excess and increases the deficient.",
    lines: [
      { position: 1, isYang: false, text: "Modest in modesty; cross the great water.", meaning: "Genuine humility allows ambitious undertakings." },
      { position: 2, isYang: false, text: "Modesty that makes itself known; persistence furthers.", meaning: "Let your character speak; no need to announce it." },
      { position: 3, isYang: true, text: "Meritorious and modest; the wise bring things to conclusion.", meaning: "Competence without arrogance completes the work." },
      { position: 4, isYang: false, text: "Nothing that does not further; modesty in movement.", meaning: "Every action from this stance succeeds." },
      { position: 5, isYang: false, text: "Not wealthy through neighbors; attack with force.", meaning: "When modesty is exploited, defend yourself clearly." },
      { position: 6, isYang: false, text: "Modesty makes itself known; march forth.", meaning: "Time to manifest your capacity in the world." }
    ],
    element: "earth",
    changeType: "integration",
    keywords: ["modesty", "humility", "balance", "virtue", "completion"]
  },

  16: {
    number: 16,
    name: "Yu",
    english: "Enthusiasm",
    character: "䷏",
    upperTrigram: 3,
    lowerTrigram: 2,
    judgment: "Enthusiasm gathers helpers and sets armies marching. The great person in harmony with natural movement inspires others to follow.",
    image: "Thunder comes from the earth with power; ancient kings made music to honor merit.",
    lines: [
      { position: 1, isYang: false, text: "Proclaiming enthusiasm; misfortune.", meaning: "Boasting about your confidence reveals insecurity." },
      { position: 2, isYang: false, text: "Firm as a rock; by noon sees what comes.", meaning: "Grounded clarity perceives shifts before they manifest." },
      { position: 3, isYang: false, text: "Looking upward for enthusiasm; regret.", meaning: "Do not depend on others to generate your energy." },
      { position: 4, isYang: true, text: "Source of enthusiasm; achieves greatness.", meaning: "Authentic excitement naturally attracts companions." },
      { position: 5, isYang: false, text: "Persistently ill, yet does not die.", meaning: "Chronic limitation does not prevent forward movement." },
      { position: 6, isYang: false, text: "Deluded enthusiasm; if it changes, no blame.", meaning: "False confidence corrected in time averts disaster." }
    ],
    element: "fire",
    changeType: "emergence",
    keywords: ["enthusiasm", "inspiration", "movement", "music", "leadership"]
  },

  17: {
    number: 17,
    name: "Sui",
    english: "Following",
    character: "䷐",
    upperTrigram: 8,
    lowerTrigram: 3,
    judgment: "Following finds supreme success. Perseverance furthers. Know whom to follow and when to lead. Evening brings rest after movement.",
    image: "Thunder in the lake withdraws; the sage turns inward at nightfall for renewal.",
    lines: [
      { position: 1, isYang: true, text: "The standard changes; persistence brings good fortune.", meaning: "Adapt your allegiance when circumstances shift." },
      { position: 2, isYang: false, text: "Attached to the little boy, loses the strong man.", meaning: "Immature connection prevents mature relationship." },
      { position: 3, isYang: false, text: "Attached to the strong man, releases the little boy.", meaning: "Grow into alignment with greater capacity." },
      { position: 4, isYang: true, text: "Following creates success but danger in one-sidedness.", meaning: "Be clear in your purpose to avoid manipulation." },
      { position: 5, isYang: true, text: "Sincere in the good; fortune.", meaning: "Following what is genuinely excellent brings blessing." },
      { position: 6, isYang: false, text: "Firmly bound and held fast; the king honors the mountain.", meaning: "Complete commitment to the path receives recognition." }
    ],
    element: "water",
    changeType: "integration",
    keywords: ["following", "adaptation", "leadership", "allegiance", "timing"]
  },

  18: {
    number: 18,
    name: "Ku",
    english: "Work on Decay",
    character: "䷑",
    upperTrigram: 5,
    lowerTrigram: 6,
    judgment: "What has been spoiled through neglect can be repaired. Great success through determined effort. Before the starting point, three days; after, three days.",
    image: "Wind at the mountain's base; the sage stirs the people and renews character.",
    lines: [
      { position: 1, isYang: false, text: "Setting right what the father spoiled.", meaning: "Address inherited patterns with care and respect." },
      { position: 2, isYang: true, text: "Setting right what the mother spoiled.", meaning: "Gentle but firm correction of enabling patterns." },
      { position: 3, isYang: true, text: "Setting right what the father spoiled; small regret but no great blame.", meaning: "Imperfect correction still moves toward healing." },
      { position: 4, isYang: false, text: "Tolerating what the father spoiled; difficulty if continued.", meaning: "Ignoring inherited dysfunction perpetuates harm." },
      { position: 5, isYang: false, text: "Setting right what the father spoiled; receives praise.", meaning: "Skillful remediation of legacy honored by all." },
      { position: 6, isYang: true, text: "Does not serve kings or lords; pursues higher things.", meaning: "Beyond social repair lies personal transcendence." }
    ],
    element: "earth",
    changeType: "dissolution",
    keywords: ["decay", "repair", "inheritance", "correction", "renewal"]
  },

  19: {
    number: 19,
    name: "Lin",
    english: "Approach",
    character: "䷒",
    upperTrigram: 2,
    lowerTrigram: 8,
    judgment: "Approach brings supreme success through perseverance. The eighth month brings misfortune. Growth reaches its limit; prepare for reversal.",
    image: "Earth above the lake; the sage's capacity to teach and protect is inexhaustible.",
    lines: [
      { position: 1, isYang: true, text: "Joint approach; persistence brings fortune.", meaning: "United effort in early stages establishes success." },
      { position: 2, isYang: true, text: "Joint approach; fortune and nothing that does not further.", meaning: "Full alignment with the moment; everything prospers." },
      { position: 3, isYang: false, text: "Comfortable approach; nothing that furthers.", meaning: "Complacency in growth phase invites regression." },
      { position: 4, isYang: false, text: "Complete approach; no blame.", meaning: "Mature development fully embodied; stable platform achieved." },
      { position: 5, isYang: false, text: "Wise approach; fitting for a great prince.", meaning: "Leadership that combines vision with discernment." },
      { position: 6, isYang: false, text: "Magnanimous approach; fortune and no blame.", meaning: "Generous expansion brings blessing without consequence." }
    ],
    element: "earth",
    changeType: "emergence",
    keywords: ["approach", "growth", "advance", "teaching", "expansion"]
  },

  20: {
    number: 20,
    name: "Kuan",
    english: "Contemplation",
    character: "䷓",
    upperTrigram: 6,
    lowerTrigram: 2,
    judgment: "Contemplation; hands washed but offering not yet made. Sincerity and reverence command respect. Observe patterns to understand what moves beneath.",
    image: "Wind moves over the earth; ancient kings inspected all regions and observed the people.",
    lines: [
      { position: 1, isYang: false, text: "Boyish contemplation; for small people, no blame.", meaning: "Superficial observation acceptable for beginners only." },
      { position: 2, isYang: false, text: "Contemplation through the crack; suitable for a woman.", meaning: "Limited perspective serves domestic sphere, not beyond." },
      { position: 3, isYang: false, text: "Contemplation of one's own life.", meaning: "Self-reflection determines advance or retreat." },
      { position: 4, isYang: false, text: "Contemplation of the light of the land.", meaning: "Observe the whole system to understand your place." },
      { position: 5, isYang: true, text: "Contemplation of one's own life; the wise person is without blame.", meaning: "Honest self-assessment guides right action." },
      { position: 6, isYang: true, text: "Contemplation of another's life; the wise person is without blame.", meaning: "Observing others' patterns without judgment brings wisdom." }
    ],
    element: "air",
    changeType: "threshold",
    keywords: ["contemplation", "observation", "reflection", "pattern", "reverence"]
  },

  21: {
    number: 21,
    name: "Shih Ho",
    english: "Biting Through",
    character: "䷔",
    upperTrigram: 7,
    lowerTrigram: 3,
    judgment: "Obstacles between the jaws must be bitten through. Success through legal action and clear consequences. What blocks union must be removed decisively.",
    image: "Thunder and lightning; ancient kings clarified penalties and promulgated laws.",
    lines: [
      { position: 1, isYang: true, text: "Feet in stocks; toes disappear.", meaning: "Early restraint prevents further transgression." },
      { position: 2, isYang: false, text: "Bites through tender flesh; nose disappears.", meaning: "Easy correction; minor consequence suffices." },
      { position: 3, isYang: false, text: "Bites on dried meat; encounters poison.", meaning: "Old patterns resist; unpleasant but necessary work." },
      { position: 4, isYang: true, text: "Bites on dried gristly meat; receives metal arrows.", meaning: "Difficult case requires strength and clarity." },
      { position: 5, isYang: false, text: "Bites on dried lean meat; receives yellow gold.", meaning: "Persist through difficulty; reward follows perseverance." },
      { position: 6, isYang: true, text: "Neck in wooden cangue; ears disappear.", meaning: "Stubborn refusal to hear brings harsh consequence." }
    ],
    element: "fire",
    changeType: "upheaval",
    keywords: ["justice", "decisiveness", "obstacles", "law", "consequence"]
  },

  22: {
    number: 22,
    name: "Pi",
    english: "Grace",
    character: "䷕",
    upperTrigram: 5,
    lowerTrigram: 7,
    judgment: "Grace succeeds in small matters. Not the time for great undertakings. Form and beauty clarify content but cannot substitute for substance.",
    image: "Fire at the mountain's base; the sage clarifies affairs but dares not decide weighty matters.",
    lines: [
      { position: 1, isYang: true, text: "Adorns the toes; leaves carriage and walks.", meaning: "Simple beauty sufficient; do not rely on external support." },
      { position: 2, isYang: false, text: "Adorns the beard.", meaning: "Surface appearance follows inner character." },
      { position: 3, isYang: true, text: "Adorned and moist; perpetual perseverance brings fortune.", meaning: "Beauty combined with vitality sustains over time." },
      { position: 4, isYang: false, text: "White horse arrives as if flying.", meaning: "Pure intention approaches; not robbery but courtship." },
      { position: 5, isYang: false, text: "Garden in the hills; meager gifts bring humiliation then fortune.", meaning: "Humble offering initially refused; sincerity eventually recognized." },
      { position: 6, isYang: true, text: "Simple grace; no blame.", meaning: "Return to unadorned essence brings completion." }
    ],
    element: "fire",
    changeType: "ripening",
    keywords: ["grace", "beauty", "form", "refinement", "appearance"]
  },

  23: {
    number: 23,
    name: "Po",
    english: "Splitting Apart",
    character: "䷖",
    upperTrigram: 5,
    lowerTrigram: 2,
    judgment: "Splitting apart; not favorable to go anywhere. The dark forces rise; the wise withdraw and preserve themselves. Decline reaches its natural limit.",
    image: "Mountain rests on earth; above generosity to below secures their dwelling.",
    lines: [
      { position: 1, isYang: false, text: "Leg of bed splits; persistence brings destruction.", meaning: "Foundation erodes; pushing forward accelerates collapse." },
      { position: 2, isYang: false, text: "Bed splits at the edge; persistence brings destruction.", meaning: "Deterioration spreads; withdrawal is wisdom." },
      { position: 3, isYang: false, text: "Splits away from them; no blame.", meaning: "Separate yourself from the declining; save yourself." },
      { position: 4, isYang: false, text: "Bed splits to the skin; misfortune.", meaning: "Decay reaches the person; suffering touches you directly." },
      { position: 5, isYang: false, text: "String of fishes; favor through court ladies.", meaning: "Order and alignment preserved through proper channels." },
      { position: 6, isYang: true, text: "Large fruit not eaten; the wise person receives a carriage.", meaning: "What endures through decay receives recognition; renewal begins." }
    ],
    element: "earth",
    changeType: "dissolution",
    keywords: ["decline", "disintegration", "withdrawal", "preservation", "ending"]
  },

  24: {
    number: 24,
    name: "Fu",
    english: "Return",
    character: "䷗",
    upperTrigram: 2,
    lowerTrigram: 3,
    judgment: "Return brings success. Going and coming without error. Friends arrive without blame. The way returns upon itself. In seven days comes return.",
    image: "Thunder within the earth; at solstice, ancient kings closed the passes.",
    lines: [
      { position: 1, isYang: true, text: "Return from not far; no need for remorse.", meaning: "Early recognition of error enables quick correction." },
      { position: 2, isYang: false, text: "Quiet return; fortune.", meaning: "Grace in returning to the path; humility acknowledged." },
      { position: 3, isYang: false, text: "Repeated return; danger but no blame.", meaning: "Pattern of straying and returning; sincere effort protects you." },
      { position: 4, isYang: false, text: "Walking in the midst of others; returns alone.", meaning: "Individual conscience despite group pressure." },
      { position: 5, isYang: false, text: "Noble-hearted return; no remorse.", meaning: "Integrity guides the return; nothing to regret." },
      { position: 6, isYang: false, text: "Missed return; misfortune and disaster.", meaning: "Refusing to correct course brings calamity." }
    ],
    element: "earth",
    changeType: "emergence",
    keywords: ["return", "renewal", "correction", "cycle", "revival"]
  },

  25: {
    number: 25,
    name: "Wu Wang",
    english: "Innocence",
    character: "䷘",
    upperTrigram: 1,
    lowerTrigram: 3,
    judgment: "Innocence brings supreme success. Perseverance furthers. If not acting from truth, there is misfortune. Do not undertake anything calculated.",
    image: "Thunder under heaven; the ancient kings nourished all beings in accord with the seasons.",
    lines: [
      { position: 1, isYang: true, text: "Innocent going; fortune.", meaning: "Natural movement without agenda brings blessing." },
      { position: 2, isYang: false, text: "Not thinking of harvest while plowing.", meaning: "Act for its own sake; results follow naturally." },
      { position: 3, isYang: false, text: "Unearned misfortune; cow tied by passerby.", meaning: "Innocent suffer too; external forces beyond control." },
      { position: 4, isYang: true, text: "Can remain persevering; no blame.", meaning: "Maintain integrity despite circumstances; you are blameless." },
      { position: 5, isYang: true, text: "Illness without medicine; joy arrives.", meaning: "Problem resolves naturally without intervention." },
      { position: 6, isYang: true, text: "Innocent action brings misfortune; nothing furthers.", meaning: "Wrong timing even for right intention; wait." }
    ],
    element: "air",
    changeType: "emergence",
    keywords: ["innocence", "spontaneity", "authenticity", "natural", "trust"]
  },

  26: {
    number: 26,
    name: "Ta Ch'u",
    english: "Great Taming",
    character: "䷙",
    upperTrigram: 5,
    lowerTrigram: 1,
    judgment: "Great accumulation through restraint. Not eating at home brings fortune. Crossing the great water now furthers. Strength stored enables great undertakings.",
    image: "Heaven within the mountain; the sage learns widely from the words and deeds of the past.",
    lines: [
      { position: 1, isYang: true, text: "Danger present; desist.", meaning: "Recognize when to stop; premature action invites harm." },
      { position: 2, isYang: true, text: "Axletree taken from the wagon.", meaning: "Restraint imposed; accept the limitation gracefully." },
      { position: 3, isYang: true, text: "Good horse pursuing; persistence brings fortune.", meaning: "Disciplined practice of skill brings eventual mastery." },
      { position: 4, isYang: false, text: "Headboard for a young bull; great fortune.", meaning: "Early restraint prevents later wildness; wisdom of preparation." },
      { position: 5, isYang: false, text: "Tusk of a gelded boar; fortune.", meaning: "Dangerous force safely channeled; threat transformed to tool." },
      { position: 6, isYang: true, text: "Attains the way of heaven; success.", meaning: "Full mastery achieved; heaven's power accessible." }
    ],
    element: "earth",
    changeType: "ripening",
    keywords: ["accumulation", "restraint", "mastery", "preparation", "strength"]
  },

  27: {
    number: 27,
    name: "I",
    english: "Nourishment",
    character: "䷚",
    upperTrigram: 5,
    lowerTrigram: 3,
    judgment: "Nourishment brings fortune. Observe what you nourish and what nourishes you. Seek nourishment in the proper way; jaw moves correctly.",
    image: "Thunder at mountain's base; the sage guards words and regulates eating and drinking.",
    lines: [
      { position: 1, isYang: true, text: "Forsaking your magic tortoise to gaze at my moving jaws.", meaning: "Abandon your own wisdom to envy another; misfortune." },
      { position: 2, isYang: false, text: "Seeking nourishment from the hilltop; deviating from the path.", meaning: "Wrong source of sustenance; return to proper way." },
      { position: 3, isYang: false, text: "Turning away from nourishment; misfortune.", meaning: "Refusing what sustains you brings decline." },
      { position: 4, isYang: false, text: "Seeking nourishment from hilltop; fortune in persisting like a tiger.", meaning: "Unusual source requires strength to secure; worthwhile effort." },
      { position: 5, isYang: false, text: "Deviating from the path but remaining aware; fortune.", meaning: "Necessary departure from norm; conscious choice protects." },
      { position: 6, isYang: true, text: "Source of nourishment; danger but fortune.", meaning: "Great responsibility to nourish others; handle with care." }
    ],
    element: "earth",
    changeType: "ripening",
    keywords: ["nourishment", "sustenance", "provision", "care", "feeding"]
  },

  28: {
    number: 28,
    name: "Ta Kuo",
    english: "Great Exceeding",
    character: "䷛",
    upperTrigram: 8,
    lowerTrigram: 6,
    judgment: "The ridgepole sags; weight exceeds structure. Undertake something exceptional. Crossing the great water furthers. Extraordinary times require extraordinary action.",
    image: "Lake rises above the trees; the sage stands alone without fear and withdraws without regret.",
    lines: [
      { position: 1, isYang: false, text: "Spread white rushes below; no blame.", meaning: "Extra care in foundation prevents disaster." },
      { position: 2, isYang: true, text: "Dry poplar sprouts shoots; old man takes young wife.", meaning: "Unlikely renewal; mismatched union bears unexpected fruit." },
      { position: 3, isYang: true, text: "Ridgepole sags; misfortune.", meaning: "Excess reaches breaking point; collapse imminent." },
      { position: 4, isYang: true, text: "Ridgepole braced; fortune and other things.", meaning: "Timely support prevents disaster; additional benefits follow." },
      { position: 5, isYang: true, text: "Withered poplar blooms; old woman takes young husband.", meaning: "Surface show without substance; temporary appearance only." },
      { position: 6, isYang: false, text: "Must ford the stream; water over the head.", meaning: "Excess leads to overwhelm; noble but futile effort." }
    ],
    element: "water",
    changeType: "upheaval",
    keywords: ["excess", "extraordinary", "crisis", "overload", "exceptional"]
  },

  29: {
    number: 29,
    name: "K'an",
    english: "The Abysmal",
    character: "䷜",
    upperTrigram: 4,
    lowerTrigram: 4,
    judgment: "Water doubled; abyss upon abyss. Sincerity in the heart brings success. Actions undertaken bring honor. Remain true within danger.",
    image: "Water flows on; the sage practices constant virtue and teaches through repetition.",
    lines: [
      { position: 1, isYang: false, text: "Accustomed to the abyss; enters the pit.", meaning: "Familiarity with danger leads to carelessness; fall is imminent." },
      { position: 2, isYang: true, text: "Abyss is dangerous; seek small gains only.", meaning: "In extreme danger, modest goals are ambitious enough." },
      { position: 3, isYang: false, text: "Forward or back, abyss on abyss.", meaning: "Every direction threatens; stillness is your only safety." },
      { position: 4, isYang: false, text: "Jug of wine and bowl of rice; earthenware vessels.", meaning: "Simple offerings given with sincerity suffice in hard times." },
      { position: 5, isYang: true, text: "Abyss not filled; already at the rim.", meaning: "Danger receding; soon reaches level ground." },
      { position: 6, isYang: false, text: "Bound with cord and rope; imprisoned.", meaning: "Complete restraint; three years until release." }
    ],
    element: "water",
    changeType: "threshold",
    keywords: ["danger", "abyss", "difficulty", "persistence", "flowing"]
  },

  30: {
    number: 30,
    name: "Li",
    english: "The Clinging",
    character: "䷝",
    upperTrigram: 7,
    lowerTrigram: 7,
    judgment: "Fire doubled; clinging to what is bright and true. Perseverance furthers. Success comes through care of the cow; docility and nourishment.",
    image: "Brightness doubled; the sage illuminates the four directions through this clarity.",
    lines: [
      { position: 1, isYang: true, text: "Footprints crisscross; reverence brings no blame.", meaning: "Careful attention at the beginning prevents confusion." },
      { position: 2, isYang: false, text: "Yellow light; supreme fortune.", meaning: "Middle way of clarity; balanced illumination brings blessing." },
      { position: 3, isYang: true, text: "In the light of the setting sun; misfortune.", meaning: "Clinging to what fades brings sorrow; accept the cycle." },
      { position: 4, isYang: true, text: "Sudden arrival; burning, death, rejection.", meaning: "Consuming flame destroys what it touches; intensity has cost." },
      { position: 5, isYang: false, text: "Tears flood, sighs emerge; fortune.", meaning: "Grief fully felt purifies; emotion released brings relief." },
      { position: 6, isYang: true, text: "King uses marching orders; victory and honor.", meaning: "Clarity of purpose in action brings successful completion." }
    ],
    element: "fire",
    changeType: "emergence",
    keywords: ["clarity", "illumination", "clinging", "brightness", "awareness"]
  },

  31: {
    number: 31,
    name: "Hsien",
    english: "Influence",
    character: "䷞",
    upperTrigram: 8,
    lowerTrigram: 5,
    judgment: "Influence brings success. Perseverance furthers. Taking a maiden to wife brings fortune. Receptivity and approach create mutual attraction.",
    image: "Lake above mountain; the sage receives people through inner emptiness.",
    lines: [
      { position: 1, isYang: false, text: "Influence in the big toe.", meaning: "Faint impulse to move; intention not yet manifested." },
      { position: 2, isYang: false, text: "Influence in the calves; misfortune.", meaning: "Premature action on impulse; wait for right timing." },
      { position: 3, isYang: true, text: "Influence in the thighs; holds to what follows.", meaning: "Driven by desire; following another's lead brings regret." },
      { position: 4, isYang: true, text: "Perseverance brings fortune; remorse vanishes.", meaning: "Steady heart amid attraction; integrity maintained brings blessing." },
      { position: 5, isYang: true, text: "Influence in the back of the neck; no remorse.", meaning: "Unconscious influence; not willful manipulation so no harm." },
      { position: 6, isYang: false, text: "Influence in jaws, cheeks, and tongue.", meaning: "Mere words without substance; empty talk creates nothing." }
    ],
    element: "water",
    changeType: "emergence",
    keywords: ["influence", "attraction", "courtship", "receptivity", "connection"]
  },

  32: {
    number: 32,
    name: "Heng",
    english: "Duration",
    character: "䷟",
    upperTrigram: 3,
    lowerTrigram: 6,
    judgment: "Duration brings success. No blame in perseverance. Undertakings further. Movement within follows firm principles; endurance through constancy.",
    image: "Thunder and wind; the sage stands firm and changes not direction.",
    lines: [
      { position: 1, isYang: false, text: "Seeking duration too hastily; misfortune.", meaning: "Demanding permanence prematurely prevents natural bonding." },
      { position: 2, isYang: true, text: "Remorse vanishes.", meaning: "Capacity matches position; sustainable engagement achieved." },
      { position: 3, isYang: true, text: "Not constant in character; disgrace.", meaning: "Inconsistency undermines trust; no one relies on you." },
      { position: 4, isYang: true, text: "No game in the field.", meaning: "Seeking in wrong place yields nothing; redirect effort." },
      { position: 5, isYang: false, text: "Constant in character through adaptability; fortune.", meaning: "Flexible constancy; adjust form while maintaining essence." },
      { position: 6, isYang: false, text: "Restless duration; misfortune.", meaning: "Contradiction between permanence and agitation; choose one." }
    ],
    element: "air",
    changeType: "integration",
    keywords: ["duration", "endurance", "constancy", "perseverance", "stability"]
  },

  33: {
    number: 33,
    name: "Tun",
    english: "Retreat",
    character: "䷠",
    upperTrigram: 1,
    lowerTrigram: 5,
    judgment: "Retreat brings success. In small matters perseverance furthers. The dark forces advance; withdrawal is not weakness but wisdom. Preserve strength for later.",
    image: "Mountain below heaven; the sage keeps the inferior at a distance, not in anger but with reserve.",
    lines: [
      { position: 1, isYang: false, text: "Tail in retreat; danger.", meaning: "Last to withdraw faces greatest peril; move quickly." },
      { position: 2, isYang: false, text: "Holding firm as with yellow oxhide; none can tear loose.", meaning: "Bound by commitment despite retreat; honor holds you." },
      { position: 3, isYang: true, text: "Halted retreat; danger and illness.", meaning: "Entanglement prevents full withdrawal; distress results." },
      { position: 4, isYang: true, text: "Voluntary retreat; fortune for the wise, misfortune for the small.", meaning: "Graceful withdrawal requires maturity; lesser people cling." },
      { position: 5, isYang: true, text: "Friendly retreat; perseverance brings fortune.", meaning: "Withdraw on good terms; relationship preserved through honesty." },
      { position: 6, isYang: true, text: "Cheerful retreat; everything furthers.", meaning: "Complete freedom in withdrawal; no regret, only clarity." }
    ],
    element: "air",
    changeType: "dissolution",
    keywords: ["retreat", "withdrawal", "timing", "preservation", "strategy"]
  },

  34: {
    number: 34,
    name: "Ta Chuang",
    english: "Great Power",
    character: "䷡",
    upperTrigram: 3,
    lowerTrigram: 1,
    judgment: "Power in ascendance. Perseverance furthers. Strength must be guided by wisdom; force without discernment leads to excess. The goat butts the hedge.",
    image: "Thunder in heaven above; the sage does not tread where propriety would be violated.",
    lines: [
      { position: 1, isYang: true, text: "Power in the toes; advance brings misfortune.", meaning: "Strength at foundation insufficient for action; premature move fails." },
      { position: 2, isYang: true, text: "Perseverance brings fortune.", meaning: "Power combined with patience; right use of strength." },
      { position: 3, isYang: true, text: "Small person uses power; wise person refrains.", meaning: "Restraint distinguishes nobility from aggression." },
      { position: 4, isYang: true, text: "Perseverance brings fortune; remorse vanishes.", meaning: "Breakthrough achieved without excess; balanced success." },
      { position: 5, isYang: false, text: "Loses the goat easily; no remorse.", meaning: "Stubborn force released without struggle; flexibility wins." },
      { position: 6, isYang: false, text: "Goat butts the hedge; cannot retreat, cannot advance.", meaning: "Reckless force creates its own trap; stuck in excess." }
    ],
    element: "fire",
    changeType: "emergence",
    keywords: ["power", "strength", "force", "restraint", "vigor"]
  },

  35: {
    number: 35,
    name: "Chin",
    english: "Progress",
    character: "䷢",
    upperTrigram: 7,
    lowerTrigram: 2,
    judgment: "Progress like the sun rising over the earth. The powerful prince is honored with horses in great number. In a single day received three times in audience.",
    image: "Sun rises over the earth; the sage illuminates their own bright virtue.",
    lines: [
      { position: 1, isYang: false, text: "Progressing but turned back; perseverance brings fortune.", meaning: "Opposition met; maintain integrity despite setback." },
      { position: 2, isYang: false, text: "Progressing but in sorrow; fortune through receiving gifts.", meaning: "Advancement limited; ancestral blessing sustains you." },
      { position: 3, isYang: false, text: "All are in accord; remorse vanishes.", meaning: "Group support dissolves previous doubt; collective momentum." },
      { position: 4, isYang: true, text: "Progress like a hamster; dangerous perseverance.", meaning: "Advancement through hoarding invites predation; insecure position." },
      { position: 5, isYang: false, text: "Remorse vanishes; loss and gain not a concern.", meaning: "Detachment from outcome; act rightly regardless of result." },
      { position: 6, isYang: true, text: "Progress by goring; use only to discipline your own.", meaning: "Forceful advance acceptable only within your domain." }
    ],
    element: "fire",
    changeType: "emergence",
    keywords: ["progress", "advance", "rising", "clarity", "growth"]
  },

  36: {
    number: 36,
    name: "Ming I",
    english: "Darkening of Light",
    character: "䷣",
    upperTrigram: 2,
    lowerTrigram: 7,
    judgment: "Light sinks into the earth. In adversity perseverance furthers. Outwardly yielding, inwardly firm. Conceal your brightness in dark times; King Wen imprisoned.",
    image: "Light within the earth; the sage conceals brightness while dwelling among people.",
    lines: [
      { position: 1, isYang: true, text: "Flight with drooping wings; does not eat for three days.", meaning: "Swift escape from danger; urgent withdrawal requires sacrifice." },
      { position: 2, isYang: false, text: "Darkening of light wounds the left thigh; rescue with strength of horse.", meaning: "Injured but able to flee; help arrives enabling escape." },
      { position: 3, isYang: true, text: "Darkening of light in the southern hunt; captures the great leader.", meaning: "Discovery of corruption's source; beginning of restoration." },
      { position: 4, isYang: false, text: "Enters the left belly; obtains the heart.", meaning: "Penetrates to the core of darkness; understands its nature." },
      { position: 5, isYang: false, text: "Prince Chi conceals his light; perseverance furthers.", meaning: "Wise person hides excellence in dangerous times; survival through discretion." },
      { position: 6, isYang: false, text: "Not light but darkness; first ascended to heaven, then plunged to earth.", meaning: "Arrogance reaches peak and crashes; reversal complete." }
    ],
    element: "earth",
    changeType: "dissolution",
    keywords: ["adversity", "concealment", "darkness", "persecution", "endurance"]
  },

  37: {
    number: 37,
    name: "Chia Jen",
    english: "The Family",
    character: "䷤",
    upperTrigram: 6,
    lowerTrigram: 7,
    judgment: "The family; perseverance of the woman furthers. Right relationships within the home create foundation for society. Each person in their proper place.",
    image: "Wind comes from fire; the sage's words have substance and their conduct is consistent.",
    lines: [
      { position: 1, isYang: true, text: "Firm barriers for the family; remorse vanishes.", meaning: "Clear boundaries established early prevent later chaos." },
      { position: 2, isYang: false, text: "Not pursuing outside ventures; nourishing at center.", meaning: "Focus on family provision; proper role faithfully enacted." },
      { position: 3, isYang: true, text: "Family speaks with severity; regret but fortune.", meaning: "Strictness preserves order; gentleness would enable decay." },
      { position: 4, isYang: false, text: "She is the treasure of the house; great fortune.", meaning: "Woman's virtue enriches all; foundation of prosperity." },
      { position: 5, isYang: true, text: "King approaches his family; no fear, fortune.", meaning: "Leader brings warmth without familiarity; respectful love." },
      { position: 6, isYang: true, text: "Work commands respect; in the end, fortune.", meaning: "Authentic integrity in family role brings eventual blessing." }
    ],
    element: "fire",
    changeType: "integration",
    keywords: ["family", "relationships", "order", "roles", "foundation"]
  },

  38: {
    number: 38,
    name: "K'uei",
    english: "Opposition",
    character: "䷥",
    upperTrigram: 7,
    lowerTrigram: 8,
    judgment: "Opposition; in small matters fortune. Fire and lake move in contrary directions. Unity arises not from uniformity but from proper relationship in difference.",
    image: "Fire above, lake below; the sage maintains individuality amid the collective.",
    lines: [
      { position: 1, isYang: true, text: "Remorse vanishes; lost horse returns by itself.", meaning: "Apparent loss in opposition resolves naturally; do not chase." },
      { position: 2, isYang: true, text: "Meeting the master in the lane; no blame.", meaning: "Unexpected encounter in neutral space enables connection." },
      { position: 3, isYang: false, text: "Wagon dragged back; oxen halted.", meaning: "Every effort opposed; frustration mounting but hold steady." },
      { position: 4, isYang: true, text: "Isolated through opposition; meets a sincere person.", meaning: "Alienation ends when true companion recognized." },
      { position: 5, isYang: false, text: "Remorse vanishes; companion bites through skin.", meaning: "Deep connection penetrates surface opposition." },
      { position: 6, isYang: true, text: "Sees the pig covered with mud, wagon full of devils.", meaning: "Distorted perception creates opposition; clarity dissolves illusion." }
    ],
    element: "fire",
    changeType: "upheaval",
    keywords: ["opposition", "difference", "tension", "misunderstanding", "estrangement"]
  },

  39: {
    number: 39,
    name: "Chien",
    english: "Obstruction",
    character: "䷦",
    upperTrigram: 4,
    lowerTrigram: 5,
    judgment: "Obstruction; the southwest furthers, the northeast does not. See the great person; perseverance brings fortune. Obstacles require turning back to gather help.",
    image: "Water upon the mountain; the sage turns inward and cultivates character.",
    lines: [
      { position: 1, isYang: false, text: "Going leads to obstruction; coming meets praise.", meaning: "Advance blocked; return to source brings recognition." },
      { position: 2, isYang: false, text: "King's servant; obstruction upon obstruction.", meaning: "Difficulty in service not personal failing; systemic obstacle." },
      { position: 3, isYang: true, text: "Going leads to obstruction; turns back.", meaning: "Wise person recognizes impossibility and reverses course." },
      { position: 4, isYang: false, text: "Going leads to obstruction; coming brings connection.", meaning: "Forward blocked but companions gather at your position." },
      { position: 5, isYang: true, text: "In great obstruction, friends arrive.", meaning: "Peak difficulty summons assistance; help comes when most needed." },
      { position: 6, isYang: false, text: "Going leads to obstruction; coming brings great fortune.", meaning: "Return to serve the greater good brings supreme blessing." }
    ],
    element: "water",
    changeType: "threshold",
    keywords: ["obstruction", "difficulty", "retreat", "help", "limitation"]
  },

  40: {
    number: 40,
    name: "Hsieh",
    english: "Deliverance",
    character: "䷧",
    upperTrigram: 3,
    lowerTrigram: 4,
    judgment: "Deliverance; the southwest furthers. If no longer anything to resolve, return brings fortune. If still matters to resolve, hastening brings fortune.",
    image: "Thunder and rain; the sage pardons mistakes and forgives transgressions.",
    lines: [
      { position: 1, isYang: false, text: "Without blame.", meaning: "Crisis resolved; rest and recover from ordeal." },
      { position: 2, isYang: true, text: "Kills three foxes in the field; receives yellow arrow.", meaning: "Eliminates hidden threats; rewarded for vigilance." },
      { position: 3, isYang: false, text: "Carrying load on back while riding; invites robbers.", meaning: "Contradiction in status attracts exploitation; choose one station." },
      { position: 4, isYang: true, text: "Deliver yourself from your big toe.", meaning: "Remove unworthy companions; liberation through severance." },
      { position: 5, isYang: false, text: "The wise person delivers themselves; fortune.", meaning: "Self-liberation through insight; small people follow naturally." },
      { position: 6, isYang: false, text: "Prince shoots hawk on high wall; achieves everything.", meaning: "Elimination of danger from elevated position; complete success." }
    ],
    element: "water",
    changeType: "dissolution",
    keywords: ["deliverance", "release", "liberation", "resolution", "clearing"]
  },

  41: {
    number: 41,
    name: "Sun",
    english: "Decrease",
    character: "䷨",
    upperTrigram: 5,
    lowerTrigram: 8,
    judgment: "Decrease combined with sincerity brings supreme fortune. No blame; perseverance furthers. Two small bowls suffice for offering. What decreases below increases above.",
    image: "Mountain below, lake above; the sage controls anger and restrains desires.",
    lines: [
      { position: 1, isYang: true, text: "Going quickly after finishing; no blame.", meaning: "Serve the need then withdraw; do not linger for praise." },
      { position: 2, isYang: true, text: "Perseverance furthers; undertaking brings misfortune.", meaning: "Maintain your position; do not deplete yourself for others." },
      { position: 3, isYang: false, text: "When three walk, one is lost; one walking finds companion.", meaning: "Simplicity strengthens; complexity dilutes focus." },
      { position: 4, isYang: false, text: "Decreases one's illness; hastens joy.", meaning: "Release what sickens you; healing accelerates." },
      { position: 5, isYang: false, text: "Someone increases you; ten pairs of tortoises cannot oppose.", meaning: "Unexpected blessing arrives; inevitable fortune." },
      { position: 6, isYang: true, text: "Increase without decrease; no blame.", meaning: "Receiving without loss to others; pure benefit." }
    ],
    element: "water",
    changeType: "dissolution",
    keywords: ["decrease", "simplicity", "reduction", "letting go", "sacrifice"]
  },

  42: {
    number: 42,
    name: "I",
    english: "Increase",
    character: "䷩",
    upperTrigram: 6,
    lowerTrigram: 3,
    judgment: "Increase furthers undertakings. Crossing the great water is favored. What decreases above increases below; joy and movement without bounds.",
    image: "Wind and thunder; the sage sees good and imitates it, perceives faults and corrects them.",
    lines: [
      { position: 1, isYang: true, text: "Furthers great works; supreme fortune, no blame.", meaning: "Blessing enables ambitious undertaking; seize the moment." },
      { position: 2, isYang: false, text: "Someone increases you; ten pairs of tortoises cannot oppose.", meaning: "Gift from heaven cannot be refused or lost." },
      { position: 3, isYang: false, text: "Increased through misfortune; no blame if sincere.", meaning: "Crisis becomes opportunity through honest response." },
      { position: 4, isYang: false, text: "Walking in the middle; inform the prince.", meaning: "Mediator position; communicate truth to leadership." },
      { position: 5, isYang: true, text: "Sincere kindness; no question, supreme fortune.", meaning: "Generous heart without calculation brings ultimate blessing." },
      { position: 6, isYang: true, text: "No increase for them; someone strikes them.", meaning: "Selfish hoarding invites attack; excess reversed violently." }
    ],
    element: "air",
    changeType: "emergence",
    keywords: ["increase", "growth", "expansion", "benefit", "blessing"]
  },

  43: {
    number: 43,
    name: "Kuai",
    english: "Breakthrough",
    character: "䷪",
    upperTrigram: 8,
    lowerTrigram: 1,
    judgment: "Resolutely make known at the king's court. Cry out truthfully despite danger. Inform your own city; force does not further. Decisive moment requires clear declaration.",
    image: "Lake risen to heaven; the sage distributes wealth to those below and avoids resting on virtue.",
    lines: [
      { position: 1, isYang: true, text: "Mighty in forward stride; going without mastery brings blame.", meaning: "Strong beginning but incomplete preparation invites failure." },
      { position: 2, isYang: true, text: "Cry of alarm; weapons at night; no fear.", meaning: "Vigilance in suspicious times; readiness brings security." },
      { position: 3, isYang: true, text: "Mighty in cheekbones brings misfortune.", meaning: "Aggressive display alienates allies; soften your approach." },
      { position: 4, isYang: true, text: "Skin torn from buttocks; difficult walking.", meaning: "Wounded and struggling; stubborn perseverance through pain." },
      { position: 5, isYang: true, text: "Mountain goat attacked with determination; no blame.", meaning: "Persistent confrontation of stubbornness eventually succeeds." },
      { position: 6, isYang: false, text: "No cry; in the end misfortune.", meaning: "Silence when declaration needed brings eventual disaster." }
    ],
    element: "air",
    changeType: "upheaval",
    keywords: ["breakthrough", "decision", "resolution", "declaration", "decisive"]
  },

  44: {
    number: 44,
    name: "Kou",
    english: "Coming to Meet",
    character: "䷫",
    upperTrigram: 1,
    lowerTrigram: 6,
    judgment: "The maiden is powerful; do not marry such a maiden. A single weak line rises from below to meet the strong. The unexpected encounter carries danger.",
    image: "Wind under heaven; the prince issues commands to the four corners.",
    lines: [
      { position: 1, isYang: false, text: "Halted by metal brake; perseverance brings fortune.", meaning: "Early restraint of dangerous tendency prevents disaster." },
      { position: 2, isYang: true, text: "Fish in the container; no blame.", meaning: "Contain what is encountered; do not let it spread." },
      { position: 3, isYang: true, text: "Skin torn from buttocks; walking brings difficulty.", meaning: "Already harmed by the encounter; proceed carefully." },
      { position: 4, isYang: true, text: "No fish in the container; misfortune arises.", meaning: "Failure to contain danger allows it to escape and harm." },
      { position: 5, isYang: true, text: "Melon covered with willow leaves.", meaning: "Hidden beauty revealed suddenly; heaven-sent gift." },
      { position: 6, isYang: true, text: "Comes to meet with horns; humiliation but no blame.", meaning: "Hostile encounter; disgrace but not culpability." }
    ],
    element: "air",
    changeType: "emergence",
    keywords: ["meeting", "temptation", "encounter", "danger", "seduction"]
  },

  45: {
    number: 45,
    name: "Ts'ui",
    english: "Gathering",
    character: "䷬",
    upperTrigram: 8,
    lowerTrigram: 2,
    judgment: "Gathering together brings success. The king approaches the temple. See the great person; this furthers. Perseverance brings fortune. Great sacrifices create unity.",
    image: "Lake over the earth; the sage renews weapons and prepares for the unexpected.",
    lines: [
      { position: 1, isYang: false, text: "Sincere but not to the end; confusion then gathering.", meaning: "Initial chaos in assembly resolves through persistence." },
      { position: 2, isYang: false, text: "Letting oneself be drawn brings fortune, no blame.", meaning: "Allow natural attraction to guide you into the collective." },
      { position: 3, isYang: false, text: "Gathering with sighs; nothing that furthers.", meaning: "Reluctant assembly brings no benefit; energy misaligned." },
      { position: 4, isYang: true, text: "Great fortune, no blame.", meaning: "Central position in the gathering; natural leader emerges." },
      { position: 5, isYang: true, text: "Gathering through position; no blame.", meaning: "Authority creates unity; legitimate power gathers people." },
      { position: 6, isYang: false, text: "Lamenting and sighing; no blame.", meaning: "Grief at gathering's failure; sincere sorrow releases obligation." }
    ],
    element: "water",
    changeType: "integration",
    keywords: ["gathering", "congregation", "assembly", "union", "collective"]
  },

  46: {
    number: 46,
    name: "Sheng",
    english: "Pushing Upward",
    character: "䷭",
    upperTrigram: 2,
    lowerTrigram: 6,
    judgment: "Pushing upward brings supreme success. See the great person; do not fear. Journey to the south brings fortune. Growth emerges from below like a tree from the earth.",
    image: "Wood grows within the earth; the sage gathers small things to achieve the high and great.",
    lines: [
      { position: 1, isYang: false, text: "Pushing upward meets confidence; great fortune.", meaning: "Initial rise welcomed; auspicious beginning to ascent." },
      { position: 2, isYang: true, text: "Sincere even in small sacrifice; no blame.", meaning: "Modest offering given genuinely suffices for progress." },
      { position: 3, isYang: true, text: "Pushes upward into empty city.", meaning: "Advance meets no resistance; unexpectedly easy rise." },
      { position: 4, isYang: false, text: "King offers sacrifice on Mount Chi; fortune, no blame.", meaning: "Recognition by authority consecrates your ascent." },
      { position: 5, isYang: false, text: "Perseverance brings fortune; pushes upward by steps.", meaning: "Steady incremental rise; patient accumulation succeeds." },
      { position: 6, isYang: false, text: "Pushing upward in darkness.", meaning: "Blind ambition without awareness; unsustainable rise." }
    ],
    element: "earth",
    changeType: "emergence",
    keywords: ["ascent", "growth", "rising", "development", "promotion"]
  },

  47: {
    number: 47,
    name: "K'un",
    english: "Oppression",
    character: "䷮",
    upperTrigram: 8,
    lowerTrigram: 4,
    judgment: "Oppression but success for the persevering great person. No blame. Words not believed. Exhaustion tests character; the wise maintain inner truth despite outer difficulty.",
    image: "Lake without water; the sage stakes life on fulfilling will.",
    lines: [
      { position: 1, isYang: false, text: "Buttocks oppressed by tree stump.", meaning: "Stuck in uncomfortable position; unable to move freely." },
      { position: 2, isYang: true, text: "Oppressed by wine and food.", meaning: "Excess creates its own oppression; trapped by indulgence." },
      { position: 3, isYang: false, text: "Oppressed by stone; relies on thorns.", meaning: "Crushed by circumstances; seeking support from unreliable sources." },
      { position: 4, isYang: true, text: "Comes slowly, oppressed by metal carriage.", meaning: "Help arrives but burdened; delayed and difficult assistance." },
      { position: 5, isYang: true, text: "Nose and feet cut off; oppressed by red knee covers.", meaning: "Multiple wounds; authority offers inadequate help." },
      { position: 6, isYang: false, text: "Oppressed by trailing vines; moves dangerously.", meaning: "Entangled and unstable; any movement risky." }
    ],
    element: "water",
    changeType: "threshold",
    keywords: ["oppression", "exhaustion", "adversity", "hardship", "endurance"]
  },

  48: {
    number: 48,
    name: "Ching",
    english: "The Well",
    character: "䷯",
    upperTrigram: 4,
    lowerTrigram: 6,
    judgment: "The well unchanged through changing times. Governments come and go; the well remains. No loss, no gain. They come and go to the well. If rope does not reach water, misfortune.",
    image: "Water over wood; the sage encourages people in their work and exhorts mutual help.",
    lines: [
      { position: 1, isYang: false, text: "Muddy well; no one drinks.", meaning: "Neglected source; unused capacity deteriorates." },
      { position: 2, isYang: true, text: "Well shoots fish; jug broken and leaks.", meaning: "Misused resource; serves wrong function and fails." },
      { position: 3, isYang: true, text: "Well cleaned but not drunk from.", meaning: "Ready but unrecognized; prepared gift awaits acceptance." },
      { position: 4, isYang: false, text: "Well lined with stone; no blame.", meaning: "Infrastructure maintained; foundation secure for future use." },
      { position: 5, isYang: true, text: "Clear cold water from the well.", meaning: "Pure source; excellent quality available to all." },
      { position: 6, isYang: false, text: "Well uncovered; supreme fortune.", meaning: "Accessible abundance; shared resource benefits community." }
    ],
    element: "water",
    changeType: "integration",
    keywords: ["source", "foundation", "nourishment", "community", "constancy"]
  },

  49: {
    number: 49,
    name: "Ko",
    english: "Revolution",
    character: "䷰",
    upperTrigram: 8,
    lowerTrigram: 7,
    judgment: "Revolution accomplished when the time is right. Supreme success through perseverance. Remorse vanishes. Fire and water clash; molting creates the new.",
    image: "Fire in the lake; the sage regulates the calendar and clarifies the seasons.",
    lines: [
      { position: 1, isYang: true, text: "Wrapped in hide of yellow cow.", meaning: "Bound too tightly to old form; not yet time for change." },
      { position: 2, isYang: false, text: "When the day arrives, revolution; undertaking brings fortune.", meaning: "Perfect timing recognized; action brings blessing." },
      { position: 3, isYang: true, text: "Undertaking brings misfortune; perseverance brings danger.", meaning: "Premature revolution fails; wait for full readiness." },
      { position: 4, isYang: true, text: "Remorse vanishes; believed and changing the mandate.", meaning: "Credibility established; authority to transform recognized." },
      { position: 5, isYang: true, text: "Great person changes like a tiger; no need to consult oracle.", meaning: "Transformation complete and unmistakable; no doubt remains." },
      { position: 6, isYang: false, text: "Wise person changes like a leopard; small people molt the face.", meaning: "Deep change for the mature; superficial for the shallow." }
    ],
    element: "fire",
    changeType: "upheaval",
    keywords: ["revolution", "transformation", "molting", "renewal", "radical change"]
  },

  50: {
    number: 50,
    name: "Ting",
    english: "The Cauldron",
    character: "䷱",
    upperTrigram: 7,
    lowerTrigram: 6,
    judgment: "The cauldron brings supreme fortune and success. Transformation through fire; raw becomes nourishment. The vessel contains the offering; form serves substance.",
    image: "Fire over wood; the sage consolidates position and secures fate.",
    lines: [
      { position: 1, isYang: false, text: "Cauldron overturned; clearing out the stale.", meaning: "Necessary emptying before refilling; remove old contents." },
      { position: 2, isYang: true, text: "Cauldron filled with food; companion has illness.", meaning: "You possess nourishment; share generously with those in need." },
      { position: 3, isYang: true, text: "Cauldron's handles altered; blocked.", meaning: "Impaired function; vessel intact but unusable in current form." },
      { position: 4, isYang: true, text: "Cauldron's legs broken; prince's food spilled.", meaning: "Structural failure at critical moment; offering wasted." },
      { position: 5, isYang: false, text: "Cauldron with yellow handles and golden rings.", meaning: "Perfect form and function; excellent vessel for transformation." },
      { position: 6, isYang: true, text: "Cauldron with jade handles; great fortune, everything furthers.", meaning: "Supreme excellence in form; all possibilities open." }
    ],
    element: "fire",
    changeType: "integration",
    keywords: ["transformation", "nourishment", "vessel", "refinement", "offering"]
  },

  51: {
    number: 51,
    name: "Chen",
    english: "The Arousing",
    character: "䷲",
    upperTrigram: 3,
    lowerTrigram: 3,
    judgment: "Shock brings success. Thunder terrifies for a hundred miles; the wise person remains composed. Thunder doubled; when shock comes, laughter and speech remain steady.",
    image: "Thunder repeated; the sage in fear and trembling examines themselves and improves.",
    lines: [
      { position: 1, isYang: true, text: "Shock comes; after terror, laughter.", meaning: "Initial fright gives way to relief; you survive the jolt." },
      { position: 2, isYang: false, text: "Shock approaches danger; lose possessions climbing high.", meaning: "Threat imminent; abandon valuables and seek safety." },
      { position: 3, isYang: false, text: "Shock bewilders; acting in shock brings no error.", meaning: "Disoriented but moving; instinct serves when thought fails." },
      { position: 4, isYang: true, text: "Shock gets stuck in mud.", meaning: "Impact absorbed; no forward motion but no destruction." },
      { position: 5, isYang: false, text: "Shock goes and comes; danger but nothing lost.", meaning: "Repeated jolts but centered position preserves you." },
      { position: 6, isYang: false, text: "Shock brings devastation; terrified gazing around.", meaning: "Overwhelming impact; witnessing widespread destruction." }
    ],
    element: "fire",
    changeType: "upheaval",
    keywords: ["shock", "thunder", "arousing", "sudden", "jolt"]
  },

  52: {
    number: 52,
    name: "Ken",
    english: "Keeping Still",
    character: "䷳",
    upperTrigram: 5,
    lowerTrigram: 5,
    judgment: "Keeping still on the back; no longer perceives the self. Walks in the courtyard without seeing people. No blame. Stillness at the right time enables clarity.",
    image: "Mountains resting; the sage's thoughts do not go beyond their situation.",
    lines: [
      { position: 1, isYang: false, text: "Keeping toes still; no blame.", meaning: "Restraint at the beginning prevents error down the road." },
      { position: 2, isYang: false, text: "Keeping calves still; cannot rescue the followed.", meaning: "Partial stillness insufficient; cannot save those who move." },
      { position: 3, isYang: true, text: "Keeping hips still; stiffens the spine.", meaning: "Forced immobility causes rigidity; balance needed." },
      { position: 4, isYang: false, text: "Keeping the trunk still; no blame.", meaning: "Center held motionless; extremities may move freely." },
      { position: 5, isYang: false, text: "Keeping jaws still; words ordered.", meaning: "Speech restrained; when you speak, precision and care." },
      { position: 6, isYang: true, text: "Noble-hearted keeping still; fortune.", meaning: "Complete composure rooted in wisdom; supreme attainment." }
    ],
    element: "earth",
    changeType: "threshold",
    keywords: ["stillness", "meditation", "mountain", "immobility", "composure"]
  },

  53: {
    number: 53,
    name: "Chien",
    english: "Development",
    character: "䷴",
    upperTrigram: 6,
    lowerTrigram: 5,
    judgment: "Gradual progress; maiden's marriage brings fortune. Perseverance furthers. Development proceeds step by step like the wild goose ascending the mountain.",
    image: "Tree on the mountain grows slowly; the sage improves customs and manners through abiding in virtue.",
    lines: [
      { position: 1, isYang: false, text: "Wild goose on the shore; danger for the young son.", meaning: "Early stage vulnerable; inexperience creates risk." },
      { position: 2, isYang: false, text: "Wild goose on the rock; eating and drinking in contentment.", meaning: "Stable position reached; nourishment and security attained." },
      { position: 3, isYang: true, text: "Wild goose on the plateau; husband goes but does not return.", meaning: "Overextension separates; advanced too far from foundation." },
      { position: 4, isYang: false, text: "Wild goose on the tree; finds flat branch.", meaning: "Adapts to unfamiliar territory; makes the best of it." },
      { position: 5, isYang: true, text: "Wild goose on the summit; woman childless for three years.", meaning: "Highest position reached but fulfillment delayed; patience required." },
      { position: 6, isYang: true, text: "Wild goose on the heights; feathers used for sacred rites.", meaning: "Journey complete; life becomes teaching for others." }
    ],
    element: "air",
    changeType: "ripening",
    keywords: ["development", "gradual", "progress", "marriage", "patience"]
  },

  54: {
    number: 54,
    name: "Kuei Mei",
    english: "The Marrying Maiden",
    character: "䷵",
    upperTrigram: 3,
    lowerTrigram: 8,
    judgment: "Marrying maiden; undertakings bring misfortune. Nothing furthers. Thunder over the lake stirs up desire. Union entered without proper foundation brings sorrow.",
    image: "Thunder above lake; the sage understands the transitory in light of eternity.",
    lines: [
      { position: 1, isYang: true, text: "Marrying maiden as a concubine; lame person walks.", meaning: "Secondary position accepted; limited function still useful." },
      { position: 2, isYang: true, text: "One-eyed person can see; perseverance of the solitary brings fortune.", meaning: "Partial capacity sufficient when expectations realistic." },
      { position: 3, isYang: false, text: "Marrying maiden as a slave; returns as a concubine.", meaning: "Status improves from lowest point; relative advancement." },
      { position: 4, isYang: true, text: "Marrying maiden delays the time.", meaning: "Waiting for right circumstances; postponement is wisdom." },
      { position: 5, isYang: false, text: "Sovereign gives his daughter in marriage; her embroidered garments inferior.", meaning: "Inner worth exceeds outer display; substance over appearance." },
      { position: 6, isYang: false, text: "Woman holds basket without fruit; man stabs sheep without blood.", meaning: "Hollow forms without substance; ritual without meaning." }
    ],
    element: "water",
    changeType: "upheaval",
    keywords: ["marriage", "union", "improper", "desire", "secondary"]
  },

  55: {
    number: 55,
    name: "Feng",
    english: "Abundance",
    character: "䷶",
    upperTrigram: 3,
    lowerTrigram: 7,
    judgment: "Abundance brings success. The king attains abundance. Do not worry; be like the sun at midday. Peak fullness naturally begins to wane; enjoy without clinging.",
    image: "Thunder and lightning together; the sage judges lawsuits and executes punishments.",
    lines: [
      { position: 1, isYang: true, text: "Meets the destined ruler; no blame.", meaning: "Union of equals at peak; mutual recognition creates possibility." },
      { position: 2, isYang: false, text: "Abundance so full that the Big Dipper at noon; suspicion meets truth.", meaning: "Overwhelming plenty breeds doubt; sincerity overcomes it." },
      { position: 3, isYang: true, text: "Abundance with darkening; sees small stars at noon.", meaning: "Fullness obscured; abundance hidden by confusion." },
      { position: 4, isYang: true, text: "Abundance with darkening; meets the destined ruler.", meaning: "Even in decline, true connection possible." },
      { position: 5, isYang: false, text: "Brings blessing and fame; fortune.", meaning: "Abundance shared generously multiplies blessings." },
      { position: 6, isYang: false, text: "House abundantly filled; screens off the family.", meaning: "Excess creates isolation; abundance becomes barrier." }
    ],
    element: "fire",
    changeType: "ripening",
    keywords: ["abundance", "fullness", "peak", "prosperity", "zenith"]
  },

  56: {
    number: 56,
    name: "Lu",
    english: "The Wanderer",
    character: "䷷",
    upperTrigram: 7,
    lowerTrigram: 5,
    judgment: "The wanderer finds success through smallness. Perseverance brings fortune to the wanderer. Fire on the mountain quickly passes; do not make yourself at home.",
    image: "Fire on the mountain; the sage applies penalties with clarity but does not prolong litigation.",
    lines: [
      { position: 1, isYang: false, text: "Wanderer in trivial affairs; attracts misfortune.", meaning: "Petty behavior while traveling brings trouble." },
      { position: 2, isYang: false, text: "Wanderer comes to the inn; treasures at their bosom.", meaning: "Finds temporary shelter; preserves what matters most." },
      { position: 3, isYang: true, text: "Wanderer's inn burns; loses the servant.", meaning: "Disaster in transit; support structure collapses." },
      { position: 4, isYang: true, text: "Wanderer finds a place; obtains resources.", meaning: "Temporary stability achieved; practical needs met." },
      { position: 5, isYang: false, text: "Shoots a pheasant; loses arrow but gains praise.", meaning: "Effort incomplete but earns recognition nonetheless." },
      { position: 6, isYang: true, text: "Bird's nest burns; first laughter, then lament.", meaning: "False security destroyed; initial levity turns to grief." }
    ],
    element: "fire",
    changeType: "dissolution",
    keywords: ["travel", "wandering", "stranger", "transience", "passing"]
  },

  57: {
    number: 57,
    name: "Sun",
    english: "The Gentle",
    character: "䷸",
    upperTrigram: 6,
    lowerTrigram: 6,
    judgment: "The gentle brings success through small things. Undertakings further. See the great person. Wind doubled; penetrating influence enters everywhere through gentle persistence.",
    image: "Winds following; the sage spreads commands and accomplishes undertakings.",
    lines: [
      { position: 1, isYang: false, text: "Advancing and retreating; military perseverance furthers.", meaning: "Uncertainty in direction; discipline maintains progress." },
      { position: 2, isYang: true, text: "Penetrating below the bed; confusion of diviners.", meaning: "Influence reaches hidden places; experts cannot explain." },
      { position: 3, isYang: true, text: "Repeated penetrating; humiliation.", meaning: "Excessive probing violates boundaries; invasive persistence shames." },
      { position: 4, isYang: false, text: "Remorse vanishes; three kinds of game in the field.", meaning: "Hesitation dissolved; abundant results from gentle approach." },
      { position: 5, isYang: true, text: "Perseverance brings fortune; remorse vanishes.", meaning: "Steady gentle pressure eventually succeeds; doubts cleared." },
      { position: 6, isYang: true, text: "Penetrating below the bed; loses possessions.", meaning: "Excessive penetration undermines own foundation; loses grip." }
    ],
    element: "air",
    changeType: "ripening",
    keywords: ["gentle", "wind", "penetrating", "gradual", "influence"]
  },

  58: {
    number: 58,
    name: "Tui",
    english: "The Joyous",
    character: "䷹",
    upperTrigram: 8,
    lowerTrigram: 8,
    judgment: "The joyous brings success. Perseverance furthers. Lake doubled; joy shared multiplies. Truth and firmness within, gentleness without creates genuine delight.",
    image: "Lakes resting together; the sage joins with friends for practice and discussion.",
    lines: [
      { position: 1, isYang: true, text: "Harmonious joy; fortune.", meaning: "Joy arising naturally from inner contentment; sustainable pleasure." },
      { position: 2, isYang: true, text: "Sincere joy; fortune and remorse vanishes.", meaning: "Authentic delight rooted in truth; no shadow of regret." },
      { position: 3, isYang: false, text: "Coming joy; misfortune.", meaning: "Seeking pleasure externally; dependency and disappointment." },
      { position: 4, isYang: true, text: "Calculated joy; peace after deliberation.", meaning: "Weighing pleasures; discernment brings right enjoyment." },
      { position: 5, isYang: true, text: "Sincerity with the disintegrating; danger.", meaning: "Trusting what is dissolving; vulnerable to decay." },
      { position: 6, isYang: false, text: "Seductive joy.", meaning: "Pleasure as manipulation; hollow and ultimately unsatisfying." }
    ],
    element: "water",
    changeType: "emergence",
    keywords: ["joy", "pleasure", "lake", "delight", "satisfaction"]
  },

  59: {
    number: 59,
    name: "Huan",
    english: "Dispersion",
    character: "䷺",
    upperTrigram: 6,
    lowerTrigram: 4,
    judgment: "Dispersion brings success. The king approaches the temple. Crossing the great water furthers. Perseverance brings advantage. Hardness dissolves; barriers scatter.",
    image: "Wind over water; ancient kings made offerings and built temples.",
    lines: [
      { position: 1, isYang: false, text: "Rescue with strength of a horse; fortune.", meaning: "Swift intervention prevents further scattering; act quickly." },
      { position: 2, isYang: true, text: "At dispersion, hurries to support; remorse vanishes.", meaning: "Return to center while dissolution accelerates; timely refuge." },
      { position: 3, isYang: false, text: "Dispersion of the self; no remorse.", meaning: "Ego boundaries dissolve; liberation through loss of self-importance." },
      { position: 4, isYang: false, text: "Dispersion of the group; supreme fortune.", meaning: "Collective dissolves for higher purpose; transcendent reorganization." },
      { position: 5, isYang: true, text: "Dispersion with great proclamation; no blame.", meaning: "Clear communication during dissolution prevents chaos." },
      { position: 6, isYang: true, text: "Dispersing blood; going far, departing.", meaning: "Scatter the wound far away; distance yourself from injury." }
    ],
    element: "air",
    changeType: "dissolution",
    keywords: ["dispersion", "dissolution", "scattering", "release", "melting"]
  },

  60: {
    number: 60,
    name: "Chieh",
    english: "Limitation",
    character: "䷻",
    upperTrigram: 4,
    lowerTrigram: 8,
    judgment: "Limitation brings success. Bitter limitation cannot be persevered in. Water over lake defines boundaries; know when limits nourish and when they constrict.",
    image: "Water above lake; the sage creates measure and examines virtue.",
    lines: [
      { position: 1, isYang: true, text: "Not going out of gate and courtyard; no blame.", meaning: "Voluntary restraint at home; wise containment protects." },
      { position: 2, isYang: true, text: "Not going out of gate and courtyard; misfortune.", meaning: "Excessive limitation prevents necessary action; losses mount." },
      { position: 3, isYang: false, text: "Not limiting; lament and blame.", meaning: "Refusing boundaries invites regret; self-discipline lacking." },
      { position: 4, isYang: false, text: "Contented limitation; success.", meaning: "Accepting natural boundaries brings peace; work within constraints." },
      { position: 5, isYang: true, text: "Sweet limitation; fortune in going.", meaning: "Gracefully imposed limits enable flourishing within boundaries." },
      { position: 6, isYang: false, text: "Bitter limitation; perseverance brings misfortune.", meaning: "Harsh restraint maintained too long harms spirit; release needed." }
    ],
    element: "water",
    changeType: "threshold",
    keywords: ["limitation", "restraint", "boundaries", "measure", "discipline"]
  },

  61: {
    number: 61,
    name: "Chung Fu",
    english: "Inner Truth",
    character: "䷼",
    upperTrigram: 6,
    lowerTrigram: 8,
    judgment: "Inner truth influences even pigs and fish. Crossing the great water furthers. Perseverance brings advantage. Wind over lake reaches everywhere; sincerity penetrates all.",
    image: "Wind over lake; the sage deliberates lawsuits and delays executions.",
    lines: [
      { position: 1, isYang: true, text: "Prepared; fortune, with hidden intentions, disquiet.", meaning: "Genuine readiness brings blessing; calculation brings unease." },
      { position: 2, isYang: true, text: "Crane calls in the shade; its young answers.", meaning: "Authentic call receives authentic response; truth finds truth." },
      { position: 3, isYang: false, text: "Finds a companion; now drums, now stops.", meaning: "Relationship lacks steadiness; dependent on other's rhythm." },
      { position: 4, isYang: false, text: "Moon nearing fullness; horse escapes; no blame.", meaning: "Near completion, let go of what strains to leave." },
      { position: 5, isYang: true, text: "Possesses truth that binds; no blame.", meaning: "Inner certainty creates unshakable bonds; authentic connection." },
      { position: 6, isYang: true, text: "Cock crows to heaven; misfortune.", meaning: "Empty proclamation without substance; pretense exposed." }
    ],
    element: "air",
    changeType: "integration",
    keywords: ["truth", "sincerity", "authenticity", "inner", "influence"]
  },

  62: {
    number: 62,
    name: "Hsiao Kuo",
    english: "Small Exceeding",
    character: "䷽",
    upperTrigram: 3,
    lowerTrigram: 5,
    judgment: "Small exceeding brings success. Perseverance furthers. Small things may be done; great things should not. The bird's song descends; ascending brings misfortune.",
    image: "Thunder on the mountain; the sage exceeds in reverence, grief, and frugality.",
    lines: [
      { position: 1, isYang: false, text: "Bird flies upward; misfortune.", meaning: "Small creature overreaching its nature; disaster through ambition." },
      { position: 2, isYang: false, text: "Passing by the ancestor to meet the ancestress.", meaning: "Skip the primary to reach the secondary; unconventional but acceptable." },
      { position: 3, isYang: true, text: "Not passing by but protecting; someone kills them.", meaning: "Inadequate caution in small matters invites catastrophe." },
      { position: 4, isYang: true, text: "No blame; not passing by but meeting.", meaning: "Direct encounter rather than avoidance; honest approach succeeds." },
      { position: 5, isYang: false, text: "Dense clouds but no rain from our western region.", meaning: "Effort accumulates but does not culminate; almost but not quite." },
      { position: 6, isYang: false, text: "Not meeting but passing by; bird flies away.", meaning: "Missed connection through excess; separation inevitable." }
    ],
    element: "earth",
    changeType: "upheaval",
    keywords: ["exceeding", "small", "modesty", "caution", "limitation"]
  },

  63: {
    number: 63,
    name: "Chi Chi",
    english: "After Completion",
    character: "䷾",
    upperTrigram: 4,
    lowerTrigram: 7,
    judgment: "After completion brings success in small matters. Perseverance furthers. Beginning brings fortune, the end brings disorder. What is complete begins to dissolve.",
    image: "Water above fire; the sage ponders misfortune and prepares against it.",
    lines: [
      { position: 1, isYang: true, text: "Brakes the wheels; tail gets wet.", meaning: "Halt at completion; minor consequence of caution better than disaster." },
      { position: 2, isYang: false, text: "Woman loses carriage curtain; do not chase it.", meaning: "Small loss after success; let it go rather than pursue." },
      { position: 3, isYang: true, text: "The ancestor attacks the Devil's Country; three years to conquer.", meaning: "Even after success, some battles take years to consolidate." },
      { position: 4, isYang: false, text: "Fine clothes become rags; be cautious all day.", meaning: "Success deteriorates; constant vigilance required to maintain." },
      { position: 5, isYang: true, text: "Eastern neighbor slaughters ox; western neighbor's simple offering.", meaning: "Modest sincerity surpasses elaborate display in value." },
      { position: 6, isYang: false, text: "Gets head wet; danger.", meaning: "Over-confidence after completion invites reversal; hubris threatens." }
    ],
    element: "water",
    changeType: "ripening",
    keywords: ["completion", "after", "caution", "decline", "vigilance"]
  },

  64: {
    number: 64,
    name: "Wei Chi",
    english: "Before Completion",
    character: "䷿",
    upperTrigram: 7,
    lowerTrigram: 4,
    judgment: "Before completion brings success. The young fox nearly crosses; gets tail wet. Nothing furthers. Fire over water; not yet in their proper places but transition approaching.",
    image: "Fire above water; the sage carefully distinguishes things and keeps them in their places.",
    lines: [
      { position: 1, isYang: false, text: "Gets tail wet; humiliation.", meaning: "Premature action before readiness; embarrassment through haste." },
      { position: 2, isYang: true, text: "Brakes the wheels; perseverance brings fortune.", meaning: "Restraint before completion; patience rewarded." },
      { position: 3, isYang: false, text: "Before completion; attacking brings misfortune.", meaning: "Forcing action before conditions ripen invites disaster." },
      { position: 4, isYang: true, text: "Perseverance brings fortune; remorse vanishes.", meaning: "Steady progress toward completion; doubts dissolve." },
      { position: 5, isYang: false, text: "Perseverance brings fortune, no remorse.", meaning: "Approaching completion with integrity; genuine success imminent." },
      { position: 6, isYang: true, text: "Drinking wine with confidence; no blame.", meaning: "Celebrate the almost-complete; joy without carelessness." }
    ],
    element: "fire",
    changeType: "threshold",
    keywords: ["before completion", "potential", "transition", "preparation", "almost"]
  }
};

/**
 * Lookup table mapping [upper trigram][lower trigram] to hexagram number
 * Trigrams: 1=Ch'ien, 2=K'un, 3=Chen, 4=K'an, 5=Ken, 6=Sun, 7=Li, 8=Tui
 */
export const TRIGRAM_LOOKUP_TABLE: Record<number, Record<number, number>> = {
  1: { 1: 1, 2: 12, 3: 25, 4: 6, 5: 33, 6: 44, 7: 13, 8: 10 },
  2: { 1: 11, 2: 2, 3: 24, 4: 7, 5: 15, 6: 46, 7: 36, 8: 19 },
  3: { 1: 34, 2: 16, 3: 51, 4: 40, 5: 62, 6: 32, 7: 55, 8: 54 },
  4: { 1: 5, 2: 8, 3: 3, 4: 29, 5: 39, 6: 48, 7: 63, 8: 60 },
  5: { 1: 26, 2: 23, 3: 27, 4: 4, 5: 52, 6: 18, 7: 22, 8: 41 },
  6: { 1: 9, 2: 20, 3: 42, 4: 59, 5: 53, 6: 57, 7: 37, 8: 61 },
  7: { 1: 14, 2: 35, 3: 21, 4: 64, 5: 56, 6: 50, 7: 30, 8: 38 },
  8: { 1: 43, 2: 45, 3: 17, 4: 47, 5: 31, 6: 28, 7: 49, 8: 58 }
};
