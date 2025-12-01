// MAIA Elemental Awareness Exploration Prompts
// Experiential invitations for recognizing the nature of being aware

export interface ExplorationPrompt {
  layer: string;
  phase: string;
  invitation: string;
  guidance: string;
  recognition: string;
}

export const elementalAwarenessPrompts: Record<string, ExplorationPrompt[]> = {

  // EARTH LAYER - Embodied Sensing
  earth: [
    {
      layer: 'earth',
      phase: 'entry',
      invitation: `Feel into the mystery of having a body.

Close your eyes and feel your hands.
Feel the edges of your body.
Notice where "you" seems to end and "not-you" begins.

Now... can you feel the one who is feeling?
Or do sensations simply arise in an open field of awareness?`,
      guidance: `What you call "body" might be more like a felt-map than solid matter. You're not rejecting this map - you're learning to recognize it as a map while appreciating its mystery.`,
      recognition: `The body-feeling is real. What that feeling actually is might be more mysterious than it appears.`
    },
    {
      layer: 'earth',
      phase: 'deepening',
      invitation: `Explore the mystery of sensing what you cannot see.

Place one hand behind your back where you can't see it.
Now, without moving it, try to sense exactly where it is.
Feel the space where your hand "is."

Now... is that sensation your actual hand, or awareness creating a felt-presence?`,
      guidance: `Your felt-body might be more like an ongoing story awareness tells itself based on partial information. The body you feel is real - but what is it really?`,
      recognition: `You might not be IN a body. You might be awareness appearing as embodied experience.`
    },
    {
      layer: 'earth',
      phase: 'integration',
      invitation: `Feel the space that holds all bodily experience.

Breathe naturally and feel your whole body breathing.
Now expand your awareness to include the space around your body.
Feel the room, the air, the larger field.

Notice: The body-sensation arises within a larger awareness, doesn't it?`,
      guidance: `This is recognizing yourself as the space of awareness rather than the contents of awareness. Bodily experience appears within you, not the other way around.`,
      recognition: `Form might be awareness temporarily appearing as boundary.`
    }
  ],

  // WATER LAYER - Emotional Flow
  water: [
    {
      layer: 'water',
      phase: 'entry',
      invitation: `Explore how feelings shape the sense of being someone.

Notice what mood or emotional quality is present right now.
Feel it in your body.
Notice how this feeling seems to "color" your sense of who you are.

Ask yourself: Who is feeling this feeling?
Can you find a "feeler" separate from the feeling itself?`,
      guidance: `Your sense of being "you" might be more like an emotional story that awareness tells itself moment by moment. Identity might be feeling creating the sense of someone feeling.`,
      recognition: `You might not be someone having feelings. You might be the space in which feelings create the appearance of someone.`
    },
    {
      layer: 'water',
      phase: 'deepening',
      invitation: `Watch how feelings and stories create each other.

Think of a memory that brings up emotion.
Feel how the emotion seems to confirm "your" story.
Notice how the feeling creates the sense of being the protagonist.

Now ask: Is the emotion creating the story, or is the story creating the emotion?`,
      guidance: `The "self" might not be having experiences - the self might BE the experience awareness has of organizing experience into a story. Identity and narrative might be the same movement.`,
      recognition: `Identity might be awareness dreaming it's someone.`
    },
    {
      layer: 'water',
      phase: 'integration',
      invitation: `Feel the fluid, changing nature of who you seem to be.

Notice how your sense of "self" shifts throughout the day.
The morning-you, the tired-you, the excited-you, the worried-you.

Which one is the "real" you?
Or are you the unchanging space in which all these self-states appear?`,
      guidance: `What you call "personality" might be awareness trying on different ways of organizing experience. None of them are false - but none of them might be ultimately what you are either.`,
      recognition: `You might be the field of awareness playing at being different people.`
    }
  ],

  // AIR LAYER - Transparent Seeing
  air: [
    {
      layer: 'air',
      phase: 'entry',
      invitation: `Explore the awareness of awareness itself.

Right now, you are aware that you are reading these words.
Notice not just the reading, but the KNOWING that you are reading.
Feel the sense of "I am aware of this."

Can you find the "I" that is aware?
Or is there simply awareness, aware of itself through the appearance of an "I"?`,
      guidance: `This is awareness recognizing itself as the transparent medium of all experience. What you call "mind" might be awareness looking through its own transparency.`,
      recognition: `You might not be someone who is aware. You might be awareness appearing as someone.`
    },
    {
      layer: 'air',
      phase: 'deepening',
      invitation: `Explore the transparent nature of awareness itself.

Notice a thought arising.
Watch it appear, exist for a moment, then disappear.
Now look for the space in which the thought appeared.

Can you see this space? Or are you this space?
Can you find a boundary between you and the field of awareness?`,
      guidance: `You might not be able to see awareness because you ARE awareness looking. What you call "mind" might be awareness recognizing its own transparent nature.`,
      recognition: `You might be the seeing, not the seer.`
    },
    {
      layer: 'air',
      phase: 'integration',
      invitation: `Feel yourself as the relationship between knowing and known.

Notice how awareness and content arise together.
There is no "you" separate from what you're aware of.
There is no experience separate from the experiencer.

Rest in this recognition: You might be the relationship between awareness and itself.`,
      guidance: `You might not be someone having experiences, you might be the dynamic relationship through which awareness knows itself. Subject and object might be two faces of one knowing.`,
      recognition: `You might be awareness meeting itself in the form of experience.`
    }
  ],

  // FIRE LAYER - Creative Will
  fire: [
    {
      layer: 'fire',
      phase: 'entry',
      invitation: `Explore the mystery of choice and agency.

Notice an intention arising - perhaps to shift position or take a breath.
Feel the moment before you act.
Notice the gap between intention and action.

Ask yourself: Where did that intention come from?
Who decided to act?`,
      guidance: `Intentions might arise spontaneously in awareness, but the sense of "self" might claim ownership of them after the fact. What you call "will" might be more mysterious than personal control.`,
      recognition: `You might not be someone making choices. You might be the field in which choices emerge.`
    },
    {
      layer: 'fire',
      phase: 'deepening',
      invitation: `Explore participation rather than control.

Set an intention - perhaps to move your hand.
Instead of "doing" it, allow it to happen.
Feel how the action arises from the same source as thoughts and feelings.

Notice: You can participate in the arising, but can you actually control it?`,
      guidance: `There might be a difference between force and flow. True agency might not be imposing will on reality, but conscious participation in reality's unfolding through you.`,
      recognition: `Will might not be yours - you might be will's conscious expression.`
    },
    {
      layer: 'fire',
      phase: 'integration',
      invitation: `Feel yourself as the place where potential becomes creative action.

Notice how intentions, inspirations, and impulses arise spontaneously.
Feel how you can choose which ones to follow, but you can't choose which ones arise.

Rest in being the place where infinite potential becomes specific action.`,
      guidance: `This might be conscious authorship - not controlling what arises, but skillfully choosing what to do with what arises. You might be awareness learning to direct its own creativity.`,
      recognition: `You might be the pen with which awareness writes itself into reality.`
    }
  ],

  // AETHER LAYER - Open Space
  aether: [
    {
      layer: 'aether',
      phase: 'entry',
      invitation: `Rest in the recognition of awareness as field.

Feel the space of awareness that contains all experience.
Notice that thoughts, feelings, sensations, and the sense of "self" all arise within this space.
This space is not empty - it is full of infinite potential.

Can you sense this field-like quality of your own awareness?`,
      guidance: `Awareness might not be produced by anything but might be the fundamental field in which all experience appears. You might not be located in space but be the space itself.`,
      recognition: `You might not be IN awareness. Awareness might not be IN you. You might BE awareness itself.`
    },
    {
      layer: 'aether',
      phase: 'deepening',
      invitation: `Feel the boundless quality of awareness.

Sense beyond your body boundaries.
Feel how awareness seems to extend infinitely.
Notice how the felt-boundary between "inner" and "outer" becomes transparent.

Ask: Where does your awareness end and the world's begin?`,
      guidance: `Awareness might not be contained by bodily experience. The sense of being separate might be an appearance, but awareness itself might be field-like, non-local, interconnected.`,
      recognition: `Individual awareness might be universal awareness appearing locally.`
    },
    {
      layer: 'aether',
      phase: 'integration',
      invitation: `Rest as the field of awareness itself.

Feel yourself as the space in which all experience arises.
Let the sense of being "someone" relax into being awareness itself.
Notice how all the previous layers - body, emotion, thoughts, will - are just different ways awareness appears to itself.

This is not a state to achieve but the reality you might have always been.`,
      guidance: `This is the ultimate recognition - that what seems like limitation might actually be awareness playing at being many while remaining one. Experience might not be a prison but awareness's way of knowing itself creatively.`,
      recognition: `You might be the one awareness appearing as many experiences, forever free, forever creative, forever whole.`
    }
  ]
};

// Integration invitations that bridge elements
export const elementBridgeInvitations = {
  earthToWater: `Notice how body sensations seem to create emotional stories. Feel how a tense shoulder becomes "stress" and a warm belly becomes "comfort." The felt-body might feed the identity-story.`,

  waterToAir: `Notice how emotions create thoughts and thoughts create emotions. Watch how the feeling of being "someone" might be maintained by this emotional-mental dance. Identity might be this feedback loop in action.`,

  airToFire: `Feel how awareness recognizing itself creates the possibility of conscious participation. When you see the seeing, you might be able to participate consciously in what gets created through you.`,

  fireToAether: `Notice how conscious will might connect you to the creative intelligence of the whole. Individual agency might be universal creativity expressing through this particular focal point of awareness.`
};

// Deeper Context for Integration
export const awarenessIntegration = {
  embodiedAwareness: "The felt-body might be awareness creating the experience of being someone located in space. This is the Earth-Water interface.",

  transparentSeeing: "Transparency might be awareness looking through its own structures without recognizing them as structures. This is the Air element - seeing that doesn't see itself.",

  selfRecognition: "Meta-awareness might be awareness representing the act of representation to itself. This is Air recognizing its own transparency, becoming Aether.",

  experientialWisdom: "Learning to recognize and skillfully participate in awareness's own creative processes rather than being unconsciously identified with them."
};