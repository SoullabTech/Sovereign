import { defaultPsiState, runPsiStep } from "../../../services/psiService";

describe("psi-lite loop", () => {
  test("produces an appraisal and updates state", () => {
    const s0 = defaultPsiState();
    const out = runPsiStep(s0);
    expect(out.appraisals.length).toBeGreaterThan(0);
    expect(out.next.tick).toBe(1);
  });
});