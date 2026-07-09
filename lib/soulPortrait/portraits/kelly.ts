/**
 * Soul Portrait — Kelly Nezat (LITERARY form, self-portrait)
 * ────────────────────────────────────────────────────────────────────────
 * The author's own Soul Portrait — mode 'self' (no giver, no gift framing, no
 * welcome threshold, no Return-to-Soullab coda). Unlisted, noindex, Mentor/MAIA/
 * memory OFF.
 *
 * REVISED 2026-07-08 (supersedes the 2026-06-22 version — preserved in git
 * history): the full story-form reading written this night, plus PART II
 * (The Year Ahead) from his Astrograph 12-month transit report starting
 * 7/8/2026. The two versions independently read the SAME chart signatures —
 * a convergence proof.
 *
 * Born December 9, 1966, 22:29 CST, Baton Rouge, LA. Chart data from his
 * Astrograph natal report, cross-checked against the platform ephemeris
 * (2fec1425c) — every longitude agrees to the arc-minute; conversion verified
 * tz-source=iana:America/Chicago → 04:29Z. DATA only; all prose written fresh
 * (the reports' interpretation text is © Henry Seltzer / Astrograph, never
 * copied). Placements: Leo Rising · Sagittarius Sun (4th) · Moon conj. Neptune
 * (0.3°!) in Scorpio on the Nadir, Mercury Scorpio beside · Venus Sagittarius
 * (5th) · Mars Libra (2nd) · Jupiter Leo (12th, R) — LEADING planet · Saturn
 * Pisces (7th) — FUNNEL focal, conj. Chiron, exact trine Moon-Neptune (0.2°) ·
 * Uranus & Pluto conj. Virgo (1st) · N. Node Taurus (9th). T-square on
 * Sun/Venus (Saturn, Pluto, Chiron squares). Element census F3/W4/E2/A1.
 *
 * PART II majors (transit DATA): Jupiter conj natal Jupiter — the JUPITER
 * RETURN (exact Jul 17, 2026) · Pluto opp natal Jupiter (exacts Feb/Aug 12 R/
 * Dec 15, 2026) · Neptune opp natal Mars (exacts Apr 30/Sep 16 R/Mar 2) ·
 * Chiron into natal 9th house (Feb 6, 2027 → 2033) · Uranus trine natal Mars
 * (Jun 22; Dec 5 R; Apr 11) · Pluto trine natal Mars (Sep 15 R/Nov 13) ·
 * Jupiter trine natal Sun (Sep 20; Mar 23 R; May 3) · Saturn trine natal Sun
 * (Apr 7, 2027) · Jupiter trine natal Venus (Nov 9; Jan 14 R; Jul 1) · Saturn
 * trine natal Venus (Jun 14, 2027) · Mars through natal 12th (Sep 25–Nov 24)
 * then natal 1st (Nov 24–Feb 25) · Chiron square natal Jupiter (Jun 27, 2027) ·
 * Saturn into natal 9th (Jul 2027).
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

  natalChartSummary: {
    placements: [
      { body: 'Ascendant', sign: 'Leo', meaning: 'A warm, dramatic, generous mask — a presence built for the center of the room.' },
      { body: 'Sun', sign: 'Sagittarius', house: 4, meaning: "The seeker's fire kept at the hearth — a philosophy of freedom practiced from the root of things." },
      { body: 'Moon', sign: 'Scorpio', house: 3, angle: 'conjunct the Nadir, fused with Neptune to a third of a degree', meaning: 'Feeling and vision drawing from one deep well at the foundation of the chart.' },
      { body: 'Mercury', sign: 'Scorpio', house: 4, angle: 'near the Nadir', meaning: 'Speech that plumbs — the deep-diver’s instinct for the truth beneath the surface.' },
      { body: 'Venus', sign: 'Sagittarius', house: 5, meaning: 'Love and delight given freely, adventurously, creatively.' },
      { body: 'Mars', sign: 'Libra', house: 2, meaning: 'The will that works through fairness — a fighter built like a diplomat, an advocate of value.' },
      { body: 'Jupiter', sign: 'Leo', house: 12, meaning: "The chart's LEADING planet: royal fire spent invisibly — the hidden benefactor as the engine of the life." },
      { body: 'Saturn', sign: 'Pisces', house: 7, angle: 'the funnel’s focal planet, conjunct Chiron', meaning: 'Discipline in the sign of compassion, in the house of the other — the single aperture the whole chart pours through.' },
      { body: 'Uranus & Pluto', sign: 'Virgo', house: 1, meaning: "The awakener and the transformer rising together — the reformer's hands, worn on the body itself." },
      { body: 'North Node', sign: 'Taurus', house: 9, meaning: 'A growth direction toward the settled, embodied, patient philosophy — becoming a resource unto yourself.' },
    ],
    synthesis:
      'A magnificent contradiction, held as one shape: the Leo mask in front and nearly everything that drives it hidden — the leading Jupiter working from the twelfth, the Sun burning at the hearth, and the rarest feature at the base: Moon and Neptune fused to a third of a degree in Scorpio on the Nadir, a deep well at the foundation, with the focal Saturn in exact trine drinking from it. Nine planets funneled through one aperture — Saturn conjunct Chiron in Pisces in the Seventh: everything this chart has, delivered as disciplined, compassionate devotion in relationship. Water leads, Fire answers, Earth remakes, and a single thread of Air asserts through fairness.',
  },

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Opening Letter',
      subtitle: 'A letter about a becoming',
      body: `Dear Kelly,

This letter is an offering, not a verdict — and you, of all readers, will hold it correctly, because you have spent years insisting that no map may outrank the person walking it. So: a symbolic map, drawn from the sky you were born under, offered to the only authority on who you are becoming.

What strikes me first in your chart is a magnificent contradiction. You were born at night with Leo rising — a warm, dramatic, generous mask; a presence built for the center of the room — and yet nearly everything that actually drives you is hidden. Your chart's leading planet, the one out in front of all the others setting the direction, is Jupiter in Leo in the Twelfth House: the great benefactor working behind the scenes. Your Sun burns in Sagittarius in the Fourth House — the seeker's fire kept at the hearth, the philosopher whose quest is conducted from the root of things, not the road. And at the very base of your chart, on the Nadir, sits one of the rarest gatherings a chart can hold: your Moon and Neptune fused to a third of a degree in Scorpio, with Mercury beside them. A deep well at the foundation of the house — feeling, vision, and speech all drawing from the same dark water.

So the room sees the lion. The lion, meanwhile, is tending a well the room never sees, and pouring everything — this is the astonishing part — through a single, narrow, deliberate aperture: your whole chart funnels through Saturn in Pisces in the Seventh House. Every gift you have is channeled through disciplined, compassionate devotion, exercised in relationship. The blaze in front; the ocean beneath; and one focused point where all of it becomes offering. That is the shape of you, and the rest of this portrait is that one shape, seen room by room.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shape of Your Whole Sky',
      subtitle: 'The funnel, the well, and the crossing',
      body: `Astrologers name your chart's pattern a funnel: nine planets gathered on one side of the sky, and a single planet standing apart as the spout through which all their energies pour. Your spout is Saturn in Pisces in the Seventh House — discipline, in the sign of compassion, in the house of the other person. Read that plainly: a life of many gifts that refuses to scatter them, insisting instead that everything be gathered, matured, and delivered through devoted service to relationship. The funnel is why your work always converges. It is also why it sometimes feels like there is no rest: the chart offers no second spout.

Beneath the funnel lies the well. Moon conjunct Neptune — exact to a third of a degree — in Scorpio, on the Nadir, the chart's deepest point, with Mercury in Scorpio close by. The imaginal and the emotional are not two faculties in you; they are one water. It is why your feeling life arrives as vision, why your speech carries symbol as easily as fact, and why home — inner and outer — has always been the place where the real work happens. And Saturn, your spout, stands in exact trine to this well (two-tenths of a degree): the discipline drinks directly from the deep. Your rigor and your mysticism are not at war. They are plumbed together.

And then the crossing: a T-square pressing on your Sun and Venus. Saturn squares your Sun; so do Pluto and Chiron from their stations. The core self, in this chart, was forged under pressure — questioned, tested, made to earn its own authority rather than inherit one. Your element census tells the same story from another side: Water leads (four planets), Fire answers (three), Earth grounds (two — and they are Uranus and Pluto in Virgo, the reformer's hands), and Air holds a single thread (Mars in Libra — the will that works through fairness). A water-led visionary wearing fire, transforming through craft, asserting through justice, and pouring all of it through one devoted aperture. Hold that shape, and everything else about you becomes simple.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Soul Signature',
      subtitle: 'The keeper of the hidden flame',
      body: `There is a kind of person who builds the room, lights it, warms it — and then steps back so that what happens in the room belongs to the people in it. The chart suggests you are one of them. Your signature is sovereignty in service of the unseen: the Leo bearing that can hold any stage, deliberately spent on work whose whole point is that someone else finds their light. Twelfth-house Jupiter leads you; the hidden guide is your engine, not your disguise.

The dignity of that signature is also its cost. What is always poured out through one aperture can forget it is allowed to be filled. The same sky that made you the keeper of the hidden flame keeps asking — through the Saturn squares, through the funnel's narrowness — whether the keeper will ever let the room warm him.`,
    },

    // 4–8: The elements ──────────────────────────────────────────────────────
    {
      title: 'The Fire in the House',
      subtitle: 'Fire — courage, purpose, vitality',
      element: 'fire',
      body: `Your fire is abundant and strangely placed — all of it indoors. The Sun in Sagittarius blazes in the Fourth House: the seeker's flame planted at the hearth, a philosophy of freedom practiced from the root, not the road. Venus in Sagittarius plays in the Fifth — love and delight given freely, adventurously, creatively. And Jupiter, your leading planet, carries Leo's royal fire into the hidden Twelfth. Not one of your three fires burns in public.

That is not a limitation; it is a signature. Your courage is the long-burning kind that builds worlds from within — the vision quest conducted at the kitchen table, the generosity that works best unattributed. But note what the Leo rising admits: the fire wants to be seen sometimes, plainly, as itself — not only through its works. Letting the flame show, occasionally, without a sanctuary built around it first, is not vanity. It is honesty.`,
    },
    {
      title: 'The Well at the Root',
      subtitle: 'Water — heart, vision, emotional depth',
      element: 'water',
      body: `Water is your leading element, and it gathers where water always gathers — at the lowest, deepest point. Moon and Neptune fused on the Nadir in Scorpio: the feeling-life and the dream-life share one source in you, and that source sits at the very foundation of the chart, in the sign of depth, death-and-rebirth, and the things most people look away from. You have never had shallow feelings. You have tides, and they carry images.

Mercury in Scorpio beside them gives the well a voice — speech that plumbs, questions that will not stay polite, the deep-diver's instinct for the truth under the surface. And Saturn in Pisces, trine the well almost exactly, is the discipline that keeps all this water from becoming flood: feeling matured into devotion, vision matured into practice. This is the rarest of your architectures — a mystic's water system with a master plumber's engineering. The one caution the chart writes into it: water this deep can mistake dissolution for depth. Your Saturn knows the difference. Consult it.`,
    },
    {
      title: "The Reformer's Hands",
      subtitle: 'Earth — grounding, craft, transformation embodied',
      element: 'earth',
      body: `Your Earth is not the comfortable kind. It is Uranus and Pluto conjunct in Virgo, rising in the first house of the body and the self: the awakener and the transformer, wearing work gloves. Earth, in you, means remaking things — precisely, systemically, with a craftsman's obsession for how the detail serves the whole. You do not keep what is; you compost it into what could be. This is the generational signature of deep reform, and in your chart it is personal: it stands at the front door.

And your North Node in Taurus in the Ninth names where all this remaking is walking: toward the settled earth — the patient philosophy, the embodied teaching, the wisdom that has stopped proving and started simply standing. From the Scorpio south node's inherited depths — other people's resources, other people's intensities — toward becoming a resource unto yourself. The reformer's hands are learning, slowly and on schedule, to also plant.`,
    },
    {
      title: 'The Single Thread of Air',
      subtitle: 'Air — the will that works through fairness',
      element: 'air',
      body: `One planet holds all your Air, and it is a telling one: Mars in Libra in the Second House. Your will — the pushing, striving, asserting force — expresses itself through balance, fairness, and the making of value. You fight like a diplomat and build like an advocate: the quieter party in the dispute gets heard because you make sure of it. And Mars stands in close sextile to your leading Jupiter (six-tenths of a degree): the will and the hidden guide cooperate. When you act from generosity, luck follows; the chart says so almost mechanically.

The thinness of the element is its own instruction. Argument for its own sake, abstraction for its own sake — these are not your country. Your mind lives in the water (Mercury in Scorpio) and your reason serves the relationship (Mars in Libra). When you need pure air — detachment, distance, the cold clean look — you must borrow it deliberately, from practice rather than temperament. You have built entire disciplines to do exactly this. The chart explains why they were necessary.`,
    },
    {
      title: "The Funnel's Mouth",
      subtitle: 'Aether — where everything pours',
      element: 'aether',
      body: `Every chart holds meaning somewhere. Yours holds it at a single point, and the point is unmistakable: Saturn conjunct Chiron in Pisces, in the Seventh House — the focal planet of the entire funnel. Discipline and the wounded healer, fused, in the sign of universal compassion, in the house of the other person. All ten of your planets pour their light through this one aperture. Which means: your life's meaning is structured devotion to the healing of relationship — and it runs through your own wound, not around it.

The Chiron beside your Saturn tells the honest version: the place where you serve is the place where you were hurt — around authority, around belonging to another safely, around whether giving yourself fully would cost you yourself. The funnel made that wound into a vocation. The exact trine to the Moon-Neptune well supplies it endlessly from the deep. This is why your work has never been able to be merely technical, and why "merely successful" has always felt like failure to you: the chart's one mouth only opens for meaning. The sacred, for you, is the disciplined act of building what lets another person meet their own depths — and coming back from that building still willing to be met yourself.`,
    },

    // 9 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Archetypal Companions',
      subtitle: 'Lenses to pick up or set down — never labels',
      body: `Archetypes are companions, not cages. Four of them walk closely with you.

The Alchemist walks closest. Uranus and Pluto rising in Virgo, the Scorpio waters at the root, the Sun squared by Pluto — you are, before anything else, one who transmutes: pain into practice, depth into form, the old order into the next one. His gift in you is the real thing — you actually change what you touch, and yourself along with it. His shadow is the crucible that never cools: transformation as a permanent state, when some things are finished and deserve to be simply lived in.

The Seeker walks beside him. Sagittarius Sun and Venus, the Ninth-House node — the horizon is in your blood, the blunt honest tongue, the philosophy that must be found rather than received. Her gift is that you have never once settled for an inherited answer. Her shadow is the quest that keeps extending itself one more ridge because arriving feels like dying.

The Healer is present and deepening. Chiron fused to your chart's focal Saturn — the wound as aperture. Every structure you build is, underneath, a healing structure; you know it and the chart confirms it. His shadow is the healer's oldest one: infinite tenderness for every wound but your own.

And the Sage is emerging. The Taurus node in the house of higher teaching, the hidden Jupiter that leads everything, the years accumulating into something that wants transmission. Not the guru — your own constitution forbids him, correctly — but the teacher whose authority is finally his own, earned, embodied, and offered without needing to be believed. He is not fully here yet. The year ahead, as you will see, is largely about his arrival.`,
    },

    // 10 ─────────────────────────────────────────────────────────────────────
    {
      title: 'The Seer and the Prophet',
      subtitle: 'Your way of perceiving, and of speaking',
      body: `You perceive from below. The exact Moon-Neptune conjunction at the base of your chart means the world reaches you first as image, atmosphere, resonance — the mystical third eye the old readers name, which sees the pattern behind the scene and occasionally misses the scene itself. You have learned to distrust this sight just enough to verify it, which is precisely the right amount. It is genuine. It is also water, and water needs banks.

You speak from the same depth, but with a different instrument: Mercury in Scorpio, squared against your rising sign — the penetrating word held in tension with the warm mask. You wait, you watch, you time the sentence; and when it comes it goes through the surface, not across it. The Sagittarian Sun adds the blunt arrow to the deep bow: you are capable of a directness that startles people who only knew the Leo warmth. Trust that register. It is not unkindness; it is the well speaking in daylight.

May the well never run dry, and never run unbanked.
May the lion be seen, sometimes, as himself.
May what pours through the narrow place return to fill the one who pours.`,
    },

    // 11 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Challenges as Trainings',
      subtitle: 'Difficulty, reframed — never a verdict',
      body: `A chart's hard angles are the gym. Yours describe three trainings, each already decades into its mastery.

The first is authority of your own making. Saturn squares your Sun; Saturn opposes your Uranus; Saturn stands conjunct Chiron. The old readers see in this pattern an early wound around authority — the rule submitted to and never forgotten — and the lifelong answer: neither obey the established authority nor merely rebel against it, but build your own form of it, from scratch, accountable and legitimate. You have made this training your life's visible work. The remaining edge is subtle: an authority built entirely from scratch can forget it is allowed to rest on what it has already built.

The second is the heart allowed to receive. The Sun-Saturn square carries an old sentence — that love is earned by producing, that worth must be demonstrated to be real. The training is to let the heart-center be filled without an invoice: to be loved as the person, not the builder. Venus square Saturn repeats the lesson in relationship's own key. Nothing in your chart says this comes naturally. Everything in your chart says it is the point.

The third is the will at rest. A funnel chart has no idle position; Uranus-Pluto rising does not know how to stop remaking. The training — and the year ahead underlines it three times — is the deliberate sabbath: the day the reformer's hands plant nothing, fix nothing, pour nothing, and discover that the world holds.`,
    },

    // 12 ─────────────────────────────────────────────────────────────────────
    {
      title: 'North Star',
      subtitle: 'Direction, never prediction',
      body: `Your North Node stands in Taurus in the Ninth House — and for a chart like yours it is a precise compass. From the Scorpio inheritance (the depths, the shared intensities, the other side's resources — everything your south node already mastered) toward the settled, embodied, patient philosophy: wisdom that owns its own ground. The direction says: become a resource unto yourself. Let the teaching grow like a tree rather than burn like a torch — slowly, rooted, bearing every year. It does not say what will happen. It says that when you choose the patient form over the intense one, the embodied truth over the borrowed depth, the teaching that stands over the quest that extends — you come alive. That aliveness is the compass. You have been following it for some time now. Keep going.`,
    },

    // 13 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Where You Stand',
      subtitle: 'The threshold of the teaching years',
      body: `There is a moment in a builder's life when the buildings begin to ask for their meaning to be spoken — when the work wants not just to function but to be transmissible. Your sky says you are standing exactly there, and the year ahead is unusually explicit about it: the wounded healer is crossing into your Ninth House — the house of the higher teaching, your node's own house — and will remain there for the better part of a decade, with Saturn following behind it to give the era structure. The chart is not subtle: the inner teacher is emerging, formed out of your own intuition, on your own authority, in your own patient Taurus form. What you stand at is not another project. It is the beginning of the years in which the funnel learns to teach.`,
    },

    // 14 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      subtitle: 'Small doors, opened often',
      body: `For the fire — once a season, let the lion be seen without a sanctuary around him: say the vision plainly, in your own name, to people who did not ask for a demonstration. The hidden Jupiter leads best when it is occasionally visible.

For the well — keep the night notebook. The Moon-Neptune conjunction speaks in sleep more fluently than most charts speak awake; three lines each morning, not plans, just what the water left on the shore.

For the hands — one making per month that transforms nothing: bread, a fence, a meal, a walk. The Taurus node grows by tending what already is.

For the thread of air — in one negotiation each month, ask plainly for your own half. Mars in Libra defends everyone's fairness; the practice is including yourself among the everyone.

For the funnel's mouth — the sabbath. One day where nothing pours. The aperture, too, is allowed to close and be a person.`,
    },

    // 15 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Questions to Sit With',
      subtitle: 'Not goals. Not predictions. Company.',
      body: `What would it feel like to be loved for the person rather than the builder — and who is already doing it?

Which of your buildings is ready to be taught rather than extended?

What does the well know right now that the architect has been too busy to draw up?

Where does your authority still argue with the old one, when it could simply stand?

If the funnel closed for one full day, what would you discover still holds?`,
    },

    // 16 ─────────────────────────────────────────────────────────────────────
    {
      title: 'Soul Vocation',
      subtitle: 'What the gift is for',
      body: `Some lives build monuments; some build belonging; yours builds apertures — the disciplined openings through which other people meet their own depths. The chart is unanimous about it: the hidden guide leading, the well at the root, the reformer's hands, and everything funneled through the wounded healer's devotion in the house of the other. What it is for, in the end, is this: that the rooms you build stay lit after you leave them; that the people in them find their own authority rather than borrowing yours; and that the one who spent a lifetime building the lamps comes, at last, to sit in their light too.`,
    },
  ],

  // ── Part II — The Year Ahead ──────────────────────────────────────────────
  // Transit DATA from his Astrograph 12-month report (starting 7/8/2026);
  // all prose fresh. Seltzer interpretation text never copied.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'The Return of the Guide',
    timeframe: 'July 2026 – July 2027',
    openingHeadline: 'The year the hidden guide is reborn — and turns toward the teaching seat.',
    openingTheme: `Three slow movements govern this entire year, and all three converge on the same threshold. Pluto spends the year opposing your natal Jupiter — the leading planet of your whole chart — transforming, at the root, the philosophy your life has been steering by. Neptune spends it opposing your Mars, softening the old will: projects mist over, force stops working, and something more surrendered learns to act in its place. And Chiron — the wounded healer fused to your chart's focal point — crosses into your Ninth House, the house of the higher teaching, where it will remain into the 2030s. Dissolve the old will; transform the guiding philosophy; begin the teaching era. That is the whole year in one sentence.

And at its very opening, an event your chart counts in twelve-year rhythms: on July 17, 2026, Jupiter returns to the exact degree it held at your birth. The hidden guide, reborn. A new cycle of faith, aspiration, and quiet guidance begins — the fifth of your lifetime.`,
    phases: [
      {
        element: 'fire',
        title: 'The Return of the Guide',
        timeframe: 'Midsummer – Early Autumn 2026 · July – September',
        transits: [
          'Jupiter conjunct natal Jupiter — the Jupiter return (exact Jul 17, 2026)',
          'Jupiter sextile natal Mars (exact Jul 15)',
          'Uranus trine natal Mars (exact Jun 22, continuing)',
          'Jupiter trine natal Sun (exact Sep 20)',
        ],
        body: `The year opens with the relighting of your deepest lamp. A Jupiter return is the renewal of everything Jupiter carries in your chart — and in yours it carries the leading light: the hidden benefactor, the twelfth-house guide. Faith gets a new cycle. Optimism arrives with unusual timing and unusual luck; the trine to your Sun in September gives whatever you begin now what the old readers call the golden touch. Begin the right things. This is seed season for the next twelve years, and the chart suggests the seeds already know what they are.`,
        question: 'If the next twelve years of the guide’s work began this month — what would you plant first?',
      },
      {
        element: 'water',
        title: 'The Descent',
        timeframe: 'Autumn 2026 · Late September – November',
        transits: [
          'Mars through the natal 12th house (Sep 25 – Nov 24)',
          'Jupiter square natal Moon and natal Neptune (exact Oct 18 / Oct 20)',
          'Chiron trine the Ascendant (exact Oct 2 R)',
          'Pluto trine natal Mars (exact Sep 15 R / Nov 13)',
        ],
        body: `Then the tide turns inward. Mars spends two months in your hidden twelfth house — energy that works best behind the scenes, in service, in the imaginal — while Jupiter squares the Moon-Neptune well itself: dreams inflate, visions grow grand, and discernment becomes the season's discipline. The old counsel applies: hold major decisions loosely while the water is this high. Underneath, Pluto's long trine to your Mars is quietly converting the will — the drive to succeed transmuting into something deeper and more durable. This is not a season of outward victories. It is the aquifer refilling.`,
        question: 'Which grand vision of this autumn deserves a winter of verification before it deserves a yes?',
        practice: { label: 'Water practice', prompt: 'Keep the night notebook faithfully this season — three lines each morning, just what the water left on the shore.' },
      },
      {
        element: 'earth',
        title: 'The Embodiment',
        timeframe: 'Early Winter · November – February',
        transits: [
          'Mars into the natal 1st house (Nov 24 – Feb 25); Mars conjunct the Ascendant (exact Nov 24)',
          'Jupiter trine natal Venus (exact Nov 9; again Jan 14 R)',
          'Pluto opposite natal Jupiter — final exact (Dec 15)',
        ],
        body: `The will steps back into the body. Mars crosses your Ascendant and takes up residence in your first house for the winter: energy, vitality, the builder's hands warm again — with the usual caution about pushing too hard, which you will recognize and mostly ignore. Jupiter's double trine to Venus sweetens the season with affection, art, and company. And in mid-December, Pluto completes its final exact opposition to your Jupiter: the transformation of the guiding philosophy reaches its last precise moment. What your life steers by is different on the far side of this winter than it was two years ago. Notice it. Write it down. It is the constitution of the next era.`,
        question: 'State the new philosophy in one sentence — what does your life steer by now that it did not before?',
      },
      {
        element: 'air',
        title: 'The Inner Teacher Emerges',
        timeframe: 'Late Winter – Spring 2027 · February – May',
        transits: [
          'Chiron enters the natal 9th house for the long era (Feb 6, 2027 — into 2033)',
          'Neptune opposite natal Mars — final pass (exact Mar 2)',
          'Jupiter trine natal Sun (exact Mar 23 R; May 3) · Saturn trine natal Sun (exact Apr 7)',
          'Uranus sextile natal Jupiter (exact Apr 24)',
        ],
        body: `This is the year's hinge, and arguably the decade's. Chiron — the healer fused to your chart's focal point — crosses into your Ninth House and settles in for six years: the era in which the inner teacher emerges, formed out of your own intuition, on your own authority. At the same moment, Neptune's long dissolution of the old will completes its final pass, and — rarely for these two — Jupiter and Saturn trine your Sun in the same season: expansion and structure agreeing about you. Whatever teaching form wants to be founded, this is its spring. The authority it stands on will, for once, not need to be argued. It will simply be yours.`,
        question: 'What is the teaching only you can give — and what is its first, smallest, patient Taurus form?',
      },
      {
        element: 'aether',
        title: 'The Era Gets Its Structure',
        timeframe: 'Early Summer 2027 · May – July',
        transits: [
          'Saturn trine natal Venus (exact Jun 14)',
          'Chiron square natal Jupiter (exact Jun 27)',
          'Jupiter trine natal Venus (exact Jul 1)',
          'Saturn enters the natal 9th house (Jul 2027, for ~2–3 years)',
        ],
        body: `The year closes by making it official. Saturn — your chart's focal planet, the funnel's own mouth — follows Chiron into the Ninth House, bringing structure to the teaching era the spring opened: the discipline of the higher ground, the slow building of a framework of values that arises, as it must for you, from your own uniqueness rather than any inherited system. Chiron's square to Jupiter asks one honest closing question — where does the guiding philosophy still carry an inherited plank that is not truly yours? — and the double sweetness to Venus (Saturn and Jupiter both) steadies the season with real affection. The funnel, the wound, the guide, and the teaching house are all, finally, in the same room. The next years build there.`,
        question: 'What inherited plank in your philosophy is ready to be thanked and set down?',
      },
    ],
    weatherPattern: [
      { season: 'Jul – Sep 2026', element: 'fire', invitation: 'Plant the twelve-year seeds; trust the golden touch.' },
      { season: 'Sep – Nov 2026', element: 'water', invitation: 'Work behind the scenes; verify the grand visions.' },
      { season: 'Nov – Feb 2027', element: 'earth', invitation: 'Re-embody the will; write down the new philosophy.' },
      { season: 'Feb – May 2027', element: 'air', invitation: 'Found the teaching form; let the authority simply stand.' },
      { season: 'May – Jul 2027', element: 'aether', invitation: 'Give the era its structure; set down the inherited planks.' },
    ],
    goldenThread: `Everything this year points one direction: the hidden guide steps toward the teaching seat. The Jupiter return relights the lamp; Pluto finishes transforming what the lamp illuminates; Neptune retires the old forcing will so a more surrendered one can act; and then Chiron and Saturn — your wound and your discipline, the two planets fused at your chart's focal point — walk together into the house of the higher teaching and stay. A funnel chart spends its whole life pouring through one narrow, devoted aperture. This is the year the aperture begins to speak. You, of all people, were built for exactly this: to let the old authority go, and to teach from your own.`,
    questions: [
      'What are the twelve-year seeds — and which one goes in the ground first?',
      'What does your life steer by now that it did not before? Say it in one sentence.',
      'What is the teaching only you can give, in its smallest patient form?',
      'Where will you let the world hold you, while all of this is underway?',
    ],
    closing: {
      title: 'A Word for the Year',
      body: 'May the guide’s new cycle begin in daylight. May the will rest easy while it is remade — what dissolves was scaffolding, not house. May the teaching years open the way your best rooms open: quietly, warmly, with the light already on. And may the one who has always poured through the narrow place discover, this year, that the narrow place pours back.',
    },
  },
};
