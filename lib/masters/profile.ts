/**
 * Master Field Profile — Soul-Bearing Data Model
 *
 * Everything about a master that cannot be derived from their offers alone.
 * This is the canonical container for identity, atmosphere, values, and the
 * full fabric of who they are — beyond the functional portal.
 *
 * Architecture:
 * - `raw`         → what the master actually said, in their words
 * - `synthesized` → what MAIA understood from the raw material
 * - `corrections` → what was false, logged and fed back into the model
 * - `evolution`   → is this still true? the living state of the field
 *
 * The raw layer is never overwritten. Corrections do not erase — they add.
 * The synthesized layer is a living interpretation, always correctable.
 *
 * See: docs/masters/FIELD_AUTHORING_FRAMEWORK.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW TYPES — raw capture of the essence conversation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The five modules of the Essence Interview.
 * Each corresponds to a distinct facet of the master's field.
 */
export type InterviewModule =
  | 'presence'    // what people feel entering their field
  | 'paradox'     // what they hold in tension
  | 'boundaries'  // what would feel false, what MAIA must not do
  | 'world'       // aesthetic home, materials, atmosphere
  | 'becoming';   // what is changing, what is no longer true

/**
 * A single turn in the interview conversation.
 * Stored verbatim — the master's exact words.
 */
export type InterviewTurn = {
  role: 'interviewer' | 'master';
  content: string;
  timestamp: string;
};

/**
 * One completed interview module with its raw turns and MAIA's synthesis.
 * Both are stored. Corrections refer back to the raw to restore context.
 */
export type InterviewSession = {
  module: InterviewModule;
  completedAt?: string;
  turns: InterviewTurn[];
  /** What MAIA understood from this module's answers — a draft, not a fact */
  synthesis?: string;
  /** What the master said was off about the synthesis */
  synthesisCorrections?: string[];
  /**
   * Implicit acceptance signals — logged when the master moves on.
   * Silence from a precise person is data.
   */
  acceptanceSignals?: {
    /** Moved on without editing — synthesis landed */
    accepted_as_is: boolean;
    /** Edited the synthesis text */
    edited: boolean;
    /** Re-recorded their answer (voice flow) */
    re_recorded: boolean;
    /** Seconds spent reading the synthesis before acting */
    time_spent_seconds: number;
    /** Pre-analytic felt reaction — captured before they reason about it */
    firstFeltReaction?: string;
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CORRECTION — the sovereignty layer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What kind of correction this was.
 * Enables fast pattern analysis: are we consistently wrong on tone? paradox? precision?
 */
export type CorrectionEditType =
  | 'tone_adjustment'  // the feeling was right but the register was off
  | 'precision'        // a fact or characterization was imprecise
  | 'boundary'         // something was claimed that must not be
  | 'paradox_fix'      // the tension was flattened or collapsed
  | 'misread';         // fundamental misunderstanding of what was said

/**
 * A single correction. Not a delete — an addition to the record.
 * The field learns from what felt false.
 */
export type CorrectionEntry = {
  id: string;
  timestamp: string;
  /** Which section of the synthesized profile was wrong */
  section: keyof SynthesizedProfile | 'maia_response';
  /** Exact text or behavior that felt false */
  whatWasFalse: string;
  /** What is true instead */
  correction: string;
  /** The master's words, if they corrected in conversation */
  rawWords?: string;
  /** The original synthesis line — stored as typed delta */
  original?: string;
  /** The corrected version — what they wrote instead */
  corrected?: string;
  /** What kind of correction this was */
  editType?: CorrectionEditType;
  /** Whether this correction has been integrated into the synthesized profile */
  integrated: boolean;
  integratedAt?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// SYNTHESIZED SECTIONS — what MAIA understood
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The felt sense of a master. What people encounter before they understand anything.
 */
export type EssenceSynthesis = {
  /** The quality of presence in their space */
  openingFeeling: string;
  /** The pace they keep — and what they slow down for */
  paceDescription: string;
  /** Descriptive qualities: ["quiet", "precise", "devoted"] */
  presenceQualities: string[];
  /**
   * The paradox — what they hold in tension.
   * "I hold precision and spaciousness together."
   * A field without paradox feels flat. This is often the most distinctive thing.
   */
  paradox: {
    statement: string;           // "precision + spaciousness"
    bothMustBeTrue: string;      // why both matter, in their words
    whatGetsFlattenedWithout: string; // what is lost when only one side shows
  };
  /** The correction they most need made about their work */
  whatIsMisunderstood: string;
  /** The invariant — what cannot be flattened, traded, or simplified away */
  whatMustRemainTrue: string;
};

/**
 * Not résumé. Genealogy.
 */
export type LineageSynthesis = {
  teachers: Array<{
    name: string;
    tradition?: string;
    /** What they actually taught — often different from their stated domain */
    whatTheyActuallyTaught?: string;
  }>;
  traditions: string[];
  /** What formed them — not just what they completed */
  initiations: string[];
  /** Methodologies they have made genuinely their own */
  frameworks: string[];
  /** Narrative of how they arrived here — lived, not listed */
  livedHistory: string;
  /** Who they carry forward — the lineage ahead */
  whoTheyCarryForward: string;
  /** What they had to unlearn — often the most revealing thing */
  whatTheyUnlearned: string;
};

/**
 * How they see. Not decoration — orientation.
 */
export type AestheticSynthesis = {
  /** 'dark' | 'low' | 'dappled' | 'neutral' | 'bright' | 'open' */
  lightQuality: string;
  /** "rough linen", "smooth stone", "dry earth" */
  textureDescriptions: string[];
  /** "natural light, honest, unposed" */
  photographyStyle: string;
  /** "classical precision" | "quiet modernity" | "handwritten weight" */
  typographyFeel: string;
  /** Symbols, images, forms they love and return to */
  symbolsLoved: string[];
  /** What must never appear in their field */
  symbolsNeverUse: string[];
  /** References: image URLs, book covers, spaces, brands that feel like home */
  imageReferences: Array<{ description: string; url?: string }>;
  /** "birdsong", "silence", "resonant bell", "no music" */
  sonicAtmosphere?: string;
  /** "water", "stone", "forest", "sky", "fire" */
  naturalElements: string[];
  /** Where their work physically happens — or the felt sense of that space */
  spaceDescription: string;
};

/**
 * How they hold people.
 */
export type RelationalSynthesis = {
  /** How they show up: direct, spacious, or shifts depending on what's needed */
  directness: 'direct' | 'spacious' | 'adaptive';
  /** Whether they interpret, reflect, or work alongside */
  approach: 'interpretive' | 'reflective' | 'collaborative';
  /** Whether sessions are structured or follow what emerges */
  structure: 'structured' | 'emergent' | 'responsive';
  /** Whether ritual holds a role in their work */
  ritual: 'ritualized' | 'practical' | 'both';
  /** What they address first — the portal into their work */
  primaryEntry: 'body-first' | 'psyche-first' | 'spirit-first' | 'systems-first';
  /** The texture of their warmth */
  warmthStyle: string;
  /** What they protect in relationship — what they will not sacrifice */
  whatTheyProtect: string;
};

/**
 * What must not be mistaken about them.
 * The most important layer for MAIA.
 */
export type BoundarySynthesis = {
  /** Work they do not do — stated clearly */
  whatTheyDontDo: string[];
  /** Exact things MAIA must never say or imply */
  maiaCannotSay: string[];
  /** Inferences MAIA must never draw */
  maiaCannotImply: string[];
  /** Things that should never be assumed from their work or name */
  whatShouldNeverBeInferred: string[];
  /** Who this work is for — honest and specific */
  clientFit: string;
  /** Who this work is not for — said plainly */
  clientNotFit: string;
  /**
   * Tones that feel false to them.
   * "Never sound urgent." "Never be vague." "Never be clinical."
   */
  falseTones: string[];
  /** The wince test — what would make them feel misrepresented */
  whatWouldMisrepresentThem: string;
};

/**
 * The ecosystem around them — not just the individual.
 */
export type WorldSynthesis = {
  /** Where they're based, or how they locate themselves */
  location: string;
  languages: string[];
  /** When their work is most alive, when they naturally retreat */
  seasonalRhythm?: string;
  events: Array<{
    name: string;
    description: string;
    /** "annual" | "quarterly" | "monthly" | "ongoing" */
    rhythm: string;
    role: 'founder' | 'co-founder' | 'contributor' | 'participant';
  }>;
  collaborators: Array<{
    name: string;
    relationship: string;
    /** If they're also a Master's Field on Soullab */
    fieldSlug?: string;
  }>;
  guestTeachers: string[];
  /** Recurring gatherings and their character */
  recurringGatherings: string[];
  favoriteResources: Array<{
    title: string;
    author?: string;
    /** Why it matters to their work specifically */
    why: string;
  }>;
  /** Things that only they do — or only they do in this way */
  signaturePractices: string[];
  /** How people are held in their community */
  communityNorms: string[];
};

/**
 * How someone enters and deepens in their world.
 */
export type OfferSynthesis = {
  pathways: Array<{
    name: string;
    /** Links to the FieldPortal slug */
    portalSlug: string;
    /** "beginners", "practitioners", "those in acute crisis" */
    forWhom: string;
    /** What shift this path is actually for */
    transformation: string;
    /** "1:1", "group", "self-study", "intensive", "online", "in-person" */
    formats: string[];
    /** How someone finds this pathway */
    entryPoint: string;
    /** "sliding scale", "investment", "gift economy", "community-supported" */
    pricingPhilosophy?: string;
  }>;
};

/**
 * MAIA's posture in this field — synthesized from all other sections.
 * This replaces or deepens the static systemPromptBlock from the field config.
 */
export type MaiaPostureSynthesis = {
  /** The full system prompt block, synthesized from profile sections */
  systemPromptBlock: string;
  /** Increments with each correction cycle — tracks how much MAIA has learned */
  trainingVersion: number;
  /** Whether the master has reviewed and approved this posture */
  approved: boolean;
  approvedAt?: string;
  /** When the master last said "yes, this is still me" */
  lastReviewedAt?: string;
};

/**
 * All synthesized sections together.
 */
export type SynthesizedProfile = {
  essence: EssenceSynthesis;
  lineage: LineageSynthesis;
  aestheticWorld: AestheticSynthesis;
  relationalStyle: RelationalSynthesis;
  boundaries: BoundarySynthesis;
  world: WorldSynthesis;
  offerArchitecture: OfferSynthesis;
  maiaPosture: MaiaPostureSynthesis;
  /** When each section was last synthesized */
  synthesizedAt: Partial<Record<keyof Omit<SynthesizedProfile, 'synthesizedAt'>, string>>;
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA — what they contribute visually
// ─────────────────────────────────────────────────────────────────────────────

export type MediaAsset = {
  id: string;
  url: string;
  type: 'portrait' | 'field-image' | 'aesthetic-reference' | 'document' | 'other';
  /** How to use this image in the field */
  use?: 'threshold' | 'presence' | 'background' | 'general' | 'reference-only';
  description?: string;
  tags: string[];
  isPrimary?: boolean;
  uploadedAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// EVOLUTION — is this still true?
// ─────────────────────────────────────────────────────────────────────────────

export type EvolutionState = {
  /** When the master last confirmed the field still represents them */
  lastReviewedAt?: string;
  /** Quarterly prompt due date */
  nextPromptDue?: string;
  /**
   * What is changing now — the living edge of their work.
   * Captured at each evolution review.
   */
  whatIsChanging?: string;
  /** What is no longer true that others still assume */
  whatIsNoLongerTrue?: string;
  /** What is emerging that the field doesn't yet reflect */
  whatIsEmerging?: string;
  /** History of evolution reviews */
  reviewHistory: Array<{
    reviewedAt: string;
    changeSummary: string;
    sectionsUpdated: Array<keyof SynthesizedProfile>;
  }>;
};

// ─────────────────────────────────────────────────────────────────────────────
// THE FULL PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export type ProfilePhase =
  | 'not-started'
  | 'interviewing'   // essence interview in progress
  | 'gathering'      // media and materials collection
  | 'synthesizing'   // MAIA processing into profile
  | 'prototype'      // master reviewing the field draft
  | 'live'           // approved and active
  | 'evolving';      // under a living revision cycle

/**
 * MasterFieldProfile
 *
 * The soul-bearing data model. Lives alongside MasterField (which handles
 * routing, theming, portals, and MAIA's functional posture).
 *
 * Raw and synthesized are kept separate and both preserved.
 * The correction log is append-only.
 * Evolution state is updated on a living cycle.
 */
export type MasterFieldProfile = {
  masterSlug: string;
  currentPhase: ProfilePhase;

  /**
   * RAW — what the master actually said.
   * Never overwritten. The ground truth.
   */
  raw: {
    interviewSessions: InterviewSession[];
    writingSamples: string[];         // emails, posts, notes — pasted by the master
    mediaAssets: MediaAsset[];
    /** Anything they contributed that doesn't fit a category */
    freeformNotes: string;
  };

  /**
   * SYNTHESIZED — what MAIA understood.
   * Always a draft until the master approves.
   * Correctable at section level without touching other sections.
   */
  synthesized: SynthesizedProfile;

  /**
   * CORRECTIONS — what was false.
   * Append-only. Each correction feeds back into the relevant section.
   * The field learns from what felt false.
   */
  correctionLog: CorrectionEntry[];

  /**
   * EVOLUTION — is this still true?
   * Periodic review cycle. What changes, what stays.
   */
  evolution: EvolutionState;

  meta: {
    createdAt: string;
    lastUpdatedAt: string;
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an empty profile for a new master.
 * All sections start as empty stubs — filled by the authoring process.
 */
export function createEmptyProfile(masterSlug: string): MasterFieldProfile {
  const now = new Date().toISOString();

  return {
    masterSlug,
    currentPhase: 'not-started',

    raw: {
      interviewSessions: [],
      writingSamples: [],
      mediaAssets: [],
      freeformNotes: '',
    },

    synthesized: {
      essence: {
        openingFeeling: '',
        paceDescription: '',
        presenceQualities: [],
        paradox: { statement: '', bothMustBeTrue: '', whatGetsFlattenedWithout: '' },
        whatIsMisunderstood: '',
        whatMustRemainTrue: '',
      },
      lineage: {
        teachers: [],
        traditions: [],
        initiations: [],
        frameworks: [],
        livedHistory: '',
        whoTheyCarryForward: '',
        whatTheyUnlearned: '',
      },
      aestheticWorld: {
        lightQuality: '',
        textureDescriptions: [],
        photographyStyle: '',
        typographyFeel: '',
        symbolsLoved: [],
        symbolsNeverUse: [],
        imageReferences: [],
        sonicAtmosphere: undefined,
        naturalElements: [],
        spaceDescription: '',
      },
      relationalStyle: {
        directness: 'adaptive',
        approach: 'reflective',
        structure: 'responsive',
        ritual: 'both',
        primaryEntry: 'body-first',
        warmthStyle: '',
        whatTheyProtect: '',
      },
      boundaries: {
        whatTheyDontDo: [],
        maiaCannotSay: [],
        maiaCannotImply: [],
        whatShouldNeverBeInferred: [],
        clientFit: '',
        clientNotFit: '',
        falseTones: [],
        whatWouldMisrepresentThem: '',
      },
      world: {
        location: '',
        languages: [],
        seasonalRhythm: undefined,
        events: [],
        collaborators: [],
        guestTeachers: [],
        recurringGatherings: [],
        favoriteResources: [],
        signaturePractices: [],
        communityNorms: [],
      },
      offerArchitecture: { pathways: [] },
      maiaPosture: {
        systemPromptBlock: '',
        trainingVersion: 0,
        approved: false,
      },
      synthesizedAt: {},
    },

    correctionLog: [],
    evolution: { reviewHistory: [] },
    meta: { createdAt: now, lastUpdatedAt: now },
  };
}

/**
 * Append a correction to the profile.
 * Does not modify the synthesized layer — that happens through
 * a separate integration step after the master confirms the correction.
 */
export function appendCorrection(
  profile: MasterFieldProfile,
  correction: Omit<CorrectionEntry, 'id' | 'timestamp' | 'integrated'>
): MasterFieldProfile {
  const entry: CorrectionEntry = {
    ...correction,
    id: `corr_${Date.now()}`,
    timestamp: new Date().toISOString(),
    integrated: false,
  };

  return {
    ...profile,
    correctionLog: [...profile.correctionLog, entry],
    meta: { ...profile.meta, lastUpdatedAt: new Date().toISOString() },
  };
}

/**
 * Get all corrections for a given section, newest first.
 */
export function getCorrectionsForSection(
  profile: MasterFieldProfile,
  section: keyof SynthesizedProfile
): CorrectionEntry[] {
  return profile.correctionLog
    .filter(c => c.section === section)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Check whether an interview module has been completed.
 */
export function isModuleComplete(
  profile: MasterFieldProfile,
  module: InterviewModule
): boolean {
  const session = profile.raw.interviewSessions.find(s => s.module === module);
  return !!(session?.completedAt);
}

/**
 * Get completed module count.
 */
export function completedModuleCount(profile: MasterFieldProfile): number {
  const modules: InterviewModule[] = ['presence', 'paradox', 'boundaries', 'world', 'becoming'];
  return modules.filter(m => isModuleComplete(profile, m)).length;
}
