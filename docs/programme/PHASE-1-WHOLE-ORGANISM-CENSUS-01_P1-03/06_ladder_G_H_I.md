# P1-03 · BOUNDED LADDER DERIVATION — DOMAINS G · H · I

```text
STEP        P1-03 · LADDER PASS (Amendment 2 · Ruling 1)
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — restatement of what existing record prose already establishes
INPUTS      P1-03/03_normalized_G_H_I.md · P1-02/{G_orchestration,H_sensory_voice,I_member_practitioner}.md
BOUND BY    P1-03 instrument §2 (INF-1…INF-5) · §3 prohibitions · §4 · Amendment 2 §2 (INF-6), §3
ROWS        48 — G 18 · H 18 · I 12
```

> ⛔ **No source code, governing document, test or runtime witness was read.** Records only.
> ⛔ No contradiction resolved · ⛔ no position assigned that record prose does not support ·
> ⛔ nothing rated, scored, or recommended · ⛔ the separately-owned authorization/exposure lane is
> neither cited, awaited, answered nor assessed. Domain I's own discipline — *record only; open
> nothing* — is held exactly.

⚠️ **CONTENT DISCIPLINE** (inherited from domain I): paths, field names, column names, route shapes
and authorization predicates only. No member content, no credential or token value, no identifier of
any real person.

---

## Reading conventions — declared, not assumed

⭐ The three P1-02 records never use the ladder vocabulary. A reading rule is therefore unavoidable;
⛔ guessing one silently is what the `E1/E2/E3/E4` episode cost. It is declared here so it is
checkable, and ⛔ it can be corrected without re-running anything.

```text
EXISTS         the record verifies the artifact present at the subject
PARTICIPATES   the record traces a call path reaching it, or from it into a reached path
KNOWS          the record establishes that a fact reaches it, or that it reads one
CONSIDERS      the record establishes that a fact it holds is read into a computation
CONTRIBUTES    the record establishes that its output enters a member-facing turn,
               a prompt, a practitioner-facing surface, or a stored record
DECIDES        the record's own words establish that it determines an outcome
HAS AUTHORITY  ⭐ the record's own words use AUTHORIZATION LANGUAGE about the act
               — "authorizes", "is authorized", "the grant of authority"
```

⛔⛔ **INF-6 applied throughout.** No position is inferred from any other. `HAS AUTHORITY` is never
inferred from `DECIDES`. A member act that is merely an INPUT to a predicate is recorded as member
authority in the entry text, ⛔ never as `HAS AUTHORITY`.

⭐ **`EXISTS` is recovered on all 48 rows** because all three records verify subject-identity of
every citation (G §0: *"every `file:line` below is a reading at the subject"*; H §0: *"Every code
path in this domain is byte-identical between the census subject and the working tree read"*;
I: *"Every `file:line` below is a claim about the subject"*). ⛔ That is the weakest rung and must
not be read as density of evidence — the counts section separates it out.

⚠️ For domain I, and for the deploy/commit instruments in domain G, the ladder is read with respect
to the path the record actually traces (member/practitioner visibility; the deploy lane), ⛔ not with
respect to MAIA cognition — the register records `COVERAGE NOT APPLICABLE` for those rows.

---

## DOMAIN G — MODEL / PROVIDER / ORCHESTRATION

```text
ROW ID        P3-G-01
NAMED OBJECT  generateText(req: TextRequest) — the declared "main gateway for ALL text generation"
LADDER        EXISTS · PARTICIPATES · DECIDES
HAS AUTHORITY NOT ASSIGNED — G-01: "GOVERNANCE GATE | NONE FOUND at runtime"; G §4 U-6: "Provider
              admission as declared in that file has no runtime expression." ⛔ An effect, never an
              authorization.
BASIS         PARTICIPATES — G-01: "CANONICAL CALL PATH | app/api/sovereign/app/maia/list/route.ts:89,
              1364-1365 → getMaiaResponse() → generateText() at maiaService.ts:1561 (FAST)".
              DECIDES — G-01: "SYSTEM AUTHORITY | Total, via process environment… an unrecognized
              value falls through every branch to the local Ollama call at :187."
              ⚠️ Production value of MAIA_INFERENCE_MODE: UNKNOWN (G-01 UNRESOLVED).
```

```text
ROW ID        P3-G-02
NAMED OBJECT  generateTextWithSovereignty / degradedResult() / DEGRADED_TEXT — DEGRADING disposition
LADDER        EXISTS · PARTICIPATES · CONTRIBUTES · DECIDES
HAS AUTHORITY NOT ASSIGNED — G-02: "GOVERNANCE GATE | NONE FOUND. The mode string is passed through
              from modelService.ts:10 unvalidated". INF-3: a mode selecting behaviour authorizes nothing.
BASIS         PARTICIPATES — G-02: "CANONICAL CALL PATH | modelService.ts:83-85 →
              generateTextWithSovereignty(req, MAIA_INFERENCE_MODE, t0)."
              DECIDES — G-02 CAPABILITY: "Routes a plain-text request under an explicit inference mode
              and decides what happens when a provider fails."
              CONTRIBUTES — G-02 obs. 1: "The degraded string is returned as MAIA's turn, not as an
              error"; G-02 MAIA AUTHORITY: "the seam emits text in MAIA's first person without any
              MAIA cognition having run."
              ⛔ PERSISTENCE — UNKNOWN. Register P3-G-02 CARRIED FINDING, AS RATIFIED: "The emitting
              seam makes a persistence claim it does not itself discharge; end-to-end truth of that
              claim is caller-dependent and presently unresolved." ⛔ No position is assigned on it.
```

```text
ROW ID        P3-G-03
NAMED OBJECT  generateWithClaude / selectClaudeModel
LADDER        EXISTS · PARTICIPATES · KNOWS · DECIDES
              ⛔⛔ CONSIDERS EXPLICITLY NOT ASSIGNED — G-03: "At the subject, selectClaudeModel()
              never reads an awareness level." ⭐ The record establishes KNOWS WITHOUT CONSIDERS;
              inferring one from the other is exactly what INF-6 forbids.
HAS AUTHORITY NOT ASSIGNED — G-03: "GOVERNANCE GATE | NONE FOUND. meta is an untyped
              Record<string, unknown> (:91); forceOpus / forceSonnet / reasoningMode are read
              straight from it with no provenance check on who set them."
BASIS         PARTICIPATES — G §2 table: "Anthropic | @anthropic-ai/sdk | claudeClient.ts:149".
              KNOWS — G-03: "The awareness level appears in this file exclusively inside a log string
              — consciousnessPolicy?.awarenessLevel → awarenessLog (claudeClient.ts:136-140)."
              DECIDES — G-03: "SELECTION RULE, AS READ | forceOpus → Opus (:70-72); … everything else
              → Sonnet (:85)"; G §2: "The two that decide a conversational turn: claudeClient.ts:13-14".
```

```text
ROW ID        P3-G-04
NAMED OBJECT  runStructured + resolveStructuredMode() + EXTERNAL_AUTHORIZED — REFUSING disposition
LADDER        EXISTS · PARTICIPATES · DECIDES
HAS AUTHORITY NOT ASSIGNED. ⭐ The nearest authorization language in domain G sits here — G-04:
              "the platform owns whether the provider is authorized (policy.ts:9-13)" — but the
              register records "GOVERNING SOURCE NONE LOCATED (the rule is stated in the module:
              router.ts:4, :30-31, :121-124)". ⛔ Per INF-4 a module stating its own rule is
              implementation evidence, not a located authorization.
BASIS         PARTICIPATES — G-04: "CANONICAL CALL PATH | 5 non-test callers: maiaReader.ts:51,738 ·
              askReader.ts:22,232 · developmentalAskReader.ts:33,206 · developmentalReader/read.ts:26,123
              · developmentalReading/classify.ts:23,209."
              DECIDES — G-04: "FAILURE MODE | ⭐ REFUSES. execute() catch → { ok:false,
              refusal:'provider_unavailable', detail } … 'THE FAILURE STOPS HERE. No second provider,
              no local text path, no degraded template.'"
```

```text
ROW ID        P3-G-05
NAMED OBJECT  isLocalHealthy / callLocalInference (maia-local-inference)
LADDER        EXISTS · PARTICIPATES
HAS AUTHORITY NOT ASSIGNED — G-05: "GOVERNANCE GATE NONE FOUND."
BASIS         PARTICIPATES — G §2 table: "maia-local-inference | http://maia-local-inference:8080
              (localInferenceClient.ts:10) | Selected at sovereignRouter.ts:80,120".
              ⛔ DECIDES NOT ASSIGNED — the record states the circuit breaker is "tripped on health
              failure (:45) and on generate failure (:91)" but does not establish that this object
              determines the turn's outcome; the routing decision is recorded at P3-G-02. UNKNOWN.
              ⭐ Recorded: "No model is named on the sovereign text path."
```

```text
ROW ID        P3-G-06
NAMED OBJECT  localModelClient (Ollama / DeepSeek) at modelService.ts:187 — LOCAL-FALLBACK disposition
LADDER        EXISTS · PARTICIPATES · CONTRIBUTES
HAS AUTHORITY NOT ASSIGNED — G-06: "GOVERNANCE GATE NONE FOUND."
BASIS         PARTICIPATES — G-06: "CALL PATH | modelService.ts:187 — the unconditional terminal
              branch of the legacy path."
              CONTRIBUTES — G-06: "TEMPLATE ENGINE | localModelClient.ts:56 returns
              model: 'template-engine' under the consciousness_engine provider — a fourth
              answer-producing path that is not a model at all."
              ⛔ DECIDES NOT ASSIGNED — the record places the selection at modelService (P3-G-01),
              not here. ⭐ Recorded: "No drift event is emitted at all" (register, DISPOSITION 1).
```

```text
ROW ID        P3-G-07
NAMED OBJECT  kimiClient + its two triggers (Moonshot / Kimi)
LADDER        EXISTS · PARTICIPATES
HAS AUTHORITY NOT ASSIGNED — G-07: "GOVERNANCE GATE | NONE FOUND, at any layer. moonshot appears in
              no tier of scripts/provider-policy.json (neither production, lab, nor forbidden)."
BASIS         PARTICIPATES — G-07: "CALL PATH | modelService.ts:127-151. Two independent triggers:
              TEXT_MODEL_PROVIDER === 'moonshot' or req.meta?.useKimi — i.e. a per-request meta flag
              from any caller selects a third-party cloud provider."
              ⛔ DECIDES NOT ASSIGNED — the selection is recorded at modelService (P3-G-01); the
              declared scope and the trigger disagree (C-6, see the disagreement section).
```

```text
ROW ID        P3-G-08
NAMED OBJECT  generateWithMultipleEngines / OrchestrationType
LADDER        EXISTS · PARTICIPATES · CONTRIBUTES
HAS AUTHORITY NOT ASSIGNED — G-08: "GOVERNANCE GATE NONE FOUND."
BASIS         PARTICIPATES — G-08: "CALL PATH | modelService.ts:94-123, gated by ENABLE_MULTI_ENGINE …
              AND (TEXT_MODEL_PROVIDER === 'multi_engine' OR req.meta?.useMultiEngine)."
              CONTRIBUTES — G-08: "RESULT SHAPE | text: consensus || primaryResponse (:113),
              model: `orchestration:${type}` (:116) — ⭐ the model field records an orchestration
              label, not a model."
              ⛔ DECIDES NOT ASSIGNED — reading `consensus || primaryResponse` as a decision would be
              interpretation, not restatement. UNKNOWN.
```

```text
ROW ID        P3-G-09
NAMED OBJECT  MODEL_REGISTRY / selectOptimalModel / getModelFallbackChain; field minimumBloomLevel?
LADDER        EXISTS
HAS AUTHORITY NOT ASSIGNED — G-09: "GOVERNANCE GATE NONE FOUND."
BASIS         EXISTS — G-09: "⭐ No importer exists. A tree-wide grep for modelRegistry outside the
              file itself returns one hit, a prose comment in lib/types/interpretive-ledger.ts:25."
              ⭐⭐ NON-MONOTONIC, RECORDED: the file declares "minimumBloomLevel? — 'Developmental gate
              (if applicable)' (:31) — i.e. a model gate keyed to a developmental attribute of a
              person", and G §6 records "no evaluator and no importer found". ⛔ A declared gate that
              decides nothing is EXISTS and nothing above it. "Whether minimumBloomLevel was ever
              evaluated anywhere. Not traced." — UNKNOWN.
```

```text
ROW ID        P3-G-10
NAMED OBJECT  scripts/anthropic-import-allowlist.json and the 60 files it enumerates
LADDER        EXISTS · PARTICIPATES · DECIDES
HAS AUTHORITY NOT ASSIGNED — G-10: "GOVERNANCE GATE | Build/commit-time only (G-13). NONE FOUND at
              runtime — nothing prevents these files executing." INF-2 applies.
BASIS         PARTICIPATES — G-10: "MEMBER-FACING ENTRIES | Includes 7 HTTP route handlers".
              DECIDES — G-10, same row, verbatim from the allowlist: "app/api/maia/living-field/
              [fieldKey]/encounter/route.ts ('Cognitive surface, pins Sonnet') · .../refine/route.ts
              ('pins Haiku') … ('pins Sonnet')" — each surface pins its own model.
              ⭐ Recorded — G-10: seven entries "shipped AFTER this guard landed (2026-05-20) without
              being allowlisted — their lanes did not exercise preflight/pre-commit, so the guard
              never fired."
```

```text
ROW ID        P3-G-11
NAMED OBJECT  the OpenAI SDK / api.openai.com surface in lib/ + app/ (excluding app/api/_backend/)
LADDER        EXISTS · PARTICIPATES
HAS AUTHORITY UNKNOWN — RECORDS DISAGREE (C-2, both sides in the disagreement section). ⛔ Not
              assigned, and ⛔ not refused: the two located texts cannot both be restated as one fact.
BASIS         PARTICIPATES — G-11: "CURRENT STATUS | WIRED-BUT-UNOBSERVED (code present and
              reachable; no runtime witness in-repo)"; "VERIFIED AT SUBJECT | a grep … returns 30 files".
              ⛔ DECIDES NOT ASSIGNED — the record enumerates files and does not trace what any of
              them determines. G-11 COVERAGE: NOT DETERMINED BY SOURCE RECORD.
```

```text
ROW ID        P3-G-12
NAMED OBJECT  scripts/check-provider-governance.ts + scripts/provider-policy.json (check:no-openai)
LADDER        EXISTS · PARTICIPATES · DECIDES     (with respect to the commit/CI lane)
HAS AUTHORITY NOT ASSIGNED — the policy file is read BY the guard, and no located text authorizes the
              guard; register: "docs/canon/PROVIDER_GOVERNANCE.md named by the policy file's _doc key
              and NOT READ at the subject" — so no authorization was located, ⛔ not that none exists.
BASIS         PARTICIPATES — G-12: "WIRING | package.json:45 check:no-openai; run by preflight (:111),
              ci:sovereignty (:109), and .githooks/pre-commit:39."
              DECIDES — G-12: "Exit 1 on any hit outside the allowlist (:111); exit 2 if the policy
              file is missing (:48)."
              ⚠️ Scope, verbatim — G-12: "BUILD-TIME, NOT RUNTIME. It prevents new source surfaces.
              It has no effect on a running container." INF-2: CI-GATED ↛ runtime governed.
              ⭐ Recorded — G-12: "'or other cloud AI providers' has no mechanical expression anywhere
              in the repository."
```

```text
ROW ID        P3-G-13
NAMED OBJECT  scripts/check-no-direct-anthropic.ts
LADDER        EXISTS · PARTICIPATES · DECIDES     (with respect to the commit lane)
HAS AUTHORITY NOT ASSIGNED — G-13, verbatim: "SELF-DECLARED AUTHORITY :32-34 cites CLAUDE.md — MAIA
              Sovereignty section and two docs/orientation/ documents. It cites no canon document,
              and no canon document names it." G §4 U-2: "its governing source is UNLOCATED."
BASIS         PARTICIPATES — G-13: "WIRING | package.json:42; preflight (:111); .githooks/pre-commit:43.
              ⛔ Note it is not in ci:sovereignty (package.json:109)".
              DECIDES — G-13: "Any importer not in approved ∪ operational ∪ grandfathered fails with
              exit 1 (:125, :196). Missing or unparseable allowlist → exit 2."
```

```text
ROW ID        P3-G-14
NAMED OBJECT  emitDriftEvent / DriftEventType (incl. 'silent_fallback')
LADDER        EXISTS · PARTICIPATES · CONTRIBUTES
              ⛔⛔ CONTRIBUTES-TO-MEMBER EXPLICITLY NOT ASSIGNED — G-14: "AUDIENCE | ⭐ Operator/
              practitioner, never the member. Nothing in this path reaches a member surface."
HAS AUTHORITY NOT ASSIGNED — G-14: "GOVERNANCE GATE NONE FOUND."
BASIS         PARTICIPATES — G-14: "CALL SITES | sovereignRouter.ts:105 (provider),
              lib/maia/fieldContextAdapter.ts:101,118,127 (field — a different domain)."
              CONTRIBUTES — G-14: "Always writes console.warn with { kind:'drift_alarm', … }; then,
              if TELEGRAM_BOT_TOKEN and PRACTITIONER_TELEGRAM_CHAT_ID are set … fires a Telegram
              message."
              ⭐ Coverage of the four degraded exits is nil by construction — register P3-G-14:
              "the one emitDriftEvent('silent_fallback', …) at :105 is on none of them."
```

```text
ROW ID        P3-G-15
NAMED OBJECT  ReaderProvenance / ReaderIdentity / readerIdentity(model)
LADDER        EXISTS · PARTICIPATES · KNOWS · CONTRIBUTES
HAS AUTHORITY NOT ASSIGNED — register P3-G-15: "GOVERNING SOURCE NONE LOCATED (G §4 U-3)."
BASIS         PARTICIPATES / CONTRIBUTES — G-15: "PERSISTED WHERE | proposalStore.ts:179-180 stamps
              frozenAt at the write; read back at :206 from row.reader_provenance."
              KNOWS — G-15: "⭐ An identity of the reading, not of MAIA: provider + model + a SHA-256
              over system prompt and tool contract together + a reader version. It is the only object
              traced in this domain that binds who read to what was produced."
              ⛔ IDENTITY ACROSS PROVIDER CHANGE — UNKNOWN by construction. G-15: "provider is the
              string literal type 'anthropic' … A different provider is not representable in this
              record." Register, as ratified: that is ⛔ not an establishment of discontinuity.
```

```text
ROW ID        P3-G-16
NAMED OBJECT  scripts/deploy-lock.sh (acquire_deploy_lock()), which also exports DEPLOY_LANE_TOKEN
LADDER        EXISTS · PARTICIPATES · DECIDES     (with respect to the deploy lane)
HAS AUTHORITY ⛔ NOT ASSIGNED — and this is the closest call in domain G, so both texts are kept.
              FOR — G-16: "⭐ It also exports DEPLOY_LANE_TOKEN='deploy-lane' (:185) — the single
              mechanism that makes the Dockerfile tripwire (G-17) satisfiable. Acquiring the lock is
              the grant of build authority."
              AGAINST — G-17, the file's own limit: "a tripwire against the QUIET bypass, not a
              forgery-proof credential"; and register P3-G-16: "GOVERNING SOURCE NONE LOCATED;
              docs/ops/DEPLOY_LANE_TOKEN.md is named but NOT READ."
              ⛔ A mechanism that conveys a token is not thereby a located authorization of itself.
BASIS         PARTICIPATES — G-16: "ENTRY POINTS THAT TAKE IT | deploy-production.sh deploy (:452),
              update (:555), migrate (:640), rollback (:746); pre-deploy-gate.sh deploy-maia (:234)."
              DECIDES — G-16: "exclusive non-blocking flock -n on fd 9 … never queues, refuses with
              exit 1 and prints the holder's pid= started= user= entry= target= target_sha=."
```

```text
ROW ID        P3-G-17
NAMED OBJECT  Dockerfile deploy-lane tripwire + deploy_ctx_materialize / _verify_image /
              _verify_running / _refuse_compose_runtime_override / _refuse_env_collision
LADDER        EXISTS · PARTICIPATES · DECIDES     (with respect to the deploy lane)
HAS AUTHORITY NOT ASSIGNED — G-17: the file "states its own limit: 'a tripwire against the QUIET
              bypass, not a forgery-proof credential' (:20-21)"; register: "GOVERNING SOURCE NONE
              LOCATED; docs/ops/IMMUTABLE_SHA_DEPLOY.md and docs/ops/COLAB_RELEASE_GATE.md are named
              but NOT READ."
BASIS         PARTICIPATES — G-17: "PRE-DEPLOY GATE | … deploy-maia sequence at :228-265: lock →
              materialize → gates → build → verify image → tag_images_for_rollback → swap → verify
              running."
              DECIDES — G-17: "TRIPWIRE | Dockerfile:23-42 — ARG DEPLOY_LANE_TOKEN=''; a build with it
              empty prints '🛑 OUT-OF-LANE BUILD REFUSED' and exit 1"; and "pre-swap image check
              deploy_ctx_verify_image (:375-389, blocks on mismatch)".
```

```text
ROW ID        P3-G-18
NAMED OBJECT  run_migrations_or_abort / cmd_migrate / the compose migrate service
LADDER        EXISTS · PARTICIPATES · DECIDES     (with respect to the deploy lane)
HAS AUTHORITY NOT ASSIGNED, and the two halves are kept separate.
              FAIL-CLOSED BEHAVIOUR — G-18: "Attributed in-file to DEPLOYMENT-SAFETY-01, founder
              ruling 2026-09-14 (:61)"; register qualifies it: "⚠️ attributed in-file … for the
              fail-closed behaviour only". ⛔ The ruling document itself was not located or read, so
              an attribution is recorded, ⛔ not a located authorization.
              MIGRATION SELECTION — G-18: "SEPARATE MIGRATION GATE | ⭐⭐ NONE FOUND … no SHA argument,
              no migration selection, no per-migration authorization."
BASIS         PARTICIPATES — G-18: "ORDER, AS READ | deploy (:448-546): lock → materialize → build →
              swap → provenance verify → migrate (:538) → success (:540) → smoke (:546)."
              DECIDES — G-18: "Migration failure now aborts — run_migrations_or_abort prints
              '⛔ DATABASE MIGRATIONS FAILED — DEPLOYMENT ABORTED' and exit 1 (:93, :117)."
              ⭐ Recorded verbatim, G-18: "It applies whatever migration files are present, in bulk."
```
