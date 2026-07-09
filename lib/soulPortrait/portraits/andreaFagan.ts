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
 * PART II (The Year Ahead) is traced to her 12-month Astrograph transit
 * report (starting 7/8/2026) — transit DATA only (bodies, aspects, dates);
 * all prose written fresh. The report's interpretation text is copyright
 * Henry Seltzer / Astrograph and is NEVER copied. (An earlier in-session
 * computed sweep was superseded by this report after its aspect labels were
 * found buggy — the report is ground truth.) The year's majors: Jupiter
 * through her natal 4th house all year (exact Jul 6, 2026) · Jupiter conj.
 * natal Uranus (exact Jul 8, 2026) · Pluto conj. the Midheaven (Sep 5 –
 * Nov 23, 2026) · Pluto opp. natal Uranus (Aug 19 – Dec 9) · Uranus square
 * natal Moon (exact Jun 9, 2026; Dec 23 R; Mar 25, 2027) · Neptune trine
 * natal Uranus (exact Nov 20 R; Jan 3) + sextile MC · Saturn square natal
 * Mercury (exact Nov 6 R; Jan 12) · Jupiter conj. natal Pluto (exact Dec 13;
 * again Jul 11, 2027) · Jupiter square natal Saturn (exact Nov 24; Dec 31 R;
 * Jul 8, 2027) · Chiron opp. natal Neptune (exact Nov 9 R; Mar 2) · Uranus
 * sextile natal Uranus (exact Jan 26 R; Feb 20) + trine the MC · Chiron
 * trine natal Jupiter (exact Jul 12, 2026; Apr 24, 2027) + trine natal Moon
 * (exact May 27, 2027) · Saturn square natal Sun (exact Apr 17, 2027) ·
 * Saturn sextile natal Venus (exact May 18) · Saturn trine natal Pluto
 * (exact Jul 8, 2027) · Saturn opp. natal Neptune (exact Jul 23, 2027) ·
 * Jupiter into the natal 5th house (Jul 8, 2027 onward).
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

  // DRAFT offeredBy — Kelly: correct `relationship` (one word) and edit the
  // opening in your own voice before delivery. No relationship is claimed in
  // the prose itself.
  offeredBy: {
    relationship: 'a friend',
    giverName: 'Kelly',
    giftOpening: `Every life carries a quiet music.

This one is yours — the steadiness people rest on, the care that remembers everything, and the table that has always had room for one more. It seemed worth gathering here and reflecting back, so you could see what everyone around you has always seen.

The stars reveal the weather; your soul chooses how to walk through it. Read this as a mirror offered with warmth — and keep what your own heart already knows is true.

— Kelly`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Andrea',
      attribution: 'Offered with love by Kelly',
      framing:
        'A reflection on who you are, and who you are still becoming — written in the language of soul and symbol. The stars reveal the weather; your soul chooses how to walk through it.',
    },
  },

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
      title: 'The Gathering at the Hearth',
      subtitle: 'The shape of your whole sky',
      body: `To know you, a person has to see the shape of your chart, not just its pieces — and your chart has a shape that astrologers stop and look at twice.

Four planets stand together in your Fourth House — the house of home, roots, family, and the deep interior of a life. Your Moon is there, and Jupiter beside it; but so are Uranus and Pluto. That is not a quiet domestic corner. That is a power center. It means home, for you, has never been merely the place you rest — it is the place your life actually happens from: where your feeling nature lives (the Moon), where your generosity multiplies (Jupiter), where your originality flashes (Uranus), and where your deepest transformations have always done their work (Pluto). The kitchens and living rooms of your life have held more lightning and more alchemy than most people's grand adventures. People sense this without knowing why: being welcomed into your home is being let into the engine room.

Around that gathering, the elements arrange themselves the way the rest of this portrait has described: Water leads — four of your ten planets swim in the feeling signs, which is why empathy is your first intelligence and memory your native art. Earth holds the container — the Taurus rising, the Virgo Moon — turning all that feeling into tending, craft, and rooms that work. Air gives it a bright thread of wit and community, and Fire keeps a low, long flame of quiet courage underneath. And your modalities sit in rare balance, tilted just slightly toward the mutable: you initiate when it matters, hold fast when it counts, and adapt — gracefully, endlessly — through everything between. It is the elemental signature of a life built not on force but on faithfulness.

Hold the shape and the portrait becomes simple: a water-led soul, earthed by devotion, whose greatest power has always gathered at the hearth. Everything else in these pages is that one truth, seen from different rooms of the house.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
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
      title: 'Practices',
      subtitle: 'Small doors, opened often',
      body: `For the Steward — once a season, hand something on deliberately: a recipe taught rather than served, a story told with its ending, a key copied for someone else's pocket. Stewardship completes itself in the giving.

For the Storyteller — say the remembered detail out loud. When you notice you have kept someone's small history safe, tell them. It is a gift only you can give, and it costs one sentence.

For the one who is always tending — practice receiving on purpose: one offered kindness a week accepted without deflection, without repayment arithmetic. Let the circle carry you back.

For the horizon — keep one standing engagement that is not a duty: the class, the trip, the long lunch on the far side of town. Somewhere the road can find you.`,
    },

    // 14 ─────────────────────────────────────────────────────────────────────
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
  // Transit DATA from her Astrograph 12-month report (starting 7/8/2026);
  // all prose fresh. Seltzer interpretation text never copied.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Seasonal Spiral',
    timeframe: 'July 2026 – July 2027',
    openingHeadline: 'The hearth fills while the summit transforms.',
    openingTheme: `Two great movements share this year, and they could not be more different in temperament — which is exactly the point.

The first is domestic and generous: Jupiter enters your fourth house — the house of home, roots, and belonging — in the first week of July 2026 and stays for the entire year, arriving in the same breath as an exact meeting with your natal Uranus. The hearth year: warmth, renewal, and genuine surprise arriving through the very rooms you have always tended. The second is vocational and profound: through the autumn, Pluto stands at your Midheaven — the summit of the chart, your place in the public world — while opposing your natal Uranus. What you are FOR, out there in the community, is being slowly and permanently remade.

And running beneath both, all winter long, Uranus squares your Moon: feelings long kept in the pantry of the heart begin expressing themselves in ways that may genuinely surprise you. Not a crisis — a breakout. The keeper's own feelings asking, at last, for a seat at the table she sets for everyone else. Neptune, meanwhile, spends the year in flowing trine to your natal Uranus and sextile to that same Midheaven, softening the whole transformation with imagination and quiet faith.

None of this decides anything. It describes a season's weather — hearth and summit at once — and the walking of it remains entirely yours.`,
    phases: [
      {
        element: 'earth',
        title: 'The Blessed Hearth',
        timeframe: 'Midsummer – Early Autumn 2026 · July – September',
        transits: [
          'Jupiter enters the natal 4th house (exact Jul 6, 2026 — for the whole year)',
          'Jupiter conjunct natal Uranus (exact Jul 8, 2026)',
          'Chiron trine natal Jupiter (exact Jul 12, 2026) and trine natal Moon (July – August)',
        ],
        body: `The year opens at home, and opens generously. Jupiter settles into your fourth house for a full year — a season when the rooms you tend tend you back — and its first act is to touch your natal Uranus exactly: renewal arriving through the familiar, the freshening of things you thought were finished changing. At the same time, Chiron moves in gentle trine to your Moon and Jupiter — old feelings, old inherited philosophies, mending quietly rather than dramatically. Let the house be good to you. Redecorate, gather, host, rest. The foundations are being blessed before the bigger weather arrives.`,
        question: 'What in your home — or your idea of home — is ready to be renewed rather than merely kept?',
        practice: { label: 'Earth practice', prompt: 'Change one room, or one ritual in it, purely because it delights you — not because anyone needs it.' },
      },
      {
        element: 'fire',
        title: 'The Forge at the Summit',
        timeframe: 'Autumn – Early Winter 2026 · September – December',
        transits: [
          'Pluto conjunct the Midheaven (Sep 5 – Nov 23, 2026)',
          'Pluto opposite natal Uranus (Aug 19 – Dec 9, 2026)',
          'Mars conjunct natal Sun (exact Sep 9) and conjunct natal Uranus (exact Sep 30)',
          'Jupiter square natal Saturn (exact Nov 24; again Dec 31 R)',
        ],
        body: `Then the deep work begins. Pluto — the slowest, most thorough of movers — crosses your Midheaven through the autumn: the point of the chart that names your place in the public world. This is not a small visitor. Roles that no longer fit may fall away; a truer form of what you are FOR in your community asks to be born. Mars lends the season real fire, crossing your Sun in September, and Jupiter's square to your Saturn puts friendly pressure on old structures: expand, or explain why not. The forge is hot on purpose. What is being made in it is yours.`,
        question: 'If your place in the wider circle were being recast truer — what would you want cast into it?',
      },
      {
        element: 'water',
        title: 'The Feelings Break Surface',
        timeframe: 'Midwinter · December – February',
        transits: [
          'Uranus square natal Moon (exact Dec 23, 2026 R; again Mar 25, 2027)',
          'Jupiter conjunct natal Pluto (exact Dec 13, 2026)',
          'Neptune trine natal Uranus (exact Jan 3, 2027) and sextile the Midheaven',
          'Chiron opposite natal Neptune (exact Nov 9, 2026 R; again Mar 2, 2027)',
          'Saturn square natal Mercury (exact Nov 6, 2026 R; again Jan 12, 2027)',
        ],
        body: `Midwinter belongs to your native element, and this year it runs deep. Uranus squares your Moon through the heart of winter: feelings long filed away under "handled" surface in new and surprising forms — restlessness at home, sudden clarity about old bonds, emotion that will not wait its turn. Let it speak; it is the truest weather of the year. Chiron's opposition to Neptune softens one long-held ideal so a truer one can form, and Saturn slows your words to a winter pace — fewer, heavier, truer. The Virgo Moon beside Jupiter in your nature knows exactly what to do with all this: give the flood a container, and it becomes a well.`,
        question: 'Which feeling have you been managing that is asking, this winter, to simply be felt?',
        practice: { label: 'Water practice', prompt: 'Keep a small winter notebook by the bed. Mornings, three lines — not plans, just what the night left behind.' },
      },
      {
        element: 'air',
        title: 'The Renewed Mind',
        timeframe: 'Late Winter – Spring 2027 · February – April',
        transits: [
          'Uranus sextile natal Uranus (exact Jan 26 R; Feb 20, 2027)',
          'Uranus trine the Midheaven (Dec 2, 2026 – Apr 14, 2027)',
          'Chiron trine natal Pluto (exact Feb 15) and quintile natal Mercury (exact Feb 11)',
          'Jupiter sextile natal Venus (exact Oct 19; Feb 6 R; Jun 16 — three passes)',
        ],
        body: `As the light returns, so does the spark. Uranus makes its friendly sextile to its own natal place — the elder's quickening, seminal ideas arriving as seeds of a new season of thought — while its long trine to your Midheaven quietly opens doors in the public sphere: the wake-up call that arrives as opportunity rather than upheaval. The winter's disciplined words now have somewhere to go. And threaded through the whole year, Jupiter returns three times to bless your Venus — affection, art, company, delight — as if the sky were insisting the year be enjoyed as well as survived. Say the real thing; the room is finally ready for it.`,
        question: 'What is the sentence you have been polite instead of saying?',
      },
      {
        element: 'aether',
        title: 'The Ripening',
        timeframe: 'Late Spring – Summer 2027 · April – July',
        transits: [
          'Saturn square natal Sun (exact Apr 17, 2027)',
          'Chiron trine natal Jupiter (exact Apr 24) and trine natal Moon (exact May 27)',
          'Saturn sextile natal Venus (exact May 18)',
          'Saturn trine natal Pluto (exact Jul 8) · Saturn opposite natal Neptune (exact Jul 23)',
          'Jupiter square natal Saturn (exact Jul 8) · Jupiter conjunct natal Pluto (exact Jul 11)',
          'Jupiter enters the natal 5th house (Jul 8, 2027 onward)',
        ],
        body: `The year converges. In April, Saturn squares your Sun — the season's one sober question, asked kindly: of everything this year opened, what will you actually keep and stand inside? Affection steadies you through it (Saturn's sextile to Venus), and Chiron returns to bless the Moon and Jupiter one more time — the mending that began at the hearth completing its circle. By midsummer, Saturn's trine to Pluto grants endurance to whatever you have chosen, while its opposition to Neptune retires one long illusion gently into something real. And then — the door out of the year: Jupiter crosses into your fifth house, the house of play, creativity, and joy. The hearth year ends at the threshold of a delight year. Harvest, then festival.`,
        question: 'What did this year grow that deserves a permanent place — and what is ready to become play?',
      },
    ],
    weatherPattern: [
      { season: 'Jul – Sep 2026', element: 'earth', invitation: 'Let the house be good to you; welcome renewal through the familiar.' },
      { season: 'Sep – Dec 2026', element: 'fire', invitation: 'Let the public role be remade truer; own the forge.' },
      { season: 'Dec – Feb 2027', element: 'water', invitation: 'Let long-kept feelings surface; give the flood a container.' },
      { season: 'Feb – Apr 2027', element: 'air', invitation: 'Fewer, truer words — then say them; walk through the opening doors.' },
      { season: 'Apr – Jul 2027', element: 'aether', invitation: 'Choose what to keep; retire one illusion kindly; turn toward joy.' },
    ],
    goldenThread: `One arc runs through the whole year, and it is the very tension your birth chart has always carried — hearth and horizon — finally moving together instead of against each other. And the sky is precise about it: your chart's power center is that four-planet gathering in the Fourth House, and this is the year Jupiter walks straight into it — the hearth's whole engine room blessed for twelve months — while Pluto crosses the Midheaven at the opposite pole: the keeper's private world filled at exactly the moment her public purpose transforms. And Uranus square the Moon is the bridge between them — the feelings breaking surface are precisely the ones the new, truer public role will need. The year does not ask you to choose between the near flame and the wider circle. It spends twelve months teaching them to be the same fire. And when it ends, it opens not onto more work — but onto a year of play.`,
    questions: [
      'If your home and your purpose stopped competing, what would a single life containing both look like?',
      'What role are you being offered this year that you keep almost accepting?',
      'Who will you let carry something for you this year — and when?',
    ],
    closing: {
      title: 'A Word for the Year',
      body: 'Seasons do the growing; the gardener chooses what to plant and what to keep. Nothing in this sky decides for you — it only describes the weather. Walk it at your own pace, in your own way, and let the year find you already at the table, with the door open.',
    },
  },
};
