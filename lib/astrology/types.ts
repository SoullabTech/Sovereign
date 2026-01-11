import type { AstrologyIntake } from "./astrologyIntakeSchema";
import type { Lens } from "./pickLenses";

export type DetailLevel = "mini" | "standard" | "full";

export type IncludeFlags = {
  natalChart?: boolean;
  transits?: boolean;
  lifeCycles?: boolean;
  narrative?: boolean;
  spiralogic?: boolean;
};

export type AstrologyComposerMeta = {
  version: string;
  houseSystem: string;
  lensesUsed: Lens[];
  source: string;
  build?: string;
  timingIncluded: boolean;
  detailLevel: DetailLevel;
  debug: boolean;
};

export type ComposerSection<TSummary = any, TRaw = any> = {
  ok: boolean;
  ms?: number;
  error?: string;

  // Always safe for UI
  summary?: TSummary;

  // Only included when debug=true or detailLevel="full"
  raw?: TRaw;
};

export type UnifiedAstrologyReading = {
  ok: true;
  meta: AstrologyComposerMeta;

  intake: {
    question: string;
    hasBirth: boolean;
    hasNatal: boolean;
    hasTiming: boolean;
  };

  natalChart?: ComposerSection;
  transits?: ComposerSection;
  lifeCycles?: ComposerSection;
  narrative?: ComposerSection;
  spiralogic?: ComposerSection;

  interpretation: {
    corePattern: string;
    currentActivation?: string;
    integrationPath: string[];
    notes?: string[];
  };
};

export type ComposerContext = {
  intake: AstrologyIntake;
  lensesUsed: Lens[];
  detailLevel: DetailLevel;
  debug: boolean;
  include: Required<IncludeFlags>;
};

export type ComposerInput = {
  intake: AstrologyIntake;
  lensesUsed: Lens[];
  detailLevel?: DetailLevel;
  debug?: boolean;
  include?: IncludeFlags;
};
