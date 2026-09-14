# P1-01 · GOVERNING SOURCE READ — MODEL / PROVIDER / ORCHESTRATION · DEPLOYMENT & INFRASTRUCTURE SOVEREIGNTY

```text
LANE      PHASE-1-WHOLE-ORGANISM-CENSUS-01
STEP      P1-01 · GOVERNING SOURCE READ  ·  SLICE 06
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385 (working tree)
TYPE      RECORD ONLY — no architecture claim, no code census
RULE      Do not infer architecture from aspiration.
E-1       History-dependent claims are UNKNOWN unless independently established.
          Current-tree facts are usable. No ancestry reconstruction.
C-2       MAIA_WHOLE_ORGANISM_MAP/** is PREDECESSOR CENSUS · FROZEN INCOMPLETE ·
          EVIDENCE INPUT ONLY. Cite only with that status attached, never as settled.
SLICE     ⚠️ provider ≠ model ≠ cognition ≠ MAIA identity ≠ authority. These five are
          kept distinct in every record below and are NEVER merged.
```

## Sources read
| # | Source | Lines | Read |
|---|---|---|---|
| S-1 | `docs/canon/PROVIDER_GOVERNANCE.md` | 66 | full |
| S-2 | `scripts/provider-policy.json` | — | full (structure + all values), as the policy artifact S-1 declares |
| S-3 | `docs/canon/OPTIMIZATION_TOOLING_GOVERNANCE.md` | 85 | full |
| S-4 | `docs/canon/MAIA_CONNECTOR_EXPERIENCE.md` | 82 | full |
| S-5 | `docs/canon/THREE_AUTHORITY_CHAINS.md` | 327 | 1–110 + full grep for provider/model/vendor terms — **provider-relevant part only; constitutional ownership belongs to another worker** |
| S-6 | `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` | 280+ | 1–15, 40–95 + grep — **read only for the provider/model analogue; another worker owns it** |
| S-7 | `docs/canon/FOUR_LAYER_SUBSTITUTION.md` | — | 1–30 only (adjacent; surfaced by S-20) |
| S-8 | `docs/adr/README.md` | 27 | full |
| S-9 | `docs/adr/template.md` | 28 | full |
| S-10 | `docs/adr/001-seven-level-awareness-source-of-truth.md` | — | 1–75 |
| S-11 | `docs/adr/004-converge-on-single-knowledge-engine.md` | 58 | full |
| S-12 | `docs/adr/010-personal-professional-portal-layers.md` | — | 1–50 |
| S-13 | `docs/adr/012-openai-tts-production-status.md` | 67 | full |
| S-14 | `docs/ops/IMMUTABLE_SHA_DEPLOY.md` | 239 | full |
| S-15 | `docs/ops/DEPLOY_LANE_TOKEN.md` | 133 | full |
| S-16 | `docs/ops/COLAB_RELEASE_GATE.md` | 102 | full |
| S-17 | `docs/ops/DEPLOY_OBLIGATIONS_2026-08-01.md` | 87 | 1–55 |
| S-18 | `docs/ops/DEPLOY_LINEAGE_GATE_SPEC_2026-08-13.md` | 121 | 1–55 |
| S-19 | `docs/ops/TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30.md` | 241 | 1–55 |
| S-20 | `docs/ops/GATE_EVIDENCE_DISCIPLINE.md` | 56 | full |
| S-21 | `CLAUDE.md` §Infrastructure · §Database & Backend · §MAIA Sovereignty · §Co-Lab Release Gate (+ the 2026-09-07 bullet at :61) | 530 | named sections |
| S-22 | `docs/governance/BOOTSTRAP_GOVERNANCE_PHASE1.md` | 124 | 1–42 |
| S-23 | `docs/governance/PR_1145_CLASS_A_BOOTSTRAP_EXCEPTION_2026-08-28.md` | 240 | 1–42 |
| S-24 | `docs/governance/LIFECYCLE_GAP_LAYER1_FINDING_2026-07-29.md` | — | 1–84 |
| S-25 | `docs/governance/00_PROVENANCE/README.md` | 45 | full |
| S-26 | `docs/architecture/AIN_STRUCTURED_INFERENCE_SEAM_01.md` | — | 1–35 only (adjacent, outside assigned list, recorded because it bears directly on fallback) |

## Per-source record

### S-1 · `docs/canon/PROVIDER_GOVERNANCE.md`
- **DATE / SHA** — ratified 2026-07-07 (self-declared, :3). SHA UNKNOWN (E-1).
- **STATUS** — "**Status:** Canon (ratified 2026-07-07)." (:3)
- **JURISDICTION** — *who may enter the runtime, and under what conditions* (:62). Substrate inference: chat, embedding, TTS, STT.
- **WHAT IT SETTLES** — (a) the principle: "Providers are **replaceable, governable infrastructure beneath MAIA's identity — never the identity itself.**" (:7); (b) a three-tier structure — Production / Lab / Forbidden (:17–21) — and that **capabilities**, not providers, are the unit of governance (`member_data`, `member_audio`, `chat`, `embedding`, `tts`, `stt`, `benchmark`, :23); (c) a production provider without `member_data` may still not receive it (:23); (d) three Forbidden *rules* (browser API keys · direct provider calls for cognition bypassing `lib/ai/sovereignRouter` · provider-specific UI surfacing vendor voice/model names to members, :27–29); (e) the allowlist is "**enumerated migration debt** — it can only shrink" (:33); (f) editing tiers or the allowlist "is a governance act, reviewed in PR" (:39); (g) an OpenAI burn order, 6 steps (:43–50).
- **WHAT IT DOES NOT SETTLE** — ⭐ **which MODEL within an admitted provider may serve a given turn.** It governs vendors and capabilities; the word "model" appears only inside the forbidden-UI rule (:29). It does not settle what happens to MAIA's identity when a provider fails or falls back; it does not name a fallback order, a refusal semantics, or a degradation rule. It does not settle model pinning, model versioning, context-window class, or reasoning-tier selection. It does not settle who authorizes a tier change beyond "reviewed in PR". It does not settle Lab-tier *evaluation* authority (what counts as "an explicit, gated evaluation", :20). It does not govern deployment or schema.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT by self-declaration. ⚠️ Its own "See also" map (:62–66) cites **two artifacts that do not exist in this tree**: `docs/ai/MULTI_MODEL_SESSION_MODE.md` and `docs/ux/ATTENTION_SALIENCE_PRINCIPLE_CANDIDATE_2026-07-26.md` (`find docs -iname` → no match), plus an unpathed "Voice Interaction Architecture *(Cat-1 candidate, sealed)*".
- **BINDING FORCE** — **ratified canon**.
- **NOTES** — Enforcement named in-document: `scripts/check-provider-governance.ts` / `npm run check:no-openai`, wired into preflight, CI, pre-commit (:35). The document is explicit that the guard is "the first *implementation* of that policy, not the policy itself" (:9).

### S-2 · `scripts/provider-policy.json`
- **DATE / SHA** — UNKNOWN (no date field). Declared by S-1 as its machine-readable form.
- **STATUS** — self-describes: "Provider Governance policy (machine-readable). Enforced by `scripts/check-provider-governance.ts`… Human policy + rationale: docs/canon/".
- **JURISDICTION** — the enumerated provider set, their capabilities, and the migration-debt allowlist.
- **WHAT IT SETTLES** — Production tier: `anthropic` [chat, member_data] **via `lib/ai/sovereignRouter`** · `ollama` [chat, embedding, member_data] · `kokoro` [tts, member_audio] · `sesame` [tts] · `personaplex` [tts, `status: pending_qualification`] · `faster-whisper` [stt, member_audio]. Lab tier: `openai` [benchmark], `status: removal_in_progress`. Forbidden: three rules with "NO allowlist target". `_invariant`: "Providers are replaceable, governable infrastructure BENEATH MAIA's identity — never the identity itself." Allowlist buckets: `quarantine_browser_keys` (3 files, "Target: zero. Do not add to this list.") · `pending_migration` · `governance_scripts` · `legacy_backend` (path-prefixed `app/api/_backend/`).
- **WHAT IT DOES NOT SETTLE** — no model identifiers anywhere; no fallback ordering; no per-capability data-class enforcement beyond the label; nothing about deployment or schema. `sesame` carries `tts` with **no** `member_audio` and the document does not say what that withholding operationally forbids.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT (present in tree; referenced by S-1).
- **BINDING FORCE** — **ratified canon** (as the enumerated body of S-1) — but note it is a *policy artifact*, not a prose ruling.
- **NOTES** — Classified here as a governing source, not as code, because S-1 :3 assigns it that role.

### S-3 · `docs/canon/OPTIMIZATION_TOOLING_GOVERNANCE.md`
- **DATE / SHA** — ratified 2026-07-26 (:3). Founder ruling "Kelly W. Nezat — 2026-07-26" (:16).
- **STATUS** — "**Status:** Canon (ratified 2026-07-26)." (:3)
- **JURISDICTION** — *what kinds of optimization are legitimate, and where are their constitutional boundaries* (:8). Automated code-optimization tools (AIDE/Weco-class **and any successor**).
- **WHAT IT SETTLES** — (a) founder ruling: such a tool "may not optimize, infer, or redefine relational, behavioral, developmental, or governance outcomes… has **no authority over runtime behavior and grants no standing as a runtime provider**" (:18); (b) the enduring principle: legitimate only in "constitutionally bounded domains where the objective is explicitly defined by humans" (:26); (c) two boundary questions — who chooses the objective (human-authored, never inferred) and what authority the optimizer holds ("An optimizer proposes; a human decides", :30–33); (d) an allowed-domain list incl. STT accuracy, VAD, vector recall, FAST-path latency, token efficiency — each against a **frozen evaluation corpus** with **no member data in the loop** (:49–51); (e) a forbidden-domain list: attachment · persuasion · disclosure · dependency · emotional influence · trust manipulation · conversational steering · memory-retention policies · consent boundaries (:57); (f) ⭐ "Cloud orchestration is a **deployment concern, not a constitutional one**" under four conditions — no production dependency · no member data · removable without architectural impact · equivalent alternatives remain possible (:61–66); (g) "Runtime admission is governed solely by `PROVIDER_GOVERNANCE.md`" (:72).
- **WHAT IT DOES NOT SETTLE** — it explicitly separates "improving the **models** — different governance" (:44) and does **not** supply that governance. It does not settle who approves an objective function, nor what record an optimization run must leave. It does not settle whether a cloud *runtime* orchestration would be constitutional (it scopes itself to offline tooling, :68).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — **ratified canon** (carries an explicit founder ruling).
- **NOTES** — ⭐ The only source in this slice that states a *general* rule about where cloud dependence is and is not constitutional.

### S-4 · `docs/canon/MAIA_CONNECTOR_EXPERIENCE.md`
- **DATE / SHA** — UNKNOWN (no date, no status line).
- **STATUS** — **none declared.** No "Status:" field anywhere in the file.
- **JURISDICTION** — member-owned external capacities (Obsidian · Nostr · CalDAV · Google/Proton mail) and the vocabulary MAIA uses for them.
- **WHAT IT SETTLES** — (as written) the four verbs Keep / Release / Coordinate / Send (:7–12); "MAIA speaks in these verbs. Not 'sync,' 'integration,' 'provider,' or 'endpoint.'" (:14); connectors surface at the moment of need, never as settings clutter (:18); ⭐ **capability routing, not provider routing** — `send_email`, `create_calendar_event`, `export_markdown`, `publish_note`; "The member only sees the provider name if a choice matters." (:28–35); three permission levels per capability with per-connector defaults (:39–48); four member journey stages (:50–55); the capability loop (:65–72).
- **WHAT IT DOES NOT SETTLE** — ⚠️ **This is a different sense of "provider" from S-1/S-2** — an *egress* destination the member owns, not an inference vendor admitted to cognition. Nothing here governs model, cognition, or MAIA identity. It does not settle consent record-keeping, revocation, failure/fallback between two connected mail providers, or what MAIA may do when no connector exists. No enforcement artifact is named.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **UNKNOWN.** Present in `docs/canon/` but self-declares nothing; cannot be dated without history (E-1).
- **BINDING FORCE** — **UNKNOWN.** Directory placement is not a status line. Reads as doctrine/experience-design; ⛔ not recorded as ratified canon on placement alone.
- **NOTES** — The capability-over-provider rule here is structurally the same move as S-1's forbidden "provider-specific UI" rule; the two are never cross-referenced.

### S-5 · `docs/canon/THREE_AUTHORITY_CHAINS.md` *(provider-relevant portion only)*
- **DATE / SHA** — authored Kelly 2026-08-02, recorded by Claude Code (:3).
- **STATUS** — "⏳ **Recorded, not ratified.** This document describes a model… it authorizes nothing and rules nothing until Kelly ratifies it." (:4–5)
- **JURISDICTION** — which artifact governs, and what evidence satisfies it; four dimensions (referential / evidence / state / approval authority, :20–24).
- **WHAT IT SETTLES (provider-relevant)** — **nothing about providers, models, vendors or inference.** Grep for `provider|vendor|anthropic|openai|fallback|substrate` returns no substantive hit; every "model" hit means *the governance model itself*. What it does supply to this slice is the release chain: Specification → Acceptance → Release authority (:44–62), and "Evidence produced for one authority chain cannot substitute for evidence required by another" (:76–77), with the ladder Implementation → Feature → Release → Founder decision (:85–92).
- **WHAT IT DOES NOT SETTLE** — ⛔ **state authority is marked "unruled"** (:23) — *who may move an artifact through its lifecycle* is explicitly blank. It does not touch provider admission, model choice, deployment mechanics or schema.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a record; **not in force**.
- **BINDING FORCE** — **draft / recorded-not-ratified** (self-declared).
- **NOTES** — ⚠️ Constitutional ownership of this document belongs to another P1-01 worker. Recorded here **only** for the negative finding (silent on providers) and for the release-chain vocabulary the deploy sources lean on.

### S-6 · `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` *(read for the provider analogue only)*
- **DATE / SHA** — founder, 2026-08-31 (:4).
- **STATUS** — "standing ruling and **hard acceptance gate**, founder, 2026-08-31. **Not a preference.**" (:4–6)
- **JURISDICTION** — "all voice, Desktop, transport and latency work, from this point forward" (:8).
- **WHAT IT SETTLES (this slice)** — ⭐⭐ the nearest thing in the corpus to model/identity law: "**The model is a worker inside this architecture, not MAIA herself.** … The intelligence lives in the governed layer above the model. A change that swaps or degrades that layer degrades MAIA even if every transport test is green." (:52–55). Prohibits "routing voice to a weaker conversational model merely because it is faster" (:65) and "skipping AIN orchestration" (:44 list). Names "model / capability orchestration" as one of the canonical-pathway constituents (:44). ⭐ The boundary sentence: "the ear may be improved freely; **the mind may not be substituted.**" (:87–88).
- **WHAT IT DOES NOT SETTLE** — ⛔ its scope is **voice / Desktop / transport / latency**, not provider admission. It does not say what happens when the *provider* (not the transport) changes, fails, or falls back. It names no provider, no tier, no fallback semantics, and does not cross-reference S-1. "A weaker conversational model **merely because it is faster**" leaves unsettled whether a weaker model is permitted for a non-latency reason (availability, cost, refusal of the primary).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT; declared a hard acceptance gate.
- **BINDING FORCE** — **constitutional** (hard acceptance gate on a class of work; self-declared founder standing ruling).
- **NOTES** — ⚠️ Another worker owns this document. Recorded here because the slice brief requires testing whether a provider-side equivalent exists. See Slice finding 2.

### S-7 · `docs/canon/FOUR_LAYER_SUBSTITUTION.md` *(head only)*
- **DATE / SHA** — origin 2026-05-20 (:5). No ratification date.
- **STATUS** — "**Status:** Canon doctrine. Discriminates Anthropic-default behavior wearing MAIA-vocabulary." (:3)
- **JURISDICTION** — PR review, response review, self-check (:4).
- **WHAT IT SETTLES** — a four-layer audit (Content / Form / Meta / Frame) for detecting vendor-default behaviour dressed in MAIA vocabulary; ⭐ "Routing drift can be CI-gated (`scripts/check-no-direct-anthropic.ts`); **voice drift cannot.** It has to be discriminated in lived contact." (:5)
- **WHAT IT DOES NOT SETTLE** — it is a discrimination practice, not an admission rule; it authorizes nothing about which provider or model may run, and defines no gate outcome.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT (head read only; tail UNREAD).
- **BINDING FORCE** — **doctrine** (self-declared "Canon doctrine").
- **NOTES** — The only source read that names *provider-default behaviour leaking into MAIA's voice* as a governed risk class. It is about **identity**, not admission — and it says the identity half is **not** CI-gateable.

### S-8 · `docs/adr/README.md`
- **DATE / SHA** — UNKNOWN.
- **STATUS** — none declared for itself; defines a status lifecycle Proposed → Accepted → Deprecated → Superseded (:24–27).
- **JURISDICTION** — the ADR directory's form and index.
- **WHAT IT SETTLES** — that an ADR captures an architectural decision with context and consequences; the creation procedure ("Update this index when accepted", :20).
- **WHAT IT DOES NOT SETTLE** — who may accept an ADR; what force an Accepted ADR has relative to canon; whether an ADR can bind runtime.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT but ⚠️ **the index is stale on its face**: it lists only ADR-001 (:13), while 004, 010 and 012 exist in the same directory. By its own rule (:20) three accepted/deferred ADRs were never indexed.
- **BINDING FORCE** — **descriptive**.
- **NOTES** — Numbering is also discontinuous (001, 004, 010, 012). Whether 002/003/005–009/011 ever existed is UNKNOWN (E-1 — no history read).

### S-9 · `docs/adr/template.md`
- **DATE / SHA** — UNKNOWN. **STATUS** — template; offers Proposed | Accepted | Deprecated | Superseded (:3).
- **JURISDICTION** — ADR form only. **WHAT IT SETTLES** — required sections: Context, Decision, Consequences (Positive/Negative/Neutral), References; Authors and Reviewers fields (:5–6).
- **WHAT IT DOES NOT SETTLE** — approval authority; evidence requirements; any relationship to the Class A/B/C gates (S-22/S-23).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT. **BINDING FORCE** — **descriptive**.
- **NOTES** — The template asks for Reviewers; ADR-012 leaves both Authors and Reviewers blank.

### S-10 · `docs/adr/001-seven-level-awareness-source-of-truth.md`
- **DATE / SHA** — **2024-12-30** as written in the file (:3) — the oldest dated artifact in this slice. SHA UNKNOWN (E-1).
- **STATUS** — "**Status:** Accepted" (:3). Authors: SoullabTech Team; Reviewers: Kelly Nezat.
- **JURISDICTION** — awareness-level representation **and model routing** for MAIA consciousness routing.
- **WHAT IT SETTLES** — ⭐⭐ **this is the only document in the slice that governs WHICH MODEL serves a turn.** "The 7-level developmental awareness system is the canonical source of truth for MAIA consciousness routing" (:30), with a routing column: L1–L2 "Always Opus" · L3–L4 "Context-dependent" · L5–L7 "Opus for depth, Sonnet for casual" (:34–42), and a canonical type carrying `routingPolicy: 'always_opus' | 'context_dependent'` (:48–56). All other awareness systems MUST map to the 7-level scale via adapters (:60).
- **WHAT IT DOES NOT SETTLE** — it names model *families* (Opus/Sonnet) with no version pin, no provider tier reference, no fallback rule, and no statement of what happens if the named model is unavailable. It does not reconcile with S-1 (which never mentions models) or with S-6 (:65, weaker model for speed). ⚠️ It settles nothing about whether this routing is still the live policy — that is a code question this census may not answer.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **CURRENT by self-declaration ("Accepted"), currency-in-practice UNKNOWN.** Nothing in the document marks it superseded; nothing read confirms it is honoured.
- **BINDING FORCE** — **ratified canon** for its own territory (Accepted ADR, founder-reviewed) — but see Slice finding 1 for the collision with S-1's silence and CLAUDE.md's flat provider rule.
- **NOTES** — Its Context table (:13–19) lists six competing awareness implementations incl. "Opus/Sonnet Routing — `lib/ai/claudeClient.ts`". ⛔ Not traced (not a code census).

### S-11 · `docs/adr/004-converge-on-single-knowledge-engine.md`
- **DATE / SHA** — Accepted 2026-06-27 (:3).
- **STATUS** — "**Status:** Accepted (2026-06-27) — implementation **[DESIGNED], not built.**" (:3)
- **JURISDICTION** — knowledge ingestion/retrieval engine selection (RAG substrate).
- **WHAT IT SETTLES** — one engine: `library_*`, parameterized by ownership/scope; `ain_knowledge_*` **declared legacy**, migrated incrementally, "retired when caller count reaches zero" (:11–15). Governance commitments (consent, review, provenance, promotion) "must live in exactly one place" (:26).
- **WHAT IT DOES NOT SETTLE** — ⭐ it names **embedding-model reconciliation as an unresolved precondition**: "Embedding dimensions/model must be reconciled if the two engines differ, before content is unified" (:44) — a model-governance obligation with no owner named. It does not settle retrieval ranking policy, nor the retirement window, nor who verifies caller count reached zero.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a decision; **implementation self-declared DESIGNED, not built**.
- **BINDING FORCE** — **ratified canon** for the decision; **spec** for the mechanics (explicitly deferred to an implementation spec, :58).
- **NOTES** — An Accepted ADR that openly declares its own non-implementation is the cleanest example in this slice of decision ≠ liveness.

### S-12 · `docs/adr/010-personal-professional-portal-layers.md`
- **DATE / SHA** — Accepted 2026-07-01, Author Kelly Nezat (:3–5).
- **STATUS** — "**Status:** Accepted".
- **JURISDICTION** — layering of Personal Field (universal base) vs Contribution Field (additive, Co-Lab-scoped).
- **WHAT IT SETTLES** — every member always has a Personal Field, "not optional, not upgradable away from"; `studio_type` configures the Co-Lab, never the member; naming ruling "Contribution Field" supersedes "Professional Portal".
- **WHAT IT DOES NOT SETTLE** — **nothing in this slice.** No provider, model, orchestration, deployment or schema content. Recorded for completeness because the brief requires all six ADRs.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT. **BINDING FORCE** — **ratified canon** (founder-authored, Accepted).
- **NOTES** — Adjacent to slice 06 only via the Co-Lab surfaces that trigger S-16's gate.

### S-13 · `docs/adr/012-openai-tts-production-status.md`
- **DATE / SHA** — 2026-07-07 (:4) — the same date as S-1's ratification.
- **STATUS** — "**Status:** Open / Deferred"; "Authors: — (stub; the substantive ruling is reserved for Kelly)" (:3–5); "No production authorization is granted by this document." (:11)
- **JURISDICTION** — the **archetype→OpenAI TTS default**: whether MAIA voice archetypes (the `maia_*` family) may resolve to OpenAI cloud TTS via the archetype-intercept path.
- **WHAT IT SETTLES** — ⭐ that the question is **open**, and locates it: R15 (`lib/tts/ttsRouter.ts`, `assertProviderQualified`) governs *explicit provider selection* — in `production-maia` the qualified set is verified-local-only (`auto`, `kokoro`); `openai`, `pplex`, `sesame` are refused there (:15–18) — but R15 "explicitly does not gate" the archetype path (:22). "**Decision. None. The archetype→OpenAI question is deferred.**" (:29). Status quo "neither ratified nor prohibited" (:32–33). "this ADR must be revisited before any claim that OpenAI is absent from production" (:48–49).
- **WHAT IT DOES NOT SETTLE** — the substantive question itself; who resolves it; by when; and what the archetype path currently does.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT and **open**.
- **BINDING FORCE** — **candidate / deferred stub** — it declares its own non-authority explicitly.
- **NOTES** — ⚠️ This is a **live, named contradiction with `CLAUDE.md` §MAIA Sovereignty** ("Never use OpenAI or other cloud AI providers", S-21) and with S-1's Lab tier. ADR-012 says the claim *"OpenAI is absent from production"* may not be made until it is revisited.

### S-14 · `docs/ops/IMMUTABLE_SHA_DEPLOY.md`
- **DATE / SHA** — origin incident 2026-07-27; invariant attributed to Kelly 2026-07-27 (:32); addendum 2026-09-03 (:207).
- **STATUS** — ⚠️ "**Status:** Proposed structural control for review (not yet deployed)." (:3) — **while the body documents a shipped mechanism, a rehearsal, and a 2026-09-03 repair with certification.** The header and the body disagree about the document's own state.
- **JURISDICTION** — what a deploy builds, and how the built identity is proved at runtime.
- **WHAT IT SETTLES** — ⭐ the **ratified invariant**: "A deploy must build an explicitly named immutable commit, never whichever branch happens to be checked out in a shared repository." (Kelly, 2026-07-27, :31–32) + companion rule "deployment ownership is exclusive from announcement through evidence capture" (:34–35). The four moves resolve / materialize / stamp / verify (:43–48), fail-closed post-swap verify on `deploy`, `update`, `deploy-maia` (:48). What is decoupled and what is deliberately not (:64–81) — build context and **migration source** both bind to the snapshot, runtime config bind-mounts do not. `DEPLOY_ALLOW_HEAD=1` as the explicit, greppable escape hatch (:103–109). The lock record names `target=` / `target_sha=` / `checkout_head=` (:111–125). 2026-09-03 addendum: image owns provenance, build **and** swap use the snapshot compose, pre-swap + dual-channel post-swap refusal, env-collision refusal (:220–228), certified by 27 hermetic assertions (:230–234).
- **WHAT IT DOES NOT SETTLE** — ⛔ **it settles WHICH COMMIT is built, never WHETHER THAT COMMIT MAY BE DEPLOYED.** It contains no authorization step, no approver, and nothing about schema content. It names its own residual: "`deploy-production.sh rollback` / hot-swap paths still launch with the checkout's compose" (:236–239). Lineage is out of scope (see S-18).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT in content; ⚠️ its Status line is stale relative to its own addendum, and §"What is decoupled" is declared "superseded **for the compose file only**" in place (:218).
- **BINDING FORCE** — **constitutional for deploy mechanics** (carries a named founder invariant) wrapped in a "Proposed" status line — recorded as **ratified canon (mechanism) with a contradictory status header**.
- **NOTES** — Evidence discipline is unusually explicit: it distinguishes the hermetic self-test from the tiny-image live rehearsal and says the rehearsal was **NOT** the full MAIA image (:152–159).

### S-15 · `docs/ops/DEPLOY_LANE_TOKEN.md`
- **DATE / SHA** — origin incident 2026-07-10 (:5).
- **STATUS** — "**Status:** Shipped with the deploy-lane lock family" (:3).
- **JURISDICTION** — which *path* may build the production image.
- **WHAT IT SETTLES** — that "deprecated" is enforced structurally: the raw compose build fails in <1s because `DEPLOY_LANE_TOKEN` is exported only by `acquire_deploy_lock()` and the compose build-arg has no default (:34–58). Runtime provenance `DEPLOY_LANE` baked into the runner stage (:63–68). Rollback tagging joined the quick path (:71–76). A per-lane token table incl. `local-dev`, `staging`, `m4-setup`, `ci-build-check`, `ci-deploy` (:84–91). ⭐ "The token is a **constant, not a nonce** … a **tripwire, not a credential**" — forging it is "an explicit, greppable, conscious act" (:93–105).
- **WHAT IT DOES NOT SETTLE** — ⛔ **it guards BUILDS, not container recreation** — this is not stated in the document; it is stated in `CLAUDE.md`:61 (S-21), which records a 2026-09-07 `up -d --no-deps maia` recreation that took no lane lock and ran no provenance verify. The document also settles nothing about authorization, schema, or who may deploy.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — **ratified canon / shipped control** (descriptive of a live enforced mechanism).
- **NOTES** — The "Why not the other shapes" section (:106–133) is the clearest statement in this slice of *why* structural refusal is preferred to warnings.

### S-16 · `docs/ops/COLAB_RELEASE_GATE.md`
- **DATE / SHA** — last production observation 2026-09-06, runtime `ca5fdff44` (:17–19).
- **STATUS** — no status line; declares itself the **standing gate** (:7).
- **JURISDICTION** — release/invite readiness for Co-Lab-scoped surfaces; boundary verification in **production data**.
- **WHAT IT SETTLES** — "A Co-Lab release is not ready because the UI looks correct. It is ready when production data proves that ownership, membership, memory, files, sessions, DMs, and people are scoped correctly." (:3). Pass condition `0 failed` (:17). "Any failure or warning blocks the release unless explicitly reviewed and signed off." (:21). The trigger table incl. ⭐ "**Any migration touching the above tables** — Schema changes can silently widen scope". The 33 checks enumerated. ⭐ "The gate remains the `failed` column, never the total… a total quoted without a run behind it is a claim, not evidence." (:56–61). Automated integration into `deploy-production.sh` smoke tests with PASS/FAIL/SKIP semantics. Manual pre-invite checklist incl. "If any schema migration was applied: re-run the gate against the migrated database".
- **WHAT IT DOES NOT SETTLE** — ⛔ who signs off a WARN; ⛔ **it gates invites and releases, not schema authorization** — a migration may already have been applied when this gate runs. It does not cover non-Co-Lab surfaces.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT; the 2026-09-06 observation is a dated reading, not a standing claim.
- **BINDING FORCE** — **constitutional for its trigger set** (CLAUDE.md :412 makes it MANDATORY before tester invites).
- **NOTES** — CLAUDE.md :424–427 records that an earlier copy of the gate named a script filename that "never existed on any branch", so the mandatory gate "could not be run as written."

### S-17 · `docs/ops/DEPLOY_OBLIGATIONS_2026-08-01.md`
- **DATE / SHA** — 2026-08-01, recorded during #857 production verification (:3).
- **STATUS** — a record of obligations and defects; "logged here so they are not carried as memory" (:4).
- **JURISDICTION** — the gap between the quick lane and the full deploy lane, with respect to migrations.
- **WHAT IT SETTLES** — ⭐⭐ the sharpest statement in this slice of **lane-vs-schema**: the commit that shipped `living_works` "deployed through the **quick lane** (`pre-deploy-gate.sh deploy-maia`), which **runs no migrations**" (:29–31). The obligation: "The `living_works` migration MUST be applied through the full guarded deployment path… **before** the declaration gesture — or any other Living Work route, loader, or query — is deployed." (:40–44). Discharge condition stated as a production `to_regclass` check. And the framing rule: do not collapse "safe now" (no callers) into "hard deploy gate" (:11–17).
- **WHAT IT DOES NOT SETTLE** — ⛔ **who authorizes the migration content**, only that it must travel the guarded *path*. It is scoped to one table. It does not address a migration that reaches production without any lane deciding to select it.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT unless discharged; discharge state UNKNOWN (not read).
- **BINDING FORCE** — **spec / standing obligation** (a recorded obligation, not a ratified general rule).
- **NOTES** — ⭐ Generalizes to exactly the 2026-09-07 finding's territory: *path* discipline exists; *selection* discipline does not.

### S-18 · `docs/ops/DEPLOY_LINEAGE_GATE_SPEC_2026-08-13.md`
- **DATE / SHA** — 2026-08-13; incident same day (:6–11).
- **STATUS** — "**Status:** specification only. No code written. Authorized in principle by founder ruling R3 (2026-08-13); implementation belongs to the `maia-route-edge-witness` unit." (:3–5)
- **JURISDICTION** — whether a deploy candidate contains what is already running.
- **WHAT IT SETTLES** — ⭐ the missing control, named: "The lock protects **time**. The provenance gate protects **identity**. **Nothing protects lineage.**" (:26–27), verified by grep across the four deploy scripts finding zero occurrences of `merge-base`/`is-ancestor`/`ancestor`/`descendant` (:16–18). The governing rule (founder form R3): descendant → fast-forward, proceed; divergent → **BLOCKED** unless explicit reconciliation evidence proves the candidate incorporates or supersedes the live changes — "**Fast-forward by default; divergence requires reconciliation evidence.**" (:33–45). Explicitly **not strict ancestry**, to avoid training operators toward overrides (:31–33).
- **WHAT IT DOES NOT SETTLE** — ⛔ **NOT IMPLEMENTED**, by its own title and status. It does not settle schema authorization (a fast-forward candidate can still carry another lane's migrations). It does not say who accepts "reconciliation evidence".
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a spec; unimplemented as of this tree per its own status (whether that is still true is a code question, ⛔ not answered here).
- **BINDING FORCE** — **spec** (with a founder ruling authorizing it *in principle*).
- **NOTES** — ⭐ The closest existing governance to the 2026-09-07 finding, and it still does not reach it: lineage asks *does the candidate contain production*, not *was this migration selected for deployment*.

### S-19 · `docs/ops/TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30.md`
- **DATE / SHA** — 2026-07-30 (title). Measured on worktree `reverent-boyd-507041` (:20).
- **STATUS** — "**Class:** tooling / evidence integrity. Not a feature. No fixes applied." (:3)
- **JURISDICTION** — what the typecheck gate actually covered, and therefore what past "typecheck passes" claims meant.
- **WHAT IT SETTLES** — that `tsconfig.typecheck.json` was **entry-point-only** (`files: ["app/api/between/chat/route.ts"]`), covering 409 files, **0** `.tsx`, **0** `components/**`, `middleware.ts` **no**, 3 `app/**` files (:10–27); and the full uncovered inventory per `app/` subdirectory.
- **WHAT IT DOES NOT SETTLE** — it applies no fix by declaration. CLAUDE.md (S-21) records the later gate shape (`tsconfig.ship.json`, ~3,965 files, baseline 239) — ⛔ this audit does not itself establish that.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **HISTORICAL (dated finding)**, superseded in effect by the gate described in CLAUDE.md; retained as the record of what pre-2026-07-30 claims were worth.
- **BINDING FORCE** — **descriptive** (an audit).
- **NOTES** — Slice-relevant only as evidence-discipline: a named case where a gate's *scope* silently determined a claim's meaning.

### S-20 · `docs/ops/GATE_EVIDENCE_DISCIPLINE.md`
- **DATE / SHA** — case dated 2026-09-01 (AIN-STRUCTURED-INFERENCE-SEAM-01).
- **STATUS** — no status line; states a rule and its originating case.
- **JURISDICTION** — when a green gate result counts as evidence.
- **WHAT IT SETTLES** — "**New source files must be tracked before a repo-wide gate's result counts as evidence about them.**" (:8–10); state it as *"gate run with all new source files tracked"*, not merely *"gate green"* (:13–15). ⭐ The case is provider-relevant: `scripts/check-no-direct-anthropic.ts` enumerates via `git ls-files`, so a new vendor-facing adapter importing `@anthropic-ai/sdk` was **invisible** to the guard and it reported green (:19–35). The checker was deliberately **not** changed — the defect was in the procedure (:37–43). Generalisation: "Stage before you gate" and ⭐ "**Probe every gate you cite.** A gate you have not seen fail is a gate you have not verified is watching." (:45–54).
- **WHAT IT DOES NOT SETTLE** — it does not enumerate which gates have this property, nor require probing anywhere structurally.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — **doctrine** (a stated general rule with no ratification line).
- **NOTES** — Names a **second** provider guard not mentioned by S-1/S-2: `scripts/check-no-direct-anthropic.ts`, with allowlist categories `approved` and `grandfathered` (per S-26). Provider enforcement therefore has **two** guards; only one is named in canon.

### S-21 · `CLAUDE.md` — §Infrastructure · §Database & Backend · §MAIA Sovereignty · §Co-Lab Release Gate (+ :61)
- **DATE / SHA** — living session anchor; the slice-relevant bullet is dated 2026-09-07 (:61). File total 530 lines.
- **STATUS** — self-titled "SESSION ANCHOR (READ FIRST)"; §Infrastructure declares itself "**Single Source of Truth**" (:141) with "⚠️ STOP — READ THIS BEFORE ANY INFRASTRUCTURE ASSUMPTIONS ⚠️" (:143).
- **JURISDICTION** — infrastructure facts, database prohibition, AI-provider prohibition, deploy commands and verification, and the mandatory pre-invite gate.
- **WHAT IT SETTLES** — **Infrastructure (:141–221)**: NOT EC2 · NOT Nginx (Caddy) · no managed hosting · no managed databases · no CDN/proxy MITM; production host minisforum; the Mac Studio is not in the public path; the deploy lane lock, the retired bare-compose path, quick vs full deploy, and the four post-deploy verifications incl. `printenv GIT_COMMIT`. **Why This Architecture (:218–221)**: "No third party sits between users and their data · No jurisdiction concerns — we control the location · Complete air-gap capability if needed for local-only mode." **Database (:223–230)**: "We do NOT use Supabase… Use local PostgreSQL via `lib/db/postgres.ts` only", enforced by `npm run check:no-supabase` in pre-commit. **MAIA Sovereignty (:232–237)**: "Primary AI: Claude (Anthropic) via `ANTHROPIC_API_KEY` · **Fallback: Local Ollama (DeepSeek models) when API unavailable** · **Never use OpenAI or other cloud AI providers** · Voice: Local TTS/STT or browser APIs only · Data: Local PostgreSQL, never cloud databases." **Co-Lab gate (:412–430)**: "No invite unless… passes with 0 failed in production."
- **WHAT IT DOES NOT SETTLE** — ⛔ **who may authorize a production schema change.** The deploy sections settle *how* and *which commit*, never *who decides* or *which migrations were selected*. It does not reconcile its own "Never use OpenAI" with S-1's Lab tier or S-13's open question. Its fallback clause names a fallback **provider** and says nothing about MAIA's identity, capability floor, or refusal under fallback.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT and continuously edited; individual bullets carry their own supersession marks in place.
- **BINDING FORCE** — **constitutional in practice for this slice** (it is the declared single source of truth for infrastructure and the mandatory gate), **but not a ratified canon document** — no status line, no ratification act, no ADR.
- **NOTES** — ⭐⭐ **`CLAUDE.md`:61 is the sole location of the 2026-09-07 structural finding.** Verbatim: "**THE STRUCTURAL FINDING — MERGE-TO-CANONICAL IS LATENT SCHEMA-DEPLOY AUTHORIZATION.** Somebody *did* decide to run a full deployment; **nobody separately authorized or selected I0.5 for it.**… *Merging a migration to the production branch is, in effect, authorizing it to be applied by whoever deploys next.* **The founder gate sits on the DEPLOY decision; nothing gates the BRANCH**". Also at :61: "**BRANCH GATE is the lane this opens**… **why can a migration become deployable merely by becoming canonical, before its own acceptance law authorizes a production schema change?**"; the adjacent fact that pushes to `clean-main-no-secrets` reported "`Bypassed rule violations … 4 of 4 required status checks are expected`"; and "⛔ Lane not opened; no repair authorized here." A `grep -rln` across `docs/` for that finding's evidence strings returns **no document**.

### S-22 · `docs/governance/BOOTSTRAP_GOVERNANCE_PHASE1.md`
- **DATE / SHA** — "Active (as of 2026-06-27)" (:3).
- **STATUS** — "**Status:** Active… **Superseded by:** Appointment of Guardian Circle (Bootstrap Phase 2)" (:3–4) — i.e. a **pre-declared** supersession whose trigger has not fired (or has: UNKNOWN, E-1).
- **JURISDICTION** — PR approval authority during the period when the only Founder is the primary author.
- **WHAT IT SETTLES** — `SoullabCovenant` is a governance principal placed in `MENTORS` (Release Steward), **not** in `FOUNDERS`, holding "no intrinsic founder-level authority" (:23–29). The Class A deadlock fallback: "When the only Founder is the PR author **and** no independent Founder or Guardian Circle exists, a Mentor approval substitutes for Founder approval." (:40–42). ⭐ "The authority… comes from the governance rules in force — not from the identity of the reviewer." (:33)
- **WHAT IT DOES NOT SETTLE** — ⛔ it says nothing about **deployment** or **schema**: approving a PR is not authorizing a production schema change, and the document never claims otherwise. It does not define Class A/B/C membership (that is `GOVERNANCE_MENTOR_COVENANT.md`, ⛔ unread in this slice).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT ("Active") with a named future superseder.
- **BINDING FORCE** — **ratified canon / governance instrument in force** (self-declared Active, with an enforcement layer named).
- **NOTES** — ⭐ This is the only source read that identifies *who may approve* anything. It gates **merge**, and the 2026-09-07 finding is precisely that merge is where schema authorization silently accrues.

### S-23 · `docs/governance/PR_1145_CLASS_A_BOOTSTRAP_EXCEPTION_2026-08-28.md`
- **DATE / SHA** — 2026-08-28; pins candidate `c0b3a5cd…`, merge `6ccd7479…`, base `d332935a…`, PR #1145.
- **STATUS** — "**Status:** CLOSED — both required acts recorded"; "**This is not a Class A PASS.**"
- **JURISDICTION** — one specific merge and the language that may ever be used to describe it.
- **WHAT IT SETTLES** — ⭐⭐ a naming law: "Nothing in this record may be summarized as *'Class A gate passed'*, *'Council approved'*, or *'independent review complete'*." Authority "attaches to **those SHAs only**. A later code change cannot inherit it." Facts preserved: #1145 merged under Class B with **zero approving reviews**; "The six green checks were CI and diagnostics, not human review"; subsequently reclassified Class A on founder ruling.
- **WHAT IT DOES NOT SETTLE** — it is an instance record, not a rule; it does not change the gate, and it does not touch schema or deployment authority.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a closed record.
- **BINDING FORCE** — **ratified canon for its named SHAs only** (self-limiting by construction).
- **NOTES** — Directly relevant to this slice as a witnessed case of *a merge carrying more authority than the gate that passed it*.

### S-24 · `docs/governance/LIFECYCLE_GAP_LAYER1_FINDING_2026-07-29.md`
- **DATE / SHA** — opened 2026-07-29; "**Status:** RULED — AFFIRMED 2026-07-29T18:04:22Z".
- **JURISDICTION** — whether a ratified state can exist without becoming recorded and verifiable. Explicitly one question only.
- **WHAT IT SETTLES** — AFFIRMED: the governance lifecycle is **incomplete**. The deciding distinction (:62–63): "Is merge-to-canonical an **explicit required state transition**, or a **possible action that people are expected to remember to perform**?" — the affirmation case holds that "Nothing in the lifecycle requires or checks the transition from *decided* to *recorded*" and "A defect that reproduces itself after being identified is structural, not personal" (:74–79). Closure requires "commit on a named branch → PR → **merge SHA**" (:123).
- **WHAT IT DOES NOT SETTLE** — ⛔ it is about **governance artifacts becoming recorded**, not about **migrations becoming deployable**. The same phrase — *merge-to-canonical* — carries an entirely different object in the 2026-09-07 finding. The ruling does not reach schema at all.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT (ruled).
- **BINDING FORCE** — **ratified canon** (founder ruling recorded in-document).
- **NOTES** — ⚠️ Kept distinct on purpose: merge-as-record-closure (here) ≠ merge-as-latent-schema-authorization (S-21 :61). Merging the two would be the exact category error this slice is instructed to avoid.

### S-25 · `docs/governance/00_PROVENANCE/README.md`
- **DATE / SHA** — references events to 2026-09-02.
- **STATUS** — directory rule; no ratification line.
- **JURISDICTION** — preserved primary sources vs derived readings.
- **WHAT IT SETTLES** — "**Unchanged means unchanged.**… A preserved source that has been improved is no longer a source; it is one more derived document wearing a source's name." Every item carries a source note (how produced, by whom, from what, when). ⛔ "**Preservation is not ratification.**"
- **WHAT IT DOES NOT SETTLE** — nothing in this slice's subject matter; it governs custody of primary material only. Current holdings are Larry/Tiger-21 material, all PENDING or not held.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — **doctrine** (directory rule).
- **NOTES** — Recorded because it is the general evidence-custody rule any provider/deploy witness would fall under.

### S-26 · `docs/architecture/AIN_STRUCTURED_INFERENCE_SEAM_01.md` *(head only, adjacent)*
- **DATE / SHA** — base canonical `7ed38723ee3cbc02a10be57006136d21b4fce7d4` (:3); branch `claude/structured-inference-seam-01`.
- **STATUS** — "structured inference, **returned for adjudication**" (title). "**Neither reader was migrated.** The seam and its evidence are returned first, as the mandate directs."
- **JURISDICTION** — a provider-neutral structured-inference seam; one vendor-facing adapter.
- **WHAT IT SETTLES (as proposed, not ratified)** — ⭐⭐ the only **fallback semantics** found in this slice: "primary → pinned model, executed exactly, **no fallback** / provider failure → **REFUSE** (`provider_unavailable`)"; "sovereign / local_only → `structured_inference_unavailable` / **never a quiet call to Anthropic behind the mode** / **never a degraded local text answer**". `LOCAL_STRUCTURED_PROVIDER` is a named constant currently `null`. One allowlist entry under `approved` — "the category the guard reserves for 'SovereignRouter-backed adapters' — **not** `grandfathered`."
- **WHAT IT DOES NOT SETTLE** — it is **returned for adjudication**, not ratified; it governs *structured* inference only, not conversational cognition; and it does not claim to state general provider-fallback law.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a returned candidate; adjudication outcome **UNKNOWN** (not read; E-1 forbids reconstructing it).
- **BINDING FORCE** — **candidate**.
- **NOTES** — ⛔ **Outside the assigned reading list**; head read only. Recorded because Slice finding 2 would otherwise be reported as a clean absence when a *candidate* answer demonstrably exists and points the opposite way from `CLAUDE.md`'s fallback clause.

---

## Slice findings

### 1 · What governs WHICH model/provider may serve MAIA — constitutional or operational?

**Provider admission is constitutional; model selection is not governed at the same altitude, and the two are not connected by any document read.**

- **Provider (constitutional).** S-1 :7 — *"Providers are **replaceable, governable infrastructure beneath MAIA's identity — never the identity itself.**"* — with a three-tier structure and capability grants (S-1 :15–23), a Forbidden rule against *"Direct provider calls for cognition that bypass `lib/ai/sovereignRouter`"* (S-1 :28), and the requirement that *"Editing tiers or the allowlist is a governance act, reviewed in PR"* (S-1 :39). Enumerated in S-2. This is ratified canon (2026-07-07).
- **Operational overlay, in conflict.** `CLAUDE.md` :232–237 states flatly *"Primary AI: Claude (Anthropic)… Never use OpenAI or other cloud AI providers."* S-1 :20 instead places OpenAI in a **Lab** tier — *"**no** (never a default)… only inside an explicit, gated evaluation"* — and S-13 :32–33 says the archetype→OpenAI TTS status quo is *"neither ratified nor prohibited"* and *"must be revisited before any claim that OpenAI is absent from production."* ⚠️ The session anchor asserts an absolute the canon does not hold and an open ADR forbids claiming.
- **Model (weakly governed, old, unreconciled).** The only document that settles which *model* serves a turn is **S-10 / ADR-001 (Accepted, 2024-12-30)**: *"The 7-level developmental awareness system is the canonical source of truth for MAIA consciousness routing"* with L1–L2 *"Always Opus"*, L5–L7 *"Opus for depth, Sonnet for casual."* No provider-tier document references it; it names no version pin and no unavailability behaviour. S-6 :65 adds one negative rule — do not route *"voice to a weaker conversational model merely because it is faster"* — scoped to voice/transport work only.
- ⛔ **Nothing read connects provider tier to model choice.** A provider may be admitted with `chat` capability while the model it serves is governed, if at all, by a 2024 ADR about developmental levels.

### 2 · Is there a governing document that settles what happens to MAIA's IDENTITY when the provider changes or falls back?

**No ratified document. The nearest ratified statement is a principle, not a rule; the only operative fallback semantics found is a CANDIDATE, and it contradicts the session anchor.**

- **Ratified principle only** — S-1 :7 (providers are beneath identity, never the identity) and S-2 `_invariant`. Neither states a consequence, a threshold, or a refusal. S-1 contains no fallback language at all.
- **The nearest analogue exists but is scoped elsewhere** — S-6 :52–55: *"**The model is a worker inside this architecture, not MAIA herself.** … The intelligence lives in the governed layer above the model. A change that swaps or degrades that layer degrades MAIA even if every transport test is green."* and :87–88 *"the ear may be improved freely; **the mind may not be substituted.**"* ⚠️ That document's declared scope is *"all voice, Desktop, transport and latency work"* (S-6 :8). It answers *transport substitution*, not *provider substitution*, and names no provider.
- **Two live statements point in opposite directions, neither ratified for this question.** `CLAUDE.md` :234 — *"Fallback: Local Ollama (DeepSeek models) when API unavailable"* (silent on capability floor or identity). S-26 (candidate, returned for adjudication) — *"provider failure → **REFUSE** (`provider_unavailable`)… **never a quiet call to Anthropic behind the mode**… **never a degraded local text answer**."* ⛔ Whether refusal or fallback governs conversational cognition is **UNSETTLED** by everything read.
- **One document says the identity half cannot be gated at all** — S-7 :5: *"Routing drift can be CI-gated (`scripts/check-no-direct-anthropic.ts`); **voice drift cannot.** It has to be discriminated in lived contact."*

### 3 · What governs the boundary between "sensory infrastructure that may change freely" and "the mind that may not be substituted"?

Three documents state it; **only one states it as law, and that one is scoped to voice/transport.**

1. **S-6 · `MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`** — the boundary sentence (:87–88) and, in §"What this rule does NOT cover", *"Hearing accuracy is not intelligence. Whisper is MAIA's ear, not her mind."*. **Constitutional, hard acceptance gate** — but for voice/Desktop/transport/latency work.
2. **S-1 · `PROVIDER_GOVERNANCE.md`** — the same boundary drawn on the *vendor* axis: substrate inference (chat, embedding, TTS, STT) is *"one conditional manifestation pathway, swappable at will, governed by policy"* (:9), beneath an identity it may not constitute (:7). **Ratified canon.**
3. **S-7 · `FOUR_LAYER_SUBSTITUTION.md`** — the detection practice for when vendor-default behaviour wears MAIA vocabulary. **Doctrine**, and it explicitly says the voice half is not machine-checkable.

⛔ **The three are never cross-referenced.** S-1's "See also" map (:62–66) does not list S-6 or S-7; S-6 does not cite S-1. The boundary is stated three times on three different axes (transport / vendor / register) and unified nowhere.

### 4 · Deployment governance — who may change production schema, and is the 2026-09-07 finding answered?

**No document read settles who may authorize a production schema change. The finding is recorded in exactly one place and is answered by nothing.**

- **What IS settled** — *how* a deploy builds (S-14: *"A deploy must build an explicitly named immutable commit, never whichever branch happens to be checked out"*, Kelly 2026-07-27); *which path* may build (S-15, structural tripwire); *what must pass before invites* (S-16, `0 failed`, triggered by *"Any migration touching the above tables"*); *which lane runs migrations at all* (S-17: the quick lane *"runs no migrations"*, and the `living_works` migration *"MUST be applied through the full guarded deployment path"*); and *what is missing* (S-18: *"The lock protects **time**. The provenance gate protects **identity**. Nothing protects **lineage**."*).
- **Who may approve a merge** — S-22 (Bootstrap Phase 1, Active): Mentor approval substitutes for Founder approval under the named deadlock; authority *"comes from the governance rules in force — not from the identity of the reviewer."* ⛔ That is merge authority, and no document read converts it into schema authority.
- **Finding location** — **`CLAUDE.md`:61 only.** *"**THE STRUCTURAL FINDING — MERGE-TO-CANONICAL IS LATENT SCHEMA-DEPLOY AUTHORIZATION.**… Once the I0.5 lane merged its migrations to `clean-main-no-secrets`, the next unrelated full deploy applied them automatically as part of canonical branch state.… **The founder gate sits on the DEPLOY decision; nothing gates the BRANCH**"*, with *"⭐ **BRANCH GATE is the lane this opens**"* and *"⛔ Lane not opened; no repair authorized here."* A repository-wide `grep` for the finding's evidence strings (`18:24:46`, `latent schema-deploy`, `SCHEMA DRIFT`) returns **no `docs/` document**.
- **Answered by any governing document? NO.** S-18 is the closest and does not reach it: lineage asks *does the candidate contain what is running*, not *was this migration selected*. S-17 governs the *path* a migration travels, not its *selection*. S-16 gates invites, after the fact. S-24 rules on merge-to-canonical as the closure transition for **governance artifacts** — a different object, and ⛔ must not be read as covering schema.
- ⛔ No repair proposed or implied here, per lane authority.

### 5 · Where governance is UNLOCATED in this slice

1. **Model governance.** No canon document governs model selection, pinning, versioning, or unavailability. The only artifact is ADR-001 (2024-12-30), unreferenced by any provider document.
2. **Provider-side identity law.** No provider equivalent of S-6's substitution rule exists. Fallback semantics live only in a **candidate** (S-26) and a one-line session-anchor clause that disagree.
3. **Schema-deploy authorization.** No document names who may authorize a production schema change; the finding that names the gap lives only in `CLAUDE.md`:61.
4. **Branch gate.** `CLAUDE.md`:61 also records that pushes to `clean-main-no-secrets` reported *"Bypassed rule violations … 4 of 4 required status checks are expected."* No governing document addresses the production branch's write conditions.
5. **Deploy ledger.** `CLAUDE.md`:61: the lane *"keeps NO durable record of completed deploys"* — the lockfile holder record is overwritten each acquisition. No ops document governs deploy record retention.
6. **Dangling canon references.** S-1 :64–66 cites `docs/ai/MULTI_MODEL_SESSION_MODE.md` and `docs/ux/ATTENTION_SALIENCE_PRINCIPLE_CANDIDATE_2026-07-26.md` — **neither exists in this tree**; plus an unpathed sealed "Voice Interaction Architecture". Whether they ever existed is UNKNOWN (E-1).
7. **Second provider guard.** `scripts/check-no-direct-anthropic.ts` (S-20, S-26) with `approved`/`grandfathered` categories appears in no canon document; S-1 names only `check-provider-governance.ts`.
8. **Lab-tier evaluation authority.** S-1 :20 permits member data inside *"an explicit, gated evaluation"*; nothing read defines who authorizes one or what gating means.
9. **ADR standing.** No document states what force an "Accepted" ADR carries against canon, or who accepts one. S-8's index is stale (3 of 4 substantive ADRs unlisted).
10. **Connector-provider consent record.** S-4 defines permission modes but no artifact, no revocation law, and declares no status for itself.

### Contradiction between sources
- **C-A** `CLAUDE.md`:235 *"Never use OpenAI or other cloud AI providers"* ⟂ S-1 :20 Lab tier (OpenAI, benchmark, removal in progress) ⟂ S-13 :32–33 (*"neither ratified nor prohibited"*, and the claim *"OpenAI is absent from production"* may not be made). Three documents, three states.
- **C-B** `CLAUDE.md`:234 fallback-to-Ollama ⟂ S-26 candidate *"provider failure → REFUSE… never a degraded local text answer."*
- **C-C** S-14 header *"Proposed structural control for review (not yet deployed)"* ⟂ its own body (shipped mechanism, 2026-09-03 repair, 27 certified assertions) and ⟂ `CLAUDE.md`:183–217, which documents the mechanism as the live required path.
- **C-D** S-8 index rule *"Update this index when accepted"* ⟂ the directory's actual contents.
- **C-E** S-24 (ruled: merge-to-canonical as lifecycle **closure**) vs `CLAUDE.md`:61 (merge-to-canonical as latent **authorization**) — not a contradiction of law, but the same phrase carrying two objects; ⛔ recorded so the two are never merged.

### Documents that declare their own non-authority
- **S-5** — *"Recorded, not ratified… authorizes nothing and rules nothing until Kelly ratifies it."*
- **S-13** — *"No production authorization is granted by this document."* / *"Decision. None."*
- **S-18** — *"specification only. No code written."*
- **S-23** — *"This is not a Class A PASS."* / authority attaches to named SHAs only.
- **S-25** — *"Preservation is not ratification."*
- **S-11** — Accepted, *"implementation [DESIGNED], not built."*
- **S-26** — *"returned for adjudication"*; neither reader migrated.
- **S-16** — *"a total quoted without a run behind it is a claim, not evidence."*
- **S-20** — *"A gate that did not look at your change is not a gate you passed."*

### Open questions for P1-02
1. Is ADR-001's Opus/Sonnet routing still the operative model policy, or historical? (Code question — P1-02.)
2. Does `lib/ai/sovereignRouter` in fact mediate all cognition, as S-1 :28 requires? Unverified here.
3. What did the S-26 adjudication decide? (⛔ do not reconstruct from history — E-1.)
4. Does a `GOVERNANCE_MENTOR_COVENANT.md` (cited by S-5 :24) define Class A/B/C in a way that touches schema? Unread in this slice.
5. Do the three dangling S-1 references exist under other names, or were they never authored?
6. Is Bootstrap Phase 1 still Active, or did the Guardian Circle appointment fire? (S-22's own superseder.)
7. Is the S-17 `living_works` obligation discharged?
8. Was the S-18 lineage gate implemented after 2026-08-13?
