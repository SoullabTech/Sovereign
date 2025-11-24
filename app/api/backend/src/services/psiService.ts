import { psiLiteStep, PsiState, ActionOption, PsiStepOutput, LearningParams } from "../ain/motivation";
import { savePsiEpisode } from "./psiMemoryBridge";

const DEFAULT_NEEDS = [
  { id:"coherence", label:"Coherence", level:0.6, urgency:0.7, weight:0.9 },
  { id:"novelty", label:"Novelty", level:0.4, urgency:0.5, weight:0.6 },
  { id:"social", label:"Relatedness", level:0.5, urgency:0.6, weight:0.7 },
];

const DEFAULT_OPTIONS: ActionOption[] = [
  { id:"reflect", label:"Inner Reflection", expectedNeedDelta:{ coherence:+0.12, novelty:+0.02 }, effort:0.2, risk:0.05 },
  { id:"explore", label:"Explore New Input", expectedNeedDelta:{ novelty:+0.18, coherence:-0.04 }, effort:0.35, risk:0.15 },
  { id:"connect", label:"Reach Out", expectedNeedDelta:{ social:+0.15, coherence:+0.03 }, effort:0.3, risk:0.1 },
];

export function defaultPsiState(seed?: Partial<PsiState>): PsiState {
  return {
    tick: 0,
    needs: DEFAULT_NEEDS.map(n=>({ ...n })),
    mood: 0.0,
    arousal: 0.35,
    ...seed,
  };
}

export type PsiRuntimeConfig = {
  learning: LearningParams;
};

const learningEnabled = (process.env.PSI_LEARNING_ENABLED ?? "true") === "true";
const learningRate = Number(process.env.PSI_LEARNING_RATE ?? "0.08");

let RUNTIME: PsiRuntimeConfig = {
  learning: {
    enabled: learningEnabled,
    rate: learningRate,
    minWeight: 0,
    maxWeight: 1,
  }
};

export function getPsiRuntime(): PsiRuntimeConfig { return RUNTIME; }
export function setPsiRuntime(cfg: Partial<PsiRuntimeConfig>) {
  RUNTIME = { ...RUNTIME, ...cfg, learning: { ...RUNTIME.learning, ...(cfg.learning ?? {}) } };
}

export async function runPsiStep(state: PsiState, options: ActionOption[] = DEFAULT_OPTIONS): Promise<PsiStepOutput> {
  const out = psiLiteStep({ state, options }, RUNTIME.learning);
  // persist episode
  await savePsiEpisode(out.episode);
  return out;
}