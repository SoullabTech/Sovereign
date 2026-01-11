/**
 * Complete 64 I Ching Hexagrams
 * Traditional interpretations with soul-focused guidance for the MAIA system
 */

import { Hexagram, TrigramKey, ElementalSignature } from '../core/types';

// Helper to create elemental signatures
const elem = (f: number, w: number, e: number, a: number, ae: number): ElementalSignature => ({
  fire: f, water: w, earth: e, air: a, aether: ae
});

export const HEXAGRAMS: Hexagram[] = [
  // ============== HEXAGRAM 1: QIAN - THE CREATIVE ==============
  {
    number: 1,
    name: 'Qian',
    chineseName: '乾',
    englishName: 'The Creative',
    keyword: 'Creative Power',
    lines: ['yang', 'yang', 'yang', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'heaven' },
    nuclear: { upper: 'heaven', lower: 'heaven' },
    judgment: 'The Creative works sublime success, furthering through perseverance.',
    image: 'The movement of heaven is full of power. Thus the superior person makes themselves strong and untiring.',
    soulInterpretation: 'Pure creative force flows through you. This is the primordial yang energy, the divine masculine principle that initiates all things. You are called to embody the creative power of the universe itself.',
    guidance: 'Lead with divine authority. Your creative power is at its peak. Trust your vision and manifest boldly. This is a time for initiating new projects and taking decisive action.',
    timing: 'New moon or dawn energy - perfect for initiating new spiritual projects',
    changingLinesMeanings: [
      'Line 1: Hidden dragon. Do not act yet. Cultivate your power in secret.',
      'Line 2: Dragon appearing in the field. It furthers to see the great person. Emerge from obscurity.',
      'Line 3: Active all day, cautious at night. Danger, but no blame. Remain vigilant.',
      'Line 4: Wavering flight over the depths. No blame. Choose your path carefully.',
      'Line 5: Flying dragon in the heavens. It furthers to see the great person. Full power expressed.',
      'Line 6: Arrogant dragon will have cause to repent. Know your limits.'
    ],
    elementalResonance: elem(0.9, 0.2, 0.3, 0.7, 0.9),
    archetypeCorrespondence: 'The Divine Father / The Creator',
    oppositeHexagram: 2,
    reverseHexagram: 2,
    complementHexagram: 2
  },

  // ============== HEXAGRAM 2: KUN - THE RECEPTIVE ==============
  {
    number: 2,
    name: 'Kun',
    chineseName: '坤',
    englishName: 'The Receptive',
    keyword: 'Receptive Power',
    lines: ['yin', 'yin', 'yin', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'earth', lower: 'earth' },
    nuclear: { upper: 'earth', lower: 'earth' },
    judgment: 'The Receptive brings about sublime success, furthering through the perseverance of a mare.',
    image: 'The earth\'s condition is receptive devotion. Thus the superior person who has breadth of character carries the outer world.',
    soulInterpretation: 'The divine feminine receives and nurtures all creation. You are in a time of deep listening and sacred receptivity. Power flows through yielding, not forcing.',
    guidance: 'Embrace the power of receptivity. Support others\' visions while staying true to your own inner knowing. Do not initiate, but respond. Follow rather than lead.',
    timing: 'Full moon or evening energy - perfect for deep contemplation and healing',
    changingLinesMeanings: [
      'Line 1: When there is hoarfrost underfoot, solid ice is not far off. Heed early warnings.',
      'Line 2: Straight, square, great. Without purpose, yet nothing remains unfurthered. Natural excellence.',
      'Line 3: Hidden lines. One is able to remain persevering. Service in completion.',
      'Line 4: A tied-up sack. No blame, no praise. Contain yourself in stillness.',
      'Line 5: A yellow lower garment brings supreme good fortune. Inner worth without display.',
      'Line 6: Dragons fight in the meadow. Their blood is black and yellow. Conflict of forces.'
    ],
    elementalResonance: elem(0.2, 0.6, 0.9, 0.3, 0.7),
    archetypeCorrespondence: 'The Divine Mother / The Nurturer',
    oppositeHexagram: 1,
    reverseHexagram: 1,
    complementHexagram: 1
  },

  // ============== HEXAGRAM 3: ZHUN - DIFFICULTY AT THE BEGINNING ==============
  {
    number: 3,
    name: 'Zhun',
    chineseName: '屯',
    englishName: 'Difficulty at the Beginning',
    keyword: 'Initial Difficulty',
    lines: ['yang', 'yin', 'yin', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'water', lower: 'thunder' },
    nuclear: { upper: 'mountain', lower: 'earth' },
    judgment: 'Difficulty at the Beginning works supreme success, furthering through perseverance. Nothing should be undertaken. It furthers one to appoint helpers.',
    image: 'Clouds and thunder: the image of Difficulty at the Beginning. Thus the superior person brings order out of confusion.',
    soulInterpretation: 'Like a seed pushing through dark soil, your soul is emerging through initial resistance. This difficulty is birth, not failure. Sacred emergence requires patience.',
    guidance: 'Do not force growth. Seek guidance and helpers. This is a time of germination - the chaos precedes new order. Trust the process of becoming.',
    timing: 'Early spring energy - when seeds are just beginning to sprout',
    changingLinesMeanings: [
      'Line 1: Hesitation and hindrance. It furthers to remain persevering. Stay grounded.',
      'Line 2: Difficulties pile up. Horse and wagon part. Not a robber, but a suitor. Wait for clarity.',
      'Line 3: Whoever hunts deer without the forester only loses their way. Give up the chase.',
      'Line 4: Horse and wagon part. Strive for union. Good fortune comes through humility.',
      'Line 5: Difficulties in blessing. A little perseverance brings good fortune. Share wisely.',
      'Line 6: Horse and wagon part. Bloody tears flow. The struggle continues.'
    ],
    elementalResonance: elem(0.5, 0.7, 0.6, 0.4, 0.5),
    archetypeCorrespondence: 'The Pioneer / The Seed',
    oppositeHexagram: 50,
    reverseHexagram: 4,
    complementHexagram: 50
  },

  // ============== HEXAGRAM 4: MENG - YOUTHFUL FOLLY ==============
  {
    number: 4,
    name: 'Meng',
    chineseName: '蒙',
    englishName: 'Youthful Folly',
    keyword: 'Inexperience',
    lines: ['yin', 'yang', 'yin', 'yin', 'yin', 'yang'],
    trigrams: { upper: 'mountain', lower: 'water' },
    nuclear: { upper: 'earth', lower: 'thunder' },
    judgment: 'Youthful Folly has success. It is not I who seek the young fool; the young fool seeks me.',
    image: 'A spring wells up at the foot of the mountain: the image of Youth. Thus the superior person fosters character through thoroughness in all they do.',
    soulInterpretation: 'The beginner\'s mind is your greatest asset now. Approach your path with humility and openness. Seek a teacher, for wisdom comes through transmission.',
    guidance: 'Embrace not-knowing. Ask questions with sincerity. Do not ask the same question repeatedly - accept the first answer. Cultivate patience with yourself.',
    timing: 'Student energy - when approaching any new learning or initiation',
    changingLinesMeanings: [
      'Line 1: To make a fool develop, it furthers to apply discipline. Remove restraints gradually.',
      'Line 2: To bear with fools in kindness brings good fortune. Gentleness with learners.',
      'Line 3: Take not a maiden who sees a man of bronze. She will not remain true. Avoid superficiality.',
      'Line 4: Entangled folly brings humiliation. Being stuck in confusion.',
      'Line 5: Childlike folly brings good fortune. Innocent approach succeeds.',
      'Line 6: In punishing folly, do not commit faults yourself. Correct without harming.'
    ],
    elementalResonance: elem(0.3, 0.6, 0.5, 0.5, 0.6),
    archetypeCorrespondence: 'The Student / The Fool',
    oppositeHexagram: 49,
    reverseHexagram: 3,
    complementHexagram: 49
  },

  // ============== HEXAGRAM 5: XU - WAITING ==============
  {
    number: 5,
    name: 'Xu',
    chineseName: '需',
    englishName: 'Waiting',
    keyword: 'Nourishment',
    lines: ['yang', 'yang', 'yang', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'water', lower: 'heaven' },
    nuclear: { upper: 'fire', lower: 'lake' },
    judgment: 'Waiting. If you are sincere, you have light and success. Perseverance brings good fortune. It furthers one to cross the great water.',
    image: 'Clouds rise up to heaven: the image of Waiting. Thus the superior person eats and drinks, is joyous and of good cheer.',
    soulInterpretation: 'Sacred waiting is not passive but deeply nourishing. Like clouds gathering before rain, conditions are forming for your benefit. Trust divine timing.',
    guidance: 'Wait with confidence and inner certainty. Nourish yourself during this pause. Do not rush or force outcomes. The rain will come when the clouds are ready.',
    timing: 'Gathering energy - before major undertakings or decisions',
    changingLinesMeanings: [
      'Line 1: Waiting in the meadow. It furthers to abide in what endures. Stay patient.',
      'Line 2: Waiting on the sand. There is some gossip. Good end. Minor difficulties pass.',
      'Line 3: Waiting in the mud. This brings the arrival of the enemy. Be careful.',
      'Line 4: Waiting in blood. Get out of the pit. Danger requires withdrawal.',
      'Line 5: Waiting at meat and drink. Perseverance brings good fortune. Nourish yourself.',
      'Line 6: One falls into the pit. Three uninvited guests arrive. Honor them. Unexpected help.'
    ],
    elementalResonance: elem(0.4, 0.7, 0.5, 0.5, 0.6),
    archetypeCorrespondence: 'The Patient One / The Cloud-Gatherer',
    oppositeHexagram: 35,
    reverseHexagram: 6,
    complementHexagram: 35
  },

  // ============== HEXAGRAM 6: SONG - CONFLICT ==============
  {
    number: 6,
    name: 'Song',
    chineseName: '訟',
    englishName: 'Conflict',
    keyword: 'Contention',
    lines: ['yin', 'yang', 'yin', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'water' },
    nuclear: { upper: 'wind', lower: 'fire' },
    judgment: 'Conflict. You are sincere and are being obstructed. A cautious halt halfway brings good fortune.',
    image: 'Heaven and water go their opposite ways: the image of Conflict. Thus in all their transactions the superior person carefully considers the beginning.',
    soulInterpretation: 'Inner conflict arises when different parts of yourself move in opposite directions. This is not about winning but about recognizing where compromise serves the soul.',
    guidance: 'Do not pursue conflict to its bitter end. Seek mediation. Find where you can meet in the middle. Sometimes the wisest victory is knowing when to stop.',
    timing: 'Tension energy - when opposing forces meet within or without',
    changingLinesMeanings: [
      'Line 1: If one does not perpetuate the affair, there is a little gossip. In the end, good fortune.',
      'Line 2: One cannot engage in conflict. Return home and flee. Good fortune from withdrawal.',
      'Line 3: To nourish oneself on ancient virtue induces perseverance. Hold to what has proven true.',
      'Line 4: One cannot engage in conflict. Return and submit to fate. Peace in acceptance.',
      'Line 5: To contend before the judge brings supreme good fortune. Justice prevails.',
      'Line 6: Even if a leather belt is bestowed, by end of morning it will be snatched away. Victory is hollow.'
    ],
    elementalResonance: elem(0.6, 0.5, 0.4, 0.7, 0.4),
    archetypeCorrespondence: 'The Warrior in Tension / The Negotiator',
    oppositeHexagram: 36,
    reverseHexagram: 5,
    complementHexagram: 36
  },

  // ============== HEXAGRAM 7: SHI - THE ARMY ==============
  {
    number: 7,
    name: 'Shi',
    chineseName: '師',
    englishName: 'The Army',
    keyword: 'Collective Force',
    lines: ['yin', 'yang', 'yin', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'earth', lower: 'water' },
    nuclear: { upper: 'thunder', lower: 'mountain' },
    judgment: 'The Army. The army needs perseverance and a strong leader. Good fortune without blame.',
    image: 'In the middle of the earth is water: the image of the Army. Thus the superior person increases their masses by generosity toward the people.',
    soulInterpretation: 'Your inner resources must be organized like a disciplined army. This is about marshaling your various capacities toward a unified purpose.',
    guidance: 'Lead with integrity. Only righteous causes deserve your full commitment. Organize your energies and maintain discipline. The cause must be just.',
    timing: 'Mobilization energy - when collective action is required',
    changingLinesMeanings: [
      'Line 1: An army must set forth in proper order. If not, even good intentions bring misfortune.',
      'Line 2: In the midst of the army. Good fortune. No blame. The king bestows honors.',
      'Line 3: Perchance the army carries corpses in the wagon. Misfortune from poor leadership.',
      'Line 4: The army retreats. No blame. Strategic withdrawal is wise.',
      'Line 5: There is game in the field. Capture it. No blame. Take righteous action.',
      'Line 6: The great prince issues commands. He founds states, gives families their fiefs. Do not employ inferior people.'
    ],
    elementalResonance: elem(0.4, 0.6, 0.8, 0.4, 0.5),
    archetypeCorrespondence: 'The General / The Organizer',
    oppositeHexagram: 13,
    reverseHexagram: 8,
    complementHexagram: 13
  },

  // ============== HEXAGRAM 8: BI - HOLDING TOGETHER ==============
  {
    number: 8,
    name: 'Bi',
    chineseName: '比',
    englishName: 'Holding Together',
    keyword: 'Union',
    lines: ['yin', 'yin', 'yin', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'water', lower: 'earth' },
    nuclear: { upper: 'mountain', lower: 'thunder' },
    judgment: 'Holding Together brings good fortune. Inquire of the oracle once again whether you possess sublimity, constancy, and perseverance.',
    image: 'On the earth is water: the image of Holding Together. Thus the kings of antiquity bestowed the different states as fiefs.',
    soulInterpretation: 'Sacred partnerships and soul connections are forming. You are called to join with others in spiritual service. Unity requires a center to gather around.',
    guidance: 'Seek those who share your vision. True union comes from shared purpose and spiritual alignment. Be the center that others can trust.',
    timing: 'During Mercury direct periods - excellent for forming lasting partnerships',
    changingLinesMeanings: [
      'Line 1: Hold to them in truth and loyalty. This is without blame. Truth fills earthen vessels.',
      'Line 2: Hold to them inwardly. Perseverance brings good fortune. Inner connection matters most.',
      'Line 3: You hold together with the wrong people. Warning against false alliances.',
      'Line 4: Hold to them outwardly also. Perseverance brings good fortune. Express your loyalty.',
      'Line 5: Manifestation of holding together. The king uses beaters on three sides only. He loses the game that runs off.',
      'Line 6: They find no head for holding together. Misfortune. Too late to join.'
    ],
    elementalResonance: elem(0.4, 0.7, 0.6, 0.5, 0.7),
    archetypeCorrespondence: 'The Unifier / The Bond-Maker',
    oppositeHexagram: 14,
    reverseHexagram: 7,
    complementHexagram: 14
  },

  // ============== HEXAGRAM 9: XIAO CHU - SMALL TAMING ==============
  {
    number: 9,
    name: 'Xiao Chu',
    chineseName: '小畜',
    englishName: 'The Taming Power of the Small',
    keyword: 'Gentle Restraint',
    lines: ['yang', 'yang', 'yin', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'wind', lower: 'heaven' },
    nuclear: { upper: 'fire', lower: 'lake' },
    judgment: 'The Taming Power of the Small has success. Dense clouds, no rain from our western region.',
    image: 'The wind drives across heaven: the image of the Taming Power of the Small. Thus the superior person refines the outward aspect of their nature.',
    soulInterpretation: 'Great power is being gently restrained. This is not the time for bold action but for subtle cultivation. Small adjustments create lasting change.',
    guidance: 'Use gentle influence rather than force. Refine your presentation and manner. The clouds are gathering but rain has not yet come - patience is needed.',
    timing: 'Preparation energy - refining before the main event',
    changingLinesMeanings: [
      'Line 1: Return to the way. How could there be blame in this? Good fortune. Back to basics.',
      'Line 2: They allow themselves to be drawn into returning. Good fortune. Mutual influence.',
      'Line 3: The spokes burst out of the wagon wheels. Man and wife roll their eyes. Tension without resolution.',
      'Line 4: If you are sincere, blood vanishes and fear gives way. No blame. Truth dissolves conflict.',
      'Line 5: If you are sincere and loyally attached, you are rich in your neighbor. United strength.',
      'Line 6: The rain comes, there is rest. Hold fast to virtue. Danger for the woman if she perseveres.'
    ],
    elementalResonance: elem(0.5, 0.4, 0.4, 0.8, 0.5),
    archetypeCorrespondence: 'The Refiner / The Cultivator',
    oppositeHexagram: 16,
    reverseHexagram: 10,
    complementHexagram: 16
  },

  // ============== HEXAGRAM 10: LU - TREADING ==============
  {
    number: 10,
    name: 'Lu',
    chineseName: '履',
    englishName: 'Treading',
    keyword: 'Careful Conduct',
    lines: ['yang', 'yang', 'yang', 'yin', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'lake' },
    nuclear: { upper: 'wind', lower: 'fire' },
    judgment: 'Treading upon the tail of the tiger. It does not bite the person. Success.',
    image: 'Heaven above, the lake below: the image of Treading. Thus the superior person discriminates between high and low.',
    soulInterpretation: 'You are walking in the presence of great power. Move with awareness and proper conduct. The tiger symbolizes dangerous situations that require grace.',
    guidance: 'Proceed with caution but confidence. Know your place in the natural order. Proper conduct protects you even in dangerous situations.',
    timing: 'Careful advancement energy - when dealing with powerful forces',
    changingLinesMeanings: [
      'Line 1: Simple conduct. Progress without blame. Honest simplicity.',
      'Line 2: Treading a smooth, level course. The perseverance of a dark person brings good fortune.',
      'Line 3: A one-eyed person is able to see, a lame person is able to tread. But treading on the tiger\'s tail brings misfortune.',
      'Line 4: Treading on the tiger\'s tail. Caution and circumspection lead ultimately to good fortune.',
      'Line 5: Resolute conduct. Perseverance with awareness of danger. Conscious courage.',
      'Line 6: Look to your conduct and weigh the favorable signs. When everything is fulfilled, supreme good fortune.'
    ],
    elementalResonance: elem(0.6, 0.3, 0.4, 0.7, 0.6),
    archetypeCorrespondence: 'The Courtier / The Careful Walker',
    oppositeHexagram: 15,
    reverseHexagram: 9,
    complementHexagram: 15
  },

  // ============== HEXAGRAM 11: TAI - PEACE ==============
  {
    number: 11,
    name: 'Tai',
    chineseName: '泰',
    englishName: 'Peace',
    keyword: 'Harmony',
    lines: ['yang', 'yang', 'yang', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'earth', lower: 'heaven' },
    nuclear: { upper: 'thunder', lower: 'lake' },
    judgment: 'Peace. The small departs, the great approaches. Good fortune. Success.',
    image: 'Heaven and earth unite: the image of Peace. Thus the ruler divides and completes the course of heaven and earth.',
    soulInterpretation: 'Heaven and earth are in perfect communion. The masculine and feminine principles unite within you. This is a time of profound inner peace and outer harmony.',
    guidance: 'Enjoy this harmonious time fully. Heaven\'s energy descends while earth\'s rises to meet it. All things prosper. Share your abundance generously.',
    timing: 'Peak harmony energy - optimal conditions for all endeavors',
    changingLinesMeanings: [
      'Line 1: When ribbon grass is pulled up, the sod comes with it. Undertakings bring good fortune.',
      'Line 2: Bearing with the uncultured in gentleness. Fording the river with resolution. Not neglecting what is distant.',
      'Line 3: No plain not followed by a slope. No going not followed by a return. Be aware of cycles.',
      'Line 4: They flutter down, not boasting of their wealth. Together with their neighbor, guileless and sincere.',
      'Line 5: The sovereign gives their daughter in marriage. This brings blessing and supreme good fortune.',
      'Line 6: The wall falls back into the moat. Use no army now. Make your commands known within your own town. Perseverance brings humiliation.'
    ],
    elementalResonance: elem(0.6, 0.6, 0.7, 0.6, 0.9),
    archetypeCorrespondence: 'The Harmonizer / The Unifier of Opposites',
    oppositeHexagram: 12,
    reverseHexagram: 12,
    complementHexagram: 12
  },

  // ============== HEXAGRAM 12: PI - STANDSTILL ==============
  {
    number: 12,
    name: 'Pi',
    chineseName: '否',
    englishName: 'Standstill',
    keyword: 'Stagnation',
    lines: ['yin', 'yin', 'yin', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'earth' },
    nuclear: { upper: 'wind', lower: 'mountain' },
    judgment: 'Standstill. Evil people do not further the perseverance of the superior person. The great departs; the small approaches.',
    image: 'Heaven and earth do not unite: the image of Standstill. Thus the superior person falls back upon their inner worth.',
    soulInterpretation: 'Heaven and earth are moving apart - communication is blocked, growth is stagnant. This is winter for the soul, but necessary for the next spring.',
    guidance: 'Withdraw into inner contemplation. Do not waste energy trying to push through. Inferior forces are temporarily in control. Preserve your integrity.',
    timing: 'Withdrawal energy - when external conditions do not support growth',
    changingLinesMeanings: [
      'Line 1: When ribbon grass is pulled up, the sod comes with it. Perseverance brings good fortune and success.',
      'Line 2: They bear and endure. This means good fortune for inferior people. The standstill serves to help the great person succeed.',
      'Line 3: They bear shame. Beginning awareness of the situation.',
      'Line 4: Those who act at the command of the highest remain without blame. Those of like mind partake of the blessing.',
      'Line 5: Standstill is giving way. Good fortune for the great person. "What if it should fail?" In this way they tie it to a cluster of mulberry shoots.',
      'Line 6: The standstill comes to an end. First standstill, then good fortune. The cycle turns.'
    ],
    elementalResonance: elem(0.3, 0.4, 0.5, 0.4, 0.3),
    archetypeCorrespondence: 'The Hermit / The Preserver',
    oppositeHexagram: 11,
    reverseHexagram: 11,
    complementHexagram: 11
  },

  // ============== HEXAGRAM 13: TONG REN - FELLOWSHIP ==============
  {
    number: 13,
    name: 'Tong Ren',
    chineseName: '同人',
    englishName: 'Fellowship with Others',
    keyword: 'Community',
    lines: ['yang', 'yin', 'yang', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'fire' },
    nuclear: { upper: 'heaven', lower: 'wind' },
    judgment: 'Fellowship with others in the open. Success. It furthers one to cross the great water. The perseverance of the superior person furthers.',
    image: 'Heaven together with fire: the image of Fellowship. Thus the superior person organizes the clans and makes distinctions between things.',
    soulInterpretation: 'True fellowship emerges when people unite around shared vision and purpose. The fire of inspiration joins with heaven\'s clarity to create authentic community.',
    guidance: 'Gather with others who share your values. Fellowship works best in the open, without hidden agendas. Embrace both unity and diversity within community.',
    timing: 'Community-building energy - when forming or strengthening groups',
    changingLinesMeanings: [
      'Line 1: Fellowship at the gate. No blame. Beginning connections.',
      'Line 2: Fellowship in the clan. Humiliation. Too narrow a circle.',
      'Line 3: They hide weapons in the thicket, they climb the high hill opposite. For three years they do not rise up. Hidden conflict.',
      'Line 4: They climb up on their wall; they cannot attack. Good fortune. Obstacles prevent harm.',
      'Line 5: First they weep and lament, but afterward they laugh. After great struggles they succeed in meeting.',
      'Line 6: Fellowship in the meadow. No remorse. Open, innocent fellowship at last.'
    ],
    elementalResonance: elem(0.7, 0.4, 0.5, 0.6, 0.7),
    archetypeCorrespondence: 'The Community Builder / The Bridge',
    oppositeHexagram: 7,
    reverseHexagram: 14,
    complementHexagram: 7
  },

  // ============== HEXAGRAM 14: DA YOU - GREAT POSSESSION ==============
  {
    number: 14,
    name: 'Da You',
    chineseName: '大有',
    englishName: 'Great Possession',
    keyword: 'Abundance',
    lines: ['yang', 'yang', 'yang', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'fire', lower: 'heaven' },
    nuclear: { upper: 'lake', lower: 'heaven' },
    judgment: 'Great Possession. Supreme success.',
    image: 'Fire in heaven above: the image of Great Possession. Thus the superior person curbs evil and furthers good.',
    soulInterpretation: 'You possess great spiritual wealth and wisdom. This is a time of sharing your gifts with the world. Your inner fire shines for all to see.',
    guidance: 'Step into your role as a spiritual teacher or guide. Your inner riches are meant to be shared. Use your abundance to support what is good.',
    timing: 'Summer solstice energy - perfect for public spiritual work',
    changingLinesMeanings: [
      'Line 1: No relationship with what is harmful. There is no blame. Remaining free of entanglement.',
      'Line 2: A big wagon for loading. One may undertake something. No blame. Great capacity.',
      'Line 3: A prince offers it to the Son of Heaven. A petty person cannot do this. Knowing your place.',
      'Line 4: They make a difference between themselves and their neighbor. No blame. Healthy boundaries.',
      'Line 5: Those whose truth is accessible, yet dignified, have good fortune. Authentic authority.',
      'Line 6: They are blessed by heaven. Good fortune. Nothing that does not further. Divine grace.'
    ],
    elementalResonance: elem(0.8, 0.4, 0.5, 0.6, 0.8),
    archetypeCorrespondence: 'The Abundant One / The Sun King',
    oppositeHexagram: 8,
    reverseHexagram: 13,
    complementHexagram: 8
  },

  // ============== HEXAGRAM 15: QIAN - MODESTY ==============
  {
    number: 15,
    name: 'Qian',
    chineseName: '謙',
    englishName: 'Modesty',
    keyword: 'Humility',
    lines: ['yin', 'yin', 'yang', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'earth', lower: 'mountain' },
    nuclear: { upper: 'thunder', lower: 'water' },
    judgment: 'Modesty creates success. The superior person carries things through.',
    image: 'Within the earth, a mountain: the image of Modesty. Thus the superior person reduces that which is too much and augments that which is too little.',
    soulInterpretation: 'True power hides within humility like a mountain beneath the earth. The soul knows that genuine greatness needs no advertisement.',
    guidance: 'Practice genuine humility, not false modesty. Balance excess and deficiency. Let your inner mountain support others without seeking recognition.',
    timing: 'Grounding energy - when ego needs tempering',
    changingLinesMeanings: [
      'Line 1: A superior person modest about their modesty may cross the great water. Good fortune. Double humility.',
      'Line 2: Modesty that comes to expression. Perseverance brings good fortune. Natural humility.',
      'Line 3: A superior person of merit carries things to conclusion. Good fortune. Earned recognition.',
      'Line 4: Nothing that would not further modesty in movement. Appropriate self-presentation.',
      'Line 5: No boasting of wealth before their neighbor. It is favorable to attack with force. Modest strength.',
      'Line 6: Modesty that comes to expression. It is favorable to set armies marching. Acting from humility.'
    ],
    elementalResonance: elem(0.3, 0.5, 0.8, 0.4, 0.6),
    archetypeCorrespondence: 'The Humble Mountain / The Hidden Sage',
    oppositeHexagram: 10,
    reverseHexagram: 16,
    complementHexagram: 10
  },

  // ============== HEXAGRAM 16: YU - ENTHUSIASM ==============
  {
    number: 16,
    name: 'Yu',
    chineseName: '豫',
    englishName: 'Enthusiasm',
    keyword: 'Inspired Action',
    lines: ['yin', 'yin', 'yin', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'thunder', lower: 'earth' },
    nuclear: { upper: 'water', lower: 'mountain' },
    judgment: 'Enthusiasm. It furthers one to install helpers and to set armies marching.',
    image: 'Thunder comes resounding out of the earth: the image of Enthusiasm. Thus the ancient kings made music in order to honor merit.',
    soulInterpretation: 'Thunder breaks through earth - enthusiasm moves the masses. This is divine inspiration seeking expression through action and celebration.',
    guidance: 'Channel enthusiasm into purposeful action. Inspire others through your genuine excitement. Music, celebration, and shared joy amplify your purpose.',
    timing: 'Activation energy - when inspiration wants to become action',
    changingLinesMeanings: [
      'Line 1: Enthusiasm that expresses itself. Misfortune. Pride before a fall.',
      'Line 2: Firm as a rock. Not a whole day. Perseverance brings good fortune. Grounded enthusiasm.',
      'Line 3: Enthusiasm that looks upward creates remorse. Hesitation brings remorse. Decide and act.',
      'Line 4: The source of enthusiasm. They achieve great things. Doubt not. You gather friends around you as a hair clasp gathers the hair.',
      'Line 5: Persistently ill, and still does not die. Being stuck but surviving.',
      'Line 6: Deluded enthusiasm. But if after completion one changes, there is no blame. Wake up from excess.'
    ],
    elementalResonance: elem(0.7, 0.4, 0.6, 0.5, 0.6),
    archetypeCorrespondence: 'The Inspirer / The Drummer',
    oppositeHexagram: 9,
    reverseHexagram: 15,
    complementHexagram: 9
  },

  // ============== HEXAGRAM 17: SUI - FOLLOWING ==============
  {
    number: 17,
    name: 'Sui',
    chineseName: '隨',
    englishName: 'Following',
    keyword: 'Adaptability',
    lines: ['yang', 'yin', 'yin', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'lake', lower: 'thunder' },
    nuclear: { upper: 'wind', lower: 'mountain' },
    judgment: 'Following has supreme success. Perseverance furthers. No blame.',
    image: 'Thunder in the middle of the lake: the image of Following. Thus the superior person at nightfall goes indoors for rest and recuperation.',
    soulInterpretation: 'The soul learns through following - surrendering to natural rhythms and wise guidance. Thunder rests in the lake at evening, as we rest from activity.',
    guidance: 'Know when to lead and when to follow. Adapt to changing circumstances. Rest when rest is called for. Following the right path is more important than leading the wrong one.',
    timing: 'Evening energy - when yielding to natural cycles',
    changingLinesMeanings: [
      'Line 1: The standard is changing. Perseverance brings good fortune. Going out brings connection.',
      'Line 2: If one clings to the little boy, one loses the strong man. Choose wisely.',
      'Line 3: If one clings to the strong man, one loses the little boy. Through following one finds what one seeks.',
      'Line 4: Following creates success. Perseverance brings misfortune. To be sincere brings clarity. What blame?',
      'Line 5: Sincere in the good. Good fortune. Genuine following.',
      'Line 6: They encounter firm allegiance and are still further bound. The king introduces them to the Western Mountain. Deep commitment.'
    ],
    elementalResonance: elem(0.5, 0.6, 0.5, 0.5, 0.5),
    archetypeCorrespondence: 'The Follower / The Adapter',
    oppositeHexagram: 18,
    reverseHexagram: 18,
    complementHexagram: 18
  },

  // ============== HEXAGRAM 18: GU - WORK ON WHAT HAS BEEN SPOILED ==============
  {
    number: 18,
    name: 'Gu',
    chineseName: '蠱',
    englishName: 'Work on What Has Been Spoiled',
    keyword: 'Decay/Renewal',
    lines: ['yin', 'yang', 'yang', 'yin', 'yin', 'yang'],
    trigrams: { upper: 'mountain', lower: 'wind' },
    nuclear: { upper: 'thunder', lower: 'lake' },
    judgment: 'Work on What Has Been Spoiled has supreme success. It furthers one to cross the great water. Before the starting point, three days. After the starting point, three days.',
    image: 'The wind blows low on the mountain: the image of Decay. Thus the superior person stirs up the people and strengthens their spirit.',
    soulInterpretation: 'What has decayed must be addressed with care and deliberation. This is soul work on ancestral patterns, old wounds, and inherited confusion.',
    guidance: 'Face what has been neglected or corrupted. Take time to understand the root cause before acting. Reform comes through understanding the past and planning the future.',
    timing: 'Healing and repair energy - addressing old wounds',
    changingLinesMeanings: [
      'Line 1: Setting right what has been spoiled by the father. If there is a son, no blame rests upon the departed father.',
      'Line 2: Setting right what has been spoiled by the mother. One must not be too persevering. Gentle reform.',
      'Line 3: Setting right what has been spoiled by the father. There will be a little remorse. No great blame.',
      'Line 4: Tolerating what has been spoiled by the father. In continuing one sees humiliation. Facing consequences.',
      'Line 5: Setting right what has been spoiled by the father. One meets with praise. Successful reform.',
      'Line 6: They do not serve kings and princes, set their goals higher. Beyond worldly repair.'
    ],
    elementalResonance: elem(0.4, 0.5, 0.6, 0.6, 0.5),
    archetypeCorrespondence: 'The Healer of Wounds / The Reformer',
    oppositeHexagram: 17,
    reverseHexagram: 17,
    complementHexagram: 17
  },

  // ============== HEXAGRAM 19: LIN - APPROACH ==============
  {
    number: 19,
    name: 'Lin',
    chineseName: '臨',
    englishName: 'Approach',
    keyword: 'Advance',
    lines: ['yang', 'yang', 'yin', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'earth', lower: 'lake' },
    nuclear: { upper: 'thunder', lower: 'earth' },
    judgment: 'Approach has supreme success. Perseverance furthers. When the eighth month comes, there will be misfortune.',
    image: 'The earth above the lake: the image of Approach. Thus the superior person is inexhaustible in their will to teach and tolerant in their protection of the people.',
    soulInterpretation: 'The time of approach is now. Like spring coming to the earth, new growth and opportunity are rising. But remember: after the fullness comes the decline.',
    guidance: 'Move forward with confidence but awareness. Teach and guide others generously. Make the most of this favorable time, knowing it will change.',
    timing: 'Spring rising energy - optimal time for expansion and teaching',
    changingLinesMeanings: [
      'Line 1: Joint approach. Perseverance brings good fortune. Moving together.',
      'Line 2: Joint approach. Good fortune. Everything furthers. Full support.',
      'Line 3: Comfortable approach. Nothing that would further. If one is induced to grieve, one becomes free of blame.',
      'Line 4: Complete approach. No blame. Open and whole.',
      'Line 5: Wise approach. This is right for a great prince. Good fortune. Sagely leadership.',
      'Line 6: Great-hearted approach. Good fortune. No blame. Magnanimous presence.'
    ],
    elementalResonance: elem(0.5, 0.5, 0.7, 0.5, 0.6),
    archetypeCorrespondence: 'The Teacher / The Approaching One',
    oppositeHexagram: 33,
    reverseHexagram: 20,
    complementHexagram: 33
  },

  // ============== HEXAGRAM 20: GUAN - CONTEMPLATION ==============
  {
    number: 20,
    name: 'Guan',
    chineseName: '觀',
    englishName: 'Contemplation',
    keyword: 'View/Example',
    lines: ['yin', 'yin', 'yin', 'yin', 'yang', 'yang'],
    trigrams: { upper: 'wind', lower: 'earth' },
    nuclear: { upper: 'mountain', lower: 'thunder' },
    judgment: 'Contemplation. The ablution has been made, but not yet the offering. Full of trust they look up to the leader.',
    image: 'The wind blows over the earth: the image of Contemplation. Thus the kings of old visited the regions of the world.',
    soulInterpretation: 'This is the time to look inward and observe your own nature. The tower of contemplation rises above the landscape of your life. What do you see from this height?',
    guidance: 'Step back and observe. See your life from a higher perspective. Others are watching your example - be conscious of what you model. Prepare inwardly before acting outwardly.',
    timing: 'Observatory energy - when perspective and reflection are needed',
    changingLinesMeanings: [
      'Line 1: Boy-like contemplation. For an inferior person, no blame. For a superior person, humiliation.',
      'Line 2: Contemplation through the crack of the door. Furthering for the perseverance of a woman. Limited view.',
      'Line 3: Contemplation of my life decides the choice between advance and retreat. Self-examination.',
      'Line 4: Contemplation of the light of the kingdom. It furthers one to exert influence as the guest of a king. Civic view.',
      'Line 5: Contemplation of my life. The superior person is without blame. Deep self-knowledge.',
      'Line 6: Contemplation of their life. The superior person is without blame. Transcendent view.'
    ],
    elementalResonance: elem(0.4, 0.5, 0.6, 0.7, 0.7),
    archetypeCorrespondence: 'The Observer / The Watchtower',
    oppositeHexagram: 34,
    reverseHexagram: 19,
    complementHexagram: 34
  },

  // ============== HEXAGRAM 21: SHI HE - BITING THROUGH ==============
  {
    number: 21,
    name: 'Shi He',
    chineseName: '噬嗑',
    englishName: 'Biting Through',
    keyword: 'Decisive Action',
    lines: ['yang', 'yin', 'yang', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'fire', lower: 'thunder' },
    nuclear: { upper: 'water', lower: 'mountain' },
    judgment: 'Biting Through has success. It is favorable to let justice be administered.',
    image: 'Thunder and lightning: the image of Biting Through. Thus the kings of former times made firm the laws through clearly defined penalties.',
    soulInterpretation: 'Something is obstructing the union of opposing forces. Like biting through tough meat, you must decisively break through what stands between you and wholeness.',
    guidance: 'Take decisive action to remove obstacles. Justice and clarity are needed. Do not be vague or hesitant - bite through to resolution.',
    timing: 'Breakthrough energy - when obstacles must be decisively removed',
    changingLinesMeanings: [
      'Line 1: Their feet are fastened in the stocks. Their toes disappear. No blame. Minor correction.',
      'Line 2: Bites through tender meat, so that their nose disappears. No blame. Going deep.',
      'Line 3: Bites on old dried meat and strikes on something poisonous. Slight humiliation. No blame. Difficult obstacle.',
      'Line 4: Bites on dried gristly meat. Receives metal arrows. It furthers to be mindful of difficulties and to be persevering. Good fortune.',
      'Line 5: Bites on dried lean meat. Receives yellow gold. Perseveringly aware of danger. No blame. Wisdom through difficulty.',
      'Line 6: Their neck is fastened in the wooden cangue, so that their ears disappear. Misfortune. Refusing to learn.'
    ],
    elementalResonance: elem(0.7, 0.4, 0.4, 0.5, 0.5),
    archetypeCorrespondence: 'The Judge / The Penetrator',
    oppositeHexagram: 48,
    reverseHexagram: 22,
    complementHexagram: 48
  },

  // ============== HEXAGRAM 22: BI - GRACE ==============
  {
    number: 22,
    name: 'Bi',
    chineseName: '賁',
    englishName: 'Grace',
    keyword: 'Elegance',
    lines: ['yang', 'yin', 'yang', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'mountain', lower: 'fire' },
    nuclear: { upper: 'thunder', lower: 'water' },
    judgment: 'Grace has success. In small matters it is favorable to undertake something.',
    image: 'Fire at the foot of the mountain: the image of Grace. Thus does the superior person proceed when clearing up current affairs but dare not decide controversial issues.',
    soulInterpretation: 'Beauty and form have their place but are not the ultimate reality. The soul adorns itself appropriately while remembering that inner substance matters most.',
    guidance: 'Attend to aesthetics and presentation in small matters. Create beauty around you. But do not let form overshadow substance - this is not the time for major decisions.',
    timing: 'Aesthetic refinement energy - beautifying but not deciding',
    changingLinesMeanings: [
      'Line 1: They lend grace to their toes, leave the carriage, and walk. Humble elegance.',
      'Line 2: They lend grace to their beard. Natural adornment.',
      'Line 3: Graceful and moist. Constant perseverance brings good fortune. Refined and nourished.',
      'Line 4: Grace or simplicity? A white horse comes as if on wings. Choosing essence over appearance.',
      'Line 5: Grace in hills and gardens. The roll of silk is meager and small. Humiliation, but in the end good fortune. Simple grace.',
      'Line 6: Simple grace. No blame. Return to essence beyond adornment.'
    ],
    elementalResonance: elem(0.6, 0.4, 0.5, 0.6, 0.5),
    archetypeCorrespondence: 'The Artist / The Adorner',
    oppositeHexagram: 47,
    reverseHexagram: 21,
    complementHexagram: 47
  },

  // ============== HEXAGRAM 23: BO - SPLITTING APART ==============
  {
    number: 23,
    name: 'Bo',
    chineseName: '剝',
    englishName: 'Splitting Apart',
    keyword: 'Deterioration',
    lines: ['yin', 'yin', 'yin', 'yin', 'yin', 'yang'],
    trigrams: { upper: 'mountain', lower: 'earth' },
    nuclear: { upper: 'earth', lower: 'earth' },
    judgment: 'Splitting Apart. It does not further one to go anywhere.',
    image: 'The mountain rests on the earth: the image of Splitting Apart. Thus those above can ensure their position only by giving generously to those below.',
    soulInterpretation: 'The old structure is collapsing - this is necessary destruction. Do not try to hold on to what is falling away. Let the splitting apart happen so the new can eventually emerge.',
    guidance: 'Do not undertake new ventures now. Accept that what is decaying must fall. Protect yourself by not resisting this natural process of dissolution.',
    timing: 'Autumn decay energy - when letting go is required',
    changingLinesMeanings: [
      'Line 1: The leg of the bed is split. Those who persevere are destroyed. Foundation crumbling.',
      'Line 2: The bed is split at the edge. Those who persevere are destroyed. Isolation increases.',
      'Line 3: They split with them. No blame. Breaking free of decay.',
      'Line 4: The bed is split up to the skin. Misfortune. Very close to harm.',
      'Line 5: A shoal of fishes. Favor comes through the court ladies. Everything acts to further. Transformation through feminine principle.',
      'Line 6: There is a large fruit still uneaten. The superior person receives a carriage. The house of the inferior person is split apart. Seed preserved.'
    ],
    elementalResonance: elem(0.3, 0.4, 0.6, 0.3, 0.4),
    archetypeCorrespondence: 'The Witness of Decay / The Letting Go',
    oppositeHexagram: 43,
    reverseHexagram: 24,
    complementHexagram: 43
  },

  // ============== HEXAGRAM 24: FU - RETURN ==============
  {
    number: 24,
    name: 'Fu',
    chineseName: '復',
    englishName: 'Return',
    keyword: 'Turning Point',
    lines: ['yang', 'yin', 'yin', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'earth', lower: 'thunder' },
    nuclear: { upper: 'earth', lower: 'earth' },
    judgment: 'Return. Success. Going out and coming in without error. Friends come without blame. To and fro goes the way. On the seventh day comes return.',
    image: 'Thunder within the earth: the image of the Turning Point. Thus the kings of antiquity closed the passes at the time of solstice.',
    soulInterpretation: 'After the darkness, light returns. A single yang line emerges beneath five yin lines - the seed of return. The soul recognizes this moment of renewal.',
    guidance: 'Welcome the return of light and energy. Rest during this tender new beginning. Do not rush or overextend. The turning point is precious and fragile.',
    timing: 'Winter solstice energy - the moment of return',
    changingLinesMeanings: [
      'Line 1: Return from a short distance. No need for remorse. Great good fortune. Quick correction.',
      'Line 2: Quiet return. Good fortune. Peaceful return.',
      'Line 3: Repeated return. Danger. No blame. Learning through repetition.',
      'Line 4: Walking in the midst of others, one returns alone. Independent return.',
      'Line 5: Noble-hearted return. No remorse. Dignified return.',
      'Line 6: Missing the return. Misfortune. Misfortune from within and without. If armies march, one will in the end suffer a great defeat.'
    ],
    elementalResonance: elem(0.5, 0.4, 0.6, 0.4, 0.6),
    archetypeCorrespondence: 'The Returner / The Seed of Light',
    oppositeHexagram: 44,
    reverseHexagram: 23,
    complementHexagram: 44
  },

  // ============== HEXAGRAM 25: WU WANG - INNOCENCE ==============
  {
    number: 25,
    name: 'Wu Wang',
    chineseName: '无妄',
    englishName: 'Innocence',
    keyword: 'The Unexpected',
    lines: ['yang', 'yin', 'yin', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'thunder' },
    nuclear: { upper: 'wind', lower: 'mountain' },
    judgment: 'Innocence. Supreme success. Perseverance furthers. If someone is not as they should be, they have misfortune.',
    image: 'Under heaven thunder rolls: all things attain the natural state of innocence. Thus the kings of old, rich in virtue and in harmony with the time, fostered and nourished all beings.',
    soulInterpretation: 'Return to your original nature. The divine child within you holds the key to your next spiritual breakthrough. Innocence is not naivety but original purity.',
    guidance: 'Approach your path with beginner\'s mind. Innocence and wonder will guide you to truth. Act from your natural state, not from calculation.',
    timing: 'Spring equinox energy - perfect for spiritual rebirth',
    changingLinesMeanings: [
      'Line 1: Innocent behavior brings good fortune. Natural action.',
      'Line 2: If one does not count on the harvest while plowing, nor on the use of the ground while clearing it, then it furthers one to undertake something. Pure work.',
      'Line 3: Undeserved misfortune. The cow that was tethered by someone is the wanderer\'s gain. Random events.',
      'Line 4: Those who can be persevering remain without blame. Steadfast innocence.',
      'Line 5: Use no medicine in an illness incurred through no fault of your own. It will pass of itself. Trust natural healing.',
      'Line 6: Innocent action brings misfortune. Nothing furthers. Wait for proper time.'
    ],
    elementalResonance: elem(0.6, 0.4, 0.5, 0.6, 0.7),
    archetypeCorrespondence: 'The Divine Child / The Innocent',
    oppositeHexagram: 46,
    reverseHexagram: 26,
    complementHexagram: 46
  },

  // ============== HEXAGRAM 26: DA CHU - GREAT ACCUMULATING ==============
  {
    number: 26,
    name: 'Da Chu',
    chineseName: '大畜',
    englishName: 'The Taming Power of the Great',
    keyword: 'Great Accumulation',
    lines: ['yang', 'yang', 'yang', 'yin', 'yin', 'yang'],
    trigrams: { upper: 'mountain', lower: 'heaven' },
    nuclear: { upper: 'lake', lower: 'thunder' },
    judgment: 'The Taming Power of the Great. Perseverance furthers. Not eating at home brings good fortune. It furthers one to cross the great water.',
    image: 'Heaven within the mountain: the image of The Taming Power of the Great. Thus the superior person acquaints themselves with many sayings of antiquity.',
    soulInterpretation: 'Great creative power is being accumulated within you. Like heaven contained within a mountain, immense potential awaits release. Study the wisdom of the past.',
    guidance: 'Accumulate strength and knowledge. This is a time for study and preparation. Do not stay home in comfort - venture out and cross the great water.',
    timing: 'Accumulation energy - gathering power before great action',
    changingLinesMeanings: [
      'Line 1: Danger is at hand. It furthers one to desist. Restrain impulse.',
      'Line 2: The axletrees are taken from the wagon. Power held back.',
      'Line 3: A good horse that follows others. Awareness of danger and perseverance further. Practice charioting and armed defense daily. Preparation.',
      'Line 4: The headboard of a young bull. Great good fortune. Early training.',
      'Line 5: The tusk of a gelded boar. Good fortune. Transformed danger.',
      'Line 6: One attains the way of heaven. Success. Full expression.'
    ],
    elementalResonance: elem(0.6, 0.4, 0.7, 0.5, 0.6),
    archetypeCorrespondence: 'The Accumulator / The Student of Wisdom',
    oppositeHexagram: 45,
    reverseHexagram: 25,
    complementHexagram: 45
  },

  // ============== HEXAGRAM 27: YI - NOURISHMENT ==============
  {
    number: 27,
    name: 'Yi',
    chineseName: '頤',
    englishName: 'The Corners of the Mouth',
    keyword: 'Nourishment',
    lines: ['yang', 'yin', 'yin', 'yin', 'yin', 'yang'],
    trigrams: { upper: 'mountain', lower: 'thunder' },
    nuclear: { upper: 'earth', lower: 'earth' },
    judgment: 'The Corners of the Mouth. Perseverance brings good fortune. Pay heed to the providing of nourishment and to what a person seeks to fill their own mouth with.',
    image: 'At the foot of the mountain, thunder: the image of Providing Nourishment. Thus the superior person is careful of their words and temperate in eating and drinking.',
    soulInterpretation: 'What you take in - food, words, ideas - shapes your soul. What you put out - speech, actions, creative expression - nourishes or harms others.',
    guidance: 'Examine what you consume and express. Nourish yourself with pure food and wisdom. Be careful with your words. Seek nourishment for the soul, not just the body.',
    timing: 'Nourishment cycle energy - attention to input and output',
    changingLinesMeanings: [
      'Line 1: You let your magic tortoise go and look at me with the corners of your mouth drooping. Misfortune. Envy.',
      'Line 2: Turning to the summit for nourishment, deviating from the path. To continue brings misfortune. Wrong source.',
      'Line 3: Turning away from nourishment. Perseverance brings misfortune. Do not act thus for ten years. Refusing proper nourishment.',
      'Line 4: Turning to the summit for provision of nourishment brings good fortune. Spying about with sharp eyes like a tiger. Good source.',
      'Line 5: Turning away from the path. To remain persevering brings good fortune. One should not cross the great water. Wait.',
      'Line 6: The source of nourishment. Awareness of danger brings good fortune. It furthers one to cross the great water. Master of nourishment.'
    ],
    elementalResonance: elem(0.5, 0.5, 0.7, 0.4, 0.5),
    archetypeCorrespondence: 'The Nourisher / The Careful One',
    oppositeHexagram: 28,
    reverseHexagram: 28,
    complementHexagram: 28
  },

  // ============== HEXAGRAM 28: DA GUO - PREPONDERANCE OF THE GREAT ==============
  {
    number: 28,
    name: 'Da Guo',
    chineseName: '大過',
    englishName: 'Preponderance of the Great',
    keyword: 'Excess',
    lines: ['yin', 'yang', 'yang', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'lake', lower: 'wind' },
    nuclear: { upper: 'heaven', lower: 'heaven' },
    judgment: 'Preponderance of the Great. The ridgepole sags to the breaking point. It furthers one to have somewhere to go. Success.',
    image: 'The lake rises above the trees: the image of Preponderance of the Great. Thus the superior person, when they stand alone, is unconcerned.',
    soulInterpretation: 'The structure is under extraordinary pressure. This is a time of great excess - something must give. The ridgepole bends, but the extraordinary situation requires extraordinary measures.',
    guidance: 'Recognize the extraordinary nature of this time. Move forward - staying still is not an option. Stand alone if necessary. The old structure cannot hold.',
    timing: 'Crisis energy - when normal measures are insufficient',
    changingLinesMeanings: [
      'Line 1: To spread white rushes underneath. No blame. Extra care.',
      'Line 2: A dry poplar sprouts at the root. An older man takes a young wife. Everything furthers. Renewal from unexpected source.',
      'Line 3: The ridgepole sags to the breaking point. Misfortune. Critical point.',
      'Line 4: The ridgepole is braced. Good fortune. If there are ulterior motives, it is humiliating. Support arrived.',
      'Line 5: A withered poplar puts forth flowers. An older woman takes a young husband. No blame. No praise. Temporary bloom.',
      'Line 6: One must go through the water. It goes over one\'s head. Misfortune. No blame. Beyond rescue but blameless.'
    ],
    elementalResonance: elem(0.6, 0.5, 0.3, 0.6, 0.5),
    archetypeCorrespondence: 'The Crisis Navigator / The Extraordinary One',
    oppositeHexagram: 27,
    reverseHexagram: 27,
    complementHexagram: 27
  },

  // ============== HEXAGRAM 29: KAN - THE ABYSMAL ==============
  {
    number: 29,
    name: 'Kan',
    chineseName: '坎',
    englishName: 'The Abysmal',
    keyword: 'Danger',
    lines: ['yin', 'yang', 'yin', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'water', lower: 'water' },
    nuclear: { upper: 'mountain', lower: 'thunder' },
    judgment: 'The Abysmal repeated. If you are sincere, you have success in your heart, and whatever you do succeeds.',
    image: 'Water flows on and reaches the goal: the image of the Abysmal repeated. Thus the superior person walks in lasting virtue and carries on the business of teaching.',
    soulInterpretation: 'Deep waters surround you - danger repeated. Yet water also finds its way through all obstacles. The soul must flow like water, maintaining its nature while navigating depths.',
    guidance: 'Flow through danger with consistency and sincerity. Do not resist but adapt. Teach others what you learn in the depths. Keep your heart true.',
    timing: 'Deep water energy - navigating repeated challenges',
    changingLinesMeanings: [
      'Line 1: Repetition of the Abysmal. In the abyss one falls into a pit. Misfortune. Danger deepens.',
      'Line 2: The abyss is dangerous. One should strive to attain small things only. Small gains in danger.',
      'Line 3: Forward and backward, abyss on abyss. In danger like this, pause at first and wait. No way forward yet.',
      'Line 4: A jug of wine, a bowl of rice with it, earthen vessels simply handed through the window. No blame. Simple nourishment in crisis.',
      'Line 5: The abyss is not filled to overflowing, it is filled only to the rim. No blame. Not overdoing.',
      'Line 6: Bound with cords and ropes, shut in between thorn-hedged prison walls. For three years one does not find the way. Misfortune. Trapped.'
    ],
    elementalResonance: elem(0.3, 0.9, 0.4, 0.3, 0.5),
    archetypeCorrespondence: 'The Depth-Walker / The Mystic',
    oppositeHexagram: 30,
    reverseHexagram: 30,
    complementHexagram: 30
  },

  // ============== HEXAGRAM 30: LI - THE CLINGING ==============
  {
    number: 30,
    name: 'Li',
    chineseName: '離',
    englishName: 'The Clinging',
    keyword: 'Radiance',
    lines: ['yang', 'yin', 'yang', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'fire', lower: 'fire' },
    nuclear: { upper: 'lake', lower: 'wind' },
    judgment: 'The Clinging. Perseverance furthers. It brings success. Care of the cow brings good fortune.',
    image: 'That which is bright rises twice: the image of Fire. Thus the great person, by perpetuating this brightness, illumines the four quarters of the world.',
    soulInterpretation: 'Fire needs something to cling to in order to burn. Your consciousness needs an object of devotion. Cling to what is luminous and true.',
    guidance: 'Let your inner light shine consistently. Attach yourself to worthy things - ideas, people, purposes. Your clarity can illuminate others. Tend your inner fire carefully.',
    timing: 'Bright noon energy - when consciousness is at its clearest',
    changingLinesMeanings: [
      'Line 1: The footprints run crisscross. If one is serious, no blame. Careful beginning.',
      'Line 2: Yellow light. Supreme good fortune. Golden radiance.',
      'Line 3: In the light of the setting sun, people either beat the pot and sing or loudly bewail the approach of old age. Misfortune. Excessive reaction.',
      'Line 4: Its coming is sudden; it flames up, dies down, is thrown away. Flash in the pan.',
      'Line 5: Tears in floods, sighing and lamenting. Good fortune. Purification through emotion.',
      'Line 6: The king uses them to march forth and chastise. The best thing is to kill the leaders and capture the followers. No blame. Decisive clarity.'
    ],
    elementalResonance: elem(0.9, 0.3, 0.4, 0.6, 0.6),
    archetypeCorrespondence: 'The Illuminator / The Flame',
    oppositeHexagram: 29,
    reverseHexagram: 29,
    complementHexagram: 29
  },

  // ============== HEXAGRAMS 31-64 CONTINUED ==============
  // (Following same pattern for remaining hexagrams)

  // ============== HEXAGRAM 31: XIAN - INFLUENCE ==============
  {
    number: 31,
    name: 'Xian',
    chineseName: '咸',
    englishName: 'Influence',
    keyword: 'Mutual Attraction',
    lines: ['yin', 'yang', 'yang', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'lake', lower: 'mountain' },
    nuclear: { upper: 'heaven', lower: 'wind' },
    judgment: 'Influence. Success. Perseverance furthers. To take a maiden to wife brings good fortune.',
    image: 'A lake on the mountain: the image of Influence. Thus the superior person encourages people to approach them by their readiness to receive them.',
    soulInterpretation: 'The mountain and lake mutually attract - yin and yang in perfect resonance. This is the influence of souls upon each other, the dance of receptivity and stillness.',
    guidance: 'Open yourself to influence while remaining still within. Attraction works through receptivity, not grasping. Allow the natural magnetism of genuine presence.',
    timing: 'Courtship energy - mutual attraction and influence',
    changingLinesMeanings: [
      'Line 1: The influence shows itself in the big toe. Barely perceptible.',
      'Line 2: The influence shows itself in the calves of the legs. Misfortune. Tarrying brings good fortune. Premature action.',
      'Line 3: The influence shows itself in the thighs. Follows what it holds. Going on brings humiliation.',
      'Line 4: Perseverance brings good fortune. Remorse disappears. Centered influence.',
      'Line 5: The influence shows itself in the back of the neck. No remorse. Deep conviction.',
      'Line 6: The influence shows itself in the jaws, cheeks, and tongue. Mere talk.'
    ],
    elementalResonance: elem(0.5, 0.6, 0.5, 0.5, 0.7),
    archetypeCorrespondence: 'The Attracted / The Receptive Heart',
    oppositeHexagram: 41,
    reverseHexagram: 32,
    complementHexagram: 41
  },

  // ============== HEXAGRAM 32: HENG - DURATION ==============
  {
    number: 32,
    name: 'Heng',
    chineseName: '恆',
    englishName: 'Duration',
    keyword: 'Perseverance',
    lines: ['yin', 'yin', 'yang', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'thunder', lower: 'wind' },
    nuclear: { upper: 'lake', lower: 'heaven' },
    judgment: 'Duration. Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.',
    image: 'Thunder and wind: the image of Duration. Thus the superior person stands firm and does not change their direction.',
    soulInterpretation: 'Thunder and wind are eternal forces - their interaction creates lasting patterns. Your soul seeks what endures beyond the passing moment.',
    guidance: 'Commit to what is worth maintaining. Duration is not stagnation but consistent movement in a direction. Find your enduring purpose and persist.',
    timing: 'Mature relationship energy - what lasts over time',
    changingLinesMeanings: [
      'Line 1: Seeking duration too hastily brings misfortune persistently. Nothing that would further. Patience needed.',
      'Line 2: Remorse disappears. Steadiness restored.',
      'Line 3: Those who do not give duration to their character meet with disgrace. Persistent humiliation. Inconsistency.',
      'Line 4: No game in the field. Nothing to sustain effort.',
      'Line 5: Giving duration to one\'s character through perseverance. Good fortune for a woman. Misfortune for a man. Receptive persistence.',
      'Line 6: Restlessness as an enduring condition brings misfortune. Chronic instability.'
    ],
    elementalResonance: elem(0.5, 0.4, 0.5, 0.6, 0.6),
    archetypeCorrespondence: 'The Steadfast / The Enduring',
    oppositeHexagram: 42,
    reverseHexagram: 31,
    complementHexagram: 42
  },

  // ============== HEXAGRAM 33: DUN - RETREAT ==============
  {
    number: 33,
    name: 'Dun',
    chineseName: '遯',
    englishName: 'Retreat',
    keyword: 'Withdrawal',
    lines: ['yin', 'yin', 'yang', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'mountain' },
    nuclear: { upper: 'heaven', lower: 'wind' },
    judgment: 'Retreat. Success. In what is small, perseverance furthers.',
    image: 'Mountain under heaven: the image of Retreat. Thus the superior person keeps the inferior at a distance, not angrily but with reserve.',
    soulInterpretation: 'Spiritual retreat is necessary for your soul\'s evolution. Step back from worldly concerns to connect with the eternal. This is strategic positioning, not defeat.',
    guidance: 'This is not withdrawal but strategic spiritual positioning. Use solitude to connect with your higher purpose. Keep inferior elements at a dignified distance.',
    timing: 'Winter solstice energy - perfect for deep spiritual practice',
    changingLinesMeanings: [
      'Line 1: At the tail in retreat. This is dangerous. One must not wish to undertake anything. Withdraw quickly.',
      'Line 2: They hold them fast with yellow oxhide. No one can tear them loose. Firm binding.',
      'Line 3: A halted retreat is nerve-wracking and dangerous. To retain people as servants brings good fortune. Difficult pause.',
      'Line 4: Voluntary retreat brings good fortune to the superior person and downfall to the inferior. Dignified withdrawal.',
      'Line 5: Friendly retreat. Perseverance brings good fortune. Graceful withdrawal.',
      'Line 6: Cheerful retreat. Everything serves to further. Complete release.'
    ],
    elementalResonance: elem(0.4, 0.4, 0.6, 0.5, 0.7),
    archetypeCorrespondence: 'The Strategic Retreater / The Hermit',
    oppositeHexagram: 19,
    reverseHexagram: 34,
    complementHexagram: 19
  },

  // ============== HEXAGRAM 34: DA ZHUANG - GREAT POWER ==============
  {
    number: 34,
    name: 'Da Zhuang',
    chineseName: '大壯',
    englishName: 'The Power of the Great',
    keyword: 'Great Strength',
    lines: ['yang', 'yang', 'yang', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'thunder', lower: 'heaven' },
    nuclear: { upper: 'lake', lower: 'heaven' },
    judgment: 'The Power of the Great. Perseverance furthers.',
    image: 'Thunder in heaven above: the image of The Power of the Great. Thus the superior person does not tread upon paths that do not accord with established order.',
    soulInterpretation: 'Great power is rising within you. Thunder over heaven - immense energy seeking expression. The soul must channel this power righteously.',
    guidance: 'Use your power only in alignment with what is right. Great strength demands great responsibility. Do not abuse power or use it for personal gain alone.',
    timing: 'Peak yang energy - when strength is at its maximum',
    changingLinesMeanings: [
      'Line 1: Power in the toes. Continuing brings misfortune. This is certainly true. Restrain premature action.',
      'Line 2: Perseverance brings good fortune. Centered strength.',
      'Line 3: The inferior person works through power. The superior person does not act thus. A goat butts against a hedge and gets its horns entangled. Misuse of power.',
      'Line 4: Perseverance brings good fortune. Remorse disappears. The hedge opens; no entanglement. Power in the axle of a big cart. Breakthrough.',
      'Line 5: Loses the goat with ease. No remorse. Letting go of force.',
      'Line 6: A goat butts against a hedge. It cannot go backward, it cannot go forward. Nothing serves to further. If one notes the difficulty, this brings good fortune. Impasse.'
    ],
    elementalResonance: elem(0.8, 0.3, 0.5, 0.6, 0.5),
    archetypeCorrespondence: 'The Powerful One / The Thunder Lord',
    oppositeHexagram: 20,
    reverseHexagram: 33,
    complementHexagram: 20
  },

  // ============== HEXAGRAM 35: JIN - PROGRESS ==============
  {
    number: 35,
    name: 'Jin',
    chineseName: '晉',
    englishName: 'Progress',
    keyword: 'Advancement',
    lines: ['yang', 'yin', 'yang', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'fire', lower: 'earth' },
    nuclear: { upper: 'water', lower: 'mountain' },
    judgment: 'Progress. The powerful prince is honored with horses in large numbers. In a single day he is granted audience three times.',
    image: 'The sun rises over the earth: the image of Progress. Thus the superior person themselves brightens their bright virtue.',
    soulInterpretation: 'The sun rises above the earth - progress is natural and irresistible. Your light is rising to be seen by all. This is righteous advancement, earned through virtue.',
    guidance: 'Progress naturally and openly. Your light should be visible to all. Accept honors that come to you, but remain connected to virtue. The dawn cannot be rushed.',
    timing: 'Sunrise energy - natural upward movement',
    changingLinesMeanings: [
      'Line 1: Progressing, but turned back. Perseverance brings good fortune. If one meets with no confidence, one should remain calm. No mistake. Initial obstacle.',
      'Line 2: Progressing, but in sorrow. Perseverance brings good fortune. Receiving great blessing from one\'s ancestress. Progress through difficulty.',
      'Line 3: All are in accord. Remorse disappears. Collective support.',
      'Line 4: Progress like a hamster. Perseverance brings danger. Hidden accumulation.',
      'Line 5: Remorse disappears. Take not gain and loss to heart. Undertakings bring good fortune. Everything serves to further. Full progress.',
      'Line 6: Making progress with the horns. Using them only to punish one\'s own city. Danger. Good fortune. No blame. Forced progress.'
    ],
    elementalResonance: elem(0.7, 0.4, 0.6, 0.5, 0.6),
    archetypeCorrespondence: 'The Rising Sun / The Advancing One',
    oppositeHexagram: 5,
    reverseHexagram: 36,
    complementHexagram: 5
  },

  // ============== HEXAGRAM 36: MING YI - DARKENING OF THE LIGHT ==============
  {
    number: 36,
    name: 'Ming Yi',
    chineseName: '明夷',
    englishName: 'Darkening of the Light',
    keyword: 'Concealment',
    lines: ['yin', 'yin', 'yin', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'earth', lower: 'fire' },
    nuclear: { upper: 'thunder', lower: 'water' },
    judgment: 'Darkening of the Light. In adversity it furthers one to be persevering.',
    image: 'The light has sunk into the earth: the image of Darkening of the Light. Thus the superior person lives with the great mass: they veil their light, yet still shines.',
    soulInterpretation: 'The sun has set below the earth. Your light must be concealed in dark times. The soul hides its brightness to survive and preserve what is precious.',
    guidance: 'Protect your inner light during difficult times. Do not display your abilities to those who would harm you. Persevere internally while appearing ordinary externally.',
    timing: 'Sunset/night energy - when concealment is necessary',
    changingLinesMeanings: [
      'Line 1: Darkening of the light during flight. They lower their wings. The superior person does not eat for three days on their wanderings. Urgent departure.',
      'Line 2: Darkening of the light injures them in the left thigh. Aid comes with the strength of a horse. Good fortune. Wounded but helped.',
      'Line 3: Darkening of the light during the hunt in the south. Their great head is captured. One must not expect perseverance too soon. Catching the source.',
      'Line 4: They penetrate the left side of the belly. One gets at the very heart of the darkening of the light. Understanding the darkness.',
      'Line 5: Darkening of the light as with Prince Chi. Perseverance furthers. The model of hidden virtue.',
      'Line 6: Not light but darkness. First they climbed up to heaven, then they plunged into the depths of the earth. Complete fall of the dark power.'
    ],
    elementalResonance: elem(0.4, 0.5, 0.6, 0.4, 0.4),
    archetypeCorrespondence: 'The Hidden Light / The Concealed Sage',
    oppositeHexagram: 6,
    reverseHexagram: 35,
    complementHexagram: 6
  },

  // Continuing with hexagrams 37-64...
  // ============== HEXAGRAM 37: JIA REN - THE FAMILY ==============
  {
    number: 37,
    name: 'Jia Ren',
    chineseName: '家人',
    englishName: 'The Family',
    keyword: 'Household',
    lines: ['yang', 'yin', 'yang', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'wind', lower: 'fire' },
    nuclear: { upper: 'fire', lower: 'water' },
    judgment: 'The Family. The perseverance of the woman furthers.',
    image: 'Wind comes forth from fire: the image of the Family. Thus the superior person has substance in their words and duration in their way of life.',
    soulInterpretation: 'The family is the foundation of society and the training ground of the soul. Inner fire creates the wind that influences all. Your words and actions shape your household.',
    guidance: 'Attend to your inner household - your thoughts, feelings, and habits. What you cultivate within radiates outward. Let your words carry substance and your life show consistency.',
    timing: 'Domestic harmony energy - attending to foundations',
    changingLinesMeanings: [
      'Line 1: Firm seclusion within the family. Remorse disappears. Clear boundaries.',
      'Line 2: They should not follow their whims. They must attend within to the food. Perseverance brings good fortune. Nourishing role.',
      'Line 3: When tempers flare up in the family, too great severity brings remorse. Good fortune nonetheless. When woman and child dally and laugh, it leads in the end to humiliation. Balanced discipline.',
      'Line 4: They are the treasure of the house. Great good fortune. Valued position.',
      'Line 5: As a king they approach their family. Fear not. Good fortune. Benevolent authority.',
      'Line 6: Their work commands respect. In the end good fortune comes. Earned reverence.'
    ],
    elementalResonance: elem(0.6, 0.5, 0.6, 0.6, 0.6),
    archetypeCorrespondence: 'The Householder / The Foundation Builder',
    oppositeHexagram: 40,
    reverseHexagram: 38,
    complementHexagram: 40
  },

  // ============== HEXAGRAM 38: KUI - OPPOSITION ==============
  {
    number: 38,
    name: 'Kui',
    chineseName: '睽',
    englishName: 'Opposition',
    keyword: 'Estrangement',
    lines: ['yin', 'yang', 'yang', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'fire', lower: 'lake' },
    nuclear: { upper: 'water', lower: 'fire' },
    judgment: 'Opposition. In small matters, good fortune.',
    image: 'Above, fire; below, the lake: the image of Opposition. Thus amid all fellowship the superior person retains their individuality.',
    soulInterpretation: 'Fire rises, water descends - natural opposition. Yet in this difference lies potential complement. The soul learns that opposition can lead to higher synthesis.',
    guidance: 'Do not try to force unity where opposition exists. Work with small matters where agreement is possible. Retain your individuality even in fellowship. Opposites can eventually unite.',
    timing: 'Tension energy - working with difference',
    changingLinesMeanings: [
      'Line 1: Remorse disappears. If you lose your horse, do not run after it; it will come back of its own accord. When you see evil people, guard yourself against mistakes. Let go.',
      'Line 2: One meets their lord in a narrow street. No blame. Unexpected encounter.',
      'Line 3: One sees the wagon dragged back, the oxen halted, a person\'s hair and nose cut off. Not a good beginning, but a good end. Difficult start.',
      'Line 4: Isolated through opposition, one meets a like-minded person with whom one can associate in good faith. Despite the danger, no blame. Finding ally.',
      'Line 5: Remorse disappears. The companion bites their way through the wrappings. If one goes to them, how could it be a mistake? Breaking through.',
      'Line 6: Isolated through opposition, one sees one\'s companion as a pig covered with dirt, as a wagon full of devils. At first one draws a bow against them, then one lays the bow aside. The companion is not a robber; they will woo at the right time. As one goes, rain falls; then good fortune comes. Illusion cleared.'
    ],
    elementalResonance: elem(0.6, 0.5, 0.4, 0.5, 0.4),
    archetypeCorrespondence: 'The Individualist / The Bridge of Opposites',
    oppositeHexagram: 39,
    reverseHexagram: 37,
    complementHexagram: 39
  },

  // ============== HEXAGRAM 39: JIAN - OBSTRUCTION ==============
  {
    number: 39,
    name: 'Jian',
    chineseName: '蹇',
    englishName: 'Obstruction',
    keyword: 'Difficulty',
    lines: ['yin', 'yang', 'yin', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'water', lower: 'mountain' },
    nuclear: { upper: 'fire', lower: 'water' },
    judgment: 'Obstruction. The southwest furthers. The northeast does not further. It furthers one to see the great person. Perseverance brings good fortune.',
    image: 'Water on the mountain: the image of Obstruction. Thus the superior person turns their attention to themselves and molds their character.',
    soulInterpretation: 'Water cannot flow up the mountain - obstruction is real. Yet the soul uses this time to look inward and develop character. External difficulty becomes internal opportunity.',
    guidance: 'Do not push against immovable obstacles. Turn inward and develop yourself. Seek guidance from those who have navigated such difficulties. The southwest (yielding) path opens.',
    timing: 'Obstacle energy - when external progress is blocked',
    changingLinesMeanings: [
      'Line 1: Going leads to obstructions, coming meets with praise. Wait.',
      'Line 2: The king\'s servant is beset by obstruction upon obstruction. It is not their own fault. Serving through difficulty.',
      'Line 3: Going leads to obstructions, hence they come back. Stay put.',
      'Line 4: Going leads to obstructions, coming leads to union. Work with others.',
      'Line 5: In the midst of the greatest obstructions, friends come. Allies appear.',
      'Line 6: Going leads to obstructions, coming leads to great good fortune. It furthers one to see the great person. Seek guidance.'
    ],
    elementalResonance: elem(0.4, 0.6, 0.6, 0.4, 0.5),
    archetypeCorrespondence: 'The Obstacle-Facer / The Character Builder',
    oppositeHexagram: 38,
    reverseHexagram: 40,
    complementHexagram: 38
  },

  // ============== HEXAGRAM 40: JIE - DELIVERANCE ==============
  {
    number: 40,
    name: 'Jie',
    chineseName: '解',
    englishName: 'Deliverance',
    keyword: 'Liberation',
    lines: ['yin', 'yin', 'yang', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'thunder', lower: 'water' },
    nuclear: { upper: 'water', lower: 'fire' },
    judgment: 'Deliverance. The southwest furthers. If there is no longer anything where one has to go, return brings good fortune. If there is still something where one has to go, hastening brings good fortune.',
    image: 'Thunder and rain set in: the image of Deliverance. Thus the superior person pardons mistakes and forgives misdeeds.',
    soulInterpretation: 'The thunder and rain release tension - deliverance has come. The soul is freed from what bound it. Forgive yourself and others; release what no longer serves.',
    guidance: 'Act quickly to complete what remains, then return to normal. This is a time for forgiveness and release. Do not hold onto what has been resolved. Return to simplicity.',
    timing: 'Storm-clearing energy - after tension breaks',
    changingLinesMeanings: [
      'Line 1: Without blame. Simple relief.',
      'Line 2: One catches three foxes in the field and receives a yellow arrow. Perseverance brings good fortune. Eliminating cunning.',
      'Line 3: If a person carries a burden on their back and nonetheless rides in a carriage, they thereby encourage robbers. Perseverance leads to humiliation. Mixed signals.',
      'Line 4: Deliver yourself from your big toe. When the companion comes, then you have one you can trust. Release attachments.',
      'Line 5: The superior person alone can deliver themselves. Good fortune. They prove it to inferior people. Self-liberation.',
      'Line 6: The prince shoots at a hawk on a high wall. They catch it. Everything serves to further. Decisive action.'
    ],
    elementalResonance: elem(0.6, 0.6, 0.4, 0.6, 0.6),
    archetypeCorrespondence: 'The Liberator / The Forgiver',
    oppositeHexagram: 37,
    reverseHexagram: 39,
    complementHexagram: 37
  },

  // ============== HEXAGRAM 41: SUN - DECREASE ==============
  {
    number: 41,
    name: 'Sun',
    chineseName: '損',
    englishName: 'Decrease',
    keyword: 'Reduction',
    lines: ['yang', 'yin', 'yin', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'mountain', lower: 'lake' },
    nuclear: { upper: 'earth', lower: 'thunder' },
    judgment: 'Decrease combined with sincerity brings about supreme good fortune without blame. One may be persevering. It furthers one to undertake something. How is this to be carried out? One may use two small bowls for the sacrifice.',
    image: 'At the foot of the mountain, the lake: the image of Decrease. Thus the superior person controls their anger and restrains their instincts.',
    soulInterpretation: 'The lake decreases to nourish the mountain above - sacrifice creates growth elsewhere. The soul must sometimes diminish itself to serve a greater purpose.',
    guidance: 'Accept necessary decrease with sincerity. Restrain your lower impulses to feed your higher development. Even simple offerings made with genuine heart have great value.',
    timing: 'Fasting/reduction energy - simplifying for growth',
    changingLinesMeanings: [
      'Line 1: Going quickly when one\'s tasks are finished is without blame. But one must reflect on how much one may decrease others. Quick service.',
      'Line 2: Perseverance furthers. To undertake something brings misfortune. Without decreasing oneself, one can bring increase to others. Indirect help.',
      'Line 3: When three people journey together, their number decreases by one. When one person journeys alone, they find a companion. Finding balance.',
      'Line 4: If a person decreases their faults, another comes quickly to bring joy. No blame. Self-correction.',
      'Line 5: Someone increases them. Ten pairs of tortoises cannot oppose it. Supreme good fortune. Blessed increase.',
      'Line 6: If one is increased without depriving others, there is no blame. Perseverance brings good fortune. It furthers to undertake something. Win-win.'
    ],
    elementalResonance: elem(0.4, 0.5, 0.6, 0.4, 0.5),
    archetypeCorrespondence: 'The Ascetic / The Simplifier',
    oppositeHexagram: 31,
    reverseHexagram: 42,
    complementHexagram: 31
  },

  // ============== HEXAGRAM 42: YI - INCREASE ==============
  {
    number: 42,
    name: 'Yi',
    chineseName: '益',
    englishName: 'Increase',
    keyword: 'Expansion',
    lines: ['yang', 'yang', 'yin', 'yin', 'yin', 'yang'],
    trigrams: { upper: 'wind', lower: 'thunder' },
    nuclear: { upper: 'mountain', lower: 'earth' },
    judgment: 'Increase. It furthers one to undertake something. It furthers one to cross the great water.',
    image: 'Wind and thunder: the image of Increase. Thus the superior person, if they see good, imitate it; if they have faults, they rid themselves of them.',
    soulInterpretation: 'Your spiritual capacities are expanding rapidly. This is a time of accelerated growth and awakening. Wind and thunder together create powerful increase.',
    guidance: 'Use this expansion wisely. Share your growth through teaching, healing, or creative expression. Imitate what is good, release what is faulty. Act decisively.',
    timing: 'Waxing moon phases - excellent for spiritual development',
    changingLinesMeanings: [
      'Line 1: It furthers one to accomplish great deeds. Supreme good fortune. No blame. Supported initiative.',
      'Line 2: Someone increases them. Ten pairs of tortoises cannot oppose it. Constant perseverance brings good fortune. Unstoppable blessing.',
      'Line 3: One is enriched through unfortunate events. No blame, if you are sincere and walk in the middle, and report with a seal to the prince. Growth through difficulty.',
      'Line 4: If you walk in the middle and report to the prince, they will follow. It furthers to be used in the relocation of the capital. Trusted advisor.',
      'Line 5: If in truth you have a kind heart, ask not. Supreme good fortune. Truly, kindness will be recognized as your virtue. Genuine benevolence.',
      'Line 6: They bring increase to no one. Someone even strikes them. They do not keep their heart constantly steady. Misfortune. Unstable.'
    ],
    elementalResonance: elem(0.6, 0.5, 0.5, 0.7, 0.7),
    archetypeCorrespondence: 'The Expander / The Benefactor',
    oppositeHexagram: 32,
    reverseHexagram: 41,
    complementHexagram: 32
  },

  // ============== HEXAGRAM 43: GUAI - BREAKTHROUGH ==============
  {
    number: 43,
    name: 'Guai',
    chineseName: '夬',
    englishName: 'Breakthrough',
    keyword: 'Resoluteness',
    lines: ['yang', 'yang', 'yang', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'lake', lower: 'heaven' },
    nuclear: { upper: 'heaven', lower: 'heaven' },
    judgment: 'Breakthrough. One must resolutely make the matter known at the court of the king. It must be announced truthfully. Danger. It is necessary to notify one\'s own city. It does not further to resort to arms. It furthers one to undertake something.',
    image: 'The lake has risen up to heaven: the image of Breakthrough. Thus the superior person dispenses riches downward and refrains from resting on their virtue.',
    soulInterpretation: 'Five yang lines push up against one yin - breakthrough is imminent. Truth must be spoken clearly and publicly. The inferior element is about to be displaced.',
    guidance: 'Speak the truth openly and clearly. Do not resort to violence but to persistent truth-telling. Share your abundance downward. The breakthrough requires courage but not aggression.',
    timing: 'Breaking-through energy - decisive truth-telling',
    changingLinesMeanings: [
      'Line 1: Mighty in the forward-striding toes. When one goes and is not equal to the task, one makes a mistake. Premature advance.',
      'Line 2: A cry of alarm. Arms at evening and at night. Fear not. Ready alertness.',
      'Line 3: To be powerful in the cheekbones brings misfortune. The superior person is firmly resolved. They walk alone and are caught in the rain. Splashed, they are irritated. No blame. Isolated advance.',
      'Line 4: There is no skin on their thighs, and walking comes hard. If one were to let oneself be led like a sheep, remorse would disappear. But if one hears these words, one will not believe them. Stubborn difficulty.',
      'Line 5: In dealing with weeds, firm resolution is necessary. Walking in the middle remains free of blame. Clearing away.',
      'Line 6: No cry. In the end misfortune comes. Silent defeat.'
    ],
    elementalResonance: elem(0.7, 0.4, 0.4, 0.7, 0.6),
    archetypeCorrespondence: 'The Truth-Speaker / The Breakthrough Maker',
    oppositeHexagram: 23,
    reverseHexagram: 44,
    complementHexagram: 23
  },

  // ============== HEXAGRAM 44: GOU - COMING TO MEET ==============
  {
    number: 44,
    name: 'Gou',
    chineseName: '姤',
    englishName: 'Coming to Meet',
    keyword: 'Encounter',
    lines: ['yin', 'yang', 'yang', 'yang', 'yang', 'yang'],
    trigrams: { upper: 'heaven', lower: 'wind' },
    nuclear: { upper: 'heaven', lower: 'heaven' },
    judgment: 'Coming to Meet. The maiden is powerful. One should not marry such a maiden.',
    image: 'Under heaven, wind: the image of Coming to Meet. Thus does the prince act when disseminating their commands and proclaiming them to the four quarters of heaven.',
    soulInterpretation: 'A yin line enters from below - something unexpected comes to meet you. This encounter can be powerful but potentially destabilizing. The soul must be discerning.',
    guidance: 'Be watchful for what comes to meet you. Not every encounter should be embraced. Spread good influence widely but be careful about what you allow to enter your inner sanctum.',
    timing: 'Encounter energy - when the unexpected approaches',
    changingLinesMeanings: [
      'Line 1: It must be checked with a brake of bronze. Perseverance brings good fortune. If one lets it take its course, one experiences misfortune. Control the intrusion.',
      'Line 2: There is a fish in the tank. No blame. Does not further guests. Contain what has entered.',
      'Line 3: There is no skin on their thighs, and walking comes hard. If one is mindful of the danger, no great mistake is made. Awareness of difficulty.',
      'Line 4: No fish in the tank. This leads to misfortune. Loss of containment.',
      'Line 5: A melon covered with willow leaves. Hidden lines. Then it drops down to one from heaven. Concealed blessing.',
      'Line 6: Coming to meet with the horns. Humiliation. No blame. Aggressive meeting.'
    ],
    elementalResonance: elem(0.6, 0.5, 0.4, 0.7, 0.5),
    archetypeCorrespondence: 'The Discerner / The Watchful One',
    oppositeHexagram: 24,
    reverseHexagram: 43,
    complementHexagram: 24
  },

  // ============== HEXAGRAM 45: CUI - GATHERING TOGETHER ==============
  {
    number: 45,
    name: 'Cui',
    chineseName: '萃',
    englishName: 'Gathering Together',
    keyword: 'Assembly',
    lines: ['yin', 'yang', 'yang', 'yin', 'yin', 'yin'],
    trigrams: { upper: 'lake', lower: 'earth' },
    nuclear: { upper: 'wind', lower: 'mountain' },
    judgment: 'Gathering Together. Success. The king approaches their temple. It furthers one to see the great person. This brings success. Perseverance furthers. To bring great offerings creates good fortune. It furthers one to undertake something.',
    image: 'Over the earth, the lake: the image of Gathering Together. Thus the superior person renews their weapons in order to meet the unforeseen.',
    soulInterpretation: 'People gather like water collecting in a lake. This is the time for assembly around a sacred center. The soul seeks communion with others who share the vision.',
    guidance: 'Gather with those who share your purpose. Make offerings to what is sacred. Prepare for the unexpected even in times of gathering. A leader is needed to unite the assembly.',
    timing: 'Gathering energy - assembly around sacred purpose',
    changingLinesMeanings: [
      'Line 1: If you are sincere, but not to the end, there will sometimes be confusion, sometimes gathering together. If you call out, one grasp of the hand brings laughter. Regret not. Going is without blame. Mixed results.',
      'Line 2: Letting oneself be drawn brings good fortune and remains blameless. If one is sincere, it furthers to bring even a small offering. Sincere participation.',
      'Line 3: Gathering together amid sighs. Nothing that would further. Going is without blame. Slight humiliation. Uncomfortable gathering.',
      'Line 4: Great good fortune. No blame. Successful gathering.',
      'Line 5: In gathering together there is position. This does not constitute blame. If there are some who are not yet sincerely in the work, sublime and enduring perseverance is needed. Then remorse disappears. Official gathering.',
      'Line 6: Lamenting and sighing, floods of tears. No blame. Emotional release.'
    ],
    elementalResonance: elem(0.5, 0.6, 0.7, 0.5, 0.6),
    archetypeCorrespondence: 'The Gatherer / The Assembler',
    oppositeHexagram: 26,
    reverseHexagram: 46,
    complementHexagram: 26
  },

  // ============== HEXAGRAM 46: SHENG - PUSHING UPWARD ==============
  {
    number: 46,
    name: 'Sheng',
    chineseName: '升',
    englishName: 'Pushing Upward',
    keyword: 'Ascending',
    lines: ['yin', 'yin', 'yin', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'earth', lower: 'wind' },
    nuclear: { upper: 'thunder', lower: 'lake' },
    judgment: 'Pushing Upward has supreme success. One must see the great person. Fear not. Departure toward the south brings good fortune.',
    image: 'Within the earth, wood grows: the image of Pushing Upward. Thus the superior person of devoted character heaps up small things in order to achieve something high and great.',
    soulInterpretation: 'Like a plant pushing up through the earth, your growth is gradual but irresistible. The soul ascends through patient accumulation of small advances.',
    guidance: 'Rise steadily through consistent effort. Do not fear to seek out mentors. Each small step accumulates into significant ascent. Move toward warmth and light.',
    timing: 'Growth energy - steady upward movement',
    changingLinesMeanings: [
      'Line 1: Pushing upward that meets with confidence brings great good fortune. Welcome support.',
      'Line 2: If one is sincere, it furthers one to bring even a small offering. No blame. Humble effort.',
      'Line 3: One pushes upward into an empty city. Unopposed advance.',
      'Line 4: The king offers them to Mount Qi. Good fortune. No blame. Royal recognition.',
      'Line 5: Perseverance brings good fortune. One pushes upward by steps. Methodical ascent.',
      'Line 6: Pushing upward in darkness. It furthers to be unremittingly persevering. Blind faith.'
    ],
    elementalResonance: elem(0.5, 0.4, 0.7, 0.5, 0.6),
    archetypeCorrespondence: 'The Ascending One / The Persistent Grower',
    oppositeHexagram: 25,
    reverseHexagram: 45,
    complementHexagram: 25
  },

  // ============== HEXAGRAM 47: KUN - OPPRESSION ==============
  {
    number: 47,
    name: 'Kun',
    chineseName: '困',
    englishName: 'Oppression',
    keyword: 'Exhaustion',
    lines: ['yin', 'yang', 'yang', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'lake', lower: 'water' },
    nuclear: { upper: 'wind', lower: 'fire' },
    judgment: 'Oppression. Success. Perseverance. The great person brings about good fortune. No blame. When one has something to say, it is not believed.',
    image: 'There is no water in the lake: the image of Exhaustion. Thus the superior person stakes their life on following their will.',
    soulInterpretation: 'The lake is empty - exhaustion of resources. Yet the soul knows that this oppression will pass. Hold to your deepest truth even when no one believes you.',
    guidance: 'Words are useless now - only steadfast perseverance matters. Follow your will despite exhaustion. This is a test of inner resolve. Success comes through endurance.',
    timing: 'Drought energy - when resources are depleted',
    changingLinesMeanings: [
      'Line 1: One sits oppressed under a bare tree and strays into a gloomy valley. For three years one sees nothing. Lost and exhausted.',
      'Line 2: One is oppressed while at meat and drink. One receives visits from the lord. It furthers to offer sacrifice. Nourishment comes.',
      'Line 3: A person permits themselves to be oppressed by stone and leans on thorns and thistles. They enter their house and do not see their consort. Misfortune. Self-created trap.',
      'Line 4: Coming very slowly. One is oppressed in a golden carriage. Humiliation, but there is an end. Difficult help.',
      'Line 5: One is oppressed by officials. It furthers to make offerings and libations. Slow relief.',
      'Line 6: One is oppressed by creeping vines. One moves uncertainly and says, "Moving brings remorse." If one feels remorse, and sets forth, good fortune. Liberation through action.'
    ],
    elementalResonance: elem(0.4, 0.5, 0.5, 0.4, 0.4),
    archetypeCorrespondence: 'The Enduring One / The Exhausted',
    oppositeHexagram: 22,
    reverseHexagram: 48,
    complementHexagram: 22
  },

  // ============== HEXAGRAM 48: JING - THE WELL ==============
  {
    number: 48,
    name: 'Jing',
    chineseName: '井',
    englishName: 'The Well',
    keyword: 'Source',
    lines: ['yin', 'yang', 'yin', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'water', lower: 'wind' },
    nuclear: { upper: 'fire', lower: 'lake' },
    judgment: 'The Well. The town may be changed, but the well cannot be changed. It neither decreases nor increases. They come and go and draw from the well. If one gets down almost to the water but the rope does not go all the way, or the jug breaks, it brings misfortune.',
    image: 'Water over wood: the image of the Well. Thus the superior person encourages the people at their work and exhorts them to help one another.',
    soulInterpretation: 'The well is the unchanging source of nourishment. Though towns rise and fall, the well remains. Your soul has access to inexhaustible depths - draw from them fully.',
    guidance: 'Connect with your deepest source. The rope must reach all the way down, the vessel must be whole. Incomplete effort brings misfortune. Help others access the source.',
    timing: 'Deep source energy - accessing what is inexhaustible',
    changingLinesMeanings: [
      'Line 1: One does not drink the mud of the well. No animals come to an old well. Neglected source.',
      'Line 2: At the wellhole one shoots fishes. The jug is broken and leaks. Wasted effort.',
      'Line 3: The well is cleaned, but no one drinks from it. This is my heart\'s sorrow, for one might draw from it. If the king were clear-minded, good fortune might be enjoyed in common. Unappreciated resource.',
      'Line 4: The well is being lined. No blame. Maintenance work.',
      'Line 5: In the well there is a clear, cold spring from which one can drink. Accessible source.',
      'Line 6: One draws from the well without hindrance. It is dependable. Supreme good fortune. Unlimited access.'
    ],
    elementalResonance: elem(0.4, 0.8, 0.5, 0.4, 0.7),
    archetypeCorrespondence: 'The Well-Keeper / The Source',
    oppositeHexagram: 21,
    reverseHexagram: 47,
    complementHexagram: 21
  },

  // ============== HEXAGRAM 49: GE - REVOLUTION ==============
  {
    number: 49,
    name: 'Ge',
    chineseName: '革',
    englishName: 'Revolution',
    keyword: 'Transformation',
    lines: ['yang', 'yin', 'yang', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'lake', lower: 'fire' },
    nuclear: { upper: 'heaven', lower: 'wind' },
    judgment: 'Revolution. On your own day you are believed. Supreme success, furthering through perseverance. Remorse disappears.',
    image: 'Fire in the lake: the image of Revolution. Thus the superior person sets the calendar in order and makes the seasons clear.',
    soulInterpretation: 'Fire and water meet - radical transformation. The old order must change. This is not reform but revolution of consciousness. When the time is right, you will be believed.',
    guidance: 'Revolutionary change requires perfect timing. Wait for your day. When it comes, act decisively. Remove what is outdated. Establish new order based on natural principles.',
    timing: 'Revolution energy - when fundamental change is required',
    changingLinesMeanings: [
      'Line 1: Wrapped in the hide of a yellow cow. Restrained waiting.',
      'Line 2: When one\'s own day comes, one may create revolution. Starting brings good fortune. No blame. Right timing.',
      'Line 3: Starting brings misfortune. Perseverance brings danger. When talk of revolution has gone the round three times, one may commit oneself. Deliberate action.',
      'Line 4: Remorse disappears. People believe in them. Changing the form of government brings good fortune. Accepted change.',
      'Line 5: The great person changes like a tiger. Even before questioning the oracle, they are believed. Powerful transformation.',
      'Line 6: The superior person changes like a panther. The inferior person molts in the face. Starting brings misfortune. Dwelling in perseverance brings good fortune. Complete change.'
    ],
    elementalResonance: elem(0.7, 0.6, 0.4, 0.6, 0.7),
    archetypeCorrespondence: 'The Revolutionary / The Transformer',
    oppositeHexagram: 4,
    reverseHexagram: 50,
    complementHexagram: 4
  },

  // ============== HEXAGRAM 50: DING - THE CAULDRON ==============
  {
    number: 50,
    name: 'Ding',
    chineseName: '鼎',
    englishName: 'The Cauldron',
    keyword: 'Transformation Vessel',
    lines: ['yin', 'yang', 'yang', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'fire', lower: 'wind' },
    nuclear: { upper: 'lake', lower: 'heaven' },
    judgment: 'The Cauldron. Supreme good fortune. Success.',
    image: 'Fire over wood: the image of the Cauldron. Thus the superior person consolidates their fate by making their position correct.',
    soulInterpretation: 'The cauldron transforms raw materials into nourishment through the alchemy of fire. Your soul is a vessel for sacred transformation. What you put in, combined with fire, becomes something new.',
    guidance: 'You are the cauldron. What are you transforming? Attend to your vessel - keep it clean and properly placed. The fire of consciousness transforms what is raw into what is refined.',
    timing: 'Alchemical transformation energy - sacred cooking',
    changingLinesMeanings: [
      'Line 1: A ting with legs upturned. It furthers to remove stagnating stuff. Taking a concubine for the sake of a son. No blame. Cleaning out.',
      'Line 2: There is food in the ting. My comrades are envious, but they cannot harm me. Good fortune. Having substance.',
      'Line 3: The handle of the ting is altered. One is impeded in their way of life. The fat of the pheasant is not eaten. Once rain falls, remorse is exhausted. Good fortune comes in the end. Difficulty then resolution.',
      'Line 4: The legs of the ting are broken. The prince\'s meal is spilled and their person is soiled. Misfortune. Failure of vessel.',
      'Line 5: The ting has yellow handles, golden carrying rings. Perseverance furthers. Excellent vessel.',
      'Line 6: The ting has rings of jade. Great good fortune. Nothing that would not act to further. Perfect vessel.'
    ],
    elementalResonance: elem(0.7, 0.4, 0.5, 0.5, 0.8),
    archetypeCorrespondence: 'The Alchemist / The Vessel',
    oppositeHexagram: 3,
    reverseHexagram: 49,
    complementHexagram: 3
  },

  // ============== HEXAGRAM 51: ZHEN - THE AROUSING ==============
  {
    number: 51,
    name: 'Zhen',
    chineseName: '震',
    englishName: 'The Arousing',
    keyword: 'Thunder',
    lines: ['yang', 'yin', 'yin', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'thunder', lower: 'thunder' },
    nuclear: { upper: 'water', lower: 'mountain' },
    judgment: 'The Arousing brings success. The thunder comes - oh, oh! Laughing words - ha, ha! The thunder terrifies for a hundred miles, and they do not drop the sacrificial spoon and chalice.',
    image: 'Thunder repeated: the image of the Arousing. Thus in fear and trembling the superior person sets their life in order and examines themselves.',
    soulInterpretation: 'Spiritual awakening comes like thunder - sudden, powerful, and transformative. Your old self is being shaken awake. This shock is necessary for your evolution.',
    guidance: 'Don\'t resist the spiritual earthquake happening within you. The shock passes quickly if you maintain your inner center. Use this arousal to set your life in order.',
    timing: 'During thunderstorms or times of rapid change',
    changingLinesMeanings: [
      'Line 1: The shock comes - oh, oh! Then follow laughing words - ha, ha! Good fortune. Shock then relief.',
      'Line 2: The shock comes bringing danger. A hundred thousand times you lose your treasures and must climb the nine hills. Do not go in pursuit of them. After seven days you will get them back again. Loss and recovery.',
      'Line 3: The shock comes and makes one distraught. If shock spurs to action, one remains free of misfortune. Reactive action.',
      'Line 4: Shock is mired. Stuck in shock.',
      'Line 5: Shock goes hither and thither. Danger. Yet nothing at all is lost. Still there are things to be done. Repeated shock.',
      'Line 6: The shock brings ruin and terrified gazing around. Going ahead brings misfortune. If it has not yet touched one\'s own body but only the neighbor, there is no blame. Approaching danger.'
    ],
    elementalResonance: elem(0.7, 0.3, 0.4, 0.6, 0.5),
    archetypeCorrespondence: 'The Awakened / The Thunder Being',
    oppositeHexagram: 57,
    reverseHexagram: 52,
    complementHexagram: 57
  },

  // ============== HEXAGRAM 52: GEN - KEEPING STILL ==============
  {
    number: 52,
    name: 'Gen',
    chineseName: '艮',
    englishName: 'Keeping Still',
    keyword: 'Stillness',
    lines: ['yin', 'yin', 'yang', 'yin', 'yin', 'yang'],
    trigrams: { upper: 'mountain', lower: 'mountain' },
    nuclear: { upper: 'thunder', lower: 'water' },
    judgment: 'Keeping Still. Keeping their back still so that they no longer feel their body. They go into their courtyard and do not see their people. No blame.',
    image: 'Mountains standing close together: the image of Keeping Still. Thus the superior person does not permit their thoughts to go beyond their situation.',
    soulInterpretation: 'Mountain upon mountain - absolute stillness. The soul finds peace in stopping the endless movement of thought. True meditation is keeping still.',
    guidance: 'Stop. Be still. Don\'t let thoughts wander beyond what is immediately present. This is the gate to true meditation. When stillness is complete, you become invisible even to yourself.',
    timing: 'Deep meditation energy - complete stopping',
    changingLinesMeanings: [
      'Line 1: Keeping their toes still. No blame. Continued perseverance furthers. Beginning stillness.',
      'Line 2: Keeping their calves still. They cannot rescue the one they follow. Their heart is not glad. Can\'t help another.',
      'Line 3: Keeping their hips still. Making their sacrum stiff. Dangerous. The heart suffocates. Forced stillness.',
      'Line 4: Keeping their trunk still. No blame. Centered stillness.',
      'Line 5: Keeping their jaws still. The words have order. Remorse disappears. Quiet speech.',
      'Line 6: Noble-hearted keeping still. Good fortune. Complete stillness.'
    ],
    elementalResonance: elem(0.3, 0.4, 0.8, 0.4, 0.7),
    archetypeCorrespondence: 'The Mountain / The Meditator',
    oppositeHexagram: 58,
    reverseHexagram: 51,
    complementHexagram: 58
  },

  // ============== HEXAGRAM 53: JIAN - DEVELOPMENT ==============
  {
    number: 53,
    name: 'Jian',
    chineseName: '漸',
    englishName: 'Development',
    keyword: 'Gradual Progress',
    lines: ['yang', 'yang', 'yin', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'wind', lower: 'mountain' },
    nuclear: { upper: 'fire', lower: 'water' },
    judgment: 'Development. The maiden is given in marriage. Good fortune. Perseverance furthers.',
    image: 'On the mountain, a tree: the image of Development. Thus the superior person abides in dignity and virtue in order to improve the mores.',
    soulInterpretation: 'Like a tree growing on a mountain, development is gradual but certain. The soul matures through patient cultivation, not sudden leaps.',
    guidance: 'Proceed step by step. Each stage must be completed before the next begins. Genuine development takes time but produces lasting results. Do not rush the process.',
    timing: 'Gradual development energy - step-by-step growth',
    changingLinesMeanings: [
      'Line 1: The wild goose gradually draws near the shore. The young son is in danger. There is talk. No blame. Beginning approach.',
      'Line 2: The wild goose gradually draws near the cliff. Eating and drinking in peace and concord. Good fortune. Secure position.',
      'Line 3: The wild goose gradually draws near the plateau. The husband goes forth and does not return. The wife is pregnant but does not give birth. Misfortune. It furthers to fight off robbers. Blocked development.',
      'Line 4: The wild goose gradually draws near the tree. Perhaps it will find a flat branch. No blame. Temporary rest.',
      'Line 5: The wild goose gradually draws near the summit. For three years the woman has no child. In the end nothing can prevent them. Good fortune. Delayed fruition.',
      'Line 6: The wild goose gradually draws near the cloud heights. Their feathers can be used for the sacred dance. Good fortune. Transcendent arrival.'
    ],
    elementalResonance: elem(0.5, 0.4, 0.6, 0.6, 0.6),
    archetypeCorrespondence: 'The Gradual Developer / The Patient One',
    oppositeHexagram: 54,
    reverseHexagram: 54,
    complementHexagram: 54
  },

  // ============== HEXAGRAM 54: GUI MEI - THE MARRYING MAIDEN ==============
  {
    number: 54,
    name: 'Gui Mei',
    chineseName: '歸妹',
    englishName: 'The Marrying Maiden',
    keyword: 'Subordinate Position',
    lines: ['yin', 'yin', 'yang', 'yin', 'yang', 'yang'],
    trigrams: { upper: 'thunder', lower: 'lake' },
    nuclear: { upper: 'water', lower: 'fire' },
    judgment: 'The Marrying Maiden. Undertakings bring misfortune. Nothing that would further.',
    image: 'Thunder over the lake: the image of the Marrying Maiden. Thus the superior person understands the transitory in the light of the eternity of the end.',
    soulInterpretation: 'This is an improper situation - attraction without proper foundation. The soul must understand that not all unions are right, not all attractions should be followed.',
    guidance: 'Recognize when you are in a subordinate position without proper authority. Do not initiate now. Understand that this situation is temporary. See the eternal beyond the momentary.',
    timing: 'Improper situation energy - holding back from wrong action',
    changingLinesMeanings: [
      'Line 1: The marrying maiden as a concubine. A lame person who is able to tread. Undertakings bring good fortune. Accepting lesser role.',
      'Line 2: A one-eyed person who is able to see. The perseverance of a solitary person furthers. Limited capacity.',
      'Line 3: The marrying maiden as a slave. They marry as a concubine. Reduced position.',
      'Line 4: The marrying maiden draws out the allotted time. A late marriage comes in due course. Delayed fulfillment.',
      'Line 5: The sovereign gave their daughter in marriage. The embroidered garments of the princess were not as gorgeous as those of the serving maid. The moon that is nearly full brings good fortune. Humble splendor.',
      'Line 6: The woman holds the basket, but there are no fruits in it. The man stabs the sheep, but no blood flows. Nothing that acts to further. Empty ritual.'
    ],
    elementalResonance: elem(0.5, 0.5, 0.4, 0.5, 0.4),
    archetypeCorrespondence: 'The Secondary / The Subordinate',
    oppositeHexagram: 53,
    reverseHexagram: 53,
    complementHexagram: 53
  },

  // ============== HEXAGRAM 55: FENG - ABUNDANCE ==============
  {
    number: 55,
    name: 'Feng',
    chineseName: '豐',
    englishName: 'Abundance',
    keyword: 'Fullness',
    lines: ['yang', 'yin', 'yang', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'thunder', lower: 'fire' },
    nuclear: { upper: 'lake', lower: 'wind' },
    judgment: 'Abundance has success. The king attains abundance. Be not sad. Be like the sun at midday.',
    image: 'Both thunder and lightning come: the image of Abundance. Thus the superior person decides lawsuits and carries out punishments.',
    soulInterpretation: 'Thunder and lightning together - peak power and illumination. This is the zenith, the full sun. The soul knows that fullness cannot last but must be fully lived.',
    guidance: 'Live fully in this moment of abundance. Do not mourn its passing while it is here. Be like the sun at noon - shine without reservation. Make decisive judgments.',
    timing: 'Peak fullness energy - maximum yang before decline',
    changingLinesMeanings: [
      'Line 1: When they meet their destined ruler, they can be together ten days, and it is not a mistake. Going meets with recognition. Brief fullness.',
      'Line 2: The curtain is of such fullness that the polestars can be seen at noon. Through going one meets with mistrust and hate. If one rouses them through truth, good fortune. Obscured clarity.',
      'Line 3: The underbrush is of such abundance that the small stars can be seen at noon. They break their right arm. No blame. Severe limitation.',
      'Line 4: The curtain is of such fullness that the polestars can be seen at noon. They meet their ruler, who is of like kind. Good fortune. Finding equal.',
      'Line 5: Lines are coming. Blessing and fame draw near. Good fortune. Recognition coming.',
      'Line 6: Their house is in a state of abundance. They screen off their family. They peer through the gate and no longer perceive anyone. For three years they see nothing. Misfortune. Self-isolation.'
    ],
    elementalResonance: elem(0.8, 0.4, 0.4, 0.6, 0.6),
    archetypeCorrespondence: 'The Abundant / The Full Sun',
    oppositeHexagram: 59,
    reverseHexagram: 56,
    complementHexagram: 59
  },

  // ============== HEXAGRAM 56: LU - THE WANDERER ==============
  {
    number: 56,
    name: 'Lu',
    chineseName: '旅',
    englishName: 'The Wanderer',
    keyword: 'Travel',
    lines: ['yin', 'yin', 'yang', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'fire', lower: 'mountain' },
    nuclear: { upper: 'lake', lower: 'wind' },
    judgment: 'The Wanderer. Success through smallness. Perseverance brings good fortune to the wanderer.',
    image: 'Fire on the mountain: the image of the Wanderer. Thus the superior person is clear-minded and cautious in imposing penalties.',
    soulInterpretation: 'Fire on the mountain does not stay long - the wanderer passes through. The soul in this phase has no fixed abode. Travel light, stay alert, do not linger.',
    guidance: 'Remain modest and careful in your wandering. Do not seek to establish permanent residence. Keep your actions small and appropriate. Be just but not harsh with yourself and others.',
    timing: 'Traveling energy - when passing through',
    changingLinesMeanings: [
      'Line 1: If the wanderer busies themselves with trivial things, they draw down misfortune upon themselves. Small concerns.',
      'Line 2: The wanderer comes to an inn. They have their property with them. They win the steadfastness of a young servant. Secure travel.',
      'Line 3: The wanderer\'s inn burns down. They lose the steadfastness of their young servant. Danger. Loss of base.',
      'Line 4: The wanderer rests in a shelter. They obtain their property and an ax. My heart is not glad. Provisional security.',
      'Line 5: They shoot a pheasant. It drops with the first arrow. In the end this brings both praise and office. Success in travel.',
      'Line 6: The bird\'s nest burns up. The wanderer laughs at first, then must needs lament and weep. Through carelessness they lose the cow. Misfortune. Total loss.'
    ],
    elementalResonance: elem(0.6, 0.4, 0.5, 0.6, 0.5),
    archetypeCorrespondence: 'The Wanderer / The Pilgrim',
    oppositeHexagram: 60,
    reverseHexagram: 55,
    complementHexagram: 60
  },

  // ============== HEXAGRAM 57: XUN - THE GENTLE ==============
  {
    number: 57,
    name: 'Xun',
    chineseName: '巽',
    englishName: 'The Gentle',
    keyword: 'Penetration',
    lines: ['yin', 'yang', 'yang', 'yin', 'yang', 'yang'],
    trigrams: { upper: 'wind', lower: 'wind' },
    nuclear: { upper: 'fire', lower: 'lake' },
    judgment: 'The Gentle. Success through what is small. It furthers one to have somewhere to go. It furthers one to see the great person.',
    image: 'Winds following one upon the other: the image of the Gently Penetrating. Thus the superior person spreads their commands abroad and carries out their undertakings.',
    soulInterpretation: 'Wind upon wind - gentle but persistent influence. The soul works through subtle penetration, not force. Your words and presence carry healing energy to others.',
    guidance: 'Speak your truth with gentle persistence. Your spiritual influence grows through consistent, loving action. Small steady effort achieves great results.',
    timing: 'During gentle breezes or calm, flowing periods',
    changingLinesMeanings: [
      'Line 1: In advancing and in retreating, the perseverance of a warrior furthers. Disciplined flexibility.',
      'Line 2: Penetration under the bed. Priests and magicians are used in great number. Good fortune. No blame. Deep investigation.',
      'Line 3: Repeated penetration. Humiliation. Too much.',
      'Line 4: Remorse vanishes. During the hunt three kinds of game are caught. Successful pursuit.',
      'Line 5: Perseverance brings good fortune. Remorse vanishes. Nothing that does not further. No beginning, but an end. Before the change, three days. After the change, three days. Good fortune. Thorough transformation.',
      'Line 6: Penetration under the bed. They lose their property and their ax. Perseverance brings misfortune. Excessive penetration.'
    ],
    elementalResonance: elem(0.5, 0.4, 0.4, 0.8, 0.6),
    archetypeCorrespondence: 'The Gentle Influencer / The Wind',
    oppositeHexagram: 51,
    reverseHexagram: 58,
    complementHexagram: 51
  },

  // ============== HEXAGRAM 58: DUI - THE JOYOUS ==============
  {
    number: 58,
    name: 'Dui',
    chineseName: '兌',
    englishName: 'The Joyous',
    keyword: 'Joy',
    lines: ['yang', 'yang', 'yin', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'lake', lower: 'lake' },
    nuclear: { upper: 'wind', lower: 'fire' },
    judgment: 'The Joyous. Success. Perseverance is favorable.',
    image: 'Lakes resting one on the other: the image of the Joyous. Thus the superior person joins with friends for discussion and practice.',
    soulInterpretation: 'Lake upon lake - joy doubled through sharing. The soul finds its deepest happiness in communion with kindred spirits. True joy is not solitary.',
    guidance: 'Share your joy with others. Join with friends for spiritual discussion and practice. Joy that comes from the right source is self-perpetuating. Cultivate inner cheerfulness.',
    timing: 'Gathering joy energy - celebration and fellowship',
    changingLinesMeanings: [
      'Line 1: Contented joyousness. Good fortune. Innocent joy.',
      'Line 2: Sincere joyousness. Good fortune. Remorse disappears. True joy.',
      'Line 3: Coming joyousness. Misfortune. Seeking joy from outside.',
      'Line 4: Joyousness that is weighed is not at peace. After ridding themselves of mistakes a person has joy. Discerning joy.',
      'Line 5: Sincerity toward disintegrating influences is dangerous. Threatened joy.',
      'Line 6: Seductive joyousness. Dangerous allure.'
    ],
    elementalResonance: elem(0.6, 0.6, 0.4, 0.6, 0.7),
    archetypeCorrespondence: 'The Joyful / The Lake',
    oppositeHexagram: 52,
    reverseHexagram: 57,
    complementHexagram: 52
  },

  // ============== HEXAGRAM 59: HUAN - DISPERSION ==============
  {
    number: 59,
    name: 'Huan',
    chineseName: '渙',
    englishName: 'Dispersion',
    keyword: 'Dissolving',
    lines: ['yang', 'yang', 'yin', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'wind', lower: 'water' },
    nuclear: { upper: 'mountain', lower: 'thunder' },
    judgment: 'Dispersion. Success. The king approaches their temple. It furthers one to cross the great water. Perseverance furthers.',
    image: 'The wind drives over the water: the image of Dispersion. Thus the kings of old sacrificed to the Lord and built temples.',
    soulInterpretation: 'Wind over water creates dissolution - rigid structures break apart. The soul must sometimes disperse its fixed patterns to reconnect with the sacred.',
    guidance: 'Let what is rigid dissolve. Approach the sacred through ritual and devotion. This is a good time to cross into new territory. Disperse selfishness through spiritual practice.',
    timing: 'Dissolution energy - breaking up rigidity',
    changingLinesMeanings: [
      'Line 1: They bring help with the strength of a horse. Good fortune. Strong intervention.',
      'Line 2: At the dissolution they hurry to that which supports. Remorse disappears. Finding support.',
      'Line 3: They dissolve their self. No remorse. Selflessness.',
      'Line 4: They dissolve their bond with their group. Supreme good fortune. Dispersion brings accumulation. Something that ordinary people do not think of. Transcendent view.',
      'Line 5: Their loud cries are as dissolving as sweat. Dissolution! A king abides without blame. Cathartic release.',
      'Line 6: They dissolve their blood. Departing, keeping at a distance, going out, is without blame. Avoiding conflict.'
    ],
    elementalResonance: elem(0.5, 0.6, 0.4, 0.7, 0.6),
    archetypeCorrespondence: 'The Dissolver / The Liberator',
    oppositeHexagram: 55,
    reverseHexagram: 60,
    complementHexagram: 55
  },

  // ============== HEXAGRAM 60: JIE - LIMITATION ==============
  {
    number: 60,
    name: 'Jie',
    chineseName: '節',
    englishName: 'Limitation',
    keyword: 'Restraint',
    lines: ['yin', 'yang', 'yin', 'yang', 'yang', 'yin'],
    trigrams: { upper: 'water', lower: 'lake' },
    nuclear: { upper: 'mountain', lower: 'thunder' },
    judgment: 'Limitation. Success. Galling limitation must not be persevered in.',
    image: 'Water over lake: the image of Limitation. Thus the superior person creates number and measure, and examines the nature of virtue and correct conduct.',
    soulInterpretation: 'The lake can only hold so much water. Natural limits exist. The soul must know its boundaries and work within them rather than against them.',
    guidance: 'Accept natural limitations. Create structure and measure in your life. Do not persist in painful restriction, but embrace necessary constraints. Know your limits.',
    timing: 'Boundary-setting energy - establishing proper limits',
    changingLinesMeanings: [
      'Line 1: Not going out of the door and the courtyard is without blame. Knowing limits.',
      'Line 2: Not going out of the gate and the courtyard brings misfortune. Missing opportunity.',
      'Line 3: Those who know no limitation will have cause to lament. No blame. Learning limits.',
      'Line 4: Contented limitation. Success. Natural restraint.',
      'Line 5: Sweet limitation brings good fortune. Going brings esteem. Graceful limits.',
      'Line 6: Galling limitation. Perseverance brings misfortune. Remorse disappears. Harsh limits must end.'
    ],
    elementalResonance: elem(0.4, 0.6, 0.6, 0.4, 0.5),
    archetypeCorrespondence: 'The Bounded / The Disciplined',
    oppositeHexagram: 56,
    reverseHexagram: 59,
    complementHexagram: 56
  },

  // ============== HEXAGRAM 61: ZHONG FU - INNER TRUTH ==============
  {
    number: 61,
    name: 'Zhong Fu',
    chineseName: '中孚',
    englishName: 'Inner Truth',
    keyword: 'Sincerity',
    lines: ['yang', 'yang', 'yin', 'yin', 'yang', 'yang'],
    trigrams: { upper: 'wind', lower: 'lake' },
    nuclear: { upper: 'mountain', lower: 'thunder' },
    judgment: 'Inner Truth. Pigs and fishes. Good fortune. It furthers one to cross the great water. Perseverance furthers.',
    image: 'Wind over lake: the image of Inner Truth. Thus the superior person discusses criminal cases in order to delay executions.',
    soulInterpretation: 'The wind moves the surface of the lake - inner truth influences even the least conscious. Sincerity reaches everywhere, like wind on water.',
    guidance: 'Inner truth is felt even by those who cannot understand words. Be sincere to your core. This truth can move the most obstinate beings. Cross into new territory with confidence.',
    timing: 'Deep sincerity energy - truth that reaches all levels',
    changingLinesMeanings: [
      'Line 1: Being prepared brings good fortune. If there are secret designs, it is disquieting. True preparation.',
      'Line 2: A crane calling in the shade. Its young answers it. I have a good goblet. I will share it with you. Resonance.',
      'Line 3: They find a comrade. Now they beat the drum, now they stop. Now they sob, now they sing. Emotional fluctuation.',
      'Line 4: The moon nearly at the full. The team horse goes astray. No blame. Near completion.',
      'Line 5: They possess truth, which links together. No blame. Binding truth.',
      'Line 6: Cockcrow penetrating to heaven. Perseverance brings misfortune. Overreaching.'
    ],
    elementalResonance: elem(0.5, 0.5, 0.5, 0.7, 0.8),
    archetypeCorrespondence: 'The Sincere / The Truth-Bearer',
    oppositeHexagram: 62,
    reverseHexagram: 62,
    complementHexagram: 62
  },

  // ============== HEXAGRAM 62: XIAO GUO - SMALL EXCEEDING ==============
  {
    number: 62,
    name: 'Xiao Guo',
    chineseName: '小過',
    englishName: 'Preponderance of the Small',
    keyword: 'Small Excess',
    lines: ['yin', 'yin', 'yang', 'yang', 'yin', 'yin'],
    trigrams: { upper: 'thunder', lower: 'mountain' },
    nuclear: { upper: 'lake', lower: 'wind' },
    judgment: 'Preponderance of the Small. Success. Perseverance furthers. Small things may be done; great things should not be done. The flying bird brings the message: It is not well to strive upward, it is well to remain below. Great good fortune.',
    image: 'Thunder on the mountain: the image of Preponderance of the Small. Thus in their conduct the superior person gives preponderance to reverence. In bereavement they give preponderance to grief. In their expenditures they give preponderance to thrift.',
    soulInterpretation: 'Thunder on the mountain - small things exceed. This is a time when only modest action is appropriate. The bird flies but should not soar too high.',
    guidance: 'Attend carefully to small matters. Do not attempt great things. Stay close to the ground. Be reverent, grieve fully, spend carefully. Excessive humility is appropriate now.',
    timing: 'Small matters energy - when modesty exceeds',
    changingLinesMeanings: [
      'Line 1: The bird meets with misfortune through flying. Overreaching.',
      'Line 2: She passes by her ancestor and meets her ancestress. She does not reach her prince and meets the official. No blame. Indirect approach.',
      'Line 3: If one is not extremely careful, somebody may come from behind and strike them. Misfortune. Vulnerability.',
      'Line 4: No blame. They meet them without passing by. Going brings danger. One must be on guard. Do not act. Perseverance is necessary. Watchful waiting.',
      'Line 5: Dense clouds, no rain from our western territory. The prince shoots and hits the one in the cave. Potential unfulfilled.',
      'Line 6: They pass them by, not meeting them. The flying bird leaves them. Misfortune. This means bad luck and injury. Missing connection.'
    ],
    elementalResonance: elem(0.5, 0.4, 0.6, 0.5, 0.5),
    archetypeCorrespondence: 'The Modest / The Careful One',
    oppositeHexagram: 61,
    reverseHexagram: 61,
    complementHexagram: 61
  },

  // ============== HEXAGRAM 63: JI JI - AFTER COMPLETION ==============
  {
    number: 63,
    name: 'Ji Ji',
    chineseName: '既濟',
    englishName: 'After Completion',
    keyword: 'Accomplished',
    lines: ['yin', 'yang', 'yin', 'yang', 'yin', 'yang'],
    trigrams: { upper: 'water', lower: 'fire' },
    nuclear: { upper: 'fire', lower: 'water' },
    judgment: 'After Completion. Success in small matters. Perseverance furthers. At the beginning good fortune, at the end disorder.',
    image: 'Water over fire: the image of the condition after completion. Thus the superior person takes thought of misfortune and arms themselves against it in advance.',
    soulInterpretation: 'All lines are in their proper places - perfect balance achieved. Yet this perfection is the beginning of decline. The soul must remain vigilant at the moment of completion.',
    guidance: 'The task is complete but dangers remain. Success in small matters only now. Prepare for the disorder that follows completion. Stay alert at the moment of achievement.',
    timing: 'Perfect balance energy - the peak before decline',
    changingLinesMeanings: [
      'Line 1: They brake their wheels. They get their tail in the water. No blame. Cautious start.',
      'Line 2: The woman loses the curtain of her carriage. Do not run after it; on the seventh day you will get it. Loss recovered.',
      'Line 3: The Illustrious Ancestor disciplines the Devil\'s Country. After three years they conquer it. Inferior people must not be employed. Great undertaking.',
      'Line 4: The finest clothes turn to rags. Be careful all day long. Decline begins.',
      'Line 5: The neighbor in the east who slaughters an ox does not attain as much real happiness as the neighbor in the west with their small offering. Sincere simplicity.',
      'Line 6: They get their head in the water. Danger. Complete submersion.'
    ],
    elementalResonance: elem(0.5, 0.6, 0.5, 0.5, 0.5),
    archetypeCorrespondence: 'The Completed / The Balanced',
    oppositeHexagram: 64,
    reverseHexagram: 64,
    complementHexagram: 64
  },

  // ============== HEXAGRAM 64: WEI JI - BEFORE COMPLETION ==============
  {
    number: 64,
    name: 'Wei Ji',
    chineseName: '未濟',
    englishName: 'Before Completion',
    keyword: 'Not Yet',
    lines: ['yang', 'yin', 'yang', 'yin', 'yang', 'yin'],
    trigrams: { upper: 'fire', lower: 'water' },
    nuclear: { upper: 'water', lower: 'fire' },
    judgment: 'Before Completion. Success. But if the little fox, after nearly completing the crossing, gets its tail in the water, there is nothing that would further.',
    image: 'Fire over water: the image of the condition before transition. Thus the superior person is careful in the differentiation of things, so that each finds its place.',
    soulInterpretation: 'All lines are out of place yet full of potential. The journey is not yet complete but completion is possible. The soul stands at the threshold of a new cycle.',
    guidance: 'You are almost there but not yet complete. Be careful at the final crossing. Each thing must find its proper place. Do not celebrate before the work is done.',
    timing: 'Threshold energy - the moment before completion',
    changingLinesMeanings: [
      'Line 1: They get their tail in the water. Humiliating. Premature action.',
      'Line 2: They brake their wheels. Perseverance brings good fortune. Deliberate pause.',
      'Line 3: Before completion, attack brings misfortune. It furthers to cross the great water. Not ready yet.',
      'Line 4: Perseverance brings good fortune. Remorse disappears. Shock, thus to discipline the Devil\'s Country. For three years, great realms are awarded. Sustained effort.',
      'Line 5: Perseverance brings good fortune. No remorse. The light of the superior person is true. Good fortune. True illumination.',
      'Line 6: There is drinking of wine in genuine confidence. No blame. But if one wets their head, they lose it, in truth. Premature celebration dangerous.'
    ],
    elementalResonance: elem(0.6, 0.5, 0.4, 0.5, 0.6),
    archetypeCorrespondence: 'The Threshold Crosser / The Uncompleted',
    oppositeHexagram: 63,
    reverseHexagram: 63,
    complementHexagram: 63
  }
];

/**
 * Get hexagram by number (1-64)
 */
export function getHexagram(number: number): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.number === number);
}

/**
 * Get hexagram by trigram combination
 */
export function getHexagramByTrigrams(upper: TrigramKey, lower: TrigramKey): Hexagram | undefined {
  return HEXAGRAMS.find(h => h.trigrams.upper === upper && h.trigrams.lower === lower);
}

/**
 * Get all hexagrams for a given upper trigram
 */
export function getHexagramsByUpperTrigram(upper: TrigramKey): Hexagram[] {
  return HEXAGRAMS.filter(h => h.trigrams.upper === upper);
}

/**
 * Get all hexagrams for a given lower trigram
 */
export function getHexagramsByLowerTrigram(lower: TrigramKey): Hexagram[] {
  return HEXAGRAMS.filter(h => h.trigrams.lower === lower);
}

/**
 * Get hexagram count
 */
export function getHexagramCount(): number {
  return HEXAGRAMS.length;
}

export default HEXAGRAMS;
