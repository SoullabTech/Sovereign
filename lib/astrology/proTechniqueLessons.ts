/**
 * ASTRO-PRO-TRAINING-01 — a Techniques track for Pro Study: one lesson per
 * Pro tool. Static teaching only: what the technique computes, how to
 * practise it in Pro, a self-check, and what it does not establish.
 * No model call, no stored answers, no scoring of the learner.
 * Interpretive statements are attributed to tradition or to schools.
 */

export interface TechniqueLesson {
  id: string;
  title: string;
  level: string;
  concept: string;
  points: string[];
  practice: string[];
  check: { question: string; answer: string };
  boundary: string;
}

export const TECHNIQUE_LESSONS: readonly TechniqueLesson[] = [
  {
    id: 'astrocartography', title: 'Astrocartography', level: 'Place',
    concept: 'An astro map shows, for one moment, every place on Earth where each planet stood on one of the four angles: culminating (MC), anti-culminating (IC), rising (Ascendant) or setting (Descendant).',
    points: [
      'MC and IC lines run straight north–south. Whether a planet is on the meridian depends only on longitude (local sidereal time), not on latitude.',
      'Ascendant and Descendant lines curve. Whether a planet is on the horizon depends on latitude and on the planet’s declination.',
      'Near the poles a high-declination planet may never rise or set, so its rising and setting lines stop; Pro breaks the line there instead of inventing it.',
      'Schools differ on how far a line’s influence reaches; distances of a few hundred kilometres are a common convention, not a measured quantity.',
    ],
    practice: [
      'Open a chart, then Astro map & relocation → Draw astro map.',
      'Turn off every planet except one and find its four lines: solid MC, short-dash IC, long-dash Ascendant, dotted Descendant.',
      'Click a point right on that planet’s Ascendant line. In the relocated chart, check that the planet sits on or very near the Ascendant.',
      'Find a crossing of two lines (a “paran” point in some schools) and relocate there to see both planets angular.',
    ],
    check: {
      question: 'Why are MC and IC lines straight north–south while Ascendant lines curve?',
      answer: 'Meridian passage depends only on longitude, so every latitude along that longitude shares it. Rising depends on latitude and declination together, which bends the line.',
    },
    boundary: 'The lines are geometry for one instant. Readings of what it is like to live or travel on a line come from astrological tradition and vary by school; they are not predictions.',
  },
  {
    id: 'relocation', title: 'Relocated charts', level: 'Place',
    concept: 'A relocated chart keeps the moment of birth and changes only the place. Planet positions in the zodiac stay the same; the angles and house cusps move.',
    points: [
      'A planet keeps its sign and degree in every relocated chart; only its house can change.',
      'Moving east or west mostly rotates the angles; moving north or south mainly changes house sizes.',
      'Pro relocates between 66° N and 66° S, where its house calculations have been checked.',
    ],
    practice: [
      'Open a chart and note the Sun’s sign, degree and house.',
      'Relocate to a city far to the east, then far to the west.',
      'Confirm the Sun’s sign and degree never change while its house and the Ascendant do.',
    ],
    check: {
      question: 'What changes between a natal chart and the same chart relocated?',
      answer: 'The angles (Ascendant, Midheaven) and house cusps, and therefore planets’ house placements. Zodiac positions do not change.',
    },
    boundary: 'Relocation is a recalculation, not a forecast. Some astrologers read relocated charts for residence, others only for travel; that is a choice of school.',
  },
  {
    id: 'transits', title: 'Transits and the timeline', level: 'Time',
    concept: 'A transit compares the sky at another moment with the natal chart. A hit is exact when a moving planet reaches an aspect angle to a natal point.',
    points: [
      'Faster planets make brief contacts; slower planets make long ones.',
      'Because of retrograde motion, a slow planet can cross the same natal point three times: direct, retrograde, then direct again.',
      'Orb choices for transits are conventions; Pro lets you filter from 1° to 8°.',
    ],
    practice: [
      'Open Transits and press Now; read the outer ring against the natal wheel.',
      'Use Play ▶▶ with a 1-week step and watch the slow planets.',
      'Open Ephemeris & timeline for 24 months and find a planet listed three times against the same natal point, with ℞ on the middle pass.',
    ],
    check: {
      question: 'Why does the timeline sometimes list the same transit three times?',
      answer: 'The planet passes the point, turns apparently retrograde and passes it again, then goes direct and passes it a third time.',
    },
    boundary: 'A transit is a timing of geometry. What it is said to bring is tradition, read differently by different schools.',
  },
  {
    id: 'progressions', title: 'Secondary progressions', level: 'Time',
    concept: 'Secondary progression treats each day after birth as one year of life. The progressed chart for age 30 is cast for 30 days after birth, at the birth place.',
    points: [
      'The progressed Sun moves about one degree per year.',
      'The progressed Moon moves about 12–15° per year, so it changes sign roughly every two and a half years.',
      'Progressed planets can change direction; a progressed station can last years.',
    ],
    practice: [
      'Open Progressions & returns, choose Progressed chart, and set today’s date.',
      'Use Show as outer ring to see the progressed planets around the natal chart.',
      'Change the date by a year and watch how little the progressed Sun moves compared with the progressed Moon.',
    ],
    check: {
      question: 'About how far does the progressed Sun move in 30 years?',
      answer: 'About 30°, roughly one sign.',
    },
    boundary: 'Progression is a symbolic timing method, not an astronomical event in the present sky.',
  },
  {
    id: 'returns', title: 'Solar, lunar and planetary returns', level: 'Time',
    concept: 'A return is the exact moment a planet comes back to its natal longitude. The chart for that moment is read, in tradition, for the cycle it opens.',
    points: [
      'Solar return: once a year, within a day of the birthday.',
      'Lunar return: about every 27.3 days.',
      'Saturn return: about every 29.5 years, sometimes in several passes because of retrograde motion.',
      'Pro casts returns at the birth place. Some astrologers cast them where the person is at the time; you can compare with Relocate.',
    ],
    practice: [
      'Calculate the next Solar return and note how close it falls to the birthday.',
      'Calculate the next Lunar return, then the following one by moving the date a day past it.',
      'Calculate the Saturn return from a date about 28 years after birth.',
    ],
    check: {
      question: 'Why might a Saturn return have more than one exact moment?',
      answer: 'Saturn can go retrograde back over its natal degree and then forward again, crossing it up to three times.',
    },
    boundary: 'A return chart is a chart of a moment. Its use for a year or month ahead is a tradition, not a forecast.',
  },
  {
    id: 'comparison', title: 'Synastry and composite', level: 'Relationship',
    concept: 'Synastry compares two charts point by point. A composite builds a third chart from the midpoints of the two.',
    points: [
      'Synastry contacts are aspects between one chart’s planets and the other’s.',
      'Pro’s composite uses the midpoint method: each planet at the shorter-arc midpoint, with equal houses from the composite Ascendant.',
      'The Davison method, which uses a midpoint in time and place, is a different technique and gives a different chart.',
    ],
    practice: [
      'Save a chart for someone, with their permission, then open Compare and pick it.',
      'Read the contacts list at 3°, then at 1°.',
      'Switch to Composite and compare its Sun with each person’s Sun.',
    ],
    check: {
      question: 'Why does a composite chart have no birth moment?',
      answer: 'It is built from midpoints of two charts’ positions, not cast for a real time and place.',
    },
    boundary: 'No comparison measures a relationship’s worth or outcome. Use charts of others only with their consent.',
  },
  {
    id: 'declination', title: 'Declination and out-of-bounds', level: 'Geometry',
    concept: 'Declination measures how far north or south of the celestial equator a body is. It adds a second coordinate to the zodiac’s longitude.',
    points: [
      'Two bodies at the same declination on the same side are parallel; on opposite sides, contraparallel.',
      'In modern usage parallels are often read like conjunctions and contraparallels like oppositions.',
      'A body beyond the Sun’s greatest declination (about 23°26′) is called out of bounds.',
    ],
    practice: [
      'Open Aspect grid & declinations → Declinations.',
      'Find any parallels within 1°, then look for the same pair on the aspect grid.',
      'Note any planet marked Out of bounds; the Moon is the most common.',
    ],
    check: {
      question: 'Can the Sun itself be out of bounds?',
      answer: 'No. The Sun defines the bound.',
    },
    boundary: 'Declination is a measurement. Readings of parallels and out-of-bounds planets are modern tradition and vary by astrologer.',
  },
  {
    id: 'harmonics', title: 'Harmonics and the sidereal zodiac', level: 'Geometry',
    concept: 'A harmonic chart multiplies every longitude by a number. The sidereal zodiac measures from the fixed stars instead of the equinox.',
    points: [
      'In the 5th harmonic chart, a quintile (72°) becomes a conjunction, so the chart shows quintile patterns at a glance.',
      'The sidereal zodiac today differs from the tropical by about 24° (the ayanamsa). Pro uses Lahiri.',
      'The sidereal view keeps houses and aspects; only sign labels shift.',
    ],
    practice: [
      'Open Chart points & views → Harmonic, set 5, and look for conjunctions.',
      'Check those planets in the natal chart: they should be about 72° or 144° apart.',
      'Switch to Sidereal and see how many planets change sign.',
    ],
    check: {
      question: 'Two planets are conjunct in the 4th harmonic chart. What was their natal angle?',
      answer: 'A multiple of 90°: 0°, 90° or 180°.',
    },
    boundary: 'Harmonics and zodiacs are frames of measurement. Which frame is “right” is a question of tradition, not of calculation.',
  },
  {
    id: 'dignity', title: 'Dignity, points and reports', level: 'Tradition',
    concept: 'Essential dignity is the classical table of where each planet is said to act most or least freely. Lots and the Vertex are calculated sensitive points.',
    points: [
      'Domicile and exaltation are the strong dignities; detriment and fall are their opposites.',
      'Part of Fortune is Ascendant + Moon − Sun by day and Ascendant + Sun − Moon by night.',
      'The Vertex is where the ecliptic meets the prime vertical in the west.',
      'Pro’s report quotes tradition with sources; it never states who a person is.',
    ],
    practice: [
      'Open the Natal report and find a planet in domicile or exaltation.',
      'Open Chart points and note whether the chart is a day or night chart.',
      'Change the house system to Placidus and see which planets change house.',
    ],
    check: {
      question: 'The Sun is in Libra. Which dignity is that, and why?',
      answer: 'Fall. The Sun is exalted in Aries, and Libra is opposite.',
    },
    boundary: 'Dignity is a classical classification. It describes a tradition’s view of a planet, not the worth of a person.',
  },
] as const;

export function techniqueLesson(id: string): TechniqueLesson | undefined {
  return TECHNIQUE_LESSONS.find((lesson) => lesson.id === id);
}
