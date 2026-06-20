/**
 * Soul Portrait — Augusten Lucas Nezat
 * ────────────────────────────────────────────────────────────────────────
 * The first sacred instance of the Spiralogic Soul Portrait — the proof-of-feel.
 * A wise letter to a young person, written with love and held with care.
 *
 * Born November 2, 2011 · New Orleans, Louisiana.
 * Chart (placements affirmed by Kelly; no degrees/aspects fabricated):
 *   Scorpio Sun (5th House) · Aquarius Moon (9th House) · Gemini Rising ·
 *   Neptune near the Midheaven · Chiron near the Midheaven.
 *
 * Re-authored 2026-06-18 to the writing standards in
 * `docs/architecture/SPIRALOGIC_SOUL_PORTRAIT_RESEARCH.md`: wonder-first voice,
 * invitational subjunctive, anti-Barnum specificity, externalized struggles,
 * archetypal ecology, elements-as-process, stage-matched (~14), ends in freedom.
 * Much of the prose is Kelly's own. "The Seer and the Prophet" is verbatim.
 */

import type { SoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const augustenPortrait: SoulPortrait = {
  person: {
    name: 'Augusten Lucas Nezat',
    slug: 'augusten',
    age: 14,
    pronouns: 'he/him',
    isMinor: true,
  },

  mode: 'parent-child',

  // The family-held exception's Mentor is the ONE explicit, visible grant of the
  // live dialogue surface (see SOUL_PORTRAIT_DEPLOY_POSTURE.md §Path A). Every
  // other portrait is Mentor-off by default until Path B's consent gate exists.
  mentorEnabled: true,

  birthData: {
    date: 'November 2, 2011',
    place: 'New Orleans, Louisiana',
    note: 'The chart is read symbolically — as a map of the sky under which a life began, not a prediction of where it goes.',
  },

  natalChartSummary: {
    placements: [
      {
        body: 'Sun',
        sign: 'Scorpio',
        house: 5,
        meaning:
          'A deep creative fire. Scorpio depth expressed through the 5th house of play, art, and authentic self-expression — the need to make something true from the inside out, and to mean it.',
      },
      {
        body: 'Moon',
        sign: 'Aquarius',
        house: 9,
        meaning:
          'An independent heart that feels most at home in big questions, ideas, and far horizons. Freedom and meaning are how this heart feels safe.',
      },
      {
        body: 'Ascendant',
        sign: 'Gemini',
        angle: 'Rising',
        meaning:
          'Meets the world through curiosity, words, and quick perception — many-sided, a natural communicator who notices a great deal, fast.',
      },
      {
        body: 'Neptune',
        angle: 'near the Midheaven',
        meaning:
          'Imagination and compassion woven into the sense of calling — a vocation likely drawn toward beauty, meaning, and what cannot be easily measured.',
      },
      {
        body: 'Chiron',
        angle: 'near the Midheaven',
        meaning:
          'A tender place that can, in time, become medicine for others. What aches here is not a flaw — it is often where the gift is kept.',
      },
    ],
    synthesis:
      'Read together, these suggest a young man whose life is unlikely to be organized mainly around achievement: a Scorpio depth that wants what is true, an Aquarian mind that reaches for the far horizon, a Gemini voice that loves to understand and explain, and a calling (the Midheaven) coloured by imagination and by the quiet work of turning hurt into help. That combination often describes someone whose path makes sense over decades rather than school years. None of it is fixed. It is a set of strong tendencies — raw material for the person he is choosing to become.',
  },

  // 1. Opening Letter — wonder first (Kelly's words) ─────────────────────────
  openingLetter: `There comes a time in every person's life when they begin asking questions that no one else can answer for them.

Who am I?
Why am I here?
What kind of man do I want to become?

At fourteen, those questions begin to awaken. You don't need all the answers yet. You aren't supposed to.

This letter isn't meant to tell you who you are. No chart, no book, and no person can do that. Only your own life can reveal who you are becoming.

Instead, think of this as a compass. Imagine standing at the entrance to a vast forest. There are many paths before you. This letter doesn't choose your path. It simply points toward the directions that seem most alive for your soul.

Every gift in these pages can be strengthened or neglected. Every challenge can become wisdom.

The stars don't decide your future. They simply describe the sky under which your journey began.`,

  // 2. Soul Signature ───────────────────────────────────────────────────────
  soulSignature: {
    headline: 'Depth and vision — a heart that loves truth more than certainty.',
    body: `Some people come into life to build. Some come to discover. Some come to heal. Some come to awaken others.

Your chart suggests something a little unusual: you seem to have come carrying both depth and vision. Your heart naturally wants to understand what lies beneath the surface. While many people ask, "What happened?" you instinctively ask, "Why did it happen?"

You may notice that easy answers rarely satisfy you. That isn't because you're difficult. It's because your soul loves truth more than certainty. This doesn't mean you'll always know the truth. It means you'll keep looking for it.

That may become one of your greatest gifts.`,
  },

  // 3. Elemental Architecture — each element as a living process (Kelly's words)
  elementalProfile: [
    {
      element: 'fire',
      keyword: 'courage, purpose, vitality',
      title: 'Fire — the courage to become yourself',
      body: `Fire is the force that says, "This is who I am."

Your Fire isn't loud. It isn't interested in impressing people. Instead, it burns deeply. When something matters to you, you give yourself completely. When something doesn't feel true, you lose interest almost immediately.

You aren't meant to live someone else's life. One day you'll discover that your greatest strength isn't being successful — it's being authentic. There is enormous courage in becoming yourself. Never underestimate that kind of courage.`,
    },
    {
      element: 'water',
      keyword: 'heart, empathy, emotional wisdom',
      title: 'Water — your heart',
      body: `One thing stands out strongly: you have a large heart. Not everyone will see it. Sometimes you may even hide it. But you care deeply. You feel injustice. You notice loneliness. You want people to be okay.

There is something beautiful in that. And there is something important to learn alongside it. A big heart does not mean carrying everyone's pain — compassion is not the same as responsibility. You will help the world most not by carrying it, but by loving it wisely.`,
    },
    {
      element: 'earth',
      keyword: 'grounding, habits, responsibility',
      title: 'Earth — building a life',
      body: `Like many imaginative people, you may sometimes live more easily in possibilities than in routines. Ideas come naturally; structure takes practice. This isn't a weakness — it's simply part of your education.

Every musician practices scales. Every athlete trains. Every craftsman repeats simple movements thousands of times. Your dreams deserve the same kind of care. The extraordinary life is almost always built from ordinary daily choices. Never think small habits are beneath you — they are how great lives are made.`,
    },
    {
      element: 'air',
      keyword: 'curiosity, communication, ideas',
      title: 'Air — your mind',
      body: `Your mind is wonderfully curious. Questions excite you. New ideas energize you. You may enjoy learning things simply because they're fascinating.

Protect that curiosity. The world sometimes mistakes curiosity for distraction — don't let anyone convince you that asking questions is a problem. Questions are how wisdom begins. Just remember something equally important: not every question needs an immediate answer. Some questions are meant to accompany you for years. Let them.`,
    },
    {
      element: 'aether',
      keyword: 'meaning, spirit, mystery',
      title: 'Aether — the quiet voice',
      body: `There may be moments in your life when you sense something larger than yourself. A sunset. Music. A conversation. Walking in the woods. Looking up at the stars.

These moments are not interruptions. They are reminders. There is a quiet wisdom that speaks beneath words. You don't have to force it. You don't have to chase it. Simply learn to notice. The deepest guidance usually whispers.`,
    },
  ],

  // 4. Archetypal Profile — an ecology of companions, not one label ───────────
  archetypalProfile: [
    {
      key: 'seeker',
      name: 'The Seeker',
      essence: 'You are drawn to the question more than the easy answer — the true one, not the popular one.',
      gift: 'Honest curiosity. You go looking where others stop.',
      shadow: 'Searching can become a way of never settling. Some questions are answered by living them, not only thinking them.',
      resonance: 'strong',
    },
    {
      key: 'sage',
      name: 'The Sage / The Seer',
      essence: 'You notice patterns and feel the difference between what is true and what is merely loud.',
      gift: 'Perception. You see what others miss, and you can name it.',
      shadow: 'Seeing more can tempt anyone to feel above others. The Seer’s whole work is to stay humble and let sight serve.',
      resonance: 'strong',
    },
    {
      key: 'storyteller',
      name: 'The Storyteller',
      essence: 'A Gemini voice and a Neptune imagination — you can give shape to meaning so other people can feel it too.',
      gift: 'You make ideas and feelings shareable. That is a kind of bridge-building.',
      shadow: 'Words can perform instead of tell the truth. The best stories make people more honest, not more impressed.',
      resonance: 'strong',
    },
    {
      key: 'alchemist',
      name: 'The Alchemist',
      essence: 'A Scorpio gift: you can take something painful or intense and turn it into something new.',
      gift: 'Transformation. You are not afraid of the hard or the hidden.',
      shadow: 'Intensity can turn inward and brood. Alchemy needs air and light, not only depth.',
      resonance: 'present',
    },
    {
      key: 'healer',
      name: 'The Healer',
      essence: 'Chiron near your Midheaven points here: what hurts in your own life can become how you help others.',
      gift: 'Compassion joined with understanding — you can sit with people in hard places.',
      shadow: 'Trying to heal others before tending yourself. The greatest healers keep learning how to heal themselves.',
      resonance: 'emerging',
    },
    {
      key: 'explorer',
      name: 'The Explorer',
      essence: 'A 9th-house Moon loves far horizons — new places, new ideas, the edge of the known.',
      gift: 'Courage to cross thresholds and trust the journey.',
      shadow: 'Always leaving before arriving. Some treasures are only found by staying.',
      resonance: 'present',
    },
    {
      key: 'guardian',
      name: 'The Guardian',
      essence: 'Your loyalty and your care for what is fair can make you a protector of people who are overlooked.',
      gift: 'Faithfulness to the vulnerable.',
      shadow: 'Protecting can become controlling. True guarding leaves people free.',
      resonance: 'emerging',
    },
    {
      key: 'builder',
      name: 'The Builder',
      essence: 'The part of you that brings vision into form — young yet, and worth growing.',
      gift: 'When you commit, you can make real things, not only imagine them.',
      shadow: 'Skipping the patient middle of a project. Building rewards the unglamorous days.',
      resonance: 'emerging',
    },
    {
      key: 'steward',
      name: 'The Steward',
      essence: 'Caring for what is shared — friendships, family, the places and creatures around you.',
      gift: 'Leaving things a little better than you found them.',
      shadow: 'Carrying more than is yours to carry. Stewardship includes rest, and letting others help.',
      resonance: 'emerging',
    },
  ],

  // 5. The Seer and the Prophet — verbatim (Kelly's words) ───────────────────
  seerAndProphet: {
    title: 'The Seer and the Prophet',
    subtitle: 'Learning to See with Love',
    body: `Someone once looked at your birth chart and said:
"You have a prophet's chart."

That is a powerful thing to hear.
But it should be held carefully.

A birth chart should never become a burden, especially for someone young. It should not make you feel that you have to be special, certain, or set apart from other people.

So rather than saying, "You are a prophet," I would say this:

You may carry the archetype of the Seer.

The Seer is someone who notices what others miss.
The Seer senses patterns beneath the surface.
The Seer asks questions that reach beyond easy answers.
The Seer feels the difference between what is popular and what is true.
The Seer may care deeply about justice, suffering, beauty, meaning, and the hidden life of things.

In your chart, there are several symbols that point toward this kind of gift: strong Neptune near the Midheaven, an Aquarius Moon in the Ninth House, Gemini Rising, and a Scorpio Sun. Together, these suggest a young man whose life may be shaped by imagination, compassion, depth, communication, and the search for meaning.

But the purpose of seeing more deeply is never to stand above others.
It is to serve.

A true prophetic gift does not make someone superior. It makes them responsible.

The greatest seers remain humble. The greatest teachers remain students. The greatest leaders remain servants. The greatest healers keep learning how to heal themselves.

If there is a prophetic thread in your life, it may not look like preaching. It may look like asking the question no one else is asking. It may look like noticing the person everyone else overlooked. It may look like telling the truth kindly. It may look like creating something beautiful that helps people remember who they are.

Your gift is not certainty.
Your gift is perception.
And perception becomes wisdom only when it is joined with love.

So if one day people call you a teacher, healer, guide, artist, scientist, counselor, storyteller, or even prophet, let it be because your life helped others feel more awake, more honest, more courageous, and more at home in the mystery of being alive.`,
    blessing: [
      'May your questions stay alive.',
      'May your compassion become wise.',
      'May your courage become gentle.',
      'May your imagination remain rooted in truth.',
      'And may you always remember:',
      'The clearest vision belongs not to those who wish to be admired, but to those who wish to love well.',
    ],
  },

  // 6. Challenges as Training — struggles externalized (Kelly's themes) ───────
  challengesAsTraining: {
    body: `Every meaningful life includes challenges. Yours may include the ones below — and none of them is a flaw. Think of them as training: the exact places where a real strength is asking you to grow a matching skill.`,
    trainings: [
      {
        challenge: 'When your imagination is soaring, the part of you that dreams can lose the ground beneath it.',
        training: 'Learning to stay grounded while you dream — one small, real step at a time.',
      },
      {
        challenge: 'Your honesty runs deep, and sometimes the truth comes out sharper than you mean it to.',
        training: 'Learning to speak honestly without becoming harsh — truth carried kindly.',
      },
      {
        challenge: 'Your large heart can begin carrying burdens that were never yours to carry.',
        training: 'Learning to care without carrying everyone — compassion is not the same as responsibility.',
      },
      {
        challenge: 'After a disappointment, the part of you that felt it can want to close.',
        training: 'Learning to stay open anyway — keeping a soft heart is its own kind of courage.',
      },
      {
        challenge: 'It is easy, at any age, to look outside yourself for who to be.',
        training: 'Learning to trust yourself — the quiet inner yes that does not need everyone’s approval.',
      },
    ],
  },

  // 7. Becoming a Man — stage-matched (~14), Kelly's words ────────────────────
  developmentalStage: {
    label: 'Becoming a Man',
    ageRange: 'around 14',
    body: `At fourteen, you are beginning to decide these things for yourself — not just inherit them. That is exactly the work of these years: becoming the author of your own values, testing what you were given, finding your own voice. It is supposed to feel a little unsteady. That means it is real.

There are many ideas about what makes someone a man. Some people say strength. Some say success. Some say power. I don't believe those are enough.

A mature man keeps his strength without becoming hard. Keeps his tenderness without becoming weak. Keeps his courage without becoming reckless. Keeps his curiosity without losing humility. Keeps his heart open even after life disappoints him.

That kind of man changes the people around him.`,
  },

  // 8. Questions for This Season — Kelly's questions ─────────────────────────
  reflectionQuestions: [
    'What makes me lose track of time because I enjoy it so much?',
    'What kind of person do I admire, and why?',
    'When do I feel most alive?',
    'What do I want people to feel after they have spent time with me?',
    'What kind of world do I hope to help create?',
    'If I trusted my own heart a little more, what would I do differently?',
  ],

  // 9. Parent / Guide Notes ──────────────────────────────────────────────────
  guidanceForParents: [
    'Reflect his gifts back without inflating them. "I notice how much you see" is steadier than "you are special / chosen." The goal is confidence, not a crown.',
    'His depth (Scorpio) and idealism (Aquarius / Neptune) are real. Take his big questions seriously, even when you do not have answers — being taken seriously is half of what he is asking for.',
    'Protect the tender place (Chiron) without making it the center of the story. He needs it witnessed, not magnified.',
    'Help him land. A fast, wide mind benefits enormously from one or two grounding habits and the felt experience of finishing something.',
    'Name the difference between being admired and being trustworthy out loud, more than once. He is choosing which one to chase right now.',
    'Let him have his own space and his own search — autonomy is how an Aquarius Moon feels loved — while keeping the door warmly, obviously open.',
    'When you praise, praise the practice and the kindness, not the talent. "You kept going" and "you were kind there" build a person who lasts.',
  ],

  soulVocation: `People often think gifts are talents. Sometimes they are. But your greatest gift may be something quieter — your willingness to care, to wonder, to imagine, to believe that life has meaning. Your gift is not certainty; it is perception. And perception becomes wisdom only when it is joined with love.`,

  framing: DEFAULT_FRAMING,

  // ── Part II — The Year Ahead (Seasonal Spiral) ─────────────────────────────
  // Grounded in his 12-month transit report (Astrograph, starting 6/20/2026) —
  // transit DATA only; all prose written fresh, age-appropriate for 14, gentle,
  // seasons-not-predictions. The report's interpretations are copyright and are
  // never copied.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Year of Opening',
    timeframe: 'June 2026 – June 2027',
    openingHeadline:
      'This is a year for your world to grow — and for you to begin exploring it as yourself.',
    openingTheme: `Your birth chart is a map of the sky you were born under. The transits are the weather moving across it, and this year's weather is mostly bright: curiosity, friendships, and the first real stirrings of finding your own way.

None of this is a prediction. Think of it as a few directions that feel especially alive for you right now.`,
    phases: [
      {
        element: 'air',
        title: 'A Year for the Mind to Open',
        timeframe: 'Summer onward',
        transits: ['Jupiter entering your Third House', 'Jupiter meeting your Mercury, Venus & Uranus'],
        body: `This is the brightest part of your year. Jupiter — the planet of curiosity and growth — moves into the part of your chart that loves to learn, talk, and explore, where your Gemini-rising mind and Aquarius Moon feel right at home. You may find new things you want to dive into, ideas that light you up, conversations that actually go somewhere, and friendships that grow.

Follow the curiosity. It tends to know where it's going.`,
        question: 'What am I most curious about right now — and what would happen if I followed it?',
      },
      {
        element: 'fire',
        title: 'Finding Your Own Way',
        timeframe: 'Spring & Autumn',
        transits: ['Uranus square your Midheaven'],
        body: `There's a quiet new energy this year that wants you to be a little more yourself — even when that means not quite fitting the mold. You might feel restless, or notice you'd rather do things your own way. That isn't a problem; it's a sign. You're beginning to sense that your path can be yours to choose — and you don't have to have it figured out yet.`,
        question: 'When do I feel most like myself?',
      },
      {
        element: 'water',
        title: 'Your Tender Heart',
        timeframe: 'Summer & Autumn',
        transits: ['Chiron touching your Mercury, Venus & Moon'],
        body: `You feel things deeply — that's one of the realest things about you. This year a few tender spots might show up: wanting to be understood, caring a lot about your friendships, feeling more than you let on. None of that needs fixing.

Your big heart is a strength, not a weakness. The kindest thing you can do is be as gentle with yourself as you'd be with a good friend.`,
        question: 'What would I say to a friend who felt the way I feel — and can I say it to myself?',
      },
      {
        element: 'earth',
        title: 'Growing a Little Stronger',
        timeframe: 'Autumn',
        transits: ['Saturn steadying your Moon & Sun'],
        body: `Alongside all the opening up, there's a steadier thread: small, ordinary practice that quietly makes you stronger. The things you give consistent attention to — a skill, a habit, something you're responsible for — start to feel solid. It isn't about pressure. It's discovering that you can build real things, one ordinary day at a time.`,
        question: "What's one small thing I could get a little better at, just because I want to?",
      },
      {
        element: 'aether',
        title: 'The Big Questions Begin',
        timeframe: 'Later in the year, and forward',
        transits: ['Pluto entering your Ninth House', 'Neptune entering your Eleventh House'],
        body: `Underneath everything, something slow and deep is beginning: your mind starting to reach for bigger questions — about meaning, about the kind of world you want, about who you're becoming. You don't need answers. These are questions to live alongside, the way you'd walk with a good companion. Let them be interesting. There's no hurry.`,
        question: "What's a big question I find myself wondering about lately?",
      },
    ],
    weatherPattern: [
      { season: 'Summer', element: 'air', invitation: 'Follow your curiosity' },
      { season: 'Spring & Autumn', element: 'fire', invitation: 'Find your own way' },
      { season: 'Summer–Autumn', element: 'water', invitation: 'Be gentle with your heart' },
      { season: 'Autumn', element: 'earth', invitation: 'Build, one small day at a time' },
      { season: 'Whole Year', element: 'aether', invitation: 'Let the big questions be interesting' },
    ],
    goldenThread: `Almost everything in your year points the same direction: your world is getting bigger, and you're beginning to explore it as yourself. The learning, the friendships, the new sense of your own way, even the tender feelings — they're all part of one gentle invitation: to keep becoming who you already are, with curiosity and a kind heart.`,
    questions: [
      'What am I most curious about right now?',
      'When do I feel most like myself?',
      'Who are the friends who feel easy to be around — and why?',
      'What is something I am starting to believe that is becoming my own?',
    ],
    closing: {
      title: "A Father's Blessing for the Year Ahead",
      body: `You're stepping into a new world this year.

A new school. New friendships. New challenges. New opportunities to discover who you are.

There will be days you feel completely at home, and there will be days you wonder where you belong. That's part of every meaningful beginning.

I hope you'll challenge yourself this year. Choose what is difficult when it helps you grow. Be courageous when it would be easier to disappear into the crowd. Be kind even when kindness costs something. Stay curious when life gives you questions instead of answers.

I believe there is a remarkable young man already unfolding within you — not someone you have to pretend to become, and not someone whose future has already been written, but someone whose character is shaped every day by the choices you make, the people you love, the responsibility you accept, and the wonder you allow yourself to keep.

Don't be afraid of becoming. Stay open. Stay humble. Stay brave.

The world doesn't need another person trying to be someone else. It needs the man only you can become.

Walk into this new year with your head held high, your heart open, and your spirit awake. I'll be cheering for you every step of the way.

With all my love,
Dad`,
    },
  },
};

export default augustenPortrait;
