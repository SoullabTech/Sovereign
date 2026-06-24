/**
 * Soul Portrait — Heather Hampton (LITERARY form)
 * ────────────────────────────────────────────────────────────────────────
 * Soullab's new marketing director. A gift portrait offered by Kelly, written as
 * a flowing Spiralogic Soul Portrait — soul-and-symbol language, not a structured
 * astrology report. Hand-delivered, unlisted, noindex. Mentor/MAIA/memory OFF.
 *
 * Born August 8, 1969, 2:43 PM CDT, New Orleans, LA (29N57, 90W04). Chart from her
 * Astrograph natal report — DATA only; all prose written fresh (the report's
 * interpretations are copyright Astrograph, never copied):
 *   Leo Sun (9th) · Sagittarius Rising · Moon in Gemini (7th) · Mercury in Virgo
 *   (9th) · Venus in Cancer (8th) · Mars in Sagittarius (1st, conj. Asc) · Jupiter
 *   in Libra (10th, RULER of the rising sign, conj. Uranus) · Saturn in Taurus
 *   (6th — FUNNEL focal planet / the handle) · Uranus in Libra (10th) · Neptune in
 *   Scorpio (12th, conj. Ascendant) · Pluto in Virgo (10th) · Chiron in Aries (4th)
 *   · North Node Pisces (4th) / South Node Virgo (10th). Midheaven in Virgo.
 *
 * Note: the original birth-data message had the year as 1963; the authoritative
 * Astrograph report (and CDT confirmation) corrected it to 1969 — this portrait is
 * built on the 1969 chart.
 *
 * Signatures: a FUNNEL (bucket) through Saturn in Taurus in the 6th — energies
 * channel through diligent, grounded craft. A 10TH-HOUSE gathering of her chart
 * ruler Jupiter + Uranus + Pluto — a powerful, original, public/career role as the
 * chart's organizing center. Sun + Mercury in the 9th (the broadcaster of meaning).
 * Mars + Neptune on the Ascendant (bold and visionary presence). A Fire Grand Trine
 * (Sun–Mars–Chiron, natural creative flow), plus T-squares (focal Moon, focal Venus)
 * and a Yod (focal Mars) — real depth and tension beneath the shine.
 *
 * PART II (The Year Ahead) is grounded in her 12-month transit report (Astrograph,
 * starting 6/23/2026) — transit DATA only; prose fresh. A profound reinvention year:
 * Uranus on the Ascendant + into the 7th, Pluto transforming Jupiter/career and
 * (entering) communication, Neptune dissolving and spiritualizing, all carried by a
 * bright Jupiter-conjunct-Sun expansion. The chrysalis → new wings.
 *
 * The giver's note + threshold below are a respectful DRAFT. Kelly's own words to
 * Heather are his to write — the words in the gift remain his. "A Blessing" is a
 * guide-voice blessing, calibrated to a valued new teammate.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const heatherPortrait: LiterarySoulPortrait = {
  person: {
    name: 'Heather Hampton',
    slug: 'heather',
    pronouns: 'she/her',
    isMinor: false,
  },

  mode: 'gift',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF.

  offeredBy: {
    relationship: 'her colleague',
    giverName: 'Kelly',
    // DRAFT — Kelly to replace with his own words. The words in the gift remain his.
    giftOpening: `Welcome — and thank you for bringing your gifts to what we're building at Soullab.

This is a small gift and a way of saying we see you: a reflection of the person we're lucky to be working alongside, drawn from the sky you were born under and held up so you might see yourself the way we already do.

The stars reveal the weather; your soul chooses how to walk through it. Read this as a mirror offered in welcome, and keep what your own heart already knows is true.

— Kelly`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Heather',
      attribution: 'Offered in welcome by Kelly',
      framing:
        'A reflection on who you are, and who you are still becoming — written in the language of soul and symbol. The stars reveal the weather; your soul chooses how to walk through it.',
    },
  },

  birthData: {
    date: 'August 8, 1969',
    time: '2:43 PM CDT',
    place: 'New Orleans, Louisiana',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes.',
  },

  framing: DEFAULT_FRAMING,

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Essential Nature',
      body: `To know you, a person has to hold three things at once.

On the surface, you meet the world as a Sagittarian — warm, honest, forthright, an optimist with a wide view. One always knows where one stands with you. You love the big picture, the meaning behind the thing, the adventure of an idea; you are easy to be around because you are genuinely open, and your enthusiasm is the kind that catches.

But look at where your chart concentrates its power, and you find something else: a born public presence. The top of your chart — the house of vocation and the public eye — holds three planets at once, and one of them is the very planet that rules your whole chart. This is the signature of someone whose identity is meant to express out in the world: not behind the scenes, but in front of the room. And the company those planets keep — the planet of original genius beside the planet of real power — means that public role is meant to be inventive, magnetic, and genuinely influential. You are built to lead, and to change how things are seen.

And underneath both — the open surface and the public power — runs a quiet engine of work. Nearly all of your energy funnels through a single disciplined point: a grounded, patient, reliable capacity to actually do the thing, carefully, until it's done. So beneath the charisma is a craftsperson.

So your essential nature is this: a warm, visionary, public-facing leader who is also willing to do the patient work underneath the shine. Someone built to shape how the world sees — and steady enough to make it real.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Gift You Carry',
      element: 'fire',
      body: `Every soul carries a particular gift — not a skill exactly, but a way of being the world is quietly better for. Yours is this: you shape how people see.

Your chart is built for it from several directions at once. A Leo Sun in the house of broadcasting and meaning gives you natural warmth, creative flair, and the instinct to stand where the light is and make others want to look. Your Mercury in Virgo gives the craft underneath the flair — precise, articulate, exacting about the word and the detail. And your Gemini Moon makes you quick, versatile, and genuinely social: you read a room, you speak its language, you connect. Threaded through it is a Fire Grand Trine — a pattern of natural, almost effortless creative flow.

Put those together and you don't just communicate. You make people see and feel — you take an idea or a vision and give it shape, color, and pull, until a whole room (or a whole audience) believes it. That is a rarer gift than it sounds, and a harder one: most people can have the vision or the craft or the charisma. You carry all three, and the discipline to land them.

Name it as your own. The world will be quick to call it "good with people" or "a way with words," as if it were a knack. It isn't a knack. It's the real art of meaning made magnetic — and there is a truer name for it than "marketer," even if no one has said it to you plainly: you are a messenger-builder, someone whose gift is helping meaning find its audience. You take a vision and help it reach the people who need it — in language, in image, in beauty. That's yours, and it's considerable.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Way You Love',
      body: `For all your public warmth, the way you love is private, deep, and more tender than most people get to see.

Your Venus is in Cancer — the most caring, devoted, security-seeking placement of the heart — and it sits in the house of true intimacy. This gives you a love that is loyal and nurturing and protective; once someone is yours, you hold them close, you tend them, you make a home around them. You don't relate at the surface. You go to the deep, personal level even with people you've only just met, and you give a great deal.

But your Gemini Moon needs something the Cancer Venus doesn't always remember to ask for: mental spark, conversation, room to move. You need to be met in the mind as much as held in the heart — and you can feel restless or unseen when a closeness goes quiet or small. There's a part of you, too, that needs more freedom and originality in relationship than the caretaking part wants to admit.

And the chart marks an old, tender place here — a knot where love and self-worth got tangled early, so that intimacy can feel both deeply wanted and a little fraught, as though being fully received were never quite safe. That tenderness isn't a flaw; it's the underside of how deeply you care. The lifelong invitation written here is gentle: to find your own center inside love — to be held without losing yourself, and to let yourself be received as completely as you receive others. You are not only the one who tends. You are someone worth tending, too.`,
    },

    // 4 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Deep Waters',
      element: 'water',
      body: `Beneath the bright, capable public presence runs a current most people never see — and it is the real source of your depth.

Neptune sits right on your Ascendant — on the very edge of how you meet the world — which means that just behind the confident, sunny surface is someone extraordinarily sensitive: imaginative, compassionate, porous to the moods and feelings of a room, even quietly psychic. You pick up what isn't said. You are moved by beauty, by music, by film, by the unseen and the not-quite-explainable. There has always been more to the world, for you, than its surface — and a part of you lives in that more.

With Neptune in Scorpio and your Venus in the Eighth House, those waters run intense as well as gentle: you feel things at a depth others only visit, you sense the hidden currents in people, and you are drawn — whether you advertise it or not — to the real, the deep, the transformative. The shallow version of anything bores you.

This is the part of you that makes the gift more than technique. Anyone can learn to communicate; your communication moves people because it comes from someone who genuinely feels, genuinely sees, genuinely cares about what's underneath. The one caution, offered with love, is the other side of the same depth: a sensitivity this open needs protecting — time apart, quiet, a way to come back to yourself — or the world's feelings can flood the channel. Tend the waters, and they remain your deepest source.`,
    },

    // 5 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Work Your Soul Came to Do',
      element: 'aether',
      body: `Some people are here to work quietly. You are here for a public role — and your chart is unusually clear about it.

The whole top of your chart, the house of vocation, is lit up: your chart ruler Jupiter (expansive, optimistic, a natural leader) sits there beside Uranus (original, inventive, ahead of the curve) and Pluto (real power, the capacity to transform). This is the signature of someone whose work is meant to be out front, to lead and to change how things are done — and to carry genuine influence in doing it. You came to shape the public square, not to stand at the edge of it.

But here is the deeper turn, and it's the soul's actual assignment. Your North Node sits in Pisces, in the house of home and inner roots — while your South Node, the well-worn groove of the past, sits in the house of work and worldly achievement. The reading is striking: you have already mastered the world of accomplishment; you know how to climb, how to perform, how to get to the top. This life is not about proving that again. It's about not losing yourself in it — about bringing soul, feeling, and inner roots into the public work, and tending your own depths as faithfully as you tend your achievements.

So the work your soul came to do is twofold: to lead and shape in the world, and to do it without abandoning your own center. To be powerful in public and rooted in private. When you manage both — the influence and the inner life — your work stops being only successful and becomes something rarer: meaningful, and truly yours.`,
    },

    // 6 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shadow That Protects the Gift',
      body: `Every real gift has a shadow standing guard at its door — not a flaw, but an old protector that once kept something tender safe, and can overstay its usefulness if you don't know it's there.

For you, that shadow wears a few faces the chart names plainly. There is the inner critic that never quite rests — the one that worries the detail, measures the work, and finds the gap; your Saturn sits in the house of daily work and craft, and it can drive you to perfectionism and a low hum of anxiety that nothing is ever quite enough. There is an old ache around worth and security — a deep-rooted sense that the ground beneath you might not hold, that you have to earn and re-earn your place. There is a tender wound around home and your own center (your chart marks early difficulty in feeling fully safe, fully settled in yourself), which can leave you more easily swayed by others' opinions than someone so capable should ever need to be. And there is a hunger for recognition that traces back to not feeling quite seen or held enough, early on.

Here is the reframe that matters: none of these is simply a problem. Each protects the gift. The relentless inner standard is the underside of your real craft. The worry about enough is what made you so capable and so hard-working. The sensitivity to others is the very thing that lets you read a room and move it. And the hunger to be seen is inseparable from your gift for helping others feel seen.

The work now is not to fight these old guardians but to thank them and let them ease their grip — to let your worth rest in who you are rather than in what you produce or how the room receives you. You are enough, and you have been for a long time. The gift was never in danger.`,
    },

    // 7 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Dance of Your Elements',
      body: `The elements are not boxes to sort you into. They live in you as a moving ecology — forces in conversation, each teaching and tempering the others. And yours make an unusually balanced dance, which is itself a gift: you have real access to all four.

Fire leads the show. From your Leo Sun, your Sagittarius rising, and a Fire Grand Trine come your warmth, your courage, your creative flair, and the contagious enthusiasm that makes people want to follow. It is the flame at the front of the room.

Earth grounds it. From Saturn in steady Taurus, Mercury in exacting Virgo, and Pluto's discipline comes your craft and your follow-through — the patient capacity to turn the bright idea into a finished, lasting thing. Earth is why the fire builds something instead of just blazing.

Air connects it. Your Gemini Moon and your Libra planets keep you quick, social, and relational — reading the room, speaking its language, weaving people and ideas together. Air is how the fire reaches others.

And Water deepens it. Neptune on your Ascendant and Venus in the deep house give you the sensitivity, the imagination, and the genuine feeling that make all the rest matter rather than merely impress.

Held together, this is the dance: a leading fire that warms and inspires, grounded by a patient earth, connected by a quick and social air, and fed from below by deep and feeling water. Not a type to be sorted into — a rare, whole, working balance. Which is only another way of saying: a soul, alive, and remarkably complete.`,
    },

    // Practices ───────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      body: `Practices are how a portrait becomes a life. None of these is a task to perfect — each is a small, embodied way of tending the dance. Take up whichever one is alive for you, and let the rest wait.

Fire — Let It Be Seen. Once in a while, put something of yours forward before it's perfect — a draft, an idea, a true opinion. Your gift wants the light; don't let the inner critic keep it in the drawer.

Earth — Enough for Today. At the end of a working day, name one thing you finished and let that be enough. Your craft is real; it does not require you to earn your worth again every morning.

Air — Be Met in the Mind. Once a week, seek out a real conversation — someone who sparks you, stretches you, surprises you. Your Gemini heart is fed by being met, not just by being needed.

Water — Come Back to Yourself. Build in regular quiet — time apart, alone, unproductive. A sensitivity as open as yours needs to drain the room's feelings and refill its own well. This isn't indulgence; it's maintenance for the source.

Aether — Root as You Rise. When the public side of life gets loud, deliberately tend the private one — home, stillness, the people and places that are yours. Your soul's growth is to stay rooted while you rise. Practice keeping one foot in the deep ground while the other walks out into the room.`,
    },

  ],

  // ── Part II — The Year Ahead (the Season + the Living Spiral) ──────────────
  // Grounded in her 12-month transit report (Astrograph, starting 6/23/2026) —
  // transit DATA only; all prose written fresh. Each phase reads a real transit
  // as an elemental movement and an invitation (the Living Spiral), with the
  // transit named quietly as a footnote. The Blessing closes the whole portrait.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'A Season of Becoming New',
    timeframe: 'June 2026 – June 2027',
    openingHeadline:
      'This is a chrysalis year — an old version of your life loosening so a freer, larger one can emerge, carried by a real season of expansion and good fortune.',
    openingTheme: `Your birth chart is the landscape you carry through a whole life. The transits are the weather moving across it — and this year's weather is the kind that remakes you. Several of the slow, deep planets are touching the most essential parts of who you are at once: your sense of self, your direction, your relationships, the very way you think and speak. Things that have felt fixed begin to move.

This is not a small season, and it would be untrue to call it entirely smooth — real reinvention rarely is. But it arrives with an unusual gift folded inside it: at the same time the old structures loosen, the most fortunate planet in the sky comes home to bless your core, opening doors and lifting your spirits right when you most need the lift. So this is less an unraveling than a molting — the shedding of an old skin so a braver form can come through, well-timed to a new chapter. What follows is the weather of your year and the invitations inside it. None of it is fixed, and none of it is fate. Your soul chooses how to walk through all of it.`,
    phases: [
      {
        element: 'fire',
        title: 'The Self Expanded',
        timeframe: 'Late summer 2026, returning spring 2027',
        transits: ['Jupiter conjunct your Sun', 'Jupiter entering your Ninth House', 'Uranus in trine with your Jupiter'],
        body: `First, and brightest: your ruling planet comes home to you. Jupiter — warmth, optimism, expansion, good fortune, the very planet that rules your whole chart — crosses your Sun and moves into your house of vision and meaning. This happens at a real high point of the twelve-year cycle, and it is the gift of the year: renewed confidence, a "golden touch" on what you begin, new horizons opening, and a genuine lift to your spirits and your faith in what's possible.

This is the part of the year to say yes. New projects begun now tend to flourish; a significant journey — outer or inner — may call. After or beneath all the year's deeper changes, this is the sun breaking through. Let yourself feel optimistic. Let yourself begin. The expansion is real, and it's timed, beautifully, to a new chapter.`,
        question: 'What new chapter am I being invited to begin — and can I say a full yes to it?',
      },
      {
        element: 'air',
        title: 'The Mind Set Free',
        timeframe: 'Summer 2026, deepening into 2027',
        transits: ['Uranus in square with your Mercury', 'Pluto entering your Third House'],
        body: `Your mind itself — your gift — is being shaken loose and remade. Uranus, the awakener, strikes your Mercury: flashes of insight, sudden new ideas, old assumptions cracking open. It can feel scattered, even unsettling, as thoughts arrive faster than you can finish them — but it is genius energy, breaking you out of worn grooves. And as the year turns, Pluto begins a long passage into your house of communication, deepening and empowering your voice for years to come.

For someone whose gift is communication, this is significant: the way you think, write, and speak is being reinvented and made more powerful. The invitation is to catch the new insights without needing to organize them all at once — keep a place to put them — and to trust that your voice is growing into something deeper and more original than it has been.`,
        question: 'What new way of thinking and speaking is trying to break through in me?',
      },
      {
        element: 'earth',
        title: 'The Structure Remade',
        timeframe: 'From mid-2026, intensifying into spring 2027',
        transits: ['Saturn entering your Fifth House', 'Pluto in square with your Saturn', 'Saturn conjunct your Chiron'],
        body: `Underneath the expansion, the deep architecture of your life is being rebuilt. Saturn moves into your house of self-expression and creativity, asking you to get serious — and real — about how you create and how you love yourself in the process. And Pluto presses on your natal Saturn, the very point all your energy funnels through, calling for a far-reaching change in the basic structure of your life: old patterns surrendered so a truer foundation can be laid.

This is the least comfortable thread of the year, and the most important. It asks you to let go of some long-standing scaffolding — ways of working, of proving, of holding it together — that have outlived their purpose. What you build now, slowly and deliberately, will last. The invitation is patience: don't rush the rebuild, and don't cling to the old frame past its time. The structure is being remade for you, not against you.`,
        question: 'What old structure of my life is ready to be released so a truer one can be built?',
      },
      {
        element: 'water',
        title: 'The Old Wounds Dissolving',
        timeframe: 'Through 2026 into 2027',
        transits: ['Neptune conjunct your Chiron', 'Chiron in sextile with your Moon', 'Pluto in sextile with your Chiron'],
        body: `And the tender, old places — the ones around home, security, and worth that this portrait named gently — are being touched for healing. Neptune, the great dissolver, moves over your wound-point and softens it; your feeling heart goes through a quiet renewal at the roots; and the deep, slow work of transformation reaches the parts of you that have ached the longest.

This can stir grief or old feeling before it brings peace — Neptune doesn't fix, it dissolves, and that can feel like fog before it feels like mercy. But something at the very base of you is being allowed, at last, to heal and to soften. The invitation is to let it: to go gently, to let yourself be helped, to make peace with the old story rather than carry it one more year. Compassion — for others, and finally for yourself — is the gift on the far side.`,
        question: 'What old wound, near the roots of me, is finally ready to soften and heal?',
      },
      {
        element: 'aether',
        title: 'The Whole Self Reborn',
        timeframe: 'All year (Uranus on the Ascendant)',
        transits: ['Uranus opposite your Ascendant', 'Pluto in sextile with your Ascendant', 'Neptune in trine with your Ascendant'],
        body: `And running through everything is the deepest current of the year: your very identity — the self you show the world — is in flux and rebirth. Uranus stands opposite your Ascendant all year, electrifying your relationships and your sense of who you are; Pluto and Neptune touch the same point, transforming and spiritualizing it. Your whole approach to partnership is changing, and so is your answer to the question who am I now?

This is the molting itself. An old self-image is loosening; a freer, braver, more whole one is coming through. It can feel like flux, even like losing your footing — but chaos always precedes new life. The invitation is to stop gripping the old form, to let the changes (in your relationships, in your self-presentation, in your sense of yourself) carry you toward the new maturity they're reaching for. You may come out of this year changed — and more fully, freely yourself than before you went in.`,
        question: 'Who am I becoming — and can I let the old self go gently enough to find out?',
      },
    ],
    weatherPattern: [
      { season: 'Late summer 2026, spring 2027', element: 'fire', invitation: 'Say yes to the expansion and the new chapter' },
      { season: 'Summer 2026 onward', element: 'air', invitation: 'Let your mind and voice be reinvented' },
      { season: 'Mid-2026 into spring 2027', element: 'earth', invitation: 'Release the old structure; rebuild slowly and true' },
      { season: 'Through 2026–27', element: 'water', invitation: 'Let the old wounds soften and heal' },
      { season: 'All year', element: 'aether', invitation: 'Let the old self go; let the new one come through' },
    ],
    goldenThread: `Almost everything this year points the same way: you are becoming new. The deep structures loosen and rebuild, your mind and voice are reinvented, the oldest wounds soften toward healing, and your very identity molts toward a freer, braver self — all of it carried by a bright Jupiter expansion that blesses your core and opens the next chapter right on time. It is a remaking year, and not a uniformly easy one. But you, of all people, are built to shape and to begin — and this time the thing being shaped, and begun, is you. This is the chrysalis. What comes out the far side has new wings.`,
    questions: [
      'What new chapter am I being invited to begin?',
      'What new way of thinking and speaking is breaking through?',
      'What old structure is ready to be released so a truer one can be built?',
      'Who am I becoming — and can I let the old self go to find out?',
    ],
    closing: {
      title: 'A Blessing',
      body: `May you trust the molting — the loosening of the old form — knowing that what is real in you cannot be lost, only freed.

May you say a full yes to the expansion this year offers, and let yourself begin again with all the optimism your heart was made for.

May the old aches near your roots — about worth, about home, about being enough — soften at last, and may you come to rest your worth in who you are rather than in what you build or how the room receives you.

May you lead and shine in the world without ever losing your own center — rooted as you rise.

You arrive among us already whole, already gifted, already enough. May this be the season you come to know it — and may you feel, as the new self comes through, how much light you carry into every room you enter.`,
    },
  },
};

export default heatherPortrait;
