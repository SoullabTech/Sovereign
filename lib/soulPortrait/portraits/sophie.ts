/**
 * Soul Portrait — Sophie Claire Nezat
 * ────────────────────────────────────────────────────────────────────────
 * The author's firstborn daughter — 17, entering her senior year at Sacred
 * Heart. A Father's Day gift (2026): hand-delivered, unlisted, noindex.
 * Mentor OFF, MAIA OFF, memory OFF — the safe default for a minor's gift, as
 * with Katie. (Augusten's Mentor-on is a separate, documented exception.)
 *
 * Born December 24, 2008. Chart from her Astrograph natal + 12-month transit
 * reports — used ONLY as data; all prose written fresh (the reports'
 * interpretations are copyright and are never copied):
 *   Capricorn Sun (3°, 12th) · Capricorn Rising · Moon in Sagittarius (1°, 11th)
 *   Mercury in Capricorn (1st) · Venus, Neptune & Chiron in Aquarius (1st) ·
 *   Jupiter in Capricorn (1st) · Mars in Sagittarius (12th) · Uranus in Pisces
 *   (2nd) · Pluto in Capricorn (12th) · North Node 11° Aquarius (1st) · South
 *   Node Leo (7th) · "Bowl" chart, led by Saturn conjunct the Ascendant.
 *
 * The chart's spine (Kelly 2026-06-20): two stelliums — five planets in the
 * 1st (presence) and three in the 12th (hidden depth) — bridged by Saturn on
 * the Ascendant. constitution (stelliums) → integration (Saturn bridge) →
 * direction (the North Node, rendered as "Your North Star").
 *
 * The Year Ahead closing ("A Father's Blessing") is drafted FROM KELLY'S OWN
 * WORDS spoken 2026-06-20 — his to finalize or replace by hand. Not to be
 * treated as final, and not to deploy, until he confirms it reads exactly right.
 *
 * Source draft + standards: docs/architecture/SOUL_PORTRAIT_SOPHIE_NATAL_DRAFT.md
 */

import type { SoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const sophiePortrait: SoulPortrait = {
  person: {
    name: 'Sophie Claire Nezat',
    slug: 'sophie',
    age: 17,
    pronouns: 'she/her',
    isMinor: true,
  },

  mode: 'parent-child',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF for a minor's
  // gift; /api/soul-portrait/sophie/mentor stays unreachable.

  offeredBy: {
    relationship: 'her father',
    giverName: 'Dad',
    giftOpening: `Every life carries a quiet music.

This portrait is an invitation to listen for yours — a reflection on who you are, and on who you are becoming.

Keep whatever rings true. Set the rest gently aside. Return to it whenever life reveals another layer of you.

Welcome.`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Sophie Claire',
      attribution: 'Offered with love by your Dad',
      framing:
        'A reflection on who you are becoming — patterns to recognize, never a forecast and never a verdict. Read it gently: keep whatever rings true, and set aside anything that doesn’t.',
    },
  },

  birthData: {
    date: 'December 24, 2008',
    note: 'The chart is read symbolically — as a map of the sky under which a life began, never a prediction of where it goes.',
  },

  natalChartSummary: {
    placements: [
      {
        body: 'Sun',
        sign: 'Capricorn',
        house: 12,
        meaning:
          'A serious, capable core held in the most inward house of the chart — a self that runs deep and private. Capricorn integrity and gravity, lived more beneath the surface than on it. You are steadier, and deeper, than you let on.',
      },
      {
        body: 'Moon',
        sign: 'Sagittarius',
        house: 11,
        meaning:
          'An emotional nature at home among friends and big questions. Warm, honest, loyal, freedom-loving — your heart is fed by genuine friendship and a far horizon.',
      },
      {
        body: 'Ascendant',
        sign: 'Capricorn',
        angle: 'Rising',
        meaning:
          'You meet the world with a quiet maturity and a clear, strong outline. People sense someone composed, capable, and real — a person who can be trusted.',
      },
      {
        body: 'Saturn',
        sign: 'Capricorn',
        angle: 'conjunct the Ascendant — leads the chart',
        meaning:
          'The planet of mastery and integrity stands at the threshold of your personality and leads your whole chart. It is the source of your gravity, and the bridge between your hidden depths and your outward self.',
      },
      {
        body: 'Mercury',
        sign: 'Capricorn',
        house: 1,
        meaning:
          'A quick, clever, capable mind right at the front of your chart. You think clearly and carefully — and you mean what you say.',
      },
      {
        body: 'Venus, Neptune & Chiron',
        sign: 'Aquarius',
        house: 1,
        meaning:
          'Grace, imagination, and a healer’s sensitivity woven into your very presence — original, humane, a little unconventional, and quietly lovely in how you move through the world.',
      },
      {
        body: 'Jupiter',
        sign: 'Capricorn',
        house: 1,
        meaning:
          'Faith and a sense of growth built into who you are — a steadying optimism that takes the long, patient view.',
      },
      {
        body: 'Mars',
        sign: 'Sagittarius',
        house: 12,
        meaning:
          'A fierce, loyal will that works quietly. Your fire shows up most in devotion — you defend and you keep the people you love.',
      },
      {
        body: 'Pluto',
        sign: 'Capricorn',
        house: 12,
        meaning:
          'Deep, slow power in the hidden house — an old soul’s capacity for transformation, working far beneath the surface.',
      },
      {
        body: 'North Node',
        sign: 'Aquarius',
        house: 1,
        meaning:
          'Not a planet but a direction — your growing edge. It points toward becoming fully, freely, and individually yourself.',
      },
    ],
    synthesis:
      'Read together, these draw a rare kind of person: an old soul with a builder’s steady hands and an original, humane mind. Almost everything gathers into two places — a five-planet stellium at the front of the chart (your presence) and a deep gathering in the twelfth house (your hidden inner world), bridged by Saturn at the threshold. The result is someone both vividly present and privately deep, capable on the surface and oceanic underneath, with a heart that reaches toward friendship, meaning, and a fairer world. None of it is fixed — it is a set of strong tendencies, the raw material of the woman she is becoming.',
  },

  // 1. Opening Letter ────────────────────────────────────────────────────────
  openingLetter: `There's a particular kind of person who seems, even when young, to have been here before. You're one of them.

At seventeen, standing at the doorway of your last year of school, you already carry something steady and deep — a seriousness that isn't heaviness, a capability that doesn't need to announce itself. This letter isn't here to tell you who you are; only your own life can do that. Think of it as a mirror held up with love, reflecting back a few of the gifts already alive in you, and a compass pointing toward what seems most yours to become.

Keep what rings true. Set the rest gently aside. The year ahead is a threshold, and you are more ready for it than you know.`,

  // 2. Soul Signature ────────────────────────────────────────────────────────
  soulSignature: {
    headline: "An old soul with a builder's steady hands, an original mind, and a free, far-reaching heart.",
    body: `Your chart holds a rare combination. There's a deep gravity to you — a Capricorn Sun and Capricorn Rising, with Saturn (the planet of mastery and integrity) leading your whole chart and standing right at the threshold of your personality. That gives you a maturity beyond your years: you take things seriously, you can be trusted, you'd rather do something well than quickly.

But you are not only earnest — and here the chart does something rare. Almost everything in you gathers into two places. Right at the front — your First House, the house of self and presence — sits a cluster of five: Mercury and Jupiter in Capricorn beside Venus, Neptune, and Chiron in Aquarius. Astrologers call this a stellium, an unusual concentration of planets, and it means a great deal is constellated around your way of meeting the world — a quick mind, a warm heart, a vivid imagination, real faith, and a healer's sensitivity, all woven into how you come toward life. You are, simply, a lot of person: grounded and original in the same breath.

And just behind that bright surface, a second gathering hides in your Twelfth House — the most inward, soul-deep room of the chart: your Sun, your Mars, and Pluto all gather there. This is the other half of you — a profound inner world that many people only gradually come to know: a quiet power, a sensitivity to the unseen, an old and deep knowing. So much of who you are lives beneath.

And Saturn — the same planet leading your chart — stands in the doorway between these two worlds, your hidden depths and your outward self. That is why you can feel, even at seventeen, both vividly present and privately deep: capable and bright on the surface, oceanic underneath. You were built on a threshold — an inner world of great depth, and a doorway of real presence through which it reaches the world. Your free Sagittarian Moon, meanwhile, reaches past it all toward friends, far horizons, and an idealism that quietly wants to make the world kinder.

And people feel this in you. Venus — the planet of grace and beauty — sits right at the front of your chart, lending a natural loveliness to how you move through the world; Mercury gives you a quick, clever mind; and Saturn draws your whole personality in a clear, strong line. You are, and have always been, unmistakably and originally yourself — not a follower, not a copy.`,
  },

  // 3. Elemental Architecture ────────────────────────────────────────────────
  elementalProfile: [
    {
      element: 'earth',
      keyword: 'grounding, habits, responsibility',
      title: 'Earth — the steady builder',
      body: `Capricorn shapes your Sun, your Rising, your mind (Mercury) and your growth (Jupiter), with Saturn leading the whole chart. This is real capability: you can commit, follow through, and build things that last.

The practice is to let "good enough, done with care" be enough — your worth was never the size of your achievements.`,
    },
    {
      element: 'air',
      keyword: 'curiosity, communication, ideas',
      title: 'Air — the original mind',
      body: `Venus, Neptune, and Chiron in Aquarius, joined to a curious Sagittarian Moon, give you an inventive, humane, slightly unconventional way of seeing. You're drawn to ideas, to fairness, to what could be better.

Protect that originality. The world needs people who can imagine differently.`,
    },
    {
      element: 'fire',
      keyword: 'courage, purpose, vitality',
      title: 'Fire — the free, idealistic heart',
      body: `Your Sagittarian Moon and Mars want freedom, meaning, and a far horizon. You're warmed by big questions, honest friendships, and the sense that your life is going somewhere that matters.

Follow that fire — it points toward your purpose.`,
    },
    {
      element: 'water',
      keyword: 'heart, empathy, emotional wisdom',
      title: 'Water — the deep inner world',
      body: `With your Sun, Pluto, and Mars in the Twelfth House and Neptune right in your first, you feel and perceive far more than you let on. This is a gift of depth and compassion.

The skill to grow is letting trusted people in — depth this real is meant to be shared, not only carried.`,
    },
    {
      element: 'aether',
      keyword: 'meaning, spirit, mystery',
      title: 'Aether — the quiet sense of meaning',
      body: `There's a spiritual thread in you that doesn't need a name. Moments of beauty, solitude, music, or wonder aren't escapes for you; they're how you remember what's real.`,
    },
  ],

  // 4. Archetypal Profile — companions, not cages ────────────────────────────
  archetypalProfile: [
    {
      key: 'builder',
      name: 'The Builder',
      essence: 'Capricorn craft — you bring vision into form, patiently and well, with the capacity to commit and to finish.',
      gift: 'You can make real, lasting things, not only imagine them.',
      shadow: 'Believing you must earn your worth by producing. Your worth was never the output.',
      resonance: 'strong',
    },
    {
      key: 'sage',
      name: 'The Old Soul / Sage',
      essence: 'You perceive clearly and carry a calm, grounded wisdom that seems older than your years.',
      gift: 'People feel steadier, and more understood, around you.',
      shadow: 'Feeling older or apart from your peers. Let yourself be young, too.',
      resonance: 'strong',
    },
    {
      key: 'healer',
      name: 'The Healer / The Confidante',
      essence:
        'Chiron woven into your very identity, and a Moon at home among friends — what is tender in you becomes medicine for others, and you’re often the one people turn to for real counsel.',
      gift: 'People feel safe bringing you their real selves.',
      shadow: 'Tending everyone but yourself. The healer must be held, too.',
      resonance: 'strong',
    },
    {
      key: 'explorer',
      name: 'The Visionary',
      essence: 'An Aquarian originality that sees how things could be fairer and freer.',
      gift: 'You hold an honest hope for people and for what’s possible.',
      shadow: 'Ideals outrunning the patient daily work. Let the vision touch the doable.',
      resonance: 'present',
    },
    {
      key: 'seeker',
      name: 'The Seeker',
      essence: 'A Sagittarian heart reaching for meaning and far horizons.',
      gift: 'You keep your life pointed at what actually matters.',
      shadow: 'Always leaving before arriving. Some treasures are found by staying.',
      resonance: 'present',
    },
  ],

  // 5. The featured heart — The Old Soul ──────────────────────────────────────
  seerAndProphet: {
    title: 'The Old Soul',
    subtitle: 'Where your depth becomes a gift',
    body: `Someone may have noticed it about you already: a depth that seems older than seventeen. Your Sun lives in the Twelfth House — the most private, inward part of the chart — which means a great deal of who you are unfolds beneath the surface, in a rich inner life most people never fully see. And Saturn, the planet of soul-work and integrity, leads your entire chart.

This is the signature of an old soul: someone who feels responsible early, who senses more than she says, who would rather be real than impressive. It can feel, at times, a little lonely — as though you're carrying something others your age aren't. You're not carrying it wrong. You're simply carrying it early.

And yet that very depth is what draws people toward you. You're often the one your friends come to when they need to be truly heard — the wise one, the one who gives real counsel and can hold what someone else is carrying. That isn't an accident. Your Moon sits in Sagittarius in the house of friendship, tuned to honesty and meaning, and Chiron — the deep healer — is woven right into who you are; people sense they can bring you their real selves. And you don't only listen — you're fiercely loyal: with Mars, the planet of fire and will, also in Sagittarius, your devotion has teeth. When you love someone, you show up, you defend them, you keep them. A friend of yours is a friend for life. Being the one others turn to — and the one who never lets them fall — is one of the truest expressions of your nature. Just remember that the wise woman needs tending too — let your friends carry you sometimes. A well stays deep because it's allowed to be refilled.

And here is the quiet truth your chart keeps returning to: the tender places in you (Chiron, woven right into your identity) are not flaws to hide. In time, they become exactly where your gift lives. The depth that sometimes feels heavy becomes the depth that lets you understand people, create something true, and offer the world a steadiness it badly needs. Your seriousness is not the absence of joy — it's the soil joy grows in.`,
    blessing: [
      'May you carry your depth without it ever feeling like a weight.',
      'May you let the people you tend learn to tend you, too.',
      'May you trust that your seriousness and your joy belong together.',
      'May the tender places in you become exactly where your gift lives.',
      'And may you be as gentle with yourself as you are with everyone you love.',
    ],
  },

  // 6. Challenges as Training ─────────────────────────────────────────────────
  challengesAsTraining: {
    body: `Every strength casts a shadow — not a flaw, but the exact place a real gift asks for a matching skill. A few seem woven through your chart.`,
    trainings: [
      {
        challenge: 'Capricorn’s inner critic — the quiet voice that says "never quite enough," even when you’ve done beautifully.',
        training: 'Letting your effort serve your life rather than judge it. Good, done with care, is usually exactly enough.',
      },
      {
        challenge: 'The Twelfth-House habit of hiding what you feel — carrying your inner world alone.',
        training: 'Letting trusted people in. Depth shared becomes connection, not a burden.',
      },
      {
        challenge: 'Carrying responsibility that was never all yours to hold.',
        training: 'Remembering you’re allowed to be seventeen — to set some of it down.',
      },
      {
        challenge: 'Idealism that can be hard on an imperfect world (and on an imperfect you).',
        training: 'Holding the vision and loving what’s real, today, at the same time.',
      },
    ],
  },

  // (Forward-pointing beam — rendered between Challenges and the Threshold Year)
  northStar: {
    title: 'Your North Star',
    subtitle: 'The Direction of Becoming',
    body: `Everything so far describes who you already are. This piece is different — it points to where you're growing.

Astrology marks a point called the North Node. It isn't a planet, and it isn't a description of your character; it's a direction — a star to steer by, the growing edge along which your life wants to unfold. Yours sits in Aquarius, in your First House, woven right into that bright cluster at the front of your chart, beside your Venus, Neptune, and Chiron. Even your growth runs through your most original, tender, healing self.

What it points toward is this: becoming fully, freely, unmistakably yourself. Your path of growth is to stand in your own individuality — to trust your original mind and your humane, feeling heart, and to let your life be authored by you rather than borrowed from anyone else's expectations.

And the current it grows away from — the South Node, in Leo, in your house of relationship — is a telling one, given who you are. It's a lifelong pull to find yourself mainly through others: through being needed, being the dependable one, the wise friend everyone leans on, the one who tends everyone's needs but her own. None of that is wrong — it's a real gift, and we named it as one. The growth is gentler and simpler than giving it up: you are allowed to belong to yourself, too. You don't have to earn your place by being useful to everyone. You can let yourself be carried sometimes. You're allowed to want things for you.

So if you ever feel a quiet tension between caring for everyone and tending your own life — that isn't a flaw. That's your North Star doing exactly what it's meant to do: turning you, gently and over years, toward becoming wholly yourself.`,
  },

  // 7. Becoming a Young Woman — the threshold year ───────────────────────────
  developmentalStage: {
    label: 'Becoming a Young Woman',
    ageRange: 'The Threshold Year',
    body: `This is a doorway year. Senior year sits right on the line between the world you've known and the one you're about to step into — and your chart is built for thresholds. You don't have to have it all decided. The task of this season isn't to choose perfectly; it's to keep listening for what feels true — the path that's actually yours, not the one that merely looks right.

You are allowed to want a big life and a meaningful one. You are allowed to be both grounded and free. Walk toward what makes you feel most alive, and trust that the steadiness you already carry will hold you while you find out.`,
  },

  // 8. Questions for This Season ──────────────────────────────────────────────
  reflectionQuestions: [
    'What feels most true to me right now — underneath what looks impressive?',
    'Where am I carrying responsibility that was never only mine to hold?',
    'Who are the people I can let all the way in?',
    'What would I build, or change, if I trusted my own vision a little more?',
    'When do I feel most free — and most like myself?',
  ],

  // 9. Parent / Guide Notes (for Dad) ─────────────────────────────────────────
  guidanceForParents: [
    'Reflect her depth back without making it heavy. "I see how much you carry" steadies her more than "you’re so mature."',
    'Her seriousness is real — so make space for her to be young, silly, free. The Sagittarian Moon needs room to roam.',
    'Take her ideals seriously even when they’re inconvenient; being taken seriously is half of what she’s asking for.',
    'Praise the care and the practice, not just the achievement. A Capricorn can quietly equate worth with output — name the difference out loud.',
    'Let her have her inner world, and keep the door warmly, obviously open for when she’s ready to share it.',
  ],

  soulVocation: `Your gift may be this: to bring depth, vision, and steady care into whatever you build. The world has plenty of people moving fast; it has far fewer who can go deep, who can hold a vision and do the patient work, who can make others feel understood. Wherever your life leads, let it be the kind of contribution that leaves things — and people — a little more whole than you found them.`,

  framing: DEFAULT_FRAMING,

  // ── Part II — The Year Ahead (Seasonal Spiral) ─────────────────────────────
  // Grounded in her 12-month transit report (Astrograph, her senior year) —
  // transit DATA only; all prose written fresh, gentle, age-17, threshold-aware,
  // seasons-not-predictions. The report's interpretations are copyright and are
  // never copied. The closing is a Father's Blessing drafted from Kelly's own
  // words — his to finalize.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Year of Becoming Your Own',
    timeframe: 'June 2026 – June 2027',
    openingHeadline: 'This is the year you begin stepping into a life that is unmistakably your own.',
    openingTheme: `Your birth chart is the landscape you carry; the transits are the weather moving across it. This year's weather is a quiet, beautiful unfolding: your imagination opens, your own voice grows clearer, and — right as you reach the threshold of life after school — you begin coming into your own depth.

None of this is a prediction. It's an invitation to walk through your senior year awake to what's stirring.`,
    phases: [
      {
        element: 'air',
        title: 'A More Imaginative Mind',
        timeframe: 'Spring – Summer',
        transits: ['Neptune entering your Third House', 'Neptune touching your Sun, Mercury & Ascendant'],
        body: `Neptune moves into the part of your chart that thinks, learns, and perceives — softening the edges and opening your imagination. You may find yourself dreaming more, sensing more, drawn to beauty, music, story, and ideas that can't quite be measured. Some things may also feel less certain than they used to — and that's okay. At a threshold, not everything is meant to be decided yet.

Trust your intuition; it's becoming one of your instruments.`,
        question: 'What is my imagination showing me about the life I want?',
      },
      {
        element: 'fire',
        title: 'Your Own Creative Voice',
        timeframe: 'Summer',
        transits: ['Uranus entering your Fifth House', 'Uranus on your Sun & Moon'],
        body: `This is the spark of the year. Uranus enters your house of creativity and self-expression and lights up your Sun and Moon — an awakening of your own voice. You may feel a new pull to create, to express, to do things your way, to stop fitting a mold that was never quite yours.

Follow it. This is permission to be original — to let what's uniquely you come out into the open.`,
        question: 'Where do I most want to express what’s uniquely mine?',
      },
      {
        element: 'water',
        title: 'The Tender Thread',
        timeframe: 'Through the year',
        transits: ['Chiron touching your Venus, Moon & Sun', 'Neptune softening your heart'],
        body: `Running through the year is a tender thread — the same sensitivity woven into who you are. Feelings may run close to the surface: about friendships, about belonging, about whether you're enough. None of it needs fixing. Your tenderness isn't weakness; it's where your depth and your kindness come from.

Be as gentle with yourself this year as you'd be with someone you love.`,
        question: 'What in me is asking to be met with gentleness this year?',
      },
      {
        element: 'earth',
        title: 'Choosing Your Direction',
        timeframe: 'Autumn',
        transits: ['Saturn crossing your Midheaven', 'Saturn maturing your chart', 'Jupiter into your Eighth House'],
        body: `Saturn reaches the very top of your chart — the point of direction and calling — right as senior year asks the big question: what's next? This is the beginning of authoring your own path. Not pressure to have it solved, but the quiet, grounding work of choosing a direction that's truly yours. Your Capricorn steadiness was built for exactly this.

One true step at a time.`,
        question: 'What direction feels true to me — not just impressive, but mine?',
      },
      {
        element: 'aether',
        title: 'Coming Into Your Own Depth',
        timeframe: 'Whole year',
        transits: ['Pluto touching your Sun, Moon & Midheaven'],
        body: `Underneath it all, something slow and powerful is happening: you are coming into your own depth and strength. Pluto touches your Sun, your heart, and your direction — a deep, quiet transformation as you step toward adulthood. You are becoming more fully, more unmistakably yourself.

There's no need to rush it. You're right on time.`,
        question: 'Who am I becoming, underneath everything?',
      },
    ],
    weatherPattern: [
      { season: 'Spring–Summer', element: 'air', invitation: 'Let your imagination open' },
      { season: 'Summer', element: 'fire', invitation: 'Find your own voice' },
      { season: 'Through the year', element: 'water', invitation: 'Be gentle with your heart' },
      { season: 'Autumn', element: 'earth', invitation: 'Begin choosing your direction' },
      { season: 'Whole Year', element: 'aether', invitation: 'Come into your own depth' },
    ],
    goldenThread: `Almost everything in your year points the same direction: this is the year you begin becoming more fully, freely, and deeply yourself — right as you step toward the threshold of your own path. Your imagination opens, your creative voice awakens, you come into your own depth, and you begin choosing the direction that is truly yours.`,
    questions: [
      'What is my imagination showing me about the life I want?',
      'Where do I most want to express what’s uniquely mine?',
      'What direction feels true to me — not just impressive?',
      'Who am I becoming, underneath everything?',
    ],
    // DRAFTED FROM KELLY'S OWN WORDS (2026-06-20) — his to finalize or replace.
    // Not final until he confirms; do not deploy with this unconfirmed.
    closing: {
      title: 'A Father’s Blessing',
      body: `My firstborn —

I knew you before you were born. Even then, you were already teaching me.

I met you when you were still a spirit — a fellow journeyer, a soul I already loved — and then you came into this world as an amazing woman. Beautiful, clever, wise. An individualist with a strong, original heart. And a fiercely devoted friend.

I adore you. I am the proudest father in the world.

As you step into this threshold year, keep listening for what is true, and trust the steadiness you already carry. Let your imagination open. Let your own voice come through. Be gentle with the tender parts of you — they are not weakness; they are where your depth lives.

You don't have to perform to be loved, and your path is not already written. Your life is yours to author, one true choice at a time.

Walk into this year as yourself. The world is waiting for exactly who you are becoming — and I will be cheering for you, every step of the way.

With all my love,
Dad`,
    },
  },
};

export default sophiePortrait;
