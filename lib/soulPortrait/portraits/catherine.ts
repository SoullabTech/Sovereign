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
 * Chart pattern (per her Astrograph report): a GRAND TRINE in Fire — Sun in
 * Aries, a Leo planet (Moon/Uranus), Jupiter in Sagittarius — "an exceptional
 * area of talent," self-sufficiency, easy success (beware complacency).
 *
 * PART II (The Year Ahead) built from her Astrograph 12-month transit report
 * (starting 7/9/2026) — transit DATA only; Seltzer interpretation text never
 * copied. Majors: Saturn into natal 9th (teaching/higher-mind era, Apr 2026 →
 * firm Jan 2027 for 2-3 yrs) · Neptune conjunct natal Sun (Oct 2026 – Jan 2027)
 * · Neptune trine natal Jupiter (Aug 2026 – Mar 2027) · Pluto square natal
 * Neptune (2026 → 2028) · Uranus square natal Pluto (2026–2027) · Uranus opp
 * natal Jupiter (Nov 2026 – Apr 2027) · Jupiter conj natal Uranus (Aug 2026),
 * conj natal Moon (Sep 2026; Mar–May 2027), trine natal Sun (Jun–Jul 2026),
 * conj Ascendant + into 1st house (Nov 2026 – Jan 2027; again Jun–Jul 2027 =
 * new 12-yr cycle) · Chiron conj natal Venus (May–Oct 2026; Mar–Jun 2027) ·
 * Saturn square natal Saturn (Nov 2026 – Jan 2027).
 *
 * The giver's offeredBy opening is a DRAFT in the giver's register — Kelly
 * corrects `relationship` and edits in his own voice before delivery.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const catherinePortrait: LiterarySoulPortrait = {
  person: {
    name: 'Catherine Teresa Butler',
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
      body: `Three things make your chart distinctive the moment you look at its shape.

The first is the equinox Sun. Zero degrees of Aries is not just "an Aries Sun" — it is the cardinal fire ignition point, the degree the whole zodiac counts from. To be born there, on the equinox, at three in the afternoon under a Leo ascendant, is to be built for initiation: cardinal fire lighting the match, fixed fire (your Leo Moon and rising) keeping it burning, and mutable fire (Jupiter in Sagittarius) carrying it toward the horizon. Fire leads your chart — five of your ten planets live in the fire signs. You are, at your core, a kindler: of projects, of people, of possibility.

The second is a quieter kind of rarity: three of your planets sit in their own domicile — the sign each most naturally rules. Venus in Taurus (love and beauty at home in themselves — steady, sensual, deeply loyal). Jupiter in Sagittarius (faith and largeness of spirit, unforced). Saturn in Capricorn (mastery and discipline in their native sign — the real thing, not the performed one). A chart with three domicile planets is a chart unusually at home in itself: the loving, the believing, and the building all operate from solid ground. It means your fire is not the reckless kind. It is lit on Earth that can hold it — which is why what you begin tends to also last.

And the third is the crown of it: a Grand Trine in Fire. Three of your planets — the Sun in Aries, a radiant planet in Leo, and Jupiter in Sagittarius — stand at the points of a perfect triangle across the fire signs. A Grand Trine is the mark of an exceptional, almost effortless gift in its element, and yours is in Fire: an innate, self-sufficient capacity for vitality, courage, faith, and creative spark that has simply always been there, running like a current you did not have to switch on. The one caution the old readers attach to it is the only one it needs — a gift this easy can tempt its owner toward coasting. Yours plainly never did.

And at the very front door — Pluto in Virgo, rising in your first house — stands the transformer. You do not leave rooms as you found them. Quietly, precisely, often without anyone noticing the mechanism, you change what you enter. Hold these together: a beginner's fire, lit on ground that holds, crowned by an effortless fire-gift, carried by a presence that transforms. That is the shape of you.`,
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

  // ── Part II — The Year Ahead ──────────────────────────────────────────────
  // Transit DATA from her Astrograph 12-month report (starting 7/9/2026);
  // all prose fresh. Seltzer interpretation text never copied.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Seasonal Spiral',
    timeframe: 'July 2026 – July 2027',
    openingHeadline: 'The year the fire is softened, and the meaning-maker is born.',
    openingTheme: `Something unusual is happening in your sky this year: the pioneering fire that has run your whole life is being gently, deliberately softened — and in its place a new capacity is being born, one your chart has always pointed toward but rarely had the weather to grow.

Three slow movements set the tone. Neptune — the planet of dissolving, compassion, and the sacred — spends the year approaching a conjunction with your equinox Sun, the very center of you: it does not diminish the fire so much as teach it tenderness, turning the initiator toward mercy. Saturn crosses into your ninth house, the house of higher meaning and teaching, and settles in for two to three years: the years in which you build a framework of belief that is genuinely your own. And Jupiter — expansive, fortunate Jupiter — spends the heart of the year crossing your Leo ascendant and lighting up your Moon and Uranus: a bright, buoyant enlargement of the self, arriving right as Neptune asks it to grow gentler.

The result is a rare and beautiful pairing: the year enlarges you and softens you at once. The fire does not go out — your Grand Trine does not permit that — but it learns, this year, to warm rather than only to ignite.`,
    phases: [
      {
        element: 'fire',
        title: 'The Self Enlarged',
        timeframe: 'Midsummer – Early Autumn 2026 · July – September',
        transits: [
          'Jupiter trine natal Sun (exact Jul 1, 2026)',
          'Jupiter trine natal Jupiter (exact Jul 9)',
          'Jupiter conjunct natal Uranus (exact Aug 26) · trine natal Mercury (Aug 27)',
          'Jupiter conjunct natal Moon (exact Sep 20)',
        ],
        body: `The year opens by feeding your strongest gift. Jupiter — the planet of expansion and good fortune — moves through the fire of your chart, trining your Sun and your own Jupiter, then lighting up the radiant Moon-Uranus heart in your twelfth house. This is your Grand Trine getting a season of wind in its sails: optimism, vitality, the golden touch on whatever you begin. Doors open easily; your natural warmth draws people; the pioneering spark that has always been yours simply burns brighter and luckier now. Begin things this season — the chart is unusually generous to beginnings made under this sky. Just remember the Grand Trine's one caution: fortune this easy is meant to be spent, not coasted on.`,
        question: 'What has been waiting for exactly this much wind to finally begin?',
      },
      {
        element: 'water',
        title: 'The Softening',
        timeframe: 'Autumn – Early Winter 2026 · October – January',
        transits: [
          'Neptune conjunct natal Sun (Oct 24, 2026 – Jan 29, 2027)',
          'Neptune trine natal Jupiter (exact Nov 5 R; Jan 17)',
          'Pluto square natal Neptune (2026 → 2028) · Neptune inconjunct natal Pluto',
        ],
        body: `Then the tide comes in. Neptune — the great dissolver, the planet of compassion and the sacred — reaches the equinox Sun at the center of you, and the fire meets water for perhaps the first time in a long while. This is not a dimming; it is a tempering. The initiator softens toward mercy; the one who begins learns to also surrender. You may feel less certain than usual, more porous, more moved by others' needs, more drawn to the spiritual than the strategic — and that is the work, not a failure of it. Neptune's trine to your Jupiter keeps the season buoyant with faith even as it loosens your grip. Hold big decisions loosely while the water is high; let yourself be softened. A more compassionate self is being born in exactly the place your identity lives.`,
        question: 'Where is your certainty being asked to become compassion instead?',
        practice: { label: 'Water practice', prompt: 'Keep a winter notebook: mornings, three lines of what you feel rather than what you plan. Let the water speak first.' },
      },
      {
        element: 'earth',
        title: 'The New Framework',
        timeframe: 'Deep Winter 2026 – Early 2027 · December – February',
        transits: [
          'Saturn firmly into natal 9th house (Jan 5, 2027 — for 2-3 years)',
          'Saturn square natal Saturn (Nov 2026 – Jan 2027)',
          'Saturn conjunct natal Mercury (returns Feb 6 – Mar 15, 2027)',
        ],
        body: `As the visions of autumn settle, Saturn arrives to give them structure. It crosses firmly into your ninth house — the house of higher learning, philosophy, and meaning — and stays for two to three years: the season, the old readers say, of building "a framework of moral and spiritual values arising out of your own uniqueness," rather than any belief inherited or borrowed. The Saturn-square-Saturn underneath it marks a genuine turning point, a reckoning with what structure your life should now stand on. And Saturn meeting your Mercury slows the mind to a deliberate, deepening pace — fewer thoughts, truer ones, built to last. This is the winter the softened fire becomes a considered philosophy. What you conclude now, you will teach later.`,
        question: 'What do you actually believe now — in your own words, owing nothing to who taught you?',
      },
      {
        element: 'air',
        title: 'The Great Unsettling',
        timeframe: 'Winter – Spring 2027 · January – April',
        transits: [
          'Uranus opposite natal Jupiter (exact Jan 12 R; Mar 5, 2027)',
          'Uranus square natal Pluto (exact Dec 30, 2026 R; Mar 18, 2027)',
          'Uranus sextile natal Sun (Jan – Mar 2027)',
        ],
        body: `Then the awakener knocks. Uranus opposes your Jupiter and squares your Pluto — a season of restlessness and seismic shift, the sky's way of shaking loose anything you have outgrown but kept holding. Plans may change suddenly; a long-brewing need for freedom breaks the surface; something you have carried past its usefulness asks, at last, to be set down. It can feel disruptive — but the gentle sextile from Uranus to your Sun is the tell: this is a wake-up call in your favor, an opening of new horizons rather than a loss of old ground. After a winter of softening and structuring, the spring insists you also breathe, break pattern, and let the new vision in. Say yes to the freedom; it is the year clearing space for what's next.`,
        question: 'What have you outgrown but kept holding — and what would open if you set it down?',
      },
      {
        element: 'aether',
        title: 'The Heart Healed, the Cycle Renewed',
        timeframe: 'Spring – Summer 2027 · April – July',
        transits: [
          'Chiron conjunct natal Venus (returns Mar 26 – Jun 2, 2027)',
          'Jupiter conjunct natal Moon (exact May 3) · sextile natal Mars (May 21)',
          'Jupiter conjunct natal Ascendant + into the natal 1st house (Jun 30 – Jul 5, 2027 — a new 12-year cycle)',
        ],
        body: `The year closes with healing and a threshold. Chiron — the wounded healer — meets your Venus, opening a tender, rewarding season of mending around love, worth, and what you value: old relational patterns surface not to wound but to be released, and a truer way of loving and valuing yourself takes their place. And then the grace note: Jupiter returns to your Leo ascendant and crosses into your first house at the very end of the year — the opening of a fresh twelve-year cycle of expansion, beginning with you. After a year of being softened, restructured, and unsettled, the sky hands you a brand-new beginning at your own front door. The equinox soul, born to begin, is given a new spring to begin from — this time with a gentler fire and a philosophy of her own.`,
        question: 'As the new cycle opens at your door, who is the woman you want to begin it as?',
      },
    ],
    weatherPattern: [
      { season: 'Jul – Sep 2026', element: 'fire', invitation: 'Ride the wind; begin things; spend the good fortune.' },
      { season: 'Oct – Jan 2027', element: 'water', invitation: 'Let the fire soften toward mercy; hold decisions loosely.' },
      { season: 'Dec – Feb 2027', element: 'earth', invitation: 'Build a philosophy that is genuinely your own.' },
      { season: 'Jan – Apr 2027', element: 'air', invitation: 'Set down what you have outgrown; let the new vision in.' },
      { season: 'Apr – Jul 2027', element: 'aether', invitation: 'Heal the heart; begin the new cycle as your truer self.' },
    ],
    goldenThread: `One arc runs through the whole year: the fire is softened, and the meaning-maker is born. For a lifetime your equinox Sun has been the one who begins — bright, cardinal, self-sufficient, crowned by an effortless Grand Trine in fire. This year the sky does something it rarely gets the chance to: Neptune reaches that Sun and teaches it tenderness; Saturn builds the softened fire into a philosophy of your own; Uranus clears out what you've outgrown; and Jupiter, having enlarged you all year, ends by opening a brand-new twelve-year cycle at your own door. You do not lose the fire — the Grand Trine forbids it. You gain the thing the fire always lacked: mercy, meaning, and the patience to warm rather than only to ignite. The beginner learns, at last, to also tend.`,
    questions: [
      'What is the new thing wanting to begin through you this year?',
      'Where is your certainty being invited to become compassion?',
      'What philosophy, entirely your own, is ready to be spoken?',
      'As a new cycle opens, who is the self you want to begin it as?',
    ],
    closing: {
      title: 'A Word for the Year',
      body: 'Seasons do the growing; the one who was born at the turning of the year knows this better than most. Nothing in this sky decides for you — it only names the weather: a year that softens your fire without quenching it, and hands you, at its close, a fresh spring to begin from. Walk it at your own pace, let yourself be tended as you have tended others, and step through the new door already warmed.',
    },
  },
};
