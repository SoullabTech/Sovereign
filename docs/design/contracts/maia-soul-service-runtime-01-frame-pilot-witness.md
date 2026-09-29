# MAIA-SOUL-SERVICE-02 / RUNTIME-01 — Ephemeral Frame Detection Pilot Witness

**Date:** 29 September 2026
**Status:** LOCAL RUNTIME WITNESS · PASS
**Base:** Soul-Service SS-01→SS-10 programme at `ce472237a82d932fd899a15ce1f32f78acc809a1`
**Branch:** `feature/maia-soul-service-runtime-01-20260929`
**Deployment:** none
**Production:** untouched

---

# 1. Runtime question

> **Can MAIA help a member see more without taking over what they see?**

Runtime 01 implements the narrowest live Soul-Service cognition slice:

> **source → possible aperture → alternative aperture → compare → member ruling → return**

The model participates only in proposing the two apertures.

All acceptance, rejection, comparison, unresolved state, and return are member/browser-local.

---

# 2. Ephemeral cognition boundary

The pilot endpoint is:

> `POST /api/maia/soul-service-frame-pilot`

It is hard-gated:

> `SOUL_SERVICE_RUNTIME_PILOT=1`

When the gate is absent, the route returns `404 PILOT_DISABLED`.

The route does not import or invoke:

- session manager;
- MAIA session creation;
- member identity resolution;
- Temporal Relational Memory;
- MemoryOrchestrator;
- TurnsStore;
- conversation history;
- database / postgres;
- `getMaiaResponse`;
- turn counters;
- conversation persistence.

The route imports:

- the governed `generateText(...)` model gateway;
- the pure Soul-Service frame prompt / parser / validator.

The runtime request therefore contains only the current source statement.

---

# 3. Provider-governed live witness

Local witness environment:

```text
SOUL_SERVICE_RUNTIME_PILOT=1
MAIA_TEXT_PROVIDER=local
DATABASE_URL unset by npm dev
port 3920
```

The actual runtime provider reported:

```text
provider: ollama
model: llama3.1:8b
mode: full
```

No session or member identifier was supplied.

---

# 4. Live validated proposal

Source:

> **I keep asking whether to keep refining this project or finally release it.**

Final live witness after language-quality tightening:

### MAIA possible frame · not yet yours

> **refine or release**

Rationale:

> **The question is currently organized around a two-way decision.**

### Another possible view · not ranked above the first

> **what's still missing or needed**

Rationale:

> **This view foregrounds the project's gaps and requirements, rather than a binary choice.**

Server standing:

```text
possibleFrame    = maia_hypothesis
alternativeFrame = maia_hypothesis
persistence      = none
currentTurnOnly  = true
validation       = offered
```

---

# 5. Soul-Service generation law

The pilot system prompt instructs MAIA to:

- describe the structure of the inquiry, not the person;
- use current-turn authority only;
- infer no enduring trait, motive, diagnosis, pathology, or developmental stage;
- avoid ranked perspectives such as “deeper,” “healthier,” “better,” or “truer”;
- avoid prescription;
- preserve unknown when evidence is insufficient;
- return exactly two materially distinct situational apertures;
- use natural human-readable phrases rather than compressed metadata-style labels.

The prompt produces structured JSON only.

---

# 6. Server-side validation

Model output is not rendered directly.

The server:

1. parses the JSON object;
2. requires exactly four fields;
3. bounds frame and rationale lengths;
4. rejects multiline / malformed output;
5. rejects diagnostic / identity vocabulary;
6. rejects motive-as-fact language;
7. rejects ranked perspectives;
8. rejects prescription;
9. applies the existing identity-predicate constraint;
10. requires materially distinct frame labels.

If any check fails, invalid model output is not shown.

The route substitutes a bounded abstention:

> **stay with the source**

and:

> **what is still unknown**

This is fail-closed Soul-Service behavior.

---

# 7. Focused tests

Command:

```text
npm test -- lib/maia/soul-service/__tests__/frameDetection.test.ts --runInBand --silent
```

Result:

> **5 / 5 PASS**

Tests cover:

- valid situational frame pair;
- identity / diagnostic rejection;
- duplicate-perspective rejection;
- valid abstention;
- static no-session / no-memory / no-DB route contract.

---

# 8. Live UI witness

Founder review surface:

> `/dev/soul-service-frame-runtime`

Automated desktop + mobile witness:

> **SOUL_RUNTIME_UI_WITNESS = PASS**

Captured states:

- source only;
- live MAIA proposal;
- compare both;
- member ruling;
- return to source.

Return witness confirmed that the generated frame cards are removed when returning to source.

Member rulings are browser-local only.

---

# 9. Type-health standing

Project type-health command:

```text
npm run typecheck -- --pretty false
```

reported:

```text
program files: 4539
errors: 223
baseline: 239

NEW diagnostic:
app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx:78
TS2304 Cannot find name 'LARGER'
```

This diagnostic is unrelated to Runtime 01 and was already present in the preceding programme lineage.

The Soul-Service route and founder page both compiled and executed successfully under Next dev.

The type-health baseline was **not** updated.

---

# 10. UI note

The captured founder screenshots may contain the pre-existing global green:

> **Audio enabled**

toast from the shared shell.

That toast is not emitted by Runtime 01 and is outside this lane.

---

# 11. What Runtime 01 proves

Runtime 01 proves that MAIA can participate in a Soul-Service frame act while:

- receiving only the current source;
- proposing rather than asserting;
- remaining non-diagnostic;
- keeping two frames unranked;
- passing server-side epistemic validation;
- allowing the member to reject / compare / leave unresolved;
- returning to the source;
- avoiding session and memory machinery;
- avoiding durable persistence.

It does **not** prove that frame detection improves human perspective mobility.

That remains a transfer / longitudinal research question.

---

# 12. What Runtime 01 does not authorize

Runtime 01 does not authorize:

- merge;
- deployment;
- production exposure;
- automatic frame detection in ordinary MAIA conversation;
- memory retrieval;
- durable frames;
- frame history;
- automatic member adaptation;
- automatic scaffold fading;
- member scoring;
- diagnostic inference.

---

# 13. Exact standing

> ## `MAIA-SOUL-SERVICE-02 / RUNTIME-01 — PASS`
>
> **REAL LOCAL MODEL GENERATION**
>
> **CURRENT-SOURCE ONLY**
>
> **SOUL-SERVICE SERVER VALIDATOR ACTIVE**
>
> **5 / 5 FOCUSED TESTS PASS**
>
> **DESKTOP + MOBILE LIVE UI WITNESS PASS**
>
> **NO SESSION**
>
> **NO MEMBER IDENTITY**
>
> **NO MEMORY RETRIEVAL**
>
> **NO DATABASE / TURN PERSISTENCE**
>
> **NO MERGE**
>
> **NO DEPLOYMENT**
>
> **PRODUCTION UNTOUCHED**

---

# 14. Next boundary

The next narrow runtime-capable extension is:

> ## `RUNTIME-02 — EPHEMERAL PERSPECTIVE MOBILITY`
>
> Keep the exact same no-persistence boundary and allow the member to ask MAIA for **one additional explicit perspective dimension**—for example Evidence, Scale, Time, Agency, Relation, or Possibility—while preserving the original source and the existing accepted/rejected frame standing.
>
> **STOP before memory, durable perspective state, or automatic perspective selection.**
