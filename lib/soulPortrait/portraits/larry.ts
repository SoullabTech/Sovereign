/**
 * Soul Portrait — Larry Closs (LITERARY form)
 * ────────────────────────────────────────────────────────────────────────
 * A gift portrait offered by Kelly, written as a flowing Spiralogic Soul
 * Portrait — soul-and-symbol language, not a structured astrology report.
 * Hand-delivered, unlisted, noindex. Mentor/MAIA/memory OFF.
 *
 * Born October 28, 1969, 06:30 AM EST, Easton, Pennsylvania (40N41, 75W13).
 * Chart computed in-house (astronomy-engine) and CROSS-CHECKED against his
 * Astrograph transit report — DATA only; all prose written fresh (the report's
 * interpretations are copyright Henry Seltzer / Astrograph, never copied):
 *   Scorpio Sun (1st, conj. Ascendant 0.2°) · Scorpio Rising (Asc 4°42') · Moon
 *   in Gemini (8th) · Mercury in Libra (12th) · Venus in Libra (12th) · Mars in
 *   Capricorn (3rd) · Jupiter in Libra (12th) · Saturn in Taurus (7th, on the
 *   Descendant — opposite the Sun) · Uranus in Libra (12th) · Neptune in Scorpio
 *   (1st, conj. Ascendant) · Pluto in Virgo (11th) · Chiron in Aries (6th, ~5°) ·
 *   North Node Pisces (5th) / South Node Virgo (11th) · Midheaven Leo 11°.
 *   Houses read WHOLE-SIGN from a verified Scorpio Ascendant (Astrograph's
 *   Placidus cusps run uneven at 41°N; Chiron + Nodes are approximate).
 *
 * Cross-check (time-independent confirmations from the transit report):
 *   Neptune = Scorpio 27.6° (Pluto sextile Neptune, exact at t-Pluto 27° Cap) ·
 *   Pluto = Virgo 26° (Pluto trine Pluto) · Mercury = Libra 23° (Saturn trine
 *   Mercury, Jan '23) · Venus = Libra 13.5° (Chiron opp Venus, t-Chiron 13.5°
 *   Aries) · Jupiter = Libra 20° (Saturn trine + Uranus inconjunct) · Mars =
 *   Capricorn 25° (Neptune sextile Mars). The report's own "Mars into 1st House,
 *   Oct '23" confirms the Scorpio Ascendant and the 06:30 birth time.
 *
 * Signatures: Sun CONJUNCT the Ascendant in Scorpio, with Neptune also in
 * Scorpio on the 1st — a deep, veiled, transformative presence. A hidden
 * STELLIUM in Libra in the 12th (Uranus, Venus, Jupiter, Mercury) — refined
 * relational/aesthetic intelligence carried behind the veil. Saturn EXACTLY
 * opposite the Sun, on the Descendant — partnership as the lifelong teacher.
 * Gemini Moon in the 8th. Dominant element AIR (5: the Libra cluster), dominant
 * modality CARDINAL (5) — the founder/initiator. Two gifts: the OVERT builder
 * (Mars in Capricorn + cardinal initiation + Scorpio strategy — the one who
 * built and sold companies) and the HIDDEN relational genius (the Libra 12th).
 * Fire is the least-present element (only Chiron in Aries) — the tender growing
 * edge: self-assertion, will, the right to take up space.
 *
 * Lived arc (Kelly, 2026-06-25): Larry is transitioning from CEO/founder — having
 * built and sold companies (one for $40M+) — toward work as a positive-psychology
 * coach and consultant. The chart names this exactly: the builder's gift the world
 * already rewarded, and the hidden relational/healing gift (Libra 12th, Chiron,
 * Pisces North Node) now stepping forward as the next vocation. Part II's "the
 * hidden becomes the work" tracks precisely this turn.
 *
 * PART II (The Year Ahead) is computed FRESH for the CURRENT season — June 2026
 * to June 2027 — from his verified natal chart (transit scan, DATA only; prose
 * fresh). A profound threshold year: Pluto square the Sun–Saturn axis and the
 * Ascendant (identity rebuilt), Saturn through the 6th conjunct Chiron and
 * opposing the hidden Libra stellium (the gifts called to account), Jupiter
 * conjunct the Midheaven then sextiling that stellium (the veiled gifts drawn
 * up into visible vocation), Uranus trine Uranus (the original self reawakening),
 * Neptune entering toward Chiron (the spiritual softening beneath).
 *
 * The giver's note + threshold are a respectful DRAFT — Kelly's own words to
 * Larry are his to write; the words in the gift remain his. "A Blessing" is a
 * guide-voice blessing, calibrated to a friendship of equals.
 */

import type { LiterarySoulPortrait } from '../schema';
import { DEFAULT_FRAMING } from '../schema';

export const larryPortrait: LiterarySoulPortrait = {
  person: {
    name: 'Larry Closs',
    slug: 'larry',
    pronouns: 'he/him',
    isMinor: false,
  },

  mode: 'gift',

  // mentorEnabled intentionally omitted → default-deny. Mentor OFF.

  offeredBy: {
    relationship: 'his friend and collaborator',
    giverName: 'Kelly',
    // DRAFT — Kelly to replace with his own words. The words in the gift remain his.
    giftOpening: `Every life carries a particular signature — a way of meeting the world that belongs to no one else.

This one is yours: the depth people feel before you have said a word, the strategist's mind that built real things in the world and knew how to win, and — quieter, beneath it — a relational gift that is only now stepping forward as your next chapter. I have watched you build and lead, and watched you begin to turn, now, toward the work of helping people grow. It seemed only right to hold up a mirror so you could see the whole of it.

The stars reveal the weather; your soul chooses how to walk through it. Read this as a reflection offered in friendship and respect — and keep only what your own heart already knows is true.

— Kelly`,
    threshold: {
      eyebrow: 'A Soul Portrait',
      forLine: 'For Larry',
      attribution: 'Offered by Kelly',
      framing:
        'A reflection on who you are, and who you are still becoming — written in the language of soul and symbol. The stars reveal the weather; your soul chooses how to walk through it.',
    },
  },

  birthData: {
    date: 'October 28, 1969',
    time: '6:30 AM EST',
    place: 'Easton, Pennsylvania',
    note: 'The chart is read symbolically — a map of the sky under which a life began, never a prediction of where it goes. Houses are read whole-sign from a Scorpio Ascendant.',
  },

  framing: DEFAULT_FRAMING,

  chapters: [
    // 1 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Essential Nature',
      element: 'water',
      body: `To meet you is to feel depth before you understand it.

You were born with Scorpio rising and the Sun resting right there on the eastern horizon — the rarest and most concentrated way a Scorpio can arrive: not the sign worn lightly, but the sign as the very threshold of the self. It gives you a presence people register before you speak — still, watchful, unhurried, with a gravity that draws others in even as it keeps its own counsel. You see beneath the surface of a situation or a person almost involuntarily. Pretense does not survive long in your company. You are built to perceive what is really going on.

And right beside that Sun sits Neptune, also in Scorpio, on the same horizon — which softens the intensity into something mystical and permeable. It means your depth is not only penetrating; it is compassionate, porous, attuned to the unseen. You feel the emotional weather of a room. You carry a sensitivity that you have probably learned to protect, because the world does not always handle that much openness gently. So the self you show is a veil — not a mask exactly, but a threshold that only a few are ever invited all the way past.

This is your essential nature: a deep, perceptive, quietly powerful soul who lives close to the mysteries — close to what is hidden, what is healing, what is transforming. Most people only ever meet the surface of the water. The ones who are let down into the depths find something rare there: a person of real substance, who has been to the bottom of things and come back able to hold the bottom of things for someone else.`,
    },

    // 2 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Gift You Carry',
      element: 'air',
      body: `Every soul carries a particular gift — not a skill exactly, but a way of being the world is quietly better for. You have, in fact, carried two.

The first the world has already seen and rewarded: the builder's gift. With Mars in disciplined Capricorn, a chart full of cardinal initiative, and the strategic depth of Scorpio, you were made to start things, to lead them, to see around corners, and to turn an idea into something that stands and pays. You have built, and you have won — the gift of the founder and the executive, proven in the hard currency of the world. No one needs to tell you that one is real.

But there is a second gift, quieter, that has lived most of your life behind the veil — and it is the one now stepping forward. It is a kind of relational genius.

Four of your planets gather together in Libra — the sign of fairness, beauty, and the other person — and they sit in the Twelfth House, the most hidden and inward room of the whole chart. Your Mercury is there (a mind that thinks naturally in terms of harmony, balance, and what is just), your Venus is there in its own home sign (a deep, refined love of beauty, connection, and grace), your Jupiter is there (a real generosity, a faith in fairness, an instinct to bless), and your Uranus is there too (an original, even visionary sense of how people could relate more truly). Together they make you a natural diplomat, a peacemaker, an aesthete, and a person others instinctively trust with what matters.

But because all of this lives in the Twelfth — the house of the unseen, the behind-the-scenes, the given-away — your gift has spent much of your life operating quietly. You have likely been the one who smooths the room, who senses what is fair, who gives generously without announcement, who creates harmony others enjoy without quite noticing who made it. The shadow of the Twelfth is that such gifts get hidden even from their owner — handed out so freely, and so privately, that you may never have fully claimed them as yours.

Here is the truth worth naming plainly: this relational and aesthetic intelligence is a genuine and uncommon gift. The capacity to perceive what is fair, to make things beautiful, to hold a connection with care, to bless quietly — that is not nothing, and it is not everyone's. Your work, more and more, is to bring it out from behind the veil: to make the growth of other people your next real work, the way building was your last — to let what you have always given quietly become the thing you now stand behind in the open.`,
    },

    // 3 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Way You Relate',
      body: `Relationship is, for you, the great teacher — and your chart is unusually direct about it.

Saturn, the planet of weight, commitment, and life's serious lessons, sits exactly opposite your Sun, on the Descendant — the very point of the significant other. This is the signature of someone for whom partnership is never casual. Through relationship you have met your hardest lessons and your deepest maturation: about commitment, about responsibility, about staying when it is difficult, about the fear that closeness can stir, and about what it really costs and gives to be bound to another. You take the bonds of your life seriously, perhaps more seriously than almost anything. You are loyal, enduring, and built to keep faith — and you may also, at times, have carried relationship as a kind of weight, felt its burden as much as its warmth.

And the way you love runs deep and whole. Your Scorpio Sun does not do shallow intimacy; it wants the real thing, all the way down — which can be transformative for the people you let in, and intense, and not always easy. Your Libra planets long for harmony and fairness and beauty in your connections. So you live a quiet tension: the Scorpio that wants to merge in the depths, and the Libra that wants peace and balance; the Saturn that fears and honors the seriousness of the bond, and the heart that simply wants to love and be at ease.

The invitation written into the same chart is this: to let relationship be a place of grace and not only of duty — to receive as fully as you give, to let yourself be tended and not only be the one who tends, and to trust that you can be all the way known without it costing you yourself. The people who make it past your threshold find someone steadfast, deep, and rare. Let them in, and let yourself be held in return.`,
    },

    // 4 ──────────────────────────────────────────────────────────────────────
    {
      title: 'Your Deep Waters',
      element: 'water',
      body: `There is an inner life in you that runs far below the visible surface — and it is one of the truest things about you.

Your Moon — the seat of your feelings — sits in the Eighth House, the deepest and most transformative room of the chart: the house of intimacy, of loss, of the shared and the hidden, of death and rebirth. This is not a placement for a light emotional life. Your heart is drawn, again and again, into the profound: into the things most people avoid looking at directly, into the undercurrents of a relationship, into grief and mystery and the regenerative dark. You have likely known your share of descents. And you have the rare capacity to be with another person in theirs — to sit in the deep water with someone and not flinch, because you know the territory.

That Moon is in Gemini, which gives the depth a particular texture: you process feeling through thought and word. You need to name what you feel, to turn it over, to understand it, sometimes to talk your way down into it. Your emotional intelligence is genuine, but it often arrives by way of the mind — curiosity is one of the ways your heart keeps itself company. The risk is staying in the words and circling above the feeling; the gift is an unusual ability to make the depths speak, to give language to what is usually wordless.

Held together with your Scorpio Sun and Neptune, this is the source of your gravity — the reason your presence carries weight. You are deep water with a quick and curious surface. It rarely shows to the casual eye. But it is why people, once they know you, feel they have found something that goes all the way down.`,
    },

    // 5 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Work Your Soul Came to Do',
      element: 'aether',
      body: `Some lives are oriented toward achievement. Yours is oriented toward something quieter and harder to name: to bring hidden gifts into form, to heal, and to learn — at last — to trust the flow rather than perfect it.

Your North Node — the direction your soul is reaching toward — sits in Pisces, in the Fifth House of creativity, play, and the heart. Behind you, in the opposite seat, your South Node lies in Virgo: the familiar, well-worn ground of analysis, discernment, service, getting it right. This is one of the clearest growth arcs a chart can show. You arrived already fluent in the Virgo gifts — careful, exacting, useful, able to spot what is flawed and fix it. The journey is toward Pisces: toward trust, surrender, compassion, creative flow, mercy (for others and, harder, for yourself), and the willingness to make and offer and love without first making it perfect. To move from the critic's eye to the creator's heart.

And your Chiron — the deep wound that becomes the deep medicine — sits in Aries, in the Sixth House of work, craft, and daily service. This points to an old ache around the right to assert yourself, to want plainly, to take up space, to lead with your own flame; and it points to a healing that comes precisely through the work of your hands and days — through being of genuine service while no longer disappearing into it. The wounded place and the vocation are in the same house, which is no accident: your craft is where the wound becomes the gift.

So the work your soul came to do is to take the relational, aesthetic, healing intelligence you have carried in private — to claim it, assert it, and let it become your visible offering — while learning to create from trust rather than perfectionism, and to serve from wholeness rather than self-erasure. You are here to become a healer who has healed enough of his own wound to stand fully in the open. Not perfect. Present.`,
    },

    // 6 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Shadow That Protects the Gift',
      body: `Every real gift has a shadow standing guard at its door — not a flaw, but an old protector that once kept something tender safe, and that can overstay its usefulness if you do not know it is there.

For you, that shadow wears a few familiar faces. There is the Scorpio guardedness — the instinct to keep the depths hidden, to control how much of yourself is seen, to let very few people all the way in. There is the Twelfth-House reflex to give your gifts away unseen, to serve from behind the veil, to make the room better while quietly erasing your own claim on it. There is the weight your Saturn places on relationship and worth — an old sense that love must be earned, carried, deserved through effort. And underneath, the Chiron-in-Aries ache: a buried doubt about your simple right to assert yourself, to want out loud, to take up space without apology.

Here is the reframe that matters: none of these is merely a problem to fix. Each one is protecting the gift. The guardedness kept your great sensitivity from being trampled. The hiddenness kept your gifts safe in a world that does not always honor them. The seriousness about love is the underside of your loyalty and depth. And the doubt about your right to assert was, paradoxically, what made you so attuned to fairness and to others — you learned to read the room because you were not sure of your own place in it.

The work of this stretch of life is not to defeat these protectors but to thank them and let them loosen their grip — to come out from behind the veil, to claim your gifts in the open, to let your worth rest in who you are rather than in what you carry for others, and to assert your own flame without apology. The gift was never in danger. You can step into the light.`,
    },

    // 7 ──────────────────────────────────────────────────────────────────────
    {
      title: 'The Dance of Your Elements',
      body: `The elements are not boxes to sort you into. They live in you as a moving ecology — forces in conversation, each one teaching and tempering the others. This is the particular dance they make in you.

Air leads. Your Libra cluster makes the relational, aesthetic, fair-minded mind the most active element in you — it is why you are, first, a person of connection, harmony, and perception. It is the front of you, even when it works quietly.

Water runs deep. Your Scorpio Sun and Neptune, and your Moon in the depths of the Eighth, give you an oceanic inner life — intense, compassionate, transformative, attuned to the unseen. Air gives this water language; water gives the air its soul. Together they are why you can both perceive a person and feel them.

Earth grounds. Mars in Capricorn, Saturn in Taurus, Pluto in Virgo — a steady, patient, durable capacity to build, to endure, to do the real work over time. Earth is what has let you carry weight and keep faith and stay the course. It keeps the deep water contained and gives the airy gifts a place to become real.

Fire is your tender growing edge — and that is the most important thing to know about your elements. Fire is the least-present element in your chart; its single spark is Chiron in Aries, the wound itself. This is not a lack so much as a direction. The work of your life keeps asking the same fiery questions: Can you assert yourself? Can you want plainly? Can you lead with your own flame, take up space, claim your gifts in the open? Every time you do, you are not just acting — you are healing the one place your elemental nature is still becoming whole.

Held together: a luminous relational mind, a deep and compassionate soul, grounded by real patience and strength, learning — still, and beautifully — to burn openly as itself. Not a type. A living balance, in motion. Which is only another way of saying: a soul, alive.`,
    },

    // Practices ───────────────────────────────────────────────────────────────
    {
      title: 'Practices',
      body: `Practices are how a portrait becomes a life. None of these is a task to perfect — each is a small, embodied way of tending the dance. Take up whichever one is alive for you, and let the rest wait.

Air — Claim One Gift Aloud. Once a week, name to one person something you did that was good — a kindness, a fairness, a beautiful thing you made or held. Not bragging; just bringing one hidden gift out from behind the veil into the light of being witnessed.

Water — Stay One Beat Longer. When a real feeling rises, resist the Gemini reflex to immediately explain it. Set aside a few quiet minutes and simply be in the water before you find the words. You already know the way down; practice arriving there without narrating.

Earth — Tend the Craft. Give one small, finished, concrete offering to your work this week — a single brick of your real vocation, made well and completed. Your patience is a strength; honor it one true step at a time, for your own sake and not only in service to others.

Fire — Want Out Loud. Each week, name one thing you want purely for yourself — not useful, not deserved, not for anyone else — and take one inch toward it. This is the practice that heals the deepest place. Your flame is allowed to be seen.

Aether — Create Without Fixing. Make one small thing — a few words, an image, a meal, a gesture — and deliberately leave it imperfect. Offer it anyway. This is how the Virgo critic learns to rest and the Pisces creator learns to trust: the imperfect offering, given in mercy, is enough.`,
    },
  ],

  // ── Part II — The Year Ahead (the Season + the Living Spiral) ──────────────
  // Computed FRESH for the CURRENT season (June 2026 – June 2027) from his
  // verified natal chart — transit scan, DATA only; all prose written fresh.
  // Each phase reads a real transit as an elemental movement and an invitation,
  // with the transit named quietly as a footnote. The Blessing closes the whole
  // portrait.
  yearAhead: {
    title: 'The Year Ahead',
    subtitle: 'The Year the Hidden Becomes the Work',
    timeframe: 'June 2026 – June 2027',
    openingHeadline:
      'This is one of the great threshold years of a life — the old self rebuilt from beneath while, at the very same time, the gifts you have carried in private are drawn up into the light. It asks much, and it gives much.',
    openingTheme: `Your birth chart is the landscape you carry through a whole life. The transits are the weather moving across it — and this year, the weather is as significant as it gets. Several of the slowest, deepest forces in the sky are working on you at once, and they are working together on purpose.

From beneath, a great rebuilding: Pluto, the planet of death and regeneration, comes to a hard angle with your Sun, your Saturn, and your very Ascendant — the once-in-a-lifetime pressure that dissolves an old identity so a truer one can be born. In the house of your daily work, Saturn arrives to sit on your old wound and to test, one by one, the hidden gifts you have kept behind the veil — asking you to make them real, accountable, yours. And up at the top of your chart, Jupiter crosses your Midheaven and reaches back to bless that same hidden cluster of gifts — drawing the private into the public, the unseen into the visible, the long-carried into the openly-offered. Meanwhile your own original nature stirs awake, and a slow spiritual softening begins underneath everything.

This is the shape of the year: rebuilt from below, called to account in the middle, and lifted into the light at the top — all of it conspiring toward a single outcome, which is that the gifts you have hidden become, at last, your visible work. What follows is the weather of it, and the invitations inside. None of it is fixed, and none of it is fate. Your soul chooses how to walk through all of it.`,
    phases: [
      {
        element: 'water',
        title: 'The Deep Rebuilding',
        timeframe: 'Autumn 2026 into spring 2027 (Pluto)',
        transits: [
          'Pluto square your Ascendant (exact Oct 27, 2026)',
          'Pluto square your Sun (exact Dec 2, 2026)',
          'Pluto square your Saturn (exact Apr 21, 2027)',
          'Pluto sextile your Chiron (exact Apr 25, 2027)',
        ],
        body: `The deepest weather of the year comes from below. Pluto — the planet of death and rebirth — moves to a hard angle with the very spine of your chart: your Ascendant (the self you show), your Sun (your core identity), and your Saturn (the structure of your life). This is a once-in-a-lifetime transit. It does not come gently, and it does not come to destroy you — it comes to take apart what has outlived its truth so that something more real can be built in its place.

You may feel old certainties about who you are, how you present yourself, and how your life is structured come under genuine pressure this year. Things that have defined you may loosen, fall away, or demand to be remade. For someone with your Plutonian depth this is, in a way, native territory — you know how to go down into the dark and come back changed. The invitation is not to cling to the old form, but to let the rebuilding happen honestly: to ask what in your identity is dying because it was never fully yours, and to let a truer self come up through the cracks. And note the grace inside it — Pluto also reaches kindly to your Chiron, your wound, this spring: the deep change and the deep healing are moving together.`,
        question: 'What in my old identity is ready to die, so that a truer self can be born?',
      },
      {
        element: 'earth',
        title: 'The Gifts Called to Account',
        timeframe: 'All year (Saturn through your Sixth House)',
        transits: [
          'Saturn conjunct your Chiron (mid-2026)',
          'Saturn opposite your Uranus, Venus, then Jupiter (across the year)',
          'Saturn trine your Midheaven (Oct 11, 2026)',
        ],
        body: `All year, Saturn — the planet of work, maturity, and making-real — moves through the house of your craft and daily service, and from there it does two things at once. First it sits down on your Chiron, your old wound, asking you to meet it not as a fresh injury but as something you are now mature enough to carry and even to teach from. And then, one by one, it reaches across the sky to your hidden Libra gifts — your originality, your love, your generosity, your mind — and presses each of them with the same serious question: Is this real? Will you stand behind it? Will you make it accountable and visible, or keep giving it away in the dark?

This is the year's discipline, and it is exacting. Saturn does not flatter; it tests. You may feel the weight of it — moments of limitation, of seriousness, of being asked to grow up around the very things you do most naturally and most privately. But this is the necessary ground. The gifts that survive Saturn's questioning come out the other side as mastery — no longer talents you happen to have, but a craft you have claimed. This is the year your private gifts are asked to become your real work.`,
        question: 'What gift am I being asked to claim, mature, and stand behind as my real work?',
      },
      {
        element: 'air',
        title: 'The Veil Lifts',
        timeframe: 'Autumn 2026 through spring 2027 (Jupiter)',
        transits: [
          'Jupiter conjunct your Midheaven (exact Sep 29, 2026)',
          'Jupiter sextile your Moon (Oct 3, 2026)',
          'Jupiter sextile your Venus, Jupiter, then Mercury (winter into spring)',
        ],
        body: `And here is the grace that answers the year's pressure. Jupiter — the planet of blessing and expansion — crosses your Midheaven, the very peak of your chart, the point of vocation and public standing. Where Jupiter touches the Midheaven, the world turns to look; doors of recognition and calling tend to open. And then, all through the season, Jupiter reaches back down to your hidden Libra cluster — your Venus, your Jupiter, your Mercury — and lifts each of them with an easy, generous light.

This is the most beautiful movement of your year, because it is the exact answer to your life's central task. The gifts you have carried behind the veil — the relational genius, the love of beauty, the fair and generous mind — are being drawn up out of the Twelfth House and toward the Midheaven, out of the private and into the visible. The same gifts Saturn is asking you to make real, Jupiter is offering to make seen. Do not shrink from it. This is the season to let your hidden offering become your public vocation — to say yes when the world turns to look, and to let what you have always given in the dark be received, at last, in the light.`,
        question: 'What hidden gift is ready to step out of the private and become my visible calling?',
      },
      {
        element: 'fire',
        title: 'The Original Self Reawakens',
        timeframe: 'Spring–summer 2027 (Uranus)',
        transits: [
          'Uranus sextile your Chiron (exact May 7, 2027)',
          'Uranus trine your natal Uranus (mid-2027)',
          'Uranus approaching your Moon (building)',
        ],
        body: `And through the rebuilding and the lifting, something in you quickens and reclaims itself. Uranus, the awakener, comes into easy contact with your own original nature — the classic turning that arrives near this stage of life, when the unlived parts of a person start, quietly and then insistently, to wake up.

This is the fire phase, and fire is precisely your tender growing edge — so pay close attention here. You may feel a restlessness with purpose, a refusal of what no longer fits, a stirring of the will to be more fully and openly yourself. Uranus reaches your wound kindly and reawakens your individuality, and it begins to approach your feeling-nature too, loosening old emotional patterns. The invitation is the one your whole chart keeps offering, now made urgent and alive: to claim your own flame, to want out loud, to let yourself be different and visible and unapologetically you. After a life of carrying so much for others, this is the season the original self gets to stand up. Let it.`,
        question: 'What original, unlived part of me is waking up and asking to be lived openly?',
      },
      {
        element: 'aether',
        title: 'The Softening Beneath',
        timeframe: 'Beginning this year, deepening beyond it (Neptune)',
        transits: [
          'Neptune entering Aries, approaching your Chiron',
          'Neptune approaching the opposition to your Uranus',
        ],
        body: `Underneath all of it, a slow and sacred softening begins. Neptune — the planet of the imaginal, the compassionate, and the dissolving — moves into the house of your work and starts the long approach toward your old wound and your originality. This is the quietest movement of the year, more undertone than event, just beginning and deepening in the years to follow. But it is worth naming, because it changes the meaning of everything else.

Where Pluto rebuilds by force and Saturn by discipline, Neptune works by mercy. It begins to dissolve the hard edges around your old wound, to thin the line between your daily work and something more like prayer, to soften the perfectionism your soul is already trying to leave behind. It asks for trust rather than control, surrender rather than mastery — the very Pisces medicine your North Node has been pointing you toward all along. You do not have to do anything with this except notice it: a growing willingness to hold things more lightly, to create from grace, to let the sacred in through the cracks the harder transits are making. Let yourself be softened. It is the gentlest, and perhaps the truest, gift of the year.`,
        question: 'What am I being invited to hold more lightly, to trust rather than control?',
      },
    ],
    weatherPattern: [
      { season: 'Autumn 2026 → spring 2027', element: 'water', invitation: 'Let the old identity be rebuilt from beneath' },
      { season: 'All year', element: 'earth', invitation: 'Claim and mature your gifts into real work' },
      { season: 'Autumn 2026 → spring 2027', element: 'air', invitation: 'Let the hidden gift become your visible calling' },
      { season: 'Spring–summer 2027', element: 'fire', invitation: 'Wake up your original self; want out loud' },
      { season: 'Beginning now', element: 'aether', invitation: 'Soften; trust; create from grace' },
    ],
    goldenThread: `Almost everything this year points the same way. Pluto takes the old identity apart from beneath so a truer one can be built; Saturn moves through the house of your craft, sitting on your old wound and pressing each of your hidden gifts to become real and accountable; and Jupiter crosses your Midheaven and lifts those very same gifts up out of the private Twelfth House and into the visible light of vocation. Underneath, your original self reawakens, and a slow Neptunian mercy begins to soften the whole thing toward trust. It is a profound year, and not a light one. But its golden thread is unmistakable and it is the thread of your whole life made suddenly urgent: this is the year the hidden becomes the work — the year the relational, healing, beautiful intelligence you have carried so long behind the veil is rebuilt, matured, and at last drawn out into the open as your real and visible calling. You were made for exactly this crossing. Step into the light.`,
    questions: [
      'What in my old identity is ready to die, so a truer self can be born?',
      'What gift am I being asked to claim, mature, and stand behind as my real work?',
      'What hidden gift is ready to step out of the private and become my visible calling?',
      'What original, unlived part of me is waking up — and what would it mean to want it out loud?',
    ],
    closing: {
      title: 'A Blessing',
      body: `May you trust the rebuilding as much as you have always trusted the depths.

May you let the old self be taken apart without fearing you will be lost — because what is real in you cannot be dissolved, only revealed.

May this be the year you come out from behind the veil. May the gifts you have carried so long in private — the care, the fairness, the beauty, the quiet healing — be claimed by you in the open and received by the world in the light. May you let yourself be seen offering them, and may you let yourself be blessed for it.

May your own flame, so long held in reserve for others, finally rise and burn openly as itself. May you want plainly, assert gently, and take up the space that has always been yours.

You have spent a life tending the depths of other people, holding the bottom of things so that someone else could be safe there. May this be the season the depths hold you in return — and may you know that the hidden work of your hands and heart was always sacred, and that it matters, and that it is time, now, for it to be seen.`,
    },
  },
};

export default larryPortrait;
