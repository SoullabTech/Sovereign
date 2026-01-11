/**
 * Major Arcana - The 22 Trump Cards
 * The soul's journey through archetypal experiences
 */

import { TarotCard, Element } from '../core/types';

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'major-0-fool',
    name: 'The Fool',
    arcana: 'major',
    number: 0,
    element: 'air',
    keywords: ['new beginnings', 'innocence', 'spontaneity', 'free spirit', 'adventure'],
    uprightMeaning: 'A new journey begins. Take a leap of faith with trust in the universe. Embrace the unknown with childlike wonder and openness.',
    reversedMeaning: 'Recklessness, risk-taking, or holding back from a necessary leap. Fear of the unknown or naivety causing problems.',
    soulGuidance: 'The Fool reminds you that every great journey begins with a single step into the unknown. Trust your inner wisdom as you embrace new beginnings.',
    symbolism: ['white rose', 'cliff edge', 'small dog', 'bundle on stick', 'mountains'],
    astrological: 'Uranus',
    hebrewLetter: 'Aleph',
    path: 'Kether to Chokmah'
  },
  {
    id: 'major-1-magician',
    name: 'The Magician',
    arcana: 'major',
    number: 1,
    element: 'air',
    keywords: ['manifestation', 'power', 'inspired action', 'resourcefulness', 'skill'],
    uprightMeaning: 'You have all the tools you need to manifest your desires. Channel divine energy into creative action. As above, so below.',
    reversedMeaning: 'Manipulation, poor planning, untapped talents. Disconnection between intention and action.',
    soulGuidance: 'The Magician shows you that you are a channel for divine creative force. Align your will with higher purpose and watch magic unfold.',
    symbolism: ['infinity symbol', 'four elements', 'roses', 'lilies', 'red robe'],
    astrological: 'Mercury',
    hebrewLetter: 'Beth',
    path: 'Kether to Binah'
  },
  {
    id: 'major-2-high-priestess',
    name: 'The High Priestess',
    arcana: 'major',
    number: 2,
    element: 'water',
    keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious', 'mystery'],
    uprightMeaning: 'Trust your intuition. Hidden knowledge is being revealed. Go within to find answers. The veil between worlds is thin.',
    reversedMeaning: 'Secrets, disconnection from intuition, information being withheld. Need to listen to inner voice.',
    soulGuidance: 'The High Priestess guards the threshold between conscious and unconscious. She invites you to trust the wisdom that arises from stillness and receptivity.',
    symbolism: ['moon crown', 'pomegranates', 'scroll (Torah)', 'pillars (B and J)', 'veil'],
    astrological: 'Moon',
    hebrewLetter: 'Gimel',
    path: 'Kether to Tiphareth'
  },
  {
    id: 'major-3-empress',
    name: 'The Empress',
    arcana: 'major',
    number: 3,
    element: 'earth',
    keywords: ['abundance', 'nurturing', 'fertility', 'nature', 'sensuality'],
    uprightMeaning: 'Abundance flows to you. Nurture yourself and others. Creative fertility is high. Connect with nature and the senses.',
    reversedMeaning: 'Creative blocks, dependence on others, smothering. Neglect of self or disconnection from nature.',
    soulGuidance: 'The Empress embodies the nurturing mother energy of the universe. She reminds you to receive abundance and share your gifts generously.',
    symbolism: ['crown of stars', 'wheat field', 'flowing water', 'heart shield', 'cushioned throne'],
    astrological: 'Venus',
    hebrewLetter: 'Daleth',
    path: 'Chokmah to Binah'
  },
  {
    id: 'major-4-emperor',
    name: 'The Emperor',
    arcana: 'major',
    number: 4,
    element: 'fire',
    keywords: ['authority', 'structure', 'control', 'fatherhood', 'leadership'],
    uprightMeaning: 'Take charge with wisdom and authority. Create structure and order. Establish firm foundations. Lead with strength.',
    reversedMeaning: 'Domination, excessive control, inflexibility. Lack of discipline or abuse of power.',
    soulGuidance: 'The Emperor represents the divine masculine principle of structure and protection. He teaches you to build lasting foundations with wisdom.',
    symbolism: ['stone throne', 'ram heads', 'ankh scepter', 'orb', 'armor under robes'],
    astrological: 'Aries',
    hebrewLetter: 'Heh',
    path: 'Chokmah to Tiphareth'
  },
  {
    id: 'major-5-hierophant',
    name: 'The Hierophant',
    arcana: 'major',
    number: 5,
    element: 'earth',
    keywords: ['tradition', 'spiritual wisdom', 'institutions', 'conformity', 'teaching'],
    uprightMeaning: 'Seek guidance from traditional wisdom or spiritual teachers. Honor sacred institutions. Share knowledge.',
    reversedMeaning: 'Challenging tradition, personal beliefs over doctrine, restriction. Need to find your own spiritual path.',
    soulGuidance: 'The Hierophant bridges heaven and earth through sacred tradition. He invites you to both learn from and eventually transcend inherited wisdom.',
    symbolism: ['triple crown', 'keys', 'two acolytes', 'raised hand', 'papal cross'],
    astrological: 'Taurus',
    hebrewLetter: 'Vav',
    path: 'Chokmah to Chesed'
  },
  {
    id: 'major-6-lovers',
    name: 'The Lovers',
    arcana: 'major',
    number: 6,
    element: 'air',
    keywords: ['love', 'harmony', 'relationships', 'choices', 'alignment'],
    uprightMeaning: 'Deep connection and harmony. Important choices about relationships and values. Union of opposites.',
    reversedMeaning: 'Disharmony, imbalance, misalignment of values. Difficult choices or relationship challenges.',
    soulGuidance: 'The Lovers represent the sacred union of opposites within and without. They remind you that true love begins with self-love and conscious choice.',
    symbolism: ['angel', 'tree of knowledge', 'tree of life', 'mountain', 'naked figures'],
    astrological: 'Gemini',
    hebrewLetter: 'Zayin',
    path: 'Binah to Tiphareth'
  },
  {
    id: 'major-7-chariot',
    name: 'The Chariot',
    arcana: 'major',
    number: 7,
    element: 'water',
    keywords: ['willpower', 'determination', 'success', 'control', 'victory'],
    uprightMeaning: 'Victory through willpower and self-discipline. Move forward with determination. Triumph over obstacles.',
    reversedMeaning: 'Lack of control, aggression, directionlessness. Opposition or defeat from lack of focus.',
    soulGuidance: 'The Chariot shows that victory comes through mastering opposing forces within. Align your conscious and unconscious drives toward your goal.',
    symbolism: ['sphinxes', 'starry canopy', 'city walls', 'wand', 'armor'],
    astrological: 'Cancer',
    hebrewLetter: 'Cheth',
    path: 'Binah to Geburah'
  },
  {
    id: 'major-8-strength',
    name: 'Strength',
    arcana: 'major',
    number: 8,
    element: 'fire',
    keywords: ['courage', 'patience', 'compassion', 'inner strength', 'influence'],
    uprightMeaning: 'Gentle strength overcomes brute force. Courage combined with compassion. Taming your inner beasts with love.',
    reversedMeaning: 'Self-doubt, weakness, insecurity. Raw emotion or lack of inner fortitude.',
    soulGuidance: 'Strength teaches that true power comes through gentleness and self-mastery. Your greatest battles are won through love, not force.',
    symbolism: ['infinity symbol', 'lion', 'white robe', 'flowers', 'open or closed hands'],
    astrological: 'Leo',
    hebrewLetter: 'Teth',
    path: 'Chesed to Geburah'
  },
  {
    id: 'major-9-hermit',
    name: 'The Hermit',
    arcana: 'major',
    number: 9,
    element: 'earth',
    keywords: ['soul-searching', 'introspection', 'solitude', 'guidance', 'wisdom'],
    uprightMeaning: 'Seek answers within through solitude and reflection. You are a light for others. Inner guidance is available.',
    reversedMeaning: 'Isolation, loneliness, withdrawal. Lost or refusing to accept guidance.',
    soulGuidance: 'The Hermit carries the lantern of inner wisdom gained through solitary reflection. Go within to find the light that can guide others.',
    symbolism: ['lantern', 'staff', 'mountain peak', 'gray cloak', 'six-pointed star'],
    astrological: 'Virgo',
    hebrewLetter: 'Yod',
    path: 'Chesed to Tiphareth'
  },
  {
    id: 'major-10-wheel-of-fortune',
    name: 'Wheel of Fortune',
    arcana: 'major',
    number: 10,
    element: 'fire',
    keywords: ['destiny', 'cycles', 'turning point', 'luck', 'karma'],
    uprightMeaning: 'The wheel turns - change is coming. Good fortune, destiny unfolding. Karmic cycles completing.',
    reversedMeaning: 'Bad luck, resistance to change, broken cycles. Feeling out of control.',
    soulGuidance: 'The Wheel reminds you that change is the only constant. Stay centered as the wheel turns, knowing that both fortune and misfortune pass.',
    symbolism: ['wheel', 'sphinx', 'serpent', 'Anubis', 'four fixed signs'],
    astrological: 'Jupiter',
    hebrewLetter: 'Kaph',
    path: 'Chesed to Netzach'
  },
  {
    id: 'major-11-justice',
    name: 'Justice',
    arcana: 'major',
    number: 11,
    element: 'air',
    keywords: ['fairness', 'truth', 'law', 'cause and effect', 'clarity'],
    uprightMeaning: 'Truth and fairness prevail. Legal matters resolve justly. Take responsibility for actions. Seek balance.',
    reversedMeaning: 'Unfairness, dishonesty, lack of accountability. Legal complications or injustice.',
    soulGuidance: 'Justice reminds you that every action has consequences. Seek truth, take responsibility, and trust that cosmic balance will be restored.',
    symbolism: ['scales', 'sword', 'crown', 'red robe', 'pillars'],
    astrological: 'Libra',
    hebrewLetter: 'Lamed',
    path: 'Geburah to Tiphareth'
  },
  {
    id: 'major-12-hanged-man',
    name: 'The Hanged Man',
    arcana: 'major',
    number: 12,
    element: 'water',
    keywords: ['surrender', 'new perspective', 'sacrifice', 'letting go', 'pause'],
    uprightMeaning: 'Surrender to gain enlightenment. See things from a new angle. Voluntary sacrifice brings wisdom. Let go of control.',
    reversedMeaning: 'Stalling, resistance, needless sacrifice. Stuck in old patterns.',
    soulGuidance: 'The Hanged Man invites you to release your grip and see with new eyes. What seems like sacrifice is actually the doorway to higher understanding.',
    symbolism: ['inverted figure', 'living tree', 'halo', 'crossed legs', 'calm expression'],
    astrological: 'Neptune',
    hebrewLetter: 'Mem',
    path: 'Geburah to Hod'
  },
  {
    id: 'major-13-death',
    name: 'Death',
    arcana: 'major',
    number: 13,
    element: 'water',
    keywords: ['endings', 'transformation', 'transition', 'release', 'change'],
    uprightMeaning: 'Major transformation and endings leading to new beginnings. Let go of what no longer serves. Profound change.',
    reversedMeaning: 'Resistance to change, stagnation, fear of endings. Delayed transformation.',
    soulGuidance: 'Death is the great transformer. What appears as an ending is actually a doorway. Release the old to make room for rebirth.',
    symbolism: ['skeleton', 'black armor', 'white rose', 'rising sun', 'falling figures'],
    astrological: 'Scorpio',
    hebrewLetter: 'Nun',
    path: 'Tiphareth to Netzach'
  },
  {
    id: 'major-14-temperance',
    name: 'Temperance',
    arcana: 'major',
    number: 14,
    element: 'fire',
    keywords: ['balance', 'moderation', 'patience', 'purpose', 'harmony'],
    uprightMeaning: 'Find balance and moderation. Blend opposing forces harmoniously. Patience brings healing. Walk the middle path.',
    reversedMeaning: 'Imbalance, excess, lack of long-term vision. Discord or impatience.',
    soulGuidance: 'Temperance is the art of sacred alchemy - blending fire and water, matter and spirit. Find your center and let healing flow.',
    symbolism: ['angel', 'two cups', 'one foot in water', 'path to mountains', 'irises'],
    astrological: 'Sagittarius',
    hebrewLetter: 'Samekh',
    path: 'Tiphareth to Yesod'
  },
  {
    id: 'major-15-devil',
    name: 'The Devil',
    arcana: 'major',
    number: 15,
    element: 'earth',
    keywords: ['bondage', 'materialism', 'shadow self', 'attachment', 'addiction'],
    uprightMeaning: 'Examine your attachments and addictions. Shadow work is needed. What binds you is self-created. Face your fears.',
    reversedMeaning: 'Breaking free, releasing limiting beliefs, overcoming addiction. Light entering darkness.',
    soulGuidance: 'The Devil shows the chains we forge ourselves. These bonds are illusions of matter. You have the power to remove them at any time.',
    symbolism: ['Baphomet', 'chained figures', 'inverted pentagram', 'torch', 'black background'],
    astrological: 'Capricorn',
    hebrewLetter: 'Ayin',
    path: 'Tiphareth to Hod'
  },
  {
    id: 'major-16-tower',
    name: 'The Tower',
    arcana: 'major',
    number: 16,
    element: 'fire',
    keywords: ['sudden change', 'upheaval', 'revelation', 'awakening', 'chaos'],
    uprightMeaning: 'Sudden, disruptive change. False structures crumble. Lightning flash of insight. Necessary destruction for renewal.',
    reversedMeaning: 'Avoiding disaster, fear of change, delayed transformation. Resisting necessary upheaval.',
    soulGuidance: 'The Tower demolishes what is built on false foundations. Though shocking, this destruction clears the way for authentic reconstruction.',
    symbolism: ['lightning bolt', 'crown falling', 'figures falling', 'flames', 'rocky cliff'],
    astrological: 'Mars',
    hebrewLetter: 'Peh',
    path: 'Netzach to Hod'
  },
  {
    id: 'major-17-star',
    name: 'The Star',
    arcana: 'major',
    number: 17,
    element: 'air',
    keywords: ['hope', 'inspiration', 'serenity', 'renewal', 'spirituality'],
    uprightMeaning: 'Hope and healing after trials. Spiritual renewal and inspiration. Calm after the storm. Cosmic guidance.',
    reversedMeaning: 'Despair, lack of faith, disconnection from spirit. Feeling uninspired.',
    soulGuidance: 'The Star shines as a beacon of hope after the Tower\'s destruction. You are exactly where you need to be. Trust the cosmic plan.',
    symbolism: ['eight-pointed star', 'smaller stars', 'nude figure', 'two urns', 'pool and land'],
    astrological: 'Aquarius',
    hebrewLetter: 'Tzaddi',
    path: 'Netzach to Yesod'
  },
  {
    id: 'major-18-moon',
    name: 'The Moon',
    arcana: 'major',
    number: 18,
    element: 'water',
    keywords: ['illusion', 'intuition', 'unconscious', 'dreams', 'fear'],
    uprightMeaning: 'Navigate the unconscious realm. Things are not as they seem. Trust intuition through uncertainty. Face hidden fears.',
    reversedMeaning: 'Confusion clearing, repressed emotions surfacing, truth revealed. Overcoming fears.',
    soulGuidance: 'The Moon illuminates the path through the unconscious. What you fear is often illusion. Trust your inner knowing through the darkness.',
    symbolism: ['moon with face', 'two towers', 'dog and wolf', 'crayfish', 'winding path'],
    astrological: 'Pisces',
    hebrewLetter: 'Qoph',
    path: 'Netzach to Malkuth'
  },
  {
    id: 'major-19-sun',
    name: 'The Sun',
    arcana: 'major',
    number: 19,
    element: 'fire',
    keywords: ['joy', 'success', 'vitality', 'truth', 'positivity'],
    uprightMeaning: 'Success, vitality, and joy. Everything is illuminated. Truth shines. Childlike happiness returns.',
    reversedMeaning: 'Temporary setbacks, excessive optimism, clouded joy. Inner child needs attention.',
    soulGuidance: 'The Sun represents the return to wholeness and joy. Let your authentic self shine without hesitation. Celebrate life.',
    symbolism: ['sun with face', 'child on horse', 'sunflowers', 'red banner', 'brick wall'],
    astrological: 'Sun',
    hebrewLetter: 'Resh',
    path: 'Hod to Yesod'
  },
  {
    id: 'major-20-judgement',
    name: 'Judgement',
    arcana: 'major',
    number: 20,
    element: 'fire',
    keywords: ['rebirth', 'reckoning', 'awakening', 'absolution', 'calling'],
    uprightMeaning: 'Spiritual awakening and rebirth. Answer your calling. Self-evaluation leads to transformation. Rise up renewed.',
    reversedMeaning: 'Self-doubt, ignoring the call, fear of judgment. Unable to learn from the past.',
    soulGuidance: 'Judgement calls you to rise from the limitations of the past. Heed the trumpet call of your soul. It is time for resurrection.',
    symbolism: ['angel with trumpet', 'rising figures', 'coffins', 'cross flag', 'mountains'],
    astrological: 'Pluto',
    hebrewLetter: 'Shin',
    path: 'Hod to Malkuth'
  },
  {
    id: 'major-21-world',
    name: 'The World',
    arcana: 'major',
    number: 21,
    element: 'earth',
    keywords: ['completion', 'integration', 'accomplishment', 'travel', 'wholeness'],
    uprightMeaning: 'Completion of a major cycle. Achievement and fulfillment. Integration of all aspects. The world is open to you.',
    reversedMeaning: 'Incompletion, stagnation, lack of closure. Short-cuts or delays in reaching goals.',
    soulGuidance: 'The World marks the end of one cycle and the beginning of another. You have integrated the lessons. Dance in the wholeness you have become.',
    symbolism: ['dancing figure', 'laurel wreath', 'four creatures', 'two wands', 'flowing scarf'],
    astrological: 'Saturn',
    hebrewLetter: 'Tav',
    path: 'Yesod to Malkuth'
  }
];

/**
 * Get Major Arcana card by number (0-21)
 */
export function getMajorArcana(number: number): TarotCard | undefined {
  return MAJOR_ARCANA.find(card => card.number === number);
}

/**
 * Get Major Arcana card by name
 */
export function getMajorArcanaByName(name: string): TarotCard | undefined {
  return MAJOR_ARCANA.find(card =>
    card.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all Major Arcana cards
 */
export function getAllMajorArcana(): TarotCard[] {
  return MAJOR_ARCANA;
}

export default MAJOR_ARCANA;
