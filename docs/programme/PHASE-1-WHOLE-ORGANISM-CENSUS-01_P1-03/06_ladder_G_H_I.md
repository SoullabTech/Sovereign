# P1-03 · BOUNDED LADDER DERIVATION — DOMAINS G · H · I

```text
STEP        P1-03 · LADDER PASS (Amendment 2 · Ruling 1), refined mid-flight by Amendment 3
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — restatement of what existing record prose already establishes
INPUTS      P1-03/03_normalized_G_H_I.md · P1-02/{G_orchestration,H_sensory_voice,I_member_practitioner}.md
BOUND BY    P1-03 instrument §2 (INF-1…INF-5) · §3 prohibitions · §4 ·
            Amendment 2 §2 (INF-6), §3 · Amendment 3 §1, §2, §4
ROWS        48 — G 18 · H 18 · I 12
```

> ⛔ **No source code, governing document, test or runtime witness was read.** Records only.
> ⛔ No contradiction resolved · ⛔ no position assigned that record prose does not support ·
> ⛔ nothing rated, scored or recommended · ⛔ no exploitability, severity or risk assessed ·
> ⛔ the separately-owned authorization/exposure lane is neither cited, awaited nor answered.
> Domain I's own discipline — *record only; open nothing* — is held exactly.

⚠️ **CONTENT DISCIPLINE**: paths, field names, column names, route shapes and authorization
predicates only. No member content, no credential or token value, no identifier of any real person.

---

## Reading conventions — declared, not assumed

⭐ The three P1-02 records never use the ladder vocabulary. A reading rule is therefore unavoidable;
⛔ adopting one silently is what the `E1/E2/E3/E4` episode cost. It is declared so it is checkable,
and ⛔ can be corrected without re-running anything.

```text
PARTICIPATION AXIS
EXISTS         the record verifies the artifact present at the subject
PARTICIPATES   the record traces a call path reaching it, or from it into a reached path
KNOWS          the record establishes that a fact reaches it, or that it reads one
CONSIDERS      the record establishes that a fact it holds is read into a computation
CONTRIBUTES    the record establishes that its output enters a member-facing turn, a prompt,
               a practitioner-facing surface, or a stored record
DECIDES        the record's own words establish that it determines an outcome
UNKNOWN        silent · ambiguous · records disagree

AUTHORITY STANDING AXIS  (Amendment 3 §2 — ⛔ NOT a rung, and never inferred from the other axis)
GOVERNED       a governing source is located AND names this object or operation
NONE LOCATED   the record searched and records NONE FOUND / NONE LOCATED
UNKNOWN        a governing text is named but NOT READ, or two located texts disagree
```

⛔⛔ **INF-6 applied throughout.** No position is inferred from any other, and authority is never
inferred from `DECIDES`. Where the record's own words use **authorization language** about an act —
*authorizes*, *is authorized*, *the grant of authority* — that clause is quoted in the row; ⛔ a
member act that is only an INPUT to a predicate is recorded as member authority in the entry text,
⛔ never as authority standing.

⭐ **`EXISTS` is recovered on all 48 rows** because all three records verify subject-identity of every
citation (G §0 *"every `file:line` below is a reading at the subject"*; H §0 *"Every code path in this
domain is byte-identical between the census subject and the working tree read"*; I *"Every `file:line`
below is a claim about the subject"*). ⛔ It is the weakest rung and must not be read as evidence
density — the counts section separates it out.

⚠️ For domain I, and for the deploy/commit instruments in domain G, participation is read with respect
to the path the record actually traces (member/practitioner visibility; the deploy lane), ⛔ not with
respect to MAIA cognition — the register records `COVERAGE NOT APPLICABLE` for those rows.

---

## DOMAIN G — MODEL / PROVIDER / ORCHESTRATION

```text
ROW                 P3-G-01
NAMED OBJECT        generateText(req: TextRequest) — declared "main gateway for ALL text generation"
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES
BASIS               PARTICIPATES — "CANONICAL CALL PATH | app/api/sovereign/app/maia/list/route.ts:89,
                    1364-1365 → getMaiaResponse() … → generateText() at maiaService.ts:1561 (FAST)"
                    DECIDES — "SYSTEM AUTHORITY | Total, via process environment… an unrecognized
                    value falls through every branch to the local Ollama call at :187."
SOURCE RECORD       G_orchestration.md §1 G-01; §4 U-6 · register P3-G-01
AUTHORITY STANDING  NONE LOCATED — G-01: "GOVERNANCE GATE | NONE FOUND at runtime"; G §4 U-6:
                    "Provider admission as declared in that file has no runtime expression."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-02
NAMED OBJECT        generateTextWithSovereignty / degradedResult() / DEGRADED_TEXT — DEGRADING
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES · DECIDES
BASIS               PARTICIPATES — "CANONICAL CALL PATH | modelService.ts:83-85 →
                    generateTextWithSovereignty(req, MAIA_INFERENCE_MODE, t0)."
                    DECIDES — G-02 CAPABILITY: "Routes a plain-text request under an explicit
                    inference mode and decides what happens when a provider fails."
                    CONTRIBUTES — G-02 obs. 1: "The degraded string is returned as MAIA's turn, not
                    as an error"; MAIA AUTHORITY: "the seam emits text in MAIA's first person
                    without any MAIA cognition having run."
                    ⛔ PERSISTENCE — UNKNOWN. Register: "The emitting seam makes a persistence claim
                    it does not itself discharge; end-to-end truth of that claim is caller-dependent
                    and presently unresolved." ⛔ No position assigned on it.
SOURCE RECORD       G_orchestration.md §1 G-02 + four structural observations; §3 C-1, C-5
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE | NONE FOUND. The mode string is passed through
                    from modelService.ts:10 unvalidated". INF-3: a mode selecting behaviour
                    authorizes nothing.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-03
NAMED OBJECT        generateWithClaude / selectClaudeModel
PARTICIPATION       EXISTS · PARTICIPATES · KNOWS · DECIDES
                    ⛔⛔ CONSIDERS EXPLICITLY NOT ASSIGNED — "At the subject, selectClaudeModel()
                    never reads an awareness level." ⭐ KNOWS WITHOUT CONSIDERS, established by the
                    record; inferring one from the other is what INF-6 forbids.
BASIS               PARTICIPATES — G §2 table: "Anthropic | @anthropic-ai/sdk | claudeClient.ts:149"
                    KNOWS — "The awareness level appears in this file exclusively inside a log
                    string — consciousnessPolicy?.awarenessLevel → awarenessLog (:136-140)."
                    DECIDES — "SELECTION RULE, AS READ | forceOpus → Opus (:70-72); … everything
                    else → Sonnet (:85)"; G §2: "The two that decide a conversational turn".
SOURCE RECORD       G_orchestration.md §1 G-03; §3 C-4; §4 U-1
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE | NONE FOUND. meta is an untyped
                    Record<string, unknown> (:91); forceOpus / forceSonnet / reasoningMode are read
                    straight from it with no provenance check on who set them."
                    ⚠️ ADR-001 is located and Accepted but the record states the code no longer
                    implements it and "No superseding ADR or ruling was located" — carried as C-4.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-04
NAMED OBJECT        runStructured + resolveStructuredMode() + EXTERNAL_AUTHORIZED — REFUSING
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES
BASIS               PARTICIPATES — "CANONICAL CALL PATH | 5 non-test callers: maiaReader.ts:51,738 ·
                    askReader.ts:22,232 · developmentalAskReader.ts:33,206 ·
                    developmentalReader/read.ts:26,123 · developmentalReading/classify.ts:23,209."
                    DECIDES — "FAILURE MODE | ⭐ REFUSES. execute() catch → { ok:false,
                    refusal:'provider_unavailable', detail } … 'THE FAILURE STOPS HERE. No second
                    provider, no local text path, no degraded template.'"
SOURCE RECORD       G_orchestration.md §1 G-04; §5 Q4 · register P3-G-04
AUTHORITY STANDING  NONE LOCATED. ⭐ The nearest authorization language in domain G is here — G-04:
                    "the platform owns whether the provider is authorized (policy.ts:9-13)" — and
                    the register records "GOVERNING SOURCE NONE LOCATED (the rule is stated in the
                    module: router.ts:4, :30-31, :121-124)". ⛔ Per INF-4 a module stating its own
                    rule is implementation evidence, not a located authorization.
                    ⭐ Gate present at runtime: "the only structural runtime provider gate found in
                    Domain G" — recorded, ⛔ not converted into authority standing.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-05
NAMED OBJECT        isLocalHealthy / callLocalInference (maia-local-inference)
PARTICIPATION       EXISTS · PARTICIPATES
BASIS               PARTICIPATES — G §2 table: "maia-local-inference | http://maia-local-inference:8080
                    (localInferenceClient.ts:10) | Selected at sovereignRouter.ts:80,120"
                    ⛔ DECIDES UNKNOWN — the record states the breaker is "tripped on health failure
                    (:45) and on generate failure (:91)" but does not establish that this object
                    determines the turn's outcome; the routing decision is recorded at P3-G-02.
                    ⭐ Recorded: "No model is named on the sovereign text path."
SOURCE RECORD       G_orchestration.md §1 G-05
AUTHORITY STANDING  NONE LOCATED — G-05: "GOVERNANCE GATE NONE FOUND."
```

```text
ROW                 P3-G-06
NAMED OBJECT        localModelClient (Ollama / DeepSeek) at modelService.ts:187 — LOCAL FALLBACK
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES
BASIS               PARTICIPATES — "CALL PATH | modelService.ts:187 — the unconditional terminal
                    branch of the legacy path."
                    CONTRIBUTES — "TEMPLATE ENGINE | localModelClient.ts:56 returns
                    model: 'template-engine' under the consciousness_engine provider — a fourth
                    answer-producing path that is not a model at all."
                    ⛔ DECIDES NOT ASSIGNED — the record places the selection at modelService
                    (P3-G-01), not here. ⭐ Register, DISPOSITION 1: "No drift event is emitted at all."
SOURCE RECORD       G_orchestration.md §1 G-06; §3 C-1 (third behaviour) · register DISPOSITION 1
AUTHORITY STANDING  NONE LOCATED — G-06: "GOVERNANCE GATE NONE FOUND."
INF-6               EFFECT established (CONTRIBUTES · answer-producing, member-facing) ·
                    HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-07
NAMED OBJECT        kimiClient + its two triggers (Moonshot / Kimi)
PARTICIPATION       EXISTS · PARTICIPATES
BASIS               PARTICIPATES — "CALL PATH | modelService.ts:127-151. Two independent triggers:
                    TEXT_MODEL_PROVIDER === 'moonshot' or req.meta?.useKimi — i.e. a per-request
                    meta flag from any caller selects a third-party cloud provider."
                    ⛔ DECIDES NOT ASSIGNED — the selection is recorded at P3-G-01; declared scope
                    and trigger disagree (C-6, preserved below).
SOURCE RECORD       G_orchestration.md §1 G-07; §3 C-2 (second limb), C-6; §4 U-4
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE | NONE FOUND, at any layer. moonshot appears in
                    no tier of scripts/provider-policy.json (neither production, lab, nor forbidden)."
```

```text
ROW                 P3-G-08
NAMED OBJECT        generateWithMultipleEngines / OrchestrationType
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES
BASIS               PARTICIPATES — "CALL PATH | modelService.ts:94-123, gated by ENABLE_MULTI_ENGINE
                    … AND (TEXT_MODEL_PROVIDER === 'multi_engine' OR req.meta?.useMultiEngine)."
                    CONTRIBUTES — "RESULT SHAPE | text: consensus || primaryResponse (:113),
                    model: `orchestration:${type}` (:116) — ⭐ the model field records an
                    orchestration label, not a model."
                    ⛔ DECIDES UNKNOWN — reading `consensus || primaryResponse` as a decision would
                    be interpretation, not restatement.
SOURCE RECORD       G_orchestration.md §1 G-08; §4 U-5
AUTHORITY STANDING  NONE LOCATED — G-08: "GOVERNANCE GATE NONE FOUND."
INF-6               EFFECT established (CONTRIBUTES · the text of a conversational TextResult) ·
                    HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-09
NAMED OBJECT        MODEL_REGISTRY / selectOptimalModel / getModelFallbackChain; minimumBloomLevel?
PARTICIPATION       EXISTS
BASIS               "⭐ No importer exists. A tree-wide grep for modelRegistry outside the file
                    itself returns one hit, a prose comment in lib/types/interpretive-ledger.ts:25."
                    ⭐⭐ NON-MONOTONIC, RECORDED: the file declares "minimumBloomLevel? —
                    'Developmental gate (if applicable)' (:31) — i.e. a model gate keyed to a
                    developmental attribute of a person, declared as a type field", and G §6 records
                    "no evaluator and no importer found". ⛔ A declared gate that decides nothing is
                    EXISTS and nothing above it. "Whether minimumBloomLevel was ever evaluated
                    anywhere. Not traced." — UNKNOWN.
SOURCE RECORD       G_orchestration.md §1 G-09; §6; §7 Q8
AUTHORITY STANDING  NONE LOCATED — G-09: "GOVERNANCE GATE NONE FOUND."
```

```text
ROW                 P3-G-10
NAMED OBJECT        scripts/anthropic-import-allowlist.json and the 60 files it enumerates
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES
BASIS               PARTICIPATES — "MEMBER-FACING ENTRIES | Includes 7 HTTP route handlers".
                    DECIDES — verbatim from the allowlist rows: "app/api/maia/living-field/
                    [fieldKey]/encounter/route.ts ('Cognitive surface, pins Sonnet') ·
                    .../refine/route.ts ('pins Haiku') … ('pins Sonnet')" — each pins its own model.
                    ⭐ Recorded: seven entries "shipped AFTER this guard landed (2026-05-20) without
                    being allowlisted — their lanes did not exercise preflight/pre-commit, so the
                    guard never fired."
SOURCE RECORD       G_orchestration.md §1 G-10; §3 C-3; §7 Q10
AUTHORITY STANDING  NONE LOCATED at runtime — "GOVERNANCE GATE | Build/commit-time only (G-13).
                    NONE FOUND at runtime — nothing prevents these files executing." INF-2 applies.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-11
NAMED OBJECT        the OpenAI SDK / api.openai.com surface in lib/ + app/ (excl. app/api/_backend/)
PARTICIPATION       EXISTS · PARTICIPATES
BASIS               PARTICIPATES — "CURRENT STATUS | WIRED-BUT-UNOBSERVED (code present and
                    reachable; no runtime witness in-repo)"; "VERIFIED AT SUBJECT | a grep for
                    from 'openai' / new OpenAI( / api.openai.com … returns 30 files".
                    ⛔ DECIDES UNKNOWN — the record enumerates files and traces no determination.
SOURCE RECORD       G_orchestration.md §1 G-11; §3 C-2; §6
AUTHORITY STANDING  UNKNOWN — RECORDS DISAGREE (C-2, both sides preserved below), and the named
                    human policy "docs/canon/PROVIDER_GOVERNANCE.md" is "NOT READ in this census".
                    ⛔ Not derived across.
```

```text
ROW                 P3-G-12
NAMED OBJECT        scripts/check-provider-governance.ts + scripts/provider-policy.json
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES     (commit / CI lane)
BASIS               PARTICIPATES — "WIRING | package.json:45 check:no-openai; run by preflight
                    (:111), ci:sovereignty (:109), and .githooks/pre-commit:39."
                    DECIDES — "Exit 1 on any hit outside the allowlist (:111); exit 2 if the policy
                    file is missing (:48)."
                    ⚠️ Scope, verbatim: "BUILD-TIME, NOT RUNTIME. It prevents new source surfaces.
                    It has no effect on a running container." INF-2: CI-GATED ↛ runtime governed.
                    ⭐ Recorded: "'or other cloud AI providers' has no mechanical expression
                    anywhere in the repository."
SOURCE RECORD       G_orchestration.md §1 G-12; §6
AUTHORITY STANDING  UNKNOWN — a policy file is located and read by the guard, and the human policy
                    it names, "docs/canon/PROVIDER_GOVERNANCE.md", is "NOT READ in this census. …
                    its content, status and ratification are UNKNOWN here."
INF-6               DECIDES established (commit admission) · HAS AUTHORITY not established ·
                    INF-6 prevents promotion
```

```text
ROW                 P3-G-13
NAMED OBJECT        scripts/check-no-direct-anthropic.ts
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES     (commit lane)
BASIS               PARTICIPATES — "WIRING | package.json:42; preflight (:111);
                    .githooks/pre-commit:43. ⛔ Note it is not in ci:sovereignty (package.json:109)."
                    DECIDES — "Any importer not in approved ∪ operational ∪ grandfathered fails
                    with exit 1 (:125, :196). Missing or unparseable allowlist → exit 2."
SOURCE RECORD       G_orchestration.md §1 G-13; §4 U-2; §6
AUTHORITY STANDING  NONE LOCATED — verbatim: "SELF-DECLARED AUTHORITY :32-34 cites CLAUDE.md — MAIA
                    Sovereignty section and two docs/orientation/ documents. It cites no canon
                    document, and no canon document names it." G §4 U-2: "Verified to exist; its
                    governing source is UNLOCATED."
INF-6               DECIDES established (commit admission) · HAS AUTHORITY not established ·
                    INF-6 prevents promotion
```

```text
ROW                 P3-G-14
NAMED OBJECT        emitDriftEvent / DriftEventType (incl. 'silent_fallback')
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES (operator / practitioner surface)
                    ⛔⛔ CONTRIBUTES-TO-MEMBER EXPLICITLY NOT ASSIGNED — "AUDIENCE | ⭐ Operator/
                    practitioner, never the member. Nothing in this path reaches a member surface."
BASIS               PARTICIPATES — "CALL SITES | sovereignRouter.ts:105 (provider),
                    lib/maia/fieldContextAdapter.ts:101,118,127 (field — a different domain)."
                    CONTRIBUTES — "Always writes console.warn with { kind:'drift_alarm', … }; then,
                    if TELEGRAM_BOT_TOKEN and PRACTITIONER_TELEGRAM_CHAT_ID are set … fires a
                    Telegram message."
                    ⭐ Coverage of the four degraded exits is nil by construction — register: "the
                    one emitDriftEvent('silent_fallback', …) at :105 is on none of them."
SOURCE RECORD       G_orchestration.md §1 G-14; §5 Q3; §7 Q3
AUTHORITY STANDING  NONE LOCATED — G-14: "GOVERNANCE GATE NONE FOUND."
```

```text
ROW                 P3-G-15
NAMED OBJECT        ReaderProvenance / ReaderIdentity / readerIdentity(model)
PARTICIPATION       EXISTS · PARTICIPATES · KNOWS · CONTRIBUTES (stored record)
BASIS               PARTICIPATES / CONTRIBUTES — "PERSISTED WHERE | proposalStore.ts:179-180 stamps
                    frozenAt at the write; read back at :206 from row.reader_provenance."
                    KNOWS — "⭐ An identity of the reading, not of MAIA: provider + model + a
                    SHA-256 over system prompt and tool contract together + a reader version. It is
                    the only object traced in this domain that binds who read to what was produced."
                    ⛔ IDENTITY ACROSS PROVIDER CHANGE — UNKNOWN by construction: "provider is the
                    string literal type 'anthropic' … A different provider is not representable in
                    this record." Register, as ratified: ⛔ that is not an establishment of
                    identity discontinuity.
SOURCE RECORD       G_orchestration.md §1 G-15; §5 Q3; §4 U-3
AUTHORITY STANDING  NONE LOCATED — register P3-G-15: "GOVERNING SOURCE NONE LOCATED (G §4 U-3)."
```

```text
ROW                 P3-G-16
NAMED OBJECT        scripts/deploy-lock.sh (acquire_deploy_lock()), exporter of DEPLOY_LANE_TOKEN
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES     (deploy lane)
BASIS               PARTICIPATES — "ENTRY POINTS THAT TAKE IT | deploy-production.sh deploy (:452),
                    update (:555), migrate (:640), rollback (:746); pre-deploy-gate.sh deploy-maia
                    (:234)."
                    DECIDES — "exclusive non-blocking flock -n on fd 9 … never queues, refuses with
                    exit 1 and prints the holder's pid= started= user= entry= target= target_sha=."
SOURCE RECORD       G_orchestration.md §1 G-16; §5 Q5 · register P3-G-16
AUTHORITY STANDING  NONE LOCATED — and this is the closest call in domain G, so both texts are kept.
                    FOR — G-16: "⭐ It also exports DEPLOY_LANE_TOKEN='deploy-lane' (:185) — the
                    single mechanism that makes the Dockerfile tripwire (G-17) satisfiable.
                    Acquiring the lock is the grant of build authority."
                    AGAINST — G-17, the file's own limit: "a tripwire against the QUIET bypass, not
                    a forgery-proof credential"; register: "GOVERNING SOURCE NONE LOCATED;
                    docs/ops/DEPLOY_LANE_TOKEN.md is named but NOT READ."
                    ⛔ A mechanism that conveys a token is not a located authorization of itself.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-17
NAMED OBJECT        Dockerfile deploy-lane tripwire + deploy_ctx_materialize / _verify_image /
                    _verify_running / _refuse_compose_runtime_override / _refuse_env_collision
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES     (deploy lane)
BASIS               PARTICIPATES — "PRE-DEPLOY GATE | … deploy-maia sequence at :228-265: lock →
                    materialize → gates → build → verify image → tag_images_for_rollback → swap →
                    verify running."
                    DECIDES — "TRIPWIRE | Dockerfile:23-42 — ARG DEPLOY_LANE_TOKEN=''; a build with
                    it empty prints '🛑 OUT-OF-LANE BUILD REFUSED' and exit 1"; and "pre-swap image
                    check deploy_ctx_verify_image (:375-389, blocks on mismatch)".
SOURCE RECORD       G_orchestration.md §1 G-17; §5 Q5; §6
AUTHORITY STANDING  NONE LOCATED — the file "states its own limit: 'a tripwire against the QUIET
                    bypass, not a forgery-proof credential' (:20-21)"; register: "GOVERNING SOURCE
                    NONE LOCATED; docs/ops/IMMUTABLE_SHA_DEPLOY.md and docs/ops/COLAB_RELEASE_GATE.md
                    are named but NOT READ."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-G-18
NAMED OBJECT        run_migrations_or_abort / cmd_migrate / the compose migrate service
PARTICIPATION       EXISTS · PARTICIPATES · DECIDES     (deploy lane)
BASIS               PARTICIPATES — "ORDER, AS READ | deploy (:448-546): lock → materialize → build
                    → swap → provenance verify → migrate (:538) → success (:540) → smoke (:546)."
                    DECIDES — "Migration failure now aborts — run_migrations_or_abort prints
                    '⛔ DATABASE MIGRATIONS FAILED — DEPLOYMENT ABORTED' and exit 1 (:93, :117)."
                    ⭐ Recorded verbatim: "It applies whatever migration files are present, in bulk."
SOURCE RECORD       G_orchestration.md §1 G-18; §4 U-7; §5 Q5
AUTHORITY STANDING  Two halves, kept separate.
                    FAIL-CLOSED BEHAVIOUR — UNKNOWN: "Attributed in-file to DEPLOYMENT-SAFETY-01,
                    founder ruling 2026-09-14 (:61)", and the register qualifies it "⚠️ attributed
                    in-file … for the fail-closed behaviour only". ⛔ The ruling document itself was
                    not located or read, so an attribution is recorded, not a located authorization.
                    MIGRATION SELECTION — NONE LOCATED: "SEPARATE MIGRATION GATE | ⭐⭐ NONE FOUND …
                    no SHA argument, no migration selection, no per-migration authorization."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

---

## DOMAIN H — SENSORY / VOICE

⭐ Amendment 1 §1 applied: voice carries **its own cognition family**. The convergence seam, the
commit seam, TTS gating and STT non-gating are assessed as separate rows.

```text
ROW                 P3-H-01
NAMED OBJECT        selectVoiceTransport(facts) — four transports
PARTICIPATION       EXISTS · PARTICIPATES · KNOWS · DECIDES
BASIS               KNOWS — "INPUTS isNative · isDesktop · hasSpeechRecognition · canRecordAudio"
                    DECIDES — "SYSTEM AUTH total — platform facts decide"; §4: "The ear is selected
                    by CAPABILITY, not by POLICY."
                    ⚠️ CARRIED VERBATIM, ⛔ not reconciled: "CONSUMED ContinuousConversation.tsx:3401
                    (LOGGED, not dispatched on — the dispatch condition is (info.isDesktop ||
                    !hasSpeechRecognitionAPI()) && canRecordAudio at :3408)."
                    MEMBER AUTHORITY — "none — the member cannot choose a transport."
SOURCE RECORD       H_sensory_voice.md §2, §4 (STT), §5 H-1, §9 U2/U3
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE ⛔ NONE FOUND for provider egress"; U2/U3:
                    "DESKTOP-SOVEREIGN-STT-01 · S1/S4 · S11" and "D01 §XII" → "⛔ not located".
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-02
NAMED OBJECT        app/api/voice/transcribe-simple/route.ts · app/api/voice/transcribe/route.ts
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES · DECIDES
BASIS               PARTICIPATES / CONTRIBUTES — "CALL PATH ContinuousConversation (MediaRecorder) →
                    POST → maia-whisper → onTranscript"; "PERSISTED transcribe:
                    llamaService.addMemory(memberId, …) :234".
                    DECIDES — "E-1 · auth | getMemberIdFromRequest(req) → 401 Unauthorized";
                    "E-3 · entitlements"; "E-4 · daily usage quota".
SOURCE RECORD       H_sensory_voice.md §4 (STT), §5 H-2, §6
AUTHORITY STANDING  NONE LOCATED — "⛔ NO provider-qualification gate. ⛔ NO consent gate.
                    ⚠️ transcribe-simple has AUTH ONLY — no entitlements, no quota."
                    ⭐ "E-1…E-4 are identity and commercial gates. ⛔ None is a provider-egress or
                    consent gate" — recorded, ⛔ not converted into authority standing.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-03
NAMED OBJECT        webkitSpeechRecognition session + @capacitor-community/speech-recognition
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES · DECIDES
BASIS               CONTRIBUTES — "CALL PATH initializeSpeechRecognition (:695) → onresult
                    (:885-:920) → onTranscript"; "COMPUTED off-device, by the browser or OS vendor".
                    DECIDES — "Desktop is refused Web Speech by CLASSIFICATION (:711 …), which is
                    the ONLY place in the corpus where an STT provider is refused — and it is
                    refused for Desktop only, by shell classification, never by a policy module."
SOURCE RECORD       H_sensory_voice.md §2, §4, §5 H-3, §8 C4
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE ⛔ NONE FOUND."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-04
NAMED OBJECT        handleVoiceTranscript guard set N1–N12 (21-string ghost filter; t.length < 50)
PARTICIPATION       EXISTS · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES
BASIS               DECIDES — the N1–N12 exit table; "FAILURE a refused utterance is silently
                    dropped; nothing is surfaced to the member."
                    KNOWS — §9 U8: "the ghost-phrase list — 21 hard-coded strings
                    (OracleConversation.tsx:7233-:7251) that refuse a member's utterance on CONTENT".
                    CONTRIBUTES — "⚠️ N4 and N5 are exits on which MAIA SPEAKS AND NO COGNITION RAN."
                    MEMBER AUTHORITY — "⛔ NONE — the member cannot see, tune or override any guard."
SOURCE RECORD       H_sensory_voice.md §2 (N1–N12), §5 H-4, §6, §9 U8/U9
AUTHORITY STANDING  NONE LOCATED — "⛔ It is a NON-DEGRADATION gate, not a governance ruling … The
                    file says so itself (:79-:83): 'FROZEN IS NOT BLESSED.'"; U8 and U9 both
                    "⛔ NONE FOUND". INF-2: CI-GATED ↛ runtime governed.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-05
NAMED OBJECT        await handleTextMessage(cleanedText) — the sole canonical cognition call
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES
BASIS               CONTRIBUTES — "⭐ As implemented, everything above the seam is capture and
                    admission. The voice handler carries no request of its own, no prompt, no
                    endpoint and no model selection into cognition — it hands a string across."
                    ⛔ DECIDES NOT ASSIGNED — the record establishes a single call, not a
                    determination of any outcome.
SOURCE RECORD       H_sensory_voice.md §1, §5 H-5, §6, §8 C3/C6
AUTHORITY STANDING  ⭐ GOVERNED — "GOVERNANCE ⭐ docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_
                    NON_DEGRADATION.md — named in CLAUDE.md as a 'hard acceptance gate on all
                    voice/transport work'; RED = voice does not ship." H §6: "The strongest gate in
                    this domain."
                    ⚠️ Scope kept exact: the located source governs the REQUIREMENT of convergence.
                    Per INF-2 the test that enforces it is not runtime governance, and C6 records
                    the canon's coordinate as stale (":7268"; it is at ":7397") — ⛔ recorded as a
                    citation-staleness finding, ⛔ not a divergence.
```

```text
ROW                 P3-H-06
NAMED OBJECT        commitOracleTurn(reason) — one idempotent seam, six terminal reasons
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES · DECIDES
BASIS               CONTRIBUTES — "EFFECT setMessages(prev => appendMessageCapped(prev,
                    oracleMessage)) :6375 … + voice-mode saveConversationMemory(…) rides the same
                    seam :6380-:6395".
                    DECIDES — "path 3 commits at 6s — the case that motivated the repair; a promise
                    that never settles runs neither branch"; "IDEMPOTENCE if (oracleTurnCommitted)
                    return; oracleTurnCommitted = true".
                    MEMBER AUTHORITY — "none over the seam; showVoiceText governs RENDERING only."
SOURCE RECORD       H_sensory_voice.md §3, §5 H-6, §7, §9 U1
AUTHORITY STANDING  NONE LOCATED — U1: the 2026-08-13 MODALITY INDEPENDENCE founder ruling is "cited
                    by name at OracleConversation.tsx:6447 … ⛔ NO document found under docs/canon/**
                    or docs/programme/** bearing this ruling. … The law is carried by a comment and
                    by one source-shape test."
                    ⚠️ "Every assertion is a SOURCE-SHAPE assertion over stripped text … it does not
                    execute the component."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-07
NAMED OBJECT        maiaSpeak · handleSpeakMessage · openai-tts route · ttsRouter · cloudVoicePolicy
                    · voiceArchetypes
PARTICIPATION       EXISTS · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES
BASIS               CONTRIBUTES — "DECLARED maiaSpeak (OracleConversation.tsx:1955 → POST
                    /api/voice/openai-tts at :2034 native, :2130 web)".
                    KNOWS — "MEMBER AUTH member voice archetype (getMemberVoicePreferences, route :121)".
                    DECIDES — "⭐⭐ THE ARCHETYPE BRANCH RUNS BEFORE G-T1, G-T2 AND G-T3, AND
                    RETURNS"; "voiceArchetypes.ts:88, :92 — unset OR unknown archetype ⇒ OpenAI".
SOURCE RECORD       H_sensory_voice.md §4 (TTS), §5 H-7, §6, §8 C1, §9 U4/U5/U6
AUTHORITY STANDING  UNKNOWN — RECORDS DISAGREE (C1, both sides preserved below); and U6: the
                    VOICE-SOVEREIGNTY-01 "Founder canon ruling, 2026-08-27" "exists only as a
                    doctrine block inside the module it governs. No separate canon document located.
                    A module that states its own authorising ruling is the only record of that
                    ruling." Refusal R15 and docs/adr/012 are "named-but-unverified".
                    ⛔ Not derived across.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-08
NAMED OBJECT        lastSendWasVoiceRef + lib/voice/restartAuthority.ts + attemptMicRestart
PARTICIPATION       EXISTS · PARTICIPATES · KNOWS · DECIDES
BASIS               KNOWS — "set false on every typed turn at :4919, set true on an ACCEPTED voice
                    turn at :6827 (deliberately AFTER the feedback and duplicate guards)".
                    DECIDES — "Read as the gate on seven restart sites: :2678 :2781 :2850 :2998
                    :5758 :6580 :6597."
                    ⭐ MEMBER AUTHORITY, verbatim: "MEMBER AUTH ⭐ REAL — modality of the member's
                    last send decides whether the mic re-arms." ⛔ Recorded as member authority; the
                    record uses no authorization language about the mechanism, so ⛔ it is not read
                    onto the authority axis.
                    ⚠️ "lastSendWasVoiceRef INITIALISES TRUE — before the member has spoken once,
                    the system's default posture is 'voice was the last modality.'"
SOURCE RECORD       H_sensory_voice.md §5 H-8, §6, §11 Q9
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE ⚠️ PARTIAL. restartAuthority.ts documents a P0 and
                    encodes the policy in one place; the CONSENT rule is enforced only by this ref
                    and is not traced to a ruling document at the subject."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-09
NAMED OBJECT        the eleven Class C `await maiaSpeak(` sites (of twelve; one is canonical)
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES (member-facing, first person)
BASIS               CONTRIBUTES — "WORDS AUTHORED BY local scripts and data-API responses. ⛔ NO
                    MODEL IN THE PATH — these are not an alternate MAIA mind. BUT they are
                    member-facing first-person utterances that bypass canonical egress finalization
                    entirely."
                    ⭐ "SHARPEST the crisis script at :6852-:6857 — spoken outside every guard,
                    deliberately non-returning."
                    ⛔ DECIDES NOT ASSIGNED — no determination of an outcome is established.
SOURCE RECORD       H_sensory_voice.md §2, §5 H-9, §6, §9 U7
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE ⛔ NONE FOUND … the classification is 'Proposed … for
                    founder ruling' and 'C should be recorded and deferred' … '⚠️ FROZEN IS NOT
                    BLESSED: pinning stops them growing, it does not certify them.'" U7: "Still
                    unruled at the subject."
INF-6               EFFECT established (CONTRIBUTES · member-facing first-person utterance) ·
                    HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-10
NAMED OBJECT        the four saveConversationMemory call sites
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES (stored member record)
BASIS               CONTRIBUTES — "FOUND four saveConversationMemory call sites … :5120 (text turn),
                    :6382 and :6428 (response, voice and chat), :7325 (member voice utterance,
                    sourceType:'voice', role:'user')."
                    ⚠️ "This is MODALITY-SYMMETRIC — the typed path is identical. It is therefore
                    NOT a voice-versus-typed divergence and NOT a non-degradation breach."
SOURCE RECORD       H_sensory_voice.md §6 (H-10), §8 C5
AUTHORITY STANDING  UNKNOWN — RECORDS DISAGREE (C5, both sides preserved below): four unconditional
                    write sites versus CLAUDE.md Sanctuary invariants 1 and 6. ⛔ Not derived across;
                    routed to whichever domain owns Sanctuary, ⛔ not repaired here.
INF-6               EFFECT established (CONTRIBUTES · retention of member utterances) ·
                    HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-11
NAMED OBJECT        sendStreamingMessage / useStreamingVoice / /api/voice/stream-conversation
PARTICIPATION       EXISTS · PARTICIPATES
BASIS               PARTICIPATES — "OracleConversation.tsx:2609 still calls useStreamingVoice({…})".
                    ⛔ UNREACHABLE FROM VOICE, verbatim: "no identifier sendStreamingMessage or
                    streamingVoiceMode appears inside handleVoiceTranscript's body. Status:
                    SUPERSEDED (preserved as evidence, unreachable from the voice handler)."
                    ⛔ CONTRIBUTES / DECIDES UNKNOWN — register: "Its coverage of any current
                    MAIA-claiming path: NOT DETERMINED BY SOURCE RECORD."
SOURCE RECORD       H_sensory_voice.md §2, §4, §7 · register P3-H-11
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNANCE GATE CI-GATED negative assertion only";
                    "GOVERNING SOURCE NONE LOCATED".
```

```text
ROW                 P3-H-12
NAMED OBJECT        X1 offline · X2 network-error · X3 server-error · X4 API catch · X5 teen abuse
                    block · X6 voice-flow catch
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES (member-facing)
BASIS               CONTRIBUTES — the X-table: "what the member gets | locally-authored text, spoken
                    via a different TTS entry"; "⛔ No model authored X1–X3's words."
                    ⭐ "All six are pre-cognition or failure paths — commitOracleTurn does not yet
                    exist in scope at X1–X3, X5, and X6 is a different function."
SOURCE RECORD       H_sensory_voice.md §3 (X1–X6 table and its scoping note)
AUTHORITY STANDING  NONE LOCATED — register P3-H-12: "GOVERNANCE GATE NOT DETERMINED BY SOURCE
                    RECORD"; "GOVERNING SOURCE NONE LOCATED".
INF-6               EFFECT established (CONTRIBUTES · member-facing locally-authored text) ·
                    HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-13
NAMED OBJECT        BetaMinimalMirror handleTranscript
PARTICIPATION       EXISTS
BASIS               "handleTranscript body is '// Optional: Show live transcript preview' — empty.
                    DORMANT: grep finds no mount of BetaMinimalMirror anywhere in app/ or components/."
SOURCE RECORD       H_sensory_voice.md §2, §7
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNANCE GATE NOT DETERMINED BY SOURCE RECORD ·
                    GOVERNING SOURCE NONE LOCATED".
```

```text
ROW                 P3-H-14
NAMED OBJECT        app/oracle/page.broken.tsx — its own handleVoiceTranscript binding
PARTICIPATION       EXISTS
BASIS               "binds its own handleVoiceTranscript. Filename `.broken.tsx` is not a Next
                    route. ORPHANED."
SOURCE RECORD       H_sensory_voice.md §2, §7
AUTHORITY STANDING  NONE LOCATED — register P3-H-14.
```

```text
ROW                 P3-H-15
NAMED OBJECT        MaiaRealtimeWebRTC · RealtimeSpiralogicBraid · RealtimeVoiceService (.DISABLED)
PARTICIPATION       EXISTS
BASIS               "lib/voice/*.DISABLED (3 files …) DORMANT by filename."
                    ⚠️ UNKNOWN, carried: "lib/voice/ holds 119 entries against a handful reached
                    from the traced path. Reachability of the remainder (aethericOrchestrator,
                    moshi/, personaplex/, MaiaRealtimeClient*, ElementalVoiceOrchestrator,
                    UnifiedVoiceOrchestrator, MayaHybridVoiceSystem, …) was not traced."
SOURCE RECORD       H_sensory_voice.md §7, §10
AUTHORITY STANDING  NONE LOCATED — register P3-H-15.
```

```text
ROW                 P3-H-16
NAMED OBJECT        VoiceWithNotes
PARTICIPATION       EXISTS · PARTICIPATES · CONTRIBUTES (stored record)
BASIS               "transcript → POST /api/notes. Never reaches cognition — a capture surface, not
                    a conversation."
SOURCE RECORD       H_sensory_voice.md §2
AUTHORITY STANDING  NONE LOCATED — register P3-H-16: "GOVERNANCE GATE NOT DETERMINED BY SOURCE
                    RECORD · GOVERNING SOURCE NONE LOCATED".
INF-6               EFFECT established (CONTRIBUTES · member transcript stored) ·
                    HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-H-17
NAMED OBJECT        MorningDreamCaptureInterface onTranscript
PARTICIPATION       EXISTS · PARTICIPATES
BASIS               "onTranscript={(t) => setDreamContent(t)} — fills a form field. No cognition."
SOURCE RECORD       H_sensory_voice.md §2
AUTHORITY STANDING  NONE LOCATED — register P3-H-17.
```

```text
ROW                 P3-H-18
NAMED OBJECT        labtools scribe onTranscript
PARTICIPATION       EXISTS · PARTICIPATES
BASIS               "onTranscript: (result: TranscriptResult) => … — labtools scribe surface,
                    separate from the MAIA conversation."
SOURCE RECORD       H_sensory_voice.md §2
AUTHORITY STANDING  NONE LOCATED — register P3-H-18.
```
