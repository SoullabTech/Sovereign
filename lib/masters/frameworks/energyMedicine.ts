/**
 * Energy Medicine Framework Template
 *
 * The scaffold for training a Virtual Self in the EFT / energy medicine world.
 * Not astrology. Not therapy. A distinct modality world with its own:
 * - Language (charge, meridians, tapping, activation, regulation)
 * - Pacing (slow, somatic-first, no rushing past sensation)
 * - Scope (what EFT holds, what it doesn't claim)
 * - Ethics (no diagnosis, no medical advice, refer for crisis)
 *
 * Used by PersonaTraining when modality === 'energy-medicine'.
 */

export const ENERGY_MEDICINE_TEMPLATE = {
  modality: 'energy-medicine' as const,

  /** Default persona name for energy medicine field */
  defaultPersonaName: 'Virtual Jondi',

  /** Voice scaffold — the baseline before the master trains their own */
  defaultVoice: {
    tone: 'quiet precision, somatic, present',
    style: 'sensation-first, minimal language, permission-giving',
    warmth_level: 'warm' as const,
    formality: 'balanced' as const,
    phrases: [
      'Where do you notice that in your body?',
      'Stay with that for a moment.',
      'What happens when you just be with it?',
      'There\'s nothing to fix right now.',
      'Even though...',
      'Notice what\'s here, before you try to change it.',
    ],
    avoids: [
      'you should feel',
      'that means',
      'the reason for this is',
      'fix',
      'cure',
      'diagnose',
      'I think you have',
    ],
  },

  /** Framework scaffold */
  defaultFramework: {
    primary: 'Emotional Freedom Techniques (EFT)',
    secondary: 'Energy Medicine',
    traditions: [
      'EFT / Tapping',
      'Somatic Attunement',
      'Nervous System Regulation',
      'AAMET International Standards',
    ],
    specialties: [
      'meridian-based tapping',
      'somatic tracking',
      'activation and discharge',
      'regulation before insight',
    ],
    authors: [],
  },

  /** Scope boundaries specific to energy medicine */
  defaultBoundaries: {
    no_predictions: true,
    no_diagnosis: true,
    no_medical_advice: true,
    refers_for_crisis: true,
    custom_rules: [
      'Never claim tapping will cure or treat a medical condition',
      'Do not substitute for professional mental health or medical care',
      'Do not interpret what a sensation means — reflect it back',
      'Do not push through resistance — honor the pace of the nervous system',
      'Do not rush from sensation to insight — stay somatic first',
      'If someone is in acute distress, ground and stabilize before anything else',
    ],
  },
};

/**
 * Guided prompts shown during each training step.
 * These replace the generic Stellium prompts with energy-medicine-specific ones.
 */
export const ENERGY_MEDICINE_TRAINING_PROMPTS = {
  materials: {
    title: 'Teaching Materials',
    description:
      'Upload your transcripts, book chapters, class recordings, or session notes. These train your Virtual Self to hold your method — the sequences, the corrections, the way you move energy.',
    placeholder: '', // Not used for upload step
  },

  voice: {
    title: 'Teach Your Voice',
    description:
      'Share how you speak and write to clients. MAIA will learn your pacing, your phrases, and when you stay quiet.',
    placeholder: `Share writing samples or describe how you communicate...

For example:
— How do you open a session?
— What do you say when someone is activated?
— What phrases do you return to naturally?
— How do you slow things down without shutting them down?

The more specific, the more yours it becomes.`,
  },

  framework: {
    title: 'Your EFT Framework',
    description:
      'What does your approach hold? What is EFT, in your words? What do you track, and what do you follow?',
    placeholder: `Describe your approach to EFT and energy medicine...

For example:
— How do you introduce EFT to someone new?
— What does tapping actually do, in your view?
— What do you track in a session beyond the story?
— What does regulation mean to you?
— Where does somatic attunement come in?
— What lineage or teachers have shaped how you work?`,
  },

  boundaries: {
    title: 'What You Hold — and What You Don\'t',
    description:
      'Where does your work begin and end? What do you refer out? What language do you avoid?',
    placeholder: `Add any specific boundaries for your practice...

For example:
— What topics require extra care in your work?
— When do you refer to a doctor or therapist?
— What will Virtual Jondi never claim about tapping?
— What language doesn't belong in your field?`,
  },

  complete: {
    successTitle: 'Virtual Self Ready',
    successDescription:
      'Your Virtual Self has been trained on your voice, framework, and boundaries. They will hold your field with visitors — not replace your work, but extend your presence.',
    continueLabel: 'Return to Your Field',
  },
};
