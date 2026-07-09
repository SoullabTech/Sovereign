/**
 * Soul Portrait — Catherine (LITERARY form)
 * ────────────────────────────────────────────────────────────────────────
 * SIXTH hand-delivered Gift exception (Kelly, 2026-07-09). A gift portrait,
 * flowing Spiralogic prose. Hand-delivered, unlisted, noindex. Mentor/MAIA/
 * memory OFF (mentorEnabled omitted → default-deny).
 *
 * Born March 21, 1959, 3:00 PM, Liverpool, England. Chart computed by the
 * platform ephemeris (2fec1425c) under the corrected IANA conversion
 * (Europe/London — GMT in March 1959, pre-BST → 15:00Z). DATA only; all prose
 * written fresh. Placements: Leo Rising · Sun 0° Aries (8th — the EQUINOX Sun,
 * the zodiac's first degree) · Mercury Aries (8th, conj. Sun & South Node) ·
 * Moon conj. Uranus in Leo (12th) · Venus in Taurus (9th, DOMICILE) · Mars
 * Gemini (11th) · Jupiter in Sagittarius (4th, DOMICILE) · Saturn in Capricorn
 * (5th, DOMICILE) · Neptune Scorpio (3rd) · Pluto Virgo (1st, rising) · Chiron
 * Aquarius (7th) · North Node Libra (2nd) / South Node Aries (8th). Element
 * census F5/E3/A1/W1 — fire-led. Notable aspects: Sun trine Jupiter · Mercury
 * trine Uranus · Moon sextile Mars. Three domicile planets = rare structural
 * dignity.
 *
 * PART II (The Year Ahead) PENDING her 12-month transit report — not fabricated
 * (an ad-hoc computed sweep was found unreliable on 2026-07-08; only professional
 * report DATA is admissible). Add when the report is provided.
 *
 * The giver's offeredBy opening is a DRAFT in the giver's register — Kelly
 * corrects `relationship` and edits in his own voice before delivery.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const catherinePortrait: LiterarySoulPortrait = {
  person: {
    name: 'Catherine',
    slug: 'catherine',
    pronouns: 'she/her',
    isMinor: false,
  },

  mode: 'gift',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF.

  // DRAFT offeredBy — Kelly: correct `relationship` and edit in your own voice.
  offeredBy: {
    relationship: 'a friend',
    giverName: 'Kelly',
    giftOpening: `Every life carries a particular light.

This one is yours — the pioneering fire that begins things, the radiant heart that warms a room, and the depth that most people never guess is running underneath. You were born at the turning of the year, when the light comes back; it seemed worth holding that up so you could see it too.

The stars reveal the weather; your soul chooses how to walk through it. Read this as a mirror offered with warmth — and keep what your own heart already knows is true.

— Kelly`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Catherine',
      attribution: 'Offered with love by Kelly',
      framing:
        'A reflection on who you are, and who you are still becoming — written in the language of soul and symbol. The stars reveal the weather; your soul chooses how to walk through it.',
    },
  },

  birthData: {
    date: 'March 21, 1959',
    time: '3:00 PM',
    place: 'Liverpool, England',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
  },

  framing: DEFAULT_FRAMING,

  natalChartSummary: {
    placements: [
      { body: 'Ascendant', sign: 'Leo', meaning: 'A warm, radiant presence — the room is a little brighter and braver for your being in it.' },
      { body: 'Sun', sign: 'Aries', house: 8, angle: 'at 0° — the equinox degree, the first of the zodiac', meaning: 'A self that begins things, born at the exact turning of the year — pioneering fire aimed at the deep.' },
      { body: 'Mercury', sign: 'Aries', house: 8, meaning: 'A quick, direct, pioneering mind that dives beneath the surface — thought as exploration of the hidden.' },
      { body: 'Moon', sign: 'Leo', house: 12, angle: 'conjunct Uranus', meaning: 'A radiant, independent heart that does its truest work behind the scenes — feeling fused with the awakener.' },
      { body: 'Venus', sign: 'Taurus', house: 9, angle: 'in domicile', meaning: 'Love and beauty in their home sign — steady, sensual, loyal; delight in the good and the far horizon.' },
      { body: 'Mars', sign: 'Gemini', house: 11, meaning: 'A will that moves through words, ideas, and friendship — energy for the many and the future.' },
      { body: 'Jupiter', sign: 'Sagittarius', house: 4, angle: 'in domicile', meaning: 'Faith and largeness at home in their own sign — the philosopher rooted at the hearth.' },
      { body: 'Saturn', sign: 'Capricorn', house: 5, angle: 'in domicile', meaning: 'Mastery in its home sign — discipline that gives creativity and joy a lasting structure.' },
      { body: 'Pluto', sign: 'Virgo', house: 1, meaning: 'The transformer at the front door — a presence that quietly changes what it enters.' },
      { body: 'North Node', sign: 'Libra', house: 2, meaning: 'A growth direction toward balance, relationship, and building a settled sense of your own worth.' },
    ],
    synthesis:
      "A fire-led chart of rare structural dignity. The Sun stands at 0° Aries — the equinox, the zodiac's very first degree, pure beginning — placed in the eighth house of depth, so the pioneer begins in the deep. Leo rises and the Moon burns beside Uranus in Leo in the hidden twelfth: a radiant, independent heart that works behind the veil. And three planets sit in their own domicile — Venus in Taurus, Jupiter in Sagittarius, Saturn in Capricorn — a chart unusually at home in itself: love that is steady, faith that is large, mastery that is real. Fire begins it, Earth secures it, and a Virgo Pluto at the door means everything she touches quietly transforms.",
  },

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Opening Letter',
      subtitle: 'A letter about a becoming',
      body: `Dear Catherine,

This letter is an offering, not a verdict. What follows is a reflection of patterns your birth chart points toward — a symbolic map, not a fixed road. You are always more than any description of you, and you remain the only true authority on who you are becoming.

What strikes me first about your chart is when you arrived. You were born on the spring equinox, with the Sun at zero degrees of Aries — the very first degree of the entire zodiac, the point at which the wheel of the year begins again and day and night stand equal. Astrologically there is no more initiatory placement than this: the Sun at the threshold of spring, at the starting line of everything. You came in as a beginning. It is why, all your life, you have been the one who starts things — who steps first, who opens the door, who says "let's" while others are still deciding.

But that pioneering fire is not placed where you might expect. Your Sun sits in the eighth house — the house of depth, intimacy, and transformation, the place beneath the surface of things. So you are not a shallow beginner; you are a pioneer of the deep. And around your rising sign, Leo, and your Moon fused with Uranus in Leo in the hidden twelfth house, there is a warmth and a radiance that people feel immediately — alongside a genuine independence, an original heart that has never quite run on anyone else's rails. The room brightens when you enter it. And there is far more running underneath than the room ever guesses.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shape of Your Whole Sky',
      subtitle: 'The equinox fire, and the house at home in itself',
      body: `Two things make your chart distinctive the moment you look at its shape.

The first is the equinox Sun. Zero degrees of Aries is not just "an Aries Sun" — it is the cardinal fire ignition point, the degree the whole zodiac counts from. To be born there, on the equinox, at three in the afternoon under a Leo ascendant, is to be built for initiation: cardinal fire lighting the match, fixed fire (your Leo Moon and rising) keeping it burning, and mutable fire (Jupiter in Sagittarius) carrying it toward the horizon. Fire leads your chart — five of your ten planets live in the fire signs. You are, at your core, a kindler: of projects, of people, of possibility.

The second is a quieter kind of rarity: three of your planets sit in their own domicile — the sign each most naturally rules. Venus in Taurus (love and beauty at home in themselves — steady, sensual, deeply loyal). Jupiter in Sagittarius (faith and largeness of spirit, unforced). Saturn in Capricorn (mastery and discipline in their native sign — the real thing, not the performed one). A chart with three domicile planets is a chart unusually at home in itself: the loving, the believing, and the building all operate from solid ground. It means your fire is not the reckless kind. It is lit on Earth that can hold it — which is why what you begin tends to also last.

And at the very front door — Pluto in Virgo, rising in your first house — stands the transformer. You do not leave rooms as you found them. Quietly, precisely, often without anyone noticing the mechanism, you change what you enter. Hold these together: a beginner's fire, lit on ground that holds, carried by a presence that transforms. That is the shape of you.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Soul Signature',
      subtitle: 'The one who begins, and stays',
      body: `There is a kind of person who can both start a thing and see it through — and they are rarer than either the starters or the finishers alone. The chart suggests you are one of them. Your equinox fire begins; your three domicile planets stay. Most pioneers scatter their fires and move on; yours are lit on Taurus, Sagittarius, and Capricorn ground — the loyal, the faithful, the enduring. You light what you intend to tend.

The dignity of that signature carries one quiet cost, written in the same sky. The fire that begins can find it hard to rest between beginnings; the eighth-house Sun keeps reaching for the next depth. The invitation of your chart — spoken by the North Node, which we will come to — is to let some fires simply burn warm and long, without always needing a new one to light.`,
    },

    // 4–8: elements ───────────────────────────────────────────────────────────
    {
      title: 'The Kindling Fire',
      subtitle: 'Fire — courage, purpose, vitality',
      element: 'fire',
      body: `Fire is your leading element, and it comes in all three of its forms — which is unusual and telling. The cardinal fire of your equinox Sun is the initiator: the spark, the first step, the courage to begin before it is safe. The fixed fire of your Leo Moon and Leo rising is the sustainer: the warmth that holds a room, the loyalty that does not flicker, the radiant heart. And the mutable fire of Jupiter in Sagittarius is the seeker: the faith that there is always more horizon, the largeness that refuses a small life.

Together they make you a kindler of the best kind — one who lights fires in other people as easily as in projects. But note where your Sun's fire is placed: in the eighth house, the deep water of the chart. Your courage is not showy; it goes where most people will not, into the intense, the transformative, the real. You are bravest, in the end, not on the surface but in the depths — which is a quieter and more serious kind of fire than the world usually credits.`,
    },
    {
      title: 'The Ground That Holds the Flame',
      subtitle: 'Earth — grounding, loyalty, mastery',
      element: 'earth',
      body: `If fire leads you, Earth is what keeps it from burning out — and your Earth is exceptional, because two of its three planets are in their own domicile. Venus in Taurus is love and beauty at home in themselves: a loyalty that is bone-deep, a sensual appreciation for the good things — the meal, the garden, the touch, the well-made object — and a steadiness in affection that people come to rely on. Saturn in Capricorn is mastery in its native sign: the capacity to build things that last, to take responsibility without drama, to be the one the structure can rest on.

This is why your beginnings become buildings. Fire alone starts and scatters; your fire is lit on ground engineered to hold it. Pluto in Virgo, rising, adds the craftsman's transforming precision — the instinct to improve, to purify, to make the thing actually work. Earth, in you, is not heaviness. It is the reason the flame has somewhere to stand.`,
    },
    {
      title: 'The Bright Thread of Air',
      subtitle: 'Air — mind, friendship, ideas',
      element: 'air',
      body: `One planet carries your Air, and it carries it sociably: Mars in Gemini in the eleventh house. Your will — the pushing, initiating force — moves through words, wit, ideas, and above all through people. The eleventh house is the house of friendship, groups, and the future, so your energy has always been at its best aimed at the many rather than the few: rallying, connecting, sparking a circle into motion.

Paired with your fiery Aries Mercury, this gives you a quick and direct tongue — you say the true thing, often before the room is ready for it, and usually with enough warmth to be forgiven. The thinness of the element is its own note: sustained abstraction for its own sake is not your native country. Your mind wants to move, to connect, to kindle a conversation — not to sit alone with a theory. Ideas, for you, are social fire.`,
    },
    {
      title: 'The Hidden Deep',
      subtitle: 'Water — the current beneath the warmth',
      element: 'water',
      body: `Water is the least visible element in your chart and one of the most important — because of where the little of it you have is placed. Neptune in Scorpio sits in your third house of mind and speech: an intuitive, almost psychic undercurrent to how you perceive and communicate, a sensitivity to what is unspoken that runs beneath your bright surface. And your Sun itself, though fire, lives in the eighth house — the deepest water house of the chart. So even your fire is baptized in depth.

This is the part of you the room does not see. Beneath the warmth and the initiative runs a genuine capacity for the profound — for intimacy that goes all the way down, for the transformative, for the truths most people keep at arm's length. You are not afraid of the deep water. You may, in fact, be most yourself there. The invitation is simply to let the people who have earned it see that depth, rather than only the bright fire above it.`,
    },
    {
      title: 'Faith at the Hearth',
      subtitle: 'Aether — meaning, spirit, the far horizon',
      element: 'aether',
      body: `Meaning, in your chart, has an unusually strong and well-placed home: Jupiter in Sagittarius — the planet of faith and largeness, in its own sign — sitting in your fourth house of home and roots. This is a beautiful placement. It means your sense of the sacred is not abstract or borrowed; it is native, generous, and rooted at the hearth. You carry a natural, unforced faith — in life, in possibility, in the fundamental goodness of the horizon — and you carry it not as doctrine but as atmosphere, something the people in your home simply breathe.

Your spirituality is expansive rather than austere: it believes, it welcomes, it keeps a door open and a place at the table. And because Jupiter roots in the fourth house, the sacred for you is domestic as much as it is cosmic — found in the gathered table, the welcomed guest, the home that has always been a little larger inside than it looks from the street. Your faith is a hearth-fire, and it has warmed more people than you know.`,
    },

    // 9 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Archetypal Companions',
      subtitle: 'Lenses to pick up or set down — never labels',
      body: `Archetypes are companions, not cages. Four of them walk closely with you.

The Pioneer walks closest. The equinox Sun, cardinal fire at the zodiac's first degree, Mercury beside it aimed like an arrow — you are the one who begins, who steps first, who opens what was closed. Her gift is courage in its purest form: the willingness to start before it is safe. Her shadow is the restlessness that mistakes a new beginning for the answer to an old ending — starting again when staying was the braver move.

The Sovereign walks beside her. Leo rising, the Leo Moon, the radiant warmth that draws a room — you carry a natural, generous authority, the kind people follow because they feel warmed rather than commanded. Her gift is that your leadership heartens people. Her shadow is the crown's old weight: the sense that you must carry the warmth for everyone, and may not set it down.

The Alchemist is present and deep. Pluto rising in Virgo, the eighth-house Sun, Neptune in the house of mind — you transform what you touch, quietly and precisely, and you are not afraid of the depths where transformation actually happens. Her gift is that people are changed for the better by knowing you. Her shadow is the transformer's fatigue: forgetting that not everything, and not everyone, is a project to be improved.

And the Sage is emerging. Jupiter in Sagittarius at the hearth, Venus's steady Taurus wisdom, the years accumulating into something that wants to be passed on. Not the lecturer — the elder whose faith and warmth have become a kind of teaching simply by being lived near. She is arriving in her own good time, and she is welcome.`,
    },

    // 10 ─────────────────────────────────────────────────────────────────────
    {
      title: 'The Seer and the Prophet',
      subtitle: 'Your way of perceiving, and of speaking',
      body: `You perceive as fire perceives — quickly, directly, by ignition. The Aries Sun and Mercury mean understanding arrives in you as a spark rather than a slow accumulation: you simply see it, often before you can explain it, and often before others have caught up. But Neptune in your house of mind adds a second, quieter channel: an intuitive undercurrent that senses what is unspoken, reads the room beneath its words, and knows things it did not arrive at by logic. You are both the fast, bright knower and the deep, still sensor — and you have learned, over a lifetime, to trust both.

You speak the way you perceive: directly, warmly, and sooner than most. Aries Mercury does not hoard its opinions; the true thing comes out, usually with enough Leo warmth to land as courage rather than sharpness. Trust that directness. It is one of your gifts — the willingness to say the real thing kindly — and the world has always needed more of exactly that.

May your fire always find good ground to stand on.
May the depths beneath your warmth be seen by those who have earned them.
May the one who lights so many fires be warmed, herself, by all of them.`,
    },

    // 11 ─────────────────────────────────────────────────────────────────────
    {
      title: 'North Star',
      subtitle: 'Direction, never prediction',
      body: `Your North Node stands in Libra in the second house — and it names a beautiful, gentle direction for a chart as fiery and pioneering as yours. Your South Node sits in Aries in the eighth house, conjunct your Sun and Mercury: the mastery you already carry, the fiery independence, the plunging into depth and intensity, the beginning-again. That is your home ground, deeply known. The growth edge is its complement: toward Libra's balance and relationship, and toward the second house's patient building of your own steady worth.

In plain terms: the direction is from "I begin, alone, in the deep" toward "we build, together, on the surface where a life is actually lived." Not abandoning the fire — never that — but letting it warm a shared and settled life rather than only lighting new depths. When you choose the balanced over the intense, the built over the begun-again, the partnership over the solo plunge, you tend to come alive in a new way. It does not say what will happen. It says which direction feels like spring.`,
    },

    // 12 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      subtitle: 'Small doors, opened often',
      body: `For the fire — before beginning the next thing, ask once whether an already-lit fire wants tending instead. Your gift is ignition; the practice is discernment about which flame this season actually needs.

For the ground — once a week, enjoy something purely for its own sake, no improvement intended: the meal, the garden, the music, the touch. Your Venus in Taurus knows how; the practice is letting it, without the Virgo Pluto reaching to perfect it.

For the deep — let one person all the way in this season. The eighth-house Sun runs deeper than the bright surface shows; intimacy is completed by being received, not only by being offered.

For the hearth — keep the door open and the table long, as you always have, but sit at it yourself sometimes as a guest rather than the host. The faith you give the room is allowed to hold you too.`,
    },

    // 13 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Questions to Sit With',
      subtitle: 'Not goals. Not predictions. Company.',
      body: `You were born at a beginning — what, in this season, is asking to be begun, and what is asking simply to be tended?

Where might you let yourself be warmed by a fire you lit for others?

What depth in you is ready to be seen by someone who has earned it?

The chart points from the solo plunge toward the shared and settled life — where is that direction already quietly calling you?

What would it feel like to be received as fully as you give?`,
    },

    // 14 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Soul Vocation',
      subtitle: 'What the gift is for',
      body: `Some lives are built to begin things and hand them on; yours is built to begin things and stay to warm them. The chart is unusually unanimous: the equinox fire that starts, the domicile Earth that holds, the radiant heart that gathers, the faith rooted at the hearth, and the transformer at the door who leaves every room better than she found it. What it is for, in the end, is this — that new life keeps getting lit, in projects and in people, by someone brave enough to strike the first match; and that the warmth she kindles outlasts her, because she had the rare gift of both beginning the fire and tending it until it could stand on its own.`,
    },
  ],

  // PART II — The Year Ahead: intentionally omitted. Pending Catherine's
  // professional 12-month transit report (transit DATA only, prose fresh).
  // Do not fabricate transits — an ad-hoc computed sweep was found unreliable.
};
