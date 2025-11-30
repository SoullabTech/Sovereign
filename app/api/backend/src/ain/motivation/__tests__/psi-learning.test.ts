import { defaultPsiState } from "../../../services/psiService";
import { psiLiteStep } from "../../motivation/psi-lite";
import type { ActionOption, LearningParams } from "../../motivation/types";

const options: ActionOption[] = [
  { id:"coherence_boost", label:"Coherence Practice", expectedNeedDelta:{ coherence:+0.2 }, effort:0.2, risk:0.05 },
  { id:"random", label:"Random", expectedNeedDelta:{}, effort:0.1, risk:0.1 },
];

const learning: LearningParams = { enabled:true, rate:0.1, minWeight:0, maxWeight:1 };

test("weights move up for consistently helpful actions", () => {
  let s = defaultPsiState();
  const startW = s.needs.find(n=>n.id==="coherence")!.weight;

  for (let i=0;i<10;i++){
    const out = psiLiteStep({ state:s, options }, learning);
    s = out.next;
  }
  const endW = s.needs.find(n=>n.id==="coherence")!.weight;

  expect(endW).toBeGreaterThan(startW);
});