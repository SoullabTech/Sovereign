# External Substrate Survey — 2026-09-20

> **Why this exists.** Eleven external projects were put forward for investigation and possible
> integration. This document records what each one actually is — read from source and metadata,
> not from marketing copy — and whether it can serve MAIA/AIN without breaching a non-negotiable.
>
> **⛔ This document authorizes nothing.** It opens no lane, adds no dependency, and changes no
> schema, route, or runtime. Every "adopt" below means *admitted as a design input to a lane that
> must still be opened by a founder act*. Nothing here disturbs the F5 / temporal-memory standing.

---

## 0. Evidence class — read before citing anything below

| Class | Meaning | How it may be used |
| --- | --- | --- |
| **[R] Read from source** | Verified by reading the repository's own files (config, client code, compose, license metadata) in this session. | May ground a decision. |
| **[D] Read from project documentation** | The project's own README or docs, reproduced. Accurate as a statement of what the project *claims*. | May ground a decision about fit; may not ground a claim about behaviour. |
| **[W] Web-sourced** | Third-party summary or search result. Not verified against source. | **Must not ground a decision** without a source read. |
| **[U] Unverified** | Could not be reached from this environment. | Recorded as a gap, never as a finding. |

Two domains were **blocked by the network egress proxy** in this session: `huggingface.co` and
`muse.ai`. Findings for DeepSeek-V4.1-Flash and muse.ai are therefore **[W]** and carry no more
weight than that.

---

## 1. Verdict table

| # | Project | License | Verdict | One-line reason |
| --- | --- | --- | --- | --- |
| 1 | **memanto** (moorcheh-ai) | MIT (wrapper only) | **Harvest 3 ideas · do not adopt** | The recall engine is not in the MIT repo; on-prem is a proxy to a vendor server. |
| 2 | **openclaude** (Gitlawb) | MIT on modifications; "derived Claude Code remains Anthropic's" | **Refuse** | Redistribution of another party's proprietary source under a self-declared split licence. |
| 3 | **academic-research-skills** | **CC-BY-NC 4.0** | **Refuse for product · study only** | NonCommercial. Soullab is a commercial venture. |
| 4 | **OpenMAIC** (THU-MAIC) | MIT | **Engine: study closely · Pedagogy: refuse** | Same stack as ours; its pedagogy inverts the Direction of Authority. |
| 5 | **invidious** (iv-org) | AGPLv3 | **Conditional · operational question, not architectural** | Real sovereignty fit for media; ToS-violating scraping and high maintenance load. |
| 6 | **minimind** (jingyaogong) | Apache 2.0 | **Study · one latent trap** | Excellent pedagogy. Any thought of training on member data is barred by Sanctuary. |
| 7 | **ECC** (affaan-m) | MIT (+ paid Pro) | **Harvest 2 mechanisms** | Its hooks-as-enforcement answers a defect we already named on 2026-09-13. |
| 8 | **muse.ai** | Commercial SaaS | **Refuse for member content** | Cloud-only CDN. A third party between members and their data. |
| 9 | **gawkbot** | Sustainable Use License | **Refuse as dependency · harvest 1 idea** | Source-available, not open source; commercial use restricted. |
| 10 | **nanobot** (HKUDS) | MIT | **Reference only** | Philosophically aligned; we already have this layer. |
| 11 | **DeepSeek-V4.1-Flash** | MIT open weights | **Strategically significant · not deployable here** | 552B MoE needs H100/H200-class hardware. minisforum cannot serve it. |

---

## 2. Per-item assessment

### 2.1 memanto — *Memory Agent for AI Fleets*

**What it actually is** [R]. The MIT repository is the **agent and CLI layer only**.
`memanto/app/clients/onprem.py` is an HTTP client wrapping `moorcheh.MoorchehClient` against a
server at `http://localhost:8080`; **the repository does not bundle that server**.
`memanto/app/config.py` defaults to `MEMANTO_BACKEND = "cloud"`, and the only required variable in
`.env.example` is `MOORCHEH_API_KEY`. `docker-compose.yml` defines one service, no volumes, no
local store. Active and real: 2,255 stars, 717 forks, pushed 2026-09-20, Python.

**Why it fails our non-negotiables.**

1. **"Self-hosted by design: no cloud lock-in."** On-prem here means *a local proxy to a vendor
   engine whose source we do not hold*. That is lock-in with a shorter network hop.
2. **Second memory authority.** We have a live finding (F3) that *two* divergent decay
   implementations inside one repository is a governance defect. A third — vendor-controlled, in a
   different language, outside `lib/db/postgres.ts` — is strictly worse.
3. **Automatic decay is its selling point** [D]: *"Decay, expiry, and deliberate deletion are
   policies it executes, not cleanup you remember to do."* Our ratified temporal law says the
   opposite: *the system never sets `valid_to` from a timer; staleness is detect → ask → record.*
4. **"Strengthens confidence through repetition"** [D] is a frequency economy over member meaning.
   We have already measured a ≈17.8:1 time-over-confirmation leverage in the live scorer and named
   it a problem. Importing repetition-weighting deepens exactly that defect. Merging duplicates
   also destroys distinct occasions, which is Encounter-as-primitive.

**The three worth harvesting** — each is *independent convergence* on a position we already
ratified, which is the actual value.

| Memanto mechanism [D] | Maps to | Why it is useful |
| --- | --- | --- |
| `[EXPIRED]` as a **visible label carrying the retirement reason**; expired memories still recall; `memory restore` is first-class; deletion is a separate explicit act | Clause 2 (availability may change; recoverability must hold) | A rendering in which exclusion is a *labelled state on the record* rather than an invisible ranking outcome. Traceability becomes a property of the record — which is precisely what Clause 2 asks and what Cut 1 currently fails. ⚠️ It solves the *per-memory* case, not our harder *per-turn ranking exclusion* case. |
| Retention as a **member-legible declared file**, `never` a first-class value, named rules pinning against the default table | No MAIA precedent (`surface_preference` is nearest) | Retention expressed as law a member can read, against our live `0.40` decay weight which has no member-facing expression at all. **That contrast is the finding.** |
| `--as-of` reconstructing past state **including memories expired since** | Our five predeclared Episodic Phase 2 acceptance queries | Second independent arrival at axis separation — and it makes the axis explicit *in the query interface*, which our own ruling requires ("temporal recall must identify the axis it resolved on"). |

**Evidence note.** 89.8% LongMemEval / 87.1% LoCoMo are vendor-reported with self-noted
comparability caveats, on synthetic long-conversation QA. Under `CLAIM_STATE_AUTHORITY` that is a
vendor claim, not evidence, and it does not measure the thing MAIA needs measured.

**Disposition:** Cat 1 — preserved direction. Input to the unauthored Episodic Phase 2 spec.

> ⚠️ **CORRECTED 2026-09-20, same day, after a repository read.** The table above and §3 below assert that
> the labelled-retirement idea bears on *"the open Cut-1 traceability non-conformance."* **That
> non-conformance is closed** — `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01` closed in production 2026-09-16, and
> `lib/memory/cut1Trace.ts` is live and wired at `lib/memory/MemoryBundle.ts:270`. The stale framing is kept
> verbatim rather than edited, per the standing rule that a witness is a reading at a time. The corrected
> reading — that the gap is **member legibility, not operator traceability**, and that all three harvested
> ideas are one surface (Clause 2 refinement (c)) — is in
> `docs/architecture/MEMORY_LEGIBILITY_DIRECTION_2026-09-20.md`. Two further corrections land there: MAIA's
> expire/restore semantics are **stricter** than memanto's, and memanto's retention table is **unlawful under
> Clause 1** as written.

---

### 2.2 openclaude — multi-provider CLI derived from Claude Code

**What it is** [D]. A terminal CLI unifying OpenAI, Gemini, Ollama and other backends, with
coding-agent tooling, MCP, a VS Code extension and a headless gRPC server. Node ≥22, Bun, ripgrep.

**The blocker** [D]. Its own licence statement: *"MIT for OpenClaude contributors' modifications;
the derived Claude Code remains Anthropic's."* A project cannot grant MIT terms over a base it does
not own. Whatever the intent, this is redistribution of another party's proprietary source under a
self-declared split.

**Verdict: refuse.** Not on technical grounds — on the same grounds we refuse everything else in
this survey that asks us to accept someone else's account of what they are entitled to give us. We
are building a sovereignty argument; it cannot rest on a licence we would not defend.

There is also no need: multi-provider routing is not a MAIA requirement. Our provider posture is
deliberately narrow (Claude primary, local Ollama fallback, never OpenAI). A tool whose purpose is
to make provider-switching frictionless is solving a problem we chose not to have.

---

### 2.3 academic-research-skills — four Claude Code skill suites

**What it is** [D]. Deep Research (13-agent), Academic Paper (12-agent), Paper Reviewer (7-agent),
and a 10-stage Academic Pipeline orchestrator with integrity-verification gates. Actively
maintained (v3.22.0, September 2026). Human-in-the-loop by design.

**The blocker** [D]. **CC-BY-NC 4.0.** NonCommercial. Soullab is a commercial venture; MAIA is a
product. Using these skills in the course of building it is commercial use.

**Verdict: refuse for product work.** Whether a founder may use them for personal, non-commercial
scholarship is a legal question and not mine to answer.

**One idea is worth noting independently**, and it is free to hold because it is not copyrightable
practice: the Paper Reviewer produces *"criterion-bound, evidence-anchored narrative judgements
rather than numerical scores."* That is the same instinct as our own refusal to let a verifier
total stand in for a named obligation set (FR-14: *the number is descriptive; the named set is the
law*). Convergent, not borrowed.

---

### 2.4 OpenMAIC — Open Multi-Agent Interactive Classroom

**What it is** [D]. MIT. Next.js 16 + React 19 + TypeScript. LangGraph multi-agent orchestration.
Two-stage generation (outline → content). Storage layer over browser / HTTP / **PostgreSQL** / S3.
Canvas slide editor with 21 action types. Provider-neutral, including local Ollama. v1.0.0,
2026-08-27, with durable agent sessions and server-backed persistence.

**This is the closest stack match on the list.** Next.js 16 + TypeScript + PostgreSQL + self-hosted
model option is our stack, under a licence that permits use.

**And its pedagogy is constitutionally hostile to ours.** Its governing claim is *"One prompt in, a
whole course out"* — a system that generates a developmental curriculum and delivers it through
agents that speak and draw. Against `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY`: **the member may loop
freely through Encounter ⇅ Reflection ⇅ Recognition; the system may not move them through it.** An
auto-generated course is the system manufacturing higher-order meaning and moving a person along
it. Inner Lands is not a curriculum, and the Knowledge Gate is not a syllabus.

**Verdict: two objects, opposite answers.**

- **Adopt as study** — the durable multi-agent session model, the two-stage outline→content split,
  and the storage abstraction. Specifically: how they keep a long-running multi-agent session
  durable across restarts is directly relevant to anything we build for teen environments.
- **Refuse the pedagogy entire.** If any part of this is ever built from, the generation direction
  must invert: the member authors; the system holds structure and refuses to fill it.

⚠️ **The sharpest finding of this survey.** A codebase can be a perfect technical fit and a
constitutional inversion at the same time, and the fit is what makes it dangerous — stack
similarity lowers the cost of importing the assumption along with the code.

---

### 2.5 invidious — privacy-preserving YouTube front-end

**What it is** [D]. AGPLv3, Crystal, self-hosted, database-backed. Serves YouTube content without
official YouTube APIs, without ads, tracking, or a Google account; subscriptions held locally.

**The fit is real.** If MAIA ever surfaces video to a member — Inner Lands material, Knowledge Gate
references, Practice Field instruction — routing it through google.com means a third party observes
what a member watches while in a developmental context. That is squarely against *no third party
sits between users and their data*. Invidious is the only item on this list whose entire purpose is
the elimination of exactly that observer.

**The costs are operational, and they are not small.**

- It works by scraping. It breaks when YouTube changes, which is often, and instances are actively
  rate-limited and blocked. This is a **maintenance commitment**, not an install.
- It is a Terms-of-Service violation against YouTube. That is a founder call about posture, not an
  engineering detail.
- AGPLv3: if we modify it and serve it over a network, we must publish the modified source. For a
  separate containerised service beside Caddy this is containable, and philosophically it is a
  licence we should be comfortable with — but it must never be linked into the Next.js app.

**Verdict: conditional, and the condition is a decision we have not made.** Do we intend to carry
third-party media inside a developmental context at all? If no, this is moot. If yes, Invidious is
the right shape and the wrong reliability profile, and a member-uploaded / self-hosted media path
is the more sovereign answer anyway.

---

### 2.6 minimind — train a small LLM from scratch

**What it is** [D]. Apache 2.0. 26M–198M parameter Dense and MoE models, native PyTorch, no
framework abstractions. Full pipeline: tokenisation, pretraining, SFT, LoRA, distillation, DPO /
PPO / GRPO / CISPO / Agentic RL. Ships code, open datasets, and weights. Claims a usable model for
*"~3 yuan (≈$0.43) and 2 hours on a single NVIDIA 3090."*

**Value: pedagogical, and that is not a small thing.** Our sovereignty claim includes a local
fallback path. Understanding what a model *is*, end to end, at a scale one person can hold, is the
difference between asserting sovereignty over inference and possessing it. This is the best
artifact on the list for that.

**⚠️ The latent trap, named before it can bite.** The obvious next thought — *train a small local
model on MAIA's own conversational data, for routing or classification* — is **barred**. Sanctuary
Mode invariant 2 is absolute: *Sanctuary content never enters any model training pipeline*. And
beyond Sanctuary, no member's non-Sanctuary content has consent for training either; consent for
memory is not consent for training, and we have no instrument that could obtain the latter today.
Any local-model work trains on public corpora or on nothing.

**Verdict: study. Not a dependency, not a lane.**

---

### 2.7 ECC — agent harness for engineering discipline

**What it is** [D]. MIT (with a paid Pro tier for private repos). 68 specialised agents, 292
skills, runtime hooks, always-loaded per-language rules, and "AgentShield" scanning of agent
configuration. Governing claim: *"Optimize the context window. Persist everything else."*

**Most of it we do not need.** We already have a far more specific governance method than ECC
offers: the JARVIS operating manual, lane charters, evidence classes, falsifier discipline with
defeat candidates, and freeze law. 292 skills against that is context cost, not capability.

**Two mechanisms are worth harvesting, and one of them lands on a defect we already named.**

1. **Hooks as enforcement outside the model's context.** On 2026-09-13 we recorded the
   branch-policy authority finding: ⭐ *a committed governance rule present but not AUTHORITATIVE
   in every execution environment, so a commit can appear policy-compliant merely because the
   enforcement mechanism was absent.* Four S3 commits landed on a forbidden branch because
   `core.hooksPath` was unset in a remote container. ECC's posture — enforcement lives in the
   runtime, not in instructions the model may or may not follow — is the correct shape of an answer
   to **Q2 of that finding** (*how is branch law made authoritative across environments?*).
   ⛔ Recording this does **not** answer Q2 and does **not** open that lane. It names a candidate
   shape.
2. **Review from a fresh context.** ECC separates the context that wrote the code from the context
   that reviews it, on the explicit ground that one context reviewing itself has blind spots. This
   is the same law as our two-independent-witnesses rule (S3-O1; the I0.5 acceptance requiring both
   a canonical-candidate and a production-state witness). Convergent confirmation that the
   discipline is not idiosyncratic.

**Verdict: harvest the two mechanisms as design inputs. Do not install the harness.**

---

### 2.8 muse.ai — commercial video hosting with in-video search

**What it is** [W] — *domain blocked by the egress proxy; all of this is third-party summary and
must not ground a decision.* Cloud video hosting with AI search across spoken words, on-screen
text, people and objects. Global CDN, DASH/HLS, embeddable player, API. From ~$5/month.

**Verdict: refuse for member content, without needing the blocked page.** The architecture is
disqualifying on its face. Uploading member-created or member-consumed developmental media to a
third-party CDN with AI analysis over its contents is the precise arrangement our infrastructure
doctrine exists to prevent: *no third party sits between users and their data; no jurisdiction
concerns — we control the location.*

**One narrow admissible use**, which should be stated so it is not confused with the above: *public
marketing video* — material we authored for outward publication, carrying no member content —
raises none of these questions. That is a marketing-ops choice, not an architecture decision, and
does not belong in this survey's scope.

---

### 2.9 gawkbot — natural-language workflow automation into microapps

**What it is** [D]. Go broker + TypeScript/React web UI at `localhost:7891` + agent sidecar. Runs
locally on personal API keys. 1,200+ integrations. Bots get screens, schedules, versioned routines,
self-authored tools, knowledge pages, typed tables.

**The blocker** [D]. **Sustainable Use License** — source-available, not open source. Free to
self-host; *closed commercial use requires permission*. MAIA is a commercial product. This is a
licensing negotiation, not an integration.

**One idea is worth holding**: *"human approval gates on all external actions."* An agent that may
plan freely but may not act outward without a human act is the same structure as our consumption /
authorization-act law — authority to execute is a distinct object from the plan that requested it,
and it is spent by a human. Independent arrival at the S3 shape from a completely different
problem domain. Worth noting as confirmation; nothing to import.

**Verdict: refuse as dependency. Note the convergence.**

---

### 2.10 nanobot — ultra-light self-hosted personal agent framework

**What it is** [D]. MIT, Python ≥3.11, v0.3.5 (2026-09-15). A small readable agent loop: messages
in from chat apps, LLM decides when tools are needed, memory and skills pulled in only as context.
MCP integration, bundled WebUI and terminal UI. Claims *"persistent workflows"* where *"goals,
memory, tools, and chat context survive long-running work."*

**Philosophically the most aligned project on this list** — self-hosted, minimal, no platform
dependency, readable core. It is what we would build if we were building this layer.

**We already have this layer**, in TypeScript, constitutionally governed, with a cognition path
under a non-degradation gate. Adding a second Python agent runtime would fragment the mind — the
exact thing `MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION` forbids: *voice may have a different
capture path; it may not have a different mind.* The same law generalises to any second runtime.

**Verdict: reference only.** Read it for the small-readable-core discipline. Import nothing.

---

### 2.11 DeepSeek-V4.1-Flash

**What it is** [W] — *`huggingface.co` blocked by the egress proxy; specifications below are
web-sourced and unverified against the model card. Do not quote these numbers as established.*
Native multimodal MoE, ~552B backbone, ~8B active at prefill / ~16B at decode, 40-layer causal
encoder–decoder, context to ~1M tokens, aggressive KV compression (~890 bytes/token). **MIT open
weights.** Served by vLLM or SGLang.

**Not deployable on our hardware.** Published serve recipes target H100 / H200 / B200 / GB200 /
MI350X class accelerators. minisforum runs the entire production stack — Postgres, Caddy, the
Next.js app, whisper, RLM — on a consumer mini-PC. This model is orders of magnitude outside that
envelope, and no amount of quantisation closes it.

**Strategically significant anyway, and worth recording for that reason alone.** A frontier-class,
1M-context, **MIT-licensed open-weights** model existing at all changes what the sovereignty thesis
can eventually claim. Today `ANTHROPIC_API_KEY` is a real dependency and the local Ollama fallback
is a genuine capability drop. The existence of MIT frontier weights means *full inference
sovereignty at no capability cost* is a hardware-procurement question rather than an open research
problem. That belongs on the roadmap as a fact, not as a plan.

⛔ **It does not license a claim.** Nothing about this model may be represented as anything other
than VISION under `MARKETING_CLAIM_DISCIPLINE`. We do not tell tomorrow's story as if it were
today's.

---

## 3. What is actually worth taking — ranked by leverage

1. **memanto's `[EXPIRED]`-as-visible-label** → Episodic Phase 2 spec input. Highest leverage,
   because it bears directly on the **open Cut-1 traceability non-conformance**. An exclusion that
   is a labelled state carrying its own reason is traceable *by construction*; an exclusion that is
   a ranking outcome is not. ⚠️ It addresses the per-memory case; our per-turn ranking case remains
   the harder unsolved problem, and this must not be allowed to look like a solution to it.
   > ⛔ **SUPERSEDED same day** — see the correction in §2.1. Cut-1 traceability is closed; the
   > per-turn ranking case is the case it solved. The surviving gap is member legibility.
2. **memanto's member-legible retention policy** → the contrast with our unexpressed `0.40`
   coefficient is itself the finding. Any future member-facing memory surface should express
   retention as readable law, not as a weight.
3. **ECC's hooks-as-runtime-enforcement** → candidate shape for Q2 of the 2026-09-13 branch-policy
   authority finding. ⛔ Does not answer Q1, and must not be used to answer Q1 silently.
4. **OpenMAIC's durable multi-agent session model** → study for teen / Inner Lands environments,
   with its pedagogy explicitly stripped.
5. **memanto's `--as-of` axis-explicit query interface** → confirms the Episodic Phase 2 acceptance
   query set and suggests the axis belongs in the *interface*, not only in the resolver.

Everything else on the list is either refused or is confirmation that positions we already hold
were arrived at independently by others. **That confirmation has real value and should not be
mistaken for a deliverable.**

---

## 4. The pattern across all eleven

Three of these projects (memanto, gawkbot, ECC) independently arrived at structures we ratified
under our own constitutional pressure: **authority as a distinct spendable object**, **supersession
rather than overwrite**, **separation of the context that acts from the context that reviews**. We
did not borrow these; they converged.

Two (OpenMAIC, muse.ai) are technically attractive and constitutionally inverted — and OpenMAIC is
the more dangerous of the two *because* its stack matches ours. Proximity lowers the cost of
importing an assumption along with the code.

Three (openclaude, academic-research-skills, gawkbot) fail on licence before any technical
question arises.

**The standing lesson, offered for adoption:** *evaluate the licence and the direction of authority
before the architecture.* Both are cheaper to check than a stack comparison, and either one can
end the enquiry.

---

## 5. Open questions returned for founder ruling

1. **Q-A.** Does MAIA intend to carry third-party media inside a developmental context at all?
   The Invidious question is moot until this is answered, and the answer likely governs more than
   video.
2. **Q-B.** Should the Episodic Phase 2 spec adopt *labelled retirement with a stated reason* as
   the required rendering of Clause 2 recoverability? This is the one item here with a direct line
   to an open non-conformance.
3. **Q-C.** Is a member-legible retention declaration (retention as readable law rather than an
   internal coefficient) in scope for Episodic Phase 2, or its own later surface?
4. **Q-D.** Does the ECC hooks posture warrant opening the branch-gate lane that the 2026-09-13
   finding named and deliberately left closed?

---

## 6. Provenance of this survey

**Read from source [R]:** memanto — repository metadata, `.env.example`, `docker-compose.yml`,
top-level and package listings, `memanto/app/config.py`, `memanto/app/clients/onprem.py`.

**Read from project documentation [D]:** memanto README; openclaude, academic-research-skills,
OpenMAIC, invidious, minimind, ECC, gawkbot, nanobot READMEs.

**Web-sourced only [W]:** DeepSeek-V4.1-Flash, muse.ai — both domains blocked by the egress proxy.

**Not done, and therefore not claimed:** no project was installed, executed, benchmarked, or read
beyond the files named above. No claim in §2 about runtime behaviour rests on observation of that
runtime. **What would upgrade this document** is a bounded hands-on session with memanto's expiry
and `--as-of` paths against a disposable store, and a source read of OpenMAIC's session-durability
layer. Until then this is a survey, not a verified corpus.

**⚠️ Security note recorded, not acted on.** The ECC reference as supplied carried an
`mcp_token` query parameter — a JWT with an expiry in October 2026. It was **not used**; the
repository was read unauthenticated. The credential should be treated as exposed and rotated.
The token value is deliberately not reproduced here.
