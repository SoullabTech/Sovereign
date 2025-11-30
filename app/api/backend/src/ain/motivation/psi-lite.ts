import { Appraisal, PsiState, PsiStepInput, PsiStepOutput, LearningParams, PsiEpisode, NeedDelta } from "./types";

const clamp = (x:number,min=0,max=1)=>Math.max(min,Math.min(max,x));

// simple mood/arousal update from outcomes
function updateAffect(mood:number, arousal:number, realizedValence:number){
  const m = Math.max(-1, Math.min(1, mood*0.9 + realizedValence*0.1));
  const a = Math.max(0, Math.min(1, arousal*0.85 + Math.abs(realizedValence)*0.25));
  return {mood:m, arousal:a};
}

export function appraise(input: PsiStepInput): Appraisal[] {
  const { state, options } = input;
  const urgencySum = state.needs.reduce((s,n)=>s + (1-n.level)*n.urgency*n.weight, 0) + 1e-9;

  return options.map(opt => {
    // predicted satisfaction change
    let valence = 0;
    for (const n of state.needs) {
      const delta = opt.expectedNeedDelta[n.id] ?? 0;
      valence += delta * (n.urgency * n.weight);
    }
    // costs
    valence -= 0.3*opt.effort + 0.4*opt.risk;

    // urgency bias: how well this option targets current urgent needs
    let target = 0;
    for (const n of state.needs) {
      const want = (1-n.level)*n.urgency*n.weight;
      const delta = Math.max(0, opt.expectedNeedDelta[n.id] ?? 0);
      target += want * delta;
    }
    const urgencyBias = target / urgencySum;

    // expected utility blends valence with affect
    const expectedUtility = valence * (1 + 0.3*state.arousal) + 0.15*state.mood;

    return { optionId: opt.id, valence, urgencyBias, expectedUtility };
  }).sort((a,b)=>b.expectedUtility - a.expectedUtility);
}

function learnNeedWeights(params: LearningParams | undefined, prev: PsiState, next: PsiState, chosenOptionExpected: Record<string, number> | undefined) {
  if (!params?.enabled) return next;
  const rate = params.rate ?? 0.06;
  const wmin = params.minWeight ?? 0;
  const wmax = params.maxWeight ?? 1;

  const needs = next.needs.map((n, i) => {
    const prevN = prev.needs[i];
    const actualDelta = n.level - prevN.level;
    const predicted = chosenOptionExpected?.[n.id] ?? 0;

    // If we predicted ↑ and actually ↑, reinforce weight; mismatch → punish slightly.
    const mag = Math.abs(actualDelta);
    const directionMatch = Math.sign(predicted) !== 0 && Math.sign(predicted) === Math.sign(actualDelta);
    const deltaW = (directionMatch ? +1 : -1) * rate * mag;

    const newWeight = clamp(n.weight + deltaW, wmin, wmax);
    return { ...n, weight: newWeight };
  });

  return { ...next, needs };
}

export function psiLiteStep(input: PsiStepInput, learning?: LearningParams): PsiStepOutput & { episode: PsiEpisode } {
  const appraisals = appraise(input);
  const chosen = appraisals[0] ?? null;

  // apply effects to needs (simulate outcome = predicted delta + small noise)
  const chosenOpt = chosen ? input.options.find(o=>o.id===chosen.optionId) : undefined;

  let next: PsiState = {
    ...input.state,
    tick: input.state.tick + 1,
    lastActionId: chosen?.optionId,
    needs: input.state.needs.map(n => {
      const predicted = chosenOpt ? (chosenOpt.expectedNeedDelta[n.id] ?? 0) : 0;
      const noise = (Math.random()*0.08 - 0.04);
      const newLevel = clamp(n.level + predicted + noise, 0, 1);
      return { ...n, level: newLevel };
    }),
    mood: input.state.mood,
    arousal: input.state.arousal,
  };

  // realized valence from actual deltas
  const realizedValence = next.needs.reduce((s, n, i) => {
    const prev = input.state.needs[i].level;
    return s + (n.level - prev) * (n.urgency * n.weight);
  }, 0);

  const needDeltas: NeedDelta[] = next.needs.map((n, i) => ({
    id: n.id,
    predicted: chosenOpt ? (chosenOpt.expectedNeedDelta[n.id] ?? 0) : 0,
    actual: n.level - input.state.needs[i].level
  }));

  const affect = updateAffect(next.mood, next.arousal, realizedValence);
  next.mood = affect.mood;
  next.arousal = affect.arousal;

  // learning (adjust weights from outcome)
  next = learnNeedWeights(learning, input.state, next, chosenOpt?.expectedNeedDelta);

  const episode: PsiEpisode = {
    ts: new Date().toISOString(),
    tick: next.tick,
    chosenActionId: chosen?.optionId,
    mood: next.mood,
    arousal: next.arousal,
    needDeltas,
    realizedValence,
    appraisals,
  };

  return { next, appraisals, chosen, episode };
}