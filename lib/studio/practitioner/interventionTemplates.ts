/**
 * Built-in Intervention Templates
 *
 * Practitioner-facing templates for hypnotherapy, NLP, somatic,
 * and relational intervention design. Selected when creating a ChangeExperiment.
 *
 * These are NOT presented to the client directly.
 * The practitioner adapts them to the individual.
 *
 * Important: These are not medical claims. They are structured starting points
 * for trained practitioners who understand when and how to apply each modality.
 * "Signs working" describes observable process markers, not clinical outcomes.
 */

import type { InterventionTemplate } from './types';

export const INTERVENTION_TEMPLATES: InterventionTemplate[] = [
  {
    id: 'light-trance-precursor-mapping',
    title: 'Light Trance — Somatic Precursor Mapping',
    modality: 'hypnosis',
    purpose:
      'Bring the client into a relaxed, inwardly oriented state where they can observe the bodily precursor signal without immediately acting on it.',
    whenToUse:
      'When the client can describe a somatic precursor (e.g. chest tightening, throat constriction) but has not yet been able to stay with it consciously. Use in early sessions before installing techniques.',
    cautions: [
      'Do not attempt with clients who dissociate easily without first establishing a safety anchor.',
      'Keep depth light — this is an observational exercise, not deep regression.',
      'If client becomes distressed, gently bring them back to the room before proceeding.',
    ],
    suggestedSteps: [
      '1. Settle client with 3 slow breaths and a simple body scan.',
      '2. Invite them to recall a recent moment when the pattern almost activated — not the worst episode, a mild one.',
      '3. Ask them to observe the body from inside: "Where do you first notice it? What is the very first signal?"',
      '4. Stay with that signal. Do not suppress it. Just witness it with curiosity.',
      '5. Ask: "What does this sensation need you to know?"',
      '6. Gently bring them back. Debrief: what did they notice that was new?',
    ],
    signsWorking: [
      'Client can name the precursor signal distinctly from the behavioral impulse.',
      'Client reports increased time between signal and action after session.',
      'Client begins spontaneously noticing the signal in daily life.',
    ],
  },

  {
    id: 'age-regression-first-time-heard',
    title: 'Age Regression — First Time Rushing to Be Heard',
    modality: 'hypnosis',
    purpose:
      'Locate the original scene where the urgency to speak before others was first installed. Allow the adult self to witness and resource the younger self.',
    whenToUse:
      'When client has identified that the pattern has early origins and expressed willingness to explore. Client should have a safety anchor and demonstrate capacity for affect regulation.',
    cautions: [
      'Only when client is stable and has therapeutic alliance.',
      'Do not push toward specific memories — follow what arises naturally.',
      'Always close the regression with a return to the safe place and present-moment reorientation.',
      'Not suitable if client has unprocessed trauma history without appropriate preparation.',
    ],
    suggestedSteps: [
      '1. Deepen with breathing. Establish safe place anchor.',
      '2. Invite client to float back to "an earlier time when this feeling was very familiar."',
      '3. Allow a scene to form. Do not direct it. Ask: "Where are you? How old are you?"',
      '4. Witness the scene from the adult self: "What does that younger you need right now?"',
      '5. Adult self enters the scene and provides what was needed (reassurance, voice, presence).',
      '6. Bring the younger self to the safe place.',
      '7. Return client to the present. Debrief gently.',
    ],
    signsWorking: [
      'Client identifies a specific earlier scene with felt sense of recognition.',
      'Client can distinguish past pattern from present-moment choice.',
      'Reduction in urgency intensity reported between sessions.',
    ],
  },

  {
    id: 'future-pacing-successful-pause',
    title: 'Future Pacing — Successful Pause',
    modality: 'nlp',
    purpose:
      'Pre-experience the neural pathway of successfully pausing and remaining present while another person speaks. Anchors a new response before it happens.',
    whenToUse:
      'After client understands the old pattern and has expressed desire to change. Best used once the somatic precursor has been mapped. Can be used in the same session after precursor mapping.',
    cautions: [
      'The imagined scene must be believable to the client — not idealized.',
      'Check: does the client feel the scene as real in the body, or only as fantasy?',
      'If client cannot feel it somatically, simplify the scene or reduce emotional intensity.',
    ],
    suggestedSteps: [
      '1. Invite client to imagine a specific upcoming conversation where the old pattern might activate.',
      '2. Make it concrete: who is present, what room, what time of day.',
      '3. The other person begins speaking. Guide client into the body: "What do you notice?"',
      '4. The urgency arises. This time, client observes it. Chooses to stay.',
      '5. Client remains present until the other person finishes. Then speaks — from choice, not urgency.',
      '6. How does that feel? Where in the body? Name and anchor that state.',
      '7. Practice the scene 2–3 times until it feels natural.',
    ],
    signsWorking: [
      'Client can feel the difference somatically between the old pattern and the new response.',
      'Client reports thinking of the scene before a real conversation.',
      'Early instances of spontaneous pausing in actual conversations.',
    ],
  },

  {
    id: 'somatic-anchor-installation',
    title: 'Somatic Anchor — Calm Presence Installation',
    modality: 'somatic',
    purpose:
      'Establish a reliable somatic anchor that the client can self-activate when the precursor signal arises, interrupting the automaticity before it becomes behavior.',
    whenToUse:
      'After precursor has been mapped and client understands the sequence. The anchor gives them a self-regulation tool for between-session use.',
    cautions: [
      'The anchor must be installed at peak resource — not while client is distressed.',
      'Test the anchor before closing the session: activate it in a neutral context and check.',
      'Some clients need to practice the anchor daily for 2–3 weeks before it becomes reliable.',
    ],
    suggestedSteps: [
      '1. Lead client to a memory or imagined state of calm presence and full listening.',
      '2. Amplify the feeling: "Where do you feel it? Let it get stronger. What colour, texture, temperature?"',
      '3. At peak feeling, introduce the anchor: a specific touch (e.g. thumb and middle finger pressed together).',
      '4. Hold anchor for 5–7 seconds. Release. Break state briefly.',
      '5. Fire anchor again. Does the feeling return? Deepen the association 3 more times.',
      '6. Test: fire anchor while thinking of a mildly activating scenario. Does it interrupt?',
      '7. Practice instructions: fire anchor when you notice the precursor signal arising.',
    ],
    signsWorking: [
      'Anchor reliably recalls the calm state in the session.',
      'Client reports using the anchor between sessions.',
      'Client describes successfully pausing with anchor support in a real conversation.',
    ],
  },

  {
    id: 'pattern-interrupt-substitute-discharge',
    title: 'Pattern Interrupt with Substitute Discharge',
    modality: 'nlp',
    purpose:
      'Interrupt the automatic urgency → interruption sequence with a conscious discharge that satisfies the energy without the behavioral cost.',
    whenToUse:
      'When client cannot yet maintain a full pause but can insert a brief conscious action. A transitional tool — not a final destination.',
    cautions: [
      'The substitute discharge must be invisible or low-impact socially (e.g. pressing feet to floor, slow exhale).',
      'Do not introduce if client will be embarrassed using it — they will abandon it.',
      'Review the discharge after 2 weeks: if urgency is still intense, explore what it is protecting.',
    ],
    suggestedSteps: [
      '1. Map the exact sequence: precursor → urgency → impulse to interrupt.',
      '2. Identify where in the body the urgency peaks.',
      '3. Design a substitute: press feet firmly to ground. Or press thumbnail into index finger. Or slow silent exhale.',
      '4. Practice: "When you feel the urgency, instead of speaking, press your feet down. Feel the ground. Stay."',
      '5. Notice: did the urgency pass? What was it protecting?',
      '6. Debrief after 2 sessions: how often did the interrupt work? What helped?',
    ],
    signsWorking: [
      'Client reports successfully using the discharge in real conversations.',
      'Urgency intensity decreases gradually over 2–3 weeks.',
      'Client begins to notice what was underneath the urgency (grief, fear, wanting to matter).',
    ],
  },

  {
    id: 'receiving-spaciousness-trance',
    title: 'Receiving / Spaciousness Trance',
    modality: 'hypnosis',
    purpose:
      'Cultivate the capacity to receive another person\'s full expression without needing to interrupt it. Addresses the core fear: "If I wait, I will be forgotten or dismissed."',
    whenToUse:
      'After precursor mapping and pattern interrupt work. A deeper installation of the capacity to be present without urgency. Can also be used early if client is introspective and ready.',
    cautions: [
      'This is not suppression — it is expansion. If client feels like they are holding themselves back, the framing needs adjustment.',
      'The experience should feel spacious and generous, not effortful.',
      'If client feels sad during this work, welcome it — grief and spaciousness often arrive together.',
    ],
    suggestedSteps: [
      '1. Deepen. Guide client to a felt sense of inner spaciousness — a wide, quiet place inside.',
      '2. Invite: "Imagine someone speaking to you. You have all the time in the world. There is no urgency."',
      '3. Let their words arrive like sounds. Not needing to respond. Just receiving.',
      '4. Notice: what is it like to let their full expression land before you speak?',
      '5. Ask: "What do you notice about the quality of your listening from this place?"',
      '6. Anchor the felt sense of spacious receiving (a word, a gesture, a colour).',
      '7. Debrief: what shifted?',
    ],
    signsWorking: [
      'Client reports feeling genuinely curious about what the other person will say next.',
      'Client describes listening that feels wider, less defended.',
      'Spontaneous moments of receiving without urgency in daily life.',
    ],
  },

  {
    id: 'relational-pause-tolerance',
    title: 'Relational Pause Tolerance Practice',
    modality: 'relational',
    purpose:
      'Build tolerance for the micro-pauses in conversation — the moments of silence or transition that trigger the urgency to fill or rush forward.',
    whenToUse:
      'As a between-session practice. Pairs well with somatic anchor and pattern interrupt. Can be given as homework after any session addressing conversational urgency.',
    cautions: [
      'Client should start with low-stakes relationships, not with the most activating person.',
      'This is a capacity-building practice, not a test. Frame it as exploration, not performance.',
      'If client becomes very anxious in the pauses, reduce the duration and check what the silence means to them.',
    ],
    suggestedSteps: [
      '1. Choose a low-stakes conversation in the coming week (coffee with a friend, a colleague).',
      '2. Intention: after the other person finishes speaking, pause for 3 full seconds before responding.',
      '3. During those 3 seconds: breathe, feel your feet, stay curious about what just landed.',
      '4. Notice what arises in the pause — urgency, relaxation, something else.',
      '5. After the conversation, journal: what happened in the pauses? What did you learn?',
      '6. Next session: review what was discovered.',
    ],
    signsWorking: [
      'Client completes the practice at least twice before next session.',
      'Client discovers something new about themselves or the other person in the pauses.',
      'Pauses begin to feel interesting rather than threatening.',
    ],
  },
];

export function getInterventionTemplate(id: string): InterventionTemplate | undefined {
  return INTERVENTION_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByModality(modality: string): InterventionTemplate[] {
  return INTERVENTION_TEMPLATES.filter((t) => t.modality === modality);
}

export function getInterventionTemplateList(): Pick<InterventionTemplate, 'id' | 'title' | 'modality' | 'purpose' | 'whenToUse'>[] {
  return INTERVENTION_TEMPLATES.map(({ id, title, modality, purpose, whenToUse }) => ({
    id,
    title,
    modality,
    purpose,
    whenToUse,
  }));
}
