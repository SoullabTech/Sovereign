/**
 * Canonical Elemental Facet Registry
 *
 * Single source of truth for all 15 facets (5 elements × 3 phases).
 * Based on Kelly Nezat's Elemental Alchemy and Edward Steinbrecher's
 * Inner Guide Meditation tradition.
 *
 * Fire → Water → Earth → Air → Fire (spiral)
 * Aether mediates across all elements.
 */

import type { Facet, FacetId } from './types';

export const FACETS: Record<FacetId, Facet> = {
  // ═══════════════════════════════════════════════════════════════════
  // WATER — Feeling, descent, encounter
  // ═══════════════════════════════════════════════════════════════════

  water_1: {
    id: 'water_1',
    element: 'Water',
    phase: 1,
    title: 'The Stirring',
    coreTheme: 'Something in the emotional body begins to move and call for attention.',
    psychologicalFunction: 'Awakening to feeling before it has fully formed into image or narrative.',
    developmentalTask: 'Notice and allow the first movements of authentic feeling without shutting them down.',
    commonSigns: ['subtle unease or tenderness', 'tears near the surface', 'feeling off without knowing why', 'increased sensitivity'],
    distortions: ['emotional numbing', 'rational override', 'distraction', 'dissociation from feeling'],
    archetype: { primary: 'The Listener at the Threshold', shadow: 'The Sealed One', framing: 'The psyche first signals that something deeper is alive. The work is receptivity.' },
    tarot: { suit: 'Cups', cards: ['Ace of Cups', 'Page of Cups', '2 of Cups', 'Moon'], interpretation: 'Feeling-tone begins to emerge and asks for kind attention.' },
    astrology: { planets: ['Moon', 'Venus', 'Neptune'], domains: ['4th house', '7th house', '12th house edge'], summary: 'The soul communicates through feeling-tone and relational sensitivity.' },
    encounterTypes: [
      { type: 'elemental', title: 'Gentle Water Messenger', description: 'A delicate water presence, easy to dismiss.', function: 'Signals that the emotional field is opening.' },
      { type: 'instinctive', title: 'Animal Threshold Guide', description: 'A quiet animal presence near water.', function: 'Helps the meditator trust first feeling without forcing meaning.' },
    ],
    guide: { role: 'Sensitizer of perception', mode: ['gentle', 'receptive', 'subtle'], appearance: ['moonlit child', 'quiet companion', 'small animal by a spring'] },
    meditationPrompt: 'Ask: What in me is beginning to be felt? Stay with the first signal without forcing interpretation.',
    dialoguePrompts: ['What feeling is just beginning to rise?', 'What soft truth is asking for my attention?', 'What have I been too defended to feel?'],
    integration: { actions: ['name one feeling without explaining it', 'give it five minutes of attention'], grounding: ['hand on heart and belly', 'drink water slowly'], nextMovement: ['water_2'] },
  },

  water_2: {
    id: 'water_2',
    element: 'Water',
    phase: 2,
    title: 'The Deepening',
    coreTheme: 'What has been felt begins to take form through image, presence, and encounter.',
    psychologicalFunction: 'Emotional descent and symbolic revelation through unconscious contact.',
    developmentalTask: 'Move from diffuse feeling into relationship with what the psyche reveals.',
    commonSigns: ['heightened dream activity', 'repeating symbols or memories', 'attraction to divination or meditation'],
    distortions: ['emotional flooding', 'projection', 'fantasy inflation', 'signal confused with mood'],
    archetype: { primary: 'The Descender', shadow: 'The Drowned One', framing: 'This phase is encounter, not explanation. Enter relation with the imaginal psyche.' },
    tarot: { suit: 'Cups', cards: ['High Priestess', '8 of Cups', 'Queen of Cups', 'Moon'], interpretation: 'Hidden knowledge and imaginal encounter deepen emotional truth.' },
    astrology: { planets: ['Moon', 'Neptune', 'Pluto'], domains: ['4th house', '8th house', '12th house'], summary: 'The soul speaks through dream, mystery, feeling, and symbolic recurrence.' },
    encounterTypes: [
      { type: 'ancestral', title: 'Ancestral Water Intelligence', description: 'An elder, mourner, or lineage presence.', function: 'Carries inherited feeling, unfinished grief, or emotional wisdom.' },
      { type: 'elemental', title: 'Oceanic Being', description: 'A vast, fluid intelligence difficult to translate into words.', function: 'Reconnects the meditator to feeling as field, not only story.' },
      { type: 'transpersonal', title: 'Off-World Intelligence', description: 'A precise and unfamiliar intelligence with clarifying distance.', function: 'Separates true symbolic signal from personal melodrama.' },
    ],
    guide: { role: 'Receiver and revealer', mode: ['quiet', 'symbolic', 'questioning'], appearance: ['veiled figure', 'presence by water', 'moonlit animal guide'] },
    meditationPrompt: 'Ask: What in me is waiting beneath the surface? Let a guide, image, or presence emerge.',
    dialoguePrompts: ['What are you showing me that I have felt but not understood?', 'What emotion is trying to become conscious now?', 'What am I projecting outward that I need to meet inwardly?'],
    integration: { actions: ['write the image exactly as received', 'identify one real-life situation it may touch'], grounding: ['silent walk', 'sketch the image rather than analyze it'], nextMovement: ['water_3', 'earth_1'] },
  },

  water_3: {
    id: 'water_3',
    element: 'Water',
    phase: 3,
    title: 'The Descent and Surrender',
    coreTheme: 'What has been encountered must now be yielded to, grieved, released, or carried through.',
    psychologicalFunction: 'Transformation through full contact with deeper emotional truth.',
    developmentalTask: 'Surrender control enough for real transformation without collapsing into chaos.',
    commonSigns: ['profound dreams', 'grief or release', 'crossing an inner threshold'],
    distortions: ['martyrdom', 'collapse', 'addiction to intensity', 'mystical inflation through suffering'],
    archetype: { primary: 'The Initiate in the Underwaters', shadow: 'The Lost Drowner', framing: 'The psyche now demands transformation. This phase is a rite of emotional truth.' },
    tarot: { suit: 'Cups', cards: ['5 of Cups', '8 of Cups', 'Death', 'Hanged Man', 'Moon'], interpretation: 'Grief, surrender, and emotional transformation become initiatory.' },
    astrology: { planets: ['Pluto', 'Neptune', 'Moon', 'Saturn'], domains: ['8th house', '12th house', 'deep 4th house'], summary: 'The soul requires surrender so deeper reorganization can occur.' },
    encounterTypes: [
      { type: 'initiatory', title: 'Psychopomp of the Waters', description: 'A ferryman, veiled guide, or threshold keeper.', function: 'Escorts the meditator through grief, ending, or emotional initiation.' },
      { type: 'transpersonal', title: 'Abyssal Intelligence', description: 'An immense, oceanic sacred presence.', function: 'Helps surrender personal story into a larger field of being.' },
    ],
    guide: { role: 'Keeper of passage', mode: ['grave', 'clear', 'steady'], appearance: ['ferryman', 'dark priestess', 'luminous witness'] },
    meditationPrompt: 'Ask: What am I being asked to let go of? What must be mourned, yielded, or carried through?',
    dialoguePrompts: ['What am I being asked to surrender?', 'What grief has not been fully honored?', 'What remains alive after the letting go?'],
    integration: { actions: ['name what is ending or changing', 'create one small ritual of acknowledgment'], grounding: ['warm bath', 'light a candle', 'eat something grounding'], nextMovement: ['earth_1', 'aether_1'] },
  },

  // ═══════════════════════════════════════════════════════════════════
  // FIRE — Initiation, vision, will
  // ═══════════════════════════════════════════════════════════════════

  fire_1: {
    id: 'fire_1',
    element: 'Fire',
    phase: 1,
    title: 'The Spark',
    coreTheme: 'Something in you wants to begin.',
    psychologicalFunction: 'Emergence of desire, idea, or impulse before structure.',
    developmentalTask: 'Recognize initial ignition without dismissing it or overcontrolling it.',
    commonSigns: ['sudden excitement', 'restlessness', 'creative flashes'],
    distortions: ['apathy', 'cynicism', 'fear of starting', 'waiting for permission'],
    archetype: { primary: 'The Flame Bearer', shadow: 'The Extinguished One', framing: 'The psyche offers a direction. Protect the fragile ignition.' },
    tarot: { suit: 'Wands', cards: ['Ace of Wands', 'Page of Wands', 'Fool'], interpretation: 'Raw movement begins before certainty arrives.' },
    astrology: { planets: ['Mars', 'Sun', 'Uranus'], domains: ['1st house', '5th house'], summary: 'Activation, identity expression, and breakthrough possibility.' },
    encounterTypes: [{ type: 'elemental', title: 'Spark Being', description: 'A flickering fire intelligence.', function: 'Initiates movement and asks for action.' }],
    guide: { role: 'Awakener of movement', mode: ['quick', 'alive', 'direct'], appearance: ['fire carrier', 'bright animal', 'radiant youth'] },
    meditationPrompt: 'Ask: What in me wants to begin? Let the answer come quickly without analysis.',
    dialoguePrompts: ['What wants to begin?', 'What excites me right now?', 'What small step can I take today?'],
    integration: { actions: ['take one small step immediately', 'capture the idea in writing'], grounding: ['move physically', 'keep scope small'], nextMovement: ['fire_2'] },
  },

  fire_2: {
    id: 'fire_2',
    element: 'Fire',
    phase: 2,
    title: 'The Radiance',
    coreTheme: 'The fire becomes directional.',
    psychologicalFunction: 'Clarification and amplification of vision into expression.',
    developmentalTask: 'Clarify what the vision is and begin expressing it outwardly.',
    commonSigns: ['desire to create', 'outward expression', 'increased confidence'],
    distortions: ['inflation', 'attention-seeking', 'scattered expansion'],
    archetype: { primary: 'The Creator', shadow: 'The Inflated One', framing: 'Libido becomes directed toward expression and visible form.' },
    tarot: { suit: 'Wands', cards: ['3 of Wands', '6 of Wands', 'Queen of Wands', 'King of Wands'], interpretation: 'Vision gathers shape and begins to radiate.' },
    astrology: { planets: ['Sun', 'Jupiter'], domains: ['5th house', 'Leo'], summary: 'Identity, expansion, and creative visibility.' },
    encounterTypes: [{ type: 'solar', title: 'Solar Intelligence', description: 'A radiant presence stabilizing the center.', function: 'Clarifies authentic expression.' }],
    guide: { role: 'Amplifier and clarifier', mode: ['confident', 'focused', 'expressive'], appearance: ['radiant being', 'solar figure'] },
    meditationPrompt: 'Ask: What is this fire trying to become? Let its form show itself.',
    dialoguePrompts: ['What is the core of this vision?', 'Who is it for?', 'What form should it take?'],
    integration: { actions: ['create something visible', 'share or express the work'], grounding: ['refine direction', 'avoid overextension'], nextMovement: ['fire_3'] },
  },

  fire_3: {
    id: 'fire_3',
    element: 'Fire',
    phase: 3,
    title: 'The Trial by Fire',
    coreTheme: 'Vision meets resistance and must become real.',
    psychologicalFunction: 'Testing, refinement, and commitment.',
    developmentalTask: 'Endure challenge so the fire becomes trustworthy and embodied.',
    commonSigns: ['resistance', 'friction', 'need for discipline'],
    distortions: ['burnout', 'scattered effort', 'avoidance of difficulty'],
    archetype: { primary: 'The Warrior', shadow: 'The Burned One', framing: 'Fire is tested so it becomes refined will rather than impulse.' },
    tarot: { suit: 'Wands', cards: ['7 of Wands', '9 of Wands', 'Strength', 'Tower'], interpretation: 'Pressure refines desire into commitment.' },
    astrology: { planets: ['Mars', 'Saturn', 'Pluto'], domains: ['effort', 'testing', 'transformation'], summary: 'Energy meets endurance and purification.' },
    encounterTypes: [{ type: 'forge', title: 'Fire Guardian', description: 'A force that tests integrity through heat and resistance.', function: 'Strengthens commitment and burns away excess.' }],
    guide: { role: 'Challenger and refiner', mode: ['direct', 'uncompromising', 'strategic'], appearance: ['guardian of the forge', 'warrior figure'] },
    meditationPrompt: 'Ask: What must be strengthened or burned away? Stay present with what resists you.',
    dialoguePrompts: ['What is being tested?', 'What must I commit to fully?', 'What is worth enduring for?'],
    integration: { actions: ['commit to disciplined action', 'remove distractions'], grounding: ['rest enough to prevent burnout', 'simplify priorities'], nextMovement: ['earth_1'] },
  },

  // ═══════════════════════════════════════════════════════════════════
  // AIR — Naming, pattern, transmission
  // ═══════════════════════════════════════════════════════════════════

  air_1: {
    id: 'air_1',
    element: 'Air',
    phase: 1,
    title: 'The Naming',
    coreTheme: 'What was felt or seen becomes sayable.',
    psychologicalFunction: 'Translating experience into words or conceptual clarity.',
    developmentalTask: 'Name what is happening without flattening it.',
    commonSigns: ['journaling', 'reflecting', 'explaining', 'seeking clarity'],
    distortions: ['over-intellectualizing', 'premature conclusions'],
    archetype: { primary: 'The Scribe', shadow: 'The Rationalizer', framing: 'The challenge is to articulate without reducing depth.' },
    tarot: { suit: 'Swords', cards: ['Ace of Swords', 'Page of Swords', 'Justice'], interpretation: 'Truth sharpens into language and distinction.' },
    astrology: { planets: ['Mercury'], domains: ['Gemini', 'Virgo'], summary: 'Experience seeks clarity through naming and distinction.' },
    encounterTypes: [{ type: 'symbolic', title: 'Language Intelligence', description: 'A precise intelligence refining words and meanings.', function: 'Supports clarity without unnecessary complication.' }],
    guide: { role: 'Clarifier', mode: ['precise', 'minimal', 'accurate'], appearance: ['scribe', 'scribe-like intelligence', 'luminous lettering'] },
    meditationPrompt: 'Ask: What is actually happening here? Write the simplest true sentence.',
    dialoguePrompts: ['What is the truth of this situation?', 'What is the simplest way to say this?', 'What is being misunderstood?'],
    integration: { actions: ['write one clear sentence', 'test clarity with another person'], grounding: ['avoid overexplaining', 'return to felt sense if flat'], nextMovement: ['air_2'] },
  },

  air_2: {
    id: 'air_2',
    element: 'Air',
    phase: 2,
    title: 'The Patterning',
    coreTheme: 'Understanding how things connect.',
    psychologicalFunction: 'Organizing meaning into systems and relationships.',
    developmentalTask: 'See structure within complexity.',
    commonSigns: ['mapping systems', 'connecting ideas', 'recognizing patterns'],
    distortions: ['overcomplication', 'abstraction without grounding'],
    archetype: { primary: 'The Architect of Mind', shadow: 'The Over-Analyzer', framing: 'The mind forms pattern, but must remain connected to reality.' },
    tarot: { suit: 'Swords', cards: ['2 of Swords', '6 of Swords', 'King of Swords'], interpretation: 'Clarity organizes relationships, movement, and structure.' },
    astrology: { planets: ['Mercury', 'Saturn'], domains: ['Aquarius'], summary: 'Pattern emerges through relational intelligence and system vision.' },
    encounterTypes: [{ type: 'systemic', title: 'Pattern Intelligence', description: 'A mind that sees relational structure across experiences.', function: 'Reveals what connects and repeats.' }],
    guide: { role: 'System builder', mode: ['structured', 'relational', 'analytical'], appearance: ['networked grid', 'architect', 'constellation of meanings'] },
    meditationPrompt: 'Ask: How does this connect? Let a web or pattern reveal itself.',
    dialoguePrompts: ['What connects these ideas?', 'What is the underlying structure?', 'What is unnecessary complexity?'],
    integration: { actions: ['draw the pattern', 'simplify the system'], grounding: ['retest against lived reality'], nextMovement: ['air_3'] },
  },

  air_3: {
    id: 'air_3',
    element: 'Air',
    phase: 3,
    title: 'The Transmission',
    coreTheme: 'Meaning becomes relational and shareable.',
    psychologicalFunction: 'Communication, teaching, and dissemination.',
    developmentalTask: 'Express understanding so others can actually receive it.',
    commonSigns: ['teaching', 'writing', 'explaining', 'sharing frameworks'],
    distortions: ['performative intelligence', 'talking without embodiment'],
    archetype: { primary: 'The Messenger', shadow: 'The Performer', framing: 'Knowledge becomes service only when it can be truly received.' },
    tarot: { suit: 'Swords', cards: ['Knight of Swords', 'Queen of Swords', 'Judgement'], interpretation: 'Clear message, discernment, and collective call.' },
    astrology: { planets: ['Mercury', 'Jupiter'], domains: ['3rd house', '9th house'], summary: 'Meaning travels through speech, writing, teaching, and perspective.' },
    encounterTypes: [{ type: 'collective', title: 'Messenger Intelligence', description: 'A communicative presence carrying meaning across boundaries.', function: 'Shapes the message for real transmission.' }],
    guide: { role: 'Communicator', mode: ['clear', 'adaptive', 'relational'], appearance: ['messenger', 'teacher', 'luminous voice'] },
    meditationPrompt: 'Ask: How can this be understood by others? Let the form refine for transmission.',
    dialoguePrompts: ['Who is this for?', 'What matters most to communicate?', 'What form should this take?'],
    integration: { actions: ['teach, write, or speak', 'refine the message after feedback'], grounding: ['remove what is unnecessary'], nextMovement: ['water_1', 'fire_1'] },
  },

  // ═══════════════════════════════════════════════════════════════════
  // EARTH — Grounding, building, mastery
  // ═══════════════════════════════════════════════════════════════════

  earth_1: {
    id: 'earth_1',
    element: 'Earth',
    phase: 1,
    title: 'The Grounding',
    coreTheme: 'Something must now be made real.',
    psychologicalFunction: 'Translating insight into a first concrete action or form.',
    developmentalTask: 'Take one grounded, specific step.',
    commonSigns: ['need for next steps', 'urge to organize', 'need for simplicity'],
    distortions: ['overplanning', 'procrastination', 'spiritual bypass'],
    archetype: { primary: 'The Builder', shadow: 'The Avoider', framing: 'Without this step, insight remains dissociated from life.' },
    tarot: { suit: 'Pentacles', cards: ['Ace of Pentacles', 'Page of Pentacles', '2 of Pentacles'], interpretation: 'A first material foothold becomes possible.' },
    astrology: { planets: ['Saturn', 'Mercury'], domains: ['2nd house', '6th house'], summary: 'Reality asks for one practical step and a container for follow-through.' },
    encounterTypes: [{ type: 'elemental', title: 'Stone Being', description: 'A dense, slow, stable presence.', function: 'Anchors energy into reality.' }],
    guide: { role: 'Clarifier of next step', mode: ['practical', 'simple', 'direct'], appearance: ['builder', 'stone keeper', 'steady worker'] },
    meditationPrompt: 'Ask: What is the simplest real action? Do not expand beyond one step.',
    dialoguePrompts: ['What is one thing I can do today?', 'What is unnecessary right now?', 'Where am I avoiding reality?'],
    integration: { actions: ['take one action within 24 hours', 'write it down clearly'], grounding: ['reduce scope', 'keep it concrete'], nextMovement: ['earth_2'] },
  },

  earth_2: {
    id: 'earth_2',
    element: 'Earth',
    phase: 2,
    title: 'The Building',
    coreTheme: 'Consistency and structure support growth.',
    psychologicalFunction: 'Organizing effort into systems and routines.',
    developmentalTask: 'Create structures that support sustained development.',
    commonSigns: ['need for systems', 'desire for order', 'work feels scattered'],
    distortions: ['over-control', 'too much complexity', 'rigidity'],
    archetype: { primary: 'The Architect', shadow: 'The Over-Controller', framing: 'Sustainable growth requires form, rhythm, and sequence.' },
    tarot: { suit: 'Pentacles', cards: ['3 of Pentacles', '8 of Pentacles', 'King of Pentacles'], interpretation: 'Craft, routine, and structure deepen capacity.' },
    astrology: { planets: ['Saturn', 'Mercury'], domains: ['Virgo', 'Capricorn'], summary: 'Systems and habits become the vessel for long-term manifestation.' },
    encounterTypes: [{ type: 'structural', title: 'Builder Collective', description: 'Coordinated intelligences arranging practical order.', function: 'Helps organize what supports growth.' }],
    guide: { role: 'Organizer', mode: ['methodical', 'strategic', 'steady'], appearance: ['architect', 'craftsperson', 'grid of supports'] },
    meditationPrompt: 'Ask: What supports this growing? Let the needed structure show itself.',
    dialoguePrompts: ['What systems are needed?', 'What is inefficient?', 'What supports long-term growth?'],
    integration: { actions: ['build routine', 'track progress', 'simplify workflow'], grounding: ['protect time and sequence'], nextMovement: ['earth_3'] },
  },

  earth_3: {
    id: 'earth_3',
    element: 'Earth',
    phase: 3,
    title: 'The Mastery',
    coreTheme: 'Embodiment over time.',
    psychologicalFunction: 'Refinement, sustainability, and integrity.',
    developmentalTask: 'Live what has been built with consistency and depth.',
    commonSigns: ['stable rhythm', 'need for refinement', 'focus on integrity'],
    distortions: ['rigidity', 'false completion', 'stagnation'],
    archetype: { primary: 'The Elder Builder', shadow: 'The Rigid One', framing: 'What is built must now become trustworthy and lived.' },
    tarot: { suit: 'Pentacles', cards: ['9 of Pentacles', '10 of Pentacles', 'Emperor'], interpretation: 'Form matures into stability, stewardship, and lineage.' },
    astrology: { planets: ['Saturn', 'Pluto'], domains: ['maturity', 'deep restructuring'], summary: 'Embodiment becomes refined through time, pressure, and integrity.' },
    encounterTypes: [{ type: 'guardian', title: 'Guardian of Form', description: 'A stable intelligence maintaining boundaries and coherence.', function: 'Protects integrity over time.' }],
    guide: { role: 'Stabilizer', mode: ['calm', 'authoritative', 'grounded'], appearance: ['elder craftsperson', 'stone guardian', 'keeper of the house'] },
    meditationPrompt: 'Ask: What must remain true over time? Let integrity reveal its shape.',
    dialoguePrompts: ['What defines integrity here?', 'What must not be compromised?', 'What needs refinement?'],
    integration: { actions: ['maintain consistency', 'refine slowly', 'review what is stable'], grounding: ['adjust gently rather than reactively'], nextMovement: ['air_1', 'water_1'] },
  },

  // ═══════════════════════════════════════════════════════════════════
  // AETHER — Witness, guide, coherence
  // ═══════════════════════════════════════════════════════════════════

  aether_1: {
    id: 'aether_1',
    element: 'Aether',
    phase: 1,
    title: 'The Witness',
    coreTheme: 'I am aware of what is happening.',
    psychologicalFunction: 'Stepping out of identification into observing awareness.',
    developmentalTask: 'Establish a stable observing position not fused with any single state.',
    commonSigns: ['space between reaction and awareness', 'meta-observation'],
    distortions: ['dissociation disguised as witnessing', 'detachment without presence'],
    archetype: { primary: 'The Witness', shadow: 'The Detached Observer', framing: 'Awareness must remain present, not absent.' },
    tarot: { suit: 'Major', cards: ['Hanged Man', 'Hermit'], interpretation: 'Perspective and spacious awareness open the field.' },
    astrology: { planets: ['Uranus', 'Neptune'], domains: ['perspective', 'spacious awareness'], summary: 'Consciousness becomes aware of itself as more than content.' },
    encounterTypes: [{ type: 'field', title: 'Field Awareness Intelligence', description: 'A silent presence perceiving without bias.', function: 'Supports stable, non-reactive observation.' }],
    guide: { role: 'Stabilizer of awareness', mode: ['quiet', 'spacious', 'non-directive'], appearance: ['silent seer', 'clear space', 'presence without form'] },
    meditationPrompt: 'Ask: What is aware of this? Rest in the observing position.',
    dialoguePrompts: ['What am I identified with?', 'What changes when I do not react?', 'What remains constant?'],
    integration: { actions: ['pause before reacting', 'name states without merging with them'], grounding: ['stay in the body while observing'], nextMovement: ['aether_2'] },
  },

  aether_2: {
    id: 'aether_2',
    element: 'Aether',
    phase: 2,
    title: 'The Guide',
    coreTheme: 'I know how to move.',
    psychologicalFunction: 'Emergence of inner authority and orienting intelligence.',
    developmentalTask: 'Access guidance that is not reactive or externally dependent.',
    commonSigns: ['clarity without force', 'inner authority', 'sense of rightness'],
    distortions: ['confusing impulse with guidance', 'spiritual inflation'],
    archetype: { primary: 'The Inner Guide', shadow: 'The False Guru', framing: 'True guidance is steady, quiet, and oriented rather than inflated.' },
    tarot: { suit: 'Major', cards: ['Hierophant', 'Star'], interpretation: 'Inner orientation and trust become available.' },
    astrology: { planets: ['Sun', 'Jupiter'], domains: ['centered identity', 'wisdom'], summary: 'Inner authority emerges through coherence rather than force.' },
    encounterTypes: [{ type: 'teleological', title: 'Higher Self Intelligence', description: 'A future-integrated guiding presence.', function: 'Orients the next right movement beyond reactivity.' }],
    guide: { role: 'Director', mode: ['calm', 'certain', 'non-reactive'], appearance: ['sage', 'guiding presence', 'clear star-like intelligence'] },
    meditationPrompt: 'Ask: What is the right movement now? Wait for a clear answer, not a fast one.',
    dialoguePrompts: ['What is the true direction here?', 'What is aligned versus reactive?', 'What is the next right step?'],
    integration: { actions: ['act on one clear guidance', 'track alignment after action'], grounding: ['ignore noisy impulses that demand urgency'], nextMovement: ['aether_3'] },
  },

  aether_3: {
    id: 'aether_3',
    element: 'Aether',
    phase: 3,
    title: 'The Coherence',
    coreTheme: 'Everything is working together.',
    psychologicalFunction: 'Integration across elements, time, and identity.',
    developmentalTask: 'Live in alignment where experience, meaning, action, and awareness are unified.',
    commonSigns: ['reduced internal conflict', 'aligned action', 'stable presence'],
    distortions: ['false completion', 'rigidity', 'avoidance of new cycles'],
    archetype: { primary: 'The Integrator', shadow: 'The Static One', framing: 'Coherence is dynamic, not frozen.' },
    tarot: { suit: 'Major', cards: ['World', 'Temperance'], interpretation: 'Integration and balanced synthesis come forward.' },
    astrology: { planets: ['Saturn', 'Neptune'], domains: ['whole-chart coherence', 'time and spirit'], summary: 'Awareness holds complexity without fragmentation.' },
    encounterTypes: [{ type: 'integrative', title: 'Unified Field Intelligence', description: 'A presence holding all elements in right relation.', function: 'Reveals where the system is coherent and where it is not.' }],
    guide: { role: 'Integrator', mode: ['steady', 'holistic', 'clear'], appearance: ['whole field', 'tempered light', 'fully assembled presence'] },
    meditationPrompt: 'Ask: Where am I aligned, and where am I not? Let the answer reorganize the field.',
    dialoguePrompts: ['What is coherent now?', 'What is still fragmented?', 'What cycle is completing?'],
    integration: { actions: ['maintain alignment', 'adjust gently', 'prepare for the next cycle'], grounding: ['return to simple practices that keep the whole system honest'], nextMovement: ['water_1'] },
  },
};

/**
 * Get a facet by ID from the canonical registry.
 */
export function getFacetFromRegistry(facetId: FacetId): Facet {
  return FACETS[facetId];
}

/**
 * Get all facets for an element.
 */
export function getFacetsByElement(element: string): Facet[] {
  return Object.values(FACETS).filter(f => f.element === element);
}

/**
 * Get the default (phase 1) facet for an element.
 */
export function getDefaultFacetForElement(element: string): Facet | null {
  const key = `${element.toLowerCase()}_1` as FacetId;
  return FACETS[key] ?? null;
}
