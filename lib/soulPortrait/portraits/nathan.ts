/**
 * Soul Portrait — Nathan Kane (LITERARY form)
 * ────────────────────────────────────────────────────────────────────────
 * Kelly's business partner. A gift portrait offered by Kelly, written as a
 * flowing Spiralogic Soul Portrait — soul-and-symbol language, not a structured
 * astrology report. Hand-delivered, unlisted, noindex. Mentor/MAIA/memory OFF.
 *
 * Born December 23, 1968, 2:00 PM EST, Philadelphia, PA (39N57, 75W10). Chart
 * computed in-house and verified against his Astrograph natal report — DATA only;
 * all prose written fresh (the report's interpretations are copyright Henry
 * Seltzer / Astrograph, never copied):
 *   Capricorn Sun (8th) · Taurus Rising (Asc 20°16') · Moon in Aquarius (11th,
 *   conj. Venus) · Mercury in Capricorn (9th) · Venus in Aquarius (10th, ruler of
 *   the rising sign) · Mars in Libra (6th) · Jupiter in Libra (6th, conj. Uranus) ·
 *   Saturn in Aries (12th — FUNNEL focal planet / the handle) · Uranus in Libra
 *   (6th, conj. Jupiter) · Neptune in Scorpio (7th, conj. Descendant) · Pluto in
 *   Virgo (5th — LEADING planet of the pattern) · Chiron in Pisces (11th) · North
 *   Node Aries (12th) / South Node Libra (6th) · Midheaven Aquarius 0°.
 *
 * Signatures: a FUNNEL (bucket) through Saturn in Aries in the Twelfth (the
 * disciplined will in service to the hidden/collective), LED by Pluto in the
 * Fifth (creative power). Dominant element AIR (5: Moon, Venus, Mars, Jupiter,
 * Uranus) grounded by Earth (Sun, Mercury, Pluto); dominant modality CARDINAL
 * (6) — the visionary initiator. T-square focal Sun. Jupiter-Uranus conjunction
 * (the inventor's optimism). Neptune on the Descendant (the idealist of
 * partnership).
 *
 * PART II (The Year Ahead) is grounded in his 12-month transit report (Astrograph,
 * starting 6/22/2026) — transit DATA only; prose fresh. It is a profound year: a
 * SECOND Saturn return inside heavy Neptune (into the 12th, opposing Uranus and
 * Jupiter, square the Sun) and flowing Pluto trines — dissolve and rebuild.
 *
 * The giver's note + threshold are a respectful draft; Kelly's own words to Nathan,
 * and his lived knowledge of his partner, are his to add. "A Blessing" is a
 * guide-voice blessing, calibrated to a partnership of equals.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const nathanPortrait: LiterarySoulPortrait = {
  person: {
    name: 'Nathan Kane',
    slug: 'nathan',
    pronouns: 'he/him',
    isMinor: false,
  },

  mode: 'gift',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF.

  offeredBy: {
    relationship: 'his partner in the work',
    giverName: 'Kelly',
    giftOpening: `Every life carries a particular signature — a way of meeting the world that belongs to no one else.

This one is yours: the steadiness people lean on, the visionary's eye for how things could be fairer and truer, and the builder's hands that turn an idea into something real and lasting. I have watched it in the work we share, and it seemed worth holding up so you could see it too.

The stars reveal the weather; your soul chooses how to walk through it. Read this as a mirror offered in respect — and keep what your own heart already knows is true.

— Kelly`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Nathan',
      attribution: 'Offered by Kelly',
      framing:
        'A reflection on who you are, and who you are still becoming — written in the language of soul and symbol. The stars reveal the weather; your soul chooses how to walk through it.',
    },
  },

  birthData: {
    date: 'December 23, 1968',
    time: '2:00 PM EST',
    place: 'Philadelphia, Pennsylvania',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
  },

  framing: DEFAULT_FRAMING,

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Essential Nature',
      body: `To know you, a person has to hold three things at once.

On the surface, you are steady. Taurus is rising in your chart — the most grounded, patient, and reliable of the signs — and it gives you a calm, unhurried presence and a powerful, quiet will. You are not easily moved off a thing you have decided matters. You build, you stay, you see things through. People feel they can stand on you.

But behind that steadiness runs a mind that is anything but conventional. The strongest current in your chart is Air — five of your planets sit in the thinking, relating, future-facing signs, with your Moon and Venus together in Aquarius and your Sun in forward-driving Capricorn. You see the system behind the situation. You notice how things could be fairer, cleaner, wiser than the way they are currently done, and you are constitutionally unable to simply accept "because that's how it's always been." You are, at heart, a reformer with a blueprint.

And deeper still, your chart gathers nearly all of itself through a single point — Saturn, the planet of discipline and mastery, sitting in the most hidden and spiritual room of the chart. Astrologers call this shape a "funnel." It describes a life whose many energies pour through one focused center. Yours pours through devotion to something larger than yourself — a seriousness about your work that is, underneath, almost a vocation.

So your essential nature is this: a grounded builder, an original mind, and a soul quietly in service to something bigger. Steady enough to be trusted, visionary enough to be needed, and deep enough that most people only ever see the surface of you.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Gift You Carry',
      element: 'air',
      body: `Every soul carries a particular gift — not a skill exactly, but a way of being that the world is quietly better for. Yours is this: you see the better way, and then you actually build it.

Most people can do one or the other. There are visionaries who see how things could be but cannot make them real, and there are builders who can execute but have no new vision of their own. You are the rare hinge between the two. Your Air gives you the vision — the Aquarian eye for a fairer design, the inventor's instinct (your Jupiter and Uranus stand together, the signature of original ideas arriving as if from nowhere). And your Earth gives you the means — Capricorn's patience, Taurus's staying power, Saturn's mastery of structure. You don't just imagine the better system. You have the discipline to lay one brick on another until it stands.

And your chart is overwhelmingly cardinal — the modality of initiation, of starting things, of leadership. You are not built to maintain what already exists. You are built to begin what doesn't yet. To found. To architect. To take the formless better-idea and give it bones.

This is the gift of the one who makes new things real and makes them last. Name it as your own, plainly, because the world will always be quicker to credit the loud visionary or the lucky timing than the patient intelligence that actually built the thing. To see a truer way and have both the originality to imagine it and the discipline to construct it — that is a rare and serious gift. It is yours.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Way You Relate',
      body: `For all your independence, you are profoundly oriented toward other people. It is one of the defining themes of your chart.

A whole cluster of you lives in Libra — the sign of partnership, fairness, and the other person — and your Neptune sits directly on the relationship angle of your chart, the point of the significant other. You are a natural diplomat and a genuine believer in justice; you will instinctively make sure the quieter party in a dispute gets heard. You work best alongside someone, not alone. Partnership, for you, is not a convenience. It is closer to a calling.

But the way you love carries the same signature as the rest of you: idealistic, a little detached, and in need of room. Your Moon and Venus are in Aquarius — a warm but airy heart, devoted to many, deeply loyal, yet more comfortable in the language of the mind than of raw feeling. You can be the most reliable friend a person has and still hold a certain cool distance, a part of yourself kept free. And with Neptune on that relationship angle, you carry a high, almost romantic ideal of the perfect partnership — which can be luminous, and can also set a bar that ordinary, real, flawed closeness sometimes struggles to meet.

The quiet invitation here, written into the same chart, is to let relationship be real rather than ideal — to stay when it gets close and ordinary, not only when it gleams. The people who get all the way in to you find something steadfast and rare. Let them in, and let yourself need them back.`,
    },

    // 4 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Deep Waters',
      element: 'water',
      body: `There is a current in you that the steady surface keeps well hidden.

Your Sun — your core vitality — sits in the Eighth House, the deepest and most transformative room of the chart: the house of intimacy, of what lies beneath, of death and rebirth and the things most people would rather not look at directly. A Capricorn Sun here is not content with the surface of life. Some part of you is always drawn downward — into the real, the intense, the regenerative. You are not afraid of the dark places in a situation or a person. You may even be most alive there.

And the planet that "leads" your entire chart — the one out in front, setting the direction for all the rest — is Pluto, the planet of depth and transformation, sitting in your house of creativity and self-expression. This is the engine room of you. It means your creative power is not light or decorative; it comes from somewhere deep, and it carries real intensity. When you make something, you are not just producing — you are transmuting, turning raw experience into form. People feel the weight of it.

So beneath the grounded Taurus calm and the cool Aquarian mind runs something oceanic and Plutonian: a man who has been through his own descents, who understands transformation from the inside, and who carries a quiet, regenerative force. It rarely shows on the surface. But it is the source of your gravity — the reason the steady builder is also, unmistakably, deep.`,
    },

    // 5 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Work Your Soul Came to Do',
      element: 'aether',
      body: `Some people are here to achieve. You are here to build in service of something larger than yourself — and your chart is unusually pointed about it.

Saturn, the focal point your whole chart funnels through, sits in the Twelfth House — the most hidden, spiritual, and selfless room of the chart, the place of surrender and union with something vast. This is a remarkable placement. It means your deepest discipline, your mastery, your serious lifelong work, is ultimately meant to serve something you cannot fully see or possess — the collective, the unseen good, the sacred. You are, in a real sense, a builder for something beyond yourself.

And here is the paradox your soul came to live. That same Saturn, and your North Node beside it, sit in Aries — the sign of the self, of courage, of standing on your own two feet. So your path runs in two directions at once: toward radical self-reliance, claiming your own will and authority, becoming fully your own man — and toward giving that hard-won self over in service to something larger. Not one or the other. Both. You become most yourself precisely by devoting yourself to what matters beyond you.

This is why work that is merely successful will never be enough for you, and why work that means something can feel almost like prayer. Your soul's task is to keep building — but to build, more and more, for the right reasons: not to prove yourself, and not to disappear into the cause, but because the disciplined offering of your gifts to something worthy is, for you, the truest form of being alive.`,
    },

    // 6 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shadow That Protects the Gift',
      body: `Every real gift has a shadow standing guard at its door — not a flaw, but an old protector that once kept something tender safe, and that can overstay its usefulness if you don't know it is there.

For you, that shadow wears a few familiar faces. There is the inner critic that never quite rests — your Sun stands under pressure in your chart, and it can drive you to push yourself relentlessly, to feel responsible for everything and everyone, to perform as if your worth depended on it. There is Saturn's particular weather in the hidden house: a recurring sense of limitation, of some invisible wall, of guilt that is general rather than tied to anything you actually did — and, at times, the urge to withdraw, to go quiet, to hold back your own will rather than risk asserting it. And there is an older ache around belonging — a sense, traceable to your chart's wounded-healer placement among the house of community, that you have somehow always stood a little outside the circle, never quite of the in-crowd.

Here is the reframe that matters: none of these is simply a problem to fix. Each one is protecting the gift. The relentless drive is the underside of your seriousness and your reliability. The inner wall is what gave your depth its privacy in a world that doesn't always handle depth gently. And the outsider's ache is the very thing that made you original — you could see the better system precisely because you were never fully inside the old one.

The work of this stretch of life is not to defeat these protectors. It is to thank them, and let them loosen their grip — to let your worth rest in who you are rather than in what you produce, to let yourself assert your own will without apology, and to build the belonging you were denied rather than ache for the one you were left out of. The gift was never in danger. You can come out from behind the door.`,
    },

    // 7 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Dance of Your Elements',
      body: `The elements are not boxes to sort you into. They live in you as a moving ecology — forces in conversation, each one teaching and tempering the others. This is the particular dance they make in you.

Air leads. Your mind is the front of you — relational, original, future-facing, always seeing the design behind the thing and the fairer way it could be arranged. It is the element most alive in your chart, and it is why you are, first, a person of ideas and of people.

Earth grounds. From Taurus rising and your Capricorn Sun comes the patience and the staying power that keep your ideas from floating off as mere theory. Earth is what lets you actually build — it gives Air a place to land and become real. Together they are the architect: vision made structural.

Fire, in you, is not a blaze — it is a focused flame. Your fire gathers almost entirely in Saturn and the Aries point: not the heat that shows off, but the concentrated, disciplined will that decides on a thing and bends a lifetime toward it. It is quiet, and it is unstoppable.

And Water runs underneath it all — the Eighth-House depth, the Plutonian undertow, the Neptune ideal. It is the least visible element in you and one of the most powerful, the source of your gravity and your capacity for transformation. Earth keeps it contained; Air gives it language; Fire gives it direction.

Held together, this is the dance: an original mind, grounded into a builder's patience, focused by a disciplined will, and fed from below by deep and transformative water. Not a type to be sorted into — a living balance, always in motion. Which is only another way of saying: a soul, alive.`,
    },

    // Practices ───────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      body: `Practices are how a portrait becomes a life. None of these is a task to perfect — each is a small, embodied way of tending the dance. Take up whichever one is alive for you, and let the rest wait.

Air — Name the Vision. Once a week, put one of your better-way ideas into a single written sentence before you do anything with it. Your mind moves fast and wide; giving the vision a sharp edge is how it becomes buildable.

Earth — One Real Brick. When an idea excites you, make one small, concrete, finished thing toward it this week — not the whole structure, one brick. Your gift is completion over time; honor it one true step at a time.

Fire — Claim One Want. Each week, name one thing you want purely for yourself — not useful, not for the cause, not for anyone else — and move one inch toward it. This is how the disciplined will learns to serve you too, and not only the work.

Water — The Conscious Descent. When something in you runs deep, resist the reflex to manage it back to the surface. Set aside ten quiet minutes and go down into it, the way you would enter deep water — not to fix it, but to be with it. You already know the way down.

Aether — Let It Be Received. Now and then, set the building down entirely and simply receive — a conversation with no agenda, a stretch of time you do not have to make useful. Your Saturn serves something larger than you; let that larger thing hold you sometimes, instead of only the other way around.`,
    },

  ],

  // ── Part II — The Year Ahead (the Season + the Living Spiral) ──────────────
  // Grounded in his 12-month transit report (Astrograph, starting 6/22/2026) —
  // transit DATA only; all prose written fresh. Each phase reads a real transit
  // as an elemental movement and an invitation (the Living Spiral), with the
  // transit named quietly as a footnote. The Blessing closes the whole portrait.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Season of Dissolving and Rebuilding',
    timeframe: 'June 2026 – June 2027',
    openingHeadline:
      'This is one of the great threshold years of a life — the old structures dissolving and the true foundation being rebuilt, at the same time. It asks much, and it gives much.',
    openingTheme: `Your birth chart is the landscape you carry through a whole life. The transits are the weather moving across it — and this year, the weather is as significant as it gets. Two of the slowest, deepest forces in the sky are working on you at once, and they are working in opposite directions on purpose.

On one side, a great softening: the planet of dissolution is moving across the most essential parts of you — your sense of self, your ideals, your direction — loosening old certainties and asking for surrender. On the other side, a great solidifying: you are coming into your second Saturn return, the roughly-thirty-year reckoning in which the structure of a life is rebuilt on truer ground. Dissolve, and rebuild. Let go, and lay a new foundation. This is not a contradiction — it is the whole work of the year. What follows is the weather of it, and the invitations inside: what is asking to come apart, what is asking to be rebuilt, and where grace is flowing to carry you through. None of it is fixed, and none of it is fate. Your soul chooses how to walk through all of it.`,
    phases: [
      {
        element: 'aether',
        title: 'The Great Softening',
        timeframe: 'All year (Neptune)',
        transits: ['Neptune entering your Twelfth House', 'Neptune opposite your Sun', 'Neptune opposite your Uranus and Jupiter'],
        body: `All year, Neptune — the planet of the sacred, the imaginal, and the dissolving — is the dominant weather. It crosses into the most hidden room of your chart and reaches across the sky to touch your Sun, your ideals, and your sense of freedom. Where Neptune moves, hard edges soften: certainties loosen their grip, the will to control quietly lets go, and the line between the everyday and the holy grows thin.

This can feel like a beautiful confusion, or like a loss of solid ground — a season where you are less sure of yourself than usual, more porous, more moved by compassion, more drawn toward the spiritual than the strategic. It is not a failure of your usual clarity; it is a deliberate undoing, making room. The invitation is not to force certainty back into place, but to let yourself be softened — to trust what cannot be controlled, and to let a more compassionate, less driven self begin to take shape underneath.`,
        question: 'What am I being asked to soften, surrender, or stop controlling this year?',
      },
      {
        element: 'earth',
        title: 'The Foundation Returns',
        timeframe: 'Spring 2027 (the Saturn return)',
        transits: ['Saturn conjunct your natal Saturn (second Saturn return)'],
        body: `Then comes the great solidifying. Saturn returns to the exact place it held when you were born — your second Saturn return, the reckoning that comes roughly twice in a long life. Saturn is the focal point your whole chart funnels through, so this is no ordinary transit; it is the deep structure of your life coming up for review, all at once.

This is the season to ask the Saturn-return questions honestly: What have I actually built? What is still true, and what was only ever inherited or assumed? What do I want the next long chapter to stand on? It is a time of real maturation — of sloughing off what no longer fits, the way a snake sheds a skin, and committing to what does. The softening of Neptune has loosened the old structure precisely so that this rebuilding can happen on truer ground. What you lay down now will hold for a long time. Build it as your own.`,
        question: 'What have I truly built — and what do I want the next long chapter of my life to stand on?',
      },
      {
        element: 'water',
        title: 'The Depths That Flow',
        timeframe: 'Through 2026 into 2027',
        transits: ['Pluto in trine with your Uranus', 'Pluto in trine with your Jupiter'],
        body: `Underneath the dissolving and the rebuilding runs a current of deep, flowing transformation — and unusually, it flows with ease. Pluto, the planet of profound change, moves into long and supportive contact with your freedom and your philosophy of life. Where Neptune softens and Saturn rebuilds, Pluto transforms — but in harmony, not crisis.

This is the part of the year where your deepest changes feel less like upheaval and more like a tide you can swim with. Your understanding of the world may quietly reorganize; long-held beliefs may deepen or fall away without drama; you may find yourself drawn into serious study, or into your own inner process, or another's. For someone with your Plutonian depth, this is almost a homecoming — transformation arriving as a friend rather than a thief. Let it move you. It is doing, gently, what you have always known how to do: turning experience into something deeper and truer.`,
        question: 'What deep change is flowing easily through me now, if I let it?',
      },
      {
        element: 'fire',
        title: 'The Will Re-Awakened',
        timeframe: 'Summer 2026, returning into 2027',
        transits: ['Uranus in trine with your Uranus', 'Chiron in trine with your Sun'],
        body: `And through the softening and the rebuilding, something in you quickens and reclaims itself. Uranus, the awakener, moves into easy contact with your own original nature, and Chiron, the deep healer, reaches your Sun — your core identity, your sense of self.

This is a season of new wings. The Uranus contact stirs a restlessness with purpose: seminal ideas arriving, a new phase of your thinking beginning to take shape, a will-to-be-different reactivated after years of steady building. And the Chiron contact brings a quiet healing to the very center of you — old wounds around your self-worth, your father or the mentors who shaped you, your right to take up space, surfacing not to hurt but to be at last integrated. Together they offer something precious in a year of so much letting-go: a renewed sense of your own self-confidence, hard-won and real. The will that your Saturn so often disciplines and holds back gets, this year, to wake up and claim itself.`,
        question: 'What in me is ready to wake up, heal, and claim itself more fully?',
      },
      {
        element: 'air',
        title: 'The New Vision',
        timeframe: 'The thread through the whole year',
        transits: ['Pluto in trine with your Jupiter', 'the year integrated'],
        body: `And running through all of it is the element most native to you — the mind that makes meaning. A year like this one is not just something to survive; for someone built the way you are, it is raw material. The dissolving, the rebuilding, the deep flowing change, the reawakened will — all of it is feeding a new vision of how you want to live and what you want to build next.

Don't rush it into a plan too early. This is a year to let the new design assemble itself slowly, beneath the surface, the way your best ideas always arrive — as if from nowhere, fully formed, after a long quiet incubation. By the far side of this season, you will likely understand your own life, and the next thing you are here to build, with a clarity you do not have yet. Trust the incubation. The architect in you is drawing new plans.`,
        question: 'What new vision of my life and my work is quietly assembling itself this year?',
      },
    ],
    weatherPattern: [
      { season: 'All year', element: 'aether', invitation: 'Let the old certainties soften; surrender control' },
      { season: 'Spring 2027', element: 'earth', invitation: 'Rebuild your foundation on what is truly yours' },
      { season: 'Through 2026–27', element: 'water', invitation: 'Let deep change flow; swim with the tide' },
      { season: 'Summer 2026 on', element: 'fire', invitation: 'Let your will wake up and your self heal' },
      { season: 'The whole year', element: 'air', invitation: 'Let the new vision assemble slowly' },
    ],
    goldenThread: `Almost everything this year points the same way: a great dissolving and a great rebuilding, happening together on purpose. Neptune softens the old structures and loosens your grip; your second Saturn return rebuilds the foundation on truer ground; Pluto moves deep transformation through you with surprising ease; and Uranus and Chiron wake up your will and heal the center of you — all of it feeding, underneath, a new vision of the life you want to build next. It is a profound year, and not a light one. But you, of all people, were built for exactly this: to let the old form go, and to construct the next one well. This is the threshold where the builder rebuilds himself.`,
    questions: [
      'What am I being asked to soften, surrender, or stop controlling?',
      'What have I truly built — and what do I want the next chapter to stand on?',
      'What deep change is flowing through me, if I stop resisting it?',
      'What in me is ready to wake up, heal, and claim itself?',
    ],
    closing: {
      title: 'A Blessing',
      body: `May you trust the dissolving as much as you have always trusted the building.

May you let the old structures soften without fearing you will lose yourself — because what is real in you cannot be dissolved, only revealed.

May this Saturn return find you rebuilding on ground that is truly your own: not the foundation you inherited, not the one you assumed you had to carry, but the one you actually choose, now, with all you have learned.

May the will you so often hold in check wake up and claim its place. May the center of you heal. And may you come to rest your worth in who you are, not only in what you build.

You have spent a life making strong things for others to stand on. May this be the season you build, at last, for your own soul too — and may you know that the work you do, when it is true, is a kind of sacred offering, and that it matters.`,
    },
  },
};

export default nathanPortrait;
