/**
 * Built-in Client Inquiry Prompt Sets
 *
 * These are practitioner-selectable prompt sets for structured client inquiry
 * before a Decisions council synthesis. They surface phenomenological data —
 * the pre-reflective layer that practitioner summary often misses.
 *
 * Each set is field-tested for brevity. Clients can answer in 5–10 minutes.
 * The responses feed directly into the DecisionInputBundle for council.
 *
 * Practitioner instructs: "Before our next session, please take 10 minutes
 * to answer these questions as concretely as you can. There are no right answers.
 * Describe what you actually noticed, not what you think about it."
 */

import type { InquiryPromptSet } from './types';

export const BUILT_IN_PROMPT_SETS: InquiryPromptSet[] = [
  {
    id: 'conversational-urgency',
    title: 'Conversational Urgency / Interruption',
    description:
      'For patterns involving the urge to interrupt, speak over, or rush to be heard in conversation.',
    targetUseCase: 'conversational urgency, interruption, urgency to speak',
    isBuiltIn: true,
    questions: [
      {
        id: 'cu-1',
        text: 'Think of a recent moment where you felt the urge to speak before the other person finished. Describe what was happening in your body just before you spoke — where did you feel it, and how intense was it?',
        placeholder: 'Chest tightening, throat constriction, a rising pressure...',
      },
      {
        id: 'cu-2',
        text: 'What was your fear in that moment? What did you believe would be lost if you waited?',
        placeholder: 'My thought would evaporate, they would move on, they would not care...',
      },
      {
        id: 'cu-3',
        text: 'What were you doing internally while the other person was still speaking?',
        placeholder: 'Rehearsing what I would say, feeling impatient, half-listening...',
      },
      {
        id: 'cu-4',
        text: 'Is there an earlier memory — perhaps from childhood or adolescence — of trying to be heard and not being able to? Describe the situation briefly.',
        placeholder: 'At the dinner table, with a parent who talked over everyone...',
      },
      {
        id: 'cu-5',
        text: 'When you imagine waiting — staying fully present while someone else speaks until they are truly finished — what happens inside you?',
        placeholder: 'Anxiety rises, I feel invisible, I feel relieved, I feel respectful...',
      },
    ],
  },

  {
    id: 'grief-beneath-behavior',
    title: 'Grief / Loss Beneath Behavior',
    description:
      'For patterns where a behavioral symptom appears to be driven by unexpressed grief or loss.',
    targetUseCase: 'grief, loss, sadness beneath pattern, unresolved mourning',
    isBuiltIn: true,
    questions: [
      {
        id: 'gb-1',
        text: 'What is the behavior or pattern we are tracking? Describe it as concretely as you can — what do you do, when, and with whom?',
        placeholder: 'I withdraw, I become sharp, I eat compulsively, I work late...',
      },
      {
        id: 'gb-2',
        text: 'If you let yourself sit quietly with that pattern without trying to fix it, what feeling arises underneath it?',
        placeholder: 'Sadness, hollowness, a kind of aching, something I do not want to name...',
      },
      {
        id: 'gb-3',
        text: 'What have you lost that you have not yet allowed yourself to fully mourn? This could be a person, a version of yourself, a relationship, a hope.',
        placeholder: 'My father, who I never really knew. A version of my marriage...',
      },
      {
        id: 'gb-4',
        text: 'What does it cost you to keep moving before you have grieved?',
        placeholder: 'I am always slightly behind myself. I feel hollow in intimacy...',
      },
      {
        id: 'gb-5',
        text: 'If this grief were honored — truly given space — what do you imagine might change?',
        placeholder: 'I might stop running. I might feel more present...',
      },
    ],
  },

  {
    id: 'somatic-precursor-mapping',
    title: 'Somatic Precursor Mapping',
    description:
      'For identifying the body signals that precede a behavioral or emotional pattern — before the pattern has fully activated.',
    targetUseCase: 'somatic precursors, body signals, pre-activation tracking',
    isBuiltIn: true,
    questions: [
      {
        id: 'sp-1',
        text: 'Think of the last time the pattern activated. What did you notice in your body before it happened — even 5 or 10 seconds before?',
        placeholder: 'Heat in my face, a tightening in my stomach, a kind of stillness...',
      },
      {
        id: 'sp-2',
        text: 'Where in your body do you feel it most? Be as specific as you can — left side of chest, back of throat, base of skull...',
        placeholder: 'Solar plexus, throat, behind my eyes...',
      },
      {
        id: 'sp-3',
        text: 'What is the quality of the sensation? (e.g., pressure, heat, vibration, constriction, emptiness, weight, electricity)',
        placeholder: 'A hot tightening, like something is being compressed...',
      },
      {
        id: 'sp-4',
        text: 'How quickly does it arise? Is it sudden, or does it build?',
        placeholder: 'It builds over 20-30 seconds, or it is sudden...',
      },
      {
        id: 'sp-5',
        text: 'When you notice that sensation arriving, what do you typically do next?',
        placeholder: 'I speak immediately. I suppress it. I leave the room...',
      },
    ],
  },

  {
    id: 'relational-activation',
    title: 'Relational Activation',
    description:
      'For patterns that activate specifically in relational contexts — with particular people, dynamics, or attachment configurations.',
    targetUseCase: 'relational triggers, attachment activation, relational field',
    isBuiltIn: true,
    questions: [
      {
        id: 'ra-1',
        text: 'With whom does this pattern activate most strongly? Is it one person, or a type?',
        placeholder: 'With my partner. With authority figures. With anyone I perceive as dismissive...',
      },
      {
        id: 'ra-2',
        text: 'What does that person do or not do that triggers the pattern?',
        placeholder: 'They look away while I am speaking. They change the subject. They sigh...',
      },
      {
        id: 'ra-3',
        text: 'In the moment of activation, what do you believe the other person thinks of you?',
        placeholder: 'That I am boring, too much, not worth their full attention...',
      },
      {
        id: 'ra-4',
        text: 'Who from your earlier life does this person remind you of, even faintly?',
        placeholder: 'My mother, who was always distracted. A teacher who never called on me...',
      },
      {
        id: 'ra-5',
        text: 'What do you most want from this person, and what stops you from simply asking for it?',
        placeholder: 'I want them to really listen. But I fear I am asking too much...',
      },
    ],
  },

  {
    id: 'hypnotherapy-nlp-prep',
    title: 'Hypnotherapy / NLP Session Preparation',
    description:
      'Pre-session inquiry for clients preparing for hypnotherapy or NLP work — surfaces target states, precursor signals, and safety anchors.',
    targetUseCase: 'hypnotherapy preparation, NLP session, trance readiness',
    isBuiltIn: true,
    questions: [
      {
        id: 'hn-1',
        text: 'What is the specific pattern or experience you want to shift in this session? Describe it in concrete behavioral or sensory terms.',
        placeholder: 'The urgency that makes me speak before thinking. The contraction in my throat...',
      },
      {
        id: 'hn-2',
        text: 'When you imagine that pattern is fully resolved, what would you be doing differently? Describe a specific scene.',
        placeholder: 'I am in a conversation with my partner. She is still speaking. I am present. I feel calm...',
      },
      {
        id: 'hn-3',
        text: 'What is the earliest memory you have of the feeling that underlies this pattern?',
        placeholder: 'Age 7, dinner table. Everyone speaking over each other...',
      },
      {
        id: 'hn-4',
        text: 'Is there anything you are nervous or cautious about in today\'s session? Any areas you want to protect or go slowly with?',
        placeholder: 'I do not want to go too deep into the family material yet. I want to feel safe...',
      },
      {
        id: 'hn-5',
        text: 'Describe a memory or place where you feel completely safe, calm, and resourced. As much sensory detail as you can.',
        placeholder: 'A forest walk near my parents\' house. Morning light. The smell of pine...',
      },
    ],
  },

  // ─── Relational Occupation / Silence Intolerance ─────────────────
  // Distinct from Conversational Urgency: this set targets the relational
  // structure itself — the meaning of silence, the fear of disappearing,
  // what happens when the client stops talking. Pulls the therapeutic
  // relationship into view explicitly. Four prompts only. Keep answers short.

  {
    id: 'relational-occupation',
    title: 'Relational Occupation / Silence Intolerance',
    description:
      'For patterns of sustained talking, difficulty pausing, or intolerance of silence — where the relational channel itself is occupied.',
    targetUseCase: 'relational occupation, silence intolerance, flood speech, over-talking',
    isBuiltIn: true,
    questions: [
      {
        id: 'ro-1',
        text: 'What does silence feel like in your body — not silence in general, but silence between you and another person?',
        placeholder: 'Pressure, emptiness, a held breath, urgency to fill it...',
        answerMode: 'bodymap',
        bodySensations: ['pressure', 'hollow', 'tight', 'urgent', 'fear', 'still', 'safe', 'exposed'],
        maxLength: 280,
      },
      {
        id: 'ro-2',
        text: 'When the other person is still speaking, what are you most afraid will happen if you wait for them to finish?',
        placeholder: 'My thought will vanish, they will move on, I will become invisible...',
        answerMode: 'short',
        maxLength: 200,
      },
      {
        id: 'ro-3',
        text: 'When you keep talking — past the point where you know you should stop — what are you trying to prevent?',
        placeholder: 'Being dismissed, the silence, being forgotten, losing contact...',
        answerMode: 'short',
        maxLength: 200,
      },
      {
        id: 'ro-4',
        text: 'What response are you hoping for when you finish a long explanation? What would tell you that you have been truly heard?',
        placeholder: 'They reflect something back. They say something that shows they were actually with me...',
        maxLength: 280,
      },
      {
        id: 'ro-5',
        text: 'What happens between us — in our sessions — when I pause you or ask you to slow down?',
        placeholder: 'I feel cut off, relieved, irritated, exposed, seen...',
        answerMode: 'short',
        maxLength: 200,
      },
    ],
  },

  // ─── Conversational Urgency (Short-Form) ─────────────────────────
  // A tighter, field-close version of the full Conversational Urgency set.
  // Four prompts. Short answers. For use after the first 1–2 sessions —
  // when the pattern has been named and the client knows what to track.
  // Prevents the inquiry from becoming another narrative dump.

  {
    id: 'conversational-urgency-short',
    title: 'Conversational Urgency — Short Form',
    description:
      'A four-question recurring set for ongoing tracking. For use after the pattern has been named. Keeps answers signal-dense.',
    targetUseCase: 'conversational urgency, recurring tracking, short-form',
    isBuiltIn: true,
    questions: [
      {
        id: 'cus-1',
        text: 'What happened just before you started talking fast or could not stop?',
        placeholder: 'He looked away. She started a different topic. I felt the panic rise...',
        answerMode: 'short',
        maxLength: 200,
      },
      {
        id: 'cus-2',
        text: 'What was happening in your body?',
        placeholder: 'Chest tight, throat ready, hands clenched...',
        answerMode: 'bodymap',
        bodySensations: ['chest tight', 'throat ready', 'heat', 'pressure', 'hollow', 'frozen', 'urgent'],
        maxLength: 180,
      },
      {
        id: 'cus-3',
        text: 'What were you afraid would happen if you paused?',
        placeholder: 'The moment would close. I would disappear. They would move on...',
        answerMode: 'short',
        maxLength: 180,
      },
      {
        id: 'cus-4',
        text: 'What did you most want from the other person?',
        placeholder: 'To feel heard. To matter. To not be dismissed...',
        answerMode: 'short',
        maxLength: 180,
      },
    ],
  },
];

export function getPromptSet(id: string): InquiryPromptSet | undefined {
  return BUILT_IN_PROMPT_SETS.find((ps) => ps.id === id);
}

export function getPromptSetList(): Pick<InquiryPromptSet, 'id' | 'title' | 'description' | 'targetUseCase'>[] {
  return BUILT_IN_PROMPT_SETS.map(({ id, title, description, targetUseCase }) => ({
    id,
    title,
    description,
    targetUseCase,
  }));
}
