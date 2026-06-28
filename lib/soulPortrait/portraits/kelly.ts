/**
 * Soul Portrait — Kelly Nezat (LITERARY form, self-portrait)
 * ────────────────────────────────────────────────────────────────────────
 * The author's own Soul Portrait — mode 'self' (no giver, no gift framing, no
 * welcome threshold, no Return-to-Soullab coda). Unlisted, noindex, Mentor/MAIA/
 * memory OFF. Written in the flowing literary register he authored.
 *
 * Born December 9, 1966, 22:29 CST, Baton Rouge, LA. Chart from his Astrograph
 * natal + 12-month transit reports — DATA only; all prose written fresh (the
 * reports' interpretations are copyright Henry Seltzer / Astrograph, never copied):
 *   Sagittarius Sun (4th) · Leo Rising · Moon, Neptune & Mercury in Scorpio fused
 *   at the Nadir (3rd) · Venus in Sagittarius (5th, conj. Sun) · Mars in Libra
 *   (2nd) · Jupiter in Leo (12th, R) — LEADING planet · Saturn in Pisces (7th) —
 *   FUNNEL focal planet, conj. Chiron · Chiron in Pisces (7th) · Pluto & Uranus
 *   conjunct in Virgo (1st) · North Node Taurus (9th) / South Node Scorpio (3rd).
 *
 * Signatures: the FUNNEL through Saturn in Pisces/7th (relationship + spiritual
 * surrender as the channel); the Scorpio Moon–Neptune–Mercury conjunction at the
 * IC (a seer's depth at the roots); Pluto–Uranus rising (the transformer);
 * Jupiter-in-Leo leading the chart (the visionary teacher, working from the 12th).
 * Saturn conj Chiron = the wounded-healer authority, "re-work the structure."
 *
 * PART II built from his real 12-month transit report (starting 6/22/2026) as the
 * five-phase Living Spiral; the Blessing closes it.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const kellyPortrait: LiterarySoulPortrait = {
  person: {
    name: 'Kelly Nezat',
    slug: 'kelly',
    pronouns: 'he/him',
    isMinor: false,
  },

  mode: 'self',

  // No offeredBy (self-portrait): no gift block, no welcome threshold, no coda.
  // mentorEnabled omitted → Mentor OFF.

  birthData: {
    date: 'December 9, 1966',
    time: '10:29 PM CST',
    place: 'Baton Rouge, Louisiana',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
  },

  framing: DEFAULT_FRAMING,

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Essential Nature',
      body: `To know you, a person has to hold a paradox — because you are, at once, the one who stands at the front of the room and the one who lives in the deepest water.

On the surface you rise as a Leo: warm, dramatic, generous, a natural leader, ruled by the Sun itself, with a Sagittarian fire beneath it — a philosopher's heart, restless for meaning and freedom and the big questions, honest to the point of bluntness, forever curious about what it all means. You were built to lead, to teach, to inspire.

But almost everything in your chart channels through a single, quieter point: Saturn, in spiritual Pisces, in the house of deep relationship. Astrologers call this a funnel — a life whose many energies pour through one disciplined center. Yours is the long, serious work of relationship and surrender: learning to give yourself fully to another, and to something larger than yourself.

And underneath the leader's surface runs an ocean. At the very roots of your chart — the Nadir, the foundation everything rests on — three planets gather in Scorpio and fuse into one: your Moon, your Neptune, and your Mercury. This is a depth few people carry: a feeling-heart, a mystic's vision, and a penetrating mind, all a single current running underground. You perceive what lies beneath. You dream true.

So your essential nature is a rare braid: a visionary leader on the surface, a transformer at the core (Pluto and Uranus rising together in your first house), and a deep, seeking, mystical soul underneath it all. Fire and water. Vision and depth. The one who leads, and the one who goes down into the dark to bring something back.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Gift You Carry',
      element: 'earth',
      body: `Every soul carries a particular gift. Yours is to bring new, more soulful structures into being — to be a builder and a teacher of forms that heal.

Your chart says it in several voices at once. Pluto and Uranus rise together in your first house — the transformer and the revolutionary, fused into your very presence: you are here to change things, to bring genuinely new ideas into the world, to refuse the way things have always been done. Your Jupiter — the planet of vision, meaning, and faith — leads your entire chart, quietly, from the hidden twelfth house, in imaginative Leo: the visionary who works from the imaginal more than the spotlight. And your Saturn sits conjunct your Chiron, the wounded healer — an old, hard-won authority around structure itself, and the calling, in the chart's own language, to re-work the structure of things and to lead others toward new ways of healing.

Put those together and the gift comes clear: you are not here to fit into the structures that already exist. You are here to imagine and build the ones that should exist — frameworks, languages, communities, ways of being that help people become more whole. To take vision (your fire), give it lasting form (your earth), in the service of healing (your water).

Name it as your own, because it is. The world has many people who can run the structures that exist. It has very few who can dream and build the ones that don't yet. That is your work, and it always has been.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Way You Love',
      body: `Here is the tender heart of your chart, and the place it asks the most of you.

Your Venus is in Sagittarius — warm, generous, idealistic, free; you love openly, give your affection easily, and tend to believe the best in people. But the focal point of your whole chart, Saturn, sits in your house of partnership, and beside it sits Chiron, the deepest wound. This is the paradox the chart keeps returning to: relationship is at once your most important growth-path and your most ancient ache.

In the old language, Saturn here speaks of self-reliance and a quiet isolation — a part of you that has learned to hold something back, that fears truly giving itself away, that keeps a corner safe. Chiron beside it speaks of an early wound around connection: a deep longing to be met, tangled with a fear of being hurt in the meeting. You can give love generously and still find it hard to let yourself be fully received.

This is not a flaw. It is, by your chart's own reckoning, the central work of your life: relationship as the very vehicle through which your soul matures. The invitation, across a lifetime, is to let yourself be known all the way down — to keep self-reliance from hardening into self-isolation, and to let love be not only something you give, but something you let all the way in. Here, the wound and the gift are the same place. The one who learns at last to be truly met becomes, in time, the one who can help others be met too.`,
    },

    // 4 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Deep Waters',
      element: 'water',
      body: `If there is one place your chart keeps returning to, it is depth — and yours runs to the very bottom.

At the Nadir of your chart — the roots, the foundation — three planets gather in Scorpio: your Moon (your feeling-heart), your Neptune (the mystic, the dreamer, the sea of unity), and your Mercury (your mind, your voice), all fused together at the deepest point of the sky. Very few people carry this much, this deep. It means your feeling, your vision, and your thought are not separate faculties in you — they are one current, running underground.

This is the signature of a true seer. You perceive what lies beneath the surface of things, in yourself and in others. You think in symbols and images, not only logic. You dream meaningfully. There is a mystical third eye in you that has been open since you were young, and a depth of passion and intensity — Scorpio, and Pluto rising — that you long ago learned to carry carefully, because it is so strong.

It is also, at times, a hard gift to bear. Depth like this can pull toward the inner world and away from the daily one; the dreamer can blur the line between the ideal and the real; the intensity can turn to brooding, or to control. But this deep water is the source of everything you build. Every vision you have ever brought into the world came up from down there. Your task was never to escape the depths — it was to keep descending, and to keep carrying back what you find, into forms that other people can live inside. The visionary and the builder are the same man. The deep water is where the vision is born.`,
    },

    // 5 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Work Your Soul Came to Do',
      element: 'aether',
      body: `Some people are here to succeed. You came to bring a new way of becoming into the world — and your chart is unusually clear about it.

Your Sun is in Sagittarius: the seeker, the philosopher, whose deepest concern is meaning, truth, and ideals that serve more than himself. Your Jupiter — the planet of wisdom and faith, and the leader of your whole chart — sits in the twelfth house, the most spiritual and hidden room: the visionary who teaches less from the stage than from some quieter, deeper place. And your North Node, the direction of your soul's growth, points toward higher knowledge and a philosophy of compassion, and toward forging something of real and lasting worth out of your own depths.

The thread through all of it is unmistakable: you came to be a teacher and a builder of meaning — to take what you have learned in the deep water, in the long relationship-work, and in the wounds, and to forge it into a philosophy, a framework, a way of becoming that other people can actually use to grow. Not to be admired. To be of genuine use to the becoming of others.

The lifelong task is simply to trust it, and to let it be as large as it actually is — to not let the world, or your own old doubt, talk you into making it smaller. When your work is aligned with that deep sense of meaning, you do not merely do it. You come alive in it, and other people catch fire from you. That is the work your soul came to do.`,
    },

    // 6 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shadow That Protects the Gift',
      body: `Every real gift has a shadow standing guard at its door — not a flaw, but an old protector that once kept something tender safe. Yours are strong, because your gifts are strong.

There is the old wound around your father and around authority itself (Saturn square your Sun, Saturn conjunct Chiron): an early sense of love withheld, or a standard impossible to meet, which can still whisper that you are not quite enough, and can drive you either to chase recognition or to over-build. There is the Plutonian intensity (Pluto rising, square your Sun): a will so strong it can tip into control, into "my way," into compulsion — the very force that gets things done, turned a degree too far. And there is the Neptunian pull of your deep waters: the dreamer who can blur the ideal and the real, who can escape into vision and avoid the ordinary, who can, at the edge, deceive even himself in service of the dream.

Here is the reframe that matters: each of these is protecting the gift. The drive to prove yourself is the underside of your real authority. The intensity is the shadow side of your true power to transform. The escapism is the cost of a visionary depth that genuinely sees other worlds. They are old protectors, and they served you — they got you here.

The work of this season of life is not to wage war on them, but to claim what they were guarding. To insource your own authority, so you no longer need anyone's recognition to know your worth. To let your power serve rather than control. To bring the vision all the way down to earth, where it can finally do its healing. The gift was never the danger. It is safe now. You can come out from behind the door.`,
    },

    // 7 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Dance of Your Elements',
      body: `The elements are not boxes to sort you into. They live in you as a moving ecology — five forces in conversation. This is the particular dance they make in you.

Fire is your visible flame. Your Sagittarian Sun and Venus and your Leo rising give you vision, warmth, idealism, and the courage to lead and to seek. It is the part of you that believes, that inspires, that reaches for the far horizon. It wants to set out.

Water runs deepest of all. The great Scorpio gathering at your roots, and Saturn and Chiron in Pisces, give you a mystic's feeling, a healer's compassion, and a seer's sight. This is where everything in you is born. Fire reaches; Water knows why.

Earth is the harder-won element, and the crucial one. Pluto and Uranus in Virgo, your Taurus North Node, your focal Saturn — these are the call to take all that fire and water and give it form: to build the vision into something real and lasting, one patient step at a time. Earth is the discipline your vision has always needed.

Air is your original, restless mind — Mercury and Uranus, the thinker who sees in flashes and refuses the conventional. It carries your ideas out into the world.

And Aether — the integrating element — runs through all of it as a thread of the sacred: Neptune, Pisces, your hidden Jupiter, the lifelong knowing that there is something holy underneath the surface of everything. It is how you know your work was never only worldly.

Held together, this is the dance: a great fire of vision, fed by the deepest water, asked always to come to earth and take lasting form, carried by an original mind, and lit from within by the sacred. The visionary who must build. The seer who must teach. A soul made to bring something new and healing into the world.`,
    },

    // 8 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      body: `Practices are how a portrait becomes a life. None of these is a task to perfect — each is a small, embodied way of tending the dance. Take up whichever one is alive for you.

Earth — One Real Step. For every great vision, name the single smallest concrete thing you could build this week, and build it. Your fire was never the problem; the practice is letting it come all the way to the ground. Vision plus one true step, repeated, is how new worlds actually get made.

Water — The Descent. Give yourself regular, unhurried time to go down into the deep — in silence, in nature, in the dream — without mining it for a project. Just be in it. The vision is born there, and the well needs to be visited, not only drawn from.

Fire — Let It Be Met. Now and then, say the true thing to someone you trust before you have made it safe or impressive — the doubt, the longing, the unfinished feeling. Letting yourself be seen unguarded is the exact muscle your chart most wants you to grow.

Air — Hold It Loosely. When you feel most certain, ask one honest question that could prove you wrong. Your visionary mind is a gift; held a little loosely, it ripens into wisdom.

Aether — Insource Your Authority. Each day, before you reach for anyone's approval, take one quiet minute to ask only this: is it true to me? Let the answer rise from your own depths. Your worth was never theirs to grant.`,
    },
  ],

  // ── Part II — The Year Ahead (the Season + the Living Spiral) ──────────────
  // Grounded in his 12-month transit report (Astrograph, starting 6/22/2026) —
  // transit DATA only; all prose written fresh. Each phase reads a real transit
  // as an elemental movement and an invitation; the Blessing closes the portrait.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Season of Re-Visioning',
    timeframe: 'June 2026 – June 2027',
    openingHeadline:
      'This is a year in which the very vision that guides your life is transformed and reborn — deeper, truer, and more your own.',
    openingTheme: `Your birth chart is the landscape you carry through a whole life. The transits are the weather moving across it — and this year's weather gathers around one place: your vision. Jupiter, the planet that leads your entire chart, is touched from every side this year, and the slow, deep planets are reaching for your guiding philosophy, your inner depths, and your will.

This is not a light season. It is an inward and a transforming one — a year in which old ideas die so truer ones can be born, the depths are stirred, and the visionary is asked to go all the way down and bring something back. None of it is fixed, and none of it is fate. What follows is the weather of your year and the invitations inside it: what is asking to be reborn, where grace is available, and where a little courage is being asked. Your soul chooses how to walk through all of it.`,
    phases: [
      {
        element: 'aether',
        title: 'The Vision Reborn',
        timeframe: 'All year (Jupiter & Pluto)',
        transits: ['Pluto opposite your Jupiter', 'Jupiter returning to your Jupiter', 'Jupiter entering your Twelfth House', 'Neptune in trine with your Jupiter'],
        body: `This is the heart of your year. Jupiter — the planet of faith, meaning, and vision, and the leader of your whole chart — is being worked from every side. Pluto stands opposite it, asking the guiding philosophy of your life to transform; Jupiter returns to its own place, beginning a fresh twelve-year cycle of belief and purpose; and it enters your twelfth house, the most spiritual and hidden room, turning your year inward toward the mystical.

What this asks is profound and quiet: to let a vision you have long lived by die, so that a truer one can be born — deeper, more spiritual, more fully your own. Old certainties about what it all means may loosen. That is not loss; it is room. Something larger is trying to come through you. Dream it wisely.`,
        question: 'What guiding vision is ready to die so a truer one can be born?',
      },
      {
        element: 'water',
        title: 'The Depths Stirred',
        timeframe: 'Summer 2026, returning into 2027',
        transits: ['Pluto touching your Moon and Neptune', 'Pluto transforming your spirituality'],
        body: `Beneath the work on your vision, the deep water you were born to is being stirred. Pluto reaches the great Scorpio gathering at the roots of your chart — your Moon, your Neptune — bringing a slow, profound emotional and spiritual transformation. Feelings long buried may surface; your sense of the sacred itself may change and deepen.

For someone with your depth, this is almost familiar — you have made the descent before. What is asked is simply to go down gently and be with what rises, rather than manage it away, and to let the transformation reach all the way to the floor. Something in you is reorganizing at the root.`,
        question: 'What is rising from your depths to be felt and transformed?',
      },
      {
        element: 'fire',
        title: 'The Will Remade',
        timeframe: 'Through the year (Mars)',
        transits: ['Neptune opposite your Mars', 'Pluto in trine with your Mars', 'Uranus in trine with your Mars'],
        body: `Your drive itself — your will, your way of acting in the world — is being remade this year. Neptune dissolves the hard edges of your ego and your goals; Pluto transforms your deeper motivations; Uranus brings sudden new directions and restlessness. Projects may stall or lose their old urgency, and that can be disorienting for a will as strong as yours.

But there is a purpose in it: the old ego-center is loosening to make room for something more universal to act through you. The invitation is not to force your way forward, but to let your action be re-aimed — to discover what truly wants to be done now, from a deeper place than mere drive. You are not losing your fire. You are letting it be re-lit from somewhere truer.`,
        question: 'How is my will being remade — and what wants to act through me now?',
      },
      {
        element: 'earth',
        title: 'The Inner Teacher',
        timeframe: 'From spring 2026, and maturing through 2027',
        transits: ['Chiron entering your Ninth House', 'Saturn in trine with your Sun'],
        body: `As your old vision loosens, a new one needs to be built — and a teacher in you is ready to emerge. Chiron, the wounded healer, enters your ninth house: the house of philosophy, meaning, and the higher mind. Inherited beliefs that no longer fit may fall away, and in their place your own hard-won wisdom begins to take shape — your inner teacher, formed from everything you have lived and healed. Meanwhile Saturn lends a steadying hand to your Sun, offering the structure and patience to make the new vision real.

This is the grounding the whole year needs: not just to re-imagine, but to build and to teach. The philosophy taking shape in you wants to become something solid enough for others to stand on. One true step at a time.`,
        question: 'What truer philosophy is asking to be lived, built, and taught?',
      },
      {
        element: 'air',
        title: 'The Grace, and the Re-Alignment',
        timeframe: 'Autumn 2026 onward',
        transits: ['Jupiter in trine with your Venus', 'Jupiter in trine with your Sun', 'Chiron in trine with your Ascendant'],
        body: `Through all the depth and transformation runs a real thread of grace. Jupiter blesses your Venus and your Sun — bringing warmth and ease into your relationships, optimism into your sense of self, soul-to-soul connection, and a renewed faith in your own path. And Chiron, in gentle aspect to your Ascendant, brings a healing presence into your life and a softer, truer self-concept.

Where so much of the year asks you to go inward and let go, this is the hand that lifts. It is worth receiving consciously — not just enduring the deep work and missing the grace beside it. Let yourself be loved and met this year. Let the connections come. The descent and the grace are not opposites; they are two hands of the same renewal.`,
        question: 'Where is grace inviting me to expand — and can I let myself receive it?',
      },
    ],
    weatherPattern: [
      { season: 'All year', element: 'aether', invitation: 'Let the old vision die; dream a truer one' },
      { season: 'Summer → 2027', element: 'water', invitation: 'Go down gently; let the depths transform' },
      { season: 'Through the year', element: 'fire', invitation: 'Let your will be re-aimed from deeper' },
      { season: 'Spring 2026 on', element: 'earth', invitation: 'Build and teach the new philosophy' },
      { season: 'Autumn 2026 on', element: 'air', invitation: 'Receive the grace; let yourself be met' },
    ],
    goldenThread: `Almost everything this year points the same way: the vision that has guided your life is being transformed and reborn — deeper, and more truly your own. Your guiding philosophy dies and returns on a higher turn (Pluto and Jupiter to your Jupiter; Jupiter into the spiritual twelfth), your depths are stirred and changed (Pluto and Neptune to your Moon), your will is dissolved and remade (Neptune, Pluto, and Uranus to your Mars), and a new philosophy and an inner teacher emerge to be built and shared (Chiron into your house of meaning) — all of it carried by real grace in love and connection (Jupiter to your Venus and Sun). It is a profound year, and an inward one. The visionary is being asked to go all the way down, and bring back something truer. You have done this before. You were made for it.`,
    questions: [
      'What guiding vision is ready to die so a truer one can be born?',
      'What is rising from my depths, asking to be felt and transformed?',
      'What truer philosophy is asking to be lived, built, and taught?',
      'Where is grace available to me — and can I let myself receive it?',
    ],
    closing: {
      title: 'A Blessing',
      body: `May you trust the deep water you were born to, and keep bringing back what you find there.

May the vision that is dying in you this year return truer, and more your own, than before.

May you insource your own authority, and rest your worth where it always belonged — in who you are, not in what you build or whom you convince.

May you let yourself be met as fully as you have always longed to be — to receive love, and not only to give it.

May the new philosophy taking shape in you become a real and lasting home, for you and for the many who will grow inside it.

And may you remember, in the depths of this transforming year, that you do not walk it alone — and that the world is waiting for exactly what only you can build.

You are deeply loved. You always have been.`,
    },
  },
};

export default kellyPortrait;
