/**
 * Soul Portrait — Katie Claire McCullen
 * ────────────────────────────────────────────────────────────────────────
 * The first GIFT PORTRAIT — offered by her uncle (Kelly), not authored by him.
 * The narrator is the elder guide; the giver's love is present but quiet, and
 * never claims authorship over her becoming.
 *
 * Born August 28, 2000 · 1:02 AM CDT · Baton Rouge, Louisiana.
 * Chart (from her natal report — used only as data; all prose written fresh):
 *   Virgo Sun · Mercury · Venus (4th House) · Gemini Rising ·
 *   Leo Moon conjunct Mars (3rd House) · Chiron conjunct Pluto in Sagittarius
 *   (6th House) · Uranus & Neptune in Aquarius · North Node in Cancer (2nd).
 *
 * Written to the standards in `docs/architecture/SPIRALOGIC_SOUL_PORTRAIT_RESEARCH.md`.
 * Her chart is markedly different from Augusten's — the voice should be too.
 */

import type { SoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const katiePortrait: SoulPortrait = {
  person: {
    name: 'Katie Claire McCullen',
    slug: 'katie',
    age: 25,
    pronouns: 'she/her',
    isMinor: false,
  },

  mode: 'gift',

  offeredBy: {
    relationship: 'her uncle',
    giverName: 'Kelly',
    giftOpening: `Every life carries a quiet music.

This portrait is an invitation to listen for yours.

May these pages help you recognize gifts already unfolding within you, awaken fresh wonder for the journey ahead, and remind you that your life is a beautiful story still being written.

Receive it with an open heart.

Return to it whenever life reveals another layer of who you are becoming.

Welcome.`,
    // Opening threshold — the hand-delivered reception page (/soul-portrait/katie/welcome).
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Katie Claire',
      attribution: 'Offered with love by your Uncle Kelly',
      framing:
        'A reflection on who you are becoming — patterns to recognize, never a forecast and never a verdict. Read it gently: keep whatever rings true, and ignore anything that doesn’t.',
    },
  },

  birthData: {
    date: 'August 28, 2000',
    time: '1:02 AM CDT',
    place: 'Baton Rouge, Louisiana',
    note: 'The chart is read symbolically — as a map of the sky under which a life began, never a prediction of where it goes.',
  },

  natalChartSummary: {
    placements: [
      {
        body: 'Sun',
        sign: 'Virgo',
        house: 4,
        meaning:
          'A quiet, devoted brilliance turned toward home and care. Virgo’s love of doing things well, placed in the house of roots and belonging — a self nourished from the inside, in private, more than by applause.',
      },
      {
        body: 'Moon & Mars',
        sign: 'Leo',
        house: 3,
        meaning:
          'A warm, bright heart that lights up a room and isn’t afraid to feel out loud — Leo’s generosity and courage, joined to a quick, lively, expressive mind.',
      },
      {
        body: 'Ascendant',
        sign: 'Gemini',
        angle: 'Rising',
        meaning:
          'You meet the world through curiosity and conversation — articulate, perceptive, many-sided. You tend to ask before you conclude.',
      },
      {
        body: 'Venus',
        sign: 'Virgo',
        house: 4,
        meaning:
          'Love expressed as devotion and care — loyal and discerning, happiest making a space, and the people in it, feel tended and safe.',
      },
      {
        body: 'Chiron & Pluto',
        sign: 'Sagittarius',
        house: 6,
        meaning:
          'A deep healing thread: the wounded-healer joined to the power of transformation, in the house of service. What you have had to heal in yourself becomes, in time, how you help others heal.',
      },
      {
        body: 'North Node',
        sign: 'Cancer',
        house: 2,
        meaning:
          'Your growth points toward belonging and self-worth — building a secure inner home — rather than proving yourself at the top.',
      },
    ],
    synthesis:
      'Read together, these draw a particular kind of person: a warm Leo heart and a careful Virgo devotion, met through a curious Gemini voice, carrying a deep healer’s thread and a life-path that leads toward belonging rather than the lonely summit. The through-line is not achievement — it is care. The gift of making others feel at home in themselves. None of it is fixed; it is a set of strong tendencies, raw material for the woman you are still becoming.',
  },

  // 1. Opening Letter — the gift letter (Kelly's words) ──────────────────────
  openingLetter: `Dear Katie,

This portrait is offered as a gift of love. It isn't meant to tell you who you are — no one can do that. It is an attempt to recognize some of the beauty your life already carries, and to reflect it back to you with care.

Receive what resonates. Let the rest wait. Your life — not these pages — will always have the final word.

So read it gently, the way you'd read a long letter from someone who is simply glad you exist. Keep what rings true. And remember that everything here is an invitation, never a verdict.`,

  // 2. Soul Signature ───────────────────────────────────────────────────────
  soulSignature: {
    headline: 'A warm heart and a careful hand — the gift of making others feel at home in themselves.',
    body: `If your chart had a single signature, it might be this: a bright heart that warms a room, joined to a careful, devoted hand that quietly makes things — and people — better.

The warmth is your Leo Moon and Mars: you feel in full colour, and you are brave enough to show it. The care is your Virgo Sun and Venus: a love of tending, of doing things well, of making a place where people belong. And the curiosity is your Gemini Rising: a quick, articulate mind that meets the world with questions.

You may not always see it from the inside, but people tend to feel more at home — more themselves — in your presence. That is not a small thing. It may be one of the truest things about you.`,
  },

  // 3. Elemental Architecture — each element as a living process ──────────────
  elementalProfile: [
    {
      element: 'fire',
      keyword: 'courage, purpose, vitality',
      title: 'Fire — the warmth that lights a room',
      body: `Your fire isn't about domination; it's warmth and courage. With a Leo Moon beside Mars, you feel things vividly and you're brave enough to let them show — to be enthusiastic, to care out loud, to take a stand.

The practice is to let your fire warm without burning yourself out for other people's approval. Your light doesn't have to earn its place. It already belongs.`,
    },
    {
      element: 'water',
      keyword: 'heart, empathy, emotional wisdom',
      title: 'Water — the depth that attunes',
      body: `You feel others before they speak. You sense what a room needs, what a friend isn't saying. This is real attunement, and it makes people feel safe with you.

The skill to grow is letting the tide come back in — letting yourself be cared for, not only caring. Empathy this deep needs replenishing, or it quietly empties.`,
    },
    {
      element: 'earth',
      keyword: 'grounding, habits, responsibility',
      title: 'Earth — the devoted hand',
      body: `This is your home element. A Virgo Sun, Mercury, and Venus give you the love of doing things well — of tending, making, and creating a place where people belong. You are the one who notices what needs doing and quietly does it.

The growth edge is letting "good enough" be holy. Excellence is a gift when it serves life, and a burden when it becomes a verdict on your worth. Done with love, good enough is usually exactly enough.`,
    },
    {
      element: 'air',
      keyword: 'curiosity, communication, ideas',
      title: 'Air — the curious, articulate mind',
      body: `Quick, perceptive, often funny — you learn by talking and connecting, and you can hold two sides of a thing at once. With Gemini rising and a sharp Mercury, ideas are a kind of play for you.

The gift is clarity; the practice is trusting that your voice is already enough — that you don't have to over-explain or earn the right to be heard.`,
    },
    {
      element: 'aether',
      keyword: 'meaning, spirit, mystery',
      title: 'Aether — the search for your own meaning',
      body: `There's a deep current in you that wants truth you've arrived at yourself, not simply inherited. Chiron and Pluto in Sagittarius, and a visionary streak in Aquarius, point to a spirituality that is genuinely yours to author.

Let it stay grounded and let it stay free. You don't owe anyone your conclusions, and you don't have to have them yet.`,
    },
  ],

  // 4. Archetypal Profile — her ecology of companions ────────────────────────
  archetypalProfile: [
    {
      key: 'steward',
      name: 'The Keeper of the Hearth',
      essence: 'A Virgo Sun and Venus in the house of home, and a heart that leans toward belonging — you make places, and people, feel tended and safe.',
      gift: 'You create the conditions in which others can relax into being themselves.',
      shadow: 'The hearth-keeper can forget to sit at her own fire. Tend yourself, too.',
      resonance: 'strong',
    },
    {
      key: 'healer',
      name: 'The Healer Who Was Healed',
      essence: 'Chiron beside Pluto in the house of service: what you’ve had to heal in yourself becomes how you help others heal.',
      gift: 'You can sit with someone in a hard place without flinching or rushing them.',
      shadow: 'Tending others can become a way to disappear. The healer must be held, too.',
      resonance: 'strong',
    },
    {
      key: 'storyteller',
      name: 'The Illuminator',
      essence: 'A Leo heart that lights a room — your warmth lets other people shine, not just you.',
      gift: 'You bring colour and courage; people feel braver and more alive near you.',
      shadow: 'Needing to be the warmth can tire you. You’re allowed to be in the audience sometimes.',
      resonance: 'strong',
    },
    {
      key: 'sage',
      name: 'The Lion-Hearted Scholar',
      essence: 'Gemini mind, sharp Mercury, and a love of meaning — a warm intelligence that loves to understand and to teach.',
      gift: 'You make ideas human; you can explain hard things kindly.',
      shadow: 'The inner critic can turn that sharp mind against yourself. Aim it outward, gently.',
      resonance: 'strong',
    },
    {
      key: 'builder',
      name: 'The Maker',
      essence: 'Virgo craft and Venus’s love of beauty — the urge to bring care into form, whether a home, a project, or a meal.',
      gift: 'You finish things, and you finish them well.',
      shadow: 'Perfectionism can stall the making. Let things be done.',
      resonance: 'present',
    },
    {
      key: 'guardian',
      name: 'The Confidante',
      essence: 'An unusual insight into what moves people, and a deep loyalty — you are the one others trust with the real story.',
      gift: 'People feel genuinely safe telling you the truth.',
      shadow: 'Holding everyone’s secrets can be heavy. Keep someone you can tell, too.',
      resonance: 'present',
    },
    {
      key: 'seeker',
      name: 'The Seeker of Her Own Meaning',
      essence: 'A pull toward a philosophy and faith you arrive at yourself, rather than one handed to you.',
      gift: 'Hard-won conviction; you’ll mean what you come to believe.',
      shadow: 'Restless searching can defer arrival. Some truths are lived into, not only thought through.',
      resonance: 'present',
    },
    {
      key: 'explorer',
      name: 'The Quiet Visionary',
      essence: 'An Aquarian streak that cares about a fairer, kinder world and can imagine how it might be different.',
      gift: 'You hold an honest hope for people and for what’s possible.',
      shadow: 'Ideals can outrun the ground. Let the vision touch the daily and the doable.',
      resonance: 'emerging',
    },
  ],

  // 5. The featured heart of the portrait ────────────────────────────────────
  seerAndProphet: {
    title: 'The Healer of the Hearth',
    subtitle: 'What the wound became',
    body: `There is a thread that runs through your chart worth naming gently, because it may be one of the deepest gifts of your life.

Somewhere early, you may have learned that your voice didn't always land the way you hoped — that expressing yourself, being fully heard, was harder than it looked. Many sensitive, intelligent young people know this quiet ache. (In the old language of the chart, it is Chiron close to your Mercury, near Pluto: the place where something tender was once touched.)

Here is what tends to happen with a thread like this. The very place where you once felt unheard becomes, over time, the place where you grow extraordinarily good at helping other people feel heard. The sensitivity that once hurt becomes attunement. The ache becomes empathy with its eyes open.

This is the old figure of the healer who was first wounded — not because suffering is ever required, but because someone who has been there can sit with another person in the dark without flinching, and without rushing them toward the light.

Your chart pairs this with something warm and steadying: a Virgo devotion to care, a Leo heart that lights a room, and a longing — your North Node — not for the lonely summit but for belonging, for a hearth, for a circle where people feel safe to be themselves.

Put those together and you get something rare: a person who can make others feel at home in themselves. Not by fixing them — by the quality of attention you bring. Careful, warm, unhurried, real.

That is not a small calling. The world is full of people who feel unseen. To be someone in whose presence they feel met — that is a quiet kind of healing, and it may be one of the truest things you carry.

One caution, offered with love: a gift for tending others can quietly become a habit of disappearing into their needs. The healer has to be healed too — has to be held, fed, heard. Receiving is not a failure of strength. It is how the hearth stays lit.`,
    blessing: [
      'May you tend others without losing yourself.',
      'May your careful hands learn to rest.',
      'May your bright heart be warmed as often as it warms.',
      'May you trust that your voice is already enough.',
      'And may you always have a hearth — within you, and around you —',
      'where you, too, are welcomed home.',
    ],
  },

  // 6. Challenges as Training — struggles externalized ───────────────────────
  challengesAsTraining: {
    body: `Every strength casts a shadow — not a flaw, but the exact place a real gift asks for a matching skill. A few seem woven through your chart.`,
    trainings: [
      {
        challenge: 'The part of you that holds everything to an impossible standard, and hears "not good enough" even when you’ve done beautifully.',
        training: 'Letting excellence serve life instead of judging it. "Good enough," done with love, is usually exactly enough.',
      },
      {
        challenge: 'The part of you that quietly serves others until you’ve disappeared from your own list.',
        training: 'Service from fullness, not depletion. Let yourself be cared for — the hearth needs tending too.',
      },
      {
        challenge: 'The part of you that fears your voice won’t land — that what you have to say isn’t quite enough.',
        training: 'Trusting that your voice is already enough. Your tenderness about being heard is the very root of your gift for helping others feel heard.',
      },
      {
        challenge: 'The part of you that swings between needing roots and needing to bolt.',
        training: 'Holding both — a secure base and room to be free. You’re allowed to want belonging and freedom at once.',
      },
      {
        challenge: 'The part of you that believes you must achieve your way to worth.',
        training: 'Remembering that your worth lives in how you love and belong, not in reaching the top. Your own chart points home, not to the summit.',
      },
    ],
  },

  // 7. Developmental stage ───────────────────────────────────────────────────
  developmentalStage: {
    label: 'Young Adulthood',
    ageRange: 'your mid-twenties',
    body: `You are in the years of building your own foundations — discovering what home means when you make it yourself, what work feels like a calling rather than a role, who belongs in your inner circle.

Your chart suggests the central task of these years with unusual clarity: to build a secure base inside yourself — a sense of worth that doesn't depend on proving anything to anyone. It is tempting, for a long stretch of life, to chase the summit, to be impressive, to try to earn belonging through achievement. Your deeper path runs the other way: belonging first, and a worth rooted in who you are rather than what you accomplish.

The good news is that everything you need for that is already in you — the warmth, the care, the depth. The work isn't to become someone more impressive. It's to come home to the person you already are, and to let yourself be loved there.`,
  },

  // 8. Questions for This Season ─────────────────────────────────────────────
  reflectionQuestions: [
    'Where do you feel most at home — and what is it about that place, or those people, that lets you exhale?',
    'What would you do differently this year if you fully believed you were already enough?',
    'When do you give from fullness, and when do you give until you’ve disappeared? What’s the difference, for you?',
    'Whose voice taught you that you had to earn your worth — and is that voice telling you the truth?',
    'What kind of work would feel less like a role and more like a calling?',
    'If your sensitivity is also your gift, how might you protect it and offer it at the same time?',
  ],

  soulVocation: `Your gift may be this: to make others feel at home in themselves — through the careful, warm, unhurried quality of your attention. A bright heart and a devoted hand, in service not of being impressive but of belonging. Wherever your life leads, let it be the kind of care that leaves people feeling more seen, more safe, and more themselves than before they sat down with you.`,

  framing: DEFAULT_FRAMING,
};

export default katiePortrait;
