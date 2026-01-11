/**
 * Elder Futhark Runes
 * Complete 24 rune system organized by Aett (family of 8)
 */

import { Rune, RuneAett, Element, ElementalSignature } from '../core/types';

/**
 * Freya's Aett - First Eight Runes
 * Themes: Material world, basic forces, primal energies
 */
const FREYJA_AETT: Rune[] = [
  {
    name: 'Fehu',
    letter: 'F',
    symbol: 'ᚠ',
    meaning: 'Cattle, Wealth',
    aett: 'freya',
    position: 1,
    element: 'fire',
    keywords: ['abundance', 'wealth', 'prosperity', 'new beginnings', 'luck'],
    uprightMeaning: 'Material prosperity, wealth earned through effort, new opportunities, abundance flowing into your life. Success in ventures, fulfillment of desires, and the energy to manifest your goals.',
    reversedMeaning: 'Loss of wealth or property, greed, poverty consciousness, failed endeavors. Warning against placing too much value on material possessions or allowing money to control you.',
    soulGuidance: 'True wealth flows from alignment with your soul\'s purpose. Ask not what you can acquire, but what you can create and share. The universe provides abundantly when you trust the flow.',
    magicalUse: 'Drawing prosperity, starting new projects, increasing luck, attracting resources for soul-aligned endeavors.',
    associations: {
      deity: 'Freya, Frey',
      tree: 'Elder',
      herb: 'Nettle',
      color: 'Light Red',
      animal: 'Cat, Falcon'
    },
    elementalResonance: { fire: 0.4, water: 0.1, earth: 0.3, air: 0.1, aether: 0.1 }
  },
  {
    name: 'Uruz',
    letter: 'U',
    symbol: 'ᚢ',
    meaning: 'Aurochs, Primal Strength',
    aett: 'freya',
    position: 2,
    element: 'earth',
    keywords: ['strength', 'vitality', 'health', 'courage', 'raw power'],
    uprightMeaning: 'Physical strength and vital energy, good health, courage to face challenges. Raw, untamed power waiting to be channeled. Recovery from illness, the strength to endure.',
    reversedMeaning: 'Weakness, illness, lack of motivation, misdirected strength. Being overpowered by circumstances or your own unchecked impulses. Time to rest and rebuild.',
    soulGuidance: 'The wild ox within you carries ancient power. Honor your body as the temple of your soul. True strength comes not from domination but from alignment with natural forces.',
    magicalUse: 'Healing, increasing vitality, strengthening the will, grounding wild energies, physical stamina.',
    associations: {
      deity: 'Thor, Earth Mother',
      tree: 'Birch',
      herb: 'Sphagnum Moss',
      color: 'Dark Green',
      animal: 'Aurochs, Bison'
    },
    elementalResonance: { fire: 0.2, water: 0.1, earth: 0.5, air: 0.1, aether: 0.1 }
  },
  {
    name: 'Thurisaz',
    letter: 'TH',
    symbol: 'ᚦ',
    meaning: 'Thorn, Giant',
    aett: 'freya',
    position: 3,
    element: 'fire',
    keywords: ['protection', 'defense', 'conflict', 'catalyst', 'reactive force'],
    uprightMeaning: 'Protection from harm, a powerful defensive force. The thorn that guards the rose. Necessary conflict that leads to growth, breakthrough after struggle, the hammer of Thor.',
    reversedMeaning: 'Danger from external forces, vulnerability, defenselessness. Self-sabotage through aggression, being your own worst enemy. Proceed with extreme caution.',
    soulGuidance: 'Every thorn protects a blossom. The challenges you face are not punishment but protection and initiation. The giant within guards sacred thresholds—approach with respect.',
    magicalUse: 'Protection magic, breaking through obstacles, defensive barriers, confronting shadow aspects.',
    associations: {
      deity: 'Thor, Giants',
      tree: 'Blackthorn',
      herb: 'Houseleek',
      color: 'Bright Red',
      animal: 'Snake, Dragon'
    },
    elementalResonance: { fire: 0.5, water: 0.0, earth: 0.2, air: 0.1, aether: 0.2 }
  },
  {
    name: 'Ansuz',
    letter: 'A',
    symbol: 'ᚨ',
    meaning: 'God, Divine Breath',
    aett: 'freya',
    position: 4,
    element: 'air',
    keywords: ['wisdom', 'communication', 'inspiration', 'divine message', 'poetry'],
    uprightMeaning: 'Divine inspiration, wisdom from higher sources, eloquent communication. Messages from the gods, important advice, the power of words and song. Learning and teaching.',
    reversedMeaning: 'Miscommunication, misunderstanding, manipulation through words. Being deceived or deceiving others, blocked inspiration, ignored wisdom. Listen more carefully.',
    soulGuidance: 'The breath of the divine moves through you. Your words carry power—speak truth, receive truth. Odin hung nine nights for this wisdom; honor the sacrifice of seeking.',
    magicalUse: 'Enhancing communication, receiving divine guidance, poetry and creative inspiration, passing tests and interviews.',
    associations: {
      deity: 'Odin',
      tree: 'Ash',
      herb: 'Fly Agaric',
      color: 'Dark Blue',
      animal: 'Raven, Wolf'
    },
    elementalResonance: { fire: 0.1, water: 0.1, earth: 0.0, air: 0.5, aether: 0.3 }
  },
  {
    name: 'Raidho',
    letter: 'R',
    symbol: 'ᚱ',
    meaning: 'Journey, Ride',
    aett: 'freya',
    position: 5,
    element: 'air',
    keywords: ['journey', 'movement', 'rhythm', 'right action', 'evolution'],
    uprightMeaning: 'A journey or travel, either physical or spiritual. Movement in the right direction, finding your rhythm, righteous action. Life moving forward according to plan.',
    reversedMeaning: 'Disrupted plans, delays in travel, stagnation. Being stuck in a rut, crisis of direction, taking the wrong path. Time to reassess your course.',
    soulGuidance: 'All of life is a journey. Each step, each breath, each heartbeat moves you forward on your path. Trust the road even when you cannot see the destination.',
    magicalUse: 'Safe travel, finding the right path, establishing rhythm and routine, spiritual journeying.',
    associations: {
      deity: 'Ing, Thor',
      tree: 'Oak',
      herb: 'Mugwort',
      color: 'Bright Red',
      animal: 'Horse, Goat'
    },
    elementalResonance: { fire: 0.2, water: 0.1, earth: 0.2, air: 0.4, aether: 0.1 }
  },
  {
    name: 'Kenaz',
    letter: 'K, C',
    symbol: 'ᚲ',
    meaning: 'Torch, Knowledge',
    aett: 'freya',
    position: 6,
    element: 'fire',
    keywords: ['illumination', 'knowledge', 'creativity', 'transformation', 'craft'],
    uprightMeaning: 'Illumination and clarity, the torch that lights the way. Creative fire, technical skill, knowledge gained through experience. Transformation through understanding.',
    reversedMeaning: 'Darkness, confusion, lack of inspiration. Creative blocks, lost knowledge, the light going out. Something hidden that needs to be revealed.',
    soulGuidance: 'You carry an inner torch that no darkness can extinguish. Let your knowing illuminate your path and light the way for others. Craft your life as sacred art.',
    magicalUse: 'Illuminating hidden matters, enhancing creativity, learning new skills, controlled transformation.',
    associations: {
      deity: 'Heimdall, Freya',
      tree: 'Pine',
      herb: 'Cowslip',
      color: 'Light Red',
      animal: 'Cat'
    },
    elementalResonance: { fire: 0.5, water: 0.0, earth: 0.1, air: 0.2, aether: 0.2 }
  },
  {
    name: 'Gebo',
    letter: 'G',
    symbol: 'ᚷ',
    meaning: 'Gift, Exchange',
    aett: 'freya',
    position: 7,
    element: 'air',
    keywords: ['gift', 'exchange', 'balance', 'partnership', 'generosity'],
    uprightMeaning: 'Gifts given and received, balanced exchange, partnerships and contracts. Generosity that creates bonds, the gift that keeps the community together.',
    reversedMeaning: 'Gebo has no reversal in traditional practice, as the X is the same either way. However, consider: gifts with strings attached, imbalanced exchanges, obligations that burden.',
    soulGuidance: 'All gifts create bonds—choose wisely what you give and receive. True generosity flows without expectation. You are both gift and giver in this sacred exchange called life.',
    magicalUse: 'Strengthening relationships, creating partnerships, invoking reciprocity, sacred contracts and vows.',
    associations: {
      deity: 'Odin, All Gods',
      tree: 'Ash, Elm',
      herb: 'Heartsease',
      color: 'Deep Blue',
      animal: 'Bee'
    },
    elementalResonance: { fire: 0.1, water: 0.2, earth: 0.2, air: 0.3, aether: 0.2 }
  },
  {
    name: 'Wunjo',
    letter: 'W, V',
    symbol: 'ᚹ',
    meaning: 'Joy, Bliss',
    aett: 'freya',
    position: 8,
    element: 'water',
    keywords: ['joy', 'harmony', 'fellowship', 'success', 'well-being'],
    uprightMeaning: 'Joy and happiness, harmony within self and community. Success and recognition, wishes fulfilled, fellowship and belonging. The banner of victory.',
    reversedMeaning: 'Sorrow, alienation, discord. Disappointment, wishes unfulfilled, isolation from community. False joy that masks deeper issues.',
    soulGuidance: 'Joy is your birthright, not a reward to be earned. Seek the fellowship of kindred spirits. When you align with your clan of souls, celebration naturally arises.',
    magicalUse: 'Invoking happiness, strengthening bonds, bringing harmony to groups, fulfilling wishes.',
    associations: {
      deity: 'Odin, Frey',
      tree: 'Ash',
      herb: 'Flax',
      color: 'Yellow',
      animal: 'Human community'
    },
    elementalResonance: { fire: 0.2, water: 0.4, earth: 0.1, air: 0.2, aether: 0.1 }
  }
];

/**
 * Heimdall's Aett - Second Eight Runes
 * Themes: Emotional world, forces of nature, transformation
 */
const HEIMDALL_AETT: Rune[] = [
  {
    name: 'Hagalaz',
    letter: 'H',
    symbol: 'ᚺ',
    meaning: 'Hail, Disruption',
    aett: 'heimdall',
    position: 9,
    element: 'water',
    keywords: ['disruption', 'change', 'destruction', 'liberation', 'awakening'],
    uprightMeaning: 'Sudden change, disruption of plans, forces beyond your control. The hailstorm that clears the air. Necessary destruction that makes way for new growth.',
    reversedMeaning: 'Hagalaz traditionally has no reversal. Consider: natural disaster, catastrophic change, being overwhelmed by chaos. Or: breakthrough after crisis.',
    soulGuidance: 'The storm god does not negotiate. Sometimes life must shake us free from comfortable prisons. After the hail melts, the seeds drink deeply. Trust the disruption.',
    magicalUse: 'Breaking negative patterns, banishing, weather magic, initiating necessary change.',
    associations: {
      deity: 'Hel, Urd',
      tree: 'Yew, Ash',
      herb: 'Lily of the Valley',
      color: 'Light Blue',
      animal: 'None (elemental)'
    },
    elementalResonance: { fire: 0.1, water: 0.5, earth: 0.1, air: 0.2, aether: 0.1 }
  },
  {
    name: 'Nauthiz',
    letter: 'N',
    symbol: 'ᚾ',
    meaning: 'Need, Necessity',
    aett: 'heimdall',
    position: 10,
    element: 'fire',
    keywords: ['need', 'constraint', 'necessity', 'resistance', 'survival'],
    uprightMeaning: 'Need and necessity, constraints that teach resilience. The need-fire kindled from friction. Survival through hardship, lessons learned through difficulty.',
    reversedMeaning: 'Extreme deprivation, suffering without purpose, needs unmet. Constraint without growth, poverty of spirit. Time to ask for help.',
    soulGuidance: 'Necessity is the mother of invention and the forge of character. Your needs are not weakness but teachers. The friction that creates fire also illuminates your path.',
    magicalUse: 'Overcoming obstacles, endurance, recognizing needs, constraint as teacher, the need-fire.',
    associations: {
      deity: 'Nornir, Skuld',
      tree: 'Beech',
      herb: 'Bistort',
      color: 'Black',
      animal: 'Dog'
    },
    elementalResonance: { fire: 0.4, water: 0.1, earth: 0.3, air: 0.1, aether: 0.1 }
  },
  {
    name: 'Isa',
    letter: 'I',
    symbol: 'ᛁ',
    meaning: 'Ice, Stillness',
    aett: 'heimdall',
    position: 11,
    element: 'water',
    keywords: ['ice', 'stillness', 'standstill', 'concentration', 'ego'],
    uprightMeaning: 'Standstill, a time to pause and reflect. Ice that preserves and clarifies. Concentration of self, the ego in its purest form. Patience during frozen times.',
    reversedMeaning: 'Isa has no reversal. Consider: cold ego that blocks connection, frozen emotions, paralysis by analysis. Or: necessary cooling off period.',
    soulGuidance: 'Even the deepest waters must sometimes freeze. In stillness, you find what movement blurs. The ice age within you is not death but deep preservation.',
    magicalUse: 'Stopping a situation, cooling emotions, focused meditation, binding, preservation.',
    associations: {
      deity: 'Verdandi, Rinda',
      tree: 'Alder',
      herb: 'Henbane',
      color: 'Black',
      animal: 'Polar animals'
    },
    elementalResonance: { fire: 0.0, water: 0.6, earth: 0.2, air: 0.1, aether: 0.1 }
  },
  {
    name: 'Jera',
    letter: 'J, Y',
    symbol: 'ᛃ',
    meaning: 'Year, Harvest',
    aett: 'heimdall',
    position: 12,
    element: 'earth',
    keywords: ['harvest', 'cycle', 'reward', 'patience', 'natural timing'],
    uprightMeaning: 'Harvest time, reaping what was sown. The cycle of the year turning, natural timing. Patience rewarded, karma in action, peaceful resolution.',
    reversedMeaning: 'Jera has no reversal. Consider: bad harvest due to neglect, working against natural cycles, impatience. Or: longer wait for reward.',
    soulGuidance: 'The wheel of the year turns for all. Trust the seasons of your soul—each has its purpose. What you plant with intention, you will harvest in time.',
    magicalUse: 'Bringing things to fruition, legal matters, cycles and timing, fertility, patience.',
    associations: {
      deity: 'Freyr, Gerda',
      tree: 'Oak',
      herb: 'Rosemary',
      color: 'Light Blue',
      animal: 'Eagle'
    },
    elementalResonance: { fire: 0.1, water: 0.2, earth: 0.5, air: 0.1, aether: 0.1 }
  },
  {
    name: 'Eihwaz',
    letter: 'EI',
    symbol: 'ᛇ',
    meaning: 'Yew, World Tree',
    aett: 'heimdall',
    position: 13,
    element: 'earth',
    keywords: ['endurance', 'transformation', 'death-rebirth', 'mystery', 'protection'],
    uprightMeaning: 'The yew tree of life and death, transformation through endurance. Protection through letting go, the axis of the worlds. Mysteries revealed through patience.',
    reversedMeaning: 'Eihwaz has no reversal. Consider: fear of transformation, clinging to what must die, confusion about purpose. Or: deep initiation in progress.',
    soulGuidance: 'The yew tree drinks from both the wells of the dead and the living. To transform, you must consent to die to who you were. The World Tree holds all—climb it.',
    magicalUse: 'Protection, initiation, contacting the dead, endurance, transformation work.',
    associations: {
      deity: 'Odin, Hel',
      tree: 'Yew',
      herb: 'Mandrake',
      color: 'Dark Blue',
      animal: 'Snake, Eagle'
    },
    elementalResonance: { fire: 0.1, water: 0.2, earth: 0.3, air: 0.1, aether: 0.3 }
  },
  {
    name: 'Perthro',
    letter: 'P',
    symbol: 'ᛈ',
    meaning: 'Lot Cup, Mystery',
    aett: 'heimdall',
    position: 14,
    element: 'water',
    keywords: ['mystery', 'fate', 'divination', 'womb', 'hidden knowledge'],
    uprightMeaning: 'The rune of fate and mystery, the lot cup from which destiny is drawn. Hidden knowledge revealed, secrets uncovered, the womb of possibility. Divination itself.',
    reversedMeaning: 'Secrets that should remain hidden, addiction to mystery, the unknown overwhelming. Fate delayed or denied, blocked divination.',
    soulGuidance: 'You hold the lot cup; the universe casts the bones. Mystery is not a problem to solve but a reality to inhabit. Trust what you cannot see.',
    magicalUse: 'Divination, uncovering secrets, past-life work, finding lost things, feminine mysteries.',
    associations: {
      deity: 'Nornir, Frigg',
      tree: 'Beech',
      herb: 'Aconite',
      color: 'Black',
      animal: 'None (hidden)'
    },
    elementalResonance: { fire: 0.1, water: 0.3, earth: 0.1, air: 0.1, aether: 0.4 }
  },
  {
    name: 'Algiz',
    letter: 'Z',
    symbol: 'ᛉ',
    meaning: 'Elk, Protection',
    aett: 'heimdall',
    position: 15,
    element: 'air',
    keywords: ['protection', 'defense', 'sanctuary', 'connection to divine', 'guardian'],
    uprightMeaning: 'Divine protection, the elk with raised antlers defending its ground. Connection to higher powers, spiritual awakening, guardian spirits present. Safe passage.',
    reversedMeaning: 'Vulnerability, feeling unprotected, spiritual disconnection. Hidden danger approaching, need to strengthen defenses. Someone may be deceiving you.',
    soulGuidance: 'You are never unguarded. The elk-sedge cuts those who grasp it wrongly. Your highest protection is alignment with your truth—no falsehood can stand in its presence.',
    magicalUse: 'Protection, connecting with guardian spirits, shielding, consecrating sacred space.',
    associations: {
      deity: 'Heimdall, Valkyries',
      tree: 'Yew',
      herb: 'Elk-Sedge',
      color: 'Gold',
      animal: 'Elk, Swan'
    },
    elementalResonance: { fire: 0.1, water: 0.1, earth: 0.2, air: 0.3, aether: 0.3 }
  },
  {
    name: 'Sowilo',
    letter: 'S',
    symbol: 'ᛊ',
    meaning: 'Sun, Victory',
    aett: 'heimdall',
    position: 16,
    element: 'fire',
    keywords: ['sun', 'victory', 'success', 'vitality', 'wholeness'],
    uprightMeaning: 'The sun rune, ultimate victory and success. Vitality and good health, enlightenment, the soul\'s light shining forth. Honor and recognition, wholeness achieved.',
    reversedMeaning: 'Sowilo has no reversal. Consider: false victory, ego inflation, burnout from too much intensity. Or: the light temporarily hidden.',
    soulGuidance: 'You carry the sun within you. Your light is not borrowed—it is your nature. Victory comes not from conquering others but from fully becoming yourself.',
    magicalUse: 'Success, vitality, healing, enlightenment, banishing darkness, strengthening the will.',
    associations: {
      deity: 'Sol, Balder',
      tree: 'Juniper',
      herb: 'Mistletoe',
      color: 'White, Gold',
      animal: 'Eagle, Horse'
    },
    elementalResonance: { fire: 0.6, water: 0.0, earth: 0.1, air: 0.1, aether: 0.2 }
  }
];

/**
 * Tyr's Aett - Third Eight Runes
 * Themes: Spiritual world, social forces, higher powers
 */
const TYR_AETT: Rune[] = [
  {
    name: 'Tiwaz',
    letter: 'T',
    symbol: 'ᛏ',
    meaning: 'Tyr, Victory',
    aett: 'tyr',
    position: 17,
    element: 'air',
    keywords: ['justice', 'sacrifice', 'honor', 'victory', 'leadership'],
    uprightMeaning: 'Justice and honor, victory through right action. Self-sacrifice for the greater good, leadership that serves. The warrior\'s honor, legal victory.',
    reversedMeaning: 'Injustice, blocked energy, failure in competition. Sacrifice without purpose, dishonor, losing battles that should be won. Examine your motives.',
    soulGuidance: 'Tyr gave his hand that the wolf might be bound. True victory requires sacrifice. Ask yourself: what would you give your right hand for? That is your truth.',
    magicalUse: 'Legal matters, victory in competition, leadership, honor, binding oaths.',
    associations: {
      deity: 'Tyr',
      tree: 'Oak',
      herb: 'Sage',
      color: 'Bright Red',
      animal: 'Wolf, Dog'
    },
    elementalResonance: { fire: 0.3, water: 0.0, earth: 0.2, air: 0.4, aether: 0.1 }
  },
  {
    name: 'Berkano',
    letter: 'B',
    symbol: 'ᛒ',
    meaning: 'Birch, Birth',
    aett: 'tyr',
    position: 18,
    element: 'earth',
    keywords: ['birth', 'growth', 'fertility', 'nurturing', 'new beginnings'],
    uprightMeaning: 'Birth and new beginnings, fertility and growth. The nurturing mother, domestic peace, children and family. Spring energy, gentle growth.',
    reversedMeaning: 'Family problems, infertility, stagnant growth. Nurturing that smothers, domestic conflict. Something new struggling to be born.',
    soulGuidance: 'The birch is the first tree to return after devastation. Whatever has been destroyed, new life is possible. Nurture the tender shoots of your becoming.',
    magicalUse: 'Fertility, birth, new projects, family blessing, gentle healing, female mysteries.',
    associations: {
      deity: 'Frigg, Berchta',
      tree: 'Birch',
      herb: 'Lady\'s Mantle',
      color: 'Dark Green',
      animal: 'Bear'
    },
    elementalResonance: { fire: 0.1, water: 0.3, earth: 0.4, air: 0.1, aether: 0.1 }
  },
  {
    name: 'Ehwaz',
    letter: 'E',
    symbol: 'ᛖ',
    meaning: 'Horse, Partnership',
    aett: 'tyr',
    position: 19,
    element: 'earth',
    keywords: ['horse', 'partnership', 'trust', 'movement', 'loyalty'],
    uprightMeaning: 'The horse of partnership and trust, movement through cooperation. Loyal friendship, marriage, productive teamwork. Progress through harmony.',
    reversedMeaning: 'Betrayal of trust, broken partnership, restlessness. Disloyalty, relationship friction, stalled progress. Time to address conflicts.',
    soulGuidance: 'Horse and rider move as one, yet each remains whole. Partnership amplifies without diminishing. Find those who ride the same wind.',
    magicalUse: 'Strengthening partnerships, travel, loyalty magic, teamwork, soul-journeying.',
    associations: {
      deity: 'Frey, Freya, Odin',
      tree: 'Oak, Ash',
      herb: 'Ragwort',
      color: 'White',
      animal: 'Horse'
    },
    elementalResonance: { fire: 0.1, water: 0.2, earth: 0.4, air: 0.2, aether: 0.1 }
  },
  {
    name: 'Mannaz',
    letter: 'M',
    symbol: 'ᛗ',
    meaning: 'Human, Self',
    aett: 'tyr',
    position: 20,
    element: 'air',
    keywords: ['humanity', 'self', 'intelligence', 'ancestors', 'social order'],
    uprightMeaning: 'The self in relation to humanity, intelligence and memory. Connection to ancestors, social cooperation, the full human being. Self-knowledge.',
    reversedMeaning: 'Isolation, selfishness, mortality facing you. Feeling cut off from humanity, depression, enemies within. Time for honest self-examination.',
    soulGuidance: 'You are a unique expression of humanity and humanity expressing through you. Your ancestors live in your blood. Know yourself, and you know all.',
    magicalUse: 'Self-knowledge, ancestor work, intelligence boost, understanding human nature.',
    associations: {
      deity: 'Heimdall, Ask & Embla',
      tree: 'Holly',
      herb: 'Madder',
      color: 'Deep Red',
      animal: 'Human'
    },
    elementalResonance: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.3, aether: 0.1 }
  },
  {
    name: 'Laguz',
    letter: 'L',
    symbol: 'ᛚ',
    meaning: 'Lake, Water',
    aett: 'tyr',
    position: 21,
    element: 'water',
    keywords: ['water', 'intuition', 'emotions', 'dreams', 'flow'],
    uprightMeaning: 'Water in all its forms, the power of intuition and dreams. Emotional depth, psychic abilities, the unconscious. Going with the flow, the sea-journey.',
    reversedMeaning: 'Fear of the deep, blocked intuition, emotional overwhelm. Drowning in feelings, psychic confusion, the undertow pulling you down.',
    soulGuidance: 'All waters eventually reach the sea. Your emotions are not obstacles but currents. Learn to swim in your own depths—the treasure is below.',
    magicalUse: 'Intuition, dreams, psychic development, emotional healing, sea magic.',
    associations: {
      deity: 'Njord, Nerthus',
      tree: 'Willow',
      herb: 'Leek',
      color: 'Deep Green',
      animal: 'Seal, Otter'
    },
    elementalResonance: { fire: 0.0, water: 0.6, earth: 0.1, air: 0.1, aether: 0.2 }
  },
  {
    name: 'Ingwaz',
    letter: 'NG',
    symbol: 'ᛝ',
    meaning: 'Ing, Fertility God',
    aett: 'tyr',
    position: 22,
    element: 'earth',
    keywords: ['fertility', 'potential', 'gestation', 'inner growth', 'home'],
    uprightMeaning: 'The seed in the earth, potential about to manifest. Gestation period, inner growth, male fertility. Rest before labor, home and hearth blessed.',
    reversedMeaning: 'Ingwaz has no reversal. Consider: potential unrealized, impotence, restlessness during necessary waiting. Or: the seed needs more time.',
    soulGuidance: 'The seed does not struggle to grow. It simply becomes what it contains. Trust your own gestation. What is forming in you will emerge when ready.',
    magicalUse: 'Fertility, potential, successful completion, male potency, peace in the home.',
    associations: {
      deity: 'Ing/Frey',
      tree: 'Apple',
      herb: 'Self-Heal',
      color: 'Yellow',
      animal: 'Boar'
    },
    elementalResonance: { fire: 0.1, water: 0.2, earth: 0.5, air: 0.1, aether: 0.1 }
  },
  {
    name: 'Dagaz',
    letter: 'D',
    symbol: 'ᛞ',
    meaning: 'Day, Awakening',
    aett: 'tyr',
    position: 23,
    element: 'fire',
    keywords: ['day', 'awakening', 'breakthrough', 'transformation', 'hope'],
    uprightMeaning: 'Daybreak and awakening, the moment between night and day. Breakthrough, transformation complete, clarity after confusion. Hope and new beginnings.',
    reversedMeaning: 'Dagaz has no reversal. Consider: false dawn, hope that fades, awakening not yet ready. Or: the long night before breakthrough.',
    soulGuidance: 'Between night and day is a doorway. You stand at dawn—behind you is all that was, before you is what will be. Step through. The light is with you.',
    magicalUse: 'Breakthrough, awakening, hope, transitions, dawn rituals, major transformation.',
    associations: {
      deity: 'Odin, Heimdall',
      tree: 'Spruce',
      herb: 'Clary',
      color: 'Light Blue',
      animal: 'Rooster'
    },
    elementalResonance: { fire: 0.4, water: 0.0, earth: 0.1, air: 0.2, aether: 0.3 }
  },
  {
    name: 'Othala',
    letter: 'O',
    symbol: 'ᛟ',
    meaning: 'Ancestral Home, Inheritance',
    aett: 'tyr',
    position: 24,
    element: 'earth',
    keywords: ['inheritance', 'ancestry', 'home', 'tradition', 'legacy'],
    uprightMeaning: 'Ancestral heritage and inherited property, the family home. Sacred enclosure, tradition, what is passed down. Group prosperity, belonging.',
    reversedMeaning: 'Loss of home or inheritance, rootlessness. Conflict over property, family estrangement. Breaking with tradition, but is this freedom or loss?',
    soulGuidance: 'You inherit more than property—you carry the dreams and the wounds of all who came before. Honor your lineage while creating your own legacy.',
    magicalUse: 'Home protection, ancestral connection, inheritance matters, establishing sacred space.',
    associations: {
      deity: 'Odin, Ancestors',
      tree: 'Hawthorn',
      herb: 'Clover',
      color: 'Deep Yellow',
      animal: 'All domestic'
    },
    elementalResonance: { fire: 0.1, water: 0.1, earth: 0.5, air: 0.1, aether: 0.2 }
  }
];

/**
 * Complete Elder Futhark (24 runes)
 */
export const ELDER_FUTHARK: Rune[] = [
  ...FREYJA_AETT,
  ...HEIMDALL_AETT,
  ...TYR_AETT
];

/**
 * Get rune by name
 */
export function getRune(name: string): Rune | undefined {
  return ELDER_FUTHARK.find(r => r.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get rune by symbol
 */
export function getRuneBySymbol(symbol: string): Rune | undefined {
  return ELDER_FUTHARK.find(r => r.symbol === symbol);
}

/**
 * Get rune by position (1-24)
 */
export function getRuneByPosition(position: number): Rune | undefined {
  return ELDER_FUTHARK.find(r => r.position === position);
}

/**
 * Get all runes in an aett
 */
export function getAett(aett: RuneAett): Rune[] {
  return ELDER_FUTHARK.filter(r => r.aett === aett);
}

/**
 * Get runes by element
 */
export function getRunesByElement(element: Element): Rune[] {
  return ELDER_FUTHARK.filter(r => r.element === element);
}

/**
 * Search runes by keyword
 */
export function searchRunes(keyword: string): Rune[] {
  const lower = keyword.toLowerCase();
  return ELDER_FUTHARK.filter(r =>
    r.name.toLowerCase().includes(lower) ||
    r.meaning.toLowerCase().includes(lower) ||
    r.keywords.some(k => k.toLowerCase().includes(lower))
  );
}

export default ELDER_FUTHARK;
