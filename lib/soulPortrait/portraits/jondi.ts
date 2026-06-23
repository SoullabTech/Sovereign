/**
 * Soul Portrait — Jondi (LITERARY form)
 * ────────────────────────────────────────────────────────────────────────
 * A Soullab teammate and beta tester. A gift portrait offered by Kelly, written
 * as a flowing Spiralogic Soul Portrait — soul-and-symbol language, not a
 * structured astrology report. Hand-delivered, unlisted, noindex. Mentor/MAIA/
 * memory OFF.
 *
 * Born February 19, 1956, 1:30 AM CST, Eupora, Mississippi (33N32, 89W16). Chart
 * from her Astrograph natal report — DATA only; all prose written fresh (the
 * report's interpretations are copyright Henry Seltzer / Astrograph, never copied):
 *   Aquarius Sun (3rd) · Sagittarius Rising · Moon in Taurus (6th) · Mercury in
 *   Aquarius (2nd) · Venus in Aries (4th) · Mars in Sagittarius (1st) · Jupiter in
 *   Leo (9th, RULER of the rising sign, conj. Pluto) · Saturn in Sagittarius (12th,
 *   conj. Ascendant) · Uranus in Cancer (8th) · Neptune in Scorpio (11th) · Pluto
 *   in Leo (9th) · Chiron in Aquarius (2nd, sextile Ascendant 0.2°) · North Node
 *   Sagittarius (1st) / South Node Gemini (7th).
 *
 * Signature: a FIXED GRAND CROSS — Sun (Aquarius) opp Pluto (Leo), Moon (Taurus)
 * opp Neptune (Scorpio), all in square: the rarest, most demanding pattern, the
 * mark of a life forged through real trials into exceptional strength. Dominant
 * element FIRE (5), dominant modality FIXED (6 — the unbreakable will of the
 * cross). Sagittarius rising + a 9th-house gathering (Jupiter, Pluto) = the
 * philosopher-seeker. Chiron tight to the Ascendant = the wounded healer, central
 * to her identity. Born 1956 — a life largely lived, a wisdom largely earned.
 *
 * PART II (The Year Ahead) is grounded in her 12-month transit report (Astrograph,
 * starting 6/22/2026) — transit DATA only; prose fresh. A profound late-life
 * threshold: heavy Chiron + Pluto on the old wounds (healing), Uranus opposing
 * Saturn (old structures loosening), and a Jupiter return into the 9th (faith
 * and philosophy reborn).
 *
 * The giver's note + threshold below are a respectful DRAFT. Kelly's own words to
 * Jondi are his to write — the words in the gift remain his. "A Blessing" is a
 * guide-voice blessing, calibrated to a valued teammate and a life of earned wisdom.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const jondiPortrait: LiterarySoulPortrait = {
  person: {
    name: 'Jondi',
    slug: 'jondi',
    pronouns: 'she/her',
    isMinor: false,
  },

  mode: 'gift',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF.

  offeredBy: {
    relationship: 'her teammate',
    giverName: 'Kelly',
    // DRAFT — Kelly to replace with his own words. The words in the gift remain his.
    giftOpening: `Some people make a place truer simply by being in it. You are one of them — and the work we share at Soullab is better, and warmer, for your presence in it.

This is a small gift and an offering of thanks: a reflection of the person we have come to know, drawn from the sky you were born under and held up so you might see yourself the way we see you.

The stars reveal the weather; your soul chooses how to walk through it. Read this as a mirror offered in gratitude, and keep what your own heart already knows is true.

— Kelly`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Jondi',
      attribution: 'Offered with gratitude by Kelly',
      framing:
        'A reflection on who you are, and who you are still becoming — written in the language of soul and symbol. The stars reveal the weather; your soul chooses how to walk through it.',
    },
  },

  birthData: {
    date: 'February 19, 1956',
    time: '1:30 AM CST',
    place: 'Eupora, Mississippi',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
  },

  framing: DEFAULT_FRAMING,

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Essential Nature',
      body: `To know you, a person has to understand that you were forged.

On the surface, you meet the world as a Sagittarian — warm, honest, forthright, an optimist and a seeker. One always knows where one stands with you. You love truth and freedom and the big picture; you are drawn to meaning, to nature, to the question behind the question. People are easy around you, because you are easy to be around.

But underneath that open surface is one of the rarest and most demanding patterns a chart can hold. Four of your planets stand locked together in a great square the astrologers call a Grand Cross — the Sun, the Moon, and two of the slow, deep planets, each pulling against the others. It is the signature of a life that does not get to coast: of real trials, met and survived, and of a will and a determination that most people are never asked to find in themselves. If you have been tested — and a chart shaped like this rarely comes without trial — the testing built something in you that ease never could.

And running through both — the open Sagittarian seeker and the forged inner strength — is an Aquarian mind that has always been a little ahead of its time: clear, humane, original, oriented toward a better and fairer world.

So your essential nature is this: a seeker who was tempered in fire. Warm on the outside and unbreakable underneath. Someone who has carried a great deal, found exceptional strength in the carrying, and turned what you carried into a kind of wisdom. You are not someone life left untouched. You are someone life made deep.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Gift You Carry',
      element: 'fire',
      body: `Every soul carries a particular gift — not a talent exactly, but a way of being that the world is quietly better for. Yours is this: you turn what you have lived through into light for other people.

Your chart is fire-led and built around the seeker. Sagittarius rises in it; your Jupiter — warmth, faith, the love of meaning — rules your whole chart and sits high in the house of philosophy and higher truth. You were made to look for what things mean, to find the larger pattern, to keep faith that there is sense and beauty underneath even the hard parts. And because of the Grand Cross, you do not find that meaning cheaply or secondhand. You have earned it, in your own life, the long way.

And there is a deeper thread woven right into who you are. The wounded-healer point of your chart sits almost exactly on your rising sign — closer than it falls for almost anyone. It means your own wounds were never only wounds; they became the very source of your compassion. You understand other people's pain from the inside, because you have been there. That is a rare and costly kind of gift, and it cannot be faked.

So what you carry is hard-won wisdom, offered as light — and the people who know you already have a name for it, even the ones who have never said it to your face. You are the wise woman they come to: the healer, the teacher, the guide. The one who has walked through fire and come back able to say, gently and truthfully, "I know — and here is what I found on the other side." Name it as your own, because it is. Not everyone who suffers turns it into a lamp for others. You did — and you have been quietly lighting the way for people for a very long time now.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Way You Love',
      body: `You love warmly, loyally, and with your whole heart — and you love as someone who knows what love can cost.

Your Venus, the planet of love, is in fiery Aries and sits in the house of home and roots, and it touches your rising sign with grace. This gives you an affection that is enthusiastic and generous and a little impulsive — quick to warmth, devoted to the people and the home you make your own. There is a charm to you that draws people in, and a soul-level beauty the chart marks plainly. Your Taurus Moon adds steadfastness underneath the warmth: once someone is yours, they are kept.

But your chart is honest about the cost, too. The planet of sudden change sits in your house of deep intimacy — which can mean an unconventional, all-the-way kind of closeness, and it can also mean that love has, at times, been taken from you suddenly, or changed without warning. If you have known that kind of loss, the chart saw it. It is part of why your love runs as deep as it does, and part of why you hold the people who remain so carefully.

And there is a lifelong invitation written here, gentle but real: your soul's growth points toward standing fully in your own self, even inside the closeness you love. Not loving less — loving from a steadier center, depending on your own ground first, so that love is something you give from fullness rather than reach for from need. You have spent a life learning to be your own. That learning, too, is a form of love — for yourself, and so for everyone you hold.`,
    },

    // 4 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Deep Waters',
      element: 'water',
      body: `Beneath the warm seeker runs a current that is genuinely deep, and genuinely mysterious.

Your chart carries a strong vein of the unseen. Neptune — the planet of the mystical and the imaginal — and the planet of sudden depth both sit in the most transformative, most hidden regions of your chart. This is the signature of someone with real intuition, even psychic sensitivity: you pick up what is unspoken, you sense what a person is feeling before they say it, and you have always known that there is more to the world than its surface. Dreams, the inner life, the things that can't quite be explained — these have never been strange to you. They are home.

It also means you understand transformation from the inside. You are someone who has been through deaths and rebirths — not always literal, but real: whole versions of your life ending so that a truer one could begin. You know the descent. You know that the way through the dark is down and through, not around. And you have come up changed, more than once.

That hard-won familiarity with the depths is part of your medicine. You are not frightened of another person's darkness, because you have met your own and survived it. You can sit with someone in the hardest place and not flinch. Still waters, and they run very deep — and what lives down there, in you, is not danger. It is wisdom, and a strange and durable kind of peace.`,
    },

    // 5 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Work Your Soul Came to Do',
      element: 'aether',
      body: `Some people are here to build things in the world. You are here to seek the truth, live it, and give it away — and your chart is unusually clear about it.

Three things point the same direction. Your Saturn — your deepest discipline and your hardest lessons — sits in the most spiritual, most hidden room of your chart, the place of surrender and union with something larger than yourself. The transformative planets gather in your house of philosophy and higher meaning, marking you as someone who must find her own truth through direct experience, never secondhand from anyone else. And the planet of vision sits in your house of community and the collective — and this is where you have become something a group treasures and rarely says out loud: its wise woman, the one the collective turns to. A maven who holds the shared wisdom and hands it back, who can feel the field of a gathering and tend it. Where many people seek the truth for themselves alone, you have always sought it for the whole, and carried it for the whole.

Put together, this is the chart of a seeker-mystic with a humanitarian heart. Your soul's work was never going to be measured in conventional success. It is the deeper assignment: to keep asking what is true, to test it in your own life rather than borrow it, to surrender the small self into something larger and more sacred — and then to bring back what you find, in service of other people and of a kinder world. The wisdom is not meant to stay yours. You came to gather it, and to hand it on.

You have been doing this work your whole life, often without calling it that. The work your soul came to do is simply to keep becoming wise, and to let that wisdom be of use. By every sign in your chart, you have.`,
    },

    // 6 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shadow That Protects the Gift',
      body: `Every real gift has a shadow standing guard at its door — not a flaw, but an old protector that once kept something tender safe, and that can overstay its usefulness if you don't know it is there.

For you, that shadow wears a few faces the chart names plainly. There is the inner critic — the one that works you hard and is never quite satisfied, that measures and finds the gap. There is an old ache around worth and security: a quiet, deep-rooted sense that there may not be enough, that what you have could be taken, that you have to earn your place again and again. There is the weight of Saturn in the hidden house — seasons where life felt too hard, or beyond your control, where the honest response was to withdraw and go inward and carry it alone. And underneath several of these runs an old wound about love and recognition: a sense, traceable far back, of not having been quite seen or held as you needed to be.

Here is the reframe that matters, and you have earned the right to hear it: none of these is simply a flaw. Each one protected the gift. The relentless inner standard is the underside of your depth and your integrity. The worry about enough is what made you resourceful and unbreakable. The withdrawal kept your tender places safe while you were still building your strength. The old ache about love is the very thing that taught you how much it matters to truly see another person — which is why you do.

The invitation now — and at this stage of a long, well-walked life, it is a real one — is not to fight these old guardians, but to thank them and let them rest. You are safe now. You have proven, many times over, that you are enough, that you can survive, that you are strong. The gift was never in danger. You can set the weight down.`,
    },

    // 7 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Dance of Your Elements',
      body: `The elements are not boxes to sort you into. They live in you as a moving ecology — forces in conversation, each one teaching and tempering the others. This is the particular dance they make in you.

Fire leads. It is the most alive element in your chart — the seeker's warmth, the love of meaning and freedom, the faith that keeps reaching even after hard years. It is your optimism and your courage, the flame that has refused, through everything, to go out.

Earth grounds. Your Moon stands alone in earth, in steady Taurus, and it does quiet, essential work: it is the loyalty, the practicality, the deep need for a safe and beautiful place to stand. It keeps the fire from burning loose, and gives the seeker somewhere to come home to.

Air widens. Your Aquarian mind keeps lifting the view — humane, original, oriented toward what is fair and what could be better — so your faith never narrows into dogma and your seeking stays open to the new.

And Water runs underneath it all — the psychic depth, the intuition, the familiarity with transformation and the unseen. It is the least visible element in you and one of the most powerful, the source of your compassion and your strange durable peace.

Held together, this is the dance: a leading fire that seeks and warms, grounded by a faithful earth, widened by a humane air, and fed from below by deep and knowing water. Not a type to be sorted into — a living balance, hard-won and always in motion. Which is only another way of saying: a soul, alive, and beautifully so.`,
    },

    // Practices ───────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      body: `Practices are how a portrait becomes a life. None of these is a task to perfect — each is a small, embodied way of tending the dance. Take up whichever one is alive for you, and let the rest wait.

Fire — Keep Faith Out Loud. Once in a while, say aloud the thing you actually believe is true and good about life. The seeker in you stays strongest when its faith is spoken, not just carried.

Earth — Let Yourself Be Held. Once a day, receive something — a kindness, a rest, a comfort — without earning it or repaying it. Your Taurus Moon has spent a lifetime making others safe; let the ground hold you, too.

Air — The Wider View. When something feels heavy or stuck, lift the lens: how will this look in ten years, or to someone you have never met? Your mind's gift is the bigger picture; give it room to breathe.

Water — The Conscious Descent. When a deep feeling rises, resist the urge to manage it away. Set aside ten quiet minutes and go down into it the way you would enter deep water — not to fix it, but to be with it. You already know the way down, and the way back up.

Aether — Set It Down. Now and then, name one old weight — one worry, one verdict about yourself, one thing you have carried long enough — and consciously set it down, even for an hour. You have carried enough. Practice what it feels like to be free of it.`,
    },

  ],

  // ── Part II — The Year Ahead (the Season + the Living Spiral) ──────────────
  // Grounded in her 12-month transit report (Astrograph, starting 6/22/2026) —
  // transit DATA only; all prose written fresh. Each phase reads a real transit
  // as an elemental movement and an invitation (the Living Spiral), with the
  // transit named quietly as a footnote. The Blessing closes the whole portrait.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Season of Healing, and Renewed Faith',
    timeframe: 'June 2026 – June 2027',
    openingHeadline:
      'This is a year of deep healing — the long-carried wounds rising at last to be tended, the old structures loosening, and your faith renewed from the roots.',
    openingTheme: `Your birth chart is the landscape you carry through a whole life. The transits are the weather moving across it — and this year's weather has gathered around one merciful purpose: healing. Several of the slow, deep planets are touching the oldest and most tender places in your chart at once, and where they move, what has been carried for a long time comes up — not to wound again, but to finally be set down.

This is not a small season, and it would be untrue to call it easy. It asks you to revisit old places. But for someone who has already survived so much and turned it into wisdom, it is less a trial than a homecoming — the long work of a lifetime coming round, at last, toward peace. What follows is the weather of your year and the invitations inside it: what is healing, what is loosening, and where your faith is being renewed. None of it is fixed, and none of it is fate. Your soul chooses how to walk through all of it — and you have always known how to walk.`,
    phases: [
      {
        element: 'water',
        title: 'The Long Wounds, Healing',
        timeframe: 'Summer 2026, returning through 2027',
        transits: ['Chiron in sextile with your Sun', 'Pluto conjunct your Chiron', 'Chiron opposite your Neptune'],
        body: `The deepest current of the year is healing. The wounded-healer planet moves into a long, gentle contact with your core self, and the planet of profound transformation reaches the very wound-point of your chart. Together they bring the oldest aches — the ones from far back, about worth and love and being seen — up into the light, where they can finally be met and released.

This is tender work, and it may stir grief before it brings peace. But you, of all people, know how to make the descent and come back changed. What is being offered here is not more suffering; it is the completion of suffering — the chance to lay down wounds you have carried so long you may have stopped noticing their weight. Go gently. Let yourself be helped. Something in you that has hurt for a very long time is being allowed, at last, to heal.`,
        question: 'What old wound is finally ready to be tended and set down?',
      },
      {
        element: 'air',
        title: 'The Mind Made New',
        timeframe: 'Mid-2026 into 2027',
        transits: ['Pluto conjunct your Mercury', 'Uranus in trine with your Mercury'],
        body: `Your mind itself is being renewed this year. The planet of depth moves across your Mercury — how you think, how you speak — making your communication deeper, more serious, less willing to settle for the surface. And the planet of awakening brings sudden insight and fresh, unexpected ways of seeing. Old ideas reorganize; new ones break through.

This is a year your already-original mind goes deeper still. You may find yourself drawn to study, to real questions, to saying what you actually mean rather than what is easy. The invitation is to trust the new thoughts as they arrive, and to let your understanding mature — to let a lifetime of seeking compost down into something clearer and truer than you have ever quite said before.`,
        question: 'What am I finally ready to understand, or to say, more truly than before?',
      },
      {
        element: 'earth',
        title: 'The Old Structures Loosen',
        timeframe: 'Summer 2026, returning late 2026 into spring 2027',
        transits: ['Uranus opposite your Saturn', 'Saturn conjunct your Venus'],
        body: `Alongside the healing, the structures of your life are being shaken loose. The awakener stands opposite your Saturn — the planet of your established order — and presses on it: old habits, old limits, old ways of doing things that may no longer fit who you have become. And Saturn itself begins a new long cycle in your house of love and values, asking you to look honestly at your relationships and what you treasure.

This can feel unsettling, like the ground moving. But not everything that holds us up still serves us, and some of what is loosening is ready to go. The invitation is discernment: to keep what is still true and load-bearing, and to let the rest fall away without clinging. You are not losing your foundation. You are being given the chance to stand on only what is real.`,
        question: 'What structure of my life is ready to be released, and what is worth keeping?',
      },
      {
        element: 'fire',
        title: 'Faith Reborn',
        timeframe: 'Autumn 2026 into winter',
        transits: ['Jupiter returning to its own place', 'Jupiter entering your Ninth House', 'Jupiter conjunct your Pluto'],
        body: `And then, like sunrise after a long night, your faith comes back to life. Jupiter — warmth, optimism, the love of meaning, the ruler of your whole chart — returns to the exact place it held when you were born, and moves into your house of philosophy and higher truth. This happens only once every twelve years, and this turn arrives precisely when you most need it: a renewal of faith, of optimism, of the seeker's fire, right after the deep healing work.

This is the part of the year to receive. After the wounds tended and the structures loosened, Jupiter lifts you — restoring your hope, widening your horizons, reminding you of the meaning you have always reached toward. The fire that has refused, through everything, to go out is being fed. Let it be fed. Let yourself feel optimistic again. You have earned this returning light.`,
        question: 'Where is my faith being renewed — and can I let myself feel hopeful again?',
      },
      {
        element: 'aether',
        title: 'The Coming Peace',
        timeframe: 'All year (Neptune)',
        transits: ['Neptune in trine with your Saturn', 'Neptune in sextile with your Mercury'],
        body: `And running quietly through all of it is a softening toward peace. Neptune — the planet of compassion and the sacred — moves in gentle contact with your Saturn and your mind all year, dissolving old hardness, opening you toward greater tenderness for yourself and for everyone, blurring just a little the line between the everyday and the holy.

This is the grace beneath the year's deeper work: a growing capacity to forgive, to release, to be at peace with what was and what is. The surrender your chart has always pointed toward — the laying down of the small, defended self into something larger and kinder — is being offered to you now, gently, as a gift rather than a demand. Let the old hardness soften. Let yourself come, at last, toward peace. It has been a long road, and you have walked it well.`,
        question: 'What would it feel like to make peace — with my life, and with myself?',
      },
    ],
    weatherPattern: [
      { season: 'Summer → 2027', element: 'water', invitation: 'Let the old wounds rise and be tended' },
      { season: 'Mid-2026 on', element: 'air', invitation: 'Let your understanding deepen and renew' },
      { season: 'Summer, late 2026 on', element: 'earth', invitation: 'Release what no longer holds; keep what is real' },
      { season: 'Autumn → winter', element: 'fire', invitation: 'Receive the returning faith and hope' },
      { season: 'All year', element: 'aether', invitation: 'Let the old hardness soften toward peace' },
    ],
    goldenThread: `Almost everything this year points the same way: it is time, finally, to heal and to come toward peace. The long wounds rise to be tended, your mind and understanding are renewed, the old structures loosen so you can stand on only what is real — and through it all, your faith is reborn and a deep compassion softens you toward yourself at last. It is a tender year, and not always an easy one. But you have already survived the hardest parts of your life and turned them into wisdom. This is not another trial. This is the long road coming round toward rest — the wounds healing, the fire renewed, the peace you have earned arriving to meet you.`,
    questions: [
      'What old wound is finally ready to be tended and set down?',
      'What am I ready to understand, or to say, more truly than before?',
      'What is ready to be released — and what is worth keeping?',
      'Where is my faith being renewed, and can I let myself feel hopeful again?',
    ],
    closing: {
      title: 'A Blessing',
      body: `May the wounds you have carried so long and so quietly be tended at last, and grow lighter.

May you come to see in yourself the strength everyone around you has long seen — strength you did not inherit but forged, the hard way, through everything you have survived.

May you let yourself be held as warmly as you have always held others. May you receive as freely as you give. May the old verdict that there was never quite enough, or that you were never quite enough, finally fall silent.

May your faith be renewed from the roots, and your seeker's fire be fed, and the meaning you have reached toward your whole life come close enough to warm you.

May the healer in you finally let herself be healed; may the wise woman who has guided so many be gently guided home.

You have carried a great deal, and carried it well. May this be the season the weight grows lighter — and may you feel, finally, how much light you have given.`,
    },
  },
};

export default jondiPortrait;
