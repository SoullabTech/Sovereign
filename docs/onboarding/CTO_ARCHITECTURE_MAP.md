# MAIA — Architecture Map for the Incoming CTO

> **What this is.** The whole system on one map, bounded into sections you can attack one at a time, with the *reality-status* of every component stated next to it so you never have to hold "wait — is this actually real?" in your head while you read. You can read this in one sitting or in six; either way you won't lose the thread.
>
> **Verified against code:** 2026-06-09. Tiers are a snapshot, not a promise — see §0 for how to keep them honest.

---

## §0 — How to read this (read this one first)

**Scope:** the rules of the road for this document. **· Self-contained.**

### The status ladder

Every component carries a tier. The single most important bit — the only thing you must hold while reading — is **which side of the code line** it's on.

| Tier | Means |
|---|---|
| **Verified** | Fired under real load; evidence captured |
| **Observed** | Has fired and been seen at least once; not yet confirmed under sustained load |
| **Wired** | Connected into the live path; firing not yet observed |
| **Built** | Exists in code; **zero live callers** |
| **— THE CODE LINE —** | *above = exists in the repo today · below = does not exist yet* |
| **Designed** | A spec or plan exists; nothing is built |
| **Vision** | Research / future direction |

`[direction: TBD]` next to a component means **the future direction is an open decision that has not been made.** It is deliberately not resolved here. Do not assume it.

### Reading rules

1. **Sections are self-contained.** Each one states its scope and confirms you don't need any other section to use it. Read in any order.
2. **§9 is your anchor.** The master ledger lists every component and its tier on one screen. When you lose the thread, go there.
3. **One discipline you inherit on day one:** this project refuses to state tomorrow's story as if it were today's. It distinguishes *built ≠ wired ≠ observed ≠ verified* and treats that distinction as load-bearing. Every tier in this doc is that discipline applied. **If you change what a component actually does, change its tier in the same commit.** A doc that quietly drifts to optimism is the failure mode this whole format exists to prevent.

---

## §1 — What MAIA is (and is not)

**Scope:** the *why*. Everything after this is *how*. **· Self-contained.**

MAIA is a **self-hosted, sovereign consciousness companion.** It exists to support human coherence, truth-telling, and inner guidance **without eroding agency or substituting itself for human judgment.** It is not a generic chatbot, not an assistant, not an authority.

It is governed by explicit vows. These are not aspirational copy — a change that violates them is **invalid regardless of technical merit:**

- **Sovereignty first** — human agency outweighs engagement, retention, or any performance metric.
- **Consent for memory** — no stealth memory. What is held, and why, is governed by consent (see §4).
- **No guru stance** — reflection, framing, and choice; never command, diagnosis, or authority.
- **No attachment capture** — MAIA does not court dependency, loyalty, or psychological bonding.
- **Self-hosted by design** — no cloud lock-in; the infrastructure is part of the ethics (see §2).
- **Spiritually intelligent, not spiritually authoritative** — it can use symbolic/mythic language without claiming truth-status over the person.

Canon lives in `docs/canon/` — `MAIA_CANON_v1.1.md`, `MAIA_OATH.md` (the irreducible standard), and `MAIA_SOVEREIGNTY_INVARIANTS.md`. When in doubt about whether a change is allowed, that's where the answer is.

---

## §2 — Where it runs (infrastructure) · **[Verified]**

**Scope:** the physical/operational stack and how to deploy it. **· Self-contained.** This is the most concrete section — start here if you want solid ground.

### What we DO NOT use — never assume these
**Not EC2. Not Nginx. Not Supabase (or any managed DB). Not Vercel/Netlify/Heroku. No Cloudflare/CDN MITM.** If you see Supabase in the code, it's a violation to remove, not to consolidate (`npm run check:no-supabase` enforces this in the pre-commit hook).

### What we DO use
- **Production host:** a single box named **minisforum** (LAN `192.168.0.104`), reached via `ssh soullab@minisforum`. Runs Docker + **Caddy** (auto-TLS via Let's Encrypt).
- **Traffic path:** DNS for `soullab.life` → the LAN's public IP → the router forwards :443/:80 → minisforum. The Mac Studio (the dev box where most work happens) runs a parallel Docker stack with identical names but is **not** in the public path.
- **Database:** self-hosted **PostgreSQL** in Docker (`maia-postgres`). Client is `lib/db/postgres.ts` (the `pg` package). This is the **sole datastore** — see §8 for what that explicitly rules out.

### The seven containers
| Container | Role |
|---|---|
| `maia-sovereign` | Main Next.js app (port 3000, Docker-internal) |
| `maia-api` | API backend (3001, published) |
| `maia-caddy` | Reverse proxy / TLS (80/443) |
| `maia-postgres` | PostgreSQL |
| `maia-comms-worker` | Background worker |
| `maia-whisper` | Speech processing |
| `maia-rlm` | RLM service |

### Deploy (run from the Mac Studio; executes on minisforum)
The canonical command is in `CLAUDE.md`; the shape is: `ssh soullab@minisforum`, `git checkout clean-main-no-secrets && git pull`, then `docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d --build maia`.

**Then verify three things** — this is where deploys silently fail:
1. **Container freshness** — `docker inspect maia-sovereign --format "{{.Created}}"` must read under a minute old. *(Most common mistake: rebuilding on the Mac Studio. The local stack reports healthy and `Created` updates, but production keeps serving the old container.)*
2. **LAN IP** — `ssh soullab@minisforum 'hostname -I'` must show `192.168.0.104`. After a power event, DHCP can re-lease a different IP; if the router's port-forward still points at `.104`, external/iOS traffic silently drops. Set a DHCP reservation to make this trap structurally impossible.
3. **Public reachability** — `/api/health` returns fresh JSON with `uptime` near zero.

---

## §3 — What happens on a request (the core loop) · mixed tiers

**Scope:** the path from a member's message to MAIA's reply. **· Self-contained.**

A member sends a message. Then, in order:

1. **Tier selection** — the request is routed to one of three processing paths. **[Verified]**
   - **FAST** (<2s) · **CORE** (2–6s) · **DEEP** (6–20s).
   - Selection is subscription-driven (`lib/consciousness/SmartTierSelection.ts`): free → essential/FAST; explorer → up to deep; seeker → deep default; oracle → deep + complete. Persisted on `agent_runs.processing_profile`.
2. **Context assembly** — memory and knowledge sources are gathered *before* generation (retrieval-precedes-generation; `maiaOrchestrator`). **[Wired]** — it's a real pattern, not an enforced lock (see §8).
3. **One model call** — the live path is `lib/sovereign/maiaService.ts` → `lib/ai/modelService.ts` (`generateText`) → `lib/ai/claudeClient.ts`, **exactly once per turn.** **[Verified]**
4. **Authorship** — `MaiaVoice` (the orchestrator) single-authors the reply. **[Verified]**
5. **Trace emission** — `corpusCallosumService` writes rows to `agent_runs` / `integration_passes` recording which lenses were co-present. **[Observed]** (production rows exist).

> ### ⚠️ Correction you will hear the wrong version of
> There is **no eight-agent committee deliberating** on responses. **One Claude call per turn. `MaiaVoice` single-authors.** The eight "voices" (MythicAtlas, MaiaVoice, ShadowAgent, Fire/Water/Earth/Air/Aether) are **diagnostic trace rows** — `record_type='trace_observation'`, which the code itself annotates as "this row does NOT author it." They record co-presence for later audit; they do not generate text and do not make their own API calls. Genuine multi-agent *deliberation* exists only as unwired scaffold — see §8. You will grep `corpusCallosumService` in your first week; this note is so the code matches the story.

**Providers** (full detail in §5): Claude (Anthropic) is primary via `ANTHROPIC_API_KEY`; local Ollama/DeepSeek is the fallback. Never OpenAI or other cloud providers.

**Voice modes:** Talk (dialogue), Care (counsel), Note (scribe).

---

## §4 — Memory & consent · mixed tiers

**Scope:** what MAIA remembers, and the consent architecture around it. **· Self-contained.** This is both the product differentiator and the ethical core.

### The principle
**No stealth memory.** Regular sessions build memory; nothing is held by default that the member hasn't consented to.

### Sanctuary Mode · **[Verified]**
An explicit opt-in where a conversation is useful in the moment but **does not enter long-term memory** — no content retention, no pattern formation, no training data, only minimal "a session occurred" metadata. The boundary is **absolute:** nothing from a Sanctuary session can be saved, inferred, or converted to memory **under any circumstances, including by user request during the session.** This is the architectural proof that the system serves the person, not the data model. Don't soften it.

### Memory subsystems
> **Provenance note.** The tiers below come from the team's runtime tracking and the founder's own placement — **not** from this session's code audit. The deploy-state-sensitive ones (relational, episodic) were branch-only awaiting deploy as recently as late May 2026; **confirm current deploy state before trusting the tier.**

| Subsystem | Tier |
|---|---|
| Session memory | Verified |
| Semantic atoms (per-turn surfacing) | Verified |
| Relational / conversational recall | *Live per placement — **confirm deploy state*** |
| Episodic memory | **Built, Unwired** |
| Livingness guard | Designed |

### Knowledge Gate · **[Wired]**
`lib/ain/knowledge-gate.ts` scores five **logical** knowledge sources (FIELD, AIN_OBSIDIAN, AIN_DEVTEAM, ORACLE_MEMORY, LLM_CORE) by the member's awareness level and **weights which sources feed the prompt.**

> **Correction:** this is *source-weighting*, not *behavioral withholding*. It biases what informs the answer; it does **not** currently suppress a member-facing surface that MAIA "knows but isn't ready to show." If you hear "calibrated withholding," that's the narrower truth.

### Bridge D — spiral-state persistence · **[Verified]**
`lib/consciousness/spiralStatePersistence.ts` + table `member_spiral_state`. Persists only **structural position** (element/phase/motion), never conversation content, so a returning member isn't treated as brand-new after a server restart. This is **continuity, not personalization, and not psychometrics.** Fire-and-forget writes, graceful read fallback.

---

## §5 — AI sovereignty & the provider boundary · mixed tiers

**Scope:** which models run, and the open research question underneath them. **· Self-contained.**

- **Primary:** Claude (Anthropic), `ANTHROPIC_API_KEY`. **[Verified]**
- **Fallback:** local Ollama (DeepSeek) when the API is unavailable. **[Verified]**
- **Never** OpenAI or other cloud AI providers. Voice is local TTS/STT or browser APIs.

**The boundary audit · [Wired — instrumentation live, evidence pending].** The real sovereignty question is *which dimensions of MAIA survive substituting the model provider* — i.e., how much of "MAIA" lives in the orchestration/canon vs. in Claude. Instrumentation exists; the conclusive run is pending. Treat any claim that "MAIA is model-independent" as **unproven** until that evidence lands.

**Two-node cognition topology · [Designed].** The planned server-upgrade path: keep minisforum as the *substrate* node (Postgres, memory, continuity, consent, orchestration) and add a separate *cognition* node (a 128GB Strix Halo box) for swappable local models. Designed, not built — buy-on-validation, not on calendar.

**Evaluator layer · [Vision].**

---

## §6 — Identity, members, onboarding · **[Verified]**

**Scope:** who a user is and how they're recognized across devices. **· Self-contained.**

- **`members` table** (PostgreSQL): id, passkey, username, password_hash, name, email, `onboarded`, `onboarding_step`. Enables cross-device recognition.
- **Endpoints:** `/api/members/{check,register,signin,recover,progress}`.
- **Onboarding** is **one-time per member** and strictly sequenced: `/begin → /test-elemental → /faq → /onboarding → /maia`. Once `onboarded: true`, users skip straight to `/maia`. Returning users sign in at `/signin`.
- **Completion flag** is stored in both `members.onboarded` (server) and `localStorage.beta_user.onboarded` (client cache).

---

## §7 — Mobile / iOS (Capacitor) · **[Verified]**

**Scope:** the iOS build pipeline and its specific traps. **· Self-contained.**

The app ships to iOS via Capacitor static export. Known traps — these account for most "mobile is broken" reports:

- **Cookies don't cross the WebView boundary.** `SameSite=Lax` cookies aren't sent cross-origin from the iOS WebView → use `x-member-id` via `apiFetch()` (`lib/http/apiBase.ts`), not cookie auth.
- **Static-export incompatibilities.** Some Next.js routes/middleware can't be statically exported → excluded via `scripts/capacitor-patch-routes.sh`. Any route with `export const dynamic = 'force-dynamic'` must be listed in `EXCLUDED_DYNAMIC_ROUTES`.
- **"It forgot me."** Almost always localStorage/cookie loss after a rebuild or WebView reset — check `beta_user`.

---

## §8 — Open directions & the claim discipline

**Scope:** the decisions that are *not yet made*, and the doctrine that keeps this doc honest. **· Self-contained.**

### Open directions — three, each with a named exit condition
The open architectural set is small and bounded, and it's the *decision* surface — distinct from the *evidence* surface (things awaiting measurement, e.g. the boundary audit in §5 and the deploy-state confirms in §4). Each item below has a **verified current tier** and a **specific condition that would resolve it**, so it stays open on evidence rather than inertia, and isn't silently resolved by whoever writes the next doc.

| Component | Current tier | Stays open until… |
|---|---|---|
| Multi-agent LLM deliberation | **Built** — `lib/agents/elemental/FireAgent.ts` (+ siblings) have `ClaudeService` injected but **zero live callers**; only beta/prototype code calls them. The scaffold exists; it's unwired. | …a **specific capability that requires it is named.** The question is no longer "can we build it?" (we nearly have) but "what does it unlock that single-author `MaiaVoice` can't?" MAIA works better than expected without it, so the burden is on the use-case, not the build. `[direction: TBD]` |
| Enforced retrieval-first guard | **Designed** — retrieval *precedes* generation as a pattern, but no runtime lock blocks generation when retrieval is thin. | …**observed failures demand it.** We already have the retrieval-first pattern, memory orchestration, and memory-health monitoring. Whether a hard runtime guard is needed should come from measured failure, not architectural taste. `[direction: TBD]` |
| Sacred-refusal vs. system-failure distinction | **Unverified** — code distinguishing an intentional, sovereignty-preserving refusal from an actual error was **not located** this pass. *(Grep-negative: `SacredSafetyProtocols.ts` / `SovereigntyProtocol.ts` exist but weren't fully read — "not found," not "proven absent.")* | …it's **traced to something concrete** — code, a prompt, an invariant, or observed runtime behavior. Until then it's philosophy, not architecture. `[direction: TBD]` |

### Ratified this pass (2026-06-09)
| Component | Tier | Direction |
|---|---|---|
| Graph knowledge layer | **Nothing built** | **Non-goal (current architecture).** May be reconsidered if Postgres becomes a demonstrated bottleneck or graph-native capabilities become necessary. |

> ### On the graph layer — the line holds, now by decision
> **No KuzuDB. No graph driver. No graph-layer claim.** Zero graph-database code, zero graph driver in `package.json`. "Knowledge graph" / "Inner Lands topology" is **design metaphor, not a datastore**; the "AIN" knowledge system is the five *logical* sources in §4, not a graph instance. The receipts point one way — Postgres is the authoritative substrate, with memory atoms, continuity, and relational memory all running on it. The graph idea isn't wrong; it just isn't solving a demonstrated problem today. **Ratified as a non-goal for the current architecture** — reconsidered only on a demonstrated Postgres bottleneck or a genuine graph-native requirement, never because the metaphor makes it sound built.

### The claim discipline you're inheriting
This is not bureaucracy; it's the thing that lets a small team make strong claims safely. Two instruments:

1. **The six-category typology.** Every artifact is one of: *(1) preserved direction, (2) canonical primitive, (3) built substrate with 0 live callers, (4) dormant service, (5) frozen plan, (6) live runtime authority.* The drift to refuse is **collapsing 1–5 into 6** — describing something as live because it exists. There's an equal-and-opposite drift: **failing to notice that something IS live** (Cat 6) because no one measured it. Name mechanisms, not mythology — *"parallel epistemic emission,"* not *"emergent consciousness architecture."* Metaphor comes **after** measurement, never before.
2. **The line:** *"We do not tell tomorrow's story as if it were today's."* Governs every outward claim — web, decks, onboarding, **and internal docs like this one.** See `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`.

---

## §9 — Master status ledger (your anchor)

**Scope:** every component on one screen. **· Self-contained.** Return here whenever you lose the thread.

### Code-audited this pass (2026-06-09)
| Component | Tier | § |
|---|---|---|
| PostgreSQL substrate (sole datastore) | **Verified** | §2 |
| Self-hosted infra (minisforum / Docker / Caddy) | **Verified** | §2 |
| FAST / CORE / DEEP tier selection | **Verified** | §3 |
| One Claude call → `MaiaVoice` authorship | **Verified** | §3 |
| Corpus Callosum trace substrate | **Observed** | §3 |
| Claude primary / Ollama fallback | **Verified** | §5 |
| Knowledge Gate (awareness source-weighting) | **Wired** | §4 |
| Retrieval-precedes-generation | **Wired** | §3 |
| Multi-agent LLM deliberation | **Built** · `[direction: TBD]` | §8 |
| Enforced retrieval-first guard | **Designed** · `[direction: TBD]` | §8 |
| Sacred-refusal vs. failure distinction | **Unverified** · `[direction: TBD]` | §8 |
| Graph knowledge layer | **Nothing built** · **Non-goal (current architecture)** | §8 |

### Team runtime tracking / doctrine (confirm deploy-state-sensitive rows)
| Component | Tier | § |
|---|---|---|
| Sanctuary Mode | **Verified** | §4 |
| Session memory | **Verified** | §4 |
| Semantic atoms | **Verified** | §4 |
| Relational / conversational recall | *Live per placement — **confirm*** | §4 |
| Episodic memory | **Built, Unwired** | §4 |
| Bridge D spiral-state persistence | **Verified** | §4 |
| Members / onboarding / auth | **Verified** | §6 |
| iOS / Capacitor pipeline | **Verified** | §7 |
| Boundary audit | **Wired** (evidence pending) | §5 |
| Two-node cognition topology | **Designed** | §5 |
| Livingness guard | **Designed** | §4 |
| Evaluator layer | **Vision** | §5 |

---

## Appendix — Where to look first (file pointers)

| Concern | Start here |
|---|---|
| Request orchestration | `lib/sovereign/maiaService.ts`, `lib/ai/modelService.ts`, `lib/ai/claudeClient.ts` |
| Conversation surface | `components/OracleConversation.tsx`, `lib/voice/*` |
| Identity & consent | `middleware.ts`, `lib/auth/*`, `lib/http/apiBase.ts` |
| Sovereign API | `app/api/sovereign/*` |
| Memory & knowledge | `lib/ain/knowledge-gate.ts`, `lib/consciousness/spiralStatePersistence.ts` |
| Tiering / traces | `lib/consciousness/SmartTierSelection.ts`, `lib/services/corpusCallosumService.ts` |
| iOS pipeline | `scripts/capacitor-patch-routes.sh`, `scripts/build-ios.sh`, `ios/*` |
| Deploy & ops | `docker-compose.production.yml`, `Caddyfile`, `scripts/deploy-production.sh` |
| Canon (the rules) | `docs/canon/MAIA_CANON_v1.1.md`, `MAIA_OATH.md`, `MARKETING_CLAIM_DISCIPLINE.md` |
| Session anchor (read every session) | `CLAUDE.md` |
