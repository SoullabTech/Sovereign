# Review packet for ChatGPT — Develop plan journey (2026-11-09)

Paste this to ChatGPT. It asks for a review of exact commits, not of a summary.

---

Please review the Writer's Studio "development plan" work on GitHub, repository `SoullabTech/Sovereign`, branch `feature/ws-work-continuity-part-a-suite`.

**Exact candidate:** commit `87cdf49e5`. **Range:** `493f2d6da..87cdf49e5` (commits `9f36eda8c`, `e410f9f06`, `c09b28986`, `a4cf222a6`, `e14f24879`, `c74074075`, `87cdf49e5`).
Read the code, not only the records. The records are: `docs/programme/WS-DEVELOP-STUDIO_M4C_JOURNEY_WITNESS_2026-11-09.md` and `docs/programme/WS-DEVELOP_CONVERSATIONAL_FIELD_DESIGN_2026-11-09.md`.

**Please answer, each with file and line where you can:**
1. Your four earlier findings (early `working` status, missing verdict read as success, unsaved buffer, hand-off ordering) — are they actually fixed in `decideHandoff` (`lib/writersStudio/developmentPlan.ts`) and its caller in `app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx`? Is the order of checks right?
2. Apply/undo continuity: `development_plan_step_links` (in migration `20261108000004`) and `linkStepApplication` / `stepEvents` (`lib/writersStudio/developmentPlanStore.ts`). Can a step be linked to an authorization that is not truly its change? Can "applied" or "undone" ever be shown when the desk's records say otherwise?
3. Are proposed / applied / undone / writer-resolved kept separate everywhere, including the UI (`app/dev/writers-studio-pc3-live/DevelopStage.tsx`)?
4. The founder ruling that plans read settled decisions "on the same terms as the Ask route": does the plans route actually meet the same terms (Sanctuary, unstated posture, receipts before reading)?
5. Anything in the design record's build order you would change, now that G6 (readings carried into the conversation) comes next.

**What this evidence is and is not:** unit and component tests, database route tests on a throwaway local database, and one browser walk on a local harness with a stand-in model and a fictional book. Not production, not real MAIA, not a founder walk. No migration, merge or deploy is authorized.

Please separate what you verified in the code from what you are inferring, and name anything you could not open.
