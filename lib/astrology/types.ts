import type { AstrologyIntake } from "./astrologyIntakeSchema";
import type { Lens } from "./pickLenses";

export type AstrologyComposerMeta = {
  version: string;
  houseSystem: string;
  lensesUsed: Lens[];
  source: string;
  build?: string;
  timingIncluded: boolean;
};

export type ComposerSection<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
  ms?: number;
};

export type UnifiedAstrologyReading = {
  ok: true;
  meta: AstrologyComposerMeta;

  // Inputs / derived structure (safe subset)
  intake: {
    question: string;
    hasBirth: boolean;
    hasNatal: boolean;
    hasTiming: boolean;
  };

  // Engine outputs
  natalChart?: ComposerSection;
  transits?: ComposerSection;
  lifeCycles?: ComposerSection;
  narrative?: ComposerSection;
  spiralogic?: ComposerSection;

  // Final composed story (what the frontend renders)
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
};
