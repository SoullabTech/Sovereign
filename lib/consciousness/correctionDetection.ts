/**
 * Correction Detection
 *
 * Detects when the user is signaling that MAIA lost the thread, repeated itself,
 * or misread what they said. Used to inject a repair block into the prompt.
 */

export type CorrectionType = 'repeat' | 'misread' | 'thread_loss' | 'general';

export type CorrectionDetectionResult = {
  hasCorrectionSignal: boolean;
  correctionType: CorrectionType | null;
  matchedPhrase?: string;
  confidence: number;
};

type PhraseEntry = {
  phrase: string;
  type: CorrectionType;
};

// Ordered by specificity — more specific phrases first
const CORRECTION_PHRASES: PhraseEntry[] = [
  // Repeat signals
  { phrase: "you already asked", type: 'repeat' },
  { phrase: "you asked that already", type: 'repeat' },
  { phrase: "you asked me that", type: 'repeat' },
  { phrase: "i already answered", type: 'repeat' },
  { phrase: "i already told you", type: 'repeat' },
  { phrase: "i just said", type: 'repeat' },
  { phrase: "i just told you", type: 'repeat' },
  // Misread signals
  { phrase: "that's not what i meant", type: 'misread' },
  { phrase: "thats not what i meant", type: 'misread' },
  { phrase: "that's not what i said", type: 'misread' },
  { phrase: "thats not what i said", type: 'misread' },
  { phrase: "that wasn't my point", type: 'misread' },
  { phrase: "that wasnt my point", type: 'misread' },
  { phrase: "you misunderstood", type: 'misread' },
  { phrase: "you missed the point", type: 'misread' },
  // Thread loss signals
  { phrase: "you aren't keeping up", type: 'thread_loss' },
  { phrase: "you are not keeping up", type: 'thread_loss' },
  { phrase: "you're not following", type: 'thread_loss' },
  { phrase: "you are not following", type: 'thread_loss' },
  { phrase: "you're not listening", type: 'thread_loss' },
  { phrase: "you lost the thread", type: 'thread_loss' },
  { phrase: "you dropped the thread", type: 'thread_loss' },
  // General correction
  { phrase: "no, i said", type: 'general' },
  { phrase: "no i said", type: 'general' },
  { phrase: "actually, i said", type: 'general' },
  { phrase: "actually i said", type: 'general' },
  { phrase: "pay attention", type: 'general' },
];

// Confidence by type — more explicit signals warrant higher confidence
const TYPE_CONFIDENCE: Record<CorrectionType, number> = {
  repeat: 0.92,
  misread: 0.85,
  thread_loss: 0.90,
  general: 0.70,
};

/**
 * Detect whether the user's message contains a correction signal.
 * Case-insensitive, handles common apostrophe variants.
 */
export function detectCorrectionSignal(userText: string): CorrectionDetectionResult {
  const normalized = userText.toLowerCase();

  for (const entry of CORRECTION_PHRASES) {
    if (normalized.includes(entry.phrase)) {
      return {
        hasCorrectionSignal: true,
        correctionType: entry.type,
        matchedPhrase: entry.phrase,
        confidence: TYPE_CONFIDENCE[entry.type],
      };
    }
  }

  return {
    hasCorrectionSignal: false,
    correctionType: null,
    confidence: 0,
  };
}
