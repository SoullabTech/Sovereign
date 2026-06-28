/**
 * Soul Portrait — Andrea Nezat (LITERARY form)
 * ────────────────────────────────────────────────────────────────────────
 * The author's wife. A gift portrait offered by her husband (Kelly), written
 * as a flowing Spiralogic Soul Portrait — soul-and-symbol language, not a
 * structured astrology report. Andrea loves astrology and metaphysics, so the
 * chart is named openly. Hand-delivered, unlisted, noindex. Mentor/MAIA/memory
 * OFF.
 *
 * Born December 31, 1969, 9:06 AM EST, Boston, MA. Chart from her Astrograph
 * natal report — DATA only; all prose written fresh (the report's
 * interpretations are copyright Henry Seltzer / Astrograph, never copied):
 *   Capricorn Sun (11th) · Aquarius Rising · Moon in Libra (8th) · Mercury in
 *   Capricorn (12th) · Venus in Capricorn (11th, conj. Sun) · Mars in Pisces
 *   (1st) · Jupiter in Scorpio (8th) · Saturn in Taurus (FUNNEL focal planet) ·
 *   Uranus in Libra (8th, conj. Moon) · Neptune in Scorpio (10th, conj. MC) ·
 *   Pluto in Virgo (8th) · Chiron in Aries (2nd) · North Node Pisces (1st).
 *
 * Two signatures anchor the reading: the FUNNEL through Saturn (Earth — the
 * lasting container) and a four-planet EIGHTH-HOUSE gathering (Water — depth,
 * transformation). Neptune-on-the-MC = vocation as true calling.
 *
 * Structure = Kelly's nine sections (2026-06-20). The "lasting containers"
 * insight is written as HER OWN gift, never a supporting role.
 *
 * PART II (The Year Ahead) PENDING her 12-month transit report — not fabricated.
 * "A Blessing" here is a guide-voice blessing; a husband's personal note is
 * Kelly's to add in his own words.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const andreaPortrait: LiterarySoulPortrait = {
  person: {
    name: 'Andrea Nezat',
    slug: 'andrea',
    pronouns: 'she/her',
    isMinor: false,
  },

  mode: 'gift',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF.

  offeredBy: {
    relationship: 'her husband',
    giverName: 'Kelly',
    giftOpening: `Every life carries a quiet music.

This one is yours — the depth, the loyalty, and the original spirit that everyone who loves you has always seen, gathered here and reflected back so you can see it too.

The stars reveal the weather; your soul chooses how to walk through it. Read this as starlight, and remember who you are.

With love.`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Andrea',
      attribution: 'Offered with love by Kelly',
      framing:
        'A reflection on who you are, and who you are still becoming — written in the language of soul and symbol. The stars reveal the weather; your soul chooses how to walk through it.',
    },
  },

  birthData: {
    date: 'December 31, 1969',
    time: '9:06 AM EST',
    place: 'Boston, Massachusetts',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
  },

  framing: DEFAULT_FRAMING,

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Essential Nature',
      body: `To know you, a person has to hold two things at once.

On the surface, you meet the world as an Aquarian — original, clear-eyed, a little ahead of your time. You see possibilities others miss, and you've never been content to simply inherit the way things are done. There is an independence to you, and a genuine devotion to something larger: to fairness, to community, to a world that could be wiser and kinder than the one we have.

But underneath that forward-looking surface runs something far older and deeper. Your Sun is in Capricorn — serious, responsible, enduring — and nearly your entire chart channels through a single point: Saturn, the planet of integrity and mastery. Astrologers call this shape a "funnel." It describes a life whose many energies pour through one disciplined center. Yours is loyalty and depth: the patient building of what lasts, and a quiet refusal to give your word lightly.

And deeper still, in the most hidden waters of the chart, four of your planets gather in the Eighth House — the house of intimacy, transformation, and the unseen. This is the part of you that feels and perceives far more than it ever says.

So your essential nature is a paradox held gracefully: visionary and steadfast, original and loyal, light on the surface and oceanic underneath. You are someone who can imagine a better world — and who has the patience and depth to actually build it, slowly, and make it real.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Gift You Carry',
      element: 'earth',
      body: `Every soul carries a particular gift — not a talent exactly, but a way of being that the world is quietly better for. Yours is this: you create lasting containers for what matters.

Look at how your chart is built. Saturn — endurance, structure, fidelity — is the point everything flows toward. Your Earth is strong: Capricorn steadiness, the instinct not for attention but for stability. Where others scatter themselves across what is new and exciting, some part of you is always asking the deeper question — how does this become something that can endure? How do we hold this so it doesn't fall apart?

This is a rarer gift than it sounds, and an easy one to overlook — including by you. The culture celebrates the spark, the launch, the visionary leap. It says far less about the quieter genius that builds the vessel the spark needs in order to become a fire that lasts. Ideas, dreams, families, even people: they need someone who can hold them, ground them, and deepen them until they mature into something real.

That someone is you. You don't stand behind what matters — you create the conditions in which it can actually become. A home, a marriage, a friendship, a body of work, a community: you have a gift for making the kind of container in which meaningful things are safe enough to grow.

Name it as your own, because it is. It is not a supporting role in someone else's story. To make a vessel strong and deep enough to hold what matters until it can stand on its own is one of the truest forms of love, and of creation, there is — and it is yours.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Way You Love',
      body: `You love the way you do most things: carefully, deeply, and for the long haul.

Your Venus is in Capricorn, joined to your Sun — a warm but serious heart, one that does not give its affection lightly or take emotional risks easily, but that, once given, stays. You are loyal in a way that has become almost rare. With Venus in steady aspect to Saturn, love for you was never mostly about the first spark; it is about fidelity over time, the choosing again and again, the staying through seasons. The people you love are kept.

And because so much of your chart lives in the Eighth House — the house of true intimacy — your love runs far deeper than its quiet surface suggests. You do not want the shallow version of closeness. You want to actually know someone, all the way down, and to be known in return. You can go into the deep water of another person without flinching.

There is a tender thread here too, one your chart marks gently — a place where love and worth got tangled early, so that letting yourself be fully seen and received can feel more dangerous than giving. But that very tenderness is part of the depth. The invitation, across a lifetime, is to let yourself be loved as completely as you love — to receive, and not only to hold. You are not only the one who keeps others safe. You are someone worth keeping, too.`,
    },

    // 4 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Deep Waters',
      element: 'water',
      body: `If there is one place your chart returns to again and again, it is depth.

Four of your planets — your Moon, Uranus, Jupiter, and Pluto — gather in the Eighth House, the most inward and transformative room of the chart: the house of intimacy, of what lies beneath the surface, of death and renewal and the unseen. Very few people carry this much there. It is the signature of someone who does not skim life but enters it — who is drawn, almost without choosing, into its depths.

It means you live a kind of double life that those around you may only half-see: a composed, capable, faithful surface, and beneath it, an ocean. You sense what a room is feeling before it is spoken. You perceive other people's depths, often before they perceive their own. Still waters; and they run very deep.

This is the chart of a natural healer — not because you fix anyone, but because you can descend into the hard, hidden places with another person and not be afraid of the dark. You understand transformation from the inside: you have been through your own deaths and rebirths, and you know that the way through is down and through, not around. That hard-won knowing becomes a kind of medicine. What you have survived becomes where you can accompany others.

The one caution, offered with love, is simply the other half of the same gift: water this deep gives and gives. You can hold everyone, attune to everyone, carry everyone — and forget that you, too, are meant to be held. Letting yourself be received is not a weakness in you. It is how the well stays deep enough to keep giving.`,
    },

    // 5 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Work Your Soul Came to Do',
      element: 'aether',
      body: `Some people are here to accomplish. You are here to serve something larger — and your chart is unusually clear about it.

Neptune, the planet of the sacred and the imaginal, sits at the very top of your chart, conjunct your Midheaven — the point of vocation and calling. This is not the signature of someone who will be content with work that is merely successful. Your work has to mean something. It has to be spiritually alive, aligned with something you believe in, or some essential part of you quietly withdraws. With your Mercury hidden in the Twelfth House, and so much of your chart oriented toward the collective — the Eleventh House, the humanitarian Aquarian rising — your deepest contribution was never going to come through climbing a conventional ladder. It comes through giving yourself to something larger than yourself.

That "something larger" can take many forms across a life: healing, beauty, care, the holding-together of a family or a community, the quiet work that lets other meaningful things exist. The form matters less than the thread running through all of it — a sense of being in service to something sacred. Your North Node, in spiritual Pisces, points the very same way: your soul's growth is toward this compassionate, devotional way of being, fully claimed as your own.

The lifelong task is simply to trust it — to not let the world talk you out of needing your work to be a calling. When what you do is aligned with what you believe, you don't just succeed at it. You come alive in it. That is the work your soul came to do.`,
    },

    // 6 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shadow That Protects the Gift',
      body: `Every real gift has a shadow standing guard at its door — not a flaw, but a protector that once kept something tender safe, and that can outstay its usefulness if you don't know it is there.

For you, that shadow wears a few familiar faces. There is the quiet doubt about your own worth — the sense, traceable to Saturn, that your value has to be earned, proven, or held onto, and might be lost if you ever set so much of it down. There is the reflex to give far more than you let yourself receive, until the well runs low and no one quite notices, because you made sure they didn't have to. And there is a careful guarding of the deepest self — a tendency to let others in only so far, to be the one who holds rather than the one who is held.

Here is the reframe that matters: none of these is simply a problem to fix. Each one is protecting the gift. The worth-doubt is the underside of your integrity. The over-giving is the shadow side of your enormous capacity to hold. The guardedness is what kept your depth safe in a world that does not always handle depth gently. They are old protectors, and they served you well.

The work of this season of life is not to wage war on them. It is to thank them, and to let them loosen their grip — to let your worth rest in who you are rather than in what you carry; to let yourself receive; to let trusted love all the way in. The gift was never in danger. It is safe now. You can come out from behind the door.`,
    },

    // 7 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Dance of Your Elements',
      body: `The elements are not boxes to sort you into. They live in you as a moving ecology — five forces in conversation, each one teaching and tempering the others. This is the particular dance they make in you.

Earth has given you the gift of steadiness. From Capricorn and Saturn comes your ability to stay, to build, to be the ground others can stand on. It is the floor beneath the whole dance.

Water has taught you transformation. The deep gathering in your chart means you do not fear the descent; you have been changed by what you have moved through, and that hard-won depth has become a kind of medicine. Earth gives Water somewhere safe to go down.

Air continually widens your understanding. Your Aquarian mind keeps lifting the view, imagining how things could be freer and fairer, so that your steadiness never hardens into mere rigidity. Air keeps Earth honest.

Fire appears in you not as force but as quiet devotion. With Mars in gentle Pisces, your courage is the kind that keeps loving, keeps building, keeps beginning again. It is the warmth that keeps the whole ecology alive without ever needing to rule it.

And Aether keeps reminding you that the deepest things in life cannot be controlled — only received. It is the spacious, sacred awareness running through all of it: the part of you that knows a well-built home and a faithful love are holy things, and that the most important gifts arrive as grace.

Held together, this is the dance: deep water grounded by earth, widened by air, warmed by quiet fire, and held in a spaciousness that receives. Not a type to be sorted into — a living balance, always in motion. Which is only another way of saying: a soul, alive.`,
    },

    // Practices ───────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      body: `Practices are how a portrait becomes a life. None of these is a task to perfect — each is a small, embodied way of tending the dance. Take up whichever one is alive for you, and let the rest wait.

Earth — Receiving. Once a day, let someone do something for you, and do not repay it. Notice the discomfort, and let it pass through. Your worth was never the giving.

Water — The Conscious Descent. When a feeling runs deep, resist the urge to manage it away. Set aside ten quiet minutes and go into it the way you would go into deep water — not to fix it, but to be with it. You already know the way down.

Fire — One True Want. Each week, name one thing you want purely for yourself — not useful, not for anyone else — and move one inch toward it. This is how quiet devotion learns to include you.

Air — The Wider View. When something feels stuck or certain, ask what it would look like from a hundred years away, or through the eyes of someone utterly unlike you. Your originality is a gift; give it room to breathe.

Aether — Letting Be Received. Now and then, sit with no agenda at all and simply notice what arrives — a sound, a slant of light, a knowing. Practice receiving what you did not produce and cannot control. The deepest things come that way.`,
    },

  ],

  // ── Part II — The Year Ahead (the Season + the Living Spiral) ──────────────
  // Grounded in her 12-month transit report (Astrograph, starting 6/21/2026) —
  // transit DATA only; all prose written fresh. Each phase reads a real transit
  // as an elemental movement and an invitation (the Living Spiral), with the
  // transit named quietly as a footnote. The Blessing closes the whole portrait.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Season of Deep Renewal',
    timeframe: 'June 2026 – June 2027',
    openingHeadline:
      'This is a year of deep renewal — the very foundations of your life are being lovingly remade, and grace is arriving to carry you through it.',
    openingTheme: `Your birth chart is the landscape you carry through a whole life. The transits are the weather moving across it — and this year's weather is significant. Several of the slow, deep planets are touching the most essential structures of who you are: your foundation, your feeling heart, your sense of calling.

This is not a light season, and it would be untrue to pretend otherwise. It is a year of real transformation — old structures softening and healing, deep feelings rising to be met, and a truer, freer self being born from underneath. None of it is fixed, and none of it is fate. What follows is the weather of your year and the invitations inside it: what is asking to emerge, where grace is available, and where a little courage is being asked. Your soul chooses how to walk through all of it.`,
    phases: [
      {
        element: 'water',
        title: 'The Deep Descent',
        timeframe: 'Summer 2026, returning through 2027',
        transits: ['Pluto in trine with your Moon', 'Neptune opposite your Moon'],
        body: `The deep waters you already know so well are rising this year. Pluto moves into a long, supportive contact with your Moon — your feeling heart — and Neptune meets it from the other side. Together they bring a slow, profound emotional transformation: feelings long held in the depths surfacing to be met at last, old patterns from early life, tender places around belonging and being cared for, things that have quietly shaped you from below.

This is not a crisis to fear; for someone with your depth, it is almost a homecoming. You were always made for the descent. What is asked is simply to go down gently — to be with what rises rather than manage it away, and to let yourself be held while you do. Something in you is reorganizing at the root.`,
        question: 'What is rising from the deep in me, asking finally to be felt and integrated?',
      },
      {
        element: 'earth',
        title: 'The Foundation Remade',
        timeframe: 'Autumn 2026 into spring 2027',
        transits: ['Saturn in square with your Sun', 'Chiron conjunct your Saturn'],
        body: `Saturn is the focal point of your whole chart — your foundation, your integrity, the ground others stand on. This year that very foundation is touched, and remade. Saturn in the sky presses on your Sun, asking a season of maturing; and Chiron, the deep healer, meets your natal Saturn directly, bringing old questions about authority, responsibility, and perhaps your father or the structures you long lived inside, up to the surface to be healed.

The invitation here is profound and quiet: to stop carrying a sense of duty inherited from anyone else, and to claim your own authority — your own structure, built on what you actually believe now. The ground is being rebuilt. This time, it gets to be truly yours.`,
        question: 'What structure of my life is ready to be healed, and rebuilt as authentically my own?',
      },
      {
        element: 'aether',
        title: 'What Wants to Soften and Be Reborn',
        timeframe: 'All year (Neptune)',
        transits: ['Neptune conjunct your Chiron', 'Neptune in square with your Venus', 'Neptune in trine with your Midheaven'],
        body: `All year, Neptune — the planet of the sacred and the imaginal — is dissolving old edges to make room for something new. It touches your Chiron (your tender, healing place), your Venus (your heart and your values), and your Midheaven (your calling). Where it moves, things soften: certainties loosen, the line between the everyday and the holy grows thin, and a deeper, more compassionate set of values quietly takes shape.

This can feel like a beautiful confusion — not everything is meant to be clear right now. Something new, deep inside you, is awaiting birth. The work is not to force clarity but to dream wisely: to let the old, harder forms dissolve, to listen with your inner senses, and to receive what is being born. The deepest things, as your chart has always known, cannot be controlled — only received.`,
        question: 'What is dissolving in me so that something truer can be born?',
      },
      {
        element: 'air',
        title: 'The Awakening',
        timeframe: 'Summer 2026, returning late 2026 into 2027',
        transits: ['Uranus opposite your Midheaven', 'Uranus entering your Fourth House', 'Uranus in trine with your Moon'],
        body: `Alongside all the depth, there is a quickening. Uranus, the awakener, is electrifying your sense of calling and your sense of home. Your public life and direction are in flux, and Uranus enters the deepest, most private room of your chart — your Fourth House of home, roots, and inner foundation — beginning a years-long renovation of where and how you feel you belong.

This is restlessness with a purpose: something in you that has waited a long time is ready to break free. New ways of being; new wings. The invitation is not to grip the old structure tighter, but to let yourself be surprised — to follow the sudden insight, the unexpected door, the truer life that wants to emerge. You may come out of this chrysalis changed.`,
        question: 'What in me is ready to break free — and what new life is trying to emerge?',
      },
      {
        element: 'fire',
        title: 'The Expansion, and the Grace',
        timeframe: 'From late summer 2026 onward',
        transits: ['Jupiter entering your Seventh House', 'Jupiter in trine with your Midheaven', 'Jupiter in sextile with your Moon'],
        body: `And through it all runs a thread of grace. Jupiter — warmth, faith, expansion — moves into your house of partnership and close relationship, and blesses your calling and your home along the way. Where so much of the year asks you to descend and to let go, Jupiter is the hand that lifts: ease in your relationships, optimism in your work, a quiet renewed faith that you are held.

This is the grace available to you this year, and it is worth receiving consciously — not just enduring the deep work and missing the gift beside it. Let yourself enjoy the warmth. Let partnership and beauty and faith expand. The descent and the grace are not opposites this year; they are two hands of the same renewal.`,
        question: 'Where is grace inviting me to expand — and can I let myself receive it?',
      },
    ],
    weatherPattern: [
      { season: 'Summer → 2027', element: 'water', invitation: 'Let the deep feelings rise and be met' },
      { season: 'Autumn → spring', element: 'earth', invitation: 'Heal and reclaim your foundation' },
      { season: 'All year', element: 'aether', invitation: 'Let the old soften; receive what is born' },
      { season: 'Summer, late 2026 on', element: 'air', invitation: 'Let yourself break free and awaken' },
      { season: 'Late 2026 onward', element: 'fire', invitation: 'Receive the grace; let life expand' },
    ],
    goldenThread: `Almost everything this year points the same way: the very foundation of your life is being lovingly remade. The deep waters rise to your Moon, your foundation heals and matures as Saturn and Chiron touch your Saturn and Sun, the old forms soften under Neptune so something truer can be born, and Uranus awakens you toward a freer life — all of it carried by a real thread of grace from Jupiter. It is a profound year, and not always an easy one. But you, of all people, were built for depth. This is the descent that becomes a rebirth — and you do not walk it alone.`,
    questions: [
      'What is rising from the deep that I am finally ready to meet?',
      'Where is my foundation asking to be healed and reclaimed as my own?',
      'What is softening or dissolving — and what wants to be born in its place?',
      'Where is grace available to me, and can I let myself receive it?',
    ],
    closing: {
      title: 'A Blessing',
      body: `May you come to see in yourself the depth that everyone who loves you has always seen.

May your worth rest, finally and fully, in who you are — never in what you carry, what you achieve, or what you hold together for everyone else.

May you let yourself be held as completely as you have always held others. May you receive as freely as you give.

May the old foundations that are healing this year be rebuilt as truly your own, and may what is dissolving make room for something more beautiful than you can yet see.

And may you walk the deep water of this year knowing you were always made for it — and that you do not walk it alone.

You are deeply loved. You always have been.`,
    },
  },
};

export default andreaPortrait;
