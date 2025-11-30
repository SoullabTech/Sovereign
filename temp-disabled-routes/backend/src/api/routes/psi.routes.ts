import { Router } from "express";
import { defaultPsiState, runPsiStep, getPsiRuntime, setPsiRuntime } from "../../services/psiService";

const router = Router();
const ENABLED = process.env.PSI_LITE_ENABLED === "true";

// in-memory session per process
let session = defaultPsiState();

router.get("/psi/enabled", (_req, res) => {
  res.json({ enabled: ENABLED });
});

router.get("/psi/status", (_req, res) => {
  res.json({
    enabled: ENABLED,
    runtime: getPsiRuntime(),
    tick: session.tick,
    needs: session.needs,
    mood: session.mood,
    arousal: session.arousal,
    lastActionId: session.lastActionId
  });
});

router.post("/psi/config", (req, res) => {
  if(!ENABLED) return res.status(403).json({ error:"PSI-lite disabled" });
  const { learning } = req.body ?? {};
  if (learning) setPsiRuntime({ learning });
  res.json({ ok: true, runtime: getPsiRuntime() });
});

router.post("/psi/reset", (_req, res) => {
  if(!ENABLED) return res.status(403).json({ error:"PSI-lite disabled" });
  session = defaultPsiState();
  res.json({ ok: true, state: session });
});

router.post("/psi/step", async (req, res) => {
  if(!ENABLED) return res.status(403).json({ error:"PSI-lite disabled" });
  const { state, options } = req.body ?? {};
  if (state) session = state;
  const out = await runPsiStep(session, options);
  session = out.next;
  res.json(out);
});

export default router;