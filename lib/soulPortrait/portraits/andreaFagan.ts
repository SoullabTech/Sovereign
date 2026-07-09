/**
 * Soul Portrait — Andrea Fagan (LITERARY form)
 * ────────────────────────────────────────────────────────────────────────
 * FIFTH hand-delivered Gift exception (Kelly, 2026-07-08). A gift portrait,
 * written as flowing Spiralogic prose. Hand-delivered, unlisted, noindex.
 * Mentor/MAIA/memory OFF (mentorEnabled omitted → default-deny).
 *
 * Born July 11, 1956, 1:43 AM, Muskegon, Michigan. Chart computed by the
 * platform's own ephemeris under the corrected IANA-timezone conversion
 * (America/Detroit — year-round EST in 1956 → 06:43Z; commit 2fec1425c).
 * Placements: Taurus Rising · Cancer Sun (3rd) · Virgo Moon conj. Jupiter
 * (4th) · Mercury in Cancer (2nd) · Venus in Gemini (2nd) · Mars in Pisces
 * (11th) · Saturn in Scorpio (7th) · Chiron in Aquarius (10th) · North Node
 * Sagittarius (7th, ℞) · Midheaven Aquarius. Notable aspects: Sun trine
 * Mars · Moon conj. Jupiter · Moon square the Nodes · Sun square Ceres.
 * No close outer-planet aspects to personal planets were listed, so none
 * are read (Design Law: never manufacture).
 *
 * PART II (The Year Ahead) is traced to COMPUTED transits (Jul 2026–Jul 2027,
 * monthly, platform ephemeris, orb ≤ 2°) — real hits, never fabricated:
 * Neptune trine natal Uranus + sextile MC (all year, exact Dec–Jan) · Pluto
 * trine natal North Node / Uranus (all year) · transiting Uranus trine natal
 * Uranus (exact Feb–Mar 2027) + sextile MC · Jupiter square natal Sun (Oct
 * 2026; again Mar–Jun 2027) · Saturn square natal Mercury (Nov 2026–Mar
 * 2027) · Jupiter opp. Neptune + trine Pluto (Dec–Jan) · Saturn sextile
 * Chiron (Jul–Sep 2026) · Saturn square Sun + sextile Venus (May 2027) ·
 * Saturn trine Pluto / opp. Neptune (Jun–Jul 2027).
 *
 * The giver's personal opening (offeredBy / giftOpening / threshold) is
 * deliberately NOT authored here — that note is Kelly's to add in his own
 * words before delivery.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const andreaFaganPortrait: LiterarySoulPortrait = {
  person: {
    name: 'Andrea Fagan',
    slug: 'andrea-fagan',
    pronouns: 'she/her',
    isMinor: false,
  },

  mode: 'gift',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF.
  // offeredBy intentionally omitted for now — the giver's opening is Kelly's
  // to write in his own words before this is delivered.

  birthData: {
    date: 'July 11, 1956',
    time: '1:43 AM',
    place: 'Muskegon, Michigan',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
  },

  framing: DEFAULT_FRAMING,

  natalChartSummary: {
    placements: [
      { body: 'Ascendant', sign: 'Taurus', meaning: 'A presence that steadies a room simply by being in it — unhurried, trustworthy, built to last.' },
      { body: 'Sun', sign: 'Cancer', house: 3, meaning: 'A core self that shines through caring words, near circles, and the daily weave of connection.' },
      { body: 'Moon', sign: 'Virgo', house: 4, meaning: 'Feeling finds its footing in tending — home as the place where care becomes craft. Joined with Jupiter: generosity made practical.' },
      { body: 'Mercury', sign: 'Cancer', house: 2, meaning: 'A voice that carries memory and speaks from what it truly values.' },
      { body: 'Venus', sign: 'Gemini', house: 2, meaning: 'Delight in wit, variety, and good conversation — pleasures light on their feet.' },
      { body: 'Mars', sign: 'Pisces', house: 11, meaning: 'Effort that moves like a tide — quiet, persistent, flowing toward shared hopes.' },
      { body: 'Saturn', sign: 'Scorpio', house: 7, meaning: 'Partnership as the life-school where depth, loyalty, and endurance are earned.' },
      { body: 'Chiron', sign: 'Aquarius', house: 10, meaning: 'A tender place around belonging in the public circle — and the medicine that grows from it.' },
      { body: 'North Node', sign: 'Sagittarius', house: 7, meaning: 'A growth direction toward frankness, faith, and meaning found with others.' },
    ],
    synthesis:
      'Woven together: a Taurus-steady presence carrying a Cancer heart that speaks its care into the nearest rooms; a Virgo Moon joined with Jupiter that makes generosity practical; a Pisces Mars in easy conversation with the Sun, so that will and imagination pull in the same direction; and a seventh house where both Saturn and the North Node stand — naming relationship as both the weight she has carried and the road she is walking toward. The Midheaven in Aquarius turns the public face of all this toward community and the common good.',
  },

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Opening Letter',
      subtitle: 'A letter about a becoming',
      body: `Dear Andrea,

This letter is an offering, not a verdict. What follows is a reflection of patterns your birth chart points toward — a symbolic map, not a fixed road. You are always more than any description of you, and you remain the only true authority on who you are becoming.

What strikes me first in your chart is how much of your life moves through tending. You came in under a Taurus rising — a presence that steadies a room simply by being in it — with the Sun in Cancer in the house of everyday words and near circles. Care, in you, is not an abstraction; it moves through conversation, through checking in, through remembering what someone said three weeks ago and asking how it turned out. And beneath that, the Moon sits with Jupiter in Virgo in the house of home: a heart that grows large by being useful, that makes abundance out of small right things done faithfully. Where some people love loudly, you love thoroughly.

And yet the chart does not let you stay tucked in. Your North Node stands in Sagittarius in the house of partnership — a long, patient invitation toward candor, shared horizons, and the kind of trust that says yes to the wider journey in company. The Moon squares that path, which is its own honest tension: the familiar will always call you back toward what you already keep well. The invitation of this season is not to abandon the hearth, but to let it travel with you — to let what you tend become the provisions for a larger road, walked with others, out loud.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Soul Signature',
      subtitle: 'The keeper of the near flame',
      body: `There is a kind of person whom others instinctively trust with what matters — the keys, the story, the recipe, the grief. The chart suggests you are one of them. Your signature is care made durable: feeling that doesn't evaporate into sentiment but settles into acts, habits, rooms, and words that people can lean on.

The quiet dignity of that gift is also its growth edge. What is kept can be kept too closely. The same sky that made you a keeper is asking, gently and for a long time now, that the keeping open outward — that the flame you tend become a light others can travel by.`,
    },

    // 3–7: The Five Elements ─────────────────────────────────────────────────
    {
      title: 'The Low, Long Flame',
      subtitle: 'Fire — courage, purpose, vitality',
      element: 'fire',
      body: `Your courage does not announce itself; it endures. With the Sun in easy trine to Mars, your will and your vitality cooperate rather than argue — purpose in you moves like warmth through a house, steady and unforced. You are braver than you sound, and your persistence outlasts louder people's sparks.`,
    },
    {
      title: 'The Native Element',
      subtitle: 'Water — heart, empathy, emotional wisdom',
      element: 'water',
      body: `Feeling is your first intelligence. A Cancer Sun and Mercury mean you sense a room before you read it, and your empathy is not performed — it remembers. Water in you is the tide that Mars in Pisces rides too: compassion that keeps arriving, wave after wave, long after the occasion for it has passed.`,
    },
    {
      title: 'The Tending Hands',
      subtitle: 'Earth — grounding, habits, responsibility',
      element: 'earth',
      body: `Taurus rising and a Virgo Moon beside Jupiter make Earth your visible element: the settled presence, the made bed, the meal that appears, the detail no one else noticed handled before anyone asked. Grounding, for you, is not stillness — it is usefulness. You steady the world by taking care of it.`,
    },
    {
      title: 'The Bright Thread',
      subtitle: 'Air — curiosity, communication, ideas',
      element: 'air',
      body: `Venus in Gemini gives your seriousness a light companion: a real delight in words, wit, and the play of ideas. And with the Midheaven in Aquarius, the airy part of you faces outward — toward community, toward the future, toward the question of what we owe one another. Curiosity is how your care thinks.`,
    },
    {
      title: 'The Widening Circle',
      subtitle: 'Aether — meaning, spirit, mystery',
      element: 'aether',
      body: `Meaning, in your chart, is not found alone on a mountaintop — it is found at a shared table that keeps adding chairs. The Sagittarian node in the house of partnership, and Chiron's tender intelligence about who gets left outside the circle, point the mystery of your life toward hospitality: the sacred, for you, is whoever just walked in.`,
    },

    // 8 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Archetypal Companions',
      subtitle: 'Lenses to pick up or set down — never labels',
      body: `The Steward (strong). One to whom things — and people — can be entrusted. The gift: making places where life can settle, mend, and grow; care that holds its shape over years. The growth edge: over-tending — the moment care starts managing what it should be blessing.

The Storyteller (strong). The keeper of the family's memory, the one who says what happened and makes it belong to everyone. The gift: people feel remembered around you — their small details kept safe in your telling. The growth edge: keeping the story small to keep it safe, when it is ready to be told wider.

The Sage (present). Wisdom earned the slow way, in committed relationship, through what Saturn in the seventh house teaches. The gift: truth with gravity — when you finally say the thing, it lands, because you carried it first. The growth edge: bracing for loss before it arrives; wisdom hardening into guardedness.

The Healer (emerging). One who knows, from the inside, what it is to stand slightly outside the circle. The gift: widening circles so that no one has to stand where you once stood. The growth edge: tending everyone's belonging but your own.`,
    },

    // 9 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Seer and the Prophet',
      subtitle: 'Your way of perceiving, and of speaking',
      body: `You perceive tidally. Understanding does not strike you; it rises in you — through feeling first, then through the Virgo Moon's fine attention to what is actually there. You notice what people need before they say it, and you notice it in the details: the tone, the untouched plate, the pause before the answer.

Your speaking is plainer than your perceiving, and that is its power. Most days your words are warm, practical, near at hand. But the Sagittarian node is slowly teaching your voice a second register: sudden, frank, further-seeing — the moment when the one who usually asks after everyone else says what she actually sees. Trust that register. It is not unkindness; it is the horizon speaking through you.

May what you keep, keep you.
May your table grow longer than your worry.
May the truth you carry find its hour, and be welcome.`,
    },

    // 10 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Challenges as Trainings',
      subtitle: 'Difficulty, reframed — never a verdict',
      body: `A chart's hard angles are not punishments; they are the gym. Yours describe three trainings, each one already half-mastered by the living of your life.

The pull between hearth and horizon (Moon square the Nodes) — training: let the familiar bless the journey instead of replacing it. Pack the home; don't stay for it.

Care flowing one direction (Sun square Ceres) — training: receive tending as willingly as you give it. Letting yourself be cared for is not a debt; it is the circle completing.

The weight carried in partnership (Saturn in the 7th) — training: let others carry their half. Loyalty does not require you to be the strong one every time.`,
    },

    // 11 ─────────────────────────────────────────────────────────────────────
    {
      title: 'North Star',
      subtitle: 'Direction, never prediction',
      body: `The North Node in Sagittarius in your seventh house names a direction your life has been walking all along: toward openness spoken out loud, toward faith that survives honesty, toward the wider journey taken with someone rather than for them. It does not say what will happen — nodes never do. It says: when you choose the franker word, the further table, the shared road over the safe corner, you tend to come alive. That aliveness is the compass. Follow it at your own pace, in your own weather.`,
    },

    // 12 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Where You Stand',
      subtitle: 'The Harvest Turn',
      body: `There is a season in a life when the question quietly changes from "what will I make?" to "what will I hand on?" The chart suggests you are standing in that turn — not an ending, but a gathering-in: the years when the Steward's long tending becomes inheritance, when the Storyteller's kept memories want telling, and when the circle you spent a lifetime holding open is ready to hold you. Nothing here needs to be hurried. Harvest has its own pace, and you have always known how to work with a season rather than against one.`,
    },

    // 13 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Questions to Sit With',
      subtitle: 'Not goals. Not predictions. Company.',
      body: `What have you been keeping safe that might now be ready to be given?

Where does the horizon still call you — and who would you want beside you on that road?

What would it feel like to be tended the way you tend others, and who would you allow to do it?

Which story of yours has waited long enough to be told out loud?

When you imagine the longer table, who is not yet at it?`,
    },

    // 14 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Soul Vocation',
      subtitle: 'What the gift is for',
      body: `Some lives build monuments; yours builds belonging. The vocation written across this chart is the turning of care into memory, and memory into a place at the table — the slow, unglamorous, holy work of making sure the people in your orbit know they are kept. What it is for, in the end, is this: that the circle be wider when you leave it than when you found it, and that everyone inside it knows the way back.`,
    },
  ],

  // ── Part II — The Year Ahead ──────────────────────────────────────────────
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Seasonal Spiral',
    timeframe: 'July 2026 – July 2027',
    openingHeadline: 'The year the circle turns outward.',
    openingTheme: `Three slow, generous currents run beneath this entire year. Neptune, newly in Aries, spends the whole of it in a flowing trine to your natal Uranus and a supportive sextile to your Aquarius Midheaven — softening and re-enchanting the part of you that faces the community. Pluto in Aquarius holds a long trine to your North Node — quiet, durable power gathering behind the road your life is already walking, the one toward shared horizons. And through the winter, Uranus in Gemini returns to the exact trine of its own natal place — the elder's Uranus return of spirit, which arrives not as disruption but as permission: to surprise people, to change your mind, to begin something.

Against that steady background, one theme knocks repeatedly: Jupiter in Leo squares your Cancer Sun in October, and again from March through June. A square from Jupiter is not hardship — it is growth applying friendly pressure. The same question, asked in different months: will you take up the room your life has earned?`,
    phases: [
      {
        element: 'earth',
        title: 'Mending Made Practical',
        timeframe: 'Late Summer – Autumn 2026 · July – October',
        transits: [
          'Saturn sextile natal Chiron (July – September)',
          'Jupiter trine natal Uranus and sextile the Midheaven (July)',
          'Jupiter square natal Sun (October — first pass)',
        ],
        body: `The year opens on solid ground. Saturn's steady hand works quietly with Chiron's old tender spot — the one about belonging in the public circle — and offers something rare: the chance to mend a long ache through ordinary, practical acts. Not catharsis; repair. Meanwhile Jupiter brightens the community corner of your sky, opening doors in exactly the places you usually hold them open for others. When October's first square to your Sun arrives, notice what it asks. It will ask again in spring.`,
        question: 'What old ache could be tended by one practical act, repeated?',
        practice: { label: 'Earth practice', prompt: 'Once a week, accept an invitation you would normally deflect — and let someone else set the table.' },
      },
      {
        element: 'fire',
        title: 'The Flame Asked to Be Seen',
        timeframe: 'Autumn – Early Winter · October – December',
        transits: [
          'Jupiter in Leo square natal Sun (October)',
          'Jupiter trine natal Pluto (December)',
          'Jupiter opposite natal Neptune (December)',
        ],
        body: `The low, long flame you carry is invited into the open. Jupiter's square to your Sun stretches the quiet Cancer heart toward visibility — more room, more voice, more you. By December, Jupiter's trine to your natal Pluto lends real depth of power to whatever you have begun, while its opposition to your Neptune asks for one act of discernment: generous dreams deserve daylight-testing. Say yes to the bigger table; check the fine print on the bigger promise.`,
        question: 'Where are you still asking for a smaller life than the one being offered?',
      },
      {
        element: 'water',
        title: 'The Imaginal Tide',
        timeframe: 'Midwinter · December – February',
        transits: [
          'Jupiter opposite natal Neptune (exact December – January)',
          'Neptune trine natal Uranus (exact December – January)',
          'Neptune sextile the Midheaven',
        ],
        body: `Midwinter belongs to your native element. Neptune's year-long currents run strongest now, and the veil between what is and what could be grows pleasantly thin. Dreams, memory, and imagination all speak louder — a gift to the Storyteller in you, and a season to be gentle with. Your natal anchor here is superb: a Virgo Moon beside Jupiter knows how to give a dream a container. Let the tide rise; keep one hand on the practical rail.`,
        question: 'Which dream is asking to be written down before it is asked to be real?',
        practice: { label: 'Water practice', prompt: 'Keep a small winter notebook by the bed. Mornings, three lines — not plans, just what the night left behind.' },
      },
      {
        element: 'air',
        title: 'Fewer, Truer Words',
        timeframe: 'Late Winter – Spring · November – April',
        transits: [
          'Saturn square natal Mercury (November – March)',
          'Uranus trine natal Uranus (exact February – March)',
          'Uranus sextile the Midheaven',
        ],
        body: `Through the cold months, Saturn tests the voice. Words come slower, weigh more, and want editing — which, for a Cancer Mercury that has spent a lifetime choosing kindness first, is not a punishment but a graduation: the season of fewer, truer words. And just as Saturn disciplines the voice, Uranus returns to its own natal degree in friendly trine — the mind refreshed at exactly the moment the speech grows precise. What you say this spring, people will remember. Say the real thing.`,
        question: 'What is the sentence you have been polite instead of saying?',
      },
      {
        element: 'aether',
        title: 'The Ripening',
        timeframe: 'Late Spring – Summer 2027 · May – July',
        transits: [
          'Jupiter and Saturn both square natal Sun (May)',
          'Saturn sextile natal Venus (May – June)',
          'Saturn trine natal Pluto; Saturn opposite natal Neptune (June – July)',
          'Neptune and Pluto trine the North Node (all year, closing strong)',
        ],
        body: `The year converges. In May, Jupiter and Saturn square your Sun together — expansion and structure pressing the same question from both sides: what, of everything this year opened, will you actually keep and stand inside? Saturn's sweet sextile to Venus softens the pressure with real affection arriving through it. By midsummer, Saturn trine Pluto grants endurance to what you choose, while its opposition to Neptune retires one long illusion kindly. And beneath it all, the year's deepest currents — Neptune and Pluto flowing toward your North Node — close the spiral where your chart has always pointed: meaning, shared; the road, walked in company.`,
        question: 'What did this year grow that deserves a permanent place?',
      },
    ],
    weatherPattern: [
      { season: 'Jul – Oct 2026', element: 'earth', invitation: 'Mend practically; accept the opened door.' },
      { season: 'Oct – Dec 2026', element: 'fire', invitation: 'Be seen; test the big dream in daylight.' },
      { season: 'Dec – Feb 2027', element: 'water', invitation: 'Let the tide rise; give dreams containers.' },
      { season: 'Feb – Apr 2027', element: 'air', invitation: 'Fewer, truer words; welcome the renewed mind.' },
      { season: 'May – Jul 2027', element: 'aether', invitation: 'Choose what to keep; walk the shared road.' },
    ],
    goldenThread:
      'One arc runs through the whole year: the community elder emerging. Neptune, Pluto, and Uranus all feed your Aquarius Midheaven and your Sagittarian node at once — the sky spending twelve months turning the keeper of the near flame toward the wider circle. The year does not ask you to become someone new. It asks the Steward to let her stewardship be visible, the Storyteller to tell it wider, and the table to grow one seat longer than feels quite comfortable.',
    questions: [
      'If the circle you tend became visible to your whole community, what would it look like?',
      'What role are you being offered this year that you keep almost accepting?',
      'Who will you let carry something for you this year — and when?',
    ],
    closing: {
      title: 'A Word for the Year',
      body: 'Seasons do the growing; the gardener chooses what to plant and what to keep. Nothing in this sky decides for you — it only describes the weather. Walk it at your own pace, in your own way, and let the year find you already at the table, with the door open.',
    },
  },
};
