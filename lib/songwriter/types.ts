/**
 * MAIA Songwriter — Core Types
 *
 * The intelligence contract for the songwriter seed endpoint.
 * Every field here represents a decision about what the system
 * understands and what it hands back to the songwriter.
 */

// ─── Input ───────────────────────────────────────────────────────────────────

export interface SeedInput {
  /** Raw input: feeling, journal entry, phrase, memory, fragment */
  content: string;
  /** Optional: member's vocal range — narrows key suggestions */
  vocalRange?: 'low' | 'mid' | 'high';
  /** Optional: playing style — informs instrumentation hints */
  playingStyle?: 'fingerpicked' | 'strummed' | 'hybrid';
  /** Optional: preferred output mode */
  mode?: 'verse_chorus' | 'verse_only' | 'chorus_only';
}

// ─── Interpretation ───────────────────────────────────────────────────────────

export interface SeedInterpretation {
  /** What the input is really about */
  theme: string;
  /** Emotional register — not a label, a texture */
  emotionalTone: string;
  /** Who is speaking in the song */
  perspective: 'first_person' | 'second_person' | 'third_person';
  /** Felt energy of the input */
  tempoFeel: 'slow' | 'mid' | 'upbeat';
  /** Narrative direction — where the song might go */
  narrativeDirection: string;
}

// ─── Chord Suggestion ─────────────────────────────────────────────────────────

export interface ChordSuggestion {
  key: string;
  capo: number;
  verse: string[];
  chorus: string[];
  bridge?: string[];
  /** Qualitative feel of this progression */
  feel: string;
  /** Strumming/picking character */
  strummingFeel: string;
}

// ─── Output ───────────────────────────────────────────────────────────────────

export interface LyricSection {
  id: string;
  text: string;
}

export interface SongSeed {
  /** Stable seed ID for targeting updates */
  id: string;
  /** Interpretation of the input */
  interpretation: SeedInterpretation;
  /** 3–5 possible titles */
  titles: string[];
  /** Lyric drafts — rough, leaving room for the writer */
  lyrics: {
    verse1: LyricSection;
    chorus: LyricSection;
    bridge: LyricSection | null;
  };
  /** Chord suggestion tuned to the emotional tone */
  chords: ChordSuggestion;
  /** Suggested section sequence */
  structure: string[];
  /** One sentence on what this song might be trying to say */
  coreStatement: string;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface SeedRequest {
  content: string;
  vocalRange?: SeedInput['vocalRange'];
  playingStyle?: SeedInput['playingStyle'];
  mode?: SeedInput['mode'];
  memberId?: string;
}

export interface SeedResponse {
  seed: SongSeed;
  /** Raw input echoed back for canvas hydration */
  inputEcho: string;
}
