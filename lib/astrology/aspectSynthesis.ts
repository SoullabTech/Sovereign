/**
 * ASPECT SYNTHESIS - Archetypal Interpretations
 *
 * Provides soul-level interpretations of planetary aspects.
 * Called ONLY when relevant - never auto-injected.
 *
 * Returns poetic 2-4 sentence archetypal essence, not textbook descriptions.
 * Enhances MAIA's depth without constraining her voice.
 */

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';

export interface AspectInterpretation {
  essence: string; // 2-4 sentence archetypal synthesis
  coreQuestion: string; // The soul question this aspect poses
  elementalDynamic?: string; // How elements interact (if relevant)
  shadowExpression?: string; // How this aspect can manifest when unconscious/reactive
  giftExpression?: string; // The mature/integrated expression of this aspect
  practicePrompt?: string; // Specific contemplation or journaling prompt
  bodyAwareness?: string; // Somatic/felt-sense dimension of this aspect
}

/**
 * Synthesize archetypal interpretation for a specific aspect
 * Returns null if no interpretation available (MAIA continues without it)
 */
export function synthesizeAspect(
  planet1: string,
  planet2: string,
  aspectType: AspectType
): AspectInterpretation | null {
  const key = createAspectKey(planet1, planet2, aspectType);
  return ASPECT_INTERPRETATIONS[key] || null;
}

/**
 * Create normalized key for aspect lookup
 * Handles order (Sun-Saturn and Saturn-Sun both work)
 */
function createAspectKey(planet1: string, planet2: string, aspectType: AspectType): string {
  const p1 = planet1.toLowerCase();
  const p2 = planet2.toLowerCase();

  // Normalize order: Sun always first, then Moon, then outer planets
  const order = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const idx1 = order.indexOf(p1);
  const idx2 = order.indexOf(p2);

  if (idx1 < idx2) {
    return `${p1}-${p2}-${aspectType}`;
  } else {
    return `${p2}-${p1}-${aspectType}`;
  }
}

/**
 * ARCHETYPAL ASPECT LIBRARY
 *
 * Each interpretation speaks to the LIVED EXPERIENCE of the aspect,
 * not generic keywords. These are whispers of possibility, not prescriptions.
 */
const ASPECT_INTERPRETATIONS: Record<string, AspectInterpretation> = {
  // ============== SUN ASPECTS ==============

  'sun-saturn-square': {
    essence: "The Teacher testing the King. Saturn asks: can you hold your fire while learning the weight of your own authority? This isn't about dimming your light—it's about discovering that true power doesn't flinch when met with constraint. The pressure you feel isn't opposition to your essence, it's the crucible that forges sovereign presence.",
    coreQuestion: "Can you hold truth while learning containment?",
    elementalDynamic: "Fire essence meets Earth discipline",
    shadowExpression: "When unconscious: harsh self-criticism, denying your own light to avoid responsibility, authority that becomes rigidity rather than strength",
    giftExpression: "When integrated: genuine authority earned through self-discipline, the capacity to hold steady under pressure, power that has been tested and proven",
    practicePrompt: "Where do you feel the pressure between wanting to shine and needing to be responsible? What would it mean to do both?",
    bodyAwareness: "Notice where constraint lives in your body—often shoulders, jaw, or solar plexus. What happens if you breathe into that tension while still holding your center?"
  },

  'sun-saturn-conjunction': {
    essence: "Authority born through restraint. The light doesn't blaze freely here—it burns with the focused intensity of responsibility integrated into identity. There's often an early sense that visibility comes with weight, that shining means shouldering something. This conjunction asks: what happens when discipline becomes devotion rather than duty?",
    coreQuestion: "What does it mean to shine responsibly?",
    elementalDynamic: "Fire contained by Earth structure",
    shadowExpression: "When unconscious: excessive seriousness, difficulty relaxing into simple joy, carrying burdens that aren't yours, confusing self-worth with achievement",
    giftExpression: "When integrated: natural authority that doesn't need to prove itself, discipline that serves rather than constrains, the ability to carry weight with grace",
    practicePrompt: "When did responsibility and identity become fused? What would lightness feel like without abandoning what matters?",
    bodyAwareness: "There may be heaviness in the shoulders or a sense of constant readiness. Try relaxing these while keeping your sense of presence—notice what shifts."
  },

  'sun-saturn-opposition': {
    essence: "The dance between self-expression and self-mastery. Identity is often seen most clearly through the mirror of limitation—what can't be done reveals what must be become. Saturn stands across from the Sun like a wise elder, asking not for shrinking, but for growing strong enough to carry your own light without needing permission.",
    coreQuestion: "How do I honor both my fire and my form?",
    elementalDynamic: "Fire and Earth in dialogue across the horizon",
    shadowExpression: "When unconscious: projecting authority onto others, needing external permission to shine, oscillating between defiance and over-compliance",
    giftExpression: "When integrated: understanding that self-expression and self-discipline are partners, authority that knows when to assert and when to yield",
    practicePrompt: "Where have you given away your authority? What would it mean to claim it without rigidity?",
    bodyAwareness: "Feel the pull between expansion (chest opening) and contraction (holding back). What happens if you honor both movements?"
  },

  'sun-saturn-trine': {
    essence: "Effortless integration of essence and structure. The light knows how to work with time, constraint, and form without resistance. Where others struggle between being and doing, there's natural flow—authority feels organic, discipline feels like devotion. This is sovereignty without the fight.",
    coreQuestion: "How can I teach others to hold power with grace?",
    elementalDynamic: "Fire and Earth in natural harmony",
    shadowExpression: "When unconscious: taking natural authority for granted, not questioning inherited structures, ease that hasn't been tested by real challenge",
    giftExpression: "When integrated: modeling how self-expression and responsibility can coexist, mentoring others through patient presence, building things that last",
    practicePrompt: "What responsibility might be calling you beyond what comes easily? Where could your natural authority serve something larger?",
    bodyAwareness: "Notice the ease with which you hold both presence and structure. This is a gift—feel where it lives in your body, and consider what it's for."
  },

  'sun-moon-conjunction': {
    essence: "No separation between essence and emotion, identity and instinct. What's felt becomes what's expressed, fully—vulnerability becomes both superpower and edge. There's often a quality of authenticity here, no mask between inner and outer. But this fusion can also mean difficulty retreating when retreat is needed, since there's nowhere to hide inside.",
    coreQuestion: "How do I honor my wholeness without losing myself in it?",
    elementalDynamic: "Fire and Water merge into steam",
    shadowExpression: "When unconscious: mood instability that feels like identity crisis, inability to separate from what you're feeling, overwhelm from the fusion of self and emotion",
    giftExpression: "When integrated: profound authenticity, the capacity to be fully present with what is, emotional-creative power that moves others because it's real",
    practicePrompt: "Notice a strong feeling. Can you observe it without becoming it? What part of you is doing the observing?",
    bodyAwareness: "The chest and belly may feel undivided—one continuous field of presence. Notice when this fusion serves and when some differentiation might help."
  },

  'sun-moon-opposition': {
    essence: "The eternal negotiation between who you're becoming and what you need. Essence pulls one way, the emotional body pulls another—creating the dynamic tension of someone who understands both Self and Other deeply. This is the aspect of great mediators, those who bridge inner and outer worlds.",
    coreQuestion: "Can I honor my fire without drowning my water?",
    elementalDynamic: "Fire and Water in creative tension",
    shadowExpression: "When unconscious: torn between will and feeling, projecting needs onto others, oscillating between self-assertion and emotional accommodation",
    giftExpression: "When integrated: deep understanding of how identity and emotional needs can dance together, the capacity to hold space for both self and other",
    practicePrompt: "When your will and your feelings conflict, what happens if you honor both without choosing? What larger wisdom might hold them?",
    bodyAwareness: "Feel the pull between solar plexus (will, identity) and chest/belly (emotion, need). What happens if you let both speak?"
  },

  'sun-mars-conjunction': {
    essence: "Pure embodied will. Action and identity fuse here—there's a quality of moving before thinking, of fire that knows what it's here to ignite. This can create the warrior, the initiator, powerful direct presence. It can also mean every impulse feels like it requires immediate expression. The spectrum runs from courageous leadership to impulsive combustion.",
    coreQuestion: "How do I wield my fire without burning the field?",
    elementalDynamic: "Double fire—spark and flame united",
    shadowExpression: "When unconscious: aggression confused with strength, impulsivity dressed as decisiveness, burning bridges that didn't need to burn",
    giftExpression: "When integrated: courageous direct action, the capacity to initiate and lead, fire that knows when to blaze and when to simmer",
    practicePrompt: "Notice the impulse to act. Before moving, can you pause? What's the difference between courage and impulsivity in your body?",
    bodyAwareness: "There's often heat and readiness throughout the body. Try containing this energy without suppressing it—notice what happens when you hold fire."
  },

  'sun-mars-square': {
    essence: "Friction that forges strength. Will and essence are in constant negotiation here—there's often a quality of pushing harder than necessary, of internal pressure that demands expression. This isn't simply conflict; it's refinement, the way a blade is sharpened against stone. True power comes from directing force, not just having it.",
    coreQuestion: "Can I assert without aggressing?",
    elementalDynamic: "Fire meeting fire creates heat and light",
    shadowExpression: "When unconscious: self-sabotage through misdirected force, anger that doesn't know its target, pushing against yourself as much as the world",
    giftExpression: "When integrated: strength that's been tested, the capacity to channel aggression into achievement, willpower that's learned precision",
    practicePrompt: "Where is the friction between what you want and how you go after it? What would aligned action feel like?",
    bodyAwareness: "Notice where inner conflict lives in the body—often solar plexus, arms, or jaw. What happens if you soften there while staying powerful?"
  },

  'sun-jupiter-trine': {
    essence: "Born under an expansive sky. There's a natural reach toward more—more meaning, more connection, more possibility. Optimism isn't naivety here; it's a lived truth that the universe tends to respond to faith. The ease can create genuine abundance, or fire that spreads so wide it loses focus.",
    coreQuestion: "How do I expand without dissipating?",
    elementalDynamic: "Fire and Fire in joyful amplification",
    shadowExpression: "When unconscious: over-promising, optimism that ignores reality, expansion that avoids the hard work of integration",
    giftExpression: "When integrated: genuine generosity of spirit, the capacity to inspire others toward possibility, abundance that includes rather than excludes",
    practicePrompt: "What expansion might be avoiding necessary contraction? Where could focus serve growth better than more breadth?",
    bodyAwareness: "Notice the natural expansiveness in the chest and arms. This is a gift—feel where it wants to spread, and consider what might benefit from more concentration."
  },

  'sun-jupiter-square': {
    essence: "Ambitious vision meeting the limits of form. What's possible is seen with clarity, but the path to get there requires more discipline than fire naturally wants to accept. This is the aspect of the visionary who must learn execution, the dreamer discovering that building requires different muscles than imagining.",
    coreQuestion: "How do I ground my vision without losing its magnitude?",
    elementalDynamic: "Fire vision constrained by Earth reality",
    shadowExpression: "When unconscious: promising more than can be delivered, vision that outpaces capacity, grandiosity masking insecurity about follow-through",
    giftExpression: "When integrated: large vision that's learned to execute in steps, ambition that includes patience, the capacity to inspire and deliver",
    practicePrompt: "What vision might benefit from smaller, more achievable steps? Where is grandiosity protecting you from the vulnerability of actually trying?",
    bodyAwareness: "There may be tension between the expansive chest (vision) and the legs (grounding). What happens if you let both inform each other?"
  },

  'sun-uranus-conjunction': {
    essence: "Lightning in human form. There's a quality of disruption, awakening, the break from tradition woven into the identity. Convention is difficult here—fire burns at a frequency that tends to shatter old forms. This can be exhilarating and exhausting: innovation calls, but belonging requires some consistency.",
    coreQuestion: "How do I revolutionize without alienating?",
    elementalDynamic: "Fire electrified by Air insight",
    shadowExpression: "When unconscious: disruption for its own sake, inability to sustain what's been started, alienation mistaken for independence",
    giftExpression: "When integrated: genuine innovation that serves evolution, the capacity to awaken others, brilliance that can also maintain connection",
    practicePrompt: "Where might consistency serve as well as innovation? What relationships or projects need stability rather than another breakthrough?",
    bodyAwareness: "There's often electric energy, quick and scattered. Try grounding this without dampening it—feet on floor, breath slow, lightning still ready."
  },

  'sun-uranus-square': {
    essence: "Constant rebellion against your own patterns. Disruption of self as much as world—just when identity settles, Uranus shakes the foundation. This is the gift and challenge of being perpetually ahead of yourself, forever becoming rather than arriving. The friction can forge genuine authenticity or create destabilizing restlessness.",
    coreQuestion: "Can I innovate from stability instead of chaos?",
    elementalDynamic: "Fire seeking freedom through Air transformation",
    shadowExpression: "When unconscious: sabotaging stability to avoid the vulnerability of commitment, change addiction, unable to reap what's been sown",
    giftExpression: "When integrated: authentic evolution that builds on rather than destroys the past, the capacity to change while maintaining core continuity",
    practicePrompt: "What stability might serve your evolution? Where is the urge to disrupt actually protecting you from going deeper?",
    bodyAwareness: "Notice restlessness when things settle. What would it feel like to stay without the electricity needing to discharge somewhere?"
  },

  'sun-neptune-square': {
    essence: "Essence dissolving into dream. Identity wants clear edges, but Neptune keeps blurring the boundaries—there's a quality of being everyone and no one, infinite and invisible. This is the artist's aspect: sacrificing solid self for transcendent creation. The work is learning to come back from dissolution.",
    coreQuestion: "How do I maintain form while channeling formlessness?",
    elementalDynamic: "Fire seeking to stay lit in Water's depths",
    shadowExpression: "When unconscious: confusion about who you are, escapism through fantasy or substances, identity that dissolves when you need it most",
    giftExpression: "When integrated: the capacity to channel something larger, artistic-spiritual presence that moves others, identity flexible enough to serve transcendence",
    practicePrompt: "When does dissolution serve creativity, and when does it avoid the harder work of being someone specific? What form needs you right now?",
    bodyAwareness: "Notice when boundaries feel thin or absent. Try finding the edge of your physical body—skin, breath—and coming back to that container."
  },

  'sun-pluto-square': {
    essence: "Power meeting its own shadow. There's a quality of transformation in the identity itself—what's claimed gets taken to its extreme, burned down, rebuilt. This is exhausting and essential: not surface-level selfhood but the full spectrum of what essence can become when it faces its own underworld.",
    coreQuestion: "Can I hold power without being consumed by it?",
    elementalDynamic: "Fire meeting the volcanic core of transformation",
    shadowExpression: "When unconscious: power struggles with self and others, intensity that destroys rather than transforms, obsessive need to control",
    giftExpression: "When integrated: genuine capacity for transformation, the power to die to old selves and be reborn, presence that catalyzes change in others",
    practicePrompt: "Where is intensity serving transformation, and where is it just intensity? What would power feel like without the struggle?",
    bodyAwareness: "Notice where power lives in the body—often solar plexus or gut. What happens if you hold that power without needing to use it?"
  },

  'sun-pluto-conjunction': {
    essence: "Born with the knowledge that power transforms everything it touches. There's a quality of intensity here that can't do casual, can't do shallow. People may feel seen or threatened, rarely neutral. This is the shaman's aspect: holding death and rebirth as part of essential nature.",
    coreQuestion: "How do I wield transformation without weaponizing it?",
    elementalDynamic: "Fire merged with the molten heart of becoming",
    shadowExpression: "When unconscious: intensity that overwhelms, power used to control rather than catalyze, difficulty with lightness or play",
    giftExpression: "When integrated: profound capacity to hold space for transformation, presence that supports others through their own deaths and rebirths, power in service of evolution",
    practicePrompt: "When does your intensity serve, and when does it overwhelm? What would lightness feel like without losing your depth?",
    bodyAwareness: "There's often density or heat in the core. Try lightening the breath while keeping the depth—notice if intensity can coexist with ease."
  },

  'sun-venus-conjunction': {
    essence: "When the core self and the heart's desires occupy the same space, there's a quality of beauty seeking expression through everything. Identity and love become interwoven—what draws you and who you're becoming feel inseparable. This fusion can create natural artistic grace, and it can also mean needing love to feel fully real. The spectrum runs from radiant self-expression to dependency on being seen.",
    coreQuestion: "What happens when I rest in my own warmth without reaching outward?",
    elementalDynamic: "Fire identity merged with Water-Air heart",
    shadowExpression: "When unconscious: collapsing self-worth into being desired, performing charm rather than expressing it, losing the boundary between loving and being loved",
    giftExpression: "When integrated: creating beauty as a natural extension of being, loving without needing to merge, allowing others to witness without requiring their approval",
    practicePrompt: "Notice what you love about yourself that has nothing to do with how others see you. What remains when you're not being witnessed?",
    bodyAwareness: "There may be a pull toward pleasing that lives in the chest or throat. Try standing in your own warmth for a moment before reaching outward—notice what shifts."
  },

  'sun-venus-opposition': {
    essence: "A dialogue between self and other plays out across this axis—identity on one side, relationship on the other. There's often profound relational wisdom here, along with the challenge of seeing oneself most clearly through others' eyes. The work isn't choosing sides but learning that love doesn't require erasure, and selfhood doesn't require withdrawal.",
    coreQuestion: "What would it mean to stay whole while fully connecting?",
    elementalDynamic: "Fire identity reflecting across to Water-Air receptivity",
    shadowExpression: "When unconscious: projecting unlived qualities onto partners, defining self entirely through relationship status, oscillating between merger and isolation",
    giftExpression: "When integrated: understanding the dance between autonomy and intimacy, being fully present without losing center, holding both self and other with equal tenderness",
    practicePrompt: "When alone, what parts of yourself become more accessible? What parts seem to only emerge in relationship? Notice without judging.",
    bodyAwareness: "Feel the space between your heart and another's. Practice maintaining your own center while staying open—neither pulling in nor pushing away."
  },

  'sun-venus-trine': {
    essence: "There's a natural flow between who you're becoming and what you love. Charm tends to emerge without effort here—not as performance but as a quality of presence. The ease is genuine, which makes the work less about integration and more about conscious stewardship. What comes naturally can be taken for granted or directed toward something meaningful.",
    coreQuestion: "How might this natural grace serve something beyond personal comfort?",
    elementalDynamic: "Fire and Water-Air in effortless flow",
    shadowExpression: "When unconscious: coasting on likability, avoiding depth because surface connections come so easily, never testing whether the gift can hold weight",
    giftExpression: "When integrated: using natural magnetism to create beauty and connection that serves others, conscious appreciation for ease rather than entitlement to it",
    practicePrompt: "What would you create or offer if charm alone wasn't enough? What might be calling you beyond the easy path?",
    bodyAwareness: "Notice how naturally relaxation comes in social settings. This ease is genuine—feel it, honor it, and consider where you might direct it more consciously."
  },

  'sun-venus-square': {
    essence: "Friction lives here between self-expression and desire, between what attracts you and what you're becoming. What you want and who you are may not always agree—you might be drawn toward what doesn't serve growth, or the authentic self might feel unworthy of love. This tension can create profound depth: learning to love yourself through the struggle rather than around it.",
    coreQuestion: "What becomes possible when I stop choosing between being myself and being loved?",
    elementalDynamic: "Fire identity challenged by Water-Air desires",
    shadowExpression: "When unconscious: self-rejection, choosing partners who can't see you, sacrificing authentic expression for approval, believing love must be earned through performance",
    giftExpression: "When integrated: genuine self-acceptance that came the hard way, attracting those who love realness over polish, knowing the difference between compromise and abandonment",
    practicePrompt: "Where might you have abandoned yourself for love? What would choosing both yourself AND connection look like?",
    bodyAwareness: "Notice the tension between wanting to reach out and wanting to hold your ground. Feel both impulses without immediately choosing—let them coexist."
  },

  'sun-venus-sextile': {
    essence: "A gentle supportive angle between identity and love. Creative opportunities tend to flow through relationships, and authentic expression naturally attracts aligned support. This isn't the intense fusion of conjunction or the productive friction of square—more like quiet compatibility between who you're becoming and what you value.",
    coreQuestion: "How might this natural ease be cultivated into something more deliberate?",
    elementalDynamic: "Fire and Water-Air in supportive resonance",
    shadowExpression: "When unconscious: undervaluing gifts that came without struggle, not pushing creative edges, settling for pleasant rather than profound",
    giftExpression: "When integrated: effortless diplomacy in service of real connection, natural artistic sensibility channeled with intention, creating harmony without sacrificing authenticity",
    practicePrompt: "What creative or relational possibility might be waiting just beyond your comfort zone? What gentle risk is worth taking?",
    bodyAwareness: "Feel the subtle openness in the heart area—a readiness to connect without grasping. Notice what invitations this openness seems to attract."
  },

  // ============== SUN-MERCURY ASPECTS ==============

  'sun-mercury-conjunction': {
    essence: "When consciousness and thought occupy the same space, there's often a seamlessness between thinking and being. Ideas feel personal; communication becomes an extension of identity rather than a tool used by it. This can create powerful self-expression and articulacy, and it can also mean difficulty seeing thought patterns as separate from self. The spectrum runs from inspired self-articulation to identification with every passing idea.",
    coreQuestion: "What remains when thoughts quiet down? Who's doing the thinking?",
    elementalDynamic: "Fire identity merged with Air mind",
    shadowExpression: "When unconscious: over-identifying with thoughts, believing 'I am what I think,' difficulty entertaining perspectives that threaten self-concept",
    giftExpression: "When integrated: natural alignment between intention and expression, ability to articulate inner experience clearly, thoughts that serve rather than define",
    practicePrompt: "Notice a thought arising. Before identifying with it, can you observe who's noticing? What's the relationship between thinker and thought?",
    bodyAwareness: "There may be a lot of energy in the head. Try dropping attention into the body while thinking—notice if thoughts can continue without the usual intensity."
  },

  'sun-mercury-opposition': {
    essence: "A dialogue plays out between identity and perspective, between who you're becoming and how you see and communicate. Thoughts may feel like they come from somewhere other than 'you'—partners, teachers, the collective voice. The work is recognizing that this dialogue creates objectivity: the ability to think about thinking, to see your own patterns from the outside.",
    coreQuestion: "How do I honor both my knowing and my questioning?",
    elementalDynamic: "Fire identity in dialogue with Air perspective",
    shadowExpression: "When unconscious: mental paralysis from seeing too many sides, outsourcing opinions to others, thinking what others expect rather than what's true",
    giftExpression: "When integrated: genuine objectivity about self and situation, ability to mediate between perspectives, thinking that serves relationship without losing personal truth",
    practicePrompt: "When you hold two opposing views, can you find the place that holds both? What knows more than either position alone?",
    bodyAwareness: "Notice where opinions live in the body versus where knowing lives. Is there a difference in texture or location?"
  },

  'sun-mercury-trine': {
    essence: "Natural flow between consciousness and communication. Expression tends to come easily—what you mean and what you say align without great effort. This ease can be directed toward meaningful articulation, or it can mean never developing the muscle of wrestling with difficult ideas. The gift is fluency; the work is choosing what deserves that fluency.",
    coreQuestion: "What would be worth saying if it didn't come easily?",
    elementalDynamic: "Fire and Air in natural harmony",
    shadowExpression: "When unconscious: glib communication that lacks depth, avoiding ideas that require struggle, confusing ease of expression with truth of expression",
    giftExpression: "When integrated: authentic self-expression that makes complex things accessible, using natural articulation to illuminate rather than impress",
    practicePrompt: "Consider something you find hard to articulate—something that matters but resists easy words. What would it take to stay with that difficulty?",
    bodyAwareness: "Notice the ease in your throat and chest when speaking comes naturally. Now notice what happens when you encounter an idea that stops that flow."
  },

  'sun-mercury-square': {
    essence: "Friction between identity and intellect—what you know and who you're becoming don't always align smoothly. There may be a sense of thinking against yourself, or ideas that challenge self-concept. This friction can create profound intellectual depth: the mind sharpened by having to work for clarity. What comes hard often holds more weight.",
    coreQuestion: "What truth am I avoiding because it complicates my self-image?",
    elementalDynamic: "Fire identity challenged by Air analysis",
    shadowExpression: "When unconscious: mental self-criticism, using intellect as a weapon against self, nervous thinking that never settles",
    giftExpression: "When integrated: hard-won clarity that holds up under pressure, mind capable of genuine self-examination, thinking that doesn't flinch from uncomfortable truths",
    practicePrompt: "Notice when your thinking turns against you. What if that critical voice is trying to protect something? What would it be protecting?",
    bodyAwareness: "There may be tension in the jaw, neck, or shoulders when thinking gets difficult. Try softening these areas and noticing if the thoughts change quality."
  },

  'sun-mercury-sextile': {
    essence: "A supportive angle between consciousness and communication. Opportunities for self-expression tend to appear when needed, and there's usually enough mental clarity to take advantage of them. This isn't the seamless fusion of conjunction or the generative friction of square—more like a reliable alliance between self and mind.",
    coreQuestion: "What opportunities for meaningful expression am I not quite reaching for?",
    elementalDynamic: "Fire and Air in supportive resonance",
    shadowExpression: "When unconscious: not fully using available clarity, letting good ideas remain unspoken, settling for adequate expression when excellent is possible",
    giftExpression: "When integrated: reliably clear self-expression, ability to find the right words when they matter, mind as a tool that serves becoming",
    practicePrompt: "What do you know that you haven't said? What understanding is waiting for the right moment to be shared?",
    bodyAwareness: "Notice the subtle readiness to speak when you have something to say. This is different from compulsion—feel the choice that exists in that readiness."
  },

  // ============== MOON ASPECTS ==============

  'moon-saturn-square': {
    essence: "Emotion learned through limitation. Feelings may be experienced fully, but there's often an early sense that they required management, that vulnerability was risk. This can create deep emotional intelligence—and also a tendency to over-discipline inner needs. The work is softening the inner authority enough to let water flow.",
    coreQuestion: "Can I honor my feelings without needing to control them?",
    elementalDynamic: "Water emotion contained by Earth structure",
    shadowExpression: "When unconscious: emotional suppression disguised as maturity, difficulty receiving care, the inner critic extending into the feeling world",
    giftExpression: "When integrated: emotional resilience that's been earned, the capacity to stay present through difficult feelings, wisdom about the relationship between feeling and form",
    practicePrompt: "Notice when you manage a feeling instead of feeling it. What would it be like to let it flow without controlling where it goes?",
    bodyAwareness: "There may be tightness around the chest or throat when emotions want to move. Try softening there while staying present—notice what shifts."
  },

  'moon-saturn-conjunction': {
    essence: "The wise elder living in the emotional body. Feelings carry weight, authority, longevity here—processing happens deeply, not lightly. Where others feel and release, there's feeling and integrating. This can create profound presence for others' pain, and it can also mean accumulating heaviness over time.",
    coreQuestion: "How do I stay fluid while honoring depth?",
    elementalDynamic: "Water flow structured by Earth banks",
    shadowExpression: "When unconscious: emotional heaviness that becomes depression, difficulty with lightness or play, feelings that get stuck because they're taken too seriously",
    giftExpression: "When integrated: emotional maturity that holds space for what's hard, the capacity to metabolize feeling slowly and thoroughly, presence that others trust with their pain",
    practicePrompt: "What feelings have accumulated that might benefit from release rather than further integration? What would emotional lightness feel like without bypassing depth?",
    bodyAwareness: "Notice where emotional weight settles in the body—often chest, shoulders, or belly. What would happen if you let some of it lift while keeping your ground?"
  },

  'moon-pluto-conjunction': {
    essence: "Emotion at the edge of the abyss. Feelings tend toward volcanic depth here—no casual emotions, no surface reactions. This can create the psychic, the depth psychologist, the one who knows every feeling carries an underworld. The gift: capacity to hold intensity for others. The shadow: forgetting that lightness exists.",
    coreQuestion: "Can I feel deeply without drowning?",
    elementalDynamic: "Water meeting the molten core of transformation",
    shadowExpression: "When unconscious: emotional overwhelm mistaken for depth, intensity that swallows others, difficulty with simple feelings that don't require transformation",
    giftExpression: "When integrated: profound capacity to hold space for what's dark, emotional courage that can go anywhere, the ability to help others face their own depths",
    practicePrompt: "Notice a simple feeling. Can it stay simple? What's the difference between genuine depth and habitual intensity?",
    bodyAwareness: "There's often density or heat in the belly when emotions move. Try letting a feeling be lighter than usual—notice what happens when intensity isn't automatic."
  },

  'moon-pluto-square': {
    essence: "The emotional body as battleground of transformation. Feelings don't just pass through—they transmute. Every deep emotion can trigger a death-rebirth cycle, which creates power and exhaustion. The learning: not every feeling requires full shamanic descent.",
    coreQuestion: "How do I honor intensity without being consumed by it?",
    elementalDynamic: "Water trying to flow while touching volcanic fire",
    shadowExpression: "When unconscious: emotional crises that become addictive, intensity as identity, difficulty with feelings that don't transform",
    giftExpression: "When integrated: hard-won emotional wisdom, the capacity to choose when to go deep and when to stay on the surface, transformation that serves rather than consumes",
    practicePrompt: "When a deep feeling arises, notice: does it actually require transformation, or can it simply be felt and released? What would titration look like?",
    bodyAwareness: "Notice the pull toward intensity when emotions arise. What happens if you let a feeling move through without following it all the way down?"
  },

  // ============== MOON-VENUS ASPECTS ==============

  'moon-venus-conjunction': {
    essence: "When emotional needs and heart's desires occupy the same space, there's often a natural aesthetic sensitivity—an instinct for what feels beautiful, what nourishes, what creates harmony. The emotional nature and the loving nature become interwoven, which can create genuine warmth and also difficulty distinguishing between what feels good and what actually nourishes. The spectrum runs from deeply attuned receptivity to emotional-aesthetic enmeshment.",
    coreQuestion: "What's the difference between what feels good and what truly nurtures?",
    elementalDynamic: "Water feeling merged with Water-Air relating",
    shadowExpression: "When unconscious: confusing pleasure with nourishment, emotional eating or spending, needing the environment to be beautiful to feel safe",
    giftExpression: "When integrated: natural ability to create emotionally nourishing spaces, intuitive sense for what others need to feel loved, creativity rooted in genuine feeling",
    practicePrompt: "Notice when you reach for beauty or comfort. What emotion is underneath? Can you feel the emotion directly without needing to beautify it?",
    bodyAwareness: "There may be a softening through the chest and belly when in harmonious environments. Notice this—and notice what happens when you stay with discomfort instead of soothing it."
  },

  'moon-venus-opposition': {
    essence: "A dialogue between emotional security and relational desire—what you need to feel safe and what you want from love may pull in different directions. This can create sophisticated relational awareness: the ability to see that nurturing oneself and pleasing others require different things. The work is learning to hold both without choosing.",
    coreQuestion: "How do I honor my needs while remaining available to love?",
    elementalDynamic: "Water security across from Water-Air connection",
    shadowExpression: "When unconscious: sacrificing comfort for attractiveness, people-pleasing that leaves you depleted, oscillating between self-care and other-focus",
    giftExpression: "When integrated: graceful negotiation between self-nurturing and relating, ability to love without losing your own needs, teaching others that care flows both ways",
    practicePrompt: "When you're drawn to someone or something, check: is your inner child also fed? What would it look like to hold both your need and your desire?",
    bodyAwareness: "Feel the pull between the belly (security, home) and the heart (reaching toward another). Can both be full at once?"
  },

  'moon-venus-trine': {
    essence: "Natural flow between emotional needs and heart's pleasures. What nurtures you and what you love tend to align without effort—comfort comes easily, relationships feel nourishing rather than draining. This ease can be directed toward creating genuinely healing connections, or it can become taken for granted, a gift never fully developed.",
    coreQuestion: "What might this natural harmony serve beyond my own comfort?",
    elementalDynamic: "Water and Water-Air in natural harmony",
    shadowExpression: "When unconscious: expecting relationships to always feel easy, avoiding the necessary discomforts of growth, confusing comfort with love",
    giftExpression: "When integrated: ability to create genuinely nourishing relationships, emotional intelligence that makes others feel safe, natural artistry rooted in feeling",
    practicePrompt: "Consider a relationship that challenged you. What did you learn there that ease couldn't have taught?",
    bodyAwareness: "Notice the natural relaxation in your body when you're with people you love. This is a gift—feel into how you might offer this quality of ease to others."
  },

  'moon-venus-square': {
    essence: "Friction between emotional security and relational desire—what you need to feel safe may conflict with what attracts you. You might be drawn to what doesn't nourish, or find nurturing relationships somehow unfulfilling. This tension can create depth: learning that love isn't always comfortable, and comfort isn't always love.",
    coreQuestion: "Can I love what nourishes me, and be nourished by what I love?",
    elementalDynamic: "Water security challenged by Water-Air attraction",
    shadowExpression: "When unconscious: choosing partners who can't meet emotional needs, sabotaging comfort for excitement, believing love must hurt to be real",
    giftExpression: "When integrated: ability to tolerate productive discomfort in relationships, love that doesn't require constant ease, honest about the difference between desire and need",
    practicePrompt: "Where have you chosen attraction over nourishment? What would it mean to ask for both?",
    bodyAwareness: "Notice where tension lives when you're attracted to something that doesn't quite feel safe. What is that tension trying to tell you?"
  },

  'moon-venus-sextile': {
    essence: "A supportive angle between emotional needs and relational desires. Opportunities for nourishing connection tend to appear, and there's usually enough emotional-aesthetic intelligence to recognize them. This isn't the fusion of conjunction or the growth-through-friction of square—more like reliable support between feeling and loving.",
    coreQuestion: "What nourishing connections am I not quite reaching for?",
    elementalDynamic: "Water and Water-Air in supportive resonance",
    shadowExpression: "When unconscious: not fully developing natural relational gifts, settling for 'nice' when 'nourishing' is possible",
    giftExpression: "When integrated: ability to create beauty that feeds the soul, relationships that reliably nurture, emotional grace that invites intimacy",
    practicePrompt: "What relationship in your life could become more nourishing with just a little more attention? What small offering might you make?",
    bodyAwareness: "There's often a subtle sense of 'rightness' when emotional and relational needs align. Notice this—it's a compass worth trusting."
  },

  // ============== MOON-MARS ASPECTS ==============

  'moon-mars-conjunction': {
    essence: "When emotional instinct and action impulse occupy the same space, feelings tend to become fuel—there's heat to the emotional nature, a quality of quick response. This can create powerful emotional courage and also volatility: feeling and acting are so fused that there's little pause between them. The spectrum runs from passionate protection to reactive aggression.",
    coreQuestion: "How do I honor my fire without scorching what I love?",
    elementalDynamic: "Water emotion merged with Fire action",
    shadowExpression: "When unconscious: emotional reactivity, conflating anger with other feelings, using action to avoid sitting with difficult emotions",
    giftExpression: "When integrated: powerful emotional courage, ability to protect what matters, passion that fuels rather than destroys",
    practicePrompt: "When a strong feeling arises, can you pause before acting? What's in that pause? What does the feeling need besides action?",
    bodyAwareness: "Notice the heat that rises when feelings are strong. Where does it want to go? What happens if you let it circulate without immediately directing it outward?"
  },

  'moon-mars-opposition': {
    essence: "A dialogue between nurturing and asserting, between the inner child and the inner warrior. Emotional needs may feel at odds with what you're driven to do—pursuing goals might neglect tenderness, while tending to feelings might feel like weakness. The work is recognizing these aren't opposites but partners.",
    coreQuestion: "How do I act from strength while staying tender inside?",
    elementalDynamic: "Water emotion across from Fire drive",
    shadowExpression: "When unconscious: alternating between aggression and collapse, projecting anger onto others, unable to be both soft and strong",
    giftExpression: "When integrated: fierce tenderness, protecting vulnerability with strength, action that serves emotional truth",
    practicePrompt: "When you feel the urge to push forward, check: is there something inside that needs tending first? Can the tender and the fierce coexist?",
    bodyAwareness: "Feel the difference between the soft belly (where vulnerability lives) and the powerful limbs (where action lives). Can you be aware of both simultaneously?"
  },

  'moon-mars-trine': {
    essence: "Natural flow between feeling and doing. Emotions tend to translate into appropriate action without internal conflict—there's instinctive courage, a quality of knowing when to fight and when to nurture. This ease can be directed toward protective action, or it can be taken for granted, the natural fierceness never fully examined.",
    coreQuestion: "What is this natural courage meant to protect?",
    elementalDynamic: "Water and Fire in natural harmony",
    shadowExpression: "When unconscious: impulsive action that feels 'natural' but isn't examined, emotional aggression that's justified as authenticity",
    giftExpression: "When integrated: instinctive protection of what matters, emotional courage that others can rely on, passion that knows when to hold back",
    practicePrompt: "Consider a time you acted quickly from feeling. Was it protective or reactive? How do you tell the difference?",
    bodyAwareness: "Notice how naturally energy moves from feeling to action in your body. This flow is a gift—observe it, and notice what happens when you slow it down deliberately."
  },

  'moon-mars-square': {
    essence: "Friction between emotional needs and action impulse—what you feel and what you want to do may not align easily. There's often internal tension: tenderness competing with fierceness, needs disrupting drives. This friction can create profound emotional-active integration: learning that vulnerability and strength aren't enemies.",
    coreQuestion: "What becomes possible when I stop fighting between soft and strong?",
    elementalDynamic: "Water emotion challenged by Fire drive",
    shadowExpression: "When unconscious: emotional outbursts, passive aggression, action that betrays emotional needs, inability to be both tender and fierce",
    giftExpression: "When integrated: hard-won ability to act from emotional truth, strength that doesn't require hardness, protection that doesn't require violence",
    practicePrompt: "When you feel torn between needing comfort and needing to act, what happens if you honor both? What would it look like to move gently?",
    bodyAwareness: "Notice the tension between wanting to curl inward (protection) and wanting to push outward (action). Feel both impulses without resolving them immediately."
  },

  'moon-mars-sextile': {
    essence: "A supportive angle between emotional nature and action impulse. Opportunities for emotionally-intelligent action tend to appear, and there's usually enough instinctive courage to take them. This isn't the fusion of conjunction or the productive tension of square—more like reliable support between feeling and doing.",
    coreQuestion: "What emotionally-true action am I not quite taking?",
    elementalDynamic: "Water and Fire in supportive resonance",
    shadowExpression: "When unconscious: not fully developing natural emotional courage, holding back when action would serve",
    giftExpression: "When integrated: reliable ability to act in emotionally-appropriate ways, courage that's available when needed, action that serves the heart",
    practicePrompt: "What action has your heart been asking for that you haven't quite taken? What would one small step look like?",
    bodyAwareness: "There's often a sense of readiness when feeling and action align. Notice this—it's different from impulsivity. Feel the choice."
  },

  // ============== MOON-MERCURY ASPECTS ==============

  'moon-mercury-conjunction': {
    essence: "When feeling and thinking occupy the same space, the mind tends to be colored by emotion, and emotions tend to be processed through thought. There's often natural emotional intelligence—an instinct for articulating feeling states. This can create genuine intuitive thinking and deep self-understanding, and it can also mean difficulty separating what you feel from what you think. The spectrum runs from embodied wisdom to anxious overthinking.",
    coreQuestion: "What do I know that I feel, rather than think?",
    elementalDynamic: "Water feeling merged with Air thought",
    shadowExpression: "When unconscious: confusing emotion with fact, thinking your feelings rather than feeling them, anxiety that masquerades as analysis",
    giftExpression: "When integrated: natural ability to articulate emotional experience, intuition that speaks in clear language, mind that serves emotional truth",
    practicePrompt: "Notice a feeling arising. Before thinking about it, can you simply feel it? Then notice: what does it actually know?",
    bodyAwareness: "There may be rapid movement between chest (feeling) and head (thinking). Try staying in one or the other longer—notice what changes."
  },

  'moon-mercury-opposition': {
    essence: "A dialogue between feeling and thinking, between instinct and analysis. The inner child and the inner commentator may pull in different directions—rational thought can dismiss emotional truth, while emotional waves can drown clear thinking. The work is recognizing that feeling and thinking inform each other from their different positions.",
    coreQuestion: "How do I honor what I know emotionally without losing clarity?",
    elementalDynamic: "Water feeling across from Air thought",
    shadowExpression: "When unconscious: intellectualizing emotion away, emotional flooding that prevents clear thought, internal debate between head and heart",
    giftExpression: "When integrated: ability to think about feelings without reducing them, emotional intelligence that includes rather than excludes analysis, holding both knowing",
    practicePrompt: "When a strong feeling comes, can you let it exist before analyzing it? When a clear thought comes, can you check: does the body agree?",
    bodyAwareness: "Feel the pull between head and heart-belly. What happens if you breathe into the space between them without choosing sides?"
  },

  'moon-mercury-trine': {
    essence: "Natural flow between feeling and thinking. Emotional experience tends to find words easily, and thoughts tend to honor emotional reality. There's often genuine emotional intelligence—not just the ability to think about feelings, but an instinct for what feelings mean. This ease can be used for deep self-understanding or taken for granted.",
    coreQuestion: "What might this natural emotional-mental flow serve beyond my own processing?",
    elementalDynamic: "Water and Air in natural harmony",
    shadowExpression: "When unconscious: never developing emotional muscles because processing comes so easily, glib understanding that lacks depth",
    giftExpression: "When integrated: natural ability to help others articulate feeling, emotional wisdom that speaks clearly, thinking that honors rather than dismisses feeling",
    practicePrompt: "Consider a feeling you've easily understood. Is there more to it than you've let yourself explore? What would staying longer reveal?",
    bodyAwareness: "Notice how naturally feeling becomes thought in your system. This is a gift—observe it, and notice when the feeling might want to stay feeling a bit longer."
  },

  'moon-mercury-square': {
    essence: "Friction between feeling and thinking—what you feel and what you think may not align easily. The mind might dismiss emotional truth, or emotions might overwhelm mental clarity. This tension can create depth: learning that feeling and thinking are different kinds of knowing, each with their own wisdom.",
    coreQuestion: "What would it mean for my heart and my head to stop fighting?",
    elementalDynamic: "Water feeling challenged by Air analysis",
    shadowExpression: "When unconscious: anxiety from trying to think feelings away, emotional overwhelm that swamps clear thought, internal war between knowing systems",
    giftExpression: "When integrated: hard-won emotional-mental integration, ability to hold both feeling and thinking as valid, wisdom that knows which to trust when",
    practicePrompt: "Where do your feelings and thoughts conflict? What would it mean to trust both without trying to make them agree?",
    bodyAwareness: "Notice where the tension between feeling and thinking lives in your body. What happens if you soften there without resolving the conflict?"
  },

  'moon-mercury-sextile': {
    essence: "A supportive angle between feeling and thinking. Opportunities for emotional-mental integration tend to appear, and there's usually enough natural intelligence to take them. This isn't the intense fusion of conjunction or the productive friction of square—more like reliable support between heart and head.",
    coreQuestion: "What emotional understanding could use more articulation?",
    elementalDynamic: "Water and Air in supportive resonance",
    shadowExpression: "When unconscious: not fully developing natural emotional intelligence, feelings that could become wisdom but stay vague",
    giftExpression: "When integrated: reliable ability to understand and express emotional experience, head and heart in steady alliance",
    practicePrompt: "What feeling have you not quite put into words? What would naming it more precisely reveal?",
    bodyAwareness: "There's often a subtle sense of alignment when feeling and thinking work together. Notice this—it's a compass worth following."
  },

  // ============== MERCURY ASPECTS ==============

  'mercury-saturn-conjunction': {
    essence: "Thought structured by discipline. Your mind doesn't wander—it builds. Every idea is tested against form, every word carries weight. This makes you a master of depth and precision, but sometimes the inner editor is so strong you forget to think out loud before refining.",
    coreQuestion: "Can I speak before perfecting?",
    elementalDynamic: "Air thought grounded by Earth structure"
  },

  'mercury-uranus-conjunction': {
    essence: "Lightning-fast insight. Your mind doesn't follow linear paths—it leaps, connects, disrupts. You see patterns others miss because you're thinking five steps ahead, three dimensions over. The challenge: slowing down enough to bring others along on the journey of your thought.",
    coreQuestion: "How do I share brilliance without alienating?",
    elementalDynamic: "Air thought electrified by breakthrough vision"
  },

  // ============== MERCURY-VENUS ASPECTS ==============

  'mercury-venus-conjunction': {
    essence: "When thought and heart occupy the same space, communication tends toward grace—there's an aesthetic quality to how ideas form and express. The mind naturally gravitates toward harmony, beauty, relationship. This can create genuine charm and artistic perception, and it can also mean difficulty thinking critically about what you love. The spectrum runs from eloquent diplomacy to thought that bends toward pleasing.",
    coreQuestion: "What do I know that I'm not saying because it might disrupt harmony?",
    elementalDynamic: "Air mind merged with Water-Air heart",
    shadowExpression: "When unconscious: avoiding difficult truths to keep the peace, thinking what others want to hear, confusing pleasant thoughts with true thoughts",
    giftExpression: "When integrated: ability to speak difficult truths beautifully, mind that serves connection without sacrificing honesty, artistic intelligence",
    practicePrompt: "Consider something you've been smoothing over. What would it sound like to speak it clearly while still holding care?",
    bodyAwareness: "Notice how the throat and heart feel when you're about to say something harmonious versus something true. Is there a difference?"
  },

  'mercury-venus-opposition': {
    essence: "A dialogue between thinking and loving, between analysis and appreciation. What you know and what you value may pull in different directions—critical thinking can seem to threaten connection, while relational warmth can cloud clear perception. The work is recognizing that thought and love can inform each other across the distance.",
    coreQuestion: "How do I honor both my discernment and my heart?",
    elementalDynamic: "Air mind in dialogue with Water-Air heart",
    shadowExpression: "When unconscious: thinking your way out of love, loving your way out of clarity, oscillating between cold analysis and warm confusion",
    giftExpression: "When integrated: ability to think clearly about relationships, love that includes rather than excludes understanding, relational wisdom born from holding both",
    practicePrompt: "In a relationship that matters, what do you know but aren't letting yourself feel? What do you feel but aren't letting yourself think?",
    bodyAwareness: "Notice where thinking lives in your body versus where loving lives. Are they in different places? What happens when you invite them into conversation?"
  },

  'mercury-venus-trine': {
    essence: "Natural flow between thought and heart. Communication tends toward ease in relationships—the right words come when needed, and there's often genuine aesthetic sense in how ideas are expressed. This ease can be directed toward creating beauty through language, or it can become glib, charm without substance.",
    coreQuestion: "What depth might this natural grace be avoiding?",
    elementalDynamic: "Air and Water-Air in natural harmony",
    shadowExpression: "When unconscious: using charm instead of truth, smooth communication that lacks weight, pleasantness that avoids necessary friction",
    giftExpression: "When integrated: eloquence in service of genuine connection, ability to make difficult things beautiful, aesthetic intelligence with substance",
    practicePrompt: "What conversation have you been avoiding because it can't be made pleasant? What might happen if you had it anyway?",
    bodyAwareness: "Notice the ease when words flow in relationship. This is a gift—and notice too if that ease ever prevents something harder from being said."
  },

  'mercury-venus-square': {
    essence: "Friction between thinking and loving—what you know and what your heart wants may not align easily. Critical thoughts can disrupt connection, while relational needs can cloud judgment. This tension can create depth: learning to hold both analysis and appreciation, to love with your eyes open.",
    coreQuestion: "Can I think clearly about what I love without diminishing either?",
    elementalDynamic: "Air mind challenged by Water-Air heart",
    shadowExpression: "When unconscious: criticizing what you love, loving what you criticize, internal war between head and heart",
    giftExpression: "When integrated: ability to maintain discernment within devotion, love that doesn't require blindness, thought that doesn't require detachment",
    practicePrompt: "Where has your thinking undermined your loving, or your loving clouded your thinking? What would it mean to hold both without choosing?",
    bodyAwareness: "Feel the tension between the head (where thoughts form) and the heart (where love lives). What happens if you breathe into the space between them?"
  },

  'mercury-venus-sextile': {
    essence: "A supportive angle between mind and heart. Opportunities for graceful communication tend to appear, and there's usually enough aesthetic awareness to take them. This isn't the fusion of conjunction or the productive friction of square—more like reliable support between thinking and relating.",
    coreQuestion: "What graceful expression is waiting just beyond my usual reach?",
    elementalDynamic: "Air and Water-Air in supportive resonance",
    shadowExpression: "When unconscious: not fully developing natural communicative gifts, settling for nice when beautiful is possible",
    giftExpression: "When integrated: reliable ability to find the right words for connection, thought that serves relationship, aesthetic sense available when needed",
    practicePrompt: "What thought could you express more beautifully? What relationship could benefit from more articulate attention?",
    bodyAwareness: "There's often a subtle 'click' when thought and expression align. Notice this—it's a compass for when communication is ready."
  },

  // ============== MERCURY-MARS ASPECTS ==============

  'mercury-mars-conjunction': {
    essence: "When thought and action occupy the same space, there's often sharpness—quick thinking, decisive speech, ideas that want to move. The mind has a cutting edge, words carry force. This can create powerful direct communication and mental courage, and it can also mean speaking before thinking, fighting with words. The spectrum runs from incisive clarity to verbal aggression.",
    coreQuestion: "How do I wield the sharpness of my mind without cutting unnecessarily?",
    elementalDynamic: "Air thought merged with Fire action",
    shadowExpression: "When unconscious: verbal aggression, speaking as combat, thinking weaponized rather than illuminating",
    giftExpression: "When integrated: mental courage that speaks truth directly, decisive communication that clarifies rather than wounds, thought that leads to action",
    practicePrompt: "Notice when your thoughts become sharp. Is the edge needed? What would remain powerful but not cutting?",
    bodyAwareness: "There may be tension in the jaw or quickness in the breath when thoughts heat up. Try softening these while keeping the clarity—notice what changes."
  },

  'mercury-mars-opposition': {
    essence: "A dialogue between thinking and doing, between planning and acting. The mind may hesitate while the body wants to move, or impulsive action may outpace thoughtful consideration. The work is recognizing that thought and action can inform each other: think-then-act, or act-then-reflect, as the situation requires.",
    coreQuestion: "How do I balance reflection and action without getting stuck?",
    elementalDynamic: "Air mind in dialogue with Fire drive",
    shadowExpression: "When unconscious: paralysis between thinking and doing, impulsive action that ignores wisdom, thoughts that never translate into movement",
    giftExpression: "When integrated: strategic mind that knows when to think and when to act, action informed by reflection, reflection that doesn't prevent movement",
    practicePrompt: "Notice a situation where you're overthinking. What action would teach you something thought can't? Notice where you've acted hastily—what reflection might help?",
    bodyAwareness: "Feel the difference between the stillness of thought and the readiness of action in your body. Can you find a place that holds both?"
  },

  'mercury-mars-trine': {
    essence: "Natural flow between thinking and doing. Thoughts tend to translate into action without internal resistance—the mind is decisive, communication is direct. This ease can be directed toward effective, strategic action, or it can become thoughtless impulsivity dressed up as confidence.",
    coreQuestion: "What is this natural decisiveness best used for?",
    elementalDynamic: "Air and Fire in natural harmony",
    shadowExpression: "When unconscious: impulsivity that feels like decisiveness, aggressive communication that's never questioned, action that doesn't pause to consider",
    giftExpression: "When integrated: genuine mental courage, communication that cuts through without wounding, thought that serves action effectively",
    practicePrompt: "Consider a time when quick action served you well and a time when it didn't. What was different? How do you tell?",
    bodyAwareness: "Notice the natural flow from thought to action in your body. This is a gift—observe when it serves and when pausing might serve better."
  },

  'mercury-mars-square': {
    essence: "Friction between thinking and doing—thoughts and actions may not align easily. There can be internal debate, mental energy that feels combative, or a sense that speaking and acting are in conflict. This friction can create sharpened intelligence: the mind that had to fight for clarity often sees more clearly.",
    coreQuestion: "What becomes possible when my thoughts and actions learn to work together?",
    elementalDynamic: "Air mind challenged by Fire drive",
    shadowExpression: "When unconscious: argumentativeness, internal mental combat, thoughts at war with actions, speaking in ways that undermine what you're trying to do",
    giftExpression: "When integrated: hard-won mental clarity, thought that can handle pressure, communication that's been tested and proven",
    practicePrompt: "Where do your thoughts and actions seem at odds? What would alignment look like—not suppressing one, but finding how they serve together?",
    bodyAwareness: "Notice where mental tension lives in your body—often jaw, neck, or hands. What happens if you soften there while staying mentally engaged?"
  },

  'mercury-mars-sextile': {
    essence: "A supportive angle between thinking and doing. Opportunities for effective action tend to arise from thought, and there's usually enough mental energy to follow through. This isn't the intense fusion of conjunction or the productive tension of square—more like reliable support between mind and action.",
    coreQuestion: "What thoughtful action is waiting just beyond my usual reach?",
    elementalDynamic: "Air and Fire in supportive resonance",
    shadowExpression: "When unconscious: not fully using available mental energy, thoughts that could become action but don't quite",
    giftExpression: "When integrated: reliable ability to think-then-act effectively, mental energy available when needed, thought that serves doing",
    practicePrompt: "What thought could become action with just a little more push? What are you waiting for?",
    bodyAwareness: "There's often a sense of readiness when thought is ready to become action. Notice this—it's different from impatience. Feel the choice."
  },

  // ============== VENUS ASPECTS ==============

  'venus-saturn-square': {
    essence: "Love learning through restraint. There's often a quality of taking relationships seriously—too seriously sometimes. Where others play, there's a tendency to build; where others explore, to commit. This can create deep loyalty and devotion, and it can also mean staying in structures long past their usefulness because leaving feels like failure. The friction between desire and duty is the teacher.",
    coreQuestion: "Can I honor commitment without imprisoning connection?",
    elementalDynamic: "Water connection structured by Earth form",
    shadowExpression: "When unconscious: withholding love as self-protection, making relationships into obligations, staying loyal to forms that have lost their life, equating love with duty",
    giftExpression: "When integrated: devotion that has been tested and proven real, commitment that knows its worth, love that can build something lasting without becoming a cage",
    practicePrompt: "Where has restraint protected your heart? Where has it imprisoned it? What would commitment that breathes look like?",
    bodyAwareness: "Notice tension around the heart or throat when love and duty conflict. What happens if you soften there without abandoning either?"
  },

  'venus-pluto-conjunction': {
    essence: "Love and transformation occupy the same space. There's often an intensity to desire—surface affection doesn't satisfy, and connection tends to move toward merging, consuming, alchemizing. Relationships become portals: people come out changed. This can create profound intimacy and it can create power dynamics. The magnetic pull is toward the underworld, toward what lies beneath.",
    coreQuestion: "Can I love without needing to transform?",
    elementalDynamic: "Water love meeting volcanic intensity",
    shadowExpression: "When unconscious: possessiveness, using intimacy as control, intensity that overwhelms rather than connects, confusing depth with domination, destroying what you love to test its loyalty",
    giftExpression: "When integrated: capacity for genuine intimate transformation, love that can witness and hold darkness, the ability to be changed by connection without losing yourself",
    practicePrompt: "What do you want from love's intensity? What would love look like if you didn't need to transform the other, or be transformed?",
    bodyAwareness: "There's often a gravitational pull in the belly or pelvis when this energy activates. Notice what happens when you feel it without acting on it—can you be with intensity without merging?"
  },

  'venus-uranus-square': {
    essence: "Friction between the heart's desire for connection and the soul's need for freedom. There's often a craving for intimacy that simultaneously resists constraint—wanting closeness but needing space to breathe, to change, to become. This isn't commitment-phobia but a genuine need for relationships that honor evolution over expectation. The tension can create breakthrough or breakup.",
    coreQuestion: "Can I commit without losing my wings?",
    elementalDynamic: "Water seeking flow through Air liberation",
    shadowExpression: "When unconscious: sabotaging relationships when they become too stable, using freedom as escape from intimacy, sudden departures that wound, mistaking disruption for growth",
    giftExpression: "When integrated: creating relationships that breathe and evolve, commitment that includes freedom, intimacy that doesn't require stagnation, pioneering new forms of connection",
    practicePrompt: "When has stability felt like a cage? When has freedom felt like abandonment? What would intimacy look like if it included room to change?",
    bodyAwareness: "Notice the restlessness that arises when connection starts to feel confining. Where does it live in your body? What does it actually need?"
  },

  // ============== VENUS-MARS ASPECTS ==============

  'venus-mars-conjunction': {
    essence: "When desire and drive occupy the same space, there's often magnetic intensity—attraction becomes action, wanting becomes pursuing. The lover and the warrior are fused. This can create passionate presence and powerful creative-sexual energy, and it can also mean difficulty distinguishing between genuine connection and conquest. The spectrum runs from vital aliveness to compulsive pursuit.",
    coreQuestion: "What's the difference between passion that creates and passion that consumes?",
    elementalDynamic: "Water-Air attraction merged with Fire drive",
    shadowExpression: "When unconscious: confusing conquest with connection, compulsive pursuit, difficulty being still in love, aggression disguised as passion",
    giftExpression: "When integrated: vital creative energy, ability to pursue what matters with full presence, passion that serves rather than consumes, magnetic authenticity",
    practicePrompt: "Notice when desire becomes urgency. What happens if you pause in the heat? What does wanting feel like when you're not moving toward it?",
    bodyAwareness: "There's often heat and aliveness when attraction and action merge. Notice where this lives in your body—and what happens when you contain it rather than express it."
  },

  'venus-mars-opposition': {
    essence: "A dialogue between receptivity and assertion, between drawing in and reaching out. What you want and how you pursue it may pull in different directions—aggressive pursuit can scare away what you desire, while pure receptivity can miss what requires action. The work is knowing when to attract and when to pursue.",
    coreQuestion: "How do I know when to reach and when to receive?",
    elementalDynamic: "Water-Air receptivity across from Fire assertion",
    shadowExpression: "When unconscious: pursuing what you don't want, attracting what you won't pursue, oscillating between aggression and passivity in relationships",
    giftExpression: "When integrated: sophisticated understanding of the dance between active and receptive, knowing when to move and when to draw in, relational wisdom that includes both",
    practicePrompt: "In a desire that matters, have you been too active or too receptive? What would the opposite approach reveal?",
    bodyAwareness: "Feel the difference between reaching toward something and opening to receive it. Where does each live in your body? What would balancing them feel like?"
  },

  'venus-mars-trine': {
    essence: "Natural flow between desire and drive. Attraction tends to know how to pursue itself, and pursuit tends to be attractive. There's often charisma here—the ease of someone whose wanting and doing are aligned. This can create genuine magnetism and creative vitality, or it can become unexamined pursuit that never questions its desires.",
    coreQuestion: "What might this natural ease serve beyond personal gratification?",
    elementalDynamic: "Water-Air and Fire in natural harmony",
    shadowExpression: "When unconscious: never questioning what you want or how you get it, assuming desires are always valid, ease that hasn't been tested",
    giftExpression: "When integrated: genuine charisma in service of something real, creative-erotic energy channeled consciously, desire and action aligned with values",
    practicePrompt: "Consider what you want easily—is it what you truly value? What desire might be worth developing that doesn't come naturally?",
    bodyAwareness: "Notice the natural alignment between wanting and moving toward. This is a gift—feel where it lives, and consider what it's for."
  },

  'venus-mars-square': {
    essence: "Friction between desire and drive—what you want and how you go after it may not align easily. Attraction and action can work at cross-purposes: aggressive pursuit may undermine connection, while relational receptivity may feel like weakness. This tension can create depth: learning that love and strength are not opposites.",
    coreQuestion: "What becomes possible when desire and drive learn to work together?",
    elementalDynamic: "Water-Air attraction challenged by Fire assertion",
    shadowExpression: "When unconscious: sabotaging what you want through how you pursue it, passivity masking frustrated desire, aggression that can't receive",
    giftExpression: "When integrated: desire that's learned the right pace, assertion that doesn't destroy connection, strength that can be tender",
    practicePrompt: "Where have your wanting and your pursuing been at odds? What would it look like for them to inform rather than fight each other?",
    bodyAwareness: "Notice tension between heart (desire) and gut/limbs (action). What happens if you let both speak without trying to resolve them?"
  },

  'venus-mars-sextile': {
    essence: "A supportive angle between desire and drive. Opportunities for aligned pursuit tend to appear—attraction knows how to become action, and action tends to be attractive enough. This isn't the intense fusion of conjunction or the productive friction of square—more like reliable support between wanting and doing.",
    coreQuestion: "What desire could be pursued more deliberately?",
    elementalDynamic: "Water-Air and Fire in supportive resonance",
    shadowExpression: "When unconscious: not fully using available creative-relational energy, desires that stay passive when action would serve",
    giftExpression: "When integrated: reliable ability to pursue what matters gracefully, creative energy available when needed, attraction and action in steady alliance",
    practicePrompt: "What do you want that could use a little more active pursuit? What action has been waiting for a clearer desire to motivate it?",
    bodyAwareness: "There's often a sense of readiness when desire and drive align. Notice this—it's an invitation to move."
  },

  // ============== MARS ASPECTS ==============

  'mars-saturn-square': {
    essence: "Will meeting wall. There's often a quality of action requiring extra push—not because the world is inherently against, but because drive is being trained toward precision rather than impulse. Every resistance becomes a teacher. This friction can create frustration and suppressed anger, and it can forge patient, disciplined power that knows how to work with time.",
    coreQuestion: "How do I assert with patience?",
    elementalDynamic: "Fire action disciplined by Earth constraint",
    shadowExpression: "When unconscious: suppressed rage that leaks sideways, inaction disguised as patience, aggression toward authority or toward self, believing effort is punishment",
    giftExpression: "When integrated: endurance that serves long-term goals, action refined by patience, the ability to push through resistance without burning out, mastery earned through time",
    practicePrompt: "Where do you feel blocked in your drive? Is the obstacle external or internal? What would patient assertion look like rather than frustrated force?",
    bodyAwareness: "Notice where frustration accumulates—often shoulders, jaw, or lower back. What happens if you breathe into the resistance rather than fighting it?"
  },

  'mars-pluto-conjunction': {
    essence: "Will and transformational power fused. When action arises, it tends to carry volcanic intensity—not casual force but something that can shift realities. There's often a quality of all-or-nothing: relentless when engaged, capable of scorching what's in the way. This can create unstoppable drive toward meaningful change, and it can become destructive when unconscious of its own power.",
    coreQuestion: "How do I wield power without destruction?",
    elementalDynamic: "Fire action merged with transformational intensity",
    shadowExpression: "When unconscious: overwhelming force, power used for domination, destruction that feels like strength, inability to moderate intensity, burning bridges to feel powerful",
    giftExpression: "When integrated: transformational will in service of regeneration, power that knows when to hold and when to unleash, intensity channeled toward what genuinely needs to change",
    practicePrompt: "When has your intensity created something and when has it destroyed? What would it look like to wield this power consciously, with choice about when to unleash?",
    bodyAwareness: "There's often a volcanic quality—heat in the belly or chest that wants release. Notice what happens when you contain it consciously rather than suppressing or releasing automatically."
  },

  'mars-pluto-square': {
    essence: "Friction between will and power, between action and transformation. There's often a quality of negotiating with forces that feel larger than individual will—and being strengthened by the negotiation. Power struggles become teachers. This can create the warrior who learns sovereignty through facing what wants to dominate, or it can become endless combat with invisible enemies.",
    coreQuestion: "Can I be powerful without battling?",
    elementalDynamic: "Fire will meeting the volcanic heart of transformation",
    shadowExpression: "When unconscious: compulsive power struggles, seeing enemies everywhere, fighting shadows that are actually internal, aggression triggered by feeling controlled",
    giftExpression: "When integrated: will that has been tested and proven real, ability to face overwhelming forces without being destroyed, power earned through confronting what would dominate",
    practicePrompt: "What are you actually fighting? When you look closely, is the battle external or internal? What would power look like if it didn't require an enemy?",
    bodyAwareness: "Notice the tension that arises when power feels challenged—often in the jaw, gut, or fists. What happens if you feel your own strength without needing to prove it against something?"
  },

  // ============== JUPITER ASPECTS ==============

  'jupiter-saturn-conjunction': {
    essence: "Vision and form occupy the same space. There's often a quality of dreaming big and building real—expansive possibility grounded in disciplined execution. Where others choose between inspiration and structure, this energy weaves both. This can create sustainable systems and meaningful architecture, and it can create paralysis when vision and limitation argue for dominance.",
    coreQuestion: "How do I honor both vision and form?",
    elementalDynamic: "Fire expansion structured by Earth discipline",
    shadowExpression: "When unconscious: dreams that never land because form feels limiting, structure that strangles possibility, oscillating between grandiose vision and crushing doubt",
    giftExpression: "When integrated: the ability to build something lasting that also serves expansion, vision grounded in realistic steps, structures that support rather than contain growth",
    practicePrompt: "Where have vision and structure been allies in your life? Where have they seemed like enemies? What would it look like to let each inform the other?",
    bodyAwareness: "Notice the tension between expansion (often chest opening) and contraction (often core tightening). What happens if you hold both without collapsing into either?"
  },

  'jupiter-saturn-square': {
    essence: "Friction between expansion and limitation. The mountain peak is visible (Jupiter) but the climb required keeps asserting itself (Saturn). This tension can feel frustrating—growth meeting resistance at every turn. And this friction refines: teaching that true growth happens through constraint, that sustainable expansion requires structure, that bigger isn't always better.",
    coreQuestion: "Can I be patient with my own becoming?",
    elementalDynamic: "Fire vision learning from Earth timing",
    shadowExpression: "When unconscious: chronic frustration with pace of growth, dismissing limits as unnecessary, or shrinking possibility to avoid disappointment, pessimism disguised as realism",
    giftExpression: "When integrated: expansive vision refined by realistic assessment, growth that endures because it was earned, the wisdom that meaningful things take time",
    practicePrompt: "Where has limitation actually served your growth? Where has it been a genuine obstacle? How do you tell the difference?",
    bodyAwareness: "Notice the push-pull between wanting to expand and feeling held back. Where do these live in your body? What happens when you stop trying to resolve the tension?"
  },

  'jupiter-uranus-conjunction': {
    essence: "Vision and breakthrough occupy the same space. There's often an optimism that isn't about maintaining status quo but shattering it—seeing possibilities beyond conventional thought. This can create revolutionary teaching, liberation through expanded vision, genius that opens new territory. It can also create destabilizing enthusiasm for disruption without regard for what's being disrupted.",
    coreQuestion: "How do I innovate without destabilizing?",
    elementalDynamic: "Fire expansion electrified by Air awakening",
    shadowExpression: "When unconscious: breakthrough addiction, change for change's sake, alienating others with unconventional vision, abandoning what works for what's exciting",
    giftExpression: "When integrated: vision that opens genuine new territory, the ability to help others see beyond their limits, breakthrough in service of growth rather than disruption",
    practicePrompt: "When has breakthrough served genuine expansion, and when has it been disruption for its own sake? What's the difference in how they feel?",
    bodyAwareness: "There's often an electric quality—excitement that wants to leap forward. Notice what this feels like. Can you contain it consciously, choosing when to unleash?"
  },

  'jupiter-neptune-conjunction': {
    essence: "Vision and boundlessness occupy the same space. There's often a quality of experiencing transcendence rather than just believing in it—infinite compassion meeting infinite possibility. This can create mystical vision, artistic channeling, genuine connection to grace. It can also create vision so vast it lacks edges, so boundless it can't land in form, spiritual bypassing at grand scales.",
    coreQuestion: "How do I bring the infinite into the finite?",
    elementalDynamic: "Fire vision dissolving into Water boundlessness",
    shadowExpression: "When unconscious: grandiose spiritual fantasy, compassion that avoids real engagement, vision unmoored from ground, escapism dressed as transcendence",
    giftExpression: "When integrated: genuine spiritual vision that can touch ground, compassion that includes reality, the ability to channel vastness into something others can access",
    practicePrompt: "When has expansive vision served genuine connection, and when has it been escape? What would grounded transcendence look like?",
    bodyAwareness: "There's often a quality of expanding beyond edges—sometimes blissful, sometimes disorienting. Can you feel your body even when touching vastness?"
  },

  'jupiter-pluto-conjunction': {
    essence: "Vision and transformation fused. Growth tends to be alchemical—every expansion requires something to die, every breakthrough demands leaving something behind. There's often magnetic power here: the ability to inspire massive shifts through embodied evolution. This can create genuine transformation at scale, and it can become consuming ambition that mistakes power for meaning.",
    coreQuestion: "Can I expand without consuming?",
    elementalDynamic: "Fire growth fueled by volcanic transformation",
    shadowExpression: "When unconscious: power-hunger disguised as vision, transformation weaponized for dominance, consuming everything in the name of growth, believing ends justify means",
    giftExpression: "When integrated: vision that catalyzes genuine transformation, power in service of evolution not ego, the ability to help others die to what's outgrown",
    practicePrompt: "When has transformation served growth, and when has it been about power? What's the difference in how they feel in your body?",
    bodyAwareness: "There's often a sense of magnitude—something large moving through. Notice this quality. Is it serving something beyond itself?"
  },

  // ============== OUTER PLANET ASPECTS ==============

  'saturn-uranus-square': {
    essence: "Friction between structure and revolution. Part wants stability, mastery through time; another part wants to break free, innovate, shatter convention. This tension creates both builder and disruptor—the capacity to create new systems rather than just destroy old ones or maintain tired structures. The generational dimension adds collective weight to this personal friction.",
    coreQuestion: "Can I revolutionize responsibly?",
    elementalDynamic: "Earth structure meeting Air awakening",
    shadowExpression: "When unconscious: rebellion that destroys without building, or rigidity that blocks all innovation, chronic frustration with pace of change, feeling personally responsible for collective stagnation",
    giftExpression: "When integrated: the ability to build structures that include room for evolution, innovation grounded in sustainable form, breaking what needs breaking while preserving what serves",
    practicePrompt: "Where do you feel the tension between stability and change? What would responsible revolution look like—honoring both the need for structure and the need for breakthrough?",
    bodyAwareness: "Notice where the old and new seem to fight in your body—often a push-pull between grounded stability and restless innovation. What happens when you hold both?"
  },

  'saturn-neptune-square': {
    essence: "Friction between form and formlessness. There's often a quality of trying to build something real while connected to something infinite—the spiritual practitioner learning discipline, the artist meeting deadlines, the mystic living in a body. This tension can create disillusionment when reality disappoints the dream, and it can create grounded spirituality that actually touches ground.",
    coreQuestion: "How do I honor both structure and surrender?",
    elementalDynamic: "Earth form trying to contain Water boundlessness",
    shadowExpression: "When unconscious: cynicism when dreams meet reality, escapism when structure feels too limiting, spiritual bypassing or harsh materialism, chronic disappointment",
    giftExpression: "When integrated: spirituality that can meet deadlines, art that serves function, mysticism grounded in practical life, structures that serve rather than block transcendence",
    practicePrompt: "Where has the tension between dream and reality served your growth? Where have you collapsed into one pole or the other?",
    bodyAwareness: "Notice when you feel pulled between grounding and dissolving. Where does each impulse live? What would holding both feel like?"
  },

  'saturn-pluto-conjunction': {
    essence: "Structure and transformation fused. There's often an understanding of power that comes from facing its shadow—how systems can oppress, how structure can trap, how authority can crush. This knowing, when integrated, creates capacity to build forms that serve transformation rather than prevent it. Heavy, essential work with collective dimensions.",
    coreQuestion: "How do I create structures for liberation?",
    elementalDynamic: "Earth form merged with volcanic transformation",
    shadowExpression: "When unconscious: becoming the oppression you understand too well, authoritarian control justified by knowing better, crushing transformation in the name of stability",
    giftExpression: "When integrated: structures designed for liberation, authority that serves rather than dominates, understanding of power that comes from having faced its darkness",
    practicePrompt: "What have you learned about power by facing its shadow? How can that understanding serve building rather than blocking?",
    bodyAwareness: "There's often a sense of heaviness or pressure with this energy—the weight of understanding how power works. Notice this. Can you carry it without being crushed?"
  },

  'uranus-neptune-conjunction': {
    essence: "Breakthrough and boundlessness merged—a generational signature. This carries the frequency of innovation meeting mysticism, technology meeting transcendence. The personal work is grounding this collective frequency into something accessible. This can create visionary art, spiritual technology, dreams that break boundaries, and it can create confusion about what's personal versus collective.",
    coreQuestion: "How do I channel collective awakening into form?",
    elementalDynamic: "Air awakening merged with Water dissolution",
    shadowExpression: "When unconscious: confusing collective awakening with personal specialness, spiritual escapism through technological overwhelm, dissolution disguised as breakthrough",
    giftExpression: "When integrated: grounding collective vision into accessible form, bridges between technology and transcendence, innovation that serves awakening",
    practicePrompt: "What generational frequency are you carrying? How do you ground it into something that serves rather than overwhelms?",
    bodyAwareness: "There's often a quality of vastness that doesn't feel entirely personal. Notice what belongs to you and what you're carrying for others."
  },

  'uranus-pluto-conjunction': {
    essence: "Breakthrough and transformation merged—revolutionary upheaval as generational signature. Born during massive collective change, carrying that frequency in the cells. The personal work is learning to disrupt and regenerate consciously, burning down what no longer serves while building what can endure. Phoenix energy with collective dimensions.",
    coreQuestion: "How do I transform without destroying?",
    elementalDynamic: "Air awakening merged with volcanic rebirth",
    shadowExpression: "When unconscious: destruction for its own sake, believing personal upheaval is world-changing, intensity addiction, confusing chaos with transformation",
    giftExpression: "When integrated: regenerative disruption that serves life, breakthrough that leaves something better in its wake, embodying transformation in ways that help rather than traumatize",
    practicePrompt: "What collective upheaval do you carry? How do you channel transformational intensity into creation rather than destruction?",
    bodyAwareness: "There's often a sense of pressure to transform, to break through. Notice this quality. Can you hold it without acting on it compulsively?"
  },

  'neptune-pluto-conjunction': {
    essence: "Boundlessness and transformation merged across generations—mystical death-rebirth as collective signature. This frequency knows that everything must dissolve before it can be reborn into truer form. The personal work is serving dissolution consciously rather than being swept away by it. Deep, slow, vast energy that moves across lifetimes.",
    coreQuestion: "How do I serve the dissolution consciously?",
    elementalDynamic: "Water boundlessness merged with volcanic transformation",
    shadowExpression: "When unconscious: being swept away by collective dissolution, nihilism disguised as transcendence, losing personal ground in vast transformation, spiritual drowning",
    giftExpression: "When integrated: conscious participation in cycles of spiritual death-rebirth, serving the dissolution of what needs to end, grounded presence while vast changes move through",
    practicePrompt: "What is dissolving in your lifetime that needed to end? How do you serve that dissolution without losing yourself in it?",
    bodyAwareness: "There's often a sense of vastness and depth that exceeds personal scale. Notice this quality. Can you feel your own body while also sensing what moves through all of us?"
  },
};

/**
 * Extract aspect information from birth chart data
 * Returns array of {planet1, planet2, aspectType} for synthesis
 */
export function extractAspectsFromChart(chartData: any): Array<{
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  orb: number;
}> {
  if (!chartData?.aspects) return [];

  return chartData.aspects
    .filter((a: any) => a.planet1 && a.planet2 && a.type)
    .map((a: any) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      aspectType: normalizeAspectType(a.type),
      orb: a.orb || 0
    }));
}

/**
 * Normalize aspect type names (handle variations in chart data)
 */
function normalizeAspectType(type: string): AspectType {
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('conjunc')) return 'conjunction';
  if (normalized.includes('oppos')) return 'opposition';
  if (normalized.includes('trine')) return 'trine';
  if (normalized.includes('square') || normalized === '□') return 'square';
  if (normalized.includes('sextile')) return 'sextile';
  if (normalized.includes('quincunx') || normalized.includes('inconjunct')) return 'quincunx';
  return 'conjunction'; // fallback
}

/**
 * Find most relevant aspect based on user query
 * Returns null if no clear match
 */
export function findRelevantAspect(
  userQuery: string,
  aspects: Array<{planet1: string; planet2: string; aspectType: AspectType}>
): {planet1: string; planet2: string; aspectType: AspectType} | null {
  const query = userQuery.toLowerCase();

  // Look for planet names in query
  for (const aspect of aspects) {
    const p1 = aspect.planet1.toLowerCase();
    const p2 = aspect.planet2.toLowerCase();
    const aspectType = aspect.aspectType;

    // Check if both planets mentioned
    if (query.includes(p1) && query.includes(p2)) {
      // Check if aspect type mentioned
      if (query.includes(aspectType) ||
          query.includes('□') && aspectType === 'square' ||
          query.includes('△') && aspectType === 'trine') {
        return aspect;
      }
      // If planets mentioned without specific aspect, return first match
      return aspect;
    }
  }

  return null;
}
